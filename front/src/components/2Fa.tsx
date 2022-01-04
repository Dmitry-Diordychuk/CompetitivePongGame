import {useAuth} from "../auth/auth.context";
import {useState} from "react";
import {useNavigate} from "react-router-dom";

export default function SecondFa() {
    const [code, setCode] = useState<string>('');
    const [error, setError] = useState('');
    const auth = useAuth();
    const navigate = useNavigate();

    console.log(auth.user);

    if (!auth.user)
        navigate('/login', {replace: true});

    const handleSubmit = (event: any) => {
        event.preventDefault();
        auth.secondFactorAuthenticate(
            code,
            ()=> {
                navigate("/", {replace: true});
            },
            ()=> {
                setError("Wrong input try again!");
            },
        )
    }

    return (
            <div>
                <p>{error}</p>
				<form onSubmit={handleSubmit}>
                    <label>
                        Enter QR code
                        <input
                            type="text"
                            value={code}
                            onChange={e => setCode(e.target.value)}
                        />
                    </label>
                    <input type="submit" value="Submit" />
                </form>
			</div>
    )
}