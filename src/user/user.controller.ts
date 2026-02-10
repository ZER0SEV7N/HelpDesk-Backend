import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Req,
} from "@nestjs/common";
import { UserService } from "./user.service";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("register")
  create(@Body() body: any) {
    return this.userService.createUser(body);
  }

  @Patch(":id/role")
  changeRole(
    @Param("id") userId: number,
    @Body("role") role: string,
    @Req() req,
  ) {
    return this.userService.changeRole(req.user.id, userId, role);
  }
}
