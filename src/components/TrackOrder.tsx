import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Package, Search, Loader2, CheckCircle, Clock, Truck } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { motion } from 'framer-motion';

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const docRef = doc(db, 'orders', orderId.trim());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setOrder({ id: docSnap.id, ...docSnap.data() });
      } else {
        setError('Order not found. Please check your Order ID and try again.');
      }
    } catch (err: any) {
      setError('An error occurred while fetching your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'ordered_from_supplier':
        return <Clock className="w-8 h-8 text-amber-500" />;
      case 'shipped':
        return <Truck className="w-8 h-8 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      default:
        return <Package className="w-8 h-8 text-zinc-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
      case 'ordered_from_supplier':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-24 px-6 md:px-12 flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif italic mb-4">Track Your Order</h1>
            <p className="text-zinc-400 font-light">Enter your Order ID below to check the current status of your shipment.</p>
          </div>

          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4 mb-12">
            <input 
              type="text" 
              placeholder="e.g. 8f7d6a5b..."
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-amber-500 transition-colors"
              required
            />
            <button 
              type="submit"
              disabled={loading}
              className="bg-white text-black px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-amber-500 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              Track
            </button>
          </form>

          {error && (
            <div className="bg-red-900/20 border border-red-900/50 text-red-400 p-4 rounded-xl text-center text-sm">
              {error}
            </div>
          )}

          {order && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-zinc-900 border border-white/10 rounded-3xl p-8"
            >
              <div className="flex flex-col items-center text-center border-b border-white/10 pb-8 mb-8">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-4 border border-white/5">
                  {getStatusIcon(order.status)}
                </div>
                <h2 className="text-2xl font-serif italic mb-2">{getStatusText(order.status)}</h2>
                <p className="text-zinc-500 text-sm">Order ID: {order.id}</p>
              </div>

              {order.trackingNumber && (
                <div className="bg-black border border-white/5 rounded-2xl p-6 mb-8 text-center">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Tracking Number</p>
                  <p className="text-xl font-mono text-amber-500">{order.trackingNumber}</p>
                  {order.trackingUrl && (
                    <a 
                      href={order.trackingUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block mt-4 text-xs uppercase tracking-widest border-b border-white/20 pb-1 hover:text-amber-500 hover:border-amber-500 transition-colors"
                    >
                      Track on Courier Website
                    </a>
                  )}
                </div>
              )}

              {!order.trackingNumber && (order.status === 'pending' || order.status === 'ordered_from_supplier' || order.status === 'paid') && (
                <div className="bg-amber-900/10 border border-amber-900/30 text-amber-500 p-6 rounded-2xl text-center mb-8">
                  <p className="font-bold mb-2">Your order is currently being processed.</p>
                  <p className="text-sm text-amber-500/80 font-light">
                    Tracking information is typically updated within 24-48 hours of placing your order. We will update this page as soon as your package ships!
                  </p>
                </div>
              )}

              <div>
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-4">Order Details</p>
                <div className="space-y-4">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-black rounded-lg overflow-hidden">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <span>{item.name} <span className="text-zinc-500">x{item.quantity}</span></span>
                      </div>
                      <span className="text-zinc-400">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center">
                  <span className="text-zinc-400">Total</span>
                  <span className="text-xl font-serif italic">₹{order.totalAmount}</span>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
