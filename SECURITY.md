\# Security Policy



\## Supported Versions



The latest code on the `main` branch is the primary version

for security fixes.



Older commits and unreleased versions may not receive security

updates.



\## Reporting a Vulnerability



Please do not report security vulnerabilities through public

GitHub issues.



To report a vulnerability:



1\. Open the NeuroForge Nexus repository on GitHub.

2\. Open the Security tab.

3\. If private vulnerability reporting is enabled, submit a report

&#x20;  through the repository's security advisory feature.

4\. If private reporting is unavailable, contact the repository

&#x20;  maintainers through an appropriate private channel.



When reporting a vulnerability, include:



\- A description of the issue.

\- The affected component or file.

\- Steps to reproduce the issue.

\- The potential security impact.

\- Suggested remediation, if known.



Do not include real passwords, access tokens, private keys,

or production database credentials in reports.



\## Security Checks



NeuroForge Nexus uses automated checks that include:



\- Backend build and tests.

\- Frontend linting and build validation.

\- MySQL integration tests.

\- Docker image vulnerability scanning.

\- Docker runtime smoke tests.

\- CodeQL source-code analysis.



Automated checks help identify potential issues but do not

guarantee that the application is free from vulnerabilities.



\## Remediation



Security reports should be reviewed by the maintainers.

Fixes should be tested before being merged into `main`.

Critical vulnerabilities should be prioritized for remediation.
