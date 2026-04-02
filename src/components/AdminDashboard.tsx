import React, { useState, useEffect } from 'react';
import { auth, db, googleProvider } from '../firebase';
import { signInWithPopup, User } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc, writeBatch, getCountFromServer, updateDoc, onSnapshot, query, orderBy, setDoc, getDoc } from 'firebase/firestore';
import Papa from 'papaparse';
import { forbiddenKeywords, forbiddenNames, imageKeywords, livingBeingKeywords, religiousKeywords, statueKeywords } from '../constants/forbidden';
import { Package, ShoppingBag, Settings as SettingsIcon, Trash2, CheckCircle, Clock, ExternalLink, CreditCard, Save, Loader2, Key } from 'lucide-react';

const imageRegex = new RegExp(`\\b(${imageKeywords.join('|')})\\b`, 'i');
const statueRegex = new RegExp(`\\b(${statueKeywords.join('|')})\\b`, 'i');
const livingBeingRegex = new RegExp(`\\b(${livingBeingKeywords.join('|')})\\b`, 'i');
const religiousRegex = new RegExp(`\\b(${religiousKeywords.join('|')})\\b`, 'i');

const DEODAP_BESTSELLERS_RAW = [
  { name: "Silicone Dishwashing Gloves", baseCost: 85, category: "Home", images: ["https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1584472282946-e8f315243b7f?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1585241936939-894676527585?auto=format&fit=crop&q=80&w=800"], isNew: true },
  { name: "Mini Garlic Chopper", baseCost: 120, category: "Kitchen", images: ["https://images.unsplash.com/photo-1593504049359-74330189a345?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1585607344893-43a4cd9288ee?auto=format&fit=crop&q=80&w=800"], isLimited: true },
  { name: "Adhesive Wall Hooks (10 Pcs)", baseCost: 45, category: "Home", images: ["https://images.unsplash.com/photo-1585909695284-32d2985ac9c0?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1584589167171-54766ee3c3aa?auto=format&fit=crop&q=80&w=800"], isNew: true },
  { name: "Microfiber Cleaning Cloths", baseCost: 75, category: "Home", images: ["https://images.unsplash.com/photo-1585241936939-894676527585?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1583947581924-860bda6a5a0d?auto=format&fit=crop&q=80&w=800"] },
  { name: "Portable Mini Sealer", baseCost: 55, category: "Kitchen", images: ["https://images.unsplash.com/photo-1586810141071-8b3612502c38?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&q=80&w=800"], isLimited: true },
  { name: "Soap Dispenser Brush", baseCost: 65, category: "Kitchen", images: ["https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1584472282946-e8f315243b7f?auto=format&fit=crop&q=80&w=800"], isNew: true },
  { name: "Plastic Laptop Stand", baseCost: 150, category: "Tech", images: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&q=80&w=800"], isNew: true },
  { name: "Ice Cube Face Roller", baseCost: 80, category: "Beauty", images: ["https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&q=80&w=800"], isLimited: true },
  { name: "Reusable Silicone Lids", baseCost: 95, category: "Kitchen", images: ["https://images.unsplash.com/photo-1610419200235-01f221495c24?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=800"] },
  { name: "Sticky Lint Roller", baseCost: 60, category: "Home", images: ["https://images.unsplash.com/photo-1583947581924-860bda6a5a0d?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1585241936939-894676527585?auto=format&fit=crop&q=80&w=800"], isNew: true },
  { name: "Shoe Cleaning Eraser", baseCost: 40, category: "Accessories", images: ["https://images.unsplash.com/photo-1600269450099-58dd5976074a?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800"] },
  { name: "Foldable Wardrobe Organizer", baseCost: 110, category: "Home", images: ["https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1603204077708-302b54ce2120?auto=format&fit=crop&q=80&w=800"] },
  { name: "Silicone Sink Strainer", baseCost: 25, category: "Kitchen", images: ["https://images.unsplash.com/photo-1584472282946-e8f315243b7f?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&q=80&w=800"], isLimited: true },
  { name: "Cable Protector Spirals", baseCost: 20, category: "Tech", images: ["https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=800"] },
  { name: "Self-Adhesive Wallpaper", baseCost: 130, category: "Home", images: ["https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1585909695284-32d2985ac9c0?auto=format&fit=crop&q=80&w=800"], isNew: true },
  { name: "Watermelon Slicer", baseCost: 90, category: "Kitchen", images: ["https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1585607344893-43a4cd9288ee?auto=format&fit=crop&q=80&w=800"], isLimited: true },
  { name: "Anti-Vibration Washing Machine Pads", baseCost: 65, category: "Home", images: ["https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1584589167171-54766ee3c3aa?auto=format&fit=crop&q=80&w=800"] },
  { name: "Silicone Scalp Massager", baseCost: 45, category: "Beauty", images: ["https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800"], isNew: true },
  { name: "Fridge Organizer Bins", baseCost: 140, category: "Kitchen", images: ["https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1610419200235-01f221495c24?auto=format&fit=crop&q=80&w=800"] },
  { name: "Magnetic Charging Cable", baseCost: 85, category: "Tech", images: ["https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&q=80&w=800"], isLimited: true },
  { name: "Mosquito Killer Lamp", baseCost: 180, category: "Home", images: ["https://images.unsplash.com/photo-1557431177-36141475c676?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=800"], isNew: true },
  { name: "Manual Juicer Hand Press", baseCost: 110, category: "Kitchen", images: ["https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1587411768638-ec71f8e33b78?auto=format&fit=crop&q=80&w=800"] },
  { name: "LED Strip Lights (5m)", baseCost: 160, category: "Home", images: ["https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1557431177-36141475c676?auto=format&fit=crop&q=80&w=800"], isLimited: true },
  { name: "Vacuum Storage Bags", baseCost: 95, category: "Home", images: ["https://images.unsplash.com/photo-1603204077708-302b54ce2120?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=800"] },
  { name: "Car Phone Mount", baseCost: 75, category: "Tech", images: ["https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=800"], isNew: true },
  { name: "Makeup Brush Cleaner Mat", baseCost: 35, category: "Beauty", images: ["https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&q=80&w=800"] },
  { name: "Posture Corrector Belt", baseCost: 125, category: "Beauty", images: ["https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&q=80&w=800"], isLimited: true },
  { name: "Oil Dispenser Bottle", baseCost: 85, category: "Kitchen", images: ["https://images.unsplash.com/photo-1622484211148-71017e88220a?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=800"] },
  { name: "Corn Stripper Tool", baseCost: 40, category: "Kitchen", images: ["https://images.unsplash.com/photo-1585607344893-43a4cd9288ee?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&q=80&w=800"], isNew: true },
  { name: "Wall Mounted Mop Holder", baseCost: 55, category: "Home", images: ["https://images.unsplash.com/photo-1584589167171-54766ee3c3aa?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1585909695284-32d2985ac9c0?auto=format&fit=crop&q=80&w=800"] },
  { name: "Ring Light with Tripod", baseCost: 250, category: "Tech", images: ["https://images.unsplash.com/photo-1603380353725-f8a4d39cc41e?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&q=80&w=800"], isLimited: true },
  { name: "Egg Boiler Machine", baseCost: 190, category: "Kitchen", images: ["https://images.unsplash.com/photo-1587411768638-ec71f8e33b78?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&q=80&w=800"], isNew: true },
  { name: "Measuring Spoons Set", baseCost: 30, category: "Kitchen", images: ["https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1581422455988-349c25838048?auto=format&fit=crop&q=80&w=800"] },
  { name: "Dish Drying Mat", baseCost: 50, category: "Kitchen", images: ["https://images.unsplash.com/photo-1584472282946-e8f315243b7f?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&q=80&w=800"] },
  { name: "Knife Sharpener Tool", baseCost: 70, category: "Kitchen", images: ["https://images.unsplash.com/photo-1593504049359-74330189a345?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1585607344893-43a4cd9288ee?auto=format&fit=crop&q=80&w=800"], isLimited: true },
  { name: "Blackhead Remover Tool", baseCost: 25, category: "Beauty", images: ["https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800"], isNew: true },
  { name: "Digital Kitchen Scale", baseCost: 150, category: "Kitchen", images: ["https://images.unsplash.com/photo-1581422455988-349c25838048?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&q=80&w=800"] },
  { name: "Electric Toothbrush Holder", baseCost: 45, category: "Home", images: ["https://images.unsplash.com/photo-1584589167171-54766ee3c3aa?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1585909695284-32d2985ac9c0?auto=format&fit=crop&q=80&w=800"], isNew: true },
  { name: "Reusable Coffee Filter", baseCost: 35, category: "Kitchen", images: ["https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1584472282946-e8f315243b7f?auto=format&fit=crop&q=80&w=800"] },
  { name: "Desktop Vacuum Cleaner", baseCost: 210, category: "Tech", images: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1603380353725-f8a4d39cc41e?auto=format&fit=crop&q=80&w=800"], isLimited: true },
  { name: "Silicone Baking Mat", baseCost: 85, category: "Kitchen", images: ["https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1584472282946-e8f315243b7f?auto=format&fit=crop&q=80&w=800"] },
  { name: "Adjustable Drawer Dividers", baseCost: 110, category: "Home", images: ["https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1603204077708-302b54ce2120?auto=format&fit=crop&q=80&w=800"], isNew: true }
];

const DEODAP_BESTSELLERS = DEODAP_BESTSELLERS_RAW.filter(p => {
  const name = p.name.toLowerCase();
  const category = p.category.toLowerCase();
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

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [productCount, setProductCount] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'settings'>('products');
  
  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Settings State
  const [settings, setSettings] = useState({
    upiId: '',
    bankDetails: '',
    storeName: 'LuxeDrop'
  });
  const [settingsLoading, setSettingsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Orders
  useEffect(() => {
    if (user && activeTab === 'orders') {
      setOrdersLoading(true);
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(ordersData);
        setOrdersLoading(false);
      });
      return () => unsubscribe();
    }
  }, [user, activeTab]);

  // Fetch Settings
  useEffect(() => {
    if (user && activeTab === 'settings') {
      const fetchSettings = async () => {
        setSettingsLoading(true);
        try {
          const docRef = doc(db, 'settings', 'store');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setSettings(docSnap.data() as any);
          }
        } catch (error) {
          console.error("Error fetching settings:", error);
        } finally {
          setSettingsLoading(false);
        }
      };
      fetchSettings();
    }
  }, [user, activeTab]);

  const saveSettings = async () => {
    setSettingsLoading(true);
    try {
      await setDoc(doc(db, 'settings', 'store'), settings);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(`Error saving settings: ${error.message}`);
    } finally {
      setSettingsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
    } catch (error: any) {
      alert(`Error updating status: ${error.message}`);
    }
  };

  const automateSupplierPayment = (order: any) => {
    // In a real scenario, this would call a backend function to process payment via API
    // For now, we simulate the "automation" by showing what needs to be paid
    const confirmPay = window.confirm(
      `AUTOMATION SIMULATION:\n\n` +
      `Order ID: ${order.id}\n` +
      `Supplier Cost: ₹${order.baseCostTotal}\n` +
      `Customer Paid: ₹${order.totalAmount}\n\n` +
      `Proceed to automate payment of ₹${order.baseCostTotal} to supplier?`
    );

    if (confirmPay) {
      updateOrderStatus(order.id, 'ordered_from_supplier');
      alert("Payment automated! Order placed with supplier.");
    }
  };

  const fetchProductCount = async () => {
    try {
      const coll = collection(db, 'products');
      const snapshot = await getCountFromServer(coll);
      setProductCount(snapshot.data().count);
    } catch (error) {
      console.error("Error fetching count:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProductCount();
    }
  }, [user]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      setMessage(`Login failed: ${error.message}`);
    }
  };

  const clearProducts = async () => {
    if (!window.confirm("Are you sure you want to delete all products?")) return;
    setUploading(true);
    setMessage('Clearing existing products...');
    try {
      const snapshot = await getDocs(collection(db, 'products'));
      const batch = writeBatch(db);
      snapshot.docs.forEach((document) => {
        batch.delete(doc(db, 'products', document.id));
      });
      await batch.commit();
      setMessage('All products cleared successfully.');
    } catch (error: any) {
      setMessage(`Error clearing products: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const autoImportDeoDap = async () => {
    if (!window.confirm("This will import 40+ DeoDap bestsellers into your live database. Continue?")) return;
    setUploading(true);
    setMessage('Importing DeoDap catalog...');
    
    try {
      const batch = writeBatch(db);
      let count = 0;
      
      for (const product of DEODAP_BESTSELLERS) {
        const docRef = doc(collection(db, 'products'));
        batch.set(docRef, product);
        count++;
      }
      
      await batch.commit();
      setMessage(`Successfully imported ${count} DeoDap products! The 60% margin is automatically applied on the storefront.`);
    } catch (error: any) {
      setMessage(`Error importing: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage('Parsing CSV...');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          setMessage(`Found ${results.data.length} products. Uploading to database...`);
          const batch = writeBatch(db);
          let count = 0;

          for (const row of results.data as any[]) {
            // Map CSV columns to Product schema
            const productData = {
              name: row.name || 'Unnamed Product',
              baseCost: Number(row.baseCost) || 0,
              category: row.category || 'Uncategorized',
              images: row.image ? [row.image] : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800'],
              isNew: row.isNew?.toLowerCase() === 'true',
              isLimited: row.isLimited?.toLowerCase() === 'true'
            };

            const docRef = doc(collection(db, 'products'));
            batch.set(docRef, productData);
            count++;

            // Firestore batches are limited to 500 operations
            if (count % 450 === 0) {
              await batch.commit();
              setMessage(`Uploaded ${count} products...`);
            }
          }

          if (count % 450 !== 0) {
            await batch.commit();
          }

          setMessage(`Successfully imported ${count} products!`);
        } catch (error: any) {
          setMessage(`Error uploading: ${error.message}`);
        } finally {
          setUploading(false);
        }
      },
      error: (error) => {
        setMessage(`CSV Parse Error: ${error.message}`);
        setUploading(false);
      }
    });
  };

  if (loading) return <div className="min-h-screen bg-black text-white p-12">Loading...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-12">
        <h1 className="text-4xl font-serif italic mb-8">Admin Access</h1>
        <button 
          onClick={handleLogin}
          className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-amber-500 transition-all"
        >
          Sign in with Google
        </button>
        {message && <p className="mt-4 text-red-500">{message}</p>}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-white/10 pb-6 gap-6">
          <div>
            <h1 className="text-4xl font-serif italic mb-2">Store Admin</h1>
            <div className="flex gap-4 mt-4">
              <button 
                onClick={() => setActiveTab('products')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs uppercase tracking-widest transition-all ${activeTab === 'products' ? 'bg-amber-500 text-black font-bold' : 'bg-white/5 hover:bg-white/10'}`}
              >
                <Package className="w-4 h-4" /> Products
              </button>
              <button 
                onClick={() => setActiveTab('orders')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs uppercase tracking-widest transition-all ${activeTab === 'orders' ? 'bg-amber-500 text-black font-bold' : 'bg-white/5 hover:bg-white/10'}`}
              >
                <ShoppingBag className="w-4 h-4" /> Orders
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-amber-500 text-black font-bold' : 'bg-white/5 hover:bg-white/10'}`}
              >
                <SettingsIcon className="w-4 h-4" /> Settings
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-zinc-400 text-sm hidden sm:inline">{user.email}</span>
            <button 
              onClick={() => auth.signOut()}
              className="px-4 py-2 border border-white/10 rounded-full text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>

        {activeTab === 'products' && (
          <div className="space-y-8">
            <div className="bg-zinc-900 p-8 rounded-3xl border border-white/5">
              <p className="text-zinc-400">
                Total Products in Database: {productCount !== null ? <strong className="text-white">{productCount.toLocaleString()}</strong> : 'Loading...'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-zinc-900 p-8 rounded-3xl border border-white/5">
                <h2 className="text-2xl font-serif italic mb-4">One-Click Import</h2>
                <p className="text-zinc-400 text-sm mb-6">
                  Automatically populate your database with 40+ of DeoDap's best-selling products. The 60% margin will be applied automatically on the storefront.
                </p>
                <button 
                  onClick={autoImportDeoDap}
                  disabled={uploading}
                  className="w-full px-6 py-4 bg-amber-500 text-black rounded-xl font-bold hover:bg-amber-400 transition-all disabled:opacity-50"
                >
                  Import DeoDap Catalog
                </button>
              </div>

              <div className="bg-zinc-900 p-8 rounded-3xl border border-white/5">
                <h2 className="text-2xl font-serif italic mb-4">Import Custom CSV</h2>
                <p className="text-zinc-400 text-sm mb-6">
                  Upload a CSV file with the following exact columns: <br/>
                  <code className="text-amber-500 bg-black px-2 py-1 rounded mt-2 block text-[10px]">name, baseCost, category, image, isNew, isLimited</code>
                </p>
                
                <div className="relative">
                  <input 
                    type="file" 
                    accept=".csv"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div className={`px-6 py-8 border-2 border-dashed border-white/20 rounded-xl text-center transition-colors ${uploading ? 'bg-white/5' : 'hover:border-amber-500 hover:bg-white/5'}`}>
                    {uploading ? 'Processing...' : 'Click or drag CSV file here'}
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900 p-8 rounded-3xl border border-white/5 md:col-span-2">
                <h2 className="text-2xl font-serif italic mb-4 text-red-400">Database Management</h2>
                <p className="text-zinc-400 text-sm mb-6">
                  Clear all existing products from the database. Warning: This action cannot be undone.
                </p>
                <button 
                  onClick={clearProducts}
                  disabled={uploading}
                  className="px-6 py-3 bg-red-900/50 text-red-200 border border-red-900 rounded-xl font-bold hover:bg-red-900 transition-all disabled:opacity-50"
                >
                  Clear All Products
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-serif italic">Customer Orders</h2>
            
            {ordersLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-zinc-900 p-12 rounded-3xl border border-white/5 text-center text-zinc-500">
                No orders found yet.
              </div>
            ) : (
              <div className="grid gap-6">
                {orders.map(order => (
                  <div key={order.id} className="bg-zinc-900 border border-white/5 rounded-3xl p-6 md:p-8 overflow-hidden">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                            order.status === 'pending' ? 'bg-amber-500/20 text-amber-500' :
                            order.status === 'ordered_from_supplier' ? 'bg-blue-500/20 text-blue-500' :
                            'bg-green-500/20 text-green-500'
                          }`}>
                            {order.status.replace(/_/g, ' ')}
                          </span>
                          <span className="text-zinc-500 text-xs">ID: {order.id}</span>
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-serif italic">{order.customerName}</h3>
                          <p className="text-zinc-400 text-sm">{order.customerEmail} • {order.customerPhone}</p>
                          <p className="text-zinc-500 text-xs mt-1">{order.customerAddress}</p>
                        </div>

                        <div className="space-y-2">
                          <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">Items</p>
                          {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex flex-col gap-1 text-sm border-b border-white/5 pb-2 mb-2 last:border-0 last:pb-0 last:mb-0">
                              <div className="flex justify-between">
                                <span>{item.name} x{item.quantity}</span>
                                <span className="text-zinc-400">₹{item.price}</span>
                              </div>
                              <a 
                                href={`https://deodap.in/search?q=${encodeURIComponent(item.name)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-amber-500 hover:text-amber-400 flex items-center gap-1 w-fit"
                              >
                                <ExternalLink className="w-3 h-3" /> Order from DeoDap
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="md:w-64 bg-black/40 rounded-2xl p-6 space-y-4 border border-white/5">
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-500">Customer Paid</span>
                          <span className="text-amber-500 font-bold">₹{order.totalAmount}</span>
                        </div>
                        {order.shippingCost > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Shipping Collected</span>
                            <span className="text-zinc-300">₹{order.shippingCost}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-500">Supplier Cost</span>
                          <span className="text-zinc-300">₹{order.baseCostTotal}</span>
                        </div>
                        <div className="h-px bg-white/10"></div>
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-500 font-bold">Profit</span>
                          <span className="text-green-500 font-bold">₹{order.totalAmount - order.baseCostTotal}</span>
                        </div>

                        {order.status === 'pending' && (
                          <button 
                            onClick={() => automateSupplierPayment(order)}
                            className="w-full bg-white text-black py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-amber-500 transition-all flex items-center justify-center gap-2"
                          >
                            <ExternalLink className="w-3 h-3" /> Automate Payment
                          </button>
                        )}
                        
                        <div className="grid grid-cols-2 gap-2">
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'shipped')}
                            className="bg-zinc-800 py-2 rounded-lg text-[10px] font-bold uppercase hover:bg-zinc-700"
                          >
                            Mark Shipped
                          </button>
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                            className="bg-zinc-800 py-2 rounded-lg text-[10px] font-bold uppercase hover:bg-zinc-700"
                          >
                            Mark Delivered
                          </button>
                        </div>

                        <div className="pt-4 border-t border-white/10 space-y-3">
                          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Tracking Info</p>
                          <input 
                            type="text" 
                            placeholder="Tracking Number"
                            defaultValue={order.trackingNumber || ''}
                            onBlur={(e) => updateDoc(doc(db, 'orders', order.id), { trackingNumber: e.target.value })}
                            className="w-full bg-black border border-white/10 rounded-lg py-2 px-3 text-xs focus:border-amber-500 outline-none transition-colors"
                          />
                          <input 
                            type="url" 
                            placeholder="Tracking URL (e.g. Delhivery link)"
                            defaultValue={order.trackingUrl || ''}
                            onBlur={(e) => updateDoc(doc(db, 'orders', order.id), { trackingUrl: e.target.value })}
                            className="w-full bg-black border border-white/10 rounded-lg py-2 px-3 text-xs focus:border-amber-500 outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl space-y-8">
            <h2 className="text-3xl font-serif italic">Store Settings</h2>
            
            <div className="bg-zinc-900 p-8 rounded-3xl border border-white/5 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1">Store Name</label>
                <input 
                  type="text" 
                  value={settings.storeName}
                  onChange={(e) => setSettings({...settings, storeName: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-sm focus:border-amber-500 outline-none transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1 flex items-center gap-2">
                  <CreditCard className="w-3 h-3" /> UPI ID for Payments
                </label>
                <input 
                  type="text" 
                  placeholder="yourname@upi"
                  value={settings.upiId}
                  onChange={(e) => setSettings({...settings, upiId: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-sm focus:border-amber-500 outline-none transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1">Bank Account Details</label>
                <textarea 
                  rows={4}
                  placeholder="Account Number: ...&#10;IFSC Code: ...&#10;Bank Name: ..."
                  value={settings.bankDetails}
                  onChange={(e) => setSettings({...settings, bankDetails: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-sm focus:border-amber-500 outline-none transition-colors resize-none"
                />
              </div>

              <button 
                onClick={saveSettings}
                disabled={settingsLoading}
                className="w-full bg-white text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-amber-500 transition-all disabled:opacity-50"
              >
                {settingsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save Settings
              </button>
            </div>
          </div>
        )}

        {message && (
          <div className="mt-8 p-4 bg-zinc-800 border border-white/10 rounded-xl text-center">
            {message}
          </div>
        )}
        
        <div className="mt-12 text-center">
          <a href="/" className="text-amber-500 hover:underline">← Back to Store</a>
        </div>
      </div>
    </div>
  );
}
