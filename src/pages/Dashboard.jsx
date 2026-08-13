import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { usePopup } from '../context/PopupContext';

export default function Dashboard() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const { showToast, showConfirm } = usePopup();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState('');

  const [editingBooking, setEditingBooking] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: ''
  });

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (booking) => {
    setEditingBooking(booking);
    setEditFormData({
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      date: booking.date,
      time: booking.time,
      guests: booking.guests
    });
  };

  const handleUpdateBooking = async (e) => {
    e.preventDefault();
    setLoadingData(true);
    try {
      const response = await fetch('/api/update-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: editingBooking.id,
          ...editFormData
        })
      });
      const data = await response.json();
      if (response.ok) {
        showToast('Reservation updated successfully!', 'success');
        setBookings((prev) =>
          prev.map((b) => (b.id === editingBooking.id ? data.booking : b))
        );
        setEditingBooking(null);
      } else {
        showToast(data.error || 'Failed to update booking.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error connecting to server.', 'error');
    } finally {
      setLoadingData(false);
    }
  };

  // Redirect to login if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Fetch bookings and orders on load
  const fetchDashboardData = async () => {
    if (!user) return;
    setLoadingData(true);
    setError('');
    try {
      const response = await fetch(`/api/user-data?user_id=${user.id}`);
      const data = await response.json();
      if (response.ok) {
        setBookings(data.bookings || []);
        setOrders(data.orders || []);
      } else {
        setError(data.error || 'Failed to fetch dashboard data.');
      }
    } catch (err) {
      console.error(err);
      setError('Error connecting to backend server.');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleCancelBooking = async (id) => {
    const confirmed = await showConfirm('Are you sure you want to cancel this table booking?');
    if (confirmed) {
      try {
        const response = await fetch('/api/cancel-booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ booking_id: id })
        });
        if (response.ok) {
          setBookings((prev) => prev.filter((b) => b.id !== id));
          showToast('Booking cancelled successfully!', 'success');
          // Refresh dashboard data to update order availability if any were linked
          fetchDashboardData();
        } else {
          const data = await response.json();
          showToast(data.error || 'Failed to cancel booking.', 'error');
        }
      } catch (err) {
        console.error(err);
        showToast('Error connecting to server.', 'error');
      }
    }
  };

  if (authLoading || !user) {
    return (
      <div className="dashboard-loading" style={{ backgroundColor: '#051923', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00a6fb', fontSize: '24px', fontFamily: 'Poppins, sans-serif' }}>
        Loading Profile...
      </div>
    );
  }

  return (
    <div className="dashboard-page-wrapper" style={{
      backgroundColor: '#051923',
      fontFamily: 'Poppins, sans-serif',
      paddingTop: '120px',
      paddingBottom: '60px',
      paddingLeft: '20px',
      paddingRight: '20px',
      minHeight: '100vh',
      boxSizing: 'border-box'
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        .dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 40px;
        }

        @media (max-width: 900px) {
          .dashboard-container {
            grid-template-columns: 1fr;
          }
        }

        .profile-card {
          background: #003554;
          border: 1px solid #00a6fb;
          border-radius: 20px;
          padding: 30px 25px;
          text-align: center;
          height: fit-content;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
        }

        .profile-avatar-circle {
          width: 80px;
          height: 80px;
          background: #051923;
          border: 2px solid #00a6fb;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 15px auto;
          color: #00a6fb;
          font-size: 32px;
          font-weight: bold;
          text-transform: uppercase;
        }

        .profile-name {
          color: #E2F3F4;
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 5px;
        }

        .profile-email {
          color: #ccc;
          font-size: 13px;
          margin-bottom: 25px;
        }

        .dashboard-main-section {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .section-box {
          background: rgba(0, 53, 84, 0.6);
          border: 1px solid rgba(0, 166, 251, 0.3);
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }

        .section-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 1.5px solid rgba(0, 166, 251, 0.3);
          padding-bottom: 10px;
        }

        .section-title {
          color: #00A6FB;
          font-size: 22px;
          font-weight: 600;
          margin: 0;
          font-family: 'Forum', cursive;
          letter-spacing: 1px;
        }

        .grid-bookings {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .booking-card {
          background: #003554;
          border: 1px solid rgba(0, 166, 251, 0.2);
          border-radius: 12px;
          padding: 18px;
          position: relative;
          transition: transform 0.2s;
        }
        .booking-card:hover {
          transform: translateY(-3px);
          border-color: #00a6fb;
        }

        .booking-title {
          color: #E2F3F4;
          font-weight: 600;
          font-size: 16px;
          margin-bottom: 10px;
        }

        .booking-info-row {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #ccc;
          font-size: 13px;
          margin-bottom: 6px;
        }
        .booking-info-row ion-icon {
          color: #00a6fb;
          font-size: 16px;
        }

        .cancel-btn {
          width: 100%;
          background: transparent;
          border: 1.5px solid #ff4d4d;
          color: #ff4d4d;
          border-radius: 8px;
          padding: 8px 0;
          font-size: 12px;
          font-weight: bold;
          cursor: pointer;
          margin-top: 15px;
          transition: all 0.2s;
        }
        .cancel-btn:hover {
          background: #ff4d4d;
          color: white;
        }

        .order-card {
          background: #003554;
          border: 1px solid rgba(0, 166, 251, 0.2);
          border-radius: 15px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px dashed rgba(0, 166, 251, 0.3);
          padding-bottom: 12px;
          margin-bottom: 15px;
        }

        .order-id-date {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .order-id {
          color: #E2F3F4;
          font-weight: 600;
          font-size: 14px;
        }

        .order-date {
          color: #aaa;
          font-size: 12px;
        }

        .order-badge {
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }

        .order-badge.preparing {
          background: rgba(255, 165, 0, 0.2);
          color: orange;
          border: 1px solid orange;
        }

        .order-badge.ready {
          background: rgba(0, 166, 251, 0.2);
          color: #00a6fb;
          border: 1px solid #00a6fb;
        }

        .order-badge.served {
          background: rgba(40, 167, 69, 0.2);
          color: #28a745;
          border: 1px solid #28a745;
        }

        .order-items-list {
          margin-bottom: 15px;
        }

        .order-item-line {
          display: flex;
          justify-content: space-between;
          color: #ccc;
          font-size: 14px;
          margin-bottom: 6px;
        }

        .order-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px dashed rgba(0, 166, 251, 0.3);
          padding-top: 12px;
        }

        .order-details-link {
          font-size: 12px;
          color: #aaa;
        }
        .order-details-link span {
          color: #00a6fb;
          font-weight: 600;
        }

        .order-price {
          color: #00a6fb;
          font-size: 16px;
          font-weight: bold;
        }

        .no-data-msg {
          text-align: center;
          color: #aaa;
          padding: 30px 0;
          font-size: 14px;
        }
      `}} />

      <div className="dashboard-container">
        {/* Left Side: Profile info */}
        <div className="profile-card">
          <div className="profile-avatar-circle">
            {user.name.charAt(0)}
          </div>
          <div className="profile-name">{user.name}</div>
          <div className="profile-email">{user.email}</div>
          
          <button 
            onClick={() => {
              localStorage.removeItem('brewtopia_user');
              window.location.href = '/';
            }} 
            className="cancel-btn" 
            style={{ marginTop: '10px' }}
          >
            Logout Account
          </button>
        </div>

        {/* Right Side: Bookings & Orders */}
        <div className="dashboard-main-section">
          {/* Table Bookings Box */}
          <div className="section-box">
            <div className="section-title-row">
              <h2 className="section-title">Your Table Reservations</h2>
            </div>
            
            {loadingData ? (
              <p style={{ color: '#ccc', fontSize: '14px' }}>Loading bookings...</p>
            ) : bookings.length === 0 ? (
              <div className="no-data-msg">
                <p>You have no active table reservations.</p>
              </div>
            ) : (
              <div className="grid-bookings">
                {bookings.map((booking) => (
                  <div key={booking.id} className="booking-card">
                    <div className="booking-title">Table for {booking.guests} Guests</div>
                    
                    <div className="booking-info-row">
                      <ion-icon name="calendar-clear-outline"></ion-icon>
                      <span>Date: {booking.date}</span>
                    </div>
                    
                    <div className="booking-info-row">
                      <ion-icon name="time-outline"></ion-icon>
                      <span>Time: {booking.time}</span>
                    </div>

                    <div className="booking-info-row">
                      <ion-icon name="person-outline"></ion-icon>
                      <span>Name: {booking.name}</span>
                    </div>

                    <div className="booking-info-row">
                      <ion-icon name="call-outline"></ion-icon>
                      <span>Phone: {booking.phone}</span>
                    </div>

                    <div className="booking-actions-row" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                      <button
                        className="cancel-btn"
                        onClick={() => handleCancelBooking(booking.id)}
                        style={{ flex: 1, margin: 0 }}
                      >
                        Cancel
                      </button>
                      <button
                        className="cancel-btn"
                        onClick={() => handleEditClick(booking)}
                        style={{ flex: 1, margin: 0, borderColor: '#00a6fb', color: '#00a6fb' }}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Food Orders Box */}
          <div className="section-box">
            <div className="section-title-row">
              <h2 className="section-title">Your Food Orders</h2>
            </div>
            
            {loadingData ? (
              <p style={{ color: '#ccc', fontSize: '14px' }}>Loading orders...</p>
            ) : orders.length === 0 ? (
              <div className="no-data-msg">
                <p>You haven't placed any food orders yet.</p>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => {
                  const statusClass = order.status.toLowerCase();
                  const formattedDate = new Date(order.created_at).toLocaleString();
                  
                  return (
                    <div key={order.id} className="order-card">
                      <div className="order-header">
                        <div className="order-id-date">
                          <span className="order-id">Order ID: #{order.id.slice(-6)}</span>
                          <span className="order-date">{formattedDate}</span>
                        </div>
                        <span className={`order-badge ${statusClass}`}>{order.status}</span>
                      </div>

                      <div className="order-items-list">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="order-item-line">
                            <span>{item.title} &times; {item.quantity}</span>
                            <span>{item.price.replace('â‚¹', '₹')}</span>
                          </div>
                        ))}
                      </div>

                      <div className="order-footer">
                        <div className="order-details-link">
                          Method: <span>{order.order_type === 'dine-in' ? 'Dine-In' : 'Takeaway'}</span>
                          {order.order_type === 'dine-in' && order.booking_id && (
                            <> (Linked to Table)</>
                          )}
                        </div>
                        <div className="order-price">Total: Rs. {order.total_price}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Edit Booking Modal */}
      {editingBooking && (
        <div className="custom-confirm-overlay">
          <div className="custom-confirm-card" style={{ maxWidth: '420px', textAlign: 'left' }}>
            <h3 className="confirm-title" style={{ textAlign: 'center', marginBottom: '20px' }}>Edit Reservation</h3>
            <form onSubmit={handleUpdateBooking}>
              <div className="booking-form-group" style={{ marginBottom: '15px' }}>
                <label style={{ color: '#E2F3F4', fontSize: '12px', fontWeight: '600' }}>Name</label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditChange}
                  required
                  style={{ width: '100%', background: '#051923', border: '1.5px solid #00a6fb', color: 'white', borderRadius: '8px', padding: '8px 10px', marginTop: '5px', boxSizing: 'border-box' }}
                />
              </div>
              <div className="booking-form-group" style={{ marginBottom: '15px' }}>
                <label style={{ color: '#E2F3F4', fontSize: '12px', fontWeight: '600' }}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditChange}
                  required
                  style={{ width: '100%', background: '#051923', border: '1.5px solid #00a6fb', color: 'white', borderRadius: '8px', padding: '8px 10px', marginTop: '5px', boxSizing: 'border-box' }}
                />
              </div>
              <div className="booking-form-group" style={{ marginBottom: '15px' }}>
                <label style={{ color: '#E2F3F4', fontSize: '12px', fontWeight: '600' }}>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={editFormData.phone}
                  onChange={handleEditChange}
                  required
                  style={{ width: '100%', background: '#051923', border: '1.5px solid #00a6fb', color: 'white', borderRadius: '8px', padding: '8px 10px', marginTop: '5px', boxSizing: 'border-box' }}
                />
              </div>
              <div className="booking-form-group" style={{ marginBottom: '15px' }}>
                <label style={{ color: '#E2F3F4', fontSize: '12px', fontWeight: '600' }}>Date</label>
                <input
                  type="date"
                  name="date"
                  value={editFormData.date}
                  onChange={handleEditChange}
                  required
                  style={{ width: '100%', background: '#051923', border: '1.5px solid #00a6fb', color: 'white', borderRadius: '8px', padding: '8px 10px', marginTop: '5px', boxSizing: 'border-box' }}
                />
              </div>
              <div className="booking-form-group" style={{ marginBottom: '15px' }}>
                <label style={{ color: '#E2F3F4', fontSize: '12px', fontWeight: '600' }}>Time</label>
                <input
                  type="time"
                  name="time"
                  value={editFormData.time}
                  onChange={handleEditChange}
                  required
                  style={{ width: '100%', background: '#051923', border: '1.5px solid #00a6fb', color: 'white', borderRadius: '8px', padding: '8px 10px', marginTop: '5px', boxSizing: 'border-box' }}
                />
              </div>
              <div className="booking-form-group" style={{ marginBottom: '20px' }}>
                <label style={{ color: '#E2F3F4', fontSize: '12px', fontWeight: '600' }}>Number of Guests</label>
                <input
                  type="number"
                  name="guests"
                  min="1"
                  max="20"
                  value={editFormData.guests}
                  onChange={handleEditChange}
                  required
                  style={{ width: '100%', background: '#051923', border: '1.5px solid #00a6fb', color: 'white', borderRadius: '8px', padding: '8px 10px', marginTop: '5px', boxSizing: 'border-box' }}
                />
              </div>
              <div className="confirm-buttons">
                <button type="button" className="confirm-btn cancel" onClick={() => setEditingBooking(null)}>Cancel</button>
                <button type="submit" className="confirm-btn proceed" style={{ background: '#00a6fb' }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
