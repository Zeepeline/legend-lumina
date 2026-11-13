'use strict';
// Teks bestiari per musuh (id = kunci ENEMY): habitat & tips melawan. Dipasang ke layar Bestiari oleh sesi besar.
const BESTIARY_TEXT = {
  slime: {
    hab: 'Sering dijumpai melompat di padang rumput dan jalan setapak luar desa.',
    tip: 'Tunggu saat ia mendarat usai melompat, lalu serang cepat sebelum ia melompat lagi.',
  },
  gold_slime: {
    hab: 'Makhluk langka yang berkeliaran acak dan sangat cepat melarikan diri saat melihat manusia.',
    tip: 'Gunakan serangan jarak jauh atau dekati secepatnya sebelum ia kabur dari pandangan.',
  },
  mimic: {
    hab: 'Menyamar sebagai peti harta karun di lorong tersembunyi dan ruang bawah tanah.',
    tip: 'Waspadai terkaman mendadaknya; segera berguling mundur lalu serang dari samping.',
  },
  slimeb: {
    hab: 'Menghuni daerah berair tenang, tepian danau, serta lembah yang lembap.',
    tip: 'Pola lompatannya sedikit lebih agresif; serang balik saat ia baru menjejak tanah.',
  },
  slimer: {
    hab: 'Banyak berkeliaran di lereng berbatu terik dan perbatasan menuju kawah.',
    tip: 'Hindari tabrakannya yang bertenaga dengan menjaga jarak ayunan senjata.',
  },
  slimei: {
    hab: 'Habitatnya berada di dataran es dingin dan jalur pendakian bersalju tebal.',
    tip: 'Waspadai efek dingin yang memperlambat langkah; serang dengan ayunan cepat.',
  },
  bat: {
    hab: 'Beterbangan di kanopi hutan lebat dan mulut gua saat hari mulai temaram.',
    tip: 'Tunggu kelelawar terbang rendah mendekat, lalu tebas tepat sebelum menyenggolmu.',
  },
  batc: {
    hab: 'Bersarang di langit-langit rongga gua yang gelap dan lembap.',
    tip: 'Gerakannya lebih lincah dan membawa hawa dingin; gunakan senjata berjangkauan panjang.',
  },
  bee: {
    hab: 'Berdengung di sekitar padang rumput berbunga dan pohon rindang.',
    tip: 'Awas sengatan beracunnya; serang saat ia berhenti sejenak sebelum menusuk.',
  },
  shroom: {
    hab: 'Tumbuh di tanah humus gelap di kedalaman Hutan Lumina.',
    tip: 'Hindari tembakan sporanya dengan terus bergerak menyamping sambil mendekat.',
  },
  plant: {
    hab: 'Berakar kuat di semak lebat dan area reruntuhan kuno.',
    tip: 'Musuh tipe turet ini tidak bisa berpindah; tebas dari titik buta di belakangnya.',
  },
  skel: {
    hab: 'Bangkit di lorong-lorong gelap reruntuhan purba dan dalam gua.',
    tip: 'Tangkis atau hindari lemparan tulangnya, lalu dekati untuk serangan jarak dekat.',
  },
  goblin: {
    hab: 'Biasa mendirikan perkemahan liar di hutan dan tepian bukit.',
    tip: 'Perhatikan ancang-ancang terjangannya; gulingkan badan ke samping lalu balas serang.',
  },
  wolf: {
    hab: 'Berkeliaran di semak belukar Hutan Lumina dan perbatasan hutan rimba.',
    tip: 'Serigala gemar menerkam lurus; hindari terjangannya lalu tebas sisi tubuhnya.',
  },
  snake: {
    hab: 'Melata di antara semak rimbun dan rerumputan tinggi jalan setapak.',
    tip: 'Hati-hati gigitan racunnya; jaga jarak aman dan gunakan tusukan senjata panjang.',
  },
  boar: {
    hab: 'Menjelajahi padang luas dan jalur semak di dekat tepian sungai.',
    tip: 'Saat ia mulai menyeruduk kencang, menyingkirlah ke samping agar ia menabrak ruang kosong.',
  },
  ghost: {
    hab: 'Melayang di sekitar bangunan tua reruntuhan Aurel pada malam hari.',
    tip: 'Makhluk ini menembus rintangan fisik; serang dengan sihir atau tebasan beruntun.',
  },
  golem: {
    hab: 'Menjaga lorong-lorong batu di kedalaman Gua Batu purba.',
    tip: 'Tubuh batunya tebal dan tahan pukul; serang dengan jurus pemecah atau sihir.',
  },
  gchief: {
    hab: 'Memimpin gerombolan liar dari dalam kemah utama suku goblin.',
    tip: 'Habisi anak buahnya terlebih dahulu agar bisa leluasa menghindari hantamannya.',
  },
  squeen: {
    hab: 'Tumbuh besar di ruang terdalam yang paling lembap di dasar hutan.',
    tip: 'Hancurkan jamur-jamur pemanggil racun di sekitarnya sebelum fokus menyerang ratu.',
  },
  gsnake: {
    hab: 'Mendiami rawa berlumpur dan gua tersembunyi yang berbau menyengat.',
    tip: 'Waspadai semburan racun berskala luas; putari dari samping dan incar ekornya.',
  },
  gking: {
    hab: 'Bertahta di benteng pertahanan goblin dengan pengawalan ketat.',
    tip: 'Saat ia mengamuk di fase kedua, manfaatkan momentum usai ayunan besarnya untuk membalas.',
  },
  frog: {
    hab: 'Melompat di kubangan air dan rawa-rawa penuh tanaman teratai.',
    tip: 'Lompatannya tinggi dan tak terduga; serang tepat saat ia mendarat di tanah.',
  },
  wisp: {
    hab: 'Pendaran cahaya misterius yang melayang di kabut pekat Rawa Senja.',
    tip: 'Gerakannya meliuk-liuk; manfaatkan tebasan melingkar atau proyektil sihir terarah.',
  },
  slimep: {
    hab: 'Berkembang biak di genangan air kotor dan lumpur beracun rawa.',
    tip: 'Lendir beracunnya berbahaya bila disentuh; gunakan penawar jika terkena serangannya.',
  },
  witch: {
    hab: 'Bersemayam di pondok terasing di balik tabir kabut rawa paling pekat.',
    tip: 'Kikis pertahanan mantra pelindungnya dan jauhi lingkaran kutukan di tanah.',
  },
  golemk: {
    hab: 'Tidur pulas di ruang altar kuno Gua Batu menanti penantang tangguh.',
    tip: 'Guncangan gempa pukulannya sangat mematikan; melompat atau menjauhlah saat ia menghentak.',
  },
  wolfs: {
    hab: 'Memburu mangsa dalam kawanan di lereng bersalju Puncak Beku.',
    tip: 'Terjangannya diiringi hawa dingin; gunakan api atau serangan beruntun tanpa jeda.',
  },
  slimef: {
    hab: 'Menggeliat di celah batuan panas dan lereng magma terik.',
    tip: 'Tubuhnya membakar apa pun yang disentuh; kalahkan secepat mungkin sebelum terbakar parah.',
  },
  salam: {
    hab: 'Merayap lincah di tanah gersang dan bebatuan bersuhu tinggi.',
    tip: 'Awas semburan api jarak dekat; pancing ia menyerang lalu serang bagian belakangnya.',
  },
  golemi: {
    hab: 'Terbentuk dari gumpalan es padat di puncak gunung salju abadi.',
    tip: 'Pukulan esnya dapat membekukan seketika; serang dengan jurus api berkekuatan tinggi.',
  },
  kryos: {
    hab: 'Naga es raksasa yang bersemayam di gua puncak tertinggi pegunungan salju.',
    tip: 'Perhatikan hembusan nafas es dan cakaran lebarnya; bergulinglah di bawah sayapnya.',
  },
  bounty_wolf: {
    hab: 'Buronan serigala ganas bertaring perak yang meneror jalur hutan belantara.',
    tip: 'Kecepatan geraknya luar biasa; siapkan kuda-kuda kokoh dan tebas saat ia menukik.',
  },
  bounty_frog: {
    hab: 'Katak raksasa beracun yang mendiami palung terdalam rawa berkabut.',
    tip: 'Semburan racunnya menutupi area luas; siapkan penawar racun dan serang dari belakang.',
  },
  bounty_gargoyle: {
    hab: 'Monster bersayap merah batu yang mengintai dari atas tebing tinggi gua.',
    tip: 'Saat ia menukik menyerang dari udara, hindari lalu hajar sebelum ia sempat terbang lagi.',
  },
  king_slime: {
    hab: 'Penguasa para slime yang mengenakan mahkota berkilau di padang rumput.',
    tip: 'Ukurannya yang besar membuat ayunan senjatamu mudah mengenainya; hindari tindihannya.',
  },
  goblin_archer: {
    hab: 'Berjaga di menara intai kayu perkemahan goblin dengan busur panah.',
    tip: 'Dekati dengan pola zig-zag untuk menghindari anak panahnya, lalu serang dalam jarak dekat.',
  },
  goblin_shaman: {
    hab: 'Mantra dukun goblin kerap terdengar di barisan belakang pasukan musuh.',
    tip: 'Jadikan dukun target utama agar ia tidak sempat menyembuhkan kawanannya.',
  },
};
