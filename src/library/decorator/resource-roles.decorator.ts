import { SetMetadata } from "@nestjs/common";

export const OPERATION_RESOURCE_ROLES_REQUIRED =
  "OPERATION_RESOURCE_ROLES_REQUIRED";

export const ResourceRoles = (required: string[]) =>
  SetMetadata<string, string[]>(OPERATION_RESOURCE_ROLES_REQUIRED, required);
