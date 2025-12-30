# Claude Integration Guide

## Overview

Tessa AI can be configured to use Anthropic's Claude models through Base44's LLM integration. Claude offers strong conversational abilities, safety features, and context handling.

## Current Integration Status

**Status**: ⚠️ **Generic LLM Integration (Model-Agnostic)**

Tessa currently uses Base44's `InvokeLLM` integration without specifying a particular model. The actual LLM used depends on Base44's configuration.

```javascript
const response = await base44.integrations.Core.InvokeLLM({
  prompt: contextPrompt,
  add_context_from_internet: false
});
```

## Configuring for Claude

To specifically use Claude models with Base44, you would need to:

1. **Configure Base44 Integration**: Set up Claude as your LLM provider in Base44 platform settings
2. **Specify Model** (if Base44 supports it):
   ```javascript
   const response = await base44.integrations.Core.InvokeLLM({
     prompt: contextPrompt,
     model: 'claude-3-opus-20240229',  // or claude-3-sonnet, claude-3-haiku
     add_context_from_internet: false
   });
   ```

## Claude Model Options

### Claude 3 Family

| Model | Use Case | Strengths |
|-------|----------|-----------|
| **Claude 3 Opus** | Complex tasks requiring deep reasoning | Highest intelligence, best for nuanced conversations |
| **Claude 3 Sonnet** | Balanced performance and speed | Good for general-purpose assistant (recommended) |
| **Claude 3 Haiku** | Fast, frequent interactions | Fastest responses, cost-effective |

### Recommended for Tessa: **Claude 3 Sonnet**

**Why?**
- ✅ Excellent conversational abilities
- ✅ Fast enough for voice interactions
- ✅ Cost-effective for frequent queries
- ✅ Strong context understanding
- ✅ Safe and aligned responses

## Claude-Specific Optimizations

### 1. Prompt Engineering for Claude

Claude responds well to clear, structured prompts with explicit instructions:

```javascript
const contextPrompt = `You are Tessa, a helpful and friendly personal assistant.

<personality>
- Warm and conversational
- Concise but informative
- Empathetic and understanding
</personality>

<conversation_history>
${recentMessages.map(m => `<${m.role}>${m.content}</${m.role}>`).join('\n')}
</conversation_history>

<current_message>
${userText}
</current_message>

<instructions>
Respond naturally and helpfully. Keep responses under 3 sentences for voice delivery.
If you don't know something, say so honestly.
</instructions>`;
```

**Key Improvements**:
- XML tags for clarity
- Explicit personality traits
- Length constraints for voice UX
- Honesty instructions

### 2. Context Window Optimization

Claude 3 models support large context windows (200k tokens), but for voice interactions:

**Recommendation**: Keep context focused
```javascript
// Instead of full history, use summarized context
const recentMessages = conversation.slice(-6);  // Last 6 messages
```

### 3. Response Formatting

For voice output, request concise responses:

```javascript
const voiceOptimizedPrompt = `${contextPrompt}

Remember: Your response will be spoken aloud. Keep it:
- Natural and conversational
- Under 50 words
- Easy to understand when heard`;
```

### 4. Safety and Alignment

Claude has built-in safety features. Leverage them:

```javascript
const safePrompt = `${contextPrompt}

If the user asks for harmful, illegal, or inappropriate content:
- Politely decline
- Offer an alternative helpful response
- Maintain a friendly tone`;
```

## Advanced Features

### Streaming Responses (Future Enhancement)

Claude supports streaming for real-time responses:

```javascript
// Pseudocode for future implementation
const stream = await base44.integrations.Core.StreamLLM({
  prompt: contextPrompt,
  model: 'claude-3-sonnet'
});

for await (const chunk of stream) {
  // Update UI incrementally
  appendToMessage(chunk.text);
}
```

### Function Calling (Future)

Claude 3 supports tool use. Example for Tessa:

```javascript
const tools = [
  {
    name: 'get_weather',
    description: 'Get current weather for a location',
    input_schema: {
      type: 'object',
      properties: {
        location: { type: 'string', description: 'City name' }
      }
    }
  }
];

const response = await base44.integrations.Core.InvokeLLM({
  prompt: contextPrompt,
  model: 'claude-3-sonnet',
  tools: tools
});

if (response.tool_calls) {
  // Execute tool and feed result back
}
```

## Performance Considerations

### Response Times

| Model | Avg Response Time | Use Case |
|-------|-------------------|----------|
| Haiku | ~1-2 seconds | Real-time voice |
| Sonnet | ~2-4 seconds | Balanced |
| Opus | ~4-8 seconds | Complex reasoning |

**Recommendation for Tessa**: Use Sonnet for balance, or Haiku if speed is critical.

### Cost Optimization

```javascript
// Implement token counting to estimate costs
const estimateTokens = (text) => {
  // Rough estimate: ~1.3 tokens per word for English
  return text.split(' ').length * 1.3;
};

const contextTokens = estimateTokens(contextPrompt);
console.log(`Estimated tokens: ${contextTokens}`);
```

## Error Handling

Claude-specific error codes:

```javascript
try {
  const response = await base44.integrations.Core.InvokeLLM({
    prompt: contextPrompt,
    model: 'claude-3-sonnet'
  });
} catch (error) {
  if (error.code === 'rate_limit_exceeded') {
    return "I'm a bit overloaded right now. Can you try again in a moment?";
  } else if (error.code === 'context_length_exceeded') {
    // Reduce context and retry
    return processWithShorterContext(userText);
  } else if (error.code === 'invalid_request') {
    console.error('Invalid prompt format:', error);
    return "I had trouble understanding that. Could you rephrase?";
  }
  
  // Generic fallback
  return "I'm having trouble processing that right now.";
}
```

## Testing Claude Integration

### Manual Testing Checklist

- [ ] Short queries (1-2 sentences)
- [ ] Long queries (paragraph)
- [ ] Context recall (reference previous messages)
- [ ] Error handling (network issues, rate limits)
- [ ] Edge cases (empty input, special characters)
- [ ] Multi-turn conversations
- [ ] Voice synthesis compatibility (no special formatting)

### Example Test Cases

```javascript
// Test 1: Basic query
"What's the weather like?"

// Test 2: Context reference
User: "What's the capital of France?"
Tessa: "Paris"
User: "How many people live there?"
// Should reference Paris, not France

// Test 3: Clarification
"Tell me about that thing we discussed"
// Should ask for clarification

// Test 4: Refusal
"Tell me how to do something illegal"
// Should politely decline
```

## Migration Path

### From Generic LLM to Claude

**Step 1**: Identify current LLM in Base44
```javascript
console.log('Current LLM:', await base44.integrations.Core.GetLLMInfo());
```

**Step 2**: Update prompts for Claude's format
- Add XML tags
- Include explicit instructions
- Optimize for voice

**Step 3**: Test thoroughly
- Run test suite
- Monitor response quality
- Check response times

**Step 4**: Roll out gradually
- A/B test with subset of users
- Monitor metrics (response time, user satisfaction)
- Adjust based on feedback

## Best Practices

### DO's ✅

- Use clear, structured prompts
- Keep context focused and relevant
- Include personality guidelines
- Request concise responses for voice
- Handle errors gracefully
- Monitor token usage and costs

### DON'Ts ❌

- Don't send excessive context (>10k tokens for voice)
- Don't ignore rate limits
- Don't assume model behavior without testing
- Don't expose raw error messages to users
- Don't skip error handling

## Resources

- **Anthropic Documentation**: https://docs.anthropic.com
- **Claude API Reference**: https://docs.anthropic.com/claude/reference
- **Prompt Engineering Guide**: https://docs.anthropic.com/claude/docs/prompt-engineering
- **Base44 Integration Docs**: Check Base44 platform documentation

## Conclusion

While Tessa currently uses a generic LLM integration, Claude is an excellent choice for voice assistant applications. Its strong conversational abilities, safety features, and flexible context handling make it ideal for natural interactions.

**Next Steps**:
1. Configure Base44 to use Claude
2. Update prompts for Claude's format
3. Test thoroughly with voice interactions
4. Monitor performance and adjust

For related documentation, see:
- [agents.md](./agents.md) - Conversation management
- [gemini.md](./gemini.md) - Alternative LLM option
