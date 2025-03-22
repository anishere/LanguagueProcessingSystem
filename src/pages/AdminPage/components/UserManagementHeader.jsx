import { Row, Col, Input, Button, Space } from 'antd';
import { SearchOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

const UserManagementHeader = ({ 
  searchText, 
  setSearchText, 
  onAddUser, 
  onRefresh, 
  loading 
}) => {
  return (
    <Row gutter={[16, 16]} className="toolbar">
      <Col xs={24} sm={12} md={8} lg={6}>
        <Input
          placeholder="Tìm kiếm theo tên hoặc email"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
      </Col>
      <Col xs={24} sm={12} md={16} lg={18}>
        <Space>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={onAddUser}
          >
            Thêm tài khoản
          </Button>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={onRefresh}
            loading={loading}
          >
            Làm mới
          </Button>
        </Space>
      </Col>
    </Row>
  );
};

UserManagementHeader.propTypes = {
  searchText: PropTypes.string.isRequired,
  setSearchText: PropTypes.func.isRequired,
  onAddUser: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired
};

export default UserManagementHeader;