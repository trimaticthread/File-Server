import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, X } from 'lucide-react';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  fileName: string;
  isFolder: boolean;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
  fileName,
  isFolder,
}) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isFolder ? 'Klasörü Sil' : 'Dosyayı Sil'}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="p-1 h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600">
            <span className="font-medium text-gray-900">"{fileName}"</span> {isFolder ? 'klasörünü' : 'dosyasını'} silmek istediğinizden emin misiniz?
          </p>
          {isFolder && (
            <div className="mt-3 text-sm text-orange-600 bg-orange-50 p-3 rounded-md">
              <strong>Uyarı:</strong> Bu klasör ve içindeki tüm dosyalar kalıcı olarak silinecektir.
            </div>
          )}
          <p className="mt-3 text-sm text-gray-500">
            Bu işlem geri alınamaz.
          </p>
        </div>
        
        <div className="flex space-x-3 justify-end">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300"
          >
            Hayır, İptal Et
          </Button>
          <Button 
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Evet, Sil
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmDialog;
