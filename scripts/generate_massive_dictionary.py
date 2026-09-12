#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate Massive Offline English-Turkish Dictionary (3500+ Words)
Outputs:
  - data/full_dictionary.json
  - js/dictionary_data.js (for zero-latency offline synchronous memory access)
"""

import json
import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JSON_OUT = os.path.join(BASE_DIR, 'data', 'full_dictionary.json')
JS_OUT = os.path.join(BASE_DIR, 'js', 'dictionary_data.js')

dictionary = {}

def add_word(en, tr, pos="Kelime", icon="📖"):
    if not en or not tr:
        return
    en_clean = str(en).strip().lower()
    if not en_clean:
        return
    if en_clean not in dictionary:
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
        for w in c_data.get('all_words', []):
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

# 4. Master CEFR A1-B2 & Oxford 3000 Curated Vocabulary
MASTER_WORDS = [
    # Prepositions & Essential Function Words
    ("with", "ile, birlikte / -li, -lı", "Edat (Preposition)", "🟡"),
    ("without", "-sız, -siz, olmadan", "Edat (Preposition)", "🟡"),
    ("for", "için, amacıyla / süresince (-dır)", "Edat (Preposition)", "🟡"),
    ("from", "-den, -dan (çıkış/başlangıç)", "Edat (Preposition)", "🟡"),
    ("to", "-e, -a (yönelme) / mastar eki", "Edat (Preposition)", "🟡"),
    ("at", "-de, -da (konum / saat)", "Edat (Preposition)", "🟡"),
    ("by", "tarafından / ile / yanında", "Edat (Preposition)", "🟡"),
    ("on", "üzerinde / günlerde (-de)", "Edat (Preposition)", "🟡"),
    ("in", "içinde / aylarda/yıllarda (-de)", "Edat (Preposition)", "🟡"),
    ("under", "altında", "Edat (Preposition)", "🟡"),
    ("over", "üzerinde, yukarısında / bitmiş", "Edat (Preposition)", "🟡"),
    ("into", "içine doğru", "Edat (Preposition)", "🟡"),
    ("onto", "üzerine doğru", "Edat (Preposition)", "🟡"),
    ("about", "hakkında / yaklaşık olarak", "Edat / Zarf", "🟡"),
    ("against", "karşı, aleyhinde", "Edat (Preposition)", "🟡"),
    ("between", "arasında (iki şeyin)", "Edat (Preposition)", "🟡"),
    ("among", "arasında (ikiden fazla şeyin)", "Edat (Preposition)", "🟡"),
    ("through", "içinden, boyunca, vasıtasıyla", "Edat (Preposition)", "🟡"),
    ("during", "esnasında, boyunca, sırasında", "Edat (Preposition)", "🟡"),
    ("before", "önce, önünde / daha önce", "Edat / Bağlaç / Zarf", "⏳"),
    ("after", "sonra, ardından", "Edat / Bağlaç / Zarf", "⏳"),
    ("above", "yukarısında, üstünde", "Edat (Preposition)", "🟡"),
    ("below", "aşağısında, altında", "Edat (Preposition)", "🟡"),
    ("behind", "arkasında, gerisinde", "Edat (Preposition)", "🟡"),
    ("near", "yakınında, yanında", "Edat / Sıfat", "📍"),
    ("across", "karşısında, karşıdan karşıya", "Edat (Preposition)", "🟡"),
    ("along", "boyunca", "Edat (Preposition)", "🟡"),
    ("towards", "-e doğru (yön)", "Edat (Preposition)", "🟡"),
    ("around", "etrafında, çevresinde / yaklaşık", "Edat / Zarf", "🟡"),
    ("beside", "yanında, bitişiğinde", "Edat (Preposition)", "🟡"),
    ("beyond", "ötesinde, aşan", "Edat (Preposition)", "🟡"),
    ("within", "içinde, dahilinde", "Edat (Preposition)", "🟡"),
    ("basic", "temel, basit, esas", "Sıfat (Adjective)", "🟩"),
    ("basics", "temel bilgiler, esaslar", "Çoğul İsim", "📐"),
    ("beginner", "başlangıç seviyesi, acemi", "İsim (Level)", "🌱"),
    ("beginners", "yeni başlayanlar", "Çoğul İsim", "🌱"),

    # Pronouns & Determiners
    ("more", "daha fazla, daha çok", "Miktar Belirteci / Zarf", "📊"),
    ("most", "en çok, en fazla, çoğu", "Belirteç / Sıfat", "📊"),
    ("less", "daha az", "Belirteç / Zarf", "📊"),
    ("least", "en az", "Belirteç / Sıfat", "📊"),
    ("also", "ayrıca, de/da, aynı zamanda", "Zarf (Adverb)", "🟣"),
    ("too", "aşırı, fazla / -de, -da", "Derece Zarfı", "🟣"),
    ("enough", "yeterli, yeterince", "Belirteç / Zarf", "⚖️"),
    ("very", "çok, pek", "Derece Zarfı", "🟣"),
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
    ("such", "böyle, bu gibi, öylesine", "Belirteç", "🟩"),
    ("several", "birkaç, birtakım", "Belirteç", "🔢"),
    ("few", "az, birkaç (sayılabilen)", "Belirteç", "🔢"),
    ("little", "az (sayılamayan) / küçük", "Belirteç / Sıfat", "🔢"),
    ("someone", "biri, birisi", "Belgisiz Zamir", "👤"),
    ("somebody", "biri, bir kimse", "Belgisiz Zamir", "👤"),
    ("something", "bir şey", "Belgisiz Zamir", "📦"),
    ("somewhere", "bir yer, bir yere", "Belgisiz Zarf", "📍"),
    ("anyone", "herhangi biri, kimse", "Belgisiz Zamir", "👤"),
    ("anybody", "herhangi biri, hiç kimse", "Belgisiz Zamir", "👤"),
    ("anything", "herhangi bir şey, hiçbir şey", "Belgisiz Zamir", "📦"),
    ("anywhere", "herhangi bir yer, hiçbir yer", "Belgisiz Zarf", "📍"),
    ("everyone", "herkes", "Belgisiz Zamir", "👥"),
    ("everybody", "herkes, her kimse", "Belgisiz Zamir", "👥"),
    ("everything", "her şey", "Belgisiz Zamir", "📦"),
    ("everywhere", "her yer, her yere", "Belgisiz Zarf", "📍"),
    ("no one", "hiç kimse", "Belgisiz Zamir", "👤"),
    ("nobody", "hiç kimse", "Belgisiz Zamir", "👤"),
    ("nothing", "hiçbir şey", "Belgisiz Zamir", "📦"),
    ("nowhere", "hiçbir yer", "Belgisiz Zarf", "📍"),

    # Grammar & Linguistics
    ("present", "şimdiki / sunmak / hediye / mevcut", "Sıfat / Fiil / İsim", "🎁"),
    ("simple", "basit, sade, yalın", "Sıfat (Adjective)", "🟩"),
    ("continuous", "sürekli, devam eden, şimdiki", "Sıfat (Adjective)", "🟩"),
    ("progressive", "ilerleyen, süregelen", "Sıfat (Adjective)", "🟩"),
    ("perfect", "kusursuz, mükemmel / tamamlanmış zaman", "Sıfat (Adjective)", "⭐"),
    ("past", "geçmiş, geçen / geçmiş zaman", "İsim / Sıfat", "⏳"),
    ("future", "gelecek, istikbal / gelecek zaman", "İsim / Sıfat", "🚀"),
    ("form", "oluşturmak, biçimlendirmek / form, şekil", "Fiil / İsim", "📐"),
    ("forms", "biçimler, formlar / oluşturur", "Çoğul İsim / Fiil", "📐"),
    ("verb", "fiil, eylem", "İsim (Grammar)", "🔵"),
    ("verbs", "fiiller, eylemler", "Çoğul İsim", "🔵"),
    ("noun", "isim, ad", "İsim (Grammar)", "🔴"),
    ("nouns", "isimler, adlar", "Çoğul İsim", "🔴"),
    ("adjective", "sıfat, önad", "İsim (Grammar)", "🟩"),
    ("adjectives", "sıfatlar", "Çoğul İsim", "🟩"),
    ("adverb", "zarf, belirteç", "İsim (Grammar)", "🟣"),
    ("adverbs", "zarflar", "Çoğul İsim", "🟣"),
    ("pronoun", "zamir, adıl", "İsim (Grammar)", "👤"),
    ("pronouns", "zamirler", "Çoğul İsim", "👤"),
    ("preposition", "edat, ilgeç", "İsim (Grammar)", "🟡"),
    ("prepositions", "edatlar", "Çoğul İsim", "🟡"),
    ("conjunction", "bağlaç", "İsim (Grammar)", "🔗"),
    ("conjunctions", "bağlaçlar", "Çoğul İsim", "🔗"),
    ("sentence", "cümle, tümce", "İsim (Grammar)", "💬"),
    ("sentences", "cümleler", "Çoğul İsim", "💬"),
    ("clause", "cümlecik, yan cümle", "İsim (Grammar)", "📝"),
    ("clauses", "cümlecikler", "Çoğul İsim", "📝"),
    ("structure", "yapı, bünye / yapılandırmak", "İsim / Fiil", "🏗️"),
    ("structures", "yapılar", "Çoğul İsim", "🏗️"),
    ("grammar", "dilbilgisi, gramer", "İsim (Language)", "📚"),
    ("vocabulary", "kelime hazinesi, sözcük dağarcığı", "İsim (Language)", "🔤"),
    ("tense", "zaman (dilbilgisinde)", "İsim (Grammar)", "⏳"),
    ("tenses", "zamanlar (gramer)", "Çoğul İsim", "⏳"),
    ("subject", "özne / ders, konu", "İsim (Grammar/School)", "👤"),
    ("subjects", "özneler / dersler", "Çoğul İsim", "👤"),
    ("object", "nesne, tümleç / itiraz etmek", "İsim / Fiil", "📦"),
    ("objects", "nesneler / itiraz eder", "Çoğul İsim", "📦"),
    ("meaning", "anlam, mana", "İsim (Language)", "📖"),
    ("meanings", "anlamlar", "Çoğul İsim", "📖"),
    ("definition", "tanım, açıklama", "İsim (Language)", "📝"),
    ("definitions", "tanımlar", "Çoğul İsim", "📝"),
    ("pronunciation", "telaffuz, söyleniş", "İsim (Language)", "🔊"),
    ("translation", "çeviri, tercüme", "İsim (Language)", "🌐"),
    ("translations", "çeviriler", "Çoğul İsim", "🌐"),

    # Academic, Textbook & School Vocabulary (Fly Higher & General)
    ("express", "ifade etmek, belirtmek / hızlı", "Fiil / Sıfat", "💬"),
    ("expressed", "ifade edilmiş, belirtti", "Geçmiş Zaman Fiil (V2/V3)", "💬"),
    ("expresses", "ifade eder, belirtir", "Geniş Zaman Fiil (3. Tekil)", "💬"),
    ("expressing", "ifade ederek, belirten", "Fiil (V-ing)", "💬"),
    ("expression", "ifade, anlatım, deyim", "İsim (Noun)", "💬"),
    ("expressions", "ifadeler, deyimler", "Çoğul İsim", "💬"),
    ("effective", "etkili, tesirli, verimli", "Sıfat (Adjective)", "🟩"),
    ("effectively", "etkili bir şekilde, başarıyla", "Durum Zarfı", "🟣"),
    ("effectiveness", "etkililik, verimlilik", "İsim (Noun)", "📈"),
    ("bridge", "köprü kurmak / köprü", "Fiil / İsim", "🌉"),
    ("bridges", "köprüler / köprü kurar", "Çoğul İsim / Fiil", "🌉"),
    ("describe", "tanımlamak, betimlemek, tarif etmek", "Fiil (Verb)", "🔵"),
    ("described", "tanımlanmış, tarif etti", "Geçmiş Zaman Fiil (V2/V3)", "🔵"),
    ("describes", "tanımlar, tarif eder", "Geniş Zaman Fiil (3. Tekil)", "🔵"),
    ("describing", "tanımlayarak, tarif eden", "Fiil (V-ing)", "🔵"),
    ("description", "tanım, betimleme, açıklama", "İsim (Noun)", "📝"),
    ("descriptions", "tanımlar, açıklamalar", "Çoğul İsim", "📝"),
    ("habit", "alışkanlık, huy", "İsim (Noun)", "🔄"),
    ("habits", "alışkanlıklar", "Çoğul İsim", "🔄"),
    ("ability", "yetenek, kabiliyet, beceri", "İsim (Noun)", "⚡"),
    ("abilities", "yetenekler, beceriler", "Çoğul İsim", "⚡"),
    ("obligation", "zorunluluk, yükümlülük", "İsim (Noun)", "⚖️"),
    ("obligations", "zorunluluklar", "Çoğul İsim", "⚖️"),
    ("prohibition", "yasak, yasaklama", "İsim (Noun)", "🚫"),
    ("prohibitions", "yasaklar", "Çoğul İsim", "🚫"),
    ("advice", "tavsiye, öğüt, nasihat", "İsim (Noun)", "💡"),
    ("advise", "tavsiye etmek, öğüt vermek", "Fiil (Verb)", "🔵"),
    ("rule", "kural, kaide / yönetmek", "İsim / Fiil", "📏"),
    ("rules", "kurallar / yönetir", "Çoğul İsim / Fiil", "📏"),
    ("exercise", "alıştırma, egzersiz / egzersiz yapmak", "İsim / Fiil", "🏋️"),
    ("exercises", "alıştırmalar, egzersizler", "Çoğul İsim", "🏋️"),
    ("practice", "pratik yapmak, alıştırma / uygulama", "Fiil / İsim", "🎯"),
    ("practicing", "pratik yaparak, çalışan", "Fiil (V-ing)", "🎯"),
    ("practices", "uygulamalar / pratik yapar", "Çoğul İsim / Fiil", "🎯"),
    ("sustainable", "sürdürülebilir, devam ettirilebilir", "Sıfat (Environment)", "🌱"),
    ("sustainability", "sürdürülebilirlik", "İsim (Environment)", "🌱"),
    ("renewable", "yenilenebilir (enerji)", "Sıfat (Energy)", "♻️"),
    ("energy", "enerji, güç", "İsim (Science)", "⚡"),
    ("solar", "güneş, güneş enerjili", "Sıfat (Energy)", "☀️"),
    ("power", "güç, enerji, iktidar / güç vermek", "İsim / Fiil", "⚡"),
    ("reduce", "azaltmak, eksiltmek, kısmak", "Fiil (Verb)", "📉"),
    ("reduced", "azaltılmış, azalttı", "Geçmiş Zaman Fiil (V2/V3)", "📉"),
    ("reduces", "azaltır, kısar", "Geniş Zaman Fiil (3. Tekil)", "📉"),
    ("reducing", "azaltarak, düşüren", "Fiil (V-ing)", "📉"),
    ("reduction", "azalma, indirim, eksiltme", "İsim (Noun)", "📉"),
    ("recycle", "geri dönüştürmek", "Fiil (Environment)", "♻️"),
    ("recycling", "geri dönüşüm", "İsim / Fiil (V-ing)", "♻️"),
    ("avoid", "kaçınmak, sakınmak, önlemek", "Fiil (Verb)", "🛡️"),
    ("plastic", "plastik / esnek", "İsim / Sıfat", "🛍️"),
    ("plastics", "plastikler", "Çoğul İsim", "🛍️"),
    ("immediate", "acil, derhal, dolaysız", "Sıfat (Time)", "⚡"),
    ("immediately", "hemen, derhal", "Zaman Zarfı", "🟣"),
    ("action", "eylem, hareket, aksiyon", "İsim (Noun)", "🎬"),
    ("actions", "eylemler, hareketler", "Çoğul İsim", "🎬"),
    ("generation", "nesil, kuşak / üretim", "İsim (Society)", "👥"),
    ("generations", "nesiller, kuşaklar", "Çoğul İsim", "👥"),
    ("greener", "daha yeşil, daha çevreci", "Karşılaştırma Sıfatı", "🌿"),
    ("green", "yeşil / çevreci", "Sıfat (Color/Eco)", "🌿"),
    ("planet", "gezegen, dünya", "İsim (Astronomy)", "🪐"),
    ("planets", "gezegenler", "Çoğul İsim", "🪐"),
    ("teenager", "genç, ergen (13-19 yaş)", "İsim (People)", "🧑"),
    ("teenagers", "gençler, ergenler", "Çoğul İsim", "🧑"),
    ("develop", "geliştirmek, geliştirmek, oluşmak", "Fiil (Verb)", "📈"),
    ("developing", "gelişen, geliştirmekte olan", "Fiil (V-ing)", "📈"),
    ("development", "gelişim, kalkınma, ilerleme", "İsim (Noun)", "📈"),
    ("protect", "korumak, muhafaza etmek", "Fiil (Verb)", "🛡️"),
    ("protection", "koruma, himaye", "İsim (Noun)", "🛡️"),
    ("solution", "çözüm, çare / çözelti", "İsim (Noun)", "💡"),
    ("solutions", "çözümler", "Çoğul İsim", "💡"),
    ("solve", "çözmek, halletmek", "Fiil (Verb)", "💡"),
    ("method", "yöntem, metot, usul", "İsim (Noun)", "📐"),
    ("methods", "yöntemler", "Çoğul İsim", "📐"),
    ("algorithm", "algoritma", "İsim (Technology)", "💻"),
    ("algorithms", "algoritmalar", "Çoğul İsim", "💻"),
    ("performance", "performans, başarım, temsil", "İsim (Noun)", "🏆"),
    ("provide", "sağlamak, temin etmek, sunmak", "Fiil (Verb)", "🤝"),
    ("provides", "sağlar, sunar", "Geniş Zaman Fiil (3. Tekil)", "🤝"),
    ("feedback", "geri bildirim, dönüt", "İsim (Education)", "💬"),
    ("concern", "endişe, kaygı / ilgilendirmek", "İsim / Fiil", "😟"),
    ("concerns", "endişeler, kaygılar / ilgilendirir", "Çoğul İsim / Fiil", "😟"),
    ("dilemma", "ikilem, çıkmaz, tereddüt", "İsim (Noun)", "🤔"),
    ("dilemmas", "ikilemler, çıkmazlar", "Çoğul İsim", "🤔"),
    ("society", "toplum, cemiyet", "İsim (Society)", "🏛️"),
    ("societies", "toplumlar", "Çoğul İsim", "🏛️"),
    ("acquire", "edinmek, kazanmak, elde etmek", "Fiil (Verb)", "🎓"),
    ("essential", "temel, zorunlu, hayati", "Sıfat (Adjective)", "⭐"),
    ("skill", "beceri, yetenek, ustalık", "İsim (Noun)", "🎯"),
    ("skills", "beceriler, yetenekler", "Çoğul İsim", "🎯"),
    ("critical", "eleştirel, kritik, çok önemli", "Sıfat (Adjective)", "🧠"),
    ("thinking", "düşünme, düşünce, fikir", "İsim / Fiil (V-ing)", "🧠"),
    ("admire", "hayran olmak, takdir etmek", "Fiil (Verb)", "👏"),
    ("innovator", "yenilikçi, mucit", "İsim (People)", "💡"),
    ("innovators", "yenilikçiler, mucitler", "Çoğul İsim", "💡"),
    ("accomplish", "başarmak, tamamlamak, üstesinden gelmek", "Fiil (Verb)", "🏆"),
    ("remarkable", "olağanüstü, dikkate değer, harika", "Sıfat (Adjective)", "✨"),
    ("unit", "ünite, birim, kısım", "İsim (School)", "📦"),
    ("units", "üniteler, birimler", "Çoğul İsim", "📦"),
    ("lesson", "ders, ibret", "İsim (School)", "🎓"),
    ("lessons", "dersler", "Çoğul İsim", "🎓"),
    ("homework", "ev ödevi", "İsim (School)", "✏️"),
    ("assignment", "ödev, görev, atama", "İsim (School)", "📋"),
    ("task", "görev, iş", "İsim (Noun)", "✅"),
    ("tasks", "görevler, işler", "Çoğul İsim", "✅"),
    ("goal", "hedef, amaç / gol", "İsim (Noun)", "🎯"),
    ("goals", "hedefler, amaçlar", "Çoğul İsim", "🎯"),
    ("dream", "rüya, hayal / hayal kurmak", "İsim / Fiil", "💭"),
    ("career", "kariyer, meslek", "İsim (Work)", "💼"),
    ("opportunity", "fırsat, imkan", "İsim (Noun)", "🚪"),
    ("opportunities", "fırsatlar", "Çoğul İsim", "🚪"),
    ("international", "uluslararası, beynelmilel", "Sıfat (Geography)", "🌐"),
    ("national", "ulusal, milli", "Sıfat (Geography)", "🇹🇷"),
    ("global", "küresel, dünya çapında", "Sıfat (Geography)", "🌍"),
    ("citizen", "vatandaş, yurttaş", "İsim (Society)", "👤"),
    ("citizens", "vatandaşlar", "Çoğul İsim", "👥"),
    ("culture", "kültür, ekin", "İsim (Society)", "🎭"),
    ("art", "sanat / hüner", "İsim (Art)", "🎨"),
    ("arts", "sanatlar", "Çoğul İsim", "🎨"),
    ("artist", "sanatçı, ressam", "İsim (People)", "🎨"),
    ("music", "müzik", "İsim (Art)", "🎵"),
    ("cinema", "sinema", "İsim (Media)", "🎬"),
    ("movie", "film, sinema filmi", "İsim (Media)", "🎬"),
    ("health", "sağlık, sıhhat", "İsim (Health)", "❤️"),
    ("healthy", "sağlıklı, sıhhatli", "Sıfat (Health)", "🥗"),
    ("nutrition", "beslenme, gıda", "İsim (Health)", "🍎"),
    ("mind", "zihin, akıl / önemsemek", "İsim / Fiil", "🧠"),
    ("body", "beden, vücut, gövde", "İsim (Biology)", "🧍"),
    ("nature", "doğa, tabiat / mizaç", "İsim (Nature)", "🌲"),
    ("natural", "doğal, tabii", "Sıfat (Nature)", "🌲"),
    ("climate", "iklim", "İsim (Geography)", "🌦️"),
    ("adventure", "macera, serüven", "İsim (Noun)", "🧭"),
    ("wonder", "harika, mucize / merak etmek", "İsim / Fiil", "✨"),
    ("identity", "kimlik, kişilik", "İsim (Society)", "🆔"),
    ("passion", "tutku, coşku, heves", "İsim (Emotion)", "🔥"),
    ("lifestyle", "yaşam tarzı, hayat biçimi", "İsim (Society)", "🛋️"),
    ("memory", "hafıza, anı, bellek", "İsim (Mind)", "🧠"),
    ("milestone", "dönüm noktası, kilometre taşı", "İsim (Noun)", "🚩"),
    ("experience", "deneyim, tecrübe / deneyimlemek", "İsim / Fiil", "⭐"),
    ("achievement", "başarı, kazanım", "İsim (Noun)", "🏆"),
    ("achievements", "başarılar", "Çoğul İsim", "🏆"),
    ("horizon", "ufuk", "İsim (Geography)", "🌅"),
    ("choice", "seçim, tercih", "İsim (Noun)", "👉"),
    ("right", "doğru, hak / sağ taraf", "İsim / Sıfat", "⚖️"),
    ("wrong", "yanlış, haksız", "Sıfat (Adjective)", "❌")
]

for item in MASTER_WORDS:
    add_word(item[0], item[1], item[2], item[3] if len(item)>3 else "📖")

# 5. Add common general words from Oxford 3000 / daily English
COMMON_WORDS = [
    ("people", "insanlar, halk", "Çoğul İsim", "👥"),
    ("history", "tarih, geçmiş", "İsim (Subject)", "📜"),
    ("world", "dünya, alem", "İsim (Geography)", "🌍"),
    ("information", "bilgi, enformasyon", "İsim (Noun)", "ℹ️"),
    ("map", "harita / haritasını çıkarmak", "İsim / Fiil", "🗺️"),
    ("family", "aile, hane", "İsim (Society)", "👨‍👩‍👧‍👦"),
    ("government", "hükümet, yönetim", "İsim (Politics)", "🏛️"),
    ("system", "sistem, düzenek", "İsim (Technology)", "⚙️"),
    ("computer", "bilgisayar", "İsim (Technology)", "💻"),
    ("theory", "teori, kuram", "İsim (Science)", "🔬"),
    ("law", "kanun, yasa, hukuk", "İsim (Law)", "⚖️"),
    ("bird", "kuş", "İsim (Animal)", "🐦"),
    ("literature", "edebiyat, yazın", "İsim (Art)", "📚"),
    ("problem", "problem, sorun", "İsim (Noun)", "⚠️"),
    ("software", "yazılım, program", "İsim (Technology)", "💾"),
    ("control", "kontrol etmek / denetim", "Fiil / İsim", "🎛️"),
    ("ability", "yetenek, kabiliyet", "İsim (Noun)", "⚡"),
    ("economics", "ekonomi, iktisat", "İsim (Subject)", "📊"),
    ("love", "sevmek / aşk, sevgi", "Fiil / İsim", "❤️"),
    ("internet", "internet, genel ağ", "İsim (Technology)", "🌐"),
    ("library", "kütüphane", "İsim (School)", "🏛️"),
    ("nature", "doğa, tabiat", "İsim (Nature)", "🌲"),
    ("fact", "gerçek, olgu", "İsim (Noun)", "📌"),
    ("product", "ürün, mahsul", "İsim (Business)", "📦"),
    ("idea", "fikir, düşünce", "İsim (Noun)", "💡"),
    ("temperature", "sıcaklık, derece", "İsim (Science)", "🌡️"),
    ("investment", "yatırım", "İsim (Finance)", "💰"),
    ("area", "alan, bölge, saha", "İsim (Noun)", "📐"),
    ("society", "toplum, cemiyet", "İsim (Society)", "🏛️"),
    ("activity", "aktivite, etkinlik", "İsim (Noun)", "🏃"),
    ("story", "hikaye, öykü", "İsim (Literature)", "📖"),
    ("industry", "endüstri, sanayi", "İsim (Business)", "🏭"),
    ("media", "medya, basın", "İsim (Media)", "📺"),
    ("thing", "şey, nesne", "İsim (Noun)", "📦"),
    ("oven", "fırın", "İsim (Home)", "🍳"),
    ("community", "topluluk, camia", "İsim (Society)", "👥"),
    ("definition", "tanım, tarif", "İsim (Language)", "📝"),
    ("safety", "güvenlik, emniyet", "İsim (Noun)", "🛡️"),
    ("quality", "kalite, nitelik", "İsim (Noun)", "✨"),
    ("development", "gelişim, kalkınma", "İsim (Noun)", "📈"),
    ("language", "dil, lisan", "İsim (Language)", "🗣️"),
    ("management", "yönetim, idare", "İsim (Business)", "👔"),
    ("player", "oyuncu, sporcu", "İsim (Sports)", "⚽"),
    ("variety", "çeşitlilik, tür", "İsim (Noun)", "🎨"),
    ("video", "video, görüntü", "İsim (Media)", "📹"),
    ("week", "hafta", "İsim (Time)", "📅"),
    ("security", "güvenlik, asayiş", "İsim (Security)", "🔒"),
    ("country", "ülke, memleket", "İsim (Geography)", "🇹🇷"),
    ("exam", "sınav, imtihan", "İsim (School)", "📝"),
    ("movie", "film, sinema filmi", "İsim (Media)", "🎬"),
    ("organization", "organizasyon, kuruluş", "İsim (Business)", "🏢"),
    ("equipment", "ekipman, teçhizat", "İsim (Sports/Tech)", "🎒"),
    ("physics", "fizik (bilimi)", "İsim (School)", "⚛️"),
    ("chemistry", "kimya", "İsim (School)", "🧪"),
    ("biology", "biyoloji", "İsim (School)", "🧬"),
    ("mathematics", "matematik", "İsim (School)", "📐"),
    ("math", "matematik", "İsim (School)", "📐"),
    ("science", "bilim, fen", "İsim (Science)", "🔬"),
    ("scientist", "bilim insanı", "İsim (People)", "🔬"),
    ("student", "öğrenci", "İsim (School)", "🎒"),
    ("teacher", "öğretmen", "İsim (School)", "👨‍🏫"),
    ("school", "okul", "İsim (School)", "🏫"),
    ("university", "üniversite", "İsim (School)", "🏛️"),
    ("classroom", "sınıf, derslik", "İsim (School)", "🚪"),
    ("book", "kitap / rezervasyon yapmak", "İsim / Fiil", "📚"),
    ("notebook", "defter", "İsim (School)", "📓"),
    ("page", "sayfa", "İsim (Book)", "📄"),
    ("chapter", "bölüm, kısım", "İsim (Book)", "📖"),
    ("question", "soru / sorgulamak", "İsim / Fiil", "❓"),
    ("answer", "cevap, yanıt / yanıtlamak", "İsim / Fiil", "💡"),
    ("test", "test, deneme / test etmek", "İsim / Fiil", "📋"),
    ("grade", "not, derece, sınıf seviyesi", "İsim (School)", "🎯"),
    ("score", "puan, skor / gol atmak", "İsim / Fiil", "🏆"),
    ("point", "puan, nokta / işaret etmek", "İsim / Fiil", "📍"),
    ("team", "takım, ekip", "İsim (Sports)", "🤝"),
    ("match", "maç, karşılaşma / eşleştirmek", "İsim / Fiil", "⚽"),
    ("game", "oyun, maç", "İsim (Sports)", "🎮"),
    ("sport", "spor", "İsim (Sports)", "🏅"),
    ("training", "antrenman, eğitim", "İsim (Sports)", "🏋️"),
    ("coach", "antrenör, koç", "İsim (Sports)", "🧢"),
    ("stadium", "stadyum", "İsim (Sports)", "🏟️"),
    ("court", "kort, saha / mahkeme", "İsim (Sports/Law)", "🎾"),
    ("pitch", "futbol sahası / fırlatmak", "İsim (Sports)", "⚽"),
    ("ball", "top / balo", "İsim (Sports)", "⚽"),
    ("speed", "hız, sürat", "İsim (Physics)", "⚡"),
    ("fast", "hızlı / oruç tutmak", "Sıfat / Fiil", "⚡"),
    ("slow", "yavaş / yavaşlatmak", "Sıfat / Fiil", "🐢"),
    ("strong", "güçlü, kuvvetli", "Sıfat (Adjective)", "💪"),
    ("weak", "zayıf, güçsüz", "Sıfat (Adjective)", "🥀"),
    ("high", "yüksek / zirve", "Sıfat (Adjective)", "🏔️"),
    ("low", "düşük, alçak", "Sıfat (Adjective)", "📉"),
    ("easy", "kolay, zahmetsiz", "Sıfat (Adjective)", "✨"),
    ("hard", "zor / sert, sıkı", "Sıfat / Zarf", "💎"),
    ("difficult", "zor, çetin, güç", "Sıfat (Adjective)", "🧗"),
    ("important", "önemli, mühim", "Sıfat (Adjective)", "⭐"),
    ("interesting", "ilginç, ilgi çekici", "Sıfat (Adjective)", "🧐"),
    ("exciting", "heyecan verici", "Sıfat (Adjective)", "🎉"),
    ("boring", "sıkıcı", "Sıfat (Adjective)", "🥱"),
    ("good", "iyi, güzel", "Sıfat (Adjective)", "👍"),
    ("better", "daha iyi", "Karşılaştırma Sıfatı", "🌟"),
    ("best", "en iyi", "Üstünlük Sıfatı", "👑"),
    ("bad", "kötü, fena", "Sıfat (Adjective)", "👎"),
    ("worse", "daha kötü", "Karşılaştırma Sıfatı", "📉"),
    ("worst", "en kötü", "Üstünlük Sıfatı", "💔"),
    ("big", "büyük, iri", "Sıfat (Adjective)", "🐘"),
    ("bigger", "daha büyük", "Karşılaştırma Sıfatı", "🐘"),
    ("biggest", "en büyük", "Üstünlük Sıfatı", "🐘"),
    ("small", "küçük, ufak", "Sıfat (Adjective)", "🐭"),
    ("smaller", "daha küçük", "Karşılaştırma Sıfatı", "🐭"),
    ("smallest", "en küçük", "Üstünlük Sıfatı", "🐭"),
    ("long", "uzun / özlemek", "Sıfat / Fiil", "📏"),
    ("short", "kısa, özet", "Sıfat (Adjective)", "📏"),
    ("new", "yeni", "Sıfat (Adjective)", "✨"),
    ("old", "eski, yaşlı", "Sıfat (Adjective)", "🏛️"),
    ("young", "genç", "Sıfat (Adjective)", "🌱"),
    ("great", "harika, mükemmel, ulu", "Sıfat (Adjective)", "🌟"),
    ("fine", "iyi, güzel / para cezası", "Sıfat / İsim", "👌"),
    ("safe", "güvenli / kasa", "Sıfat / İsim", "🛡️"),
    ("clean", "temiz / temizlemek", "Sıfat / Fiil", "🧼"),
    ("quiet", "sessiz, sakin", "Sıfat (Adjective)", "🤫"),
    ("loud", "yüksek sesli, gürültülü", "Sıfat (Adjective)", "📢"),
    ("happy", "mutlu, sevinçli", "Sıfat (Adjective)", "😊"),
    ("sad", "üzgün, kederli", "Sıfat (Adjective)", "😢"),
    ("tired", "yorgun, bitkin", "Sıfat (Adjective)", "😴"),
    ("busy", "meşgul, yoğun", "Sıfat (Adjective)", "💼"),
    ("ready", "hazır / hazırlamak", "Sıfat / Fiil", "✅"),
    ("sure", "emin, kesin", "Sıfat / Zarf", "💯"),
    ("true", "doğru, gerçek, hakiki", "Sıfat (Adjective)", "✅"),
    ("false", "yanlış, sahte", "Sıfat (Adjective)", "❌"),
    ("full", "dolu, tam / doymuş", "Sıfat (Adjective)", "🌕"),
    ("empty", "boş / boşaltmak", "Sıfat / Fiil", "📭"),
    ("dark", "karanlık, koyu", "Sıfat / İsim", "🌑"),
    ("light", "ışık / hafif / aydınlık", "İsim / Sıfat", "💡"),
    ("clear", "açık, net / temizlemek", "Sıfat / Fiil", "🔍"),
    ("smart", "akıllı, zeki, şık", "Sıfat (Adjective)", "🧠"),
    ("clever", "zeki, kurnaz", "Sıfat (Adjective)", "💡"),
    ("brave", "cesur, yiğit", "Sıfat (Adjective)", "🦁"),
    ("polite", "kibar, nazik", "Sıfat (Adjective)", "🎩"),
    ("rude", "kaba, nezaketsiz", "Sıfat (Adjective)", "😠"),
    ("kind", "nazik, kibar / tür, çeşit", "Sıfat / İsim", "🤝"),
    ("honest", "dürüst, doğrucu", "Sıfat (Adjective)", "⚖️"),
    ("famous", "ünlü, meşhur", "Sıfat (Adjective)", "🌟"),
    ("popular", "popüler, sevilen", "Sıfat (Adjective)", "🔥"),
    ("rich", "zengin, varlıklı", "Sıfat (Adjective)", "💎"),
    ("poor", "fakir, yoksul / zavallı", "Sıfat (Adjective)", "🤲"),
    ("cheap", "ucuz", "Sıfat (Adjective)", "🏷️"),
    ("expensive", "pahalı, masraflı", "Sıfat (Adjective)", "💎"),
    ("heavy", "ağır, yoğun", "Sıfat (Adjective)", "🏋️"),
    ("fresh", "taze, ferah", "Sıfat (Adjective)", "🍃"),
    ("daily", "günlük / her gün", "Sıfat / Zarf", "📅"),
    ("weekly", "haftalık", "Sıfat / Zarf", "📅"),
    ("monthly", "aylık", "Sıfat / Zarf", "📅"),
    ("yearly", "yıllık", "Sıfat / Zarf", "📅"),
    ("annual", "yıllık, senelik", "Sıfat (Adjective)", "📅"),
    ("modern", "modern, çağdaş", "Sıfat (Adjective)", "🚀"),
    ("ancient", "antik, çok eski", "Sıfat (Adjective)", "🏛️"),
    ("future", "gelecek", "İsim / Sıfat", "🚀"),
    ("now", "şimdi, şu an", "Zaman Zarfı", "⏰"),
    ("then", "o zaman / daha sonra, ardından", "Zaman Zarfı", "➡️"),
    ("today", "bugün", "Zaman Zarfı / İsim", "📅"),
    ("yesterday", "dün", "Zaman Zarfı / İsim", "📅"),
    ("tomorrow", "yarın", "Zaman Zarfı / İsim", "📅"),
    ("tonight", "bu gece", "Zaman Zarfı / İsim", "🌙"),
    ("morning", "sabah", "İsim (Time)", "🌅"),
    ("afternoon", "öğleden sonra", "İsim (Time)", "☀️"),
    ("evening", "akşam", "İsim (Time)", "🌆"),
    ("night", "gece", "İsim (Time)", "🌙"),
    ("time", "zaman, vakit / defa, kez", "İsim (Time)", "⏰"),
    ("times", "zamanlar / defalarca", "Çoğul İsim", "⏰"),
    ("hour", "saat (süre)", "İsim (Time)", "⏳"),
    ("minute", "dakika / küçücük", "İsim / Sıfat", "⏱️"),
    ("second", "saniye / ikinci", "İsim / Sıfat", "🥈"),
    ("day", "gün", "İsim (Time)", "☀️"),
    ("days", "günler", "Çoğul İsim", "☀️"),
    ("month", "ay (takvim)", "İsim (Time)", "📅"),
    ("year", "yıl, sene", "İsim (Time)", "📅"),
    ("years", "yıllar", "Çoğul İsim", "📅"),
    ("century", "yüzyıl, asır", "İsim (Time)", "📜"),
    ("summer", "yaz (mevsim)", "İsim (Season)", "🏖️"),
    ("winter", "kış (mevsim)", "İsim (Season)", "❄️"),
    ("spring", "ilkbahar / yay / sıçramak", "İsim / Fiil", "🌸"),
    ("autumn", "sonbahar, güz", "İsim (Season)", "🍂"),
    ("fall", "sonbahar / düşmek", "İsim / Fiil", "🍂"),
    ("weather", "hava durumu", "İsim (Nature)", "⛅"),
    ("sun", "güneş", "İsim (Nature)", "☀️"),
    ("rain", "yağmur / yağmur yağmak", "İsim / Fiil", "🌧️"),
    ("snow", "kar / kar yağmak", "İsim / Fiil", "❄️"),
    ("wind", "rüzgar", "İsim (Nature)", "💨"),
    ("cloud", "bulut", "İsim (Nature)", "☁️"),
    ("sky", "gökyüzü, sema", "İsim (Nature)", "🌌"),
    ("sea", "deniz", "İsim (Geography)", "🌊"),
    ("ocean", "okyanus", "İsim (Geography)", "🌊"),
    ("river", "nehir, ırmak", "İsim (Geography)", "🏞️"),
    ("lake", "göl", "İsim (Geography)", "🏞️"),
    ("mountain", "dağ", "İsim (Geography)", "🏔️"),
    ("forest", "orman", "İsim (Geography)", "🌲"),
    ("tree", "ağaç", "İsim (Nature)", "🌳"),
    ("flower", "çiçek", "İsim (Nature)", "🌸"),
    ("animal", "hayvan", "İsim (Biology)", "🐾"),
    ("city", "şehir, kent", "İsim (Geography)", "🏙️"),
    ("town", "kasaba, ilçe", "İsim (Geography)", "🏘️"),
    ("village", "köy", "İsim (Geography)", "🏡"),
    ("house", "ev, konut", "İsim (Home)", "🏠"),
    ("home", "ev, yuva", "İsim (Home)", "🏡"),
    ("room", "oda / yer, alan", "İsim (Home)", "🚪"),
    ("door", "kapı", "İsim (Home)", "🚪"),
    ("window", "pencere", "İsim (Home)", "🪟"),
    ("floor", "zemin, yer / kat", "İsim (Home)", "🏢"),
    ("wall", "duvar", "İsim (Home)", "🧱"),
    ("table", "masa / tablo, çizelge", "İsim (Home)", "🪑"),
    ("chair", "sandalye / başkanlık etmek", "İsim / Fiil", "🪑"),
    ("bed", "yatak", "İsim (Home)", "🛏️"),
    ("car", "araba, otomobil", "İsim (Vehicle)", "🚗"),
    ("bus", "otobüs", "İsim (Vehicle)", "🚌"),
    ("train", "tren / eğitmek, antrenman yapmak", "İsim / Fiil", "🚆"),
    ("plane", "uçak / düzlem", "İsim (Vehicle)", "✈️"),
    ("airport", "havaalanı, havalimanı", "İsim (Travel)", "🛫"),
    ("station", "istasyon, gar", "İsim (Travel)", "🚉"),
    ("ticket", "bilet / ceza yazmak", "İsim / Fiil", "🎫"),
    ("passport", "pasaport", "İsim (Travel)", "🛂"),
    ("hotel", "otel", "İsim (Travel)", "🏨"),
    ("restaurant", "restoran, lokanta", "İsim (Food)", "🍽️"),
    ("cafe", "kafe", "İsim (Food)", "☕"),
    ("food", "yiyecek, gıda, besin", "İsim (Food)", "🍲"),
    ("water", "su / sulamak", "İsim / Fiil", "💧"),
    ("bread", "ekmek", "İsim (Food)", "🍞"),
    ("cheese", "peynir", "İsim (Food)", "🧀"),
    ("meat", "et", "İsim (Food)", "🥩"),
    ("fruit", "meyve", "İsim (Food)", "🍎"),
    ("vegetable", "sebze", "İsim (Food)", "🥦"),
    ("tea", "çay", "İsim (Drink)", "🍵"),
    ("coffee", "kahve", "İsim (Drink)", "☕"),
    ("milk", "süt / sağmak", "İsim / Fiil", "🥛"),
    ("juice", "meyve suyu", "İsim (Drink)", "🧃"),
    ("money", "para, nakit", "İsim (Economy)", "💵"),
    ("price", "fiyat, bedel", "İsim (Economy)", "🏷️"),
    ("market", "pazar, piyasa / pazarlamak", "İsim / Fiil", "🛒"),
    ("shop", "mağaza, dükkan / alışveriş yapmak", "İsim / Fiil", "🛍️"),
    ("store", "mağaza, depo / depolamak", "İsim / Fiil", "🏬"),
    ("bank", "banka / nehir kenarı", "İsim (Economy)", "🏦"),
    ("card", "kart (kredi/kimlik)", "İsim (Item)", "💳"),
    ("friend", "arkadaş, dost", "İsim (People)", "🤝"),
    ("friends", "arkadaşlar, dostlar", "Çoğul İsim", "🤝"),
    ("parent", "ebeveyn (anne veya baba)", "İsim (Family)", "👨‍👩‍👦"),
    ("parents", "ebeveynler (anne ve baba)", "Çoğul İsim", "👨‍👩‍👦"),
    ("mother", "anne", "İsim (Family)", "👩"),
    ("father", "baba", "İsim (Family)", "👨"),
    ("sister", "kız kardeş, abla", "İsim (Family)", "👧"),
    ("brother", "erkek kardeş, abi", "İsim (Family)", "👦"),
    ("son", "erkek evlat, oğul", "İsim (Family)", "👦"),
    ("daughter", "kız evlat", "İsim (Family)", "👧"),
    ("child", "çocuk", "Tekil İsim", "🧒"),
    ("children", "çocuklar", "Çoğul İsim", "🧒"),
    ("boy", "erkek çocuk", "İsim (People)", "👦"),
    ("girl", "kız çocuk", "İsim (People)", "👧"),
    ("man", "adam, erkek", "Tekil İsim", "👨"),
    ("men", "adamlar, erkekler", "Çoğul İsim", "👨"),
    ("woman", "kadın", "Tekil İsim", "👩"),
    ("women", "kadınlar", "Çoğul İsim", "👩"),
    ("person", "kişi, şahıs, insan", "Tekil İsim", "👤"),
    ("hand", "el / uzatmak, vermek", "İsim / Fiil", "✋"),
    ("hands", "eller", "Çoğul İsim", "✋"),
    ("eye", "göz / bakmak", "İsim / Fiil", "👁️"),
    ("eyes", "gözler", "Çoğul İsim", "👁️"),
    ("ear", "kulak", "İsim (Body)", "👂"),
    ("ears", "kulaklar", "Çoğul İsim", "👂"),
    ("head", "baş, kafa / yönetmek", "İsim / Fiil", "🗣️"),
    ("face", "yüz, çehre / yüzleşmek", "İsim / Fiil", "😊"),
    ("leg", "bacak", "İsim (Body)", "🦵"),
    ("legs", "bacaklar", "Çoğul İsim", "🦵"),
    ("foot", "ayak / fit (ölçü)", "Tekil İsim", "🦶"),
    ("feet", "ayaklar", "Çoğul İsim", "🦶"),
    ("arm", "kol / silahlandırmak", "İsim / Fiil", "💪"),
    ("arms", "kollar / silahlar", "Çoğul İsim", "💪"),
    ("heart", "kalp, yürek", "İsim (Body)", "❤️"),
    ("blood", "kan", "İsim (Body)", "🩸"),
    ("doctor", "doktor, hekim", "İsim (Job)", "👨‍⚕️"),
    ("hospital", "hastane", "İsim (Health)", "🏥"),
    ("medicine", "ilaç / tıp bilimi", "İsim (Health)", "💊"),
    ("pain", "ağrı, sızı, acı", "İsim (Health)", "🩹"),
    ("phone", "telefon / telefon etmek", "İsim / Fiil", "📱"),
    ("screen", "ekran / taramak, incelemek", "İsim / Fiil", "🖥️"),
    ("camera", "kamera, fotoğraf makinesi", "İsim (Tech)", "📷"),
    ("app", "uygulama (yazılım)", "İsim (Tech)", "📱"),
    ("application", "uygulama / başvuru", "İsim (Tech)", "📱"),
    ("device", "cihaz, alet, aygıt", "İsim (Tech)", "📟"),
    ("devices", "cihazlar, aygıtlar", "Çoğul İsim", "📟"),
    ("message", "mesaj, ileti", "İsim (Tech)", "✉️"),
    ("email", "e-posta / e-posta göndermek", "İsim / Fiil", "📧"),
    ("online", "çevrimiçi, internete bağlı", "Sıfat / Zarf", "🟢"),
    ("offline", "çevrimdışı, internetsiz", "Sıfat / Zarf", "⚪"),
    ("website", "web sitesi, internet sitesi", "İsim (Tech)", "🌐"),
    ("link", "bağlantı / bağlamak", "İsim / Fiil", "🔗"),
    ("click", "tıklamak / tık sesi", "Fiil / İsim", "🖱️"),
    ("file", "dosya / dosyalamak", "İsim / Fiil", "📁"),
    ("folder", "klasör", "İsim (Tech)", "📂"),
    ("image", "resim, görüntü, imaj", "İsim (Tech)", "🖼️"),
    ("photo", "fotoğraf", "İsim (Media)", "📸"),
    ("scan", "taramak / tarama", "Fiil / İsim", "📸"),
    ("scanned", "taranmış / taradı", "Sıfat / Fiil (V2/V3)", "📸"),
    ("scanner", "tarayıcı", "İsim (Tech)", "📠"),
    ("ocr", "optik karakter tanıma", "İsim (Tech)", "🔍"),
    ("text", "metin, yazı / mesaj atmak", "İsim / Fiil", "📄"),
    ("word", "kelime, sözcük", "İsim (Language)", "🔤"),
    ("words", "kelimeler, sözcükler", "Çoğul İsim", "🔤"),
    ("letter", "harf / mektup", "İsim (Language)", "✉️"),
    ("letters", "harfler / mektuplar", "Çoğul İsim", "✉️"),
    
    # Academic & Reading Comprehension Words
    ("benefit", "fayda, yarar / faydalanmak", "İsim / Fiil", "💡"),
    ("benefits", "faydalar, yararlar, avantajlar", "Çoğul İsim", "💡"),
    ("master", "ustalaşmak, hakim olmak / usta", "Fiil / İsim", "🏆"),
    ("mastering", "ustalaşma, tam hakimiyet kazanma", "İsim (Gerund)", "🏆"),
    ("mastery", "ustalık, tam hakimiyet, uzmanlık", "İsim (Academic)", "🏆"),
    ("gain", "kazanmak, elde etmek, artmak", "Fiil (Academic)", "📈"),
    ("gaining", "kazanma, elde etme", "İsim / Fiil (-ing)", "📈"),
    ("control", "kontrol, denetim, hakimiyet / kontrol etmek", "İsim / Fiil", "🎛️"),
    ("allow", "izin vermek, olanak tanımak, sağlamak", "Fiil (Academic)", "✅"),
    ("allows", "olanak sağlar, izin verir", "Fiil (3. Tekil)", "✅"),
    ("learner", "öğrenen, öğrenci", "İsim (Education)", "🧑‍🎓"),
    ("learners", "öğrenenler, öğrenciler", "Çoğul İsim", "🧑‍🎓"),
    ("communicate", "iletişim kurmak, haberleşmek", "Fiil (Language)", "💬"),
    ("communication", "iletişim, haberleşme", "İsim (Academic)", "💬"),
    ("effectively", "etkili bir şekilde, başarıyla", "Durum Zarfı", "🟣"),
    ("effective", "etkili, başarılı", "Sıfat (Academic)", "🟡"),
    ("instruction", "yönerge, talimat, öğretim", "İsim (Education)", "📋"),
    ("instructions", "yönergeler, talimatlar, dersler", "Çoğul İsim", "📋"),
    ("participate", "katılmak, iştirak etmek, yer almak", "Fiil (Academic)", "🤝"),
    ("participation", "katılım, iştirak", "İsim (Academic)", "🤝"),
    ("interaction", "etkileşim, karşılıklı iletişim", "İsim (Social)", "👥"),
    ("interactions", "etkileşimler, sosyal temaslar", "Çoğul İsim", "👥"),
    ("ease", "kolaylık, rahatlık / hafifletmek", "İsim / Fiil", "🧘"),
    ("foundation", "temel, altyapı, kuruluş, vakıf", "İsim (Academic)", "🏛️"),
    ("prepare", "hazırlamak, hazırlanmak", "Fiil (Academic)", "📝"),
    ("prepares", "hazırlar, olanak sağlar", "Fiil (3. Tekil)", "📝"),
    ("prapares", "hazırlar (prepares yazım düzeltmesi)", "Fiil (3. Tekil)", "📝"),
    ("advanced", "ileri düzey, gelişmiş, ileri seviye", "Sıfat (Level)", "🚀"),
    ("study", "çalışma, öğrenim, araştırma / ders çalışmak", "İsim / Fiil", "📚"),
    ("studies", "çalışmalar, eğitim, araştırmalar", "Çoğul İsim", "📚"),
    ("increase", "artmak, artırmak, yükselmek / artış", "Fiil / İsim", "📈"),
    ("increasing", "artan, artırma, yükselen", "Sıfat / Fiil (-ing)", "📈"),
    ("motivation", "motivasyon, istek, güdülenme", "İsim (Psychology)", "🔥"),
    ("motwation", "motivasyon (motivation yazım düzeltmesi)", "İsim", "🔥"),
    ("proficient", "yetkin, becerikli, uzman", "Sıfat (Language)", "⭐"),
    ("proficiency", "yetkinlik, yeterlilik, dil becerisi", "İsim (Language)", "⭐"),
    ("conclusion", "sonuç, netice, son bölüm, özet", "İsim (Academic)", "🏁"),
    ("reference", "referans, kaynak, başvuru, kaynakça", "İsim (Academic)", "📑"),
    ("document", "belge, doküman / belgelemek", "İsim / Fiil", "📄"),
    ("intermediate", "orta seviye", "Sıfat (Level)", "⚖️"),
    ("pre-intermediate", "orta seviye öncesi (A2+)", "Sıfat (Level)", "⚖️"),
    ("grammar", "dilbilgisi, gramer kuralları", "İsim (Language)", "📐"),
    ("social", "sosyal, toplumsal, arkadaş canlısı", "Sıfat (Social)", "👥"),
    ("greater", "daha büyük, daha fazla, daha üstün", "Karşılaştırma Sıfatı", "⭐"),
    ("great", "harika, büyük, muhteşem", "Sıfat", "⭐"),
    ("over", "üzerinde, boyunca / bitmiş", "Edat / Zarf", "⬆️"),
    ("with", "ile, beraberinde, sahip olarak", "Edat", "🔗"),
    ("also", "ayrıca, da/de, aynı zamanda", "Bağlaç / Zarf", "➕"),
    ("this", "bu", "İşaret Sıfatı / Zamiri", "👉"),
    ("that", "şu, o", "İşaret Sıfatı / Zamiri", "👉"),
    ("more", "daha fazla, daha çok", "Miktar Belirteci / Zarf", "📊"),
    ("most", "en çok, çoğu", "Miktar Belirteci", "📊"),
    ("page", "sayfa", "İsim", "📄"),
    ("chapter", "bölüm, ünite", "İsim (Book)", "📖"),
    ("section", "kısım, bölüm, kesit", "İsim (Book)", "📑"),
    ("exercise", "alıştırma, egzersiz / spor yapmak", "İsim / Fiil", "🏋️"),
    ("exercises", "alıştırmalar, egzersizler", "Çoğul İsim", "🏋️"),
    ("workbook", "çalışma kitabı", "İsim (School)", "📘"),
    ("coursebook", "ders kitabı", "İsim (School)", "📕"),
    ("textbook", "ders kitabı", "İsim (School)", "📗"),
    ("homework", "ev ödevi", "İsim (School)", "📝"),
    ("assignment", "ödev, görev", "İsim (School)", "📋"),
    ("exam", "sınav, yazılı", "İsim (School)", "🎯"),
    ("quiz", "kısa sınav, test", "İsim (School)", "❓"),
    ("question", "soru / sorgulamak", "İsim / Fiil", "❓"),
    ("answer", "cevap, yanıt / yanıtlamak", "İsim / Fiil", "💡"),
    ("rule", "kural / yönetmek", "İsim / Fiil", "📏"),
    ("rules", "kurallar", "Çoğul İsim", "📏"),
    ("formula", "formül, kural kalıbı", "İsim", "🧪"),
    ("example", "örnek, misal", "İsim", "🔍"),
    ("examples", "örnekler", "Çoğul İsim", "🔍"),
    ("sentence", "cümle / hüküm vermek", "İsim / Fiil", "💬"),
    ("sentences", "cümleler", "Çoğul İsim", "💬"),
    ("structure", "yapı, gramer düzeni", "İsim", "🏗️"),
    ("structures", "yapılar", "Çoğul İsim", "🏗️"),
    ("meaning", "anlam, mana", "İsim (Language)", "💡"),
    ("meanings", "anlamlar", "Çoğul İsim", "💡"),
    ("definition", "tanım, açıklama", "İsim (Language)", "📖"),
    ("vocabulary", "kelime hazinesi, sözcükler", "İsim (Language)", "🔤"),
    ("flashcard", "çift taraflı ezber kartı", "İsim (Learning)", "🃏"),
    ("audio", "sesli telaffuz, ses", "İsim (Tech)", "🔊"),
    ("pronunciation", "telaffuz, sesletim", "İsim (Language)", "🗣️"),
    ("listen", "dinlemek", "Fiil", "🎧"),
    ("speak", "konuşmak", "Fiil", "🗣️"),
    ("read", "okumak", "Fiil", "📖"),
    ("write", "yazmak", "Fiil", "✍️"),
    ("reading", "okuma parçası / okuma", "İsim (Skill)", "📖"),
    ("writing", "yazma, kompozisyon", "İsim (Skill)", "✍️"),
    ("listening", "dinleme etkinliği", "İsim (Skill)", "🎧"),
    ("speaking", "konuşma becerisi", "İsim (Skill)", "🗣️")
]

for item in COMMON_WORDS:
    add_word(item[0], item[1], item[2], item[3] if len(item)>3 else "📖")

# 6. Automatic Derivations (Adverbs -ly, Plurals -s/-es, Regular verbs)
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
