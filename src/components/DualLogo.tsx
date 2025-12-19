import cohssaLogo from "@/assets/COHSSA_LOGO.png";
import isecoLogo from "@/assets/ISECO_LOGO.png";

interface DualLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const DualLogo = ({ size = "md", className = "" }: DualLogoProps) => {
  const sizeClasses = {
    sm: "h-8",
    md: "h-12",
    lg: "h-16",
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img src={cohssaLogo} alt="COHSSA Logo" className={`${sizeClasses[size]} w-auto`} />
      <img src={isecoLogo} alt="ISECO Logo" className={`${sizeClasses[size]} w-auto`} />
    </div>
  );
};

export default DualLogo;
