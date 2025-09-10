import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [userId, setUserId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [subCategoryId, setSubCategoryId] = useState('')
  const [promptText, setPromptText] = useState(`תכין שיעור מבוא לאלגברה לכיתה ח'`)
  const [result, setResult] = useState(null)
  const [errorBanner, setErrorBanner] = useState('')
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '')
  const [email, setEmail] = useState('esti.demo1@example.com')
  const [password, setPassword] = useState('password123')
  const [name, setName] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || ''
  const [recaptchaReady, setRecaptchaReady] = useState(false)

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => { setCategories(data); if (data[0]) setCategoryId(data[0]._id) })

    fetch('/api/subcategories')
      .then(r => r.json())
      .then(data => { setSubcategories(data); if (data[0]) setSubCategoryId(data[0]._id) })

    fetch('/api/users')
      .then(r => r.json())
      .then(data => { if (data[0]) setUserId(data[0]._id) })
  }, [])

  useEffect(() => {
    if (!token) {
      setUserName('')
      localStorage.removeItem('userName')
      return
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
      if (payload && payload.name) {
        setUserName(payload.name)
        localStorage.setItem('userName', payload.name)
      }
    } catch (err) {
      // ignore decode errors
    }
  }, [token])

  // load reCAPTCHA script when site key provided
  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) return
    const id = 'recaptcha-script'
    if (document.getElementById(id)) { setRecaptchaReady(true); return }
    const s = document.createElement('script')
    s.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`
    s.id = id
    s.onload = () => setRecaptchaReady(true)
    document.head.appendChild(s)
  }, [])

  async function getRecaptchaToken(action = 'auth') {
    if (!RECAPTCHA_SITE_KEY || !recaptchaReady || !window.grecaptcha) return null
    try {
      const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action })
      return token
    } catch (e) {
      return null
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const body = {
      user: userId,
      category: categoryId,
      subCategory: subCategoryId,
      prompt: promptText,
      meta: { userName: userName || 'מורה', categoryName: categories.find(c => c._id === categoryId)?.name, subCategoryName: subcategories.find(s => s._id === subCategoryId)?.name }
    }
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    try {
      const res = await fetch('/api/prompts', { method: 'POST', headers, body: JSON.stringify(body) })
      const json = await res.json()
      if (!res.ok) {
        // detect common OpenAI 401 message inside the error text
        if (res.status === 401 || (json && typeof json.error === 'string' && json.error.toLowerCase().includes('incorrect api key'))) {
          setErrorBanner('שגיאת מפתח AI: המפתח במערכת אינו תקין או נפסל. עדכן את OPENAI_API_KEY בשרת.');
        } else {
          setErrorBanner(json.error || 'שגיאה בבקשה ל־AI');
        }
        setResult(null)
      } else {
        setErrorBanner('')
        setResult(json)
      }
    } catch (err) {
      setErrorBanner('שגיאת רשת: ' + (err.message || 'התראה לא ידועה'))
      setResult(null)
    }
  }

  async function handleLogin(e) {
    e.preventDefault()
    const recaptchaToken = await getRecaptchaToken('login')
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, recaptchaToken }) })
    const json = await res.json()
    if (json.token) {
      setToken(json.token)
      localStorage.setItem('token', json.token)
      setUserId(json.user._id)
      setUserName(json.user.name)
    } else {
      alert('Login failed: ' + (json.error || JSON.stringify(json)))
    }
  }

  async function handleRegister(e) {
    e.preventDefault()
    const recaptchaToken = await getRecaptchaToken('register')
    const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password, recaptchaToken }) })
    const json = await res.json()
    if (json.token) {
      setToken(json.token)
      localStorage.setItem('token', json.token)
      setUserId(json.user._id)
      setUserName(json.user.name)
    } else {
      alert('Register failed: ' + (json.error || JSON.stringify(json)))
    }
  }

  function handleLogout() {
    setToken('')
    localStorage.removeItem('token')
    setUserId('')
    setUserName('')
    localStorage.removeItem('userName')
  }

  return (
    <div className="app">
      <h1>AI Learning — Demo</h1>

      {errorBanner && (
        <div className="error-banner">{errorBanner}</div>
      )}

      {!token ? (
        <div className="auth">
          <div className="auth-switch">
            <button onClick={() => setIsRegister(false)} className={!isRegister ? 'active' : ''}>כניסה</button>
            <button onClick={() => setIsRegister(true)} className={isRegister ? 'active' : ''}>הרשמה</button>
          </div>
          <div className="recaptcha-note">{RECAPTCHA_SITE_KEY ? (recaptchaReady ? 'reCAPTCHA מוכן' : 'טוען reCAPTCHA...') : 'reCAPTCHA לא מוגדר'}</div>

          {!isRegister ? (
            <form onSubmit={handleLogin} className="form">
              <label>Email
                <input value={email} onChange={e => setEmail(e.target.value)} />
              </label>
              <label>Password
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
              </label>
              <button type="submit">כניסה</button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="form">
              <label>Name
                <input value={name} onChange={e => setName(e.target.value)} />
              </label>
              <label>Email
                <input value={email} onChange={e => setEmail(e.target.value)} />
              </label>
              <label>Password
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
              </label>
              <button type="submit">הרשמה</button>
            </form>
          )}
        </div>
      ) : (
        <div className="app-main">
          <div className="top-row">
            <div className="user-info">מחובר כ: <strong>{userName || 'משתמש'}</strong></div>
            <div><button className="btn-logout" onClick={handleLogout}>התנתק</button></div>
          </div>

          <form onSubmit={handleSubmit} className="form">
            <label>קטגוריה
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </label>

            <label>תת-קטגוריה
              <select value={subCategoryId} onChange={e => setSubCategoryId(e.target.value)}>
                {subcategories.filter(s => !s.category || s.category == categoryId || s.category?._id == categoryId).map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </label>

            <label>Prompt
              <textarea value={promptText} onChange={e => setPromptText(e.target.value)} rows={4} />
            </label>

            <button type="submit">שלח ל־AI</button>
          </form>
        </div>
      )}

      {result && (
        <div className="result">
          <h2>Response</h2>
          <pre>{JSON.stringify(result.parsedResponse || result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

export default App
