
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  createdAt: Date;
  path: string[];
}

const initialFiles: FileItem[] = [
  { id: '1', name: 'Belgeler', type: 'folder', createdAt: new Date(), path: [] },
  { id: '2', name: 'Resimler', type: 'folder', createdAt: new Date(), path: [] },
  { id: '3', name: 'Projeler', type: 'folder', createdAt: new Date(), path: [] },
  { id: '4', name: 'rapor.pdf', type: 'file', size: 2048000, createdAt: new Date(), path: [] },
  { id: '5', name: 'sunum.pptx', type: 'file', size: 5120000, createdAt: new Date(), path: [] },
  { id: '6', name: 'manzara.jpg', type: 'file', size: 1024000, createdAt: new Date(), path: [] },
  { id: '7', name: 'notlar.txt', type: 'file', size: 5120, createdAt: new Date(), path: [] },
  { id: '8', name: 'makale.docx', type: 'file', size: 512000, createdAt: new Date(), path: [] },
];

export const useFileManager = () => {
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [files, setFiles] = useState<FileItem[]>(initialFiles);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const { toast } = useToast();

  const currentFiles = files.filter(file => 
    JSON.stringify(file.path) === JSON.stringify(currentPath) &&
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNavigateToFolder = (folderName: string) => {
    setCurrentPath([...currentPath, folderName]);
  };

  const handleNavigateTo = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1));
  };

  const handleGoHome = () => {
    setCurrentPath([]);
  };

  const handleDeleteFile = (fileId: string) => {
    setFiles(files.filter(file => file.id !== fileId));
    toast({
      title: "Dosya Silindi",
      description: "Dosya başarıyla silindi.",
    });
  };

  const handleCreateFolder = (folderName: string) => {
    const newFolder: FileItem = {
      id: Date.now().toString(),
      name: folderName,
      type: 'folder',
      createdAt: new Date(),
      path: currentPath,
    };
    setFiles([...files, newFolder]);
    toast({
      title: "Klasör Oluşturuldu",
      description: `"${folderName}" klasörü oluşturuldu.`,
    });
  };

  const handleFileUpload = (uploadedFiles: File[]) => {
    const newFiles: FileItem[] = uploadedFiles.map(file => ({
      id: Date.now().toString() + Math.random(),
      name: file.name,
      type: 'file',
      size: file.size,
      createdAt: new Date(),
      path: currentPath,
    }));
    setFiles([...files, ...newFiles]);
    toast({
      title: "Dosyalar Yüklendi",
      description: `${uploadedFiles.length} dosya başarıyla yüklendi.`,
    });
  };

  const handlePreviewFile = (file: FileItem) => {
    setPreviewFile(file);
  };

  const handleClosePreview = () => {
    setPreviewFile(null);
  };

  return {
    // State
    currentPath,
    currentFiles,
    searchTerm,
    viewMode,
    showCreateFolder,
    previewFile,
    
    // Actions
    setSearchTerm,
    setViewMode,
    setShowCreateFolder,
    handleNavigateToFolder,
    handleNavigateTo,
    handleGoHome,
    handleDeleteFile,
    handleCreateFolder,
    handleFileUpload,
    handlePreviewFile,
    handleClosePreview,
  };
};
