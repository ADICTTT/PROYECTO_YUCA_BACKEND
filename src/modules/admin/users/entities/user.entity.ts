import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "../../roles/entities/role.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({unique: true})
    username: string;
    
    @Column({unique: true})
    email: string;
    
    @Column()
    password: string;

    @Column({default: true})
    isActive: boolean;

    @ManyToMany(() => Role, {eager: true})
    @JoinTable({
        name: 'user_roles',
        joinColumn: {name: 'user_id'},
        inverseJoinColumn: {name: 'role_id'}
    })
    roles: Role;
}
