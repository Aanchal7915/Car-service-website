import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPart, getParts } from '../api/storeApi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import PartCard from '../components/parts/PartCard';
import {
  Heart, Share2, ChevronLeft, ChevronRight, Star, ShoppingCart,
  MapPin, CheckCircle, AlertCircle, Clock, Maximize2, X,
  Search, ZoomIn, ZoomOut, Phone, Mail, User, Info, Check, Play,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const normalizeSize = (s) => (s ? s.toLowerCase().replace(/\([^)]*\)/g, '').replace(/[^a-z0-9]/g, '').trim() : '');
const isVideoUrl = (url = '') => /\.(mp4|mov|webm|ogg|m4v)(\?.*)?$/i.test(url) || url.includes('/video/upload/');

export default function PartDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items, addToCart, updateQty } = useCart();
  const cartItem = items.find(i => i._id === id);
  const { user, wishlist = [], toggleWishlist } = useAuth();

  const [part, setPart] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [fullScreenZoom, setFullScreenZoom] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const [selectedPincode, setSelectedPincode] = useState(() => localStorage.getItem('selectedPincode') || '');
  const [selectedSize, setSelectedSize] = useState(null);
  const userPickedSize = useRef(false);

  const isMobile = window.matchMedia("(pointer: coarse)").matches;
  const isWishlisted = Array.isArray(wishlist) && (wishlist.includes(id) || wishlist.some(i => i._id === id));

  useEffect(() => {
    setLoading(true);
    getPart(id)
      .then(({ data }) => {
        setPart(data.part);
        return getParts({ category: data.part.category, limit: 8 });
      })
      .then(({ data }) => setSimilar((data.parts || []).filter(p => (p._id || p.id) !== id).slice(0, 8)))
      .catch(() => toast.error('Failed to load part'))
      .finally(() => {
        setTimeout(() => setLoading(false), 800);
      });
  }, [id]);

  useEffect(() => {
    const handler = () => setSelectedPincode(localStorage.getItem('selectedPincode') || '');
    window.addEventListener('pincode-updated', handler);
    return () => window.removeEventListener('pincode-updated', handler);
  }, []);

  useEffect(() => {
    userPickedSize.current = false;
    setSelectedSize(null);
  }, [selectedPincode]);

  const availableSizes = useMemo(() => {
    if (!part) return [];
    if (selectedPincode.length === 6) {
      const entries = (part.pincodePricing || []).filter(p => p.pincode === selectedPincode.trim() && p.size);
      if (entries.length > 0) {
        const seen = new Map();
        entries.forEach(p => {
          const key = normalizeSize(p.size);
          if (!seen.has(key)) seen.set(key, { 
            size: p.size, 
            price: Number(p.price), 
            originalPrice: p.originalPrice ? Number(p.originalPrice) : null, 
            inventory: Number(p.inventory) 
          });
        });
        return Array.from(seen.values());
      }
      return [];
    }
    return (part.variants || []).map(v => ({ 
      size: v.size, 
      price: Number(v.price || part.discountedPrice || part.price), 
      originalPrice: v.originalPrice ? Number(v.originalPrice) : null, 
      inventory: Number(v.countInStock ?? part.stock ?? 0) 
    }));
  }, [part, selectedPincode]);

  useEffect(() => {
    if (availableSizes.length > 0 && !userPickedSize.current) {
      const best = availableSizes.find(s => s.inventory > 0) || availableSizes[0];
      setSelectedSize(best);
    }
  }, [availableSizes]);

  const pincodeRule = useMemo(() => {
    if (!part || selectedPincode.length !== 6 || !selectedSize) return null;
    return (part.pincodePricing || []).find(p => p.pincode === selectedPincode.trim() && normalizeSize(p.size) === normalizeSize(selectedSize.size)) || null;
  }, [part, selectedPincode, selectedSize]);

  const effectivePrice = selectedSize?.price ?? part?.discountedPrice ?? part?.price ?? 0;
  const effectiveOriginal = selectedSize?.originalPrice ?? part?.price ?? 0;
  const effectiveStock = selectedSize?.inventory ?? part?.stock ?? 0;
  const discount = (effectiveOriginal && effectivePrice && effectiveOriginal > effectivePrice) 
    ? Math.round(((effectiveOriginal - effectivePrice) / effectiveOriginal) * 100) 
    : 0;

  const isUnavailable = selectedPincode.length === 6 && availableSizes.length === 0;
  const isCheckingPincode = selectedPincode.length > 0 && selectedPincode.length < 6;

  const handleAddToCart = () => {
    if (!user) { toast.error('Please login to continue'); navigate('/login'); return; }
    if (isUnavailable) { toast.error('Not available at this pincode'); return; }
    if (effectiveStock <= 0) { toast.error('Out of stock'); return; }
    
    addToCart({ 
      ...part, 
      effectivePrice, 
      selectedVariant: selectedSize ? { ...selectedSize, price: effectivePrice, originalPrice: effectiveOriginal, countInStock: effectiveStock } : null
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => toast.success('Link copied!'))
      .catch(() => toast.error('Failed to copy link'));
  };

  const handlePincodeChange = (val) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 6);
    setSelectedPincode(cleaned);
    if (cleaned.length === 6) {
      localStorage.setItem('selectedPincode', cleaned);
      window.dispatchEvent(new Event('pincode-updated'));
    }
  };

  const handleMouseMove = (e) => {
    if (!zoomed) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setMousePos({ x, y });
  };

  const maskPhone = (phone = "") => {
    const d = String(phone).replace(/\D/g, "");
    if (d.length <= 4) return d;
    return `${"*".repeat(d.length - 4)}${d.slice(-4)}`;
  };

  if (loading) return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-gray-100 border-t-red-600 rounded-full animate-spin" />
        <p className="font-bold text-gray-400 tracking-widest uppercase text-sm">Loading Excellence...</p>
      </div>
    </div>
  );

  if (!part) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-white p-4">
      <AlertCircle size={64} className="text-red-500 mb-4" />
      <h2 className="text-2xl font-black text-gray-900 mb-2">PART NOT FOUND</h2>
      <p className="text-gray-500 mb-8 max-w-md text-center">We couldn't locate the specific spare part you're looking for. It might have been moved or discontinued.</p>
      <Link to="/parts" className="btn-primary">BACK TO STORE</Link>
    </div>
  );

  const images = part.images?.length ? part.images : ['https://via.placeholder.com/800x800/F9F9F9/E53935?text=No+Preview'];

  return (
    <div className="bg-white min-h-screen">
      {/* Mobile Full Screen Zoom Modal */}
      <AnimatePresence>
        {fullScreenZoom && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md"
            onClick={() => setFullScreenZoom(false)}
          >
            <motion.img
              src={images[activeImg]} alt={part.name}
              initial={{ scale: 0.8 }} animate={{ scale: 1 }}
              className="max-w-full max-h-full object-contain"
            />
            <button className="absolute top-6 right-6 text-white bg-white/10 p-3 rounded-full hover:bg-white/20 transition">
              <X size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-1 md:py-2">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-16 items-start">
          
          {/* Left: Image Gallery */}
          <div className="w-full md:w-1/2 md:sticky md:top-24">
            <div
              className="relative bg-[#F9F9F9] rounded-3xl overflow-hidden border border-gray-100 shadow-sm group cursor-crosshair min-h-[300px] md:min-h-[500px] flex items-center justify-center"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setZoomed(false)}
              onClick={() => isMobile && !isVideoUrl(images[activeImg]) && setFullScreenZoom(true)}
            >
              {isVideoUrl(images[activeImg]) ? (
                <video
                  src={images[activeImg]} controls autoPlay loop muted playsInline
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <img
                  src={images[activeImg]} alt={part.name}
                  className={`w-full h-full object-contain p-2 transition-transform duration-500 ease-out ${zoomed && !isMobile ? "scale-[2]" : "scale-100"}`}
                  style={zoomed && !isMobile ? { transformOrigin: `${mousePos.x}% ${mousePos.y}%` } : {}}
                />
              )}

              {/* Status Badge Overlays */}
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                {part.isFeatured && (
                  <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-lg shadow-lg tracking-widest uppercase">
                    Premium
                  </span>
                )}
                {discount > 0 && (
                  <span className="bg-black text-white text-[10px] font-black px-3 py-1 rounded-lg shadow-lg tracking-widest">
                    {discount}% OFF
                  </span>
                )}
              </div>

              {/* Floating Action Buttons */}
              {!isVideoUrl(images[activeImg]) && (
                <button
                  onClick={(e) => { e.stopPropagation(); setZoomed(!zoomed); }}
                  className="hidden md:flex absolute bottom-6 right-6 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl hover:bg-white transition-all transform hover:scale-110"
                >
                  {zoomed ? <ZoomOut size={20} className="text-gray-900" /> : <ZoomIn size={20} className="text-gray-900" />}
                </button>
              )}
              {isMobile && !isVideoUrl(images[activeImg]) && (
                <button
                  onClick={() => setFullScreenZoom(true)}
                  className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl transition-all"
                >
                  <Maximize2 size={20} className="text-gray-900" />
                </button>
              )}

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveImg((activeImg - 1 + images.length) % images.length); }}
                    className="pointer-events-auto bg-white/90 p-3 rounded-full shadow-lg hover:bg-white transition transform hover:scale-110 active:scale-95"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveImg((activeImg + 1) % images.length); }}
                    className="pointer-events-auto bg-white/90 p-3 rounded-full shadow-lg hover:bg-white transition transform hover:scale-110 active:scale-95"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}

              {/* Sold Out Overlay */}
              {effectiveStock === 0 && !isCheckingPincode && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
                  <div className="bg-red-600 text-white font-black px-8 py-3 rounded-2xl shadow-2xl transform -rotate-12 scale-110 border-4 border-white text-center">
                    {selectedPincode.length === 6 && isUnavailable ? 'NOT AVAILABLE' : 'OUT OF STOCK'}
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {images.length > 1 && (
              <div className="flex gap-4 mt-6 overflow-x-auto pb-4 hide-scrollbar snap-x">
                {images.map((img, i) => (
                  <button
                    key={i} onClick={() => setActiveImg(i)}
                    className={`shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all snap-start ${activeImg === i ? 'border-red-600 shadow-md ring-4 ring-red-50' : 'border-transparent bg-gray-50 opacity-60 hover:opacity-100'}`}
                  >
                    {isVideoUrl(img) ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-900 relative">
                        <Play size={20} className="text-white fill-white" />
                      </div>
                    ) : (
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details */}
          <div className="w-full md:w-1/2 flex flex-col pt-4 md:pt-0">
            
            {/* Header: Actions */}
            <div className="flex items-center justify-between mb-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                {part.name}
              </h1>
              <div className="flex gap-3">
                <button
                  onClick={() => toggleWishlist?.(id)}
                  className={`p-2.5 rounded-full border transition-all ${isWishlisted ? 'bg-red-600 border-red-600 text-white shadow-lg' : 'bg-white border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200'}`}
                >
                  <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
                </button>
              </div>
            </div>
            <div className="text-gray-500 font-medium mb-3">{part.brand || 'Original Equipment'}</div>

            {/* Ratings Section */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className={i < Math.floor(part.ratings || 4.5) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
                ))}
              </div>
              <span className="text-sm text-gray-400 font-medium ml-1">({part.numReviews || 12} Reviews)</span>
            </div>

            {/* Pricing Section */}
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-gray-900">
                  ₹{effectivePrice?.toLocaleString('en-IN')}
                </span>
                {effectiveOriginal > effectivePrice && (
                  <span className="text-lg text-gray-400 line-through font-medium">MRP: ₹{effectiveOriginal?.toLocaleString('en-IN')}</span>
                )}
              </div>
              {effectiveOriginal > effectivePrice && (
                 <div className="mt-1">
                   <span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded">
                     SAVE ₹{(effectiveOriginal - effectivePrice).toLocaleString('en-IN')} ({discount}% OFF)
                   </span>
                 </div>
              )}
            </div>

            {/* Pincode Check */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Pincode <span className="text-red-500">*</span>:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={selectedPincode}
                  onChange={(e) => handlePincodeChange(e.target.value)}
                  placeholder="Enter Pincode"
                  maxLength={6}
                  className="w-full h-12 bg-white border border-gray-300 rounded-lg px-4 font-medium transition-all focus:outline-none focus:border-emerald-500"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                   {selectedPincode.length === 6 && (
                     !isUnavailable ? <div className="p-1 bg-emerald-500 rounded-full text-white"><Check size={14} /></div> : <AlertCircle size={20} className="text-red-500" />
                   )}
                </div>
              </div>
              
              {/* Feedback messages */}
              <div className="mt-2 text-xs space-y-1">
                {selectedPincode.length === 6 && !isUnavailable && (
                  <>
                    <p className="text-gray-900 font-medium">Location: <span className="text-gray-500">{pincodeRule?.location || 'Your Area'}</span></p>
                    <p className="text-emerald-600 font-bold">Availability: <span className="font-bold">Available (Qty {effectiveStock})</span></p>
                    {part.pincodePricing?.length > 0 && (
                      <p className="text-gray-400">Available Locations: {Array.from(new Set(part.pincodePricing.map(p => p.location))).filter(Boolean).slice(0, 5).join(', ')}</p>
                    )}
                  </>
                )}
                {isUnavailable && <p className="text-red-500 font-bold uppercase tracking-tight">Service unavailable for this Pincode</p>}
                {isCheckingPincode && <p className="text-amber-600 font-medium flex items-center gap-1"><Clock size={12} className="animate-spin" /> Checking service...</p>}
              </div>
            </div>

            {/* Pack Size / Variants */}
            {availableSizes.length > 0 && (
              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-tight">
                  Select Pack Size:
                </label>
                <div className="flex flex-wrap gap-3">
                  {availableSizes.map((variant, index) => {
                    const isSelected = selectedSize && normalizeSize(selectedSize.size) === normalizeSize(variant.size);
                    const oos = variant.inventory <= 0 && !isCheckingPincode;
                    
                    return (
                      <button
                        key={index}
                        disabled={oos}
                        onClick={() => { userPickedSize.current = true; setSelectedSize(variant); }}
                        className={`h-11 px-8 rounded-lg border font-bold text-sm transition-all ${isSelected ? 'bg-gray-900 border-gray-900 text-white' : 'bg-white border-gray-300 text-gray-900 hover:border-gray-900'} ${oos ? 'opacity-40 cursor-not-allowed grayscale' : ''}`}
                      >
                        {variant.size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-8">
               <h4 className="text-sm font-bold text-gray-900 mb-2">
                 Description:
               </h4>
               <p className="text-gray-500 text-sm leading-relaxed">
                 {part.description}
               </p>
            </div>

            {/* CTA Action Bar */}
            <div className="mb-12">
              {cartItem ? (
                <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <button 
                    onClick={() => updateQty(id, cartItem.quantity - 1)}
                    className="w-12 h-12 flex items-center justify-center bg-gray-900 text-white rounded-xl font-bold text-xl hover:bg-gray-800 transition"
                  >-</button>
                  <div className="flex-1 text-center">
                    <span className="text-sm font-black text-gray-400 uppercase tracking-widest block mb-1">Quantity in Cart</span>
                    <span className="text-2xl font-black text-gray-900">{cartItem.quantity}</span>
                  </div>
                  <button 
                    onClick={() => updateQty(id, cartItem.quantity + 1)}
                    className="w-12 h-12 flex items-center justify-center bg-gray-900 text-white rounded-xl font-bold text-xl hover:bg-gray-800 transition"
                  >+</button>
                </div>
              ) : (
                <button
                  disabled={isUnavailable || effectiveStock === 0}
                  onClick={handleAddToCart}
                  className={`w-full h-14 font-bold text-lg rounded-lg transition-all flex items-center justify-center gap-2 ${isUnavailable || effectiveStock === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#E53935] hover:bg-[#C62828] text-white shadow-lg'}`}
                >
                  <ShoppingCart size={20} /> Add to Cart
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {similar.length > 0 && (
          <div className="mt-20 mb-20 border-t border-gray-100 pt-16">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Recommended Items</h3>
              <Link to="/parts" className="text-emerald-600 font-bold text-sm hover:underline">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-8">
              {similar.map(p => <PartCard key={p._id || p.id} part={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

