import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import { FaFacebook, FaInstagram, FaYoutube, FaTwitter } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer style={{ background: '#0F172A', borderTop: '1px solid #1E293B', color: '#94A3B8' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem' }}>
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <img src="/logo.png" alt="Avani Enterprises" style={{ height: '75px', objectFit: 'contain' }} />
              <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 950, color: 'white', fontSize: '1.4rem', letterSpacing: '0.05em' }}>Avani Enterprises</span>
            </div>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.8, color: '#94A3B8', fontWeight: 500 }}>The ultimate destination for premium car enthusiasts. Buy, sell, and service elite vehicles with India's most trusted automotive platform.</p>
            <div className="flex items-center gap-3 mt-4">
              {[FaFacebook, FaInstagram, FaYoutube, FaTwitter].map((Icon, i) => (
                <a key={i} href="#" style={{ width: 40, height: 40, borderRadius: '12px', background: '#1E293B', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', transition: 'all 0.3s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1E3A8A'; e.currentTarget.style.color = 'white'; e.currentTarget.style.background = '#1E3A8A'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = '#1E293B'; }}>
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '1rem', fontSize: '1rem', fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Services</h4>
            {['Concierge Service', 'Luxury Detailing', 'Engine Optimization', 'Battery Solutions', 'Precision Braking', 'Elite Washing'].map(s => (
              <Link key={s} to="/services" style={{ display: 'block', color: '#94A3B8', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '0.5rem', transition: 'all 0.3s', fontWeight: 500 }}
                onMouseEnter={(e) => (e.target.style.color = '#1E3A8A')}
                onMouseLeave={(e) => (e.target.style.color = '#94A3B8')}>
                {s}
              </Link>
            ))}
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '1rem', fontSize: '1rem', fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Quick Links</h4>
            {[['Buy Cars', '/bikes'], ['Sell My Car', '/sell'], ['Genuine Spares', '/parts'], ['Track Order', '/my-orders'], ['Member Dashboard', '/my-bookings'], ['User Profile', '/profile']].map(([label, href]) => (
              <Link key={href} to={href} style={{ display: 'block', color: '#94A3B8', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '0.5rem', transition: 'all 0.3s', fontWeight: 500 }}
                onMouseEnter={(e) => (e.target.style.color = '#1E3A8A')}
                onMouseLeave={(e) => (e.target.style.color = '#94A3B8')}>
                {label}
              </Link>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '1rem', fontSize: '1rem', fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Contact Us</h4>
            {[
              { icon: '📍', text: 'GURGAON: Tower B, 3rd Floor, Unitech Cyber Park, Sector 39, 122002' },
              { icon: '📍', text: 'MUMBAI: Third Floor, Vasudev Chamber, Teli Galli Cross Rd, Andheri East, 400069' },
              { icon: '📍', text: 'ROHTAK: 106, First Floor, Agro Mall, Rohtak' },
              { icon: '📍', text: 'AUSTRALIA: Australia' },
              { icon: '📞', text: '+91 9253625099' },
              { icon: '✉️', text: 'kp@avanienterprises.in' },
            ].map(({ icon, text }, idx) => (
              <div key={idx} className="flex items-center gap-2" style={{ marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: 500 }}>
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
            <div style={{ marginTop: '2rem', padding: '1.2rem', background: '#1E293B', borderRadius: '12px', border: '1px solid #334155' }}>
              <p style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '0.6rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>24/7 ROADSIDE ASSISTANCE</p>
              <a href="tel:+919253625099" style={{ color: 'white', fontWeight: 950, fontSize: '1.25rem', textDecoration: 'none', fontFamily: 'Rajdhani, sans-serif' }}>
                📞 +91 9253625099
              </a>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #1E293B', marginTop: '2.5rem', paddingTop: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>© {new Date().getFullYear()} Avani Enterprises. All rights reserved.</p>
          <div className="flex items-center gap-4" style={{ fontSize: '0.83rem' }}>
            <Link to="/privacy" style={{ color: '#64748B', textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</Link>
            <Link to="/terms" style={{ color: '#64748B', textDecoration: 'none', fontWeight: 600 }}>Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

