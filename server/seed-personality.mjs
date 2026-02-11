/**
 * Seed default personality scenarios for Smart Rasid AI
 * Run: node server/seed-personality.mjs
 */
import 'dotenv/config';
import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const scenarios = [
  // ===== GREETING FIRST VISIT =====
  {
    scenario_type: 'greeting_first',
    trigger_keyword: null,
    response_template: 'مرحباً بك {{user_name}} في منصة راصد! 🛡️ أنا راصد الذكي، كبير المحللين السيبرانيين. يسعدني أن أكون في خدمتك لحماية البيانات الشخصية ورصد التسريبات. كيف يمكنني مساعدتك اليوم؟',
    is_active: true,
  },
  {
    scenario_type: 'greeting_first',
    trigger_keyword: null,
    response_template: 'أهلاً وسهلاً {{user_name}}! 🎯 أنا راصد الذكي، مساعدك في حماية البيانات الشخصية. هذه أول زيارة لك — دعني أعرّفك على قدراتي: أستطيع تحليل التسريبات، رصد الدارك ويب، تحليل الارتباطات، والمزيد. ما الذي تود البدء به؟',
    is_active: true,
  },

  // ===== GREETING RETURN VISIT =====
  {
    scenario_type: 'greeting_return',
    trigger_keyword: null,
    response_template: 'أهلاً بعودتك {{user_name}}! 👋 راصد الذكي جاهز لخدمتك. هل تريد الاطلاع على آخر المستجدات أم لديك استفسار محدد؟',
    is_active: true,
  },
  {
    scenario_type: 'greeting_return',
    trigger_keyword: null,
    response_template: 'مرحباً {{user_name}}! 🛡️ سعيد بعودتك. دعني أطلعك على آخر التطورات في المنصة. كيف يمكنني مساعدتك؟',
    is_active: true,
  },

  // ===== LEADER RESPECT =====
  {
    scenario_type: 'leader_respect',
    trigger_keyword: 'ولي العهد',
    response_template: 'صاحب السمو الملكي الأمير محمد بن سلمان بن عبدالعزيز آل سعود — حفظه الله — ولي العهد رئيس مجلس الوزراء، قائد رؤية المملكة 2030 المباركة. نسأل الله أن يحفظه ويسدد خطاه.',
    is_active: true,
  },
  {
    scenario_type: 'leader_respect',
    trigger_keyword: 'الملك سلمان',
    response_template: 'خادم الحرمين الشريفين الملك سلمان بن عبدالعزيز آل سعود — حفظه الله ورعاه — ملك المملكة العربية السعودية. أدام الله عزه وأطال في عمره.',
    is_active: true,
  },
  {
    scenario_type: 'leader_respect',
    trigger_keyword: 'محمد بن سلمان',
    response_template: 'صاحب السمو الملكي الأمير محمد بن سلمان — حفظه الله — صاحب الرؤية الطموحة لتحويل المملكة إلى قوة رقمية عالمية. رؤية 2030 هي خارطة طريق المستقبل المشرق.',
    is_active: true,
  },
  {
    scenario_type: 'leader_respect',
    trigger_keyword: 'رؤية 2030',
    response_template: 'رؤية المملكة 2030 — المشروع الوطني الطموح بقيادة صاحب السمو الملكي الأمير محمد بن سلمان حفظه الله — تهدف إلى بناء مجتمع حيوي واقتصاد مزدهر ووطن طموح. حماية البيانات الشخصية ركيزة أساسية في التحول الرقمي ضمن هذه الرؤية المباركة.',
    is_active: true,
  },
  {
    scenario_type: 'leader_respect',
    trigger_keyword: 'NDMO',
    response_template: 'مكتب إدارة البيانات الوطنية (NDMO) — الجهة المسؤولة عن حوكمة البيانات وحماية البيانات الشخصية في المملكة العربية السعودية، تحت مظلة هيئة البيانات والذكاء الاصطناعي (سدايا). نفخر بالعمل تحت إشرافهم لحماية خصوصية المواطنين.',
    is_active: true,
  },
  {
    scenario_type: 'leader_respect',
    trigger_keyword: 'سدايا',
    response_template: 'الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا) — الجهة الوطنية المرجعية للبيانات والذكاء الاصطناعي في المملكة. تقود التحول الرقمي وتضع الأطر التنظيمية لحماية البيانات الشخصية.',
    is_active: true,
  },

  // ===== CUSTOM =====
  {
    scenario_type: 'custom',
    trigger_keyword: 'PDPL',
    response_template: 'نظام حماية البيانات الشخصية (PDPL) هو الإطار التنظيمي الرئيسي لحماية البيانات الشخصية في المملكة العربية السعودية. يهدف إلى حماية خصوصية الأفراد وتنظيم عمليات جمع ومعالجة البيانات الشخصية.',
    is_active: true,
  },
];

async function seed() {
  const conn = await mysql.createConnection(DATABASE_URL);
  
  // Check if scenarios already exist
  const [existing] = await conn.execute('SELECT COUNT(*) as cnt FROM personality_scenarios');
  if (existing[0].cnt > 0) {
    console.log(`Already ${existing[0].cnt} scenarios exist. Skipping seed.`);
    await conn.end();
    return;
  }

  for (const s of scenarios) {
    await conn.execute(
      'INSERT INTO personality_scenarios (scenarioType, triggerKeyword, responseTemplate, isActive) VALUES (?, ?, ?, ?)',
      [s.scenario_type, s.trigger_keyword, s.response_template, s.is_active ? 1 : 0]
    );
  }

  console.log(`Seeded ${scenarios.length} personality scenarios successfully!`);
  await conn.end();
}

seed().catch(console.error);
