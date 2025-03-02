
import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

const NotificationsDropdown = () => {
  const { toasts, dismiss } = useToast();
  
  const hasUnreadNotifications = toasts.length > 0;
  
  const clearAllNotifications = () => {
    toasts.forEach(toast => {
      dismiss(toast.id);
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={20} />
          {hasUnreadNotifications && (
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {toasts.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto text-xs py-1 px-2"
              onClick={clearAllNotifications}
            >
              Clear all
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
          {toasts.length > 0 ? (
            toasts.map((toast) => (
              <DropdownMenuItem key={toast.id} className="p-3 cursor-default">
                <div className="flex flex-col gap-1">
                  {toast.title && (
                    <div className="font-medium">{toast.title}</div>
                  )}
                  {toast.description && (
                    <div className="text-sm text-muted-foreground">{toast.description}</div>
                  )}
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No notifications
            </div>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown;
