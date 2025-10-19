// src/hooks/useAudio.js
import { useState, useRef, useEffect } from 'react';
import { AUDIO_CONFIG } from '../constants';
import fracturingAudio from '../assets/fracturing.mp3';
import neutralAudio from '../assets/neutral.mp3';
import unityAudio from '../assets/unity.mp3';

export function useAudio(meter, screen, isMuted) {
  const audioRefs = {
    fracturing: useRef(null),
    neutral: useRef(null),
    unity: useRef(null),
  };
  const [activeAudio, setActiveAudio] = useState('neutral');
  const [userInteracted, setUserInteracted] = useState(false);

  // Initialize audio elements
  useEffect(() => {
    audioRefs.fracturing.current = new Audio(fracturingAudio);
    audioRefs.neutral.current = new Audio(neutralAudio);
    audioRefs.unity.current = new Audio(unityAudio);
    
    Object.values(audioRefs).forEach(ref => {
      ref.current.loop = AUDIO_CONFIG.LOOP;
      ref.current.volume = AUDIO_CONFIG.VOLUME;
    });
  }, []);

  // Handle audio switching based on meter
  useEffect(() => {
    if (!userInteracted || isMuted || (screen !== 'game' && screen !== 'end')) {
      Object.values(audioRefs).forEach(ref => ref.current?.pause());
      return;
    }

    let targetAudio = 'neutral';
    if (meter <= -2) targetAudio = 'fracturing';
    else if (meter >= 2) targetAudio = 'unity';

    if (activeAudio !== targetAudio) {
      audioRefs[activeAudio].current?.pause();
      audioRefs[targetAudio].current?.play().catch(e => console.error("Audio play failed:", e));
      setActiveAudio(targetAudio);
    } else if (audioRefs[activeAudio].current?.paused) {
      audioRefs[activeAudio].current?.play().catch(e => console.error("Audio play failed:", e));
    }
  }, [meter, screen, isMuted, userInteracted, activeAudio]);

  return { userInteracted, setUserInteracted };
}