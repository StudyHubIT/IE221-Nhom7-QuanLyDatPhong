"""Test cho Task D — hủy đặt phòng và hoàn tiền.

Vì `POST /api/v1/bookings` (checkout) vẫn còn là stub, không thể tạo đơn đặt
phòng qua API. Các test dưới đây tự chèn thẳng đơn + thanh toán vào database
bằng SQLAlchemy, chạy xong thì xóa lại để không để rác trong DB dev.
"""

from datetime import datetime
from decimal import Decimal

import pytest
from fastapi.testclient import TestClient

from app.core.db import SessionLocal
from app.main import app
from app.models.hotel import Booking, Payment, Refund, User


client = TestClient(app)

SEED_USER_EMAIL = "user1@gmail.com"
OTHER_USER_EMAIL = "user2@gmail.com"
SEED_PASSWORD = "password123"

TIEN_THANH_TOAN = Decimal("1600000")


def _tao_don(trang_thai: str, co_thanh_toan: bool) -> int:
    """Tạo sẵn một đơn đặt phòng của khách user1, trả về id đơn."""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == SEED_USER_EMAIL).first()
        assert user is not None, "Chưa có dữ liệu seed, hãy chạy `make seed`"

        booking = Booking(
            user_id=user.id,
            check_in=datetime(2026, 8, 14),
            check_out=datetime(2026, 8, 16),
            trang_thai=trang_thai,
        )
        db.add(booking)
        db.commit()
        db.refresh(booking)

        if co_thanh_toan:
            payment = Payment(
                booking_id=booking.id,
                user_id=user.id,
                amount=TIEN_THANH_TOAN,
                method="BANKING",
                status="PAID",
            )
            db.add(payment)
            db.commit()

        return booking.id
    finally:
        db.close()


def _xoa_don(booking_id: int) -> None:
    """Dọn dẹp dữ liệu test: xóa theo thứ tự REFUNDS -> PAYMENTS -> DATPHONG."""
    db = SessionLocal()
    try:
        payments = db.query(Payment).filter(Payment.booking_id == booking_id).all()
        for payment in payments:
            db.query(Refund).filter(Refund.payment_id == payment.id).delete()
        db.query(Payment).filter(Payment.booking_id == booking_id).delete()
        db.query(Booking).filter(Booking.id == booking_id).delete()
        db.commit()
    finally:
        db.close()


def _lay_trang_thai_don(booking_id: int) -> str:
    """Đọc lại trạng thái đơn trực tiếp từ database."""
    db = SessionLocal()
    try:
        booking = db.query(Booking).filter(Booking.id == booking_id).first()
        return booking.trang_thai
    finally:
        db.close()


def _huy_don(
    booking_id: int, headers: dict[str, str], reason: str = "Đổi lịch trình"
):
    """Gọi API hủy đơn với lý do cho trước."""
    return client.post(
        f"/api/v1/bookings/{booking_id}/cancel",
        headers=headers,
        json={"reason": reason},
    )


@pytest.fixture()
def confirmed_booking_id():
    """Đơn CONFIRMED đã thanh toán — trường hợp hủy được."""
    booking_id = _tao_don("CONFIRMED", co_thanh_toan=True)
    yield booking_id
    _xoa_don(booking_id)


@pytest.fixture()
def unpaid_booking_id():
    """Đơn PENDING chưa có thanh toán — không có gì để hoàn tiền."""
    booking_id = _tao_don("PENDING", co_thanh_toan=False)
    yield booking_id
    _xoa_don(booking_id)


@pytest.fixture()
def checked_in_booking_id():
    """Đơn đã nhận phòng — quá hạn hủy."""
    booking_id = _tao_don("CHECKED_IN", co_thanh_toan=True)
    yield booking_id
    _xoa_don(booking_id)


@pytest.fixture()
def other_user_auth_header() -> dict[str, str]:
    """Token của một khách khác, dùng để thử hủy đơn không phải của mình."""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": OTHER_USER_EMAIL, "password": SEED_PASSWORD},
    )
    assert response.status_code == 200, response.text
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# ===== POST /api/v1/bookings/{id}/cancel =====


def test_cancel_booking_creates_requested_refund(
    confirmed_booking_id, user_auth_header
):
    response = _huy_don(confirmed_booking_id, user_auth_header)

    assert response.status_code == 201, response.text
    body = response.json()
    assert body["status"] == "REQUESTED"
    assert body["booking_id"] == confirmed_booking_id
    assert body["refund_amount"] == float(TIEN_THANH_TOAN)
    assert body["reason"] == "Đổi lịch trình"
    assert body["code"].startswith("RF-")
    assert body["approved_by"] is None


def test_cancel_booking_twice_is_rejected(confirmed_booking_id, user_auth_header):
    first = _huy_don(confirmed_booking_id, user_auth_header)
    assert first.status_code == 201, first.text

    second = _huy_don(confirmed_booking_id, user_auth_header)

    assert second.status_code == 400


def test_cancel_booking_requires_auth(confirmed_booking_id):
    response = client.post(
        f"/api/v1/bookings/{confirmed_booking_id}/cancel",
        json={"reason": "Không đăng nhập"},
    )

    assert response.status_code == 401


def test_cancel_other_user_booking_is_not_found(
    confirmed_booking_id, other_user_auth_header
):
    response = _huy_don(confirmed_booking_id, other_user_auth_header)

    assert response.status_code == 404


def test_cancel_checked_in_booking_is_rejected(
    checked_in_booking_id, user_auth_header
):
    response = _huy_don(checked_in_booking_id, user_auth_header)

    assert response.status_code == 400


def test_cancel_unpaid_booking_is_rejected(unpaid_booking_id, user_auth_header):
    response = _huy_don(unpaid_booking_id, user_auth_header)

    assert response.status_code == 400


# ===== GET /api/v1/admin/refunds =====


def test_list_refunds_requires_admin_auth():
    response = client.get("/api/v1/admin/refunds")

    assert response.status_code == 401


def test_list_refunds_contains_the_new_request(
    confirmed_booking_id, user_auth_header, admin_auth_header
):
    created = _huy_don(confirmed_booking_id, user_auth_header).json()

    response = client.get(
        "/api/v1/admin/refunds",
        headers=admin_auth_header,
        params={"status": "REQUESTED"},
    )

    assert response.status_code == 200
    body = response.json()
    ma_hoan_tien = [refund["code"] for refund in body["items"]]
    assert created["code"] in ma_hoan_tien
    assert body["total"] >= 1


def test_list_refunds_can_search_by_code(
    confirmed_booking_id, user_auth_header, admin_auth_header
):
    created = _huy_don(confirmed_booking_id, user_auth_header).json()

    response = client.get(
        "/api/v1/admin/refunds",
        headers=admin_auth_header,
        params={"q": created["code"]},
    )

    assert response.status_code == 200
    items = response.json()["items"]
    assert len(items) == 1
    assert items[0]["id"] == created["id"]


# ===== POST /api/v1/admin/refunds/{id}/approve | reject =====


def test_approve_refund_also_cancels_the_booking(
    confirmed_booking_id, user_auth_header, admin_auth_header
):
    created = _huy_don(confirmed_booking_id, user_auth_header).json()
    refund_id = created["id"]

    response = client.post(
        f"/api/v1/admin/refunds/{refund_id}/approve", headers=admin_auth_header
    )

    assert response.status_code == 200, response.text
    body = response.json()
    assert body["status"] == "APPROVED"
    assert body["approved_by"] is not None
    assert _lay_trang_thai_don(confirmed_booking_id) == "CANCELLED"


def test_reject_refund_keeps_the_booking_unchanged(
    confirmed_booking_id, user_auth_header, admin_auth_header
):
    created = _huy_don(confirmed_booking_id, user_auth_header).json()
    refund_id = created["id"]

    response = client.post(
        f"/api/v1/admin/refunds/{refund_id}/reject", headers=admin_auth_header
    )

    assert response.status_code == 200, response.text
    assert response.json()["status"] == "REJECTED"
    assert _lay_trang_thai_don(confirmed_booking_id) == "CONFIRMED"


def test_approve_refund_twice_is_rejected(
    confirmed_booking_id, user_auth_header, admin_auth_header
):
    created = _huy_don(confirmed_booking_id, user_auth_header).json()
    refund_id = created["id"]
    lan_dau = client.post(
        f"/api/v1/admin/refunds/{refund_id}/approve", headers=admin_auth_header
    )
    assert lan_dau.status_code == 200, lan_dau.text

    lan_hai = client.post(
        f"/api/v1/admin/refunds/{refund_id}/approve", headers=admin_auth_header
    )

    assert lan_hai.status_code == 400


def test_approve_unknown_refund_is_not_found(admin_auth_header):
    response = client.post(
        "/api/v1/admin/refunds/999999999/approve", headers=admin_auth_header
    )

    assert response.status_code == 404


def test_approve_refund_requires_admin_auth(user_auth_header):
    response = client.post(
        "/api/v1/admin/refunds/1/approve", headers=user_auth_header
    )

    assert response.status_code == 401
