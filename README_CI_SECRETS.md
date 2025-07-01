# CI/CD Secrets for the Pipeline

Some pipeline jobs (security analysis and code quality) require specific secrets to work:

## Required secrets

- `SONAR_TOKEN`: SonarCloud token (https://sonarcloud.io/account/security/)
- `SNYK_TOKEN`: Snyk API token (https://app.snyk.io/account)

## How to add them

1. Go to **GitHub** → your project repository → **Settings** → **Secrets and variables** → **Actions**.
2. Click on **New repository secret**.
3. Enter the name (`SONAR_TOKEN` or `SNYK_TOKEN`) and paste the token value.
4. Save.

## Pipeline behavior

If the secrets are not present, the related jobs will be automatically skipped and the pipeline will continue without errors.

To enable the analysis:
- Create the tokens on the respective platforms.
- Add them as secrets as described above. 