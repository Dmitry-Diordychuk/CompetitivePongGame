import React from "react";
import {ftAuthProvider} from "./ftAuth.provider";
import axios from "axios";
import {backdoorProvider} from "./backdoor.provider";

interface AuthContextType {
    user: any;
    signin: (code: string, successfulCallback: Function, errorCallback: VoidFunction) => void;
    signout: (callback: VoidFunction) => void;
    changeUsername: Function;
    secondFactorActivate: Function;
    secondFactorDeactivate: Function;
    secondFactorAuthenticate: Function;
    goBackdoor: Function;
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

    let changeUsername = (username: string, successfulCallback: Function, errorCallback: VoidFunction) => {
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
            setUser(response.data.user);
        }).catch();
    }

    let secondFactorAuthenticate = (code: string, successfulCallback: Function, errorCallback: VoidFunction) => {
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
            setUser(updatedUser);
            successfulCallback();
        }).catch(() => {
            errorCallback();
        })
    }

    let secondFactorActivate = (code: string, successfulCallback: Function, errorCallback: VoidFunction) => {
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
            setUser(user);
            successfulCallback();
        }).catch(() => {
            errorCallback();
        })
    }

    let secondFactorDeactivate = (code: string, successfulCallback: Function, errorCallback: VoidFunction) => {
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
        }).catch(() => {
            errorCallback();
        })
    }

    let signin = (code: string, successfulCallback: Function, errorCallback: VoidFunction) => {
        return ftAuthProvider.signin(
            code,
            (data: UserWrapper) => {
                data.user.isTwoFactorAuthenticationValid = false;
                setUser(data.user);
                successfulCallback();
            },
            () => {
                setUser(null);
                errorCallback();
            }
        );
    };

    let signout = (callback: VoidFunction) => {
        return ftAuthProvider.signout(() => {
            setUser(null);
            callback();
        });
    };

    let goBackdoor = (username: string, successfulCallback: Function, errorCallback: VoidFunction) => {
        return backdoorProvider.signin(
            username,
            (data: UserWrapper) => {
                data.user.isTwoFactorAuthenticationValid = false;
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
        changeUsername,
        secondFactorActivate,
        secondFactorDeactivate,
        secondFactorAuthenticate,
        goBackdoor,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return React.useContext(AuthContext);
}
