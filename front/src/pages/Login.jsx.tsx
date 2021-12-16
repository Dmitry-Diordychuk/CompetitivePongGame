import omni_class from "../classes/omni";
import React, {useEffect, useRef, useState} from "react";
import First_init from "../components/first_init";
import LoginScreen from "../components/login_screen";
import OnTopPanel from "../components/on_top_panel";
import Bottom from "../components/bottom";
import {useLocation, useNavigate} from "react-router-dom";
import account_info from "../classes/account_info";
import channels_list from "../classes/channels_list";
import friends_list from "../classes/firends_class";
import game from "../classes/game";
import axios from "axios";
import {io} from "socket.io-client";
import {useCookies} from "react-cookie";
import OauthPopup from "react-oauth-popup";
import logo from "../components/42_logo.svg";
import {useAuth} from "../context/auth";
import useRequest from "../hooks/useRequest";


let omni = new omni_class();


interface LoginScreenInt
{
    setLogged: Function;
    Account : account_info;
    ChannelsList : channels_list;
    FriendsList : friends_list;
    Game : game;
}


function Login()//{setLogged, Account, ChannelsList, FriendsList, Game}: LoginScreenInt)
{
    let navigate = useNavigate();
    let auth = useAuth();
    let [userData, loading, error] = useRequest(fetchLogin);
    let [code, setCode] = useState('');

    const onCode = (code : any) => {
        setCode(code);
    }
    const onClose = () => {

    };

    function fetchLogin() {
        return axios("http://localhost:3001/api/user/login?code=" + code)
    }

    if (userData) {
        console.log(userData);
        auth.signIn(userData.username, () => {
            navigate("/channels", {replace: true});
        });
    }

    if (loading) {
        return <h1>Wait... </h1>
    }

    if (error) {
        return <h1>{error.toString()}</h1>
    }

   // const [login_status, setLoginStatus] = useState<any>("skip");
   // const [twoFactorScreen, setTwoFactorScreen] = useState<boolean>(false);
   // const qrCode = useRef<any>('')

    //function Loading_mw(object : any, option : string, state : Function): any
    //{
    //    useEffect(() =>
    //    {
    //        if (option === 'not_logged' || option === 'skip')
    //            return;

    //        axios(object.axiosRequest(option))
    //            .then((answer : any) => {
    //                object.axiosLoading(answer, option);
    //                ChannelsList.token = Account.getToken()
    //                FriendsList.token = Account.getToken()
    //                if (option !== 'qr_code')
    //                    ChannelsList.setSocket(io("http://localhost:3002", {
    //                        extraHeaders:
    //                            {
    //                                Authorization : Account.getToken()}}
    //                    ));
    //                setTwoFactorScreen(answer.data.user['isTwoFactorAuthenticationEnable']);
    //                if (answer.data.user['isTwoFactorAuthenticationEnable'])
    //                    Account.twoFactor_on = true;
    //                if (!answer.data.user['isTwoFactorAuthenticationEnable'] || option === 'qr_code')
    //                    setLogged(true);

    //            })
    //            .catch((e) => console.log('Login screen: ' + e))

    //        state('skip');
    //    })
    //}
    //const cookies = useCookies(["up", 'dwn', 'direction']);
    //if (cookies[0]['up'])
    //{
    //    Game.upBttn = +(cookies[0]['up'])
    //}
    //if (cookies[0]['dwn'])
    //    Game.dnBttn = +(cookies[0]['dwn'])

    //Loading_mw(Account, login_status, setLoginStatus);

    //function enter(e : string)
    //{
    //    if (e === 'AAAA')
    //        Account.setToken("Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEwMSIsImZ0SWQiOiIxIiwidXNlcm5hbWUiOiJBX3VzZXIifQ.3GrurQz8RZ3CghTnXcJIHulU6KMQXHXj7XL6adY_NJg")
    //    else
    //        Account.setToken("Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEwMiIsImZ0SWQiOiIyIiwidXNlcm5hbWUiOiJCX3VzZXIifQ.diAuyuEuB90hgzH4A4gbcwk4GyQ45w7R3QF0UKMiXio")
    //    ChannelsList.token = Account.getToken()
    //    FriendsList.token = Account.getToken()
    //    ChannelsList.setSocket(io("http://localhost:3002", {
    //        extraHeaders:
    //            {
    //                Authorization : Account.getToken()}}
    //    ));
    //    setLogged(true);
    //}



    //function SendCode(qr_code : any)
    //{
    //    Account.setQRAuth('auth')
    //    Account.setQRcode(qr_code.value);
    //    qr_code.value = '';
    //    setLoginStatus('qr_code');

    //}

    //if (twoFactorScreen)
    //    return (
    //        <div>
    //            <input type='text' ref={qrCode} placeholder="google's code" onKeyPress={e => (e.code === "Enter" || e.code === "NumpadEnter") ?
    //                SendCode(qrCode.current) : 0}></input>
    //        </div>
    //    )

    //return (
    //    <div className='login_input'>
    //        <div onClick={() => enter('AAAA')}>A_user</div>
    //        <div onClick={() => enter('BBB')}>B_user</div>
    //        <OauthPopup
    //            url="https://api.intra.42.fr/oauth/authorize?client_id=28b3bd90a12b1869322ee8df91393d90bb716604da919d12f9296cb545b832de&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2F&response_type=code"
    //            onCode={onCode}
    //            onClose={onClose}
    //            title='Intra Login Screen'
    //            width={750}
    //            height={750}
    //        >
    //            <img alt={'42 school logo'} src={logo} className='logo-42' />
    //        </OauthPopup>
    //    </div>
    //)

    function handleSubmit(event: any, username: string) {
        event.preventDefault();

        auth.signIn(username, () => {
            navigate("/channels", {replace: true});
        });
    }

    return (
        <div className='login_input'>
            <button onClick={e => handleSubmit(e, 'A')}>Login as user A</button>;
            <button onClick={e => handleSubmit(e, 'B')}>Login as user B</button>;
            <OauthPopup
                url={
                    'https://api.intra.42.fr/oauth/authorize?' +
                        'client_id=28b3bd90a12b1869322ee8df91393d90bb716604da919d12f9296cb545b832de' +
                        '&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2F' +
                        '&response_type=code'
                }
                title={"Intra login screen"}
                width={750}
                height={750}
                onClose={onClose}
                onCode={onCode}
            >
                <img alt={'42 school logo'} src={logo} className='logo-42' />
            </OauthPopup>
        </div>
    )
}

export default Login;

