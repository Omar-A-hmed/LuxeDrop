import Navbar from "./components/Navbar";
import Ticker from "./components/Ticker";
import Hero from "./components/Hero";
import ProductGrid from "./components/ProductGrid";
import SimulationSection from "./components/SimulationSection";
import CTAOrbit from "./components/CTAOrbit";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import AdminDashboard from "./components/AdminDashboard";
import CheckoutModal from "./components/CheckoutModal";
import LegalPage from "./components/LegalPage";
import TrackOrder from "./components/TrackOrder";
import Loader from "./components/Loader";
import { useCart } from "./components/CartContext";
import { motion, AnimatePresence } from "framer-motion";

export default function App() {
  const path = window.location.pathname;
  const { isCheckoutOpen, setIsCheckoutOpen, items, finalTotal, shippingCost, baseCostTotal, clearCart } = useCart();

  if (path === '/admin') {
    return <AdminDashboard />;
  }

  if (path === '/track') {
    return <TrackOrder />;
  }

  if (path === '/terms') {
    return (
      <LegalPage 
        title="Terms of Service" 
        lastUpdated="March 25, 2026"
        content={
          <>
            <p>Welcome to LuxeDrop. By accessing our website, you agree to these Terms of Service.</p>
            <h3>1. General Conditions</h3>
            <p>We reserve the right to refuse service to anyone for any reason at any time. You understand that your content (not including credit card information), may be transferred unencrypted and involve transmissions over various networks.</p>
            <h3>2. Products or Services</h3>
            <p>Certain products or services may be available exclusively online through the website. These products or services may have limited quantities and are subject to return or exchange only according to our Return Policy.</p>
            <h3>3. Accuracy of Billing and Account Information</h3>
            <p>We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household or per order.</p>
            <h3>4. Contact Information</h3>
            <p>Questions about the Terms of Service should be sent to us at support@luxedrop.com.</p>
          </>
        }
      />
    );
  }

  if (path === '/privacy') {
    return (
      <LegalPage 
        title="Privacy Policy" 
        lastUpdated="March 25, 2026"
        content={
          <>
            <p>This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from LuxeDrop.</p>
            <h3>1. Personal Information We Collect</h3>
            <p>When you visit the Site, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device.</p>
            <h3>2. How Do We Use Your Personal Information?</h3>
            <p>We use the Order Information that we collect generally to fulfill any orders placed through the Site (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations).</p>
            <h3>3. Sharing Your Personal Information</h3>
            <p>We share your Personal Information with third parties to help us use your Personal Information, as described above. For example, we use Razorpay to power our online payments.</p>
            <h3>4. Data Retention</h3>
            <p>When you place an order through the Site, we will maintain your Order Information for our records unless and until you ask us to delete this information.</p>
          </>
        }
      />
    );
  }

  if (path === '/shipping-returns') {
    return (
      <LegalPage 
        title="Shipping & Returns" 
        lastUpdated="March 25, 2026"
        content={
          <>
            <p>We want you to be completely satisfied with your purchase. Here is our policy regarding shipping and returns.</p>
            <h3>1. Shipping Policy</h3>
            <p>All orders are processed within 1-3 business days. Orders are not shipped or delivered on weekends or holidays. If we are experiencing a high volume of orders, shipments may be delayed by a few days.</p>
            <h3>2. Shipping Rates & Delivery Estimates</h3>
            <p>Shipping charges for your order will be calculated and displayed at checkout. Delivery delays can occasionally occur.</p>
            <h3>3. Return Policy</h3>
            <p>Our Return & Refund Policy provides detailed information about options and procedures for returning your order. You have 30 calendar days to return an item from the date you received it. To be eligible for a return, your item must be unused and in the same condition that you received it.</p>
            <h3>4. Refunds</h3>
            <p>Once we receive your item, we will inspect it and notify you that we have received your returned item. We will immediately notify you on the status of your refund after inspecting the item. If your return is approved, we will initiate a refund to your credit card (or original method of payment).</p>
          </>
        }
      />
    );
  }

  return (
    <>
      <Loader />
      <AnimatePresence>
        <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[100dvh] bg-brand-dark snap-y snap-mandatory overflow-y-auto h-[100dvh] max-w-full overflow-x-hidden"
      >
        <Navbar />
        <CartDrawer />
        
        {isCheckoutOpen && (
          <CheckoutModal 
            items={items}
            total={finalTotal}
            shippingCost={shippingCost}
            baseCostTotal={baseCostTotal}
            onClose={() => setIsCheckoutOpen(false)}
            onSuccess={() => {
              clearCart();
              setIsCheckoutOpen(false);
            }}
          />
        )}
        <div className="snap-start h-[100dvh]">
          <Hero />
        </div>
        
        <Ticker />
        
        <div className="snap-start min-h-[100dvh]">
          <SimulationSection />
        </div>
        
        {/* Featured Section */}
        <section id="lookbook" className="snap-start py-24 px-6 md:px-12 bg-brand-dark border-y border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              className="relative rounded-3xl overflow-hidden aspect-video group bg-zinc-900"
            >
              <img 
                src="https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1024&auto=format&fit=crop"
                alt="Galaxy"
                className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/20 pointer-events-none" />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              className="max-w-md"
            >
              <span className="text-brand-gold text-[10px] uppercase tracking-[0.3em] font-bold mb-4 block">The Philosophy</span>
              <h2 className="text-4xl md:text-5xl font-serif italic mb-6 leading-tight">Beyond Mere <br /> Aesthetics</h2>
              <p className="text-zinc-400 font-light leading-relaxed mb-8">
                We believe that the objects we surround ourselves with should be as functional as they are beautiful. Our curation process focuses on the intersection of engineering and art.
              </p>
              <button className="text-sm uppercase tracking-widest font-bold border-b border-brand-gold pb-1 hover:text-brand-gold transition-colors">
                Discover the Process
              </button>
            </motion.div>
          </div>
        </section>

        <div className="snap-start">
          <ProductGrid />
        </div>
        
        {/* Newsletter */}
        <section className="snap-start py-32 px-6 md:px-12 bg-brand-gold/5 text-center relative overflow-hidden">
          <CTAOrbit />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            className="max-w-2xl mx-auto relative z-10"
          >
            <h2 className="text-4xl md:text-6xl font-serif italic mb-8">Join the Inner Circle</h2>
            <p className="text-zinc-400 font-light mb-12">
              Be the first to know about new collection drops, exclusive events, and curated insights.
            </p>
            <div className="flex flex-col md:flex-row gap-4">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-8 py-4 focus:outline-none focus:border-brand-gold transition-colors"
              />
              <button className="px-10 py-4 bg-white text-black font-bold rounded-full hover:bg-brand-gold transition-all">
                Subscribe
              </button>
            </div>
          </motion.div>
        </section>

        <div className="snap-start">
          <Footer />
        </div>
      </motion.main>
    </AnimatePresence>
    </>
  );
}
