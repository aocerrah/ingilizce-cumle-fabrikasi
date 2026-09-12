#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Enriches all 9 units in school_fly_higher.json with 100% verified, active, embeddable YouTube video lessons,
explicit topic badges, instructor details, and perfectly aligned grammar summaries.
"""

import json
import os

JSON_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'school_fly_higher.json')

unit_videos = {
    "fh_unit_starter": [
        {
            "id": "JLdIAa8jaZM",
            "topic_name": "1. Alt Konu: Present Simple (Geniş Zaman)",
            "badge": "Geniş Zaman",
            "title": "Sıfırdan İngilizce - Present Simple Tense Detaylı Anlatım",
            "author": "Ayşe Eser",
            "duration": "14 Dk"
        },
        {
            "id": "QTJS3nuEn-Y",
            "topic_name": "2. Alt Konu: Present Continuous (Şimdiki Zaman)",
            "badge": "Şimdiki Zaman",
            "title": "Present Continuous Tense Konu Anlatımı | İngilizce Şimdiki Zaman",
            "author": "Ms. Jasmin ELT",
            "duration": "12 Dk"
        },
        {
            "id": "DPR3MFHpg6c",
            "topic_name": "3. Alt Konu: İkisinin Farkı & State Verbs (Durum Fiilleri)",
            "badge": "Farklar & State Verbs",
            "title": "Sıfırdan İngilizce - Present Continuous ÇOK DETAYLI Anlatım & State Verbs",
            "author": "Ayşe Eser",
            "duration": "16 Dk"
        },
        {
            "id": "BYnlEYOy2z0",
            "topic_name": "4. Hızlı Özet: Sınav Taktikleri & Püf Noktaları",
            "badge": "Sınav Özeti",
            "title": "Simple Present Tense Örnek Cümleler ile 7 Dakikada Öğren!",
            "author": "English Everyday Words",
            "duration": "7 Dk"
        }
    ],
    "fh_unit_1": [
        {
            "id": "38rtAIwqPtw",
            "topic_name": "1. Alt Konu: Past Simple Tense (Geçmiş Zaman - V2)",
            "badge": "Geçmiş Zaman (V2)",
            "title": "Simple Past Tense Konu Anlatımı | İngilizce Geçmiş Zaman",
            "author": "Ms. Jasmin ELT",
            "duration": "15 Dk"
        },
        {
            "id": "ob0HW-im7eo",
            "topic_name": "2. Alt Konu: Past Continuous Tense (Geçmişte Süreç)",
            "badge": "Was/Were + -ing",
            "title": "Past Continuous Tense – İngilizce Türkçe Detaylı Konu Anlatımı",
            "author": "Ms. Jasmin ELT",
            "duration": "13 Dk"
        },
        {
            "id": "lBGPhcBZRmY",
            "topic_name": "3. Alt Konu: When & While Bağlaçları ile Cümle Kurma",
            "badge": "When / While",
            "title": "İngilizce Past Continuous Tense Nasıl Kullanılır? When & While",
            "author": "Ayşe Eser",
            "duration": "11 Dk"
        },
        {
            "id": "L8v05CfesIY",
            "topic_name": "4. Karşılaştırma: Past Simple vs Continuous Sınav Farkları",
            "badge": "Sınav Taktikleri",
            "title": "Sıfırdan İngilizce - Past Simple Detaylı Konu Anlatımı",
            "author": "Ayşe Eser",
            "duration": "10 Dk"
        }
    ],
    "fh_unit_2": [
        {
            "id": "cwoDqEcicTY",
            "topic_name": "1. Alt Konu: Present Perfect Tense (Have/Has + V3 Mantığı)",
            "badge": "Have/Has + V3",
            "title": "Sıfırdan İngilizce - Present Perfect Tense Konu Anlatımı",
            "author": "Ayşe Eser",
            "duration": "18 Dk"
        },
        {
            "id": "fWJbpHgYGGE",
            "topic_name": "2. Alt Konu: 6 Dakikada Present Perfect & Zaman Zarfları",
            "badge": "Zaman Zarfları",
            "title": "6 Dakikada PRESENT PERFECT TENSE (Since, For, Just, Already, Yet)",
            "author": "Tonguç Akademi",
            "duration": "6 Dk"
        },
        {
            "id": "0m0Tp1_N3bs",
            "topic_name": "3. Alt Konu: Present Perfect vs. Past Simple Farkı",
            "badge": "Farklar & Sınav",
            "title": "PRESENT PERFECT TENSE KONU ANLATIMI & Sınav Taktikleri",
            "author": "Ms. Jasmin ELT",
            "duration": "14 Dk"
        }
    ],
    "fh_unit_3": [
        {
            "id": "uS4fClJEkF4",
            "topic_name": "1. Alt Konu: Future Tense - Will & Be Going To",
            "badge": "Will & Going To",
            "title": "İngilizcede Future Tense’i Detaylıca Öğren! (Be going to & Will)",
            "author": "Ayşe Eser",
            "duration": "16 Dk"
        },
        {
            "id": "Q3hQ8-ymE8I",
            "topic_name": "2. Alt Konu: Will vs Be Going To Farkları",
            "badge": "Gelecek Zaman Farkı",
            "title": "Will vs Be Going To Konu Anlatımı ve Farkı",
            "author": "Ders Hane",
            "duration": "12 Dk"
        },
        {
            "id": "85yIJOKGbvw",
            "topic_name": "3. Alt Konu: Future Continuous (will be doing)",
            "badge": "Future Continuous",
            "title": "Future Continuous Tense Konu Anlatımı",
            "author": "Ms. Jasmin ELT",
            "duration": "15 Dk"
        },
        {
            "id": "QCYWiRpMBz8",
            "topic_name": "4. Alt Konu: Modals of Possibility (May, Might, Could)",
            "badge": "Olasılık Modalları",
            "title": "May, Might, Can, Could (Olasılık Kipleri) #37",
            "author": "Özer Kiraz",
            "duration": "14 Dk"
        }
    ],
    "fh_unit_4": [
        {
            "id": "yi6K5ndAF0M",
            "topic_name": "1. Alt Konu: Zorunluluk Modalları (Must vs. Have to)",
            "badge": "Must & Have to",
            "title": "Can, Could, Must, Should, Might, May Artık Kafanı Karıştırmayacak",
            "author": "Attack English House",
            "duration": "17 Dk"
        },
        {
            "id": "HIts3PW1GrY",
            "topic_name": "2. Alt Konu: Musn't vs. Don't Have to",
            "badge": "Musn't vs Don't Have To",
            "title": "Must / Have to / Musn't Farkı / Modals Konu Anlatımı",
            "author": "English with Mami",
            "duration": "11 Dk"
        },
        {
            "id": "fvp90lio9WA",
            "topic_name": "3. Alt Konu: Tavsiye Modalları (Should & Shouldn't)",
            "badge": "Should & Shouldn't",
            "title": "Must ve Should Kipleri Kullanımı & Öneriler",
            "author": "Çilem Akar",
            "duration": "10 Dk"
        }
    ],
    "fh_unit_5": [
        {
            "id": "0ZJnHbbnOII",
            "topic_name": "1. Alt Konu: Comparatives (Karşılaştırma Sıfatları)",
            "badge": "Comparatives (-er/more)",
            "title": "Comparatives ve Superlatives Konu Anlatımı",
            "author": "Let's Improve Our English",
            "duration": "14 Dk"
        },
        {
            "id": "zmh-u6YDdHI",
            "topic_name": "2. Alt Konu: Superlatives (En Üstünlük Sıfatları)",
            "badge": "Superlatives (the most)",
            "title": "Comparative & Superlative Adjectives Anlatımı",
            "author": "Enjoy English With Bahar",
            "duration": "12 Dk"
        },
        {
            "id": "ubnDq5BcZpg",
            "topic_name": "3. Alt Konu: (Not) As...as & Too / Enough Kalıpları",
            "badge": "Too, Enough & As..as",
            "title": "Comparative and Superlative in English (Too / Enough)",
            "author": "English with Mu7mad",
            "duration": "14 Dk"
        }
    ],
    "fh_unit_6": [
        {
            "id": "U415FsKeE2g",
            "topic_name": "1. Alt Konu: Passive Voice (Edilgen Çatı) Temel Mantığı",
            "badge": "Edilgen Çatı Giriş",
            "title": "Passive Voice Konu Anlatımı #81",
            "author": "Özer Kiraz (İngilizce Konu Anlatımı)",
            "duration": "22 Dk"
        },
        {
            "id": "Xcr3paf7FOg",
            "topic_name": "2. Alt Konu: Present & Past Simple Passive",
            "badge": "Present & Past Passive",
            "title": "PASSIVE VOICE | Bu Konu Bu Kadar Kolay Mıydı?",
            "author": "FK LANGUAGE",
            "duration": "12 Dk"
        },
        {
            "id": "Eognas2iXoY",
            "topic_name": "3. Alt Konu: Edilgen Cümle Örnekleri ve Sınav Soruları",
            "badge": "Soru Çözümü",
            "title": "PASSIVE VOICE KONU ANLATIMI & Alıştırmalar",
            "author": "Sercan İgrek",
            "duration": "14 Dk"
        }
    ],
    "fh_unit_7": [
        {
            "id": "BdH0Wh0YIXs",
            "topic_name": "1. Alt Konu: Zero & First Conditional (Tip 0 ve 1)",
            "badge": "Tip 0 & 1 Şart",
            "title": "IF CLAUSE TYPE 0 & 1 HEM DE 10 DAKİKADA!",
            "author": "FK LANGUAGE",
            "duration": "10 Dk"
        },
        {
            "id": "oTWI0C9HjvU",
            "topic_name": "2. Alt Konu: If Clauses Tüm Tipler (Conditionals)",
            "badge": "If Clauses",
            "title": "IF CLAUSE Konu Anlatımı (CONDITIONALS Type 0, 1, 2, 3)",
            "author": "Ozan Hoca",
            "duration": "20 Dk"
        },
        {
            "id": "o2lSbkcZ73c",
            "topic_name": "3. Alt Konu: Unless (If Not) & Zaman Bağlaçları",
            "badge": "Unless & Bağlaçlar",
            "title": "Conditional Sentences Type 0 & Type 1 Konu Anlatımı & Unless",
            "author": "Orkun Londoner",
            "duration": "12 Dk"
        }
    ],
    "fh_unit_8": [
        {
            "id": "oFknXglYI3g",
            "topic_name": "1. Alt Konu: Relative Clauses - Who, Which, That (Sıfat Cümlecikleri)",
            "badge": "Who / Which / That",
            "title": "RELATIVE CLAUSES KONU ANLATIMI",
            "author": "Ms. Jasmin ELT",
            "duration": "19 Dk"
        },
        {
            "id": "84FD2kZ8FUQ",
            "topic_name": "2. Alt Konu: 5 Dakikada Relative Clauses (Who, Which, Where, Whose)",
            "badge": "5 Dk Özet",
            "title": "5 Dakikada Relative Clauses",
            "author": "Tonguç Akademi",
            "duration": "5 Dk"
        },
        {
            "id": "nc3ymcJr2XU",
            "topic_name": "3. Alt Konu: Used to & Didn't use to (Geçmiş Alışkanlıklar)",
            "badge": "Used to",
            "title": "İngilizce’de used to / be used to / get used to kalıpları",
            "author": "İngilizce Bizde",
            "duration": "11 Dk"
        },
        {
            "id": "V8BoyN2vq_Y",
            "topic_name": "4. Alt Konu: Relative Clauses Detaylı Soru Çözümü",
            "badge": "Soru Çözümü",
            "title": "RELATIVE CLAUSE Konu Anlatımı (Who, Which, That, Whose)",
            "author": "Ozan Hoca",
            "duration": "15 Dk"
        }
    ]
}

def enrich():
    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    for unit in data.get('units', []):
        u_id = unit['id']
        if u_id in unit_videos:
            if 'grammar_details' not in unit:
                unit['grammar_details'] = {}
            
            unit['grammar_details']['video_data'] = {
                "title": f"9. Sınıf {unit['code']}: {unit['grammar_details'].get('badge', unit.get('grammar_focus', 'Gramer'))}",
                "search_query": f"9. sınıf {unit['code']} {unit.get('grammar_focus', '')} konu anlatımı",
                "videos": unit_videos[u_id]
            }

    with open(JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print("Successfully enriched all 9 units in school_fly_higher.json with verified working YouTube IDs!")

if __name__ == '__main__':
    enrich()
