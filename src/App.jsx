import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import TextPage from "./pages/TextPage";
import ImagePage from "./pages/ImagePage";
import FilePage from "./pages/FilePage";
import WebPage from "./pages/WebPage";
import Navbar from "./components/Navbar";

function App() {
  return (
    <Router>
      <div className="container">
        <h1 className="text-center text-primary mb-4">Translate AI</h1>

        <Navbar />

        {/* ✅ Định nghĩa các Route */}
        <Routes>
          <Route path="/" element={<Navigate to="/text" />} />
          <Route path="/text" element={<TextPage />} />
          <Route path="/image" element={<ImagePage />} />
          <Route path="/file" element={<FilePage />} />
          <Route path="/web" element={<WebPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
