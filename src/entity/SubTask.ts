import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  BeforeInsert,
} from "typeorm";
import { ulid } from "ulid";
import { BaseEntity } from "./BaseEntity";
import { Task } from "./Task";
import { User } from "./User";

@Entity()
export class Subtask extends BaseEntity{
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  status: string;

  @ManyToOne(() => Task, (task) => task.subtasks, { onDelete: "CASCADE" })
  @JoinColumn({ name: "task_id" })
  task: Task;

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
