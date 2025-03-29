from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, func, and_, or_
from server.models.models import User, CreditTransaction
from typing import Optional, List, Dict, Any
from datetime import date
import logging

logger = logging.getLogger("uvicorn")

def get_user_credit_transactions(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 10,
    sort_order: str = "desc",
) -> Dict[str, Any]:
    """
    Lấy thông tin giao dịch credits của một người dùng cụ thể
    """
    try:
        # Truy vấn lấy tổng số bản ghi
        total_count = db.query(func.count(CreditTransaction.id)).filter(
            CreditTransaction.user_id == user_id
        ).scalar()

        # Xác định thứ tự sắp xếp
        order_by = desc(CreditTransaction.created_at) if sort_order.lower() == "desc" else asc(CreditTransaction.created_at)

        # Truy vấn lấy danh sách giao dịch
        query = db.query(CreditTransaction).filter(
            CreditTransaction.user_id == user_id
        ).order_by(order_by)

        # Phân trang kết quả
        transactions = query.offset(skip).limit(limit).all()

        return {
            "items": transactions,
            "total": total_count
        }
    except Exception as e:
        logger.error(f"Error fetching credit transactions: {str(e)}")
        return {
            "items": [],
            "total": 0
        }

def get_revenue_credit_transactions(
    db: Session,
    skip: int = 0,
    limit: int = 10,
    sort_order: str = "desc",
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
) -> Dict[str, Any]:
    """
    Lấy thông tin giao dịch credits cho doanh thu (chỉ lấy giao dịch loại purchase)
    """
    try:
        # Xây dựng điều kiện lọc
        filter_conditions = [CreditTransaction.transaction_type == "purchase"]
        
        # Thêm điều kiện lọc theo ngày nếu có
        if start_date:
            filter_conditions.append(func.date(CreditTransaction.created_at) >= start_date)
        if end_date:
            filter_conditions.append(func.date(CreditTransaction.created_at) <= end_date)
        
        # Truy vấn lấy tổng số bản ghi
        total_count = db.query(func.count(CreditTransaction.id)).filter(
            *filter_conditions
        ).scalar()
        
        # Tính tổng doanh thu
        total_amount = db.query(func.sum(CreditTransaction.amount)).filter(
            *filter_conditions
        ).scalar() or 0
        
        # Xác định thứ tự sắp xếp
        order_by = desc(CreditTransaction.created_at) if sort_order.lower() == "desc" else asc(CreditTransaction.created_at)
        
        # Truy vấn lấy danh sách giao dịch
        transactions = db.query(CreditTransaction).filter(
            *filter_conditions
        ).order_by(order_by).offset(skip).limit(limit).all()
        
        # Thêm thông tin username vào mỗi giao dịch
        for tx in transactions:
            user = db.query(User.username).filter(User.id == tx.user_id).first()
            tx.username = user.username if user else f"User {tx.user_id}"
        
        return {
            "items": transactions,
            "total": total_count,
            "total_amount": total_amount
        }
    except Exception as e:
        logger.error(f"Error fetching revenue transactions: {str(e)}")
        return {
            "items": [],
            "total": 0,
            "total_amount": 0
        }

def get_all_credit_transactions(
    db: Session,
    skip: int = 0,
    limit: int = 10,
    sort_order: str = "desc",
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    transaction_type: Optional[str] = None
) -> Dict[str, Any]:
    """
    Lấy tất cả giao dịch credits trong hệ thống với các tùy chọn lọc
    """
    try:
        # Xây dựng điều kiện lọc
        filter_conditions = []
        
        # Thêm điều kiện lọc theo loại giao dịch nếu có
        if transaction_type:
            filter_conditions.append(CreditTransaction.transaction_type == transaction_type)
        
        # Thêm điều kiện lọc theo ngày nếu có
        if start_date:
            filter_conditions.append(func.date(CreditTransaction.created_at) >= start_date)
        if end_date:
            filter_conditions.append(func.date(CreditTransaction.created_at) <= end_date)
        
        # Truy vấn lấy tổng số bản ghi
        total_count = db.query(func.count(CreditTransaction.id))
        if filter_conditions:
            total_count = total_count.filter(*filter_conditions)
        total_count = total_count.scalar()
        
        # Tính tổng số tiền nếu là giao dịch mua (purchase)
        total_amount = 0
        if transaction_type == "purchase":
            amount_query = db.query(func.sum(CreditTransaction.amount))
            if filter_conditions:
                amount_query = amount_query.filter(*filter_conditions)
            total_amount = amount_query.scalar() or 0
        
        # Xác định thứ tự sắp xếp
        order_by = desc(CreditTransaction.created_at) if sort_order.lower() == "desc" else asc(CreditTransaction.created_at)
        
        # Truy vấn lấy danh sách giao dịch
        query = db.query(CreditTransaction)
        if filter_conditions:
            query = query.filter(*filter_conditions)
        transactions = query.order_by(order_by).offset(skip).limit(limit).all()
        
        # Thêm thông tin username vào mỗi giao dịch
        for tx in transactions:
            user = db.query(User.username).filter(User.id == tx.user_id).first()
            tx.username = user.username if user else f"User {tx.user_id}"
        
        return {
            "items": transactions,
            "total": total_count,
            "total_amount": total_amount
        }
    except Exception as e:
        logger.error(f"Error fetching all credit transactions: {str(e)}")
        return {
            "items": [],
            "total": 0,
            "total_amount": 0
        } 