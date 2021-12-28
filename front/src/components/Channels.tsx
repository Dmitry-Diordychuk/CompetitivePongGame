import React, {useRef, useState} from "react";
import '../styles/channels_panel.css'
import '../styles/bottom.css';
import '../styles/new_channel.css';
import {useChat} from "../contexts/chat.context";
import {useNavigate} from "react-router-dom";


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

    function switch_priv()
    {
        if (is_priv === false)
            setIs_priv(true)
        else
            setIs_priv(false)
    }

    function switch_join_or_creat()
    {
        if (create_or_join === false)
            setCoJ(true)
        else
            setCoJ(false)
    }

    function PassInput()
    {
        let button_label : string = 'Join channel';
        if (create_or_join === false)
            button_label = 'Create channel';
        if (is_priv === false)
        {
            return (
                <div>
                    <button onClick={switch_priv}>Private channel</button>
                    <button onClick={switch_join_or_creat}>{button_label}</button>
                </div>)
        }
        return (
            <div>
                <input type='text' ref={pass_ref} placeholder='Chanel password' onKeyPress={e => (e.code === "Enter" || e.code === "NumpadEnter") ?
                    pre_add_new_chan(name_fer.current) : 0}></input>
                <div>
                    <button onClick={switch_priv}>Common channel</button>
                    <button onClick={switch_join_or_creat}>{button_label}</button>
                </div>
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

    function add_new_chan(value : string)
    {
        var temp_pass;

        if (pass_ref.current === '' || pass_ref === null)
            temp_pass = null;
        else
            temp_pass = pass_ref.current.value;

        const new_chan = {
            name: value,
            password: temp_pass
        }
        if (!chat.channels.find((ch: any) => ch.name === value))
        {
            if (create_or_join === true)
                create_channel(new_chan, value)
            else
                Join_channel(new_chan, value)
        }
    }

    //Omni.addNewChannel = add_new_chan; //Transite for function

    function pre_add_new_chan(somthng : any)
    {
        const value = somthng.value
        add_new_chan(value)
        somthng.value = ''
    }

    let label = 'Join a';
    if (create_or_join === true)
        label = 'Create new';
    if (have_err != null)
    {
        return (<div className={visible ? 'NC_active' : 'myModal'}>
            <div className='NC_Content'><div>{have_err.errors[0]}</div>
                <div>
                    <button  onClick={() => setError(null)} >ok</button>
                </div>
            </div>
        </div>)
    }
    else{
        return (
            <>
                <div className={visible ? 'NC_active' : 'myModal'}>
                    <div className='NC_Content'><h3>{label} chanel</h3>
                        <button className='ModalBttn' onClick={() => setVisible(false)}></button>
                        <div>
                            <input placeholder='Chanel name' ref={name_fer}
                                   onKeyPress={e =>
                                       (e.code === "Enter" || e.code === "NumpadEnter") ?
                                           pre_add_new_chan(e.target) : 0}></input>
                            <PassInput/>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}
