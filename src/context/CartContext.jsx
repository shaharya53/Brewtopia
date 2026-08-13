import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from session storage on mount
  useEffect(() => {
    const savedCart = sessionStorage.getItem('brewtopia_cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to session storage when changed
  useEffect(() => {
    sessionStorage.setItem('brewtopia_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.title === item.title);
      if (existing) {
        return prev.map((i) =>
          i.title === item.title ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsCartOpen(true); // Open the cart drawer automatically on add
  };

  const removeFromCart = (title) => {
    setCartItems((prev) => prev.filter((i) => i.title !== title));
  };

  const updateQuantity = (title, quantity) => {
    if (quantity <= 0) {
      removeFromCart(title);
      return;
    }
    setCartItems((prev) =>
      prev.map((i) => (i.title === title ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  
  const totalPrice = cartItems.reduce((acc, item) => {
    // Extract numerical value from price string (e.g. "Rs. 250" or "$ 4.50" -> 250 or 4.5)
    const priceNum = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
    return acc + priceNum * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItemsCount,
        totalPrice
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
