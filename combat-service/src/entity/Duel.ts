import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BaseEntity } from 'typeorm';
import { DuelAction } from './DuelAction';

@Entity('duels')
export class Duel extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    challengerId!: number;

    @Column()
    opponentId!: number;

    @Column({ default: 'active' })
    status!: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    startedAt!: Date;

    @Column({ type: 'timestamp', nullable: true })
    endedAt!: Date;

    @OneToMany(() => DuelAction, action => action.duel)
    actions!: DuelAction[];
}
