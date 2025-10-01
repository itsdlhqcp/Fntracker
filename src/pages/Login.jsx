import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import GoogleSignInButton from '../components/GoogleSignInButton'
import Header from '../components/Header'
import { Navigate } from 'react-router-dom'

const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* SVG animation */}
      <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1200 800">
        <path d="M0,400 Q300,200 600,400 T1200,400"
          stroke="url(#gradient1)" strokeWidth="2" fill="none" className="animate-pulse" />
        <path d="M0,300 Q400,100 800,300 T1200,300"
          stroke="url(#gradient2)" strokeWidth="1.5" fill="none" className="animate-pulse"
          style={{ animationDelay: "1s" }} />
        <path d="M0,500 Q200,300 400,500 T800,500 T1200,500"
          stroke="url(#gradient3)" strokeWidth="1" fill="none" className="animate-pulse"
          style={{ animationDelay: "2s" }} />
        <path d="M0,600 Q150,450 300,600 Q450,750 600,600 Q750,450 900,600 Q1050,750 1200,600"
          stroke="url(#gradient4)" strokeWidth="1.5" fill="none" className="animate-pulse"
          style={{ animationDelay: "3s" }} />
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>
      </svg>

      {/* Floating dots */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full opacity-20 animate-bounce"
        style={{ animationDelay: "0s", animationDuration: "3s" }} />
      <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-green-400 rounded-full opacity-20 animate-bounce"
        style={{ animationDelay: "1s", animationDuration: "4s" }} />
      <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-purple-400 rounded-full opacity-20 animate-bounce"
        style={{ animationDelay: "2s", animationDuration: "5s" }} />
      <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-orange-400 rounded-full opacity-15 animate-bounce"
        style={{ animationDelay: "3s", animationDuration: "6s" }} />
      <div className="absolute bottom-1/4 right-1/5 w-1 h-1 bg-indigo-400 rounded-full opacity-15 animate-bounce"
        style={{ animationDelay: "4s", animationDuration: "4.5s" }} />
      <div className="absolute top-3/4 left-1/5 w-2 h-2 bg-teal-400 rounded-full opacity-10 animate-bounce"
        style={{ animationDelay: "5s", animationDuration: "3.5s" }} />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>
    </div>
  )
}

function Login() {
  const { login, loading, error, clearError, user } = useAuth()

  // ✅ Redirect if already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col relative">
      <AnimatedBackground />
      <Header />

      <main className="flex flex-1 items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          {/* Logo & Heading */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to access your financial dashboard</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4">
              <div className="flex">
                <div className="flex-1">
                  <p className="text-sm text-red-700">{error}</p>
                  <button
                    type="button"
                    className="mt-2 text-sm text-red-700 underline hover:text-red-800 transition-colors"
                    onClick={clearError}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Google Sign-in */}
          <div className="mb-8">
            <GoogleSignInButton onClick={login} disabled={loading} />
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-gray-500 leading-relaxed">
              By continuing, you agree to our{" "}
              <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Login
