

\# NeuroForge Nexus Architecture



\## 1. Overview



NeuroForge Nexus is a project management and DevOps management system

designed to support project planning, sprint management, task tracking,

team collaboration, testing, bug reporting, and calendar management.



The application uses a React frontend, a Spring Boot backend, and a

MySQL database.



\## 2. Technology Stack



| Layer | Technology |

|---|---|

| Frontend | React, Vite, JavaScript |

| Backend | Java, Spring Boot |

| API | REST APIs |

| Authentication | JWT-based authentication |

| Database | MySQL |

| Frontend web server | Nginx |

| Containerization | Docker |

| Local orchestration | Docker Compose |

| CI/CD | GitHub Actions |

| Container registry | GitHub Container Registry |

| Security analysis | Trivy, CodeQL, Gitleaks |



\## 3. High-Level Architecture



```text

+-----------------------------+

|       User's Browser        |

+--------------+--------------+

&#x20;              |

&#x20;              v

+-----------------------------+

|   React Frontend with Vite   |

|       Served by Nginx        |

+--------------+--------------+

&#x20;              |

&#x20;              | /api requests

&#x20;              v

+-----------------------------+

|     Spring Boot Backend     |

|                             |

| Controllers and REST APIs   |

| Services and Business Logic |

| Repositories and Entities   |

| Authentication and RBAC     |

+--------------+--------------+

&#x20;              |

&#x20;              v

+-----------------------------+

|        MySQL Database       |

+-----------------------------+

```



\## 4. Frontend



The frontend provides the user interface for application features.



Responsibilities include:



\- Login and registration.

\- Dashboard and project views.

\- Team and member management.

\- Sprint and task management.

\- Kanban board interactions.

\- Testing and bug reporting.

\- Calendar and AI assistant interfaces.



The production frontend is served by Nginx. API requests using `/api/`

are proxied to the Spring Boot backend.



\## 5. Backend



The backend implements application APIs and business logic using

Spring Boot.



Its responsibilities include:



\- Authentication and authorization.

\- Project and team operations.

\- Sprint and task management.

\- Role-based access control.

\- Bug reporting and related operations.

\- Calendar-related operations.

\- Database access and validation.



Controllers handle HTTP requests, services contain business logic,

and repositories manage database persistence.



\## 6. Authentication and Authorization



The backend uses JWT-based authentication.



Protected API requests must follow the authentication requirements

configured by the backend.



Authorization checks should ensure that users can only perform

operations permitted by their system role and project or team access.



Roles used by the application include:



\- ADMIN

\- PROJECT\_MANAGER

\- PROJECT\_LEAD

\- TEAM\_LEAD

\- DEVELOPER

\- QA



The exact permissions for each role are defined by the application's

security configuration and authorization logic.



\## 7. Database



MySQL stores persistent application data, including users, projects,

teams, sprints, tasks, and related records.



The backend connects to MySQL using its configured datasource.



Database schema changes must be reviewed carefully and tested before

being applied to shared or production environments.



Local Docker development uses the database configuration defined by

Docker Compose and the local environment file.



\## 8. Docker Architecture



The local Docker environment contains three main services:



\- `frontend`: serves the React application using Nginx.

\- `backend`: runs the Spring Boot application.

\- `mysql`: stores persistent application data.



Docker Compose connects the services using an internal network.



The frontend sends API requests through Nginx to the backend.

The backend connects to MySQL using the internal service hostname.



\## 9. CI/CD Architecture



GitHub Actions automates code validation and delivery checks.



The workflows include:



\- Backend compilation and tests.

\- Frontend linting and production build.

\- MySQL integration tests.

\- Docker image construction.

\- Trivy image vulnerability scanning.

\- Docker runtime smoke tests.

\- Docker image publishing to GHCR.

\- CodeQL source-code analysis.

\- Gitleaks secret scanning.

\- Dependency review for pull requests.



Docker images are published only when the configured prerequisites

succeed and the event is a push to the `main` branch.



\## 10. Development and Deployment Principles



\- Keep credentials outside source control.

\- Reuse existing services and APIs rather than duplicating business logic.

\- Enforce backend authorization for protected operations.

\- Use isolated databases for automated tests.

\- Test schema changes before deployment.

\- Review security findings instead of bypassing security checks.

\- Keep local development separate from production resources.



\## 11. Further Reference



\- \[Local Development Guide](LOCAL\_DEVELOPMENT.md)

\- \[CI/CD Pipeline](CI\_CD.md)

\- \[Contributing Guide](../CONTRIBUTING.md)

\- \[Security Policy](../SECURITY.md)



