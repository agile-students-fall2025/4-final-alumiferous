import React, { useState, useEffect } from 'react'
import {Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import './Login.css'

 const Login = props => {
  let [urlSearchParams] = useSearchParams() // Get query params

  //variable for navigation
  const navigate = useNavigate()

  // State for toggle between login and signup
  const [isLogin, setIsLogin] = useState(true)
  
  // create state variables to hold form data
  const [status, setStatus] = useState({}) // the API will return an object indicating the login status in a success field of the response object
  const [errorMessage, setErrorMessage] = useState(``) 

  // if the user got here by trying to access our Protected page, there will be a query string parameter called 'error' with the value 'protected'
  useEffect(() => {
    const qsError = urlSearchParams.get('error') // get any 'error' field in the URL query string
    if (qsError === 'protected')
      setErrorMessage(
        'Please log in to use app.'
      )
  }, [])

  // if the user's logged-in status changes, call the setuser function that was passed to this component from the PrimaryNav component.
  useEffect(() => {
    // Signup status effect
    if (status.success) {
      console.log(`User successfully logged in: ${status.username}`)
    //   props.setuser(status)
    }
  }, [status])

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
      
      const response = await axios.post(`http://localhost:3000${endpoint}`, payload)
      
      if (response.data.success) {
        console.log(`User successfully ${isLogin ? 'logged in' : 'signed up'}:`, response.data.username)
        setStatus({ success: true, username: response.data.username })
        setErrorMessage('')
        
        // Navigate based on login/signup
        if (isLogin) {
          navigate("/home") // regular login goes straight home
        } else {
          navigate("/onboarding") // new user goes to onboarding flow
        }
      } else {
        setErrorMessage(response.data.message || 'Authentication failed')
      }
    } catch (err) {
      console.error('Authentication error:', err)
      setErrorMessage(err.response?.data?.message || 'An error occurred. Please try again.')
    }
  }

  // Show combined login/signup form
  if (!status.success)
    return (
      <div className="Login">
        <h1 className="logo">InstaSkill</h1>
        
        {/* Toggle buttons */}
        <div className="form-toggle">
          <button 
            type="button"
            className={isLogin ? 'active' : ''}
            onClick={() => {
              setIsLogin(true)
              setErrorMessage('')
            }}
          >
            Log In
          </button>
          <button 
            type="button"
            className={!isLogin ? 'active' : ''}
            onClick={() => {
              setIsLogin(false)
              setErrorMessage('')
            }}
          >
            Sign Up
          </button>
        </div>

        {errorMessage ? <p className="error">{errorMessage}</p> : ''} 
        
        <section className="main-content">
          <form onSubmit={handleSubmit}>
            {/* Email field (for both login and signup) */}
            <input type="email" name="email" className="form-input" placeholder="Email" required />
            
            {/* Name fields (only for signup) - on same row with animation */}
            <div className={`name-row ${!isLogin ? 'show' : ''}`}>
              <input type="text" name="firstName" className="form-input" placeholder="First Name" required={!isLogin} />
              <input type="text" name="lastName" className="form-input" placeholder="Last Name" required={!isLogin} />
            </div>
            
            {/* Password field */}
            <input type="password" name="password" className="form-input" placeholder="Password" required />
            
            <input type="submit" value={isLogin ? 'Log In' : 'Sign Up'} />
          </form>
        </section>
      </div>
    )
  // otherwise, if the user has successfully logged-in, redirect them to a different page
  //else return <Navigate to="/home" />
}

export default Login