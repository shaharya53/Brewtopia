import React, { createContext, useState, useContext } from 'react';

const PopupContext = createContext();

export function PopupProvider({ children }) {
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });
  const [confirm, setConfirm] = useState({ message: '', visible: false, onConfirm: null, onCancel: null });

  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  const showConfirm = (message) => {
    return new Promise((resolve) => {
      setConfirm({
        message,
        visible: true,
        onConfirm: () => {
          setConfirm((prev) => ({ ...prev, visible: false }));
          resolve(true);
        },
        onCancel: () => {
          setConfirm((prev) => ({ ...prev, visible: false }));
          resolve(false);
        }
      });
    });
  };

  return (
    <PopupContext.Provider value={{ showToast, showConfirm }}>
      {children}
      
      {/* Toast Notification Container */}
      {toast.visible && (
        <div className={`custom-toast ${toast.type}`}>
          <div className="toast-icon">
            {toast.type === 'success' ? (
              <ion-icon name="checkmark-circle-outline"></ion-icon>
            ) : (
              <ion-icon name="alert-circle-outline"></ion-icon>
            )}
          </div>
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close" onClick={() => setToast((prev) => ({ ...prev, visible: false }))}>&times;</button>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirm.visible && (
        <div className="custom-confirm-overlay">
          <div className="custom-confirm-card">
            <h3 className="confirm-title">Are you sure?</h3>
            <p className="confirm-message">{confirm.message}</p>
            <div className="confirm-buttons">
              <button className="confirm-btn cancel" onClick={confirm.onCancel}>Cancel</button>
              <button className="confirm-btn proceed" onClick={confirm.onConfirm}>Yes, Proceed</button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .custom-toast {
          position: fixed;
          top: 30px;
          right: 30px;
          z-index: 2000;
          display: flex;
          align-items: center;
          gap: 12px;
          background: #003554;
          border-radius: 12px;
          padding: 15px 20px;
          min-width: 280px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
          animation: slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          font-family: 'Poppins', sans-serif;
        }

        .custom-toast.success {
          border: 1.5px solid #28a745;
        }
        .custom-toast.success .toast-icon {
          color: #28a745;
        }

        .custom-toast.error {
          border: 1.5px solid #ff4d4d;
        }
        .custom-toast.error .toast-icon {
          color: #ff4d4d;
        }

        .toast-icon {
          font-size: 22px;
          display: flex;
        }

        .toast-message {
          color: #E2F3F4;
          font-size: 14px;
          font-weight: 500;
          flex: 1;
        }

        .toast-close {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          font-size: 20px;
          cursor: pointer;
        }
        .toast-close:hover {
          color: white;
        }

        /* Confirmation Modal Styles */
        .custom-confirm-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.2s ease;
        }

        .custom-confirm-card {
          background: #003554;
          border: 1px solid #00a6fb;
          border-radius: 20px;
          padding: 30px;
          width: 90%;
          max-width: 400px;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.5);
          text-align: center;
          font-family: 'Poppins', sans-serif;
          animation: scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .confirm-title {
          color: #00a6fb;
          font-size: 20px;
          margin-top: 0;
          margin-bottom: 12px;
          font-weight: bold;
        }

        .confirm-message {
          color: #E2F3F4;
          font-size: 14px;
          margin-bottom: 25px;
          line-height: 1.5;
        }

        .confirm-buttons {
          display: flex;
          gap: 15px;
          justify-content: center;
        }

        .confirm-btn {
          flex: 1;
          padding: 10px 0;
          border-radius: 8px;
          font-weight: bold;
          font-size: 14px;
          cursor: pointer;
          border: none;
          transition: background 0.2s;
        }

        .confirm-btn.cancel {
          background: transparent;
          border: 1.5px solid #00a6fb;
          color: #00a6fb;
        }
        .confirm-btn.cancel:hover {
          background: rgba(0, 166, 251, 0.1);
        }

        .confirm-btn.proceed {
          background: #ff4d4d;
          color: white;
        }
        .confirm-btn.proceed:hover {
          background: #e04343;
        }

        @keyframes slideInLeft {
          from { transform: translateX(120%); }
          to { transform: translateX(0); }
        }

        @keyframes scaleUp {
          from { transform: scale(0.85); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}} />
    </PopupContext.Provider>
  );
}

export function usePopup() {
  return useContext(PopupContext);
}
