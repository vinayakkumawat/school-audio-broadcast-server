// import { v4 as uuidv4 } from 'uuid';
import { addAudio, removeAudio, getAudio } from '../data/store.js';

export const handleNewAudio = async (audioData) => {
  const audio = {
    id: audioData.id,
    userId: audioData.userId,
    url: audioData.url,
    createdAt: new Date().toISOString(),
    queue: 1,
    played: false,
  };

  await addAudio(audio);
  return audio;
};

export const handleAudioRemoved = async (audioId) => {
  const audio = await getAudio(audioId);
  if (!audio) {
    throw new Error('Audio not found');
  }
  await removeAudio(audioId);
};