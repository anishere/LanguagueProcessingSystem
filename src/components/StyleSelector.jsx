import { Select } from 'antd';
import PropTypes from 'prop-types';
import translationStyles from '../settings/translationStyles';
import './StyleSelector.css';

const { Option } = Select;

/**
 * Component cho phép chọn phong cách dịch thuật
 */
const StyleSelector = ({ style, setStyle }) => {
  return (
    <div className="style-selector-container">
      <Select
        value={style}
        onChange={setStyle}
        className="style-select"
        dropdownMatchSelectWidth={false}
        popupClassName="style-dropdown"
        placeholder="Chọn phong cách"
      >
        {translationStyles.map((styleOption) => (
          <Option value={styleOption.value} key={styleOption.value}>
            {styleOption.label}
          </Option>
        ))}
      </Select>
    </div>
  );
};

StyleSelector.propTypes = {
  style: PropTypes.string.isRequired,
  setStyle: PropTypes.func.isRequired
};

export default StyleSelector; 