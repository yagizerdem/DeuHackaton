from flask import Flask, jsonify, request

from store import collection, embed

MAX_RESULTS = 20
DEFAULT_RESULTS = 5

app = Flask(__name__)


@app.get("/health")
def health():
    return jsonify(status="ok", indexedPages=collection().count())


@app.post("/query")
def query():
    body = request.get_json(silent=True) or {}
    text = body.get("query")
    if not isinstance(text, str) or not text.strip():
        return jsonify(message='"query" must be a non-empty string'), 400

    k = body.get("k", DEFAULT_RESULTS)
    if not isinstance(k, int) or isinstance(k, bool) or not 1 <= k <= MAX_RESULTS:
        return jsonify(message=f'"k" must be an integer from 1 to {MAX_RESULTS}'), 400

    col = collection()
    if col.count() == 0:
        return jsonify(message="The index is empty, add PDFs to rag/data and restart"), 503

    try:
        vector = embed([text], "RETRIEVAL_QUERY")
    except Exception:
        app.logger.exception("query embedding failed")
        return jsonify(message="The embedding service is unavailable"), 503

    found = col.query(query_embeddings=vector, n_results=k)

    results = [
        {
            "source": meta["source"],
            "page": meta["page"],
            "score": round(1 - distance, 4),
            "summary": meta["summary"],
            "text": document,
        }
        for document, meta, distance in zip(
            found["documents"][0], found["metadatas"][0], found["distances"][0]
        )
    ]
    return jsonify(results=results)
