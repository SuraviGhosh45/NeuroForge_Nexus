\# NeuroForge Nexus CI/CD Pipeline



\## Overview



NeuroForge Nexus uses GitHub Actions to automate code validation,

security scanning, Docker image builds, and container testing.



The main branch is the primary branch for the CI/CD workflows.



\## Automated Checks



\### 1. Backend Build and Tests



\- Uses Java 21 in GitHub Actions.

\- Builds the Spring Boot backend using Maven.

\- Runs backend tests.

\- Uploads the backend JAR as a workflow artifact.



\### 2. Frontend Lint and Build



\- Uses Node.js 22.

\- Installs dependencies using `npm ci`.

\- Runs ESLint.

\- Builds the React application using Vite.

\- Uploads the frontend build as a workflow artifact.



\### 3. MySQL Integration Tests



\- Starts an isolated MySQL service for testing.

\- Runs the backend test suite against the configured database.

\- Uses temporary CI credentials.

\- Does not use the local development database or Railway database.



\### 4. Docker Security and Runtime Tests



\- Builds the backend and frontend Docker images.

\- Scans images using Trivy for HIGH and CRITICAL vulnerabilities.

\- Blocks the workflow when matching vulnerabilities are detected,

&#x20; except findings ignored by the configured scan options.

\- Starts temporary MySQL, backend, and frontend containers.

\- Checks the backend health endpoint.

\- Checks that the frontend loads and can proxy API requests.



\### 5. Docker Image Publishing



After required checks pass, pushes to `main` publish images to

GitHub Container Registry (GHCR).



Published image naming:



\- `ghcr.io/<owner>/neuroforge-backend:latest`

\- `ghcr.io/<owner>/neuroforge-backend:sha-<commit>`

\- `ghcr.io/<owner>/neuroforge-frontend:latest`

\- `ghcr.io/<owner>/neuroforge-frontend:sha-<commit>`



Pull requests build and validate images without publishing them.



\## Additional Security Workflows



\### CodeQL



Analyzes Java and JavaScript/TypeScript source code for potential

security issues.



\### Secret Scanning



Uses Gitleaks to detect potentially exposed credentials and secrets.



\### Dependency Review



Checks dependency changes in pull requests for vulnerabilities

at or above the configured severity threshold.



\### Dependabot



Checks configured Maven, npm, Docker, and GitHub Actions dependencies

for updates and opens pull requests when eligible updates are found.



\## Developer Workflow



1\. Create a feature branch from the latest `main`.

2\. Make the required changes.

3\. Commit and push the feature branch.

4\. Open a pull request to `main`.

5\. Review the code and automated checks.

6\. Resolve failures before merging.



\## Troubleshooting



\### Backend test failure



Inspect the Maven test output and identify the failing test

before changing production code.



\### Docker build failure



Check the Dockerfile, build logs, dependencies, and registry access.



\### Trivy scan failure



Review the vulnerability report and update affected dependencies

or base images. Do not disable the security gate simply to make

the workflow pass.



\### Container smoke-test failure



Inspect the relevant container logs and verify database connectivity,

backend health, and the frontend Nginx API proxy.



\### Publishing failure



Check GitHub Actions permissions and GHCR authentication.



\## Security Notes



\- Never commit `.env.docker`, passwords, API keys, or private tokens.

\- Use isolated databases for automated tests.

\- Do not run destructive commands against shared or production databases.

\- Review security alerts and dependency updates before merging.

\- CI/CD success does not guarantee that the application is free

&#x20; from vulnerabilities.

