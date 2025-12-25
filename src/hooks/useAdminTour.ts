import { useEffect, useCallback, useState } from "react";
import { driver, DriveStep } from "driver.js";
import "driver.js/dist/driver.css";

interface UseAdminTourOptions {
  tourKey: string;
  steps: DriveStep[];
  autoStart?: boolean;
}

// Predefined tour steps for admin dashboard
export const adminDashboardTourSteps: DriveStep[] = [
  {
    element: '[data-tour="dashboard-stats"]',
    popover: {
      title: "📊 Quick Statistics",
      description: "View real-time statistics including voter count, aspirants, candidates, and votes cast.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-tour="quick-actions"]',
    popover: {
      title: "⚡ Quick Actions",
      description: "Access all management sections quickly. Each card takes you to a specific admin function.",
      side: "top",
      align: "center",
    },
  },
  {
    element: '[data-tour="dashboard-charts"]',
    popover: {
      title: "📉 Visual Analytics",
      description: "Charts showing voter demographics, registration trends, application status, and timeline progress.",
      side: "top",
      align: "center",
    },
  },
  {
    popover: {
      title: "✅ Dashboard Tour Complete!",
      description: "You now know the basics. Explore each section for detailed management options.",
    },
  },
];

// Predefined tour steps for aspirant review
export const aspirantReviewTourSteps: DriveStep[] = [
  {
    element: '[data-tour="aspirant-filters"]',
    popover: {
      title: "🔍 Filter Applications",
      description: "Search and filter aspirants by name, matric number, or status. Click status cards for quick filtering.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: '[data-tour="aspirant-list"]',
    popover: {
      title: "📋 Application List",
      description: "View all submitted applications. Click on any row to see full details and review the application.",
      side: "top",
      align: "center",
    },
  },
  {
    element: '[data-tour="aspirant-actions"]',
    popover: {
      title: "✔️ Review Actions",
      description: "Click 'Review' to verify payment, schedule screening, and approve or reject applications.",
      side: "left",
      align: "center",
    },
  },
  {
    popover: {
      title: "✅ Review Tour Complete!",
      description: "You can now efficiently review and process aspirant applications.",
    },
  },
];

// Predefined tour steps for timeline management
export const timelineManagementTourSteps: DriveStep[] = [
  {
    element: '[data-tour="add-stage"]',
    popover: {
      title: "➕ Add New Stage",
      description: "Create custom election stages with specific start/end times and visibility settings.",
      side: "bottom",
      align: "end",
    },
  },
  {
    element: '[data-tour="timeline-list"]',
    popover: {
      title: "📅 Election Stages",
      description: "Manage all election timeline stages. Each stage controls what features are available to users.",
      side: "top",
      align: "center",
    },
  },
  {
    element: '[data-tour="stage-controls"]',
    popover: {
      title: "🎛️ Stage Controls",
      description: "Toggle stages active/inactive and control public visibility. Active stages enable corresponding features on the homepage.",
      side: "left",
      align: "center",
    },
  },
  {
    popover: {
      title: "✅ Timeline Tour Complete!",
      description: "You can now manage the election timeline effectively.",
    },
  },
];

// Predefined tour steps for live control
export const liveControlTourSteps: DriveStep[] = [
  {
    element: '[data-tour="election-status"]',
    popover: {
      title: "🔴 Election Status",
      description: "Current status of the election - shows whether voting is live or paused.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-tour="live-stats"]',
    popover: {
      title: "📊 Live Statistics",
      description: "Real-time voting statistics including registered voters, votes cast, and turnout percentage.",
      side: "top",
      align: "center",
    },
  },
  {
    element: '[data-tour="display-controls"]',
    popover: {
      title: "🖥️ Display Controls",
      description: "Toggle Presentation Mode for projector-optimized dark theme with larger fonts. Use Fullscreen for maximum display area.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-tour="grid-columns"]',
    popover: {
      title: "📐 Grid Layout",
      description: "Configure how many columns to display for live results - Auto, 2, 3, or 4 columns to fit your screen size.",
      side: "left",
      align: "center",
    },
  },
  {
    element: '[data-tour="emergency-controls"]',
    popover: {
      title: "⚠️ Emergency Controls",
      description: "Pause/resume voting, publish final results, and export detailed election reports.",
      side: "left",
      align: "center",
    },
  },
  {
    popover: {
      title: "✅ Live Control Tour Complete!",
      description: "You can now monitor and control live election status with presentation-ready display options.",
    },
  },
];

export const useAdminTour = (options?: UseAdminTourOptions) => {
  const [hasSeenTour, setHasSeenTour] = useState(false);
  const tourKey = options?.tourKey || 'admin_tour';
  const steps = options?.steps || adminDashboardTourSteps;
  const autoStart = options?.autoStart ?? false;

  useEffect(() => {
    const seen = localStorage.getItem(`${tourKey}_completed`);
    setHasSeenTour(!!seen);
  }, [tourKey]);

  const startTour = useCallback(() => {
    const driverObj = driver({
      showProgress: true,
      showButtons: ["next", "previous", "close"],
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.75)',
      stagePadding: 8,
      popoverClass: 'admin-tour-popover',
      steps,
      onDestroyStarted: () => {
        localStorage.setItem(`${tourKey}_completed`, 'true');
        setHasSeenTour(true);
        if (driverObj.hasNextStep()) {
          const confirmed = confirm("Exit the tour?");
          if (!confirmed) return;
        }
        driverObj.destroy();
      },
    });
    driverObj.drive();
  }, [tourKey, steps]);

  useEffect(() => {
    if (autoStart && !hasSeenTour) {
      const timer = setTimeout(() => {
        startTour();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [autoStart, hasSeenTour, startTour]);

  const resetTour = useCallback(() => {
    localStorage.removeItem(`${tourKey}_completed`);
    setHasSeenTour(false);
  }, [tourKey]);

  return { startTour, resetTour, hasSeenTour };
};
