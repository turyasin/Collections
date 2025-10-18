# Ödeme Takip Uygulaması - Bağımsız Kullanım Rehberi

## 🎯 Genel Bakış

Bu uygulamayı Emergent platformundan bağımsız olarak kullanmanın 3 yolu var:

1. **GitHub + Deployment Platformu** (En Kolay - Önerilen)
2. **Docker ile Paketleme** (Orta - Her yerde çalışır)
3. **Manuel Kurulum** (İleri Seviye - Tam kontrol)

---

## ✅ YÖNTEM 1: GitHub + Deployment (ÖNERİLEN)

### Adım 1: GitHub'a Kaydet

1. Emergent arayüzünde **"Save to GitHub"** butonuna tıklayın
2. GitHub hesabınızla bağlantı kurun
3. Repository adı girin (örn: `odeme-takip-uygulamasi`)
4. "Public" veya "Private" seçin
5. Kaydet'e tıklayın

### Adım 2: Gerekli Hesapları Açın

**MongoDB Atlas (Ücretsiz 512MB):**
```
1. https://www.mongodb.com/cloud/atlas/register adresine gidin
2. Ücretsiz hesap oluşturun
3. "Build a Database" → "Free" seçin
4. Cluster oluşturun
5. Database Access: Kullanıcı adı/şifre oluşturun
6. Network Access: "0.0.0.0/0" ekleyin (herkese açık)
7. "Connect" → "Connect your application"
8. Connection string'i kopyalayın:
   mongodb+srv://username:password@cluster.xxxxx.mongodb.net/
```

**SendGrid (Ücretsiz 100 email/gün):**
```
1. https://signup.sendgrid.com/ adresine gidin
2. Hesap oluşturun
3. Settings → API Keys → Create API Key
4. "Full Access" seçin
5. API Key'i kopyalayın (SG.xxxxx...)
```

### Adım 3: Deployment Platformu Seçin

#### SEÇENEK A: Vercel (Frontend) + Railway (Backend) - ÜCRETSİZ

**Frontend Deploy (Vercel):**
```
1. https://vercel.com adresine gidin
2. "Import Git Repository" → GitHub repo seçin
3. Root Directory: "frontend"
4. Framework Preset: "Create React App"
5. Environment Variables:
   REACT_APP_BACKEND_URL = https://sizin-backend-url.railway.app
6. Deploy'a tıklayın
```

**Backend Deploy (Railway):**
```
1. https://railway.app adresine gidin
2. "New Project" → "Deploy from GitHub repo"
3. Repository'yi seçin
4. "Add Service" → "MongoDB" ekleyin
5. Backend servisine Environment Variables ekleyin:
   
   MONGO_URL = mongodb://mongo:27017  (Railway otomatik)
   DB_NAME = fatura_takip
   CORS_ORIGINS = https://sizin-frontend.vercel.app
   SENDGRID_API_KEY = SG.xxxxx...
   ADMIN_EMAIL = turyasin@gmail.com
   SECRET_KEY = rastgele-guvenli-anahtar-123456

6. Start Command: uvicorn server:app --host 0.0.0.0 --port $PORT
7. Deploy'a tıklayın
8. URL'i kopyalayın ve Vercel'deki REACT_APP_BACKEND_URL'e ekleyin
```

**Toplam Maliyet:** $0/ay (Hobby projeler için yeterli)

---

#### SEÇENEK B: Heroku (Tek Platform) - $7/ay

```
1. https://heroku.com adresine gidin
2. Yeni hesap oluşturun
3. "New" → "Create new app"
4. App adı girin

Frontend için:
- Buildpack: nodejs
- Root: frontend/

Backend için:
- Buildpack: python
- Root: backend/
- MongoDB: "Heroku MongoDB" addon ekleyin

5. Config Vars (Environment Variables) ekleyin
6. GitHub'a bağlayın ve deploy edin
```

---

#### SEÇENEK C: DigitalOcean Droplet - $4/ay

```
1. https://digitalocean.com adresine gidin
2. "$200 ücretsiz kredi" kampanyasından yararlanın
3. "Create Droplet" → Ubuntu 22.04 seçin
4. $4/ay plan seçin
5. SSH ile bağlanın

Kurulum:
```bash
# Gerekli yazılımları yükle
sudo apt update
sudo apt install -y nodejs npm python3 python3-pip mongodb nginx

# Projeyi klonla
git clone https://github.com/kullanici-adiniz/odeme-takip-uygulamasi.git
cd odeme-takip-uygulamasi

# Backend kurulum
cd backend
pip3 install -r requirements.txt
# .env dosyasını düzenle
nano .env

# Backend'i çalıştır (arka planda)
nohup uvicorn server:app --host 0.0.0.0 --port 8001 &

# Frontend kurulum
cd ../frontend
npm install
npm run build

# Nginx yapılandır
sudo nano /etc/nginx/sites-available/default
# (Nginx config ekle)

sudo systemctl restart nginx
```
```

---

## 🐳 YÖNTEM 2: Docker ile Paketleme

Docker kullanarak uygulamayı her yerde çalıştırabilirsiniz.

### Dockerfile'ları Oluştur

Ben sizin için hazır Docker dosyaları oluşturayım mı? (Evet derseniz hazırlayabilirim)

**Avantajları:**
- Tek komutla çalıştırma
- Tüm bağımlılıklar dahil
- Windows, Mac, Linux'ta aynı şekilde çalışır
- Kendi sunucunuzda veya cloud'da çalıştırın

**Kullanım:**
```bash
# Uygulamayı başlat
docker-compose up -d

# Durdur
docker-compose down
```

---

## 🔧 YÖNTEM 3: Manuel Kurulum (Kendi Bilgisayarınızda)

### Gereksinimler:
- Node.js 18+ (Frontend için)
- Python 3.10+ (Backend için)
- MongoDB (Veritabanı için)

### Kurulum Adımları:

**1. Projeyi İndirin:**
```bash
# GitHub'dan klonlayın
git clone https://github.com/kullanici-adiniz/odeme-takip-uygulamasi.git
cd odeme-takip-uygulamasi
```

**2. MongoDB Kurun ve Başlatın:**
```bash
# Ubuntu/Debian:
sudo apt-get install -y mongodb
sudo systemctl start mongodb

# macOS:
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Windows:
# https://www.mongodb.com/try/download/community adresinden indirin
```

**3. Backend Kurulum:**
```bash
cd backend

# Virtual environment oluştur (önerilen)
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Bağımlılıkları yükle
pip install -r requirements.txt

# .env dosyasını düzenle
nano .env
# Şunları ekleyin:
MONGO_URL=mongodb://localhost:27017
DB_NAME=fatura_takip
CORS_ORIGINS=http://localhost:3000
SENDGRID_API_KEY=SG.xxxxx...
ADMIN_EMAIL=turyasin@gmail.com
SECRET_KEY=rastgele-guvenli-anahtar

# Sunucuyu başlat
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

**4. Frontend Kurulum (yeni terminal):**
```bash
cd frontend

# Bağımlılıkları yükle
npm install
# veya
yarn install

# .env dosyasını düzenle
nano .env
# Şunu ekleyin:
REACT_APP_BACKEND_URL=http://localhost:8001

# Uygulamayı başlat
npm start
# veya
yarn start
```

**5. Tarayıcıda Açın:**
```
http://localhost:3000
```

---

## 📱 Mobil Erişim (Bonus)

Eğer uygulamanızı mobil cihazdan erişilebilir hale getirmek isterseniz:

1. **ngrok** kullanın (test için):
```bash
ngrok http 3000
```

2. **Gerçek domain** alın:
- Namecheap, GoDaddy'den domain alın (~$10/yıl)
- Cloudflare DNS kullanın (ücretsiz SSL)
- Deployment platformunuza bağlayın

---

## 💡 HANGİ YÖNTEMI SEÇMELİYİM?

| Durum | Önerilen Yöntem |
|-------|----------------|
| **Hızlı test etmek istiyorum** | Manuel kurulum (kendi bilgisayarınız) |
| **Ücretsiz online kullanmak istiyorum** | Vercel + Railway |
| **Profesyonel kullanım, az maliyet** | DigitalOcean Droplet |
| **Taşınabilir, her yerde çalışsın** | Docker |
| **Kolayca paylaşmak istiyorum** | GitHub + Vercel/Railway |

---

## ⚠️ ÖNEMLİ NOTLAR

1. **Güvenlik:**
   - `.env` dosyalarını GitHub'a yüklemeyin
   - Production'da güçlü SECRET_KEY kullanın
   - CORS_ORIGINS'i sadece kendi domain'inizle sınırlandırın

2. **Backup:**
   - MongoDB veritabanınızı düzenli yedekleyin
   - GitHub'a kod yedeklemesi yapın

3. **Maliyet:**
   - Ücretsiz planlar hobby projeler için yeterli
   - Profesyonel kullanım: ~$10-20/ay
   - Yüksek trafik: ~$50+/ay

---

## 🆘 Sorun Giderme

**Backend başlamıyor:**
- MongoDB'nin çalıştığından emin olun: `sudo systemctl status mongodb`
- Port 8001 kullanımda mı: `lsof -i :8001`

**Frontend backend'e bağlanmıyor:**
- REACT_APP_BACKEND_URL doğru mu?
- CORS ayarları doğru mu?
- Backend "/api" prefix'i var mı?

**Email gönderilmiyor:**
- SendGrid API key doğru mu?
- SendGrid hesabı aktif mi?

---

## 📞 Destek

Herhangi bir sorunuz varsa:
1. GitHub Issues açın
2. Dokumentasyonu kontrol edin
3. Emergent support'a yazın

---

**Başarılar! 🚀**
