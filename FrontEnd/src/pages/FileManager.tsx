
import React from 'react';
import FileManagerHeader from '@/components/FileManagerHeader';
import FileManagerBreadcrumb from '@/components/FileManagerBreadcrumb';
import FileManagerActions from '@/components/FileManagerActions';
import FileGrid from '@/components/FileGrid';
import CreateFolderDialog from '@/components/CreateFolderDialog';
import FilePreview from '@/components/FilePreview';
import { useFileManager } from '@/hooks/useFileManager';

interface FileManagerProps {
  username: string;
  onLogout: () => void;
}

const FileManager: React.FC<FileManagerProps> = ({ username, onLogout }) => {
  const {
    currentPath,
    currentFiles,
    searchTerm,
    viewMode,
    showCreateFolder,
    previewFile,
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
  } = useFileManager();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <FileManagerHeader username={username} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <FileManagerBreadcrumb
          currentPath={currentPath}
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
        />

        <FileGrid
          files={currentFiles}
          viewMode={viewMode}
          searchTerm={searchTerm}
          onDeleteFile={handleDeleteFile}
          onPreviewFile={handlePreviewFile}
          onNavigateToFolder={handleNavigateToFolder}
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
      />
    </div>
  );
};

export default FileManager;
