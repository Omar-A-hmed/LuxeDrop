import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, CreditCard, MapPin, Phone, User, Mail, Loader2, Copy } from "lucide-react";
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

interface CheckoutModalProps {
  items: any[];
  total: number;
  shippingCost?: number;
  baseCostTotal: number;
  onClose: () => void;
  onSuccess: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutModal({ items, total, shippingCost = 0, baseCostTotal, onClose, onSuccess }: CheckoutModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const docRef = doc(db, 'settings', 'store');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      }
    };
    fetchSettings();

    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRazorpayPayment = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      alert("Please fill in all details");
      return;
    }

    setLoading(true);
    try {
      // 1. Create order on server
      const response = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({ id: item.id, quantity: item.quantity })),
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          customerAddress: formData.address,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create Razorpay order');
      }

      const order = await response.json();

      // 2. Open Razorpay Checkout
      const options = {
        key: order.keyId, // Using the public key from the server
        amount: order.amount,
        currency: order.currency,
        name: settings?.storeName || "LuxeDrop",
        description: "Order Payment",
        order_id: order.id,
        handler: async function (response: any) {
          // 3. Verify payment on server
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });

          const verifyData = await verifyRes.json();

          if (verifyData.status === 'success') {
            // 4. Order is already secured by the backend webhook/verifier
            setStep(3);
            setTimeout(() => {
              onSuccess();
            }, 5000);
          } else {
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: "#F59E0B"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error("Payment Error:", error);
      alert(`Payment Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Order saving is now handled securely on the server side

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-zinc-950 border border-white/10 rounded-[2.5rem] overflow-hidden w-full max-w-2xl shadow-2xl relative"
        >
          <button 
            onClick={onClose}
            className="absolute right-6 top-6 z-50 w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8 md:p-12">
            {step === 1 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-serif italic mb-2">Shipping Details</h2>
                  <p className="text-zinc-500 text-sm">Where should we send your curated selection?</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-amber-500 outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-amber-500 outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                      <input 
                        type="tel" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+91 98765 43210"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-amber-500 outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1">Delivery Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 w-4 h-4 text-zinc-600" />
                      <textarea 
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="House No, Street, City, State, ZIP"
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-amber-500 outline-none transition-colors resize-none"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setStep(2)}
                  className="w-full bg-white text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-amber-500 transition-all active:scale-95"
                >
                  Proceed to Payment
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-serif italic mb-2">Complete Payment</h2>
                  <p className="text-zinc-500 text-sm">Pay securely via Razorpay to confirm your order.</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Total Amount</span>
                    <span className="text-2xl font-serif italic text-amber-500">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                  
                  <div className="h-px bg-white/10 w-full"></div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-amber-500" />
                      <span className="text-sm font-bold uppercase tracking-widest">Payment Summary</span>
                    </div>

                    <div className="p-6 bg-black/40 rounded-3xl border border-white/5 space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Items Subtotal</span>
                        <span>₹{(total - shippingCost).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Shipping</span>
                        {shippingCost > 0 ? (
                          <span>₹{shippingCost.toLocaleString('en-IN')}</span>
                        ) : (
                          <span className="text-green-500 uppercase tracking-widest text-[10px] font-bold">Free</span>
                        )}
                      </div>
                      <div className="h-px bg-white/5 w-full"></div>
                      <div className="flex justify-between font-serif italic text-lg">
                        <span>Total to Pay</span>
                        <span className="text-amber-500">₹{total.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={handleRazorpayPayment}
                    disabled={loading}
                    className="w-full bg-amber-500 text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-amber-400 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Pay Now with Razorpay
                      </>
                    )}
                  </button>
                  
                  <button 
                    onClick={() => setStep(1)}
                    disabled={loading}
                    className="w-full bg-white/5 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50"
                  >
                    Back to Shipping
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="py-12 flex flex-col items-center text-center space-y-6">
                <div className="w-24 h-24 bg-amber-500/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-12 h-12 text-amber-500" />
                </div>
                <h2 className="text-4xl font-serif italic">Order Placed!</h2>
                <p className="text-zinc-400 max-w-sm">
                  Your order has been recorded and payment verified. 
                  <br /><br />
                  <span className="text-amber-500/80 text-sm">
                    Tracking information will be available on the "Track Order" page within 24-48 hours.
                  </span>
                </p>
                <div className="pt-8 w-full max-w-xs">
                   <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 5 }}
                        className="h-full bg-amber-500"
                      />
                   </div>
                   <p className="mt-4 text-[10px] uppercase tracking-widest text-zinc-600">Redirecting to store...</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
