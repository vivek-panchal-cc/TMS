import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, PrimaryColumn, BeforeInsert } from "typeorm";
import { IsEmail, IsNotEmpty, IsNumber, Min, Length, IsDateString } from "class-validator";
import { BaseEntity } from "./BaseEntity";
import { User } from "./User";
import { ulid } from "ulid";
@Entity()
export class Project extends BaseEntity {
  @PrimaryColumn()
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

  @ManyToOne(() => User)
  @JoinColumn({ name: "deleted_by" })
  deleted_by: User;

  @BeforeInsert()
  generateUlid() {
    this.id = ulid();
  }
}
