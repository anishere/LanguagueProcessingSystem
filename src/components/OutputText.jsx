/* eslint-disable no-unused-vars */
import React from "react";
import PropTypes from "prop-types";

const OutputText = ({ outputText, isLoading, outputRef }) => {
  return (
    <div
      ref={outputRef} // ✅ Gán ref vào div output để cập nhật chiều cao từ InputTextArea
      className="border p-3 output-text"
      style={{ minHeight: "100px", overflowY: "auto" }}
    >
      {isLoading ? (
        <div className="text-center">
          <div className="text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <p>{outputText || "Kết quả dịch sẽ hiển thị tại đây..."}</p>
      )}
    </div>
  );
};

OutputText.propTypes = {
  outputText: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
  outputRef: PropTypes.object, // ✅ Định nghĩa outputRef
};

export default OutputText;
