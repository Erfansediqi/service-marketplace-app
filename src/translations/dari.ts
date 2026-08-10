import type { TranslationKeys } from "./en";

const dari = {
  // Language Screen
  chooseLanguage: "انتخاب زبان",
  subtitle: "لطفاً زبان مورد نظر خود را انتخاب کنید",
  continue: "ادامه",

  // Common
  next: "بعدی",
  back: "بازگشت",
  skip: "رد کردن",

  // Onboarding 1
  onboarding1Title: "رزرو هر خدمتی در چند دقیقه",
  onboarding1Subtitle:
    "برق‌کار، لوله‌کش، نظافت‌چی و موارد دیگر — همه تایید شده با امتیازات و نظرات واقعی.",

  // Onboarding 2
  onboarding2Title: "ارائه‌دهندگان خدمات حرفه‌ای",
  onboarding2Subtitle:
    "با متخصصان ماهر که کار را در همان بار اول به درستی انجام می‌دهند، متصل شوید.",

  // Onboarding 3
  onboarding3Title: "پرداخت امن و پشتیبانی",
  onboarding3Subtitle:
    "از پرداخت‌های آسان و پشتیبانی مشتریان ۲۴ ساعته در هر زمان که نیاز دارید لذت ببرید.",

  // Signup Screen
  sendVerificationCode: "ارسال کد تایید",
  legalTextCombined:
    "با ادامه دادن، شما با شرایط و سیاست حفظ حریم خصوصی ما موافقت می‌کنید",
  termsOfUse: "شرایط استفاده",
  privacyPolicy: "سیاست حفظ حریم خصوصی",
  serviceAccount: "حساب خدماتی",
  createAccountTitle: "ایجاد حساب کاربری",
  createAccountSubtitle: "فقط دو مشخصه برای شروع",
  fullNameLabel: "نام کامل",
  fullNamePlaceholder: "احمد ظاهر",
  phoneLabel: "شماره تلفن",
  nameError: "لطفاً نام کامل خود را وارد کنید.",
  phoneError: "لطفاً یک شماره تلفن معتبر وارد کنید.",

  // Location Permission Screen
  locationEyebrow: "راه‌اندازی حساب",
  locationTitle: "فعال‌سازی دسترسی به موقعیت مکانی",
  locationSubtitle:
    "لطفاً دسترسی به موقعیت مکانی را مجاز سازید تا ارائه‌دهندگان خدمات در نزدیکی خود را پیدا کنید، توصیه‌های دقیق دریافت کنید و آدرس خود را به طور خودکار تنظیم کنید.",
  allowLocation: "هنگام استفاده از برنامه مجاز باشد",
  manualAddress: "ورود دستی آدرس",
  backLabel: "بازگشت",

  // Confirm Location Screen
  confirmLocationHeader: "انتخاب موقعیت مکانی",
  selectedLocationEyebrow: "موقعیت انتخاب شده",
  defaultAddressTitle: "در حال یافتن آدرس...",
  defaultAddressDetails: "لطفاً کمی صبر کنید.",
  fallbackLocationTitle: "موقعیت انتخاب شده",
  fallbackAddressDetails: "آدرس دقیق یافت نشد.",
  coordinatesUnavailable: "در حال حاضر امکان دریافت آدرس وجود ندارد.",
  coordinatesSuccess: "مختصات موقعیت مکانی با موفقیت دریافت شد.",
  movingMapTitle: "در حال انتخاب موقعیت...",
  movingMapDetails: "نشانگر را روی نقطه دلخواه خود قرار دهید.",
  latitudeLabel: "عرض جغرافیایی",
  longitudeLabel: "طول جغرافیایی",
  confirmLocationButton: "تایید این موقعیت",
  manualAddressButton: "ورود دستی آدرس",
  recenterLabel: "بازگشت به موقعیت فعلی",
  editAction: "ویرایش",
  confirmAction: "تایید",
  manualAlertTitle: "ورود دستی آدرس",
  manualAlertBody:
    "صفحه انتخاب ولایت، شهر، ناحیه و آدرس دقیق در مرحله بعدی ساخته خواهد شد.",
  okAction: "باشه",

  // Manual Address Screen
  manualEyebrow: "آدرس دستی",
  manualTitle: "آدرس خود را وارد کنید",
  manualSubtitle:
    "ولایت و ناحیه خود را انتخاب کنید، سپس جزئیات دقیق آدرس خود را وارد کنید.",
  provinceLabel: "ولایت",
  provincePlaceholder: "انتخاب ولایت",
  provinceTitle: "انتخاب ولایت",
  provinceSubtitle: "ولایت محل سکونت خود را انتخاب کنید.",
  provinceSearch: "جستجوی ولایت...",
  provinceEmpty: "ولایتی یافت نشد",
  districtLabel: "شهر / ناحیه",
  districtPlaceholder: "انتخاب شهر یا ناحیه",
  districtPlaceholderDisabled: "ابتدا ولایت را انتخاب کنید",
  districtTitle: "انتخاب شهر یا ناحیه",
  districtSubtitle: "شهر یا ناحیه هدف را در ولایت انتخاب کنید.",
  districtSearch: "جستجوی شهر یا ناحیه...",
  districtEmpty: "شهر یا ناحیه‌ای یافت نشد",
  neighbourhoodLabel: "محله / منطقه",
  neighbourhoodPlaceholder: "مثلاً ناحیه ۵",
  streetLabel: "کوچه یا جاده",
  streetPlaceholder: "نام کوچه یا جاده",
  houseLabel: "شماره خانه / آپارتمان",
  housePlaceholder: "اختیاری",
  detailsLabel: "جزئیات بیشتر",
  detailsPlaceholder: "مثلاً نزدیک مسجد، روبروی مکتب...",
  saveAddressButton: "ذخیره آدرس",
  provinceErrorText: "لطفاً ولایت خود را انتخاب کنید.",
  districtErrorText: "لطفاً شهر یا ناحیه خود را انتخاب کنید.",
  neighbourhoodErrorText: "لطفاً محله یا منطقه را وارد کنید.",
  manualalertTitle: "آدرس دستی",
  manualalertBody:
    "صفحه انتخاب ولایت، شهر، ناحیه و آدرس دقیق در مرحله بعدی ساخته خواهد شد.",
  backlabel: "بازگشت",
  okaction: "باشه",

  // Role Selection Screen
  roleEyebrow: "نوع حساب",
  roleTitle: "چگونه می‌خواهید از خدمت استفاده کنید؟",
  roleSubtitle: "گزینه‌ای را انتخاب کنید که با نیاز شما مطابقت دارد.",
  customerTitle: "دریافت‌کنندهٔ خدمات",
  customerSubtitle:
    "خدمات مورد نیاز خود را پیدا کنید، ارائه‌دهندگان را مقایسه کنید و درخواست خود را ثبت نمایید.",
  providerTitle: "ارائه‌دهندهٔ خدمات",
  providerSubtitle:
    "مهارت‌ها و خدمات خود را معرفی کنید، درخواست‌های مشتریان را دریافت کنید و کار خود را گسترش دهید.",
  roleHelperText: "بعداً می‌توانید نوع حساب خود را از تنظیمات تغییر دهید.",
    // Notifications
  notificationsTitle: "اعلان‌ها",
  notificationsEmptyTitle: "هنوز اعلانی وجود ندارد",
  customerNotificationsEmptyBody:
    "تغییرات رزرو از سوی ارائه‌دهندگان خدمات در اینجا نمایش داده می‌شود.",
  providerNotificationsEmptyBody:
    "درخواست‌های جدید رزرو و تغییرات مشتریان در اینجا نمایش داده می‌شود.",
  markAllAsRead: "همه را خوانده‌شده علامت بزن",

  notificationBookingCreatedTitle: "درخواست جدید رزرو",
  notificationBookingCreatedBody:
    "{{customerName}} خدمت شما را درخواست کرده است.",

  notificationBookingConfirmedTitle: "رزرو تایید شد",
  notificationBookingConfirmedBody:
    "{{providerName}} رزرو شما را پذیرفت.",

  notificationBookingCompletedTitle: "رزرو تکمیل شد",
  notificationBookingCompletedBody:
    "{{providerName}} رزرو شما را تکمیل‌شده علامت زد.",
  // حساب - اطلاعات شخصی
  personalInformationTitle: "اطلاعات شخصی",
  changePhoto: "تغییر عکس",
  firstNameLabel: "نام",
  lastNameLabel: "نام خانوادگی",
  emailAddressLabel: "آدرس ایمیل",
  phoneNumberLabel: "شماره تلفن",
  emailAddressPlaceholder: "آدرس ایمیل را وارد کنید",
  verifiedPhoneHint: "شماره تلفن به حساب تأییدشده وصل است و از اینجا قابل تغییر نیست.",
  saveChanges: "ذخیره تغییرات",
  savingChanges: "در حال ذخیره...",

  // حساب - حریم خصوصی و امنیت
  privacySecurityTitle: "حریم خصوصی و امنیت",
  securitySectionTitle: "امنیت",
  setOrChangePassword: "تنظیم یا تغییر رمز عبور",
  updatePasswordSubtitle: "رمز عبور حساب خود را به‌روزرسانی کنید.",
  biometricLogin: "ورود بیومتریک",
  biometricLoginAvailableSubtitle: "برای باز کردن خدمت در این دستگاه از بیومتریک دستگاه استفاده کنید.",
  biometricLoginUnavailableSubtitle: "برای فعال‌سازی دسترسی امن، ابتدا بیومتریک دستگاه را تنظیم کنید.",
  dataPrivacySectionTitle: "داده‌ها و حریم خصوصی",
  locationServices: "خدمات موقعیت مکانی",
  locationServicesSubtitle: "به خدمت اجازه دهید برای خدمات نزدیک از موقعیت شما استفاده کند.",
  deleteAccount: "حذف حساب",
  deleteAccountSubtitle: "حساب خدمت خود را برای همیشه حذف کنید.",

  // حساب - رمز عبور
  changePasswordTitle: "تنظیم یا تغییر رمز عبور",
  secureAccountTitle: "حساب خود را امن کنید",
  secureAccountSubtitle: "رمزی انتخاب کنید که برای حساب دیگری استفاده نمی‌کنید.",
  newPasswordLabel: "رمز عبور جدید",
  newPasswordPlaceholder: "رمز عبور جدید را وارد کنید",
  confirmPasswordLabel: "تأیید رمز عبور",
  confirmPasswordPlaceholder: "رمز عبور را دوباره وارد کنید",
  passwordMinimumRequirement: "حداقل ۸ نویسه",
  passwordsDoNotMatch: "رمزهای عبور یکسان نیستند.",
  passwordSecurityNote: "رمز عبور شما به‌صورت امن از طریق حساب تأییدشده مدیریت می‌شود.",
  savePassword: "ذخیره رمز عبور",
  savingPassword: "در حال ذخیره...",
  showPassword: "نمایش رمز عبور",
  hidePassword: "پنهان کردن رمز عبور",

  // حساب - آدرس‌های ذخیره‌شده
  savedAddressesTitle: "آدرس‌های ذخیره‌شده",
  addNewAddress: "افزودن آدرس جدید",
  editAddress: "ویرایش آدرس",
  deleteAddress: "حذف",
  deleteAddressTitle: "حذف آدرس",
  cancelAction: "لغو",
  noSavedAddressesTitle: "هنوز آدرسی ذخیره نشده",
  noSavedAddressesSubtitle: "آدرس‌هایی که ذخیره کنید در اینجا نمایش داده می‌شوند.",
  homeAddressLabel: "خانه",
  workAddressLabel: "کار",
  otherAddressLabel: "سایر",

  // حساب - مرکز راهنما
  helpCenterTitle: "مرکز راهنما",
  helpSearchPlaceholder: "چگونه می‌توانیم کمک کنیم؟",
  frequentlyAskedQuestions: "پرسش‌های متداول",
  noMatchingHelpTopics: "موضوع مرتبطی پیدا نشد",
  noMatchingHelpTopicsSubtitle: "عبارت دیگری جستجو کنید یا مستقیماً با پشتیبانی تماس بگیرید.",
  stillNeedHelp: "هنوز به کمک نیاز دارید؟",
  contactThroughWhatsappEmail: "از طریق واتساپ یا ایمیل با ما تماس بگیرید.",
  contactSupport: "تماس با پشتیبانی",
  faqBookServiceQuestion: "چگونه یک خدمت رزرو کنم؟",
  faqBookServiceAnswer: "از خانه یا جستجو، خدمت مورد نیاز را انتخاب کنید، در صورت موجود بودن ارائه‌دهنده را برگزینید و سپس جزئیات و زمان رزرو را تکمیل و تأیید کنید.",
  faqSavedAddressesQuestion: "آدرس‌های ذخیره‌شده چگونه کار می‌کنند؟",
  faqSavedAddressesAnswer: "آدرس‌هایی که در حساب ذخیره می‌کنید هنگام رزرو در دسترس هستند. از حساب ← آدرس‌های ذخیره‌شده می‌توانید آن‌ها را اضافه، ویرایش یا حذف کنید.",
  faqCancelBookingQuestion: "چگونه رزرو خود را لغو کنم؟",
  faqCancelBookingAnswer: "بخش رزروها را باز کنید و درخواست مورد نظر را انتخاب کنید. گزینه‌های لغو به وضعیت فعلی رزرو و اقدام‌های موجود برای آن بستگی دارد.",
  faqCancellationFeeQuestion: "آیا لغو رزرو هزینه دارد؟",
  faqCancellationFeeAnswer: "در حال حاضر خدمت هزینه لغو خودکار در برنامه نمایش نمی‌دهد. اگر بعداً مقررات یا هزینه‌ای اضافه شود، باید پیش از تأیید لغو به شما نشان داده شود.",
  faqAccountInfoQuestion: "چگونه اطلاعات حساب خود را تغییر دهم؟",
  faqAccountInfoAnswer: "به حساب ← اطلاعات شخصی بروید تا نام، ایمیل یا عکس پروفایل را تغییر دهید. شماره تلفن تأییدشده برای امنیت حساب جداگانه مدیریت می‌شود.",
  faqPasswordQuestion: "چگونه رمز عبور را تنظیم یا تغییر دهم؟",
  faqPasswordAnswer: "به حساب ← حریم خصوصی و امنیت ← تنظیم یا تغییر رمز عبور بروید. رمز عبور از طریق حساب تأییدشده Supabase مدیریت می‌شود.",
  faqBiometricQuestion: "ورود بیومتریک چگونه کار می‌کند؟",
  faqBiometricAnswer: "وقتی در حریم خصوصی و امنیت فعال باشد، Face ID، Touch ID، اثر انگشت یا تأیید هویت دستگاه از نشست واردشده خدمت روی همان دستگاه محافظت می‌کند.",
  faqSupportQuestion: "چگونه با پشتیبانی خدمت تماس بگیرم؟",
  faqSupportAnswer: "صفحه تماس با پشتیبانی را باز کنید و مشکل را توضیح دهید. می‌توانید گروه پشتیبانی واتساپ خدمت را باز کنید یا یک ایمیل برای هر دو تماس پشتیبانی بنویسید.",

  // حساب - تماس با پشتیبانی
  contactSupportTitle: "تماس با پشتیبانی",
  contactSupportDescription: "مشکل خود را توضیح دهید، سپس واتساپ یا ایمیل را انتخاب کنید.",
  supportSubjectLabel: "موضوع",
  supportSubjectPlaceholder: "مثلاً مشکل در رزرو اخیر من",
  supportMessageLabel: "پیام",
  supportMessagePlaceholder: "لطفاً تا حد امکان جزئیات را بنویسید...",
  contactKhedmat: "تماس با خدمت",
  whatsapp: "واتساپ",
  email: "ایمیل",
  missingInformationTitle: "اطلاعات ناقص",
  missingInformationMessage: "لطفاً پیش از تماس با پشتیبانی، موضوع و پیام را وارد کنید.",
  unableOpenWhatsappTitle: "واتساپ باز نشد",
  unableOpenWhatsappMessage: "گروه پشتیبانی خدمت باز نشد. ایمیل را امتحان کنید.",
  unableOpenEmailTitle: "ایمیل باز نشد",
  unableOpenEmailMessage: "برنامه ایمیل باز نشد. واتساپ را امتحان کنید.",

  // قفل بیومتریک برنامه
  khedmatLockedTitle: "خدمت قفل است",
  biometricUnlockSubtitle: "برای ادامه از تأیید هویت دستگاه استفاده کنید.",
  unlockWithBiometrics: "باز کردن با بیومتریک",
  checkingBiometrics: "در حال بررسی...",
  signOutAction: "خروج از حساب",
  biometricProtectionNote: "حساب شما در این دستگاه با بیومتریک محافظت می‌شود.",

  // حساب - پرداخت / حقوقی
  paymentsTitle: "پرداخت‌ها",
  paymentMethodsTitle: "روش‌های پرداخت",
  cashPaymentMethod: "نقدی",
  defaultMethod: "روش پیش‌فرض",
  addCreditDebitCard: "افزودن کارت اعتباری یا بانکی",
  paymentHistoryTitle: "تاریخچه پرداخت",
  termsPrivacyTitle: "شرایط و حریم خصوصی",
  lastUpdatedLabel: "آخرین به‌روزرسانی: آگست ۲۰۲۶",

  // Account - Additional localized feedback
  firstNamePlaceholder: "نام را وارد کنید",
  lastNamePlaceholder: "نام خانوادگی را وارد کنید",
  photoUnavailableTitle: "عکس در دسترس نیست",
  photoUnavailableMessage: "عکس انتخاب‌شده بارگذاری نشد. لطفاً عکس دیگری را امتحان کنید.",
  nameRequiredTitle: "نام لازم است",
  nameRequiredMessage: "لطفاً نام کامل خود را وارد کنید.",
  invalidEmailTitle: "ایمیل نامعتبر",
  invalidEmailMessage: "لطفاً یک آدرس ایمیل معتبر وارد کنید.",
  profileSavedTitle: "ذخیره شد",
  profileSavedMessage: "اطلاعات پروفایل شما به‌روزرسانی شد.",
  unableSaveTitle: "ذخیره انجام نشد",
  unableSaveMessage: "تغییرات یا عکس پروفایل ذخیره نشد. اتصال خود را بررسی کرده و دوباره تلاش کنید.",
  biometricUpdateErrorTitle: "ورود بیومتریک",
  biometricUpdateErrorMessage: "تنظیم ورود بیومتریک به‌روزرسانی نشد.",

  // Account - Profile menu
  profileName: "مشتری",
  accountSectionTitle: "حساب",
  personalInformationMenuTitle: "اطلاعات شخصی",
  personalInformationMenuSubtitle: "نام، شماره تلفن و عکس پروفایل",
  savedAddressesMenuTitle: "آدرس‌های ذخیره‌شده",
  savedAddressesMenuSubtitle: "خانه، محل کار و آدرس‌های دیگر",
  appLanguage: "زبان برنامه",
  settingsSectionTitle: "تنظیمات",
  notificationsMenuTitle: "اعلان‌ها",
  notificationsMenuSubtitle: "رزروها، پیام‌ها و تغییرات حساب",
  privacySecurityMenuTitle: "حریم خصوصی و امنیت",
  privacySecurityMenuSubtitle: "رمز، دسترسی‌ها و مدیریت اطلاعات",
  paymentsMenuTitle: "پرداخت‌ها",
  paymentsMenuSubtitle: "روش‌های پرداخت و تاریخچه",
  supportSectionTitle: "پشتیبانی",
  helpCenterMenuTitle: "مرکز راهنما",
  helpCenterMenuSubtitle: "پرسش‌های رایج و راهنمای استفاده",
  contactSupportMenuTitle: "تماس با پشتیبانی",
  contactSupportMenuSubtitle: "گزارش مشکل یا درخواست کمک",
  termsPrivacyMenuTitle: "شرایط استفاده و حریم خصوصی",
  accountActionsSectionTitle: "مدیریت حساب",
  logoutAction: "خروج از حساب",
  logoutConfirmation: "آیا مطمئن هستید که می‌خواهید از حساب خود خارج شوید؟",
  cancelActionProfile: "لغو",
  appVersionLabel: "خدمت، نسخهٔ ۱.۰.۰",

  // Account - Saved Addresses feedback
  deleteAddressConfirmation: "آیا می‌خواهید آدرس {label} را حذف کنید؟",
  deleteAddressErrorTitle: "خطا",
  deleteAddressErrorMessage: "حذف آدرس انجام نشد. لطفاً دوباره تلاش کنید.",

  // Account - Help Center shared labels
  clearSearch: "پاک کردن جستجو",

  // Account - Password feedback
  passwordTooShortTitle: "رمز عبور بسیار کوتاه است",
  passwordTooShortMessage: "رمز عبور باید حداقل ۸ نویسه داشته باشد.",
  passwordsDoNotMatchTitle: "رمزهای عبور مطابقت ندارند",
  passwordsDoNotMatchMessage: "لطفاً در هر دو بخش یک رمز عبور یکسان وارد کنید.",
  passwordUpdatedTitle: "رمز عبور به‌روزرسانی شد",
  passwordUpdatedMessage: "رمز عبور حساب شما با موفقیت به‌روزرسانی شد.",
  doneAction: "تمام",
  unableToUpdatePasswordTitle: "رمز عبور به‌روزرسانی نشد",
  passwordReauthRequired: "برای امنیت بیشتر، دوباره وارد حساب شوید و سپس تغییر رمز عبور را تکرار کنید.",
  weakPasswordMessage: "رمز عبور شرایط امنیتی مورد نیاز را برآورده نمی‌کند.",
  passwordUpdateGenericError: "رمز عبور به‌روزرسانی نشد. لطفاً دوباره تلاش کنید.",

  // Account - Biometric lock feedback
  biometricPromptMessage: "باز کردن خدمت",
  cancelBiometricPrompt: "لغو",
  useDevicePasscode: "استفاده از رمز دستگاه",
  biometricGenericUnlockError: "هویت شما تأیید نشد. دوباره تلاش کنید یا از حساب خارج شوید.",
  biometricSignOutError: "خروج از حساب انجام نشد. لطفاً دوباره تلاش کنید.",
  biometricNotEnrolled: "{label} دیگر در این دستگاه ثبت نیست. از حساب خارج شوید، تنظیمات دستگاه را به‌روزرسانی کنید و دوباره وارد شوید.",
  biometricNotAvailable: "{label} در حال حاضر در دسترس نیست. دوباره تلاش کنید یا از حساب خارج شوید.",
  biometricLockout: "بیومتریک دستگاه به‌دلیل تلاش‌های ناموفق متعدد موقتاً قفل شده است. در صورت امکان از رمز دستگاه استفاده کنید یا بعداً دوباره تلاش کنید.",
  biometricAuthenticationFailed: "هویت شما تأیید نشد. لطفاً دوباره تلاش کنید.",

  // Account - Payments
  paymentsScreenTitle: "پرداخت‌ها",
  paymentMethodsSectionTitle: "روش‌های پرداخت",
  cashPaymentTitle: "نقدی",
  cashPaymentSubtitle: "در حال حاضر پشتیبانی می‌شود",
  onlinePaymentsSectionTitle: "پرداخت‌های آنلاین",
  onlinePaymentsTitle: "کارت و پرداخت دیجیتال",
  onlinePaymentsSubtitle: "گزینه‌های پرداخت آنلاین در به‌روزرسانی آینده در دسترس خواهد بود.",
  comingSoonLabel: "به‌زودی",
  paymentsInfoNote: "با فراهم شدن پشتیبانی امن پرداخت آنلاین، گزینه‌های پرداخت بیشتری اضافه خواهد شد.",

  // Account - Terms & Privacy
  termsPrivacyScreenTitle: "شرایط و حریم خصوصی",
  lastUpdatedAugust2026: "آخرین به‌روزرسانی: آگست ۲۰۲۶",
  privacyMattersTitle: "حریم خصوصی شما مهم است",
  privacyMattersSubtitle: "خدمت از اطلاعات حساب و خدمات فقط برای اجرای برنامه، هماهنگی خدمات و محافظت از دسترسی به حساب استفاده می‌کند.",
  termsOfUseSectionTitle: "شرایط استفاده",
  termsOfUseSectionBody: "از خدمت به‌صورت قانونی و محترمانه استفاده کنید. از سوءاستفاده از پلتفرم، جعل هویت دیگران، اختلال در خدمات یا استفاده برای فعالیت‌های متقلبانه یا زیان‌آور خودداری کنید.",
  privacyDataSectionTitle: "حریم خصوصی و داده‌ها",
  privacyDataSectionBody: "خدمت ممکن است از اطلاعاتی که ارائه می‌کنید، از جمله پروفایل، اطلاعات تماس، آدرس و جزئیات رزرو، برای پشتیبانی از امکانات حساب و هماهنگی خدمات استفاده کند.",
  accountSecuritySectionTitle: "امنیت حساب",
  accountSecuritySectionBody: "شما مسئول محافظت از دسترسی به حساب و دستگاه خود هستید. هرگونه دسترسی مشکوک و غیرمجاز را از طریق پشتیبانی خدمت گزارش دهید.",
  serviceInformationSectionTitle: "اطلاعات خدمات",
  serviceInformationSectionBody: "اطلاعات مرتبط با رزرو ممکن است در صورت نیاز برای هماهنگی و تکمیل خدمت درخواستی با ارائه‌دهندگان مربوطه شریک شود.",
  contactSupportPolicySectionTitle: "تماس و پشتیبانی",
  contactSupportPolicySectionBody: "پرسش‌های مربوط به این سیاست‌ها را می‌توانید از طریق صفحه تماس با پشتیبانی و گزینه‌های واتساپ یا ایمیل مطرح کنید.",
  policyUpdateNotice: "این سیاست‌ها ممکن است همزمان با توسعه خدمات و امکانات خدمت به‌روزرسانی شوند.",

} satisfies Record<TranslationKeys, string>;

export default dari;
