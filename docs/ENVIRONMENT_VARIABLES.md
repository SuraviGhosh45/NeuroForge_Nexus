\# Environment Variables



\## Overview



NeuroForge Nexus uses environment variables to configure the backend,

database connection, and local Docker environment.



Never commit real passwords, API keys, JWT secrets, or production

credentials to Git.



\## Local Docker Configuration



The root `.env.docker` file must contain the following variables:



| Variable | Purpose |

|---|---|

| `DB\_USERNAME` | MySQL application username |

| `DB\_PASSWORD` | MySQL application password |

| `MYSQL\_ROOT\_PASSWORD` | MySQL root account password |



Use development-only credentials for local Docker.



The `.env.docker` file must remain excluded from version control.



\## Backend Configuration



Docker Compose supplies the backend with its database connection

settings.



| Variable | Purpose |

|---|---|

| `PORT` | Backend HTTP port |

| `DB\_URL` | JDBC connection URL |

| `DB\_USERNAME` | Database username |

| `DB\_PASSWORD` | Database password |

| `SPRING\_JPA\_HIBERNATE\_DDL\_AUTO` | Hibernate schema configuration |



The Docker network uses the MySQL service hostname to connect

the backend to the database.



\## Database Configuration



The local Docker database is isolated from Railway.



The database name, credentials, health check, and persistent volume

are configured in `docker-compose.yml`.



Do not use local development credentials for production.



\## CI Configuration



GitHub Actions uses separate temporary credentials and an isolated

MySQL service for integration tests and container smoke tests.



CI credentials must never be copied into production configuration.



\## Configuration Safety



\- Never commit `.env.docker`.

\- Never publish credentials in issue descriptions or logs.

\- Rotate credentials immediately if they are exposed.

\- Keep local, CI, and production environments separate.

\- Review configuration changes before merging into `main`.

