import {CanActivate, ExecutionContext, Injectable, mixin, Type} from "@nestjs/common";
import {AuthGuard} from "@app/shared/guards/auth.guard";
import Role from "@app/user/types/role.enum";

const RoleGuard = (role: Role): Type<CanActivate> => {
    class RoleGuardMixin extends AuthGuard {
        canActivate(context: ExecutionContext): boolean {
            super.canActivate(context);

            const request = context.switchToHttp().getRequest();
            const user = request.user;

            return user?.role === role;
        }
    }

    return mixin(RoleGuardMixin);
}
export default RoleGuard;