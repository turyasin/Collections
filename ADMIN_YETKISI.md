# Admin Yetkilendirme Sistemi

## Varsayılan Admin Kullanıcısı

**Email:** turyasin@gmail.com

Bu email adresiyle kayıt olan kullanıcı **otomatik olarak admin yetkisi** alır.

## Nasıl Çalışır?

### 1. İlk Kayıt (turyasin@gmail.com)

```
1. Giriş sayfasına gidin
2. "Hesap Oluştur" butonuna tıklayın
3. Email: turyasin@gmail.com
4. Kullanıcı adı: Yasin (veya istediğiniz)
5. Şifre: Güçlü bir şifre belirleyin
6. "Hesap Oluştur" butonuna tıklayın
```

✅ **Otomatik olarak admin yetkisiyle giriş yapacaksınız!**

### 2. Admin Paneline Erişim

Admin olduktan sonra:

1. **Kullanıcılar** sayfasına gidin
2. Kartınızda "Admin" rozeti göreceksiniz
3. Mavi çerçeve ile işaretli olacaksınız
4. Diğer kullanıcıların yetkilerini değiştirebilirsiniz

## Admin Yetkileri

### ✅ Admin Yapabilir:

- Diğer kullanıcılara admin yetkisi verebilir
- Admin yetkisini geri alabilir
- Kullanıcıların email bildirim ayarlarını yönetebilir
- Tüm kullanıcıları görebilir

### ❌ Normal Kullanıcı Yapamaz:

- Admin yetkisi veremez
- Bildirim ayarlarını değiştiremez
- Sadece kullanıcı listesini görebilir

## Güvenlik

### Kısıtlamalar:

1. **En az 1 admin her zaman olmalı**
   - Son admin yetkisini kaldıramazsınız
   - Sistem uyarı verir

2. **Sadece Admin Değişiklik Yapabilir**
   - Normal kullanıcılar toggle'lara tıklayamaz
   - Backend'de de kontrol var (403 Forbidden)

3. **Yasin Her Zaman Admin**
   - turyasin@gmail.com email'i otomatik admin
   - Silme veya yetki kaldırma yapılsa bile, yeniden giriş yaptığında admin olur

## Başka Kullanıcıyı Admin Yapmak

Admin olarak giriş yaptıktan sonra:

```
1. "Kullanıcılar" sayfasına gidin
2. Admin yapmak istediğiniz kullanıcının kartını bulun
3. "Admin Yetkisi" toggle'ını açın
4. Kullanıcı artık admin!
```

## Email Bildirim Yönetimi

Admin olarak kimin bildirim alacağını kontrol edersiniz:

```
1. "Kullanıcılar" sayfasına gidin
2. "Email Bildirimi" toggle'larını kullanın
3. Açık olanlar bildirim alır
4. Kapalı olanlar almaz
```

### Örnek Senaryo:

**Muhasebe Ekibi:**
- Yasin (Admin) → Bildirim Açık ✅
- Ahmet (Muhasebe) → Bildirim Açık ✅
- Ayşe (Muhasebe) → Bildirim Açık ✅
- Mehmet (Stajyer) → Bildirim Kapalı ❌

Fatura vade tarihi yaklaştığında Yasin, Ahmet ve Ayşe email alır. Mehmet almaz.

## Sorun Giderme

### "Admin yetkisi gerekli" hatası alıyorum

**Çözüm:** turyasin@gmail.com ile giriş yapın

### Admin toggle'ları değiştiremiyorum

**Kontrol Edin:**
1. Admin olarak mı giriş yaptınız?
2. Kartınızda "Admin" rozeti var mı?
3. Logout yapıp tekrar giriş yapın

### Başka admin yok, son adminim ve yetki kaldırılamıyor

**Bu Normaldir:** 
- Sistem en az 1 admin gerektirir
- Önce başka birine admin ver
- Sonra kendi yetkinizi kaldırabilirsiniz

## Test Etmek İçin

### 1. Admin Girişi (Yasin)

```
Email: turyasin@gmail.com
Şifre: [belirlediğiniz şifre]
```

### 2. Normal Kullanıcı Oluştur

```
Email: test@example.com
Kullanıcı Adı: Test User
Şifre: test123
```

### 3. Admin ile Normal Kullanıcıyı Admin Yap

1. turyasin@gmail.com ile giriş yapın
2. Kullanıcılar sayfasına gidin
3. test@example.com kullanıcısını bulun
4. Admin toggle'ını açın

### 4. İki Admin Testi

Artık her iki kullanıcı da admin!

---

**Not:** İlk kullanıcı (kim olursa olsun) otomatik admin olur. Ancak turyasin@gmail.com her zaman admin olarak kayıt olur.
