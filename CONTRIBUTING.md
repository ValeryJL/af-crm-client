# Contributing Guidelines

Thank you for your interest in contributing to this application! Please follow these guidelines to ensure consistency.

## Branch Naming Convention

All branches must follow a prefixed naming convention. Depending on the type of work you are doing, please prefix your branch with one of the following:

- `feat/`: For new features (e.g., `feat/login-page`)
- `fix/`: For bug fixes (e.g., `fix/auth-token-issue`)
- `docs/`: For documentation changes (e.g., `docs/api-readme`)
- `chore/`: For maintenance, configuration, and tooling updates (e.g., `chore/update-deps`)

## Commit Messages

We enforce conventional commits format. Every commit message must be structured as follows:

`<type>[optional scope]: <description>`

### Types of Commits
- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools and libraries such as documentation generation

### Example Commit
`feat(auth): implement JWT token verification`

## Development Workflow

1. We work in sprints. Check the `README.md` for the current sprint plan.
2. Create a branch from `main` using the guidelines above.
3. Make your changes and commit using Conventional Commits.
4. Try to keep commits atomic and focused on single logical changes.
