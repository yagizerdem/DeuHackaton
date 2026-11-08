import math
import os
import random
import time
from concurrent.futures import ThreadPoolExecutor
from functools import lru_cache
from typing import Callable, TypeVar

import chromadb
from google import genai
from google.genai import errors

CHROMA_DIR = os.environ.get("CHROMA_DIR", "/app/chroma")
EMBEDDING_MODEL = os.environ.get("EMBEDDING_MODEL", "gemini-embedding-2")
EMBEDDING_DIMS = int(os.environ.get("EMBEDDING_DIMS", "768"))
EMBED_WORKERS = int(os.environ.get("EMBED_WORKERS", "8"))

# the name carries model and size, vectors of different models must never share a collection
COLLECTION_NAME = f"pages_{EMBEDDING_MODEL}_{EMBEDDING_DIMS}"
LEGACY_COLLECTION_NAME = "plant_protection_pages"  # indexed with BAAI/bge-m3

T = TypeVar("T")
TRANSIENT = {429, 500, 502, 503, 504}


@lru_cache(maxsize=1)
def gemini_client() -> genai.Client:
    api_key = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GOOGLE_API_KEY is not set")
    return genai.Client(api_key=api_key)


def with_retries(call: Callable[[], T], what: str, attempts: int = 6) -> T:
    """Retries rate limits and 5xx with exponential backoff, anything else fails at once."""
    for attempt in range(attempts):
        try:
            return call()
        except errors.APIError as error:
            if error.code not in TRANSIENT or attempt == attempts - 1:
                raise
            delay = 2**attempt + random.random()
            print(f"  {what}: {error.code}, retry in {delay:.0f}s", flush=True)
            time.sleep(delay)
    raise AssertionError("unreachable")


def _normalize(vector: list[float]) -> list[float]:
    # truncated (768-d) vectors are not unit length
    norm = math.sqrt(sum(x * x for x in vector)) or 1.0
    return [x / norm for x in vector]


def _embed_one(text: str, task: str) -> list[float]:
    # one text per request: gemini-embedding-2 merges a list of inputs into a single vector
    response = with_retries(
        lambda: gemini_client().models.embed_content(
            model=EMBEDDING_MODEL,
            contents=text,
            config={"task_type": task, "output_dimensionality": EMBEDDING_DIMS},
        ),
        "embedding",
    )
    return _normalize(response.embeddings[0].values)


def embed(texts: list[str], task: str) -> list[list[float]]:
    """task is RETRIEVAL_DOCUMENT for pages and RETRIEVAL_QUERY for questions."""
    with ThreadPoolExecutor(EMBED_WORKERS) as pool:
        return list(pool.map(lambda text: _embed_one(text, task), texts))


@lru_cache(maxsize=1)
def chroma_client() -> chromadb.ClientAPI:
    return chromadb.PersistentClient(path=CHROMA_DIR)


@lru_cache(maxsize=1)
def collection() -> chromadb.Collection:
    # vectors are normalized, cosine distance = 1 - similarity
    return chroma_client().get_or_create_collection(
        COLLECTION_NAME, metadata={"hnsw:space": "cosine"}
    )
