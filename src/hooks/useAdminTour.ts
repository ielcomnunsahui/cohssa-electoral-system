import { useEffect, useCallback } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export const useAdminTour = () => {
  const startTour = useCallback(() => {
    const driverObj = driver({
      showProgress: true,
      showButtons: ["next", "previous", "close"],
      popoverClass: "admin-tour-popover",
      steps: [
        {
          element: "#tour-trigger",
          popover: {
            title: "Welcome to ISECO Admin! 👋",
            description:
              "This is the electoral management system control center. Let's walk through all the features to help you manage elections effectively.",
            side: "right",
            align: "start",
          },
        },
        {
          element: 'a[href="/admin/dashboard"]',
          popover: {
            title: "📊 Dashboard Overview",
            description:
              "Your real-time command center! View key metrics: total students, registered voters, submitted applications, active candidates, and live voter turnout. Charts provide visual insights into election progress.",
            side: "right",
            align: "start",
          },
        },
        {
          element: 'a[href="/admin/students"]',
          popover: {
            title: "📋 Student List Management",
            description:
              "Upload student records via CSV to verify voter eligibility. Only students in this list can register as voters. Download templates, manage records, and view department/level analytics.",
            side: "right",
            align: "start",
          },
        },
        {
          element: 'a[href="/admin/voters"]',
          popover: {
            title: "🗳️ Voter Management",
            description:
              "View and manage all registered voters. Verify voter identities, check registration status, and monitor who has voted. Essential for maintaining election integrity.",
            side: "right",
            align: "start",
          },
        },
        {
          element: 'a[href="/admin/aspirants"]',
          popover: {
            title: "📝 Aspirant Review",
            description:
              "Process candidate applications step-by-step: verify payment receipts → schedule screening interviews → record screening results → promote qualified aspirants to official candidates.",
            side: "right",
            align: "start",
          },
        },
        {
          element: 'a[href="/admin/candidates"]',
          popover: {
            title: "🏆 Candidate Management",
            description:
              "Manage final election candidates. View their profiles, edit manifestos, manage photos, and assign candidates to voting positions. Only candidates here appear on ballots.",
            side: "right",
            align: "start",
          },
        },
        {
          element: 'a[href="/admin/positions"]',
          popover: {
            title: "⚙️ Position Management",
            description:
              "Configure two types of positions: (1) Aspirant positions with fees, CGPA requirements, and eligibility rules. (2) Voting positions with vote types (single/multiple selection). Drag to reorder display.",
            side: "right",
            align: "start",
          },
        },
        {
          element: 'a[href="/admin/timeline"]',
          popover: {
            title: "📅 Election Timeline",
            description:
              "Control election phases: Aspirant Application → Voter Registration → Voting → Results. Set start/end times, activate stages, and control public visibility. Only active stages appear on the homepage.",
            side: "right",
            align: "start",
          },
        },
        {
          element: 'a[href="/admin/live-control"]',
          popover: {
            title: "🔴 Live Control & Results",
            description:
              "Monitor elections in real-time! Track voter turnout, view live vote counts with charts, freeze/resume voting if needed, publish final results, and export comprehensive reports.",
            side: "right",
            align: "start",
          },
        },
        {
          element: 'a[href="/admin/activity"]',
          popover: {
            title: "📜 Activity & Audit Logs",
            description:
              "All admin actions are logged for transparency. View who did what and when. Essential for accountability and investigating any issues during the election.",
            side: "right",
            align: "start",
          },
        },
        {
          element: 'a[href="/admin/content"]',
          popover: {
            title: "📚 Content Management",
            description:
              "Manage all portal content: university leaders, COHSSA executives, senate members, alumni profiles, and editorial content. Add photos, contact details, and biographical information.",
            side: "right",
            align: "start",
          },
        },
        {
          element: 'a[href="/admin/resources"]',
          popover: {
            title: "📖 Academic Resources",
            description:
              "Upload and manage academic materials: course outlines, past questions, e-materials, mock tests, and revision notes. Add Google Drive links, YouTube videos, and documents.",
            side: "right",
            align: "start",
          },
        },
        {
          element: 'a[href="/admin/textbooks"]',
          popover: {
            title: "📕 Textbook Marketplace",
            description:
              "Review student textbook listings for sale. Approve, add commission, and manage the buyer-seller workflow. Facilitate delivery and payment for sold textbooks.",
            side: "right",
            align: "start",
          },
        },
        {
          popover: {
            title: "🔒 Security Notes",
            description:
              "Remember: All actions are logged. Use two-factor authentication. Never share credentials. Log out when done. Contact tech support for any suspicious activity.",
          },
        },
        {
          popover: {
            title: "You're All Set! 🎉",
            description:
              "You now know how to manage the entire electoral process. Click 'Take a Tour' in the sidebar anytime to restart this guide. Good luck with the election!",
          },
        },
      ],
      onDestroyStarted: () => {
        if (driverObj.hasNextStep()) {
          const confirmed = confirm("Are you sure you want to exit the tour?");
          if (!confirmed) return;
        }
        driverObj.destroy();
      },
    });

    driverObj.drive();
  }, []);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("admin_tour_completed");
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        startTour();
        localStorage.setItem("admin_tour_completed", "true");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [startTour]);

  const resetTour = useCallback(() => {
    localStorage.removeItem("admin_tour_completed");
  }, []);

  return { startTour, resetTour };
};
