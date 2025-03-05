import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", unique: true })
    username!: string;

    @Column({ type: "varchar" })
    password!: string;

    @Column({ type: "enum", enum: ["User", "GameMaster"], default: "User" })
    role!: "User" | "GameMaster";
}
