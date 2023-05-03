import {
  Field,
  ID,
  ObjectType,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import { faker } from "@faker-js/faker";
import { Public, RealmRoles } from "../../src";
import { REALM_ROLE } from "./keycloak/keycloak-prep.service";

@ObjectType()
export class TestPerson {
  @Field(() => ID)
  id: number;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field(() => String, { nullable: true })
  fullName?: string;
}

@Resolver(() => TestPerson)
export class PersonResolver {
  @Public()
  @Query(() => TestPerson)
  async testPerson() {
    console.log("Returning random public person");
    return {
      id: faker.datatype.uuid(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
    };
  }

  @RealmRoles([REALM_ROLE])
  @ResolveField()
  async fullName(@Parent() person: TestPerson) {
    console.log("Returning private full name");
    return `${person.firstName} ${person.lastName}`;
  }
}
