# 🧾 Fatura Takip Uygulaması

Faturalarınızı, çek ödemelerinizi ve tahsilatlarınızı kolayca yönetin!

## ✨ Özellikler

### 💰 Fatura Yönetimi
- Fatura oluşturma, düzenleme, silme
- Vade tarihi takibi
- Ödeme durumu (Ödendi/Kısmi/Ödenmedi)
- Otomatik durum güncellemesi

### 📝 Çek Takibi
- **Alınan Çekler**: Müşterilerden alınan çekleri yönetin
- **Verilen Çekler**: Tedarikçilere verilen çekleri takip edin
- Vade tarihi uyarıları
- Durum takibi (Beklemede, Tahsil Edildi, Ödendi, Karşılıksız)

### 👥 Müşteri Yönetimi
- Müşteri ekleme/düzenleme
- İletişim bilgileri
- Müşteri bazlı raporlama

### 💳 Ödeme Takibi
- Çek ödemesi kaydetme
- Ödeme geçmişi
- Faturaya bağlı ödeme izleme

### 📊 Haftalık Program
- 4 haftalık ödeme takvimi
- Vadesi gelen faturalar
- Vadesi gelen çekler (alınan/verilen)
- Toplam tahsilat/ödeme özeti

### 📧 E-posta Bildirimleri
- Vade tarihinden 2 gün önce otomatik hatırlatma
- Günlük kontrol (12:00 Türkiye saati)
- SendGrid entegrasyonu

### 📱 Dashboard
- Toplam alacak/tahsilat
- Çek durumu özeti
- Fatura istatistikleri
- Son ödemeler

## 🛠️ Teknolojiler

- **Backend:** FastAPI (Python)
- **Frontend:** React + Shadcn UI
- **Veritabanı:** MongoDB
- **Bildirimler:** SendGrid
- **Dil:** %100 Türkçe
- **Para Birimi:** Türk Lirası (₺)

## 🚀 Hızlı Başlangıç

### Docker ile (Önerilen)

```bash
# Projeyi klonlayın
git clone https://github.com/kullanici-adiniz/fatura-takip-uygulamasi.git
cd fatura-takip-uygulamasi

# Environment variables ayarlayın
cp .env.docker .env.docker.local
nano .env.docker.local  # Kendi bilgilerinizi girin

# Başlatın
docker-compose --env-file .env.docker.local up -d

# Tarayıcıda açın
http://localhost:3000
```

Detaylı bilgi: [DOCKER_REHBER.md](DOCKER_REHBER.md)

### Manuel Kurulum

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8001

# Frontend (yeni terminal)
cd frontend
yarn install
yarn start
```

Detaylı bilgi: [BAGIMSIZ_KULLANIM_REHBERI.md](BAGIMSIZ_KULLANIM_REHBERI.md)

## 📖 Dokümantasyon

- **[Bağımsız Kullanım Rehberi](BAGIMSIZ_KULLANIM_REHBERI.md)** - Platform bağımsız deployment
- **[Docker Rehberi](DOCKER_REHBER.md)** - Docker ile kurulum
- **[Email Setup](EMAIL_SETUP.md)** - SendGrid yapılandırması

## 🌐 Deployment Seçenekleri

| Platform | Maliyet | Kullanım |
|----------|---------|----------|
| **Vercel + Railway** | Ücretsiz | Hobby/Test |
| **Heroku** | $7/ay | Profesyonel |
| **DigitalOcean** | $4/ay | Tam kontrol |
| **Docker (Kendi sunucu)** | Değişken | Kurumsal |

## 🔒 Güvenlik

- JWT tabanlı kimlik doğrulama
- Bcrypt şifre şifreleme
- CORS koruması
- Environment variables ile hassas bilgi yönetimi

## 💬 Destek

- GitHub Issues: Sorun bildirin
- Email: turyasin@gmail.com

## 🎯 Gelecek Özellikler

- [ ] PDF fatura oluşturma
- [ ] Excel export
- [ ] Mobil uygulama
- [ ] SMS bildirimleri
- [ ] Çoklu kullanıcı desteği
- [ ] Rol bazlı yetkilendirme
- [ ] Grafik ve raporlar

---

**Geliştirici:** Emergent Labs ile oluşturuldu  
**Sürüm:** 1.0.0  
**Son Güncelleme:** Ekim 2025

⭐ Beğendiyseniz yıldız vermeyi unutmayın!
