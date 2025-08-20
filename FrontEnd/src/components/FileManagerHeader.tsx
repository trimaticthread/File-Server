
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface FileManagerHeaderProps {
  username: string;
  onLogout: () => void;
}

const FileManagerHeader: React.FC<FileManagerHeaderProps> = ({ username, onLogout }) => {
  return (
  <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FM</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">File Manager</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Hoş geldiniz, {username}</span>
            <Button
              onClick={onLogout}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Çıkış</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default FileManagerHeader;
