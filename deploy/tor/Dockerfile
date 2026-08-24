FROM debian:bookworm-slim

RUN apt-get update \
    && apt-get install --no-install-recommends -y ca-certificates curl gosu tor \
    && rm -rf /var/lib/apt/lists/*

COPY torrc /etc/tor/torrc
COPY healthcheck.sh /usr/local/bin/tor-healthcheck
COPY entrypoint.sh /usr/local/bin/tor-entrypoint
RUN chmod 0755 /usr/local/bin/tor-healthcheck /usr/local/bin/tor-entrypoint \
    && chown -R debian-tor:debian-tor /var/lib/tor

ENTRYPOINT ["/usr/local/bin/tor-entrypoint"]
