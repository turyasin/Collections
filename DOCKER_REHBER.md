# Ödeme Takip Uygulaması - Docker Kurulum Rehberi

## 🐳 Docker ile Hızlı Başlangıç

Docker kullanarak uygulamayı tek komutla çalıştırabilirsiniz!

### Ön Gereksinimler

1. **Docker Desktop** yüklü olmalı:
   - Windows/Mac: https://www.docker.com/products/docker-desktop
   - Linux: `sudo apt-get install docker.io docker-compose`

### Kurulum Adımları

#### 1. Projeyi İndirin

```bash
# GitHub'dan klonlayın
git clone https://github.com/kullanici-adiniz/odeme-takip-uygulamasi.git
cd odeme-takip-uygulamasi
```

#### 2. Environment Variables Ayarlayın

```bash
# .env.docker dosyasını düzenleyin
nano .env.docker

# veya Windows'ta:
notepad .env.docker
```

Aşağıdaki değerleri kendi bilgilerinizle değiştirin:
```
SENDGRID_API_KEY=SG.xxxxx...  # SendGrid API key'iniz
ADMIN_EMAIL=email@example.com  # Email adresiniz
SECRET_KEY=cok-guclu-rastgele-anahtar-123456789  # Güvenli bir anahtar
```

#### 3. Docker Compose ile Başlatın

```bash
# Tüm servisleri başlat (MongoDB + Backend + Frontend)
docker-compose --env-file .env.docker up -d

# Logları görüntüle
docker-compose logs -f

# Durumu kontrol et
docker-compose ps
```

#### 4. Uygulamayı Kullanın

Tarayıcınızda açın:
```
http://localhost:3000
```

Backend API:
```
http://localhost:8001
```

### Komutlar

```bash
# Uygulamayı başlat
docker-compose --env-file .env.docker up -d

# Uygulamayı durdur
docker-compose down

# Uygulamayı durdur ve verileri sil
docker-compose down -v

# Logları görüntüle
docker-compose logs -f

# Sadece backend logları
docker-compose logs -f backend

# Yeniden başlat
docker-compose restart

# Durumu kontrol et
docker-compose ps

# Container'a gir (debug için)
docker-compose exec backend bash
docker-compose exec frontend sh
```

### Veritabanı Yönetimi

```bash
# MongoDB'ye bağlan
docker-compose exec mongodb mongosh

# Veritabanını görüntüle
use fatura_takip
show collections
db.invoices.find()

# Backup al
docker-compose exec mongodb mongodump --out=/data/backup

# Restore et
docker-compose exec mongodb mongorestore /data/backup
```

### Güncellemeler

```bash
# Kodu güncelledikten sonra yeniden build et
docker-compose build

# Servisileri yeniden başlat
docker-compose up -d
```

### Sorun Giderme

**Port zaten kullanımda:**
```bash
# Başka bir port kullanın (docker-compose.yml'de değiştirin)
ports:
  - "3001:3000"  # Frontend için
  - "8002:8001"  # Backend için
```

**Container başlamıyor:**
```bash
# Logları kontrol edin
docker-compose logs backend
docker-compose logs frontend

# Container'ı yeniden build edin
docker-compose build --no-cache backend
docker-compose up -d
```

**Veritabanı bağlantı hatası:**
```bash
# MongoDB container'ının çalıştığından emin olun
docker-compose ps mongodb

# Yeniden başlatın
docker-compose restart mongodb backend
```

### Production Deployment

Production için ayrı bir docker-compose dosyası kullanın:

```bash
# Production için build et
docker-compose -f docker-compose.prod.yml build

# Production'da başlat
docker-compose -f docker-compose.prod.yml up -d
```

### Güvenlik Notları

1. **Secret Key:** Production'da güçlü bir anahtar kullanın
2. **Ports:** Public sunucuda sadece gerekli portları açın
3. **Backup:** Düzenli veritabanı yedeklemesi yapın
4. **SSL:** Production'da HTTPS kullanın (nginx + Let's Encrypt)

### Disk Alanı Yönetimi

```bash
# Kullanılmayan imajları temizle
docker system prune -a

# Volume'leri temizle (DİKKAT: Veri kaybı olur!)
docker volume prune
```

### Avantajlar

✅ Tek komutla çalıştırma
✅ Tüm bağımlılıklar dahil
✅ Her işletim sisteminde aynı şekilde çalışır
✅ Kolay backup ve restore
✅ İzole çalışma ortamı
✅ Hızlı geliştirme ve test

### Sistem Gereksinimleri

- RAM: En az 4GB (önerilen 8GB)
- Disk: En az 2GB boş alan
- CPU: 2+ core

---

**Başarılar! 🚀**

Sorular için: GitHub Issues
