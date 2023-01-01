import { IsNotEmpty, IsEmail, MaxLength, MinLength } from "class-validator";
import { IsEmailAlreadyExist } from "src/decorator/email-validator";

export interface SignupProps {
  username: string
  email: string
  password: string
}

export class SignupData {
  @MaxLength(99, { message: 'Name is too long' })
  @IsNotEmpty({ message: 'Required' })
  private username: string

  @IsEmailAlreadyExist({ message: 'Email is already exist' })
  @MaxLength(99, { message: 'Email is too long' })
  @IsEmail({}, { message: 'Not an email' })
  @IsNotEmpty({ message: 'Required' })
  private email: string

  @MaxLength(99, { message: 'Password too long' })
  @MinLength(6, { message: 'Minimum password length is 6' })
  @IsNotEmpty({ message: 'Required' })
  private password: string

  constructor(data: SignupProps) {
    this.username = data.username
    this.email = data.email
    this.password = data.password
  }
}