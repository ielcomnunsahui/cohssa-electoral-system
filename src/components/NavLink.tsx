import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import COHSSALogo from "@/assets/COHSSA_LOGO.png";

interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    return (
      <RouterNavLink
        ref={ref}
        to={to}
        className={({ isActive, isPending }) =>
          cn(className, isActive && activeClassName, isPending && pendingClassName)
        }
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

// ISECO Logo Component
export const Logo = ({ className = "h-12 w-12" }: { className?: string }) => {
  return <img src={ISECOLogo} alt="ISECO - Independent Students Electoral Committee" className={cn(className, "object-contain")} />;
};

// COHSSA Logo Component
export const COHSSALogoImg = ({ className = "h-12 w-12" }: { className?: string }) => {
  return <img src={COHSSALogo} alt="COHSSA - College of Health Sciences Students Association" className={cn(className, "object-contain")} />;
};

// Dual Logo Component for headers
export const DualLogo = ({ 
  className = "", 
  logoSize = "h-10 w-10",
  showLabels = false 
}: { 
  className?: string;
  logoSize?: string;
  showLabels?: boolean;
}) => {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex items-center gap-2">
        <Logo className={logoSize} />
        {showLabels && <span className="font-bold text-sm text-primary hidden sm:inline">ISECO</span>}
      </div>
      <div className="h-8 w-px bg-border" />
      <div className="flex items-center gap-2">
        <COHSSALogoImg className={logoSize} />
        {showLabels && <span className="font-bold text-sm text-accent hidden sm:inline">COHSSA</span>}
      </div>
    </div>
  );
};

export { NavLink };
