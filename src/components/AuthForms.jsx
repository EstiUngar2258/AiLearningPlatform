import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthForms({ onRecaptchaToken }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const recaptchaToken = await onRecaptchaToken(isRegister ? 'register' : 'login');
    
    try {
      if (isRegister) {
        await register(name, email, password, recaptchaToken);
      } else {
        await login(email, password, recaptchaToken);
      }
    } catch (err) {
      alert(err.message);
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
      </form>
    </div>
  );
}
