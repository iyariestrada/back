import { Sequelize } from "sequelize";

const db = new Sequelize("hic", "iyari", "", {
  host: "localhost",
  dialect: "mysql",
});

export default db;
