import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { authService } from '../services/auth'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
          }) => void
          renderButton: (
            element: HTMLElement,
            options: {
              theme?: 'outline' | 'filled_blue' | 'filled_black'
              size?: 'large' | 'medium' | 'small'
              width?: number
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
            }
          ) => void
          prompt: () => void
        }
      }
    }
  }
}

interface GoogleLoginProps {
  onSuccess: () => void
  onError?: (error: string) => void
}

export function GoogleLogin({ onSuccess, onError }: GoogleLoginProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = initializeGoogleSignIn
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const initializeGoogleSignIn = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

    console.log('🔍 Google Sign-In Debug:', {
      clientId: clientId ? `${clientId.substring(0, 20)}...` : 'MISSING',
      hasGoogleScript: !!window.google,
      buttonDivExists: !!document.getElementById('google-signin-button')
    })

    if (!clientId) {
      console.error('❌ Google Client ID not configured!')
      setError('Google Client ID not configured')
      setIsLoading(false)
      return
    }

    if (!window.google) {
      console.error('❌ Google Sign-In script failed to load')
      setError('Google Sign-In failed to load')
      setIsLoading(false)
      return
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
      })

      const buttonDiv = document.getElementById('google-signin-button')
      if (buttonDiv) {
        console.log('✅ Rendering Google Sign-In button...')
        window.google.accounts.id.renderButton(buttonDiv, {
          theme: 'filled_blue',
          size: 'large',
          width: 300,
          text: 'signin_with',
        })
        console.log('✅ Google Sign-In button rendered!')
      } else {
        console.error('❌ Button div not found!')
        setError('Button container not found')
      }
    } catch (err) {
      console.error('❌ Error initializing Google Sign-In:', err)
      setError('Failed to initialize Google Sign-In')
    }

    setIsLoading(false)
  }

  const handleCredentialResponse = async (response: { credential: string }) => {
    try {
      setIsLoading(true)
      setError(null)

      await authService.googleLogin(response.credential)
      onSuccess()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-mocha-base flex items-center justify-center px-4"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-gradient-to-br from-mocha-surface0 to-mocha-surface1 rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full border border-mocha-surface2"
      >
        {/* Animated Capybara */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: 'loop',
          }}
          className="text-8xl mb-8 text-center"
        >
          🦫
        </motion.div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-mocha-blue via-mocha-mauve to-mocha-sapphire bg-clip-text text-transparent mb-3 text-center">
          Welcome Back!
        </h1>

        <p className="text-mocha-text text-center mb-8 text-lg">
          Sign in to access your productivity paradise 🌸
        </p>

        {/* Google Sign-In Button */}
        <div className="flex flex-col items-center gap-4">
          {isLoading && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-4 border-mocha-blue border-t-transparent rounded-full"
            />
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-mocha-red/20 border border-mocha-red rounded-xl px-4 py-3 text-mocha-red text-center"
            >
              {error}
            </motion.div>
          )}

          {!isLoading && !error && (
            <div id="google-signin-button" className="w-full flex justify-center" />
          )}
        </div>

        {/* Motivational Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-mocha-subtext0 text-sm">
            がんばって！ Let's achieve greatness together! 💪✨
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
