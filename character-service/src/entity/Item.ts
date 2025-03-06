import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Item {
    @PrimaryGeneratedColumn('uuid') id!: string;
    @Column() name!: string;
    @Column() description!: string;
    @Column({ default: 0 }) bonusStrength!: number;
    @Column({ default: 0 }) bonusAgility!: number;
    @Column({ default: 0 }) bonusIntelligence!: number;
    @Column({ default: 0 }) bonusFaith!: number;
}