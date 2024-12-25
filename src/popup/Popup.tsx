import React, { useEffect, useState } from 'react';
import './Popup.css';

interface VideoDetails {
 videoId: string;
 title: string;
 status: 'idle' | 'processing' | 'completed' | 'error';
 content?: string;
 error?: string;
}

interface Settings {
 length: 'short' | 'medium' | 'long';
 focus_areas: string[];
 language: string;
}

const DEFAULT_SETTINGS: Settings = {
 length: 'medium',
 focus_areas: ['balanced_overview'], 
 language: 'en'
};

const Popup: React.FC = () => {
 const [videoUrl, setVideoUrl] = useState('');
 const [summary, setSummary] = useState<VideoDetails>({ videoId: '', title: '', status: 'idle' });
 const [transcript, setTranscript] = useState<VideoDetails>({ videoId: '', title: '', status: 'idle' });
 const [showTranscript, setShowTranscript] = useState(false);
 const [showSettings, setShowSettings] = useState(false);
 const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

 const saveSettings = async (newSettings: Settings) => {
   try {
     await chrome.storage.sync.set({ yousum_settings: newSettings });
     setSettings(newSettings);
   } catch (error) {
     console.error('Error saving settings:', error);
   }
 };

 useEffect(() => {
   const initialize = async () => {
     try {
       const result = await chrome.storage.sync.get(['yousum_settings']);
       if (result.yousum_settings) {
         setSettings(result.yousum_settings);
       }
       const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
       if (tab.url?.includes('youtube.com/watch')) {
         setVideoUrl(tab.url);
         setSummary(prev => ({ ...prev, status: 'processing' }));
         fetchSummary(tab.url);
       }
     } catch (error) {
       console.error('Error initializing:', error);
     }
   };
   initialize();
 }, []);

 const pollResult = async (resultUrl: string, type: 'summary' | 'transcript', retryCount = 0) => {
   try {
     const fullUrl = `http://127.0.0.1:5000${resultUrl}`;
     const response = await fetch(fullUrl);
     const data = await response.json();

     if (data.status === 'completed') {
       const setter = type === 'summary' ? setSummary : setTranscript;
       setter({
         videoId: data.video_id,
         title: 'YouTube Video',
         status: 'completed',
         content: data.result
       });
     } else if (data.status === 'processing' && retryCount < 30) {
       setTimeout(() => pollResult(resultUrl, type, retryCount + 1), 2000);
     }
   } catch (error) {
     const setter = type === 'summary' ? setSummary : setTranscript;
     setter({
       videoId: '',
       title: '',
       status: 'error',
       error: error instanceof Error ? error.message : 'An error occurred'
     });
   }
 };

 const fetchSummary = async (url: string) => {
   const queryParams = new URLSearchParams({
     url,
     length: settings.length,
     language: settings.language
   });
 
   const focus = settings.focus_areas.length > 0 ? settings.focus_areas : ['balanced_overview'];
   focus.forEach(area => queryParams.append('focus_areas', area));
   
   const apiUrl = `http://127.0.0.1:5000/api/summarize?${queryParams}`;
   setSummary(prev => ({ ...prev, status: 'processing' }));
  
   try {
     const response = await fetch(apiUrl);
     const data = await response.json();
 
     if (data.status === 'completed') {
       setSummary({
         videoId: data.video_id,
         title: 'YouTube Video',
         status: 'completed',
         content: data.result
       });
     } else if (data.result_url) {
       pollResult(data.result_url, 'summary');
     }
   } catch (error) {
     setSummary({
       videoId: '',
       title: '',
       status: 'error',
       error: error instanceof Error ? error.message : 'An error occurred'
     });
   }
 };

 const fetchTranscript = async () => {
   if (!videoUrl) return;
   const apiUrl = `http://127.0.0.1:5000/api/transcript?url=${encodeURIComponent(videoUrl)}&language=${settings.language}`;
   setTranscript(prev => ({ ...prev, status: 'processing' }));

   try {
     const response = await fetch(apiUrl);
     const data = await response.json();

     if (data.status === 'completed') {
       setTranscript({
         videoId: data.video_id,
         title: 'YouTube Video',
         status: 'completed',
         content: data.result
       });
     } else if (data.result_url) {
       pollResult(data.result_url.replace('/api/result/', '/api/transcript/result/'), 'transcript');
     }
   } catch (error) {
     setTranscript({
       videoId: '',
       title: '',
       status: 'error',
       error: error instanceof Error ? error.message : 'An error occurred'
     });
   }
 };

 const handleToggle = () => {
   const newShowTranscript = !showTranscript;
   setShowTranscript(newShowTranscript);
   if (newShowTranscript && transcript.status === 'idle') {
     fetchTranscript();
   }
 };

 const formatSummaryContent = (content: string) => {
   return content.split('\n').map((line, index) => {
     if (line.match(/^\d+\.\s*(Genre|Emotion\/tone|Point-wise Summary|Summary|Key takeaway)/)) {
       const labelMatch = line.match(/^(\d+\.)\s*(.*?):/);
       if (labelMatch) {
         const [_, number, label] = labelMatch;
         const content = line.split(':')[1] || '';
         return (
           <p key={index} className="summary-line">
             {number} <span className="text-teal-500">{label}</span>:{content}
           </p>
         );
       }
     }
     return line.trim() ? (
       <p key={index} className={`summary-line ${line.startsWith('-') ? 'summary-point' : ''}`}>
         {line}
       </p>
     ) : null;
   });
 };

 const renderContent = (type: 'summary' | 'transcript') => {
   const data = type === 'summary' ? summary : transcript;
   
   return (
     <div className="content-box">
       {data.status === 'processing' && (
         <div className="processing-state">
           <div className="spinner"></div>
           <span>{type === 'summary' ? 'Generating summary...' : 'Fetching transcript...'}</span>
         </div>
       )}
       {data.status === 'completed' && data.content && (
         <div className="scrollable-content">
           {type === 'summary' ? formatSummaryContent(data.content) : data.content}
         </div>
       )}
       {data.status === 'error' && (
         <div className="error-state">
           <div className="error-icon">
             <svg viewBox="0 0 24 24" fill="currentColor" width="64" height="64">
               <circle cx="12" cy="12" r="11" fill="#000"/>
               <path d="M15.536 8.464a1 1 0 00-1.414 0L12 10.586l-2.122-2.122a1 1 0 00-1.414 1.414L10.586 12l-2.122 2.122a1 1 0 101.414 1.414L12 13.414l2.122 2.122a1 1 0 001.414-1.414L13.414 12l2.122-2.122a1 1 0 000-1.414z" fill="#fff"/>
             </svg>
           </div>
           <p className="error-message">{data.error || `Failed to fetch ${type}`}</p>
         </div>
       )}
     </div>
   );
 };

 return (
   <div className="popup">
     <div className="header">
       <div className="brand">
         <img src="logo.png" alt="YouSUM Logo" className="logo" />
         <h3>YouSUM</h3>
       </div>
       <div className="header-controls">
         <label className="switch">
           <input type="checkbox" checked={showTranscript} onChange={handleToggle} />
           <span className="slider"></span>
         </label>
         <button className="settings-button" onClick={() => setShowSettings(true)} aria-label="Settings">
           <svg viewBox="0 0 24 24" width="20" height="20">
             <path fill="currentColor" d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98 0 .33.03.65.07.97l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65z"/>
           </svg>
         </button>
       </div>
     </div>
     
     {videoUrl ? (
       <>
         <input type="text" value={videoUrl} readOnly className="url-input" />
         <div className="content-section">
           <div className="section-title">{showTranscript ? 'Transcript' : 'Summary'}</div>
           {renderContent(showTranscript ? 'transcript' : 'summary')}
         </div>
       </>
     ) : (
       <div className="message-box">
         This extension works on YouTube video pages only
       </div>
     )}

     <div className={`settings-modal ${showSettings ? 'show' : ''}`}>
       <div className="settings-content">
         <div className="settings-header">
           <h4>Settings</h4>
           <button className="close-button" onClick={() => setShowSettings(false)}>×</button>
         </div>

         <div className="setting-group">
           <label>Summary Length</label>
           <select 
             value={settings.length}
             onChange={(e) => {
               const newSettings = { ...settings, length: e.target.value as 'short' | 'medium' | 'long' };
               saveSettings(newSettings);
               if (videoUrl) fetchSummary(videoUrl);
             }}
           >
             <option value="short">Short</option>
             <option value="medium">Medium</option>
             <option value="long">Long</option>
           </select>
         </div>

         <div className="setting-group">
           <label>Focus Areas</label>
           <div className="checkbox-group">
             {[
               { value: 'technical_details', label: 'Technical Details' },
               { value: 'key_points', label: 'Key Points' },
               { value: 'action_items', label: 'Action Items' }
             ].map(({ value, label }) => (
               <label key={value} className="checkbox-label">
                 <input
                   type="checkbox"
                   checked={settings.focus_areas.includes(value)}
                   onChange={(e) => {
                     const newAreas = e.target.checked
                       ? [...settings.focus_areas, value]
                       : settings.focus_areas.filter(a => a !== value);
                     const newSettings = { ...settings, focus_areas: newAreas };
                     saveSettings(newSettings);
                     if (videoUrl) fetchSummary(videoUrl);
                   }}
                 />
                 <span>{label}</span>
               </label>
             ))}
           </div>
         </div>

         <div className="setting-group">
           <label>Language</label>
           <select
             value={settings.language}
             onChange={(e) => {
               const newSettings = { ...settings, language: e.target.value };
               saveSettings(newSettings);
               if (videoUrl) fetchSummary(videoUrl);
             }}
           >
             {[
               { code: 'en', name: 'English' },
               { code: 'es', name: 'Spanish' },
               { code: 'fr', name: 'French' },
               { code: 'de', name: 'German' },
               { code: 'zh', name: 'Chinese' },
               { code: 'ja', name: 'Japanese' },
               { code: 'ko', name: 'Korean' },
               { code: 'ru', name: 'Russian' },
               { code: 'ar', name: 'Arabic' },
               { code: 'hi', name: 'Hindi' }
             ].map(lang => (
               <option key={lang.code} value={lang.code}>{lang.name}</option>
             ))}
           </select>
         </div>

         <button 
           className="save-button" 
           onClick={() => {
             setSummary({ videoId: '', title: '', status: 'idle', content: '' });
             setShowSettings(false);
             if (videoUrl) {
               fetchSummary(videoUrl);
             }
           }}
         >
           Close
         </button>
       </div>
     </div>
   </div>
 );
};

export default Popup;