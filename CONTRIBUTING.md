# Contributing to Tessa AI

Thank you for your interest in contributing to Tessa AI! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of:
- Age, body size, disability, ethnicity, gender identity and expression
- Level of experience, education, socio-economic status
- Nationality, personal appearance, race, religion
- Sexual identity and orientation

### Our Standards

**Positive behavior includes**:
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what's best for the community
- Showing empathy towards others

**Unacceptable behavior includes**:
- Harassment, trolling, or derogatory comments
- Personal or political attacks
- Public or private harassment
- Publishing others' private information
- Other conduct inappropriate in a professional setting

---

## Getting Started

### Prerequisites

- **Node.js** 16+ and npm
- **Git** for version control
- **Base44 Account** for testing
- **Modern browser** (Chrome, Edge, or Safari)

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/tessa-ai.git
   cd tessa-ai
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/Krosebrook/tessa-ai.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Create `.env` file**:
   ```env
   VITE_BASE44_APP_ID=your_app_id
   VITE_BASE44_FUNCTIONS_VERSION=prod
   ```
6. **Start development server**:
   ```bash
   npm run dev
   ```

---

## How to Contribute

### Types of Contributions

We welcome:
- **Bug fixes** 🐛
- **New features** ✨
- **Documentation improvements** 📚
- **Performance optimizations** ⚡
- **UI/UX enhancements** 🎨
- **Test coverage** 🧪
- **Accessibility improvements** ♿

### Good First Issues

Look for issues labeled:
- `good first issue` - Perfect for newcomers
- `help wanted` - Community input needed
- `documentation` - Documentation improvements

### Reporting Bugs

**Before submitting a bug report**:
1. Check existing issues to avoid duplicates
2. Test with the latest version
3. Gather reproduction steps

**Bug report should include**:
- Clear, descriptive title
- Steps to reproduce
- Expected vs. actual behavior
- Screenshots if applicable
- Browser/OS information
- Console errors (if any)

**Template**:
```markdown
## Bug Description
Brief description of the issue

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., macOS 12.0]
- Browser: [e.g., Chrome 120]
- Node: [e.g., 18.0.0]

## Additional Context
Any other relevant information
```

### Suggesting Features

**Before suggesting a feature**:
1. Check if it's already planned (see ROADMAP.md)
2. Search existing feature requests
3. Consider if it fits project scope

**Feature request should include**:
- Clear use case and motivation
- Proposed solution or API
- Alternative approaches considered
- Impact on existing functionality

---

## Development Workflow

### Branch Strategy

```
main (protected)
  └─> develop (integration branch)
       ├─> feature/your-feature-name
       ├─> fix/bug-description
       ├─> docs/documentation-update
       └─> refactor/component-name
```

### Creating a Feature Branch

```bash
# Sync with upstream
git fetch upstream
git checkout develop
git merge upstream/develop

# Create feature branch
git checkout -b feature/amazing-feature

# Work on your feature
# ... make changes ...

# Commit your changes
git add .
git commit -m "feat: add amazing feature"

# Push to your fork
git push origin feature/amazing-feature
```

---

## Coding Standards

### JavaScript/React Style

**General Principles**:
- Write clean, readable code
- Prefer functional components with hooks
- Keep components small and focused
- Use meaningful variable names
- Add comments for complex logic

**Naming Conventions**:
```javascript
// Components: PascalCase
const TessaComponent = () => {};

// Functions: camelCase
const handleUserInput = () => {};

// Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3;

// Private functions: _prefixed
const _internalHelper = () => {};
```

**Component Structure**:
```javascript
import React, { useState, useEffect } from 'react';
import { ExternalLibrary } from 'library';
import { InternalComponent } from '@/components';
import { utility } from '@/utils';

/**
 * Component description
 * @param {Object} props - Component props
 * @param {string} props.name - Prop description
 */
const MyComponent = ({ name }) => {
  // 1. State hooks
  const [state, setState] = useState(null);
  
  // 2. Effect hooks
  useEffect(() => {
    // Effect logic
  }, []);
  
  // 3. Event handlers
  const handleClick = () => {
    // Handler logic
  };
  
  // 4. Render helpers
  const renderContent = () => {
    return <div>Content</div>;
  };
  
  // 5. Return JSX
  return (
    <div>
      {renderContent()}
    </div>
  );
};

export default MyComponent;
```

### File Organization

```
src/
├── components/
│   ├── ui/              # Reusable UI primitives
│   └── tessa/           # Feature-specific components
├── pages/               # Top-level page components
├── lib/                 # Utilities and context
├── hooks/               # Custom React hooks
├── api/                 # API clients
└── utils/               # Helper functions
```

### ESLint Rules

**Run linter**:
```bash
npm run lint        # Check for issues
npm run lint:fix    # Auto-fix issues
```

**Key rules**:
- No unused variables
- No unused imports
- React hooks rules enforced
- Prop types optional (JSDoc preferred)

### JSDoc Comments

**For complex functions**:
```javascript
/**
 * Process user voice input and generate AI response
 * @param {string} userText - Transcribed user speech
 * @returns {Promise<string>} AI-generated response
 * @throws {Error} If LLM call fails
 */
const processUserInput = async (userText) => {
  // Implementation
};
```

---

## Commit Guidelines

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

**Examples**:
```bash
feat(voice): add voice pitch adjustment

Implement voice pitch control in settings panel.
Users can now adjust pitch from 0.5 to 2.0.

Closes #123

fix(auth): handle expired tokens gracefully

Previously, expired tokens caused app crashes.
Now redirects to login with clear error message.

refactor(tessa): extract voice logic to custom hook

Move speech recognition and synthesis logic
into useTessaVoice hook for better separation.

docs(readme): update installation instructions

Add troubleshooting section and clarify
environment variable requirements.
```

**Commit best practices**:
- Use imperative mood ("add" not "added")
- Keep subject line under 50 characters
- Wrap body at 72 characters
- Reference issues and PRs

---

## Pull Request Process

### Before Submitting

**Checklist**:
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No console errors or warnings
- [ ] Linting passes (`npm run lint`)
- [ ] Builds successfully (`npm run build`)
- [ ] Tested in target browsers

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking)
- [ ] New feature (non-breaking)
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #(issue)

## How Has This Been Tested?
Describe testing process

## Screenshots (if applicable)
Add screenshots

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added/updated
```

### PR Review Process

1. **Automated checks** run (linting, build)
2. **Maintainer review** (1-3 days)
3. **Feedback addressed** by contributor
4. **Approval** and merge by maintainer

**What reviewers look for**:
- Code quality and readability
- Adherence to standards
- Adequate testing
- Performance implications
- Security considerations
- Breaking changes (if any)

---

## Testing

### Manual Testing

**Test checklist**:
- [ ] Voice recognition works
- [ ] Voice synthesis works
- [ ] Conversation persists
- [ ] Settings save correctly
- [ ] Error handling works
- [ ] Responsive on mobile
- [ ] Cross-browser compatibility

### Automated Testing (Planned)

```bash
# Run tests (coming soon)
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

---

## Documentation

### Updating Documentation

**When to update docs**:
- Adding new features
- Changing APIs or interfaces
- Fixing bugs that affect usage
- Improving setup/installation

**Documentation types**:
- **README.md**: Overview and getting started
- **ARCHITECTURE.md**: Technical design
- **docs/*.md**: Feature-specific guides
- **Inline comments**: Complex code explanations
- **JSDoc**: Function signatures and types

---

## Questions?

**Get help**:
- Open a [Discussion](https://github.com/Krosebrook/tessa-ai/discussions)
- Comment on related issue
- Contact maintainers

**Response time**:
- Bug reports: 1-3 days
- Feature requests: 1-7 days
- PRs: 1-3 days for initial review

---

## Recognition

Contributors will be:
- Listed in README acknowledgments
- Credited in release notes
- Added to contributors page (planned)

---

Thank you for contributing to Tessa AI! Your efforts help make voice AI accessible and delightful for everyone. 🎉
