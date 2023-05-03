import { ICache } from "./cache.interface";

export interface OidcProtectModuleOptions {
  wellKnownUrl: string;
  resourceId?: string;
  wellKnownPublicEndpoints?: string[];
  cache?: ICache;
}
