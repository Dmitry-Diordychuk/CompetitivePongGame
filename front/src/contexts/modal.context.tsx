import React, {useRef, useState} from "react";

interface ModalContextType {
    summonModalWindow: Function;
    subject: any;
    x: number;
    y: number;
    isActive: boolean;
    setIsActive: Function;
    banTime: any;
}

const ModalContext = React.createContext<ModalContextType>(null!);

export function ModalProvider({ children }: { children: React.ReactNode }) {
    const [isActive, setIsActive] = useState(false);
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);
    const [subject, setSubject] = useState(null);

    const banTime = useRef<any>()

    const summonModalWindow = (event: any, msg: any) => {
        setX(event.pageX - window.scrollX);
        setY(event.pageY - window.scrollY);
        setSubject(msg);
        setIsActive(true);
    }

    let value : ModalContextType = {
        summonModalWindow,
        subject,
        x,
        y,
        isActive,
        setIsActive,
        banTime,
    };

    return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

export function useModal() {
    return React.useContext(ModalContext);
}