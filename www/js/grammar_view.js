/**
 * 22+ Konu Kapsamlı Gramer Akademisi, YouTube Video Arama & Akıllı Ders İzleme Modülü
 * Çoklu Alternatif Video Havuzu & Otomatik Hata Kurtarma & Tekrarsız Rotasyon Sistemi
 */

class GrammarView {
  constructor() {
    this.expandedModuleId = 'gmod_1';
    this.videoSearchQuery = '';
    this.watchedVideos = JSON.parse(localStorage.getItem('english_app_watched_videos') || '[]');
    this.videoHistory = JSON.parse(localStorage.getItem('english_app_video_history') || '[]');
    this.activeVideoIndices = {}; // lesson_id -> current alternative index
    this.currentModalLesson = null;
    this.currentModalIndex = 0;

    // 22 Kapsamlı Gramer Konusu ve Doğrulanmış Gerçek YouTube Eğitmenleri Havuzu
    this.defaultVideoLessons = [
      {
        id: "vid_svompt",
        tense_key: "svompt",
        title: "1. Ders: İngilizce Cümle Dizilimi ve SVOMPT Kuralı",
        topic: "SVOMPT Cümle Yapısı",
        description: "Özne (Subject), Fiil (Verb), Nesne (Object), Durum (Manner), Yer (Place), Zaman (Time) dizilişi ve Türkçe ile temel farklar.",
        duration: "10 Dk",
        level: "A1-A2",
        search_query: "İngilizce Cümle Kurma SVOMPT konu anlatımı",
        videos: [
          { id: "-HNLa3zcxhw", title: "1 Dakikada İngilizce Cümle Kurma Sorununu Çözelim", author: "Akif Onay Language Academy" },
          { id: "60aKlapxf8c", title: "İngilizce’de Cümle Kurma Mantığı (Kolayca Cümle Kurun)", author: "Furkan Çetin" },
          { id: "eizw0PWh_c4", title: "İngilizce Cümle Nasıl Kurulur? 5 Dakikada Cümle Kurma Tekniği!", author: "English Everyday Words" }
        ]
      },
      {
        id: "vid_simple_present",
        tense_key: "present_simple",
        title: "2. Ders: Simple Present Tense (Geniş Zaman & Do/Does)",
        topic: "Simple Present Tense",
        description: "Günlük rutinler, alışkanlıklar, He/She/It için -s/-es/-ies takıları ve Do/Does soru yapıları.",
        duration: "15 Dk",
        level: "A1-A2",
        search_query: "Simple Present Tense konu anlatımı türkçe",
        videos: [
          { id: "JLdIAa8jaZM", title: "Sıfırdan İngilizce - Present Simple Tense Detaylı Anlatım", author: "Ayse Eser" },
          { id: "aU6DrkQdisM", title: "Simple Present Tense Konu Anlatımı", author: "Ms. Jasmin ELT" },
          { id: "BYnlEYOy2z0", title: "Simple Present Tense Örnek Cümleler ile 7 Dakikada Öğren!", author: "English Everyday Words" },
          { id: "N_DSFDr5TYg", title: "Present Simple Tense (Geniş Zaman)", author: "Sercan İgrek" }
        ]
      },
      {
        id: "vid_present_cont",
        tense_key: "present_continuous",
        title: "3. Ders: Present Continuous Tense (Şimdiki Zaman - am/is/are + V-ing)",
        topic: "Present Continuous",
        description: "Şu anda gerçekleşen eylemler, -ing takısı getirme kuralları, Now ve At the moment kullanımı.",
        duration: "14 Dk",
        level: "A1-A2",
        search_query: "Present Continuous Tense konu anlatımı türkçe",
        videos: [
          { id: "QTJS3nuEn-Y", title: "Present Continuous Tense Konu Anlatımı | İngilizce Şimdiki Zaman", author: "Ms. Jasmin ELT" },
          { id: "DPR3MFHpg6c", title: "Sıfırdan İngilizce - Present Continuous ÇOK DETAYLI Anlatım", author: "Ayse Eser" },
          { id: "f_OXshHKyLE", title: "Present Continuous Tense Örnek Cümleler ile Detaylı Anlatım", author: "English Everyday Words" },
          { id: "QSEFFOU6ruc", title: "Present Continuous Tense bu kadar kolay mıydı?", author: "Sercan İgrek" }
        ]
      },
      {
        id: "vid_simple_past",
        tense_key: "past_simple",
        title: "4. Ders: Simple Past Tense (Geçmiş Zaman - V2 / Did)",
        topic: "Simple Past Tense",
        description: "Geçmişte tamamlanan eylemler, düzenli (-ed) ve düzensiz (V2) fiiller, Did yardımcı fiili.",
        duration: "18 Dk",
        level: "A2",
        search_query: "Simple Past Tense konu anlatımı türkçe",
        videos: [
          { id: "38rtAIwqPtw", title: "Simple Past Tense Konu Anlatımı | İngilizce Geçmiş Zaman", author: "Ms. Jasmin ELT" },
          { id: "L8v05CfesIY", title: "Sıfırdan İngilizce - Past Simple Detaylı Konu Anlatımı", author: "Ayse Eser" },
          { id: "m-5Esah-BxU", title: "İngilizcede SIMPLE PAST TENSE - Geçmiş Zaman Konu Anlatımı", author: "Lingua Matik" }
        ]
      },
      {
        id: "vid_past_cont",
        tense_key: "past_continuous",
        title: "5. Ders: Past Continuous Tense (was/were + V-ing - Geçmişte Süregelen)",
        topic: "Past Continuous",
        description: "Geçmişte belli bir anda devam eden eylemler, When & While bağlaçlarının kullanımı.",
        duration: "13 Dk",
        level: "A2-B1",
        search_query: "Past Continuous Tense konu anlatımı türkçe",
        videos: [
          { id: "ob0HW-im7eo", title: "Past Continuous Tense – İngilizce Türkçe Detaylı Konu Anlatımı", author: "Ms. Jasmin ELT" },
          { id: "lBGPhcBZRmY", title: "İngilizce Past Continuous Tense Nasıl Kullanılır? When & While", author: "Ayse Eser" },
          { id: "-JLv1jMHlCI", title: "Past Continuous Tense (Şimdiki Zamanın Hikayesi) Konu Anlatımı", author: "Full up English" }
        ]
      },
      {
        id: "vid_present_perfect",
        tense_key: "present_perfect",
        title: "6. Ders: Present Perfect & Continuous (have/has + V3 - Yakın Geçmiş)",
        topic: "Present Perfect",
        description: "Geçmişte başlayıp etkisi süren eylemler, tecrübeler, Ever/Never/Just/Already/Yet farkları.",
        duration: "16 Dk",
        level: "A2-B1",
        search_query: "Present Perfect Tense konu anlatımı türkçe",
        videos: [
          { id: "cwoDqEcicTY", title: "Sıfırdan İngilizce - Present Perfect Tense Konu Anlatımı", author: "Ayse Eser" },
          { id: "fWJbpHgYGGE", title: "6 Dakikada PRESENT PERFECT TENSE", author: "Tonguç Akademi" },
          { id: "0m0Tp1_N3bs", title: "PRESENT PERFECT TENSE KONU ANLATIMI", author: "Ms. Jasmin ELT" },
          { id: "dNu_oLE9WWs", title: "Present Perfect Tense | En Kolay Anlatım + Örnekler", author: "Attack English House" }
        ]
      },
      {
        id: "vid_past_perfect",
        tense_key: "past_perfect",
        title: "7. Ders: Past Perfect Tense (had + V3 - Önceki Geçmiş Zaman)",
        topic: "Past Perfect",
        description: "Geçmişte gerçekleşen iki olaydan daha önce olanını anlatma (-mişti), After / Before / By the time kalıpları.",
        duration: "15 Dk",
        level: "B1",
        search_query: "Past Perfect Tense konu anlatımı türkçe",
        videos: [
          { id: "kDTu1XJf4Ww", title: "Past Perfect Tense Konu Anlatımı (-mişli geçmiş zaman)", author: "Orkun Londoner" },
          { id: "vwJm_bbIAVU", title: "Past Perfect Tense (GEÇMİŞİN GEÇMİŞİ) | Konu Anlatımı", author: "Full up English" },
          { id: "qfLvzAW1sJ0", title: "Amerikanca Kültür | Past Perfect Tense Nedir?", author: "Amerikan Kültür" }
        ]
      },
      {
        id: "vid_future_will",
        tense_key: "future_will",
        title: "8. Ders: Future Tenses (Will vs Be Going To - Gelecek Zaman)",
        topic: "Future Simple & Going To",
        description: "Gelecek zaman farkları: Anlık kararlar (Will) ile Önceden Planlanmış niyetler (Be Going to).",
        duration: "16 Dk",
        level: "A2",
        search_query: "Future Tense Will Going To konu anlatımı türkçe",
        videos: [
          { id: "uS4fClJEkF4", title: "İngilizcede Future Tense’i Detaylıca Öğren! (Be going to & Will)", author: "Ayse Eser" },
          { id: "Q3hQ8-ymE8I", title: "Will vs Be Going To Konu Anlatımı ve Farkı", author: "Ders Hane" },
          { id: "rY1qXWCAzSg", title: "Will vs Going to – Aynı gibi ama aslında değil!", author: "Orkun Londoner" }
        ]
      },
      {
        id: "vid_future_advanced",
        tense_key: "future_continuous",
        title: "9. Ders: Future Continuous & Future Perfect (will be V-ing / will have V3)",
        topic: "Future Continuous & Perfect",
        description: "Gelecekte belirli bir anda yapıyor olacak (Future Cont) ve gelecekte tamamlanmış olacak (Future Perfect).",
        duration: "15 Dk",
        level: "B1",
        search_query: "Future Continuous Tense konu anlatımı türkçe",
        videos: [
          { id: "85yIJOKGbvw", title: "Future Continuous Tense Konu Anlatımı", author: "Ms. Jasmin ELT" },
          { id: "XhtVc1Rqy2w", title: "Future Continuous Tense Konu Anlatımı #56", author: "Özer Kiraz (İngilizce Konu Anlatımı)" },
          { id: "adh6IYE5Suc", title: "Future Continuous Tense Konu Anlatımı - Ders 53", author: "Çağrı Hoca ile İngilizce Öğren" }
        ]
      },
      {
        id: "vid_modals_can_must_should",
        tense_key: "modal_can",
        title: "10. Ders: Modals (Can, Could, Must, Have to, Should - İngilizce Kipler)",
        topic: "Modals (Kipler)",
        description: "Yetenek (Can), Geçmiş Yetenek (Could), Zorunluluk (Must / Have to) ve Tavsiye (Should) cümleleri kurma.",
        duration: "17 Dk",
        level: "A2-B1",
        search_query: "İngilizce Modals Can Must Should konu anlatımı türkçe",
        videos: [
          { id: "yi6K5ndAF0M", title: "Can, Could, Must, Should, Might, May Artık Kafanı Karıştırmayacak", author: "Attack English House" },
          { id: "HIts3PW1GrY", title: "Must / Have to Farkı / Modals Konu Anlatımı", author: "English with Mami" },
          { id: "fvp90lio9WA", title: "Must ve Should Kipleri Kullanımı", author: "Çilem Akar" }
        ]
      },
      {
        id: "vid_modals_possibility",
        tense_key: "modal_may",
        title: "11. Ders: Modals of Possibility (May, Might, Would, Would like to)",
        topic: "Olasılık & Tercih Modalları",
        description: "Olasılık ve ihtimal bildiren kipler (May, Might) ve kibar istek/tercih kalıpları (Would like to / Would rather).",
        duration: "14 Dk",
        level: "B1",
        search_query: "İngilizce May Might Could Modals konu anlatımı",
        videos: [
          { id: "QCYWiRpMBz8", title: "May, Might, Can, Could (Olasılık Kipleri) #37", author: "Özer Kiraz (İngilizce Konu Anlatımı)" },
          { id: "hLDj3gfyr2U", title: "TEK VİDEODA TÜM MODALLAR (can, could, should, would, may, might)", author: "Çilem Akar" },
          { id: "YMmTSV_WHZ8", title: "İngilizce Yardımcı Fiilleri (Modal Verbs) 20 Dakikada Öğren", author: "Ayse Eser" },
          { id: "1iM_8bmfvuE", title: "MODALS KONU ANLATIMI (Can, Could, Must, May, Might)", author: "Ozan Hoca" }
        ]
      },
      {
        id: "vid_used_to",
        tense_key: "used_to",
        title: "12. Ders: Used to & Would (Eski Alışkanlıklar & Eskiden Yapardım)",
        topic: "Used to",
        description: "Geçmişte düzenli yapılıp artık terkedilen alışkanlıklar ve durumları ifade etme.",
        duration: "11 Dk",
        level: "B1",
        search_query: "Used to konu anlatımı ingilizce türkçe",
        videos: [
          { id: "nc3ymcJr2XU", title: "İngilizce’de used to / be used to / get used to kalıpları", author: "İngilizce Bizde" },
          { id: "BVpJzlJEmCA", title: "“Used to” kalıbı nasıl kullanılır?", author: "İngilizce Bizde" },
          { id: "24cssemYllY", title: "60 Saniyede İngilizce - ‘USED TO: ALIŞKANLIKLAR’", author: "İngilizce Ufukta" }
        ]
      },
      {
        id: "vid_conditionals_if",
        tense_key: "conditionals",
        title: "13. Ders: If Clauses (Conditionals: Type 0, 1, 2, 3 - Şart Cümleleri)",
        topic: "If Clauses (Şart Cümleleri)",
        description: "Genel gerçekler (Type 0), Olası gelecek (Type 1), Hayali şimdiki zaman (Type 2) ve Geçmiş pişmanlıklar (Type 3).",
        duration: "20 Dk",
        level: "A2-B1-B2",
        search_query: "If Clauses Type 0 1 2 3 konu anlatımı türkçe",
        videos: [
          { id: "oTWI0C9HjvU", title: "IF CLAUSE Konu Anlatımı (CONDITIONALS Type 0, 1, 2, 3)", author: "Ozan Hoca" },
          { id: "BdH0Wh0YIXs", title: "IF CLAUSE TYPE 0 & 1 HEM DE 10 DAKİKADA!", author: "FK LANGUAGE" },
          { id: "o2lSbkcZ73c", title: "Conditional Sentences Type 0 & Type 1 Konu Anlatımı", author: "Orkun Londoner" },
          { id: "qE7pqSVh5mQ", title: "If Clause (Şart Cümlecikleri) Konu Anlatımı", author: "Full up English" }
        ]
      },
      {
        id: "vid_wish_clauses",
        tense_key: "wish_clauses",
        title: "14. Ders: Wish Clauses & Regrets (Keşke Cümleleri ve Pişmanlıklar)",
        topic: "Wish Clauses (Dilek Cümleleri)",
        description: "Şimdiki zaman dilekleri (I wish I had...) ve geçmiş pişmanlıklar (I wish I had done...) kalıpları.",
        duration: "16 Dk",
        level: "B1",
        search_query: "Wish Clauses konu anlatımı ingilizce türkçe",
        videos: [
          { id: "I9tlfeKIlJw", title: "Wish Clause Konu Anlatımı (Keşke Cümleleri)", author: "Ms. Jasmin ELT" },
          { id: "-5H5qYLVaZw", title: "Wish clause / Keşke Kalıpları Detaylı", author: "Çağla Aydoğdu" },
          { id: "KFT4_VsL-80", title: "Wish Clauses Pratik Cümle Kurma", author: "Furkitalk" }
        ]
      },
      {
        id: "vid_passive_voice",
        tense_key: "passive",
        title: "15. Ders: Passive Voice (Edilgen Çatı - be + Verb 3 Detaylı Anlatım)",
        topic: "Passive Voice (Edilgen Çatı)",
        description: "Eylemi yapan değil yapılan işin ön planda olduğu cümleler, tüm zamanlarda be + V3 ve by/with edatları.",
        duration: "22 Dk",
        level: "B1",
        search_query: "Passive Voice Edilgen Çatı konu anlatımı türkçe",
        videos: [
          { id: "U415FsKeE2g", title: "Passive Voice Konu Anlatımı #81", author: "Özer Kiraz (İngilizce Konu Anlatımı)" },
          { id: "Xcr3paf7FOg", title: "PASSIVE VOICE | Bu Konu Bu Kadar Kolay Mıydı?", author: "FK LANGUAGE" },
          { id: "1pEx4Gmu4G0", title: "PASSIVE VOICE (Türkçe Anlatım & B1 Seviye)", author: "Bircan Teacher" },
          { id: "Eognas2iXoY", title: "PASSIVE VOICE KONU ANLATIMI", author: "Sercan İgrek" }
        ]
      },
      {
        id: "vid_relative_clauses",
        tense_key: "relative_clauses",
        title: "16. Ders: Relative Clauses (Who, Which, That, Where, Whose - Sıfat Cümlecikleri)",
        topic: "Relative Clauses",
        description: "İki ayrı cümleyi tek bir akıcı cümleye bağlayarak insanları, nesneleri ve mekanları tanımlama kuralları.",
        duration: "19 Dk",
        level: "B1",
        search_query: "Relative Clauses konu anlatımı ingilizce türkçe",
        videos: [
          { id: "oFknXglYI3g", title: "RELATIVE CLAUSES KONU ANLATIMI", author: "Ms. Jasmin ELT" },
          { id: "84FD2kZ8FUQ", title: "5 Dakikada Relative Clauses", author: "Tonguç Akademi" },
          { id: "kGcgolKBV_E", title: "Relative Clause Konu Anlatımı - Ders 68", author: "Çağrı Hoca ile İngilizce Öğren" },
          { id: "V8BoyN2vq_Y", title: "RELATIVE CLAUSE Konu Anlatımı (Who, Which, That, Whose)", author: "Ozan Hoca" }
        ]
      },
      {
        id: "vid_reported_speech",
        tense_key: "reported_speech",
        title: "17. Ders: Reported Speech (Dolaylı Anlatım & Söz Aktarımı)",
        topic: "Reported Speech (Dolaylı Anlatım)",
        description: "Birinin söylediği sözü başkasına aktarma, zaman kaymaları (tense backshift) ve emir/istek cümleleri (tell/ask to).",
        duration: "21 Dk",
        level: "B1",
        search_query: "Reported Speech Dolaylı Anlatım konu anlatımı türkçe",
        videos: [
          { id: "o1U6u69D0Es", title: "REPORTED SPEECH ASLINDA ÇOK KOLAY! DERS 9", author: "FK LANGUAGE" },
          { id: "noQ9BnEU6pQ", title: "Reported Speech Konu Anlatımı #88", author: "Özer Kiraz (İngilizce Konu Anlatımı)" },
          { id: "7ZwYNI6BUcE", title: "REPORTED SPEECH KONU ANLATIMI (Direct & Indirect Speech)", author: "Ms. Jasmin ELT" }
        ]
      },
      {
        id: "vid_gerund_infinitive",
        tense_key: "gerund_infinitive",
        title: "18. Ders: Gerunds & Infinitives (Fiilimsiler: V-ing ve to Verb Kullanımı)",
        topic: "Gerund & Infinitive",
        description: "Hangi fiillerden sonra -ing gelir (enjoy, avoid, mind), hangilerinden sonra to V1 gelir (decide, want, promise).",
        duration: "18 Dk",
        level: "B1",
        search_query: "Gerund and Infinitive konu anlatımı türkçe",
        videos: [
          { id: "ixj1hZasgk8", title: "İngilizce'de Gerund ve Infinitive Konusunu 20 Dakikada Öğrenin!", author: "Ayse Eser" },
          { id: "fY9zGe94hK4", title: "Gerunds & Infinitives Konu Anlatımı #72", author: "Özer Kiraz (İngilizce Konu Anlatımı)" },
          { id: "YasNC52sTlk", title: "Gerund & Infinitive Konu Anlatımı", author: "Ms. Jasmin ELT" }
        ]
      },
      {
        id: "vid_conjunctions",
        tense_key: "conjunctions",
        title: "19. Ders: Conjunctions & Transitions (Bağlaçlar: Because, Although, So that, However)",
        topic: "Bağlaçlar (Conjunctions)",
        description: "Sebep-sonuç (because, due to), Zıtlık (although, however) ve Amaç bildiren bağlaçlar (so that, in order to).",
        duration: "20 Dk",
        level: "A2-B1",
        search_query: "İngilizce Bağlaçlar Conjunctions konu anlatımı türkçe",
        videos: [
          { id: "2NrcuuPTHv0", title: "İNGİLİZCEDE BAĞLAÇLAR NASIL KULLANILIR?", author: "Learn English With Chunks" },
          { id: "Q0NKL4l4-uE", title: "İNGİLİZCEDE BİLMEN GEREKEN 5 BAĞLAÇ", author: "Multiverse of English" },
          { id: "gNQ-zSyfdiI", title: "As long as, as soon as, although kullanımları", author: "Çilem Akar" }
        ]
      },
      {
        id: "vid_causatives",
        tense_key: "causatives",
        title: "20. Ders: Causatives (Ettirgen Çatı: Have / Make / Get something done)",
        topic: "Causatives (Ettirgen Çatı)",
        description: "Bir işi başkasına yaptırma kalıpları (have something done, make someone do something).",
        duration: "14 Dk",
        level: "B1",
        search_query: "Causatives Have Make Get konu anlatımı türkçe",
        videos: [
          { id: "GM9RT0RncgQ", title: "Causative Verbs Konu Anlatımı (Make, Have, Get, Let) #85", author: "Özer Kiraz (İngilizce Konu Anlatımı)" },
          { id: "JsxmNhluwK0", title: "CAUSATIVES Konu Anlatımı / Ettirgen Fiiller", author: "Orkun Londoner" },
          { id: "7h1eq8cpe2Y", title: "CAUSATIVES / ETTİRGEN YAPILAR (ADVANCED)", author: "FK LANGUAGE" }
        ]
      },
      {
        id: "vid_superlatives",
        tense_key: "superlatives",
        title: "21. Ders: Comparatives & Superlatives (Karşılaştırma ve En Üstünlük)",
        topic: "Comparatives & Superlatives",
        description: "Sıfatlarda daha üstün (-er / more than) ve en üstün (-est / the most) derecelendirme kuralları.",
        duration: "14 Dk",
        level: "A2",
        search_query: "Comparative and Superlative konu anlatımı türkçe",
        videos: [
          { id: "0ZJnHbbnOII", title: "Comparatives ve Superlatives Konu Anlatımı", author: "Let's Improve Our English" },
          { id: "zmh-u6YDdHI", title: "Comparative & Superlative Adjectives Anlatımı", author: "Enjoy English With Bahar" },
          { id: "ubnDq5BcZpg", title: "Comparative and Superlative in English", author: "English with Mu7mad" }
        ]
      },
      {
        id: "vid_tag_questions",
        tense_key: "tag_questions",
        title: "22. Ders: Question Tags (Soru Ekleri - değil mi?)",
        topic: "Question Tags (Soru Ekleri)",
        description: "Cümle sonuna eklenen onaylatma soruları (You are a student, aren't you? / She didn't come, did she?).",
        duration: "12 Dk",
        level: "A2-B1",
        search_query: "Question Tags Soru Ekleri konu anlatımı türkçe",
        videos: [
          { id: "z-ZrPJ4MqAM", title: "Question Tags | Tag Questions Konu Anlatımı", author: "Ms. Jasmin ELT" },
          { id: "98qHAWsN0Oc", title: "İngilizce Tag Questions (Değil mi?) - Ders 58", author: "Çağrı Hoca ile İngilizce Öğren" },
          { id: "ODBHD7RyhJU", title: "Question Tags (Soru Ekleri) Orta Seviye #95", author: "Aksen Kahraman" },
          { id: "qRojtqprIIE", title: "Question Tags (Değil mi?) Konu Anlatımı", author: "Full up English" }
        ]
      }
    ];

    // Listen for YouTube iframe messages for error recovery
    this.setupYouTubeErrorListener();
  }

  setupYouTubeErrorListener() {
    window.addEventListener('message', (event) => {
      try {
        if (event.origin && event.origin.includes('youtube.com')) {
          const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          if (data && data.event === 'onError') {
            console.warn('YouTube Video Error Detected (Code ' + data.info + '). Auto-switching to alternative video...');
            this.handlePlaybackError();
          }
        }
      } catch (e) {}
    });
  }

  handlePlaybackError() {
    if (this.currentModalLesson) {
      if (window.app) {
        window.app.showToast('🔄 Video açılamadı. Aynı konudan alternatif video yükleniyor...');
      }
      this.rotateModalVideo();
    }
  }

  getAllVideos() {
    return this.defaultVideoLessons.map(lesson => {
      const activeIdx = this.activeVideoIndices[lesson.id] || 0;
      const v = lesson.videos[activeIdx] || lesson.videos[0];
      return {
        ...lesson,
        video_id: v.id,
        current_video_title: v.title,
        current_author: v.author,
        url: `https://www.youtube.com/watch?v=${v.id}`
      };
    });
  }

  /**
   * Akıllı Rotasyon: Her seferinde farklı video seçer, izlenenleri öncelikli olarak eler!
   */
  getSmartNextVideo() {
    const allLessons = this.defaultVideoLessons;
    const watched = this.watchedVideos;
    const history = this.videoHistory;

    // 1. Henüz hiç bir videosu izlenmemiş dersleri bul
    const unwatchedLessons = [];
    allLessons.forEach(lesson => {
      const unwatchedVideos = lesson.videos.filter(v => !watched.includes(v.id));
      if (unwatchedVideos.length > 0) {
        unwatchedLessons.push({ lesson, availableVideos: unwatchedVideos });
      }
    });

    if (unwatchedLessons.length > 0) {
      // Rastgele veya sıra ile izlenmemiş dersten bir video seç
      const chosen = unwatchedLessons[Math.floor(Math.random() * unwatchedLessons.length)];
      const chosenVideo = chosen.availableVideos[Math.floor(Math.random() * chosen.availableVideos.length)];
      const videoIndex = chosen.lesson.videos.findIndex(v => v.id === chosenVideo.id);
      
      this.activeVideoIndices[chosen.lesson.id] = videoIndex;

      return {
        lesson: chosen.lesson,
        video: chosenVideo,
        video_id: chosenVideo.id,
        title: chosen.lesson.title,
        topic: chosen.lesson.topic,
        description: chosen.lesson.description,
        author: chosenVideo.author,
        videoIndex: videoIndex,
        totalAlternatives: chosen.lesson.videos.length,
        searchQuery: chosen.lesson.search_query
      };
    }

    // 2. Eğer tüm videolar izlendiyse, en uzun süredir izlenmemiş olanı bul
    let leastRecentVideo = null;
    let leastRecentLesson = allLessons[0];
    let leastRecentIndex = 0;
    let oldestTimestamp = Infinity;

    allLessons.forEach(lesson => {
      lesson.videos.forEach((v, idx) => {
        const histEntry = history.find(h => h.id === v.id);
        const lastSeen = histEntry ? histEntry.time : 0;
        if (lastSeen < oldestTimestamp) {
          oldestTimestamp = lastSeen;
          leastRecentVideo = v;
          leastRecentLesson = lesson;
          leastRecentIndex = idx;
        }
      });
    });

    const fallbackVideo = leastRecentVideo || allLessons[0].videos[0];
    this.activeVideoIndices[leastRecentLesson.id] = leastRecentIndex;

    return {
      lesson: leastRecentLesson,
      video: fallbackVideo,
      video_id: fallbackVideo.id,
      title: leastRecentLesson.title,
      topic: leastRecentLesson.topic,
      description: leastRecentLesson.description,
      author: fallbackVideo.author,
      videoIndex: leastRecentIndex,
      totalAlternatives: leastRecentLesson.videos.length,
      searchQuery: leastRecentLesson.search_query
    };
  }

  getVideoForTense(tenseKey) {
    const all = this.defaultVideoLessons;
    const lesson = all.find(l => l.tense_key === tenseKey) || all[0];
    const unwatched = lesson.videos.find(v => !this.watchedVideos.includes(v.id));
    const activeVideo = unwatched || lesson.videos[this.activeVideoIndices[lesson.id] || 0] || lesson.videos[0];

    return {
      id: lesson.id,
      tense_key: lesson.tense_key,
      title: lesson.title,
      topic: lesson.topic,
      description: lesson.description,
      duration: lesson.duration,
      video_id: activeVideo.id,
      author: activeVideo.author,
      searchQuery: lesson.search_query,
      videos: lesson.videos
    };
  }

  render() {
    const container = document.getElementById('grammar-content-area');
    if (!container) return;

    const modules = APP_DATA.grammar_modules || [];
    const videoLessons = this.getFilteredVideos();
    const svomptRules = APP_DATA.svompt_rules || [];
    const totalVideosCount = this.defaultVideoLessons.reduce((acc, cur) => acc + cur.videos.length, 0);
    const watchedCount = this.watchedVideos.length;

    container.innerHTML = `
      <!-- SVOMPT Overview Card -->
      <div class="hero-card" style="margin-bottom:16px;">
        <span class="hero-badge">📐 Temel Cümle Dizilimi</span>
        <h3>İngilizce SVOMPT Kuralı</h3>
        <p>Türkçe'de fiil en sonda yer alırken, İngilizce'de <strong>fiil daima özneden hemen sonra</strong> gelir!</p>
        
        <div style="display:flex; flex-direction:column; gap:8px; margin-top:6px;">
          ${svomptRules.map(r => `
            <div style="background:var(--bg-surface); padding:8px 12px; border-radius:var(--radius-md); border-left:3px solid ${r.color};">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong style="color:${r.color}; font-size:0.85rem;">${r.code} - ${r.name}</strong>
                <span style="font-size:0.75rem; color:var(--text-secondary);">${r.question}</span>
              </div>
              <p style="font-size:0.78rem; color:var(--text-secondary); margin-top:2px;">${r.description}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- YouTube Video Lessons & Search Section -->
      <div class="controls-card" style="margin-bottom:16px; border: 2px solid rgba(239, 68, 68, 0.4);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:6px;">
          <div>
            <span class="hero-badge" style="background:rgba(239, 68, 68, 0.2); color:#ef4444;">🎥 VİDEO DERS AKADEMİSİ (22 KONU • ${totalVideosCount}+ DOĞRULANMIŞ VİDEO)</span>
            <h3 style="font-size:1.1rem; font-weight:800; color:var(--text-primary); margin-top:4px;">
              Türkçe Anlatımlı Zengin Gramer Eğitimleri
            </h3>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:0.75rem; font-weight:800; color:var(--primary); background:rgba(56,189,248,0.15); padding:4px 8px; border-radius:12px;">
              İzlenen: ${watchedCount} / ${totalVideosCount}
            </span>
            <span style="font-size:0.75rem; font-weight:800; color:var(--success); background:rgba(34,197,94,0.15); padding:4px 8px; border-radius:12px;">
              Her Video +10 XP ⭐
            </span>
          </div>
        </div>

        <p style="font-size:0.82rem; color:var(--text-secondary); margin-bottom:12px;">
          Zamanlar, If Clauses, Wish Clauses, Passive Voice, Reported Speech, Modallar ve Bağlaçlar dahil tüm konuların Türkçe anlatımlı video dersleri (Her konuda birden fazla alternatif öğretmen seçeneği):
        </p>

        <!-- Video Search Input -->
        <div class="search-input-wrapper" style="margin-bottom:12px;">
          <span class="search-icon">🔍</span>
          <input type="text" class="search-input" placeholder="YouTube dersi ara (örn: If Clauses, Wish, Passive, Modals, Simple Past)..."
                 value="${this.videoSearchQuery}" oninput="grammarView.setVideoSearch(this.value)">
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:12px;">
          ${videoLessons.map((lesson, i) => {
            const activeIdx = this.activeVideoIndices[lesson.id] || 0;
            const currentVideo = lesson.videos[activeIdx] || lesson.videos[0];
            const isWatched = this.watchedVideos.includes(currentVideo.id);
            const totalWatchedInLesson = lesson.videos.filter(v => this.watchedVideos.includes(v.id)).length;

            return `
              <div style="background:var(--bg-card); border:1px solid ${isWatched ? 'var(--success)' : 'var(--border-subtle)'}; border-radius:var(--radius-md); padding:14px; display:flex; flex-direction:column; justify-content:space-between; gap:10px;">
                <div>
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <span style="font-size:0.72rem; font-weight:800; color:var(--danger); background:rgba(239,68,68,0.15); padding:2px 8px; border-radius:6px;">
                      ▶ DERS ${i+1}
                    </span>
                    <div style="display:flex; align-items:center; gap:6px;">
                      <span style="font-size:0.7rem; color:var(--primary); background:rgba(56,189,248,0.12); padding:2px 6px; border-radius:6px;">
                        🎥 ${lesson.videos.length} Eğitmen
                      </span>
                      ${isWatched ? '<span style="font-size:0.72rem; font-weight:800; color:var(--success);">✅ İzlendi</span>' : ''}
                    </div>
                  </div>
                  <h4 style="font-size:0.92rem; font-weight:800; color:var(--text-primary); line-height:1.3;">${lesson.title}</h4>
                  
                  <div style="font-size:0.76rem; color:var(--text-muted); margin-top:4px; display:flex; align-items:center; gap:4px;">
                    <span>👨‍🏫 Anlatan:</span> 
                    <strong style="color:var(--text-secondary);">${currentVideo.author}</strong>
                  </div>

                  <p style="font-size:0.78rem; color:var(--text-secondary); margin-top:4px; line-height:1.4;">${lesson.description}</p>
                </div>
                
                <!-- Lesson Footer & Alternatif Butonları -->
                <div>
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; gap:6px; flex-wrap:wrap;">
                    <button class="btn-video-watch" style="background:#ef4444; color:#ffffff; border:none; padding:8px 14px; border-radius:var(--radius-full); font-weight:700; font-size:0.8rem; cursor:pointer; display:inline-flex; align-items:center; gap:5px;" 
                            onclick="grammarView.openVideoModal('${lesson.id}', ${activeIdx})">
                      ▶ Videoyu İzle
                    </button>

                    ${lesson.videos.length > 1 ? `
                      <button class="btn-secondary" style="padding:6px 10px; font-size:0.74rem; background:rgba(255,255,255,0.06);" 
                              title="Başka bir öğretmenden dinle" onclick="grammarView.rotateCardVideo('${lesson.id}')">
                        🔄 Başka Öğretmen (${activeIdx + 1}/${lesson.videos.length})
                      </button>
                    ` : ''}

                    ${!isWatched ? `
                      <button class="btn-secondary" style="padding:6px 10px; font-size:0.75rem;" onclick="grammarView.markVideoWatched('${currentVideo.id}', '${lesson.id}')">
                        İzledim (+10 XP)
                      </button>
                    ` : `
                      <span style="font-size:0.75rem; color:var(--success); font-weight:700;">Tamamlandı ⭐</span>
                    `}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 17 Modules Accordion -->
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
  }

  
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
                                onclick="event.stopPropagation(); grammarView.speakText('${rule.en.replace(/'/g, "\\'")}')">
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


  getFilteredVideos() {
    let list = this.defaultVideoLessons;
    if (this.videoSearchQuery.trim() !== '') {
      const q = this.videoSearchQuery.toLowerCase().trim();
      list = list.filter(l => 
        (l.title && l.title.toLowerCase().includes(q)) || 
        (l.description && l.description.toLowerCase().includes(q)) ||
        (l.topic && l.topic.toLowerCase().includes(q)) ||
        (l.videos && l.videos.some(v => v.title.toLowerCase().includes(q) || v.author.toLowerCase().includes(q)))
      );
    }
    return list;
  }

  setVideoSearch(val) {
    this.videoSearchQuery = val;
    this.render();
  }

  toggleModule(moduleId) {
    this.expandedModuleId = this.expandedModuleId === moduleId ? null : moduleId;
    this.render();
  }

  rotateCardVideo(lessonId) {
    const lesson = this.defaultVideoLessons.find(l => l.id === lessonId);
    if (!lesson) return;
    const current = this.activeVideoIndices[lessonId] || 0;
    this.activeVideoIndices[lessonId] = (current + 1) % lesson.videos.length;
    this.render();
  }

  openVideoModal(lessonIdOrVideoId, explicitIndex = null) {
    let lesson = this.defaultVideoLessons.find(l => l.id === lessonIdOrVideoId);
    let videoIndex = 0;

    if (lesson) {
      if (explicitIndex !== null && explicitIndex >= 0 && explicitIndex < lesson.videos.length) {
        videoIndex = explicitIndex;
      } else {
        // Otomatik olarak daha önce izlenmemiş videoyu seç
        const unwatchedIdx = lesson.videos.findIndex(v => !this.watchedVideos.includes(v.id));
        videoIndex = unwatchedIdx !== -1 ? unwatchedIdx : (this.activeVideoIndices[lesson.id] || 0);
      }
    } else {
      // Find lesson containing the videoId
      lesson = this.defaultVideoLessons.find(l => l.videos.some(v => v.id === lessonIdOrVideoId)) || this.defaultVideoLessons[0];
      const foundIdx = lesson.videos.findIndex(v => v.id === lessonIdOrVideoId);
      videoIndex = foundIdx !== -1 ? foundIdx : 0;
    }

    this.currentModalLesson = lesson;
    this.currentModalIndex = videoIndex;
    this.activeVideoIndices[lesson.id] = videoIndex;

    const modal = document.getElementById('video-modal');
    const modalTitle = document.getElementById('video-modal-title');
    const videoWrapper = document.getElementById('video-modal-iframe-wrapper');

    if (!modal || !modalTitle || !videoWrapper) return;

    const currentVid = lesson.videos[videoIndex] || lesson.videos[0];
    const isWatched = this.watchedVideos.includes(currentVid.id);

    // Record impression in history
    this.recordVideoImpression(currentVid.id);

    modalTitle.textContent = currentVid.topic_name ? `${lesson.title} (${currentVid.topic_name})` : `${lesson.title} - ${currentVid.author}`;
    videoWrapper.innerHTML = `
      <!-- Video Player Frame -->
      <div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:12px; background:#000;">
        <iframe id="active-youtube-iframe"
                src="https://www.youtube.com/embed/${currentVid.id}?autoplay=1&enablejsapi=1&rel=0" 
                style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowfullscreen>
        </iframe>
      </div>

      <!-- Sub-Topic & Video Lessons Selector Tabs -->
      ${lesson.videos.length > 1 ? `
        <div style="display:flex; gap:8px; overflow-x:auto; padding:10px 4px; border-bottom:1px solid var(--border-subtle); margin-bottom:10px; -webkit-overflow-scrolling:touch;">
          ${lesson.videos.map((v, idx) => {
            const isCurrent = idx === videoIndex;
            const watched = this.watchedVideos.includes(v.id);
            const label = v.topic_name || v.badge || `${idx + 1}. Anlatım: ${v.author}`;
            return `
              <button style="padding:8px 14px; border-radius:var(--radius-full); font-size:0.78rem; font-weight:700; border:1px solid ${isCurrent ? '#38bdf8' : 'rgba(255,255,255,0.15)'}; background:${isCurrent ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.06)'}; color:${isCurrent ? '#38bdf8' : 'var(--text-secondary)'}; cursor:pointer; white-space:nowrap; display:inline-flex; align-items:center; gap:6px; transition:all 0.2s ease; box-shadow:${isCurrent ? '0 0 10px rgba(56,189,248,0.25)' : 'none'};"
                      onclick="grammarView.switchModalAlternative(${idx})"
                      title="${v.title}">
                <span>${watched ? '✅' : '▶'}</span>
                <span>${label}</span>
                <span style="font-size:0.7rem; opacity:0.75; margin-left:2px;">(${v.author})</span>
              </button>
            `;
          }).join('')}
        </div>
      ` : ''}

      <!-- Smart Fallback & Info Action Bar -->
      <div style="background:var(--bg-surface); padding:12px 16px; border-radius:var(--radius-md); margin-top:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <div>
            <div style="font-size:0.88rem; font-weight:800; color:var(--text-primary);">${currentVid.title}</div>
            <div style="font-size:0.78rem; color:var(--text-muted); margin-top:3px;">
              👨‍🏫 Eğitmen: <strong style="color:var(--text-secondary);">${currentVid.author}</strong> • 🎯 Konu: <strong style="color:#38bdf8;">${currentVid.badge || currentVid.topic_name || lesson.topic}</strong>
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            ${lesson.videos.length > 1 ? `
              <button class="btn-secondary" style="padding:7px 14px; font-size:0.8rem; background:rgba(56,189,248,0.15); color:#38bdf8; border:1px solid rgba(56,189,248,0.3); border-radius:var(--radius-md); cursor:pointer; display:flex; align-items:center; gap:6px; font-weight:700;" 
                      onclick="grammarView.rotateModalVideo()" title="Sonraki alt konuyu veya videoyu izle">
                🔄 Sonraki Konu / Video Değiştir (${videoIndex + 1}/${lesson.videos.length})
              </button>
            ` : ''}

            <a href="https://www.youtube.com/watch?v=${currentVid.id}" target="_blank" 
               style="color:var(--primary); font-size:0.8rem; font-weight:700; text-decoration:none; display:inline-flex; align-items:center; gap:4px; padding:7px 12px; background:rgba(56,189,248,0.1); border-radius:var(--radius-md);">
              🌐 YouTube'da Aç ↗
            </a>

            <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(lesson.search_query)}" target="_blank" 
               style="color:var(--text-muted); font-size:0.78rem; text-decoration:none; padding:7px 12px; background:rgba(255,255,255,0.05); border-radius:var(--radius-md);" title="Bu konuda YouTube'da yüzlerce video ara">
              🔍 Konuyu Ara
            </a>

            ${!isWatched ? `
              <button class="btn-primary" style="padding:8px 16px; font-size:0.82rem;" onclick="grammarView.markVideoWatched('${currentVid.id}', '${lesson.id}')">
                ⭐ Dersi İzledim (+10 XP)
              </button>
            ` : `
              <span style="font-size:0.8rem; color:var(--success); font-weight:800; background:rgba(34,197,94,0.15); padding:6px 12px; border-radius:var(--radius-md);">
                ✅ İzlendi (+10 XP Kazanıldı)
              </span>
            `}
          </div>
        </div>

        <!-- Live Custom YouTube Search / URL Input Box -->
        <div style="margin-top:10px; padding-top:8px; border-top:1px solid rgba(255,255,255,0.08); display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
          <input type="text" id="video-modal-custom-search" 
                 placeholder="Başka bir eğitmen veya konu ara (örn: 9. sınıf ${lesson.topic} Tonguç, Önder Hoca)..." 
                 value="${lesson.search_query || ''}"
                 style="flex:1; min-width:220px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.15); border-radius:var(--radius-md); padding:8px 12px; font-size:0.78rem; color:#ffffff; outline:none;"
                 onkeydown="if(event.key==='Enter') grammarView.searchCustomVideo(this.value)">
          <button class="btn-primary" style="padding:8px 14px; font-size:0.78rem; display:flex; align-items:center; gap:6px;" 
                  onclick="grammarView.searchCustomVideo(document.getElementById('video-modal-custom-search').value)">
            <span>🔍</span>
            <span>YouTube'da Ara</span>
          </button>
        </div>

        <!-- Otomatik Kurtarma Rehber Notu -->
        <div style="font-size:0.74rem; color:var(--text-muted); margin-top:8px; border-top:1px solid rgba(255,255,255,0.06); padding-top:6px; display:flex; justify-content:space-between; align-items:center;">
          <span>💡 Video açılmazsa üstteki <strong>"🔄 Sonraki Konu / Video Değiştir"</strong> butonuna basın, alternatif eğitmen sekmelerine tıklayın veya YouTube'da aratın.</span>
        </div>
      </div>
    `;

    modal.classList.add('active');
  }

  searchCustomVideo(query) {
    if (!query || !query.trim()) return;
    const cleanQ = encodeURIComponent(query.trim());
    window.open(`https://www.youtube.com/results?search_query=${cleanQ}`, '_blank');
  }

  switchModalAlternative(newIndex) {
    if (!this.currentModalLesson) return;
    this.openVideoModal(this.currentModalLesson.id, newIndex);
  }

  rotateModalVideo() {
    if (!this.currentModalLesson) return;
    const nextIdx = (this.currentModalIndex + 1) % this.currentModalLesson.videos.length;
    this.openVideoModal(this.currentModalLesson.id, nextIdx);
  }

  closeVideoModal() {
    const modal = document.getElementById('video-modal');
    const videoWrapper = document.getElementById('video-modal-iframe-wrapper');
    if (modal) modal.classList.remove('active');
    if (videoWrapper) videoWrapper.innerHTML = '';
    this.currentModalLesson = null;
  }

  recordVideoImpression(videoId) {
    const existing = this.videoHistory.findIndex(h => h.id === videoId);
    if (existing !== -1) {
      this.videoHistory[existing].time = Date.now();
    } else {
      this.videoHistory.push({ id: videoId, time: Date.now() });
    }
    // Keep max 50 in history
    if (this.videoHistory.length > 50) {
      this.videoHistory.shift();
    }
    localStorage.setItem('english_app_video_history', JSON.stringify(this.videoHistory));
  }

  markVideoWatched(videoId, lessonId = null) {
    if (!this.watchedVideos.includes(videoId)) {
      this.watchedVideos.push(videoId);
      localStorage.setItem('english_app_watched_videos', JSON.stringify(this.watchedVideos));
      this.recordVideoImpression(videoId);

      if (window.app) {
        window.app.addXP(10);
        window.app.showToast('🎉 Tebrikler! Video Dersi Tamamlandı (+10 XP)');
      }
      this.render();

      // If modal is open, refresh modal action bar
      if (this.currentModalLesson) {
        this.openVideoModal(this.currentModalLesson.id, this.currentModalIndex);
      }
    } else {
      if (window.app) window.app.showToast('✅ Bu dersi daha önce izlediniz!');
    }
  }
}

// Global instance
window.grammarView = new GrammarView();
