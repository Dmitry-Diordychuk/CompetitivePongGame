import React from 'react';
import './App.css';
import {Routes, Route, Navigate, useLocation} from "react-router-dom";
import {useAuth} from "./auth/auth.context";
import Login from './components/Login';
import Profile from "./components/Profile";
import TopPanel from "./components/TopPanel";
import NotFound from "./components/NotFound";
import Channels from "./components/Channels";
import Unauthorized from "./components/Unauthorized";
import Home from "./components/Home";
import Channel from "./components/Channel";
import Contacts from "./components/Contacts";
import Settings from "./components/Settings";
import Game from "./components/Game";
import SecondFa from "./components/2Fa";
import Logout from "./components/Logout";
import Admin from "./components/Admin";
import AdminChannelView from "./components/AdminChannelView";


function RequireAuth({ children }: { children: JSX.Element }) {
    let auth = useAuth();
    let location = useLocation();

    if (!auth.user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    } else if (auth.user.isTwoFactorAuthenticationEnable && !auth.user.isTwoFactorAuthenticationValid) {
        return <Navigate to="/2fa" state={{ from: location }} replace />;
    }
    return children;
}

function RequireAdmin({ children }: { children: JSX.Element }) {
    let auth = useAuth();
    let location = useLocation();

    if (!auth.user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    } else if (auth.user.isTwoFactorAuthenticationEnable && !auth.user.isTwoFactorAuthenticationValid) {
        return <Navigate to="/2fa" state={{ from: location }} replace />;
    }
    if (auth.user.role !== 'Admin' && auth.user.role !== 'PO')
        return <Navigate to="/login" />;
    return children;
}

function App()
{
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/401" element={<Unauthorized />} />
            <Route path="/2fa" element={<SecondFa />} />

            <Route path="/logout" element={
                <RequireAuth>
                    <Logout/>
                </RequireAuth>
            } />

            <Route element={<TopPanel/>}>
                <Route path="/admin" element={
                    <RequireAdmin>
                        <Admin/>
                    </RequireAdmin>
                } />
                    <Route path="/admin/channel/:id" element={
                        <RequireAdmin>
                            <AdminChannelView/>
                        </RequireAdmin>
                    } />
                <Route path="/" element={
                    <RequireAuth>
                        <Home />
                    </RequireAuth>
                } />
                <Route path="/profile" element={
                    <RequireAuth>
                        <Profile />
                    </RequireAuth>
                } />
                <Route path="/profile/:id" element={
                    <RequireAuth>
                        <Profile />
                    </RequireAuth>
                } />
                <Route path="/channels" element={
                    <RequireAuth>
                        <Channels />
                    </RequireAuth>
                } />
                <Route path="/channel" element={
                    <RequireAuth>
                        <Channel />
                    </RequireAuth>
                } />
                    <Route path="/channel/:id" element={
                        <RequireAuth>
                            <Channel />
                        </RequireAuth>
                    } />
                <Route path="/contacts" element={
                    <RequireAuth>
                        <Contacts />
                    </RequireAuth>
                } />
                <Route path="/settings" element={
                    <RequireAuth>
                        <Settings />
                    </RequireAuth>
                } />
                <Route path="/game" element={
                    <RequireAuth>
                        <Game />
                    </RequireAuth>
                } />
                <Route path="*" element={<NotFound />}/>
            </Route>

        </Routes>
    )
}

export default App;
