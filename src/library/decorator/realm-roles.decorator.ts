import { SetMetadata } from "@nestjs/common";

export const OPERATION_REALM_ROLES_REQUIRED = "OPERATION_REALM_ROLES_REQUIRED";

export const RealmRoles = (required: string[]) =>
  SetMetadata<string, string[]>(OPERATION_REALM_ROLES_REQUIRED, required);
