import React, { useState, useEffect } from 'react';
import api, { TranscriptionService } from '../services/API';
import { useAuth } from '../contexts/AuthContext';
import { 
  FileTextIcon, 
  RefreshCwIcon, 
  AlertTriangleIcon,
  FileIcon,
  ClockIcon,
  EyeIcon,
  TrashIcon, 
  BookmarkIcon, 
  PlayIcon  
} from 'lucide-react';

const TranscriptionHistory = ({ 
    onPreviewTranscription
  }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [previewedItemId, setPreviewedItemId] = useState(null);
    const { token, theme } = useAuth();

    const themeClasses = {
        dark: {
            background: 'bg-[#1a1a2e]', // Deeper dark background
            text: 'text-gray-100',
            sidebar: 'bg-[#16213e]',
            border: 'border-gray-700',
            itemBackground: 'bg-[#0f3460]',
            transcriptionBackground: 'bg-[#16213e]'
        },
        light: {
            background: 'bg-white',
            text: 'text-gray-800',
            sidebar: 'bg-gray-100',
            border: 'border-gray-200',
            itemBackground: 'bg-gray-50',
            transcriptionBackground: 'bg-gray-100'
        },
        sepia: {
            background: 'bg-[#F4ECD8]',
            text: 'text-gray-800',
            sidebar: 'bg-[#E7DFC6]',
            border: 'border-gray-300',
            itemBackground: 'bg-[#E7DFC6]',
            transcriptionBackground: 'bg-[#F4ECD8]'
        }
    };

    const currentTheme = themeClasses[theme] || themeClasses.dark;

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const result = await TranscriptionService.getTranscriptionHistory(token);

                if (result.success) {
                    setHistory(result.data);
                    setLoading(false);
                } else {
                    setError(result.message);
                    setLoading(false);
                }
            } catch (error) {
                setError('An unexpected error occurred while fetching transcription history');
                setLoading(false);
            }
        };

        fetchHistory();
    }, [token]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handlePreviewClick = (item) => {
        onPreviewTranscription(item);
        setPreviewedItemId(item.id);
    };

    const handleDeleteTranscription = async (item) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this transcription? This action cannot be undone.');
        if (!confirmDelete) return;

        try {
            const response = await api.delete(`/transcription/history/${item.id}/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 204) {
                setHistory((prevHistory) => prevHistory.filter((i) => i.id !== item.id));
            } else {
                setError('An error occurred while deleting the transcription');
            }
        } catch (error) {
            setError('An error occurred while deleting the transcription');
        }
    };

    const handleBookmark = async (item) => {
        try {
            const response = await api.post(`/transcription/history/${item.id}/bookmark/`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 200) {
                setHistory((prevHistory) => {
                    return prevHistory.map((i) => {
                        if (i.id === item.id) {
                            return { ...i, is_bookmarked: true };
                        }
                        return i;
                    });
                });
            } else {
                setError('An error occurred while bookmarking the transcription');
            }
        } catch (error) {
            setError('An error occurred while bookmarking the transcription');
        }
    };

    if (loading) {
        return (
            <div className={`${currentTheme.background} ${currentTheme.text} shadow-lg rounded-xl p-6 border ${currentTheme.border}`}>
                <div className="flex items-center justify-center space-x-3">
                    <RefreshCwIcon className="w-6 h-6 text-indigo-600 animate-spin" />
                    <span className="text-gray-600">Loading transcription history...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`${currentTheme.background} ${currentTheme.text} shadow-lg rounded-xl p-6 border border-red-200`}>
                <div className="flex items-center text-red-600">
                    <AlertTriangleIcon className="w-8 h-8 mr-3" />
                    <div>
                        <h3 className="font-semibold">Error Fetching History</h3>
                        <p className="text-sm text-gray-600">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`${currentTheme.background} ${currentTheme.text} shadow-lg rounded-xl p-6 border ${currentTheme.border} mt-6`}>
            <div className="flex items-center mb-4">
                <FileTextIcon className="w-8 h-8 text-indigo-600 mr-3" />
                <h2 className={`text-2xl font-bold ${currentTheme.text}`}>Transcription History</h2>
            </div>
            
            {history.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    <FileIcon className="mx-auto h-12 w-12 text-indigo-300 mb-4" />
                    <p className="text-gray-600">No transcriptions yet. Upload an audio file to get started!</p>
                </div>
            ) : (
                <div className="space-y-4 h-1/2 overflow-y-auto">
                    {history.map((item) => (
                        <div 
                            key={item.id} 
                            className={`${currentTheme.itemBackground} rounded-lg p-4 border ${currentTheme.border} hover:shadow-sm transition-all duration-300 group relative`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center">
                                    <ClockIcon className="w-4 h-4 mr-2 text-indigo-500" />
                                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {formatDate(item.created_at)}
                                    </span>
                                </div>
                                <div className="flex space-x-2">
                                    {/* Desktop view shows both icons */}
                                    {/* <a 
                                        href={item.audio_file} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="hidden md:flex text-sm text-indigo-600 hover:text-indigo-400 items-center"
                                        title="View Audio File"
                                    >
                                        <FileIcon className="w-4 h-4 mr-1 text-indigo-500" />
                                        View Audio
                                    </a> */}
                                    <button 
                                        onClick={() => handlePreviewClick(item)}
                                        className="hidden md:flex text-sm text-green-600 hover:text-green-400 items-center"
                                        title="Preview Transcription"
                                    >
                                        <EyeIcon className="w-4 h-4 mr-1 text-green-500" />
                                        Preview
                                    </button>

                                    {/* Mobile view with icons only */}
                                    {/* <a 
                                        href={item.audio_file} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="md:hidden text-indigo-600 hover:text-indigo-400"
                                        title="View Audio File"
                                    >
                                        <FileIcon className="w-5 h-5 text-indigo-500" />
                                    </a> */}
                                    <button 
                                        onClick={() => handlePreviewClick(item)}
                                        className="md:hidden text-green-600 hover:text-green-400"
                                        title="Preview Transcription"
                                    >
                                        <EyeIcon className="w-5 h-5 text-green-500" />
                                    </button>
                                </div>
                            </div>
                            <p 
                                className={`
                                    ${currentTheme.transcriptionBackground} p-3 rounded-md shadow-inner 
                                    ${currentTheme.text} text-sm 
                                    line-clamp-3
                                    overflow-hidden
                                    transition-all duration-300
                                `}
                            >
                                {item.transcribed_text}
                            </p>
                            {/* New audio player and action buttons section */}
                            <div className="flex items-center space-x-2 mt-2">
                                {/* Audio Player Styled Like Image */}
                                {/* <div className="flex-grow flex items-center bg-gray-100 rounded-full p-1 pr-4">
                                <button className="bg-indigo-500 text-white rounded-full p-1 mr-2">
                                    <PlayIcon className="w-4 h-4" />
                                </button>
                                <div className="flex-grow bg-gray-300 h-1 rounded-full relative">
                                    <div className="bg-indigo-500 h-1 rounded-full w-1/4"></div>
                                </div>
                                <span className="ml-2 text-xs text-gray-600">22:40</span>
                                </div> */}

                                <div className="flex-grow flex items-center bg-gray-100 rounded-full p-1 pr-4">
                                    <audio controls className="w-full">
                                        <source src={`http://192.168.0.108:8000${item.audio_file}`} type="audio/mpeg" />
                                        Your browser does not support the audio element.
                                    </audio>
                                </div>
                                    
                                {/* Action Buttons */}
                                <div className="flex space-x-1">
                                <button 
                                    onClick={() => handleBookmark(item)}
                                    className="text-yellow-500 hover:text-yellow-600 p-1 rounded-full hover:bg-yellow-100"
                                    title="Bookmark Transcription"
                                >
                                    <BookmarkIcon className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => handleDeleteTranscription(item)}
                                    className="text-red-500 hover:text-red-600 p-1 rounded-full hover:bg-red-100"
                                    title="Delete Transcription"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TranscriptionHistory;