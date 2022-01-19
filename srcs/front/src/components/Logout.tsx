import {useAuth} from "../auth/auth.context";
import {useNavigate} from "react-router-dom";
import {useSocketIO} from "../contexts/socket.io.context";
import {useEffectOnce} from "usehooks-ts";

export default function Logout() {
    const auth = useAuth();
    const navigate = useNavigate();
    const socket = useSocketIO();

    useEffectOnce(() => {
        auth.signout(() => {
            socket.disconnect();
            navigate('/login', {replace: false});
        });
    })
    return <></>
}