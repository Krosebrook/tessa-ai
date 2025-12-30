# Architecture Documentation

## System Overview

Tessa AI is a modern, cloud-connected voice assistant application built with a focus on real-time interaction, scalability, and user experience. The architecture follows a component-based design pattern with clear separation of concerns.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser Client                       │
│  ┌────────────────────────────────────────────────────┐ │
│  │              React Application                      │ │
│  │  ┌──────────────┐  ┌──────────────┐               │ │
│  │  │   UI Layer   │  │ State Layer  │               │ │
│  │  │              │  │              │               │ │
│  │  │  Components  │←→│ React Context│               │ │
│  │  │              │  │ React Query  │               │ │
│  │  └──────────────┘  └──────┬───────┘               │ │
│  │                            ↓                        │ │
│  │                  ┌─────────────────┐               │ │
│  │                  │  Service Layer  │               │ │
│  │                  │                 │               │ │
│  │                  │  Base44 SDK     │               │ │
│  │                  └────────┬────────┘               │ │
│  └───────────────────────────┼─────────────────────────┘ │
│                               ↓                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │           Browser APIs                             │  │
│  │  • Web Speech API (Recognition & Synthesis)       │  │
│  │  • LocalStorage (Preferences & Tokens)            │  │
│  │  • WebGL (Particle Effects)                       │  │
│  └───────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS
                         ↓
┌─────────────────────────────────────────────────────────┐
│                   Base44 Platform                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────────┐   │
│  │    Auth    │  │   Agents   │  │   Entities     │   │
│  │  Service   │  │  Service   │  │   Service      │   │
│  └────────────┘  └────────────┘  └────────────────┘   │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │           LLM Integration Layer                 │    │
│  │  (OpenAI, Anthropic, etc.)                     │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## Layer Architecture

### 1. Presentation Layer

**Purpose**: User interface and visual components

**Technology**:
- React 18 with functional components and hooks
- TailwindCSS for utility-first styling
- Radix UI for accessible primitives
- Three.js for 3D particle effects

**Key Components**:

```
src/
├── Layout.jsx                  # Global layout with particle background
├── pages/
│   └── Tessa.jsx              # Main assistant interface
└── components/
    ├── tessa/
    │   ├── HudCircle.jsx      # Animated HUD visualization
    │   ├── SettingsPanel.jsx  # User preferences UI
    │   ├── TypingMessage.jsx  # Typing animation
    │   └── ParticleBackground.jsx  # 3D particle system
    └── ui/
        └── [radix-components] # Reusable UI primitives
```

**Design Patterns**:
- **Component Composition**: Building complex UIs from simple components
- **Render Props**: For flexible component behavior
- **Hooks**: For state and lifecycle management
- **CSS-in-JS**: Inline styles for dynamic theming

### 2. State Management Layer

**Purpose**: Manage application and server state

**Technologies**:
- **React Context**: Global state (auth, settings)
- **React Query**: Server state caching and synchronization
- **Local State**: Component-specific state with useState/useReducer

**State Organization**:

```javascript
// Auth Context (Global)
{
  user: User | null,
  isAuthenticated: boolean,
  isLoadingAuth: boolean,
  authError: Error | null,
  appPublicSettings: object
}

// Tessa Page State (Local)
{
  conversation: Message[],
  conversationId: string,
  isListening: boolean,
  isSpeaking: boolean,
  isProcessing: boolean,
  voiceSettings: VoiceSettings,
  tessaVoice: SpeechSynthesisVoice,
  tessaStatus: string
}

// React Query Cache (Server State)
- UserPreferences
- Conversations
- User Profile
```

**State Flow**:
```
User Action → State Update → Component Re-render
     ↓
Server Sync (React Query)
     ↓
Cache Update → Optimistic UI Update
```

### 3. Service Layer

**Purpose**: Business logic and external service integration

**Base44 SDK**:
```javascript
// src/api/base44Client.js
export const base44 = createClient({
  appId: string,
  token: string,
  functionsVersion: string,
  requiresAuth: boolean
});

// Available Services
base44.auth.*         // Authentication
base44.agents.*       // Agent conversations
base44.entities.*     // Data persistence
base44.integrations.* // External services (LLM, etc.)
```

**Service Interfaces**:

1. **Authentication Service**
   ```javascript
   - me(): Promise<User>
   - logout(redirectUrl?: string): void
   - redirectToLogin(returnUrl: string): void
   ```

2. **Agent Service**
   ```javascript
   - listConversations(query): Promise<Conversation[]>
   - getConversation(id): Promise<Conversation>
   - createConversation(data): Promise<Conversation>
   - addMessage(conversation, message): Promise<void>
   ```

3. **Entity Service**
   ```javascript
   - UserPreferences.list(): Promise<Preferences[]>
   - UserPreferences.create(data): Promise<Preferences>
   - UserPreferences.update(id, data): Promise<Preferences>
   ```

4. **LLM Integration Service**
   ```javascript
   - Core.InvokeLLM(options): Promise<string>
   ```

### 4. Data Layer

**Purpose**: Data models and persistence

**Entities**:

1. **User**
   ```typescript
   interface User {
     id: string;
     email: string;
     full_name: string;
     created_at: string;
     updated_at: string;
   }
   ```

2. **Conversation**
   ```typescript
   interface Conversation {
     id: string;
     agent_name: string;
     messages: Message[];
     metadata: {
       name: string;
       description: string;
     };
     created_at: string;
     updated_at: string;
   }
   ```

3. **Message**
   ```typescript
   interface Message {
     role: 'user' | 'assistant';
     content: string;
     timestamp?: string;
   }
   ```

4. **UserPreferences**
   ```typescript
   interface UserPreferences {
     id: string;
     user_id: string;
     preferred_name: string;
     location: string;
     timezone: string;
     voice_settings: VoiceSettings;
     created_at: string;
     updated_at: string;
   }
   ```

5. **VoiceSettings**
   ```typescript
   interface VoiceSettings {
     speech_rate: number;  // 0.5 - 2.0
     pitch: number;        // 0.5 - 2.0
     volume: number;       // 0.0 - 1.0
     preferred_voice_name: string;
   }
   ```

### 5. Integration Layer

**Purpose**: External API and browser API integration

**Browser APIs**:

1. **Web Speech Recognition API**
   ```javascript
   const recognition = new SpeechRecognition();
   recognition.continuous = true;
   recognition.lang = 'en-US';
   recognition.interimResults = false;
   
   recognition.onresult = (event) => { /* ... */ };
   recognition.onerror = (event) => { /* ... */ };
   ```

2. **Web Speech Synthesis API**
   ```javascript
   const synth = window.speechSynthesis;
   const utterance = new SpeechSynthesisUtterance(text);
   utterance.voice = selectedVoice;
   utterance.pitch = 1.1;
   utterance.rate = 1.0;
   synth.speak(utterance);
   ```

3. **LocalStorage API**
   ```javascript
   // Token and app params storage
   localStorage.setItem('base44_access_token', token);
   localStorage.getItem('base44_app_id');
   ```

**External Services**:
- Base44 Platform (REST API)
- LLM Services (via Base44)

## Data Flow

### User Interaction Flow

```
1. User Speaks
   ↓
2. Speech Recognition captures audio
   ↓
3. Transcript generated
   ↓
4. Add to conversation (UI update)
   ↓
5. Send to Base44 Agent with context
   ↓
6. LLM processes and generates response
   ↓
7. Response stored in conversation
   ↓
8. UI updates with typing animation
   ↓
9. Speech Synthesis speaks response
   ↓
10. Listening resumes
```

### Authentication Flow

```
1. App loads → Check URL params for token
   ↓
2. Store token in localStorage
   ↓
3. Fetch app public settings
   ↓
4. Initialize Base44 client with token
   ↓
5. Call auth.me() to validate user
   ↓
6. Store user in AuthContext
   ↓
7. Render authenticated app
```

### Settings Update Flow

```
1. User modifies settings in SettingsPanel
   ↓
2. Local state updates (immediate UI feedback)
   ↓
3. Save button clicked
   ↓
4. Check if preferences exist
   ↓
5. Create or update via Base44 entities API
   ↓
6. Callback to parent component
   ↓
7. Apply voice settings to synthesis
   ↓
8. Show success toast
```

## Routing Architecture

**Router**: React Router v6

**Route Structure**:
```javascript
<Routes>
  <Route path="/" element={<Layout><Tessa /></Layout>} />
  {/* Additional pages can be added dynamically from pages.config.js */}
  <Route path="*" element={<PageNotFound />} />
</Routes>
```

**Dynamic Page Configuration**:
```javascript
// src/pages.config.js
export const pagesConfig = {
  mainPage: "Tessa",
  Pages: {
    "Tessa": TessaComponent
  },
  Layout: LayoutComponent
};
```

## Security Architecture

### Authentication

1. **Token-Based Auth**
   - JWT tokens from Base44 platform
   - Stored in localStorage
   - Included in all API requests via SDK

2. **Token Lifecycle**
   - Obtained via OAuth flow (external to app)
   - Passed as URL parameter
   - Stored for subsequent sessions
   - Validated on each API call
   - Expired tokens trigger re-login

### Authorization

- User permissions managed by Base44 platform
- App-level access control via public settings
- Entity-level permissions enforced server-side

### Data Security

1. **Transport Security**
   - All API calls over HTTPS
   - TLS 1.3 for encryption

2. **Storage Security**
   - Tokens in localStorage (XSS protection needed)
   - No sensitive data in sessionStorage
   - User preferences encrypted at rest (Base44)

3. **Input Validation**
   - Client-side validation for UX
   - Server-side validation enforced by Base44
   - Sanitization before LLM processing

### Security Best Practices

- **No hardcoded credentials**: All config from environment
- **CORS**: Properly configured on Base44 platform
- **CSP**: Content Security Policy headers
- **XSS Protection**: React's built-in escaping
- **Dependency Scanning**: Regular npm audit

## Performance Architecture

### Optimization Strategies

1. **Code Splitting**
   - Vite's automatic chunking
   - Future: Route-based splitting with React.lazy

2. **Caching**
   - React Query cache (5 minutes default)
   - Browser cache for static assets
   - Service Worker (future)

3. **Rendering Optimization**
   - React.memo for expensive components
   - useMemo for expensive computations
   - useCallback for stable function references
   - Virtual scrolling for long conversation lists (future)

4. **Asset Optimization**
   - Vite minification and tree-shaking
   - Image optimization (future: next/image alternative)
   - Font subsetting

5. **Network Optimization**
   - HTTP/2 multiplexing
   - Gzip/Brotli compression
   - CDN for static assets (future)

### Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| First Contentful Paint | < 1.5s | ~1.2s |
| Time to Interactive | < 3.0s | ~2.8s |
| Largest Contentful Paint | < 2.5s | ~2.0s |
| Cumulative Layout Shift | < 0.1 | ~0.05 |
| First Input Delay | < 100ms | ~50ms |
| Bundle Size (gzipped) | < 500KB | ~450KB |

## Scalability Considerations

### Frontend Scalability

1. **Component Reusability**
   - Radix UI primitives
   - Custom wrapper components
   - Shared utility functions

2. **State Management**
   - Context for global state
   - Local state for component isolation
   - React Query for server state

3. **Code Organization**
   - Feature-based folder structure
   - Clear separation of concerns
   - Modular imports

### Backend Scalability

*Handled by Base44 Platform*:
- Auto-scaling infrastructure
- Load balancing
- Database optimization
- CDN distribution

## Deployment Architecture

### Build Process

```bash
npm run build
  ↓
Vite build
  ↓
- Transpile TypeScript/JSX
- Minify code
- Generate source maps
- Optimize assets
- Create manifest
  ↓
Output to dist/
```

### Deployment Options

1. **Static Hosting**
   - Vercel (recommended)
   - Netlify
   - GitHub Pages
   - AWS S3 + CloudFront

2. **Container Deployment**
   - Docker container with nginx
   - Kubernetes for orchestration

3. **Environment Configuration**
   ```
   .env.production
   ├── VITE_BASE44_APP_ID
   └── VITE_BASE44_FUNCTIONS_VERSION
   ```

## Monitoring & Observability

### Planned Implementations

1. **Error Tracking**
   - Sentry for error reporting
   - Custom error boundaries

2. **Analytics**
   - User interaction tracking
   - Conversation metrics
   - Performance monitoring

3. **Logging**
   - Structured console logging
   - Server-side log aggregation
   - Debug mode toggle

## Testing Strategy

### Planned Test Pyramid

```
        E2E Tests (10%)
       /              \
      /   Integration   \
     /    Tests (30%)    \
    /____________________\
    
     Unit Tests (60%)
```

1. **Unit Tests**
   - Component rendering
   - Hook behavior
   - Utility functions
   - State management

2. **Integration Tests**
   - User flows
   - API interactions
   - Browser API mocking

3. **E2E Tests**
   - Critical user journeys
   - Cross-browser testing
   - Voice interaction scenarios

## Future Architecture Enhancements

### Short-Term (1-3 months)

- [ ] Error boundary components
- [ ] Service Worker for offline support
- [ ] Progressive Web App (PWA) capabilities
- [ ] Route-based code splitting
- [ ] Component library storybook

### Mid-Term (3-6 months)

- [ ] Real-time WebSocket for instant responses
- [ ] Multi-language support (i18n)
- [ ] Advanced caching strategies
- [ ] Performance monitoring dashboard
- [ ] A/B testing framework

### Long-Term (6-12 months)

- [ ] Micro-frontend architecture
- [ ] Server-Side Rendering (SSR)
- [ ] Edge computing for low latency
- [ ] GraphQL API layer
- [ ] Native mobile apps (React Native)

---

**Document Version**: 1.0
**Last Updated**: 2024-12-30
**Maintainer**: [@Krosebrook](https://github.com/Krosebrook)
