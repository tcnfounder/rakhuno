# Rakhuno B2B: FOP muhasebecileri için yapay zekâ destekli ekstre asistanı

Yazıldığı tarih: 2026-11-23. Hedef: ayda **$2.000 net kâr**.
Veri kaynakları: GA4, GSC, Brevo, Google Ads, DataForSEO (Ukrayna) ve 23 Kasım 2026 tarihli iki pazar araştırması.
"Tahmin" yazan rakamlar doğrulanmadı.

## 1. Neden B2B, neden muhasebeci

- **FOP'a yazılım satmak zor.** Privat24, Monobank, Diia ve vergi dairesinin kabinesi temel işleri ücretsiz yapıyor. FOP yazılımının fiyatı ayda ~30–150 ₴.
  - "програма для фоп" ayda 30, "облік фоп" ayda 30 kez aranıyor.
- **Muhasebeci işten para kazanıyor.** Müşteri başına ayda 1.200–3.000 ₴ alıyor ve onlarca FOP yönetiyor.
  - Ona saat kazandıran bir araç ayda 1.000–3.000 ₴ edebilir. Bu, FOP'tan alınabilecek fiyatın 10–20 katı.
- **Muhasebeciler araç aramıyor, topluluklarda toplanıyor.** Aylık arama hacimleri:

  | Arama | Aylık |
  |---|---|
  | бухгалтер 911 | 14.800 |
  | ліга закон | 8.100 |
  | дебет кредит | 8.100 |
  | програма для бухгалтера | 20 |
  | ai для бухгалтера | 10 |

  Bu yüzden müşteri edinme Google reklamıyla değil, topluluk, sponsorlu içerik ve doğrudan iletişimle olacak.

## 2. Rakipler: ne var, boşluk nerede

| Ürün | Ne yapıyor | Bize etkisi |
|---|---|---|
| **Вчасно.Звіт** | Muhasebeci paneli, banka senkronu, limitler, vergi takvimi. FOP başına yılda ~1.232 ₴ (ikincil kaynak). | En yakın rakip. Genel bir "çoklu FOP paneli" yapmak onunla kafa kafaya yarışmak demek. |
| **Privat24 "FOP grupları"** | Muhasebeci, Privat'taki tüm müşterilerinin ekstresini ücretsiz görüyor. | Müşterileri sadece Privat'ta olan muhasebeciye satmak zor. |
| **Дебет-Кредит "ШІ-консультант", LIGA360 AI, JDOC** | Yapay zekâ ile soru-cevap ve belge OCR. | Bu alan dolu, girmeyelim. |
| Taxer, M.E.Doc, СОТА, BAS | Raporlama ve muhasebe. | Onların işine girmiyoruz, yanlarında çalışıyoruz. |

**Boşluk:**
- Birden çok bankayla çalışan müşteriler (A-Bank, PUMB, Sense, Raiffeisen, Monobank). Privat bunları göremiyor, Вчасно kısmen görüyor.
- Ekstreyi müşteriden **toplama** zahmeti.
- Dağınık PDF ve fotoğraflardan **gelir defterini** çıkarmak: gelir ile gelir olmayanı ayırmak (iade, kendi hesabına transfer, döviz satışı), döviz gelirini NBU kuruyla çevirmek.

Bu işi yapan FOP'a özel bir yapay zekâ ürünü bulamadık.

## 3. Ürün: "Виписки → книга обліку за 10 хвилин"

Muhasebecinin tek iddialı vaadi: **"Müşterilerinin ekstrelerini toplamayı ve gelir defterini sana bırak."**

### MVP (ilk sürüm, 6–8 hafta)

1. **Müşteri başına ekstre kutusu.** Müşteri ekstresini PDF, CSV, XLSX ya da fotoğraf olarak Telegram botuna veya bir yükleme linkine atıyor. Muhasebeciye her müşteri için tek bir link veriliyor.
2. **Yapay zekâ ile işlem sınıflandırma.**
   - Gelir / gelir değil, ve nedeni yazılı.
   - Döviz işlemleri o günün NBU kuruyla çevrilir. Rakhuno'daki kur ve vergi kodu yeniden kullanılır.
   - Emin olunmayan satırlar "kontrol et" olarak işaretlenir. Son kararı her zaman muhasebeci verir.
3. **Gelir defteri (книга обліку доходів):** Excel/PDF olarak dışa aktarılır, dönem toplamları hazır.
4. **Portföy paneli:** her müşteri için grup, çeyrek geliri, yıllık limitin yüzde kaçı dolduğu, yaklaşan son tarihler, eksik ekstreler.
5. **Müşteriye hatırlatma:** "Ekstreni gönder" ve "vergi ödeme günü" mesajları tutar ve ödeme bilgileriyle birlikte, Telegram ya da e-posta ile otomatik gider. Rakhuno'nun hatırlatma altyapısı kullanılır.

### Sonraki sürümler (talep görülürse)

- 3. grup çeyrek beyannamesi taslağı ve XML (F0103309) dosyası.
- Privat AutoClient API ve Monobank sağlayıcı API'si. İkisi de banka ile ortaklık anlaşması gerektiriyor.
- **2027 reform planlayıcı:** "Reform geçerse portföyündeki hangi müşteri 2. gruptan çıkar, kim KDV eşiğine yaklaşır?" sorusunu cevaplayıp müşteriye gönderilecek mektubu hazırlar. Ücretsiz bir mıknatıs olarak da kullanılabilir.
- Toplu fatura ve akt, mevcut Rakhuno kodu ile.

### Yapmayacaklarımız

ТОВ muhasebesi, maaş, ПРРО, KDV kayıtları, genel yapay zekâ soru-cevap.

## 4. Fiyat ve 15 günlük deneme

| Paket | FOP sayısı | Ay / ₴ (tahmin) |
|---|---|---|
| Старт | 15'e kadar | 690 |
| Профі | 50'ye kadar | 1.490 |
| Офіс | 150'ye kadar, 3 kullanıcı | 2.990 |

- **15 gün ücretsiz, kart istemeden.** Deneme süresinin amacı, muhasebecinin **gerçek müşterilerinin** ekstresini yükleyip bir gelir defteri çıkarması. "Aha" anı bu.
- **Denemeyi beyanname dönemlerine göre zamanla.** 3. grubun 4. çeyrek beyannamesinin son günü **9 Şubat 2027**, 1–2. grupların yıllık beyannamesi **1 Mart 2027**. Ocak'ta başlayan bir deneme tam ihtiyaç anına denk gelir.
- **Yıllık ödemede 2 ay bedava.** Ayrıca bir muhasebeci başka bir muhasebeciyi getirirse ikisi de 1 ay bedava alır.

## 5. $2.000 kâr hesabı

Varsayımlar (tahmin): 1 $ ≈ 41 ₴.

**Aylık giderler:** toplam ~$950.
- Paddle komisyonu ~%5 + işlem başına sabit ücret.
- Yapay zekâ API'si ve barındırma: ~$150.
- Yarı zamanlı Ukraynaca destek ve satış: ~$400.
- Sponsorlu içerik: ~$300.

**Gereken gelir ve müşteri sayısı:**
- Gereken gelir: ~$3.000/ay ≈ 123.000 ₴/ay.
- Ortalama paket ~1.300 ₴/ay ise **~95 ödeyen muhasebeci** gerekiyor.

**Hunide gereken sayılar** (tahmin):
- Ayda %4 kayıpla 95 müşteriyi korumak ve büyütmek için ayda ~8–10 yeni ödeyen gerekir.
- Denemeden ödemeye geçiş %20 ise ayda ~45 deneme gerekir.

**Takvim (gerçekçi):**

| Ne zaman | Ödeyen muhasebeci | Durum |
|---|---|---|
| Mart 2027 | 10 | |
| Haziran 2027 | 30–40 | |
| Aralık 2027 | 80–100 | **$2.000 kâr hedefi.** Reform geçerse daha erken. |

Hedefe 2027'nin ikinci yarısından önce ulaşmak iyimser olur.

## 6. Müşteri edinme kanalları (öncelik sırasıyla)

1. **Doğrudan iletişim (ilk 30 müşteri).**
   - Facebook ve Telegram muhasebeci grupları: Дебет-Кредит, Головбух, buhgalter911, Monobank'ın muhasebeci topluluğu.
   - Kişisel mesaj, "5 müşterinin ekstresini ücretsiz işleyelim" teklifiyle.
2. **Ukraynalı bir muhasebeci ortağı ("elçi").** 10–20 FOP'u olan bir muhasebeciye ürünü ücretsiz verip getirdiği her müşteriden %20–30 pay. Hem güven hem dil sorunu çözülür.
3. **Sponsorlu içerik ve webinar.** Дебет-Кредит, 7eminar, factor.ua, buhgalter911. Вчасно ve Checkbox'ın kullandığı, işe yaradığı görülmüş kanal bu.
4. **İçerik ve SEO (rakhuno.com).** "книга обліку доходів" ayda 480, "декларація фоп 3 група" ayda 720 aranıyor. Ayrıca reform hesaplayıcıları. Bu sayfaların sonunda "Muhasebeci misiniz?" bloğu olur.
5. **Tavsiye programı:** 1 ay bedava.

Google Ads'i bu ürün için kullanmıyoruz; arama hacmi yok.

## 7. Uygulama koşulları ve riskler

| Risk | Önlem |
|---|---|
| Dil ve güven: kurucu Ukraynaca bilmiyor, destek beyanname dönemlerinde (Şubat, Mayıs, Ağustos, Kasım) yoğunlaşıyor | Yarı zamanlı Ukraynalı destek ve muhasebeci elçi. Arayüz baştan Ukraynaca. |
| Ödeme alma: WayForPay ve LiqPay Ukrayna'da FOP/ТОВ istiyor | Paddle Ukraynalı alıcıları kabul ediyor; Türkiye'den satıcı olarak başvuru doğrulanmalı. Alternatif: Ukrayna'da bir ortak FOP. Muhasebecinin gider yazabilmesi için düzgün bir fatura/akt gerekiyor. |
| Veri: ekstrelerde karşı tarafların kişisel verileri var (Kanun No. 2297-VI) | Gizlilik politikası ve veri işleme sözleşmesi (DPA). Veriler AB'de tutulur. Kısa bir hukuki görüş alınır. Bankaya şifre istenmez, sadece dosya yüklenir. |
| Вчасно aynı özelliği ekler | Çok bankalı müşteriler ve Telegram üzerinden ekstre toplama konusunda derinleşmek, fiyatın düşük olması, hızlı destek. |
| Reform ertelenir | Ürün reforma bağlı değil, ekstre ve gelir defteri her çeyrek gerekiyor. Reform sadece ek bir fırsat. |
| Yapay zekâ yanlış sınıflandırır | Her satırda gerekçe yazılı, emin olunmayanlar işaretli, onayı muhasebeci veriyor. "Taslak" diye konumlanır. |

## 8. Doğrulama: kod yazmadan önce

**Aralık 2026 (4 hafta):**

1. **15 muhasebeciyle görüşme** (Дебет-Кредит ve 7eminar toplulukları, elçi adayı). Sorular:
   - Kaç FOP müşterin var, hangi bankalarda?
   - Ekstreyi nasıl topluyorsun?
   - Gelir defterine haftada kaç saat gidiyor?
   - Şu an ne kullanıyorsun, ne ödüyorsun?
   - Bu işi biri yapsa ayda ne öderdin?
2. **Tek sayfalık açılış sayfası** (rakhuno.com/buhgalteram): vaat, fiyat tablosu, "Pilota katıl" formu.
3. **Elle yapılan pilot ("concierge MVP"):** 3–5 muhasebecinin gerçek ekstrelerini yarı elle (betik + yapay zekâ) işleyip gelir defterini teslim et. Ürün değil, hizmet olarak.

**Devam / durdur kriteri (10 Ocak 2027):**
- **Devam:** en az 15 görüşmeden 8'i ekstre toplamayı ilk 3 dertten biri sayıyorsa, **ve** en az 3 muhasebeci ön ödeme yapıyor ya da "bitince alırım" diyorsa → MVP'yi yap.
- **Durdur:** Değilse B2B'yi bırak. Rakhuno ücretsiz araç + ortaklık geliri olarak devam eder.

## 9. Rakhuno'nun (FOP tarafının) yeni rolü

- **Ücretsiz huni olarak kalır.** Fatura, akt, hesap makinesi, hatırlatma. Bunlar SEO ve marka için var.
- **Ortaklık geliri eklenir.** Checkbox ortaklık programı ПРРО sayfasında, PUMB ve Monobank yönlendirmeleri "FOP hesabı aç" sayfasında. Ek gelir, ana iş değil.
- **Ücretli reklam kısılır.** Invoice ₺100/gün'e iner, Tax 4 Aralık kontrolüne göre karar verilir. B2B doğrulanana kadar FOP'a ücretli trafik büyütülmez.
- FOP sayfalarına "Muhasebecinize Rakhuno'yu önerin" bağlantısı eklenir.

## 10. Takvim

| Tarih | İş |
|---|---|
| 24–30 Kas | Reklam bütçesini düşür. Görüşme soru listesi ve elçi teklifi. Açılış sayfası taslağı. Paddle başvurusu. |
| 1–20 Ara | 15 görüşme. Açılış sayfası yayında. Elle pilot için 3–5 muhasebeci. Checkbox ve PUMB ortaklık başvuruları. |
| 4 Ara | Tax kampanyası kontrolü. |
| 10 Oca 2027 | **Devam / durdur kararı.** |
| Oca – 9 Şub | Devam ise: MVP + pilot muhasebecilerle 4. çeyrek beyannamesi dönemi. |
| Mart | İlk ödemeler. Sponsorlu içerik başlar. |
| Haziran | 30–40 ödeyen muhasebeci kontrolü. Yoksa fiyatı ya da hedef kitleyi yeniden düşün. |
| Aralık 2027 | $2.000/ay kâr hedefi. |
