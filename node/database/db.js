import { Sequelize } from "sequelize";

const db = new Sequelize("hic_db", "root", "Ibiza123", {
  host: "localhost",
  dialect: "mysql",
});

export default db;
