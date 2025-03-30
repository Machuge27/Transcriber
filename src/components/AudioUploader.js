import React, { useState, useRef, useEffect } from 'react';
import { TranscriptionService } from '../services/API';
import { useAuth } from '../contexts/AuthContext';
import { 
  CloudUploadIcon, 
  AlertTriangleIcon, 
  CheckCircle2Icon,
  RefreshCwIcon,
  ClockIcon
} from 'lucide-react';

const AudioUploader = ({ onTranscriptionComplete }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [transcription, setTranscription] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [taskId, setTaskId] = useState(null);
    const [transcriptionProgress, setTranscriptionProgress] = useState(0);
    const [transcriptionStatus, setTranscriptionStatus] = useState('');
    const [incompleteTasks, setIncompleteTasks] = useState([]);
    const [isCheckingTasks, setIsCheckingTasks] = useState(true);
    const progressIntervalRef = useRef(null);
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

    // Function to fetch incomplete tasks on component mount
    useEffect(() => {
        fetchIncompleteTasks();
    }, []);

    // Function to fetch incomplete transcription tasks
    const fetchIncompleteTasks = async () => {
        setIsCheckingTasks(true);
        const result = await TranscriptionService.getTranscriptionProgress(token);
        console.log("RES", result)
        if (result.success) {
            const data = result.data;
            // Based on the actual response structure you provided
            if (Array.isArray(data) && data.length > 0) {
                setIncompleteTasks(data);
                
                // If there's an incomplete task, set it as the current task
                if (data.length > 0) {
                    const latestTask = data[0]; // Assuming tasks are sorted by recency
                    
                    if (latestTask.progress < 100) {
                        setTranscriptionStatus(latestTask.status);
                        setTranscriptionProgress(latestTask.progress || 0);
                        setIsLoading(true);
                    }
                }
            } else {
                // No incomplete tasks found
                setIncompleteTasks([]);
            }
        }else {
            setError(result?.message || 'Failed to check for incomplete transcription tasks.');
            setIsCheckingTasks(false);
            return;
        }
        
        setIsCheckingTasks(false);
    };

    // Function to check transcription status
    const checkTranscriptionStatus = async () => {
        if (!taskId) return;
        
        try {
            const result = await TranscriptionService.getTranscriptionProgress(token, taskId);
            
            if (result.status === 'completed') {
                // Stop checking when complete
                clearInterval(progressIntervalRef.current);
                setTranscriptionStatus('completed');
                setTranscriptionProgress(100);
                setTranscription(result.transcribed_text);
                setIsLoading(false);
                
                // Remove this task from incomplete tasks
                setIncompleteTasks(prev => prev.filter((task, index) => index !== 0)); // Remove the first task
                
                if (onTranscriptionComplete) {
                    onTranscriptionComplete({
                        transcribed_text: result.transcribed_text,
                        task_id: taskId,
                        total_time: result.total_time
                    });
                }
            } else if (result.status === 'pending' || result.status === 'processing') {
                setTranscriptionStatus('processing');
                setTranscriptionProgress(result.progress || 0);
                
                // Update this task in incomplete tasks
                if (incompleteTasks.length > 0) {
                    const updatedTasks = [...incompleteTasks];
                    updatedTasks[0] = {
                        ...updatedTasks[0],
                        progress: result.progress || 0,
                        status: result.status
                    };
                    setIncompleteTasks(updatedTasks);
                }
            } else if (result.status === 'error') {
                clearInterval(progressIntervalRef.current);
                setError(result.error || 'An error occurred during transcription');
                setIsLoading(false);
                
                // Remove this task from incomplete tasks
                setIncompleteTasks(prev => prev.filter((task, index) => index !== 0)); // Remove the first task
            }
            setMessage('');
            setError('');
        } catch (error) {
            console.error('Error checking transcription status:', error);
            setError('Failed to check transcription status. Please try again.');
            setIsLoading(false);
        }
    };

    // Set up automatic status checking when taskId changes
    useEffect(() => {
        if (taskId) {
            // Clear any existing interval
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
            
            // Initial check immediately
            checkTranscriptionStatus();
            
            // Then check every 3 seconds
            progressIntervalRef.current = setInterval(checkTranscriptionStatus, 3000);
            
            // Clean up on unmount
            return () => {
                clearInterval(progressIntervalRef.current);
            };
        }
    }, [taskId]);

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
            setError('File is too large. Maximum file size is 50MB.');
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
        setTranscriptionProgress(0);
        setTranscriptionStatus('uploading');
        setTranscription(''); // Clear any previous transcription

        const formData = new FormData();
        formData.append('audio', selectedFile);

        const result = await TranscriptionService.uploadAudio(formData, token, {
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                );
                setUploadProgress(percentCompleted);
            }
        });
        const res = result.data;

        if (res?.success && res?.data.task_id) {
            setTaskId(res.data.task_id);
            setTranscriptionStatus('processing');
            
            // Add this new task to incomplete tasks
            const newTask = {
                status: res.data.task_id,
                progress: 0,
                error_message: null,
                created_at: new Date().toISOString(),
                filename: selectedFile.name // Adding filename for display purposes
            };
            setIncompleteTasks(prev => [newTask, ...prev]);
            setMessage(res.data.message || 'Transcription process started successfully!');
            setTimeout(setMessage(''), 3000);
            
            // Don't set isLoading to false here as we're now waiting for transcription
        } else {
            setError(result.message || 'Failed to start transcription process');
            setTimeout(setError(''), 3000);
            setIsLoading(false);
        }
    };

    // Function for manual progress check
    const handleCheckProgress = () => {
        if (taskId) {
            checkTranscriptionStatus();
        } else {
            fetchIncompleteTasks(); // Refresh the task list
        }
    };

    // Function to select a specific task
    const handleSelectTask = (index) => {
        if (incompleteTasks.length > index) {
            const selectedTask = incompleteTasks[index];
            setTranscription('');
            setIsLoading(true);
            setTranscriptionStatus(selectedTask.status);
            setTranscriptionProgress(selectedTask.progress || 0);
            
            // Move the selected task to the front of the array
            const updatedTasks = [...incompleteTasks];
            const [selectedTaskData] = updatedTasks.splice(index, 1);
            updatedTasks.unshift(selectedTaskData);
            setIncompleteTasks(updatedTasks);
        }
    };

    // Helper function to get appropriate progress bar
    const getProgressBar = () => {
        if (transcriptionStatus === 'uploading') {
            return (
                <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Uploading file...</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                            className="bg-indigo-600 h-2.5 rounded-full" 
                            style={{width: `${uploadProgress}%`}}
                        ></div>
                    </div>
                    <p className="text-sm text-gray-600 text-center mt-2">
                        {uploadProgress}%
                    </p>
                </div>
            );
        } else if (transcriptionStatus === 'processing') {
            return (
                <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Transcribing audio...</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                            className="bg-indigo-600 h-2.5 rounded-full" 
                            style={{width: `${transcriptionProgress}%`}}
                        ></div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                        <p className="text-sm text-gray-600">
                            {transcriptionProgress}% complete
                        </p>
                        <button
                            onClick={handleCheckProgress}
                            className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
                        >
                            <RefreshCwIcon className="w-4 h-4 mr-1" />
                            Check Progress
                        </button>
                    </div>
                </div>
            );
        }
        return null;
    };

    // Function to reset the uploader
    const handleReset = () => {
        setSelectedFile(null);
        setTranscription('');
        setError('');
        setIsLoading(false);
        setUploadProgress(0);
        setTaskId(null);
        setTranscriptionProgress(0);
        setTranscriptionStatus('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Function to format timestamp
    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Function to render incomplete tasks section
    const renderIncompleteTasks = () => {
        if (isCheckingTasks) {
            return (
                <div className="flex justify-center items-center py-4">
                    <div className="animate-spin h-5 w-5 mr-3 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
                    <p className="text-sm text-gray-600">Checking for incomplete tasks...</p>
                </div>
            );
        }

        if (incompleteTasks.length === 0) {
            return (
                <div className="text-center py-3">
                    <p className="text-sm text-gray-500">No tasks running</p>
                </div>
            );
        }

        return (
            <div className="mt-4">
                <h3 className={`text-sm font-medium ${currentTheme.text} mb-2`}>Incomplete Transcriptions</h3>
                <div className={`border ${currentTheme.border} rounded-lg overflow-hidden`}>
                    {incompleteTasks.map((task, index) => (
                        <div 
                            key={index} 
                            className={`flex items-center p-3 ${
                                index === 0 ? `bg-indigo-50 ${theme === 'dark' ? 'bg-indigo-100' : ''}` : ''
                            } ${index !== incompleteTasks.length - 1 ? `border-b ${currentTheme.border}` : ''} cursor-pointer`}
                            onClick={() => handleSelectTask(index)}
                        >
                            <ClockIcon className="w-5 h-5 text-indigo-500 mr-3" />
                            <div className="flex-1">
                                <div className="flex justify-between">
                                <p className={`text-sm font-medium ${currentTheme.text} ${index === 0 ? 'text-gray-800' : ''} truncate max-w-[150px]`}
                                    title={task.task_id} // Show full task_id on hover
                                    >
                                    Task: {task.task_id}
                                </p>
                                    <span className="text-xs text-gray-500">{formatTimestamp(task.created_at)}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                    <div 
                                        className="bg-indigo-600 h-1.5 rounded-full" 
                                        style={{width: `${task.progress || 0}%`}}
                                    ></div>
                                </div>
                            </div>
                            <span className="text-xs text-gray-500 ml-2">{task.progress || 0}%</span>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end mt-2">
                    <button
                        onClick={() => fetchIncompleteTasks()}
                        className="text-indigo-600 hover:text-indigo-800 text-xs flex items-center"
                    >
                        <RefreshCwIcon className="w-3 h-3 mr-1" />
                        Refresh Tasks
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className={`${currentTheme.background} ${currentTheme.text} shadow-lg rounded-xl p-6 border ${currentTheme.border} hover:shadow-xl transition-all duration-300`}>
            <div className="flex items-center mb-4">
                <CloudUploadIcon className="w-8 h-8 text-indigo-600 mr-3" />
                <h2 className={`text-2xl font-bold ${currentTheme.text}`}>Audio Transcription</h2>
            </div>
            
            <div className="mb-4 mt-4">
                <div className={`relative border-2 border-dashed border-indigo-200 rounded-lg p-4 text-center ${currentTheme.inputBackground}`}>
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        accept="audio/mpeg,audio/wav,audio/mp4,audio/x-m4a"
                        onChange={handleFileChange} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isLoading}
                    />
                    <div className="flex flex-col items-center justify-center py-4">
                        <CloudUploadIcon className="w-12 h-12 text-indigo-400 mb-2" />
                        <p className={currentTheme.text}>
                            {selectedFile 
                                ? `Selected: ${selectedFile.name}` 
                                : 'Drag and drop or click to upload'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            MP3, WAV, M4A (max 50MB)
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

            {message && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center">
                    <CheckCircle2Icon className="w-6 h-6 mr-3 text-green-500" />
                    <span>{message}</span>
                </div>
            )}


            {isLoading && getProgressBar()}

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
                    <div className={` flex flex-row ${currentTheme.text}`}>
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
                        {transcriptionStatus === 'uploading' ? 'Uploading...' : 'Transcribing...'}
                    </div>
                ) : (
                    <>
                        <CloudUploadIcon className="w-5 h-5 mr-2" />
                        Transcribe Audio
                    </>
                )}
            </button>
            
            {/* Incomplete tasks section */}
            {renderIncompleteTasks()}
            
            {transcription && (
                <div className={`mt-4 p-4 ${currentTheme.inputBackground} rounded-lg border ${currentTheme.border}`}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                            <CheckCircle2Icon className="w-6 h-6 text-green-500 mr-2" />
                            <h3 className="font-semibold text-gray-800">Transcription Complete</h3>
                        </div>
                        <button 
                            onClick={handleReset}
                            className="text-indigo-600 hover:text-indigo-800 text-sm"
                        >
                            New Transcription
                        </button>
                    </div>
                    <p className={`${currentTheme.text} text-sm line-clamp-3`}>{transcription}</p>
                </div>
            )}
        </div>
    );
};

export default AudioUploader;