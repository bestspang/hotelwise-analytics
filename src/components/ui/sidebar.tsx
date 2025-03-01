
import React from 'react';
import { cn } from "@/lib/utils";
import Skeleton from "@/components/ui/skeleton";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
    icon?: React.ReactNode;
  }[];
  loading?: boolean;
}

export function SidebarNav({ className, items, loading, ...props }: SidebarNavProps) {
  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        className
      )}
      {...props}
    >
      {loading ? (
        Array(5)
          .fill(0)
          .map((_, i) => (
            <Skeleton
              key={i}
              className="h-9 w-full rounded-md"
            />
          ))
      ) : (
        items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              // You can add active state styling here
              "text-muted-foreground"
            )}
          >
            {item.icon && <span className="w-5 h-5">{item.icon}</span>}
            <span>{item.title}</span>
          </a>
        ))
      )}
    </nav>
  );
}
