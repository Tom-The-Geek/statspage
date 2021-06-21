import { readFileSync, writeFileSync } from 'fs';
import c from '../contributors.json';

interface ContributorInfoFile {
    fetched: string
    repo_contributors: ContributorInfo
    commit_contributors: ContributorInfo
    issue_contributors: ContributorInfo
    pr_contributors: ContributorInfo
}

interface ContributorInfo {
    [k: string]: Contributor
}

interface Contributor {
    url: string
    avatar_url: string
    contributions: number
}

const contributors = c as ContributorInfoFile;

const contributor_template = readFileSync('contributor-template.html').toString();

function create_contributor_element(contributor: Contributor, contribution_type: string): string {
    return contributor_template
        .replace('${username}', contributor.url.replace('https://github.com/', ''))
        .replace('${url}', contributor.url)
        .replace('${avatar_url}', contributor.avatar_url)
        .replace('${contributions}', contributor.contributions.toString())
        .replace('${type}', contribution_type + (contributor.contributions == 1 ? '' : 's'));
}

function format_contributors(contributors: Contributor[], contribution_type: string): string {
    return contributors.map(c => create_contributor_element(c, contribution_type)).join('\n');
}

function sort_contributors(contributors: ContributorInfo, sort_by_stats: boolean = false): Contributor[] {
    const c = Object.values(contributors);
    if (sort_by_stats) {
        c.sort((a, b) => b.contributions - a.contributions || a.url.localeCompare(b.url));
    } else {
        c.sort((a, b) => a.url.localeCompare(b.url));
    }
    return c;
}

const repos_unsorted = format_contributors(sort_contributors(contributors.repo_contributors, false), 'repo');
const commits_unsorted = format_contributors(sort_contributors(contributors.commit_contributors, false), 'commit');
const issues_unsorted = format_contributors(sort_contributors(contributors.issue_contributors, false), 'issue');
const prs_unsorted = format_contributors(sort_contributors(contributors.pr_contributors, false), 'pull request');

const repos_sorted = format_contributors(sort_contributors(contributors.repo_contributors, true), 'repo');
const commits_sorted = format_contributors(sort_contributors(contributors.commit_contributors, true), 'commit');
const issues_sorted = format_contributors(sort_contributors(contributors.issue_contributors, true), 'issue');
const prs_sorted = format_contributors(sort_contributors(contributors.pr_contributors, true), 'pull request');

const template = readFileSync('page-template.html').toString();

const unsorted_page = template
    .replace('${fetched}', contributors.fetched)
    .replace('${repos}', repos_unsorted)
    .replace('${commits}', commits_unsorted)
    .replace('${issues}', issues_unsorted)
    .replace('${prs}', prs_unsorted);
writeFileSync('stats-unsorted.html', unsorted_page);

const sorted_page = template
    .replace('${fetched}', contributors.fetched)
    .replace('${repos}', repos_sorted)
    .replace('${commits}', commits_sorted)
    .replace('${issues}', issues_sorted)
    .replace('${prs}', prs_sorted);
writeFileSync('stats-sorted.html', sorted_page);
