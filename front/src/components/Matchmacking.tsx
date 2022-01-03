import {useChat} from "../contexts/chat.context";
import {useGame} from "../contexts/game.context";
import {useLocation, useNavigate} from "react-router-dom";
import React, {useRef, useState} from "react";
import {useEffectOnce} from "usehooks-ts";
import {useSocketIO} from "../contexts/socket.io.context";


export default function Matchmacking() {
    const socket = useSocketIO();
    const location = useLocation();
    const navigate = useNavigate();

    const matchMakingStatusRef = useRef('false');
    const [matchMakingStatus, setMatchMakingStatus] = useState<string>('false');
    const [stringOfTime, setStringOfTime] = useState<string>("00:00");
    const timerRef = useRef(-1);

    function  startGameSearch()
    {
        if (location.pathname === '/game')
            return;
        matchMakingStatusRef.current = 'Leave queue';
        setMatchMakingStatus('Leave queue');
        socket.emit('matchmaking-add-in-queue');
    }

    function handleMatchmakingTime(time : any) {
        time = Math.floor(time) / 1000;
        let minutes = Math.trunc(time / 60);
        let seconds = Math.trunc(time % 60);

        let result = '';
        if (minutes < 10) {
            result += '0' + minutes.toString();
        } else {
            result += minutes.toString();
        }
        result += ':';
        if (seconds < 10) {
            result += '0' + seconds.toString();
        } else {
            result += seconds.toString();
        }
        setStringOfTime(result);
    }

    function GameBttn()
    {
        if (matchMakingStatusRef.current === 'Leave queue')
        {
            return (
                <a onClick={() => {
                    matchMakingStatusRef.current = 'false';
                    setMatchMakingStatus('false');
                    timerRef.current = -1;
                    socket.emit('matchmaking-leave-queue');
                }}>
                    <b>{stringOfTime} </b> {matchMakingStatus}
                </a>
            )
        }
        if (matchMakingStatusRef.current === 'accept')
            return (
                <a>
                    <b onClick={() => {
                        matchMakingStatusRef.current = 'accepted';
                        setMatchMakingStatus('accepted');
                        socket.emit('matchmaking-accept-game')}}>
                        {matchMakingStatus} </b>  {stringOfTime}
                    <b onClick={() => {
                        matchMakingStatusRef.current = 'false';
                        setMatchMakingStatus('false');
                        socket.emit('matchmaking-decline-game')}}> Decline </b>
                </a>
            )
        if (matchMakingStatusRef.current === 'accepted')
        {
            if (location.pathname === '/game')
                return (<div></div>)
            else
                return (
                    <a>
                        <b> Accepted </b> {stringOfTime}
                    </a>
                )
        }
        if (matchMakingStatusRef.current === 'declined')
        {
            return (
                <a>
                    Match was {matchMakingStatus} <b onClick={() => cancelSearching()}>OK</b>
                </a>
            )
        }
        return (
            <div></div>
        )
    }

    function cancelSearching() {
        matchMakingStatusRef.current = 'false';
        setMatchMakingStatus('false');
    }

    useEffectOnce(()=>{
        socket.on('matchmaking-init', (message: any) => {
            if (matchMakingStatusRef.current === 'accepted') {
                matchMakingStatusRef.current = 'false';
                setMatchMakingStatus('false');
                navigate('/game', {replace: true});
            }
        })
        return (() => {
            socket.off('matchmaking-init');
        });
    });

    useEffectOnce(() => {
        socket.on('matchmaking-success', (message : any) => {
            matchMakingStatusRef.current = 'accept';
            setMatchMakingStatus('accept');
        });
        return (() => {
            socket.off('matchmaking-success')
        });
    })

    useEffectOnce(() => {
        socket.on('matchmaking-wait-for-players', (message: any) => {
            if (message > 9000) {
                matchMakingStatusRef.current = 'declined';
                setMatchMakingStatus('declined');
            }
            if (timerRef.current === message / 1000)
                return;
            handleMatchmakingTime(10000 - message)
            timerRef.current = message / 1000;
        })
        return (() => {
            socket.off('matchmaking-wait-for-players');
        });
    })

    useEffectOnce(() => {
        socket.on('matchmaking-restart', (message: any) => {
            console.log(matchMakingStatusRef.current)
            if (matchMakingStatusRef.current === 'accept' || matchMakingStatusRef.current === 'accepted')
                startGameSearch();
        })
        return (() => {
            socket.off('matchmaking-restart');
        });
    });

    useEffectOnce(() => {
        socket.on('matchmaking-time', (message: any) => {
            if (timerRef.current === message / 1000)
                return;
            handleMatchmakingTime(message)
            timerRef.current = message / 1000;
        })
        return (() => {
            socket.off('matchmaking-time');
        });
    });

    return (
        <>
            <a className="topnav" onClick={() => startGameSearch() }>The GAME</a>
            <GameBttn />
        </>
    )
}