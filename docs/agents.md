# Agents Documentation - Base44 Integration

## Overview

Tessa AI leverages **Base44 Agents** to manage conversational state and provide persistent, context-aware interactions. This document explains how agents work within Tessa, their architecture, and how they integrate with the Base44 platform.

---

## Table of Contents

1. [What are Base44 Agents?](#what-are-base44-agents)
2. [Agent Architecture in Tessa](#agent-architecture-in-tessa)
3. [Conversation Management](#conversation-management)
4. [Message Flow](#message-flow)
5. [Context Handling](#context-handling)
6. [Implementation Details](#implementation-details)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## What are Base44 Agents?

Base44 Agents are conversational AI entities that maintain stateful conversations with users. They provide:

- **Persistent Conversations**: History is saved across sessions
- **Context Management**: Agents remember previous interactions
- **Multi-turn Dialogues**: Support for back-and-forth exchanges
- **Metadata Storage**: Custom data associated with conversations

### Key Concepts

- **Agent**: A named AI assistant (e.g., `tessa_assistant`)
- **Conversation**: A session between user and agent
- **Message**: A single turn in the conversation (user or assistant)
- **Context**: Recent messages used to inform responses

---

## Agent Architecture in Tessa

### Agent Configuration

**Agent Name**: `tessa_assistant`

**Purpose**: Personal voice assistant for natural language interactions

**Characteristics**:
- Warm and friendly personality
- Helpful and conversational
- Context-aware responses
- Concise but informative

### System Prompt

The agent is guided by a dynamic prompt structure:

```javascript
const contextPrompt = `You are Tessa, a helpful and friendly personal assistant. 
You have a warm, conversational personality.

Previous conversation:
${recentMessages.map(m => `${m.role}: ${m.content}`).join('\n')}

User: ${userText}

Respond naturally and helpfully. Keep responses concise but warm.`;
```

**Key Elements**:
1. **Identity**: "You are Tessa..."
2. **Personality**: Warm, friendly, helpful
3. **Context**: Last 6 messages of conversation
4. **Current Input**: Latest user message
5. **Instruction**: Response style guidance

---

## Conversation Management

### Conversation Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│ 1. App Initialization                                        │
│    └─> Check for existing conversations                     │
└─────────────┬───────────────────────────────────────────────┘
              ↓
         ┌────┴─────┐
         │ Exists?  │
         └────┬─────┘
              ↓
     ┌────────┴────────┐
     │ Yes             │ No
     ↓                 ↓
┌──────────┐     ┌──────────────┐
│ Load     │     │ Create new   │
│ existing │     │ conversation │
└────┬─────┘     └─────┬────────┘
     │                 │
     └────────┬────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Conversation Ready                                        │
│    └─> conversationId set in state                          │
└─────────────┬───────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. User Interaction Loop                                     │
│    ├─> User speaks                                           │
│    ├─> Add user message                                      │
│    ├─> Process with LLM                                      │
│    ├─> Add assistant response                                │
│    └─> Repeat                                                │
└─────────────┬───────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Session End                                               │
│    └─> Conversation persists in Base44                      │
└─────────────────────────────────────────────────────────────┘
```

### Implementation: Loading Conversations

**Location**: `src/pages/Tessa.jsx` (lines 85-121)

```javascript
useEffect(() => {
  const initConversation = async () => {
    try {
      const user = await base44.auth.me();
      
      // List existing conversations for this agent
      const conversations = await base44.agents.listConversations({
        agent_name: 'tessa_assistant'
      });
      
      if (conversations && conversations.length > 0) {
        // Load most recent conversation
        const lastConversation = conversations[0];
        setConversationId(lastConversation.id);
        
        // Restore message history
        if (lastConversation.messages && lastConversation.messages.length > 0) {
          const formattedMessages = lastConversation.messages.map(msg => ({
            sender: msg.role === 'user' ? 'user' : 'tessa',
            text: msg.content,
            isTyping: false
          }));
          setConversation(formattedMessages);
        }
      } else {
        // Create new conversation
        const newConversation = await base44.agents.createConversation({
          agent_name: 'tessa_assistant',
          metadata: {
            name: 'Tessa Session',
            description: `Personal assistant session for ${user.full_name}`
          }
        });
        setConversationId(newConversation.id);
      }
    } catch (error) {
      console.error('Error initializing conversation:', error);
    }
  };

  initConversation();
}, []);
```

**Key Points**:
- Lists conversations filtered by agent name
- Loads most recent conversation (index 0)
- Restores full message history to UI
- Creates new conversation if none exists
- Stores conversation ID for subsequent messages

---

## Message Flow

### Adding Messages to Conversation

**Process**:

1. **User speaks** → Transcript captured
2. **Add user message** to local state and Base44
3. **Build context** from recent messages
4. **Call LLM** with contextualized prompt
5. **Add assistant response** to local state and Base44
6. **Speak response** and continue listening

### Implementation: Processing Input

**Location**: `src/pages/Tessa.jsx` (lines 182-235)

```javascript
const processUserInput = useCallback(async (userText) => {
  if (!conversationId || isProcessing) return;
  
  setIsProcessing(true);
  setTessaStatus('Thinking...');
  
  try {
    // 1. Get conversation object
    const conversationData = await base44.agents.getConversation(conversationId);
    
    // 2. Add user message to Base44
    await base44.agents.addMessage(conversationData, {
      role: 'user',
      content: userText
    });
    
    // 3. Build context from recent messages
    const recentMessages = conversation.slice(-6).map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));
    
    // 4. Create contextualized prompt
    const contextPrompt = `You are Tessa, a helpful and friendly personal assistant. 
You have a warm, conversational personality.

Previous conversation:
${recentMessages.map(m => `${m.role}: ${m.content}`).join('\n')}

User: ${userText}

Respond naturally and helpfully. Keep responses concise but warm.`;

    // 5. Call LLM integration
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: contextPrompt,
      add_context_from_internet: false
    });
    
    const tessaResponse = response || 
      "I'm sorry, I didn't quite understand that. Could you rephrase?";
    
    // 6. Save assistant response to Base44
    await base44.agents.addMessage(conversationData, {
      role: 'assistant',
      content: tessaResponse
    });
    
    // 7. Update UI and speak
    addMessageToConversation('tessa', tessaResponse, true);
    speak(tessaResponse, () => {
      startListening();
    });
    
  } catch (error) {
    console.error('Error processing user input:', error);
    const errorMsg = "I'm having trouble processing that right now. Could you try again?";
    addMessageToConversation('tessa', errorMsg, true);
    speak(errorMsg);
  } finally {
    setIsProcessing(false);
  }
}, [conversationId, isProcessing, conversation, addMessageToConversation, speak, startListening]);
```

**Error Handling**:
- Guards against processing multiple inputs simultaneously
- Catches API errors and provides user-friendly fallback
- Always resets processing state in `finally` block

---

## Context Handling

### Context Window Strategy

**Current Implementation**:
- **Window Size**: Last 6 messages (3 user + 3 assistant)
- **Purpose**: Provide immediate conversation context without overwhelming the LLM
- **Trade-off**: Balances context vs. token usage

### Why 6 Messages?

| Factor | Reasoning |
|--------|-----------|
| **Recency** | Most relevant context is recent |
| **Token Limit** | Stays well below typical LLM limits (~4000 tokens) |
| **Performance** | Faster response times with smaller prompts |
| **Cost** | Lower API costs per request |
| **User Experience** | Sufficient for most conversational flows |

### Context Format

```javascript
// Example context with 6 messages (3 turns)
const recentMessages = [
  { role: 'user', content: 'What\'s the weather like?' },
  { role: 'assistant', content: 'I need your location to check the weather.' },
  { role: 'user', content: 'I\'m in San Francisco' },
  { role: 'assistant', content: 'Let me check the weather in San Francisco...' },
  { role: 'user', content: 'Also, what about tomorrow?' },
  { role: 'assistant', content: 'I\'ll include tomorrow\'s forecast too.' }
];

// Formatted in prompt
Previous conversation:
user: What's the weather like?
assistant: I need your location to check the weather.
user: I'm in San Francisco
assistant: Let me check the weather in San Francisco...
user: Also, what about tomorrow?
assistant: I'll include tomorrow's forecast too.
```

---

## Implementation Details

### Base44 Agent API Methods

#### 1. `listConversations(params)`

**Purpose**: Retrieve conversations for a specific agent

**Parameters**:
```javascript
{
  agent_name: 'tessa_assistant',  // Required
  limit: 10,                       // Optional
  offset: 0                        // Optional
}
```

**Returns**: Array of conversation objects with messages

#### 2. `createConversation(params)`

**Purpose**: Start a new conversation

**Parameters**:
```javascript
{
  agent_name: 'tessa_assistant',  // Required
  metadata: {                      // Optional
    name: 'Session Name',
    description: 'Session description'
  }
}
```

#### 3. `getConversation(conversationId)`

**Purpose**: Fetch full conversation details

#### 4. `addMessage(conversation, message)`

**Purpose**: Append a message to the conversation

**Parameters**:
```javascript
{
  role: 'user',        // 'user' or 'assistant'
  content: 'Hello!'    // Message text
}
```

---

## Best Practices

### 1. **Always Check Conversation ID**

```javascript
if (!conversationId) {
  console.error('No active conversation');
  return;
}
```

### 2. **Handle API Errors Gracefully**

```javascript
try {
  await base44.agents.addMessage(conversationData, message);
} catch (error) {
  console.error('Failed to save message:', error);
  // Provide user-friendly error message
}
```

### 3. **Maintain UI/Backend Sync**

Add to UI immediately for responsiveness, then persist to backend.

### 4. **Use Metadata Effectively**

Store session information, preferences, and analytics in metadata.

---

## Troubleshooting

### Common Issues

1. **Conversation Not Loading**: Check authentication and agent name
2. **Messages Not Persisting**: Verify API calls succeed
3. **Context Not Working**: Check message format and window size
4. **Duplicate Conversations**: Implement deduplication logic

For LLM-specific implementation details, see:
- [claude.md](./claude.md) - Claude integration guide
- [gemini.md](./gemini.md) - Gemini integration guide
