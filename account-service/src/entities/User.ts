import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';


export enum UserRole {
    USER = 'User',
    GAME_MASTER = 'GameMaster'
}

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true })
    username!: string;

    @Column()
    password!: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER
    })
    role!: UserRole;

    @CreateDateColumn()
    createdAt!: Date;


    async hashPassword(): Promise<void> {
        this.password = await bcrypt.hash(this.password, 10);
    }

    async comparePassword(candidatePassword: string): Promise<boolean> {
        return bcrypt.compare(candidatePassword, this.password);
    }
}