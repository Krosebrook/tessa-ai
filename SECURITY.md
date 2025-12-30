# Security Policy

## Reporting a Vulnerability

We take the security of Tessa AI seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

**DO NOT** open a public issue for security vulnerabilities.

Instead, please report security issues to:
- **GitHub Security Advisory**: [Create a private security advisory](https://github.com/Krosebrook/tessa-ai/security/advisories/new)
- **Alternative**: Contact the maintainer [@Krosebrook](https://github.com/Krosebrook) directly

### What to Include

Please provide:
1. **Description** of the vulnerability
2. **Steps to reproduce** the issue
3. **Potential impact** assessment
4. **Suggested fix** (if you have one)
5. **Your contact information** for follow-up

### Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial assessment**: Within 1 week
- **Status update**: Every 2 weeks
- **Fix timeline**: Depends on severity (see below)

### Severity Levels

| Severity | Description | Response Time |
|----------|-------------|---------------|
| **Critical** | Remote code execution, authentication bypass | 1-7 days |
| **High** | Data exposure, privilege escalation | 1-2 weeks |
| **Medium** | Limited data exposure, DoS | 2-4 weeks |
| **Low** | Information disclosure, minor issues | 1-3 months |

---

## Security Measures

### Current Implementation

#### 1. **Authentication & Authorization**

**✅ Implemented**:
- Token-based authentication via Base44
- Secure token storage in localStorage
- Automatic token refresh
- Token removal from URL after extraction

**How it works**:
```javascript
// Token extracted from URL and stored securely
const token = getAppParamValue("access_token", { removeFromUrl: true });
localStorage.setItem('base44_access_token', token);
```

**Best Practices**:
- Tokens are removed from URL immediately (not in browser history)
- HTTPS required for production (prevents token interception)
- Tokens have expiration times (handled by Base44)

#### 2. **Data Protection**

**✅ Implemented**:
- Environment variables for sensitive configuration
- No hardcoded secrets in source code
- `.env` files gitignored
- Sensitive data only exposed to Base44 API

**Configuration**:
```env
# .env (never committed)
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_FUNCTIONS_VERSION=prod
```

**⚠️ Limitations**:
- `VITE_*` variables are exposed to client bundle (by design)
- Only non-sensitive config should use `VITE_*` prefix

#### 3. **Input Validation**

**✅ Implemented**:
- User input processed by Base44 backend (server-side sanitization)
- Voice transcripts are strings (no code execution risk)

**⚠️ Recommended Improvements**:
```javascript
// Add client-side validation
const sanitizeInput = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text.trim().slice(0, 500); // Max length
};

const processUserInput = async (userText) => {
  const sanitized = sanitizeInput(userText);
  if (!sanitized) {
    return "I didn't catch that. Could you repeat?";
  }
  // ... process
};
```

#### 4. **API Security**

**✅ Implemented**:
- All API calls go through Base44 SDK
- SDK handles authentication headers
- No direct API key exposure

**Architecture**:
```
Client → Base44 SDK → Base44 Platform
         (with token)   (validates token)
```

#### 5. **Error Handling**

**✅ Implemented**:
- User-friendly error messages
- Detailed errors only in console (development)

**⚠️ Recommended Improvements**:
```javascript
try {
  // API call
} catch (error) {
  // Don't expose internal errors to users
  console.error('Internal error:', error);
  return "I'm having trouble right now. Please try again.";
}
```

---

## Known Security Considerations

### 1. **Web Speech API Permissions**

**Issue**: Speech recognition requires microphone access

**Mitigation**:
- Browser prompts user for permission
- Permission can be revoked anytime
- No audio is stored or transmitted beyond Base44

**User Control**:
- Clear indicator when listening (HUD status)
- Users can deny microphone access
- Works in trusted contexts (HTTPS, localhost)

### 2. **Local Storage**

**Issue**: localStorage is vulnerable to XSS attacks

**Current Status**: ✅ Low risk
- No user-generated HTML rendered
- No `dangerouslySetInnerHTML` used
- React escapes all rendered content

**Additional Protection**:
```javascript
// If adding user-generated content in future
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(userContent);
```

### 3. **Third-Party Dependencies**

**Current Status**: ✅ Regularly updated

**Monitoring**:
```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities automatically
npm audit fix
```

**Dependencies reviewed**:
- React (trusted)
- Radix UI (trusted, accessibility-focused)
- Base44 SDK (official)
- TailwindCSS (CSS only, no JS execution)

### 4. **CORS and CSP**

**⚠️ To Implement**:

**Content Security Policy**:
```html
<!-- Add to index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="
        default-src 'self';
        script-src 'self' 'unsafe-inline';
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        font-src 'self' https://fonts.gstatic.com;
        connect-src 'self' https://api.base44.com;
        img-src 'self' data: https:;
      ">
```

### 5. **Rate Limiting**

**⚠️ To Implement**:

**Client-side throttling**:
```javascript
// Prevent API abuse
const rateLimiter = {
  calls: 0,
  resetTime: Date.now() + 60000, // 1 minute
  maxCalls: 20, // Max 20 calls per minute
  
  canCall() {
    if (Date.now() > this.resetTime) {
      this.calls = 0;
      this.resetTime = Date.now() + 60000;
    }
    return this.calls < this.maxCalls;
  },
  
  recordCall() {
    this.calls++;
  }
};

// Usage in processUserInput
if (!rateLimiter.canCall()) {
  return "Please slow down. Try again in a moment.";
}
rateLimiter.recordCall();
```

---

## Security Checklist for Contributors

When adding new features, ensure:

- [ ] **No secrets in code** (use environment variables)
- [ ] **Input validation** (sanitize user input)
- [ ] **Error handling** (no sensitive data in errors)
- [ ] **Dependency check** (`npm audit` passes)
- [ ] **HTTPS only** (for production deployments)
- [ ] **Authentication** (validate tokens properly)
- [ ] **Authorization** (check user permissions)
- [ ] **Data encryption** (use HTTPS for transmission)
- [ ] **Secure storage** (localStorage for non-sensitive only)
- [ ] **XSS prevention** (escape user content)

---

## Secure Development Practices

### 1. **Environment Variables**

**DO**:
```javascript
// ✅ Use env vars for config
const appId = import.meta.env.VITE_BASE44_APP_ID;
```

**DON'T**:
```javascript
// ❌ Never hardcode secrets
const secretKey = 'abc123xyz789';
```

### 2. **API Calls**

**DO**:
```javascript
// ✅ Use SDK with proper error handling
try {
  const response = await base44.integrations.Core.InvokeLLM({
    prompt: sanitizedPrompt
  });
} catch (error) {
  console.error('API error:', error);
  showUserFriendlyError();
}
```

**DON'T**:
```javascript
// ❌ Don't expose errors to users
catch (error) {
  alert(`Error: ${error.message}`); // May expose sensitive info
}
```

### 3. **User Input**

**DO**:
```javascript
// ✅ Validate and sanitize
const input = userText.trim().slice(0, 500);
if (!input.match(/^[a-zA-Z0-9\s.,!?'"-]*$/)) {
  return "Invalid input. Please use only standard characters.";
}
```

**DON'T**:
```javascript
// ❌ Don't trust user input
eval(userText); // NEVER DO THIS
dangerouslySetInnerHTML={{ __html: userText }}; // Avoid
```

### 4. **Dependencies**

**DO**:
```bash
# ✅ Regular security audits
npm audit
npm update
```

**DON'T**:
```bash
# ❌ Don't ignore warnings
npm audit --force # Without reviewing issues
```

---

## Production Deployment Security

### Checklist

- [ ] **HTTPS enabled** (required for Web Speech API)
- [ ] **Environment variables** properly configured
- [ ] **CSP headers** implemented
- [ ] **CORS** configured correctly
- [ ] **Rate limiting** enabled
- [ ] **Error logging** (not exposed to users)
- [ ] **Monitoring** set up for anomalies
- [ ] **Backup strategy** for user data
- [ ] **Incident response plan** documented

### Recommended Headers

```nginx
# nginx configuration
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "microphone=(), camera=(), geolocation=()" always;
```

---

## Security Updates

We will:
- Monitor dependencies for vulnerabilities
- Apply security patches promptly
- Notify users of critical updates
- Maintain a security changelog

**Subscribe to updates**:
- Watch this repository on GitHub
- Check CHANGELOG.md for security fixes
- Follow release notes

---

## Compliance

### Data Privacy

**User Data Collected**:
- Voice transcripts (processed by Base44)
- Conversation history (stored in Base44)
- User preferences (stored in Base44)

**Data Usage**:
- Only for providing assistant functionality
- Not shared with third parties (except Base44 for processing)
- Users can request data deletion

**User Rights**:
- Access their data
- Delete their data
- Export their data

**Compliance**:
- GDPR considerations (for EU users)
- CCPA considerations (for CA users)

### Terms of Service

Users must agree to:
- Microphone access for voice features
- Data processing by Base44
- Storage of conversation history

---

## Contact

For security questions or concerns:
- **Security Issues**: [GitHub Security Advisories](https://github.com/Krosebrook/tessa-ai/security/advisories)
- **General Security**: Contact maintainer [@Krosebrook](https://github.com/Krosebrook)

---

## Acknowledgments

We thank the security research community for responsible disclosure and helping keep Tessa AI secure.

**Hall of Fame** (security researchers who have helped):
- *None yet - be the first!*

---

**Last Updated**: 2025-01-01
**Version**: 1.0
