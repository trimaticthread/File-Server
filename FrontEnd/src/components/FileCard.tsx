import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Image, 
  Music, 
  Video, 
  Archive, 
  File, 
  Trash2, 
  Download,
  Eye,
  MoreVertical 
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { downloadUrl } from '@/lib/api';

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

interface FileCardProps {
  file: FileItem;
  onDelete: (fileId: string) => void;
  onPreview: (file: FileItem) => void;
  onDownload: (fileId: string) => void;
  viewMode: 'grid' | 'list';
}

const FileCard: React.FC<FileCardProps> = ({ file, onDelete, onPreview, onDownload, viewMode }) => {
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const iconProps = { className: "w-8 h-8 text-blue-600" };
    
    switch (extension) {
      case 'pdf':
      case 'doc':
      case 'docx':
      case 'txt':
        return <FileText {...iconProps} className="w-8 h-8 text-red-600" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
        return <Image {...iconProps} className="w-8 h-8 text-green-600" />;
      case 'mp3':
      case 'wav':
      case 'flac':
        return <Music {...iconProps} className="w-8 h-8 text-purple-600" />;
      case 'mp4':
      case 'avi':
      case 'mkv':
        return <Video {...iconProps} className="w-8 h-8 text-orange-600" />;
      case 'zip':
      case 'rar':
      case '7z':
        return <Archive {...iconProps} className="w-8 h-8 text-yellow-600" />;
      default:
        return <File {...iconProps} />;
    }
  };

  const canPreview = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const previewableTypes = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'pdf', 'txt', 'md', 'json', 'js', 'ts', 'jsx', 'tsx', 'css', 'html', 'xml', 'doc', 'docx'];
    return previewableTypes.includes(extension || '');
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-all duration-200 bg-white/80 backdrop-blur-sm border border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center space-x-4 flex-1 cursor-pointer"
              onClick={() => canPreview(file.name) && onPreview(file)}
            >
              {getFileIcon(file.name)}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate flex items-center space-x-2">
                  {file.name}
                  {canPreview(file.name) && (
                    <Eye className="w-4 h-4 text-blue-500" />
                  )}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{formatFileSize(file.size)}</span>
                  <span>{formatDate(file.createdAt)}</span>
                </div>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-lg">
                {canPreview(file.name) && (
                  <DropdownMenuItem 
                    className="flex items-center space-x-2 hover:bg-gray-50"
                    onClick={() => onPreview(file)}
                  >
                    <Eye className="w-4 h-4" />
                    <span>Önizle</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  className="flex items-center space-x-2 hover:bg-gray-50"
                  onClick={() => onDownload(file.id)}
                >
                  <Download className="w-4 h-4" />
                  <span>İndir</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="flex items-center space-x-2 text-red-600 hover:bg-red-50"
                  onClick={() => onDelete(file.id)}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Sil</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-blue-300 relative">
      <CardContent className="p-4">
        {/* Üç nokta menüsü - sağ üst köşe */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" className="w-6 h-6 p-0 rounded-full shadow-sm">
                <MoreVertical className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-lg">
              {canPreview(file.name) && (
                <DropdownMenuItem 
                  className="flex items-center space-x-2 hover:bg-gray-50"
                  onClick={() => onPreview(file)}
                >
                  <Eye className="w-4 h-4" />
                  <span>Önizle</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                className="flex items-center space-x-2 hover:bg-gray-50"
                onClick={() => onDownload(file.id)}
              >
                <Download className="w-4 h-4" />
                <span>İndir</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="flex items-center space-x-2 text-red-600 hover:bg-red-50"
                onClick={() => onDelete(file.id)}
              >
                <Trash2 className="w-4 h-4" />
                <span>Sil</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-col items-center text-center space-y-3">
          <div 
            className="relative"
            onClick={() => canPreview(file.name) && onPreview(file)}
          >
            {getFileIcon(file.name)}
            {canPreview(file.name) && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                <Eye className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          
          <div className="w-full">
            <h3 className="font-medium text-gray-900 text-sm truncate flex items-center justify-center space-x-1" title={file.name}>
              <span>{file.name}</span>
              {canPreview(file.name) && (
                <Eye className="w-3 h-3 text-blue-500" />
              )}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {formatFileSize(file.size)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {formatDate(file.createdAt)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileCard;
