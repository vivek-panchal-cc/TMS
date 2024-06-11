import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { IsEmail, IsNotEmpty, IsNumber, Min, Length, IsDateString } from "class-validator";
import { BaseEntity } from "./BaseEntity";
import { User } from "./User";

@Entity()
export class Project extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  @IsNotEmpty({ message: "Project name is required" })
  projectName: string;

  @Column({ type: "date" })
  startDate: Date;

  @Column({ type: "date" })
  endDate: Date;

  @Column()
  @IsNotEmpty({ message: "Status is required" })
  status: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "updated_by" })
  updated_by: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: "created_by" })
  created_by: User;
}
