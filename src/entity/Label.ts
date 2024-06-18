import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, PrimaryColumn, BeforeInsert } from "typeorm";
import { IsNotEmpty } from "class-validator";
import { BaseEntity } from "./BaseEntity";
import { User } from "./User";
import { ulid } from "ulid";

@Entity()
export class Label extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  @IsNotEmpty({ message: "Label name is required" })
  labelName: string;

  @Column()
  @IsNotEmpty({ message: "Color is required" })
  color: string;

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
