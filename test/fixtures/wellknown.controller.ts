import { Controller, Get } from "@nestjs/common";

@Controller()
export class WellKnownController {
  @Get("/health")
  public health(): string {
    return "ok";
  }

  @Get("/metrics")
  public metrics(): string {
    return "ok";
  }

  @Get("/not-known")
  public notKnown(): string {
    return "ok";
  }
}
