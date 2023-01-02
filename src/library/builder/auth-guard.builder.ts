import { Provider } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AuthGuard } from "../guard/auth.guard";
import { RoleGuard } from "../guard/role.guard";

export class AuthGuardBuilder {
  private enableRoleGuard = false;

  public usingRoleGuard(): this {
    this.enableRoleGuard = true;
    return this;
  }

  public build(): Provider[] {
    return [
      {
        provide: APP_GUARD,
        useClass: AuthGuard,
      },
      ...(this.enableRoleGuard
        ? [
            {
              provide: APP_GUARD,
              useClass: RoleGuard,
            },
          ]
        : []),
    ];
  }
}
