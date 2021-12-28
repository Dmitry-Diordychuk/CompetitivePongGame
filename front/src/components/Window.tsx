import React, { useState, useEffect, useRef } from 'react';
import '../styles/modal_win.css';
import axios, { AxiosRequestConfig }  from 'axios';
import {useModal} from "../contexts/modal.context";
import {useContact} from "../contexts/contact.context";
import {useChat} from "../contexts/chat.context";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../auth/auth.context";

function ModalWindow()
{
    const auth = useAuth();
    const contact = useContact();
    const modalWindow = useModal();
    const chat = useChat();
    const navigate = useNavigate();

    const [requestType, setRequestType] = useState<string>('skip');
    const banTime = useRef<any>()

    let modal_position = {
        left: modalWindow.x,
        top: modalWindow.y,
    }

    useEffect(() =>
    {
        if (requestType === 'not_logged' || requestType === 'skip')
            return;
        axios(contact.generateRequestOptions(requestType))
            .then((response : any) => contact.axiosLoading(response, requestType))
            .catch(e => {});
        setRequestType('skip');
    })

    function friend_exit()
    {
        modalWindow.setIsActive(false);
        contact.addFriend(modalWindow.subject.id);
        setRequestType('add_friend');
    }

    function kick_from_friends()
    {
        modalWindow.setIsActive(false);
        contact.deleteFriend(modalWindow.subject.id);
        setRequestType('delete_friend');
    }

    function add_to_blacklist()
    {
        modalWindow.setIsActive(false);
        contact.ban(modalWindow.subject.id);
        setRequestType('add_blacklist');
    }

    function  delete_from_blacklist()
    {
        modalWindow.setIsActive(false);
        contact.unban(modalWindow.subject.id);
        setRequestType('delete_blacklist');
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
                //			Omni.Account.profile_data
            ]
        }
        chat.addNewChannel(temp);
        chat.setCurrentChannel(modalWindow.subject.username);
        modalWindow.setIsActive(false);
    }

    function sendDate(type : string)
    {
        let date : Date = new Date();
        date.setMinutes(date.getMinutes() + (+banTime.current.value));

        chat.socket?.emit('apply-sanction', {
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
            .then((answer : any) => {
//				console.log(answer)
            })
            .catch(e => {})
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
            <div></div>
        )

    }

    function SpectateBttn()
    {
        const [spectrate, setSpectr] = useState('Spectrate')

        chat.socket?.emit("is-in-game", modalWindow.subject.id);
        chat.socket?.once("in-game", ((e : any) => setSpectr(e)));


        if (!spectrate)
            return (<div></div>)

        return (
            <div className='modal_div' onClick={() => {
                //Omni.Game.playerNumber = 0
                chat.socket?.emit("spectate-game", modalWindow.subject.id)
                //Omni.setActScreen('game');

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
        chat.socket?.emit('duel-invite', temp)
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
                    <SpectateBttn />
                    <div className='modal_div' onClick={() => friend_exit()}>Add to friends</div>
                    <div className='modal_div'>Something else</div>
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