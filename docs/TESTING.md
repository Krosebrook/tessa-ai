# Testing Guide for Tessa AI

This document describes the testing infrastructure and how to write and run tests.

## Overview

Tessa AI uses Jest and React Testing Library for testing. The testing infrastructure was set up as part of Phase 1 improvements (v0.2.0).

## Current Test Coverage

- **30 tests** passing
- **96% coverage** on error handling utilities
- Component tests for key UI components
- Unit tests for core utilities

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage report
```bash
npm run test:coverage
```

## Test Structure

```
src/
├── components/
│   └── __tests__/
│       └── OfflineIndicator.test.jsx
├── utils/
│   └── __tests__/
│       └── errorHandling.test.js
└── hooks/
    └── __tests__/
        └── (future test files)
```

## Writing Tests

### Component Tests

Component tests use React Testing Library to test components in isolation.

Example:
```jsx
import { render, screen } from '@testing-library/react';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Utility Function Tests

Utility tests use Jest for unit testing pure functions.

Example:
```javascript
import { myUtility } from '../myUtility';

describe('myUtility', () => {
  it('should return expected result', () => {
    expect(myUtility('input')).toBe('output');
  });
});
```

### Hook Tests

For testing custom hooks, we'll use `@testing-library/react-hooks` (to be added in future).

## Mocking

### Web Speech API

The Speech Recognition and Speech Synthesis APIs are mocked globally in `jest.setup.js`:

```javascript
global.speechSynthesis = {
  getVoices: jest.fn(() => []),
  speak: jest.fn(),
  // ...
};

global.SpeechRecognition = jest.fn(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  // ...
}));
```

### Navigator

`navigator.onLine` is also mocked for testing offline functionality.

## Configuration Files

### jest.config.js
Main Jest configuration including:
- Test environment (jsdom)
- Module name mapping (@/ paths)
- Transform patterns (Babel)
- Coverage thresholds

### jest.setup.js
Setup file that runs before tests:
- Imports @testing-library/jest-dom
- Sets up global mocks
- Configures test environment

### babel.config.cjs
Babel configuration for test transpilation:
- @babel/preset-env
- @babel/preset-react

## Coverage Goals

Current coverage thresholds:
- **Branches**: 10%
- **Functions**: 10%
- **Lines**: 10%
- **Statements**: 10%

These will be gradually increased as more tests are added.

Future goals (v0.2.0):
- **Target**: 60%+ coverage
- **10+ E2E test scenarios** (Playwright)
- **< 5 min full test suite execution**

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the component does, not how it does it
2. **Use Query Priorities**: Prefer getByRole > getByLabelText > getByText over getByTestId
3. **Avoid Testing Internal State**: Test public APIs and user interactions
4. **Keep Tests Simple**: One assertion per test when possible
5. **Use Descriptive Test Names**: Clearly describe what is being tested
6. **Mock External Dependencies**: Keep tests isolated and fast
7. **Clean Up After Tests**: Use afterEach/beforeEach to reset state

## Adding New Tests

1. Create a `__tests__` folder next to the code being tested
2. Name test files with `.test.js` or `.test.jsx` extension
3. Write descriptive test cases
4. Run tests locally before committing
5. Ensure coverage doesn't drop below thresholds

## Continuous Integration

Tests will be run automatically on:
- Every pull request
- Every push to main branch
- Before deployment

## Future Improvements

- [ ] Add Playwright for E2E testing
- [ ] Increase coverage thresholds incrementally
- [ ] Add visual regression testing
- [ ] Test accessibility with axe-core
- [ ] Add performance testing
- [ ] Set up test parallelization
- [ ] Add mutation testing

## Troubleshooting

### Tests fail with "Cannot find module"
- Check that module paths are correctly configured in jest.config.js
- Ensure @/ alias matches your project structure

### ESM module errors
- Add problematic modules to transformIgnorePatterns in jest.config.js

### Tests timeout
- Increase timeout in jest.config.js or individual tests
- Check for unresolved promises

### Coverage not generated
- Ensure files are in collectCoverageFrom pattern
- Check that files aren't excluded by testPathIgnorePatterns

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
