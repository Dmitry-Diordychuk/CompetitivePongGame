import React, {useState} from "react";
import {Outlet, useNavigate} from "react-router-dom";
import {useAuth} from "../auth/auth.context";
import {useChat} from "../contexts/chat.context";
import Matchmacking from "./Matchmacking";
import Duel from "./Duel";
import {
    BottomNavigation,
    BottomNavigationAction,
    Box,
    Button,
    Menu,
    MenuItem,
    Paper
} from "@mui/material";
import SettingsIcon from '@mui/icons-material/Settings';
import GroupIcon from '@mui/icons-material/Group';
import LogoutIcon from '@mui/icons-material/Logout';
import ChatIcon from '@mui/icons-material/Chat';
import FaceIcon from '@mui/icons-material/Face';
import SportsHandballIcon from '@mui/icons-material/SportsHandball';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';


export default function TopPanel() {
    const auth = useAuth();
    const navigate = useNavigate();

    const [value, setValue] = useState<any>();

    return (
        <Box>
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
                        <BottomNavigationAction label="Admin" value="/admin" icon={<AdminPanelSettingsIcon />} /> : null}
                    <BottomNavigationAction label="Pong" value="/" icon={<SportsHandballIcon />} />
                    <BottomNavigationAction label="Profile" value="/profile" icon={<FaceIcon />} />
                    <BottomNavigationAction label="Channels" value="/channels" icon={<ChatIcon />} />
                    <Matchmacking />
                    <Duel />
                    <BottomNavigationAction label="Contacts" value="/contacts" icon={<GroupIcon />} />
                    <BottomNavigationAction label="Settings" value="/settings" icon={<SettingsIcon />} />
                    <HolddedPMC/>
                    <BottomNavigationAction label="Signout" value="/logout" icon={<LogoutIcon />} />

                </BottomNavigation>
            </Paper>
            <Outlet />
        </Box>
    )
}

function HolddedPMC()
{
    const chat = useChat();
    const navigate = useNavigate();


    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return(chat.privateChannels.length ?
        <Box>
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
        </Box> : <Box></Box>
    )
}
