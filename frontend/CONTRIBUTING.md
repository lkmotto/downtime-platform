# Contributing

## Pre-commit Hooks

This project uses [pre-commit](https://pre-commit.com) hooks to ensure code quality and consistency.

### Setup

1. Install pre-commit:

   ```bash
   pip install pre-commit
   ```

2. Install the git hooks:

   ```bash
   pre-commit install
   ```

After installation, the hooks will run automatically on every `git commit`. You can also run them manually at any time:

```bash
pre-commit run --all-files
```
