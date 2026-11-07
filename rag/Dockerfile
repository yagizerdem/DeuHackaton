FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    CHROMA_DIR=/app/chroma \
    DATA_DIR=/app/data

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN useradd --create-home --shell /usr/sbin/nologin app \
    && mkdir -p /app/chroma /app/data \
    && chown -R app:app /app
USER app

EXPOSE 5001

# start.py indexes new PDF pages first, then execs the server
CMD ["python", "start.py", "gunicorn", "--bind", "0.0.0.0:5001", "--workers", "1", "--timeout", "300", "app:app"]
