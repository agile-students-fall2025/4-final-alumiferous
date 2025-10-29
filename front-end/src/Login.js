import React, { useState, useEffect } from 'react'
import {Link, Navigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import './Login.css'

const Login = props => {
  let [urlSearchParams] = useSearchParams() // Get query params

  // create state variables to hold username and password
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
      // Validate inputs
    //   const requestData = {
    //     username: e.target.username.value, // gets the value of the field in the submitted form with name='username'
    //     password: e.target.password.value, // gets the value of the field in the submitted form with name='password',
    //   }

      // Simulate signup
      setTimeout(() => {
          const success = Math.random() > 0.5; // 50% chance to succeed
          if (success) {
          setStatus({ success: true, username: e.target.username.value });
          setErrorMessage('');
          } else {
          setStatus({ success: false });
          setErrorMessage('Mock API: Signup failed, please try again.');
          }
      }, 1000); // 1 second delay
    } catch (err) {
      // throw an error
      throw new Error(err)
    }
  }

  // Show signup form
  if (!status.success)
    return (
      <div className="Login">
        <h1 className = "logo"> InstaSkill </h1>
        <h1>Log in</h1>
        {errorMessage ? <p className="error">{errorMessage}</p> : ''}
        <section className="main-content">
          <form onSubmit={handleSubmit}>
            {
              //handle error condition
            }
            <label>Username </label>
            <input type="text" name="username" />
            <br />
            <label>Password </label>
            <input type="password" name="password" />
            <br />
            <input type="submit" value="Log In" />
          </form>
          <h2>
            Don't have an account? Click <Link to="/signup">here to Sign up</Link>
          </h2>
        </section>
      </div>
    )
  // otherwise, if the user has successfully logged-in, redirect them to a different page
  else return <Navigate to="/home" />
}

export default Login