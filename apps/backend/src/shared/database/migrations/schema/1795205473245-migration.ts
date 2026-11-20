import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1795205473245 implements MigrationInterface {
    name = 'Migration1795205473245'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."oauth_provider" AS ENUM('google', 'facebook', 'telegram')`);
        await queryRunner.query(`CREATE TABLE "oauth_account" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "provider" "public"."oauth_provider" NOT NULL, "providerUserId" character varying(255) NOT NULL, "userId" uuid NOT NULL, "email" character varying(254), CONSTRAINT "PK_01ec7d2a8273dcaaed3dd10a4fb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a9124d5956d6244b17bdd67f92" ON "oauth_account" ("userId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e482e23febb23aeb59609c6c78" ON "oauth_account" ("provider", "providerUserId") `);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "email" character varying(254), "emailVerified" boolean NOT NULL DEFAULT false, "passwordHash" character varying, "name" character varying(120) NOT NULL, "avatarUrl" character varying(2048), "lastLoginAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_user_email" ON "user" ("email") WHERE "email" IS NOT NULL`);
        await queryRunner.query(`CREATE TABLE "login_session" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid NOT NULL, "refreshTokenHash" character(64) NOT NULL, "previousRefreshTokenHash" character(64), "rotatedAt" TIMESTAMP WITH TIME ZONE, "userAgent" character varying(512), "ipAddress" character varying(64), "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "revokedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_705d252226d51c48c6368d52855" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3949f3e2e6cbec363b5aae404f" ON "login_session" ("userId", "revokedAt") `);
        await queryRunner.query(`ALTER TABLE "oauth_account" ADD CONSTRAINT "FK_a9124d5956d6244b17bdd67f92b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "login_session" ADD CONSTRAINT "FK_98763f1bce75d5b823896f5adad" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "login_session" DROP CONSTRAINT "FK_98763f1bce75d5b823896f5adad"`);
        await queryRunner.query(`ALTER TABLE "oauth_account" DROP CONSTRAINT "FK_a9124d5956d6244b17bdd67f92b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3949f3e2e6cbec363b5aae404f"`);
        await queryRunner.query(`DROP TABLE "login_session"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_user_email"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e482e23febb23aeb59609c6c78"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a9124d5956d6244b17bdd67f92"`);
        await queryRunner.query(`DROP TABLE "oauth_account"`);
        await queryRunner.query(`DROP TYPE "public"."oauth_provider"`);
    }

}
