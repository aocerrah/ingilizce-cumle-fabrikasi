/**
 * 22+ Konu Kapsamlı Gramer Akademisi, YouTube Video Arama & Ders İzleme Modülü
 * (If Clauses, Wish Clauses, Passive Voice, Reported Speech, Modals, Tenses dahil)
 */

class GrammarView {
  constructor() {
    this.expandedModuleId = 'modul_10';
    this.videoSearchQuery = '';
    this.watchedVideos = JSON.parse(localStorage.getItem('english_app_watched_videos') || '[]');

    this.defaultVideoLessons = [
      {
        id: "vid_svompt",
        tense_key: "svompt",
        title: "1. Ders: İngilizce Cümle Dizilimi ve SVOMPT Kuralı",
        topic: "SVOMPT Cümle Yapısı",
        description: "Özne (Subject), Fiil (Verb), Nesne (Object), Durum (Manner), Yer (Place), Zaman (Time) dizilişi ve Türkçe ile temel farklar.",
        url: "https://www.youtube.com/watch?v=84FD2kZ8FUQ",
        video_id: "84FD2kZ8FUQ",
        duration: "12 Dk",
        level: "A1-A2"
      },
      {
        id: "vid_simple_present",
        tense_key: "present_simple",
        title: "2. Ders: Simple Present Tense (Geniş Zaman & Do/Does)",
        topic: "Simple Present Tense",
        description: "Günlük rutinler, alışkanlıklar, He/She/It için -s/-es/-ies takıları ve Do/Does soru yapıları.",
        url: "https://www.youtube.com/watch?v=0m0Tp1_N3bs",
        video_id: "0m0Tp1_N3bs",
        duration: "15 Dk",
        level: "A1-A2"
      },
      {
        id: "vid_present_cont",
        tense_key: "present_continuous",
        title: "3. Ders: Present Continuous Tense (Şimdiki Zaman - am/is/are + V-ing)",
        topic: "Present Continuous",
        description: "Şu anda gerçekleşen eylemler, -ing takısı getirme kuralları, Now ve At the moment kullanımı.",
        url: "https://www.youtube.com/watch?v=bVnJkO33e5E",
        video_id: "bVnJkO33e5E",
        duration: "14 Dk",
        level: "A1-A2"
      },
      {
        id: "vid_simple_past",
        tense_key: "past_simple",
        title: "4. Ders: Simple Past Tense (Geçmiş Zaman - V2 / Did)",
        topic: "Simple Past Tense",
        description: "Geçmişte tamamlanan eylemler, düzenli (-ed) ve düzensiz (V2) fiiller, Did yardımcı fiili.",
        url: "https://www.youtube.com/watch?v=1pEx4Gmu4G0",
        video_id: "1pEx4Gmu4G0",
        duration: "18 Dk",
        level: "A2"
      },
      {
        id: "vid_past_cont",
        tense_key: "past_continuous",
        title: "5. Ders: Past Continuous Tense (was/were + V-ing - Geçmişte Süregelen)",
        topic: "Past Continuous",
        description: "Geçmişte belli bir anda devam eden eylemler, When & While bağlaçlarının kullanımı.",
        url: "https://www.youtube.com/watch?v=E8wUuI9L_1M",
        video_id: "E8wUuI9L_1M",
        duration: "13 Dk",
        level: "A2-B1"
      },
      {
        id: "vid_present_perfect",
        tense_key: "present_perfect",
        title: "6. Ders: Present Perfect & Continuous (have/has + V3 - Yakın Geçmiş)",
        topic: "Present Perfect",
        description: "Geçmişte başlayıp etkisi süren eylemler, tecrübeler, Ever/Never/Just/Already/Yet farkları.",
        url: "https://www.youtube.com/watch?v=lUedoIUtS7Y",
        video_id: "lUedoIUtS7Y",
        duration: "20 Dk",
        level: "A2-B1"
      },
      {
        id: "vid_past_perfect",
        tense_key: "past_perfect",
        title: "7. Ders: Past Perfect Tense (had + V3 - Önceki Geçmiş Zaman)",
        topic: "Past Perfect",
        description: "Geçmişte gerçekleşen iki olaydan daha önce olanını anlatma (-mişti), After / Before / By the time kalıpları.",
        url: "https://www.youtube.com/watch?v=n9B1Q4gR3vU",
        video_id: "n9B1Q4gR3vU",
        duration: "15 Dk",
        level: "B1"
      },
      {
        id: "vid_future_will",
        tense_key: "future_will",
        title: "8. Ders: Future Tenses (Will vs Be Going To - Gelecek Zaman)",
        topic: "Future Simple & Going To",
        description: "Gelecek zaman farkları: Anlık kararlar (Will) ile Önceden Planlanmış niyetler (Be Going to).",
        url: "https://www.youtube.com/watch?v=9x7P0nJ8x_4",
        video_id: "9x7P0nJ8x_4",
        duration: "16 Dk",
        level: "A2"
      },
      {
        id: "vid_future_advanced",
        tense_key: "future_continuous",
        title: "9. Ders: Future Continuous & Future Perfect (will be V-ing / will have V3)",
        topic: "Future Continuous & Perfect",
        description: "Gelecekte belirli bir anda yapıyor olacak (Future Cont) ve gelecekte tamamlanmış olacak (Future Perfect).",
        url: "https://www.youtube.com/watch?v=X8v2m9K1L4Q",
        video_id: "X8v2m9K1L4Q",
        duration: "15 Dk",
        level: "B1"
      },
      {
        id: "vid_modals_can_must_should",
        tense_key: "modal_can",
        title: "10. Ders: Modals (Can, Could, Must, Have to, Should - İngilizce Kipler)",
        topic: "Modals (Kipler)",
        description: "Yetenek (Can), Geçmiş Yetenek (Could), Zorunluluk (Must / Have to) ve Tavsiye (Should) cümleleri kurma.",
        url: "https://www.youtube.com/watch?v=H7K3Q9m8X1A",
        video_id: "H7K3Q9m8X1A",
        duration: "17 Dk",
        level: "A2-B1"
      },
      {
        id: "vid_modals_possibility",
        tense_key: "modal_may",
        title: "11. Ders: Modals of Possibility (May, Might, Would, Would like to)",
        topic: "Olasılık & Tercih Modalları",
        description: "Olasılık ve ihtimal bildiren kipler (May, Might) ve kibar istek/tercih kalıpları (Would like to / Would rather).",
        url: "https://www.youtube.com/watch?v=R8K1M9x4L2Q",
        video_id: "R8K1M9x4L2Q",
        duration: "14 Dk",
        level: "B1"
      },
      {
        id: "vid_used_to",
        tense_key: "used_to",
        title: "12. Ders: Used to & Would (Eski Alışkanlıklar & Eskiden Yapardım)",
        topic: "Used to",
        description: "Geçmişte düzenli yapılıp artık terkedilen alışkanlıklar ve durumları ifade etme.",
        url: "https://www.youtube.com/watch?v=Kq0aZ8g-bLk",
        video_id: "Kq0aZ8g-bLk",
        duration: "11 Dk",
        level: "B1"
      },
      {
        id: "vid_conditionals_if",
        tense_key: "conditionals",
        title: "13. Ders: If Clauses (Conditionals: Type 0, 1, 2, 3 - Şart Cümleleri)",
        topic: "If Clauses (Şart Cümleleri)",
        description: "Genel gerçekler (Type 0), Olası gelecek (Type 1), Hayali şimdiki zaman (Type 2) ve Geçmiş pişmanlıklar (Type 3).",
        url: "https://www.youtube.com/watch?v=Y8m2K9p4L1Q",
        video_id: "Y8m2K9p4L1Q",
        duration: "24 Dk",
        level: "A2-B1-B2"
      },
      {
        id: "vid_wish_clauses",
        tense_key: "wish_clauses",
        title: "14. Ders: Wish Clauses & Regrets (Keşke Cümleleri ve Pişmanlıklar)",
        topic: "Wish Clauses (Dilek Cümleleri)",
        description: "Şimdiki zaman dilekleri (I wish I had...) ve geçmiş pişmanlıklar (I wish I had done...) kalıpları.",
        url: "https://www.youtube.com/watch?v=k_qN5W3U4bI",
        video_id: "k_qN5W3U4bI",
        duration: "16 Dk",
        level: "B1"
      },
      {
        id: "vid_passive_voice",
        tense_key: "passive",
        title: "15. Ders: Passive Voice (Edilgen Çatı - be + Verb 3 Detaylı Anlatım)",
        topic: "Passive Voice (Edilgen Çatı)",
        description: "Eylemi yapan değil yapılan işin ön planda olduğu cümleler, tüm zamanlarda be + V3 ve by/with edatları.",
        url: "https://www.youtube.com/watch?v=U415FsKeE2g",
        video_id: "U415FsKeE2g",
        duration: "22 Dk",
        level: "B1"
      },
      {
        id: "vid_relative_clauses",
        tense_key: "relative_clauses",
        title: "16. Ders: Relative Clauses (Who, Which, That, Where, Whose - Sıfat Cümlecikleri)",
        topic: "Relative Clauses",
        description: "İki ayrı cümleyi tek bir akıcı cümleye bağlayarak insanları, nesneleri ve mekanları tanımlama kuralları.",
        url: "https://www.youtube.com/watch?v=oFknXglYI3g",
        video_id: "oFknXglYI3g",
        duration: "19 Dk",
        level: "B1"
      },
      {
        id: "vid_reported_speech",
        tense_key: "reported_speech",
        title: "17. Ders: Reported Speech (Dolaylı Anlatım & Söz Aktarımı)",
        topic: "Reported Speech (Dolaylı Anlatım)",
        description: "Birinin söylediği sözü başkasına aktarma, zaman kaymaları (tense backshift) ve emir/istek cümleleri (tell/ask to).",
        url: "https://www.youtube.com/watch?v=g4Y1P_g2u6w",
        video_id: "g4Y1P_g2u6w",
        duration: "21 Dk",
        level: "B1"
      },
      {
        id: "vid_gerund_infinitive",
        tense_key: "gerund_infinitive",
        title: "18. Ders: Gerunds & Infinitives (Fiilimsiler: V-ing ve to Verb Kullanımı)",
        topic: "Gerund & Infinitive",
        description: "Hangi fiillerden sonra -ing gelir (enjoy, avoid, mind), hangilerinden sonra to V1 gelir (decide, want, promise).",
        url: "https://www.youtube.com/watch?v=W8K2M9x7L1Q",
        video_id: "W8K2M9x7L1Q",
        duration: "18 Dk",
        level: "B1"
      },
      {
        id: "vid_conjunctions",
        tense_key: "conjunctions",
        title: "19. Ders: Conjunctions & Transitions (Bağlaçlar: Because, Although, So that, However)",
        topic: "Bağlaçlar (Conjunctions)",
        description: "Sebep-sonuç (because, due to), Zıtlık (although, however) ve Amaç bildiren bağlaçlar (so that, in order to).",
        url: "https://www.youtube.com/watch?v=m3P9x7K2M1Q",
        video_id: "m3P9x7K2M1Q",
        duration: "20 Dk",
        level: "A2-B1"
      },
      {
        id: "vid_causatives",
        tense_key: "causatives",
        title: "20. Ders: Causatives (Ettirgen Çatı: Have / Make / Get something done)",
        topic: "Causatives (Ettirgen Çatı)",
        description: "Bir işi başkasına yaptırma kalıpları (have something done, make someone do something).",
        url: "https://www.youtube.com/watch?v=j8K2M9x4L1Q",
        video_id: "j8K2M9x4L1Q",
        duration: "14 Dk",
        level: "B1"
      },
      {
        id: "vid_superlatives",
        tense_key: "superlatives",
        title: "21. Ders: Comparatives & Superlatives (Karşılaştırma ve En Üstünlük)",
        topic: "Comparatives & Superlatives",
        description: "Sıfatlarda daha üstün (-er / more than) ve en üstün (-est / the most) derecelendirme kuralları.",
        url: "https://www.youtube.com/watch?v=Eognas2iXoY",
        video_id: "Eognas2iXoY",
        duration: "14 Dk",
        level: "A2"
      },
      {
        id: "vid_tag_questions",
        tense_key: "tag_questions",
        title: "22. Ders: Question Tags (Soru Ekleri - değil mi?)",
        topic: "Question Tags (Soru Ekleri)",
        description: "Cümle sonuna eklenen onaylatma soruları (You are a student, aren't you? / She didn't come, did she?).",
        url: "https://www.youtube.com/watch?v=q7K3M9x8L2Q",
        video_id: "q7K3M9x8L2Q",
        duration: "12 Dk",
        level: "A2-B1"
      }
    ];
  }

  getAllVideos() {
    return this.defaultVideoLessons;
  }

  getVideoForTense(tenseKey) {
    const all = this.getAllVideos();
    const map = {
      'present_simple': '0m0Tp1_N3bs',
      'present_continuous': 'bVnJkO33e5E',
      'present_perfect': 'lUedoIUtS7Y',
      'present_perfect_continuous': 'lUedoIUtS7Y',
      'past_simple': '1pEx4Gmu4G0',
      'past_continuous': 'E8wUuI9L_1M',
      'past_perfect': 'n9B1Q4gR3vU',
      'used_to': 'Kq0aZ8g-bLk',
      'future_will': '9x7P0nJ8x_4',
      'future_going_to': '9x7P0nJ8x_4',
      'future_continuous': 'X8v2m9K1L4Q',
      'future_perfect': 'X8v2m9K1L4Q',
      'modal_can': 'H7K3Q9m8X1A',
      'modal_could': 'H7K3Q9m8X1A',
      'modal_must': 'H7K3Q9m8X1A',
      'modal_have_to': 'H7K3Q9m8X1A',
      'modal_should': 'H7K3Q9m8X1A',
      'modal_may': 'R8K1M9x4L2Q',
      'modal_might': 'R8K1M9x4L2Q',
      'modal_would': 'R8K1M9x4L2Q',
      'modal_would_like': 'R8K1M9x4L2Q',
      'conditionals': 'Y8m2K9p4L1Q',
      'if_clauses': 'Y8m2K9p4L1Q',
      'wish_clauses': 'k_qN5W3U4bI',
      'passive': 'U415FsKeE2g',
      'relative_clauses': 'oFknXglYI3g',
      'reported_speech': 'g4Y1P_g2u6w',
      'gerund_infinitive': 'W8K2M9x7L1Q',
      'conjunctions': 'm3P9x7K2M1Q',
      'causatives': 'j8K2M9x4L1Q',
      'superlatives': 'Eognas2iXoY',
      'tag_questions': 'q7K3M9x8L2Q'
    };

    const targetVid = map[tenseKey] || '84FD2kZ8FUQ';
    return all.find(v => v.video_id === targetVid) || all[0];
  }

  render() {
    const container = document.getElementById('grammar-content-area');
    if (!container) return;

    const modules = APP_DATA.grammar_modules || [];
    const videoLessons = this.getFilteredVideos();
    const svomptRules = APP_DATA.svompt_rules || [];

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
            <span class="hero-badge" style="background:rgba(239, 68, 68, 0.2); color:#ef4444;">🎥 VİDEO DERS AKADEMİSİ (22+ DERS)</span>
            <h3 style="font-size:1.1rem; font-weight:800; color:var(--text-primary); margin-top:4px;">
              Türkçe Anlatımlı Detaylı Gramer Eğitimleri
            </h3>
          </div>
          <span style="font-size:0.75rem; font-weight:800; color:var(--success); background:rgba(34,197,94,0.15); padding:4px 8px; border-radius:12px;">Her Video +25 XP ⭐</span>
        </div>

        <p style="font-size:0.82rem; color:var(--text-secondary); margin-bottom:12px;">
          Zamanlar, If Clauses, Wish Clauses, Passive Voice, Reported Speech, Modallar ve Bağlaçlar dahil tüm konuların Türkçe anlatımlı video dersleri:
        </p>

        <!-- Video Search Input -->
        <div class="search-input-wrapper" style="margin-bottom:12px;">
          <span class="search-icon">🔍</span>
          <input type="text" class="search-input" placeholder="YouTube dersi ara (örn: If Clauses, Wish, Passive, Modals, Simple Past)..."
                 value="${this.videoSearchQuery}" oninput="grammarView.setVideoSearch(this.value)">
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap:12px;">
          ${videoLessons.map((v, i) => {
            const isWatched = this.watchedVideos.includes(v.video_id);
            return `
              <div style="background:var(--bg-card); border:1px solid ${isWatched ? 'var(--success)' : 'var(--border-subtle)'}; border-radius:var(--radius-md); padding:14px; display:flex; flex-direction:column; justify-content:space-between; gap:10px;">
                <div>
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <span style="font-size:0.72rem; font-weight:800; color:var(--danger); background:rgba(239,68,68,0.15); padding:2px 8px; border-radius:6px;">
                      ▶ DERS ${i+1}
                    </span>
                    ${isWatched ? '<span style="font-size:0.72rem; font-weight:800; color:var(--success);">✅ İzlendi (+25 XP)</span>' : (v.duration ? `<span style="font-size:0.72rem; color:var(--text-muted);">⏱️ ${v.duration}</span>` : '')}
                  </div>
                  <h4 style="font-size:0.92rem; font-weight:800; color:var(--text-primary); line-height:1.3;">${v.title}</h4>
                  <p style="font-size:0.78rem; color:var(--text-secondary); margin-top:4px; line-height:1.4;">${v.description}</p>
                </div>
                
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; gap:6px;">
                  <button class="btn-video-watch" style="background:#ef4444; color:#ffffff; border:none; padding:8px 14px; border-radius:var(--radius-full); font-weight:700; font-size:0.8rem; cursor:pointer; display:inline-flex; align-items:center; gap:5px;" 
                          onclick="grammarView.openVideoModal('${v.video_id}', '${v.title.replace(/'/g, "\\'")}')">
                    ▶ Videoyu İzle
                  </button>
                  ${!isWatched ? `
                    <button class="btn-secondary" style="padding:6px 10px; font-size:0.75rem;" onclick="grammarView.markVideoWatched('${v.video_id}')">
                      İzledim (+25 XP)
                    </button>
                  ` : `
                    <span style="font-size:0.75rem; color:var(--success); font-weight:700;">Tamamlandı</span>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 17 Modules Accordion -->
      <div class="section-header" style="margin-bottom:12px;">
        <h2>📚 Kapsamlı Gramer Rehberi</h2>
        <p>17 Modül detaylı kurallar, formül kartları ve bağlamlı örnekler</p>
      </div>

      <div class="modules-accordion">
        ${modules.map(mod => `
          <div class="module-card ${this.expandedModuleId === mod.module_id ? 'expanded' : ''}" id="card-${mod.module_id}">
            <div class="module-header" onclick="grammarView.toggleModule('${mod.module_id}')">
              <div class="module-header-left">
                <div class="module-num-badge">${mod.number}</div>
                <div class="module-title-wrap">
                  <h3>${mod.title}</h3>
                  <span>${mod.category}</span>
                </div>
              </div>
              <span class="expand-chevron">▼</span>
            </div>

            <div class="module-body">
              <div class="grammar-content-box">${mod.content || 'Bu modül için detaylı gramer açıklamaları ve cümle formülleri.'}</div>
              
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; flex-wrap:wrap; gap:8px;">
                <span style="font-size:0.75rem; color:var(--text-muted);">Kaynak: ${mod.file}</span>
                <button class="btn-primary" style="padding:6px 12px; font-size:0.78rem;" 
                        onclick="verbsView.setSearch('${mod.title.split(':')[0]}'); app.switchTab('verbs');">
                  🔍 Bu Konunun Fiillerine Git
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  getFilteredVideos() {
    let list = this.getAllVideos();
    if (this.videoSearchQuery.trim() !== '') {
      const q = this.videoSearchQuery.toLowerCase().trim();
      list = list.filter(v => 
        (v.title && v.title.toLowerCase().includes(q)) || 
        (v.description && v.description.toLowerCase().includes(q)) ||
        (v.topic && v.topic.toLowerCase().includes(q))
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

  openVideoModal(videoId, title) {
    const modal = document.getElementById('video-modal');
    const modalTitle = document.getElementById('video-modal-title');
    const videoWrapper = document.getElementById('video-modal-iframe-wrapper');

    if (!modal || !modalTitle || !videoWrapper) return;

    modalTitle.textContent = title;
    videoWrapper.innerHTML = `
      <div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:12px;">
        <iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" 
                style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowfullscreen>
        </iframe>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px; padding:8px 12px; background:var(--bg-surface); border-radius:var(--radius-md);">
        <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" style="color:var(--primary); font-size:0.82rem; font-weight:700; text-decoration:none;">
          🌐 YouTube Uygulamasında Aç ↗
        </a>
        <button class="btn-primary" style="padding:6px 14px; font-size:0.8rem;" onclick="grammarView.markVideoWatched('${videoId}')">
          ⭐ Dersi İzledim (+25 XP)
        </button>
      </div>
    `;

    modal.classList.add('active');
  }

  closeVideoModal() {
    const modal = document.getElementById('video-modal');
    const videoWrapper = document.getElementById('video-modal-iframe-wrapper');
    if (modal) modal.classList.remove('active');
    if (videoWrapper) videoWrapper.innerHTML = '';
  }

  markVideoWatched(videoId) {
    if (!this.watchedVideos.includes(videoId)) {
      this.watchedVideos.push(videoId);
      localStorage.setItem('english_app_watched_videos', JSON.stringify(this.watchedVideos));
      if (window.app) {
        window.app.addXP(25);
        window.app.showToast('🎉 Tebrikler! Video Dersi Tamamlandı (+25 XP)');
      }
      this.render();
    } else {
      if (window.app) window.app.showToast('✅ Bu dersi daha önce izlediniz!');
    }
  }
}

// Global instance
window.grammarView = new GrammarView();
