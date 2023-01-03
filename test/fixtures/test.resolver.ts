import { Query, Resolver } from "@nestjs/graphql";
import { Public, RealmRoles } from "../../src";
import { CLIENT_ROLE, REALM_ROLE } from "./keycloak/keycloak-prep.service";
import { ResourceRoles } from "../../src/library/decorator/resource-roles.decorator";

@Resolver()
export class TestResolver {
  @Query(() => String, {
    name: "test",
  })
  public test(): string {
    return "test";
  }

  @Public()
  @Query(() => String, { name: "public" })
  public public(): string {
    return "public";
  }

  @RealmRoles([REALM_ROLE])
  @Query(() => String, { name: "realmRole" })
  public realmRole(): string {
    return "realmRole";
  }

  @ResourceRoles([CLIENT_ROLE])
  @Query(() => String, { name: "resourceRole" })
  public resourceRole(): string {
    return "resourceRole";
  }
}
