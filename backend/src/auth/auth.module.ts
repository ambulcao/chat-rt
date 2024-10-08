import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt'; 
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma.service'; 
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      global: true, 
      secret: 'your-secret-key', 
      signOptions: { expiresIn: '1d' }, 
    }),
  ],
  providers: [AuthResolver, AuthService, PrismaService, JwtService] 
})
export class AuthModule {}