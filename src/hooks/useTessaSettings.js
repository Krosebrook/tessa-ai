import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Custom hook for managing user preferences and voice settings
 * Handles loading and saving preferences to Base44
 * 
 * @returns {Object} Settings state and management functions
 */
const useTessaSettings = () => {
  const [voiceSettings, setVoiceSettings] = useState({
    speech_rate: 1.0,
    pitch: 1.1,
    volume: 1.0,
    preferred_voice_name: ''
  });
  const [preferences, setPreferences] = useState({
    preferred_name: '',
    location: '',
    timezone: '',
    voice_settings: voiceSettings
  });
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load user preferences from Base44
   */
  useEffect(() => {
    const loadPreferences = async () => {
      setIsLoading(true);
      try {
        const prefs = await base44.entities.UserPreferences.list();
        if (prefs && prefs.length > 0 && prefs[0].voice_settings) {
          setVoiceSettings(prefs[0].voice_settings);
          setPreferences(prefs[0]);
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  /**
   * Update voice settings locally
   * @param {Object} newSettings - New voice settings
   */
  const updateVoiceSettings = (newSettings) => {
    setVoiceSettings(prev => ({ ...prev, ...newSettings }));
    setPreferences(prev => ({
      ...prev,
      voice_settings: { ...prev.voice_settings, ...newSettings }
    }));
  };

  /**
   * Update general preferences locally
   * @param {Object} newPreferences - New preferences
   */
  const updatePreferences = (newPreferences) => {
    setPreferences(prev => ({ ...prev, ...newPreferences }));
  };

  /**
   * Save preferences to Base44
   * @returns {Promise<boolean>} Success status
   */
  const savePreferences = async () => {
    try {
      const existing = await base44.entities.UserPreferences.list();
      
      if (existing && existing.length > 0) {
        await base44.entities.UserPreferences.update(existing[0].id, preferences);
      } else {
        await base44.entities.UserPreferences.create(preferences);
      }
      
      return true;
    } catch (error) {
      console.error('Error saving preferences:', error);
      return false;
    }
  };

  /**
   * Update and save settings
   * @param {Object} newSettings - New settings to apply
   * @returns {Promise<boolean>} Success status
   */
  const updateSettings = async (newSettings) => {
    updatePreferences(newSettings);
    return await savePreferences();
  };

  return {
    voiceSettings,
    preferences,
    settings: preferences, // Alias for easier access
    isLoading,
    updateVoiceSettings,
    updatePreferences,
    updateSettings,
    savePreferences
  };
};

export default useTessaSettings;
