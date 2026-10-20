\# NeuroForge Nexus Release Process



\## 1. Purpose



This document describes the recommended process for validating,

reviewing, and releasing NeuroForge Nexus changes.



\## 2. Before a Release



\- Review all changes intended for release.

\- Confirm the backend tests pass.

\- Confirm frontend linting and build pass.

\- Confirm MySQL integration tests pass.

\- Review Docker vulnerability scan results.

\- Confirm Docker runtime smoke tests pass.

\- Review CodeQL and secret-scanning results.

\- Verify dependency updates have been reviewed.

\- Confirm no credentials or local environment files are committed.



\## 3. Pull Request Review



1\. Create a feature or fix branch.

2\. Commit the relevant changes.

3\. Push the branch to GitHub.

4\. Open a pull request targeting `main`.

5\. Review the code and CI results.

6\. Resolve review comments and failed checks.

7\. Merge only after the required approvals and checks are complete.



\## 4. Build and Publish



The GitHub Actions pipeline builds and validates the backend and

frontend Docker images.



When a push to `main` satisfies all required jobs, the configured

workflow publishes images to GitHub Container Registry (GHCR).



Published image tags include:



\- `latest`

\- `sha-<commit>`



For reproducibility, prefer the commit-specific image tag when

selecting an image for a release.



\## 5. Deployment



Publishing an image does not automatically mean that it has been

deployed to a production environment.



Before deployment:



\- Confirm the target environment.

\- Review environment variables and required secrets.

\- Verify database connectivity and schema compatibility.

\- Confirm the release can be rolled back safely.

\- Obtain any required team approval.



Deployment must use the intended environment and approved procedure.

Do not change Railway or production settings as part of routine

local development or CI validation.



\## 6. Post-Release Verification



After an approved deployment:



\- Verify the application starts successfully.

\- Check the backend health endpoint.

\- Verify the frontend loads.

\- Test authentication and authorization.

\- Check critical project and task workflows.

\- Review application logs for errors.

\- Confirm the database remains accessible.



\## 7. Rollback



If a release causes a serious problem:



1\. Notify the responsible maintainers.

2\. Identify the last known working release.

3\. Follow the team's approved rollback procedure.

4\. Verify application and database compatibility.

5\. Run post-rollback health checks.

6\. Document the cause and corrective action.



Do not roll back database schema changes without reviewing their

compatibility and data-loss risks.



\## 8. Release Records



Record the release date, source commit, published image tags,

changes included, verification results, and any known issues.



\## 9. Important Safety Rules



\- Never commit production credentials.

\- Never use local test data as production data.

\- Do not perform destructive database operations without approval.

\- Do not bypass security scans solely to publish an image.

\- Document changes to deployment and database configuration.

