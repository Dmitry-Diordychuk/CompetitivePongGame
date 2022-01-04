import React, {useMemo, useRef, useState} from 'react';
import '../styles/Game.css'
import {useGame} from "../contexts/game.context";
import {useEffectOnce, useEventListener, useUpdateEffect} from "usehooks-ts";
import {useSocketIO} from "../contexts/socket.io.context";

function Game()
{
	const game = useGame();
	const socket = useSocketIO();

	const [timer, setTimer] = useState<any>(Date.now());
	const [score, setScore] = useState([0, 0]);

	const canvasRef: any = useRef(null);
	const contextRef: any = useRef(null);

	useEffectOnce(() => {
		setTimer(Date.now());
		canvasRef.current.width = 920;
		canvasRef.current.height = 600;
		contextRef.current = canvasRef.current.getContext("2d");
		contextRef.current.font = "1px serif";
	});

	useUpdateEffect(() => {
		contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

		contextRef.current.save();
		contextRef.current.scale(23, 15);

		let time = new Date(Date.now() - timer);

		const minutes = time.getMinutes();
		const seconds = time.getSeconds();
		const minutesStr = minutes < 10 ? "0" + minutes : minutes;
		const secondsStr = seconds < 10 ? "0" + seconds : seconds;
		contextRef.current.fillStyle = "#00dd30";
		contextRef.current.fillText(minutesStr + ":" + secondsStr, 20, 1);
		contextRef.current.fillText(score[0], 0.5, 1);
		contextRef.current.fillText(score[1], 39, 1);

		if ((game.playerNumber === 1 && game.direction === 'left') || (game.playerNumber === 0 && game.direction === 'right')) {
			const originalFieldSize = 40;
			const width = 1;

			if (game.player) {
				contextRef.current.fillStyle = "#00a2ff";
				contextRef.current.fillRect(originalFieldSize - game?.player.position.x - width, game?.player.position.y, width, game?.player.size);
			}

			if (game.enemy) {
				contextRef.current.fillStyle = "#dd0025";
				contextRef.current.fillRect(originalFieldSize - game?.enemy.position.x - width, game?.enemy.position.y, width, game?.enemy.size);
			}

			if (game.walls) {
				game.walls.forEach((wall: any) => {
					contextRef.current.fillStyle = "#777777";
					contextRef.current.fillRect(originalFieldSize - wall.position.x - width, wall.position.y, width, wall.size);
				})
			}

			if (game.ball) {
				contextRef.current.beginPath();
				contextRef.current.ellipse(originalFieldSize - game.ball.position.x + 0.5 - width, game.ball.position.y + 0.5, 0.5, 0.75, 0, 0, Math.PI * 2);
				contextRef.current.fillStyle = "#00dd30";
				contextRef.current.fill();
				contextRef.current.closePath();
			}

			if (game.bonus) {
				contextRef.current.beginPath();
				contextRef.current.ellipse(originalFieldSize - game.bonus.position.x + 0.5 - width, game.bonus.position.y + 0.5, 1, 1.53, 0, 0, Math.PI * 2);
				if (game.bonus.type === 'speed')
					contextRef.current.fillStyle = "#ff3e00";
				else if (game.bonus.type === 'freeze')
					contextRef.current.fillStyle = "#0040ff";
				else if (game.bonus.type === 'wall')
					contextRef.current.fillStyle = "rgba(192,174,174,0.69)";
				else if (game.bonus.type === 'shake')
					contextRef.current.fillStyle = "rgba(226,255,16,0.69)";
				contextRef.current.fill();
				contextRef.current.closePath();
			}
		} else {
			if (game.player) {
				contextRef.current.fillStyle = "#00a2ff";
				contextRef.current.fillRect(game?.player.position.x, game?.player.position.y, 1, game?.player.size);
			}

			if (game.enemy) {
				contextRef.current.fillStyle = "#dd0025";
				contextRef.current.fillRect(game?.enemy.position.x, game?.enemy.position.y, 1, game?.enemy.size);
			}


			if (game.walls) {
				game.walls.forEach((wall: any) => {
					contextRef.current.fillStyle = "#777777";
					contextRef.current.fillRect(wall.position.x, wall.position.y, 1, wall.size);
				})
			}

			if (game.ball) {
				contextRef.current.beginPath();
				contextRef.current.ellipse(game.ball.position.x + 0.5, game.ball.position.y + 0.5, 0.5, 0.75, 0, 0, Math.PI * 2);
				contextRef.current.fillStyle = "#00dd30";
				contextRef.current.fill();
				contextRef.current.closePath();
			}

			if (game.bonus) {
				contextRef.current.beginPath();
				contextRef.current.ellipse(game.bonus.position.x + 0.5, game.bonus.position.y + 0.5, 1, 1.53, 0, 0, Math.PI * 2);
				if (game.bonus.type === 'speed')
					contextRef.current.fillStyle = "#ff3e00";
				else if (game.bonus.type === 'freeze')
					contextRef.current.fillStyle = "#0040ff";
				else if (game.bonus.type === 'wall')
					contextRef.current.fillStyle = "rgba(192,174,174,0.69)";
				else if (game.bonus.type === 'shake')
					contextRef.current.fillStyle = "rgba(226,255,16,0.69)";
				contextRef.current.fill();
				contextRef.current.closePath();
			}
		}

		contextRef.current.restore();
	});

	useMemo(() => {
		setScore(
			game.roundResult.reduce(
				(sum: any, current: number) => {
					if (current === 1)
						sum[0] += 1;
					else
						sum[1] += 1;
					return sum;
				}, [0, 0])
		);
	}, [game.roundResult])

	useEventListener('keydown', (event: any) => {
		if (game.upButton === event.keyCode)
			socket.emit('keyDown', 38);
		else if (game.downButton === event.keyCode)
			socket.emit('keyDown', 40);
	})

	return (
		<>
			<button onClick={() => socket.emit('giveUp')}>Give Up</button>
			<canvas className="blackField" ref={canvasRef} />
		</>
	)
}

export default Game;
