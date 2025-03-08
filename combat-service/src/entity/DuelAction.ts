import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BaseEntity } from 'typeorm';
import { Duel } from './Duel';
import { DuelAction as DuelActionType } from '../types/types';

@Entity('duel_actions')
export class DuelAction extends BaseEntity implements DuelActionType {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Duel, duel => duel.actions)
    duel!: Duel;

    @Column()
    duelId!: number;

    @Column()
    characterId!: number;

    @Column()
    actionType!: 'attack' | 'cast' | 'heal';

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    executedAt!: Date;
}