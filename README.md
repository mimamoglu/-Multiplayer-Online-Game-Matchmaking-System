![images (1)](https://github.com/user-attachments/assets/a2334e0f-17a0-4ce3-80d9-5acd02731626)



# Mustafa Berke İmamoğlu 
# Ahmet Yasin Aydın 
# Kaan Güneş

# Tanım

Çevrimiçi oyunlarda eşleştirme, oyuncu deneyimini büyük ölçüde etkileyen kritik bir unsurdur. Oyuncuları adil ve keyifli bir oyun ortamında bir araya getirmek için eşleştirme sistemlerimizi, beceri seviyeleri, oyun modu tercihleri ve coğrafi konum gibi faktörleri göz önünde bulundurarak tasarlıyoruz. Bu projede amacımız, oyuncu profillerini, eşleştirme süreçlerini, oyun oturumlarını ve oyuncu istatistiklerini yöneten kapsamlı ve verimli bir veritabanı sistemi geliştirmektir.

Projede, oyuncular, eşleştirme kuyruğu, oyun oturumları ve istatistiklerle ilgili verileri etkin bir şekilde depolayan ve yöneten bir veritabanı şeması oluşturuyoruz. Veritabanı tasarımımız, oyuncu profillerini, oyun modlarını, sunucuları ve eşleştirme süreçlerini kapsayan ana varlıkları ve bunlar arasındaki ilişkileri içerir. Oyuncuların performans verileri, oyun modları, sunucuların durumu ve bölgesel bağlantılar gibi temel bilgileri veritabanında etkili bir şekilde organize ederek, oyuncuların doğru eşleştirilmesini sağlıyoruz. Bu yapı, oyun içi süreçlerin verimli bir şekilde yönetilmesine de olanak tanır.

## Tasarım Kararları

Bu veritabanı tasarımında alınan kararlar, sistemin işlevselliğini ve performansını en üst düzeye çıkarmayı hedeflemiştir.

Öncelikle, oyuncu verilerinin, oyun modlarının ve eşleştirme süreçlerinin ayrıntılı olarak izlenebilmesi için her varlık ayrı bir tabloya bölünmüştür. Bu sayede, her bir veri parçası kendi bağlamında yönetilebilir ve analiz edilebilir hale getirilmiştir. Foreign key ilişkileri kullanılarak tablolar arasında güçlü bağlantılar kurulmuş ve veri bütünlüğü sağlanmıştır.

Bu kararlar, hem oyuncu deneyimini iyileştirmek hem de sistemin sürdürülebilirliğini ve ölçeklenebilirliğini sağlamak amacıyla verilmiştir.

## Varlıklar ve Tablo Yapısı

### PLAYER

- **PlayerID(PK)**: Her oyuncunun benzersiz kimliği
- **Username**: Oyuncunun oyun içindeki kullanıcı adı
- **SkillRating**: Oyuncunun beceri derecesi, eşleştirme için önemlidir. Bir oyuncunun toplam kazandigi puan/toplam oynadığı oyun sayısı x 10 denklemi ile hesaplanır.
- **GamesPlayed**: Toplam oynanan oyun sayısı, oyuncunun tecrübesini gösterir. Oyuncu her bir oyun oynadığı zaman GamesPlayed sayısı bir arttırılır.
- **WinRate**: Kazanma oranı, oyuncunun performansını ölçer
- **ServerIP(FK)**: Oyuncunun bulunduğu server ile ilişkisi, SERVER tablosunda ServerIP alanına bağlıdır.

**Açıklama**: PLAYER tablosu, oyuncuların profillerini, performans verilerini ve bulunduğu sunucu bilgisini içerir. Oyuncu istatistikleri, eşleştirme algoritmalarını destekler.

### REGION

- **RegionID(PK)**: Her bölgenin benzersiz kimliği
- **RegionName**: Bölgenin adı

**Açıklama**: REGION tablosu, oyun sunucularının bulunduğu bölgeleri tanımlar.

### SERVER

- **ServerIP(PK)**: Sunucunun benzersiz kimliği
- **Status**: Sunucunun durumu (örneğin, aktif, bakımda)
- **RegionID(FK)**: Her sunucunun bulunduğu bölge ile ilişkisi tanımlanır ve REGION tablosuna bağlıdır.

**Açıklama**: SERVERS tablosu, sunucuların IP bilgilerini, durumlarını ve bölgelerini kaydeder. Sunucu durumu, oyun hizmetinin sürekliliği için kritik öneme sahiptir. Her server bir region ile ilişkilidir.

### GAMEMODE

- **GameModelID(PK)**: Oyun modunun benzersiz kimliği
- **ModeName**: Oyun modunun adı (örneğin, Solo, Takım)
- **MaxPlayers**: Moddaki maksimum oyuncu sayısı

**Açıklama**: GAMEMODE tablosu, farklı oyun modlarını tanımlar. Her mod, oyuncu sayısını ve oyun kurallarını belirler. Bu özellik sayesinde birden fazla oyun çeşidi desteklenir.

### GAMESESSION

- **GameSessionID(PK)**: Oyun oturumunun benzersiz kimliği, SESSIONPARTICIPANT tablosundaki SessionID alanına bağlıdır.
- **StartTime**: Oyun oturumunun başlama zamanı
- **EndTime**: Oyun oturumunun bitiş zamanı
- **GameModelID(FK)**: Oyun modunun kimliği, MATCHMAKINGQUEUE tablosuna bağlıdır. Bir oyuncu MATCHMAKINGQUEUE’ya katıldığında ve eşleşme sağlandığında, GameModelID bilgisi alınır.
- **RegionID(FK)**: Oyun oturumunun oynandığı bölge, REGION tablosuyla ilişkilidir
- **SessionStatus**: Oyun oturumunun durumu

**Açıklama**: GAMESESSION tablosu, her oyuncunun oynadığı oyunların detaylarını içerir. Tablo, oyuncunun oynadığı tüm oyunlar arasından son 10 oyunun bilgisini saklar. 11. oyuna başlandığında, başlangıç zamanı (start time) dikkate alınarak en eski oynanan oyunun bilgisi tablodan silinir.

### SESSIONPARTICIPANT

- **SessionID (PK)**: GAMESESSION tablosu, her oyuncu için oynadığı oturumun benzersiz bilgisini sağlar.
- **MatchID**: Katıldığı oyun oturumunun kimliği
- **PlayerID(FK)**: Katılımcı oyuncunun kimliği, PLAYER tablosuna bağlıdır

**Açıklama**: SESSIONPARTICIPANT tablosu, oyuncuların bulundukları oturumların ID’lerini tutar. Bu tablo, GAMESESSION tablosuna erişim sağlamak için oluşturulmuş ve aslında bir ara tablo görevi görmektedir.

### MATCHMAKINGQUEUE

- **QueueID(PK)**: Kuyruğun benzersiz kimliği
- **PlayerID(FK)**: Kuyruğa katılan oyuncunun kimliği, PLAYER tablosuna bağlıdır
- **PreferredGameModelID(FK)**: Oyuncunun tercih ettiği oyun modunun ID değeri, GAMEMODE tablosuna bağlıdır.
- **JoinTime**: Kuyruğa katılma zamanı
- **Status**: Eşleştirme kuyruğundaki durum

**Açıklama**: MATCHMAKINGQUEUE tablosu, oyuncuların eşleştirme sırasındaki durumunu kaydeder ve uygun oyun oturumlarına yönlendirilmesini sağlar.

### RANKING

- **RankingID(PK)**: Sıralama kaydının benzersiz kimliği
- **PlayerID(FK)**: Oyuncunun kimliği, PLAYER tablosuna bağlıdır
- **RankLevel**: Oyuncunun sıralama seviyesi, örneğin bulunduğu seviye kümesi Gold veya Bronze olarak tanımlanır. 500 ve 750 arasi bronze, 750 ve 1000 arasi,
- **Points**: Oyuncunun kazandığı puanlar
- **LastUpdated**: Sıralamanın güncellendiği tarih

**Açıklama**: RANKING tablosu, oyuncuların seviye ve puanlarını izler ve performans sıralamaları için kullanılır. Bu tablo sırasız olarak tutulur.

### BLACKLIST

- **BlacklistID(PK)**: Kara liste kaydının benzersiz kimliği
- **PlayerID(FK)**: Kara listeye alınan oyuncunun kimliği, PLAYER tablosuna bağlıdır
- **ReportCount**: Oyuncunun aldığı rapor sayısı
- **LastReportDate**: En son raporun tarihi
- **SuspiciousActivityScore**: Oyuncunun şüpheli etkinlik puanı

**Açıklama**: BLACKLIST tablosu, tüm oyuncuların şüpheli etkinliklerini ve rapor geçmişini kaydeder. Eğer bir oyuncunun raporlanma geçmişi yoksa, ilgili attribute değeri varsayılan olarak NULL veya 0 olarak tutulur.

Blacklist kontrolü her 5 maçta bir yapılır. Bu yaklaşımın temel amacı, her maç öncesi yapılan olası bir kontrolün performans kaybına yol açmasını önlemektir. Kontrolleri 5 maçta bir gerçekleştirmek, performans açısından yaklaşık %80 oranında avantaj sağlar.

Ancak, suspiciousActivityScore değeri 96’dan fazla olan bir oyuncu için en kötü ihtimalle 4 maçlık bir hata oranı oluşabilir.

Eğer bir oyuncunun SuspiciousActivityScore değeri 100 veya daha fazla olursa, bu oyuncunun PlayerID’si ve PlayerID ile bağlantılı attribute değerleri tüm tablolardan silinir.

## Tablolar Arası İlişkiler

- **PLAYER -> SERVER**: Oyuncular, belirlenen bir sunucuya bağlanırlar (1:1)
- **SERVER -> PLAYER**: Bir sunucuya birden fazla oyuncu bağlanabilir. (1:N)
- **REGION -> SERVER**: Birden fazla sunucu, bir bölgeye (region) ait olabilir.(N:1)
- **SERVER -> REGION**: Bir bölge, birden fazla sunucuya sahip olabilir (olmalıdır).(1:N)
- **PLAYER -> MATCHMAKINGQUEUE**: Oyuncular, eşleştirme kuyruğuna katılabilir. Oynadıkları maç bittikten sonra kuyruktan çıkarılırlar.(1:1)
- **MATCHMAKINGQUEUE -> PLAYER**: MATCHMAKINGQUEUE’da birden fazla oyuncu bulunabilir.(1:N)
- **MATCHMAKINGQUEUE -> GAMEMODE**: Kuyruktaki birden fazla oyuncu, aynı oyun modu için sıraya girebilir.(N:1)
- **GAMEMODE -> MATCHMAKINGQUEUE**: Bir oyun modu (GameMode) için kuyruğa girmiş birden fazla oyuncu bulunabilir.(1:N)
- **PLAYER -> RANKING**: Her oyuncunun sıralama puanı, RANKING tablosunda kayıtlıdır. Bu tabloda, her oyuncu için bir satır bulunur.(1:1)
- **RANKING -> PLAYER**: Aynı şekilde, RANKING tablosundaki her satır bir oyuncuya aittir.(1:1)
- **PLAYER -> BLACKLIST**: Her oyuncuya ait bir BLACKLIST tablosu satırı bulunur. Oyuncu daha önce raporlanmamış olsa bile, herhangi bir oyuna katıldığında bu satır oluşturulur ve 0 (veya NULL) değerleri atanır. Bu nedenle, bu tablo bire bir ilişkilidir.(1:1)
- **BLACKLIST -> PLAYER**: Aynı şekilde, BLACKLIST tablosundaki her satır bir oyuncuya aittir.(1:1)
- **PLAYER -> SESSIONPARTICIPANT**: Bir oyuncu bir oyuna katıldığında, kendisine bir session değeri atanır ve bu sayede GameSession bilgisine ulaşılır. Buradaki amaç, SESSIONPARTICIPANT tablosunu ara bir tablo olarak kullanarak GAMESESSION tablosuna ulaşmayı kolaylaştırmak ve PLAYER tablosundaki karmaşıklığı azaltmaktır. Bir oyuncunun en fazla 10 oyun bilgisi saklanabildiği için bu ilişki (1:N) şeklindedir.

  Buradaki ana hedef, PLAYER tablosundan doğrudan GAMESESSION tablosuna erişimi daha verimli hale getirmektir.

- **SESSIONPARTICIPANT -> Player**: SESSIONPARTICIPANT tablosunda, bir oyuncunun en fazla 10 adet olmak üzere session bilgisi bulunabilir. Yani, aynı oyuncuya ait birden fazla SESSIONPARTICIPANT satırı olabilir ve bu satırlar o oyuncuya eşleşir.(N:1)
- **SESSIONPARTICIPANT -> GAMESESSION**: Her bir oyuncu, oynadığı oyunun ID’sini ve PlayerID’sini benzersiz bir şekilde tanımlayan bir SessionID’ye sahiptir. Bu SessionID, aynı zamanda GAMESESSION tablosuyla ilişkilidir.(1:1)
![Screenshot 2024-11-28 123436](https://github.com/user-attachments/assets/468a3b99-3471-4cc3-9213-6b3290ba2a4c)
![tables](https://github.com/user-attachments/assets/e5f9b8cd-ee06-4241-8a60-1666204db374)

