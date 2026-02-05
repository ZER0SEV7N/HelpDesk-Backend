import { 
    Body, 
    Controller,
    Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {LoginDTO } from './dto/login.auth.dto';
import { RegisterDTO } from './dto/register.auth.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

  // REGISTER
@Post('register')
register(@Body() dto: RegisterDTO) {
    return this.authService.register(dto);
}

  // LOGIN
@Post('login')
login(@Body() dto: LoginDTO) {
    return this.authService.login(dto);
}
}
