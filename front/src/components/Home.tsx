import {useAuth} from "../auth/auth.context";
import {Navigate} from "react-router-dom";
import {useEffectOnce} from "usehooks-ts";
import {useSocketIO} from "../contexts/socket.io.context";

export default function Home() {
    const auth = useAuth();
    const socket = useSocketIO();

    useEffectOnce(() => {
        socket.connect(auth?.user.token);
    })

    if (!auth.user)
        return <Navigate to={"/login"} />;

    return <>Home page</>
}