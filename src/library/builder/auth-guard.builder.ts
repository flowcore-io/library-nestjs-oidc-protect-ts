import { Provider } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AuthGuard } from "../guard/auth.guard";
import { RoleGuard } from "../guard/role.guard";
import { ResourceGuard } from "../guard/resource.guard";

export class AuthGuardBuilder {
  private enableRoleGuard = false;
  private enableResourceGuard = false;

  public usingRoleGuard(): this {
    this.enableRoleGuard = true;
    return this;
  }

  public usingResourceGuard(): this {
    this.enableResourceGuard = true;
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
      ...(this.enableResourceGuard
        ? [
            {
              provide: APP_GUARD,
              useClass: ResourceGuard,
            },
          ]
        : []),
    ];
  }
}
