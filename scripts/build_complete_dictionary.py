import json
import os
from generate_full_curriculum import A2_VERBS_RAW, B1_VERBS_RAW, get_forms
from data_definitions import PHRASAL_VERBS_DATA, NOUNS_DATA, PREPOSITIONS_DATA, ADJECTIVES_DATA, IDIOMS_DATA

# 50 Complete Curated Adverbs (Zarflar)
ADVERBS_DATA = [
    ("quickly", "hızlıca, çabucak", "Durum Zarfı (Manner)", "Athletes must react quickly to visual cues.", "Sporcular görsel işaretlere hızlıca tepki vermelidir.", "He didn't run quickly enough to win the sprint.", "Deparı kazanmak için yeterince hızlıca koşmadı.", "Why did you drive so quickly on the wet road?", "Islak yolda neden bu kadar hızlıca araba sürdün?"),
    ("carefully", "dikkatlice, özenle", "Durum Zarfı (Manner)", "She read the test instructions carefully.", "Sınav talimatlarını dikkatlice okudu.", "He didn't handle the delicate sensor carefully.", "Hassas sensörü dikkatlice tutmadı/kullanmadı.", "Did you check the biometric calibration carefully?", "Biyometrik kalibrasyonu dikkatlice kontrol ettin mi?"),
    ("fluently", "akıcı bir şekilde", "Durum Zarfı (Manner)", "Our mentor speaks English and German fluently.", "Danışmanımız İngilizce ve Almanca'yı akıcı bir şekilde konuşur.", "She couldn't express her ideas fluently yesterday.", "Dün fikirlerini akıcı bir şekilde ifade edemedi.", "How long did it take you to speak English fluently?", "İngilizceyi akıcı bir şekilde konuşman ne kadar sürdü?"),
    ("easily", "kolayca, rahatlıkla", "Durum Zarfı (Manner)", "He solved the physics problem easily.", "Fizik problemini kolayca çözdü.", "You cannot pass this advanced exam easily without practice.", "Pratik yapmadan bu ileri düzey sınavı kolayca geçemezsiniz.", "Can smart algorithms detect movement patterns easily?", "Akıllı algoritmalar hareket kalıplarını kolayca tespit edebilir mi?"),
    ("safely", "güvenle, emniyetli bir şekilde", "Durum Zarfı (Manner)", "The team arrived safely at the training facility.", "Takım antrenman tesisine güvenle vardı.", "They didn't store the sports equipment safely.", "Spor ekipmanlarını güvenli bir şekilde saklamadılar.", "Did your daughter land safely after the high jump?", "Kızın yüksek atlayıştan sonra güvenle yere indi mi?"),
    ("successfully", "başarıyla", "Durum Zarfı (Manner)", "We completed the scientific project successfully.", "Bilimsel projeyi başarıyla tamamladık.", "He didn't finish the agility trial successfully.", "Çeviklik denemesini başarıyla bitiremedi.", "Did the robotics team perform successfully in Switzerland?", "Robotik takımı İsviçre'de başarıyla performans gösterdi mi?"),
    ("clearly", "açıkça, net bir şekilde", "Durum Zarfı (Manner)", "The professor explained the grammar rules clearly.", "Profesör gramer kurallarını açıkça/net bir şekilde açıkladı.", "He didn't state his tactical hypothesis clearly.", "Taktiksel hipotezini net bir şekilde belirtmedi.", "Can you see the projected data clearly from your seat?", "Yansıtılan verileri oturduğun yerden net bir şekilde görebiliyor musun?"),
    ("properly", "düzgünce, gereğince", "Durum Zarfı (Manner)", "Athletes should stretch properly after each workout.", "Sporcular her antrenmandan sonra düzgünce esnemelidir.", "The software wasn't installed properly on the workstation.", "Yazılım iş istasyonuna düzgünce kurulmamıştı.", "Did you calibrate the force plate properly this morning?", "Kuvvet platformunu bu sabah düzgünce kalibre ettin mi?"),
    ("slowly", "yavaşça, sakince", "Durum Zarfı (Manner)", "The marathon runner paced herself slowly at the beginning.", "Maraton koşucusu başlangıçta kendini yavaşça ayarladı.", "He didn't speak slowly during the presentation.", "Sunum sırasında yavaşça konuşmadı.", "Why did the vehicle move slowly through the stadium gate?", "Araç stadyum kapısından neden yavaşça geçti?"),
    ("quietly", "sessizce", "Durum Zarfı (Manner)", "Students study quietly in the university library reading room.", "Öğrenciler üniversite kütüphanesi okuma salonunda sessizce ders çalışırlar.", "He didn't close the laboratory door quietly.", "Laboratuvar kapısını sessizce kapatmadı.", "Can you sit quietly while the coach explains the tactical board?", "Antrenör taktik tahtasını açıklarken sessizce oturabilir misin?"),
    ("loudly", "yüksek sesle", "Durum Zarfı (Manner)", "The fans cheered loudly when the team scored the winning goal.", "Takım galibiyet golünü attığında taraftarlar yüksek sesle tezahürat yaptı.", "Please don't talk loudly in the experimental testing chamber.", "Deneysel test odasında lütfen yüksek sesle konuşmayın.", "Why did the referee blow the whistle so loudly?", "Hakem düdüğü neden bu kadar yüksek sesle çaldı?"),
    ("politely", "kibarca, nazikçe", "Durum Zarfı (Manner)", "Ela asked the international instructor politely for clarification.", "Ela uluslararası eğitmenden kibarca açıklama istedi.", "He didn't decline the invitation politely.", "Daveti kibarca reddetmedi.", "How do students politely ask questions during online lectures?", "Öğrenciler çevrimiçi dersler sırasında nasıl kibarca soru sorarlar?"),
    ("honestly", "dürüstçe, samimiyetle", "Durum Zarfı (Manner)", "The athlete answered the doping control officer honestly.", "Sporcu doping kontrol görevlisini dürüstçe cevapladı.", "She didn't speak honestly about her knee pain to the doctor.", "Doktora diz ağrısı hakkında dürüstçe konuşmadı.", "Can you honestly evaluate your weekly grammar revision consistency?", "Haftalık gramer tekrarı tutarlılığınızı dürüstçe değerlendirebilir misiniz?"),
    ("bravely", "cesurca", "Durum Zarfı (Manner)", "The young goalkeeper bravely blocked the penalty shot.", "Genç kaleci penaltı atışını cesurca engelledi.", "He didn't step forward bravely during the difficult crisis.", "Zorlu kriz sırasında cesurca öne çıkmadı.", "Why did Ela bravely explore the mysterious academy cellar?", "Ela gizemli akademi bodrumunu neden cesurca keşfetti?"),
    ("happily", "mutlulukla, sevinçle", "Durum Zarfı (Manner)", "The students happily celebrated their scholarship achievements.", "Öğrenciler burs başarılarını mutlulukla kutladılar.", "He didn't accept the reserve bench role happily.", "Yedek kulübesi rolünü mutlulukla kabul etmedi.", "Did the team happily receive the regional championship trophy?", "Takım bölgesel şampiyonluk kupasını mutlulukla teslim aldı mı?"),
    ("always", "her zaman, daima", "Sıklık Zarfı (Frequency)", "She always reviews her vocabulary notes before sleeping.", "Uyumadan önce her zaman kelime notlarını tekrar eder.", "He doesn't always agree with the referee's decisions.", "Hakemin kararlarına her zaman katılmaz.", "Do you always wake up at six o'clock for conditioning?", "Kondisyon için her zaman saat altıda mı uyanırsın?"),
    ("usually", "genellikle, çoğunlukla", "Sıklık Zarfı (Frequency)", "We usually train on artificial turf pitches on Tuesdays.", "Salı günleri genellikle yapay çim sahalarda antrenman yaparız.", "They don't usually eat heavy meals before matches.", "Maçlardan önce genellikle ağır yemekler yemezler.", "What do you usually do during the half-time break?", "Devre arası molasında genellikle ne yaparsın?"),
    ("often", "sık sık", "Sıklık Zarfı (Frequency)", "Young players often practice penalty shots after training.", "Genç oyuncular antrenmandan sonra sık sık penaltı atışı çalışırlar.", "He doesn't often participate in social media discussions.", "Sosyal medya tartışmalarına sık sık katılmaz.", "How often do you measure your resting heart rate?", "Dinlenik kalp atış hızınızı ne sıklıkla ölçersiniz?"),
    ("frequently", "sıkça, sıklıkla", "Sıklık Zarfı (Frequency)", "Sports scientists frequently calibrate optical measurement tools.", "Spor bilimcileri optik ölçüm araçlarını sıklıkla kalibre ederler.", "She doesn't frequently skip her morning breakfast routine.", "Sabah kahvaltısı rutinini sıklıkla atlamaz.", "Why do elite athletes frequently consult sports psychologists?", "Seçkin sporcular neden sıklıkla spor psikologlarına danışırlar?"),
    ("sometimes", "bazen, ara sıra", "Sıklık Zarfı (Frequency)", "Sensors sometimes produce minor wireless errors.", "Sensörler bazen küçük kablosuz hataları üretir.", "She doesn't sometimes feel tired; she is always energetic.", "Bazen yorgun hissetmez; her zaman enerjiktir.", "Do you sometimes study grammar during the weekend?", "Hafta sonu bazen gramer çalışır mısın?"),
    ("occasionally", "ara sıra, bazen", "Sıklık Zarfı (Frequency)", "We occasionally play friendly matches against foreign academies.", "Yabancı akademilere karşı ara sıra dostluk maçları yaparız.", "He doesn't occasionally check his telemetry; he monitors it continuously.", "Telemetrisini ara sıra kontrol etmez; sürekli izler.", "Do you occasionally test your sprint speed on natural grass?", "Doğal çimde depar hızınızı ara sıra test eder misiniz?"),
    ("rarely", "nadiren", "Sıklık Zarfı (Frequency)", "He rarely misses a morning conditioning session.", "Sabah kondisyon seansını nadiren kaçırır.", "We rarely see such explosive jumping power in youth leagues.", "Genç liglerde nadiren bu kadar patlayıcı sıçrama gücü görürüz.", "Why do researchers rarely use uncalibrated instruments?", "Araştırmacılar neden kalibre edilmemiş aletleri nadiren kullanırlar?"),
    ("seldom", "pek nadir, nadiren", "Sıklık Zarfı (Frequency)", "Elite gymnasts seldom make mistakes in their dismount routine.", "Seçkin jimnastikçiler aletten iniş rutinlerinde pek nadir hata yaparlar.", "She seldom complaints about intense training loads.", "Yoğun antrenman yükleri hakkında pek nadir şikayet eder.", "How seldom do professional teams lose home matches?", "Profesyonel takımlar iç saha maçlarını ne kadar nadir kaybeder?"),
    ("hardly ever", "neredeyse hiç", "Sıklık Zarfı (Frequency)", "Disciplined learners hardly ever forget new vocabulary words.", "Disiplinli öğrenciler yeni kelimeleri neredeyse hiç unutmazlar.", "He hardly ever eats junk food before competitive games.", "Müsabaka maçlarından önce neredeyse hiç abur cubur yemez.", "Why does your team hardly ever concede goals from set pieces?", "Takımınız duran toplardan neden neredeyse hiç gol yemiyor?"),
    ("never", "asla, hiçbir zaman", "Sıklık Zarfı (Frequency)", "Disciplined athletes never give up during difficult matches.", "Disiplinli sporcular zorlu maçlarda asla pes etmezler.", "She never arrives late to academic seminars.", "Akademik seminerlere hiçbir zaman geç kalmaz.", "Have you never seen a professional VR sports simulation?", "Hiç profesyonel bir VR spor simülasyonu görmedin mi?"),
    ("definitely", "kesinlikle, mutlaka", "Kesinlik Zarfı (Certainty)", "This innovative training method will definitely improve sprint speed.", "Bu yenilikçi antrenman yöntemi kesinlikle depar hızını artıracaktır.", "He definitely didn't violate the anti-doping regulations.", "Kesinlikle anti-doping kurallarını ihlal etmedi.", "Will you definitely attend the European sports conference?", "Avrupa spor konferansına kesinlikle katılacak mısın?"),
    ("probably", "muhtemelen", "Olasılık Zarfı (Probability)", "The head coach will probably announce the squad tomorrow.", "Başantrenör muhtemelen kadroyu yarın açıklayacak.", "They probably won't travel by bus due to bad weather.", "Kötü hava nedeniyle muhtemelen otobüsle seyahat etmeyecekler.", "Where will the national team probably stay during the tournament?", "Milli takım turnuva sırasında muhtemelen nerede kalacak?"),
    ("currently", "şu anda, mevcut durumda", "Zaman Zarfı (Time)", "The engineers are currently developing a new VR tracking algorithm.", "Mühendisler şu anda yeni bir VR takip algoritması geliştiriyorlar.", "She isn't currently working on her master's thesis.", "Şu anda yüksek lisans tezi üzerinde çalışmıyor.", "Which software version are you currently using?", "Şu anda hangi yazılım sürümünü kullanıyorsunuz?"),
    ("recently", "son zamanlarda, geçenlerde", "Zaman Zarfı (Time)", "The university has recently opened a high-tech biomechanics lab.", "Üniversite son zamanlarda yüksek teknolojili bir biyomekanik laboratuvarı açtı.", "He hasn't performed well recently due to a minor ankle strain.", "Hafif ayak bileği burkulması nedeniyle son zamanlarda iyi performans göstermedi.", "Have you read any interesting research papers recently?", "Son zamanlarda hiç ilginç araştırma makalesi okudun mu?"),
    ("immediately", "derhal, hemen", "Zaman Zarfı (Time)", "Athletes must stop training immediately if they feel sharp pain.", "Sporcular keskin bir ağrı hissederlerse derhal antrenmanı durdurmalıdır.", "The emergency response team didn't arrive immediately.", "Acil müdahale ekibi hemen varmadı.", "Can you send the sprint analysis data immediately?", "Depar analiz verilerini hemen gönderebilir misin?"),
    ("soon", "yakında, birazdan", "Zaman Zarfı (Time)", "The scientific committee will release the conference results soon.", "Bilim kurulu konferans sonuçlarını yakında açıklayacak.", "The tournament won't conclude soon; it lasts two full weeks.", "Turnuva yakında sonuçlanmayacak; iki tam hafta sürüyor.", "How soon can we start the virtual reality soccer simulation?", "Sanal gerçeklik futbol simülasyonuna ne kadar yakında başlayabiliriz?"),
    ("already", "zaten, çoktan", "Zaman Zarfı (Time)", "Ela has already completed all twenty grammar video lessons.", "Ela yirmi gramer video dersinin tamamını çoktan bitirdi.", "They haven't already finished the laboratory calibration.", "Laboratuvar kalibrasyonunu henüz çoktan bitirmiş değiller.", "Have you already mastered the third conditional sentence rule?", "Üçüncü şart cümlesi kuralında çoktan ustalaştın mı?"),
    ("still", "hâlâ, henüz", "Zaman Zarfı (Time)", "The researchers are still analyzing the multi-joint movement angles.", "Araştırmacılar çoklu eklem hareket açılarını hâlâ analiz ediyorlar.", "He still hasn't recovered from his shoulder surgery.", "Omuz ameliyatından sonra hâlâ toparlanamadı.", "Are you still practicing irregular verbs with flashcards?", "Flaş kartlarla hâlâ düzensiz fiil pratiği yapıyor musun?"),
    ("suddenly", "aniden, birdenbire", "Zaman Zarfı (Time)", "The electrical power went out suddenly during the experiment.", "Deney sırasında elektrik aniden kesildi.", "The weather didn't change suddenly; the forecast warned us.", "Hava aniden değişmedi; hava durumu tahmini bizi uyarmıştı.", "Why did the athlete suddenly stop running in the middle of the pitch?", "Sporcu sahanın ortasında neden aniden koşmayı bıraktı?"),
    ("gradually", "kademeli olarak, yavaş yavaş", "Zaman & Süreç", "Running endurance increases gradually through weekly long runs.", "Koşu dayanıklılığı haftalık uzun koşularla kademeli olarak artar.", "The swelling didn't decrease gradually until ice was applied.", "Buz uygulanana kadar şişlik kademeli olarak azalmadı.", "How does language comprehension improve gradually over time?", "Dil kavrayışı zaman içinde nasıl kademeli olarak gelişir?"),
    ("eventually", "eninde sonunda, nihayetinde", "Zaman & Sonuç", "Consistent hard work will eventually yield championship gold medals.", "Tutarlı sıkı çalışma eninde sonunda şampiyonluk altın madalyaları getirecektir.", "He didn't give up and eventually solved the mathematical riddle.", "Pes etmedi ve eninde sonunda matematiksel bilmeceyi çözdü.", "Will artificial intelligence eventually replace human refereeing?", "Yapay zeka eninde sonunda insan hakemliğinin yerini alacak mı?"),
    ("finally", "sonunda, nihayet", "Zaman & Sonuç", "The technical team finally resolved the wireless sensor latency.", "Teknik ekip kablosuz sensör gecikmesini sonunda çözdü.", "She didn't finally submit her research proposal until midnight.", "Araştırma önerisini gece yarısına kadar nihayet teslim etmedi.", "Have you finally memorized all one hundred fifty-eight core verbs?", "Yüz elli sekiz temel fiilin tamamını sonunda ezberledin mi?"),
    ("extremely", "son derece, aşırı derecede", "Derece Zarfı (Degree)", "The championship final match was extremely exciting.", "Şampiyona final maçı son derece heyecanlıydı.", "The weather wasn't extremely cold during the winter camp.", "Kış kampı sırasında hava aşırı derecede soğuk değildi.", "Why is this mathematical formula extremely difficult to solve?", "Bu matematiksel formülü çözmek neden son derece zor?")
]

# 40 Complete Curated Conjunctions (Bağlaçlar)
CONJUNCTIONS_DATA = [
    ("because", "çünkü, -dığı için", "Sebep-Sonuç (Cause & Effect)", "Ela studied grammar every day because she wanted to excel in English.", "Ela her gün gramer çalıştı çünkü İngilizcede mükemmelleşmek istiyordu.", "He didn't play in the match because he had a high fever.", "Yüksek ateşi olduğu için maçta oynamadı.", "Did they cancel the outdoor training session because of heavy rain?", "Şiddetli yağmur nedeniyle açık hava antrenmanını iptal ettiler mi?"),
    ("although", "rağmen, -e karşın", "Zıtlık Bağlacı (Contrast)", "Although the match was very tough, our team won the trophy.", "Maç çok zorlu olmasına rağmen, takımımız kupayı kazandı.", "Although he didn't practice all week, he performed well.", "Tüm hafta antrenman yapmamasına rağmen, iyi performans sergiledi.", "Why was he exhausted although he slept eight full hours?", "Sekiz tam saat uyumasına rağmen neden bitkindi?"),
    ("even though", "olsa bile, -e rağmen", "Güçlü Zıtlık (Strong Contrast)", "Even though the sensor was old, it provided accurate telemetry.", "Sensör eski olsa bile doğru telemetri sağladı.", "Even though she didn't feel confident, she answered all questions.", "Kendine güvenmese bile tüm soruları cevapladı.", "Did the team continue the sprint drills even though it started snowing?", "Kar yağmaya başlamasına rağmen takım depar egzersizlerine devam etti mi?"),
    ("however", "ancak, yine de, oysa", "Geçiş Bağlacı (Transition)", "We had planned outdoor testing; however, the storm forced us inside.", "Açık hava testi planlamıştık; ancak fırtına bizi içeri girmeye zorladı.", "He trained very hard; however, he didn't win the championship.", "Çok sıkı çalıştı; ancak şampiyonluğu kazanamadı.", "Is the software user-friendly? However, does it meet all safety standards?", "Yazılım kullanıcı dostu mu? Yine de tüm güvenlik standartlarını karşılıyor mu?"),
    ("therefore", "bu nedenle, bu yüzden, dolayısıyla", "Sonuç Bağlacı (Result)", "He scored highest in the mock exam; therefore, he received a scholarship.", "Deneme sınavında en yüksek puanı aldı; bu nedenle burs kazandı.", "The server crashed; therefore, we couldn't access the database.", "Sunucu çöktü; bu yüzden veritabanına erişemedik.", "Did you finish the literature review; therefore, can you start drafting the paper?", "Literatür taramasını bitirdin mi; dolayısıyla makaleyi yazmaya başlayabilir misin?"),
    ("so that", "-sın diye, amacıyla", "Amaç Bağlacı (Purpose)", "He bought a high-speed camera so that he could analyze sprint kinetics.", "Depar kinetiğini analiz edebilsin diye yüksek hızlı bir kamera satın aldı.", "She took detailed notes so that she wouldn't forget the formulas.", "Formülleri unutmasın diye detaylı notlar aldı.", "Why did you speak slowly so that international students could understand?", "Uluslararası öğrenciler anlayabilsin diye neden yavaş konuştun?"),
    ("in order to", "-mek için, amacıyla", "Amaç Kalıbı (Purpose Infinitive)", "Athletes do warm-up drills in order to prevent hamstring strains.", "Sporcular arka adale zorlanmalarını önlemek için ısınma hareketleri yaparlar.", "You shouldn't take risky shortcuts in order to finish early.", "Erken bitirmek için riskli kestirmelere başvurmamalısınız.", "What exercises do you perform in order to maximize vertical jump power?", "Dikey sıçrama gücünü maksimize etmek için hangi egzersizleri yapıyorsunuz?"),
    ("in order that", "-sın diye, amacıyla", "Amaç Bağlacı (Purpose Clause)", "The coach gave clear signals in order that players could position themselves.", "Antrenör oyuncular kendilerini konumlandırabilsin diye net işaretler verdi.", "We didn't alter the protocol in order that the data would remain valid.", "Veriler geçerli kalsın diye protokolü değiştirmedik.", "Did you set daily reminders in order that your daughter would study grammar?", "Kızınız gramer çalışsın diye günlük hatırlatıcılar kurdunuz mu?"),
    ("while", "iken, o sırada, oysa", "Zaman & Zıtlık (Time & Contrast)", "While the coach was explaining tactics, the players listened attentively.", "Antrenör taktikleri açıklarken oyuncular dikkatle dinlediler.", "He didn't look at his phone while he was solving math equations.", "Matematik denklemlerini çözerken telefonuna bakmadı.", "What were you doing while the experiment was running in the lab?", "Deney laboratuvarda çalışırken sen ne yapıyordun?"),
    ("since", "-den beri, -dığı için", "Zaman & Sebep (Time & Cause)", "Since we have enough sensor data, we can start the machine learning training.", "Yeterli sensör verimiz olduğu için makine öğrenmesi eğitimine başlayabiliriz.", "He hasn't visited the medical clinic since he recovered from the injury.", "Sakatlıktan kurtulduğundan beri sağlık kliniğini ziyaret etmedi.", "Have you spoken with the project supervisor since yesterday morning?", "Dün sabahtan beri proje danışmanıyla konuştun mu?"),
    ("unless", "-medikçe, -mezse (if not)", "Koşul Bağlacı (Condition)", "You cannot achieve peak performance unless you maintain consistent sleep habits.", "Tutarlı uyku alışkanlıklarını sürdürmedikçe zirve performansı elde edemezsiniz.", "We won't start the testing unless all optical photocell gates are ready.", "Tüm optik fotosel kapıları hazır olmadıkça teste başlamayacağız.", "Can a player join the competitive squad unless she passes the medical screening?", "Sağlık taramasından geçmedikçe bir oyuncu müsabaka kadrosuna katılabilir mi?"),
    ("as soon as", "yapar yapmaz, -er -mez", "Zaman Bağlacı (Time)", "We will send the test report as soon as the data analysis is complete.", "Veri analizi tamamlanır tamamlanmaz test raporunu göndereceğiz.", "Don't disconnect the charging cable as soon as the red LED flashes.", "Kırmızı LED yanıp söner sönmez şarj kablosunu çıkarmayın.", "Did your daughter call you as soon as she arrived in Eskişehir?", "Kızın Eskişehir'e varır varmaz seni aradı mı?"),
    ("whereas", "oysa, halbuki, buna karşın", "Doğrudan Zıtlık (Direct Contrast)", "Volleyball requires vertical jumping, whereas soccer demands aerobic endurance.", "Voleybol dikey sıçrama gerektirir, oysa futbol aerobik dayanıklılık ister.", "He prefers morning workouts, whereas his teammate doesn't like early training.", "O sabah antrenmanlarını tercih eder, oysa takım arkadaşı erken antrenmanı sevmez.", "Why do you study math, whereas your sister studies foreign literature?", "Kız kardeşin yabancı edebiyat çalışırken sen neden matematik çalışıyorsun?"),
    ("as well as", "yanı sıra, ek olarak", "Ek Bağlacı (Addition)", "Ela learns Spanish as well as English at school.", "Ela okulda İngilizcenin yanı sıra İspanyolca da öğreniyor.", "The diet plan includes vitamins as well as essential minerals.", "Diyet planı temel minerallerin yanı sıra vitaminleri de içerir.", "Can the device measure acceleration as well as angular velocity?", "Cihaz açısal hızın yanı sıra ivmeyi de ölçebilir mi?"),
    ("not only... but also", "sadece ... değil, aynı zamanda ...", "Vurgulu Ek (Correlative)", "He is not only a great athlete but also a dedicated scientist.", "O sadece harika bir sporcu değil, aynı zamanda özverili bir bilim insanıdır.", "She didn't not only solve the puzzle, but also broke the school record.", "Sadece bulmacayı çözmekle kalmadı, aynı zamanda okul rekorunu da kırdı.", "Did your team not only win the game but also earn the fair-play award?", "Takımınız sadece maçı kazanmakla kalmayıp centilmenlik ödülünü de kazandı mı?"),
    ("either... or", "ya ... ya da ...", "Seçenek Bağlacı (Alternative)", "You can either choose morning practice or join the evening session.", "Ya sabah antrenmanını seçebilir ya da akşam seansına katılabilirsiniz.", "We cannot either accept late submissions or excuse unapproved absences.", "Ne geç teslimleri kabul edebiliriz ne de izinsiz devamsızlıkları mazur görebiliriz.", "Will you either study for the LGS exam or practice English today?", "Bugün ya LGS sınavına mı çalışacaksın yoksa İngilizce pratiği mi yapacaksın?"),
    ("neither... nor", "ne ... ne de ...", "Olumsuz Seçenek (Correlative Negative)", "Neither the players nor the coaching staff were satisfied with the draw.", "Ne oyuncular ne de antrenör heyeti beraberlikten memnun kaldı.", "He could neither attend the morning training nor contact the team doctor.", "Ne sabah antrenmanına katılabildi ne de takım doktoruyla iletişime geçebildi.", "Is neither the sensor battery nor the wireless connection functioning?", "Ne sensör pili ne de kablosuz bağlantı mı çalışmıyor?"),
    ("both... and", "hem ... hem de ...", "Birliktelik Bağlacı (Correlative)", "Both tactical intelligence and physical speed are essential in volleyball.", "Voleybolda hem taktiksel zeka hem de fiziksel hız gereklidir.", "The trial wasn't both cost-effective and scientifically reliable.", "Deneme hem maliyet açısından uygun hem de bilimsel olarak güvenilir değildi.", "Did both the professors and the students support the new VR project?", "Yeni VR projesini hem profesörler hem de öğrenciler destekledi mi?"),
    ("whether... or", "ister ... ister, olup olmadığı", "Seçenek & İkilem", "Whether you train indoors or outdoors, you must stay hydrated.", "İster içeride ister dışarıda antrenman yapın, vücut su dengenizi korumalısınız.", "We don't know whether the tournament will take place on Saturday or Sunday.", "Turnuvanın cumartesi mi yoksa pazar mı yapılacağını bilmiyoruz.", "Can you tell whether the sensor is calibrated or uncalibrated?", "Sensörün kalibre edilmiş mi yoksa kalibre edilmemiş mi olduğunu söyleyebilir misiniz?"),
    ("moreover", "dahası, ayrıca, dahası", "Ek Bilgi (Addition Transition)", "Regular exercise improves heart health; moreover, it sharpens memory.", "Düzenli egzersiz kalp sağlığını iyileştirir; dahası, hafızayı keskinleştirir.", "He didn't arrive on time; moreover, he forgot his sports passport.", "Zamanında gelmedi; dahası, spor pasaportunu unuttu.", "Does the application track flashcards; moreover, does it assess speaking?", "Uygulama flaş kartları takip ediyor mu; dahası, konuşmayı da değerlendiriyor mu?"),
    ("furthermore", "üstelik, bundan başka, dahası", "Ek Bilgi (Formal Addition)", "The VR headset provides immersion; furthermore, it captures eye gaze.", "VR başlığı derinlik hissi sağlar; üstelik göz bakışını da yakalar.", "The candidate didn't meet the height criteria; furthermore, he lacked experience.", "Aday boy kriterini karşılamadı; üstelik deneyimi de yoktu.", "Is the software free; furthermore, does it include full Turkish video lectures?", "Yazılım ücretsiz mi; üstelik Türkçe video derslerin tamamını içeriyor mu?"),
    ("in addition", "buna ek olarak, ayrıca", "Ek Bilgi (Addition)", "Ela solves math puzzles; in addition, she reads English classic novels.", "Ela matematik bulmacaları çözer; buna ek olarak İngilizce klasik romanlar okur.", "The lab didn't replace old computers; in addition, it cut software budgets.", "Laboratuvar eski bilgisayarları yenilemedi; buna ek olarak yazılım bütçelerini kıstı.", "In addition to vocabulary drills, will the daily routine include quizzes?", "Kelime alıştırmalarına ek olarak günlük rutin sınavları da içerecek mi?"),
    ("besides", "ayrıca, bundan başka", "Ek Bilgi (Addition)", "I love volleyball; besides, playing sports keeps my mind energetic.", "Voleybolu seviyorum; ayrıca spor yapmak zihnimi enerjik tutuyor.", "He doesn't have the time; besides, he cannot afford the travel expenses.", "Zamanı yok; ayrıca seyahat masraflarını karşılayamaz.", "Who else attended the biomechanics seminar besides your research team?", "Araştırma ekibinizden başka biyomekanik seminerine başka kimler katıldı?"),
    ("as a result", "sonuç olarak, bunun sonucu olarak", "Sonuç (Result Transition)", "The team trained rigorously all winter; as a result, they won the gold.", "Takım tüm kış sıkı çalıştı; sonuç olarak altın madalyayı kazandılar.", "He skipped recovery meals; as a result, he didn't perform well.", "Toparlanma öğünlerini atladı; sonuç olarak iyi performans gösteremedi.", "As a result of this grammar system, how much did student scores increase?", "Bu gramer sisteminin bir sonucu olarak öğrenci puanları ne kadar arttı?"),
    ("consequently", "sonuç olarak, dolayısıyla", "Sonuç (Formal Result)", "The athlete suffered an ankle sprain; consequently, she sat out the game.", "Sporcu ayak bileği burkulması yaşadı; dolayısıyla maçı kenardan izledi.", "The server wasn't properly maintained; consequently, it couldn't handle load.", "Sunucuya düzgün bakım yapılmadı; dolayısıyla yükü kaldıramadı.", "Did the experiment fail; consequently, must we reformulate our hypothesis?", "Deney başarısız mı oldu; dolayısıyla hipotezimizi yeniden mi formüle etmeliyiz?"),
    ("as long as", "-dığı sürece, şartıyla", "Koşul Bağlacı (Condition)", "You will make steady progress as long as you practice fifteen minutes daily.", "Her gün on beş dakika pratik yaptığınız sürece istikrarlı ilerleme kaydedersiniz.", "Athletes won't burn out as long as they don't overtrain recklessly.", "Sporcular pervasızca aşırı antrenman yapmadıkları sürece tükenmişlik yaşamazlar.", "Can we access the cloud vocabulary dictionary as long as we have internet?", "İnternetimiz olduğu sürece bulut kelime sözlüğüne erişebilir miyiz?"),
    ("provided that", "şartıyla, koşuluyla", "Koşul Bağlacı (Formal Condition)", "You may borrow the VR equipment provided that you return it undamaged.", "Hasarsız iade etmeniz şartıyla VR ekipmanını ödünç alabilirsiniz.", "The committee won't approve the grant provided that the budget is unverified.", "Bütçe doğrulanmadığı takdirde komite hibeyi onaylamayacaktır.", "Can young athletes join advanced drills provided that they pass screenings?", "Taramaları geçmeleri şartıyla genç sporcular ileri düzey çalışmalara katılabilir mi?"),
    ("in case", "durumunda, ihtimaline karşı", "Önlem Bağlacı (Precaution)", "Take an extra sensor battery in case the primary unit runs out of power.", "Ana ünitenin şarjı biter ihtimaline karşı yanınıza ekstra bir sensör pili alın.", "Don't leave the laboratory unlocked in case unauthorized people enter.", "Yetkisiz kişiler girer ihtimaline karşı laboratuvarı kilitsiz bırakmayın.", "Did you pack sports tape in case an athlete twists an ankle?", "Bir sporcunun bileği burkulur ihtimaline karşı spor bandı aldınız mı?"),
    ("as if", "-mış gibi, sanki", "Benzetme & Durum (Manner Clause)", "The young sprinter ran as if Olympic gold were on the line.", "Genç depar koşucusu sanki ortada Olimpik altın varmış gibi koştu.", "He didn't act as if he were surprised by the tactical outcome.", "Taktiksel sonuç karşısında şaşırmış gibi davranmadı.", "Why does the virtual reality environment feel as if it were real life?", "Sanal gerçeklik ortamı neden sanki gerçek hayatmış gibi hissettiriyor?"),
    ("so ... that", "öyle ... ki", "Derece & Sonuç (Degree Result)", "The match was so intense that all spectators stood on their feet.", "Maç öyle yoğun/heyecanlıydı ki tüm seyirciler ayakta izledi.", "The formula wasn't so complex that middle school students couldn't learn it.", "Formül ortaokul öğrencilerinin öğrenemeyeceği kadar karmaşık değildi.", "Was the VR simulation so realistic that players felt real pitch pressure?", "VR simülasyonu oyuncuların gerçek saha baskısını hissedeceği kadar gerçekçi miydi?"),
    ("such ... that", "öylesine bir ... ki", "Nitelik & Sonuç (Quality Result)", "It was such an innovative app that thousands of students downloaded it.", "Öylesine yenilikçi bir uygulamaydı ki binlerce öğrenci indirdi.", "She didn't show such great reluctance that the coach dropped her.", "Antrenörün onu kadro dışı bırakacağı kadar büyük bir isteksizlik göstermedi.", "Was it such a difficult match that both teams were completely exhausted?", "Her iki takımın da tamamen tükeneceği kadar zorlu bir maç mıydı?"),
    ("by the time", "-ıncaya kadar, o vakte kadar", "Zaman Bağlacı (Time Limit)", "By the time the championship started, our team had prepared tactically.", "Şampiyona başlayıncaya kadar takımımız taktiksel olarak hazırlanmıştı.", "By the time he arrived, the tactical briefing hadn't finished yet.", "O varıncaya kadar taktik bilgilendirme henüz bitmemişti.", "Will you have memorized all fifty adverbs by the time the quiz begins?", "Sınav başlayıncaya kadar elli zarfın tamamını ezberlemiş olacak mısın?"),
    ("until", "-e kadar (sürekli durum)", "Zaman Bağlacı (Time Continuity)", "Please remain seated until the final test score is announced.", "Nihai test puanı açıklanıncaya kadar lütfen yerinizde oturun.", "The athlete didn't leave the rehabilitation clinic until he was fully healed.", "Sporcu tamamen iyileşinceye kadar rehabilitasyon kliniğinden ayrılmadı.", "Can you continue vocabulary revision until the daily routine completes?", "Günlük rutin tamamlanıncaya kadar kelime tekrarına devam edebilir misin?"),
    ("once", "-dığında, bir kez ... yapınca", "Zaman & Koşul (Immediate Time)", "Once you master the SVOMPT formula, sentence building becomes effortless.", "SVOMPT formülünde bir kez ustalaştığınızda cümle kurmak zahmetsiz hale gelir.", "Once he started the sprint, he didn't look back.", "Depara bir kez başladığında arkasına bakmadı.", "Can we begin the tactical scrimmage once the sensor calibration completes?", "Sensör kalibrasyonu bir kez tamamlandığında taktik çift kale maça başlayabilir miyiz?"),
    ("even if", "-se bile, olsa dahi", "Varsayım & Zıtlık (Hypothetical)", "Even if it rains heavily, the indoor volleyball tournament will proceed.", "Şiddetli yağmur yağsa bile kapalı salon voleybol turnuvası devam edecek.", "He won't give up his goals even if he faces difficult academic hurdles.", "Zorlu akademik engellerle karşılaşsa bile hedeflerinden vazgeçmeyecektir.", "Will you practice five English sentences every day even if you feel tired?", "Yorgun hissetsen bile her gün beş İngilizce cümle pratiği yapacak mısın?"),
    ("nevertheless", "yine de, buna rağmen", "Zıtlık (Formal Transition)", "The team was fatigued; nevertheless, they played with great determination.", "Takım yorgundu; yine de büyük bir kararlılıkla oynadılar.", "He lacked formal training; nevertheless, he didn't fail the practical test.", "Resmi eğitimi yoktu; yine de pratik testte başarısız olmadı.", "The budget was limited; nevertheless, did the lab produce innovative results?", "Bütçe kısıtlıydı; yine de laboratuvar yenilikçi sonuçlar üretti mi?"),
    ("nonetheless", "buna rağmen, yine de", "Zıtlık (Transition)", "The weather was humid; nonetheless, the runner set a personal sprint record.", "Hava nemliydi; buna rağmen koşucu kişisel depar rekorunu kırdı.", "She was nervous; nonetheless, she didn't make any pronunciation mistakes.", "Gergindi; buna rağmen hiçbir telaffuz hatası yapmadı.", "The competition was fierce; nonetheless, did your team win the fair-play cup?", "Rekabet kıyasıyaydı; buna rağmen takımınız centilmenlik kupasını kazandı mı?"),
    ("despite the fact that", "-dığı gerçeğine rağmen", "Zıtlık Cümleciği (Contrast Clause)", "He won the match despite the fact that he had a sprained thumb.", "Başparmağı burkulmuş olduğu gerçeğine rağmen maçı kazandı.", "She didn't give up despite the fact that she was the youngest in the league.", "Ligdeki en genç oyuncu olduğu gerçeğine rağmen pes etmedi.", "Did you finish the project despite the fact that the server was offline?", "Sunucu çevrimdışı olduğu gerçeğine rağmen projeyi bitirdiniz mi?"),
    ("on condition that", "şartıyla, kaydıyla", "Koşul Bağlacı (Condition Clause)", "The coach allowed him to play on condition that he stayed within his zone.", "Antrenör bölgesinde kalması şartıyla oynamasına izin verdi.", "We won't deploy the software on condition that unit tests fail.", "Birim testleri başarısız olursa yazılımı dağıtıma çıkarmayacağız.", "Can we reschedule the exam on condition that all students agree?", "Tüm öğrencilerin kabul etmesi şartıyla sınavı yeniden planlayabilir miyiz?")
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

    # 5. 50 Adverbs (Zarflar)
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

    # 6. 40 Conjunctions (Bağlaçlar)
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
            "level": "B1-B2",
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

    print(f"MASTER COMPLETE: Generated {len(all_items)} total dictionary items (50 Adverbs, 40 Conjunctions, 60 Phrasals)!")

if __name__ == "__main__":
    build_master_encyclopedia()
