import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1791809625752 implements MigrationInterface {
    name = 'Migration1791809625752'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "redes_sociales" ("id" SERIAL NOT NULL, "perfil_id" integer NOT NULL, "plataforma" character varying(50) NOT NULL, "url" character varying(255) NOT NULL, CONSTRAINT "PK_2bebddb6cde0c98300885988616" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."reserva_participantes_tipo_enum" AS ENUM('TITULAR', 'COMPANERO')`);
        await queryRunner.query(`CREATE TABLE "reserva_participantes" ("id" SERIAL NOT NULL, "reserva_id" integer NOT NULL, "perfil_id" integer NOT NULL, "tipo" "public"."reserva_participantes_tipo_enum" NOT NULL, CONSTRAINT "UQ_57d4f0abb4de94da436939147fc" UNIQUE ("reserva_id", "perfil_id"), CONSTRAINT "PK_603f4d4f53958611a3b9bd79256" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "roles" ("id" SERIAL NOT NULL, "nombre" character varying(30) NOT NULL, CONSTRAINT "UQ_a5be7aa67e759e347b1c6464e10" UNIQUE ("nombre"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "usuarios" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nombreUsuario" character varying(100) NOT NULL, "email" character varying(150) NOT NULL, "password" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "rolId" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_b948c9bc89671151c8ab12d409d" UNIQUE ("nombreUsuario"), CONSTRAINT "UQ_446adfc18b35418aac32ae0b7b5" UNIQUE ("email"), CONSTRAINT "PK_d7281c63c176e152e4c531594a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."perfiles_categoria_enum" AS ENUM('ILUSTRADORES', 'EMPRENDEDORES', 'COMIDA')`);
        await queryRunner.query(`CREATE TYPE "public"."perfiles_estado_enum" AS ENUM('EN_REVISION', 'APROBADO', 'RECHAZADO')`);
        await queryRunner.query(`CREATE TABLE "perfiles" ("id" SERIAL NOT NULL, "nombre_real" character varying(120) NOT NULL, "celular" character varying(20) NOT NULL, "nombre_comercial" character varying(120) NOT NULL, "categoria" "public"."perfiles_categoria_enum" NOT NULL, "instagram" character varying(150) NOT NULL, "descripcion" text, "portafolio_url" character varying(255), "foto_url" character varying(255), "estado" "public"."perfiles_estado_enum" NOT NULL DEFAULT 'EN_REVISION', "usuario_id" uuid, CONSTRAINT "UQ_f1ba88813b103ae277538c3fdd8" UNIQUE ("usuario_id"), CONSTRAINT "REL_f1ba88813b103ae277538c3fdd" UNIQUE ("usuario_id"), CONSTRAINT "PK_50d8a0a9bdea75489c5f230ce27" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."participaciones_estado_enum" AS ENUM('PENDIENTE', 'APROBADA', 'RECHAZADA')`);
        await queryRunner.query(`CREATE TABLE "participaciones" ("id" SERIAL NOT NULL, "perfil_id" integer NOT NULL, "evento_id" integer NOT NULL, "estado" "public"."participaciones_estado_enum" NOT NULL DEFAULT 'PENDIENTE', "permite_companero" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_6f8c60c177fcfb1f713813ad282" UNIQUE ("perfil_id", "evento_id"), CONSTRAINT "PK_ca27c8f51edaec5a8a341698e93" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."reservas_estado_enum" AS ENUM('PENDIENTE_PAGO', 'CONFIRMADA', 'VENCIDA', 'CANCELADA')`);
        await queryRunner.query(`CREATE TABLE "reservas" ("id" SERIAL NOT NULL, "participacion_id" integer NOT NULL, "stand_id" integer NOT NULL, "precio_acordado" numeric(10,2) NOT NULL, "estado" "public"."reservas_estado_enum" NOT NULL DEFAULT 'PENDIENTE_PAGO', "reservado_en" TIMESTAMP NOT NULL DEFAULT now(), "vence_en" TIMESTAMP NOT NULL, CONSTRAINT "PK_309c659053bcf5e56f8e40a2b42" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "idx_stand_reserva_activa" ON "reservas"  ("stand_id") WHERE "estado" IN ('PENDIENTE_PAGO', 'CONFIRMADA')`);
        await queryRunner.query(`CREATE UNIQUE INDEX "idx_participacion_reserva_activa" ON "reservas"  ("participacion_id") WHERE "estado" IN ('PENDIENTE_PAGO', 'CONFIRMADA')`);
        await queryRunner.query(`CREATE TABLE "sectores" ("id" SERIAL NOT NULL, "piso_id" integer NOT NULL, "nombre" character varying(80) NOT NULL, CONSTRAINT "PK_e4690b445beae51b850640e7d9d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."stands_estado_enum" AS ENUM('DISPONIBLE', 'DESHABILITADO')`);
        await queryRunner.query(`CREATE TYPE "public"."stands_categoria_enum" AS ENUM('ILUSTRADORES', 'EMPRENDEDORES', 'COMIDA')`);
        await queryRunner.query(`CREATE TABLE "stands" ("id" SERIAL NOT NULL, "piso_id" integer NOT NULL, "sector_id" integer, "codigo" character varying(30) NOT NULL, "precio" numeric(10,2) NOT NULL, "posicion_x" numeric(10,2) NOT NULL DEFAULT '0', "posicion_y" numeric(10,2) NOT NULL DEFAULT '0', "ancho" numeric(10,2) NOT NULL, "alto" numeric(10,2) NOT NULL, "rotacion" integer NOT NULL DEFAULT '0', "estado" "public"."stands_estado_enum" NOT NULL DEFAULT 'DISPONIBLE', "categoria" "public"."stands_categoria_enum" NOT NULL DEFAULT 'ILUSTRADORES', CONSTRAINT "UQ_8f6626f848d7ece2bbe09c1f676" UNIQUE ("piso_id", "codigo"), CONSTRAINT "PK_6aba2e4805d7572165a079ef621" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "pisos" ("id" SERIAL NOT NULL, "evento_id" integer NOT NULL, "nombre" character varying(80) NOT NULL, "orden" integer NOT NULL, CONSTRAINT "UQ_dac587cbfee17143167c2b27afd" UNIQUE ("evento_id", "orden"), CONSTRAINT "PK_6f6f2f8eb0fe6fab3612a24ea67" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."eventos_estado_enum" AS ENUM('BORRADOR', 'PUBLICADO', 'INSCRIPCIONES_ABIERTAS', 'INSCRIPCIONES_CERRADAS', 'EN_CURSO', 'FINALIZADO', 'CANCELADO')`);
        await queryRunner.query(`CREATE TABLE "eventos" ("id" SERIAL NOT NULL, "nombre" character varying(150) NOT NULL, "descripcion" text, "portada" character varying(255), "ubicacion" character varying(200) NOT NULL, "fecha_inicio" date NOT NULL, "fecha_fin" date NOT NULL, "inscripciones_inicio" TIMESTAMP, "inscripciones_fin" TIMESTAMP, "whatsapp_canal" character varying(255), "whatsapp_pagos" character varying(30), "estado" "public"."eventos_estado_enum" NOT NULL DEFAULT 'BORRADOR', CONSTRAINT "PK_40d4a3c6a4bfd24280cb97a509e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."eventos_categorias_categoria_enum" AS ENUM('ILUSTRADORES', 'EMPRENDEDORES', 'COMIDA')`);
        await queryRunner.query(`CREATE TABLE "eventos_categorias" ("evento_id" integer NOT NULL, "categoria" "public"."eventos_categorias_categoria_enum" NOT NULL, CONSTRAINT "PK_8fe38b765bccce7e3990976106d" PRIMARY KEY ("evento_id", "categoria"))`);
        await queryRunner.query(`ALTER TABLE "redes_sociales" ADD CONSTRAINT "FK_69f0ddcd2e0d33844234e5b0658" FOREIGN KEY ("perfil_id") REFERENCES "perfiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reserva_participantes" ADD CONSTRAINT "FK_257b88a52f0fdcd428c1ed9c8ae" FOREIGN KEY ("reserva_id") REFERENCES "reservas"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reserva_participantes" ADD CONSTRAINT "FK_9b776532885b721e60459321c0f" FOREIGN KEY ("perfil_id") REFERENCES "perfiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "usuarios" ADD CONSTRAINT "FK_df0c94be5a01a546bf1b9ca12ae" FOREIGN KEY ("rolId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "perfiles" ADD CONSTRAINT "FK_f1ba88813b103ae277538c3fdd8" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "participaciones" ADD CONSTRAINT "FK_432c6911a35ea4467d053a145b9" FOREIGN KEY ("perfil_id") REFERENCES "perfiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "participaciones" ADD CONSTRAINT "FK_3e0e894f1ae4cd5211a1bb6228a" FOREIGN KEY ("evento_id") REFERENCES "eventos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservas" ADD CONSTRAINT "FK_a95aff48422abee9c04dbbf8862" FOREIGN KEY ("participacion_id") REFERENCES "participaciones"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservas" ADD CONSTRAINT "FK_dd3245cb79dc852041e038f43f0" FOREIGN KEY ("stand_id") REFERENCES "stands"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sectores" ADD CONSTRAINT "FK_14cceb88e3a7958d863c523179e" FOREIGN KEY ("piso_id") REFERENCES "pisos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stands" ADD CONSTRAINT "FK_0a8572959a6c412198ae36d370b" FOREIGN KEY ("piso_id") REFERENCES "pisos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stands" ADD CONSTRAINT "FK_107665cff105f04b8dcaed87994" FOREIGN KEY ("sector_id") REFERENCES "sectores"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pisos" ADD CONSTRAINT "FK_0aed2eb0f54162a98259232c608" FOREIGN KEY ("evento_id") REFERENCES "eventos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "eventos_categorias" ADD CONSTRAINT "FK_66013ef7cb8089b21152cb60d6c" FOREIGN KEY ("evento_id") REFERENCES "eventos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "eventos_categorias" DROP CONSTRAINT "FK_66013ef7cb8089b21152cb60d6c"`);
        await queryRunner.query(`ALTER TABLE "pisos" DROP CONSTRAINT "FK_0aed2eb0f54162a98259232c608"`);
        await queryRunner.query(`ALTER TABLE "stands" DROP CONSTRAINT "FK_107665cff105f04b8dcaed87994"`);
        await queryRunner.query(`ALTER TABLE "stands" DROP CONSTRAINT "FK_0a8572959a6c412198ae36d370b"`);
        await queryRunner.query(`ALTER TABLE "sectores" DROP CONSTRAINT "FK_14cceb88e3a7958d863c523179e"`);
        await queryRunner.query(`ALTER TABLE "reservas" DROP CONSTRAINT "FK_dd3245cb79dc852041e038f43f0"`);
        await queryRunner.query(`ALTER TABLE "reservas" DROP CONSTRAINT "FK_a95aff48422abee9c04dbbf8862"`);
        await queryRunner.query(`ALTER TABLE "participaciones" DROP CONSTRAINT "FK_3e0e894f1ae4cd5211a1bb6228a"`);
        await queryRunner.query(`ALTER TABLE "participaciones" DROP CONSTRAINT "FK_432c6911a35ea4467d053a145b9"`);
        await queryRunner.query(`ALTER TABLE "perfiles" DROP CONSTRAINT "FK_f1ba88813b103ae277538c3fdd8"`);
        await queryRunner.query(`ALTER TABLE "usuarios" DROP CONSTRAINT "FK_df0c94be5a01a546bf1b9ca12ae"`);
        await queryRunner.query(`ALTER TABLE "reserva_participantes" DROP CONSTRAINT "FK_9b776532885b721e60459321c0f"`);
        await queryRunner.query(`ALTER TABLE "reserva_participantes" DROP CONSTRAINT "FK_257b88a52f0fdcd428c1ed9c8ae"`);
        await queryRunner.query(`ALTER TABLE "redes_sociales" DROP CONSTRAINT "FK_69f0ddcd2e0d33844234e5b0658"`);
        await queryRunner.query(`DROP TABLE "eventos_categorias"`);
        await queryRunner.query(`DROP TYPE "public"."eventos_categorias_categoria_enum"`);
        await queryRunner.query(`DROP TABLE "eventos"`);
        await queryRunner.query(`DROP TYPE "public"."eventos_estado_enum"`);
        await queryRunner.query(`DROP TABLE "pisos"`);
        await queryRunner.query(`DROP TABLE "stands"`);
        await queryRunner.query(`DROP TYPE "public"."stands_categoria_enum"`);
        await queryRunner.query(`DROP TYPE "public"."stands_estado_enum"`);
        await queryRunner.query(`DROP TABLE "sectores"`);
        await queryRunner.query(`DROP INDEX "public"."idx_participacion_reserva_activa"`);
        await queryRunner.query(`DROP INDEX "public"."idx_stand_reserva_activa"`);
        await queryRunner.query(`DROP TABLE "reservas"`);
        await queryRunner.query(`DROP TYPE "public"."reservas_estado_enum"`);
        await queryRunner.query(`DROP TABLE "participaciones"`);
        await queryRunner.query(`DROP TYPE "public"."participaciones_estado_enum"`);
        await queryRunner.query(`DROP TABLE "perfiles"`);
        await queryRunner.query(`DROP TYPE "public"."perfiles_estado_enum"`);
        await queryRunner.query(`DROP TYPE "public"."perfiles_categoria_enum"`);
        await queryRunner.query(`DROP TABLE "usuarios"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TABLE "reserva_participantes"`);
        await queryRunner.query(`DROP TYPE "public"."reserva_participantes_tipo_enum"`);
        await queryRunner.query(`DROP TABLE "redes_sociales"`);
    }

}
