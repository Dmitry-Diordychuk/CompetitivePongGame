import React, {useCallback, useEffect, useRef} from "react";
import {ftAuthProvider} from "./ftAuth.provider";
import axios from "axios";
import {backdoorProvider} from "./backdoor.provider";
import {useLocation, useNavigate} from "react-router-dom";
import {useSocketIO} from "../contexts/socket.io.context";
import {API_URL, HTTP_PORT} from "../config";


interface AuthContextType {
    user: any;
    signin: (code: string, successfulCallback: Function, errorCallback: Function) => void;
    signout: (callback: VoidFunction) => void;
    changeUsername: Function;
    secondFactorActivate: Function;
    secondFactorDeactivate: Function;
    secondFactorAuthenticate: Function;
    goBackdoor: Function;
    resignin : Function;
    getId : Function;
}

interface UserWrapper {user: User;}
interface User {
    id: number;
    username: string;
    role: string;
    isTwoFactorAuthenticationEnable: boolean;
    isTwoFactorAuthenticationValid: boolean;
    image: string;
    token: string;
    isAccountJustCreated: boolean | null;
}

const AuthContext = React.createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    let [user, setUser] = React.useState<any>(null);
    const userId = useRef<number>(0);

    const socket = useSocketIO();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        socket.on('ban', ()=>{
            navigate('/logout', {replace: true});
        })

        return (()=> {
            socket.off('ban');
        })
    }, [user, navigate, socket]);


    let changeUsername = (username: string, successfulCallback: Function, errorCallback: Function) => {
        axios({
            method: 'put',
            url: `${API_URL}:${HTTP_PORT}/api/user`,
            headers: {
                "Authorization": "Bearer " + user.token,
            },
            data: {
                "user": {
                    "username": username,
                }
            },
        }).then((response) => {
            sessionStorage.setItem('user', JSON.stringify(response.data.user));
            setUser(response.data.user);
            location.state.isUserTryingAuthenticate = true;
            socket.disconnect();
            socket.connect(response.data.user.token);
            successfulCallback();
        }).catch((e: any) => {
            errorCallback(e.response.data.message);
            socket.disconnect();
        });
    }

    let secondFactorAuthenticate = (code: string, successfulCallback: Function, errorCallback: Function) => {
        axios({
            url: `${API_URL}:${HTTP_PORT}/api/2fa/authenticate`,
            method: 'post',
            headers: {
                "Authorization": "Bearer " + user.token,
            },
            data: {
                code: code.trim(),
            },
        }).then((response) => {
            const updatedUser = response.data.user;
            updatedUser.isTwoFactorAuthenticationValid = true;
            sessionStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            location.state.isUserTryingAuthenticate = true;
            socket.disconnect();
            socket.connect(response.data.user.token);
            successfulCallback();
        }).catch((e) => {
            errorCallback(e.response.data.message.toString());
            socket.disconnect();
        })
    }

    let secondFactorActivate = (code: string, successfulCallback: Function, errorCallback: Function) => {
        axios({
            url: `${API_URL}:${HTTP_PORT}/api/2fa/turn-on`,
            method: 'post',
            headers: {
                'Authorization': "Bearer " + user.token,
            },
            data: {
                code: code.trim(),
            },
        }).then(() => {
            user.isTwoFactorAuthenticationEnable = true;
            sessionStorage.setItem('user', JSON.stringify(user))
            setUser(user);
            socket.disconnect();
            successfulCallback();
        }).catch((e) => {
            errorCallback(e.response.data.message.toString());
            socket.disconnect();
        })
    }

    let secondFactorDeactivate = (code: string, successfulCallback: Function, errorCallback: Function) => {
        axios({
            url: `${API_URL}:${HTTP_PORT}/api/2fa/turn-off`,
            method: 'post',
            headers: {
                'Authorization': "Bearer " + user.token,
            },
            data: {
                code: code.trim(),
            },
        }).then(() => {
            setUser(null);
            socket.disconnect();
            successfulCallback();
        }).catch((e) => {
            errorCallback(e.response.data.message.toString());
            socket.disconnect();
        })
    }

    let signin = (code: string, successfulCallback: Function, errorCallback: Function) => {
        return ftAuthProvider.signin(
            code,
            (data: UserWrapper) => {
                if (data) {
                    data.user.isTwoFactorAuthenticationValid = false;
                    sessionStorage.setItem('user', JSON.stringify(data.user))
                    userId.current = +data.user.id;
                    setUser(data.user);
                    socket.connect(data.user.token);
                    successfulCallback(data.user.isAccountJustCreated);
                } else {
                    errorCallback(data);
                }
            },
            (error: any) => {
                setUser(null);
                socket.disconnect();
                errorCallback(error);
            }
        );
    };

    let resignin = () => {
        let data : any = sessionStorage.getItem('user');
        if (data)
        {
            data = JSON.parse(data);
            userId.current = data.id;
            setUser(data);
            socket.disconnect();
            socket.connect(data.token);
        }
    };

    let signout = useCallback((callback: VoidFunction) => {
        return ftAuthProvider.signout(() => {
            sessionStorage.clear();
            setUser(null);
            socket.disconnect();
            callback();
        });
    }, [socket]);

    useEffect(() => {
        socket.on('disconnect', ()=>{
            if (!location.state?.isUserTryingAuthenticate) {
                signout(()=>{
                    navigate('/login', {replace: true});
                });
            }
        })
        return (()=> {
            socket.off('disconnect');
        })
    },[user, navigate, socket, signout, location.state]);

    let getId = () =>
    {
        return (userId.current.toString())
    }

    let goBackdoor = (username: string, successfulCallback: Function, errorCallback: VoidFunction) => {
        return backdoorProvider.signin(
            username,
            (data: UserWrapper) => {
                data.user.isTwoFactorAuthenticationValid = false;
                sessionStorage.setItem('user', JSON.stringify(data.user));
                userId.current = data.user.id;
                setUser(data.user);
                socket.connect(data.user.token);
                successfulCallback();
            },
            () => {
                setUser(null);
                socket.disconnect();
                errorCallback();
            }
        );
    }

    let value : AuthContextType = {
        user,
        signin,
        signout,
        resignin,
        changeUsername,
        secondFactorActivate,
        secondFactorDeactivate,
        secondFactorAuthenticate,
        goBackdoor,
        getId,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return React.useContext(AuthContext);
}

