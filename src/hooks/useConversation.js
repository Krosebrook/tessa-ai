import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { AGENT_CONFIG } from '@/lib/constants';

/**
 * Custom hook for managing agent conversations
 * Handles conversation initialization, message management, and persistence
 * 
 * @param {string} agentName - Name of the agent (default: tessa_assistant)
 * @returns {Object} Conversation state and management functions
 */
export const useConversation = (agentName = AGENT_CONFIG.NAME) => {
  const [conversation, setConversation] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Initialize conversation - load existing or create new
   */
  useEffect(() => {
    const initConversation = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const user = await base44.auth.me();
        const conversations = await base44.agents.listConversations({
          agent_name: agentName
        });

        if (conversations && conversations.length > 0) {
          // Load most recent conversation
          const lastConversation = conversations[0];
          setConversationId(lastConversation.id);

          if (lastConversation.messages && lastConversation.messages.length > 0) {
            const formattedMessages = lastConversation.messages.map(msg => ({
              sender: msg.role === 'user' ? 'user' : 'tessa',
              text: msg.content,
              isTyping: false,
              timestamp: msg.timestamp || new Date().toISOString()
            }));
            setConversation(formattedMessages);
          }
        } else {
          // Create new conversation
          const newConversation = await base44.agents.createConversation({
            agent_name: agentName,
            metadata: {
              name: 'Tessa Session',
              description: `Personal assistant session for ${user.full_name}`
            }
          });
          setConversationId(newConversation.id);
        }
      } catch (err) {
        console.error('Error initializing conversation:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    initConversation();
  }, [agentName]);

  /**
   * Add a message to the conversation UI
   */
  const addMessage = useCallback((sender, text, isTyping = false) => {
    const newMessage = { 
      sender, 
      text, 
      isTyping,
      timestamp: new Date().toISOString()
    };

    setConversation(prev => {
      if (isTyping) {
        return [...prev, newMessage];
      } else {
        // Replace typing message with final message
        const newConv = [...prev];
        const lastMsg = newConv[newConv.length - 1];
        if (lastMsg && lastMsg.isTyping && lastMsg.sender === sender) {
          lastMsg.isTyping = false;
          lastMsg.text = text;
          return newConv;
        }
        return [...prev, newMessage];
      }
    });
  }, []);

  /**
   * Save a message to the conversation in the backend
   */
  const saveMessage = useCallback(async (role, content) => {
    if (!conversationId) {
      console.warn('Cannot save message: no conversation ID');
      return;
    }

    try {
      const conversationData = await base44.agents.getConversation(conversationId);
      await base44.agents.addMessage(conversationData, {
        role,
        content
      });
    } catch (err) {
      console.error('Error saving message:', err);
      throw err;
    }
  }, [conversationId]);

  /**
   * Add and save a user message
   */
  const addUserMessage = useCallback(async (text) => {
    addMessage('user', text);
    await saveMessage('user', text);
  }, [addMessage, saveMessage]);

  /**
   * Add and save an assistant message
   */
  const addAssistantMessage = useCallback(async (text, isTyping = false) => {
    addMessage('tessa', text, isTyping);
    if (!isTyping) {
      await saveMessage('assistant', text);
    }
  }, [addMessage, saveMessage]);

  /**
   * Get recent conversation context for LLM
   */
  const getContext = useCallback((messageCount = AGENT_CONFIG.CONTEXT_WINDOW_SIZE) => {
    return conversation
      .slice(-messageCount)
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));
  }, [conversation]);

  /**
   * Clear conversation
   */
  const clearConversation = useCallback(() => {
    setConversation([]);
  }, []);

  /**
   * Create a new conversation
   */
  const createNewConversation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await base44.auth.me();
      const newConversation = await base44.agents.createConversation({
        agent_name: agentName,
        metadata: {
          name: 'Tessa Session',
          description: `Personal assistant session for ${user.full_name}`
        }
      });
      
      setConversationId(newConversation.id);
      setConversation([]);
    } catch (err) {
      console.error('Error creating new conversation:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [agentName]);

  return {
    conversation,
    conversationId,
    isLoading,
    error,
    addMessage,
    addUserMessage,
    addAssistantMessage,
    saveMessage,
    getContext,
    clearConversation,
    createNewConversation,
  };
};

export default useConversation;
