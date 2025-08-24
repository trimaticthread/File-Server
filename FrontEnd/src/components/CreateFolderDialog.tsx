
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, FolderPlus, Folder } from 'lucide-react';

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateFolder: (folderName: string) => void;
}

const CreateFolderDialog: React.FC<CreateFolderDialogProps> = ({
  open,
  onOpenChange,
  onCreateFolder,
}) => {
  const [folderName, setFolderName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (folderName.trim() && !isCreating) {
      setIsCreating(true);
      try {
        await onCreateFolder(folderName.trim());
        setFolderName('');
        onOpenChange(false);
      } finally {
        setIsCreating(false);
      }
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setFolderName('');
      onOpenChange(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <FolderPlus className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white">
                Yeni Klasör Oluştur
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isCreating}
              className="text-white hover:bg-white/20 p-1 h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Folder Icon Preview */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                <Folder className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            {/* Input Field */}
            <div className="space-y-2">
              <label 
                htmlFor="folderName" 
                className="block text-sm font-medium text-gray-700"
              >
                Klasör Adı
              </label>
              <Input
                id="folderName"
                type="text"
                placeholder="Klasör adını giriniz"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                disabled={isCreating}
                autoFocus
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <p className="text-xs text-gray-500">
                Klasör adı boş olamaz ve özel karakterler içeremez
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isCreating}
                className="flex-1 py-3 border-gray-300 hover:bg-gray-50"
              >
                İptal
              </Button>
              <Button
                type="submit"
                disabled={!folderName.trim() || isCreating}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Oluşturuluyor...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <FolderPlus className="w-4 h-4" />
                    <span>Oluştur</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateFolderDialog;
