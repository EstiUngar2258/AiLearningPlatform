import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './AuthForms.css';

export default function AuthForms({ onRecaptchaToken }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { login, register } = useAuth();
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const recaptchaToken = await onRecaptchaToken(isRegister ? 'register' : 'login');
    setError('');
    try {
      if (isRegister) {
        await register(name, email, password, recaptchaToken);
      } else {
        await login(email, password, recaptchaToken);
      }
      // success: clear inputs and scroll to main content
      setName('');
      setEmail('');
      setPassword('');
      setIsRegister(false);
      const main = document.querySelector('.main-section');
      if (main) main.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      setError(err.message || 'Authentication failed');
    }
  };

  return (
    <div className="auth">
      <div className="auth-switch">
        <button 
          onClick={() => setIsRegister(false)} 
          className={!isRegister ? 'active' : ''}
        >
          כניסה
        </button>
        <button 
          onClick={() => setIsRegister(true)} 
          className={isRegister ? 'active' : ''}
        >
          הרשמה
        </button>
      </div>

  <form onSubmit={handleSubmit} className="form">
        {isRegister && (
          <label>
            שם
            <input 
              value={name} 
              onChange={e => setName(e.target.value)}
              required 
            />
          </label>
        )}
        <label>
          אימייל
          <input 
            type="email"
            value={email} 
            onChange={e => setEmail(e.target.value)}
            required 
          />
        </label>
        <label>
          סיסמה
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            required 
          />
        </label>
        <button type="submit">
          {isRegister ? 'הרשמה' : 'כניסה'}
        </button>
  {error && <div className="error-banner" style={{ marginTop: '0.75rem' }}>{error}</div>}
      </form>
    </div>
  );
}
