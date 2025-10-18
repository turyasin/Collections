# Windows Docker Sorun Giderme

## Hata: "unexpected character in variable name"

Bu hata Windows satır sonları (CRLF) nedeniyle oluşur.

### ✅ ÇÖZÜM 1: Dosyayı Yeniden Oluşturun (Önerilen)

#### Windows PowerShell'de:

```powershell
# Projenizin klasörüne gidin
cd C:\Projeler_AI

# Eski dosyayı silin
Remove-Item .env.docker -ErrorAction SilentlyContinue

# Yeni dosya oluşturun (tek komut)
@"
SENDGRID_API_KEY=your-sendgrid-api-key-here
ADMIN_EMAIL=turyasin@gmail.com
SECRET_KEY=super-gizli-anahtar-12345-degistirin
"@ | Out-File -FilePath .env.docker -Encoding utf8 -NoNewline

Write-Host "✅ .env.docker dosyası oluşturuldu!"
```

#### Veya Not Defteri ile:

1. Notepad++ veya VSCode açın (Normal Notepad KULLANMAYIN!)
2. Yeni dosya oluşturun
3. Aşağıdaki içeriği kopyalayıp yapıştırın:

```
SENDGRID_API_KEY=your-sendgrid-api-key-here
ADMIN_EMAIL=turyasin@gmail.com
SECRET_KEY=super-gizli-anahtar-12345-degistirin
```

4. "Farklı Kaydet" → Dosya adı: `.env.docker`
5. "Kodlama" → **UTF-8** seçin
6. `C:\Projeler_AI` klasörüne kaydedin

---

### ✅ ÇÖZÜM 2: Satır Sonlarını Düzeltin

#### VSCode ile:

1. `.env.docker` dosyasını VSCode'da açın
2. Sağ altta "CRLF" yazısını göreceksiniz
3. Üzerine tıklayın
4. "LF" seçin
5. Kaydedin (Ctrl+S)

#### Notepad++ ile:

1. `.env.docker` dosyasını Notepad++'da açın
2. Menü → Edit → EOL Conversion → Unix (LF)
3. Kaydedin

---

### ✅ ÇÖZÜM 3: Git ile Düzeltin

```bash
# Git Bash açın (PowerShell değil!)
cd /c/Projeler_AI

# Satır sonlarını düzelt
dos2unix .env.docker

# Eğer dos2unix yoksa:
sed -i 's/\r$//' .env.docker
```

---

## Doğru .env.docker İçeriği

Dosyanız **TAM OLARAK** şöyle olmalı (boşluklar önemli!):

```
SENDGRID_API_KEY=your-sendgrid-api-key-here
ADMIN_EMAIL=turyasin@gmail.com
SECRET_KEY=super-gizli-anahtar-12345-degistirin
```

**ÖNEMLİ NOTLAR:**
- Her satır `KEY=VALUE` formatında
- `=` işaretinin etrafında boşluk YOK
- Tırnak işareti YOK
- Her satırın sonunda fazladan boşluk YOK
- Son satırdan sonra boş satır YOK

---

## SendGrid API Key Nasıl Alınır?

Henüz almadıysanız:

1. https://signup.sendgrid.com adresine gidin
2. Ücretsiz hesap oluşturun
3. Email doğrulaması yapın
4. Dashboard → Settings → API Keys
5. "Create API Key" butonuna tıklayın
6. İsim verin: "OdemeTakip"
7. "Full Access" seçin
8. "Create & View" tıklayın
9. API key'i kopyalayın (SG. ile başlar)
10. `.env.docker` dosyasına yapıştırın

**Örnek:**
```
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxx
ADMIN_EMAIL=turyasin@gmail.com
SECRET_KEY=jK9mPq3nV7rTx2wZsL6cFh4yGb8nMp5qRt1uWv9xYz3a
```

---

## Secret Key Nasıl Oluşturulur?

PowerShell'de:
```powershell
# Rastgele güvenli anahtar oluştur
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

Çıktıyı kopyalayıp SECRET_KEY'e yapıştırın.

---

## Docker Compose Komutunu Tekrar Çalıştırın

```powershell
# Projenizin klasörüne gidin
cd C:\Projeler_AI

# .env.docker dosyasını kontrol edin
Get-Content .env.docker

# Docker compose başlatın
docker-compose --env-file .env.docker up -d
```

---

## Başarılı Çıktı Şöyle Olmalı:

```
Creating network "projeler_ai_odeme-takip-network" ... done
Creating odeme-takip-mongodb ... done
Creating odeme-takip-backend ... done
Creating odeme-takip-frontend ... done
```

Sonra:
```
http://localhost:3000
```
adresine gidin!

---

## Hala Çalışmıyor mu?

### Kontrol Listesi:

- [ ] Docker Desktop açık mı?
- [ ] Docker Engine çalışıyor mu? (Sol altta "Engine running")
- [ ] .env.docker dosyası doğru klasörde mi? (`C:\Projeler_AI\.env.docker`)
- [ ] .env.docker içeriği doğru mu?
- [ ] PowerShell'i **Yönetici olarak** açtınız mı?

### Alternatif Komut:

Environment variables'ı doğrudan komutta verin:

```powershell
$env:SENDGRID_API_KEY="your-key-here"
$env:ADMIN_EMAIL="turyasin@gmail.com"
$env:SECRET_KEY="your-secret-key"
docker-compose up -d
```

---

## Hatanın Tam Çözümü (Kopyala-Yapıştır)

```powershell
# 1. Projenizin klasörüne gidin
cd C:\Projeler_AI

# 2. Eski dosyayı silin
if (Test-Path .env.docker) { Remove-Item .env.docker }

# 3. Yeni dosya oluşturun
$content = @"
SENDGRID_API_KEY=your-sendgrid-api-key-here
ADMIN_EMAIL=turyasin@gmail.com
SECRET_KEY=jK9mPq3nV7rTx2wZsL6cFh4yGb8nMp5qRt1uWv9xYz3a
"@

[System.IO.File]::WriteAllText("$PWD\.env.docker", $content, [System.Text.Encoding]::UTF8)

Write-Host "✅ .env.docker oluşturuldu!" -ForegroundColor Green

# 4. İçeriği kontrol edin
Write-Host "`n📄 Dosya içeriği:" -ForegroundColor Yellow
Get-Content .env.docker

# 5. SendGrid key'inizi düzenleyin
Write-Host "`n⚠️  UYARI: SendGrid API Key'inizi düzenleyin:" -ForegroundColor Red
Write-Host "notepad .env.docker" -ForegroundColor Cyan

# 6. Düzenledikten sonra Docker'ı başlatın
Write-Host "`n🚀 Düzenleme yaptıktan sonra çalıştırın:" -ForegroundColor Yellow
Write-Host "docker-compose --env-file .env.docker up -d" -ForegroundColor Cyan
```

Bu kodu PowerShell'e kopyalayıp yapıştırın. Her şeyi otomatik yapacak!

---

**Yardıma mı ihtiyacınız var?** Hata mesajını benimle paylaşın, birlikte çözelim! 🚀
