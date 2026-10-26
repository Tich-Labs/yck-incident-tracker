// Demo dataset — shown only when there is no authenticated Supabase session,
// so an anonymous reviewer sees a populated product instead of empty tables.
// Real signed-in users (volunteers / counselors / program leads / directors)
// continue to read and write live data, unaffected by this module.
//
// All entries are anonymized by design: age group + gender only, no names, no PII.

const hoursAgo = (h) => new Date(Date.now() - h * 3600_000).toISOString();
const daysAgo = (d) => new Date(Date.now() - d * 86400_000).toISOString();

export const DEMO_USERS = [
  { id: "demo-user", email: "admin@yck.ke", role: "executive_director", name: "Executive Director", isActive: true },
  { id: "demo-counselor", email: "counselor@yck.ke", role: "counselor", name: "Jane Counselor", isActive: true },
  { id: "demo-volunteer", email: "volunteer@yck.ke", role: "volunteer", name: "John Volunteer", isActive: true },
];

export const DEMO_INCIDENTS = [
  {
    id: "demo-inc-01", incidentType: "sexual_abuse", incidentDate: new Date().toISOString().slice(0, 10),
    incidentTime: "08:40", location: "Kakamega Town", status: "new", isEscalated: false,
    reporterType: "self", survivorAgeGroup: "18_22", survivorGender: "female",
    description: "Survivor reported sexual violence and requested support. Referral for medical care and counselling initiated.",
    createdAt: hoursAgo(3), updatedAt: hoursAgo(3),
  },
  {
    id: "demo-inc-02", incidentType: "physical_abuse", incidentDate: new Date().toISOString().slice(0, 10),
    incidentTime: "07:15", location: "Mumias Town", status: "assigned", isEscalated: false,
    reporterType: "on_behalf", survivorAgeGroup: "15_18", survivorGender: "female",
    description: "Report of physical abuse by a family member. Survivor referred for medical assessment.",
    assignedTo: "demo-counselor", createdAt: hoursAgo(26), updatedAt: hoursAgo(20),
  },
  {
    id: "demo-inc-03", incidentType: "domestic_violence", incidentDate: new Date().toISOString().slice(0, 10),
    incidentTime: "21:05", location: "Vihiga Town", status: "escalated", isEscalated: true,
    escalatedAt: hoursAgo(10), reporterType: "volunteer", survivorAgeGroup: "28_35", survivorGender: "female",
    description: "Case of domestic violence escalated for legal support and safety planning.",
    createdAt: daysAgo(2), updatedAt: hoursAgo(10),
  },
  {
    id: "demo-inc-04", incidentType: "emotional_abuse", incidentDate: new Date().toISOString().slice(0, 10),
    incidentTime: "13:30", location: "Butere", status: "pfa_in_progress", isEscalated: false,
    reporterType: "self", survivorAgeGroup: "18_22", survivorGender: "female",
    description: "Ongoing emotional abuse reported; psychosocial first aid in progress.",
    createdAt: daysAgo(1), updatedAt: daysAgo(1),
  },
  {
    id: "demo-inc-05", incidentType: "sexual_abuse", incidentDate: new Date().toISOString().slice(0, 10),
    incidentTime: "11:00", location: "Vihiga", status: "under_review", isEscalated: false,
    reporterType: "on_behalf", survivorAgeGroup: "10_14", survivorGender: "female",
    description: "Reported sexual abuse requiring review and referral coordination.",
    createdAt: daysAgo(3), updatedAt: daysAgo(2),
  },
  {
    id: "demo-inc-06", incidentType: "child_exploitation", incidentDate: new Date().toISOString().slice(0, 10),
    incidentTime: "16:20", location: "Kakamega", status: "escalated", isEscalated: true,
    escalatedAt: daysAgo(3), reporterType: "volunteer", survivorAgeGroup: "10_14", survivorGender: "male",
    description: "Child exploitation case escalated to child protection services.",
    createdAt: daysAgo(4), updatedAt: daysAgo(3),
  },
  {
    id: "demo-inc-07", incidentType: "tech_enabled_abuse", incidentDate: new Date().toISOString().slice(0, 10),
    incidentTime: "19:45", location: "Vihiga", status: "new", isEscalated: false,
    reporterType: "self", survivorAgeGroup: "18_22", survivorGender: "female",
    description: "Tech-enabled abuse reported; survivor advised on digital safety.",
    createdAt: hoursAgo(8), updatedAt: hoursAgo(8),
  },
  {
    id: "demo-inc-08", incidentType: "physical_abuse", incidentDate: new Date().toISOString().slice(0, 10),
    incidentTime: "09:10", location: "Kakamega", status: "resolved", isEscalated: false,
    resolvedAt: daysAgo(5), reporterType: "on_behalf", survivorAgeGroup: "28_35", survivorGender: "female",
    description: "Physical abuse case resolved following referral and follow-up.",
    createdAt: daysAgo(9), updatedAt: daysAgo(5),
  },
  {
    id: "demo-inc-09", incidentType: "neglect", incidentDate: new Date().toISOString().slice(0, 10),
    incidentTime: "10:25", location: "Vihiga", status: "closed", isEscalated: false,
    resolvedAt: daysAgo(10), reporterType: "volunteer", survivorAgeGroup: "under_10", survivorGender: "male",
    description: "Neglect case closed after welfare follow-up.",
    createdAt: daysAgo(14), updatedAt: daysAgo(10),
  },
  {
    id: "demo-inc-10", incidentType: "bullying_harassment", incidentDate: new Date().toISOString().slice(0, 10),
    incidentTime: "14:50", location: "Kakamega", status: "new", isEscalated: false,
    reporterType: "self", survivorAgeGroup: "15_18", survivorGender: "female",
    description: "Bullying reported by a student; support and referral provided.",
    createdAt: hoursAgo(20), updatedAt: hoursAgo(20),
  },
  {
    id: "demo-inc-11", incidentType: "sexual_abuse", incidentDate: new Date().toISOString().slice(0, 10),
    incidentTime: "12:05", location: "Vihiga", status: "resolved", isEscalated: false,
    resolvedAt: daysAgo(8), reporterType: "on_behalf", survivorAgeGroup: "18_22", survivorGender: "female",
    description: "Sexual abuse case resolved; survivor linked to counselling.",
    createdAt: daysAgo(12), updatedAt: daysAgo(8),
  },
  {
    id: "demo-inc-12", incidentType: "domestic_violence", incidentDate: new Date().toISOString().slice(0, 10),
    incidentTime: "18:35", location: "Kakamega", status: "under_review", isEscalated: false,
    reporterType: "self", survivorAgeGroup: "28_35", survivorGender: "female",
    description: "Domestic violence case under review for referral to legal services.",
    createdAt: daysAgo(6), updatedAt: daysAgo(1),
  },
];

// Keep demo incident dates consistent with their creation times so the
// report date-range filters behave like real data.
for (const incident of DEMO_INCIDENTS as any[]) {
  incident.incidentDate = String(incident.createdAt).slice(0, 10);
}

export const DEMO_SERVICES = [
  { id: "demo-svc-01", name: "Kakamega County Referral Hospital", category: "health", county: "kakamega", description: "Clinical management, treatment of injuries, HIV PEP, and medical evidence collection", phone: "0700 000 001", address: "Kakamega Town", isActive: true },
  { id: "demo-svc-02", name: "Vihiga County Referral Hospital", category: "health", county: "vihiga", description: "Clinical management, treatment of injuries, HIV PEP, and medical evidence collection", phone: "0700 000 009", address: "Vihiga Town", isActive: true },
  { id: "demo-svc-03", name: "Kakamega Central Police Station", category: "police", county: "kakamega", description: "Record case, fill P3 form, conduct investigations", phone: "0700 000 014", address: "Kakamega Town", isActive: true },
  { id: "demo-svc-04", name: "Vihiga Police Station", category: "police", county: "vihiga", description: "Record case, fill P3 form, conduct investigations", phone: "0700 000 019", address: "Vihiga Town", isActive: true },
  { id: "demo-svc-05", name: "Kakamega GBV Rescue Centre", category: "shelter", county: "kakamega", description: "Emergency shelter, safety planning, basic needs", phone: "0700 000 022", address: "Kakamega Town", isActive: true },
  { id: "demo-svc-06", name: "Vihiga GBV Rescue Centre", category: "shelter", county: "vihiga", description: "Emergency shelter, safety planning, basic needs", phone: "0700 000 024", address: "Vihiga Town", isActive: true },
  { id: "demo-svc-07", name: "Kakamega County Referral Hospital — Counselling", category: "psychosocial", county: "kakamega", description: "Professional counselling and psychosocial support", phone: "0700 000 025", address: "Kakamega Town", isActive: true },
  { id: "demo-svc-08", name: "FIDA Kenya", category: "legal", county: "kakamega", description: "Legal aid, representation, and advocacy for women", phone: "0707 554 806", address: "Nairobi (serves Kakamega)", isActive: true },
];

const DEMO_STAFF = ["Jane Counselor", "John Volunteer", "Executive Director"];

export const DEMO_AUDIT_ENTRIES = (DEMO_INCIDENTS as any[])
  .flatMap((incident, index) => {
    const entries = [
      {
        id: `demo-audit-${index}-created`,
        incidentId: incident.id,
        action: "created",
        performedByName: incident.reporterType === "volunteer" ? "John Volunteer" : "Anonymous reporter",
        previousValue: null,
        newValue: null,
        timestamp: incident.createdAt,
      },
    ];
    if (incident.status !== "new") {
      entries.push({
        id: `demo-audit-${index}-status`,
        incidentId: incident.id,
        action: "status_changed",
        performedByName: DEMO_STAFF[index % DEMO_STAFF.length],
        previousValue: "new",
        newValue: incident.status,
        timestamp: incident.updatedAt,
      });
    }
    if (incident.isEscalated) {
      entries.push({
        id: `demo-audit-${index}-escalated`,
        incidentId: incident.id,
        action: "escalated",
        performedByName: "Executive Director",
        previousValue: null,
        newValue: null,
        timestamp: incident.escalatedAt ?? incident.updatedAt,
      });
    }
    return entries;
  })
  .sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)));
