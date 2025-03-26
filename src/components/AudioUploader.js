import React, { useState, useRef } from 'react';
import { TranscriptionService } from '../services/API';
import { useAuth } from '../contexts/AuthContext';
import { 
  CloudUploadIcon, 
  AlertTriangleIcon, 
  CheckCircle2Icon 
} from 'lucide-react';

const AudioUploader = ({ onTranscriptionComplete }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [transcription, setTranscription] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);

    const { token, theme } = useAuth();

    const themeClasses = {
        light: {
            background: 'bg-white',
            text: 'text-gray-800',
            border: 'border-gray-200',
            inputBackground: 'bg-white',
            uploadButton: 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800',
            disabledButton: 'bg-gray-300 text-gray-500 cursor-not-allowed',
        },
        dark: {
            background: 'bg-gray-900',
            text: 'text-gray-100',
            border: 'border-gray-700',
            inputBackground: 'bg-gray-800',
            uploadButton: 'bg-indigo-700 text-white hover:bg-indigo-600 active:bg-indigo-500',
            disabledButton: 'bg-gray-700 text-gray-500 cursor-not-allowed',
        },
        sepia: {
            background: 'bg-[#F4ECD8]',
            text: 'text-gray-800',
            border: 'border-gray-300',
            inputBackground: 'bg-[#E7DFC6]',
            uploadButton: 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800',
            disabledButton: 'bg-gray-300 text-gray-500 cursor-not-allowed',
        }
    };

    const currentTheme = themeClasses[theme] || themeClasses.light;

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        
        // Validate file type and size
        const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/x-m4a'];
        const maxFileSize = 50 * 1024 * 1024; // 50MB
        
        if (!file) {
            setSelectedFile(null);
            setError('No file selected');
            return;
        }

        if (!allowedTypes.includes(file.type)) {
            setSelectedFile(null);
            setError('Invalid file type. Please upload MP3, WAV, or M4A.');
            return;
        }

        if (file.size > maxFileSize) {
            setSelectedFile(null);
            setError('File is too large. Maximum file size is 10MB.');
            return;
        }

        setSelectedFile(file);
        setError('');
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select an audio file first');
            return;
        }

        setIsLoading(true);
        setError('');
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('audio', selectedFile);

        try {
            const result = await TranscriptionService.uploadAudio(formData, token, {
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setUploadProgress(percentCompleted);
                }
            });

            if (result.success) {
                const transcribedText = result.data.transcribed_text;
                setTranscription(transcribedText);
                
                if (onTranscriptionComplete) {
                    onTranscriptionComplete(result.data);
                }

                // Reset file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                setSelectedFile(null);
            } else {
                setError(result.message);
            }
        } catch (error) {
            setError('An unexpected error occurred during transcription');
        } finally {
            setIsLoading(false);
        }
    };

     return (
        <div className={`${currentTheme.background} ${currentTheme.text} shadow-lg rounded-xl p-6 border ${currentTheme.border} hover:shadow-xl transition-all duration-300`}>
            <div className="flex items-center mb-4">
                <CloudUploadIcon className="w-8 h-8 text-indigo-600 mr-3" />
                <h2 className={`text-2xl font-bold ${currentTheme.text}`}>Audio Transcription</h2>
            </div>
            
            <div className="mb-4">
                <div className={`relative border-2 border-dashed border-indigo-200 rounded-lg p-4 text-center ${currentTheme.inputBackground}`}>
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        accept="audio/mpeg,audio/wav,audio/mp4,audio/x-m4a"
                        onChange={handleFileChange} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center py-4">
                        <CloudUploadIcon className="w-12 h-12 text-indigo-400 mb-2" />
                        <p className={currentTheme.text}>
                            {selectedFile 
                                ? `Selected: ${selectedFile.name}` 
                                : 'Drag and drop or click to upload'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            MP3, WAV, M4A (max 10MB)
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center">
                    <AlertTriangleIcon className="w-6 h-6 mr-3 text-red-500" />
                    <span>{error}</span>
                </div>
            )}

            {isLoading && (
                <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                            className="bg-indigo-600 h-2.5 rounded-full" 
                            style={{width: `${uploadProgress}%`}}
                        ></div>
                    </div>
                    <p className="text-sm text-gray-600 text-center mt-2">
                        Uploading: {uploadProgress}%
                    </p>
                </div>
            )}

            <button 
                onClick={handleUpload}
                disabled={!selectedFile || isLoading}
                className={`w-full py-3 rounded-lg transition-all duration-300 flex items-center justify-center ${
                    selectedFile && !isLoading 
                    ? currentTheme.uploadButton 
                    : currentTheme.disabledButton
                }`}
            >
                {isLoading ? (
                    <div className={`${currentTheme.text}`}>
                        <svg 
                            className="animate-spin h-5 w-5 mr-3" 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24"
                        >
                            <circle 
                                className="opacity-25" 
                                cx="12" 
                                cy="12" 
                                r="10" 
                                stroke="currentColor" 
                                strokeWidth="4"
                            ></circle>
                            <path 
                                className="opacity-75" 
                                fill="currentColor" 
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                        Transcribing... can take a while...
                    </div>
                ) : (
                    <>
                        <CloudUploadIcon className="w-5 h-5 mr-2" />
                        Transcribe Audio
                    </>
                )}
            </button>

            {transcription && (
                <div className={`mt-4 p-4 ${currentTheme.inputBackground} rounded-lg border ${currentTheme.border}`}>
                    <div className="flex items-center mb-2">
                        <CheckCircle2Icon className="w-6 h-6 text-green-500 mr-2" />
                        <h3 className="font-semibold text-gray-800">Transcription Complete</h3>
                    </div>
                    <p className={`${currentTheme.text} text-sm line-clamp-3`}>{transcription}</p>
                </div>
            )}
        </div>
    );
};

export default AudioUploader;