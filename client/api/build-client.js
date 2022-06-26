import axios from "axios";

export default ( { req } ) => {
    if (typeof window === 'undefined') {
        //we are on the server
        const domain = 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local'
        return axios.create( {
            baseURL: domain,
            headers: req.headers
        });
    } else {
        //means we are on the browser
        return axios.create({
            baseURL:'/'
        })
    }
}