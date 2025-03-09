import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BaseEntity } from 'typeorm';
import { DuelAction } from './DuelAction';
import { Duel as DuelType } from '../types/types';

@Entity('duels', { schema: 'combat_schema' })
export class Duel extends BaseEntity implements DuelType {
    @PrimaryGeneratedColumn()
    id!: number;  

    @Column()
    challengerId!: string;


    @Column()
    opponentId!: string;

    @Column({default: 'active'})
    status!: 'active' | 'completed' | 'draw';

    @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    startedAt!: Date;

    @Column({type: 'timestamp', nullable: true})
    endedAt!: Date | null;

    @OneToMany(() => DuelAction, action => action.duel)
    actions!: DuelAction[];
}