import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyBookings } from '../api/serviceApi';
import { getMySellRequests, getMyOrders } from '../api/storeApi';
import { getMyEnquiries } from '../api/bikeApi';
import { useNavigate } from 'react-router-dom';
import { PageLoader } from '../components/common/LoadingSpinner';
import { Wrench, TrendingUp, ShoppingBag, Clock, CheckCircle, XCircle, Loader, MessageSquare } from 'lucide-react';

const statusBadge = (status) => {
  const map = {
    requested: 'badge-orange', accepted: 'badge-blue', in_progress: 'badge-blue',
    completed: 'badge-green', cancelled: 'badge-red',
    pending: 'badge-orange', under_review: 'badge-blue', approved: 'badge-green',
    rejected: 'badge-red', placed: 'badge-blue', confirmed: 'badge-blue',
    shipped: 'badge-orange', delivered: 'badge-green',
  };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status?.replace(/_/g, ' ')}</span>;
};

export default function MyBookings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('services');
  const [services, setServices] = useState([]);
  const [sells, setSells] = useState([]);
  const [orders, setOrders] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    Promise.allSettled([getMyBookings(), getMySellRequests(), getMyOrders(), getMyEnquiries()])
      .then((results) => {
        if (results[0].status === 'fulfilled') setServices(results[0].value.data.bookings);
        if (results[1].status === 'fulfilled') setSells(results[1].value.data.requests);
        if (results[2].status === 'fulfilled') setOrders(results[2].value.data.orders);
        if (results[3].status === 'fulfilled') setEnquiries(results[3].value.data.enquiries || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const tabs = [
    { id: 'services', label: `Services (${services.length})`, icon: Wrench },
    { id: 'enquiries', label: `Buy Requests (${enquiries.length})`, icon: MessageSquare },
    { id: 'sells', label: `Sell Requests (${sells.length})`, icon: TrendingUp },
    { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF' }}>
      <div style={{ background: '#F9F9F9', borderBottom: '1px solid #EEE', padding: '2.5rem 0' }}>
        <div className="max-w-4xl mx-auto px-4">
          <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2.8rem', fontWeight: 950, color: '#0F172A', letterSpacing: '0.02em' }}>
            MY <span style={{ color: '#2563EB' }}>DASHBOARD</span>
          </h1>
          <p style={{ color: '#64748B', marginTop: '0.6rem', fontWeight: 600, fontSize: '1.1rem' }}>Track your premium services, showroom requests, and orders</p>
 
          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.8rem', overflowX: 'auto', paddingBottom: '5px' }} className="hide-scrollbar">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  padding: '0.8rem 1.6rem', borderRadius: '14px', border: '2px solid',
                  borderColor: activeTab === id ? '#2563EB' : '#E2E8F0',
                  background: activeTab === id ? '#EFF6FF' : '#F8FAFC',
                  color: activeTab === id ? '#2563EB' : '#64748B',
                  cursor: 'pointer', fontSize: '0.95rem', fontWeight: 900, transition: 'all 0.3s',
                  whiteSpace: 'nowrap',
                  boxShadow: activeTab === id ? '0 10px 25px rgba(37, 99, 235, 0.15)' : 'none',
                  fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.05em'
                }}>
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>
        </div>
      </div>
 
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* SERVICE BOOKINGS */}
        {activeTab === 'services' && (
          <div className="animate-fadeInUp">
            {services.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#F9F9F9', borderRadius: '24px', border: '1.5px dashed #EEE' }}>
                <div style={{ background: '#FFF', width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
                  <Wrench size={40} style={{ color: '#CCC' }} />
                </div>
                <p style={{ color: '#888', fontSize: '1.1rem', fontWeight: 500, marginBottom: '2rem' }}>No service bookings yet</p>
                <button onClick={() => navigate('/services')} className="btn-primary" style={{ padding: '0.8rem 2.5rem', fontWeight: 700 }}>Book a Service</button>
              </div>
            ) : services.map((booking) => (
              <div key={booking._id} style={{ background: '#FFF', border: '1px solid #EEE', borderRadius: '20px', padding: '1.8rem', marginBottom: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', transition: 'all 0.3s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#111'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#EEE'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ flex: 1, minWidth: '250px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.8rem' }}>
                      <div style={{ background: '#F8FAFC', width: 44, height: 44, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(37, 99, 235, 0.15)', border: '1.5px solid rgba(37, 99, 235, 0.2)' }}>
                        <Wrench size={20} style={{ color: '#2563EB' }} />
                      </div>
                      <div>
                        <h3 style={{ color: '#111', fontWeight: 900, fontFamily: 'Rajdhani, sans-serif', fontSize: '1.25rem', lineHeight: 1 }}>{booking.serviceLabel}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                          {statusBadge(booking.status)}
                        </div>
                      </div>
                    </div>
                    <p style={{ color: '#555', fontSize: '0.95rem', fontWeight: 600 }}>
                      {booking.bikeBrand} {booking.bikeModel}
                    </p>
                    <p style={{ color: '#888', fontSize: '0.88rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={14} /> {new Date(booking.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} at {booking.scheduledTime}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    {booking.estimatedCost && (
                      <div style={{ background: '#EFF6FF', padding: '0.8rem 1.2rem', borderRadius: '14px', border: '1px solid rgba(37, 99, 235, 0.1)' }}>
                        <div style={{ color: '#2563EB', fontSize: '0.75rem', fontWeight: 950, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'Rajdhani, sans-serif' }}>ESTIMATED COST</div>
                        <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.6rem', fontWeight: 950, color: '#0F172A' }}>₹{booking.estimatedCost?.toLocaleString('en-IN')}</div>
                      </div>
                    )}
                    {booking.payment && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: booking.payment.status === 'paid' ? '#2E7D32' : '#FB8C00', fontWeight: 800, fontSize: '0.8rem', padding: '0.2rem 0.6rem', background: booking.payment.status === 'paid' ? 'rgba(46,125,50,0.06)' : 'rgba(251,140,0,0.06)', borderRadius: '999px' }}>
                        {booking.payment.status === 'paid' ? '✓ ADVANCE PAID' : 'PENDING PAYMENT'}
                      </div>
                    )}
                  </div>
                </div>
 
                {/* Status Timeline */}
                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #F5F5F5' }}>
                  <div style={{ display: 'flex', gap: '0' }}>
                    {['requested', 'accepted', 'in_progress', 'completed'].map((s, i) => {
                      const statusOrder = ['requested', 'accepted', 'in_progress', 'completed'];
                      const currentIdx = statusOrder.indexOf(booking.status);
                      const stepIdx = statusOrder.indexOf(s);
                      const isComplete = stepIdx <= currentIdx;
                      return (
                        <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            {i > 0 && <div style={{ flex: 1, height: 3, background: isComplete ? '#2563EB' : '#F1F5F9' }} />}
                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: isComplete ? '#2563EB' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: isComplete ? '0 6px 15px rgba(37, 99, 235, 0.25)' : 'none' }}>
                              {isComplete ? <CheckCircle size={14} color="white" /> : <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#CCC' }} />}
                            </div>
                            {i < 3 && <div style={{ flex: 1, height: 3, background: stepIdx < currentIdx ? '#2563EB' : '#F1F5F9' }} />}
                          </div>
                          <span style={{ color: isComplete ? '#111' : '#AAA', fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 800, textTransform: 'capitalize', fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.02em' }}>{s.replace('_', ' ')}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
 
        {/* SELL REQUESTS */}
        {activeTab === 'sells' && (
          <div className="animate-fadeInUp">
            {sells.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#F9F9F9', borderRadius: '24px', border: '1.5px dashed #EEE' }}>
                <div style={{ background: '#FFF', width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
                  <TrendingUp size={40} style={{ color: '#CCC' }} />
                </div>
                <p style={{ color: '#888', fontSize: '1.1rem', fontWeight: 500, marginBottom: '2rem' }}>No valuation requests yet</p>
                <button onClick={() => navigate('/sell')} className="btn-primary" style={{ background: '#0F172A', padding: '0.8rem 2.5rem', fontWeight: 900, borderRadius: '14px' }}>Sell a Car</button>
              </div>
            ) : sells.map((req) => (
              <div key={req._id} style={{ background: '#FFF', border: '1px solid #EEE', borderRadius: '20px', padding: '1.8rem', marginBottom: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', transition: 'all 0.3s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#111'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#EEE'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.8rem' }}>
                      <div style={{ position: 'relative' }}>
                        {req.images && req.images.length > 0 ? (
                          <img src={req.images[0]} alt={req.model} style={{ width: 80, height: 60, borderRadius: '12px', objectFit: 'cover', border: '1px solid #EEE' }} />
                        ) : (
                          <div style={{ background: 'rgba(46,125,50,0.05)', width: 44, height: 44, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(46,125,50,0.1)' }}>
                            <TrendingUp size={20} style={{ color: '#2E7D32' }} />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 style={{ color: '#111', fontWeight: 900, fontFamily: 'Rajdhani, sans-serif', fontSize: '1.3rem', lineHeight: 1 }}>{req.brand} {req.model}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                          <span style={{ color: '#666', fontSize: '0.85rem', fontWeight: 600 }}>{req.year} Model</span>
                          {statusBadge(req.status)}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                      <div style={{ background: '#F5F5F5', padding: '0.3rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem', color: '#555', fontWeight: 700 }}>Condition: {req.condition}</div>
                      <div style={{ background: '#F5F5F5', padding: '0.3rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem', color: '#555', fontWeight: 700 }}>KMs: {req.kmDriven?.toLocaleString()}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    {req.offeredPrice ? (
                      <div style={{ background: '#EFF6FF', padding: '0.8rem 1.2rem', borderRadius: '14px', border: '1px solid rgba(37, 99, 235, 0.1)' }}>
                        <div style={{ color: '#2563EB', fontSize: '0.75rem', fontWeight: 950, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'Rajdhani, sans-serif' }}>FINAL OFFER</div>
                        <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.8rem', fontWeight: 950, color: '#0F172A' }}>₹{req.offeredPrice?.toLocaleString('en-IN')}</div>
                      </div>
                    ) : req.estimatedPrice && (
                      <div style={{ color: '#2563EB', fontWeight: 950, fontFamily: 'Rajdhani, sans-serif', fontSize: '1.4rem', letterSpacing: '0.02em' }}>EST: ₹{req.estimatedPrice?.toLocaleString('en-IN')}</div>
                    )}
                  </div>
                </div>
                {/* Pickup info */}
                {req.pickupAddress && (
                  <div style={{ marginTop: '1.2rem', paddingTop: '1.2rem', borderTop: '1px solid #F5F5F5', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ background: 'rgba(37, 99, 235, 0.08)', padding: '0.5rem', borderRadius: '10px' }}>
                      <CheckCircle size={16} style={{ color: '#2563EB' }} />
                    </div>
                    <span style={{ color: '#64748B', fontSize: '0.9rem', fontWeight: 700 }}>
                      Inspection Scheduled: {[req.pickupAddress.street, req.pickupAddress.city].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
 
        {/* ORDERS */}
        {activeTab === 'orders' && (
          <div className="animate-fadeInUp">
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#F9F9F9', borderRadius: '24px', border: '1.5px dashed #EEE' }}>
                <div style={{ background: '#FFF', width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
                  <ShoppingBag size={40} style={{ color: '#CCC' }} />
                </div>
                <p style={{ color: '#888', fontSize: '1.1rem', fontWeight: 500, marginBottom: '2rem' }}>No orders yet</p>
                <button onClick={() => navigate('/parts')} className="btn-primary" style={{ background: '#0F172A', padding: '0.8rem 2.5rem', fontWeight: 900, borderRadius: '14px' }}>Browse Genuine Spares</button>
              </div>
            ) : orders.map((order) => (
              <div key={order._id} style={{ background: '#FFF', border: '1px solid #EEE', borderRadius: '20px', padding: '1.8rem', marginBottom: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', transition: 'all 0.3s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#111'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#EEE'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.2rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <div style={{ background: '#F5F5F5', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, color: '#111', fontFamily: 'monospace' }}>#{order._id.slice(-8).toUpperCase()}</div>
                      {statusBadge(order.status)}
                    </div>
                    <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '0.6rem', fontWeight: 600 }}>Ordered: {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • Payment: {order.payment.method.toUpperCase()}</p>
                  </div>
                  <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.8rem', fontWeight: 900, color: '#111' }}>
                    ₹{order.total?.toLocaleString('en-IN')}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                  {order.items?.map((item) => (
                    <div key={item._id} style={{ fontSize: '0.8rem', color: '#0F172A', background: '#F8FAFC', padding: '0.4rem 0.8rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontWeight: 800 }}>
                      {item.name} <span style={{ color: '#2563EB' }}>×{item.quantity}</span>
                    </div>
                  ))}
                </div>
                {/* Order status timeline */}
                <div style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #F5F5F5' }}>
                  <div style={{ display: 'flex', gap: '0' }}>
                    {['placed', 'confirmed', 'shipped', 'delivered'].map((s, i) => {
                      const statusOrder = ['placed', 'confirmed', 'shipped', 'delivered'];
                      const currentIdx = statusOrder.indexOf(order.status);
                      const stepIdx = statusOrder.indexOf(s);
                      const isComplete = stepIdx <= currentIdx;
                      return (
                        <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            {i > 0 && <div style={{ flex: 1, height: 3, background: isComplete ? '#2563EB' : '#F1F5F9' }} />}
                            <div style={{ width: 22, height: 22, borderRadius: '50%', background: isComplete ? '#2563EB' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {isComplete ? <CheckCircle size={14} color="white" /> : <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#CBD5E1' }} />}
                            </div>
                            {i < 3 && <div style={{ flex: 1, height: 3, background: stepIdx < currentIdx ? '#2563EB' : '#F1F5F9' }} />}
                          </div>
                          <span style={{ color: isComplete ? '#111' : '#AAA', fontSize: '0.72rem', marginTop: '0.4rem', fontWeight: 800, textTransform: 'uppercase', fontFamily: 'Rajdhani, sans-serif' }}>{s}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* CAR ENQUIRIES */}
        {activeTab === 'enquiries' && (
          <div className="animate-fadeInUp">
            {enquiries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#F9F9F9', borderRadius: '24px', border: '1.5px dashed #EEE' }}>
                <div style={{ background: '#FFF', width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
                  <MessageSquare size={40} style={{ color: '#CCC' }} />
                </div>
                <p style={{ color: '#888', fontSize: '1.1rem', fontWeight: 500, marginBottom: '2rem' }}>No showroom requests yet</p>
                <button onClick={() => navigate('/bikes')} className="btn-primary" style={{ background: '#0F172A', padding: '0.8rem 2.5rem', fontWeight: 900, borderRadius: '14px' }}>Browse Cars</button>
              </div>
            ) : enquiries.map((enq) => (
              <div key={enq._id} style={{ background: '#FFF', border: '1px solid #EEE', borderRadius: '20px', padding: '1.8rem', marginBottom: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', transition: 'all 0.3s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#111'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#EEE'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.8rem' }}>
                      <div style={{ position: 'relative' }}>
                        {enq.bike?.images?.[0] ? (
                          <img src={enq.bike.images[0]} alt={enq.bike.model} style={{ width: 80, height: 60, borderRadius: '12px', objectFit: 'cover', border: '1px solid #EEE' }} />
                        ) : (
                          <div style={{ background: '#EFF6FF', width: 80, height: 60, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid rgba(37, 99, 235, 0.15)' }}>
                            <MessageSquare size={20} style={{ color: '#2563EB' }} />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 style={{ color: '#111', fontWeight: 900, fontFamily: 'Rajdhani, sans-serif', fontSize: '1.3rem', lineHeight: 1 }}>{enq.bike?.brand} {enq.bike?.model}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                          <span style={{ color: '#666', fontSize: '0.85rem', fontWeight: 600 }}>Enquiry Date: {new Date(enq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                          {statusBadge(enq.status)}
                        </div>
                      </div>
                    </div>
                    {enq.message && (
                      <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', fontSize: '0.95rem', color: '#334155', fontWeight: 700, borderLeft: '4px solid #2563EB' }}>
                        "{enq.message}"
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.6rem', fontWeight: 950, color: '#2563EB' }}>
                      ₹{enq.bike?.discountedPrice || enq.bike?.price?.toLocaleString('en-IN')}
                    </div>
                    <div style={{ color: '#888', fontSize: '0.75rem', fontWeight: 700, marginTop: '0.3rem' }}>Registered Ph: {enq.phone || 'N/A'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
