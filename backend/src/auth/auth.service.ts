import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { Request, Response } from 'express';
import { User } from '@prisma/client';
import { LoginDto, RegisterDto } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
    ) {}

    async refreshToken(req: Request, res: Response) {
        const refreshToken = req.cookies['refresh_token'];

    if (!refreshToken) {
        throw new UnauthorizedException('Token de atualização não encontrado');
    }

    let payload;

    try {
        payload = this.jwtService.verify(refreshToken, {
            secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
        });
    } catch (error) {
        throw new UnauthorizedException('Token de atualização inválido ou expirado');
    }
    const userExists = await this.prisma.user.findUnique({
        where: { id: payload.sub },
    });

    if (!userExists) {
        throw new BadRequestException('O usuário não existe mais');
    }

    //expiracao do token por data de validade
    const expiresIn = 15000;
    const expiration = Math.floor(Date.now() / 1000) + expiresIn;
    const accessToken = this.jwtService.sign(
        { ...payload, exp: expiration },
        {
            secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
        },
    );
    res.cookie('access_token', accessToken, { httpOnly: true });

    return accessToken
  }
    private async issueTokens(user: User, response: Response) {
        const payload = { username: user.fullname, sub: user.id };

        const accessToken = this.jwtService.sign(
            { ...payload },
            { 
                secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
                expiresIn: '150sec',
            },
        );
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
            expiresIn: '7d',
        });

        response.cookie('access_token', accessToken, { httpOnly: true });
        response.cookie('refresh_token', refreshToken, {
            httpOnly: true,
        });
        return { user };
    }

    async validateUser(loginDto: LoginDto) {
        const user = await this.prisma.user.findFirst({
            where: { email: loginDto.email },
        });
        if (user && (await bcrypt.compare(loginDto.password, user.password))) {
            return user;
        }
        return null
    }

    async register(registerDto: RegisterDto, response: Response) {
        const existingUser = await this.prisma.user.findFirst({
            where: { email: registerDto.email },
        });
        if (existingUser) {
            throw new BadRequestException({ email: 'E-mail já em uso'});
        }
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                fullname: registerDto.fullname,
                password: hashedPassword,
                email: registerDto.email,
                rememberToken: null,
            },
        });
        return this.issueTokens(user, response);
    }

    async login(loginDto: LoginDto, response: Response) {
        const user = await this.validateUser(loginDto);
        if (!user) {
            throw new BadRequestException({
                invalidCredentials: 'Credenciais inválidas',
            });
        }
        return this.issueTokens(user, response);
    }

    async logout(response: Response) {
        response.clearCookie('access_token');
        response.clearCookie('refresh_token');
        return 'Desconectado com sucesso.';
    }
}
