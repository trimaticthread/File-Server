import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

interface DownloadConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  fileName: string;
  fileSize?: number;
}

const DownloadConfirmDialog: React.FC<DownloadConfirmDialogProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
  fileName,
  fileSize,
}) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
              <Download className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Dosyayı İndir
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
            <span className="font-medium text-gray-900">"{fileName}"</span> dosyasını indirmek istediğinizden emin misiniz?
          </p>
          {fileSize && (
            <div className="mt-2 text-sm text-gray-500">
              Dosya boyutu: {formatFileSize(fileSize)}
            </div>
          )}
          <div className="mt-3 text-sm text-blue-600 bg-blue-50 p-3 rounded-md">
            <strong>Bilgi:</strong> Dosya varsayılan indirme klasörünüze kaydedilecektir.
          </div>
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
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Evet, İndir
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DownloadConfirmDialog;
