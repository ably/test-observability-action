# Test Observability Action

An action to push junit files to Ably's test observability server.

# Contributing

This repo is readonly. Contributions are done via https://github.com/ably/test-observability-action-src.

# Inputs

- server-url - url to publish results to
- server-auth - auth key for server
- path - path to look for *.junit files

# Example

```
      - name: Upload test results
        if: always()
        uses: ably/test-observability-action@main
        with:
          server-auth: ${{ secrets.TEST_OBSERVABLILITY_SERVER_AUTH }}
          path: '.'
```
