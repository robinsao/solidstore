import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1740017214806 implements MigrationInterface {
  name = "Init1740017214806";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE filetype AS ENUM('file', 'folder');`);

    await queryRunner.query(`CREATE TABLE files (
        id uuid DEFAULT gen_random_uuid() NOT NULL,
        name character varying(128) NOT NULL,
        type filetype DEFAULT 'file'::filetype NOT NULL,
        ownerid text NOT NULL,
        datecreated timestamp(6) with time zone DEFAULT now() NOT NULL,
        dateupdated timestamp(6) with time zone DEFAULT now() NOT NULL,
        parentfolderid uuid,
        PRIMARY KEY (id),
        CONSTRAINT files_parentfolderid_fkey_cascade FOREIGN KEY (parentfolderid) REFERENCES files(id) ON DELETE CASCADE
    );`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE files;`);

    await queryRunner.query(`DROP TYPE filetype;`);
  }
}
