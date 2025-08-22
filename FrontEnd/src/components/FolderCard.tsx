
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Folder, Trash2, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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

interface FolderCardProps {
  folder: FileItem;
  onNavigate: (folderId: string, folderName: string) => void;
  onDelete: (folderId: string) => void;
  viewMode: 'grid' | 'list';
}

const FolderCard: React.FC<FolderCardProps> = ({ folder, onNavigate, onDelete, viewMode }) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleFolderClick = () => {
    onNavigate(folder.id, folder.name);
  };

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-all duration-200 cursor-pointer bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-blue-300">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1" onClick={handleFolderClick}>
              <Folder className="w-8 h-8 text-blue-600" />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">{folder.name}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Klasör</span>
                  <span>{formatDate(folder.createdAt)}</span>
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
                <DropdownMenuItem 
                  className="flex items-center space-x-2 text-red-600 hover:bg-red-50"
                  onClick={() => onDelete(folder.id)}
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
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-blue-300">
      <CardContent className="p-4" onClick={handleFolderClick}>
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative">
            <Folder className="w-12 h-12 text-blue-600 group-hover:text-blue-700 transition-colors" />
            <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-6 h-6 p-0 rounded-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-lg">
                  <DropdownMenuItem 
                    className="flex items-center space-x-2 text-red-600 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(folder.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Sil</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="w-full">
            <h3 className="font-medium text-gray-900 text-sm truncate" title={folder.name}>
              {folder.name}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Klasör
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {formatDate(folder.createdAt)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FolderCard;
