import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const SettingsPanel = ({ onClose, onSettingsUpdate }) => {
  const [preferences, setPreferences] = useState({
    preferred_name: '',
    location: '',
    timezone: '',
    voice_settings: {
      speech_rate: 1.0,
      pitch: 1.1,
      volume: 1.0,
      preferred_voice_name: ''
    }
  });
  const [availableVoices, setAvailableVoices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const prefs = await base44.entities.UserPreferences.list();
        if (prefs && prefs.length > 0) {
          setPreferences(prefs[0]);
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };

    const loadVoices = () => {
      const synth = window.speechSynthesis;
      const voices = synth.getVoices();
      setAvailableVoices(voices.filter(v => v.lang.startsWith('en')));
    };

    loadPreferences();
    loadVoices();
    
    const synth = window.speechSynthesis;
    synth.onvoiceschanged = loadVoices;

    return () => {
      synth.onvoiceschanged = null;
    };
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const existing = await base44.entities.UserPreferences.list();
      
      if (existing && existing.length > 0) {
        await base44.entities.UserPreferences.update(existing[0].id, preferences);
      } else {
        await base44.entities.UserPreferences.create(preferences);
      }
      
      toast.success('Settings saved successfully!');
      if (onSettingsUpdate) {
        onSettingsUpdate(preferences);
      }
      onClose();
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-purple-900/90 to-rose-900/90 rounded-2xl p-6 w-full max-w-md border border-purple-400/20 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-300" />
            <h2 className="text-xl font-bold text-white">Tessa Settings</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5 text-purple-300" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="preferred_name" className="text-purple-200">Preferred Name</Label>
            <Input
              id="preferred_name"
              value={preferences.preferred_name}
              onChange={(e) => setPreferences({...preferences, preferred_name: e.target.value})}
              placeholder="What should I call you?"
              className="bg-purple-950/50 border-purple-400/20 text-white"
            />
          </div>

          <div>
            <Label htmlFor="location" className="text-purple-200">Location</Label>
            <Input
              id="location"
              value={preferences.location}
              onChange={(e) => setPreferences({...preferences, location: e.target.value})}
              placeholder="City, Country"
              className="bg-purple-950/50 border-purple-400/20 text-white"
            />
          </div>

          <div>
            <Label htmlFor="voice" className="text-purple-200">Voice</Label>
            <Select
              value={preferences.voice_settings?.preferred_voice_name}
              onValueChange={(value) => setPreferences({
                ...preferences,
                voice_settings: {...preferences.voice_settings, preferred_voice_name: value}
              })}
            >
              <SelectTrigger className="bg-purple-950/50 border-purple-400/20 text-white">
                <SelectValue placeholder="Select a voice" />
              </SelectTrigger>
              <SelectContent>
                {availableVoices.map((voice) => (
                  <SelectItem key={voice.name} value={voice.name}>
                    {voice.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-purple-200">Speech Rate: {preferences.voice_settings?.speech_rate?.toFixed(1)}</Label>
            <Slider
              value={[preferences.voice_settings?.speech_rate || 1.0]}
              onValueChange={([value]) => setPreferences({
                ...preferences,
                voice_settings: {...preferences.voice_settings, speech_rate: value}
              })}
              min={0.5}
              max={2.0}
              step={0.1}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-purple-200">Pitch: {preferences.voice_settings?.pitch?.toFixed(1)}</Label>
            <Slider
              value={[preferences.voice_settings?.pitch || 1.1]}
              onValueChange={([value]) => setPreferences({
                ...preferences,
                voice_settings: {...preferences.voice_settings, pitch: value}
              })}
              min={0.5}
              max={2.0}
              step={0.1}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-purple-200">Volume: {preferences.voice_settings?.volume?.toFixed(1)}</Label>
            <Slider
              value={[preferences.voice_settings?.volume || 1.0]}
              onValueChange={([value]) => setPreferences({
                ...preferences,
                voice_settings: {...preferences.voice_settings, volume: value}
              })}
              min={0}
              max={1.0}
              step={0.1}
              className="mt-2"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-purple-400/20 text-purple-200 hover:bg-purple-800/50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500"
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;