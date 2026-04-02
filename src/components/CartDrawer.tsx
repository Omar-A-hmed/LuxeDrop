import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "./CartContext";

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, items, updateQuantity, removeFromCart, cartTotal, shippingCost, finalTotal, setIsCheckoutOpen } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full md:w-[400px] bg-brand-dark border-l border-white/10 z-50 flex flex-col"
          >
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-serif italic flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" /> Your Cart
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
                  <ShoppingBag className="w-12 h-12 mb-4 opacity-20" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <img src={item.image} alt={item.name} className="w-20 h-24 object-cover rounded-lg bg-zinc-900" />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-brand-gold text-sm">{item.price}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 bg-white/5 rounded-lg px-2 py-1">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:text-brand-gold"><Minus className="w-3 h-3" /></button>
                          <span className="text-sm w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:text-brand-gold"><Plus className="w-3 h-3" /></button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-xs text-zinc-500 hover:text-red-400 underline">Remove</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-zinc-900/50">
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-zinc-400">Subtotal</span>
                  <span className="font-medium">₹{cartTotal.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between mb-4 text-sm">
                  <span className="text-zinc-400">Shipping</span>
                  <span className="font-medium">₹{shippingCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="h-px bg-white/10 w-full mb-4"></div>
                <div className="flex justify-between mb-6">
                  <span className="text-zinc-400">Total</span>
                  <span className="font-medium text-brand-gold">₹{finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                </div>
                <button 
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-brand-gold transition-colors"
                >
                  Checkout securely
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
