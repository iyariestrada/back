import { Sequelize } from "sequelize";

const db = new Sequelize("hic_v2", "iyari", "", {
  host: "localhost",
  dialect: "mysql",
});

export default db;
