import React, {useState, useRef} from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import {useGame} from "../contexts/game.context";
import {useAuth} from "../auth/auth.context";
import {useEffectOnce} from "usehooks-ts";
import {useNavigate} from "react-router-dom";
import {Alert} from "react-bootstrap";

import '../styles/Settings.css';


export default function Settings()
{
    const game = useGame();
    const auth = useAuth();

    const [requestType, setRequestType] = useState<string>('skip');
    const [twoFactor, setTwoFactor] = useState<boolean>(false);
    const [imageQR, setImageQR] = useState<any>();
    const qr_code = useRef<any>("");

    var keyboardMap = [
        "", // [0]
        "", // [1]
        "", // [2]
        "CANCEL", // [3]
        "", // [4]
        "", // [5]
        "HELP", // [6]
        "", // [7]
        "BACK_SPACE", // [8]
        "TAB", // [9]
        "", // [10]
        "", // [11]
        "CLEAR", // [12]
        "ENTER", // [13]
        "ENTER_SPECIAL", // [14]
        "", // [15]
        "SHIFT", // [16]
        "CONTROL", // [17]
        "ALT", // [18]
        "PAUSE", // [19]
        "CAPS_LOCK", // [20]
        "KANA", // [21]
        "EISU", // [22]
        "JUNJA", // [23]
        "FINAL", // [24]
        "HANJA", // [25]
        "", // [26]
        "ESCAPE", // [27]
        "CONVERT", // [28]
        "NONCONVERT", // [29]
        "ACCEPT", // [30]
        "MODECHANGE", // [31]
        "SPACE", // [32]
        "PAGE_UP", // [33]
        "PAGE_DOWN", // [34]
        "END", // [35]
        "HOME", // [36]
        "LEFT", // [37]
        "UP", // [38]
        "RIGHT", // [39]
        "DOWN", // [40]
        "SELECT", // [41]
        "PRINT", // [42]
        "EXECUTE", // [43]
        "PRINTSCREEN", // [44]
        "INSERT", // [45]
        "DELETE", // [46]
        "", // [47]
        "0", // [48]
        "1", // [49]
        "2", // [50]
        "3", // [51]
        "4", // [52]
        "5", // [53]
        "6", // [54]
        "7", // [55]
        "8", // [56]
        "9", // [57]
        "COLON", // [58]
        "SEMICOLON", // [59]
        "LESS_THAN", // [60]
        "EQUALS", // [61]
        "GREATER_THAN", // [62]
        "QUESTION_MARK", // [63]
        "AT", // [64]
        "A", // [65]
        "B", // [66]
        "C", // [67]
        "D", // [68]
        "E", // [69]
        "F", // [70]
        "G", // [71]
        "H", // [72]
        "I", // [73]
        "J", // [74]
        "K", // [75]
        "L", // [76]
        "M", // [77]
        "N", // [78]
        "O", // [79]
        "P", // [80]
        "Q", // [81]
        "R", // [82]
        "S", // [83]
        "T", // [84]
        "U", // [85]
        "V", // [86]
        "W", // [87]
        "X", // [88]
        "Y", // [89]
        "Z", // [90]
        "OS_KEY", // [91] Windows Key (Windows) or Command Key (Mac)
        "", // [92]
        "CONTEXT_MENU", // [93]
        "", // [94]
        "SLEEP", // [95]
        "NUMPAD0", // [96]
        "NUMPAD1", // [97]
        "NUMPAD2", // [98]
        "NUMPAD3", // [99]
        "NUMPAD4", // [100]
        "NUMPAD5", // [101]
        "NUMPAD6", // [102]
        "NUMPAD7", // [103]
        "NUMPAD8", // [104]
        "NUMPAD9", // [105]
        "MULTIPLY", // [106]
        "ADD", // [107]
        "SEPARATOR", // [108]
        "SUBTRACT", // [109]
        "DECIMAL", // [110]
        "DIVIDE", // [111]
        "F1", // [112]
        "F2", // [113]
        "F3", // [114]
        "F4", // [115]
        "F5", // [116]
        "F6", // [117]
        "F7", // [118]
        "F8", // [119]
        "F9", // [120]
        "F10", // [121]
        "F11", // [122]
        "F12", // [123]
        "F13", // [124]
        "F14", // [125]
        "F15", // [126]
        "F16", // [127]
        "F17", // [128]
        "F18", // [129]
        "F19", // [130]
        "F20", // [131]
        "F21", // [132]
        "F22", // [133]
        "F23", // [134]
        "F24", // [135]
        "", // [136]
        "", // [137]
        "", // [138]
        "", // [139]
        "", // [140]
        "", // [141]
        "", // [142]
        "", // [143]
        "NUM_LOCK", // [144]
        "SCROLL_LOCK", // [145]
        "WIN_OEM_FJ_JISHO", // [146]
        "WIN_OEM_FJ_MASSHOU", // [147]
        "WIN_OEM_FJ_TOUROKU", // [148]
        "WIN_OEM_FJ_LOYA", // [149]
        "WIN_OEM_FJ_ROYA", // [150]
        "", // [151]
        "", // [152]
        "", // [153]
        "", // [154]
        "", // [155]
        "", // [156]
        "", // [157]
        "", // [158]
        "", // [159]
        "CIRCUMFLEX", // [160]
        "EXCLAMATION", // [161]
        "DOUBLE_QUOTE", // [162]
        "HASH", // [163]
        "DOLLAR", // [164]
        "PERCENT", // [165]
        "AMPERSAND", // [166]
        "UNDERSCORE", // [167]
        "OPEN_PAREN", // [168]
        "CLOSE_PAREN", // [169]
        "ASTERISK", // [170]
        "PLUS", // [171]
        "PIPE", // [172]
        "HYPHEN_MINUS", // [173]
        "OPEN_CURLY_BRACKET", // [174]
        "CLOSE_CURLY_BRACKET", // [175]
        "TILDE", // [176]
        "", // [177]
        "", // [178]
        "", // [179]
        "", // [180]
        "VOLUME_MUTE", // [181]
        "VOLUME_DOWN", // [182]
        "VOLUME_UP", // [183]
        "", // [184]
        "", // [185]
        "SEMICOLON", // [186]
        "EQUALS", // [187]
        "COMMA", // [188]
        "MINUS", // [189]
        "PERIOD", // [190]
        "SLASH", // [191]
        "BACK_QUOTE", // [192]
        "", // [193]
        "", // [194]
        "", // [195]
        "", // [196]
        "", // [197]
        "", // [198]
        "", // [199]
        "", // [200]
        "", // [201]
        "", // [202]
        "", // [203]
        "", // [204]
        "", // [205]
        "", // [206]
        "", // [207]
        "", // [208]
        "", // [209]
        "", // [210]
        "", // [211]
        "", // [212]
        "", // [213]
        "", // [214]
        "", // [215]
        "", // [216]
        "", // [217]
        "", // [218]
        "OPEN_BRACKET", // [219]
        "BACK_SLASH", // [220]
        "CLOSE_BRACKET", // [221]
        "QUOTE", // [222]
        "", // [223]
        "META", // [224]
        "ALTGR", // [225]
        "", // [226]
        "WIN_ICO_HELP", // [227]
        "WIN_ICO_00", // [228]
        "", // [229]
        "WIN_ICO_CLEAR", // [230]
        "", // [231]
        "", // [232]
        "WIN_OEM_RESET", // [233]
        "WIN_OEM_JUMP", // [234]
        "WIN_OEM_PA1", // [235]
        "WIN_OEM_PA2", // [236]
        "WIN_OEM_PA3", // [237]
        "WIN_OEM_WSCTRL", // [238]
        "WIN_OEM_CUSEL", // [239]
        "WIN_OEM_ATTN", // [240]
        "WIN_OEM_FINISH", // [241]
        "WIN_OEM_COPY", // [242]
        "WIN_OEM_AUTO", // [243]
        "WIN_OEM_ENLW", // [244]
        "WIN_OEM_BACKTAB", // [245]
        "ATTN", // [246]
        "CRSEL", // [247]
        "EXSEL", // [248]
        "EREOF", // [249]
        "PLAY", // [250]
        "ZOOM", // [251]
        "", // [252]
        "PA1", // [253]
        "WIN_OEM_CLEAR", // [254]
        "" // [255]
    ];

    const [cookies, setCookie, removeCookie] = useCookies(["up", 'down', 'direction']);

    const [twoFactorStop, setTwoFactorStop] = useState<boolean>(false);

    //Loading_loc(Omni.Account, requestType, setRequestType, Omni, setImageQR);

    function setNewName(value : any)
    {
        auth.changeUsername(value.value);
        setRequestType('set_name');
        value.value = '';
    }

    // function startTwoFactor()
    // {
    //     setRequestType('two-factor');
    //     setTwoFactor(true);
    // }

    // function stopTwoFactor(qr_code : any)
    // {
    //     Omni.Account.setQRstop(qr_code.value);
    //     qr_code.value = '';
    //     setRequestType('stop_dfi');
    // }

    function TwoFactorNope()
    {
        const navigate = useNavigate();

        const [QR, setQR] = useState();
        const [code, setCode] = useState<string>();
        const [error, setError] = useState<any>('');

        useEffectOnce(() => {
            axios({
                url: 'http://127.0.0.1:3001/api/2fa/generate',
                method: 'post',
                headers: {
                    'Authorization': "Bearer " + auth.user.token,
                },
                responseType: "blob",
            }).then((response) => {
                setQR(response.data);
            }).catch()
        });


        const handleChange = (event: any) => {
            setCode(event.target.value)
        }

        const handleActivate = (event: any) => {
            event.preventDefault();
            if (code?.trim() === '')
                setError("Wrong input, try again");
            auth.secondFactorActivate(
                code,
                () => {
                    navigate('/logout', {replace: true});
                },
                () => {
                    setError("Activation failed, try again");
                }
            );
        }

        const handleDeactivate = (event: any) => {
            event.preventDefault();
            if (code?.trim() === '')
                setError("Wrong input, try again");
            auth.secondFactorDeactivate(
                code,
                () => {
                    navigate('/logout', {replace: true});
                },
                () => {
                    setError("Deactivation failed, try again");
                },
            );
        }

        if (!auth.user.isTwoFactorAuthenticationEnable)
            return (
                <>
                    <p>Activate second factor authentication:</p>
                    <p>Please scan this anti-CoV QR-code</p>
                    {QR && <img alt={'QR code'} src={URL.createObjectURL(QR)} />}
                    <form onSubmit={handleActivate}>
                        <Alert variant="danger">{error}</Alert>
                        <label>
                            Enter code
                            <input
                                type="text"
                                value={code}
                                onChange={handleChange}
                            />
                        </label>
                        <input type="submit" value="Activate"/>
                    </form>
                </>
            );
        else
            return (
                <>
                    <p>Deactivate second factor authentication: </p>
                    <form onSubmit={handleDeactivate}>
                        <Alert variant="danger">{error}</Alert>
                        <label>
                            Enter code
                            <input
                                type="text"
                                value={code}
                                onChange={handleChange}
                            />
                        </label>
                        <input type="submit" value="Deactivate"/>
                    </form>
                </>
            );
    }

// //	console.log(Omni.Account.profile)
//
//     function SendCode(qr_code : any)
//     {
//         Omni.Account.setQRcode(qr_code.value);
//         qr_code.value = '';
//         setRequestType('qr_code');
//     }
//
//     function TwoFactorStop()
//     {
//         if (twoFactorStop)
//             return (
//                 <div>
//                     <input type='text' ref={qr_code} placeholder="google's code" onKeyPress={e => (e.code === "Enter" || e.code === "NumpadEnter") ?
//                         stopTwoFactor(qr_code.current) : 0}></input>
//                 </div>
//
//             )
//         else if (Omni.Account.twoFactor_on)
//             return(
//                 <div>
//                     <button onClick={() => setTwoFactorStop(true)}> Turn off two factor Auth </button>
//                 </div>
//             )
//         return (<div></div>)
//     }

    function TwoFactorYes()
    {
        if (twoFactor)
            return (
                <div>
                    <div>
                        Please scan this anti-CoV QR-code
                    </div>
                    {imageQR && <img alt={'QR code'} src={URL.createObjectURL(imageQR)} />}
                    <div>
                        {/*<input type='text' ref={qr_code} placeholder="google's code" onKeyPress={e => (e.code === "Enter" || e.code === "NumpadEnter") ?*/}
                        {/*    SendCode(qr_code.current) : 0}></input>*/}
                    </div>
                </div>

            )
        return (<div></div>)
    }

    function changeUpKey(e : any)
    {
        game.setUpButton(e.keyCode);
        setCookie('up', e.keyCode)
        e.target.value = ''
    }

    function changeDownKey(e : any)
    {
        game.setDownButton(e.keyCode);
        setCookie('down', e.keyCode)
        e.target.value = ''
    }

    function resetControls()
    {
        setCookie('up', 38);
        game.setUpButton(38);
        setCookie('down', 40);
        game.setDownButton(40);
        setCookie('direction', 'right');
    }

    function changeDirection()
    {
        if (game.direction === 'left')
        {
            game.setDirection('right');
            setCookie('direction', 'right');
        }
        else
        {
            game.setDirection('left')
            setCookie('direction', 'left');
        }
    }

    return(
        <div>
            <div>
                <h3>
                    Profile Preferences
                </h3>
            </div>
            <input placeholder='Set new nickname'
                   onKeyPress={e =>
                       (e.code === "Enter" || e.code === "NumpadEnter") ?
                           setNewName(e.target) : 0}type='text'></input>
            <div>image input</div>
            <div><h3>Game settings</h3></div>
            <div>field orientation</div>
            <div>Now: at {game.direction}<button onClick={changeDirection}>switch</button></div>
            <div><h3>Control</h3></div>
            <div>top button<input type='text' size={1} onKeyUp={(e : any) =>
                changeUpKey(e)} placeholder={keyboardMap[game.upButton]}/></div>
            <div>bottom button<input type='text' size={1} onKeyUp={(e : any) =>
                changeDownKey(e)} placeholder={keyboardMap[game.downButton]}/></div>
            <button onClick={resetControls}> Reset Controls </button>

            <div>
                <TwoFactorNope />
            </div>
            <TwoFactorYes />
            {/*<TwoFactorStop />*/}
        </div>
    )
}
