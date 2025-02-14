/* eslint-disable no-unused-vars */
import React from "react";
import PropTypes from "prop-types"; 

const TranslateButton = ({ handleTranslate, isLoading }) => {
  return (
    <button className="btn btn-primary mt-2" onClick={handleTranslate}>
      {isLoading ? "Đang dịch..." : "Dịch"}
    </button>
  );
};

TranslateButton.propTypes = {
  handleTranslate: PropTypes.func.isRequired,      // Chuỗi văn bản nhập vào
  isLoading: PropTypes.bool.isRequired,     // Hàm cập nhật văn bản
};

export default TranslateButton;
