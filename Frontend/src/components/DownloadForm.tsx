import React, { useState } from 'react';

interface DownloadFormProps {
  onSubmit: (url: string) => Promise<void>;
  loading: boolean;
  error: string;
}

const DownloadForm: React.FC<DownloadFormProps> = ({ onSubmit, loading, error }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(url);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-md flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4 text-center">YouTube to WAV</h1>
      <input
        type="text"
        placeholder="Enter YouTube URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="border p-2 w-full mb-4 bg-gray-700 rounded-lg text-white"
      />
      <button
        type="submit"
        className={`ease-out duration-300 rounded-lg bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white px-4 py-2 w-1/2${
          loading ? ' opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Download'}
      </button>
      {error && <p className="text-red-500 mt/2">{error}</p>}
    </form>
  );
};

export default DownloadForm;