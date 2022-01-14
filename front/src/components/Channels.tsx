import React, {useCallback, useEffect, useRef, useState} from "react";
import {useChat} from "../contexts/chat.context";
import {useNavigate} from "react-router-dom";

import '../styles/Channels.css'
import {useSocketIO} from "../contexts/socket.io.context";
import {useEffectOnce, useInterval} from "usehooks-ts";
import axios from "axios";
import {useAuth} from "../auth/auth.context";


export default function Channels() {
    const navigate = useNavigate();
    const chat = useChat();
    const auth = useAuth();


    const fetchChannels = useCallback(() => {
        if (auth.user) {
            axios.get("http://localhost:3001/api/channel/all/current/", {
                method: 'get',
                url: "http://localhost:3001/api/channel/all/current/",
                responseType: "json",
                headers: {
                    "authorization": 'Bearer ' + auth.user.token,
                },
            })
            .then((response: any) => {
                chat.updateChannels(response.data.channels);
            })
            .catch(
                e => console.log('Channels fetching error: ' + e)
            );
        }
    }, [auth.user, chat.channels, chat.currentChannelName]);

    useEffectOnce(() => fetchChannels());

    useInterval(() => {
        fetchChannels();
    }, 1000);

    console.log(chat.channels);

    if (!chat.channels.length) {
        return <progress/>
    }

    return (
        <>
            <AddChannelButton />
            <ul className="chat_list">
                {chat.channels.map((ch : any, i: number) : any =>
                    <li className="chat_item" key={i}>
                        <span className="chat_name" onClick={(e) => {
                            e.preventDefault();
                            navigate("/channel/" + ch.name)}
                        }>
                            {ch.name}
                        </span>
                        {ch.name !== 'general' && <span
                            onClick={() => {
                                chat.deleteChannel(ch.name)
                                navigate('/channels', {replace: true});
                            }}
                            className="delete_chat"
                        >
                            <button>x</button>
                        </span>}
                    </li>)}
            </ul>
        </>
    )
}

function AddChannelButton()
{
    const [newChannelWindow, setNewChannelWindow] = useState(false)

    return (
        <div>
            <AddChannelWindow setVisible={setNewChannelWindow} visible={newChannelWindow} />
            <button className='new_chanel_button' onClick={() => setNewChannelWindow(true)}>
                <b> + </b>
            </button>
        </div>
    );
}

interface NewChannelWindowInterface
{
    setVisible : any;
    visible : any;
}

function AddChannelWindow({setVisible, visible} : NewChannelWindowInterface)
{
    const chat = useChat();
    const socket = useSocketIO();

    const [last_added_channel, setLastAdded] = useState<string>('');
    const [create_or_join, setCoJ] = useState(false);
    const [have_err, setError] = useState<any>(null);
    const [is_priv, setIs_priv] = useState(false);
    const pass_ref = useRef<any>("");
    const name_fer = useRef<any>("");

    const navigate = useNavigate();

    function PassInput()
    {
        if (!is_priv)
            return (<div></div>)
        return (
            <div>
                <input type='text' ref={pass_ref} placeholder='Chanel password' onKeyPress={e => (e.code === "Enter" || e.code === "NumpadEnter") ?
                    AddNewChannel() : 0} />
            </div>
        )
    }

    function create_channel(new_chan : any, name : string)
    {
        if (last_added_channel === name)
            return ;
        socket.emit("create_channel", new_chan)
        socket.once("exception", (data : any) => {setError(data);})
        socket.once("created_channel", (data : any) =>
        {
            if (last_added_channel === name)
                return ;
            setVisible(false);
            chat.addNewChannel(data.message);
            navigate('/channels', {replace: true});
        })
        setLastAdded(name);
    }

    function Join_channel(new_chan : any, name : string)
    {
        if (last_added_channel === name)
            return ;

        socket.emit("join_channel", new_chan)
        socket.once("exception", (data : any) => {setError(data)})
        socket.once("joined_channel", (data : any) =>
        {
            if (last_added_channel === name)
                return ;
            setVisible(false);
            chat.addNewChannel(data.message);
            
            navigate('/channels', {replace: true})
        })
        setLastAdded(name);
    }

    function AddNewChannel()
    {
        var temp_pass;
        var value : string = name_fer.current.value
        name_fer.current.value = ''
        if (pass_ref === null || pass_ref.current === '' )
            temp_pass = null;
        else
        {
            temp_pass = pass_ref.current.value;
            pass_ref.current = '';
        }

        const new_chan = {
            name: value,
            password: temp_pass
        }

        if (!chat.channels.find((ch: any) => ch.name === value))
        {
            if (create_or_join)
                create_channel(new_chan, value)
            else
                Join_channel(new_chan, value)
        }
    }

    function NewChannelWindow()
    {
        let label = 'Join a';
        if (create_or_join)
            label = 'Create new';
        return (
            <div>
                <div className="joinChannelBttn" onClick={() => setCoJ(!create_or_join)}>join</div>
                <div className="createChannelBttn" onClick={() => setCoJ(!create_or_join)}>create</div>
                <div className={create_or_join ? 'createChannelDiv' : 'joinChannelDiv'}>
                <h3>{label} channel</h3>
                <input placeholder='Chanel name' ref={name_fer}
                                   onKeyPress={e =>
                                       (e.code === "Enter" || e.code === "NumpadEnter") ?
                                       AddNewChannel() : 0} />
                <PassInput/>
                    <div><input type="checkbox" checked={is_priv} 
                onChange={() => setIs_priv(!is_priv)} /> With password</div>
                    <button onClick={() => AddNewChannel()}>Do it</button>
                </div>
                
            </div>
        )
    }

    if (have_err != null)
    {
        return (
        <div className={visible ? 'NC_active' : 'myModal'}>
            <div className='NC_Content'><div>{have_err.errors[0]}</div>
                <div>
                    <button  onClick={() => setError(null)} >ok</button>
                </div>
            </div>
        </div>)
    }
    else{
        return (
                <div className={visible ? 'NC_active' : 'myModal'}>
                        <button className='ModalBttn' onClick={() => setVisible(false)} />
                            <NewChannelWindow />
                </div>
          
        )
    }
}
