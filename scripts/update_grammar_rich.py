import os
import re

rich_modules_js = '''
  getRichGrammarModules() {
    return [
      {
        id: "gmod_1",
        number: 1,
        title: "Modül 1: İhtimal, Yetenek ve Gereklilik Modalları",
        subtitle: "Modals of Ability, Possibility & Necessity (Can, Could, May, Might, Must, Should, Need to)",
        category: "İleri Gramer & Modallar",
        level: "A2 - B1 Seviyesi",
        icon: "⚡",
        concept: "Modallar, ana fiilin önüne gelerek cümleye yetenek, ihtimal, zorunluluk veya tavsiye anlamı katar. Kendilerinden sonra gelen fiil <strong>her zaman YALIN (V1)</strong> haldedir (asla -s, -ed veya -ing almaz).",
        formula: [
          { type: "subject", label: "Özne (Subject)", eg: "I / She / We" },
          { type: "modal", label: "Modal Kip", eg: "can / must / should" },
          { type: "verb", label: "Ana Fiil (V1 Yalın)", eg: "bring / speak / listen" },
          { type: "object", label: "Nesne (Object)", eg: "the project / English" },
          { type: "modifier", label: "Zaman / Mekan", eg: "tomorrow / in class" }
        ],
        rules: [
          {
            type: "positive",
            title: "Yetenek & İzin (Can / Could)",
            structure: "Subject + can / could + V1",
            desc: "Şu anki yetenek ve izinlerde 'can', geçmişteki yeteneklerde 'could' kullanılır.",
            en: "She can speak three languages fluently.",
            tr: "O, üç dili akıcı bir şekilde konuşabilir."
          },
          {
            type: "special",
            title: "İhtimal & Olasılık (May / Might)",
            structure: "Subject + may / might + V1",
            desc: "Geleceğe veya şu ana dair kesin olmayan ihtimalleri ve tahminleri belirtir.",
            en: "It might rain in the evening, take your umbrella.",
            tr: "Akşam yağmur yağabilir, şemsiyeni yanına al."
          },
          {
            type: "negative",
            title: "Güçlü Zorunluluk & Yasak (Must / Must not)",
            structure: "Subject + must / must not (mustn't) + V1",
            desc: "Must güçlü kişisel zorunluluğu, Mustn't ise kesin yasakları ifade eder.",
            en: "You must not touch the equipment in the laboratory.",
            tr: "Laboratuvardaki ekipmanlara dokunmamalısın (yasaktır)."
          },
          {
            type: "question",
            title: "Tavsiye & Öneri (Should / Shouldn't)",
            structure: "Subject + should (not) + V1",
            desc: "Birine tavsiye veya yapılması faydalı olacak bir fikir verirken kullanılır.",
            en: "You should rest before the big tournament tomorrow.",
            tr: "Yarınki büyük turnuvadan önce dinlenmelisin."
          }
        ],
        pitfall: {
          wrong: "She can speaks English very well.",
          correct: "She can speak English very well.",
          note: "Modal'lardan (can, must, should vb.) sonra gelen fiil 3. tekil şahısta bile olsa ASLA '-s' takısı almaz, daima V1 (yalın) kalır."
        },
        relatedSearch: "can"
      },
      {
        id: "gmod_2",
        number: 2,
        title: "Modül 2: Durum Fiilleri, Edatlı Fiiller ve Tercih Kalıpları",
        subtitle: "Stative Verbs, Prepositional Verbs & Preferences (Prefer to vs. Would rather)",
        category: "Fiil Türleri & Tercihler",
        level: "A2 - B1 Seviyesi",
        icon: "🧠",
        concept: "İngilizcede bazı fiiller anlık bir fiziksel eylem değil, zihinsel bir durum, duygu veya sahiplik bildirir. Bu fiiller (Stative Verbs) genellikle <strong>Continuous (-ing)</strong> zamanlarda kullanılmazlar.",
        formula: [
          { type: "subject", label: "Özne (Subject)", eg: "This book / I" },
          { type: "verb", label: "Durum / Tercih Fiili", eg: "belongs to / prefer" },
          { type: "object", label: "Nesne / Tamlayıcı", eg: "my brother / tea to coffee" }
        ],
        rules: [
          {
            type: "special",
            title: "Durum Fiilleri (Stative Verbs)",
            structure: "Belong to, Contain, Know, Understand, Believe",
            desc: "Süreç bildirmezler; sahiplik veya algı durumunu gösterirler.",
            en: "This mysterious journal belongs to an unknown student.",
            tr: "Bu gizemli günlük bilinmeyen bir öğrenciye aittir."
          },
          {
            type: "positive",
            title: "Sabit Edatlı Fiiller (Prepositional Verbs)",
            structure: "Depend on, Consist of, Look for, Listen to",
            desc: "Fiil ve edat ayrılmaz bir bütündür; anlam edatla tamamlanır.",
            en: "Our project success depends on patience and teamwork.",
            tr: "Proje başarımız sabır ve takım çalışmasına bağlıdır."
          },
          {
            type: "question",
            title: "Tercih Kalıbı 1: Prefer ... to ...",
            structure: "Subject + prefer + V-ing + to + V-ing",
            desc: "Genel tercihleri ifade ederken prefer '-to' edatı ve -ing alır.",
            en: "I prefer reading science books to watching movies.",
            tr: "Bilim kitapları okumayı film izlemeye tercih ederim."
          },
          {
            type: "question",
            title: "Tercih Kalıbı 2: Would rather ... than ...",
            structure: "Subject + would rather + V1 + than + V1",
            desc: "Anlık veya özel tercihlerde 'than' ve yalın fiiller (V1) kullanılır.",
            en: "She would rather study in the library than stay at home.",
            tr: "Evde kalmaktansa kütüphanede çalışmayı tercih eder."
          }
        ],
        pitfall: {
          wrong: "This book is belonging to me right now.",
          correct: "This book belongs to me right now.",
          note: "Belong, know, understand gibi durum fiilleri şimdiki zamanda bile '-ing' almazlar, Simple Present olarak kullanılırlar."
        },
        relatedSearch: "belong"
      },
      {
        id: "gmod_3",
        number: 3,
        title: "Modül 3: İletişim Fiilleri ve Amaç Bildiren Bağlaçlar",
        subtitle: "Purpose Clauses & Social Interaction (In order to, So that, Attend vs. Join)",
        category: "Bağlaçlar & İletişim",
        level: "B1 Seviyesi",
        icon: "🎯",
        concept: "Bir eylemi hangi amaçla yaptığımızı açıklamak için 'In order to / So as to' (arkasından yalın fiil) veya 'So that' (arkasından tam cümle ve modal) bağlaçları kullanılır.",
        formula: [
          { type: "subject", label: "Ana Cümle", eg: "He joined the robotics team" },
          { type: "modal", label: "Amaç Bağlacı", eg: "in order to / so that" },
          { type: "verb", label: "Amaç Eylemi", eg: "improve his coding skills" }
        ],
        rules: [
          {
            type: "positive",
            title: "In order to / So as to + V1 (Fiil Yalın)",
            structure: "Main Clause + in order to / so as to + V1",
            desc: "Kısa ve doğrudan amaç bildirir; arkasından sadece yalın fiil gelir.",
            en: "Ela called Leo in order to solve the secret blueprint code.",
            tr: "Ela, gizli plan kodunu çözmek amacıyla Leo'yu aradı."
          },
          {
            type: "special",
            title: "So that + Cümle (Özne + Can / Could)",
            structure: "Main Clause + so that + Subject + can/could + V1",
            desc: "Arkasından özneli tam bir cümle ve genellikle can/could kipi gelir.",
            en: "They met after school so that they could discuss the new plan.",
            tr: "Yeni planı tartışabilmek için okuldan sonra buluştular."
          },
          {
            type: "positive",
            title: "Katılım Fiilleri: Attend vs. Join",
            structure: "Attend + Event (Edatsız) vs. Join + Group / Club",
            desc: "Attend resmi toplantı/ders/konferansa katılım; Join bir kulübe üye olmaktır.",
            en: "She will attend the science conference and join the chess club.",
            tr: "Bilim konferansına katılacak ve satranç kulübüne üye olacak."
          }
        ],
        pitfall: {
          wrong: "He practiced hard so that to win the medal.",
          correct: "He practiced hard in order to win the medal. (veya: so that he could win)",
          note: "'So that' arkasından daima tam cümle (özne + modal) gelir. Doğrudan fiile bağlanmak için 'in order to' kullanılır."
        },
        relatedSearch: "join"
      },
      {
        id: "gmod_4",
        number: 4,
        title: "Modül 4: Geçmişte Süreç ve Zaman Bağlaçları",
        subtitle: "Past Continuous & Time Clauses (When, While, As, Until, As soon as)",
        category: "Zamanlar & Bağlaçlar",
        level: "A2 - B1 Seviyesi",
        icon: "⏳",
        concept: "Geçmişte belirli bir anda devam etmekte olan uzun süreçleri (was/were + Ving) anlatan Past Continuous ile anlık olayları (Past Simple V2) birbirine bağlayan zaman bağlaçlarıdır.",
        formula: [
          { type: "modal", label: "Zaman Bağlacı", eg: "While / When" },
          { type: "aux", label: "Geçmiş Süreç", eg: "she was walking down the hallway," },
          { type: "verb", label: "Anlık Eylem (V2)", eg: "she noticed an old locker." }
        ],
        rules: [
          {
            type: "positive",
            title: "While / As + Süreç (Past Continuous)",
            structure: "While + Subject + was/were + V-ing, Subject + V2",
            desc: "Geçmişte devam eden uzun eylemin başına 'While' veya 'As' gelir.",
            en: "While she was walking down the hallway, she noticed an old locker.",
            tr: "Koridorda yürümekteyken eski bir dolap fark etti."
          },
          {
            type: "special",
            title: "When + Anlık Olay (Past Simple V2)",
            structure: "Subject + was/were + V-ing + when + Subject + V2",
            desc: "Devam eden eylemi kesintiye uğratan anlık olayın başına 'When' gelir.",
            en: "They were analyzing the map when the school bell rang.",
            tr: "Haritayı analiz ediyorlarken okul zili çaldı."
          },
          {
            type: "positive",
            title: "Until & As soon as (Sınır ve Anındalık)",
            structure: "Until (kadar) / As soon as (yapar yapmaz)",
            desc: "Eylemin hangi noktaya kadar süreceğini veya hemen sonrasını belirtir.",
            en: "Ela promised to support Leo until they completed the mission.",
            tr: "Ela, görevi tamamlayana kadar Leo'yu destekleyeceğine söz verdi."
          }
        ],
        pitfall: {
          wrong: "While she walked, the bell was ringing.",
          correct: "While she was walking, the bell rang.",
          note: "'While' arkasından geçmiş süreç (was/were V-ing), ana cümlede ise anlık kesen olay (Past Simple V2) kullanılır."
        },
        relatedSearch: "notice"
      },
      {
        id: "gmod_5",
        number: 5,
        title: "Modül 5: İleri Edilgen Yapılar (Passive Voice)",
        subtitle: "Passive Voice: Past Simple & Present Perfect Passive, Agent (by / with)",
        category: "Edilgen Çatı (B1)",
        level: "B1 Seviyesi",
        icon: "🏛️",
        concept: "Eylemi kimin yaptığından ziyade, yapılan eylemin kendisi veya etkilenen nesne önemli olduğunda Edilgen Çatı (Passive Voice) kullanılır. Temel kural <strong>be + Fiilin 3. Hali (V3)</strong> formatıdır.",
        formula: [
          { type: "subject", label: "Etkilenen Nesne (Özne)", eg: "The mysterious journal / Penicillin" },
          { type: "aux", label: "Yardımcı Fiil (be)", eg: "was / were / has been" },
          { type: "verb", label: "Fiilin 3. Hali (V3)", eg: "written / discovered / solved" },
          { type: "modifier", label: "Yapan Kişi / Araç", eg: "by Alexander Fleming / with a key" }
        ],
        rules: [
          {
            type: "positive",
            title: "Past Simple Passive (Geçmişte Edilgen)",
            structure: "Subject + was / were + V3 (Past Participle)",
            desc: "Geçmişte tamamlanmış ve tarihi belli edilgen olaylar.",
            en: "Penicillin was discovered by Alexander Fleming in 1928.",
            tr: "Penisilin, 1928 yılında Alexander Fleming tarafından keşfedildi."
          },
          {
            type: "special",
            title: "Present Perfect Passive (Yakın Geçmiş Edilgen)",
            structure: "Subject + have / has been + V3",
            desc: "Yeni tamamlanmış veya etkisi günümüzde devam eden edilgen durumlar.",
            en: "All important safety data has been collected by our team.",
            tr: "Tüm önemli güvenlik verileri ekibimiz tarafından toplandı."
          },
          {
            type: "positive",
            title: "Etken Belirtme: by (tarafından) vs. with (ile)",
            structure: "by + Kişi / Kurum | with + Araç / Gereç",
            desc: "Eylemi yapan canlı özne için 'by', kullanılan nesne/araç için 'with' kullanılır.",
            en: "The secret vault was opened by Ela with a golden key.",
            tr: "Gizli kasa, Ela tarafından altın bir anahtar ile açıldı."
          }
        ],
        pitfall: {
          wrong: "The journal was write decades ago.",
          correct: "The journal was written decades ago.",
          note: "Passive Voice yapılarında ana fiil her zaman 3. halde (V3 / Past Participle) olmak zorundadır."
        },
        relatedSearch: "discover"
      },
      {
        id: "gmod_6",
        number: 6,
        title: "Modül 6: Sebep-Sonuç Bağlaçları",
        subtitle: "Cause & Effect: Because, Since, Due to, Owing to, Therefore, As a result",
        category: "Bağlaçlar & Mantıksal Akış",
        level: "A2 - B1 Seviyesi",
        icon: "🔗",
        concept: "Olayların neden ve sonuç ilişkilerini bağlamak için kullanılır. Bazı bağlaçlar arkasından tam cümle alırken, bazıları sadece isim tamlaması (noun phrase) alır.",
        formula: [
          { type: "subject", label: "Neden Cümlesi", eg: "Because she studied every day," },
          { type: "verb", label: "Sonuç Cümlesi", eg: "she achieved the top score." }
        ],
        rules: [
          {
            type: "positive",
            title: "Because / Since / As + Tam Cümle",
            structure: "because / since / as + Subject + Verb",
            desc: "Arkasından öznesi ve yüklemi olan tam bir cümle alır.",
            en: "She saved pocket money because she wanted to buy a laptop.",
            tr: "Dizüstü bilgisayar almak istediği için harçlığını biriktirdi."
          },
          {
            type: "special",
            title: "Due to / Owing to / Because of + İsim (Noun)",
            structure: "due to / owing to / because of + Noun Phrase",
            desc: "Arkasından fiil değil, sadece isim veya isim öbeği alır.",
            en: "The outdoor basketball match was delayed due to heavy rain.",
            tr: "Açık hava basketbol maçı şiddetli yağmur nedeniyle ertelendi."
          },
          {
            type: "positive",
            title: "Therefore / As a result (Bu Yüzden / Sonuç Olarak)",
            structure: "Reason ; therefore / as a result , Result",
            desc: "Sonuç cümlesinin başında yer alır; iki bağımsız cümleyi birbirine bağlar.",
            en: "He completed all daily lessons; therefore, he earned the reward.",
            tr: "Tüm günlük derslerini tamamladı; bu yüzden ödülü hak etti."
          }
        ],
        pitfall: {
          wrong: "Due to it was raining heavily, we stayed indoors.",
          correct: "Due to the heavy rain, we stayed indoors. (veya: Because it was raining...)",
          note: "'Due to' arkasından cümle (özne+yüklem) gelmez, isim gelir. Cümle kurmak istiyorsanız 'Because' kullanmalısınız."
        },
        relatedSearch: "save"
      },
      {
        id: "gmod_7",
        number: 7,
        title: "Modül 7: Dolaylı Anlatım ve Söz Aktarımı",
        subtitle: "Reported Speech: Statements, Commands & Promises",
        category: "Söz Aktarımı & İletişim",
        level: "B1 Seviyesi",
        icon: "💬",
        concept: "Bir kişinin söylediği sözü başka birine aktarırken (Reported Speech) zamanlar genellikle bir derece geçmişe (Past) kayar. Emir ve ricalarda ise 'told/asked + to V1' kalıbı kullanılır.",
        formula: [
          { type: "subject", label: "Aktaran Özne", eg: "Leo said (that) / promised (that)" },
          { type: "aux", label: "Zaman Kayması (Past)", eg: "he would prepare a plan." }
        ],
        rules: [
          {
            type: "positive",
            title: "Düz Cümle Aktarımı (Statements)",
            structure: "Subject + said (that) / told me (that) + Past Tense",
            desc: "Present Simple ➔ Past Simple, Will ➔ Would, Can ➔ Could dönüşür.",
            en: "Direct: 'We must prepare a plan.' ➔ Leo said that they had to prepare a plan.",
            tr: "Doğrudan: 'Bir plan hazırlamalıyız.' ➔ Leo bir plan hazırlamaları gerektiğini söyledi."
          },
          {
            type: "negative",
            title: "Emir ve Yasak Aktarımı (Commands)",
            structure: "Subject + told sb (not) to + V1",
            desc: "Emir cümleleri 'to V1' veya olumsuzsa 'not to V1' olarak aktarılır.",
            en: "Direct: 'Don't argue!' ➔ The coach told them not to argue during the game.",
            tr: "Doğrudan: 'Tartışmayın!' ➔ Koç onlara maç sırasında tartışmamalarını söyledi."
          },
          {
            type: "special",
            title: "Söz Verme ve Teklif (Promises & Agreements)",
            structure: "Subject + promised to + V1 / agreed to + V1",
            desc: "Promise ve Agree fiilleri doğrudan 'to + V1' ile bağlanabilir.",
            en: "Ela promised to help Leo until they deciphered the riddle.",
            tr: "Ela, bilmeceyi çözene kadar Leo'ya yardım edeceğine söz verdi."
          }
        ],
        pitfall: {
          wrong: "He said me that he was tired.",
          correct: "He told me that he was tired. (veya: He said that he was tired.)",
          note: "'Say' fiili doğrudan kişi zamiri (me, him, her) almaz. Kime söylendiği belirtiliyorsa 'Tell (told me)' kullanılmalıdır."
        },
        relatedSearch: "promise"
      },
      {
        id: "gmod_8",
        number: 8,
        title: "Modül 8: Zihinsel Süreçler ve Dilek Cümleleri",
        subtitle: "Mental Verbs & Wish Clauses / Subjunctive, Seem / Appear",
        category: "Dilek & Varsayım Cümleleri",
        level: "B1 Seviyesi",
        icon: "✨",
        concept: "Zihinsel algı fiilleri (realize, recognize, notice) ile şu anki dileklerimizi veya geçmişteki pişmanlıklarımızı anlatan 'Wish Clauses' yapılarıdır.",
        formula: [
          { type: "subject", label: "Dileyen Özne", eg: "I wish / She wishes" },
          { type: "verb", label: "Geçmiş Zaman Geçişi", eg: "I knew the answer / she had studied" }
        ],
        rules: [
          {
            type: "positive",
            title: "Şu An İçin Dilek (Present Wish)",
            structure: "Subject + wish(es) + Subject + Past Simple (V2 / were)",
            desc: "Şu anki durumun tersini dilerken Past Simple kullanılır.",
            en: "I wish I realized the importance of daily English practice earlier.",
            tr: "Keşke günlük İngilizce pratiğinin önemini daha önce fark etseydim."
          },
          {
            type: "special",
            title: "Geçmişteki Pişmanlık (Past Regret)",
            structure: "Subject + wish(es) + Subject + had + V3 (Past Perfect)",
            desc: "Geçmişte yaşanmış bitmiş bir olaydan duyulan pişmanlığı anlatır.",
            en: "She wishes she had noticed the small error in the exam paper.",
            tr: "Keşke sınav kağıdındaki küçük hatayı fark etmiş olsaydı."
          },
          {
            type: "positive",
            title: "İzlenim Bildirimi (Seem / Appear to V1)",
            structure: "Subject + seems / appears + to + V1",
            desc: "Bir durumun dışarıdan nasıl göründüğünü veya izlenimini ifade eder.",
            en: "The ancient lock seemed to contain dynamic security codes.",
            tr: "Kadim kilit, dinamik güvenlik kodları içeriyor gibi görünüyordu."
          }
        ],
        pitfall: {
          wrong: "I wish I know how to solve this puzzle now.",
          correct: "I wish I knew how to solve this puzzle now.",
          note: "'Wish' cümlelerinde şu anki bir istekten bahsederken bile ana fiil Past Simple (V2) olmak zorundadır."
        },
        relatedSearch: "realize"
      },
      {
        id: "gmod_9",
        number: 9,
        title: "Modül 9: Etki, Zorunluluk ve Yapısal İzin Kalıpları",
        subtitle: "Complex Infinitives & Effect Verbs (Allow / Require sb to V1, Affect vs. Effect)",
        category: "İleri Fiil Kalıpları",
        level: "B1 Seviyesi",
        icon: "🛡️",
        concept: "Birinin bir eylemi yapmasına izin verme, zorunlu kılma veya cesaretlendirme fiillerinde <strong>Fiil + Kişi + to V1</strong> mastar düzeni esastır.",
        formula: [
          { type: "subject", label: "Yönetici Özne", eg: "The system / The coach" },
          { type: "verb", label: "Yönlendirici Fiil", eg: "allows / requires / encourages" },
          { type: "object", label: "Hedef Kişi / Nesne", eg: "us / students" },
          { type: "modifier", label: "Mastar (to + V1)", eg: "to enter the laboratory" }
        ],
        rules: [
          {
            type: "positive",
            title: "İzin Verme Yapısı (Allow / Permit sb to V1)",
            structure: "Subject + allow / permit + Person + to + V1",
            desc: "Bir kişinin bir şey yapmasına müsaade edildiğini belirtir.",
            en: "The security system allows us to enter only if we enter the right key.",
            tr: "Güvenlik sistemi, yalnızca doğru anahtarı girdiğimizde girmemize izin verir."
          },
          {
            type: "special",
            title: "Gereklilik ve Kural (Require sb to V1)",
            structure: "Subject + require + Person + to + V1",
            desc: "Kuralların veya sistemin bir eylemi zorunlu kıldığını ifade eder.",
            en: "School regulations require all students to wear sports uniforms.",
            tr: "Okul yönetmeliği tüm öğrencilerin spor forması giymesini zorunlu kılar."
          },
          {
            type: "positive",
            title: "Affect (Fiil: Etkilemek) vs. Effect (İsim: Etki)",
            structure: "Affect (Action) / Have an effect on (Noun)",
            desc: "Affect eylemdir; Effect ise sonuç ve tesir anlamına gelen isimdir.",
            en: "Regular exercise affects health positively and has a great effect on mood.",
            tr: "Düzenli egzersiz sağlığı olumlu etkiler ve ruh hali üzerinde harika bir etkiye sahiptir."
          }
        ],
        pitfall: {
          wrong: "The coach allowed us play in the final match.",
          correct: "The coach allowed us to play in the final match.",
          note: "'Allow, require, encourage, tell' gibi fiillerden sonra gelen nesne daima 'TO + V1' ile bağlanır."
        },
        relatedSearch: "allow"
      },
      {
        id: "gmod_10",
        number: 10,
        title: "Modül 10: Temel Eylem Fiilleri & Modallar",
        subtitle: "Action Verbs & Modals (Bring, Buy, Call, Carry, Catch... Fiil 1-10)",
        category: "A2 Temel Zamanlar & Fiil 1-10",
        level: "A2 Seviyesi",
        icon: "🏃",
        concept: "Günlük hayattaki temel eylem fiillerinin Modallar (Can, Must, Should, May) ve SVOMPT cümle yapısı içerisindeki olumlu, olumsuz ve soru kullanımlarıdır.",
        formula: [
          { type: "subject", label: "Özne (Subject)", eg: "She / We" },
          { type: "modal", label: "Modal Kip", eg: "can / must / should" },
          { type: "verb", label: "Eylem Fiili (V1)", eg: "bring / carry / call" },
          { type: "object", label: "Nesne (Object)", eg: "her project / equipment" },
          { type: "modifier", label: "Zaman / Yer", eg: "tomorrow / outside" }
        ],
        rules: [
          {
            type: "positive",
            title: "Olumlu Cümle (+)",
            structure: "Subject + Modal + V1 + Object + Time",
            desc: "Modal sonrası fiil daima yalın (V1) haldedir.",
            en: "She can bring her science project to school tomorrow.",
            tr: "Yarın okul projesini okula getirebilir."
          },
          {
            type: "negative",
            title: "Olumsuz Cümle (-)",
            structure: "Subject + Modal + not + V1 + Object",
            desc: "Modal kipine 'not' eklenir; fiil yine yalın kalır.",
            en: "We must not leave the expensive sports equipment outside.",
            tr: "Pahalı spor ekipmanlarını dışarıda bırakmamalıyız."
          },
          {
            type: "question",
            title: "Soru Cümlesi (?)",
            structure: "Modal + Subject + V1 + Object? / WH- + Modal...",
            desc: "Modal cümlenin en başına (veya WH- soru kelimesinin hemen ardına) gelir.",
            en: "Where should I put these historical books?",
            tr: "Bu tarihi kitapları nereye koymalıyım?"
          }
        ],
        pitfall: {
          wrong: "She must brings the books.",
          correct: "She must bring the books.",
          note: "Modal'lardan sonra asla fiile '-s' veya '-ed' eklenmez."
        },
        relatedSearch: "bring"
      },
      {
        id: "gmod_11",
        number: 11,
        title: "Modül 11: Algı ve İletişim Fiilleri",
        subtitle: "Perception & Communication Verbs (See, Hear, Watch, Speak, Tell... Fiil 11-20)",
        category: "A2 Zamanlar & Fiil 11-20",
        level: "A2 Seviyesi",
        icon: "👁️",
        concept: "Gözlem ve iletişim fiillerinde geçmişte devam eden bir eylem (was/were Ving) ile anlık kesintiye uğrayan eylemin (Past Simple V2) anlatımıdır.",
        formula: [
          { type: "subject", label: "Özne", eg: "I / They" },
          { type: "aux", label: "Past Continuous", eg: "was watching the match" },
          { type: "modifier", label: "When + Past Simple", eg: "when the coach arrived" }
        ],
        rules: [
          {
            type: "positive",
            title: "Geçmişte Süreç & Kesinti",
            structure: "Subject + was/were + V-ing + when + Subject + V2",
            desc: "İzleme veya dinleme sürerken başka bir olayın gerçekleşmesi.",
            en: "I was watching the championship match when he called me.",
            tr: "O beni aradığında şampiyonluk maçını izliyordum."
          },
          {
            type: "negative",
            title: "Geçmişte Olumsuz Algı (-)",
            structure: "Subject + didn't + V1 (hear / see)",
            desc: "Algı fiillerinde geçmiş olumsuzluk 'didn't + V1' ile yapılır.",
            en: "They didn't hear the emergency warning siren.",
            tr: "Acil durum uyarı sirenini duymadılar."
          },
          {
            type: "question",
            title: "İletişim Sorusu: Tell (Kişi ile)",
            structure: "What did + Subject + tell + Person?",
            desc: "Tell fiili daima kime söylendiğini (you, him, us) belirtir.",
            en: "What did the teacher tell you after the class?",
            tr: "Dersten sonra öğretmen sana ne söyledi?"
          }
        ],
        pitfall: {
          wrong: "He said me the truth.",
          correct: "He told me the truth. (veya: He said the truth.)",
          note: "Kişi zamiri varsa (me, you, him) 'tell / told' kullanılır; 'say' arkasından doğrudan kişi zamiri almaz."
        },
        relatedSearch: "watch"
      },
      {
        id: "gmod_12",
        number: 12,
        title: "Modül 12: Zihinsel ve Akademik Fiiller",
        subtitle: "Academic & Cognitive Verbs (Think, Know, Understand, Learn, Read, Write... Fiil 21-30)",
        category: "A2-B1 Zamanlar & Fiil 21-30",
        level: "A2 - B1 Seviyesi",
        icon: "📖",
        concept: "Öğrenme, anlama ve düşünme fiillerinde tamamlanmış tecrübeleri anlatan Present Perfect (have/has + V3) ile geniş zamanın karşılaştırmalı kullanımıdır.",
        formula: [
          { type: "subject", label: "Özne", eg: "She / I" },
          { type: "aux", label: "have / has", eg: "has" },
          { type: "verb", label: "Fiil (V3)", eg: "learned / read / understood" },
          { type: "object", label: "Nesne", eg: "all grammar rules" }
        ],
        rules: [
          {
            type: "positive",
            title: "Present Perfect ile Başarı (+)",
            structure: "Subject + have / has + V3 + Object",
            desc: "Geçmişte yapılmış ve sonucu şimdiye yansıyan öğrenme eylemleri.",
            en: "She has learned all 158 English verbs successfully.",
            tr: "158 İngilizce fiilin tamamını başarıyla öğrendi."
          },
          {
            type: "negative",
            title: "Geniş Zamanda Olumsuz Anlama (-)",
            structure: "Subject + don't / doesn't + V1",
            desc: "Şu anki genel anlama ve düşünme durumları.",
            en: "I don't understand this complex math equation.",
            tr: "Bu karmaşık matematik denklemini anlamıyorum."
          },
          {
            type: "question",
            title: "Deneyim ve Miktar Sorusu (?)",
            structure: "How many + Noun + have you + V3?",
            desc: "Bugüne kadar kaç kez/kaç tane yapıldığını sorarken kullanılır.",
            en: "How many chapters have you read this week?",
            tr: "Bu hafta kaç bölüm okudun?"
          }
        ],
        pitfall: {
          wrong: "She has learn the grammar rules.",
          correct: "She has learned the grammar rules.",
          note: "Have/has yardımcı fiillerinden sonra fiil mutlaka 3. halinde (V3) olmalıdır."
        },
        relatedSearch: "learn"
      },
      {
        id: "gmod_13",
        number: 13,
        title: "Modül 13: Mastar Kalıpları ve Günlük Eylemler",
        subtitle: "Infinitive Patterns & Daily Operations (Want to, Need to, Try to, Hope to... Fiil 31-40)",
        category: "A2 Kalıplar & Fiil 31-40",
        level: "A2 Seviyesi",
        icon: "🌱",
        concept: "İstek, ihtiyaç ve çaba bildiren fiillerin arkasına ikinci bir eylem geldiğinde araya <strong>TO</strong> bağlacı gelir ve ikinci fiil yalın (V1) kalır.",
        formula: [
          { type: "subject", label: "Özne", eg: "She / We" },
          { type: "verb", label: "Ana Fiil", eg: "wants / needs / tries" },
          { type: "modal", label: "Mastar Eki", eg: "to" },
          { type: "verb", label: "İkinci Fiil (V1)", eg: "learn / build / close" }
        ],
        rules: [
          {
            type: "positive",
            title: "İstek Bildirme (Want to + V1)",
            structure: "Subject + want(s) to + V1",
            desc: "Geleceğe yönelik bir eylemi yapmayı istemek.",
            en: "She wants to learn computer programming and robotics.",
            tr: "Bilgisayar programlama ve robotik öğrenmek istiyor."
          },
          {
            type: "negative",
            title: "Gereksizlik Bildirme (Don't need to + V1)",
            structure: "Subject + don't / doesn't need to + V1",
            desc: "Bir eylemi yapmanın zorunlu olmadığını belirtir.",
            en: "We don't need to close the laboratory doors right now.",
            tr: "Şu anda laboratuvar kapılarını kapatmamıza gerek yok."
          },
          {
            type: "question",
            title: "Neden ve Karar Sorusu (?)",
            structure: "Why do/did you + decide/try to + V1?",
            desc: "Bir kararın veya çabanın gerekçesini sormak.",
            en: "Why did you decide to start studying early?",
            tr: "Neden erken çalışmaya başlamaya karar verdin?"
          }
        ],
        pitfall: {
          wrong: "I want study English today.",
          correct: "I want to study English today.",
          note: "Want, need, decide, try gibi fiiller ikinci fiile bağlanırken aradaki 'to' mastar eki asla unutulmamalıdır."
        },
        relatedSearch: "want"
      },
      {
        id: "gmod_14",
        number: 14,
        title: "Modül 14: Tercihler ve Ticaret/Finans Fiilleri",
        subtitle: "Preferences & Financial Verbs (Like/Love/Hate + Ving vs. Buy/Pay/Spend... Fiil 41-50)",
        category: "A2 Zamanlar & Fiil 41-50",
        level: "A2 Seviyesi",
        icon: "💳",
        concept: "Sevilen/sevilmeyen aktivitelerden bahsederken fiile gelen <strong>-ing (Gerund)</strong> takısı ile alışveriş ve harcama eylemlerinin geçmiş zaman (Past Simple) kullanımıdır.",
        formula: [
          { type: "subject", label: "Özne", eg: "She / He" },
          { type: "verb", label: "Duygu / Ticaret Fiili", eg: "likes / spent" },
          { type: "object", label: "V-ing / Nesne + on", eg: "playing volleyball / $50 on books" }
        ],
        rules: [
          {
            type: "positive",
            title: "Sevilen Aktiviteler (Like / Love + V-ing)",
            structure: "Subject + like / love / enjoy + V-ing",
            desc: "Bir aktiviteyi yapmaktan genel olarak hoşlanmayı ifade eder.",
            en: "She likes playing volleyball with her teammates on weekends.",
            tr: "Hafta sonları takım arkadaşlarıyla voleybol oynamaktan hoşlanır."
          },
          {
            type: "negative",
            title: "Sevilmeyen Alışkanlıklar (-)",
            structure: "Subject + doesn't like / hates + V-ing",
            desc: "Hoşlanılmayan bir eylemi belirtmek.",
            en: "He doesn't like eating unhealthy fast food before training.",
            tr: "Antrenmandan önce sağlıksız hazır yemekler yemekten hoşlanmaz."
          },
          {
            type: "question",
            title: "Satın Alma ve Harcama Sorusu (?)",
            structure: "Where did + Subject + buy / spend on...?",
            desc: "Nereden alındığını veya ne kadar harcandığını sormak.",
            en: "Where did you buy this high quality sports gear?",
            tr: "Bu yüksek kaliteli spor ekipmanını nereden satın aldın?"
          }
        ],
        pitfall: {
          wrong: "He spent 50 dollars for new shoes.",
          correct: "He spent 50 dollars on new shoes.",
          note: "'Spend money / time' fiili daima 'ON' edatı ile kullanılır (for değil)."
        },
        relatedSearch: "like"
      },
      {
        id: "gmod_15",
        number: 15,
        title: "Modül 15: Fiziksel Eylemler ve Günlük Alışkanlıklar",
        subtitle: "Physical Actions & Daily Habits (Eat, Drink, Sleep, Clean, Wear, Wash... Fiil 51-60)",
        category: "A2 Temel Zamanlar & Fiil 51-60",
        level: "A2 Seviyesi",
        icon: "🍎",
        concept: "Şu anda devam eden fiziksel hareketlerde Present Continuous (am/is/are + Ving) ile geçmişteki alışkanlık ve eylemlerde Past Simple (did/didn't) dengesidir.",
        formula: [
          { type: "subject", label: "Özne", eg: "She / He" },
          { type: "aux", label: "Şimdiki / Geçmiş Yardımcı", eg: "is cleaning / didn't sleep" },
          { type: "modifier", label: "Zaman Belirteci", eg: "right now / last night" }
        ],
        rules: [
          {
            type: "positive",
            title: "Şu Anda Yapılan Eylem (Present Continuous)",
            structure: "Subject + am / is / are + V-ing + now",
            desc: "Konuşma anında gerçekleşen canlı fiziksel eylemler.",
            en: "She is cleaning and organizing the laboratory equipment right now.",
            tr: "Şu anda laboratuvar ekipmanlarını temizliyor ve düzenliyor."
          },
          {
            type: "negative",
            title: "Geçmiş Eylem Olumsuzu (Past Simple -)",
            structure: "Subject + didn't + V1 (yalın)",
            desc: "Geçmişte gerçekleşmemiş fiziksel durumlar.",
            en: "He didn't sleep well last night before the tournament.",
            tr: "Turnuvadan önceki gece iyi uyuyamadı."
          },
          {
            type: "question",
            title: "Alışkanlık ve Saat Sorusu (?)",
            structure: "What time do you usually + V1?",
            desc: "Günlük rutinlerin zamanını sormak.",
            en: "What time do you usually wake up on school days?",
            tr: "Okul günlerinde genellikle saat kaçta uyanırsın?"
          }
        ],
        pitfall: {
          wrong: "He didn't slept well yesterday.",
          correct: "He didn't sleep well yesterday.",
          note: "Cümlede 'didn't' yardımcı fiili varsa ana fiil ikinci hale (V2) geçmez; mutlaka birinci haliyle (V1 yalın) kalır."
        },
        relatedSearch: "clean"
      },
      {
        id: "gmod_16",
        number: 16,
        title: "Modül 16: Hareket, Seyahat ve İletişim",
        subtitle: "Movement, Travel & Direction Verbs (Walk, Run, Travel, Fly, Drive, Send... Fiil 61-70)",
        category: "A2-B1 Zamanlar & Fiil 61-70",
        level: "A2 - B1 Seviyesi",
        icon: "🚀",
        concept: "Seyahat, gelecek planları ve yer değiştirme eylemlerinde 'will / be going to' ve yön/mesafe edatlarının (to, into, across, far) doğru kullanımıdır.",
        formula: [
          { type: "subject", label: "Özne", eg: "We / He" },
          { type: "modal", label: "Gelecek / Yetenek Kipi", eg: "will / can't" },
          { type: "verb", label: "Hareket Fiili (V1)", eg: "travel / swim" },
          { type: "modifier", label: "Yön / Mesafe / Zaman", eg: "to Switzerland next summer" }
        ],
        rules: [
          {
            type: "positive",
            title: "Gelecek Seyahat Planı (Will + V1)",
            structure: "Subject + will + V1 + to [Place] + Time",
            desc: "Gelecekte yapılacak seyahat ve hareket planları.",
            en: "We will travel to Switzerland for the international science fair.",
            tr: "Uluslararası bilim fuarı için İsviçre'ye seyahat edeceğiz."
          },
          {
            type: "negative",
            title: "Yetenek Yetersizliği (Can't / Couldn't)",
            structure: "Subject + can't / couldn't + V1 + in...",
            desc: "Fiziksel olarak bir hareketi yapamama durumu.",
            en: "He can't swim in deep water without a life jacket.",
            tr: "Can yeleği olmadan derin suda yüzemez."
          },
          {
            type: "question",
            title: "Mesafe ve Süreç Sorusu (How far...?)",
            structure: "How far did + Subject + run / walk?",
            desc: "Gidilen mesafeyi veya koşulan uzaklığı sormak.",
            en: "How far did you run during the school endurance test?",
            tr: "Okul dayanıklılık testi sırasında ne kadar uzağa koştun?"
          }
        ],
        pitfall: {
          wrong: "We will to travel to England.",
          correct: "We will travel to England.",
          note: "'Will' kipinden sonra asla 'to' edatı gelmez; fiil doğrudan yalın eklenir."
        },
        relatedSearch: "travel"
      },
      {
        id: "gmod_17",
        number: 17,
        title: "Modül 17: Yaşam Deneyimleri ve Genel Gerçekler",
        subtitle: "Life Experiences & General Truths (Visit, Live, Work, Win, Lose, Grow... Fiil 71-80)",
        category: "A2-B1 Zamanlar & Fiil 71-80",
        level: "A2 - B1 Seviyesi",
        icon: "🌍",
        concept: "Hayat boyu edinilen tecrübelerde zamanı belirsiz Present Perfect (have/has + V3) ile kalıcı durumları anlatan Simple Present (V1 / V-s) arasındaki farktır.",
        formula: [
          { type: "subject", label: "Özne", eg: "He / She" },
          { type: "aux", label: "have / has veya V-s", eg: "has visited / lives" },
          { type: "object", label: "Mekan / Nesne", eg: "many historical museums / in Ankara" }
        ],
        rules: [
          {
            type: "positive",
            title: "Yaşam Tecrübesi (Present Perfect)",
            structure: "Subject + have / has + V3 + Object",
            desc: "Zamanı belirtilmeden hayat boyu yapılmış önemli ziyaret ve deneyimler.",
            en: "He has visited many historical museums around the world.",
            tr: "Dünya çapında birçok tarihi müzeyi ziyaret etti."
          },
          {
            type: "negative",
            title: "Kalıcı Durum ve Yaşam Yeri (-)",
            structure: "Subject + doesn't / don't + live in...",
            desc: "Kalıcı yaşam yerlerini ve durumları ifade eder.",
            en: "She doesn't live in Istanbul; she lives and works in Ankara.",
            tr: "İstanbul'da yaşamıyor; Ankara'da yaşıyor ve çalışıyor."
          },
          {
            type: "question",
            title: "Kazanma ve Başarı Sorusu (?)",
            structure: "Did + Subject + win the match/cup?",
            desc: "Belirli bir geçmiş karşılaşmanın sonucunu sormak.",
            en: "Did your robotics team win the national championship?",
            tr: "Robotik takımınız ulusal şampiyonluğu kazandı mı?"
          }
        ],
        pitfall: {
          wrong: "He has visited Ankara two years ago.",
          correct: "He visited Ankara two years ago. (veya: He has visited Ankara.)",
          note: "Eğer cümlede 'two years ago, yesterday, in 2020' gibi net bir geçmiş zaman ifadesi varsa Present Perfect kullanılmaz, Past Simple (V2) kullanılır."
        },
        relatedSearch: "visit"
      }
    ];
  }

  renderRichModuleHtml(mod) {
    const isExpanded = this.expandedModuleId === mod.id;

    return `
      <div class="module-card ${isExpanded ? 'expanded' : ''}" id="card-${mod.id}">
        <div class="module-header" onclick="grammarView.toggleModule('${mod.id}')">
          <div class="module-header-left">
            <div class="module-num-badge">${mod.number}</div>
            <div class="module-title-wrap">
              <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                <span class="badge" style="font-size:0.68rem; padding:2px 8px; background:rgba(56,189,248,0.2); color:#38bdf8; font-weight:800; border-radius:4px;">${mod.level}</span>
                <span style="font-size:0.75rem; color:var(--text-muted);">${mod.category}</span>
              </div>
              <h3 style="margin-top:4px; font-size:1.02rem; color:#ffffff; font-weight:800;">
                <span style="margin-right:4px;">${mod.icon}</span> ${mod.title}
              </h3>
              <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:2px;">${mod.subtitle}</div>
            </div>
          </div>
          <span class="expand-chevron">▼</span>
        </div>

        <div class="module-body">
          <div class="grammar-detail-container">
            <!-- 1. Concept Card -->
            <div class="grammar-concept-card">
              <div class="grammar-concept-header">
                <div class="grammar-concept-title">
                  <span>💡</span> Konu Özeti & Mantığı
                </div>
                <span class="badge" style="background:rgba(129,140,248,0.2); color:#818cf8; font-size:0.72rem; font-weight:800; padding:3px 8px; border-radius:4px;">
                  Temel Gramer Kuralı
                </span>
              </div>
              <div class="grammar-concept-desc">
                ${mod.concept}
              </div>

              <!-- Visual Formula Flow -->
              <div class="grammar-formula-card">
                <div class="grammar-formula-label">
                  <span>🧩</span> Cümle Formülü & SVOMPT Dizilimi:
                </div>
                <div class="grammar-formula-flow">
                  ${mod.formula.map((f, fIdx) => `
                    <div class="formula-pill ${f.type}" title="${f.eg}">
                      <strong>${f.label}</strong>
                      <span style="font-size:0.7rem; opacity:0.85;">(${f.eg})</span>
                    </div>
                    ${fIdx < mod.formula.length - 1 ? '<span class="formula-plus">+</span>' : ''}
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- 2. Structured Rules & Examples Grid -->
            <div>
              <div style="font-size:0.82rem; font-weight:800; color:#38bdf8; text-transform:uppercase; margin-bottom:8px; display:flex; align-items:center; gap:6px;">
                <span>📚</span> Kullanım Kalıpları ve Örnek Cümleler:
              </div>
              <div class="grammar-rules-grid">
                ${mod.rules.map(rule => `
                  <div class="grammar-rule-card">
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">
                      <span class="grammar-rule-tag ${rule.type}">
                        ${rule.type === 'positive' ? '✅' : rule.type === 'negative' ? '❌' : rule.type === 'question' ? '❓' : '⚡'} ${rule.title}
                      </span>
                    </div>
                    <div class="grammar-rule-structure">${rule.structure}</div>
                    <div class="grammar-rule-desc">${rule.desc}</div>
                    
                    <div class="grammar-example-box">
                      <div class="grammar-example-en">
                        <span>${rule.en}</span>
                        <button class="grammar-audio-btn" title="Telaffuzu Dinle" 
                                onclick="event.stopPropagation(); grammarView.speakText('${rule.en.replace(/'/g, "\\\\'")}')">
                          🔊
                        </button>
                      </div>
                      <div class="grammar-example-tr">${rule.tr}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- 3. Pitfalls & Golden Rules Box -->
            ${mod.pitfall ? `
              <div class="grammar-pitfall-box">
                <div class="grammar-pitfall-title">
                  <span>⚠️</span> DİKKAT! SIK YAPILAN HATA & ALTIN KURAL
                </div>
                <div class="grammar-pitfall-comparison">
                  <div class="grammar-pitfall-wrong">
                    <span>❌ <strong>Yanlış:</strong> "${mod.pitfall.wrong}"</span>
                  </div>
                  <div class="grammar-pitfall-correct">
                    <span>✅ <strong>Doğru:</strong> "${mod.pitfall.correct}"</span>
                  </div>
                  <div class="grammar-pitfall-note">
                    💡 <strong>İpucu:</strong> ${mod.pitfall.note}
                  </div>
                </div>
              </div>
            ` : ''}

            <!-- 4. Quick Action Buttons -->
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; padding-top:8px; border-top:1px solid rgba(255,255,255,0.08);">
              <button class="btn-secondary" style="padding:7px 14px; font-size:0.8rem; display:flex; align-items:center; gap:6px; cursor:pointer;"
                      onclick="app.switchTab('builder')">
                🧩 Bu Konuyla Cümle Kur (Cümle Fabrikası)
              </button>
              <button class="btn-primary" style="padding:7px 16px; font-size:0.8rem; display:flex; align-items:center; gap:6px; cursor:pointer;" 
                      onclick="verbsView.setSearch('${mod.relatedSearch || mod.title.split(':')[0]}'); app.switchTab('verbs');">
                🔍 Bu Konunun Fiillerine Git (${mod.number <= 9 ? 'A2-B1' : 'Modül ' + mod.number})
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  speakText(text) {
    if (window.speechEngine) {
      window.speechEngine.speak(text);
    }
  }
'''

with open('/Users/alionurcerrah/Desktop/İngilizce Kelime/js/grammar_view.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the modules accordion part in render()
old_accordion = re.search(r'(<!-- 17 Modules Accordion -->.*?<div class="modules-accordion">)(.*?)(</div>\s*`;\s*})', content, re.DOTALL)
if old_accordion:
    new_accordion_html = """<!-- 17 Modules Accordion -->
      <div class="section-header" style="margin-bottom:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div>
            <h2>📚 Kapsamlı Gramer Rehberi</h2>
            <p>17 Modül detaylı kurallar, görsel SVOMPT formül kartları, sesli örnekler ve altın ipuçları</p>
          </div>
          <span class="badge" style="background:rgba(56,189,248,0.15); color:#38bdf8; font-weight:800; font-size:0.75rem; padding:4px 10px; border-radius:12px;">
            17 Modül Aktif 📖
          </span>
        </div>
      </div>

      <div class="modules-accordion">
        ${this.getRichGrammarModules().map(mod => this.renderRichModuleHtml(mod)).join('')}
      </div>
    `;
  }"""
    
    # Replace from the beginning of accordion to end of render()
    render_pos = content.find('<!-- 17 Modules Accordion -->')
    render_end_pos = content.find('getFilteredVideos() {')
    
    # We replace from render_pos to render_end_pos
    modified_render = content[:render_pos] + new_accordion_html + "\n\n  " + rich_modules_js + "\n\n  " + content[render_end_pos:]
    
    with open('/Users/alionurcerrah/Desktop/İngilizce Kelime/js/grammar_view.js', 'w', encoding='utf-8') as f:
        f.write(modified_render)
    print("SUCCESS: Updated js/grammar_view.js with 17 rich modules!")
else:
    print("ERROR: Could not find accordion section in grammar_view.js")
