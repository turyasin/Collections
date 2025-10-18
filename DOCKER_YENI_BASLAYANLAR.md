# 🐳 Yeni Başlayanlar İçin Docker Rehberi

## Docker Nedir?

Docker, uygulamanızı bir "konteyner" içine koyar. Bu konteyner:
- ✅ Uygulamanızın tüm ihtiyaçlarını içerir (Python, Node.js, MongoDB vb.)
- ✅ Her bilgisayarda aynı şekilde çalışır
- ✅ Kurulum yapmadan tek komutla başlatılır

**Basit Anlatım:** Docker, uygulamanızı hazır bir paket haline getirir. Bu paketi açtığınızda her şey hazır çalışır!

---

## 📥 Adım 1: Docker Kurulumu

### Windows için:

**1. Docker Desktop İndirin:**
```
https://www.docker.com/products/docker-desktop
```

**2. İndirdiğiniz dosyayı çalıştırın:**
- "Docker Desktop Installer.exe" dosyasına çift tıklayın
- Kurulum sihirbazını takip edin
- "Use WSL 2 instead of Hyper-V" seçeneğini işaretleyin
- "Install" butonuna tıklayın

**3. Bilgisayarı Yeniden Başlatın**

**4. Docker Desktop'ı Açın:**
- Masaüstünde Docker ikonu olacak
- Çift tıklayın ve başlamasını bekleyin
- Sol altta "Engine running" yazısını görene kadar bekleyin

**5. Kontrol Edin:**
- Windows'ta "PowerShell" veya "Command Prompt" açın
- Şu komutu yazın:
```bash
docker --version
```
- Ekranda "Docker version 24.x.x" gibi bir yazı görmelisiniz

---

### Mac için:

**1. Docker Desktop İndirin:**
```
https://www.docker.com/products/docker-desktop
```

**2. İndirdiğiniz .dmg dosyasını açın**

**3. Docker ikonunu Applications klasörüne sürükleyin**

**4. Docker Desktop'ı Applications'dan açın**
- İlk açılışta izin isteyecek, "Allow" deyin
- "Engine running" yazısını bekleyin

**5. Kontrol Edin:**
- Terminal açın (Cmd + Space, "terminal" yazın)
- Şu komutu yazın:
```bash
docker --version
```

---

## 📂 Adım 2: Projeyi GitHub'dan İndirin

### 2.1 Git Kurulumu (Henüz yoksa)

**Windows:**
```
https://git-scm.com/download/win
```
İndirin ve kurun.

**Mac:**
Terminal'de:
```bash
xcode-select --install
```

### 2.2 Projeyi İndirin

**1. Bilgisayarınızda bir klasör açın**
Örneğin: `C:\Projeler` (Windows) veya `/Users/kullanici/Projeler` (Mac)

**2. PowerShell/Terminal açın ve o klasöre gidin:**

Windows PowerShell:
```bash
cd C:\Projeler
```

Mac Terminal:
```bash
cd ~/Projeler
```

**3. Projeyi klonlayın:**

⚠️ **ÖNEMLİ:** Önce GitHub'a kaydetmeniz gerekiyor!

Emergent'te:
1. "Save to GitHub" butonuna tıklayın
2. GitHub hesabınızla giriş yapın
3. Repository adı verin: `fatura-takip-uygulamasi`
4. "Save" deyin

Sonra terminalinizde:
```bash
git clone https://github.com/KULLANICI-ADINIZ/fatura-takip-uygulamasi.git
cd fatura-takip-uygulamasi
```

---

## ⚙️ Adım 3: Ayarları Yapın

### 3.1 Environment Variables (Ortam Değişkenleri)

Bu, uygulamanın özel bilgileridir (email, şifre vb.)

**1. `.env.docker` dosyasını açın:**

Windows:
```bash
notepad .env.docker
```

Mac:
```bash
nano .env.docker
```

**2. İçeriğini düzenleyin:**

```
SENDGRID_API_KEY=your-sendgrid-api-key-here
ADMIN_EMAIL=turyasin@gmail.com
SECRET_KEY=super-gizli-anahtar-123456-degistir
```

**Değiştirilmesi Gerekenler:**

**a) SENDGRID_API_KEY:** (Email göndermek için)
- https://signup.sendgrid.com adresine gidin
- Ücretsiz hesap açın
- Settings → API Keys → Create API Key
- Kopyalayın ve yapıştırın

**b) ADMIN_EMAIL:** 
- Kendi email adresiniz (bildirimler buraya gelir)

**c) SECRET_KEY:**
- Rastgele güçlü bir şifre yazın
- Örnek: `jK8mPq2nV5rTx9wZsL4cFh7yGb3nMp6qRt8uWv1xYz5a`

**3. Kaydedin ve Kapatın:**
- Windows Notepad: File → Save, sonra kapat
- Mac Nano: Ctrl+X, sonra Y, sonra Enter

---

## 🚀 Adım 4: Uygulamayı Başlatın!

### 4.1 İlk Başlatma

Terminal/PowerShell'de proje klasöründeyken:

```bash
docker-compose --env-file .env.docker up -d
```

**Ne Oluyor?**
- Docker otomatik olarak MongoDB, Backend, Frontend kuracak
- İlk seferde 5-10 dakika sürebilir (dosyaları indiriyor)
- `-d` = arka planda çalışsın demek

**Ekranda Görecekleriniz:**
```
Creating network "fatura-takip-uygulamasi_fatura-takip-network" ... done
Creating fatura-takip-mongodb ... done
Creating fatura-takip-backend ... done
Creating fatura-takip-frontend ... done
```

### 4.2 Durumu Kontrol Edin

```bash
docker-compose ps
```

**Görmeniz Gereken:**
```
NAME                    STATUS
fatura-takip-mongodb    Up
fatura-takip-backend    Up
fatura-takip-frontend   Up
```

Hepsi "Up" yazmalı! ✅

---

## 🌐 Adım 5: Tarayıcıda Açın

**Tarayıcınızı açın ve şu adrese gidin:**

```
http://localhost:3000
```

🎉 **Uygulamanız çalışıyor!**

- Giriş sayfasını göreceksiniz
- "Hesap Oluştur" ile kayıt olun
- Uygulamayı kullanmaya başlayın!

---

## 🛠️ Günlük Kullanım Komutları

### Uygulamayı Başlat:
```bash
docker-compose up -d
```

### Uygulamayı Durdur:
```bash
docker-compose down
```

### Logları Gör (Hata varsa):
```bash
docker-compose logs
```

### Sadece Backend Loglarını Gör:
```bash
docker-compose logs backend
```

### Yeniden Başlat:
```bash
docker-compose restart
```

---

## ❓ Sorun Giderme

### "docker: command not found"
**Sorun:** Docker kurulu değil  
**Çözüm:** Docker Desktop'ı kurun ve açın (Adım 1)

### "port is already allocated"
**Sorun:** Port zaten kullanımda  
**Çözüm:** 
```bash
# Önce çalışan uygulamayı durdurun
docker-compose down

# Sonra yeniden başlatın
docker-compose up -d
```

### "Cannot connect to the Docker daemon"
**Sorun:** Docker Desktop çalışmıyor  
**Çözüm:** Docker Desktop uygulamasını açın, "Engine running" yazısını bekleyin

### Uygulama Açılmıyor
**Kontrol Edin:**
```bash
# Servisler çalışıyor mu?
docker-compose ps

# Loglarda hata var mı?
docker-compose logs
```

### MongoDB Bağlantı Hatası
```bash
# MongoDB'yi yeniden başlat
docker-compose restart mongodb

# 10 saniye bekle, sonra backend'i başlat
docker-compose restart backend
```

---

## 🔄 Güncellemeler

Kod değişikliği yaptıysanız:

```bash
# 1. Servisleri durdurun
docker-compose down

# 2. Yeniden build edin
docker-compose build

# 3. Başlatın
docker-compose up -d
```

---

## 💾 Veritabanı Yedeği

### Yedek Alma:
```bash
docker-compose exec mongodb mongodump --out=/data/backup
```

### Yedek Geri Yükleme:
```bash
docker-compose exec mongodb mongorestore /data/backup
```

---

## 🎓 Docker Terimleri (Basit Anlatım)

| Terim | Anlamı |
|-------|--------|
| **Container** | Uygulamanın çalıştığı paket |
| **Image** | Container'ın şablonu |
| **Docker Compose** | Birden fazla container'ı yöneten araç |
| **Volume** | Verilerin saklandığı yer |
| **Port** | Uygulamanın kapısı (3000, 8001 gibi) |

---

## 📞 Yardım

Sorun yaşarsanız:

1. **Logları kontrol edin:**
```bash
docker-compose logs
```

2. **Her şeyi sıfırlayın:**
```bash
docker-compose down -v
docker-compose up -d
```

3. **GitHub Issues'da sorun bildirin**

---

## ✅ Checklist: Başarılı Kurulum

- [ ] Docker Desktop kuruldu ve çalışıyor
- [ ] Git kuruldu
- [ ] Proje GitHub'dan indirildi
- [ ] `.env.docker` dosyası düzenlendi
- [ ] `docker-compose up -d` komutu çalıştırıldı
- [ ] `docker-compose ps` ile servisler kontrol edildi
- [ ] http://localhost:3000 adresi açıldı
- [ ] Giriş yapıldı ve uygulama kullanılıyor

**Hepsi tamamsa, tebrikler! Uygulamanız artık bağımsız çalışıyor! 🎉**

---

## 🚀 Sonraki Adımlar

1. **Uzaktan Erişim İçin:**
   - Ngrok kullanın (ücretsiz)
   - Veya gerçek sunucu kiralayın (DigitalOcean)

2. **Yedekleme:**
   - Düzenli veritabanı yedeği alın
   - Kodu GitHub'da güncel tutun

3. **Güvenlik:**
   - `.env.docker` dosyasını kimseyle paylaşmayın
   - Güçlü şifreler kullanın

**Sorularınız için hazırım! 💪**
