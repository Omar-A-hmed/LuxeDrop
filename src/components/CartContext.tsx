import { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { forbiddenKeywords, forbiddenNames, imageKeywords, livingBeingKeywords, religiousKeywords, statueKeywords } from '../constants/forbidden';

const imageRegex = new RegExp(`\\b(${imageKeywords.join('|')})\\b`, 'i');
const statueRegex = new RegExp(`\\b(${statueKeywords.join('|')})\\b`, 'i');
const livingBeingRegex = new RegExp(`\\b(${livingBeingKeywords.join('|')})\\b`, 'i');
const religiousRegex = new RegExp(`\\b(${religiousKeywords.join('|')})\\b`, 'i');

export type CartItem = {
  id: string | number;
  name: string;
  price: string;
  numericPrice: number;
  image: string;
  quantity: number;
  baseCost?: number;
  category?: string;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string | number) => void;
  updateQuantity: (id: string | number, quantity: number) => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (isOpen: boolean) => void;
  cartTotal: number;
  shippingCost: number;
  finalTotal: number;
  baseCostTotal: number;
  clearCart: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [rawItems, setRawItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const items = useMemo(() => {
    return rawItems.filter(item => {
      const name = item.name.toLowerCase();
      const category = (item.category || "").toLowerCase();
      
      const isForbiddenName = forbiddenNames.some(fn => name.includes(fn.toLowerCase()));
      
      const isImage = imageRegex.test(name) || imageRegex.test(category);
      const isStatue = statueRegex.test(name) || statueRegex.test(category);
      const hasLivingBeing = livingBeingRegex.test(name) || livingBeingRegex.test(category);
      const isReligious = religiousRegex.test(name) || religiousRegex.test(category);

      // Forbidden if: 
      // 1. (is an image AND contains a living being)
      // 2. (is a statue AND contains a living being)
      // 3. (is a religious symbol/item)
      // 4. (is in the explicit forbidden names list)
      if ((isImage && hasLivingBeing) || (isStatue && hasLivingBeing) || isReligious || isForbiddenName) {
        return false;
      }
      return true;
    });
  }, [rawItems]);

  const addToCart = (newItem: Omit<CartItem, 'quantity'>) => {
    // Check if item is forbidden before adding
    const name = newItem.name.toLowerCase();
    const category = (newItem.category || "").toLowerCase();
    
    const isForbiddenName = forbiddenNames.some(fn => name.includes(fn.toLowerCase()));
    
    const isImage = imageRegex.test(name) || imageRegex.test(category);
    const isStatue = statueRegex.test(name) || statueRegex.test(category);
    const hasLivingBeing = livingBeingRegex.test(name) || livingBeingRegex.test(category);
    const isReligious = religiousRegex.test(name) || religiousRegex.test(category);

    // Forbidden if: 
    // 1. (is an image AND contains a living being)
    // 2. (is a statue AND contains a living being)
    // 3. (is a religious symbol/item)
    // 4. (is in the explicit forbidden names list)
    if ((isImage && hasLivingBeing) || (isStatue && hasLivingBeing) || isReligious || isForbiddenName) {
      return;
    }

    setRawItems(prev => {
      const existing = prev.find(item => item.id === newItem.id);
      if (existing) {
        return prev.map(item => item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...newItem, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string | number) => {
    setRawItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string | number, quantity: number) => {
    if (quantity < 1) return removeFromCart(id);
    setRawItems(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
  };

  const cartTotal = items.reduce((total, item) => {
    return total + (item.numericPrice * item.quantity);
  }, 0);

  // Flat ₹50 delivery charge per item (TEMPORARILY SET TO 0 FOR TESTING)
  const shippingCost = items.reduce((total, item) => {
    return total + (0 * item.quantity);
  }, 0);
  const finalTotal = cartTotal + shippingCost;

  const baseCostTotal = items.reduce((total, item) => {
    return total + ((item.baseCost || 0) * item.quantity);
  }, 0);

  const clearCart = () => setRawItems([]);

  return (
    <CartContext.Provider value={{ 
      items, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      isCartOpen, 
      setIsCartOpen, 
      isCheckoutOpen,
      setIsCheckoutOpen,
      cartTotal,
      shippingCost,
      finalTotal,
      baseCostTotal,
      clearCart,
      searchQuery,
      setSearchQuery
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
