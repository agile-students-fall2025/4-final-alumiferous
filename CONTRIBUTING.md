
# Contributing to This Project

Welcome! This document outlines how to contribute to this project, our team values, and the processes we follow. Please read it carefully before making any contributions.

## Table of Contents
- [Team Norms & Values](#team-norms--values)
- [Git Workflow](#git-workflow)
- [Rules for Contributing](#rules-for-contributing)
- [Setting Up Local Development](#setting-up-local-development)
- [Building & Testing](#building--testing)

---


## Team Norms & Values

Our team norms and values are commitments we make to each other to ensure a productive, respectful, and collaborative environment. These are:

### Team Norms
- We agree to establish and document our team norms early, and revisit them as needed.
- We strive for fast, open interactions—whether co-located or remote—using dedicated chat rooms, video conferencing, and regular check-ins.
- Our team size is designed for effective collaboration and broad/deep knowledge coverage.
- We support each other, proactively offer help, and ask for assistance when needed.
- Conflicts are resolved respectfully, with consensus as the goal. If consensus cannot be reached, we escalate to management.
- If a member is not delivering on obligations, the team will address it directly and escalate if necessary.
- Team members are expected to respond to direct messages within 24 hours during the workweek.


### Team Values
- Responsibility: Each member is accountable for their commitments and deliverables.
- Transparency: We communicate progress, blockers, and concerns openly.
- Respect: We value each other's time, opinions, and contributions.
- Collaboration: We work together to solve problems and achieve goals.

### Sprint Cadence
- Sprints are 2 weeks long, balancing urgency and sustainability.
- Too short sprints create stress; too long sprints reduce focus. We aim for the middle ground.


### Weekly Online Meetings
- The team meets online atleast once per week at an agreed day and time. Meetings last no more than 1 hour 30 minutes.
- All members are expected to attend synchronously and participate actively.
- Members will not cover for others who do not participate.
- If a member makes no progress on a task for two consecutive meetings, it will be reported to management.

### Coding Standards
- We use a designated code editor and linter to standardize formatting.
- Write the minimum code to get things working end-to-end, then iterate to improve.
- All code must be peer-reviewed and pass tests before merging into `main`.
- Always push working code; if the build breaks, fix it immediately.
- Make small, granular commits with descriptive messages.
- Write self-documenting code with clear variable and function names.
- Remove dead or commented-out code.
- Write automated tests for critical functionality as skills allow.

### Concluding Thoughts
These norms are practical and reflect our team's real values and working style. We avoid including rules we do not intend to follow. Our norms are living agreements and may evolve as our team grows.

## Git Workflow

1. Create a new branch for each feature or fix (do not work directly on `main`)
2. Push your branch to the shared team repository (not a fork)
3. Open a Pull Request (PR) for review
4. Request peer review and address feedback
5. Only merge PRs into `main` after approval


## Rules for Contributing

- All contributions must follow the team norms and Git workflow above
- Write clear, descriptive commit messages
- Document your code and update relevant documentation
- Assign appropriate [GitHub Issue labels](#github-issue-labels) and [Milestones](#github-issue-milestones)
- Do not commit sensitive information (passwords, personal data, etc.)
- Respect the `.gitignore` file and do not track dependencies or build artifacts


## Setting Up Local Development

1. **Clone the repository:**
	```bash
	git clone <repo-url>
	```
2. **Synchronize your git and GitHub usernames:**
	- Run `git config --global user.name "<your-github-username>"`
	- Ensure your GitHub profile's Name field is blank
	- Verify with `git log` and `git config user.name`
3. **Install dependencies:**
	- Follow instructions in the `README.md` or relevant subproject docs
4. **Create a feature branch:**
	```bash
	git checkout -b feature/<short-description>
	```

## Building & Testing

Instructions for building and testing will be updated as the project progresses. For now:
- Refer to the `README.md` for any available build/test steps
- Ask in the team Discord channel if you need help

---

Thank you for contributing!
