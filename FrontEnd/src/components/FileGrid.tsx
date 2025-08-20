
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
  path: string[];
}

interface FileGridProps {
  files: FileItem[];
  viewMode: 'grid' | 'list';
  searchTerm: string;
  onDeleteFile: (fileId: string) => void;
  onPreviewFile: (file: FileItem) => void;
  onNavigateToFolder: (folderName: string) => void;
}

const FileGrid: React.FC<FileGridProps> = ({
  files,
  viewMode,
  searchTerm,
  onDeleteFile,
  onPreviewFile,
  onNavigateToFolder,
}) => {
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
            onPreview={onPreviewFile}
            viewMode={viewMode}
          />
        )
      ))}
    </div>
  );
};

export default FileGrid;
