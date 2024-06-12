import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  Min,
  Length,
  IsDateString,
} from "class-validator";
import { IsDateFormat } from "../validators/dateFormatValidator";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column({ unique: true })
  @IsEmail({}, { message: "Invalid email format" }) // Validate email format
  email: string;

  @Column()
  @IsNotEmpty({ message: "Password is required" }) // Validate not empty
  @Length(6, 100, { message: "Password must be at least 6 characters long" }) // Validate length
  password: string;

  @Column()
  @IsNotEmpty({ message: "First name is required" }) // Validate not empty
  firstName: string;

  @Column()
  @IsNotEmpty({ message: "Last name is required" }) // Validate not empty
  lastName: string;

  // @Column({ nullable: true })
  // @IsNumber({}, { message: "Age must be a number" }) // Validate number
  // @Min(0, { message: "Age must be a positive number" }) // Validate minimum value
  // age: number;

  @Column()
  @IsNotEmpty({ message: "Date of birth is required" })
  @IsDateString({}, { message: "Date of birth must be a valid date" })
  dob: string;

  @Column({ nullable: true })
  @IsNotEmpty({ message: "Address is required" }) // Validate not empty
  address: string;

  @Column({ default: "user" })
  @IsNotEmpty()
  role: string;

  @Column({ default: 0 })
  tokenVersion: number;
}
