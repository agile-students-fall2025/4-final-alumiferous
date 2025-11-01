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
        'Please log in to view our fabulous protected animals list.'
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

      // Process login/signup
      const username = isLogin ? email.split('@')[0] : `${firstName} ${lastName}` // Use full name for signup, email prefix for login
      setStatus({ success: true, username });
      setErrorMessage('');
    } catch (err) {
      // throw an error
      throw new Error(err)
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
              navigate("/onboarding")
            }}
          >
            Sign Up
          </button>
        </div>

        {errorMessage ? <p className="error">{errorMessage}</p> : ''} 
        
        <section className="main-content">
          <form onSubmit={handleSubmit}>
            {/* Email field (for both login and signup) */}
            <input type="email" name="email" placeholder="Email" required />
            
            {/* Name fields (only for signup) - on same row with animation */}
            <div className={`name-row ${!isLogin ? 'show' : ''}`}>
              <input type="text" name="firstName" placeholder="First Name" required={!isLogin} />
              <input type="text" name="lastName" placeholder="Last Name" required={!isLogin} />
            </div>
            
            {/* Password field */}
            <input type="password" name="password" placeholder="Password" required />
            
            <input type="submit" value={isLogin ? 'Log In' : 'Sign Up'} />
          </form>
        </section>
      </div>
    )
  // otherwise, if the user has successfully logged-in, redirect them to a different page
  else return <Navigate to="/home" />
}

export default Login