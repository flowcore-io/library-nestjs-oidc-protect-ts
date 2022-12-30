import { Injectable } from "@nestjs/common";
import { ModuleOptions } from "@jbiskur/nestjs-async-module";
import { ExampleModuleOptions } from "../interface/example-module-options.interface";

@Injectable()
export class ExampleService {
  constructor(private readonly options: ModuleOptions<ExampleModuleOptions>) {}

  public sayHello(): string {
    return `Hello ${this.options.get().name}`;
  }
}
