// api/test.js
import pkg from 'pg';
const { Client } = pkg;

export default async function handler(req, res) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL, // prende il DATABASE_URL da Vercel
  });

  try {
    await client.connect();
    const result = await client.query('SELECT NOW()'); // chiede l'orario al database
    await client.end();
    res.status(200).json({ success: true, time: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
