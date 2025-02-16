/* eslint-disable no-unused-vars */
import React from "react";
import languages from "../settings/languagesCode";
import PropTypes from "prop-types";  

const LanguageSelector = ({ targetLang = 'vi', setTargetLang, setTargetLangFull = 'vietnamese' }) => {
  return (
    <select
      className="form-select selectLan mb-md-3 mb-2 mt-2 mt-md-0"
      value={targetLang}
      onChange={(e) => {
        const selectedOption = e.target.options[e.target.selectedIndex]; // ✅ Lấy option được chọn
        setTargetLang(e.target.value); // ✅ Lưu code (value)
        setTargetLangFull(selectedOption.text); // ✅ Lưu name (tên ngôn ngữ)
      }}
    >
      {languages.map((lang) => (
        <option key={lang.name} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </select>
  );
};

LanguageSelector.propTypes = {
  targetLang: PropTypes.string.isRequired,      // Chuỗi văn bản nhập vào
  setTargetLang: PropTypes.func.isRequired,     // Hàm cập nhật văn bản
  setTargetLangFull: PropTypes.func.isRequired,
};

export default LanguageSelector;
