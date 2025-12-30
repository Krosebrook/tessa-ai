# API Documentation

This document describes the internal APIs and integration points used in Tessa AI.

## Table of Contents

- [Base44 SDK Integration](#base44-sdk-integration)
- [Authentication API](#authentication-api)
- [Agents API](#agents-api)
- [Entities API](#entities-api)
- [LLM Integration API](#llm-integration-api)
- [Browser APIs](#browser-apis)
- [Custom Hooks API](#custom-hooks-api)
- [Component APIs](#component-apis)

---

## Base44 SDK Integration

### Client Configuration

**File**: `src/api/base44Client.js`

```javascript
import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

export const base44 = createClient({
  appId: string,              // Base44 app identifier
  token: string,              // JWT authentication token
  functionsVersion: string,   // API version (e.g., 'prod')
  serverUrl: string,          // Base URL (empty for default)
  requiresAuth: boolean       // Whether auth is required
});
```

**Usage**:
```javascript
import { base44 } from '@/api/base44Client';

// Use in components or services
const user = await base44.auth.me();
```

---

## Authentication API

### `base44.auth`

#### `me()`

Get current authenticated user information.

**Returns**: `Promise<User>`

```typescript
interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
}
```

**Example**:
```javascript
const user = await base44.auth.me();
console.log(user.full_name);
```

**Errors**:
- `401`: Unauthorized (invalid or expired token)
- `403`: Forbidden (user not registered for app)

---

#### `logout(redirectUrl?: string)`

Logout user and optionally redirect.

**Parameters**:
- `redirectUrl` (optional): URL to redirect after logout

**Returns**: `void`

**Example**:
```javascript
// Logout and redirect to current page
base44.auth.logout(window.location.href);

// Logout without redirect
base44.auth.logout();
```

---

#### `redirectToLogin(returnUrl: string)`

Redirect user to login page.

**Parameters**:
- `returnUrl`: URL to return to after login

**Returns**: `void`

**Example**:
```javascript
base44.auth.redirectToLogin(window.location.href);
```

---

## Agents API

### `base44.agents`

#### `listConversations(query)`

List conversations for the current user.

**Parameters**:
```typescript
interface ConversationQuery {
  agent_name: string;        // Filter by agent name
  limit?: number;            // Max results (default: 50)
  offset?: number;           // Pagination offset
}
```

**Returns**: `Promise<Conversation[]>`

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

**Example**:
```javascript
const conversations = await base44.agents.listConversations({
  agent_name: 'tessa_assistant',
  limit: 10
});
```

---

#### `getConversation(id)`

Get a specific conversation by ID.

**Parameters**:
- `id`: Conversation UUID

**Returns**: `Promise<Conversation>`

**Example**:
```javascript
const conversation = await base44.agents.getConversation(conversationId);
console.log(conversation.messages);
```

**Errors**:
- `404`: Conversation not found
- `403`: Not authorized to access conversation

---

#### `createConversation(data)`

Create a new conversation.

**Parameters**:
```typescript
interface CreateConversationRequest {
  agent_name: string;
  metadata?: {
    name?: string;
    description?: string;
    [key: string]: any;
  };
}
```

**Returns**: `Promise<Conversation>`

**Example**:
```javascript
const conversation = await base44.agents.createConversation({
  agent_name: 'tessa_assistant',
  metadata: {
    name: 'Tessa Session',
    description: 'Personal assistant session'
  }
});
```

---

#### `addMessage(conversation, message)`

Add a message to a conversation.

**Parameters**:
```typescript
conversation: Conversation;  // Conversation object from getConversation()

interface Message {
  role: 'user' | 'assistant';
  content: string;
}
```

**Returns**: `Promise<void>`

**Example**:
```javascript
const conversation = await base44.agents.getConversation(conversationId);

await base44.agents.addMessage(conversation, {
  role: 'user',
  content: 'Hello, Tessa!'
});

await base44.agents.addMessage(conversation, {
  role: 'assistant',
  content: 'Hi! How can I help you today?'
});
```

---

## Entities API

### `base44.entities.UserPreferences`

#### `list()`

Get all user preferences for the current user.

**Returns**: `Promise<UserPreferences[]>`

```typescript
interface UserPreferences {
  id: string;
  user_id: string;
  preferred_name: string;
  location: string;
  timezone: string;
  voice_settings: {
    speech_rate: number;
    pitch: number;
    volume: number;
    preferred_voice_name: string;
  };
  created_at: string;
  updated_at: string;
}
```

**Example**:
```javascript
const preferences = await base44.entities.UserPreferences.list();
if (preferences.length > 0) {
  console.log(preferences[0].voice_settings);
}
```

---

#### `create(data)`

Create new user preferences.

**Parameters**:
```typescript
interface CreatePreferencesRequest {
  preferred_name?: string;
  location?: string;
  timezone?: string;
  voice_settings?: {
    speech_rate?: number;
    pitch?: number;
    volume?: number;
    preferred_voice_name?: string;
  };
}
```

**Returns**: `Promise<UserPreferences>`

**Example**:
```javascript
const preferences = await base44.entities.UserPreferences.create({
  preferred_name: 'John',
  location: 'San Francisco, CA',
  voice_settings: {
    speech_rate: 1.0,
    pitch: 1.1,
    volume: 1.0
  }
});
```

---

#### `update(id, data)`

Update existing user preferences.

**Parameters**:
- `id`: Preferences UUID
- `data`: Partial preferences object

**Returns**: `Promise<UserPreferences>`

**Example**:
```javascript
const updated = await base44.entities.UserPreferences.update(prefsId, {
  voice_settings: {
    speech_rate: 1.2,
    pitch: 1.0,
    volume: 0.9,
    preferred_voice_name: 'Google US English Female'
  }
});
```

---

## LLM Integration API

### `base44.integrations.Core.InvokeLLM(options)`

Invoke LLM for text generation.

**Parameters**:
```typescript
interface InvokeLLMRequest {
  prompt: string;                      // Text prompt for LLM
  add_context_from_internet?: boolean; // Enable web search
  temperature?: number;                // Creativity (0-1)
  max_tokens?: number;                 // Max response length
  model?: string;                      // Specific model to use
}
```

**Returns**: `Promise<string>`

**Example**:
```javascript
const response = await base44.integrations.Core.InvokeLLM({
  prompt: `You are Tessa, a helpful assistant.
  
  User: What's the weather like today?
  
  Respond naturally and helpfully.`,
  add_context_from_internet: false,
  temperature: 0.7,
  max_tokens: 150
});

console.log(response);
```

**Errors**:
- `400`: Invalid prompt or parameters
- `429`: Rate limit exceeded
- `500`: LLM service error
- `504`: Request timeout

---

## Browser APIs

### Web Speech Recognition

**Browser Support**: Chrome, Edge, Safari 14.1+

```typescript
interface SpeechRecognitionConfig {
  continuous: boolean;        // Continue listening
  lang: string;              // Language (e.g., 'en-US')
  interimResults: boolean;   // Return partial results
  maxAlternatives: number;   // Max alternative transcripts
}
```

**Example**:
```javascript
const recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.lang = 'en-US';
recognition.interimResults = false;

recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  console.log('You said:', transcript);
};

recognition.onerror = (event) => {
  console.error('Recognition error:', event.error);
};

recognition.start();
```

---

### Web Speech Synthesis

**Browser Support**: All modern browsers

```typescript
interface SpeechSynthesisConfig {
  voice: SpeechSynthesisVoice | null;
  pitch: number;    // 0.5 - 2.0
  rate: number;     // 0.5 - 2.0
  volume: number;   // 0.0 - 1.0
}
```

**Example**:
```javascript
const synth = window.speechSynthesis;
const utterance = new SpeechSynthesisUtterance('Hello, I am Tessa!');

// Get available voices
const voices = synth.getVoices();
utterance.voice = voices[0];

// Configure speech
utterance.pitch = 1.1;
utterance.rate = 1.0;
utterance.volume = 1.0;

// Event handlers
utterance.onstart = () => console.log('Speaking...');
utterance.onend = () => console.log('Finished speaking');
utterance.onerror = (e) => console.error('Speech error:', e);

// Speak
synth.speak(utterance);
```

---

## Custom Hooks API

### `useSpeechRecognition(options)`

**File**: `src/hooks/useSpeechRecognition.js`

Custom hook for speech recognition.

**Parameters**:
```typescript
interface UseSpeechRecognitionOptions {
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
}
```

**Returns**:
```typescript
interface UseSpeechRecognitionReturn {
  isListening: boolean;
  isSupported: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
}
```

**Example**:
```javascript
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

const MyComponent = () => {
  const { isListening, isSupported, start, stop } = useSpeechRecognition({
    onResult: (transcript) => {
      console.log('User said:', transcript);
    },
    onError: (error) => {
      console.error('Recognition error:', error);
    }
  });

  return (
    <button onClick={isListening ? stop : start}>
      {isListening ? 'Stop' : 'Start'} Listening
    </button>
  );
};
```

---

### `useSpeechSynthesis(options)`

**File**: `src/hooks/useSpeechSynthesis.js`

Custom hook for speech synthesis.

**Parameters**:
```typescript
interface UseSpeechSynthesisOptions {
  voiceSettings?: {
    speech_rate?: number;
    pitch?: number;
    volume?: number;
    preferred_voice_name?: string;
  };
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}
```

**Returns**:
```typescript
interface UseSpeechSynthesisReturn {
  isSpeaking: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  setSelectedVoice: (voice: SpeechSynthesisVoice) => void;
  speak: (text: string, options?: { onComplete?: () => void }) => void;
  cancel: () => void;
  pause: () => void;
  resume: () => void;
}
```

**Example**:
```javascript
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

const MyComponent = () => {
  const { isSpeaking, speak, cancel } = useSpeechSynthesis({
    voiceSettings: {
      speech_rate: 1.0,
      pitch: 1.1,
      volume: 1.0
    },
    onStart: () => console.log('Started speaking'),
    onEnd: () => console.log('Finished speaking')
  });

  const handleSpeak = () => {
    speak('Hello, I am Tessa!', {
      onComplete: () => {
        console.log('Speech complete');
      }
    });
  };

  return (
    <button onClick={isSpeaking ? cancel : handleSpeak}>
      {isSpeaking ? 'Stop' : 'Speak'}
    </button>
  );
};
```

---

### `useConversation(agentName)`

**File**: `src/hooks/useConversation.js`

Custom hook for conversation management.

**Parameters**:
- `agentName`: Agent identifier (default: 'tessa_assistant')

**Returns**:
```typescript
interface UseConversationReturn {
  conversation: Message[];
  conversationId: string | null;
  isLoading: boolean;
  error: Error | null;
  addMessage: (sender: string, text: string, isTyping?: boolean) => void;
  addUserMessage: (text: string) => Promise<void>;
  addAssistantMessage: (text: string, isTyping?: boolean) => Promise<void>;
  saveMessage: (role: 'user' | 'assistant', content: string) => Promise<void>;
  getContext: (messageCount?: number) => ContextMessage[];
  clearConversation: () => void;
  createNewConversation: () => Promise<void>;
}
```

**Example**:
```javascript
import { useConversation } from '@/hooks/useConversation';

const MyComponent = () => {
  const {
    conversation,
    isLoading,
    addUserMessage,
    addAssistantMessage,
    getContext
  } = useConversation('tessa_assistant');

  const handleUserInput = async (text) => {
    // Add user message
    await addUserMessage(text);

    // Get conversation context
    const context = getContext(6);

    // Process with LLM...
    const response = await processWithLLM(text, context);

    // Add assistant response
    await addAssistantMessage(response);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {conversation.map((msg, i) => (
        <div key={i}>{msg.text}</div>
      ))}
    </div>
  );
};
```

---

## Component APIs

### ErrorBoundary

**File**: `src/components/ErrorBoundary.jsx`

React error boundary component.

**Props**:
```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: (props: ErrorFallbackProps) => React.ReactNode;
  onReset?: () => void;
  showReportButton?: boolean;
}

interface ErrorFallbackProps {
  error: Error;
  errorInfo: React.ErrorInfo;
  resetError: () => void;
}
```

**Example**:
```javascript
import ErrorBoundary from '@/components/ErrorBoundary';

<ErrorBoundary
  showReportButton={true}
  onReset={() => {
    // Custom reset logic
    window.location.reload();
  }}
>
  <MyComponent />
</ErrorBoundary>
```

---

## Constants

**File**: `src/lib/constants.js`

Application-wide constants.

```javascript
import {
  VOICE_SETTINGS,
  SPEECH_RECOGNITION,
  AGENT_CONFIG,
  STATUS_MESSAGES,
  ERROR_MESSAGES,
  API_CONFIG,
  UI_CONFIG,
  STORAGE_KEYS,
  CONVERSATION_CONFIG
} from '@/lib/constants';

// Example usage
const defaultPitch = VOICE_SETTINGS.DEFAULT_PITCH;
const agentName = AGENT_CONFIG.NAME;
const errorMsg = ERROR_MESSAGES.PROCESSING_ERROR;
```

---

## Error Handling

### Standard Error Format

```typescript
interface APIError {
  status: number;
  message: string;
  data?: {
    extra_data?: {
      reason?: string;
      [key: string]: any;
    };
  };
}
```

### Common Error Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 400 | Bad Request | Invalid parameters |
| 401 | Unauthorized | Invalid/expired token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side issue |
| 504 | Gateway Timeout | Request took too long |

### Error Handling Example

```javascript
try {
  const result = await base44.agents.listConversations({
    agent_name: 'tessa_assistant'
  });
} catch (error) {
  if (error.status === 401) {
    // Handle authentication error
    base44.auth.redirectToLogin(window.location.href);
  } else if (error.status === 429) {
    // Handle rate limit
    toast.error('Too many requests. Please wait a moment.');
  } else {
    // Handle generic error
    console.error('Error:', error);
    toast.error('Something went wrong. Please try again.');
  }
}
```

---

## Rate Limits

**Current Limits** (subject to change):

- LLM API: 60 requests/minute per user
- Agents API: 100 requests/minute per user
- Entities API: 200 requests/minute per user

**Best Practices**:
- Implement exponential backoff on errors
- Cache responses when possible
- Debounce user inputs
- Show loading states to prevent duplicate requests

---

**Document Version**: 1.0
**Last Updated**: 2024-12-30
**Maintainer**: [@Krosebrook](https://github.com/Krosebrook)
