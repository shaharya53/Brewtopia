import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

export default function Header() {
  const [isNavbarActive, setIsNavbarActive] = useState(false);
  const [isHeaderActive, setIsHeaderActive] = useState(false);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  
  const lastScrollPos = useRef(0);
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useContext(AuthContext);
  const { totalItemsCount, setIsCartOpen } = useContext(CartContext);

  const toggleNavbar = () => {
    setIsNavbarActive(!isNavbarActive);
    document.body.classList.toggle('nav-active');
  };

  const closeNavbar = () => {
    setIsNavbarActive(false);
    document.body.classList.remove('nav-active');
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Header active state (scrolled > 50px)
      if (currentScrollY >= 50) {
        setIsHeaderActive(true);
        
        // Hide header on scroll down, show on scroll up
        if (lastScrollPos.current < currentScrollY) {
          setIsHeaderHidden(true);
        } else {
          setIsHeaderHidden(false);
        }
      } else {
        setIsHeaderActive(false);
        setIsHeaderHidden(false);
      }
      
      lastScrollPos.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleNavLinkClick = (e, sectionId) => {
    e.preventDefault();
    closeNavbar();

    if (location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  return (
    <>
      {/* Top Corner */}
      <div className="topbar">
        <div className="container">
          <address className="topbar-item link">
            <div className="icon">
              <ion-icon name="location-outline" aria-hidden="true"></ion-icon>
            </div>
            <span className="span">Restaurant St, Delicious City, London 9578, UK</span>
          </address>
          <div className="topbar-item link item-2">
            <div className="icon">
              <ion-icon name="time-outline" aria-hidden="true"></ion-icon>
            </div>
            <span className="span">Daily : 8.00 am to 10.00 pm</span>
          </div>
          <div className="seperator"></div>
          <a href="tel:+916356349549" className="topbar-item link">
            <div className="icon">
              <ion-icon name="call-outline" aria-hidden="true"></ion-icon>
            </div>
            <span className="span">+91 63563 49549</span>
          </a>

        </div>
      </div>

      {/* Navbar Header */}
      <header className={`header ${isHeaderActive ? 'active' : ''} ${isHeaderHidden ? 'hide' : ''}`} data-header>
        <div className="container">
          <Link to="/" className="logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src="/Screenshot_2025-01-23_233310-removebg-preview.png" width="85" height="30" alt="Brewtopia.logo" />
          </Link>
          
          <nav className={`navbar ${isNavbarActive ? 'active' : ''}`} data-navbar>
            <button className="close-btn" aria-label="close menu" onClick={closeNavbar}>
              <ion-icon name="close-outline" aria-hidden="true"></ion-icon>
            </button>

            <Link to="/" className="logo" onClick={() => { closeNavbar(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              <img src="/Screenshot_2025-01-23_233310-removebg-preview.png" width="160" height="50" alt="Brewtopia.logo" />
            </Link>
            
            <ul className="navbar-list">
              <li className="navbar-item">
                <a href="#nav1" className="navbar-link hover-underline" onClick={(e) => handleNavLinkClick(e, 'nav1')}>
                  <div className="seperator"></div>
                  <span className="span">Home</span>
                </a>
              </li>
              <li className="navbar-item">
                <a href="#nav2" className="navbar-link hover-underline" onClick={(e) => handleNavLinkClick(e, 'nav2')}>
                  <div className="seperator"></div>
                  <span className="span">Menu</span>
                </a>
              </li>
              <li className="navbar-item">
                <a href="#nav3" className="navbar-link hover-underline" onClick={(e) => handleNavLinkClick(e, 'nav3')}>
                  <div className="seperator"></div>
                  <span className="span">Offers</span>
                </a>
              </li>
              <li className="navbar-item">
                <a href="#nav4" className="navbar-link hover-underline" onClick={(e) => handleNavLinkClick(e, 'nav4')}>
                  <div className="seperator"></div>
                  <span className="span">Explore</span>
                </a>
              </li>
              <li className="navbar-item">
                <a href="#nav5" className="navbar-link hover-underline" onClick={(e) => handleNavLinkClick(e, 'nav5')}>
                  <div className="seperator"></div>
                  <span className="span">About</span>
                </a>
              </li>
              {user && (
                <li className="navbar-item mobile-only">
                  <Link to="/dashboard" className="navbar-link hover-underline" onClick={closeNavbar}>
                    <div className="seperator"></div>
                    <span className="span">Dashboard</span>
                  </Link>
                </li>
              )}
              {user && (user.is_admin || user.email === 'admin@brewtopia.com') && (
                <li className="navbar-item mobile-only">
                  <Link to="/admin" className="navbar-link hover-underline" onClick={closeNavbar}>
                    <div className="seperator"></div>
                    <span className="span">Admin Panel</span>
                  </Link>
                </li>
              )}
              {user ? (
                <li className="navbar-item mobile-only">
                  <a href="#" onClick={(e) => { e.preventDefault(); logout(); closeNavbar(); }} className="navbar-link hover-underline">
                    <div className="seperator"></div>
                    <span className="span">Logout</span>
                  </a>
                </li>
              ) : (
                <li className="navbar-item mobile-only">
                  <Link to="/login" className="navbar-link hover-underline" onClick={closeNavbar}>
                    <div className="seperator"></div>
                    <span className="span">Login / Sign Up</span>
                  </Link>
                </li>
              )}
            </ul>
            
            <div className="text-center">
              <p className="headline-1 navbar-title">Visit Us</p>
              <address className="body-4">
                Restaurant St, Delicious City, <br />
                London 9578, UK
              </address>
              <p className="body-4 navabr-text">Open: 9.30 am - 2.30pm</p>


              <p className="contact-label">Booking Request</p>
              <a href="tel:+916356349549" className="body-1 contact-number hover-underline">+91 63563 49549</a>
            </div>
          </nav>

          {/* Shopping Cart Button */}
          <button className="header-cart-btn" onClick={() => setIsCartOpen(true)} style={{ position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '20px' }}>
            <ion-icon name="cart-outline" style={{ fontSize: '28px', color: '#00a6fb' }}></ion-icon>
            {totalItemsCount > 0 && (
              <span className="cart-badge" style={{ position: 'absolute', top: '-5px', right: '-8px', background: '#ff4d4d', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                {totalItemsCount}
              </span>
            )}
          </button>

          {user ? (
            <div className="user-nav-group desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {(user.is_admin || user.email === 'admin@brewtopia.com') && (
                <Link to="/admin" className="login" style={{ borderColor: '#ff4d4d', color: '#ff4d4d' }}>
                  Admin
                </Link>
              )}
              <Link to="/dashboard" className="login">
                Dashboard
              </Link>
              <button onClick={logout} className="login" style={{ background: 'transparent', cursor: 'pointer', border: '1px solid #00a6fb' }}>
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="login desktop-only">
              Login
            </Link>
          )}
          
          <button className="nav-open-btn" aria-label="open menu" onClick={toggleNavbar}>
            <span className="line line-1"></span>
            <span className="line line-2"></span>
            <span className="line line-3"></span>
          </button>
          
          <div className={`overlay ${isNavbarActive ? 'active' : ''}`} onClick={closeNavbar}></div>
        </div>
      </header>
    </>
  );
}
