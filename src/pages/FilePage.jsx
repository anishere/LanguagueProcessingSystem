import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useDocumentTranslation from '../hooks/useDocumentTranslation';
import { FaDownload, FaFileWord } from 'react-icons/fa';
import { toast } from 'react-toastify';
import LanguageSelector from '../components/LanguageSelector';
import './FilePage.css';
import { 
  Card, 
  Divider, 
  Collapse, 
  Badge, 
  Typography, 
  Alert, 
  Button, 
  Steps, 
  Empty,
  Spin 
} from 'antd';
import { 
  CloudUploadOutlined, 
  TranslationOutlined, 
  CheckCircleOutlined, 
  SyncOutlined,
  FileWordOutlined,
  RocketOutlined,
  SettingOutlined,
  DeleteOutlined,
  WarningOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';

const { Panel } = Collapse;
const { Title, Text, Paragraph } = Typography;

const FilePage = () => {
  const fileInputRef = useRef(null);
  const [targetLangFull, setTargetLangFull] = useState('English');
  const [activeStep, setActiveStep] = useState(0);
  
  const {
    file,
    targetLanguage,
    model,
    isLoading,
    progress,
    translationResult,
    error,
    handleFileChange,
    setTargetLanguage,
    setModel,
    translate,
    resetTranslation
  } = useDocumentTranslation();

  // Update active step based on the translation process state
  useEffect(() => {
    if (!file) {
      setActiveStep(0);
    } else if (file && !isLoading && !translationResult) {
      setActiveStep(1);
    } else if (isLoading) {
      setActiveStep(2);
    } else if (translationResult) {
      setActiveStep(3);
    }
  }, [file, isLoading, translationResult]);

  const handleFileInputChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFileChange(selectedFile);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileChange(droppedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const downloadTranslatedFile = () => {
    if (translationResult && translationResult.download_url) {
      window.open(translationResult.download_url, '_blank');
    } else {
      toast.error('The translation is not complete yet. Please wait until processing is finished.');
    }
  };

  // Calculate estimated time based on file size
  const getEstimatedTime = () => {
    if (!file) return '0';
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return Math.max(1, Math.ceil(fileSizeMB * 0.8));
  }

  // Get the current processing stage based on progress
  const getProcessingStage = () => {
    if (progress === 0) return 'Document analysis';
    if (progress < 25) return 'Processing text';
    if (progress < 50) return 'Translating content';
    if (progress < 75) return 'Formatting document';
    if (progress < 99) return 'Final touches';
    return 'Completing translation';
  }

  return (
    <div className="file-page-container">
      <div className="page-title">
        <Title level={2}>
          <TranslationOutlined style={{ marginRight: '12px', color: '#1890ff' }} />
          Document Translation
        </Title>
        <Text type="secondary">
          Translate your documents while preserving the original formatting and layout
        </Text>
      </div>
      
      {/* Progress Steps */}
      <Steps
        current={activeStep}
        className="document-steps"
        items={[
          {
            title: 'Upload',
            description: 'Select a document',
            icon: <CloudUploadOutlined />
          },
          {
            title: 'Configure',
            description: 'Choose settings',
            icon: <SettingOutlined />
          },
          {
            title: 'Translate',
            description: 'Processing document',
            icon: isLoading ? <SyncOutlined spin /> : <TranslationOutlined />
          },
          {
            title: 'Download',
            description: 'Get translated file',
            icon: <CheckCircleOutlined />
          },
        ]}
      />
      
      <Card className="main-card">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left panel - Upload section */}
          <div className="lg:col-span-1">
            <Title level={4} className="flex items-center mb-4">
              <FileWordOutlined style={{ marginRight: '10px', color: '#1890ff' }} />
              Upload Document
            </Title>
            
            <div 
              className={`upload-area ${file ? 'has-file' : ''}`}
              onClick={() => fileInputRef.current.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                accept=".docx"
                className="hidden"
              />
              
              <AnimatePresence mode="wait">
                {file ? (
                  <motion.div 
                    key="file-selected"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center"
                  >
                    <div className="upload-icon has-file">
                      <FaFileWord size={36} />
                    </div>
                    <Paragraph 
                      ellipsis={{ rows: 1, tooltip: file.name }}
                      className="upload-text"
                    >
                      {file.name}
                    </Paragraph>
                    <Text type="secondary" className="upload-subtext">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • DOCX file
                    </Text>
                    <Badge 
                      status="success" 
                      text="Ready for translation" 
                      style={{ fontWeight: 500, fontSize: '14px' }}
                    />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="file-empty"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center"
                  >
                    <div className="upload-icon-container">
                      <CloudUploadOutlined className="upload-cloud-icon" />
                    </div>
                    <Text strong className="me-2 upload-text">
                      Drop your DOCX file here
                    </Text>
                    <Text type="secondary" className="upload-subtext">
                      or click to browse files
                    </Text>
                    <div className="file-badges">
                      <Badge 
                        style={{ 
                          backgroundColor: '#f0f0f0', 
                          color: '#666', 
                          padding: '4px 12px',
                          borderRadius: '12px'
                        }}
                        count={<Text style={{ fontSize: '12px' }}>Max: 10MB</Text>}
                      />
                      <Badge 
                        style={{ 
                          backgroundColor: '#e6f7ff', 
                          color: '#1890ff', 
                          padding: '4px 12px',
                          borderRadius: '12px',
                          border: '1px solid #91d5ff'
                        }}
                        count={<Text style={{ fontSize: '12px' }}>DOCX only</Text>}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4"
                >
                  <Alert
                    message="Error"
                    description={typeof error === 'object' ? 'An unexpected error occurred' : error}
                    type="error"
                    showIcon
                    icon={<WarningOutlined />}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right panel - Settings and Results */}
          <div className="lg:col-span-2 mt-2">
            <Title level={4} className="flex items-center mb-4">
              <SettingOutlined style={{ marginRight: '10px', color: '#1890ff' }} />
              Translation Settings
            </Title>

            <Card 
              className="settings-card"
              bordered={false}
            >
              {/* Language Selector */}
              <div className="mb-4">
                <Text strong className="settings-header">
                  Target Language
                </Text>
                <div className="mt-2 settings-selector">
                  <LanguageSelector 
                    targetLang={targetLanguage === "english" ? "en" : 
                                targetLanguage === "vietnamese" ? "vi" :
                                targetLanguage === "chinese" ? "zh" :
                                targetLanguage === "japanese" ? "ja" :
                                targetLanguage === "french" ? "fr" :
                                targetLanguage === "german" ? "de" : "en"}
                    setTargetLang={(code) => {
                      const langMap = {
                        "en": "english",
                        "vi": "vietnamese",
                        "zh": "chinese",
                        "ja": "japanese",
                        "fr": "french",
                        "de": "german",
                        "it": "italian",
                        "es": "spanish",
                        "ru": "russian",
                        "ko": "korean"
                      };
                      setTargetLanguage(langMap[code] || "english");
                    }}
                    setTargetLangFull={setTargetLangFull}
                  />
                </div>
              </div>

              {/* Advanced Settings */}
              <Collapse 
                ghost 
                bordered={false}
                style={{ 
                  background: 'transparent',
                  marginBottom: 0
                }}
              >
                <Panel 
                  header={
                    <Text strong style={{ fontSize: '15px' }}>
                      <RocketOutlined style={{ marginRight: '8px' }} />
                      Advanced Settings
                    </Text>
                  } 
                  key="1"
                >
                  <div className="mb-2">
                    <Text strong className="settings-header">
                      AI Model
                    </Text>
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="model-select"
                      disabled={isLoading}
                    >
                      <option value="gpt-4o-mini">GPT-4o Mini (Recommended)</option>
                      <option value="gpt-4o">GPT-4o (High Quality)</option>
                      <option value="gpt-4">GPT-4 (Legacy)</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster)</option>
                    </select>
                  </div>
                </Panel>
              </Collapse>
            </Card>

            {/* Action Buttons */}
            <div className="action-buttons">
              <Button
                onClick={resetTranslation}
                icon={<DeleteOutlined />}
                danger
                disabled={isLoading || !file}
                size="large"
                className="reset-button"
              >
                Reset
              </Button>
              
              <Button
                onClick={translate}
                type="primary"
                icon={<TranslationOutlined />}
                disabled={!file || isLoading}
                loading={isLoading}
                size="large"
                className="translate-button"
              >
                {isLoading ? `Translating...` : 'Translate Document'}
              </Button>
            </div>

            {/* Progress Bar */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="progress-container">
                    <div className="progress-header">
                      <Text strong style={{ fontSize: '16px' }}>Translation Progress</Text>
                      <Badge
                        count={`${progress}%`}
                        style={{ 
                          backgroundColor: progress < 30 ? '#1890ff' : 
                                          progress < 70 ? '#52c41a' : 
                                          '#13c2c2', 
                          fontSize: '15px', 
                          fontWeight: 'bold',
                          padding: '2px 12px',
                          borderRadius: '12px',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                        }}
                      />
                    </div>
                    
                    {/* File size and time estimation */}
                    <div className="progress-info">
                      <span>
                        <span style={{ fontWeight: 500 }}>{file.name}</span> 
                        <span className="mx-1">•</span> 
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                      <span>
                        Estimated time: 
                        <span style={{ fontWeight: 500, marginLeft: '4px' }}>
                          {getEstimatedTime()} min
                        </span>
                      </span>
                    </div>
                    
                    {/* Enhanced progress bar */}
                    <div className="progress-bar-container">
                      <div className="progress-bar-background"></div>
                      
                      <motion.div
                        className="progress-bar"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      >
                        {progress > 10 && (
                          <span className="progress-label">{progress}%</span>
                        )}
                        
                        <div className="progress-stripes"></div>
                        <div className="progress-glow"></div>
                      </motion.div>
                    </div>
                    
                    {/* Processing info */}
                    <div className="progress-status">
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <SyncOutlined spin className="progress-status-icon" />
                        <Text style={{ color: '#333', fontWeight: 500 }}>
                          Translating to <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{targetLangFull}</span>
                        </Text>
                      </div>
                      <div className="progress-stage">
                        {getProcessingStage()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Result Section */}
            <AnimatePresence>
              {translationResult && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="result-card">
                    {progress >= 100 ? (
                      <>
                        <motion.div 
                          className="success-icon-container"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        >
                          <CheckCircleOutlined className="success-icon" />
                        </motion.div>
                        
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <Title level={3} className="result-title">
                            Translation Complete
                          </Title>
                        </motion.div>
                        
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          <Paragraph style={{ fontSize: '16px', maxWidth: '400px', margin: '0 auto 16px' }}>
                            Your document has been successfully translated to <span style={{ fontWeight: 'bold' }}>{targetLangFull}</span>
                          </Paragraph>
                        </motion.div>
                        
                        {/* File information card */}
                        <div className="file-info-card">
                          <div className="file-info-content">
                            <div className="file-icon-container">
                              <FileWordOutlined className="file-icon" />
                            </div>
                            <div className="file-details">
                              <Text strong className="file-name">
                                {file.name.substring(0, file.name.length - 5)}_translated.docx
                              </Text>
                              <div className="file-meta">
                                <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                                <span className="file-meta-divider">•</span>
                                <span>DOCX Document</span>
                                <span className="file-meta-divider">•</span>
                                <span>Translated to {targetLangFull}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="formatting-info">
                          <CheckCircleOutlined className="formatting-icon" />
                          <Text type="success" style={{ fontSize: '14px' }}>
                            The original document&apos;s formatting and layout have been preserved
                          </Text>
                        </div>
                        
                        <Divider style={{ margin: '16px 0' }} />
                        
                        <motion.div
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            type="primary"
                            icon={<FaDownload className="download-icon" />}
                            onClick={downloadTranslatedFile}
                            className="download-button"
                          >
                            Download Translated Document
                          </Button>
                        </motion.div>
                      </>
                    ) : (
                      <div className="processing-state">
                        <div className="loading-spinner">
                          <Spin size="large" />
                        </div>
                        <Title level={4} className="processing-title">
                          Translation in Progress
                        </Title>
                        <Paragraph className="processing-message">
                          Please wait while we complete the translation process. This may take a few minutes.
                        </Paragraph>
                        <Alert
                          className="processing-alert"
                          message="Document Not Ready"
                          description="The document is still being processed. The download will be available once translation is complete."
                          type="info"
                          showIcon
                          icon={<InfoCircleOutlined />}
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Empty state when no file is selected */}
            <AnimatePresence>
              {!file && !isLoading && !translationResult && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="empty-state"
                >
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    className="empty-icon"
                    description={
                      <Text type="secondary" className="empty-text">
                        Upload a document to begin translation
                      </Text>
                    }
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FilePage;
