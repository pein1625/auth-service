import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Match } from 'src/common/decorators/match.decorator';

export class ChangePasswordDto {
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @Length(8, 100, {
    message: 'Password must be between 8 and 100 characters long',
  })
  password: string;

  @IsString({ message: 'Re-password must be a string' })
  @IsNotEmpty({ message: 'Re-password is required' })
  @Length(8, 100, {
    message: 'Re-password must be between 8 and 100 characters long',
  })
  @Match('password', { message: 'Re-password must match password' })
  rePassword: string;
}
