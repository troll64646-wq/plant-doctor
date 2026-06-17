import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import App from './pages/App'
import Pricing from './pages/Pricing'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/diagnose" element={<App />} />
        <Route path="/pricing" element={<Pricing />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
)
