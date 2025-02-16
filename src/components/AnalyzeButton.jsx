import PropTypes from "prop-types";

const AnalyzeButton = ({ handleAnalyze, isAnalyzing }) => {
  return (
    <button className="btn btn-secondary mx-2 mt-2" onClick={handleAnalyze}>
      {isAnalyzing ? "Đang phân tích..." : "Phân tích"}
    </button>
  );
};

AnalyzeButton.propTypes = {
  handleAnalyze: PropTypes.func.isRequired,
  isAnalyzing: PropTypes.bool.isRequired,
};

export default AnalyzeButton;
