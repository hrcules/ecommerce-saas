"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Megaphone,
  AlertTriangle,
  Info,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ChangelogAlertProps {
  title: string;
  content: string;
  type?: string;
}

export function ChangelogAlert({
  title,
  content,
  type = "info",
}: ChangelogAlertProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Define os estilos e ícones baseados no tipo de anúncio
  let bannerStyles =
    "border-blue-200 bg-blue-50/50 dark:bg-blue-950/30 dark:border-blue-900/50";
  let titleStyles = "text-blue-800 dark:text-blue-300";
  let textStyles = "text-blue-700 dark:text-blue-400";
  let buttonHover = "hover:bg-blue-100 dark:hover:bg-blue-900/50";
  let Icon = Info;

  if (type === "update") {
    bannerStyles =
      "border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/30 dark:border-emerald-900/50";
    titleStyles = "text-emerald-800 dark:text-emerald-300";
    textStyles = "text-emerald-700 dark:text-emerald-400";
    buttonHover = "hover:bg-emerald-100 dark:hover:bg-emerald-900/50";
    Icon = Megaphone;
  } else if (type === "maintenance") {
    bannerStyles =
      "border-amber-200 bg-amber-50/50 dark:bg-amber-950/30 dark:border-amber-900/50";
    titleStyles = "text-amber-800 dark:text-amber-300";
    textStyles = "text-amber-700 dark:text-amber-400";
    buttonHover = "hover:bg-amber-100 dark:hover:bg-amber-900/50";
    Icon = AlertTriangle;
  }

  const summary =
    content.length > 150 ? content.substring(0, 150) + "..." : content;
  const isLongContent = content.length > 150;

  return (
    <Alert className={`mb-2 transition-all duration-300 ${bannerStyles}`}>
      <Icon className={`h-4 w-4 ${textStyles}`} />

      <div
        className="-mt-1 flex cursor-pointer items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <AlertTitle className={`mb-0 text-base font-semibold ${titleStyles}`}>
          {title}
        </AlertTitle>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${textStyles} ${buttonHover}`}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      <AlertDescription className="text-muted-foreground mt-3">
        {!isExpanded && (
          <p
            className="line-clamp-1 cursor-pointer md:line-clamp-2"
            onClick={() => setIsExpanded(true)}
          >
            {summary}
            {isLongContent && (
              <span
                className={`ml-2 font-medium hover:underline ${textStyles}`}
              >
                Ver detalhes
              </span>
            )}
          </p>
        )}

        {isExpanded && (
          <div className="animate-in fade-in slide-in-from-top-2 mt-2 duration-300">
            <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
              {content}
            </p>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}
