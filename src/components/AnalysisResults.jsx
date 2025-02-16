import PropTypes from "prop-types";

const AnalysisResults = ({ analysisResult, totalLength }) => {
  return (
    <div className="border AnalysisResults p-3 mt-3">
      <h5>Kết quả phân tích ngôn ngữ:</h5>
      {analysisResult.length === 0 ? (
        <p className="text-muted">Không có dữ liệu.</p>
      ) : (
        <ul>
          {analysisResult.map((item, index) => (
            <li key={index}>
              <strong>{item.name} ({item.code})</strong>: {item.text} 
              <span className="text-muted"> ({item.charCount} ký tự - {item.percentage}%)</span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2"><strong>Tổng số ký tự hợp lệ:</strong> {totalLength}</p>
    </div>
  );
};

AnalysisResults.propTypes = {
  analysisResult: PropTypes.array.isRequired, // ✅ Định nghĩa prop kết quả phân tích
  totalLength: PropTypes.number.isRequired,  // ✅ Tổng số ký tự hợp lệ
};

export default AnalysisResults;
