import { Entity, PrimaryGeneratedColumn, Column,JoinTable,ManyToMany } from 'typeorm';
import { User } from './User';

@Entity()
export class Item {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    name!: string;

    @Column()
    description!: string;

    @Column({ default: 0 })
    bonusStrength!: number;

    @Column({ default: 0 })
    bonusAgility!: number;

    @Column({ default: 0 })
    bonusIntelligence!: number;

    @Column({ default: 0 })
    bonusFaith!: number;

    @ManyToMany(() => User)
    @JoinTable()
    users!: User[];

    @Column()
    userId?: string;
}
