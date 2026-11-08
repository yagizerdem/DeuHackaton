"""Indexes every PDF under DATA_DIR.

Each page is summarized by Gemini (prompts.SUMMARY_PROMPT). The summary is what
gets embedded and searched, the raw page text is what is stored and returned.
Pages that are already indexed are skipped, so the script can be re-run.

Summaries run on a thread pool (the work is network bound). Each finished
summary is collected into a batch, embedded through the Gemini embedding API
and written to Chroma while the remaining summaries keep generating.

    docker compose run --rm rag python ingest.py
"""

import hashlib
import os
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from pypdf import PdfReader

from prompts import SUMMARY_PROMPT
from store import (
    LEGACY_COLLECTION_NAME,
    chroma_client,
    collection,
    embed,
    gemini_client,
    with_retries,
)

DATA_DIR = Path(os.environ.get("DATA_DIR", "/app/data"))
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.8-flash")
WORKERS = int(os.environ.get("INGEST_WORKERS", "16"))
BATCH = 32


def page_id(source: str, page: int) -> str:
    return hashlib.sha1(f"{source}:{page}".encode()).hexdigest()


def summarize(text: str) -> str:
    def call() -> str:
        response = gemini_client().models.generate_content(
            model=GEMINI_MODEL,
            contents=SUMMARY_PROMPT.replace("{document_content}", text),
            config={"temperature": 0, "max_output_tokens": 8192},
        )
        if not response.text:
            raise RuntimeError("Gemini returned an empty summary")
        return response.text

    return with_retries(call, "summary")


def pending_pages(done: set[str]):
    for pdf in sorted(DATA_DIR.rglob("*.pdf")):
        source = pdf.relative_to(DATA_DIR).as_posix()
        for number, page in enumerate(PdfReader(pdf).pages, start=1):
            text = (page.extract_text() or "").strip()
            if text and page_id(source, number) not in done:
                yield source, number, text


def migrate_legacy(col) -> None:
    """Re-embeds the pages indexed with the old local model, without summarizing again."""
    client = chroma_client()
    try:
        legacy = client.get_collection(LEGACY_COLLECTION_NAME)
    except Exception:
        return

    rows = legacy.get(include=["documents", "metadatas"])
    done = set(col.get(include=[])["ids"])
    todo = [r for r in zip(rows["ids"], rows["documents"], rows["metadatas"]) if r[0] not in done]
    print(f"migrating {len(todo)} pages from the {LEGACY_COLLECTION_NAME} collection")

    for start in range(0, len(todo), 200):
        chunk = todo[start : start + 200]
        col.upsert(
            ids=[i for i, _, _ in chunk],
            embeddings=embed([m["summary"] for _, _, m in chunk], "RETRIEVAL_DOCUMENT"),
            documents=[d for _, d, _ in chunk],
            metadatas=[m for _, _, m in chunk],
        )

    # only drop the old copy once every one of its pages is in the new collection
    if set(rows["ids"]) <= set(col.get(include=[])["ids"]):
        client.delete_collection(LEGACY_COLLECTION_NAME)
        print("legacy collection removed")


def flush(col, batch: list[tuple[tuple[str, int, str], str]]) -> None:
    col.upsert(
        ids=[page_id(s, n) for (s, n, _), _ in batch],
        embeddings=embed([summary for _, summary in batch], "RETRIEVAL_DOCUMENT"),
        documents=[text for (_, _, text), _ in batch],
        metadatas=[
            {"source": s, "page": n, "summary": summary}
            for (s, n, _), summary in batch
        ],
    )


def main() -> None:
    try:
        gemini_client()
    except RuntimeError as error:
        sys.exit(str(error))

    col = collection()
    migrate_legacy(col)

    done = set(col.get(include=[])["ids"])
    pages = list(pending_pages(done))
    print(f"{len(pages)} pages to index ({len(done)} already indexed)", flush=True)
    if not pages:
        return

    indexed = failed = 0
    batch: list[tuple[tuple[str, int, str], str]] = []
    with ThreadPoolExecutor(WORKERS) as pool:
        futures = {pool.submit(summarize, page[2]): page for page in pages}
        for future in as_completed(futures):
            try:
                batch.append((futures[future], future.result()))
            except Exception as error:
                # skipped pages are picked up on the next run
                failed += 1
                source, number, _ = futures[future]
                print(f"  {source} p.{number} skipped: {error}", file=sys.stderr, flush=True)
                continue

            if len(batch) >= BATCH:
                flush(col, batch)
                indexed += len(batch)
                batch = []
                print(f"indexed {indexed}/{len(pages)}", flush=True)

    if batch:
        flush(col, batch)
        indexed += len(batch)
    print(f"done: {indexed} indexed, {failed} failed", flush=True)


if __name__ == "__main__":
    main()
