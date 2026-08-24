#!/bin/sh
set -eu

instance="${TOR_INSTANCE_ID:?TOR_INSTANCE_ID is required}"
status_dir="${TOR_STATUS_DIR:-/run/myzubster-tor/status}"
status_file="${status_dir}/${instance}.json"
checked_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
mkdir -p "$status_dir"

if test -s /var/lib/tor/hidden_service/hostname \
  && curl --fail --silent --show-error --max-time 5 http://gateway:10000/health >/dev/null; then
  printf '{"healthy":true,"checkedAt":"%s"}\n' "$checked_at" >"$status_file"
  exit 0
fi

printf '{"healthy":false,"checkedAt":"%s","reason":"tor-or-upstream-unavailable"}\n' "$checked_at" >"$status_file"
exit 1
