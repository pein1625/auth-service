import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsEmail,
  Length,
  IsNumber,
  Min,
} from 'class-validator';
import { IsEmailUnique } from '../decorators/is-email-unique.decorator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @MaxLength(100, { message: 'Email must be less than 100 characters' })
  @IsEmailUnique({ message: 'Email already exists' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @Length(8, 100, {
    message: 'Password must be between 8 and 100 characters long',
  })
  password: string;

  @IsOptional({ message: 'Name is optional' })
  @IsString({ message: 'Name must be a string' })
  @MaxLength(100, { message: 'Name must be less than 100 characters' })
  name?: string;

  @IsOptional({ message: 'Avatar URL is optional' })
  @IsString({ message: 'Avatar URL must be a string' })
  @MaxLength(255, { message: 'Avatar URL must be less than 255 characters' })
  avatarUrl?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Token version must be a number' })
  @Min(0, { message: 'Token version must be greater than 0' })
  tokenVersion?: number;
}
