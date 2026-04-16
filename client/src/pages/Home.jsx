import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, MapPin, Star, Zap, Wrench, TrendingUp, Shield, CheckCircle, Settings, Sparkles, Droplets, Battery, CircleDot, PaintBucket, Disc } from 'lucide-react';
import { getFeaturedParts, getBestsellerParts } from '../api/storeApi';
import { getFeaturedBikes, getBestsellerBikes } from '../api/bikeApi';
import CarCard from '../components/bikes/BikeCard';
import PartCard from '../components/parts/PartCard';
import { getActiveServiceTypes } from '../api/serviceApi';
import { PageLoader } from '../components/common/LoadingSpinner';
import heroCar from '../assets/hero-car-premium.png';
import heroCarGT3 from '../assets/hero-car-gt3.png';
import heroCarGT3Reflection from '../assets/hero-car-gt3-reflection.jpg';
import instantQuote from '../assets/instant-quote.png';
import carMainImage from '../assets/hero_car_porsche.jpg';

const heroSlides = [
  { title: 'Buy & Sell Cars', sub: 'Premium Auto Marketplace', desc: 'Find your perfect luxury car from thousands of certified new & used vehicles across India.', cta: 'Explore Cars', href: '/bikes' },
  { title: 'Premium Service', sub: 'Excellence Guaranteed', desc: 'Expert car technicians at your doorstep. World-class maintenance for your luxury vehicle.', cta: 'Explore Parts', href: '/parts' },
  { title: 'Sell Instantly', sub: 'Maximum Value', desc: 'Get an instant valuation and sell your car at the best market price today.', cta: 'Sell Now', href: '/sell' },
];

const stats = [
  { value: '25K+', label: 'Cars Sold', icon: TrendingUp },
  { value: 'Elite', label: 'Service Quality', icon: Clock },
  { value: '4.9★', label: 'Client Satisfaction', icon: Star },
  { value: '150+', label: 'Hubs Nationwide', icon: MapPin },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [featuredParts, setFeaturedParts] = useState([]);
  const [bestsellerParts, setBestsellerParts] = useState([]);
  const [bestsellerBikes, setBestsellerBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [partsLoading, setPartsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const carRef = useRef(null);
  const heroRef = useRef(null);

  // Scroll-linked car rotation — based on hero section visibility only
  useEffect(() => {
    const handleScroll = () => {
      if (!carRef.current || !heroRef.current) return;
      const heroRect = heroRef.current.getBoundingClientRect();
      const heroHeight = heroRect.height;
      // How far the hero has scrolled up: 0 = top of page, heroHeight = fully gone
      const scrolled = Math.max(0, -heroRect.top);
      const progress = Math.min(scrolled / heroHeight, 1);
      // Rotate from 0° to -30° (right to left) as hero scrolls out
      const rotation = progress * -30;
      carRef.current.style.transform = `perspective(800px) rotateY(${rotation}deg)`;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // run once on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    Promise.all([
      getFeaturedBikes().then(({ data }) => setFeatured(data.bikes)),
      getBestsellerBikes().then(({ data }) => setBestsellerBikes(data.bikes || [])),
      getActiveServiceTypes().then(({ data }) => setServiceTypes(data.serviceTypes || []))
    ])
      .catch(() => { })
      .finally(() => {
        setLoading(false);
        setPartsLoading(false);
        setServicesLoading(false);
      });

    const timer = setInterval(() => setCurrentSlide((s) => (s + 1) % heroSlides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = heroSlides[currentSlide];

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF' }}>
      {/* ════════════ HERO SECTION ════════════ */}
      <section ref={heroRef} className="hero-section" style={{ position: 'relative', overflow: 'hidden', background: '#0F172A', minHeight: '88vh' }}>
        <style>{`
          @media (max-width: 1024px) {
            .hero-car-image { width: 400px !important; }
          }
          @media (max-width: 768px) {
            .hero-section-inner { flex-direction: column !important; min-height: auto !important; padding-top: 1rem !important; }
            .hero-left { padding: 1.25rem 1rem !important; max-width: 100% !important; }
            .hero-left h1 { font-size: 1.6rem !important; }
            .hero-left .hero-desc { font-size: 0.78rem !important; }
            .hero-car-wrap { min-height: 140px !important; margin-top: 0.5rem !important; flex: 0 0 auto !important; width: 100% !important; }
            .hero-car-image { width: 320px !important; }
            .hero-section { min-height: auto !important; padding-bottom: 1.5rem !important; }
            .hero-stats-row { gap: 0.5rem !important; padding-top: 0.6rem !important; }
            .hero-stats-row > div > div:first-child { font-size: 0.85rem !important; }
            .hero-stats-row > div > div:last-child { font-size: 0.5rem !important; }
            .hero-cta-wrap { margin-bottom: 1.2rem !important; }
            .hero-cta-wrap a { padding: 0.55rem 1.2rem !important; font-size: 0.78rem !important; }
            .hero-eyebrow { padding: 0.2rem 0.7rem !important; margin-bottom: 0.8rem !important; }
            .hero-eyebrow span { font-size: 0.65rem !important; }
            .hero-dots { margin-top: 1rem !important; }
            .hero-road { bottom: 20px !important; height: 2px !important; }
          }
          @media (max-width: 640px) {
            section { padding: 2.5rem 0 !important; }
            section h2 { font-size: 1.8rem !important; }
            .home-parts-grid, .home-bikes-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 0.6rem !important; }
          }
          @media (max-width: 480px) {
            .hero-left h1 { font-size: 1.35rem !important; }
            .hero-car-wrap { min-height: 100px !important; }
            .hero-car-image { width: 260px !important; }
            .hero-section { padding-top: 0.5rem !important; padding-bottom: 1rem !important; }
            .home-parts-grid, .home-bikes-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 0.5rem !important; }
          }
        `}</style>

        {/* Subtle gradient glow */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 40%, rgba(30, 58, 138, 0.15) 0%, transparent 60%)', pointerEvents: 'none' }} />

        <div className="hero-section-inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ display: 'flex', alignItems: 'center', minHeight: '88vh', gap: '2rem', position: 'relative', zIndex: 1 }}>

          {/* LEFT CONTENT */}
          <div className="hero-left" style={{ flex: '1 1 50%', maxWidth: 600, paddingTop: '2rem', paddingBottom: '2rem' }}>

            {/* Eyebrow */}
            <div className="hero-eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(30, 58, 138, 0.15)', border: '1px solid rgba(30, 58, 138, 0.3)', borderRadius: '999px', padding: '0.3rem 1rem', marginBottom: '1.5rem' }}>
              <Zap size={13} style={{ color: '#93C5FD' }} />
              <span style={{ color: '#93C5FD', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{slide.sub}</span>
            </div>

            {/* Brand */}
            <p style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.9rem', fontWeight: 600, color: '#64748B', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>AUTOXPRESS</p>

            {/* Title */}
            <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', fontWeight: 900, lineHeight: 1.08, marginBottom: '1rem' }}>
              <span style={{ color: '#93C5FD' }}>{slide.title.split(' ')[0]}</span>{' '}
              <span style={{ color: 'white' }}>{slide.title.split(' ').slice(1).join(' ')}</span>
            </h1>

            {/* Description */}
            <p className="hero-desc" style={{ color: '#94A3B8', fontSize: '0.92rem', marginBottom: '0.75rem', lineHeight: 1.7, maxWidth: 440 }}>
              {slide.desc}
            </p>

            {/* Extra paragraph — hidden on mobile */}
            <p className="hero-extra" style={{ color: '#64748B', fontSize: '0.82rem', lineHeight: 1.65, maxWidth: 420, marginBottom: '1.8rem' }}>
              Whether you're looking to upgrade to a premium car, sell your elite vehicle at the best market price, or need expert maintenance — AutoXpress delivers excellence.
            </p>

            {/* CTA Buttons */}
            <div className="hero-cta-wrap" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
              <Link to={slide.href} style={{
                background: '#1E3A8A', color: 'white', padding: '0.7rem 1.8rem', borderRadius: '8px',
                textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem',
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.25s',
                boxShadow: '0 4px 20px rgba(30,58,138,0.4)',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#172554'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#1E3A8A'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                {slide.cta} <ArrowRight size={16} />
              </Link>
              <Link to="/services" style={{
                background: 'transparent', color: 'white', padding: '0.7rem 1.8rem', borderRadius: '8px',
                textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem',
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                border: '1.5px solid rgba(255,255,255,0.2)', transition: 'all 0.25s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#1E3A8A'; e.currentTarget.style.color = '#93C5FD'; e.currentTarget.style.background = 'rgba(30,58,138,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'transparent'; }}>
                Book Service
              </Link>
            </div>

            {/* Stats */}
            <div className="hero-stats-row" style={{ display: 'flex', gap: '1.2rem', flexWrap: 'nowrap', paddingTop: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              {stats.map(({ value, label }) => (
                <div key={label} style={{ flex: '1 1 0' }}>
                  <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.05rem', fontWeight: 900, color: '#93C5FD', lineHeight: 1 }}>{value}</div>
                  <div style={{ color: '#64748B', fontSize: '0.58rem', marginTop: '0.15rem', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Dots */}
            <div className="hero-dots" style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
              {heroSlides.map((_, i) => (
                <button key={i} onClick={() => setCurrentSlide(i)}
                  style={{ width: i === currentSlide ? 28 : 8, height: 6, borderRadius: 3, background: i === currentSlide ? '#1E3A8A' : 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }} />
              ))}
            </div>
          </div>

          {/* RIGHT — Animated Moving Car */}
          <div className="hero-car-wrap" style={{ flex: '1 1 50%', position: 'relative', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            
            {/* Car Image — rotates with scroll */}
            <img
              ref={carRef}
              src={carMainImage}
              alt="Premium Car"
              className="hero-car-image"
              style={{
                width: '520px',
                maxWidth: '95%',
                height: 'auto',
                position: 'relative',
                zIndex: 2,
                mixBlendMode: 'lighten',
                transition: 'transform 0.1s linear',
                willChange: 'transform',
              }}
            />
          </div>
        </div>
      </section>

      {/* BUY CARS section ── */}
      {(loading || featured.length > 0) && (
        <section style={{ background: '#FFFFFF', padding: '5rem 0', borderTop: '1px solid rgba(156, 163, 175, 0.1)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2.5rem', fontWeight: 900, color: '#0F172A' }}>
                  Latest <span className="gradient-text">Showroom</span>
                </h2>
                <p style={{ color: '#64748B', marginTop: '0.3rem', fontWeight: 600 }}>Premium selection for elite drivers</p>
              </div>
              <Link to="/bikes" style={{ padding: '0.63rem 1.5rem', fontSize: '0.9rem', background: '#1E3A8A', color: 'white', border: 'none', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.55rem', transition: 'all 0.3s', boxShadow: '0 8px 20px rgba(30, 58, 138, 0.2)' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#172554'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#1E3A8A'; e.currentTarget.style.transform = 'translateY(0)'; }}>
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
                {featured.map((car) => <CarCard key={car._id} car={car} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* SERVICE CATEGORIES */}
      <section style={{ background: '#0F172A', padding: '6rem 0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <p style={{ color: '#93C5FD', fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '0.8rem' }}>Professional Care</p>
              <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '3.5rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>
                Our Expert <span style={{ color: '#93C5FD' }}>Services</span>
              </h2>
            </div>
            <Link to="/services" style={{ 
              background: '#1E3A8A', 
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
              boxShadow: '0 4px 15px rgba(30,58,138,0.3)'
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#172554'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#1E3A8A'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              Explore All <ArrowRight size={17} />
            </Link>
          </div>

          {servicesLoading ? (
            <div className="home-services-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 160, borderRadius: '10px' }} />)}
            </div>
          ) : (
            <div className="home-services-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.6rem' }}>
              {serviceTypes.map((service, idx) => (
                <div key={service.value} style={{ 
                  background: 'white', 
                  border: '2px solid transparent',
                  borderLeft: '4px solid #1E3A8A',
                  borderRadius: '10px', 
                  padding: '0.8rem', 
                  textAlign: 'left', 
                  boxShadow: '0 4px 15px rgba(0,0,0,0.15)', 
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                  onMouseEnter={(e) => { 
                    e.currentTarget.style.transform = 'translateY(-5px)'; 
                    e.currentTarget.style.borderColor = '#1E3A8A';
                    e.currentTarget.style.boxShadow = '0 12px 25px rgba(30,58,138,0.2)'; 
                    e.currentTarget.style.background = '#F0F4FF'; 
                    e.currentTarget.querySelector('h3').style.color = '#1E3A8A'; 
                    e.currentTarget.querySelector('p').style.color = '#000'; 
                  }}
                  onMouseLeave={(e) => { 
                    e.currentTarget.style.transform = 'translateY(0)'; 
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)';
                    e.currentTarget.style.background = '#fff'; 
                    e.currentTarget.querySelector('h3').style.color = '#111'; 
                    e.currentTarget.querySelector('p').style.color = '#666'; 
                  }}>
                  {/* Numbered watermark */}
                  <div style={{ position: 'absolute', top: '0.4rem', right: '0.6rem', fontSize: '1.8rem', fontWeight: 900, color: 'rgba(0,0,0,0.04)', fontFamily: 'Rajdhani, sans-serif', pointerEvents: 'none' }}>
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <div>
                    {/* Icon */}
                    <div style={{ color: '#1E3A8A', marginBottom: '0.4rem', transition: 'all 0.3s' }}>
                      {service.label.toLowerCase().includes('engine') ? <Zap size={22} /> :
                       service.label.toLowerCase().includes('oil') ? <Wrench size={22} /> :
                       service.label.toLowerCase().includes('brake') ? <Shield size={22} /> :
                       service.label.toLowerCase().includes('tyre') || service.label.toLowerCase().includes('wheel') ? <TrendingUp size={22} /> :
                       service.label.toLowerCase().includes('clean') || service.label.toLowerCase().includes('wash') ? <Star size={22} /> :
                       service.label.toLowerCase().includes('express') ? <Clock size={22} /> :
                       service.label.toLowerCase().includes('battery') ? <Zap size={22} /> :
                       service.label.toLowerCase().includes('pick') || service.label.toLowerCase().includes('door') ? <MapPin size={22} /> :
                       <Wrench size={22} />}
                    </div>
                    <h3 style={{ color: '#111', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.5rem', fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase', transition: 'color 0.2s' }}>{service.label}</h3>
                    <p style={{ color: '#666', fontSize: '0.75rem', lineHeight: 1.5, marginBottom: '1.2rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', transition: 'color 0.2s' }}>{service.desc}</p>
                  </div>
                  <Link to="/services" style={{ 
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    background: '#1E3A8A', color: 'white', 
                    padding: '0.5rem 1rem', borderRadius: '4px', 
                    fontSize: '0.72rem', fontWeight: 700, textDecoration: 'none',
                    transition: 'all 0.2s', width: 'fit-content'
                  }}>
                    Book Now <ArrowRight size={13} />
                  </Link>
                </div>
              ))}
            </div>
          )}
          <style>{`
            @media (min-width: 1024px) {
              .home-why-grid, .home-services-grid { grid-template-columns: repeat(6, 1fr) !important; gap: 0.8rem !important; }
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

      {/* FEATURED PRODUCTS section */}
      {(loading || featured.length > 0) && (
        <section style={{ background: '#FFFFFF', padding: '5rem 0', borderTop: '1px solid rgba(156, 163, 175, 0.1)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
               <p style={{ color: '#1E3A8A', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Premium Selection</p>
              <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2.5rem', fontWeight: 900, color: '#0F172A' }}>
                Featured <span className="gradient-text">Showcase</span>
              </h2>
              <p style={{ color: '#64748B', marginTop: '0.3rem', fontWeight: 600 }}>Exquisite performance machines</p>
            </div>
              <Link to="/bikes/featured" style={{
                background: '#1E3A8A', color: 'white', padding: '0.6rem 1.4rem',
                fontSize: '0.9rem', borderRadius: '10px', textDecoration: 'none',
                fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                boxShadow: '0 8px 20px rgba(30,58,138,0.2)',
                fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.04em'
              }}>
                View All Featured <ArrowRight size={16} />
              </Link>
            </div>

            {loading ? (
              <div className="home-parts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 300, background: '#eee' }} />
                ))}
              </div>
            ) : (
              <div className="home-parts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
                {featured.map((car) => <CarCard key={car._id} car={car} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* BESTSELLER PRODUCTS section */}
      {(loading || bestsellerBikes.length > 0) && (
        <section style={{ background: '#F8FAFC', padding: '5rem 0', borderTop: '1px solid rgba(156, 163, 175, 0.1)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
               <p style={{ color: '#1E3A8A', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Elite Choice</p>
              <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2.5rem', fontWeight: 900, color: '#0F172A' }}>
                Bestseller <span className="gradient-text">Collection</span>
              </h2>
              <p style={{ color: '#64748B', marginTop: '0.3rem', fontWeight: 600 }}>Our most celebrated vehicles</p>
            </div>
              <Link to="/bikes/bestseller" style={{
                background: '#1E3A8A', color: 'white', padding: '0.6rem 1.4rem',
                fontSize: '0.9rem', borderRadius: '10px', textDecoration: 'none',
                fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                boxShadow: '0 8px 20px rgba(30,58,138,0.2)',
                fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.04em'
              }}>
                View All Bestsellers <ArrowRight size={16} />
              </Link>
            </div>

            {loading ? (
              <div className="home-parts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 300, background: '#eee' }} />
                ))}
              </div>
            ) : (
              <div className="home-parts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
                {bestsellerBikes.map((car) => (
                  <CarCard key={car._id} car={car} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* WHY CHOOSE US */}
       <section style={{ background: '#FFFFFF', padding: '5rem 0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2.8rem', fontWeight: 900, color: '#0F172A' }}>Why <span className="gradient-text">AutoXpress?</span></h2>
            <p style={{ color: '#0F172A', marginTop: '0.5rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', opacity: 0.8 }}>India's premier luxury automotive platform</p>
          </div>
          <div className="home-why-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
            {/* Why Choose Us Items */}
            {[
              { title: 'Instant Quote', desc: 'Get a free, instant valuation for your car in seconds with our AI engine.', image: instantQuote },
              { title: 'Schedule Inspection', desc: 'Choose a time and our expert mechanics will visit your doorstep for a full inspection.', image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=400&auto=format&fit=crop' },
              { title: 'Money Transfer', desc: 'Receive secure, instant payment directly to your bank account within 60 minutes.', image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=400&auto=format&fit=crop' },
              { title: '1-Hour Service', desc: 'Expert mechanics arrive at your location within 60 minutes for doorstep service.', image: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?q=80&w=400&auto=format&fit=crop' },
              { title: 'Verified Sellers', desc: 'All cars go through a rigorous 150-point check by experts before listing.', image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=400&auto=format&fit=crop' },
              { title: 'Doorstep Help', desc: 'Enjoy free pickup and drop for all your vehicle needs from the comfort of home.', image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=400&auto=format&fit=crop' },
            ].map(({ title, desc, image }) => (
              <div key={title} style={{ background: '#F8FAFC', overflow: 'hidden', borderRadius: '16px', border: '1px solid rgba(156, 163, 175, 0.1)', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', transition: 'all 0.4s' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.borderColor = '#1E3A8A'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(156, 163, 175, 0.1)'; }}>
                <div style={{ height: '110px', width: '100%', overflow: 'hidden' }}>
                  <img src={image} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(0.4) brightness(0.8)' }}
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1449491073997-d0ce9a901507?q=65&w=400&auto=format&fit=crop'; }} />
                </div>
                <div style={{ padding: '0.8rem 0.7rem', textAlign: 'left' }}>
                  <h3 style={{ color: '#0F172A', fontWeight: 800, fontSize: '0.88rem', marginBottom: '0.3rem', fontFamily: 'Rajdhani, sans-serif' }}>{title}</h3>
                  <p style={{ color: '#64748B', fontSize: '0.7rem', lineHeight: 1.4 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="testimonial-section" style={{ background: '#F9F9F9', padding: '4rem 0', overflow: 'hidden' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <p style={{ color: '#1E3A8A', fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '1rem' }}>Testimonials</p>
            <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '3.2rem', fontWeight: 900, color: '#111', lineHeight: 1 }}>
              What Our <span style={{ color: '#1E3A8A' }}>Clients</span> Say
            </h2>
            <div style={{ width: 60, height: 4, background: '#1E3A8A', margin: '1.5rem auto 0', borderRadius: '2px' }} />
          </div>

          <style>{`
            .testimonial-track {
              display: flex;
              gap: 4rem;
              width: max-content;
              animation: slide-testimonials 35s linear infinite;
              padding: 2.5rem 0;
            }
            .testimonial-track:hover {
              animation-play-state: paused;
            }
            @keyframes slide-testimonials {
              0% { transform: translateX(0); }
              100% { transform: translateX(calc(-380px * 5 - 20rem)); }
            }
            .slide-dots {
              display: flex;
              justify-content: center;
              gap: 1rem;
              margin-top: 1rem;
            }
            .slide-dot {
              width: 10px;
              height: 10px;
              border-radius: 5px;
              background: #DDD;
              transition: all 0.3s ease;
            }
            .slide-dot.active {
              width: 30px;
              background: #1E3A8A;
            }
            @media (max-width: 768px) {
              .testimonial-section { padding: 2.5rem 0 !important; }
              .testimonial-section h2 { font-size: 2.2rem !important; }
              .testimonial-track { gap: 2rem; padding: 1.5rem 0; }
            }
          `}</style>

          <div style={{ overflow: 'hidden' }}>
            <div className="testimonial-track">
              {[
                { name: "Rahul Sharma", role: "BMW 3 Series Owner", review: "Selling my BMW was incredibly smooth. Got the quote in seconds and the inspection was done within 45 minutes. Truly professional!", color: "#1E3A8A", img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200" },
                { name: "Priya Patel", role: "Honda City Owner", review: "The doorstep car service is a life saver. Dedicated mechanic, genuine parts, and zero hassle. My car feels brand new again.", color: "#111", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200" },
                { name: "Aman Singh", role: "Mercedes C-Class Owner", review: "Finally a platform that understands luxury cars. Found rare spares easily and the detailing service is absolutely excellent.", color: "#1E3A8A", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200" },
                { name: "Suresh Kumar", role: "Toyota Fortuner Owner", review: "Extensive parts collection! Found a rare OEM part for my Fortuner that wasn't available anywhere else in the city.", color: "#111", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200" },
                { name: "Anjali Mehta", role: "Audi A4 Owner", review: "Booked my 50k km service online. The pickup and drop were exactly on time. Very professional automotive experience.", color: "#1E3A8A", img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=200" },
                // Loop copies
                { name: "Rahul Sharma", role: "BMW 3 Series Owner", review: "Selling my BMW was incredibly smooth. Got the quote in seconds and the inspection was done within 45 minutes. Truly professional!", color: "#1E3A8A", img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200" },
                { name: "Priya Patel", role: "Honda City Owner", review: "The doorstep car service is a life saver. Dedicated mechanic, genuine parts, and zero hassle. My car feels brand new again.", color: "#111", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200" },
              ].map((item, i) => (
                <div key={i} style={{ position: 'relative', width: '380px', flexShrink: 0 }}>
                  <div style={{
                    position: 'absolute',
                    left: '-45px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    border: `4px solid ${item.color}`,
                    overflow: 'hidden',
                    background: '#fff',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    zIndex: 2
                  }}>
                    <img src={item.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={item.name} />
                  </div>
                  <div style={{
                    background: '#fff',
                    padding: '2.5rem 2rem 2.5rem 3.5rem',
                    borderRadius: '24px',
                    border: `1px solid ${item.color === '#111' ? '#111' : '#EEE'}`,
                    boxShadow: '0 15px 35px rgba(0,0,0,0.05)',
                    position: 'relative'
                  }}>
                    <div style={{ position: 'absolute', top: '15px', right: '25px', color: '#EEE', fontSize: '4rem', fontFamily: 'serif', lineHeight: 1, opacity: 0.5 }}>"</div>
                    <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 800, fontSize: '1.4rem', color: '#111', marginBottom: '0.2rem' }}>{item.name}</h3>
                    <p style={{ fontSize: '0.8rem', color: '#1E3A8A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.2rem' }}>{item.role}</p>
                    <div style={{ display: 'flex', gap: '2px', marginBottom: '1.2rem' }}>
                      {[...Array(5)].map((_, j) => <Star key={j} size={12} fill="#FFB400" color="#FFB400" />)}
                    </div>
                    <p style={{ color: '#555', fontSize: '0.92rem', lineHeight: 1.6, fontStyle: 'italic' }}>"{item.review}"</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Dots */}
            <div className="slide-dots">
              {[0, 1, 2].map((dot) => (
                <div key={dot} className={`slide-dot ${dot === 0 ? 'active' : ''}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{
        background: `linear-gradient(135deg, rgba(2, 6, 23, 0.92) 0%, rgba(8, 18, 41, 0.88) 100%), url('C:/Users/Karan/.gemini/antigravity/brain/93c9291d-3bb7-45d0-9810-1aca53ffb4b7/sell_car_bg_premium_1775807478469.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '6.5rem 0', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
        borderTop: '1px solid rgba(30, 58, 138, 0.15)',
        borderBottom: '1px solid rgba(30, 58, 138, 0.15)'
      }}>
        {/* Subtle accent glow */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 50% 50%, rgba(30,58,138,0.12) 0%, transparent 75%)', pointerEvents: 'none' }} />
        
        <div className="max-w-4xl mx-auto px-4" style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '3rem', fontWeight: 900, color: 'white', marginBottom: '1.2rem' }}>
            Sell Your Car at the Best Value
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '1rem', marginBottom: '1.8rem', fontWeight: 600, opacity: 0.9 }}>
            Premium valuation, expert verification, and instant secure payment within the hour.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', marginBottom: '2.2rem', flexWrap: 'wrap' }}>
            {[
              { label: 'FREE REMOTE VALUATION' },
              { label: 'HOME INSPECTION' },
              { label: 'INSTANT BANK PAYMENT' }
            ].map(b => (
              <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: 4, height: 4, background: '#1E3A8A', borderRadius: '50%' }} />
                <span style={{ color: '#E2E8F0', fontSize: '0.75rem', fontWeight: 900, fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.12em' }}>{b.label}</span>
              </div>
            ))}
          </div>
          <Link to="/sell" style={{
            background: '#1E3A8A', color: 'white', padding: '1rem 3rem',
            borderRadius: '10px', textDecoration: 'none', fontWeight: 800, fontSize: '1.05rem',
            display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
            transition: 'all 0.3s',
            boxShadow: '0 10px 30px rgba(30,58,138,0.3)'
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.background = '#93C5FD'; e.currentTarget.style.boxShadow = '0 15px 40px rgba(30,58,138,0.45)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = '#1E3A8A'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(30,58,138,0.3)'; }}>
            Sell My Car Now <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}

