import Router from "next/router"
import { useState } from "react"
import useRequest from '../../hooks/use-request'

export default () => {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const {doRequest, errors} = useRequest({
        url: '/api/users/signin',
        method: 'post',
        body: {
            email: email, 
            password: password
        },
        onSuccess: () => Router.push('/')
    })
    const submitHandle = async (e) => {
        e.preventDefault(); 
        doRequest()
    }

    return (<form onSubmit={submitHandle} className="container">
        <h1> Sign-in </h1>
        <div className="form-group">
            <label>Email Address</label>
            <input value={email} onChange={e => setEmail(e.target.value)} className="form-control" />
        </div>
        <div className="form-group">
            <label>Password</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" className="form-control" />
        </div>
        {errors}

        <button className=" form-group btn btn-primary">Sign In</button>
    </form>)
}