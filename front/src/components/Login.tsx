import React from 'react';
import { useAuth } from "../auth/auth.context";

import '../styles/Login.css';
import OauthPopup from 'react-oauth-popup';
import logo from '../static/42_logo.svg';
import {useNavigate} from "react-router-dom";

function Login()
{
	let auth = useAuth();
	let navigate = useNavigate();

	function onCode(code: string, params: any) {
		auth.signin(
			code,
			() => {
				navigate("/", {replace: true});
			},
			() => {
				navigate("/401", {replace: true});
			}
		);
	}

	function onClose() {
	}

	return (
		<div className='login_input'>
			<div onClick={() => auth.goBackdoor('A_user', ()=>{navigate("/", {replace: true})}, ()=>{})}>A_user</div>
			<div onClick={() => auth.goBackdoor('B_user', ()=>{navigate("/", {replace: true})}, ()=>{})}>B_user</div>
			<div onClick={() => auth.goBackdoor('C_user', ()=>{navigate("/", {replace: true})}, ()=>{})}>C_user</div>
			<OauthPopup
				url="https://api.intra.42.fr/oauth/authorize?client_id=28b3bd90a12b1869322ee8df91393d90bb716604da919d12f9296cb545b832de&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Flogin&response_type=code"
				onCode={onCode}
				onClose={onClose}
				title='Intra Login Screen'
				width={750}
				height={750}
			>
				<img alt={'42 school logo'} src={logo} className='logo-42' />
			</OauthPopup>
		</div>
	)
}

export default Login;