import { SetMetadata } from "@nestjs/common";

export const OPERATION_ROLES_REQUIRED = "OPERATION_ROLES_REQUIRED";

export interface RolesDefinition {
  roles: string[];
}

export const Roles = (required: { roles: string[] }) =>
  SetMetadata<string, RolesDefinition>(OPERATION_ROLES_REQUIRED, required);
