import { Link } from "react-router-dom";
import { DualLogo, Logo } from "@/components/NavLink";
import { FileText, Shield } from "lucide-react";

interface FooterProps {
  variant?: "full" | "minimal";
  showDualLogo?: boolean;
}

export const Footer = ({ variant = "minimal", showDualLogo = true }: FooterProps) => {
  if (variant === "full") {
    return (
      <footer className="bg-card border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {showDualLogo ? <DualLogo logoSize="h-8 w-8" /> : (
                <div className="flex items-center gap-2">
                  <Logo className="h-8 w-8" />
                  <span className="font-semibold text-foreground">ISECO</span>
                </div>
              )}
            </div>
            <div className="text-center text-sm text-muted-foreground">
              <p>© {new Date().getFullYear()} Independent Students Electoral Committee</p>
              <div className="mt-2 flex items-center justify-center gap-4">
                <Link 
                  to="/terms" 
                  className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                >
                  <FileText className="h-3 w-3" />
                  Terms
                </Link>
                <span className="text-muted-foreground/50">•</span>
                <Link 
                  to="/privacy" 
                  className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                >
                  <Shield className="h-3 w-3" />
                  Privacy
                </Link>
              </div>
            </div>
            <div className="flex gap-4 text-sm">
              <Link to="/support" className="hover:text-primary transition-colors">Support</Link>
              <Link to="/rules" className="hover:text-primary transition-colors">Rules</Link>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <div className="mt-8 text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        {showDualLogo ? <DualLogo logoSize="h-6 w-6" /> : (
          <div className="flex items-center gap-2">
            <Logo className="h-6 w-6" />
            <span className="font-semibold text-foreground">ISECO</span>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Independent Students Electoral Committee • COHSSA
      </p>
      <div className="mt-2 flex items-center justify-center gap-3 text-xs">
        <Link 
          to="/terms" 
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
        >
          <FileText className="h-3 w-3" />
          Terms
        </Link>
        <span className="text-muted-foreground/30">•</span>
        <Link 
          to="/privacy" 
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
        >
          <Shield className="h-3 w-3" />
          Privacy
        </Link>
      </div>
    </div>
  );
};

export default Footer;
