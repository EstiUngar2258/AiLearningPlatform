import { useState } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { useNavigate } from 'react-router-dom';
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
    
    // Basic client-side validation
    if (!email || !password) {
      setError('נא למלא את כל השדות הנדרשים');
      return;
    }

    if (email.length < 5 || !email.includes('@')) {
      setError('נא להזין כתובת אימייל תקינה');
      return;
    }

    if (password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }

    const recaptchaToken = await onRecaptchaToken(isRegister ? 'register' : 'login');
    setError('');
    
    try {
      let result;
      if (isRegister) {
        result = await register(name, email, password, recaptchaToken);
      } else {
        result = await login(email, password, recaptchaToken);
      }

      // Clear form
      setName('');
      setEmail('');
      setPassword('');
      setIsRegister(false);

      // Show welcome message and redirect
      if (result?.message) {
        // You could use a toast notification here
        console.log(result.message);
      }

      // Navigate to prompts page
      window.location.href = '/prompts';
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'אירעה שגיאה בתהליך ההתחברות';
      setError(errorMessage);

      if (err.response?.data?.fields) {
        // Handle field-specific errors if needed
        const fields = err.response.data.fields;
        // You could highlight specific fields with errors
        console.log('Field errors:', fields);
      }
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
