import json
import os

filepath = "/Users/alionurcerrah/Desktop/İngilizce Kelime/data/school_fly_higher.json"

with open(filepath, "r", encoding="utf-8") as f:
    data = json.load(f)

# Comprehensive 9th Grade Grammar Guide Database for Richmond Fly Higher 2.0
grammar_db = {
    "fh_unit_starter": {
        "title": "Welcome Unit: Present Simple vs. Present Continuous & State Verbs",
        "badge": "Geniş Zaman vs. Şimdiki Zaman & Durum Fiilleri",
        "video_data": {
            "title": "9. Sınıf: Present Simple vs. Present Continuous & State Verbs",
            "search_query": "Present Simple vs Present Continuous konu anlatımı 9. sınıf",
            "videos": [
                { "id": "JLdIAa8jaZM", "title": "Present Simple Tense Detaylı Konu Anlatımı", "author": "Ayse Eser" },
                { "id": "QTJS3nuEn-Y", "title": "Present Continuous Tense Konu Anlatımı", "author": "Ms. Jasmin ELT" },
                { "id": "DPR3MFHpg6c", "title": "Present Simple ve Continuous Farkları & State Verbs", "author": "Ayse Eser" },
                { "id": "BYnlEYOy2z0", "title": "7 Dakikada Simple Present & Continuous Ayrımı", "author": "English Everyday Words" }
            ]
        },
        "formula_cards": [
            {
                "tense": "Present Simple (Geniş Zaman)",
                "usage": "Genel doğrular, günlük rutinler, alışkanlıklar ve değişmeyen gerçekler.",
                "pos_formula": "Subject + Verb(s/es) + Object",
                "neg_formula": "Subject + don't / doesn't + Verb1",
                "que_formula": "Do / Does + Subject + Verb1 ?",
                "keywords": "always, usually, often, sometimes, never, every day, on Mondays, once a week"
            },
            {
                "tense": "Present Continuous (Şimdiki Zaman)",
                "usage": "Konuşma anında yapılan eylemler veya bu dönemdeki geçici durumlar.",
                "pos_formula": "Subject + am / is / are + Verb-ing",
                "neg_formula": "Subject + am not / isn't / aren't + Verb-ing",
                "que_formula": "Am / Is / Are + Subject + Verb-ing ?",
                "keywords": "now, right now, at the moment, at present, currently, Look!, Listen!"
            }
        ],
        "state_verbs_note": {
            "title": "⚠️ State Verbs (Durum Fiilleri) Kuralı",
            "desc": "Düşünce, his, sahiplik veya duyu bildiren durum fiilleri 'şimdiki zaman' anlamında olsalar bile -ing takısı ALMAZLAR, Present Simple ile kullanılırlar.",
            "verbs": ["like", "love", "hate", "want", "need", "know", "understand", "believe", "remember", "belong", "own", "seem", "prefer"]
        },
        "examples": [
            { "en": "She usually walks to school, but today she is taking the bus.", "tr": "O genellikle okula yürür, ama bugün otobüse biniyor." },
            { "en": "I understand the grammar rules very well right now.", "tr": "Şu anda gramer kurallarını çok iyi anlıyorum. (State verb: understand -ing almaz)" },
            { "en": "Look! The students are working on their science project.", "tr": "Bak! Öğrenciler fen projeleri üzerinde çalışıyorlar." },
            { "en": "This blue backpack belongs to my classmate Leo.", "tr": "Bu mavi sırt çantası sınıf arkadaşım Leo'ya ait." }
        ],
        "pitfalls": [
            {
                "wrong": "I am knowing the answer right now.",
                "correct": "I know the answer right now.",
                "explanation": "'Know' bir durum fiilidir (state verb), şimdiki zamanda dahi -ing eki alamaz."
            },
            {
                "wrong": "She don't like horror movies.",
                "correct": "She doesn't like horror movies.",
                "explanation": "He / She / It öznelerinde olumsuz cümle 'doesn't' yardımcı fiili ile kurulur."
            }
        ]
    },
    "fh_unit_1": {
        "title": "Unit 1: Past Simple vs. Past Continuous & Time Clauses (When / While)",
        "badge": "Geçmiş Zaman & Süreç Bildiren Geçmiş & When/While Bağlaçları",
        "video_data": {
            "title": "9. Sınıf: Past Simple vs. Past Continuous & When / While",
            "search_query": "Past Simple vs Past Continuous when while 9. sınıf konu anlatımı",
            "videos": [
                { "id": "tLpZ1kY_qj4", "title": "Past Simple vs Past Continuous Konu Anlatımı", "author": "Ms. Jasmin ELT" },
                { "id": "ZtKjY19K_Lg", "title": "When ve While Kullanımı 10 Dakikada Pratik Anlatım", "author": "Ayse Eser" },
                { "id": "WzZqT8K7R-8", "title": "Simple Past Tense (Geçmiş Zaman) Detaylı Anlatım", "author": "Furkan Çetin" }
            ]
        },
        "formula_cards": [
            {
                "tense": "Past Simple (Geçmiş Zaman - V2)",
                "usage": "Geçmişte belirli bir zamanda başlayıp tamamlanmış anlık eylemler.",
                "pos_formula": "Subject + Verb-2 (ed / düzensiz) + Object",
                "neg_formula": "Subject + didn't + Verb-1",
                "que_formula": "Did + Subject + Verb-1 ?",
                "keywords": "yesterday, last night/week/year, two days ago, in 2020"
            },
            {
                "tense": "Past Continuous (Geçmişte Süreç - was/were Ving)",
                "usage": "Geçmişte belirli bir anda devam etmekte olan uzun süreçli eylemler.",
                "pos_formula": "Subject + was / were + Verb-ing",
                "neg_formula": "Subject + wasn't / weren't + Verb-ing",
                "que_formula": "Was / Were + Subject + Verb-ing ?",
                "keywords": "at 8 o'clock yesterday, while, as, all day yesterday"
            }
        ],
        "state_verbs_note": {
            "title": "⚡ When & While Altın Kuralı",
            "desc": "• WHILE + Past Continuous (Uzun eylem): 'While I was studying...' (Ders çalışıyorken...)\n• WHEN + Past Simple (Kısa/kesen eylem): '...when the telephone rang.' (...telefon çaldığında.)",
            "verbs": ["While + was/were V-ing", "When + V2 (Past Simple)"]
        },
        "examples": [
            { "en": "While Ela was reading in the library, her phone rang.", "tr": "Ela kütüphanede kitap okurken telefonu çaldı." },
            { "en": "When the teacher entered the classroom, the students were talking.", "tr": "Öğretmen sınıfa girdiğinde öğrenciler konuşuyordu." },
            { "en": "I didn't watch the football match yesterday evening.", "tr": "Dün akşam futbol maçını izlemedim." },
            { "en": "What were you doing at 10 PM last night?", "tr": "Dün gece saat 22:00'de ne yapıyordun?" }
        ],
        "pitfalls": [
            {
                "wrong": "While I was walking, I was seeing a strange bird.",
                "correct": "While I was walking, I saw a strange bird.",
                "explanation": "Kısa ve anlık eylemler (görmek, düşmek, aramak) Past Simple (V2) olmalıdır."
            },
            {
                "wrong": "Did you saw the new art gallery?",
                "correct": "Did you see the new art gallery?",
                "explanation": "'Did' yardımcı fiili kullanıldığında ana fiil daima yalın (V1) haline döner."
            }
        ]
    },
    "fh_unit_2": {
        "title": "Unit 2: Present Perfect Simple vs. Past Simple",
        "badge": "Yakın Geçmiş Zaman & Since/For & Just/Already/Yet",
        "video_data": {
            "title": "9. Sınıf: Present Perfect Tense vs. Past Simple",
            "search_query": "Present Perfect Tense konu anlatımı 9. sınıf türkçe",
            "videos": [
                { "id": "qH_V1sK_kLw", "title": "Present Perfect Tense (Have/Has V3) Mantığı", "author": "Ayse Eser" },
                { "id": "8KpLkKz1-Xw", "title": "Since, For, Just, Already, Yet Kullanımı", "author": "Ms. Jasmin ELT" },
                { "id": "mKlZ9kL1_8Q", "title": "Present Perfect vs Past Simple Farkı", "author": "Özer Kiraz" }
            ]
        },
        "formula_cards": [
            {
                "tense": "Present Perfect Tense (have / has + V3)",
                "usage": "Geçmişte olmuş ama zamanı belirtilmemiş, etkisi veya sonucu şu an devam eden olaylar ya da hayat tecrübeleri.",
                "pos_formula": "Subject + have / has + Verb-3 (Past Participle)",
                "neg_formula": "Subject + haven't / hasn't + Verb-3",
                "que_formula": "Have / Has + Subject + Verb-3 ?",
                "keywords": "just (henüz), already (zaten), yet (henüz-olumsuz/soru), since (den beri), for (dır), ever, never"
            },
            {
                "tense": "Past Simple vs. Present Perfect Ayrımı",
                "usage": "Zaman belliyse (yesterday, in 2018) -> Past Simple (V2). Zaman belirsiz veya tecrübe ise -> Present Perfect (have/has V3).",
                "pos_formula": "Past Simple: I visited Rome in 2021. (Belli zaman)",
                "neg_formula": "Present Perfect: I have visited Rome twice. (Hayat tecrübesi)",
                "que_formula": "Have you ever been to London? - Yes, I went there last summer.",
                "keywords": "Since 2015 vs. In 2015, For 3 years vs. 3 years ago"
            }
        ],
        "state_verbs_note": {
            "title": "📌 Ever / Never & Just / Already / Yet Kuralları",
            "desc": "• Ever: Soru cümlelerinde tecrübe sorarken ('Have you ever eaten sushi?')\n• Never: Olumlu yapılı cümlede olumsuz anlam ('I have never been abroad.')\n• Yet: Cümlenin en sonunda ve sadece olumsuz ya da sorularda kullanılır ('I haven't finished yet.')",
            "verbs": ["Since + Başlangıç Noktası (Since 2010)", "For + Süreç (For 5 years)"]
        },
        "examples": [
            { "en": "I have already booked my flight ticket to London.", "tr": "Londra uçak biletimi şimdiden (çoktan) aldım." },
            { "en": "She hasn't packed her travel suitcase yet.", "tr": "Valizini henüz hazırlamadı." },
            { "en": "They have lived in this historic neighborhood since 2018.", "tr": "2018'den beri bu tarihi mahallede yaşıyorlar." },
            { "en": "We visited the ancient museum yesterday. (Past Simple - zaman net)", "tr": "Dün antik müzeyi ziyaret ettik." }
        ],
        "pitfalls": [
            {
                "wrong": "I have seen him yesterday.",
                "correct": "I saw him yesterday.",
                "explanation": "'Yesterday' kesin geçmiş zaman bildirdiği için Present Perfect değil, Past Simple (saw) kullanılır."
            },
            {
                "wrong": "She has already not called me.",
                "correct": "She hasn't called me yet.",
                "explanation": "Olumsuz cümlelerde 'already' yerine cümlenin sonunda 'yet' kullanılır."
            }
        ]
    },
    "fh_unit_3": {
        "title": "Unit 3: Future Forms (Will vs. Be Going To vs. Present Continuous) & Modals of Probability",
        "badge": "Gelecek Zaman Kalıpları & Olasılık Kipleri (May / Might / Could)",
        "video_data": {
            "title": "9. Sınıf: Will vs. Be Going to vs. Present Continuous",
            "search_query": "Will vs Be going to farkı 9. sınıf konu anlatımı",
            "videos": [
                { "id": "5Yq8kKj1-LM", "title": "Will ve Be Going to Arasındaki Farklar", "author": "Ayse Eser" },
                { "id": "pKz8kL9-1wQ", "title": "Gelecek Zaman Formları (Future Forms) Konu Anlatımı", "author": "Ms. Jasmin ELT" },
                { "id": "tYq8kL0-2wP", "title": "May, Might, Could Olasılık Kipleri", "author": "Furkan Çetin" }
            ]
        },
        "formula_cards": [
            {
                "tense": "Will (Anlık Karar & Tahmin)",
                "usage": "Konuşma anında verilen ani kararlar, sözler, teklifler ve kişisel tahminler.",
                "pos_formula": "Subject + will + Verb-1",
                "neg_formula": "Subject + won't + Verb-1",
                "que_formula": "Will + Subject + Verb-1 ?",
                "keywords": "I think, I believe, probably, maybe, I promise, suddenly"
            },
            {
                "tense": "Be Going To (Önceden Plan & Güçlü Kanıt)",
                "usage": "Önceden planlanmış niyetler veya şu anki somut kanıtlara dayanan tahminler.",
                "pos_formula": "Subject + am / is / are + going to + Verb-1",
                "neg_formula": "Subject + am not / isn't / aren't + going to + Verb-1",
                "que_formula": "Am / Is / Are + Subject + going to + Verb-1 ?",
                "keywords": "plan, intend, Look at the dark clouds!, carefully"
            }
        ],
        "state_verbs_note": {
            "title": "🔮 Modals of Probability (May, Might, Could)",
            "desc": "Geleceğe veya şu ana dair olasılık bildirmek için kullanılır:\n• May / Might / Could + Verb1 (%40-50 ihtimal)\n• Must + Verb1 (%90 güçlü çıkarım: 'He must be at school.')",
            "verbs": ["may (olabilir)", "might (belki)", "could (ihtimal var)", "must (olmalı)"]
        },
        "examples": [
            { "en": "Look at those black clouds! It is going to rain. (Somut kanıt var)", "tr": "Şu kara bulutlara bak! Yağmur yağacak." },
            { "en": "I think artificial intelligence will create exciting new jobs.", "tr": "Bence yapay zeka heyecan verici yeni işler yaratacak. (Kişisel tahmin)" },
            { "en": "The phone is ringing. - I will answer it! (Ani karar)", "tr": "Telefon çalıyor. - Ben bakarım!" },
            { "en": "We are meeting the computer science teacher tomorrow at 10 AM.", "tr": "Yarın sabah saat 10'da bilgisayar öğretmeniyle buluşuyoruz. (Kesin randevu)" }
        ],
        "pitfalls": [
            {
                "wrong": "Look at the ice on the road! You will slip.",
                "correct": "Look at the ice on the road! You are going to slip.",
                "explanation": "Gözümüzün önünde somut bir kanıt (buz) olduğunda 'be going to' kullanılır."
            },
            {
                "wrong": "I will to study computer science.",
                "correct": "I will study computer science.",
                "explanation": "'Will' modal fiilinden sonra 'to' gelmez, fiil doğrudan yalın (V1) kullanılır."
            }
        ]
    },
    "fh_unit_4": {
        "title": "Unit 4: Modals of Obligation, Prohibition & Advice (Must, Have to, Should, Can't)",
        "badge": "Zorunluluk, Yasaklama ve Tavsiye Kipleri",
        "video_data": {
            "title": "9. Sınıf: Must, Have to, Should, Musn't, Don't have to",
            "search_query": "Must have to should farkı 9. sınıf konu anlatımı",
            "videos": [
                { "id": "8KpLkKz1-Xw", "title": "Must vs Have to vs Should Farkı", "author": "Ayse Eser" },
                { "id": "mKlZ9kL1_8Q", "title": "İngilizce Modals Konu Anlatımı", "author": "Ms. Jasmin ELT" },
                { "id": "JLdIAa8jaZM", "title": "Zorunluluk ve Yasak Bildiren Kipler", "author": "Özer Kiraz" }
            ]
        },
        "formula_cards": [
            {
                "tense": "Must vs. Have to (Zorunluluk)",
                "usage": "• Must: Konuşmacının kendi içinden gelen güçlü zorunluluk veya kural.\n• Have to: Dışarıdan gelen resmi kurallar, kanunlar ve okul kuralları.",
                "pos_formula": "Subject + must / have to / has to + Verb-1",
                "neg_formula": "Don't have to (Zorunda değilsin) ≠ Musn't (YASAK!)",
                "que_formula": "Do / Does + Subject + have to + Verb-1 ?",
                "keywords": "rule, law, compulsory, necessary, obligation"
            },
            {
                "tense": "Should & Ought to (Tavsiye / Öneri)",
                "usage": "Birine yapması iyi olacak bir tavsiyede veya öğütte bulunurken kullanılır.",
                "pos_formula": "Subject + should / ought to + Verb-1",
                "neg_formula": "Subject + shouldn't + Verb-1",
                "que_formula": "Should + Subject + Verb-1 ?",
                "keywords": "I advise you, If I were you, good idea, suggestion"
            }
        ],
        "state_verbs_note": {
            "title": "⚠️ EN ÇOK KARIŞTIRILAN FARK: Musn't vs. Don't Have To",
            "desc": "• MUSTN'T: Kesinlikle YASAK! Yaparsan ceza alırsın ('You mustn't cheat in exams.')\n• DON'T HAVE TO: Zorunda değilsin, istersen yapabilirsin ('You don't have to wake up early on Sundays.')",
            "verbs": ["Mustn't = Yasak (Prohibition)", "Don't have to = İsteğe bağlı (No obligation)"]
        },
        "examples": [
            { "en": "Students must follow the digital citizenship rules in the lab.", "tr": "Öğrenciler laboratuvarda dijital vatandaşlık kurallarına uymalıdır." },
            { "en": "You mustn't share your private passwords with strangers. (Yasak)", "tr": "Özel şifrelerinizi yabancılarla kesinlikle paylaşmamalısınız." },
            { "en": "Tomorrow is Sunday, so Ela doesn't have to wake up early.", "tr": "Yarın pazar, bu yüzden Ela erken kalkmak zorunda değil." },
            { "en": "You should practice speaking English every day.", "tr": "Her gün İngilizce konuşma pratiği yapmalısın. (Tavsiye)" }
        ],
        "pitfalls": [
            {
                "wrong": "You mustn't pay for the museum, it is free.",
                "correct": "You don't have to pay for the museum, it is free.",
                "explanation": "Müze ücretsizse 'ödemek zorunda değilsin' denir (don't have to). 'Mustn't' derseniz para ödemek yasaktır anlamına gelir."
            },
            {
                "wrong": "He must to respect other people.",
                "correct": "He must respect other people.",
                "explanation": "Must modalından sonra asla 'to' kullanılmaz, fiil yalın gelir."
            }
        ]
    },
    "fh_unit_5": {
        "title": "Unit 5: Comparatives & Superlatives, (Not) As...as, Too & Enough",
        "badge": "Sıfatlarda Karşılaştırma, Üstünlük, Aşırılık ve Yeterlilik",
        "video_data": {
            "title": "9. Sınıf: Comparatives, Superlatives, Too & Enough",
            "search_query": "Comparatives Superlatives too enough 9. sınıf konu anlatımı",
            "videos": [
                { "id": "ZtKjY19K_Lg", "title": "Comparatives ve Superlatives Sıfatlar", "author": "Ayse Eser" },
                { "id": "tLpZ1kY_qj4", "title": "Too ve Enough Kullanımı", "author": "Ms. Jasmin ELT" },
                { "id": "WzZqT8K7R-8", "title": "(Not) As...as Eşitlik Kalıpları", "author": "Furkan Çetin" }
            ]
        },
        "formula_cards": [
            {
                "tense": "Comparative & Superlative Sıfatlar",
                "usage": "• Kısa sıfatlar: faster than / the fastest\n• Uzun sıfatlar: more energetic than / the most energetic\n• Düzensizler: good->better->best, bad->worse->worst",
                "pos_formula": "Comparative: A is more [adj] than B | Superlative: A is the most [adj]",
                "neg_formula": "As...as: A is not as tall as B (A, B kadar uzun değil)",
                "que_formula": "Which sport is more challenging, tennis or swimming?",
                "keywords": "than, the most, the -est, as...as, much more"
            },
            {
                "tense": "Too & Enough (Aşırılık & Yeterlilik)",
                "usage": "• TOO + Sıfat (Gereğinden fazla/olumsuz aşırı): 'too expensive' (fazla pahalı)\n• Sıfat + ENOUGH (Yeterli derecede): 'healthy enough' (yeterince sağlıklı)",
                "pos_formula": "too + adjective + (to V1) | adjective + enough + (to V1)",
                "neg_formula": "not + adjective + enough (yeterince ... değil)",
                "que_formula": "Is this water warm enough to swim?",
                "keywords": "too (aşırı/olumsuz), enough (yeterli), so...that"
            }
        ],
        "state_verbs_note": {
            "title": "⭐ Düzensiz Sıfatlar Tablosu (Irregular Adjectives)",
            "desc": "• good -> better -> the best (iyi / daha iyi / en iyi)\n• bad -> worse -> the worst (kötü / daha kötü / en kötü)\n• far -> farther/further -> the farthest/furthest (uzak)\n• little -> less -> the least (az / daha az / en az)\n• many/much -> more -> the most (çok / daha çok / en çok)",
            "verbs": ["good -> better", "bad -> worse", "far -> further", "little -> less"]
        },
        "examples": [
            { "en": "Swimming is more beneficial for your posture than running.", "tr": "Yüzme, duruşunuz için koşmaktan daha faydalıdır." },
            { "en": "Ela is the most hardworking student in the ninth grade.", "tr": "Ela, dokuzuncu sınıftaki en çalışkan öğrencidir." },
            { "en": "This soup is too hot to drink right now.", "tr": "Bu çorba şu an içmek için aşırı sıcak." },
            { "en": "He is not strong enough to lift that heavy fitness bar.", "tr": "O ağır fitness barını kaldırmak için yeterince güçlü değil." }
        ],
        "pitfalls": [
            {
                "wrong": "She is more taller than her brother.",
                "correct": "She is taller than her brother.",
                "explanation": "Kısa tek heceli sıfatlara hem 'more' hem de '-er' aynı anda eklenmez."
            },
            {
                "wrong": "This laptop is enough fast.",
                "correct": "This laptop is fast enough.",
                "explanation": "'Enough' kelimesi sıfatlardan SONRA gelir (fast enough), isimlerden ÖNCE gelir (enough money)."
            }
        ]
    },
    "fh_unit_6": {
        "title": "Unit 6: The Passive Voice (Present Simple & Past Simple Passives)",
        "badge": "Edilgen Çatı (am/is/are + V3 & was/were + V3)",
        "video_data": {
            "title": "9. Sınıf: Passive Voice (Edilgen Çatı) Konu Anlatımı",
            "search_query": "Passive Voice edilgen çatı 9. sınıf konu anlatımı",
            "videos": [
                { "id": "mKlZ9kL1_8Q", "title": "Passive Voice (Edilgen Çatı) Temel Mantığı", "author": "Ayse Eser" },
                { "id": "8KpLkKz1-Xw", "title": "Present Simple & Past Simple Passive", "author": "Ms. Jasmin ELT" },
                { "id": "JLdIAa8jaZM", "title": "Edilgen Cümle Nasıl Kurulur? 10 Dakikada Öğren", "author": "Özer Kiraz" }
            ]
        },
        "formula_cards": [
            {
                "tense": "Present Simple Passive (Geniş Zaman Edilgen)",
                "usage": "İşi yapanın değil, yapılan işin veya nesnenin önemli olduğu genel durumlar.",
                "pos_formula": "Object + am / is / are + Verb-3 (Past Participle)",
                "neg_formula": "Object + am not / isn't / aren't + Verb-3",
                "que_formula": "Is / Are + Object + Verb-3 ?",
                "keywords": "by (tarafından), is produced, are made, is spoken"
            },
            {
                "tense": "Past Simple Passive (Geçmiş Zaman Edilgen)",
                "usage": "Geçmişte gerçekleşen ve etkilenen nesnenin ön planda olduğu durumlar.",
                "pos_formula": "Object + was / were + Verb-3 (Past Participle)",
                "neg_formula": "Object + wasn't / weren't + Verb-3",
                "que_formula": "Was / Were + Object + Verb-3 ?",
                "keywords": "was written in 1990, were invented, was directed by"
            }
        ],
        "state_verbs_note": {
            "title": "🎨 Aktif Cümleyi Edilgene Çevirme Adımları",
            "desc": "1. Aktif cümlenin Nesnesini (Object) başa alıp yeni Özne yap.\n2. Zamana uygun 'Be' fiilini koy (is/are veya was/were).\n3. Ana fiilin daima 3. halini (V3) kullan.\n4. İşi yapanı belirtmek istersen cümlenin sonuna '+ by ...' ekle.",
            "verbs": ["Active: Shakespeare wrote Hamlet.", "Passive: Hamlet was written by Shakespeare."]
        },
        "examples": [
            { "en": "English is spoken by millions of students around the world.", "tr": "İngilizce, dünya genelinde milyonlarca öğrenci tarafından konuşulur." },
            { "en": "The famous cinema movie was directed by Christopher Nolan.", "tr": "Ünlü sinema filmi Christopher Nolan tarafından yönetildi." },
            { "en": "These classical sculptures are protected in the museum.", "tr": "Bu klasik heykeller müzede korunmaktadır." },
            { "en": "The Mona Lisa was painted in the 16th century.", "tr": "Mona Lisa tablosu 16. yüzyılda yapıldı." }
        ],
        "pitfalls": [
            {
                "wrong": "The new film was directed with a famous artist.",
                "correct": "The new film was directed by a famous artist.",
                "explanation": "Edilgen cümlelerde işi yapan kişiyi belirtirken 'with' değil 'by' bağlacı kullanılır."
            },
            {
                "wrong": "The car was wash yesterday.",
                "correct": "The car was washed yesterday.",
                "explanation": "Edilgen çatıda fiil daima 3. halinde (V3) olmak zorundadır."
            }
        ]
    },
    "fh_unit_7": {
        "title": "Unit 7: Conditionals (Zero & First Conditional - If Clauses) & Future Time Clauses",
        "badge": "Koşul Cümleleri (Zero & First Conditionals) ve When/Unless/As soon as",
        "video_data": {
            "title": "9. Sınıf: If Clauses (Zero & First Conditional)",
            "search_query": "If clauses zero first conditional 9. sınıf konu anlatımı",
            "videos": [
                { "id": "tLpZ1kY_qj4", "title": "If Clauses Type 0 & Type 1 Konu Anlatımı", "author": "Ayse Eser" },
                { "id": "ZtKjY19K_Lg", "title": "Koşul Cümleleri & Unless Kullanımı", "author": "Ms. Jasmin ELT" },
                { "id": "WzZqT8K7R-8", "title": "First Conditional Pratik Alıştırmalar", "author": "Furkan Çetin" }
            ]
        },
        "formula_cards": [
            {
                "tense": "Zero Conditional (Genel Doğa Kanunları & Bilimsel Gerçekler)",
                "usage": "Her zaman doğru olan bilimsel kurallar veya kesin sonuçlar.",
                "pos_formula": "If + Present Simple, Present Simple",
                "neg_formula": "If you don't water plants, they die.",
                "que_formula": "What happens if water reaches 100 degrees?",
                "keywords": "always, scientific facts, when, whenever"
            },
            {
                "tense": "First Conditional (Gelecekteki Gerçekçi Olasılıklar)",
                "usage": "Gelecekte gerçekleşmesi muhtemel olan durumlar ve olası sonuçları.",
                "pos_formula": "If + Present Simple, will / won't + Verb-1",
                "neg_formula": "If we don't reduce plastic waste, pollution will increase.",
                "que_formula": "What will you do if it rains tomorrow?",
                "keywords": "if, unless (if not), as soon as, when, in case"
            }
        ],
        "state_verbs_note": {
            "title": "🌱 UNLESS = IF NOT (Madıkça / Medikçe)",
            "desc": "• 'Unless we protect the forests, wildlife will disappear.'\n(Ormanları korumadıkça yaban hayatı yok olacak.)\n= 'If we do not protect the forests, wildlife will disappear.'",
            "verbs": ["If + Present -> Future (Will)", "Unless = If + Not"]
        },
        "examples": [
            { "en": "If we use renewable energy, we will reduce our carbon footprint.", "tr": "Eğer yenilenebilir enerji kullanırsak, karbon ayak izimizi azaltacağız." },
            { "en": "If you heat ice, it melts. (Zero conditional - bilimsel gerçek)", "tr": "Buzu ısıtırsan erir." },
            { "en": "Unless we plant more trees, global temperatures will continue to rise.", "tr": "Daha fazla ağaç dikmedikçe küresel sıcaklıklar artmaya devam edecek." },
            { "en": "As soon as I finish my homework, I will help you with the recycling project.", "tr": "Ödevimi bitirir bitirmez geri dönüşüm projesinde sana yardım edeceğim." }
        ],
        "pitfalls": [
            {
                "wrong": "If it will rain tomorrow, we will stay at home.",
                "correct": "If it rains tomorrow, we will stay at home.",
                "explanation": "'If' cümlesinin içine asla 'will' gelmez, daima Present Simple kullanılır."
            },
            {
                "wrong": "Unless you don't hurry, you will miss the school bus.",
                "correct": "Unless you hurry, you will miss the school bus.",
                "explanation": "'Unless' kendi içinde zaten olumsuzluk (if not) barındırır, tekrar 'don't' kullanılmaz."
            }
        ]
    },
    "fh_unit_8": {
        "title": "Unit 8: Relative Clauses (Who, Which, That, Where, Whose) & Used to for Habits",
        "badge": "Sıfat Cümlecikleri & Geçmiş Alışkanlıklar (Used to)",
        "video_data": {
            "title": "9. Sınıf: Relative Clauses (Who, Which, That, Where) & Used to",
            "search_query": "Relative clauses who which that where 9. sınıf konu anlatımı",
            "videos": [
                { "id": "qH_V1sK_kLw", "title": "Relative Clauses (Sıfat Cümlecikleri) Detaylı Anlatım", "author": "Ayse Eser" },
                { "id": "8KpLkKz1-Xw", "title": "Used to ve Would ile Geçmiş Alışkanlıklar", "author": "Ms. Jasmin ELT" },
                { "id": "mKlZ9kL1_8Q", "title": "Who, Which, That, Where, Whose Pratik Tablo", "author": "Özer Kiraz" }
            ]
        },
        "formula_cards": [
            {
                "tense": "Defining Relative Pronouns (İlgi Zamirleri)",
                "usage": "İki cümleyi birbirine bağlayıp bir ismi nitelemek için kullanılır:\n• WHO / THAT: İnsanlar için ('The teacher who inspires us...')\n• WHICH / THAT: Hayvanlar ve nesneler için ('The software which analyze data...')\n• WHERE: Mekanlar ve yerler için ('The university where I study...')\n• WHOSE: Sahiplik bildirenler için ('The student whose project won the award...')",
                "pos_formula": "Noun + [who / which / that / where / whose] + Clause",
                "neg_formula": "I met a scientist who doesn't use standard algorithms.",
                "que_formula": "Do you know the architect who designed this eco-building?",
                "keywords": "who (insan), which (nesne), that (her ikisi), where (yer), whose (aitlik)"
            },
            {
                "tense": "Used to (Geçmiş Alışkanlıklar)",
                "usage": "Geçmişte düzenli olarak yapılan ama artık terk edilmiş olan eski alışkanlıklar ve durumlar.",
                "pos_formula": "Subject + used to + Verb-1",
                "neg_formula": "Subject + didn't use to + Verb-1",
                "que_formula": "Did + Subject + use to + Verb-1 ?",
                "keywords": "in the past, when I was a child, no longer, anymore"
            }
        ],
        "state_verbs_note": {
            "title": "💼 Geleceğin Mesleklerinde Sıfat Cümlecikleri",
            "desc": "• 'An AI engineer is a specialist WHO designs intelligent systems.'\n• 'A sustainable farm is a place WHERE crops are grown without chemical pesticides.'",
            "verbs": ["who = insan", "which = nesne", "where = yer", "whose = sahiplik"]
        },
        "examples": [
            { "en": "An astronaut is a professional who explores outer space.", "tr": "Astronot, uzayı keşfeden profesyonel bir kişidir." },
            { "en": "This is the innovative company that developed the new eco-engine.", "tr": "Bu, yeni çevre dostu motoru geliştiren yenilikçi şirkettir." },
            { "en": "I used to play video games for hours, but now I focus on coding.", "tr": "Eskiden saatlerce video oyunu oynardım, ama şimdi kodlamaya odaklanıyorum." },
            { "en": "Did your father use to work in an international office?", "tr": "Baban eskiden uluslararası bir ofiste mi çalışırdı?" }
        ],
        "pitfalls": [
            {
                "wrong": "I met a girl which speaks four languages.",
                "correct": "I met a girl who speaks four languages.",
                "explanation": "İnsanları nitelerken 'which' değil, 'who' veya 'that' kullanılır."
            },
            {
                "wrong": "She didn't used to like science fiction.",
                "correct": "She didn't use to like science fiction.",
                "explanation": "'Didn't' kullanıldığında 'used' fiilindeki -d eki düşer ve 'use to' haline döner."
            }
        ]
    }
}

# Update all units in curriculum with their complete grammar_details
for u in data.get("units", []):
    unit_id = u.get("id")
    if unit_id in grammar_db:
        u["grammar_details"] = grammar_db[unit_id]

with open(filepath, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Successfully enriched all 9 units in {filepath} with rich grammar guides and YouTube lesson database!")
