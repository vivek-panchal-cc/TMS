import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  BeforeInsert,
  PrimaryColumn,
} from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { Project } from "./Project";
import { Task } from "./Task";
import { User } from "./User";
import { ulid } from "ulid";
@Entity()
export class Notification extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => User, (user) => user.notifications)
  user: User;

  @Column()
  title: string;

  @Column()
  message: string;

  @Column()
  display_color: string;

  @Column()
  type: string; // e.g., "task_schedule", "task_delay", "status_change"

  @Column({ default: false })
  is_read: boolean;

  @ManyToOne(() => Project)
  @JoinColumn({ name: "project_id" })
  project: Project;

  @ManyToOne(() => Task)
  @JoinColumn({ name: "task_id" })
  task: Task;

  @ManyToOne(() => User)
  @JoinColumn({ name: "updated_by" })
  updated_by: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: "deleted_by" })
  deleted_by: User;

  @BeforeInsert()
  generateUlid() {
    this.id = ulid();
  }
}
