import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { getActiveServiceTypes, createBooking, createServicePayment, verifyServicePayment } from '../api/serviceApi';
import toast from 'react-hot-toast';
import { Wrench, Clock, MapPin, Calendar, ChevronRight, Loader, CreditCard } from 'lucide-react';

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

export default function Services() {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [typesLoading, setTypesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    getActiveServiceTypes()
      .then(({ data }) => setServiceTypes(data.serviceTypes || []))
      .catch(() => {})
      .finally(() => setTypesLoading(false));
  }, []);

  const handleAdvancePayment = async () => {
    if (!bookingId) return;
    setPaying(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) { toast.error('Payment gateway failed to load'); setPaying(false); return; }

      const { data } = await createServicePayment(bookingId, { amount: 200 });
      const rzpOrder = data.order;
      const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID || data.key || data.keyId;

      await new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: rzpKey, amount: rzpOrder.amount, currency: rzpOrder.currency || 'INR',
          name: 'AutoXpress', description: `Service: ${selectedService.label}`,
          order_id: rzpOrder.id,
          prefill: { name: user.name, email: user.email, contact: user.phone || '' },
          theme: { color: '#1E3A8A' },
          handler: async (response) => {
            try {
              await verifyServicePayment(bookingId, {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: 200
              });
              resolve();
            } catch (err) { reject(err); }
          },
          modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
        });
        rzp.open();
      });

      setPaid(true);
      toast.success('Advance payment successful!');
    } catch (err) {
      if (err.message === 'Payment cancelled') toast.error('Payment cancelled');
      else toast.error(err.response?.data?.message || 'Payment failed');
    } finally { setPaying(false); }
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSubmit = async (data) => {
    if (!user) { toast.error('Please login first'); return; }
    setSubmitting(true);
    try {
      const res = await createBooking({
        ...data,
        serviceType: selectedService.value,
        serviceLabel: selectedService.label,
        isPickupDrop: data.isPickupDrop === 'true',
        isOneHourRepair: data.isOneHourRepair === 'true',
      });
      setBookingId(res.data.booking?._id || res.data._id);
      setStep(3);
      toast.success('Service booked successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF' }}>
      <style>{`
        @media (max-width: 640px) {
          .svc-form-grid { grid-template-columns: 1fr !important; }
          .svc-addr-grid { grid-template-columns: 1fr !important; }
          .svc-step-label { display: none !important; }
        }
      `}</style>
      {/* Header */}
      <div style={{ background: '#F9F9F9', borderBottom: '1px solid #EEE', padding: '1rem 0' }}>
        <div className="max-w-4xl mx-auto px-4">
          <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.8rem', fontWeight: 800, color: '#111', margin: 0 }}>
            Premium Car <span style={{ color: '#1E3A8A' }}>Services</span>
          </h1>
          <p style={{ color: '#666', marginTop: '0.3rem', fontWeight: 500 }}>Elite maintenance for your luxury vehicle at your doorstep</p>
 
          {/* Steps */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginTop: '0.8rem' }}>
            {['Select Service', 'Fill Details', 'Confirmed'].map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: step > i + 1 ? '#10B981' : step === i + 1 ? '#0F172A' : '#EEE',
                    color: i + 1 <= step ? 'white' : '#999', fontSize: '0.9rem', fontWeight: 800,
                    boxShadow: step === i + 1 ? '0 4px 10px rgba(15, 23, 42, 0.2)' : 'none'
                  }}>
                    {step > i + 1 ? '✓' : i + 1}
                  </div>
                  <span className="svc-step-label" style={{ color: step === i + 1 ? '#111' : '#888', fontSize: '0.9rem', fontWeight: step === i + 1 ? 700 : 500 }}>{s}</span>
                </div>
                {i < 2 && <div style={{ width: 40, height: 2, background: '#EEE', margin: '0 0.8rem' }} />}
              </div>
            ))}
          </div>
        </div>
      </div>
 
      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Step 1: Service Selection */}
        {step === 1 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', padding: '0.8rem 1.2rem', background: 'rgba(30, 58, 138, 0.1)', border: '1px solid rgba(30, 58, 138, 0.2)', borderRadius: '12px' }}>
              <span style={{ color: '#1E3A8A', fontSize: '0.85rem', fontWeight: 850, fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.04em' }}>EXCLUSIVE DOORSTEP SERVICE — ELITE MECHANICS AT YOUR SERVICE!</span>
            </div>
 
            {typesLoading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.8rem' }}>
                {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: '12px' }} />)}
              </div>
            ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.8rem' }}>
              {serviceTypes.map((service) => (
                <button key={service.value} onClick={() => handleServiceSelect(service)}
                  style={{ textAlign: 'left', background: '#FFF', border: '1px solid rgba(156, 163, 175, 0.15)', borderRadius: '20px', padding: '1.5rem', cursor: 'pointer', transition: 'all 0.4s', width: '100%', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1E3A8A'; e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.06)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(156, 163, 175, 0.15)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.02)'; }}>
                  <h3 style={{ color: '#0F172A', fontWeight: 900, fontSize: '1rem', marginBottom: '0.2rem', fontFamily: 'Rajdhani, sans-serif' }}>{service.label.toUpperCase()}</h3>
                  <p style={{ color: '#64748B', fontSize: '0.75rem', marginBottom: '0.8rem', lineHeight: 1.4, fontWeight: 600 }}>{service.desc}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: '#1E3A8A', fontWeight: 900, fontFamily: 'Rajdhani, sans-serif', fontSize: '1.1rem' }}>{service.price}</span>
                    <ChevronRight size={18} style={{ color: '#1E3A8A' }} />
                  </div>
                </button>
              ))}
            </div>
            )}
          </div>
        )}
 
        {/* Step 2: Booking Form */}
        {step === 2 && selectedService && (
          <div className="animate-fadeInUp">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem', background: '#FFF', borderRadius: '16px', marginBottom: '1.5rem', border: '1px solid rgba(156, 163, 175, 0.15)', boxShadow: '0 8px 30px rgba(0,0,0,0.03)' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: '#0F172A', fontWeight: 950, fontSize: '1.25rem', fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.05em' }}>{selectedService.label}</h3>
                <span style={{ color: '#1E3A8A', fontWeight: 900, fontFamily: 'Rajdhani, sans-serif', fontSize: '1.15rem' }}>{selectedService.price}</span>
              </div>
              <button onClick={() => setStep(1)} style={{ background: '#0F172A', border: 'none', borderRadius: '8px', color: 'white', padding: '0.6rem 1.2rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 900, fontFamily: 'Rajdhani, sans-serif' }}>
                CHANGE
              </button>
            </div>
 
            <form onSubmit={handleSubmit(onSubmit)} style={{ background: '#FFF', border: '1px solid rgba(156, 163, 175, 0.15)', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 15px 50px rgba(0,0,0,0.05)' }}>
              <div className="svc-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 900, display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Car Brand *</label>
                  <input className="input-light" placeholder="e.g. Mercedes, BMW" {...register('bikeBrand', { required: 'Required' })} style={{ height: '48px', fontSize: '0.9rem', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', fontWeight: 600 }} />
                </div>
                <div>
                  <label style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 900, display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Car Model *</label>
                  <input className="input-light" placeholder="e.g. S-Class, M5" {...register('bikeModel', { required: 'Required' })} style={{ height: '48px', fontSize: '0.9rem', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', fontWeight: 600 }} />
                </div>
                <div>
                  <label style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 900, display: 'block', marginBottom: '0.3rem', textTransform: 'uppercase' }}>Date *</label>
                  <input type="date" className="input-light" {...register('scheduledDate', { required: 'Required' })} min={new Date().toISOString().split('T')[0]} style={{ height: '48px', fontSize: '0.9rem', background: '#F8FAFC', border: '1px solid #E2E8F0', fontWeight: 600 }} />
                </div>
                <div>
                  <label style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 900, display: 'block', marginBottom: '0.3rem', textTransform: 'uppercase' }}>Time *</label>
                  <select className="input-light" {...register('scheduledTime', { required: 'Required' })} style={{ height: '48px', fontSize: '0.9rem', background: '#F8FAFC', border: '1px solid #E2E8F0', fontWeight: 700 }}>
                    <option value="">Time slot</option>
                    {['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
 
              <div style={{ marginTop: '0.8rem' }}>
                <label style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 900, display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Description</label>
                <textarea className="input-light" rows={2} placeholder="Brief details about the service required..."
                  style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', resize: 'vertical', padding: '0.8rem', fontSize: '0.9rem', fontWeight: 600 }} {...register('problemDescription')} />
              </div>
              <div style={{ marginTop: '1rem', padding: '1rem', background: '#0F172A', borderRadius: '16px', border: 'none' }}>
                <div style={{ color: '#FFF', fontWeight: 950, fontFamily: 'Rajdhani, sans-serif', fontSize: '0.9rem', marginBottom: '0.6rem', letterSpacing: '0.05em' }}>PICKUP & DROP ADDRESS</div>
                <div className="svc-addr-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                  <input className="input-light" placeholder="Street" {...register('address.street')} style={{ height: '40px', fontSize: '0.8rem', fontWeight: 700 }} />
                  <input className="input-light" placeholder="City" {...register('address.city')} style={{ height: '40px', fontSize: '0.8rem', fontWeight: 700 }} />
                  <input className="input-light" placeholder="State" {...register('address.state')} style={{ height: '40px', fontSize: '0.8rem', fontWeight: 700 }} />
                  <input className="input-light" placeholder="Pin" {...register('address.pincode')} style={{ height: '40px', fontSize: '0.8rem', fontWeight: 700 }} />
                </div>
              </div>
 
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.2rem', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                  <input type="checkbox" value="true" {...register('isPickupDrop')} style={{ accentColor: '#1E3A8A', width: 22, height: 22 }} />
                  <span style={{ color: '#0F172A', fontSize: '0.9rem', fontWeight: 900, fontFamily: 'Rajdhani, sans-serif' }}>EXCLUSIVE PICKUP & DROP</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                  <input type="checkbox" value="true" {...register('isOneHourRepair')} style={{ accentColor: '#1E3A8A', width: 22, height: 22 }} />
                  <span style={{ color: '#0F172A', fontSize: '0.9rem', fontWeight: 900, fontFamily: 'Rajdhani, sans-serif' }}>PRIORITY EXPRESS SERVICE</span>
                </label>
              </div>
 
              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setStep(1)} className="btn-outline-dark" style={{ height: '46px', flex: 1, justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
                  Back
                </button>
                <button type="submit" className="btn-primary" style={{ height: '46px', flex: 2, justifyContent: 'center', fontWeight: 700, borderRadius: '10px', fontSize: '0.9rem' }} disabled={submitting}>
                  {submitting ? <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'CONFIRM BOOKING'}
                </button>
              </div>
            </form>
          </div>
        )}
 
        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="animate-fadeInUp" style={{ textAlign: 'center', padding: '1.5rem 1.2rem', background: '#FFF', borderRadius: '24px', border: '1px solid #EEE', boxShadow: '0 15px 50px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '4.5rem', marginBottom: '0.8rem', color: '#10B981' }}>✓</div>
            <h2 style={{ color: '#111', fontFamily: 'Rajdhani, sans-serif', fontSize: '2rem', fontWeight: 900, marginBottom: '0.4rem' }}>
              SERVICE <span style={{ color: '#1E3A8A' }}>CONFIRMED!</span>
            </h2>
            <p style={{ color: '#666', marginBottom: '1.2rem', fontSize: '0.95rem', fontWeight: 500 }}>Our specialist mechanic will arrive at your location as per schedule.</p>
            
            {/* Advance Payment Option - More compact & Blue themed */}
            {bookingId && !paid && (
              <div style={{ margin: '0 auto 1.8rem', maxWidth: 440, background: 'rgba(30,58,138,0.03)', border: '1.5px dashed rgba(30,58,138,0.15)', borderRadius: '20px', padding: '1.2rem' }}>
                <h4 style={{ color: '#1E3A8A', fontWeight: 950, marginBottom: '0.3rem', fontFamily: 'Rajdhani, sans-serif', fontSize: '1.05rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>PRIORITIZE YOUR BOOKING</h4>
                <p style={{ color: '#64748B', fontSize: '0.8rem', marginBottom: '1.2rem', fontWeight: 700 }}>
                  Pay ₹200 advance to get your car serviced on top priority.
                </p>
                <button onClick={handleAdvancePayment} disabled={paying}
                  style={{ width: '100%', padding: '0.85rem', background: paying ? '#E2E8F0' : '#1E3A8A', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 950, cursor: paying ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.08em', fontSize: '0.95rem', boxShadow: paying ? 'none' : '0 8px 25px rgba(30, 58, 138, 0.25)', transition: 'all 0.3s' }}>
                  <CreditCard size={18} /> {paying ? 'PROCESSING...' : 'PAY ₹200 & PRIORITIZE →'}
                </button>
              </div>
            )}
            {paid && (
              <div style={{ margin: '0 auto 1.8rem', maxWidth: 440, background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '16px', padding: '0.8rem' }}>
                <p style={{ color: '#10B981', fontSize: '0.85rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                   PRIORITY ADVANCE RECEIVED ✓
                </p>
              </div>
            )}
 
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/my-bookings')} className="btn-primary" style={{ padding: '0.8rem 2.2rem', fontWeight: 950, background: '#0F172A', border: 'none', borderRadius: '12px', fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.04em', fontSize: '0.9rem' }}>TRACK STATUS</button>
              <button onClick={() => { setStep(1); setSelectedService(null); setBookingId(null); setPaid(false); }} 
                style={{ padding: '0.8rem 2.2rem', fontWeight: 950, borderRadius: '12px', border: '2px solid rgba(30,58,138,0.2)', background: 'transparent', color: '#1E3A8A', cursor: 'pointer', fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.04em', fontSize: '0.9rem', transition: 'all 0.3s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(30,58,138,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                BOOK ANOTHER
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

