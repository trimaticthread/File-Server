
import React from 'react';
import { Button } from '@/components/ui/button';
import { Home, ChevronRight } from 'lucide-react';

interface FileManagerBreadcrumbProps {
  folderPath: {id: number | null, name: string}[];
  onGoHome: () => void;
  onNavigateTo: (index: number) => void;
}

const FileManagerBreadcrumb: React.FC<FileManagerBreadcrumbProps> = ({
  folderPath,
  onGoHome,
  onNavigateTo,
}) => {
  return (
    <nav className="flex items-center space-x-2 mb-6">
      {folderPath.map((folder, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => index === 0 ? onGoHome() : onNavigateTo(index)}
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
          >
            {index === 0 && <Home className="w-4 h-4" />}
            <span>{folder.name}</span>
          </Button>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default FileManagerBreadcrumb;
