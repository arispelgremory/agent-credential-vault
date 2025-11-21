# Coding Standards Guide

This document outlines our project's coding standards and best practices based on our ESLint configuration.

## Table of Contents

- [React Guidelines](#react-guidelines)
- [TypeScript Guidelines](#typescript-guidelines)
- [Import Rules](#import-rules)
- [File and Folder Naming](#file-and-folder-naming)
- [General Code Style](#general-code-style)
- [Conventional Commits](#conventional-commits)

## React Guidelines

### JSX and Components

- TypeScript/JSX files must use `.tsx` or `.jsx` extensions
- No need to import React explicitly (Next.js handles this)
- Props spreading is allowed, but use it judiciously
- Always include key prop when mapping over arrays
- Avoid unescaped entities in JSX
- Default props must match prop types

### Props

- Use TypeScript interfaces instead of PropTypes
- Remove unused prop type definitions
- Ensure all used props are properly typed

## TypeScript Guidelines

### Type Safety

- Use of `any` is discouraged and will trigger warnings
- Return types for functions are optional but recommended
- Unused variables are not allowed, except:
    - Variables prefixed with underscore (\_)
    - Function parameters prefixed with underscore (\_)

## Import Rules

### Import Order

Imports should be organized in the following order with blank lines between groups:

1. Node.js built-in modules
2. External npm packages
3. Internal modules (with specific ordering):
    - `@/components/**`
    - `@/lib/**`
    - `@/i18n/**`
    - `@/features/**`
4. Parent/sibling imports
5. Index imports
6. Object imports
7. Type imports

### Import Paths

- Use absolute imports with `@/` alias
- Relative parent imports (`../`) are not allowed
- Imports should be alphabetically ordered within their groups

## File and Folder Naming

### File Naming

- Use kebab-case for all files
- Valid characters: lowercase letters, numbers, and hyphens
- Examples:
    - ✅ `user-profile.tsx`
    - ✅ `api-handler.ts`
    - ❌ `UserProfile.tsx`
    - ❌ `apiHandler.ts`

## General Code Style

### Function Length

- Maximum of 250 lines per function
- Blank lines and comments are not counted
- Break down large functions into smaller, more manageable pieces

### Variable Naming

- Use camelCase for variables and functions
- Property names are exempt from camelCase requirement
- Examples:
    - ✅ `userName`
    - ✅ `fetchUserData`
    - ✅ `api_response` (for properties)

## Conventional Commits

We follow the Conventional Commits specification for commit messages to maintain a clear and standardized commit history.

### Commit Message Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc.)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to our CI configuration files and scripts
- `chore`: Other changes that don't modify src or test files
- `revert`: Reverts a previous commit

### Scope

The scope is optional and provides additional contextual information:

- `auth`
- `api`
- `ui`
- `utils`
- etc.

### Examples

```
feat(auth): add email verification
fix(api): handle null response from user endpoint
docs: update README with deployment instructions
style: format code according to new ESLint rules
refactor(utils): simplify date formatting function
test(auth): add unit tests for login flow
```

### Breaking Changes

For commits with breaking changes:

- Add `!` after the type/scope
- Add `BREAKING CHANGE:` in the footer

```
feat(api)!: remove deprecated endpoint

BREAKING CHANGE: /v1/users endpoint has been removed, use /v2/users instead
```

### Best Practices

1. Keep descriptions concise and imperative ("add" instead of "added")
2. Don't capitalize the description
3. No period at the end of the description
4. Describe what the change does, not how it does it
5. Use the body to explain the why and what vs. how
6. Reference issues and pull requests in the footer

## Code Organization Tips

1. Group related components and utilities in appropriate directories
2. Use the established project structure:

    ```
    src/
    ├── components/
    ├── lib/
    ├── i18n/
    └── features/
    ```

3. Keep components focused and single-responsibility
4. Break down complex components into smaller, reusable pieces
5. Use TypeScript effectively for type safety

## Best Practices

1. Write clean, self-documenting code
2. Keep functions small and focused
3. Use meaningful variable and function names
4. Follow the established import order for consistency
5. Leverage TypeScript's type system for better code quality
6. Break down complex logic into smaller, testable functions
7. Use absolute imports with `@/` alias for better maintainability

## Contributing

Before submitting code:

1. Ensure all ESLint rules pass
2. Format code using Prettier
3. Follow the import order guidelines
4. Use appropriate file naming conventions
5. Keep functions within the size limit
6. Use TypeScript effectively
7. Follow conventional commit message format
8. run `pnpm run lint:fix` to help fix your code if you need.
