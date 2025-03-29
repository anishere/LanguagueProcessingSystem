from fastapi import APIRouter, Depends, HTTPException, Query, Response
from server.database import get_session
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, func, and_
from server.utils.auth import get_current_user
from server.models.models import User, CreditTransaction
from typing import Optional, List
from datetime import datetime, date
from server.utils.api_utils import create_history_response
from server.utils.credit_api import get_user_credit_transactions, get_revenue_credit_transactions, get_all_credit_transactions

router = APIRouter()

@router.get("/all", summary="Lấy tất cả giao dịch credits trong hệ thống")
async def get_all_transactions(
    skip: int = 0,
    limit: int = 10,
    sort_order: str = "desc",
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    transaction_type: Optional[str] = None,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Lấy tất cả giao dịch credits trong hệ thống.
    Chỉ admin mới có quyền truy cập API này.
    
    - **skip**: Số bản ghi bỏ qua (phân trang)
    - **limit**: Số bản ghi trả về tối đa (phân trang)
    - **sort_order**: Thứ tự sắp xếp ("asc" hoặc "desc")
    - **start_date**: Ngày bắt đầu (định dạng YYYY-MM-DD)
    - **end_date**: Ngày kết thúc (định dạng YYYY-MM-DD)
    - **transaction_type**: Loại giao dịch (purchase, usage, v.v.)
    """
    
    # Kiểm tra quyền admin
    if current_user.account_type != "1":
        raise HTTPException(status_code=403, detail="Không có quyền truy cập")
    
    # Lấy tất cả giao dịch
    result = get_all_credit_transactions(
        db=db,
        skip=skip,
        limit=limit,
        sort_order=sort_order,
        start_date=start_date,
        end_date=end_date,
        transaction_type=transaction_type
    )
    
    # Tính tổng số lượng và tổng tiền
    total_amount = 0
    
    # Nếu lọc theo loại giao dịch là purchase, tính tổng doanh thu
    if transaction_type == "purchase":
        total_amount = result.get("total_amount", 0)
    
    # Tạo response
    return create_history_response(
        items=result.get("items", []),
        total=result.get("total", 0),
        skip=skip,
        limit=limit,
        totalAmount=total_amount
    ) 