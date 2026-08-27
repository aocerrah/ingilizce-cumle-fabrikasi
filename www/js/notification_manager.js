/**
 * Günlük Bildirim & Hatırlatıcı Yöneticisi (Notification & Reminder Engine)
 * Web Notifications API + Service Worker Background Notifications.
 * Alerts student multiple times a day to complete their daily English routine.
 */

class NotificationManager {
  constructor() {
    this.hasPermission = 'Notification' in window && Notification.permission === 'granted';
    this.reminders = [
      { hour: 10, minute: 30, title: "🌅 Günün 5 İngilizce Kelimesi Hazır!", body: "Hemen 10 dakikalık günlük rutini tamamla, serini koru!" },
      { hour: 16, minute: 0, title: "🧩 Ela Cümle Fabrikasında Seni Bekliyor!", body: "Birkaç cümle kurup XP toplayarak babandan ödüle yaklaş!" },
      { hour: 20, minute: 0, title: "🔥 Günlük Serin Bozulmasın!", body: "Günün bitmesine az kaldı! Bugünkü zorunlu testini çöz ve +15 XP kazan! 🎁" }
    ];

    this.init();
  }

  init() {
    this.checkPermissionStatus();
    this.startBackgroundTimer();
  }

  checkPermissionStatus() {
    if ('Notification' in window) {
      this.hasPermission = Notification.permission === 'granted';
    }
  }

  async requestPermission() {
    if (!('Notification' in window)) {
      alert('Tarayıcınız bildirim özelliğini desteklemiyor.');
      return false;
    }

    try {
      const perm = await Notification.requestPermission();
      this.hasPermission = perm === 'granted';
      if (this.hasPermission) {
        if (window.app) window.app.showToast("🔔 Günlük hatırlatıcı bildirimler açıldı!");
        this.sendNotification("🎉 Bildirimler Aktif Edildi!", "Her gün çalışma saatlerinde sana eğlenceli hatırlatmalar göndereceğiz!");
      }
      if (window.app) window.app.renderHome();
      return this.hasPermission;
    } catch (e) {
      console.log('Notification permission error:', e);
      return false;
    }
  }

  sendNotification(title, body) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const options = {
      body: body,
      icon: './manifest.json',
      badge: './manifest.json',
      vibrate: [200, 100, 200]
    };

    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification(title, options);
        });
      } else {
        new Notification(title, options);
      }
    } catch (e) {
      console.log('Notification send error:', e);
    }
  }

  startBackgroundTimer() {
    // Check every 15 minutes if it matches any scheduled reminder
    setInterval(() => {
      if (!this.hasPermission) return;
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();

      for (const r of this.reminders) {
        if (h === r.hour && Math.abs(m - r.minute) <= 15) {
          const lastSentKey = `english_notif_sent_${r.hour}_${now.toDateString()}`;
          if (!localStorage.getItem(lastSentKey)) {
            localStorage.setItem(lastSentKey, 'true');
            this.sendNotification(r.title, r.body);
          }
        }
      }
    }, 1000 * 60 * 15);
  }

  sendTestNotification() {
    if (!this.hasPermission) {
      this.requestPermission().then(granted => {
        if (granted) {
          this.sendNotification("🔔 Ela İngilizce Hatırlatıcısı", "Harika! Telefon bildirimleri sorunsuz çalışıyor. Çalışma zamanı gelince seni uyaracağız!");
        }
      });
    } else {
      this.sendNotification("🔔 Ela İngilizce Hatırlatıcısı", "Harika! Telefon bildirimleri sorunsuz çalışıyor. Çalışma zamanı gelince seni uyaracağız!");
      if (window.app) window.app.showToast("🔔 Test bildirimi gönderildi!");
    }
  }
}

// Global instance
window.notificationManager = new NotificationManager();
