
import React from 'react';
import { Button } from '@/components/ui/button';
import { Home, ChevronRight } from 'lucide-react';

interface FileManagerBreadcrumbProps {
  currentPath: string[];
  onGoHome: () => void;
  onNavigateTo: (index: number) => void;
}

const FileManagerBreadcrumb: React.FC<FileManagerBreadcrumbProps> = ({
  currentPath,
  onGoHome,
  onNavigateTo,
}) => {
  return (
    <nav className="flex items-center space-x-2 mb-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={onGoHome}
        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
      >
        <Home className="w-4 h-4" />
        <span>Ana Dizin</span>
      </Button>
      {currentPath.map((folder, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigateTo(index)}
            className="text-blue-600 hover:text-blue-800"
          >
            {folder}
          </Button>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default FileManagerBreadcrumb;
