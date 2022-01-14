import React, { useState, useEffect, useRef } from 'react';
import '../styles/Window.css';
import axios, { AxiosRequestConfig }  from 'axios';
import {useModal} from "../contexts/modal.context";
import {useContact} from "../contexts/contact.context";
import {useChat} from "../contexts/chat.context";
import {useLocation, useNavigate} from "react-router-dom";
import {useAuth} from "../auth/auth.context";
import {useSocketIO} from "../contexts/socket.io.context";
import {useGame} from "../contexts/game.context";

function ModalWindow()
{
    const auth = useAuth();
    const contact = useContact();
    const modalWindow = useModal();
    const socket = useSocketIO();
    const chat = useChat();
    const navigate = useNavigate();
    const location = useLocation();
    const [spectrate, setSpectr] = useState(true)

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
        contact.ban(modalWindow.subject.id, () => {
            modalWindow.setIsActive(false);
        }, () => {
            console.log('Ban failed!');
        });
    }

    function  delete_from_blacklist()
    {
        contact.unban(modalWindow.subject.id, () => {
            modalWindow.setIsActive(false);
        }, () => {

        });
    }

    function blacklistHandle()
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
        modalWindow.setIsActive(false);
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
        modalWindow.setIsActive(false);
    }

    function sanctionHandle(type : string)
    {
        let date : Date = new Date();
        date.setMinutes(date.getMinutes() + (+banTime.current.value));

        socket.emit('apply-sanction', {
            'channel' : chat.currentChannelName,
            'userId' : modalWindow.subject.id,
            'type' : type,
            'expiryAt' : date
        });
        modalWindow.setIsActive(false);
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
            .then((answer : any) => {
//				console.log(answer)
            })
            .catch(e => {})
            modalWindow.setIsActive(false);
    }

    function AdminPart() {
        let temp : number[] = chat.getVisibleChannelAdmins().map((e : any) : any => e.id );
        if (temp && temp.findIndex((e : any) => e === auth.user.id) > -1 && location.pathname.split('/')[1] !== 'admin')
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
                        <div onClick={() => sanctionHandle('ban')}>Ban</div>
                        <div onClick={() => sanctionHandle('mute')}>Mute</div>
                        <hr/>
                        <div onClick={() => makeAdmin()}>Make admin</div>
                    </div>
                </div>
            )
        return (
            <div></div>
        )

    }

    function SpectateBttn()
    {
        socket.emit("is-in-game", modalWindow.subject.id);
        socket.once("in-game", ((e : any) => {
        if (e['userId'] === modalWindow.subject.id)
            setSpectr(e['isOnline'])
        }));

        if (!spectrate)
            return (<div></div>)

        return (
            <div className='modal_div' onClick={() => {
                modalWindow.setIsActive(false);
                socket.emit("spectate-game", modalWindow.subject.id);
            }}>Spectrate</div>
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
        modalWindow.setIsActive(false);
        return navigate("/profile/" + userId, {replace: true});
    }

    function MainPart()
    {
        const contact = useContact();

        let mute_str : string = 'Add to blacklist';
        if (contact.isFriend("mock_subject"))
            mute_str = 'Kick from friends';
        else if (contact.isBanned("mock_subject"))
            mute_str = 'Remove from blacklist';

        return (
            <div style={modal_position}
                 className='myModal_active'
                 onClick={e => e.stopPropagation()}>
                <div className='myModalContent'>
                    <h3>{modalWindow.subject.username}</h3>
                    <div className='modal_div' onClick={() => openDirectChannel()}> Private </div>
                    <div className='modal_div' onClick={() => makeDuel('modded')}>Modded Duel</div>
                    <div className='modal_div' onClick={() => makeDuel('default')}>Classic Duel</div>
                    <div className='modal_div' onClick={() => blacklistHandle()}>{mute_str}</div>
                    <div className='modal_div' onClick={() => openProfile()}>Profile</div>
                    <SpectateBttn />
                    <div className='modal_div' onClick={() => friend_exit()}>Add to friends</div>
                </div>
                <AdminPart />
            </div>
        )
    }

    if (modalWindow.isActive === false)
        return (<div></div>)
    else
        return (
            <div className='myModal_screen' onClick={
                () => modalWindow.setIsActive(false)}>
                <MainPart />

            </div>
        )
}

export default ModalWindow;