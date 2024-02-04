import { IMigrationContext } from '../migration-context';
import forEachRepo from '../util/for-each-repo';
import { IssueTracker } from '../adapters/base';
import { getIssueListsFromTracker, updatePostedIssuesLists } from '../util/persisted-data';

export default async (context: IMigrationContext) => {
  const {
    adapter,
    logger,
    migration: { spec },
  } = context;

  const issuesList: IssueTracker[] = await getIssueListsFromTracker(context);

  await forEachRepo(context, async (repo) => {
    const spinner = logger.spinner('Posting an issue');
    try {
      const issueNumber = issuesList
        .find((issue) => issue.repo === repo.name)
        ?.issueNumber?.toString();

      if (issueNumber) {
        await adapter.updateIssue(repo, issueNumber);
        issuesList
          .filter((issueFromTracker) => issueFromTracker.issueNumber === issueNumber)
          .map((specificIssue) => (specificIssue.title = spec?.issues?.title));
        spinner.succeed(`Issue updated issueNumber# ${issueNumber} for repo ${repo.name}`);
      } else {
        const issueNumber: any = await adapter.createIssue(repo);
        issuesList.push({
          issueNumber,
          title: spec?.issues?.title,
          owner: repo.owner,
          repo: repo.name,
        });
        spinner.succeed('Issue created');
      }
    } catch (e: any) {
      logger.error(e);
      spinner.fail('Failed to create/update issue');
    }
  });

  //Add the opened issues with issue_number and repo in the issue_tracker.json
  if (issuesList.length > 0) {
    await updatePostedIssuesLists(context, issuesList);
  }
};
