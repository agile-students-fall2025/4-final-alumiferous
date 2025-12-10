import React, { useState, useEffect } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'

const Login = props => {
  let [urlSearchParams] = useSearchParams() // Get query params

  // variable for navigation
  const navigate = useNavigate()

  // State for toggle between login and signup
  const [isLogin, setIsLogin] = useState(true)
  
  // create state variables to hold form data
  const [status, setStatus] = useState({}) 
  const [errorMessage, setErrorMessage] = useState(``) 

  // if the user got here by trying to access our Protected page, there will be a query string parameter called 'error' with the value 'protected'
  useEffect(() => {
    const qsError = urlSearchParams.get('error')
    if (qsError === 'protected')
      setErrorMessage('Please log in to use app.')
  }, [])
  

  const handleSubmit = async e => {
    e.preventDefault()

    try {
      // Get form data
      const email = e.target.email.value
      const password = e.target.password.value
      const firstName = isLogin ? null : e.target.firstName.value
      const lastName = isLogin ? null : e.target.lastName.value

      // Call the backend API
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup'
      const payload = isLogin 
        ? { email, password }
        : { email, password, firstName, lastName }

      console.log(`Sending ${isLogin ? 'login' : 'signup'} request to backend...`)
      
      const response = await axios.post(endpoint, payload)
      const data = response.data
      console.log('Login response data:', data)

      if (data.success) {
        console.log(`User successfully ${isLogin ? 'logged in' : 'signed up'}:`, data.userId)

        if (data.userId) {
          localStorage.setItem('userId', data.userId)
          localStorage.setItem('currentUserId', data.userId)
        }
        if (data.username) {
          localStorage.setItem('username', data.username)
        }
        if (data.token) {
          localStorage.setItem('token', data.token)
        }
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('currentUser', JSON.stringify(data.user));
        }

        // Update local state
        setStatus({
          success: true,
          userId: data.userId,
          token: data.token,
        })
        setErrorMessage('')
        
        // Navigate based on login/signup
        if (isLogin) {
          navigate('/home')        // regular login goes straight home
        } else {
          navigate('/onboarding')  // new user goes to onboarding flow
        }
      } else {
        setErrorMessage(data.message || 'Authentication failed')
      }
    } catch (err) {
      console.error('Authentication error:', err)
      setErrorMessage(err.response?.data?.message || 'An error occurred. Please try again.')
    }
  }

  // Show combined login/signup form
  if (!status.success)
    return (
      <div className="w-screen h-screen m-0 px-5 py-6 md:px-8 md:py-8 bg-white dark:bg-[#121212] text-[#222] dark:text-[#f1f1f1] flex flex-col justify-center items-stretch md:items-center">
        <div className="w-full max-w-[450px]">
          <h1 className="text-center mb-5 font-semibold font-fantasy text-[1.8em]">InstaSkill</h1>
          
          {/* Toggle buttons */}
          <div className="flex mb-6 border-2 border-[#a8a8a8] dark:border-[#333] rounded-[25px] overflow-hidden bg-white dark:bg-[#121212]">
            <button 
              type="button"
              className={`flex-1 py-4 px-5 border-none font-medium text-base cursor-pointer transition-all duration-300 ${
                isLogin 
                  ? 'bg-primary dark:bg-primary text-white' 
                  : 'bg-transparent text-[#666] dark:text-[#ccc] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] hover:text-[#333] dark:hover:text-white'
              }`}
              onClick={() => {
                setIsLogin(true)
                setErrorMessage('')
              }}
            >
              Log In
            </button>
            <button 
              type="button"
              className={`flex-1 py-4 px-5 border-none font-medium text-base cursor-pointer transition-all duration-300 ${
                !isLogin 
                  ? 'bg-primary dark:bg-primary text-white' 
                  : 'bg-transparent text-[#666] dark:text-[#ccc] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] hover:text-[#333] dark:hover:text-white'
              }`}
              onClick={() => {
                setIsLogin(false)
                setErrorMessage('')
              }}
            >
              Sign Up
            </button>
          </div>

          {errorMessage ? (
            <p className="text-[#d32f2f] dark:text-[#ffcdd2] bg-[#ffeaea] dark:bg-[#5c1f1f] py-2 px-2 rounded-md mb-3 text-center text-[0.95em]">
              {errorMessage}
            </p>
          ) : ''} 
          
          <section className="mt-2.5">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Email field (for both login and signup) */}
              <input 
                type="email" 
                name="email" 
                className="w-full py-3 px-4 border border-[#ddd] dark:border-[#444] rounded-app text-base outline-none transition-all shadow-sm dark:bg-[#2b2b2b] dark:text-white placeholder:text-[#999] dark:placeholder:text-[#aaa] focus:border-primary focus:shadow-[0_2px_8px_rgba(25,118,210,0.15)]" 
                placeholder="Email" 
                required 
              />
              
              {/* Name fields (only for signup) */}
              <div className={`flex flex-col sm:flex-row gap-4 sm:gap-3 transition-all duration-400 ${
                !isLogin ? 'max-h-[200px] opacity-100 mb-0' : 'max-h-0 opacity-0 overflow-hidden mb-0'
              }`}>
                <input
                  type="text"
                  name="firstName"
                  className="flex-1 w-full py-3 px-4 border border-[#ddd] dark:border-[#444] rounded-app text-base outline-none transition-all shadow-sm dark:bg-[#2b2b2b] dark:text-white placeholder:text-[#999] dark:placeholder:text-[#aaa] focus:border-primary focus:shadow-[0_2px_8px_rgba(25,118,210,0.15)]"
                  placeholder="First Name"
                  required={!isLogin}
                />
                <input
                  type="text"
                  name="lastName"
                  className="flex-1 w-full py-3 px-4 border border-[#ddd] dark:border-[#444] rounded-app text-base outline-none transition-all shadow-sm dark:bg-[#2b2b2b] dark:text-white placeholder:text-[#999] dark:placeholder:text-[#aaa] focus:border-primary focus:shadow-[0_2px_8px_rgba(25,118,210,0.15)]"
                  placeholder="Last Name"
                  required={!isLogin}
                />
              </div>
              
              {/* Password field */}
              <input
                type="password"
                name="password"
                className="w-full py-3 px-4 border border-[#ddd] dark:border-[#444] rounded-app text-base outline-none transition-all shadow-sm dark:bg-[#2b2b2b] dark:text-white placeholder:text-[#999] dark:placeholder:text-[#aaa] focus:border-primary focus:shadow-[0_2px_8px_rgba(25,118,210,0.15)]"
                placeholder="Password"
                required
              />
              
              {isLogin && (
                <div className="text-right -mt-2">
                  <a 
                    href="/forgot-password" 
                    className="text-sm text-primary dark:text-primary hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
              )}
              
              <input 
                type="submit" 
                value={isLogin ? 'Log In' : 'Sign Up'} 
                className="bg-primary dark:bg-primary text-white border-none rounded-lg py-[18px] px-6 text-base font-semibold cursor-pointer mt-5 transition-all duration-200 w-full hover:bg-primary-hover dark:hover:bg-primary-hover hover:-translate-y-0.5"
              />
            </form>
          </section>
        </div>
      </div>
    )

  // otherwise, if the user has successfully logged-in, redirect them to a different page
  // else return <Navigate to="/home" />
}

export default Login
