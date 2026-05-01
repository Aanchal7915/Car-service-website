import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, Settings, MapPin, Search, Sparkles, ArrowRight } from 'lucide-react';
import { PageLoader } from '../components/common/LoadingSpinner';
import { getRentalCars } from '../api/rentalApi';

const TRANSMISSIONS = ['', 'manual', 'automatic'];
const FUELS = ['', 'petrol', 'diesel', 'electric', 'hybrid', 'cng'];

function RentalCard({ car, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
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
        boxShadow: hovered ? '0 30px 60px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(30, 58, 138, 0.1)' : '0 10px 30px rgba(0,0,0,0.04)',
        transform: hovered ? 'translateY(-12px)' : 'translateY(0)',
        transition: 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
        height: '100%',
      }}
    >
      {/* Image Section */}
      <div style={{ position: 'relative', height: '180px', background: '#F5F5F5', overflow: 'hidden' }}>
        {car.images?.[0] ? (
          <img
            src={car.images[0]}
            alt={car.title}
            style={{
              width: '100%', height: '100%', objectFit: 'contain', padding: '1.2rem',
              transform: hovered ? 'scale(1.1) translateY(-8px)' : 'scale(1)',
              transition: 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CBD5E1' }}>
            <Calendar size={40} />
          </div>
        )}

        {car.status === 'rented' && (
          <div style={{ position: 'absolute', top: 12, right: 12, background: '#EF4444', color: 'white', padding: '4px 14px', borderRadius: '30px', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase' }}>BOOKED</div>
        )}
        {car.isFeatured && car.status === 'available' && (
          <div style={{ position: 'absolute', top: 12, left: 12, background: '#F59E0B', color: 'white', padding: '4px 14px', borderRadius: '30px', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase' }}>FEATURED</div>
        )}
      </div>

      {/* Content Section */}
      <div style={{ padding: '0.75rem', flex: 1, display: 'flex', flexDirection: 'column', background: '#FFFFFF', borderTop: '1px solid #EEE' }}>
        {/* Metadata Row */}
        <div style={{ marginBottom: '0.3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <span style={{ color: '#1E3A8A', fontSize: '0.6rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '2px', fontFamily: 'Rajdhani, sans-serif' }}>
              <Calendar size={11} /> {car.year}
            </span>
            <span style={{ color: '#64748B', fontSize: '0.65rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '2px', fontFamily: 'Rajdhani, sans-serif' }}>
              <Settings size={11} /> {car.transmission?.toUpperCase()}
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
          {car.brand} {car.model}
        </h3>

        {/* Subtitle */}
        <p style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem' }}>
          {car.fuelType?.toUpperCase()} • {car.seats} SEATS
        </p>

        {/* Location */}
        {car.location?.city && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '0.4rem', color: '#94A3B8', fontSize: '0.65rem', fontWeight: 600 }}>
            <MapPin size={10} /> {car.location.city}
          </div>
        )}

        {/* Price + Action */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
            <span className="product-card-price" style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.05rem', fontWeight: 950, color: '#1E3A8A', lineHeight: 1 }}>
              ₹{car.pricePerDay?.toLocaleString('en-IN')}
            </span>
            <span style={{ color: '#64748B', fontSize: '0.6rem', fontWeight: 800 }}>/day</span>
          </div>
          <div className="product-card-btn" style={{
            height: '28px', padding: '0 0.75rem',
            background: '#1E3A8A', borderRadius: '6px', color: 'white',
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            fontSize: '0.65rem', fontWeight: 800, fontFamily: 'Rajdhani, sans-serif',
            letterSpacing: '0.05em', boxShadow: '0 4px 10px rgba(30, 58, 138, 0.15)',
            transition: 'all 0.3s'
          }}>
            RENT NOW <ArrowRight size={12} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Rentals() {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '', transmission: '', fuelType: '', minPrice: '', maxPrice: '', sort: 'newest',
  });

  const fetchCars = () => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    getRentalCars(params)
      .then(({ data }) => setCars(data.cars || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCars(); }, []);

  const onFilter = (e) => {
    e?.preventDefault();
    fetchCars();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF' }}>
      <style>{`
        @media (max-width: 640px) {
          .rentals-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 0.6rem !important; }
        }
        @media (max-width: 400px) {
          .rentals-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)', padding: '4rem 1rem 5rem', color: 'white' }}>
        <div className="max-w-6xl mx-auto">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '1.2rem' }}>
            <Sparkles size={14} /> SELF-DRIVE RENTALS
          </div>
          <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 'clamp(2.4rem, 6vw, 4rem)', fontWeight: 950, lineHeight: 1, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
            RENT A CAR <span style={{ color: '#93C5FD' }}>YOUR WAY</span>
          </h1>
          <p style={{ color: '#CBD5E1', fontSize: '1.1rem', maxWidth: '560px', fontWeight: 500 }}>
            From compact hatchbacks to luxury SUVs — reserve in minutes, drive worry-free, pay by the day.
          </p>

          {/* Search Bar */}
          <form onSubmit={onFilter} style={{ marginTop: '2rem', background: 'white', borderRadius: '18px', padding: '0.6rem', display: 'flex', gap: '0.5rem', maxWidth: '720px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', minWidth: '200px' }}>
              <Search size={18} style={{ color: '#1E3A8A' }} />
              <input
                placeholder="Search by brand or model..."
                value={filters.search}
                onChange={e => setFilters({ ...filters, search: e.target.value })}
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}
              />
            </div>
            <button type="submit" style={{ background: '#1E3A8A', color: 'white', border: 'none', borderRadius: '12px', padding: '0.7rem 1.6rem', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              SEARCH <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.6rem' }}>
          <select className="input-light" value={filters.transmission} onChange={e => setFilters({ ...filters, transmission: e.target.value })} style={{ height: '46px', fontSize: '0.78rem' }}>
            {TRANSMISSIONS.map(t => <option key={t} value={t}>{t ? t.toUpperCase() : 'ANY TRANSMISSION'}</option>)}
          </select>
          <select className="input-light" value={filters.fuelType} onChange={e => setFilters({ ...filters, fuelType: e.target.value })} style={{ height: '46px', fontSize: '0.78rem' }}>
            {FUELS.map(f => <option key={f} value={f}>{f ? f.toUpperCase() : 'ANY FUEL'}</option>)}
          </select>
          <input className="input-light" placeholder="Min ₹/day" type="number" value={filters.minPrice} onChange={e => setFilters({ ...filters, minPrice: e.target.value })} style={{ height: '46px', fontSize: '0.78rem' }} />
          <input className="input-light" placeholder="Max ₹/day" type="number" value={filters.maxPrice} onChange={e => setFilters({ ...filters, maxPrice: e.target.value })} style={{ height: '46px', fontSize: '0.78rem' }} />
          <select className="input-light" value={filters.sort} onChange={e => setFilters({ ...filters, sort: e.target.value })} style={{ height: '46px', fontSize: '0.78rem' }}>
            <option value="newest">NEWEST</option>
            <option value="price_asc">PRICE: LOW TO HIGH</option>
            <option value="price_desc">PRICE: HIGH TO LOW</option>
            <option value="popular">POPULAR</option>
          </select>
          <button onClick={onFilter} className="btn-primary" style={{ background: '#0F172A', color: 'white', borderRadius: '10px', height: '46px', fontWeight: 800, border: 'none', cursor: 'pointer', fontSize: '0.78rem' }}>APPLY</button>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        {loading ? <PageLoader /> : cars.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#F9F9F9', borderRadius: '24px', border: '1.5px dashed #EEE' }}>
            <Calendar size={48} style={{ color: '#CBD5E1', margin: '0 auto 1rem' }} />
            <p style={{ color: '#64748B', fontWeight: 700 }}>No rental cars match your filters</p>
          </div>
        ) : (
          <div className="rentals-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {cars.map(car => (
              <RentalCard key={car._id} car={car} onClick={() => navigate(`/rentals/${car._id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
