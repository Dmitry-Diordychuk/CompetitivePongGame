import React, {useCallback, useEffect, useState} from 'react';
import { useAuth } from "../auth/auth.context";
import '../styles/Login.css';
import OauthPopup from 'react-oauth-popup';
import logo from '../static/42_logo.svg';
import {useNavigate, useLocation} from "react-router-dom";
import {Alert} from "react-bootstrap";
import {HTTP_PORT, LOGIN_REDIRECT} from "../config";


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
			navigate('/settings', {replace: true});
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

	function onCode(code: string, params: any) {
		auth.signin(code, handleSuccessLogin, handleLoginFailed);
	}

	return (
		<>
			<Alert variant={'danger'} show={show} >{message}</Alert>
			<div className='login_input'>
				<OauthPopup
					url={"https://api.intra.42.fr/oauth/authorize" +
						"?client_id=28b3bd90a12b1869322ee8df91393d90bb716604da919d12f9296cb545b832de" +
						"&redirect_uri=http%3A%2F%2F" + LOGIN_REDIRECT + "%3A" + HTTP_PORT + "%2Flogin" +
						"&response_type=code"}
					onCode={onCode}
					onClose={()=>{}}
					title='Intra Login Screen'
					width={750}
					height={750}
				>
					<img alt={'42 school logo'} src={logo} className='logo-42' />
				</OauthPopup>
			</div>
			<button onClick={() => auth.goBackdoor('A_user', ()=>{navigate("/", {replace: true})}, ()=>{})}>A_user</button>
			<button onClick={() => auth.goBackdoor('B_user', ()=>{navigate("/", {replace: true})}, ()=>{})}>B_user</button>
			<button onClick={() => auth.goBackdoor('C_user', ()=>{navigate("/", {replace: true})}, ()=>{})}>C_user</button>
		</>
	)
}

export default Login;