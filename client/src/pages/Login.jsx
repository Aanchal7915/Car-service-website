import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { sendOTP } from '../api/authApi';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock, Mail, Phone, ArrowRight, Loader } from 'lucide-react';

export default function Login() {
  const { login, loginWithOTP, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('password'); // 'password' | 'otp'
  const [otpSent, setOtpSent] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const contactValue = watch('email') || watch('phone');

  const onSubmit = async (data) => {
    try {
      if (mode === 'password') {
        await login(data);
        toast.success('Welcome back!');
        navigate('/');
      } else if (mode === 'otp' && !otpSent) {
        await sendOTP({ email: data.email, phone: data.phone });
        setOtpSent(true);
        toast.success('OTP sent!');
      } else if (mode === 'otp' && otpSent) {
        await loginWithOTP({ email: data.email, phone: data.phone, otp: data.otp });
        toast.success('Welcome!');
        navigate('/');
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', borderRadius: '10px', padding: '10px 14px' }}>
              <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 800, color: 'white', fontSize: '1.4rem' }}>AUTO</span>
            </div>
            <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 800, color: '#111', fontSize: '1.6rem' }}>XPRESS</span>
          </Link>
          <h1 style={{ color: '#111', fontSize: '1.8rem', fontWeight: 900, marginTop: '2rem', fontFamily: 'Rajdhani, sans-serif' }}>Welcome Back</h1>
          <p style={{ color: '#666', marginTop: '0.5rem', fontWeight: 500 }}>Login to continue to your account</p>
        </div>
 
        {/* Mode toggle */}
        <div style={{ display: 'flex', background: '#F5F5F5', borderRadius: '12px', padding: '5px', marginBottom: '2.2rem', border: '1px solid #EEE' }}>
          {['password', 'otp'].map((m) => (
            <button key={m} onClick={() => { setMode(m); setOtpSent(false); }}
              style={{
                flex: 1, padding: '0.7rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: mode === m ? '#FFF' : 'transparent',
                color: mode === m ? '#2563EB' : '#888',
                fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.25s',
                boxShadow: mode === m ? '0 4px 12px rgba(37, 99, 235, 0.1)' : 'none'
              }}>
              {m === 'password' ? 'Password' : 'OTP Login'}
            </button>
          ))}
        </div>
 
        {/* Form card */}
        <div style={{ background: '#FFF', border: '1px solid #EEE', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Email */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ color: '#333', fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.6rem' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#AAA' }} />
                <input type="email" className="input-light" style={{ paddingLeft: '2.8rem', height: '52px' }}
                  placeholder="you@example.com"
                  {...register('email', { pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })} />
              </div>
              {errors.otp && <p style={{ color: '#2563EB', fontSize: '0.82rem', marginTop: '0.4rem', fontWeight: 600 }}>{errors.otp.message}</p>}
            </div>
 
            {/* For OTP - phone option */}
            {mode === 'otp' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ color: '#333', fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.6rem' }}>
                  Or Mobile Number
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#AAA' }} />
                  <input type="tel" className="input-light" style={{ paddingLeft: '2.8rem', height: '52px' }}
                    placeholder="+91 98765 43210"
                    {...register('phone')} />
                </div>
              </div>
            )}
 
            {/* Password */}
            {mode === 'password' && (
              <div style={{ marginBottom: '1.8rem' }}>
                <label style={{ color: '#333', fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.6rem' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#AAA' }} />
                  <input type={showPass ? 'text' : 'password'} className="input-light" style={{ paddingLeft: '2.8rem', paddingRight: '2.8rem', height: '52px' }}
                    placeholder="••••••••"
                    {...register('password', { required: 'Password is required' })} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#AAA', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p style={{ color: '#E53935', fontSize: '0.82rem', marginTop: '0.4rem', fontWeight: 600 }}>{errors.password.message}</p>}
              </div>
            )}
 
            {/* OTP Input */}
            {mode === 'otp' && otpSent && (
              <div style={{ marginBottom: '1.8rem' }}>
                <label style={{ color: '#333', fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.6rem' }}>Enter OTP</label>
                <input type="text" className="input-light" placeholder="6-digit OTP"
                  maxLength={6} style={{ textAlign: 'center', fontSize: '1.4rem', letterSpacing: '0.6rem', height: '60px' }}
                  {...register('otp', { required: 'OTP is required', minLength: { value: 6, message: 'Enter 6 digits' } })} />
                {errors.otp && <p style={{ color: '#E53935', fontSize: '0.82rem', marginTop: '0.4rem', fontWeight: 600 }}>{errors.otp.message}</p>}
              </div>
            )}
 
            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1.1rem', fontSize: '1.05rem', fontWeight: 700, borderRadius: '12px' }} disabled={loading}>
              {loading ? <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} /> : (
                <>
                  {mode === 'password' ? 'LOGIN' : otpSent ? 'VERIFY OTP' : 'SEND OTP'}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>
 
        <p style={{ textAlign: 'center', color: '#666', marginTop: '2rem', fontSize: '0.95rem', fontWeight: 500 }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#2563EB', textDecoration: 'none', fontWeight: 700 }}>Sign Up Now</Link>
        </p>
      </div>
    </div>
  );
}
