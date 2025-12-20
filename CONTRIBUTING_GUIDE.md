# Contribution Guidelines Template

Thank you for contributing to kist! This document is a placeholder for detailed contribution guidelines.

## Quick Start

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run tests: `npm test`
5. Run linting: `npm run lint:fix`
6. Format code: `npm run format`
7. Commit your changes: `git commit -m "feat: add my feature"`
8. Push to your fork: `git push origin feature/my-feature`
9. Create a Pull Request

## Development Workflow

See [SCRIPTS.md](SCRIPTS.md) for all available npm scripts.

### Before Committing

```bash
npm run lint:fix
npm run format
npm test
```

### Code Style

- Follow TypeScript best practices
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Test changes
- `chore:` Maintenance tasks

## Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass
4. Update CHANGELOG.md
5. Request review from maintainers

## Questions?

Open an issue or start a discussion!
