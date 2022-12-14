# Test Observability Action

An action to push JUnit files to Ably's test observability server.

## Inputs

- `server-url`: the server to publish results to - see [action.yml](./action.yml) for the default value
- `server-auth`: authentication key for the server. By default this will use the `TEST_OBSERVABLILITY_SERVER_AUTH_KEY` secret, which exists as a secret in the `ably` GitHub organization and [can be made available to its repositories](https://docs.github.com/en/actions/using-workflows/sharing-workflows-secrets-and-runners-with-your-organization#sharing-secrets-within-an-organization).
- `path`: where to look for `*.junit` files

## Example

Workflow step:

```
- name: Upload test results
  if: always()
  uses: ably/test-observability-action@v1
  with:
    path: '.'
```
