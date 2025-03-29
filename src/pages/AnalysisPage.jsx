import { useState } from "react";
import "../App.css";
import { Card, Button, Input, Row, Col, Divider, Typography, Progress, Tooltip } from 'antd';
import useAnalyze from "../hooks/useAnalyze";
import useAnalyzeAndSpeech from "../hooks/useAnalyzeAndSpeech";
import LoadingOverlay from "../components/LoadingOverlay";
import { ClearOutlined, SoundOutlined, CopyOutlined, BarChartOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Title, Text } = Typography;

const AnalysisPage = () => {
  const [inputText, setInputText] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  
  const { 
    handleAnalyze, 
    analysisResult, 
    isAnalyzing, 
    totalLength, 
    languagePercentages 
  } = useAnalyze();

  const { 
    analyzeAndSpeak, 
    stopSpeaking, 
    isSpeaking,
    currentLang,
    clearDownloadableAudio
  } = useAnalyzeAndSpeech();
  
  const handleClear = () => {
    setInputText("");
    clearDownloadableAudio();
  };
  
  const handleSpeech = (text, lang) => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      analyzeAndSpeak(text, lang);
    }
  };
  
  // Copy handler with success feedback
  const copyToClipboard = (text, setSuccess = setCopySuccess) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 1500);
    }
  };

  return (
    <div className="analysis-page">
      {isAnalyzing && <LoadingOverlay />}
      
      <Card className="analysis-card main-card">
        <Title level={4} className="card-title">
          <BarChartOutlined /> Phân tích ngôn ngữ văn bản
        </Title>
        <Text className="card-description">
          Nhập văn bản để phát hiện và phân tích ngôn ngữ được sử dụng. Công cụ này hỗ trợ phân tích văn bản đa ngôn ngữ.
        </Text>
        
        <Divider />
        
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <div className="input-container">
              <TextArea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Nhập văn bản để phân tích..."
                autoSize={{ minRows: 6, maxRows: 12 }}
                className="analysis-textarea"
              />
              <div className="textarea-tools">
                <div>
                  <Tooltip title="Xóa văn bản">
                    <Button 
                      icon={<ClearOutlined />}
                      onClick={handleClear}
                      type="text"
                    />
                  </Tooltip>
                  <Tooltip title={isSpeaking ? "Dừng phát âm" : "Phát âm văn bản"}>
                    <Button 
                      icon={<SoundOutlined />}
                      onClick={() => handleSpeech(inputText)}
                      type="text"
                      className={isSpeaking ? 'speaking' : ''}
                    />
                  </Tooltip>
                  <Tooltip title="Sao chép văn bản">
                    <Button 
                      icon={<CopyOutlined />}
                      onClick={() => copyToClipboard(inputText)}
                      type="text"
                      className={copySuccess ? 'copy-success' : ''}
                    />
                  </Tooltip>
                </div>
                <span className="char-count">{inputText.length} / 5000</span>
              </div>
            </div>
          </Col>
          
          <Col xs={24}>
            <div className="analyze-actions">
              <Button 
                type="primary" 
                onClick={() => handleAnalyze(inputText)}
                disabled={!inputText || isAnalyzing}
                className="analyze-button"
                icon={<BarChartOutlined />}
              >
                Phân tích
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      {analysisResult.length > 0 && (
        <Card className="analysis-results-card mt-3">
          <Title level={4} className="results-title">Kết quả phân tích ngôn ngữ</Title>
          <Divider />
          
          <div className="summary-stats">
            <div className="stat-item">
              <Text strong>Tổng số ký tự:</Text>
              <Text className="stat-value">{totalLength}</Text>
            </div>
            <div className="stat-item">
              <Text strong>Số ngôn ngữ phát hiện:</Text>
              <Text className="stat-value">{Object.keys(languagePercentages).length}</Text>
            </div>
            <div className="stat-item">
              <Text strong>Số đoạn văn bản:</Text>
              <Text className="stat-value">{analysisResult.length}</Text>
            </div>
          </div>
          
          <div className="language-percentages-container">
            <Title level={5}>Tỷ lệ các ngôn ngữ</Title>
            {Object.entries(languagePercentages).map(([lang, percentage]) => (
              <div key={lang} className="language-percentage-row">
                <div className="language-header">
                  <Text strong>{lang}</Text>
                  <Text>{parseFloat(percentage).toFixed(2)}%</Text>
                </div>
                <Progress 
                  percent={parseFloat(percentage)} 
                  showInfo={false}
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                />
              </div>
            ))}
          </div>
          
          <Divider />
          
          <div className="detected-sections">
            <Title level={5}>Các đoạn văn bản đã phát hiện</Title>
            {analysisResult.map((item, index) => (
              <Card 
                key={index} 
                className="section-card"
                size="small"
                title={`${item.name} (${item.charCount} ký tự)`}
                extra={
                  <div className="section-actions">
                    <Tooltip title="Phát âm đoạn này">
                      <Button 
                        icon={<SoundOutlined />} 
                        size="small" 
                        type="text"
                        onClick={() => handleSpeech(item.text, item.code)}
                        className={isSpeaking && currentLang === item.name ? 'speaking' : ''}
                      />
                    </Tooltip>
                    <Tooltip title="Sao chép đoạn này">
                      <Button 
                        icon={<CopyOutlined />} 
                        size="small"
                        type="text"
                        onClick={() => copyToClipboard(item.text)}
                      />
                    </Tooltip>
                  </div>
                }
              >
                <p className="section-text">{item.text}</p>
              </Card>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AnalysisPage; 