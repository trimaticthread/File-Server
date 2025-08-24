
import React from 'react';
import FileManagerHeader from '@/components/FileManagerHeader';
import FileManagerBreadcrumb from '@/components/FileManagerBreadcrumb';
import FileManagerActions from '@/components/FileManagerActions';
import FileGrid from '@/components/FileGrid';
import CreateFolderDialog from '@/components/CreateFolderDialog';
import FilePreview from '@/components/FilePreview';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import DownloadConfirmDialog from '@/components/DownloadConfirmDialog';
import { useFileManager } from '@/hooks/useFileManager';

interface FileManagerProps {
  username: string;
  onLogout: () => void;
}

const FileManager: React.FC<FileManagerProps> = ({ username, onLogout }) => {
  const {
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
    handlePreviewFile,
    handleClosePreview,
    refreshFiles,
  } = useFileManager();

  const [isDragOver, setIsDragOver] = React.useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Sadece ana container'dan çıkarken drag'i kapat
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <FileManagerHeader username={username} onLogout={onLogout} />

      <div 
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative ${
          isDragOver ? 'bg-blue-50/50' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Drag & Drop Overlay */}
        {isDragOver && (
          <div className="fixed inset-0 bg-blue-500/20 z-40 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-8 mx-4 max-w-md text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Dosyaları Buraya Bırakın
              </h3>
              <p className="text-gray-600">
                Dosyalarınız {folderPath[folderPath.length - 1].name} klasörüne yüklenecek
              </p>
            </div>
          </div>
        )}

        <FileManagerBreadcrumb
          folderPath={folderPath}
          onGoHome={handleGoHome}
          onNavigateTo={handleNavigateTo}
        />

        <FileManagerActions
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onCreateFolder={() => setShowCreateFolder(true)}
          onFileUpload={handleFileUpload}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
        />

        <FileGrid
          files={currentFiles}
          viewMode={viewMode}
          searchTerm={searchTerm}
          isLoading={isLoading}
          error={error}
          onDeleteFile={handleDeleteFile}
          onDownloadFile={handleDownloadFile}
          onPreviewFile={handlePreviewFile}
          onNavigateToFolder={handleNavigateToFolder}
          onRetry={refreshFiles}
        />
      </div>

      <CreateFolderDialog
        open={showCreateFolder}
        onOpenChange={setShowCreateFolder}
        onCreateFolder={handleCreateFolder}
      />

      <FilePreview
        file={previewFile}
        onClose={handleClosePreview}
        onDownload={handleDownloadFile}
      />

      <DeleteConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, isOpen: open })}
        onConfirm={confirmDeleteFile}
        fileName={deleteConfirm.fileName}
        isFolder={deleteConfirm.isFolder}
      />

      <DownloadConfirmDialog
        isOpen={downloadConfirm.isOpen}
        onOpenChange={(open) => setDownloadConfirm({ ...downloadConfirm, isOpen: open })}
        onConfirm={confirmDownloadFile}
        fileName={downloadConfirm.fileName}
        fileSize={downloadConfirm.fileSize}
      />
    </div>
  );
};

export default FileManager;
