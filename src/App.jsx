import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { HalamanInsight, ModalVoice, ModalOCR, HalamanQuranRef, PanelSmartReminder } from "./ProFitur";

// ═══════════════════════ KONSTANTA ═══════════════════════════════════════════

const WARNA = [
  { nama:"emas",   bg:"#181400", garis:"#7a6500", aksen:"#f5c842", kertasLight:"#fdf9ec", kertasDark:"#16140a" },
  { nama:"zamrud", bg:"#001208", garis:"#0d5c2a", aksen:"#34c776", kertasLight:"#eef9f0", kertasDark:"#0a140d" },
  { nama:"langit", bg:"#000d1a", garis:"#0d3a6e", aksen:"#3d9de8", kertasLight:"#eef4fc", kertasDark:"#0a0e16" },
  { nama:"bara",   bg:"#1a0000", garis:"#6e1010", aksen:"#e84040", kertasLight:"#fcefef", kertasDark:"#160a0a" },
  { nama:"ungu",   bg:"#0e0016", garis:"#4a0f7a", aksen:"#9b59e8", kertasLight:"#f6eefc", kertasDark:"#100a16" },
  { nama:"senja",  bg:"#1a0900", garis:"#7a3800", aksen:"#e88530", kertasLight:"#fcf3ec", kertasDark:"#16100a" },
  { nama:"toska",  bg:"#00191a", garis:"#0c5e60", aksen:"#30d8dc", kertasLight:"#eafaf9", kertasDark:"#0a1514" },
  { nama:"mawar",  bg:"#1a0018", garis:"#6e1060", aksen:"#e840b0", kertasLight:"#fcedf6", kertasDark:"#160a12" },
];
const W0 = WARNA[0];

const MOOD = [
  { id:"penting", ikon:"🔥", label:"Penting",    warna:"#e84040" },
  { id:"ide",     ikon:"💡", label:"Ide",         warna:"#f5c842" },
  { id:"ibadah",  ikon:"🙏", label:"Ibadah",      warna:"#34c776" },
  { id:"uang",    ikon:"💸", label:"Keuangan",    warna:"#3d9de8" },
  { id:"kerja",   ikon:"💼", label:"Kerja",       warna:"#9b59e8" },
  { id:"belanja", ikon:"🛒", label:"Belanja",     warna:"#e88530" },
  { id:"sehat",   ikon:"❤️", label:"Kesehatan",  warna:"#e840b0" },
  { id:"santai",  ikon:"😌", label:"Santai",      warna:"#30d8dc" },
];

const TEMPLATE = [
  { ikon:"🛒", nama:"Daftar Belanja",   tipe:"ceklis", judul:"Belanja",           item:["Beras","Minyak goreng","Telur","Sayur","Sabun","Buah"] },
  { ikon:"💸", nama:"Catatan Hutang",   tipe:"teks",   judul:"Hutang / Piutang",  isi:"Nama      :\nJumlah    : Rp\nTanggal   :\nKeterangan:\nStatus    : Belum lunas" },
  {
    ikon:"🌅", nama:"Dzikir Pagi",
    tipe:"ceklis", judul:"Dzikir Pagi — Setelah Shubuh",
    item:[
      "Ta'awwudz — أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ (1×)",
      "Ayat Kursi — اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ … (1×)",
      "Al-Ikhlas — قُلْ هُوَ اللَّهُ أَحَدٌ … (3×)",
      "Al-Falaq — قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ … (3×)",
      "An-Naas — قُلْ أَعُوذُ بِرَبِّ النَّاسِ … (3×)",
      "Ashbahnaa — أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ … (1×)",
      "Allahumma bika ashbahnaa — اللَّهُمَّ بِكَ أَصْبَحْنَا … (1×)",
      "Sayyidul Istighfar — اَللَّهُمَّ أَنْتَ رَبِّيْ لاَ إِلَـهَ إِلاَّ أَنْتَ … (1×)",
      "Allahumma 'aafinii — اَللَّهُمَّ عَافِنِيْ فِيْ بَدَنِيْ … (3×)",
      "Bismillaahilladzii — بِسْمِ اللهِ الَّذِي لاَ يَضُرُّ … (3×)",
      "Radhiitu billaahi — رَضِيْتُ بِاللهِ رَبًّا … (3×)",
      "Yaa Hayyu Yaa Qayyuum — يَا حَيُّ يَا قَيُّوْمُ بِرَحْمَتِكَ أَسْتَغِيْثُ … (1×)",
      "Fitrah Islam — أَصْبَحْنَا عَلَى فِطْرَةِ اْلإِسْلاَمِ … (1×)",
      "Tahlil — لاَ إِلَـهَ إِلاَّ اللهُ وَحْدَهُ … (10×)",
      "Subhaanallaah wa bihamdih — سُبْحَانَ اللهِ وَبِحَمْدِهِ: عَدَدَ خَلْقِهِ … (3×, pagi)",
      "Allahumma innii as'aluka — اَللَّهُمَّ إِنِّيْ أَسْأَلُكَ عِلْمًا نَافِعًا … (1×, pagi)",
      "Subhaanallaah wa bihamdih — سُبْحَانَ اللهِ وَبِحَمْدِهِ (100×)",
      "Istighfar — أَسْتَغْفِرُ اللهَ وَأَتُوْبُ إِلَيْهِ (100×)",
    ],
  },
  {
    ikon:"🌇", nama:"Dzikir Petang",
    tipe:"ceklis", judul:"Dzikir Petang — Setelah Ashar",
    item:[
      "Ta'awwudz — أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ (1×)",
      "Ayat Kursi — اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ … (1×)",
      "Al-Ikhlas — قُلْ هُوَ اللَّهُ أَحَدٌ … (3×)",
      "Al-Falaq — قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ … (3×)",
      "An-Naas — قُلْ أَعُوذُ بِرَبِّ النَّاسِ … (3×)",
      "Amsaynaa — أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ … (1×)",
      "Allahumma bika amsaynaa — اللَّهُمَّ بِكَ أَمْسَيْنَا … (1×)",
      "Sayyidul Istighfar — اَللَّهُمَّ أَنْتَ رَبِّيْ لاَ إِلَـهَ إِلاَّ أَنْتَ … (1×)",
      "Allahumma 'aafinii — اَللَّهُمَّ عَافِنِيْ فِيْ بَدَنِيْ … (3×)",
      "Bismillaahilladzii — بِسْمِ اللهِ الَّذِي لاَ يَضُرُّ … (3×)",
      "Radhiitu billaahi — رَضِيْتُ بِاللهِ رَبًّا … (3×)",
      "Yaa Hayyu Yaa Qayyuum — يَا حَيُّ يَا قَيُّوْمُ بِرَحْمَتِكَ أَسْتَغِيْثُ … (1×)",
      "Fitrah Islam — أَمْسَيْنَا عَلَى فِطْرَةِ اْلإِسْلاَمِ … (1×)",
      "Tahlil — لاَ إِلَـهَ إِلاَّ اللهُ وَحْدَهُ … (10×)",
      "Perlindungan petang — أَعُوْذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ (3×)",
      "Subhaanallaah wa bihamdih — سُبْحَانَ اللهِ وَبِحَمْدِهِ (100×)",
      "Istighfar — أَسْتَغْفِرُ اللهَ وَأَتُوْبُ إِلَيْهِ (100×)",
    ],
  },
  { ikon:"📅", nama:"Rencana Harian",   tipe:"ceklis", judul:"Rencana Hari Ini",  item:["Sholat 5 waktu","Olahraga pagi","Baca buku 30 menit","Minum air 8 gelas","Review catatan malam"] },
  { ikon:"💊", nama:"Jadwal Obat",      tipe:"ceklis", judul:"Jadwal Minum Obat", item:["Pagi — setelah makan","Siang — setelah makan","Malam — sebelum tidur"] },
  { ikon:"📝", nama:"Catatan Rapat",    tipe:"teks",   judul:"Catatan Rapat",     isi:"Tanggal     :\nPeserta     :\nAgenda      :\n\nHasil       :\n\nTindak lanjut:\n- " },
  { ikon:"🎯", nama:"Target Bulan Ini", tipe:"ceklis", judul:"Target Bulan Ini",  item:["Target 1","Target 2","Target 3","Target 4"] },
  { ikon:"💡", nama:"Ide Bebas",        tipe:"teks",   judul:"Ide —",             isi:"Ide       :\nMengapa   :\nBagaimana :\nLangkah 1 :" },
];

// Tiap tema punya palette lengkap → memilih tema mengubah seluruh "kertas", teks menyesuaikan
const TEMA = [
  { id:"gelap",  nama:"Gelap",  terang:false, aksen:"#28c0b6", bg:"#080808", nav:"#0a0a0a", kartu:"#141414", teks:"#ece8e0", subteks:"#8a8a8a", border:"#1e1e1e", input:"#1a1a1a", muted:"#555555" },
  { id:"arang",  nama:"Arang",  terang:false, aksen:"#f5c842", bg:"#111111", nav:"#161616", kartu:"#1c1c1c", teks:"#ece8e0", subteks:"#8f8f8f", border:"#262626", input:"#202020", muted:"#5a5a5a" },
  { id:"hijau",  nama:"Hutan",  terang:false, aksen:"#34c776", bg:"#061008", nav:"#0a160a", kartu:"#0e1c12", teks:"#e6f0e8", subteks:"#7fa98a", border:"#16281c", input:"#102016", muted:"#4e6b57" },
  { id:"biru",   nama:"Laut",   terang:false, aksen:"#3d9de8", bg:"#060810", nav:"#0a0e18", kartu:"#0e1424", teks:"#e6ecf6", subteks:"#8093b0", border:"#172033", input:"#101a2c", muted:"#4f6182" },
  { id:"coklat", nama:"Kopi",   terang:false, aksen:"#e88530", bg:"#100a04", nav:"#160e06", kartu:"#1d140b", teks:"#f0e6da", subteks:"#b09878", border:"#2c1e10", input:"#221708", muted:"#7a5f42" },
  { id:"terang", nama:"Terang", terang:true,  aksen:"#28c0b6", bg:"#f0ede8", nav:"#ffffff", kartu:"#ffffff", teks:"#1a1a1a", subteks:"#666666", border:"rgba(0,0,0,0.09)", input:"#f5f5f0", muted:"#999999" },
];

const STORAGE_KEY   = "kapurpad_v1";
const SETTINGS_KEY  = "kapurpad_settings";
const FOLDERS_KEY   = "kapurpad_folders";
const AI_ENDPOINT   = "/.netlify/functions/ai-asisten";
const buatId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

const FOLDER_DEFAULT = [
  { id:"kerja",   nama:"Kerja",   ikon:"💼", warna:"#9b59e8" },
  { id:"pribadi", nama:"Pribadi", ikon:"🏠", warna:"#34c776" },
  { id:"ibadah",  nama:"Ibadah",  ikon:"🕌", warna:"#f5c842" },
];

const muatFolder = () => {
  try {
    const d = localStorage.getItem(FOLDERS_KEY);
    if (d) return JSON.parse(d);
  } catch {}
  return [...FOLDER_DEFAULT];
};

const simpanFolder = (f) => { try { localStorage.setItem(FOLDERS_KEY, JSON.stringify(f)); } catch {} };

// Render markdown sederhana ke JSX
const renderMarkdown = (teks) => {
  if (!teks) return null;
  return teks.split("\n").map((b, i) => {
    const inlineFormat = (s) => s.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/).map((p, j) => {
      if (p.startsWith("**") && p.endsWith("**")) return <strong key={j}>{p.slice(2,-2)}</strong>;
      if (p.startsWith("*")  && p.endsWith("*"))  return <em key={j}>{p.slice(1,-1)}</em>;
      return p;
    });
    if (b.startsWith("# "))   return <div key={i} style={{fontSize:"1.35em",fontWeight:900,margin:"8px 0 4px",lineHeight:1.3}}>{inlineFormat(b.slice(2))}</div>;
    if (b.startsWith("## "))  return <div key={i} style={{fontSize:"1.15em",fontWeight:800,margin:"6px 0 2px",lineHeight:1.3}}>{inlineFormat(b.slice(3))}</div>;
    if (b.startsWith("- "))   return <div key={i} style={{paddingLeft:12,margin:"2px 0"}}>• {inlineFormat(b.slice(2))}</div>;
    if (b.startsWith("[ ] ")) return <div key={i} style={{display:"flex",alignItems:"center",gap:6,margin:"2px 0",paddingLeft:12}}>☐ <span>{inlineFormat(b.slice(4))}</span></div>;
    if (b.startsWith("[x] ")) return <div key={i} style={{display:"flex",alignItems:"center",gap:6,margin:"2px 0",paddingLeft:12,textDecoration:"line-through",opacity:.65}}>☑ <span>{inlineFormat(b.slice(4))}</span></div>;
    const rendered = inlineFormat(b);
    return <div key={i} style={{margin:"1px 0"}}>{rendered.length ? rendered : <>&nbsp;</>}</div>;
  });
};

// Ambil teks bersih dari konten editor (yang kini bisa berupa HTML)
const stripHtml = (s) => {
  if (!s) return "";
  if (!s.includes("<")) return s;
  if (typeof document === "undefined") return s.replace(/<[^>]*>/g, " ");
  const d = document.createElement("div");
  d.innerHTML = s;
  return (d.textContent || d.innerText || "").trim();
};

const parseTarget = (teks) => {
  const m = teks.match(/(\d+)\s*[×x]/i);
  return m ? parseInt(m[1]) : null;
};

const NOTIF_DZIKIR_KEY = "kapurpad_notif_dzikir";

const MOTIVASI_DZIKIR = [
  { teks: "Ketahuilah, hanya dengan mengingat Allah hati menjadi tenang.", sumber: "QS. Ar-Ra'd: 28" },
  { teks: "Perumpamaan orang yang berdzikir kepada Rabbnya dan yang tidak, seperti orang hidup dan orang mati.", sumber: "HR. Bukhari no. 6407" },
  { teks: "Barangsiapa membaca 'Subhanallah wabihamdih' 100× sehari, dosa-dosanya dihapus meski sebanyak buih lautan.", sumber: "HR. Bukhari no. 6405" },
  { teks: "Kalimat yang paling dicintai Allah ada empat: Subhanallah, Alhamdulillah, La ilaha illallah, Allahu Akbar.", sumber: "HR. Muslim no. 2137" },
  { teks: "Hendaklah lidahmu senantiasa basah dengan dzikir kepada Allah.", sumber: "HR. Tirmidzi no. 3375" },
  { teks: "Dzikir pagi dan petang adalah perisai seorang mukmin dari gangguan syaitan.", sumber: "Syaikh Ibnu Baz rahimahullah" },
  { teks: "Barangsiapa membaca Ayat Kursi setiap pagi, ia mendapat perlindungan Allah hingga petang.", sumber: "Atsar Ibnu Mas'ud, Silsilah Shahihah" },
];

// ═══════════════════════ DATA DZIKIR ═════════════════════════════════════════

const DZIKIR_PAGI = [
  {
    no:1, nama:"Ayat Kursi",
    arab:"اللّٰهُ لَآ إِلٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ، لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ، لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ، مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ، يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ، وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَآءَ، وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ، وَلَا يَئُودُهُ حِفْظُهُمَا، وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    latin:"Allāhu lā ilāha illā huwal ḥayyul qayyūm, lā ta'khudzuhū sinatuw walā naum, lahū mā fis samāwāti wa mā fil arḍ, man dzal ladzī yasyfa'u 'indahū illā bi idznih, ya'lamu mā baina aidīhim wa mā khalfahum, wa lā yuḥīṭūna bisyai'im min 'ilmihī illā bimā syā', wasi'a kursiyyuhus samāwāti wal arḍ, wa lā ya'ūduhū ḥifẓuhumā, wa huwal 'aliyyul 'aẓīm.",
    terjemah:"Allah, Yang tidak ada ilah yang berhak disembah kecuali Dia, Yang Mahahidup lagi terus-menerus mengurusi makhluk-Nya. Tidak mengantuk dan tidak tidur. Kepunyaan-Nya apa yang di langit dan di bumi. Tidak ada yang dapat memberi syafa'at di sisi Allah tanpa izin-Nya. Allah mengetahui apa-apa yang di hadapan mereka dan di belakang mereka. Mereka tidak mengetahui apa-apa dari ilmu Allah melainkan apa yang dikehendaki-Nya. Kursi Allah meliputi langit dan bumi. Dan Allah tidak merasa berat memelihara keduanya. Dan Allah Maha Tinggi lagi Maha Besar.",
    dibaca:1,
    faedah:"Barangsiapa membaca ayat ini ketika pagi hari, maka ia dilindungi dari gangguan jin hingga sore hari. (HR. Al-Hakim, shahih)"
  },
  {
    no:2, nama:"Surat Al-Ikhlas",
    arab:"قُلْ هُوَ اللّٰهُ أَحَدٌ ۝ اَللّٰهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
    latin:"Qul huwallāhu aḥad. Allāhuṣ ṣamad. Lam yalid walam yūlad. Walam yakul lahū kufuwan aḥad.",
    terjemah:"Katakanlah: Dialah Allah, Yang Maha Esa. Allah adalah ilah yang bergantung kepada-Nya segala sesuatu. Dia tidak beranak dan tiada pula diperanakkan. Dan tidak ada seorang pun yang setara dengan Dia.",
    dibaca:3,
    faedah:"Membaca tiga surat ini (Al-Ikhlas, Al-Falaq, An-Naas) pagi dan sore mencukupi dari segala sesuatu. (HR. Abu Dawud, hasan shahih)"
  },
  {
    no:3, nama:"Surat Al-Falaq",
    arab:"قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
    latin:"Qul a'ūdzu birabbil falaq. Min syarri mā khalaq. Wamin syarri ghāsiqin idzā waqab. Wamin syarrin naffāthāti fil 'uqad. Wamin syarri ḥāsidin idzā ḥasad.",
    terjemah:"Katakanlah: Aku berlindung kepada Rabb yang menguasai waktu Subuh, dari kejahatan makhluk-Nya, dari kejahatan malam apabila telah gelap gulita, dari kejahatan wanita-wanita tukang sihir yang menghembus pada buhul-buhul, dan dari kejahatan orang yang dengki apabila ia dengki.",
    dibaca:3, faedah:""
  },
  {
    no:4, nama:"Surat An-Naas",
    arab:"قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ",
    latin:"Qul a'ūdzu birabbin nās. Malikin nās. Ilāhin nās. Min syarril waswāsil khannās. Alladzī yuwaswisu fī ṣudūrin nās. Minal jinnati wan nās.",
    terjemah:"Katakanlah: Aku berlindung kepada Rabb manusia, Raja manusia, Sembahan manusia, dari kejahatan bisikan syaitan yang biasa bersembunyi, yang membisikkan kejahatan ke dalam dada manusia, dari golongan jin dan manusia.",
    dibaca:3, faedah:""
  },
  {
    no:5, nama:"Doa Pagi",
    arab:"أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلّٰهِ، وَالْحَمْدُ لِلّٰهِ، لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيْكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيْرٌ. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِيْ هٰذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوْذُ بِكَ مِنْ شَرِّ مَا فِيْ هٰذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ",
    latin:"Ashbaḥnā wa ashbaḥal mulku lillāh, walḥamdu lillāh, lā ilāha illallāhu waḥdahū lā syarīka lah, lahul mulku walahul ḥamd, wa huwa 'alā kulli syai'in qadīr. Rabbi as'aluka khayra mā fī hādzal yawm wa khayra mā ba'dah, wa a'ūdzu bika min syarri mā fī hādzal yawm wa syarri mā ba'dah.",
    terjemah:"Kami telah memasuki waktu pagi dan kerajaan hanya milik Allah. Segala puji bagi Allah. Tidak ada ilah yang berhak disembah kecuali Allah semata, tiada sekutu bagi-Nya. Hanya milik-Nya kerajaan dan segala puji hanya bagi-Nya. Ya Rabbku, aku memohon kebaikan hari ini dan kebaikan sesudahnya, dan aku berlindung kepada-Mu dari kejelekan hari ini dan kejelekan sesudahnya.",
    dibaca:1, faedah:""
  },
  {
    no:6, nama:"Doa Berserah Diri",
    arab:"اَللّٰهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوْتُ، وَإِلَيْكَ النُّشُوْرُ",
    latin:"Allāhumma bika aṣbaḥnā, wa bika amsaynā, wa bika naḥyā, wa bika namūtu, wa ilaikan nusyūr.",
    terjemah:"Ya Allah, dengan rahmat dan pertolongan-Mu kami memasuki waktu pagi, dan dengan rahmat dan pertolongan-Mu kami memasuki waktu sore. Dengan rahmat dan pertolongan-Mu kami hidup dan dengan kehendak-Mu kami mati. Dan kepada-Mu kami akan dibangkitkan.",
    dibaca:1, faedah:""
  },
  {
    no:7, nama:"Sayyidul Istighfar",
    arab:"اَللّٰهُمَّ أَنْتَ رَبِّيْ لَا إِلٰهَ إِلَّا أَنْتَ، خَلَقْتَنِيْ وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوْذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوْءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوْءُ بِذَنْبِيْ، فَاغْفِرْ لِيْ، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوْبَ إِلَّا أَنْتَ",
    latin:"Allāhumma anta rabbī lā ilāha illā anta, khalaqtanī wa ana 'abduka, wa ana 'alā 'ahdika wa wa'dika mastatha'tu, a'ūdzu bika min syarri mā ṣana'tu, abū'u laka bini'matika 'alayya wa abū'u bidzambī, faghfir lī, fa innahū lā yaghfirudzdzunūba illā anta.",
    terjemah:"Ya Allah, Engkau adalah Rabbku, tidak ada ilah yang berhak disembah kecuali Engkau. Engkaulah yang menciptakanku. Aku adalah hamba-Mu. Aku akan setia pada perjanjianku pada-Mu semampuku. Aku berlindung kepada-Mu dari kejelekan yang kuperbuat. Aku mengakui nikmat-Mu kepadaku dan aku mengakui dosaku. Oleh karena itu, ampunilah aku. Sesungguhnya tiada yang mengampuni dosa kecuali Engkau.",
    dibaca:1,
    faedah:"Barangsiapa membacanya dengan yakin di waktu pagi lalu meninggal sebelum sore, maka ia termasuk ahli surga. (HR. Al-Bukhari)"
  },
  {
    no:8, nama:"Doa Keselamatan",
    arab:"اَللّٰهُمَّ عَافِنِى فِى بَدَنِى، اَللّٰهُمَّ عَافِنِى فِى سَمْعِى، اَللّٰهُمَّ عَافِنِى فِى بَصَرِى، لَا إِلٰهَ إِلَّا أَنْتَ. اَللّٰهُمَّ إِنِّيْ أَعُوْذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، وَأَعُوْذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لَا إِلٰهَ إِلَّا أَنْتَ",
    latin:"Allāhumma 'āfinī fī badanī, Allāhumma 'āfinī fī sam'ī, Allāhumma 'āfinī fī baṣarī, lā ilāha illā anta. Allāhumma innī a'ūdzu bika minal kufri wal faqr, wa a'ūdzu bika min 'adzābil qabr, lā ilāha illā anta.",
    terjemah:"Ya Allah, selamatkan tubuhku. Ya Allah, selamatkan pendengaranku. Ya Allah, selamatkan penglihatanku. Tiada ilah yang berhak diibadahi kecuali Engkau. Ya Allah, sesungguhnya aku berlindung kepada-Mu dari kekufuran dan kefakiran. Aku berlindung kepada-Mu dari siksa kubur. Tiada ilah kecuali Engkau.",
    dibaca:3, faedah:""
  },
  {
    no:9, nama:"Doa Kecukupan",
    arab:"حَسْبِيَ اللّٰهُ لَا إِلٰهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ، وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
    latin:"Ḥasbiyallāhu lā ilāha illā huw, 'alayhi tawakkaltu, wa huwa rabbul 'arsyil 'aẓīm.",
    terjemah:"Cukuplah Allah bagiku, tiada tuhan yang berhak disembah kecuali Dia. Hanya kepada-Nya aku bertawakal, dan Dialah Rabb yang memiliki Arasy yang besar.",
    dibaca:7,
    faedah:"Barangsiapa membacanya 7× pagi dan sore, Allah akan mencukupkan semua urusannya. (HR. Abu Dawud, hasan)"
  },
  {
    no:10, nama:"Bismillah Perlindungan",
    arab:"بِسْمِ اللّٰهِ الَّذِى لَا يَضُرُّ مَعَ اسْمِهِ شَىْءٌ فِى الأَرْضِ وَلَا فِى السَّمَاءِ، وَهُوَ السَّمِيعُ الْعَلِيمُ",
    latin:"Bismillāhil ladzī lā yaḍurru ma'asmihi syai'un fil arḍi walā fis samā', wa huwas samī'ul 'alīm.",
    terjemah:"Dengan Nama Allah, Yang dengan Nama-Nya tidak ada sesuatu pun yang memudharatkan di bumi maupun di langit. Dia-lah Yang Maha Mendengar lagi Maha Mengetahui.",
    dibaca:3,
    faedah:"Barangsiapa membacanya 3× pagi dan sore, tidak ada sesuatu pun yang membahayakannya. (HR. At-Tirmidzi, shahih)"
  },
  {
    no:11, nama:"Doa Keridhaan",
    arab:"رَضِيْتُ بِاللّٰهِ رَبًّا، وَبِاْلإِسْلَامِ دِيْنًا، وَبِمُحَمَّدٍ صَلَّى اللّٰهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا",
    latin:"Raḍītu billāhi rabbā, wabil islāmi dīnā, wa bi Muḥammadin ṣallallāhu 'alayhi wa sallama nabiyyā.",
    terjemah:"Aku ridha Allah sebagai Rabbku, Islam sebagai agamaku, dan Muhammad ﷺ sebagai Nabiku.",
    dibaca:3,
    faedah:"Barangsiapa membacanya 3× pagi dan sore, Allah memberikan keridhaan-Nya kepadanya pada hari Kiamat. (HR. Ahmad, hasan)"
  },
  {
    no:12, nama:"Ya Hayyu Ya Qayyum",
    arab:"يَا حَيُّ يَا قَيُّوْمُ بِرَحْمَتِكَ أَسْتَغِيْثُ، وَأَصْلِحْ لِيْ شَأْنِيْ كُلَّهُ، وَلَا تَكِلْنِيْ إِلَى نَفْسِيْ طَرْفَةَ عَيْنٍ",
    latin:"Yā ḥayyu yā qayyūmu biraḥmatika astagīts, wa aṣliḥ lī sya'nī kullahu, wa lā takilnī ilā nafsī ṭarfata 'ayn.",
    terjemah:"Wahai Rabb Yang Maha Hidup, wahai Rabb Yang Berdiri Sendiri, dengan rahmat-Mu aku minta pertolongan. Perbaikilah segala urusanku dan jangan serahkan kepadaku walaupun sekejap mata.",
    dibaca:1, faedah:""
  },
  {
    no:13, nama:"Tasbih Tahmid",
    arab:"سُبْحَانَ اللّٰهِ وَبِحَمْدِهِ",
    latin:"Subḥānallāhi wa biḥamdih.",
    terjemah:"Maha suci Allah, aku memuji-Nya.",
    dibaca:100,
    faedah:"Barangsiapa membacanya 100× pagi dan sore, tidak ada yang datang pada hari kiamat dengan yang lebih baik kecuali yang membaca seperti itu atau lebih. (HR. Muslim)"
  },
  {
    no:14, nama:"Tahlil",
    arab:"لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيْكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيْرُ",
    latin:"Lā ilāha illallāhu waḥdahū lā syarīka lah, lahul mulku walahul ḥamd, wa huwa 'alā kulli syai'in qadīr.",
    terjemah:"Tidak ada ilah yang berhak disembah selain Allah semata, tidak ada sekutu bagi-Nya. Hanya milik-Nya kerajaan dan segala puji hanya bagi-Nya. Dia-lah yang berkuasa atas segala sesuatu.",
    dibaca:10,
    faedah:"Barangsiapa membacanya 10× pagi hari, dituliskan baginya 10 kebaikan, dihapus 10 keburukan, dan mendapat perlindungan dari syaitan. (HR. Muslim)"
  },
  {
    no:15, nama:"Istighfar",
    arab:"أَسْتَغْفِرُ اللّٰهَ وَأَتُوْبُ إِلَيْهِ",
    latin:"Astaghfirullāha wa atūbu ilaih.",
    terjemah:"Aku memohon ampun kepada Allah dan bertobat kepada-Nya.",
    dibaca:100,
    faedah:"Nabi ﷺ beristighfar kepada Allah dalam sehari 100 kali. (HR. Muslim)"
  },
  {
    no:16, nama:"Shalawat Nabi",
    arab:"اَللّٰهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ",
    latin:"Allāhumma ṣalli wa sallim 'alā nabiyyinā Muḥammad.",
    terjemah:"Ya Allah, limpahkanlah shalawat dan salam kepada Nabi kami, Muhammad ﷺ.",
    dibaca:10,
    faedah:"Barangsiapa bershalawat kepadaku 10× di pagi hari dan 10× di sore hari, ia mendapatkan syafa'atku pada hari kiamat. (HR. At-Thabrani)"
  },
];

const DZIKIR_PETANG = [
  ...DZIKIR_PAGI.slice(0,4),
  {
    no:5, nama:"Doa Petang",
    arab:"أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلّٰهِ، وَالْحَمْدُ لِلّٰهِ، لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيْكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيْرٌ. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِيْ هٰذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوْذُ بِكَ مِنْ شَرِّ مَا فِيْ هٰذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا",
    latin:"Amsaynā wa amsal mulku lillāh, walḥamdu lillāh, lā ilāha illallāhu waḥdahū lā syarīka lah, lahul mulku walahul ḥamd, wa huwa 'alā kulli syai'in qadīr. Rabbi as'aluka khayra mā fī hādzihil laylati wa khayra mā ba'dahā, wa a'ūdzu bika min syarri mā fī hādzihil laylati wa syarri mā ba'dahā.",
    terjemah:"Kami telah memasuki waktu sore dan kerajaan hanya milik Allah. Segala puji bagi Allah. Tidak ada ilah yang berhak disembah kecuali Allah semata. Ya Rabbku, aku memohon kebaikan malam ini dan kebaikan sesudahnya, dan aku berlindung kepada-Mu dari kejelekan malam ini dan kejelekan sesudahnya.",
    dibaca:1, faedah:""
  },
  {
    no:6, nama:"Doa Berserah Diri (Petang)",
    arab:"اَللّٰهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوْتُ، وَإِلَيْكَ الْمَصِيْرُ",
    latin:"Allāhumma bika amsaynā, wa bika aṣbaḥnā, wa bika naḥyā, wa bika namūtu, wa ilaikal maṣīr.",
    terjemah:"Ya Allah, dengan rahmat dan pertolongan-Mu kami memasuki waktu sore, dan dengan rahmat dan pertolongan-Mu kami memasuki waktu pagi. Dengan rahmat dan pertolongan-Mu kami hidup dan dengan kehendak-Mu kami mati. Dan kepada-Mu tempat kembali.",
    dibaca:1, faedah:""
  },
  ...DZIKIR_PAGI.slice(6,15),
  {
    no:16, nama:"Perlindungan Petang",
    arab:"أَعُوْذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    latin:"A'ūdzu bikalimātillāhit tāmmāti min syarri mā khalaq.",
    terjemah:"Aku berlindung dengan kalimat-kalimat Allah yang sempurna dari kejahatan apa yang Dia ciptakan.",
    dibaca:3,
    faedah:"Barangsiapa membacanya 3× ketika petang, tidak ada racun atau sengatan yang membahayakannya malam itu. (HR. Muslim)"
  },
  DZIKIR_PAGI[15],
];

const formatWaktu = (ts) => {
  if (!ts) return "";
  const d = new Date(ts), now = new Date();
  const bln = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString("id-ID", { hour:"2-digit", minute:"2-digit" });
  if (d.getFullYear() === now.getFullYear())
    return `${d.getDate()} ${bln[d.getMonth()]}`;
  return `${d.getDate()} ${bln[d.getMonth()]} ${d.getFullYear()}`;
};

const formatTanggalLengkap = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);
  const bln = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  const hr  = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
  return `${hr[d.getDay()]}, ${d.getDate()} ${bln[d.getMonth()]} ${d.getFullYear()} — ${d.toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"})}`;
};

// ═══════════════════════ STORAGE ═════════════════════════════════════════════

const muatCatatan = () => {
  try {
    const d = localStorage.getItem(STORAGE_KEY);
    if (d) return JSON.parse(d);
  } catch {}
  // Pengguna baru → kosong (WelcomeScreen yang akan tampil)
  return [];
};

const muatSettings = () => {
  try {
    const d = localStorage.getItem(SETTINGS_KEY);
    if (d) return JSON.parse(d);
  } catch {}
  return { tema:"terang", ukuranFont:15, notifikasi:true, pin:"", namaPengguna:"" };
};

const simpanLokal   = (data) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {} };
const simpanSettings = (s)   => { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch {} };

// ═══════════════════════ PRO STATUS ══════════════════════════════════════════

const PRO_KEY          = "kapurpad_pro";
const PRO_EXPIRY_KEY   = "kapurpad_pro_expiry";
const PRO_LIFETIME_KEY = "kapurpad_pro_lifetime";

const cekStatusPro = () => {
  try {
    if (localStorage.getItem(PRO_LIFETIME_KEY) === "true") return true;
    const pro = localStorage.getItem(PRO_KEY);
    const exp = localStorage.getItem(PRO_EXPIRY_KEY);
    if (!pro || !exp) return false;
    if (Date.now() > parseInt(exp)) return false;
    return true;
  } catch { return false; }
};

// Aktivasi Pro selalu LIFETIME (sekali bayar, tanpa expiry). Owner mode pakai ini juga.
const aktifkanPro = () => {
  localStorage.setItem(PRO_KEY, "true");
  localStorage.setItem(PRO_LIFETIME_KEY, "true");
  localStorage.setItem(PRO_EXPIRY_KEY, String(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000));
};

// URL endpoint backend untuk membuat Snap Token
// Ganti dengan URL server kamu saat production
const PAYMENT_ENDPOINT = "/.netlify/functions/create-payment";

// PRODUCTION. Client key Midtrans boleh publik (dipakai di browser).
const MIDTRANS_SNAP_URL = "https://app.midtrans.com/snap/snap.js";
const MIDTRANS_CLIENT_KEY = "Mid-client-JoLFIEenPjLyyY9P";

// ═══════════════════════ NOTIFIKASI ══════════════════════════════════════════

const mintaIzinNotif = async () => {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  const result = await Notification.requestPermission();
  return result === "granted";
};

const jadwalkanNotifDzikir = () => {
  if (localStorage.getItem(NOTIF_DZIKIR_KEY) !== "true") return;
  const sekarang = new Date();
  const jadwal = (jam, menit, pesan) => {
    const target = new Date();
    target.setHours(jam, menit, 0, 0);
    if (target <= sekarang) target.setDate(target.getDate() + 1);
    const selisih = target - sekarang;
    setTimeout(async () => {
      const izin = await mintaIzinNotif();
      if (izin) new Notification("KapurPad — Pengingat Dzikir", { body: pesan, icon: "/icons/icon-192.png", tag: "dzikir-" + jam });
      jadwalkanNotifDzikir();
    }, selisih);
  };
  jadwal(5, 30, "🌅 Waktunya Dzikir Pagi — mulai harimu dengan dzikir");
  jadwal(15, 30, "🌇 Waktunya Dzikir Petang — sebelum matahari terbenam");
};

const jadwalkanNotif = (judul, waktu, isiPesan) => {
  if (!waktu) return null;
  const selisih = new Date(waktu).getTime() - Date.now();
  if (selisih <= 0) return null;
  const tid = setTimeout(async () => {
    const izin = await mintaIzinNotif();
    if (izin) {
      new Notification(`🔔 KapurPad: ${judul}`, {
        body: isiPesan || "Pengingat catatan kamu",
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-96.png",
        vibrate: [200, 100, 200],
        tag: "kapurpad-reminder",
      });
    }
  }, selisih);
  return tid;
};

// ═══════════════════════ SHARE ═══════════════════════════════════════════════

const bagikanCatatan = async (catatan) => {
  const teks = catatan.tipe === "ceklis"
    ? `📋 ${catatan.judul}\n\n${(catatan.item||[]).map(i=>`${i.cek?"✅":"⬜"} ${i.teks}`).join("\n")}\n\n— Dikirim via KapurPad`
    : `📝 ${catatan.judul}\n\n${stripHtml(catatan.isi)}\n\n— Dikirim via KapurPad`;

  if (navigator.share) {
    try {
      await navigator.share({ title: catatan.judul, text: teks });
      return "dibagikan";
    } catch {}
  }
  // fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(teks);
    return "disalin";
  } catch {
    return "gagal";
  }
};

// ═══════════════════════ GATE PRO ════════════════════════════════════════════

function GatePro({ pesan, onUpgrade, onTutup, t }) {
  const terang = t && t.kartu === "#ffffff";
  return (
    <div style={{position:"fixed",inset:0,background:terang?"#0006":"#000c",zIndex:800,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{background:terang?"#ffffff":"#0f0f0f",border:"1px solid #f5c84244",borderRadius:20,padding:28,maxWidth:340,width:"100%",textAlign:"center",boxShadow:terang?"0 10px 40px #0003":"none"}}>
        <div style={{fontSize:48,marginBottom:12}}>👑</div>
        <div style={{fontSize:20,fontWeight:900,color:terang?"#c79a16":"#f5c842",marginBottom:10}}>Fitur Pro</div>
        <div style={{fontSize:14,color:terang?"#666":"#888",lineHeight:1.7,marginBottom:22}}>{pesan}</div>
        <button onClick={onUpgrade} style={{
          width:"100%",padding:"14px 0",background:"linear-gradient(135deg,#f5c842,#e8a030)",
          border:"none",borderRadius:12,color:"#000",fontWeight:800,fontSize:15,cursor:"pointer",marginBottom:10,
        }}>
          Upgrade Pro — Rp 25.000 sekali bayar
        </button>
        <div style={{fontSize:11,color:"#555",marginBottom:16}}>Pembayaran aman via Midtrans · QRIS, GoPay, Transfer Bank</div>
        <button onClick={onTutup} style={{background:"none",border:"none",color:"#555",cursor:"pointer",fontSize:13}}>
          Nanti saja
        </button>
      </div>
    </div>
  );
}

// Modal sukses pembayaran — Pro aktif selamanya
function NotifSukses({ onTutup, t }) {
  const terang = t && t.kartu === "#ffffff";
  return (
    <div style={{position:"fixed",inset:0,background:terang?"#0006":"#000d",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{background:terang?"#ffffff":"#101010",border:"1px solid #f5c84244",borderRadius:22,padding:"34px 26px",maxWidth:360,width:"100%",textAlign:"center",boxShadow:terang?"0 14px 50px #0003":"0 14px 50px #000a"}}>
        <div style={{fontSize:64,marginBottom:10}}>🎉</div>
        <div style={{fontSize:21,fontWeight:900,color:"#f5c842",marginBottom:10,lineHeight:1.3}}>Selamat! KapurPad Pro Aktif Selamanya</div>
        <div style={{fontSize:14,color:terang?"#666":"#999",lineHeight:1.7,marginBottom:24}}>
          Semua fitur premium terbuka. Terima kasih sudah mendukung KapurPad! 🙏
        </div>
        <button onClick={onTutup} style={{
          width:"100%",padding:"14px 0",background:"linear-gradient(135deg,#f5c842,#e8a030)",
          border:"none",borderRadius:12,color:"#000",fontWeight:800,fontSize:15,cursor:"pointer",
        }}>👑 Mulai Pakai Pro</button>
      </div>
    </div>
  );
}

// Modal penjelasan ramah sebelum minta izin notifikasi
function ModalIzinNotif({ onIzinkan, onNanti }) {
  return (
    <div style={{position:"fixed",inset:0,background:"#000c",zIndex:850,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{background:"#fff",borderRadius:20,padding:26,maxWidth:340,width:"100%",textAlign:"center"}}>
        <div style={{fontSize:44,marginBottom:10}}>🔔</div>
        <div style={{fontSize:18,fontWeight:800,color:"#1a1a1a",marginBottom:10}}>Izinkan KapurPad mengingatkanmu?</div>
        <div style={{fontSize:13,color:"#666",lineHeight:1.7,marginBottom:22}}>
          Kami hanya kirim notifikasi untuk pengingat yang <b>kamu buat sendiri</b>.
          Tidak ada spam, tidak ada iklan.
        </div>
        <button onClick={onIzinkan} style={{
          width:"100%",padding:"13px 0",background:"#28c0b6",border:"none",borderRadius:12,
          color:"#fff",fontWeight:800,fontSize:15,cursor:"pointer",marginBottom:10,
        }}>Izinkan</button>
        <button onClick={onNanti} style={{background:"none",border:"none",color:"#999",cursor:"pointer",fontSize:13}}>
          Nanti saja
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════ KECIL-KECIL ═════════════════════════════════════════

function PilihWarna({ aktif, onChange, isPro, onGatePro }) {
  return (
    <div style={{ display:"flex", gap:8, flexWrap:"wrap", padding:"8px 0" }}>
      {WARNA.map((w, idx) => {
        const terkunci = !isPro && idx >= 3;
        return (
          <div key={w.nama}
            onClick={() => terkunci
              ? onGatePro?.("Warna eksklusif ini tersedia untuk pengguna Pro 🎨")
              : onChange(w)}
            style={{
              width:28, height:28, borderRadius:"50%",
              background: terkunci ? "#2a2a2a" : w.aksen,
              cursor:"pointer",
              border: aktif?.nama===w.nama ? "3px solid #fff" : "3px solid transparent",
              boxShadow: aktif?.nama===w.nama ? `0 0 10px ${w.aksen}` : "none",
              transition:"all .18s", position:"relative",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
            {terkunci && <span style={{fontSize:10,lineHeight:1}}>🔒</span>}
          </div>
        );
      })}
    </div>
  );
}

function BadgeMood({ id, kecil }) {
  const m = MOOD.find(x => x.id===id);
  if (!m) return null;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:3,
      background:m.warna+"22", border:`1px solid ${m.warna}44`,
      borderRadius:20, padding: kecil ? "2px 7px" : "3px 9px",
      fontSize: kecil ? 10 : 11, color:m.warna, fontWeight:600, flexShrink:0,
    }}>
      {m.ikon} {m.label}
    </span>
  );
}

function PilihMood({ aktif, onChange }) {
  return (
    <div style={{ display:"flex", gap:6, flexWrap:"wrap", padding:"8px 0" }}>
      <div onClick={() => onChange(null)} style={{
        padding:"5px 12px", borderRadius:20, cursor:"pointer",
        border:`1px solid ${!aktif?"#aaa":"#2a2a2a"}`,
        background: !aktif?"#222":"transparent",
        color: !aktif?"#eee":"#555", fontSize:12,
      }}>Tidak ada</div>
      {MOOD.map(m => (
        <div key={m.id} onClick={() => onChange(m.id)} style={{
          display:"flex", alignItems:"center", gap:4,
          padding:"5px 11px", borderRadius:20, cursor:"pointer",
          border:`1px solid ${aktif===m.id?m.warna:"#2a2a2a"}`,
          background: aktif===m.id ? m.warna+"22" : "transparent",
          color: aktif===m.id ? m.warna : "#555", fontSize:12, transition:"all .15s",
        }}>{m.ikon} {m.label}</div>
      ))}
    </div>
  );
}

// ═══════════════════════ KARTU CATATAN ═══════════════════════════════════════

function KartuCatatan({ c, onClick, q, tema, t }) {
  const w = c.warna || W0;
  const terang = !!t && t.kartu === "#ffffff";
  // Background kartu pakai kertas lembut sesuai warna catatan (konsisten dgn EditorCatatan)
  const cardBg   = terang ? (w.kertasLight || "#ffffff") : (w.kertasDark || w.bg);
  const cardGaris= terang ? "rgba(0,0,0,0.09)" : (w.garis || "#202020");
  const judulCol = terang ? "#1a1a1a" : "#ece8e0";
  const isiCol   = terang ? "#555555" : "#a8a39a";
  const metaCol  = terang ? "#8a8478" : "#777";
  const barBg    = terang ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)";
  const sorot = (teks) => {
    if (!q||!teks) return teks;
    const i = teks.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return teks;
    return <>{teks.slice(0,i)}<mark style={{background:w.aksen+"66",color:w.aksen,borderRadius:2}}>{teks.slice(i,i+q.length)}</mark>{teks.slice(i+q.length)}</>;
  };
  const progres = c.tipe==="ceklis"&&c.item?.length>0
    ? Math.round(c.item.filter(i=>i.cek).length/c.item.length*100) : null;

  return (
    <div onClick={() => onClick(c)} style={{
      background: cardBg,
      border:`1px solid ${cardGaris}`,
      borderLeft:`4px solid ${w.aksen}`,
      borderRadius:12, padding:"13px 15px", cursor:"pointer",
      transition:"all .15s", position:"relative",
      userSelect:"none", WebkitUserSelect:"none",
    }}>
      <div style={{display:"flex", alignItems:"center", gap:6, marginBottom:5, flexWrap:"wrap"}}>
        {c.mood && <BadgeMood id={c.mood} kecil/>}
        {c.pin   && <span style={{fontSize:11, opacity:.6}}>📌</span>}
        {c.kunci && <span style={{fontSize:11, opacity:.6}}>🔒</span>}
        {c.pengingat && <span style={{fontSize:11, opacity:.6}}>🔔</span>}
      </div>
      <div style={{fontFamily:"Georgia,serif", fontWeight:700, fontSize:15, color:judulCol, marginBottom:4, lineHeight:1.4}}>
        {sorot(c.judul)}
      </div>
      {c.tipe==="ceklis" && c.item?.length > 0 ? (
        <>
          <div style={{fontSize:12, color:isiCol, marginBottom:5}}>
            {c.item.filter(i=>i.cek).length}/{c.item.length} selesai
          </div>
          <div style={{height:3, background:barBg, borderRadius:3, overflow:"hidden"}}>
            <div style={{height:"100%", width:`${progres}%`, background:w.aksen, borderRadius:3, transition:"width .4s"}}/>
          </div>
        </>
      ) : c.isi ? (
        <div style={{fontSize:13, color:isiCol, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden"}}>
          {sorot(stripHtml(c.isi))}
        </div>
      ) : null}
      <div style={{fontSize:11, color:metaCol, marginTop:6}}>{formatWaktu(c.diubah)}</div>
    </div>
  );
}

// ═══════════════════════ DASHBOARD ═══════════════════════════════════════════

function DashboardHarian({ catatan, t }) {
  const terang = !!t && t.kartu === "#ffffff";
  const hari = new Date().toDateString();
  const aktif   = catatan.filter(n => !n.arsip && !n.hapus);
  const hariIni = aktif.filter(n => new Date(n.diubah).toDateString()===hari);
  const ceklisAll = aktif.filter(n => n.tipe==="ceklis");
  const totalItem = ceklisAll.flatMap(n => n.item||[]).length;
  const sudahCek  = ceklisAll.flatMap(n => n.item||[]).filter(i => i.cek).length;
  const persen    = totalItem>0 ? Math.round(sudahCek/totalItem*100) : 0;
  const byMood = {};
  aktif.filter(n=>n.mood).forEach(n => { byMood[n.mood]=(byMood[n.mood]||0)+1; });
  const topMood = Object.entries(byMood).sort((a,b)=>b[1]-a[1]).slice(0,4);

  return (
    <div style={{margin:"12px 16px 4px", background:terang?"#ffffff":"linear-gradient(135deg,#151200,#0a0a0a)", border:`1px solid ${terang?"rgba(0,0,0,0.09)":"#2a2200"}`, borderRadius:14, padding:16, position:"relative", overflow:"hidden"}}>
      <div style={{position:"absolute", top:-24, right:-24, width:90, height:90, borderRadius:"50%", background:"#f5c84208"}}/>
      <div style={{fontSize:11, color:"#555", fontWeight:700, letterSpacing:1, marginBottom:10}}>HARI INI · {new Date().toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long"})}</div>
      <div style={{display:"flex", gap:12, marginBottom:14}}>
        <div style={{textAlign:"center", minWidth:52}}>
          <div style={{fontSize:30, fontWeight:900, color:"#f5c842", lineHeight:1}}>{hariIni.length}</div>
          <div style={{fontSize:10, color:"#555", marginTop:2}}>diubah</div>
        </div>
        <div style={{width:1, background:terang?"#e0ddd6":"#222"}}/>
        <div style={{flex:1}}>
          <div style={{display:"flex", justifyContent:"space-between", marginBottom:4}}>
            <span style={{fontSize:11, color:"#666"}}>Progress ceklis hari ini</span>
            <span style={{fontSize:11, color:"#f5c842", fontWeight:700}}>{persen}%</span>
          </div>
          <div style={{height:6, background:terang?"#eceae4":"#1a1a1a", borderRadius:6, overflow:"hidden"}}>
            <div style={{height:"100%", width:`${persen}%`, background:"linear-gradient(90deg,#f5c842,#34c776)", borderRadius:6, transition:"width .6s"}}/>
          </div>
          <div style={{fontSize:10, color:"#444", marginTop:3}}>{sudahCek} dari {totalItem} item selesai</div>
        </div>
      </div>
      {topMood.length > 0 && (
        <div style={{display:"flex", gap:6, flexWrap:"wrap"}}>
          {topMood.map(([id,n]) => {
            const m = MOOD.find(x=>x.id===id);
            return m ? (
              <span key={id} style={{background:m.warna+"18", border:`1px solid ${m.warna}33`, borderRadius:20, padding:"3px 9px", fontSize:10, color:m.warna}}>
                {m.ikon} {m.label} ×{n}
              </span>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════ FILTER BAR ══════════════════════════════════════════

function FilterBar({ aktif, onChange, t }) {
  const inact = t ? t.subteks : "#555";
  const inactBorder = t ? t.border : "#202020";
  const opsi = [
    {id:"semua",       label:"Semua",    ikon:"📋"},
    ...MOOD.map(m => ({id:"mood_"+m.id, label:m.label, ikon:m.ikon})),
    {id:"tipe_ceklis", label:"Ceklis",   ikon:"☑️"},
    {id:"pin",         label:"Dipinned", ikon:"📌"},
  ];
  return (
    <div style={{display:"flex", gap:6, overflowX:"auto", padding:"8px 16px", scrollbarWidth:"none", WebkitOverflowScrolling:"touch"}}>
      {opsi.map(o => (
        <button key={o.id} onClick={() => onChange(o.id)} style={{
          flexShrink:0, padding:"5px 12px", borderRadius:20, cursor:"pointer", fontSize:12,
          border:`1px solid ${aktif===o.id?"#f5c842":inactBorder}`,
          background: aktif===o.id ? "#f5c84222" : "transparent",
          color: aktif===o.id ? "#f5c842" : inact,
          transition:"all .15s", whiteSpace:"nowrap",
        }}>{o.ikon} {o.label}</button>
      ))}
    </div>
  );
}

// ═══════════════════════ MODAL TEMPLATE ══════════════════════════════════════

const TEMPLATE_GRATIS = ["Dzikir Pagi","Dzikir Petang","Daftar Belanja","Rencana Harian"];

function ModalTemplate({ onPilih, onTutup, isPro, onGatePro }) {
  return (
    <div style={{position:"fixed", inset:0, background:"#000d", zIndex:400, display:"flex", alignItems:"flex-end", justifyContent:"center"}} onClick={onTutup}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#111", borderRadius:"20px 20px 0 0", width:"100%", maxWidth:480, maxHeight:"80vh", overflowY:"auto", padding:20}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16}}>
          <div style={{fontSize:16, fontWeight:800, color:"#ece8e0"}}>⚡ Template Cepat</div>
          <button onClick={onTutup} style={{background:"#1e1e1e", border:"none", borderRadius:"50%", width:32, height:32, color:"#888", cursor:"pointer", fontSize:18}}>×</button>
        </div>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
          {TEMPLATE.map(t => {
            const terkunci = !isPro && !TEMPLATE_GRATIS.includes(t.nama);
            return (
              <button key={t.nama}
                onClick={() => terkunci
                  ? onGatePro?.("Template ini tersedia untuk pengguna Pro 👑")
                  : onPilih(t)}
                style={{
                  background: terkunci ? "#131313" : "#181818",
                  border:`1px solid ${terkunci?"#1e1e1e":"#242424"}`,
                  borderRadius:12, padding:"14px 12px", textAlign:"left",
                  cursor:"pointer", color:"#ddd", position:"relative",
                }}>
                {terkunci && (
                  <div style={{position:"absolute",top:6,right:6,fontSize:12,background:"#f5c84222",
                    border:"1px solid #f5c84244",borderRadius:8,padding:"1px 5px",color:"#f5c842"}}>👑</div>
                )}
                <div style={{fontSize:22, marginBottom:6, opacity:terkunci?0.4:1}}>{t.ikon}</div>
                <div style={{fontSize:13, fontWeight:700, color:terkunci?"#444":"#ece8e0"}}>{t.nama}</div>
                <div style={{fontSize:10, color:"#555", marginTop:3}}>
                  {terkunci ? "Pro" : t.tipe==="ceklis"?`${t.item.length} item`:"Teks"}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════ MODAL PIN ════════════════════════════════════════════

function ModalPin({ mode, pinSimpan, onSukses, onBatal }) {
  const [input, setInput] = useState("");
  const [konfirm, setKonfirm] = useState("");
  const [langkah, setLangkah] = useState(1); // 1=masukkan, 2=konfirmasi
  const [salah, setSalah] = useState(false);

  const tombol = [1,2,3,4,5,6,7,8,9,"",0,"⌫"];

  const tekan = (val) => {
    if (val==="") return;
    if (val==="⌫") {
      if (langkah===2) setKonfirm(p=>p.slice(0,-1));
      else setInput(p=>p.slice(0,-1));
      setSalah(false);
      return;
    }
    if (mode==="buat") {
      if (langkah===1) {
        const baru = input+val;
        setInput(baru);
        if (baru.length===4) setLangkah(2);
      } else {
        const baru = konfirm+val;
        setKonfirm(baru);
        if (baru.length===4) {
          if (baru===input) { onSukses(baru); }
          else { setSalah(true); setKonfirm(""); setInput(""); setLangkah(1); }
        }
      }
    } else {
      const baru = input+val;
      setInput(baru);
      if (baru.length===4) {
        if (baru===pinSimpan) onSukses();
        else { setSalah(true); setInput(""); }
      }
    }
  };

  const dots = (panjang, terisi) =>
    Array.from({length:panjang}).map((_,i) => (
      <div key={i} style={{width:14, height:14, borderRadius:"50%", background:i<terisi?"#f5c842":"#2a2a2a", transition:"background .1s"}}/>
    ));

  return (
    <div style={{position:"fixed", inset:0, background:"#000e", zIndex:600, display:"flex", alignItems:"center", justifyContent:"center"}}>
      <div style={{background:"#111", borderRadius:20, padding:28, width:300, textAlign:"center"}}>
        <div style={{fontSize:30, marginBottom:8}}>🔒</div>
        <div style={{color:"#ece8e0", fontWeight:700, fontSize:16, marginBottom:4}}>
          {mode==="buat" ? (langkah===1?"Buat PIN baru":"Ulangi PIN") : "Masukkan PIN"}
        </div>
        {salah && <div style={{color:"#e84040", fontSize:12, marginBottom:8}}>PIN salah, coba lagi</div>}
        <div style={{display:"flex", justifyContent:"center", gap:12, margin:"16px 0"}}>
          {dots(4, langkah===2 ? konfirm.length : input.length)}
        </div>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:16}}>
          {tombol.map((t,i) => (
            <button key={i} onClick={() => t!==""&&tekan(String(t))} style={{
              height:52, borderRadius:12, border:"1px solid #2a2a2a",
              background:t===""?"transparent":"#1a1a1a",
              color:t==="⌫"?"#e84040":"#ece8e0", fontSize:t==="⌫"?18:20,
              fontWeight:600, cursor:t===""?"default":"pointer",
            }}>{t}</button>
          ))}
        </div>
        <button onClick={onBatal} style={{background:"none", border:"none", color:"#555", cursor:"pointer", fontSize:13}}>Batal</button>
      </div>
    </div>
  );
}

// ═══════════════════════ PENGATURAN ══════════════════════════════════════════

function HalamanPengaturan({ settings, onUbah, onTutup, catatan, isPro, onGatePro, onAktivasiSukses, tampilNotif, t }) {
  const terang = t && t.kartu === "#ffffff";
  const cBg = terang ? "#f0ede8" : "#080808";
  const cBorder = terang ? "#e4e0d8" : "#141414";
  const cTeks = terang ? "#1a1a1a" : "#ece8e0";
  const cInputBg = terang ? "#f5f2ec" : "#1a1a1a";
  const cInputBr = terang ? "#e0ddd6" : "#2a2a2a";
  const cInputTx = terang ? "#333" : "#ddd";
  const cItemBg = terang ? "#f7f5f0" : "#111";
  const cItemBr = terang ? "#e4e0d8" : "#222";
  const [konfirmHapus, setKonfirmHapus] = useState(false);
  const [pinMode, setPinMode] = useState(null); // "buat" | "hapus"
  const [notifStatus, setNotifStatus] = useState(Notification?.permission||"default");
  const [kodeInput, setKodeInput] = useState("");
  const [kodeLoading, setKodeLoading] = useState(false);

  // Validasi kode aktivasi di backend (kode rahasia tidak ada di frontend)
  const cekKode = async () => {
    const kode = kodeInput.trim();
    if (!kode || kodeLoading) return;
    setKodeLoading(true);
    try {
      const res = await fetch("/.netlify/functions/aktivasi-kode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kode }),
      });
      const data = await res.json();
      if (data.valid) {
        onAktivasiSukses?.();
        setKodeInput("");
        tampilNotif?.("🔓 Kode berhasil! KapurPad Pro aktif selamanya");
      } else {
        tampilNotif?.("❌ Kode tidak valid");
      }
    } catch {
      tampilNotif?.("❌ Gagal cek kode, coba lagi");
    }
    setKodeLoading(false);
  };

  const mintaNotif = async () => {
    const ok = await mintaIzinNotif();
    setNotifStatus(ok?"granted":"denied");
    onUbah({...settings, notifikasi:ok});
  };

  const eksporCatatan = () => {
    if (!isPro) { onGatePro?.("Ekspor data tersedia untuk pengguna Pro 📤"); return; }
    const data = JSON.stringify(catatan, null, 2);
    const blob = new Blob([data], {type:"application/json"});
    const url  = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `kapurpad_backup_${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const imporCatatan = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (Array.isArray(data)) {
          simpanLokal(data);
          window.location.reload();
        }
      } catch { alert("File tidak valid"); }
    };
    r.readAsText(f);
  };

  return (
    <div style={{position:"fixed", top:0, bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:480, background:cBg, zIndex:200, overflowY:"auto", boxShadow:"0 0 0 100vmax rgba(0,0,0,0.55)"}}>
      {pinMode && (
        <ModalPin
          mode={pinMode}
          pinSimpan={settings.pin}
          onSukses={(pin) => { onUbah({...settings, pin: pin||""}); setPinMode(null); }}
          onBatal={() => setPinMode(null)}
        />
      )}
      <div style={{display:"flex", alignItems:"center", padding:"14px 16px", borderBottom:`1px solid ${cBorder}`, position:"sticky", top:0, background:cBg, zIndex:10}}>
        <button onClick={onTutup} style={{background:"none", border:"none", color:"#f5c842", fontSize:22, cursor:"pointer", marginRight:12}}>←</button>
        <span style={{fontSize:18, fontWeight:800, color:cTeks}}>⚙️ Pengaturan</span>
      </div>

      <div style={{padding:16, display:"flex", flexDirection:"column", gap:14}}>

        {/* Profil */}
        <Seksi judul="PROFIL" terang={terang}>
          <div style={{padding:"12px 0"}}>
            <label style={{fontSize:12, color:terang?"#888":"#666", display:"block", marginBottom:6}}>Nama Pengguna</label>
            <input value={settings.namaPengguna||""} onChange={e=>onUbah({...settings,namaPengguna:e.target.value})}
              placeholder="Masukkan nama kamu…"
              style={{width:"100%", background:cInputBg, border:`1px solid ${cInputBr}`, borderRadius:8, padding:"10px 12px", color:cInputTx, fontSize:14, outline:"none"}}/>
          </div>
        </Seksi>

        {/* Tema */}
        <Seksi judul="TEMA WARNA" terang={terang}>
          <div style={{display:"flex", gap:10, flexWrap:"wrap", padding:"10px 0"}}>
            {TEMA.map(t => {
              const terkunci = !isPro && t.id !== "gelap";
              return (
                <button key={t.id}
                  onClick={() => terkunci
                    ? onGatePro?.("Tema premium tersedia untuk pengguna Pro 🎨")
                    : onUbah({...settings,tema:t.id})}
                  style={{
                    padding:"8px 16px", borderRadius:20, cursor:"pointer", fontSize:13,
                    border:`2px solid ${settings.tema===t.id?"#f5c842":terkunci?"#1a1a1a":"#222"}`,
                    background: settings.tema===t.id?"#f5c84222":terkunci?"#0d0d0d":t.bg,
                    color: settings.tema===t.id?"#f5c842":terkunci?"#333":"#888",
                    display:"flex", alignItems:"center", gap:6, position:"relative",
                  }}>
                  {terkunci
                    ? <span style={{fontSize:10}}>🔒</span>
                    : <div style={{width:10,height:10,borderRadius:"50%",background:t.aksen}}/>}
                  {t.nama}
                  {terkunci && <span style={{fontSize:9,color:"#f5c84288"}}>Pro</span>}
                </button>
              );
            })}
          </div>
        </Seksi>

        {/* Font */}
        <Seksi judul="UKURAN TEKS" terang={terang}>
          <div style={{padding:"10px 0", display:"flex", alignItems:"center", gap:12}}>
            <button onClick={()=>onUbah({...settings,ukuranFont:Math.max(12,settings.ukuranFont-1)})}
              style={{width:36,height:36,borderRadius:8,border:`1px solid ${cInputBr}`,background:cInputBg,color:cInputTx,fontSize:18,cursor:"pointer"}}>−</button>
            <span style={{color:"#f5c842",fontWeight:700,fontSize:18,minWidth:30,textAlign:"center"}}>{settings.ukuranFont}</span>
            <button onClick={()=>onUbah({...settings,ukuranFont:Math.min(20,settings.ukuranFont+1)})}
              style={{width:36,height:36,borderRadius:8,border:`1px solid ${cInputBr}`,background:cInputBg,color:cInputTx,fontSize:18,cursor:"pointer"}}>+</button>
            <span style={{fontSize:settings.ukuranFont,color:terang?"#888":"#666"}}>Contoh teks catatan</span>
          </div>
        </Seksi>

        {/* Notifikasi */}
        <Seksi judul="NOTIFIKASI & PENGINGAT" terang={terang}>
          <div style={{padding:"12px 0", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
            <div>
              <div style={{color:cTeks,fontSize:14}}>Izin Notifikasi</div>
              <div style={{color:"#555",fontSize:11,marginTop:2}}>{notifStatus==="granted"?"✅ Aktif":notifStatus==="denied"?"❌ Diblokir":"Belum diatur"}</div>
            </div>
            {notifStatus!=="granted" && (
              <button onClick={mintaNotif} style={{background:"#f5c84222",border:"1px solid #f5c84244",borderRadius:8,padding:"8px 14px",color:"#f5c842",cursor:"pointer",fontSize:13}}>
                Aktifkan
              </button>
            )}
          </div>
        </Seksi>

        {/* Keamanan */}
        <Seksi judul="KEAMANAN" terang={terang}>
          <div style={{padding:"10px 0", display:"flex", flexDirection:"column", gap:10}}>
            <div style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
              <div>
                <div style={{color:cTeks,fontSize:14}}>PIN Aplikasi</div>
                <div style={{color:"#555",fontSize:11,marginTop:2}}>{settings.pin?"✅ PIN aktif":"Belum diatur"}</div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button
                  onClick={()=> !isPro
                    ? onGatePro?.("Fitur PIN Keamanan tersedia untuk pengguna Pro 🔒")
                    : setPinMode("buat")}
                  style={{background:cInputBg,border:`1px solid ${cInputBr}`,borderRadius:8,padding:"8px 12px",color:cInputTx,cursor:"pointer",fontSize:12}}>
                  {!isPro ? "🔒 Pro" : settings.pin?"Ganti":"Buat"} PIN
                </button>
                {settings.pin&&<button onClick={()=>onUbah({...settings,pin:""})} style={{background:"#1a0000",border:"1px solid #6e1010",borderRadius:8,padding:"8px 12px",color:"#e84040",cursor:"pointer",fontSize:12}}>Hapus</button>}
              </div>
            </div>
          </div>
        </Seksi>

        {/* Data */}
        <Seksi judul="DATA & BACKUP" terang={terang}>
          <div style={{display:"flex", flexDirection:"column", gap:10, padding:"10px 0"}}>
            <button onClick={eksporCatatan} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:cItemBg,border:`1px solid ${cItemBr}`,borderRadius:10,color:cInputTx,cursor:"pointer",fontSize:14}}>
              📤 Ekspor Catatan (JSON)
            </button>
            <label style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:cItemBg,border:`1px solid ${cItemBr}`,borderRadius:10,color:cInputTx,cursor:"pointer",fontSize:14}}>
              📥 Impor Catatan (JSON)
              <input type="file" accept=".json" onChange={imporCatatan} style={{display:"none"}}/>
            </label>
            {!konfirmHapus ? (
              <button onClick={()=>setKonfirmHapus(true)} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:"#1a0000",border:"1px solid #6e1010",borderRadius:10,color:"#e84040",cursor:"pointer",fontSize:14}}>
                🗑️ Hapus Semua Data
              </button>
            ) : (
              <div style={{background:"#1a0000",border:"1px solid #6e1010",borderRadius:10,padding:14}}>
                <div style={{color:"#e84040",fontSize:13,marginBottom:10}}>Yakin? Semua catatan akan dihapus permanen!</div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>{localStorage.clear();window.location.reload();}} style={{flex:1,padding:10,background:"#e84040",border:"none",borderRadius:8,color:"#fff",cursor:"pointer",fontWeight:700}}>Ya, Hapus</button>
                  <button onClick={()=>setKonfirmHapus(false)} style={{flex:1,padding:10,background:cItemBg,border:`1px solid ${cItemBr}`,borderRadius:8,color:cInputTx,cursor:"pointer"}}>Batal</button>
                </div>
              </div>
            )}
          </div>
        </Seksi>

        {/* Kode Aktivasi */}
        {!isPro && (
          <Seksi judul="KODE AKTIVASI" terang={terang}>
            <div style={{padding:"10px 0", display:"flex", flexDirection:"column", gap:8}}>
              <div style={{color:terang?"#888":"#666", fontSize:12}}>Punya kode aktivasi?</div>
              <div style={{display:"flex", gap:8}}>
                <input value={kodeInput} onChange={e=>setKodeInput(e.target.value)}
                  onKeyDown={e=>{ if(e.key==="Enter") cekKode(); }}
                  placeholder="Masukkan kode…"
                  style={{flex:1, background:cInputBg, border:`1px solid ${cInputBr}`, borderRadius:8, padding:"10px 12px", color:cInputTx, fontSize:14, outline:"none"}}/>
                <button onClick={cekKode} disabled={!kodeInput.trim()||kodeLoading}
                  style={{padding:"10px 16px", background:(!kodeInput.trim()||kodeLoading)?(terang?"#e6dcae":"#5a4800"):"#f5c842", border:"none", borderRadius:8, color:"#000", fontWeight:700, fontSize:13, cursor:(!kodeInput.trim()||kodeLoading)?"not-allowed":"pointer", whiteSpace:"nowrap"}}>
                  {kodeLoading ? "…" : "Aktifkan"}
                </button>
              </div>
            </div>
          </Seksi>
        )}

        {/* Tentang */}
        <Seksi judul="TENTANG" terang={terang}>
          <div style={{padding:"10px 0", color:"#555", fontSize:13, lineHeight:1.8}}>
            <div>📱 <strong style={{color:terang?"#666":"#888"}}>KapurPad</strong> versi 1.0.0</div>
            <div>📦 Catatan tersimpan: {catatan.filter(n=>!n.hapus).length}</div>
            <div>💾 Data tersimpan lokal di perangkat kamu</div>
            <div style={{marginTop:8,fontSize:11}}>© 2026 KapurPad · Semua hak dilindungi</div>
          </div>
        </Seksi>

      </div>
    </div>
  );
}

function Seksi({ judul, children, terang }) {
  return (
    <div style={{background:terang?"#ffffff":"#111", border:terang?"1px solid #e8e3da":"none", borderRadius:14, overflow:"hidden"}}>
      <div style={{padding:"10px 16px 0", fontSize:11, color:terang?"#999":"#3a3a3a", fontWeight:700, letterSpacing:1}}>{judul}</div>
      <div style={{padding:"0 16px 12px"}}>{children}</div>
    </div>
  );
}

// ═══════════════════════ MODAL PREMIUM ═══════════════════════════════════════

function ModalPremium({ onTutup, onSukses, tampilNotif, t }) {
  const terang = t && t.kartu === "#ffffff";
  const cSheet = terang ? "#ffffff" : "#0f0f0f";
  const cJudul = terang ? "#1a1a1a" : "#ece8e0";
  const cSub   = terang ? "#888" : "#555";
  const cFiturJudul = terang ? "#333" : "#ddd";
  const cFiturDesc  = terang ? "#888" : "#444";
  const cIkonBg = terang ? "#f3f0ea" : "#1a1a1a";
  const cInfoBg = terang ? "#f7f5f0" : "#0a0a0a";
  const cXBg = terang ? "#efece6" : "#1e1e1e";
  const cInputBg = terang ? "#f5f2ec" : "#1a1a1a";
  const cInputBr = terang ? "#e0ddd6" : "#2a2a2a";
  const cInputTx = terang ? "#222" : "#eee";
  const [loading, setLoading] = useState(false);
  const [pesanError, setPesanError] = useState("");
  const [nama, setNama]   = useState("");
  const [email, setEmail] = useState(() => { try { return localStorage.getItem("kapurpad_email") || ""; } catch { return ""; } });
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const bolehBayar = nama.trim().length >= 2 && emailValid;

  const fitur = [
    {ikon:"📁",judul:"Folder & Kategori",      desc:"Kelompokkan catatan dalam folder berwarna — Kerja, Pribadi, Ibadah."},
    {ikon:"✏️",judul:"Format Teks (Markdown)", desc:"Tebal, miring, heading, bullet list, dan checklist langsung di editor."},
    {ikon:"✨",judul:"Asisten AI Nulis",        desc:"Rapikan tulisan atau buat catatan dari perintah bebas pakai AI."},
    {ikon:"💬",judul:"Tanya Catatanmu (AI)",   desc:"Tanya apa saja tentang catatanmu — AI jawab berdasarkan data kamu."},
    {ikon:"📊",judul:"Laporan Mingguan",        desc:"Bar chart 7 hari, streak, total ceklis selesai, dan top mood minggu ini."},
    {ikon:"🔔",judul:"Pengingat Berulang",      desc:"Atur pengingat Sekali, Harian, Mingguan, atau Bulanan."},
    {ikon:"🎨",judul:"Tema Premium",            desc:"Tema Hutan, Laut, Kopi, dan Terang — pilih suasana favoritmu."},
  ];

  // Muat Midtrans Snap script — cleanup saat modal tutup
  useEffect(() => {
    const existing = document.getElementById("midtrans-snap");
    if (existing) return;
    const script = document.createElement("script");
    script.id = "midtrans-snap";
    script.src = MIDTRANS_SNAP_URL;
    script.setAttribute("data-client-key", MIDTRANS_CLIENT_KEY);
    script.async = true;
    document.body.appendChild(script);
    return () => {
      const el = document.getElementById("midtrans-snap");
      if (el) document.body.removeChild(el);
    };
  }, []);

  const handleBayar = async () => {
    if (!bolehBayar) return;
    setPesanError("");
    setLoading(true);
    try { localStorage.setItem("kapurpad_email", email.trim()); } catch {}
    try {
      const orderId = `KAPURPAD-LIFE-${Date.now()}`;

      // Minta snap token dari backend (amount ditentukan server, bukan frontend)
      const res = await fetch(PAYMENT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "lifetime", order_id: orderId, nama: nama.trim(), email: email.trim() }),
      });
      if (!res.ok) throw new Error("Gagal menghubungi server pembayaran.");
      const { token } = await res.json();

      // Simpan order yang sedang diproses → dipulihkan saat app dibuka lagi
      try { localStorage.setItem("kapurpad_pending_order", orderId); } catch {}

      window.snap.pay(token, {
        onSuccess: function () {
          try { localStorage.removeItem("kapurpad_pending_order"); } catch {}
          onSukses();
        },
        onPending: function () {
          onTutup();
          tampilNotif?.("⏳ Pembayaran diproses. Pro aktif otomatis setelah dikonfirmasi.");
        },
        onError: function () {
          setLoading(false);
          tampilNotif?.("❌ Pembayaran gagal. Coba lagi.");
        },
        onClose: function () {
          setLoading(false);
          tampilNotif?.("Pembayaran dibatalkan.");
        },
      });
    } catch (err) {
      setPesanError(err.message || "Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  };

  const infoTagih = "Pembayaran aman via Midtrans · QRIS, GoPay, Transfer Bank";

  return (
    <div style={{position:"fixed",inset:0,background:terang?"#0007":"#000e",zIndex:500,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onTutup}>
      <div onClick={e=>e.stopPropagation()} style={{background:cSheet,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:480,maxHeight:"88vh",overflowY:"auto",padding:24,boxShadow:terang?"0 -8px 40px #0002":"none"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:22}}>👑</span>
              <span style={{fontSize:22,fontWeight:900,letterSpacing:-0.5}}>
                <span style={{color:"#f5c842"}}>KapurPad</span><span style={{color:cJudul}}> Pro</span>
              </span>
            </div>
            <div style={{fontSize:13,color:cSub,marginTop:2}}>Buka semua fitur tanpa batas</div>
          </div>
          <button onClick={onTutup} style={{background:cXBg,border:"none",borderRadius:"50%",width:32,height:32,color:"#888",cursor:"pointer",fontSize:18}}>×</button>
        </div>
        <div style={{border:"2px solid #f5c842",borderRadius:14,padding:"18px 16px",background:terang?"#fff9e6":"#191300",textAlign:"center",marginBottom:16,position:"relative"}}>
          <div style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",background:"#f5c842",color:"#000",fontSize:10,fontWeight:800,padding:"2px 10px",borderRadius:10,whiteSpace:"nowrap"}}>BAYAR SEKALI</div>
          <div style={{color:terang?"#c79a16":"#f5c842",fontWeight:900,fontSize:32,letterSpacing:-1}}>Sekali Bayar — Rp 25.000</div>
          <div style={{color:terang?"#a98f3a":"#998",fontSize:13,marginTop:2}}>Akses Pro selamanya, tanpa langganan</div>
        </div>
        {/* Data pembeli (untuk struk) */}
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:12}}>
          <input value={nama} onChange={e=>setNama(e.target.value)} placeholder="Nama lengkap"
            style={{width:"100%",boxSizing:"border-box",background:cInputBg,border:`1px solid ${cInputBr}`,borderRadius:10,padding:"11px 13px",color:cInputTx,fontSize:14,outline:"none"}}/>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="Email (untuk struk)"
            style={{width:"100%",boxSizing:"border-box",background:cInputBg,border:`1px solid ${email && !emailValid ? "#e8704a" : cInputBr}`,borderRadius:10,padding:"11px 13px",color:cInputTx,fontSize:14,outline:"none"}}/>
        </div>
        <button onClick={handleBayar} disabled={loading || !bolehBayar}
          style={{width:"100%",padding:14,background:(loading||!bolehBayar)?(terang?"#e6dcae":"#5a4800"):"linear-gradient(135deg,#f5c842,#e8a030)",border:"none",borderRadius:12,color:"#000",fontWeight:800,fontSize:16,cursor:(loading||!bolehBayar)?"not-allowed":"pointer",marginBottom:8,opacity:(loading||!bolehBayar)?0.7:1,transition:"all .2s"}}>
          {loading ? "Memproses…" : bolehBayar ? "Beli Pro Sekarang — Rp 25.000" : "Isi nama & email dulu"}
        </button>
        {pesanError && (
          <div style={{textAlign:"center",fontSize:12,color:"#e84040",marginBottom:8,padding:"6px 12px",background:"#1a0000",borderRadius:8,border:"1px solid #3a0000"}}>
            {pesanError}
          </div>
        )}
        <div style={{textAlign:"center",fontSize:11,color:cSub,marginBottom:22}}>{infoTagih}</div>
        <div style={{fontSize:12,color:cFiturDesc,fontWeight:700,marginBottom:12,letterSpacing:1}}>FITUR UNGGULAN</div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {fitur.map(f=>(
            <div key={f.judul} style={{display:"flex",gap:14,alignItems:"flex-start"}}>
              <div style={{width:38,height:38,borderRadius:10,background:cIkonBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{f.ikon}</div>
              <div>
                <div style={{color:cFiturJudul,fontWeight:700,fontSize:14}}>{f.judul}</div>
                <div style={{color:cFiturDesc,fontSize:12,marginTop:2}}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{margin:"22px 0 8px",padding:14,background:cInfoBg,borderRadius:10,fontSize:11,color:cSub,lineHeight:1.7,textAlign:"center"}}>
          Catatan kamu tidak pernah digunakan untuk melatih model AI apapun.<br/>
          Kebijakan Privasi · Syarat Layanan
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════ KALENDER ════════════════════════════════════════════

// Tanggal acuan catatan di kalender: tanggalTarget kalau ada, jika tidak pakai diubah
const tanggalKalender = (n) => new Date(n.tanggalTarget || n.diubah);

function TampilKalender({ catatan, onBukaCatatan, onTambahDiTanggal, onSetPengingatTanggal, t, tema }) {
  const T = t || { teks:"#ece8e0", subteks:"#888", bg:"#080808", nav:"#0a0a0a", kartu:"#111", border:"#1c1c1c", input:"#1a1a1a", muted:"#444" };
  const aksen = (tema && tema.aksen) || "#28c0b6";
  const [tgl,setTgl] = useState(new Date());
  const [hariDipilih,setHariDipilih] = useState(null);
  const th=tgl.getFullYear(), bl=tgl.getMonth();
  const BULAN = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  const HARI  = ["MIN","SEN","SEL","RAB","KAM","JUM","SAB"];
  const awal  = new Date(th,bl,1).getDay();
  const total = new Date(th,bl+1,0).getDate();
  const aktif = catatan.filter(n=>!n.arsip&&!n.hapus);

  // Catatan per hari (berdasarkan tanggalTarget/diubah)
  const perHari = {};
  aktif.forEach(n=>{
    const d=tanggalKalender(n);
    if(d.getFullYear()===th&&d.getMonth()===bl){
      const h=d.getDate(); (perHari[h]=perHari[h]||[]).push(n);
    }
  });

  // Pengingat per hari (berdasarkan field pengingat)
  const pengingatHari = {};
  aktif.forEach(n=>{
    if(!n.pengingat) return;
    const d=new Date(n.pengingat);
    if(d.getFullYear()===th&&d.getMonth()===bl){
      const h=d.getDate(); (pengingatHari[h]=pengingatHari[h]||[]).push(n);
    }
  });

  const sel=[]; for(let i=0;i<awal;i++)sel.push(null); for(let i=1;i<=total;i++)sel.push(i);
  const today=new Date();

  // Ringkasan
  const catatanBulanIni = Object.values(perHari).reduce((s,a)=>s+a.length,0);
  const pengingatAktif  = aktif.filter(n=>n.pengingat && new Date(n.pengingat).getTime() >= Date.now()).length;

  const catatanHariDipilih = hariDipilih ? (perHari[hariDipilih]||[]) : [];
  const tsHariDipilih = hariDipilih ? new Date(th,bl,hariDipilih,12,0,0,0).getTime() : null;

  return (
    <div style={{paddingBottom:80}}>
      {/* RINGKASAN */}
      <div style={{padding:"12px 16px",background:T.kartu,borderBottom:`1px solid ${T.border}`,display:"flex",gap:16,fontSize:13}}>
        <span style={{color:T.teks,fontWeight:700}}>📌 {catatanBulanIni} <span style={{color:T.subteks,fontWeight:400}}>catatan bulan ini</span></span>
        <span style={{color:T.teks,fontWeight:700}}>🔔 {pengingatAktif} <span style={{color:T.subteks,fontWeight:400}}>pengingat aktif</span></span>
      </div>

      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:16,background:T.nav,borderBottom:`1px solid ${T.border}`}}>
        <button onClick={()=>setTgl(new Date(th,bl-1,1))} style={{background:"none",border:"none",color:T.subteks,fontSize:18,cursor:"pointer"}}>◀</button>
        <span style={{color:T.teks,fontWeight:700,fontSize:16}}>{BULAN[bl]} {th}</span>
        <button onClick={()=>setTgl(new Date(th,bl+1,1))} style={{background:"none",border:"none",color:T.subteks,fontSize:18,cursor:"pointer"}}>▶</button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",background:T.nav}}>
        {HARI.map((h,i)=>(
          <div key={h} style={{textAlign:"center",padding:"10px 0",fontSize:11,fontWeight:700,color:i===0?"#e84040":i===6?"#3d9de8":T.muted}}>{h}</div>
        ))}
        {sel.map((d,i)=>{
          const isToday=d&&today.getDate()===d&&today.getMonth()===bl&&today.getFullYear()===th;
          const isPilih=d&&hariDipilih===d;
          const dot=d?(perHari[d]||[]):[];
          const adaPengingat=d&&(pengingatHari[d]||[]).length>0;
          return (
            <div key={i} onClick={()=>d&&setHariDipilih(isPilih?null:d)}
              style={{minHeight:54,border:`1px solid ${T.border}`,padding:4,
                background:isPilih?aksen+"22":"transparent",
                outline:isToday?`2px solid ${aksen}`:"none",outlineOffset:-2,
                cursor:d?"pointer":"default"}}>
              {d&&<>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontSize:13,textAlign:"center",lineHeight:"22px",minWidth:22,
                    color:isPilih?aksen:isToday?aksen:T.subteks,fontWeight:isToday||isPilih?700:400}}>{d}</span>
                  {adaPengingat&&<span style={{fontSize:10}}>🔔</span>}
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:2,marginTop:2}}>
                  {dot.slice(0,4).map(n=><div key={n.id} style={{width:6,height:6,borderRadius:"50%",background:n.warna?.aksen||aksen}}/>)}
                </div>
              </>}
            </div>
          );
        })}
      </div>

      {/* POPUP HARI DIPILIH */}
      {hariDipilih && (
        <div style={{padding:"14px 16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontSize:15,fontWeight:800,color:T.teks}}>📅 {hariDipilih} {BULAN[bl]} {th}</div>
            <button onClick={()=>setHariDipilih(null)} style={{background:"none",border:"none",color:T.subteks,cursor:"pointer",fontSize:18}}>×</button>
          </div>

          {/* Daftar catatan di tanggal itu */}
          {catatanHariDipilih.length>0 ? (
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:12}}>
              {catatanHariDipilih.map(n=>(
                <KartuCatatan key={n.id} c={n} onClick={onBukaCatatan} q="" t={t} tema={tema}/>
              ))}
            </div>
          ) : (
            <div style={{color:T.muted,padding:"10px 0 16px",fontSize:13}}>Belum ada catatan pada tanggal ini.</div>
          )}

          {/* Aksi */}
          <button onClick={()=>onTambahDiTanggal && onTambahDiTanggal(tsHariDipilih)}
            style={{width:"100%",padding:13,borderRadius:12,border:"none",cursor:"pointer",fontSize:14,fontWeight:700,
              background:aksen,color:"#000",marginBottom:10}}>
            + Tambah catatan di tanggal ini
          </button>
          <button onClick={()=>onSetPengingatTanggal && onSetPengingatTanggal(tsHariDipilih)}
            style={{width:"100%",padding:13,borderRadius:12,cursor:"pointer",fontSize:14,fontWeight:700,
              background:"none",border:`2px solid ${T.border}`,color:T.teks}}>
            🔔 Set pengingat di tanggal ini
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════ EDITOR CATATAN ══════════════════════════════════════

function EditorCatatan({ catatan, onSimpan, onTutup, onHapus, onArsip, settings, isPro, onGatePro, t, isTerang, folders }) {
  const [judul,             setJudul]             = useState(catatan?.judul||"");
  const [isi,               setIsi]               = useState(catatan?.isi||"");
  const [item,              setItem]              = useState(catatan?.item||[]);
  const [tipe,              setTipe]              = useState(catatan?.tipe||"teks");
  const [warna,             setWarna]             = useState(catatan?.warna||W0);
  const [mood,              setMood]              = useState(catatan?.mood||null);
  const [pengingat,         setPengingat]         = useState(catatan?.pengingat||"");
  const [pengingatBerulang, setPengingatBerulang] = useState(catatan?.pengingatBerulang||"sekali");
  const [folderDipilih,     setFolderDipilih]     = useState(catatan?.folder||null);
  const [menuBuka,          setMenuBuka]          = useState(false);
  const [warnaBuka,         setWarnaBuka]         = useState(false);
  const [moodBuka,          setMoodBuka]          = useState(false);
  const [ingatBuka,         setIngatBuka]         = useState(false);
  const [folderBuka,        setFolderBuka]        = useState(false);
  const [mintaIzin,         setMintaIzin]         = useState(false);
  const [modeFokus,         setModeFokus]         = useState(false);
  const [notif,             setNotif]             = useState(null);
  const [aiMenu,            setAiMenu]            = useState(false);
  const [aiLoading,         setAiLoading]         = useState(false);
  const [aiPerintah,        setAiPerintah]        = useState("");
  const [aiMode,            setAiMode]            = useState(null); // "rapikan"|"buatDari"
  const dragIdx   = useRef(null);
  const timerRef  = useRef(null);
  const audioCtxRef = useRef(null);
  const editorRef = useRef(null);   // contentEditable WYSIWYG
  const aiBtnRef  = useRef(null);   // anchor untuk dropdown menu AI
  const [tapAnim, setTapAnim] = useState(null);

  // Warna kertas kerja mengikuti warna catatan yang dipilih
  const edKertas = isTerang ? (warna.kertasLight || "#f8f5f0") : (warna.kertasDark || "#080808");
  const edBg    = edKertas;                                  // area tulis = kertas berwarna
  const edNav   = edKertas;                                  // header/toolbar/bottom senada
  const edBorder= isTerang ? "rgba(0,0,0,0.08)" : warna.garis;
  const edTeks  = isTerang ? "#1a1a1a" : "#ece8e0";
  const edMuted = isTerang ? "#9a948a" : "#666";
  const edInput = isTerang ? "#ffffffcc" : "none";
  const edSubTeks=isTerang ? "#666" : "#888";
  const edItemColor= isTerang ? "#1a1a1a" : "#ece8e0";       // teks kontras di atas kertas
  const edWordCount= isTerang ? "#b0a99c" : "#555";

  const tampilNotif = (p) => { setNotif(p); setTimeout(()=>setNotif(null),2200); };

  const playDone = () => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.start(); osc.stop(ctx.currentTime + 0.18);
    } catch {}
  };

  const tambahItem = () => {
    const baru = [...item, {id:buatId(),teks:"",cek:false,counter:0}];
    setItem(baru);
    setTimeout(()=>document.getElementById("item-"+baru[baru.length-1].id)?.focus(),50);
  };

  const ubahItem  = (id,teks) => setItem(item.map(i=>i.id===id?{...i,teks}:i));
  const cekItem   = (id) => setItem(item.map(i=>i.id===id?{...i,cek:!i.cek,counter:i.cek?0:i.counter||0}:i));
  const hapusItem = (id) => setItem(item.filter(i=>i.id!==id));

  const tapCounter = (id) => {
    const it = item.find(i=>i.id===id);
    if (!it) return;
    const target = parseTarget(it.teks);
    if (!target) return;
    const next = (it.counter||0) + 1;
    if (next >= target) {
      setItem(item.map(i=>i.id===id?{...i,cek:true,counter:next}:i));
      setTapAnim(id); setTimeout(()=>setTapAnim(null),700);
      if (navigator.vibrate) navigator.vibrate([30,20,30]);
      playDone();
    } else {
      setItem(item.map(i=>i.id===id?{...i,counter:next}:i));
      setTapAnim(id); setTimeout(()=>setTapAnim(null),150);
    }
  };

  const onDragStart = (idx) => { dragIdx.current=idx; };
  const onDragOver  = (e,idx) => {
    e.preventDefault();
    if (dragIdx.current===null||dragIdx.current===idx) return;
    const b=[...item]; const [x]=b.splice(dragIdx.current,1); b.splice(idx,0,x);
    dragIdx.current=idx; setItem(b);
  };

  // Isi konten ke contentEditable (HTML kalau ada tag, kalau tidak teks polos)
  const setKontenEditor = (el, v) => {
    if (!el) return;
    v = v || "";
    if (v.includes("<") && v.includes(">")) el.innerHTML = v;
    else el.innerText = v;
  };

  // Isi konten awal ke editor saat masuk mode teks / fokus (bukan tiap ketik → kursor tak loncat)
  useEffect(() => {
    const el = editorRef.current;
    if (el && tipe === "teks") {
      setKontenEditor(el, isi);
      if (modeFokus) setTimeout(() => el.focus(), 0);
    }
    // sengaja tidak depend pada `isi`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipe, modeFokus]);

  // Format langsung (WYSIWYG) — hasilnya tampil seketika, bukan simbol markdown
  const format = (cmd, val) => {
    if (!isPro) { onGatePro?.("Format Teks tersedia untuk pengguna Pro ✏️"); return; }
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    try { document.execCommand("styleWithCSS", false, false); } catch {}
    document.execCommand(cmd, false, val);
    setIsi(el.innerHTML);
  };

  // Panggil Asisten AI
  const panggilAI = async (mode, teksMasukan) => {
    if (!isPro) { onGatePro?.("Asisten AI Nulis tersedia untuk pengguna Pro ✨"); return; }
    setAiLoading(true);
    try {
      const res = await fetch(AI_ENDPOINT, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ mode, teks: stripHtml(teksMasukan) }),
      });
      const data = await res.json();
      if (data.hasil) {
        setIsi(data.hasil);
        setKontenEditor(editorRef.current, data.hasil);
        tampilNotif("✨ AI selesai!");
      }
      else tampilNotif("❌ " + (data.error || "AI gagal"));
    } catch { tampilNotif("❌ Tidak dapat menghubungi AI"); }
    setAiLoading(false); setAiMenu(false); setAiMode(null); setAiPerintah("");
  };

  const simpan = useCallback(() => {
    if (!judul.trim()&&!isi.trim()&&item.length===0) return;
    const c = {
      ...(catatan||{}), id:catatan?.id||buatId(),
      judul:judul.trim()||"Tanpa judul", isi, item, tipe, warna, mood,
      pengingat:pengingat||null,
      pengingatBerulang: pengingat ? pengingatBerulang : null,
      folder: folderDipilih||null,
      dibuat:catatan?.dibuat||Date.now(), diubah:Date.now(),
      pin:catatan?.pin||false, arsip:false, hapus:false, kunci:catatan?.kunci||false,
    };
    if (pengingat) {
      clearTimeout(timerRef.current);
      timerRef.current = jadwalkanNotif(c.judul, pengingat, stripHtml(c.isi).slice(0,80));
    }
    onSimpan(c);
  }, [judul,isi,item,tipe,warna,mood,pengingat,pengingatBerulang,folderDipilih,catatan,onSimpan]);

  const bagikan = async () => {
    const hasil = await bagikanCatatan({judul,isi,item,tipe});
    tampilNotif(hasil==="dibagikan"?"✅ Dibagikan!":hasil==="disalin"?"📋 Disalin":"Gagal");
  };

  const salinTeks = async () => {
    const teks = tipe==="ceklis" ? item.map(i=>`${i.cek?"✅":"⬜"} ${i.teks}`).join("\n") : stripHtml(isi);
    try { await navigator.clipboard.writeText(teks); tampilNotif("📋 Disalin!"); }
    catch { tampilNotif("Gagal menyalin"); }
  };

  const teksBersih = stripHtml(isi);
  const jumlahKata = teksBersih.trim().split(/\s+/).filter(Boolean).length;
  const folderAktif = (folders||[]).find(f=>f.id===folderDipilih);

  return (
    <div style={{position:"fixed",top:0,bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:edBg,zIndex:100,display:"flex",flexDirection:"column",fontSize:settings?.ukuranFont||15,boxShadow:"0 0 0 100vmax rgba(0,0,0,0.55)"}}>
      {notif && (
        <div style={{position:"absolute",top:70,left:"50%",transform:"translateX(-50%)",background:"#1c1c1c",border:"1px solid #2e2e2e",borderRadius:20,padding:"8px 18px",color:"#ddd",fontSize:13,zIndex:999,whiteSpace:"nowrap",pointerEvents:"none"}}>
          {notif}
        </div>
      )}

      {/* AI PERINTAH MODAL */}
      {aiMode === "buatDari" && (
        <div style={{position:"absolute",inset:0,background:"#000c",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
          <div style={{background:isTerang?"#ffffff":"#1c1c1c",borderRadius:16,padding:24,width:"100%",maxWidth:360,boxShadow:isTerang?"0 10px 40px #0003":"none"}}>
            <div style={{color:isTerang?"#c79a16":"#f5c842",fontSize:16,fontWeight:800,marginBottom:12}}>📝 Buat dari Perintah</div>
            <textarea value={aiPerintah} onChange={e=>setAiPerintah(e.target.value)}
              placeholder="Contoh: Buat daftar belanja mingguan untuk keluarga 4 orang…"
              style={{width:"100%",minHeight:100,background:isTerang?"#f3f0ea":"#2a2a2a",border:`1px solid ${isTerang?"#e0ddd6":"#3a3a3a"}`,borderRadius:8,padding:10,color:isTerang?"#333":"#ddd",resize:"none",boxSizing:"border-box",fontSize:14}}/>
            <div style={{display:"flex",gap:10,marginTop:12}}>
              <button onClick={()=>{setAiMode(null);setAiPerintah("");}} style={{flex:1,padding:10,background:isTerang?"#efece6":"#2a2a2a",border:"none",borderRadius:8,color:isTerang?"#666":"#888",cursor:"pointer"}}>Batal</button>
              <button onClick={()=>panggilAI("buatCatatan",aiPerintah)} disabled={!aiPerintah.trim()||aiLoading}
                style={{flex:2,padding:10,background:"#f5c842",border:"none",borderRadius:8,color:"#000",fontWeight:800,cursor:"pointer",opacity:aiPerintah.trim()?1:.5}}>
                {aiLoading?"⏳ Memproses…":"✨ Buat"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOPBAR */}
      {!modeFokus && (
        <div style={{display:"flex",alignItems:"center",padding:"12px 16px",borderBottom:`1px solid ${edBorder}`,background:edNav}}>
          <button onClick={()=>{simpan();onTutup();}} style={{background:"none",border:"none",color:warna.aksen,fontSize:22,cursor:"pointer",marginRight:12}}>←</button>
          <input value={judul} onChange={e=>setJudul(e.target.value)} placeholder="Judul catatan…"
            style={{flex:1,background:"none",border:"none",outline:"none",color:edTeks,fontSize:17,fontFamily:"Georgia,serif",fontWeight:700}}/>
          <button onClick={()=>setMenuBuka(!menuBuka)} style={{background:"none",border:"none",color:edMuted,fontSize:22,cursor:"pointer"}}>⋮</button>
        </div>
      )}

      {/* DROPDOWN MENU */}
      {menuBuka && (
        <div style={{position:"absolute",top:52,right:8,background:"#1c1c1c",border:"1px solid #2e2e2e",borderRadius:12,zIndex:200,minWidth:180,overflow:"hidden",boxShadow:"0 8px 30px #000b"}}>
          {[
            {ikon:"📌",teks:catatan?.pin?"Lepas Pin":"Pin Catatan", aksi:()=>{onSimpan({...catatan,pin:!catatan?.pin,diubah:Date.now()});setMenuBuka(false);}},
            {ikon:"🔔",teks:"Set Pengingat", aksi:()=>{
              if(!isPro){setMenuBuka(false);onGatePro?.("Fitur Pengingat tersedia untuk pengguna Pro 🔔");return;}
              setIngatBuka(true);setMenuBuka(false);
            }},
            {ikon:"📤",teks:"Bagikan", aksi:()=>{bagikan();setMenuBuka(false);}},
            {ikon:"📋",teks:"Salin Teks", aksi:()=>{salinTeks();setMenuBuka(false);}},
            {ikon:"🎯",teks:"Mode Fokus", aksi:()=>{
              if(!isPro){setMenuBuka(false);onGatePro?.("Mode Fokus — fitur Pro ✍️");return;}
              setModeFokus(true);setMenuBuka(false);
            }},
            {ikon:"🔒",teks:catatan?.kunci?"Buka Kunci":"Kunci", aksi:()=>{onSimpan({...catatan,kunci:!catatan?.kunci,diubah:Date.now()});setMenuBuka(false);}},
            {ikon:"📦",teks:"Arsipkan", aksi:()=>{simpan();onArsip(catatan);setMenuBuka(false);onTutup();}},
            {ikon:"🗑️",teks:"Hapus", aksi:()=>{onHapus(catatan);setMenuBuka(false);onTutup();}},
          ].map(m=>(
            <button key={m.teks} onClick={m.aksi}
              style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"12px 16px",background:"none",border:"none",color:"#ddd",cursor:"pointer",fontSize:14,borderTop:"1px solid #222"}}>
              {m.ikon} {m.teks}
            </button>
          ))}
        </div>
      )}

      {/* MODAL PENGINGAT */}
      {ingatBuka && (
        <div style={{position:"absolute",inset:0,background:"#000c",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{background:"#1c1c1c",borderRadius:16,padding:24,width:"85%",maxWidth:340}}>
            <div style={{color:"#ece8e0",fontSize:16,fontWeight:700,marginBottom:16}}>🔔 Set Pengingat</div>
            <input type="datetime-local" value={pengingat} onChange={e=>setPengingat(e.target.value)}
              style={{width:"100%",padding:10,background:"#2a2a2a",border:"1px solid #3a3a3a",borderRadius:8,color:"#ddd",marginBottom:12,boxSizing:"border-box"}}/>
            {pengingat && <div style={{fontSize:11,color:"#666",marginBottom:12}}>📅 {formatTanggalLengkap(new Date(pengingat).getTime())}</div>}
            <div style={{marginBottom:14}}>
              <div style={{fontSize:12,color:"#888",marginBottom:8}}>🔁 Berulang</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {[["sekali","Sekali"],["harian","Harian"],["mingguan","Mingguan"],["bulanan","Bulanan"]].map(([val,lab])=>(
                  <button key={val} onClick={()=>setPengingatBerulang(val)}
                    style={{padding:"5px 12px",borderRadius:20,cursor:"pointer",fontSize:12,border:`1px solid ${pengingatBerulang===val?"#f5c842":"#3a3a3a"}`,background:pengingatBerulang===val?"#f5c84222":"transparent",color:pengingatBerulang===val?"#f5c842":"#888"}}>
                    {lab}
                  </button>
                ))}
              </div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>{setPengingat("");setIngatBuka(false);}} style={{flex:1,padding:10,background:"#2a2a2a",border:"none",borderRadius:8,color:"#888",cursor:"pointer"}}>Hapus</button>
              <button onClick={()=>{
                setIngatBuka(false); tampilNotif("🔔 Pengingat disimpan!");
                if (pengingat && "Notification" in window && Notification.permission==="default") setMintaIzin(true);
              }} style={{flex:1,padding:10,background:warna.aksen,border:"none",borderRadius:8,color:"#000",fontWeight:700,cursor:"pointer"}}>Simpan</button>
            </div>
          </div>
        </div>
      )}

      {mintaIzin && (
        <ModalIzinNotif onIzinkan={async()=>{ await mintaIzinNotif(); setMintaIzin(false); }} onNanti={()=>setMintaIzin(false)}/>
      )}

      {/* MODE FOKUS */}
      {modeFokus && (
        <div style={{position:"absolute",inset:0,background:"#040404",zIndex:300,display:"flex",flexDirection:"column"}}>
          <div style={{padding:"16px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",opacity:.35}}>
            <span style={{fontSize:13,color:"#888",fontFamily:"Georgia,serif",fontStyle:"italic"}}>{judul||"Tanpa judul"}</span>
            <button onClick={()=>setModeFokus(false)} style={{background:"none",border:"none",color:"#888",cursor:"pointer",fontSize:12}}>Keluar Fokus ×</button>
          </div>
          <div
            ref={editorRef}
            contentEditable suppressContentEditableWarning
            onInput={e=>setIsi(e.currentTarget.innerHTML)}
            style={{flex:1,overflowY:"auto",background:"none",border:"none",outline:"none",color:"#ccc8c0",fontSize:17,lineHeight:2.1,padding:"0 40px 40px",whiteSpace:"pre-wrap",wordBreak:"break-word",fontFamily:"Georgia,serif"}}/>
          <div style={{padding:"10px 40px",opacity:.25,fontSize:12,color:"#888",display:"flex",justifyContent:"space-between"}}>
            <span>{jumlahKata} kata</span><span>{teksBersih.length} karakter</span>
          </div>
        </div>
      )}

      {/* TIPE SWITCHER + FOLDER DROPDOWN */}
      {!modeFokus && (
        <div style={{display:"flex",gap:8,padding:"10px 16px",background:edNav,alignItems:"center",borderBottom:`1px solid ${edBorder}`,flexWrap:"wrap"}}>
          {[{k:"teks",l:"📝 Teks"},{k:"ceklis",l:"☑️ Ceklis"}].map(tp=>(
            <button key={tp.k} onClick={()=>setTipe(tp.k)} style={{
              padding:"6px 14px",borderRadius:20,cursor:"pointer",fontSize:13,
              border:`1px solid ${tipe===tp.k?warna.aksen:edBorder}`,
              background:tipe===tp.k?warna.aksen+"22":"transparent",
              color:tipe===tp.k?warna.aksen:edMuted,
            }}>{tp.l}</button>
          ))}
          {/* Folder dropdown */}
          <div style={{position:"relative"}}>
            <button onClick={()=>{
              if(!isPro){onGatePro?.("Folder & Kategori tersedia untuk pengguna Pro 📁");return;}
              setFolderBuka(!folderBuka);
            }} style={{
              padding:"6px 12px",borderRadius:20,cursor:"pointer",fontSize:12,
              border:`1px solid ${folderAktif?folderAktif.warna+"66":edBorder}`,
              background:"transparent",color:folderAktif?folderAktif.warna:edMuted,
            }}>
              {folderAktif ? `${folderAktif.ikon} ${folderAktif.nama}` : isPro ? "📁 Folder" : "📁🔒"}
            </button>
            {folderBuka && (
              <div style={{position:"absolute",top:34,left:0,background:"#1c1c1c",border:"1px solid #2e2e2e",borderRadius:10,zIndex:200,minWidth:150,overflow:"hidden",boxShadow:"0 6px 20px #000a"}}>
                <button onClick={()=>{setFolderDipilih(null);setFolderBuka(false);}} style={{display:"block",width:"100%",padding:"10px 14px",background:"none",border:"none",color:"#888",cursor:"pointer",fontSize:13,textAlign:"left"}}>
                  — Tanpa folder
                </button>
                {(folders||[]).map(f=>(
                  <button key={f.id} onClick={()=>{setFolderDipilih(f.id);setFolderBuka(false);}}
                    style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"10px 14px",background:"none",border:"none",borderTop:"1px solid #222",color:folderDipilih===f.id?f.warna:"#ddd",cursor:"pointer",fontSize:13}}>
                    <span>{f.ikon}</span><span>{f.nama}</span>
                    {folderDipilih===f.id&&<span style={{marginLeft:"auto"}}>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={()=>setMoodBuka(!moodBuka)} style={{
            marginLeft:"auto",padding:"6px 12px",borderRadius:20,
            border:`1px solid ${mood?MOOD.find(x=>x.id===mood)?.warna+"66"||"#aaa":edBorder}`,
            background:"transparent",cursor:"pointer",fontSize:12,
            color:mood?MOOD.find(x=>x.id===mood)?.warna||"#aaa":edMuted,
          }}>
            {mood ? `${MOOD.find(x=>x.id===mood)?.ikon} ${MOOD.find(x=>x.id===mood)?.label}` : "+ Mood"}
          </button>
        </div>
      )}

      {/* MOOD DROPDOWN */}
      {moodBuka && !modeFokus && (
        <div style={{background:edNav,padding:"0 16px 12px",borderBottom:`1px solid ${edBorder}`}}>
          <PilihMood aktif={mood} onChange={m=>{setMood(m);setMoodBuka(false);}}/>
        </div>
      )}

      {/* MARKDOWN TOOLBAR + AI BUTTON (hanya teks, bukan ceklis) */}
      {tipe==="teks" && !modeFokus && (
        <div style={{display:"flex",gap:4,padding:"6px 12px",background:edNav,borderBottom:`1px solid ${edBorder}`,overflowX:"auto",scrollbarWidth:"none",alignItems:"center",flexShrink:0}}>
          {[
            {lab:"B",  title:"Tebal",     fn:()=>format("bold")},
            {lab:"I",  title:"Miring",    fn:()=>format("italic")},
            {lab:"H1", title:"Heading 1", fn:()=>format("formatBlock","<h1>")},
            {lab:"H2", title:"Heading 2", fn:()=>format("formatBlock","<h2>")},
            {lab:"• List",  title:"Daftar",    fn:()=>format("insertUnorderedList")},
            {lab:"☑ Todo",  title:"Checklist", fn:()=>format("insertText","☐ ")},
          ].map(btn=>(
            <button key={btn.lab} title={btn.title} onMouseDown={e=>e.preventDefault()} onClick={btn.fn}
              style={{
                flexShrink:0,padding:"3px 8px",borderRadius:6,border:`1px solid ${isTerang?"#d0ccc6":"#2a2a2a"}`,
                background:isTerang?"#fff":"#1a1a1a",color:isTerang?"#444":"#aaa",
                fontSize:11,fontWeight:btn.lab==="B"?900:btn.lab==="I"?700:500,
                fontStyle:btn.lab==="I"?"italic":"normal",cursor:"pointer",
              }}>
              {btn.lab}
            </button>
          ))}
          {!isPro && (
            <span style={{fontSize:10,color:"#f5c842",marginLeft:4,flexShrink:0}}>🔒 Pro</span>
          )}
          {/* AI Button */}
          <div style={{marginLeft:8,flexShrink:0}}>
            <button ref={aiBtnRef} onClick={()=>{
              if(!isPro){onGatePro?.("Asisten AI Nulis tersedia untuk pengguna Pro ✨");return;}
              setAiMenu(!aiMenu);
            }} style={{
              padding:"4px 10px",borderRadius:8,border:"1px solid #f5c84244",
              background:isTerang?"#fffbee":"#1a1400",color:"#f5c842",
              fontSize:12,fontWeight:700,cursor:"pointer",
              opacity:aiLoading?0.6:1,
            }}>
              {aiLoading?"⏳":"✨"} AI
            </button>
          </div>
        </div>
      )}

      {/* DROPDOWN MENU AI — mengambang (fixed) agar tidak terpotong toolbar & tidak menggeser konten */}
      {aiMenu && (() => {
        const r = aiBtnRef.current?.getBoundingClientRect();
        const top   = (r ? r.bottom : 90) + 4;
        const right = r ? Math.max(8, window.innerWidth - r.right) : 12;
        return (
          <>
            <div onClick={()=>setAiMenu(false)} style={{position:"fixed",inset:0,zIndex:399}}/>
            <div style={{position:"fixed",top,right,background:isTerang?"#ffffff":"#1c1c1c",border:`1px solid ${isTerang?"#e2ded6":"#2e2e2e"}`,borderRadius:10,zIndex:400,minWidth:210,overflow:"hidden",boxShadow:"0 8px 24px rgba(0,0,0,0.28)"}}>
              <button onClick={()=>{setAiMenu(false);panggilAI("rapikan",isi);}}
                style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"12px 16px",background:"none",border:"none",color:isTerang?"#333":"#ddd",cursor:"pointer",fontSize:14,textAlign:"left"}}>
                ✏️ Rapikan tulisan saya
              </button>
              <button onClick={()=>{setAiMenu(false);setAiMode("buatDari");}}
                style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"12px 16px",background:"none",border:"none",borderTop:`1px solid ${isTerang?"#eee":"#222"}`,color:isTerang?"#333":"#ddd",cursor:"pointer",fontSize:14,textAlign:"left"}}>
                📝 Buat catatan dari perintah
              </button>
            </div>
          </>
        );
      })()}

      {/* AREA TULIS */}
      {!modeFokus && (
        <div style={{flex:1,overflow:"auto",padding:16,background:edBg}}>
          {tipe==="teks" ? (
            <>
              <style>{`.kp-editor:empty:before{content:attr(data-ph);color:${edMuted};pointer-events:none;}
                .kp-editor h1{font-size:1.35em;font-weight:900;margin:8px 0 4px;}
                .kp-editor h2{font-size:1.15em;font-weight:800;margin:6px 0 2px;}
                .kp-editor ul{padding-left:22px;margin:4px 0;}`}</style>
              <div
                ref={editorRef}
                className="kp-editor"
                data-ph="Tulis sesuatu…"
                contentEditable
                suppressContentEditableWarning
                onInput={e=>setIsi(e.currentTarget.innerHTML)}
                style={{width:"100%",minHeight:"50vh",outline:"none",color:edItemColor,
                  fontSize:settings?.ukuranFont||15,lineHeight:1.9,whiteSpace:"pre-wrap",
                  wordBreak:"break-word",boxSizing:"border-box"}}/>
              {teksBersih && <div style={{fontSize:11,color:edWordCount,textAlign:"right"}}>{jumlahKata} kata · {teksBersih.length} karakter</div>}
            </>
          ) : (
            <div>
              {item.map((it,idx)=>{
                const target = parseTarget(it.teks);
                const count  = it.counter||0;
                const selesai= target && count >= target;
                const isAnim = tapAnim===it.id;
                return (
                  <div key={it.id} draggable onDragStart={()=>onDragStart(idx)} onDragOver={e=>onDragOver(e,idx)}
                    style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,borderRadius:8,padding:"4px 6px",
                      border:isAnim&&selesai?`1px solid ${warna.aksen}`:"1px solid transparent",
                      transition:"border-color .4s, background .4s",
                      background:isAnim&&selesai?warna.aksen+"18":"transparent",
                    }}>
                    <span style={{color:edMuted,fontSize:14,cursor:"grab",flexShrink:0}}>⠿</span>
                    <div onClick={()=>cekItem(it.id)} style={{
                      width:22,height:22,borderRadius:6,flexShrink:0,cursor:"pointer",
                      border:`2px solid ${it.cek?warna.aksen:isTerang?"#bbb":"#444"}`,
                      background:it.cek?warna.aksen:"transparent",
                      display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s",
                    }}>{it.cek&&<span style={{color:"#000",fontSize:12,fontWeight:900}}>✓</span>}</div>
                    <input id={"item-"+it.id} value={it.teks} onChange={e=>ubahItem(it.id,e.target.value)}
                      onKeyDown={e=>{ if(e.key==="Enter"){e.preventDefault();tambahItem();} if(e.key==="Backspace"&&!it.teks) hapusItem(it.id); }}
                      placeholder={`Item ${idx+1}…`}
                      style={{flex:1,background:"none",border:"none",outline:"none",
                        borderBottom:`1px solid ${edBorder}`,
                        color:it.cek?edMuted:edItemColor,fontSize:settings?.ukuranFont||15,
                        padding:"4px 0",textDecoration:it.cek?"line-through":"none"}}/>
                    {target && (
                      <>
                        <span style={{fontSize:12,color:selesai?"#34c776":warna.aksen,fontWeight:700,minWidth:38,textAlign:"center",flexShrink:0}}>
                          {selesai?"✅":""}{count}/{target}
                        </span>
                        {!it.cek && (
                          <button onPointerDown={()=>tapCounter(it.id)}
                            style={{background:warna.aksen+"28",border:`1px solid ${warna.aksen}`,borderRadius:20,padding:"4px 11px",color:warna.aksen,fontSize:12,fontWeight:700,cursor:"pointer",flexShrink:0,transform:isAnim&&!selesai?"scale(0.88)":"scale(1)",transition:"transform .12s",userSelect:"none"}}>TAP</button>
                        )}
                      </>
                    )}
                    <button onClick={()=>hapusItem(it.id)} style={{background:"none",border:"none",color:edMuted,cursor:"pointer",fontSize:18,flexShrink:0}}>×</button>
                  </div>
                );
              })}
              <button onClick={tambahItem} style={{display:"flex",alignItems:"center",gap:8,width:"100%",background:"none",border:`1px dashed ${edBorder}`,borderRadius:8,padding:"10px 14px",color:warna.aksen,cursor:"pointer",fontSize:14,marginTop:4}}>
                + Tambah item
              </button>
              {item.length>0&&(
                <div style={{fontSize:11,color:edWordCount,marginTop:10,textAlign:"right"}}>
                  {item.filter(i=>i.cek).length}/{item.length} selesai
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* BOTTOM BAR */}
      {!modeFokus && (
        <div style={{borderTop:`1px solid ${edBorder}`,padding:"12px 16px",background:edNav,display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>setWarnaBuka(!warnaBuka)} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,padding:4}}>🎨</button>
          <div style={{width:16,height:16,borderRadius:"50%",background:warna.aksen,border:"2px solid #fff2"}}/>
          {warnaBuka && (
            <div style={{position:"absolute",bottom:64,left:16,background:"#1c1c1c",border:"1px solid #2e2e2e",borderRadius:12,padding:12,zIndex:200}}>
              <PilihWarna aktif={warna} onChange={w=>{setWarna(w);setWarnaBuka(false);}} isPro={isPro} onGatePro={(p)=>{setWarnaBuka(false);onGatePro?.(p);}}/>
            </div>
          )}
          {pengingat && <span style={{fontSize:11,color:"#f5c842"}}>🔔 {formatWaktu(new Date(pengingat).getTime())}{pengingatBerulang&&pengingatBerulang!=="sekali"?` (${pengingatBerulang})`:""}</span>}
          <div style={{flex:1}}/>
          <span style={{fontSize:11,color:edWordCount}}>{formatWaktu(catatan?.diubah||Date.now())}</span>
          <button onClick={()=>{simpan();onTutup();}}
            style={{background:warna.aksen,border:"none",borderRadius:8,padding:"8px 18px",color:"#000",fontWeight:700,cursor:"pointer",fontSize:14}}>
            Simpan
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════ MODE BACA DZIKIR ════════════════════════════════════

function ModeBacaDzikir({ data, judul, onTutup, t, tema }) {
  const [idx, setIdx]             = useState(0);
  const [counter, setCounter]     = useState({});   // { no: count }
  const [selesai, setSelesai]     = useState([]);   // [no, ...]
  const item                      = data[idx];
  const semua                     = selesai.length === data.length;

  // Palet tema (ikut mode terang/gelap aplikasi)
  const isTerang = t && t.kartu === "#ffffff";
  const aksen = "#f5c842";
  const C = {
    bg:      isTerang ? "#f0ede8" : "#080808",
    nav:     isTerang ? "#ffffff" : "#0a0a0a",
    border:  isTerang ? "#e4e0d8" : "#1a1a1a",
    kartu:   isTerang ? "#ffffff" : "#0e0e0e",
    kartuBr: isTerang ? "#ece6da" : "#2a2000",
    arab:    isTerang ? "#2a2418" : "#f5e9c4",
    latin:   isTerang ? "#8a7a52" : "#b8a87a",
    terjBg:  isTerang ? "#f5f2ec" : "#0c0c0c",
    terj:    isTerang ? "#4a4a4a" : "#cccccc",
    faeBg:   isTerang ? "#eef0f8" : "#0e0e1a",
    faeBr:   isTerang ? "#dfe2f0" : "#1a1a3a",
    fae:     isTerang ? "#5a5a88" : "#9999cc",
    sub:     isTerang ? "#aaa" : "#555",
    navBtn:  isTerang ? "#efece6" : "#1e1e1e",
    navBtnTx:isTerang ? "#555" : "#bbbbbb",
    navOff:  isTerang ? "#f4f1ec" : "#111111",
    navOffTx:isTerang ? "#c8c4bc" : "#333333",
    tutupBg: isTerang ? "#efece6" : "#1a1a1a",
    tutupTx: isTerang ? "#666" : "#888",
    badgeBg: isTerang ? "#fff7e0" : "#1a1400",
    badgeBr: isTerang ? "#f0d98a" : "#3a2800",
  };

  const bunyiTone = (freq = 660, dur = 0.12) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.3, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      o.start(ctx.currentTime); o.stop(ctx.currentTime + dur);
      setTimeout(() => ctx.close(), 500);
    } catch {}
  };

  // Tap counter untuk satu item (dipakai kartu yang sedang aktif)
  const tapItem = (it) => {
    if (selesai.includes(it.no)) return;
    const c = (counter[it.no] || 0) + 1;
    setCounter(p => ({ ...p, [it.no]: c }));
    if (c >= it.dibaca) {
      setSelesai(p => [...p, it.no]);
      bunyiTone(880, 0.18);
      navigator.vibrate?.([80, 40, 80]);
      setTimeout(() => { setIdx(i => (i < data.length - 1 ? i + 1 : i)); }, 900);
    } else {
      bunyiTone(440, 0.07);
      navigator.vibrate?.(30);
    }
  };

  // Carousel: drag mengikuti jari, kartu sebelum & sesudah ikut terlihat bergeser
  const [dragX, setDragX]       = useState(0);
  const [dragging, setDragging] = useState(false);
  const [wd, setWd]             = useState(0);   // lebar kolom untuk geometri carousel
  const startX = useRef(0);

  const next = () => { if (idx < data.length - 1) { setDragging(false); setDragX(0); setIdx(i => i + 1); } };
  const prev = () => { if (idx > 0)               { setDragging(false); setDragX(0); setIdx(i => i - 1); } };

  const onTouchStart = (e) => { startX.current = e.targetTouches[0].clientX; setDragging(true); };
  const onTouchMove  = (e) => { setDragX(e.targetTouches[0].clientX - startX.current); };
  const onTouchEnd   = () => {
    const jarak = dragX;
    setDragging(false);
    if (jarak <= -55 && idx < data.length - 1) setIdx(i => i + 1);   // swipe kiri → berikutnya
    else if (jarak >= 55 && idx > 0)           setIdx(i => i - 1);   // swipe kanan → sebelumnya
    setDragX(0);
  };

  // Layar selesai semua
  if (semua) return (
    <div style={{
      position: "fixed", top: 0, bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 480, background: isTerang ? "#eef5ea" : "#050e00", zIndex: 9999,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 32, boxShadow: "0 0 0 100vmax rgba(0,0,0,0.55)",
    }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
      <div style={{ fontSize: 24, fontWeight: 900, color: "#34c776", marginBottom: 8 }}>Alhamdulillah!</div>
      <div style={{ fontSize: 15, color: C.terj, textAlign: "center", marginBottom: 32, lineHeight: 1.8 }}>
        {judul} selesai dibaca.{"\n"}Semoga Allah menerima amal ibadahmu.
      </div>
      <button onClick={onTutup} style={{
        background: "#34c776", color: "#000", fontWeight: 900, fontSize: 15,
        border: "none", borderRadius: 12, padding: "14px 36px", cursor: "pointer",
      }}>Selesai</button>
    </div>
  );

  // Geometri carousel (peek kartu sebelum & sesudah)
  const W = wd || 360;
  const slideW = Math.round(W * 0.88);
  const sisi   = (W - slideW) / 2;
  const trackX = sisi - idx * slideW + dragX;

  return (
    <div
      style={{
        position: "fixed", top: 0, bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 480, background: C.bg, zIndex: 9999,
        display: "flex", flexDirection: "column", overflow: "hidden",
        boxShadow: "0 0 0 100vmax rgba(0,0,0,0.55)",
      }}>
      {/* HEADER */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 18px", borderBottom: `1px solid ${C.border}`,
        background: C.nav, flexShrink: 0,
      }}>
        <button onClick={onTutup} style={{
          background: C.tutupBg, border: "none", borderRadius: 8, padding: "6px 12px",
          color: C.tutupTx, fontSize: 13, cursor: "pointer",
        }}>✕ Tutup</button>
        <div style={{ fontSize: 14, fontWeight: 700, color: aksen }}>{judul}</div>
        <div style={{ fontSize: 13, color: C.sub }}>{idx + 1}/{data.length}</div>
      </div>

      {/* DOTS PROGRESS */}
      <div style={{
        display: "flex", gap: 5, padding: "10px 18px", overflowX: "auto", flexShrink: 0,
        scrollbarWidth: "none", background: C.nav,
      }}>
        {data.map((d, i) => (
          <button key={d.no} onClick={() => setIdx(i)} style={{
            width: selesai.includes(d.no) ? 12 : (i === idx ? 14 : 8),
            height: selesai.includes(d.no) ? 12 : (i === idx ? 14 : 8),
            borderRadius: "50%", flexShrink: 0, border: "none", cursor: "pointer",
            background: selesai.includes(d.no) ? "#34c776" : i === idx ? aksen : (isTerang ? "#d8d3c8" : "#2a2a2a"),
            transition: "all .2s",
          }} />
        ))}
      </div>

      {/* CAROUSEL TRACK (peek before/after) */}
      <div
        ref={el=>{ if (el && el.clientWidth && el.clientWidth !== wd) setWd(el.clientWidth); }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        <div style={{
          display: "flex", height: "100%",
          transform: `translateX(${trackX}px)`,
          transition: dragging ? "none" : "transform .28s cubic-bezier(.22,.61,.36,1)",
          touchAction: "pan-y",
        }}>
          {data.map((it, i) => {
            const isSel = selesai.includes(it.no);
            const cnt   = counter[it.no] || 0;
            const aktif = i === idx;
            return (
              <div key={it.no} style={{
                width: slideW, flex: "0 0 auto", padding: "10px 7px 16px", boxSizing: "border-box",
                opacity: aktif ? 1 : 0.45, transform: aktif ? "scale(1)" : "scale(0.96)",
                transition: "opacity .25s ease, transform .25s ease",
              }}>
                <div style={{
                  background: C.kartu, border: `1px solid ${C.kartuBr}`, borderRadius: 18,
                  padding: "16px 14px", height: "100%", boxSizing: "border-box",
                  display: "flex", flexDirection: "column", gap: 14, overflowY: "auto",
                }}>
                  {/* Nama */}
                  <div style={{ textAlign: "center" }}>
                    <span style={{
                      background: isSel ? (isTerang ? "#e3f6e0" : "#0a2a00") : C.badgeBg,
                      border: `1px solid ${isSel ? "#34c776" : C.badgeBr}`,
                      borderRadius: 20, padding: "4px 14px", fontSize: 12,
                      color: isSel ? "#34c776" : aksen, fontWeight: 700,
                    }}>
                      {isSel ? "✅ Selesai" : `${it.no}. ${it.nama}`}
                    </span>
                  </div>

                  {/* Arabic */}
                  <div style={{ textAlign: "right" }}>
                    <div style={{
                      fontFamily: "'Amiri', 'Arial', serif", fontSize: 26, lineHeight: 2.2,
                      color: C.arab, direction: "rtl", wordBreak: "break-word",
                    }}>
                      {it.arab}
                    </div>
                  </div>

                  {/* Latin */}
                  <div style={{ fontSize: 13, color: C.latin, lineHeight: 1.9, fontStyle: "italic", textAlign: "center" }}>
                    {it.latin}
                  </div>

                  {/* Terjemah */}
                  <div style={{ background: C.terjBg, borderRadius: 12, padding: "14px 16px", fontSize: 13, color: C.terj, lineHeight: 1.8 }}>
                    {it.terjemah}
                  </div>

                  {/* Faedah */}
                  {it.faedah ? (
                    <div style={{ background: C.faeBg, border: `1px solid ${C.faeBr}`, borderRadius: 12, padding: "12px 14px", fontSize: 12, color: C.fae, lineHeight: 1.7 }}>
                      📖 {it.faedah}
                    </div>
                  ) : null}

                  {/* COUNTER / TAP */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginTop: "auto", paddingTop: 6 }}>
                    {it.dibaca > 1 && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ fontSize: 32, fontWeight: 900, color: isSel ? "#34c776" : aksen, fontFamily: "monospace" }}>{cnt}</div>
                        <div style={{ fontSize: 16, color: C.sub }}>/</div>
                        <div style={{ fontSize: 22, color: C.sub, fontFamily: "monospace" }}>{it.dibaca}×</div>
                      </div>
                    )}
                    {!isSel ? (
                      <button onClick={() => aktif && tapItem(it)} style={{
                        background: aksen, color: "#000", fontWeight: 900, fontSize: 16,
                        border: "none", borderRadius: 60, padding: it.dibaca === 1 ? "14px 56px" : "14px 44px",
                        cursor: "pointer", userSelect: "none", WebkitUserSelect: "none",
                        boxShadow: "0 4px 20px #f5c84255", transition: "transform .08s",
                      }}>
                        {it.dibaca === 1 ? "Selesai Dibaca ✓" : "TAP"}
                      </button>
                    ) : (
                      <div style={{ fontSize: 22, color: "#34c776", fontWeight: 900 }}>✅ Selesai</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* NAVIGASI PREV / NEXT */}
      <div style={{
        display: "flex", gap: 12, padding: "14px 18px 28px",
        borderTop: `1px solid ${C.border}`, flexShrink: 0, background: C.nav,
      }}>
        <button onClick={prev} disabled={idx === 0} style={{
          flex: 1, padding: "12px 0", borderRadius: 10, border: "none",
          background: idx === 0 ? C.navOff : C.navBtn, color: idx === 0 ? C.navOffTx : C.navBtnTx,
          fontSize: 14, fontWeight: 700, cursor: idx === 0 ? "not-allowed" : "pointer",
        }}>← Sebelumnya</button>
        <button onClick={next} disabled={idx === data.length - 1} style={{
          flex: 1, padding: "12px 0", borderRadius: 10, border: "none",
          background: idx === data.length - 1 ? C.navOff : C.navBtn,
          color: idx === data.length - 1 ? C.navOffTx : aksen,
          fontSize: 14, fontWeight: 700, cursor: idx === data.length - 1 ? "not-allowed" : "pointer",
        }}>Berikutnya →</button>
      </div>
    </div>
  );
}

// ═══════════════════════ HALAMAN DZIKIR ══════════════════════════════════════

function HalamanDzikir({ catatan, onBukaCatatan, simpanCatatan, t, tema }) {
  const jam = new Date().getHours();
  const waktupagi   = jam >= 4  && jam < 12;
  const waktupetang = jam >= 15 && jam <= 18;
  const [notifDzikir, setNotifDzikir] = useState(
    () => localStorage.getItem(NOTIF_DZIKIR_KEY) === "true"
  );
  const [jamSekarang, setJamSekarang] = useState(new Date());
  const [modeBaca, setModeBaca]       = useState(null); // { data, judul }
  const [mintaIzin, setMintaIzin]     = useState(false);

  useEffect(() => {
    const t = setInterval(() => setJamSekarang(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const hariIdx  = new Date().getDay();
  const motivasi = MOTIVASI_DZIKIR[hariIdx % MOTIVASI_DZIKIR.length];

  const catatanDzikir = catatan.filter(n =>
    !n.arsip && !n.hapus &&
    /dzikir/i.test(n.judul || "")
  );

  const aktifkanDzikir = () => {
    localStorage.setItem(NOTIF_DZIKIR_KEY, "true");
    setNotifDzikir(true);
    jadwalkanNotifDzikir();
  };

  const toggleNotif = () => {
    if (notifDzikir) {
      // Matikan
      localStorage.setItem(NOTIF_DZIKIR_KEY, "false");
      setNotifDzikir(false);
      return;
    }
    // Nyalakan — minta izin dengan ramah dulu
    if (!("Notification" in window)) { alert("Browser tidak mendukung notifikasi."); return; }
    if (Notification.permission === "granted") { aktifkanDzikir(); return; }
    if (Notification.permission === "denied") { alert("Izin notifikasi diblokir. Aktifkan di pengaturan browser."); return; }
    setMintaIzin(true);
  };

  const statusWaktu = waktupagi
    ? { label: "🌅 Waktu Dzikir Pagi", warna: "#f5c842" }
    : waktupetang
    ? { label: "🌇 Waktu Dzikir Petang", warna: "#e88530" }
    : jam < 4 || jam >= 19
    ? { label: "🌙 Malam — istirahatkan hati", warna: "#9b59e8" }
    : { label: "☀️ Siang hari", warna: "#3d9de8" };

  const formatJam = (d) =>
    d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  if (modeBaca) return (
    <ModeBacaDzikir data={modeBaca.data} judul={modeBaca.judul} onTutup={() => setModeBaca(null)} t={t} tema={tema} />
  );

  return (
    <div style={{ paddingBottom: 90 }}>
      {mintaIzin && (
        <ModalIzinNotif
          onIzinkan={async()=>{ const ok=await mintaIzinNotif(); setMintaIzin(false); if(ok) aktifkanDzikir(); }}
          onNanti={()=>setMintaIzin(false)}
        />
      )}
      {/* HEADER */}
      <div style={{ background: "#0e0e0e", borderBottom: "1px solid #1a1a1a", padding: "20px 18px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#ece8e0", letterSpacing: -1 }}>📿 Dzikir</div>
            <div style={{ fontSize: 13, color: statusWaktu.warna, fontWeight: 700, marginTop: 4 }}>
              {statusWaktu.label}
            </div>
            <div style={{ fontSize: 22, color: "#f5c842", fontWeight: 900, marginTop: 6, fontFamily: "monospace" }}>
              {formatJam(jamSekarang)}
            </div>
          </div>
          <button onClick={toggleNotif} style={{
            background: notifDzikir ? "#0a1a00" : "#1a1a1a",
            border: `1px solid ${notifDzikir ? "#34c776" : "#2a2a2a"}`,
            borderRadius: 10, padding: "8px 12px", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
          }}>
            <span style={{ fontSize: 18 }}>{notifDzikir ? "🔔" : "🔕"}</span>
            <span style={{ fontSize: 10, color: notifDzikir ? "#34c776" : "#555" }}>
              {notifDzikir ? "Aktif" : "Mati"}
            </span>
          </button>
        </div>

        {/* Motivasi harian */}
        <div style={{ marginTop: 14, padding: "12px 14px", background: "#141400", border: "1px solid #2a2200", borderRadius: 10 }}>
          <div style={{ fontSize: 13, color: "#ccc", lineHeight: 1.6, fontStyle: "italic" }}>
            "{motivasi.teks}"
          </div>
          <div style={{ fontSize: 11, color: "#555", marginTop: 5 }}>— {motivasi.sumber}</div>
        </div>
      </div>

      {/* TOMBOL MULAI CEPAT */}
      <div style={{ padding: "14px 16px", display: "flex", gap: 10 }}>
        {[
          { label: "Dzikir Pagi", ikon: "🌅", data: DZIKIR_PAGI, warna: "#f5c842", aktif: waktupagi },
          { label: "Dzikir Petang", ikon: "🌇", data: DZIKIR_PETANG, warna: "#e88530", aktif: waktupetang },
        ].map(b => (
          <button key={b.label}
            onClick={() => setModeBaca({ data: b.data, judul: b.label })}
            style={{
              flex: 1, padding: "14px 10px", borderRadius: 12, cursor: "pointer",
              border: `2px solid ${b.aktif ? b.warna : "#2a2a2a"}`,
              background: b.aktif ? b.warna + "18" : "#111",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            }}>
            <span style={{ fontSize: 26 }}>{b.ikon}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: b.aktif ? b.warna : "#aaa" }}>
              Mulai {b.label}
            </span>
            <span style={{ fontSize: 11, color: "#555" }}>{b.data.length} dzikir</span>
          </button>
        ))}
      </div>

      {/* DAFTAR CATATAN DZIKIR */}
      <div style={{ padding: "0 16px" }}>
        <div style={{ fontSize: 11, color: "#3a3a3a", fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>
          CATATAN DZIKIRMU
        </div>
        {catatanDzikir.length === 0 && (
          <div style={{ textAlign: "center", color: "#2a2a2a", padding: "32px 0", fontSize: 13, lineHeight: 2 }}>
            Belum ada catatan dzikir.{"\n"}Buat dari template ⚡ → Dzikir Pagi / Petang.
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {catatanDzikir.map(n => {
            const items = n.item || [];
            const done  = items.filter(i => i.cek).length;
            const total = items.length;
            const pct   = total > 0 ? Math.round(done / total * 100) : 0;
            const isPagi   = /pagi/i.test(n.judul);
            const isPetang = /petang/i.test(n.judul);
            const highlight = (isPagi && waktupagi) || (isPetang && waktupetang);
            return (
              <div key={n.id} onClick={() => onBukaCatatan(n)}
                style={{
                  background: highlight ? "#141400" : "#111",
                  border: `2px solid ${highlight ? "#f5c84266" : "#1c1c1c"}`,
                  borderRadius: 14, padding: "14px 16px", cursor: "pointer",
                }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#ece8e0" }}>
                    {isPagi ? "🌅" : isPetang ? "🌇" : "📿"} {n.judul}
                  </span>
                  {highlight && <span style={{ fontSize: 11, color: "#f5c842", fontWeight: 700 }}>◉ Sekarang</span>}
                </div>
                <div style={{ fontSize: 12, color: "#555", marginBottom: 8 }}>{done}/{total} dzikir selesai</div>
                <div style={{ height: 5, background: "#1e1e1e", borderRadius: 5, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${pct}%`,
                    background: pct === 100 ? "#34c776" : "#f5c842",
                    borderRadius: 5, transition: "width .5s",
                  }} />
                </div>
                {pct === 100 && (
                  <div style={{ fontSize: 12, color: "#34c776", marginTop: 6, fontWeight: 700 }}>
                    ✅ Alhamdulillah — dzikir selesai!
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════ MODAL BUAT FOLDER ═══════════════════════════════════

function ModalBuatFolder({ onSimpan, onTutup, editFolder }) {
  const IKON_PILIHAN = ["💼","🏠","🕌","📚","💡","❤️","🌿","🎯","💸","✈️","🎵","🍳"];
  const WARNA_PILIHAN = ["#9b59e8","#34c776","#f5c842","#3d9de8","#e84040","#e88530","#30d8dc","#e840b0"];
  const [nama, setNama] = useState(editFolder?.nama||"");
  const [ikon, setIkon] = useState(editFolder?.ikon||"📁");
  const [warna, setWarna] = useState(editFolder?.warna||"#9b59e8");

  return (
    <div style={{position:"fixed",inset:0,background:"#000d",zIndex:600,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onTutup}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#111",borderRadius:"20px 20px 0 0",width:"100%",maxWidth:480,padding:24}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:18}}>
          <div style={{fontSize:16,fontWeight:800,color:"#ece8e0"}}>{editFolder?"✏️ Edit Folder":"📁 Buat Folder Baru"}</div>
          <button onClick={onTutup} style={{background:"#1e1e1e",border:"none",borderRadius:"50%",width:30,height:30,color:"#888",cursor:"pointer",fontSize:16}}>×</button>
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:12,color:"#666",marginBottom:6}}>Nama Folder</div>
          <input value={nama} onChange={e=>setNama(e.target.value)} placeholder="Nama folder…" maxLength={20}
            style={{width:"100%",background:"#1a1a1a",border:"1px solid #2a2a2a",borderRadius:8,padding:"10px 12px",color:"#ddd",fontSize:14,outline:"none",boxSizing:"border-box"}}/>
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:12,color:"#666",marginBottom:8}}>Ikon</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {IKON_PILIHAN.map(i=>(
              <button key={i} onClick={()=>setIkon(i)}
                style={{width:38,height:38,borderRadius:8,border:`2px solid ${ikon===i?"#f5c842":"#2a2a2a"}`,background:ikon===i?"#191300":"#1a1a1a",fontSize:20,cursor:"pointer"}}>
                {i}
              </button>
            ))}
          </div>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:12,color:"#666",marginBottom:8}}>Warna</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {WARNA_PILIHAN.map(w=>(
              <div key={w} onClick={()=>setWarna(w)}
                style={{width:28,height:28,borderRadius:"50%",background:w,cursor:"pointer",border:warna===w?"3px solid #fff":"3px solid transparent",boxShadow:warna===w?`0 0 8px ${w}`:""}}/>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onTutup} style={{flex:1,padding:12,background:"#1a1a1a",border:"none",borderRadius:10,color:"#888",cursor:"pointer"}}>Batal</button>
          <button onClick={()=>nama.trim()&&onSimpan({id:editFolder?.id||buatId(),nama:nama.trim(),ikon,warna})} disabled={!nama.trim()}
            style={{flex:2,padding:12,background:nama.trim()?"#f5c842":"#3a3a00",border:"none",borderRadius:10,color:"#000",fontWeight:800,cursor:nama.trim()?"pointer":"default",opacity:nama.trim()?1:.5}}>
            {editFolder?"Simpan Perubahan":"Buat Folder"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════ HALAMAN TANYA AI ════════════════════════════════════

function HalamanTanyaAI({ catatan, isPro, onGatePro, t, tema }) {
  const [pesan,    setPesan]    = useState([]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const chatRef = useRef(null);

  const CHIP = ["Ringkas catatanku","Apa yang belum selesai?","Total pengeluaran?","Ide terbaik minggu ini"];

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [pesan]);

  const kirim = async (pertanyaan) => {
    if (!pertanyaan.trim() || loading) return;
    if (!isPro) { onGatePro("Tanya Catatanmu (AI) tersedia untuk pengguna Pro 💬"); return; }
    const q = pertanyaan.trim();
    setPesan(p=>[...p,{dari:"user",teks:q}]);
    setInput("");
    setLoading(true);
    try {
      const ringkas = catatan.filter(n=>!n.hapus&&!n.arsip).slice(0,30).map(n=>({judul:n.judul,isi:stripHtml(n.isi)||(n.item||[]).map(i=>(i.cek?"✅":"☐")+" "+i.teks).join(", ")}));
      const res = await fetch(AI_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode:"tanya",pertanyaan:q,semuaCatatan:ringkas})});
      const data = await res.json();
      setPesan(p=>[...p,{dari:"ai",teks:data.hasil||data.error||"AI tidak merespons."}]);
    } catch { setPesan(p=>[...p,{dari:"ai",teks:"❌ Tidak dapat menghubungi AI. Coba lagi sebentar."}]); }
    setLoading(false);
  };

  const isTerang = t && t.kartu === "#ffffff";
  const aksen = tema?.aksen || "#28c0b6";

  return (
    <div style={{display:"flex",flexDirection:"column",height:"calc(100dvh - 120px)"}}>
      {/* Header */}
      <div style={{padding:"14px 16px",borderBottom:`1px solid ${t.border}`}}>
        <div style={{fontSize:14,fontWeight:800,color:t.teks}}>💬 Tanya Catatanmu</div>
        <div style={{fontSize:11,color:t.subteks,marginTop:2}}>AI menjawab berdasarkan catatan kamu</div>
      </div>

      {/* Area chat */}
      <div ref={chatRef} style={{flex:1,overflow:"auto",padding:16,display:"flex",flexDirection:"column",gap:12}}>
        {pesan.length===0 && (
          <div style={{textAlign:"center",padding:"32px 16px"}}>
            <div style={{fontSize:48,marginBottom:12}}>💬</div>
            <div style={{color:t.teks,fontSize:15,fontWeight:700,marginBottom:6}}>Tanya apa saja tentang catatanmu</div>
            <div style={{color:t.subteks,fontSize:13,marginBottom:20}}>AI akan menjawab berdasarkan data catatan kamu saja</div>
            {!isPro && (
              <div style={{background:"#191200",border:"1px solid #f5c84244",borderRadius:12,padding:14,marginBottom:16}}>
                <div style={{color:"#f5c842",fontSize:13,fontWeight:700}}>👑 Fitur Pro</div>
                <div style={{color:"#888",fontSize:12,marginTop:4}}>Upgrade untuk menggunakan Tanya AI</div>
              </div>
            )}
            <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center"}}>
              {CHIP.map(c=>(
                <button key={c} onClick={()=>kirim(c)} style={{padding:"6px 14px",borderRadius:20,border:`1px solid ${t.border}`,background:t.kartu,color:t.teks,cursor:"pointer",fontSize:12}}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}
        {pesan.map((p,i)=>(
          <div key={i} style={{display:"flex",justifyContent:p.dari==="user"?"flex-end":"flex-start"}}>
            <div style={{
              maxWidth:"80%",padding:"10px 14px",borderRadius:p.dari==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px",
              background:p.dari==="user"?aksen:(isTerang?"#f0ede8":"#1a1a1a"),
              color:p.dari==="user"?"#000":t.teks,fontSize:14,lineHeight:1.6,
            }}>
              {p.teks}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{display:"flex",justifyContent:"flex-start"}}>
            <div style={{padding:"10px 14px",borderRadius:"14px 14px 14px 4px",background:isTerang?"#f0ede8":"#1a1a1a",color:t.subteks,fontSize:14}}>
              ⏳ Sedang berpikir…
            </div>
          </div>
        )}
      </div>

      {/* Quick chips (saat ada pesan) */}
      {pesan.length>0 && (
        <div style={{padding:"6px 16px",display:"flex",gap:6,overflowX:"auto",scrollbarWidth:"none"}}>
          {CHIP.map(c=>(
            <button key={c} onClick={()=>kirim(c)} style={{flexShrink:0,padding:"4px 10px",borderRadius:20,border:`1px solid ${t.border}`,background:"transparent",color:t.subteks,cursor:"pointer",fontSize:11}}>
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{padding:"10px 16px 16px",borderTop:`1px solid ${t.border}`,display:"flex",gap:10,alignItems:"center"}}>
        <input value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),kirim(input))}
          placeholder={isPro?"Tanya tentang catatanmu…":"Upgrade Pro untuk Tanya AI"}
          disabled={loading}
          style={{flex:1,background:isTerang?"#f0ede8":"#1a1a1a",border:`1px solid ${t.border}`,borderRadius:10,padding:"10px 12px",color:t.teks,fontSize:14,outline:"none"}}/>
        <button onClick={()=>kirim(input)} disabled={!input.trim()||loading}
          style={{background:aksen,border:"none",borderRadius:10,padding:"10px 14px",color:"#000",fontWeight:700,cursor:"pointer",fontSize:14,opacity:input.trim()&&!loading?1:.4}}>
          →
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════ HALAMAN LAPORAN ═════════════════════════════════════

function HalamanLaporan({ catatan, isPro, onGatePro, t, tema }) {
  const isTerang = t && t.kartu === "#ffffff";
  const aksen = tema?.aksen || "#28c0b6";

  if (!isPro) {
    return (
      <div style={{padding:32,textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:16}}>📊</div>
        <div style={{fontSize:18,fontWeight:800,color:t.teks,marginBottom:8}}>Laporan Mingguan</div>
        <div style={{fontSize:13,color:t.subteks,marginBottom:24,lineHeight:1.7}}>
          Bar chart 7 hari, streak, total ceklis selesai, dan top mood minggu ini.
        </div>
        <button onClick={()=>onGatePro("Laporan Mingguan tersedia untuk pengguna Pro 📊")}
          style={{padding:"12px 28px",background:"linear-gradient(135deg,#f5c842,#e8a030)",border:"none",borderRadius:12,color:"#000",fontWeight:800,fontSize:14,cursor:"pointer"}}>
          👑 Upgrade untuk Laporan
        </button>
      </div>
    );
  }

  const aktif = catatan.filter(n=>!n.hapus&&!n.arsip);
  const sekarang = new Date();

  // Data 7 hari terakhir
  const hari7 = Array.from({length:7}).map((_,i)=>{
    const d = new Date(sekarang);
    d.setDate(d.getDate() - (6-i));
    d.setHours(0,0,0,0);
    const besok = new Date(d); besok.setDate(d.getDate()+1);
    const count = aktif.filter(n=>{
      const t2 = n.dibuat||0;
      return t2 >= d.getTime() && t2 < besok.getTime();
    }).length;
    const HARI = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];
    return { label: HARI[d.getDay()], count };
  });
  const maxHari = Math.max(...hari7.map(h=>h.count), 1);

  // Total ceklis selesai minggu ini
  const weekStart = new Date(sekarang); weekStart.setDate(sekarang.getDate()-6); weekStart.setHours(0,0,0,0);
  const ceklisSelesai = aktif.filter(n=>n.tipe==="ceklis").flatMap(n=>(n.item||[]).filter(i=>i.cek)).length;

  // Top mood
  const byMood = {};
  aktif.forEach(n=>{ if(n.mood) byMood[n.mood]=(byMood[n.mood]||0)+1; });
  const topMoodId = Object.entries(byMood).sort((a,b)=>b[1]-a[1])[0]?.[0];
  const topMood = topMoodId ? MOOD.find(m=>m.id===topMoodId) : null;

  // Streak hari berturut-turut buat catatan
  let streak = 0;
  for (let i=0; i<30; i++) {
    const d = new Date(sekarang); d.setDate(d.getDate()-i); d.setHours(0,0,0,0);
    const besok = new Date(d); besok.setDate(d.getDate()+1);
    const ada = aktif.some(n=>{ const t2=n.dibuat||0; return t2>=d.getTime()&&t2<besok.getTime(); });
    if (ada) streak++; else break;
  }

  const cardStyle = { background:t.kartu, border:`1px solid ${t.border}`, borderRadius:14, padding:16, marginBottom:12 };

  return (
    <div style={{padding:"16px",paddingBottom:80}}>
      {/* Bar chart 7 hari */}
      <div style={cardStyle}>
        <div style={{fontSize:12,color:t.subteks,fontWeight:700,letterSpacing:1,marginBottom:14}}>CATATAN DIBUAT — 7 HARI TERAKHIR</div>
        <div style={{display:"flex",alignItems:"flex-end",gap:6,height:100}}>
          {hari7.map((h,i)=>(
            <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <div style={{fontSize:11,color:h.count>0?aksen:t.muted,fontWeight:700}}>{h.count||""}</div>
              <div style={{
                width:"100%",borderRadius:"4px 4px 0 0",
                height: h.count>0 ? `${Math.round(h.count/maxHari*72)}px` : "4px",
                background: i===6 ? aksen : (isTerang?"#d0ccc6":"#2a2a2a"),
                minHeight:4,transition:"height .4s",
              }}/>
              <div style={{fontSize:10,color:i===6?aksen:t.muted,fontWeight:i===6?700:400}}>{h.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats summary */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
        <div style={{...cardStyle,marginBottom:0,textAlign:"center"}}>
          <div style={{fontSize:36,fontWeight:900,color:aksen,lineHeight:1}}>{streak}</div>
          <div style={{fontSize:12,color:t.subteks,marginTop:4}}>🔥 Streak Hari</div>
        </div>
        <div style={{...cardStyle,marginBottom:0,textAlign:"center"}}>
          <div style={{fontSize:36,fontWeight:900,color:"#34c776",lineHeight:1}}>{ceklisSelesai}</div>
          <div style={{fontSize:12,color:t.subteks,marginTop:4}}>✅ Ceklis Selesai</div>
        </div>
      </div>

      {/* Top mood */}
      <div style={cardStyle}>
        <div style={{fontSize:12,color:t.subteks,fontWeight:700,letterSpacing:1,marginBottom:10}}>TOP MOOD CATATANMU</div>
        {topMood ? (
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:36}}>{topMood.ikon}</span>
            <div>
              <div style={{fontSize:16,fontWeight:800,color:topMood.warna}}>{topMood.label}</div>
              <div style={{fontSize:12,color:t.subteks}}>{byMood[topMoodId]} catatan</div>
            </div>
          </div>
        ) : (
          <div style={{color:t.muted,fontSize:13}}>Belum ada mood yang dicatat</div>
        )}
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:12}}>
          {Object.entries(byMood).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([id,n])=>{
            const m=MOOD.find(x=>x.id===id);
            return m ? (
              <span key={id} style={{background:m.warna+"18",border:`1px solid ${m.warna}33`,borderRadius:20,padding:"3px 10px",fontSize:11,color:m.warna}}>
                {m.ikon} {n}
              </span>
            ) : null;
          })}
        </div>
      </div>

      {/* Total catatan */}
      <div style={{...cardStyle,marginBottom:0}}>
        <div style={{fontSize:12,color:t.subteks,fontWeight:700,letterSpacing:1,marginBottom:10}}>RINGKASAN</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {[
            {lab:"Total catatan aktif",  n:aktif.length,             w:aksen},
            {lab:"Catatan ceklis",        n:aktif.filter(n=>n.tipe==="ceklis").length, w:"#34c776"},
            {lab:"Catatan bermoood",      n:aktif.filter(n=>n.mood).length,            w:"#e88530"},
            {lab:"Pengingat aktif",       n:aktif.filter(n=>n.pengingat).length,        w:"#f5c842"},
          ].map(s=>(
            <div key={s.lab} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:13,color:t.teks}}>{s.lab}</span>
              <span style={{fontSize:16,fontWeight:700,color:s.w}}>{s.n}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════ MAIN APP ════════════════════════════════════════════

// ═══════════════════════ WELCOME SCREEN ══════════════════════════════════════

function WelcomeScreen({ onBuatCatatan, onTemplate, onDzikir, isTerang, t, tema }) {
  const fitur = [
    { ikon:"🔥", teks:"Mood tag — tandai konteks setiap catatan" },
    { ikon:"📊", teks:"Dashboard harian & progress ceklis" },
    { ikon:"📿", teks:"Counter dzikir terintegrasi langsung" },
    { ikon:"⚡", teks:"8 template siap pakai sesuai kebutuhan" },
    { ikon:"🔒", teks:"Keamanan PIN & ekspor data" },
    { ikon:"🆓", teks:"Gratis selamanya, Pro untuk fitur lanjutan" },
  ];
  return (
    <div style={{ padding:"32px 24px", background:t.bg, minHeight:"70vh" }}>
      {/* ATAS */}
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
        <svg width="100" height="100" viewBox="0 0 120 120" aria-label="KapurPad">
          <g stroke={tema.aksen} strokeWidth="10" strokeLinecap="round" fill="none">
            <line x1="38" y1="30" x2="38" y2="84"/>
            <line x1="38" y1="58" x2="67" y2="30"/>
            <line x1="38" y1="58" x2="70" y2="84"/>
          </g>
          <rect x="68" y="78" width="11" height="32" rx="5" fill="#f5a030" transform="rotate(-48 73 94)"/>
          <circle cx="78" cy="88" r="2.5" fill={tema.aksen}/>
          <circle cx="84" cy="92" r="2" fill={tema.aksen}/>
        </svg>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:15, color:t.subteks }}>Selamat datang di</div>
          <div style={{ fontSize:32, fontWeight:900, fontFamily:"Georgia,serif", letterSpacing:-1 }}>
            <span style={{ color:t.teks }}>kapur</span>
            <span style={{ color:tema.aksen }}>pad</span>
          </div>
          <div style={{ fontSize:13, color:t.subteks, textAlign:"center", marginTop:8 }}>
            Catatan harian untuk Muslim Indonesia 🇮🇩
          </div>
        </div>
      </div>

      {/* TOMBOL AKSI */}
      <div style={{ marginTop:32 }}>
        <button onClick={onTemplate} style={{
          background:`linear-gradient(135deg, ${tema.aksen}, ${tema.aksen}cc)`, color:"#000",
          fontWeight:800, borderRadius:14, padding:16, width:"100%", fontSize:15,
          border:"none", cursor:"pointer",
        }}>⚡ Mulai dari Template</button>

        <button onClick={onBuatCatatan} style={{
          background:"none", border:`2px solid ${t.border}`, color:t.teks,
          borderRadius:14, padding:14, width:"100%", fontSize:14, marginTop:10, cursor:"pointer",
        }}>📝 Buat Catatan Baru</button>

        <button onClick={onDzikir} style={{
          background:"none", border:`2px solid ${t.border}`, color:t.teks,
          borderRadius:14, padding:14, width:"100%", fontSize:14, marginTop:10, cursor:"pointer",
        }}>📿 Mulai Dzikir Pagi</button>
      </div>

      {/* KENAPA KAPURPAD */}
      <div style={{ marginTop:40 }}>
        <div style={{ fontSize:11, color:t.muted, fontWeight:700, letterSpacing:1 }}>KENAPA KAPURPAD?</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:12, marginTop:16 }}>
          {fitur.map((f,i)=>(
            <div key={i} style={{
              background:t.kartu, border:`1px solid ${t.border}`, borderRadius:12,
              padding:"12px 16px", display:"flex", gap:12, alignItems:"center",
            }}>
              <span style={{ fontSize:20 }}>{f.ikon}</span>
              <span style={{ fontSize:13, color:t.teks }}>{f.teks}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [catatan,      setCatatan]      = useState(muatCatatan);
  const [settings,     setSettings]     = useState(muatSettings);
  const [tampilan,     setTampilan]     = useState("catatan");
  const [editCatatan,  setEditCatatan]  = useState(null);
  const [sedangBuat,   setSedangBuat]   = useState(false);
  const [tipeBaru,     setTipeBaru]     = useState("teks");
  const [tmplDipilih,  setTmplDipilih]  = useState(null);
  const [kueri,        setKueri]        = useState("");
  const [urutkan,      setUrutkan]      = useState("diubah");
  const [filter,       setFilter]       = useState("semua");
  const [menuUrut,     setMenuUrut]     = useState(false);
  const [menuTambah,   setMenuTambah]   = useState(false);
  const [lihatArsip,   setLihatArsip]   = useState(false);
  const [lihatSampah,  setLihatSampah]  = useState(false);
  const [modalPro,     setModalPro]     = useState(false);
  const [modalTmpl,    setModalTmpl]    = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [pinCheck,     setPinCheck]     = useState(!!muatSettings().pin);
  const [notif,        setNotif]        = useState(null);
  const [isPro,        setIsPro]        = useState(cekStatusPro);
  const [gatePro,      setGatePro]      = useState(null);
  const [notifSukses,  setNotifSukses]  = useState(false);
  const [prefillKal,   setPrefillKal]   = useState(null);
  const [folders,      setFolders]      = useState(muatFolder);
  const [folderFilter, setFolderFilter] = useState("semua"); // "semua" | folder.id
  const [modalFolder,  setModalFolder]  = useState(false);
  const [editFolderObj,setEditFolderObj]= useState(null);
  const [modalVoice,   setModalVoice]   = useState(false);
  const [modalOCR,     setModalOCR]     = useState(false);
  const [promptInstall,setPromptInstall]= useState(null); // event beforeinstallprompt
  const [showInstall,  setShowInstall]  = useState(false);

  const bukaGatePro = (pesan) => setGatePro(pesan);

  const toLocalInput = (d) => {
    const p = n => String(n).padStart(2,"0");
    return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
  };
  const tambahDiTanggal = (ts, withReminder) => {
    const base = { tipe:"teks", warna:W0, tanggalTarget: ts };
    if (withReminder) { const d=new Date(ts); d.setHours(8,0,0,0); base.pengingat = toLocalInput(d); }
    setPrefillKal(base);
    setTmplDipilih(null);
    setSedangBuat(true);
  };

  const tema = TEMA.find(t=>t.id===settings.tema)||TEMA[0];
  const isTerang = !!tema.terang;
  // Palette penuh diambil langsung dari tema terpilih (kertas + teks ikut berubah)
  const t = {
    teks: tema.teks, subteks: tema.subteks, bg: tema.bg, nav: tema.nav,
    kartu: tema.kartu, border: tema.border, input: tema.input, muted: tema.muted, aksen: tema.aksen,
  };

  useEffect(() => { simpanLokal(catatan); }, [catatan]);
  useEffect(() => { simpanSettings(settings); }, [settings]);
  useEffect(() => { simpanFolder(folders); }, [folders]);

  // Cek status Pro saat app dibuka dan saat fokus kembali
  useEffect(() => {
    const cek = () => setIsPro(cekStatusPro());
    cek();
    window.addEventListener("focus", cek);
    return () => window.removeEventListener("focus", cek);
  }, []);

  // Pulihkan Pro untuk order yang sempat pending (mis. transfer bank yang baru lunas)
  useEffect(() => {
    let pending;
    try { pending = localStorage.getItem("kapurpad_pending_order"); } catch {}
    if (!pending || cekStatusPro()) return;
    fetch("/.netlify/functions/cek-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: pending }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.transaction_status === "settlement" || data.transaction_status === "capture") {
          aktifkanPro();
          setIsPro(true);
          try { localStorage.removeItem("kapurpad_pending_order"); } catch {}
          setNotifSukses(true);
        }
      })
      .catch(() => {});
  }, []);

  // Jadwalkan notifikasi dzikir harian jika diaktifkan
  useEffect(() => { jadwalkanNotifDzikir(); }, []);

  // Terapkan tema ke body
  useEffect(() => {
    document.body.style.background = tema.bg;
  }, [tema]);

  // Banner "Pasang aplikasi" (PWA) — tangkap event beforeinstallprompt
  useEffect(() => {
    const sudahStandalone = window.matchMedia?.("(display-mode: standalone)")?.matches
      || window.navigator.standalone === true;
    if (sudahStandalone || localStorage.getItem("kp_install_tutup") === "1") return;
    const onPrompt = (e) => {
      e.preventDefault();
      setPromptInstall(e);
      setShowInstall(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", () => { setShowInstall(false); setPromptInstall(null); });
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const pasangApp = async () => {
    if (!promptInstall) return;
    promptInstall.prompt();
    try { await promptInstall.userChoice; } catch {}
    setPromptInstall(null);
    setShowInstall(false);
  };
  const tutupInstall = () => { setShowInstall(false); localStorage.setItem("kp_install_tutup","1"); };

  // Proteksi ringan (deterrent): cegah klik-kanan & shortcut inspect.
  // Catatan: kode sisi-klien tidak bisa 100% dicegah; kunci utama (API key) sudah di server.
  useEffect(() => {
    const blokirMenu = (e) => e.preventDefault();
    const blokirKey = (e) => {
      const k = (e.key || "").toLowerCase();
      if (k === "f12") e.preventDefault();
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ["i","j","c"].includes(k)) e.preventDefault();
      if ((e.ctrlKey || e.metaKey) && k === "u") e.preventDefault();
    };
    document.addEventListener("contextmenu", blokirMenu);
    document.addEventListener("keydown", blokirKey);
    return () => {
      document.removeEventListener("contextmenu", blokirMenu);
      document.removeEventListener("keydown", blokirKey);
    };
  }, []);

  const tampilNotif = (p) => { setNotif(p); setTimeout(()=>setNotif(null),2600); };

  const simpanCatatan = (c) => {
    // Catatan tak terbatas untuk semua (gratis & Pro) — tidak ada batas jumlah.
    setCatatan(p => { const i=p.findIndex(n=>n.id===c.id); return i>=0?p.map(n=>n.id===c.id?c:n):[c,...p]; });
  };
  // Buat catatan teks dari hasil AI (Voice / OCR) lalu buka langsung di editor
  const buatCatatanDariTeks = (teks) => {
    const c = { id:buatId(), tipe:"teks", judul:"", isi:teks||"", item:[], warna:W0, dibuat:Date.now(), diubah:Date.now() };
    simpanCatatan(c);
    setEditCatatan(c);
  };
  const hapusCatatan  = (c) => { setCatatan(p=>p.map(n=>n.id===c.id?{...n,hapus:true}:n)); tampilNotif("Dipindah ke tong sampah"); };
  const arsipCatatan  = (c) => { setCatatan(p=>p.map(n=>n.id===c.id?{...n,arsip:true}:n)); tampilNotif("Catatan diarsipkan"); };
  const pulihkan      = (id) => { setCatatan(p=>p.map(n=>n.id===id?{...n,hapus:false,arsip:false}:n)); tampilNotif("Catatan dipulihkan"); };
  const hapusPermanen = (id) => { setCatatan(p=>p.filter(n=>n.id!==id)); tampilNotif("Dihapus permanen"); };

  const difilter = [...catatan].filter(n => {
    if (n.arsip||n.hapus) return false;
    if (kueri && !(n.judul?.toLowerCase().includes(kueri.toLowerCase())||stripHtml(n.isi).toLowerCase().includes(kueri.toLowerCase()))) return false;
    if (folderFilter !== "semua" && n.folder !== folderFilter) return false;
    if (filter==="semua") return true;
    if (filter.startsWith("mood_")) return n.mood===filter.slice(5);
    if (filter==="tipe_ceklis") return n.tipe==="ceklis";
    if (filter==="pin") return n.pin;
    return true;
  }).sort((a,b) => {
    if (a.pin!==b.pin) return b.pin?1:-1;
    if (urutkan==="diubah") return b.diubah-a.diubah;
    if (urutkan==="dibuat") return b.dibuat-a.dibuat;
    if (urutkan==="judul")  return a.judul.localeCompare(b.judul);
    return 0;
  });

  const diarsip  = catatan.filter(n=>n.arsip&&!n.hapus);
  const disampah = catatan.filter(n=>n.hapus);

  const catatanDariTmpl = tmplDipilih ? {
    tipe:tmplDipilih.tipe, judul:tmplDipilih.judul, isi:tmplDipilih.isi||"",
    item:(tmplDipilih.item||[]).map(t=>({id:buatId(),teks:t,cek:false,counter:0})), warna:W0,
  } : prefillKal ? prefillKal : {tipe:tipeBaru, warna:W0};

  // ── KUNCI DOMAIN (anti-clone) ──
  // Hanya berjalan di domain resmi (*.netlify.app) atau localhost. Clone di domain lain diblokir.
  const hostOk = typeof window === "undefined"
    || /(^|\.)netlify\.app$/.test(window.location.hostname)
    || ["localhost", "127.0.0.1"].includes(window.location.hostname);
  if (!hostOk) return (
    <div style={{minHeight:"100dvh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#0a0a0a",color:"#888",fontFamily:"sans-serif",textAlign:"center",padding:24,gap:8}}>
      <div style={{fontSize:42}}>🔒</div>
      <div style={{fontSize:16,fontWeight:800,color:"#ccc"}}>KapurPad</div>
      <div style={{fontSize:13,lineHeight:1.7,maxWidth:300}}>Aplikasi ini hanya berjalan di situs resminya. Salinan tidak resmi tidak diizinkan.</div>
    </div>
  );

  // ── LAYAR PIN ──
  if (pinCheck) return (
    <ModalPin mode="masuk" pinSimpan={settings.pin} onSukses={()=>setPinCheck(false)} onBatal={()=>setPinCheck(false)}/>
  );

  // ── PENGATURAN ──
  if (showSettings) return (
    <HalamanPengaturan settings={settings} onUbah={setSettings} onTutup={()=>setShowSettings(false)} catatan={catatan} isPro={isPro} onGatePro={bukaGatePro} t={t} tampilNotif={tampilNotif}
      onAktivasiSukses={()=>{ aktifkanPro(); setIsPro(true); }}/>
  );

  // ── EDITOR ──
  if (editCatatan!==null||sedangBuat) return (
    <EditorCatatan
      catatan={sedangBuat?catatanDariTmpl:editCatatan}
      onSimpan={simpanCatatan}
      onTutup={()=>{setEditCatatan(null);setSedangBuat(false);setTmplDipilih(null);setPrefillKal(null);}}
      onHapus={hapusCatatan}
      onArsip={arsipCatatan}
      settings={settings}
      isPro={isPro}
      onGatePro={bukaGatePro}
      t={t}
      isTerang={isTerang}
      folders={folders}
    />
  );

  const labelUrut = {diubah:"waktu diubah",dibuat:"waktu dibuat",judul:"judul"};

  return (
    <div style={{background:t.bg, minHeight:"100dvh", maxWidth:480, margin:"0 auto", fontFamily:"'Segoe UI',sans-serif", color:t.teks, position:"relative", fontSize:settings.ukuranFont}}>

      {/* TOAST */}
      {notif && (
        <div style={{position:"fixed",bottom:84,left:"50%",transform:"translateX(-50%)",background:"#1c1c1c",border:"1px solid #2e2e2e",borderRadius:20,padding:"10px 20px",color:"#ddd",fontSize:13,zIndex:999,whiteSpace:"nowrap",boxShadow:"0 4px 20px #000a",pointerEvents:"none"}}>
          {notif}
        </div>
      )}

      {/* BANNER PASANG APLIKASI (PWA) */}
      {showInstall && (
        <div style={{position:"fixed",bottom:140,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 32px)",maxWidth:448,background:t.nav,border:`1px solid ${tema.aksen}55`,borderRadius:14,padding:"12px 14px",zIndex:80,display:"flex",alignItems:"center",gap:12,boxShadow:"0 8px 30px #000b"}}>
          <span style={{fontSize:26}}>📲</span>
          <div style={{flex:1}}>
            <div style={{color:t.teks,fontWeight:700,fontSize:13}}>Pasang KapurPad</div>
            <div style={{color:t.subteks,fontSize:11,marginTop:2}}>Akses cepat layar penuh, tanpa browser</div>
          </div>
          <button onClick={pasangApp} style={{background:tema.aksen,border:"none",borderRadius:9,padding:"8px 14px",color:"#000",fontWeight:800,fontSize:12,cursor:"pointer",flexShrink:0}}>Pasang</button>
          <button onClick={tutupInstall} style={{background:"none",border:"none",color:t.muted,fontSize:20,cursor:"pointer",flexShrink:0}}>×</button>
        </div>
      )}

      {/* MODALS */}
      {gatePro && (
        <GatePro
          pesan={gatePro}
          onUpgrade={()=>{ setGatePro(null); setModalPro(true); }}
          onTutup={()=>setGatePro(null)}
          t={t}
        />
      )}
      {modalPro  && <ModalPremium t={t} tampilNotif={tampilNotif}
        onTutup={()=>setModalPro(false)}
        onSukses={()=>{ aktifkanPro(); setIsPro(true); setGatePro(null); setModalPro(false); setNotifSukses(true); }}/>}
      {notifSukses && <NotifSukses t={t} onTutup={()=>setNotifSukses(false)}/>}
      {modalTmpl && <ModalTemplate onPilih={tp=>{setTmplDipilih(tp);setModalTmpl(false);setSedangBuat(true);}} onTutup={()=>setModalTmpl(false)} isPro={isPro} onGatePro={bukaGatePro}/>}
      {modalVoice && <ModalVoice isPro={isPro} onGatePro={bukaGatePro} t={t} tema={tema}
        onHasil={(teks)=>{ buatCatatanDariTeks(teks); tampilNotif("🎙️ Catatan dibuat dari suara"); }}
        onClose={()=>setModalVoice(false)}/>}
      {modalOCR && <ModalOCR isPro={isPro} onGatePro={bukaGatePro} t={t} tema={tema}
        onHasil={(teks)=>{ buatCatatanDariTeks(teks); tampilNotif("📷 Catatan dibuat dari foto"); }}
        onClose={()=>setModalOCR(false)}/>}
      {modalFolder && (
        <ModalBuatFolder
          editFolder={editFolderObj}
          onSimpan={(f)=>{
            if (editFolderObj) setFolders(p=>p.map(x=>x.id===f.id?f:x));
            else setFolders(p=>[...p,f]);
            setModalFolder(false); setEditFolderObj(null);
          }}
          onTutup={()=>{setModalFolder(false);setEditFolderObj(null);}}
        />
      )}

      {/* ── HEADER ── */}
      {(tampilan==="catatan"||tampilan==="cari") && (
        <div style={{position:"sticky",top:0,zIndex:50,background:t.nav,borderBottom:`1px solid ${t.border}`}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px 8px"}}>
            <div style={{display:"flex",alignItems:"baseline",gap:2}}>
              <button onClick={()=>setSettings({...settings, tema: isTerang ? "gelap" : "terang"})}
                style={{background:"none",border:"none",cursor:"pointer",fontSize:18,marginRight:8,alignSelf:"center"}}>
                {isTerang ? "🌙" : "☀️"}
              </button>
              <span style={{fontSize:26,fontWeight:900,color:t.teks,letterSpacing:-1,fontFamily:"Georgia,serif"}}>kapur</span>
              <span style={{fontSize:26,fontWeight:900,color:tema.aksen,letterSpacing:-1,fontFamily:"Georgia,serif"}}>pad</span>
              {settings.namaPengguna && <span style={{fontSize:12,color:t.muted,marginLeft:8}}>· {settings.namaPengguna}</span>}
            </div>
            {isPro ? (
              <span style={{background:"#191200",border:"1px solid #f5c84266",borderRadius:20,padding:"5px 12px",color:"#f5c842",fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:5}}>
                👑 Pro
              </span>
            ) : (
              <button onClick={()=>setModalPro(true)}
                style={{background:"#191200",border:"1px solid #f5c84244",borderRadius:20,padding:"5px 12px",color:"#f5c842",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
                👑 Pro
              </button>
            )}
          </div>
          {tampilan==="catatan" && (
            <button onClick={()=>setMenuUrut(!menuUrut)}
              style={{display:"flex",alignItems:"center",gap:6,width:"100%",padding:"7px 16px",background:t.input,border:"none",borderBottom:`1px solid ${t.border}`,color:t.subteks,fontSize:12,cursor:"pointer"}}>
              Urutkan berdasarkan {labelUrut[urutkan]} ▾
            </button>
          )}
          {menuUrut && (
            <div style={{background:t.kartu,borderBottom:`1px solid ${t.border}`}}>
              {Object.entries(labelUrut).map(([k,v])=>(
                <button key={k} onClick={()=>{setUrutkan(k);setMenuUrut(false);}}
                  style={{display:"block",width:"100%",padding:"10px 20px",background:"none",border:"none",color:urutkan===k?tema.aksen:"#555",textAlign:"left",cursor:"pointer",fontSize:13}}>
                  {urutkan===k?"✓ ":"  "}Urutkan berdasarkan {v}
                </button>
              ))}
            </div>
          )}
          {tampilan==="cari" && (
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 16px"}}>
              <span style={{color:t.muted,fontSize:18}}>🔍</span>
              <input autoFocus value={kueri} onChange={e=>setKueri(e.target.value)} placeholder="Cari catatan…"
                style={{flex:1,background:"none",border:"none",outline:"none",color:t.teks,fontSize:16}}/>
              {kueri && <button onClick={()=>setKueri("")} style={{background:"none",border:"none",color:t.subteks,cursor:"pointer",fontSize:20}}>×</button>}
            </div>
          )}
          <FilterBar aktif={filter} onChange={setFilter} t={t}/>
          {/* FOLDER CHIPS */}
          <div style={{display:"flex",gap:6,overflowX:"auto",padding:"6px 16px 8px",scrollbarWidth:"none"}}>
            <button onClick={()=>setFolderFilter("semua")} style={{
              flexShrink:0,padding:"4px 12px",borderRadius:20,cursor:"pointer",fontSize:12,
              border:`1px solid ${folderFilter==="semua"?tema.aksen:t.border}`,
              background:folderFilter==="semua"?tema.aksen+"22":"transparent",
              color:folderFilter==="semua"?tema.aksen:t.subteks,
            }}>📁 Semua</button>
            {folders.map(f=>(
              <button key={f.id} onClick={()=>setFolderFilter(f.id===folderFilter?"semua":f.id)} style={{
                flexShrink:0,padding:"4px 12px",borderRadius:20,cursor:"pointer",fontSize:12,
                border:`1px solid ${folderFilter===f.id?f.warna:t.border}`,
                background:folderFilter===f.id?f.warna+"22":"transparent",
                color:folderFilter===f.id?f.warna:t.subteks,
              }}>{f.ikon} {f.nama}</button>
            ))}
            <button onClick={()=>{
              if(!isPro){bukaGatePro("Buat folder baru tersedia untuk pengguna Pro 📁");return;}
              setEditFolderObj(null);setModalFolder(true);
            }} style={{
              flexShrink:0,padding:"4px 12px",borderRadius:20,cursor:"pointer",fontSize:12,
              border:`1px solid ${t.border}`,background:"transparent",color:t.subteks,
            }}>+ Buat</button>
          </div>
        </div>
      )}

      {tampilan==="kalender" && (
        <div style={{position:"sticky",top:0,zIndex:50,background:t.nav,padding:"16px",borderBottom:`1px solid ${t.border}`}}>
          <span style={{fontSize:20,fontWeight:800,color:t.teks}}>📅 Kalender</span>
        </div>
      )}
      {tampilan==="dzikir" && (
        <div style={{position:"sticky",top:0,zIndex:50,background:t.nav,borderBottom:`1px solid ${t.border}`,padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:20,fontWeight:800,color:t.teks}}>📿 Dzikir</span>
          <span style={{fontSize:11,color:t.subteks,background:t.input,borderRadius:20,padding:"4px 10px"}}>Gratis Selamanya</span>
        </div>
      )}
      {tampilan==="menu" && (
        <div style={{position:"sticky",top:0,zIndex:50,background:t.nav,padding:"16px",borderBottom:`1px solid ${t.border}`}}>
          <span style={{fontSize:20,fontWeight:800,color:t.teks}}>☰ Menu</span>
        </div>
      )}
      {tampilan==="tanyaai" && (
        <div style={{position:"sticky",top:0,zIndex:50,background:t.nav,padding:"14px 16px",borderBottom:`1px solid ${t.border}`,display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>setTampilan("menu")} style={{background:"none",border:"none",color:tema.aksen,fontSize:20,cursor:"pointer"}}>←</button>
          <span style={{fontSize:18,fontWeight:800,color:t.teks}}>💬 Tanya AI</span>
        </div>
      )}
      {tampilan==="laporan" && (
        <div style={{position:"sticky",top:0,zIndex:50,background:t.nav,padding:"14px 16px",borderBottom:`1px solid ${t.border}`,display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>setTampilan("menu")} style={{background:"none",border:"none",color:tema.aksen,fontSize:20,cursor:"pointer"}}>←</button>
          <span style={{fontSize:18,fontWeight:800,color:t.teks}}>📊 Laporan Mingguan</span>
        </div>
      )}
      {tampilan==="insight" && (
        <div style={{position:"sticky",top:0,zIndex:50,background:t.nav,padding:"14px 16px",borderBottom:`1px solid ${t.border}`,display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>setTampilan("menu")} style={{background:"none",border:"none",color:tema.aksen,fontSize:20,cursor:"pointer"}}>←</button>
          <span style={{fontSize:18,fontWeight:800,color:t.teks}}>🧠 AI Insight Mingguan</span>
        </div>
      )}
      {tampilan==="quran" && (
        <div style={{position:"sticky",top:0,zIndex:50,background:t.nav,padding:"14px 16px",borderBottom:`1px solid ${t.border}`,display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>setTampilan("menu")} style={{background:"none",border:"none",color:tema.aksen,fontSize:20,cursor:"pointer"}}>←</button>
          <span style={{fontSize:18,fontWeight:800,color:t.teks}}>📖 Ayat & Hadits</span>
        </div>
      )}

      {/* ── KONTEN ── */}
      <div style={{paddingBottom:84}}>
        {(tampilan==="catatan"||tampilan==="cari") &&
          catatan.filter(n=>!n.hapus&&!n.arsip).length===0 && !lihatArsip && !lihatSampah && (
          <WelcomeScreen
            onBuatCatatan={()=>{setTipeBaru("teks");setSedangBuat(true);}}
            onTemplate={()=>setModalTmpl(true)}
            onDzikir={()=>setTampilan("dzikir")}
            isTerang={isTerang} t={t} tema={tema}
          />
        )}

        {(tampilan==="catatan"||tampilan==="cari") &&
          !(catatan.filter(n=>!n.hapus&&!n.arsip).length===0 && !lihatArsip && !lihatSampah) && (
          <div>
            {tampilan==="catatan"&&filter==="semua"&&!kueri && catatan.filter(n=>!n.hapus&&!n.arsip).length>0 && <DashboardHarian catatan={catatan} t={t}/>}

            {lihatArsip && (
              <>
                <div style={{padding:"10px 16px",background:"#0e0e0e",color:"#f5c842",fontSize:13,fontWeight:700,borderBottom:"1px solid #1a1a1a",display:"flex",justifyContent:"space-between"}}>
                  <span>📦 Arsip ({diarsip.length})</span>
                  <button onClick={()=>setLihatArsip(false)} style={{background:"none",border:"none",color:"#555",cursor:"pointer"}}>Tutup</button>
                </div>
                <div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:10}}>
                  {diarsip.map(n=>(
                    <div key={n.id} style={{display:"flex",gap:10,alignItems:"center"}}>
                      <div style={{flex:1}}><KartuCatatan c={n} onClick={()=>setEditCatatan(n)} q=""/></div>
                      <button onClick={()=>pulihkan(n.id)} style={{background:"none",border:"1px solid #2a2a2a",borderRadius:8,color:"#888",padding:"6px 10px",cursor:"pointer",fontSize:12,flexShrink:0}}>Pulihkan</button>
                    </div>
                  ))}
                  {diarsip.length===0&&<div style={{color:"#2a2a2a",textAlign:"center",padding:24}}>Kosong</div>}
                </div>
              </>
            )}

            {lihatSampah && (
              <>
                <div style={{padding:"10px 16px",background:"#0e0e0e",color:"#e84040",fontSize:13,fontWeight:700,borderBottom:"1px solid #1a1a1a",display:"flex",justifyContent:"space-between"}}>
                  <span>🗑️ Sampah ({disampah.length})</span>
                  <button onClick={()=>setLihatSampah(false)} style={{background:"none",border:"none",color:"#555",cursor:"pointer"}}>Tutup</button>
                </div>
                <div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:10}}>
                  {disampah.map(n=>(
                    <div key={n.id} style={{display:"flex",gap:10,alignItems:"center"}}>
                      <div style={{flex:1}}><KartuCatatan c={n} onClick={()=>{}} q=""/></div>
                      <div style={{display:"flex",flexDirection:"column",gap:6}}>
                        <button onClick={()=>pulihkan(n.id)} style={{background:"none",border:"1px solid #2a2a2a",borderRadius:6,color:"#888",padding:"5px 8px",cursor:"pointer",fontSize:11}}>Pulihkan</button>
                        <button onClick={()=>hapusPermanen(n.id)} style={{background:"none",border:"1px solid #5a0e0e",borderRadius:6,color:"#e84040",padding:"5px 8px",cursor:"pointer",fontSize:11}}>Hapus</button>
                      </div>
                    </div>
                  ))}
                  {disampah.length===0&&<div style={{color:"#2a2a2a",textAlign:"center",padding:24}}>Kosong</div>}
                </div>
              </>
            )}

            <div style={{padding:"10px 16px",display:"flex",flexDirection:"column",gap:10}}>
              {difilter.length===0 && (
                <div style={{textAlign:"center",color:t.muted,padding:44,fontSize:14,lineHeight:2}}>
                  {kueri?"Tidak ada hasil":"Belum ada catatan.\nKetuk + untuk mulai."}
                </div>
              )}
              {difilter.map(n=>(
                <KartuCatatan key={n.id} c={n} onClick={c=>setEditCatatan(c)} q={tampilan==="cari"?kueri:""} tema={tema} t={t}/>
              ))}
            </div>
          </div>
        )}

        {tampilan==="kalender" && <TampilKalender catatan={catatan} onBukaCatatan={c=>setEditCatatan(c)} onTambahDiTanggal={ts=>tambahDiTanggal(ts,false)} onSetPengingatTanggal={ts=>tambahDiTanggal(ts,true)} t={t} tema={tema}/>}
        {tampilan==="dzikir"   && <HalamanDzikir catatan={catatan} onBukaCatatan={c=>setEditCatatan(c)} simpanCatatan={simpanCatatan} t={t} tema={tema}/>}
        {tampilan==="tanyaai"  && <HalamanTanyaAI catatan={catatan} isPro={isPro} onGatePro={bukaGatePro} t={t} tema={tema}/>}
        {tampilan==="laporan"  && <HalamanLaporan catatan={catatan} isPro={isPro} onGatePro={bukaGatePro} t={t} tema={tema}/>}
        {tampilan==="insight"  && <HalamanInsight catatan={catatan} isPro={isPro} onGatePro={bukaGatePro} t={t} tema={tema}/>}
        {tampilan==="quran"    && <HalamanQuranRef isPro={isPro} onGatePro={bukaGatePro} t={t} tema={tema}/>}

        {tampilan==="menu" && (
          <div style={{padding:16}}>
            <div style={{background:t.kartu,border:`1px solid ${t.border}`,borderRadius:14,padding:16,marginBottom:12,display:"flex",alignItems:"center",gap:14}}>
              <div style={{width:46,height:46,borderRadius:"50%",background:t.input,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>
                {settings.namaPengguna?settings.namaPengguna[0].toUpperCase():"👤"}
              </div>
              <div>
                <div style={{color:t.teks,fontSize:15,fontWeight:600}}>{settings.namaPengguna||"Pengguna KapurPad"}</div>
                <div style={{color:"#3d9de8",fontSize:12,marginTop:2,cursor:"pointer"}} onClick={()=>setShowSettings(true)}>
                  Edit profil & pengaturan →
                </div>
              </div>
            </div>

            {isPro ? (
              <div style={{background:"linear-gradient(135deg,#191200,#0e0e0e)",border:"1px solid #f5c84244",borderRadius:14,padding:16,marginBottom:12,display:"flex",alignItems:"center",gap:12}}>
                <span style={{fontSize:28}}>👑</span>
                <div>
                  <div style={{color:"#f5c842",fontWeight:800,fontSize:15}}>KapurPad Pro · Lifetime</div>
                  <div style={{color:"#8a7a3a",fontSize:12,marginTop:2}}>Terima kasih sudah mendukung KapurPad! 🙏</div>
                </div>
                <div style={{marginLeft:"auto",fontSize:18}}>✅</div>
              </div>
            ) : (
              <div onClick={()=>setModalPro(true)} style={{background:"linear-gradient(135deg,#191200,#0e0e0e)",border:"1px solid #f5c84233",borderRadius:14,padding:16,marginBottom:12,cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
                <span style={{fontSize:28}}>👑</span>
                <div>
                  <div style={{color:"#f5c842",fontWeight:800,fontSize:15}}>KapurPad Pro — Rp 25.000</div>
                  <div style={{color:"#555",fontSize:12,marginTop:2}}>Sekali bayar, selamanya · Folder, AI, Laporan & lebih</div>
                </div>
                <div style={{marginLeft:"auto",color:"#f5c842",fontSize:20}}>›</div>
              </div>
            )}

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:12}}>
              {[
                {ikon:"📋",lab:"Semua",     aksi:()=>{setTampilan("catatan");setLihatArsip(false);setLihatSampah(false);}},
                {ikon:"📦",lab:"Arsip",     aksi:()=>{setTampilan("catatan");setLihatArsip(true);setLihatSampah(false);}},
                {ikon:"🗑️",lab:"Sampah",   aksi:()=>{setTampilan("catatan");setLihatSampah(true);setLihatArsip(false);}},
                {ikon:"💬",lab:"Tanya AI",  aksi:()=>setTampilan("tanyaai")},
                {ikon:"📊",lab:"Laporan",   aksi:()=>setTampilan("laporan")},
                {ikon:"📁",lab:"Folder",    aksi:()=>{
                  if(!isPro){bukaGatePro("Folder & Kategori tersedia untuk pengguna Pro 📁");return;}
                  setEditFolderObj(null);setModalFolder(true);
                }},
                {ikon:"🧠",lab:"Insight AI",aksi:()=>{ if(!isPro){bukaGatePro("AI Weekly Insight tersedia untuk pengguna Pro 🧠");return;} setTampilan("insight"); }},
                {ikon:"📖",lab:"Ayat & Hadits",aksi:()=>{ if(!isPro){bukaGatePro("Referensi Quran/Hadits tersedia untuk pengguna Pro 📖");return;} setTampilan("quran"); }},
                {ikon:"🎙️",lab:"Voice → Catatan",aksi:()=>{ if(!isPro){bukaGatePro("Voice → Catatan tersedia untuk pengguna Pro 🎙️");return;} setModalVoice(true); }},
                {ikon:"📷",lab:"Scan → Catatan",aksi:()=>{ if(!isPro){bukaGatePro("Scan → Catatan (OCR) tersedia untuk pengguna Pro 📷");return;} setModalOCR(true); }},
            {ikon:"⚡",lab:"Template",  aksi:()=>setModalTmpl(true)},
                {ikon:"⚙️",lab:"Pengaturan",aksi:()=>setShowSettings(true)},
                {ikon:"📤",lab:"Ekspor",    aksi:()=>{
                  const d=JSON.stringify(catatan,null,2);
                  const b=new Blob([d],{type:"application/json"});
                  const u=URL.createObjectURL(b);
                  const a=document.createElement("a");
                  a.href=u;a.download=`kapurpad_${Date.now()}.json`;a.click();
                  URL.revokeObjectURL(u);
                  tampilNotif("📤 Data diekspor!");
                }},
              ].map(m=>(
                <button key={m.lab} onClick={m.aksi}
                  style={{background:t.kartu,border:`1px solid ${t.border}`,borderRadius:12,padding:"16px 8px",display:"flex",flexDirection:"column",alignItems:"center",gap:8,cursor:"pointer",color:t.teks}}>
                  <span style={{fontSize:22}}>{m.ikon}</span>
                  <span style={{fontSize:11,color:t.subteks,textAlign:"center"}}>{m.lab}</span>
                </button>
              ))}
            </div>

            <PanelSmartReminder catatan={catatan} isPro={isPro} onGatePro={bukaGatePro} t={t} tema={tema}/>

            <div style={{background:t.kartu,border:`1px solid ${t.border}`,borderRadius:14,padding:16,marginBottom:12}}>
              <div style={{color:t.subteks,fontSize:11,fontWeight:700,marginBottom:12,letterSpacing:1}}>STATISTIK</div>
              <div style={{display:"flex",justifyContent:"space-around"}}>
                {[
                  {n:catatan.filter(c=>!c.arsip&&!c.hapus).length, lab:"Catatan", w:"#f5c842"},
                  {n:catatan.filter(c=>c.tipe==="ceklis").length,   lab:"Ceklis",  w:"#34c776"},
                  {n:diarsip.length,                                 lab:"Arsip",   w:"#3d9de8"},
                  {n:catatan.filter(c=>c.pengingat).length,          lab:"Ingatkan",w:"#e88530"},
                ].map(s=>(
                  <div key={s.lab} style={{textAlign:"center"}}>
                    <div style={{fontSize:24,fontWeight:800,color:s.w}}>{s.n}</div>
                    <div style={{fontSize:11,color:"#3a3a3a"}}>{s.lab}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{background:t.kartu,border:`1px solid ${t.border}`,borderRadius:14,padding:16}}>
              <div style={{color:t.subteks,fontSize:11,fontWeight:700,marginBottom:12,letterSpacing:1}}>MOOD CATATAN</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {MOOD.map(m=>{
                  const n=catatan.filter(c=>!c.arsip&&!c.hapus&&c.mood===m.id).length;
                  return n>0?(
                    <div key={m.id} style={{display:"flex",alignItems:"center",gap:5,background:m.warna+"18",border:`1px solid ${m.warna}33`,borderRadius:20,padding:"5px 12px"}}>
                      <span style={{fontSize:13}}>{m.ikon}</span>
                      <span style={{fontSize:12,color:m.warna,fontWeight:600}}>{n}</span>
                      <span style={{fontSize:11,color:"#444"}}>{m.label}</span>
                    </div>
                  ):null;
                })}
                {catatan.filter(c=>!c.arsip&&!c.hapus&&c.mood).length===0&&(
                  <div style={{color:"#333",fontSize:12}}>Belum ada catatan bermoood</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FAB */}
      {(tampilan==="catatan"||tampilan==="cari"||tampilan==="kalender"||tampilan==="dzikir") && (
        <button onClick={()=>setMenuTambah(!menuTambah)}
          style={{position:"fixed",bottom:72,right:16,width:52,height:52,borderRadius:14,
            background:tema.aksen,border:"none",color:"#000",fontSize:26,cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",
            boxShadow:`0 4px 20px ${tema.aksen}55`,zIndex:60,
            transform:menuTambah?"rotate(45deg)":"rotate(0)",transition:"transform .2s"}}>
          +
        </button>
      )}
      {menuTambah && (
        <div style={{position:"fixed",bottom:136,right:16,background:"#161616",border:"1px solid #242424",borderRadius:14,overflow:"hidden",zIndex:70,minWidth:200,boxShadow:"0 8px 30px #000b"}}>
          <div style={{padding:"10px 16px",color:"#3a3a3a",fontSize:11,fontWeight:700,letterSpacing:1}}>TAMBAH CATATAN</div>
          {[
            {ikon:"📝",lab:"Teks biasa",    aksi:()=>{setTipeBaru("teks");setSedangBuat(true);setMenuTambah(false);}},
            {ikon:"☑️",lab:"Daftar ceklis", aksi:()=>{setTipeBaru("ceklis");setSedangBuat(true);setMenuTambah(false);}},
            {ikon:"🎙️",lab:"Voice → Catatan", aksi:()=>{setMenuTambah(false); if(!isPro){bukaGatePro("Voice → Catatan tersedia untuk pengguna Pro 🎙️");return;} setModalVoice(true);}},
            {ikon:"📷",lab:"Scan → Catatan",  aksi:()=>{setMenuTambah(false); if(!isPro){bukaGatePro("Scan → Catatan (OCR) tersedia untuk pengguna Pro 📷");return;} setModalOCR(true);}},
            {ikon:"⚡",lab:"Dari template", aksi:()=>{setMenuTambah(false);setModalTmpl(true);}},
          ].map(b=>(
            <button key={b.lab} onClick={b.aksi}
              style={{display:"flex",alignItems:"center",gap:12,width:"100%",padding:"13px 16px",background:"none",border:"none",color:"#ccc",cursor:"pointer",fontSize:14,borderTop:"1px solid #1e1e1e"}}>
              {b.ikon} {b.lab}
            </button>
          ))}
        </div>
      )}

      {/* BOTTOM NAV */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,
        background:t.nav,borderTop:`1px solid ${t.border}`,display:"flex",justifyContent:"space-around",padding:"8px 0",zIndex:50}}>
        {[
          {ikon:"📋",lab:"Catatan",  key:"catatan"},
          {ikon:"📅",lab:"Kalender", key:"kalender"},
          {ikon:"📿",lab:"Dzikir",   key:"dzikir"},
          {ikon:"🔍",lab:"Cari",     key:"cari"},
          {ikon:"☰", lab:"Menu",     key:"menu"},
        ].map(nav=>(
          <button key={nav.key} onClick={()=>{
            if (nav.key==="ingatkan") {
              const ada=catatan.filter(n=>n.pengingat&&!n.hapus&&!n.arsip);
              tampilNotif(ada.length>0?`🔔 ${ada.length} pengingat aktif`:"Tidak ada pengingat aktif");
              return; // tab Ingatkan sudah dihapus dari nav, referensi ini aman ditinggal
            }
            setTampilan(nav.key);setMenuTambah(false);
            if(nav.key!=="cari") setKueri("");
          }}
          style={{background:"none",border:"none",display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer",padding:"4px 8px",
            color:tampilan===nav.key?tema.aksen:t.muted,transition:"color .15s"}}>
            <span style={{fontSize:20}}>{nav.ikon}</span>
            <span style={{fontSize:10}}>{nav.lab}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
