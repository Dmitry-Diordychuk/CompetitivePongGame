import React from "react";
import useRequest from "../hooks/useRequest";

interface AuthContextType {
    user: any;
    signIn: (user: string, callback: VoidFunction) => void;
    signOut: (callback: VoidFunction) => void;
}

let AuthContext = React.createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    let [user, setUser] = React.useState<any>(null);

    let signIn = (code: string, callback: VoidFunction) => {
        return fakeAuthProvider.signIn(() => {
            setUser(user);
            callback();
        });
    };

    let signOut = (callback: VoidFunction) => {
        return fakeAuthProvider.signOut(() => {
            setUser(null);
            callback();
        });
    };

    let value = { user, signIn, signOut };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

const fakeAuthProvider = {
    isAuthenticated: false,
    signIn(callback: VoidFunction) {
        //fakeAuthProvider.isAuthenticated = true;
        //setTimeout(callback, 100);
    },
    signOut(callback: VoidFunction) {
        fakeAuthProvider.isAuthenticated = false;
        setTimeout(callback, 100);
    }
};

export function useAuth() {
    return React.useContext(AuthContext);
}
