import React, { useState, useEffect} from "react";
import { Navigate, Link, useSearchParams} from 'react-router-dom'
import axios from 'axios'
import './Signup.css'

const Signup = props => {
    let [urlSearchParams] = useSearchParams() // to read or set values from the URL's search string

    //create variables to store username and password 
    const [status, setStatus] = useState({}) // status is variable for storing signup process status like whether (loading, sucessful or failed)
    const [errorMessage, setErrorMessage] = useState('') // errorMessages store error messages to be shown to the user if something goes wrong
    
    //if the user got here by trying to access our Protected pages
    useEffect (() => {
        const qsError = urlSearchParams.get('error')
        if (qsError === 'protected'){
            setErrorMessage('Please sign up to use the app.')
        }
    },[urlSearchParams] )

    //if the user's Signup status changes, call the setuser function that was passed to this component
    useEffect(() =>{
        if(status.success){
            console.log(`User signed up successfully: ${status.username}`)
            // props.setuser(status)
        }
    },[status])// re run whenever the status change

    const handleSubmit = async e => {
        e.preventDefault() // prevent the browser from reloading allowing you to handle the form sudmission

        const username = e.target.username.value; // gets the value of the field in the submitted form with name='username'
        const password = e.target.password.value; // gets the value of the field in the submitted form with name='password'
        const confirmPassword = e.target['confirm password'].value;

        // Basic Validation
        if (!username || !password || !confirmPassword){ // all fields required
            setErrorMessage('All fields are required.');
            return;
        }
        if (password.length < 8){ // min length 8 for better security
            setErrorMessage('Password must be at least 8 characters.');
            return;
        }
        if (password != confirmPassword){ // passwords must match
            setErrorMessage('Passwords do not match');
            return;
        }

        try{
            // create an object with the data we want to send to the server
            const requestData = {
                username,
                password
            }
            // send the request to the server api to authenticate
            // const response = await axios.post( // waits for server to respond before continuing 
            //     '',
            //     requestData
            // )

            // Simulate a network request
            setTimeout(() => {
                const success = Math.random() > 0.5; // 50% chance to succeed
                if (success) {
                    setStatus({ success: true, username: e.target.username.value });
                    setErrorMessage('');
                } 
                else {
                    setStatus({ success: false });
                    setErrorMessage('Mock API: Signup failed, please try again.');
                }
            }, 1000); // 1 second delay

            // console.log(response.data)
            // setStatus(response.data)
        }
        catch (err){
            throw new Error(err)
        }
    }

    // if the user is did not sign up, show the sign up form
    if (!status.success)
        return (
        <div className="Signup">
            <h1 className = "logo"> InstaSkill </h1>
            <h1>Sign Up</h1>
            {errorMessage ? <p className="error">{errorMessage}</p> : ''}
            <section className="main-content">
            <form onSubmit={handleSubmit}>
                {
                //handle error condition
                }
                <label>Username</label>
                <input type="text" name="username" />
                <br />
                <label>Password</label>
                <input type="password" name="password" />
                <br />
                <label>Comfirm Password</label>
                <input type="password" name="confirm password"/>
                <br />
                <br />
                <input type="submit" value="Sign Up"/>
                
            </form>
            <h2>
                Already have an account? Click <Link to="/login">here to Sign in</Link>
            </h2>
            </section>
        </div>
    )
    else return <Navigate to="/login" />

}

export default Signup;