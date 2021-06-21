import { Octokit } from '@octokit/rest';
import { writeFile } from 'fs';
import _commit_stats from '../stats.json';
import { config as loadDotenv } from 'dotenv';
loadDotenv();

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

const org = process.env.ORGANISATION_NAME as string;

interface CommitStats {
    [key: string]: CommitStat[]
}

interface CommitStat {
    total: number
    author: CommitStatAuthor
}

interface CommitStatAuthor {
    html_url: string
    avatar_url: string
}

interface Contributor {
    url: string
    avatar_url: string
    contributions: number
}

interface Contributors {
    [k: string]: Contributor
}

function get_contributor(contributors: Contributors, url: string, avatar_url: string): Contributor {
    const c = contributors[url];
    if (c) return c;
    const contributor: Contributor = {
        url,
        avatar_url,
        contributions: 0,
    };
    contributors[url] = contributor;
    return contributor;
}

async function main() {
    const repos = await octokit.paginate(octokit.repos.listForOrg, {
        org: org,
    });

    const repo_contributors: Contributors = { };
    const issue_contributors: Contributors = { };
    const pr_contributors: Contributors = { };

    console.log('Getting contributors from repos...');
    let total_count = 0;
    for (const repo of repos) {
        total_count++;
        console.log(`[${total_count}/${repos.length}] ${repo.name}`);
        const repo_code_contributors = await octokit.paginate(octokit.repos.listContributors, {
            owner: org,
            repo: repo.name,
        });

        const repo_issue_contributors = (await octokit.paginate(octokit.issues.listForRepo, {
            owner: org,
            repo: repo.name,
            state: 'all',
        })).map(issue => issue.user!!);

        const repo_pr_contributors = (await octokit.paginate(octokit.pulls.list, {
            owner: org,
            repo: repo.name,
            state: 'all',
        })).map(pull => pull.user!!);

        for (const contributor of repo_code_contributors) {
            get_contributor(repo_contributors, contributor.html_url!!, contributor.avatar_url!!).contributions++;
        }

        for (const contributor of repo_issue_contributors) {
            get_contributor(issue_contributors, contributor.html_url!!, contributor.avatar_url!!).contributions++;
        }

        for (const contributor of repo_pr_contributors) {
            get_contributor(pr_contributors, contributor.html_url!!, contributor.avatar_url!!).contributions++;
        }
    }

    console.log('Processed', total_count, 'repos!');

    console.log('Processing commit stats...');
    const commit_stats = _commit_stats as CommitStats;
    const commit_contributors: Contributors = { };

    let i = 0;
    const total = Object.keys(commit_stats).length;
    for (const repo of Object.keys(commit_stats)) {
        i++;
        console.log(`[${i}/${total}] ${repo}`);
        for (const stat of commit_stats[repo]) {
            get_contributor(commit_contributors, stat.author.html_url, stat.author.avatar_url).contributions += stat.total;
        }
    }

    console.log('Processed commit stats for', i, 'repos!');

    console.log('Saving results...');
    writeFile('contributors.json', JSON.stringify({
        fetched: new Date().toString(),
        repo_contributors,
        commit_contributors,
        issue_contributors,
        pr_contributors,
    }), () => console.log('Saved!'));
}

main();
