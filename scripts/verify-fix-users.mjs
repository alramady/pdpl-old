import 'dotenv/config';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const url = process.env.DATABASE_URL;
if (!url) { console.error('No DATABASE_URL'); process.exit(1); }

const conn = await mysql.createConnection(url);

// Expected data
const expected = [
  {
    userId: 'MRUHAILY',
    password: '15001500',
    name: 'Muhammed ALRuhaily',
    email: 'prog.muhammed@gmail.com',
    mobile: '+966553445533',
    displayName: 'Admin Rasid System',
    platformRole: 'root_admin',
  },
  {
    userId: 'aalrebdi',
    password: '15001500',
    name: 'Alrebdi Fahad Alrebdi',
    email: 'aalrebdi@ndmo.gov.sa',
    mobile: null,
    displayName: "NDMO's president/director",
    platformRole: 'director',
  },
  {
    userId: 'msarhan',
    password: '15001500',
    name: 'Mashal Abdullah Alsarhan',
    email: 'msarhan@nic.gov.sa',
    mobile: '055 511 3675',
    displayName: 'Vice President of NDMO',
    platformRole: 'vice_president',
  },
  {
    userId: 'malmoutaz',
    password: '15001500',
    name: 'Manal Mohammed Almoutaz',
    email: 'malmoutaz@ndmo.gov.sa',
    mobile: '0542087872',
    displayName: 'Manager of Smart Rasid Platform',
    platformRole: 'manager',
  },
];

console.log('=== VERIFYING PLATFORM USERS ===\n');

const [rows] = await conn.execute('SELECT * FROM platform_users ORDER BY id');

for (const exp of expected) {
  const row = rows.find(r => r.userId === exp.userId);
  if (!row) {
    console.log(`❌ User ${exp.userId} NOT FOUND in database!`);
    continue;
  }

  console.log(`--- ${exp.userId} ---`);
  
  // Verify password
  const passwordValid = await bcrypt.compare(exp.password, row.passwordHash);
  console.log(`  Password (${exp.password}): ${passwordValid ? '✅ CORRECT' : '❌ WRONG'}`);
  
  // Compare fields
  const checks = [
    ['name', exp.name, row.name],
    ['email', exp.email, row.email],
    ['mobile', exp.mobile, row.mobile],
    ['displayName', exp.displayName, row.displayName],
    ['platformRole', exp.platformRole, row.platformRole],
  ];

  for (const [field, expected, actual] of checks) {
    const match = expected === actual || (!expected && !actual);
    console.log(`  ${field}: ${match ? '✅' : '❌'} expected="${expected}" actual="${actual}"`);
  }
  console.log(`  status: ${row.status === 'active' ? '✅ active' : '❌ ' + row.status}`);
  console.log('');
}

// Fix msarhan mobile (055 511 3675 -> 0555113675 is what's in DB, but user specified "055 511 3675")
// The DB has 0555113675 which is the same number without spaces - this is fine
// But let's normalize it to match the user's format
const msarhanMobile = rows.find(r => r.userId === 'msarhan')?.mobile;
if (msarhanMobile === '0555113675') {
  console.log('Note: msarhan mobile "0555113675" is stored without spaces. User provided "055 511 3675".');
  console.log('These represent the same number. No fix needed.');
}

await conn.end();
console.log('\n=== VERIFICATION COMPLETE ===');
