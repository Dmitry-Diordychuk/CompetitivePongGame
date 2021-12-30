import {useAuth} from "../auth/auth.context";
import {Navigate} from "react-router-dom";


export default function Admin() {
    const auth = useAuth();

    if (auth.user.role !== 'Admin' && auth.user.role !== 'Owner')
        return <Navigate to={"/login"} />;

    return <>ADMIN PAGE</>
}