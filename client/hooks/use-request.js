import axios from 'axios';
import { useState } from 'react';

const useRequest = ({ url, method, body, onSuccess }) => {
    const [errors, setErrors] = useState(null);

    const doRequest = async () => {
        setErrors(null);
        try {
            const { data } = await axios[method](url, body);
            if (onSuccess)
                onSuccess(data);
        } catch (err) {
            console.error(err);
            setErrors(
                <div className="alert alert-danger">
                    <h4>Oooops...</h4>
                    <ul className="my-0">
                    {
                        err.response.data.errors.map((err, idx) => (
                            <li key={idx}>
                                {err.message}
                            </li>
                        ))
                    }
                    </ul>
                </div>
            )
        }
    };

    return [doRequest, errors];
};

export default useRequest;