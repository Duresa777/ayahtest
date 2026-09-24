// ==========================================
// 1. FIREBASE SETUP & AUTHENTICATION
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB09KBdCHM0MQwK2Vz7T_28e--JWQGMVSc",
    authDomain: "ayah-looper-8563b.firebaseapp.com",
    projectId: "ayah-looper-8563b",
    storageBucket: "ayah-looper-8563b.firebasestorage.app",
    messagingSenderId: "178011354050",
    appId: "1:178011354050:web:bb39bb0860be52e0d0dc5b"
};

// Boot up the Cloud Tools
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
window.db = getFirestore(app); // Attached to window so our save/load functions can reach it later
const provider = new GoogleAuthProvider();

// Track who is logged in
window.currentUser = null;

const authBtn = document.getElementById('authBtn'); // Top bar sign IN
const signOutSettingsBtn = document.getElementById('signOutSettingsBtn'); // Settings sign OUT
const emptyPlayerState = document.getElementById('emptyPlayerState');

// Wire up the TOP BAR button (Only signs IN)
if (authBtn) {
    authBtn.addEventListener('click', () => {
        signInWithPopup(auth, provider).catch(err => {
            alert("Error: " + err.message);
            console.error("Full Firebase Error:", err);
        });
    });
}

// Wire up the SETTINGS button (Only signs OUT)
if (signOutSettingsBtn) {
    signOutSettingsBtn.addEventListener('click', () => {
        signOut(auth).then(() => {
            document.getElementById('settingsModal').classList.remove('show');
        }).catch(err => alert("Error logging out."));
    });
}

// Dynamic UI Updates based on Auth State
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.currentUser = user;

        // HIDE top button, SHOW settings button
        if (authBtn) authBtn.style.display = 'none';
        if (signOutSettingsBtn) {
            signOutSettingsBtn.style.display = 'flex';
            // Cute touch: Show their name/email inside the button!
            signOutSettingsBtn.querySelector('span').innerText = `Sign Out (${user.email.split('@')[0]})`;
        }

        console.log("Logged in as:", user.email);

        if (typeof loadCutsFromPhone === 'function') {
            loadCutsFromPhone();
        }
    } else {
        window.currentUser = null;

        // SHOW top button, HIDE settings button
        if (authBtn) authBtn.style.display = 'flex';
        if (signOutSettingsBtn) signOutSettingsBtn.style.display = 'none';

        console.log("User logged out.");
    }
});

// ==========================================
// 2. EXISTING AYAH LOOPER LOGIC
// ==========================================

// ==========================================
// SETTINGS MODAL LOGIC
// ==========================================
const settingsModal = document.getElementById('settingsModal');
const settingsBtn = document.getElementById('settingsBtn');
const closeSettingsModalBtn = document.getElementById('closeSettingsModalBtn');

if (settingsBtn && settingsModal) {
    settingsBtn.addEventListener('click', () => settingsModal.classList.add('show'));
    closeSettingsModalBtn.addEventListener('click', () => settingsModal.classList.remove('show'));
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) settingsModal.classList.remove('show');
    });
}

// ==========================================
// CUTE AUTH PROMPT LOGIC
// ==========================================
const authPromptModal = document.getElementById('authPromptModal');
const closeAuthPromptBtn = document.getElementById('closeAuthPromptBtn');
const promptSkipBtn = document.getElementById('promptSkipBtn');
const promptSignInBtn = document.getElementById('promptSignInBtn');

function dismissAuthPrompt() {
    authPromptModal.classList.remove('show');
}

if (authPromptModal) {
    closeAuthPromptBtn.addEventListener('click', dismissAuthPrompt);
    promptSkipBtn.addEventListener('click', dismissAuthPrompt);

    // Clicking outside the modal closes it
    authPromptModal.addEventListener('click', (e) => {
        if (e.target === authPromptModal) dismissAuthPrompt();
    });

    // Wire up the Google button inside the prompt
    promptSignInBtn.addEventListener('click', () => {
        dismissAuthPrompt();
        if (!window.currentUser) {
            signInWithPopup(auth, provider).catch(err => alert("Error: " + err.message));
        }
    });
}

// The function to trigger the popup, exposed for the inline library script too
window.checkAndShowAuthPrompt = function checkAndShowAuthPrompt() {
    // Only show if NOT logged in, and we haven't asked them before
    if (!window.currentUser && !localStorage.getItem('ayah_auth_prompted')) {
        setTimeout(() => {
            authPromptModal.classList.add('show');
            localStorage.setItem('ayah_auth_prompted', 'true');
        }, 1500); // Wait 1.5 seconds after video loads so it feels natural
    }
};

// ==========================================
// TRANSLATION ENGINE & LANGUAGE MODAL
// ==========================================
const langModal = document.getElementById('langModal');
const langBtn = document.getElementById('langBtn');
const closeLangModalBtn = document.getElementById('closeLangModalBtn');

// Open/Close Modal
if (langBtn && langModal) {
    langBtn.addEventListener('click', () => langModal.classList.add('show'));
    closeLangModalBtn.addEventListener('click', () => langModal.classList.remove('show'));
    langModal.addEventListener('click', (e) => {
        if (e.target === langModal) langModal.classList.remove('show');
    });
}

const dictionary = {
    en: {
        langTitle: "Select Language", support: "Support", signIn: "Sign In",
        emptyTitle: "Player is empty", emptySub: "Upload a file or pick a Surah from the library!",
        theme: "Toggle Theme", pip: "Mini Player (PiP)", shortcuts: "Keyboard Shortcuts",
        faq: "Help & FAQ", signOut: "Sign Out", uploadText: "Tap to upload a video or audio file",
        libraryBtn: "Library",
        cutBtn: "Cut", loopBtn: "Loop", nextBtn: "Next", prevBtn: "Previous",

        // NEW ADVANCED CONTROLS
        startLooping: "Start Looping",
        secText: "sec",
        pauseText: ":Pause",
        speedText: "Speed",
        importCuts: "Import Cuts",
        exportCuts: "Export Cuts",
        instructionText: "Play the audio, then click 'Cut' or press 'C' to slice Ayahs.",

        // FAQ PAGE TRANSLATIONS
        backBtn: "Back",
        faqTitle: "FAQ & Help",
        faqSub: "Everything you need to know about Ayah Looper.",
        q1: "What is Ayah Looper?",
        a1: "Ayah Looper is a free web application designed to help with Hifz (Quran memorization). It allows you to select specific reciters, slice audio tracks into individual Ayahs, and loop them continuously with custom pauses in between.",
        q2: "How do I save my audio cuts?",
        a2: "Your cuts are automatically saved to your browser's local memory. The next time you upload the same file or load the same Surah from the library, your cuts will still be there! For a permanent backup, you can click the <strong>Export Cuts</strong> button to download a `.json` file, which you can load later using the Import button.",
        q3: "Can I use the app while studying or working?",
        a3: "Yes! If you are on a desktop browser that supports it, click the <strong>Mini-Player</strong> icon (the square icon in the top right of the main app). This will pop out a small, frameless player that stays perfectly on top of all your other windows while you study.",
        q4: "What does the \"Loop Delay\" do?",
        a4: "When memorizing, it's helpful to listen to an Ayah, and then recite it yourself before the audio plays again. By setting the Loop Delay to 3 or 4 seconds, the app will pause silently between each loop, giving you time to repeat the verse out loud.",
        q5: "Can I upload my own MP3s?",
        a5: "Absolutely. While we provide a free library of famous reciters, you can upload any audio (`.mp3`) or video (`.mp4`) file from your device into the app, and the slicer/looper tools will work perfectly.",
        q6: "Who created Ayah Looper?",
        a6: "This project was created and designed by <strong>Duresa Haji</strong>. If you found it helpful, you can support the development by following the official Instagram account at <a href=\"https://instagram.com/ayahloopcom\" target=\"_blank\">@ayahloopcom</a>."
    },
    ar: {
        langTitle: "اختر اللغة", support: "الدعم", signIn: "تسجيل الدخول",
        emptyTitle: "المشغل فارغ", emptySub: "قم بتحميل ملف أو اختر سورة من المكتبة!",
        theme: "تبديل المظهر", pip: "المشغل المصغر", shortcuts: "اختصارات لوحة المفاتيح",
        faq: "المساعدة والأسئلة الشائعة", signOut: "تسجيل الخروج", uploadText: "اضغط لتحميل ملف فيديو أو صوت",
        libraryBtn: "المكتبة",
        cutBtn: "قص", loopBtn: "تكرار", nextBtn: "التالي", prevBtn: "السابق",

        // NEW ADVANCED CONTROLS
        startLooping: "بدء التكرار",
        secText: "ثانية",
        pauseText: "إيقاف مؤقت:",
        speedText: "السرعة",
        importCuts: "استيراد المقاطع",
        exportCuts: "تصدير المقاطع",
        instructionText: "قم بتشغيل الصوت، ثم انقر على 'قص' أو اضغط 'C' لتقطيع الآيات.",

        // FAQ PAGE TRANSLATIONS
        backBtn: "رجوع",
        faqTitle: "الأسئلة الشائعة والمساعدة",
        faqSub: "كل ما تحتاج معرفته عن Ayah Looper.",
        q1: "ما هو Ayah Looper؟",
        a1: "تطبيق Ayah Looper هو تطبيق ويب مجاني مصمم للمساعدة في الحفظ (حفظ القرآن). يتيح لك اختيار قراء محددين، وتقطيع المسارات الصوتية إلى آيات فردية، وتكرارها باستمرار مع فترات توقف مخصصة بينها.",
        q2: "كيف يمكنني حفظ المقاطع الصوتية؟",
        a2: "يتم حفظ مقاطعك تلقائيًا في الذاكرة المحلية لمتصفحك. في المرة القادمة التي تقوم فيها بتحميل نفس الملف أو السورة من المكتبة، ستجد مقاطعك كما هي! للحصول على نسخة احتياطية دائمة، يمكنك النقر على زر <strong>'تصدير المقاطع'</strong> لتنزيل ملف بصيغة `.json`، والذي يمكنك تحميله لاحقًا باستخدام زر 'استيراد'.",
        q3: "هل يمكنني استخدام التطبيق أثناء الدراسة أو العمل؟",
        a3: "نعم! إذا كنت تستخدم متصفح سطح مكتب يدعم ذلك، انقر على أيقونة <strong>المشغل المصغر</strong> (المربع في أعلى يمين التطبيق الأساسي). سيؤدي ذلك إلى ظهور مشغل صغير بدون إطار يظل فوق جميع النوافذ الأخرى أثناء دراستك.",
        q4: "ما هي وظيفة \"تأخير التكرار\"؟",
        a4: "عند الحفظ، من المفيد الاستماع إلى الآية، ثم تلاوتها بنفسك قبل تشغيل الصوت مرة أخرى. من خلال ضبط 'تأخير التكرار' على 3 أو 4 ثوانٍ، سيتوقف التطبيق بصمت بين كل تكرار، مما يمنحك وقتًا لتكرار الآية بصوت عالٍ.",
        q5: "هل يمكنني تحميل ملفات MP3 الخاصة بي؟",
        a5: "بالتأكيد. بينما نوفر مكتبة مجانية لأشهر القراء، يمكنك تحميل أي ملف صوتي (`.mp3`) أو فيديو (`.mp4`) من جهازك إلى التطبيق، وستعمل أدوات التقطيع/التكرار بشكل مثالي.",
        q6: "من قام بإنشاء Ayah Looper؟",
        a6: "تم إنشاء وتصميم هذا المشروع بواسطة <strong>Duresa Haji</strong>. إذا وجدته مفيدًا، يمكنك دعم التطوير من خلال متابعة الحساب الرسمي على إنستغرام <a href=\"https://instagram.com/ayahloopcom\" target=\"_blank\">@ayahloopcom</a>."
    },
    ur: {
        langTitle: "زبان منتخب کریں", support: "تعاون", signIn: "سائن ان کریں",
        emptyTitle: "پلیئر خالی ہے", emptySub: "کوئی فائل اپ لوڈ کریں یا لائبریری سے سورہ منتخب کریں!",
        theme: "تھیم تبدیل کریں", pip: "منی پلیئر", shortcuts: "کی بورڈ شارٹ کٹس",
        faq: "مدد اور عمومی سوالات", signOut: "سائن آؤٹ", uploadText: "ویڈیو یا آڈیو فائل اپ لوڈ کرنے کے لیے تھپتھپائیں",
        libraryBtn: "لائبریری",
        cutBtn: "کاٹیں", loopBtn: "لوپ", nextBtn: "اگلا", prevBtn: "پچھلا"
    },
    id: {
        langTitle: "Pilih Bahasa", support: "Dukungan", signIn: "Masuk",
        emptyTitle: "Pemutar kosong", emptySub: "Unggah file atau pilih Surah dari perpustakaan!",
        theme: "Ganti Tema", pip: "Pemutar Mini", shortcuts: "Pintasan Keyboard",
        faq: "Bantuan & FAQ", signOut: "Keluar", uploadText: "Ketuk untuk mengunggah video atau audio",
        libraryBtn: "Perpustakaan",
        cutBtn: "Potong", loopBtn: "Ulang", nextBtn: "Berikutnya", prevBtn: "Sebelumnya"
    },
    tr: {
        langTitle: "Dil Seçin", support: "Destek", signIn: "Giriş Yap",
        emptyTitle: "Oynatıcı boş", emptySub: "Bir dosya yükleyin veya kütüphaneden bir Sure seçin!",
        theme: "Temayı Değiştir", pip: "Mini Oynatıcı", shortcuts: "Klavye Kısayolları",
        faq: "Yardım ve SSS", signOut: "Çıkış Yap", uploadText: "Video veya ses dosyası yüklemek için dokunun",
        libraryBtn: "Kütüphane",
        cutBtn: "Kes", loopBtn: "Döngü", nextBtn: "Sonraki", prevBtn: "Önceki"
    },
    fr: {
        langTitle: "Choisir la langue", support: "Soutien", signIn: "Se connecter",
        emptyTitle: "Le lecteur est vide", emptySub: "Téléchargez un fichier ou choisissez une sourate !",
        theme: "Changer de thème", pip: "Mini Lecteur", shortcuts: "Raccourcis clavier",
        faq: "Aide et FAQ", signOut: "Se déconnecter", uploadText: "Appuyez pour télécharger une vidéo ou un audio",
        libraryBtn: "Bibliothèque",
        cutBtn: "Couper", loopBtn: "Boucle", nextBtn: "Suivant", prevBtn: "Précédent"
    },
    es: {
        langTitle: "Seleccionar Idioma", support: "Soporte", signIn: "Iniciar sesión",
        emptyTitle: "El reproductor está vacío", emptySub: "¡Sube un archivo o elige una sura!",
        theme: "Cambiar Tema", pip: "Mini Reproductor", shortcuts: "Atajos de Teclado",
        faq: "Ayuda y FAQ", signOut: "Cerrar sesión", uploadText: "Toca para subir un video o audio",
        libraryBtn: "Biblioteca",
        cutBtn: "Cortar", loopBtn: "Bucle", nextBtn: "Siguiente", prevBtn: "Anterior"
    },
    ru: {
        langTitle: "Выберите язык", support: "Поддержка", signIn: "Войти",
        emptyTitle: "Плеер пуст", emptySub: "Загрузите файл или выберите Суру!",
        theme: "Переключить тему", pip: "Мини-плеер", shortcuts: "Сочетания клавиш",
        faq: "Помощь и FAQ", signOut: "Выйти", uploadText: "Нажмите, чтобы загрузить видео или аудио",
        libraryBtn: "Библиотека",
        cutBtn: "Обрезать", loopBtn: "Цикл", nextBtn: "Следующий", prevBtn: "Предыдущий"
    },
    bn: {
        langTitle: "ভাষা নির্বাচন করুন", support: "সমর্থন", signIn: "সাইন ইন করুন",
        emptyTitle: "প্লেয়ার খালি", emptySub: "একটি ফাইল আপলোড করুন অথবা একটি সূরা বেছে নিন!",
        theme: "থিম পরিবর্তন করুন", pip: "মিনি প্লেয়ার", shortcuts: "কিবোর্ড শর্টকাট",
        faq: "সাহায্য এবং FAQ", signOut: "সাইন আউট", uploadText: "একটি ভিডিও বা অডিও আপলোড করতে আলতো চাপুন",
        libraryBtn: "লাইব্রেরি",
        cutBtn: "কাটুন", loopBtn: "লুপ", nextBtn: "পরবর্তী", prevBtn: "পূর্ববর্তী"
    },
    hi: {
        langTitle: "भाषा चुनें", support: "सहायता", signIn: "साइन इन करें",
        emptyTitle: "प्लेयर खाली है", emptySub: "कोई फ़ाइल अपलोड करें या कोई सूरह चुनें!",
        theme: "थीम बदलें", pip: "मिनी प्लेयर", shortcuts: "कीबोर्ड शॉर्टकट",
        faq: "सहायता और सामान्य प्रश्न", signOut: "साइन आउट", uploadText: "वीडियो या ऑडियो अपलोड करने के लिए टैप करें",
        libraryBtn: "लाइब्रेरी",
        cutBtn: "काटें", loopBtn: "लूप", nextBtn: "अगला", prevBtn: "पिछला"
    }
};

// Function to apply translation
function changeLanguage(langCode) {
    // Default to English if the dictionary doesn't have the language yet
    const translation = dictionary[langCode] || dictionary['en'];

    // Switch to Right-to-Left (RTL) for Arabic and Urdu
    if (langCode === 'ar' || langCode === 'ur') {
        document.body.setAttribute('dir', 'rtl');
    } else {
        document.body.setAttribute('dir', 'ltr');
    }

    // Find everything with a data-translate tag and swap the text
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        if (translation[key]) {
            el.innerHTML = translation[key];
        }
    });

    localStorage.setItem('ayah_lang', langCode);
    if (langModal) langModal.classList.remove('show');
}

// Wire up the 10 language buttons
document.querySelectorAll('.lang-select').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const selectedLang = e.target.getAttribute('data-lang');
        changeLanguage(selectedLang);
    });
});

// Load saved language on startup
const savedLang = localStorage.getItem('ayah_lang') || 'en';
changeLanguage(savedLang);

const video = document.getElementById('quranVideo');
const videoUpload = document.getElementById('videoUpload');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const statusText = document.getElementById('statusText');
const markCutBtn = document.getElementById('markCutBtn');
const toggleLoopBtn = document.getElementById('toggleLoopBtn');
const sliceList = document.getElementById('sliceList');
const loopDelayInput = document.getElementById('loopDelay');

const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importInput = document.getElementById('importInput');

// NEW: Tajweed Mode Button
const speedBtn = document.getElementById('speedBtn');

let slices = [];
let currentSliceIndex = 0;
let lastCutTime = 0.0;
let isLooping = false; 
let loopTimeout = null; 

// NEW: Dynamic Memory Key (Surah-Specific Saving)
let currentFileKey = 'savedQuranCuts_default'; 

// Auto-detect if we loaded a Surah from the library on page load
const urlParams = new URLSearchParams(window.location.search);
const passedTitle = urlParams.get('title');
if (passedTitle) {
    // Strip spaces to make a clean database key (e.g., "ayahLooper_Al-Mulk")
    currentFileKey = `ayahLooper_${passedTitle.replace(/\s+/g, '_')}`;
    setTimeout(() => loadCutsFromPhone(), 200); // Auto-load previously saved cuts!
}

async function saveCutsToPhone() {
    // Still save locally for offline use
    localStorage.setItem(currentFileKey, JSON.stringify(slices));

    // Push to the Cloud!
    if (window.currentUser && window.db) {
        try {
            const docRef = doc(window.db, "users", window.currentUser.uid, "cuts", currentFileKey);
            await setDoc(docRef, {
                savedSlices: slices,
                savedLastTime: lastCutTime
            });
            console.log(`☁️ Synced ${currentFileKey} to Firebase!`);
        } catch (err) {
            console.error("Error saving to cloud:", err);
        }
    }
}

async function loadCutsFromPhone() {
    // Check Cloud first if logged in
    if (window.currentUser && window.db) {
        try {
            const docRef = doc(window.db, "users", window.currentUser.uid, "cuts", currentFileKey);
            const cloudData = await getDoc(docRef);

            if (cloudData.exists()) {
                const data = cloudData.data();
                slices = data.savedSlices || [];
                lastCutTime = data.savedLastTime || 0.0;
                renderSlices();
                statusText.innerHTML = `☁️ Loaded ${slices.length} saved cuts from the cloud!`;
                console.log(`☁️ Loaded ${currentFileKey} from Firebase!`);
                return; // Stop here, we got the cloud data!
            }
        } catch (err) {
            console.error("Error loading from cloud:", err);
        }
    }

    // Fallback to Local Storage if offline or no cloud data exists yet
    const savedData = localStorage.getItem(currentFileKey);
    if (savedData) {
        slices = JSON.parse(savedData);
        renderSlices();
        if (slices.length > 0) {
            lastCutTime = slices[slices.length - 1].end;
        }
        statusText.innerHTML = `✅ Loaded ${slices.length} saved cuts for this Surah!`;
    } else {
        statusText.innerHTML = "Play the audio, then click 'Cut' or press 'C' to slice Ayahs.";
    }
}

// --- NEW: Tajweed Mode (Speed Control) ---
const speeds = [1, 0.75, 0.5];
let currentSpeedIndex = 0;

if (speedBtn) {
    speedBtn.addEventListener('click', () => {
        currentSpeedIndex = (currentSpeedIndex + 1) % speeds.length;
        const newSpeed = speeds[currentSpeedIndex];
        video.playbackRate = newSpeed;
        speedBtn.innerHTML = `<i class="ph-bold ph-gauge"></i> ${newSpeed}x Speed`;
    });
}

exportBtn.addEventListener('click', () => {
    if (slices.length === 0) {
        alert("You don't have any cuts to export yet!");
        return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(slices, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    // Name the export file based on the Surah!
    downloadAnchorNode.setAttribute("download", `${currentFileKey}.json`);
    document.body.appendChild(downloadAnchorNode); 
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
});

importBtn.addEventListener('click', () => { importInput.click(); });

importInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedSlices = JSON.parse(e.target.result);
            if (Array.isArray(importedSlices)) {
                slices = importedSlices;
                lastCutTime = slices.length > 0 ? slices[slices.length - 1].end : 0.0;
                saveCutsToPhone();
                renderSlices();
                statusText.innerHTML = `Successfully imported ${slices.length} cuts!`;
            } else {
                alert("This file doesn't look like Ayah Looper cuts.");
            }
        } catch (error) {
            alert("Error reading the file. Make sure it's a valid .json file.");
        }
        importInput.value = ""; 
    };
    reader.readAsText(file);
});

// ==========================================
// EDIT MODAL LOGIC & STATE
// ==========================================
let currentEditIndex = null;
const editModal = document.getElementById('editModal');
const closeEditModalBtn = document.getElementById('closeEditModalBtn');
const editModalTitle = document.getElementById('editModalTitle');
const editStartVal = document.getElementById('editStartVal');
const editEndVal = document.getElementById('editEndVal');
const mergeUpBtn = document.getElementById('mergeUpBtn');
const mergeDownBtn = document.getElementById('mergeDownBtn');

// Close Modal Event
closeEditModalBtn.addEventListener('click', () => editModal.classList.remove('show'));
editModal.addEventListener('click', (e) => {
    if (e.target === editModal) editModal.classList.remove('show');
});

// Helper to refresh the modal's text numbers dynamically
function updateModalUI() {
    if (currentEditIndex === null) return;
    const slice = slices[currentEditIndex];
    editStartVal.innerText = slice.start.toFixed(1);
    editEndVal.innerText = slice.end.toFixed(1);
    
    // Hide/Show merge buttons if they are at the very top or bottom of the list
    mergeUpBtn.style.opacity = currentEditIndex > 0 ? '1' : '0.3';
    mergeUpBtn.style.pointerEvents = currentEditIndex > 0 ? 'auto' : 'none';
    
    mergeDownBtn.style.opacity = currentEditIndex < slices.length - 1 ? '1' : '0.3';
    mergeDownBtn.style.pointerEvents = currentEditIndex < slices.length - 1 ? 'auto' : 'none';
}

// Modal Fine-Tune Logic
function nudgeCutModal(property, amount) {
    if (currentEditIndex === null) return;
    let newValue = slices[currentEditIndex][property] + amount;
    
    // Safety checks to prevent overlapping cuts
    if (property === 'start') {
        if (newValue < 0) newValue = 0;
        if (newValue >= slices[currentEditIndex].end - 0.5) newValue = slices[currentEditIndex].end - 0.5;
    } else if (property === 'end') {
        if (newValue <= slices[currentEditIndex].start + 0.5) newValue = slices[currentEditIndex].start + 0.5;
        if (video.duration && newValue > video.duration) newValue = video.duration;
    }
    
    slices[currentEditIndex][property] = newValue;
    
    if (currentEditIndex === slices.length - 1 && property === 'end') {
        lastCutTime = newValue;
    }
    
    saveCutsToPhone();
    updateModalUI(); // Updates the text in the popup instantly
    renderSlices();  // Updates the list behind the popup
}

// Attach Tune Button Listeners
document.getElementById('editStartMinus').addEventListener('click', () => nudgeCutModal('start', -0.5));
document.getElementById('editStartPlus').addEventListener('click', () => nudgeCutModal('start', 0.5));
document.getElementById('editEndMinus').addEventListener('click', () => nudgeCutModal('end', -0.5));
document.getElementById('editEndPlus').addEventListener('click', () => nudgeCutModal('end', 0.5));

// Attach Merge Button Listeners
mergeUpBtn.addEventListener('click', () => {
    if (currentEditIndex > 0) {
        slices[currentEditIndex - 1].end = slices[currentEditIndex].end;
        slices.splice(currentEditIndex, 1);
        finishMerge();
    }
});

mergeDownBtn.addEventListener('click', () => {
    if (currentEditIndex < slices.length - 1) {
        slices[currentEditIndex].end = slices[currentEditIndex + 1].end;
        slices.splice(currentEditIndex + 1, 1);
        finishMerge();
    }
});

function finishMerge() {
    lastCutTime = slices.length > 0 ? slices[slices.length - 1].end : 0.0;
    saveCutsToPhone();
    renderSlices();
    editModal.classList.remove('show'); // Close modal when done merging
}

// ==========================================
// THE NEW CLEAN RENDER FUNCTION
// ==========================================
function renderSlices() {
    sliceList.innerHTML = ""; 
    
    slices.forEach((slice, index) => {
        slice.id = index + 1; 
        
        const listItem = document.createElement('li');
        listItem.style.display = 'flex';
        listItem.style.justifyContent = 'space-between';
        listItem.style.alignItems = 'center';
        listItem.style.padding = '12px 16px';
        
        // Clean Text Display
        const textSpan = document.createElement('span');
        textSpan.innerHTML = `<strong style="color: var(--primary);">Ayah ${slice.id}</strong> <span style="opacity: 0.6; margin: 0 8px;">|</span> ${slice.start.toFixed(1)}s – ${slice.end.toFixed(1)}s`;
        textSpan.style.fontSize = '0.95rem';
        
        const actionGroup = document.createElement('div');
        actionGroup.style.display = 'flex';
        actionGroup.style.gap = '8px';

        // Clean Edit Button
        const editBtn = document.createElement('button');
        editBtn.innerHTML = '<i class="ph ph-pencil-simple" style="font-size: 1.1rem;"></i> Edit';
        editBtn.style.background = 'var(--secondary)';
        editBtn.style.padding = '8px 12px';
        
        editBtn.addEventListener('click', () => {
            currentEditIndex = index;
            editModalTitle.innerText = `Edit Ayah ${slice.id}`;
            updateModalUI();
            editModal.classList.add('show');
        });

        // Clean Delete Button
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="ph ph-trash" style="font-size: 1.1rem;"></i>';
        deleteBtn.style.background = 'var(--danger)';
        deleteBtn.style.padding = '8px 12px';
        deleteBtn.title = "Delete";
        
        deleteBtn.addEventListener('click', () => {
            slices.splice(index, 1);
            lastCutTime = slices.length > 0 ? slices[slices.length - 1].end : 0.0;
            saveCutsToPhone();
            
            if (isLooping) {
                isLooping = false;
                clearTimeout(loopTimeout);
                loopTimeout = null;
                video.pause();
                toggleLoopBtn.innerHTML = '<i class="ph ph-arrows-clockwise"></i> Start Looping';
                toggleLoopBtn.classList.remove('stop-state');
                prevBtn.disabled = true;
                nextBtn.disabled = true;
            }
            renderSlices();
        });

        actionGroup.appendChild(editBtn);
        actionGroup.appendChild(deleteBtn);
        
        listItem.appendChild(textSpan);
        listItem.appendChild(actionGroup);
        sliceList.appendChild(listItem);
    });
}

videoUpload.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
        // Update the unique key based on the local file name!
        currentFileKey = `ayahLooper_${file.name.replace(/\s+/g, '_')}`;
        video.src = URL.createObjectURL(file);
        if (emptyPlayerState) emptyPlayerState.classList.add('hidden');
        isLooping = false;
        clearTimeout(loopTimeout);
        loopTimeout = null;
        toggleLoopBtn.innerHTML = '<i class="ph ph-arrows-clockwise"></i> Start Looping';
        toggleLoopBtn.classList.remove('stop-state');
        
        // Wipe the array and load any past cuts for this specific file
        slices = [];
        loadCutsFromPhone();
        checkAndShowAuthPrompt();
    }
});

markCutBtn.addEventListener('click', () => {
    const cutTime = video.currentTime;
    if (cutTime <= lastCutTime) return;

    const newSlice = { id: slices.length + 1, start: lastCutTime, end: cutTime };
    slices.push(newSlice); 
    lastCutTime = cutTime; 
    
    saveCutsToPhone(); 
    renderSlices(); 

    // Trigger the tactile scissors animation
    markCutBtn.classList.add('cut-success-animate');
    
    // Provide physical haptic feedback on mobile phones
    if (navigator.vibrate) navigator.vibrate(50);

    // Remove the animation class after 400ms so it is ready for the next cut
    setTimeout(() => { 
        markCutBtn.classList.remove('cut-success-animate'); 
    }, 400); 
});

function getTotalSlicesCount() {
    if (video.duration && lastCutTime < video.duration - 0.5) {
        return slices.length + 1;
    }
    return slices.length;
}

function getActiveSlice() {
    if (slices.length === 0 && currentSliceIndex === 0) {
        if (video.duration) return { id: "Remaining", start: 0, end: video.duration };
        return null;
    }
    
    if (currentSliceIndex < slices.length) {
        return slices[currentSliceIndex];
    } else {
        return {
            id: "Remaining",
            start: lastCutTime,
            end: video.duration || video.currentTime + 1 
        };
    }
}

toggleLoopBtn.addEventListener('click', () => {
    if (!video.src) {
        alert("Please upload a file or load a Surah first!");
        return;
    }
    
    isLooping = !isLooping; 
    
    if (isLooping) {
        toggleLoopBtn.innerHTML = '<i class="ph ph-stop-circle"></i> Stop Looping';
        toggleLoopBtn.classList.add('stop-state');
        currentSliceIndex = 0; 
        
        const active = getActiveSlice();
        if (active) video.currentTime = active.start;
        video.play();
        updateUI();
    } else {
        toggleLoopBtn.innerHTML = '<i class="ph ph-arrows-clockwise"></i> Start Looping';
        toggleLoopBtn.classList.remove('stop-state');
        statusText.textContent = "Looping stopped. You can make more cuts.";
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        
        clearTimeout(loopTimeout);
        loopTimeout = null;
    }
});

video.addEventListener('timeupdate', () => {
    if (!video.src || !isLooping) return; 

    const currentSlice = getActiveSlice();
    if (!currentSlice) return;

    if (video.currentTime >= currentSlice.end) {
        if (loopTimeout) return; 
        
        video.pause();
        
        const delayMs = (parseFloat(loopDelayInput.value) || 0) * 1000;
        
        if (delayMs > 0) {
            statusText.textContent = `Pausing for ${loopDelayInput.value}s...`;
        }

        loopTimeout = setTimeout(() => {
            video.currentTime = currentSlice.start;
            video.play();
            loopTimeout = null; 
            updateUI(); 
        }, delayMs);
    }
});

nextBtn.addEventListener('click', () => {
    const totalSlices = getTotalSlicesCount();
    
    if (currentSliceIndex < totalSlices - 1 && isLooping) {
        clearTimeout(loopTimeout); 
        loopTimeout = null;
        
        currentSliceIndex++;
        const active = getActiveSlice();
        if (active) {
            video.currentTime = active.start;
            video.play();
            updateUI();
        }
    }
});

prevBtn.addEventListener('click', () => {
    if (currentSliceIndex > 0 && isLooping) {
        clearTimeout(loopTimeout);
        loopTimeout = null;
        
        currentSliceIndex--;
        const active = getActiveSlice();
        if (active) {
            video.currentTime = active.start;
            video.play();
            updateUI();
        }
    }
});

function updateUI() {
    const currentSlice = getActiveSlice();
    if (!currentSlice) return;
    
    const totalSlices = getTotalSlicesCount();
    
    statusText.textContent = `Looping ${currentSlice.id === 'Remaining' ? 'Uncut Audio' : 'Ayah ' + currentSlice.id} ( ${currentSlice.start.toFixed(1)}s to ${currentSlice.end.toFixed(1)}s )`;
    
    prevBtn.disabled = currentSliceIndex === 0;
    nextBtn.disabled = currentSliceIndex >= totalSlices - 1;
}

// --- Keyboard Shortcuts ---
document.addEventListener('keydown', (event) => {
    if (event.target.tagName === 'INPUT') return;
    if (!video.src || video.src === window.location.href) return;

    if (event.code === 'Space') {
        event.preventDefault(); 
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    }

    if (event.key.toLowerCase() === 'c') {
        markCutBtn.click();
    }
});

// --- Floating Desktop Mini-Player (Document PiP API) ---
const pipBtn = document.getElementById('pipBtn');

if ('documentPictureInPicture' in window) {
    pipBtn.style.display = 'flex'; 
}

pipBtn.addEventListener('click', async () => {
    if (window.documentPictureInPicture.window) return;

    try {
        const pipWindow = await window.documentPictureInPicture.requestWindow({
            width: 320,
            height: 240
        });

        [...document.styleSheets].forEach((styleSheet) => {
            try {
                const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
                const style = document.createElement('style');
                style.textContent = cssRules;
                pipWindow.document.head.appendChild(style);
            } catch (e) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.type = styleSheet.type;
                link.media = styleSheet.media;
                link.href = styleSheet.href;
                pipWindow.document.head.appendChild(link);
            }
        });

        const script = document.createElement('script');
        script.src = "https://unpkg.com/@phosphor-icons/web";
        pipWindow.document.head.appendChild(script);

        pipWindow.document.body.className = document.body.className;
        const titleText = document.getElementById('displayTitle') ? document.getElementById('displayTitle').innerText : 'Ayah Looper';

        pipWindow.document.body.innerHTML = `
            <div style="height: 100vh; width: 100vw; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--bg-color); color: var(--text-main); font-family: 'Poppins', sans-serif; padding: 20px; margin: 0;">
                <div style="background: var(--surface); width: 100%; padding: 20px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid var(--border-color); display: flex; flex-direction: column; align-items: center; gap: 15px;">
                    <div style="text-align: center;">
                        <h3 id="pipTitle" style="margin: 0 0 5px 0; font-size: 1.1rem; color: var(--text-main);">${titleText}</h3>
                        <p id="pipStatus" style="margin: 0; font-size: 0.75rem; color: var(--text-muted); line-height: 1.3;">${statusText.textContent}</p>
                    </div>
                    <div style="display: flex; gap: 15px; align-items: center; margin-top: 5px;">
                        <button id="pipPrev" style="background: var(--secondary); border: none; width: 45px; height: 45px; border-radius: 50%; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.2s;">
                            <i class="ph-fill ph-skip-back" style="font-size: 1.2rem;"></i>
                        </button>
                        <button id="pipPlay" style="background: var(--primary); border: none; width: 60px; height: 60px; border-radius: 50%; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(163, 130, 90, 0.3); transition: transform 0.2s;">
                            <i class="ph-fill ${video.paused ? 'ph-play' : 'ph-pause'}" style="font-size: 1.8rem;"></i>
                        </button>
                        <button id="pipNext" style="background: var(--secondary); border: none; width: 45px; height: 45px; border-radius: 50%; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.2s;">
                            <i class="ph-fill ph-skip-forward" style="font-size: 1.2rem;"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        const pipPlay = pipWindow.document.getElementById('pipPlay');
        const pipPrev = pipWindow.document.getElementById('pipPrev');
        const pipNext = pipWindow.document.getElementById('pipNext');
        const pipStatus = pipWindow.document.getElementById('pipStatus');

        pipPlay.addEventListener('click', () => {
            if (video.paused) video.play();
            else video.pause();
        });

        pipPrev.addEventListener('click', () => { prevBtn.click(); });
        pipNext.addEventListener('click', () => { nextBtn.click(); });

        [pipPlay, pipPrev, pipNext].forEach(btn => {
            btn.addEventListener('mousedown', () => btn.style.transform = 'scale(0.9)');
            btn.addEventListener('mouseup', () => btn.style.transform = 'scale(1)');
            btn.addEventListener('mouseleave', () => btn.style.transform = 'scale(1)');
        });

        const updatePipPlayState = () => {
            pipPlay.innerHTML = `<i class="ph-fill ${video.paused ? 'ph-play' : 'ph-pause'}" style="font-size: 1.8rem;"></i>`;
        };
        video.addEventListener('play', updatePipPlayState);
        video.addEventListener('pause', updatePipPlayState);

        const observer = new MutationObserver(() => {
            pipStatus.textContent = statusText.textContent;
        });
        observer.observe(statusText, { childList: true, characterData: true, subtree: true });

        pipWindow.addEventListener('pagehide', () => {
            video.removeEventListener('play', updatePipPlayState);
            video.removeEventListener('pause', updatePipPlayState);
            observer.disconnect();
        });
    } catch (err) {
        console.error('Failed to open PiP window:', err);
    }
});

// --- Initialize PWA Service Worker ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker registered successfully!'))
            .catch(err => console.error('Service Worker registration failed:', err));
    });
}

// Trigger the cinematic animation when the page loads
/* 
window.addEventListener('load', () => {
    const cinematic = document.getElementById('cinematicOverlay');
    if (cinematic) {
        cinematic.classList.add('active');

        setTimeout(() => {
            cinematic.classList.remove('active');
        }, 6000);
    } else {
        console.error("Animation Error: Could not find the cinematicOverlay HTML!");
    }
});
*/

// ==========================================
// THEME ENGINE
// ==========================================
const themeSwatches = document.querySelectorAll('.theme-swatch');

function applyTheme(themeName) {
    // Set the data-theme attribute on the HTML tag
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('ayah_theme', themeName);

    // Update the active ring around the selected swatch
    themeSwatches.forEach(swatch => {
        if (swatch.getAttribute('data-set-theme') === themeName) {
            swatch.classList.add('active');
        } else {
            swatch.classList.remove('active');
        }
    });
}

// Listen for clicks on the colored circles
themeSwatches.forEach(swatch => {
    swatch.addEventListener('click', (e) => {
        const selectedTheme = e.target.getAttribute('data-set-theme');
        applyTheme(selectedTheme);
    });
});

// Load the saved theme on startup (defaults to coffee)
const savedTheme = localStorage.getItem('ayah_theme') || 'coffee';
applyTheme(savedTheme);