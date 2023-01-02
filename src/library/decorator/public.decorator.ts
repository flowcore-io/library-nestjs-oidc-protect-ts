import { SetMetadata } from "@nestjs/common";

export const PUBLIC_OPERATION_KEY = "PUBLIC_OPERATION";
export const Public = () => SetMetadata(PUBLIC_OPERATION_KEY, true);
