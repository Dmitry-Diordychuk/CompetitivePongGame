import React from "react";
import {Avatar, Nickname} from "./Settings";
import BackgroundImage from "../pong.jpg";
import {Box, Button, Stack} from "@mui/material";
import {useNavigate} from "react-router-dom";


export default function LoginSettings()
{
    const navigate = useNavigate();

    return(
        <Box sx={{
            background: `url(${BackgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'top',
            minHeight: '100%',
            height: '100vh',
            position: 'relative'
        }}>
            <Box sx={{
                textAlign: 'center',
                top: '40%',
                left: '37%'
            }}>
                <Stack>
                    <h3>Set your avatar and nickname</h3>
                    <Nickname/>
                    <Avatar/>
                    <Button onClick={() => navigate('/')}>Continue</Button>
                </Stack>
            </Box>
        </Box>
    )
}
