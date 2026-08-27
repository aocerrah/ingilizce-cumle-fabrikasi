# 📱 İngilizce Cümle Fabrikası & 80 Fiil (Android APK & PWA)

Bu uygulama, masaüstünüzdeki 22 adet PDF rehberindeki tüm içerikleri (80+ Fiil, Modül 1-17 Gramer, SVOMPT Cümle Kurma kuralları, Olumlu/Olumsuz/Soru yapıları, YouTube ders videoları ve 10 bölümlük Ela Hikayesi) Android telefonunuzda tam ekran ve internetsiz (offline) çalışacak şekilde sunar.

---

## 🚀 Telefonunuza Yükleme Seçenekleri

### Seçenek 1: Anında Telefona Yükleme (PWA / WebAPK - En Kolay ve Hızlı)

1. **Uygulama Sunucusunu Başlatın:**
   Terminalde bu klasör içinde şu komutu çalıştırın:
   ```bash
   npm start
   # veya
   python3 -m http.server 8080
   ```
2. **Telefonunuzdan Açın:**
   - Bilgisayarınızın yerel IP adresiyle (örneğin: `http://192.168.1.X:8080`) telefonunuzun **Google Chrome** tarayıcısından sayfayı açın.
3. **Ana Ekrana Ekleyin:**
   - Chrome'da sağ üstteki **üç noktaya (⋮)** dokunun.
   - **"Ana Ekrana Ekle"** veya **"Uygulamayı Yükle"** seçeneğini seçin.
   - Uygulama artık telefonunuzda bağımsız bir yerel uygulama simgesiyle yer alır, tam ekran açılır ve internet bağlantısı olmadan da çalışır!

---

### Seçenek 2: Android Studio ile APK Derleme (.apk Dosyası)

Eğer doğrudan fiziksel bir `.apk` yükleme paketi oluşturmak isterseniz:

1. **Gerekli Paketleri Yükleyin:**
   ```bash
   npm install
   ```
2. **Android Projesini Oluşturun ve Senkronize Edin:**
   ```bash
   npx cap add android
   npx cap sync android
   ```
3. **Android Studio'da Açın ve APK Üretin:**
   ```bash
   npx cap open android
   ```
   - Android Studio açıldığında üst menüden **Build -> Build Bundle(s) / APK(s) -> Build APK(s)** seçeneğine tıklayın.
   - Oluşan `app-debug.apk` dosyasını telefonunuza atıp kurabilirsiniz!

---

## 🎯 Uygulama İçeriği ve Özellikler

1. **🧩 Cümle Fabrikası & SVOMPT Studio:**
   - Subject 🟨 + Verb 🟦 + Object 🟩 + Manner 🟪 + Place 🟧 + Time 🟥 kuralına göre canlı olumlu, olumsuz ve soru cümleleri üretimi.
   - Kelime Sıralama (Scramble) oyunu.
   - Cümle dönüştürücü alıştırmaları.
2. **📚 80+ Fiil & Kelime Kartlığı:**
   - V1, V2, V3 formları.
   - Her fiil için Olumlu (+), Olumsuz (-) ve Soru (?) örnek cümleleri.
   - Doğal sesli telaffuz (Web Speech API TTS).
   - "Öğrendim" ve "Favori ⭐" takip sistemi.
3. **📖 17 Modül Gramer Akademisi:**
   - Modül 1'den Modül 17'ye ve LGS/9. Sınıf müfredatına kadar tüm dilbilgisi formülleri ve açıklamaları.
   - Türkçe YouTube ders videoları entegrasyonu.
4. **📜 Ela'nın Macerası (The Quest for the Lost Academy):**
   - 10 Bölümlük sürükleyici A2-B1 paralel okuma hikayesi.
   - Cümle cümle İngilizce / Türkçe paralel gösterim ve sesli dinleme.
5. **🎯 Sınav & Alıştırma Arenası:**
   - 4 Farklı test modu (Kelime anlamı, Gramer boşluk doldurma, V1/V2/V3 çekimleri ve Dinleme testi).
   - XP, günlük seri (streak) ve başarı takibi.
