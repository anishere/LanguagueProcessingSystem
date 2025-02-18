import PropTypes from "prop-types";
import { TbAnalyze } from "react-icons/tb";

const AnalyzeButton = ({ handleAnalyze, isAnalyzing }) => {
  return (
    <button className="buttonAction mx-2 mt-2" onClick={handleAnalyze}>
      <TbAnalyze />
      {isAnalyzing ? "Đang phân tích..." : "Phân tích"}
    </button>
  );
};

AnalyzeButton.propTypes = {
  handleAnalyze: PropTypes.func.isRequired,
  isAnalyzing: PropTypes.bool.isRequired,
};

export default AnalyzeButton;
