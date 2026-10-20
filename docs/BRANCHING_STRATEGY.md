\# Branching Strategy



\## 1. Main Branch



The `main` branch contains the integrated code intended for release.



Avoid committing unfinished features directly to `main`.



\## 2. Feature Branches



Create a separate branch for each feature, bug fix, documentation

change, or CI/CD improvement.



Use descriptive names:



\- `feature/calendar-integration`

\- `fix/authentication-error`

\- `docs/update-documentation`

\- `ci/improve-security-scanning`



\## 3. Start New Work



Fetch the latest remote changes:



```bash

git fetch origin

