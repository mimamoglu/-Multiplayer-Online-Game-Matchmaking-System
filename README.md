
# Tanım

**Çevrimiçi oyunlarda eşleştirme**, oyuncu deneyimini büyük ölçüde etkileyen kritik bir unsurdur. Oyuncuları adil ve keyifli bir oyun ortamında bir araya getirmek için eşleştirme sistemlerimizi, **beceri seviyeleri**, **oyun modu tercihleri** ve **coğrafi konum** gibi faktörleri göz önünde bulundurarak tasarlıyoruz. Bu projede amacımız, oyuncu profillerini, eşleştirme süreçlerini, oyun oturumlarını ve oyuncu istatistiklerini yöneten kapsamlı ve verimli bir veritabanı sistemi geliştirmektir.

Projede, oyuncular, eşleştirme kuyruğu, oyun oturumları ve istatistiklerle ilgili verileri etkin bir şekilde depolayan ve yöneten bir **veritabanı şeması** oluşturuyoruz. Veritabanı tasarımımız, oyuncu profillerini, oyun modlarını, sunucuları ve eşleştirme süreçlerini kapsayan ana varlıkları ve bunlar arasındaki ilişkileri içerir. **Oyuncuların performans verileri**, **oyun modları**, **sunucuların durumu** ve **bölgesel bağlantılar** gibi temel bilgileri veritabanında etkili bir şekilde organize ederek, oyuncuların doğru eşleştirilmesini sağlıyoruz. Bu yapı, oyun içi süreçlerin verimli bir şekilde yönetilmesine de olanak tanır.

---

## Tasarım Kararları

Bu veritabanı tasarımında alınan kararlar, sistemin işlevselliğini ve performansını en üst düzeye çıkarmayı hedeflemiştir.

- Öncelikle, **oyuncu verilerinin**, **oyun modlarının** ve **eşleştirme süreçlerinin** ayrıntılı olarak izlenebilmesi için her varlık ayrı bir tabloya bölünmüştür. Bu sayede, her bir veri parçası kendi bağlamında yönetilebilir ve analiz edilebilir hale getirilmiştir.
- **Foreign key ilişkileri** kullanılarak tablolar arasında güçlü bağlantılar kurulmuş ve veri bütünlüğü sağlanmıştır.
- **İndeksleme**, hızlı veri erişimini sağlamak için uygulanmış, böylece yüksek yoğunluklu oyun sistemlerinde bile hızlı sorgu performansı elde edilmiştir.
- Ayrıca, **zaman serisi verileri** ve **coğrafi veri özellikleri**, oyuncu davranışlarının ve sunucu performansının daha iyi analiz edilmesi için veritabanına entegre edilmiştir.

Bu kararlar, hem oyuncu deneyimini iyileştirmek hem de sistemin sürdürülebilirliğini ve ölçeklenebilirliğini sağlamak amacıyla verilmiştir.

---

## Varlıklar ve Tablo Yapısı

### PLAYER
- **PlayerID**: Her oyuncunun benzersiz kimliği
- **Username**: Oyuncunun oyun içindeki kullanıcı adı
- **SkillRating**: Oyuncunun beceri derecesi, eşleştirme için önemlidir
- **GamesPlayed**: Toplam oynanan oyun sayısı, oyuncunun tecrübesini gösterir
- **WinRate**: Kazanma oranı, oyuncunun performansını ölçer
- **RegionID**: Oyuncunun kayıtlı olduğu veya oynadığı bölge, REGION tablosuyla ilişkilidir

**Açıklama**: `PLAYER` tablosu, oyuncuların profillerini ve performans verilerini içerir. Oyuncu istatistikleri, eşleştirme algoritmalarını destekler.

---

### REGION
- **RegionID**: Her bölgenin benzersiz kimliği
- **RegionName**: Bölgenin adı
- **ServerID**: Bölgedeki sunucularla ilişki, SERVERS tablosuna bağlıdır

**Açıklama**: `REGION` tablosu, oyun sunucularının bulunduğu bölgeleri tanımlar ve oyuncuların uygun sunuculara yönlendirilmesini sağlar.

---

### SERVERS
- **ServerID**: Sunucunun benzersiz kimliği
- **ServerIP**: Sunucunun IP adresi
- **Status**: Sunucunun durumu (örneğin, aktif, bakımda)

**Açıklama**: `SERVERS` tablosu, sunucuların IP bilgilerini ve durumlarını kaydeder. Sunucu durumu, oyun hizmetinin sürekliliği için kritik öneme sahiptir.

---

### GAMEMODES
- **GameModelID**: Oyun modunun benzersiz kimliği
- **ModeName**: Oyun modunun adı (örneğin, Solo, Takım)
- **MaxPlayers**: Moddaki maksimum oyuncu sayısı

**Açıklama**: `GAMEMODES` tablosu, oyunun farklı oynanış modlarını tanımlar. Her mod, oyuncu sayısını ve oyun kurallarını belirler.

---

### GAMESESSION
- **SessionID**: Oyun oturumunun benzersiz kimliği
- **StartTime**: Oyun oturumunun başlama zamanı
- **EndTime**: Oyun oturumunun bitiş zamanı
- **GameModelID**: Oyun modunun kimliği, GAMEMODES tablosuna bağlıdır
- **RegionID**: Oyun oturumunun oynandığı bölge, REGION tablosuyla ilişkilidir
- **SessionStatus**: Oyun oturumunun durumu

**Açıklama**: `GAMESESSION` tablosu, her bir oyun oturumunun detaylarını içerir. Oyun süreçlerini analiz etmeye olanak tanır.

---

### SESSIONPARTICIPANT
- **SessionID**: Katıldığı oyun oturumunun kimliği, GAMESESSION tablosuyla ilişkilidir
- **PlayerID**: Katılımcı oyuncunun kimliği, PLAYER tablosuna bağlıdır

**Açıklama**: `SESSIONPARTICIPANT` tablosu, oyuncuların hangi oyun oturumlarına katıldığını ve performanslarını kaydeder.

---

### MATCHMAKINGQUEUE
- **QueueID**: Kuyruğun benzersiz kimliği
- **PlayerID**: Kuyruğa katılan oyuncunun kimliği, PLAYER tablosuna bağlıdır
- **PreferredGameMode**: Oyuncunun tercih ettiği oyun modu
- **JoinTime**: Kuyruğa katılma zamanı
- **Status**: Eşleştirme kuyruğundaki durum

**Açıklama**: `MATCHMAKINGQUEUE` tablosu, oyuncuların eşleştirme sırasındaki durumunu kaydeder ve uygun oyun oturumlarına yönlendirilmesini sağlar.

---

### RANKING
- **RankingID**: Sıralama kaydının benzersiz kimliği
- **PlayerID**: Oyuncunun kimliği, PLAYER tablosuna bağlıdır
- **RankLevel**: Oyuncunun sıralama seviyesi
- **Points**: Oyuncunun kazandığı puanlar
- **LastUpdated**: Sıralamanın güncellendiği tarih

**Açıklama**: `RANKING` tablosu, oyuncuların seviye ve puanlarını izler. Performans sıralamaları için kullanılır.

---

### BLACKLIST
- **BlacklistID**: Kara liste kaydının benzersiz kimliği
- **PlayerID**: Kara listeye alınan oyuncunun kimliği, PLAYER tablosuna bağlıdır
- **ReportCount**: Oyuncunun aldığı rapor sayısı
- **LastReportDate**: En son raporun tarihi
- **SuspiciousActivityScore**: Oyuncunun şüpheli etkinlik puanı

**Açıklama**: `BLACKLIST` tablosu, oyuncuların şüpheli etkinliklerini ve rapor geçmişini kaydeder. Oyunun güvenliğini sağlamak için kullanılır.

---

## Tablolar Arası İlişkiler

- **PLAYER - REGION**: Oyuncular, belirli bir bölgede oynar (1:N)
- **PLAYER - MATCHMAKINGQUEUE**: Oyuncular, eşleştirme kuyruğuna katılabilir (1:N)
- **PLAYER - RANKING**: Oyuncuların sıralama seviyeleri kayıtlıdır (1:1)
- **PLAYER - BLACKLIST**: Şüpheli davranışlar kara listeye eklenir (1:1)
- **GAMESESSION - SESSIONPARTICIPANT**: Oyun oturumları birden fazla katılımcıya sahiptir (1:N)
- **REGION - SERVERS**: Bölgeler, birçok sunucuya sahip olabilir (1:N)
- **GAMEMODES - GAMESESSION**: Her oyun oturumu belirli bir modda oynanır (1:1)

--- 

This markdown format is optimized for GitHub, making your document more readable while preserving its original content and structure.
