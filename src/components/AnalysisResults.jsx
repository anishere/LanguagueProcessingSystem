import PropTypes from "prop-types";

const AnalysisResults = ({ analysisResult, totalLength, languagePercentages }) => {
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
            </li>
          ))}
        </ul>
      )}

      <p className="mt-2"><strong>Tổng số ký tự hợp lệ:</strong> {totalLength}</p>

      <h5 className="mt-3">Tỷ lệ ngôn ngữ sử dụng:</h5>
      <ul>
        {Object.entries(languagePercentages).map(([lang, percentage], index) => (
          <li key={index}><strong>{lang}</strong>: {percentage}%</li>
        ))}
      </ul>
    </div>
  );
};

AnalysisResults.propTypes = {
  analysisResult: PropTypes.array.isRequired, // ✅ Định nghĩa prop kết quả phân tích
  totalLength: PropTypes.number.isRequired,  // ✅ Tổng số ký tự hợp lệ
  languagePercentages: PropTypes.object.isRequired, // ✅ Phần trăm ngôn ngữ
};

export default AnalysisResults;
