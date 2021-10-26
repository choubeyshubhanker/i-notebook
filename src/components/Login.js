import React, { useState } from 'react'
import { useHistory } from 'react-router-dom';

function Login(props) {
    const [credentials, setCredentials] = useState({email:"", password:""});
    let history = useHistory();
    const  handleSubmit= async(e) =>{
        e.preventDefault();
        const response = await fetch(`http://localhost:5000/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
              
            },
            body: JSON.stringify({email:credentials.email, password:credentials.password})
          });
          const json = await response.json()
          console.log(json)
          if (json.success){
              //redirect
              localStorage.setItem('token',json.authtoken);
              props.showAlert("LooedIn SuccessFull", "success");
            history.push("/")
          }
          else{
            props.showAlert("Invalid Credentials", "danger");
          }
    }
    const onchange = (e)=>{
        setCredentials({...credentials, [e.target.name]:e.target.value})
    }
    return (
        <div>
           <form  onSubmit={handleSubmit}>
            <div className="mb-3">
                <label htmlFor="email" className="form-label">Email address</label>
                <input type="email" className="form-control" value={credentials.email} id="email" name="email" aria-describedby="emailHelp" onChange={onchange}/>
                <div id="emailHelp" className="form-text">We'll never share your email with anyone else.</div>
            </div>
            <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input type="password" className="form-control" value={credentials.password} id="password" name="password" onChange={onchange}/>
            </div>
            
            <button type="submit" className="btn btn-primary">Submit</button>
            </form>
        </div>
    )
}

export default Login
