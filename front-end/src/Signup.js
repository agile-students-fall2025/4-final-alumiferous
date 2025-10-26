import React, { useState, useEffect} from "react";
import { Navigate, useSearchParams} from 'react-router-dom'
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
    },[] )

    //if the user's Signup status changes, call the setuser function that was passed to this component
    useEffect(() =>{
        if(status.success){
            console.log(`User signed up successfully: ${status.username}`)
            props.setuser(status)
        }
    },[status])// re run whenever the status change

}