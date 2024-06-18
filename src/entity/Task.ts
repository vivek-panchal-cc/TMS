import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  PrimaryColumn,
} from "typeorm";
import { User } from "./User";
import { Project } from "./Project";
import { Label } from "./Label";
import { BaseEntity } from "./BaseEntity";
import { ulid } from "ulid";
@Entity()
export class Task extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  taskName: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: "project_id" })
  project: Project;

  @ManyToOne(() => Label)
  @JoinColumn({ name: "label_id" })
  label: Label;

  @ManyToOne(() => User)
  @JoinColumn({ name: "assigned_user" })
  assignedUser: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: "assigned_by" })
  assignedBy: User;

  @Column({ type: "date" })
  start_date: Date;

  @Column({ type: "date" })
  end_date: Date;

  @Column()
  status: string;

  @Column({ default: false })
  is_archived: boolean;

  @Column({ nullable: true })
  attachment?: string;

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
