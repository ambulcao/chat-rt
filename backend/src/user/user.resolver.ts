import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './user.types';
import { Request } from 'express';
import { UseGuards } from '@nestjs/common';
import { GraphqlAuthGuard } from 'src/auth/graphql-auth.guard';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @UseGuards(GraphqlAuthGuard)
  @Mutation(() => User)
  async updateProfile(
    @Args('fullname') fullname: string,
    @Context() context: { req: Request },
  ) {
    const file = context.req.files?.file; // Aqui captura o arquivo
    const imageUrl = file ? await this.storeImageAndGetUrl(file) : null;
    const userId = context.req.user.sub;
    return this.userService.updateProfile(userId, fullname, imageUrl);
  }

  private async storeImageAndGetUrl(file: any) {
    const uniqueFilename = `${uuidv4()}_${file.name}`;
    const imagePath = join(process.cwd(), 'public', uniqueFilename);
    const imageUrl = `${process.env.APP_URL}/${uniqueFilename}`;
    const readStream = file.data;
    createWriteStream(imagePath).write(readStream);
    return imageUrl;
  }
}
