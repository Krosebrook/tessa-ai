import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Custom hook for managing conversation state with Base44 Agents
 * Handles conversation initialization, message management, and LLM interactions
 * 
 * @returns {Object} Conversation state and management functions
 */
const useTessaConversation = () => {
  const [conversation, setConversation] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');

  /**
   * Initialize or load existing conversation
   */
  useEffect(() => {
    const initConversation = async () => {
      try {
        const user = await base44.auth.me();
        const conversations = await base44.agents.listConversations({
          agent_name: 'tessa_assistant'
        });
        
        if (conversations && conversations.length > 0) {
          const lastConversation = conversations[0];
          setConversationId(lastConversation.id);
          
          if (lastConversation.messages && lastConversation.messages.length > 0) {
            const formattedMessages = lastConversation.messages.map(msg => ({
              sender: msg.role === 'user' ? 'user' : 'tessa',
              text: msg.content,
              isTyping: false
            }));
            setConversation(formattedMessages);
          }
        } else {
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

  /**
   * Add a message to the conversation (UI and Base44)
   * @param {string} sender - 'user' or 'tessa'
   * @param {string} text - Message text
   * @param {boolean} isTyping - Whether to show typing animation
   */
  const addMessageToConversation = useCallback((sender, text, isTyping = false) => {
    const newMessage = { sender, text, isTyping };
    if (isTyping) {
      setCurrentMessage(text);
      setConversation(prev => [...prev, newMessage]);
    } else {
      setConversation(prev => {
        const newConv = [...prev];
        const lastMsg = newConv[newConv.length - 1];
        if (lastMsg && lastMsg.isTyping) {
          lastMsg.isTyping = false;
          lastMsg.text = text;
        } else {
          newConv.push(newMessage);
        }
        return newConv;
      });
      setCurrentMessage('');
    }
  }, []);

  /**
   * Process user input with LLM and get response
   * @param {string} userText - User's voice input
   * @returns {Promise<string>} Tessa's response
   */
  const processWithLLM = useCallback(async (userText) => {
    if (!conversationId || isProcessing) return null;
    
    setIsProcessing(true);
    
    try {
      const conversationData = await base44.agents.getConversation(conversationId);
      
      await base44.agents.addMessage(conversationData, {
        role: 'user',
        content: userText
      });
      
      const recentMessages = conversation.slice(-6).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));
      
      const contextPrompt = `You are Tessa, a helpful and friendly personal assistant. You have a warm, conversational personality.

Previous conversation:
${recentMessages.map(m => `${m.role}: ${m.content}`).join('\n')}

User: ${userText}

Respond naturally and helpfully. Keep responses concise but warm.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: contextPrompt,
        add_context_from_internet: false
      });
      
      const tessaResponse = response || "I'm sorry, I didn't quite understand that. Could you rephrase?";
      
      await base44.agents.addMessage(conversationData, {
        role: 'assistant',
        content: tessaResponse
      });
      
      return tessaResponse;
    } catch (error) {
      console.error('Error processing user input:', error);
      return "I'm having trouble processing that right now. Could you try again?";
    } finally {
      setIsProcessing(false);
    }
  }, [conversationId, isProcessing, conversation]);

  /**
   * Clear current conversation and start new one
   */
  const startNewConversation = useCallback(async () => {
    try {
      const user = await base44.auth.me();
      const newConversation = await base44.agents.createConversation({
        agent_name: 'tessa_assistant',
        metadata: {
          name: 'Tessa Session',
          description: `Personal assistant session for ${user.full_name}`
        }
      });
      setConversationId(newConversation.id);
      setConversation([]);
    } catch (error) {
      console.error('Error starting new conversation:', error);
    }
  }, []);

  return {
    conversation,
    conversationId,
    isProcessing,
    currentMessage,
    addMessageToConversation,
    processWithLLM,
    startNewConversation
  };
};

export default useTessaConversation;
