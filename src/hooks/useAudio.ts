// src/hooks/useAudio.ts
import { useEffect, useRef, useState } from 'react';
import type { AudioTrack } from '../engine/types';

// Import the audio files directly
import neutralMp3 from '../assets/neutral.mp3';
import unityMp3 from '../assets/unity.mp3';
import fracturingMp3 from '../assets/fracturing.mp3';

interface UseAudioReturn {
  play: () => void;
  pause: () => void;
  setVolume: (volume: number) => void;
  switchTrack: (track: AudioTrack) => void;
  currentTrack: AudioTrack;
  isPlaying: boolean;
}

export function useAudio(initialVolume: number = 0.6): UseAudioReturn {
  const [currentTrack, setCurrentTrack] = useState<AudioTrack>('neutral');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<number | null>(null);

  // Track map with imported files
  const trackMap: Record<AudioTrack, string> = {
    neutral: neutralMp3,
    unity: unityMp3,
    fracturing: fracturingMp3
  };

  // Load audio file based on track
  const loadTrack = (track: AudioTrack) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    try {
      audioRef.current = new Audio(trackMap[track]);
      audioRef.current.volume = initialVolume;
      audioRef.current.loop = true;
      
      if (isPlaying) {
        audioRef.current.play().catch(err => console.warn('Audio play failed:', err));
      }
    } catch (error) {
      console.warn('Failed to load audio track:', error);
    }
  };

  // Initialize with neutral track
  useEffect(() => {
    loadTrack('neutral');
    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const play = () => {
    if (audioRef.current && !isPlaying) {
      audioRef.current.play().catch(err => console.warn('Audio play failed:', err));
      setIsPlaying(true);
    }
  };

  const pause = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const setVolume = (volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  };

  const switchTrack = (newTrack: AudioTrack) => {
    if (newTrack === currentTrack) return;

    // Crossfade: fade out current, load new, fade in
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }

    const originalVolume = audioRef.current?.volume || initialVolume;
    let fadeOutVolume = originalVolume;

    fadeIntervalRef.current = window.setInterval(() => {
      if (audioRef.current) {
        fadeOutVolume -= 0.05;
        if (fadeOutVolume <= 0) {
          audioRef.current.volume = 0;
          clearInterval(fadeIntervalRef.current!);
          
          // Load new track
          setCurrentTrack(newTrack);
          loadTrack(newTrack);
          
          // Fade in new track
          let fadeInVolume = 0;
          fadeIntervalRef.current = window.setInterval(() => {
            if (audioRef.current) {
              fadeInVolume += 0.05;
              if (fadeInVolume >= originalVolume) {
                audioRef.current.volume = originalVolume;
                clearInterval(fadeIntervalRef.current!);
              } else {
                audioRef.current.volume = fadeInVolume;
              }
            }
          }, 100);
        } else {
          audioRef.current.volume = fadeOutVolume;
        }
      }
    }, 100);
  };

  return {
    play,
    pause,
    setVolume,
    switchTrack,
    currentTrack,
    isPlaying
  };
}