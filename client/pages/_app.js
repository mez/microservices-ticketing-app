import 'bootstrap/dist/css/bootstrap.css'
import buildClient from '../api/build-client'
import Header from '../components/header'

const AppComponent =  ({ Component, pageProps, currentUser}) => {
    return <div>
        <Header currentUser={currentUser} />
        <div className="container">

        <Component currentUser={currentUser} {...pageProps} />
        </div>
    </div> 
}

AppComponent.getInitialProps = async (appCtx) => {
    const client = buildClient(appCtx.ctx);
    const {data} = await client.get('/api/users/me')

    let pageProps = {}
    if (appCtx.Component.getInitialProps) {
        console.log(appCtx.Component);
        pageProps = await appCtx.Component.getInitialProps(appCtx.ctx, client, data.currentUser)
    }
    
    return {
        pageProps,
        ...data
    };
}

export default AppComponent