"""Indexes every PDF under DATA_DIR.

Each page is summarized by Gemini (prompts.SUMMARY_PROMPT). The summary is what
gets embedded and searched, the raw page text is what is stored and returned.
Pages that are already indexed are skipped, so the script can be re-run.

    docker compose run --rm rag python ingest.py
"""

import hashlib
import os
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from google import genai
from pypdf import PdfReader

from prompts import SUMMARY_PROMPT
from store import collection, embed

DATA_DIR = Path(os.environ.get("DATA_DIR", "/app/data"))
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.8-flash")
WORKERS = int(os.environ.get("INGEST_WORKERS", "4"))
BATCH = 32


def page_id(source: str, page: int) -> str:
    return hashlib.sha1(f"{source}:{page}".encode()).hexdigest()


def summarize(client: genai.Client, text: str) -> str:
    prompt = SUMMARY_PROMPT.replace("{document_content}", text)
    for attempt in range(4):
        try:
            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
                config={"temperature": 0, "max_output_tokens": 8192},
            )
            if response.text:
                return response.text
        except Exception as error:  # rate limits, transient 5xx
            print(f"  gemini error (attempt {attempt + 1}): {error}", file=sys.stderr)
        time.sleep(2**attempt)
    raise RuntimeError("Gemini could not summarize the page")


def pending_pages(done: set[str]):
    for pdf in sorted(DATA_DIR.rglob("*.pdf")):
        source = pdf.relative_to(DATA_DIR).as_posix()
        for number, page in enumerate(PdfReader(pdf).pages, start=1):
            text = (page.extract_text() or "").strip()
            if text and page_id(source, number) not in done:
                yield source, number, text


def main() -> None:
    api_key = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")
    if not api_key:
        sys.exit("GOOGLE_API_KEY is not set")
    client = genai.Client(api_key=api_key)

    col = collection()
    done = set(col.get(include=[])["ids"])
    pages = list(pending_pages(done))
    print(f"{len(pages)} pages to index ({len(done)} already indexed)")

    for start in range(0, len(pages), BATCH):
        batch = pages[start : start + BATCH]
        with ThreadPoolExecutor(WORKERS) as pool:
            summaries = list(pool.map(lambda p: summarize(client, p[2]), batch))

        col.upsert(
            ids=[page_id(s, n) for s, n, _ in batch],
            embeddings=embed(summaries),
            documents=[text for _, _, text in batch],
            metadatas=[
                {"source": s, "page": n, "summary": summary}
                for (s, n, _), summary in zip(batch, summaries)
            ],
        )
        print(f"indexed {start + len(batch)}/{len(pages)}")


if __name__ == "__main__":
    main()
