"""Container entrypoint: optionally index new PDF pages, then run the server command.

    python start.py gunicorn --bind 0.0.0.0:5001 app:app

Indexing is off by default, it costs Gemini credits. Run it by hand with
`docker compose run --rm rag python ingest.py`, or set AUTO_INGEST=1 to run it
on every start (pages already in the Chroma volume are skipped). A failed
ingest must not take the API down, the server then starts with the existing index.
"""

import os
import sys
import traceback

import ingest


def main() -> None:
    if os.environ.get("AUTO_INGEST", "").lower() in ("1", "true", "yes"):
        try:
            ingest.main()
        except SystemExit as exit_:
            print(f"ingest skipped: {exit_.code}", file=sys.stderr)
        except Exception:
            print("ingest failed, starting with the existing index", file=sys.stderr)
            traceback.print_exc()

    command = sys.argv[1:]
    os.execvp(command[0], command)


if __name__ == "__main__":
    main()
