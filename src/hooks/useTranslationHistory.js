import { useState, useEffect } from "react";
import { getTranslationHistory, deleteTranslationHistory, deleteAllTranslationHistory } from "../api/apis";
import { toast } from "react-toastify";

const useTranslationHistory = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [limit, setLimit] = useState(100);
  
  // Lấy thông tin người dùng từ localStorage
  const getUserFromLocalStorage = () => {
    const userData = localStorage.getItem("user");
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  };
  
  const user = getUserFromLocalStorage();
  
  // Lấy lịch sử dịch thuật
  const fetchHistory = async () => {
    if (!user?.user_id) {
      toast.error("Không tìm thấy thông tin người dùng");
      return;
    }
    
    try {
      setIsLoading(true);
      const skip = currentPage * limit;
      
      const result = await getTranslationHistory(user.user_id, skip, limit);
      
      if (result.success) {
        setHistory(result.items);
        setTotalItems(result.total);
      } else {
        toast.error(result.error || "Lỗi khi lấy lịch sử dịch thuật");
      }
    } catch (error) {
      console.error("Lỗi khi lấy lịch sử dịch thuật:", error);
      toast.error("Đã xảy ra lỗi khi lấy lịch sử dịch thuật");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Xóa một lịch sử dịch thuật
  const handleDeleteHistory = async (historyId) => {
    if (!user?.user_id) {
      toast.error("Không tìm thấy thông tin người dùng");
      return;
    }
    
    try {
      setIsLoading(true);
      const result = await deleteTranslationHistory(historyId, user.user_id);
      
      if (result.success) {
        toast.success(result.message || "Đã xóa lịch sử dịch thuật thành công");
        // Cập nhật lại danh sách lịch sử
        await fetchHistory();
      } else {
        toast.error(result.error || "Lỗi khi xóa lịch sử dịch thuật");
      }
    } catch (error) {
      console.error("Lỗi khi xóa lịch sử dịch thuật:", error);
      toast.error("Đã xảy ra lỗi khi xóa lịch sử dịch thuật");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Xóa tất cả lịch sử dịch thuật
  const handleDeleteAllHistory = async () => {
    if (!user?.user_id) {
      toast.error("Không tìm thấy thông tin người dùng");
      return;
    }
    
    if (window.confirm("Bạn có chắc chắn muốn xóa tất cả lịch sử dịch thuật?")) {
      try {
        setIsLoading(true);
        const result = await deleteAllTranslationHistory(user.user_id);
        
        if (result.success) {
          toast.success(result.message || "Đã xóa tất cả lịch sử dịch thuật thành công");
          setHistory([]);
          setTotalItems(0);
        } else {
          toast.error(result.error || "Lỗi khi xóa tất cả lịch sử dịch thuật");
        }
      } catch (error) {
        console.error("Lỗi khi xóa tất cả lịch sử dịch thuật:", error);
        toast.error("Đã xảy ra lỗi khi xóa tất cả lịch sử dịch thuật");
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Tải lại lịch sử dịch thuật
  const refreshHistory = () => {
    fetchHistory();
  };
  
  // Load lịch sử ban đầu
  useEffect(() => {
    if (user?.user_id) {
      fetchHistory();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, limit]);
  
  return {
    history,
    isLoading,
    totalItems,
    handleDeleteHistory,
    handleDeleteAllHistory,
    refreshHistory,
    currentPage,
    setCurrentPage,
    limit,
    setLimit,
  };
};

export default useTranslationHistory;