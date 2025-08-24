# 📁 File Server - Modern Dosya Yönetim Sistemi

Modern web teknolojileri kullanılarak geliştirilmiş, kullanıcı dostu dosya yönetim sistemi. Drag & drop dosya yükleme, hiyerarşik klasör yapısı ve güvenli dosya işlemleri ile tam özellikli bir dosya sunucusu.

## 🌟 Özellikler

### 📤 Dosya Yönetimi
- **Drag & Drop Yükleme**: Modern drag & drop arayüzü ile kolay dosya yükleme
- **Çoklu Dosya Desteği**: Aynı anda birden fazla dosya yükleme
- **İlerleme Göstergesi**: Gerçek zamanlı upload progress bar
- **Dosya Boyutu Limiti**: Yapılandırılabilir maksimum dosya boyutu (varsayılan: 100MB)
- **MIME Type Kontrolü**: Güvenlik için dosya türü kısıtlamaları

### 📂 Klasör Yapısı
- **Hiyerarşik Klasörler**: Sınırsız derinlikte klasör oluşturma
- **Klasör Navigasyonu**: Breadcrumb ile kolay navigasyon
- **İç İçe Dosya Yükleme**: Herhangi bir klasörün içine dosya yükleme
- **Klasör Silme**: Klasör ve içeriğini güvenli silme

### 🎨 Kullanıcı Arayüzü
- **Modern Design**: shadcn/ui ile modern ve responsive tasarım
- **Grid/List Görünüm**: Dosyaları grid veya liste halinde görüntüleme
- **Dosya Önizleme**: Desteklenen dosya türleri için önizleme
- **Arama Fonksiyonu**: Dosya ve klasörlerde hızlı arama
- **Dark/Light Theme**: Tema desteği

### 🔒 Güvenlik
- **Unicode Dosya Adları**: Türkçe karakter desteği ile güvenli dosya isimlendirme
- **Dosya Çakışma Çözümü**: Aynı isimli dosyalar için otomatik çözüm
- **CORS Yapılandırması**: Güvenli cross-origin kaynak paylaşımı
- **SQL Injection Koruması**: SQLAlchemy ORM ile güvenli veritabanı işlemleri

## 🏗️ Mimari

```
File-Server/
├── BackEnd/                 # FastAPI Backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py         # Ana uygulama
│   │   ├── db.py           # Veritabanı bağlantısı
│   │   ├── models.py       # SQLAlchemy modelleri
│   │   ├── schemas.py      # Pydantic şemaları
│   │   └── routers/
│   │       ├── __init__.py
│   │       └── files.py    # Dosya işlemleri API
│   ├── Dockerfile
│   └── requirements.txt
├── FrontEnd/               # React Frontend
│   ├── src/
│   │   ├── components/     # UI bileşenleri
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility fonksiyonları
│   │   └── pages/          # Sayfa bileşenleri
│   ├── Dockerfile
│   └── package.json
├── storage/                # Dosya depolama
├── docker-compose.yml      # Container orchestration
└── .env                    # Ortam değişkenleri
```

## 🚀 Hızlı Başlangıç

### Ön Gereksinimler

- [Docker](https://www.docker.com/get-started) & Docker Compose
- [Git](https://git-scm.com/downloads)

### Kurulum

1. **Projeyi klonlayın:**
```bash
git clone https://github.com/trimaticthread/File-Server.git
cd File-Server
```

2. **Ortam değişkenlerini ayarlayın:**
```bash
# .env dosyasını oluşturun veya düzenleyin
cp .env.example .env
```

3. **Uygulamayı başlatın:**
```bash
docker-compose up -d
```

4. **Uygulamaya erişin:**
- Frontend: http://localhost:8081
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## ⚙️ Yapılandırma

### Ortam Değişkenleri (.env)

```env
# Veritabanı Ayarları
POSTGRES_DB=fileserver
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password_here

# Dosya Yükleme Ayarları
MAX_UPLOAD_MB=100                           # Maksimum dosya boyutu (MB)
STORAGE_DIR=/storage                        # Dosya depolama dizini
ALLOWED_MIME_TYPES=                         # İzin verilen MIME türleri (boş=tümü)

# CORS Ayarları
CORS_ORIGINS=http://localhost:5173,http://localhost:8081
```

### Docker Compose Ayarları

```yaml
version: '3.8'
services:
  db:                          # PostgreSQL veritabanı
    image: postgres:17
    ports: ["5432:5432"]
    
  backend:                     # FastAPI backend
    build: ./BackEnd
    ports: ["8000:8000"]
    depends_on: [db]
    
  frontend:                    # React frontend (geliştirme)
    build: ./FrontEnd
    ports: ["8081:8081"]
```

## 🛠️ Geliştirme

### Backend Geliştirme

```bash
# Backend dizinine gidin
cd BackEnd

# Virtual environment oluşturun
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Bağımlılıkları yükleyin
pip install -r requirements.txt

# Geliştirme sunucusunu başlatın
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Geliştirme

```bash
# Frontend dizinine gidin
cd FrontEnd

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

### API Endpoint'leri

#### Dosya İşlemleri

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `GET` | `/api/files/` | Dosya/klasör listesi |
| `GET` | `/api/files/?parent_id={id}` | Belirli klasördeki dosyalar |
| `POST` | `/api/files/upload` | Dosya yükleme |
| `GET` | `/api/files/download/{id}` | Dosya indirme |
| `DELETE` | `/api/files/{id}` | Dosya/klasör silme |
| `POST` | `/api/files/folders` | Klasör oluşturma |

#### Örnek API Kullanımı

```javascript
// Dosya yükleme
const formData = new FormData();
formData.append('file', file);
formData.append('parent_id', folderId); // Opsiyonel

const response = await fetch('/api/files/upload', {
  method: 'POST',
  body: formData
});

// Dosya listesi
const files = await fetch('/api/files/?parent_id=1').then(r => r.json());

// Klasör oluşturma
const folder = await fetch('/api/files/folders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Yeni Klasör', parent_id: null })
});
```

## 🗄️ Veritabanı Şeması

### Files Tablosu

```sql
CREATE TABLE files (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(128),
    size INTEGER,
    path VARCHAR(1024) NOT NULL,
    is_directory BOOLEAN DEFAULT FALSE,
    parent_id INTEGER REFERENCES files(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🎨 Frontend Teknolojileri

### Ana Bileşenler

- **React 19**: Modern React ile functional components
- **TypeScript**: Type-safe JavaScript
- **Vite**: Hızlı build tool
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Modern UI component library
- **React Query**: Server state management
- **React Router**: Client-side routing

### Önemli Hooks

```typescript
// useFileManager - Ana dosya yönetimi hook'u
const {
  currentFiles,           // Mevcut klasördeki dosyalar
  currentFolderId,        // Şu anki klasör ID'si
  handleFileUpload,       // Dosya yükleme fonksiyonu
  handleNavigateToFolder, // Klasör navigasyonu
  handleCreateFolder,     // Klasör oluşturma
  handleDeleteFile        // Dosya/klasör silme
} = useFileManager();
```

## 🐳 Docker Deployment

### Production Build

```bash
# Production build
docker-compose -f docker-compose.prod.yml up -d

# Sadece backend
docker-compose up -d db backend

# Logları takip etme
docker-compose logs -f backend
```

### Özel Network

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on: [backend]
```

## 🔧 Troubleshooting

### Yaygın Sorunlar

1. **Docker container'ı başlamıyor:**
```bash
# Container'ları yeniden başlatın
docker-compose down
docker-compose up -d

# Logları kontrol edin
docker-compose logs backend
```

2. **Dosya yükleme çalışmıyor:**
```bash
# Storage dizininin permission'larını kontrol edin
docker-compose exec backend ls -la /storage

# Backend loglarını kontrol edin
docker-compose logs backend --tail=50
```

3. **Frontend API'ye bağlanamıyor:**
```bash
# Network bağlantısını test edin
curl http://localhost:8000/api/files/

# CORS ayarlarını kontrol edin
```

### Debug Modu

```bash
# Backend debug modu
PYTHONPATH=/app python -c "
import sys; sys.path.append('/app')
from app.main import app
import uvicorn
uvicorn.run(app, host='0.0.0.0', port=8000, debug=True)
"

# Frontend debug modu
npm run dev -- --debug
```

## 🧪 Test

### Backend Testleri

```bash
cd BackEnd
python -m pytest tests/ -v
```

### Frontend Testleri

```bash
cd FrontEnd
npm run test
npm run test:coverage
```

### API Testi

```bash
# Health check
curl http://localhost:8000/health

# Dosya listesi
curl http://localhost:8000/api/files/

# Dosya yükleme testi
curl -X POST http://localhost:8000/api/files/upload \
  -F "file=@test.txt" \
  -F "parent_id=1"
```

## 📝 Katkıda Bulunma

1. **Fork edin** ve feature branch oluşturun
2. **Commit** kurallarına uyun: `feat: yeni özellik` veya `fix: hata düzeltmesi`
3. **Test** ekleyin ve mevcut testlerin geçtiğinden emin olun
4. **Pull Request** gönderin

### Commit Mesaj Formatı

```
tip(kapsam): kısa açıklama

Uzun açıklama (opsiyonel)

- feat: yeni özellik
- fix: hata düzeltmesi
- docs: dokümantasyon
- style: kod formatı
- refactor: kod düzenleme
- test: test ekleme
- chore: build/config değişiklikleri
```

## 📊 Performans

### Optimizasyon İpuçları

1. **Dosya Boyutu**: Büyük dosyalar için chunk upload implementasyonu
2. **Caching**: Redis ile dosya metadata cache'leme
3. **CDN**: Static dosyalar için CDN kullanımı
4. **Database**: İndexleme ve query optimizasyonu

### Monitoring

```bash
# Resource kullanımı
docker stats

# Database performansı
docker-compose exec db psql -U postgres -d fileserver -c "
SELECT schemaname,tablename,attname,n_distinct,correlation 
FROM pg_stats WHERE tablename='files';
"
```

## 🔐 Güvenlik

### Güvenlik Özellikleri

- ✅ **SQL Injection Koruması**: SQLAlchemy ORM
- ✅ **XSS Koruması**: React'ın built-in koruması
- ✅ **CSRF Koruması**: SameSite cookie ayarları
- ✅ **File Upload Güvenliği**: MIME type kontrolü
- ✅ **Path Traversal Koruması**: Güvenli dosya isimlendirme

### Güvenlik Kontrol Listesi

- [ ] HTTPS kullanımı (production)
- [ ] Rate limiting implementasyonu
- [ ] Dosya tarama (antivirus)
- [ ] User authentication/authorization
- [ ] Audit logging
- [ ] Backup stratejisi

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakınız.

## 🤝 Destek

- **Issues**: [GitHub Issues](https://github.com/trimaticthread/File-Server/issues)
- **Discussions**: [GitHub Discussions](https://github.com/trimaticthread/File-Server/discussions)
- **Email**: support@fileserver.dev

## 🎯 Roadmap

### v1.1.0 (Planlanan)
- [ ] User authentication sistemi
- [ ] Role-based access control
- [ ] File sharing özellikleri
- [ ] Bulk operations (toplu işlemler)

### v1.2.0 (Gelecek)
- [ ] Real-time notifications
- [ ] File versioning
- [ ] Advanced search
- [ ] Mobile app

### v2.0.0 (Uzun Vadeli)
- [ ] Microservices mimarisi
- [ ] Kubernetes deployment
- [ ] AI-powered file organization
- [ ] Cloud storage integration

---

⭐ **Bu projeyi beğendiyseniz star vermeyi unutmayın!**

📧 **Sorularınız için:** [Issue açın](https://github.com/trimaticthread/File-Server/issues/new) veya [Discussion başlatın](https://github.com/trimaticthread/File-Server/discussions/new)
