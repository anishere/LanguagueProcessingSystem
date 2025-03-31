import { useState, useEffect } from "react";
import { Select, Input, Divider, Tooltip } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import languages from "../settings/languagesCode";
import "./LanguageSelector.css";

const { Option } = Select;

/**
 * Language selector component that allows selecting a target language for translation.
 */
const LanguageSelector = ({ targetLang, setTargetLang, setTargetLangFull }) => {
  const [searchText, setSearchText] = useState("");
  const [filteredLanguages, setFilteredLanguages] = useState(languages);

  // Update filtered languages when search text changes
  useEffect(() => {
    if (!searchText) {
      setFilteredLanguages(languages);
    } else {
      const filtered = languages.filter(lang =>
        lang.name.toLowerCase().includes(searchText.toLowerCase()) ||
        lang.code.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredLanguages(filtered);
    }
  }, [searchText]);

  // Handler for language change
  const handleChange = (value) => {
    setTargetLang(value);
    // Find and set the full language name
    const selectedLang = languages.find((lang) => lang.code === value);
    if (selectedLang) {
      setTargetLangFull(selectedLang.name);
    }
  };

  // Custom dropdown render with search
  const dropdownRender = menu => (
    <div className="custom-dropdown-render">
      <div className="language-search-container">
        <Input
          placeholder="Tìm kiếm ngôn ngữ..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          prefix={<SearchOutlined />}
          allowClear
        />
      </div>
      <Divider style={{ margin: '4px 0' }} />
      <div className="language-grid">
        {filteredLanguages.map(lang => (
          <div
            key={lang.code}
            className={`language-grid-item ${targetLang === lang.code ? 'selected' : ''}`}
            onClick={() => handleChange(lang.code)}
          >
            <Tooltip title={`${lang.name} (${lang.code})`}>
              <span className="language-item-text">{lang.name}</span>
            </Tooltip>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="language-selector-container">
      <Select
        value={targetLang}
        onChange={handleChange}
        className="language-select"
        placeholder="Chọn ngôn ngữ"
        dropdownMatchSelectWidth={false}
        dropdownRender={dropdownRender}
      >
        {languages.map((lang) => (
          <Option key={lang.code} value={lang.code}>
            <span className="language-option">{lang.name}</span>
          </Option>
        ))}
      </Select>
    </div>
  );
};

export default LanguageSelector;