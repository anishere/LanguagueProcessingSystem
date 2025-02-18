import { NavLink } from "react-router-dom";
import { FaLanguage } from "react-icons/fa"; // Icon dịch văn bản
import { MdImage, MdInsertDriveFile, MdWeb } from "react-icons/md"; // Icon hình ảnh, file, web
import "./Navbar.css"; // Import CSS

const Navbar = () => {
  return (
    <nav className="navbar">
      <NavLink to="/text" className="nav-item">
        <FaLanguage className="icon" />
        Văn bản
      </NavLink>
      <NavLink to="/image" className="nav-item">
        <MdImage className="icon" />
        Hình ảnh
      </NavLink>
      <NavLink to="/file" className="nav-item">
        <MdInsertDriveFile className="icon" />
        Tài liệu
      </NavLink>
      <NavLink to="/web" className="nav-item">
        <MdWeb className="icon" />
        Trang web
      </NavLink>
    </nav>
  );
};

export default Navbar;
