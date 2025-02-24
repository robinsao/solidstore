import { EntityManager } from "typeorm";
import { dataSource } from "./db-data-source";

const db: {
  open: () => Promise<void>;
  entityManager: EntityManager;
  close: () => Promise<void>;
} = {
  entityManager: null,
  open: openDb,
  close: null,
};

async function openDb() {
  await dataSource.initialize();
  db.entityManager = dataSource.manager;
  db.close = async () => {
    dataSource.destroy();
  };
}

export default db;
