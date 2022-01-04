import {useSocketIO} from "../contexts/socket.io.context";
import {useGame} from "../contexts/game.context";
import {useNavigate} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {useEffectOnce} from "usehooks-ts";

export default function Matchmacking() {
    const socket = useSocketIO();
    const game = useGame();
    const navigate = useNavigate();
    const [inviteFlag, setInviteFlag] = useState(false);
    const [duelInviteMessage, setDuelInviteMessage] = useState('');
    const [currentRivalId, setCurrentRivalId] = useState(null);
    const [time, setTime] = useState(0);

    useEffectOnce(() => {
        socket.on('duel-invited', (message: any) => {
            setInviteFlag(true);
            setDuelInviteMessage(`${message.rivalUsername} has invited you to ${message.gameMode} duel!`);
            setCurrentRivalId(message.rivalId);
            game.setDuel(message);
        })
        return (() => {
            socket.off('duel-invited');
        });
    });

    useEffectOnce(() => {
        socket.on('duel-wait-for-players', (timer: any) => {
            if (timer === 10000) {
                setInviteFlag(false);
                setCurrentRivalId(null);
                setDuelInviteMessage('');
            }
            setTime(timer);
        })
        return (() => {
            socket.off('duel-wait-for-players');
        });
    })

    useEffectOnce(() => {
        socket.on('duel-declined', () => {
            setDuelInviteMessage('Duel has been declined!');
        })
    })

    const handleAccept = () => {
        socket.emit('duel-accept', currentRivalId);
        navigate('/game', {replace: true});
    }

    const handleDecline = () => {
        socket.emit('duel-decline', currentRivalId);
        setInviteFlag(false);
        setCurrentRivalId(null);
        setDuelInviteMessage('');
    }

    const handleDeclineMessage = () => {
        setInviteFlag(false);
        setCurrentRivalId(null);
        setDuelInviteMessage('');
    }

    useEffect(()=>{}, [time]);
    return (
        <>
            {inviteFlag && <button style={{ backgroundColor: "#FFFFFF" }}>
                <div onClick={()=>handleDeclineMessage()}>{duelInviteMessage}</div>
                <button onClick={()=>handleAccept()}>Accept</button>
                <button onClick={()=>handleDecline()}>Decline</button>
                <p>{10 - +time.toString()[0]}</p>
            </button>}
        </>
    )
}