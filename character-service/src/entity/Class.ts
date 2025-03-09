import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Class {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    name!: string;

    @Column()
    description!: string;

    @Column()
    classId!: string;

    @Column()
    userId?: string;
}
