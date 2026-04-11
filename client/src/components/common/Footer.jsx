import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import { FaFacebook, FaInstagram, FaYoutube, FaTwitter } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer style={{ background: '#0F172A', borderTop: '1px solid #1E293B', color: '#94A3B8' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem' }}>
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', borderRadius: '10px', padding: '8px 14px' }}>
                <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 950, color: 'white', fontSize: '1.2rem', letterSpacing: '0.05em' }}>AUTO</span>
              </div>
              <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 950, color: 'white', fontSize: '1.4rem', letterSpacing: '0.1em' }}>XPRESS</span>
            </div>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.8, color: '#94A3B8', fontWeight: 500 }}>The ultimate destination for premium car enthusiasts. Buy, sell, and service elite vehicles with India's most trusted automotive platform.</p>
            <div className="flex items-center gap-3 mt-4">
              {[FaFacebook, FaInstagram, FaYoutube, FaTwitter].map((Icon, i) => (
                <a key={i} href="#" style={{ width: 40, height: 40, borderRadius: '12px', background: '#1E293B', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', transition: 'all 0.3s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.color = 'white'; e.currentTarget.style.background = '#2563EB'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = '#1E293B'; }}>
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 style={{ color: 'white', fontWeight: 900, marginBottom: '1.5rem', fontSize: '1rem', fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Services</h4>
            {['Concierge Service', 'Luxury Detailing', 'Engine Optimization', 'Battery Solutions', 'Precision Braking', 'Elite Washing'].map(s => (
              <Link key={s} to="/services" style={{ display: 'block', color: '#94A3B8', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '0.75rem', transition: 'all 0.3s', fontWeight: 500 }}
                onMouseEnter={(e) => (e.target.style.color = '#2563EB')}
                onMouseLeave={(e) => (e.target.style.color = '#94A3B8')}>
                {s}
              </Link>
            ))}
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: 'white', fontWeight: 900, marginBottom: '1.5rem', fontSize: '1rem', fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Quick Links</h4>
            {[['Buy Cars', '/bikes'], ['Sell My Car', '/sell'], ['Genuine Spares', '/parts'], ['Track Order', '/my-orders'], ['Member Dashboard', '/my-bookings'], ['User Profile', '/profile']].map(([label, href]) => (
              <Link key={href} to={href} style={{ display: 'block', color: '#94A3B8', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '0.75rem', transition: 'all 0.3s', fontWeight: 500 }}
                onMouseEnter={(e) => (e.target.style.color = '#2563EB')}
                onMouseLeave={(e) => (e.target.style.color = '#94A3B8')}>
                {label}
              </Link>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: 'white', fontWeight: 900, marginBottom: '1.5rem', fontSize: '1rem', fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Contact Us</h4>
            {[
              { Icon: Phone, text: '+91 800-AUTO-XPRESS' },
              { Icon: Mail, text: 'concierge@autoxpress.in' },
              { Icon: MapPin, text: 'Innovation District, Mumbai, India' },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-3" style={{ marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 500 }}>
                <Icon size={16} style={{ color: '#2563EB', flexShrink: 0 }} />
                <span>{text}</span>
              </div>
            ))}
            <div style={{ marginTop: '2rem', padding: '1.2rem', background: '#1E293B', borderRadius: '12px', border: '1px solid #334155' }}>
              <p style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '0.6rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>24/7 ROADSIDE ASSISTANCE</p>
              <a href="tel:+918002886977" style={{ color: '#2563EB', fontWeight: 950, fontSize: '1.25rem', textDecoration: 'none', fontFamily: 'Rajdhani, sans-serif' }}>
                📞 800-AUTO-MVP
              </a>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #1E293B', marginTop: '4rem', paddingTop: '2rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>© {new Date().getFullYear()} AutoXpress. All rights reserved.</p>
          <div className="flex items-center gap-4" style={{ fontSize: '0.83rem' }}>
            <Link to="/privacy" style={{ color: '#64748B', textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</Link>
            <Link to="/terms" style={{ color: '#64748B', textDecoration: 'none', fontWeight: 600 }}>Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
