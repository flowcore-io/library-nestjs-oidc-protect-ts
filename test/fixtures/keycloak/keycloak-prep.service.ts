import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { ModuleOptions } from "@jbiskur/nestjs-async-module";
import { KeycloakPrepModuleOptions } from "./keycloak-prep-module-options.interface";
import axios from "axios";
import { InjectLogger, LoggerService } from "@flowcore/microservice";

export const REALM_ROLE = "realm-role";
export const CLIENT_ROLE = "client-role";

export enum UserType {
  TEST_USER,
  NO_ACCESS_USER,
}

@Injectable()
export class KeycloakPrepService implements OnApplicationBootstrap {
  private accessToken: string = null;
  private accessTokenUrl: string = null;

  constructor(
    @InjectLogger() private readonly logger: LoggerService,
    private readonly options: ModuleOptions<KeycloakPrepModuleOptions>,
  ) {}

  async onApplicationBootstrap() {
    this.accessToken = await this.getAccessToken();

    const clientId = await this.createClient();
    const clientRoleId = await this.createClientRole("test", CLIENT_ROLE);
    const userRoleId = await this.createRealmRole(REALM_ROLE);
    await this.createUser(clientId, clientRoleId, userRoleId);
  }

  public async getUserToken(userType: UserType) {
    try {
      let userData = null;

      switch (userType) {
        case UserType.TEST_USER:
          userData = {
            username: "test",
            password: "test",
          };
          break;
        case UserType.NO_ACCESS_USER:
          userData = {
            username: "no-access",
            password: "no-access",
          };
          break;
      }

      const { data } = await axios.post(
        this.accessTokenUrl,
        {
          grant_type: "password",
          ...userData,
          client_id: "test",
          scope: "profile email openid",
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );

      return data.access_token;
    } catch (error) {
      this.logger.error(error as string, {
        error,
      });
    }
  }

  private async createClient() {
    const { baseUrl } = this.options.get();

    try {
      const { data } = await axios.get(
        `${baseUrl}/admin/realms/master/clients`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        },
      );

      const client = data.find((client) => client.clientId === "test");

      if (!client) {
        const result = await axios.post(
          this.options.get().baseUrl + "/admin/realms/master/clients",
          {
            clientId: "test",
            publicClient: true,
            standardFlowEnabled: false,
            directAccessGrantsEnabled: true,
          },
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
            },
          },
        );

        return result.data.id;
      } else {
        return client.id;
      }
    } catch (error) {
      this.logger.error(error as string, {
        error,
      });
    }
  }

  private async createUser(
    clientId: string,
    clientRoleId: string,
    realmRoleId: string,
  ) {
    const { baseUrl } = this.options.get();

    try {
      const userResponse = await axios.get(
        `${baseUrl}/admin/realms/master/users`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        },
      );

      if (!userResponse.data.find((user) => user.username === "test")) {
        await axios.post(
          this.options.get().baseUrl + "/admin/realms/master/users",
          {
            username: "test",
            enabled: true,
            emailVerified: true,
            firstName: "test",
            lastName: "test",
            credentials: [
              {
                type: "password",
                value: "test",
              },
            ],
          },
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
            },
          },
        );
      }

      if (!userResponse.data.find((user) => user.username === "no-access")) {
        await axios.post(
          this.options.get().baseUrl + "/admin/realms/master/users",
          {
            username: "no-access",
            enabled: true,
            emailVerified: true,
            firstName: "no-access",
            lastName: "no-access",
            credentials: [
              {
                type: "password",
                value: "no-access",
              },
            ],
          },
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
            },
          },
        );
      }

      const { data } = await axios.get(`${baseUrl}/admin/realms/master/users`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      const user = data.find((user) => user.username === "test");

      await axios.post(
        this.options.get().baseUrl +
          `/admin/realms/master/users/${user.id}/role-mappings/clients/${clientId}`,
        [
          {
            id: clientRoleId,
            clientRole: true,
            composite: false,
            name: CLIENT_ROLE,
          },
        ],
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        },
      );

      await axios.post(
        this.options.get().baseUrl +
          `/admin/realms/master/users/${user.id}/role-mappings/realm`,
        [
          {
            id: realmRoleId,
            clientRole: false,
            composite: false,
            name: REALM_ROLE,
          },
        ],
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        },
      );
    } catch (error) {
      this.logger.error(error as string, {
        error,
      });
    }
  }

  private async getAccessToken() {
    if (!this.accessToken) {
      const { wellKnownUrl } = this.options.get();

      try {
        const endpoints = await axios.get(wellKnownUrl);

        const { token_endpoint } = endpoints.data;

        this.accessTokenUrl = token_endpoint;

        const { data } = await axios.post(
          token_endpoint,
          {
            grant_type: "password",
            client_id: "admin-cli",
            username: "admin",
            password: "admin",
          },
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          },
        );

        return data.access_token;
      } catch (error) {
        this.logger.error(error as string, {
          error,
        });
      }
    } else {
      return this.accessToken;
    }
  }

  private async createRealmRole(roleName: string) {
    const { baseUrl } = this.options.get();

    try {
      const { data } = await axios.get(`${baseUrl}/admin/realms/master/roles`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      const realmRole = data.find((role) => role.name === roleName);

      if (!realmRole) {
        const result = await axios.post(
          this.options.get().baseUrl + "/admin/realms/master/roles",
          {
            name: roleName,
          },
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
            },
          },
        );

        return result.data.id;
      } else {
        return realmRole.id;
      }
    } catch (error) {
      this.logger.error(error as string, {
        error,
      });
    }
  }

  private async createClientRole(clientName: string, roleName: string) {
    const { baseUrl } = this.options.get();

    const clientResponse = await axios.get(
      `${baseUrl}/admin/realms/master/clients`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      },
    );

    const clientId = clientResponse.data.find(
      (client) => client.clientId === clientName,
    ).id;

    if (!clientId) {
      throw new Error(`Client ${clientName} not found`);
    }

    const { data } = await axios.get(
      `${baseUrl}/admin/realms/master/clients/${clientId}/roles`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      },
    );

    const role = data.find((role) => role.name === roleName);

    if (!role) {
      const result = await axios.post(
        `${baseUrl}/admin/realms/master/clients/${clientId}/roles`,
        {
          name: roleName,
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        },
      );

      console.log(result);

      return result.data.id;
    } else {
      return role.id;
    }
  }
}
