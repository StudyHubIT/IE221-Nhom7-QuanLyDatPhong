"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type CartItem = {
  phong_id: number;
  so_phong?: string;
  ten_loai: string;
  don_gia: number;
  suc_chua?: number;
  image?: string;
  mo_ta?: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (phong_id: number) => void;
  clearCart: () => void;
  itemCount: number;
  isHydrated: boolean;
};

const CART_STORAGE_KEY = "hotelbook_cart_items";

const defaultInitialItems: CartItem[] = [
  {
    phong_id: 1,
    so_phong: "101",
    ten_loai: "Phòng Đơn Standard",
    don_gia: 500000,
    suc_chua: 2,
    image:
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80",
    mo_ta: "Không gian lưu trú tinh tế với thiết kế mở, tiện nghi 5 sao và view thành phố tuyệt đẹp.",
  },
];

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Read initial cart from localStorage on client side
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        setItems(Array.isArray(parsed) ? parsed : []);
      } else {
        // Uninitialized: set default cart items & store
        setItems(defaultInitialItems);
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(defaultInitialItems));
      }
    } catch (err) {
      console.error("Lỗi đọc giỏ hàng từ localStorage:", err);
      setItems(defaultInitialItems);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save changes to localStorage whenever items state updates (after initial hydration)
  const saveItems = (newItems: CartItem[]) => {
    setItems(newItems);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
      } catch (err) {
        console.error("Lỗi ghi giỏ hàng vào localStorage:", err);
      }
    }
  };

  const addItem = (item: CartItem) => {
    const exists = items.some((i) => i.phong_id === item.phong_id);
    if (!exists) {
      const next = [...items, item];
      saveItems(next);
    }
  };

  const removeItem = (phong_id: number) => {
    const next = items.filter((i) => i.phong_id !== phong_id);
    saveItems(next);
  };

  const clearCart = () => {
    saveItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clearCart,
        itemCount: items.length,
        isHydrated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
