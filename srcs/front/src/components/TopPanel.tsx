import React, {useEffect, useState} from "react";
import {Outlet, useNavigate} from "react-router-dom";
import {useAuth} from "../auth/auth.context";
import {useChat} from "../contexts/chat.context";
import Matchmacking from "./Matchmacking";
import {
    BottomNavigation,
    BottomNavigationAction,
    Box,
    Button,
    ClickAwayListener, List, ListItem,
    ListItemButton, ListItemIcon, Menu, MenuItem,
    Paper
} from "@mui/material";
import SettingsIcon from '@mui/icons-material/Settings';
import GroupIcon from '@mui/icons-material/Group';
import LogoutIcon from '@mui/icons-material/Logout';
import ChatIcon from '@mui/icons-material/Chat';
import FaceIcon from '@mui/icons-material/Face';
import SportsHandballIcon from '@mui/icons-material/SportsHandball';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import DeleteIcon from '@mui/icons-material/Delete';


export default function TopPanel() {
    const auth = useAuth();
    const navigate = useNavigate();

    const [value, setValue] = useState<any>();

    return (
        <>
            <Paper sx={{ top: 0, left: 0, right: 0 }} elevation={3}>
                <BottomNavigation
                    showLabels
                    value={value}
                    onChange={(event, newValue) => {
                        if (newValue !== '/game' && newValue !== '/inbox') {
                            setValue(newValue);
                            navigate(newValue);
                        }
                    }}
                >
                    <BottomNavigationAction label={auth.user?.username} disabled />
                    {(auth.user?.role === 'Admin' || auth.user?.role === 'PO') ?
                        <BottomNavigationAction label="Admin" value="/admin" icon={<AdminPanelSettingsIcon />} /> : <></>}
                    <BottomNavigationAction label="Pong" value="/" icon={<SportsHandballIcon />} />
                    <BottomNavigationAction label="Profile" value="/profile" icon={<FaceIcon />} />
                    <BottomNavigationAction label="Channels" value="/channels" icon={<ChatIcon />} />
                    <Matchmacking />
                    <BottomNavigationAction label="Contacts" value="/contacts" icon={<GroupIcon />} />
                    <BottomNavigationAction label="Settings" value="/settings" icon={<SettingsIcon />} />
                    {/*//<BottomNavigationAction label="Inbox" value="/inbox" icon={<MailIcon />} />*/}
                    <HolddedPMC/>
                    <BottomNavigationAction label="Signout" value="/logout" icon={<LogoutIcon />} />

                </BottomNavigation>
            </Paper>
            <Outlet />
        </>
    )
}

function HolddedPMC()
{
    const chat = useChat();
    const navigate = useNavigate();

    // useEffect(()=>{
    // }, [chat.privateChannels]);
    //
    // if (chat.privateChannels.length === 0) {
    //     return (<button disabled>Inbox</button>)
    // }


    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return(chat.privateChannels.length ?
        <>
            <Button onClick={handleClick}>
                {"Private chats"}
            </Button>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                {chat.privateChannels.map((ch : any, i: number) : any =>
                    <MenuItem key={i} onClick={() => {
                        navigate("/channel/" + ch.id);
                    }}>
                        {ch.name}
                    </MenuItem>
                )}
            </Menu>
        </> : <></>
    )
}

// <ClickAwayListener onClickAway={handleClickAway}>
//     <Box sx={{ position: 'relative' }}>
//         <Button onClick={handleClick}>
//             {"Inbox"}
//         </Button>
//         {open ? (
//             <Box sx={styles}>
//                 <List>
//                 {chat.privateChannels.map((ch : any, i: number) : any =>
//                     <ListItem disablePadding>
//                         <ListItemButton key={i} onClick={() => {
//                             navigate("/channel/" + ch.id);
//                         }}>
//                             {ch.name}
//                         </ListItemButton>
//                         <ListItemButton onClick={() => {
//                             chat.deletePrivateChannel(ch.name);
//                         }}>
//                             <ListItemIcon>
//                                 <DeleteIcon />
//                             </ListItemIcon>
//                         </ListItemButton>
//                     </ListItem >
//                 )}
//                 </List>
//             </Box>
//         ) : null}
//     </Box>
// </ClickAwayListener>
