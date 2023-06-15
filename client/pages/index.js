import axios from 'axios';
import buildClient from '../api/buildClient';

const LandingPage = ({ currentUser }) => {
    return (
        <h1>{currentUser ? "You are signed in" : "You are not signed in"}</h1>
    )
};

LandingPage.getInitialProps = async ({ req }) => {
    try {
        const client = buildClient(req)
        const { data } = await client.get('/api/users/currentuser');
        return data;
    } catch (error) {
        console.error(error);
        return {
            currentUser: null
        }
    }
};

export default LandingPage;