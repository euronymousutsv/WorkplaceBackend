import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function connect() {
  try {
    await client.connect();
    console.log('Connected to the database');
    const res = await client.query('SELECT $1::text as message', ['Hello, world!']);
    console.log(res.rows[0].message);
    await client.end();
  } catch (err) {
    console.error('Error connecting to the database', err);
  }
}

connect();