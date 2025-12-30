# Agent Architecture Documentation

## Overview

Tessa AI uses a sophisticated agent-based architecture powered by the Base44 platform. The system combines real-time voice interaction, conversation management, and LLM-powered intelligence to deliver a seamless personal assistant experience.

## Agent System Architecture

### 1. Tessa Assistant Agent

**Agent Name**: `tessa_assistant`

**Purpose**: Primary conversational AI agent that processes user inputs and generates intelligent, context-aware responses.

**Key Features**:
- Maintains conversation context across sessions
- Integrates with Base44 LLM services
- Stores conversation history for continuity
- Provides natural, friendly responses with personality

**Configuration**:
```javascript
{
  agent_name: 'tessa_assistant',
  personality: 'warm, conversational, helpful',
  response_style: 'concise but informative',
  context_window: 6 // Last 6 messages for context
}
```

### 2. Conversation Management

#### Conversation Entity Structure

```javascript
{
  id: 'uuid',
  agent_name: 'tessa_assistant',
  messages: [
    {
      role: 'user' | 'assistant',
      content: 'message text',
      timestamp: 'ISO-8601'
    }
  ],
  metadata: {
    name: 'Session name',
    description: 'Session description',
    user_id: 'uuid'
  },
  created_at: 'ISO-8601',
  updated_at: 'ISO-8601'
}
```

#### Conversation Lifecycle

1. **Initialization**
   - Check for existing conversations on mount
   - Load most recent conversation or create new one
   - Restore message history to UI

2. **Message Flow**
   ```
   User speaks → Speech Recognition → Add to conversation
        ↓
   Send to LLM with context → Generate response
        ↓
   Store in conversation → Speak response → Continue listening
   ```

3. **Persistence**
   - All messages stored via Base44 agents API
   - Conversation persists across browser sessions
   - User can access historical conversations

### 3. Voice Agent System

#### Speech Recognition Agent

**Lifecycle**:
- Starts after assistant finishes speaking
- Listens continuously until user stops talking
- Processes final transcript
- Stops after capturing user input

**Configuration**:
```javascript
{
  continuous: true,
  lang: 'en-US',
  interimResults: false,
  maxAlternatives: 1
}
```

**State Machine**:
```
IDLE → LISTENING → PROCESSING → SPEAKING → IDLE
  ↑                                          ↓
  └──────────────────────────────────────────┘
```

#### Speech Synthesis Agent

**Responsibilities**:
- Converts text responses to speech
- Applies user voice preferences
- Manages speaking state
- Triggers next listening cycle

**Voice Settings**:
```javascript
{
  voice: SpeechSynthesisVoice,
  pitch: 0.5 - 2.0,      // Voice tone
  rate: 0.5 - 2.0,       // Speech speed
  volume: 0.0 - 1.0,     // Output volume
  preferred_voice_name: string
}
```

### 4. LLM Integration Agent

**Integration Point**: `base44.integrations.Core.InvokeLLM`

**Request Structure**:
```javascript
{
  prompt: string,              // Formatted prompt with context
  add_context_from_internet: boolean,  // Internet search flag
  temperature: number,         // Creativity (0-1)
  max_tokens: number          // Response length limit
}
```

**Context Building**:
```javascript
const contextPrompt = `
You are Tessa, a helpful and friendly personal assistant.
You have a warm, conversational personality.

Previous conversation:
${recentMessages.map(m => `${m.role}: ${m.content}`).join('\n')}

User: ${userText}

Respond naturally and helpfully. Keep responses concise but warm.
`;
```

**Response Handling**:
- Parse LLM response
- Add to conversation history
- Trigger speech synthesis
- Handle errors gracefully

### 5. Settings Agent

**Purpose**: Manages user preferences and settings persistence

**Entity**: `UserPreferences`

**Schema**:
```javascript
{
  id: 'uuid',
  user_id: 'uuid',
  preferred_name: string,
  location: string,
  timezone: string,
  voice_settings: {
    speech_rate: number,
    pitch: number,
    volume: number,
    preferred_voice_name: string
  },
  created_at: 'ISO-8601',
  updated_at: 'ISO-8601'
}
```

**Operations**:
- **Load**: Fetch on app initialization
- **Update**: Modify and persist changes
- **Apply**: Update voice synthesis and conversation context

## Agent Communication Flow

### Complete Interaction Cycle

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │ Speaks
       ↓
┌─────────────────────┐
│ Speech Recognition  │
│ Agent               │
└──────┬──────────────┘
       │ Transcript
       ↓
┌─────────────────────┐
│ Conversation        │
│ Manager             │ ← Loads context
└──────┬──────────────┘
       │ User message + context
       ↓
┌─────────────────────┐
│ LLM Agent           │
│ (Base44)            │
└──────┬──────────────┘
       │ AI Response
       ↓
┌─────────────────────┐
│ Conversation        │
│ Manager             │ → Stores message
└──────┬──────────────┘
       │ Response text
       ↓
┌─────────────────────┐
│ Speech Synthesis    │ ← Voice Settings
│ Agent               │
└──────┬──────────────┘
       │ Audio output
       ↓
┌─────────────┐
│   User      │
└─────────────┘
```

## Agent Decision Logic

### When to Start Listening

**Conditions**:
- Initial greeting complete
- Assistant finished speaking
- User manually activates
- Error recovery complete

**Implementation**:
```javascript
const startListening = useCallback(() => {
  if (!recognition || isListening) return;
  try {
    recognition.start();
    setIsListening(true);
    setTessaStatus('Listening for you...');
  } catch(e) {
    console.error("Recognition already started.", e);
  }
}, [isListening]);
```

### When to Process Input

**Conditions**:
- Speech recognition returns final result
- Not currently processing another request
- Valid conversation ID exists

**Implementation**:
```javascript
recognition.onresult = (event) => {
  const transcript = event.results[event.results.length - 1][0].transcript.trim();
  addMessageToConversation('user', transcript);
  recognition.stop();
  processUserInput(transcript);
};
```

### When to Speak Response

**Conditions**:
- LLM response received successfully
- Not currently speaking
- Valid response text exists

**Error Handling**:
```javascript
try {
  const response = await base44.integrations.Core.InvokeLLM({...});
  speak(response, () => startListening());
} catch (error) {
  const errorMsg = "I'm having trouble processing that right now.";
  speak(errorMsg);
}
```

## Agent State Management

### State Variables

```javascript
// Conversation state
const [conversation, setConversation] = useState([]);
const [conversationId, setConversationId] = useState(null);

// Voice state
const [isListening, setIsListening] = useState(false);
const [isSpeaking, setIsSpeaking] = useState(false);
const [isProcessing, setIsProcessing] = useState(false);

// Settings state
const [voiceSettings, setVoiceSettings] = useState({...});
const [tessaVoice, setTessaVoice] = useState(null);

// UI state
const [tessaStatus, setTessaStatus] = useState('Initializing...');
const [currentMessage, setCurrentMessage] = useState('');
```

### State Transitions

```
Initializing → Ready → Listening → Processing → Speaking → Ready
      ↑                                                      ↓
      └──────────────────────────────────────────────────────┘
```

## Error Handling & Recovery

### Recognition Errors

```javascript
recognition.onerror = (event) => {
  console.error('Speech recognition error', event.error);
  setIsListening(false);
  setTessaStatus('Ready to help');
  // Auto-recovery: Start listening again if appropriate
};
```

### LLM Errors

```javascript
catch (error) {
  console.error('Error processing user input:', error);
  const errorMsg = "I'm having trouble processing that right now. Could you try again?";
  addMessageToConversation('tessa', errorMsg, true);
  speak(errorMsg);
}
```

### Synthesis Errors

```javascript
utterance.onerror = (event) => {
  console.error('Speech synthesis error:', event);
  setIsSpeaking(false);
  setTessaStatus('Ready to help');
};
```

## Agent Configuration Best Practices

### 1. Context Window Size

- **Current**: 6 messages
- **Rationale**: Balances context awareness with API payload size
- **Tuning**: Increase for more complex conversations, decrease for faster responses

### 2. Voice Parameters

- **Speech Rate**: 1.0 (default) - Natural pace
- **Pitch**: 1.1 (slightly elevated) - Friendly tone
- **Volume**: 1.0 (maximum) - Clear audibility

### 3. LLM Prompt Engineering

**Guidelines**:
- Define personality clearly
- Include conversation context
- Request concise responses
- Maintain consistent tone

### 4. Error Messages

**Principles**:
- Friendly and non-technical
- Suggest recovery actions
- Maintain assistant personality
- Don't expose implementation details

## Future Agent Enhancements

### Planned Improvements

1. **Multi-Modal Agent**
   - Process image inputs
   - Generate visual responses
   - Screen sharing analysis

2. **Task Agent**
   - Calendar integration
   - Reminder management
   - Task execution

3. **Learning Agent**
   - User preference learning
   - Conversation pattern analysis
   - Personalized responses

4. **Context Agent**
   - Location awareness
   - Time-based context
   - User activity tracking

5. **Security Agent**
   - Input validation
   - Sensitive data detection
   - Conversation encryption

## Performance Considerations

### Optimization Strategies

1. **Debouncing**: Prevent multiple simultaneous requests
2. **Caching**: Store common responses
3. **Lazy Loading**: Load voice data on demand
4. **Connection Pooling**: Reuse HTTP connections
5. **Message Batching**: Bulk conversation updates

### Monitoring

**Key Metrics**:
- Response latency (target: < 2s)
- Recognition accuracy (target: > 95%)
- Synthesis quality (subjective)
- Error rate (target: < 1%)
- Conversation length (average: 10-20 turns)

---

**Document Version**: 1.0
**Last Updated**: 2024-12-30
**Maintainer**: [@Krosebrook](https://github.com/Krosebrook)
