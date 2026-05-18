import { createContext, useState, useContext, useEffect } from 'react';
import { cartService } from '../api/cartService';
import { useAuth } from '../hooks/useAuth';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);

  const fetchCart = async () => {
    if (isAuthenticated) {
      try {
        const res = await cartService.getCart();
        setCart(res.data);
      } catch (error) {
        console.error("Failed to fetch cart:", error);
      }
    } else {
      setCart(null);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const updateCart = (newCartData) => {
    setCart(newCartData);
  };

  return (
    <CartContext.Provider value={{ cart, fetchCart, updateCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
