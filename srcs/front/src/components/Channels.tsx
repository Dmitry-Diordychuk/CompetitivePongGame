import React, {useCallback, useState} from "react";
import {useChat} from "../contexts/chat.context";
import {useNavigate} from "react-router-dom";
import {useSocketIO} from "../contexts/socket.io.context";
import {useEffectOnce, useInterval} from "usehooks-ts";
import axios from "axios";
import {useAuth} from "../auth/auth.context";
import {API_URL, HTTP_PORT} from "../config";
import DeleteIcon from '@mui/icons-material/Delete';
import Divider from '@mui/material/Divider';
import SearchIcon from '@mui/icons-material/Search';



import {
    Stack,
    Container,
    Box,
    IconButton,
    Avatar,
    styled,
    Paper,
    Autocomplete,
    Button,
    Dialog,
    DialogActions,
    DialogTitle,
    TextField,
    Alert,
    CircularProgress,
    Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';


const Item = styled(Paper)(({ theme }) => ({
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

export default function Channels() {
    return (
        <Container>
            <Roster/>
        </Container>
    )
}

interface AutocompleteOption {
    id: number;
    label: string;
    isHasPassword: string;
}

function Roster(props: any) {
    const [open, setOpen] = useState(false);
    const [openJoin, setOpenJoin] = useState(false);
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState();
    const [options, setOptions] = useState<AutocompleteOption[]>([]);
    const [key, setKey] = useState<any>();

    const navigate = useNavigate();
    const chat = useChat();
    const auth = useAuth();
    const socket = useSocketIO();


    const fetchChannels = useCallback(() => {
        if (auth.user) {
            axios.get(`${API_URL}:${HTTP_PORT}/api/channel/all/current/`, {
                method: 'get',
                url: `${API_URL}:${HTTP_PORT}/api/channel/all/current/`,
                responseType: "json",
                headers: {
                    "authorization": 'Bearer ' + auth.user.token,
                },
            })
            .then((response: any) => {
                chat.updateChannels(response.data.channels);
            })
            .catch(
            );
        }
    }, [auth.user, chat]);

    const fetchAllChannels = useCallback(() => {
        if (auth.user) {
            axios.get(`${API_URL}:${HTTP_PORT}/api/channel/all/public/`, {
                method: 'get',
                url: `${API_URL}:${HTTP_PORT}/api/channel/all/public/`,
                responseType: "json",
                headers: {
                    "authorization": 'Bearer ' + auth.user.token,
                },
            })
                .then((response: any) => {
                    const options = response.data.channels.map((ch: any) => {
                        return {
                            id: ch.id,
                            label: ch.name,
                            isHasPassword: ch.isHasPassword
                        }
                    })
                    setOptions(options);
                })
                .catch(
                );
        }
    }, [auth.user]);


    useEffectOnce(() => {
        fetchChannels()
        fetchAllChannels();
    });

    useInterval(() => {
        fetchChannels();
        fetchAllChannels();
    }, 1000);

    if (!chat.channels.length) {
        return <CircularProgress />
    }

    function handleCreate() {
        const newChannel = {
            name: name,
            password: password === '' ? null : password
        }

        socket.once("created_channel", (data : any) => {
            chat.addNewChannel(data.message);
        })
        socket.once("exception", (data : any) => {setError(data.errors.join('\n'));})
        socket.emit("create_channel", newChannel)
    }

    function handleAutocomplete(event: any, value: any, reason: any) {
        if (reason === "createOption") {
            setName(value);
            setOpenJoin(true);
            return;
        } else if (reason === "selectOption") {
            if (value?.isHasPassword) {
                setName(value.label);
                setOpenJoin(true);
                return;
            }

            const newChannel = {
                name: typeof value === 'string' ? value : value?.label,
                password: password === '' ? null : password
            }

            socket.once("exception", (data : any) => {setError(data.errors.join('\n'));})
            socket.once("joined_channel", (data : any) => {
                chat.addNewChannel(data.message);
            })
            socket.emit("join_channel", newChannel);
            setKey(Date.now());
        }
    }

    function handleJoin() {
        const newChannel = {
            name: name,
            password: password
        }

        socket.once("exception", (data : any) => {setError(data.errors.join('\n'));})
        socket.once("joined_channel", (data : any) => {
            chat.addNewChannel(data.message);
        })
        socket.emit("join_channel", newChannel);
        setKey(Date.now());
    }

    return (
        <Box>
            <Alert severity="error" sx={{ display: error ? 'block' : 'none' }}>{error}</Alert>
            <Stack  sx={{ width: 454, height: 685, bgcolor: '#C4C4C4', borderRadius: 2, margin: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Paper
                        component="form"
                        sx={{ p: '2px 4px', ml: 2, mr: 2, mt: 1.5, display: 'flex', alignItems: 'center', width: 422 }}
                    >
                        <IconButton disabled sx={{ p: '10px' }} aria-label="search">
                            <SearchIcon />
                        </IconButton>
                        <Autocomplete
                            freeSolo
                            autoHighlight
                            disableClearable
                            blurOnSelect
                            options={options}
                            isOptionEqualToValue={(option: any, value: any) => option.id === value.id}
                            renderInput={(params) =>
                                <TextField
                                    {...params}
                                    variant="standard"
                                    sx={{ ml: 1, flex: 1, width: 288 }}
                                    placeholder="Join"

                                />
                            }
                            onChange={(e, value, reason) => {handleAutocomplete(e, value, reason);}}
                            //onKeyPress={e => {handleJoin(e)}}
                            key={key}
                        />
                        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                        <Button color="inherit" sx={{ p: '8px', backgroundColor: '#ECECEC' }} onClick={() => setOpen(true)}>
                            <AddIcon />
                        </Button>
                        <Dialog open={open}>
                            <DialogTitle>Create Channel</DialogTitle>
                            <Box
                                component="form"
                            >
                                <TextField
                                    required
                                    id="outlined-required"
                                    label="Channel name"
                                    sx={{ ml: 2, mr: 2, mt: 1.5 }}
                                    onChange={e => setName(e.target.value)}
                                />
                                <TextField
                                    id="outlined-password-input"
                                    label="Password"
                                    type="password"
                                    sx={{ ml: 2, mr: 2, mt: 1.5, mb:2 }}
                                    onChange={e => setPassword(e.target.value)}
                                />
                            </Box>
                            <DialogActions>
                                <Button onClick={() => {
                                    handleCreate();
                                    setOpen(false);
                                }}>
                                    Create
                                </Button>
                                <Button onClick={() => setOpen(false)}>
                                    Cancel
                                </Button>
                            </DialogActions>
                        </Dialog>
                        <Dialog open={openJoin}>
                            <DialogTitle>Join Channel</DialogTitle>
                            <Box
                                component="form"
                            >
                                <TextField
                                    disabled={true}
                                    id="outlined-required"
                                    label="Channel name"
                                    sx={{ ml: 2, mr: 2, mt: 1.5 }}
                                    value={name}
                                />
                                <TextField
                                    id="outlined-password-input"
                                    label="Password"
                                    type="password"
                                    sx={{ ml: 2, mr: 2, mt: 1.5, mb:2 }}
                                    onChange={e => setPassword(e.target.value)}
                                />
                            </Box>
                            <DialogActions>
                                <Button onClick={() => {
                                    handleJoin();
                                    setOpenJoin(false);
                                }}>
                                    Create
                                </Button>
                                <Button onClick={() => {setOpenJoin(false); setKey(Date.now());}}>
                                    Cancel
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </Paper>
                </Stack>
                <Stack sx={{ overflow: 'auto', maxHeight: 612, "&::-webkit-scrollbar": { display: "none" } }}>
                {chat.channels.map((ch : any, i: number) : any =>
                    <Item sx={{ bgcolor: '#FFFFFF', ml: 2, mr: 2, mt: 1.5, ":hover": {boxShadow: 10} }} key={i}>
                        <Grid direction="row" alignItems="center" container spacing={2}>
                            <Grid item xs={1} onClick={(e) => {
                                e.preventDefault();
                                navigate("/channel/" + ch.name);
                            }}>
                                <Avatar>{ch.name[0].toUpperCase()}</Avatar>
                            </Grid>
                            <Grid item xs={9} onClick={(e) => {
                                e.preventDefault();
                                navigate("/channel/" + ch.name);
                            }}>
                                <h4>{ch.name}</h4>
                            </Grid>
                            <Grid item xs={1}>
                                {ch.name !== 'general' &&
                                    <IconButton
                                        aria-label="delete"
                                        onClick={() => {
                                            chat.deleteChannel(ch.name);
                                            navigate('/channels', {replace: true});
                                        }
                                        }>
                                        <DeleteIcon />
                                    </IconButton>}
                            </Grid>
                        </Grid>
                    </Item>)}
                </Stack>
            </Stack >
            <Box>
                {chat.privateChannels.map((ch : any, i: number) : any =>
                    <Stack key={i}>
                        <span onClick={(e) => {
                            e.preventDefault();
                            navigate("/channel/" + ch.id)}
                        }>
                            {ch.name}
                        </span>
                        {ch.name !== 'general' && <IconButton aria-label="delete"
                            onClick={() => {
                                chat.deletePrivateChannel(ch.name)
                                navigate('/channels', {replace: true});
                            }}
                        ></IconButton>}
                    </Stack>)}
            </Box>
        </Box>
    )
}
