# Gemini Integration Guide

## Overview

Tessa AI can be configured to use Google's Gemini models through Base44's LLM integration. Gemini offers multimodal capabilities, strong reasoning, and cost-effective performance.

## Current Integration Status

**Status**: ⚠️ **Generic LLM Integration (Model-Agnostic)**

Tessa currently uses Base44's `InvokeLLM` integration without specifying a particular model:

```javascript
const response = await base44.integrations.Core.InvokeLLM({
  prompt: contextPrompt,
  add_context_from_internet: false
});
```

## Configuring for Gemini

To specifically use Gemini models with Base44:

1. **Configure Base44 Integration**: Set Gemini as your LLM provider in Base44 settings
2. **Specify Model**:
   ```javascript
   const response = await base44.integrations.Core.InvokeLLM({
     prompt: contextPrompt,
     model: 'gemini-1.5-pro',  // or gemini-1.5-flash
     add_context_from_internet: false
   });
   ```

## Gemini Model Options

### Gemini 1.5 Family

| Model | Use Case | Strengths |
|-------|----------|-----------|
| **Gemini 1.5 Pro** | Complex reasoning and analysis | Massive context window (1M tokens), multimodal |
| **Gemini 1.5 Flash** | Fast, efficient interactions | Fastest responses, cost-effective |
| **Gemini 1.0 Pro** | General-purpose tasks | Balanced performance |

### Recommended for Tessa: **Gemini 1.5 Flash**

**Why?**
- ✅ Excellent speed for real-time voice
- ✅ Cost-effective for frequent queries
- ✅ Good conversational abilities
- ✅ Strong context understanding
- ✅ Low latency (~1-2 seconds)

## Gemini-Specific Optimizations

### 1. Prompt Engineering for Gemini

Gemini works well with clear, natural language instructions:

```javascript
const contextPrompt = `You are Tessa, a helpful and friendly personal assistant.

PERSONALITY:
- Warm, conversational, and empathetic
- Concise and to the point
- Natural and easy to understand

CONVERSATION HISTORY:
${recentMessages.map(m => `${m.role}: ${m.content}`).join('\n')}

USER: ${userText}

INSTRUCTIONS:
- Respond naturally in 2-3 sentences maximum
- This will be spoken aloud, so keep it conversational
- If you don't know something, say so honestly
- Be helpful and friendly

RESPONSE:`;
```

**Key Features**:
- Clear section headers
- Natural language instructions
- Voice-optimized length limits
- Explicit response format

### 2. Leveraging Large Context Window

Gemini 1.5 Pro supports up to 1M tokens. For voice assistants:

**Strategy 1: Extended Context**
```javascript
// Use more conversation history when needed
const extendedContext = conversation.slice(-20);  // Last 20 messages
```

**Strategy 2: Include User Preferences**
```javascript
const userPreferences = await base44.entities.UserPreferences.list();
const contextWithPrefs = `${contextPrompt}

USER PREFERENCES:
- Name: ${userPreferences.preferred_name}
- Location: ${userPreferences.location}
- Previous topics discussed: ${getTopicSummary()}`;
```

### 3. Multimodal Capabilities (Future)

Gemini supports images, audio, and video. Future enhancements:

```javascript
// Example: Visual context from screenshot
const response = await base44.integrations.Core.InvokeLLM({
  model: 'gemini-1.5-pro',
  prompt: contextPrompt,
  media: [{
    type: 'image',
    data: screenshotBase64
  }]
});
```

### 4. Grounding with Google Search (Optional)

Enable real-time information retrieval:

```javascript
const response = await base44.integrations.Core.InvokeLLM({
  prompt: contextPrompt,
  model: 'gemini-1.5-flash',
  add_context_from_internet: true,  // Enable for factual queries
  search_grounding: true
});
```

**Use Cases**:
- Weather queries
- Current events
- Real-time data (sports scores, stock prices)
- Factual information

## Performance Characteristics

### Response Times

| Model | Avg Response Time | Tokens/Second |
|-------|-------------------|---------------|
| Gemini 1.5 Flash | ~1-2 seconds | ~100 |
| Gemini 1.5 Pro | ~2-4 seconds | ~50 |
| Gemini 1.0 Pro | ~2-3 seconds | ~70 |

**For Voice UX**: Gemini 1.5 Flash provides the best experience with minimal latency.

### Cost Optimization

Gemini pricing (approximate, **check current rates at [Google AI Pricing](https://ai.google.dev/pricing)**):
- **Input**: ~$0.075 per 1M tokens (Flash), ~$1.25 per 1M tokens (Pro)
- **Output**: ~$0.30 per 1M tokens (Flash), ~$5.00 per 1M tokens (Pro)

**Optimization Tips**:
```javascript
// 1. Limit context window
const recentMessages = conversation.slice(-6);  // Typically ~500 tokens

// 2. Use Flash for routine queries
const model = isComplexQuery(userText) ? 'gemini-1.5-pro' : 'gemini-1.5-flash';

// 3. Cache system instructions (if supported)
const cachedSystemPrompt = `You are Tessa...`;  // Reused across requests
```

## Safety and Content Filtering

Gemini includes built-in safety filters:

```javascript
const response = await base44.integrations.Core.InvokeLLM({
  prompt: contextPrompt,
  model: 'gemini-1.5-flash',
  safety_settings: {
    HARM_CATEGORY_HATE_SPEECH: 'BLOCK_MEDIUM_AND_ABOVE',
    HARM_CATEGORY_DANGEROUS_CONTENT: 'BLOCK_MEDIUM_AND_ABOVE',
    HARM_CATEGORY_SEXUALLY_EXPLICIT: 'BLOCK_MEDIUM_AND_ABOVE',
    HARM_CATEGORY_HARASSMENT: 'BLOCK_MEDIUM_AND_ABOVE'
  }
});
```

**Default Behavior**: Gemini blocks harmful content automatically.

## Advanced Features

### 1. Function Calling

Gemini supports function calling for tool use:

```javascript
const tools = [
  {
    name: 'set_reminder',
    description: 'Set a reminder for the user',
    parameters: {
      type: 'object',
      properties: {
        task: { type: 'string' },
        time: { type: 'string', format: 'date-time' }
      },
      required: ['task', 'time']
    }
  }
];

const response = await base44.integrations.Core.InvokeLLM({
  prompt: contextPrompt,
  model: 'gemini-1.5-flash',
  tools: tools
});

if (response.function_call) {
  const { name, arguments: args } = response.function_call;
  if (name === 'set_reminder') {
    await setReminder(args.task, args.time);
  }
}
```

### 2. Streaming Responses

For real-time feedback:

```javascript
// Pseudocode for future implementation
const stream = await base44.integrations.Core.StreamLLM({
  prompt: contextPrompt,
  model: 'gemini-1.5-flash'
});

let fullResponse = '';
for await (const chunk of stream) {
  fullResponse += chunk.text;
  updateUI(fullResponse);  // Real-time updates
}

speak(fullResponse);
```

### 3. Few-Shot Learning

Improve responses with examples:

```javascript
const fewShotPrompt = `You are Tessa, a helpful assistant.

EXAMPLES:
User: What's the time?
Tessa: I don't have access to the current time, but you can check your device.

User: Tell me a joke
Tessa: Why don't scientists trust atoms? Because they make up everything!

CURRENT CONVERSATION:
${contextPrompt}`;
```

## Error Handling

Gemini-specific error handling:

```javascript
try {
  const response = await base44.integrations.Core.InvokeLLM({
    prompt: contextPrompt,
    model: 'gemini-1.5-flash'
  });
} catch (error) {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    return "I'm processing a lot of requests right now. Please try again shortly.";
  } else if (error.code === 'SAFETY_BLOCKED') {
    return "I can't respond to that request. Is there something else I can help with?";
  } else if (error.code === 'INVALID_ARGUMENT') {
    console.error('Invalid prompt format:', error);
    return "I had trouble understanding that. Could you rephrase?";
  }
  
  return "I'm having technical difficulties. Please try again.";
}
```

## Testing Gemini Integration

### Test Suite

```javascript
const testCases = [
  {
    name: 'Short query',
    input: 'Hello',
    expectedType: 'greeting'
  },
  {
    name: 'Context reference',
    conversation: [
      { role: 'user', content: 'My name is Alice' },
      { role: 'assistant', content: 'Nice to meet you, Alice!' }
    ],
    input: 'What\'s my name?',
    expectedContent: 'Alice'
  },
  {
    name: 'Factual query',
    input: 'What is the capital of Japan?',
    expectedContent: 'Tokyo'
  },
  {
    name: 'Clarification request',
    input: 'Tell me about it',
    expectedType: 'clarification_needed'
  }
];
```

### Performance Monitoring

```javascript
const logPerformance = async (prompt) => {
  const startTime = Date.now();
  
  const response = await base44.integrations.Core.InvokeLLM({
    prompt: prompt,
    model: 'gemini-1.5-flash'
  });
  
  const endTime = Date.now();
  const latency = endTime - startTime;
  
  console.log({
    latency: `${latency}ms`,
    promptLength: prompt.length,
    responseLength: response.length,
    tokensPerSecond: (response.length / (latency / 1000)).toFixed(2)
  });
  
  return response;
};
```

## Migration Path

### From Generic LLM to Gemini

**Step 1**: Configure Base44 for Gemini
```javascript
// Check if Gemini is available
const llmInfo = await base44.integrations.Core.GetLLMInfo();
console.log('Available models:', llmInfo.models);
```

**Step 2**: Update integration calls
```javascript
// Before
const response = await base44.integrations.Core.InvokeLLM({
  prompt: contextPrompt
});

// After
const response = await base44.integrations.Core.InvokeLLM({
  prompt: contextPrompt,
  model: 'gemini-1.5-flash'
});
```

**Step 3**: Optimize prompts for Gemini
- Use natural language instructions
- Leverage large context window
- Enable grounding for factual queries

**Step 4**: Test and monitor
- Run test suite
- Monitor response times
- Adjust model choice based on performance

## Comparison: Gemini vs Claude

| Feature | Gemini 1.5 Flash | Claude 3 Sonnet |
|---------|------------------|-----------------|
| **Speed** | ⚡⚡⚡ Very Fast (~1-2s) | ⚡⚡ Fast (~2-4s) |
| **Context Window** | 1M tokens | 200k tokens |
| **Cost** | 💰 Very Low | 💰💰 Moderate |
| **Multimodal** | ✅ Yes (images, audio) | ❌ Text only |
| **Grounding** | ✅ Google Search | ❌ No |
| **Safety** | ✅ Strong filters | ✅ Strong alignment |
| **Conversational** | ⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐⭐ Outstanding |

**Recommendation**: 
- **Gemini 1.5 Flash** for speed and cost-effectiveness
- **Claude 3 Sonnet** for most natural conversations

## Best Practices

### DO's ✅

- Use Gemini 1.5 Flash for real-time voice
- Leverage large context for complex conversations
- Enable grounding for factual queries
- Monitor response times and adjust
- Handle safety blocks gracefully
- Cache system prompts when possible

### DON'Ts ❌

- Don't use Pro model unless needed (cost/speed)
- Don't ignore safety settings
- Don't send excessive context unnecessarily
- Don't assume multimodal features available
- Don't skip error handling

## Resources

- **Google AI Documentation**: https://ai.google.dev/docs
- **Gemini API Reference**: https://ai.google.dev/api
- **Prompt Design Guide**: https://ai.google.dev/docs/prompt_best_practices
- **Base44 Integration Docs**: Check Base44 platform documentation

## Conclusion

Gemini 1.5 Flash is an excellent choice for Tessa AI, offering:
- ⚡ Fast response times ideal for voice
- 💰 Cost-effective for frequent queries
- 🎯 Strong accuracy and reasoning
- 🌐 Optional grounding for real-time data
- 🔮 Future-ready with multimodal capabilities

**Next Steps**:
1. Configure Base44 to use Gemini 1.5 Flash
2. Update prompts for optimal performance
3. Test with voice interactions
4. Monitor metrics and iterate

For related documentation, see:
- [agents.md](./agents.md) - Conversation management
- [claude.md](./claude.md) - Alternative LLM option
