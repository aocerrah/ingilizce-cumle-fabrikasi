/**
 * Interactive Word Lookup & Dictionary Engine (İnteraktif Kelime & Sözlük Motoru)
 * - Wraps all sentence words in interactive, clickable spans.
 * - Shows Part of Speech (Kelime Türü), Turkish Meaning (Türkçe Anlamı), Root/Lemma & Pronunciation.
 * - 1-Click "Bilinmeyen Kelimelere Ekle" (Add to Unknown Words / Kelime Defterim) with XP rewards.
 * - Large offline dictionary + morphological lemmatizer + online dictionary fallback.
 */

class WordLookupEngine {
  constructor() {
    this.cache = this.loadCache();
    this.modalEl = null;
    this.activeWordData = null;
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
    this.localDict = {
      // Pronouns & Basic Determiners
      "i": { tr: "ben", type: "pronoun", type_label: "Zamir (Pronoun)", icon: "🟡" },
      "you": { tr: "sen, siz", type: "pronoun", type_label: "Zamir (Pronoun)", icon: "🟡" },
      "he": { tr: "o (erkek)", type: "pronoun", type_label: "Zamir (Pronoun)", icon: "🟡" },
      "she": { tr: "o (kadın)", type: "pronoun", type_label: "Zamir (Pronoun)", icon: "🟡" },
      "it": { tr: "o (cansız/hayvan)", type: "pronoun", type_label: "Zamir (Pronoun)", icon: "🟡" },
      "we": { tr: "biz", type: "pronoun", type_label: "Zamir (Pronoun)", icon: "🟡" },
      "they": { tr: "onlar", type: "pronoun", type_label: "Zamir (Pronoun)", icon: "🟡" },
      "me": { tr: "beni, bana", type: "pronoun", type_label: "Zamir (Pronoun)", icon: "🟡" },
      "him": { tr: "onu, ona (erkek)", type: "pronoun", type_label: "Zamir (Pronoun)", icon: "🟡" },
      "her": { tr: "onu, ona / onun (kadın)", type: "pronoun", type_label: "Zamir / Sıfat", icon: "🟡" },
      "us": { tr: "bizi, bize", type: "pronoun", type_label: "Zamir (Pronoun)", icon: "🟡" },
      "them": { tr: "onları, onlara", type: "pronoun", type_label: "Zamir (Pronoun)", icon: "🟡" },
      "my": { tr: "benim", type: "possessive", type_label: "İyelik Sıfatı (Possessive)", icon: "🟡" },
      "your": { tr: "senin, sizin", type: "possessive", type_label: "İyelik Sıfatı", icon: "🟡" },
      "his": { tr: "onun (erkek)", type: "possessive", type_label: "İyelik Sıfatı", icon: "🟡" },
      "its": { tr: "onun (cansız)", type: "possessive", type_label: "İyelik Sıfatı", icon: "🟡" },
      "our": { tr: "bizim", type: "possessive", type_label: "İyelik Sıfatı", icon: "🟡" },
      "their": { tr: "onların", type: "possessive", type_label: "İyelik Sıfatı", icon: "🟡" },
      "mine": { tr: "benimki", type: "pronoun", type_label: "İyelik Zamiri", icon: "🟡" },
      "yours": { tr: "seninki", type: "pronoun", type_label: "İyelik Zamiri", icon: "🟡" },
      "this": { tr: "bu", type: "determiner", type_label: "İşaret Zamiri/Sıfatı", icon: "🟡" },
      "that": { tr: "şu, o / -ki", type: "determiner", type_label: "İşaret Zamiri / Bağlaç", icon: "🟡" },
      "these": { tr: "bunlar", type: "determiner", type_label: "İşaret Zamiri/Sıfatı", icon: "🟡" },
      "those": { tr: "şunlar, onlar", type: "determiner", type_label: "İşaret Zamiri/Sıfatı", icon: "🟡" },
      "the": { tr: "belirli nesne/kavram belirteci (harf-i tarif)", type: "article", type_label: "Belirteç (Definite Article)", icon: "⚪" },
      "a": { tr: "bir (herhangi bir)", type: "article", type_label: "Belirteç (Indefinite Article)", icon: "⚪" },
      "an": { tr: "bir (sesli harf öncesi)", type: "article", type_label: "Belirteç (Indefinite Article)", icon: "⚪" },

      // Auxiliary & Modals
      "am": { tr: "olmak (I öznesi için 'be' hali)", root: "be", type: "auxiliary", type_label: "Yardımcı Fiil (Be)", icon: "🔵" },
      "is": { tr: "olmak / -dır, -dir (he/she/it için)", root: "be", type: "auxiliary", type_label: "Yardımcı Fiil (Be)", icon: "🔵" },
      "are": { tr: "olmak / -dır, -dirler (you/we/they için)", root: "be", type: "auxiliary", type_label: "Yardımcı Fiil (Be)", icon: "🔵" },
      "was": { tr: "idi, oldu (geçmiş zaman tekil)", root: "be", type: "verb_v2", type_label: "Geçmiş Fiil (V2)", icon: "🔵" },
      "were": { tr: "idiler, oldular (geçmiş zaman çoğul)", root: "be", type: "verb_v2", type_label: "Geçmiş Fiil (V2)", icon: "🔵" },
      "been": { tr: "olmuş (be fiilinin 3. hali)", root: "be", type: "verb_v3", type_label: "Ortaç Fiil (V3)", icon: "🔵" },
      "being": { tr: "olma, olunuyor", root: "be", type: "verb_ing", type_label: "Fiil / İsim-Fiil", icon: "🔵" },
      "do": { tr: "yapmak / geniş zaman yardımcı fiili", type: "verb", type_label: "Fiil / Yardımcı Fiil", icon: "🔵" },
      "does": { tr: "yapmak (3. tekil şahıs) / yardımcı fiil", root: "do", type: "verb", type_label: "Fiil / Yardımcı Fiil", icon: "🔵" },
      "did": { tr: "yaptı (do geçmiş zaman)", root: "do", type: "verb_v2", type_label: "Geçmiş Fiil (V2)", icon: "🔵" },
      "done": { tr: "yapılmış, bitmiş (do 3. hali)", root: "do", type: "verb_v3", type_label: "Ortaç Fiil (V3)", icon: "🔵" },
      "have": { tr: "sahip olmak / perfect zaman yardımcısı", type: "verb", type_label: "Fiil / Yardımcı Fiil", icon: "🔵" },
      "has": { tr: "sahip olmak (3. tekil şahıs)", root: "have", type: "verb", type_label: "Fiil / Yardımcı Fiil", icon: "🔵" },
      "had": { tr: "sahip oldu / -mişti (have geçmiş hali)", root: "have", type: "verb_v2", type_label: "Geçmiş Fiil (V2/V3)", icon: "🔵" },
      "having": { tr: "sahip olarak, geçirerek", root: "have", type: "verb_ing", type_label: "Fiil (V-ing)", icon: "🔵" },
      "will": { tr: "gelecek zaman eki (-ecek, -acak) / irade", type: "modal", type_label: "Kip Belirteci (Modal)", icon: "🔮" },
      "would": { tr: "-erdi, -ecekti / nezaket ve istek kipi", type: "modal", type_label: "Kip Belirteci (Modal)", icon: "💡" },
      "can": { tr: "-ebilmek (yetenek, izin)", type: "modal", type_label: "Kip Belirteci (Modal)", icon: "💡" },
      "could": { tr: "-ebilirdi (geçmiş yetenek / rica)", type: "modal", type_label: "Kip Belirteci (Modal)", icon: "💡" },
      "must": { tr: "-meli, -malı (güçlü zorunluluk)", type: "modal", type_label: "Kip Belirteci (Modal)", icon: "💡" },
      "should": { tr: "-meli, -malı (tavsiye / öneri)", type: "modal", type_label: "Kip Belirteci (Modal)", icon: "💡" },
      "may": { tr: "-ebilir (olası / resmi izin)", type: "modal", type_label: "Kip Belirteci (Modal)", icon: "💡" },
      "might": { tr: "-ebilir (düşük ihtimal)", type: "modal", type_label: "Kip Belirteci (Modal)", icon: "💡" },
      "shall": { tr: "-elim mi? / gelecek zaman", type: "modal", type_label: "Kip Belirteci (Modal)", icon: "💡" },
      "ought": { tr: "-meli (ought to)", type: "modal", type_label: "Kip Belirteci (Modal)", icon: "💡" },
      "used": { tr: "kullanılmış / eskiden yapardı (used to)", type: "modal", type_label: "Kalıp / Fiil", icon: "💡" },
      "not": { tr: "değil, -me, -ma (olumsuzluk eki)", type: "adverb", type_label: "Olumsuzluk Belirteci", icon: "❌" },
      "never": { tr: "asla, hiçbir zaman", type: "adverb", type_label: "Sıklık Zarfı (Adverb)", icon: "🟣" },
      "always": { tr: "her zaman, daima", type: "adverb", type_label: "Sıklık Zarfı (Adverb)", icon: "🟣" },
      "usually": { tr: "genellikle, çoğunlukla", type: "adverb", type_label: "Sıklık Zarfı (Adverb)", icon: "🟣" },
      "often": { tr: "sık sık", type: "adverb", type_label: "Sıklık Zarfı (Adverb)", icon: "🟣" },
      "sometimes": { tr: "bazen, ara sıra", type: "adverb", type_label: "Sıklık Zarfı (Adverb)", icon: "🟣" },
      "rarely": { tr: "nadiren", type: "adverb", type_label: "Sıklık Zarfı (Adverb)", icon: "🟣" },
      "seldom": { tr: "pek nadir", type: "adverb", type_label: "Sıklık Zarfı (Adverb)", icon: "🟣" },
      "carefully": { tr: "dikkatlice, özenle", type: "adverb", type_label: "Durum Zarfı (Adverb)", icon: "🟣" },
      "quickly": { tr: "hızlıca, çabucak", type: "adverb", type_label: "Durum Zarfı (Adverb)", icon: "🟣" },
      "slowly": { tr: "yavaşça", type: "adverb", type_label: "Durum Zarfı (Adverb)", icon: "🟣" },
      "fluently": { tr: "akıcı bir şekilde", type: "adverb", type_label: "Durum Zarfı (Adverb)", icon: "🟣" },
      "easily": { tr: "kolayca, rahatlıkla", type: "adverb", type_label: "Durum Zarfı (Adverb)", icon: "🟣" },
      "safely": { tr: "güvenle, emniyetle", type: "adverb", type_label: "Durum Zarfı (Adverb)", icon: "🟣" },
      "properly": { tr: "düzgünce, gereğince", type: "adverb", type_label: "Durum Zarfı (Adverb)", icon: "🟣" },
      "successfully": { tr: "başarıyla", type: "adverb", type_label: "Durum Zarfı (Adverb)", icon: "🟣" },
      "clearly": { tr: "açıkça, net bir şekilde", type: "adverb", type_label: "Durum Zarfı (Adverb)", icon: "🟣" },
      "loudly": { tr: "yüksek sesle", type: "adverb", type_label: "Durum Zarfı (Adverb)", icon: "🟣" },
      "quietly": { tr: "sessizce", type: "adverb", type_label: "Durum Zarfı (Adverb)", icon: "🟣" },
      "bravely": { tr: "cesurca", type: "adverb", type_label: "Durum Zarfı (Adverb)", icon: "🟣" },
      "happily": { tr: "mutlulukla, sevinçle", type: "adverb", type_label: "Durum Zarfı (Adverb)", icon: "🟣" },
      "politely": { tr: "kibarca, nazikçe", type: "adverb", type_label: "Durum Zarfı (Adverb)", icon: "🟣" },
      "honestly": { tr: "dürüstçe", type: "adverb", type_label: "Durum Zarfı (Adverb)", icon: "🟣" },
      "currently": { tr: "şu anda, mevcut durumda", type: "adverb", type_label: "Zaman Zarfı (Adverb)", icon: "🟣" },
      "recently": { tr: "son zamanlarda, geçenlerde", type: "adverb", type_label: "Zaman Zarfı (Adverb)", icon: "🟣" },
      "immediately": { tr: "derhal, hemen", type: "adverb", type_label: "Zaman Zarfı (Adverb)", icon: "🟣" },
      "soon": { tr: "yakında, birazdan", type: "adverb", type_label: "Zaman Zarfı (Adverb)", icon: "🟣" },
      "already": { tr: "zaten, çoktan", type: "adverb", type_label: "Zaman Zarfı (Adverb)", icon: "🟣" },
      "still": { tr: "hâlâ, henüz", type: "adverb", type_label: "Zaman Zarfı (Adverb)", icon: "🟣" },
      "yet": { tr: "henüz / yine de, ama", type: "adverb", type_label: "Zarf / Bağlaç", icon: "🟣" },
      "suddenly": { tr: "aniden, birdenbire", type: "adverb", type_label: "Zaman Zarfı (Adverb)", icon: "🟣" },
      "gradually": { tr: "kademeli olarak, yavaş yavaş", type: "adverb", type_label: "Süreç Zarfı (Adverb)", icon: "🟣" },
      "eventually": { tr: "eninde sonunda, nihayetinde", type: "adverb", type_label: "Sonuç Zarfı (Adverb)", icon: "🟣" },
      "finally": { tr: "sonunda, nihayet", type: "adverb", type_label: "Sonuç Zarfı (Adverb)", icon: "🟣" },
      "extremely": { tr: "son derece, aşırı derecede", type: "adverb", type_label: "Derece Zarfı (Adverb)", icon: "🟣" },
      "very": { tr: "çok", type: "adverb", type_label: "Derece Zarfı (Adverb)", icon: "🟣" },
      "too": { tr: "aşırı, fazla / de, da", type: "adverb", type_label: "Derece Zarfı", icon: "🟣" },
      "quite": { tr: "oldukça, epeyce", type: "adverb", type_label: "Derece Zarfı", icon: "🟣" },
      "really": { tr: "gerçekten", type: "adverb", type_label: "Derece Zarfı", icon: "🟣" },

      // Prepositions
      "in": { tr: "içinde, -de, -da", type: "preposition", type_label: "Edat (Preposition)", icon: "🟧" },
      "on": { tr: "üzerinde, -de, -da (günlerde/tarihlerde)", type: "preposition", type_label: "Edat (Preposition)", icon: "🟧" },
      "at": { tr: "-de, -da (saatlerde, belirli noktalarda)", type: "preposition", type_label: "Edat (Preposition)", icon: "🟧" },
      "to": { tr: "-e, -a (yönelme / mastar eki)", type: "preposition", type_label: "Edat / Mastar Eki", icon: "🟧" },
      "for": { tr: "için / -dır, -dir (süre)", type: "preposition", type_label: "Edat (Preposition)", icon: "🟧" },
      "with": { tr: "ile, birlikte", type: "preposition", type_label: "Edat (Preposition)", icon: "🟧" },
      "without": { tr: "-sız, -siz, olmadan", type: "preposition", type_label: "Edat (Preposition)", icon: "🟧" },
      "from": { tr: "-den, -dan", type: "preposition", type_label: "Edat (Preposition)", icon: "🟧" },
      "by": { tr: "tarafından / ile / -e kadar", type: "preposition", type_label: "Edat (Preposition)", icon: "🟧" },
      "about": { tr: "hakkında / yaklaşık", type: "preposition", type_label: "Edat / Zarf", icon: "🟧" },
      "of": { tr: "-ın, -in (aitlik) / -den", type: "preposition", type_label: "Edat (Preposition)", icon: "🟧" },
      "during": { tr: "sırasında, boyunca", type: "preposition", type_label: "Edat (Preposition)", icon: "🟧" },
      "before": { tr: "önce, önünde", type: "preposition", type_label: "Edat / Bağlaç", icon: "🟧" },
      "after": { tr: "sonra, ardından", type: "preposition", type_label: "Edat / Bağlaç", icon: "🟧" },
      "under": { tr: "altında", type: "preposition", type_label: "Edat (Preposition)", icon: "🟧" },
      "over": { tr: "üzerinde, aşırı", type: "preposition", type_label: "Edat (Preposition)", icon: "🟧" },
      "between": { tr: "arasında (iki şeyin)", type: "preposition", type_label: "Edat (Preposition)", icon: "🟧" },
      "among": { tr: "arasında (ikiden fazla)", type: "preposition", type_label: "Edat (Preposition)", icon: "🟧" },
      "into": { tr: "içine doğru", type: "preposition", type_label: "Edat (Preposition)", icon: "🟧" },
      "through": { tr: "içinden, vasıtasıyla", type: "preposition", type_label: "Edat (Preposition)", icon: "🟧" },
      "against": { tr: "karşı, aleyhinde", type: "preposition", type_label: "Edat (Preposition)", icon: "🟧" },

      // Conjunctions
      "and": { tr: "ve", type: "conjunction", type_label: "Bağlaç (Conjunction)", icon: "🟠" },
      "but": { tr: "ama, fakat, lakin", type: "conjunction", type_label: "Bağlaç (Conjunction)", icon: "🟠" },
      "or": { tr: "veya, ya da, yoksa", type: "conjunction", type_label: "Bağlaç (Conjunction)", icon: "🟠" },
      "because": { tr: "çünkü, -dığı için", type: "conjunction", type_label: "Sebep Bağlacı (Conjunction)", icon: "🟠" },
      "so": { tr: "bu yüzden, böylece, öyle", type: "conjunction", type_label: "Sonuç Bağlacı (Conjunction)", icon: "🟠" },
      "although": { tr: "-e rağmen, karşın", type: "conjunction", type_label: "Zıtlık Bağlacı (Conjunction)", icon: "🟠" },
      "though": { tr: "rağmen, gerçi", type: "conjunction", type_label: "Zıtlık Bağlacı (Conjunction)", icon: "🟠" },
      "while": { tr: "iken, o sırada / oysa", type: "conjunction", type_label: "Zaman/Zıtlık Bağlacı", icon: "🟠" },
      "if": { tr: "eğer, şayet, -se/-sa", type: "conjunction", type_label: "Koşul Bağlacı (Condition)", icon: "🟠" },
      "unless": { tr: "-medikçe, -mezse (if not)", type: "conjunction", type_label: "Koşul Bağlacı", icon: "🟠" },
      "since": { tr: "-den beri / -dığı için", type: "conjunction", type_label: "Zaman/Sebep Bağlacı", icon: "🟠" },
      "until": { tr: "-e kadar (sürekli durum)", type: "conjunction", type_label: "Zaman Bağlacı", icon: "🟠" },
      "when": { tr: "-dığı zaman, ne zaman", type: "conjunction", type_label: "Zaman Bağlacı", icon: "🟠" },
      "whenever": { tr: "her ne zaman ... ise", type: "conjunction", type_label: "Zaman Bağlacı", icon: "🟠" },
      "where": { tr: "nerede, nereye / -dığı yer", type: "conjunction", type_label: "Soru / İlgi Zamiri", icon: "🟠" },
      "which": { tr: "hangi / ki o (nesneler için)", type: "pronoun", type_label: "İlgi Zamiri (Relative)", icon: "🟠" },
      "who": { tr: "kim / ki o (insanlar için)", type: "pronoun", type_label: "İlgi Zamiri (Relative)", icon: "🟠" },
      "whom": { tr: "kimi, kime", type: "pronoun", type_label: "İlgi Zamiri", icon: "🟠" },
      "whose": { tr: "kimin / ki onun", type: "pronoun", type_label: "İlgi Zamiri", icon: "🟠" },
      "why": { tr: "neden, niçin", type: "adverb", type_label: "Soru Zarfı", icon: "🟣" },
      "how": { tr: "nasıl, ne kadar", type: "adverb", type_label: "Soru Zarfı", icon: "🟣" },
      "what": { tr: "ne / şey", type: "pronoun", type_label: "Soru / Zamir", icon: "🟡" },
      "therefore": { tr: "bu nedenle, bu yüzden, dolayısıyla", type: "conjunction", type_label: "Sonuç Bağlacı", icon: "🟠" },
      "however": { tr: "ancak, yine de, oysa", type: "conjunction", type_label: "Geçiş Bağlacı", icon: "🟠" },
      "moreover": { tr: "dahası, ayrıca", type: "conjunction", type_label: "Ek Bilgi Bağlacı", icon: "🟠" },
      "furthermore": { tr: "üstelik, bundan başka", type: "conjunction", type_label: "Ek Bilgi Bağlacı", icon: "🟠" },
      "besides": { tr: "ayrıca, bundan başka", type: "conjunction", type_label: "Ek Bilgi Bağlacı", icon: "🟠" },
      "consequently": { tr: "sonuç olarak, dolayısıyla", type: "conjunction", type_label: "Sonuç Bağlacı", icon: "🟠" },

      // Common Classroom, Academic & Daily Nouns
      "student": { tr: "öğrenci", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "students": { tr: "öğrenciler", root: "student", type: "noun_plural", type_label: "Çoğul İsim (Noun)", icon: "🔴" },
      "teacher": { tr: "öğretmen", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "professor": { tr: "profesör", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "athlete": { tr: "sporcu, atlet", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "athletes": { tr: "sporcular", root: "athlete", type: "noun_plural", type_label: "Çoğul İsim (Noun)", icon: "🔴" },
      "coach": { tr: "antrenör, koç / eğitmek", type: "noun", type_label: "İsim / Fiil", icon: "🔴" },
      "scientist": { tr: "bilim insanı", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "scientists": { tr: "bilim insanları", root: "scientist", type: "noun_plural", type_label: "Çoğul İsim (Noun)", icon: "🔴" },
      "researcher": { tr: "araştırmacı", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "researchers": { tr: "araştırmacılar", root: "researcher", type: "noun_plural", type_label: "Çoğul İsim", icon: "🔴" },
      "doctor": { tr: "doktor", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "engineer": { tr: "mühendis", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "engineers": { tr: "mühendisler", root: "engineer", type: "noun_plural", type_label: "Çoğul İsim", icon: "🔴" },
      "child": { tr: "çocuk", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "children": { tr: "çocuklar", root: "child", type: "noun_plural", type_label: "Düzensiz Çoğul İsim", icon: "🔴" },
      "parent": { tr: "ebeveyn (anne/baba)", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "parents": { tr: "ebeveynler (anne-baba)", root: "parent", type: "noun_plural", type_label: "Çoğul İsim", icon: "🔴" },
      "father": { tr: "baba", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "mother": { tr: "anne", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "sister": { tr: "kız kardeş", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "brother": { tr: "erkek kardeş", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "family": { tr: "aile", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "team": { tr: "takım, ekip", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "teammate": { tr: "takım arkadaşı", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "teammates": { tr: "takım arkadaşları", root: "teammate", type: "noun_plural", type_label: "Çoğul İsim", icon: "🔴" },
      "player": { tr: "oyuncu", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "players": { tr: "oyuncular", root: "player", type: "noun_plural", type_label: "Çoğul İsim", icon: "🔴" },
      "friend": { tr: "arkadaş, dost", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "friends": { tr: "arkadaşlar", root: "friend", type: "noun_plural", type_label: "Çoğul İsim", icon: "🔴" },
      "library": { tr: "kütüphane", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "school": { tr: "okul", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "university": { tr: "üniversite", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "laboratory": { tr: "laboratuvar", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "lab": { tr: "laboratuvar (kısa)", root: "laboratory", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "classroom": { tr: "derslik, sınıf", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "room": { tr: "oda", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "house": { tr: "ev", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "home": { tr: "ev, yuva", type: "noun", type_label: "İsim / Zarf", icon: "🔴" },
      "book": { tr: "kitap / yer ayırtmak", type: "noun", type_label: "İsim / Fiil", icon: "🔴" },
      "books": { tr: "kitaplar", root: "book", type: "noun_plural", type_label: "Çoğul İsim", icon: "🔴" },
      "exam": { tr: "sınav", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "test": { tr: "test, deneme / test etmek", type: "noun", type_label: "İsim / Fiil", icon: "🔴" },
      "experiment": { tr: "deney / deney yapmak", type: "noun", type_label: "İsim / Fiil", icon: "🔴" },
      "project": { tr: "proje / yansıtmak", type: "noun", type_label: "İsim / Fiil", icon: "🔴" },
      "question": { tr: "soru / sorgulamak", type: "noun", type_label: "İsim / Fiil", icon: "🔴" },
      "answer": { tr: "cevap, yanıt / yanıtlamak", type: "noun", type_label: "İsim / Fiil", icon: "🔴" },
      "sentence": { tr: "cümle / hüküm", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "word": { tr: "kelime, sözcük", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "words": { tr: "kelimeler", root: "word", type: "noun_plural", type_label: "Çoğul İsim", icon: "🔴" },
      "grammar": { tr: "dilbilgisi, gramer", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "english": { tr: "İngilizce / İngiliz", type: "noun", type_label: "Özel İsim / Sıfat", icon: "🔴" },
      "turkish": { tr: "Türkçe / Türk", type: "noun", type_label: "Özel İsim / Sıfat", icon: "🔴" },
      "robot": { tr: "robot", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "sensor": { tr: "sensör, algılayıcı", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "sensors": { tr: "sensörler", root: "sensor", type: "noun_plural", type_label: "Çoğul İsim", icon: "🔴" },
      "data": { tr: "veri, bilgiler", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "computer": { tr: "bilgisayar", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "software": { tr: "yazılım", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "application": { tr: "uygulama / başvuru", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "app": { tr: "uygulama (kısa)", root: "application", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "match": { tr: "maç, müsabaka / kibrit / eşleştirmek", type: "noun", type_label: "İsim / Fiil", icon: "🔴" },
      "game": { tr: "oyun, maç", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "tournament": { tr: "turnuva", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "championship": { tr: "şampiyona, şampiyonluk", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "trophy": { tr: "kupa, ödül", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "medal": { tr: "madalya", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "volleyball": { tr: "voleybol", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "soccer": { tr: "futbol", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "football": { tr: "futbol / Amerikan futbolu", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "basketball": { tr: "basketbol", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "pizza": { tr: "pizza", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "apple": { tr: "elma", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "banana": { tr: "muz", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "water": { tr: "su / sulamak", type: "noun", type_label: "İsim / Fiil", icon: "🔴" },
      "coffee": { tr: "kahve", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "tea": { tr: "çay", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "time": { tr: "zaman, vakit, kez", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "day": { tr: "gün", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "morning": { tr: "sabah", type: "noun", type_label: "İsim / Zarf", icon: "🔴" },
      "afternoon": { tr: "öğleden sonra", type: "noun", type_label: "İsim / Zarf", icon: "🔴" },
      "evening": { tr: "akşam", type: "noun", type_label: "İsim / Zarf", icon: "🔴" },
      "night": { tr: "gece", type: "noun", type_label: "İsim / Zarf", icon: "🔴" },
      "today": { tr: "bugün", type: "adverb", type_label: "Zaman Zarfı / İsim", icon: "🟣" },
      "yesterday": { tr: "dün", type: "adverb", type_label: "Zaman Zarfı / İsim", icon: "🟣" },
      "tomorrow": { tr: "yarın", type: "adverb", type_label: "Zaman Zarfı / İsim", icon: "🟣" },
      "week": { tr: "hafta", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "month": { tr: "ay (takvim)", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },
      "year": { tr: "yıl, sene", type: "noun", type_label: "İsim (Noun)", icon: "🔴" },

      // Common Adjectives
      "good": { tr: "iyi, güzel", type: "adjective", type_label: "Sıfat (Adjective)", icon: "🟩" },
      "better": { tr: "daha iyi", root: "good", type: "adjective_comp", type_label: "Karşılaştırma Sıfatı", icon: "🟩" },
      "best": { tr: "en iyi", root: "good", type: "adjective_sup", type_label: "Üstünlük Sıfatı", icon: "🟩" },
      "bad": { tr: "kötü", type: "adjective", type_label: "Sıfat (Adjective)", icon: "🟩" },
      "worse": { tr: "daha kötü", root: "bad", type: "adjective_comp", type_label: "Karşılaştırma Sıfatı", icon: "🟩" },
      "worst": { tr: "en kötü", root: "bad", type: "adjective_sup", type_label: "Üstünlük Sıfatı", icon: "🟩" },
      "great": { tr: "harika, mükemmel, büyük", type: "adjective", type_label: "Sıfat (Adjective)", icon: "🟩" },
      "fast": { tr: "hızlı / hızlıca", type: "adjective", type_label: "Sıfat / Zarf", icon: "🟩" },
      "slow": { tr: "yavaş", type: "adjective", type_label: "Sıfat (Adjective)", icon: "🟩" },
      "easy": { tr: "kolay", type: "adjective", type_label: "Sıfat (Adjective)", icon: "🟩" },
      "difficult": { tr: "zor, güç", type: "adjective", type_label: "Sıfat (Adjective)", icon: "🟩" },
      "hard": { tr: "zor, sert / sıkıca", type: "adjective", type_label: "Sıfat / Zarf", icon: "🟩" },
      "important": { tr: "önemli", type: "adjective", type_label: "Sıfat (Adjective)", icon: "🟩" },
      "essential": { tr: "temel, vazgeçilmez, hayati", type: "adjective", type_label: "Sıfat (Adjective)", icon: "🟩" },
      "careful": { tr: "dikkatli, özenli", type: "adjective", type_label: "Sıfat (Adjective)", icon: "🟩" },
      "disciplined": { tr: "disiplinli", type: "adjective", type_label: "Sıfat (Adjective)", icon: "🟩" },
      "curious": { tr: "meraklı", type: "adjective", type_label: "Sıfat (Adjective)", icon: "🟩" },
      "delicate": { tr: "hassas, narin", type: "adjective", type_label: "Sıfat (Adjective)", icon: "🟩" },
      "ancient": { tr: "antik, çok eski", type: "adjective", type_label: "Sıfat (Adjective)", icon: "🟩" },
      "delicious": { tr: "lezzetli", type: "adjective", type_label: "Sıfat (Adjective)", icon: "🟩" },
      "innovative": { tr: "yenilikçi, inovatif", type: "adjective", type_label: "Sıfat (Adjective)", icon: "🟩" },
      "scientific": { tr: "bilimsel", type: "adjective", type_label: "Sıfat (Adjective)", icon: "🟩" },
      "academic": { tr: "akademik", type: "adjective", type_label: "Sıfat (Adjective)", icon: "🟩" },
      "smart": { tr: "akıllı, zeki", type: "adjective", type_label: "Sıfat (Adjective)", icon: "🟩" },
      "young": { tr: "genç", type: "adjective", type_label: "Sıfat (Adjective)", icon: "🟩" },
      "old": { tr: "yaşlı, eski", type: "adjective", type_label: "Sıfat (Adjective)", icon: "🟩" },
      "new": { tr: "yeni", type: "adjective", type_label: "Sıfat (Adjective)", icon: "🟩" },
      "happy": { tr: "mutlu", type: "adjective", type_label: "Sıfat (Adjective)", icon: "🟩" },
      "sad": { tr: "üzgün", type: "adjective", type_label: "Sıfat (Adjective)", icon: "🟩" },
      "tired": { tr: "yorgun", type: "adjective", type_label: "Sıfat (Adjective)", icon: "🟩" },
      "ready": { tr: "hazır", type: "adjective", type_label: "Sıfat (Adjective)", icon: "🟩" },
      "quiet": { tr: "sessiz, sakin", type: "adjective", type_label: "Sıfat (Adjective)", icon: "🟩" },
      "loud": { tr: "yüksek sesli, gürültülü", type: "adjective", type_label: "Sıfat (Adjective)", icon: "🟩" },
      "brave": { tr: "cesur", type: "adjective", type_label: "Sıfat (Adjective)", icon: "🟩" },
      "polite": { tr: "kibar, nazik", type: "adjective", type_label: "Sıfat (Adjective)", icon: "🟩" },
      "honest": { tr: "dürüst, samimi", type: "adjective", type_label: "Sıfat (Adjective)", icon: "🟩" },
      "expensive": { tr: "pahalı", type: "adjective", type_label: "Sıfat (Adjective)", icon: "🟩" },
      "cheap": { tr: "ucuz", type: "adjective", type_label: "Sıfat (Adjective)", icon: "🟩" },
      "beautiful": { tr: "güzel", type: "adjective", type_label: "Sıfat (Adjective)", icon: "🟩" },
      "big": { tr: "büyük", type: "adjective", type_label: "Sıfat (Adjective)", icon: "🟩" },
      "small": { tr: "küçük", type: "adjective", type_label: "Sıfat (Adjective)", icon: "🟩" },
      "tall": { tr: "uzun (boy)", type: "adjective", type_label: "Sıfat (Adjective)", icon: "🟩" },
      "short": { tr: "kısa", type: "adjective", type_label: "Sıfat (Adjective)", icon: "🟩" },
      "hot": { tr: "sıcak", type: "adjective", type_label: "Sıfat (Adjective)", icon: "🟩" },
      "cold": { tr: "soğuk / nezle", type: "adjective", type_label: "Sıfat / İsim", icon: "🟩" }
    };

    // Load verbs from APP_DATA
    if (window.APP_DATA && window.APP_DATA.verbs) {
      window.APP_DATA.verbs.forEach(v => {
        const verbKey = (v.verb || v.word || '').toLowerCase();
        if (verbKey) {
          if (!this.localDict[verbKey]) {
            this.localDict[verbKey] = {
              tr: v.meaning,
              type: "verb",
              type_label: "Fiil (Verb)",
              icon: "🔵",
              category: v.category,
              level: v.level,
              forms: v.forms
            };
          }

          // Register irregular V2 and V3 forms
          if (v.forms) {
            if (v.forms.v2 && v.forms.v2 !== '-') {
              v.forms.v2.split('/').forEach(v2Item => {
                const cleanV2 = v2Item.trim().toLowerCase();
                if (cleanV2 && !this.localDict[cleanV2]) {
                  this.localDict[cleanV2] = {
                    tr: `${v.meaning} (Geçmiş Zaman V2)`,
                    root: verbKey,
                    type: "verb_v2",
                    type_label: "Geçmiş Fiil (V2)",
                    icon: "🔵",
                    category: v.category
                  };
                }
              });
            }
            if (v.forms.v3 && v.forms.v3 !== '-') {
              v.forms.v3.split('/').forEach(v3Item => {
                const cleanV3 = v3Item.trim().toLowerCase();
                if (cleanV3 && !this.localDict[cleanV3]) {
                  this.localDict[cleanV3] = {
                    tr: `${v.meaning} (Ortaç / 3. Hal V3)`,
                    root: verbKey,
                    type: "verb_v3",
                    type_label: "Ortaç Fiil (V3)",
                    icon: "🔵",
                    category: v.category
                  };
                }
              });
            }
          }
        }
      });
    }

    // Load master words from APP_DATA.all_words (adverbs, conjunctions, phrasal verbs, etc.)
    if (window.APP_DATA && window.APP_DATA.all_words) {
      window.APP_DATA.all_words.forEach(w => {
        const key = (w.word || '').toLowerCase().trim();
        if (key && !this.localDict[key]) {
          this.localDict[key] = {
            tr: w.meaning,
            type: w.type || "word",
            type_label: w.type_label || "Kelime",
            icon: w.type_icon || "📓",
            category: w.category,
            level: w.level
          };
        }
      });
    }
  }

  /* =========================================================
     2. MORPHOLOGICAL LEMMATIZER & ROOT FINDER
     ========================================================= */
  lemmatize(cleanWord) {
    const w = cleanWord.toLowerCase().trim();
    if (!w) return null;

    // 1. Direct hit in dictionary or cache
    if (this.localDict[w]) return { ...this.localDict[w], wordEn: w, original: cleanWord };
    if (this.cache[w]) return { ...this.cache[w], wordEn: w, original: cleanWord };

    // Check custom words
    if (window.customWordsManager) {
      const customMatch = window.customWordsManager.customWords.find(cw => cw.wordEn.toLowerCase() === w);
      if (customMatch) {
        return {
          tr: customMatch.meaningTr,
          type: "custom",
          type_label: "Kelime Defterim",
          icon: "⭐",
          wordEn: customMatch.wordEn,
          original: cleanWord
        };
      }
    }

    // 2. Contractions mapping
    const contractionMap = {
      "don't": { root: "do", tr: "yapma(mak) / olumsuz geniş zaman", type_label: "Olumsuz Yardımcı Fiil" },
      "doesn't": { root: "does", tr: "yapma(mak) / olumsuz geniş zaman", type_label: "Olumsuz Yardımcı Fiil" },
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

    // 3. Morphological Stemming Rules
    const candidates = [];

    // Rule: -ing (running -> run, making -> make, studying -> study, playing -> play)
    if (w.endsWith('ing') && w.length > 4) {
      const base = w.slice(0, -3);
      candidates.push({ stem: base, rule: 'verb_ing' }); // e.g. play -> playing
      candidates.push({ stem: base + 'e', rule: 'verb_ing' }); // e.g. make -> making
      if (base.length > 2 && base[base.length - 1] === base[base.length - 2]) {
        candidates.push({ stem: base.slice(0, -1), rule: 'verb_ing' }); // e.g. run -> running
      }
      if (base.endsWith('y')) {
        candidates.push({ stem: base.slice(0, -1) + 'ie', rule: 'verb_ing' }); // e.g. die -> dying
      }
    }

    // Rule: -ed / -d (played -> play, danced -> dance, stopped -> stop, studied -> study)
    if (w.endsWith('ed') && w.length > 3) {
      const base = w.slice(0, -2);
      candidates.push({ stem: base, rule: 'verb_ed' }); // play
      candidates.push({ stem: base + 'e', rule: 'verb_ed' }); // dance
      if (base.length > 2 && base[base.length - 1] === base[base.length - 2]) {
        candidates.push({ stem: base.slice(0, -1), rule: 'verb_ed' }); // stop
      }
      if (base.endsWith('i')) {
        candidates.push({ stem: base.slice(0, -1) + 'y', rule: 'verb_ed' }); // study
      }
    }

    // Rule: Plural or 3rd Person Singular -s, -es, -ies (books -> book, watches -> watch, flies -> fly)
    if (w.endsWith('ies') && w.length > 4) {
      candidates.push({ stem: w.slice(0, -3) + 'y', rule: 'plural_ies' });
    } else if (w.endsWith('es') && w.length > 3) {
      candidates.push({ stem: w.slice(0, -2), rule: 'plural_es' });
      candidates.push({ stem: w.slice(0, -1), rule: 'plural_s' });
    } else if (w.endsWith('s') && !w.endsWith('ss') && w.length > 2) {
      candidates.push({ stem: w.slice(0, -1), rule: 'plural_s' });
    }

    // Rule: Adverbs -ly (carefully -> careful, quickly -> quick)
    if (w.endsWith('ly') && w.length > 4) {
      candidates.push({ stem: w.slice(0, -2), rule: 'adverb_ly' });
      if (w.endsWith('ily')) {
        candidates.push({ stem: w.slice(0, -3) + 'y', rule: 'adverb_ly' }); // happily -> happy
      }
    }

    // Rule: Comparatives & Superlatives -er, -est (faster -> fast, biggest -> big, happiest -> happy)
    if (w.endsWith('est') && w.length > 4) {
      candidates.push({ stem: w.slice(0, -3), rule: 'superlative' });
      candidates.push({ stem: w.slice(0, -2), rule: 'superlative' });
      if (w.endsWith('iest')) candidates.push({ stem: w.slice(0, -4) + 'y', rule: 'superlative' });
    } else if (w.endsWith('er') && w.length > 3) {
      candidates.push({ stem: w.slice(0, -2), rule: 'comparative' });
      candidates.push({ stem: w.slice(0, -1), rule: 'comparative' });
      if (w.endsWith('ier')) candidates.push({ stem: w.slice(0, -3) + 'y', rule: 'comparative' });
    }

    // Check if any candidate stem exists in the local dictionary
    for (const c of candidates) {
      if (this.localDict[c.stem]) {
        const entry = this.localDict[c.stem];
        let suffixDesc = "";
        let finalType = entry.type_label || entry.type;

        if (c.rule === 'verb_ing') {
          suffixDesc = " (Şimdiki Zaman / -ing Hali)";
          finalType = "Şimdiki Zaman / Fiil (V-ing)";
        } else if (c.rule === 'verb_ed') {
          suffixDesc = " (Geçmiş Zaman / -ed Hali)";
          finalType = "Geçmiş Zaman / Fiil (V2/V3)";
        } else if (c.rule.startsWith('plural')) {
          suffixDesc = " (Çoğul / 3. Tekil)";
          finalType = entry.type === 'noun' ? "Çoğul İsim (Plural Noun)" : "Geniş Zaman Fiil (3. Tekil)";
        } else if (c.rule === 'adverb_ly') {
          suffixDesc = " (Zarf Hali)";
          finalType = "Durum Zarfı (Adverb)";
        } else if (c.rule === 'comparative') {
          suffixDesc = " (Daha ... Karşılaştırma Hali)";
          finalType = "Karşılaştırma Sıfatı (Comparative)";
        } else if (c.rule === 'superlative') {
          suffixDesc = " (En ... Üstünlük Hali)";
          finalType = "Üstünlük Sıfatı (Superlative)";
        }

        return {
          ...entry,
          wordEn: w,
          root: c.stem,
          tr: `${entry.tr}${suffixDesc}`,
          type_label: finalType,
          original: cleanWord
        };
      }
    }

    // 4. Default Guess based on ending if not found
    let guessedType = "Kelime (Word)";
    let guessedIcon = "📝";
    if (w.endsWith('ly')) { guessedType = "Muhtemel Zarf (Adverb)"; guessedIcon = "🟣"; }
    else if (w.endsWith('tion') || w.endsWith('ment') || w.endsWith('ness') || w.endsWith('ity')) { guessedType = "İsim (Noun)"; guessedIcon = "🔴"; }
    else if (w.endsWith('able') || w.endsWith('ful') || w.endsWith('less') || w.endsWith('ous') || w.endsWith('ive')) { guessedType = "Sıfat (Adjective)"; guessedIcon = "🟩"; }
    else if (w.endsWith('ing') || w.endsWith('ed')) { guessedType = "Fiil / Sıfat"; guessedIcon = "🔵"; }

    return {
      wordEn: w,
      tr: "Anlam aranıyor...",
      type: "unknown",
      type_label: guessedType,
      icon: guessedIcon,
      isUnknown: true,
      original: cleanWord
    };
  }

  /* =========================================================
     3. UNIVERSAL SENTENCE WRAPPER (WRAP WORDS INTERACTIVELY)
     ========================================================= */
  wrap(htmlOrText) {
    if (!htmlOrText || typeof htmlOrText !== 'string') return htmlOrText || '';

    // If text contains HTML tags like <span class="...">, only wrap text nodes inside
    // Split by HTML tags and tokenize only the text parts
    const parts = htmlOrText.split(/(<[^>]+>)/g);

    return parts.map(part => {
      if (part.startsWith('<') && part.endsWith('>')) {
        return part; // Return existing HTML tag intact
      }

      // Tokenize words, contractions and punctuations
      // Matches words like "shouldn't", "don't", "athlete's", "well-known", "carefully"
      return part.replace(/\b([a-zA-Z]+(?:'[a-zA-Z]+)?)\b/g, (match) => {
        const clean = match.replace(/'s$/i, '').trim();
        return `<span class="interactive-word" onclick="wordLookup.openWord('${clean.replace(/'/g, "\\'")}', event)" data-word="${clean}">${match}</span>`;
      });
    }).join('');
  }

  /* =========================================================
     4. OPEN WORD DETAIL MODAL & ASYNC DICTIONARY FETCH
     ========================================================= */
  openWord(rawWord, event) {
    if (event) {
      event.stopPropagation();
    }

    const clean = rawWord.replace(/[^a-zA-Z']/g, '').trim();
    if (!clean) return;

    // Fast lookup via lemmatizer
    let data = this.lemmatize(clean);
    this.activeWordData = data;

    // Render modal immediately with local/lemmatized data
    this.renderModal(data);

    // Speak the word automatically for delightful learning
    if (window.speechEngine) {
      setTimeout(() => window.speechEngine.speak(clean), 150);
    }

    // If translation is unknown, query online dictionary in background
    if (data.isUnknown || data.tr.includes('aranıyor')) {
      this.fetchOnlineDefinition(clean);
    }
  }

  async fetchOnlineDefinition(word) {
    const cleanWord = word.toLowerCase().trim();
    try {
      // 1. Try Google Translate / Free API for instant accurate Turkish meaning
      const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=tr&dt=t&q=${encodeURIComponent(cleanWord)}`);
      if (res.ok) {
        const json = await res.json();
        if (json && json[0] && json[0][0] && json[0][0][0]) {
          const turkishMeaning = json[0][0][0].trim();
          
          this.activeWordData.tr = turkishMeaning;
          this.activeWordData.isUnknown = false;
          
          // Cache the translation permanently
          this.cache[cleanWord] = {
            tr: turkishMeaning,
            type: this.activeWordData.type || "word",
            type_label: this.activeWordData.type_label || "Kelime",
            icon: this.activeWordData.icon || "📓",
            wordEn: cleanWord
          };
          this.saveCache();

          // Update open modal if still on screen
          this.updateModalContent(this.activeWordData);
        }
      }
    } catch (e) {
      console.warn("Online dictionary lookup skipped:", e);
    }
  }

  /* =========================================================
     5. MODAL RENDERING & "BİLİNMEYEN KELİMEYE EKLE" ACTION
     ========================================================= */
  renderModal(data) {
    let modal = document.getElementById('word-lookup-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'word-lookup-modal';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    const isAlreadyInCustom = window.customWordsManager ? 
      window.customWordsManager.customWords.some(cw => cw.wordEn.toLowerCase() === data.wordEn.toLowerCase() || cw.wordEn.toLowerCase() === (data.root || '').toLowerCase()) : false;

    const rootDisplay = data.root && data.root.toLowerCase() !== data.wordEn.toLowerCase() ? 
      `<div class="word-lemma-badge">Kök Fiil/Kelime: <strong>${data.root}</strong></div>` : '';

    modal.innerHTML = `
      <div class="modal-card word-lookup-card animate-scale-up">
        <!-- Header -->
        <div class="modal-header" style="margin-bottom:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:1.4rem;">${data.icon || '📖'}</span>
            <div>
              <span class="word-type-tag" style="background:var(--primary-glow); color:var(--primary); font-size:0.75rem; padding:2px 8px; border-radius:var(--radius-sm); font-weight:700;">
                ${data.type_label || 'Kelime'}
              </span>
              ${data.level ? `<span style="font-size:0.72rem; color:var(--text-muted); margin-left:6px; font-weight:700;">${data.level} Seviyesi</span>` : ''}
            </div>
          </div>
          <button class="icon-btn" onclick="wordLookup.closeModal()" title="Kapat" style="font-size:1.1rem; width:34px; height:34px;">✕</button>
        </div>

        <!-- Main Word and Audio -->
        <div class="word-hero-row" style="display:flex; justify-content:space-between; align-items:center; margin:8px 0;">
          <div>
            <h2 style="font-size:2rem; font-weight:900; color:#ffffff; margin:0; line-height:1.2; text-transform:capitalize;">
              ${data.original || data.wordEn}
            </h2>
            ${rootDisplay}
          </div>
          <button class="btn-primary" style="padding:10px 16px; font-size:0.95rem; border-radius:var(--radius-md); box-shadow:0 0 15px var(--primary-glow);" 
                  onclick="speechEngine.speak('${(data.original || data.wordEn).replace(/'/g, "\\'")}')">
            🔊 Dinle
          </button>
        </div>

        <!-- Meaning Box -->
        <div class="word-meaning-box" style="background:var(--bg-main); border:1px solid var(--border-subtle); border-left:4px solid var(--primary); padding:12px 14px; border-radius:var(--radius-md); margin:12px 0;">
          <span style="font-size:0.72rem; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px;">TÜRKÇE ANLAMI</span>
          <div id="word-lookup-tr-text" style="font-size:1.25rem; font-weight:800; color:var(--primary); margin-top:3px;">
            🇹🇷 ${data.tr}
          </div>
        </div>

        ${data.forms && data.forms.v1 ? `
          <div class="verb-forms-mini" style="display:flex; gap:8px; font-size:0.75rem; background:var(--bg-surface); padding:8px; border-radius:var(--radius-sm); margin-bottom:12px; color:var(--text-secondary);">
            <span><strong>V1:</strong> ${data.forms.v1}</span>
            <span><strong>V2:</strong> ${data.forms.v2 || '-'}</span>
            <span><strong>V3:</strong> ${data.forms.v3 || '-'}</span>
          </div>
        ` : ''}

        <!-- Actions -->
        <div style="display:flex; flex-direction:column; gap:8px; margin-top:8px;">
          <button id="add-to-unknown-btn" class="btn-primary" 
                  style="width:100%; justify-content:center; padding:12px; font-size:0.92rem; font-weight:800; background:${isAlreadyInCustom ? 'var(--success)' : 'linear-gradient(135deg, #f59e0b, #d97706)'}; box-shadow:0 0 20px ${isAlreadyInCustom ? 'rgba(34, 197, 94, 0.4)' : 'rgba(245, 158, 11, 0.35)'};"
                  onclick="wordLookup.addActiveWordToNotebook()">
            ${isAlreadyInCustom ? '✅ Kelime Defterinizde Kayıtlı' : '⭐ Bilinmeyen Kelimelere Ekle (+3 XP)'}
          </button>
          
          <div style="display:flex; gap:8px;">
            <button class="btn-secondary" style="flex:1; justify-content:center; font-size:0.8rem; padding:8px;" 
                    onclick="sentenceBuilder.loadPresetWord('${(data.root || data.wordEn).replace(/'/g, "\\'")}', '${data.type || 'verb'}'); wordLookup.closeModal(); app.switchTab('builder');">
              🧩 Bu Kelimeyle Cümle Kur
            </button>
            <button class="btn-secondary" style="flex:1; justify-content:center; font-size:0.8rem; padding:8px;" onclick="wordLookup.closeModal()">
              Tamam
            </button>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('active');

    // Close on overlay click
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
    const meaningToSave = (w.tr || '').replace(/🇹🇷/g, '').replace(/\(.*?\)/g, '').trim() || "Öğrenilecek Kelime";

    if (window.customWordsManager) {
      const added = window.customWordsManager.addWord(wordToSave, meaningToSave);
      
      const btn = document.getElementById('add-to-unknown-btn');
      if (btn) {
        btn.innerHTML = '🎉 Kelime Defterine Eklendi! (+3 XP)';
        btn.style.background = 'var(--success)';
        btn.style.boxShadow = '0 0 25px rgba(34, 197, 94, 0.5)';
      }

      if (window.app) {
        window.app.showToast(`⭐ "${wordToSave}" kelime defterinize eklendi! (+3 XP)`);
      }
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
