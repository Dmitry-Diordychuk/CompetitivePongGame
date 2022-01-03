import React, {useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {useEffectOnce} from "usehooks-ts";
import {useSocketIO} from "./socket.io.context";

interface GameContextType {
    upButton: number;
    setUpButton: Function;
    downButton: number;
    setDownButton: Function;
    direction: any;
    setDirection: Function;
    duel: any
    setDuel: Function;
    gameMessage: any;
    setGameMessage: Function;

    roundCounter: number;
    roundResult: number[];

    playerNumber: number;
    isPlaying: boolean;
    ball: any;
    player: any;
    enemy: any;
    walls: any;
    bonus: any;
}

const GameContext = React.createContext<GameContextType>(null!);

export function GameProvider({ children }: { children: React.ReactNode }) {
    const socket = useSocketIO();
    const location = useLocation();
    const navigate = useNavigate();

    const [isPlaying, setIsPlaying] = useState(false);

    if (isPlaying && location.pathname != "/game") {
        navigate('/game', {replace: true});
    }

    const [upButton, setUpButton] = useState(38);
    const [downButton, setDownButton] = useState(40);
    const [direction, setDirection] = useState('left');
    const [duel, setDuel] = useState(null);
    const [gameMessage, setGameMessage] = useState<any>(null);
    const [playerNumber, setPlayerNumber] = useState(0);

    const [roundCounter, setRoundCounter] = useState(0);
    const [roundResult, setRoundResult] = useState([]);

    const [ball, setBall] = useState(null);
    const [player, setPlayer] = useState(null);
    const [enemy, setEnemy] = useState(null);
    const [walls, setWalls] = useState(null);
    const [bonus, setBonus] = useState(null);

    useEffectOnce(() => {
        socket.on('game-init', ((init : number) => {
            setIsPlaying(true);
            setPlayerNumber(init - 1);
            if (playerNumber === -1)
                setPlayerNumber(0);
        }))
        return (() => {
            socket.off('game-init', ()=>{});
        })
    });

    useEffectOnce(() => {
        socket.on('game-state', ((message : string) => {
            let gameState = JSON.parse(message);

            if (gameState) {
                setBonus(gameState.bonus);
                setBall(gameState.ball);
                setPlayer(gameState.players[0]);
                setEnemy(gameState.players[1]);

                setRoundResult(gameState.roundResult);
                setRoundCounter(gameState.roundCounter);

                setIsPlaying(true);
                setGameMessage(message);

                setWalls(gameState.active.filter((i: any) => i.type === 'wall').map((i: any) => i.wall));
            }
        }))
        return (() => {
            socket.off('game-state', ()=>{});
        })
    });

    useEffectOnce(() => {
        socket.on('game-over', ((over : any) => {
            setIsPlaying(false);
            navigate('/profile', {replace: true});
        }))
        return (() => {
            socket.off('game-over', ()=>{});
        })
    });

    let value : GameContextType = {
        upButton,
        setUpButton,
        downButton,
        setDownButton,
        direction,
        setDirection,
        duel,
        setDuel,
        gameMessage,
        setGameMessage,

        roundCounter,
        roundResult,

        playerNumber,
        isPlaying,
        ball,
        player,
        enemy,
        walls,
        bonus,
    };

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
    return React.useContext(GameContext);
}