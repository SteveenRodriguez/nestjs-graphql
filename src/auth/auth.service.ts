import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthResponse } from './types/auth-response.type';
import { UsersService } from '../users/users.service';
import { SignupInput, LoginInput } from './dto/inputs';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // método para firmar y generar un JWT
  private getJwtToken(userId: string) {
    return this.jwtService.sign({ id: userId });
  }

  // crea un usuario para ingresar al sistema
  async signup(signupInput: SignupInput): Promise<AuthResponse> {
    const user = await this.userService.create(signupInput);
    const token = this.getJwtToken(user.id);
    return { token, user };
  }

  // logueo, previamente con el usuario creado en el sistema
  async login(loginInput: LoginInput): Promise<AuthResponse> {
    const { email, password } = loginInput;
    const user = await this.userService.findOneByEmail(email);
    if (!bcrypt.compareSync(password, user.password)) {
      throw new BadRequestException(`Email - password do not match`);
    }
    const token = this.getJwtToken(user.id);
    return { token, user };
  }

  // validación del usuario que ingresa con el token y el id
  async validateUser(id: string): Promise<User> {
    const user = await this.userService.findOneById(id);
    if (!user.isActive) {
      throw new UnauthorizedException(
        `User ${id} is inactive, talk with admin`,
      );
    }
    delete user.password;
    return user;
  }

  // Validación del token
  revaledateToken(user: User): AuthResponse {
    const token = this.getJwtToken(user.id);
    return { token, user };
  }
}
