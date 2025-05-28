import { Sequelize } from "sequelize";

const db = new Sequelize("hic_db", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

export default db;
