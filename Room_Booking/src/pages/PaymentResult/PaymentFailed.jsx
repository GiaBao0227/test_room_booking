// /Room_Booking/src/pages/PaymentResult/PaymentFailed.jsx
import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import "./PaymentResult.css"; // Import CSS

function PaymentFailed() {
  const [searchParams] = useSearchParams();
  const transactionDetails = Object.fromEntries([...searchParams]);
  let displayMessage = "Giao dịch không thành công, đã bị hủy hoặc có lỗi.";

  // Check for specific errors passed from BE or VNPAY
  if (transactionDetails.error === "checksum_invalid") {
    displayMessage =
      "Lỗi: Dữ liệu VNPAY trả về không hợp lệ. Vui lòng liên hệ hỗ trợ.";
  } else if (transactionDetails.error === "server_config_error") {
    displayMessage =
      "Lỗi: Có lỗi cấu hình phía máy chủ. Vui lòng liên hệ hỗ trợ.";
  } else if (
    transactionDetails.vnp_ResponseCode &&
    transactionDetails.vnp_ResponseCode !== "00"
  ) {
    // Thêm các diễn giải mã lỗi phổ biến của VNPAY nếu muốn
    const vnpErrorCode = transactionDetails.vnp_ResponseCode;
    let reason = `Mã lỗi VNPAY: ${vnpErrorCode}.`;
    if (vnpErrorCode === "02")
      reason = "Giao dịch đã được gửi tới VNPAY nhưng chưa thành công.";
    if (vnpErrorCode === "07")
      reason = "Trừ tiền thành công nhưng giao dịch bị nghi ngờ gian lận.";
    if (vnpErrorCode === "09")
      reason = "Thẻ/Tài khoản chưa đăng ký Internet Banking tại ngân hàng.";
    if (vnpErrorCode === "10")
      reason = "Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần.";
    if (vnpErrorCode === "11") reason = "Đã hết hạn chờ thanh toán.";
    if (vnpErrorCode === "12") reason = "Thẻ/Tài khoản bị khóa.";
    if (vnpErrorCode === "13")
      reason = "Quý khách nhập sai mật khẩu xác thực (OTP).";
    if (vnpErrorCode === "24") reason = "Khách hàng hủy giao dịch.";
    if (vnpErrorCode === "51") reason = "Tài khoản không đủ số dư.";
    if (vnpErrorCode === "65")
      reason = "Tài khoản đã vượt quá hạn mức giao dịch trong ngày.";
    if (vnpErrorCode === "75") reason = "Ngân hàng thanh toán đang bảo trì.";
    displayMessage = `Giao dịch thất bại. ${reason}`;
  }

  return (
    <div className="payment-result-container failed">
      <h1>Thanh toán Thất Bại!</h1>
      <p>{displayMessage}</p>
      <div className="details-box">
        <h2>Chi tiết Phản hồi (VNPAY)</h2>
        {/* Hiển thị chi tiết hơn */}
        <table className="details-table">
          <tbody>
            {Object.entries(transactionDetails).map(([key, value]) => (
              <tr key={key}>
                <td className="key-cell">{key}</td>
                <td className="value-cell">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* <pre>{JSON.stringify(transactionDetails, null, 2)}</pre> */}
      </div>
      {/* Thêm Link quay lại trang thanh toán hoặc trang chủ */}
      <Link to="/paying" className="result-button">
        Thử lại Thanh toán
      </Link>
      <Link to="/" className="result-button secondary">
        Về Trang Chủ
      </Link>
    </div>
  );
}
export default PaymentFailed;
