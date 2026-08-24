#!/usr/bin/env python3
"""Local-first MyZubster canonical assistant runtime (stdlib only)."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sqlite3
import sys
import urllib.error
import urllib.request
from pathlib import Path

ENTITY_NAME = "Gateway Custodian"
ENTITY_SLUG = "gateway-custodian"
ROLE = "application, provider, and settlement-boundary guardian"
BOUNDARIES = "Fail closed on provider or verifier uncertainty; never expose credentials or declare PAID without independently matching recipient, asset, network, amount, transaction identifier, and confirmation policy."
DEFAULT_MODEL = os.environ.get("MYZUBSTER_MODEL", "qwen2.5:3b")
OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://127.0.0.1:11434").rstrip("/")
ROOT = Path(__file__).resolve().parents[1]
DB_PATH = Path(os.environ.get("MYZUBSTER_AGENT_DB", ROOT / ".local" / f"{ENTITY_SLUG}.db"))

SECRET_PATTERNS = (
    re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
    re.compile(r"\b(?:seed phrase|wallet seed|private key)\b", re.I),
    re.compile(r"\bgh[opurs]_[A-Za-z0-9_]{20,}\b"),
)


def system_prompt() -> str:
    return (
        f"You are {ENTITY_NAME}, the {ROLE} in the MyZubster ecosystem. "
        "Work local-first and evidence-first. Separate verified facts, inferences, and unknowns. "
        "Cite repository-relative sources supplied in context. Never invent service state, funding, "
        "payments, partners, deployments, environmental results, or security authorization. "
        "MYZ is currently an internal reward/accounting record; external settlement requires independent verification. "
        f"Role boundaries: {BOUNDARIES}"
    )


def iter_markdown(root: Path):
    ignored = {".git", "node_modules", "build", "dist", ".local", ".venv"}
    for path in root.rglob("*.md"):
        if any(part in ignored for part in path.parts):
            continue
        yield path


def has_secret(text: str) -> bool:
    return any(pattern.search(text) for pattern in SECRET_PATTERNS)


def chunks(text: str, limit: int = 1400):
    paragraphs = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
    current = []
    size = 0
    for paragraph in paragraphs:
        if current and size + len(paragraph) > limit:
            yield "\n\n".join(current)
            current, size = [], 0
        current.append(paragraph)
        size += len(paragraph)
    if current:
        yield "\n\n".join(current)


def connect_db() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(DB_PATH)
    db.execute("CREATE TABLE IF NOT EXISTS documents(id TEXT PRIMARY KEY, source TEXT, body TEXT)")
    db.execute("CREATE VIRTUAL TABLE IF NOT EXISTS search USING fts5(id UNINDEXED, source, body)")
    return db


def index_repository(root: Path = ROOT) -> dict:
    db = connect_db()
    db.execute("DELETE FROM documents")
    db.execute("DELETE FROM search")
    indexed = skipped = 0
    for path in iter_markdown(root):
        text = path.read_text(encoding="utf-8", errors="replace")
        if has_secret(text):
            skipped += 1
            continue
        source = path.relative_to(root).as_posix()
        for ordinal, body in enumerate(chunks(text)):
            doc_id = hashlib.sha256(f"{source}:{ordinal}:{body}".encode()).hexdigest()
            db.execute("INSERT INTO documents VALUES(?,?,?)", (doc_id, source, body))
            db.execute("INSERT INTO search VALUES(?,?,?)", (doc_id, source, body))
            indexed += 1
    db.commit()
    db.close()
    return {"indexed_chunks": indexed, "skipped_secret_files": skipped, "database": str(DB_PATH)}


def search_context(query: str, limit: int = 6) -> list[dict]:
    terms = re.findall(r"[A-Za-zÀ-ÿ0-9_]{3,}", query)
    if not terms or not DB_PATH.exists():
        return []
    expression = " OR ".join(f'"{term}"' for term in terms[:12])
    db = connect_db()
    rows = db.execute(
        "SELECT source, body, bm25(search) score FROM search WHERE search MATCH ? ORDER BY score LIMIT ?",
        (expression, limit),
    ).fetchall()
    db.close()
    return [{"source": source, "body": body, "score": score} for source, body, score in rows]


def ask_ollama(question: str, context: list[dict]) -> str:
    evidence = "\n\n".join(f"SOURCE: {item['source']}\n{item['body']}" for item in context)
    payload = json.dumps({
        "model": DEFAULT_MODEL,
        "stream": False,
        "messages": [
            {"role": "system", "content": system_prompt()},
            {"role": "user", "content": f"Evidence:\n{evidence or '[no local evidence found]'}\n\nQuestion: {question}"},
        ],
        "options": {"temperature": 0.2},
    }).encode()
    request = urllib.request.Request(
        f"{OLLAMA_URL}/api/chat", data=payload, headers={"Content-Type": "application/json"}, method="POST"
    )
    try:
        with urllib.request.urlopen(request, timeout=120) as response:
            result = json.load(response)
    except (urllib.error.URLError, TimeoutError) as exc:
        raise RuntimeError(f"Ollama unavailable at {OLLAMA_URL}: {exc}") from exc
    return result.get("message", {}).get("content", "").strip()


def health() -> dict:
    request = urllib.request.Request(f"{OLLAMA_URL}/api/tags")
    try:
        with urllib.request.urlopen(request, timeout=5) as response:
            ok = response.status == 200
    except (urllib.error.URLError, TimeoutError):
        ok = False
    return {"entity": ENTITY_NAME, "model": DEFAULT_MODEL, "ollama": ok, "database": DB_PATH.exists()}


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(prog=ENTITY_SLUG)
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("index")
    ask = sub.add_parser("ask")
    ask.add_argument("question")
    ask.add_argument("--limit", type=int, default=6)
    sub.add_parser("health")
    args = parser.parse_args(argv)
    if args.command == "index":
        print(json.dumps(index_repository(), indent=2))
    elif args.command == "health":
        print(json.dumps(health(), indent=2))
    else:
        evidence = search_context(args.question, max(1, min(args.limit, 12)))
        print(ask_ollama(args.question, evidence))
        if evidence:
            print("\nSources:")
            for source in dict.fromkeys(item["source"] for item in evidence):
                print(f"- {source}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
