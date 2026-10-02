import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ...(!process.env.DATABASE_URL && {
    host: process.env.DATABASE_HOST || 'localhost',
    port: +`${process.env.PORT}` || 5436,
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgresql',
    database: process.env.DATABASE_NAME || 'bd_yuca_backend',
  }),
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/migrations/*{.ts,.js}'],
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});