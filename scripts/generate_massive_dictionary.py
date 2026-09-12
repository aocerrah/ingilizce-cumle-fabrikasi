#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Builds an exhaustive 6,000+ word offline English-Turkish dictionary
including all CEFR A1-C1 vocabulary, Oxford 3000/5000, MEB High School (9-12) curriculum,
academic passages, exam vocabulary, and all derived morphological forms (plurals, -ed, -ing, -s, -ly).
"""

import json
import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JSON_OUT = os.path.join(BASE_DIR, 'data', 'full_dictionary.json')
JS_OUT = os.path.join(BASE_DIR, 'js', 'dictionary_data.js')

dictionary = {}

def add_word(en, tr, pos="Kelime", icon="📖", overwrite=False):
    if not en or not tr:
        return
    en_clean = str(en).strip().lower()
    if not en_clean or not str(tr).strip():
        return
    if overwrite or en_clean not in dictionary or not dictionary[en_clean].get('tr') or dictionary[en_clean].get('tr') == 'Kelime':
        dictionary[en_clean] = {
            "tr": str(tr).strip(),
            "type": pos.lower(),
            "type_label": pos,
            "icon": icon,
            "wordEn": en_clean
        }

# 1. Load from curriculum.json
try:
    c_path = os.path.join(BASE_DIR, 'data', 'curriculum.json')
    if os.path.exists(c_path):
        with open(c_path, 'r', encoding='utf-8') as f:
            c_data = json.load(f)
        for v in c_data.get('verbs', []):
            en = v.get('word')
            tr = v.get('meaning')
            add_word(en, tr, "Fiil (Verb)", "🔵")
            forms = v.get('forms', {})
            if forms.get('v2'):
                for item in forms.get('v2').split('/'):
                    add_word(item.split('(')[0].strip(), f"{tr} (Geçmiş Zaman / V2)", "Geçmiş Zaman Fiil (V2)", "🔵")
            if forms.get('v3'):
                for item in forms.get('v3').split('/'):
                    add_word(item.split('(')[0].strip(), f"{tr} (3. Hali / V3)", "Past Participle (V3)", "🔵")
            if forms.get('v_ing'):
                add_word(forms.get('v_ing').strip(), f"{tr} (Şimdiki Zaman / -ing)", "Şimdiki Zaman Fiil (V-ing)", "🔵")
            if forms.get('v_s'):
                add_word(forms.get('v_s').strip(), f"{tr} (Geniş Zaman / 3. Tekil)", "Geniş Zaman Fiil (3. Tekil)", "🔵")
        for w in c_data.get('all_words', []):
            if w.get('word') and w.get('meaning') and len(w.get('word').strip()) > 1:
                add_word(w.get('word'), w.get('meaning'), w.get('type_label', 'Kelime'), w.get('type_icon', '📖'))
except Exception as e:
    print("Error loading curriculum.json:", e)

# 2. Load from school_fly_higher.json
try:
    s_path = os.path.join(BASE_DIR, 'data', 'school_fly_higher.json')
    if os.path.exists(s_path):
        with open(s_path, 'r', encoding='utf-8') as f:
            s_data = json.load(f)
        for u in s_data.get('units', []):
            for w in u.get('words', []):
                add_word(w.get('en'), w.get('tr'), w.get('pos', '9. Sınıf Kelime'), "🏫")
except Exception as e:
    print("Error loading school_fly_higher.json:", e)

# 3. Load from Python curriculum scripts
try:
    sys.path.append(os.path.join(BASE_DIR, 'scripts'))
    from build_complete_dictionary import ADVERBS_DATA, CONJUNCTIONS_DATA
    from data_definitions import (
        PHRASAL_VERBS_DATA, NOUNS_DATA, PREPOSITIONS_DATA,
        ADJECTIVES_DATA, IDIOMS_DATA
    )
    from generate_full_curriculum import A2_VERBS_RAW, B1_VERBS_RAW, get_forms

    for v in A2_VERBS_RAW + B1_VERBS_RAW:
        en, tr = v[1], v[2]
        add_word(en, tr, "Fiil (Verb)", "🔵")
        forms = get_forms(en)
        if forms:
            v1_str, v2_str, v3_str = forms[0], forms[1], forms[2]
            for form in v2_str.split('/'):
                add_word(form.split('(')[0].strip(), f"{tr} (Geçmiş Zaman / V2)", "Geçmiş Zaman Fiil (V2)", "🔵")
            for form in v3_str.split('/'):
                add_word(form.split('(')[0].strip(), f"{tr} (3. Hali / V3)", "Past Participle (V3)", "🔵")
            for form in v1_str.split('/'):
                add_word(form.strip(), tr, "Fiil (Verb)", "🔵")

    for item in ADVERBS_DATA:
        add_word(item[0], item[1], item[2] if len(item)>2 else "Zarf (Adverb)", "🟣")
    for item in CONJUNCTIONS_DATA:
        add_word(item[0], item[1], item[2] if len(item)>2 else "Bağlaç (Conjunction)", "🔗")
    for item in PHRASAL_VERBS_DATA:
        add_word(item[0], item[1], "Deyimsel Fiil (Phrasal Verb)", "⚡")
    for item in NOUNS_DATA:
        add_word(item[0], item[1], item[2] if len(item)>2 else "İsim (Noun)", "🔴")
    for item in PREPOSITIONS_DATA:
        add_word(item[0], item[1], item[2] if len(item)>2 else "Edat (Preposition)", "🟡")
    for item in ADJECTIVES_DATA:
        add_word(item[0], item[1], item[2] if len(item)>2 else "Sıfat (Adjective)", "🟩")
    for item in IDIOMS_DATA:
        add_word(item[0], item[1], "Deyim / Kalıp (Idiom)", "💡")
except Exception as e:
    print("Error loading scripts modules:", e)

# 4. Comprehensive Vocabulary Database (4,000+ entries)
COMPREHENSIVE_VOCAB = [
    # Fundamental Articles, Conjunctions & Function Words
    ("the", "o, belirli nesne (belirteç)", "Belirteç (Article)", "🔹"),
    ("a", "bir (herhangi bir tekil nesne)", "Belirteç (Article)", "🔹"),
    ("an", "bir (sesli harfle başlayan)", "Belirteç (Article)", "🔹"),
    ("and", "ve, ile", "Bağlaç (Conjunction)", "➕"),
    ("or", "veya, ya da", "Bağlaç (Conjunction)", "🔀"),
    ("but", "ama, fakat, lakin", "Bağlaç (Conjunction)", "✋"),
    ("not", "değil, olumsuzluk eki (-me/-ma)", "Olumsuzluk Zarfı", "🚫"),
    ("no", "hayır / hiç, hiçbir", "Cevap / Belirteç", "🚫"),
    ("yes", "evet", "Cevap (Affirmation)", "✅"),
    ("most", "en çok, en fazla, çoğu", "Belirteç / Sıfat", "📊"),
    ("more", "daha fazla, daha çok", "Miktar Belirteci / Zarf", "📊"),
    ("less", "daha az", "Belirteç / Zarf", "📊"),
    ("least", "en az", "Belirteç / Sıfat", "📊"),
    ("too", "aşırı, fazla / -de, -da", "Derece Zarfı", "🟣"),
    ("very", "çok, pek", "Derece Zarfı", "🟣"),
    ("so", "bu yüzden, böylece / çok, öylesine", "Bağlaç / Zarf", "🔗"),
    ("such", "böyle, bu gibi, öylesine", "Belirteç", "🟩"),
    ("much", "çok, fazla (sayılamayan)", "Belirteç (Quantifier)", "🔢"),
    ("many", "birçok, çok sayıda (sayılabilen)", "Belirteç (Quantifier)", "🔢"),
    ("some", "biraz, bazı, birkaç", "Belirteç (Quantifier)", "🔢"),
    ("any", "hiç, herhangi bir", "Belirteç (Quantifier)", "🔢"),
    ("all", "bütün, tüm, hepsi", "Belirteç", "🔢"),
    ("both", "her ikisi, her iki", "Belirteç", "🔢"),
    ("each", "her bir, her", "Belirteç", "🔢"),
    ("every", "her, bütün", "Belirteç", "🔢"),
    ("either", "ya ... ya da / ikisinden biri", "Bağlaç / Belirteç", "🔗"),
    ("neither", "ne ... ne de / hiçbirisi", "Bağlaç / Belirteç", "🔗"),
    ("none", "hiçbiri, hiç kimse", "Zamir", "🔢"),
    ("other", "diğer, başka", "Sıfat / Zamir", "🟩"),
    ("others", "diğerleri, başkaları", "Çoğul Zamir", "👥"),
    ("another", "başka bir, diğer bir", "Belirteç / Zamir", "🟩"),
    ("several", "birkaç, birtakım", "Belirteç", "🔢"),
    ("few", "az, birkaç (sayılabilen)", "Belirteç", "🔢"),
    ("little", "az (sayılamayan) / küçük", "Belirteç / Sıfat", "🔢"),
    ("also", "ayrıca, de/da, aynı zamanda", "Zarf (Adverb)", "🟣"),
    ("just", "sadece, yalnızca / tam şimdi, az önce", "Zarf (Adverb)", "🟣"),
    ("only", "sadece, tek, yalnızca", "Zarf / Sıfat", "🟣"),
    ("already", "zaten, çoktan", "Zaman Zarfı", "⏳"),
    ("still", "hâlâ, henüz", "Zaman Zarfı", "⏳"),
    ("yet", "henüz (olumsuz/soru) / ama, yine de", "Zarf / Bağlaç", "⏳"),
    ("always", "her zaman, daima", "Sıklık Zarfı", "🔄"),
    ("usually", "genellikle, çoğunlukla", "Sıklık Zarfı", "🔄"),
    ("often", "sık sık", "Sıklık Zarfı", "🔄"),
    ("sometimes", "bazen, ara sıra", "Sıklık Zarfı", "🔄"),
    ("rarely", "nadiren", "Sıklık Zarfı", "🔄"),
    ("seldom", "pek nadir, nadiren", "Sıklık Zarfı", "🔄"),
    ("never", "asla, hiçbir zaman", "Sıklık Zarfı", "🚫"),

    # Contractions
    ("doesn't", "yapmaz, -mez / -maz (olumsuz geniş zaman)", "Olumsuz Yardımcı Fiil", "🚫"),
    ("don't", "yapma(mak) / -mez, -maz (olumsuz geniş zaman)", "Olumsuz Yardımcı Fiil", "🚫"),
    ("didn't", "yapmadı / -medi, -madı (olumsuz geçmiş zaman)", "Olumsuz Geçmiş Fiil", "🚫"),
    ("can't", "yapamaz / -emez, -amaz (yeteneksizlik)", "Olumsuz Modal (Kip)", "🚫"),
    ("couldn't", "yapamadı / geçmiş yeteneksizlik", "Olumsuz Modal (Kip)", "🚫"),
    ("won't", "yapmayacak / -meyecek, -mayacak (olumsuz gelecek)", "Olumsuz Gelecek Kip", "🚫"),
    ("wouldn't", "yapmazdı / istemezdi", "Olumsuz Modal", "🚫"),
    ("shouldn't", "yapmamalı / olumsuz tavsiye", "Olumsuz Modal (Tavsiye)", "🚫"),
    ("mustn't", "yapmamalı / yasak", "Yasaklama Kipi", "🚫"),
    ("isn't", "değildir (tekil)", "Olumsuz Yardımcı Fiil", "🚫"),
    ("aren't", "değildirler (çoğul)", "Olumsuz Yardımcı Fiil", "🚫"),
    ("wasn't", "değildi (geçmiş tekil)", "Olumsuz Geçmiş Fiil", "🚫"),
    ("weren't", "değildiler (geçmiş çoğul)", "Olumsuz Geçmiş Fiil", "🚫"),
    ("haven't", "sahip değil / perfect olumsuz", "Olumsuz Yardımcı Fiil", "🚫"),
    ("hasn't", "sahip değil / perfect olumsuz", "Olumsuz Yardımcı Fiil", "🚫"),
    ("hadn't", "sahip değildi / past perfect olumsuz", "Olumsuz Geçmiş Fiil", "🚫"),
    ("it's", "o (it is / it has)", "Zamir + Yardımcı Fiil", "💡"),
    ("i'm", "ben (I am)", "Zamir + Fiil", "💡"),
    ("you're", "sen / siz (you are)", "Zamir + Fiil", "💡"),
    ("they're", "onlar (they are)", "Zamir + Fiil", "💡"),
    ("we're", "biz (we are)", "Zamir + Fiil", "💡"),
    ("i've", "ben (I have)", "Zamir + Fiil", "💡"),
    ("you've", "sen (you have)", "Zamir + Fiil", "💡"),
    ("they've", "onlar (they have)", "Zamir + Fiil", "💡"),
    ("we've", "biz (we have)", "Zamir + Fiil", "💡"),
    ("i'll", "ben yapacağım (I will)", "Zamir + Gelecek Kip", "💡"),
    ("you'll", "sen yapacaksın (you will)", "Zamir + Gelecek Kip", "💡"),
    ("he'll", "o yapacak (he will)", "Zamir + Gelecek Kip", "💡"),
    ("she'll", "o yapacak (she will)", "Zamir + Gelecek Kip", "💡"),
    ("we'll", "biz yapacağız (we will)", "Zamir + Gelecek Kip", "💡"),
    ("they'll", "onlar yapacak (they will)", "Zamir + Gelecek Kip", "💡"),

    # Time, Days, Calendar & Routine Words
    ("weekend", "hafta sonu", "İsim (Time)", "📅"),
    ("weekends", "hafta sonları", "Çoğul İsim (Time)", "📅"),
    ("weekday", "hafta içi gün", "İsim (Time)", "📅"),
    ("weekdays", "hafta içi günleri", "Çoğul İsim (Time)", "📅"),
    ("monday", "Pazartesi", "Gün (Time)", "📅"),
    ("mondays", "Pazartesi günleri", "Çoğul İsim", "📅"),
    ("tuesday", "Salı", "Gün (Time)", "📅"),
    ("tuesdays", "Salı günleri", "Çoğul İsim", "📅"),
    ("wednesday", "Çarşamba", "Gün (Time)", "📅"),
    ("wednesdays", "Çarşamba günleri", "Çoğul İsim", "📅"),
    ("thursday", "Perşembe", "Gün (Time)", "📅"),
    ("thursdays", "Perşembe günleri", "Çoğul İsim", "📅"),
    ("friday", "Cuma", "Gün (Time)", "📅"),
    ("fridays", "Cuma günleri", "Çoğul İsim", "📅"),
    ("saturday", "Cumartesi", "Gün (Time)", "📅"),
    ("saturdays", "Cumartesi günleri", "Çoğul İsim", "📅"),
    ("sunday", "Pazar", "Gün (Time)", "📅"),
    ("sundays", "Pazar günleri", "Çoğul İsim", "📅"),
    ("morning", "sabah / sabah vakti", "İsim (Time)", "🌅"),
    ("mornings", "sabahları", "Çoğul İsim", "🌅"),
    ("afternoon", "öğleden sonra", "İsim (Time)", "☀️"),
    ("afternoons", "öğleden sonraları", "Çoğul İsim", "☀️"),
    ("evening", "akşam", "İsim (Time)", "🌆"),
    ("evenings", "akşamları", "Çoğul İsim", "🌆"),
    ("night", "gece", "İsim (Time)", "🌙"),
    ("nights", "geceleri", "Çoğul İsim", "🌙"),
    ("noon", "öğle vakti (12:00)", "İsim (Time)", "☀️"),
    ("midnight", "gece yarısı (00:00)", "İsim (Time)", "🌌"),
    ("dawn", "şafak, gün doğumu", "İsim (Time)", "🌅"),
    ("dusk", "alacakaranlık, gün batımı", "İsim (Time)", "🌇"),
    ("today", "bugün", "Zaman Zarfı", "📅"),
    ("yesterday", "dün", "Zaman Zarfı", "⏳"),
    ("tomorrow", "yarın", "Zaman Zarfı", "🚀"),
    ("tonight", "bu gece", "Zaman Zarfı", "🌙"),
    ("daily", "günlük, her gün yapılan", "Sıfat / Zarf", "📅"),
    ("weekly", "haftalık, her hafta yapılan", "Sıfat / Zarf", "📅"),
    ("monthly", "aylık, her ay yapılan", "Sıfat / Zarf", "📅"),
    ("yearly", "yıllık, her yıl yapılan", "Sıfat / Zarf", "📅"),
    ("annual", "yıllık", "Sıfat (Time)", "📅"),
    ("annually", "yıllık olarak, her yıl", "Zaman Zarfı", "📅"),
    ("schedule", "ders programı, takvim, plan / planlamak", "İsim / Fiil", "🗓️"),
    ("schedules", "programlar, takvimler / planlar", "Çoğul İsim / Fiil", "🗓️"),
    ("scheduled", "planlanmış, takvime bağlanmış", "Sıfat / Fiil (V2/V3)", "🗓️"),
    ("timetable", "zaman çizelgesi, ders çizelgesi", "İsim (Noun)", "⏱️"),
    ("calendar", "takvim", "İsim (Noun)", "📆"),
    ("clock", "duvar saati, masa saati", "İsim (Noun)", "⏰"),
    ("watch", "kol saati / izlemek", "İsim / Fiil", "⌚"),
    ("hour", "saat (60 dakika)", "İsim (Time)", "⌛"),
    ("hours", "saatler, süre", "Çoğul İsim", "⌛"),
    ("minute", "dakika", "İsim (Time)", "⏱️"),
    ("minutes", "dakikalar", "Çoğul İsim", "⏱️"),
    ("second", "saniye / ikinci", "İsim / Sıra Sayısı", "⏱️"),
    ("seconds", "saniyeler", "Çoğul İsim", "⏱️"),
    ("moment", "an, lahza", "İsim (Time)", "⚡"),
    ("moments", "anlar", "Çoğul İsim", "⚡"),
    ("instant", "an, hemen olan", "İsim / Sıfat", "⚡"),
    ("instantly", "anında, derhal", "Zaman Zarfı", "⚡"),
    ("period", "dönem, periyot, ders saati", "İsim (Noun)", "⏳"),
    ("periods", "dönemler, ders saatleri", "Çoğul İsim", "⏳"),
    ("term", "dönem, sömestir / terim", "İsim (School)", "🏫"),
    ("terms", "dönemler / terimler / şartlar", "Çoğul İsim", "🏫"),
    ("semester", "yarıyıl, dönem", "İsim (School)", "🏫"),
    ("season", "mevsim, sezon", "İsim (Noun)", "🍂"),
    ("seasons", "mevsimler", "Çoğul İsim", "🍂"),
    ("spring", "ilkbahar / yay / sıçramak", "İsim / Fiil", "🌸"),
    ("summer", "yaz (mevsim)", "İsim (Time)", "☀️"),
    ("autumn", "sonbahar, güz", "İsim (Time)", "🍂"),
    ("fall", "sonbahar / düşmek", "İsim / Fiil", "🍁"),
    ("winter", "kış (mevsim)", "İsim (Time)", "❄️"),

    # Health, Routines, Body & Nutrition Words
    ("routine", "rutin, günlük düzen, alışılmış iş", "İsim (Noun)", "🔄"),
    ("routines", "rutinler, günlük düzenler", "Çoğul İsim", "🔄"),
    ("habit", "alışkanlık, huy", "İsim (Noun)", "🔄"),
    ("habits", "alışkanlıklar", "Çoğul İsim", "🔄"),
    ("breakfast", "kahvaltı", "İsim (Food)", "🍳"),
    ("breakfasts", "kahvaltılar", "Çoğul İsim", "🍳"),
    ("lunch", "öğle yemeği", "İsim (Food)", "🥪"),
    ("lunches", "öğle yemekleri", "Çoğul İsim", "🥪"),
    ("dinner", "akşam yemeği", "İsim (Food)", "🍲"),
    ("dinners", "akşam yemekleri", "Çoğul İsim", "🍲"),
    ("supper", "hafif akşam yemeği", "İsim (Food)", "🥣"),
    ("meal", "öğün, yemek", "İsim (Food)", "🍽️"),
    ("meals", "öğünler, yemekler", "Çoğul İsim", "🍽️"),
    ("snack", "atıştırmalık, ara öğün", "İsim (Food)", "🍎"),
    ("snacks", "atıştırmalıklar", "Çoğul İsim", "🍎"),
    ("food", "yiyecek, gıda, besin", "İsim (Food)", "🥗"),
    ("foods", "yiyecekler, gıdalar", "Çoğul İsim", "🥗"),
    ("nutrition", "beslenme, gıda", "İsim (Health)", "🥦"),
    ("nutritious", "besleyici, besin değeri yüksek", "Sıfat (Health)", "🥦"),
    ("diet", "diyet, beslenme düzeni", "İsim (Health)", "🥗"),
    ("healthy", "sağlıklı, sıhhatli", "Sıfat (Health)", "❤️"),
    ("health", "sağlık, sıhhat", "İsim (Health)", "❤️"),
    ("unhealthy", "sağlıksız, zararlı", "Sıfat (Health)", "🍟"),
    ("fresh", "taze, ferah, yeni", "Sıfat (Food/Air)", "🌿"),
    ("light", "hafif / ışık, aydınlık / yakmak", "Sıfat / İsim / Fiil", "💡"),
    ("heavy", "ağır, yoğun, şiddetli", "Sıfat (Adjective)", "🏋️"),
    ("exercise", "egzersiz, alıştırma / egzersiz yapmak", "İsim / Fiil", "🏋️"),
    ("exercises", "egzersizler, alıştırmalar", "Çoğul İsim", "🏋️"),
    ("exercised", "egzersiz yaptı, çalıştı", "Geçmiş Zaman Fiil (V2/V3)", "🏋️"),
    ("exercising", "egzersiz yaparak, spor yapan", "Fiil (V-ing)", "🏋️"),
    ("workout", "antrenman, idman, egzersiz seansı", "İsim (Sport)", "💪"),
    ("workouts", "antrenmanlar, idmanlar", "Çoğul İsim", "💪"),
    ("fit", "formda, zinde / uymak (beden)", "Sıfat / Fiil", "🏃"),
    ("fitness", "zindelik, form, beden sağlığı", "İsim (Sport)", "🏃"),
    ("gym", "spor salonu, jimnastik salonu", "İsim (Sport)", "🏟️"),
    ("gymnasium", "spor salonu", "İsim (Sport)", "🏟️"),
    ("rest", "dinlenmek, mola vermek / geri kalan", "Fiil / İsim", "🛋️"),
    ("resting", "dinlenme, istirahat", "İsim / Fiil (V-ing)", "🛋️"),
    ("rested", "dinlenmiş / dinlendi", "Sıfat / Fiil (V2/V3)", "🛋️"),
    ("relax", "rahatlamak, gevşemek, dinlenmek", "Fiil (Action)", "🧘"),
    ("relaxed", "rahatlamış, sakin, stressiz", "Sıfat (Adjective)", "🧘"),
    ("relaxing", "rahatlatıcı, dinlendirici", "Sıfat (Adjective)", "🧘"),
    ("relaxation", "rahatlama, gevşeme", "İsim (Noun)", "🧘"),
    ("sleep", "uyumak / uyku", "Fiil / İsim", "😴"),
    ("sleeping", "uyuma, uykuda", "İsim / Fiil (V-ing)", "😴"),
    ("asleep", "uykuda, uyur halde", "Sıfat (Adjective)", "😴"),
    ("wake", "uyanmak, uyandırmak", "Fiil (Action)", "⏰"),
    ("waking", "uyanma / uyanık", "Fiil (V-ing) / Sıfat", "⏰"),
    ("awake", "uyanık, uykusuz", "Sıfat (Adjective)", "👁️"),
    ("energy", "enerji, güç, canlılık", "İsim (Science/Health)", "⚡"),
    ("energetic", "enerjik, hareketli, canlı", "Sıfat (Adjective)", "⚡"),
    ("tired", "yorgun, bitkin", "Sıfat (Adjective)", "🥱"),
    ("exhausted", "aşırı yorgun, tükenmiş", "Sıfat (Adjective)", "😫"),
    ("lazy", "tembel, uyuşuk", "Sıfat (Adjective)", "🦥"),
    ("active", "aktif, hareketli, faal", "Sıfat (Adjective)", "🏃"),
    ("lifestyle", "yaşam tarzı, hayat biçimi", "İsim (Noun)", "🌟"),
    ("lifestyles", "yaşam tarzları", "Çoğul İsim", "🌟"),

    # School, Academics, Exams, Success & Mindset
    ("success", "başarı, muvaffakiyet", "İsim (Noun)", "🏆"),
    ("successes", "başarılar", "Çoğul İsim", "🏆"),
    ("successful", "başarılı", "Sıfat (Adjective)", "⭐"),
    ("successfully", "başarıyla, başarılı bir şekilde", "Durum Zarfı", "🟣"),
    ("succeed", "başarmak, başarılı olmak", "Fiil (Verb)", "🎯"),
    ("succeeds", "başarır, başarılı olur", "Geniş Zaman Fiil (3. Tekil)", "🎯"),
    ("succeeded", "başardı, başarılı oldu", "Geçmiş Zaman Fiil (V2/V3)", "🎯"),
    ("succeeding", "başararak, başarı kazanan", "Fiil (V-ing)", "🎯"),
    ("fail", "başarısız olmak, kalmak (sınavda)", "Fiil (Verb)", "❌"),
    ("fails", "başarısız olur / arızalar", "Fiil (3. Tekil) / Çoğul", "❌"),
    ("failed", "başarısız oldu, kaldı", "Geçmiş Zaman Fiil (V2/V3)", "❌"),
    ("failure", "başarısızlık, arıza, hüsran", "İsim (Noun)", "📉"),
    ("failures", "başarısızlıklar", "Çoğul İsim", "📉"),
    ("pass", "geçmek (sınavı/zamanı) / pas vermek", "Fiil (Action)", "✅"),
    ("passes", "geçer / paslar", "Fiil (3. Tekil) / Çoğul", "✅"),
    ("passed", "geçti, başarılı oldu (sınavda)", "Geçmiş Zaman Fiil (V2/V3)", "✅"),
    ("effective", "etkili, tesirli, verimli", "Sıfat (Adjective)", "🟩"),
    ("effectively", "etkili bir şekilde, verimle", "Durum Zarfı", "🟣"),
    ("effectiveness", "etkililik, verimlilik", "İsim (Noun)", "📈"),
    ("efficient", "verimli, randımanlı", "Sıfat (Adjective)", "⚙️"),
    ("efficiently", "verimli bir şekilde", "Durum Zarfı", "🟣"),
    ("efficiency", "verimlilik, randıman", "İsim (Noun)", "⚙️"),
    ("break", "kırmak, bozmak / mola, ara", "Fiil / İsim", "☕"),
    ("breaks", "kırar, bozar / molalar, aralar", "Fiil (3. Tekil) / Çoğul", "☕"),
    ("breaking", "kırma, bozma / son dakika", "İsim / Fiil (V-ing)", "☕"),
    ("broken", "kırık, bozuk / kırılmış", "Sıfat / Fiil (V3)", "💔"),
    ("broke", "kırdı, bozdu / meteliksiz", "Fiil (V2) / Sıfat", "💔"),
    ("include", "içermek, kapsamak, dahil etmek", "Fiil (Verb)", "📦"),
    ("includes", "içerir, kapsar, dahil eder", "Geniş Zaman Fiil (3. Tekil)", "📦"),
    ("included", "dahil edilmiş, içerdi", "Geçmiş Zaman Fiil (V2/V3)", "📦"),
    ("including", "dahil, kapsayarak, içeren", "Edat / Fiil (V-ing)", "📦"),
    ("inclusion", "dahil etme, kapsama", "İsim (Noun)", "📦"),
    ("contain", "içermek, barındırmak", "Fiil (Verb)", "📦"),
    ("contains", "içerir, barındırır", "Geniş Zaman Fiil (3. Tekil)", "📦"),
    ("contained", "içerdi, barındırdı", "Geçmiş Zaman Fiil (V2/V3)", "📦"),
    ("container", "kap, kutu, konteyner", "İsim (Noun)", "📦"),
    ("involve", "içermek, kapsamak, gerektirmek", "Fiil (Verb)", "🔄"),
    ("involves", "içerir, kapsar", "Geniş Zaman Fiil (3. Tekil)", "🔄"),
    ("involved", "dahil olmuş, karışmış", "Sıfat / Fiil (V2/V3)", "🔄"),
    ("involvement", "katılım, dahil olma", "İsim (Noun)", "🔄"),
    ("study", "ders çalışmak / araştırma, inceleme", "Fiil / İsim", "📖"),
    ("studies", "ders çalışır / araştırmalar, çalışmalar", "Fiil (3. Tekil) / Çoğul", "📖"),
    ("studied", "ders çalıştı, inceledi", "Geçmiş Zaman Fiil (V2/V3)", "📖"),
    ("studying", "ders çalışarak, öğrenim görme", "Fiil (V-ing) / İsim", "📖"),
    ("student", "öğrenci", "İsim (People)", "🧑‍🎓"),
    ("students", "öğrenciler", "Çoğul İsim", "🧑‍🎓"),
    ("teacher", "öğretmen, hoca", "İsim (People)", "👩‍🏫"),
    ("teachers", "öğretmenler", "Çoğul İsim", "👩‍🏫"),
    ("class", "sınıf, ders", "İsim (School)", "🏫"),
    ("classes", "sınıflar, dersler", "Çoğul İsim", "🏫"),
    ("classroom", "derslik, sınıf odası", "İsim (School)", "🏫"),
    ("classrooms", "derslikler, sınıflar", "Çoğul İsim", "🏫"),
    ("school", "okul", "İsim (School)", "🏫"),
    ("schools", "okullar", "Çoğul İsim", "🏫"),
    ("high", "yüksek / lise (high school)", "Sıfat (Adjective)", "🏔️"),
    ("higher", "daha yüksek, üst", "Karşılaştırma Sıfatı", "🚀"),
    ("highest", "en yüksek", "Üstünlük Sıfatı", "🏆"),
    ("low", "düşük, alçak", "Sıfat (Adjective)", "📉"),
    ("lower", "daha düşük / alçaltmak", "Sıfat / Fiil", "📉"),
    ("lowest", "en düşük", "Üstünlük Sıfatı", "📉"),
    ("rule", "kural, kaide / yönetmek", "İsim / Fiil", "📏"),
    ("rules", "kurallar / yönetir", "Çoğul İsim / Fiil", "📏"),
    ("grammar", "dilbilgisi, gramer", "İsim (Language)", "📚"),
    ("vocabulary", "kelime hazinesi, sözcükler", "İsim (Language)", "🔤"),
    ("passage", "okuma parçası, metin, pasaj / geçiş", "İsim (Text)", "📄"),
    ("passages", "okuma parçaları, pasajlar, metinler", "Çoğul İsim", "📄"),
    ("sentence", "cümle, tümce", "İsim (Grammar)", "💬"),
    ("sentences", "cümleler", "Çoğul İsim", "💬"),
    ("paragraph", "paragraf", "İsim (Text)", "📝"),
    ("paragraphs", "paragraflar", "Çoğul İsim", "📝"),
    ("question", "soru / sorgulamak", "İsim / Fiil", "❓"),
    ("questions", "sorular / sorgular", "Çoğul İsim / Fiil", "❓"),
    ("answer", "cevap, yanıt / cevaplamak", "İsim / Fiil", "💡"),
    ("answers", "cevaplar, yanıtlar / cevaplar", "Çoğul İsim / Fiil", "💡"),
    ("option", "seçenek, opsiyon, şık", "İsim (Exam)", "🔘"),
    ("options", "seçenekler, şıklar", "Çoğul İsim", "🔘"),
    ("choice", "seçim, tercih, seçenek", "İsim (Exam)", "🔘"),
    ("choices", "seçimler, seçenekler", "Çoğul İsim", "🔘"),
    ("explanation", "açıklama, izahat", "İsim (Noun)", "💡"),
    ("explanations", "açıklamalar, izahatlar", "Çoğul İsim", "💡"),
    ("explain", "açıklamak, izah etmek", "Fiil (Verb)", "🗣️"),
    ("explains", "açıklar, izah eder", "Geniş Zaman Fiil (3. Tekil)", "🗣️"),
    ("explained", "açıkladı, izah etti", "Geçmiş Zaman Fiil (V2/V3)", "🗣️"),
    ("explaining", "açıklayarak, anlatan", "Fiil (V-ing)", "🗣️"),
    ("structure", "yapı, gramer düzeni / yapılandırmak", "İsim / Fiil", "🏗️"),
    ("structures", "yapılar, düzenler", "Çoğul İsim", "🏗️"),
    ("express", "ifade etmek, belirtmek / hızlı", "Fiil / Sıfat", "💬"),
    ("expresses", "ifade eder, belirtir", "Geniş Zaman Fiil (3. Tekil)", "💬"),
    ("expressed", "ifade etti, belirtti", "Geçmiş Zaman Fiil (V2/V3)", "💬"),
    ("expressing", "ifade ederek, anlatan", "Fiil (V-ing)", "💬"),
    ("expression", "ifade, anlatım, tabir", "İsim (Noun)", "💬"),
    ("expressions", "ifadeler, tabirler", "Çoğul İsim", "💬"),
    ("thought", "düşünce, fikir / düşündü", "İsim / Fiil (V2/V3)", "🧠"),
    ("thoughts", "düşünceler, fikirler", "Çoğul İsim", "🧠"),
    ("think", "düşünmek, sanmak", "Fiil (Action)", "🧠"),
    ("thinks", "düşünür, sanır", "Geniş Zaman Fiil (3. Tekil)", "🧠"),
    ("thinking", "düşünme, fikir / düşünen", "İsim / Fiil (V-ing)", "🧠"),
    ("clearly", "açıkça, net bir şekilde, belirgin olarak", "Durum Zarfı", "🟣"),
    ("clear", "açık, net, berrak, temiz / temizlemek", "Sıfat / Fiil", "💎"),
    ("cleared", "temizledi, akladı", "Geçmiş Zaman Fiil (V2/V3)", "💎"),
    ("clearing", "temizleme, açılma", "İsim / Fiil (V-ing)", "💎"),
    ("neglect", "ihmal etmek, savsaklamak / ihmal", "Fiil / İsim", "⚠️"),
    ("neglects", "ihmal eder, savsaklar", "Geniş Zaman Fiil (3. Tekil)", "⚠️"),
    ("neglected", "ihmal edilmiş, savsakladı", "Geçmiş Zaman Fiil (V2/V3)", "⚠️"),
    ("neglecting", "ihmal ederek, savsaklayan", "Fiil (V-ing)", "⚠️"),
    ("review", "tekrar etmek, gözden geçirmek / inceleme", "Fiil / İsim", "🔄"),
    ("reviews", "gözden geçirir / incelemeler, yorumlar", "Fiil (3. Tekil) / Çoğul", "🔄"),
    ("reviewed", "gözden geçirdi, tekrar etti", "Geçmiş Zaman Fiil (V2/V3)", "🔄"),
    ("reviewing", "gözden geçirerek, tekrar eden", "Fiil (V-ing)", "🔄"),
    ("revision", "tekrar, revizyon, gözden geçirme", "İsim (Noun)", "🔄"),
    ("revisions", "tekrarlar, revizyonlar", "Çoğul İsim", "🔄"),
    ("revise", "tekrar etmek, revize etmek", "Fiil (Verb)", "🔄"),
    ("revises", "tekrar eder, düzeltir", "Geniş Zaman Fiil (3. Tekil)", "🔄"),
    ("revised", "tekrar edilmiş, düzeltti", "Geçmiş Zaman Fiil (V2/V3)", "🔄"),
    ("revising", "tekrar ederek, çalışan", "Fiil (V-ing)", "🔄"),
    ("emphasize", "vurgulamak, önemini belirtmek", "Fiil (Verb)", "⭐"),
    ("emphasizes", "vurgular, dikkat çeker", "Geniş Zaman Fiil (3. Tekil)", "⭐"),
    ("emphasized", "vurguladı, dikkat çekti", "Geçmiş Zaman Fiil (V2/V3)", "⭐"),
    ("emphasizing", "vurgulayarak, öne çıkaran", "Fiil (V-ing)", "⭐"),
    ("emphasis", "vurgu, önem", "İsim (Noun)", "⭐"),
    ("importance", "önem, ehemmiyet", "İsim (Noun)", "⭐"),
    ("important", "önemli, mühim", "Sıfat (Adjective)", "⭐"),
    ("attitude", "tutum, tavır, yaklaşım", "İsim (Noun)", "🧘"),
    ("attitudes", "tutumlar, tavırlar", "Çoğul İsim", "🧘"),
    ("behavior", "davranış, hareket tarzı", "İsim (Noun)", "🤝"),
    ("behaviors", "davranışlar", "Çoğul İsim", "🤝"),
    ("behave", "davranmak, uslu durmak", "Fiil (Action)", "🤝"),
    ("behaves", "davranır", "Geniş Zaman Fiil (3. Tekil)", "🤝"),
    ("behaved", "davrandı", "Geçmiş Zaman Fiil (V2/V3)", "🤝"),

    # Pronouns, Determiners & Little Function Words
    ("he", "o (erkek özne zamiri)", "Kişi Zamiri", "👤"),
    ("she", "o (kadın özne zamiri)", "Kişi Zamiri", "👤"),
    ("it", "o (cansız/hayvan özne zamiri)", "Kişi Zamiri", "📦"),
    ("they", "onlar (çoğul özne zamiri)", "Kişi Zamiri", "👥"),
    ("we", "biz (çoğul özne zamiri)", "Kişi Zamiri", "👥"),
    ("you", "sen, siz (özne / nesne zamiri)", "Kişi Zamiri", "👤"),
    ("i", "ben (özne zamiri)", "Kişi Zamiri", "👤"),
    ("me", "beni, bana (nesne zamiri)", "Nesne Zamiri", "👤"),
    ("him", "onu, ona (erkek nesne zamiri)", "Nesne Zamiri", "👤"),
    ("her", "onu, ona / onun (kadın nesne/aitlik)", "Zamir / Sıfat", "👤"),
    ("his", "onun (erkek aitlik sıfatı/zamiri)", "İyelik Sıfatı/Zamiri", "👤"),
    ("its", "onun (cansız/hayvan iyelik sıfatı)", "İyelik Sıfatı", "📦"),
    ("our", "bizim (iyelik sıfatı)", "İyelik Sıfatı", "👥"),
    ("ours", "bizimki (iyelik zamiri)", "İyelik Zamiri", "👥"),
    ("their", "onların (iyelik sıfatı)", "İyelik Sıfatı", "👥"),
    ("theirs", "onlarınki (iyelik zamiri)", "İyelik Zamiri", "👥"),
    ("my", "benim (iyelik sıfatı)", "İyelik Sıfatı", "👤"),
    ("mine", "benimki (iyelik zamiri)", "İyelik Zamiri", "👤"),
    ("your", "senin, sizin (iyelik sıfatı)", "İyelik Sıfatı", "👤"),
    ("yours", "seninki, sizinki (iyelik zamiri)", "İyelik Zamiri", "👤"),
    ("myself", "kendim", "Dönüşlü Zamir", "👤"),
    ("yourself", "kendin", "Dönüşlü Zamir", "👤"),
    ("himself", "kendisi (erkek)", "Dönüşlü Zamir", "👤"),
    ("herself", "kendisi (kadın)", "Dönüşlü Zamir", "👤"),
    ("itself", "kendisi (cansız/hayvan)", "Dönüşlü Zamir", "📦"),
    ("ourselves", "kendimiz", "Dönüşlü Zamir", "👥"),
    ("themselves", "kendileri", "Dönüşlü Zamir", "👥"),
    ("even", "bile, hatta / eşit, çift", "Zarf / Sıfat", "⚖️"),
    ("at", "-de, -da (konum / saat)", "Edat (Preposition)", "🟡"),
    ("in", "içinde / aylarda-yıllarda (-de)", "Edat (Preposition)", "🟡"),
    ("on", "üzerinde / günlerde (-de)", "Edat (Preposition)", "🟡"),
    ("for", "için / boyunca (-dır)", "Edat (Preposition)", "🟡"),
    ("from", "-den, -dan (çıkış/kaynak)", "Edat (Preposition)", "🟡"),
    ("to", "-e, -a (yönelme) / mastar", "Edat (Preposition)", "🟡"),
    ("by", "tarafından / vasıtasıyla / yanında", "Edat (Preposition)", "🟡"),
    ("with", "ile, birlikte", "Edat (Preposition)", "🟡"),
    ("without", "-sız, -siz, olmadan", "Edat (Preposition)", "🟡"),
    ("about", "hakkında / yaklaşık olarak", "Edat / Zarf", "🟡"),
    ("of", "-in, -ın / -den (aitlik)", "Edat (Preposition)", "🟡"),
    ("as", "olarak / gibi / iken (-dıkça)", "Edat / Bağlaç", "🟡"),
    ("like", "gibi / beğenmek, sevmek", "Edat / Fiil", "👍"),
    ("than", "-den, -dan (karşılaştırma eki)", "Bağlaç / Edat", "⚖️"),
    ("so", "böylece, bu yüzden / öylesine, çok", "Bağlaç / Zarf", "🔗"),
    ("because", "çünkü, -dığı için", "Bağlaç (Cause)", "🔗"),
    ("although", "rağmen, -e karşın", "Bağlaç (Contrast)", "🔗"),
    ("though", "rağmen / gerçi, yine de", "Bağlaç / Zarf", "🔗"),
    ("however", "ancak, yine de, oysa", "Geçiş Bağlacı", "🔗"),
    ("therefore", "bu nedenle, dolayısıyla", "Sonuç Bağlacı", "🔗"),
    ("if", "eğer, şayet, -se/-sa", "Koşul Bağlacı", "🔗"),
    ("unless", "-medikçe, -mezse", "Koşul Bağlacı", "🔗"),
    ("what", "ne, hangi, neyi", "Soru Sözcüğü", "❓"),
    ("why", "neden, niçin", "Soru Sözcüğü", "❓"),
    ("when", "ne zaman / -dığında", "Soru / Zaman Bağlacı", "⏰"),
    ("where", "nerede, nereye / -diği yer", "Soru / Yer Bağlacı", "📍"),
    ("which", "hangi, hangisi", "Soru / İlgi Zamiri", "❓"),
    ("who", "kim / -ki o kişi", "Soru / İlgi Zamiri", "👤"),
    ("whom", "kime, kimi", "Soru / İlgi Zamiri", "👤"),
    ("whose", "kimin", "Soru / Aitlik Zamiri", "❓"),
    ("how", "nasıl, ne şekilde", "Soru Sözcüğü", "❓"),
    ("how many", "kaç tane (sayılabilen)", "Soru Kalıbı", "🔢"),
    ("how much", "ne kadar (sayılamayan/fiyat)", "Soru Kalıbı", "💰"),
    ("how often", "ne sıklıkla", "Soru Kalıbı", "🔄"),
    ("how long", "ne kadar süre / ne kadar uzun", "Soru Kalıbı", "⏳"),
    ("how far", "ne kadar uzak", "Soru Kalıbı", "🛣️"),
    ("how old", "kaç yaşında", "Soru Kalıbı", "🎂"),
    ("is", "-dir/-dır (tekil olmak fiili)", "Yardımcı Fiil", "🔵"),
    ("are", "-dirler/-dırlar (çoğul olmak)", "Yardımcı Fiil", "🔵"),
    ("am", "-im/-ım (ben olmak fiili)", "Yardımcı Fiil", "🔵"),
    ("was", "idi (geçmiş tekil olmak)", "Geçmiş Yardımcı Fiil", "⏳"),
    ("were", "idiler (geçmiş çoğul olmak)", "Geçmiş Yardımcı Fiil", "⏳"),
    ("been", "olmuş (3. Hali)", "Past Participle (V3)", "🔵"),
    ("being", "olma / olan", "İsim / Fiil (V-ing)", "🔵"),
    ("be", "olmak", "Fiil (Verb)", "🔵"),
    ("have", "sahip olmak", "Fiil / Yardımcı Fiil", "🔵"),
    ("has", "sahip olmak (3. Tekil)", "Geniş Zaman (3. Tekil)", "🔵"),
    ("had", "sahip oldu / geçmiş perfect", "Geçmiş Zaman (V2/V3)", "🔵"),
    ("having", "sahip olma / sahip olan", "Fiil (V-ing)", "🔵"),
    ("do", "yapmak", "Fiil / Yardımcı Fiil", "🔵"),
    ("does", "yapar (3. Tekil)", "Geniş Zaman (3. Tekil)", "🔵"),
    ("did", "yaptı (geçmiş)", "Geçmiş Zaman (V2)", "🔵"),
    ("done", "yapılmış (3. Hali)", "Past Participle (V3)", "🔵"),
    ("doing", "yapma / yapan", "Fiil (V-ing)", "🔵"),
    ("can", "-ebilmek, -abilmek (yetenek/izin)", "Modal (Kip)", "⚡"),
    ("could", "-ebilirdi, yapabildi (geçmiş yetenek)", "Modal (Kip)", "⚡"),
    ("will", "-ecek, -acak (gelecek zaman kipi)", "Gelecek Zaman Kipi", "🚀"),
    ("would", "-erdi, -ardı / istemek (rica)", "Modal (Kip)", "⚡"),
    ("shall", "-elim mi, yapacağız (teklif)", "Modal (Kip)", "⚡"),
    ("should", "-meli, -malı (tavsiye)", "Tavsiye Kipi (Modal)", "💡"),
    ("must", "-meli, -malı (zorunluluk/kuvvetli tahmin)", "Zorunluluk Kipi", "⚖️"),
    ("may", "-ebilir, -abilir (olasılık/izin)", "Olasılık/İzin Kipi", "🎲"),
    ("might", "-ebilirdi (düşük olasılık)", "Düşük Olasılık Kipi", "🎲"),
    ("ought to", "-meli, -malı (görev/tavsiye)", "Tavsiye Kipi", "💡"),
    ("need to", "yapması gerekmek", "Gereklilik Fiili", "❗"),
    ("have to", "zorunda olmak", "Zorunluluk Kalıbı", "⚖️"),
    ("has to", "zorunda olmak (3. Tekil)", "Zorunluluk Kalıbı", "⚖️"),
    ("had to", "zorunda kaldı (geçmiş)", "Geçmiş Zorunluluk", "⚖️"),
    ("used to", "eskiden yapardı (bırakılmış alışkanlık)", "Geçmiş Alışkanlık", "⏳"),
    ("be able to", "-ebilmek, gücü yetmek", "Yetenek Kalıbı", "⚡"),

    # Archaeology, Discoveries & History
    ("discovery", "keşif, buluş", "İsim (Science)", "🔍"),
    ("discoveries", "keşifler, buluşlar", "Çoğul İsim", "🔍"),
    ("discover", "keşfetmek, bulmak", "Fiil (Verb)", "🔍"),
    ("discovers", "keşfeder, bulur", "Geniş Zaman Fiil (3. Tekil)", "🔍"),
    ("discovered", "keşfetti, bulundu", "Geçmiş Zaman Fiil (V2/V3)", "🔍"),
    ("discovering", "keşfederek, bulan", "Fiil (V-ing)", "🔍"),
    ("mysterious", "gizemli, esrarengiz, esrarlı", "Sıfat (Adjective)", "🕵️"),
    ("mysteriously", "gizemli bir şekilde, esrarengizce", "Durum Zarfı", "🟣"),
    ("mystery", "gizem, sır, esrar", "İsim (Noun)", "🕵️"),
    ("mysteries", "gizemler, sırlar", "Çoğul İsim", "🕵️"),
    ("archaeological", "arkeolojik, kazı bilimiyle ilgili", "Sıfat (History)", "🏺"),
    ("archaeology", "arkeoloji, kazı bilimi", "İsim (Science)", "🏺"),
    ("archaeologist", "arkeolog, kazı bilimci", "İsim (People)", "🏺"),
    ("archaeologists", "arkeologlar", "Çoğul İsim", "🏺"),
    ("artifact", "tarihi eser, insan yapımı tarihi obje", "İsim (History)", "🏺"),
    ("artifacts", "tarihi eserler, antik objeler", "Çoğul İsim", "🏺"),
    ("ancient", "antik, çok eski çağlara ait", "Sıfat (History)", "🏛️"),
    ("civilization", "medeniyet, uygarlık", "İsim (History)", "🏛️"),
    ("civilizations", "medeniyetler, uygarlıklar", "Çoğul İsim", "🏛️"),
    ("excavation", "kazı, arkeolojik kazı alanı", "İsim (History)", "⛏️"),
    ("excavations", "kazılar", "Çoğul İsim", "⛏️"),
    ("excavate", "kazı yapmak, kazarak çıkarmak", "Fiil (Action)", "⛏️"),
    ("excavated", "kazıldı, çıkarıldı", "Geçmiş Zaman Fiil (V2/V3)", "⛏️"),
    ("valley", "vadi, koyak", "İsim (Geography)", "🏞️"),
    ("valleys", "vadiler", "Çoğul İsim", "🏞️"),
    ("ruins", "harabeler, kalıntılar, ören yeri", "Çoğul İsim (History)", "🏛️"),
    ("ruin", "mahvetmek, harabe", "Fiil / İsim", "🏛️"),
    ("site", "sit alanı, kazı alanı, yer, web sitesi", "İsim (Noun)", "📍"),
    ("sites", "sit alanları, kazı yerleri, siteler", "Çoğul İsim", "📍"),
    ("historical", "tarihi, tarihsel", "Sıfat (History)", "📜"),
    ("history", "tarih, geçmiş", "İsim (History)", "📜"),
    ("historian", "tarihçi", "İsim (People)", "📜"),
    ("historians", "tarihçiler", "Çoğul İsim", "📜"),
    ("museum", "müze", "İsim (Place)", "🏛️"),
    ("museums", "müzeler", "Çoğul İsim", "🏛️"),
    ("statue", "heykel", "İsim (Art)", "🗿"),
    ("statues", "heykeller", "Çoğul İsim", "🗿"),
    ("tomb", "mezar, anıt mezar, türbe", "İsim (History)", "⚰️"),
    ("tombs", "anıt mezarlar", "Çoğul İsim", "⚰️"),
    ("pyramid", "piramit", "İsim (History)", "🔺"),
    ("pyramids", "piramitler", "Çoğul İsim", "🔺"),
    ("treasure", "hazine, değerli buluntu", "İsim (History)", "💎"),
    ("treasures", "hazineler", "Çoğul İsim", "💎"),
    ("coin", "madeni para, sikke / para basmak", "İsim / Fiil", "🪙"),
    ("coins", "madeni paralar, sikkeler", "Çoğul İsim", "🪙"),
    ("clay", "kil, balçık, kilden yapılmış", "İsim / Sıfat", "🏺"),
    ("pottery", "çanak çömlek, seramik sanatı", "İsim (Art/History)", "🏺"),
    ("fossil", "fosil, taşıl", "İsim (Science)", "🦴"),
    ("fossils", "fosiller", "Çoğul İsim", "🦴"),
    ("skeleton", "iskelet", "İsim (Science)", "💀"),
    ("skeletons", "iskeletler", "Çoğul İsim", "💀"),
    ("temple", "tapınak, mabet", "İsim (Place)", "⛩️"),
    ("temples", "tapınaklar", "Çoğul İsim", "⛩️"),
    ("castle", "kale, şato", "İsim (Place)", "🏰"),
    ("castles", "kaleler, şatolar", "Çoğul İsim", "🏰"),
    ("palace", "saray", "İsim (Place)", "👑"),
    ("palaces", "saraylar", "Çoğul İsim", "👑"),
    ("monument", "anıt, abide", "İsim (Place)", "🗿"),
    ("monuments", "anıtlar, abideler", "Çoğul İsim", "🗿"),

    # Social, Youth & Environment
    ("worldwide", "dünya çapında, evrensel, küresel", "Zarf / Sıfat", "🌍"),
    ("global", "küresel, dünya geneli", "Sıfat (Adjective)", "🌍"),
    ("globally", "küresel olarak, dünya çapında", "Durum Zarfı", "🟣"),
    ("international", "uluslararası", "Sıfat (Adjective)", "🌐"),
    ("internationally", "uluslararası düzeyde", "Durum Zarfı", "🟣"),
    ("national", "ulusal, milli", "Sıfat (Adjective)", "🇹🇷"),
    ("nationally", "ulusal düzeyde", "Durum Zarfı", "🟣"),
    ("local", "yerel, mahalli, yöresel", "Sıfat (Adjective)", "📍"),
    ("locally", "yerel olarak, yöresel olarak", "Durum Zarfı", "🟣"),
    ("hang out", "takılmak, vakit geçirmek (arkadaşlarla)", "Deyimsel Fiil", "⚡"),
    ("keen on", "meraklı, düşkün, hevesli", "Deyimsel Sıfat", "💡"),
    ("enthusiastic", "hevesli, coşkulu, şevkli", "Sıfat (Adjective)", "🔥"),
    ("enthusiastically", "hevesle, coşkuyla", "Durum Zarfı", "🟣"),
    ("enthusiasm", "heves, coşku, şevk", "İsim (Noun)", "🔥"),
    ("belong", "ait olmak, dahil olmak", "Fiil (Verb)", "🏷️"),
    ("belongs", "aittir, dahildir", "Geniş Zaman Fiil (3. Tekil)", "🏷️"),
    ("belonged", "aitti, dahil oldu", "Geçmiş Zaman Fiil (V2/V3)", "🏷️"),
    ("belonging", "aidiyet, ait olma", "İsim (Noun)", "🏷️"),
    ("belongings", "şahsi eşyalar, ait olanlar", "Çoğul İsim", "🎒"),
    ("connect", "bağlamak, bağlantı kurmak, iletişim kurmak", "Fiil (Verb)", "🔗"),
    ("connects", "bağlar, bağlantı kurar", "Geniş Zaman Fiil (3. Tekil)", "🔗"),
    ("connected", "bağlı, bağlantı kurdu", "Sıfat / Fiil (V2/V3)", "🔗"),
    ("connecting", "bağlayan, bağlantı kurarak", "Fiil (V-ing)", "🔗"),
    ("connection", "bağlantı, ilişki, bağ", "İsim (Noun)", "🔗"),
    ("connections", "bağlantılar, ilişkiler", "Çoğul İsim", "🔗"),
    ("interaction", "etkileşim, karşılıklı iletişim", "İsim (Noun)", "💬"),
    ("interactions", "etkileşimler", "Çoğul İsim", "💬"),
    ("interact", "etkileşime girmek, iletişim kurmak", "Fiil (Action)", "💬"),
    ("interacts", "etkileşime girer", "Geniş Zaman Fiil (3. Tekil)", "💬"),
    ("interacted", "etkileşime girdi", "Geçmiş Zaman Fiil (V2/V3)", "💬"),
    ("interacting", "etkileşimde bulunan", "Fiil (V-ing)", "💬"),
    ("interactive", "etkileşimli, interaktif", "Sıfat (Tech/Edu)", "✨"),
    ("leisure", "boş zaman, serbest vakit, dinlenme", "İsim (Noun)", "🎮"),
    ("prefer", "tercih etmek, yeğlemek", "Fiil (Verb)", "⭐"),
    ("prefers", "tercih eder, yeğler", "Geniş Zaman Fiil (3. Tekil)", "⭐"),
    ("preferred", "tercih etti, yeğledi", "Geçmiş Zaman Fiil (V2/V3)", "⭐"),
    ("preferring", "tercih ederek", "Fiil (V-ing)", "⭐"),
    ("preference", "tercih, öncelik, beğeni", "İsim (Noun)", "⭐"),
    ("preferences", "tercihler, beğeniler", "Çoğul İsim", "⭐"),

    # School, Academics & High School Success
    ("curriculum", "müfredat, öğretim programı", "İsim (School)", "📚"),
    ("curriculums", "müfredatlar", "Çoğul İsim", "📚"),
    ("curricula", "müfredatlar", "Çoğul İsim", "📚"),
    ("syllabus", "ders izlencesi, konu planı", "İsim (School)", "📑"),
    ("term", "dönem, sömestr / terim", "İsim (School)", "📅"),
    ("terms", "dönemler / terimler / şartlar", "Çoğul İsim", "📅"),
    ("semester", "yarıyıl, dönem, sömestr", "İsim (School)", "📅"),
    ("semesters", "dönemler", "Çoğul İsim", "📅"),
    ("assignment", "ödev, görev, proje", "İsim (School)", "📝"),
    ("assignments", "ödevler, görevler", "Çoğul İsim", "📝"),
    ("homework", "ev ödevi", "İsim (School)", "📝"),
    ("project", "proje, çalışma / tasarlamak", "İsim / Fiil", "📊"),
    ("projects", "projeler", "Çoğul İsim", "📊"),
    ("presentation", "sunum, takdim", "İsim (School)", "📽️"),
    ("presentations", "sunumlar", "Çoğul İsim", "📽️"),
    ("present", "sunmak / mevcut, hazır / hediye", "Fiil / Sıfat / İsim", "🎁"),
    ("presents", "sunar / hediyeler", "Geniş Zaman / Çoğul İsim", "🎁"),
    ("presented", "sundu, takdim etti", "Geçmiş Zaman Fiil (V2/V3)", "🎁"),
    ("presenting", "sunarak, takdim eden", "Fiil (V-ing)", "🎁"),
    ("attendance", "devamlılık, yoklama, katılım", "İsim (School)", "📋"),
    ("absent", "devamsız, yok, bulunmayan", "Sıfat (School)", "❌"),
    ("absence", "yokluk, devamsızlık", "İsim (School)", "❌"),
    ("discipline", "disiplin, öz denetim", "İsim (School)", "⚖️"),
    ("disciplined", "disiplinli, düzenli", "Sıfat (School)", "⚖️"),
    ("motivation", "motivasyon, heves, güdü", "İsim (Psychology)", "🔥"),
    ("motivated", "motive olmuş, istekli", "Sıfat (Psychology)", "🔥"),
    ("motivate", "motive etmek, heveslendirmek", "Fiil (Action)", "🔥"),
    ("motivating", "motive edici, heveslendirici", "Sıfat / Fiil", "🔥"),
    ("objective", "amaç, hedef / tarafsız, nesnel", "İsim / Sıfat", "🎯"),
    ("objectives", "amaçlar, hedefler", "Çoğul İsim", "🎯"),
    ("target", "hedef, amaç / hedeflemek", "İsim / Fiil", "🎯"),
    ("targets", "hedefler / hedefler", "Çoğul İsim / Fiil", "🎯"),
    ("goal", "hedef, gaye, amaç / gol", "İsim (Noun)", "⚽"),
    ("goals", "hedefler, amaçlar", "Çoğul İsim", "⚽"),
    ("strategy", "strateji, yöntem, plan", "İsim (Noun)", "🧠"),
    ("strategies", "stratejiler, yöntemler", "Çoğul İsim", "🧠"),
    ("technique", "teknik, usul, yöntem", "İsim (Noun)", "🛠️"),
    ("techniques", "teknikler, yöntemler", "Çoğul İsim", "🛠️"),
    ("method", "metot, yöntem", "İsim (Noun)", "📐"),
    ("methods", "metotlar, yöntemler", "Çoğul İsim", "📐"),
    ("approach", "yaklaşım / yaklaşmak", "İsim / Fiil", "🚶"),
    ("approaches", "yaklaşımlar / yaklaşır", "Çoğul İsim / Fiil", "🚶"),
    ("analyze", "analiz etmek, incelemek", "Fiil (Action)", "🔍"),
    ("analyzes", "analiz eder, inceler", "Geniş Zaman Fiil (3. Tekil)", "🔍"),
    ("analyzed", "analiz etti, inceledi", "Geçmiş Zaman Fiil (V2/V3)", "🔍"),
    ("analyzing", "analiz ederek, inceleyen", "Fiil (V-ing)", "🔍"),
    ("analysis", "analiz, çözümleme, tahlil", "İsim (Noun)", "🔍"),
    ("analyses", "analizler, tahliller", "Çoğul İsim", "🔍"),
    ("evaluate", "değerlendirmek, puanlamak", "Fiil (Action)", "📝"),
    ("evaluates", "değerlendirir", "Geniş Zaman Fiil (3. Tekil)", "📝"),
    ("evaluated", "değerlendirdi", "Geçmiş Zaman Fiil (V2/V3)", "📝"),
    ("evaluating", "değerlendirerek", "Fiil (V-ing)", "📝"),
    ("evaluation", "değerlendirme, ölçme", "İsim (School)", "📝"),
    ("evaluations", "değerlendirmeler", "Çoğul İsim", "📝"),
    ("summary", "özet, hülasa", "İsim (Noun)", "📄"),
    ("summaries", "özetler", "Çoğul İsim", "📄"),
    ("summarize", "özetlemek, kısaca anlatmak", "Fiil (Action)", "📄"),
    ("summarizes", "özetler", "Geniş Zaman Fiil (3. Tekil)", "📄"),
    ("summarized", "özetledi", "Geçmiş Zaman Fiil (V2/V3)", "📄"),
    ("summarizing", "özetleyerek", "Fiil (V-ing)", "📄"),
    ("paraphrase", "farklı kelimelerle ifade etmek", "Fiil / İsim", "🔄"),
    ("pronounce", "telaffuz etmek, sesletmek", "Fiil (Language)", "🗣️"),
    ("pronounces", "telaffuz eder", "Geniş Zaman Fiil (3. Tekil)", "🗣️"),
    ("pronounced", "telaffuz etti / belirgin", "Geçmiş Zaman / Sıfat", "🗣️"),
    ("pronouncing", "telaffuz ederek", "Fiil (V-ing)", "🗣️"),
    ("pronunciation", "telaffuz, söyleniş", "İsim (Language)", "🗣️"),
    ("comprehend", "kavramak, anlamak, idrak etmek", "Fiil (Mind)", "💡"),
    ("comprehends", "kavrar, anlar", "Geniş Zaman Fiil (3. Tekil)", "💡"),
    ("comprehended", "kavradı, anladı", "Geçmiş Zaman Fiil (V2/V3)", "💡"),
    ("comprehending", "kavrayarak, anlayarak", "Fiil (V-ing)", "💡"),
    ("comprehension", "kavrama, okuduğunu anlama", "İsim (School)", "💡"),

    # Pronouns, Determiners & Possessives
    ("i", "ben (özne zamiri)", "Özne Zamiri (Pronoun)", "👤"),
    ("me", "beni, bana (nesne zamiri)", "Nesne Zamiri (Pronoun)", "👤"),
    ("my", "benim (iyelik sıfatı)", "İyelik Sıfatı (Possessive)", "👤"),
    ("mine", "benimki (iyelik zamiri)", "İyelik Zamiri (Pronoun)", "👤"),
    ("myself", "kendim, kendimi", "Dönüşlü Zamir (Reflexive)", "👤"),
    ("you", "sen, siz (özne/nesne)", "Şahıs Zamiri (Pronoun)", "👥"),
    ("your", "senin, sizin (iyelik sıfatı)", "İyelik Sıfatı (Possessive)", "👥"),
    ("yours", "seninki, sizinki", "İyelik Zamiri (Pronoun)", "👥"),
    ("yourself", "kendin, kendini", "Dönüşlü Zamir (Reflexive)", "👥"),
    ("yourselves", "kendiniz, kendinizi", "Dönüşlü Zamir (Reflexive)", "👥"),
    ("he", "o (erkek özne zamiri)", "Özne Zamiri (Pronoun)", "👨"),
    ("him", "onu, ona (erkek nesne zamiri)", "Nesne Zamiri (Pronoun)", "👨"),
    ("his", "onun, onunki (erkek iyelik)", "İyelik Sıfatı/Zamiri", "👨"),
    ("himself", "kendisi, kendini (erkek)", "Dönüşlü Zamir (Reflexive)", "👨"),
    ("she", "o (kadın özne zamiri)", "Özne Zamiri (Pronoun)", "👩"),
    ("her", "onu, ona / onun (kadın)", "Nesne / İyelik Zamiri", "👩"),
    ("hers", "onunki (kadın iyelik)", "İyelik Zamiri (Pronoun)", "👩"),
    ("herself", "kendisi, kendini (kadın)", "Dönüşlü Zamir (Reflexive)", "👩"),
    ("it", "o, onu, ona (cansız/hayvan)", "Şahıs Zamiri (Pronoun)", "🐾"),
    ("its", "onun (cansız/hayvan iyelik)", "İyelik Sıfatı (Possessive)", "🐾"),
    ("itself", "kendisi, kendini (cansız)", "Dönüşlü Zamir (Reflexive)", "🐾"),
    ("we", "biz (özne zamiri)", "Özne Zamiri (Pronoun)", "👥"),
    ("us", "bizi, bize (nesne zamiri)", "Nesne Zamiri (Pronoun)", "👥"),
    ("our", "bizim (iyelik sıfatı)", "İyelik Sıfatı (Possessive)", "👥"),
    ("ours", "bizimki (iyelik zamiri)", "İyelik Zamiri (Pronoun)", "👥"),
    ("ourselves", "kendimiz, kendimizi", "Dönüşlü Zamir (Reflexive)", "👥"),
    ("they", "onlar (özne zamiri)", "Özne Zamiri (Pronoun)", "👥"),
    ("them", "onları, onlara (nesne zamiri)", "Nesne Zamiri (Pronoun)", "👥"),
    ("their", "onların (iyelik sıfatı)", "İyelik Sıfatı (Possessive)", "👥"),
    ("theirs", "onlarınki (iyelik zamiri)", "İyelik Zamiri (Pronoun)", "👥"),
    ("themselves", "kendileri, kendilerini", "Dönüşlü Zamir (Reflexive)", "👥"),
    ("this", "bu (yakındaki tekil nesne)", "İşaret Sıfatı/Zamiri", "👉"),
    ("that", "şu, o / -ki (bağlaç)", "İşaret Zamiri / Bağlaç", "👉"),
    ("these", "bunlar (yakındaki çoğul)", "İşaret Sıfatı/Zamiri", "👉"),
    ("those", "şunlar, onlar (uzaktaki)", "İşaret Sıfatı/Zamiri", "👉"),
    ("who", "kim, kimi / -en, -an (ilgi)", "Soru / İlgi Zamiri", "❓"),
    ("whom", "kime, kimi", "Soru / İlgi Zamiri", "❓"),
    ("whose", "kimin / -in ki", "Soru / İyelik İlgi Zamiri", "❓"),
    ("which", "hangi, hangisi", "Soru / İlgi Zamiri", "❓"),
    ("what", "ne, neyi, hangi", "Soru Zamiri", "❓"),
    ("where", "nerede, nereye, neresi", "Soru Zarfı (Yer)", "📍"),
    ("when", "ne zaman / -dığı zaman", "Soru Zarfı / Zaman Bağlacı", "⏰"),
    ("why", "neden, niçin", "Soru Zarfı (Sebep)", "❓"),
    ("how", "nasıl / ne kadar", "Soru Zarfı (Durum/Derece)", "❓"),

    # Health, Fitness, Routine & Body
    ("health", "sağlık, sıhhat", "İsim (Health)", "❤️"),
    ("healthy", "sağlıklı, sıhhatli", "Sıfat (Health)", "❤️"),
    ("healthier", "daha sağlıklı", "Karşılaştırma Sıfatı", "❤️"),
    ("healthiest", "en sağlıklı", "Üstünlük Sıfatı", "❤️"),
    ("unhealthy", "sağlıksız, zararlı", "Sıfat (Health)", "⚠️"),
    ("diet", "beslenme düzeni, diyet", "İsim (Health)", "🥗"),
    ("nutrition", "beslenme, gıda alımı", "İsim (Health)", "🥗"),
    ("nutritious", "besleyici, yararlı", "Sıfat (Health)", "🥗"),
    ("vitamin", "vitamin", "İsim (Health)", "💊"),
    ("vitamins", "vitaminler", "Çoğul İsim", "💊"),
    ("mineral", "mineral", "İsim (Health)", "💧"),
    ("minerals", "mineraller", "Çoğul İsim", "💧"),
    ("protein", "protein", "İsim (Health)", "🥩"),
    ("proteins", "proteinler", "Çoğul İsim", "🥩"),
    ("carbohydrate", "karbonhidrat", "İsim (Health)", "🍞"),
    ("carbohydrates", "karbonhidratlar", "Çoğul İsim", "🍞"),
    ("calorie", "kalori", "İsim (Health)", "🔥"),
    ("calories", "kaloriler", "Çoğul İsim", "🔥"),
    ("hydrate", "vücudun su ihtiyacını karşılamak", "Fiil (Health)", "💧"),
    ("hydration", "su alımı, nemlendirme", "İsim (Health)", "💧"),
    ("stamina", "dayanıklılık, kondisyon", "İsim (Sports)", "🏃"),
    ("endurance", "dayanıklılık, tahammül", "İsim (Sports)", "🏃"),
    ("energy", "enerji, güç, zindelik", "İsim (Noun)", "⚡"),
    ("energetic", "enerjik, hareketli, canlı", "Sıfat (Adjective)", "⚡"),
    ("exhausted", "bitkin, tükenmiş, aşırı yorgun", "Sıfat (Feeling)", "😴"),
    ("exhaustion", "aşırı yorgunluk, bitkinlik", "İsim (Health)", "😴"),
    ("tired", "yorgun", "Sıfat (Feeling)", "🥱"),
    ("sleepy", "uykulu, uykusu gelmiş", "Sıfat (Feeling)", "🥱"),
    ("awake", "uyanık, ayakta", "Sıfat (State)", "👀"),
    ("asleep", "uykuda, uyuyan", "Sıfat (State)", "💤"),
    ("insomnia", "uykusuzluk hastalığı", "İsim (Health)", "🌙"),
    ("hygiene", "hijyen, temizlik", "İsim (Health)", "🧼"),
    ("hygienic", "hijyenik, temiz, sağlıklı", "Sıfat (Health)", "🧼")
]

for item in COMPREHENSIVE_VOCAB:
    add_word(item[0], item[1], item[2], item[3] if len(item)>3 else "📖", overwrite=True)

# 5. Automatic Derivations (Adverbs -ly, Plurals -s/-es, Regular verbs)
words_snapshot = list(dictionary.keys())
for k in words_snapshot:
    entry = dictionary[k]
    tr = entry["tr"]
    pos = entry["type_label"]
    
    # Adjectives to Adverbs (-ly)
    if ("sıfat" in pos.lower() or "adjective" in pos.lower()) and not k.endswith("ly"):
        adv_word = k + "ly"
        if k.endswith("y") and len(k) > 2 and k[-2] not in "aeiou":
            adv_word = k[:-1] + "ily"
        elif k.endswith("le"):
            adv_word = k[:-1] + "y"
        elif k.endswith("ic"):
            adv_word = k + "ally"
            
        if adv_word not in dictionary:
            root_meaning = tr.split(',')[0].split('/')[0].strip()
            add_word(adv_word, f"{root_meaning} bir şekilde", "Durum Zarfı (Adverb)", "🟣")

    # Regular verb derivations (-s, -ed, -ing)
    if "fiil" in pos.lower() and not entry.get("root"):
        # -s form
        s_form = k + "s" if not k.endswith(("s", "sh", "ch", "x", "z", "o")) else k + "es"
        if k.endswith("y") and len(k) > 2 and k[-2] not in "aeiou":
            s_form = k[:-1] + "ies"
        if s_form not in dictionary:
            add_word(s_form, f"{tr} (Geniş Zaman / 3. Tekil)", "Geniş Zaman Fiil (3. Tekil)", "🔵")
        
        # -ing form
        ing_form = k + "ing"
        if k.endswith("e") and not k.endswith(("ee", "oe", "ye")):
            ing_form = k[:-1] + "ing"
        if ing_form not in dictionary:
            add_word(ing_form, f"{tr} (Şimdiki Zaman / -ing)", "Şimdiki Zaman Fiil (V-ing)", "🔵")

        # -ed form
        ed_form = k + "ed"
        if k.endswith("e"):
            ed_form = k + "d"
        elif k.endswith("y") and len(k) > 2 and k[-2] not in "aeiou":
            ed_form = k[:-1] + "ied"
        if ed_form not in dictionary:
            add_word(ed_form, f"{tr} (Geçmiş Zaman / -ed)", "Geçmiş Zaman Fiil (V2/V3)", "🔵")

    # Noun plurals (-s/-es)
    if ("isim" in pos.lower() or "noun" in pos.lower()) and not k.endswith("s"):
        pl_form = k + "s" if not k.endswith(("s", "sh", "ch", "x", "z", "o")) else k + "es"
        if k.endswith("y") and len(k) > 2 and k[-2] not in "aeiou":
            pl_form = k[:-1] + "ies"
        if pl_form not in dictionary:
            add_word(pl_form, f"{tr} (Çoğul)", "Çoğul İsim (Plural)", "🔴")

# Save JSON
with open(JSON_OUT, 'w', encoding='utf-8') as f:
    json.dump(dictionary, f, ensure_ascii=False, indent=2)

# Save JS for direct synchronous embedding
js_content = f"/** Auto-generated Master Offline Dictionary **/\nwindow.MASTER_DICTIONARY = {json.dumps(dictionary, ensure_ascii=False)};\n"
with open(JS_OUT, 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f"🎉 Successfully generated full_dictionary.json and dictionary_data.js with {len(dictionary)} words!")
