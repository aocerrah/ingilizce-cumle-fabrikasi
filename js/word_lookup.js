/**
 * Interactive Word & Multi-Word Phrase Lookup & Dictionary Engine
 * (İnteraktif Kelime, Deyim, Phrasal Verb & Birleşik İfade Sözlük Motoru)
 * 
 * Features:
 * - 🧠 Multi-Word Phrase & Phrasal Verb Tokenizer: Detects compound words, idioms,
 *      conjunctions, and phrasal verbs as unified interactive units (e.g. "in terms of",
 *      "well-structured", "look forward to", "school year", "personal growth", "as well as").
 * - 🔗 Unified Pronunciation & Meaning: Pronounces and translates multi-word phrases together.
 * - 📖 Part of Speech (Kelime Türü), Turkish Meaning, Root/Lemma & Pronunciation.
 * - ⭐ 1-Click "Kelime Defterime Ekle" (Add to Vocabulary Notebook) with XP rewards.
 * - 🌐 Massive offline dictionary + online translation fallback with cache.
 */

// ── 1. MASTER MULTI-WORD PHRASES, PHRASAL VERBS & COMPOUND WORDS DATABASE ──
const MASTER_PHRASES = {
  // Conjunctions & Prepositional Phrases (Edat & Bağlaç Kalıpları)
  "in terms of": { tr: "bakımından, açısından, konusu olduğunda", type_label: "Edat / Bağlaç Kalıbı", icon: "🔗" },
  "in order to": { tr: "-mek / -mak amacıyla, için", type_label: "Bağlaç Kalıbı", icon: "🎯" },
  "as well as": { tr: "yanı sıra, hem de, aynı zamanda", type_label: "Bağlaç", icon: "➕" },
  "as soon as": { tr: "-er ... -mez, yapar yapmaz", type_label: "Zaman Bağlacı", icon: "⚡" },
  "as long as": { tr: "-dığı sürece, şartıyla", type_label: "Koşul Bağlacı", icon: "⏳" },
  "as far as": { tr: "-e kadar, kadarıyla", type_label: "Kapsam Bağlacı", icon: "📏" },
  "by the way": { tr: "bu arada, sırası gelmişken", type_label: "Geçiş İfadesi", icon: "💬" },
  "on the other hand": { tr: "diğer taraftan, öte yandan", type_label: "Zıtlık Bağlacı", icon: "⚖️" },
  "on the one hand": { tr: "bir taraftan, bir yandan", type_label: "Bağlaç İfadesi", icon: "⚖️" },
  "at the same time": { tr: "aynı zamanda, eşzamanlı olarak", type_label: "Zaman Zarfı", icon: "⏱️" },
  "for example": { tr: "örneğin, mesela", type_label: "Örnekleme İfadesi", icon: "💡" },
  "for instance": { tr: "örneğin, sözgelimi", type_label: "Örnekleme İfadesi", icon: "💡" },
  "as a result": { tr: "sonuç olarak, neticesinde", type_label: "Sonuç Bağlacı", icon: "📊" },
  "as a consequence": { tr: "sonuç itibarıyla", type_label: "Sonuç Bağlacı", icon: "📊" },
  "in fact": { tr: "aslında, doğrusu, nitekim", type_label: "Vurgu Zarfı", icon: "📌" },
  "in general": { tr: "genel olarak, genel anlamda", type_label: "Genelleme Zarfı", icon: "🌐" },
  "in particular": { tr: "özellikle, bilhassa", type_label: "Vurgu Zarfı", icon: "🎯" },
  "in detail": { tr: "detaylıca, ayrıntılarıyla", type_label: "Durum Zarfı", icon: "🔍" },
  "in contrast": { tr: "buna karşılık, aksine", type_label: "Zıtlık Bağlacı", icon: "🔄" },
  "in contrast to": { tr: "aksine, ile karşılaştırıldığında", type_label: "Zıtlık Edatı", icon: "🔄" },
  "in comparison with": { tr: "ile karşılaştırıldığında", type_label: "Karşılaştırma Edatı", icon: "⚖️" },
  "in addition": { tr: "ek olarak, ayrıca", type_label: "Bağlaç", icon: "➕" },
  "in addition to": { tr: "ek olarak, yanında", type_label: "Edat Kalıbı", icon: "➕" },
  "instead of": { tr: "yerine, -mek yerine", type_label: "Edat Kalıbı", icon: "🔀" },
  "according to": { tr: "-e göre", type_label: "Kaynak Gösterme Edatı", icon: "📜" },
  "due to": { tr: "-den dolayı, yüzünden", type_label: "Neden-Sonuç Edatı", icon: "🌧️" },
  "because of": { tr: "-den dolayı, yüzünden", type_label: "Neden-Sonuç Edatı", icon: "🌧️" },
  "thanks to": { tr: "sayesinde", type_label: "Neden-Sonuç Edatı", icon: "🌟" },
  "even though": { tr: "-se bile, -e rağmen", type_label: "Zıtlık Bağlacı", icon: "🌧️" },
  "even if": { tr: "-se bile, olsa dahi", type_label: "Koşul Bağlacı", icon: "🌧️" },
  "so that": { tr: "-sın diye, böylece", type_label: "Amaç Bağlacı", icon: "🎯" },
  "in spite of": { tr: "-e rağmen", type_label: "Zıtlık Edatı", icon: "🌧️" },
  "with the help of": { tr: "yardımıyla, sayesinde", type_label: "Edat Kalıbı", icon: "🤝" },
  "from time to time": { tr: "zaman zaman, ara sıra", type_label: "Zaman Zarfı", icon: "⏳" },
  "once upon a time": { tr: "bir varmış bir yokmuş", type_label: "Deyimsel İfade", icon: "📖" },
  "at least": { tr: "en azından", type_label: "Miktar Zarfı", icon: "📏" },
  "at most": { tr: "en fazla, en çok", type_label: "Miktar Zarfı", icon: "📏" },
  "at first": { tr: "ilk başta, önceleri", type_label: "Zaman Zarfı", icon: "🥇" },
  "at last": { tr: "sonunda, nihayet", type_label: "Zaman Zarfı", icon: "🏁" },
  "in charge of": { tr: "-den sorumlu, başında", type_label: "Sıfat / Edat", icon: "👔" },
  "on behalf of": { tr: "adına, namına", type_label: "Temsil Edatı", icon: "👥" },
  "with respect to": { tr: "ile ilgili olarak, bakımından", type_label: "Edat Kalıbı", icon: "📑" },
  "with regard to": { tr: "ile ilgili olarak", type_label: "Edat Kalıbı", icon: "📑" },
  "in front of": { tr: "önünde", type_label: "Yer Edatı", icon: "📍" },
  "in the middle of": { tr: "ortasında", type_label: "Yer Edatı", icon: "📍" },
  "at the end of": { tr: "sonunda", type_label: "Yer / Zaman Edatı", icon: "📍" },
  "all over the world": { tr: "dünyanın her yerinde", type_label: "Yer Zarfı", icon: "🌍" },
  "day by day": { tr: "günden güne, adım adım", type_label: "Zaman Zarfı", icon: "📅" },
  "step by step": { tr: "adım adım, aşama aşama", type_label: "Durum Zarfı", icon: "🐾" },
  "so far": { tr: "şimdiye kadar, şu ana dek", type_label: "Zaman Zarfı", icon: "⏳" },
  "up to now": { tr: "şu ana kadar", type_label: "Zaman Zarfı", icon: "⏳" },
  "no matter": { tr: "ne olursa olsun", type_label: "Bağlaç", icon: "🛡️" },
  "by mistake": { tr: "yanlışlıkla, kazara", type_label: "Durum Zarfı", icon: "⚠️" },
  "by accident": { tr: "kazara, tesadüfen", type_label: "Durum Zarfı", icon: "⚠️" },
  "on purpose": { tr: "kasıtlı olarak, bilerek", type_label: "Durum Zarfı", icon: "🎯" },
  "out of order": { tr: "arızalı, bozuk", type_label: "Sıfat İfadesi", icon: "⚠️" },
  "out of date": { tr: "tarihi geçmiş, modası geçmiş", type_label: "Sıfat İfadesi", icon: "📅" },
  "up to date": { tr: "güncel, modern", type_label: "Sıfat İfadesi", icon: "🆕" },

  // Phrasal Verbs (Deyimsel Fiiller)
  "look forward to": { tr: "dört gözle beklemek, sabırsızlanmak", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "🤩" },
  "take care of": { tr: "ilgilenmek, bakmak, özen göstermek", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "💚" },
  "give up": { tr: "vazgeçmek, bırakmak", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "🛑" },
  "wake up": { tr: "uyanmak", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "⏰" },
  "get up": { tr: "yataktan kalkmak", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "🌅" },
  "find out": { tr: "öğrenmek, keşfetmek, anlamak", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "🔍" },
  "figure out": { tr: "çözmek, kavramak, halletmek", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "💡" },
  "point out": { tr: "işaret etmek, dikkat çekmek", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "👉" },
  "carry out": { tr: "gerçekleştirmek, uygulamak, yürütmek", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "⚙️" },
  "set up": { tr: "kurmak, hazırlamak, organize etmek", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "🛠️" },
  "pick up": { tr: "almak, toplamak, kapmak", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "📦" },
  "grow up": { tr: "büyümek, yetişmek", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "🌱" },
  "turn on": { tr: "açmak (cihaz/ışık)", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "💡" },
  "turn off": { tr: "kapatmak (cihaz/ışık)", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "🔌" },
  "put off": { tr: "ertelemek", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "⏳" },
  "call off": { tr: "iptal etmek", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "❌" },
  "look after": { tr: "göz kulak olmak, bakmak", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "👶" },
  "look for": { tr: "aramak", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "🔎" },
  "look up": { tr: "sözlükte/kaynakta aramak", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "📖" },
  "look up to": { tr: "hayran olmak, saygı duymak", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "👑" },
  "hang out": { tr: "vakit geçirmek, takılmak", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "☕" },
  "deal with": { tr: "başa çıkmak, ele almak, ilgilenmek", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "💼" },
  "depend on": { tr: "-e bağlı olmak, güvenmek", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "🤝" },
  "rely on": { tr: "güvenmek, bel bağlamak", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "🤝" },
  "consist of": { tr: "-den oluşmak", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "🧱" },
  "succeed in": { tr: "bir konuda başarılı olmak", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "🏆" },
  "result in": { tr: "ile sonuçlanmak, yol açmak", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "🎯" },
  "take advantage of": { tr: "fırsatı değerlendirmek, yararlanmak", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "💎" },
  "get rid of": { tr: "kurtulmak, başından savmak", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "🗑️" },
  "keep in mind": { tr: "akılda tutmak, unutmamak", type_label: "Deyimsel İfade", icon: "🧠" },
  "catch up with": { tr: "yetişmek, arayı kapatmak", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "🏃" },
  "run out of": { tr: "tükenmek, bitmek (zaman/para)", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "⌛" },
  "come up with": { tr: "fikir ortaya atmak, bulmak", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "💡" },
  "make sure": { tr: "emin olmak, garantiye almak", type_label: "Deyimsel İfade", icon: "✅" },
  "pay attention": { tr: "dikkatini vermek, dinlemek", type_label: "Deyimsel İfade", icon: "👂" },
  "take part in": { tr: "katılmak, yer almak", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "🙋" },
  "get used to": { tr: "alışmak", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "🔄" },
  "break down": { tr: "bozulmak, arızalanmak", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "🚗" },
  "calm down": { tr: "sakinleşmek", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "🧘" },
  "check in": { tr: "giriş yapmak (otel/havalimanı)", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "🏨" },
  "check out": { tr: "çıkış yapmak / incelemek", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "🏨" },
  "come across": { tr: "rastlamak, karşılaşmak", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "👣" },
  "count on": { tr: "güvenmek", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "🤝" },
  "cut down on": { tr: "azaltmak, kısmak", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "📉" },
  "drop out": { tr: "okulu bırakmak / ayrılmak", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "🎒" },
  "get along with": { tr: "biriyle iyi geçinmek", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "👫" },
  "give away": { tr: "bağışlamak, hediye etmek", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "🎁" },
  "go on": { tr: "devam etmek, sürmek", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "➡️" },
  "hold on": { tr: "beklemek (kısa süre)", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "📞" },
  "keep on": { tr: "devam etmek", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "🔄" },
  "log in": { tr: "giriş yapmak", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "💻" },
  "log out": { tr: "çıkış yapmak", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "💻" },
  "make up": { tr: "uydurmak / barışmak / telafi etmek", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "🤝" },
  "pass away": { tr: "vefat etmek", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "🕊️" },
  "put on": { tr: "giymek, takmak", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "👕" },
  "take off": { tr: "çıkarmak (kıyafet) / havalanmak (uçak)", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "🛫" },
  "show up": { tr: "çıkagelmek, belirmek", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "🚪" },
  "slow down": { tr: "yavaşlamak", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "🐢" },
  "speed up": { tr: "hızlanmak", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "🚀" },
  "take up": { tr: "yeni bir hobiye başlamak", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "🎨" },
  "try on": { tr: "denemek (kıyafet)", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "👗" },
  "warm up": { tr: "ısınmak", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "🏃" },
  "work out": { tr: "antrenman yapmak / çözüme kavuşmak", type_label: "Deyimsel Fiil (Phrasal Verb)", icon: "🏋️" },

  // Compound Adjectives (Bileşik Sıfatlar)
  "well-structured": { tr: "iyi yapılandırılmış, düzenli, planlı", type_label: "Bileşik Sıfat (Compound Adj)", icon: "📐" },
  "well structured": { tr: "iyi yapılandırılmış, düzenli, planlı", type_label: "Bileşik Sıfat (Compound Adj)", icon: "📐" },
  "well-known": { tr: "ünlü, tanınmış, meşhur", type_label: "Bileşik Sıfat (Compound Adj)", icon: "🌟" },
  "well known": { tr: "ünlü, tanınmış, meşhur", type_label: "Bileşik Sıfat (Compound Adj)", icon: "🌟" },
  "well-educated": { tr: "iyi eğitimli, kültürlü", type_label: "Bileşik Sıfat (Compound Adj)", icon: "🎓" },
  "well educated": { tr: "iyi eğitimli, kültürlü", type_label: "Bileşik Sıfat (Compound Adj)", icon: "🎓" },
  "well-done": { tr: "aferin, tebrikler / iyi pişmiş", type_label: "Ünlem / Sıfat", icon: "👏" },
  "well done": { tr: "aferin, tebrikler / iyi pişmiş", type_label: "Ünlem / Sıfat", icon: "👏" },
  "well-designed": { tr: "iyi tasarlanmış", type_label: "Bileşik Sıfat (Compound Adj)", icon: "🎨" },
  "well designed": { tr: "iyi tasarlanmış", type_label: "Bileşik Sıfat (Compound Adj)", icon: "🎨" },
  "well-organized": { tr: "iyi organize edilmiş, tertipli", type_label: "Bileşik Sıfat (Compound Adj)", icon: "🗂️" },
  "well organized": { tr: "iyi organize edilmiş, tertipli", type_label: "Bileşik Sıfat (Compound Adj)", icon: "🗂️" },
  "well-prepared": { tr: "iyi hazırlanmış", type_label: "Bileşik Sıfat (Compound Adj)", icon: "📚" },
  "well prepared": { tr: "iyi hazırlanmış", type_label: "Bileşik Sıfat (Compound Adj)", icon: "📚" },
  "well-behaved": { tr: "uslu, terbiyeli, kibar", type_label: "Bileşik Sıfat (Compound Adj)", icon: "😇" },
  "well behaved": { tr: "uslu, terbiyeli, kibar", type_label: "Bileşik Sıfat (Compound Adj)", icon: "😇" },
  "well-established": { tr: "köklü, sağlam", type_label: "Bileşik Sıfat (Compound Adj)", icon: "🏛️" },
  "well established": { tr: "köklü, sağlam", type_label: "Bileşik Sıfat (Compound Adj)", icon: "🏛️" },
  "hard-working": { tr: "çalışkan, gayretli", type_label: "Bileşik Sıfat (Compound Adj)", icon: "🐝" },
  "hard working": { tr: "çalışkan, gayretli", type_label: "Bileşik Sıfat (Compound Adj)", icon: "🐝" },
  "open-minded": { tr: "açık fikirli, hoşgörülü", type_label: "Bileşik Sıfat (Compound Adj)", icon: "🧠" },
  "open minded": { tr: "açık fikirli, hoşgörülü", type_label: "Bileşik Sıfat (Compound Adj)", icon: "🧠" },
  "easy-going": { tr: "uyumlu, rahat, tasasız", type_label: "Bileşik Sıfat (Compound Adj)", icon: "🌊" },
  "easy going": { tr: "uyumlu, rahat, tasasız", type_label: "Bileşik Sıfat (Compound Adj)", icon: "🌊" },
  "good-looking": { tr: "yakışıklı, güzel, çekici", type_label: "Bileşik Sıfat (Compound Adj)", icon: "✨" },
  "good looking": { tr: "yakışıklı, güzel, çekici", type_label: "Bileşik Sıfat (Compound Adj)", icon: "✨" },
  "part-time": { tr: "yarı zamanlı", type_label: "Bileşik Sıfat (Compound Adj)", icon: "⏱️" },
  "part time": { tr: "yarı zamanlı", type_label: "Bileşik Sıfat (Compound Adj)", icon: "⏱️" },
  "full-time": { tr: "tam zamanlı", type_label: "Bileşik Sıfat (Compound Adj)", icon: "⏱️" },
  "full time": { tr: "tam zamanlı", type_label: "Bileşik Sıfat (Compound Adj)", icon: "⏱️" },
  "short-term": { tr: "kısa vadeli", type_label: "Bileşik Sıfat (Compound Adj)", icon: "⏳" },
  "short term": { tr: "kısa vadeli", type_label: "Bileşik Sıfat (Compound Adj)", icon: "⏳" },
  "long-term": { tr: "uzun vadeli", type_label: "Bileşik Sıfat (Compound Adj)", icon: "⏳" },
  "long term": { tr: "uzun vadeli", type_label: "Bileşik Sıfat (Compound Adj)", icon: "⏳" },
  "high-tech": { tr: "ileri teknoloji", type_label: "Bileşik Sıfat (Compound Adj)", icon: "🤖" },
  "high tech": { tr: "ileri teknoloji", type_label: "Bileşik Sıfat (Compound Adj)", icon: "🤖" },
  "high-level": { tr: "üst düzey", type_label: "Bileşik Sıfat (Compound Adj)", icon: "🔝" },
  "high level": { tr: "üst düzey", type_label: "Bileşik Sıfat (Compound Adj)", icon: "🔝" },
  "self-confident": { tr: "kendine güvenen", type_label: "Bileşik Sıfat (Compound Adj)", icon: "💪" },
  "self confident": { tr: "kendine güvenen", type_label: "Bileşik Sıfat (Compound Adj)", icon: "💪" },
  "state-of-the-art": { tr: "en son teknoloji, son model", type_label: "Bileşik Sıfat (Compound Adj)", icon: "🚀" },
  "day-to-day": { tr: "günlük, günden güne olan", type_label: "Bileşik Sıfat (Compound Adj)", icon: "📅" },

  // Common Collocations & Compound Nouns (Bileşik İsimler & Tamlamalar)
  "school year": { tr: "öğretim yılı, okul yılı", type_label: "Bileşik İsim (Collocation)", icon: "🏫" },
  "academic year": { tr: "akademik yıl, öğretim dönemi", type_label: "Bileşik İsim (Collocation)", icon: "🏫" },
  "personal growth": { tr: "kişisel gelişim, bireysel olgunlaşma", type_label: "Bileşik İsim (Collocation)", icon: "🌱" },
  "great job": { tr: "harika iş, tebrikler", type_label: "Övgü İfadesi (Idiom)", icon: "👏" },
  "good job": { tr: "tebrikler, güzel iş", type_label: "Övgü İfadesi (Idiom)", icon: "👏" },
  "high school": { tr: "lise", type_label: "Bileşik İsim (Collocation)", icon: "🏫" },
  "daily routine": { tr: "günlük rutin, alışkanlıklar", type_label: "Bileşik İsim (Collocation)", icon: "⏰" },
  "free time": { tr: "boş zaman", type_label: "Bileşik İsim (Collocation)", icon: "🎮" },
  "lunch break": { tr: "öğle arası, öğle molası", type_label: "Bileşik İsim (Collocation)", icon: "🥪" },
  "fluent english": { tr: "akıcı ingilizce", type_label: "Tamlaama", icon: "🗣️" },
  "main goal": { tr: "ana hedef, temel amaç", type_label: "Tamlaama", icon: "🎯" },
  "social media": { tr: "sosyal medya", type_label: "Bileşik İsim", icon: "📱" },
  "public transport": { tr: "toplu taşıma", type_label: "Bileşik İsim", icon: "🚌" },
  "school bus": { tr: "okul servisi", type_label: "Bileşik İsim", icon: "🚌" },
  "living room": { tr: "oturma odası", type_label: "Bileşik İsim", icon: "🛋️" },
  "dining room": { tr: "yemek odası", type_label: "Bileşik İsim", icon: "🍽️" },
  "swimming pool": { tr: "yüzme havuzu", type_label: "Bileşik İsim", icon: "🏊" },
  "ice cream": { tr: "dondurma", type_label: "Bileşik İsim", icon: "🍦" },
  "credit card": { tr: "kredi kartı", type_label: "Bileşik İsim", icon: "💳" },
  "bus stop": { tr: "otobüs durağı", type_label: "Bileşik İsim", icon: "🚏" },
  "train station": { tr: "tren istasyonu", type_label: "Bileşik İsim", icon: "🚉" },
  "post office": { tr: "postane", type_label: "Bileşik İsim", icon: "📮" },
  "police station": { tr: "polis merkezi", type_label: "Bileşik İsim", icon: "👮" },
  "health care": { tr: "sağlık hizmeti", type_label: "Bileşik İsim", icon: "🏥" },
  "climate change": { tr: "iklim değişikliği", type_label: "Bileşik İsim", icon: "🌍" },
  "solar energy": { tr: "güneş enerjisi", type_label: "Bileşik İsim", icon: "☀️" },
  "artificial intelligence": { tr: "yapay zeka", type_label: "Bileşik İsim", icon: "🤖" },
  "foreign language": { tr: "yabancı dil", type_label: "Bileşik İsim", icon: "🌐" }
};

window.MASTER_PHRASES = MASTER_PHRASES;

class WordLookupEngine {
  constructor() {
    this.cache = this.loadCache();
    this.modalEl = null;
    this.activeWordData = null;
    this.localDict = {};
    this.phrases = MASTER_PHRASES;
    this.initDictionary();
  }

  loadCache() {
    try {
      const saved = localStorage.getItem('english_app_lookup_cache');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  }

  saveCache() {
    try {
      localStorage.setItem('english_app_lookup_cache', JSON.stringify(this.cache));
    } catch (e) {}
  }

  /* =========================================================
     1. EMBEDDED MASTER VOCABULARY & PART-OF-SPEECH DATABASE
     ========================================================= */
  initDictionary() {
    // 1. Merge generated MASTER_DICTIONARY
    this.localDict = Object.assign({}, (window.MASTER_DICTIONARY || {}));

    // 2. Load external JSON asynchronously if available
    this.loadExternalDictionary();
  }

  async loadExternalDictionary() {
    try {
      const res = await fetch('./data/full_dictionary.json');
      if (res.ok) {
        const full = await res.json();
        this.localDict = Object.assign({}, this.localDict, full);
      }
    } catch (e) {}
  }

  /* =========================================================
     2. MORPHOLOGICAL LEMMATIZER & PHRASE LOOKUP MOTORU
     ========================================================= */
  lemmatize(rawWord) {
    if (!rawWord || typeof rawWord !== 'string') {
      return { wordEn: '', tr: '', type_label: 'Kelime', icon: '📖' };
    }

    const cleanWord = rawWord.replace(/[^a-zA-Z'\- ]/g, '').trim();
    const w = cleanWord.toLowerCase();
    const normalizedKey = w.replace(/\s+/g, ' ');

    if (!w) {
      return { wordEn: '', tr: '', type_label: 'Kelime', icon: '📖' };
    }

    // 0. Check Master Phrases & Idioms first
    if (this.phrases && this.phrases[normalizedKey]) {
      const p = this.phrases[normalizedKey];
      return {
        wordEn: normalizedKey,
        original: cleanWord,
        tr: p.tr,
        type: "phrase",
        type_label: p.type_label || "Deyim / Kalıp İfade",
        icon: p.icon || "🔗",
        isPhrase: true
      };
    }

    // Helper: lookup entry in localDict, MASTER_DICTIONARY, or cache
    const findInDict = (key) => {
      if (!key) return null;
      const k = key.toLowerCase();
      if (this.phrases && this.phrases[k]) {
        return this.phrases[k];
      }
      if (this.localDict && this.localDict[k] && this.localDict[k].tr && this.localDict[k].tr !== 'Kelime') {
        return this.localDict[k];
      }
      if (window.MASTER_DICTIONARY && window.MASTER_DICTIONARY[k] && window.MASTER_DICTIONARY[k].tr && window.MASTER_DICTIONARY[k].tr !== 'Kelime') {
        this.localDict[k] = window.MASTER_DICTIONARY[k];
        return window.MASTER_DICTIONARY[k];
      }
      if (this.cache && this.cache[k] && this.cache[k].tr && this.cache[k].tr !== 'Kelime') {
        return this.cache[k];
      }
      return null;
    };

    // 1. Direct match
    const direct = findInDict(w);
    if (direct) {
      return { ...direct, wordEn: w, original: cleanWord };
    }

    // 2. School Mode Curriculum match & Notebook match
    if (window.schoolMode) {
      if (window.schoolMode.schoolData && window.schoolMode.schoolData.units) {
        for (const u of window.schoolMode.schoolData.units) {
          if (u.words) {
            const uMatch = u.words.find(uw => uw.en && uw.en.toLowerCase() === w);
            if (uMatch) {
              return {
                tr: uMatch.tr,
                type: uMatch.pos || uMatch.type || "school",
                type_label: `${u.code} • ${uMatch.pos || uMatch.type || 'Kelime'}`,
                icon: "🏫",
                wordEn: uMatch.en,
                original: cleanWord
              };
            }
          }
        }
      }
      if (typeof window.schoolMode.getSchoolWords === 'function') {
        const myW = window.schoolMode.getSchoolWords().find(mw => mw.en && mw.en.toLowerCase() === w);
        if (myW) {
          return {
            tr: myW.tr,
            type: myW.pos || "school",
            type_label: myW.pos || "9. Sınıf Okul Defteri",
            icon: "⭐",
            wordEn: myW.en,
            original: cleanWord
          };
        }
      }
    }

    // 3. Contractions mapping
    const contractionMap = {
      "don't": { root: "do", tr: "yapma(mak) / olumsuz geniş zaman", type_label: "Olumsuz Yardımcı Fiil" },
      "doesn't": { root: "does", tr: "yapmaz / olumsuz geniş zaman", type_label: "Olumsuz Yardımcı Fiil" },
      "didn't": { root: "did", tr: "yapmadı / olumsuz geçmiş zaman", type_label: "Olumsuz Geçmiş Fiil" },
      "can't": { root: "can", tr: "yapamaz / yeteneksizlik", type_label: "Olumsuz Modal (Kip)" },
      "couldn't": { root: "could", tr: "yapamadı / geçmiş yeteneksizlik", type_label: "Olumsuz Modal (Kip)" },
      "won't": { root: "will", tr: "yapmayacak / olumsuz gelecek", type_label: "Olumsuz Gelecek Kip" },
      "wouldn't": { root: "would", tr: "yapmazdı / istemezdi", type_label: "Olumsuz Modal" },
      "shouldn't": { root: "should", tr: "yapmamalı / olumsuz tavsiye", type_label: "Olumsuz Modal (Tavsiye)" },
      "mustn't": { root: "must", tr: "yapmamalı / yasak", type_label: "Yasaklama Kipi" },
      "isn't": { root: "is", tr: "değildir (tekil)", type_label: "Olumsuz Yardımcı Fiil" },
      "aren't": { root: "are", tr: "değildirler (çoğul)", type_label: "Olumsuz Yardımcı Fiil" },
      "wasn't": { root: "was", tr: "değildi (geçmiş tekil)", type_label: "Olumsuz Geçmiş Fiil" },
      "weren't": { root: "were", tr: "değildiler (geçmiş çoğul)", type_label: "Olumsuz Geçmiş Fiil" },
      "haven't": { root: "have", tr: "sahip değil / perfect olumsuz", type_label: "Olumsuz Yardımcı Fiil" },
      "hasn't": { root: "has", tr: "sahip değil / perfect olumsuz", type_label: "Olumsuz Yardımcı Fiil" },
      "hadn't": { root: "had", tr: "sahip değildi / past perfect olumsuz", type_label: "Olumsuz Geçmiş Fiil" },
      "it's": { root: "it", tr: "o (it is / it has)", type_label: "Zamir + Yardımcı Fiil" },
      "i'm": { root: "i", tr: "ben (I am)", type_label: "Zamir + Fiil" },
      "you're": { root: "you", tr: "sen / siz (you are)", type_label: "Zamir + Fiil" },
      "they're": { root: "they", tr: "onlar (they are)", type_label: "Zamir + Fiil" },
      "we're": { root: "we", tr: "biz (we are)", type_label: "Zamir + Fiil" },
      "i've": { root: "i", tr: "ben (I have)", type_label: "Zamir + Fiil" },
      "you've": { root: "you", tr: "sen (you have)", type_label: "Zamir + Fiil" },
      "they've": { root: "they", tr: "onlar (they have)", type_label: "Zamir + Fiil" },
      "we've": { root: "we", tr: "biz (we have)", type_label: "Zamir + Fiil" },
      "i'll": { root: "i", tr: "ben yapacağım (I will)", type_label: "Zamir + Gelecek Kip" },
      "you'll": { root: "you", tr: "sen yapacaksın (you will)", type_label: "Zamir + Gelecek Kip" },
      "he'll": { root: "he", tr: "o yapacak (he will)", type_label: "Zamir + Gelecek Kip" },
      "she'll": { root: "she", tr: "o yapacak (she will)", type_label: "Zamir + Gelecek Kip" },
      "we'll": { root: "we", tr: "biz yapacağız (we will)", type_label: "Zamir + Gelecek Kip" },
      "they'll": { root: "they", tr: "onlar yapacak (they will)", type_label: "Zamir + Gelecek Kip" }
    };

    if (contractionMap[w]) {
      const c = contractionMap[w];
      return {
        tr: c.tr,
        root: c.root,
        type: "contraction",
        type_label: c.type_label,
        icon: "💡",
        wordEn: w,
        original: cleanWord
      };
    }

    // 4. Irregular Forms Mapping
    const irregularMap = {
      "am": "be", "is": "be", "are": "be", "was": "be", "were": "be", "been": "be", "being": "be",
      "has": "have", "had": "have", "having": "have",
      "does": "do", "did": "do", "done": "do", "doing": "do",
      "goes": "go", "went": "go", "gone": "go", "going": "go",
      "says": "say", "said": "say", "saying": "say",
      "gets": "get", "got": "get", "gotten": "get", "getting": "get",
      "makes": "make", "made": "make", "making": "make",
      "knows": "know", "knew": "know", "known": "know", "knowing": "know",
      "thinks": "think", "thought": "think", "thinking": "think",
      "takes": "take", "took": "take", "taken": "take", "taking": "take",
      "sees": "see", "saw": "see", "seen": "see", "seeing": "see",
      "comes": "come", "came": "come", "coming": "come",
      "finds": "find", "found": "find", "finding": "find",
      "gives": "give", "gave": "give", "given": "give", "giving": "give",
      "tells": "tell", "told": "tell", "telling": "tell",
      "feels": "feel", "felt": "feel", "feeling": "feel",
      "becomes": "become", "became": "become", "becoming": "become",
      "leaves": "leave", "left": "leave", "leaving": "leave",
      "puts": "put", "putting": "put",
      "means": "mean", "meant": "mean", "meaning": "mean",
      "keeps": "keep", "kept": "keep", "keeping": "keep",
      "begins": "begin", "began": "begin", "begun": "begin", "beginning": "begin",
      "shows": "show", "showed": "show", "shown": "show", "showing": "show",
      "hears": "hear", "heard": "hear", "hearing": "hear",
      "runs": "run", "ran": "run", "running": "run",
      "writes": "write", "wrote": "write", "written": "write", "writing": "write",
      "sits": "sit", "sat": "sit", "sitting": "sit",
      "stands": "stand", "stood": "stand", "standing": "stand",
      "loses": "lose", "lost": "lose", "losing": "lose",
      "pays": "pay", "paid": "pay", "paying": "pay",
      "meets": "meet", "met": "meet", "meeting": "meet",
      "sets": "set", "setting": "set",
      "learns": "learn", "learnt": "learn", "learned": "learn", "learning": "learn",
      "leads": "lead", "led": "lead", "leading": "lead",
      "understands": "understand", "understood": "understand", "understanding": "understand",
      "speaks": "speak", "spoke": "speak", "spoken": "speak", "speaking": "speak",
      "reads": "read", "reading": "read",
      "spends": "spend", "spent": "spend", "spending": "spend",
      "grows": "grow", "grew": "grow", "grown": "grow", "growing": "grow",
      "wins": "win", "won": "win", "winning": "win",
      "buys": "buy", "bought": "buy", "buying": "buy",
      "sends": "send", "sent": "send", "sending": "send",
      "builds": "build", "built": "build", "building": "build",
      "falls": "fall", "fell": "fall", "fallen": "fall", "falling": "fall",
      "breaks": "break", "broke": "break", "broken": "break", "breaking": "break",
      "eats": "eat", "ate": "eat", "eaten": "eat", "eating": "eat",
      "drinks": "drink", "drank": "drink", "drunk": "drink", "drinking": "drink",
      "sleeps": "sleep", "slept": "sleep", "sleeping": "sleep",
      "wakes": "wake", "woke": "wake", "woken": "wake", "waking": "wake",
      "drives": "drive", "drove": "drive", "driven": "drive", "driving": "drive",
      "flies": "fly", "flew": "fly", "flown": "fly", "flying": "fly",
      "teaches": "teach", "taught": "teach", "teaching": "teach",
      "catches": "catch", "caught": "catch", "catching": "catch",
      "chooses": "choose", "chose": "choose", "chosen": "choose", "choosing": "choose",
      "children": "child", "people": "person", "men": "man", "women": "woman",
      "feet": "foot", "teeth": "tooth", "mice": "mouse", "geese": "goose",
      "lives": "life", "knives": "knife", "wives": "wife", "leaves": "leaf",
      "better": "good", "best": "good", "worse": "bad", "worst": "bad"
    };

    if (irregularMap[w]) {
      const rootWord = irregularMap[w];
      const entry = findInDict(rootWord);
      if (entry) {
        return {
          ...entry,
          wordEn: w,
          root: rootWord,
          tr: entry.tr,
          type_label: `${entry.type_label || entry.type || 'Kelime'} (${rootWord})`,
          original: cleanWord
        };
      }
    }

    // 5. Morphological Stemming Rules
    const candidates = [];

    // Rule: -ing
    if (w.endsWith('ing') && w.length > 4) {
      const base = w.slice(0, -3);
      candidates.push({ stem: base, rule: 'verb_ing' });
      candidates.push({ stem: base + 'e', rule: 'verb_ing' });
      if (base.length > 2 && base[base.length - 1] === base[base.length - 2]) {
        candidates.push({ stem: base.slice(0, -1), rule: 'verb_ing' });
      }
      if (base.endsWith('y')) {
        candidates.push({ stem: base.slice(0, -1) + 'ie', rule: 'verb_ing' });
      }
    }

    // Rule: -ed / -d
    if (w.endsWith('ed') && w.length > 3) {
      const base = w.slice(0, -2);
      candidates.push({ stem: base, rule: 'verb_ed' });
      candidates.push({ stem: base + 'e', rule: 'verb_ed' });
      if (base.length > 2 && base[base.length - 1] === base[base.length - 2]) {
        candidates.push({ stem: base.slice(0, -1), rule: 'verb_ed' });
      }
      if (base.endsWith('i')) {
        candidates.push({ stem: base.slice(0, -1) + 'y', rule: 'verb_ed' });
      }
    }

    // Rule: Plural or 3rd Person Singular -s, -es, -ies
    if (w.endsWith('ies') && w.length > 4) {
      candidates.push({ stem: w.slice(0, -3) + 'y', rule: 'plural_ies' });
    } else if (w.endsWith('es') && w.length > 3) {
      candidates.push({ stem: w.slice(0, -2), rule: 'plural_es' });
      candidates.push({ stem: w.slice(0, -1), rule: 'plural_s' });
    } else if (w.endsWith('s') && !w.endsWith('ss') && w.length > 2) {
      candidates.push({ stem: w.slice(0, -1), rule: 'plural_s' });
    }

    // Rule: Adverbs -ly
    if (w.endsWith('ly') && w.length > 3) {
      candidates.push({ stem: w.slice(0, -2), rule: 'adverb_ly' });
      if (w.endsWith('ily')) {
        candidates.push({ stem: w.slice(0, -3) + 'y', rule: 'adverb_ly' });
      }
      if (w.endsWith('ally')) {
        candidates.push({ stem: w.slice(0, -4), rule: 'adverb_ly' });
        candidates.push({ stem: w.slice(0, -4) + 'ic', rule: 'adverb_ly' });
      }
    }

    // Rule: Comparatives & Superlatives -er, -est
    if (w.endsWith('est') && w.length > 4) {
      candidates.push({ stem: w.slice(0, -3), rule: 'superlative' });
      candidates.push({ stem: w.slice(0, -2), rule: 'superlative' });
      if (w.endsWith('iest')) candidates.push({ stem: w.slice(0, -4) + 'y', rule: 'superlative' });
    } else if (w.endsWith('er') && w.length > 3) {
      candidates.push({ stem: w.slice(0, -2), rule: 'comparative' });
      candidates.push({ stem: w.slice(0, -1), rule: 'comparative' });
      if (w.endsWith('ier')) candidates.push({ stem: w.slice(0, -3) + 'y', rule: 'comparative' });
    }

    // Check if any candidate stem exists in dictionary
    for (const c of candidates) {
      const entry = findInDict(c.stem);
      if (entry) {
        let suffixDesc = "";
        let finalType = entry.type_label || entry.type;

        if (c.rule === 'verb_ing') {
          suffixDesc = " (Şimdiki Zaman / -ing)";
          finalType = "Şimdiki Zaman / Fiil (V-ing)";
        } else if (c.rule === 'verb_ed') {
          suffixDesc = " (Geçmiş Zaman / -ed)";
          finalType = "Geçmiş Zaman / Fiil (V2/V3)";
        } else if (c.rule.startsWith('plural')) {
          suffixDesc = " (Çoğul / 3. Tekil)";
          finalType = (entry.type && entry.type.includes('noun')) || (entry.type_label && entry.type_label.includes('İsim')) 
            ? "Çoğul İsim (Plural)" 
            : "Geniş Zaman Fiil (3. Tekil)";
        } else if (c.rule === 'adverb_ly') {
          suffixDesc = " (Zarf Hali)";
          finalType = "Durum Zarfı (Adverb)";
        } else if (c.rule === 'comparative') {
          suffixDesc = " (Daha ...)";
          finalType = "Karşılaştırma Sıfatı (Comparative)";
        } else if (c.rule === 'superlative') {
          suffixDesc = " (En ...)";
          finalType = "Üstünlük Sıfatı (Superlative)";
        }

        const baseMeaning = (entry.tr || '').split(',')[0].split('/')[0].trim();
        const fullTr = c.rule === 'adverb_ly' 
          ? `${baseMeaning} bir şekilde` 
          : `${entry.tr}${suffixDesc}`;

        return {
          ...entry,
          wordEn: w,
          root: c.stem,
          tr: fullTr,
          type_label: finalType,
          original: cleanWord
        };
      }
    }

    // 6. Default Guess
    let guessedType = "Kelime (Word)";
    let guessedIcon = "📝";
    if (w.endsWith('ly')) { guessedType = "Muhtemel Zarf (Adverb)"; guessedIcon = "🟣"; }
    else if (w.endsWith('tion') || w.endsWith('ment') || w.endsWith('ness') || w.endsWith('ity')) { guessedType = "İsim (Noun)"; guessedIcon = "🔴"; }
    else if (w.endsWith('able') || w.endsWith('ful') || w.endsWith('less') || w.endsWith('ous') || w.endsWith('ive')) { guessedType = "Sıfat (Adjective)"; guessedIcon = "🟩"; }
    else if (w.endsWith('ing') || w.endsWith('ed')) { guessedType = "Fiil / Sıfat"; guessedIcon = "🔵"; }

    return {
      wordEn: w,
      tr: "Kelime",
      type: "unknown",
      type_label: guessedType,
      icon: guessedIcon,
      isUnknown: true,
      original: cleanWord
    };
  }

  /* =========================================================
     3. UNIVERSAL MULTI-WORD & SENTENCE WRAPPER
     ========================================================= */
  wrap(htmlOrText) {
    if (!htmlOrText || typeof htmlOrText !== 'string') return htmlOrText || '';

    // 1. Clean awkward spaces before punctuation & join separated hyphens ("well - structured" -> "well-structured")
    let cleaned = htmlOrText
      .replace(/\s+([.,!?;:])/g, '$1')
      .replace(/\b([a-zA-Z]+)\s+-\s+([a-zA-Z]+)\b/g, '$1-$2');

    const parts = cleaned.split(/(<[^>]+>)/g);

    return parts.map(part => {
      if (part.startsWith('<') && part.endsWith('>')) {
        return part;
      }
      return this.tokenizeAndWrapText(part);
    }).join('');
  }

  /**
   * Scans text with Greedy Multi-Word Phrase Recognition (4-gram -> 3-gram -> 2-gram -> 1-gram)
   */
  tokenizeAndWrapText(text) {
    if (!text) return '';

    // Token regex matches words (including hyphens and apostrophes) OR non-words (spaces, punctuation)
    const tokenRegex = /([a-zA-Z0-9]+(?:[-'][a-zA-Z0-9]+)*)|([^a-zA-Z0-9]+)/g;
    const tokens = [];
    let m;
    while ((m = tokenRegex.exec(text)) !== null) {
      if (m[1]) {
        tokens.push({ isWord: true, text: m[1], lower: m[1].toLowerCase() });
      } else if (m[2]) {
        tokens.push({ isWord: false, text: m[2] });
      }
    }

    let resultHtml = '';
    let i = 0;

    while (i < tokens.length) {
      const currentToken = tokens[i];

      if (!currentToken.isWord) {
        resultHtml += currentToken.text;
        i++;
        continue;
      }

      // Check for multi-word phrases starting at token i (up to 4 words forward)
      let matchedPhrase = null;
      let matchWordCount = 0;
      let consumedTokenCount = 0;

      for (let wordLen = 4; wordLen >= 2; wordLen--) {
        let wordCount = 0;
        let phraseWords = [];
        let tokenSpanCount = 0;
        let rawPhraseText = '';

        for (let j = i; j < tokens.length; j++) {
          tokenSpanCount++;
          rawPhraseText += tokens[j].text;
          if (tokens[j].isWord) {
            phraseWords.push(tokens[j].lower);
            wordCount++;
            if (wordCount === wordLen) break;
          }
        }

        if (wordCount === wordLen) {
          const joinedSpace = phraseWords.join(' ');
          const joinedHyphen = phraseWords.join('-');

          if (this.phrases[joinedSpace]) {
            matchedPhrase = { key: joinedSpace, raw: rawPhraseText, info: this.phrases[joinedSpace] };
            consumedTokenCount = tokenSpanCount;
            break;
          } else if (this.phrases[joinedHyphen]) {
            matchedPhrase = { key: joinedHyphen, raw: rawPhraseText, info: this.phrases[joinedHyphen] };
            consumedTokenCount = tokenSpanCount;
            break;
          }
        }
      }

      // Also check if current word itself is a hyphenated compound (e.g. "well-structured")
      if (!matchedPhrase && currentToken.lower.includes('-')) {
        const hyphenKey = currentToken.lower;
        const spaceKey = hyphenKey.replace(/-/g, ' ');
        if (this.phrases[hyphenKey]) {
          matchedPhrase = { key: hyphenKey, raw: currentToken.text, info: this.phrases[hyphenKey] };
          consumedTokenCount = 1;
        } else if (this.phrases[spaceKey]) {
          matchedPhrase = { key: spaceKey, raw: currentToken.text, info: this.phrases[spaceKey] };
          consumedTokenCount = 1;
        }
      }

      if (matchedPhrase) {
        // Multi-word phrase or compound word found!
        const info = matchedPhrase.info;
        const rawText = matchedPhrase.raw;
        const tr = (info.tr || '').replace(/🇹🇷/g, '').trim();
        const pos = info.type_label || 'Bileşik İfade';
        const tooltipTitle = tr ? `${rawText} ➔ ${tr} (${pos})` : `${rawText} (${pos})`;
        const safeMeaning = tr.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        const safePos = pos.replace(/"/g, '&quot;');
        const safeTooltip = tooltipTitle.replace(/"/g, '&quot;');

        resultHtml += `<span class="interactive-word interactive-phrase" onclick="wordLookup.openWord('${rawText.replace(/'/g, "\\'")}', event)" onmouseenter="wordLookup.handleWordHover(this, '${rawText.replace(/'/g, "\\'")}')" data-word="${matchedPhrase.key}" data-meaning="${safeMeaning}" data-pos="${safePos}" data-tooltip="${safeTooltip}">${rawText}</span>`;

        i += consumedTokenCount;
      } else {
        // Single word fallback
        const singleText = currentToken.text;
        const clean = singleText.replace(/'s$/i, '').trim();
        const data = this.lemmatize(clean);

        let tr = (data.tr || '').replace(/🇹🇷/g, '').trim();
        if (tr === 'Kelime') tr = '';

        const pos = data.type_label || (data.type ? data.type.toUpperCase() : 'KELİME');
        const tooltipTitle = tr ? `${clean} ➔ ${tr} (${pos})` : `${clean} (${pos})`;
        const safeMeaning = tr.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        const safePos = pos.replace(/"/g, '&quot;');
        const safeTooltip = tooltipTitle.replace(/"/g, '&quot;');

        resultHtml += `<span class="interactive-word" onclick="wordLookup.openWord('${clean.replace(/'/g, "\\'")}', event)" onmouseenter="wordLookup.handleWordHover(this, '${clean.replace(/'/g, "\\'")}')" data-word="${clean.toLowerCase()}" data-meaning="${safeMeaning}" data-pos="${safePos}" data-tooltip="${safeTooltip}">${singleText}</span>`;

        i++;
      }
    }

    return resultHtml;
  }

  handleWordHover(spanEl, rawWord) {
    if (!spanEl || !rawWord) return;
    const currentMeaning = spanEl.getAttribute('data-meaning');
    if (!currentMeaning || currentMeaning === 'Kelime' || currentMeaning === '') {
      const clean = rawWord.toLowerCase().trim();
      const info = this.lemmatize(clean);
      if (info && info.tr && info.tr !== 'Kelime') {
        const tr = info.tr.replace(/🇹🇷/g, '').trim();
        spanEl.setAttribute('data-meaning', tr);
        spanEl.setAttribute('data-pos', info.type_label || 'Kelime');
        spanEl.setAttribute('data-tooltip', `${clean} ➔ ${tr} (${info.type_label || 'Kelime'})`);
      } else {
        this.fetchWordMeaningQuietly(clean, spanEl);
      }
    }
  }

  async fetchWordMeaningQuietly(cleanWord, spanEl) {
    if (this.cache[cleanWord]) {
      const tr = this.cache[cleanWord].tr;
      if (spanEl && tr) {
        spanEl.setAttribute('data-meaning', tr);
        spanEl.setAttribute('data-tooltip', `${cleanWord} ➔ ${tr}`);
      }
      return;
    }
    try {
      const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=tr&dt=t&q=${encodeURIComponent(cleanWord)}`);
      if (res.ok) {
        const json = await res.json();
        if (json && json[0] && json[0][0] && json[0][0][0]) {
          const turkish = json[0][0][0].trim();
          this.cache[cleanWord] = {
            tr: turkish,
            type: cleanWord.includes(' ') || cleanWord.includes('-') ? "phrase" : "word",
            type_label: cleanWord.includes(' ') || cleanWord.includes('-') ? "Bileşik İfade" : "Kelime",
            icon: "📓",
            wordEn: cleanWord
          };
          this.saveCache();
          if (spanEl) {
            spanEl.setAttribute('data-meaning', turkish);
            spanEl.setAttribute('data-tooltip', `${cleanWord} ➔ ${turkish}`);
          }
        }
      }
    } catch (e) {}
  }

  /* =========================================================
     4. OPEN WORD / PHRASE DETAIL MODAL
     ========================================================= */
  lookup(rawWord, event) {
    return this.openWord(rawWord, event);
  }

  openWord(rawWord, event) {
    if (event) {
      event.stopPropagation();
    }

    const clean = rawWord.replace(/[^a-zA-Z'\- ]/g, '').trim();
    if (!clean) return;

    let data = this.lemmatize(clean);
    this.activeWordData = data;

    this.renderModal(data);

    if (window.speechEngine) {
      setTimeout(() => window.speechEngine.speak(clean), 150);
    }

    if (data.isUnknown || data.tr.includes('aranıyor')) {
      this.fetchOnlineDefinition(clean);
    }
  }

  async fetchOnlineDefinition(word) {
    const cleanWord = word.toLowerCase().trim();
    try {
      const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=tr&dt=t&q=${encodeURIComponent(cleanWord)}`);
      if (res.ok) {
        const json = await res.json();
        if (json && json[0] && json[0][0] && json[0][0][0]) {
          const turkishMeaning = json[0][0][0].trim();

          this.activeWordData.tr = turkishMeaning;
          this.activeWordData.isUnknown = false;

          this.cache[cleanWord] = {
            tr: turkishMeaning,
            type: this.activeWordData.type || (cleanWord.includes(' ') ? "phrase" : "word"),
            type_label: this.activeWordData.type_label || (cleanWord.includes(' ') ? "Bileşik İfade" : "Kelime"),
            icon: this.activeWordData.icon || "📓",
            wordEn: cleanWord
          };
          this.saveCache();

          this.updateModalContent(this.activeWordData);
          return;
        }
      }
    } catch (e) {}
  }

  /* =========================================================
     5. RENDER WORD & PHRASE DETAIL MODAL
     ========================================================= */
  renderModal(data) {
    let modal = document.getElementById('word-lookup-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'word-lookup-modal';
      modal.className = 'word-modal-overlay';
      document.body.appendChild(modal);
    }

    const typeBadge = data.type_label || (data.type ? data.type.toUpperCase() : 'KELİME');
    const icon = data.icon || (data.isPhrase ? '🔗' : '📖');
    const rootInfo = data.root ? `<div class="word-modal-root">🌱 Kök Kelime: <strong>${data.root}</strong></div>` : '';

    modal.innerHTML = `
      <div class="word-modal-card" onclick="event.stopPropagation()">
        <div class="word-modal-header">
          <div class="word-modal-title-group">
            <span class="word-modal-icon">${icon}</span>
            <div>
              <h2 class="word-modal-title">${data.original || data.wordEn}</h2>
              <span class="word-modal-badge">${typeBadge}</span>
            </div>
          </div>
          <button class="word-modal-close" onclick="wordLookup.closeModal()">&times;</button>
        </div>

        <div class="word-modal-body">
          <div class="word-modal-tr-box">
            <div class="word-modal-tr-label">Türkçe Karşılığı</div>
            <div class="word-modal-tr-text" id="word-lookup-tr-text">🇹🇷 ${data.tr}</div>
          </div>

          ${rootInfo}

          <div class="word-modal-actions">
            <button class="btn-primary sm" onclick="speechEngine.speak('${(data.original || data.wordEn).replace(/'/g, "\\'")}')">
              🔊 Sesli Dinle
            </button>
            <button class="btn-success sm" id="add-to-unknown-btn" onclick="wordLookup.addActiveWordToNotebook()">
              ⭐ Kelime Defterime Ekle (+3 XP)
            </button>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('active');

    modal.onclick = (e) => {
      if (e.target === modal) this.closeModal();
    };
  }

  updateModalContent(data) {
    const trEl = document.getElementById('word-lookup-tr-text');
    if (trEl) {
      trEl.innerHTML = `🇹🇷 ${data.tr}`;
    }
  }

  addActiveWordToNotebook() {
    if (!this.activeWordData) return;
    const w = this.activeWordData;

    const wordToSave = (w.root || w.original || w.wordEn || '').trim();
    const meaningToSave = (w.tr || '').replace(/🇹🇷/g, '').replace(/\(.*?\)/g, '').trim() || "Öğrenilecek Kelime / İfade";

    // 1. If in School Mode or curriculum word, add to 9th Grade School Notebook
    if (window.schoolMode && typeof window.schoolMode.addWordToSchoolNotebook === 'function') {
      window.schoolMode.addWordToSchoolNotebook(wordToSave, meaningToSave, w.type_label || 'Kelime / Kalıp');
    }

    // 2. Also add to General Custom Words Manager
    if (window.customWordsManager) {
      window.customWordsManager.addWord(wordToSave, meaningToSave);
    }

    const btn = document.getElementById('add-to-unknown-btn');
    if (btn) {
      btn.innerHTML = '🎉 Kelime Defterine Eklendi! (+3 XP)';
      btn.style.background = 'var(--success)';
      btn.style.boxShadow = '0 0 25px rgba(34, 197, 94, 0.5)';
    }

    if (window.app && !window.schoolMode) {
      window.app.showToast(`⭐ "${wordToSave}" kelime defterinize eklendi! (+3 XP)`);
    }
  }

  closeModal() {
    const modal = document.getElementById('word-lookup-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  }
}

// Global instance
window.wordLookup = new WordLookupEngine();
