import { getInput, setOutput } from '@actions/core';
import { context } from '@actions/github';
import { getOctokit } from '@actions/github';
import { PullsListResponseData, PullsListReviewsResponseData } from '@octokit/types';
import { orderBy } from 'lodash';

async function run() {
  try {
    UPDATE_LABEL: string = process.env.UPDATE_LABEL;
    IGNORED_LABELS: string = process.env.IGNORED_LABELS;
    MIN_APPROVAL_COUNT: number = parseInt(process.env.MIN_APPROVAL_COUNT);


    const octokit = getOctokit(process.env.GITHUB_TOKEN);
    const { owner, repo } = context.repo;

    // Fetch all open pull requests
    const prs: PullsListResponseData = await octokit.pulls.list({
      owner,
      repo,
      state: 'open',
    });

    // Filter out pull requests based on labels
    const filteredPRs = prs.data.filter((pr) => {
      if (!pr.labels || pr.labels.length === 0) return false;
      return pr.labels.some((label) => label.name === UPDATE_LABEL);
    });

    // Filter out ignored labeled pull requests
    const ignoredLabelsArray = IGNORED_LABELS.split(',').map((label) => label.trim());
    const filteredAndIgnoredPRs = filteredPRs.filter((pr) => {
      if (!pr.labels || pr.labels.length === 0) return true;
      return !pr.labels.some((label) => ignoredLabelsArray.includes(label.name));
    });

    // Fetch approval counts for each pull request
    const prsWithApprovalCount = await Promise.all(
      filteredAndIgnoredPRs.map(async (pr) => {
        const reviews: PullsListReviewsResponseData = await octokit.pulls.listReviews({
          owner,
          repo,
          pull_number: pr.number,
        });
        const approvals = reviews.data.filter((review) => review.state === 'APPROVED').length;
        return { ...pr, approvals };
      })
    );

    // Filter out pull requests with insufficient approvals
    const finalPRs = prsWithApprovalCount.filter((pr) => pr.approvals >= MIN_APPROVAL_COUNT);

    // Sort the pull requests by creation date (oldest to newest)
    const sortedPRs = orderBy(finalPRs, ['created_at'], ['asc']);

    // Print the sorted pull requests to the console
    console.log('Sorted Pull Requests:');
    sortedPRs.forEach((pr) => {
      console.log(`#${pr.number} - ${pr.title} (${pr.approvals} approvals)`);
    });
  } catch (error) {
    console.error('Error occurred:', error);
    process.exit(1);
  }
}

run();
