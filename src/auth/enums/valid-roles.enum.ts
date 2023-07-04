/* eslint-disable prettier/prettier */
import { registerEnumType } from '@nestjs/graphql';

export enum ValidRoles {
  admin = 'admin',
  user = 'user',
  superUser = 'superUser',
}

// registra los enum de mi app en grapqhl para hacer peticiones
registerEnumType(ValidRoles, { name: 'ValidRoles' });
