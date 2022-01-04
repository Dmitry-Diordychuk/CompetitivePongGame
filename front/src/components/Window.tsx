import React, { useState, useRef } from 'react';
import '../styles/Window.css';
import axios, { AxiosRequestConfig }  from 'axios';
import {useModal} from "../contexts/modal.context";
import {useContact} from "../contexts/contact.context";
import {useChat} from "../contexts/chat.context";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../auth/auth.context";
import {useSocketIO} from "../contexts/socket.io.context";

function ModalWindow()
{
    const auth = useAuth();
    const contact = useContact();
    const modalWindow = useModal();
    const socket = useSocketIO();
    const chat = useChat();
    const navigate = useNavigate();

    const banTime = useRef<any>()

    let modal_position = {
        left: modalWindow.x,
        top: modalWindow.y,
    }

    function friend_exit()
    {
        modalWindow.setIsActive(false);
        contact.addFriend(modalWindow.subject.id);
    }

    function kick_from_friends()
    {
        modalWindow.setIsActive(false);
        contact.deleteFriend(modalWindow.subject.id);
    }

    function add_to_blacklist()
    {
        modalWindow.setIsActive(false);
        contact.ban(modalWindow.subject.id);
    }

    function  delete_from_blacklist()
    {
        modalWindow.setIsActive(false);
        contact.unban(modalWindow.subject.id);
    }

    function mute_exit()
    {
        if (contact.isFriend(modalWindow.subject))
        {
            kick_from_friends();
            return ;
        }
        else if (contact.isBanned(modalWindow.subject))
        {
            delete_from_blacklist();
            return;
        }
        add_to_blacklist();
    }

    function openDirectChannel()
    {
        let temp : any = {
            id : -(modalWindow.subject.id),
            channel : modalWindow.subject.username,
            visitors : [
                modalWindow.subject,
            ]
        }
        chat.addNewChannel(temp);
        navigate("/channel/" + temp.id);
        chat.setCurrentChannel(temp.id);
        modalWindow.setIsActive(false);
    }

    function sendDate(type : string)
    {
        let date : Date = new Date();
        date.setMinutes(date.getMinutes() + (+banTime.current.value));

        socket.emit('apply-sanction', {
            'channel' : chat.currentChannelName,
            'userId' : modalWindow.subject.id,
            'type' : type,
            'expiryAt' : date
        })
        modalWindow.setIsActive(false)
    }

    function makeAdmin()
    {
        let putAdmin : AxiosRequestConfig =
            {
                method: 'put',
                url: "http://localhost:3001/api/channel/admin/",
                responseType: "json",
                headers :
                    {
                        "authorization" : "Bearer " + auth.user.token,
                    },
                data :
                    {
                        userId : modalWindow.subject.id,
                        channelId : chat.getCurrentChannelID(),
                    }
            }
        axios(putAdmin)
            .then(() => {
//				console.log(answer)
            })
            .catch(() => {})
    }

    function AdminPart() {
        let temp : number[] = chat.getVisibleChannelAdmins().map((e : any) : any => e.id );
        if (temp && temp.findIndex((e : any) => e === auth.user.id) > -1)
            return (
                <div>
                    <div>admin part</div>
                    <hr/>
                    <div>
                        <select name='ban_time' ref={banTime}>
                            <option value="1">1 min</option>
                            <option value="5">5 min</option>
                            <option value="10">10 min</option>
                            <option value="30">30 min</option>
                            <option value="10000">infinite</option>
                        </select>
                        <div onClick={() => sendDate('ban')}>Ban</div>
                        <div onClick={() => sendDate('mute')}>Mute</div>
                        <hr/>
                        <div onClick={() => makeAdmin()}>Make admin</div>
                    </div>
                </div>
            )
        return (
            <></>
        )

    }

    function SpectateButton()
    {
        const [isInGame, setIsInGame] = useState(false)

        socket.emit("is-in-game", modalWindow.subject.id);
        socket.once("in-game", ((isInGame: any) => {
            setIsInGame(isInGame)
        }));


        if (!isInGame)
            return (<></>)

        return (
            <div className='modal_div' onClick={() => {socket.emit("spectate-game", modalWindow.subject.id)}}>
                Spectate
            </div>
        )
    }

    function makeDuel(type : string)
    {
        let temp =
            {
                rivalId : +modalWindow.subject.id,
                gameMode : type //modded default
            }
        socket.emit('duel-invite', temp)
        modalWindow.setIsActive(false);
    }

    function openProfile() {
        const userId = modalWindow.subject.id;
        return navigate("/profile/" + userId, {replace: true});
    }

    function MainPart()
    {
        const contact = useContact();

        let mute_str : string = 'Mute';
        if (contact.isFriend("mock_subject"))
            mute_str = 'Kick from friends';
        else if (contact.isBanned("mock_subject"))
            mute_str = 'Unmute'

        return (
            <div style={modal_position}
                 className='myModal_active'
                 onClick={e => e.stopPropagation()}>
                <div className='myModalContent'>
                    <h3>{modalWindow.subject.username}</h3>
                    <div className='modal_div' onClick={() => openDirectChannel()}> Private </div>
                    <div className='modal_div' onClick={() => makeDuel('modded')}>Modded Duel</div>
                    <div className='modal_div' onClick={() => makeDuel('default')}>Classic Duel</div>
                    <div className='modal_div' onClick={() => mute_exit()}>{mute_str}</div>
                    <div className='modal_div' onClick={() => openProfile()}>Profile</div>
                    <SpectateButton />
                    <div className='modal_div' onClick={() => friend_exit()}>Add to friends</div>
                    <div className='modal_div'>Something else</div>
                </div>
                <AdminPart />
            </div>
        )
    }

    if (!modalWindow.isActive)
        return (<></>)
    else
        return (
            <div className='myModal_screen' onClick={
                () => modalWindow.setIsActive(false)}>
                <MainPart />

            </div>
        )
}

export default ModalWindow;