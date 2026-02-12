/**
 * Seed comprehensive training content for Smart Rasid AI
 * Includes: PDPL articles, NDMO policies, data breach procedures, cybersecurity best practices
 * Run: node server/seed-training-content.mjs
 */
import 'dotenv/config';
import mysql from 'mysql2/promise';
import crypto from 'crypto';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

function genId() {
  return crypto.randomBytes(8).toString('hex');
}

// ═══════════════════════════════════════════════════════════════
// 1. KNOWLEDGE BASE ENTRIES
// ═══════════════════════════════════════════════════════════════

const knowledgeEntries = [
  // ═══ PDPL REGULATIONS ═══
  {
    entryId: `kb-pdpl-overview-${genId()}`,
    category: 'regulation',
    title: 'Personal Data Protection Law (PDPL) - Overview',
    titleAr: 'نظام حماية البيانات الشخصية - نظرة عامة',
    content: `The Saudi Personal Data Protection Law (PDPL) was issued by Royal Decree No. (M/19) dated 9/2/1443H (September 2021). It is the Kingdom's first comprehensive data protection legislation. The law applies to any processing of personal data related to individuals in Saudi Arabia, including processing by entities outside the Kingdom. The Saudi Data and AI Authority (SDAIA) is the competent authority overseeing its implementation, with the National Data Management Office (NDMO) responsible for data governance policies. The law came into full effect on September 14, 2023, with a one-year grace period for compliance that ended September 14, 2024.`,
    contentAr: `صدر نظام حماية البيانات الشخصية بموجب المرسوم الملكي رقم (م/19) بتاريخ 9/2/1443هـ (سبتمبر 2021). وهو أول تشريع شامل لحماية البيانات في المملكة العربية السعودية. يُطبق النظام على أي عملية معالجة لبيانات شخصية تتعلق بالأفراد في المملكة، بما في ذلك المعالجة من جهات خارج المملكة. الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا) هي الجهة المختصة بالإشراف على تطبيقه، ومكتب إدارة البيانات الوطنية (NDMO) مسؤول عن سياسات حوكمة البيانات. دخل النظام حيز التنفيذ الكامل في 14 سبتمبر 2023، مع فترة سماح للامتثال مدتها سنة واحدة انتهت في 14 سبتمبر 2024.`,
    tags: JSON.stringify(['PDPL', 'نظام حماية البيانات', 'سدايا', 'SDAIA', 'تشريع']),
  },
  {
    entryId: `kb-pdpl-definitions-${genId()}`,
    category: 'regulation',
    title: 'PDPL Article 1 - Key Definitions',
    titleAr: 'المادة الأولى - التعريفات الأساسية',
    content: `Article 1 of PDPL defines key terms: Personal Data means any data that can identify an individual directly or indirectly (name, ID number, addresses, phone numbers, bank accounts, photos). Processing includes any operation on personal data (collection, recording, storage, modification, retrieval, disclosure, transfer, deletion). Sensitive Data includes ethnic origin, religious beliefs, criminal records, biometric data, genetic data, and health data. Data Controller is the entity determining the purpose and means of processing. Data Processor processes data on behalf of the controller. Data Subject is the individual whose data is being processed.`,
    contentAr: `تُعرّف المادة الأولى من النظام المصطلحات الأساسية: البيانات الشخصية هي كل بيان من شأنه أن يؤدي إلى معرفة الفرد على وجه التحديد بصفة مباشرة أو غير مباشرة (الاسم، رقم الهوية، العناوين، أرقام التواصل، أرقام الحسابات البنكية، صور الفرد). المعالجة تشمل أي عملية تُجرى على البيانات الشخصية (الجمع، التسجيل، الحفظ، التخزين، التعديل، الاسترجاع، الإفصاح، النقل، المسح، الإتلاف). البيانات الحساسة تشمل الأصل العرقي، المعتقد الديني، البيانات الأمنية والجنائية، السمات الحيوية، البيانات الوراثية والصحية. جهة التحكم هي الجهة التي تحدد الغرض من المعالجة. جهة المعالجة تعالج البيانات نيابةً عن جهة التحكم. صاحب البيانات هو الفرد الذي تتعلق به البيانات.`,
    tags: JSON.stringify(['PDPL', 'تعريفات', 'بيانات شخصية', 'بيانات حساسة', 'المادة الأولى']),
  },
  {
    entryId: `kb-pdpl-scope-${genId()}`,
    category: 'regulation',
    title: 'PDPL Article 2 - Scope of Application',
    titleAr: 'المادة الثانية - نطاق التطبيق',
    content: `Article 2 defines the scope: The law applies to any processing of personal data related to individuals in Saudi Arabia by any means, including processing of data related to residents by entities outside the Kingdom. It also covers deceased persons' data if it could identify them or their family members. Exception: Personal or family use of data is excluded, as long as the data is not published or disclosed to others.`,
    contentAr: `تحدد المادة الثانية نطاق التطبيق: يُطبق النظام على أي عملية معالجة لبيانات شخصية تتعلق بالأفراد في المملكة بأي وسيلة كانت، بما في ذلك معالجة بيانات المقيمين من جهات خارج المملكة. يشمل ذلك بيانات المتوفى إذا كانت ستؤدي إلى معرفته أو معرفة أحد أفراد أسرته. الاستثناء: يُستثنى الاستخدام الشخصي أو العائلي ما لم يتم نشر البيانات أو الإفصاح عنها للغير.`,
    tags: JSON.stringify(['PDPL', 'نطاق التطبيق', 'المادة الثانية', 'استثناءات']),
  },
  {
    entryId: `kb-pdpl-rights-${genId()}`,
    category: 'regulation',
    title: 'PDPL Article 4 - Data Subject Rights',
    titleAr: 'المادة الرابعة - حقوق صاحب البيانات الشخصية',
    content: `Article 4 establishes data subject rights: (1) Right to know - be informed of the legal basis and purpose of data collection. (2) Right of access - access personal data held by the controller. (3) Right to obtain data in a readable and clear format. (4) Right to request correction, completion, or updating of data. (5) Right to request destruction of data when the purpose has ended. These rights are subject to conditions specified in the implementing regulations.`,
    contentAr: `تحدد المادة الرابعة حقوق صاحب البيانات: (1) الحق في العلم - إحاطته بالمسوغ النظامي لجمع بياناته والغرض منها. (2) الحق في الوصول - الوصول إلى بياناته الشخصية لدى جهة التحكم. (3) الحق في الحصول على بياناته بصيغة مقروءة وواضحة. (4) الحق في طلب تصحيح بياناته أو إتمامها أو تحديثها. (5) الحق في طلب إتلاف بياناته عند انتهاء الغرض منها. تخضع هذه الحقوق للشروط المحددة في اللوائح التنفيذية.`,
    tags: JSON.stringify(['PDPL', 'حقوق', 'صاحب البيانات', 'المادة الرابعة', 'الوصول', 'التصحيح', 'الإتلاف']),
  },
  {
    entryId: `kb-pdpl-collection-${genId()}`,
    category: 'regulation',
    title: 'PDPL Articles 5-6 - Data Collection and Consent',
    titleAr: 'المادتان الخامسة والسادسة - جمع البيانات والموافقة',
    content: `Article 5: Personal data must be collected directly from the data subject. The data subject must be informed of the purpose of collection and processing. Article 6: Consent must be explicit and written. The data subject has the right to withdraw consent at any time. Processing must be limited to the specified purpose. Data must not be kept longer than necessary for the purpose of collection.`,
    contentAr: `المادة الخامسة: لا يجوز جمع البيانات الشخصية إلا من صاحبها مباشرة. يجب إبلاغ صاحب البيانات بالغرض من الجمع والمعالجة. المادة السادسة: يجب أن تكون الموافقة صريحة ومكتوبة. يحق لصاحب البيانات سحب موافقته في أي وقت. يجب أن تقتصر المعالجة على الغرض المحدد. لا يجوز الاحتفاظ بالبيانات أكثر من المدة اللازمة لتحقيق غرض الجمع.`,
    tags: JSON.stringify(['PDPL', 'جمع البيانات', 'الموافقة', 'المادة الخامسة', 'المادة السادسة']),
  },
  {
    entryId: `kb-pdpl-disclosure-${genId()}`,
    category: 'regulation',
    title: 'PDPL Article 10 - Disclosure of Personal Data',
    titleAr: 'المادة العاشرة - الإفصاح عن البيانات الشخصية',
    content: `Article 10: Personal data shall not be disclosed without the consent of the data subject. Exceptions include: execution of an obligation under another law, serving public interest, protecting public health or safety, and when the data has been previously made public by the data subject. Disclosure must be limited to the minimum necessary data.`,
    contentAr: `المادة العاشرة: لا يجوز الإفصاح عن البيانات الشخصية إلا بموافقة صاحبها. الاستثناءات تشمل: تنفيذ التزام بموجب نظام آخر، خدمة المصلحة العامة، حماية الصحة أو السلامة العامة، وعندما تكون البيانات قد نُشرت سابقاً من قبل صاحبها. يجب أن يقتصر الإفصاح على الحد الأدنى الضروري من البيانات.`,
    tags: JSON.stringify(['PDPL', 'الإفصاح', 'المادة العاشرة', 'استثناءات']),
  },
  {
    entryId: `kb-pdpl-article12-${genId()}`,
    category: 'regulation',
    title: 'PDPL Article 12 - Privacy Policy Requirements',
    titleAr: 'المادة الثانية عشرة - متطلبات سياسة الخصوصية',
    content: `Article 12 requires data controllers to establish a privacy policy covering 8 key areas: (1) Defining the purpose of collecting personal data. (2) Defining the content of personal data to be collected. (3) Defining the method of collecting personal data. (4) Defining the means of storing personal data. (5) Defining how personal data is processed. (6) Defining how personal data is destroyed. (7) Defining the rights of the data subject regarding their data. (8) Defining how the data subject exercises these rights.`,
    contentAr: `تتطلب المادة الثانية عشرة من جهات التحكم وضع سياسة خصوصية تغطي 8 مجالات رئيسية: (1) تحديد الغرض من جمع البيانات الشخصية. (2) تحديد محتوى البيانات الشخصية المطلوب جمعها. (3) تحديد طريقة جمع البيانات الشخصية. (4) تحديد وسيلة حفظ البيانات الشخصية. (5) تحديد كيفية معالجة البيانات الشخصية. (6) تحديد كيفية إتلاف البيانات الشخصية. (7) تحديد حقوق صاحب البيانات الشخصية فيما يتعلق ببياناته. (8) تحديد كيفية ممارسة صاحب البيانات الشخصية لهذه الحقوق.`,
    tags: JSON.stringify(['PDPL', 'سياسة الخصوصية', 'المادة الثانية عشرة', 'جهة التحكم']),
  },
  {
    entryId: `kb-pdpl-sensitive-${genId()}`,
    category: 'regulation',
    title: 'PDPL Article 14 - Sensitive Data Processing',
    titleAr: 'المادة الرابعة عشرة - معالجة البيانات الحساسة',
    content: `Article 14: Processing of sensitive data is prohibited without explicit consent. Sensitive data includes ethnic/racial origin, religious/intellectual/political beliefs, security and criminal data, biometric data, genetic data, health data, and data indicating unknown parentage. Exceptions exist for cases of necessity as defined by the implementing regulations.`,
    contentAr: `المادة الرابعة عشرة: يُحظر معالجة البيانات الحساسة بدون موافقة صريحة. تشمل البيانات الحساسة: الأصل العرقي أو الإثني، المعتقد الديني أو الفكري أو السياسي، البيانات الأمنية والجنائية، السمات الحيوية، البيانات الوراثية، البيانات الصحية، والبيانات الدالة على أن الفرد مجهول الأبوين. توجد استثناءات في حالات الضرورة وفقاً للوائح التنفيذية.`,
    tags: JSON.stringify(['PDPL', 'بيانات حساسة', 'المادة الرابعة عشرة', 'معالجة']),
  },
  {
    entryId: `kb-pdpl-protection-${genId()}`,
    category: 'regulation',
    title: 'PDPL Article 19 - Data Protection Measures',
    titleAr: 'المادة التاسعة عشرة - تدابير حماية البيانات',
    content: `Article 19: Data controllers must implement organizational, administrative, and technical measures necessary to protect personal data. This includes measures appropriate to the nature and sensitivity of the data, ensuring confidentiality, integrity, and availability. Controllers must prevent unauthorized access, modification, disclosure, or destruction of personal data.`,
    contentAr: `المادة التاسعة عشرة: يجب على جهة التحكم اتخاذ التدابير التنظيمية والإدارية والتقنية اللازمة لحماية البيانات الشخصية. يشمل ذلك تدابير مناسبة لطبيعة البيانات ودرجة حساسيتها، لضمان السرية والسلامة والتوافر. يجب منع الوصول غير المصرح به أو التعديل أو الإفصاح أو الإتلاف للبيانات الشخصية.`,
    tags: JSON.stringify(['PDPL', 'حماية البيانات', 'المادة التاسعة عشرة', 'تدابير أمنية']),
  },
  {
    entryId: `kb-pdpl-transfer-${genId()}`,
    category: 'regulation',
    title: 'PDPL Article 29 - Cross-Border Data Transfer',
    titleAr: 'المادة التاسعة والعشرون - نقل البيانات خارج المملكة',
    content: `Article 29: Personal data shall not be transferred outside the Kingdom except in accordance with specific controls. The level of protection in the receiving country must be adequate. Transfer is permitted when necessary for the performance of a contract, protection of public interest, or with explicit consent of the data subject. The implementing regulations specify detailed conditions for cross-border transfers.`,
    contentAr: `المادة التاسعة والعشرون: لا يجوز نقل البيانات الشخصية خارج المملكة إلا وفقاً لضوابط محددة. يجب أن يكون مستوى الحماية في الدولة المستقبلة مناسباً. يُسمح بالنقل عند الضرورة لتنفيذ عقد، أو حماية المصلحة العامة، أو بموافقة صريحة من صاحب البيانات. تحدد اللوائح التنفيذية الشروط التفصيلية للنقل عبر الحدود.`,
    tags: JSON.stringify(['PDPL', 'نقل البيانات', 'المادة التاسعة والعشرون', 'عبر الحدود']),
  },
  {
    entryId: `kb-pdpl-penalties-${genId()}`,
    category: 'regulation',
    title: 'PDPL Articles 35-36 - Penalties and Sanctions',
    titleAr: 'المادتان 35-36 - العقوبات والجزاءات',
    content: `Article 35: Violations are punishable by imprisonment up to 2 years and/or fines up to 3 million SAR. Penalties are doubled for repeat offenses. A summary of the judgment may be published at the violator's expense. Article 36: Additional sanctions include confiscation of proceeds from the violation and temporary or permanent closure of the violating establishment. The competent authority may also impose administrative fines up to 5 million SAR.`,
    contentAr: `المادة الخامسة والثلاثون: يُعاقب بالسجن مدة لا تزيد على سنتين وبغرامة لا تزيد على 3 ملايين ريال أو بإحداهما. تُضاعف العقوبة في حال التكرار. يجوز نشر ملخص الحكم على نفقة المخالف. المادة السادسة والثلاثون: تشمل العقوبات الإضافية مصادرة الأموال المتحصلة من المخالفة وإغلاق المنشأة المخالفة مؤقتاً أو نهائياً. يجوز للجهة المختصة فرض غرامات إدارية تصل إلى 5 ملايين ريال.`,
    tags: JSON.stringify(['PDPL', 'عقوبات', 'غرامات', 'المادة 35', 'المادة 36']),
  },
  {
    entryId: `kb-pdpl-breach-notification-${genId()}`,
    category: 'regulation',
    title: 'PDPL Article 37 - Data Breach Notification',
    titleAr: 'المادة السابعة والثلاثون - الإبلاغ عن تسريبات البيانات',
    content: `Article 37: Data controllers must notify the competent authority (SDAIA) of any personal data breach within 72 hours. If the breach poses a risk to the data subject's rights, the data subject must also be notified. The notification must include the nature of the breach, types of data affected, estimated number of affected individuals, measures taken to address the breach, and recommendations for the data subject to mitigate potential harm.`,
    contentAr: `المادة السابعة والثلاثون: يجب على جهة التحكم إبلاغ الجهة المختصة (سدايا) عن أي تسريب للبيانات الشخصية خلال 72 ساعة. إذا كان التسريب يشكل خطراً على حقوق صاحب البيانات، يجب إبلاغه أيضاً. يجب أن يتضمن الإبلاغ: طبيعة التسريب، أنواع البيانات المتأثرة، العدد التقديري للأفراد المتأثرين، التدابير المتخذة لمعالجة التسريب، والتوصيات لصاحب البيانات للحد من الأضرار المحتملة.`,
    tags: JSON.stringify(['PDPL', 'تسريب بيانات', 'إبلاغ', 'المادة 37', '72 ساعة']),
  },

  // ═══ NDMO POLICIES ═══
  {
    entryId: `kb-ndmo-overview-${genId()}`,
    category: 'policy',
    title: 'NDMO - National Data Management Office Overview',
    titleAr: 'مكتب إدارة البيانات الوطنية - نظرة عامة',
    content: `The National Data Management Office (NDMO) is a sector within the Saudi Data and AI Authority (SDAIA). NDMO is responsible for developing policies, governance mechanisms, standards, and controls for data management in Saudi Arabia. Key objectives include: proposing regulations and policies for data governance, developing national data standards, overseeing implementation of the PDPL, building data management capabilities across government entities, and promoting data sharing and open data initiatives aligned with Saudi Vision 2030.`,
    contentAr: `مكتب إدارة البيانات الوطنية (NDMO) هو قطاع تابع للهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا). يتولى المكتب مسؤولية تطوير السياسات وآليات الحوكمة والمعايير والضوابط لإدارة البيانات في المملكة. أهدافه الرئيسية تشمل: اقتراح الأنظمة والسياسات لحوكمة البيانات، تطوير المعايير الوطنية للبيانات، الإشراف على تطبيق نظام حماية البيانات الشخصية، بناء قدرات إدارة البيانات في الجهات الحكومية، وتعزيز مبادرات مشاركة البيانات والبيانات المفتوحة بما يتوافق مع رؤية 2030.`,
    tags: JSON.stringify(['NDMO', 'مكتب إدارة البيانات', 'سدايا', 'حوكمة البيانات', 'رؤية 2030']),
  },
  {
    entryId: `kb-ndmo-governance-${genId()}`,
    category: 'policy',
    title: 'NDMO Data Governance Standards',
    titleAr: 'معايير حوكمة البيانات - NDMO',
    content: `NDMO Data Governance Standards require organizations to: (1) Establish a Data Governance Office to implement data management strategy. (2) Define data governance roles including Data Owner, Data Steward, and Data Custodian. (3) Implement data classification (Public, Internal, Confidential, Restricted). (4) Maintain a data catalog documenting all data assets. (5) Implement data quality management processes. (6) Establish data lifecycle management from creation to destruction. (7) Implement access control and security measures. (8) Conduct regular data audits and compliance assessments.`,
    contentAr: `تتطلب معايير حوكمة البيانات من NDMO من المنظمات: (1) إنشاء مكتب حوكمة بيانات لتنفيذ استراتيجية إدارة البيانات. (2) تحديد أدوار حوكمة البيانات بما في ذلك مالك البيانات ومشرف البيانات وأمين البيانات. (3) تطبيق تصنيف البيانات (عامة، داخلية، سرية، مقيدة). (4) الحفاظ على كتالوج بيانات يوثق جميع أصول البيانات. (5) تطبيق عمليات إدارة جودة البيانات. (6) إنشاء إدارة دورة حياة البيانات من الإنشاء إلى الإتلاف. (7) تطبيق ضوابط الوصول والتدابير الأمنية. (8) إجراء عمليات تدقيق منتظمة للبيانات وتقييمات الامتثال.`,
    tags: JSON.stringify(['NDMO', 'حوكمة البيانات', 'معايير', 'تصنيف البيانات', 'جودة البيانات']),
  },
  {
    entryId: `kb-ndmo-data-classification-${genId()}`,
    category: 'policy',
    title: 'NDMO Data Classification Framework',
    titleAr: 'إطار تصنيف البيانات - NDMO',
    content: `NDMO's data classification framework defines four levels: (1) Top Secret/Restricted: Data whose unauthorized disclosure could cause exceptionally grave damage to national security. Requires highest security controls. (2) Confidential: Data whose disclosure could cause serious damage. Requires strong encryption and access controls. (3) Internal: Data for internal use only. Requires basic access controls. (4) Public: Data intended for public access. No special controls required. Organizations must classify all data assets and apply appropriate protection measures based on classification level.`,
    contentAr: `يحدد إطار تصنيف البيانات من NDMO أربعة مستويات: (1) سري للغاية/مقيد: بيانات يمكن أن يسبب الإفصاح غير المصرح به عنها ضرراً بالغاً للأمن الوطني. يتطلب أعلى ضوابط أمنية. (2) سري: بيانات يمكن أن يسبب الإفصاح عنها ضرراً جسيماً. يتطلب تشفيراً قوياً وضوابط وصول. (3) داخلي: بيانات للاستخدام الداخلي فقط. يتطلب ضوابط وصول أساسية. (4) عام: بيانات مخصصة للوصول العام. لا تتطلب ضوابط خاصة. يجب على المنظمات تصنيف جميع أصول البيانات وتطبيق تدابير الحماية المناسبة.`,
    tags: JSON.stringify(['NDMO', 'تصنيف البيانات', 'سري', 'مقيد', 'حماية']),
  },

  // ═══ DATA BREACH PROCEDURES ═══
  {
    entryId: `kb-breach-response-${genId()}`,
    category: 'instruction',
    title: 'Data Breach Response Procedure',
    titleAr: 'إجراءات الاستجابة لتسريب البيانات',
    content: `Data Breach Response Steps: Phase 1 - Detection & Containment (0-4 hours): Identify the breach source, isolate affected systems, preserve evidence, activate incident response team. Phase 2 - Assessment (4-24 hours): Determine scope and severity, identify affected data types and individuals, assess potential impact, classify breach severity (Critical/High/Medium/Low). Phase 3 - Notification (within 72 hours): Notify SDAIA as required by PDPL Article 37, notify affected data subjects if high risk, prepare public statement if necessary. Phase 4 - Remediation (1-30 days): Implement fixes, update security controls, conduct forensic analysis, document lessons learned. Phase 5 - Post-Incident Review: Update policies and procedures, conduct staff training, implement preventive measures.`,
    contentAr: `خطوات الاستجابة لتسريب البيانات: المرحلة 1 - الكشف والاحتواء (0-4 ساعات): تحديد مصدر التسريب، عزل الأنظمة المتأثرة، حفظ الأدلة، تفعيل فريق الاستجابة للحوادث. المرحلة 2 - التقييم (4-24 ساعة): تحديد النطاق والخطورة، تحديد أنواع البيانات والأفراد المتأثرين، تقييم التأثير المحتمل، تصنيف خطورة التسريب (حرج/عالي/متوسط/منخفض). المرحلة 3 - الإبلاغ (خلال 72 ساعة): إبلاغ سدايا وفقاً للمادة 37 من PDPL، إبلاغ أصحاب البيانات المتأثرين إذا كان الخطر عالياً، إعداد بيان عام إذا لزم الأمر. المرحلة 4 - المعالجة (1-30 يوم): تنفيذ الإصلاحات، تحديث الضوابط الأمنية، إجراء تحليل جنائي، توثيق الدروس المستفادة. المرحلة 5 - المراجعة: تحديث السياسات والإجراءات، تدريب الموظفين، تنفيذ تدابير وقائية.`,
    tags: JSON.stringify(['تسريب بيانات', 'استجابة للحوادث', 'إبلاغ', '72 ساعة', 'احتواء']),
  },
  {
    entryId: `kb-breach-severity-${genId()}`,
    category: 'instruction',
    title: 'Data Breach Severity Classification',
    titleAr: 'تصنيف خطورة تسريب البيانات',
    content: `Breach Severity Levels: CRITICAL (Score 90-100): Sensitive data exposed (health, financial, biometric), large-scale breach (>10,000 records), data published on dark web, immediate financial or physical harm risk. HIGH (Score 70-89): Personal identifiers exposed (ID numbers, addresses), medium-scale breach (1,000-10,000 records), data accessible to unauthorized parties. MEDIUM (Score 40-69): Non-sensitive personal data exposed (names, emails), small-scale breach (<1,000 records), limited exposure time. LOW (Score 0-39): Minimal personal data exposed, internal breach contained quickly, no evidence of data misuse.`,
    contentAr: `مستويات خطورة التسريب: حرج (90-100): بيانات حساسة مكشوفة (صحية، مالية، حيوية)، تسريب واسع النطاق (أكثر من 10,000 سجل)، بيانات منشورة على الويب المظلم، خطر ضرر مالي أو جسدي فوري. عالي (70-89): معرّفات شخصية مكشوفة (أرقام هوية، عناوين)، تسريب متوسط النطاق (1,000-10,000 سجل)، بيانات متاحة لأطراف غير مصرح لها. متوسط (40-69): بيانات شخصية غير حساسة مكشوفة (أسماء، بريد إلكتروني)، تسريب محدود (أقل من 1,000 سجل)، فترة تعرض محدودة. منخفض (0-39): حد أدنى من البيانات الشخصية المكشوفة، تسريب داخلي تم احتواؤه بسرعة، لا دليل على سوء استخدام.`,
    tags: JSON.stringify(['تسريب بيانات', 'تصنيف خطورة', 'حرج', 'عالي', 'متوسط', 'منخفض']),
  },

  // ═══ CYBERSECURITY BEST PRACTICES ═══
  {
    entryId: `kb-cyber-prevention-${genId()}`,
    category: 'instruction',
    title: 'Data Leak Prevention Best Practices',
    titleAr: 'أفضل الممارسات لمنع تسريب البيانات',
    content: `Key prevention measures: (1) Data Loss Prevention (DLP) tools to monitor and block unauthorized data transfers. (2) Encryption at rest and in transit for all sensitive data. (3) Multi-factor authentication (MFA) for all system access. (4) Regular security awareness training for employees. (5) Network segmentation to isolate sensitive data. (6) Regular vulnerability assessments and penetration testing. (7) Endpoint detection and response (EDR) solutions. (8) Zero-trust architecture implementation. (9) Regular backup and disaster recovery testing. (10) Incident response plan with regular drills.`,
    contentAr: `تدابير الوقاية الرئيسية: (1) أدوات منع فقدان البيانات (DLP) لمراقبة ومنع النقل غير المصرح به. (2) التشفير أثناء التخزين والنقل لجميع البيانات الحساسة. (3) المصادقة متعددة العوامل (MFA) لجميع عمليات الوصول. (4) تدريب منتظم على الوعي الأمني للموظفين. (5) تقسيم الشبكة لعزل البيانات الحساسة. (6) تقييمات منتظمة للثغرات واختبارات الاختراق. (7) حلول كشف واستجابة نقاط النهاية (EDR). (8) تطبيق بنية الثقة الصفرية. (9) نسخ احتياطي منتظم واختبار التعافي من الكوارث. (10) خطة استجابة للحوادث مع تدريبات منتظمة.`,
    tags: JSON.stringify(['أمن سيبراني', 'منع التسريب', 'DLP', 'تشفير', 'MFA']),
  },
  {
    entryId: `kb-cyber-dark-web-${genId()}`,
    category: 'instruction',
    title: 'Dark Web Monitoring for Data Leaks',
    titleAr: 'مراقبة الويب المظلم لتسريبات البيانات',
    content: `Dark web monitoring involves scanning underground forums, marketplaces, and paste sites for exposed organizational data. Key monitoring targets: (1) Paste sites (Pastebin, Ghostbin, etc.) for dumped credentials and data. (2) Dark web forums for sale of stolen databases. (3) Telegram channels used for data trading. (4) Breach databases and leak aggregators. (5) Certificate transparency logs for unauthorized domain certificates. Monitoring should be continuous and automated, with alerts for any matches to organizational domains, email addresses, or sensitive keywords.`,
    contentAr: `تتضمن مراقبة الويب المظلم فحص المنتديات السرية والأسواق ومواقع اللصق للبحث عن بيانات مؤسسية مكشوفة. أهداف المراقبة الرئيسية: (1) مواقع اللصق (Pastebin, Ghostbin) للبحث عن بيانات اعتماد مسربة. (2) منتديات الويب المظلم لبيع قواعد البيانات المسروقة. (3) قنوات تيليجرام المستخدمة لتداول البيانات. (4) قواعد بيانات الاختراقات ومجمعات التسريبات. (5) سجلات شفافية الشهادات للشهادات غير المصرح بها. يجب أن تكون المراقبة مستمرة وآلية، مع تنبيهات لأي تطابق مع نطاقات المؤسسة أو عناوين البريد الإلكتروني أو الكلمات المفتاحية الحساسة.`,
    tags: JSON.stringify(['ويب مظلم', 'مراقبة', 'تسريبات', 'Pastebin', 'تيليجرام']),
  },
  {
    entryId: `kb-cyber-google-dorking-${genId()}`,
    category: 'instruction',
    title: 'Google Dorking for Data Leak Detection',
    titleAr: 'استعلامات جوجل المتقدمة لكشف تسريبات البيانات',
    content: `Google Dorking uses advanced search operators to find exposed data: Common dorks for leak detection: site:pastebin.com "company.com" - Find company data on paste sites. filetype:sql "password" - Find exposed database dumps. filetype:csv "email" "phone" - Find exposed spreadsheets with personal data. inurl:admin intitle:login - Find exposed admin panels. "index of" "backup" - Find exposed backup directories. ext:env "DB_PASSWORD" - Find exposed environment files. Best practice: Run regular automated dork searches against your organization's domains and keywords to detect exposures before attackers find them.`,
    contentAr: `تستخدم استعلامات جوجل المتقدمة (Google Dorking) عوامل بحث متقدمة للعثور على بيانات مكشوفة. استعلامات شائعة لكشف التسريبات: site:pastebin.com "company.com" - البحث عن بيانات الشركة في مواقع اللصق. filetype:sql "password" - البحث عن تفريغات قواعد بيانات مكشوفة. filetype:csv "email" "phone" - البحث عن جداول بيانات مكشوفة تحتوي بيانات شخصية. inurl:admin intitle:login - البحث عن لوحات إدارة مكشوفة. "index of" "backup" - البحث عن مجلدات نسخ احتياطي مكشوفة. ext:env "DB_PASSWORD" - البحث عن ملفات بيئة مكشوفة. أفضل ممارسة: تشغيل بحث آلي منتظم ضد نطاقات المؤسسة لكشف التعرضات قبل أن يجدها المهاجمون.`,
    tags: JSON.stringify(['Google Dorking', 'استعلامات متقدمة', 'كشف تسريبات', 'OSINT']),
  },

  // ═══ GLOSSARY ═══
  {
    entryId: `kb-glossary-terms-${genId()}`,
    category: 'glossary',
    title: 'Data Protection Glossary - Key Terms',
    titleAr: 'مسرد مصطلحات حماية البيانات',
    content: `Key terms: PII (Personally Identifiable Information), DLP (Data Loss Prevention), DPIA (Data Protection Impact Assessment), DPO (Data Protection Officer), Pseudonymization, Anonymization, Data Minimization, Purpose Limitation, Storage Limitation, Breach Notification, Cross-border Transfer, Data Portability, Right to Erasure, Consent Management, Privacy by Design, Privacy by Default.`,
    contentAr: `مصطلحات رئيسية: PII (معلومات التعريف الشخصية)، DLP (منع فقدان البيانات)، DPIA (تقييم تأثير حماية البيانات)، DPO (مسؤول حماية البيانات)، التسمية المستعارة، إخفاء الهوية، تقليل البيانات، تحديد الغرض، تحديد التخزين، إبلاغ التسريب، النقل عبر الحدود، قابلية نقل البيانات، الحق في المحو، إدارة الموافقة، الخصوصية بالتصميم، الخصوصية بالإعداد الافتراضي.`,
    tags: JSON.stringify(['مسرد', 'مصطلحات', 'PII', 'DLP', 'DPIA', 'DPO']),
  },

  // ═══ FAQ ═══
  {
    entryId: `kb-faq-pdpl-apply-${genId()}`,
    category: 'faq',
    title: 'FAQ: Who does PDPL apply to?',
    titleAr: 'سؤال شائع: على من يُطبق نظام حماية البيانات الشخصية؟',
    content: `PDPL applies to all entities (public and private) that process personal data of individuals in Saudi Arabia, regardless of where the processing takes place. This includes Saudi companies, government agencies, and foreign companies processing data of Saudi residents. The only exception is personal/family use of data that is not published or disclosed to others.`,
    contentAr: `يُطبق نظام حماية البيانات الشخصية على جميع الجهات (العامة والخاصة) التي تعالج بيانات شخصية للأفراد في المملكة العربية السعودية، بغض النظر عن مكان المعالجة. يشمل ذلك الشركات السعودية والجهات الحكومية والشركات الأجنبية التي تعالج بيانات المقيمين في المملكة. الاستثناء الوحيد هو الاستخدام الشخصي أو العائلي للبيانات التي لا تُنشر أو تُفصح للغير.`,
    tags: JSON.stringify(['PDPL', 'نطاق التطبيق', 'سؤال شائع']),
  },
  {
    entryId: `kb-faq-breach-report-${genId()}`,
    category: 'faq',
    title: 'FAQ: How to report a data breach?',
    titleAr: 'سؤال شائع: كيف يتم الإبلاغ عن تسريب بيانات؟',
    content: `To report a data breach under PDPL: (1) Notify SDAIA within 72 hours of discovering the breach through the Data Governance Platform (dgp.sdaia.gov.sa). (2) Include: nature of the breach, types of data affected, estimated number of affected individuals, measures taken, and recommendations for data subjects. (3) If the breach poses high risk to data subjects, notify them directly. (4) Document all steps taken for compliance evidence. (5) Cooperate with SDAIA investigation if required.`,
    contentAr: `للإبلاغ عن تسريب بيانات وفقاً لنظام PDPL: (1) إبلاغ سدايا خلال 72 ساعة من اكتشاف التسريب عبر منصة حوكمة البيانات (dgp.sdaia.gov.sa). (2) تضمين: طبيعة التسريب، أنواع البيانات المتأثرة، العدد التقديري للمتأثرين، التدابير المتخذة، والتوصيات لأصحاب البيانات. (3) إذا كان التسريب يشكل خطراً عالياً على أصحاب البيانات، يجب إبلاغهم مباشرة. (4) توثيق جميع الخطوات المتخذة كدليل على الامتثال. (5) التعاون مع تحقيق سدايا إذا لزم الأمر.`,
    tags: JSON.stringify(['تسريب بيانات', 'إبلاغ', 'سدايا', '72 ساعة', 'سؤال شائع']),
  },
  {
    entryId: `kb-faq-penalties-${genId()}`,
    category: 'faq',
    title: 'FAQ: What are the penalties for PDPL violations?',
    titleAr: 'سؤال شائع: ما هي عقوبات مخالفة نظام حماية البيانات؟',
    content: `PDPL violation penalties include: Criminal penalties - imprisonment up to 2 years and/or fines up to 3 million SAR. Administrative fines - up to 5 million SAR per violation. Additional sanctions - confiscation of violation proceeds, temporary or permanent closure. Repeat offenses - penalties are doubled. Public disclosure - judgment summary may be published at violator's expense. Sensitive data violations carry heavier penalties.`,
    contentAr: `تشمل عقوبات مخالفة نظام حماية البيانات: عقوبات جنائية - السجن حتى سنتين و/أو غرامة حتى 3 ملايين ريال. غرامات إدارية - حتى 5 ملايين ريال لكل مخالفة. عقوبات إضافية - مصادرة عائدات المخالفة، إغلاق مؤقت أو دائم. تكرار المخالفة - مضاعفة العقوبة. الإفصاح العلني - نشر ملخص الحكم على نفقة المخالف. مخالفات البيانات الحساسة تحمل عقوبات أشد.`,
    tags: JSON.stringify(['PDPL', 'عقوبات', 'غرامات', 'سجن', 'سؤال شائع']),
  },
  {
    entryId: `kb-faq-data-subject-rights-${genId()}`,
    category: 'faq',
    title: 'FAQ: What are my rights as a data subject?',
    titleAr: 'سؤال شائع: ما هي حقوقي كصاحب بيانات شخصية؟',
    content: `As a data subject under PDPL, you have the right to: (1) Know why your data is being collected and how it will be used. (2) Access your personal data held by any organization. (3) Receive your data in a readable format. (4) Request correction of inaccurate data. (5) Request deletion of your data when no longer needed. (6) Withdraw your consent at any time. (7) Object to automated decision-making. (8) File complaints with SDAIA if your rights are violated.`,
    contentAr: `كصاحب بيانات شخصية وفقاً لنظام PDPL، لديك الحق في: (1) معرفة سبب جمع بياناتك وكيفية استخدامها. (2) الوصول إلى بياناتك الشخصية لدى أي منظمة. (3) الحصول على بياناتك بصيغة مقروءة. (4) طلب تصحيح البيانات غير الدقيقة. (5) طلب حذف بياناتك عند عدم الحاجة إليها. (6) سحب موافقتك في أي وقت. (7) الاعتراض على اتخاذ القرارات الآلية. (8) تقديم شكاوى لسدايا إذا انتُهكت حقوقك.`,
    tags: JSON.stringify(['PDPL', 'حقوق', 'صاحب البيانات', 'سؤال شائع']),
  },

  // ═══ VISION 2030 & DATA ═══
  {
    entryId: `kb-vision2030-data-${genId()}`,
    category: 'article',
    title: 'Saudi Vision 2030 and Data Protection',
    titleAr: 'رؤية السعودية 2030 وحماية البيانات',
    content: `Saudi Vision 2030 recognizes data as a national asset and strategic resource. Key data-related initiatives include: National Data Strategy for maximizing data value while ensuring protection. Digital Government transformation requiring robust data governance. Smart Cities (NEOM, The Line) generating massive personal data requiring protection. Open Data initiatives balanced with privacy requirements. AI and emerging technology development requiring ethical data practices. The PDPL and NDMO standards are fundamental pillars supporting Vision 2030's digital transformation goals.`,
    contentAr: `تعترف رؤية السعودية 2030 بالبيانات كأصل وطني ومورد استراتيجي. المبادرات الرئيسية المتعلقة بالبيانات تشمل: الاستراتيجية الوطنية للبيانات لتعظيم قيمة البيانات مع ضمان الحماية. التحول الحكومي الرقمي الذي يتطلب حوكمة بيانات قوية. المدن الذكية (نيوم، ذا لاين) التي تولد بيانات شخصية ضخمة تتطلب الحماية. مبادرات البيانات المفتوحة المتوازنة مع متطلبات الخصوصية. تطوير الذكاء الاصطناعي والتقنيات الناشئة التي تتطلب ممارسات بيانات أخلاقية. نظام PDPL ومعايير NDMO هي ركائز أساسية تدعم أهداف التحول الرقمي لرؤية 2030.`,
    tags: JSON.stringify(['رؤية 2030', 'تحول رقمي', 'بيانات وطنية', 'نيوم', 'ذكاء اصطناعي']),
  },
];

// ═══════════════════════════════════════════════════════════════
// 2. TRAINING DOCUMENTS (as extracted content)
// ═══════════════════════════════════════════════════════════════

const trainingDocs = [
  {
    docId: `td-pdpl-full-${genId()}`,
    fileName: 'نظام_حماية_البيانات_الشخصية_النص_الكامل.pdf',
    fileUrl: 'https://laws.boe.gov.sa/boelaws/laws/lawdetails/b7cfae89-828e-4994-b167-adaa00e37188/1',
    fileSize: 250000,
    fileType: 'application/pdf',
    status: 'completed',
    extractedContent: `نظام حماية البيانات الشخصية - المرسوم الملكي رقم (م/19) بتاريخ 1443/2/9هـ

المادة الأولى - التعريفات: البيانات الشخصية هي كل بيان من شأنه أن يؤدي إلى معرفة الفرد (الاسم، رقم الهوية، العناوين، أرقام التواصل، أرقام الحسابات البنكية). المعالجة تشمل الجمع والتسجيل والحفظ والتخزين والتعديل والاسترجاع والإفصاح والنقل والمسح والإتلاف. البيانات الحساسة تشمل الأصل العرقي والمعتقد الديني والبيانات الأمنية والجنائية والسمات الحيوية والبيانات الوراثية والصحية.

المادة الثانية - النطاق: يُطبق على أي معالجة لبيانات شخصية في المملكة بأي وسيلة. يشمل بيانات المقيمين من خارج المملكة وبيانات المتوفى.

المادة الرابعة - حقوق صاحب البيانات: الحق في العلم، الوصول، الحصول على نسخة، التصحيح، الإتلاف.

المادة الخامسة - جمع البيانات: لا يجوز الجمع إلا من صاحبها مباشرة مع إبلاغه بالغرض.

المادة السادسة - الموافقة: يجب أن تكون صريحة ومكتوبة ويحق سحبها في أي وقت.

المادة العاشرة - الإفصاح: لا يجوز إلا بموافقة صاحب البيانات مع استثناءات محددة.

المادة الثانية عشرة - سياسة الخصوصية: 8 متطلبات أساسية لجهات التحكم.

المادة الرابعة عشرة - البيانات الحساسة: يُحظر معالجتها بدون موافقة صريحة.

المادة التاسعة عشرة - الحماية: تدابير تنظيمية وإدارية وتقنية لازمة.

المادة التاسعة والعشرون - النقل الدولي: ضوابط محددة لنقل البيانات خارج المملكة.

المادة الخامسة والثلاثون - العقوبات: سجن حتى سنتين وغرامة حتى 3 ملايين ريال.

المادة السابعة والثلاثون - الإبلاغ: إبلاغ سدايا خلال 72 ساعة عن أي تسريب.`,
    chunkCount: 15,
  },
  {
    docId: `td-ndmo-standards-${genId()}`,
    fileName: 'معايير_إدارة_البيانات_وحماية_البيانات_الشخصية_NDMO.pdf',
    fileUrl: 'https://sdaia.gov.sa/ndmo/Files/PoliciesEn001.pdf',
    fileSize: 180000,
    fileType: 'application/pdf',
    status: 'completed',
    extractedContent: `معايير إدارة البيانات وحماية البيانات الشخصية - مكتب إدارة البيانات الوطنية (NDMO)

1. حوكمة البيانات: إنشاء مكتب حوكمة بيانات، تحديد أدوار (مالك البيانات، مشرف البيانات، أمين البيانات)، وضع سياسات وإجراءات واضحة.

2. تصنيف البيانات: أربعة مستويات (سري للغاية، سري، داخلي، عام). تطبيق ضوابط حماية مناسبة لكل مستوى.

3. جودة البيانات: معايير الدقة والاكتمال والاتساق والتوقيت. عمليات تنظيف وتحقق منتظمة.

4. أمن البيانات: التشفير، ضوابط الوصول، المراقبة، كشف التسلل، الاستجابة للحوادث.

5. دورة حياة البيانات: الإنشاء، التخزين، الاستخدام، المشاركة، الأرشفة، الإتلاف. ضوابط لكل مرحلة.

6. مشاركة البيانات: اتفاقيات مشاركة البيانات، ضوابط الوصول، تتبع الاستخدام.

7. البيانات المفتوحة: نشر البيانات غير الحساسة للعموم وفق معايير محددة.

8. الامتثال: تقييمات دورية، تدقيق، تقارير امتثال للجهة المختصة.`,
    chunkCount: 10,
  },
  {
    docId: `td-breach-guide-${genId()}`,
    fileName: 'دليل_إجراءات_حوادث_تسريب_البيانات_الشخصية.pdf',
    fileUrl: 'https://sdaia.gov.sa/en/SDAIA/about/Documents/PersonalDataBreachIncidents.pdf',
    fileSize: 120000,
    fileType: 'application/pdf',
    status: 'completed',
    extractedContent: `دليل إجراءات حوادث تسريب البيانات الشخصية - سدايا

1. تعريف حادثة التسريب: أي حدث يؤدي إلى وصول غير مصرح به أو إفصاح أو فقدان أو تدمير أو تعديل للبيانات الشخصية.

2. أنواع التسريبات:
- تسريب السرية: وصول غير مصرح به للبيانات
- تسريب السلامة: تعديل غير مصرح به للبيانات
- تسريب التوافر: فقدان الوصول إلى البيانات

3. إجراءات الاستجابة:
المرحلة 1 - الكشف والاحتواء (فوري): تحديد المصدر، عزل الأنظمة، حفظ الأدلة
المرحلة 2 - التقييم (خلال 24 ساعة): تحديد النطاق والخطورة والأثر
المرحلة 3 - الإبلاغ (خلال 72 ساعة): إبلاغ سدايا عبر منصة حوكمة البيانات
المرحلة 4 - المعالجة: إصلاح الثغرات وتحديث الضوابط
المرحلة 5 - المراجعة: توثيق الدروس المستفادة وتحديث الإجراءات

4. متطلبات الإبلاغ:
- طبيعة التسريب ووصفه
- أنواع البيانات المتأثرة
- العدد التقديري للأفراد المتأثرين
- التدابير المتخذة للاحتواء والمعالجة
- التوصيات لأصحاب البيانات

5. تصنيف الخطورة:
- حرج: بيانات حساسة، نطاق واسع، خطر فوري
- عالي: معرّفات شخصية، نطاق متوسط
- متوسط: بيانات غير حساسة، نطاق محدود
- منخفض: حد أدنى من البيانات، احتواء سريع`,
    chunkCount: 8,
  },
  {
    docId: `td-implementing-reg-${genId()}`,
    fileName: 'اللائحة_التنفيذية_لنظام_حماية_البيانات_الشخصية.pdf',
    fileUrl: 'https://sdaia.gov.sa/en/SDAIA/about/Documents/ImplementingRegulation.pdf',
    fileSize: 200000,
    fileType: 'application/pdf',
    status: 'completed',
    extractedContent: `اللائحة التنفيذية لنظام حماية البيانات الشخصية

المادة الثانية - الاستخدام الشخصي: لا تسري أحكام النظام على معالجة البيانات لأغراض لا تتجاوز الاستخدام الشخصي أو العائلي ضمن نطاق الأسرة أو الدائرة الاجتماعية المحدودة.

المادة الثالثة - حقوق أصحاب البيانات: على جهة التحكم عند تلقي طلب من صاحب البيانات بشأن حقوقه الاستجابة خلال مدة لا تتجاوز 30 يوماً. يجب توفير آلية واضحة لتقديم الطلبات.

المادة الرابعة - الموافقة: يجب أن تكون الموافقة حرة ومحددة ومستنيرة وصريحة. يجب أن تكون منفصلة عن الشروط والأحكام العامة. يحق لصاحب البيانات سحب موافقته دون أن يؤثر ذلك على مشروعية المعالجة السابقة.

المادة الخامسة - الأساس النظامي: حالات المعالجة بدون موافقة تشمل: تنفيذ عقد، حماية المصلحة الحيوية، الالتزام القانوني، المصلحة المشروعة.

المادة السابعة - تقييم الأثر: يجب إجراء تقييم أثر حماية البيانات (DPIA) عند المعالجة واسعة النطاق للبيانات الحساسة أو المراقبة المنهجية.

المادة الثانية والثلاثون - تصوير الوثائق: ضوابط خاصة لتصوير أو نسخ الوثائق الرسمية التي تحتوي بيانات شخصية.`,
    chunkCount: 12,
  },
];

// ═══════════════════════════════════════════════════════════════
// 3. CUSTOM ACTIONS
// ═══════════════════════════════════════════════════════════════

const customActionsData = [
  {
    actionId: `ca-check-compliance-${genId()}`,
    triggerPhrase: 'فحص الامتثال',
    triggerAliases: JSON.stringify(['تقييم الامتثال', 'مراجعة الامتثال', 'compliance check', 'PDPL compliance']),
    actionType: 'custom_response',
    actionTarget: null,
    actionParams: JSON.stringify({ responseTemplate: 'سأقوم بتحليل مستوى الامتثال لنظام حماية البيانات الشخصية. سأراجع: 1) سياسة الخصوصية 2) آليات الموافقة 3) تدابير الحماية 4) إجراءات الإبلاغ عن التسريبات 5) حقوق أصحاب البيانات. هل تريد البدء بمجال محدد؟' }),
    description: 'Trigger a PDPL compliance assessment workflow',
    descriptionAr: 'تفعيل سير عمل تقييم الامتثال لنظام حماية البيانات الشخصية',
    priority: 10,
  },
  {
    actionId: `ca-breach-alert-${genId()}`,
    triggerPhrase: 'إبلاغ عن تسريب',
    triggerAliases: JSON.stringify(['تسريب بيانات', 'حادثة تسريب', 'data breach', 'report breach']),
    actionType: 'custom_response',
    actionTarget: null,
    actionParams: JSON.stringify({ responseTemplate: '🚨 إجراء الإبلاغ عن تسريب بيانات:\n\n1. **الاحتواء الفوري**: عزل الأنظمة المتأثرة\n2. **التقييم**: تحديد نوع البيانات المسربة وعدد المتأثرين\n3. **الإبلاغ**: يجب إبلاغ سدايا خلال 72 ساعة\n4. **التوثيق**: حفظ جميع الأدلة والإجراءات\n\nهل تريد المساعدة في إنشاء تقرير تسريب؟' }),
    description: 'Guide through data breach reporting procedure',
    descriptionAr: 'إرشاد خلال إجراءات الإبلاغ عن تسريب البيانات',
    priority: 10,
  },
  {
    actionId: `ca-scan-domain-${genId()}`,
    triggerPhrase: 'مسح نطاق',
    triggerAliases: JSON.stringify(['فحص نطاق', 'مسح دومين', 'scan domain', 'check domain']),
    actionType: 'custom_response',
    actionTarget: null,
    actionParams: JSON.stringify({ responseTemplate: 'سأقوم بإجراء مسح شامل للنطاق. يمكنك الانتقال إلى صفحة "الرصد المباشر" لإجراء مسح فعلي يشمل:\n- فحص الاختراقات المعروفة\n- البحث في مواقع اللصق\n- فحص شهادات SSL\n- استعلامات Google Dorking\n\nأو يمكنني مساعدتك في تحليل نتائج مسح سابق. ما هو النطاق الذي تريد فحصه؟' }),
    description: 'Guide to domain scanning for data leaks',
    descriptionAr: 'إرشاد لمسح النطاقات للبحث عن تسريبات البيانات',
    priority: 5,
  },
  {
    actionId: `ca-explain-pdpl-${genId()}`,
    triggerPhrase: 'اشرح نظام حماية البيانات',
    triggerAliases: JSON.stringify(['ما هو PDPL', 'شرح النظام', 'explain PDPL', 'what is PDPL']),
    actionType: 'custom_response',
    actionTarget: null,
    actionParams: JSON.stringify({ responseTemplate: 'نظام حماية البيانات الشخصية (PDPL) هو أول تشريع شامل لحماية البيانات في المملكة العربية السعودية. صدر بالمرسوم الملكي رقم (م/19) عام 1443هـ.\n\nأهم النقاط:\n📋 يُطبق على جميع الجهات التي تعالج بيانات شخصية في المملكة\n🔐 يمنح الأفراد حقوقاً شاملة (العلم، الوصول، التصحيح، الإتلاف)\n⚖️ عقوبات صارمة (سجن حتى سنتين، غرامة حتى 3 ملايين ريال)\n⏰ إبلاغ إلزامي عن التسريبات خلال 72 ساعة\n\nهل تريد معرفة المزيد عن مادة محددة؟' }),
    description: 'Explain PDPL overview',
    descriptionAr: 'شرح نظرة عامة على نظام حماية البيانات الشخصية',
    priority: 5,
  },
];

// ═══════════════════════════════════════════════════════════════
// MAIN SEED FUNCTION
// ═══════════════════════════════════════════════════════════════

async function seed() {
  const conn = await mysql.createConnection(DATABASE_URL);
  
  console.log('🌱 Seeding training content for Smart Rasid AI...\n');

  // 1. Seed Knowledge Base
  const [existingKB] = await conn.execute('SELECT COUNT(*) as cnt FROM knowledge_base');
  if (existingKB[0].cnt > 5) {
    console.log(`ℹ️  Knowledge base already has ${existingKB[0].cnt} entries. Skipping KB seed.`);
  } else {
    console.log('📚 Seeding knowledge base entries...');
    for (const entry of knowledgeEntries) {
      try {
        await conn.execute(
          `INSERT INTO knowledge_base (entryId, kbCategory, kbTitle, kbTitleAr, kbContent, kbContentAr, kbTags, kbIsPublished, kbViewCount, kbHelpfulCount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [entry.entryId, entry.category, entry.title, entry.titleAr, entry.content, entry.contentAr, entry.tags, true, 0, 0]
        );
        console.log(`  ✅ ${entry.titleAr}`);
      } catch (err) {
        console.log(`  ⚠️ Skipped (may exist): ${entry.titleAr}`);
      }
    }
    console.log(`  📊 Seeded ${knowledgeEntries.length} knowledge base entries\n`);
  }

  // 2. Seed Training Documents
  const [existingTD] = await conn.execute('SELECT COUNT(*) as cnt FROM training_documents');
  if (existingTD[0].cnt > 0) {
    console.log(`ℹ️  Training documents already has ${existingTD[0].cnt} entries. Skipping TD seed.`);
  } else {
    console.log('📄 Seeding training documents...');
    for (const doc of trainingDocs) {
      try {
        await conn.execute(
          `INSERT INTO training_documents (docId, tdFileName, tdFileUrl, tdFileSize, tdFileType, tdStatus, tdExtractedContent, tdChunkCount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [doc.docId, doc.fileName, doc.fileUrl, doc.fileSize, doc.fileType, doc.status, doc.extractedContent, doc.chunkCount]
        );
        console.log(`  ✅ ${doc.fileName}`);
      } catch (err) {
        console.log(`  ⚠️ Skipped (may exist): ${doc.fileName}`);
      }
    }
    console.log(`  📊 Seeded ${trainingDocs.length} training documents\n`);
  }

  // 3. Seed Custom Actions
  const [existingCA] = await conn.execute('SELECT COUNT(*) as cnt FROM custom_actions');
  if (existingCA[0].cnt > 0) {
    console.log(`ℹ️  Custom actions already has ${existingCA[0].cnt} entries. Skipping CA seed.`);
  } else {
    console.log('⚡ Seeding custom actions...');
    for (const action of customActionsData) {
      try {
        await conn.execute(
          `INSERT INTO custom_actions (actionId, triggerPhrase, triggerAliases, actionType, actionTarget, actionParams, caDescription, caDescriptionAr, caPriority, caIsActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [action.actionId, action.triggerPhrase, action.triggerAliases, action.actionType, action.actionTarget, action.actionParams, action.description, action.descriptionAr, action.priority, true]
        );
        console.log(`  ✅ ${action.triggerPhrase}`);
      } catch (err) {
        console.log(`  ⚠️ Skipped (may exist): ${action.triggerPhrase}`);
      }
    }
    console.log(`  📊 Seeded ${customActionsData.length} custom actions\n`);
  }

  console.log('═══════════════════════════════════════');
  console.log('✅ Training content seeding complete!');
  console.log(`  📚 Knowledge Base: ${knowledgeEntries.length} entries`);
  console.log(`  📄 Training Documents: ${trainingDocs.length} documents`);
  console.log(`  ⚡ Custom Actions: ${customActionsData.length} actions`);
  console.log('═══════════════════════════════════════');

  await conn.end();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
