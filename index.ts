import * as core from '@actions/core';
import * as github from '@actions/github';
import * as glob from '@actions/glob';
import fs from 'fs';
import path from 'path';
import {got} from 'got';

/**
 * Fetches the currently-running job from the GitHub API,
 * so that we can add a link to it in the upload.
 *
 * It’s a bit surprising that there’s no built-in functionality
 * for this (see https://github.com/orgs/community/discussions/8945).
 */
async function fetchJob() {
  const githubToken = core.getInput('github-token');
  if (!githubToken.length) {
    return null;
  }

  const octokit = github.getOctokit(githubToken);
  const response = await octokit.rest.actions.listJobsForWorkflowRunAttempt(
      {
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        run_id: github.context.runId,
        attempt_number: parseInt(process.env.GITHUB_RUN_ATTEMPT!),
      },
  );

  const jobs = response.data.jobs;

  const jobIndexInput = core.getInput('job-index');

  if (jobs.length > 1 && !jobIndexInput.length) {
    throw new Error(
        `Got ${jobs.length} jobs from GitHub API \
         but don’t know which one to pick. You need to \
         provide a \`job-index\` input.`,
    );
  }

  const jobIndex = parseInt(jobIndexInput);

  if (jobIndex >= jobs.length) {
    throw new Error(
        `The \`job-index\` input has value ${jobIndex}, \
        but there are only ${jobs.length} jobs. This \
        action does not currently handle pagination.`);
  }

  const job = jobs[jobIndex];

  return job;
}

// eslint-disable-next-line require-jsdoc
async function main() {
  const auth = core.getInput('server-auth', {required: true});
  const serverUrl = new URL(core.getInput('server-url', {required: true}));
  const reportPath = core.getInput('path', {required: true});

  const globber = await glob.create(path.join(reportPath, '*.junit'));
  const results = await globber.glob();

  const endpointUrl = new URL('uploads', serverUrl);

  if (results.length === 0) {
    throw new Error(
        `Could not find any files matching '*.junit' in ${reportPath}`,
    );
  }

  const job = await fetchJob();

  for (const [i, file] of results.entries()) {
    const data = fs.readFileSync(file);
    const b64 = Buffer.from(data).toString('base64');
    const owner = github.context.repo.owner;

    const githubRepository = owner + '/' + github.context.repo.repo;

    const body = {
      junit_report_xml: b64,
      github_repository: githubRepository,
      github_sha: github.context.sha,
      github_ref_name: process.env.GITHUB_REF_NAME,
      github_action: github.context.action,
      github_run_number: github.context.runNumber,
      github_run_attempt: process.env.GITHUB_RUN_ATTEMPT,
      github_run_id: github.context.runId.toString(),
      github_job: github.context.job,
      github_retention_days: process.env.GITHUB_RETENTION_DAYS,
      iteration: i + 1,
      github_base_ref: process.env.GITHUB_BASE_REF || null,
      github_head_ref: process.env.GITHUB_HEAD_REF || null,
      github_job_api_url: job?.url ?? null,
      github_job_html_url: job?.html_url ?? null,
    };


    const headers = {
      'Test-Observability-Auth-Key': auth,
    };

    const response = await got.post(endpointUrl.toString(), {
      headers,
      json: body,
    });

    if (response.statusCode < 200 || response.statusCode > 299) {
      console.log('Uploading test results failed:');
      const msg = 'Server returned code ' + response.statusCode;
      console.log(msg);
      console.log(response.body);
      core.setFailed(msg);
      return;
    }

    const upload = JSON.parse(response.body);

    const uploadUrlPath = path.join(
        'repos',
        githubRepository,
        'uploads',
        upload.id,
    );
    const uploadUrl = new URL(uploadUrlPath, serverUrl);

    console.log(`Test results uploaded successfully: ${uploadUrl}`);
  };
}

main().catch((err) => {
  core.setFailed(err.message);
});
