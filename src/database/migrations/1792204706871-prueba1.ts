import { MigrationInterface, QueryRunner } from "typeorm";

export class Prueba11792204706871 implements MigrationInterface {
    name = 'Prueba11792204706871'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "participaciones" ADD "reglas_aceptadas_en" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "participaciones" ADD "reglas_version" integer`);
        await queryRunner.query(`ALTER TABLE "reservas" ADD "codigo" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "reservas" ADD CONSTRAINT "UQ_f1168a0adfa9811118846cc8fb5" UNIQUE ("codigo")`);
        await queryRunner.query(`ALTER TABLE "reservas" ADD "pagado_en" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "reservas" ADD "pagado_por" integer`);
        await queryRunner.query(`ALTER TABLE "reservas" ADD "motivo_liberacion" character varying(200)`);
        await queryRunner.query(`ALTER TABLE "eventos" ADD "seleccion_abre_en" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "eventos" ADD "horas_pago" integer NOT NULL DEFAULT '24'`);
        await queryRunner.query(`ALTER TABLE "eventos" ADD "reglas_texto" text`);
        await queryRunner.query(`ALTER TABLE "eventos" ADD "reglas_version" integer NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE "reservas" DROP COLUMN "reservado_en"`);
        await queryRunner.query(`ALTER TABLE "reservas" ADD "reservado_en" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "reservas" DROP COLUMN "vence_en"`);
        await queryRunner.query(`ALTER TABLE "reservas" ADD "vence_en" TIMESTAMP WITH TIME ZONE NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reservas" DROP COLUMN "vence_en"`);
        await queryRunner.query(`ALTER TABLE "reservas" ADD "vence_en" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "reservas" DROP COLUMN "reservado_en"`);
        await queryRunner.query(`ALTER TABLE "reservas" ADD "reservado_en" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "eventos" DROP COLUMN "reglas_version"`);
        await queryRunner.query(`ALTER TABLE "eventos" DROP COLUMN "reglas_texto"`);
        await queryRunner.query(`ALTER TABLE "eventos" DROP COLUMN "horas_pago"`);
        await queryRunner.query(`ALTER TABLE "eventos" DROP COLUMN "seleccion_abre_en"`);
        await queryRunner.query(`ALTER TABLE "reservas" DROP COLUMN "motivo_liberacion"`);
        await queryRunner.query(`ALTER TABLE "reservas" DROP COLUMN "pagado_por"`);
        await queryRunner.query(`ALTER TABLE "reservas" DROP COLUMN "pagado_en"`);
        await queryRunner.query(`ALTER TABLE "reservas" DROP CONSTRAINT "UQ_f1168a0adfa9811118846cc8fb5"`);
        await queryRunner.query(`ALTER TABLE "reservas" DROP COLUMN "codigo"`);
        await queryRunner.query(`ALTER TABLE "participaciones" DROP COLUMN "reglas_version"`);
        await queryRunner.query(`ALTER TABLE "participaciones" DROP COLUMN "reglas_aceptadas_en"`);
    }

}
