import { Query, Resolver } from "@nestjs/graphql";
import {
  AuthenticatedUser,
  Public,
  RealmRoles,
  ResourceRoles,
  Token,
} from "../../src";
import { CLIENT_ROLE, REALM_ROLE } from "./keycloak/keycloak-prep.service";

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

  @RealmRoles([REALM_ROLE])
  @Query(() => String, { name: "authenticatedUser" })
  public authenticatedUser(@AuthenticatedUser() user: any): string {
    return user.preferred_username;
  }

  @RealmRoles([REALM_ROLE])
  @Query(() => String, { name: "token" })
  public token(@Token() token: string): string {
    return token;
  }
}
