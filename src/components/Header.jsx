import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link, useLocation, useNavigate } from 'react-router-dom'

function Header({ variant = 'default', onCreatePortfolio }) {
  const { user, logout, idToken } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false)
  const menuRef = React.useRef(null)
  
  const userName = React.useMemo(() => {
    if (!idToken) return 'User'
    try {
      const payload = JSON.parse(atob((idToken.split('.')[1]) || ''))
      return payload.name || payload.given_name || 'User'
    } catch (_) {
      return 'User'
    }
  }, [idToken])
  const userEmail = React.useMemo(() => {
    if (!idToken) return ''
    try {
      const payload = JSON.parse(atob((idToken.split('.')[1]) || ''))
      return payload.email || ''
    } catch (_) {
      return ''
    }
  }, [idToken])
  
  const isLogin = location.pathname.startsWith('/login')
  const handleNavigateDashboard = () => {
    navigate('/dashboard')
    setMenuOpen(false)
  }

  const handleOutsideClick = React.useCallback((e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setMenuOpen(false)
    }
  }, [])

  React.useEffect(() => {
    if (!menuOpen) return
    document.addEventListener('mousedown', handleOutsideClick)
    const onEsc = (e) => e.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [menuOpen, handleOutsideClick])
  
  return (
    <>
    <header className="bg-gradient-to-r from-blue-600/80 via-blue-500/70 to-orange-500/80 backdrop-blur-sm border-b border-blue-400/30 px-6 py-4 shadow-lg relative z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/90 rounded-lg flex items-center justify-center shadow-sm backdrop-blur-sm">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <Link to={user ? '/dashboard' : '/login'} className="text-xl font-bold text-white drop-shadow-sm">
            FinTracker
          </Link>
          {isLogin && (
            <span className="text-sm text-white/90 opacity-90 hidden sm:inline">Watch your growth</span>
          )}
        </div>
        {!isLogin && user && (
          <div className="flex items-center gap-3" ref={menuRef}>
            {/* Add / Create Portfolio button */}
            <button
              type="button"
              onClick={() => onCreatePortfolio && onCreatePortfolio()}
              className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/20 focus:outline-none"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v12m6-6H6" />
              </svg>
              <span className="hidden sm:inline">Create Portfolio</span>
              <span className="sm:hidden">ADD</span>
            </button>

            {/* Account dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/20 focus:outline-none"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <span className="hidden sm:inline">Account</span>
                <span className="sm:hidden">Acct</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`h-4 w-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                  aria-hidden
                >
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.134l3.71-3.903a.75.75 0 111.08 1.04l-4.24 4.464a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black/5 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-xs text-gray-500">Your account</div>
                    <div className="px-4 py-1 text-sm font-medium text-gray-800 truncate">{userEmail || userName}</div>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={handleNavigateDashboard}
                    >
                      Portfolios
                    </button>
                    <div className="my-1 border-t"></div>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => { setShowLogoutConfirm(true); setMenuOpen(false) }}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>

    {/* Confirm Logout Modal */}
    {!isLogin && showLogoutConfirm && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={() => setShowLogoutConfirm(false)}></div>
        <div className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-gray-900">Confirm logout</h3>
          <p className="mt-2 text-sm text-gray-600">Are you sure you want to logout?</p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(false)}
              className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => { setShowLogoutConfirm(false); logout() }}
              className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}

export default Header