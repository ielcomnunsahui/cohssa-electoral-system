import { toast } from "sonner";

export const SUPPORT_CONTACT = {
  whatsapp: "+234 704 064 0646",
  email: "cohssahuiiseco@gmail.com",
  helpDeskUrl: "/voter/help"
};

interface ErrorConfig {
  title: string;
  description: string;
  solution: string;
  contactSupport?: boolean;
}

const errorMappings: Record<string, ErrorConfig> = {
  // Authentication Errors
  "Invalid login credentials": {
    title: "Login Failed",
    description: "The email or password you entered is incorrect.",
    solution: "Please check your credentials and try again. Use 'Forgot Password' if you need to reset.",
  },
  "Email not confirmed": {
    title: "Email Not Verified",
    description: "Your email address hasn't been confirmed yet.",
    solution: "Check your inbox for a verification email. Click the link to verify your account.",
  },
  "User not found": {
    title: "Account Not Found",
    description: "No account exists with this email or matric number.",
    solution: "Please register first or check if you entered the correct information.",
  },
  "Matric not found": {
    title: "Matric Number Not Registered",
    description: "This matric number is not in our voter database.",
    solution: "Please register as a voter first, or contact the Electoral Committee if you believe this is an error.",
    contactSupport: true,
  },
  
  // OTP Errors
  "Invalid or expired code": {
    title: "Invalid Code",
    description: "The OTP code you entered is incorrect or has expired.",
    solution: "Request a new code and enter it within 5 minutes.",
  },
  "Too many requests": {
    title: "Too Many Attempts",
    description: "You've made too many requests in a short time.",
    solution: "Please wait 15 minutes before trying again.",
    contactSupport: true,
  },
  "Rate limit exceeded": {
    title: "Request Limit Reached",
    description: "Too many OTP requests from this email.",
    solution: "Wait at least 1 hour before requesting another code. Contact support if urgent.",
    contactSupport: true,
  },
  "Account locked": {
    title: "Account Temporarily Locked",
    description: "Your account has been locked due to multiple failed attempts.",
    solution: "Wait 15 minutes for automatic unlock, or contact the Electoral Committee for immediate assistance.",
    contactSupport: true,
  },
  
  // Registration Errors
  "already registered": {
    title: "Already Registered",
    description: "An account with this matric number or email already exists.",
    solution: "Try logging in instead, or use 'Forgot Password' to recover your account.",
  },
  "pending verification": {
    title: "Verification Pending",
    description: "Your account is awaiting admin verification.",
    solution: "Please wait for the Electoral Committee to verify your registration. This usually takes 1-2 hours.",
    contactSupport: true,
  },
  
  // Voting Errors
  "Already voted": {
    title: "Vote Already Cast",
    description: "You have already voted in this election.",
    solution: "Each voter can only vote once. If you believe this is an error, contact the Electoral Committee immediately.",
    contactSupport: true,
  },
  "Voting not open": {
    title: "Voting Not Available",
    description: "Voting is not currently open.",
    solution: "Check the election timeline for voting hours. Voting will be available during the scheduled period.",
  },
  
  // Network Errors
  "Failed to fetch": {
    title: "Connection Error",
    description: "Unable to connect to the server.",
    solution: "Check your internet connection and try again. If the problem persists, the server may be temporarily unavailable.",
  },
  "Network error": {
    title: "Network Problem",
    description: "A network error occurred while processing your request.",
    solution: "Please check your internet connection and refresh the page.",
  },
  
  // Permission Errors
  "Permission denied": {
    title: "Access Denied",
    description: "You don't have permission to perform this action.",
    solution: "Make sure you're logged in with the correct account. Contact support if you need access.",
    contactSupport: true,
  },
  "Not authorized": {
    title: "Unauthorized",
    description: "Your session may have expired or you're not authorized.",
    solution: "Please log in again to continue.",
  },
};

export function showFriendlyError(error: Error | string, context?: string): void {
  const errorMessage = typeof error === "string" ? error : error.message;
  
  // Find matching error config
  let config: ErrorConfig | null = null;
  for (const [key, value] of Object.entries(errorMappings)) {
    if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
      config = value;
      break;
    }
  }

  if (config) {
    const supportMessage = config.contactSupport 
      ? `\n\nNeed help? Contact: ${SUPPORT_CONTACT.whatsapp}`
      : "";
    
    toast.error(config.title, {
      description: `${config.description}\n\n💡 ${config.solution}${supportMessage}`,
      duration: 8000,
      action: config.contactSupport ? {
        label: "Get Help",
        onClick: () => window.open("/voter/help", "_blank"),
      } : undefined,
    });
  } else {
    // Generic error with context
    const contextMessage = context ? ` while ${context}` : "";
    toast.error("Something went wrong", {
      description: `An error occurred${contextMessage}. Please try again.\n\nIf the problem persists, contact: ${SUPPORT_CONTACT.whatsapp}`,
      duration: 6000,
      action: {
        label: "Get Help",
        onClick: () => window.open("/voter/help", "_blank"),
      },
    });
  }
}

export function showSuccessToast(title: string, description?: string): void {
  toast.success(title, {
    description,
    duration: 4000,
  });
}

export function showInfoToast(title: string, description?: string): void {
  toast.info(title, {
    description,
    duration: 5000,
  });
}

export function showWarningToast(title: string, description?: string): void {
  toast.warning(title, {
    description,
    duration: 6000,
  });
}
