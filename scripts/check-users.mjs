import 'dotenv/config';
import mysql from 'mysql2/promise';

const url = process.env.DATABASE_URL;
if (!url) { console.error('No DATABASE_URL'); process.exit(1); }

const conn = await mysql.createConnection(url);
const [rows] = await conn.execute('SELECT id, openId, name, email, loginMethod, role, ndmoRole, createdAt FROM users ORDER BY id');
console.log('=== USERS IN DATABASE ===');
console.log(JSON.stringify(rows, null, 2));
console.log(`Total users: ${rows.length}`);

// Also check if there are user_profiles or similar tables
const [tables] = await conn.execute("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND (TABLE_NAME LIKE '%user%' OR TABLE_NAME LIKE '%profile%' OR TABLE_NAME LIKE '%member%')");
console.log('\n=== RELATED TABLES ===');
console.log(JSON.stringify(tables, null, 2));

await conn.end();
