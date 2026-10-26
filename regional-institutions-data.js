/**
 * ============================================================================
 * EDUVISION — REGIONAL INSTITUTIONS STATIC MOCK DATASET
 * AICTE Integrated Institution Complaint Monitoring and Status Dashboard
 * ============================================================================
 * NOTE: This mock dataset is for frontend demonstration and visual workflow
 * validation only. It will be replaced by backend API integration
 * (e.g., Spring Boot REST controllers and MySQL persistence) in a future phase.
 * All institution records, case numbers, and overlap notices are illustrative.
 * ============================================================================
 */

const REGIONAL_INSTITUTIONS_DATA = [
  {
    institutionId: "INST-NR-001",
    aicteId: "1-563728",
    aisheCode: "C-18492",
    name: "ABC Institute of Technology",
    type: "Engineering & Technology",
    location: "Noida, Uttar Pradesh",
    district: "Noida",
    state: "Uttar Pradesh",
    region: "North Region",
    affiliatedUniversity: "Dr. A.P.J. Abdul Kalam Technical University (AKTU)",
    establishedYear: 2004,
    associatedCases: [
      {
        caseId: "CASE-2026-001",
        category: "Affiliation & Statutory Norms",
        bureauCell: "Regulation Bureau (RB)",
        bureauCode: "RB",
        status: "Pending",
        statusClass: "pending",
        dueDate: "28 Oct 2026",
        assignedOfficerLabel: "RB-Officer-03",
        filingDate: "04 Oct 2026",
        subject: "Verification of mandatory faculty cadre ratio and laboratory infrastructure compliance."
      },
      {
        caseId: "CASE-2026-014",
        category: "Faculty Representation & Service Rules",
        bureauCell: "Public Grievance Redressal Cell (PGRC)",
        bureauCode: "PGRC",
        status: "In Progress",
        statusClass: "in-progress",
        dueDate: "05 Nov 2026",
        assignedOfficerLabel: "PGRC-Officer-02",
        filingDate: "10 Oct 2026",
        subject: "Faculty grievance regarding non-implementation of revised pay scales and promotion criteria."
      },
      {
        caseId: "CASE-2026-009",
        category: "Safety & Lab Standards",
        bureauCell: "Regulation Bureau (RB)",
        bureauCode: "RB",
        status: "Resolved",
        statusClass: "resolved",
        dueDate: "15 Oct 2026",
        assignedOfficerLabel: "RB-Officer-01",
        filingDate: "20 Sep 2026",
        subject: "Chemical fume hood and fire safety certification inspection satisfactorily cleared."
      },
      {
        caseId: "CASE-2026-042",
        category: "Fee Regulation & Capitation Inquiry",
        bureauCell: "Public Grievance Redressal Cell (PGRC)",
        bureauCode: "PGRC",
        status: "Overdue",
        statusClass: "overdue",
        dueDate: "20 Oct 2026",
        assignedOfficerLabel: "PGRC-Officer-01",
        filingDate: "15 Sep 2026",
        subject: "Delay in refund of excess security deposit and examination charges for withdrawn students."
      }
    ],
    overlapAlert: {
      alertId: "OVL-2026-001",
      relatedCaseIds: ["CASE-2026-001", "CASE-2026-014"],
      bureaus: ["Regulation Bureau (RB)", "Public Grievance Redressal Cell (PGRC)"],
      category: "Cross-Bureau Overlap",
      matchReason: "Cross-Bureau overlap: Faculty representation grievance under PGRC cites statutory teacher-cadre deficiency flagged in active RB affiliation inquiry.",
      reviewStatus: "In Review",
      flaggedDate: "22 Oct 2026"
    }
  },
  {
    institutionId: "INST-NR-002",
    aicteId: "1-672934",
    aisheCode: "C-24108",
    name: "Global Institute of Engineering & Research",
    type: "Engineering & Technology",
    location: "Ghaziabad, Uttar Pradesh",
    district: "Ghaziabad",
    state: "Uttar Pradesh",
    region: "North Region",
    affiliatedUniversity: "Dr. A.P.J. Abdul Kalam Technical University (AKTU)",
    establishedYear: 2008,
    associatedCases: [
      {
        caseId: "CASE-2026-0178",
        category: "Student Grievance & Scholarship",
        bureauCell: "Public Grievance Redressal Cell (PGRC)",
        bureauCode: "PGRC",
        status: "In Progress",
        statusClass: "in-progress",
        dueDate: "02 Nov 2026",
        assignedOfficerLabel: "PGRC-Officer-02",
        filingDate: "08 Oct 2026",
        subject: "Grievance received regarding examination fee structure and student scholarship disbursement."
      },
      {
        caseId: "CASE-2026-0195",
        category: "Campus & Hostel Norms",
        bureauCell: "Regulation Bureau (RB)",
        bureauCode: "RB",
        status: "Resolved",
        statusClass: "resolved",
        dueDate: "12 Oct 2026",
        assignedOfficerLabel: "RB-Officer-02",
        filingDate: "18 Sep 2026",
        subject: "Hostel hygiene norms and dining hall clean water certification validated by regional inspectors."
      },
      {
        caseId: "CASE-2026-0204",
        category: "Examination Schedule",
        bureauCell: "Public Grievance Redressal Cell (PGRC)",
        bureauCode: "PGRC",
        status: "Pending",
        statusClass: "pending",
        dueDate: "01 Nov 2026",
        assignedOfficerLabel: "PGRC-Officer-03",
        filingDate: "14 Oct 2026",
        subject: "Request for scheduling re-examination for students attending national technical competitions."
      }
    ],
    overlapAlert: null
  },
  {
    institutionId: "INST-NR-003",
    aicteId: "1-774582",
    aisheCode: "C-31950",
    name: "Sunrise College of Engineering & Technology",
    type: "Engineering & Technology",
    location: "Lucknow, Uttar Pradesh",
    district: "Lucknow",
    state: "Uttar Pradesh",
    region: "North Region",
    affiliatedUniversity: "Lucknow University",
    establishedYear: 2011,
    associatedCases: [
      {
        caseId: "CASE-2026-0210",
        category: "Curriculum & Academic Alignment",
        bureauCell: "Regulation Bureau (RB)",
        bureauCode: "RB",
        status: "Resolved",
        statusClass: "resolved",
        dueDate: "18 Oct 2026",
        assignedOfficerLabel: "RB-Officer-01",
        filingDate: "25 Sep 2026",
        subject: "Academic syllabus alignment and accreditation document submission completed satisfactorily."
      },
      {
        caseId: "CASE-2026-0215",
        category: "Transcript Clearance",
        bureauCell: "Public Grievance Redressal Cell (PGRC)",
        bureauCode: "PGRC",
        status: "Resolved",
        statusClass: "resolved",
        dueDate: "19 Oct 2026",
        assignedOfficerLabel: "PGRC-Officer-01",
        filingDate: "28 Sep 2026",
        subject: "Clearance of pending degree certificates and migration documents for 2025 pass-out batch."
      }
    ],
    overlapAlert: null
  },
  {
    institutionId: "INST-NR-004",
    aicteId: "1-886421",
    aisheCode: "C-40291",
    name: "Techno Institute of Management Studies",
    type: "Management",
    location: "South Delhi, Delhi",
    district: "Delhi",
    state: "Delhi",
    region: "North Region",
    affiliatedUniversity: "Guru Gobind Singh Indraprastha University (GGSIPU)",
    establishedYear: 2006,
    associatedCases: [
      {
        caseId: "CASE-2026-0247",
        category: "Infrastructure & Lab Compliance",
        bureauCell: "Public Grievance Redressal Cell (PGRC)",
        bureauCode: "PGRC",
        status: "Overdue",
        statusClass: "overdue",
        dueDate: "20 Oct 2026",
        assignedOfficerLabel: "PGRC-Officer-03",
        filingDate: "12 Sep 2026",
        subject: "Inspection report on laboratory equipment safety standards overdue by 6 days. Escalation flagged."
      },
      {
        caseId: "CASE-2026-0255",
        category: "Sanctioned Intake Compliance",
        bureauCell: "Regulation Bureau (RB)",
        bureauCode: "RB",
        status: "Pending",
        statusClass: "pending",
        dueDate: "29 Oct 2026",
        assignedOfficerLabel: "RB-Officer-04",
        filingDate: "05 Oct 2026",
        subject: "Statutory audit into reports of student admissions exceeding AICTE approved intake by 15 seats."
      },
      {
        caseId: "CASE-2026-0260",
        category: "Placement Cell Transparency",
        bureauCell: "Public Grievance Redressal Cell (PGRC)",
        bureauCode: "PGRC",
        status: "In Progress",
        statusClass: "in-progress",
        dueDate: "07 Nov 2026",
        assignedOfficerLabel: "PGRC-Officer-02",
        filingDate: "11 Oct 2026",
        subject: "Inquiry into advertised campus placement compensation statistics versus verified offer letters."
      }
    ],
    overlapAlert: {
      alertId: "OVL-2026-004",
      relatedCaseIds: ["CASE-2026-0247", "CASE-2026-0255"],
      bureaus: ["Public Grievance Redressal Cell (PGRC)", "Regulation Bureau (RB)"],
      category: "Multiple Subject Overlap",
      matchReason: "Multiple complaints regarding physical infrastructure capacity concurrent with statutory inquiry into exceeding sanctioned student intake.",
      reviewStatus: "Pending Assignment",
      flaggedDate: "21 Oct 2026"
    }
  },
  {
    institutionId: "INST-NR-005",
    aicteId: "1-992145",
    aisheCode: "C-51042",
    name: "National College of Pharmacy",
    type: "Pharmacy",
    location: "Kanpur, Uttar Pradesh",
    district: "Kanpur",
    state: "Uttar Pradesh",
    region: "North Region",
    affiliatedUniversity: "Chhatrapati Shahu Ji Maharaj University",
    establishedYear: 2014,
    associatedCases: [
      {
        caseId: "CASE-2026-0281",
        category: "Statutory Council Jurisdiction",
        bureauCell: "Specialized Cells",
        bureauCode: "Specialized Cells",
        status: "Pending",
        statusClass: "pending",
        dueDate: "30 Oct 2026",
        assignedOfficerLabel: "OC-Officer-01",
        filingDate: "02 Oct 2026",
        subject: "Case transferred to Specialized Pharmacy Cell for cross-statutory jurisdiction and PCI alignment."
      },
      {
        caseId: "CASE-2026-0288",
        category: "Chemical Disposal Safety",
        bureauCell: "Regulation Bureau (RB)",
        bureauCode: "RB",
        status: "In Progress",
        statusClass: "in-progress",
        dueDate: "04 Nov 2026",
        assignedOfficerLabel: "RB-Officer-02",
        filingDate: "09 Oct 2026",
        subject: "Validation of safe chemical waste containment protocols and effluent treatment plant records."
      }
    ],
    overlapAlert: null
  },
  {
    institutionId: "INST-NR-006",
    aicteId: "1-451298",
    aisheCode: "C-12948",
    name: "Apex School of Planning & Architecture",
    type: "Architecture",
    location: "Gurugram, Haryana",
    district: "Gurugram",
    state: "Haryana",
    region: "North Region",
    affiliatedUniversity: "Maharshi Dayanand University (MDU)",
    establishedYear: 2012,
    associatedCases: [
      {
        caseId: "CASE-2026-0312",
        category: "Studio & CAD Lab Facilities",
        bureauCell: "Regulation Bureau (RB)",
        bureauCode: "RB",
        status: "Pending",
        statusClass: "pending",
        dueDate: "27 Oct 2026",
        assignedOfficerLabel: "RB-Officer-02",
        filingDate: "03 Oct 2026",
        subject: "Compliance report requested on minimum architectural studio floor space and licensed CAD workstations."
      },
      {
        caseId: "CASE-2026-0320",
        category: "Tuition Fee Structure",
        bureauCell: "Public Grievance Redressal Cell (PGRC)",
        bureauCode: "PGRC",
        status: "Overdue",
        statusClass: "overdue",
        dueDate: "18 Oct 2026",
        assignedOfficerLabel: "PGRC-Officer-04",
        filingDate: "10 Sep 2026",
        subject: "Student grievance against unapproved mid-session enhancement of studio equipment development fees."
      }
    ],
    overlapAlert: null
  },
  {
    institutionId: "INST-NR-007",
    aicteId: "1-382910",
    aisheCode: "C-62810",
    name: "Chandigarh Polytechnic Institute",
    type: "Polytechnic",
    location: "Sector 26, Chandigarh",
    district: "Chandigarh",
    state: "Chandigarh (UT)",
    region: "North Region",
    affiliatedUniversity: "Punjab State Board of Technical Education",
    establishedYear: 1998,
    associatedCases: [
      {
        caseId: "CASE-2026-0331",
        category: "Workshop Safety Standards",
        bureauCell: "Regulation Bureau (RB)",
        bureauCode: "RB",
        status: "In Progress",
        statusClass: "in-progress",
        dueDate: "06 Nov 2026",
        assignedOfficerLabel: "RB-Officer-01",
        filingDate: "07 Oct 2026",
        subject: "Preventive maintenance audit for heavy mechanical lathe machines and electrical safety breakers."
      },
      {
        caseId: "CASE-2026-0339",
        category: "Student Travel Concessions",
        bureauCell: "Public Grievance Redressal Cell (PGRC)",
        bureauCode: "PGRC",
        status: "Resolved",
        statusClass: "resolved",
        dueDate: "14 Oct 2026",
        assignedOfficerLabel: "PGRC-Officer-02",
        filingDate: "22 Sep 2026",
        subject: "Resolution achieved for student bus pass identity documentation verification delays."
      }
    ],
    overlapAlert: null
  },
  {
    institutionId: "INST-NR-008",
    aicteId: "1-294019",
    aisheCode: "C-73194",
    name: "Himalayan Institute of Technology",
    type: "Engineering & Technology",
    location: "Dehradun, Uttarakhand",
    district: "Dehradun",
    state: "Uttarakhand",
    region: "North Region",
    affiliatedUniversity: "Uttarakhand Technical University (UTU)",
    establishedYear: 2007,
    associatedCases: [
      {
        caseId: "CASE-2026-0350",
        category: "Faculty Service Conditions",
        bureauCell: "Public Grievance Redressal Cell (PGRC)",
        bureauCode: "PGRC",
        status: "Pending",
        statusClass: "pending",
        dueDate: "31 Oct 2026",
        assignedOfficerLabel: "PGRC-Officer-03",
        filingDate: "06 Oct 2026",
        subject: "Faculty welfare petition concerning timely disbursement of basic allowances and leave encashment."
      },
      {
        caseId: "CASE-2026-0358",
        category: "Statutory Teacher Cadre Retention",
        bureauCell: "Regulation Bureau (RB)",
        bureauCode: "RB",
        status: "Pending",
        statusClass: "pending",
        dueDate: "03 Nov 2026",
        assignedOfficerLabel: "RB-Officer-03",
        filingDate: "11 Oct 2026",
        subject: "Verification of institution response on retention of faculty service books and experience certificates."
      },
      {
        caseId: "CASE-2026-0361",
        category: "Retirement Benefit Disbursement",
        bureauCell: "Public Grievance Redressal Cell (PGRC)",
        bureauCode: "PGRC",
        status: "Overdue",
        statusClass: "overdue",
        dueDate: "16 Oct 2026",
        assignedOfficerLabel: "PGRC-Officer-01",
        filingDate: "05 Sep 2026",
        subject: "Unresolved grievance concerning delayed terminal gratuity settlement for retired senior professor."
      }
    ],
    overlapAlert: {
      alertId: "OVL-2026-008",
      relatedCaseIds: ["CASE-2026-0350", "CASE-2026-0358"],
      bureaus: ["Public Grievance Redressal Cell (PGRC)", "Regulation Bureau (RB)"],
      category: "Common Subject Pattern",
      matchReason: "Common subject pattern: Faculty welfare representation in PGRC directly overlaps with institutional compliance inquiry regarding service conditions under RB.",
      reviewStatus: "Under Investigation",
      flaggedDate: "23 Oct 2026"
    }
  },
  {
    institutionId: "INST-NR-009",
    aicteId: "1-512039",
    aisheCode: "C-81923",
    name: "Jaipur College of Pharmacy & Research",
    type: "Pharmacy",
    location: "Jaipur, Rajasthan",
    district: "Jaipur",
    state: "Rajasthan",
    region: "North Region",
    affiliatedUniversity: "Rajasthan University of Health Sciences (RUHS)",
    establishedYear: 2015,
    associatedCases: [
      {
        caseId: "CASE-2026-0382",
        category: "CPCSEA Animal House Ethics",
        bureauCell: "Specialized Cells",
        bureauCode: "Specialized Cells",
        status: "Resolved",
        statusClass: "resolved",
        dueDate: "10 Oct 2026",
        assignedOfficerLabel: "OC-Officer-02",
        filingDate: "16 Sep 2026",
        subject: "Institutional Animal Ethics Committee (IAEC) renewal compliance and room ventilation clearance."
      },
      {
        caseId: "CASE-2026-0390",
        category: "Library & E-Journal Access",
        bureauCell: "Public Grievance Redressal Cell (PGRC)",
        bureauCode: "PGRC",
        status: "Resolved",
        statusClass: "resolved",
        dueDate: "12 Oct 2026",
        assignedOfficerLabel: "PGRC-Officer-01",
        filingDate: "20 Sep 2026",
        subject: "Mandatory digital access to international pharmacy research journals successfully restored."
      }
    ],
    overlapAlert: null
  },
  {
    institutionId: "INST-NR-010",
    aicteId: "1-628491",
    aisheCode: "C-90214",
    name: "Metropolitan Institute of Management",
    type: "Management",
    location: "Faridabad, Haryana",
    district: "Faridabad",
    state: "Haryana",
    region: "North Region",
    affiliatedUniversity: "J.C. Bose University of Science and Technology, YMCA",
    establishedYear: 2010,
    associatedCases: [
      {
        caseId: "CASE-2026-0410",
        category: "Mandatory Disclosure Norms",
        bureauCell: "Regulation Bureau (RB)",
        bureauCode: "RB",
        status: "In Progress",
        statusClass: "in-progress",
        dueDate: "08 Nov 2026",
        assignedOfficerLabel: "RB-Officer-04",
        filingDate: "13 Oct 2026",
        subject: "Periodic review of public web portal mandatory disclosure updates as per AICTE handbook norms."
      },
      {
        caseId: "CASE-2026-0418",
        category: "Admission Cancellation Refund",
        bureauCell: "Public Grievance Redressal Cell (PGRC)",
        bureauCode: "PGRC",
        status: "Pending",
        statusClass: "pending",
        dueDate: "02 Nov 2026",
        assignedOfficerLabel: "PGRC-Officer-02",
        filingDate: "12 Oct 2026",
        subject: "Refund processing for student seat cancellation prior to AICTE formal cut-off date."
      }
    ],
    overlapAlert: null
  }
];

// Helper calculations to compute unique institution counts dynamically
function calculateRegionalSummary(data = REGIONAL_INSTITUTIONS_DATA) {
  const totalInstitutions = data.length;

  // Unique institutions with at least one pending case
  const pendingInstitutions = data.filter((inst) =>
    inst.associatedCases.some((c) => c.status === "Pending")
  ).length;

  // Unique institutions with at least one overdue case (due date passed and not resolved)
  const overdueInstitutions = data.filter((inst) =>
    inst.associatedCases.some((c) => c.status === "Overdue")
  ).length;

  // Unique institutions associated with at least one potential overlap alert
  const overlapInstitutions = data.filter((inst) => inst.overlapAlert !== null).length;

  return {
    totalInstitutions,
    pendingInstitutions,
    overdueInstitutions,
    overlapInstitutions
  };
}
