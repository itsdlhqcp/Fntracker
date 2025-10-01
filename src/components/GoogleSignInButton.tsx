import React from "react"

interface GoogleSignInButtonProps {
  onClick: () => void
  disabled?: boolean
  variant?: "default" | "outline" | "minimal"
  size?: "sm" | "md" | "lg"
  text?: string
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ 
  onClick, 
  disabled = false,
  variant = "default",
  size = "md",
  text
}) => {
  const GoogleIcon = () => (
    <svg className={`${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'}`} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )

  const LoadingSpinner = () => (
    <svg 
      className={`animate-spin ${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'}`} 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )

  const getButtonText = () => {
    if (text) return text
    if (disabled) return "Signing in..."
    return "Continue with Google"
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return "px-4 py-2 text-sm gap-2"
      case 'lg':
        return "px-8 py-4 text-lg gap-4"
      default:
        return "px-6 py-3 text-base gap-3"
    }
  }

  const getVariantClasses = () => {
    switch (variant) {
      case 'outline':
        return "bg-transparent border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
      case 'minimal':
        return "bg-transparent border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 shadow-none"
      default:
        return "bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm"
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full flex items-center justify-center font-medium rounded-xl
        focus:outline-none focus:ring-4 focus:ring-blue-100 
        transition-all duration-200 
        disabled:opacity-50 disabled:cursor-not-allowed
        ${getSizeClasses()}
        ${getVariantClasses()}
      `}
    >
      {disabled ? <LoadingSpinner /> : <GoogleIcon />}
      <span>{getButtonText()}</span>
    </button>
  )
}

export default GoogleSignInButton


