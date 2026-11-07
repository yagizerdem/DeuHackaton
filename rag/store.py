import os
from functools import lru_cache

import chromadb
from sentence_transformers import SentenceTransformer

CHROMA_DIR = os.environ.get("CHROMA_DIR", "/app/chroma")
EMBEDDING_MODEL = os.environ.get("EMBEDDING_MODEL", "BAAI/bge-m3")
COLLECTION_NAME = "plant_protection_pages"


@lru_cache(maxsize=1)
def embedder() -> SentenceTransformer:
    return SentenceTransformer(EMBEDDING_MODEL)


def embed(texts: list[str]) -> list[list[float]]:
    vectors = embedder().encode(texts, normalize_embeddings=True)
    return vectors.tolist()


@lru_cache(maxsize=1)
def collection() -> chromadb.Collection:
    client = chromadb.PersistentClient(path=CHROMA_DIR)
    # vectors are normalized, cosine distance = 1 - similarity
    return client.get_or_create_collection(
        COLLECTION_NAME, metadata={"hnsw:space": "cosine"}
    )
