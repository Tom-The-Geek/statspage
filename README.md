# statspage
A utility for generating a contributor statistics page from a GitHub organisation.

## Usage
### Setup
Create a new file called `.env` and fill in the following:
```
GITHUB_TOKEN=
ORGANISATION_NAME=
```
`GITHUB_TOKEN` should be a GitHub Personal Access Token for your account. This is needed to get a higher request allowance on the API.
`ORGANISATION_NAME` is the name of the organisation you want to generate stats for; eg. `JetBrains`, `Mojang`.

You then need to install all the dependencies, this can be done using  `yarn install`

### Fetching the stats
1. To download the commit stats for the organisation, run `yarn run fetch-stats`. This will use the GitHub API to generate `stats.json`, containing the commit stats for all repositories
2. To then download all the remaining data and combine them, run `yarn run start`. This will use `stats.json` and the GitHub API to generate `contributors.json`, containing the file information read to render into page
3. To build the final two pages, run `yarn run generate`
4. This will create the two final HTML files, `stats-sorted.html` and `stats-unsorted.html`

| File | Content |
| --- | --- |
| `stats.html` | Raw data retrieved from the GitHub `/repos/{owner}/{repo}/stats/contributors` endpoint for each repository |
| `contributors.json` | Processed data containing file contribution counts for each user in a variety of categories |
| `stats-unsorted.html` | Contains a rendered HTML page of all contributors, sorted by username |
| `stats-sorted.html` | Contains a rendered HTML page of all contributors, sorted by contribution count |

### Troubleshooting
If the `yarn run start` fails with a typescript relating to the stats file (eg. `Property '"SomeRepoName"' is incompatible with index signature.`), then wait a few minutes and run `yarn run fetch-stats` again. It appears that sometimes GitHub can take a moment to generate stats for the first time, especially if no-one has visited the `/graphs/contributors` page on the repo, and so returns an empty response.

### Licencing
All pages generated using this tool are licensed [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/legalcode)
The code for the generator itself is licensed under [the MIT license](https://github.com/Tom-The-Geek/statspage/blob/main/LICENSE.txt)
