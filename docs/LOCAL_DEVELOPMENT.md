

\# Local Development Guide



\## Overview



NeuroForge Nexus consists of a React frontend, Spring Boot backend,

and MySQL database. Docker Compose runs these services locally.



\## Prerequisites



Install the following tools:



\- Git

\- Docker Desktop

\- Docker Compose

\- A GitHub account with repository access



\## Project Services



| Service | Local URL |

|---|---|

| Frontend | http://localhost:3000 |

| Backend | http://localhost:8080 |

| Backend health | http://localhost:8080/api/health |

| MySQL | Accessible within the Docker network |



\## Environment Configuration



The root `.env.docker` file provides local database credentials.



Create this file locally and configure the variables required by

`docker-compose.yml`:



\- `DB\_USERNAME`

\- `DB\_PASSWORD`

\- `MYSQL\_ROOT\_PASSWORD`



Use local development credentials only. Do not commit `.env.docker`

or share database passwords in public issues or pull requests.



\## Start the Application



Run the following commands from the project root.



Validate the Compose configuration:



```bash

docker compose --env-file .env.docker config -q

```



Build the images and start the services:



```bash

docker compose --env-file .env.docker up --build -d

```



Check service status:



```bash

docker compose --env-file .env.docker ps

```



View service logs:



```bash

docker compose --env-file .env.docker logs -f

```



To view a specific service's logs:



```bash

docker compose --env-file .env.docker logs -f backend

docker compose --env-file .env.docker logs -f frontend

docker compose --env-file .env.docker logs -f mysql

```



\## Verify the Application



Open http://localhost:3000 in a browser.



Check the backend health endpoint:



```bash

curl http://localhost:8080/api/health

```



A successful response should report the service status as `UP`.



On Windows PowerShell, you can alternatively run:



```powershell

Invoke-RestMethod http://localhost:8080/api/health

```



Then verify that login, project management, task management, and

other available application features work as expected.



\## Stop the Application



Stop the containers without removing the persistent database volume:



```bash

docker compose --env-file .env.docker down

```



Start the application again:



```bash

docker compose --env-file .env.docker up -d

```



\## Database Persistence



Docker Compose uses the named volume configured for MySQL to preserve

local database data across ordinary container restarts.



Do not use `docker compose down -v` unless you intentionally want to

remove the associated volumes and understand the data-loss consequences.



Never run destructive database commands against Railway or any

shared environment as part of local development.



\## Troubleshooting



\### Environment variable errors



Ensure `.env.docker` exists in the project root and contains the

required variable names.



\### Backend fails to start



Check the backend logs and verify that MySQL is healthy and the

database credentials match the Compose configuration.



\### Frontend cannot reach the backend



Check the Nginx configuration and confirm that API requests are

proxied to `http://backend:8080` within the Compose network.



\### Port already in use



Check whether another local process is already using port 3000

or 8080 before restarting the application.



\### Build failures



Review the Docker build output and backend/frontend dependency

installation errors before changing the configuration.



