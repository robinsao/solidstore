import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity({ name: "files" })
export class File {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("character varying", { length: 128, nullable: false })
  name: string;

  @Column("enum", {
    default: "file",
    enum: ["file", "folder"],
    nullable: false,
    enumName: "filetype",
  })
  type: "file" | "folder";

  @Column("text", { nullable: false })
  ownerid: string;

  @Column("timestamp with time zone", { default: Date.now(), nullable: false })
  datecreated: Date;

  @Column("timestamp with time zone", { default: Date.now(), nullable: false })
  dateupdated: Date;

  @ManyToOne(() => File, (file) => file.id, {})
  @JoinColumn({ name: "parentfolderid" })
  parentfolder: File;
}
