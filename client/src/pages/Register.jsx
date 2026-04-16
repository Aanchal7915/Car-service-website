import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, Loader } from 'lucide-react';
import { useState } from 'react';

export default function Register() {
  const { register: registerUser, loading } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      await registerUser(data);
      toast.success('Account created! Welcome');
      navigate('/');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #1E3A8A, #172554)', borderRadius: '12px', padding: '12px 18px', boxShadow: '0 8px 25px rgba(30, 58, 138, 0.15)' }}>
              <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 950, color: 'white', fontSize: '1.6rem', letterSpacing: '0.05em' }}>AUTO</span>
            </div>
            <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 950, color: '#0F172A', fontSize: '1.8rem', letterSpacing: '0.05em' }}>XPRESS</span>
          </Link>
          <h1 style={{ color: '#111', fontSize: '1.8rem', fontWeight: 900, marginTop: '2rem', fontFamily: 'Rajdhani, sans-serif' }}>Create Account</h1>
          <p style={{ color: '#64748B', marginTop: '0.6rem', fontWeight: 600 }}>Join India's most elite car marketplace</p>
        </div>
 
        <div style={{ background: '#FFF', border: '1px solid #EEE', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {[
              { name: 'name', label: 'Full Name', icon: User, placeholder: 'John Doe', type: 'text', rules: { required: 'Name is required' } },
              { name: 'email', label: 'Email Address', icon: Mail, placeholder: 'you@example.com', type: 'email', rules: { pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } } },
              { name: 'phone', label: 'Mobile Number', icon: Phone, placeholder: '+91 98765 43210', type: 'tel', rules: {} },
            ].map(({ name, label, icon: Icon, placeholder, type, rules }) => (
              <div key={name} style={{ marginBottom: '1.5rem' }}>
                <label style={{ color: '#333', fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.6rem' }}>{label}</label>
                <div style={{ position: 'relative' }}>
                  <Icon size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#AAA' }} />
                  <input type={type} className="input-light" style={{ paddingLeft: '2.8rem', height: '52px' }} placeholder={placeholder} {...register(name, rules)} />
                </div>
                {errors[name] && <p style={{ color: '#1E3A8A', fontSize: '0.82rem', marginTop: '0.4rem', fontWeight: 700 }}>{errors[name].message}</p>}
              </div>
            ))}
 
            <div style={{ marginBottom: '1.8rem' }}>
              <label style={{ color: '#333', fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.6rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#AAA' }} />
                <input type={showPass ? 'text' : 'password'} className="input-light" style={{ paddingLeft: '2.8rem', paddingRight: '2.8rem', height: '52px' }}
                  placeholder="Min. 6 characters"
                  {...register('password', { required: 'Password required', minLength: { value: 6, message: 'Min 6 characters' } })} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#AAA', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p style={{ color: '#1E3A8A', fontSize: '0.82rem', marginTop: '0.4rem', fontWeight: 700 }}>{errors.password.message}</p>}
            </div>
 
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '1.8rem', lineHeight: 1.6, fontWeight: 500 }}>
              By creating an account, you agree to our{' '}
              <Link to="/terms" style={{ color: '#1E3A8A', textDecoration: 'none', fontWeight: 800 }}>Terms</Link> and{' '}
              <Link to="/privacy" style={{ color: '#1E3A8A', textDecoration: 'none', fontWeight: 800 }}>Privacy</Link>.
            </p>
 
            <button type="submit" className="btn-primary" 
              style={{ width: '100%', justifyContent: 'center', padding: '1.25rem', fontSize: '1.1rem', fontWeight: 950, borderRadius: '16px', background: '#1E3A8A', border: 'none', color: 'white', cursor: 'pointer', fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.1em', boxShadow: '0 12px 30px rgba(30, 58, 138, 0.25)', transition: 'all 0.3s' }} 
              disabled={loading}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.background = '#172554'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = '#1E3A8A'; }}>
              {loading ? <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <><ArrowRight size={20} /> AUTHORIZE ACCOUNT</>}
            </button>
          </form>
        </div>
 
        <p style={{ textAlign: 'center', color: '#64748B', marginTop: '2rem', fontSize: '1rem', fontWeight: 600 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#1E3A8A', textDecoration: 'none', fontWeight: 800 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

