"""Container entrypoint: index new PDF pages, then run the server command.

    python start.py gunicorn --bind 0.0.0.0:5001 app:app

ingest.py skips pages that are already in the Chroma volume, so this only pays
for pages that are new. A failed ingest must not take the API down, the server
then starts with whatever is already indexed.
"""

import os
import sys
import traceback

import ingest


def main() -> None:
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
