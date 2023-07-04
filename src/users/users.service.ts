import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { SignupInput } from '../auth/dto/inputs/singup.input';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common/exceptions';
import { Logger } from '@nestjs/common/services';
import * as bcrypt from 'bcrypt';
import { ValidRoles } from '../auth/enums/valid-roles.enum';
import { UpdateUserInput } from './dto/update-user.input';

@Injectable()
export class UsersService {
  private logger = new Logger('UsersService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(signupInput: SignupInput): Promise<User> {
    try {
      // crecación y preparación del usuario !!Aun no se persiste en BD
      const newUser = this.userRepository.create({
        ...signupInput,
        password: bcrypt.hashSync(signupInput.password, 10), // encriptación de la contraseña
      });
      // se guarda en base de datos la entidad newUser
      return await this.userRepository.save(newUser);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findAll(roles: ValidRoles[]): Promise<User[]> {
    if (roles.length === 0) {
      return this.userRepository.find({
        // TODO: No es necesario por que se tiene en true el lazy en lastUpdateBy
        relations: {
          lastUpdateBy: true,
        },
      });
    }

    // tenemos roles example: ['admin', 'user', 'superUser',....etc.....]
    return this.userRepository
      .createQueryBuilder()
      .andWhere('ARRAY[roles] && ARRAY[:...roles]')
      .setParameter('roles', roles)
      .getMany();
  }

  async findOneByEmail(email: string): Promise<User> {
    try {
      return await this.userRepository.findOneByOrFail({ email });
    } catch (error) {
      throw new NotFoundException(`email ${email} not found`);
      // this.handleDBErrors({
      //   code: `error-001`,
      //   detail: `email ${email} not found`,
      // });
    }
  }

  async findOneById(id: string): Promise<User> {
    try {
      return await this.userRepository.findOneByOrFail({ id });
    } catch (error) {
      throw new NotFoundException(`email ${id} not found`);
    }
  }

  async update(
    id: string,
    updateUserInput: UpdateUserInput,
    updateBy: User,
  ): Promise<User> {
    try {
      const user = await this.userRepository.preload({
        ...updateUserInput,
        id,
      });
      user.lastUpdateBy = updateBy;
      return await this.userRepository.save(user);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async blockUser(id: string, adminUser: User): Promise<User> {
    const userToBlock = await this.findOneById(id);
    userToBlock.isActive = false;
    userToBlock.lastUpdateBy = adminUser;
    return await this.userRepository.save(userToBlock);
  }

  // cuando es never, se debe retornar siempre algo nunca va a retornar algo vacio
  private handleDBErrors(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    if (error.code == 'error-001') throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException('Please check server logs');
  }
}
