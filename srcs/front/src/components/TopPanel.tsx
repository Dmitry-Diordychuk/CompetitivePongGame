import React, {useEffect} from "react";
import {Link, Outlet, useLocation, useNavigate} from "react-router-dom";
import {useAuth} from "../auth/auth.context";
import {useChat} from "../contexts/chat.context";
import Matchmacking from "./Matchmacking";
import Duel from "./Duel";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import '../styles/TopPanel.css'
import {useSocketIO} from "../contexts/socket.io.context";


export default function TopPanel() {
    const chat = useChat();
    const auth = useAuth();
    const socket = useSocketIO();
    const location = useLocation();

    useEffect(()=>{}, [chat.currentChannelName])

    return (
        <>
            <Navbar style={{background: "#A1A1A1"}}>
                <Container>
                    <Navbar.Brand as="span"><Link to="/" style={{ textDecoration: 'none' }}>Pong</Link></Navbar.Brand>
                    <Nav className="me-auto">
                        {
                            auth.user && (auth.user.role === 'Admin' || auth.user.role === 'PO')
                                ?
                                <Nav.Link as="span"><Link style={{ textDecoration: 'none' }} to="/admin">Admin</Link></Nav.Link>
                                :
                                <></>
                        }
                        <Nav.Link as="span"><Link style={{ textDecoration: 'none' }} to="/profile">Profile</Link></Nav.Link>
                        <Nav.Link as="span"><Link style={{ textDecoration: 'none' }} to="/channels">Channels</Link></Nav.Link>
{/*
                        <Nav.Link as="span"><Link style={{ textDecoration: 'none' }} to="/contacts">Contacts</Link></Nav.Link>
                        <Nav.Link as="span"><Link style={{ textDecoration: 'none' }} to="/settings">Settigs</Link></Nav.Link>
*/}
                        <Nav.Link as="span">{location.pathname !== '/game' ? <Matchmacking/> : <></>}</Nav.Link>
                        <Nav.Link as="span">{location.pathname !== '/game' ? <Duel /> : <></>}</Nav.Link>
                    </Nav>
                    <Nav>
                        <HolddedPMC/>
                        {auth.user ? <Nav.Link>Welcome {auth.user.username}!</Nav.Link> : <></>}
                        {auth.user ?
                            <Button variant="primary" onClick={() => {
                                auth.signout(() => {
                                    socket.disconnect();
                                    //navigate("/logout");
                                });
                            }}>Sign out</Button>
                            : <></>
                        }
                    </Nav>
                </Container>
            </Navbar>
            <Outlet />
        </>
    )
}

function HolddedPMC()
{
    const chat = useChat();
    const navigate = useNavigate();

    useEffect(()=>{
    }, [chat.privateChannels]);

    if (chat.privateChannels.length === 0) {
        return (<></>)
    }

    return(
        <div className="dropdown">
            <button className="dropbtn">Private chats:</button>
            <div className="dropdown-content">
                {chat.privateChannels.map((ch : any, i: number) : any =>
                    <div key={i} onClick={() => {
                        navigate("/channel/" + ch.id);
                    }}>
                        {ch.name}
                    </div>)}
            </div>
        </div>
    )
}
