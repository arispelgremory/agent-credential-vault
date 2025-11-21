"use client"

import { useRouter, usePathname } from "@/i18n/routing"
import { localeObjects } from "@/i18n/locales"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"
import { cn } from "@/lib/utils"

interface LanguageSwitcherProps {
  _locale: string
  className?: string
  "data-testid"?: string
}

export function LanguageSwitcher({ _locale, className, "data-testid": testId }: LanguageSwitcherProps) {
  const router = useRouter()
  const pathname = usePathname()

  const currentLocale = localeObjects.find((loc) => loc.code === _locale) || localeObjects[0]

  const handleLocaleChange = (localeCode: string) => {
    router.replace(pathname, { locale: localeCode })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("gap-2", className)}
          data-testid={testId}
        >
          <Globe className="h-4 w-4" />
          <span>{currentLocale.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {localeObjects.map((locale) => (
          <DropdownMenuItem
            key={locale.code}
            onClick={() => handleLocaleChange(locale.code)}
            className={cn(
              "cursor-pointer",
              _locale === locale.code && "bg-accent"
            )}
          >
            {locale.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

