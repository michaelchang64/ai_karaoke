import React, { useState, useEffect, useRef } from 'react';
import DownloadForm from './DownloadForm';
import VideoDisplay from './VideoDisplay';
import Transcription from './Transcription';
import { downloadVideo, transcribeVideo } from '../api';

interface TranscriptionState {
  data: any;
  loading: boolean;
  error: string;
  progress: string;
}

const YouTubeDownloader: React.FC = () => {
  const [videoId, setVideoId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [transcriptionModel, setTranscriptionModel] = useState('mlx-community/whisper-base-mlx');
  const [transcription, setTranscription] = useState<TranscriptionState>({
    data: null,
    loading: false,
    error: '',
    progress: '',
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState<number | null>(null);

  const handleDownload = async (url: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await downloadVideo(url);
      const videoId = url.split('v=')[1].split('&')[0];
      setVideoId(videoId);
      setVideoTitle(data.title);
      setThumbnail(`https://img.youtube.com/vi/${videoId}/0.jpg`);
    } catch (error) {
      setError('Error downloading. Please check the URL.');
    } finally {
      setLoading(false);
    }
  };

  const handleTranscribe = async () => {
    if (!videoId) return;

    setTranscription((prevState) => ({
      ...prevState,
      loading: true,
      error: '',
    }));

    try {
      const result = await transcribeVideo(videoId, transcriptionModel);
      setTranscription({
        data: result,
        loading: false,
        error: '',
        progress: '',
      });
    } catch (error) {
      setTranscription({
        data: null,
        loading: false,
        error: 'Failed to transcribe. Please try again.',
        progress: '',
      });
    }
  };

  useEffect(() => {
    if (videoId) {
      const audioElement = audioRef.current;
      if (audioElement) {
        audioElement.src = `http://localhost:8000/play/${videoId}`;
        audioElement.load();
      }
    }
  }, [videoId]);

  const handleTimeUpdate = () => {
    const audioElement = audioRef.current;
    if (audioElement && transcription.data && transcription.data.segments) {
      const currentTime = audioElement.currentTime;
      const words = transcription.data.segments.flatMap((segment: any) => segment.words);
      const currentWord = words.find((word: any, index: number) => {
        if (currentTime >= word.start && currentTime <= word.end) {
          setCurrentWordIndex(index);
          return true;
        }
        return false;
      });
      if (!currentWord) {
        setCurrentWordIndex(null);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <DownloadForm onSubmit={handleDownload} loading={loading} error={error} />
      {videoId && (
        <>
          <VideoDisplay
            videoId={videoId}
            videoTitle={videoTitle}
            thumbnail={thumbnail}
            audioRef={audioRef}
            handleTimeUpdate={handleTimeUpdate}
          />
          <Transcription
            transcription={transcription.data}
            currentWordIndex={currentWordIndex}
            transcribing={transcription.loading}
            error={transcription.error}
            progress={transcription.progress}
            onTranscribe={handleTranscribe}
            transcriptionModel={transcriptionModel}
            setTranscriptionModel={setTranscriptionModel}
            audioRef={audioRef}
            videoId={videoId}
          />
        </>
      )}
    </div>
  );
};

export default YouTubeDownloader;