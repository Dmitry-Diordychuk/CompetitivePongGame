import {useAuth} from "../auth/auth.context";
import {Navigate, useNavigate} from "react-router-dom";
import "../styles/Admin.css"
import axios from "axios";
import React, {useEffect, useState} from "react";
import {useSocketIO} from "../contexts/socket.io.context";
import { useModal } from "../contexts/modal.context";
import ModalWindow from './Window'
import {useChat} from "../contexts/chat.context";

export default function Admin() {
    const auth = useAuth();

    if (auth.user.role !== 'Admin' && auth.user.role !== 'PO') {
        return <Navigate to={"/login"}/>;
    }

    return (
        <>
            <div className="content">
                <div className="users">
                    <Users/>
                </div>
                <div className="channels">
                    <Channels/>
                </div>
            </div>
        </>
    );
}

function Users() {
    const socket = useSocketIO();
    const auth = useAuth();

    const [currentPage, setCurrentPage] = useState(1);
    const [update, setUpdate] = useState(0);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState(null);

    const modal = useModal()

    useEffect(() => {
        axios.get("http://localhost:3001/api/user/all/" + currentPage, {
            method: 'get',
            headers: {
                Authorization: "Bearer " + auth.user.token,
            }
        }).then((response: any) => {
            if (response.data.result.length === 0 && currentPage > 1)
                setCurrentPage(currentPage - 1)
            else
                setData(response.data)
        }).catch((error) => {
            setError(error);
        })
    }, [currentPage, update, auth.user.token])

    const handleSelectUserRole = (event: any, id: number) => {
        const role = event.target.value;
        const config = {
            headers: {
                Authorization: "Bearer " + auth.user.token,
            },
            url: "",
            method: "post",
        };
        if (role === 'Admin') {
            config.url = "http://localhost:3001/api/admin/" + id;
        } else if (role === 'User') {
            config.url = "http://localhost:3001/api/admin/user/" + id;
        } else if (role === 'Banned') {
            config.url = "http://localhost:3001/api/admin/ban/" + id;
            //socket.once('exception', (response:any)=>console.log(response));
        } else {
            return;
        }
        // @ts-ignore
        axios(config).then(() => {
            socket.emit('ban', {userId: id});
            setUpdate(update + 1)
        }).catch(
            (error)=>console.log(error.message)
        );
    }

    const handleNext = () => {
        setCurrentPage(currentPage + 1);
    }

    const handlePrev = () => {
        let prev = currentPage - 1;
        if (prev < 1)
            prev = 1;
        setCurrentPage(prev);
    }

    if (error) {
        return <>Error!</>
    } else if (!data) {
        return <progress/>
    }
    return (
        <>
            <h1>Users</h1>

            <table>
                <thead />
                <tbody>
                <tr>
                    <th>Name</th>
                    <th>Role</th>

                </tr>
                {data.result.map((user: any, i: number) =>
                <tr key={i + 900}>
                    <td onClick={(event) => modal.summonModalWindow(event, user)}>{user.username}</td>
                    <td>
                        {auth.user.id !== user.id
                        && user.role !== 'PO'
                        ?
                        <select value={user.role} onChange={(event)=>handleSelectUserRole(event, user.id)}>
                            <option value="User">User</option>
                            <option value="Banned">Banned</option>
                            <option value="Admin">Admin</option>
                        </select>
                        :
                        <>{user.role}</>}
                    </td>
                </tr>
                )}
            </tbody>
            </table>
            <br/>
            <div className="pagination">
                <button onClick={handlePrev}>❮</button>
                <button onClick={handleNext}>❯</button>
            </div>
        </>
    )
}

function Channels() {
    const auth = useAuth();
    const socket = useSocketIO();
    const chat = useChat();
    const navigate = useNavigate();

    const [currentPage, setCurrentPage] = useState(1);
    const [update, setUpdate] = useState(false);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState(null);

    const modal = useModal()

    useEffect(() => {
        axios.get("http://localhost:3001/api/channel/all/" + currentPage, {
            method: 'get',
            headers: {
                Authorization: "Bearer " + auth.user.token,
            }
        }).then((response: any) => {
            if (response.data.result.length === 0 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
            else {
                setData(response.data)
                setUpdate(false);
            }
        }).catch((error) => {
            setError(error);
        })
    }, [currentPage, update, auth.user.token])



    const handleJoinChannelAsAdmin = (event: any, id: number, name: string) => {
        navigate('/admin/channel/' + name);
    }

    const handleSetOwner = (event: any, channelId: number) => {
        const userName = event.target.value;
        axios.post("http://localhost:3001/api/admin/make/channel/owner", {
            channelId,
            userName,
        }, {
            headers: {
                Authorization: "Bearer " + auth.user.token,
            },
        }).then(()=> {
            event.target.value = '';
            event.placeholder = userName;
            setUpdate(true);
        }).catch(()=> {
            event.target.value = '';
            setUpdate(true);
        });
    }

    const handleSetAdmin = (event: any, channelId: number) => {
        const userName = event.target.value;
        axios.post("http://localhost:3001/api/admin/make/channel/admin", {
            channelId,
            userName,
        }, {
            headers: {
                Authorization: "Bearer " + auth.user.token,
            },
        }).then(()=> {
            event.target.value = '';
            setUpdate(true);
        }).catch(()=> {
            event.target.value = '';
            setUpdate(true);
        });
    }

    const handleDeleteAdmin = (userName: string, channelId: number) => {
        axios.post("http://localhost:3001/api/admin/remove/channel/admin", {
            channelId,
            userName,
        }, {
            headers: {
                Authorization: "Bearer " + auth.user.token,
            },
        }).then(()=> {
            setUpdate(true);
        }).catch(()=> {
            setUpdate(true);
        });
    }

    const handleDeleteChannel = (id: any) => {
        axios.delete("http://localhost:3001/api/channel/" + id, {
            headers: {
                Authorization: "Bearer " + auth.user.token,
            }
        }).then(()=>{
            setUpdate(true)
        });
    }

    const handleNext = () => {
        setCurrentPage(currentPage + 1);
    }

    const handlePrev = () => {
        let prev = currentPage - 1;
        if (prev < 1)
            prev = 1;
        setCurrentPage(prev);
    }



    if (error) {
        return <>Error!</>
    } else if (!data) {
        return <progress/>
    }
    return (
        <>
        <ModalWindow />
            <h1>Channels</h1>

            <table>
                <thead/>
                <tbody>
                <tr>
                    <th>Name</th>
                    <th>Owner</th>
                    <th>Admins</th>
                    <th>Visitors</th>
                    <th>Sanctions</th>
                    <th>Password</th>
                    <th>Delete</th>
                </tr>
                {data.result.map((channel: any, i: number) =>
                <tr key={i + 500}>
                    <td onClick={(event: any) => handleJoinChannelAsAdmin(event, channel.id, channel.name)}>
                        {channel.name}
                    </td>
                    <td>
                        <input placeholder={channel.owner?.username} onKeyPress={e =>
                            (e.code === "Enter" || e.code === "NumpadEnter") ? handleSetOwner(e, channel.id) : 0} type='text'>
                        </input>
                    </td>
                    <td>
                        <ul>
                        {channel.admins?.map((user: any, i: number) =>
                            <li onClick={(event) => modal.summonModalWindow(event, user)} key={i + 100}>
                                {user.username}
                                <button className="delete-button" onClick={() => {handleDeleteAdmin(user.username, channel.id)}}>x</button>
                            </li>
                        )}
                        </ul>
                        <input onKeyPress={e =>
                            (e.code === "Enter" || e.code === "NumpadEnter") ? handleSetAdmin(e, channel.id) : 0} type='text'>
                        </input>
                    </td>
                    <td>
                        <ul>
                        {channel.visitors?.map((user: any, i: number) =>
                            <li onClick={(event) => modal.summonModalWindow(event, user)} key={i + 200}>{user.username}</li>
                        )}
                        </ul>
                    </td>
                    <td>
                        <ul>
                        {channel.sanctions?.map((sanction: any, i: number) =>
                            <li key={i + 300}>{sanction.type + " " + sanction.target.username}</li>
                        )}
                        </ul>
                    </td>
                    <td>
                        {channel.password ? 'V' : 'X'}
                    </td>
                    <td>
                        {
                            channel.name !== 'general'
                            ?
                            <button className="delete-button" onClick={() => {
                                handleDeleteChannel(channel.id)
                            }}>x</button>
                                : <></>
                        }
                    </td>
                </tr>
                )}
            </tbody>
            </table>
            <br/>
            <div className="pagination">
                <button onClick={handlePrev}>❮</button>
                <button onClick={handleNext}>❯</button>
            </div>
        </>
    )
}