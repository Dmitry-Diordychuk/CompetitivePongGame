import React, {useRef, useState} from "react";
import {useChat} from "../contexts/chat.context";
import {useNavigate} from "react-router-dom";

import '../styles/Channels.css'


export default function Channels() {
    const chat = useChat();

    if (!chat.channels.length) {
        return <>Loading...</>
    }

    return (
        <div className='td_chat_list'>
            <AddChannelButton />
            <div>
                {chat.channels.map((ch : any) : any =>
                    <ChanelButton channel={ch} key={ch.id}/>)}
            </div>
        </div>
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
    )
}

interface ChannelButtonInterface
{
    channel : any;
}

function ChanelButton({channel} : ChannelButtonInterface) : any
{
    const chat = useChat();
    const navigate = useNavigate();

    function button_exit(name : string)
    {
        if (name === 'general' || name === 'direct')
            return
        return (<button onClick={() => chat.deleteChannel(name)} className="chanButtn">
        </button>)
    }

    return (
        <div className='td_div_chat_item'>
            <div className='td_div_chat_item_left' onClick={() => navigate("/channel/" + channel.id)}>
                {channel.name}
            </div>
            {button_exit(channel.name)}
        </div>)
}

interface NewChannelWindowInterface
{
    setVisible : any;
    visible : any;
}

function AddChannelWindow({setVisible, visible} : NewChannelWindowInterface)
{
    const chat = useChat();

    const [last_added_channel, setLastAdded] = useState<string>('');
    const [create_or_join, setCoJ] = useState(false);
    const [have_err, setError] = useState<any>(null);
    const [is_priv, setIs_priv] = useState(false);
    const pass_ref = useRef<any>("");
    const name_fer = useRef<any>("");

    function PassInput()
    {
        if (!is_priv)
            return (<div> </div>)
        return (
            <div>
                <input type='text' ref={pass_ref} placeholder='Chanel password' onKeyPress={e => (e.code === "Enter" || e.code === "NumpadEnter") ?
                    add_new_chan() : 0}></input>
            </div>
        )
    }

    let socket : any = chat.socket;

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
        })
        setLastAdded(name);
    }

    function add_new_chan()
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
        console.log(new_chan)
        if (!chat.channels.find((ch: any) => ch.name === value))
        {
            if (create_or_join === true)
                create_channel(new_chan, value)
            else
                Join_channel(new_chan, value)
        }
    }

    function NewChannelWindow()
    {
        let label = 'Join a';
        if (create_or_join === true)
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
                                       add_new_chan() : 0}></input>
                <PassInput/>
                    <div><input type="checkbox" checked={is_priv} 
                onChange={() => setIs_priv(!is_priv)} /> With password</div>
                    <button onClick={() => add_new_chan()}>Do it</button>
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
                        <button className='ModalBttn' onClick={() => setVisible(false)}></button>
                            <NewChannelWindow />
                </div>
          
        )
    }
}
