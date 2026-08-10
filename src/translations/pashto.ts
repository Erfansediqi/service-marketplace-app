import type { TranslationKeys } from "./en";

const pashto = {
  // Language Screen
  chooseLanguage: "ژبه وټاکئ",
  subtitle: "مهرباني وکړئ خپله خوښه ژبە وټاکئ",
  continue: "ادامه",

  // Common
  next: "بل",
  back: "شا ته",
  skip: "تېرېدل",

  // Onboarding 1
  onboarding1Title: "په څو دقیقو کې هر خدمت کتاب کړئ",
  onboarding1Subtitle:
    "برق‌کاران، پایپ‌کاران، پاکوونکي او نور — ټول د ریښتیني امتیازاتو او نظرونو سره تایید شوي.",

  // Onboarding 2
  onboarding2Title: "مسلکي خدمات چمتو کوونکي",
  onboarding2Subtitle:
    "له ماهر متخصصینو سره وصل شئ څوک چې کار په لومړي ځل په سمه توګه ترسره کوي.",

  // Onboarding 3
  onboarding3Title: "خوندیتوب تادیات او ملاتړ",
  onboarding3Subtitle:
    "له اسانه تادیاتو او ۲۴/۷ پیرودونکي ملاتړ څخه خوند واخلئ هرکله چې ورته اړتیا ولرئ.",

  // Signup Screen
  sendVerificationCode: "د تایید کوډ واستوئ",
  legalTextCombined:
    "د دوام ورکولو له لارې تاسو زموږ له شرایطو او محرمیت تګلارې سره موافق یاست",
  termsOfUse: "شرایط",
  privacyPolicy: "محرمیت تګلاره",
  serviceAccount: "د خدماتو حساب",
  createAccountTitle: "خپله حساب جوړ کړئ",
  createAccountSubtitle: "یوازې دوه جزئیات د پیل لپاره",
  fullNameLabel: "پوره نوم",
  fullNamePlaceholder: "احمد ظاهر",
  phoneLabel: "د تلیفون شمیره",
  nameError: "مهرباني وکړئ خپل پوره نوم ولیکئ.",
  phoneError: "مهرباني وکړئ یو باوري تلیفون شمیره ولیکئ.",

  // Location Permission Screen
  locationEyebrow: "د حساب تنظیم",
  locationTitle: "د موقعیت لاسرسی فعال کړئ",
  locationSubtitle:
    "مهرباني وکړئ د موقعیت لاسرسی ته اجازه ورکړئ ترڅو نږدې خدمات چمتو کوونکي ومومئ، دقیق وړاندیزونه ترلاسه کړئ، او خپل پته په اوتومات ډول تنظیم کړئ.",
  allowLocation: "د اپلیکیشن کارولو پرمهال اجازه ورکړل شي",
  manualAddress: "پته په لاسي ډول داخل کړئ",
  backLabel: "شا ته",

  // Confirm Location Screen
  confirmLocationHeader: "د موقعیت انتخاب",
  selectedLocationEyebrow: "ټاکل شوی موقعیت",
  defaultAddressTitle: "پته لټول کیږي...",
  defaultAddressDetails: "مهرباني وکړئ لږ انتظار وکړئ.",
  fallbackLocationTitle: "ټاکل شوی موقعیت",
  fallbackAddressDetails: "تفصیلي پته ونه موندل شوه.",
  coordinatesUnavailable: "اوس مهال د پته ترلاسه کولو امکان نشته.",
  coordinatesSuccess: "د موقعیت مختصات په بریا سره ترلاسه شول.",
  movingMapTitle: "موقعیت ټاکل کیږي...",
  movingMapDetails: "نښه کوونکی په خپل خوښه ځای کې ځای په ځای کړئ.",
  latitudeLabel: "عرض جغرافیایی",
  longitudeLabel: "طول جغرافیایی",
  confirmLocationButton: "دا موقعیت تایید کړئ",
  manualAddressButton: "پته په لاسي ډول داخل کړئ",
  recenterLabel: "اوسني موقعیت ته بیرته راستنیدل",
  editAction: "سمون",
  confirmAction: "تایید",
  manualAlertTitle: "پته په لاسي ډول داخل کړئ",
  manualAlertBody:
    "د ولایت، ښار، ناحیې او تفصیلي پته د انتخاب سکرین به په بل پړاو کې جوړ شي.",
  okAction: "سمه ده",

  // Manual Address Screen
  manualEyebrow: "لاسي پته",
  manualTitle: "خپله پته داخل کړئ",
  manualSubtitle:
    "خپل ولایت او ناحیه وټاکئ، بیا خپل ځانګړي پته جزئیات داخل کړئ.",
  provinceLabel: "ولایت",
  provincePlaceholder: "ولایت وټاکئ",
  provinceTitle: "ولایت وټاکئ",
  provinceSubtitle: "د اوسیدو ولایت وټاکئ.",
  provinceSearch: "ولایت لټول...",
  provinceEmpty: "هیڅ ولایت ونه موندل شو",
  districtLabel: "ښار / ناحیه",
  districtPlaceholder: "ښار یا ناحیه وټاکئ",
  districtPlaceholderDisabled: "لومړی ولایت وټاکئ",
  districtTitle: "ښار یا ناحیه وټاکئ",
  districtSubtitle: "په ولایت کې هدفمند ښار یا ناحیه وټاکئ.",
  districtSearch: "ښار یا ناحیه لټول...",
  districtEmpty: "هیڅ ښار یا ناحیه ونه موندل شوه",
  neighbourhoodLabel: "محل / سیمه",
  neighbourhoodPlaceholder: "مثلاً ۵ ناحیه",
  streetLabel: "کوچه یا سړک",
  streetPlaceholder: "د کوچې یا سړک نوم",
  houseLabel: "د کور / اپارتمان شمیره",
  housePlaceholder: "اختياري",
  detailsLabel: "اضافي جزئیات",
  detailsPlaceholder: "مثلاً د جومات سره نږدې، د مکتب مخامخ...",
  saveAddressButton: "پته خوندي کړئ",
  provinceErrorText: "مهرباني وکړئ خپل ولایت وټاکئ.",
  districtErrorText: "مهرباني وکړئ خپل ښار یا ناحیه وټاکئ.",
  neighbourhoodErrorText: "مهرباني وکړئ محل یا سیمه داخل کړئ.",
  manualalertTitle: "لاسي پته",
  manualalertBody:
    "د ولایت، ښار، ناحیې او تفصیلي پته د انتخاب سکرین به په بل پړاو کې جوړ شي.",
  backlabel: "شا ته",
  okaction: "سمه ده",

  // Role Selection Screen
  roleEyebrow: "د حساب ډول",
  roleTitle: "تاسو غواړئ څنګه له خدمت څخه استفاده وکړئ؟",
  roleSubtitle: "يو انتخاب غوره کړئ چې ستاسو له اړتیا سره سمون ولري.",
  customerTitle: "د خدماتو ترلاسه کونکی",
  customerSubtitle:
    "خپل اړین خدمتونه ومومئ، چمتو کوونکي سره پرتله کړئ او خپله غوښتنه ثبت کړئ.",
  providerTitle: "د خدماتو چمتو کوونکی",
  providerSubtitle:
    "خپل مهارتونه او خدمتونه معرفي کړئ، د پیرودونکو غوښتنې ترلاسه کړئ او خپل کار پراخ کړئ.",
  roleHelperText: "وروسته بیا کولی شئ خپل د حساب ډول له تنظیماتو څخه بدل کړئ.",
    // Notifications
  notificationsTitle: "خبرتیاوې",
  notificationsEmptyTitle: "تر اوسه کومه خبرتیا نشته",
  customerNotificationsEmptyBody:
    "د خدمت چمتو کوونکو د بکینګ تازه معلومات به دلته ښکاره شي.",
  providerNotificationsEmptyBody:
    "د بکینګ نوې غوښتنې او د پیرودونکو تازه معلومات به دلته ښکاره شي.",
  markAllAsRead: "ټولې لوستل شوې وښایئ",

  notificationBookingCreatedTitle: "د بکینګ نوې غوښتنه",
  notificationBookingCreatedBody:
    "{{customerName}} ستاسو خدمت غوښتنه کړې ده.",

  notificationBookingConfirmedTitle: "بکینګ تایید شو",
  notificationBookingConfirmedBody:
    "{{providerName}} ستاسو بکینګ ومانه.",

  notificationBookingCompletedTitle: "بکینګ بشپړ شو",
  notificationBookingCompletedBody:
    "{{providerName}} ستاسو بکینګ بشپړ شوی وښود.",
  // حساب - شخصي معلومات
  personalInformationTitle: "شخصي معلومات",
  changePhoto: "انځور بدلول",
  firstNameLabel: "نوم",
  lastNameLabel: "تخلص",
  emailAddressLabel: "برېښنالیک پته",
  phoneNumberLabel: "د تلیفون شمېره",
  emailAddressPlaceholder: "برېښنالیک پته ولیکئ",
  verifiedPhoneHint: "د تلیفون شمېره له تایید شوي حساب سره تړلې ده او دلته نه شي بدلېدای.",
  saveChanges: "بدلونونه خوندي کړئ",
  savingChanges: "خوندي کېږي...",

  // حساب - محرمیت او امنیت
  privacySecurityTitle: "محرمیت او امنیت",
  securitySectionTitle: "امنیت",
  setOrChangePassword: "پټنوم ټاکل یا بدلول",
  updatePasswordSubtitle: "د خپل حساب پټنوم تازه کړئ.",
  biometricLogin: "بایومیټریک ننوتل",
  biometricLoginAvailableSubtitle: "په دې وسیله د خدمت د خلاصولو لپاره بایومیټریک وکاروئ.",
  biometricLoginUnavailableSubtitle: "د خوندي لاسرسي لپاره لومړی د وسیلې بایومیټریک تنظیم کړئ.",
  dataPrivacySectionTitle: "معلومات او محرمیت",
  locationServices: "د موقعیت خدمتونه",
  locationServicesSubtitle: "خدمت ته اجازه ورکړئ چې د نږدې خدمتونو لپاره ستاسو موقعیت وکاروي.",
  deleteAccount: "حساب ړنګول",
  deleteAccountSubtitle: "خپل د خدمت حساب د تل لپاره ړنګ کړئ.",

  // حساب - پټنوم
  changePasswordTitle: "پټنوم ټاکل یا بدلول",
  secureAccountTitle: "خپل حساب خوندي کړئ",
  secureAccountSubtitle: "داسې پټنوم وټاکئ چې په بل حساب کې یې نه کاروئ.",
  newPasswordLabel: "نوی پټنوم",
  newPasswordPlaceholder: "نوی پټنوم ولیکئ",
  confirmPasswordLabel: "پټنوم تایید کړئ",
  confirmPasswordPlaceholder: "پټنوم بیا ولیکئ",
  passwordMinimumRequirement: "لږ تر لږه ۸ توري",
  passwordsDoNotMatch: "پټنومونه یو شان نه دي.",
  passwordSecurityNote: "ستاسو پټنوم د تایید شوي حساب له لارې په خوندي ډول اداره کېږي.",
  savePassword: "پټنوم خوندي کړئ",
  savingPassword: "خوندي کېږي...",
  showPassword: "پټنوم ښکاره کړئ",
  hidePassword: "پټنوم پټ کړئ",

  // حساب - خوندي شوې پتې
  savedAddressesTitle: "خوندي شوې پتې",
  addNewAddress: "نوې پته اضافه کړئ",
  editAddress: "پته سمول",
  deleteAddress: "ړنګول",
  deleteAddressTitle: "پته ړنګول",
  cancelAction: "لغوه",
  noSavedAddressesTitle: "تر اوسه کومه پته نه ده خوندي شوې",
  noSavedAddressesSubtitle: "هغه پتې چې خوندي کوئ دلته به ښکاره شي.",
  homeAddressLabel: "کور",
  workAddressLabel: "کار",
  otherAddressLabel: "بل",

  // حساب - د مرستې مرکز
  helpCenterTitle: "د مرستې مرکز",
  helpSearchPlaceholder: "څنګه درسره مرسته وکړو؟",
  frequentlyAskedQuestions: "ډېرې پوښتل شوې پوښتنې",
  noMatchingHelpTopics: "اړونده موضوع ونه موندل شوه",
  noMatchingHelpTopicsSubtitle: "بله کلمه ولټوئ یا مستقیماً له ملاتړ سره اړیکه ونیسئ.",
  stillNeedHelp: "لا هم مرستې ته اړتیا لرئ؟",
  contactThroughWhatsappEmail: "له موږ سره د واټساپ یا برېښنالیک له لارې اړیکه ونیسئ.",
  contactSupport: "له ملاتړ سره اړیکه",
  faqBookServiceQuestion: "څنګه یو خدمت بک کړم؟",
  faqBookServiceAnswer: "له کور یا لټون څخه اړین خدمت وټاکئ، که چمتو کوونکی موجود وي هغه انتخاب کړئ، بیا د بکینګ معلومات او وخت بشپړ او تایید کړئ.",
  faqSavedAddressesQuestion: "خوندي شوې پتې څنګه کار کوي؟",
  faqSavedAddressesAnswer: "هغه پتې چې په حساب کې خوندي کوئ د بکینګ پر مهال شتون لري. له حساب ← خوندي شوې پتې څخه یې اضافه، سمول یا ړنګولای شئ.",
  faqCancelBookingQuestion: "څنګه خپل بکینګ لغوه کړم؟",
  faqCancelBookingAnswer: "بکینګونه خلاص کړئ او هغه غوښتنه وټاکئ چې اداره کول یې غواړئ. د لغوه کولو انتخابونه د بکینګ اوسني حالت او موجودو کړنو پورې تړلي دي.",
  faqCancellationFeeQuestion: "ایا د بکینګ لغوه کول فیس لري؟",
  faqCancellationFeeAnswer: "اوس مهال خدمت په اپ کې د لغوه کولو اتومات فیس نه ښيي. که وروسته مقررات یا فیسونه اضافه شي، باید د لغوه کولو له تایید مخکې درته وښودل شي.",
  faqAccountInfoQuestion: "څنګه د خپل حساب معلومات بدل کړم؟",
  faqAccountInfoAnswer: "حساب ← شخصي معلومات ته لاړ شئ ترڅو نوم، برېښنالیک یا د پروفایل انځور بدل کړئ. تایید شوې د تلیفون شمېره د حساب د امنیت لپاره جلا اداره کېږي.",
  faqPasswordQuestion: "څنګه پټنوم وټاکم یا بدل کړم؟",
  faqPasswordAnswer: "حساب ← محرمیت او امنیت ← پټنوم ټاکل یا بدلول ته لاړ شئ. پټنوم د تایید شوي Supabase حساب له لارې اداره کېږي.",
  faqBiometricQuestion: "بایومیټریک ننوتل څنګه کار کوي؟",
  faqBiometricAnswer: "کله چې په محرمیت او امنیت کې فعال وي، Face ID، Touch ID، د ګوتې نښه یا د وسیلې تایید ستاسو په همدې وسیله د خدمت ننوتلې ناسته خوندي کوي.",
  faqSupportQuestion: "څنګه د خدمت له ملاتړ سره اړیکه ونیسم؟",
  faqSupportAnswer: "د ملاتړ سره د اړیکې پاڼه خلاصه کړئ او ستونزه ولیکئ. د خدمت د واټساپ ملاتړ ګروپ خلاصولای شئ یا دواړو ملاتړ اړیکو ته یو برېښنالیک ولیږئ.",

  // حساب - له ملاتړ سره اړیکه
  contactSupportTitle: "له ملاتړ سره اړیکه",
  contactSupportDescription: "خپله ستونزه ولیکئ، بیا واټساپ یا برېښنالیک وټاکئ.",
  supportSubjectLabel: "موضوع",
  supportSubjectPlaceholder: "لکه: زما د وروستي بکینګ ستونزه",
  supportMessageLabel: "پیغام",
  supportMessagePlaceholder: "مهرباني وکړئ تر امکان پورې ډېر معلومات ولیکئ...",
  contactKhedmat: "له خدمت سره اړیکه",
  whatsapp: "واټساپ",
  email: "برېښنالیک",
  missingInformationTitle: "معلومات نیمګړي دي",
  missingInformationMessage: "له ملاتړ سره د اړیکې مخکې موضوع او پیغام دواړه ولیکئ.",
  unableOpenWhatsappTitle: "واټساپ خلاص نه شو",
  unableOpenWhatsappMessage: "د خدمت د ملاتړ ګروپ خلاص نه شو. برېښنالیک وکاروئ.",
  unableOpenEmailTitle: "برېښنالیک خلاص نه شو",
  unableOpenEmailMessage: "د برېښنالیک اپ خلاص نه شو. واټساپ وکاروئ.",

  // د اپ بایومیټریک قفل
  khedmatLockedTitle: "خدمت قفل دی",
  biometricUnlockSubtitle: "د دوام لپاره د وسیلې تایید وکاروئ.",
  unlockWithBiometrics: "په بایومیټریک خلاص کړئ",
  checkingBiometrics: "کتل کېږي...",
  signOutAction: "له حسابه وتل",
  biometricProtectionNote: "ستاسو حساب په دې وسیله د بایومیټریک په وسیله خوندي دی.",

  // حساب - تادیات / حقوقي
  paymentsTitle: "تادیات",
  paymentMethodsTitle: "د تادیې لارې",
  cashPaymentMethod: "نغدي",
  defaultMethod: "اصلي لاره",
  addCreditDebitCard: "کریډیټ یا ډیبیټ کارت اضافه کړئ",
  paymentHistoryTitle: "د تادیاتو تاریخچه",
  termsPrivacyTitle: "شرایط او محرمیت",
  lastUpdatedLabel: "وروستی تازه کول: اګست ۲۰۲۶",

  // Account - Additional localized feedback
  firstNamePlaceholder: "نوم ولیکئ",
  lastNamePlaceholder: "تخلص ولیکئ",
  photoUnavailableTitle: "انځور نشته",
  photoUnavailableMessage: "ټاکل شوی انځور پورته نه شو. مهرباني وکړئ بل انځور وازمویئ.",
  nameRequiredTitle: "نوم اړین دی",
  nameRequiredMessage: "مهرباني وکړئ خپل بشپړ نوم ولیکئ.",
  invalidEmailTitle: "ناسم برېښنالیک",
  invalidEmailMessage: "مهرباني وکړئ سم برېښنالیک پته ولیکئ.",
  profileSavedTitle: "خوندي شو",
  profileSavedMessage: "ستاسو د پروفایل معلومات تازه شول.",
  unableSaveTitle: "خوندي نه شول",
  unableSaveMessage: "ستاسو بدلونونه یا د پروفایل انځور خوندي نه شول. خپل اتصال وګورئ او بیا هڅه وکړئ.",
  biometricUpdateErrorTitle: "بایومیټریک ننوتل",
  biometricUpdateErrorMessage: "د بایومیټریک ننوتلو تنظیم تازه نه شو.",

  // Account - Profile menu
  profileName: "پېرودونکی",
  accountSectionTitle: "حساب",
  personalInformationMenuTitle: "شخصي معلومات",
  personalInformationMenuSubtitle: "نوم، د ټیلیفون شمېره او د پروفایل عکس",
  savedAddressesMenuTitle: "خوندي شوې پتې",
  savedAddressesMenuSubtitle: "کور، د کار ځای او نورې پتې",
  appLanguage: "د اپلېکېشن ژبه",
  settingsSectionTitle: "تنظیمات",
  notificationsMenuTitle: "خبرتیاوې",
  notificationsMenuSubtitle: "رزرفونه، پیغامونه او د حساب بدلونونه",
  privacySecurityMenuTitle: "محرمیت او امنیت",
  privacySecurityMenuSubtitle: "پټنوم، اجازې او د معلوماتو مدیریت",
  paymentsMenuTitle: "تادیات",
  paymentsMenuSubtitle: "د تادیې لارې او تاریخچه",
  supportSectionTitle: "ملاتړ",
  helpCenterMenuTitle: "د مرستې مرکز",
  helpCenterMenuSubtitle: "عامې پوښتنې او د کارونې لارښود",
  contactSupportMenuTitle: "له ملاتړ سره اړیکه",
  contactSupportMenuSubtitle: "ستونزه راپور کړئ یا مرسته وغواړئ",
  termsPrivacyMenuTitle: "د کارونې شرایط او محرمیت",
  accountActionsSectionTitle: "د حساب مدیریت",
  logoutAction: "له حسابه وتل",
  logoutConfirmation: "ایا ډاډه یاست چې غواړئ له خپل حسابه ووځئ؟",
  cancelActionProfile: "لغوه",
  appVersionLabel: "خدمت، نسخه ۱.۰.۰",

  // Account - Saved Addresses feedback
  deleteAddressConfirmation: "ایا غواړئ د {label} پته ړنګه کړئ؟",
  deleteAddressErrorTitle: "تېروتنه",
  deleteAddressErrorMessage: "پته ړنګه نه شوه. مهرباني وکړئ بیا هڅه وکړئ.",

  // Account - Help Center shared labels
  clearSearch: "لټون پاک کړئ",

  // Account - Password feedback
  passwordTooShortTitle: "پټنوم ډېر لنډ دی",
  passwordTooShortMessage: "پټنوم باید لږ تر لږه ۸ توري ولري.",
  passwordsDoNotMatchTitle: "پټنومونه یو شان نه دي",
  passwordsDoNotMatchMessage: "مهرباني وکړئ په دواړو برخو کې یو شان پټنوم ولیکئ.",
  passwordUpdatedTitle: "پټنوم تازه شو",
  passwordUpdatedMessage: "ستاسو د حساب پټنوم په بریالیتوب سره تازه شو.",
  doneAction: "بشپړ",
  unableToUpdatePasswordTitle: "پټنوم تازه نه شو",
  passwordReauthRequired: "د امنیت لپاره، بیا خپل حساب ته ننوځئ او وروسته د پټنوم بدلون بیا هڅه کړئ.",
  weakPasswordMessage: "پټنوم اړین امنیتي شرایط نه پوره کوي.",
  passwordUpdateGenericError: "پټنوم تازه نه شو. مهرباني وکړئ بیا هڅه وکړئ.",

  // Account - Biometric lock feedback
  biometricPromptMessage: "خدمت خلاص کړئ",
  cancelBiometricPrompt: "لغوه",
  useDevicePasscode: "د وسیلې پټنوم وکاروئ",
  biometricGenericUnlockError: "ستاسو هویت تایید نه شو. بیا هڅه وکړئ یا له حسابه ووځئ.",
  biometricSignOutError: "له حسابه وتل بریالي نه شول. مهرباني وکړئ بیا هڅه وکړئ.",
  biometricNotEnrolled: "{label} نور په دې وسیله کې ثبت نه دی. له حسابه ووځئ، د وسیلې تنظیمات تازه کړئ او بیا ننوځئ.",
  biometricNotAvailable: "{label} اوس مهال شتون نه لري. بیا هڅه وکړئ یا له حسابه ووځئ.",
  biometricLockout: "د وسیلې بایومیټریک د ډېرو ناکامو هڅو له امله موقتي بند شوی. که امکان وي د وسیلې پټنوم وکاروئ یا وروسته بیا هڅه وکړئ.",
  biometricAuthenticationFailed: "ستاسو هویت تایید نه شو. مهرباني وکړئ بیا هڅه وکړئ.",

  // Account - Payments
  paymentsScreenTitle: "تادیات",
  paymentMethodsSectionTitle: "د تادیې لارې",
  cashPaymentTitle: "نغدي",
  cashPaymentSubtitle: "اوس مهال ملاتړ کېږي",
  onlinePaymentsSectionTitle: "آنلاین تادیات",
  onlinePaymentsTitle: "کارتونه او ډیجیټلي تادیات",
  onlinePaymentsSubtitle: "د آنلاین تادیې لارې به په راتلونکې تازه نسخه کې شتون ولري.",
  comingSoonLabel: "ژر راځي",
  paymentsInfoNote: "کله چې خوندي آنلاین تادیات چمتو شي، د تادیې نور انتخابونه به هم اضافه شي.",

  // Account - Terms & Privacy
  termsPrivacyScreenTitle: "شرایط او محرمیت",
  lastUpdatedAugust2026: "وروستی تازه کېدل: اګست ۲۰۲۶",
  privacyMattersTitle: "ستاسو محرمیت مهم دی",
  privacyMattersSubtitle: "خدمت د حساب او خدمت معلومات یوازې د اپلېکېشن چلولو، د خدمتونو د همغږۍ او د حساب د لاسرسي د خوندي کولو لپاره کاروي.",
  termsOfUseSectionTitle: "د کارونې شرایط",
  termsOfUseSectionBody: "خدمت په قانوني او درناوي ډک ډول وکاروئ. له پلاتفورم څخه ناوړه استفاده، د نورو د هویت نقل، د خدمتونو ګډوډول، یا درغلیز او زیانمن فعالیتونه مه کوئ.",
  privacyDataSectionTitle: "محرمیت او معلومات",
  privacyDataSectionBody: "خدمت کولای شي هغه معلومات چې تاسو یې ورکوئ، لکه د پروفایل، اړیکې، پتې او رزرف معلومات، د حساب د ځانګړتیاوو او د خدمت د همغږۍ لپاره وکاروي.",
  accountSecuritySectionTitle: "د حساب امنیت",
  accountSecuritySectionBody: "تاسو د خپل حساب او وسیلې د لاسرسي د خوندي ساتلو مسئول یاست. هر ډول شکمن غیرمجاز لاسرسی د خدمت د ملاتړ له لارې راپور کړئ.",
  serviceInformationSectionTitle: "د خدمت معلومات",
  serviceInformationSectionBody: "د رزرف اړوند معلومات کېدای شي د اړتیا په وخت کې د اړوندو خدمت‌چمتو کوونکو سره شریک شي څو غوښتل شوی خدمت همغږي او بشپړ شي.",
  contactSupportPolicySectionTitle: "اړیکه او ملاتړ",
  contactSupportPolicySectionBody: "د دې تګلارو په اړه پوښتنې د اړیکې له ملاتړ پاڼې څخه د واتساپ یا برېښنالیک له لارې لېږلی شئ.",
  policyUpdateNotice: "دا تګلارې کېدای شي د خدمتونو او ځانګړتیاوو د پراختیا سره سم تازه شي.",

  // Returning user login
  loginTitle: "بېرته ښه راغلاست",
  loginSubtitle: "خدمت ته د دوام لپاره خپل حساب ته ننوځئ",
  loginPhoneLabel: "د ټیلیفون شمېره",
  loginPhonePlaceholderAfghanistan: "۷۰۱۲۳۴۵۶۷",
  loginPhonePlaceholderIndia: "۹۸۷۶۵۴۳۲۱۰",
  loginContinue: "دوام",
  loginSendingCode: "کوډ لېږل کېږي...",
  loginNoAccount: "حساب نه لرئ؟",
  loginCreateAccount: "حساب جوړ کړئ",
  loginOr: "یا",
  loginGoogle: "ګوګل",
  loginApple: "اپل",
  loginErrorTitle: "ننوتل بریالي نه شول",
  loginOtpError: "د ننوتلو کوډ ونه لېږل شو. د ټیلیفون شمېره وګورئ او بیا هڅه وکړئ.",
  loginAccountNotFound: "د دې ټیلیفون شمېرې لپاره حساب ونه موندل شو. لومړی حساب جوړ کړئ.",

  // Logout feedback
  logoutFailedTitle: "له حسابه وتل بریالي نه شول",
  logoutFailedMessage: "خدمت ونه شو کولای تاسو له حسابه وباسي. مهرباني وکړئ بیا هڅه وکړئ.",

  // Workspace switching
  switchToProviderTitle: "د خدمت وړاندې کوونکي حساب ته لاړ شئ",
  switchToProviderSubtitle: "خپل د خدمت وړاندې کوونکي حساب پرانیزئ یا نوی حساب جوړ کړئ",
  switchWorkspaceFailedTitle: "د حساب بدلول بریالي نه شول",
  switchWorkspaceFailedMessage: "خدمت ونه شو کولای ستاسو د خدمت وړاندې کوونکي حسابونه پورته کړي. مهرباني وکړئ بیا هڅه وکړئ.",

  // Customer workspace switching
  switchToCustomerTitle: "د پیرودونکي حساب ته لاړ شئ",
  switchToCustomerSubtitle: "خپل د پیرودونکي حساب پرانیزئ",

  // Provider onboarding entry
  becomeProviderTitle: "د خدمت وړاندې کوونکی شئ",
  becomeProviderSubtitle: "خپل د خدمت وړاندې کوونکي پروفایل جوړ کړئ او د خدمتونو وړاندې کول پیل کړئ",

} satisfies Record<TranslationKeys, string>;

export default pashto;
