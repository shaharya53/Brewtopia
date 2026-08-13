import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import BookMyTable from './pages/BookMyTable';
import Coffee from './pages/Coffee';
import FastFood from './pages/FastFood';
import Bakery from './pages/Bakery';
import Cakes from './pages/Cakes';
import Mocktails from './pages/Mocktails';
import Tea from './pages/Tea';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import CartDrawer from './components/CartDrawer';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { PopupProvider } from './context/PopupContext';

// Helper component to handle smooth hash scrolling when changing pages/routes
function ScrollToHashElement() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        // Small timeout to guarantee DOM is loaded
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 150);
        return () => clearTimeout(timer);
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pathname, hash]);

  return null;
}

function App() {
  useEffect(() => {
    document.body.classList.add('loaded');
    return () => {
      document.body.classList.remove('loaded');
    };
  }, []);

  return (
    <PopupProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <ScrollToHashElement />
            <Header />
            <CartDrawer />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/book-table" element={<BookMyTable />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/menu/coffee" element={<Coffee />} />
              <Route path="/menu/fastfood" element={<FastFood />} />
              <Route path="/menu/bakery" element={<Bakery />} />
              <Route path="/menu/cakes" element={<Cakes />} />
              <Route path="/menu/mocktails" element={<Mocktails />} />
              <Route path="/menu/tea" element={<Tea />} />

              {/* Legacy HTML Redirects */}
              <Route path="/Cafe.html" element={<Navigate to="/" replace />} />
              <Route path="/login.html" element={<Navigate to="/login" replace />} />
              <Route path="/bookmytable.html" element={<Navigate to="/book-table" replace />} />
              <Route path="/coffee.html" element={<Navigate to="/menu/coffee" replace />} />
              <Route path="/fastfood.html" element={<Navigate to="/menu/fastfood" replace />} />
              <Route path="/bakery.html" element={<Navigate to="/menu/bakery" replace />} />
              <Route path="/cakes.html" element={<Navigate to="/menu/cakes" replace />} />
              <Route path="/Mocktails.html" element={<Navigate to="/menu/mocktails" replace />} />
              <Route path="/Tea.html" element={<Navigate to="/menu/tea" replace />} />
            </Routes>
            <Footer />
          </Router>
        </CartProvider>
      </AuthProvider>
    </PopupProvider>
  );
}

export default App;
