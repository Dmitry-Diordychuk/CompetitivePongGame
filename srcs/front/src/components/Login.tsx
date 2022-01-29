import React, {useCallback, useEffect, useState} from 'react';
import { useAuth } from "../auth/auth.context";
import OauthPopup from 'react-oauth-popup';
import LogoIcon from '../static/42_logo.svg';
import {useNavigate, useLocation} from "react-router-dom";
import {LOGIN_REDIRECT, PORT_REDIRECT} from "../config";
import {Alert, Box, Button, Icon, Stack, Typography} from "@mui/material";
import BackgroundImage from '../pong.jpg';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';


function Login()
{
	const auth = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const [show, setShow] = useState<boolean | undefined>(false);
	const [message, setMessage] = useState<string>();

	useEffect(() => {
		if (!auth.user) {
			auth.resignin();
		}
	}, [auth]);

	useEffect(() => {
		// @ts-ignore
		let from = location.state?.from?.pathname;
		if (auth.user && from && from !== '/logout') {
			navigate(from, {replace: true});
		}
	}, [auth.user, navigate, location]);

	const handleSuccessLogin = useCallback((isAccountJustCreated: boolean | null) => {
		if (isAccountJustCreated) {
			navigate('/login/settings')
		} else {
			navigate('/', {replace: true});
		}
	}, [navigate]);

	const handleLoginFailed = useCallback((error) => {
		if (!error) {
			setShow(true);
			setMessage('Back is down!');
		} else {
			navigate('/401');
		}
	}, [navigate]);

	function onCode(code: string) {
		auth.signin(code, handleSuccessLogin, handleLoginFailed);
	}

	return (
		<Box sx={{
			background: `url(${BackgroundImage})`,
			backgroundSize: 'cover',
			backgroundPosition: 'top',
			minHeight: '100%',
			height: '100vh',
			position: 'relative'
		}}>
			<Alert severity={'warning'} hidden={!show} >{message}</Alert>
			<Box sx={{
				textAlign: 'center',
			}}>
				<OauthPopup
					url={"https://api.intra.42.fr/oauth/authorize" +
						"?client_id=28b3bd90a12b1869322ee8df91393d90bb716604da919d12f9296cb545b832de" +
						"&redirect_uri=http%3A%2F%2F" + LOGIN_REDIRECT + "%3A" + PORT_REDIRECT + "%2Flogin" +
						"&response_type=code"}
					onCode={onCode}
					onClose={()=>{}}
					title='Intra Login Screen'
					width={750}
					height={750}
				>
					<Button sx={{
						color: "#FFFFFF",
						width: 403,
						height: 83,
						p: 5,
						border: '2px solid #E2E2E2',
						boxSizing: 'border-box',
						borderRadius: '8px',
						background: 'rgba(0, 0, 0, 0.35)',
						position: 'absolute',
						top: '40%',
						left: '37%',
					}} variant="outlined" size="large">
						<Stack direction="row" spacing={2}>
							<Typography variant="h6" component="p" gutterBottom>LOG IN VIA</Typography >
							<Icon sx={{
								textAlign: 'center',
								lineHeight: '-5px',
							}} fontSize='large'>
								<img alt={"42Icon"} style={{
									display: 'flex',
									height: 'inherit',
									width: 'inherit'
								}} src={LogoIcon}/>
							</Icon>
						</Stack>
					</Button>
				</OauthPopup>
			</Box>
			<button onClick={() => auth.goBackdoor('A_user', ()=>{navigate("/", {replace: true})}, ()=>{})}>A_user</button>
			<button onClick={() => auth.goBackdoor('B_user', ()=>{navigate("/", {replace: true})}, ()=>{})}>B_user</button>
			<button onClick={() => auth.goBackdoor('C_user', ()=>{navigate("/", {replace: true})}, ()=>{})}>C_user</button>
		</Box>
	)
}

export default Login;