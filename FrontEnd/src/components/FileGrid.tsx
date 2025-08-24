
import React from 'react';
import { Card } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import FileCard from './FileCard';
import FolderCard from './FolderCard';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  createdAt: Date;
  contentType?: string;
  isDirectory: boolean;
  parentId?: number | null;
}

interface FileGridProps {
  files: FileItem[];
  viewMode: 'grid' | 'list';
  searchTerm: string;
  isLoading?: boolean;
  error?: string | null;
  onDeleteFile: (fileId: string) => void;
  onDownloadFile: (fileId: string) => void;
  onPreviewFile: (file: FileItem) => void;
  onNavigateToFolder: (folderId: string, folderName: string) => void;
  onRetry?: () => void;
}

const FileGrid: React.FC<FileGridProps> = ({
  files,
  viewMode,
  searchTerm,
  isLoading = false,
  error = null,
  onDeleteFile,
  onDownloadFile,
  onPreviewFile,
  onNavigateToFolder,
  onRetry,
}) => {
  if (isLoading) {
    return (
      <Card className="p-12 text-center">
        <div className="text-gray-400 mb-4">
          <div className="w-16 h-16 mx-auto border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Dosyalar yükleniyor...
        </h3>
        <p className="text-gray-500">
          Lütfen bekleyin, dosya listesi getiriliyor.
        </p>
      </Card>
    );
  }

  if (error && onRetry) {
    return (
      <Card className="p-12 text-center">
        <div className="text-red-400 mb-4">
          <Upload className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Bağlantı hatası
        </h3>
        <p className="text-gray-500 mb-4">
          {error}
        </p>
        <button 
          onClick={onRetry}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Tekrar Dene
        </button>
      </Card>
    );
  }

  if (files.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="text-gray-400 mb-4">
          <Upload className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {searchTerm ? 'Dosya bulunamadı' : 'Bu klasör boş'}
        </h3>
        <p className="text-gray-500">
          {searchTerm ? 'Arama kriterlerinize uygun dosya bulunamadı.' : 'Dosya yükleyin veya klasör oluşturun.'}
        </p>
      </Card>
    );
  }

  return (
    <div className={viewMode === 'grid' 
      ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
      : "space-y-2"
    }>
      {files.map((file) => (
        file.type === 'folder' ? (
          <FolderCard
            key={file.id}
            folder={file}
            onNavigate={onNavigateToFolder}
            onDelete={onDeleteFile}
            viewMode={viewMode}
          />
        ) : (
          <FileCard
            key={file.id}
            file={file}
            onDelete={onDeleteFile}
            onDownload={onDownloadFile}
            onPreview={onPreviewFile}
            viewMode={viewMode}
          />
        )
      ))}
    </div>
  );
};

export default FileGrid;
