

\# NeuroForge Nexus Testing Guide



\## 1. Overview



This document describes how to run the backend and frontend checks,

validate the Docker environment, and review automated CI/CD results.



\## 2. Prerequisites



Install the following tools:



\- Java 17 or the version required by the backend

\- Node.js 22

\- Docker Desktop

\- Git



The backend Maven wrapper is located in the `backend` directory.



\## 3. Backend Tests



From the repository root, run:



```cmd

backend\\mvnw.cmd -B -f backend\\pom.xml verify

```



This command compiles the backend, runs the configured tests, and

packages the Spring Boot application.



Review the final Maven output for:



\- `BUILD SUCCESS`

\- Total tests executed

\- Test failures and errors



Do not commit changes while required tests are failing.



\## 4. Frontend Checks



Install the frontend dependencies:



```cmd

npm ci --prefix frontend

```



Run ESLint:



```cmd

npm run lint --prefix frontend

```



Build the frontend:



```cmd

npm run build --prefix frontend

```



Resolve lint and build errors before submitting frontend changes.



\## 5. Docker Configuration Validation



Ensure Docker Desktop is running and the local `.env.docker` file

contains the environment variables required by `docker-compose.yml`.



Validate the configuration:



```cmd

docker compose --env-file .env.docker config -q

```



Build and start the application:



```cmd

docker compose --env-file .env.docker up --build -d

```



Inspect the service status:



```cmd

docker compose --env-file .env.docker ps

```



View logs when investigating failures:



```cmd

docker compose --env-file .env.docker logs --tail=100 backend

docker compose --env-file .env.docker logs --tail=100 frontend

docker compose --env-file .env.docker logs --tail=100 mysql

```



\## 6. Health Checks



Open the frontend:



http://localhost:3000



Check the backend health endpoint:



```powershell

Invoke-RestMethod http://localhost:8080/api/health

```



The expected health response should report the service status as `UP`.



Also verify the frontend API proxy:



```powershell

Invoke-RestMethod http://localhost:3000/api/health

```



Check login and the application features affected by your changes.



\## 7. Database Test Safety



Automated integration tests should use a dedicated test database.



Never use production credentials for local or CI testing.



Do not run destructive database commands against Railway or shared

environments as part of routine testing.



Avoid `docker compose down -v` unless deleting the local database

volume is intentional and the consequences are understood.



\## 8. GitHub Actions Checks



The repository workflows may include:



\- Backend build and tests

\- Frontend lint and build

\- MySQL integration tests

\- Docker image builds

\- Trivy vulnerability scans

\- Docker runtime smoke tests

\- GHCR image publishing

\- CodeQL source-code analysis

\- Gitleaks secret scanning

\- Dependency review on pull requests



Check the logs of the individual failed step when a workflow fails.



A successful workflow confirms that the configured checks passed;

it does not guarantee that every possible defect has been detected.



\## 9. Docker Security Scans



Review Trivy findings for both backend and frontend images.



When a scan blocks publishing:



1\. Identify the affected package and installed version.

2\. Review the reported fixed version.

3\. Update the appropriate dependency or image.

4\. Rebuild and rescan the image.

5\. Review the new scan output before proceeding.



Do not disable security gates merely to obtain a green workflow.



\## 10. Before Merging



\- \[ ] Backend build and tests pass.

\- \[ ] Frontend lint and build pass.

\- \[ ] Relevant integration tests pass.

\- \[ ] Docker images build successfully.

\- \[ ] Security scans have been reviewed.

\- \[ ] Runtime smoke tests pass.

\- \[ ] No credentials or secret files are committed.

\- \[ ] Database and deployment changes are documented.



