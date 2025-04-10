// /Room_Booking/src/pages/PaymentResult/PaymentSuccess.jsx
import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import "./PaymentResult.css"; // Import CSS

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const transactionDetails = Object.fromEntries([...searchParams]);

  // Function to format known amount fields
  const formatAmount = (key, value) => {
    if (key === "vnp_Amount" && value) {
      const amount = parseInt(value) / 100;
      return `${amount.toLocaleString("vi-VN")} VND`;
    }
    return value;
  };

  // Function to format date fields
  const formatDate = (key, value) => {
    if (key === "vnp_PayDate" && value && value.length === 14) {
      // Format: YYYYMMDDHHMMSS -> DD/MM/YYYY HH:MM:SS
      try {
        const year = value.substring(0, 4);
        const month = value.substring(4, 6);
        const day = value.substring(6, 8);
        const hour = value.substring(8, 10);
        const minute = value.substring(10, 12);
        const second = value.substring(12, 14);
        return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
      } catch {
        return value; // Return original if parsing fails
      }
    }
    return value;
  };

  return (
    <div className="payment-result-container success">
      <h1>Thanh toán Thành Công!</h1>
      <p>Cảm ơn bạn đã hoàn tất giao dịch qua VNPAY.</p>
      <p>Trạng thái đơn hàng sẽ được cập nhật trong hệ thống.</p>
      <div className="details-box">
        <h2>Chi tiết Giao dịch (VNPAY)</h2>
        {/* Hiển thị chi tiết hơn */}
        <table className="details-table">
          <tbody>
            {Object.entries(transactionDetails).map(([key, value]) => (
              <tr key={key}>
                <td className="key-cell">{key}</td>
                <td className="value-cell">
                  {formatDate(key, formatAmount(key, value))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* <pre>{JSON.stringify(transactionDetails, null, 2)}</pre> */}
      </div>
      {/* Thêm Link quay về trang chủ hoặc trang đơn hàng */}
      <Link to="/" className="result-button">
        Về Trang Chủ
      </Link>
      {/* <Link to="/my-bookings" className="result-button secondary">Xem đơn hàng</Link> */}
    </div>
  );
}
export default PaymentSuccess;
