import os
import glob
import re
import json
from pypdf import PdfReader

PDF_DIR = "/Users/alionurcerrah/Desktop/Melis:ELA"
OUT_JSON = "/Users/alionurcerrah/Desktop/İngilizce Kelime/data/curriculum.json"
OUT_JS = "/Users/alionurcerrah/Desktop/İngilizce Kelime/js/app_data.js"

# Common irregular verb database to enrich forms
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
    "talk": ("talk / talks", "talked", "talked"),
    "tell": ("tell / tells", "told", "told"),
    "think": ("think / thinks", "thought", "thought"),
    "know": ("know / knows", "knew", "known"),
    "understand": ("understand / understands", "understood", "understood"),
    "believe": ("believe / believes", "believed", "believed"),
    "want": ("want / wants", "wanted", "wanted"),
    "need": ("need / needs", "needed", "needed"),
    "like": ("like / likes", "liked", "liked"),
    "love": ("love / loves", "loved", "loved"),
    "prefer": ("prefer / prefers", "preferred", "preferred"),
    "hope": ("hope / hopes", "hoped", "hoped"),
    "wake up": ("wake up / wakes up", "woke up", "woken up"),
    "sleep": ("sleep / sleeps", "slept", "slept"),
    "eat": ("eat / eats", "ate", "eaten"),
    "drink": ("drink / drinks", "drank", "drunk"),
    "buy": ("buy / buys", "bought", "bought"),
    "sell": ("sell / sells", "sold", "sold"),
    "pay": ("pay / pays", "paid", "paid"),
    "work": ("work / works", "worked", "worked"),
    "study": ("study / studies", "studied", "studied"),
    "learn": ("learn / learns", "learned / learnt", "learned / learnt"),
    "start": ("start / starts", "started", "started"),
    "finish": ("finish / finishes", "finished", "finished"),
    "plan": ("plan / plans", "planned", "planned"),
    "decide": ("decide / decides", "decided", "decided"),
    "change": ("change / changes", "changed", "changed"),
    "become": ("become / becomes", "became", "become"),
    "happen": ("happen / happens", "happened", "happened"),
    "create": ("create / creates", "created", "created"),
    "build": ("build / builds", "built", "built"),
    "break": ("break / breaks", "broke", "broken"),
    "lose": ("lose / loses", "lost", "lost"),
    "keep": ("keep / keeps", "kept", "kept"),
    "put": ("put / puts", "put", "put"),
    "carry": ("carry / carries", "carried", "carried"),
    "wear": ("wear / wears", "wore", "worn"),
    "wash": ("wash / washes", "washed", "washed"),
    "clean": ("clean / cleans", "cleaned", "cleaned"),
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
    "play": ("play / plays", "played", "played"),
    "win": ("win / wins", "won", "won"),
    "remember": ("remember / remembers", "remembered", "remembered"),
    "forget": ("forget / forgets", "forgot", "forgotten"),
    "choose": ("choose / chooses", "chose", "chosen"),
    "wait": ("wait / waits", "waited", "waited"),
    "show": ("show / shows", "showed", "shown"),
    "solve": ("solve / solves", "solved", "solved"),
    "develop": ("develop / develops", "developed", "developed"),
    "produce": ("produce / produces", "produced", "produced"),
    "provide": ("provide / provides", "provided", "provided"),
    "include": ("include / includes", "included", "included"),
    "contain": ("contain / contains", "contained", "contained"),
    "depend on": ("depend / depends on", "depended on", "depended on"),
    "belong to": ("belong / belongs to", "belonged to", "belonged to"),
    "encourage": ("encourage / encourages", "encouraged", "encouraged"),
    "support": ("support / supports", "supported", "supported"),
    "protect": ("protect / protects", "protected", "protected"),
    "prevent": ("prevent / prevents", "prevented", "prevented"),
    "avoid": ("avoid / avoids", "avoided", "avoided"),
    "discover": ("discover / discovers", "discovered", "discovered"),
    "save": ("save / saves", "saved", "saved"),
    "complain": ("complain / complains", "complained", "complained"),
    "realize": ("realize / realizes", "realized", "realized"),
    "affect": ("affect / affects", "affected", "affected"),
    "improve": ("improve / improves", "improved", "improved"),
    "allow": ("allow / allows", "allowed", "allowed"),
    "require": ("require / requires", "required", "required")
}

def clean_text(text):
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    text = text.replace('“', '"').replace('”', '"').replace('’', "'").replace('‘', "'")
    return text.strip()

def get_forms(verb_str):
    v_clean = verb_str.lower().strip()
    if v_clean in IRREGULAR_FORMS:
        return IRREGULAR_FORMS[v_clean]
    # default regular
    v_base = v_clean
    if v_base.endswith('e'):
        v_ed = v_base + 'd'
    elif v_base.endswith('y') and len(v_base) > 2 and v_base[-2] not in 'aeiou':
        v_ed = v_base[:-1] + 'ied'
    else:
        v_ed = v_base + 'ed'
    return (f"{v_base} / {v_base}s", v_ed, v_ed)

def parse_all():
    data = {
        "verbs": [],
        "grammar_modules": [],
        "story_chapters": [],
        "youtube_videos": [],
        "advanced_grammar_notes": [],
        "svompt_rules": [
            {
                "code": "S",
                "name": "Subject (Özne)",
                "question": "Kim? (Who?)",
                "color": "#f59e0b",
                "description": "Cümlede eylemi gerçekleştiren kişi veya varlık. İngilizcede daima en başta yer alır.",
                "examples": ["I", "You", "She", "The coach", "Students", "Ela and Leo"]
            },
            {
                "code": "V",
                "name": "Verb & Tense / Modal (Fiil & Zaman)",
                "question": "Ne yapıyor? (Does what?)",
                "color": "#3b82f6",
                "description": "Özneden hemen sonra gelen eylem, yardımcı fiil veya kip. Türkçe'nin aksine cümlenin sonuna gitmez!",
                "examples": ["speaks", "is playing", "didn't sleep", "must solve", "has discovered"]
            },
            {
                "code": "O",
                "name": "Object (Nesne)",
                "question": "Neyi? Kimi? (What? Whom?)",
                "color": "#10b981",
                "description": "Eylemden etkilenen nesne veya kişi.",
                "examples": ["the report", "a new mobile app", "her English book", "the mystery journal"]
            },
            {
                "code": "M",
                "name": "Manner (Durum / Tarz)",
                "question": "Nasıl? (How?)",
                "color": "#8b5cf6",
                "description": "Eylemin nasıl yapıldığını bildiren zarf.",
                "examples": ["carefully", "fluently", "fast", "with enthusiasm", "easily"]
            },
            {
                "code": "P",
                "name": "Place (Yer / Mekan)",
                "question": "Nerede? Nereye? (Where?)",
                "color": "#ec4899",
                "description": "Eylemin gerçekleştiği konum.",
                "examples": ["in the laboratory", "at school", "to Switzerland", "on the football field"]
            },
            {
                "code": "T",
                "name": "Time (Zaman)",
                "question": "Ne zaman? (When?)",
                "color": "#ef4444",
                "description": "Eylemin ne zaman yapıldığı (cümle sonunda veya vurgu için en başta).",
                "examples": ["every morning", "yesterday", "tomorrow", "after the training session", "in 2027"]
            }
        ],
        "sentence_templates": [
            {
                "tense": "Simple Present (Geniş Zaman)",
                "formula_pos": "Subject + V1/V-(s) + Object + Manner + Place + Time",
                "formula_neg": "Subject + do/does not + V1 + Object + Place + Time",
                "formula_que": "Do/Does + Subject + V1 + Object + Place + Time?",
                "helper": "do / does",
                "note": "Alışkanlıklar, rutinler ve genel gerçekler."
            },
            {
                "tense": "Present Continuous (Şimdiki Zaman)",
                "formula_pos": "Subject + am/is/are + V-ing + Object + Place + Time",
                "formula_neg": "Subject + am/is/are not + V-ing + Object + Place + Time",
                "formula_que": "Am/Is/Are + Subject + V-ing + Object + Place + Time?",
                "helper": "am / is / are",
                "note": "Şu anda gerçekleşen anlık eylemler."
            },
            {
                "tense": "Simple Past (Geçmiş Zaman)",
                "formula_pos": "Subject + V2 + Object + Place + Time",
                "formula_neg": "Subject + did not + V1 + Object + Place + Time",
                "formula_que": "Did + Subject + V1 + Object + Place + Time?",
                "helper": "did",
                "note": "Geçmişte tamamlanmış ve zamanı belli eylemler."
            },
            {
                "tense": "Future Will (Gelecek Zaman)",
                "formula_pos": "Subject + will + V1 + Object + Place + Time",
                "formula_neg": "Subject + will not (won't) + V1 + Object + Place + Time",
                "formula_que": "Will + Subject + V1 + Object + Place + Time?",
                "helper": "will / won't",
                "note": "Geleceğe dair tahminler, anlık kararlar veya vaatler."
            },
            {
                "tense": "Present Perfect (Tamamlanmış Zaman)",
                "formula_pos": "Subject + have/has + V3 + Object + Place + Time",
                "formula_neg": "Subject + have/has not + V3 + Object + Place + Time",
                "formula_que": "Have/Has + Subject + V3 + Object + Place + Time?",
                "helper": "have / has",
                "note": "Geçmişte yapılmış ama etkisi süren veya yaşam deneyimi bildiren eylemler."
            },
            {
                "tense": "Modals of Advice & Obligation (Should / Must / Can)",
                "formula_pos": "Subject + Modal + V1 + Object + Place + Time",
                "formula_neg": "Subject + Modal not + V1 + Object + Place + Time",
                "formula_que": "Modal + Subject + V1 + Object + Place + Time?",
                "helper": "can, should, must, might",
                "note": "Tavsiye (Should), Yetenek (Can), Zorunluluk (Must), İhtimal (Might)."
            },
            {
                "tense": "Passive Voice (Edilgen Çatı)",
                "formula_pos": "Object + be (was/were/is) + V3 + (by Subject)",
                "formula_neg": "Object + be not + V3 + (by Subject)",
                "formula_que": "Be + Object + V3 + (by Subject)?",
                "helper": "was/were + V3 / has been + V3",
                "note": "İşi yapan değil yapılan eylemin kendisi vurgulanır."
            }
        ]
    }

    pdf_files = sorted(glob.glob(os.path.join(PDF_DIR, "*.pdf")))

    # 1. Parse A2 80 Verbs (Modul 10 - 17)
    a2_verb_files = [f for f in pdf_files if "Ingilizce_A2_80_Fiil" in f]
    for f in a2_verb_files:
        fname = os.path.basename(f)
        reader = PdfReader(f)
        full_text = "\n".join([clean_text(p.extract_text()) for p in reader.pages])
        
        mod_match = re.search(r"MODÜL\s*(\d+)[:\s]+([^\n]+)", full_text, re.IGNORECASE)
        mod_num = int(mod_match.group(1)) if mod_match else 0
        mod_title = mod_match.group(2).strip() if mod_match else fname
        
        gram_section = ""
        gram_match = re.search(r"1\.\s*BÖLÜM[:\s]*DETAYLI GRAMER ANLATIMI(.*?)(?=2\.\s*BÖLÜM|$)", full_text, re.DOTALL | re.IGNORECASE)
        if gram_match:
            gram_section = gram_match.group(1).strip()
            
        data["grammar_modules"].append({
            "module_id": f"modul_{mod_num}",
            "number": mod_num,
            "title": f"Modül {mod_num}: {mod_title}",
            "file": fname,
            "content": gram_section,
            "category": "A2-B1 Fiil & Temel Zamanlar"
        })

        verb_blocks = re.findall(r"(\d+)\.\s+([A-Za-z\s/]+)\s*\(([^)]+)\)\s*(.*?)(?=\n\s*\d+\.\s+[A-Za-z\s/]+\s*\(|\n\s*==|$)", full_text, re.DOTALL)
        for num, v_en, v_tr, body in verb_blocks:
            v_en_clean = v_en.strip()
            v_tr_clean = v_tr.strip()
            
            pos_m = re.search(r"Olumlu\s*\(\+\)\s*(.*?)(?=Olumsuz\s*\(\-\)|Soru\s*\(\?\)|$)", body, re.DOTALL | re.IGNORECASE)
            neg_m = re.search(r"Olumsuz\s*\(\-\)\s*(.*?)(?=Soru\s*\(\?\)|$)", body, re.DOTALL | re.IGNORECASE)
            que_m = re.search(r"Soru\s*\(\?\)\s*(.*?)(?=$)", body, re.DOTALL | re.IGNORECASE)
            
            pos_text = pos_m.group(1).strip() if pos_m else ""
            neg_text = neg_m.group(1).strip() if neg_m else ""
            que_text = que_m.group(1).strip() if que_m else ""
            
            def split_en_tr(sent):
                m = re.search(r"^(.*?)\s*\(([^)]+)\)\s*$", sent.replace("\n", " ").strip())
                if m:
                    return m.group(1).strip(), m.group(2).strip()
                return sent.replace("\n", " ").strip(), ""

            pos_en, pos_tr = split_en_tr(pos_text)
            neg_en, neg_tr = split_en_tr(neg_text)
            que_en, que_tr = split_en_tr(que_text)
            
            v1, v2, v3 = get_forms(v_en_clean)

            data["verbs"].append({
                "id": int(num),
                "verb": v_en_clean,
                "meaning": v_tr_clean,
                "module": mod_num,
                "forms": {
                    "v1": v1,
                    "v2": v2,
                    "v3": v3
                },
                "sentences": {
                    "positive": {"en": pos_en, "tr": pos_tr},
                    "negative": {"en": neg_en, "tr": neg_tr},
                    "question": {"en": que_en, "tr": que_tr}
                },
                "category": mod_title,
                "source": "A2 80 Verbs"
            })

    # Sort verbs by ID
    data["verbs"] = sorted(data["verbs"], key=lambda x: x["id"])

    # 2. Parse Fiil ve Ileri Gramer Rehberi (Modul 1 - 9)
    adv_verb_files = [f for f in pdf_files if "Ingilizce_Fiil_ve_Gramer_Rehberi_Modul" in f]
    for f in adv_verb_files:
        fname = os.path.basename(f)
        reader = PdfReader(f)
        full_text = "\n".join([clean_text(p.extract_text()) for p in reader.pages])
        
        mod_num_m = re.search(r"MODÜL\s*(\d+)", fname)
        mod_num = int(mod_num_m.group(1)) if mod_num_m else 0
        
        title_m = re.search(r"İNGİLİZCE FİİL VE İLERİ GRAMER REHBERİ\s*\(MODÜL\s*\d+\)\s*\n([^\n]+)", full_text, re.IGNORECASE)
        mod_title = title_m.group(1).strip() if title_m else f"İleri Gramer Modül {mod_num}"
        
        gram_section = ""
        gram_match = re.search(r"1\.\s*BÖLÜM[:\s]*DETAYLI GRAMER ANLATIMI(.*?)(?=2\.\s*BÖLÜM|$)", full_text, re.DOTALL | re.IGNORECASE)
        if gram_match:
            gram_section = gram_match.group(1).strip()
            
        data["grammar_modules"].append({
            "module_id": f"adv_modul_{mod_num}",
            "number": mod_num,
            "title": f"İleri Modül {mod_num}: {mod_title}",
            "file": fname,
            "content": gram_section,
            "category": "İleri Gramer & Bağlaçlar"
        })
        
        adv_verb_blocks = re.findall(r"(\d+)\.\s+([A-Za-z\s/]+)\s*\(([^)]+)\)\s*(.*?)(?=\n\s*\d+\.\s+[A-Za-z\s/]+\s*\(|\n\s*==|$)", full_text, re.DOTALL)
        for num, v_en, v_tr, body in adv_verb_blocks:
            v_en_clean = v_en.strip()
            v_tr_clean = v_tr.strip()
            
            examples = []
            lines = [l.strip() for l in body.split("\n") if l.strip()]
            curr_tag = ""
            curr_en = ""
            curr_tr = ""
            for line in lines:
                tag_m = re.match(r"^([A-Za-z0-9\+\-\?\s/&]+)\s+([A-Z][a-zA-Z0-9\s,\.\'\"]+.*)", line)
                if tag_m:
                    curr_tag = tag_m.group(1).strip()
                    rem = tag_m.group(2).strip()
                    tr_m = re.search(r"\(([^)]+)\)", rem)
                    if tr_m:
                        curr_tr = tr_m.group(1).strip()
                        curr_en = rem[:tr_m.start()].strip()
                    else:
                        curr_en = rem
                        curr_tr = ""
                    examples.append({"type": curr_tag, "en": curr_en, "tr": curr_tr})
                elif line.startswith("(") and line.endswith(")") and examples:
                    examples[-1]["tr"] = line[1:-1].strip()

            v1, v2, v3 = get_forms(v_en_clean)

            data["advanced_grammar_notes"].append({
                "id": int(num),
                "verb": v_en_clean,
                "meaning": v_tr_clean,
                "module": mod_num,
                "forms": {"v1": v1, "v2": v2, "v3": v3},
                "examples": examples,
                "category": mod_title
            })

    # Sort grammar modules
    data["grammar_modules"] = sorted(data["grammar_modules"], key=lambda x: (0 if "adv" in x["module_id"] else 1, x["number"]))

    # 3. Parse Ela Story
    story_files = [f for f in pdf_files if "Ela_A2_B1_Verbs_Story" in f]
    if story_files:
        f = story_files[0]
        reader = PdfReader(f)
        pages_text = [clean_text(p.extract_text()) for p in reader.pages]
        
        for idx, p_text in enumerate(pages_text, 1):
            ch_en_title_m = re.search(r"Chapter\s*\d+[:\s]+([^\n]+)", p_text, re.IGNORECASE)
            ch_tr_title_m = re.search(r"Bölüm\s*\d+[:\s]+([^\n]+)", p_text, re.IGNORECASE)
            
            parts = re.split(r"Kayıp Akademinin Peşinde|Bölüm\s*\d+|PAGE\s*\d+\s*•\s*TURKISH", p_text, flags=re.IGNORECASE)
            en_part = parts[0] if len(parts) > 0 else p_text
            tr_part = parts[1] if len(parts) > 1 else ""
            
            en_clean = re.sub(r"The Quest for the Lost Academy.*?\n", "", en_part)
            en_clean = re.sub(r"Renk Rehberi.*?\n", "", en_clean)
            en_clean = re.sub(r"PAGE\s*\d+\s*•\s*ENGLISH", "", en_clean).strip()
            
            tr_clean = re.sub(r"Ela İçin Özel Macera.*?\n", "", tr_part)
            tr_clean = re.sub(r"Renk Rehberi.*?\n", "", tr_clean).strip()

            # Split paragraphs
            en_paras = [p.strip() for p in en_clean.split("\n\n") if p.strip() and not p.startswith("Ela's Verb Quest")]
            tr_paras = [p.strip() for p in tr_clean.split("\n\n") if p.strip()]

            data["story_chapters"].append({
                "chapter": idx,
                "title_en": ch_en_title_m.group(1).strip() if ch_en_title_m else f"Chapter {idx}",
                "title_tr": ch_tr_title_m.group(1).strip() if ch_tr_title_m else f"Bölüm {idx}",
                "en_text": en_clean,
                "tr_text": tr_clean,
                "paragraphs": list(zip(en_paras, tr_paras)) if len(en_paras) == len(tr_paras) else []
            })

    # 4. Parse YouTube Video Guide
    yt_files = [f for f in pdf_files if "YouTube_Video_Rehberi" in f]
    if yt_files:
        f = yt_files[0]
        reader = PdfReader(f)
        full_text = "\n".join([clean_text(p.extract_text()) for p in reader.pages])
        
        v_matches = re.findall(r"([0-9]+\.\s*Ders[^\n]+)\n(.*?)(https://www\.youtube\.com/watch\?v=[a-zA-Z0-9_\-]+)", full_text, re.DOTALL)
        for title, desc, url in v_matches:
            data["youtube_videos"].append({
                "title": title.strip(),
                "description": desc.strip().replace("\n", " "),
                "url": url.strip(),
                "video_id": url.strip().split("v=")[-1]
            })

    # 5. Build dynamic sentence builder blocks for Cümle Fabrikası
    data["builder_blocks"] = {
        "subjects": [
            {"en": "I", "tr": "Ben", "type": "sing"},
            {"en": "You", "tr": "Sen / Siz", "type": "plur"},
            {"en": "He", "tr": "O (Erkek)", "type": "he_she_it"},
            {"en": "She", "tr": "O (Kadın)", "type": "he_she_it"},
            {"en": "We", "tr": "Biz", "type": "plur"},
            {"en": "They", "tr": "Onlar", "type": "plur"},
            {"en": "The coach", "tr": "Antrenör", "type": "he_she_it"},
            {"en": "Athletes", "tr": "Sporcular", "type": "plur"},
            {"en": "Students", "tr": "Öğrenciler", "type": "plur"},
            {"en": "The researcher", "tr": "Araştırmacı", "type": "he_she_it"},
            {"en": "Ela and Leo", "tr": "Ela ve Leo", "type": "plur"}
        ],
        "verbs": [
            {"base": "solve", "s": "solves", "ing": "solving", "v2": "solved", "v3": "solved", "tr": "çözmek"},
            {"base": "create", "s": "creates", "ing": "creating", "v2": "created", "v3": "created", "tr": "oluşturmak"},
            {"base": "develop", "s": "develops", "ing": "developing", "v2": "developed", "v3": "developed", "tr": "geliştirmek"},
            {"base": "wash", "s": "washes", "ing": "washing", "v2": "washed", "v3": "washed", "tr": "yıkamak"},
            {"base": "clean", "s": "cleans", "ing": "cleaning", "v2": "cleaned", "v3": "cleaned", "tr": "temizlemek"},
            {"base": "carry", "s": "carries", "ing": "carrying", "v2": "carried", "v3": "carried", "tr": "taşımak"},
            {"base": "wear", "s": "wears", "ing": "wearing", "v2": "wore", "v3": "worn", "tr": "giymek / takmak"},
            {"base": "play", "s": "plays", "ing": "playing", "v2": "played", "v3": "played", "tr": "oynamak"},
            {"base": "visit", "s": "visits", "ing": "visiting", "v2": "visited", "v3": "visited", "tr": "ziyaret etmek"},
            {"base": "win", "s": "wins", "ing": "winning", "v2": "won", "v3": "won", "tr": "kazanmak"},
            {"base": "study", "s": "studies", "ing": "studying", "v2": "studied", "v3": "studied", "tr": "çalışmak"},
            {"base": "discover", "s": "discovers", "ing": "discovering", "v2": "discovered", "v3": "discovered", "tr": "keşfetmek"},
            {"base": "protect", "s": "protects", "ing": "protecting", "v2": "protected", "v3": "protected", "tr": "korumak"},
            {"base": "keep", "s": "keeps", "ing": "keeping", "v2": "kept", "v3": "kept", "tr": "saklamak / tutmak"}
        ],
        "objects": [
            {"en": "the match tactics", "tr": "maç taktiklerini"},
            {"en": "a new mobile application", "tr": "yeni bir mobil uygulamayı"},
            {"en": "the scientific test equipment", "tr": "bilimsel test ekipmanlarını"},
            {"en": "the training uniforms", "tr": "antrenman formalarını"},
            {"en": "the VR headsets and sensors", "tr": "VR başlıklarını ve sensörleri"},
            {"en": "the regional championship", "tr": "bölge şampiyonluğunu"},
            {"en": "the ancient secret journal", "tr": "antik gizli günlüğü"},
            {"en": "the English grammar guide", "tr": "İngilizce gramer rehberini"},
            {"en": "the experimental data", "tr": "deneysel verileri"}
        ],
        "manners": [
            {"en": "carefully", "tr": "dikkatlice"},
            {"en": "regularly", "tr": "düzenli olarak"},
            {"en": "with great discipline", "tr": "büyük bir disiplinle"},
            {"en": "easily", "tr": "kolayca"},
            {"en": "successfully", "tr": "başarıyla"},
            {"en": "step by step", "tr": "adım adım"}
        ],
        "places": [
            {"en": "in the sports laboratory", "tr": "spor laboratuvarında"},
            {"en": "at the university campus", "tr": "üniversite kampüsünde"},
            {"en": "on the football field", "tr": "futbol sahasında"},
            {"en": "in the library", "tr": "kütüphanede"},
            {"en": "in Switzerland", "tr": "İsviçre'de"},
            {"en": "in the testing room", "tr": "test odasında"}
        ],
        "times": [
            {"en": "every morning", "tr": "her sabah"},
            {"en": "yesterday", "tr": "dün"},
            {"en": "tomorrow", "tr": "yarın"},
            {"en": "after every practice session", "tr": "her antrenman seansından sonra"},
            {"en": "during the tournament", "tr": "turnuva sırasında"},
            {"en": "this week", "tr": "bu hafta"}
        ]
    }

    # Write files
    with open(OUT_JSON, "w", encoding="utf-8") as out:
        json.dump(data, out, ensure_ascii=False, indent=2)

    with open(OUT_JS, "w", encoding="utf-8") as out:
        out.write("const APP_DATA = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n")
        out.write("if (typeof module !== 'undefined' && module.exports) { module.exports = APP_DATA; }\n")

    print("Data extraction and enrichment complete!")

if __name__ == "__main__":
    parse_all()
