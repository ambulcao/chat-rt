import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MinLength, IsString } from 'class-validator';

@InputType()
export class RegisterDto {
    @Field()
    @IsNotEmpty({ message: 'O nome completo é obrigatório.' })
    @IsString({ message: 'Nome completo deve ser uma string' })
    fullname: string;

    @Field()
    @IsNotEmpty({ message: 'A senha é obrigatória.' })
    @MinLength(8, { message: 'A senha deve ter pelo menos 8 caracteres.' })
    password: string;

    // A senha de confirmação deve ser igual a senha

    @Field()
    @IsNotEmpty({ message: 'A confirmação da senha é obrigatória.' })
    confirmPassword: string;

    @Field()
    @IsNotEmpty({ message: 'E-mail é obrigatório.' })
    @IsEmail({}, { message: 'O E-mail deve ser válido.' })
    email: string;
}

    @InputType()
    export class LoginDto {
        @Field()
        @IsNotEmpty({ message: 'E-mail é obrigatório.' })
        @IsEmail({}, { message: 'O E-mail deve ser válido.' })
        email: string;


        @Field()
        @IsNotEmpty({ message: 'A senha é obrigatória.'})
        password: string;
    }
