import {useEffect, useState} from "react";

export default function useRequest (request: any) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState<any>(null);
    const [error, setError] = useState<any>(null);


    useEffect(() => {
        setLoading(true);
        request()
            .then((response: { data: any; }) => setData((response.data)))
            .catch((error: any) => setError(error))
            .finally(() => setLoading(false))
    }, [])

    return [data, loading, error]
}