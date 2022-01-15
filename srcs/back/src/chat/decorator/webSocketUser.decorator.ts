import {createParamDecorator, ExecutionContext} from "@nestjs/common";

export const WSUser = createParamDecorator((data: any, ctx: ExecutionContext) => {
    const user = ctx.switchToWs().getClient().handshake.headers.user;

    if (!user) {
        return null;
    }

    if (data) {
        return user[data];
    }

    return user;
})