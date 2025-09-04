import React, { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(undefined);
const API_URL = process.env.REACT_APP_BACKEND_URL;

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const addItem = (product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.product_name,
          price: product.product_price,
          image: `${API_URL}/products/uploads/products/${product.product_picture}`,
          quantity,
        },
      ];
    });
    open();
  };

  const removeItem = (productId) =>
    setItems((prev) => prev.filter((i) => i.productId !== productId));

  const updateQty = (productId, quantity) =>
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
    );

  const clear = () => setItems([]);

  const { totalQty, subtotal } = useMemo(() => {
    const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + i.quantity * i.price, 0);
    return { totalQty, subtotal };
  }, [items]);

  const value = {
    items,
    isOpen,
    open,
    close,
    addItem,
    removeItem,
    updateQty,
    clear,
    totalQty,
    subtotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
