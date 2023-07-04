import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  exports: [JwtStrategy, PassportModule, JwtModule],
  imports: [
    ConfigModule, // modulo para leer las variables de entorno
    UsersModule,
    // Configuración autenticación de JWT
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // volver asyncronó el JWT mediante config de módulo
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: '4h',
        },
      }),
    }),
  ],
  providers: [AuthResolver, AuthService, JwtStrategy],
})
export class AuthModule {}
