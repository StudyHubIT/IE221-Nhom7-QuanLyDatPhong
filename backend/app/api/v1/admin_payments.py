"""
Task C — Đặt phòng & Thanh toán (Vũ)
Router quản lý API Admin Payments:
- GET /api/v1/admin/payments: Lấy danh sách giao dịch thanh toán dành cho Admin (lọc status, method, q + phân trang)
"""

from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import CurrentAdmin
from app.api.v1.booking_utils import build_payment_response
from app.core.db import get_db
from app.models.hotel import Payment as PaymentModel
from app.models.hotel import User as UserModel
from app.schemas.hotel import Paginated, Payment

# Khai báo APIRouter cho Admin Payments
payments_router = APIRouter(
    prefix="/api/v1/admin/payments", tags=["AdminPayments"]
)


@payments_router.get("")
def list_payments(
    _admin: CurrentAdmin,
    db: Annotated[Session, Depends(get_db)],
    status: str | None = None,
    method: str | None = None,
    q: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> Paginated[Payment]:
    """Lấy danh sách tất cả các giao dịch thanh toán cho Admin."""

    # 1. Xây dựng các điều kiện lọc (SQLAlchemy 2.0 style)
    filters = []

    # Lọc theo trạng thái thanh toán (PENDING, PAID, FAILED, REFUNDED)
    if status is not None:
        filters.append(PaymentModel.status == status)

    # Lọc theo phương thức thanh toán (BANKING, CASH)
    if method is not None:
        filters.append(PaymentModel.method == method)

    # Lọc theo từ khóa tìm kiếm (Mã đơn DP-xxxx hoặc Tên/Email khách hàng)
    if q and q.strip():
        keyword = q.strip()
        code_id = keyword.upper().removeprefix("DP-")
        if code_id.isdigit():
            # Nếu truyền vào dạng DP-0002 hoặc số 2 -> Tìm theo ID đơn đặt phòng
            filters.append(PaymentModel.booking_id == int(code_id))
        else:
            # Tìm theo Tên hoặc Email của khách hàng
            filters.append(
                PaymentModel.user_id.in_(
                    select(UserModel.id).where(
                        (UserModel.full_name.ilike(f"%{keyword}%"))
                        | (UserModel.email.ilike(f"%{keyword}%"))
                    )
                )
            )

    # 2. Đếm tổng số bản ghi thanh toán thỏa điều kiện
    total = db.scalar(
        select(func.count()).select_from(PaymentModel).where(*filters)
    ) or 0

    # 3. Truy vấn danh sách thanh toán phân trang
    payments = db.scalars(
        select(PaymentModel)
        .where(*filters)
        .order_by(PaymentModel.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()

    # 4. Trả về đối tượng phân trang Paginated[Payment]
    return Paginated[Payment](
        items=[build_payment_response(p) for p in payments],
        total=total,
        page=page,
        page_size=page_size,
    )
