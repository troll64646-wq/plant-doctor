import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Home from './pages/Home'
import Login from './pages/Login'
import App from './pages/App'
import Pricing from './pages/Pricing'
import History from './pages/History'
import Plants from './pages/Plants'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/diagnose" element={<App />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/history" element={<History />} />
          <Route path="/plants" element={<Plants />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
)
