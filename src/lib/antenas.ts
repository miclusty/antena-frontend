/** @jsxImportSource solid-js */
import { createSignal, createEffect } from 'solid-js';

export interface AntennaLocation {
  id: number;
  name: string;
  province: string;
}

const STORAGE_KEY = 'antena-antennas';

export function useAntennas() {
  const loadAntennas = (): AntennaLocation[] => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  };

  const [antennas, setAntennas] = createSignal<AntennaLocation[]>(loadAntennas());

  createEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(antennas()));
    }
  });

  const addAntenna = (location: AntennaLocation) => {
    setAntennas(prev => {
      if (prev.some(a => a.id === location.id)) return prev;
      return [...prev, location];
    });
  };

  const removeAntenna = (id: number) => {
    setAntennas(prev => prev.filter(a => a.id !== id));
  };

  const isAntenna = (id: number) => antennas().some(a => a.id === id);

  const clearAntennas = () => {
    setAntennas([]);
  };

  return { antennas, addAntenna, removeAntenna, isAntenna, clearAntennas };
}