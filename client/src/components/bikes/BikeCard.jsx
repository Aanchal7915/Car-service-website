import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Calendar, Gauge, MapPin, Star, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toggleWishlist as toggleWishlistApi } from '../../api/authApi';
import toast from 'react-hot-toast';

export default function BikeCard({ bike, hideBadges = false }) {
  const { wishlist = [], toggleWishlist } = useAuth();
  const isWishlisted = Array.isArray(wishlist) && wishlist.includes(bike._id);
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
    if (!selectedPincode || !Array.isArray(bike.pincodePricing) || bike.pincodePricing.length === 0) return null;
    return bike.pincodePricing.find(p => p.pincode === selectedPincode.trim()) || null;
  }, [bike.pincodePricing, selectedPincode]);

  const effectivePrice = pincodeData ? Number(pincodeData.price) : (bike.discountedPrice || bike.price);
  const effectiveOriginalPrice = pincodeData?.originalPrice ? Number(pincodeData.originalPrice) : bike.price;
  const effectiveLocation = pincodeData?.location || bike.location?.city;

  const discount = effectiveOriginalPrice && effectiveOriginalPrice > effectivePrice
    ? Math.round(((effectiveOriginalPrice - effectivePrice) / effectiveOriginalPrice) * 100)
    : 0;

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(bike._id);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

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
      <Link to={`/bikes/${bike._id}`} style={{ textDecoration: 'none', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Top Image Section (Light background) */}
        <div style={{ position: 'relative', height: '180px', background: '#F5F5F5', overflow: 'hidden' }}>
          <img
            src={bike.images?.[0] || 'https://via.placeholder.com/400x300/F5F5F5/E53935?text=No+Image'}
            alt={bike.title}
            style={{
              width: '100%', height: '100%', objectFit: 'contain', padding: '1rem',
              transform: hovered ? 'scale(1.08)' : 'scale(1)',
              transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
          />
          
          {/* Top-right: Heart (Wishlist) */}
          <button
            onClick={handleWishlist}
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

          {/* Top-left: Type Badge */}
          <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: '0.5rem' }}>
            <span style={{
              background: bike.type === 'new' ? '#2E7D32' : '#111', color: 'white',
              fontSize: '0.65rem', fontWeight: 950,
              padding: '3px 12px', borderRadius: '30px',
              letterSpacing: '0.04em', textTransform: 'uppercase'
            }}>
              {bike.type === 'new' ? 'NEW' : 'USED'}
            </span>
          </div>

          {/* Discount Badge */}
          {discount > 0 && (
            <div style={{ position: 'absolute', bottom: 12, left: 12 }}>
              <span style={{
                background: '#E53935', color: 'white',
                fontSize: '0.65rem', fontWeight: 950,
                padding: '3px 10px', borderRadius: '6px',
                fontFamily: 'Rajdhani, sans-serif',
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
              }}>
                -{discount}% OFF
              </span>
            </div>
          )}
        </div>

        {/* Bottom Content Section */}
        <div style={{ padding: '0.75rem', flex: 1, display: 'flex', flexDirection: 'column', background: '#FFFFFF', borderTop: '1px solid #EEE' }}>
          {/* Metadata Row 1 */}
          <div style={{ marginBottom: '0.3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <span style={{ color: '#E53935', fontSize: '0.6rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '2px', fontFamily: 'Rajdhani, sans-serif' }}>
                 <Calendar size={10} /> {bike.year}
              </span>
              <span style={{ color: '#888', fontSize: '0.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '2px', fontFamily: 'Rajdhani, sans-serif' }}>
                 <Gauge size={10} /> {bike.kmDriven?.toLocaleString()} KM
              </span>
            </div>
          </div>

          {/* Title */}
          <h3 className="product-card-title" style={{
            color: '#111', fontWeight: 900, fontSize: '0.85rem',
            lineHeight: 1.2, marginBottom: '0.3rem',
            fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.02em',
            textTransform: 'uppercase',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>
            {bike.title || `${bike.brand} ${bike.model}`}
          </h3>

          {/* Subtitle/Brand */}
          <p style={{ color: '#888', fontSize: '0.7rem', fontWeight: 600, marginBottom: '0.3rem' }}>
            {bike.brand?.toUpperCase()} {bike.engineCC ? `• ${bike.engineCC}CC` : ''}
          </p>

          {/* Ratings Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '0.4rem' }}>
            <div style={{ display: 'flex', gap: '1px' }}>
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} size={9} fill="#FFB400" color="#FFB400" />
              ))}
            </div>
            <span style={{ color: '#AAA', fontSize: '0.65rem', fontWeight: 600, marginLeft: '2px' }}>
               ({bike.numReviews || 15})
            </span>
          </div>

          {/* Price row + Action */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
              <span className="product-card-price" style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.2rem', fontWeight: 950, color: '#E53935', lineHeight: 1 }}>
                ₹{effectivePrice?.toLocaleString('en-IN')}
              </span>
              {discount > 0 && (
                <span style={{ color: '#AAA', fontSize: '0.7rem', textDecoration: 'line-through', fontWeight: 600 }}>
                  ₹{effectiveOriginalPrice?.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            <div className="product-card-btn" style={{
              height: '28px', padding: '0 0.7rem',
              background: '#111', borderRadius: '6px', color: 'white',
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              fontSize: '0.65rem', fontWeight: 900, fontFamily: 'Rajdhani, sans-serif',
              letterSpacing: '0.04em', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}>
              DETAILS <ArrowRight size={12} />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
