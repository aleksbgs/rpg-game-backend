import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BaseEntity } from 'typeorm';
import { Duel } from './Duel';

@Entity('duel_actions')
export class DuelAction extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Duel, duel => duel.actions)
    duel!: Duel;

    @Column()
    characterId!: number;

    @Column()
    actionType!: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    executedAt!: Date;
}