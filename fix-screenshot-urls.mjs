import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const FRESH_URLS = [
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/DUTqBBIDdlwdZzAT.png",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/qkBsCitXKsXYcIgy.png",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/rIbfZmUipHMZaIwd.png",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/oCwEEjwAHZAUlSRM.png",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/HSzjbzjnsDQMEfPC.png",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/KTyIgdUrdWXAJvTY.png",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/BnJjKBqYLAMpewez.png",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/GAyrOsNOXrLIQFHN.png",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/RbEIZkUEDAxRkGgE.png",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/fhGQwgNiITawyhIx.png",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/bPgjwaferWOrsirS.png",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/bQWmgGwdohvrCmXq.png",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/mzOffRIDGMekmFlz.png",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/gMpvHnjdNVUTMfvK.png",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/XCKQzjkkBDkywhtp.png",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/ZLbxxdoejhreVHqi.png",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/knpKVXJFKYrfoQsh.png",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/GqDZlsVsMbckvBmz.png",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/XiYgMdRtcmlhcrIs.png",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/jrDUWfcVhPSXvlvl.png",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/FPLRqNzFGMnBxkCH.png",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/kIEvfrbdAoYwxPwP.png",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/JrHvlDUvEJafVehq.png",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/mniLLvIdXQwRtTDv.png",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/bUKlViuuuvJMRHKC.png",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/lPieCJqIcQMAIYTz.png",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/mfgCTYXEeLNVZoXA.png",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/ZuuycAJPJxozAYtg.png",
];

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  // Get all leaks
  const [leaks] = await conn.query('SELECT id, leakId, screenshotUrls FROM leaks');
  console.log(`Total leaks: ${leaks.length}`);
  
  let updated = 0;
  for (const leak of leaks) {
    // Pick 2-3 random fresh URLs for each leak
    const count = 2 + Math.floor(Math.random() * 2); // 2 or 3
    const shuffled = [...FRESH_URLS].sort(() => Math.random() - 0.5);
    const newUrls = shuffled.slice(0, count);
    
    await conn.query(
      'UPDATE leaks SET screenshotUrls = ? WHERE id = ?',
      [JSON.stringify(newUrls), leak.id]
    );
    updated++;
  }
  
  console.log(`Updated ${updated} leaks with fresh screenshot URLs`);
  
  // Also update evidence_chain metadata to use fresh URLs
  const [evidence] = await conn.query('SELECT id, metadata FROM evidence_chain WHERE metadata IS NOT NULL');
  console.log(`Evidence records with metadata: ${evidence.length}`);
  
  let evUpdated = 0;
  for (const ev of evidence) {
    try {
      let meta = typeof ev.metadata === 'string' ? JSON.parse(ev.metadata) : ev.metadata;
      if (!meta) continue;
      
      // Replace any old screenshot URLs in metadata
      let metaStr = JSON.stringify(meta);
      const oldUrlPattern = /https:\/\/files\.manuscdn\.com\/user_upload_by_module\/session_file\/\d+\/[A-Za-z0-9]+\.png/g;
      const oldUrls = metaStr.match(oldUrlPattern) || [];
      
      for (const oldUrl of oldUrls) {
        if (!FRESH_URLS.includes(oldUrl)) {
          const replacement = FRESH_URLS[Math.floor(Math.random() * FRESH_URLS.length)];
          metaStr = metaStr.replace(oldUrl, replacement);
        }
      }
      
      await conn.query('UPDATE evidence_chain SET metadata = ? WHERE id = ?', [metaStr, ev.id]);
      evUpdated++;
    } catch (e) {
      // skip
    }
  }
  
  console.log(`Updated ${evUpdated} evidence records with fresh URLs`);
  
  await conn.end();
  console.log('Done!');
}

main().catch(console.error);
