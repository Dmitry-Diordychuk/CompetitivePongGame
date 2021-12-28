import {useAuth} from "../auth/auth.context";
import {useChat} from "../contexts/chat.context";
import {Navigate} from "react-router-dom";
import {useEffectOnce} from "usehooks-ts";

export default function Home() {
    const auth = useAuth();
    const chat = useChat();

    useEffectOnce(() => {
        chat.connect(auth?.user.token);
    })

    if (!auth.user)
        return <Navigate to={"/login"} />;

    return <>Home page</>
}