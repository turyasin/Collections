# ✅ Windows'ta Docker ile Çalıştırma - Kesin Çözüm

## Sorun: .env.docker dosyası bulunamıyor veya boş

### 🎯 EN KOLAY ÇÖZÜM: .env.docker Olmadan Çalıştırın!

Docker Compose'u environment variables olmadan çalıştırabiliriz.

---

## ADIM ADIM ÇÖZÜM

### 1️⃣ PowerShell'i Yönetici Olarak Açın

- Windows tuşuna basın
- "PowerShell" yazın
- Sağ tık → "Yönetici olarak çalıştır"

### 2️⃣ Proje Klasörüne Gidin

```powershell
cd C:\Projeler_AI
```

### 3️⃣ docker-compose.yml Dosyasını Güncelleyin

Aşağıdaki komutu **tek seferde** kopyalayıp PowerShell'e yapıştırın:

```powershell
$dockerCompose = @"
version: '3.8'

services:
  # MongoDB Database
  mongodb:
    image: mongo:7.0
    container_name: odeme-takip-mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=fatura_takip
    networks:
      - odeme-takip-network

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: odeme-takip-backend
    restart: unless-stopped
    ports:
      - "8001:8001"
    depends_on:
      - mongodb
    environment:
      - MONGO_URL=mongodb://mongodb:27017
      - DB_NAME=fatura_takip
      - CORS_ORIGINS=http://localhost:3000
      - SENDGRID_API_KEY=your-sendgrid-api-key-here
      - ADMIN_EMAIL=turyasin@gmail.com
      - SECRET_KEY=jK9mPq3nV7rTx2wZsL6cFh4yGb8nMp5qRt1uWv9xYz3a
    networks:
      - odeme-takip-network

  # Frontend Application
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: odeme-takip-frontend
    restart: unless-stopped
    ports:
      - "3000:3000"
    depends_on:
      - backend
    environment:
      - REACT_APP_BACKEND_URL=http://localhost:8001
    networks:
      - odeme-takip-network

volumes:
  mongodb_data:
    driver: local

networks:
  odeme-takip-network:
    driver: bridge
"@

# Dosyayı oluştur
[System.IO.File]::WriteAllText("$PWD\docker-compose.yml", $dockerCompose, [System.Text.Encoding]::UTF8)

Write-Host "✅ docker-compose.yml güncellendi!" -ForegroundColor Green
```

### 4️⃣ SendGrid API Key Ekleyin (Opsiyonel)

**Eğer email bildirimi istiyorsanız:**

```powershell
# SendGrid key'inizi buraya yazın
$sendgridKey = "SG.BURAYA-SENDGRID-KEYINIZI-YAZIN"

# docker-compose.yml'i güncelle
(Get-Content docker-compose.yml) -replace 'SENDGRID_API_KEY=your-sendgrid-api-key-here', "SENDGRID_API_KEY=$sendgridKey" | Set-Content docker-compose.yml

Write-Host "✅ SendGrid API Key eklendi!" -ForegroundColor Green
```

**Email bildirimi şu an için gerekli değil, sonra da ekleyebilirsiniz.**

### 5️⃣ Docker'ı Başlatın

```powershell
# Artık basit komut:
docker-compose up -d
```

**İşte bu kadar!** .env.docker dosyasına gerek yok!

---

## ✅ Başarılı Çıktı

Terminalde şunu göreceksiniz:

```
[+] Building 150.2s (25/25) FINISHED
[+] Running 4/4
 ✔ Network odeme-takip-network       Created
 ✔ Container odeme-takip-mongodb     Started
 ✔ Container odeme-takip-backend     Started
 ✔ Container odeme-takip-frontend    Started
```

**İlk seferde 5-10 dakika sürebilir** (Docker imajları indiriliyor)

---

## 🌐 Uygulamayı Açın

Tarayıcınızda:
```
http://localhost:3000
```

🎉 **Uygulamanız çalışıyor!**

---

## 📊 Durumu Kontrol Edin

```powershell
# Çalışan container'ları gör
docker-compose ps
```

Çıktı:
```
NAME                      STATUS
odeme-takip-backend       Up
odeme-takip-frontend      Up
odeme-takip-mongodb       Up
```

Hepsi "Up" olmalı ✅

---

## 🔍 Logları Görün (Hata varsa)

```powershell
# Tüm loglar
docker-compose logs

# Sadece backend
docker-compose logs backend

# Sadece frontend
docker-compose logs frontend

# Canlı takip
docker-compose logs -f
```

---

## 🛑 Durdurmak İçin

```powershell
docker-compose down
```

---

## 🔄 Yeniden Başlatmak İçin

```powershell
docker-compose restart
```

---

## ❓ Sorun Giderme

### "Docker Desktop is not running"

**Çözüm:**
1. Docker Desktop uygulamasını açın
2. Sol altta "Engine running" yazısını bekleyin
3. Komutu tekrar çalıştırın

### "Port 3000 is already allocated"

**Çözüm:**
```powershell
# Başka bir uygulama port kullanıyor, önce durdurun
docker-compose down

# Yeniden başlatın
docker-compose up -d
```

### "Cannot connect to MongoDB"

**Çözüm:**
```powershell
# MongoDB'yi yeniden başlat
docker-compose restart mongodb

# 10 saniye bekle
Start-Sleep -Seconds 10

# Backend'i yeniden başlat
docker-compose restart backend
```

### Frontend açılmıyor

**Çözüm:**
```powershell
# Frontend loglarını kontrol et
docker-compose logs frontend

# Yeniden build et
docker-compose down
docker-compose build frontend
docker-compose up -d
```

---

## 📧 SendGrid Sonra Eklemek

Email bildirimi şimdilik çalışmayacak ama sorun değil. Daha sonra eklemek için:

1. SendGrid'den API key alın: https://signup.sendgrid.com
2. docker-compose.yml dosyasını açın (Notepad ile)
3. Bu satırı bulun:
   ```
   - SENDGRID_API_KEY=your-sendgrid-api-key-here
   ```
4. Gerçek key'inizi yazın:
   ```
   - SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
   ```
5. Kaydedin
6. Backend'i yeniden başlatın:
   ```powershell
   docker-compose restart backend
   ```

---

## 🎯 Özet: Tek Komut Kurulum

```powershell
# 1. PowerShell'i Yönetici olarak aç
# 2. Proje klasörüne git
cd C:\Projeler_AI

# 3. Docker'ı başlat (artık .env.docker gerekmez!)
docker-compose up -d

# 4. Bekle (ilk seferde 5-10 dakika)
# 5. Tarayıcıda aç
Start-Process "http://localhost:3000"
```

---

## 💡 İpuçları

- **İlk başlatma yavaş:** Docker imajları indiriliyor, normal
- **Sonraki başlatmalar hızlı:** ~30 saniye
- **Email bildirimi opsiyonel:** Şimdilik çalışır, sonra eklersiniz
- **Veriler kalıcı:** MongoDB'deki verileriniz silinmez (volume kullanılıyor)

---

## ✅ Başarı Kontrol Listesi

- [ ] Docker Desktop açık ve çalışıyor
- [ ] PowerShell yönetici modunda
- [ ] `C:\Projeler_AI` klasöründeyim
- [ ] `docker-compose up -d` çalıştırdım
- [ ] "Started" mesajlarını gördüm
- [ ] `http://localhost:3000` açıldı
- [ ] Giriş sayfasını görüyorum

**Hepsi tamamsa, TEBRİKLER! Uygulamanız bağımsız çalışıyor! 🎉**

---

## 📞 Hala Sorun Yaşıyorsanız

Bana şunları gönderin:
1. Hangi adımda hata aldınız?
2. Tam hata mesajı nedir?
3. `docker-compose ps` çıktısı
4. `docker-compose logs` çıktısı

Birlikte çözelim! 💪
