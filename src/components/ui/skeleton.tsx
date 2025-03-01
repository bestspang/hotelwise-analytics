
import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div 
      className={cn(
        "animate-pulse rounded-md bg-gray-200 dark:bg-gray-800", 
        className
      )} 
      {...props}
    />
  );
};

export default Skeleton;
