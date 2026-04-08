import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ShoppingCart, Star, Heart } from 'lucide-react';

export default function PartCard({ part }) {
  const { items, addToCart, updateQty } = useCart();
  const cartItem = items.find(i => i._id === part._id);
  const { wishlist = [], toggleWishlist } = useAuth();
  const isWishlisted = Array.isArray(wishlist) && wishlist.includes(part._id);
  const [hovered, setHovered] = useState(false);

  const [selectedPincode, setSelectedPincode] = useState(
    () => localStorage.getItem('selectedPincode') || ''
  );

  useEffect(() => {
    const handlePincodeUpdate = () => {
      setSelectedPincode(localStorage.getItem('selectedPincode') || '');
    };
    window.addEventListener('pincode-updated', handlePincodeUpdate);
    return () => window.removeEventListener('pincode-updated', handlePincodeUpdate);
  }, []);

  const pincodeData = useMemo(() => {
    if (!selectedPincode || !Array.isArray(part.pincodePricing) || part.pincodePricing.length === 0) return null;
    return part.pincodePricing.find(p => p.pincode === selectedPincode.trim()) || null;
  }, [part.pincodePricing, selectedPincode]);

  const effectivePrice = pincodeData ? Number(pincodeData.price) : (part.discountedPrice || part.price);
  const effectiveOriginalPrice = pincodeData?.originalPrice ? Number(pincodeData.originalPrice) : part.price;
  const effectiveStock = pincodeData ? Number(pincodeData.inventory) : part.stock;
  const effectiveLocation = pincodeData?.location || null;

  const discount = effectiveOriginalPrice && effectiveOriginalPrice > effectivePrice
    ? Math.round(((effectiveOriginalPrice - effectivePrice) / effectiveOriginalPrice) * 100)
    : 0;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        borderRadius: '20px',
        overflow: 'hidden',
        background: '#FFF',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        boxShadow: hovered ? '0 20px 50px rgba(0,0,0,0.1), 0 0 0 1px #EEE' : '0 4px 15px rgba(0,0,0,0.05)',
        transform: hovered ? 'translateY(-8px)' : 'translateY(0)',
        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        height: '100%',
      }}
    >
      <Link to={`/parts/${part._id}`} style={{ textDecoration: 'none', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Top Image Section (Light background, rounded corners) */}
        <div style={{ position: 'relative', height: '180px', background: '#F5F5F5', overflow: 'hidden' }}>
          <img
            src={part.images?.[0] || 'https://via.placeholder.com/400x300/F5F5F5/E53935?text=No+Image'}
            alt={part.name}
            style={{
              width: '100%', height: '100%', objectFit: 'contain', padding: '1rem',
              transform: hovered ? 'scale(1.08)' : 'scale(1)',
              transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
          />
          
          {/* Top-right: Heart (Wishlist) */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(part._id); }}
            style={{
              position: 'absolute', top: 12, right: 12,
              width: 34, height: 34, borderRadius: '50%',
              background: isWishlisted ? '#E53935' : 'rgba(17,17,17,0.85)',
              border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', backdropFilter: 'blur(10px)',
              transform: isWishlisted ? 'scale(1.1)' : 'scale(1)',
              transition: 'all 0.25s',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 10
            }}
          >
            <Heart size={14} fill={isWishlisted ? 'white' : 'none'} color="white" />
          </button>

          {/* Top-left: Category/Status Placeholder (Already removed from logic) */}
          {part.condition === 'new' && (
            <div style={{ position: 'absolute', top: 12, left: 12 }}>
              <span style={{
                background: 'rgba(30,190,130,1)', color: 'white',
                fontSize: '0.65rem', fontWeight: 950,
                padding: '3px 12px', borderRadius: '30px',
                letterSpacing: '0.04em', textTransform: 'uppercase'
              }}>
                NEW
              </span>
            </div>
          )}
          {/* Out of stock overlay */}
          {effectiveStock === 0 && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(255,255,255,0.7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(1px)', zIndex: 5
            }}>
              <span style={{
                color: '#111', fontWeight: 950, fontSize: '0.8rem',
                letterSpacing: '0.15em', textTransform: 'uppercase',
                padding: '0.4rem 1.2rem', border: '2.5px solid #111',
                background: '#FFF', borderRadius: '10px',
              }}>SOLD OUT</span>
            </div>
          )}
        </div>

        {/* Bottom Content Section (White background) */}
        <div style={{ padding: '0.75rem', flex: 1, display: 'flex', flexDirection: 'column', background: '#FFFFFF', borderTop: '1px solid #EEE' }}>
          {/* Category & Status */}
          <div style={{ marginBottom: '0.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{
              fontSize: '0.65rem', color: '#E53935',
              textTransform: 'uppercase', fontWeight: 900,
              letterSpacing: '0.08em', fontFamily: 'Rajdhani, sans-serif'
            }}>
              {part.category?.replace('_', ' ')}
            </span>
          </div>

          {/* Name */}
          <h3 className="product-card-title" style={{
            color: '#111', fontWeight: 900, fontSize: '0.85rem',
            lineHeight: 1.2, marginBottom: '0.3rem',
            fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.02em',
            textTransform: 'uppercase',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>
            {part.name}
          </h3>

          {part.brand && (
            <p style={{ color: '#888', fontSize: '0.7rem', fontWeight: 600, marginBottom: '0.3rem' }}>
              {part.brand}
            </p>
          )}
          {/* Ratings Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '0.4rem' }}>
            <div style={{ display: 'flex', gap: '1px' }}>
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} size={9} fill="#FFB400" color="#FFB400" />
              ))}
            </div>
            <span style={{ color: '#AAA', fontSize: '0.65rem', fontWeight: 600, marginLeft: '2px' }}>
              ({part.numReviews || 12})
            </span>
          </div>

          {/* Price row + CTA */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
              <span className="product-card-price" style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.2rem', fontWeight: 950, color: '#E53935', lineHeight: 1 }}>
                ₹{effectivePrice?.toLocaleString('en-IN')}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {cartItem ? (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.6rem', 
                  background: '#F5F5F5', 
                  borderRadius: '6px', 
                  padding: '2px 6px',
                  border: '1px solid #EEE'
                }}>
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateQty(part._id, cartItem.quantity - 1); }}
                    style={{ 
                      width: 24, height: 24, borderRadius: '4px', border: 'none', 
                      background: '#111', color: 'white', display: 'flex', 
                      alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      fontSize: '1rem', fontWeight: 900
                    }}
                  >-</button>
                  <span style={{ fontSize: '0.85rem', fontWeight: 950, color: '#111', fontFamily: 'Rajdhani, sans-serif', minWidth: '15px', textAlign: 'center' }}>
                    {cartItem.quantity}
                  </span>
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateQty(part._id, cartItem.quantity + 1); }}
                    style={{ 
                      width: 24, height: 24, borderRadius: '4px', border: 'none', 
                      background: '#111', color: 'white', display: 'flex', 
                      alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      fontSize: '1rem', fontWeight: 900
                    }}
                  >+</button>
                </div>
              ) : (
                <button
                  className="product-card-btn"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart({ ...part, effectivePrice }); }}
                  disabled={effectiveStock === 0}
                  style={{
                    height: '28px',
                    padding: '0 0.7rem',
                    background: effectiveStock === 0 ? '#EEE' : '#111',
                    border: 'none', borderRadius: '6px', color: 'white',
                    cursor: effectiveStock === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: effectiveStock === 0 ? 'none' : '0 4px 10px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s',
                    gap: '0.3rem', fontWeight: 900, fontFamily: 'Rajdhani, sans-serif', fontSize: '0.65rem', letterSpacing: '0.04em'
                  }}
                >
                  <ShoppingCart size={13} /> ADD
                </button>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>

  );
}
