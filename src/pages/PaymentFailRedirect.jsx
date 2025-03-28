

function PaymentFailRedirect() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h2 style={{
        color: '#e74c3c',
        marginBottom: '20px'
      }}>
        Thanh toán thất bại!
      </h2>
      <p style={{
        marginBottom: '20px'
      }}>
        Rất tiếc, giao dịch của bạn không thành công. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.
      </p>
      <p>
        Vui lòng đóng tab này để quay trở lại.
      </p>
    </div>
  );
}

export default PaymentFailRedirect;