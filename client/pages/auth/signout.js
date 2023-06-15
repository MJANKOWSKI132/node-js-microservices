import { useEffect } from "react";
import useRequest from "../../hooks/use-request";
import Router from 'next/router';

const SignOut = () => {
    const [signoutRequest, errors] = useRequest(
        {
            url: '/api/users/signout',
            method: 'post',
            body: null,
            onSuccess: () => Router.push('/')
        }
    );

    useEffect(() => {
        (async () => {
            await signoutRequest();
        })();
    }, [])

    return (
        <div>
            Signing you out...
        </div>
    )
};

export default SignOut;