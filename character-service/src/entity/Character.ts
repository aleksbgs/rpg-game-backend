import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { User } from './User';
import { Class } from './Class';
import { Item } from './Item';

@Entity()
export class Character {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({unique: true})
    name!: string;

    @Column({default: 100})
    health!: number;

    @Column({default: 50})
    mana!: number;

    @Column({default: 10})
    baseStrength!: number;

    @Column({default: 10})
    baseAgility!: number;

    @Column({default: 10})
    baseIntelligence!: number;

    @Column({default: 10})
    baseFaith!: number;
    @ManyToOne(() => Class)
    class!: Class;

    @ManyToMany(() => Item)
    @JoinTable()
    items!: Item[];

    @ManyToOne(() => User)
    createdBy!: User;

    @Column()
    createdAt!: Date;

    @Column()
    userId?: string;
}