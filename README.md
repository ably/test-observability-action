# Test Observability Action

An action to push JUnit files to Ably's test observability server.

## Inputs

- `server-url`: the server to publish results to - see [action.yml](./action.yml) for the default value
- `server-auth`: authentication key for the server
- `path`: where to look for `*.junit` files

## Example

Workflow step:

```
- name: Upload test results
  if: always()
  uses: ably/test-observability-action@v1
  with:
    server-auth: ${{ secrets.TEST_OBSERVABLILITY_SERVER_AUTH }}
    path: '.'
```
