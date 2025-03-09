import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BaseEntity } from 'typeorm';
import { Duel } from './Duel';
import { DuelAction as DuelActionType } from '../types/types';

@Entity('duel_actions', { schema: 'combat_schema' })
export class DuelAction extends BaseEntity implements DuelActionType {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Duel)
    duel!: Duel;

    @Column()
    duelId!: number;

    @Column()
    characterId!: string;

    @Column()
    actionType!: 'attack' | 'cast' | 'heal';

    @Column({ type: 'timestamp' })
    executedAt!: Date;
}