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

const urlPattern = /https:\/\/files\.manuscdn\.com\/user_upload_by_module\/session_file\/\d+\/[A-Za-z0-9]+\.png/g;

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  // Fix evidence_chain metadata
  const [evidence] = await conn.query('SELECT id, evidenceMetadata FROM evidence_chain WHERE evidenceMetadata IS NOT NULL');
  console.log(`Evidence records with metadata: ${evidence.length}`);
  
  let updated = 0;
  for (const ev of evidence) {
    try {
      let meta = typeof ev.evidenceMetadata === 'string' ? JSON.parse(ev.evidenceMetadata) : ev.evidenceMetadata;
      if (meta === null || meta === undefined) continue;
      
      let metaStr = JSON.stringify(meta);
      const matches = metaStr.match(urlPattern) || [];
      if (matches.length === 0) continue;
      
      let changed = false;
      for (const m of matches) {
        if (FRESH_URLS.indexOf(m) === -1) {
          const replacement = FRESH_URLS[Math.floor(Math.random() * FRESH_URLS.length)];
          metaStr = metaStr.replace(m, replacement);
          changed = true;
        }
      }
      
      if (changed) {
        await conn.query('UPDATE evidence_chain SET evidenceMetadata = ? WHERE id = ?', [metaStr, ev.id]);
        updated++;
      }
    } catch (e) {
      // skip
    }
  }
  
  console.log(`Updated ${updated} evidence records with fresh URLs`);
  
  // Verify a new leak's screenshots
  const [check] = await conn.query('SELECT leakId, screenshotUrls FROM leaks WHERE leakId LIKE "LK-2026-%" LIMIT 3');
  for (const r of check) {
    const urls = r.screenshotUrls;
    console.log(`${r.leakId}: ${JSON.stringify(urls).substring(0, 150)}`);
  }
  
  await conn.end();
  console.log('Done!');
}

main().catch(console.error);
