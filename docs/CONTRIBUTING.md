# Contributing to Tessa AI

Thank you for your interest in contributing to Tessa AI! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Testing Guidelines](#testing-guidelines)
- [Documentation Guidelines](#documentation-guidelines)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behaviors include:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behaviors include:**
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate

## Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Git** >= 2.x
- Code editor (VS Code recommended)
- Base44 account for testing

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/tessa-ai.git
   cd tessa-ai
   ```
3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/Krosebrook/tessa-ai.git
   ```

### Setup Development Environment

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file:
   ```env
   VITE_BASE44_APP_ID=your_dev_app_id
   VITE_BASE44_FUNCTIONS_VERSION=prod
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Verify everything works by accessing `http://localhost:5173`

## Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features (future)
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes
- `docs/*` - Documentation updates

### Creating a Feature Branch

```bash
# Update your local main
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
```

### Making Changes

1. **Write code** following our coding standards
2. **Test locally** to ensure it works
3. **Run linter** to check for issues:
   ```bash
   npm run lint
   npm run lint:fix  # Auto-fix issues
   ```
4. **Commit changes** with clear messages:
   ```bash
   git add .
   git commit -m "feat: add voice command shortcuts"
   ```

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

**Examples:**
```
feat(voice): add support for custom wake words

fix(settings): prevent voice settings from resetting

docs(readme): update installation instructions

refactor(tessa): extract conversation logic to custom hook
```

### Keep Your Branch Updated

```bash
# Fetch latest changes
git fetch upstream

# Rebase your branch
git rebase upstream/main

# Force push to your fork (if already pushed)
git push origin feature/your-feature-name --force-with-lease
```

## Coding Standards

### JavaScript/JSX Style

1. **Use functional components** with hooks (no class components)
2. **Use ES6+ features**: destructuring, arrow functions, async/await
3. **Prefer const** over let, never use var
4. **Use meaningful variable names**: `isLoading` not `flag1`

**Example:**
```javascript
// Good
const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    fetchUser(userId);
  }, [userId]);
  
  return <div>{user?.name}</div>;
};

// Bad
var UserProfile = function(props) {
  var x = null;
  var flag = false;
  // ...
};
```

### Component Structure

```javascript
// 1. Imports
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

// 2. Constants
const MAX_RETRIES = 3;

// 3. Component definition
const MyComponent = ({ prop1, prop2 }) => {
  // 4. Hooks
  const [state, setState] = useState(null);
  
  // 5. Event handlers
  const handleClick = () => { /* ... */ };
  
  // 6. Effects
  useEffect(() => { /* ... */ }, []);
  
  // 7. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

// 8. PropTypes or TypeScript types (future)

// 9. Export
export default MyComponent;
```

### File Naming

- **Components**: PascalCase (`HudCircle.jsx`)
- **Utilities**: camelCase (`formatDate.js`)
- **Configs**: kebab-case (`vite.config.js`)
- **Constants**: UPPER_SNAKE_CASE (`const API_TIMEOUT = 5000`)

### Import Organization

```javascript
// 1. React and external libraries
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Internal components
import Button from '@/components/ui/button';

// 3. Utilities and helpers
import { formatDate } from '@/lib/utils';

// 4. Types (future)

// 5. Styles (if not using Tailwind)
```

### CSS/Styling Guidelines

1. **Use Tailwind classes** for styling
2. **Follow mobile-first approach**
3. **Use Radix UI primitives** for accessible components
4. **Avoid inline styles** unless dynamic
5. **Use CSS modules** for component-specific styles (if needed)

**Example:**
```jsx
// Good
<div className="flex items-center justify-between p-4 bg-purple-900 rounded-lg">

// Acceptable for dynamic values
<div style={{ width: `${progress}%` }}>

// Bad - avoid inline static styles
<div style={{ display: 'flex', padding: '16px' }}>
```

### State Management Guidelines

1. **Use local state** for component-specific data
2. **Use Context** for global app state (auth, theme)
3. **Use React Query** for server state
4. **Avoid prop drilling** - use Context or composition

### Error Handling

1. **Always handle errors** gracefully
2. **Provide user-friendly messages**
3. **Log errors** for debugging
4. **Don't expose sensitive information**

```javascript
// Good
try {
  const response = await api.call();
  return response;
} catch (error) {
  console.error('Failed to fetch data:', error);
  toast.error('Unable to load data. Please try again.');
  return null;
}

// Bad
try {
  const response = await api.call();
  return response;
} catch (error) {
  // Silent failure or generic error
  alert('Error!');
}
```

## Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Lint passes without errors
- [ ] App builds successfully
- [ ] Manual testing completed
- [ ] Documentation updated (if needed)
- [ ] Commit messages follow convention

### Submitting a PR

1. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request** on GitHub

3. **Fill out PR template**:
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Testing
   Describe how to test the changes
   
   ## Screenshots (if applicable)
   Add screenshots for UI changes
   
   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Documentation updated
   - [ ] No new warnings generated
   ```

4. **Request review** from maintainers

### PR Review Process

1. **Automated checks** run (linting, build)
2. **Maintainer review** for code quality and design
3. **Feedback addressed** by contributor
4. **Approval** and merge by maintainer

### After Merge

1. **Delete your branch**:
   ```bash
   git branch -d feature/your-feature-name
   git push origin --delete feature/your-feature-name
   ```

2. **Update local main**:
   ```bash
   git checkout main
   git pull upstream main
   ```

## Issue Guidelines

### Before Creating an Issue

1. **Search existing issues** to avoid duplicates
2. **Check documentation** for answers
3. **Verify it's reproducible** in latest version

### Bug Reports

Use the bug report template:

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 0.1.0]

**Additional context**
Any other relevant information
```

### Feature Requests

Use the feature request template:

```markdown
**Is your feature request related to a problem?**
Description of the problem

**Describe the solution you'd like**
Clear description of desired feature

**Describe alternatives you've considered**
Alternative solutions or features

**Additional context**
Mockups, examples, or other context
```

## Testing Guidelines

### Manual Testing

1. **Test in multiple browsers**: Chrome, Edge, Safari
2. **Test responsive design**: Mobile and desktop
3. **Test error scenarios**: Network failures, invalid inputs
4. **Test voice interaction**: Recognition accuracy, synthesis quality

### Automated Testing (Future)

When test infrastructure is implemented:

1. **Write unit tests** for utilities and hooks
2. **Write integration tests** for user flows
3. **Maintain > 80% coverage** for critical paths

## Documentation Guidelines

### Code Comments

1. **Comment complex logic** only
2. **Use JSDoc** for functions (future)
3. **Avoid obvious comments**

```javascript
// Good
// Calculate exponential backoff delay to prevent API throttling
const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);

// Bad
// Set x to 5
const x = 5;
```

### Documentation Updates

When making changes that affect:
- **Setup process**: Update README.md
- **Architecture**: Update docs/ARCHITECTURE.md
- **Agent behavior**: Update docs/AGENTS.md
- **API**: Add to appropriate doc

### Writing Style

1. **Be clear and concise**
2. **Use active voice**
3. **Include examples**
4. **Keep it up to date**

## Getting Help

### Resources

- **Documentation**: [/docs](/docs)
- **GitHub Issues**: Report bugs or request features
- **GitHub Discussions**: Ask questions, share ideas
- **Email**: support@base44.com

### Communication

- **Be respectful** and patient
- **Provide context** when asking questions
- **Share your environment** details
- **Include error messages** when reporting issues

## Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes for significant contributions
- Special thanks in documentation

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

**Thank you for contributing to Tessa AI!** 🎉

Every contribution, no matter how small, makes a difference. We appreciate your time and effort in making Tessa AI better for everyone.

---

**Document Version**: 1.0
**Last Updated**: 2024-12-30
**Maintainer**: [@Krosebrook](https://github.com/Krosebrook)
