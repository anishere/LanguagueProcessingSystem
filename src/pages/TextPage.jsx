// pages/TextPage.jsx
import { useRef, useState, useEffect } from "react";
import "../App.css";
import { Card, Button, Input, Row, Col, Divider, Badge } from 'antd';
import useTranslate from "../hooks/useTranslate"; 
import useSpeechToText from "../hooks/useSpeechToText"; 
import useAnalyze from "../hooks/useAnalyze";
import useClear from "../hooks/useClear";
import useAnalyzeAndSpeech from "../hooks/useAnalyzeAndSpeech";
import useTextToSpeech from "../hooks/useTextToSpeech";
import TranslationHistorySidebar from "../components/TranslationHistorySidebar";
import LanguageSelector from "../components/LanguageSelector";
import languages from "../settings/languagesCode";
import LoadingOverlay from "../components/LoadingOverlay";
import { ClearOutlined, SwapOutlined, AudioOutlined, SoundOutlined, CopyOutlined, DownloadOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';

const { TextArea } = Input;

const TextPage = () => {
    const {
        inputText,
        setInputText,
        outputText,
        setOutputText,
        targetLang,
        setTargetLang,
        isLoading,
        handleTranslate,
        setTargetLangFull,
        setSourceLangFull,
    } = useTranslate();
    
    const {isRecording, startRecording, stopRecording, isLoading: isLoadingRecord} = useSpeechToText(setInputText);
    
    const { setAnalysisResult, analysisResult, isAnalyzing, totalLength, languagePercentages } = useAnalyze();

    // Correct hook for input text speech functionality
    const { 
      analyzeAndSpeak, 
      stopSpeaking: stopInputSpeech, 
      clearDownloadableAudio,
      isSpeaking: isInputSpeaking,
      currentLang, // Add the currentLang to display which language is being spoken
      downloadableAudio, // Add this to access downloadable audio
      isAnalyze // Thêm trạng thái isAnalyze
    } = useAnalyzeAndSpeech();
    
    // Correct hook for output text speech functionality
    const {
      playTextToSpeech,
      stopSpeaking: stopOutputSpeech,
      isSpeaking: isOutputSpeaking,
      resetAudioState,
      downloadAudio,  // Add this to access download functionality
      canDownload,    // Add this to check if audio can be downloaded
      isCallTTS       // Thêm trạng thái isCallTTS
    } = useTextToSpeech();
    
    // Reset audio state when output text changes
    useEffect(() => {
      resetAudioState(outputText);
    }, [outputText, resetAudioState]);
    
    const { handleClear } = useClear({ 
      setInputText, 
      setOutputText, 
      setAnalysisResult, 
      clearDownloadableAudio 
    });
    
    const outputRef = useRef(null);
    const [showHistory, setShowHistory] = useState(false);
    const [copyInputSuccess, setCopyInputSuccess] = useState(false);
    const [copyOutputSuccess, setCopyOutputSuccess] = useState(false);
    
    // Hàm xử lý khi chọn một lịch sử dịch từ sidebar
    const handleSelectTranslation = (translation) => {
      // Cập nhật văn bản input và output
      setInputText(translation.inputText);
      setOutputText(translation.outputText);
      
      // Cập nhật ngôn ngữ đích
      setTargetLangFull(translation.targetLanguage);
      setSourceLangFull(translation.sourceLanguage);
      
      // Tìm mã ngôn ngữ tương ứng với tên ngôn ngữ đầy đủ
      const targetLanguage = languages.find(
        lang => lang.name.toLowerCase() === translation.targetLanguage.toLowerCase()
      );
      
      if (targetLanguage) {
        setTargetLang(targetLanguage.code);
      }
    };

    // Handler for input text speech
    const handleInputSpeech = () => {
      if (isInputSpeaking) {
        stopInputSpeech();
      } else if (inputText) {
        analyzeAndSpeak(inputText);
      }
    };
    
    // Handler for output text speech
    const handleOutputSpeech = () => {
      if (isOutputSpeaking) {
        stopOutputSpeech();
      } else if (outputText) {
        playTextToSpeech(outputText, targetLang);
      }
    };
    
    // Copy handlers with success feedback
    const copyToClipboard = (text, setSuccess) => {
      if (text) {
        navigator.clipboard.writeText(text);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 1500);
      }
    };
    
    // Swap input and output text, and languages
    const handleSwapTexts = () => {
      if (!outputText) return;
      
      // Save current values
      const tempInput = inputText;
      const tempOutput = outputText;
      
      // Get current source language from analysis if available
      let detectedSourceLang = "auto";
      let detectedSourceLangFull = "Auto Detect";
      
      // Try to get the detected source language from analysis results
      if (Object.keys(languagePercentages).length > 0) {
        // Get language with highest percentage
        const [topLang] = Object.entries(languagePercentages).sort((a, b) => b[1] - a[1])[0];
        if (topLang) {
          // Find language code for the detected language
          const langObj = languages.find(l => l.name.toLowerCase() === topLang.toLowerCase());
          if (langObj) {
            detectedSourceLang = langObj.code;
            detectedSourceLangFull = langObj.name;
          }
        }
      }
      
      // Swap values
      setInputText(tempOutput);
      setOutputText(tempInput);
      
      // Set source language full name to old target language
      setSourceLangFull(languages.find(lang => lang.code === targetLang)?.name || "");
      
      // Set target language to detected source language or default to English
      if (detectedSourceLang !== "auto") {
        setTargetLang(detectedSourceLang);
        setTargetLangFull(detectedSourceLangFull);
      } else {
        setTargetLang("en");
        setTargetLangFull("English");
      }
    };

    // Handler for input audio download
    const handleInputAudioDownload = () => {
      if (!downloadableAudio) {
        toast.info("Vui lòng phát âm thanh trước khi tải xuống", {
          position: "top-right",
          autoClose: 2000
        });
        return;
      }
      
      const downloadLink = document.createElement("a");
      downloadLink.href = downloadableAudio.url;
      downloadLink.download = downloadableAudio.filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      toast.success("Đã tải xuống âm thanh thành công", {
        position: "top-right",
        autoClose: 2000
      });
    };
    
    // Handler for output audio download
    const handleOutputAudioDownload = () => {
      if (!canDownload) {
        toast.info("Vui lòng phát âm thanh trước khi tải xuống", {
          position: "top-right",
          autoClose: 2000
        });
        return;
      }
      
      const fileName = outputText.substring(0, 20).trim().replace(/[^a-zA-Z0-9_-]/g, "_") || "audio";
      downloadAudio(fileName);
      
      toast.success("Đã tải xuống âm thanh thành công", {
        position: "top-right",
        autoClose: 2000
      });
    };

  return (
    <div className="translation-container">
      {(isLoading || isLoadingRecord || isAnalyzing || isAnalyze || isCallTTS) && <LoadingOverlay />}
      
      {showHistory && (
        <TranslationHistorySidebar 
          onSelectTranslation={handleSelectTranslation} 
          onClose={() => setShowHistory(false)}
        />
      )}
      
      <Card className="translation-card">
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <div className="language-controls">
              <div className="language-select-container source-lang">
                <div className="auto-detect-text">
                  <span>Tự động phát hiện ngôn ngữ</span>
                </div>
              </div>
              
              <div className="language-swap">
                <Button 
                  icon={<SwapOutlined />} 
                  shape="circle" 
                  className="swap-button"
                  onClick={handleSwapTexts}
                  disabled={!outputText}
                  title="Đổi chỗ văn bản"
                />
              </div>
              
              <div className="language-select-container target-lang">
                <LanguageSelector
                  targetLang={targetLang}
                  setTargetLang={setTargetLang}
                  setTargetLangFull={setTargetLangFull}
                />
              </div>
            </div>
          </Col>
          
          <Col xs={24} md={12}>
            <div className="input-container">
              <TextArea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Nhập để dịch..."
                autoSize={{ minRows: 6, maxRows: 12 }}
                className="translation-textarea"
              />
              {isInputSpeaking && currentLang && (
                <div className="current-speaking-language">
                  <Badge status="processing" text={`Đang đọc: ${currentLang}`} />
                </div>
              )}
              <div className="textarea-tools">
                <div>
                  <Button 
                    icon={<ClearOutlined />}
                    onClick={handleClear}
                    type="text"
                    title="Xóa văn bản"
                    disabled={!inputText}
                    style={{ color: inputText ? 'inherit' : 'rgba(0,0,0,.25)' }}
                  />
                  <Button 
                    icon={<AudioOutlined />}
                    onClick={isRecording ? stopRecording : startRecording}
                    type="text"
                    className={isRecording ? 'recording' : ''}
                    title={isRecording ? "Dừng ghi âm" : "Bắt đầu ghi âm"}
                  />
                  <Button 
                    icon={<SoundOutlined />}
                    onClick={handleInputSpeech}
                    type="text"
                    className={isInputSpeaking ? 'speaking' : ''}
                    title={isInputSpeaking ? "Dừng phát âm" : "Phát âm văn bản"}
                    disabled={!inputText && !isInputSpeaking}
                    style={{ color: isInputSpeaking ? '#1890ff' : (inputText ? 'inherit' : 'rgba(0,0,0,.25)') }}
                  />
                  <Button 
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(inputText, setCopyInputSuccess)}
                    type="text"
                    className={copyInputSuccess ? 'copy-success' : ''}
                    title="Sao chép văn bản"
                    disabled={!inputText}
                    style={{ color: inputText ? (copyInputSuccess ? '#52c41a' : 'inherit') : 'rgba(0,0,0,.25)' }}
                  />
                  <Button 
                    icon={<DownloadOutlined />}
                    onClick={handleInputAudioDownload}
                    type="text"
                    title="Tải xuống file audio"
                    disabled={!downloadableAudio}
                    style={{ 
                      color: downloadableAudio ? '#1890ff' : 'rgba(0,0,0,.25)',
                      display: inputText ? 'inline-flex' : 'none'
                    }}
                  />
                </div>
                <span className="char-count">{inputText.length} / 5000</span>
              </div>
            </div>
          </Col>
          
          <Col xs={24} md={12}>
            <div className="output-container">
              <TextArea
                value={outputText}
                readOnly
                placeholder="Bản dịch sẽ xuất hiện ở đây..."
                autoSize={{ minRows: 6, maxRows: 12 }}
                className="translation-textarea"
                ref={outputRef}
              />
              <div className="textarea-tools">
                <div>
                  <Button
                    icon={<SoundOutlined />}
                    onClick={handleOutputSpeech}
                    type="text"
                    className={isOutputSpeaking ? 'speaking' : ''}
                    title={isOutputSpeaking ? "Dừng phát âm" : "Phát âm văn bản"}
                    disabled={!outputText && !isOutputSpeaking}
                    style={{ color: isOutputSpeaking ? '#1890ff' : (outputText ? 'inherit' : 'rgba(0,0,0,.25)') }}
                  />
                  <Button 
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(outputText, setCopyOutputSuccess)}
                    type="text"
                    className={copyOutputSuccess ? 'copy-success' : ''}
                    title="Sao chép văn bản"
                    disabled={!outputText}
                    style={{ color: outputText ? (copyOutputSuccess ? '#52c41a' : 'inherit') : 'rgba(0,0,0,.25)' }}
                  />
                  <Button 
                    icon={<DownloadOutlined />}
                    onClick={handleOutputAudioDownload}
                    type="text"
                    title="Tải xuống file audio"
                    disabled={!canDownload}
                    style={{ 
                      color: canDownload ? '#1890ff' : 'rgba(0,0,0,.25)',
                      display: outputText ? 'inline-flex' : 'none'
                    }}
                  />
                </div>
              </div>
            </div>
          </Col>
          
          <Col span={24}>
            <div className="translation-actions">
              <Button 
                type="primary" 
                onClick={handleTranslate}
                disabled={!inputText || isLoading}
                className="translate-button"
              >
                Nộp
              </Button>
              
              <Button
                onClick={() => setShowHistory(!showHistory)}
                className="history-button"
              >
                Lịch sử
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      {analysisResult.length > 0 && (
        <Card className="analysis-card mt-3">
          <h4>Kết quả phân tích</h4>
          <Divider />
          <div className="analysis-results">
            <div className="language-analysis">
              <p>Tổng số ký tự: {totalLength}</p>
              <div className="language-percentages">
                {Object.entries(languagePercentages).map(([lang, percentage]) => (
                  <div key={lang} className="language-percentage-item">
                    <span>{lang}: </span>
                    <div className="percentage-bar">
                      <div 
                        className="percentage-fill" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span>{percentage.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TextPage;