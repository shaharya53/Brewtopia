import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { usePopup } from '../context/PopupContext';

export default function AdminPanel() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const { showToast, showConfirm } = usePopup();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState('bookings'); // bookings or orders

  // Reservation edit states
  const [editingBooking, setEditingBooking] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: ''
  });

  // Redirect if not logged in or not admin
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
      } else if (!user.is_admin && user.email !== 'admin@brewtopia.com') {
        showToast('Access Denied: Admins Only!', 'error');
        navigate('/');
      }
    }
  }, [user, authLoading, navigate]);

  const fetchAdminData = async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      const response = await fetch('/api/admin/data');
      const data = await response.json();
      if (response.ok) {
        setBookings(data.bookings || []);
        setOrders(data.orders || []);
      } else {
        showToast(data.error || 'Failed to fetch admin data.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error connecting to backend server.', 'error');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [user]);

  // Handle Cancel Booking
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

  // Handle Edit Click
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

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Save Booking changes
  const handleUpdateBooking = async (e) => {
    e.preventDefault();
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
    }
  };

  // Handle Update Order Status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch('/api/admin/update-order-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, status: newStatus })
      });
      const data = await response.json();
      if (response.ok) {
        showToast(`Order status set to: ${newStatus}`, 'success');
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      } else {
        showToast(data.error || 'Failed to update order status.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error connecting to server.', 'error');
    }
  };

  // Handle Cancel/Delete Order
  const handleCancelOrder = async (orderId) => {
    const confirmed = await showConfirm('Are you sure you want to cancel and remove this food order?');
    if (confirmed) {
      try {
        const response = await fetch('/api/admin/cancel-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_id: orderId })
        });
        if (response.ok) {
          setOrders((prev) => prev.filter((o) => o.id !== orderId));
          showToast('Order cancelled and removed successfully!', 'success');
        } else {
          const data = await response.json();
          showToast(data.error || 'Failed to cancel order.', 'error');
        }
      } catch (err) {
        console.error(err);
        showToast('Error connecting to server.', 'error');
      }
    }
  };

  if (authLoading || !user) {
    return (
      <div className="admin-loading" style={{ backgroundColor: '#051923', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00a6fb', fontSize: '24px', fontFamily: 'Poppins, sans-serif' }}>
        Verifying Credentials...
      </div>
    );
  }

  // Calculate statistics
  const totalRevenue = orders.reduce((sum, o) => sum + o.total_price, 0);

  return (
    <div className="admin-page-wrapper" style={{
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
        .admin-dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .admin-title-banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #00a6fb;
          padding-bottom: 15px;
          flex-wrap: wrap;
          gap: 15px;
        }

        .admin-main-title {
          font-family: 'Forum', cursive;
          color: #E2F3F4;
          font-size: 32px;
          margin: 0;
          letter-spacing: 1.5px;
        }

        .admin-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 40px;
        }

        @media (max-width: 768px) {
          .admin-stats-grid {
            grid-template-columns: 1fr;
          }
        }

        .admin-stat-card {
          background: #003554;
          border: 1px solid rgba(0, 166, 251, 0.3);
          border-radius: 15px;
          padding: 20px;
          text-align: center;
          box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }

        .admin-stat-val {
          font-size: 28px;
          color: #00a6fb;
          font-weight: bold;
          margin-bottom: 5px;
        }

        .admin-stat-label {
          color: #ccc;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .admin-tabs-row {
          display: flex;
          gap: 15px;
          margin-bottom: 25px;
          border-bottom: 1px solid rgba(0, 166, 251, 0.2);
          padding-bottom: 12px;
        }

        .admin-tab-btn {
          background: transparent;
          border: none;
          color: #ccc;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          padding: 5px 15px;
          transition: all 0.2s;
          position: relative;
        }
        .admin-tab-btn.active {
          color: #00a6fb;
        }
        .admin-tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -13px;
          left: 0;
          width: 100%;
          height: 3px;
          background: #00a6fb;
        }

        .admin-list-container {
          background: rgba(0, 53, 84, 0.4);
          border: 1px solid rgba(0, 166, 251, 0.2);
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        }

        .admin-list-title {
          color: #E2F3F4;
          font-size: 20px;
          margin-top: 0;
          margin-bottom: 20px;
          font-family: 'Forum', cursive;
          letter-spacing: 0.5px;
        }

        .admin-grid-bookings {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .admin-booking-card {
          background: #003554;
          border: 1px solid rgba(0, 166, 251, 0.2);
          border-radius: 12px;
          padding: 18px;
          transition: transform 0.2s;
        }
        .admin-booking-card:hover {
          transform: translateY(-2px);
          border-color: #00a6fb;
        }

        .admin-booking-name {
          color: #E2F3F4;
          font-weight: 600;
          font-size: 16px;
          margin-bottom: 8px;
        }

        .admin-info-row {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #ccc;
          font-size: 13px;
          margin-bottom: 6px;
        }
        .admin-info-row ion-icon {
          color: #00a6fb;
        }

        .admin-actions-row {
          display: flex;
          gap: 10px;
          margin-top: 15px;
        }

        .admin-action-btn {
          flex: 1;
          background: transparent;
          border: 1.5px solid #00a6fb;
          color: #00a6fb;
          border-radius: 8px;
          padding: 8px 0;
          font-size: 12px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s;
        }
        .admin-action-btn.cancel {
          border-color: #ff4d4d;
          color: #ff4d4d;
        }
        .admin-action-btn.cancel:hover {
          background: #ff4d4d;
          color: white;
        }
        .admin-action-btn.edit {
          background: #00a6fb;
          color: white;
        }
        .admin-action-btn.edit:hover {
          background: #008cd1;
        }

        /* Order card details styling */
        .admin-order-card {
          background: #003554;
          border: 1px solid rgba(0, 166, 251, 0.2);
          border-radius: 15px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .admin-order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px dashed rgba(0, 166, 251, 0.3);
          padding-bottom: 12px;
          margin-bottom: 15px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .admin-order-details {
          color: #ccc;
          font-size: 13px;
          margin-bottom: 15px;
        }

        .admin-order-items {
          margin-bottom: 15px;
          border-bottom: 1px dashed rgba(0, 166, 251, 0.2);
          padding-bottom: 10px;
        }

        .admin-order-item-line {
          display: flex;
          justify-content: space-between;
          color: #E2F3F4;
          font-size: 14px;
          margin-bottom: 6px;
        }

        .admin-order-status-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
        }

        .admin-status-dropdown {
          background: #051923;
          border: 1.5px solid #00a6fb;
          color: #E2F3F4;
          border-radius: 8px;
          padding: 6px 12px;
          font-size: 13px;
          cursor: pointer;
          outline: none;
        }

        .order-badge {
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: bold;
          text-transform: uppercase;
          border: 1px solid transparent;
        }
        .order-badge.preparing {
          background: rgba(255, 165, 0, 0.2);
          color: orange;
          border-color: orange;
        }
        .order-badge.ready {
          background: rgba(0, 166, 251, 0.2);
          color: #00a6fb;
          border-color: #00a6fb;
        }
        .order-badge.served {
          background: rgba(40, 167, 69, 0.2);
          color: #28a745;
          border-color: #28a745;
        }
      `}} />

      <div className="admin-dashboard-container">
        {/* Title banner */}
        <div className="admin-title-banner">
          <h1 className="admin-main-title">Brewtopia Control Center</h1>
          <button onClick={fetchAdminData} className="admin-action-btn" style={{ padding: '8px 20px', flex: 'none', width: 'auto' }}>
            Refresh Dashboard
          </button>
        </div>

        {/* Admin stats */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-val">{bookings.length}</div>
            <div className="admin-stat-label">Total Reservations</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-val">{orders.length}</div>
            <div className="admin-stat-label">Total Food Orders</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-val">₹{totalRevenue}</div>
            <div className="admin-stat-label">Est. Order Revenue</div>
          </div>
        </div>

        {/* Tab selection row */}
        <div className="admin-tabs-row">
          <button 
            className={`admin-tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            Reservations ({bookings.length})
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Food Orders ({orders.length})
          </button>
        </div>

        {/* Data list based on active tab */}
        <div className="admin-list-container">
          {activeTab === 'bookings' ? (
            <div className="admin-bookings-tab-content">
              <h2 className="admin-list-title">All Registered Table Bookings</h2>
              
              {loadingData ? (
                <p style={{ color: '#ccc' }}>Loading bookings...</p>
              ) : bookings.length === 0 ? (
                <p style={{ color: '#aaa', textAlign: 'center' }}>No table bookings found in the database.</p>
              ) : (
                <div className="admin-grid-bookings">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="admin-booking-card">
                      <div className="admin-booking-name">{booking.name}</div>
                      
                      <div className="admin-info-row">
                        <ion-icon name="people-outline"></ion-icon>
                        <span>Guests: {booking.guests} {booking.guests === 1 ? 'Person' : 'People'}</span>
                      </div>
                      
                      <div className="admin-info-row">
                        <ion-icon name="calendar-clear-outline"></ion-icon>
                        <span>Date: {booking.date}</span>
                      </div>
                      
                      <div className="admin-info-row">
                        <ion-icon name="time-outline"></ion-icon>
                        <span>Time: {booking.time}</span>
                      </div>

                      <div className="admin-info-row">
                        <ion-icon name="call-outline"></ion-icon>
                        <span>Phone: {booking.phone}</span>
                      </div>

                      <div className="admin-info-row">
                        <ion-icon name="mail-outline"></ion-icon>
                        <span>Email: {booking.email}</span>
                      </div>

                      <div className="admin-actions-row">
                        <button className="admin-action-btn edit" onClick={() => handleEditClick(booking)}>
                          Edit
                        </button>
                        <button className="admin-action-btn cancel" onClick={() => handleCancelBooking(booking.id)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="admin-orders-tab-content">
              <h2 className="admin-list-title">Customer Food Orders Status</h2>

              {loadingData ? (
                <p style={{ color: '#ccc' }}>Loading orders...</p>
              ) : orders.length === 0 ? (
                <p style={{ color: '#aaa', textAlign: 'center' }}>No food orders placed yet.</p>
              ) : (
                <div className="admin-orders-list">
                  {orders.map((order) => {
                    const statusClass = order.status.toLowerCase();
                    const formattedDate = new Date(order.created_at).toLocaleString();
                    
                    return (
                      <div key={order.id} className="admin-order-card">
                        <div className="admin-order-header">
                          <div>
                            <strong style={{ color: '#E2F3F4', fontSize: '15px' }}>Order ID: #{order.id.slice(-6)}</strong>
                            <div style={{ color: '#aaa', fontSize: '11px', marginTop: '3px' }}>Date: {formattedDate}</div>
                          </div>
                          <span className={`order-badge ${statusClass}`}>{order.status}</span>
                        </div>

                        <div className="admin-order-details">
                          Type: <span style={{ color: '#00a6fb', fontWeight: 'bold' }}>{order.order_type === 'dine-in' ? 'Dine-In' : 'Takeaway'}</span>
                          {order.order_type === 'dine-in' && order.booking_id && (
                            <span style={{ color: '#28a745' }}> (Linked to Table Reservation)</span>
                          )}
                        </div>

                        <div className="admin-order-items">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="admin-order-item-line">
                              <span>{item.title} &times; {item.quantity}</span>
                              <span>{item.price}</span>
                            </div>
                          ))}
                        </div>

                        <div className="admin-order-status-row">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ color: '#ccc', fontSize: '13px' }}>Set Status:</span>
                            <select 
                              className="admin-status-dropdown"
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            >
                              <option value="Preparing">Preparing</option>
                              <option value="Ready">Ready</option>
                              <option value="Served">Served</option>
                            </select>
                          </div>

                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                              className="admin-action-btn cancel" 
                              onClick={() => handleCancelOrder(order.id)}
                              style={{ flex: 'none', padding: '6px 15px' }}
                            >
                              Cancel Order
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Booking Modal (Matches bookings updates in Admin view) */}
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
