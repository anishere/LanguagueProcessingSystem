import { useState, useEffect } from 'react';
import { translateDocxFile, checkDocumentTranslationStatus } from '../api/apis';
import { toast } from 'react-toastify';

const useDocumentTranslation = () => {
  const [file, setFile] = useState(null);
  const [targetLanguage, setTargetLanguage] = useState('english');
  const [model, setModel] = useState('gpt-4o-mini');
  const [temperature, setTemperature] = useState(0.3);
  const [workers, setWorkers] = useState(8);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [translationResult, setTranslationResult] = useState(null);
  const [translationId, setTranslationId] = useState(null);
  const [error, setError] = useState(null);
  const [intervalId, setIntervalId] = useState(null);

  // Clear any running intervals when component unmounts
  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [intervalId]);

  // Check translation status at regular intervals
  useEffect(() => {
    if (translationId && isLoading) {
      const id = setInterval(async () => {
        try {
          const statusResponse = await checkDocumentTranslationStatus(translationId);
          
          // Update progress
          setProgress(statusResponse.progress || 0);
          
          // If completed, clear interval and update state
          if (statusResponse.status === 'completed') {
            setIsLoading(false);
            clearInterval(id);
            setIntervalId(null);
            setProgress(100);
            toast.success('Document translation completed successfully!');
          }
        } catch (err) {
          console.error('Error checking translation status:', err);
          setError('Failed to check translation status. Please try again.');
          setIsLoading(false);
          clearInterval(id);
          setIntervalId(null);
        }
      }, 2000); // Check every 2 seconds
      
      setIntervalId(id);
      
      return () => {
        clearInterval(id);
      };
    }
  }, [translationId, isLoading]);

  const handleFileChange = (selectedFile) => {
    setFile(selectedFile);
    setError(null);
    
    // Validate file type immediately on selection
    if (selectedFile && !selectedFile.name.endsWith('.docx')) {
      setError('Only .docx files are supported at this time');
      return;
    }
    
    // Validate file size immediately on selection
    if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10MB limit');
      return;
    }
  };

  const resetTranslation = () => {
    setFile(null);
    setProgress(0);
    setTranslationResult(null);
    setTranslationId(null);
    setError(null);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setIsLoading(false);
  };

  const translate = async () => {
    if (!file) {
      setError('Please select a file to translate');
      return;
    }
    
    // Double-check validation (just in case)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10MB limit');
      return;
    }
    
    if (!file.name.endsWith('.docx')) {
      setError('Only .docx files are supported at this time');
      return;
    }

    try {
      setIsLoading(true);
      setProgress(0);
      setError(null);
      
      const result = await translateDocxFile(
        file,
        targetLanguage,
        model,
        temperature,
        workers
      );
      
      setTranslationResult(result);
      setTranslationId(result.translation_id);
      
      // The actual progress tracking starts in the useEffect hook
    } catch (err) {
      console.error('Translation failed:', err);
      let errorMessage = 'Document translation failed. Please try again.';
      
      if (err.response) {
        // Server responded with error
        if (err.response.status === 413) {
          errorMessage = 'File size is too large for the server to process.';
        } else if (err.response.status === 401) {
          errorMessage = 'Authentication error. Please log in again.';
        } else if (err.response.status === 422) {
          errorMessage = 'Invalid parameters in the request. Please check your file and settings.';
        } else if (err.response.data && err.response.data.detail) {
          // Make sure the detail is a string, not an object
          const detail = err.response.data.detail;
          errorMessage = typeof detail === 'string' 
            ? detail 
            : 'Server validation error. Please check your inputs.';
        }
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return {
    file,
    targetLanguage,
    model,
    temperature,
    workers,
    isLoading,
    progress,
    translationResult,
    error,
    handleFileChange,
    setTargetLanguage,
    setModel,
    setTemperature,
    setWorkers,
    translate,
    resetTranslation
  };
};

export default useDocumentTranslation; 