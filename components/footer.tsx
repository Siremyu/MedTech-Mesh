import * as React from "react"
import { Mail, Instagram, Youtube, Github } from "lucide-react"

export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
      <div className="px-[32px] py-[12px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>© 2025 Medtech Mesh</span>
            <select className="bg-transparent border-none text-sm">
              <option>English</option>
            </select>
            <a href="/privacy" className="hover:text-foreground">Privacy</a>
            <a href="/faq" className="hover:text-foreground">FAQ</a>
          </div>
          
          <div className="flex items-center gap-4">
            <Mail className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer" />
            <Instagram className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer" />
            <Youtube className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer" />
            <Github className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer" />
          </div>
        </div>
      </div>
    </footer>
  )
}