import json
import os

# Import original 80 A2 + 78 B1 verbs from generate_full_curriculum
from generate_full_curriculum import A2_VERBS_RAW, B1_VERBS_RAW, get_forms

# Complete Curated Adverbs (40 Zarflar)
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

# Complete Curated Conjunctions (30 Bağlaçlar)
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

# Complete Curated Prepositions (20 Edatlar)
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

# Complete Curated Adjectives (20 Sıfatlar)
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

def build_comprehensive_database():
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

    # 3. Zarflar (Adverbs)
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

    # 4. Bağlaçlar (Conjunctions)
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

    # 5. Edatlar (Prepositions)
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

    # 6. Sıfatlar (Adjectives)
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

    # Map legacy verbs list for backwards compatibility
    legacy_verbs = [it for it in all_items if it["type"] == "verb"]
    for v in legacy_verbs:
        v["verb"] = v["word"]

    data["all_words"] = all_items
    data["verbs"] = legacy_verbs
    data["stats"] = {
        "total_items": len(all_items),
        "verbs_count": len(legacy_verbs),
        "adverbs_count": len(ADVERBS_DATA),
        "conjunctions_count": len(CONJUNCTIONS_DATA),
        "prepositions_count": len(PREPOSITIONS_DATA),
        "adjectives_count": len(ADJECTIVES_DATA)
    }

    # Save to JSON
    with open(existing_json, "w", encoding="utf-8") as out:
        json.dump(data, out, ensure_ascii=False, indent=2)

    # Save to JS
    with open("/Users/alionurcerrah/Desktop/İngilizce Kelime/js/app_data.js", "w", encoding="utf-8") as out:
        out.write("const APP_DATA = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n")
        out.write("if (typeof module !== 'undefined' && module.exports) { module.exports = APP_DATA; }\n")

    print(f"SUCCESS: Built {len(all_items)} total vocabulary items (Verbs: {len(legacy_verbs)}, Adverbs: {len(ADVERBS_DATA)}, Conjunctions: {len(CONJUNCTIONS_DATA)}, Prepositions: {len(PREPOSITIONS_DATA)}, Adjectives: {len(ADJECTIVES_DATA)})")

if __name__ == "__main__":
    build_comprehensive_database()
