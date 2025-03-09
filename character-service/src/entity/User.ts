import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany ,ManyToMany,JoinTable} from 'typeorm';
import { Character } from './Character';
import { Item } from './Item';


export enum UserRole {
    USER = 'User',
    GAME_MASTER = 'GameMaster'
}

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    username?: string;

    @Column()
    userId?: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER
    })
    role?: UserRole;

    @CreateDateColumn()
    createdAt!: Date;


    @OneToMany(() => Character, character => character.createdBy)
    characters?: Character[];

    @ManyToMany(() => Item)
        @JoinTable()
        items?: Item[];
}