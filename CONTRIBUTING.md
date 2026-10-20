\# Contributing to NeuroForge Nexus



\## Development Workflow



1\. Clone the repository.

2\. Create a feature branch from the latest `main`.

3\. Make your changes and review them before committing.

4\. Run the relevant backend or frontend checks.

5\. Push the feature branch to GitHub.

6\. Open a pull request targeting `main`.

7\. Review the changes and ensure required CI checks pass before merging.



\## Branch Naming



Use descriptive branch names, such as:



\- `feature/calendar-integration`

\- `fix/authentication-error`

\- `docs/update-readme`

\- `ci/improve-security-scanning`



\## Backend Guidelines



\- Use the existing Spring Boot project structure.

\- Keep controllers, services, repositories, entities, and DTOs

&#x20; focused on their intended responsibilities.

\- Validate user input.

\- Preserve authentication and role-based authorization.

\- Add or update tests when changing backend behavior.

\- Do not commit database passwords, JWT secrets, or API tokens.



\## Frontend Guidelines



\- Follow the existing React and Vite project structure.

\- Reuse existing components and contexts where appropriate.

\- Handle loading, success, and error states.

\- Avoid introducing unnecessary dependencies.

\- Run ESLint and the production build before submitting changes.



\## Pull Request Requirements



Each pull request should include:



\- A clear title and summary.

\- The reason for the change.

\- Relevant testing details.

\- Screenshots for significant UI changes.

\- Any database or configuration changes that reviewers need to know about.



\## CI/CD Checks



The repository's automated workflow may include:



\- Backend build and tests.

\- Frontend linting and production build.

\- MySQL integration tests.

\- Docker image vulnerability scans.

\- Docker runtime smoke tests.

\- Docker image publishing.

\- CodeQL security analysis.



Resolve failing checks before requesting a merge.



\## Security



\- Never commit credentials or production secrets.

\- Do not bypass authentication or authorization checks to make tests pass.

\- Review dependency vulnerability reports.

\- Report suspected security vulnerabilities privately using the

&#x20; repository's security reporting process.



\## Database and Deployment Safety



\- Use isolated test databases for automated testing.

\- Do not run destructive database commands against shared or

&#x20; production environments.

\- Coordinate schema changes with the team.

\- Do not change production deployment configuration without

&#x20; appropriate review.
