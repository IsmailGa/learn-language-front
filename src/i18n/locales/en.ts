export default {
  // ── Navigation ─────────────────────────────────────────────────────────
  nav: {
    home: 'Home',
    practice: 'Practice',
    alphabet: 'Alphabet',
    profile: 'Profile',
    settings: 'Settings',
  },

  // ── Auth ───────────────────────────────────────────────────────────────
  auth: {
    login: 'Sign In',
    register: 'Sign Up',
    logout: 'Sign Out',
    email: 'Email',
    password: 'Password',
    confirm_password: 'Confirm Password',
    username: 'Username',
    forgot_password: 'Forgot password?',
    or_continue_with: 'or continue with',
    no_account: "Don't have an account?",
    have_account: 'Already have an account?',
    verify_email_title: 'Verify your email',
    verify_email_desc: 'We sent a link to {email}. Please check your inbox.',
    login_with_google: 'Continue with Google',
    login_with_telegram: 'Continue with Telegram',
    errors: {
      invalid_credentials: 'Invalid email or password',
      email_taken: 'This email is already registered',
      password_mismatch: 'Passwords do not match',
    },
  },

  // ── Home / Course ──────────────────────────────────────────────────────
  home: {
    title: 'My Course',
    no_course: 'No course selected',
    select_course: 'Select a course',
    units: 'Units',
    lessons_progress: '{done}/{total} lessons',
    streak: 'Streak',
    hearts: 'Hearts',
    xp: 'XP',
    no_hearts_title: 'Out of hearts!',
    no_hearts_desc: 'Complete a practice session to refill your hearts and keep learning.',
    go_to_practice: 'Go to Practice',
    cancel: 'Cancel',
  },

  // ── Lessons ────────────────────────────────────────────────────────────
  lesson: {
    check: 'Check',
    correct: 'Correct!',
    wrong: 'Incorrect',
    continue: 'Continue',
    finish: 'Finish Lesson',
    xp_earned: '+{xp} XP',
    mistake: 'Mistake',
    question: 'Question {n} of {total}',
    loading: 'Loading lesson...',
    completed_title: 'Lesson Complete! 🎉',
    completed_desc: 'You earned {xp} XP',
  },

  // ── Practice ───────────────────────────────────────────────────────────
  practice: {
    title: 'Practice',
    description: 'Review what you\'ve learned and restore your hearts',
    start: 'Start Practice',
    complete: 'Complete',
    hearts_restored: '+1 heart restored',
    xp_earned: '+{xp} XP for practicing',
  },

  // ── Alphabet ───────────────────────────────────────────────────────────
  alphabet: {
    title: 'Alphabet',
    vowels: 'Vowels',
    consonants: 'Consonants',
    draw_title: 'Draw the character',
    draw_prompt: 'Draw "{char}" on the canvas:',
    transliteration: 'Transliteration',
  },

  // ── Canvas (drawing) ───────────────────────────────────────────────────
  canvas: {
    clear: 'Clear',
    submit: 'Check',
    checking: 'Checking...',
    correct: 'Correct! That is {char}',
    wrong: 'Looks like {predicted}, but expected {expected}',
    try_again: 'Try again',
    hint: 'Hint',
    confidence: 'Confidence: {pct}%',
  },

  // ── Language Selection ─────────────────────────────────────────────────
  select_language: {
    title: 'Choose a language to learn',
    subtitle: 'You can change this later in Settings',
    difficulty_beginner: 'Beginner',
    difficulty_intermediate: 'Intermediate',
    difficulty_advanced: 'Advanced',
    choose: 'Choose',
    korean: 'Korean',
    english: 'English',
    loading: 'Loading courses...',
  },

  // ── Profile ────────────────────────────────────────────────────────────
  profile: {
    title: 'Profile',
    total_xp: 'Total XP',
    streak_days: '{n}-day streak',
    lessons_done: 'Lessons completed',
    hearts: 'Hearts',
    current_course: 'Current course',
    change_course: 'Change course',
    edit_profile: 'Edit profile',
    joined: 'Joined {date}',
  },

  // ── Settings ───────────────────────────────────────────────────────────
  settings: {
    title: 'Settings',
    interface_language: 'Interface language',
    change_course: 'Change course',
    logout: 'Sign out',
    logout_confirm: 'Are you sure you want to sign out?',
    theme: 'Theme',
    theme_light: 'Light',
    theme_dark: 'Dark',
    theme_system: 'System',
    account: 'Account',
    app: 'App',
  },

  // ── Common ─────────────────────────────────────────────────────────────
  common: {
    loading: 'Loading...',
    error: 'Something went wrong',
    retry: 'Try again',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    yes: 'Yes',
    no: 'No',
    not_found: 'Page not found',
    go_home: 'Go home',
  },
}
