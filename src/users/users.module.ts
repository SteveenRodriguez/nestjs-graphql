import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemsModule } from '../items/items.module';

@Module({
  providers: [UsersResolver, UsersService],
  // TypeOrmModule: sirve para decirle a TYPEORM que persista la entidad en la base de datos
  imports: [TypeOrmModule.forFeature([User]), ItemsModule],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
