# Troubleshooting Guide

This guide helps you diagnose and fix common issues with Tessa AI.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Authentication Problems](#authentication-problems)
- [Voice Recognition Issues](#voice-recognition-issues)
- [Speech Synthesis Problems](#speech-synthesis-problems)
- [Conversation Issues](#conversation-issues)
- [Performance Problems](#performance-problems)
- [Browser Compatibility](#browser-compatibility)
- [Network Issues](#network-issues)
- [Advanced Debugging](#advanced-debugging)

---

## Installation Issues

### Problem: `npm install` fails

**Symptoms**:
- Errors during package installation
- Missing dependencies
- Version conflicts

**Solutions**:

1. **Clear npm cache**:
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check Node.js version**:
   ```bash
   node --version  # Should be >= 18.x
   npm --version   # Should be >= 9.x
   ```

3. **Use exact Node version**:
   ```bash
   nvm install 18
   nvm use 18
   npm install
   ```

4. **Check for network issues**:
   ```bash
   npm config set registry https://registry.npmjs.org/
   ```

### Problem: Build fails

**Symptoms**:
- `npm run build` throws errors
- Missing modules
- Vite configuration errors

**Solutions**:

1. **Check environment variables**:
   ```bash
   # Ensure .env file exists with required variables
   VITE_BASE44_APP_ID=your_app_id
   VITE_BASE44_FUNCTIONS_VERSION=prod
   ```

2. **Clear build cache**:
   ```bash
   rm -rf dist
   npm run build
   ```

3. **Check for syntax errors**:
   ```bash
   npm run lint
   npm run typecheck
   ```

---

## Authentication Problems

### Problem: Can't log in / "Authentication required" error

**Symptoms**:
- Redirected to login repeatedly
- "Authentication required" message
- Blank screen after login

**Solutions**:

1. **Check URL parameters**:
   - Ensure `access_token` is present in URL after OAuth redirect
   - Check `app_id` parameter matches your Base44 app

2. **Clear localStorage**:
   ```javascript
   // Open browser console (F12)
   localStorage.clear();
   location.reload();
   ```

3. **Verify Base44 app configuration**:
   - Check app is published
   - Verify authentication settings
   - Ensure user is registered for the app

4. **Check token expiration**:
   ```javascript
   // In console
   console.log(localStorage.getItem('base44_access_token'));
   // If expired, request new token
   ```

### Problem: "User not registered" error

**Symptoms**:
- Error message about user not being registered
- Can't access app after login

**Solutions**:

1. **Register user in Base44 dashboard**:
   - Go to Base44 app settings
   - Add user to allowed users list
   - Save and retry

2. **Check app permissions**:
   - Verify app has correct permission settings
   - Ensure public access is enabled if needed

---

## Voice Recognition Issues

### Problem: Microphone not working

**Symptoms**:
- "Listening..." never appears
- No response when speaking
- Browser doesn't ask for microphone permission

**Solutions**:

1. **Grant microphone permission**:
   - Click lock/info icon in address bar
   - Enable microphone permission
   - Reload page

2. **Check browser support**:
   - Chrome/Edge 88+: ✅ Full support
   - Safari 14.1+: ✅ Full support
   - Firefox: ❌ Limited support (no Web Speech API)

3. **Test microphone**:
   ```javascript
   // Open console (F12)
   navigator.mediaDevices.getUserMedia({ audio: true })
     .then(() => console.log('Microphone works!'))
     .catch(err => console.error('Microphone error:', err));
   ```

4. **Check system settings**:
   - Ensure microphone is not muted
   - Check system privacy settings
   - Test microphone in other apps

### Problem: Poor recognition accuracy

**Symptoms**:
- Frequently misunderstands words
- Doesn't recognize speech at all
- Cuts off mid-sentence

**Solutions**:

1. **Improve audio quality**:
   - Speak clearly and at normal pace
   - Reduce background noise
   - Use external microphone for better quality

2. **Check language settings**:
   - Currently supports `en-US` only
   - Ensure system language matches

3. **Adjust speech settings**:
   - Try speaking louder or softer
   - Pause briefly between sentences
   - Avoid speaking too fast

---

## Speech Synthesis Problems

### Problem: No audio output / Tessa doesn't speak

**Symptoms**:
- Text appears but no voice
- Volume is at 0
- Wrong voice selected

**Solutions**:

1. **Check volume settings**:
   - Open Settings (⚙️ icon)
   - Ensure Volume slider is not at 0
   - Increase to 0.8 or 1.0

2. **Check system volume**:
   - Ensure device volume is not muted
   - Check browser tab is not muted
   - Test audio in other tabs

3. **Select different voice**:
   - Open Settings
   - Try different voice from dropdown
   - Some voices may not be available

4. **Reload voices**:
   ```javascript
   // In console (F12)
   window.speechSynthesis.getVoices().forEach(v => console.log(v.name));
   ```

### Problem: Voice sounds weird / robotic

**Symptoms**:
- Unnatural intonation
- Too fast or too slow
- Incorrect pitch

**Solutions**:

1. **Adjust voice settings**:
   - Open Settings (⚙️ icon)
   - **Speech Rate**: Try 0.9-1.1 for more natural pace
   - **Pitch**: Try 1.0-1.2 for better tone
   - **Voice**: Select different voice profile

2. **Try premium voices**:
   - Google voices (if available)
   - Microsoft voices
   - Apple voices (on Mac/iOS)

---

## Conversation Issues

### Problem: Tessa doesn't respond

**Symptoms**:
- Message sent but no response
- Loading state never ends
- Error messages

**Solutions**:

1. **Check network connection**:
   ```bash
   # In browser console
   navigator.onLine  // Should return true
   ```

2. **Check Base44 API status**:
   - Verify Base44 platform is operational
   - Check for service outages

3. **Check browser console for errors**:
   - Open DevTools (F12)
   - Look for red error messages
   - Share errors with support if needed

4. **Clear conversation and retry**:
   - Refresh the page
   - Start new conversation
   - Check if problem persists

### Problem: Context is lost / Tessa forgets previous messages

**Symptoms**:
- Tessa doesn't remember earlier conversation
- Repeats information
- Asks same questions

**Solutions**:

1. **Check context window**:
   - By default, keeps last 6 messages
   - This is normal behavior for memory management

2. **Be explicit**:
   - Reference previous topics directly
   - Repeat important information
   - Ask "Do you remember when I said...?"

### Problem: Conversation history not saving

**Symptoms**:
- Messages disappear on refresh
- Can't see old conversations
- New conversation every time

**Solutions**:

1. **Check authentication**:
   - Ensure you're logged in
   - Verify token is valid

2. **Check Base44 connection**:
   - Network tab in DevTools
   - Look for failed API calls

3. **Clear cache and retry**:
   ```javascript
   // In console
   localStorage.clear();
   location.reload();
   // Re-login and test
   ```

---

## Performance Problems

### Problem: App is slow / laggy

**Symptoms**:
- Delayed responses
- UI freezes
- Slow page load

**Solutions**:

1. **Check system resources**:
   - Close unnecessary tabs
   - Free up RAM
   - Check CPU usage (Task Manager)

2. **Clear browser cache**:
   - Settings > Privacy > Clear browsing data
   - Select "Cached images and files"

3. **Disable browser extensions**:
   - Some extensions may interfere
   - Test in incognito/private mode

4. **Check bundle size**:
   ```bash
   npm run build
   # Check dist/assets/ folder size
   ```

### Problem: High CPU usage

**Symptoms**:
- Fan running constantly
- Battery drains quickly
- Browser becomes unresponsive

**Solutions**:

1. **Reduce particle effects**:
   - Future: Add setting to disable animations
   - Current: Accept as design limitation

2. **Close other tabs**:
   - Especially video/3D content
   - Free up browser resources

3. **Update browser**:
   - Ensure latest version installed
   - Newer versions have better performance

---

## Browser Compatibility

### Chrome/Edge Issues

**Minimum Version**: 88+

**Common Issues**:
- Outdated browser: Update to latest version
- Corporate restrictions: Contact IT dept

### Safari Issues

**Minimum Version**: 14.1+

**Common Issues**:
- Web Speech API limitations on older versions
- iCloud Private Relay may interfere with authentication

**Solutions**:
- Update macOS/iOS
- Disable Private Relay temporarily

### Firefox Issues

**Status**: Limited support

**Known Limitations**:
- No Web Speech Recognition API
- Speech synthesis only

**Solutions**:
- Use Chrome, Edge, or Safari instead
- Wait for Firefox to implement Web Speech API

---

## Network Issues

### Problem: "Failed to fetch" errors

**Symptoms**:
- API calls fail
- Network errors in console
- Can't connect to Base44

**Solutions**:

1. **Check internet connection**:
   ```bash
   ping base44.com
   ```

2. **Check firewall/proxy**:
   - Corporate firewalls may block requests
   - Try different network (mobile hotspot)

3. **Check CORS**:
   - Should be handled by Base44 SDK
   - Contact support if persists

4. **Verify API endpoints**:
   ```javascript
   // In console
   console.log(import.meta.env.VITE_BASE44_APP_ID);
   ```

### Problem: Slow API responses

**Symptoms**:
- Long wait times
- Timeout errors
- Poor LLM response time

**Solutions**:

1. **Check network speed**:
   - Run speed test
   - Ensure adequate bandwidth

2. **Reduce conversation context**:
   - Shorter messages
   - Fewer previous messages

3. **Try different time**:
   - May be peak usage times
   - Server load affects response time

---

## Advanced Debugging

### Enable Debug Logging

```javascript
// Add to src/lib/constants.js
export const DEBUG_MODE = true;

// Use in code
if (DEBUG_MODE) {
  console.log('Debug info:', data);
}
```

### Inspect Network Calls

1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Click on request to see details
5. Check Status, Headers, Response

### Check React Component State

```javascript
// Install React DevTools extension
// Inspect component state and props in DevTools
```

### Performance Profiling

1. Open DevTools (F12)
2. Go to Performance tab
3. Click Record
4. Interact with app
5. Stop recording
6. Analyze flame graph

### Memory Leaks

```javascript
// In DevTools > Memory tab
// Take heap snapshot before and after actions
// Compare snapshots to find leaks
```

### Analyze Bundle Size

```bash
# Build with analysis
npm run build -- --mode=analyze

# Or use source-map-explorer
npm install -g source-map-explorer
source-map-explorer dist/assets/*.js
```

---

## Common Error Messages

### "Failed to initialize conversation"

**Cause**: Can't connect to Base44 agents API

**Fix**:
1. Check authentication
2. Verify app permissions
3. Check network connection

### "Speech recognition error"

**Cause**: Browser can't access microphone or Web Speech API failed

**Fix**:
1. Grant microphone permission
2. Check browser compatibility
3. Try different browser

### "I'm having trouble processing that right now"

**Cause**: LLM API error or timeout

**Fix**:
1. Try again in a moment
2. Simplify your question
3. Check network connection

---

## Getting Help

### Before Asking for Help

1. ✅ Check this troubleshooting guide
2. ✅ Search existing GitHub issues
3. ✅ Enable debug logging and capture errors
4. ✅ Note your environment (OS, browser, version)
5. ✅ Try to reproduce the issue

### How to Report Issues

**Create GitHub Issue** with:

```markdown
**Environment**
- OS: [e.g., macOS 14.1]
- Browser: [e.g., Chrome 120]
- App Version: [e.g., 0.1.0]

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Screenshots**
If applicable

**Console Logs**
Paste relevant errors from console (F12)

**Additional Context**
Any other relevant information
```

### Support Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and community help
- **Email**: support@base44.com (for sensitive issues)

### Response Time

- Critical bugs: 24-48 hours
- Normal issues: 3-5 business days
- Feature requests: Reviewed monthly

---

## Prevention Tips

### Best Practices

1. **Keep app updated**: Use latest version
2. **Regular browser updates**: Ensure compatibility
3. **Clear cache periodically**: Prevent stale data issues
4. **Check system requirements**: Meet minimum specs
5. **Monitor console**: Catch issues early

### Maintenance

1. **Weekly**: Check for updates
2. **Monthly**: Clear cache and localStorage
3. **Quarterly**: Review and optimize settings
4. **As needed**: Report issues promptly

---

## Quick Reference

### Keyboard Shortcuts

*Note: Future feature*

### Useful Console Commands

```javascript
// Check authentication
localStorage.getItem('base44_access_token')

// List available voices
window.speechSynthesis.getVoices()

// Test microphone
navigator.mediaDevices.getUserMedia({ audio: true })

// Clear all data
localStorage.clear()
```

### Environment Variables

```env
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_FUNCTIONS_VERSION=prod
NODE_ENV=development|production
```

---

**Document Version**: 1.0
**Last Updated**: 2024-12-30
**Maintainer**: [@Krosebrook](https://github.com/Krosebrook)

**Have more questions?** Open an issue on GitHub or contact support!
