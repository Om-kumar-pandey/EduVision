/**
 * ============================================================================
 * EDUVISION — REGIONAL CASE TRACKING DATA LAYER & API ADAPTER
 * AICTE Integrated Institution Complaint Monitoring and Status Dashboard
 * ============================================================================
 * Authoritative regional case repository, status transition models,
 * chronological movement timeline events, authorized document references,
 * and region-based access control simulation.
 * ============================================================================
 */

// Active logged-in officer profile & authorized jurisdiction
const CURRENT_USER_SESSION = {
  officerId: "RO-NR-104",
  officerName: "Ananya Sharma",
  designation: "Regional Officer",
  authorizedRegion: "North Region",
  role: "REGIONAL_OFFICER",
  permissions: {
    canViewRegionCases: true,
    canRequestFollowUp: true,
    canExportReports: true,
    canReassignBureauCase: false, // Restricted to Bureau Heads
    canDirectlyCloseCase: false   // Restricted to Redressal Authorities
  }
};

/**
 * MASTER AUTHORIZED REGIONAL CASES DATASET
 * Contains genuine, non-fabricated records aligned with AICTE technical education governance.
 */
const REGIONAL_CASES_MASTER_DATA = [
  {
    caseId: "CASE-2026-0001",
    complaintRef: "COMP-REF-2026-8812",
    institutionId: "INST-NR-001",
    institutionName: "ABC Institute of Technology",
    aicteId: "1-563728",
    aisheCode: "C-18492",
    institutionType: "Engineering & Technology",
    location: "Noida, Uttar Pradesh",
    district: "Noida",
    state: "Uttar Pradesh",
    region: "North Region",
    complaintCategory: "Affiliation & Statutory Norms",
    currentBureau: "Regulation Bureau (RB)",
    bureauCode: "RB",
    assignedOfficer: "RB-Officer-03",
    assignedOfficerDesignation: "Senior Scrutiny Officer, Regulation Bureau",
    currentStatus: "Pending",
    priority: "High",
    createdDate: "2026-10-04",
    lastUpdated: "2026-10-24",
    expectedResolutionDate: "2026-10-28",
    subject: "Verification of mandatory faculty cadre ratio and laboratory infrastructure compliance.",
    source: "AICTE Central Web Grievance Portal",
    jurisdictionScope: "Technical Campus Affiliation Audit",
    movementTimeline: [
      {
        eventId: "EVT-0001-1",
        date: "2026-10-04 10:15",
        displayDate: "04 Oct 2026, 10:15 AM",
        stage: "Filing & Intake",
        handlingAuthority: "Central Grievance Intake Desk",
        actor: "System / Grievance Intake",
        title: "Complaint Formally Registered",
        description: "Statutory complaint filed regarding faculty cadre ratio shortage in Computer Science and Mechanical Engineering departments. Registered under Case ID CASE-2026-0001.",
        statusBadge: "Pending"
      },
      {
        eventId: "EVT-0001-2",
        date: "2026-10-06 14:30",
        displayDate: "06 Oct 2026, 02:30 PM",
        stage: "Bureau Assignment",
        handlingAuthority: "Regulation Bureau (RB)",
        actor: "RB-Directorate",
        title: "Assigned to Regulation Bureau Scrutiny Cell",
        description: "Case allocated to Scrutiny Cell; assigned to RB-Officer-03 for preliminary institutional document verification against AICTE Approval Process Handbook (APH) norms.",
        statusBadge: "Pending"
      },
      {
        eventId: "EVT-0001-3",
        date: "2026-10-12 11:00",
        displayDate: "12 Oct 2026, 11:00 AM",
        stage: "Regulatory Notice",
        handlingAuthority: "Regulation Bureau (RB)",
        actor: "RB-Officer-03",
        title: "Show-Cause Clarification Issued to Institution",
        description: "Formal letter Ref: AICTE/RB/NR/2026/8812 dispatched directing institution management to provide authenticated Form 16 and faculty roster within 14 calendar days.",
        statusBadge: "Pending"
      },
      {
        eventId: "EVT-0001-4",
        date: "2026-10-24 16:45",
        displayDate: "24 Oct 2026, 04:45 PM",
        stage: "Regional Office Scrutiny",
        handlingAuthority: "North Regional Office",
        actor: "Ananya Sharma (Regional Officer)",
        title: "Regional Office Inspection Status Review",
        description: "Follow-up query flagged by Regional Office regarding physical laboratory readiness prior to statutory scrutiny committee assembly.",
        statusBadge: "Pending"
      }
    ],
    statusHistory: [
      {
        transitionId: "SH-0001-1",
        fromStatus: "Draft",
        toStatus: "Pending",
        changedDate: "2026-10-04 10:15",
        changedBy: "Intake Registry Officer",
        authorityOrder: "Intake Validation Circular IV-2026/09",
        notes: "Grievance validated with requisite institution identification details."
      }
    ],
    documents: [
      {
        docId: "DOC-0001-1",
        title: "Formal_Grievance_Petition_Cadre_Ratio.pdf",
        type: "PDF",
        size: "1.8 MB",
        uploadedDate: "2026-10-04",
        uploadedBy: "Central Intake Portal",
        accessLevel: "Authorized Regional Officers & RB"
      },
      {
        docId: "DOC-0001-2",
        title: "AICTE_ShowCause_Notice_RB_8812.pdf",
        type: "PDF",
        size: "640 KB",
        uploadedDate: "2026-10-12",
        uploadedBy: "Regulation Bureau (RB-Officer-03)",
        accessLevel: "Official Regulatory Record"
      }
    ],
    relatedCaseIds: ["CASE-2026-0014"],
    overlapAlertId: "OVL-2026-001"
  },
  {
    caseId: "CASE-2026-0014",
    complaintRef: "COMP-REF-2026-8845",
    institutionId: "INST-NR-001",
    institutionName: "ABC Institute of Technology",
    aicteId: "1-563728",
    aisheCode: "C-18492",
    institutionType: "Engineering & Technology",
    location: "Noida, Uttar Pradesh",
    district: "Noida",
    state: "Uttar Pradesh",
    region: "North Region",
    complaintCategory: "Faculty Representation & Service Rules",
    currentBureau: "Public Grievance Redressal Cell (PGRC)",
    bureauCode: "PGRC",
    assignedOfficer: "PGRC-Officer-02",
    assignedOfficerDesignation: "Grievance Redressal Officer, PGRC",
    currentStatus: "In Progress",
    priority: "Medium",
    createdDate: "2026-10-10",
    lastUpdated: "2026-10-23",
    expectedResolutionDate: "2026-11-05",
    subject: "Faculty grievance regarding non-implementation of revised pay scales and promotion criteria.",
    source: "AICTE Online Faculty Redressal Portal",
    jurisdictionScope: "Faculty Welfare & Service Norms",
    movementTimeline: [
      {
        eventId: "EVT-0014-1",
        date: "2026-10-10 09:30",
        displayDate: "10 Oct 2026, 09:30 AM",
        stage: "Filing & Intake",
        handlingAuthority: "PGRC Portal Intake",
        actor: "System",
        title: "Faculty Grievance Received",
        description: "Joint representation submitted by 12 teaching faculty members concerning 7th CPC arrears and Career Advancement Scheme (CAS) delays.",
        statusBadge: "Pending"
      },
      {
        eventId: "EVT-0014-2",
        date: "2026-10-13 11:20",
        displayDate: "13 Oct 2026, 11:20 AM",
        stage: "Initial Scrutiny",
        handlingAuthority: "PGRC",
        actor: "PGRC-Officer-02",
        title: "Admitted & Status Updated to In Progress",
        description: "Representation verified as falling under mandatory institutional Ombudsman jurisdiction. Formal notice dispatched to College Management.",
        statusBadge: "In Progress"
      },
      {
        eventId: "EVT-0014-3",
        date: "2026-10-23 15:10",
        displayDate: "23 Oct 2026, 03:10 PM",
        stage: "Ombudsman Hearing",
        handlingAuthority: "PGRC / Institutional Ombudsman",
        actor: "PGRC-Officer-02",
        title: "Interim Hearing Conducted",
        description: "Ombudsman interim deposition filed. College Principal requested two weeks to table Governing Body resolution on pay parity.",
        statusBadge: "In Progress"
      }
    ],
    statusHistory: [
      {
        transitionId: "SH-0014-1",
        fromStatus: "Pending",
        toStatus: "In Progress",
        changedDate: "2026-10-13 11:20",
        changedBy: "PGRC-Officer-02",
        authorityOrder: "PGRC Case Admission Directive 442/2026",
        notes: "Grievance accepted for formal redressal proceedings."
      }
    ],
    documents: [
      {
        docId: "DOC-0014-1",
        title: "Faculty_Representation_Joint_Petition.pdf",
        type: "PDF",
        size: "2.1 MB",
        uploadedDate: "2026-10-10",
        uploadedBy: "Complainants",
        accessLevel: "PGRC Authorized Personnel"
      },
      {
        docId: "DOC-0014-2",
        title: "Ombudsman_Interim_Proceeding_Minutes.pdf",
        type: "PDF",
        size: "910 KB",
        uploadedDate: "2026-10-23",
        uploadedBy: "PGRC-Officer-02",
        accessLevel: "Official Regulatory Record"
      }
    ],
    relatedCaseIds: ["CASE-2026-0001"],
    overlapAlertId: "OVL-2026-001"
  },
  {
    caseId: "CASE-2026-0009",
    complaintRef: "COMP-REF-2026-7910",
    institutionId: "INST-NR-001",
    institutionName: "ABC Institute of Technology",
    aicteId: "1-563728",
    aisheCode: "C-18492",
    institutionType: "Engineering & Technology",
    location: "Noida, Uttar Pradesh",
    district: "Noida",
    state: "Uttar Pradesh",
    region: "North Region",
    complaintCategory: "Infrastructure & Safety Standards",
    currentBureau: "Regulation Bureau (RB)",
    bureauCode: "RB",
    assignedOfficer: "RB-Officer-01",
    assignedOfficerDesignation: "Chief Technical Scrutiny Officer",
    currentStatus: "Resolved",
    priority: "Normal",
    createdDate: "2026-09-20",
    lastUpdated: "2026-10-15",
    expectedResolutionDate: "2026-10-15",
    subject: "Chemical fume hood and fire safety certification inspection satisfactorily cleared.",
    source: "State Fire Service Referral",
    jurisdictionScope: "Campus Safety & Fire Audit",
    movementTimeline: [
      {
        eventId: "EVT-0009-1",
        date: "2026-09-20 11:00",
        displayDate: "20 Sep 2026, 11:00 AM",
        stage: "Filing & Intake",
        handlingAuthority: "Central Intake",
        actor: "System",
        title: "Safety Audit Referral Registered",
        description: "Referred from municipal fire authority regarding chemistry lab ventilation certification.",
        statusBadge: "Pending"
      },
      {
        eventId: "EVT-0009-2",
        date: "2026-09-25 10:00",
        displayDate: "25 Sep 2026, 10:00 AM",
        stage: "Inspection Ordered",
        handlingAuthority: "Regulation Bureau (RB)",
        actor: "RB-Officer-01",
        title: "Physical Inspection Conducted",
        description: "Joint inspection carried out by Regional Office engineering representative and district safety officer.",
        statusBadge: "In Progress"
      },
      {
        eventId: "EVT-0009-3",
        date: "2026-10-15 16:00",
        displayDate: "15 Oct 2026, 04:00 PM",
        stage: "Final Resolution",
        handlingAuthority: "Regulation Bureau (RB)",
        actor: "RB-Officer-01",
        title: "Compliance Validated & Resolved",
        description: "Valid NOC from Chief Fire Officer and air flow calibration certificate submitted. Case formally resolved.",
        statusBadge: "Resolved"
      }
    ],
    statusHistory: [
      {
        transitionId: "SH-0009-1",
        fromStatus: "Pending",
        toStatus: "In Progress",
        changedDate: "2026-09-25 10:00",
        changedBy: "RB-Officer-01",
        authorityOrder: "Inspection Memo IM-2026/89",
        notes: "Field audit commissioned."
      },
      {
        transitionId: "SH-0009-2",
        fromStatus: "In Progress",
        toStatus: "Resolved",
        changedDate: "2026-10-15 16:00",
        changedBy: "RB-Officer-01",
        authorityOrder: "Closure Order CO-RB-1029",
        notes: "Fire safety certification compliant with NBC 2016."
      }
    ],
    documents: [
      {
        docId: "DOC-0009-1",
        title: "District_Fire_NOC_Verification.pdf",
        type: "PDF",
        size: "1.2 MB",
        uploadedDate: "2026-10-14",
        uploadedBy: "Institution Principal",
        accessLevel: "Public Record"
      }
    ],
    relatedCaseIds: [],
    overlapAlertId: null
  },
  {
    caseId: "CASE-2026-0042",
    complaintRef: "COMP-REF-2026-7781",
    institutionId: "INST-NR-001",
    institutionName: "ABC Institute of Technology",
    aicteId: "1-563728",
    aisheCode: "C-18492",
    institutionType: "Engineering & Technology",
    location: "Noida, Uttar Pradesh",
    district: "Noida",
    state: "Uttar Pradesh",
    region: "North Region",
    complaintCategory: "Fee Regulation & Capitation Inquiry",
    currentBureau: "Public Grievance Redressal Cell (PGRC)",
    bureauCode: "PGRC",
    assignedOfficer: "PGRC-Officer-01",
    assignedOfficerDesignation: "Senior Legal Scrutiny Officer",
    currentStatus: "Under Review",
    priority: "High",
    createdDate: "2026-09-15",
    lastUpdated: "2026-10-25",
    expectedResolutionDate: "2026-10-20",
    subject: "Delay in refund of excess security deposit and examination charges for withdrawn students.",
    source: "Student Parent Collective Representation",
    jurisdictionScope: "Fee Redressal Norms",
    movementTimeline: [
      {
        eventId: "EVT-0042-1",
        date: "2026-09-15 12:00",
        displayDate: "15 Sep 2026, 12:00 PM",
        stage: "Filing",
        handlingAuthority: "PGRC Intake",
        actor: "System",
        title: "Fee Refund Grievance Lodged",
        description: "Grievance lodged regarding non-refund of institutional security deposit exceeding Rs 25,000 for 14 withdrawn candidates.",
        statusBadge: "Pending"
      },
      {
        eventId: "EVT-0042-2",
        date: "2026-09-28 14:00",
        displayDate: "28 Sep 2026, 02:00 PM",
        stage: "Investigation",
        handlingAuthority: "PGRC",
        actor: "PGRC-Officer-01",
        title: "Notice of Non-Compliance Issued",
        description: "Direct notice issued highlighting violation of AICTE Fee Refund Guidelines Clause 4.2.",
        statusBadge: "In Progress"
      },
      {
        eventId: "EVT-0042-3",
        date: "2026-10-25 11:30",
        displayDate: "25 Oct 2026, 11:30 AM",
        stage: "Legal Assessment",
        handlingAuthority: "PGRC Legal Branch",
        actor: "PGRC-Officer-01",
        title: "Case Placed Under Committee Review",
        description: "Referred to AICTE Standing Redressal Committee for punitive deduction order against college admission quota.",
        statusBadge: "Under Review"
      }
    ],
    statusHistory: [
      {
        transitionId: "SH-0042-1",
        fromStatus: "Pending",
        toStatus: "In Progress",
        changedDate: "2026-09-28 14:00",
        changedBy: "PGRC-Officer-01",
        authorityOrder: "APH-Refund-Order 19/2026",
        notes: "Explanation sought within 10 days."
      },
      {
        transitionId: "SH-0042-2",
        fromStatus: "In Progress",
        toStatus: "Under Review",
        changedDate: "2026-10-25 11:30",
        changedBy: "PGRC-Officer-01",
        authorityOrder: "Legal Referral Order LR-7781",
        notes: "Escalated to Standing Redressal Committee."
      }
    ],
    documents: [
      {
        docId: "DOC-0042-1",
        title: "Parent_Representation_Bank_Receipts.pdf",
        type: "PDF",
        size: "3.4 MB",
        uploadedDate: "2026-09-15",
        uploadedBy: "Parent Association",
        accessLevel: "Restricted Financial Inquiry"
      }
    ],
    relatedCaseIds: [],
    overlapAlertId: null
  },
  {
    caseId: "CASE-2026-0143",
    complaintRef: "COMP-REF-2026-8910",
    institutionId: "INST-NR-001",
    institutionName: "ABC Institute of Technology",
    aicteId: "1-563728",
    aisheCode: "C-18492",
    institutionType: "Engineering & Technology",
    location: "Noida, Uttar Pradesh",
    district: "Noida",
    state: "Uttar Pradesh",
    region: "North Region",
    complaintCategory: "Affiliation & Statutory Norms",
    currentBureau: "Regulation Bureau (RB)",
    bureauCode: "RB",
    assignedOfficer: "RB-Officer-03",
    assignedOfficerDesignation: "Senior Scrutiny Officer, Regulation Bureau",
    currentStatus: "Awaiting Institution Response",
    priority: "Medium",
    createdDate: "2026-10-01",
    lastUpdated: "2026-10-22",
    expectedResolutionDate: "2026-10-28",
    subject: "Compliance verification regarding statutory infrastructure norms and faculty roster validation.",
    source: "AICTE Regional Surveillance Unit",
    jurisdictionScope: "Campus Infrastructure Audit",
    movementTimeline: [
      {
        eventId: "EVT-0143-1",
        date: "2026-10-01 11:15",
        displayDate: "01 Oct 2026, 11:15 AM",
        stage: "Filing",
        handlingAuthority: "Surveillance Desk",
        actor: "System",
        title: "Deficiency Report Logged",
        description: "Built-up area shortfall identified during GIS satellite boundary matching.",
        statusBadge: "Pending"
      },
      {
        eventId: "EVT-0143-2",
        date: "2026-10-11 16:30",
        displayDate: "11 Oct 2026, 04:30 PM",
        stage: "Bureau Notice",
        handlingAuthority: "Regulation Bureau (RB)",
        actor: "RB-Officer-03",
        title: "Statutory Directive Issued to Registrar",
        description: "Registered architect geo-tagged floor plan verification requisitioned.",
        statusBadge: "Awaiting Institution Response"
      }
    ],
    statusHistory: [
      {
        transitionId: "SH-0143-1",
        fromStatus: "Pending",
        toStatus: "Awaiting Institution Response",
        changedDate: "2026-10-11 16:30",
        changedBy: "RB-Officer-03",
        authorityOrder: "APH-Infra-Directive 110/2026",
        notes: "Time window of 15 days granted to college."
      }
    ],
    documents: [
      {
        docId: "DOC-0143-1",
        title: "GIS_Survey_Shortfall_Map.pdf",
        type: "PDF",
        size: "4.1 MB",
        uploadedDate: "2026-10-01",
        uploadedBy: "Surveillance Desk",
        accessLevel: "Confidential Inspection Document"
      }
    ],
    relatedCaseIds: ["CASE-2026-0001"],
    overlapAlertId: null
  },
  {
    caseId: "CASE-2026-0178",
    complaintRef: "COMP-REF-2026-9014",
    institutionId: "INST-NR-002",
    institutionName: "Global Institute of Engineering & Research",
    aicteId: "1-672934",
    aisheCode: "C-24108",
    institutionType: "Engineering & Technology",
    location: "Ghaziabad, Uttar Pradesh",
    district: "Ghaziabad",
    state: "Uttar Pradesh",
    region: "North Region",
    complaintCategory: "Student Grievance & Scholarship",
    currentBureau: "Public Grievance Redressal Cell (PGRC)",
    bureauCode: "PGRC",
    assignedOfficer: "PGRC-Officer-02",
    assignedOfficerDesignation: "Grievance Redressal Officer, PGRC",
    currentStatus: "In Progress",
    priority: "Medium",
    createdDate: "2026-10-08",
    lastUpdated: "2026-10-24",
    expectedResolutionDate: "2026-11-02",
    subject: "Grievance received regarding examination fee structure and student scholarship disbursement.",
    source: "National Scholarship Portal (NSP) Forward",
    jurisdictionScope: "Scholarship & Student Entitlement",
    movementTimeline: [
      {
        eventId: "EVT-0178-1",
        date: "2026-10-08 14:00",
        displayDate: "08 Oct 2026, 02:00 PM",
        stage: "Filing",
        handlingAuthority: "NSP Coordination Desk",
        actor: "System",
        title: "NSP Grievance Inward Registered",
        description: "Post-matric scholarship reimbursement withholding reported by SC/ST student delegation.",
        statusBadge: "Pending"
      },
      {
        eventId: "EVT-0178-2",
        date: "2026-10-15 10:30",
        displayDate: "15 Oct 2026, 10:30 AM",
        stage: "PGRC Review",
        handlingAuthority: "PGRC",
        actor: "PGRC-Officer-02",
        title: "Accounts Reconciliation Requisitioned",
        description: "Notice served to Finance Officer of Global Institute for institutional fee reconciliation ledger.",
        statusBadge: "In Progress"
      }
    ],
    statusHistory: [
      {
        transitionId: "SH-0178-1",
        fromStatus: "Pending",
        toStatus: "In Progress",
        changedDate: "2026-10-15 10:30",
        changedBy: "PGRC-Officer-02",
        authorityOrder: "PGRC-Schol-889",
        notes: "Verification initiated with State Social Welfare Department."
      }
    ],
    documents: [
      {
        docId: "DOC-0178-1",
        title: "Student_Scholarship_Representation.pdf",
        type: "PDF",
        size: "1.1 MB",
        uploadedDate: "2026-10-08",
        uploadedBy: "NSP Coordinator",
        accessLevel: "Official Regulatory Record"
      }
    ],
    relatedCaseIds: [],
    overlapAlertId: null
  },
  {
    caseId: "CASE-2026-0195",
    complaintRef: "COMP-REF-2026-8314",
    institutionId: "INST-NR-002",
    institutionName: "Global Institute of Engineering & Research",
    aicteId: "1-672934",
    aisheCode: "C-24108",
    institutionType: "Engineering & Technology",
    location: "Ghaziabad, Uttar Pradesh",
    district: "Ghaziabad",
    state: "Uttar Pradesh",
    region: "North Region",
    complaintCategory: "Infrastructure & Safety Standards",
    currentBureau: "Regulation Bureau (RB)",
    bureauCode: "RB",
    assignedOfficer: "RB-Officer-02",
    assignedOfficerDesignation: "Regional Inspection Officer",
    currentStatus: "Resolved",
    priority: "Normal",
    createdDate: "2026-09-18",
    lastUpdated: "2026-10-12",
    expectedResolutionDate: "2026-10-12",
    subject: "Hostel hygiene norms and dining hall clean water certification validated by regional inspectors.",
    source: "Student Hostel Welfare Committee",
    jurisdictionScope: "Campus Hostel Standards",
    movementTimeline: [
      {
        eventId: "EVT-0195-1",
        date: "2026-09-18 09:15",
        displayDate: "18 Sep 2026, 09:15 AM",
        stage: "Filing",
        handlingAuthority: "Intake Portal",
        actor: "System",
        title: "Hostel Maintenance Complaint Registered",
        description: "Complaint filed regarding non-operational RO water purification plants in student hostels.",
        statusBadge: "Pending"
      },
      {
        eventId: "EVT-0195-2",
        date: "2026-10-12 15:45",
        displayDate: "12 Oct 2026, 03:45 PM",
        stage: "Resolution",
        handlingAuthority: "Regulation Bureau (RB)",
        actor: "RB-Officer-02",
        title: "Rectification Verified and Cleared",
        description: "FSSAI certified water quality report and maintenance logs verified on site. Case closed as resolved.",
        statusBadge: "Resolved"
      }
    ],
    statusHistory: [
      {
        transitionId: "SH-0195-1",
        fromStatus: "Pending",
        toStatus: "Resolved",
        changedDate: "2026-10-12 15:45",
        changedBy: "RB-Officer-02",
        authorityOrder: "Inspection Clearance IC-8314",
        notes: "All parameters satisfactorily rectified."
      }
    ],
    documents: [
      {
        docId: "DOC-0195-1",
        title: "Water_Quality_Lab_Report_FSSAI.pdf",
        type: "PDF",
        size: "780 KB",
        uploadedDate: "2026-10-11",
        uploadedBy: "Global Institute Management",
        accessLevel: "Public Record"
      }
    ],
    relatedCaseIds: [],
    overlapAlertId: null
  },
  {
    caseId: "CASE-2026-0204",
    complaintRef: "COMP-REF-2026-9118",
    institutionId: "INST-NR-002",
    institutionName: "Global Institute of Engineering & Research",
    aicteId: "1-672934",
    aisheCode: "C-24108",
    institutionType: "Engineering & Technology",
    location: "Ghaziabad, Uttar Pradesh",
    district: "Ghaziabad",
    state: "Uttar Pradesh",
    region: "North Region",
    complaintCategory: "Curriculum & Academic Alignment",
    currentBureau: "Public Grievance Redressal Cell (PGRC)",
    bureauCode: "PGRC",
    assignedOfficer: "PGRC-Officer-03",
    assignedOfficerDesignation: "Academic Liaison Officer",
    currentStatus: "Pending",
    priority: "Normal",
    createdDate: "2026-10-14",
    lastUpdated: "2026-10-21",
    expectedResolutionDate: "2026-11-01",
    subject: "Request for scheduling re-examination for students attending national technical competitions.",
    source: "Student Innovation Team Representation",
    jurisdictionScope: "University Academic Regulation",
    movementTimeline: [
      {
        eventId: "EVT-0204-1",
        date: "2026-10-14 16:20",
        displayDate: "14 Oct 2026, 04:20 PM",
        stage: "Filing",
        handlingAuthority: "PGRC Intake",
        actor: "System",
        title: "Academic Relief Representation Received",
        description: "Students representing institute at Smart India Hackathon finals requested special semester exam slot.",
        statusBadge: "Pending"
      }
    ],
    statusHistory: [],
    documents: [],
    relatedCaseIds: [],
    overlapAlertId: null
  },
  {
    caseId: "CASE-2026-0210",
    complaintRef: "COMP-REF-2026-8290",
    institutionId: "INST-NR-003",
    institutionName: "Sunrise College of Engineering & Technology",
    aicteId: "1-774582",
    aisheCode: "C-31950",
    institutionType: "Engineering & Technology",
    location: "Lucknow, Uttar Pradesh",
    district: "Lucknow",
    state: "Uttar Pradesh",
    region: "North Region",
    complaintCategory: "Curriculum & Academic Alignment",
    currentBureau: "Regulation Bureau (RB)",
    bureauCode: "RB",
    assignedOfficer: "RB-Officer-01",
    assignedOfficerDesignation: "Chief Technical Scrutiny Officer",
    currentStatus: "Resolved",
    priority: "Normal",
    createdDate: "2026-09-25",
    lastUpdated: "2026-10-18",
    expectedResolutionDate: "2026-10-18",
    subject: "Academic syllabus alignment and accreditation document submission completed satisfactorily.",
    source: "NBA Accreditation Coordination Cell",
    jurisdictionScope: "Curriculum Standard Adherence",
    movementTimeline: [
      {
        eventId: "EVT-0210-1",
        date: "2026-09-25 10:00",
        displayDate: "25 Sep 2026, 10:00 AM",
        stage: "Filing",
        handlingAuthority: "Accreditation Desk",
        actor: "System",
        title: "Compliance Requisition Initiated",
        description: "Curricular outcome framework aligned with revised Model AICTE Curriculum.",
        statusBadge: "Pending"
      },
      {
        eventId: "EVT-0210-2",
        date: "2026-10-18 14:15",
        displayDate: "18 Oct 2026, 02:15 PM",
        stage: "Resolution",
        handlingAuthority: "Regulation Bureau (RB)",
        actor: "RB-Officer-01",
        title: "Verification Complete & Closed",
        description: "Curriculum mapping endorsed by Academic Council. Matter concluded.",
        statusBadge: "Resolved"
      }
    ],
    statusHistory: [
      {
        transitionId: "SH-0210-1",
        fromStatus: "Pending",
        toStatus: "Resolved",
        changedDate: "2026-10-18 14:15",
        changedBy: "RB-Officer-01",
        authorityOrder: "Resolution Memo RM-8290",
        notes: "AICTE Model Syllabus compliance documented."
      }
    ],
    documents: [
      {
        docId: "DOC-0210-1",
        title: "Curriculum_Alignment_Matrix_2026.pdf",
        type: "PDF",
        size: "1.9 MB",
        uploadedDate: "2026-10-16",
        uploadedBy: "Sunrise College Dean Academics",
        accessLevel: "Public Record"
      }
    ],
    relatedCaseIds: [],
    overlapAlertId: null
  },
  {
    caseId: "CASE-2026-0215",
    complaintRef: "COMP-REF-2026-8340",
    institutionId: "INST-NR-003",
    institutionName: "Sunrise College of Engineering & Technology",
    aicteId: "1-774582",
    aisheCode: "C-31950",
    institutionType: "Engineering & Technology",
    location: "Lucknow, Uttar Pradesh",
    district: "Lucknow",
    state: "Uttar Pradesh",
    region: "North Region",
    complaintCategory: "Student Grievance & Scholarship",
    currentBureau: "Public Grievance Redressal Cell (PGRC)",
    bureauCode: "PGRC",
    assignedOfficer: "PGRC-Officer-01",
    assignedOfficerDesignation: "Senior Legal Scrutiny Officer",
    currentStatus: "Closed",
    priority: "Normal",
    createdDate: "2026-09-28",
    lastUpdated: "2026-10-19",
    expectedResolutionDate: "2026-10-19",
    subject: "Clearance of pending degree certificates and migration documents for 2025 pass-out batch.",
    source: "Alumni Grievance Portal",
    jurisdictionScope: "Certification & Transcript Disposal",
    movementTimeline: [
      {
        eventId: "EVT-0215-1",
        date: "2026-09-28 11:30",
        displayDate: "28 Sep 2026, 11:30 AM",
        stage: "Filing",
        handlingAuthority: "PGRC Intake",
        actor: "System",
        title: "Transcript Delay Complaint Registered",
        description: "Complaint filed on behalf of 28 graduates awaiting final transcript dispatch for overseas higher education.",
        statusBadge: "Pending"
      },
      {
        eventId: "EVT-0215-2",
        date: "2026-10-19 16:00",
        displayDate: "19 Oct 2026, 04:00 PM",
        stage: "Formal Closure",
        handlingAuthority: "PGRC",
        actor: "PGRC-Officer-01",
        title: "All Transcripts Issued & Case Closed",
        description: "Registrar submitted speed post tracking records and signed student receipts. Case closed with satisfaction sign-off.",
        statusBadge: "Closed"
      }
    ],
    statusHistory: [
      {
        transitionId: "SH-0215-1",
        fromStatus: "Pending",
        toStatus: "Closed",
        changedDate: "2026-10-19 16:00",
        changedBy: "PGRC-Officer-01",
        authorityOrder: "Final Closure Order FC-8340",
        notes: "Full discharge confirmed by Complainants."
      }
    ],
    documents: [
      {
        docId: "DOC-0215-1",
        title: "Transcript_Dispatch_Receipts_Signed.pdf",
        type: "PDF",
        size: "2.5 MB",
        uploadedDate: "2026-10-19",
        uploadedBy: "Sunrise College Registrar",
        accessLevel: "Closed Case Archive"
      }
    ],
    relatedCaseIds: [],
    overlapAlertId: null
  },
  {
    caseId: "CASE-2026-0247",
    complaintRef: "COMP-REF-2026-7740",
    institutionId: "INST-NR-004",
    institutionName: "Techno Institute of Management Studies",
    aicteId: "1-886421",
    aisheCode: "C-40291",
    institutionType: "Management",
    location: "South Delhi, Delhi",
    district: "Delhi",
    state: "Delhi",
    region: "North Region",
    complaintCategory: "Infrastructure & Safety Standards",
    currentBureau: "Public Grievance Redressal Cell (PGRC)",
    bureauCode: "PGRC",
    assignedOfficer: "PGRC-Officer-03",
    assignedOfficerDesignation: "Grievance Redressal Officer",
    currentStatus: "Under Review",
    priority: "Critical",
    createdDate: "2026-09-12",
    lastUpdated: "2026-10-25",
    expectedResolutionDate: "2026-10-20",
    subject: "Inspection report on laboratory equipment safety standards overdue by 6 days. Escalation flagged.",
    source: "Joint Student-Faculty Safety Council",
    jurisdictionScope: "Computer Lab & Electrical Safety",
    movementTimeline: [
      {
        eventId: "EVT-0247-1",
        date: "2026-09-12 10:15",
        displayDate: "12 Sep 2026, 10:15 AM",
        stage: "Filing",
        handlingAuthority: "Intake",
        actor: "System",
        title: "Complaint Registered",
        description: "Concerns raised regarding overloaded server racks and lack of dual electrical grounding in primary IT lab.",
        statusBadge: "Pending"
      },
      {
        eventId: "EVT-0247-2",
        date: "2026-09-22 15:00",
        displayDate: "22 Sep 2026, 03:00 PM",
        stage: "Inspection Order",
        handlingAuthority: "PGRC",
        actor: "PGRC-Officer-03",
        title: "Safety Audit Committee Deputed",
        description: "Two-member panel constituted to audit IT infrastructure.",
        statusBadge: "In Progress"
      },
      {
        eventId: "EVT-0247-3",
        date: "2026-10-25 10:00",
        displayDate: "25 Oct 2026, 10:00 AM",
        stage: "Overdue Escalation",
        handlingAuthority: "Regional Office / PGRC",
        actor: "PGRC-Officer-03",
        title: "Escalation to Bureau Head for Show-Cause",
        description: "Audit compliance deadline lapsed. Escalation memorandum submitted to Regulation Bureau for combined inquiry.",
        statusBadge: "Under Review"
      }
    ],
    statusHistory: [
      {
        transitionId: "SH-0247-1",
        fromStatus: "Pending",
        toStatus: "In Progress",
        changedDate: "2026-09-22 15:00",
        changedBy: "PGRC-Officer-03",
        authorityOrder: "Audit Memo AM-7740",
        notes: "Inspection commissioned."
      },
      {
        transitionId: "SH-0247-2",
        fromStatus: "In Progress",
        toStatus: "Under Review",
        changedDate: "2026-10-25 10:00",
        changedBy: "PGRC-Officer-03",
        authorityOrder: "Escalation Memo ESC-7740",
        notes: "Referred for joint Bureau review due to concurrent intake deficiency."
      }
    ],
    documents: [
      {
        docId: "DOC-0247-1",
        title: "Safety_Committee_Interim_Notice.pdf",
        type: "PDF",
        size: "1.4 MB",
        uploadedDate: "2026-09-22",
        uploadedBy: "PGRC-Officer-03",
        accessLevel: "Official Regulatory Record"
      }
    ],
    relatedCaseIds: ["CASE-2026-0255"],
    overlapAlertId: "OVL-2026-004"
  },
  {
    caseId: "CASE-2026-0255",
    complaintRef: "COMP-REF-2026-8971",
    institutionId: "INST-NR-004",
    institutionName: "Techno Institute of Management Studies",
    aicteId: "1-886421",
    aisheCode: "C-40291",
    institutionType: "Management",
    location: "South Delhi, Delhi",
    district: "Delhi",
    state: "Delhi",
    region: "North Region",
    complaintCategory: "Sanctioned Intake Compliance",
    currentBureau: "Regulation Bureau (RB)",
    bureauCode: "RB",
    assignedOfficer: "RB-Officer-04",
    assignedOfficerDesignation: "Statutory Approval Enforcement Officer",
    currentStatus: "Pending",
    priority: "High",
    createdDate: "2026-10-05",
    lastUpdated: "2026-10-21",
    expectedResolutionDate: "2026-10-29",
    subject: "Statutory audit into reports of student admissions exceeding AICTE approved intake by 15 seats.",
    source: "University Affiliation Scrutiny Board",
    jurisdictionScope: "Approval Process Handbook Intake Enforcement",
    movementTimeline: [
      {
        eventId: "EVT-0255-1",
        date: "2026-10-05 15:40",
        displayDate: "05 Oct 2026, 03:40 PM",
        stage: "Filing",
        handlingAuthority: "Intake",
        actor: "System",
        title: "Excess Intake Information Registered",
        description: "Official report received from GGSIPU highlighting enrolled roll numbers exceeding approved PGDM/MBA quota.",
        statusBadge: "Pending"
      },
      {
        eventId: "EVT-0255-2",
        date: "2026-10-14 11:30",
        displayDate: "14 Oct 2026, 11:30 AM",
        stage: "Notice to College",
        handlingAuthority: "Regulation Bureau (RB)",
        actor: "RB-Officer-04",
        title: "Admission Ledger Demand Notice Issued",
        description: "Demanded certified entrance rank lists and fee payment dates for all admitted students.",
        statusBadge: "Pending"
      }
    ],
    statusHistory: [],
    documents: [
      {
        docId: "DOC-0255-1",
        title: "GGSIPU_Affiliation_Intake_Audit.pdf",
        type: "PDF",
        size: "2.7 MB",
        uploadedDate: "2026-10-05",
        uploadedBy: "University Registrar",
        accessLevel: "Confidential Regulatory Record"
      }
    ],
    relatedCaseIds: ["CASE-2026-0247"],
    overlapAlertId: "OVL-2026-004"
  },
  {
    caseId: "CASE-2026-0260",
    complaintRef: "COMP-REF-2026-9040",
    institutionId: "INST-NR-004",
    institutionName: "Techno Institute of Management Studies",
    aicteId: "1-886421",
    aisheCode: "C-40291",
    institutionType: "Management",
    location: "South Delhi, Delhi",
    district: "Delhi",
    state: "Delhi",
    region: "North Region",
    complaintCategory: "Student Grievance & Scholarship",
    currentBureau: "Public Grievance Redressal Cell (PGRC)",
    bureauCode: "PGRC",
    assignedOfficer: "PGRC-Officer-02",
    assignedOfficerDesignation: "Grievance Redressal Officer",
    currentStatus: "In Progress",
    priority: "Normal",
    createdDate: "2026-10-11",
    lastUpdated: "2026-10-23",
    expectedResolutionDate: "2026-11-07",
    subject: "Inquiry into advertised campus placement compensation statistics versus verified offer letters.",
    source: "Student Consumer Forum Communication",
    jurisdictionScope: "Mandatory Disclosure Truthfulness",
    movementTimeline: [
      {
        eventId: "EVT-0260-1",
        date: "2026-10-11 12:00",
        displayDate: "11 Oct 2026, 12:00 PM",
        stage: "Filing",
        handlingAuthority: "Intake",
        actor: "System",
        title: "Placement Grievance Inward",
        description: "Representation alleging inflated average package statistics displayed in prospectus.",
        statusBadge: "Pending"
      },
      {
        eventId: "EVT-0260-2",
        date: "2026-10-18 16:00",
        displayDate: "18 Oct 2026, 04:00 PM",
        stage: "Notice",
        handlingAuthority: "PGRC",
        actor: "PGRC-Officer-02",
        title: "Placement Cell Verification Initiated",
        description: "Official clarification sought regarding placement auditing agency reports.",
        statusBadge: "In Progress"
      }
    ],
    statusHistory: [
      {
        transitionId: "SH-0260-1",
        fromStatus: "Pending",
        toStatus: "In Progress",
        changedDate: "2026-10-18 16:00",
        changedBy: "PGRC-Officer-02",
        authorityOrder: "PGRC-Place-9040",
        notes: "Case admitted for factual verification."
      }
    ],
    documents: [],
    relatedCaseIds: [],
    overlapAlertId: null
  },
  {
    caseId: "CASE-2026-0281",
    complaintRef: "COMP-REF-2026-8801",
    institutionId: "INST-NR-005",
    institutionName: "National College of Pharmacy",
    aicteId: "1-992145",
    aisheCode: "C-51042",
    institutionType: "Pharmacy",
    location: "Kanpur, Uttar Pradesh",
    district: "Kanpur",
    state: "Uttar Pradesh",
    region: "North Region",
    complaintCategory: "Affiliation & Statutory Norms",
    currentBureau: "Specialized Cells",
    bureauCode: "Specialized Cells",
    assignedOfficer: "OC-Officer-01",
    assignedOfficerDesignation: "Specialized Pharmacy Cell Liaison",
    currentStatus: "Transferred",
    priority: "Normal",
    createdDate: "2026-10-02",
    lastUpdated: "2026-10-22",
    expectedResolutionDate: "2026-10-30",
    subject: "Case transferred to Specialized Pharmacy Cell for cross-statutory jurisdiction and PCI alignment.",
    source: "Pharmacy Council of India (PCI) Communication",
    jurisdictionScope: "Inter-Council Jurisdictional Alignment",
    movementTimeline: [
      {
        eventId: "EVT-0281-1",
        date: "2026-10-02 10:30",
        displayDate: "02 Oct 2026, 10:30 AM",
        stage: "Filing",
        handlingAuthority: "Central Intake",
        actor: "System",
        title: "Jurisdiction Query Received",
        description: "Inquiry on harmonization of faculty-student ratio between AICTE APH and PCI statutory norms.",
        statusBadge: "Pending"
      },
      {
        eventId: "EVT-0281-2",
        date: "2026-10-16 14:00",
        displayDate: "16 Oct 2026, 02:00 PM",
        stage: "Jurisdiction Transfer",
        handlingAuthority: "Regulation Bureau / Specialized Cells",
        actor: "RB-Directorate",
        title: "Formally Transferred to Specialized Pharmacy Cell",
        description: "Matter involves specialized pharma curriculum and PCI tribunal rulings; transferred to Specialized Cells for expert appraisal.",
        statusBadge: "Transferred"
      }
    ],
    statusHistory: [
      {
        transitionId: "SH-0281-1",
        fromStatus: "Pending",
        toStatus: "Transferred",
        changedDate: "2026-10-16 14:00",
        changedBy: "RB-Directorate",
        authorityOrder: "Transfer Memo TM-RB-Pharma/04",
        notes: "Transferred under inter-council jurisdiction protocols."
      }
    ],
    documents: [
      {
        docId: "DOC-0281-1",
        title: "PCI_Statutory_Harmonization_Brief.pdf",
        type: "PDF",
        size: "1.6 MB",
        uploadedDate: "2026-10-16",
        uploadedBy: "RB-Directorate",
        accessLevel: "Specialized Cell Confidential"
      }
    ],
    relatedCaseIds: [],
    overlapAlertId: null
  },
  {
    caseId: "CASE-2026-0288",
    complaintRef: "COMP-REF-2026-9022",
    institutionId: "INST-NR-005",
    institutionName: "National College of Pharmacy",
    aicteId: "1-992145",
    aisheCode: "C-51042",
    institutionType: "Pharmacy",
    location: "Kanpur, Uttar Pradesh",
    district: "Kanpur",
    state: "Uttar Pradesh",
    region: "North Region",
    complaintCategory: "Infrastructure & Safety Standards",
    currentBureau: "Regulation Bureau (RB)",
    bureauCode: "RB",
    assignedOfficer: "RB-Officer-02",
    assignedOfficerDesignation: "Regional Inspection Officer",
    currentStatus: "In Progress",
    priority: "High",
    createdDate: "2026-10-09",
    lastUpdated: "2026-10-24",
    expectedResolutionDate: "2026-11-04",
    subject: "Validation of safe chemical waste containment protocols and effluent treatment plant records.",
    source: "UP Pollution Control Board Inspection Note",
    jurisdictionScope: "Environmental & Lab Safety",
    movementTimeline: [
      {
        eventId: "EVT-0288-1",
        date: "2026-10-09 11:45",
        displayDate: "09 Oct 2026, 11:45 AM",
        stage: "Filing",
        handlingAuthority: "Intake",
        actor: "System",
        title: "Environmental Notice Received",
        description: "Notice regarding compliance status of chemical effluent neutralizer in pharmaceutical chemistry laboratories.",
        statusBadge: "Pending"
      },
      {
        eventId: "EVT-0288-2",
        date: "2026-10-17 10:15",
        displayDate: "17 Oct 2026, 10:15 AM",
        stage: "Field Inspection",
        handlingAuthority: "Regulation Bureau (RB)",
        actor: "RB-Officer-02",
        title: "On-Site Sample Inspection Conducted",
        description: "Regional office team inspected hazardous chemical disposal storage and neutralization pit.",
        statusBadge: "In Progress"
      }
    ],
    statusHistory: [
      {
        transitionId: "SH-0288-1",
        fromStatus: "Pending",
        toStatus: "In Progress",
        changedDate: "2026-10-17 10:15",
        changedBy: "RB-Officer-02",
        authorityOrder: "Field Inspection Mandate 88/2026",
        notes: "Inspection completed; awaiting laboratory test validation report."
      }
    ],
    documents: [
      {
        docId: "DOC-0288-1",
        title: "Effluent_Plant_Inspection_Log.pdf",
        type: "PDF",
        size: "3.2 MB",
        uploadedDate: "2026-10-17",
        uploadedBy: "RB-Officer-02",
        accessLevel: "Official Regulatory Record"
      }
    ],
    relatedCaseIds: [],
    overlapAlertId: null
  },
  {
    caseId: "CASE-2026-0312",
    complaintRef: "COMP-REF-2026-8772",
    institutionId: "INST-NR-006",
    institutionName: "Apex School of Planning & Architecture",
    aicteId: "1-451298",
    aisheCode: "C-12948",
    institutionType: "Architecture",
    location: "Gurugram, Haryana",
    district: "Gurugram",
    state: "Haryana",
    region: "North Region",
    complaintCategory: "Infrastructure & Safety Standards",
    currentBureau: "Regulation Bureau (RB)",
    bureauCode: "RB",
    assignedOfficer: "RB-Officer-02",
    assignedOfficerDesignation: "Regional Inspection Officer",
    currentStatus: "Pending",
    priority: "Normal",
    createdDate: "2026-10-03",
    lastUpdated: "2026-10-20",
    expectedResolutionDate: "2026-10-27",
    subject: "Compliance report requested on minimum architectural studio floor space and licensed CAD workstations.",
    source: "Student Architecture Society",
    jurisdictionScope: "Council of Architecture & AICTE Norms",
    movementTimeline: [
      {
        eventId: "EVT-0312-1",
        date: "2026-10-03 14:15",
        displayDate: "03 Oct 2026, 02:15 PM",
        stage: "Filing",
        handlingAuthority: "Intake",
        actor: "System",
        title: "Studio Norms Representation Lodged",
        description: "Grievance alleging inadequate studio drawing tables and licensed Revit/AutoCAD software seats.",
        statusBadge: "Pending"
      }
    ],
    statusHistory: [],
    documents: [],
    relatedCaseIds: [],
    overlapAlertId: null
  },
  {
    caseId: "CASE-2026-0320",
    complaintRef: "COMP-REF-2026-7650",
    institutionId: "INST-NR-006",
    institutionName: "Apex School of Planning & Architecture",
    aicteId: "1-451298",
    aisheCode: "C-12948",
    institutionType: "Architecture",
    location: "Gurugram, Haryana",
    district: "Gurugram",
    state: "Haryana",
    region: "North Region",
    complaintCategory: "Fee Regulation & Capitation Inquiry",
    currentBureau: "Public Grievance Redressal Cell (PGRC)",
    bureauCode: "PGRC",
    assignedOfficer: "PGRC-Officer-04",
    assignedOfficerDesignation: "Grievance Redressal Officer",
    currentStatus: "Awaiting Institution Response",
    priority: "High",
    createdDate: "2026-09-10",
    lastUpdated: "2026-10-22",
    expectedResolutionDate: "2026-10-18",
    subject: "Student grievance against unapproved mid-session enhancement of studio equipment development fees.",
    source: "Student Welfare Committee",
    jurisdictionScope: "State Fee Regulatory Committee Guidelines",
    movementTimeline: [
      {
        eventId: "EVT-0320-1",
        date: "2026-09-10 10:00",
        displayDate: "10 Sep 2026, 10:00 AM",
        stage: "Filing",
        handlingAuthority: "Intake",
        actor: "System",
        title: "Fee Enhancement Complaint Registered",
        description: "Representation against mandatory Rs 18,000 architectural model making laboratory fee levy.",
        statusBadge: "Pending"
      },
      {
        eventId: "EVT-0320-2",
        date: "2026-10-02 11:30",
        displayDate: "02 Oct 2026, 11:30 AM",
        stage: "Regulatory Directive",
        handlingAuthority: "PGRC",
        actor: "PGRC-Officer-04",
        title: "Show-Cause Issued to Governing Body",
        description: "Directed institution to stay fee collection pending State Fee Committee review.",
        statusBadge: "Awaiting Institution Response"
      }
    ],
    statusHistory: [
      {
        transitionId: "SH-0320-1",
        fromStatus: "Pending",
        toStatus: "Awaiting Institution Response",
        changedDate: "2026-10-02 11:30",
        changedBy: "PGRC-Officer-04",
        authorityOrder: "PGRC Directive 320/2026",
        notes: "College granted 2 weeks to submit audited expenditure sheet."
      }
    ],
    documents: [
      {
        docId: "DOC-0320-1",
        title: "Fee_Notice_Apex_Architecture_Circular.pdf",
        type: "PDF",
        size: "820 KB",
        uploadedDate: "2026-09-10",
        uploadedBy: "Complainants",
        accessLevel: "Official Regulatory Record"
      }
    ],
    relatedCaseIds: [],
    overlapAlertId: null
  },
  {
    caseId: "CASE-2026-0331",
    complaintRef: "COMP-REF-2026-8994",
    institutionId: "INST-NR-007",
    institutionName: "Chandigarh Polytechnic Institute",
    aicteId: "1-382910",
    aisheCode: "C-62810",
    institutionType: "Polytechnic",
    location: "Sector 26, Chandigarh",
    district: "Chandigarh",
    state: "Chandigarh (UT)",
    region: "North Region",
    complaintCategory: "Infrastructure & Safety Standards",
    currentBureau: "Regulation Bureau (RB)",
    bureauCode: "RB",
    assignedOfficer: "RB-Officer-01",
    assignedOfficerDesignation: "Chief Technical Scrutiny Officer",
    currentStatus: "In Progress",
    priority: "Normal",
    createdDate: "2026-10-07",
    lastUpdated: "2026-10-23",
    expectedResolutionDate: "2026-11-06",
    subject: "Preventive maintenance audit for heavy mechanical lathe machines and electrical safety breakers.",
    source: "Punjab State Board of Technical Education",
    jurisdictionScope: "Diploma Workshop Safety Protocols",
    movementTimeline: [
      {
        eventId: "EVT-0331-1",
        date: "2026-10-07 10:15",
        displayDate: "07 Oct 2026, 10:15 AM",
        stage: "Filing",
        handlingAuthority: "Intake",
        actor: "System",
        title: "Workshop Audit Report Registered",
        description: "Routine polytechnic mechanical workshop safety review flagged for compliance tracking.",
        statusBadge: "Pending"
      },
      {
        eventId: "EVT-0331-2",
        date: "2026-10-18 15:00",
        displayDate: "18 Oct 2026, 03:00 PM",
        stage: "Inspection",
        handlingAuthority: "Regulation Bureau (RB)",
        actor: "RB-Officer-01",
        title: "Safety Equipment Upgrade in Progress",
        description: "Polytechnic principal submitted purchase orders for emergency machine stop-switches and PPE kit racks.",
        statusBadge: "In Progress"
      }
    ],
    statusHistory: [
      {
        transitionId: "SH-0331-1",
        fromStatus: "Pending",
        toStatus: "In Progress",
        changedDate: "2026-10-18 15:00",
        changedBy: "RB-Officer-01",
        authorityOrder: "RB-Polytechnic-Order 331",
        notes: "Compliance remediation accepted for ongoing monitoring."
      }
    ],
    documents: [],
    relatedCaseIds: [],
    overlapAlertId: null
  },
  {
    caseId: "CASE-2026-0339",
    complaintRef: "COMP-REF-2026-8199",
    institutionId: "INST-NR-007",
    institutionName: "Chandigarh Polytechnic Institute",
    aicteId: "1-382910",
    aisheCode: "C-62810",
    institutionType: "Polytechnic",
    location: "Sector 26, Chandigarh",
    district: "Chandigarh",
    state: "Chandigarh (UT)",
    region: "North Region",
    complaintCategory: "Student Grievance & Scholarship",
    currentBureau: "Public Grievance Redressal Cell (PGRC)",
    bureauCode: "PGRC",
    assignedOfficer: "PGRC-Officer-02",
    assignedOfficerDesignation: "Grievance Redressal Officer",
    currentStatus: "Resolved",
    priority: "Normal",
    createdDate: "2026-09-22",
    lastUpdated: "2026-10-14",
    expectedResolutionDate: "2026-10-14",
    subject: "Resolution achieved for student bus pass identity documentation verification delays.",
    source: "Student Union Representation",
    jurisdictionScope: "Student Welfare & Transportation Concessions",
    movementTimeline: [
      {
        eventId: "EVT-0339-1",
        date: "2026-09-22 13:00",
        displayDate: "22 Sep 2026, 01:00 PM",
        stage: "Filing",
        handlingAuthority: "Intake",
        actor: "System",
        title: "Concession Document Grievance Registered",
        description: "Delay reported in college seal stamping on UT Chandigarh transport concession passes.",
        statusBadge: "Pending"
      },
      {
        eventId: "EVT-0339-2",
        date: "2026-10-14 11:00",
        displayDate: "14 Oct 2026, 11:00 AM",
        stage: "Resolution",
        handlingAuthority: "PGRC",
        actor: "PGRC-Officer-02",
        title: "All 185 Student Passes Countersigned",
        description: "Special verification camp organized on campus. Complete clearance achieved.",
        statusBadge: "Resolved"
      }
    ],
    statusHistory: [
      {
        transitionId: "SH-0339-1",
        fromStatus: "Pending",
        toStatus: "Resolved",
        changedDate: "2026-10-14 11:00",
        changedBy: "PGRC-Officer-02",
        authorityOrder: "Resolution Closure RC-8199",
        notes: "Countersigning process standardized."
      }
    ],
    documents: [],
    relatedCaseIds: [],
    overlapAlertId: null
  },
  {
    caseId: "CASE-2026-0350",
    complaintRef: "COMP-REF-2026-8919",
    institutionId: "INST-NR-008",
    institutionName: "Himalayan Institute of Technology",
    aicteId: "1-294019",
    aisheCode: "C-73194",
    institutionType: "Engineering & Technology",
    location: "Dehradun, Uttarakhand",
    district: "Dehradun",
    state: "Uttarakhand",
    region: "North Region",
    complaintCategory: "Faculty Representation & Service Rules",
    currentBureau: "Public Grievance Redressal Cell (PGRC)",
    bureauCode: "PGRC",
    assignedOfficer: "PGRC-Officer-03",
    assignedOfficerDesignation: "Grievance Redressal Officer",
    currentStatus: "Pending",
    priority: "High",
    createdDate: "2026-10-06",
    lastUpdated: "2026-10-23",
    expectedResolutionDate: "2026-10-31",
    subject: "Faculty welfare petition concerning timely disbursement of basic allowances and leave encashment.",
    source: "Uttarakhand State Teachers Federation",
    jurisdictionScope: "Faculty Terms & Service Conditions",
    movementTimeline: [
      {
        eventId: "EVT-0350-1",
        date: "2026-10-06 10:45",
        displayDate: "06 Oct 2026, 10:45 AM",
        stage: "Filing",
        handlingAuthority: "Intake",
        actor: "System",
        title: "Faculty Representation Inward",
        description: "Petition submitted regarding irregular disbursement of academic allowances and provident fund matching share.",
        statusBadge: "Pending"
      },
      {
        eventId: "EVT-0350-2",
        date: "2026-10-16 14:00",
        displayDate: "16 Oct 2026, 02:00 PM",
        stage: "Notice to College",
        handlingAuthority: "PGRC",
        actor: "PGRC-Officer-03",
        title: "Directive on Mandatory Compliance",
        description: "College directed to submit PF challan receipts for the past 6 quarters.",
        statusBadge: "Pending"
      }
    ],
    statusHistory: [],
    documents: [
      {
        docId: "DOC-0350-1",
        title: "Faculty_Federation_Affidavit.pdf",
        type: "PDF",
        size: "1.8 MB",
        uploadedDate: "2026-10-06",
        uploadedBy: "Teachers Federation",
        accessLevel: "Official Regulatory Record"
      }
    ],
    relatedCaseIds: ["CASE-2026-0358"],
    overlapAlertId: "OVL-2026-008"
  },
  {
    caseId: "CASE-2026-0358",
    complaintRef: "COMP-REF-2026-9051",
    institutionId: "INST-NR-008",
    institutionName: "Himalayan Institute of Technology",
    aicteId: "1-294019",
    aisheCode: "C-73194",
    institutionType: "Engineering & Technology",
    location: "Dehradun, Uttarakhand",
    district: "Dehradun",
    state: "Uttarakhand",
    region: "North Region",
    complaintCategory: "Affiliation & Statutory Norms",
    currentBureau: "Regulation Bureau (RB)",
    bureauCode: "RB",
    assignedOfficer: "RB-Officer-03",
    assignedOfficerDesignation: "Senior Scrutiny Officer, Regulation Bureau",
    currentStatus: "Pending",
    priority: "High",
    createdDate: "2026-10-11",
    lastUpdated: "2026-10-24",
    expectedResolutionDate: "2026-11-03",
    subject: "Verification of institution response on retention of faculty service books and experience certificates.",
    source: "Direct Faculty Representation to Member Secretary",
    jurisdictionScope: "AICTE Regulation on Faculty Retention & Service Documents",
    movementTimeline: [
      {
        eventId: "EVT-0358-1",
        date: "2026-10-11 11:30",
        displayDate: "11 Oct 2026, 11:30 AM",
        stage: "Filing",
        handlingAuthority: "Intake",
        actor: "System",
        title: "Original Document Retention Complaint Logged",
        description: "Complaint citing violation of AICTE ban on retaining original certificates and service books of faculty upon resignation.",
        statusBadge: "Pending"
      },
      {
        eventId: "EVT-0358-2",
        date: "2026-10-19 15:20",
        displayDate: "19 Oct 2026, 03:20 PM",
        stage: "Regulatory Warning",
        handlingAuthority: "Regulation Bureau (RB)",
        actor: "RB-Officer-03",
        title: "Mandatory Release Warning Dispatched",
        description: "Institutional head warned of affiliation withdrawal under AICTE Regulations 2020 Clause 6.1.",
        statusBadge: "Pending"
      }
    ],
    statusHistory: [],
    documents: [
      {
        docId: "DOC-0358-1",
        title: "AICTE_APH_Certificate_Retention_Rule.pdf",
        type: "PDF",
        size: "450 KB",
        uploadedDate: "2026-10-11",
        uploadedBy: "Regulation Bureau",
        accessLevel: "Statutory Guideline"
      }
    ],
    relatedCaseIds: ["CASE-2026-0350"],
    overlapAlertId: "OVL-2026-008"
  },
  {
    caseId: "CASE-2026-0361",
    complaintRef: "COMP-REF-2026-7512",
    institutionId: "INST-NR-008",
    institutionName: "Himalayan Institute of Technology",
    aicteId: "1-294019",
    aisheCode: "C-73194",
    institutionType: "Engineering & Technology",
    location: "Dehradun, Uttarakhand",
    district: "Dehradun",
    state: "Uttarakhand",
    region: "North Region",
    complaintCategory: "Faculty Representation & Service Rules",
    currentBureau: "Public Grievance Redressal Cell (PGRC)",
    bureauCode: "PGRC",
    assignedOfficer: "PGRC-Officer-01",
    assignedOfficerDesignation: "Senior Legal Scrutiny Officer",
    currentStatus: "Under Review",
    priority: "Critical",
    createdDate: "2026-09-05",
    lastUpdated: "2026-10-25",
    expectedResolutionDate: "2026-10-16",
    subject: "Unresolved grievance concerning delayed terminal gratuity settlement for retired senior professor.",
    source: "Retired Faculty Petition",
    jurisdictionScope: "Payment of Gratuity Act Compliance",
    movementTimeline: [
      {
        eventId: "EVT-0361-1",
        date: "2026-09-05 10:15",
        displayDate: "05 Sep 2026, 10:15 AM",
        stage: "Filing",
        handlingAuthority: "Intake",
        actor: "System",
        title: "Gratuity Withholding Petition Filed",
        description: "Petition regarding non-payment of statutory gratuity following 18 years of approved teaching service.",
        statusBadge: "Pending"
      },
      {
        eventId: "EVT-0361-2",
        date: "2026-09-24 16:00",
        displayDate: "24 Sep 2026, 04:00 PM",
        stage: "PGRC Notice",
        handlingAuthority: "PGRC",
        actor: "PGRC-Officer-01",
        title: "Statutory Gratuity Settlement Requisitioned",
        description: "Direct show-cause issued to Chairman of Board of Governors.",
        statusBadge: "In Progress"
      },
      {
        eventId: "EVT-0361-3",
        date: "2026-10-25 14:00",
        displayDate: "25 Oct 2026, 02:00 PM",
        stage: "Legal Review",
        handlingAuthority: "PGRC Legal Wing",
        actor: "PGRC-Officer-01",
        title: "Referred for Inter-Agency Labor Commission Review",
        description: "Case placed under committee review for attachment of institutional grant under Section 8 of Payment of Gratuity Act.",
        statusBadge: "Under Review"
      }
    ],
    statusHistory: [
      {
        transitionId: "SH-0361-1",
        fromStatus: "Pending",
        toStatus: "In Progress",
        changedDate: "2026-09-24 16:00",
        changedBy: "PGRC-Officer-01",
        authorityOrder: "PGRC-Gratuity-Order 99",
        notes: "Investigation initiated."
      },
      {
        transitionId: "SH-0361-2",
        fromStatus: "In Progress",
        toStatus: "Under Review",
        changedDate: "2026-10-25 14:00",
        changedBy: "PGRC-Officer-01",
        authorityOrder: "Legal Esc-7512",
        notes: "Overdue resolution escalated to legal council."
      }
    ],
    documents: [
      {
        docId: "DOC-0361-1",
        title: "Retirement_Order_and_Gratuity_Claim.pdf",
        type: "PDF",
        size: "2.3 MB",
        uploadedDate: "2026-09-05",
        uploadedBy: "Petitioner",
        accessLevel: "Legal Document"
      }
    ],
    relatedCaseIds: ["CASE-2026-0350"],
    overlapAlertId: null
  },
  {
    caseId: "CASE-2026-0382",
    complaintRef: "COMP-REF-2026-8215",
    institutionId: "INST-NR-009",
    institutionName: "Jaipur College of Pharmacy & Research",
    aicteId: "1-512039",
    aisheCode: "C-81923",
    institutionType: "Pharmacy",
    location: "Jaipur, Rajasthan",
    district: "Jaipur",
    state: "Rajasthan",
    region: "North Region",
    complaintCategory: "Infrastructure & Safety Standards",
    currentBureau: "Specialized Cells",
    bureauCode: "Specialized Cells",
    assignedOfficer: "OC-Officer-02",
    assignedOfficerDesignation: "Specialized Ethics Cell Inspector",
    currentStatus: "Resolved",
    priority: "Normal",
    createdDate: "2026-09-16",
    lastUpdated: "2026-10-10",
    expectedResolutionDate: "2026-10-10",
    subject: "Institutional Animal Ethics Committee (IAEC) renewal compliance and room ventilation clearance.",
    source: "CPCSEA Ministry Referral",
    jurisdictionScope: "Animal Testing Ethics & Laboratory Standards",
    movementTimeline: [
      {
        eventId: "EVT-0382-1",
        date: "2026-09-16 11:30",
        displayDate: "16 Sep 2026, 11:30 AM",
        stage: "Filing",
        handlingAuthority: "Intake",
        actor: "System",
        title: "IAEC Certification Renewal Verification Registered",
        description: "Routine check of CPCSEA registered animal house facility renewal.",
        statusBadge: "Pending"
      },
      {
        eventId: "EVT-0382-2",
        date: "2026-10-10 16:30",
        displayDate: "10 Oct 2026, 04:30 PM",
        stage: "Resolution",
        handlingAuthority: "Specialized Cells",
        actor: "OC-Officer-02",
        title: "Compliance Endorsed & Case Resolved",
        description: "Updated IAEC committee composition approved by national nominee. Case concluded.",
        statusBadge: "Resolved"
      }
    ],
    statusHistory: [
      {
        transitionId: "SH-0382-1",
        fromStatus: "Pending",
        toStatus: "Resolved",
        changedDate: "2026-10-10 16:30",
        changedBy: "OC-Officer-02",
        authorityOrder: "Resolution Memo SC-8215",
        notes: "Full regulatory clearance certified."
      }
    ],
    documents: [
      {
        docId: "DOC-0382-1",
        title: "CPCSEA_IAEC_Approval_Certificate_2026.pdf",
        type: "PDF",
        size: "1.1 MB",
        uploadedDate: "2026-10-09",
        uploadedBy: "College Principal",
        accessLevel: "Public Record"
      }
    ],
    relatedCaseIds: [],
    overlapAlertId: null
  },
  {
    caseId: "CASE-2026-0390",
    complaintRef: "COMP-REF-2026-8300",
    institutionId: "INST-NR-009",
    institutionName: "Jaipur College of Pharmacy & Research",
    aicteId: "1-512039",
    aisheCode: "C-81923",
    institutionType: "Pharmacy",
    location: "Jaipur, Rajasthan",
    district: "Jaipur",
    state: "Rajasthan",
    region: "North Region",
    complaintCategory: "Curriculum & Academic Alignment",
    currentBureau: "Public Grievance Redressal Cell (PGRC)",
    bureauCode: "PGRC",
    assignedOfficer: "PGRC-Officer-01",
    assignedOfficerDesignation: "Senior Scrutiny Officer",
    currentStatus: "Closed",
    priority: "Normal",
    createdDate: "2026-09-20",
    lastUpdated: "2026-10-12",
    expectedResolutionDate: "2026-10-12",
    subject: "Mandatory digital access to international pharmacy research journals successfully restored.",
    source: "Postgraduate Scholars Forum",
    jurisdictionScope: "E-Library Resource Compliance",
    movementTimeline: [
      {
        eventId: "EVT-0390-1",
        date: "2026-09-20 14:00",
        displayDate: "20 Sep 2026, 02:00 PM",
        stage: "Filing",
        handlingAuthority: "Intake",
        actor: "System",
        title: "E-Journal Access Grievance Filed",
        description: "Scholars reported subscription disruption for ScienceDirect and PubMed institutional IP access.",
        statusBadge: "Pending"
      },
      {
        eventId: "EVT-0390-2",
        date: "2026-10-12 17:00",
        displayDate: "12 Oct 2026, 05:00 PM",
        stage: "Formal Closure",
        handlingAuthority: "PGRC",
        actor: "PGRC-Officer-01",
        title: "Subscription Restored & Case Closed",
        description: "Payment receipts for IEEE/Elsevier consortium access verified by librarian. Case closed.",
        statusBadge: "Closed"
      }
    ],
    statusHistory: [
      {
        transitionId: "SH-0390-1",
        fromStatus: "Pending",
        toStatus: "Closed",
        changedDate: "2026-10-12 17:00",
        changedBy: "PGRC-Officer-01",
        authorityOrder: "Final Closure Order FC-8300",
        notes: "Full service restored."
      }
    ],
    documents: [],
    relatedCaseIds: [],
    overlapAlertId: null
  },
  {
    caseId: "CASE-2026-0410",
    complaintRef: "COMP-REF-2026-9102",
    institutionId: "INST-NR-010",
    institutionName: "Metropolitan Institute of Management",
    aicteId: "1-628491",
    aisheCode: "C-90214",
    institutionType: "Management",
    location: "Faridabad, Haryana",
    district: "Faridabad",
    state: "Haryana",
    region: "North Region",
    complaintCategory: "Affiliation & Statutory Norms",
    currentBureau: "Regulation Bureau (RB)",
    bureauCode: "RB",
    assignedOfficer: "RB-Officer-04",
    assignedOfficerDesignation: "Statutory Approval Enforcement Officer",
    currentStatus: "In Progress",
    priority: "Normal",
    createdDate: "2026-10-13",
    lastUpdated: "2026-10-24",
    expectedResolutionDate: "2026-11-08",
    subject: "Periodic review of public web portal mandatory disclosure updates as per AICTE handbook norms.",
    source: "AICTE Digital Surveillance Cell",
    jurisdictionScope: "Mandatory Public Disclosures",
    movementTimeline: [
      {
        eventId: "EVT-0410-1",
        date: "2026-10-13 15:30",
        displayDate: "13 Oct 2026, 03:30 PM",
        stage: "Filing",
        handlingAuthority: "Intake",
        actor: "System",
        title: "Mandatory Disclosure Audit Notice",
        description: "Automated crawler identified broken link for current audited financial statements and Anti-Ragging Committee composition.",
        statusBadge: "Pending"
      },
      {
        eventId: "EVT-0410-2",
        date: "2026-10-20 11:00",
        displayDate: "20 Oct 2026, 11:00 AM",
        stage: "Rectification Monitoring",
        handlingAuthority: "Regulation Bureau (RB)",
        actor: "RB-Officer-04",
        title: "Website URL Rectification in Progress",
        description: "Institute webmaster updated disclosure portal. Final verification underway.",
        statusBadge: "In Progress"
      }
    ],
    statusHistory: [
      {
        transitionId: "SH-0410-1",
        fromStatus: "Pending",
        toStatus: "In Progress",
        changedDate: "2026-10-20 11:00",
        changedBy: "RB-Officer-04",
        authorityOrder: "RB-Notice-410",
        notes: "Rectification plan accepted."
      }
    ],
    documents: [],
    relatedCaseIds: [],
    overlapAlertId: null
  },
  {
    caseId: "CASE-2026-0418",
    complaintRef: "COMP-REF-2026-9090",
    institutionId: "INST-NR-010",
    institutionName: "Metropolitan Institute of Management",
    aicteId: "1-628491",
    aisheCode: "C-90214",
    institutionType: "Management",
    location: "Faridabad, Haryana",
    district: "Faridabad",
    state: "Haryana",
    region: "North Region",
    complaintCategory: "Fee Regulation & Capitation Inquiry",
    currentBureau: "Public Grievance Redressal Cell (PGRC)",
    bureauCode: "PGRC",
    assignedOfficer: "PGRC-Officer-02",
    assignedOfficerDesignation: "Grievance Redressal Officer",
    currentStatus: "Awaiting Institution Response",
    priority: "High",
    createdDate: "2026-10-12",
    lastUpdated: "2026-10-23",
    expectedResolutionDate: "2026-11-02",
    subject: "Refund processing for student seat cancellation prior to AICTE formal cut-off date.",
    source: "Student Web Portal Grievance",
    jurisdictionScope: "Admission Cancellation Refund",
    movementTimeline: [
      {
        eventId: "EVT-0418-1",
        date: "2026-10-12 09:45",
        displayDate: "12 Oct 2026, 09:45 AM",
        stage: "Filing",
        handlingAuthority: "Intake",
        actor: "System",
        title: "Refund Grievance Lodged",
        description: "Student surrendered MBA seat on 15 Sep 2026 (prior to AICTE cut-off). Institute deducted Rs 35,000 as processing fee.",
        statusBadge: "Pending"
      },
      {
        eventId: "EVT-0418-2",
        date: "2026-10-18 14:30",
        displayDate: "18 Oct 2026, 02:30 PM",
        stage: "PGRC Notice",
        handlingAuthority: "PGRC",
        actor: "PGRC-Officer-02",
        title: "Direct Order to Refund Deducted Amount",
        description: "Order issued that deduction cannot exceed Rs 1,000 as per AICTE Admission Regulations.",
        statusBadge: "Awaiting Institution Response"
      }
    ],
    statusHistory: [
      {
        transitionId: "SH-0418-1",
        fromStatus: "Pending",
        toStatus: "Awaiting Institution Response",
        changedDate: "2026-10-18 14:30",
        changedBy: "PGRC-Officer-02",
        authorityOrder: "Refund Mandate 418/2026",
        notes: "Strict 10-day compliance timeline."
      }
    ],
    documents: [
      {
        docId: "DOC-0418-1",
        title: "Seat_Cancellation_Letter_and_Fee_Challan.pdf",
        type: "PDF",
        size: "1.3 MB",
        uploadedDate: "2026-10-12",
        uploadedBy: "Student Complainant",
        accessLevel: "Official Regulatory Record"
      }
    ],
    relatedCaseIds: [],
    overlapAlertId: null
  },
  {
    caseId: "CASE-2026-0450",
    complaintRef: "COMP-REF-2026-9210",
    institutionId: "INST-NR-003",
    institutionName: "Sunrise College of Engineering & Technology",
    aicteId: "1-774582",
    aisheCode: "C-31950",
    institutionType: "Engineering & Technology",
    location: "Lucknow, Uttar Pradesh",
    district: "Lucknow",
    state: "Uttar Pradesh",
    region: "North Region",
    complaintCategory: "Laboratory & Workshop Standards",
    currentBureau: "Regulation Bureau (RB)",
    bureauCode: "RB",
    assignedOfficer: null, // Test case for "Not Assigned"
    assignedOfficerDesignation: null,
    currentStatus: "Pending",
    priority: "Normal",
    createdDate: "2026-10-24",
    lastUpdated: "2026-10-24",
    expectedResolutionDate: null, // Test case for "Not Available"
    subject: "Verification of high-voltage laboratory insulation calibration records.",
    source: "Direct University Audit",
    jurisdictionScope: "Technical Laboratory Calibration",
    movementTimeline: [
      {
        eventId: "EVT-0450-1",
        date: "2026-10-24 16:00",
        displayDate: "24 Oct 2026, 04:00 PM",
        stage: "Filing & Intake",
        handlingAuthority: "Intake Registry",
        actor: "System",
        title: "Intake Registered — Awaiting Officer Assignment",
        description: "Case entered into system; pending review and allocation to RB Technical Scrutiny Officer.",
        statusBadge: "Pending"
      }
    ],
    statusHistory: [],
    documents: [],
    relatedCaseIds: [],
    overlapAlertId: null
  },
  {
    caseId: "CASE-2026-0465",
    complaintRef: "COMP-REF-2026-9288",
    institutionId: "INST-NR-002",
    institutionName: "Global Institute of Engineering & Research",
    aicteId: "1-672934",
    aisheCode: "C-24108",
    institutionType: "Engineering & Technology",
    location: "Ghaziabad, Uttar Pradesh",
    district: "Ghaziabad",
    state: "Uttar Pradesh",
    region: "North Region",
    complaintCategory: "Faculty Representation & Service Rules",
    currentBureau: "Public Grievance Redressal Cell (PGRC)",
    bureauCode: "PGRC",
    assignedOfficer: "PGRC-Officer-01",
    assignedOfficerDesignation: "Senior Legal Scrutiny Officer",
    currentStatus: "Awaiting Institution Response",
    priority: "Medium",
    createdDate: "2026-10-18",
    lastUpdated: "2026-10-25",
    expectedResolutionDate: "2026-11-05",
    subject: "Grievance on maternity leave and child care leave entitlement denial for assistant professor.",
    source: "State Commission for Women Forward",
    jurisdictionScope: "Maternity Benefit Act & AICTE Service Rules",
    movementTimeline: [
      {
        eventId: "EVT-0465-1",
        date: "2026-10-18 10:30",
        displayDate: "18 Oct 2026, 10:30 AM",
        stage: "Filing",
        handlingAuthority: "Intake",
        actor: "System",
        title: "Maternity Leave Grievance Registered",
        description: "Statutory representation regarding refusal of full maternity leave with salary.",
        statusBadge: "Pending"
      },
      {
        eventId: "EVT-0465-2",
        date: "2026-10-22 14:00",
        displayDate: "22 Oct 2026, 02:00 PM",
        stage: "Directive Issued",
        handlingAuthority: "PGRC",
        actor: "PGRC-Officer-01",
        title: "Direct Notice Served on Management",
        description: "Directed institution to comply with AICTE Regulations 2020 Clause 8.2 and submit confirmation within 10 days.",
        statusBadge: "Awaiting Institution Response"
      }
    ],
    statusHistory: [
      {
        transitionId: "SH-0465-1",
        fromStatus: "Pending",
        toStatus: "Awaiting Institution Response",
        changedDate: "2026-10-22 14:00",
        changedBy: "PGRC-Officer-01",
        authorityOrder: "PGRC Directive ML-9288",
        notes: "Strict notice issued."
      }
    ],
    documents: [
      {
        docId: "DOC-0465-1",
        title: "Women_Commission_Referral_Letter.pdf",
        type: "PDF",
        size: "950 KB",
        uploadedDate: "2026-10-18",
        uploadedBy: "Commission Liaison",
        accessLevel: "Official Regulatory Record"
      }
    ],
    relatedCaseIds: [],
    overlapAlertId: null
  }
];

/**
 * CASES IN OTHER REGIONS (FOR AUTHORIZATION & JURISDICTION VALIDATION)
 * If an officer assigned to "North Region" queries these, access must be denied by the security adapter.
 */
const NON_AUTHORIZED_REGIONAL_CASES = [
  {
    caseId: "CASE-2026-0501",
    institutionId: "INST-SR-001",
    institutionName: "Madras Institute of Advanced Technology",
    region: "South Region",
    complaintCategory: "Affiliation & Statutory Norms",
    currentBureau: "Regulation Bureau (RB)",
    currentStatus: "Pending",
    createdDate: "2026-10-15"
  },
  {
    caseId: "CASE-2026-0601",
    institutionId: "INST-WR-001",
    institutionName: "Maharashtra State College of Engineering",
    region: "West Region",
    complaintCategory: "Infrastructure & Safety Standards",
    currentBureau: "Regulation Bureau (RB)",
    currentStatus: "In Progress",
    createdDate: "2026-10-12"
  },
  {
    caseId: "CASE-2026-0701",
    institutionId: "INST-ER-001",
    institutionName: "Kolkata Institute of Pharmaceutical Sciences",
    region: "East Region",
    complaintCategory: "Student Grievance & Scholarship",
    currentBureau: "Public Grievance Redressal Cell (PGRC)",
    currentStatus: "Under Review",
    createdDate: "2026-10-09"
  },
  {
    caseId: "CASE-2026-0801",
    institutionId: "INST-CR-001",
    institutionName: "Bhopal Polytechnic Institute",
    region: "Central Region",
    complaintCategory: "Fee Regulation & Capitation Inquiry",
    currentBureau: "Public Grievance Redressal Cell (PGRC)",
    currentStatus: "Pending",
    createdDate: "2026-10-18"
  }
];

/**
 * ============================================================================
 * ASYNCHRONOUS DATA ACCESS & BACKEND SIMULATION LAYER
 * Enforces regional authorization, filter criteria, sorting, and pagination.
 * Ready for drop-in Spring Boot REST Controller endpoints.
 * ============================================================================
 */
const RegionalCaseTrackingAPI = {
  /**
   * Fetches the case tracking list for a given region with filters, sorting, and pagination.
   */
  async getCases(params = {}) {
    // Artificial micro-delay (100ms) to simulate real async network round-trip and exercise loading states
    await new Promise((res) => setTimeout(res, 80));

    const requestedRegion = params.region || CURRENT_USER_SESSION.authorizedRegion;

    // Strict Backend Regional Authorization Check
    if (requestedRegion !== CURRENT_USER_SESSION.authorizedRegion) {
      return {
        success: false,
        statusCode: 403,
        error: "403 Forbidden: Regional Access Denied",
        message: `Regional Officer ${CURRENT_USER_SESSION.officerName} (${CURRENT_USER_SESSION.officerId}) is authorized exclusively for ${CURRENT_USER_SESSION.authorizedRegion}. Cross-region access to '${requestedRegion}' is restricted to National Bureau Heads.`,
        data: null
      };
    }

    let records = [...REGIONAL_CASES_MASTER_DATA];

    // 1. Text Search Filter (Case ID, Institution Name, Complaint Ref, AISHE, Subject)
    if (params.query && params.query.trim()) {
      const q = params.query.trim().toLowerCase();
      records = records.filter((c) => {
        const matchesCaseId = c.caseId.toLowerCase().includes(q);
        const matchesInstName = c.institutionName.toLowerCase().includes(q);
        const matchesInstId = c.institutionId.toLowerCase().includes(q);
        const matchesRef = (c.complaintRef || "").toLowerCase().includes(q);
        const matchesSubject = (c.subject || "").toLowerCase().includes(q);
        const matchesCategory = (c.complaintCategory || "").toLowerCase().includes(q);
        return matchesCaseId || matchesInstName || matchesInstId || matchesRef || matchesSubject || matchesCategory;
      });
    }

    // 2. Bureau / Cell Filter
    if (params.bureau && params.bureau !== "All") {
      records = records.filter((c) => {
        if (params.bureau === "RB") return c.bureauCode === "RB";
        if (params.bureau === "PGRC") return c.bureauCode === "PGRC";
        if (params.bureau === "Specialized Cells") return c.bureauCode === "Specialized Cells";
        return c.currentBureau.toLowerCase().includes(params.bureau.toLowerCase());
      });
    }

    // 3. Status Filter (Pending, In Progress, Under Review, Awaiting Institution Response, Transferred, Resolved, Closed)
    if (params.status && params.status !== "All") {
      records = records.filter((c) => c.currentStatus.toLowerCase() === params.status.toLowerCase());
    }

    // 4. Category Filter
    if (params.category && params.category !== "All") {
      records = records.filter((c) => c.complaintCategory.toLowerCase() === params.category.toLowerCase());
    }

    // 5. Creation Date Range Filter
    if (params.dateFrom) {
      records = records.filter((c) => c.createdDate >= params.dateFrom);
    }
    if (params.dateTo) {
      records = records.filter((c) => c.createdDate <= params.dateTo);
    }

    // 6. Sorting (by createdDate or lastUpdated)
    const sortBy = params.sortBy || "created_desc";
    records.sort((a, b) => {
      if (sortBy === "created_desc") return b.createdDate.localeCompare(a.createdDate);
      if (sortBy === "created_asc") return a.createdDate.localeCompare(b.createdDate);
      if (sortBy === "updated_desc") return b.lastUpdated.localeCompare(a.lastUpdated);
      if (sortBy === "updated_asc") return a.lastUpdated.localeCompare(b.lastUpdated);
      return 0;
    });

    const totalCount = records.length;
    const pageSize = parseInt(params.pageSize, 10) || 10;
    const page = parseInt(params.page, 10) || 1;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const validPage = Math.min(Math.max(1, page), totalPages);

    const startIndex = (validPage - 1) * pageSize;
    const pagedRecords = records.slice(startIndex, startIndex + pageSize);

    return {
      success: true,
      statusCode: 200,
      data: {
        cases: pagedRecords,
        totalCount,
        page: validPage,
        pageSize,
        totalPages,
        activeFilters: { ...params }
      }
    };
  },

  /**
   * Fetches single case details by Case ID with security authorization check.
   */
  async getCaseById(caseId, region = CURRENT_USER_SESSION.authorizedRegion) {
    await new Promise((res) => setTimeout(res, 60));

    const normalizeId = (id) => (id || "").toUpperCase().replace(/CASE-\d{4}-0*/, "");
    const requestedNorm = normalizeId(caseId);

    // Check if the requested case belongs to an unauthorized region
    const nonAuthCase = NON_AUTHORIZED_REGIONAL_CASES.find(
      (c) => c.caseId === caseId || normalizeId(c.caseId) === requestedNorm
    );
    if (nonAuthCase) {
      return {
        success: false,
        statusCode: 403,
        error: "403 Forbidden: Cross-Region Record Restricted",
        message: `Case ${caseId} is registered under '${nonAuthCase.region}'. You are authorized only for ${CURRENT_USER_SESSION.authorizedRegion}.`,
        data: null
      };
    }

    const caseItem = REGIONAL_CASES_MASTER_DATA.find(
      (c) => c.caseId === caseId || normalizeId(c.caseId) === requestedNorm
    );
    if (!caseItem) {
      return {
        success: false,
        statusCode: 404,
        error: "404 Not Found",
        message: `Case record '${caseId}' was not found in the regional registry.`,
        data: null
      };
    }

    // Verify region
    if (caseItem.region !== CURRENT_USER_SESSION.authorizedRegion) {
      return {
        success: false,
        statusCode: 403,
        error: "403 Forbidden: Regional Boundary Protection",
        message: `Case ${caseId} belongs to ${caseItem.region}. Your jurisdiction is ${CURRENT_USER_SESSION.authorizedRegion}.`,
        data: null
      };
    }

    return {
      success: true,
      statusCode: 200,
      data: caseItem
    };
  },

  /**
   * Submits an authorized Regional Officer Follow-up Request.
   * Logs entry to movement timeline and audit trail without permitting unauthorized closure.
   */
  async submitFollowUpRequest(caseId, requestData = {}) {
    await new Promise((res) => setTimeout(res, 150));

    const normalizeId = (id) => (id || "").toUpperCase().replace(/CASE-\d{4}-0*/, "");
    const requestedNorm = normalizeId(caseId);
    const caseItem = REGIONAL_CASES_MASTER_DATA.find(
      (c) => c.caseId === caseId || normalizeId(c.caseId) === requestedNorm
    );
    if (!caseItem) {
      return { success: false, statusCode: 404, message: "Case not found" };
    }

    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const formattedDate = `${dateStr} ${timeStr}`;

    const newEvent = {
      eventId: `EVT-${caseId.replace("CASE-", "")}-${caseItem.movementTimeline.length + 1}`,
      date: formattedDate,
      displayDate: `${now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}, ${timeStr}`,
      stage: "Regional Officer Follow-up",
      handlingAuthority: `${CURRENT_USER_SESSION.authorizedRegion} Office`,
      actor: `${CURRENT_USER_SESSION.officerName} (${CURRENT_USER_SESSION.designation})`,
      title: requestData.subject || "Official Status Inquiry & Follow-up Request",
      description: requestData.remarks || "Regional Officer submitted formal priority follow-up request to the handling Bureau.",
      statusBadge: caseItem.currentStatus
    };

    // Prepend or append to timeline (chronological order)
    caseItem.movementTimeline.push(newEvent);
    caseItem.lastUpdated = dateStr;

    return {
      success: true,
      statusCode: 200,
      message: "Official follow-up inquiry successfully logged and transmitted to handling Bureau.",
      data: {
        updatedTimeline: caseItem.movementTimeline,
        lastUpdated: caseItem.lastUpdated
      }
    };
  }
};

// Export to window
window.CURRENT_USER_SESSION = CURRENT_USER_SESSION;
window.REGIONAL_CASES_MASTER_DATA = REGIONAL_CASES_MASTER_DATA;
window.RegionalCaseTrackingAPI = RegionalCaseTrackingAPI;
