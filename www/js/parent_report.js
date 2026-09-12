/**
 * 👨‍👧 Veli & Gelişim Raporu Yönetim Sistemi (Parent Progress & Analytics Engine)
 * Öğrencinin çalışma sürelerini, izlediği video dersleri, öğrendiği kelimeleri,
 * yaptığı hataları ve SVOMPT cümle kurma başarılarını takip eder;
 * Babasına (alihonorcerrah@gmail.com) tek tıkla e-posta / mesaj raporu hazırlar ve gönderir.
 */

class ParentReportManager {
  constructor() {
    this.parentEmail = localStorage.getItem('english_app_parent_email') || 'alihonorcerrah@gmail.com';
    this.studentName = localStorage.getItem('english_app_student_name') || 'Kızım';
    this.totalStudyMinutes = parseInt(localStorage.getItem('english_app_total_study_minutes') || '35', 10);
    this.errorLogs = JSON.parse(localStorage.getItem('english_app_error_logs') || '[]');
    this.activityLogs = JSON.parse(localStorage.getItem('english_app_activity_logs') || '[]');
    this.sessionStartTime = Date.now();
    this.activeReportTab = 'summary'; // 'summary', 'errors', 'videos', 'words', 'email'

    // Oturum süresi sayacı (Her dakika toplam çalışma süresini günceller)
    this.startStudyTimer();

    // İlk kez açıldığında örnek hata analizi varsa yükle
    this.ensureSeedDataIfEmpty();
  }

  startStudyTimer() {
    setInterval(() => {
      // Sayfa aktif ve görünür durumdaysa süreyi artır
      if (!document.hidden) {
        this.totalStudyMinutes += 1;
        localStorage.setItem('english_app_total_study_minutes', this.totalStudyMinutes.toString());
      }
    }, 60000); // her 60 saniyede bir
  }

  ensureSeedDataIfEmpty() {
    if (this.errorLogs.length === 0) {
      this.errorLogs = [
        {
          id: 'err_1',
          type: 'quiz',
          word: 'Accomplish',
          meaning: 'Başarmak, Tamamlamak',
          wrongAnswer: 'Kabul etmek',
          correctAnswer: 'Başarmak',
          count: 2,
          lastDate: new Date(Date.now() - 86400000).toLocaleDateString('tr-TR')
        },
        {
          id: 'err_2',
          type: 'sentence',
          word: 'Drink',
          meaning: 'İçmek',
          targetSentence: 'She drinks coffee in the morning.',
          userAttempt: 'She in the morning drinks coffee.',
          issue: 'Zaman zarfı (Time) SVOMPT kuralı gereği cümlenin en sonuna gelmelidir.',
          count: 1,
          lastDate: new Date().toLocaleDateString('tr-TR')
        }
      ];
      localStorage.setItem('english_app_error_logs', JSON.stringify(this.errorLogs));
    }
  }

  /**
   * Hata Kaydı (Sınavlarda, cümle sıralamada veya kelime kartlarında yapılan yanlışlar)
   */
  recordError(errorObj) {
    const wordKey = (errorObj.word || errorObj.title || 'Genel').trim();
    const existing = this.errorLogs.find(e => e.word && e.word.toLowerCase() === wordKey.toLowerCase() && e.type === errorObj.type);

    if (existing) {
      existing.count = (existing.count || 1) + 1;
      existing.lastDate = new Date().toLocaleDateString('tr-TR');
      if (errorObj.wrongAnswer) existing.wrongAnswer = errorObj.wrongAnswer;
      if (errorObj.issue) existing.issue = errorObj.issue;
    } else {
      this.errorLogs.unshift({
        id: 'err_' + Date.now(),
        type: errorObj.type || 'quiz', // 'quiz', 'sentence', 'vocab'
        word: wordKey,
        meaning: errorObj.meaning || '',
        wrongAnswer: errorObj.wrongAnswer || '',
        correctAnswer: errorObj.correctAnswer || '',
        targetSentence: errorObj.targetSentence || '',
        userAttempt: errorObj.userAttempt || '',
        issue: errorObj.issue || '',
        count: 1,
        lastDate: new Date().toLocaleDateString('tr-TR')
      });
    }

    // Maksimum 50 hata kaydı tut
    if (this.errorLogs.length > 50) this.errorLogs.pop();
    localStorage.setItem('english_app_error_logs', JSON.stringify(this.errorLogs));
    this.recordActivity('error', `Hata: ${wordKey}`, errorObj.wrongAnswer || errorObj.issue || '');
  }

  /**
   * Aktivite Kaydı
   */
  recordActivity(type, title, details = '') {
    this.activityLogs.unshift({
      type,
      title,
      details,
      timestamp: Date.now(),
      dateStr: new Date().toLocaleDateString('tr-TR') + ' ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    });

    if (this.activityLogs.length > 100) this.activityLogs.pop();
    localStorage.setItem('english_app_activity_logs', JSON.stringify(this.activityLogs));
  }

  /**
   * Video İzlendiğinde Kaydet
   */
  recordVideoWatch(lessonTitle, author) {
    this.recordActivity('video', `Video Dersi İzlendi: ${lessonTitle}`, `Eğitmen: ${author} (+10 XP)`);
  }

  /**
   * Öğrenilen Kelime Kaydet
   */
  recordMasteredWord(wordName, meaning) {
    this.recordActivity('mastered', `Kelime Öğrenildi: ${wordName}`, `Anlamı: ${meaning} (+3 XP)`);
  }

  /**
   * Kapsamlı Rapor Verisi Hesaplama
   */
  getReportData() {
    const xp = window.app ? window.app.xp : parseInt(localStorage.getItem('english_app_xp') || '0', 10);
    const streak = window.app ? window.app.streak : parseInt(localStorage.getItem('english_app_streak') || '1', 10);
    const masteredVerbs = window.app ? window.app.masteredVerbs : JSON.parse(localStorage.getItem('english_app_mastered_verbs') || '[]');
    const watchedVideos = window.grammarView ? window.grammarView.watchedVideos : JSON.parse(localStorage.getItem('english_app_watched_videos') || '[]');
    const customWords = window.customWordsManager ? window.customWordsManager.getAll() : [];
    const customMastered = customWords.filter(w => w.mastered).length;

    const allVerbs = (APP_DATA && APP_DATA.verbs) ? APP_DATA.verbs : [];
    const totalVerbsCount = allVerbs.length || 158;
    const masteredCount = masteredVerbs.length;
    const masteredPercent = Math.round((masteredCount / totalVerbsCount) * 100);

    // Öğrenilen fiillerin detaylı listesi
    const masteredList = allVerbs.filter(v => masteredVerbs.includes(v.id)).map(v => ({
      verb: v.verb,
      meaning: v.meaning,
      level: v.level,
      forms: v.forms
    }));

    // İzlenen videoların listesi
    const allLessons = window.grammarView ? window.grammarView.defaultVideoLessons : [];
    const watchedLessonsList = [];
    allLessons.forEach(l => {
      l.videos.forEach(v => {
        if (watchedVideos.includes(v.id)) {
          watchedLessonsList.push({
            topic: l.topic,
            lessonTitle: l.title,
            videoTitle: v.title,
            author: v.author
          });
        }
      });
    });

    // Çalışma süresi
    const hours = Math.floor(this.totalStudyMinutes / 60);
    const mins = this.totalStudyMinutes % 60;
    const studyTimeString = hours > 0 ? `${hours} Saat ${mins} Dakika` : `${mins} Dakika`;

    // Hata analizi
    const errorsList = [...this.errorLogs].sort((a, b) => (b.count || 1) - (a.count || 1));

    // Seviye & Ödül vaadi (Yüksek Standartlı & Dengeli Puanlama)
    let levelName = '🌱 A1 Başlangıç';
    if (xp >= 3500 && masteredCount >= totalVerbsCount && watchedVideos.length >= (allLessons.length || 22)) {
      levelName = '👑 Efsanevi Cümle Ustası (Tüm Eğitim Bitirildi)';
    } else if (xp >= 2500) {
      levelName = '🏆 B1 İleri Seviye (Gramer Şampiyonu)';
    } else if (xp >= 1600) {
      levelName = '⭐ B1 Orta Seviye (Cümle Ustası)';
    } else if (xp >= 800) {
      levelName = '🌟 A2 Gelişmiş Seviye (Kararlı Öğrenci)';
    } else if (xp >= 300) {
      levelName = '✨ A2 Temel Seviye';
    }

    // 3 Kriterli Genel Büyük Ödül İlerlemesi: XP (%33) + 158 Kelime (%33) + 22 Video (%34)
    const xpProg = Math.min(100, Math.round((xp / 3500) * 100));
    const wordProg = Math.min(100, Math.round((masteredCount / (totalVerbsCount || 158)) * 100));
    const vidProg = Math.min(100, Math.round((watchedVideos.length / (allLessons.length || 22)) * 100));
    const rewardProgress = Math.round((xpProg + wordProg + vidProg) / 3);

    return {
      date: new Date().toLocaleDateString('tr-TR'),
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      parentEmail: this.parentEmail,
      studentName: this.studentName,
      xp,
      levelName,
      streak,
      studyTimeString,
      totalStudyMinutes: this.totalStudyMinutes,
      totalVerbsCount,
      masteredCount,
      masteredPercent,
      masteredList,
      customWordsCount: customWords.length,
      customMastered,
      watchedVideosCount: watchedVideos.length,
      watchedLessonsList,
      totalLessonsCount: allLessons.length,
      errorsList,
      rewardProgress
    };
  }

  /**
   * E-Posta İçin Düz Metin Formatı (E-posta istemcisi ve WhatsApp için)
   */
  generateEmailPlainText() {
    const data = this.getReportData();

    let text = `📊 [İNGİLİZCE CÜMLE FABRİKASI] GELİŞİM VE BAŞARI RAPORU\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `👤 Öğrenci: ${data.studentName}\n`;
    text += `📅 Rapor Tarihi: ${data.date} - ${data.time}\n`;
    text += `📧 Alıcı Veli: ${data.parentEmail}\n\n`;

    text += `🌟 GENEL DURUM VE SKOR KARTI\n`;
    text += `─────────────────────────────────────────────\n`;
    text += `• Toplam Kazanılan XP: ${data.xp} / 3500 XP\n`;
    text += `• Mevcut Dil Seviyesi: ${data.levelName}\n`;
    text += `• Kesintisiz Günlük Seri: 🔥 ${data.streak} Gün\n`;
    text += `• Toplam Aktif Çalışma Süresi: ⏱️ ${data.studyTimeString}\n`;
    text += `• Babandan Nihai Büyük Ödül İlerlemesi: %${data.rewardProgress} (Şartlar: 3500 XP + 158/158 Kelime + 22/22 Video)\n\n`;

    text += `📚 KELİME HAZNESİ VE ÖĞRENİLEN FİİLLER\n`;
    text += `─────────────────────────────────────────────\n`;
    text += `• Müfredat İlerlemesi: ${data.masteredCount} / ${data.totalVerbsCount} Fiil (%${data.masteredPercent})\n`;
    if (data.customWordsCount > 0) {
      text += `• Kendi Kelime Defteri: ${data.customMastered} / ${data.customWordsCount} Kelime Ezberlendi\n`;
    }
    if (data.masteredList.length > 0) {
      text += `• Son Öğrenilen Fiiller:\n`;
      data.masteredList.slice(0, 10).forEach((v, i) => {
        text += `   ${i + 1}. ${v.verb} (${v.level}): ${v.meaning} [V2: ${v.forms?.v2 || '-'}, V3: ${v.forms?.v3 || '-'}]\n`;
      });
      if (data.masteredList.length > 10) {
        text += `   ... ve ${data.masteredList.length - 10} fiil daha.\n`;
      }
    } else {
      text += `• Henüz tamamlanmış kelime kaydedilmedi (Çalışma devam ediyor).\n`;
    }
    text += `\n`;

    text += `🎥 İZLENEN YOUTUBE EĞİTİM VİDEOLARI\n`;
    text += `─────────────────────────────────────────────\n`;
    text += `• Tamamlanan Video Sayısı: ${data.watchedVideosCount} Video\n`;
    if (data.watchedLessonsList.length > 0) {
      data.watchedLessonsList.slice(0, 8).forEach((v, i) => {
        text += `   ${i + 1}. ${v.topic} - "${v.videoTitle}" (Eğitmen: ${v.author})\n`;
      });
    } else {
      text += `• Henüz video izleme kaydı yok.\n`;
    }
    text += `\n`;

    text += `⚠️ HATA ANALİZİ VE EN ÇOK ZORLANDIĞI NOKTALAR\n`;
    text += `─────────────────────────────────────────────\n`;
    if (data.errorsList.length > 0) {
      text += `Kızınızın testlerde veya cümle kurarken takıldığı konular:\n\n`;
      data.errorsList.slice(0, 6).forEach((err, i) => {
        if (err.type === 'sentence') {
          text += `   ${i + 1}. [SVOMPT Cümle Hatası] Fiil: ${err.word}\n`;
          text += `      Hedef Cümle: "${err.targetSentence}"\n`;
          text += `      Öğrencinin Dizilimi: "${err.userAttempt}"\n`;
          text += `      İpucu/Neden: ${err.issue}\n`;
        } else {
          text += `   ${i + 1}. [Kelime/Test Yanlışı] "${err.word}" (${err.meaning})\n`;
          text += `      Verilen Yanlış Cevap: "${err.wrongAnswer}" ❌\n`;
          text += `      Doğru Karşılığı: "${err.correctAnswer || err.meaning}" ✅\n`;
          text += `      Hata Tekrarı: ${err.count} Kez\n`;
        }
        text += `\n`;
      });
    } else {
      text += `• Tebrikler! Kayıtlı belirgin bir hata bulunmuyor, dersler başarıyla devam ediyor.\n\n`;
    }

    text += `💡 VELİYE VE BABASINA PEDAGOJİK TAVSİYE\n`;
    text += `─────────────────────────────────────────────\n`;
    if (data.masteredCount < 20) {
      text += `Kızınız düzenli günlük serisini sürdürüyor. Günde 10 dakikalık 'Günlük Ders' modülünü aksatmaması kelime ezberini hızlandıracaktır.\n`;
    } else if (data.errorsList.length > 3) {
      text += `Özellikle yukarıda listelenen takıldığı kelimeler üzerinde birlikte 5 dakika pratik yapmanız ve SVOMPT diziliminde 'Fiil daima özneden sonra gelir' kuralını hatırlatmanız faydalı olacaktır.\n`;
    } else {
      text += `Kızınız çok başarılı ilerliyor! 3500 XP ve 158 kelime / 22 video büyük ödül hedefine kararlılıkla yaklaşıyor, motive edici desteğinizi sürdürün! 🌟\n`;
    }

    text += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `Bu rapor İngilizce Cümle Fabrikası & 158 Fiil Uygulaması tarafından otomatik olarak üretilmiştir.\n`;

    return text;
  }

  /**
   * E-Posta Gönderme Metodu (Mailto ve İstemci Açma)
   */
  sendEmailReport() {
    const data = this.getReportData();
    const subject = `📊 [İngilizce Cümle Fabrikası] Kızınızın Gelişim ve Başarı Raporu (${data.date})`;
    const body = this.generateEmailPlainText();

    const mailtoUrl = `mailto:${encodeURIComponent(this.parentEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Açmayı dene
    window.location.href = mailtoUrl;

    if (window.app) {
      window.app.showToast(`📧 E-posta hazırlandı (${this.parentEmail})`);
    }
  }

  /**
   * Gmail Web Üzerinden Doğrudan Gönderme
   */
  openGmailWeb() {
    const data = this.getReportData();
    const subject = `📊 [İngilizce Cümle Fabrikası] Kızınızın Gelişim ve Başarı Raporu (${data.date})`;
    const body = this.generateEmailPlainText();

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(this.parentEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, '_blank');
  }

  /**
   * WhatsApp / Mesaj Olarak Paylaş
   */
  shareReport() {
    const data = this.getReportData();
    const summaryText = `📊 *İngilizce Cümle Fabrikası - Gelişim Raporu*\n👤 Öğrenci: ${data.studentName}\n⭐ XP: ${data.xp} XP | Seviye: ${data.levelName}\n🔥 Seri: ${data.streak} Gün | ⏱️ Süre: ${data.studyTimeString}\n📚 Öğrenilen Fiil: ${data.masteredCount}/${data.totalVerbsCount} (%${data.masteredPercent})\n🎥 İzlenen Ders: ${data.watchedVideosCount} Video\n\nDetaylı rapor e-postası hazırlandı!`;

    if (navigator.share) {
      navigator.share({
        title: `İngilizce Gelişim Raporu - ${data.studentName}`,
        text: this.generateEmailPlainText()
      }).catch(() => {});
    } else {
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(summaryText + '\n\n' + this.generateEmailPlainText())}`;
      window.open(waUrl, '_blank');
    }
  }

  /**
   * Panoya Kopyala
   */
  copyReportToClipboard() {
    const text = this.generateEmailPlainText();
    navigator.clipboard.writeText(text).then(() => {
      if (window.app) {
        window.app.showToast('📋 Rapor metni başarıyla kopyalandı!');
      }
    }).catch(() => {
      if (window.app) window.app.showToast('Metin kopyalanamadı.');
    });
  }

  /**
   * Veli E-posta Ayarlarını Kaydet
   */
  saveSettings(email, name) {
    if (email && email.trim() !== '') {
      this.parentEmail = email.trim();
      localStorage.setItem('english_app_parent_email', this.parentEmail);
    }
    if (name && name.trim() !== '') {
      this.studentName = name.trim();
      localStorage.setItem('english_app_student_name', this.studentName);
    }
    if (window.app) {
      window.app.showToast('💾 Veli bilgileri güncellendi!');
    }
    this.renderModal();
  }

  setTab(tabName) {
    this.activeReportTab = tabName;
    this.renderModal();
  }

  /**
   * Veli Raporu Modalını Aç ve Render Et
   */
  openModal(defaultTab = 'summary') {
    this.activeReportTab = defaultTab;
    const modal = document.getElementById('parent-report-modal');
    if (!modal) return;
    this.renderModal();
    modal.classList.add('active');
  }

  closeModal() {
    const modal = document.getElementById('parent-report-modal');
    if (modal) modal.classList.remove('active');
  }

  renderModal() {
    const container = document.getElementById('parent-report-modal-card') || document.getElementById('parent-report-modal-content');
    if (!container) return;

    const data = this.getReportData();

    container.innerHTML = `
        <!-- Header -->
        <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1px solid var(--border-subtle); padding-bottom:12px; margin-bottom:14px;">
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:1.6rem;">👨‍👧</span>
              <div>
                <h3 style="font-size:1.25rem; font-weight:900; color:#ffffff; margin:0;">
                  Veli & Gelişim Takip Raporu
                </h3>
                <span style="font-size:0.78rem; color:var(--text-secondary);">
                  Öğrenci: <strong style="color:var(--primary);">${data.studentName}</strong> • Rapor Tarihi: ${data.date}
                </span>
              </div>
            </div>
          </div>
          <button class="icon-btn" onclick="parentReportManager.closeModal()">✕</button>
        </div>

        <!-- Tab Selector Navigation -->
        <div style="display:flex; gap:6px; overflow-x:auto; margin-bottom:16px; padding-bottom:4px; border-bottom:1px solid rgba(255,255,255,0.06);">
          <button class="cat-chip ${this.activeReportTab === 'summary' ? 'active' : ''}" style="font-size:0.8rem; padding:6px 14px;" onclick="parentReportManager.setTab('summary')">
            📊 Genel Karne
          </button>
          <button class="cat-chip ${this.activeReportTab === 'errors' ? 'active' : ''}" style="font-size:0.8rem; padding:6px 14px;" onclick="parentReportManager.setTab('errors')">
            ⚠️ Hata Analizi (${data.errorsList.length})
          </button>
          <button class="cat-chip ${this.activeReportTab === 'videos' ? 'active' : ''}" style="font-size:0.8rem; padding:6px 14px;" onclick="parentReportManager.setTab('videos')">
            🎥 Videolar (${data.watchedVideosCount})
          </button>
          <button class="cat-chip ${this.activeReportTab === 'words' ? 'active' : ''}" style="font-size:0.8rem; padding:6px 14px;" onclick="parentReportManager.setTab('words')">
            📚 Kelimeler (${data.masteredCount})
          </button>
          <button class="cat-chip ${this.activeReportTab === 'email' ? 'active' : ''}" style="font-size:0.8rem; padding:6px 14px; color:#ef4444; border-color:rgba(239,68,68,0.4);" onclick="parentReportManager.setTab('email')">
            ✉️ Mail Gönder
          </button>
        </div>

        <!-- TAB 1: SUMMARY / GENEL KARNE -->
        ${this.activeReportTab === 'summary' ? `
          <div style="display:flex; flex-direction:column; gap:14px;">
            
            <!-- Quick Stats 4-Grid -->
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap:10px;">
              <div style="background:var(--bg-surface); border:1px solid rgba(56,189,248,0.3); border-radius:var(--radius-md); padding:12px; text-align:center;">
                <div style="font-size:1.3rem;">⏱️</div>
                <div style="font-size:1.1rem; font-weight:900; color:var(--primary); margin:2px 0;">${data.studyTimeString}</div>
                <div style="font-size:0.72rem; color:var(--text-secondary);">Aktif Çalışma</div>
              </div>

              <div style="background:var(--bg-surface); border:1px solid rgba(239,68,68,0.3); border-radius:var(--radius-md); padding:12px; text-align:center;">
                <div style="font-size:1.3rem;">🔥</div>
                <div style="font-size:1.1rem; font-weight:900; color:#ef4444; margin:2px 0;">${data.streak} Gün</div>
                <div style="font-size:0.72rem; color:var(--text-secondary);">Günlük Seri</div>
              </div>

              <div style="background:var(--bg-surface); border:1px solid rgba(245,158,11,0.3); border-radius:var(--radius-md); padding:12px; text-align:center;">
                <div style="font-size:1.3rem;">⭐</div>
                <div style="font-size:1.1rem; font-weight:900; color:#f59e0b; margin:2px 0;">${data.xp} XP</div>
                <div style="font-size:0.72rem; color:var(--text-secondary);">${data.levelName.split(' ')[0]}</div>
              </div>

              <div style="background:var(--bg-surface); border:1px solid rgba(34,197,94,0.3); border-radius:var(--radius-md); padding:12px; text-align:center;">
                <div style="font-size:1.3rem;">📚</div>
                <div style="font-size:1.1rem; font-weight:900; color:var(--success); margin:2px 0;">${data.masteredCount} / ${data.totalVerbsCount}</div>
                <div style="font-size:0.72rem; color:var(--text-secondary);">Öğrenilen Fiil (%${data.masteredPercent})</div>
              </div>
            </div>

            <!-- Reward Progress Bar -->
            <div style="background:linear-gradient(135deg, rgba(30,41,59,0.9), rgba(15,23,42,0.9)); border:1px solid rgba(245,158,11,0.4); border-radius:var(--radius-md); padding:14px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span style="font-size:0.82rem; font-weight:800; color:#f59e0b;">🎁 Babandan Büyük Ödül İlerlemesi</span>
                <span style="font-size:0.8rem; font-weight:800; color:#ffffff;">%${data.rewardProgress} Tamamlandı</span>
              </div>
              <div class="quiz-progress-bar" style="margin:0; height:10px;">
                <div class="quiz-progress-fill" style="width:${data.rewardProgress}%; background:linear-gradient(90deg, #f59e0b, #ef4444);"></div>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:0.72rem; color:var(--text-secondary); margin-top:6px;">
                <span>⭐ XP: <strong>${data.xp}/3500</strong></span>
                <span>📚 Kelime: <strong>${data.masteredCount}/${data.totalVerbsCount}</strong></span>
                <span>🎥 Video: <strong>${data.watchedVideosCount}/${data.totalLessonsCount}</strong></span>
              </div>
              <div style="font-size:0.74rem; color:var(--text-muted); margin-top:6px; border-top:1px solid rgba(255,255,255,0.06); padding-top:4px;">
                Öğrenci 3500 XP'ye, 158 fiilin tamamına ve 22 video dersin hepsine ulaştığında babasından vaat edilen büyük ödülü hak edecektir.
              </div>
            </div>

            <!-- Action Buttons for Parent -->
            <div style="background:rgba(129,140,248,0.1); border:1px solid rgba(129,140,248,0.3); border-radius:var(--radius-md); padding:14px;">
              <h4 style="font-size:0.92rem; font-weight:800; color:#ffffff; margin-bottom:8px;">
                📧 Bu Raporu Babama Gönder
              </h4>
              <p style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:12px;">
                Hedef E-Posta: <strong style="color:var(--primary);">${data.parentEmail}</strong>
              </p>

              <div style="display:flex; gap:8px; flex-wrap:wrap;">
                <button class="btn-primary" style="background:#ef4444; font-size:0.82rem; padding:8px 16px;" onclick="parentReportManager.sendEmailReport()">
                  ✉️ E-Posta İstemcisinde Aç
                </button>
                <button class="btn-secondary" style="font-size:0.82rem; padding:8px 14px;" onclick="parentReportManager.openGmailWeb()">
                  🌐 Gmail Web'de Aç
                </button>
                <button class="btn-secondary" style="font-size:0.82rem; padding:8px 14px;" onclick="parentReportManager.shareReport()">
                  📱 WhatsApp / Paylaş
                </button>
                <button class="btn-secondary" style="font-size:0.82rem; padding:8px 14px;" onclick="parentReportManager.copyReportToClipboard()">
                  📋 Raporu Kopyala
                </button>
              </div>
            </div>

          </div>
        ` : ''}

        <!-- TAB 2: ERROR ANALYSIS / HATA ANALİZİ -->
        ${this.activeReportTab === 'errors' ? `
          <div>
            <div style="margin-bottom:12px;">
              <h4 style="font-size:0.95rem; font-weight:800; color:#ffffff;">⚠️ Kızınızın En Çok Zorlandığı Noktalar & Hata Kütüğü</h4>
              <p style="font-size:0.78rem; color:var(--text-secondary); margin-top:2px;">
                Sınavlarda yanlış cevaplanan kelimeler ve SVOMPT cümle kurarken yapılan dizilim hataları:
              </p>
            </div>

            ${data.errorsList.length === 0 ? `
              <div style="background:var(--bg-surface); padding:20px; text-align:center; border-radius:var(--radius-md); color:var(--success);">
                🎉 Harika! Henüz kaydedilmiş belirgin bir hata bulunmuyor.
              </div>
            ` : `
              <div style="display:flex; flex-direction:column; gap:10px;">
                ${data.errorsList.map((err, idx) => `
                  <div style="background:var(--bg-surface); border-left:4px solid ${err.type === 'sentence' ? 'var(--accent)' : 'var(--danger)'}; border-radius:var(--radius-md); padding:12px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                      <div style="display:flex; align-items:center; gap:6px;">
                        <span style="font-size:0.7rem; font-weight:800; padding:2px 6px; border-radius:4px; background:${err.type === 'sentence' ? 'rgba(129,140,248,0.2)' : 'rgba(239,68,68,0.2)'}; color:${err.type === 'sentence' ? 'var(--accent)' : 'var(--danger)'};">
                          ${err.type === 'sentence' ? '🧩 SVOMPT Cümle Hatası' : '🎯 Test / Kelime Yanlışı'}
                        </span>
                        <strong style="color:#ffffff; font-size:0.92rem;">${err.word}</strong>
                        ${err.meaning ? `<span style="color:var(--text-secondary); font-size:0.8rem;">(${err.meaning})</span>` : ''}
                      </div>
                      <span style="font-size:0.72rem; color:var(--text-muted);">${err.count} Kez Tekrarlandı • ${err.lastDate}</span>
                    </div>

                    ${err.type === 'sentence' ? `
                      <div style="margin-top:6px; font-size:0.82rem;">
                        <div style="color:var(--danger); margin-top:2px;">❌ Öğrencinin Denemesi: "${err.userAttempt}"</div>
                        <div style="color:var(--success); margin-top:2px;">✅ Doğru SVOMPT Dizilimi: "${err.targetSentence}"</div>
                        ${err.issue ? `<div style="color:var(--text-secondary); font-size:0.75rem; margin-top:4px; background:rgba(0,0,0,0.2); padding:4px 8px; border-radius:4px;">💡 <strong>Neden Yanlış:</strong> ${err.issue}</div>` : ''}
                      </div>
                    ` : `
                      <div style="margin-top:6px; font-size:0.82rem; display:flex; gap:12px; flex-wrap:wrap;">
                        <span style="color:var(--danger);">❌ Seçtiği Yanlış: <strong>"${err.wrongAnswer}"</strong></span>
                        <span style="color:var(--success);">✅ Doğrusu: <strong>"${err.correctAnswer || err.meaning}"</strong></span>
                      </div>
                    `}
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        ` : ''}

        <!-- TAB 3: VIDEOS / İZLENEN DERSLER -->
        ${this.activeReportTab === 'videos' ? `
          <div>
            <div style="margin-bottom:12px;">
              <h4 style="font-size:0.95rem; font-weight:800; color:#ffffff;">🎥 İzlenen Gramer ve Ders Videoları</h4>
              <p style="font-size:0.78rem; color:var(--text-secondary); margin-top:2px;">
                Kızınızın tamamladığı video dersler ve dinlediği eğitmenler:
              </p>
            </div>

            ${data.watchedLessonsList.length === 0 ? `
              <div style="background:var(--bg-surface); padding:20px; text-align:center; border-radius:var(--radius-md); color:var(--text-muted);">
                Henüz izlenen video kaydı bulunmuyor. 'Gramer' veya 'Günlük Ders' sekmesinden ders izlendiğinde buraya eklenecektir.
              </div>
            ` : `
              <div style="display:flex; flex-direction:column; gap:8px;">
                ${data.watchedLessonsList.map((v, idx) => `
                  <div style="background:var(--bg-surface); border:1px solid rgba(239,68,68,0.3); border-radius:var(--radius-md); padding:10px 14px; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                      <span style="font-size:0.7rem; font-weight:800; color:#ef4444; background:rgba(239,68,68,0.15); padding:2px 6px; border-radius:4px;">
                        ${v.topic}
                      </span>
                      <div style="font-size:0.88rem; font-weight:800; color:#ffffff; margin-top:3px;">${v.videoTitle}</div>
                      <div style="font-size:0.75rem; color:var(--text-secondary);">👨‍🏫 Eğitmen: <strong>${v.author}</strong></div>
                    </div>
                    <span style="font-size:0.75rem; font-weight:800; color:var(--success);">✅ Tamamlandı (+10 XP)</span>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        ` : ''}

        <!-- TAB 4: WORDS / ÖĞRENİLEN KELİMELER -->
        ${this.activeReportTab === 'words' ? `
          <div>
            <div style="margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <h4 style="font-size:0.95rem; font-weight:800; color:#ffffff;">📚 Öğrenilen Fiiller ve Kelime Dağarcığı</h4>
                <p style="font-size:0.78rem; color:var(--text-secondary); margin-top:2px;">
                  158 fiilden <strong>${data.masteredCount}</strong> tanesi hafızaya alındı (%${data.masteredPercent})
                </p>
              </div>
              <span class="stat-chip" style="color:var(--success);">${data.masteredCount} Kelime</span>
            </div>

            ${data.masteredList.length === 0 ? `
              <div style="background:var(--bg-surface); padding:20px; text-align:center; border-radius:var(--radius-md); color:var(--text-muted);">
                Henüz 'Öğrenildi' olarak işaretlenen kelime yok. Fiil kartlarında 'Öğrendim' butonuna basıldığında burada listelenecektir.
              </div>
            ` : `
              <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap:8px;">
                ${data.masteredList.map(v => `
                  <div style="background:var(--bg-surface); border:1px solid rgba(34,197,94,0.3); border-radius:var(--radius-md); padding:8px 10px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                      <strong style="color:#ffffff; font-size:0.9rem;">${v.verb}</strong>
                      <span style="font-size:0.68rem; padding:1px 4px; border-radius:3px; background:rgba(255,255,255,0.1); color:var(--primary);">${v.level}</span>
                    </div>
                    <div style="font-size:0.78rem; color:var(--success); margin-top:2px;">🇹🇷 ${v.meaning}</div>
                    <div style="font-size:0.7rem; color:var(--text-muted); margin-top:2px;">V2: ${v.forms?.v2 || '-'} • V3: ${v.forms?.v3 || '-'}</div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        ` : ''}

        <!-- TAB 5: EMAIL SETTINGS & SEND -->
        ${this.activeReportTab === 'email' ? `
          <div style="display:flex; flex-direction:column; gap:14px;">
            <div style="background:var(--bg-surface); padding:16px; border-radius:var(--radius-md); border:1px solid var(--border-subtle);">
              <h4 style="font-size:0.95rem; font-weight:800; color:#ffffff; margin-bottom:6px;">
                ⚙️ Veli İletişim Bilgileri
              </h4>
              <p style="font-size:0.78rem; color:var(--text-secondary); margin-bottom:12px;">
                Raporların gönderileceği veli e-posta adresini ve öğrenci ismini buradan değiştirebilirsiniz:
              </p>

              <div style="display:flex; flex-direction:column; gap:10px;">
                <div>
                  <label style="font-size:0.78rem; color:var(--text-secondary); display:block; margin-bottom:4px;">
                    📧 Veli E-Posta Adresi:
                  </label>
                  <input type="email" id="parent-email-input" class="select-input" value="${data.parentEmail}" placeholder="ornek@gmail.com">
                </div>

                <div>
                  <label style="font-size:0.78rem; color:var(--text-secondary); display:block; margin-bottom:4px;">
                    👤 Öğrenci Adı:
                  </label>
                  <input type="text" id="parent-student-input" class="select-input" value="${data.studentName}" placeholder="Kızımın Adı">
                </div>

                <div style="display:flex; justify-content:flex-end; margin-top:4px;">
                  <button class="btn-primary" style="padding:6px 14px; font-size:0.8rem;" 
                          onclick="parentReportManager.saveSettings(document.getElementById('parent-email-input').value, document.getElementById('parent-student-input').value)">
                    💾 Bilgileri Kaydet
                  </button>
                </div>
              </div>
            </div>

            <!-- Fast Send Card -->
            <div style="background:linear-gradient(135deg, rgba(239,68,68,0.15), rgba(15,23,42,0.9)); border:2px solid #ef4444; border-radius:var(--radius-md); padding:16px;">
              <h4 style="font-size:1rem; font-weight:900; color:#ffffff; margin-bottom:4px;">
                🚀 Anında Gelişim Raporunu Gönder
              </h4>
              <p style="font-size:0.82rem; color:#cbd5e1; margin-bottom:14px;">
                Tüm çalışma sürelerini, izlenen konuları ve yapılan hata analizlerini içeren raporu <strong>${data.parentEmail}</strong> adresine tek tıkla iletin.
              </p>

              <div style="display:flex; gap:8px; flex-wrap:wrap;">
                <button class="btn-primary" style="background:#ef4444; padding:10px 18px; font-size:0.88rem;" onclick="parentReportManager.sendEmailReport()">
                  📧 E-Posta Gönder (${data.parentEmail})
                </button>
                <button class="btn-secondary" style="padding:10px 16px; font-size:0.85rem;" onclick="parentReportManager.openGmailWeb()">
                  🌐 Gmail Web'de Aç
                </button>
                <button class="btn-secondary" style="padding:10px 16px; font-size:0.85rem;" onclick="parentReportManager.shareReport()">
                  📱 WhatsApp / Paylaş
                </button>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Modal Footer -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px; border-top:1px solid var(--border-subtle); padding-top:12px;">
          <button class="btn-secondary" style="padding:6px 12px; font-size:0.78rem;" onclick="parentReportManager.copyReportToClipboard()">
            📋 Raporu Metin Olarak Kopyala
          </button>
          <button class="btn-primary" style="padding:6px 16px; font-size:0.8rem;" onclick="parentReportManager.closeModal()">
            Kapat
          </button>
        </div>
    `;
  }
}

// Global instance
window.parentReportManager = new ParentReportManager();
