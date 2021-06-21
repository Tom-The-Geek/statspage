import { Octokit } from '@octokit/rest';
import { writeFileSync } from 'fs';
import { config as loadDotenv } from 'dotenv';
loadDotenv();

const org = process.env.ORGANISATION_NAME as string;

async function main() {
    const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN,
    });

    const repos = await octokit.paginate(octokit.repos.listForOrg, {
        org: org,
    });

    const all_stats: { [key: string]: any } = { };
    let i = 0;
    for (const repo of repos) {
        i++;
        console.log(`[${i}/${repos.length}] ${repo.name}`);
        const stats = await octokit.repos.getContributorsStats({
            owner: org,
            repo: repo.name,
        });

        all_stats[repo.name] = stats.data;
    }

    writeFileSync('stats.json', JSON.stringify(all_stats));
}

main();
