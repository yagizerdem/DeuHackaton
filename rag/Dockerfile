FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    HF_HOME=/app/.cache/huggingface \
    CHROMA_DIR=/app/chroma \
    DATA_DIR=/app/data

WORKDIR /app

# CPU-only torch keeps the image far smaller than the default CUDA build
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN useradd --create-home --shell /usr/sbin/nologin app \
    && mkdir -p /app/chroma /app/data /app/.cache/huggingface \
    && chown -R app:app /app
USER app

EXPOSE 5001

# one worker: the embedding model is loaded per process; the first request loads it
CMD ["gunicorn", "--bind", "0.0.0.0:5001", "--workers", "1", "--timeout", "300", "app:app"]
