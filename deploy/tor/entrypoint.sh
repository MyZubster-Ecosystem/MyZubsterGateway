#!/bin/sh
set -eu

install -d -o debian-tor -g debian-tor -m 0700 /var/lib/tor
install -d -o debian-tor -g debian-tor -m 0750 "${TOR_STATUS_DIR:-/run/myzubster-tor/status}"
exec gosu debian-tor tor -f /etc/tor/torrc
