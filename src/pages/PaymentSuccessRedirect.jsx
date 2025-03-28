import './PaymentSuccess.css'; // Nếu bạn muốn thêm CSS

function PaymentSuccessRedirect() {

  return (
    <div className="payment-success-container">
      <h2>Thanh toán thành công!</h2>
      <p>
        Cảm ơn bạn đã thanh toán. Vui lòng đóng tab này và quay trở lại trang web chính của chúng tôi.
      </p>
    </div>
  );
}

export default PaymentSuccessRedirect;