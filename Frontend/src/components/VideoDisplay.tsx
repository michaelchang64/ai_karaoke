import React from 'react';

interface VideoDisplayProps {
  videoId: string;
  videoTitle: string;
  thumbnail: string;
  audioRef: React.RefObject<HTMLAudioElement>;
  handleTimeUpdate: () => void;
}

const VideoDisplay: React.FC<VideoDisplayProps> = ({ videoId, videoTitle, thumbnail, audioRef, handleTimeUpdate }) => {
  return (
    <div className="mt-4 w-full max-w-md bg-gray-800 rounded-lg shadow-md">
      <div className="flex items-center mb-4">
        <img src={thumbnail} alt="Thumbnail" className="w-16 h-16 m-5" />
        <div>
          <h2 className="text-lg font-bold">{videoTitle}</h2>
        </div>
      </div>
      <audio controls className="w-full" ref={audioRef} onTimeUpdate={handleTimeUpdate}>
        <source src={`http://localhost:8000/play/${videoId}`} type="audio/wav" />
        Your browser does not support the audio element.
      </audio>
      <a
        href={`http://localhost:8000/play/${videoId}`}
        download={`${videoId}.wav`}
        className="bg-green-500 text-white px-4 py-2 rounded mt-2 inline-block"
      >
        Download
      </a>
    </div>
  );
};

export default VideoDisplay;