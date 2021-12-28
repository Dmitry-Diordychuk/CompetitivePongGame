import {useChat} from "../contexts/chat.context";
import {useGame} from "../contexts/game.context";
import {useLocation, useNavigate} from "react-router-dom";
import React, {useRef, useState} from "react";
import {useEffectOnce} from "usehooks-ts";


export default function Matchmacking() {
    const chat = useChat();
    const game = useGame();
    const location = useLocation();
    const navigate = useNavigate();

    const matchMakingStatusRef = useRef('false');
    const [matchMakingStatus, setMatchMakingStatus] = useState<string>('false');
    const [stringOfTime, setStringOfTime] = useState<string>("00:00");
    const timerRef = useRef(-1);
    //const [lastTime, setLastTime] = useState<number>(-1);

    function  startGameSearch()
    {
        if (location.pathname === '/game')
            return;
        matchMakingStatusRef.current = 'Leave queue';
        setMatchMakingStatus('Leave queue');
        chat.socket?.emit('matchmaking-add-in-queue');
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
                <div onClick={() => {
                    matchMakingStatusRef.current = 'false';
                    setMatchMakingStatus('false');
                    timerRef.current = -1;
                    chat.socket?.emit('matchmaking-leave-queue');
                }}>
                    <b>{stringOfTime} </b> {matchMakingStatus}
                </div>
            )
        }
        if (matchMakingStatusRef.current === 'accept')
            return (
                <div>
                    <b onClick={() => {
                        matchMakingStatusRef.current = 'accepted';
                        setMatchMakingStatus('accepted');
                        if (game.duel)
                        {
                            chat.socket?.emit('duel-accept', game.duel.rivalId)
                            game.setDuel(null);
                        }
                        chat.socket?.emit('matchmaking-accept-game')}}>
                        {matchMakingStatus} </b>  {stringOfTime}
                    <b onClick={() => {
                        matchMakingStatusRef.current = 'false';
                        setMatchMakingStatus('false');
                        chat.socket?.emit('matchmaking-decline-game')}}> Decline </b>
                </div>
            )
        if (matchMakingStatusRef.current === 'accepted')
        {
            if (location.pathname === '/game')
                return (<div></div>)
            else
                return (
                    <div>
                        <b> Accepted </b> {stringOfTime}
                    </div>
                )
        }
        if (matchMakingStatusRef.current === 'declined')
        {
            return (
                <div>
                    Match was {matchMakingStatus} <b onClick={() => cancelSearching()}>OK</b>
                </div>
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
        chat.socket?.on('matchmaking-init', (message: any) => {
            if (matchMakingStatusRef.current === 'accepted') {
                matchMakingStatusRef.current = 'false';
                setMatchMakingStatus('false');
                navigate('/game', {replace: true});
            }
        })
        return (() => {
            chat.socket?.off('matchmaking-init');
        });
    });

    useEffectOnce(() => {
        chat.socket?.on('matchmaking-success', (message : any) => {
            matchMakingStatusRef.current = 'accept';
            setMatchMakingStatus('accept');
        });
        return (() => {
            chat.socket?.off('matchmaking-success')
        });
    })

    useEffectOnce(() => {
        chat.socket?.on('matchmaking-wait-for-players', (message: any) => {
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
            chat.socket?.off('matchmaking-wait-for-players');
        });
    })

    useEffectOnce(() => {
        chat.socket?.on('duel-wait-for-players', (message: any) => {
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
            chat.socket?.off('duel-wait-for-players');
        });
    })

    useEffectOnce(() => {
        if (matchMakingStatusRef.current === 'accept') {
            chat.socket?.on('matchmaking-restart', (meassge: any) => {
                startGameSearch();
            })
        }
        return (() => {
            chat.socket?.off('matchmaking-restart');
        });
    });

    useEffectOnce(() => {
        chat.socket?.on('duel-invited', (message: any) => {
            matchMakingStatusRef.current = 'accept';
            setMatchMakingStatus('accept');
            game.setDuel(message);
        })
        return (() => {
            chat.socket?.off('duel-invited');
        });
    });

    useEffectOnce(() => {
        chat.socket?.on('matchmaking-time', (message: any) => {
            if (timerRef.current === message / 1000)
                return;
            handleMatchmakingTime(message)
            timerRef.current = message / 1000;
        })
        return (() => {
            chat.socket?.off('matchmaking-time');
        });
    });

    return (
        <>
            <div className="topnav" onClick={() => startGameSearch() }>The GAME</div>
            <GameBttn />
        </>
    )
}