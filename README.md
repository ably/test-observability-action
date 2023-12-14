# Test Observability Action

An action to push JUnit files to Ably's test observability server.

## Inputs

- `server-url`: the server to publish results to - see [action.yml](./action.yml) for the default value
- `server-auth`: authentication key for the server. The `ably` GitHub organization has an org-wide `TEST_OBSERVABLILITY_SERVER_AUTH_KEY` secret. It is recommended that you [make this secret available to your repository](https://docs.github.com/en/actions/using-workflows/sharing-workflows-secrets-and-runners-with-your-organization#sharing-secrets-within-an-organization) and then use this secret as the `server-auth` input.
- `path`: where to look for `*.junit` files
- `github-token` (optional): A GitHub access token. If provided, the action will perform a GitHub API call in order to discover the web URL for the current job, and will include this URL in the observability server upload. If the repository is private you must use an access token with the `repo` scope.
- `job-index` (optional): The index to which the current job corresponds in the response from the ["list jobs for a workflow run attempt" GitHub API](https://docs.github.com/en/rest/actions/workflow-jobs?apiVersion=2022-11-28#list-jobs-for-a-workflow-run-attempt). See the [sample workflow](./.github/workflows/check.yml) for an example of how to calculate this index. If you specify `github-token` but not `job-index`, and the response from this API contains more than one job, the action will fail.

## Example

Workflow step:

```
- name: Upload test results
  if: always()
  uses: ably/test-observability-action@v1
  with:
    server-auth: ${{ secrets.TEST_OBSERVABLILITY_SERVER_AUTH_KEY }}
    path: '.'
    github-token: ${{ secrets.GITHUB_TOKEN }}
```
