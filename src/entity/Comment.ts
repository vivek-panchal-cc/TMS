import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  PrimaryColumn,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { User } from "./User";
import { Task } from "./Task";
import { Project } from "./Project";
import { ulid } from "ulid";

@Entity()
export class Comment extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => Project)
  @JoinColumn({ name: "project_id" })
  project: Project;

  @ManyToOne(() => Task)
  @JoinColumn({ name: "task_id" })
  task: Task;

  @Column()
  comment: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "updated_by" })
  updated_by: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: "created_by" })
  created_by: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: "deleted_by" })
  deleted_by: User;

  @ManyToMany(() => User)
  @JoinTable({
    name: "comment_tagged_users",
    joinColumn: {
      name: "comment_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "user_id",
      referencedColumnName: "id",
    },
  })
  taggedUsers: User[];

  @BeforeInsert()
  generateUlid() {
    this.id = ulid();
  }
}
