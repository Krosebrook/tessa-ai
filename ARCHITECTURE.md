# Tessa AI - Architecture Documentation

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Component Architecture](#component-architecture)
4. [Data Flow](#data-flow)
5. [State Management](#state-management)
6. [API Integration](#api-integration)
7. [Authentication](#authentication)
8. [Speech Processing](#speech-processing)
9. [UI/UX Architecture](#uiux-architecture)
10. [Performance Considerations](#performance-considerations)
11. [Security Architecture](#security-architecture)
12. [Scalability](#scalability)

---

## Overview

Tessa AI is a single-page application (SPA) built with React that provides a voice-activated personal assistant experience. The application leverages modern web APIs, particularly the Web Speech API, combined with Base44's AI platform for natural language understanding and conversational capabilities.

### Key Design Principles

- **Modularity**: Components are self-contained and reusable
- **Separation of Concerns**: Clear boundaries between UI, business logic, and data
- **Progressive Enhancement**: Core features work without optional enhancements
- **User-Centric Design**: Focus on intuitive voice interactions
- **Performance First**: Optimized for smooth animations and responsive interactions

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Web Speech   │  │   Canvas     │  │   Local      │     │
│  │     API      │  │   (Canvas)   │  │   Storage    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                   React Application Layer                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              App.jsx (Root Component)                  │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │          AuthProvider (Context)                  │ │ │
│  │  │  ┌────────────────────────────────────────────┐ │ │ │
│  │  │  │      QueryClientProvider                   │ │ │ │
│  │  │  │  ┌──────────────────────────────────────┐ │ │ │ │
│  │  │  │  │         Router                       │ │ │ │ │
│  │  │  │  │  ┌────────────────────────────────┐ │ │ │ │ │
│  │  │  │  │  │      Layout + Pages            │ │ │ │ │ │
│  │  │  │  │  └────────────────────────────────┘ │ │ │ │ │
│  │  │  │  └──────────────────────────────────────┘ │ │ │ │
│  │  │  └────────────────────────────────────────────┘ │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    Base44 Platform Layer                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    Agents    │  │   Entities   │  │      LLM     │     │
│  │ (Conversations)│  │(UserPrefs)  │  │ Integration  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack Layers

| Layer | Technologies | Purpose |
|-------|-------------|---------|
| **Build** | Vite, ESLint, PostCSS | Development tooling and build process |
| **UI Framework** | React 18, React Router | Component-based UI and routing |
| **Styling** | TailwindCSS, CSS-in-JS | Responsive styling and animations |
| **UI Components** | Radix UI, Custom components | Accessible, reusable components |
| **State** | React Context, TanStack Query | Global state and server state |
| **Backend** | Base44 SDK | AI services, authentication, data persistence |
| **Browser APIs** | Web Speech API, Canvas | Voice I/O and visual effects |

---

## Component Architecture

### Component Hierarchy

```
App
├── AuthProvider (Context)
│   └── QueryClientProvider
│       └── Router
│           ├── NavigationTracker
│           ├── VisualEditAgent
│           ├── Toaster
│           └── Routes
│               ├── Layout
│               │   └── ParticleBackground
│               └── Pages
│                   └── Tessa (Main Page)
│                       ├── HudCircle
│                       ├── TypingMessage (conditional)
│                       └── SettingsPanel (conditional)
```

### Core Components

#### 1. **App.jsx** (Root Component)
- **Responsibility**: Application bootstrap and provider setup
- **Features**:
  - Wraps app with AuthProvider for authentication state
  - Provides QueryClient for server state management
  - Sets up routing with React Router
  - Renders Toaster for notifications
  - Includes VisualEditAgent for Base44 integration

#### 2. **Tessa.jsx** (Main Page)
- **Responsibility**: Voice assistant interface and logic
- **State Management**:
  - Conversation history
  - Voice recognition state (listening/speaking)
  - User preferences
  - Processing status
- **Key Features**:
  - Initializes and manages Web Speech API
  - Handles voice input/output lifecycle
  - Manages conversation with Base44 Agents
  - Renders HUD and conversation UI
  
**Current Issues & Refactor Needs**:
- ⚠️ **Large component** (359 lines) - should be split
- ⚠️ **Multiple responsibilities** - mixing UI, logic, and API calls
- ⚠️ **State complexity** - 10+ useState hooks

**Recommended Refactor**:
```
Tessa.jsx (Orchestrator)
├── useTessaVoice.js (Hook - Voice I/O)
├── useTessaConversation.js (Hook - Conversation logic)
├── useTessaSettings.js (Hook - Settings management)
├── TessaHud.jsx (Component - Visual display)
├── ConversationView.jsx (Component - Message list)
└── SettingsPanel.jsx (Component - Already separated ✓)
```

#### 3. **Layout.jsx**
- **Responsibility**: Page layout and global styles
- **Features**:
  - Injects custom fonts and CSS variables
  - Renders ParticleBackground
  - Wraps page content

#### 4. **HudCircle.jsx**
- **Responsibility**: Animated status indicator
- **Props**: `status`, `isSpeaking`, `isListening`
- **Features**:
  - CSS-based animations (rotating rings)
  - Dynamic styling based on state
  - Pulse effects for active states

#### 5. **SettingsPanel.jsx**
- **Responsibility**: User preferences management
- **Features**:
  - Voice selection from system voices
  - Adjustable speech parameters (rate, pitch, volume)
  - Persistence via Base44 UserPreferences entity
  - Toast notifications for feedback

#### 6. **ParticleBackground.jsx**
- **Responsibility**: Animated visual background
- **Implementation**:
  - HTML Canvas API
  - Particle system with gradient effects
  - Responsive to window resize

#### 7. **TypingMessage.jsx**
- **Responsibility**: Animated text reveal
- **Features**:
  - Character-by-character animation
  - Callback on completion

### UI Component Library (49 components)

Located in `src/components/ui/`, these are Radix UI-based primitives:

**Key Components**:
- **Form Controls**: Button, Input, Select, Checkbox, Switch, Slider, Radio
- **Layout**: Card, Tabs, Accordion, Collapsible, Separator, Resizable
- **Overlays**: Dialog, Popover, Tooltip, Dropdown, HoverCard, Drawer
- **Feedback**: Toast, Alert Dialog, Progress, Skeleton
- **Navigation**: Breadcrumb, Menubar, Navigation Menu, Sidebar
- **Data**: Table, Chart, Calendar, Pagination

**Design System**:
- Consistent theming via CSS variables
- Dark mode support
- Accessible by default (ARIA compliant)
- Composable and customizable

---

## Data Flow

### Voice Interaction Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User speaks                                               │
└─────────────┬───────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. SpeechRecognition API captures audio                     │
│    - Continuous listening mode                               │
│    - Interim results disabled                                │
└─────────────┬───────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Transcript received (onresult event)                     │
│    - Add to conversation as user message                     │
│    - Stop recognition temporarily                            │
└─────────────┬───────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Process with Base44 AI                                   │
│    a. Get conversation from Base44 Agents                    │
│    b. Add user message to conversation                       │
│    c. Build context from last 6 messages                     │
│    d. Call Base44 LLM with context                           │
│    e. Get AI response                                        │
│    f. Save assistant message to conversation                 │
└─────────────┬───────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Display response                                          │
│    - Add to UI with typing animation                         │
└─────────────┬───────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Speak response                                            │
│    - Use SpeechSynthesis API                                 │
│    - Apply user voice settings                               │
└─────────────┬───────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. Resume listening (onend callback)                        │
│    - Start recognition again                                 │
│    - Wait for next user input                                │
└─────────────────────────────────────────────────────────────┘
```

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. App loads                                                 │
└─────────────┬───────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. AuthProvider.checkAppState()                             │
│    - Extract app_id and access_token from URL/localStorage   │
│    - Check app public settings                               │
└─────────────┬───────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Handle auth status                                        │
│    ├── No token → Show login required                       │
│    ├── Invalid token → Redirect to Base44 login             │
│    ├── User not registered → Show error message             │
│    └── Valid token → Proceed to app                         │
└─────────────┬───────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Fetch user with base44.auth.me()                         │
│    - Set user in context                                     │
│    - Set isAuthenticated = true                              │
└─────────────┬───────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Render authenticated app                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## State Management

### Global State (React Context)

#### AuthContext
- **Purpose**: Manage authentication state globally
- **State**:
  - `user`: Current authenticated user object
  - `isAuthenticated`: Boolean flag
  - `isLoadingAuth`: Loading state for auth check
  - `isLoadingPublicSettings`: Loading app settings
  - `authError`: Error object with type and message
  - `appPublicSettings`: App configuration
- **Methods**:
  - `logout()`: Clear auth and redirect
  - `navigateToLogin()`: Redirect to Base44 login
  - `checkAppState()`: Verify authentication status

### Server State (TanStack Query)

- **Configuration**: `src/lib/query-client.js`
- **Usage**: Currently minimal, but provides foundation for:
  - Caching API responses
  - Background data refetching
  - Optimistic updates
  - Request deduplication

### Local Component State

**Tessa.jsx State**:
- `conversation`: Array of message objects
- `tessaStatus`: String status message
- `isListening`: Boolean for recognition active
- `isSpeaking`: Boolean for synthesis active
- `currentMessage`: String for typing animation
- `tessaVoice`: Selected voice object
- `isProcessing`: Boolean for AI processing
- `conversationId`: Base44 conversation ID
- `showSettings`: Boolean for settings panel
- `voiceSettings`: Object with rate, pitch, volume

**Optimization Opportunities**:
- Use `useReducer` for complex state updates
- Extract voice logic to custom hook
- Memoize expensive computations with `useMemo`
- Prevent unnecessary re-renders with `useCallback`

---

## API Integration

### Base44 SDK

**Initialization** (`src/api/base44Client.js`):
```javascript
const base44 = createClient({
  appId,              // From env or URL param
  token,              // From URL param or localStorage
  functionsVersion,   // 'prod' or 'dev'
  serverUrl: '',      // Default Base44 server
  requiresAuth: false // Handle auth manually
});
```

**Key APIs Used**:

#### 1. **Agents API**
- `base44.agents.listConversations()`: Get user conversations
- `base44.agents.createConversation()`: Start new conversation
- `base44.agents.getConversation(id)`: Fetch conversation details
- `base44.agents.addMessage(conversation, message)`: Append message

**Purpose**: Manage persistent conversation history

#### 2. **Entities API**
- `base44.entities.UserPreferences.list()`: Get user settings
- `base44.entities.UserPreferences.create(prefs)`: Save new settings
- `base44.entities.UserPreferences.update(id, prefs)`: Update settings

**Purpose**: Store and retrieve user preferences

#### 3. **Integrations API**
- `base44.integrations.Core.InvokeLLM(params)`: Call LLM

**Parameters**:
- `prompt`: Full prompt with context
- `add_context_from_internet`: Boolean (currently false)

**Purpose**: Get AI-generated responses

#### 4. **Auth API**
- `base44.auth.me()`: Get current user
- `base44.auth.logout()`: Clear token and redirect
- `base44.auth.redirectToLogin(returnUrl)`: Navigate to login

---

## Authentication

### Token Flow

1. **Initial Access**:
   - User visits Base44 platform
   - Clicks on Tessa app
   - Redirected to app URL with `?access_token=...&app_id=...`

2. **Token Storage**:
   - `app-params.js` extracts token from URL
   - Stores in localStorage as `base44_access_token`
   - Removes token from URL for security

3. **Token Usage**:
   - Included in all Base44 API requests via SDK
   - Used to authenticate user and authorize app access

4. **Token Validation**:
   - AuthProvider checks on app load
   - Validates with `auth.me()` call
   - Handles expired or invalid tokens

5. **Error Handling**:
   - `auth_required`: No token present
   - `user_not_registered`: Valid token but user not registered for app
   - `403/401 errors`: Invalid or expired token

---

## Speech Processing

### Web Speech API Integration

#### SpeechRecognition Setup

```javascript
const SpeechRecognition = window.SpeechRecognition || 
                         window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;      // Keep listening
recognition.lang = 'en-US';         // Language
recognition.interimResults = false; // Only final results
```

**Event Handlers**:
- `onresult`: Transcript received
- `onerror`: Handle errors (no-speech, aborted, network)
- `onend`: Recognition stopped (restart if needed)

**Lifecycle**:
1. `recognition.start()` - Begin listening
2. User speaks
3. `onresult` - Get transcript
4. `recognition.stop()` - Temporarily stop
5. Process and respond
6. Resume listening after response

#### SpeechSynthesis Setup

```javascript
const synth = window.speechSynthesis;
const utterance = new SpeechSynthesisUtterance(text);
utterance.voice = selectedVoice;
utterance.pitch = voiceSettings.pitch;
utterance.rate = voiceSettings.speech_rate;
utterance.volume = voiceSettings.volume;
```

**Event Handlers**:
- `onstart`: Speaking began
- `onend`: Speaking finished (callback to resume listening)

**Voice Selection**:
- Load available voices with `synth.getVoices()`
- Prefer: Google US English Female, Samantha, or any English female
- Fall back to any English voice
- Store preference in UserPreferences

---

## UI/UX Architecture

### Visual Design System

**Color Palette**:
```css
--background-dark: #0f0618;      /* Deep purple-black */
--glow-purple: #a855f7;          /* Primary accent */
--glow-rose: #f472b6;            /* Secondary accent */
--text-primary: #f3e8ff;         /* Light purple-white */
--text-secondary: #d8b4fe;       /* Medium purple */
--border-color: rgba(168, 85, 247, 0.2); /* Translucent purple */
```

**Typography**:
- Headings: 'Poppins' (300, 400, 600, 700)
- Body: 'Inter' (300, 400)

**Animations**:
1. **HUD Rings**: Continuous rotation (20s, 30s, 15s)
2. **Core Pulse**: Scale and opacity animation (4s)
3. **Speaking Pulse**: Faster pulse during speech (1.5s)
4. **Particles**: Canvas-based motion with gradients
5. **Typing Effect**: Character-by-character reveal

### Responsive Design

**Breakpoints** (TailwindCSS):
- `sm`: 640px - Small tablets
- `md`: 768px - Tablets (HUD resizes 300px → 450px)
- `lg`: 1024px - Small desktops
- `xl`: 1280px - Large desktops

**Mobile Considerations**:
- Voice input may require user gesture on iOS
- Particle count scales with screen size
- Messages scroll within viewport

---

## Performance Considerations

### Current Performance

**Strengths**:
- ✅ Vite for fast HMR and build
- ✅ Code splitting via React Router
- ✅ TailwindCSS purging for small CSS bundle
- ✅ Canvas rendering offloaded to GPU

**Optimization Opportunities**:

1. **Component Memoization**:
   ```javascript
   const HudCircle = React.memo(({ status, isSpeaking, isListening }) => {
     // Only re-render when props change
   });
   ```

2. **Lazy Loading**:
   ```javascript
   const SettingsPanel = React.lazy(() => 
     import('./components/tessa/SettingsPanel')
   );
   ```

3. **Debounce Voice Settings**:
   - Avoid saving to API on every slider change
   - Debounce to 500ms after last change

4. **Virtual Scrolling**:
   - For long conversation histories
   - Use `react-window` or `react-virtualized`

5. **Bundle Analysis**:
   ```bash
   npm run build -- --mode analyze
   ```
   - Identify large dependencies
   - Consider alternatives or code splitting

### Current Bundle Size

**Estimated Production Bundle**:
- **Vendor**: ~500KB (React, Radix UI, TanStack Query)
- **App Code**: ~100KB
- **Total**: ~600KB (gzipped: ~180KB)

**Largest Dependencies**:
- Radix UI components (multiple packages)
- Base44 SDK
- React ecosystem

---

## Security Architecture

### Current Security Measures

1. **Token Handling**:
   - ✅ Tokens removed from URL immediately
   - ✅ Stored in localStorage (not cookies for XSS protection)
   - ✅ Sent only to Base44 API (not third parties)
   - ✅ HTTPS enforced in production

2. **Input Validation**:
   - ✅ User messages sanitized by Base44 backend
   - ⚠️ Could add frontend validation for length limits

3. **Authentication**:
   - ✅ Token-based authentication via Base44
   - ✅ Automatic token refresh handled by SDK
   - ✅ Proper error handling for auth failures

4. **Environment Variables**:
   - ✅ Sensitive data in `.env` (gitignored)
   - ✅ Only `VITE_*` vars exposed to client
   - ✅ No hardcoded secrets in code

### Security Recommendations

1. **Content Security Policy (CSP)**:
   ```html
   <meta http-equiv="Content-Security-Policy" 
         content="default-src 'self'; 
                  script-src 'self' 'unsafe-inline'; 
                  style-src 'self' 'unsafe-inline';">
   ```

2. **Rate Limiting**:
   - Implement client-side throttling for API calls
   - Prevent abuse of LLM integration

3. **Input Sanitization**:
   ```javascript
   const sanitizeInput = (text) => {
     return text.trim().slice(0, 500); // Max 500 chars
   };
   ```

4. **Error Handling**:
   - Never expose sensitive error details to UI
   - Log errors securely for debugging

---

## Scalability

### Current Architecture Scalability

**Strengths**:
- ✅ Stateless frontend (scales horizontally)
- ✅ Base44 handles backend scaling
- ✅ CDN-ready static assets

**Limitations**:
- ⚠️ Web Speech API is client-side only (no server scaling)
- ⚠️ Canvas rendering on single thread
- ⚠️ No caching strategy for LLM responses

### Scaling Strategies

#### 1. **Vertical Scaling** (Single User Experience)
- Optimize component rendering
- Implement virtual scrolling for long conversations
- Use Web Workers for heavy computations

#### 2. **Horizontal Scaling** (Multiple Users)
- CDN distribution for static assets
- Edge caching for API responses
- Load balancing (handled by Base44)

#### 3. **Feature Scaling**
- Lazy load non-essential features
- Progressive Web App (PWA) for offline support
- Service Worker for caching

#### 4. **Data Scaling**
- Paginate conversation history
- Implement conversation archiving
- Compress old messages

---

## Future Architecture Considerations

### Planned Improvements

1. **Microservices Architecture**:
   - Separate voice processing service
   - Dedicated LLM service
   - Analytics service

2. **Real-time Features**:
   - WebSocket for instant updates
   - Multi-device sync
   - Collaborative conversations

3. **Advanced AI**:
   - Streaming LLM responses
   - Emotion detection in voice
   - Personality customization

4. **Mobile Native**:
   - React Native app
   - Native speech APIs
   - Background listening

5. **Accessibility**:
   - Screen reader support
   - Keyboard shortcuts
   - High contrast mode

---

## Conclusion

Tessa AI's architecture is built on solid foundations with React, modern web APIs, and Base44's AI platform. The current implementation prioritizes user experience and rapid development. As the project evolves, the architecture will scale to support advanced features, better performance, and enterprise-grade reliability.

**Key Takeaways**:
- ✅ Well-structured component hierarchy
- ✅ Clear separation between UI and logic
- ⚠️ Needs refactoring for better modularity
- ✅ Secure authentication and token handling
- ✅ Scalable backend via Base44
- 🚀 Ready for feature expansion and optimization

For implementation details of specific features, see the corresponding documentation files (agents.md, claude.md, gemini.md).
