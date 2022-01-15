import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { CookiesProvider } from "react-cookie";
import { BrowserRouter } from "react-router-dom";

import {ChatProvider} from "./contexts/chat.context";
import {ModalProvider} from "./contexts/modal.context";
import {ContactProvider} from "./contexts/contact.context";
import {GameProvider} from "./contexts/game.context";
import {SocketIOProvider} from "./contexts/socket.io.context";
import {AuthProvider} from "./auth/auth.context";

import 'bootstrap/dist/css/bootstrap.min.css';

ReactDOM.render(
    <React.StrictMode>
        <BrowserRouter>
            <CookiesProvider>
                <SocketIOProvider>
                    <AuthProvider>
                        <GameProvider>
                            <ModalProvider>
                                <ContactProvider>
                                    <ChatProvider>
                                        <App />
                                    </ChatProvider>
                                </ContactProvider>
                            </ModalProvider>
                        </GameProvider>
                    </AuthProvider>
                </SocketIOProvider>
            </CookiesProvider>
        </BrowserRouter>
    </React.StrictMode>,
document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
