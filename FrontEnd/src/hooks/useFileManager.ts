
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { listFiles, uploadFile, deleteFile, downloadUrl, createFolder } from '@/lib/api';

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

interface DeleteConfirmState {
  isOpen: boolean;
  fileId: string | null;
  fileName: string;
  isFolder: boolean;
}

interface DownloadConfirmState {
  isOpen: boolean;
  fileId: string | null;
  fileName: string;
  fileSize?: number;
}

export const useFileManager = () => {
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [folderPath, setFolderPath] = useState<{id: number | null, name: string}[]>([
    { id: null, name: 'Ana Dizin' }
  ]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
    isOpen: false,
    fileId: null,
    fileName: '',
    isFolder: false,
  });
  const [downloadConfirm, setDownloadConfirm] = useState<DownloadConfirmState>({
    isOpen: false,
    fileId: null,
    fileName: '',
    fileSize: undefined,
  });
  const { toast } = useToast();

  const currentFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Load files from backend
  const loadFiles = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const items = await listFiles(currentFolderId || undefined);
      
      const mapped = items.map(i => ({
        id: String(i.id),
        name: i.filename,
        type: i.is_directory ? 'folder' as const : 'file' as const,
        size: i.size ?? undefined,
        createdAt: new Date(i.created_at),
        contentType: i.content_type ?? undefined,
        isDirectory: i.is_directory,
        parentId: i.parent_id,
      }));
      
      setFiles(mapped);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Dosyalar yüklenirken hata oluştu';
      setError(errorMsg);
      toast({ 
        title: 'Hata', 
        description: errorMsg,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentFolderId, toast]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleNavigateToFolder = (folderId: string, folderName: string) => {
    const id = parseInt(folderId);
    setCurrentFolderId(id);
    setFolderPath([...folderPath, { id, name: folderName }]);
  };

  const handleNavigateTo = (index: number) => {
    const targetFolder = folderPath[index];
    setCurrentFolderId(targetFolder.id);
    setFolderPath(folderPath.slice(0, index + 1));
  };

  const handleGoHome = () => {
    setCurrentFolderId(null);
    setFolderPath([{ id: null, name: 'Ana Dizin' }]);
  };

  const handleDeleteFile = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    // Önizleme açıksa kapat
    if (previewFile) {
      setPreviewFile(null);
    }

    setDeleteConfirm({
      isOpen: true,
      fileId: fileId,
      fileName: file.name,
      isFolder: file.type === 'folder',
    });
  };

  const confirmDeleteFile = async () => {
    if (!deleteConfirm.fileId) return;

    try {
      await deleteFile(deleteConfirm.fileId);
      
      // Önizleme açıksa ve silinen dosya önizlemedeki dosyaysa kapat
      if (previewFile && previewFile.id === deleteConfirm.fileId) {
        setPreviewFile(null);
      }
      
      await loadFiles(); // Reload files after deletion
      toast({ 
        title: 'Başarılı', 
        description: `${deleteConfirm.isFolder ? 'Klasör' : 'Dosya'} başarıyla silindi.` 
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Öğe silinemedi';
      toast({ 
        title: 'Hata', 
        description: errorMsg,
        variant: 'destructive'
      });
    }
  };

  const handleCreateFolder = async (folderName: string) => {
    try {
      await createFolder(folderName, currentFolderId || undefined);
      await loadFiles(); // Reload files after creation
      toast({
        title: "Klasör Oluşturuldu",
        description: `"${folderName}" klasörü oluşturuldu.`,
      });
      setShowCreateFolder(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Klasör oluşturulamadı';
      toast({ 
        title: 'Hata', 
        description: errorMsg,
        variant: 'destructive'
      });
    }
  };

  const handleFileUpload = async (uploadedFiles: File[]) => {
    setIsUploading(true);
    setUploadProgress(0);
    let successCount = 0;
    
    for (let i = 0; i < uploadedFiles.length; i++) {
      const f = uploadedFiles[i];
      try {
        await uploadFile(f, currentFolderId || undefined);
        successCount++;
        setUploadProgress(((i + 1) / uploadedFiles.length) * 100);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : `Yükleme başarısız: ${f.name}`;
        toast({ 
          title: 'Hata', 
          description: errorMsg,
          variant: 'destructive'
        });
      }
    }
    
    setIsUploading(false);
    setUploadProgress(0);
    
    if (successCount > 0) {
      await loadFiles(); // Reload files after upload
      toast({ 
        title: 'Başarılı', 
        description: `${successCount} dosya başarıyla yüklendi.` 
      });
    }
  };

  const handlePreviewFile = (file: FileItem) => {
    setPreviewFile(file);
  };

  const handleDownloadFile = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    setDownloadConfirm({
      isOpen: true,
      fileId: fileId,
      fileName: file.name,
      fileSize: file.size,
    });
  };

  const confirmDownloadFile = () => {
    if (!downloadConfirm.fileId) return;

    const link = document.createElement('a');
    link.href = downloadUrl(downloadConfirm.fileId);
    link.download = downloadConfirm.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'İndirme Başlatıldı',
      description: `"${downloadConfirm.fileName}" dosyası indiriliyor.`,
    });
  };

  const getDownloadUrl = (fileId: string) => downloadUrl(fileId);

  const handleClosePreview = () => {
    setPreviewFile(null);
  };

  const refreshFiles = () => {
    loadFiles();
  };

  return {
    // State
    currentFolderId,
    folderPath,
    currentFiles,
    searchTerm,
    viewMode,
    showCreateFolder,
    previewFile,
    isLoading,
    isUploading,
    uploadProgress,
    error,
    deleteConfirm,
    downloadConfirm,
    
    // Actions
    setSearchTerm,
    setViewMode,
    setShowCreateFolder,
    handleNavigateToFolder,
    handleNavigateTo,
    handleGoHome,
    handleDeleteFile,
    confirmDeleteFile,
    setDeleteConfirm,
    handleDownloadFile,
    confirmDownloadFile,
    setDownloadConfirm,
    handleCreateFolder,
    handleFileUpload,
    getDownloadUrl,
    handlePreviewFile,
    handleClosePreview,
    refreshFiles,
  };
};
