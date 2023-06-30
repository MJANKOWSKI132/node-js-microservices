import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/buildClient';
import Header from '../components/header';

const AppComponent = ({ Component, pageProps }) => {
    const { currentUser } = pageProps;

    return (
        <div>
            <Header currentUser={currentUser} />
            <div className="container">
                <Component currentUser={currentUser} {...pageProps} />
            </div>
        </div>
    );
}

AppComponent.getInitialProps = async (appContext) => {
    try {
        const client = buildClient({
            headers: {
                Host: 'ticketing.dev'
            }
        });
        const { data } = await client.get('/api/users/currentuser');
        
        let pageProps = {};
        if (appContext?.Component?.getInitialProps) {
            pageProps = await appContext.Component.getInitialProps(appContext.ctx, client, data.currentUser)
        }
            
        return {
            pageProps,
            ...data
        }
    } catch (error) {
        console.error(error);
        return {
            currentUser: null
        }
    }
};

export default AppComponent;