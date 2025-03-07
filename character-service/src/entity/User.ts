import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany ,ManyToMany,JoinTable} from 'typeorm';
import { Character } from './Character';
import { Item } from './Item';

// UserRole enum to match Account Service requirements
export enum UserRole {
    USER = 'User',
    GAME_MASTER = 'GameMaster'
}

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    username!: string;

    @Column()
    password!: string; // In production, this should be hashed (e.g., with bcrypt)

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER
    })
    role!: UserRole;

    @CreateDateColumn()
    createdAt!: Date;

    // One-to-Many relationship with Character (users can own multiple characters)
    @OneToMany(() => Character, character => character.createdBy)
    characters!: Character[];

    @ManyToMany(() => Item)
        @JoinTable()
        items!: Item[];
}