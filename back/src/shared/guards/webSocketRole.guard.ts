import {CanActivate, ExecutionContext, mixin, Type} from "@nestjs/common";
import Role from "@app/user/types/role.enum";
import {WebSocketAuthGuard} from "@app/shared/guards/webSocketAuth.guard";

const WebSocketRoleGuard = (role: Role): Type<CanActivate> => {
    class WebSocketRoleGuardMixin extends WebSocketAuthGuard {
        canActivate(context: ExecutionContext): boolean {
            super.canActivate(context);

            const client = context.switchToWs().getClient();
            const user = client.handshake.headers.user;

            if (user?.role === Role.Owner)
                return true;
            else if (user?.role === Role.PO && role !== Role.Owner)
                return true;
            else if (user?.role === Role.Banned)
                return false;
            return user?.role === role;
        }
    }

    return mixin(WebSocketRoleGuardMixin);
}
export default WebSocketRoleGuard;