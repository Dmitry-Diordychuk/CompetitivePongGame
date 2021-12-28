import React, {useState} from "react";

interface ModalContextType {
    summonModalWindow: Function;
    subject: any;
    x: number;
    y: number;
    isActive: boolean;
    setIsActive: Function;
}

const ModalContext = React.createContext<ModalContextType>(null!);

export function ModalProvider({ children }: { children: React.ReactNode }) {
    const [isActive, setIsActive] = useState(false);
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);
    const [subject, setSubject] = useState(null);

    let requestType : string = 'skip;'

    const summonModalWindow = (event: any, msg: any) => {
        console.log(event.pageX, event.pageY);
        setX(event.pageX);
        setY(event.pageY);
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
    };

    return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

export function useModal() {
    return React.useContext(ModalContext);
}