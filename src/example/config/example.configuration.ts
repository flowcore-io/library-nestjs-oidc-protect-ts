import { z } from "zod";
import { ConfigurationSchema } from "@flowcore/microservice";

export const ExampleConfigurationShape = z.object({
  name: z.string(),
});
export type ExampleConfiguration = z.infer<typeof ExampleConfigurationShape>;

export class ExampleConfigurationSchema extends ConfigurationSchema {
  context = "example";
  linking = {
    name: "NAME",
  };
  shape = ExampleConfigurationShape;
}
