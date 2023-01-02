import { Query, Resolver } from "@nestjs/graphql";
import { Public, Roles } from "../../src";
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

  @Roles({
    roles: [`realm:${REALM_ROLE}`],
  })
  @Query(() => String, { name: "realmRole" })
  public realmRole(): string {
    return "realmRole";
  }

  @Roles({
    roles: [`resource:${CLIENT_ROLE}`],
  })
  @Query(() => String, { name: "resourceRole" })
  public resourceRole(): string {
    return "resourceRole";
  }
}
