import {ChannelType} from "@app/chat/types/channel.type";

export interface ChannelsResponseInterface {
    channels: ChannelType[];
    counter: number;
}