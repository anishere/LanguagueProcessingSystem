import { Select } from 'antd';
import PropTypes from 'prop-types';
import languages from '../../settings/languagesCode';

const { Option } = Select;

/**
 * Component chọn ngôn ngữ đích cho việc dịch
 */
const LanguageSelector = ({ value, onChange }) => {
  return (
    <div style={{ marginBottom: "20px", display: "flex", justifyContent: "flex-end" }}>
      <Select
        value={value}
        onChange={onChange}
        style={{ width: "250px", borderRadius: "4px" }}
        placeholder="Chọn ngôn ngữ đích"
      >
        {languages.map((lang) => (
          <Option value={lang.code} key={lang.code}>
            {lang.name}
          </Option>
        ))}
      </Select>
    </div>
  );
};

LanguageSelector.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

export default LanguageSelector;