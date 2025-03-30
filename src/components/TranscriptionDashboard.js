import React, { useState, useRef, useEffect } from 'react';
import AudioUploader from './AudioUploader';
import TranscriptionHistory from './TranscriptionHistory';
import BillingAndUserControls from './BillingAndUserControls';
import SubscriptionPanel from './SubscriptionPanel';
import { useAuth } from '../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';
import { 
  MenuIcon, 
  XIcon, 
  SunIcon, 
  MoonIcon, 
  PaletteIcon 
} from 'lucide-react';

const MarkdownControls = ({ onApplyMarkdown }) => {
  const markdownStyles = [
    { name: 'Header 1', markdown: '# ' },
    { name: 'Header 2', markdown: '## ' },
    { name: 'Bold', markdown: '**', surroundSelection: true },
    { name: 'Italic', markdown: '*', surroundSelection: true },
    { name: 'Link', markdown: '[text](url)', surroundSelection: true },
    { name: 'Code', markdown: '`', surroundSelection: true },
    { name: 'Code Block', markdown: '```\n', endMarkdown: '\n```', surroundSelection: true },
    { name: 'Quote', markdown: '> ' },
    { name: 'List', markdown: '- ' },
  ];
  

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {markdownStyles.map((style) => (
        <button
          key={style.name}
          onClick={() => onApplyMarkdown(style)}
          className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs hover:bg-indigo-200 transition-colors"
        >
          {style.name}
        </button>
      ))}
    </div>
  );
};

const TranscriptionDashboard = () => {
  const [transcription, setTranscription] = useState('');
  // const [theme, setTheme] = useState('light');
  const [editMode, setEditMode] = useState(false);
  const [previewMode, setPreviewMode] = useState(true);
  const [previewedItemId, setPreviewedItemId] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const {textareaRef, editorRef} = useRef(null);
  const { token, theme, setTheme } = useAuth();

  // Responsive check
  useEffect(() => {
    const checkMobile = () => {
      // setIsMobile(window.innerWidth <= 768);
      setIsMobile(window.innerWidth <= 1080);
    };
    
    // Check on mount and add resize listener
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Cleanup listener
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const themes = {
    light: {
      background: 'bg-white',
      text: 'text-gray-800',
      sidebar: 'bg-gray-100',
    },
    dark: {
      background: 'bg-gray-900',
      text: 'text-gray-100',
      sidebar: 'bg-gray-800',
    },
    sepia: {
      background: 'bg-[#F4ECD8]',
      text: 'text-gray-800',
      sidebar: 'bg-[#E7DFC6]',
    }
  };

  const handleTranscriptionComplete = (data) => {
    setTranscription(data.transcribed_text);
    setEditMode(true);
    setPreviewMode(false);
  };

  const handleApplyMarkdown = (style) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = transcription.substring(start, end);

    let newText;
    if (style.surroundSelection) {
      newText = `${style.markdown}${selectedText}${style.endMarkdown || style.markdown}`;
    } else {
      newText = style.markdown + selectedText;
    }

    const updatedText = 
      transcription.slice(0, start) + 
      newText + 
      transcription.slice(end);

    setTranscription(updatedText);

    // Set cursor position after inserted markdown
    setTimeout(() => {
      textarea.selectionStart = start + style.markdown.length;
      textarea.selectionEnd = start + newText.length;
      textarea.focus();
    }, 0);
  };

  const togglePreviewMode = () => {
    setPreviewMode(!previewMode);
  };

  const scroll = (target) => {
    if (target.current) {
      target.current.scrollIntoView({
        behavior: "smooth",
        block: "center", // Ensures it's centered in the viewport
      });
    }
  };
  
  const handlePreviewTranscription = (item) => {
    setTranscription(item.transcribed_text);
    setEditMode(true);
    setPreviewMode(true);
    setPreviewedItemId(item.id);
    if (editorRef?.current) {
      scroll(editorRef);
    }
  };

  const onPreviewTranscription = (item) => {
    setTranscription(item.transcribed_text);
    setEditMode(true);
    setPreviewMode(true);
    setPreviewedItemId(item.id);
  };

  const currentTheme = themes[theme];

  // Mobile Sidebar Component
  const MobileSidebar = () => (
    <div 
      className={`fixed inset-0 z-50 ${currentTheme.background} ${currentTheme.text} 
        ${isMobileSidebarOpen ? 'translate-x-0' : 'translate-x-full'} 
        transition-transform duration-300 ease-in-out`}
    >
      <div className="flex justify-between items-center p-2 pr-0 border-b">
        <h3 className="text-xl font-bold">Dashboard Controls</h3>
        <button 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="text-gray-600 hover:text-gray-300"
        >
          <XIcon className="w-6 h-6" />
        </button>
      </div>
      
      <div className="p-4">
        {/* Theme Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Theme</label>
          <div className="flex space-x-2">
            {Object.keys(themes).map((themeKey) => (
              <button
                key={themeKey}
                onClick={() => {
                  setTheme(themeKey);
                  // setIsMobileSidebarOpen(false);
                }}
                className={`px-3 py-1 rounded text-xs flex items-center ${
                  theme === themeKey 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {themeKey === 'light' && <SunIcon className="w-4 h-4 mr-1" />}
                {themeKey === 'dark' && <MoonIcon className="w-4 h-4 mr-1" />}
                {themeKey === 'sepia' && <PaletteIcon className="w-4 h-4 mr-1" />}
                {themeKey.charAt(0).toUpperCase() + themeKey.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Edit Toggle */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Edit Mode</label>
          <button
            onClick={() => {
              setEditMode(!editMode);
              setIsMobileSidebarOpen(false);
            }}
            className={`px-3 py-1 rounded text-xs ${
              editMode 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {editMode ? 'Editing' : 'Edit'}
          </button>
        </div>
        <BillingAndUserControls />
      </div>
    </div>
  );

  // Render for Mobile
  if (isMobile) {
    return (
      <div className={`flex flex-col h-screen ${currentTheme.background} ${currentTheme.text}`}>
        {/* Mobile Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <button 
            onClick={() => setIsMobileSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-200"
          >
            <MenuIcon className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Transcription Dashboard</h1>
          <div>{/* Placeholder for symmetry */}</div>
        </div>

        {/* Mobile Content - Scrollable */}
        <div className="flex-1 overflow-auto">
          <AudioUploader onTranscriptionComplete={handleTranscriptionComplete} />
          <TranscriptionHistory 
            onPreviewTranscription={handlePreviewTranscription} 
          />

          {/* Transcription Editor */}
          <div className="p-4 pr-0">
            <div ref={editorRef} className="flex justify-between items-center mb-4" >
              <h2 className="text-2xl font-bold">Transcription Editor</h2>
              {editMode && (
                <button
                  onClick={togglePreviewMode}
                  className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition-colors"
                >
                  {previewMode ? 'Edit' : 'Preview'}
                </button>
              )}
            </div>
            
            {editMode && !previewMode ? (
              <div className='w-100 h-[50rem] p-4 border rounded overflow-auto'>
                <h3 className="text-lg font-bold mb-2">Markdown Controls</h3>
                <MarkdownControls onApplyMarkdown={handleApplyMarkdown} />
                <textarea
                  ref={textareaRef}
                  value={transcription}
                  onChange={(e) => setTranscription(e.target.value)}
                  className={`w-full h-[40rem] p-4 border rounded ${currentTheme.background} ${currentTheme.text}`}
                  placeholder="Edit your transcription here..."
                />
              </div>
            ) : editMode && previewMode ? (
              <div className={`w-100 h-[50rem] p-4 border rounded overflow-auto prose ${
                theme === 'dark' ? 'prose-invert' : ''
              } ${currentTheme.background} ${currentTheme.text}`}>
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                >
                  {transcription || 'No content to preview.'}
                </ReactMarkdown>
              </div>
            ) : (
              <div className={`w-100 h-[50rem] p-4 border rounded overflow-auto ${currentTheme.background} ${currentTheme.text}`}>
                {transcription || 'Transcription will appear here. Upload an audio file to get started.'}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Sidebar */}
        <MobileSidebar />
      </div>
    );
  }

  // Desktop Render (Similar to previous implementation)
  return (
    <div className={`flex h-screen ${currentTheme.background} ${currentTheme.text}`}>
      {/* Sidebar for Desktop */}
      <div className={`w-[25rem] h-60 p-4 ${currentTheme.background} pr-0 ${currentTheme.sidebar}`}>
        <h3 className="text-xl font-bold mb-6 border-b-2 border-gray-300">Dashboard Controls</h3>
        
        {/* Theme Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Theme</label>
          <div className="flex space-x-2">
            {Object.keys(themes).map((themeKey) => (
              <button
                key={themeKey}
                onClick={() => setTheme(themeKey)}
                className={`px-3 py-1 rounded text-xs flex items-center ${
                  theme === themeKey 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {themeKey === 'light' && <SunIcon className="w-4 h-4 mr-1" />}
                {themeKey === 'dark' && <MoonIcon className="w-4 h-4 mr-1" />}
                {themeKey === 'sepia' && <PaletteIcon className="w-4 h-4 mr-1" />}
                {themeKey.charAt(0).toUpperCase() + themeKey.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Edit Toggle */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Edit Mode</label>
          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-3 py-1 rounded text-xs ${
              editMode 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {editMode ? 'Editing' : 'Edit'}
          </button>
        </div>
        <BillingAndUserControls />
      </div>

      {/* Main Content Area - Desktop */}
      <div className="flex-1 flex">
        {/* Left Panel - Upload & History */}
        <div className="w-1/2 p-6 border-r overflow-auto">
          <AudioUploader onTranscriptionComplete={handleTranscriptionComplete} />
          <TranscriptionHistory onPreviewTranscription={handlePreviewTranscription}  />
        </div>

        {/* Right Panel - Transcription Editor */}
        <div className="w-1/2 p-6 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Transcription Editor / Previewer</h2>
            <div className="flex gap-2">
                <button
                  onClick={togglePreviewMode}
                  className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition-colors"
                >
                  {previewMode ? 'Edit' : 'Preview'}
                </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(transcription);
                }}
                className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors"
              >
                Copy
              </button>
            </div>
          </div>

          {editMode && !previewMode ? (
            <div className='w-full h-full p-4 border rounded'>
              <MarkdownControls onApplyMarkdown={handleApplyMarkdown} />
              <textarea
                ref={textareaRef}
                value={transcription}
                onChange={(e) => setTranscription(e.target.value)}
                className={`w-full h-full p-4 border rounded resize-y overflow-outo ${currentTheme.background} ${currentTheme.text}`}
                placeholder="Edit your transcription here..."
              />
            </div>
          ) : editMode && previewMode ? (
            <div
              className={`w-full h-full p-4 border rounded overflow-auto prose ${
                theme === 'dark' ? 'prose-invert' : ''
              } ${currentTheme.background} ${currentTheme.text}`}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {transcription || 'No content to preview.'}
              </ReactMarkdown>
            </div>
          ) : (
            <div
              className={`w-full h-full p-4 border rounded overflow-auto ${currentTheme.background} ${currentTheme.text}`}
            >
              {transcription || 'Transcription will appear here. Upload an audio file to get started or select a transcription to preview.'}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TranscriptionDashboard;