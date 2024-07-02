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
export class TaskDependency extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => Task, { onDelete: "CASCADE" })
  @JoinColumn({ name: "task_id" })
  task: Task;

  @ManyToOne(() => Task, { onDelete: "CASCADE" })
  @JoinColumn({ name: "dependency_id" })
  dependency: Task;

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
