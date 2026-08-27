# 📱 İngilizce Cümle Fabrikası & 80 Fiil (Android APK & PWA)

Bu proje; 80+ Fiil, 17 Modül Gramer, Canlı SVOMPT Cümle Kurma Fabrikası, Türkçe Çevirili YouTube Ders Videoları, 10 Bölümlük Ela Hikayesi ve Sınav Arenasını içeren gelişmiş bir İngilizce öğrenim platformudur.

---

## ⚡ En Kolay Yöntem: GitHub ile Otomatik APK İndirme & Güncelleme

Artık bilgisayarınızda Android Studio veya Java kurulu olmasına gerek yok! **GitHub Actions** sistemi sizin için APK'yı bulutta otomatik derler.

### 📥 1. APK'yı Doğrudan Telefonunuza İndirin:
1. Telefonunuzun tarayıcısından projenin **Releases** sayfasına gidin:
   👉 **[GitHub Releases Sayfası](https://github.com/aocerrah/ingilizce-cumle-fabrikasi/releases)**
2. En üstteki sürümden **`Ingilizce_Cumle_Fabrikasi.apk`** dosyasına dokunup indirin ve kurun.

---

### 🔄 2. İstediğiniz Zaman Güncelleme Yapmak (Tek Komutla):
Uygulamada bir değişiklik yaptığınızda (yeni kelime, ders, tasarım vb.), sadece şu 3 adımı terminalde çalıştırmanız yeterlidir:

```bash
git add .
git commit -m "Yeni guncelleme"
git push
```

**Ne Olur?**
- GitHub otomatik olarak devreye girer (1-2 dakika içinde).
- Yeni APK'yı derler ve **[GitHub Releases](https://github.com/aocerrah/ingilizce-cumle-fabrikasi/releases)** ve **[GitHub Actions](https://github.com/aocerrah/ingilizce-cumle-fabrikasi/actions)** sayfasına yükler.
- Telefonunuzdan tekrar indirerek tek tıkla uygulamanızı güncelleyebilirsiniz!

---

## 🌐 Seçenek 2: Anında Telefona Yükleme (PWA / Web - Kurulumsuz)

1. **Yerel Sunucuyu Başlatın:**
   ```bash
   npm start
   ```
2. **Telefonunuzdan Açın:**
   - Bilgisayarınızın yerel IP adresiyle (örneğin: `http://192.168.1.X:8080`) telefonunuzun **Google Chrome** tarayıcısından sayfayı açın.
3. **Ana Ekrana Ekleyin:**
   - Chrome'da sağ üstteki **üç noktaya (⋮)** dokunun -> **"Ana Ekrana Ekle"** veya **"Uygulamayı Yükle"** deyin.

---

## 💻 Geliştirici Komutları

```bash
# Web değişikliklerini Android klasörüne senkronize etme:
npm run sync

# Yerel test sunucusunu başlatma:
npm start

# Android Studio'da açmak isterseniz:
npm run cap:open
```
