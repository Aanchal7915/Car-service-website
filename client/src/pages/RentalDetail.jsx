import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Calendar, Fuel, Users, Settings, MapPin, Shield, Clock, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/common/LoadingSpinner';
import { getRentalCar, createRentalBooking, verifyRentalPayment } from '../api/rentalApi';

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function RentalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [form, setForm] = useState({
    pickupDate: today,
    returnDate: tomorrow,
    pickupTime: '10:00',
    returnTime: '10:00',
    contactPhone: '',
    driverLicense: '',
    notes: '',
    paymentMethod: 'online',
    pickupAddress: { street: '', city: '', state: '', pincode: '' },
  });

  useEffect(() => {
    getRentalCar(id)
      .then(({ data }) => setCar(data.car))
      .catch(() => toast.error('Failed to load rental details'))
      .finally(() => setLoading(false));
  }, [id]);

  const totalDays = useMemo(() => {
    if (!form.pickupDate || !form.returnDate) return 0;
    const ms = new Date(form.returnDate).getTime() - new Date(form.pickupDate).getTime();
    return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  }, [form.pickupDate, form.returnDate]);

  const subtotal = (car?.pricePerDay || 0) * totalDays;
  const totalAmount = subtotal + (car?.securityDeposit || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to book a rental');
      return;
    }
    if (!form.contactPhone) return toast.error('Contact phone is required');
    if (new Date(form.returnDate) <= new Date(form.pickupDate)) {
      return toast.error('Return date must be after pickup date');
    }

    setSubmitting(true);
    try {
      const { data: res } = await createRentalBooking({ rentalCar: id, ...form });
      
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        setSubmitting(false);
        return;
      }

      const order = res.order;
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'AutoXpress Rental',
        description: `${car.brand} ${car.model} Booking`,
        order_id: order.id,
        handler: async (response) => {
          try {
            await verifyRentalPayment({
              ...response,
              bookingId: res.booking._id
            });
            toast.success('Rental booked and paid successfully!');
            navigate('/my-bookings');
          } catch (err) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: form.contactPhone
        },
        theme: { color: '#1E3A8A' },
        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled');
            setSubmitting(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!car) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <button onClick={() => navigate('/rentals')}
          style={{ background: 'none', border: 'none', color: '#1E3A8A', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: 700, marginBottom: '1.2rem' }}>
          <ArrowLeft size={16} /> BACK TO RENTALS
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '2rem' }} className="rental-detail-grid">
          {/* LEFT: car details */}
          <div>
            <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #E2E8F0', marginBottom: '1.5rem' }}>
              <div style={{ height: '380px', background: '#F1F5F9' }}>
                {car.images?.[activeImage] ? (
                  <img src={car.images[activeImage]} alt={car.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CBD5E1' }}>
                    <Calendar size={64} />
                  </div>
                )}
              </div>
              {car.images?.length > 1 && (
                <div style={{ display: 'flex', gap: '0.5rem', padding: '0.8rem', overflowX: 'auto' }}>
                  {car.images.map((img, idx) => (
                    <img key={idx} src={img} alt="" onClick={() => setActiveImage(idx)}
                      style={{ width: '70px', height: '50px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: idx === activeImage ? '2px solid #1E3A8A' : '2px solid transparent' }} />
                  ))}
                </div>
              )}
            </div>

            <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #E2E8F0' }}>
              <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2.1rem', fontWeight: 950, color: '#0F172A', lineHeight: 1, letterSpacing: '-0.01em' }}>
                {car.brand} {car.model}
              </h1>
              <p style={{ color: '#64748B', fontSize: '0.9rem', fontWeight: 600, marginTop: '0.4rem' }}>{car.year} • {car.title}</p>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', margin: '1.2rem 0' }}>
                <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2.1rem', fontWeight: 950, color: '#1E3A8A' }}>₹{car.pricePerDay?.toLocaleString('en-IN')}</span>
                <span style={{ color: '#64748B', fontWeight: 700, fontSize: '0.9rem' }}>/ day</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.8rem', marginTop: '1.5rem' }}>
                {[
                  { icon: Settings, label: 'Transmission', value: car.transmission?.toUpperCase() },
                  { icon: Fuel, label: 'Fuel', value: car.fuelType?.toUpperCase() },
                  { icon: Users, label: 'Seats', value: car.seats },
                  { icon: Shield, label: 'Deposit', value: `₹${(car.securityDeposit || 0).toLocaleString('en-IN')}` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <Icon size={14} /> {label}
                    </div>
                    <div style={{ marginTop: '0.4rem', fontWeight: 800, color: '#0F172A', fontSize: '0.9rem' }}>{value}</div>
                  </div>
                ))}
              </div>

              {car.description && (
                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #F1F5F9' }}>
                  <h3 style={{ fontWeight: 900, color: '#0F172A', marginBottom: '0.6rem', fontSize: '0.95rem' }}>About this car</h3>
                  <p style={{ color: '#475569', lineHeight: 1.7, fontWeight: 500 }}>{car.description}</p>
                </div>
              )}

              {car.features?.length > 0 && (
                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #F1F5F9' }}>
                  <h3 style={{ fontWeight: 900, color: '#0F172A', marginBottom: '0.8rem', fontSize: '0.95rem' }}>Features</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {car.features.map((f, i) => (
                      <span key={i} style={{ background: '#EFF6FF', color: '#1E3A8A', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <CheckCircle size={12} /> {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {car.location?.city && (
                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontWeight: 700 }}>
                  <MapPin size={16} style={{ color: '#1E3A8A' }} />
                  Pickup: {[car.location.city, car.location.state, car.location.pincode].filter(Boolean).join(', ')}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Booking form */}
          <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #E2E8F0', height: 'fit-content' }}>
            <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.3rem', fontWeight: 950, color: '#0F172A', marginBottom: '1.2rem', letterSpacing: '0.01em' }}>
              BOOK THIS CAR
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '0.8rem' }}>
              <div>
                <label style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 800, marginBottom: '0.3rem', display: 'block' }}>PICKUP DATE</label>
                <input type="date" required min={today} value={form.pickupDate}
                  onChange={e => setForm({ ...form, pickupDate: e.target.value })}
                  className="input-light" style={{ height: '42px' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 800, marginBottom: '0.3rem', display: 'block' }}>RETURN DATE</label>
                <input type="date" required min={form.pickupDate} value={form.returnDate}
                  onChange={e => setForm({ ...form, returnDate: e.target.value })}
                  className="input-light" style={{ height: '42px' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 800, marginBottom: '0.3rem', display: 'block' }}>PICKUP TIME</label>
                <input type="time" value={form.pickupTime}
                  onChange={e => setForm({ ...form, pickupTime: e.target.value })}
                  className="input-light" style={{ height: '42px' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 800, marginBottom: '0.3rem', display: 'block' }}>RETURN TIME</label>
                <input type="time" value={form.returnTime}
                  onChange={e => setForm({ ...form, returnTime: e.target.value })}
                  className="input-light" style={{ height: '42px' }} />
              </div>
            </div>

            <label style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 800, marginTop: '0.4rem', marginBottom: '0.3rem', display: 'block' }}>CONTACT PHONE *</label>
            <input required type="tel" placeholder="10-digit mobile" value={form.contactPhone}
              onChange={e => setForm({ ...form, contactPhone: e.target.value })}
              className="input-light" style={{ height: '42px', marginBottom: '0.8rem' }} />

            <label style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 800, marginBottom: '0.3rem', display: 'block' }}>DRIVING LICENSE NUMBER</label>
            <input placeholder="e.g. DL01-20211234567" value={form.driverLicense}
              onChange={e => setForm({ ...form, driverLicense: e.target.value })}
              className="input-light" style={{ height: '42px', marginBottom: '0.8rem' }} />

            <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '0.8rem', border: '1px solid #E2E8F0', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1E3A8A', fontWeight: 800, fontSize: '0.75rem' }}>
                <Shield size={14} /> SECURE ONLINE PAYMENT
              </div>
              <p style={{ fontSize: '0.65rem', color: '#64748B', marginTop: '0.2rem', fontWeight: 600 }}>Razorpay encrypted checkout</p>
            </div>

            <label style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 800, marginBottom: '0.3rem', display: 'block' }}>NOTES (OPTIONAL)</label>
            <textarea value={form.notes} rows={2}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              className="input-light" style={{ minHeight: '60px', padding: '0.6rem 0.8rem', marginBottom: '1rem', resize: 'vertical', fontSize: '0.85rem' }} />

            {/* Price Summary */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>
                <span>₹{car.pricePerDay?.toLocaleString('en-IN')} × {totalDays} day(s)</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {car.securityDeposit > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>
                  <span>Security deposit</span>
                  <span>₹{car.securityDeposit.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '0.6rem', marginTop: '0.4rem' }}>
                <span style={{ fontWeight: 900, color: '#0F172A', fontSize: '0.85rem' }}>TOTAL</span>
                <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.3rem', fontWeight: 950, color: '#1E3A8A' }}>₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button type="submit" disabled={submitting || car.status !== 'available'}
              style={{ width: '100%', background: car.status === 'available' ? '#1E3A8A' : '#94A3B8', color: 'white', border: 'none', borderRadius: '12px', padding: '0.8rem', fontWeight: 900, fontSize: '0.9rem', cursor: car.status === 'available' && !submitting ? 'pointer' : 'not-allowed', letterSpacing: '0.1em', fontFamily: 'Rajdhani, sans-serif' }}>
              {car.status !== 'available' ? 'CURRENTLY UNAVAILABLE' : submitting ? 'PROVISING PAYMENT...' : 'CONFIRM & PAY NOW'}
            </button>

            <p style={{ fontSize: '0.72rem', color: '#94A3B8', textAlign: 'center', marginTop: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'center' }}>
              <Clock size={11} /> Booking is confirmed by admin after payment
            </p>
          </form>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .rental-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
