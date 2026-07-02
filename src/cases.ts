export interface Passport {
  number: string;
  expiryDate: string;
  birthDate: string;
  birthPlace: string;
  fullName: string;
}

export interface Visa {
  number: string;
  expiryDate: string;
  fullName: string;
  visaType: string;
}

export interface CustomDoc {
  title: string;
  content: string;
}

export interface Case {
  id: string;
  name: string;
  arabicName: string;
  avatarSeed: string; // Used to style or generate visual features
  nationality: string;
  arabicNationality: string;
  age: number;
  gender: 'male' | 'female';
  purpose: string;
  arabicPurpose: string;
  behavior: string;
  arabicBehavior: string;
  secretTruth: string;
  arabicSecretTruth: string;
  documents: {
    passport: Passport;
    visa?: Visa;
    customDoc?: CustomDoc;
  };
  discrepancy: string; // English details of discrepancy
  arabicDiscrepancy: string; // Arabic details of discrepancy
  wantedDbRecord?: {
    notes: string;
    wantedStatus: 'clear' | 'warning' | 'wanted';
  };
  expectedVerdict: 'admit' | 'reject' | 'arrest';
  verdictExplanation: string; // Arabic explanation of the correct outcome
}

export const cases: Case[] = [
  {
    id: "yasser",
    name: "Yasser Al-Harbi",
    arabicName: "ياسر الحربي",
    avatarSeed: "yasser",
    nationality: "Saudi",
    arabicNationality: "سعودي",
    age: 42,
    gender: "male",
    purpose: "Visiting my brother",
    arabicPurpose: "زيارة أخي المقيم هنا لشراء بعض الأغراض الشخصية وعلاج طبي.",
    behavior: "Friendly, cooperative, completely relaxed and answers with total honesty.",
    arabicBehavior: "ودود للغاية، متعاون، مسترخٍ تماماً ويجيب عن جميع الأسئلة بصدق وأمانة تامة.",
    secretTruth: "He is a respectable citizen visiting his brother. All his papers are 100% genuine and valid, and he has no criminal intentions whatsoever.",
    arabicSecretTruth: "مواطن بريء ومحترم للغاية! قادم لزيارة أخيه وعلاج طبي بسيط. سجلاته نظيفة وجميع أوراقه ووثائقه رسمية وسليمة 100% ولا يخفي شيئاً وصادق تماماً.",
    documents: {
      passport: {
        number: "SA-98241",
        expiryDate: "2031-11-12", // Valid passport now!
        birthDate: "1984-05-14",
        birthPlace: "الرياض",
        fullName: "ياسر بن خلف الحربي"
      },
      visa: {
        number: "VS-88129",
        expiryDate: "2026-12-01",
        fullName: "ياسر بن خلف الحربي",
        visaType: "زيارة سياحية"
      }
    },
    discrepancy: "None. All documents are perfectly authentic and matches database.",
    arabicDiscrepancy: "لا يوجد أي خلل. جميع الوثائق مطابقة تماماً وسليمة وصالحة.",
    wantedDbRecord: {
      notes: "السجل نظيف تماماً ولا توجد أي ملاحظات أو بلاغات أمنية سابقة.",
      wantedStatus: "clear"
    },
    expectedVerdict: "admit",
    verdictExplanation: "القرار الصحيح هو السماح بالدخول. أوراقه سليمة بالكامل، وهو مواطن صالح وسجله نظيف تماماً من أي بلاغات أمنية."
  },
  {
    id: "olivia",
    name: "Olivia Smith",
    arabicName: "أوليفيا سميث",
    avatarSeed: "olivia",
    nationality: "British",
    arabicNationality: "بريطانية",
    age: 28,
    gender: "female",
    purpose: "Tourism and historical photography",
    arabicPurpose: "السياحة وتصوير المعالم الأثرية والتاريخية ونشرها في مدونتي.",
    behavior: "Extremely nervous, avoids eye contact, stutters when asked about her passport expiry date.",
    arabicBehavior: "متوترة للغاية، تتجنب التقاء الأعين، وتتلعثم بشدة عند سؤالها عن تاريخ انتهاء صلاحية جواز سفرها.",
    secretTruth: "She is smuggling rare antiquities and stolen gold artifacts. Her passport is expired and she has prior smuggling convictions under alias names.",
    arabicSecretTruth: "مهربة آثار دولية! تخبئ عملات ذهبية مسروقة وتماثيل أثرية في جدار مزدوج داخل حقيبة التصوير الخاصة بها. جواز سفرها منتهي الصلاحية منذ نوفمبر 2023 وسجلها حافل بالتهريب.",
    documents: {
      passport: {
        number: "GB-44129",
        expiryDate: "2023-11-12", // Expired passport!
        birthDate: "1998-03-24",
        birthPlace: "London",
        fullName: "Olivia Jane Smith"
      },
      visa: {
        number: "VS-99211",
        expiryDate: "2026-10-15",
        fullName: "Olivia Jane Smith",
        visaType: "سياحة"
      }
    },
    discrepancy: "Passport is expired since November 12, 2023.",
    arabicDiscrepancy: "جواز السفر منتهي الصلاحية منذ 12 نوفمبر 2023.",
    wantedDbRecord: {
      notes: "تحذير أمني: سوابق ضبط دولية في قضايا تهريب آثار وممتلكات ثقافية مسروقة. يجب فحص أمتعتها وتفتيشها بدقة بالغة.",
      wantedStatus: "wanted"
    },
    expectedVerdict: "arrest",
    verdictExplanation: "القرار الصحيح هو الاعتقال الفوري! جواز سفرها منتهي منذ سنوات، ولديها سجل أمني خطير في تهريب الآثار، وحقيبتها تحتوي على قطع أثرية مهربة."
  },
  {
    id: "karim",
    name: "Karim Al-Saadi",
    arabicName: "كريم السعدي",
    avatarSeed: "karim",
    nationality: "Iraqi",
    arabicNationality: "عراقي",
    age: 35,
    gender: "male",
    purpose: "Business meeting for a trade company",
    arabicPurpose: "حضور اجتماع عمل عاجل مع شركة استيراد وتصدير محلية لتوقيع عقد توريد.",
    behavior: "Extremely polite, professional, answers with complete transparency and ease.",
    arabicBehavior: "لبق ومحترم للغاية، هادئ ويتعاون بكل شفافية وأريحية، ويجيب بصيغ رسمية واضحة وموثوقة.",
    secretTruth: "He is a genuine, law-abiding businessman looking to expand his trade. All his documentation is authentic and his record is pristine.",
    arabicSecretTruth: "رجل أعمال حقيقي وصادق بالكامل! جاء لتوقيع عقود تجارية قانونية. سجله الأمني نظيف وجميع وثائقه سليمة ورسمية وخالية من أي شبهات.",
    documents: {
      passport: {
        number: "IQ-77302",
        expiryDate: "2029-04-05",
        birthDate: "1991-02-20", // Valid date (February 20th)
        birthPlace: "بغداد",
        fullName: "كريم عبد الحسين السعدي"
      },
      visa: {
        number: "VS-11202",
        expiryDate: "2026-09-20",
        fullName: "كريم عبد الحسين السعدي",
        visaType: "عمل - تجاري"
      }
    },
    discrepancy: "None. All documents are perfectly valid.",
    arabicDiscrepancy: "لا يوجد أي خلل. كافة المستندات صالحة ومطابقة ومستوفية للشروط.",
    wantedDbRecord: {
      notes: "السجل التجاري والأمني نظيف تماماً. لا توجد أي قيود أو بلاغات سابقة.",
      wantedStatus: "clear"
    },
    expectedVerdict: "admit",
    verdictExplanation: "القرار الصحيح هو السماح بالدخول. وثائقه سليمة 100%، وتاريخ ميلاده صحيح، وسجله الأمني نظيف تماماً وهو تاجر حقيقي قانوني."
  },
  {
    id: "fatima",
    name: "Fatima Ahmed",
    arabicName: "فاطمة أحمد",
    avatarSeed: "fatima",
    nationality: "Syrian",
    arabicNationality: "سورية",
    age: 31,
    gender: "female",
    purpose: "Seeking asylum and safety",
    arabicPurpose: "الهروب من ظروف الحرب والبحث عن الأمان وعلاج طفلي المريض بموجب تأشيرة إنسانية رسمية.",
    behavior: "Polite, grateful, answers with honesty, showing full cooperation.",
    arabicBehavior: "مهذبة للغاية، ممتنة لمساعدتك، تجيب بصدق وهدوء، وتبدي تعاوناً كاملاً وتوفر جميع الإثباتات بوضوح.",
    secretTruth: "She is a mother seeking medical treatment for her child legally and peacefully under a pre-approved humanitarian program.",
    arabicSecretTruth: "أم فاضلة وبريئة بالكامل، تملك تأشيرة دخول إنسانية رسمية ومعتمدة لعلاج طفلها. أوراقها كاملة وسجلها نظيف ولا تشوبها شائبة.",
    documents: {
      passport: {
        number: "SY-33104",
        expiryDate: "2029-05-10", // Valid passport
        birthDate: "1995-11-20",
        birthPlace: "حلب",
        fullName: "فاطمة محمد أحمد"
      },
      visa: {
        number: "VS-55201",
        expiryDate: "2026-12-15",
        fullName: "فاطمة محمد أحمد",
        visaType: "زيارة إنسانية علاجية"
      },
      customDoc: {
        title: "التقرير الطبي للطفل",
        content: "تقرير طبي معتمد من وزارة الصحة يؤكد أهلية الحالة للحصول على العلاج بموجب التأشيرة الإنسانية الممنوحة."
      }
    },
    discrepancy: "None. All papers are legally complete and pre-approved.",
    arabicDiscrepancy: "لا يوجد أي خلل. الأوراق مستوفية بالكامل للشروط القانونية والإنسانية.",
    wantedDbRecord: {
      notes: "لا توجد أي سوابق جنائية أو أمنية. الحالة معتمدة ومصرح لها بالدخول للعلاج الطبي.",
      wantedStatus: "clear"
    },
    expectedVerdict: "admit",
    verdictExplanation: "القرار الصحيح هو السماح بالدخول. جميع وثائق فاطمة مستوفية بالكامل ولديها تأشيرة إنسانية علاجية معتمدة وسليمة."
  },
  {
    id: "li_chen",
    name: "Li Chen",
    arabicName: "لي تشينغ",
    avatarSeed: "lichen",
    nationality: "Chinese",
    arabicNationality: "صينية",
    age: 39,
    gender: "female",
    purpose: "Business visit to Arrow Solutions company",
    arabicPurpose: "زيارة عمل عاجلة لشركة 'سهم للحلول' لمناقشة شراكة تقنية وتوريد خوادم.",
    behavior: "Speaks very fast, looks at her watch repeatedly, seems impatient and arrogant.",
    arabicBehavior: "تتحدث بسرعة فائقة، تنظر إلى ساعتها باستمرار، تبدو نافدة الصبر وتتعامل بغرور طفيف.",
    secretTruth: "She is an industrial spy working for a rival state. The company 'Arrow Solutions' is a known shell company blacklisted for industrial espionage, and she is carrying encrypted plans for local grid infrastructure.",
    arabicSecretTruth: "جاسوسة صناعية تعمل لصالح جهة منافسة. شركة 'سهم للحلول' هي واجهة وهمية محظورة أمنياً بتهمة التجسس وسرقة البيانات الحساسة، وهي تحمل ملفات مشفرة تهدف لتخريب البنية التحتية.",
    documents: {
      passport: {
        number: "CN-55104",
        expiryDate: "2029-12-12",
        birthDate: "1987-07-15",
        birthPlace: "Beijing",
        fullName: "Li Qing Chen"
      },
      visa: {
        number: "VS-44109",
        expiryDate: "2026-08-30",
        fullName: "Li Qing Chen",
        visaType: "زيارة عمل"
      },
      customDoc: {
        title: "خطاب دعوة الشركة",
        content: "دعوة رسمية لحضور شراكة عمل من شركة 'سهم للحلول المحدودة' (Arrow Solutions)."
      }
    },
    discrepancy: "The host company 'Arrow Solutions' in her invitation is blacklisted and fake according to the Security Database.",
    arabicDiscrepancy: "الشركة المستضيفة 'سهم للحلول المحدودة' المذكورة في خطاب الدعوة، مصنفة في قاعدة بيانات الحاسوب الأمني كشركة وهمية محظورة بتهمة التجسس الصناعي.",
    wantedDbRecord: {
      notes: "تحذير: شركة 'سهم للحلول' (Arrow Solutions) تخضع للحظر الكامل منذ يناير 2026. أي شخص يقدم تأشيرة أو دعوة مرتبطة بها يجب إيقافه فوراً للتحقيق الجنائي.",
      wantedStatus: "wanted"
    },
    expectedVerdict: "arrest",
    verdictExplanation: "القرار الصحيح هو الاعتقال! الدعوة مرتبطة بشركة وهمية محظورة بتهمة التجسس الصناعي، وتصرفاتها المتعجلة تهدف لتجنب التدقيق الفني."
  }
];
