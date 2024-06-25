import {
  Entity,
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
export class Subscriber extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => Task, (task) => task.subscribers, { onDelete: "CASCADE" })
  @JoinColumn({ name: "task_id" })
  task: Task;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: "created_by" })
  created_by: User;

  @BeforeInsert()
  generateUlid() {
    this.id = ulid();
  }
}
