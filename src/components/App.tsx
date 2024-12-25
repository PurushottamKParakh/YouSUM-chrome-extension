import React, { useState } from 'react';

// Replace axios-based API calls with fetch and remove external dependencies
const fetchVideoSummary = async (videoUrl: string): Promise<string> => {
  try {
    // Replace with your actual backend URL
    const response = await fetch('https://your-backend-service.com/api/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ videoUrl })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch summary');
    }

    const data = await response.json();
    return data.summary;
  } catch (error) {
    console.error('Error fetching summary:', error);
    throw error;
  }
};

const fetchVideoTranscript = async (videoUrl: string): Promise<string> => {
  try {
    // Replace with your actual backend URL
    const response = await fetch('https://your-backend-service.com/api/transcript', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ videoUrl })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch transcript');
    }

    const data = await response.json();
    return data.transcript;
  } catch (error) {
    console.error('Error fetching transcript:', error);
    throw error;
  }
};

const App: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [transcript, setTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Function to extract YouTube URL from current tab
  const extractYouTubeUrl = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.url && tab.url.includes('youtube.com/watch')) {
        setVideoUrl(tab.url);
      }
    } catch (error) {
      console.error('Error fetching current tab URL:', error);
    }
  };

  // Generate summary handler
  const handleGenerateSummary = async () => {
    if (!videoUrl) return;

    setIsLoading(true);
    try {
      const summaryText = await fetchVideoSummary(videoUrl);
      setSummary(summaryText);
    } catch (error) {
      console.error('Failed to generate summary:', error);
    }
    setIsLoading(false);
  };

  // Show transcript handler
  const handleShowTranscript = async () => {
    if (!videoUrl) return;

    setIsLoading(true);
    try {
      const transcriptText = await fetchVideoTranscript(videoUrl);
      setTranscript(transcriptText);
    } catch (error) {
      console.error('Failed to fetch transcript:', error);
    }
    setIsLoading(false);
  };

  // Extract URL on component mount
  React.useEffect(() => {
    extractYouTubeUrl();
  }, []);

  return (
    <div className="w-[400px] p-4 bg-white">
      <h1 className="text-xl font-bold mb-4">YouTube Video Summarizer</h1>
      
      {/* Video URL Display */}
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Current Video URL:</label>
        <input 
          type="text" 
          value={videoUrl} 
          readOnly 
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2 mb-4">
        <button 
          onClick={handleGenerateSummary}
          disabled={isLoading || !videoUrl}
          className="flex-1 bg-blue-500 text-white p-2 rounded disabled:opacity-50"
        >
          {isLoading ? 'Generating...' : 'Generate Summary'}
        </button>
        <button 
          onClick={handleShowTranscript}
          disabled={isLoading || !videoUrl}
          className="flex-1 bg-green-500 text-white p-2 rounded disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Show Transcript'}
        </button>
      </div>

      {/* Results Area */}
      {summary && (
        <div className="mt-4">
          <h2 className="font-bold mb-2">Summary:</h2>
          <textarea 
            readOnly 
            value={summary}
            className="w-full p-2 border rounded h-40 resize-none"
          />
        </div>
      )}

      {transcript && (
        <div className="mt-4">
          <h2 className="font-bold mb-2">Transcript:</h2>
          <textarea 
            readOnly 
            value={transcript}
            className="w-full p-2 border rounded h-40 resize-none"
          />
        </div>
      )}
    </div>
  );
};

export default App;