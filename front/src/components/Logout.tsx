import {useAuth} from "../auth/auth.context";
import {Navigate, useNavigate} from "react-router-dom";
import {useChat} from "../contexts/chat.context";

export default function Logout() {
    const auth = useAuth();
    const navigate = useNavigate();
    const chat = useChat();

    auth.signout(() => {
        chat.disconnect();
        navigate('/login', {replace: true});
    });

    return <Navigate to={"/login"} />;
}