import { createContext, useContext, useReducer } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const exists = state.items.find((i) => i._id === action.payload._id);
      if (exists) {
        return {
          ...state,
          items: state.items.map((i) =>
            i._id === action.payload._id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { ...state, items: [...state.items, { ...action.payload, quantity: 1 }] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i._id !== action.payload) };
    case 'UPDATE_QTY':
      return {
        ...state,
        items: state.items.map((i) =>
          i._id === action.payload.id ? { ...i, quantity: action.payload.qty } : i
        ).filter((i) => i.quantity > 0),
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const addToCart = (item) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
    toast.success(`${item.name} added to cart`);
  };

  const removeFromCart = (id) => dispatch({ type: 'REMOVE_ITEM', payload: id });

  const updateQty = (id, qty) => dispatch({ type: 'UPDATE_QTY', payload: { id, qty } });

  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  const total = state.items.reduce((sum, i) => sum + (i.effectivePrice ?? i.discountedPrice ?? i.price) * i.quantity, 0);
  const totalOriginal = state.items.reduce((sum, i) => {
    const op = i.selectedVariant?.originalPrice ?? i.price ?? 0;
    return sum + (op * i.quantity);
  }, 0);
  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items: state.items, total, totalOriginal, itemCount, addToCart, removeFromCart, updateQty, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

