import {useAuth} from "../auth/auth.context";
import {Navigate, useNavigate} from "react-router-dom";
import {useChat} from "../contexts/chat.context";
import {useSocketIO} from "../contexts/socket.io.context";

export default function Logout() {
    const auth = useAuth();
    const navigate = useNavigate();
    const socket = useSocketIO();

    auth.signout(() => {
        socket.disconnect();
        navigate('/login', {replace: true});
    });

    return <Navigate to={"/login"} />;
}