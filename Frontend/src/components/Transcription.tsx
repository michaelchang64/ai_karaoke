import React, { useState, useEffect, useRef } from 'react';
import EditableWordComponent from './EditableWordComponent';

interface Word {
  word: string;
  start: number;
  end: number;
}

interface Segment {
  words: Word[];
}

interface TranscriptionData {
  segments: Segment[];
}

interface TranscriptionProps {
  transcription: TranscriptionData | null; // Allow transcription to be null initially
  currentWordIndex: number | null;
  transcribing: boolean;
  error: string;
  progress: string;
  onTranscribe: () => Promise<void>;
  transcriptionModel: string;
  setTranscriptionModel: React.Dispatch<React.SetStateAction<string>>;
  audioRef: React.RefObject<HTMLAudioElement>;
  videoId: string;
}

const Transcription: React.FC<TranscriptionProps> = ({
  transcription,
  currentWordIndex,
  transcribing,
  error,
  progress,
  onTranscribe,
  transcriptionModel,
  setTranscriptionModel,
  audioRef,
  videoId,
}) => {
  const [viewMode, setViewMode] = useState<'block' | 'scroll'>('block');
  const [highlightColor, setHighlightColor] = useState('#ffeb3b');
  const [fontSize, setFontSize] = useState(24);
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const toggleViewMode = () => {
    setViewMode((prevMode) => (prevMode === 'block' ? 'scroll' : 'block'));
  };

  const increaseFontSize = () => setFontSize((size) => Math.min(size + 2, 48));
  const decreaseFontSize = () => setFontSize((size) => Math.max(size - 2, 16));

  const handleWordClick = (index: number, startTime: number) => {
    setSelectedWordIndex(index);
    if (audioRef.current) {
      audioRef.current.currentTime = startTime;
      audioRef.current.play();
    }
  };

  const handleSave = async (updatedWord: string, updatedStart: number, updatedEnd: number) => {
    if (selectedWordIndex !== null && transcription) {
      const updatedTranscription = { ...transcription };
      const word = updatedTranscription.segments.flatMap((segment) => segment.words)[selectedWordIndex];
      word.word = updatedWord;
      word.start = updatedStart;
      word.end = updatedEnd;

      // Send updated transcription to the backend
      try {
        await fetch('http://localhost:8000/update-transcription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            video_id: videoId,
            segments: updatedTranscription.segments,
          }),
        });
      } catch (error) {
        console.error('Error updating transcription:', error);
      }
    }
  };

  useEffect(() => {
    if (viewMode === 'scroll' && scrollRef.current && currentWordIndex !== null) {
      const wordElements = scrollRef.current.querySelectorAll('span');
      const currentWordElement = wordElements[currentWordIndex];
      if (currentWordElement) {
        currentWordElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentWordIndex, viewMode]);

  const handleTranscribe = async () => {
    // Reset transcription state before starting a new transcription
    setSelectedWordIndex(null);
    await onTranscribe();
  };

  const renderTranscription = () => {
    if (!transcription || !transcription.segments) {
      return null;
    }

    return (
      <div
        ref={scrollRef}
        className={`mt-4 bg-gray-800 p-4 rounded ${viewMode === 'block' ? 'overflow-auto' : 'overflow-x-scroll whitespace-nowrap'}`}
      >
        <h3 className="text-lg font-bold mb-2">Transcription:</h3>
        <div style={{ fontSize: `${fontSize}px` }}>
          {transcription.segments.flatMap((segment) => segment.words).map((word, index) => (
            <span
              key={index}
              onClick={() => handleWordClick(index, word.start)}
              className={`transition-all duration-300 cursor-pointer hover:underline`}
              style={{ backgroundColor: index === currentWordIndex ? highlightColor : 'transparent' }}
            >
              {word.word}{' '}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-4 w-full max-w-3xl">
      <label htmlFor="model" className="block mb-2 text-lg">Select Transcription Model:</label>
      <select
        id="model"
        value={transcriptionModel}
        onChange={(e) => setTranscriptionModel(e.target.value)}
        className="border p-2 w-full mb-4 bg-gray-700 text-white"
      >
        <option value="mlx-community/whisper-base-mlx">Whisper Base MLX</option>
        <option value="mlx-community/whisper-turbo">Whisper Turbo</option>
        <option value="mlx-community/whisper-large-v3-turbo">Whisper Large V3 Turbo</option>
        <option value="mlx-community/distil-whisper-large-v3">Distil Whisper Large V3</option>
      </select>
      <button
        onClick={handleTranscribe}
        className={`bg-purple-500 text-white px-4 py-2 rounded w-full ${
          transcribing ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={transcribing}
      >
        {transcribing ? 'Transcribing...' : 'Transcribe'}
      </button>
      {transcribing && <p className="text-yellow-500 mt-2">Transcription in progress... {progress}</p>}
      {!transcribing && error && <p className="text-red-500 mt-2">{error}</p>}
      <div className="flex items-center mt-4">
        <button
          onClick={toggleViewMode}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          Toggle View Mode
        </button>
        <button
          onClick={decreaseFontSize}
          className="bg-gray-500 text-white px-2 py-1 rounded mr-2"
        >
          -
        </button>
        <button
          onClick={increaseFontSize}
          className="bg-gray-500 text-white px-2 py-1 rounded mr-2"
        >
          +
        </button>
        <input
          type="color"
          value={highlightColor}
          onChange={(e) => setHighlightColor(e.target.value)}
          className="ml-2"
        />
      </div>
      {renderTranscription()}
      {selectedWordIndex !== null && transcription && transcription.segments.length > 0 && (
        <EditableWordComponent
          word={transcription.segments.flatMap((segment) => segment.words)[selectedWordIndex].word}
          start={transcription.segments.flatMap((segment) => segment.words)[selectedWordIndex].start}
          end={transcription.segments.flatMap((segment) => segment.words)[selectedWordIndex].end}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Transcription;