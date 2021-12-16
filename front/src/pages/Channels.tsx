import omni_class from "../classes/omni";
import {useState} from "react";
import First_init from "../components/first_init";
import LoginScreen from "../components/login_screen";
import OnTopPanel from "../components/on_top_panel";
import Bottom from "../components/bottom";


let omni = new omni_class();


function Channels()
{
    //   omni.ChannelsList.checkMessage();
    return (
        <div>
            <OnTopPanel Omni={omni} />
            <Bottom Omni={omni} />
        </div>
    );
}

export default Channels;
