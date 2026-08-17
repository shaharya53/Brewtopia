import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { usePopup } from '../context/PopupContext';

export default function BookMyTable() {
  const { user } = useContext(AuthContext);
  const { showToast, showConfirm } = usePopup();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: ''
  });

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
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
      setLoading(false);
    }
  };

  // Load bookings from MongoDB on mount (or local storage if guest)
  useEffect(() => {
    if (user) {
      setLoading(true);
      fetch(`/api/user-data?user_id=${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.bookings) {
            setBookings(data.bookings);
          }
        })
        .catch((err) => console.error('Error fetching bookings:', err))
        .finally(() => setLoading(false));
    } else {
      const savedBookings = JSON.parse(localStorage.getItem('brewtopia_bookings') || '[]');
      setBookings(savedBookings);
    }
  }, [user]);

  // Pre-fill name and email if user is logged in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { name, email, phone, date, time, guests } = formData;
    if (!name || !email || !phone || !date || !time || !guests) {
      alert('All fields are required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/book-table', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          date,
          time,
          guests: parseInt(guests),
          user_id: user ? user.id : null
        })
      });

      const data = await response.json();
      if (response.ok) {
        showToast('Table booked successfully!', 'success');
        
        if (user) {
          // Refresh bookings from server
          setBookings((prev) => [data.booking, ...prev]);
        } else {
          // Save locally for guests
          const newBooking = {
            id: data.booking.id,
            name,
            email,
            phone,
            date,
            time,
            guests: parseInt(guests)
          };
          const updatedBookings = [newBooking, ...bookings];
          setBookings(updatedBookings);
          localStorage.setItem('brewtopia_bookings', JSON.stringify(updatedBookings));
        }

        // Reset form (keep name/email if user is logged in)
        setFormData({
          name: user ? user.name : '',
          email: user ? user.email : '',
          phone: '',
          date: '',
          time: '',
          guests: ''
        });
      } else {
        showToast(data.error || 'Failed to book table. Please try again.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error connecting to backend server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id) => {
    const confirmed = await showConfirm('Are you sure you want to cancel this booking?');
    if (confirmed) {
      if (user) {
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
      } else {
        const updatedBookings = bookings.filter((b) => b.id !== id);
        setBookings(updatedBookings);
        localStorage.setItem('brewtopia_bookings', JSON.stringify(updatedBookings));
        showToast('Booking cancelled successfully!', 'success');
      }
    }
  };

  return (
    <div className="booking-page-container" style={{
      backgroundColor: '#051923',
      fontFamily: 'Poppins, sans-serif',
      paddingTop: '120px',
      paddingBottom: '40px',
      paddingLeft: '20px',
      paddingRight: '20px',
      minHeight: '100vh',
      boxSizing: 'border-box'
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        .booking-flex-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 50px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .booking-card-wrapper {
          background: #003554;
          padding: 25px;
          border-radius: 15px;
          box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.3);
          width: 100%;
          max-width: 400px;
          text-align: center;
          box-sizing: border-box;
          border: 1px solid #00a6fb;
        }

        .booking-card-wrapper h2 {
          color: #00A6FB;
          font-size: 30px;
          margin-top: 0;
          margin-bottom: 20px;
          font-weight: bolder;
        }

        .booking-form-group {
          margin-bottom: 15px;
          text-align: left;
        }

        .booking-card-wrapper label {
          display: block;
          font-weight: 600;
          margin-bottom: 5px;
          color: #00A6FB;
          font-size: 14px;
        }

        .booking-card-wrapper input {
          width: 100%;
          padding: 10px;
          border: 1px solid #00A6FB;
          border-radius: 8px;
          font-size: 14px;
          background: #003554;
          color: white;
          transition: 0.3s;
          box-sizing: border-box;
        }

        .booking-card-wrapper input:focus {
          border-color: #00A6FB;
          outline: none;
          box-shadow: 0 0 10px #00A6FB;
        }

        .booking-btn {
          width: 100%;
          padding: 12px;
          border: none;
          background: linear-gradient(to right, #5ad5f4, #0c66b5);
          color: #fff;
          font-size: 18px;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease-in-out;
          margin-top: 10px;
        }

        .booking-btn:hover {
          transform: scale(1.03);
          box-shadow: 0px 5px 15px rgba(0, 166, 251, 0.4);
        }

        .booking-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Dashboard styles */
        .dashboard-wrapper {
          width: 100%;
          max-width: 900px;
          text-align: center;
        }

        .dashboard-wrapper h3 {
          color: #00A6FB;
          font-size: 28px;
          margin-bottom: 25px;
          font-weight: bold;
          border-bottom: 2px solid #003554;
          padding-bottom: 10px;
        }

        .no-bookings {
          color: #888;
          font-style: italic;
          font-size: 16px;
          background: #00355430;
          padding: 30px;
          border-radius: 10px;
          border: 1px dashed #003554;
        }

        .bookings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          width: 100%;
        }

        .booking-list-item {
          background: #002236;
          border: 1px solid #003554;
          border-radius: 12px;
          padding: 20px;
          text-align: left;
          color: #fff;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
          transition: 0.3s;
        }

        .booking-list-item:hover {
          border-color: #00a6fb;
          transform: translateY(-3px);
          box-shadow: 0px 6px 15px rgba(0, 166, 251, 0.2);
        }

        .booking-list-item h4 {
          margin: 0 0 10px 0;
          color: #00a6fb;
          font-size: 20px;
          border-bottom: 1px solid #003554;
          padding-bottom: 5px;
        }

        .booking-detail {
          font-size: 14px;
          margin: 6px 0;
          color: #ccc;
        }

        .booking-detail strong {
          color: #00a6fb;
        }

        .cancel-btn {
          width: 100%;
          background: transparent;
          border: 1px solid #ff4d4d;
          color: #ff4d4d;
          padding: 8px 12px;
          border-radius: 6px;
          font-weight: bold;
          font-size: 14px;
          cursor: pointer;
          margin-top: 15px;
          transition: 0.3s;
        }

        .cancel-btn:hover {
          background: #ff4d4d;
          color: white;
          box-shadow: 0px 4px 10px rgba(255, 77, 77, 0.3);
        }

        @media (min-width: 768px) {
          .booking-flex-container {
            flex-direction: row;
            align-items: flex-start;
            justify-content: center;
          }
        }
      `}} />

      <div className="booking-flex-container">
        {/* Form Container */}
        <div className="booking-card-wrapper">
          <h2>Book Your Table</h2>
          <form onSubmit={handleSubmit}>
            <div className="booking-form-group">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="booking-form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="booking-form-group">
              <label htmlFor="phone">Phone:</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="booking-form-group">
              <label htmlFor="date">Date:</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="booking-form-group">
              <label htmlFor="time">Time:</label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
              />
            </div>

            <div className="booking-form-group">
              <label htmlFor="guests">Number of Guests:</label>
              <input
                type="number"
                id="guests"
                name="guests"
                min="1"
                max="20"
                value={formData.guests}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="booking-btn" disabled={loading}>
              {loading ? 'Booking...' : 'Book Now'}
            </button>
          </form>
        </div>

        {/* Dashboard Container */}
        <div className="dashboard-wrapper">
          <h3>Your Bookings</h3>
          {bookings.length === 0 ? (
            <div className="no-bookings">
              No active bookings yet. Book a table on the left to get started!
            </div>
          ) : (
            <div className="bookings-grid">
              {bookings.map((booking) => (
                <div key={booking.id} className="booking-list-item">
                  <h4>{booking.name}</h4>
                  <div className="booking-detail">
                    <strong>Date:</strong> {booking.date}
                  </div>
                  <div className="booking-detail">
                    <strong>Time:</strong> {booking.time}
                  </div>
                  <div className="booking-detail">
                    <strong>Guests:</strong> {booking.guests} {booking.guests === 1 ? 'Person' : 'People'}
                  </div>
                  <div className="booking-detail">
                    <strong>Phone:</strong> {booking.phone}
                  </div>
                  <div className="booking-detail">
                    <strong>Email:</strong> {booking.email}
                  </div>
                  <div className="booking-actions-row" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <button
                      className="confirm-btn cancel"
                      onClick={() => handleCancelBooking(booking.id)}
                      style={{ flex: 1, padding: '8px 0', border: '1.5px solid #ff4d4d', color: '#ff4d4d', background: 'transparent', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                    >
                      Cancel
                    </button>
                    <button
                      className="confirm-btn proceed"
                      onClick={() => handleEditClick(booking)}
                      style={{ flex: 1, padding: '8px 0', border: 'none', background: '#00a6fb', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
