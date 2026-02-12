import 'dotenv/config';
import mysql from 'mysql2/promise';

const url = process.env.DATABASE_URL;
if (!url) { console.error('No DATABASE_URL'); process.exit(1); }

const conn = await mysql.createConnection(url);

console.log('=== PLATFORM USERS ===');
const [rows] = await conn.execute('SELECT id, userId, name, email, mobile, displayName, platformRole, status, lastLoginAt, createdAt FROM platform_users ORDER BY id');
for (const row of rows) {
  console.log(`\n--- User #${row.id} ---`);
  console.log(`  userId:       ${row.userId}`);
  console.log(`  name:         ${row.name}`);
  console.log(`  email:        ${row.email || 'N/A'}`);
  console.log(`  mobile:       ${row.mobile || 'N/A'}`);
  console.log(`  displayName:  ${row.displayName}`);
  console.log(`  platformRole: ${row.platformRole}`);
  console.log(`  status:       ${row.status}`);
  console.log(`  lastLoginAt:  ${row.lastLoginAt || 'Never'}`);
  console.log(`  createdAt:    ${row.createdAt}`);
}
console.log(`\nTotal platform users: ${rows.length}`);

console.log('\n=== OAUTH USERS ===');
const [oauthRows] = await conn.execute('SELECT id, openId, userId, name, displayName, email, mobile, role, ndmoRole, loginMethod, isActive FROM users ORDER BY id');
for (const row of oauthRows) {
  console.log(`\n--- User #${row.id} ---`);
  console.log(`  openId:       ${row.openId}`);
  console.log(`  userId:       ${row.userId || 'N/A'}`);
  console.log(`  name:         ${row.name}`);
  console.log(`  displayName:  ${row.displayName || 'N/A'}`);
  console.log(`  email:        ${row.email || 'N/A'}`);
  console.log(`  mobile:       ${row.mobile || 'N/A'}`);
  console.log(`  role:         ${row.role}`);
  console.log(`  ndmoRole:     ${row.ndmoRole}`);
  console.log(`  loginMethod:  ${row.loginMethod || 'N/A'}`);
  console.log(`  isActive:     ${row.isActive}`);
}
console.log(`\nTotal OAuth users: ${oauthRows.length}`);

await conn.end();
