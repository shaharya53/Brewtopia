import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { usePopup } from '../context/PopupContext';

export default function MenuPage({ title, items }) {
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { showToast } = usePopup();
  const navigate = useNavigate();

  const handleOrder = (item) => {
    if (!user) {
      showToast("Please Sign In first to order items!", "error");
      navigate('/login');
      return;
    }
    addToCart(item);
  };

  return (
    <div style={{ backgroundColor: '#051923', minHeight: '100vh', paddingTop: '120px', paddingBottom: '60px', boxSizing: 'border-box' }}>
      <h1 className="heading" style={{ marginBottom: '40px' }}>{title}</h1>
      <div className="menu-cards-container">
        {items.map((item, index) => (
          <div key={index} className="card">
            <img className="card__img" src={item.img} alt={item.title} />
            <div className="card__title">{item.title}</div>
            <div className="card__subtitle">{item.subtitle}</div>
            <div className="description">{item.description}</div>
            <div className="card__wrapper">
              <div className="card__price">{item.price.replace('â‚¹', '₹')}</div>
              <div className="menu-card-order-btn" onClick={() => handleOrder(item)} style={{ cursor: 'pointer' }}>
                <div className="button-wrapper">
                  <div className="menu-card-order-btn-text">Order</div>
                  <span className="icon">
                    <svg viewBox="0 0 16 16" className="bi bi-cart2" fill="currentColor" height="16" width="16" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0 2.5A.5.5 0 0 1 .5 2H2a.5.5 0 0 1 .485.379L2.89 4H14.5a.5.5 0 0 1 .485.621l-1.5 6A.5.5 0 0 1 13 11H4a.5.5 0 0 1-.485-.379L1.61 3H.5a.5.5 0 0 1-.5-.5zM3.14 5l1.25 5h8.22l1.25-5H3.14zM5 13a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0zm9-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0z"></path>
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
