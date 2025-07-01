# CI/CD Pipeline Guide for MicroShell

This document explains the structure, configuration, and best practices for the CI/CD pipelines in this repository. It also provides guidance for contributors and maintainers on how to re-enable advanced features if needed.

---

## Pipeline Overview

The project uses **GitHub Actions** for CI/CD, with the following main jobs:

- **Detect Changes**: Determines which parts of the monorepo have changed (frontend, backend, infrastructure, etc.).
- **Frontend CI**: Lint, test, and build for each Angular microfrontend (Node.js 20.19.0).
- **Backend CI**: Lint, test (with PostgreSQL), and Docker build for the FastAPI backend.
- **Security Scan**: Runs Trivy to check for vulnerabilities in the codebase.
- **Docker Build**: Builds and pushes Docker images for all components.
- **E2E Tests**: Runs end-to-end tests using Nx and Cypress.
- **Deploy Staging/Production**: Deploys to staging/production (deployment logic to be customized).
- **Cleanup**: Cleans up old artifacts and images.

All logs are uploaded as artifacts for easy debugging.

---

## Key Configuration Choices

### 1. **Node.js Version**
- The pipeline uses **Node.js 20.19.0** to ensure compatibility with Angular 20 and all dependencies.
- This avoids engine mismatch errors (e.g., `npm warn EBADENGINE`).

### 2. **SonarCloud and Snyk (Code Quality & Deep Security Scan)**
- These jobs are **temporarily disabled** because they require repository secrets (`SONAR_TOKEN`, `SNYK_TOKEN`).
- To re-enable:
  1. Add the required tokens in GitHub → Settings → Secrets and variables → Actions.
  2. Uncomment the relevant jobs in `.github/workflows/ci-cd.yml`.

### 3. **GitHub Environments**
- The `environment:` section was **removed** from deploy jobs to avoid linter errors if environments are not pre-configured in the repository.
- To use advanced deployment features (approvals, secrets, URLs):
  1. Create environments (e.g., `staging`, `production`) in GitHub → Settings → Environments.
  2. Add the `environment:` section back to the deploy jobs in the workflow file.

---

## Node.js Version Requirement
All frontend-related jobs (lint, test, build, audit, accessibility, bundle, etc.) require **Node.js >= 20.19.0**. The workflow is configured to always use this version. If you see errors about unsupported Node.js versions, check that all jobs use the correct node-version.

## SonarCloud and Snyk
The jobs for code quality (SonarCloud) and deep security scan (Snyk) are disabled by default. To enable them, add the required tokens (`SONAR_TOKEN`, `SNYK_TOKEN`) as GitHub secrets and remove the `if: false` condition in the workflow file. See comments in `.github/workflows/ci-cd.yml` for details.

## Vulnerability Fixes
The workflow now runs `npm audit fix` after installing dependencies to automatically fix moderate vulnerabilities. If this causes build issues, you can comment out or remove this step.

## Quality & Security Jobs: Skipping When Tokens Are Missing

Some jobs in the pipeline (SonarCloud for code quality, Snyk for security) require secrets (`SONAR_TOKEN`, `SNYK_TOKEN`).

- If these tokens are **not set**, the related jobs are **automatically skipped**.
- The pipeline will **not fail** and will show these jobs as "skipped" in the summary.
- This is achieved by a skip step at the start of each job and conditional execution of all subsequent steps.
- This approach is the most robust and compatible with GitHub Actions, avoiding linter errors and false negatives.

**To enable these jobs:**
- Add the required tokens as repository secrets (see `README_CI_SECRETS.md`).
- On the next pipeline run, the jobs will be executed and included in the quality summary.

---

## How to Re-enable Advanced Features

### **A. SonarCloud (Code Quality Analysis)**
1. Create a SonarCloud account and project for this repository.
2. Generate a `SONAR_TOKEN` in SonarCloud.
3. Add the token to GitHub repository secrets as `SONAR_TOKEN`.
4. Uncomment the `code-quality-analysis` job in `.github/workflows/ci-cd.yml`.

### **B. Snyk (Deep Security Scan)**
1. Create a Snyk account and get your API token.
2. Add the token to GitHub repository secrets as `SNYK_TOKEN`.
3. Uncomment the `deep-security-scan` job in `.github/workflows/ci-cd.yml`.

### **C. GitHub Environments for Deploy**
1. Go to GitHub → Settings → Environments.
2. Create environments named `staging` and `production` (or your preferred names).
3. Add the `environment:` section to the deploy jobs in the workflow, e.g.:
   ```yaml
   environment:
     name: staging
     url: https://staging.microshell.com
   ```

---

## Best Practices for Contributors
- Always check the logs attached as artifacts in each workflow run for debugging.
- Use Node.js 20+ locally for frontend development.
- Keep secrets and environment configuration out of the repository; use GitHub Actions secrets and environments.
- If you add new jobs or tools that require secrets, document them in this file.

---

## Troubleshooting
- **Pipeline fails on Node version:** Make sure you are using Node.js 20.19.0 or higher in your local and CI environments.
- **Linter errors on environments:** Remove or update the `environment:` section if you have not configured environments in GitHub.
- **SonarCloud/Snyk errors:** Add the required tokens as described above.

---

For any questions, open an issue or contact the repository maintainer. 