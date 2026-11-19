/**
 * Guest-facing invitation copy in Malay and English.
 *
 * Only system strings live here. Text the couple writes (greeting, story, doa,
 * hashtag, gift details) is shown exactly as typed and is never translated.
 *
 * Add a key here whenever a new guest-facing label is introduced; the public
 * invitation page reads everything through `t()` / `td()`.
 */

export type InvitationLang = 'melayu' | 'english';
export type InvitationLanguageMode = InvitationLang | 'bilingual';

type Messages = Record<string, string>;

const MELAYU: Messages = {
  openCta: 'Buka',
  dateTBD: 'Tarikh Belum Ditetapkan',
  loading: 'Memuatkan jemputan...',
  notFound: 'Undangan tidak dijumpai.',
  invalidDate: 'Sila pilih tarikh yang sah.',

  // Countdown units
  unitDays: 'Hari',
  unitHours: 'Jam',
  unitMinutes: 'Minit',
  unitSeconds: 'Saat',

  // Section titles
  wishesTitle: 'Ucapan & Doa',
  wishesEmpty: 'Belum ada ucapan. Jadilah yang pertama!',
  hashtagTitle: 'Hashtag',
  close: 'Tutup',
  musicPlayerTitle: 'Pemain Muzik',
  musicControlTitle: 'Kawal Muzik Latar',
  eventTimeTitle: 'Waktu Majlis',
  itineraryTitle: 'Atur Cara Majlis',
  itineraryEmpty: 'Tiada atur cara majlis ditetapkan.',
  galleryTitle: 'Kenangan Abadi',
  locationTitle: 'Lokasi Majlis',
  noMap: 'Tiada Peta Ditetapkan',
  saveDate: 'Simpan Tarikh',
  celebrateWithUs: 'Raikan Bersama Kami',
  startTime: 'Waktu Mula',
  endTime: 'Waktu Tamat',
  contactFamily: 'Hubungi Keluarga',
  questionsHelp: 'Pertanyaan & Bantuan',
  noContacts: 'Tiada kenalan ditetapkan.',
  receiverPhone: 'No. Telefon Penerima',
  shippingAddress: 'Alamat Penghantaran',
  giftRequest: 'Permintaan Hadiah',
  giftDefaultTitle: 'Hadiah & Ingatan',
  notProvided: 'Belum disediakan',
  closingNote: 'Kami mendoakan yang terbaik untuk urusan anda.',

  // Navigation
  navLocation: 'Lokasi',
  navCalendar: 'Kalendar',
  navContact: 'Hubungi',
  navMusic: 'Muzik',
  navGift: 'Hadiah',

  // RSVP form
  rsvpTitle: 'Sahkan Kehadiran',
  rsvpClosed: 'RSVP Ditutup',
  guestNameLabel: 'Nama Tetamu*',
  guestNamePlaceholder: 'Masukkan nama penuh',
  phoneLabel: 'No. Telefon',
  phonePlaceholder: 'No. telefon',
  emailLabel: 'Alamat Emel',
  emailPlaceholder: 'example@mail.com',
  addressLabel: 'Alamat Rumah',
  addressPlaceholder: 'Alamat penuh...',
  companyLabel: 'Nama Syarikat',
  companyPlaceholder: 'Nama Syarikat',
  jobTitleLabel: 'Jawatan',
  jobTitlePlaceholder: 'Jawatan',
  carPlateLabel: 'No. Plat Kenderaan',
  carPlatePlaceholder: 'ABC 1234',
  remarksLabel: 'Catatan',
  remarksPlaceholder: 'Catatan tambahan...',
  slotLabel: 'Pilih Slot / Kategori',
  slotPlaceholder: 'Sila pilih satu...',
  paxLabel: 'Bilangan Tetamu',
  rsvpSubmit: 'Hantar RSVP',
  submitting: 'Menghantar...',
  sent: 'Terkirim!',
  thanksTitle: 'Alhamdulillah!',
  thanksBody: 'Terima kasih atas maklum balas anda. Jumpa nanti!',
  wishTitle: 'Titipkan Ucapan',
  wishPlaceholder: 'Selamat pengantin baru...',
  addToCalendar: "Tambah Ke Kalendar",
  buyOnline: "Beli Secara Online",
  loading: "Memuatkan jemputan...",
  musicHint: "Mainkan video untuk mendengar lagu.",
  notFound: "Undangan tidak dijumpai.",
};

const ENGLISH: Messages = {
  openCta: 'Open',
  dateTBD: 'Date Not Set',
  loading: 'Loading invitation...',
  notFound: 'Invitation not found.',
  invalidDate: 'Please pick a valid date.',

  unitDays: 'Days',
  unitHours: 'Hours',
  unitMinutes: 'Minutes',
  unitSeconds: 'Seconds',

  wishesTitle: 'Wishes & Prayers',
  wishesEmpty: 'No wishes yet. Be the first!',
  hashtagTitle: 'Hashtag',
  close: 'Close',
  musicPlayerTitle: 'Music Player',
  musicControlTitle: 'Control Background Music',
  eventTimeTitle: 'Event Time',
  itineraryTitle: 'Event Programme',
  itineraryEmpty: 'No event schedule set.',
  galleryTitle: 'Timeless Memories',
  locationTitle: 'Event Location',
  noMap: 'No Map Set',
  saveDate: 'Save the Date',
  celebrateWithUs: 'Celebrate With Us',
  startTime: 'Start Time',
  endTime: 'End Time',
  contactFamily: 'Contact the Family',
  questionsHelp: 'Questions & Help',
  noContacts: 'No contacts set.',
  receiverPhone: 'Recipient Phone No.',
  shippingAddress: 'Shipping Address',
  giftRequest: 'Gift Requests',
  giftDefaultTitle: 'Gifts & Keepsakes',
  notProvided: 'Not provided',
  closingNote: 'We wish you the very best.',

  navLocation: 'Location',
  navCalendar: 'Calendar',
  navContact: 'Contact',
  navMusic: 'Music',
  navGift: 'Gift',

  rsvpTitle: 'Confirm Attendance',
  rsvpClosed: 'RSVP Closed',
  guestNameLabel: 'Guest Name*',
  guestNamePlaceholder: 'Enter full name',
  phoneLabel: 'Phone No.',
  phonePlaceholder: 'Phone number',
  emailLabel: 'Email Address',
  emailPlaceholder: 'example@mail.com',
  addressLabel: 'Home Address',
  addressPlaceholder: 'Full address...',
  companyLabel: 'Company Name',
  companyPlaceholder: 'Company Name',
  jobTitleLabel: 'Job Title',
  jobTitlePlaceholder: 'Job Title',
  carPlateLabel: 'Vehicle Plate No.',
  carPlatePlaceholder: 'ABC 1234',
  remarksLabel: 'Remarks',
  remarksPlaceholder: 'Additional notes...',
  slotLabel: 'Select Slot / Category',
  slotPlaceholder: 'Please select one...',
  paxLabel: 'Number of Guests',
  rsvpSubmit: 'Send RSVP',
  submitting: 'Sending...',
  sent: 'Sent!',
  thanksTitle: 'Thank you!',
  thanksBody: 'Thank you for your response. See you there!',
  wishTitle: 'Leave a Wish',
  wishPlaceholder: 'Congratulations...',
  addToCalendar: "Add to Calendar",
  buyOnline: "Buy Online",
  loading: "Loading invitation...",
  musicHint: "Play the video to hear the song.",
  notFound: "Invitation not found.",
  addToCalendar: "Add to Calendar",
  buyOnline: "Buy Online",
  loading: "Loading invitation...",
  musicHint: "Play the video to hear the song.",
  notFound: "Invitation not found.",
};

export const INVITATION_MESSAGES: Record<InvitationLang, Messages> = {
  melayu: MELAYU,
  english: ENGLISH
};

/** Intl locale used for dates/weekdays in each language. */
export const INVITATION_LOCALE: Record<InvitationLang, string> = {
  melayu: 'ms-MY',
  english: 'en-GB'
};

export const normalizeLanguageMode = (value: unknown): InvitationLanguageMode =>
  value === 'english' || value === 'bilingual' ? value : 'melayu';
