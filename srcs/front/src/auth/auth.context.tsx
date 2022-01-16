import React, {useEffect, useRef} from "react";
import {ftAuthProvider} from "./ftAuth.provider";
import axios from "axios";
import {backdoorProvider} from "./backdoor.provider";
import {useSocketIO} from "../contexts/socket.io.context";
import {useNavigate} from "react-router-dom";

interface AuthContextType {
    user: any;
    signin: (code: string, successfulCallback: Function, errorCallback: VoidFunction) => void;
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
    isTwoFactorAuthenticationValid: boolean
    image: string;
    token: string;
}

const AuthContext = React.createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    let [user, setUser] = React.useState<any>(null);
    const userId = useRef<number>(0);


    let changeUsername = (username: string, successfulCallback: Function, errorCallback: Function) => {
        axios({
            method: 'put',
            url: "http://localhost:3001/api/user",
            headers: {
                "Authorization": "Bearer " + user.token,
            },
            data: {
                "user": {
                    "username": username,
                }
            },
        }).then((response) => {
            sessionStorage.setItem('user', JSON.stringify(response.data.user))
            setUser(response.data.user);
            successfulCallback();
        }).catch((e: any) => {
            errorCallback(e.response.data.message);
        });
    }

    let secondFactorAuthenticate = (code: string, successfulCallback: Function, errorCallback: Function) => {
        axios({
            url: 'http://127.0.0.1:3001/api/2fa/authenticate',
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
            sessionStorage.setItem('user', JSON.stringify(updatedUser))
            setUser(updatedUser);
            successfulCallback();
        }).catch((e) => {
            errorCallback(e.response.data.message.toString());
        })
    }

    let secondFactorActivate = (code: string, successfulCallback: Function, errorCallback: Function) => {
        axios({
            url: 'http://127.0.0.1:3001/api/2fa/turn-on',
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
            successfulCallback();
        }).catch((e) => {
            errorCallback(e.response.data.message.toString());
        })
    }

    let secondFactorDeactivate = (code: string, successfulCallback: Function, errorCallback: Function) => {
        axios({
            url: 'http://127.0.0.1:3001/api/2fa/turn-off',
            method: 'post',
            headers: {
                'Authorization': "Bearer " + user.token,
            },
            data: {
                code: code.trim(),
            },
        }).then(() => {
            setUser(null);
            successfulCallback();
        }).catch((e) => {
            errorCallback(e.response.data.message.toString());
        })
    }

    let signin = (code: string, successfulCallback: Function, errorCallback: VoidFunction) => {
        return ftAuthProvider.signin(
            code,
            (data: UserWrapper) => {
                data.user.isTwoFactorAuthenticationValid = false;
                sessionStorage.setItem('user', JSON.stringify(data.user))
                userId.current = +data.user.id;
                setUser(data.user);
                successfulCallback();
            },
            () => {
                setUser(null);
                errorCallback();
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
        }
    };

    let signout = (callback: VoidFunction) => {
        return ftAuthProvider.signout(() => {
            sessionStorage.clear();
            setUser(null);
            callback();
        });
    };

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
                successfulCallback();
            },
            () => {
                setUser(null);
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

