
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  createdAt: Date;
  path: string[];
}

interface FilePreviewProps {
  file: FileItem | null;
  onClose: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, onClose }) => {
  const [zoom, setZoom] = React.useState(1);

  if (!file) return null;

  const getFileExtension = (fileName: string) => {
    return fileName.split('.').pop()?.toLowerCase() || '';
  };

  const renderPreviewContent = () => {
    const extension = getFileExtension(file.name);
    
    // Simüle edilmiş dosya URL'si (gerçek uygulamada server'dan gelecek)
    const fileUrl = `/api/files/${file.id}`;

    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
      case 'webp':
        return (
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
                disabled={zoom <= 0.1}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-600">{Math.round(zoom * 100)}%</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                disabled={zoom >= 3}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
            <div className="overflow-auto max-h-96 w-full flex justify-center">
              <img
                src={`https://via.placeholder.com/600x400/e2e8f0/64748b?text=${encodeURIComponent(file.name)}`}
                alt={file.name}
                style={{ 
                  transform: `scale(${zoom})`,
                  maxWidth: '100%',
                  height: 'auto'
                }}
                className="border border-gray-200 rounded"
              />
            </div>
          </div>
        );

      case 'pdf':
        return (
          <div className="w-full h-96 border border-gray-200 rounded">
            <iframe
              src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf')}`}
              width="100%"
              height="100%"
              className="rounded"
              title={`PDF: ${file.name}`}
            />
          </div>
        );

      case 'txt':
      case 'md':
      case 'json':
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
      case 'css':
      case 'html':
      case 'xml':
        return (
          <div className="w-full h-96 border border-gray-200 rounded bg-gray-50">
            <div className="p-4 h-full overflow-auto">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                {`// ${file.name} içeriği
                
Bu bir ${extension.toUpperCase()} dosyasıdır.
Gerçek uygulamada burada dosyanın içeriği görünecektir.

Örnek içerik:
function hello() {
  console.log("Merhaba Dünya!");
}

Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`}
              </pre>
            </div>
          </div>
        );

      case 'doc':
      case 'docx':
        return (
          <div className="w-full h-96 border border-gray-200 rounded bg-white">
            <div className="p-6 h-full overflow-auto">
              <div className="prose max-w-none">
                <h2 className="text-xl font-bold mb-4">{file.name}</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Bu bir Word belgesidir. Gerçek uygulamada burada belgenin içeriği görünecektir.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor 
                  incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
                  exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu 
                  fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in 
                  culpa qui officia deserunt mollit anim id est laborum.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-48 text-gray-500">
            <p className="text-lg mb-2">Önizleme mevcut değil</p>
            <p className="text-sm">Bu dosya türü için önizleme desteklenmiyor.</p>
            <p className="text-xs mt-2">Dosya türü: {extension.toUpperCase()}</p>
          </div>
        );
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] bg-white overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold truncate">{file.name}</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              {formatFileSize(file.size)} • {getFileExtension(file.name).toUpperCase()}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>İndir</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 pt-0 overflow-auto">
          {renderPreviewContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default FilePreview;
