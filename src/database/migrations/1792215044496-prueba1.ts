import { MigrationInterface, QueryRunner } from "typeorm";

export class Prueba11792215044496 implements MigrationInterface {
    name = 'Prueba11792215044496'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stands" ADD "medidas" character varying(60)`);
        await queryRunner.query(`ALTER TABLE "stands" ADD "sillas" integer`);
        await queryRunner.query(`ALTER TABLE "stands" ADD "incluye_merienda" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "stands" ADD "bajo_techo" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "stands" ADD "descripcion" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stands" DROP COLUMN "descripcion"`);
        await queryRunner.query(`ALTER TABLE "stands" DROP COLUMN "bajo_techo"`);
        await queryRunner.query(`ALTER TABLE "stands" DROP COLUMN "incluye_merienda"`);
        await queryRunner.query(`ALTER TABLE "stands" DROP COLUMN "sillas"`);
        await queryRunner.query(`ALTER TABLE "stands" DROP COLUMN "medidas"`);
    }

}
