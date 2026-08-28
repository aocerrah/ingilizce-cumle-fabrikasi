import json
import os
from generate_full_curriculum import A2_VERBS_RAW, B1_VERBS_RAW, get_forms

# 60 Complete Curated Phrasal Verbs (Deyimsel Fiiller)
PHRASAL_VERBS_DATA = [
    ("give up", "pes etmek, bırakmak", "Vazgeçme & Alışkanlık", "Disciplined athletes never give up during tough championship games.", "Disiplinli sporcular zorlu şampiyona maçlarında asla pes etmezler.", "He didn't give up his healthy nutrition habits during vacation.", "Tatil sırasında sağlıklı beslenme alışkanlıklarını bırakmadı.", "Why did you give up practicing English grammar every morning?", "Her sabah İngilizce gramer pratiği yapmayı neden bıraktın?"),
    ("find out", "öğrenmek, keşfetmek, bulmak", "Araştırma & Keşif", "Scientists conducted tests to find out the cause of muscle fatigue.", "Bilim insanları kas yorgunluğunun sebebini öğrenmek için testler yaptılar.", "She didn't find out about the scholarship results until Monday.", "Pazartesi gününe kadar burs sonuçlarını öğrenmedi.", "Did you find out how the new photocell timing gates operate?", "Yeni fotosel zamanlama kapılarının nasıl çalıştığını öğrendin mi?"),
    ("carry out", "yürütmek, uygulamak, gerçekleştirmek", "Bilimsel & Akademik", "Researchers will carry out a comprehensive biomechanical study.", "Araştırmacılar kapsamlı bir biyomekanik çalışma yürütecekler.", "The team didn't carry out the tactical instructions properly.", "Takım taktik talimatları düzgün bir şekilde uygulamadı.", "Who will carry out the sensor calibration tests tomorrow?", "Yarın sensör kalibrasyon testlerini kim gerçekleştirecek?"),
    ("look forward to", "dört gözle beklemek, iple çekmek", "Beklenti & İstek", "Ela looks forward to starting her academic research project.", "Ela akademik araştırma projesine başlamayı dört gözle bekliyor.", "He isn't looking forward to the long bus travel to Istanbul.", "İstanbul'a yapılacak uzun otobüs yolculuğunu iple çekmiyor.", "Are you looking forward to the international VR sports conference?", "Uluslararası VR spor konferansını dört gözle bekliyor musun?"),
    ("set up", "kurmak, hazırlamak, oluşturmak", "Organizasyon & Donanım", "The technicians set up the high-speed motion tracking cameras.", "Teknisyenler yüksek hızlı hareket takip kameralarını kurdular.", "They didn't set up the optical sprint gates before the athletes arrived.", "Sporcular varmadan önce optik depar kapılarını kurmadılar.", "Can you help me set up the virtual reality test environment?", "Sanal gerçeklik test ortamını kurmama yardım edebilir misin?"),
    ("figure out", "çözmek, anlamak, hesaplamak", "Zihinsel & Problem Çözme", "Smart students figure out complex mathematical solutions quickly.", "Zeki öğrenciler karmaşık matematiksel çözümleri çabucak çözerler/anlarlar.", "He couldn't figure out why the wireless sensor disconnected.", "Kablosuz sensörün neden bağlantısının kesildiğini çözemedi.", "Did you figure out how to calculate the acute-to-chronic workload ratio?", "Akut-kronik iş yükü oranının nasıl hesaplanacağını çözdün mü?"),
    ("turn down", "reddetmek, kısmak (ses/ısı)", "Karar & Tercih", "The professor had to turn down the offer due to heavy workload.", "Profesör yoğun iş yükü nedeniyle teklifi reddetmek zorunda kaldı.", "He didn't turn down the invitation to the national team camp.", "Milli takım kampı davetini reddetmedi.", "Why did they turn down our research grant application?", "Araştırma hibesi başvurumuzu neden reddettiler?"),
    ("run out of", "tükenmek, bitmek", "Kaynak & Durum", "Athletes can run out of energy if they skip recovery meals.", "Sporcular toparlanma öğünlerini atlarlarsa enerjileri tükenebilir.", "The laboratory didn't run out of testing supplies this semester.", "Laboratuvarın test malzemeleri bu dönem tükenmedi.", "Did the tracker run out of battery during the soccer match?", "Futbol maçı sırasında takip cihazının pili bitti mi?"),
    ("keep up with", "ayak uydurmak, hızına yetişmek", "Süreç & Gelişim", "Students must keep up with daily lessons to achieve top grades.", "Öğrenciler en yüksek notları almak için günlük derslere ayak uydurmalıdır.", "He couldn't keep up with the fast pace of the counterattack.", "Hızlı kontra atağın temposuna ayak uyduramadı/yetişemedi.", "How do researchers keep up with rapid advancements in AI technology?", "Araştırmacılar yapay zeka teknolojisindeki hızlı gelişmelere nasıl ayak uyduruyor?"),
    ("come up with", "ortaya atmak, fikir üretmek, bulmak", "Yaratıcılık & İnovasyon", "Young coders came up with an innovative mobile learning solution.", "Genç yazılımcılar yenilikçi bir mobil öğrenme çözümü ortaya attılar.", "The committee didn't come up with a realistic budget plan.", "Komite gerçekçi bir bütçe planı ortaya koyamadı/üretemedi.", "Did your team come up with a creative project idea for the science fair?", "Takımınız bilim fuarı için yaratıcı bir proje fikri buldu mu?"),
    ("take care of", "ilgilenmek, göz kulak olmak, bakmak", "Sorumluluk & Sağlık", "Professional athletes take care of their physical and mental health.", "Profesyonel sporcular fiziksel ve zihinsel sağlıklarıyla ilgilenirler/bakarlar.", "He didn't take care of his sports passport before travel.", "Seyahat öncesinde spor pasaportuyla ilgilenmedi/korumadı.", "Who will take care of the sensitive optical sensors during transport?", "Taşıma sırasında hassas optik sensörlerle kim ilgilenecek?"),
    ("point out", "işaret etmek, dikkat çekmek, belirtmek", "İletişim & Analiz", "The mentor pointed out several critical errors in our data chart.", "Danışman veri grafiğimizdeki birkaç kritik hataya dikkat çekti.", "She didn't point out the flaws in the competitor's tactical scheme.", "Rakibin taktik şemasındaki kusurlara dikkat çekmedi.", "Can you point out the main differences between Type 1 and Type 2 conditionals?", "Type 1 ve Type 2 şart cümleleri arasındaki temel farkları işaret edebilir misiniz?"),
    ("bring up", "gündeme getirmek, bahsetmek, yetiştirmek", "Sosyal & İletişim", "The coach brought up the importance of sleep during the meeting.", "Antrenör toplantı sırasında uykunun önemini gündeme getirdi.", "He didn't bring up his injury concerns with the team doctor.", "Sakatlık endişelerini takım doktoruyla gündeme getirmedi.", "Why did you bring up that controversial topic during the conference?", "Konferans sırasında o tartışmalı konuyu neden gündeme getirdin?"),
    ("turn into", "dönüşmek, dönüştürmek", "Değişim & Gelişim", "Hard work and consistency turn potential into world-class success.", "Sıkı çalışma ve tutarlılık potansiyeli dünya standartlarında başarıya dönüştürür.", "The minor software glitch didn't turn into a system failure.", "Küçük yazılım aksaklığı bir sistem arızasına dönüşmedi.", "How did this simple student project turn into a successful startup?", "Bu basit öğrenci projesi nasıl başarılı bir girişime dönüştü?"),
    ("look after", "ilgilenmek, bakmak, korumak", "Sorumluluk & Özen", "Parents look after their children's education and well-being.", "Ebeveynler çocuklarının eğitimi ve esenliğiyle ilgilenirler/bakarlar.", "He didn't look after his sports gear and lost his kneepads.", "Spor eşyalarına iyi bakmadı ve dizliklerini kaybetti.", "Will the academy staff look after the visiting international delegates?", "Akademi personeli gelen uluslararası delegelerle ilgilenecek mi?"),
    ("break down", "bozulmak, parçalara ayırmak, çökmek", "Sistem & Analiz", "Sports scientists break down complex sprint motion into phases.", "Spor bilimcileri karmaşık depar hareketini aşamalara ayırırlar.", "The biometric tracking server didn't break down during the test.", "Biyometrik takip sunucusu test sırasında bozulmadı.", "Why did the vehicle break down on the way to the tournament?", "Araç turnuva yolunda neden bozuldu?"),
    ("put off", "ertelemek", "Zaman & Planlama", "Disciplined students don't put off their daily homework.", "Disiplinli öğrenciler günlük ödevlerini ertelemezler.", "The organizers didn't put off the outdoor match despite light rain.", "Organizatörler hafif yağmura rağmen açık hava maçını ertelemediler.", "Why do people often put off learning a new foreign language?", "İnsanlar yeni bir yabancı dil öğrenmeyi neden sık sık ertelerler?"),
    ("call off", "iptal etmek", "Organizasyon & Karar", "The referee had to call off the soccer game due to heavy snow.", "Hakem yoğun kar yağışı nedeniyle futbol maçını iptal etmek zorunda kaldı.", "They didn't call off the scientific seminar despite the storm.", "Fırtınaya rağmen bilimsel semineri iptal etmediler.", "Why did the committee call off the annual awards ceremony?", "Komite yıllık ödül törenini neden iptal etti?"),
    ("count on", "güvenmek, bel bağlamak", "Güven & Sosyal", "Great teammates count on each other during challenging match moments.", "Harika takım arkadaşları zorlu maç anlarında birbirlerine güvenirler.", "You cannot count on luck to pass high-level language examinations.", "Yüksek düzey dil sınavlarını geçmek için şansa bel bağlayamazsınız.", "Can the head coach count on your full concentration tomorrow?", "Başantrenör yarın tam konsantrasyonuna güvenebilir mi?"),
    ("run into", "karşılaşmak (rastlantı), toslamak", "Sosyal & Hareket", "I ran into my old sports mentor at the university library.", "Üniversite kütüphanesinde eski spor danışmanımla karşılaştım.", "We didn't run into any unexpected technical glitches today.", "Bugün beklenmedik teknik aksaklıklarla karşılaşmadık.", "Did you run into any famous researchers during the symposium?", "Sempozyum sırasında hiç ünlü araştırmacıyla karşılaştın mı?"),
    ("stand out", "öne çıkmak, göze çarpmak, fark yaratmak", "Başarı & Nitelik", "Her exceptional sprint speed makes her stand out among peers.", "Olağanüstü depar hızı onun akranları arasında öne çıkmasını sağlıyor.", "The draft presentation didn't stand out because of plain slides.", "Taslak sunum sade slaytlar nedeniyle öne çıkmadı/göze çarpmadı.", "What qualities make an athlete stand out in elite academies?", "Seçkin akademilerde bir sporcunun öne çıkmasını sağlayan nitelikler nelerdir?"),
    ("rely on", "güvenmek, dayanmak, bağımlı olmak", "Güven & Bilimsel", "Researchers rely on validated data models for accurate predictions.", "Araştırmacılar doğru tahminler için doğrulanmış veri modellerine güvenirler.", "The department doesn't rely on uncalibrated optical equipment.", "Bölüm kalibre edilmemiş optik ekipmanlara güvenmez/dayanmaz.", "Do elite volleyball players rely on visual cues during blocks?", "Seçkin voleybolcular bloklar sırasında görsel ipuçlarına mı güvenirler?"),
    ("deal with", "başa çıkmak, ele almak, ilgilenmek", "Yönetim & Stres", "Coaches must deal with high match stress calmly and strategically.", "Antrenörler yüksek maç stresiyle sakin ve stratejik bir şekilde başa çıkmalıdır.", "She didn't deal with the software bug before the demo.", "Demodan önce yazılım hatasıyla ilgilenmedi/çözmedi.", "How do young students deal with exam anxiety effectively?", "Genç öğrenciler sınav kaygısıyla nasıl etkili bir şekilde başa çıkarlar?"),
    ("catch up", "yetişmek, arayı kapatmak", "Hız & Süreç", "He ran faster in the final straight to catch up with the leader.", "Lidere yetişmek/arayı kapatmak için son düzlükte daha hızlı koştu.", "She hasn't caught up with her missed homework assignments yet.", "Kaçırdığı ödevlerini henüz telafi etmedi/yetişemedi.", "How quickly can you catch up with the advanced grammar syllabus?", "İleri gramer müfredatına ne kadar hızlı yetişebilirsin?"),
    ("cut down on", "azaltmak, kısmak", "Sağlık & Alışkanlık", "Athletes cut down on processed sugar before major tournaments.", "Sporcular büyük turnuvalardan önce işlenmiş şekeri azaltırlar.", "He didn't cut down on his late-night screen time.", "Gece geç saatlerdeki ekran süresini azaltmadı.", "Why should runners cut down on excessive caffeine intake?", "Koşucular aşırı kafein alımını neden azaltmalıdır?"),
    # Additional 35 High-Yield Phrasal Verbs
    ("carry on", "devam etmek, sürdürmek", "Süreç & Kararlılık", "The athletes carried on training despite heavy rain.", "Sporcular şiddetli yağmura rağmen antrenmana devam ettiler.", "Don't carry on working if you feel dizzy or nauseous.", "Başın dönerse veya miden bulanırsa çalışmaya devam etme.", "How long will you carry on this high-intensity training regimen?", "Bu yüksek yoğunluklu antrenman düzenini ne kadar sürdüreceksin?"),
    ("come across", "karşılaşmak, tesadüfen bulmak", "Keşif & Arama", "Researchers came across an intriguing pattern in the sensor telemetry.", "Araştırmacılar sensör telemetrisinde ilgi çekici bir kalıpla karşılaştılar.", "I didn't come across any errors in your English grammar exercise.", "İngilizce gramer alıştırmanda hiçbir hatayla karşılaşmadım.", "Did you come across any old sports records in the archive?", "Arşivde hiç eski spor rekoruna rastladın mı?"),
    ("get along with", "biriyle iyi geçinmek, anlaşmak", "Sosyal & Takım Ruhu", "Teammates must get along with each other to achieve tactical synergy.", "Taktiksel sinerjiye ulaşmak için takım arkadaşları birbiriyle iyi geçinmelidir.", "He doesn't get along with colleagues who refuse constructive feedback.", "Yapıcı geri bildirimi reddeden meslektaşlarıyla iyi anlaşamaz.", "How well do the new academy players get along with the senior captain?", "Yeni akademi oyuncuları kıdemli kaptanla ne kadar iyi anlaşıyor?"),
    ("get over", "atlatmak, üstesinden gelmek, iyileşmek", "Sağlık & Psikoloji", "The sprinter got over her hamstring injury in just four weeks.", "Depar koşucusu arka adale sakatlığını sadece dört haftada atlattı.", "He hasn't gotten over the disappointment of losing the final match yet.", "Final maçını kaybetmenin hayal kırıklığını henüz atlatamadı.", "How long did it take you to get over the severe flu?", "Şiddetli gribi atlatman ne kadar sürdü?"),
    ("work out", "antrenman yapmak, çözüme ulaşmak", "Spor & Problem Çözme", "Ela works out at the fitness center three mornings a week.", "Ela haftada üç sabah fitness merkezinde antrenman yapar.", "The tactical plan didn't work out as expected during the second half.", "Taktik plan ikinci yarıda beklendiği gibi çözüme/başarıya ulaşmadı.", "How often do professional athletes work out in the gym?", "Profesyonel sporcular spor salonunda ne sıklıkla antrenman yaparlar?"),
    ("warm up", "ısınmak, ısınma hareketleri yapmak", "Spor & Hazırlık", "Always warm up for fifteen minutes before running at full speed.", "Tam hızda koşmadan önce daima on beş dakika ısının.", "He didn't warm up properly and strained his calf muscle.", "Düzgünce ısınmadı ve baldır kasını zorladı.", "What exercises do you do to warm up before a volleyball match?", "Voleybol maçından önce ısınmak için hangi egzersizleri yaparsın?"),
    ("cool down", "soğumak, sakinleşmek", "Spor & Toparlanma", "Athletes cool down by jogging lightly and stretching after drills.", "Sporcular egzersizlerden sonra hafif tempolu koşup esneyerek soğurlar.", "Don't skip cooling down after high-intensity anaerobic sprints.", "Yüksek yoğunluklu anaerobik deparlardan sonra soğumayı atlamayın.", "Why is it essential to cool down after vigorous physical exercise?", "Zorlu fiziksel egzersizden sonra soğumak neden hayatidir?"),
    ("look into", "incelemek, araştırmak", "Bilimsel & Analiz", "The scientific committee will look into the causes of the tracking anomaly.", "Bilim kurulu takip anomalisinin nedenlerini inceleyecek/araştıracak.", "The police didn't look into the complaint without sufficient evidence.", "Polis yeterli delil olmadan şikayeti araştırmadı.", "Will you look into the latest research on cognitive reaction time?", "Bilişsel tepki süresiyle ilgili en son araştırmayı inceleyecek misiniz?"),
    ("look up to", "hayranlık duymak, örnek almak", "Sosyal & Rol Model", "Young academy players look up to Olympic champions for inspiration.", "Genç akademi oyuncuları ilham almak için Olimpik şampiyonları örnek alırlar.", "He doesn't look up to athletes who lack sportsmanship.", "Sportmenlikten yoksun sporcuları örnek almaz/hayranlık duymaz.", "Which famous scientist or athlete do you look up to most?", "En çok hangi ünlü bilim insanını veya sporcuyu örnek alıyorsun?"),
    ("take up", "başlamak (hobi/spor), yer kaplamak", "Aktivite & Zaman", "Ela decided to take up competitive volleyball this semester.", "Ela bu dönem müsabık voleybola başlamaya karar verdi.", "This heavy testing equipment doesn't take up too much floor space.", "Bu ağır test ekipmanı zemin üzerinde çok fazla yer kaplamaz.", "Why did you take up learning English through interactive mobile apps?", "Etkileşimli mobil uygulamalarla İngilizce öğrenmeye neden başladın?"),
    ("make up", "oluşturmak, uydurmak, telafi etmek", "Akademik & İletişim", "International players make up forty percent of the academy squad.", "Uluslararası oyuncular akademi kadrosunun yüzde kırkını oluşturur.", "She didn't make up any excuses for missing morning practice.", "Sabah antrenmanını kaçırmak için hiçbir bahane uydurmadı.", "How will you make up for the missed laboratory sessions?", "Kaçırılan laboratuvar seanslarını nasıl telafi edeceksin?"),
    ("bring about", "sebep olmak, yol açmak, meydana getirmek", "Değişim & Sonuç", "New sensor technology brought about major breakthroughs in sports science.", "Yeni sensör teknolojisi spor biliminde büyük atılımlara yol açtı/sebep oldu.", "Careless training plans will not bring about positive athletic growth.", "Dikkatsiz antrenman planları olumlu atletik gelişime yol açmayacaktır.", "What factors brought about the sudden change in team performance?", "Takım performansındaki ani değişime hangi faktörler yol açtı?"),
    ("turn up", "sesi açmak, ortaya çıkmak, varmak", "Hareket & Ses", "Please turn up the volume so everyone can hear the pronunciation clearly.", "Lütfen sesi açın ki herkes telaffuzu net bir şekilde duyabilsin.", "He didn't turn up at the press conference on time.", "Basın toplantısına zamanında gelmedi/ortaya çıkmadı.", "What time did the guest instructor turn up at the seminar?", "Konuk eğitmen seminere saat kaçta geldi?"),
    ("turn on", "açmak (cihaz, ışık)", "Teknoloji & Kullanım", "The technician turned on the high-speed motion capture system.", "Teknisyen yüksek hızlı hareket yakalama sistemini açtı.", "Don't turn on the VR headset before strapping it securely.", "VR başlığını güvenli bir şekilde bağlamadan önce açmayın.", "Did you turn on the optical sprint timing gates?", "Optik depar zamanlama kapılarını açtın mı?"),
    ("turn off", "kapatmak (cihaz, ışık)", "Teknoloji & Kullanım", "Please turn off your mobile devices during the official examination.", "Resmi sınav sırasında lütfen mobil cihazlarınızı kapatın.", "He didn't turn off the biometric recording software properly.", "Biyometrik kayıt yazılımını düzgünce kapatmadı.", "Why did you turn off the air conditioning in the gym?", "Spor salonundaki klimayı neden kapattın?"),
    ("pick up", "öğrenmek/kapmak, arabayla almak, toplamak", "Öğrenme & Günlük", "Children pick up new languages quickly through gamified stories.", "Çocuklar oyunlaştırılmış hikayeler sayesinde yeni dilleri çabucak kaparlar/öğrenirler.", "The driver didn't pick up the guest researchers from the airport.", "Şoför konuk araştırmacıları havalimanından almadı.", "Where did you pick up such natural English pronunciation?", "Böyle doğal bir İngilizce telaffuzu nerede kaptın/öğrendin?"),
    ("put up with", "katlanmak, tahammül etmek", "Sabır & Zorluk", "Dedicated athletes put up with grueling daily workouts to win.", "Özverili sporcular kazanmak için yorucu günlük antrenmanlara katlanırlar.", "She won't put up with disrespectful behavior in the classroom.", "Sınıfta saygısız davranışa tahammül etmeyecektir.", "How do coaches put up with extreme pressure during tournament finals?", "Antrenörler turnuva finallerinde aşırı baskıya nasıl katlanırlar?"),
    ("show up", "çıkagelmek, ortaya çıkmak, görünmek", "Katılım & Zaman", "More than fifty candidates showed up for the academy soccer trials.", "Akademi futbol seçmeleri için elliden fazla aday çıkageldi/katıldı.", "He didn't show up for the morning briefing due to traffic.", "Trafik nedeniyle sabah bilgilendirme toplantısına gelmedi.", "Why didn't the visiting team show up on the football pitch?", "Konuk takım futbol sahasında neden görünmedi/çıkmadı?"),
    ("show off", "hava atmak, gösteriş yapmak", "Kişilik & Davranış", "Disciplined players focus on teamwork rather than showing off.", "Disiplinli oyuncular gösteriş yapmaktan ziyade takım çalışmasına odaklanırlar.", "She doesn't show off her academic awards on social media.", "Akademik ödülleriyle sosyal medyada gösteriş yapmaz/hava atmaz.", "Why was the striker showing off after scoring the winning goal?", "Forvet galibiyet golünü attıktan sonra neden hava atıyordu?"),
    ("take off", "havalanmak, çıkarmak (kıyafet), hızla yükselmek", "Havacılık & Başarı", "The startup took off rapidly after releasing their mobile grammar app.", "Girişim, mobil gramer uygulamasını yayınladıktan sonra hızla yükselişe geçti.", "The charter flight didn't take off on schedule because of thunderstorms.", "Fırtına nedeniyle özel uçuş planlanan zamanda havalanmadı.", "Did the athlete take off his running spikes before entering the lab?", "Sporcu laboratuvara girmeden önce koşu çivili ayakkabılarını çıkardı mı?"),
    ("take over", "devralmak, yönetimi ele almak", "Yönetim & Süreç", "The experienced coach will take over the national youth squad.", "Deneyimli antrenör ulusal genç kadroyu devralacak.", "Artificial intelligence will not completely take over human teaching.", "Yapay zeka insan öğretmenliğini tamamen devralmayacaktır.", "Who will take over the biomechanics department next year?", "Gelecek yıl biyomekanik bölümünü kim devralacak?"),
    ("back up", "desteklemek, yedeklemek (veri)", "Bilişim & Destek", "Always back up your experimental research data to the cloud daily.", "Deneysel araştırma verilerinizi her gün mutlaka buluta yedekleyin.", "He didn't back up his claim with verified scientific facts.", "İddiasını doğrulanmış bilimsel gerçeklerle desteklemedi.", "Did you back up the full tracking database before updating?", "Güncellemeden önce tüm takip veritabanını yedekledin mi?"),
    ("end up", "sonuçlanmak, kendini ... bulmak", "Sonuç & Süreç", "Unplanned training schedules often end up causing chronic injuries.", "Plansız antrenman programları sıklıkla kronik sakatlıklara yol açarak sonuçlanır.", "He didn't end up in the reserve squad; he earned a starting spot.", "Kendini yedek kadroda bulmadı; ilk 11'de bir yer kazandı.", "How did the young scientist end up presenting at Harvard?", "Genç bilim insanı kendini Harvard'da sunum yaparken nasıl buldu?"),
    ("fill in", "doldurmak (form, boşluk)", "Akademik & İdari", "Please fill in the medical screening questionnaire before testing.", "Testten önce lütfen sağlık tarama anketini doldurunuz.", "She didn't fill in all required fields on the scholarship form.", "Burs formundaki tüm gerekli alanları doldurmadı.", "Can you fill in the missing irregular verb forms in this table?", "Bu tablodaki eksik düzensiz fiil hallerini doldurabilir misin?"),
    ("pass out", "bayılmak, dağıtmak", "Sağlık & Organizasyon", "Dehydrated runners can pass out during extreme summer marathons.", "Susuz kalan koşucular aşırı sıcak yaz maratonlarında bayılabilirler.", "The assistant didn't pass out the test papers until everyone sat down.", "Asistan herkes oturana kadar sınav kağıtlarını dağıtmadı.", "Why did the marathon runner pass out near the finish line?", "Maraton koşucusu bitiş çizgisine yakın yerde neden bayıldı?"),
    ("pay off", "karşılığını vermek, borcu ödemek", "Başarı & Emek", "Months of disciplined grammar revision finally paid off in the exam.", "Aylarca süren disiplinli gramer tekrarı nihayet sınavda karşılığını verdi.", "Shortcuts in conditioning will not pay off during tough competitions.", "Kondisyonda kestirmeden gitmek zorlu yarışmalarda karşılığını vermeyecektir.", "Did all your late-night coding sessions pay off with this app?", "Gece geç saatlere kadar süren tüm kodlama seansların bu uygulamayla karşılığını verdi mi?"),
    ("check in", "giriş yapmak, kayıt yaptırmak", "Otel & Havaalanı", "The athletic delegation checked in to the campus dormitory at noon.", "Spor heyeti öğlen kampüs yurduna giriş yaptı/kayıt yaptırdı.", "They didn't check in their biometric testing baggage at the airport.", "Havaalanında biyometrik test bagajlarını teslim etmediler/kaydettirmediler.", "What time do we need to check in for the international flight?", "Uluslararası uçuş için saat kaçta check-in yapmamız gerekiyor?"),
    ("check out", "çıkış yapmak, kontrol etmek/göz atmak", "İnceleme & Ayrılış", "Check out the latest SVOMPT sentence builder feature in the app!", "Uygulamadaki en son SVOMPT cümle kurucu özelliğine göz atın/kontrol edin!", "He didn't check out of the hotel before noon.", "Öğleden önce otelden çıkış yapmadı.", "Did you check out the new video lectures on relative clauses?", "Sıfat cümlecikleri hakkındaki yeni video derslere göz attın mı?"),
    ("grow up", "büyümek, yetişmek", "Yaşam & Gelişim", "Ela grew up in Eskişehir with a deep passion for science and volleyball.", "Ela bilime ve voleybola derin bir tutkuyla Eskişehir'de büyüdü.", "He didn't grow up in an English-speaking country, yet he speaks fluently.", "İngilizce konuşulan bir ülkede büyümedi, yine de akıcı konuşuyor.", "Where did you grow up during your early childhood years?", "Erken çocukluk yıllarında nerede büyüdün?"),
    ("hold on", "beklemek, tutunmak", "Telefon & Hareket", "Please hold on while I transfer your call to the department head.", "Görüşmenizi bölüm başkanına aktarırken lütfen hatta bekleyin.", "He couldn't hold on to the gymnastic bar with sweaty hands.", "Terli elleriyle jimnastik barına tutunamadı.", "Can you hold on for two minutes while I fetch the sensor cable?", "Ben sensör kablosunu getirirken iki dakika bekleyebilir misin?"),
    ("look for", "aramak", "Arama & İhtiyaç", "Scientists are looking for innovative methods to reduce muscle soreness.", "Bilim insanları kas ağrısını azaltmak için yenilikçi yöntemler arıyorlar.", "She wasn't looking for excuses; she was looking for solutions.", "Bahane aramıyordu; çözüm arıyordu.", "What kind of reference books are you looking for in the library?", "Kütüphanede ne tür kaynak kitaplar arıyorsunuz?"),
    ("pass away", "vefat etmek, hayatını kaybetmek", "Yaşam & Saygı", "The legendary Olympic coach passed away peacefully last week.", "Efsanevi Olimpik antrenör geçen hafta huzur içinde vefat etti.", "His legacy did not pass away; it lives on in young athletes.", "Onun mirası yok olup gitmedi/ölmedi; genç sporcularda yaşamaya devam ediyor.", "When did the founder of modern sports science pass away?", "Modern spor biliminin kurucusu ne zaman vefat etti?"),
    ("throw away", "çöpe atmak, elden çıkarmak", "Çevre & İsraf", "Never throw away recyclable biometric sensor batteries into regular trash.", "Geri dönüştürülebilir biyometrik sensör pillerini asla normal çöpe atmayın.", "She didn't throw away her old grammar flashcards.", "Eski gramer flaş kartlarını çöpe atmadı.", "Why did you throw away the user manual for the tracking equipment?", "Takip ekipmanının kullanım kılavuzunu neden çöpe attın?"),
    ("drop out", "bırakmak, okuldan/yarıştan ayrılmak", "Eğitim & Yarışma", "He didn't drop out of the tournament despite a painful blister.", "Ağrılı bir su toplamasına rağmen turnuvadan ayrılmadı/bırakmadı.", "Diligent students rarely drop out of challenging academic courses.", "Çalışkan öğrenciler zorlu akademik dersleri nadiren bırakırlar.", "Why did the marathon runner drop out at the thirty-kilometer mark?", "Maraton koşucusu otuzuncu kilometrede yarışı neden bıraktı?"),
    ("fall apart", "dağılmak, parçalanmak, çökmek", "Yapı & Psikoloji", "Without mutual trust, a sports team's tactical structure falls apart.", "Karşılıklı güven olmadan bir spor takımının taktiksel yapısı dağılır.", "The athlete's mental composure didn't fall apart during tie-breaks.", "Tie-break anlarında sporcunun zihinsel soğukkanlılığı dağılmadı/çökmedi.", "Why did the old laboratory wooden prototype fall apart?", "Eski laboratuvar ahşap prototipi neden parçalandı/dağıldı?")
]

# Nouns (25)
NOUNS_DATA = [
    ("technology", "teknoloji", "Akademik & Bilişim", "Modern technology accelerates language acquisition through interactive tools.", "Modern teknoloji etkileşimli araçlar sayesinde dil edinimini hızlandırır.", "Traditional coaching didn't utilize digital tracking technology.", "Geleneksel antrenörlük dijital takip teknolojisini kullanmadı.", "How does virtual reality technology transform tactical learning?", "Sanal gerçeklik teknolojisi taktiksel öğrenmeyi nasıl dönüştürür?"),
    ("experiment", "deney", "Bilimsel & Araştırma", "The scientific experiment proved the positive effect of proper hydration.", "Bilimsel deney doğru sıvı alımının olumlu etkisini kanıtladı.", "She didn't finish the chemistry experiment before the bell rang.", "Zil çalmadan önce kimya deneyini bitirmedi.", "What was the primary hypothesis of your biomechanics experiment?", "Biyomekanik deneyinizin temel hipotezi neydi?"),
    ("equipment", "ekipman, donanım, araç-gereç", "Spor & Teknoloji", "The sports facility provides modern equipment for all academy athletes.", "Spor tesisi tüm akademi sporcuları için modern ekipman sağlar.", "We don't have enough specialized testing equipment for the whole team.", "Tüm takım için yeterli özel test ekipmanımız yok.", "Did the university purchase new photocell sprint equipment?", "Üniversite yeni fotosel depar ekipmanı satın aldı mı?"),
    ("opportunity", "fırsat, imkan", "Gelişim & Başarı", "Studying abroad provides a great opportunity to improve English fluency.", "Yurt dışında eğitim almak İngilizce akıcılığını geliştirmek için harika bir fırsat sunar.", "He didn't miss the opportunity to join the European sports camp.", "Avrupa spor kampına katılma fırsatını kaçırmadı.", "How can young students create their own career opportunities?", "Genç öğrenciler kendi kariyer fırsatlarını nasıl oluşturabilirler?"),
    ("decision", "karar", "Yönetim & Zihinsel", "The head coach made a strategic decision in the final quarter.", "Başantrenör son periyotta stratejik bir karar verdi.", "She didn't regret her decision to study sports science.", "Spor bilimleri okuma kararından pişmanlık duymadı.", "Who will make the final decision regarding tournament participation?", "Turnuva katılımıyla ilgili nihai kararı kim verecek?"),
    ("performance", "performans, verim", "Spor & Başarı", "Adequate sleep and nutrition maximize athletic performance.", "Yeterli uyku ve beslenme atletik performansı maksimize eder.", "The football squad didn't show satisfactory performance last week.", "Futbol takımı geçen hafta tatmin edici bir performans sergilemedi.", "How do analysts measure tactical performance during games?", "Analistler maçlar sırasında taktiksel performansı nasıl ölçerler?"),
    ("hypothesis", "hipotez, varsayım", "Bilimsel & Araştırma", "The research team formulated a clear hypothesis before testing.", "Araştırma ekibi testten önce net bir hipotez oluşturdu.", "The experimental data didn't support our initial hypothesis.", "Deneysel veriler ilk hipotezimizi desteklemedi.", "Can you explain your project hypothesis in simple terms?", "Proje hipotezinizi basit terimlerle açıklayabilir misiniz?"),
    ("strategy", "strateji, plan", "Yönetim & Taktik", "Our defense strategy prevented opponent counterattacks effectively.", "Savunma stratejimiz rakibin kontra ataklarını etkili bir şekilde engelledi.", "The club doesn't have a long-term youth development strategy.", "Kulübün uzun vadeli bir genç gelişim stratejisi yok.", "What is the best study strategy for mastering irregular verbs?", "Düzensiz fiillerde ustalaşmak için en iyi çalışma stratejisi nedir?"),
    ("achievement", "başarı, kazanım", "Gelişim & Ödül", "Winning the national trophy was a historic achievement for the school.", "Ulusal kupayı kazanmak okul için tarihi bir başarıydı.", "She didn't consider academic honors her sole achievement.", "Akademik başarıları tek kazanımı olarak görmedi.", "What is your greatest personal achievement in language learning?", "Dil öğrenimindeki en büyük kişisel başarınız nedir?"),
    ("habit", "alışkanlık", "Yaşam & Disiplin", "Daily vocabulary revision is the most powerful language habit.", "Günlük kelime tekrarı en güçlü dil alışkanlığıdır.", "He doesn't have the unhealthy habit of skipping breakfast.", "Kahvaltıyı atlamak gibi sağlıksız bir alışkanlığı yoktur.", "How long does it take to form a consistent study habit?", "Tutarlı bir çalışma alışkanlığı oluşturmak ne kadar sürer?"),
    ("discovery", "keşif, buluş", "Bilimsel & Tarih", "The discovery of penicillin revolutionized modern medicine.", "Penisilinin keşfi modern tıpta devrim yarattı.", "The archaeological team didn't make any new discovery today.", "Arkeoloji ekibi bugün yeni bir keşif yapmadı.", "Where did Ela make the unexpected discovery in the story?", "Ela hikayede beklenmedik keşfi nerede yaptı?"),
    ("environment", "çevre, ortam", "Yaşam & Bilim", "A positive learning environment motivates students to excel.", "Olumlu bir öğrenme ortamı öğrencileri mükemmelleşmeye motive eder.", "Loud music does not create a suitable environment for studying.", "Yüksek sesli müzik ders çalışmak için uygun bir ortam oluşturmaz.", "How can cities protect the natural environment from pollution?", "Şehirler doğal çevreyi kirlilikten nasıl koruyabilir?"),
    ("education", "eğitim, öğretim", "Akademik & Toplum", "Quality education opens doors to international career opportunities.", "Kaliteli eğitim uluslararası kariyer fırsatlarına kapı açar.", "She didn't finish her formal education until age twenty-four.", "Yirmi dört yaşına kadar resmi eğitimini bitirmedi.", "Which high school education program does your daughter prefer?", "Kızınız hangi lise eğitim programını tercih ediyor?"),
    ("knowledge", "bilgi, birikim", "Bilişsel & Zihinsel", "Knowledge of grammar rules gives students confidence in speaking.", "Gramer kuralları bilgisi öğrencilere konuşmada özgüven verir.", "He doesn't have sufficient knowledge of biomechanics software.", "Biyomekanik yazılımı hakkında yeterli bilgiye sahip değil.", "How do practical exercises deepen theoretical knowledge?", "Pratik egzersizler teorik bilgiyi nasıl derinleştirir?"),
    ("development", "gelişim, kalkınma, ilerleme", "Süreç & Büyüme", "Regular feedback accelerates the athletic development of players.", "Düzenli geri bildirim oyuncuların atletik gelişimini hızlandırır.", "The economic crisis didn't stop software development.", "Ekonomik kriz yazılım gelişimini durdurmadı.", "What factors influence child language development most?", "Çocuk dil gelişimini en çok hangi faktörler etkiler?"),
    ("challenge", "zorluk, meydan okuma, engel", "Süreç & Mücadele", "Learning advanced tenses was a tough challenge for beginners.", "İleri zamanları öğrenmek yeni başlayanlar için zorlu bir meydan okumaydı.", "She didn't shy away from any academic challenge.", "Hiçbir akademik zorluktan kaçınmadı.", "How do athletes overcome the challenge of intense training?", "Sporcular yoğun antrenmanın getirdiği zorluğun üstesinden nasıl gelirler?"),
    ("solution", "çözüm, çare", "Problem Çözme", "Smart algorithms provide an optimal solution for tracking latency.", "Akıllı algoritmalar takip gecikmesi için en uygun çözümü sunar.", "We haven't found a viable solution for the data synchronization issue.", "Veri senkronizasyonu sorunu için uygulanabilir bir çözüm bulamadık.", "Can you suggest an innovative solution for this grammatical puzzle?", "Bu dilbilgisi bulmacası için yenilikçi bir çözüm önerebilir misiniz?"),
    ("goal", "hedef, amaç, gol", "Başarı & Spor", "Setting clear weekly study goals increases learning productivity.", "Net haftalık çalışma hedefleri belirlemek öğrenme verimini artırır.", "The team didn't concede any goal in the championship match.", "Takım şampiyonluk maçında hiç gol yemedi.", "What is your primary goal in English for this semester?", "Bu dönem için İngilizcedeki temel hedefiniz nedir?"),
    ("result", "sonuç, netice", "Bilimsel & Değerlendirme", "The test result showed significant gains in explosive leg strength.", "Test sonucu patlayıcı bacak kuvvetinde belirgin kazanımlar gösterdi.", "He didn't receive the medical test result until this afternoon.", "Bu öğleden sonraya kadar tıbbi test sonucunu almadı.", "What was the final result of the regional robotics tournament?", "Bölgesel robotik turnuvasının nihai sonucu ne oldu?"),
    ("skill", "beceri, yetenek", "Gelişim & Uzmanlık", "Consistent practice turns basic vocabulary into fluent speaking skills.", "Tutarlı pratik temel kelimeleri akıcı konuşma becerilerine dönüştürür.", "He doesn't have the technical skill to operate the motion tracker.", "Hareket takip cihazını çalıştıracak teknik beceriye sahip değil.", "Which language skill is most difficult to master: reading or speaking?", "Hangi dil becerisinde ustalaşmak en zordur: okuma mı konuşma mı?"),
    ("purpose", "amaç, gaye", "Zihinsel & Niyet", "The main purpose of this study app is to make grammar effortless.", "Bu çalışma uygulamasının temel amacı grameri zahmetsiz kılmaktır.", "He didn't explain the purpose of his sudden visit.", "Ani ziyaretinin amacını açıklamadı.", "For what purpose do coaches collect biometric sensor data?", "Antrenörler hangi amaçla biyometrik sensör verisi toplarlar?"),
    ("method", "yöntem, metot", "Bilimsel & Öğrenme", "The SVOMPT sentence method simplifies English sentence construction.", "SVOMPT cümle yöntemi İngilizce cümle kurmayı basitleştirir.", "The traditional teaching method didn't encourage active speaking.", "Geleneksel öğretim yöntemi aktif konuşmayı teşvik etmedi.", "Which measurement method is most accurate for sprint timing?", "Depar zamanlaması için hangi ölçüm yöntemi en doğrudur?"),
    ("evidence", "kanıt, delil", "Bilimsel & Hukuk", "Scientific evidence demonstrates that daily revision builds long-term memory.", "Bilimsel kanıtlar günlük tekrarın uzun vadeli hafıza inşa ettiğini gösterir.", "The analyst didn't find any evidence of referee bias.", "Analist hakem yanlılığına dair hiçbir kanıt bulamadı.", "What evidence supports your hypothesis on athletic load?", "Atletik yük hakkındaki hipotezinizi hangi kanıtlar destekliyor?"),
    ("progress", "ilerleme, gelişim", "Süreç & Başarı", "Ela made steady progress in her English grammar comprehension.", "Ela İngilizce gramer kavrayışında istikrarlı bir ilerleme kaydetti.", "The construction work didn't show any progress this month.", "İnşaat çalışması bu ay hiçbir ilerleme göstermedi.", "How do you track your daily vocabulary progress in the app?", "Uygulamada günlük kelime ilerlemenizi nasıl takip ediyorsunuz?"),
    ("community", "topluluk, camia", "Sosyal & Toplum", "Our sports science community shares innovative research findings openly.", "Spor bilimleri topluluğumuz yenilikçi araştırma bulgularını açıkça paylaşır.", "He didn't feel isolated because the student community was welcoming.", "Öğrenci topluluğu sıcak olduğu için kendini yalnız hissetmedi.", "How does this app foster a supportive learning community?", "Bu uygulama destekleyici bir öğrenme topluluğunu nasıl teşvik ediyor?")
]

# Adverbs (20)
ADVERBS_DATA = [
    ("quickly", "hızlıca, çabucak", "Durum Zarfı (Manner)", "Athletes must react quickly to visual cues.", "Sporcular görsel işaretlere hızlıca tepki vermelidir.", "He didn't run quickly enough to win the sprint.", "Deparı kazanmak için yeterince hızlıca koşmadı.", "Why did you drive so quickly on the wet road?", "Islak yolda neden bu kadar hızlıca araba sürdün?"),
    ("carefully", "dikkatlice, özenle", "Durum Zarfı (Manner)", "She read the test instructions carefully.", "Sınav talimatlarını dikkatlice okudu.", "He didn't handle the delicate sensor carefully.", "Hassas sensörü dikkatlice tutmadı/kullanmadı.", "Did you check the biometric calibration carefully?", "Biyometrik kalibrasyonu dikkatlice kontrol ettin mi?"),
    ("fluently", "akıcı bir şekilde", "Durum Zarfı (Manner)", "Our mentor speaks English and German fluently.", "Danışmanımız İngilizce ve Almanca'yı akıcı bir şekilde konuşur.", "She couldn't express her ideas fluently yesterday.", "Dün fikirlerini akıcı bir şekilde ifade edemedi.", "How long did it take you to speak English fluently?", "İngilizceyi akıcı bir şekilde konuşman ne kadar sürdü?"),
    ("easily", "kolayca, rahatlıkla", "Durum Zarfı (Manner)", "He solved the physics problem easily.", "Fizik problemini kolayca çözdü.", "You cannot pass this advanced exam easily without practice.", "Pratik yapmadan bu ileri düzey sınavı kolayca geçemezsiniz.", "Can smart algorithms detect movement patterns easily?", "Akıllı algoritmalar hareket kalıplarını kolayca tespit edebilir mi?"),
    ("safely", "güvenle, emniyetli bir şekilde", "Durum Zarfı (Manner)", "The team arrived safely at the training facility.", "Takım antrenman tesisine güvenle vardı.", "They didn't store the sports equipment safely.", "Spor ekipmanlarını güvenli bir şekilde saklamadılar.", "Did your daughter land safely after the high jump?", "Kızın yüksek atlayıştan sonra güvenle yere indi mi?"),
    ("successfully", "başarıyla", "Durum Zarfı (Manner)", "We completed the scientific project successfully.", "Bilimsel projeyi başarıyla tamamladık.", "He didn't finish the agility trial successfully.", "Çeviklik denemesini başarıyla bitiremedi.", "Did the robotics team perform successfully in Switzerland?", "Robotik takımı İsviçre'de başarıyla performans gösterdi mi?"),
    ("clearly", "açıkça, net bir şekilde", "Durum Zarfı (Manner)", "The professor explained the grammar rules clearly.", "Profesör gramer kurallarını açıkça/net bir şekilde açıkladı.", "He didn't state his tactical hypothesis clearly.", "Taktiksel hipotezini net bir şekilde belirtmedi.", "Can you see the projected data clearly from your seat?", "Yansıtılan verileri oturduğun yerden net bir şekilde görebiliyor musun?"),
    ("properly", "düzgünce, gereğince", "Durum Zarfı (Manner)", "Athletes should stretch properly after each workout.", "Sporcular her antrenmandan sonra düzgünce esnemelidir.", "The software wasn't installed properly on the workstation.", "Yazılım iş istasyonuna düzgünce kurulmamıştı.", "Did you calibrate the force plate properly this morning?", "Kuvvet platformunu bu sabah düzgünce kalibre ettin mi?"),
    ("always", "her zaman, daima", "Sıklık Zarfı (Frequency)", "She always reviews her vocabulary notes before sleeping.", "Uyumadan önce her zaman kelime notlarını tekrar eder.", "He doesn't always agree with the referee's decisions.", "Hakemin kararlarına her zaman katılmaz.", "Do you always wake up at six o'clock for conditioning?", "Kondisyon için her zaman saat altıda mı uyanırsın?"),
    ("usually", "genellikle, çoğunlukla", "Sıklık Zarfı (Frequency)", "We usually train on artificial turf pitches on Tuesdays.", "Salı günleri genellikle yapay çim sahalarda antrenman yaparız.", "They don't usually eat heavy meals before matches.", "Maçlardan önce genellikle ağır yemekler yemezler.", "What do you usually do during the half-time break?", "Devre arası molasında genellikle ne yaparsın?"),
    ("often", "sık sık", "Sıklık Zarfı (Frequency)", "Young players often practice penalty shots after training.", "Genç oyuncular antrenmandan sonra sık sık penaltı atışı çalışırlar.", "He doesn't often participate in social media discussions.", "Sosyal medya tartışmalarına sık sık katılmaz.", "How often do you measure your resting heart rate?", "Dinlenik kalp atış hızınızı ne sıklıkla ölçersiniz?"),
    ("sometimes", "bazen, ara sıra", "Sıklık Zarfı (Frequency)", "Sensors sometimes produce minor wireless errors.", "Sensörler bazen küçük kablosuz hataları üretir.", "She doesn't sometimes feel tired; she is always energetic.", "Bazen yorgun hissetmez; her zaman enerjiktir.", "Do you sometimes study grammar during the weekend?", "Hafta sonu bazen gramer çalışır mısın?"),
    ("rarely", "nadiren", "Sıklık Zarfı (Frequency)", "He rarely misses a morning conditioning session.", "Sabah kondisyon seansını nadiren kaçırır.", "We rarely see such explosive jumping power in youth leagues.", "Genç liglerde nadiren bu kadar patlayıcı sıçrama gücü görürüz.", "Why do researchers rarely use uncalibrated instruments?", "Araştırmacılar neden kalibre edilmemiş aletleri nadiren kullanırlar?"),
    ("never", "asla, hiçbir zaman", "Sıklık Zarfı (Frequency)", "Disciplined athletes never give up during difficult matches.", "Disiplinli sporcular zorlu maçlarda asla pes etmezler.", "She never arrives late to academic seminars.", "Akademik seminerlere hiçbir zaman geç kalmaz.", "Have you never seen a professional VR sports simulation?", "Hiç profesyonel bir VR spor simülasyonu görmedin mi?"),
    ("definitely", "kesinlikle, mutlaka", "Kesinlik Zarfı (Certainty)", "This innovative training method will definitely improve sprint speed.", "Bu yenilikçi antrenman yöntemi kesinlikle depar hızını artıracaktır.", "He definitely didn't violate the anti-doping regulations.", "Kesinlikle anti-doping kurallarını ihlal etmedi.", "Will you definitely attend the European sports conference?", "Avrupa spor konferansına kesinlikle katılacak mısın?"),
    ("probably", "muhtemelen", "Olasılık Zarfı (Probability)", "The head coach will probably announce the squad tomorrow.", "Başantrenör muhtemelen kadroyu yarın açıklayacak.", "They probably won't travel by bus due to bad weather.", "Kötü hava nedeniyle muhtemelen otobüsle seyahat etmeyecekler.", "Where will the national team probably stay during the tournament?", "Milli takım turnuva sırasında muhtemelen nerede kalacak?"),
    ("currently", "şu anda, mevcut durumda", "Zaman Zarfı (Time)", "The engineers are currently developing a new VR tracking algorithm.", "Mühendisler şu anda yeni bir VR takip algoritması geliştiriyorlar.", "She isn't currently working on her master's thesis.", "Şu anda yüksek lisans tezi üzerinde çalışmıyor.", "Which software version are you currently using?", "Şu anda hangi yazılım sürümünü kullanıyorsunuz?"),
    ("recently", "son zamanlarda, geçenlerde", "Zaman Zarfı (Time)", "The university has recently opened a high-tech biomechanics lab.", "Üniversite son zamanlarda yüksek teknolojili bir biyomekanik laboratuvarı açtı.", "He hasn't performed well recently due to a minor ankle strain.", "Hafif ayak bileği burkulması nedeniyle son zamanlarda iyi performans göstermedi.", "Have you read any interesting research papers recently?", "Son zamanlarda hiç ilginç araştırma makalesi okudun mu?"),
    ("immediately", "derhal, hemen", "Zaman Zarfı (Time)", "Athletes must stop training immediately if they feel sharp pain.", "Sporcular keskin bir ağrı hissederlerse derhal antrenmanı durdurmalıdır.", "The emergency response team didn't arrive immediately.", "Acil müdahale ekibi hemen varmadı.", "Can you send the sprint analysis data immediately?", "Depar analiz verilerini hemen gönderebilir misin?"),
    ("extremely", "son derece, aşırı derecede", "Derece Zarfı (Degree)", "The championship final match was extremely exciting.", "Şampiyona final maçı son derece heyecanlıydı.", "The weather wasn't extremely cold during the winter camp.", "Kış kampı sırasında hava aşırı derecede soğuk değildi.", "Why is this mathematical formula extremely difficult to solve?", "Bu matematiksel formülü çözmek neden son derece zor?")
]

# Conjunctions (15)
CONJUNCTIONS_DATA = [
    ("because", "çünkü, -dığı için", "Sebep-Sonuç (Cause & Effect)", "Ela studied grammar every day because she wanted to excel in English.", "Ela her gün gramer çalıştı çünkü İngilizcede mükemmelleşmek istiyordu.", "He didn't play in the match because he had a high fever.", "Yüksek ateşi olduğu için maçta oynamadı.", "Did they cancel the outdoor training session because of heavy rain?", "Şiddetli yağmur nedeniyle açık hava antrenmanını iptal ettiler mi?"),
    ("although", "rağmen, -e karşın", "Zıtlık Bağlacı (Contrast)", "Although the match was very tough, our team won the trophy.", "Maç çok zorlu olmasına rağmen, takımımız kupayı kazandı.", "Although he didn't practice all week, he performed well.", "Tüm hafta antrenman yapmamasına rağmen, iyi performans sergiledi.", "Why was he exhausted although he slept eight full hours?", "Sekiz tam saat uyumasına rağmen neden bitkindi?"),
    ("even though", "olsa bile, -e rağmen", "Güçlü Zıtlık (Strong Contrast)", "Even though the sensor was old, it provided accurate telemetry.", "Sensör eski olsa bile doğru telemetri sağladı.", "Even though she didn't feel confident, she answered all questions.", "Kendine güvenmese bile tüm soruları cevapladı.", "Did the team continue the sprint drills even though it started snowing?", "Kar yağmaya başlamasına rağmen takım depar egzersizlerine devam etti mi?"),
    ("however", "ancak, yine de, oysa", "Geçiş Bağlacı (Transition)", "We had planned outdoor testing; however, the storm forced us inside.", "Açık hava testi planlamıştık; ancak fırtına bizi içeri girmeye zorladı.", "He trained very hard; however, he didn't win the championship.", "Çok sıkı çalıştı; ancak şampiyonluğu kazanamadı.", "Is the software user-friendly? However, does it meet all safety standards?", "Yazılım kullanıcı dostu mu? Yine de tüm güvenlik standartlarını karşılıyor mu?"),
    ("therefore", "bu nedenle, bu yüzden, dolayısıyla", "Sonuç Bağlacı (Result)", "He scored highest in the mock exam; therefore, he received a scholarship.", "Deneme sınavında en yüksek puanı aldı; bu nedenle burs kazandı.", "The server crashed; therefore, we couldn't access the database.", "Sunucu çöktü; bu yüzden veritabanına erişemedik.", "Did you finish the literature review; therefore, can you start drafting the paper?", "Literatür taramasını bitirdin mi; dolayısıyla makaleyi yazmaya başlayabilir misin?"),
    ("so that", "-sın diye, amacıyla", "Amaç Bağlacı (Purpose)", "He bought a high-speed camera so that he could analyze sprint kinetics.", "Depar kinetiğini analiz edebilsin diye yüksek hızlı bir kamera satın aldı.", "She took detailed notes so that she wouldn't forget the formulas.", "Formülleri unutmasın diye detaylı notlar aldı.", "Why did you speak slowly so that international students could understand?", "Uluslararası öğrenciler anlayabilsin diye neden yavaş konuştun?"),
    ("in order to", "-mek için, amacıyla", "Amaç Kalıbı (Purpose Infinitive)", "Athletes do warm-up drills in order to prevent hamstring strains.", "Sporcular arka adale zorlanmalarını önlemek için ısınma hareketleri yaparlar.", "You shouldn't take risky shortcuts in order to finish early.", "Erken bitirmek için riskli kestirmelere başvurmamalısınız.", "What exercises do you perform in order to maximize vertical jump power?", "Dikey sıçrama gücünü maksimize etmek için hangi egzersizleri yapıyorsunuz?"),
    ("while", "iken, o sırada, oysa", "Zaman & Zıtlık (Time & Contrast)", "While the coach was explaining tactics, the players listened attentively.", "Antrenör taktikleri açıklarken oyuncular dikkatle dinlediler.", "He didn't look at his phone while he was solving math equations.", "Matematik denklemlerini çözerken telefonuna bakmadı.", "What were you doing while the experiment was running in the lab?", "Deney laboratuvarda çalışırken sen ne yapıyordun?"),
    ("since", "-den beri, -dığı için", "Zaman & Sebep (Time & Cause)", "Since we have enough sensor data, we can start the machine learning training.", "Yeterli sensör verimiz olduğu için makine öğrenmesi eğitimine başlayabiliriz.", "He hasn't visited the medical clinic since he recovered from the injury.", "Sakatlıktan kurtulduğundan beri sağlık kliniğini ziyaret etmedi.", "Have you spoken with the project supervisor since yesterday morning?", "Dün sabahtan beri proje danışmanıyla konuştun mu?"),
    ("unless", "-medikçe, -mezse (if not)", "Koşul Bağlacı (Condition)", "You cannot achieve peak performance unless you maintain consistent sleep habits.", "Tutarlı uyku alışkanlıklarını sürdürmedikçe zirve performansı elde edemezsiniz.", "We won't start the testing unless all optical photocell gates are ready.", "Tüm optik fotosel kapıları hazır olmadıkça teste başlamayacağız.", "Can a player join the competitive squad unless she passes the medical screening?", "Sağlık taramasından geçmedikçe bir oyuncu müsabaka kadrosuna katılabilir mi?"),
    ("as soon as", "yapar yapmaz, -er -mez", "Zaman Bağlacı (Time)", "We will send the test report as soon as the data analysis is complete.", "Veri analizi tamamlanır tamamlanmaz test raporunu göndereceğiz.", "Don't disconnect the charging cable as soon as the red LED flashes.", "Kırmızı LED yanıp söner sönmez şarj kablosunu çıkarmayın.", "Did your daughter call you as soon as she arrived in Eskişehir?", "Kızın Eskişehir'e varır varmaz seni aradı mı?"),
    ("whereas", "oysa, halbuki, buna karşın", "Doğrudan Zıtlık (Direct Contrast)", "Volleyball requires vertical jumping, whereas soccer demands aerobic endurance.", "Voleybol dikey sıçrama gerektirir, oysa futbol aerobik dayanıklılık ister.", "He prefers morning workouts, whereas his teammate doesn't like early training.", "O sabah antrenmanlarını tercih eder, oysa takım arkadaşı erken antrenmanı sevmez.", "Why do you study math, whereas your sister studies foreign literature?", "Kız kardeşin yabancı edebiyat çalışırken sen neden matematik çalışıyorsun?"),
    ("as well as", "yanı sıra, ek olarak", "Ek Bağlacı (Addition)", "Ela learns Spanish as well as English at school.", "Ela okulda İngilizcenin yanı sıra İspanyolca da öğreniyor.", "The diet plan includes vitamins as well as essential minerals.", "Diyet planı temel minerallerin yanı sıra vitaminleri de içerir.", "Can the device measure acceleration as well as angular velocity?", "Cihaz açısal hızın yanı sıra ivmeyi de ölçebilir mi?"),
    ("not only... but also", "sadece ... değil, aynı zamanda ...", "Vurgulu Ek (Correlative)", "He is not only a great athlete but also a dedicated scientist.", "O sadece harika bir sporcu değil, aynı zamanda özverili bir bilim insanıdır.", "She didn't not only solve the puzzle, but also broke the school record.", "Sadece bulmacayı çözmekle kalmadı, aynı zamanda okul rekorunu da kırdı.", "Did your team not only win the game but also earn the fair-play award?", "Takımınız sadece maçı kazanmakla kalmayıp centilmenlik ödülünü de kazandı mı?"),
    ("either... or", "ya ... ya da ...", "Seçenek Bağlacı (Alternative)", "You can either choose morning practice or join the evening session.", "Ya sabah antrenmanını seçebilir ya da akşam seansına katılabilirsiniz.", "We cannot either accept late submissions or excuse unapproved absences.", "Ne geç teslimleri kabul edebiliriz ne de izinsiz devamsızlıkları mazur görebiliriz.", "Will you either study for the LGS exam or practice English today?", "Bugün ya LGS sınavına mı çalışacaksın yoksa İngilizce pratiği mi yapacaksın?")
]

# Prepositions (10)
PREPOSITIONS_DATA = [
    ("in", "içinde, -de/-da", "Yer & Zaman Edatı (Place & Time)", "Students are studying quietly in the campus library.", "Öğrenciler kampüs kütüphanesinde sessizce ders çalışıyorlar.", "He wasn't in the locker room when the coach gave the team talk.", "Antrenör takım konuşmasını yaparken soyunma odasında değildi.", "Will the international tournament take place in June?", "Uluslararası turnuva haziran ayında mı gerçekleşecek?"),
    ("on", "üzerinde, -de/-da (günler/yüzeyler)", "Yer & Zaman Edatı (Place & Time)", "Please place the biometric sensor on the athlete's right shoe.", "Lütfen biyometrik sensörü sporcunun sağ ayakkabısının üzerine yerleştirin.", "We don't have tactical training sessions on Sunday mornings.", "Pazar sabahları taktik antrenman seanslarımız yok.", "Did you see the latest research notes on the digital whiteboard?", "Dijital beyaz tahtadaki son araştırma notlarını gördün mü?"),
    ("at", "-de/-da (nokta/saat)", "Yer & Zaman Edatı (Place & Time)", "The conditioning session starts at eight o'clock sharp.", "Kondisyon seansı tam saat sekizde başlıyor.", "She wasn't at the laboratory when the electricity failed.", "Elektrik kesildiğinde laboratuvarda değildi.", "Where were you at the beginning of the tactical meeting?", "Taktik toplantısının başında neredeydin?"),
    ("between", "arasında (iki şey/kişi)", "Yer & Konum Edatı (Place & Location)", "The photocell timing gate is placed between the two cones.", "Fotosel zamanlama kapısı iki koni arasına yerleştirilmiştir.", "There isn't any significant difference between the two test groups.", "İki test grubu arasında belirgin bir fark yoktur.", "What is the optimal rest interval between high-intensity sprints?", "Yüksek yoğunluklu deparlar arasındaki en uygun dinlenme aralığı nedir?"),
    ("throughout", "boyunca, her yerinde", "Zaman & Kapsam Edatı (Time & Extent)", "Athletes must stay well-hydrated throughout the hot summer match.", "Sporcular sıcak yaz maçı boyunca vücut sıvılarını iyi korumalıdır.", "He didn't lose his concentration throughout the entire examination.", "Tüm sınav boyunca konsantrasyonunu kaybetmedi.", "Did you monitor player heart rates throughout the four quarters?", "Dört periyot boyunca oyuncuların kalp atış hızlarını takip ettiniz mi?"),
    ("during", "sırasında, esnasında", "Zaman Edatı (Time)", "Please remain silent during the technical presentation.", "Teknik sunum sırasında lütfen sessiz kalın.", "She didn't use her mobile phone during the science experiment.", "Fen deneyi sırasında cep telefonunu kullanmadı.", "What kind of electrolyte drink do runners consume during a marathon?", "Koşucular maraton sırasında ne tür elektrolit içeceği tüketirler?"),
    ("according to", "-e göre (kaynak/kural)", "Referans Edatı (Reference)", "According to the latest sports science research, sleep optimizes muscle recovery.", "Son spor bilimi araştırmalarına göre, uyku kas toparlanmasını optimize eder.", "According to the club rules, players cannot skip morning training.", "Kulüp kurallarına göre, oyuncular sabah antrenmanını atlayamazlar.", "According to the professor's notes, which formula calculates athletic load?", "Profesörün notlarına göre, hangi formül atletik yükü hesaplar?"),
    ("despite", "-e rağmen, karşın", "Zıtlık Edatı (Contrast Preposition)", "The team won the championship match despite severe injury problems.", "Takım ciddi sakatlık problemlerine rağmen şampiyonluk maçını kazandı.", "He didn't lose his positive attitude despite failing the initial test.", "İlk testi geçememesine rağmen olumlu tutumunu kaybetmedi.", "Did Ela finish the entire 10-chapter story despite her busy schedule?", "Ela yoğun programına rağmen 10 bölümlük hikayenin tamamını bitirdi mi?"),
    ("without", "-sız, -siz, olmadan", "Durum Edatı (Condition Preposition)", "You cannot achieve foreign language fluency without daily practice.", "Günlük pratik olmadan yabancı dil akıcılığına ulaşamazsınız.", "He didn't enter the clean testing room without wearing protective covers.", "Koruyucu galoş takmadan temiz test odasına girmedi.", "Can the VR simulator run without high-speed wireless connection?", "VR simülatörü yüksek hızlı kablosuz bağlantı olmadan çalışabilir mi?"),
    ("towards", "-e doğru (yön)", "Yön & Hareket Edatı (Direction)", "The striker is running fast towards the opponent's goal.", "Forvet rakibin kalesine doğru hızlıca koşuyor.", "The company didn't take any active steps towards environmental sustainability.", "Şirket çevresel sürdürülebilirliğe doğru hiçbir aktif adım atmadı.", "Why was the team bus moving slowly towards the stadium entrance?", "Takım otobüsü stadyum girişine doğru neden yavaş hareket ediyordu?")
]

# Adjectives (10)
ADJECTIVES_DATA = [
    ("essential", "gerekli, hayati, temel", "Nitelik Sıfatı (Quality)", "Regular sleep is essential for optimal cognitive and physical recovery.", "Düzenli uyku, en uygun bilişsel ve fiziksel toparlanma için gereklidir/hayatidir.", "Expensive sports gear is not essential for learning English vocabulary.", "İngilizce kelime öğrenmek için pahalı spor ekipmanları şart/gerekli değildir.", "Which grammatical concepts are essential for the upcoming scholarship exam?", "Yaklaşan burs sınavı için hangi dilbilgisi kavramları hayati/gereklidir?"),
    ("crucial", "son derece önemli, kritik", "Değerlendirme Sıfatı (Evaluation)", "Proper hydration plays a crucial role during endurance events.", "Doğru sıvı alımı dayanıklılık etkinlikleri sırasında son derece önemli bir rol oynar.", "This minor parameter is not crucial for the overall research conclusion.", "Bu küçük parametre genel araştırma sonucu için kritik değildir.", "Why is daily sentence building crucial for language mastery?", "Dil ustalığı için günlük cümle kurma neden son derece önemlidir?"),
    ("disciplined", "disiplinli, düzenli", "Kişilik & Alışkanlık (Personality)", "Disciplined athletes follow their conditioning timetable strictly.", "Disiplinli sporcular kondisyon çizelgelerine sıkı sıkıya uyarlar.", "He wasn't disciplined enough to wake up at dawn every single morning.", "Her sabah şafakta uyanacak kadar disiplinli değildi.", "How can students become more disciplined in their daily study routines?", "Öğrenciler günlük çalışma rutinlerinde nasıl daha disiplinli olabilirler?"),
    ("innovative", "yenilikçi, inovatif", "Nitelik Sıfatı (Quality)", "The university developed an innovative VR sports training headset.", "Üniversite yenilikçi bir VR spor antrenman başlığı geliştirdi.", "The old textbook didn't use any innovative interactive teaching methods.", "Eski ders kitabı hiçbir yenilikçi etkileşimli öğretim yöntemi kullanmadı.", "What makes this Turkish English sentence builder app so innovative?", "Bu Türkçe İngilizce cümle kurucu uygulamasını bu kadar yenilikçi yapan nedir?"),
    ("flexible", "esnek, uyumlu", "Fiziksel & Nitelik (Physical & Trait)", "Gymnasts must have extremely flexible joints and strong muscles.", "Jimnastikçiler son derece esnek eklemlere ve güçlü kaslara sahip olmalıdır.", "The project schedule wasn't flexible during the final sprint phase.", "Final depar aşamasında proje takvimi esnek değildi.", "Is your daily study plan flexible enough to handle unexpected tasks?", "Günlük çalışma planınız beklenmedik görevleri kaldıracak kadar esnek mi?"),
    ("accurate", "doğru, kesin, hatasız", "Ölçüm & Bilimsel (Precision)", "The dual-beam photocell gates provide accurate timing data.", "Çift ışınlı fotosel kapıları doğru/kesin zamanlama verisi sağlar.", "This simple stopwatch doesn't give accurate millisecond readings.", "Bu basit kronometre doğru milisaniye okumaları vermez.", "How accurate is the heart rate monitor during high-intensity workouts?", "Yüksek yoğunluklu antrenmanlar sırasında nabız monitörü ne kadar doğrudur?"),
    ("significant", "önemli, belirgin, anlamlı", "İstatistik & Değerlendirme", "The research showed a significant improvement in reaction speed.", "Araştırma, tepki hızında belirgin/önemli bir gelişme gösterdi.", "There wasn't any significant difference between pre-test and post-test scores.", "Ön test ve son test puanları arasında belirgin bir fark yoktu.", "Did your team achieve significant progress in English grammar this week?", "Takımınız bu hafta İngilizce gramerde önemli bir ilerleme kaydetti mi?"),
    ("sustainable", "sürdürülebilir, çevre dostu", "Gelişim & Çevre (Sustainability)", "Athletes need sustainable training loads to avoid chronic fatigue.", "Sporcular kronik yorgunluktan kaçınmak için sürdürülebilir antrenman yüklerine ihtiyaç duyarlar.", "Unbalanced crash diets are not sustainable for long-term athletic health.", "Dengesiz şok diyetler uzun vadeli atletik sağlık için sürdürülebilir değildir.", "How can universities build a sustainable scientific research ecosystem?", "Üniversiteler nasıl sürdürülebilir bir bilimsel araştırma ekosistemi kurabilirler?"),
    ("confident", "özgüvenli, kendinden emin", "Duygusal & Kişilik (Emotional)", "Ela felt confident before stepping onto the stage for her presentation.", "Ela sunumu için sahneye çıkmadan önce kendinden emin/özgüvenli hissetti.", "He wasn't confident in his speaking skills until he practiced with the app.", "Uygulamayla pratik yapana kadar konuşma becerilerine güvenmiyordu.", "Why are young athletes so confident before championship finals?", "Genç sporcular şampiyona finallerinden önce neden bu kadar özgüvenlidir?"),
    ("curious", "meraklı, araştırmacı", "Zihinsel & Kişilik (Cognitive)", "Curious students ask thought-provoking questions in science lectures.", "Meraklı öğrenciler fen derslerinde düşündürücü sorular sorarlar.", "He wasn't curious about foreign cultures until he traveled abroad.", "Yurt dışına seyahat edene kadar yabancı kültürleri merak etmiyordu.", "What makes young children so naturally curious about foreign languages?", "Küçük çocukları yabancı dillere karşı doğal olarak bu kadar meraklı kılan nedir?")
]

# Idioms (10)
IDIOMS_DATA = [
    ("in my opinion", "bence, benim fikrime göre", "Fikir Belirtme (Opinion)", "In my opinion, interactive flashcards accelerate vocabulary memorization.", "Bence/benim fikrime göre, etkileşimli flaş kartlar kelime ezberlemeyi hızlandırır.", "In my opinion, this simple test is not difficult for prepared students.", "Bence bu basit test hazırlıklı öğrenciler için zor değildir.", "In your opinion, which grammar tense is most challenging to learn?", "Sizin fikrinize göre, öğrenmesi en zor olan gramer zamanı hangisidir?"),
    ("as a matter of fact", "aslına bakarsan, doğrusunu söylemek gerekirse", "Vurgu & Gerçek", "As a matter of fact, she completed all ten chapters in three days.", "Aslına bakarsan, on bölümün tamamını üç günde bitirdi.", "As a matter of fact, we don't need expensive equipment to study.", "Doğrusunu söylemek gerekirse, çalışmak için pahalı ekipmanlara ihtiyacımız yok.", "As a matter of fact, did you know that irregular verbs follow hidden patterns?", "Aslına bakarsan, düzensiz fiillerin gizli kalıplar izlediğini biliyor muydun?"),
    ("take part in", "yer almak, katılmak, iştirak etmek", "Katılım & Sosyal", "Students love to take part in international robotics competitions.", "Öğrenciler uluslararası robotik yarışmalarında yer almayı/katılmayı çok severler.", "He didn't take part in the symposium due to a flight delay.", "Uçuş gecikmesi nedeniyle sempozyumda yer almadı.", "Will your daughter take part in the upcoming science fair?", "Kızınız yaklaşan bilim fuarında yer alacak mı?"),
    ("pay attention to", "dikkat etmek, özen göstermek", "Dikkat & Odak", "You must pay attention to the SVOMPT word order rule.", "SVOMPT kelime dizilimi kuralına dikkat etmelisiniz.", "He didn't pay attention to the coach's tactical instructions.", "Antrenörün taktik talimatlarına dikkat etmedi.", "Why should language learners pay attention to natural pronunciation?", "Dil öğrenenler neden doğal telaffuza dikkat etmelidir?"),
    ("make a decision", "karar vermek", "Karar & Eylem", "The committee will make a decision on the research grant tomorrow.", "Komite araştırma hibesi konusunda yarın karar verecek.", "She didn't make a hasty decision before reviewing all test scores.", "Tüm test puanlarını incelemeden önce aceleci bir karar vermedi.", "When will the school principal make a decision about the holiday?", "Okul müdürü tatil hakkında ne zaman karar verecek?"),
    ("have an impact on", "üzerinde etki yaratmak, etkilemek", "Etki & Sonuç", "Quality sleep has a direct impact on athletic recovery and memory.", "Kaliteli uyku, atletik toparlanma ve hafıza üzerinde doğrudan bir etkiye sahiptir.", "This small parameter change doesn't have an impact on the final result.", "Bu küçük parametre değişikliği nihai sonuç üzerinde bir etki yaratmaz.", "How does daily sentence practice have an impact on speaking fluency?", "Günlük cümle pratiği konuşma akıcılığı üzerinde nasıl bir etki yaratır?"),
    ("on the other hand", "diğer taraftan, öte yandan", "Zıtlık & Karşılaştırma", "Running builds endurance; on the other hand, sprinting develops explosive power.", "Koşu dayanıklılık inşa eder; öte yandan depar patlayıcı güç geliştirir.", "He wants to travel; on the other hand, he doesn't want to spend his savings.", "Seyahat etmek istiyor; öte yandan birikimlerini harcamak istemiyor.", "On the other hand, is virtual reality truly effective for tactical learning?", "Öte yandan, sanal gerçeklik taktiksel öğrenme için gerçekten etkili midir?"),
    ("in the long run", "uzun vadede, uzun dönemde", "Zaman & Gelecek", "Consistent daily discipline always pays off in the long run.", "Tutarlı günlük disiplin uzun vadede her zaman karşılığını verir.", "Skipping warm-up drills won't help you in the long run.", "Isınma hareketlerini atlamak uzun vadede size yardımcı olmayacaktır.", "Will learning English grammar open global doors in the long run?", "İngilizce gramer öğrenmek uzun vadede küresel kapılar açacak mı?"),
    ("step by step", "adım adım, aşama aşama", "Süreç & Yöntem", "The 4-step learning routine guides students step by step to success.", "4 aşamalı ders rutini öğrencileri başarıya adım adım yönlendirir.", "You cannot master advanced conditionals without progressing step by step.", "Adım adım ilerlemeden ileri düzey şart cümlelerinde ustalaşamazsınız.", "Can you explain the calibration procedure step by step?", "Kalibrasyon prosedürünü adım adım açıklayabilir misiniz?"),
    ("from time to time", "zaman zaman, ara sıra", "Zaman & Sıklık", "Even elite athletes need complete rest periods from time to time.", "Seçkin sporcular bile zaman zaman tam dinlenme dönemlerine ihtiyaç duyarlar.", "She doesn't review old chapters from time to time; she reviews them daily.", "Eski bölümleri ara sıra tekrar etmez; onları her gün tekrar eder.", "Do you visit the university sports library from time to time?", "Üniversite spor kütüphanesini zaman zaman ziyaret eder misiniz?")
]

def build_master_encyclopedia():
    existing_json = "/Users/alionurcerrah/Desktop/İngilizce Kelime/data/curriculum.json"
    with open(existing_json, "r", encoding="utf-8") as f:
        data = json.load(f)

    all_items = []
    global_id = 1

    # 1. 80 A2 Verbs
    for num, verb_en, verb_tr, pos_en, pos_tr, neg_en, neg_tr, que_en, que_tr in A2_VERBS_RAW:
        v1, v2, v3 = get_forms(verb_en)
        all_items.append({
            "id": global_id,
            "original_id": num,
            "unique_id": f"A2_VERB_{num}",
            "type": "verb",
            "type_label": "Fiil (Verb)",
            "type_icon": "🔵",
            "word": verb_en,
            "meaning": verb_tr,
            "level": "A2",
            "level_label": "A2 Seviyesi (Temel)",
            "category": "Temel Eylem & Rutin",
            "forms": {"v1": v1, "v2": v2, "v3": v3},
            "detail_label": f"V1: {v1} • V2: {v2} • V3: {v3}",
            "sentences": {
                "positive": {"en": pos_en, "tr": pos_tr},
                "negative": {"en": neg_en, "tr": neg_tr},
                "question": {"en": que_en, "tr": que_tr}
            }
        })
        global_id += 1

    # 2. 78 B1 Verbs
    for num, verb_en, verb_tr, pos_en, pos_tr, neg_en, neg_tr, que_en, que_tr in B1_VERBS_RAW:
        v1, v2, v3 = get_forms(verb_en)
        all_items.append({
            "id": global_id,
            "original_id": num,
            "unique_id": f"B1_VERB_{num}",
            "type": "verb",
            "type_label": "Fiil (Verb)",
            "type_icon": "🔵",
            "word": verb_en,
            "meaning": verb_tr,
            "level": "B1",
            "level_label": "B1 Seviyesi (İleri)",
            "category": "Akademik & İleri Eylem",
            "forms": {"v1": v1, "v2": v2, "v3": v3},
            "detail_label": f"V1: {v1} • V2: {v2} • V3: {v3}",
            "sentences": {
                "positive": {"en": pos_en, "tr": pos_tr},
                "negative": {"en": neg_en, "tr": neg_tr},
                "question": {"en": que_en, "tr": que_tr}
            }
        })
        global_id += 1

    # 3. 60 Phrasal Verbs
    for idx, (phr_en, phr_tr, sub_cat, pos_en, pos_tr, neg_en, neg_tr, que_en, que_tr) in enumerate(PHRASAL_VERBS_DATA, 1):
        all_items.append({
            "id": global_id,
            "original_id": idx,
            "unique_id": f"PHRASAL_{idx}",
            "type": "phrasal_verb",
            "type_label": "Deyimsel Fiil (Phrasal Verb)",
            "type_icon": "⚡",
            "word": phr_en,
            "meaning": phr_tr,
            "level": "B1-B2",
            "level_label": "Deyimsel Fiil",
            "category": sub_cat,
            "forms": {"v1": phr_en, "v2": "-", "v3": "-"},
            "detail_label": f"Kategori: {sub_cat}",
            "sentences": {
                "positive": {"en": pos_en, "tr": pos_tr},
                "negative": {"en": neg_en, "tr": neg_tr},
                "question": {"en": que_en, "tr": que_tr}
            }
        })
        global_id += 1

    # 4. 25 Nouns
    for idx, (noun_en, noun_tr, sub_cat, pos_en, pos_tr, neg_en, neg_tr, que_en, que_tr) in enumerate(NOUNS_DATA, 1):
        all_items.append({
            "id": global_id,
            "original_id": idx,
            "unique_id": f"NOUN_{idx}",
            "type": "noun",
            "type_label": "İsim (Noun)",
            "type_icon": "🔴",
            "word": noun_en,
            "meaning": noun_tr,
            "level": "A2-B1",
            "level_label": "İsim & Kavram",
            "category": sub_cat,
            "forms": {"v1": noun_en, "v2": "-", "v3": "-"},
            "detail_label": f"Kategori: {sub_cat}",
            "sentences": {
                "positive": {"en": pos_en, "tr": pos_tr},
                "negative": {"en": neg_en, "tr": neg_tr},
                "question": {"en": que_en, "tr": que_tr}
            }
        })
        global_id += 1

    # 5. 20 Adverbs
    for idx, (adv_en, adv_tr, sub_cat, pos_en, pos_tr, neg_en, neg_tr, que_en, que_tr) in enumerate(ADVERBS_DATA, 1):
        all_items.append({
            "id": global_id,
            "original_id": idx,
            "unique_id": f"ADV_{idx}",
            "type": "adverb",
            "type_label": "Zarf (Adverb)",
            "type_icon": "🟣",
            "word": adv_en,
            "meaning": adv_tr,
            "level": "A2-B1",
            "level_label": "Zarf / Belirteç",
            "category": sub_cat,
            "forms": {"v1": adv_en, "v2": "-", "v3": "-"},
            "detail_label": f"Kategori: {sub_cat}",
            "sentences": {
                "positive": {"en": pos_en, "tr": pos_tr},
                "negative": {"en": neg_en, "tr": neg_tr},
                "question": {"en": que_en, "tr": que_tr}
            }
        })
        global_id += 1

    # 6. 15 Conjunctions
    for idx, (conj_en, conj_tr, sub_cat, pos_en, pos_tr, neg_en, neg_tr, que_en, que_tr) in enumerate(CONJUNCTIONS_DATA, 1):
        all_items.append({
            "id": global_id,
            "original_id": idx,
            "unique_id": f"CONJ_{idx}",
            "type": "conjunction",
            "type_label": "Bağlaç (Conjunction)",
            "type_icon": "🟠",
            "word": conj_en,
            "meaning": conj_tr,
            "level": "B1",
            "level_label": "Bağlaç & Geçiş",
            "category": sub_cat,
            "forms": {"v1": conj_en, "v2": "-", "v3": "-"},
            "detail_label": f"Kategori: {sub_cat}",
            "sentences": {
                "positive": {"en": pos_en, "tr": pos_tr},
                "negative": {"en": neg_en, "tr": neg_tr},
                "question": {"en": que_en, "tr": que_tr}
            }
        })
        global_id += 1

    # 7. 10 Prepositions
    for idx, (prep_en, prep_tr, sub_cat, pos_en, pos_tr, neg_en, neg_tr, que_en, que_tr) in enumerate(PREPOSITIONS_DATA, 1):
        all_items.append({
            "id": global_id,
            "original_id": idx,
            "unique_id": f"PREP_{idx}",
            "type": "preposition",
            "type_label": "Edat (Preposition)",
            "type_icon": "🟢",
            "word": prep_en,
            "meaning": prep_tr,
            "level": "A2",
            "level_label": "Edat & Konum",
            "category": sub_cat,
            "forms": {"v1": prep_en, "v2": "-", "v3": "-"},
            "detail_label": f"Kategori: {sub_cat}",
            "sentences": {
                "positive": {"en": pos_en, "tr": pos_tr},
                "negative": {"en": neg_en, "tr": neg_tr},
                "question": {"en": que_en, "tr": que_tr}
            }
        })
        global_id += 1

    # 8. 10 Adjectives
    for idx, (adj_en, adj_tr, sub_cat, pos_en, pos_tr, neg_en, neg_tr, que_en, que_tr) in enumerate(ADJECTIVES_DATA, 1):
        all_items.append({
            "id": global_id,
            "original_id": idx,
            "unique_id": f"ADJ_{idx}",
            "type": "adjective",
            "type_label": "Sıfat (Adjective)",
            "type_icon": "🟡",
            "word": adj_en,
            "meaning": adj_tr,
            "level": "A2-B1",
            "level_label": "Sıfat & Niteleme",
            "category": sub_cat,
            "forms": {"v1": adj_en, "v2": "-", "v3": "-"},
            "detail_label": f"Kategori: {sub_cat}",
            "sentences": {
                "positive": {"en": pos_en, "tr": pos_tr},
                "negative": {"en": neg_en, "tr": neg_tr},
                "question": {"en": que_en, "tr": que_tr}
            }
        })
        global_id += 1

    # 9. 10 Idioms & Collocations
    for idx, (idm_en, idm_tr, sub_cat, pos_en, pos_tr, neg_en, neg_tr, que_en, que_tr) in enumerate(IDIOMS_DATA, 1):
        all_items.append({
            "id": global_id,
            "original_id": idx,
            "unique_id": f"IDIOM_{idx}",
            "type": "idiom",
            "type_label": "Kalıp İfade (Idiom)",
            "type_icon": "💬",
            "word": idm_en,
            "meaning": idm_tr,
            "level": "B1-B2",
            "level_label": "Kalıp İfade",
            "category": sub_cat,
            "forms": {"v1": idm_en, "v2": "-", "v3": "-"},
            "detail_label": f"Kategori: {sub_cat}",
            "sentences": {
                "positive": {"en": pos_en, "tr": pos_tr},
                "negative": {"en": neg_en, "tr": neg_tr},
                "question": {"en": que_en, "tr": que_tr}
            }
        })
        global_id += 1

    # Legacy verbs array
    legacy_verbs = [it for it in all_items if it["type"] == "verb"]
    for v in legacy_verbs:
        v["verb"] = v["word"]

    data["all_words"] = all_items
    data["verbs"] = legacy_verbs
    data["stats"] = {
        "total_items": len(all_items),
        "verbs_count": len(legacy_verbs),
        "phrasal_verbs_count": len(PHRASAL_VERBS_DATA),
        "nouns_count": len(NOUNS_DATA),
        "adverbs_count": len(ADVERBS_DATA),
        "conjunctions_count": len(CONJUNCTIONS_DATA),
        "prepositions_count": len(PREPOSITIONS_DATA),
        "adjectives_count": len(ADJECTIVES_DATA),
        "idioms_count": len(IDIOMS_DATA)
    }

    # Save to JSON
    with open(existing_json, "w", encoding="utf-8") as out:
        json.dump(data, out, ensure_ascii=False, indent=2)

    # Save to JS
    with open("/Users/alionurcerrah/Desktop/İngilizce Kelime/js/app_data.js", "w", encoding="utf-8") as out:
        out.write("const APP_DATA = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n")
        out.write("if (typeof module !== 'undefined' && module.exports) { module.exports = APP_DATA; }\n")

    print(f"MASTER COMPLETE: Generated {len(all_items)} total dictionary items (60 Phrasal Verbs)!")

if __name__ == "__main__":
    build_master_encyclopedia()
