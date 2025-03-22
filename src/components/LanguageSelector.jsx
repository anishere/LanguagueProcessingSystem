import { useState, useEffect } from "react";
import { Select, Input, Checkbox, Divider } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import languages from "../settings/languagesCode";
import PropTypes from "prop-types";
import "./LanguageSelector.css";

const { Option } = Select;

const LanguageSelector = ({ targetLang = 'vi', setTargetLang, setTargetLangFull }) => {
  const [searchText, setSearchText] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(languages);
  
  // Lọc ngôn ngữ dựa trên từ khóa tìm kiếm
  useEffect(() => {
    if (searchText) {
      setFilteredOptions(
        languages.filter(lang => 
          lang.name.toLowerCase().includes(searchText.toLowerCase())
        )
      );
    } else {
      setFilteredOptions(languages);
    }
  }, [searchText]);
  
  // Xử lý khi chọn ngôn ngữ
  const handleChange = (value, option) => {
    setTargetLang(value);
    setTargetLangFull(option.children);
  };

  // Tùy chỉnh dropdown với layout lưới 6 cột
  const dropdownRender = () => (
    <div className="language-dropdown-container">
      <div className="custom-dropdown-search">
        <Input
          placeholder="Tìm kiếm ngôn ngữ"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()}
          autoFocus
        />
      </div>
      <Divider style={{ margin: '4px 0' }} />
      <div className="custom-dropdown-menu">
        <div className="language-grid">
          {filteredOptions.map(lang => (
            <div 
              key={lang.code}
              className={`language-grid-item ${targetLang === lang.code ? 'selected' : ''}`}
              onClick={() => handleChange(lang.code, { children: lang.name })}
            >
              <Checkbox checked={targetLang === lang.code} />
              <span className="language-item-text">{lang.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="selectorCus">
      <Select
      className="ant-custom-language-selector"
      value={targetLang}
      onChange={handleChange}
      dropdownMatchSelectWidth={false}
      dropdownClassName="custom-language-dropdown"
      dropdownRender={dropdownRender}
      optionFilterProp="children"
      >
      {languages.map(lang => (
        <Option key={lang.code} value={lang.code}>
          {lang.name}
        </Option>
      ))}
      </Select>
    </div>
  );
};

LanguageSelector.propTypes = {
  targetLang: PropTypes.string.isRequired,
  setTargetLang: PropTypes.func.isRequired,
  setTargetLangFull: PropTypes.func.isRequired,
};

export default LanguageSelector;