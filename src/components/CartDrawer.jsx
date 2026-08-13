import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { usePopup } from '../context/PopupContext';

export default function CartDrawer() {
  const { cartItems, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, totalPrice, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { showToast } = usePopup();
  const navigate = useNavigate();

  const handleStartShopping = () => {
    setIsCartOpen(false);
    navigate('/');
    setTimeout(() => {
      const element = document.getElementById('nav2');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const [orderType, setOrderType] = useState('takeaway'); // takeaway or dine-in
  const [activeBookings, setActiveBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Fetch active bookings if user selects dine-in and is logged in
  useEffect(() => {
    if (orderType === 'dine-in' && user) {
      setLoadingBookings(true);
      fetch(`/api/user-data?user_id=${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.bookings) {
            setActiveBookings(data.bookings);
            if (data.bookings.length > 0) {
              setSelectedBookingId(data.bookings[0].id);
            }
          }
        })
        .catch((err) => console.error('Error fetching user bookings:', err))
        .finally(() => setLoadingBookings(false));
    }
  }, [orderType, user]);

  if (!isCartOpen) return null;

  const handleCheckout = async () => {
    if (!user) {
      showToast('Please Sign In to place an order.', 'error');
      setIsCartOpen(false);
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) return;

    setSubmittingOrder(true);
    try {
      const response = await fetch('/api/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          items: cartItems.map((item) => ({
            title: item.title,
            price: item.price.replace('â‚¹', '₹'),
            img: item.img,
            quantity: item.quantity
          })),
          total_price: totalPrice,
          order_type: orderType,
          booking_id: orderType === 'dine-in' ? selectedBookingId : null
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order.');
      }

      showToast('Order placed successfully! Tracking status: Preparing.', 'success');
      clearCart();
      setIsCartOpen(false);
      navigate('/dashboard');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="cart-drawer-overlay" onClick={() => setIsCartOpen(false)}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={() => setIsCartOpen(false)}>&times;</button>
        
        <h2 className="cart-title">Your Order Cart</h2>

        {cartItems.length === 0 ? (
          <div className="empty-cart-message">
            <p>Your cart is empty.</p>
            <button className="start-shopping-btn" onClick={handleStartShopping}>Start Adding Items</button>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items-list">
              {cartItems.map((item, idx) => (
                <div key={idx} className="cart-item-row">
                  <img src={item.img} alt={item.title} className="cart-item-img" />
                  <div className="cart-item-details">
                    <div className="cart-item-name">{item.title}</div>
                    <div className="cart-item-price">{item.price.replace('â‚¹', '₹')}</div>
                    <div className="quantity-controls">
                      <button className="qty-btn" onClick={() => updateQuantity(item.title, item.quantity - 1)}>-</button>
                      <span className="qty-val">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateQuantity(item.title, item.quantity + 1)}>+</button>
                    </div>
                  </div>
                  <button className="delete-row-btn" onClick={() => removeFromCart(item.title)}>&times;</button>
                </div>
              ))}
            </div>

            <div className="order-options-box">
              <h3 className="options-title">Order Method</h3>
              <div className="options-toggle">
                <button 
                  className={`toggle-btn ${orderType === 'takeaway' ? 'active' : ''}`}
                  onClick={() => setOrderType('takeaway')}
                >
                  Takeaway
                </button>
                <button 
                  className={`toggle-btn ${orderType === 'dine-in' ? 'active' : ''}`}
                  onClick={() => setOrderType('dine-in')}
                >
                  Dine-In
                </button>
              </div>

              {orderType === 'dine-in' && (
                <div className="dine-in-link-section">
                  <h4 className="link-title">Link to Table Booking</h4>
                  {!user ? (
                    <p className="auth-hint">Sign In to link order with your table bookings.</p>
                  ) : loadingBookings ? (
                    <p className="loading-hint">Loading bookings...</p>
                  ) : activeBookings.length === 0 ? (
                    <div className="no-bookings-hint">
                      <p>No active table bookings found.</p>
                      <button className="book-inline-btn" onClick={() => { setIsCartOpen(false); navigate('/book-table'); }}>Book a Table</button>
                    </div>
                  ) : (
                    <select 
                      className="booking-select-dropdown"
                      value={selectedBookingId}
                      onChange={(e) => setSelectedBookingId(e.target.value)}
                    >
                      {activeBookings.map((b) => (
                        <option key={b.id} value={b.id}>
                          Table for {b.guests} ({b.date} @ {b.time})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>

            <div className="cart-summary-box">
              <div className="summary-row">
                <span>Total Items</span>
                <span>{cartItems.reduce((acc, i) => acc + i.quantity, 0)}</span>
              </div>
              <div className="summary-row total">
                <span>Total Cost</span>
                <span>Rs. {totalPrice}</span>
              </div>
              
              <button 
                className="checkout-btn" 
                onClick={handleCheckout}
                disabled={submittingOrder || (orderType === 'dine-in' && user && activeBookings.length === 0)}
              >
                {submittingOrder ? 'Placing Order...' : user ? 'Place Order & Checkout' : 'Sign In to Checkout'}
              </button>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .cart-drawer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          justify-content: flex-end;
          animation: fadeIn 0.3s ease;
        }

        .cart-drawer {
          width: 100%;
          max-width: 420px;
          height: 100%;
          background: #003554;
          border-left: 1px solid #00a6fb;
          box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          padding: 30px 25px;
          box-sizing: border-box;
          position: relative;
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .close-btn {
          position: absolute;
          top: 15px;
          left: 15px;
          background: transparent;
          border: none;
          color: #00a6fb;
          font-size: 32px;
          cursor: pointer;
          transition: color 0.2s;
        }
        .close-btn:hover {
          color: #E2F3F4;
        }

        .cart-title {
          text-align: center;
          color: #E2F3F4;
          font-family: 'Forum', cursive;
          font-size: 28px;
          margin-top: 20px;
          margin-bottom: 25px;
          letter-spacing: 1px;
        }

        .empty-cart-message {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #ccc;
          font-family: 'Poppins', sans-serif;
          font-size: 16px;
        }

        .start-shopping-btn {
          margin-top: 15px;
          background: #00a6fb;
          border: none;
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.2s;
        }
        .start-shopping-btn:hover {
          background: #008cd1;
        }

        .cart-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
        }

        .cart-items-list {
          flex: 1;
          overflow-y: auto;
          margin-bottom: 20px;
          padding-right: 5px;
        }

        /* Scrollbar styling */
        .cart-items-list::-webkit-scrollbar {
          width: 5px;
        }
        .cart-items-list::-webkit-scrollbar-thumb {
          background: #00a6fb;
          border-radius: 5px;
        }

        .cart-item-row {
          display: flex;
          align-items: center;
          gap: 15px;
          background: rgba(5, 25, 35, 0.4);
          padding: 12px;
          border-radius: 12px;
          border: 1px solid rgba(0, 166, 251, 0.2);
          margin-bottom: 12px;
          position: relative;
        }

        .cart-item-img {
          width: 65px;
          height: 65px;
          border-radius: 8px;
          object-fit: cover;
        }

        .cart-item-details {
          flex: 1;
          font-family: 'Poppins', sans-serif;
        }

        .cart-item-name {
          color: #E2F3F4;
          font-weight: 600;
          font-size: 15px;
          margin-bottom: 4px;
        }

        .cart-item-price {
          color: #00a6fb;
          font-weight: bold;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .qty-btn {
          width: 24px;
          height: 24px;
          background: #00a6fb;
          color: white;
          border: none;
          border-radius: 4px;
          font-weight: bold;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .qty-btn:hover {
          background: #008cd1;
        }

        .qty-val {
          color: #E2F3F4;
          font-size: 14px;
          font-weight: 600;
        }

        .delete-row-btn {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          font-size: 24px;
          cursor: pointer;
          transition: color 0.2s;
          padding: 0;
          align-self: flex-start;
          margin-top: -5px;
        }
        .delete-row-btn:hover {
          color: #ff4a4a;
        }

        .order-options-box {
          background: rgba(5, 25, 35, 0.5);
          border: 1px solid rgba(0, 166, 251, 0.3);
          border-radius: 12px;
          padding: 15px;
          margin-bottom: 20px;
          font-family: 'Poppins', sans-serif;
        }

        .options-title {
          color: #E2F3F4;
          font-size: 14px;
          font-weight: 600;
          margin: 0 0 10px 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .options-toggle {
          display: flex;
          gap: 10px;
        }

        .toggle-btn {
          flex: 1;
          background: transparent;
          border: 1.5px solid #00a6fb;
          color: #00a6fb;
          padding: 8px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .toggle-btn.active {
          background: #00a6fb;
          color: white;
        }

        .dine-in-link-section {
          margin-top: 15px;
          border-top: 1px solid rgba(0, 166, 251, 0.2);
          padding-top: 12px;
        }

        .link-title {
          color: #E2F3F4;
          font-size: 13px;
          font-weight: 600;
          margin: 0 0 8px 0;
        }

        .auth-hint, .loading-hint, .no-bookings-hint p {
          color: #ccc;
          font-size: 12px;
          margin: 0 0 8px 0;
        }

        .book-inline-btn {
          background: transparent;
          border: 1px solid #00a6fb;
          color: #00a6fb;
          padding: 5px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .book-inline-btn:hover {
          background: rgba(0, 166, 251, 0.1);
        }

        .booking-select-dropdown {
          width: 100%;
          background: #051923;
          border: 1.5px solid #00a6fb;
          border-radius: 8px;
          color: #E2F3F4;
          padding: 8px 10px;
          font-size: 13px;
          cursor: pointer;
          outline: none;
        }

        .cart-summary-box {
          border-top: 1px solid rgba(0, 166, 251, 0.3);
          padding-top: 15px;
          font-family: 'Poppins', sans-serif;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          color: #ccc;
          font-size: 14px;
          margin-bottom: 8px;
        }
        .summary-row.total {
          color: #E2F3F4;
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 18px;
        }
        .summary-row.total span:last-child {
          color: #00a6fb;
        }

        .checkout-btn {
          width: 100%;
          background: #00a6fb;
          color: white;
          border: none;
          padding: 12px;
          border-radius: 10px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.2s;
        }
        .checkout-btn:hover:not(:disabled) {
          background: #008cd1;
        }
        .checkout-btn:disabled {
          background: #003554;
          border: 1px solid rgba(0, 166, 251, 0.2);
          color: rgba(255, 255, 255, 0.3);
          cursor: not-allowed;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}} />
    </div>
  );
}
