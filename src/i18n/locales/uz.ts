export default {
  // ── Navigatsiya ────────────────────────────────────────────────────────
  nav: {
    home: 'Bosh sahifa',
    practice: 'Mashq',
    alphabet: 'Alfavit',
    profile: 'Profil',
    settings: 'Sozlamalar',
  },

  // ── Avtorizatsiya ──────────────────────────────────────────────────────
  auth: {
    login: 'Kirish',
    register: 'Ro\'yxatdan o\'tish',
    logout: 'Chiqish',
    email: 'Elektron pochta',
    password: 'Parol',
    confirm_password: 'Parolni tasdiqlang',
    username: 'Foydalanuvchi nomi',
    forgot_password: 'Parolni unutdingizmi?',
    or_continue_with: 'yoki davom eting',
    no_account: 'Hisobingiz yo\'qmi?',
    have_account: 'Hisobingiz bormi?',
    verify_email_title: 'Emailni tasdiqlang',
    verify_email_desc: '{email} manziliga xat yubordik. Xatdagi havolani bosing.',
    login_with_google: 'Google orqali kirish',
    login_with_telegram: 'Telegram orqali kirish',
    errors: {
      invalid_credentials: 'Email yoki parol noto\'g\'ri',
      email_taken: 'Bu email allaqachon ro\'yxatdan o\'tgan',
      password_mismatch: 'Parollar mos kelmaydi',
    },
  },

  // ── Bosh sahifa / Kurs ─────────────────────────────────────────────────
  home: {
    title: 'Mening kursim',
    no_course: 'Kurs tanlanmagan',
    select_course: 'Kurs tanlash',
    units: 'Bo\'limlar',
    lessons_progress: '{done}/{total} dars',
    streak: 'Ketma-ketlik',
    hearts: 'Yuraklar',
    xp: 'Tajriba',
    no_hearts_title: 'Yuraklar tugadi!',
    no_hearts_desc: 'Yurakni tiklash va o\'rganishni davom ettirish uchun mashq bajaring.',
    go_to_practice: 'Mashqqa o\'tish',
    cancel: 'Bekor qilish',
  },

  // ── Darslar ────────────────────────────────────────────────────────────
  lesson: {
    check: 'Tekshirish',
    correct: 'To\'g\'ri!',
    wrong: 'Noto\'g\'ri',
    continue: 'Davom etish',
    finish: 'Darsni tugatish',
    xp_earned: '+{xp} XP',
    mistake: 'Xato',
    question: '{n}/{total} savol',
    loading: 'Dars yuklanmoqda...',
    completed_title: 'Dars tugallandi! 🎉',
    completed_desc: '{xp} XP ishladingiz',
  },

  // ── Mashq ──────────────────────────────────────────────────────────────
  practice: {
    title: 'Mashq',
    description: 'O\'rgangan narsalaringizni takrorlang va yurakni tiklang',
    start: 'Mashqni boshlash',
    complete: 'Tugatish',
    hearts_restored: '+1 yurak tiklandi',
    xp_earned: '+{xp} XP mashq uchun',
  },

  // ── Alfavit ────────────────────────────────────────────────────────────
  alphabet: {
    title: 'Alfavit',
    vowels: 'Unlilar',
    consonants: 'Undoshlar',
    draw_title: 'Belgini chizing',
    draw_prompt: '"{char}" ni chizib ko\'rsating:',
    transliteration: 'Transkriptsiya',
  },

  // ── Canvas (chizish) ───────────────────────────────────────────────────
  canvas: {
    clear: 'Tozalash',
    submit: 'Tekshirish',
    checking: 'Tekshirilmoqda...',
    correct: 'To\'g\'ri! Bu {char}',
    wrong: '{predicted} ga o\'xshaydi, lekin {expected} kutilgan edi',
    try_again: 'Qayta urinib ko\'ring',
    hint: 'Maslahat',
    confidence: 'Ishonch: {pct}%',
  },

  // ── Til tanlash ────────────────────────────────────────────────────────
  select_language: {
    title: 'O\'rganmoqchi bo\'lgan tilni tanlang',
    subtitle: 'Keyinchalik Sozlamalarda o\'zgartira olasiz',
    difficulty_beginner: 'Boshlang\'ich',
    difficulty_intermediate: 'O\'rta daraja',
    difficulty_advanced: 'Yuqori daraja',
    choose: 'Tanlash',
    korean: 'Koreys',
    english: 'Ingliz',
    loading: 'Kurslar yuklanmoqda...',
  },

  // ── Profil ─────────────────────────────────────────────────────────────
  profile: {
    title: 'Profil',
    total_xp: 'Jami XP',
    streak_days: '{n} kun ketma-ket',
    lessons_done: 'O\'tilgan darslar',
    hearts: 'Yuraklar',
    current_course: 'Joriy kurs',
    change_course: 'Kursni o\'zgartirish',
    edit_profile: 'Profilni tahrirlash',
    joined: '{date} da qo\'shilgan',
  },

  // ── Sozlamalar ─────────────────────────────────────────────────────────
  settings: {
    title: 'Sozlamalar',
    interface_language: 'Interfeys tili',
    change_course: 'Kursni o\'zgartirish',
    logout: 'Chiqish',
    logout_confirm: 'Haqiqatan ham chiqmoqchimisiz?',
    theme: 'Mavzu',
    theme_light: 'Yorqin',
    theme_dark: 'Qorong\'u',
    theme_system: 'Tizim',
    account: 'Hisob',
    app: 'Ilova',
  },

  // ── Umumiy ─────────────────────────────────────────────────────────────
  common: {
    loading: 'Yuklanmoqda...',
    error: 'Xatolik yuz berdi',
    retry: 'Qayta urinib ko\'ring',
    save: 'Saqlash',
    cancel: 'Bekor qilish',
    confirm: 'Tasdiqlash',
    close: 'Yopish',
    back: 'Orqaga',
    next: 'Keyingisi',
    yes: 'Ha',
    no: 'Yo\'q',
    not_found: 'Sahifa topilmadi',
    go_home: 'Bosh sahifaga',
  },
}
