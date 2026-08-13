import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { usePopup } from '../context/PopupContext';

export default function Login() {
  const { login, register } = useContext(AuthContext);
  const { showToast } = usePopup();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false); // Toggle between Login and Register
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        await register(formData.name, formData.email, formData.password);
        showToast('Account created successfully!', 'success');
      } else {
        await login(formData.email, formData.password);
        showToast('Welcome back to Brewtopia!', 'success');
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      paddingTop: '120px',
      paddingBottom: '40px',
      backgroundColor: '#051923',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      boxSizing: 'border-box'
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        .login-container {
          max-width: 380px;
          background: #003554;
          border-radius: 40px;
          padding: 30px 35px;
          border: 1px solid #00a6fb;
          width: 100%;
          margin: 40px auto;
          box-sizing: border-box;
          box-shadow: 0 10px 25px rgba(0, 166, 251, 0.2);
        }
        
        .login-heading {
          text-align: center;
          font-weight: 900;
          font-size: 30px;
          color: #00A6FB;
          margin-bottom: 5px;
        }

        .login-subheading {
          text-align: center;
          color: #E2F3F4;
          font-size: 14px;
          margin-bottom: 25px;
        }
        
        .login-form {
          margin-top: 10px;
        }
        
        .login-form .input {
          width: 100%;
          background: #003554;
          border: 1px solid #00a6fb;
          color: white;
          padding: 15px 20px;
          border-radius: 20px;
          margin-top: 15px;
          box-sizing: border-box;
          outline: none;
          font-size: 14px;
        }
        
        .login-form .input:focus {
          border-color: #E2F3F4;
        }
        
        .login-form .login-error {
          color: #ff4d4d;
          font-size: 13px;
          margin-top: 10px;
          text-align: center;
          font-weight: 600;
        }
        
        .login-form .login-btn-wrapper {
          display: flex;
          justify-content: center;
          margin-top: 25px;
        }
        
        .login-form .login-btn {
          width: 60%;
          background: #00a6fb;
          color: white;
          padding: 15px 0;
          border-radius: 20px;
          font-weight: bold;
          border: none;
          cursor: pointer;
          transition: background 0.3s;
          font-size: 16px;
        }
        
        .login-form .login-btn:hover {
          background: #008cd1;
        }

        .login-form .login-btn:disabled {
          background: #00223b;
          color: #666;
          cursor: not-allowed;
        }
        
        .social-login-section {
          margin-top: 25px;
          text-align: center;
        }
        
        .social-login-text {
          color: white;
          font-size: 14px;
          font-weight: 500;
        }
        
        .social-buttons-row {
          display: flex;
          justify-content: center;
          gap: 15px;
          margin-top: 15px;
        }
        
        .social-circle-btn {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          background: #003554;
          border: 1px solid #00a6fb;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: 0.3s;
        }
        
        .social-circle-btn:hover {
          background: #00a6fb;
        }
        
        .social-circle-btn svg {
          fill: white;
          width: 18px;
          height: 18px;
        }
        
        .toggle-form-link {
          text-align: center;
          margin-top: 20px;
          color: #00A6FB;
          font-size: 13px;
          cursor: pointer;
          font-weight: 500;
        }
        .toggle-form-link:hover {
          text-decoration: underline;
        }
      `}} />

      <div className="login-container">
        <div className="login-heading">Brewtopia</div>
        <div className="login-subheading">{isRegister ? 'Create your Cafe Account' : 'Sign In to your Cafe Account'}</div>
        
        <form className="login-form" onSubmit={handleSubmit}>
          {isRegister && (
            <input 
              placeholder="Name" 
              className="input" 
              type="text" 
              name="name" 
              value={formData.name}
              onChange={handleChange}
              required 
            />
          )}
          
          <input 
            placeholder="E-mail" 
            className="input" 
            type="email" 
            name="email" 
            value={formData.email}
            onChange={handleChange}
            required 
          />
          
          <input 
            placeholder="Password" 
            className="input" 
            type="password" 
            name="password" 
            value={formData.password}
            onChange={handleChange}
            required 
          />

          {isRegister && (
            <input 
              placeholder="Confirm Password" 
              className="input" 
              type="password" 
              name="confirmPassword" 
              value={formData.confirmPassword}
              onChange={handleChange}
              required 
            />
          )}

          {error && <div className="login-error">{error}</div>}

          <div className="login-btn-wrapper">
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? 'Processing...' : isRegister ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="social-login-section">
          <div className="social-login-text">Or sign {isRegister ? 'up' : 'in'} with</div>
          <div className="social-buttons-row">
            <div className="social-circle-btn">
              <svg viewBox="0 0 488 512" xmlns="http://www.w3.org/2000/svg">
                <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
              </svg>
            </div>
            <div className="social-circle-btn">
              <svg viewBox="0 0 384 512" xmlns="http://www.w3.org/2000/svg">
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-48.4-19.1-77.5-19.1-39.9 0-82.7 22.4-106 63.5-35.1 61.7-9 152.7 24.8 208.5 17 25 36.8 55.3 61.2 57 24.4 1.7 32.9-13.2 62.4-13.2 29.5 0 38 13.2 62.4 13.2 24.8 0 42.6-27.6 59.8-52.5 19.6-28.5 27.6-56.1 27.8-57.3-.8-.4-53.4-20.6-53.9-81.5zM289.8 83.4c13.9-17.4 23.3-41.2 20.7-65.1-20.4 1-45.5 13.7-60.2 31.7-12.8 15.6-24.4 39.6-21.4 63.1 22.8 1.7 46.5-12.5 60.9-29.7z"></path>
              </svg>
            </div>
            <div className="social-circle-btn">
              <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="toggle-form-link" onClick={() => { setIsRegister(!isRegister); setError(''); }}>
          {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </div>
      </div>
    </div>
  );
}
