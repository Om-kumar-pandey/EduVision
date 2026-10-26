/**
 * EDUVISION — REGIONAL OFFICER DASHBOARD
 * Core Frontend JavaScript Logic
 * Static demonstration data, reactive table filtering, chart rendering, and interactive modals.
 */

// --- STATIC DEMONSTRATION DATA ---
const DASHBOARD_DATA = {
  officer: {
    name: "Ananya Sharma",
    designation: "Regional Officer",
    region: "North Region",
    lastLogin: "24 Oct 2026, 10:42 AM"
  },
  
  summary: {
    totalInstitutions: 124,
    totalCases: 386,
    pendingCases: 142,
    overdueCases: 28
  },

  caseStatus: [
    { label: "Pending", count: 142, percentage: "36.8%", color: "#1d6bf3", class: "blue" },
    { label: "In Progress", count: 118, percentage: "30.6%", color: "#f59e0b", class: "orange" },
    { label: "Resolved", count: 98, percentage: "25.4%", color: "#10b981", class: "green" },
    { label: "Overdue", count: 28, percentage: "7.3%", color: "#ef4444", class: "red" }
  ],

  bureauDistribution: [
    { bureau: "Regulation Bureau (RB)", count: 168, color: "#1d6bf3" },
    { bureau: "PGRC", count: 132, color: "#f59e0b" },
    { bureau: "Other Cells", count: 86, color: "#10b981" }
  ],

  monitoringCases: [
    {
      caseId: "CASE-2026-0143",
      institutionName: "ABC Institute of Technology",
      aicteId: "1-563728",
      bureau: "RB",
      category: "Regulation",
      assignedOfficer: "RB-03",
      status: "Pending",
      statusClass: "pending",
      expectedDisposalDate: "28 Oct 2026",
      details: "Compliance verification regarding statutory infrastructure norms and faculty roster validation."
    },
    {
      caseId: "CASE-2026-0178",
      institutionName: "Global Institute of Engineering",
      aicteId: "1-672934",
      bureau: "PGRC",
      category: "Student Grievance",
      assignedOfficer: "PGRC-02",
      status: "In Progress",
      statusClass: "in-progress",
      expectedDisposalDate: "02 Nov 2026",
      details: "Grievance received regarding examination fee structure and student scholarship disbursement."
    },
    {
      caseId: "CASE-2026-0210",
      institutionName: "Sunrise College of Engineering",
      aicteId: "1-774582",
      bureau: "RB",
      category: "Academic",
      assignedOfficer: "RB-01",
      status: "Resolved",
      statusClass: "resolved",
      expectedDisposalDate: "18 Oct 2026",
      details: "Academic syllabus alignment and accreditation document submission completed satisfactorily."
    },
    {
      caseId: "CASE-2026-0247",
      institutionName: "Techno Institute of Management",
      aicteId: "1-886421",
      bureau: "PGRC",
      category: "Infrastructure",
      assignedOfficer: "PGRC-03",
      status: "Overdue",
      statusClass: "overdue",
      expectedDisposalDate: "20 Oct 2026",
      details: "Inspection report on laboratory equipment safety standards overdue by 6 days. Escalation flagged."
    },
    {
      caseId: "CASE-2026-0281",
      institutionName: "National College of Pharmacy",
      aicteId: "1-992145",
      bureau: "Other Cells",
      category: "Other",
      assignedOfficer: "OC-01",
      status: "Transferred",
      statusClass: "transferred",
      expectedDisposalDate: "30 Oct 2026",
      details: "Case transferred to Specialized Pharmacy Cell for cross-statutory jurisdiction review."
    }
  ],

  institutions: [
    {
      institutionName: "ABC Institute of Tech",
      aicteId: "1-563728",
      district: "Noida",
      totalCases: 42,
      pending: 16,
      overdue: 5,
      status: "Pending Cases"
    },
    {
      institutionName: "Global Institute",
      aicteId: "1-672934",
      district: "Ghaziabad",
      totalCases: 36,
      pending: 12,
      overdue: 3,
      status: "Pending Cases"
    },
    {
      institutionName: "Sunrise College",
      aicteId: "1-774582",
      district: "Lucknow",
      totalCases: 28,
      pending: 9,
      overdue: 2,
      status: "Pending Cases"
    },
    {
      institutionName: "Techno Institute",
      aicteId: "1-886421",
      district: "Delhi",
      totalCases: 24,
      pending: 7,
      overdue: 1,
      status: "Pending Cases"
    },
    {
      institutionName: "National College",
      aicteId: "1-992145",
      district: "Kanpur",
      totalCases: 18,
      pending: 6,
      overdue: 0,
      status: "Active"
    }
  ],

  recentActivities: [
    {
      type: "building",
      colorClass: "blue",
      title: "Institution profile updated",
      subtitle: "ABES Engineering College",
      time: "2 hours ago"
    },
    {
      type: "sync",
      colorClass: "cyan",
      title: "Case status changed",
      subtitle: "CASE-2026-0143 → In Progress",
      time: "3 hours ago"
    },
    {
      type: "alert",
      colorClass: "red",
      title: "Overlap alert raised",
      subtitle: "ABC Institute of Technology",
      time: "4 hours ago"
    },
    {
      type: "user",
      colorClass: "teal",
      title: "Bureau assignment updated",
      subtitle: "CASE-2026-0078 → RB",
      time: "5 hours ago"
    },
    {
      type: "report",
      colorClass: "indigo",
      title: "Regional report generated",
      subtitle: "North Region - Monthly Report",
      time: "6 hours ago"
    }
  ],

  overlappingCaseDemo: {
    institution: "ABC Institute of Technology",
    instId: "INST-001",
    region: "North Region",
    case1: { id: "CASE-2026-001", bureau: "Regulation Bureau (RB)", category: "Affiliation Compliance", officer: "RB-03" },
    case2: { id: "CASE-2026-014", bureau: "Public Grievance Redressal Cell (PGRC)", category: "Faculty Representation", officer: "PGRC-02" },
    alertDate: "22 Oct 2026",
    status: "In Review"
  },

  // --- DASHBOARD 4: PENDING & OVERDUE CASES DATASET ---
  pendingCases: [
    {
      caseId: "CASE-2026-0247",
      institutionName: "Techno Institute of Management",
      bureau: "PGRC",
      category: "Infrastructure",
      status: "Overdue",
      statusClass: "overdue",
      dueDate: "20 Oct 2026",
      dueTag: "6 days overdue",
      dueCategory: "Overdue",
      priority: "Urgent",
      priorityClass: "urgent",
      subject: "Inspection report on laboratory equipment safety standards overdue by 6 days. Escalation flagged.",
      assignedOfficer: "PGRC-03"
    },
    {
      caseId: "CASE-2026-0118",
      institutionName: "Noida Institute of Engineering",
      bureau: "PGRC",
      category: "Infrastructure",
      status: "Overdue",
      statusClass: "overdue",
      dueDate: "19 Oct 2026",
      dueTag: "7 days overdue",
      dueCategory: "Overdue",
      priority: "Urgent",
      priorityClass: "urgent",
      subject: "Fire safety certification and workshop emergency exit validation overdue.",
      assignedOfficer: "PGRC-03"
    },
    {
      caseId: "CASE-2026-0012",
      institutionName: "Sunrise College of Engineering",
      bureau: "RB",
      category: "Academic",
      status: "Pending",
      statusClass: "pending",
      dueDate: "24 Oct 2026",
      dueTag: "Due Today",
      dueCategory: "Today",
      priority: "Urgent",
      priorityClass: "urgent",
      subject: "Faculty pay scale anomalies and 7th CPC service rule compliance verification.",
      assignedOfficer: "RB-01"
    },
    {
      caseId: "CASE-2026-0165",
      institutionName: "ABES Engineering College",
      bureau: "RB",
      category: "Regulation",
      status: "Pending",
      statusClass: "pending",
      dueDate: "24 Oct 2026",
      dueTag: "Due Today",
      dueCategory: "Today",
      priority: "High",
      priorityClass: "high",
      subject: "Statutory cadre ratio compliance and teacher-student ratio audit submission.",
      assignedOfficer: "RB-02"
    },
    {
      caseId: "CASE-2026-0094",
      institutionName: "Delhi Technical Campus",
      bureau: "RB",
      category: "Regulation",
      status: "In Progress",
      statusClass: "in-progress",
      dueDate: "26 Oct 2026",
      dueTag: "Due in 2 days",
      dueCategory: "Next7",
      priority: "High",
      priorityClass: "high",
      subject: "Annual intake quota expansion compliance review and land document title verification.",
      assignedOfficer: "RB-02"
    },
    {
      caseId: "CASE-2026-0143",
      institutionName: "ABC Institute of Technology",
      bureau: "RB",
      category: "Regulation",
      status: "Pending",
      statusClass: "pending",
      dueDate: "28 Oct 2026",
      dueTag: "Due in 4 days",
      dueCategory: "Next7",
      priority: "High",
      priorityClass: "high",
      subject: "Compliance verification regarding statutory infrastructure norms and faculty roster validation.",
      assignedOfficer: "RB-03"
    },
    {
      caseId: "CASE-2026-0281",
      institutionName: "National College of Pharmacy",
      bureau: "Other Cells",
      category: "Other",
      status: "Pending",
      statusClass: "pending",
      dueDate: "30 Oct 2026",
      dueTag: "Due in 6 days",
      dueCategory: "Next7",
      priority: "Medium",
      priorityClass: "medium",
      subject: "Case transferred to Specialized Pharmacy Cell for cross-statutory jurisdiction review.",
      assignedOfficer: "OC-01"
    },
    {
      caseId: "CASE-2026-0178",
      institutionName: "Global Institute of Engineering",
      bureau: "PGRC",
      category: "Student Grievance",
      status: "In Progress",
      statusClass: "in-progress",
      dueDate: "02 Nov 2026",
      dueTag: "Due in 9 days",
      dueCategory: "Next15",
      priority: "Medium",
      priorityClass: "medium",
      subject: "Grievance received regarding examination fee structure and student scholarship disbursement.",
      assignedOfficer: "PGRC-02"
    },
    {
      caseId: "CASE-2026-0305",
      institutionName: "IMS Engineering College",
      bureau: "RB",
      category: "Regulation",
      status: "In Progress",
      statusClass: "in-progress",
      dueDate: "05 Nov 2026",
      dueTag: "Due in 12 days",
      dueCategory: "Next15",
      priority: "Normal",
      priorityClass: "normal",
      subject: "Biometric attendance system integration with central regional grievance portal.",
      assignedOfficer: "RB-03"
    },
    {
      caseId: "CASE-2026-0319",
      institutionName: "Raj Kumar Goel Institute",
      bureau: "PGRC",
      category: "Academic",
      status: "Pending",
      statusClass: "pending",
      dueDate: "10 Nov 2026",
      dueTag: "Due in 17 days",
      dueCategory: "Next15",
      priority: "Normal",
      priorityClass: "normal",
      subject: "Student representation on delayed re-evaluation result declarations for previous semester.",
      assignedOfficer: "PGRC-01"
    }
  ],

  // --- DASHBOARD 5: OVERLAP ALERTS DATASET ---
  overlapAlerts: [
    {
      alertId: "OVL-2026-001",
      relatedCases: ["CASE-2026-0001", "CASE-2026-0014"],
      institution: "ABC Institute of Technology",
      bureauCombo: "RB ⟷ PGRC",
      matchReason: "Same Institution & Cross-Bureau Subject",
      alertType: "Same Institution",
      reviewStatus: "In Review",
      caseA: {
        id: "CASE-2026-0001",
        inst: "ABC Institute of Technology",
        aicteId: "1-563728",
        bureau: "Regulation Bureau (RB)",
        subject: "Affiliation Compliance & Faculty Rosters",
        status: "In Progress",
        statusClass: "in-progress",
        date: "12 Oct 2026",
        officer: "RB-03"
      },
      caseB: {
        id: "CASE-2026-0014",
        inst: "ABC Institute of Technology",
        aicteId: "1-563728",
        bureau: "Public Grievance Redressal Cell (PGRC)",
        subject: "Faculty Representation on Workload & Norms",
        status: "In Progress",
        statusClass: "in-progress",
        date: "18 Oct 2026",
        officer: "PGRC-02"
      }
    },
    {
      alertId: "OVL-2026-002",
      relatedCases: ["CASE-2026-0178", "CASE-2026-0192"],
      institution: "Global Institute of Engineering",
      bureauCombo: "PGRC ⟷ RB",
      matchReason: "Cross-Bureau Case — Fee & Faculty",
      alertType: "Cross-Bureau Case",
      reviewStatus: "Awaiting Review",
      caseA: {
        id: "CASE-2026-0178",
        inst: "Global Institute of Engineering",
        aicteId: "1-672934",
        bureau: "Public Grievance Redressal Cell (PGRC)",
        subject: "Examination Fee Structure & Scholarship",
        status: "In Progress",
        statusClass: "in-progress",
        date: "15 Oct 2026",
        officer: "PGRC-02"
      },
      caseB: {
        id: "CASE-2026-0192",
        inst: "Global Institute of Engineering",
        aicteId: "1-672934",
        bureau: "Regulation Bureau (RB)",
        subject: "Tuition Fee Regulatory Cap Compliance",
        status: "Pending",
        statusClass: "pending",
        date: "20 Oct 2026",
        officer: "RB-01"
      }
    },
    {
      alertId: "OVL-2026-003",
      relatedCases: ["CASE-2026-0247", "CASE-2026-0260"],
      institution: "Techno Institute of Management",
      bureauCombo: "PGRC ⟷ Other Cells",
      matchReason: "Same Subject — Lab Equipment Standards",
      alertType: "Same Subject",
      reviewStatus: "Awaiting Review",
      caseA: {
        id: "CASE-2026-0247",
        inst: "Techno Institute of Management",
        aicteId: "1-886421",
        bureau: "PGRC",
        subject: "Laboratory Safety Standards & Equipment",
        status: "Overdue",
        statusClass: "overdue",
        date: "05 Oct 2026",
        officer: "PGRC-03"
      },
      caseB: {
        id: "CASE-2026-0260",
        inst: "Techno Institute of Management",
        aicteId: "1-886421",
        bureau: "Specialized Safety Cell",
        subject: "Electrical Safety & Fire Clearance Audit",
        status: "Pending",
        statusClass: "pending",
        date: "19 Oct 2026",
        officer: "OC-02"
      }
    },
    {
      alertId: "OVL-2026-004",
      relatedCases: ["CASE-2026-0012", "CASE-2026-0035"],
      institution: "Sunrise College of Engineering",
      bureauCombo: "RB ⟷ PGRC",
      matchReason: "Similar Complaint Reference — Faculty",
      alertType: "Similar Complaint Reference",
      reviewStatus: "Reviewed",
      caseA: {
        id: "CASE-2026-0012",
        inst: "Sunrise College of Engineering",
        aicteId: "1-774582",
        bureau: "Regulation Bureau (RB)",
        subject: "Faculty Pay Scale Anomalies",
        status: "Pending",
        statusClass: "pending",
        date: "10 Oct 2026",
        officer: "RB-01"
      },
      caseB: {
        id: "CASE-2026-0035",
        inst: "Sunrise College of Engineering",
        aicteId: "1-774582",
        bureau: "PGRC",
        subject: "Teacher Gratuity & Service Book Verification",
        status: "Resolved",
        statusClass: "resolved",
        date: "14 Oct 2026",
        officer: "PGRC-01"
      }
    },
    {
      alertId: "OVL-2026-005",
      relatedCases: ["CASE-2026-0094", "CASE-2026-0112"],
      institution: "Delhi Technical Campus",
      bureauCombo: "RB ⟷ RB",
      matchReason: "Same Institution — Intake Quota Verification",
      alertType: "Same Institution",
      reviewStatus: "Awaiting Review",
      caseA: {
        id: "CASE-2026-0094",
        inst: "Delhi Technical Campus",
        aicteId: "1-459812",
        bureau: "Regulation Bureau (RB)",
        subject: "Intake Quota Expansion & Built-up Area",
        status: "In Progress",
        statusClass: "in-progress",
        date: "14 Oct 2026",
        officer: "RB-02"
      },
      caseB: {
        id: "CASE-2026-0112",
        inst: "Delhi Technical Campus",
        aicteId: "1-459812",
        bureau: "Regulation Bureau (RB)",
        subject: "Faculty Requirement for New Computer Science Division",
        status: "Pending",
        statusClass: "pending",
        date: "18 Oct 2026",
        officer: "RB-02"
      }
    },
    {
      alertId: "OVL-2026-006",
      relatedCases: ["CASE-2026-0118", "CASE-2026-0130"],
      institution: "Noida Institute of Engineering",
      bureauCombo: "PGRC ⟷ Other Cells",
      matchReason: "Similar Grievance Reference — Safety",
      alertType: "Similar Complaint Reference",
      reviewStatus: "In Review",
      caseA: {
        id: "CASE-2026-0118",
        inst: "Noida Institute of Engineering",
        aicteId: "1-334589",
        bureau: "PGRC",
        subject: "Laboratory Ventilation & Chemistry Lab Safety",
        status: "Overdue",
        statusClass: "overdue",
        date: "08 Oct 2026",
        officer: "PGRC-03"
      },
      caseB: {
        id: "CASE-2026-0130",
        inst: "Noida Institute of Engineering",
        aicteId: "1-334589",
        bureau: "Specialized Safety Cell",
        subject: "Disaster Management & Evacuation Clearance",
        status: "Pending",
        statusClass: "pending",
        date: "16 Oct 2026",
        officer: "OC-01"
      }
    }
  ],

  // --- DASHBOARD 6: REGIONAL REPORTS SUMMARY & INSTITUTIONS DATASET ---
  reportsSummary: {
    totalCases: 386,
    resolvedCases: 98,
    pendingCases: 142,
    overdueCases: 28,
    inProgressCases: 118
  },

  reportsInstitutions: [
    { name: "ABC Institute of Technology", district: "Noida", total: 42, pending: 16, inProgress: 13, resolved: 8, overdue: 5, rate: "19.0%" },
    { name: "Global Institute of Engineering", district: "Ghaziabad", total: 36, pending: 12, inProgress: 11, resolved: 10, overdue: 3, rate: "27.8%" },
    { name: "Sunrise College of Engineering", district: "Lucknow", total: 28, pending: 9, inProgress: 8, resolved: 9, overdue: 2, rate: "32.1%" },
    { name: "Techno Institute of Management", district: "Delhi", total: 24, pending: 7, inProgress: 8, resolved: 8, overdue: 1, rate: "33.3%" },
    { name: "National College of Pharmacy", district: "Kanpur", total: 18, pending: 6, inProgress: 5, resolved: 7, overdue: 0, rate: "38.9%" },
    { name: "ABES Engineering College", district: "Ghaziabad", total: 22, pending: 8, inProgress: 6, resolved: 6, overdue: 2, rate: "27.3%" }
  ],

  // --- DASHBOARD 7: RECENT ACTIVITIES FULL CHRONOLOGICAL DATASET ---
  allActivities: [
    {
      id: "ACT-001",
      date: "Today",
      time: "10:15 AM",
      fullDateTime: "24 Oct 2026, 10:15 AM",
      type: "Case Status Changed",
      colorClass: "cyan",
      caseId: "CASE-2026-0143",
      institution: "ABC Institute of Technology",
      performedBy: "RB-03",
      desc: "Status changed from Pending to In Progress following compliance document submission."
    },
    {
      id: "ACT-002",
      date: "Today",
      time: "09:40 AM",
      fullDateTime: "24 Oct 2026, 09:40 AM",
      type: "Institution Response Received",
      colorClass: "blue",
      caseId: "CASE-2026-0178",
      institution: "Global Institute of Engineering",
      performedBy: "Registrar Office",
      desc: "Uploaded compliance documentation regarding student scholarship disbursement and fee structure."
    },
    {
      id: "ACT-003",
      date: "Today",
      time: "08:55 AM",
      fullDateTime: "24 Oct 2026, 08:55 AM",
      type: "Overlap Reviewed",
      colorClass: "red",
      caseId: "CASE-2026-0001 & CASE-2026-0014",
      institution: "ABC Institute of Technology",
      performedBy: "Officer Ananya Sharma",
      desc: "Potential overlap acknowledged. Joint coordination session scheduled between RB and PGRC."
    },
    {
      id: "ACT-004",
      date: "Yesterday",
      time: "04:30 PM",
      fullDateTime: "23 Oct 2026, 04:30 PM",
      type: "Case Assigned",
      colorClass: "teal",
      caseId: "CASE-2026-0078",
      institution: "Meerut Institute of Technology",
      performedBy: "Regional Officer",
      desc: "Allocated to Regulation Bureau (RB-02) for statutory infrastructure inspection."
    },
    {
      id: "ACT-005",
      date: "Yesterday",
      time: "02:15 PM",
      fullDateTime: "23 Oct 2026, 02:15 PM",
      type: "Case Status Changed",
      colorClass: "orange",
      caseId: "CASE-2026-0247",
      institution: "Techno Institute of Management",
      performedBy: "System Monitoring",
      desc: "Case exceeded statutory window by 6 days. Automated escalation notice dispatched to institution."
    },
    {
      id: "ACT-006",
      date: "Yesterday",
      time: "11:20 AM",
      fullDateTime: "23 Oct 2026, 11:20 AM",
      type: "Report Generated",
      colorClass: "indigo",
      caseId: "Multiple Cases",
      institution: "North Region Summary",
      performedBy: "Officer Ananya Sharma",
      desc: "North Region Monthly Grievance & Compliance Summary Report compiled."
    },
    {
      id: "ACT-007",
      date: "Past7",
      time: "03:45 PM",
      fullDateTime: "22 Oct 2026, 03:45 PM",
      type: "Overlap Reviewed",
      colorClass: "red",
      caseId: "CASE-2026-0001 & CASE-2026-0014",
      institution: "ABC Institute of Technology",
      performedBy: "Rule Engine",
      desc: "Potential overlap rule triggered for matching institution code INST-001 and overlapping complaint window."
    },
    {
      id: "ACT-008",
      date: "Past7",
      time: "11:10 AM",
      fullDateTime: "22 Oct 2026, 11:10 AM",
      type: "Case Status Changed",
      colorClass: "green",
      caseId: "CASE-2026-0210",
      institution: "Sunrise College of Engineering",
      performedBy: "RB-01",
      desc: "Case resolved following verification of syllabus alignment and faculty roster."
    }
  ],

  // --- DASHBOARD 8: NOTIFICATIONS FULL DATASET ---
  allNotifications: [
    {
      id: "NOTIF-01",
      title: "Overdue Grievance Escalation",
      desc: "Case CASE-2026-0247 (Techno Institute of Management) is overdue by 6 days. Laboratory safety inspection report overdue. Immediate escalation required.",
      type: "Overdue Reminder",
      typeClass: "red",
      dateTime: "24 Oct 2026, 08:30 AM",
      caseId: "CASE-2026-0247",
      read: false,
      priority: "Urgent",
      priorityClass: "urgent",
      isImportant: true
    },
    {
      id: "NOTIF-02",
      title: "Cross-Bureau Overlap Alert Raised",
      desc: "Potential case overlap identified between CASE-2026-0001 (RB) and CASE-2026-0014 (PGRC) for ABC Institute of Technology. Coordination required.",
      type: "Overlap Alert",
      typeClass: "orange",
      dateTime: "24 Oct 2026, 07:45 AM",
      caseId: "CASE-2026-0001",
      read: false,
      priority: "High",
      priorityClass: "high",
      isImportant: true
    },
    {
      id: "NOTIF-03",
      title: "Disposal Deadline Today",
      desc: "CASE-2026-0012 (Sunrise College of Engineering) target resolution deadline expires today, 24 Oct 2026. Action required by assigned officer.",
      type: "Due Today Reminder",
      typeClass: "orange",
      dateTime: "24 Oct 2026, 07:15 AM",
      caseId: "CASE-2026-0012",
      read: false,
      priority: "High",
      priorityClass: "high",
      isImportant: true
    },
    {
      id: "NOTIF-04",
      title: "Institution Compliance Response Uploaded",
      desc: "Global Institute of Engineering submitted response documents for CASE-2026-0178 regarding scholarship disbursement verification.",
      type: "Institution Response Received",
      typeClass: "blue",
      dateTime: "23 Oct 2026, 05:20 PM",
      caseId: "CASE-2026-0178",
      read: false,
      priority: "Normal",
      priorityClass: "normal",
      isImportant: false
    },
    {
      id: "NOTIF-05",
      title: "New Case Assigned to Jurisdiction",
      desc: "Case CASE-2026-0281 (National College of Pharmacy) transferred from Central Roster to North Region monitoring jurisdiction.",
      type: "New Case Assignment",
      typeClass: "cyan",
      dateTime: "23 Oct 2026, 02:45 PM",
      caseId: "CASE-2026-0281",
      read: false,
      priority: "Normal",
      priorityClass: "normal",
      isImportant: false
    },
    {
      id: "NOTIF-06",
      title: "Case Status Updated: Resolved",
      desc: "CASE-2026-0210 (Sunrise College of Engineering) has been marked Resolved by Regulation Bureau. Compliance confirmed.",
      type: "Case Status Update",
      typeClass: "green",
      dateTime: "22 Oct 2026, 04:30 PM",
      caseId: "CASE-2026-0210",
      read: true,
      priority: "Normal",
      priorityClass: "normal",
      isImportant: false
    },
    {
      id: "NOTIF-07",
      title: "Monthly Regional Summary Available",
      desc: "Consolidated monthly complaint volume and disposal performance report compiled for North Region.",
      type: "Regional Report Generated",
      typeClass: "indigo",
      dateTime: "22 Oct 2026, 01:15 PM",
      caseId: "North Region Report",
      read: true,
      priority: "Normal",
      priorityClass: "normal",
      isImportant: false
    },
    {
      id: "NOTIF-08",
      title: "Overlap Determination Review Completed",
      desc: "Overlap inquiry between CASE-2026-0012 and CASE-2026-0035 reviewed by reviewing officer. Handled as independent cases.",
      type: "Overlap Reviewed",
      typeClass: "teal",
      dateTime: "21 Oct 2026, 11:00 AM",
      caseId: "CASE-2026-0012",
      read: true,
      priority: "Normal",
      priorityClass: "normal",
      isImportant: false
    }
  ]
};

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  initDoughnutChart();
  initBarChart();
  initMonitoringTable();
  initInstitutionsTable();
  initFilterControls();
  initSidebarToggle();
  initRegionSelector();
  initGlobalSearch();
  initModals();
  initQuickActions();

  // Initialize the 6 new dashboard sections
  initPendingCasesSection();
  initOverlapAlertsSection();
  initRegionalReportsSection();
  initRecentActivitiesSection();
  initNotificationsSection();
  initHelpSupportSection();
  initSectionRouting();
});

// --- DOUGHNUT CHART RENDERING (WITH EXACT INNER PERCENTAGES MATCHING REFERENCE) ---
function initDoughnutChart() {
  const svg = document.getElementById("caseStatusDoughnut");
  if (!svg) return;

  const total = DASHBOARD_DATA.summary.totalCases; // 386
  const radius = 45;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius; // ~282.74
  
  let accumulatedOffset = 0;
  let currentStartFraction = 0;
  
  // Clear any existing content
  svg.innerHTML = "";

  // Slices layer
  const slicesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  slicesGroup.setAttribute("transform", "rotate(-90 60 60)");

  // Labels layer
  const labelsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");

  DASHBOARD_DATA.caseStatus.forEach((item) => {
    const fraction = item.count / total;
    const dashLength = fraction * circumference;
    const gapLength = circumference - dashLength;

    // Segment Circle
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", "60");
    circle.setAttribute("cy", "60");
    circle.setAttribute("r", radius.toString());
    circle.setAttribute("fill", "transparent");
    circle.setAttribute("stroke", item.color);
    circle.setAttribute("stroke-width", strokeWidth.toString());
    circle.setAttribute("stroke-dasharray", `${dashLength} ${gapLength}`);
    circle.setAttribute("stroke-dashoffset", (-accumulatedOffset).toString());
    circle.setAttribute("style", "transition: stroke-width 0.2s ease, opacity 0.2s ease; cursor: pointer;");

    // Interactive tooltip / hover on slices
    circle.addEventListener("mouseenter", () => {
      circle.setAttribute("stroke-width", (strokeWidth + 3).toString());
      showToast(`${item.label}: ${item.count} cases (${item.percentage})`);
    });
    circle.addEventListener("mouseleave", () => {
      circle.setAttribute("stroke-width", strokeWidth.toString());
    });

    slicesGroup.appendChild(circle);

    // Calculate percentage text placement inside slice
    const midFraction = currentStartFraction + fraction / 2;
    // Angle in degrees where -90 is 12 o'clock
    const midAngleDeg = -90 + midFraction * 360;
    const midAngleRad = (midAngleDeg * Math.PI) / 180;
    const labelX = 60 + radius * Math.cos(midAngleRad);
    const labelY = 60 + radius * Math.sin(midAngleRad);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", labelX.toFixed(1));
    text.setAttribute("y", labelY.toFixed(1));
    text.setAttribute("fill", "#ffffff");
    text.setAttribute("font-size", item.count < 30 ? "6.8" : "7.2");
    text.setAttribute("font-weight", "700");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "central");
    text.setAttribute("font-family", "Inter, sans-serif");
    text.setAttribute("style", "pointer-events: none; text-shadow: 0 1px 2px rgba(0,0,0,0.3);");
    text.textContent = item.percentage;

    labelsGroup.appendChild(text);

    accumulatedOffset += dashLength;
    currentStartFraction += fraction;
  });

  svg.appendChild(slicesGroup);
  svg.appendChild(labelsGroup);
}

// --- VERTICAL BAR CHART RENDERING (SVG BASED) ---
function initBarChart() {
  const container = document.getElementById("bureauBarChart");
  if (!container) return;

  const maxVal = 200;
  const chartHeight = 90;
  const chartWidth = 280;
  
  // 3 Bars configuration
  const bars = DASHBOARD_DATA.bureauDistribution;
  const barWidth = 36;
  const barPositions = [45, 140, 235];

  let svgHtml = `
    <svg viewBox="0 0 ${chartWidth} 125" class="barchart-svg" xmlns="http://www.w3.org/2000/svg">
      <!-- Horizontal Grid Lines -->
      <line x1="26" y1="10" x2="${chartWidth}" y2="10" stroke="#f1f5f9" stroke-width="1" />
      <line x1="26" y1="32.5" x2="${chartWidth}" y2="32.5" stroke="#f1f5f9" stroke-width="1" />
      <line x1="26" y1="55" x2="${chartWidth}" y2="55" stroke="#f1f5f9" stroke-width="1" />
      <line x1="26" y1="77.5" x2="${chartWidth}" y2="77.5" stroke="#f1f5f9" stroke-width="1" />
      <line x1="26" y1="100" x2="${chartWidth}" y2="100" stroke="#e2e8f0" stroke-width="1.2" />

      <!-- Y Axis Values -->
      <text x="20" y="13" font-size="8.5" fill="#94a3b8" text-anchor="end" font-family="Inter, sans-serif">200</text>
      <text x="20" y="35.5" font-size="8.5" fill="#94a3b8" text-anchor="end" font-family="Inter, sans-serif">150</text>
      <text x="20" y="58" font-size="8.5" fill="#94a3b8" text-anchor="end" font-family="Inter, sans-serif">100</text>
      <text x="20" y="80.5" font-size="8.5" fill="#94a3b8" text-anchor="end" font-family="Inter, sans-serif">50</text>
      <text x="20" y="103" font-size="8.5" fill="#94a3b8" text-anchor="end" font-family="Inter, sans-serif">0</text>
  `;

  bars.forEach((item, index) => {
    const xPos = barPositions[index];
    const bHeight = (item.count / maxVal) * chartHeight;
    const yPos = 100 - bHeight;

    svgHtml += `
      <!-- Bar ${index + 1} -->
      <g class="bar-group" style="cursor: pointer;" data-bureau="${item.bureau}" data-count="${item.count}">
        <!-- Value Label Above Bar -->
        <text x="${xPos + barWidth / 2}" y="${yPos - 4}" font-size="9.5" font-weight="700" fill="#0f172a" text-anchor="middle" font-family="Inter, sans-serif">${item.count}</text>
        <!-- Bar Rect with Flat Top -->
        <rect x="${xPos}" y="${yPos}" width="${barWidth}" height="${bHeight}" fill="${item.color}" rx="2" ry="2" />
        <!-- X Axis Label -->
        <text x="${xPos + barWidth / 2}" y="115" font-size="8" font-weight="600" fill="#475569" text-anchor="middle" font-family="Inter, sans-serif">
          ${item.bureau}
        </text>
      </g>
    `;
  });

  svgHtml += `</svg>`;
  container.innerHTML = svgHtml;

  // Add event listeners for bar hover
  container.querySelectorAll(".bar-group").forEach((group) => {
    group.addEventListener("mouseenter", () => {
      const bureau = group.getAttribute("data-bureau");
      const count = group.getAttribute("data-count");
      showToast(`${bureau}: ${count} active regional cases`);
    });
  });
}

// --- CASES MONITORING TABLE RENDERING ---
function initMonitoringTable(cases = DASHBOARD_DATA.monitoringCases) {
  const tbody = document.getElementById("monitoringTableBody");
  if (!tbody) return;

  if (cases.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 24px; color: #94a3b8;">No matching cases found in your region.</td></tr>`;
    return;
  }

  tbody.innerHTML = cases.map((c) => `
    <tr>
      <td class="cell-code">${escapeHtml(c.caseId)}</td>
      <td class="cell-bold">${escapeHtml(c.institutionName)}</td>
      <td class="cell-muted">${escapeHtml(c.aicteId)}</td>
      <td><span class="cell-badge">${escapeHtml(c.bureau)}</span></td>
      <td>${escapeHtml(c.category)}</td>
      <td><span class="cell-code">${escapeHtml(c.assignedOfficer)}</span></td>
      <td><span class="status-badge ${c.statusClass}">${escapeHtml(c.status)}</span></td>
      <td class="cell-muted">${escapeHtml(c.expectedDisposalDate)}</td>
      <td>
        <button class="btn-action-outline" onclick="openCaseModal('${c.caseId}')" aria-label="View details for ${c.caseId}">
          View Details
        </button>
      </td>
    </tr>
  `).join("");
}

// --- INSTITUTIONS TABLE RENDERING ---
function initInstitutionsTable(institutions = DASHBOARD_DATA.institutions) {
  const tbody = document.getElementById("institutionsTableBody");
  if (!tbody) return;

  if (institutions.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 20px; color: #94a3b8;">No institutions match the filter.</td></tr>`;
    return;
  }

  tbody.innerHTML = institutions.map((inst) => `
    <tr>
      <td class="cell-bold">${escapeHtml(inst.institutionName)}</td>
      <td class="cell-muted">${escapeHtml(inst.aicteId)}</td>
      <td>${escapeHtml(inst.district)}</td>
      <td class="cell-num-bold">${inst.totalCases}</td>
      <td>${inst.pending}</td>
      <td><span class="${inst.overdue > 0 ? 'cell-urgent-red' : ''}">${inst.overdue}</span></td>
      <td>
        <button class="btn-action-view" onclick="openInstitutionModal('${inst.aicteId}')" aria-label="View institution ${inst.institutionName}">
          View
        </button>
      </td>
    </tr>
  `).join("");
}

// --- FILTER CONTROLS FOR INSTITUTIONS ---
function initFilterControls() {
  const searchInput = document.getElementById("instSearchInput");
  const districtSelect = document.getElementById("instDistrictSelect");
  const statusSelect = document.getElementById("instStatusSelect");

  function applyFilters() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const district = districtSelect ? districtSelect.value : "All";
    const status = statusSelect ? statusSelect.value : "All";

    const filtered = DASHBOARD_DATA.institutions.filter((item) => {
      const matchesQuery = !query || 
        item.institutionName.toLowerCase().includes(query) || 
        item.aicteId.toLowerCase().includes(query) ||
        item.district.toLowerCase().includes(query);

      const matchesDistrict = district === "All" || item.district.toLowerCase() === district.toLowerCase();

      let matchesStatus = true;
      if (status === "Pending Cases") {
        matchesStatus = item.pending > 0;
      } else if (status === "Overdue Cases") {
        matchesStatus = item.overdue > 0;
      } else if (status === "Active") {
        matchesStatus = true;
      }

      return matchesQuery && matchesDistrict && matchesStatus;
    });

    initInstitutionsTable(filtered);
  }

  if (searchInput) searchInput.addEventListener("input", applyFilters);
  if (districtSelect) districtSelect.addEventListener("change", applyFilters);
  if (statusSelect) statusSelect.addEventListener("change", applyFilters);
}

// --- GLOBAL SEARCH ---
function initGlobalSearch() {
  const globalSearch = document.getElementById("globalSearchInput");
  if (!globalSearch) return;

  globalSearch.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!query) {
      initMonitoringTable();
      initInstitutionsTable();
      return;
    }

    const filteredCases = DASHBOARD_DATA.monitoringCases.filter((c) =>
      c.caseId.toLowerCase().includes(query) ||
      c.institutionName.toLowerCase().includes(query) ||
      c.category.toLowerCase().includes(query) ||
      c.bureau.toLowerCase().includes(query)
    );

    const filteredInstitutions = DASHBOARD_DATA.institutions.filter((i) =>
      i.institutionName.toLowerCase().includes(query) ||
      i.aicteId.toLowerCase().includes(query) ||
      i.district.toLowerCase().includes(query)
    );

    initMonitoringTable(filteredCases);
    initInstitutionsTable(filteredInstitutions);
  });
}

// --- SIDEBAR NAVIGATION & COLLAPSE CONTROLLER ---
function initSidebarToggle() {
  const toggleBtn = document.getElementById("sidebarToggleBtn");
  const closeBtn = document.getElementById("sidebarCloseBtn");
  const sidebar = document.getElementById("appSidebar");
  const backdrop = document.getElementById("sidebarBackdrop");
  const navItems = document.querySelectorAll(".sidebar .nav-item");

  if (!sidebar) return;

  const isMobile = () => window.innerWidth <= 1024;

  const isSidebarOpen = () => {
    if (isMobile()) {
      return document.body.classList.contains("sidebar-open") || sidebar.classList.contains("mobile-open");
    } else {
      return !document.body.classList.contains("sidebar-collapsed") && !document.documentElement.classList.contains("sidebar-init-collapsed");
    }
  };

  const updateAriaState = (isOpen) => {
    if (toggleBtn) {
      toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      toggleBtn.setAttribute("aria-label", isOpen ? "Close navigation sidebar" : "Open navigation sidebar");
      toggleBtn.setAttribute("title", isOpen ? "Close navigation sidebar (Esc)" : "Open navigation sidebar (Alt+S)");
    }
  };

  const openSidebar = () => {
    // Ensure early preload and collapsed classes are completely removed from root and body
    document.documentElement.classList.remove("sidebar-init-collapsed");
    document.documentElement.classList.remove("sidebar-collapsed");
    document.body.classList.remove("sidebar-collapsed");

    if (isMobile()) {
      document.body.classList.add("sidebar-open");
      sidebar.classList.add("mobile-open");
      if (backdrop) {
        backdrop.classList.add("active");
        backdrop.classList.add("open");
      }
    }

    try {
      sessionStorage.setItem("eduvision_sidebar_state", "expanded");
    } catch (e) {}
    updateAriaState(true);
  };

  const closeSidebar = () => {
    // Clean up early preload class so transitions and subsequent toggles work smoothly
    document.documentElement.classList.remove("sidebar-init-collapsed");

    if (isMobile()) {
      document.body.classList.remove("sidebar-open");
      sidebar.classList.remove("mobile-open");
      if (backdrop) {
        backdrop.classList.remove("active");
        backdrop.classList.remove("open");
      }
    } else {
      document.body.classList.add("sidebar-collapsed");
    }

    try {
      sessionStorage.setItem("eduvision_sidebar_state", "collapsed");
    } catch (e) {}
    updateAriaState(false);
  };

  const toggleSidebar = () => {
    if (isSidebarOpen()) {
      closeSidebar();
    } else {
      openSidebar();
    }
  };

  // Toggle button event
  if (toggleBtn) {
    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleSidebar();
    });
  }

  // Close button inside sidebar header (if present)
  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeSidebar();
    });
  }

  // Backdrop click to close on mobile
  if (backdrop) {
    backdrop.addEventListener("click", () => {
      closeSidebar();
    });
  }

  // Auto-collapse sidebar when clicking any navigation item
  navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      const href = item.getAttribute("href");

      // Slide sidebar completely away on every navigation click
      closeSidebar();

      // Handle page or section routing
      if (href) {
        if (href.startsWith("#")) {
          e.preventDefault();
          const targetViewId = HASH_TO_VIEW[href] || (href === "#" ? "viewDashboard" : null);
          if (targetViewId) {
            switchDashboardView(targetViewId, true);
          }
        } else if (!href.startsWith("javascript")) {
          // Multi-page navigation (e.g. regional-institutions.html)
          e.preventDefault();
          setTimeout(() => {
            window.location.href = href;
          }, 180);
        }
      }
    });
  });

  // Keyboard accessibility: Escape key closes sidebar
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isSidebarOpen()) {
      closeSidebar();
    } else if (e.key === "s" && e.altKey) {
      e.preventDefault();
      toggleSidebar();
    }
  });

  // Handle window resizing cleanly to prevent stuck backdrop / states
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!isMobile()) {
        if (backdrop) {
          backdrop.classList.remove("active");
          backdrop.classList.remove("open");
        }
        document.body.classList.remove("sidebar-open");
        sidebar.classList.remove("mobile-open");
      }
      updateAriaState(isSidebarOpen());
    }, 100);
  });

  // Ensure the early preload class is cleaned up once the script takes control
  if (document.documentElement.classList.contains("sidebar-init-collapsed")) {
    requestAnimationFrame(() => {
      document.documentElement.classList.remove("sidebar-init-collapsed");
    });
  }

  // Initialize from sessionStorage state if previously collapsed
  try {
    const savedState = sessionStorage.getItem("eduvision_sidebar_state");
    if (savedState === "collapsed") {
      closeSidebar();
    } else if ((savedState === "expanded" || savedState === "open") && !isMobile()) {
      openSidebar();
    } else {
      updateAriaState(isSidebarOpen());
    }
  } catch (err) {
    updateAriaState(isSidebarOpen());
  }
}

// --- REGION SELECTOR DROPDOWN ---
function initRegionSelector() {
  const selector = document.getElementById("regionSelector");
  const btn = document.getElementById("regionSelectorBtn");
  const items = document.querySelectorAll(".region-dropdown-item");

  if (!selector || !btn) return;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    selector.classList.toggle("open");
  });

  items.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      const newRegion = item.getAttribute("data-region");
      const currentRegionLabel = document.getElementById("currentRegionLabel");
      const bannerBadge = document.getElementById("bannerRegionBadge");

      if (currentRegionLabel) currentRegionLabel.textContent = newRegion;
      if (bannerBadge) {
        bannerBadge.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg> ${newRegion}`;
      }

      items.forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
      selector.classList.remove("open");
      showToast(`Switched active region to ${newRegion}`);
    });
  });

  document.addEventListener("click", () => {
    selector.classList.remove("open");
  });
}

// --- MODAL DIALOGS ---
function initModals() {
  const overlay = document.getElementById("modalOverlay");
  const closeBtn = document.getElementById("modalCloseBtn");

  if (!overlay || !closeBtn) return;

  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

function openModal(title, contentHtml) {
  const overlay = document.getElementById("modalOverlay");
  const titleEl = document.getElementById("modalTitle");
  const bodyEl = document.getElementById("modalBody");

  if (!overlay || !titleEl || !bodyEl) return;

  titleEl.textContent = title;
  bodyEl.innerHTML = contentHtml;
  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  const overlay = document.getElementById("modalOverlay");
  if (!overlay) return;
  overlay.classList.remove("open");
  document.body.style.overflow = "";
}

// Modal View Details for Case
window.openCaseModal = function(caseId) {
  const c = DASHBOARD_DATA.monitoringCases.find((item) => item.caseId === caseId);
  if (!c) return;

  const content = `
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0;">
        <div>
          <span style="font-size: 0.72rem; color: #64748b; font-weight: 600;">CASE RECORD</span>
          <h3 style="font-size: 1.15rem; font-weight: 800; color: #0f172a; margin-top: 2px;">${escapeHtml(c.caseId)}</h3>
        </div>
        <span class="status-badge ${c.statusClass}" style="font-size: 0.78rem; padding: 4px 10px;">${escapeHtml(c.status)}</span>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #f8fafc; padding: 12px; border-radius: 8px;">
        <div>
          <span style="font-size: 0.7rem; color: #64748b;">Institution Name</span>
          <p style="font-size: 0.82rem; font-weight: 700; color: #1e293b;">${escapeHtml(c.institutionName)}</p>
        </div>
        <div>
          <span style="font-size: 0.7rem; color: #64748b;">AICTE / EduVision ID</span>
          <p style="font-size: 0.82rem; font-weight: 700; color: #1e293b;">${escapeHtml(c.aicteId)}</p>
        </div>
        <div>
          <span style="font-size: 0.7rem; color: #64748b;">Bureau / Cell</span>
          <p style="font-size: 0.82rem; font-weight: 700; color: #1d6bf3;">${escapeHtml(c.bureau)}</p>
        </div>
        <div>
          <span style="font-size: 0.7rem; color: #64748b;">Assigned Officer</span>
          <p style="font-size: 0.82rem; font-weight: 700; color: #1e293b;">${escapeHtml(c.assignedOfficer)}</p>
        </div>
        <div>
          <span style="font-size: 0.7rem; color: #64748b;">Complaint Category</span>
          <p style="font-size: 0.82rem; font-weight: 600; color: #334155;">${escapeHtml(c.category)}</p>
        </div>
        <div>
          <span style="font-size: 0.7rem; color: #64748b;">Expected Disposal</span>
          <p style="font-size: 0.82rem; font-weight: 600; color: #334155;">${escapeHtml(c.expectedDisposalDate)}</p>
        </div>
      </div>

      <div>
        <h4 style="font-size: 0.8rem; font-weight: 700; color: #0f172a; margin-bottom: 5px;">Case Summary & Notes</h4>
        <p style="font-size: 0.8rem; color: #475569; background: #ffffff; border: 1px solid #e2e8f0; padding: 10px; border-radius: 6px;">
          ${escapeHtml(c.details)}
        </p>
      </div>

      <div style="font-size: 0.7rem; color: #94a3b8; font-style: italic;">
        Demonstration data for Regional Officer monitoring. Backend integration ready.
      </div>
    </div>
  `;

  openModal(`Case Details — ${c.caseId}`, content);
};

// Modal View Institution
window.openInstitutionModal = function(aicteId) {
  const inst = DASHBOARD_DATA.institutions.find((i) => i.aicteId === aicteId);
  if (!inst) return;

  const content = `
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0;">
        <div>
          <span style="font-size: 0.72rem; color: #64748b; font-weight: 600;">INSTITUTION PROFILE</span>
          <h3 style="font-size: 1.15rem; font-weight: 800; color: #0f172a;">${escapeHtml(inst.institutionName)}</h3>
        </div>
        <span class="status-badge ${inst.overdue > 0 ? 'overdue' : 'resolved'}" style="font-size: 0.78rem; padding: 4px 10px;">
          ${inst.overdue > 0 ? 'Needs Attention' : 'Compliant'}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; text-align: center;">
        <div style="background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <span style="font-size: 0.7rem; color: #64748b;">Total Cases</span>
          <div style="font-size: 1.4rem; font-weight: 800; color: #0f172a;">${inst.totalCases}</div>
        </div>
        <div style="background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <span style="font-size: 0.7rem; color: #64748b;">Pending</span>
          <div style="font-size: 1.4rem; font-weight: 800; color: #1d6bf3;">${inst.pending}</div>
        </div>
        <div style="background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <span style="font-size: 0.7rem; color: #64748b;">Overdue</span>
          <div style="font-size: 1.4rem; font-weight: 800; color: #ef4444;">${inst.overdue}</div>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 6px; font-size: 0.8rem;">
        <div><strong>District / City:</strong> ${escapeHtml(inst.district)}</div>
        <div><strong>AICTE / Affiliation Code:</strong> ${escapeHtml(inst.aicteId)}</div>
        <div><strong>Regional Jurisdiction:</strong> North Region Office</div>
      </div>
    </div>
  `;

  openModal(`Institution Summary — ${inst.institutionName}`, content);
};

// Modal Review Cases (Overlap alert)
window.openOverlapReviewModal = function() {
  const overlap = DASHBOARD_DATA.overlappingCaseDemo;
  const content = `
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 12px;">
        <h4 style="font-size: 0.88rem; font-weight: 700; color: #9f1239; display: flex; align-items: center; gap: 6px;">
          <svg width="17" height="17" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
          Potential Overlapping Cases — Human Coordination Required
        </h4>
        <p style="font-size: 0.76rem; color: #881337; margin-top: 4px; line-height: 1.4;">
          The system detected two separate active cases associated with <strong>${escapeHtml(overlap.institution)}</strong>.
          As per governance guidelines, complaints are not automatically merged. Human verification is required.
        </p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <!-- Case 1 -->
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px;">
          <span style="font-size: 0.68rem; font-weight: 700; color: #1d6bf3;">CASE 1</span>
          <h4 style="font-size: 0.95rem; font-weight: 800; color: #0f172a; margin-top: 2px;">${escapeHtml(overlap.case1.id)}</h4>
          <div style="margin-top: 8px; font-size: 0.76rem; display: flex; flex-direction: column; gap: 4px;">
            <div><strong>Bureau:</strong> ${escapeHtml(overlap.case1.bureau)}</div>
            <div><strong>Subject:</strong> ${escapeHtml(overlap.case1.category)}</div>
            <div><strong>Assigned Officer:</strong> ${escapeHtml(overlap.case1.officer)}</div>
          </div>
        </div>

        <!-- Case 2 -->
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px;">
          <span style="font-size: 0.68rem; font-weight: 700; color: #f59e0b;">CASE 2</span>
          <h4 style="font-size: 0.95rem; font-weight: 800; color: #0f172a; margin-top: 2px;">${escapeHtml(overlap.case2.id)}</h4>
          <div style="margin-top: 8px; font-size: 0.76rem; display: flex; flex-direction: column; gap: 4px;">
            <div><strong>Bureau:</strong> ${escapeHtml(overlap.case2.bureau)}</div>
            <div><strong>Subject:</strong> ${escapeHtml(overlap.case2.category)}</div>
            <div><strong>Assigned Officer:</strong> ${escapeHtml(overlap.case2.officer)}</div>
          </div>
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 6px;">
        <button class="btn-action-outline" onclick="closeModal()">Close Review</button>
        <button class="btn-review-cases" onclick="showToast('Coordination notice dispatched to Bureaus RB & PGRC'); closeModal();">
          Dispatch Coordination Notice
        </button>
      </div>
    </div>
  `;

  openModal("Case Overlap Review & Coordination", content);
};

// Modal View Reports
window.openReportsModal = function() {
  const content = `
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <p style="font-size: 0.8rem; color: #64748b;">
        Select a regional report template to preview aggregated complaint monitoring statistics for North Region:
      </p>

      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div style="padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="font-size: 0.8rem; color: #0f172a;">Institution-wise Case Summary</strong>
            <p style="font-size: 0.7rem; color: #64748b;">Breakdown of 386 complaints across 124 regional colleges.</p>
          </div>
          <button class="btn-action-outline" onclick="showToast('Institution-wise summary generated')">View</button>
        </div>

        <div style="padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="font-size: 0.8rem; color: #0f172a;">Bureau/Cell-wise Distribution</strong>
            <p style="font-size: 0.7rem; color: #64748b;">Workload distribution: Regulation Bureau, PGRC, and specialized cells.</p>
          </div>
          <button class="btn-action-outline" onclick="showToast('Bureau distribution report generated')">View</button>
        </div>

        <div style="padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="font-size: 0.8rem; color: #0f172a;">Pending & Overdue Case Report</strong>
            <p style="font-size: 0.7rem; color: #64748b;">Detailed audit of 142 pending and 28 overdue institutional cases.</p>
          </div>
          <button class="btn-action-outline" onclick="showToast('Pending & Overdue report generated')">View</button>
        </div>
      </div>
    </div>
  `;

  openModal("Regional Reports Catalog", content);
};

// --- QUICK ACTIONS HANDLERS ---
function initQuickActions() {
  const actions = {
    viewInstitutions: () => {
      window.location.href = "regional-institutions.html";
    },
    viewPending: () => {
      switchDashboardView("viewPendingCases");
      showToast("Displaying pending cases requiring regional monitoring");
    },
    reviewOverlap: () => {
      switchDashboardView("viewOverlapAlerts");
      showToast("Displaying overlap alerts requiring coordination");
    },
    generateReport: () => {
      switchDashboardView("viewRegionalReports");
      showToast("Displaying regional reports and analytics");
    }
  };

  document.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const actionName = btn.getAttribute("data-action");
      if (actions[actionName]) actions[actionName]();
    });
  });
}

// --- NON-INTRUSIVE TOAST SYSTEM ---
function showToast(message) {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
    <svg width="14" height="14" fill="#38bdf8" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

// Utility to escape HTML and prevent injection
function escapeHtml(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ============================================================================
// SECTION ROUTING AND VIEW SWITCHING CONTROLLER
// ============================================================================

const HASH_TO_VIEW = {
  "#dashboard": "viewDashboard",
  "#": "viewDashboard",
  "": "viewDashboard",
  "#monitoringTableSection": "viewDashboard",
  "#pendingCases": "viewPendingCases",
  "#overlapAlerts": "viewOverlapAlerts",
  "#overlapAlertSection": "viewOverlapAlerts",
  "#regionalReports": "viewRegionalReports",
  "#reportsSection": "viewRegionalReports",
  "#recentActivities": "viewRecentActivities",
  "#activitiesSection": "viewRecentActivities",
  "#notifications": "viewNotifications",
  "#helpSupport": "viewHelpSupport"
};

const VIEW_TO_NAV_ID = {
  "viewDashboard": "navDashboard",
  "viewPendingCases": "navPending",
  "viewOverlapAlerts": "navOverlap",
  "viewRegionalReports": "navReports",
  "viewRecentActivities": "navActivities",
  "viewNotifications": "navNotifications",
  "viewHelpSupport": "navHelp"
};

const VIEW_TO_HASH = {
  "viewDashboard": "#dashboard",
  "viewPendingCases": "#pendingCases",
  "viewOverlapAlerts": "#overlapAlerts",
  "viewRegionalReports": "#regionalReports",
  "viewRecentActivities": "#recentActivities",
  "viewNotifications": "#notifications",
  "viewHelpSupport": "#helpSupport"
};

function switchDashboardView(viewId, updateHash = true) {
  const target = document.getElementById(viewId);
  if (!target) return;

  // Hide all sections
  document.querySelectorAll(".dashboard-section-view").forEach((sec) => {
    sec.classList.remove("active");
  });

  // Show target section
  target.classList.add("active");

  // Update navigation items
  document.querySelectorAll(".sidebar-nav .nav-item").forEach((item) => {
    item.classList.remove("active");
    item.removeAttribute("aria-current");
  });

  const navId = VIEW_TO_NAV_ID[viewId];
  if (navId) {
    const navEl = document.getElementById(navId);
    if (navEl) {
      navEl.classList.add("active");
      navEl.setAttribute("aria-current", "page");
    }
  }

  // Update URL hash smoothly if requested
  if (updateHash && VIEW_TO_HASH[viewId]) {
    try {
      history.replaceState(null, "", VIEW_TO_HASH[viewId]);
    } catch (e) {
      window.location.hash = VIEW_TO_HASH[viewId];
    }
  }

  // If entering reports view, ensure charts render
  if (viewId === "viewRegionalReports") {
    initReportsCharts();
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function initSectionRouting() {
  const currentHash = window.location.hash;
  if (currentHash && HASH_TO_VIEW[currentHash]) {
    switchDashboardView(HASH_TO_VIEW[currentHash], false);
  } else {
    switchDashboardView("viewDashboard", false);
  }

  window.addEventListener("hashchange", () => {
    const hash = window.location.hash;
    if (hash && HASH_TO_VIEW[hash]) {
      switchDashboardView(HASH_TO_VIEW[hash], false);
    }
  });
}

// ============================================================================
// DASHBOARD 4: PENDING & OVERDUE CASES CONTROLLER
// ============================================================================

let currentPendingFilter = {
  search: "",
  bureau: "All",
  status: "All",
  due: "All"
};

function initPendingCasesSection() {
  const searchInput = document.getElementById("pendingSearchInput");
  const bureauSelect = document.getElementById("pendingBureauFilter");
  const statusSelect = document.getElementById("pendingStatusFilter");
  const dueSelect = document.getElementById("pendingDueFilter");
  const clearBtn = document.getElementById("clearPendingFiltersBtn");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentPendingFilter.search = e.target.value.toLowerCase().trim();
      applyPendingFilters();
    });
  }

  if (bureauSelect) {
    bureauSelect.addEventListener("change", (e) => {
      currentPendingFilter.bureau = e.target.value;
      applyPendingFilters();
    });
  }

  if (statusSelect) {
    statusSelect.addEventListener("change", (e) => {
      currentPendingFilter.status = e.target.value;
      applyPendingFilters();
    });
  }

  if (dueSelect) {
    dueSelect.addEventListener("change", (e) => {
      currentPendingFilter.due = e.target.value;
      applyPendingFilters();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      currentPendingFilter = { search: "", bureau: "All", status: "All", due: "All" };
      if (searchInput) searchInput.value = "";
      if (bureauSelect) bureauSelect.value = "All";
      if (statusSelect) statusSelect.value = "All";
      if (dueSelect) dueSelect.value = "All";
      applyPendingFilters();
      showToast("Pending case filters cleared");
    });
  }

  applyPendingFilters();
}

function applyPendingFilters() {
  const cases = DASHBOARD_DATA.pendingCases || [];
  const filtered = cases.filter((c) => {
    // Search filter
    if (currentPendingFilter.search) {
      const q = currentPendingFilter.search;
      const matchSearch =
        c.caseId.toLowerCase().includes(q) ||
        c.institutionName.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        c.bureau.toLowerCase().includes(q);
      if (!matchSearch) return false;
    }

    // Bureau filter
    if (currentPendingFilter.bureau !== "All") {
      if (currentPendingFilter.bureau === "RB" && !c.bureau.includes("Regulation Bureau") && !c.bureau.includes("RB")) return false;
      if (currentPendingFilter.bureau === "PGRC" && !c.bureau.includes("PGRC") && !c.bureau.includes("Public Grievance")) return false;
      if (currentPendingFilter.bureau === "Other Cells" && (c.bureau.includes("Regulation Bureau") || c.bureau.includes("PGRC"))) return false;
    }

    // Status filter
    if (currentPendingFilter.status !== "All") {
      if (c.status !== currentPendingFilter.status) return false;
    }

    // Due filter
    if (currentPendingFilter.due !== "All") {
      if (c.dueCategory !== currentPendingFilter.due) return false;
    }

    return true;
  });

  renderPendingCasesTable(filtered);
}

function renderPendingCasesTable(records) {
  const tbody = document.getElementById("pendingCasesTableBody");
  const emptyState = document.getElementById("pendingEmptyState");
  if (!tbody) return;

  if (records.length === 0) {
    tbody.innerHTML = "";
    if (emptyState) emptyState.style.display = "block";
    return;
  }

  if (emptyState) emptyState.style.display = "none";

  tbody.innerHTML = records
    .map((c) => {
      const isOverdue = c.status === "Overdue";
      const isDueToday = c.dueCategory === "Today";
      const rowHighlightClass = isOverdue ? "row-overdue-alert" : isDueToday ? "row-duetoday-alert" : "";

      let statusBadgeClass = "pending";
      if (c.status === "Overdue") statusBadgeClass = "overdue";
      else if (c.status === "In Progress") statusBadgeClass = "in-progress";

      let priorityClass = "priority-normal";
      if (c.priority === "Urgent") priorityClass = "priority-urgent";
      else if (c.priority === "High") priorityClass = "priority-high";

      return `
        <tr class="${rowHighlightClass}">
          <td>
            <a href="#" class="case-id-link" onclick="openCaseModal('${c.caseId}'); return false;">
              ${escapeHtml(c.caseId)}
            </a>
          </td>
          <td>
            <div style="font-weight: 600; color: var(--text-dark);">${escapeHtml(c.institutionName)}</div>
            <div style="font-size: 0.7rem; color: var(--text-muted);">${escapeHtml(c.subject)}</div>
          </td>
          <td>
            <span class="cell-bureau">${escapeHtml(c.bureau)}</span>
          </td>
          <td>
            <span class="status-badge ${statusBadgeClass}">${escapeHtml(c.status)}</span>
          </td>
          <td>
            <div style="font-weight: 600; color: ${isOverdue ? "var(--color-red)" : isDueToday ? "var(--color-orange-dark)" : "var(--text-dark)"};">
              ${escapeHtml(c.dueDate)}
            </div>
            <div style="font-size: 0.68rem; color: var(--text-muted);">${escapeHtml(c.daysRemaining)}</div>
          </td>
          <td>
            <span class="priority-pill ${priorityClass}">${escapeHtml(c.priority)}</span>
          </td>
          <td>
            <button class="btn-action-outline" onclick="openCaseModal('${c.caseId}')" aria-label="View case ${escapeHtml(c.caseId)}">
              View Case
            </button>
          </td>
        </tr>
      `;
    })
    .join("");
}

// ============================================================================
// DASHBOARD 5: OVERLAP ALERTS CONTROLLER
// ============================================================================

let currentOverlapFilter = {
  search: "",
  institution: "All",
  bureau: "All",
  type: "All",
  status: "All"
};

let activeSelectedOverlapId = "OVL-2026-001";

function initOverlapAlertsSection() {
  const searchInput = document.getElementById("overlapSearchInput");
  const instSelect = document.getElementById("overlapInstFilter");
  const bureauSelect = document.getElementById("overlapBureauFilter");
  const typeSelect = document.getElementById("overlapTypeFilter");
  const statusSelect = document.getElementById("overlapStatusFilter");
  const clearBtn = document.getElementById("clearOverlapFiltersBtn");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentOverlapFilter.search = e.target.value.toLowerCase().trim();
      applyOverlapFilters();
    });
  }

  if (instSelect) {
    instSelect.addEventListener("change", (e) => {
      currentOverlapFilter.institution = e.target.value;
      applyOverlapFilters();
    });
  }

  if (bureauSelect) {
    bureauSelect.addEventListener("change", (e) => {
      currentOverlapFilter.bureau = e.target.value;
      applyOverlapFilters();
    });
  }

  if (typeSelect) {
    typeSelect.addEventListener("change", (e) => {
      currentOverlapFilter.type = e.target.value;
      applyOverlapFilters();
    });
  }

  if (statusSelect) {
    statusSelect.addEventListener("change", (e) => {
      currentOverlapFilter.status = e.target.value;
      applyOverlapFilters();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      currentOverlapFilter = { search: "", institution: "All", bureau: "All", type: "All", status: "All" };
      if (searchInput) searchInput.value = "";
      if (instSelect) instSelect.value = "All";
      if (bureauSelect) bureauSelect.value = "All";
      if (typeSelect) typeSelect.value = "All";
      if (statusSelect) statusSelect.value = "All";
      applyOverlapFilters();
      showToast("Overlap alert filters cleared");
    });
  }

  applyOverlapFilters();
  if (activeSelectedOverlapId) {
    selectOverlapAlertForReview(activeSelectedOverlapId);
  }
}

function applyOverlapFilters() {
  const alerts = DASHBOARD_DATA.overlapAlerts || [];
  const filtered = alerts.filter((a) => {
    // Search
    if (currentOverlapFilter.search) {
      const q = currentOverlapFilter.search;
      const match =
        a.id.toLowerCase().includes(q) ||
        a.caseA.id.toLowerCase().includes(q) ||
        a.caseB.id.toLowerCase().includes(q) ||
        a.institution.toLowerCase().includes(q) ||
        a.matchReason.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Institution
    if (currentOverlapFilter.institution !== "All" && a.institution !== currentOverlapFilter.institution) {
      return false;
    }

    // Bureau
    if (currentOverlapFilter.bureau !== "All" && a.bureauCombination !== currentOverlapFilter.bureau) {
      return false;
    }

    // Type
    if (currentOverlapFilter.type !== "All" && a.category !== currentOverlapFilter.type) {
      return false;
    }

    // Status
    if (currentOverlapFilter.status !== "All" && a.reviewStatus !== currentOverlapFilter.status) {
      return false;
    }

    return true;
  });

  renderOverlapTable(filtered);
}

function renderOverlapTable(records) {
  const tbody = document.getElementById("overlapTableBody");
  const emptyState = document.getElementById("overlapEmptyState");
  if (!tbody) return;

  if (records.length === 0) {
    tbody.innerHTML = "";
    if (emptyState) emptyState.style.display = "block";
    return;
  }

  if (emptyState) emptyState.style.display = "none";

  tbody.innerHTML = records
    .map((a) => {
      const isSelected = a.id === activeSelectedOverlapId;
      const statusClass = a.reviewStatus === "Reviewed" ? "resolved" : "in-progress";

      return `
        <tr class="${isSelected ? 'active-row' : ''}" style="${isSelected ? 'background: #eff6ff;' : ''}">
          <td>
            <strong style="color: var(--color-blue);">${escapeHtml(a.id)}</strong>
          </td>
          <td>
            <div style="display: flex; gap: 4px; flex-wrap: wrap;">
              <span class="overlap-case-tag">${escapeHtml(a.caseA.id)}</span>
              <span style="color: var(--text-muted);">&bull;</span>
              <span class="overlap-case-tag">${escapeHtml(a.caseB.id)}</span>
            </div>
          </td>
          <td>
            <div style="font-weight: 600; color: var(--text-dark);">${escapeHtml(a.institution)}</div>
          </td>
          <td>
            <span class="cell-bureau">${escapeHtml(a.bureauCombination)}</span>
          </td>
          <td>
            <span class="match-reason-pill">${escapeHtml(a.matchReason)}</span>
          </td>
          <td>
            <span class="status-badge ${statusClass}">${escapeHtml(a.reviewStatus)}</span>
          </td>
          <td>
            <button class="btn-action-outline" onclick="selectOverlapAlertForReview('${a.id}')" aria-label="Review overlap alert ${escapeHtml(a.id)}">
              Review Cases
            </button>
          </td>
        </tr>
      `;
    })
    .join("");
}

function selectOverlapAlertForReview(alertId) {
  const alert = (DASHBOARD_DATA.overlapAlerts || []).find((a) => a.id === alertId);
  if (!alert) return;

  activeSelectedOverlapId = alertId;

  // Update table row styling
  renderOverlapTable(
    (DASHBOARD_DATA.overlapAlerts || []).filter((a) => {
      if (currentOverlapFilter.institution !== "All" && a.institution !== currentOverlapFilter.institution) return false;
      if (currentOverlapFilter.bureau !== "All" && a.bureauCombination !== currentOverlapFilter.bureau) return false;
      if (currentOverlapFilter.type !== "All" && a.category !== currentOverlapFilter.type) return false;
      if (currentOverlapFilter.status !== "All" && a.reviewStatus !== currentOverlapFilter.status) return false;
      return true;
    })
  );

  // Update Header
  const titleEl = document.getElementById("activeOverlapTitle");
  const statusBadge = document.getElementById("activeOverlapStatusBadge");
  const reasonText = document.getElementById("activeOverlapReasonText");

  if (titleEl) {
    titleEl.textContent = `Overlap Review: ${alert.id} — ${alert.institution}`;
  }
  if (statusBadge) {
    statusBadge.textContent = alert.reviewStatus;
    statusBadge.className = `status-badge ${alert.reviewStatus === "Reviewed" ? "resolved" : "in-progress"}`;
  }
  if (reasonText) {
    reasonText.textContent = `${alert.category} — ${alert.matchReason}`;
  }

  // Update Case A
  const cA = alert.caseA;
  const cAId = document.getElementById("overlapCaseAId");
  const cAStatus = document.getElementById("overlapCaseAStatus");
  const cAInst = document.getElementById("overlapCaseAInst");
  const cABureau = document.getElementById("overlapCaseABureau");
  const cASubject = document.getElementById("overlapCaseASubject");
  const cADate = document.getElementById("overlapCaseADate");
  const cAOfficer = document.getElementById("overlapCaseAOfficer");

  if (cAId) cAId.textContent = cA.id;
  if (cAStatus) {
    cAStatus.textContent = cA.status;
    cAStatus.className = `status-badge ${cA.status === "Overdue" ? "overdue" : cA.status === "Resolved" ? "resolved" : "in-progress"}`;
  }
  if (cAInst) cAInst.textContent = cA.institution;
  if (cABureau) cABureau.textContent = cA.bureau;
  if (cASubject) cASubject.textContent = cA.subject;
  if (cADate) cADate.textContent = cA.filingDate;
  if (cAOfficer) cAOfficer.textContent = cA.assignedOfficer || "RB-03";

  // Update Case B
  const cB = alert.caseB;
  const cBId = document.getElementById("overlapCaseBId");
  const cBStatus = document.getElementById("overlapCaseBStatus");
  const cBInst = document.getElementById("overlapCaseBInst");
  const cBBureau = document.getElementById("overlapCaseBBureau");
  const cBSubject = document.getElementById("overlapCaseBSubject");
  const cBDate = document.getElementById("overlapCaseBDate");
  const cBOfficer = document.getElementById("overlapCaseBOfficer");

  if (cBId) cBId.textContent = cB.id;
  if (cBStatus) {
    cBStatus.textContent = cB.status;
    cBStatus.className = `status-badge ${cB.status === "Overdue" ? "overdue" : cB.status === "Resolved" ? "resolved" : "in-progress"}`;
  }
  if (cBInst) cBInst.textContent = cB.institution;
  if (cBBureau) cBBureau.textContent = cB.bureau;
  if (cBSubject) cBSubject.textContent = cB.subject;
  if (cBDate) cBDate.textContent = cB.filingDate;
  if (cBOfficer) cBOfficer.textContent = cB.assignedOfficer || "PGRC-02";

  // Scroll to review panel smoothly
  const panel = document.getElementById("overlapReviewPanel");
  if (panel && window.innerWidth < 768) {
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function markActiveOverlapReviewed() {
  const alert = (DASHBOARD_DATA.overlapAlerts || []).find((a) => a.id === activeSelectedOverlapId);
  if (!alert) return;

  alert.reviewStatus = "Reviewed";
  selectOverlapAlertForReview(activeSelectedOverlapId);

  // Recalculate awaiting count
  const awaitingCount = (DASHBOARD_DATA.overlapAlerts || []).filter((a) => a.reviewStatus === "Requires Review").length;
  const valAwaiting = document.getElementById("valAwaitingReviewOverlaps");
  if (valAwaiting) valAwaiting.textContent = awaitingCount;

  showToast(`Demonstration only: Alert ${alert.id} marked as Reviewed by Regional Officer.`);
}

function linkActiveOverlapCases() {
  const alert = (DASHBOARD_DATA.overlapAlerts || []).find((a) => a.id === activeSelectedOverlapId);
  if (!alert) return;

  showToast(`Demonstration only: Coordination link created between ${alert.caseA.id} and ${alert.caseB.id}. Joint coordination active.`);
}

// ============================================================================
// DASHBOARD 6: REGIONAL REPORTS CONTROLLER
// ============================================================================

let currentReportsPeriod = 30;
let currentReportsBureau = "All";

function initRegionalReportsSection() {
  renderReportsInstitutionTable(DASHBOARD_DATA.reportsInstitutions || []);
  initReportsCharts();
}

function setReportsPeriod(period, btn) {
  currentReportsPeriod = period;
  document.querySelectorAll(".reports-period-btn").forEach((b) => b.classList.remove("active"));
  if (btn) btn.classList.add("active");

  const label = document.getElementById("reportingPeriodLabel");
  if (label) {
    if (period === 7) label.textContent = "Reporting Period: Last 7 Days (Demonstration Dataset)";
    else if (period === 30) label.textContent = "Reporting Period: Last 30 Days (Demonstration Dataset)";
    else label.textContent = "Reporting Period: Custom Selected Range (Demonstration Dataset)";
  }

  showToast(`Demonstration report period updated: ${btn ? btn.textContent : period}`);
}

function applyReportsFilter() {
  const bureauSelect = document.getElementById("reportsBureauSelect");
  currentReportsBureau = bureauSelect ? bureauSelect.value : "All";

  const allInstitutions = DASHBOARD_DATA.reportsInstitutions || [];
  let filtered = allInstitutions;

  if (currentReportsBureau !== "All") {
    showToast(`Filtering report view by: ${currentReportsBureau}`);
  } else {
    showToast("Displaying consolidated regional reports");
  }

  renderReportsInstitutionTable(filtered);
}

function renderReportsInstitutionTable(records) {
  const tbody = document.getElementById("reportsTableBody");
  if (!tbody) return;

  tbody.innerHTML = records
    .map((inst) => {
      const total = inst.totalCases;
      const resRate = total > 0 ? Math.round((inst.resolved / total) * 100) : 0;

      return `
        <tr>
          <td>
            <div style="font-weight: 700; color: var(--text-dark);">${escapeHtml(inst.institutionName)}</div>
          </td>
          <td>
            <span class="cell-muted">${escapeHtml(inst.district)}</span>
          </td>
          <td>
            <strong style="color: var(--text-dark); font-size: 0.85rem;">${inst.totalCases}</strong>
          </td>
          <td>
            <span style="color: var(--color-blue); font-weight: 600;">${inst.pending}</span>
          </td>
          <td>
            <span style="color: var(--color-green); font-weight: 600;">${inst.resolved}</span>
          </td>
          <td>
            <span style="color: ${inst.overdue > 0 ? 'var(--color-red)' : 'var(--text-muted)'}; font-weight: 700;">
              ${inst.overdue}
            </span>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="flex: 1; height: 6px; background: #e2e8f0; border-radius: 9999px; overflow: hidden; max-width: 60px;">
                <div style="width: ${resRate}%; height: 100%; background: var(--color-green); border-radius: 9999px;"></div>
              </div>
              <span style="font-size: 0.75rem; font-weight: 600; color: var(--text-dark);">${resRate}%</span>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function initReportsCharts() {
  // Chart 1: Case Status Doughnut SVG
  const doughnutSvg = document.getElementById("reportsStatusDoughnut");
  if (doughnutSvg) {
    const total = 386;
    const radius = 45;
    const circumference = 2 * Math.PI * radius; // ~282.74

    const segments = [
      { name: "Pending", count: 142, color: "#1d6bf3" },
      { name: "In Progress", count: 118, color: "#f97316" },
      { name: "Resolved", count: 98, color: "#10b981" },
      { name: "Overdue", count: 28, color: "#ef4444" }
    ];

    let accumulatedOffset = 0;
    let pathsHtml = "";

    segments.forEach((seg) => {
      const fraction = seg.count / total;
      const strokeDash = fraction * circumference;
      const strokeDashoffset = -accumulatedOffset;
      accumulatedOffset += strokeDash;

      pathsHtml += `
        <circle cx="60" cy="60" r="${radius}" fill="none" stroke="${seg.color}"
          stroke-width="18"
          stroke-dasharray="${strokeDash} ${circumference}"
          stroke-dashoffset="${strokeDashoffset}"
          transform="rotate(-90 60 60)" />
      `;
    });

    doughnutSvg.innerHTML = pathsHtml;
  }

  // Chart 2: Cases by Bureau / Cell Bar Chart
  const barWrapper = document.getElementById("reportsBureauBarChart");
  if (barWrapper) {
    const bureaus = [
      { name: "Regulation Bureau (RB)", count: 168, pct: 43.5, color: "#1d6bf3" },
      { name: "Public Grievance Cell (PGRC)", count: 132, pct: 34.2, color: "#f97316" },
      { name: "Other Specialized Cells", count: 86, pct: 22.3, color: "#10b981" }
    ];

    barWrapper.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px; width: 100%; padding: 4px 0;">
        ${bureaus
          .map(
            (b) => `
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.78rem; font-weight: 600; margin-bottom: 4px;">
              <span style="color: var(--text-dark);">${escapeHtml(b.name)}</span>
              <span style="color: var(--text-muted);">${b.count} cases (${b.pct}%)</span>
            </div>
            <div style="width: 100%; height: 12px; background: #e2e8f0; border-radius: 9999px; overflow: hidden;">
              <div style="width: ${b.pct}%; height: 100%; background: ${b.color}; border-radius: 9999px; transition: width 0.6s ease;"></div>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    `;
  }
}

function exportReportsCSV() {
  const records = DASHBOARD_DATA.reportsInstitutions || [];
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Institution Name,District,Total Cases,Pending Cases,Resolved Cases,Overdue Cases,Resolution Rate (%)\r\n";

  records.forEach((r) => {
    const total = r.totalCases;
    const rate = total > 0 ? Math.round((r.resolved / total) * 100) : 0;
    csvContent += `"${r.institutionName}","${r.district}",${r.totalCases},${r.pending},${r.resolved},${r.overdue},${rate}%\r\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "eduvision_regional_reports_demo.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast("Demonstration CSV exported successfully (Static Report Data)");
}

// ============================================================================
// DASHBOARD 7: RECENT ACTIVITIES CONTROLLER
// ============================================================================

let currentActivityFilter = {
  search: "",
  date: "All",
  type: "All"
};

function initRecentActivitiesSection() {
  const searchInput = document.getElementById("activitySearchInput");
  const dateSelect = document.getElementById("activityDateFilter");
  const typeSelect = document.getElementById("activityTypeFilter");
  const clearBtn = document.getElementById("activityClearBtn");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentActivityFilter.search = e.target.value.toLowerCase().trim();
      applyActivityFilters();
    });
  }

  if (dateSelect) {
    dateSelect.addEventListener("change", (e) => {
      currentActivityFilter.date = e.target.value;
      applyActivityFilters();
    });
  }

  if (typeSelect) {
    typeSelect.addEventListener("change", (e) => {
      currentActivityFilter.type = e.target.value;
      applyActivityFilters();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      currentActivityFilter = { search: "", date: "All", type: "All" };
      if (searchInput) searchInput.value = "";
      if (dateSelect) dateSelect.value = "All";
      if (typeSelect) typeSelect.value = "All";
      applyActivityFilters();
      showToast("Activity log filters cleared");
    });
  }

  applyActivityFilters();
}

function applyActivityFilters() {
  const list = DASHBOARD_DATA.allActivities || [];
  const filtered = list.filter((a) => {
    // Search
    if (currentActivityFilter.search) {
      const q = currentActivityFilter.search;
      const match =
        a.id.toLowerCase().includes(q) ||
        a.type.toLowerCase().includes(q) ||
        a.caseId.toLowerCase().includes(q) ||
        a.institution.toLowerCase().includes(q) ||
        a.performedBy.toLowerCase().includes(q) ||
        a.desc.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Date
    if (currentActivityFilter.date !== "All" && a.date !== currentActivityFilter.date) {
      return false;
    }

    // Type
    if (currentActivityFilter.type !== "All" && a.type !== currentActivityFilter.type) {
      return false;
    }

    return true;
  });

  renderActivitiesStream(filtered);
}

function renderActivitiesStream(records) {
  const container = document.getElementById("activitiesStreamList");
  const countLabel = document.getElementById("activityRecordsCount");
  if (!container) return;

  if (countLabel) {
    countLabel.textContent = `Showing ${records.length} activities (Newest at top)`;
  }

  if (records.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="display: block; padding: 36px 16px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 38px; height: 38px; color: var(--text-muted); margin: 0 auto 10px;">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-dark); margin-bottom: 4px;">No matching activities</h4>
        <p style="font-size: 0.78rem; color: var(--text-muted);">Adjust or clear your search criteria to view past administrative activity logs.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = records
    .map((act) => {
      return `
        <div class="activity-stream-item">
          <div class="activity-stream-icon-box ${act.colorClass || 'blue'}">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.4 7.4h7.6l-6.1 4.5 2.3 7.1-6.2-4.6-6.2 4.6 2.3-7.1-6.1-4.5h7.6z"/>
            </svg>
          </div>
          <div class="activity-stream-content">
            <div class="activity-stream-header">
              <span class="activity-stream-type-pill ${act.colorClass || 'blue'}">${escapeHtml(act.type)}</span>
              <span class="activity-stream-time">${escapeHtml(act.fullDateTime || act.time)}</span>
            </div>
            <p class="activity-stream-desc">${escapeHtml(act.desc)}</p>
            <div class="activity-stream-meta">
              <span><strong>Case:</strong> ${escapeHtml(act.caseId)}</span>
              <span><strong>Institution:</strong> ${escapeHtml(act.institution)}</span>
              <span><strong>By:</strong> ${escapeHtml(act.performedBy)}</span>
            </div>
          </div>
          <div style="flex-shrink: 0; align-self: center;">
            <button class="btn-action-outline" onclick="openActivityDetailsModal('${act.id}')" aria-label="View activity details for ${escapeHtml(act.id)}">
              View Details
            </button>
          </div>
        </div>
      `;
    })
    .join("");
}

function openActivityDetailsModal(activityId) {
  const act = (DASHBOARD_DATA.allActivities || []).find((a) => a.id === activityId);
  if (!act) return;

  const content = `
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0;">
        <div>
          <span style="font-size: 0.72rem; color: #64748b; font-weight: 600;">ACTIVITY LOG RECORD</span>
          <h3 style="font-size: 1.15rem; font-weight: 800; color: #0f172a; margin-top: 2px;">${escapeHtml(act.id)} &bull; ${escapeHtml(act.type)}</h3>
        </div>
        <span class="activity-type-pill ${act.colorClass || 'blue'}">${escapeHtml(act.type)}</span>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #f8fafc; padding: 12px; border-radius: 8px;">
        <div>
          <span style="font-size: 0.7rem; color: #64748b;">Timestamp</span>
          <p style="font-size: 0.82rem; font-weight: 700; color: #1e293b;">${escapeHtml(act.fullDateTime)}</p>
        </div>
        <div>
          <span style="font-size: 0.7rem; color: #64748b;">Logged By</span>
          <p style="font-size: 0.82rem; font-weight: 700; color: #1e293b;">${escapeHtml(act.performedBy)}</p>
        </div>
        <div>
          <span style="font-size: 0.7rem; color: #64748b;">Associated Case</span>
          <p style="font-size: 0.82rem; font-weight: 700; color: #1d6bf3;">${escapeHtml(act.caseId)}</p>
        </div>
        <div>
          <span style="font-size: 0.7rem; color: #64748b;">Institution</span>
          <p style="font-size: 0.82rem; font-weight: 700; color: #1e293b;">${escapeHtml(act.institution)}</p>
        </div>
      </div>

      <div>
        <h4 style="font-size: 0.8rem; font-weight: 700; color: #0f172a; margin-bottom: 5px;">Action Details</h4>
        <p style="font-size: 0.82rem; color: #334155; background: #ffffff; border: 1px solid #e2e8f0; padding: 10px; border-radius: 6px;">
          ${escapeHtml(act.desc)}
        </p>
      </div>

      <div style="font-size: 0.7rem; color: #94a3b8; font-style: italic;">
        Demonstration audit log entry. All regional entries are read-only and preserved for statutory oversight.
      </div>
    </div>
  `;

  openModal(`Activity Detail — ${act.id}`, content);
}

// ============================================================================
// DASHBOARD 8: NOTIFICATIONS CONTROLLER
// ============================================================================

let currentNotifFilter = "All"; // "All" | "Unread" | "Important"

function initNotificationsSection() {
  updateNotificationBadges();
  renderNotificationsList();
}

function filterNotificationsTab(filter) {
  currentNotifFilter = filter;

  // Update tabs
  ["All", "Unread", "Important"].forEach((tab) => {
    const btn = document.getElementById(`tabNotif${tab}`);
    if (btn) {
      if (tab === filter) {
        btn.classList.add("active");
        btn.setAttribute("aria-selected", "true");
      } else {
        btn.classList.remove("active");
        btn.setAttribute("aria-selected", "false");
      }
    }
  });

  renderNotificationsList();
}

function updateNotificationBadges() {
  const notifs = DASHBOARD_DATA.allNotifications || [];
  const unreadCount = notifs.filter((n) => !n.read).length;
  const importantCount = notifs.filter((n) => n.isImportant).length;
  const totalCount = notifs.length;

  const countAll = document.getElementById("countNotifAll");
  const countUnread = document.getElementById("countNotifUnread");
  const countImportant = document.getElementById("countNotifImportant");
  const unreadTop = document.getElementById("notifUnreadBadgeTop");
  const tabAll = document.getElementById("tabCountAll");
  const tabUnread = document.getElementById("tabCountUnread");
  const tabImportant = document.getElementById("tabCountImportant");
  const sidebarCount = document.getElementById("notifSidebarCount");
  const sidebarBadge = document.getElementById("sidebarNotifBadge");

  if (countAll) countAll.textContent = totalCount;
  if (countUnread) countUnread.textContent = unreadCount;
  if (countImportant) countImportant.textContent = importantCount;
  if (unreadTop) unreadTop.textContent = unreadCount;
  if (tabAll) tabAll.textContent = totalCount;
  if (tabUnread) tabUnread.textContent = unreadCount;
  if (tabImportant) tabImportant.textContent = importantCount;
  if (sidebarCount) sidebarCount.textContent = unreadCount;
  if (sidebarBadge) sidebarBadge.textContent = unreadCount;
}

function renderNotificationsList() {
  const container = document.getElementById("notificationsContainer");
  if (!container) return;

  const notifs = DASHBOARD_DATA.allNotifications || [];
  const filtered = notifs.filter((n) => {
    if (currentNotifFilter === "Unread") return !n.read;
    if (currentNotifFilter === "Important") return n.isImportant;
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="display: block; padding: 40px 16px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 38px; height: 38px; color: var(--text-muted); margin: 0 auto 10px;">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-dark); margin-bottom: 4px;">No ${currentNotifFilter === "All" ? "" : currentNotifFilter.toLowerCase()} notifications</h4>
        <p style="font-size: 0.78rem; color: var(--text-muted);">You're all caught up! New regional updates will appear here automatically.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered
    .map((n) => {
      const isUnread = !n.read;
      const readClass = isUnread ? "unread" : "read";
      const urgentClass = n.isImportant ? "urgent" : "";
      const priorityPillClass = n.priority === "Urgent" ? "priority-urgent" : n.priority === "High" ? "priority-high" : "priority-normal";

      return `
        <div class="notification-card-item ${readClass} ${urgentClass}">
          <div class="notification-dot"></div>
          <div class="notification-body">
            <div class="notification-top-row">
              <div class="notification-title-wrap">
                <span class="notification-card-title">${escapeHtml(n.title)}</span>
                <span class="activity-stream-type-pill ${n.typeClass || 'blue'}">${escapeHtml(n.type)}</span>
                <span class="priority-pill ${priorityPillClass}">${escapeHtml(n.priority)}</span>
              </div>
            </div>
            <p class="notification-card-desc">${escapeHtml(n.desc)}</p>
            <div class="notification-bottom-row">
              <div>
                <span><strong>Timestamp:</strong> ${escapeHtml(n.dateTime)}</span>
                ${n.caseId ? ` &bull; <span><strong>Case:</strong> <a href="#" class="case-id-link" onclick="openCaseModal('${n.caseId}'); return false;">${escapeHtml(n.caseId)}</a></span>` : ""}
              </div>
              <div class="notification-actions-group">
                <button class="btn-action-outline" onclick="toggleNotificationRead('${n.id}')" aria-label="${isUnread ? 'Mark as read' : 'Mark as unread'}">
                  ${isUnread ? "Mark Read" : "Mark Unread"}
                </button>
                ${n.caseId && n.caseId.startsWith("CASE") ? `
                  <button class="btn-action-outline" onclick="openCaseModal('${n.caseId}')" aria-label="View case details for ${escapeHtml(n.caseId)}">
                    View Case
                  </button>
                ` : ""}
              </div>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

function toggleNotificationRead(id) {
  const notif = (DASHBOARD_DATA.allNotifications || []).find((n) => n.id === id);
  if (!notif) return;

  notif.read = !notif.read;
  updateNotificationBadges();
  renderNotificationsList();
  showToast(notif.read ? "Notification marked as read" : "Notification marked as unread");
}

function markAllNotificationsAsRead() {
  (DASHBOARD_DATA.allNotifications || []).forEach((n) => {
    n.read = true;
  });
  updateNotificationBadges();
  renderNotificationsList();
  showToast("All regional notifications marked as read");
}

// ============================================================================
// DASHBOARD 9: HELP & SUPPORT CONTROLLER
// ============================================================================

function initHelpSupportSection() {
  document.querySelectorAll(".faq-question-btn").forEach((header) => {
    header.addEventListener("click", () => {
      toggleFaq(header);
    });
  });
}

function toggleFaq(headerBtn) {
  const parentItem = headerBtn.closest(".faq-item");
  if (!parentItem) return;

  const wasOpen = parentItem.classList.contains("open");

  // Close other FAQs for accordion behavior
  document.querySelectorAll(".faq-item").forEach((item) => {
    item.classList.remove("open");
  });

  if (!wasOpen) {
    parentItem.classList.add("open");
  }
}

function filterHelpFaqs(query) {
  const q = (query || "").toLowerCase().trim();
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const text = item.textContent.toLowerCase();
    if (!q || text.includes(q)) {
      item.style.display = "block";
    } else {
      item.style.display = "none";
    }
  });
}

// Global window exposure for inline onclick handlers in HTML
window.switchDashboardView = switchDashboardView;
window.selectOverlapAlertForReview = selectOverlapAlertForReview;
window.markActiveOverlapReviewed = markActiveOverlapReviewed;
window.linkActiveOverlapCases = linkActiveOverlapCases;
window.setReportsPeriod = setReportsPeriod;
window.applyReportsFilter = applyReportsFilter;
window.exportReportsCSV = exportReportsCSV;
window.openActivityDetailsModal = openActivityDetailsModal;
window.filterNotificationsTab = filterNotificationsTab;
window.toggleNotificationRead = toggleNotificationRead;
window.markAllNotificationsAsRead = markAllNotificationsAsRead;
window.toggleFaq = toggleFaq;
window.filterHelpFaqs = filterHelpFaqs;

