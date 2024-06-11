import {
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
} from "typeorm";
import { User } from "./User";

export abstract class BaseEntity {
  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @DeleteDateColumn({ type: "timestamp", nullable: true })
  deleted_at?: Date;

  @Column({ type: "int", nullable: true })
  created_by?: User;

  @Column({ type: "int", nullable: true })
  updated_by?: User;

  @Column({ type: "boolean", default: true })
  is_active: boolean;
}
