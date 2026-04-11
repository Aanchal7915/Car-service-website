import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Clock, MapPin, Star, Zap, Wrench, ShoppingBag, TrendingUp } from 'lucide-react';
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

const heroSlides = [
  { title: 'Buy & Sell Cars', sub: 'Premium Auto Marketplace', desc: 'Find your perfect luxury car from thousands of certified new & used vehicles across India.', cta: 'Explore Cars', href: '/bikes', accent: '#2563EB' },
  { title: 'Premium Service', sub: 'Excellence Guaranteed', desc: 'Expert car technicians at your doorstep. World-class maintenance for your luxury vehicle.', cta: 'Book Service', href: '/services', accent: '#3B82F6' },
  { title: 'Sell Instantly', sub: 'Maximum Value', desc: 'Get an instant valuation and sell your car at the best market price today.', cta: 'Sell Now', href: '/sell', accent: '#10B981' },
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

  useEffect(() => {
    Promise.all([
      getFeaturedBikes().then(({ data }) => setFeatured(data.bikes)),
      getFeaturedParts().then(({ data }) => setFeaturedParts(data.parts || [])),
      getBestsellerParts({ limit: 8 }).then(({ data }) => setBestsellerParts(data.parts || [])),
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
      <style>{`
        @media (max-width: 768px) {
          .hero-split { background: #050505 !important; }
          .hero-split > div:first-child > div { padding: 1rem !important; padding-top: 0.5rem !important; background: transparent !important; }
          .hero-split > div:first-child > div h1 { font-size: 1.5rem !important; }
          .hero-split > div:first-child > div p { font-size: 0.75rem !important; }
          .hero-split .hero-right { min-height: 180px !important; max-height: 220px !important; background: transparent !important; }
        }
        @media (min-width: 769px) {
          .hero-right-bg {
             background: url(${heroCarGT3});
             background-size: cover;
             background-position: right center;
          }
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
      {/* HERO — Split layout: left content / right car image */}
      <section className="hero-split" style={{ minHeight: '80vh', display: 'flex', position: 'relative', overflow: 'hidden', background: '#050505' }}>
        <style>{`
          @media (max-width: 768px) {
            .hero-split { flex-direction: column !important; min-height: auto !important; }
            .hero-split > .hero-right { min-height: 200px !important; max-height: 240px !important; }
            .hero-split > .hero-right img { transform: translate(-5%, -30%) !important; max-height: 220px !important; }
          }
        `}</style>

        {/* ── LEFT: Black panel with content ── */}
        <div style={{ 
          flex: '1 1 50%', 
          background: 'linear-gradient(135deg, #050505 0%, #101010 100%)',
          display: 'flex', 
          alignItems: 'flex-start', 
          position: 'relative' 
        }}>
          {/* Blue glow accent */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at 100% 50%, rgba(255,255,255,0.06) 0%, transparent 80%)' }} />

          <div style={{ position: 'relative', zIndex: 1, padding: '0px clamp(2rem, 5vw, 5.5rem) clamp(2rem, 5vw, 5.5rem)', paddingRight: 'clamp(1rem, 2vw, 2rem)', maxWidth: 800, paddingTop: '1.5rem' }}>

            {/* Eyebrow */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.25)', borderRadius: '999px', padding: '0.3rem 1rem', marginBottom: '1.5rem' }}>
              <Zap size={13} style={{ color: '#2563EB' }} />
              <span style={{ color: '#2563EB', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{slide.sub}</span>
            </div>

            {/* Brand + Title */}
            <p style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1rem', fontWeight: 600, color: '#555', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>AUTOXPRESS</p>
            <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 900, lineHeight: 1.05, marginBottom: '1rem' }}>
              <span style={{ color: '#2563EB' }}>{slide.title.split(' ')[0]}</span>{' '}
              <span style={{ color: 'white' }}>{slide.title.split(' ').slice(1).join(' ')}</span>
            </h1>

            {/* Description */}
            <p style={{ color: '#999', fontSize: '0.95rem', marginBottom: '0.8rem', lineHeight: 1.75, maxWidth: 440 }}>
              {slide.desc}
            </p>

            {/* Extra content paragraph */}
            <p className="hero-extra-desc" style={{ color: '#666', fontSize: '0.85rem', lineHeight: 1.7, maxWidth: 420, marginBottom: '2rem' }}>
              Whether you're looking to upgrade your ride, sell your old car at the best price, or need expert service — AutoXpress has you covered with doorstep pickup, certified mechanics, and same-day payment.
            </p>

            {/* CTA Buttons — both restored */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.2rem' }}>
              <Link to={slide.href} style={{
                background: '#2563EB', color: 'white', padding: '0.6rem 1.5rem', borderRadius: '6px',
                textDecoration: 'none', fontWeight: 700, fontSize: '0.82rem',
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s',
                boxShadow: '0 4px 20px rgba(37,99,235,0.35)',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#1D4ED8'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#2563EB'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                {slide.cta} <ArrowRight size={16} />
              </Link>
              <Link to="/services" style={{
                background: 'transparent', color: 'white', padding: '0.6rem 1.5rem', borderRadius: '6px',
                textDecoration: 'none', fontWeight: 600, fontSize: '0.82rem',
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                border: '1.5px solid rgba(255,255,255,0.2)', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.color = '#2563EB'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'white'; }}>
                Book Service
              </Link>
            </div>

            {/* Stats row */}
            <div className="home-hero-stats" style={{ display: 'flex', gap: '1.2rem', flexWrap: 'nowrap', paddingTop: '0.8rem', borderTop: '1px solid #1A1A1A' }}>
              {stats.map(({ value, label }) => (
                <div key={label} style={{ flex: '1 1 0' }}>
                  <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.1rem', fontWeight: 900, color: '#2563EB', lineHeight: 1 }}>{value}</div>
                  <div style={{ color: '#555', fontSize: '0.6rem', marginTop: '0.15rem', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Slide dots */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.8rem' }}>
              {heroSlides.map((_, i) => (
                <button key={i} onClick={() => setCurrentSlide(i)}
                  style={{ width: i === currentSlide ? 28 : 8, height: 8, borderRadius: 4, background: i === currentSlide ? '#2563EB' : '#333', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }} />
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Black panel with car image ── */}
        <div className="hero-right hero-right-bg" style={{ 
          flex: '1 1 50%', 
          position: 'relative', 
          display: 'flex', 
          alignItems: 'flex-start', 
          justifyContent: 'center', 
          overflow: 'hidden', 
          paddingTop: '0px' 
        }}>


          {/* Decorative background circle */}
          <div style={{ position: 'absolute', width: '120%', height: '120%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(229,57,53,0.05) 0%, transparent 70%)', zIndex: 0 }} />

          {/* Car image wrapper with floating animation */}
          <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
            <picture>
              <source media="(max-width: 768px)" srcSet={heroCar} />
              <img
                src={heroCarGT3Reflection}
                alt="Hero Car"
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
            <div style={{ position: 'absolute', bottom: '20%', width: '60%', height: '20px', background: 'rgba(37,99,235,0.15)', borderRadius: '50%', filter: 'blur(20px)', animation: 'pulse 4s infinite' }} />
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
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, background: 'linear-gradient(to top, #0F172A, transparent)', pointerEvents: 'none' }} />
          {/* Top fade */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(to bottom, #020617, transparent)', pointerEvents: 'none' }} />
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
              <Link to="/bikes" style={{ padding: '0.63rem 1.5rem', fontSize: '0.9rem', background: '#2563EB', color: 'white', border: 'none', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.55rem', transition: 'all 0.3s', boxShadow: '0 8px 20px rgba(37, 99, 235, 0.2)' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#1D4ED8'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#2563EB'; e.currentTarget.style.transform = 'translateY(0)'; }}>
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
      <section style={{ background: '#F8FAFC', padding: '6rem 0', position: 'relative' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ color: '#2563EB', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Evolved Engineering</p>
              <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2.8rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.1 }}>
                Luxury Car <span style={{ color: '#2563EB' }}>Experience</span>
              </h2>
            </div>
            <Link to="/services" style={{
              background: '#2563EB',
              color: 'white',
              padding: '0.75rem 2rem',
              fontSize: '0.9rem',
              fontWeight: 800,
              borderRadius: '12px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              transition: 'all 0.3s',
              boxShadow: '0 8px 25px rgba(37,99,235,0.3)',
              fontFamily: 'Rajdhani, sans-serif',
              letterSpacing: '0.05em'
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#3B82F6'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#2563EB'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              Explore All <ArrowRight size={17} />
            </Link>
          </div>

          {servicesLoading ? (
            <div className="home-services-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 160, borderRadius: '10px' }} />)}
            </div>
          ) : (
            <div className="home-services-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem' }}>
              {serviceTypes.map((service) => (
                <div key={service.value} style={{
                  background: '#FFF',
                  border: '1px solid rgba(156, 163, 175, 0.2)',
                  borderLeft: '4px solid #2563EB',
                  borderRadius: '16px',
                  padding: '1rem 1.5rem',
                  textAlign: 'left',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                  transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(156, 163, 175, 0.2)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.03)'; }}>
                  <div>
                    <h3 style={{ color: '#0F172A', fontWeight: 900, fontSize: '0.95rem', marginBottom: '0.5rem', fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{service.label}</h3>
                    <p style={{ color: '#64748B', fontSize: '0.75rem', lineHeight: 1.5, marginBottom: '0.8rem', fontWeight: 600 }}>
                      {service.desc}. Expert car care for premium performance and durability.
                    </p>
                  </div>
                  <Link to="/services" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    background: '#2563EB', color: 'white',
                    padding: '0.6rem 1.2rem', borderRadius: '8px',
                    fontSize: '0.72rem', fontWeight: 900, textDecoration: 'none',
                    transition: 'all 0.3s', width: 'fit-content',
                    fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.08em',
                    textTransform: 'uppercase'
                  }}>
                    Book <ArrowRight size={13} />
                  </Link>
                </div>
              ))}
            </div>
          )}
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

      {/* FEATURED PRODUCTS section */}
      {(partsLoading || featuredParts.length > 0 || featured.length > 0) && (
        <section style={{ background: '#FFFFFF', padding: '5rem 0', borderTop: '1px solid rgba(156, 163, 175, 0.1)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
               <p style={{ color: '#2563EB', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Premium Selection</p>
              <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2.5rem', fontWeight: 900, color: '#0F172A' }}>
                Featured <span className="gradient-text">Showcase</span>
              </h2>
              <p style={{ color: '#64748B', marginTop: '0.3rem', fontWeight: 600 }}>Exquisite performance machines</p>
            </div>
              <Link to="/featured" style={{
                background: '#2563EB', color: 'white', padding: '0.6rem 1.4rem',
                fontSize: '0.9rem', borderRadius: '10px', textDecoration: 'none',
                fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                boxShadow: '0 8px 20px rgba(37,99,235,0.2)',
                fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.04em'
              }}>
                View All Featured <ArrowRight size={16} />
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
                {featured.map((car) => <CarCard key={car._id} car={car} />)}
                {featuredParts.map((part) => <PartCard key={part._id} part={part} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* BESTSELLER PRODUCTS section */}
      {(loading || bestsellerBikes.length > 0 || bestsellerParts.length > 0) && (
        <section style={{ background: '#F8FAFC', padding: '5rem 0', borderTop: '1px solid rgba(156, 163, 175, 0.1)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
               <p style={{ color: '#2563EB', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Elite Choice</p>
              <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2.5rem', fontWeight: 900, color: '#0F172A' }}>
                Bestseller <span className="gradient-text">Collection</span>
              </h2>
              <p style={{ color: '#64748B', marginTop: '0.3rem', fontWeight: 600 }}>Our most celebrated vehicles</p>
            </div>
              <Link to="/bestseller" style={{
                background: '#2563EB', color: 'white', padding: '0.6rem 1.4rem',
                fontSize: '0.9rem', borderRadius: '10px', textDecoration: 'none',
                fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                boxShadow: '0 8px 20px rgba(37,99,235,0.2)',
                fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.04em'
              }}>
                View All Bestsellers <ArrowRight size={16} />
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
                {bestsellerBikes.map((car) => (
                  <CarCard key={car._id} car={car} />
                ))}
                {bestsellerParts.map((part) => (
                  <PartCard key={part._id} part={part} />
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
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.borderColor = '#2563EB'; }}
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

      {/* CTA BANNER */}
      <section style={{
        background: `linear-gradient(135deg, rgba(2, 6, 23, 0.92) 0%, rgba(8, 18, 41, 0.88) 100%), url('C:/Users/Karan/.gemini/antigravity/brain/93c9291d-3bb7-45d0-9810-1aca53ffb4b7/sell_car_bg_premium_1775807478469.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '6.5rem 0', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
        borderTop: '1px solid rgba(37, 99, 235, 0.15)',
        borderBottom: '1px solid rgba(37, 99, 235, 0.15)'
      }}>
        {/* Subtle accent glow */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 50% 50%, rgba(37,99,235,0.12) 0%, transparent 75%)', pointerEvents: 'none' }} />
        
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
                <div style={{ width: 4, height: 4, background: '#2563EB', borderRadius: '50%' }} />
                <span style={{ color: '#E2E8F0', fontSize: '0.75rem', fontWeight: 900, fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.12em' }}>{b.label}</span>
              </div>
            ))}
          </div>
          <Link to="/sell" style={{
            background: '#2563EB', color: 'white', padding: '1rem 3rem',
            borderRadius: '10px', textDecoration: 'none', fontWeight: 800, fontSize: '1.05rem',
            display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
            transition: 'all 0.3s',
            boxShadow: '0 10px 30px rgba(37,99,235,0.3)'
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.background = '#3B82F6'; e.currentTarget.style.boxShadow = '0 15px 40px rgba(37,99,235,0.45)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = '#2563EB'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(37,99,235,0.3)'; }}>
            Sell My Car Now <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
