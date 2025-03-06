import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Class {
    @PrimaryGeneratedColumn('uuid') id!: string;
    @Column({ unique: true }) name!: string;
    @Column() description!: string;
}