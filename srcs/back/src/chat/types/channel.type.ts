import {ChannelEntity} from "@app/chat/channel.entity";

export type ChannelType = Omit<ChannelEntity, 'hashPassword'>