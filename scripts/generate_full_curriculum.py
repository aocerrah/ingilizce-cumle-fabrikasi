import os
import json
import re

# Complete A2 List (80 Verbs) from User PDF
A2_VERBS_RAW = [
    (1, "be", "olmak", "Students must be quiet during the exam in the library.", "Öğrenciler kütüphanedeki sınav sırasında sessiz olmalıdır.", "You shouldn't be late for the morning training session.", "Sabah antrenman seansına geç kalmamalısın.", "Why can't he be more careful with his science experiment?", "Neden bilim deneyinde daha dikkatli olamıyor?"),
    (2, "have", "sahip olmak", "Every athlete should have a disciplined daily study routine.", "Her sporcu disiplinli bir günlük çalışma rutinine sahip olmalıdır.", "We don't have enough sports equipment for all players today.", "Bugün tüm oyuncular için yeterli spor ekipmanımız yok.", "Does your school have a modern virtual reality laboratory?", "Okulunuz modern bir sanal gerçeklik laboratuvarına sahip mi?"),
    (3, "do", "yapmak", "You can do your homework after finishing the volleyball practice.", "Voleybol antrenmanını bitirdikten sonra ödevini yapabilirsin.", "He didn't do any revision for the physics test yesterday.", "Dün fizik testi için hiç tekrar yapmadı.", "What should we do to prepare for the LGS exam effectively?", "LGS sınavına etkili bir şekilde hazırlanmak için ne yapmalıyız?"),
    (4, "make", "yapmak, üretmek", "The research team will make a detailed presentation on Friday.", "Araştırma ekibi cuma günü detaylı bir sunum yapacak.", "She doesn't make silly mistakes when she solves math problems.", "Matematik problemlerini çözerken aptalca hatalar yapmaz.", "Did your group make a new project plan for the science fair?", "Grubunuz bilim fuarı için yeni bir proje planı yaptı mı?"),
    (5, "go", "gitmek", "They go to the campus library every afternoon to study.", "Her öğleden sonra ders çalışmak için kampüs kütüphanesine giderler.", "The head coach didn't go to the tactical meeting yesterday.", "Başantrenör dün taktik toplantısına gitmedi.", "Where will the national team go for the summer training camp?", "Milli takım yaz antrenman kampı için nereye gidecek?"),
    (6, "come", "gelmek", "International researchers come to our university every year.", "Uluslararası araştırmacılar her yıl üniversitemize gelirler.", "He didn't come to the sports facility because of a heavy fever.", "Yüksek ateş nedeniyle spor tesisine gelmedi.", "What time did the guest speaker come to the conference hall?", "Konuk konuşmacı konferans salonuna saat kaçta geldi?"),
    (7, "get", "elde etmek, almak", "Diligent students get high test scores with regular revision.", "Çalışkan öğrenciler düzenli tekrarla yüksek test puanları alırlar.", "We couldn't get accurate sensor data during the sprint test.", "Depar testi sırasında doğru sensör verilerini alamadık.", "How did you get the scholarship for the sports academy in Switzerland?", "İsviçre'deki spor akademisi için bursu nasıl aldın?"),
    (8, "give", "vermek", "Professors give constructive feedback on student research projects.", "Profesörler öğrenci araştırma projeleri hakkında yapıcı geri bildirim verirler.", "The doctor didn't give permission for him to play in the match.", "Doktor maçta oynaması için ona izin vermedi.", "Can you give me the updated training timetable for next week?", "Gelecek haftanın güncellenmiş antrenman çizelgesini bana verebilir misin?"),
    (9, "take", "almak, götürmek", "Athletes take nutritional supplements under medical supervision.", "Sporcular tıbbi gözetim altında besin takviyeleri alırlar.", "She doesn't take unnecessary risks during important championship matches.", "Önemli şampiyona maçları sırasında gereksiz riskler almaz.", "How long does it take to travel from Eskişehir to Istanbul by train?", "Eskişehir'den İstanbul'a trenle seyahat etmek ne kadar sürer?"),
    (10, "bring", "getirmek", "Students can bring their digital tablets to the seminar room.", "Öğrenciler dijital tabletlerini seminer odasına getirebilirler.", "He didn't bring his sports passport to the tournament registration.", "Turnuva kaydına spor pasaportunu getirmedi.", "Who will bring the specialized biomechanical testing tools tomorrow?", "Yarın özel biyomekanik test araçlarını kim getirecek?"),
    (11, "leave", "ayrılmak, bırakmak", "The high-speed train leaves the station at eight o'clock sharp.", "Hızlı tren istasyondan tam saat sekizde ayrılır.", "You must not leave your personal sports gear unattended.", "Kişisel spor eşyalarınızı gözetimsiz bırakmamalısınız.", "When did the visiting team leave the university stadium?", "Konuk takım üniversite stadyumundan ne zaman ayrıldı?"),
    (12, "arrive", "varmak, ulaşmak", "Delegates will arrive at the Technopark building by noon.", "Delegeler öğleye kadar Teknopark binasına varacaklar.", "The flight didn't arrive on time due to heavy fog.", "Yoğun sis nedeniyle uçuş zamanında varmadı.", "Did your daughter arrive safely at the science camp in Ankara?", "Kızın Ankara'daki bilim kampına güvenle vardı mı?"),
    (13, "see", "görmek", "We can see significant improvements in player reaction times.", "Oyuncu reaksiyon sürelerinde belirgin gelişmeler görebiliyoruz.", "The referee didn't see the foul during the fast counterattack.", "Hakem hızlı kontra atak sırasında faulü görmedi.", "Have you seen the new virtual reality sports training lab yet?", "Yeni sanal gerçeklik spor antrenman laboratuvarını henüz gördün mü?"),
    (14, "watch", "izlemek", "Coaches watch tactical match videos to analyze opponent strategies.", "Antrenörler rakip stratejilerini analiz etmek için taktik maç videolarını izlerler.", "She doesn't watch useless TV series before important exams.", "Önemli sınavlardan önce faydasız dizileri izlemez.", "Did you watch the international championship finals live last night?", "Dün gece uluslararası şampiyona finallerini canlı izledin mi?"),
    (15, "look", "bakmak", "Scientists look closely at the microscopic muscle fiber data.", "Bilim insanları mikroskobik kas lifi verilerine yakından bakarlar.", "He didn't look at the tactical board before entering the game.", "Oyuna girmeden önce taktik tahtasına bakmadı.", "Why are you looking so worried about the upcoming LGS mock exam?", "Yaklaşan LGS deneme sınavı hakkında neden bu kadar endişeli görünüyorsun/bakıyorsun?"),
    (16, "hear", "duymak", "Athletes can hear the referee's whistle clearly across the pitch.", "Sporcular hakemin düdüğünü sahanın her yerinden net bir şekilde duyabilirler.", "I didn't hear the alarm clock because I was exhausted.", "Çok yorgun olduğum için çalar saati duymadım.", "Did you hear the announcement about the upcoming robotics competition?", "Yaklaşan robotik yarışması hakkındaki duyuruyu duydun mu?"),
    (17, "listen", "dinlemek", "Young players must listen to their coach's instructions carefully.", "Genç oyuncular antrenörlerinin talimatlarını dikkatlice dinlemelidir.", "He doesn't listen to music while solving complex mathematical formulas.", "Karmaşık matematiksel formülleri çözerken müzik dinlemez.", "Are you listening to the English podcast on grammar rules every day?", "Her gün gramer kuralları hakkındaki İngilizce podcast'i dinliyor musun?"),
    (18, "speak", "konuşmak", "Our project mentor speaks three foreign languages fluently.", "Proje danışmanımız üç yabancı dili akıcı bir şekilde konuşur.", "She couldn't speak during the meeting due to a severe sore throat.", "Şiddetli boğaz ağrısı nedeniyle toplantı sırasında konuşamadı.", "How many foreign languages can the new sports scientist speak?", "Yeni spor bilimcisi kaç yabancı dil konuşabiliyor?"),
    (19, "say", "söylemek", "The professor said that regular daily practice is the key to mastery.", "Profesör, düzenli günlük pratiğin ustalığın anahtarı olduğunu söyledi.", "Don't say anything to the media before the official press conference.", "Resmi basın toplantısından önce medyaya hiçbir şey söylemeyin.", "What did the head coach say about the team's defensive structure?", "Başantrenör takımın savunma yapısı hakkında ne söyledi?"),
    (20, "tell", "anlatmak, söylemek", "Mentors tell inspirational stories to motivate young academy players.", "Danışmanlar, genç akademi oyuncularını motive etmek için ilham verici hikayeler anlatırlar.", "He didn't tell us the true reason behind his sudden departure.", "Ani ayrılışının arkasındaki gerçek sebebi bize söylemedi.", "Can you tell me where the nearest photocell sprint gate is?", "En yakın fotosel depar kapısının nerede olduğunu bana söyleyebilir misin?"),
    (21, "ask", "sormak, istemek", "Curious students ask insightful questions during physics lectures.", "Meraklı öğrenciler fizik dersleri sırasında anlayışlı sorular sorarlar.", "She didn't ask for any extra time during the scholarship exam.", "Burs sınavı sırasında hiç ekstra süre istemedi.", "Why did you ask the instructor about the advanced passive voice rule?", "Eğitmene ileri edilgen çatı kuralı hakkında neden soru sordun?"),
    (22, "answer", "cevaplamak", "He answered all fifty questions correctly in the mock test.", "Deneme testindeki elli sorunun tamamını doğru cevapladı.", "The technical support team hasn't answered our email inquiry yet.", "Teknik destek ekibi e-posta sorumuza henüz cevap vermedi.", "How quickly can your AI model answer complex queries?", "Yapay zeka modeliniz karmaşık sorguları ne kadar hızlı cevaplayabilir?"),
    (23, "know", "bilmek, tanımak", "Experienced coaches know the physical limits of every player.", "Deneyimli antrenörler her oyuncunun fiziksel sınırlarını bilirler.", "I don't know the exact password for the remote data server.", "Uzak veri sunucusunun tam şifresini bilmiyorum.", "Do you know which formula is used to calculate athletic load?", "Atletik yükü hesaplamak için hangi formülün kullanıldığını biliyor musun?"),
    (24, "think", "düşünmek", "Researchers think that virtual reality accelerates learning speed.", "Araştırmacılar, sanal gerçekliğin öğrenme hızını artırdığını düşünüyorlar.", "She doesn't think the referee made a fair decision in the final set.", "Final setinde hakemin adil bir karar verdiğini düşünmüyor.", "What do you think about the new Turkish English grammar guide?", "Yeni Türkçe İngilizce gramer rehberi hakkında ne düşünüyorsun?"),
    (25, "understand", "anlamak", "Smart students understand the logic of the SVOMPT rule quickly.", "Zeki öğrenciler SVOMPT kuralının mantığını çabucak anlarlar.", "He didn't understand why the sensor values were calibrated incorrectly.", "Sensör değerlerinin neden yanlış kalibre edildiğini anlamadı.", "Do you understand how relative clauses connect two separate sentences?", "Sıfat cümleciklerinin iki ayrı cümleyi nasıl bağladığını anlıyor musun?"),
    (26, "learn", "öğrenmek", "Children learn foreign languages more naturally through interactive games.", "Çocuklar yabancı dilleri etkileşimli oyunlar aracılığıyla daha doğal öğrenirler.", "He didn't learn irregular verb forms until he used flashcards.", "Flaş kartları kullanana kadar düzensiz fiil hallerini öğrenmedi.", "How many new English words did you learn this morning?", "Bu sabah kaç tane yeni İngilizce kelime öğrendin?"),
    (27, "teach", "öğretmek", "Dedicated instructors teach modern sports science methods at ESTÜ.", "Özverili eğitmenler ESTÜ'de modern spor bilimi yöntemlerini öğretirler.", "She doesn't teach beginner classes anymore; she supervises masters students.", "Artık başlangıç dersleri vermiyor; yüksek lisans öğrencilerine danışmanlık yapıyor.", "Who will teach the advanced English grammar course next semester?", "Gelecek dönem ileri İngilizce gramer dersini kim öğretecek/verecek?"),
    (28, "study", "çalışmak (ders)", "Ela studies English grammar two hours every single day.", "Ela her gün iki saat İngilizce gramer çalışır.", "They didn't study hard enough for the national competition.", "Ulusal yarışma için yeterince sıkı çalışmadılar.", "Which academic subject does your daughter study with greatest passion?", "Kızın hangi akademik konuyu en büyük tutkuyla çalışıyor?"),
    (29, "read", "okumak", "Scientists read peer-reviewed journals before writing articles.", "Bilim insanları makale yazmadan önce hakemli dergileri okurlar.", "He didn't read the safety manual before operating the VR headset.", "VR başlığını çalıştırmadan önce güvenlik kılavuzunu okumadı.", "Have you read the latest chapter of Ela's Adventure story?", "Ela'nın Macerası hikayesinin son bölümünü okudun mu?"),
    (30, "write", "yazmak", "The professor writes academic papers on sports biomechanics.", "Profesör spor biyomekaniği üzerine akademik makaleler yazar.", "She didn't write down her experimental notes in the lab notebook.", "Laboratuvar defterine deneysel notlarını yazmadı.", "Did you write the Python script for automating data analysis?", "Veri analizini otomatikleştirmek için Python komut dosyasını yazdın mı?"),
    (31, "use", "kullanmak", "Sports scientists use photocell gates for precise sprint timing.", "Spor bilimcileri hassas depar zamanlaması için fotosel kapıları kullanırlar.", "You must not use unapproved chemicals in the testing facility.", "Test tesisinde onaylanmamış kimyasalları kullanmamalısınız.", "How do you use the Ultimate Trackers during VR soccer drills?", "VR futbol antrenmanları sırasında Ultimate Takip Cihazlarını nasıl kullanıyorsunuz?"),
    (32, "open", "açmak", "The technician opens the laboratory doors at seven in the morning.", "Teknisyen sabah saat yedide laboratuvar kapılarını açar.", "She didn't open the confidential envelope before the meeting.", "Toplantıdan önce gizli zarfı açmadı.", "When will the university open the new artificial intelligence center?", "Üniversite yeni yapay zeka merkezini ne zaman açacak?"),
    (33, "close", "kapatmak", "Staff members close all testing chambers at the end of the shift.", "Personel üyeleri vardiya sonunda tüm test odalarını kapatırlar.", "He didn't close the software application properly before shutting down.", "Bilgisayarı kapatmadan önce yazılım uygulamasını düzgünce kapatmadı.", "Why did they close the campus Olympic swimming pool today?", "Bugün kampüs Olimpik yüzme havuzunu neden kapattılar?"),
    (34, "start", "başlamak", "Academy players start their warm-up routine twenty minutes before practice.", "Akademi oyuncuları ısınma rutinlerine antrenmandan yirmi dakika önce başlarlar.", "The scientific presentation didn't start on schedule due to technical glitches.", "Teknik aksaklıklar nedeniyle bilimsel sunum planlanan zamanda başlamadı.", "What time does the morning conditioning session start tomorrow?", "Yarın sabah kondisyon seansı saat kaçta başlıyor?"),
    (35, "finish", "bitirmek", "He finishes his high-intensity interval training before sunset.", "Yüksek yoğunluklu aralıklı antrenmanını gün batımından önce bitirir.", "She hasn't finished the comprehensive literature review chapter yet.", "Kapsamlı literatür taraması bölümünü henüz bitirmedi.", "When will the construction of the new sports arena finish?", "Yeni spor salonunun inşaatı ne zaman bitecek?"),
    (36, "stop", "durmak, durdurmak", "Athletes must stop exercising immediately if they feel sharp pain.", "Sporcular keskin bir ağrı hissederlerse egzersizi derhal durdurmalıdır.", "The bus didn't stop at the university gate because it was full.", "Otobüs dolu olduğu için üniversite kapısında durmadı.", "Why did the referee stop the football match in the eightieth minute?", "Hakem futbol maçını sekseninci dakikada neden durdurdu?"),
    (37, "try", "denemek, çabalamak", "Determined students try hard to master complex grammatical rules.", "Kararlı öğrenciler karmaşık dilbilgisi kurallarını kavramak için çok çabalarlar.", "He didn't try the new vertical jump measurement protocol.", "Yeni dikey sıçrama ölçüm protokolünü denemedi.", "Have you tried using mobile flashcards for daily vocabulary revision?", "Günlük kelime tekrarı için mobil flaş kartları kullanmayı denedin mi?"),
    (38, "help", "yardım etmek", "Senior researchers help junior colleagues analyze complex datasets.", "Kıdemli araştırmacılar genç meslektaşlarının karmaşık veri setlerini analiz etmelerine yardım ederler.", "She couldn't help us yesterday because she had an urgent lecture.", "Dün acil bir dersi olduğu için bize yardım edemedi.", "Can you help me carry this heavy biometric testing equipment?", "Bu ağır biyometrik test ekipmanını taşımama yardım edebilir misin?"),
    (39, "need", "ihtiyaç duymak", "Young athletes need balanced nutrition and adequate sleep for recovery.", "Genç sporcular toparlanma için dengeli beslenmeye ve yeterli uykuya ihtiyaç duyarlar.", "You don't need expensive equipment to practice English vocabulary daily.", "Her gün İngilizce kelime pratiği yapmak için pahalı ekipmanlara ihtiyaç duymazsınız.", "What kind of safety certifications do we need for this VR project?", "Bu VR projesi için ne tür güvenlik sertifikalarına ihtiyacımız var?"),
    (40, "want", "istemek", "Ela wants to achieve top academic honors this semester.", "Ela bu dönem en yüksek akademik başarıyı elde etmek istiyor.", "He didn't want to participate in the international conference alone.", "Uluslararası konferansa tek başına katılmak istemedi.", "Which high school program does your daughter want to enroll in?", "Kızın hangi lise programına kaydolmak istiyor?"),
    (41, "like", "hoşlanmak, beğenmek", "Students like interactive mobile applications that make learning fun.", "Öğrenciler öğrenmeyi eğlenceli kılan etkileşimli mobil uygulamalardan hoşlanırlar.", "He doesn't like noisy environments when he focuses on math problems.", "Matematik problemlerine odaklanırken gürültülü ortamlardan hoşlanmaz.", "Do you like the new SVOMPT sentence builder feature in the app?", "Uygulamadaki yeni SVOMPT cümle kurucu özelliğini beğendin mi?"),
    (42, "love", "çok sevmek", "Young coders love building artificial intelligence applications.", "Genç yazılımcılar yapay zeka uygulamaları geliştirmeyi çok severler.", "She doesn't love competitive sports as much as artistic activities.", "Yarışma sporlarını sanatsal aktiviteler kadar çok sevmez.", "Why do children love learning foreign languages through digital stories?", "Çocuklar yabancı dilleri dijital hikayeler aracılığıyla öğrenmeyi neden çok sever?"),
    (43, "hate", "nefret etmek", "Disciplined athletes hate wasting time on unscientific training methods.", "Disiplinli sporcular bilimsel olmayan antrenman yöntemleriyle zaman kaybetmekten nefret ederler.", "He doesn't hate studying grammar, but he prefers speaking practice.", "Gramer çalışmaktan nefret etmez ama konuşma pratiğini tercih eder.", "Why does the head coach hate arriving late to morning tactical meetings?", "Başantrenör sabah taktik toplantılarına geç kalınmasından neden nefret eder?"),
    (44, "eat", "yemek", "Athletes eat protein-rich meals after rigorous workout sessions.", "Sporcular zorlu antrenman seanslarından sonra protein açısından zengin yemekler yerler.", "She didn't eat anything heavy before the sprint agility test.", "Depar çeviklik testinden önce ağır hiçbir şey yemedi.", "What do marathon runners eat to maintain their glycogen levels?", "Maraton koşucuları glikojen seviyelerini korumak için ne yerler?"),
    (45, "drink", "içmek", "Players must drink plenty of electrolyte water during hot summer matches.", "Oyuncular sıcak yaz maçları sırasında bol miktarda elektrolitli su içmelidir.", "He doesn't drink sugary carbonated beverages before competitive games.", "Müsabaka maçlarından önce şekerli gazlı içecekler içmez.", "How many liters of water do you drink during intense training days?", "Yoğun antrenman günlerinde kaç litre su içersin?"),
    (46, "cook", "pişirmek, yemek yapmak", "Nutritionists cook balanced meals for the youth soccer academy.", "Beslenme uzmanları genç futbol akademisi için dengeli yemekler pişirirler.", "He doesn't cook dinner at home when he works late at the laboratory.", "Laboratuvarda geç saatlere kadar çalıştığında evde akşam yemeği pişirmez.", "Did your family cook traditional Turkish dishes for the international guests?", "Aileniz uluslararası misafirler için geleneksel Türk yemekleri pişirdi mi?"),
    (47, "buy", "satın almak", "The department will buy high-resolution cameras for motion analysis.", "Bölüm, hareket analizi için yüksek çözünürlüklü kameralar satın alacak.", "She didn't buy the expensive textbook because it was available in the library.", "Kütüphanede mevcut olduğu için pahalı ders kitabını satın almadı.", "Where did you buy this professional athletic timing system?", "Bu profesyonel atletik zamanlama sistemini nereden satın aldınız?"),
    (48, "sell", "satmak", "Local companies sell certified sports equipment to fitness clubs.", "Yerel şirketler fitness kulüplerine sertifikalı spor ekipmanları satarlar.", "The academy doesn't sell merchandise without the official club crest.", "Akademi resmi kulüp arması olmadan ürün satmaz.", "Why did they sell their old laboratory equipment at a discount?", "Eski laboratuvar ekipmanlarını neden indirimli fiyata sattılar?"),
    (49, "pay", "ödemek", "Universities pay research grants to successful scientific projects.", "Üniversiteler başarılı bilimsel projelere araştırma hibeleri öderler.", "He didn't pay the tournament entry fee before the registration deadline.", "Kayıt son tarihinden önce turnuva katılım ücretini ödemedi.", "How much did you pay for the international sports conference ticket?", "Uluslararası spor konferansı bileti için ne kadar ödedin?"),
    (50, "find", "bulmak", "Researchers find innovative solutions by analyzing large sports datasets.", "Araştırmacılar büyük spor veri setlerini analiz ederek yenilikçi çözümler bulurlar.", "We couldn't find the missing sensor calibration cable in the lab.", "Laboratuvarda kayıp sensör kalibrasyon kablosunu bulamadık.", "Where did Ela find the mysterious journal in the old academy building?", "Ela eski akademi binasında gizemli günlüğü nerede buldu?"),
    (51, "lose", "kaybetmek", "Teams can lose focus if they don't rest properly between sets.", "Takımlar setler arasında düzgün dinlenmezlerse odaklarını kaybedebilirler.", "The football club didn't lose any home matches this season.", "Futbol kulübü bu sezon hiçbir iç saha maçını kaybetmedi.", "Why did the athlete lose his stamina during the second half?", "Sporcu ikinci yarıda dayanıklılığını neden kaybetti?"),
    (52, "keep", "saklamak, korumak, devam ettirmek", "You must keep scientific experimental data confidential and secure.", "Bilimsel deneysel verileri gizli ve güvenli tutmalısınız/saklamalısınız.", "Don't keep old uncalibrated sensors in the testing laboratory.", "Eski kalibre edilmemiş sensörleri test laboratuvarında tutmayın.", "How do you keep your motivation high during hard training periods?", "Zorlu antrenman dönemlerinde motivasyonunuzu nasıl yüksek tutuyorsunuz?"),
    (53, "put", "koymak", "Please put the vertical jump measurement mat on a flat surface.", "Lütfen dikey sıçrama ölçüm matını düz bir yüzeye koyun.", "He didn't put the heavy dumbbells back on the rack.", "Ağır dambılları standa geri koymadı.", "Where did you put the photocell sprint gate tripods?", "Fotosel depar kapısı tripodlarını nereye koydun?"),
    (54, "carry", "taşımak", "Assistants are carrying the testing equipment to the football field.", "Asistanlar test ekipmanlarını futbol sahasına taşıyorlar.", "She shouldn't carry heavy equipment without assistance.", "Yardım almadan ağır ekipman taşımamalıdır.", "Can you carry this VR headset case to the conference room?", "Bu VR başlık çantasını konferans salonuna taşıyabilir misin?"),
    (55, "wear", "giymek, takmak", "Athletes are wearing Ultimate Trackers during the VR tactical session.", "Sporcular VR taktik seansı sırasında Ultimate Takip Cihazları takıyorlar.", "He wasn't wearing proper volleyball shoes during the match.", "Maç sırasında uygun voleybol ayakkabıları giymiyordu.", "What kind of protective gear do young players wear in training?", "Genç oyuncular antrenmanda ne tür koruyucu ekipman giyer/takar?"),
    (56, "wash", "yıkamak", "Players should wash their training uniforms after every practice session.", "Oyuncular her antrenman seansından sonra antrenman formalarını yıkamalıdır.", "He didn't wash his sports towel after yesterday's gym workout.", "Dünkü spor salonu antrenmanından sonra spor havlusunu yıkamadı.", "How often do staff members wash the facility equipment mats?", "Personel üyeleri tesis ekipman matlarını ne sıklıkla yıkar?"),
    (57, "clean", "temizlemek", "Staff members clean the Technopark laboratory every evening.", "Personel üyeleri her akşam Teknopark laboratuvarını temizlerler.", "They haven't cleaned the photocell optical sensors yet.", "Fotosel optik sensörlerini henüz temizlemediler.", "Did you clean the VR lenses with a microfiber cloth?", "VR merceklerini mikrofiber bir bezle temizledin mi?"),
    (58, "sleep", "uyumak", "Athletes need to sleep eight hours every night for optimal recovery.", "Sporcular en uygun toparlanma için her gece sekiz saat uyumalıdır.", "She didn't sleep well before the important scholarship examination.", "Önemli burs sınavından önce iyi uyuyamadı.", "How many hours did you sleep after the intense conditioning test?", "Yoğun kondisyon testinden sonra kaç saat uyudun?"),
    (59, "wake up", "uyanmak", "I wake up at six o'clock every morning to do bodyweight circuits.", "Vücut ağırlığı egzersizleri yapmak için her sabah saat altıda uyanırım.", "He doesn't wake up late even on Sunday mornings.", "Pazar sabahları bile geç uyanmaz.", "What time did your daughter wake up for her English study session?", "Kızın İngilizce çalışma seansı için saat kaçta uyandı?"),
    (60, "sit", "oturmak", "Substitutes sit on the bench and watch the football tactics carefully.", "Yedekler kulübede oturur ve futbol taktiklerini dikkatlice izlerler.", "Don't sit on the athletic testing mats during rest intervals.", "Dinlenme aralarında atletik test matlarının üzerine oturmayın.", "Where did the head coach sit during the tactical video analysis?", "Taktik video analizi sırasında başantrenör nereye oturdu?"),
    (61, "stand", "ayakta durmak", "Athletes must stand still while waiting for the photocell gate signal.", "Sporcular fotosel kapısı sinyalini beklerken hareketsiz durmalıdır.", "You shouldn't stand close to the radar ball velocity sensor.", "Radar top hızı sensörünün yakınında durmamalısınız.", "Why were spectators standing near the touchline during the match?", "Maç sırasında seyirciler neden taç çizgisinin yakınında duruyorlardı?"),
    (62, "walk", "yürümek", "He does a brisk thirty-minute walk every morning for cardiovascular health.", "Kardiyovasküler sağlık için her sabah otuz dakikalık tempolu bir yürüyüş yapar.", "She didn't walk to the campus because it was raining heavily.", "Şiddetli yağmur yağdığı için kampüse yürümedi.", "How many kilometers do you walk during your daily routine?", "Günlük rutinin sırasında kaç kilometre yürürsün?"),
    (63, "run", "koşmak", "Young players can run 30 meters in less than five seconds.", "Genç oyuncular 30 metreyi beş saniyeden kısa sürede koşabilirler.", "He wasn't running at full speed during the warm-up lap.", "Isınma turu sırasında tam hızda koşmuyordu.", "Did you run in the Arrowhead agility test battery yesterday?", "Dün Ok Başı çeviklik test bataryasında koştun mu?"),
    (64, "jump", "zıplamak, sıçramak", "Athletes jump vertically to measure their CMJ explosive leg power.", "Sporcular CMJ patlayıcı bacak güçlerini ölçmek için dikey sıçrarlar/zıplarlar.", "He didn't jump high enough to block the opponent's volleyball spike.", "Rakibin voleybol smaçını bloklamak için yeterince yükseğe zıplamadı.", "How high can female volleyball players jump in vertical tests?", "Kadın voleybolcular dikey testlerde ne kadar yükseğe zıplayabilir?"),
    (65, "swim", "yüzmek", "She can swim fifty meters in the campus Olympic pool easily.", "Kampüs Olimpik havuzunda elli metreyi kolayca yüzebilir.", "They don't swim in outdoor pools during cold winter months.", "Soğuk kış aylarında açık hava havuzlarında yüzmezler.", "Did your family swim in the sea during your trip to Sharm El Sheikh?", "Şarm El-Şeyh gezisinde ailen denizde yüzdü mü?"),
    (66, "drive", "araba kullanmak", "He drives from Eskişehir to Istanbul twice a week for consulting.", "Danışmanlık için haftada iki kez Eskişehir'den İstanbul'a araba sürer/gider.", "You must not drive fast near the sports academy campus.", "Spor akademisi kampüsünün yakınında hızlı araba kullanmamalısınız.", "How long did you drive during your road trip to Greece?", "Yunanistan karayolu seyahatiniz sırasında ne kadar süre araba kullandın?"),
    (67, "ride", "binmek (bisiklet/at)", "Students often ride stationary bicycles for warm-up exercises.", "Öğrenciler ısınma egzersizleri için sık sık sabit bisikletlere binerler.", "He doesn't ride a bicycle without wearing a safety helmet.", "Güvenlik kaskı takmadan bisiklete binmez.", "Did your daughter ride a bicycle in the park yesterday?", "Kızın dün parkta bisiklete bindi mi?"),
    (68, "travel", "seyahat etmek", "Researchers travel to Switzerland for international scientific meetings.", "Araştırmacılar uluslararası bilimsel toplantılar için İsviçre'ye seyahat ederler.", "The team won't travel by bus due to the long distance between cities.", "Şehirler arasındaki uzun mesafe nedeniyle takım otobüsle seyahat etmeyecek.", "Which European countries have you traveled to for sports conferences?", "Spor konferansları için hangi Avrupa ülkelerine seyahat ettin?"),
    (69, "call", "aramak, çağırmak", "The coach will call the assistant to review tactical video footage.", "Antrenör taktik video görüntülerini incelemek için asistanı arayacak.", "She didn't call the doctor because her injury was minor.", "Sakatlığı hafif olduğu için doktoru aramadı.", "Why did the team manager call an urgent meeting this morning?", "Takım menajeri bu sabah neden acil bir toplantı çağırdı/aradı?"),
    (70, "meet", "buluşmak, karşılaşmak, tanışmak", "Coaches meet every Monday to organize weekly academy training schedules.", "Antrenörler haftalık akademi antrenman programlarını düzenlemek için her pazartesi buluşurlar.", "We haven't met the new sports science consultant yet.", "Yeni spor bilimi danışmanıyla henüz tanışmadık/buluşmadık.", "Where will you meet the international guests in Switzerland?", "İsviçre'de uluslararası konuklarla nerede buluşacaksınız?"),
    (71, "visit", "ziyaret etmek", "We visited the Eti Archaeology Museum to see ancient historical artifacts.", "Antik tarihi eserleri görmek için Eti Arkeoloji Müzesi'ni ziyaret ettik.", "She hasn't visited the new Technopark office building yet.", "Yeni Teknopark ofis binasını henüz ziyaret etmedi.", "Have you ever visited the ancient island of Crete during summer?", "Yazın hiç antik Girit adasını ziyaret ettin mi?"),
    (72, "live", "yaşamak", "The professor lives in Eskişehir and commutes to Istanbul for consulting.", "Profesör Eskişehir'de yaşıyor ve danışmanlık için İstanbul'a gidip geliyor.", "They don't live near the sports campus anymore.", "Artık spor kampüsünün yakınında yaşamıyorlar.", "How long have you lived in this peaceful university town?", "Bu huzurlu üniversite şehrinde ne kadar süredir yaşıyorsun?"),
    (73, "work", "çalışmak (iş)", "He works as a sports science consultant for Esenler Erokspor.", "Esenler Erokspor'da spor bilimi danışmanı olarak çalışıyor.", "Researchers don't work in the laboratory on Sunday afternoons.", "Araştırmacılar pazar öğleden sonraları laboratuvarda çalışmazlar.", "Does your team work on machine learning models for VR testing?", "Takımınız VR testleri için makine öğrenmesi modelleri üzerinde mi çalışıyor?"),
    (74, "play", "oynamak", "Youth academy players play tactical matches every Saturday.", "Genç akademi oyuncuları her cumartesi taktik maçlar oynarlar.", "He didn't play in the final match due to a muscle injury.", "Kas sakatlığı nedeniyle final maçında oynamadı.", "Which sports branch does your daughter play at school?", "Kızın okulda hangi spor dalını oynuyor?"),
    (75, "win", "kazanmak (maç/ödül)", "The football team won the regional championship after a hard game.", "Futbol takımı zorlu bir maçın ardından bölge şampiyonluğunu kazandı.", "They didn't win the trophy, but they gained valuable experience.", "Kupayı kazanamadılar ama değerli tecrübe kazandılar.", "Did your robotics team win the first-place award in Switzerland?", "Robotik takımınız İsviçre'de birincilik ödülünü kazandı mı?"),
    (76, "remember", "hatırlamak", "Athletes should remember to complete their post-training stretching.", "Sporcular antrenman sonrası esneme hareketlerini tamamlamayı hatırlamalıdır.", "I don't remember the exact password for the data schema server.", "Veri şeması sunucusunun tam şifresini hatırlamıyorum.", "Do you remember the formula for calculating athletic load ratios?", "Atletik yük oranlarını hesaplama formülünü hatırlıyor musun?"),
    (77, "forget", "unutmak", "Don't forget to submit your weekly TÜBİTAK progress notes on Friday.", "Cuma günü haftalık TÜBİTAK ilerleme notlarınızı teslim etmeyi unutmayın.", "She didn't forget her volleyball equipment bag this time.", "Bu sefer voleybol ekipman çantasını unutmadı.", "Why did you forget to charge the Ultimate Trackers before practice?", "Antrenmandan önce Ultimate Takip Cihazlarını şarj etmeyi neden unuttun?"),
    (78, "choose", "seçmek", "Coaches choose the best players for the starting eleven roster.", "Antrenörler ilk 11 kadrosu için en iyi oyuncuları seçerler.", "He didn't choose the hard math option for his elective course.", "Seçmeli dersi için zor matematik seçeneğini seçmedi.", "Which high school did your daughter choose for her future education?", "Kızın gelecekteki eğitimi için hangi liseyi seçti?"),
    (79, "wait", "beklemek", "Athletes wait in the testing zone before their photocell sprint turn.", "Sporcular fotosel depar sıralarından önce test bölgesinde beklerler.", "They didn't wait for the rain to stop; they continued training.", "Yağmurun durmasını beklemediler; antrenmana devam ettiler.", "How long did you wait for the bus to the Eskişehir campus?", "Eskişehir kampüsü otobüsünü ne kadar süre bekledin?"),
    (80, "show", "göstermek", "The Python Seaborn script shows publication-grade error bars clearly.", "Python Seaborn komut dosyası yayın kalitesindeki hata çubuklarını net bir şekilde gösterir.", "This simple chart doesn't show the internal load metrics accurately.", "Bu basit grafik iç yük metriklerini doğru göstermiyor.", "Can you show me how to operate the new HTC Vive Focus Vision headset?", "Yeni HTC Vive Focus Vision başlığını nasıl çalıştıracağımı bana gösterebilir misin?")
]

# Complete B1 List (78 Verbs) from User PDF
B1_VERBS_RAW = [
    (1, "achieve", "başarmak", "Hard-working students achieve their academic goals through steady discipline.", "Çalışkan öğrenciler düzenli disiplinle akademik hedeflerini başarırlar.", "Without consistent training, athletes cannot achieve peak performance.", "Tutarlı antrenman olmadan sporcular zirve performansı başaramazlar.", "What milestones did your team achieve during the European tournament?", "Takımınız Avrupa turnuvası sırasında hangi kilometre taşlarını başardı?"),
    (2, "improve", "geliştirmek", "Regular reading improves language fluency and grammar comprehension.", "Düzenli okuma, dil akıcılığını ve gramer kavrayışını geliştirir.", "The outdated algorithm didn't improve the sensor accuracy significantly.", "Eski algoritma sensör doğruluğunu önemli ölçüde geliştirmedi.", "How can young athletes improve their vertical jump explosion?", "Genç sporcular dikey sıçrama patlayıcılıklarını nasıl geliştirebilirler?"),
    (3, "increase", "artırmak", "Gradual overload increases muscular strength and aerobic capacity.", "Kademeli aşırı yükleme, kas gücünü ve aerobik kapasiteyi artırır.", "The coach didn't increase the training workload before the final match.", "Antrenör final maçından önce antrenman iş yükünü artırmadı.", "Will this new software increase our data processing speed?", "Bu yeni yazılım veri işleme hızımızı artıracak mı?"),
    (4, "reduce", "azaltmak", "Proper warm-up drills reduce the risk of muscle injuries in athletes.", "Düzgün ısınma egzersizleri sporcularda kas sakatlığı riskini azaltır.", "He didn't reduce his screen time before sleeping.", "Uyumadan önce ekran süresini azaltmadı.", "How can researchers reduce experimental error in biomechanical tests?", "Araştırmacılar biyomekanik testlerdeki deneysel hatayı nasıl azaltabilir?"),
    (5, "compare", "karşılaştırmak", "Scientists compare pre-test and post-test values to measure progress.", "Bilim insanları gelişimi ölçmek için ön test ve son test değerlerini karşılaştırırlar.", "She didn't compare the two different VR headsets before buying one.", "Birini satın almadan önce iki farklı VR başlığını karşılaştırmadı.", "How do coaches compare physical performance metrics between players?", "Antrenörler oyuncular arasındaki fiziksel performans metriklerini nasıl karşılaştırır?"),
    (6, "describe", "tanımlamak, betimlemek", "The report describes the new VR soccer simulation in great detail.", "Rapor yeni VR futbol simülasyonunu büyük bir detayla tanımlar/açıklar.", "He couldn't describe the tactical problem to the head coach clearly.", "Taktiksel problemi başantrenöre net bir şekilde tanımlayamadı/anlatamadı.", "Can you describe the main differences between Type 1 and Type 2 conditionals?", "Type 1 ve Type 2 koşul cümleleri arasındaki temel farkları tanımlayabilir misin?"),
    (7, "explain", "açıklamak", "Teachers explain complex English grammar rules using simple SVOMPT diagrams.", "Öğretmenler karmaşık İngilizce gramer kurallarını basit SVOMPT şemaları kullanarak açıklarlar.", "He didn't explain why the sensor was disconnected during the trial.", "Deneme sırasında sensörün neden bağlantısının kesildiğini açıklamadı.", "Could you explain the difference between active and passive voice again?", "Etken ve edilgen çatı arasındaki farkı tekrar açıklayabilir misiniz?"),
    (8, "discuss", "tartışmak", "Coaches and analysts discuss match strategies in weekly tactical meetings.", "Antrenörler ve analistler haftalık taktik toplantılarında maç stratejilerini tartışırlar.", "They didn't discuss the contract details during the first meeting.", "İlk toplantı sırasında sözleşme detaylarını tartışmadılar.", "What topics will the committee discuss at the international conference?", "Komite uluslararası konferansta hangi konuları tartışacak?"),
    (9, "suggest", "önermek", "Mentors suggest reading English stories to expand vocabulary naturally.", "Danışmanlar kelime dağarcığını doğal yoldan genişletmek için İngilizce hikayeler okumayı önerirler.", "The doctor didn't suggest returning to heavy practice immediately.", "Doktor hemen ağır antrenmana dönülmesini önermedi.", "What exercises do you suggest for enhancing agility?", "Çevikliği artırmak için hangi egzersizleri önerirsiniz?"),
    (10, "recommend", "tavsiye etmek", "Experts recommend eight hours of continuous sleep for athletes.", "Uzmanlar sporcular için sekiz saatlik kesintisiz uykuyu tavsiye ederler.", "I wouldn't recommend skipping the daily grammar revision sessions.", "Günlük gramer tekrar seanslarını atlamayı tavsiye etmem.", "Which English study app do professors recommend for high school students?", "Profesörler lise öğrencileri için hangi İngilizce çalışma uygulamasını tavsiye ediyor?"),
    (11, "advise", "öğüt vermek, tavsiye etmek", "Counselors advise students to manage their study time efficiently.", "Rehber öğretmenler öğrencilere çalışma sürelerini verimli yönetmelerini öğütlerler.", "The doctor didn't advise running on hard asphalt surfaces with joint pain.", "Doktor eklem ağrısıyla sert asfalt yüzeylerde koşulmasını öğütlemedi/tavsiye etmedi.", "What did the mentor advise regarding your academic research plan?", "Danışman akademik araştırma planınızla ilgili ne tavsiye etti?"),
    (12, "encourage", "teşvik etmek", "Good coaches encourage young players to learn from their mistakes.", "İyi antrenörler genç oyuncuları hatalarından ders çıkarmaya teşvik ederler.", "Parents shouldn't discourage curiosity; they must encourage questioning.", "Ebeveynler merakı engellememeli; soru sormayı teşvik etmelidirler.", "How do teachers encourage active participation in language classes?", "Öğretmenler dil derslerinde aktif katılımı nasıl teşvik eder?"),
    (13, "support", "desteklemek", "Universities support innovative student projects with funding and labs.", "Üniversiteler yenilikçi öğrenci projelerini fonlama ve laboratuvarlarla desteklerler.", "The club board didn't support the proposed change in training facilities.", "Kulüp yönetimi antrenman tesislerindeki önerilen değişikliği desteklemedi.", "Will the ministry support our international sports science symposium?", "Bakanlık uluslararası spor bilimleri sempozyumumuzu destekleyecek mi?"),
    (14, "protect", "korumak", "Proper protective gear protects athletes from unnecessary fractures.", "Uygun koruyucu ekipman sporcuları gereksiz kırıklardan korur.", "A simple password doesn't protect the server from security breaches.", "Basit bir şifre sunucuyu güvenlik ihlallerinden korumaz.", "How can young athletes protect their knees during explosive jump landings?", "Genç sporcular patlayıcı sıçrama inişleri sırasında dizlerini nasıl koruyabilir?"),
    (15, "prevent", "önlemek, engel olmak", "Regular recovery sessions prevent chronic fatigue and overtraining syndrome.", "Düzenli toparlanma seansları kronik yorgunluğu ve aşırı antrenman sendromunu önler.", "The security guards didn't prevent unauthorized entry to the pitch.", "Güvenlik görevlileri sahaya yetkisiz girişi engelleyemedi/önlemedi.", "What measures can we take to prevent data loss during server upgrades?", "Sunucu güncellemeleri sırasında veri kaybını önlemek için ne gibi önlemler alabiliriz?"),
    (16, "avoid", "kaçınmak, sakınmak", "Wise students avoid cramming all study material the night before the exam.", "Akıllı öğrenciler sınavdan önceki gece tüm ders materyalini ezberlemeye çalışmaktan kaçınırlar.", "He didn't avoid eye contact during the formal interview.", "Resmi mülakat sırasında göz temasından kaçınmadı.", "Why should athletes avoid consuming processed sugar before matches?", "Sporcular maçlardan önce işlenmiş şeker tüketmekten neden kaçınmalıdır?"),
    (17, "solve", "çözmek", "Smart students can solve complex physics problems using logical methods.", "Zeki öğrenciler mantıksal yöntemler kullanarak karmaşık fizik problemlerini çözebilirler.", "We might solve this software bug if we analyze the code lines again.", "Kod satırlarını tekrar analiz edersek bu yazılım hatasını çözebiliriz.", "How can the engineering team solve the wireless latency issue?", "Mühendislik ekibi kablosuz gecikme sorununu nasıl çözebilir?"),
    (18, "create", "oluşturmak, yaratmak", "The design team creates interactive 3D models for the science fair.", "Tasarım ekibi bilim fuarı için etkileşimli 3D modeller oluşturur.", "New digital tools may create innovative learning opportunities for students.", "Yeni dijital araçlar öğrenciler için yenilikçi öğrenme fırsatları oluşturabilir.", "How did the programmer create such a responsive user interface?", "Programcı bu kadar duyarlı bir kullanıcı arayüzünü nasıl oluşturdu?"),
    (19, "develop", "geliştirmek", "Young coders can develop useful mobile apps with regular practice.", "Genç yazılımcılar düzenli pratikle kullanışlı mobil uygulamalar geliştirebilirler.", "The university might develop a new artificial intelligence research lab next year.", "Üniversite gelecek yıl yeni bir yapay zeka araştırma laboratuvarı geliştirebilir.", "What skills do athletes need to develop for international competitions?", "Sporcuların uluslararası yarışmalar için hangi becerileri geliştirmeleri gerekir?"),
    (20, "produce", "üretmek", "Solar panels can produce clean electrical energy even on cloudy days.", "Güneş panelleri bulutlu günlerde bile temiz elektrik enerjisi üretebilir.", "The local factory may produce more high-tech sports equipment in 2027.", "Yerel fabrika 2027 yılında daha fazla yüksek teknolojili spor ekipmanı üretebilir.", "How much biometric data does the wearable tracker produce per second?", "Giyilebilir takip cihazı saniyede ne kadar biyometrik veri üretir?"),
    (21, "provide", "sağlamak, temin etmek", "The school library can provide digital books and research journals for all students.", "Okul kütüphanesi tüm öğrenciler için dijital kitaplar ve araştırma dergileri sağlayabilir.", "The mentor might provide valuable guidance on university course selection.", "Danışman, üniversite ders seçimi konusunda değerli rehberlik sağlayabilir.", "Can the new platform provide real-time translation for video lessons?", "Yeni platform video dersler için gerçek zamanlı çeviri sağlayabilir mi?"),
    (22, "include", "içermek, kapsamak", "This comprehensive study guide includes practice tests and answer keys.", "Bu kapsamlı çalışma rehberi pratik testleri ve cevap anahtarlarını içerir.", "The summer camp program may include outdoor volleyball workshops.", "Yaz kampı programı açık hava voleybol atölyelerini içerebilir.", "Does the APK package include all 158 English verbs and stories?", "APK paketi 158 İngilizce fiilin ve hikayelerin tamamını içeriyor mu?"),
    (23, "contain", "içermek, barındırmak", "Fresh fruits contain high levels of vitamin C and essential minerals.", "Taze meyveler yüksek düzeyde C vitamini ve temel mineraller içerir.", "This organic sports product does not contain any artificial chemical preservatives.", "Bu organik spor ürünü hiçbir yapay kimyasal koruyucu içermez.", "Does this PDF document contain all required grammar formulas for LGS?", "Bu PDF dokümanı LGS için gereken tüm gramer formüllerini içeriyor mu?"),
    (24, "depend on", "-e bağlı olmak, güvenmek", "Academic success depends on consistent daily revision and self-discipline.", "Akademik başarı, tutarlı günlük tekrar ve öz disipline bağlıdır.", "The match outcome will depend on the team's tactical performance tomorrow.", "Maçın sonucu yarın takımın taktiksel performansına bağlı olacaktır.", "Can the players depend on the new goalkeeper during penalty shootouts?", "Oyuncular penaltı atışları sırasında yeni kaleciye güvenebilirler mi?"),
    (25, "belong to", "-e ait olmak", "This advanced physics textbook belongs to the school library.", "Bu ileri fizik ders kitabı okul kütüphanesine aittir.", "In ancient times, these historical artifacts belonged to a Roman family.", "Antik çağlarda bu tarihi eserler Romalı bir aileye aitti.", "Do you know who this specialized GPS tracking sensor belongs to?", "Bu özel GPS takip sensörünün kime ait olduğunu biliyor musun?"),
    (26, "prefer", "tercih etmek", "I prefer studying in quiet libraries to working in noisy cafes.", "Sessiz kütüphanelerde ders çalışmayı gürültülü kafelerde çalışmaya tercih ederim.", "She would rather read scientific articles than watch shallow TV shows.", "Yüzeysel TV programları izlemektense bilimsel makaleler okumayı tercih eder.", "Which learning method do you prefer for mastering English vocabulary?", "İngilizce kelimeleri öğrenmek için hangi öğrenme yöntemini tercih edersin?"),
    (27, "choose", "seçmek", "The committee has chosen the most creative science project for the award.", "Komite ödül için en yaratıcı bilim projesini seçti.", "He didn't choose the hard math option for his elective course.", "Seçmeli dersi için zor matematik seçeneğini seçmedi.", "Which sports science specialization will you choose for your masters degree?", "Yüksek lisansınız için hangi spor bilimi uzmanlığını seçeceksiniz?"),
    (28, "decide", "karar vermek", "They decided to organize an international robotics competition next month.", "Gelecek ay uluslararası bir robotik yarışması düzenlemeye karar verdiler.", "She decided on her high school preference after speaking with the counselor.", "Rehber öğretmenle konuştuktan sonra lise tercihine karar verdi.", "When did the club board decide to replace the stadium turf?", "Kulüp yönetimi stadyum çimlerini değiştirmeye ne zaman karar verdi?"),
    (29, "refuse", "reddetmek", "The principled coach refused to accept unfair compromise proposals.", "İlkeli antrenör haksız uzlaşma tekliflerini kabul etmeyi reddetti.", "He didn't refuse to help us when we asked for technical guidance.", "Teknik rehberlik istediğimizde bize yardım etmeyi reddetmedi.", "Why did the committee refuse the initial grant application?", "Komite ilk hibe başvurusunu neden reddetti?"),
    (30, "accept", "kabul etmek", "The journal accepted our research manuscript without major revisions.", "Dergi araştırma makalemizi büyük düzeltmeler olmadan kabul etti.", "She didn't accept the invitation to the international gala due to prior commitments.", "Önceki taahhütleri nedeniyle uluslararası gala davetini kabul etmedi.", "Will the sports academy accept new student applications next month?", "Spor akademisi gelecek ay yeni öğrenci başvurularını kabul edecek mi?"),
    (31, "offer", "teklif etmek, sunmak", "Prestigious universities offer full scholarships to high-achieving athletes.", "Prestijli üniversiteler yüksek başarılı sporculara tam burslar sunarlar/teklif ederler.", "The company didn't offer any compensation for the delayed shipment.", "Şirket geciken sevkiyat için hiçbir tazminat teklif etmedi.", "What kind of career opportunities does this computer science program offer?", "Bu bilgisayar bilimleri programı ne tür kariyer fırsatları sunuyor?"),
    (32, "invite", "davet etmek", "Organizers invite keynote speakers from leading European sports universities.", "Organizatörler önde gelen Avrupa spor üniversitelerinden ana konuşmacıları davet ederler.", "They didn't invite journalists to the private tactical training session.", "Özel taktik antrenman seansına gazetecileri davet etmediler.", "Whom did the faculty invite to deliver the commencement speech?", "Fakülte mezuniyet konuşmasını yapması için kimi davet etti?"),
    (33, "attend", "katılmak (ders/toplantı)", "Diligent students attend every single laboratory practice without absence.", "Çalışkan öğrenciler devamsızlık yapmadan her bir laboratuvar uygulamasına katılırlar.", "He couldn't attend the symposium in Switzerland because of visa delays.", "Vize gecikmeleri nedeniyle İsviçre'deki sempozyuma katılamadı.", "How many international researchers will attend the sports science congress?", "Spor bilimleri kongresine kaç uluslararası araştırmacı katılacak?"),
    (34, "join", "katılmak, üye olmak", "Freshmen join sports clubs and science societies during orientation week.", "Birinci sınıf öğrencileri uyum haftasında spor kulüplerine ve bilim topluluklarına katılırlar.", "She didn't join the swimming team because she preferred volleyball.", "Voleybolu tercih ettiği için yüzme takımına katılmadı.", "Can anyone join the weekly English speaking club meetings?", "Haftalık İngilizce konuşma kulübü toplantılarına herkes katılabilir mi?"),
    (35, "organize", "düzenlemek, organize etmek", "The university organizes an annual international sports festival in May.", "Üniversite mayıs ayında yıllık uluslararası bir spor festivali düzenler.", "They didn't organize the tournament schedule effectively, causing delays.", "Gecikmelere neden olacak şekilde turnuva takvimini etkili organize etmediler.", "Who will organize the national robotics championship next year?", "Gelecek yıl ulusal robotik şampiyonasını kim düzenleyecek?"),
    (36, "prepare", "hazırlamak", "Coaches prepare tailored training programs for elite sprinters.", "Antrenörler elit depar koşucuları için özel hazırlanmış antrenman programları hazırlarlar.", "She didn't prepare the experimental slides before the seminar began.", "Seminer başlamadan önce deneysel slaytları hazırlamadı.", "How do students prepare for the rigorous LGS English section?", "Öğrenciler zorlu LGS İngilizce bölümüne nasıl hazırlanırlar?"),
    (37, "plan", "planlamak", "Strategic thinkers plan their career moves several years in advance.", "Stratejik düşünürler kariyer adımlarını birkaç yıl önceden planlarlar.", "We didn't plan for such extreme rainy weather during the outdoor camp.", "Açık hava kampı sırasında böylesine aşırı yağmurlu bir havayı planlamamıştık.", "How do researchers plan long-term longitudinal biomechanical studies?", "Araştırmacılar uzun vadeli boylamsal biyomekanik çalışmaları nasıl planlarlar?"),
    (38, "manage", "başarmak, yönetmek", "Capable project leaders manage complex technical challenges with calm confidence.", "Yetenekli proje liderleri karmaşık teknik zorlukları sakin bir özgüvenle yönetirler/başarırlar.", "He couldn't manage his fatigue during the final five minutes of the match.", "Maçın son beş dakikasında yorgunluğunu yönetemedi.", "How did the small development team manage to launch the APK on schedule?", "Küçük geliştirme ekibi APK'yı planlanan zamanda çıkarmayı nasıl başardı?"),
    (39, "succeed", "başarılı olmak", "Athletes who train with relentless discipline always succeed in the long run.", "Tavizsiz bir disiplinle antrenman yapan sporcular uzun vadede her zaman başarılı olurlar.", "He didn't succeed on his first attempt, but he never gave up.", "İlk denemesinde başarılı olamadı ama asla pes etmedi.", "What qualities do students need to succeed in international academic exams?", "Öğrencilerin uluslararası akademik sınavlarda başarılı olmak için hangi niteliklere ihtiyacı vardır?"),
    (40, "fail", "başarısız olmak", "Those who never try new methods fail to discover innovative solutions.", "Yeni yöntemler denemeyenler yenilikçi çözümler keşfetmekte başarısız olurlar.", "The prototype sensor didn't fail during the extreme stress testing phase.", "Prototip sensör aşırı stres testi aşamasında başarısız olmadı/bozulmadı.", "Why do some machine learning models fail when tested on unseen real-world data?", "Bazı makine öğrenmesi modelleri görülmemiş gerçek dünya verilerinde test edildiğinde neden başarısız olur?"),
    (41, "continue", "devam etmek", "Passionate scientists continue their experiments late into the night.", "Tutkulu bilim insanları deneylerine gecenin geç saatlerine kadar devam ederler.", "The match didn't continue after the sudden heavy thunderstorm began.", "Ani şiddetli fırtına başladıktan sonra maç devam etmedi.", "Will the research team continue the VR soccer tracking project next year?", "Araştırma ekibi VR futbol takip projesine gelecek yıl devam edecek mi?"),
    (42, "complete", "tamamlamak", "Ela and Leo completed their secret research journal investigation.", "Ela ve Leo gizli araştırma günlüğü incelemelerini tamamladılar.", "He hasn't completed all eighty English verb flashcards yet.", "Seksen İngilizce fiil flaş kartının tamamını henüz tamamlamadı.", "When will the construction workers complete the new university stadium?", "İnşaat işçileri yeni üniversite stadyumunu ne zaman tamamlayacak?"),
    (43, "discover", "keşfetmek", "America was discovered by Christopher Columbus in 1492.", "Amerika 1492 yılında Kristof Kolomb tarafından keşfedildi.", "Astronomers have discovered a new earth-like exoplanet in deep space.", "Gökbilimciler uzayın derinliklerinde dünya benzeri yeni bir ötegezegen keşfettiler.", "What secret chamber did Ela discover underneath the old academy gym?", "Ela eski akademi spor salonunun altında hangi gizli odayı keşfetti?"),
    (44, "invent", "icat etmek", "Visionary engineers invent smart devices that transform daily life.", "Vizyoner mühendisler günlük hayatı dönüştüren akıllı cihazlar icat ederler.", "He didn't invent the algorithm alone; it was a collaborative team effort.", "Algoritmayı tek başına icat etmedi; bu işbirlikçi bir ekip çalışmasıydı.", "Who invented the first digital wireless photocell sprint timer?", "İlk dijital kablosuz fotosel depar zamanlayıcısını kim icat etti?"),
    (45, "collect", "toplamak, biriktirmek", "Biomechanical sensors collect thousands of motion data points per second.", "Biyomekanik sensörler saniyede binlerce hareket veri noktası toplarlar.", "The assistant didn't collect the consent forms before the experiment started.", "Asistan deney başlamadan önce onay formlarını toplamadı.", "How do researchers collect objective physiological metrics from athletes?", "Araştırmacılar sporculardan objektif fizyolojik metrikleri nasıl toplarlar?"),
    (46, "share", "paylaşmak", "Generous researchers share their open-source Python code with the community.", "Cömert araştırmacılar açık kaynaklı Python kodlarını toplulukla paylaşırlar.", "She didn't share her experimental findings before publication.", "Yayınlanmadan önce deneysel bulgularını paylaşmadı.", "Will you share the updated PDF vocabulary list with your classmates?", "Güncellenmiş PDF kelime listesini sınıf arkadaşlarınla paylaşacak mısın?"),
    (47, "borrow", "ödünç almak", "Students can borrow up to five research books from the university library.", "Öğrenciler üniversite kütüphanesinden en fazla beş araştırma kitabı ödünç alabilirler.", "He didn't borrow any sports gear from his teammates.", "Takım arkadaşlarından hiçbir spor ekipmanı ödünç almadı.", "May I borrow your digital stylus pen for taking notes during the lecture?", "Ders sırasında not almak için dijital tablet kaleminizi ödünç alabilir miyim?"),
    (48, "lend", "ödünç vermek", "The sports laboratory lends calibration tools to partner institutions.", "Spor laboratuvarı ortak kurumlara kalibrasyon araçları ödünç verir.", "She didn't lend her private study notes to anyone before the final exam.", "Final sınavından önce özel çalışma notlarını hiç kimseye ödünç vermedi.", "Can you lend me your portable charger before the tournament begins?", "Turnuva başlamadan önce taşınabilir şarj cihazını bana ödünç verebilir misin?"),
    (49, "spend", "harcamak (para/zaman)", "Dedicated learners spend at least thirty minutes on English practice daily.", "Özverili öğrenciler günlük en az otuz dakikayı İngilizce pratiğine harcarlar.", "The club didn't spend unnecessary funds on unproven training gadgets.", "Kulüp kanıtlanmamış antrenman aletlerine gereksiz bütçe harcamadı.", "How much time do elite gymnasts spend on flexibility routines?", "Elit jimnastikçiler esneklik rutinlerine ne kadar zaman harcarlar?"),
    (50, "save", "biriktirmek, kurtarmak", "He saved money every month because he planned to buy a professional camera.", "Profesyonel bir kamera almayı planladığı için her ay para biriktirdi.", "She practiced daily; as a result, she saved the team from losing.", "Her gün pratik yaptı; sonuç olarak takımı kaybetmekten kurtardı.", "How can students save time while studying complex grammatical structures?", "Öğrenciler karmaşık gramer yapılarını çalışırken nasıl zaman tasarrufu yapabilirler/biriktirebilirler?"),
    (51, "waste", "boşa harcamak, israf etmek", "Disciplined students do not waste valuable study hours on mindless scrolling.", "Disiplinli öğrenciler değerli çalışma saatlerini amaçsız kaydırmayla boşa harcamazlar.", "He didn't waste his energy during the preliminary qualifying heats.", "Ön eleme turları sırasında enerjisini boşa harcamadı.", "Why did the management waste budget on incompatible software licenses?", "Yönetim uyumsuz yazılım lisanslarına bütçeyi neden boşa harcadı?"),
    (52, "earn", "kazanmak (para/hak/saygı)", "Diligent researchers earn prestigious international science awards.", "Çalışkan araştırmacılar prestijli uluslararası bilim ödülleri kazanırlar.", "The junior athlete didn't earn a starting spot in the roster yet.", "Genç sporcu henüz kadroda ilk 11 yerini kazanamadı.", "How much do top sports data analysts earn in European clubs?", "Avrupa kulüplerindeki en iyi spor veri analistleri ne kadar kazanıyor?"),
    (53, "communicate", "iletişim kurmak", "Effective coaches communicate tactical instructions clearly during timeouts.", "Etkili antrenörler mola anlarında taktik talimatları net bir şekilde iletişim kurarak aktarırlar.", "The wireless sensors didn't communicate properly with the central computer.", "Kablosuz sensörler ana bilgisayarla düzgün iletişim kurmadı.", "How do multinational research teams communicate across different time zones?", "Çok uluslu araştırma ekipleri farklı zaman dilimleri arasında nasıl iletişim kurarlar?"),
    (54, "introduce", "tanıtmak, takdim etmek", "The professor introduced the new biomechanical measurement system to the class.", "Profesör sınıfa yeni biyomekanik ölçüm sistemini tanıttı.", "She didn't introduce her research assistant before starting the presentation.", "Sunuma başlamadan önce araştırma asistanını tanıtmadı.", "When will the technology company introduce its next-generation VR headset?", "Teknoloji şirketi yeni nesil VR başlığını ne zaman tanıtacak?"),
    (55, "greet", "selamlamak, karşılamak", "Friendly coaches greet every player with a handshake before morning practice.", "Güler yüzlü antrenörler sabah antrenmanından önce her oyuncuyu el sıkışarak selamlarlar.", "The security guards didn't greet visitors at the main campus gate.", "Güvenlik görevlileri ana kampüs kapısında ziyaretçileri selamlamadı.", "How do athletes from different cultures greet each other at the Olympic Village?", "Farklı kültürlerden gelen sporcular Olimpiyat Köyü'nde birbirlerini nasıl selamlarlar?"),
    (56, "reply", "yanıtlamak, cevap vermek", "The support desk replies to user inquiries within twenty-four hours.", "Destek masası kullanıcı sorularına yirmi dört saat içinde yanıt verir.", "He didn't reply to the professor's email regarding the research proposal.", "Profesörün araştırma önerisiyle ilgili e-postasına yanıt vermedi.", "How quickly did the conference organizers reply to your invitation acceptance?", "Konferans organizatörleri davet kabulünüze ne kadar çabuk yanıt verdi?"),
    (57, "complain", "şikâyet etmek", "The players complained that the training schedule was too intensive.", "Oyuncular antrenman programının çok yoğun olduğundan şikayet ettiler.", "He complained about the noise in the dormitory library.", "Yurt kütüphanesindeki gürültüden şikayet etti.", "Why do customers complain about the battery life of the wireless trackers?", "Müşteriler kablosuz takip cihazlarının pil ömründen neden şikayet ediyorlar?"),
    (58, "apologize", "özür dilemek", "Sportsmen apologize immediately when they accidentally commit an aggressive foul.", "Sporcular kazara agresif bir faul yaptıklarında derhal özür dilerler.", "He didn't apologize for his tardiness to the morning tactical briefing.", "Sabah taktik brifingine geç kaldığı için özür dilemedi.", "Did the referee apologize for the controversial VAR decision?", "Hakem tartışmalı VAR kararı için özür diledi mi?"),
    (59, "promise", "söz vermek", "The team captain promised to lead by example throughout the championship.", "Takım kaptanı şampiyona boyunca örnek teşkil ederek liderlik yapacağına söz verdi.", "He didn't promise any guarantees regarding early project delivery.", "Projenin erken teslimiyle ilgili hiçbir garanti sözü vermedi.", "What did the sports minister promise to young developing athletes?", "Spor bakanı genç gelişmekte olan sporculara ne söz verdi?"),
    (60, "trust", "güvenmek", "Teammates must trust each other completely during high-pressure games.", "Takım arkadaşları yüksek baskı altındaki maçlarda birbirlerine tamamen güvenmelidir.", "The head coach didn't trust the unverified data from the uncalibrated sensor.", "Başantrenör kalibre edilmemiş sensörden gelen doğrulanmamış verilere güvenmedi.", "Can researchers trust the automated predictions of machine learning algorithms?", "Araştırmacılar makine öğrenmesi algoritmalarının otomatik tahminlerine güvenebilir mi?"),
    (61, "respect", "saygı duymak", "Athletes must respect the referee's decisions even in heated moments.", "Sporcular hararetli anlarda bile hakemin kararlarına saygı duymalıdır.", "He didn't respect the laboratory safety protocols and was reprimanded.", "Laboratuvar güvenlik protokollerine saygı göstermedi ve uyarıldı.", "How do great coaches earn the genuine respect of their players?", "Büyük antrenörler oyuncularının gerçek saygısını nasıl kazanırlar?"),
    (62, "argue", "tartışmak (çekişmek)", "Professional players don't waste energy arguing with match officials.", "Profesyonel oyuncular maç hakemleriyle tartışarak enerji kaybetmezler.", "They didn't argue about the tactics because everyone agreed on the game plan.", "Taktikler hakkında tartışmadılar çünkü herkes oyun planında hemfikirdi.", "Why were the two analysts arguing over the statistical model results?", "İki analist istatistiksel model sonuçları üzerinde neden tartışıyorlardı?"),
    (63, "agree", "aynı fikirde olmak, anlaşmak", "All committee members agreed that the research proposal met high standards.", "Tüm komite üyeleri araştırma önerisinin yüksek standartları karşıladığı konusunda aynı fikirdeydi.", "She didn't agree with the coach's defensive strategy for the final match.", "Final maçı için antrenörün savunma stratejisine katılmadı/aynı fikirde olmadı.", "Do you agree with the findings published in the sports biomechanics paper?", "Spor biyomekaniği makalesinde yayınlanan bulgulara katılıyor musun?"),
    (64, "disagree", "katılmamak, farklı fikirde olmak", "Scientists may respectfully disagree on theoretical interpretations of data.", "Bilim insanları verilerin teorik yorumları konusunda saygıyla farklı fikirde olabilirler.", "The head coach didn't disagree with the doctor's injury assessment.", "Başantrenör doktorun sakatlık değerlendirmesine karşı çıkmadı/farklı fikirde olmadı.", "Why did some panel members disagree with the new scoring criteria?", "Bazı panel üyeleri yeni puanlama kriterlerine neden katılmadılar?"),
    (65, "realize", "fark etmek, kavramak", "I wish I realized the importance of daily revision sooner.", "Keşke günlük tekrarın önemini daha önce fark etseydim.", "He suddenly realized that he had left his keys in the gym.", "Anahtarlarını spor salonunda unuttuğunu aniden fark etti.", "When did the researchers realize that the sensor calibration was inverted?", "Araştırmacılar sensör kalibrasyonunun ters çevrildiğini ne zaman fark ettiler?"),
    (66, "imagine", "hayal etmek", "Creative engineers imagine groundbreaking technological solutions to complex problems.", "Yaratıcı mühendisler karmaşık problemlere çığır açan teknolojik çözümler hayal ederler.", "She couldn't imagine winning the international championship in her debut season.", "İlk sezonunda uluslararası şampiyonluğu kazanacağını hayal bile edemezdi.", "Can you imagine how sports training will look in the year 2040?", "2040 yılında spor antrenmanlarının nasıl görüneceğini hayal edebiliyor musun?"),
    (67, "expect", "beklemek, ummak", "Coaches expect absolute dedication and punctual attendance from every player.", "Antrenörler her oyuncudan mutlak özveri ve dakik katılım beklerler.", "The research team didn't expect such high accuracy from the prototype.", "Araştırma ekibi prototipten böylesine yüksek bir doğruluk beklemiyordu.", "What results do you expect from the upcoming physical agility battery test?", "Yaklaşan fiziksel çeviklik batarya testinden ne tür sonuçlar bekliyorsunuz?"),
    (68, "notice", "fark etmek, dikkat etmek", "The observant coach noticed a subtle imbalance in the sprinter's stride.", "Dikkatli antrenör depar koşucusunun adımında ince bir dengesizlik fark etti.", "She didn't notice the warning light flashing on the biomechanical device.", "Biyomekanik cihazda yanıp sönen uyarı ışığını fark etmedi.", "Did you notice any improvement in your English speaking fluency this week?", "Bu hafta İngilizce konuşma akıcılığında herhangi bir gelişme fark ettin mi?"),
    (69, "seem", "görünmek", "The new training protocol seems to be highly effective for sprinters.", "Yeni antrenman protokolü depar koşucuları için son derece etkili görünüyor.", "The exam questions didn't seem as intimidating after proper preparation.", "Düzgün bir hazırlıktan sonra sınav soruları o kadar göz korkutucu görünmedi.", "Why does the sensor measurement seem inconsistent across different trials?", "Sensör ölçümü farklı denemeler arasında neden tutarsız görünüyor?"),
    (70, "appear", "ortaya çıkmak, görünmek", "Promising young talents appear regularly in the university sports scouting system.", "Umut vadeden genç yetenekler üniversite spor yetenek tarama sisteminde düzenli olarak ortaya çıkarlar.", "The missing data files didn't appear in the cloud backup directory.", "Kayıp veri dosyaları bulut yedekleme dizininde görünmedi/ortaya çıkmadı.", "When did the first symptoms of muscle fatigue appear during the test?", "Test sırasında kas yorgunluğunun ilk belirtileri ne zaman ortaya çıktı?"),
    (71, "disappear", "kaybolmak, yok olmak", "Muscle soreness will disappear within forty-eight hours with proper recovery.", "Kas ağrısı uygun toparlanmayla kırk sekiz saat içinde kaybolacaktır.", "The software glitch didn't disappear even after restarting the computer.", "Bilgisayarı yeniden başlattıktan sonra bile yazılım hatası kaybolmadı.", "Where did the experimental sensor cables disappear after yesterday's trial?", "Dünkü denemeden sonra deneysel sensör kabloları nereye kayboldu?"),
    (72, "affect", "etkilemek (fiil)", "Lack of sleep negatively affects athletes' reaction time and cognitive focus.", "Uyku eksikliği sporcuların reaksiyon süresini ve bilişsel odağını olumsuz etkiler.", "The outdoor football match was heavily affected by the stormy weather.", "Açık hava futbol maçı fırtınalı havadan ciddi şekilde etkilendi.", "How does dehydration affect an athlete's physical stamina in long matches?", "Susuz kalma uzun maçlarda bir sporcunun fiziksel dayanıklılığını nasıl etkiler?"),
    (73, "influence", "etkilemek (nüfuz etmek)", "Inspiring mentors influence students' academic career choices profoundly.", "İlham veren danışmanlar öğrencilerin akademik kariyer seçimlerini derinden etkilerler.", "The noisy spectators didn't influence the shooter's laser-sharp focus.", "Gürültülü seyirciler atıcının lazer keskinliğindeki odağını etkilemedi.", "What environmental factors influence player decision-making speed in VR?", "VR'da oyuncunun karar verme hızını hangi çevresel faktörler etkiler?"),
    (74, "require", "gerektirmek, zorunlu kılmak", "Elite sports performance requires years of dedicated daily practice.", "Elit spor performansı yıllarca süren özverili günlük pratik gerektirir.", "The university rule requires all athletes to wear protective headgear.", "Üniversite kuralı tüm sporcuların koruyucu başlık takmasını zorunlu kılar/gerektirir.", "What documentation does the tournament committee require for entry?", "Turnuva komitesi katılım için hangi belgeleri gerektiriyor/istiyor?"),
    (75, "allow", "izin vermek, olanak tanımak", "The coach allows athletes to rest on Sunday afternoons.", "Antrenör sporcuların pazar öğleden sonraları dinlenmesine izin verir.", "The laboratory rules do not allow food or beverages inside testing rooms.", "Laboratuvar kuralları test odalarının içinde yiyecek veya içeceklere izin vermez.", "Does the simulation software allow custom sensor configuration parameters?", "Simülasyon yazılımı özel sensör yapılandırma parametrelerine izin veriyor mu?"),
    (76, "replace", "yerine koymak, değiştirmek", "Technicians replace worn-out sensor cables before every competitive trial.", "Teknisyenler her müsabaka denemesinden önce yıpranmış sensör kablolarını değiştirirler/yerine koyarlar.", "The coach didn't replace the tired midfielder until the eighty-fifth minute.", "Antrenör seksen beşinci dakikaya kadar yorgun orta saha oyuncusunu değiştirmedi.", "When should we replace the photocell optical batteries for optimal signal?", "Optimum sinyal için fotosel optik pillerini ne zaman değiştirmeliyiz?"),
    (77, "improve", "iyileştirmek, daha iyiye gitmek", "Targeted physical therapy improves joint mobility and prevents re-injury.", "Hedefe yönelik fizik tedavi eklem hareketliliğini iyileştirir ve yeniden sakatlanmayı önler.", "The patient's condition didn't improve until specialized treatment began.", "Özel tedavi başlayana kadar hastanın durumu iyileşmedi.", "How can students improve their English pronunciation with audio TTS tools?", "Öğrenciler sesli TTS araçlarıyla İngilizce telaffuzlarını nasıl iyileştirebilirler?"),
    (78, "recognize", "tanımak, farkına varmak", "Modern computer vision models recognize human posture and athletic movements instantly.", "Modern bilgisayarlı görü modelleri insan duruşunu ve atletik hareketleri anında tanırlar.", "He didn't recognize his former teammate after ten years apart.", "On yıl aradan sonra eski takım arkadaşını tanıyamadı.", "How does the AI software recognize individual player sprint trajectories?", "Yapay zeka yazılımı bireysel oyuncu depar yörüngelerini nasıl tanır?")
]

# Irregular forms dictionary
IRREGULAR_FORMS = {
    "be": ("be / am, is, are", "was / were", "been"),
    "have": ("have / has", "had", "had"),
    "do": ("do / does", "did", "done"),
    "make": ("make / makes", "made", "made"),
    "go": ("go / goes", "went", "gone"),
    "come": ("come / comes", "came", "come"),
    "get": ("get / gets", "got", "got / gotten"),
    "give": ("give / gives", "gave", "given"),
    "take": ("take / takes", "took", "taken"),
    "bring": ("bring / brings", "brought", "brought"),
    "leave": ("leave / leaves", "left", "left"),
    "arrive": ("arrive / arrives", "arrived", "arrived"),
    "see": ("see / sees", "saw", "seen"),
    "watch": ("watch / watches", "watched", "watched"),
    "look": ("look / looks", "looked", "looked"),
    "hear": ("hear / hears", "heard", "heard"),
    "listen": ("listen / listens", "listened", "listened"),
    "speak": ("speak / speaks", "spoke", "spoken"),
    "say": ("say / says", "said", "said"),
    "tell": ("tell / tells", "told", "told"),
    "ask": ("ask / asks", "asked", "asked"),
    "answer": ("answer / answers", "answered", "answered"),
    "know": ("know / knows", "knew", "known"),
    "think": ("think / thinks", "thought", "thought"),
    "understand": ("understand / understands", "understood", "understood"),
    "learn": ("learn / learns", "learned / learnt", "learned / learnt"),
    "teach": ("teach / teaches", "taught", "taught"),
    "study": ("study / studies", "studied", "studied"),
    "read": ("read / reads", "read (red)", "read (red)"),
    "write": ("write / writes", "wrote", "written"),
    "use": ("use / uses", "used", "used"),
    "open": ("open / opens", "opened", "opened"),
    "close": ("close / closes", "closed", "closed"),
    "start": ("start / starts", "started", "started"),
    "finish": ("finish / finishes", "finished", "finished"),
    "stop": ("stop / stops", "stopped", "stopped"),
    "try": ("try / tries", "tried", "tried"),
    "help": ("help / helps", "helped", "helped"),
    "need": ("need / needs", "needed", "needed"),
    "want": ("want / wants", "wanted", "wanted"),
    "like": ("like / likes", "liked", "liked"),
    "love": ("love / loves", "loved", "loved"),
    "hate": ("hate / hates", "hated", "hated"),
    "eat": ("eat / eats", "ate", "eaten"),
    "drink": ("drink / drinks", "drank", "drunk"),
    "cook": ("cook / cooks", "cooked", "cooked"),
    "buy": ("buy / buys", "bought", "bought"),
    "sell": ("sell / sells", "sold", "sold"),
    "pay": ("pay / pays", "paid", "paid"),
    "find": ("find / finds", "found", "found"),
    "lose": ("lose / loses", "lost", "lost"),
    "keep": ("keep / keeps", "kept", "kept"),
    "put": ("put / puts", "put", "put"),
    "carry": ("carry / carries", "carried", "carried"),
    "wear": ("wear / wears", "wore", "worn"),
    "wash": ("wash / washes", "washed", "washed"),
    "clean": ("clean / cleans", "cleaned", "cleaned"),
    "sleep": ("sleep / sleeps", "slept", "slept"),
    "wake up": ("wake up / wakes up", "woke up", "woken up"),
    "sit": ("sit / sits", "sat", "sat"),
    "stand": ("stand / stands", "stood", "stood"),
    "walk": ("walk / walks", "walked", "walked"),
    "run": ("run / runs", "ran", "run"),
    "jump": ("jump / jumps", "jumped", "jumped"),
    "swim": ("swim / swims", "swam", "swum"),
    "drive": ("drive / drives", "drove", "driven"),
    "ride": ("ride / rides", "rode", "ridden"),
    "travel": ("travel / travels", "traveled", "traveled"),
    "call": ("call / calls", "called", "called"),
    "meet": ("meet / meets", "met", "met"),
    "visit": ("visit / visits", "visited", "visited"),
    "live": ("live / lives", "lived", "lived"),
    "work": ("work / works", "worked", "worked"),
    "play": ("play / plays", "played", "played"),
    "win": ("win / wins", "won", "won"),
    "remember": ("remember / remembers", "remembered", "remembered"),
    "forget": ("forget / forgets", "forgot", "forgotten"),
    "choose": ("choose / chooses", "chose", "chosen"),
    "wait": ("wait / waits", "waited", "waited"),
    "show": ("show / shows", "showed", "shown"),
    "achieve": ("achieve / achieves", "achieved", "achieved"),
    "improve": ("improve / improves", "improved", "improved"),
    "increase": ("increase / increases", "increased", "increased"),
    "reduce": ("reduce / reduces", "reduced", "reduced"),
    "compare": ("compare / compares", "compared", "compared"),
    "describe": ("describe / describes", "described", "described"),
    "explain": ("explain / explains", "explained", "explained"),
    "discuss": ("discuss / discusses", "discussed", "discussed"),
    "suggest": ("suggest / suggests", "suggested", "suggested"),
    "recommend": ("recommend / recommends", "recommended", "recommended"),
    "advise": ("advise / advises", "advised", "advised"),
    "encourage": ("encourage / encourages", "encouraged", "encouraged"),
    "support": ("support / supports", "supported", "supported"),
    "protect": ("protect / protects", "protected", "protected"),
    "prevent": ("prevent / prevents", "prevented", "prevented"),
    "avoid": ("avoid / avoids", "avoided", "avoided"),
    "solve": ("solve / solves", "solved", "solved"),
    "create": ("create / creates", "created", "created"),
    "develop": ("develop / develops", "developed", "developed"),
    "produce": ("produce / produces", "produced", "produced"),
    "provide": ("provide / provides", "provided", "provided"),
    "include": ("include / includes", "included", "included"),
    "contain": ("contain / contains", "contained", "contained"),
    "depend on": ("depend / depends on", "depended on", "depended on"),
    "belong to": ("belong / belongs to", "belonged to", "belonged to"),
    "prefer": ("prefer / prefers", "preferred", "preferred"),
    "decide": ("decide / decides", "decided", "decided"),
    "refuse": ("refuse / refuses", "refused", "refused"),
    "accept": ("accept / accepts", "accepted", "accepted"),
    "offer": ("offer / offers", "offered", "offered"),
    "invite": ("invite / invites", "invited", "invited"),
    "attend": ("attend / attends", "attended", "attended"),
    "join": ("join / joins", "joined", "joined"),
    "organize": ("organize / organizes", "organized", "organized"),
    "prepare": ("prepare / prepares", "prepared", "prepared"),
    "plan": ("plan / plans", "planned", "planned"),
    "manage": ("manage / manages", "managed", "managed"),
    "succeed": ("succeed / succeeds", "succeeded", "succeeded"),
    "fail": ("fail / fails", "failed", "failed"),
    "continue": ("continue / continues", "continued", "continued"),
    "complete": ("complete / completes", "completed", "completed"),
    "discover": ("discover / discovers", "discovered", "discovered"),
    "invent": ("invent / invents", "invented", "invented"),
    "collect": ("collect / collects", "collected", "collected"),
    "share": ("share / shares", "shared", "shared"),
    "borrow": ("borrow / borrows", "borrowed", "borrowed"),
    "lend": ("lend / lends", "lent", "lent"),
    "spend": ("spend / spends", "spent", "spent"),
    "save": ("save / saves", "saved", "saved"),
    "waste": ("waste / wastes", "wasted", "wasted"),
    "earn": ("earn / earns", "earned", "earned"),
    "communicate": ("communicate / communicates", "communicated", "communicated"),
    "introduce": ("introduce / introduces", "introduced", "introduced"),
    "greet": ("greet / greets", "greeted", "greeted"),
    "reply": ("reply / replies", "replied", "replied"),
    "complain": ("complain / complains", "complained", "complained"),
    "apologize": ("apologize / apologizes", "apologized", "apologized"),
    "promise": ("promise / promises", "promised", "promised"),
    "trust": ("trust / trusts", "trusted", "trusted"),
    "respect": ("respect / respects", "respected", "respected"),
    "argue": ("argue / argues", "argued", "argued"),
    "agree": ("agree / agrees", "agreed", "agreed"),
    "disagree": ("disagree / disagrees", "disagreed", "disagreed"),
    "realize": ("realize / realizes", "realized", "realized"),
    "imagine": ("imagine / imagines", "imagined", "imagined"),
    "expect": ("expect / expects", "expected", "expected"),
    "notice": ("notice / notices", "noticed", "noticed"),
    "seem": ("seem / seems", "seemed", "seemed"),
    "appear": ("appear / appears", "appeared", "appeared"),
    "disappear": ("disappear / disappears", "disappeared", "disappeared"),
    "affect": ("affect / affects", "affected", "affected"),
    "influence": ("influence / influences", "influenced", "influenced"),
    "require": ("require / requires", "required", "required"),
    "allow": ("allow / allows", "allowed", "allowed"),
    "replace": ("replace / replaces", "replaced", "replaced"),
    "recognize": ("recognize / recognizes", "recognized", "recognized")
}

def get_forms(verb_str):
    v_clean = verb_str.lower().strip()
    if v_clean in IRREGULAR_FORMS:
        return IRREGULAR_FORMS[v_clean]
    v_base = v_clean
    if v_base.endswith('e'):
        v_ed = v_base + 'd'
    elif v_base.endswith('y') and len(v_base) > 2 and v_base[-2] not in 'aeiou':
        v_ed = v_base[:-1] + 'ied'
    else:
        v_ed = v_base + 'ed'
    return (f"{v_base} / {v_base}s", v_ed, v_ed)

def build_full_dataset():
    # Load existing curriculum to keep grammar modules, stories, and videos
    existing_json = "/Users/alionurcerrah/Desktop/İngilizce Kelime/data/curriculum.json"
    with open(existing_json, "r", encoding="utf-8") as f:
        data = json.load(f)

    all_verbs = []
    
    # Process A2 List (80 Verbs)
    for num, verb_en, verb_tr, pos_en, pos_tr, neg_en, neg_tr, que_en, que_tr in A2_VERBS_RAW:
        v1, v2, v3 = get_forms(verb_en)
        # Determine category
        cat = "Temel Eylem & Rutin"
        if num <= 10: cat = "Temel Eylem Fiilleri (1-10)"
        elif num <= 20: cat = "Algı, Hareket ve İletişim (11-20)"
        elif num <= 30: cat = "Düşünce, Bilişsel ve Eğitim (21-30)"
        elif num <= 40: cat = "Rutin, İhtiyaç ve Tercih (31-40)"
        elif num <= 50: cat = "Yemek, Alışveriş ve Finans (41-50)"
        elif num <= 60: cat = "Fiziksel Eylemler ve Günlük Yaşam (51-60)"
        elif num <= 70: cat = "Hareket, Seyahat ve İletişim (61-70)"
        else: cat = "Yaşam Deneyimleri ve Genel Gerçekler (71-80)"

        all_verbs.append({
            "id": num,
            "unique_id": f"A2_{num}",
            "level": "A2",
            "level_label": "A2 Seviyesi (Temel)",
            "verb": verb_en,
            "meaning": verb_tr,
            "module": (num - 1) // 10 + 10,
            "forms": {"v1": v1, "v2": v2, "v3": v3},
            "sentences": {
                "positive": {"en": pos_en, "tr": pos_tr},
                "negative": {"en": neg_en, "tr": neg_tr},
                "question": {"en": que_en, "tr": que_tr}
            },
            "category": cat,
            "source": "A2 80 Temel Fiil"
        })

    # Process B1 List (78 Verbs)
    for num, verb_en, verb_tr, pos_en, pos_tr, neg_en, neg_tr, que_en, que_tr in B1_VERBS_RAW:
        v1, v2, v3 = get_forms(verb_en)
        cat = "Akademik ve İleri B1"
        if num <= 16: cat = "Akademik Gelişim, Öneri ve Güvenlik (1-16)"
        elif num <= 28: cat = "Problem Çözme, Üretim ve Tercih (17-28)"
        elif num <= 40: cat = "Organizasyon, Karar ve Başarı (29-40)"
        elif num <= 52: cat = "Keşif, Paylaşım ve Finans (41-52)"
        elif num <= 64: cat = "Sosyal İletişim, Anlaşma ve Tartışma (53-64)"
        else: cat = "Zihinsel Süreç, Algı ve Etki (65-78)"

        all_verbs.append({
            "id": 80 + num,
            "list_num": num,
            "unique_id": f"B1_{num}",
            "level": "B1",
            "level_label": "B1 Seviyesi (İleri)",
            "verb": verb_en,
            "meaning": verb_tr,
            "module": (num - 1) // 10 + 1,
            "forms": {"v1": v1, "v2": v2, "v3": v3},
            "sentences": {
                "positive": {"en": pos_en, "tr": pos_tr},
                "negative": {"en": neg_en, "tr": neg_tr},
                "question": {"en": que_en, "tr": que_tr}
            },
            "category": cat,
            "source": "B1 78 İleri Fiil"
        })

    data["verbs"] = all_verbs
    data["stats"] = {
        "total_verbs": len(all_verbs),
        "a2_count": len(A2_VERBS_RAW),
        "b1_count": len(B1_VERBS_RAW)
    }

    # Save to JSON
    with open(existing_json, "w", encoding="utf-8") as out:
        json.dump(data, out, ensure_ascii=False, indent=2)

    # Save to JS
    with open("/Users/alionurcerrah/Desktop/İngilizce Kelime/js/app_data.js", "w", encoding="utf-8") as out:
        out.write("const APP_DATA = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n")
        out.write("if (typeof module !== 'undefined' && module.exports) { module.exports = APP_DATA; }\n")

    print(f"COMPLETE: Generated {len(all_verbs)} total verbs (A2: {len(A2_VERBS_RAW)}, B1: {len(B1_VERBS_RAW)})")

if __name__ == "__main__":
    build_full_dataset()
