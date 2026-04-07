import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Clock, MapPin, Star, Zap, Wrench, ShoppingBag, TrendingUp } from 'lucide-react';
import { getFeaturedBikes } from '../api/bikeApi';
import { getParts, getBestsellerParts } from '../api/storeApi';
import BikeCard from '../components/bikes/BikeCard';
import PartCard from '../components/parts/PartCard';
import { PageLoader } from '../components/common/LoadingSpinner';
import heroBike from '../assets/hero-bike.png';
import heroBikeMobile from '../assets/hero-bike (2).png';
import instantQuote from '../assets/instant-quote.png';

const heroSlides = [
  { title: 'Buy & Sell Bikes', sub: 'Trusted Marketplace', desc: 'Find your perfect ride from thousands of new & used bikes across India.', cta: 'Explore Bikes', href: '/bikes', accent: '#E53935' },
  { title: 'Instant Service', sub: '1-Hour Repair Promise', desc: 'Professional mechanics at your doorstep. Pickup & drop available.', cta: 'Book Service', href: '/services', accent: '#FB8C00' },
  { title: 'Sell in 1 Hour', sub: 'Best Price Guaranteed', desc: 'Get instant valuation and sell your bike the same day.', cta: 'Sell Now', href: '/sell', accent: '#2E7D32' },
];

const stats = [
  { value: '50K+', label: 'Bikes Sold', icon: TrendingUp },
  { value: '1 Hr', label: 'Service Promise', icon: Clock },
  { value: '4.8★', label: 'Average Rating', icon: Star },
  { value: '100+', label: 'Cities Covered', icon: MapPin },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [featuredParts, setFeaturedParts] = useState([]);
  const [bestsellerParts, setBestsellerParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [partsLoading, setPartsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    Promise.all([
      getFeaturedBikes().then(({ data }) => setFeatured(data.bikes)),
      getParts({ limit: 4, sort: '-createdAt' }).then(({ data }) => setFeaturedParts(data.parts || [])),
      getBestsellerParts({ limit: 4 }).then(({ data }) => setBestsellerParts(data.parts || []))
    ])
      .catch(() => {})
      .finally(() => {
        setLoading(false);
        setPartsLoading(false);
      });

    const timer = setInterval(() => setCurrentSlide((s) => (s + 1) % heroSlides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = heroSlides[currentSlide];

  return (
    <div style={{ background: '#000' }}>
      <style>{`
        @media (max-width: 768px) {
          .hero-split { min-height: auto !important; }
          .hero-split > div:first-child > div { padding: 1rem !important; padding-top: 0.5rem !important; }
          .hero-split > div:first-child > div h1 { font-size: 1.5rem !important; }
          .hero-split > div:first-child > div p { font-size: 0.75rem !important; }
          .hero-split .hero-right { min-height: 180px !important; max-height: 220px !important; }
        }
        @media (max-width: 640px) {
          section { padding: 2rem 0 !important; }
          section h2 { font-size: 1.3rem !important; }
          section p { font-size: 0.8rem !important; }
          .hero-extra-desc { margin-bottom: 1rem !important; font-size: 0.75rem !important; }
          .home-hero-stats { gap: 0.6rem !important; font-size: 0.85rem !important; }
          .home-hero-stats > div > div:first-child { font-size: 0.9rem !important; }
          .home-hero-stats > div > div:last-child { font-size: 0.5rem !important; }
          .home-parts-grid, .home-bikes-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 0.6rem !important; }
        }
      `}</style>
      {/* HERO — Split layout: left content / right bike image */}
      <section className="hero-split" style={{ minHeight: '92vh', display: 'flex', position: 'relative', overflow: 'hidden' }}>
        <style>{`
          @media (max-width: 768px) {
            .hero-split { flex-direction: column !important; min-height: auto !important; }
            .hero-split > .hero-right { min-height: 200px !important; max-height: 240px !important; }
            .hero-split > .hero-right img { transform: translate(-5%, -30%) !important; max-height: 220px !important; }
          }
        `}</style>

        {/* ── LEFT: Black panel with content ── */}
        <div style={{ flex: '1 1 50%', background: '#000', display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
          {/* Red glow accent */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at 80% 50%, rgba(229,57,53,0.07) 0%, transparent 55%)' }} />

          <div style={{ position: 'relative', zIndex: 1, padding: '0px clamp(2rem, 5vw, 5.5rem) clamp(2rem, 5vw, 5.5rem)', paddingRight: 'clamp(1rem, 2vw, 2rem)', maxWidth: 800, paddingTop: '1.5rem' }}>

            {/* Eyebrow */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(229,57,53,0.1)', border: '1px solid rgba(229,57,53,0.25)', borderRadius: '999px', padding: '0.3rem 1rem', marginBottom: '1.5rem' }}>
              <Zap size={13} style={{ color: '#E53935' }} />
              <span style={{ color: '#E53935', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{slide.sub}</span>
            </div>

            {/* Brand + Title */}
            <p style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1rem', fontWeight: 600, color: '#555', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>MOTOXPRESS</p>
            <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 900, lineHeight: 1.05, marginBottom: '1rem' }}>
              <span style={{ color: '#E53935' }}>{slide.title.split(' ')[0]}</span>{' '}
              <span style={{ color: 'white' }}>{slide.title.split(' ').slice(1).join(' ')}</span>
            </h1>

            {/* Description */}
            <p style={{ color: '#999', fontSize: '0.95rem', marginBottom: '0.8rem', lineHeight: 1.75, maxWidth: 440 }}>
              {slide.desc}
            </p>

            {/* Extra content paragraph */}
            <p className="hero-extra-desc" style={{ color: '#666', fontSize: '0.85rem', lineHeight: 1.7, maxWidth: 420, marginBottom: '2rem' }}>
              Whether you're looking to upgrade your ride, sell your old bike at the best price, or need expert service — MotoXpress has you covered with doorstep pickup, certified mechanics, and same-day payment.
            </p>

            {/* CTA Buttons — both restored */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.2rem' }}>
              <Link to={slide.href} style={{
                background: '#E53935', color: 'white', padding: '0.6rem 1.5rem', borderRadius: '6px',
                textDecoration: 'none', fontWeight: 700, fontSize: '0.82rem',
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s',
                boxShadow: '0 4px 20px rgba(229,57,53,0.35)',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#C62828'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#E53935'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                {slide.cta} <ArrowRight size={16} />
              </Link>
              <Link to="/services" style={{
                background: 'transparent', color: 'white', padding: '0.6rem 1.5rem', borderRadius: '6px',
                textDecoration: 'none', fontWeight: 600, fontSize: '0.82rem',
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                border: '1.5px solid rgba(255,255,255,0.2)', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#E53935'; e.currentTarget.style.color = '#E53935'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'white'; }}>
                Book Service
              </Link>
            </div>

            {/* Stats row */}
            <div className="home-hero-stats" style={{ display: 'flex', gap: '1.2rem', flexWrap: 'nowrap', paddingTop: '0.8rem', borderTop: '1px solid #1A1A1A' }}>
              {stats.map(({ value, label }) => (
                <div key={label} style={{ flex: '1 1 0' }}>
                  <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.1rem', fontWeight: 900, color: '#E53935', lineHeight: 1 }}>{value}</div>
                  <div style={{ color: '#555', fontSize: '0.6rem', marginTop: '0.15rem', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Slide dots */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.8rem' }}>
              {heroSlides.map((_, i) => (
                <button key={i} onClick={() => setCurrentSlide(i)}
                  style={{ width: i === currentSlide ? 28 : 8, height: 8, borderRadius: 4, background: i === currentSlide ? '#E53935' : '#333', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }} />
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Dark gray panel with bike image ── */}
        <div className="hero-right" style={{ flex: '1 1 50%', background: '#000', position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflow: 'hidden', paddingTop: '0px' }}>


          {/* Decorative background circle */}
          <div style={{ position: 'absolute', width: '120%', height: '120%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(229,57,53,0.05) 0%, transparent 70%)', zIndex: 0 }} />

          {/* Bike image wrapper with floating animation */}
          <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
            <picture>
              <source media="(max-width: 768px)" srcSet={heroBikeMobile} />
              <img
                src={heroBike}
                alt="Hero Bike"
                style={{
                  background:"black",
                  maxWidth: '115%',
                  maxHeight: '95%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.6))',
                  transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  animation: 'float 6s ease-in-out infinite',
                  transform: 'translate(-5%, -80%)',
                  objectPosition: 'top'
                }}
                onMouseEnter={e => e.target.style.transform = 'scale(1.08) rotate(-2deg)'}
                onMouseLeave={e => e.target.style.transform = 'scale(1) rotate(0deg)'}
              />
            </picture>
            {/* Pulsing glow under image */}
            <div style={{ position: 'absolute', bottom: '20%', width: '60%', height: '20px', background: 'rgba(229,57,53,0.15)', borderRadius: '50%', filter: 'blur(20px)', animation: 'pulse 4s infinite' }} />
          </div>

          <style>{`
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-20px); }
            }
            @keyframes pulse {
              0%, 100% { opacity: 0.3; transform: scale(1); }
              50% { opacity: 0.6; transform: scale(1.2); }
            }
          `}</style>

          {/* Bottom fade */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, background: 'linear-gradient(to top, #000, transparent)', pointerEvents: 'none' }} />
          {/* Top fade */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(to bottom, #000, transparent)', pointerEvents: 'none' }} />
        </div>
      </section>

      {/* BUY BIKES section — Hide if empty (after loading) */}
      {(loading || featured.length > 0) && (
        <section style={{ background: '#F5F5F5', padding: '5rem 0' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2.3rem', fontWeight: 800, color: '#111' }}>
                  Buy <span className="gradient-text">Bikes</span>
                </h2>
                <p style={{ color: '#555', marginTop: '0.3rem' }}>Handpicked deals you'll love</p>
              </div>
              <Link to="/bikes" className="btn-outline-dark" style={{ padding: '0.6rem 1.4rem', fontSize: '0.9rem' }}>
                View All <ArrowRight size={16} />
              </Link>
            </div>

            {loading ? (
              <div className="home-bikes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="card-dark" style={{ height: 320 }}>
                    <div className="skeleton" style={{ height: 200 }} />
                    <div style={{ padding: '1rem' }}>
                      <div className="skeleton" style={{ height: 18, width: '60%', marginBottom: '0.5rem' }} />
                      <div className="skeleton" style={{ height: 14, width: '40%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="home-bikes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
                {featured.map((bike) => <BikeCard key={bike._id} bike={bike} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* SERVICE CATEGORIES */}
      <section style={{ background: '#FFFFFF', padding: '6rem 0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ color: '#E53935', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Professional Care</p>
              <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2.8rem', fontWeight: 900, color: '#111', lineHeight: 1.1 }}>
                Our Expert <span style={{ color: '#E53935' }}>Services</span>
              </h2>
            </div>
            <Link to="/services" style={{ 
              background: '#000', 
              color: 'white', 
              padding: '0.75rem 2rem', 
              fontSize: '0.9rem', 
              fontWeight: 700, 
              borderRadius: '8px', 
              textDecoration: 'none', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.6rem', 
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#222'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#000'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              Explore All <ArrowRight size={17} />
            </Link>
          </div>

          <div className="home-services-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
            {[
              { label: 'General Service', desc: 'Full oil change, filter cleaning, and chain lubrication.', href: '/services?type=regular_service' },
              { label: 'Engine Repair', desc: 'Expert engine heath check and fine-tuning.', href: '/services?type=engine_repair' },
              { label: 'Puncture Fix', desc: 'Instant doorstep tire repair for all bike types.', href: '/services?type=puncture' },
              { label: 'Electricals', desc: 'Battery health, wiring fix, and bulb replacements.', href: '/services?type=battery' },
              { label: 'Brake Fix', desc: 'Specialized pad change and fluid flushing.', href: '/services?type=brake' },
              { label: 'Bike Wash', desc: 'Multi-layer foam wash and premium wax polish.', href: '/services?type=washing' },
            ].map(({ label, desc, href }) => (
              <div key={label} style={{ 
                background: 'white', 
                border: '1px solid #F0F0F0',
                borderLeft: '4px solid #E53935',
                borderRadius: '10px', 
                padding: '1.2rem', 
                textAlign: 'left', 
                boxShadow: '0 4px 15px rgba(0,0,0,0.02)', 
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 12px 25px rgba(229,57,53,0.08)'; e.currentTarget.style.background = '#000'; e.currentTarget.querySelector('h3').style.color = '#fff'; e.currentTarget.querySelector('p').style.color = '#aaa'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.02)'; e.currentTarget.style.background = '#fff'; e.currentTarget.querySelector('h3').style.color = '#111'; e.currentTarget.querySelector('p').style.color = '#666'; }}>
                <div>
                  <h3 style={{ color: '#111', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.5rem', fontFamily: 'Rajdhani, sans-serif' }}>{label}</h3>
                  <p style={{ color: '#666', fontSize: '0.75rem', lineHeight: 1.5, marginBottom: '1.2rem' }}>{desc}</p>
                </div>
                <Link to="/contact" style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  background: '#E53935', color: 'white', 
                  padding: '0.5rem 1rem', borderRadius: '4px', 
                  fontSize: '0.72rem', fontWeight: 700, textDecoration: 'none',
                  transition: 'all 0.2s', width: 'fit-content'
                }}>
                  Book Now <ArrowRight size={13} />
                </Link>
              </div>
            ))}
          </div>
          <style>{`
            @media (min-width: 1024px) {
              .home-why-grid { grid-template-columns: repeat(6, 1fr) !important; gap: 0.8rem !important; }
            }
            @media (max-width: 768px) {
              .home-why-grid, .home-services-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 0.6rem !important; }
            }
            @media (max-width: 480px) {
              .home-why-grid, .home-services-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 0.5rem !important; }
            }
          `}</style>
        </div>
      </section>

      {/* FEATURED PRODUCTS section — Hide if empty (after loading) */}
      {(partsLoading || featuredParts.length > 0) && (
        <section style={{ background: '#FFFFFF', padding: '5rem 0' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <p style={{ color: '#E53935', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Premium Selection</p>
                <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2.3rem', fontWeight: 800, color: '#111' }}>
                  Featured <span className="gradient-text">Products</span>
                </h2>
                <p style={{ color: '#555', marginTop: '0.3rem' }}>High-quality components for every ride</p>
              </div>
              <Link to="/parts" style={{ 
                background: '#000', color: 'white', padding: '0.6rem 1.4rem', 
                fontSize: '0.9rem', borderRadius: '6px', textDecoration: 'none',
                fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.5rem'
              }}>
                View All Parts <ArrowRight size={16} />
              </Link>
            </div>

            {partsLoading ? (
              <div className="home-parts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 300, background: '#eee' }} />
                ))}
              </div>
            ) : (
              <div className="home-parts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
                {featuredParts.map((part) => <PartCard key={part._id} part={part} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* BESTSELLER PRODUCTS section — Hide if empty (after loading) */}
      {(partsLoading || bestsellerParts.length > 0) && (
        <section style={{ background: '#F9F9F9', padding: '5rem 0' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <p style={{ color: '#E53935', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Most Popular</p>
                <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2.3rem', fontWeight: 800, color: '#111' }}>
                  Bestseller <span className="gradient-text">Products</span>
                </h2>
                <p style={{ color: '#555', marginTop: '0.3rem' }}>Our most trusted items by riders</p>
              </div>
              <Link to="/parts" style={{ 
                background: '#000', color: 'white', padding: '0.6rem 1.4rem', 
                fontSize: '0.9rem', borderRadius: '6px', textDecoration: 'none',
                fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.5rem'
              }}>
                View All <ArrowRight size={16} />
              </Link>
            </div>

            {partsLoading ? (
              <div className="home-parts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 300, background: '#eee' }} />
                ))}
              </div>
            ) : (
              <div className="home-parts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
                {bestsellerParts.map((part) => <PartCard key={part._id} part={part} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* WHY CHOOSE US */}
      <section style={{ background: '#F5F5F5', padding: '5rem 0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2.5rem', fontWeight: 800, color: '#111111' }}>Why <span className="gradient-text">MotoXpress?</span></h2>
            <p style={{ color: '#555', marginTop: '0.5rem' }}>India's most trusted bike platform</p>
          </div>
          <div className="home-why-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
            {[
              { title: 'Instant Quote', desc: 'Get a free, instant valuation for your bike in seconds with our AI engine.', image: instantQuote },
              { title: 'Schedule Inspection', desc: 'Choose a time and our expert mechanics will visit your doorstep for a full inspection.', image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=400&auto=format&fit=crop' },
              { title: 'Money Transfer', desc: 'Receive secure, instant payment directly to your bank account within 60 minutes.', image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=400&auto=format&fit=crop' },
              { title: '1-Hour Service', desc: 'Expert mechanics arrive at your location within 60 minutes for doorstep service.', image: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?q=80&w=400&auto=format&fit=crop' },
              { title: 'Verified Sellers', desc: 'All bikes go through a rigorous 150-point check by experts before listing.', image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=400&auto=format&fit=crop' },
              { title: 'Doorstep Help', desc: 'Enjoy free pickup and drop for all your bike needs from the comfort of home.', image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=400&auto=format&fit=crop' },
            ].map(({ title, desc, image }) => (
              <div key={title} style={{ background: 'white', overflow: 'hidden', borderRadius: '12px', border: '1px solid #EAEAEA', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', transition: 'all 0.4s' }}
                   onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(229,57,53,0.08)'; }}
                   onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.02)'; }}>
                <div style={{ height: '110px', width: '100%', overflow: 'hidden' }}>
                  <img src={image} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                       onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1449491073997-d0ce9a901507?q=65&w=400&auto=format&fit=crop'; }} />
                </div>
                <div style={{ padding: '0.8rem 0.7rem', textAlign: 'left' }}>
                  <h3 style={{ color: '#111', fontWeight: 800, fontSize: '0.88rem', marginBottom: '0.3rem', fontFamily: 'Rajdhani, sans-serif' }}>{title}</h3>
                  <p style={{ color: '#777', fontSize: '0.7rem', lineHeight: 1.4 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{
        background: 'linear-gradient(135deg, #C62828 0%, #E53935 50%, #FF5252 100%)',
        padding: '4rem 0', textAlign: 'center',
      }}>
        <div className="max-w-4xl mx-auto px-4">
          <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2.8rem', fontWeight: 800, color: 'white', marginBottom: '1rem' }}>
            Sell Your Bike in Just 1 Hour
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', marginBottom: '2rem' }}>
            Get instant valuation, schedule pickup, and receive payment — all within 60 minutes.
          </p>
          <Link to="/sell" style={{
            background: 'white', color: '#E53935', padding: '0.9rem 2.5rem',
            borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '1rem',
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            transition: 'all 0.2s',
          }}>
            Sell My Bike Now <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
