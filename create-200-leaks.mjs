import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import crypto from 'crypto';
dotenv.config();

// CDN Screenshot URLs
const SCREENSHOTS = {
  darkweb: [
    'https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/WNYCNaYKIXqEbvOD.png',
    'https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/GaZjZlTJAHQrHLKW.png',
    'https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/eMbVfDPMCPjlqDIR.png',
    'https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/MxOKNFJXjhHuXwfj.png',
    'https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/AwTjGFfGFBCQJkiA.png',
    'https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/FZWlQhLUxdPDXOQZ.png',
    'https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/tLuBfzfqmLpxHVvf.png',
    'https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/ciWwRjkUurFVPcVO.png',
    'https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/lrRlMskwqQtngvZj.png',
    'https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/CpKOmotKYPuzcegn.png',
    'https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/STwnCVDknFtupqPW.png',
    'https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/iMCyOWwHUHLVnSIw.png',
    'https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/jTBNfixwyfZOTIYb.png',
  ],
  telegram: [
    'https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/YOzONIUOJIlHqhqG.png',
    'https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/EvWZhqjkMYQCiDLT.png',
    'https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/SfnqPGNEVLXTCfBw.png',
    'https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/OqxZLfYHPLAcHuXD.png',
    'https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/SfTmwPrEPiirHybO.png',
    'https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/rlrxADPdlLDphkyQ.png',
    'https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/FOnujcGRyptkJsyJ.png',
    'https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/tcnMzrqclfdTVPBB.png',
  ],
  paste: [
    'https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/wGLLFjHXlBfxhFLQ.png',
    'https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/lXAHQnJTVOdVLLzW.png',
    'https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/JxIJWoZqnxkHqBdm.png',
    'https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/LpSloqEiBWUSEZAM.png',
    'https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/rbCtSUMnHpxyoqZv.png',
    'https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/hbXVtWyRENXiEKmN.png',
    'https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/TASjjyAWZQuuDmbL.png',
  ],
};

const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => { const s = [...arr].sort(() => Math.random()-0.5); return s.slice(0,n); };
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const FIRST_M = ['محمد','أحمد','عبدالله','سعد','فهد','خالد','عمر','يوسف','ناصر','فيصل','سلطان','بندر','ماجد','تركي','عبدالرحمن','إبراهيم','صالح','عبدالعزيز','مشعل','نواف','وليد','حمد','طلال','سعود','منصور','عادل','هاني','زياد','رائد','بدر','نايف','حسن','علي','ثامر','مازن','أنس','باسل','ياسر'];
const FIRST_F = ['نورة','سارة','ريم','لمياء','هند','منال','أمل','فاطمة','مريم','جواهر','دانة','العنود','لطيفة','وفاء','أسماء','رغد','شهد','ديمة','غادة','هيفاء','بسمة','عبير','سمر','ليلى','رنا','نجلاء','حصة','مها','أريج','لينا'];
const FAMILY = ['العتيبي','الغامدي','الدوسري','القحطاني','الحربي','الشمري','المطيري','الزهراني','البلوي','الجهني','العنزي','السبيعي','الرشيدي','الثبيتي','المالكي','الشهري','الحارثي','السلمي','اليامي','الخالدي','العمري','الأحمدي','الفيفي','النمري','البقمي','السهلي','الوادعي','المحمدي','الكلبي','التميمي','الشريف','الهاشمي','العلي','المري','الحازمي','الأسمري','الخثعمي','الغنامي','الرويلي','الحسيني'];
const CITIES = [
  {en:'Riyadh',ar:'الرياض',lat:'24.7136',lng:'46.6753',reg:'Riyadh',regAr:'الرياض',hoods:['حي النخيل','حي الملقا','حي العليا','حي السليمانية','حي الورود','حي الربوة','حي المروج','حي الياسمين','حي النرجس','حي الصحافة']},
  {en:'Jeddah',ar:'جدة',lat:'21.4858',lng:'39.1925',reg:'Makkah',regAr:'مكة المكرمة',hoods:['حي الحمراء','حي الروضة','حي الشاطئ','حي السلامة','حي النسيم','حي البوادي','حي الصفا','حي المرجان','حي الأمير فواز','حي الفيصلية']},
  {en:'Dammam',ar:'الدمام',lat:'26.3927',lng:'50.1146',reg:'Eastern',regAr:'المنطقة الشرقية',hoods:['حي الشاطئ','حي الفيصلية','حي المزروعية','حي الجلوية','حي الأنوار','حي الروضة','حي الريان','حي النور']},
  {en:'Makkah',ar:'مكة المكرمة',lat:'21.3891',lng:'39.8579',reg:'Makkah',regAr:'مكة المكرمة',hoods:['حي العزيزية','حي الشوقية','حي الرصيفة','حي النوارية','حي الزاهر','حي الحمراء']},
  {en:'Madinah',ar:'المدينة المنورة',lat:'24.4539',lng:'39.6142',reg:'Madinah',regAr:'المدينة المنورة',hoods:['حي الياسمين','حي السلام','حي العزيزية','حي قباء','حي الدفاع','حي الملك فهد']},
  {en:'Tabuk',ar:'تبوك',lat:'28.3838',lng:'36.5550',reg:'Tabuk',regAr:'تبوك',hoods:['حي المروج','حي السليمانية','حي الفيصلية','حي النخيل','حي الشفا']},
  {en:'Abha',ar:'أبها',lat:'18.2164',lng:'42.5053',reg:'Asir',regAr:'عسير',hoods:['حي الخالدية','حي الموظفين','حي المنسك','حي الشفا','حي العزيزية']},
  {en:'Khobar',ar:'الخبر',lat:'26.2172',lng:'50.1971',reg:'Eastern',regAr:'المنطقة الشرقية',hoods:['حي الحزام الذهبي','حي العقربية','حي الثقبة','حي اليرموك','حي الخزامى']},
  {en:'Jubail',ar:'الجبيل',lat:'27.0046',lng:'49.6225',reg:'Eastern',regAr:'المنطقة الشرقية',hoods:['حي الفناتير','حي الحويلات','حي الدفي','حي النخيل']},
  {en:'Yanbu',ar:'ينبع',lat:'24.0895',lng:'38.0618',reg:'Madinah',regAr:'المدينة المنورة',hoods:['حي السميري','حي الشاطئ','حي الصناعية']},
  {en:'Najran',ar:'نجران',lat:'17.4933',lng:'44.1322',reg:'Najran',regAr:'نجران',hoods:['حي الفهد','حي الفيصلية','حي المنطقة']},
  {en:'Hail',ar:'حائل',lat:'27.5219',lng:'41.6907',reg:'Hail',regAr:'حائل',hoods:['حي المنتزه','حي الزبارة','حي السويفلة']},
  {en:'Buraydah',ar:'بريدة',lat:'26.3260',lng:'43.9750',reg:'Qassim',regAr:'القصيم',hoods:['حي الخليج','حي الريان','حي الفايزية']},
  {en:'Jazan',ar:'جازان',lat:'16.8892',lng:'42.5611',reg:'Jazan',regAr:'جازان',hoods:['حي الشاطئ','حي المطار','حي الروضة']},
  {en:'Taif',ar:'الطائف',lat:'21.2703',lng:'40.4158',reg:'Makkah',regAr:'مكة المكرمة',hoods:['حي الشهداء','حي الحلقة','حي السداد']},
];
const EMAILS = ['gmail.com','hotmail.com','outlook.com','yahoo.com','icloud.com'];
const BLOOD = ['A+','A-','B+','B-','O+','O-','AB+','AB-'];

function genName() {
  const isMale = Math.random() > 0.4;
  const first = pick(isMale ? FIRST_M : FIRST_F);
  const father = pick(FIRST_M);
  const family = pick(FAMILY);
  return `${first} ${father} ${family}`;
}
function genNatId() { return '10' + String(rand(10000000,99999999)); }
function genPhone() { return '05' + String(rand(10000000,99999999)); }
function genIBAN() { return 'SA' + String(rand(10,99)) + String(rand(10,99)) + 'XXXX' + 'XXXX' + String(rand(1000,9999)); }
function genEmail(name) {
  const parts = name.split(' ');
  const init = parts[0][0] + '.' + parts[parts.length-1].substring(0,3) + '***@' + pick(EMAILS);
  return init;
}
function genDate(yearStart, yearEnd) {
  const y = rand(yearStart, yearEnd);
  const m = rand(1,12);
  const d = rand(1,28);
  return `${d}/${m}/${y}`;
}
function genCreditCard() { return '4XXX-XXXX-XXXX-' + String(rand(1000,9999)); }
function genPassport() { return pick(['A','B','C','E','F','G','H','J','K','L','M','N']) + String(rand(1000000,9999999)); }

// ============ SECTOR DEFINITIONS ============
// Each sector defines: how to generate sample data rows, PII types, descriptions, etc.

const SECTORS = [];

// Helper to push sector definition
function defSector(obj) { SECTORS.push(obj); }

// 1. Healthcare - Patient Records
defSector({
  sector: 'Healthcare', sectorAr: 'الرعاية الصحية',
  titles: [
    {en:'Patient Medical Records Database Leak from {org}',ar:'تسريب قاعدة بيانات السجلات الطبية للمرضى من {org}'},
    {en:'{org} Patient Data Exposed on {platform}',ar:'كشف بيانات مرضى {org} على {platform}'},
    {en:'Medical Records Breach at {org} - {count} Patient Files',ar:'اختراق السجلات الطبية في {org} - {count} ملف مريض'},
  ],
  orgs: ['مستشفى الملك فيصل التخصصي','مستشفى الملك فهد','مستشفى الحمادي','مجموعة سليمان الحبيب','مستشفى دله','مستشفى المملكة','مستشفى الموسى','مستشفى الحياة الوطني','مستشفى السعودي الألماني','مستشفى رعاية الرياض','مستشفى الملك عبدالعزيز الجامعي','مستشفى الملك خالد','المستشفى العسكري','مستشفى الأمير سلطان','مستشفى الولادة والأطفال','مستشفى الإيمان العام','مجمع الملك سعود الطبي','مستشفى الملك فهد الجامعي','مستشفى جامعة الملك عبدالعزيز','مستشفى الشميسي'],
  piiTypes: ['Full Name','National ID','Phone','Email','Medical Diagnosis','Blood Type','Medications','Insurance Number','Date of Birth','Address'],
  genSample: (city) => {
    const name = genName();
    return {
      'الاسم': name, 'رقم الهوية': genNatId(), 'الجوال': genPhone(),
      'البريد': genEmail(name), 'التشخيص': pick(['سكري نوع 2','ارتفاع ضغط الدم','حساسية موسمية','كسر في الساق','التهاب رئوي','فقر الدم','قصور الغدة الدرقية','حصوات الكلى','التهاب المفاصل','الربو','قرحة المعدة','الصداع النصفي','اكتئاب','قصور القلب','التهاب الكبد']),
      'فصيلة الدم': pick(BLOOD), 'الأدوية': pick(['ميتفورمين 500mg','أملوديبين 5mg','أوميبرازول 20mg','ليفوثيروكسين 50mcg','سيتالوبرام 20mg','أتورفاستاتين 10mg','إيبوبروفين 400mg','أموكسيسيلين 500mg']),
      'رقم التأمين': 'INS-' + rand(100000,999999), 'المدينة': city.ar + ' - ' + pick(city.hoods),
    };
  },
  descTemplateAr: 'تم رصد تسريب بيانات طبية حساسة لمرضى {org} على {platform}. تتضمن البيانات المسربة سجلات طبية كاملة تشمل التشخيصات والأدوية وفصائل الدم وأرقام التأمين الصحي، مما يشكل انتهاكاً صريحاً لنظام حماية البيانات الشخصية ولائحة الصحة الإلكترونية.',
  descTemplateEn: 'Sensitive medical data from {org} patients detected on {platform}. The leaked data includes complete medical records with diagnoses, medications, blood types, and insurance numbers, constituting a clear violation of PDPL and e-Health regulations.',
});

// 2. Banking/Finance - Customer Financial Data
defSector({
  sector: 'Banking/Finance', sectorAr: 'البنوك والتمويل',
  titles: [
    {en:'Banking Customer Data Leak from {org}',ar:'تسريب بيانات عملاء {org}'},
    {en:'{org} Financial Records Exposed - {count} Accounts',ar:'كشف السجلات المالية لـ {org} - {count} حساب'},
    {en:'Credit Card and Account Data from {org} on {platform}',ar:'بيانات بطاقات ائتمان وحسابات {org} على {platform}'},
  ],
  orgs: ['البنك الأهلي السعودي','بنك الراجحي','بنك الرياض','البنك السعودي الفرنسي','بنك البلاد','بنك الجزيرة','البنك العربي الوطني','بنك ساب','بنك الإنماء','البنك السعودي للاستثمار','بنك الخليج الدولي','شركة الراجحي المالية','شركة تداول','مصرف الراجحي','بنك التنمية الاجتماعية'],
  piiTypes: ['Full Name','National ID','IBAN','Credit Card','Phone','Email','Account Balance','Address'],
  genSample: (city) => {
    const name = genName();
    return {
      'الاسم': name, 'رقم الهوية': genNatId(), 'IBAN': genIBAN(),
      'البطاقة': genCreditCard(), 'الجوال': genPhone(), 'البريد': genEmail(name),
      'الرصيد': rand(1000,500000).toLocaleString() + ' SAR',
      'العنوان': city.ar + ' - ' + pick(city.hoods),
    };
  },
  descTemplateAr: 'تم اكتشاف تسريب بيانات مالية حساسة لعملاء {org} على {platform}. تشمل البيانات أرقام حسابات IBAN وبطاقات ائتمان وأرصدة مالية ومعلومات شخصية كاملة، مما يعرض العملاء لمخاطر الاحتيال المالي وسرقة الهوية.',
  descTemplateEn: 'Sensitive financial data of {org} customers detected on {platform}. Data includes IBAN numbers, credit cards, account balances, and complete personal information, exposing customers to financial fraud and identity theft risks.',
});

// 3. Government - Employee/Citizen Data
defSector({
  sector: 'Government', sectorAr: 'القطاع الحكومي',
  titles: [
    {en:'Government Employee Database Leak from {org}',ar:'تسريب قاعدة بيانات موظفي {org}'},
    {en:'{org} Citizen Records Exposed on {platform}',ar:'كشف سجلات مواطنين من {org} على {platform}'},
    {en:'Classified Personnel Data from {org} - {count} Records',ar:'بيانات موظفين سرية من {org} - {count} سجل'},
  ],
  orgs: ['وزارة الداخلية','وزارة الصحة','وزارة التعليم','وزارة العدل','وزارة المالية','وزارة الموارد البشرية','وزارة التجارة','وزارة الإسكان','وزارة النقل','هيئة الزكاة والضريبة','المؤسسة العامة للتأمينات','الهيئة العامة للإحصاء','هيئة الاتصالات','الهيئة الوطنية للأمن السيبراني','هيئة حقوق الإنسان','ديوان المراقبة العامة','هيئة مكافحة الفساد','وزارة الشؤون البلدية','وزارة البيئة','أمانة منطقة الرياض'],
  piiTypes: ['Full Name','National ID','Phone','Email','Job Title','Salary','Department','Address'],
  genSample: (city) => {
    const name = genName();
    return {
      'الاسم': name, 'رقم الهوية': genNatId(), 'الجوال': genPhone(),
      'البريد الوظيفي': genEmail(name).replace(pick(EMAILS), pick(['moi.gov.sa','moh.gov.sa','moe.gov.sa','mof.gov.sa','hrsd.gov.sa','mc.gov.sa'])),
      'المسمى': pick(['مدير إدارة','محلل','مهندس','محاسب','مشرف','أخصائي','مبرمج','سكرتير','مراجع','باحث','مستشار','مدقق']),
      'الراتب': rand(8000,55000).toLocaleString() + ' SAR',
      'المدينة': city.ar + ' - ' + pick(city.hoods),
    };
  },
  descTemplateAr: 'تم رصد تسريب بيانات موظفين حكوميين من {org} على {platform}. تتضمن البيانات أسماء كاملة وأرقام هوية وطنية ورواتب ومسميات وظيفية وبيانات اتصال، مما يشكل تهديداً أمنياً خطيراً ومخالفة لنظام حماية البيانات الشخصية.',
  descTemplateEn: 'Government employee data leak from {org} detected on {platform}. Data includes full names, national IDs, salaries, job titles, and contact information, posing a serious security threat and PDPL violation.',
});

// 4. Telecom - Subscriber Data
defSector({
  sector: 'Telecommunications', sectorAr: 'الاتصالات',
  titles: [
    {en:'{org} Subscriber Data Leak - {count} Records',ar:'تسريب بيانات مشتركي {org} - {count} سجل'},
    {en:'Mobile Subscriber Records from {org} on {platform}',ar:'سجلات مشتركي الجوال من {org} على {platform}'},
  ],
  orgs: ['شركة الاتصالات السعودية STC','شركة موبايلي','شركة زين السعودية','شركة فيرجن موبايل','شركة ليبارا','شركة سلام موبايل','شركة رسن للاتصالات'],
  piiTypes: ['Full Name','National ID','Phone','Email','IMEI','Address','Subscription Plan','Call Records'],
  genSample: (city) => {
    const name = genName();
    return {
      'الاسم': name, 'رقم الهوية': genNatId(), 'الجوال': genPhone(),
      'البريد': genEmail(name), 'IMEI': String(rand(100000000000000,999999999999999)),
      'الباقة': pick(['مفوتر 200','مفوتر 300','سوا شير','سوا بوست','سوا ستار','موبايلي بزنس','زين شباب']),
      'العنوان': city.ar + ' - ' + pick(city.hoods),
      'آخر طلب': genDate(2024,2025),
    };
  },
  descTemplateAr: 'تم اكتشاف تسريب بيانات مشتركين من {org} على {platform}. تشمل البيانات أرقام الجوال وأرقام IMEI وتفاصيل الباقات والعناوين، مما يعرض المشتركين لمخاطر التتبع والاحتيال.',
  descTemplateEn: 'Subscriber data leak from {org} detected on {platform}. Data includes phone numbers, IMEI numbers, subscription details, and addresses, exposing subscribers to tracking and fraud risks.',
});

// 5. Education - Student/Faculty Data
defSector({
  sector: 'Education', sectorAr: 'التعليم',
  titles: [
    {en:'Student Records Leak from {org}',ar:'تسريب سجلات طلاب {org}'},
    {en:'{org} Academic Data Exposed - {count} Students',ar:'كشف البيانات الأكاديمية لـ {org} - {count} طالب'},
  ],
  orgs: ['جامعة الملك سعود','جامعة الملك عبدالعزيز','جامعة الملك فهد للبترول','جامعة الإمام محمد بن سعود','جامعة أم القرى','جامعة الملك خالد','جامعة القصيم','جامعة تبوك','جامعة نجران','جامعة حائل','جامعة الأميرة نورة','جامعة الطائف','جامعة جازان','جامعة الجوف','جامعة المجمعة','الجامعة السعودية الإلكترونية','جامعة الأمير سلطان','جامعة الفيصل','جامعة دار الحكمة','كلية الأمير سلطان العسكرية'],
  piiTypes: ['Full Name','National ID','Phone','Email','GPA','Student ID','Major','Address'],
  genSample: (city) => {
    const name = genName();
    return {
      'الاسم': name, 'رقم الهوية': genNatId(), 'الجوال': genPhone(),
      'البريد الجامعي': genEmail(name).replace(pick(EMAILS), pick(['ksu.edu.sa','kau.edu.sa','kfupm.edu.sa','qu.edu.sa','uqu.edu.sa'])),
      'الرقم الجامعي': String(rand(430000000,445999999)),
      'المعدل': (rand(200,500)/100).toFixed(2),
      'التخصص': pick(['علوم حاسب','هندسة كهربائية','طب بشري','إدارة أعمال','محاسبة','قانون','هندسة مدنية','صيدلة','تمريض','هندسة ميكانيكية','نظم معلومات','أمن سيبراني','ذكاء اصطناعي','هندسة برمجيات','علوم بيانات']),
      'المدينة': city.ar,
    };
  },
  descTemplateAr: 'تم رصد تسريب بيانات أكاديمية لطلاب {org} على {platform}. تشمل البيانات الأسماء والأرقام الجامعية والمعدلات التراكمية والتخصصات وبيانات الاتصال الشخصية.',
  descTemplateEn: 'Academic data leak from {org} students detected on {platform}. Data includes names, student IDs, GPAs, majors, and personal contact information.',
});

// 6. E-commerce/Retail - Customer Data
defSector({
  sector: 'E-commerce/Retail', sectorAr: 'التجارة الإلكترونية',
  titles: [
    {en:'{org} Customer Database Leak - {count} Records',ar:'تسريب قاعدة بيانات عملاء {org} - {count} سجل'},
    {en:'E-commerce Customer Data from {org} on {platform}',ar:'بيانات عملاء التجارة الإلكترونية من {org} على {platform}'},
  ],
  orgs: ['نون السعودية','جرير','إكسترا','نمشي','سيتروس','لولو هايبرماركت','بنده','العثيم','الدانوب','كارفور السعودية','أمازون السعودية','هنقرستيشن','مرسول','جاهز','كريم','أسواق التميمي','ساكو','ايكيا السعودية','زارا السعودية','سنتربوينت'],
  piiTypes: ['Full Name','Phone','Email','Address','Credit Card','Order History'],
  genSample: (city) => {
    const name = genName();
    return {
      'الاسم': name, 'الجوال': genPhone(), 'البريد': genEmail(name),
      'البطاقة': genCreditCard(),
      'العنوان': city.ar + ' - ' + pick(city.hoods),
      'آخر طلب': genDate(2024,2025),
      'إجمالي المشتريات': rand(500,50000).toLocaleString() + ' SAR',
    };
  },
  descTemplateAr: 'تم اكتشاف تسريب بيانات عملاء {org} على {platform}. تتضمن البيانات أسماء وأرقام جوال وعناوين بريد إلكتروني وبطاقات ائتمان وسجل المشتريات، مما يعرض العملاء لمخاطر الاحتيال المالي.',
  descTemplateEn: 'Customer data leak from {org} detected on {platform}. Data includes names, phone numbers, emails, credit cards, and purchase history, exposing customers to financial fraud.',
});

// 7. Real Estate - Property Owner/Tenant Data
defSector({
  sector: 'Real Estate', sectorAr: 'العقارات',
  titles: [
    {en:'{org} Property Records Leak - {count} Owners/Tenants',ar:'تسريب سجلات عقارية من {org} - {count} مالك/مستأجر'},
    {en:'Real Estate Customer Data from {org} on {platform}',ar:'بيانات عملاء عقارات {org} على {platform}'},
  ],
  orgs: ['شركة دار الأركان','شركة جبل عمر','شركة إعمار','شركة رتال للتطوير','شركة الرياض للتعمير','شركة طيبة القابضة','شركة المراكز العربية','شركة سدكو','منصة إيجار','منصة سكني','شركة روشن','شركة الأندلس العقارية','شركة سمو العقارية','شركة بلوم للاستثمار','شركة المعمار للتطوير'],
  piiTypes: ['Full Name','National ID','Phone','Email','Property Address','Contract Value','IBAN'],
  genSample: (city) => {
    const name = genName();
    return {
      'الاسم': name, 'رقم الهوية': genNatId(), 'الجوال': genPhone(),
      'البريد': genEmail(name),
      'العقار': pick(['شقة','فيلا','أرض','دوبلكس','مكتب','محل تجاري']) + ' - ' + city.ar + ' - ' + pick(city.hoods),
      'قيمة العقد': rand(50000,3000000).toLocaleString() + ' SAR',
      'IBAN': genIBAN(),
    };
  },
  descTemplateAr: 'تم رصد تسريب بيانات عقارية من {org} على {platform}. تشمل البيانات أسماء الملاك والمستأجرين وأرقام الهوية وتفاصيل العقود والحسابات البنكية.',
  descTemplateEn: 'Real estate data leak from {org} detected on {platform}. Data includes owner/tenant names, national IDs, contract details, and bank accounts.',
});

// 8. Insurance - Policyholder Data
defSector({
  sector: 'Insurance', sectorAr: 'التأمين',
  titles: [
    {en:'{org} Policyholder Data Leak - {count} Records',ar:'تسريب بيانات حاملي وثائق {org} - {count} سجل'},
    {en:'Insurance Claims Data from {org} on {platform}',ar:'بيانات مطالبات التأمين من {org} على {platform}'},
  ],
  orgs: ['التعاونية للتأمين','بوبا العربية','ميدغلف','تكافل الراجحي','ملاذ للتأمين','الدرع العربي','وفا للتأمين','أليانز السعودية','سلامة للتأمين','المتوسط والخليج للتأمين','شركة أسيج','شركة ولاء للتأمين','شركة إتحاد الخليج','شركة الصقر للتأمين','مجلس الضمان الصحي'],
  piiTypes: ['Full Name','National ID','Phone','Policy Number','Claim Amount','Vehicle Plate','Medical Records'],
  genSample: (city) => {
    const name = genName();
    return {
      'الاسم': name, 'رقم الهوية': genNatId(), 'الجوال': genPhone(),
      'رقم الوثيقة': 'POL-' + rand(100000,999999),
      'نوع التأمين': pick(['صحي شامل','صحي فئة B','مركبات شامل','مركبات ضد الغير','سفر','ممتلكات','مسؤولية مهنية']),
      'مبلغ المطالبة': rand(500,200000).toLocaleString() + ' SAR',
      'المدينة': city.ar,
    };
  },
  descTemplateAr: 'تم اكتشاف تسريب بيانات حاملي وثائق تأمين من {org} على {platform}. تتضمن البيانات أرقام الوثائق ومبالغ المطالبات والبيانات الشخصية والطبية.',
  descTemplateEn: 'Insurance policyholder data leak from {org} detected on {platform}. Data includes policy numbers, claim amounts, and personal/medical information.',
});

// 9. Energy/Oil & Gas
defSector({
  sector: 'Energy/Oil & Gas', sectorAr: 'الطاقة والنفط',
  titles: [
    {en:'{org} Employee Data Breach - {count} Personnel Records',ar:'اختراق بيانات موظفي {org} - {count} سجل'},
    {en:'Contractor Data from {org} Leaked on {platform}',ar:'تسريب بيانات مقاولي {org} على {platform}'},
  ],
  orgs: ['أرامكو السعودية','سابك','شركة الكهرباء السعودية','شركة المياه الوطنية','معادن','شركة أكوا باور','شركة الغاز والتصنيع','بترو رابغ','شركة ينساب','شركة التصنيع الوطنية','شركة لوبريف','شركة كيمانول','شركة صدارة','شركة نجم للتأمين','المركز الوطني لكفاءة الطاقة'],
  piiTypes: ['Full Name','National ID','Phone','Email','Employee ID','Salary','Security Clearance','Address'],
  genSample: (city) => {
    const name = genName();
    return {
      'الاسم': name, 'رقم الهوية': genNatId(), 'الجوال': genPhone(),
      'البريد': genEmail(name),
      'الرقم الوظيفي': 'EMP-' + rand(10000,99999),
      'الراتب': rand(12000,80000).toLocaleString() + ' SAR',
      'التصنيف الأمني': pick(['سري','سري للغاية','محدود','عادي']),
      'المدينة': city.ar,
    };
  },
  descTemplateAr: 'تم رصد تسريب بيانات موظفين ومقاولين من {org} على {platform}. تشمل البيانات معلومات شخصية وأمنية حساسة تتعلق بقطاع الطاقة الحيوي.',
  descTemplateEn: 'Employee and contractor data from {org} detected on {platform}. Data includes sensitive personal and security information related to the critical energy sector.',
});

// 10. Transportation/Aviation
defSector({
  sector: 'Transportation', sectorAr: 'النقل والطيران',
  titles: [
    {en:'{org} Passenger Data Leak - {count} Travel Records',ar:'تسريب بيانات مسافري {org} - {count} سجل سفر'},
    {en:'Travel Records from {org} Exposed on {platform}',ar:'كشف سجلات السفر من {org} على {platform}'},
  ],
  orgs: ['الخطوط السعودية','طيران ناس','طيران أديل','شركة سار','الشركة السعودية للنقل الجماعي','هيئة النقل العام','شركة المجدوعي','أوبر السعودية','كريم','شركة البحري','ميناء جدة الإسلامي','مطار الملك خالد الدولي','مطار الملك عبدالعزيز','هيئة الطيران المدني','شركة نقل المسافرين'],
  piiTypes: ['Full Name','Passport Number','National ID','Phone','Email','Travel Route','Booking Reference'],
  genSample: (city) => {
    const name = genName();
    return {
      'الاسم': name, 'رقم الجواز': genPassport(), 'رقم الهوية': genNatId(),
      'الجوال': genPhone(), 'البريد': genEmail(name),
      'خط السفر': pick(['الرياض - جدة','جدة - الدمام','الرياض - أبها','جدة - المدينة','الدمام - الرياض','الرياض - تبوك','جدة - نجران','الرياض - القصيم']),
      'رقم الحجز': pick(['SV','XY','F3']) + rand(1000,9999),
    };
  },
  descTemplateAr: 'تم اكتشاف تسريب بيانات مسافرين من {org} على {platform}. تشمل البيانات أرقام جوازات السفر وتفاصيل الحجوزات وبيانات الاتصال الشخصية.',
  descTemplateEn: 'Passenger data leak from {org} detected on {platform}. Data includes passport numbers, booking details, and personal contact information.',
});

// 11. Hospitality/Tourism
defSector({
  sector: 'Hospitality/Tourism', sectorAr: 'الضيافة والسياحة',
  titles: [
    {en:'{org} Guest Data Leak - {count} Booking Records',ar:'تسريب بيانات نزلاء {org} - {count} سجل حجز'},
    {en:'Hotel Guest Records from {org} on {platform}',ar:'سجلات نزلاء فندق {org} على {platform}'},
  ],
  orgs: ['فندق الريتز كارلتون الرياض','فندق فور سيزونز جدة','فندق هيلتون الرياض','فندق ماريوت جدة','فندق فيرمونت مكة','فندق رافلز مكة','فندق شيراتون الدمام','فندق كراون بلازا','منتجع البحر الأحمر','مشروع نيوم السياحي','هيئة السياحة','منصة روح السعودية','شركة المسافر','فندق موفنبيك','فندق سويس أوتيل'],
  piiTypes: ['Full Name','Passport Number','Phone','Email','Credit Card','Room Number','Check-in Date'],
  genSample: (city) => {
    const name = genName();
    return {
      'الاسم': name, 'رقم الجواز': genPassport(), 'الجوال': genPhone(),
      'البريد': genEmail(name), 'البطاقة': genCreditCard(),
      'الغرفة': String(rand(100,999)),
      'تاريخ الوصول': genDate(2024,2025),
      'المدينة': city.ar,
    };
  },
  descTemplateAr: 'تم رصد تسريب بيانات نزلاء من {org} على {platform}. تتضمن البيانات أسماء وأرقام جوازات وبطاقات ائتمان وتفاصيل الإقامة.',
  descTemplateEn: 'Hotel guest data leak from {org} detected on {platform}. Data includes names, passport numbers, credit cards, and stay details.',
});

// 12. HR/Recruitment
defSector({
  sector: 'Recruitment/HR', sectorAr: 'التوظيف والموارد البشرية',
  titles: [
    {en:'{org} Job Applicant Data Leak - {count} CVs',ar:'تسريب بيانات متقدمين من {org} - {count} سيرة ذاتية'},
    {en:'Employee HR Records from {org} on {platform}',ar:'سجلات موارد بشرية من {org} على {platform}'},
  ],
  orgs: ['منصة طاقات','منصة جدارات','شركة باب رزق جميل','شركة روبرت هاف','شركة هايز','منصة لينكد إن السعودية','شركة مهارة','شركة الخدمات الأرضية','شركة سيركو','شركة الراجحي للموارد البشرية','شركة تمكين','منصة مسار','صندوق تنمية الموارد البشرية','شركة أرامكو للتوظيف','منصة العمل عن بعد'],
  piiTypes: ['Full Name','National ID','Phone','Email','Salary History','Education','Skills','Address'],
  genSample: (city) => {
    const name = genName();
    return {
      'الاسم': name, 'رقم الهوية': genNatId(), 'الجوال': genPhone(),
      'البريد': genEmail(name),
      'المؤهل': pick(['بكالوريوس','ماجستير','دبلوم','دكتوراه']),
      'الراتب الحالي': rand(5000,40000).toLocaleString() + ' SAR',
      'الخبرة': rand(1,20) + ' سنوات',
      'المدينة': city.ar,
    };
  },
  descTemplateAr: 'تم اكتشاف تسريب بيانات متقدمين وموظفين من {org} على {platform}. تشمل البيانات السير الذاتية الكاملة والرواتب والمؤهلات وبيانات الاتصال.',
  descTemplateEn: 'Job applicant and employee data from {org} detected on {platform}. Data includes complete CVs, salary history, qualifications, and contact details.',
});

// 13. Fintech/Digital Payments
defSector({
  sector: 'Fintech', sectorAr: 'التقنية المالية',
  titles: [
    {en:'{org} User Account Data Leak - {count} Accounts',ar:'تسريب بيانات حسابات مستخدمي {org} - {count} حساب'},
    {en:'Digital Wallet Data from {org} on {platform}',ar:'بيانات المحافظ الرقمية من {org} على {platform}'},
  ],
  orgs: ['تطبيق stc pay','تطبيق مدى','تطبيق تمارا','تطبيق تابي','تطبيق حلّ','تطبيق فاتورة','منصة أنت','تطبيق بيان','تطبيق لندن','شركة باييت','تطبيق هللة','منصة سبل','تطبيق مزيد','شركة جيديا','تطبيق نقاط'],
  piiTypes: ['Full Name','National ID','Phone','Email','IBAN','Transaction History','Wallet Balance'],
  genSample: (city) => {
    const name = genName();
    return {
      'الاسم': name, 'رقم الهوية': genNatId(), 'الجوال': genPhone(),
      'البريد': genEmail(name), 'IBAN': genIBAN(),
      'رصيد المحفظة': rand(100,50000).toLocaleString() + ' SAR',
      'آخر معاملة': genDate(2025,2026),
    };
  },
  descTemplateAr: 'تم رصد تسريب بيانات مستخدمي {org} على {platform}. تشمل البيانات حسابات المحافظ الرقمية وأرقام IBAN وسجل المعاملات المالية.',
  descTemplateEn: 'User account data from {org} detected on {platform}. Data includes digital wallet accounts, IBAN numbers, and transaction history.',
});

// 14. Food Delivery
defSector({
  sector: 'Food Delivery', sectorAr: 'توصيل الطعام',
  titles: [
    {en:'{org} Customer Data Leak - {count} User Profiles',ar:'تسريب بيانات عملاء {org} - {count} ملف مستخدم'},
  ],
  orgs: ['هنقرستيشن','جاهز','مرسول','كريم فود','طلبات','ذا شيفز','وصّل','نعناع','كاتش','لقمة'],
  piiTypes: ['Full Name','Phone','Email','Address','Credit Card','Order History'],
  genSample: (city) => {
    const name = genName();
    return {
      'الاسم': name, 'الجوال': genPhone(), 'البريد': genEmail(name),
      'العنوان': city.ar + ' - ' + pick(city.hoods),
      'البطاقة': genCreditCard(),
      'عدد الطلبات': String(rand(10,500)),
      'آخر طلب': genDate(2025,2026),
    };
  },
  descTemplateAr: 'تم اكتشاف تسريب بيانات عملاء {org} على {platform}. تتضمن البيانات عناوين التوصيل وبطاقات الائتمان وسجل الطلبات.',
  descTemplateEn: 'Customer data from {org} detected on {platform}. Data includes delivery addresses, credit cards, and order history.',
});

// 15. Construction/Mega Projects
defSector({
  sector: 'Construction', sectorAr: 'البناء والمشاريع الكبرى',
  titles: [
    {en:'{org} Worker Data Leak - {count} Personnel Records',ar:'تسريب بيانات عمال {org} - {count} سجل'},
  ],
  orgs: ['شركة نيوم','مشروع البحر الأحمر','شركة روشن','مشروع القدية','شركة سعودي أوجيه','شركة بن لادن','شركة المباني','شركة الراجحي للبناء','شركة المعجل','شركة نسما','شركة الحبيب للمقاولات','شركة الفوزان','مشروع ذا لاين','مشروع تروجينا','مشروع أوكساجون'],
  piiTypes: ['Full Name','National ID','Passport Number','Phone','Salary','Work Permit','Address'],
  genSample: (city) => {
    const name = genName();
    return {
      'الاسم': name, 'رقم الهوية': genNatId(), 'الجوال': genPhone(),
      'رقم الإقامة': '2' + String(rand(100000000,999999999)),
      'الراتب': rand(3000,25000).toLocaleString() + ' SAR',
      'المشروع': pick(['نيوم','ذا لاين','القدية','البحر الأحمر','تروجينا','أوكساجون','مشروع جدة الجديدة','مشروع الدرعية']),
      'المدينة': city.ar,
    };
  },
  descTemplateAr: 'تم رصد تسريب بيانات عمال ومقاولين من {org} على {platform}. تشمل البيانات أرقام الإقامات والرواتب وبيانات تصاريح العمل.',
  descTemplateEn: 'Worker and contractor data from {org} detected on {platform}. Data includes residency numbers, salaries, and work permit information.',
});

// 16. Sports/Entertainment
defSector({
  sector: 'Sports/Entertainment', sectorAr: 'الرياضة والترفيه',
  titles: [
    {en:'{org} Fan/Member Data Leak - {count} Records',ar:'تسريب بيانات أعضاء/مشجعي {org} - {count} سجل'},
  ],
  orgs: ['نادي الهلال','نادي النصر','نادي الأهلي','نادي الاتحاد','نادي الشباب','نادي الفيصلي','نادي الاتفاق','هيئة الترفيه','موسم الرياض','موسم جدة','منصة ويبوك','منصة حجوزات','مدينة الملك عبدالله الرياضية','استاد الملك فهد','الاتحاد السعودي لكرة القدم'],
  piiTypes: ['Full Name','National ID','Phone','Email','Membership ID','Payment Info'],
  genSample: (city) => {
    const name = genName();
    return {
      'الاسم': name, 'رقم الهوية': genNatId(), 'الجوال': genPhone(),
      'البريد': genEmail(name),
      'رقم العضوية': 'MEM-' + rand(100000,999999),
      'البطاقة': genCreditCard(),
      'المدينة': city.ar,
    };
  },
  descTemplateAr: 'تم اكتشاف تسريب بيانات أعضاء ومشجعي {org} على {platform}. تشمل البيانات أرقام العضويات وبطاقات الدفع وبيانات الاتصال.',
  descTemplateEn: 'Fan/member data from {org} detected on {platform}. Data includes membership IDs, payment cards, and contact information.',
});

// ============ THREAT ACTORS ============
const THREAT_ACTORS = ['DarkSaudi_Dealer','KSA_DataBroker','Gulf_Hacker_Pro','Riyadh_Shadow','CyberArabia','Jeddah_Phantom','Desert_Fox_Cyber','Dammam_Digital','Saudi_Stealer_Logs','Mecca_Breach','Najd_Cyber_Group','Al_Khobar_Leak','DataBroker_Gulf','ShopHacker_SA','SaudiLeaks_Admin','GCC_DataVault','ArabianNight_Hack','RedSand_Cyber','Falcon_Breach','OasisData_Seller','SandStorm_Hack','PetroCyber_SA','DesertViper_Ops','KingdomLeaks','GulfStream_Data'];
const BREACH_METHODS = [
  {en:'SQL Injection',ar:'حقن SQL'},
  {en:'API Vulnerability',ar:'ثغرة في واجهة برمجة التطبيقات'},
  {en:'Phishing Attack',ar:'هجوم تصيد احتيالي'},
  {en:'Insider Threat',ar:'تهديد داخلي'},
  {en:'Credential Stuffing',ar:'حشو بيانات الاعتماد'},
  {en:'Misconfigured Cloud Storage',ar:'تخزين سحابي غير مؤمن'},
  {en:'Zero-day Exploit',ar:'استغلال ثغرة يوم الصفر'},
  {en:'Brute Force Attack',ar:'هجوم القوة الغاشمة'},
  {en:'Supply Chain Attack',ar:'هجوم سلسلة التوريد'},
  {en:'Social Engineering',ar:'هندسة اجتماعية'},
  {en:'Unpatched Server Vulnerability',ar:'ثغرة خادم غير محدث'},
  {en:'Third-party Contractor Breach',ar:'اختراق مقاول طرف ثالث'},
  {en:'Ransomware Data Exfiltration',ar:'تسريب بيانات عبر فدية'},
  {en:'Exposed Database',ar:'قاعدة بيانات مكشوفة'},
  {en:'Weak Authentication',ar:'مصادقة ضعيفة'},
];
const PLATFORMS = {
  darkweb: {name:'BreachForums',urls:['https://breachforums.st/Thread-','https://breachforums.st/Thread-SELLING-','https://xss.is/threads/']},
  telegram: {name:'Telegram',urls:['https://t.me/saudi_leaks_','https://t.me/ksa_data_','https://t.me/gulf_breach_','https://t.me/dark_ksa_']},
  paste: {name:'Pastebin',urls:['https://pastebin.com/','https://rentry.co/','https://ghostbin.me/']},
};
const PRICES = ['Free (sample)','$500','$1,000','$1,500','$2,500','$3,000','$5,000','$7,500','$10,000','$15,000','$20,000','$25,000','$50,000','0.5 BTC','1 BTC','2 BTC','Auction','Contact seller','$500 - $5,000','Negotiable'];
const STATUSES = ['new','analyzing','documented','reported'];
const SEVERITIES = ['critical','high','medium','low'];

const AI_RECS_AR = [
  'إخطار الأفراد المتأثرين على الفور بالانتهاك، مع تحديد أنواع البيانات المكشوفة وتقديم إرشادات للتخفيف من المخاطر المحتملة، وذلك امتثالاً للمادة 19 من نظام حماية البيانات الشخصية السعودي.',
  'إجراء تحقيق جنائي شامل لتحديد السبب الجذري للتسريب، وتقييم النطاق الكامل للاختراق، وتطبيق تدابير أمنية معززة لمنع تكرار الحوادث في المستقبل.',
  'نصح المتأثرين بمراقبة حساباتهم المالية بحثاً عن أي نشاط مشبوه، وتغيير كلمات المرور للخدمات ذات الصلة، والتحلي باليقظة ضد محاولات التصيد.',
  'مراجعة وتعزيز بروتوكولات تشفير البيانات للمعلومات الشخصية الحساسة، سواء أثناء النقل أو التخزين، والالتزام بإرشادات NDMO لتصنيف البيانات وحمايتها.',
  'إبلاغ الهيئة الوطنية للأمن السيبراني (NCA) والجهات التنظيمية المختصة بالحادثة وفقاً لمتطلبات الإبلاغ الإلزامي.',
  'تفعيل خطة الاستجابة للحوادث وتشكيل فريق إدارة الأزمات للتعامل مع التداعيات القانونية والتقنية والإعلامية.',
  'مراجعة صلاحيات الوصول لجميع الأنظمة المتأثرة وتطبيق مبدأ الحد الأدنى من الصلاحيات (Least Privilege).',
  'تنفيذ اختبار اختراق شامل لجميع الأنظمة المرتبطة لتحديد أي ثغرات إضافية قد تكون مستغلة.',
];
const AI_RECS_EN = [
  'Immediately notify affected individuals about the breach, specifying exposed data types and providing risk mitigation guidance, in compliance with Article 19 of Saudi PDPL.',
  'Conduct a comprehensive forensic investigation to identify the root cause, assess the full scope of the breach, and implement enhanced security measures.',
  'Advise affected individuals to monitor financial accounts for suspicious activity, change passwords for related services, and remain vigilant against phishing attempts.',
  'Review and strengthen data encryption protocols for sensitive personal information, both in transit and at rest, following NDMO data classification guidelines.',
  'Report the incident to the National Cybersecurity Authority (NCA) and relevant regulatory bodies per mandatory reporting requirements.',
  'Activate the incident response plan and form a crisis management team to handle legal, technical, and media implications.',
  'Review access permissions for all affected systems and implement the principle of least privilege.',
  'Execute comprehensive penetration testing on all related systems to identify any additional exploitable vulnerabilities.',
];

// ============ MAIN GENERATION FUNCTION ============
async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  console.log('Connected to database');

  // First, delete all existing leaks and evidence to start fresh
  console.log('Clearing existing data...');
  await conn.query('DELETE FROM evidence_chain');
  await conn.query('DELETE FROM leaks');
  console.log('Cleared existing leaks and evidence');

  const allLeaks = [];
  let leakCounter = 0;

  // Generate leaks for each sector
  for (const sector of SECTORS) {
    // Each sector gets 12-16 leaks
    const numLeaks = rand(12, 16);
    for (let i = 0; i < numLeaks; i++) {
      leakCounter++;
      const source = pick(['darkweb','telegram','paste']);
      const severity = pick(SEVERITIES);
      const status = pick(STATUSES);
      const city = pick(CITIES);
      const org = pick(sector.orgs);
      const method = pick(BREACH_METHODS);
      const actor = pick(THREAT_ACTORS);
      const price = pick(PRICES);
      const platform = PLATFORMS[source];
      const recordCount = rand(500, 2000000);

      // Generate title
      const titleTemplate = pick(sector.titles);
      const title = titleTemplate.en.replace('{org}', org).replace('{platform}', platform.name).replace('{count}', recordCount.toLocaleString());
      const titleAr = titleTemplate.ar.replace('{org}', org).replace('{platform}', platform.name).replace('{count}', recordCount.toLocaleString());

      // Generate sample data (8 rows)
      const samples = [];
      for (let s = 0; s < 8; s++) {
        samples.push(sector.genSample(pick(CITIES)));
      }

      // Generate screenshots (2-3)
      const numScreenshots = rand(2, 3);
      const screenshots = pickN(SCREENSHOTS[source], numScreenshots);

      // Generate source URL
      const sourceUrl = pick(platform.urls) + rand(10000, 99999);

      // Generate description
      const descAr = sector.descTemplateAr.replace('{org}', org).replace('{platform}', platform.name);
      const descEn = sector.descTemplateEn.replace('{org}', org).replace('{platform}', platform.name);

      // Generate date (spread across 2024-2026)
      const year = pick([2024, 2024, 2025, 2025, 2025, 2025, 2026, 2026]);
      const month = rand(1, year === 2026 ? 2 : 12);
      const day = rand(1, 28);
      const detectedAt = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')} ${String(rand(0,23)).padStart(2,'0')}:${String(rand(0,59)).padStart(2,'0')}:${String(rand(0,59)).padStart(2,'0')}`;

      // AI analysis
      const aiSeverity = severity === 'low' ? pick(['low','medium']) : severity === 'medium' ? pick(['medium','high']) : severity;
      const aiConfidence = rand(78, 98);
      const numRecs = rand(3, 5);
      const aiRecsAr = pickN(AI_RECS_AR, numRecs);
      const aiRecsEn = pickN(AI_RECS_EN, numRecs);
      const aiSummaryAr = `تم الكشف عن تسريب بيانات ${severity === 'critical' ? 'خطير جداً' : severity === 'high' ? 'كبير' : 'متوسط'} لـ ${org} من قطاع ${sector.sectorAr} على ${platform.name}، مما أدى إلى كشف ${recordCount.toLocaleString()} سجلاً. تتضمن البيانات المخترقة معلومات شخصية حساسة (PII) مثل ${sector.piiTypes.slice(0,4).join(' و')}، مما يشكل خطراً كبيراً على الأفراد المتأثرين.`;
      const aiSummaryEn = `A ${severity} data leak from ${org} in the ${sector.sector} sector was detected on ${platform.name}, exposing ${recordCount.toLocaleString()} records. The breached data includes sensitive PII such as ${sector.piiTypes.slice(0,4).join(', ')}, posing significant risk to affected individuals.`;

      // PII types
      const piiTypes = pickN(sector.piiTypes, rand(3, Math.min(6, sector.piiTypes.length)));

      // Leak ID
      const leakId = `LK-${year}-${String(leakCounter).padStart(4,'0')}`;

      allLeaks.push({
        leakId, title, titleAr, source, severity, sector: sector.sector, sectorAr: sector.sectorAr,
        piiTypes: JSON.stringify(piiTypes), recordCount, status, description: descEn, descriptionAr: descAr,
        detectedAt, aiSeverity, aiSummary: aiSummaryEn, aiSummaryAr: aiSummaryAr,
        aiRecommendations: JSON.stringify(aiRecsEn), aiRecommendationsAr: JSON.stringify(aiRecsAr),
        aiConfidence, enrichedAt: detectedAt,
        region: city.reg, regionAr: city.regAr, city: city.en, cityAr: city.ar,
        latitude: city.lat, longitude: city.lng,
        sampleData: JSON.stringify(samples), sourceUrl, sourcePlatform: platform.name,
        screenshotUrls: JSON.stringify(screenshots), threatActor: actor, leakPrice: price,
        breachMethod: method.en, breachMethodAr: method.ar,
      });
    }
  }

  console.log(`Generated ${allLeaks.length} leak incidents. Inserting...`);

  // Insert in batches of 20
  const batchSize = 20;
  for (let i = 0; i < allLeaks.length; i += batchSize) {
    const batch = allLeaks.slice(i, i + batchSize);
    const placeholders = batch.map(() => '(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').join(',');
    const values = batch.flatMap(l => [
      l.leakId, l.title, l.titleAr, l.source, l.severity, l.sector, l.sectorAr,
      l.piiTypes, l.recordCount, l.status, l.description, l.descriptionAr,
      l.detectedAt, l.aiSeverity, l.aiSummary, l.aiSummaryAr,
      l.aiRecommendations, l.aiRecommendationsAr, l.aiConfidence, l.enrichedAt,
      l.region, l.regionAr, l.city, l.cityAr, l.latitude, l.longitude,
      l.sampleData, l.sourceUrl, l.sourcePlatform, l.screenshotUrls,
      l.threatActor, l.leakPrice, l.breachMethod, l.breachMethodAr,
    ]);
    await conn.query(`INSERT INTO leaks (leakId, title, titleAr, source, severity, sector, sectorAr, piiTypes, recordCount, status, description, descriptionAr, detectedAt, aiSeverity, aiSummary, aiSummaryAr, aiRecommendations, aiRecommendationsAr, aiConfidence, enrichedAt, region, regionAr, city, cityAr, latitude, longitude, sampleData, sourceUrl, sourcePlatform, screenshotUrls, threatActor, leakPrice, breachMethod, breachMethodAr) VALUES ${placeholders}`, values);
    process.stdout.write(`  Inserted ${Math.min(i + batchSize, allLeaks.length)}/${allLeaks.length}\r`);
  }
  console.log(`\n✅ Inserted ${allLeaks.length} leaks`);

  // Now generate evidence_chain records for each leak
  console.log('Generating evidence chain records...');
  const [leakRows] = await conn.query('SELECT id, leakId, detectedAt FROM leaks');
  let evidenceCount = 0;

  for (const leak of leakRows) {
    const numEvidence = rand(2, 5);
    let prevHash = '0'.repeat(64);

    for (let e = 0; e < numEvidence; e++) {
      evidenceCount++;
      const evidenceId = `EV-${leak.leakId}-${String(e+1).padStart(3,'0')}`;
      const evidenceType = pick(['text','screenshot','file','metadata']);
      const contentHash = crypto.createHash('sha256').update(evidenceId + Date.now() + Math.random()).digest('hex');
      const capturedBy = pick(['Rasid Auto Scanner','Telegram Bot Monitor','Dark Web Crawler','Paste Site Monitor','Manual Investigation','AI Detection Engine','OSINT Collector']);

      const metadata = {
        fileSize: rand(1024, 10485760) + ' bytes',
        format: pick(['JSON','CSV','SQL','TXT','XLSX','PDF','Screenshot PNG']),
        captureMethod: pick(['Automated crawl','API monitoring','Manual screenshot','Bot detection','Keyword alert','Pattern matching']),
        verificationStatus: pick(['verified','pending','cross-referenced']),
        sha256: contentHash,
        notes: pick([
          'تم التقاط الدليل تلقائياً بواسطة نظام الرصد',
          'تم التحقق من صحة البيانات عبر مصادر متعددة',
          'تم حفظ نسخة احتياطية في المستودع الآمن',
          'تم تسجيل الدليل في سلسلة الحفظ الرقمية',
          'تم مطابقة البيانات مع قواعد بيانات معروفة',
        ]),
      };

      await conn.query(
        `INSERT INTO evidence_chain (evidenceId, evidenceLeakId, evidenceType, contentHash, previousHash, blockIndex, capturedBy, evidenceMetadata, isVerified, capturedAt) VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [evidenceId, leak.leakId, evidenceType, contentHash, prevHash, e, capturedBy, JSON.stringify(metadata), rand(0,1), leak.detectedAt]
      );
      prevHash = contentHash;
    }
  }
  console.log(`✅ Inserted ${evidenceCount} evidence chain records`);

  // Update seller_profiles with new counts
  console.log('Updating seller profiles...');
  for (const actor of THREAT_ACTORS.slice(0, 12)) {
    const [counts] = await conn.query('SELECT COUNT(*) as cnt, SUM(recordCount) as total FROM leaks WHERE threatActor = ?', [actor]);
    if (counts[0].cnt > 0) {
      await conn.query('UPDATE seller_profiles SET totalLeaks = ?, sellerTotalRecords = ? WHERE sellerName = ?', [counts[0].cnt, counts[0].total, actor]);
    }
  }
  console.log('✅ Updated seller profiles');

  const [finalCount] = await conn.query('SELECT COUNT(*) as cnt FROM leaks');
  console.log(`\n🎉 Total leaks in database: ${finalCount[0].cnt}`);

  await conn.end();
}

main().catch(err => { console.error('Error:', err); process.exit(1); });
