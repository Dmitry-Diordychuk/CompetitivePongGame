import React, {useEffect, useRef, useState} from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import {useGame} from "../contexts/game.context";
import {useAuth} from "../auth/auth.context";
import {useEffectOnce} from "usehooks-ts";
import {useNavigate} from "react-router-dom";
import {Alert, Button, Card, Col, Container, Form, Row, Stack} from "react-bootstrap";

import '../styles/Settings.css';
import {API_URL, HTTP_PORT} from "../config";


export default function Settings()
{
    return(
        <>
            <Container>
                <Row>
                    <Col>
                        <h3>Profile Preferences</h3>
                        <Nickname/>
                        <Avatar />
                        <SecondFactorAuth />
                        <br/>

                        <h3>Game settings</h3>
                        <ChangeFieldOrientation />
                        <SetKey kKey={'Up'} />
                        <SetKey kKey={'Down'} />
                    </Col>
                </Row>
            </Container>
        </>
    )
}

export function Nickname() {
    const auth = useAuth();

    const [nickname, setNickname] = useState('');
    const [alertVariant, setAlertVariant] = useState('');
    const [message, setMessage] = useState('');

    function handleSubmit(event: React.FormEvent<any>) {
        event.preventDefault();
        auth.changeUsername(nickname,
            () => {
                setMessage('Username changed');
                setAlertVariant('success');
            },
            (errorMessage: any) => {
                setMessage(errorMessage.toString());
                setAlertVariant('danger');
            });
    }

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formNickname">
                <Form.Label>Set new nickname</Form.Label>
                <Alert show={message !== ''} variant={alertVariant}>{message}</Alert>
                <Stack direction="horizontal" gap={3}>
                    <Form.Control
                        className="me-auto"
                        placeholder="Nickname"
                        onChange={e => setNickname(e.target.value)} />
                    <Button type='submit' variant="primary">Submit</Button>
                </Stack>
            </Form.Group>
        </Form>
    )
}

export function Avatar() {
    const auth = useAuth();
    const navigate = useNavigate();

    const [selectedFile, setSelectedFile] = useState('');
    const [, setIsFilePicked] = useState(false);
    const [alertVariant, setAlertVariant] = useState('');
    const [message, setMessage] = useState('');

    function handleSubmit(event: React.FormEvent) {
        const formData = new FormData();
        formData.append('file', selectedFile);

        axios.put(
            `${API_URL}:${HTTP_PORT}/api/user/avatar`,
            formData,
            {
                headers: {
                    "Content-type": "multipart/form-data",
                    "Authorization" : "Bearer " + auth.user.token
                },
            }
        )
        .then(res => {
            setMessage('Avatar changed');
            setAlertVariant('success');
            navigate('/profile');
        })
        .catch(e => {
            setMessage(e.response.data.message.toString());
            setAlertVariant('danger');
        })
    }

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Set new avatar</Form.Label>
                <Alert show={message !== ''} variant={alertVariant}>{message}</Alert>
                <Stack direction="horizontal" gap={3}>
                    <Form.Control
                        type='file'
                        className="me-auto"
                        placeholder="Avatar"
                        onChange={(e: any) => {
                            setSelectedFile(e.target?.files[0]);
                            setIsFilePicked(true);
                        }}
                    />
                    <Button onClick={handleSubmit} variant="primary">Submit</Button>
                </Stack>
            </Form.Group>
        </Form>
    )
}

function SecondFactorAuth()
{
    const auth = useAuth();

    const [QR, setQR] = useState();
    const [code, setCode] = useState<string>();

    const [alertVariant, setAlertVariant] = useState('');
    const [message, setMessage] = useState('');

    useEffectOnce(() => {
        let isMounted = true;

        axios({
            url: `${API_URL}:${HTTP_PORT}/api/2fa/generate`,
            method: 'post',
            headers: {
                'Authorization': "Bearer " + auth.user.token,
            },
            responseType: "blob",
        }).then((response) => {
            if (isMounted) setQR(response.data);
        }).catch((e) => {

        });

        return (() => { isMounted = false; })
    });

    const handleSubmitActivate = (event: any) => {
        event.preventDefault();
        auth.secondFactorActivate(
            code,
            () => {
                setAlertVariant('success');
            },
            (message: string) => {
                setMessage(message);
                setAlertVariant('danger');
            }
        );
    }

    const handleSubmitDeactivate = (event: any) => {
        event.preventDefault();
        auth.secondFactorDeactivate(
            code,
            () => {
                setAlertVariant('success');
            },
            (message: string) => {
                setMessage(message);
                setAlertVariant('danger');
            },
        );
    }

    if (!auth.user.isTwoFactorAuthenticationEnable)
        return (
            <Card style={{ width: '18rem' }}>
                <Card.Img variant="top" src={QR ? URL.createObjectURL(QR) : ""} />
                <Card.Body>
                    <Card.Title>Activate second factor authentication</Card.Title>
                    <Card.Text>Please scan this anti-CoV QR-code</Card.Text>
                    <Alert show={message !== ''} variant={alertVariant}>{message}</Alert>
                    <Form onSubmit={handleSubmitActivate}>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Stack direction="horizontal" gap={3}>
                                <Form.Control
                                    className="me-auto"
                                    placeholder="000000"
                                    onChange={(event: any) => {
                                        setCode(event.target.value)
                                    }}
                                />
                                <Button onClick={handleSubmitActivate} variant="success">Activate</Button>
                            </Stack>
                        </Form.Group>
                    </Form>
                </Card.Body>
            </Card>
        );
    return (
        <Card style={{ width: '18rem' }}>
            <Card.Body>
                <Card.Title>Deactivate second factor authentication</Card.Title>
                <Card.Text>Enter code</Card.Text>
                <Alert show={message !== ''} variant={alertVariant}>{message}</Alert>
                <Form onSubmit={handleSubmitDeactivate}>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Stack direction="horizontal" gap={3}>
                            <Form.Control
                                className="me-auto"
                                placeholder="000000"
                                onChange={(event: any) => {
                                    setCode(event.target.value)
                                }}
                            />
                            <Button onClick={handleSubmitDeactivate} variant="danger">Deactivate</Button>
                        </Stack>
                    </Form.Group>
                </Form>
            </Card.Body>
        </Card>
    );
}

function ChangeFieldOrientation() {
    const game = useGame();
    const [, setCookie,] = useCookies(["up", 'down', 'direction']);

    function handleSubmit() {
        if (game.direction === 'left') {
            game.setDirection('right');
            setCookie('direction', 'right', {sameSite : 'lax'});
        } else {
            game.setDirection('left')
            setCookie('direction', 'left', {sameSite : 'lax'});
        }
    }

    return (
        <Form>
            <Form.Group className="mb-3" controlId="formBasicEmail">
                <Stack direction="horizontal" gap={3}>
                    <Form.Label>Change field orientation</Form.Label>
                    <Button onClick={handleSubmit} variant="primary">{game.direction}</Button>
                </Stack>
            </Form.Group>
        </Form>
    );
}

function SetKey(props: any) {
    const game = useGame();
    const [, setCookie,] = useCookies(["up", 'down', 'direction']);
    const htmlTagWithPlaceholder = useRef<any>();

    const key = props.kKey;

    let handleChange;

    useEffect(() => {}, [game.upButton, game.downButton]);

    handleChange = (event: any) => {
        event.preventDefault();
        const keyCode = keyboardMap.findIndex(i => i === event.key.toUpperCase());
        if (key === 'Up') {
            game.setUpButton(keyCode);
            setCookie('up', keyCode, {sameSite: 'lax'})
        } else {
            game.setDownButton(keyCode);
            setCookie('down', keyCode, {sameSite : 'lax'})
        }
        event.target.placeholder = event.key;
        event.target.value = '';
    }

    return (
        <Form>
            <Form.Group className="mb-3" controlId="formBasicEmail">
                <Stack direction="horizontal" gap={3}>
                    <Form.Label>Set {key === 'Up' ? 'up' : 'down'} button</Form.Label>
                    <Form.Control
                        ref={htmlTagWithPlaceholder}
                        className="me-auto"
                        placeholder={key === 'Up' ? 'Up' : 'Down'}
                        onKeyPress={handleChange}
                    />
                    <Button onClick={() => {
                        if (key === 'Up') {
                            setCookie('up', 38, {sameSite: 'lax'});
                            game.setUpButton(38);
                            htmlTagWithPlaceholder.current.placeholder = 'Up';
                        } else {
                            setCookie('down', 40, {sameSite: 'lax'});
                            game.setDownButton(40);
                            htmlTagWithPlaceholder.current.placeholder = 'Down';
                        }
                    }} variant="danger">Reset</Button>
                </Stack>
            </Form.Group>
        </Form>
    );
}

const keyboardMap = [
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