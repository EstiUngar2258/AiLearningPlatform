import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import './styles/index.css'
import App from './App.jsx'
import { AuthProvider } from './providers/AuthProvider'
import { DataProvider } from './context/DataContext.jsx'
import ErrorBoundary from './components/common/ErrorBoundary'

const root = createRoot(document.getElementById('root'));

root.render(
  <StrictMode>
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <DataProvider>
            <App />
          </DataProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  </StrictMode>
);
