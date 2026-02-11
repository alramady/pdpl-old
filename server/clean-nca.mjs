import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);

function cleanNCA(val) {
  if (!val) return val;
  let s = typeof val === 'string' ? val : JSON.stringify(val);
  s = s.replace(/NCA/g, 'NDMO');
  s = s.replace(/الهيئة الوطنية للأمن السيبراني/g, 'مكتب إدارة البيانات الوطنية');
  s = s.replace(/هيئة الأمن السيبراني/g, 'مكتب إدارة البيانات الوطنية');
  s = s.replace(/الهيئة السعودية للبيانات والذكاء الاصطناعي/g, 'مكتب إدارة البيانات الوطنية');
  s = s.replace(/SDAIA/g, 'NDMO');
  s = s.replace(/إبلاغ NDMO فوراً/g, 'معالجة فورية مطلوبة');
  s = s.replace(/إبلاغ NDMO/g, 'رصد ومتابعة');
  s = s.replace(/إخطار NDMO/g, 'رصد ومتابعة');
  return s;
}

async function cleanTable(tableName, textCols) {
  console.log(`=== Cleaning ${tableName} ===`);
  const selectCols = ['id', ...textCols].join(', ');
  const [rows] = await conn.query(`SELECT ${selectCols} FROM ${tableName}`);
  let count = 0;
  for (const r of rows) {
    let needsUpdate = false;
    const updates = {};
    for (const f of textCols) {
      if (r[f]) {
        const s = typeof r[f] === 'string' ? r[f] : JSON.stringify(r[f]);
        if (s.includes('NCA') || s.includes('الهيئة الوطنية') || s.includes('SDAIA') || s.includes('هيئة الأمن') || s.includes('هيئة البيانات')) {
          const cleaned = cleanNCA(r[f]);
          updates[f] = typeof r[f] === 'object' ? JSON.stringify(typeof cleaned === 'string' ? JSON.parse(cleaned) : cleaned) : cleaned;
          needsUpdate = true;
        }
      }
    }
    if (needsUpdate) {
      const setClauses = Object.keys(updates).map(k => `\`${k}\`=?`).join(', ');
      const values = [...Object.values(updates), r.id];
      await conn.query(`UPDATE \`${tableName}\` SET ${setClauses} WHERE id=?`, values);
      count++;
    }
  }
  console.log(`Updated ${count} rows in ${tableName}`);
  return count;
}

// Clean all tables with their correct column names
await cleanTable('leaks', ['aiSummary', 'aiSummaryAr', 'aiRecommendations', 'aiRecommendationsAr', 'description', 'descriptionAr']);
await cleanTable('reports', ['title', 'titleAr']);
await cleanTable('notifications', ['notifTitle', 'notifTitleAr', 'notifMessage', 'notifMessageAr']);
await cleanTable('evidence_chain', ['evidenceMetadata']);
await cleanTable('threat_rules', ['ruleName', 'ruleNameAr', 'ruleDescription', 'ruleDescriptionAr']);
await cleanTable('audit_log', ['details']);

// Final verification
console.log('\n=== Final Verification ===');
const checks = [
  { table: 'leaks', cols: ['aiSummary', 'aiSummaryAr', 'aiRecommendations', 'aiRecommendationsAr', 'description', 'descriptionAr'] },
  { table: 'reports', cols: ['title', 'titleAr'] },
  { table: 'notifications', cols: ['notifTitle', 'notifTitleAr', 'notifMessage', 'notifMessageAr'] },
  { table: 'evidence_chain', cols: ['evidenceMetadata'] },
  { table: 'threat_rules', cols: ['ruleName', 'ruleNameAr', 'ruleDescription', 'ruleDescriptionAr'] },
  { table: 'audit_log', cols: ['details'] },
];
for (const { table, cols } of checks) {
  const conditions = cols.map(c => `\`${c}\` LIKE '%NCA%' OR \`${c}\` LIKE '%الهيئة الوطنية للأمن السيبراني%' OR \`${c}\` LIKE '%SDAIA%'`).join(' OR ');
  const [rows] = await conn.query(`SELECT COUNT(*) as cnt FROM \`${table}\` WHERE ${conditions}`);
  console.log(`${table}: ${rows[0].cnt} remaining references`);
}

await conn.end();
console.log('\nDone! All external agency references cleaned.');
