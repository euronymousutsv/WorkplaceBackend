
import dotenv from "dotenv";
import { Sequelize } from "sequelize";
dotenv.config();
const user_name= process.env.DB_USER
  const password= process.env.DB_PASSWORD
  const database_name= process.env.DB_NAME

const sequelize = new Sequelize(
  database_name as string,
  user_name as string,
  password as string,
  {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  dialect:"postgres",
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Allow self-signed SSL
    },
  },
  schema: "workplacedb",
  
  
});

const dbConnect = async () =>{
  try{ await sequelize.authenticate();
    console.log("Connected to the database successfully");
  }
  catch(err){
    console.error("Failed to connect to the database:", err)
  }
}

export default sequelize;
export{dbConnect};