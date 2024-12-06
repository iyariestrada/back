import { Sequelize } from "sequelize";

const db = new Sequelize("hic_db", "iyari", "", {
  host: "localhost",
  dialect: "mysql",
});

export default db;
