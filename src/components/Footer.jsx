import { useState, useEffect } from 'react';
import './Footer.css';
import { MdEmail, MdPhone, MdLocationOn, MdLanguage } from 'react-icons/md';
import { getConfig } from '../api/apis';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [config, setConfig] = useState({
    name_web: 'System Language',
    address_web: '',
    name_owner: '',
    phone_1: '',
    phone_2: '',
    google_map_link: '',
    address: '',
    email: ''
  });
  
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const result = await getConfig();
        if (result.success && result.data) {
          setConfig(result.data);
        }
      } catch (error) {
        console.error('Error fetching config:', error);
      }
    };
    
    fetchConfig();
  }, []);
  
  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h5>{config.name_web || 'System Language'}</h5>
            <p>Dịch vụ dịch thuật và phân tích ngôn ngữ chuyên nghiệp</p>
            {config.address_web && (
              <p className="footer-website">
                <MdLanguage className="footer-icon" /> 
                <a href={config.address_web} target="_blank" rel="noopener noreferrer">
                  {config.address_web}
                </a>
              </p>
            )}
          </div>
          
          <div className="footer-section">
            <h5>Liên hệ</h5>
            <ul className="footer-links">
              <li><MdPhone className="footer-icon" /> {config.phone_1 || '+84 123 456 789'}</li>
              {config.phone_2 && <li><MdPhone className="footer-icon" /> {config.phone_2}</li>}
              {config.email && <li><MdEmail className="footer-icon" /> {config.email}</li>}
              {config.address && (
                <li><MdLocationOn className="footer-icon" /> {config.address}</li>
              )}
              {!config.address && (
                <li><MdLocationOn className="footer-icon" /> TP. Hồ Chí Minh, Việt Nam</li>
              )}
            </ul>
          </div>
          
          <div className="footer-section">
            <h5>Truy cập nhanh</h5>
            <ul className="footer-links">
              <li><a href="/text">Dịch văn bản</a></li>
              <li><a href="/image">Dịch hình ảnh</a></li>
              <li><a href="/file">Dịch tài liệu</a></li>
              <li><a href="/web">Dịch trang web</a></li>
            </ul>
          </div>
        </div>
        
        {config.google_map_link && (
          <div className="footer-map">
            <iframe 
              src={config.google_map_link}
              width="100%" 
              height="200" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Maps"
            ></iframe>
          </div>
        )}
        
        <div className="footer-bottom">
          <p>&copy; {currentYear} {config.name_web || 'System Language'}. All rights reserved.</p>
          {config.name_owner && <p>Owner: {config.name_owner}</p>}
        </div>
      </div>
    </footer>
  );
};

export default Footer; 