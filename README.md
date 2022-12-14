# Test Observability Action

An action to push JUnit files to Ably's test observability server.

## Inputs

- `server-url`: the server to publish results to - see [action.yml](./action.yml) for the default value
- `server-auth`: authentication key for the server. The `ably` GitHub organization has an org-wide `TEST_OBSERVABLILITY_SERVER_AUTH_KEY` secret. It is recommended that you [make this secret available to your repository](https://docs.github.com/en/actions/using-workflows/sharing-workflows-secrets-and-runners-with-your-organization#sharing-secrets-within-an-organization) and then use this secret as the `server-auth` input.
- `path`: where to look for `*.junit` files

## Example

Workflow step:

```
- name: Upload test results
  if: always()
  uses: ably/test-observability-action@v1
  with:
    server-auth: ${{ secrets.TEST_OBSERVABLILITY_SERVER_AUTH_KEY }}
    path: '.'
```
