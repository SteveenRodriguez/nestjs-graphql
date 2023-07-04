import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ItemsModule } from './items/items.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { SeedModule } from './seed/seed.module';
import { CommonModule } from './common/common.module';
import { ListModule } from './list/list.module';
import { ListItemModule } from './list-item/list-item.module';

@Module({
  imports: [
    // activar las variables de entorno
    ConfigModule.forRoot(),

    // Configuración asíncrona GraphQL
    GraphQLModule.forRootAsync({
      driver: ApolloDriver,
      imports: [
        /**Importar Módulos */
        AuthModule,
      ],
      inject: [
        /**Importar Servicios */
        JwtService,
      ],
      useFactory: async (jwtService: JwtService) => {
        return {
          playground: false,
          autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
          plugins: [ApolloServerPluginLandingPageLocalDefault()],
          context({ req }) {
            // const token = req.headers.authorization?.replace('Bearer ', '');
            // if (!token) throw new Error('Token needed');
            // const payload = jwtService.decode(token);
            // if (!payload) throw new Error('Token not valid');
          },
        };
      },
    }),

    //! Se comenta ya que se cambia la configuración a un módulo asíncrono de GraphQL
    // Configuración básica de GraphQL
    // GraphQLModule.forRoot<ApolloDriverConfig>({
    //   driver: ApolloDriver,
    //   playground: false,
    //   // process.cwd es la carpeta donde se está ejecutando el proyecto
    //   autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    //   // este plugin es para levantar el Apollo Studio
    //   plugins: [ApolloServerPluginLandingPageLocalDefault()],
    // }),

    // configuración TypeOrm con PostgreSql
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: true, // solo en desarrollo, para prod en false
      autoLoadEntities: true,
      // entities: [Item],
    }),

    ItemsModule,

    UsersModule,

    AuthModule,

    SeedModule,

    CommonModule,

    ListModule,

    ListItemModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
