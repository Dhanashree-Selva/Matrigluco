import { ReactNode } from "react";

export interface ShellContextType {
  title?: string;
  subtitle?: string;
  contextRailContent?: ReactNode;
  setContextRailContent?: (content: ReactNode) => void;
}

export interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
}
