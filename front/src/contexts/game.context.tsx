import React, {useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";

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
    playerNumber: number;
    setPlayerNumber: Function;
    isPlaying: boolean;
    setIsPlaying: Function;
    ball: any;
    setBall: Function;
    player: any;
    setPlayer: Function;
    enemy: any;
    setEnemy: Function;
    wall: any;
    setWall: Function;
    freeze: any;
    setFreeze: Function;
    shake: any;
    setShake: Function;
    speed: any;
    setSpeed: Function;
}

const GameContext = React.createContext<GameContextType>(null!);

export function GameProvider({ children }: { children: React.ReactNode }) {
    const [upButton, setUpButton] = useState(38);
    const [downButton, setDownButton] = useState(40);
    const [direction, setDirection] = useState('left');
    const [duel, setDuel] = useState(null);
    const [gameMessage, setGameMessage] = useState(null);
    const [playerNumber, setPlayerNumber] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const [ball, setBall] = useState({
        x : 1,
        y : 1
    });
    const [player, setPlayer] = useState({
            x : 1,
            y : 1
    });
    const [enemy, setEnemy] = useState({
        x : 1,
        y : 1
    });
    const [wall, setWall] = useState({
        x : 1,
        y : 1
    });
    const [freeze, setFreeze] = useState({
        x : 1,
        y : 1
    });
    const [shake, setShake] = useState({
        x : 1,
        y : 1
    });
    const [speed, setSpeed] = useState({
        x : 1,
        y : 1
    });

    const location = useLocation();
    const navigate = useNavigate();
    if (isPlaying && location.pathname != "/game") {
        navigate('/game', {replace: true});
    }

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
        playerNumber,
        setPlayerNumber,
        isPlaying,
        setIsPlaying,
        ball,
        setBall,
        player,
        setPlayer,
        enemy,
        setEnemy,
        wall,
        setWall,
        freeze,
        setFreeze,
        shake,
        setShake,
        speed,
        setSpeed,
    };

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
    return React.useContext(GameContext);
}