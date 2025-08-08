"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Download, FileDown } from "lucide-react";
import jsPDF from "jspdf";

// ================= Types =================
type SectionProps = { title: React.ReactNode; children: React.ReactNode };
type YesNoProps = {
  label: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
};
type PillProps = { active: boolean; onClick: () => void; children: React.ReactNode };

type FormState = {
  emsAgency: string;
  crewNumber: string;
  wantFollowUp: boolean;
  crewNamesPhones: string;
  followUpEmail: string;
  runNumber: string;
  witnessedArrest: boolean | null;
  timeOfArrest: string;
  bystanderCPR: boolean | null;
  bysCPRStart: string;
  firstResponderCPR: boolean | null;
  firstResponderOnScene: string;
  downTimePriorToCPR: string;
  aedShocksPrior: boolean | null;
  aedShocksNumber: string;
  dispatched: string;
  enroute: string;
  onScene: string;
  leaveScene: string;
  arriveHospital: string;
  lucasOn: boolean | null;
  emsCPRStartTime: string;
  airway: string;
  intubationIssues: string;
  utilized302: boolean | null;
  resQpod: boolean | null;
  lastETCO2: string;
  doseEpinephrine: string;
  doseAmiodarone: string;
  doseLidocaine: string;
  doseSodiumBicarbonate: string;
  doseOther: string;
  initialRhythmEMS: string;
  emsShocksNumber: string;
};

// ================= UI helpers =================
const Section: React.FC<SectionProps> = ({ title, children }) => (
  <Card className="shadow-xl rounded-2xl mb-6">
    <CardContent className="p-6">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </CardContent>
  </Card>
);

const YesNo: React.FC<YesNoProps> = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between border rounded-xl p-3">
    <Label className="text-sm font-medium">{label}</Label>
    <div className="flex items-center gap-3">
      <span className="text-xs">No</span>
      <Switch checked={!!value} onCheckedChange={onChange} />
      <span className="text-xs">Yes</span>
    </div>
  </div>
);

const Pill: React.FC<PillProps> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-2 rounded-full border ${active ? "bg-black text-white" : "bg-white"} hover:shadow`}
  >
    {children}
  </button>
);

export default function App() {
  // Local display number (we’ll sync to DB case number after submit)
  const [recordNumber, setRecordNumber] = useState(712);

  // Submit UX
  const [submitting, setSubmitting] = useState(false);
  const [lastCase, setLastCase] = useState<number | null>(null);
  const [submittedText, setSubmittedText] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("mecmo_record_number");
      if (saved) setRecordNumber(parseInt(saved, 10));
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("mecmo_record_number", String(recordNumber));
    }
  }, [recordNumber]);

  const getInitialForm = (): FormState => ({
    emsAgency: "",
    crewNumber: "",
    wantFollowUp: false,
    crewNamesPhones: "",
    followUpEmail: "ecmodata@umn.edu",
    runNumber: "",
    witnessedArrest: null,
    timeOfArrest: "",
    bystanderCPR: null,
    bysCPRStart: "",
    firstResponderCPR: null,
    firstResponderOnScene: "",
    downTimePriorToCPR: "",
    aedShocksPrior: null,
    aedShocksNumber: "",
    dispatched: "",
    enroute: "",
    onScene: "",
    leaveScene: "",
    arriveHospital: "",
    lucasOn: null,
    emsCPRStartTime: "",
    airway: "",
    intubationIssues: "",
    utilized302: null,
    resQpod: null,
    lastETCO2: "",
    doseEpinephrine: "",
    doseAmiodarone: "",
    doseLidocaine: "",
    doseSodiumBicarbonate: "",
    doseOther: "",
    initialRhythmEMS: "",
    emsShocksNumber: "",
  });

  const [form, setForm] = useState<FormState>(getInitialForm());
  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));
  const resetForm = () => setForm(getInitialForm());
  const newForm = () => {
    setRecordNumber((n) => n + 1);
    setForm(getInitialForm());
  };

  // ======= Submit & Email (via /api/submit) =======
  const submitForm = async () => {
    try {
      setSubmitting(true);
      setSubmittedText(null);
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordNumber, ...form }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Submit failed");

      // Sync local display to global DB case number
      setLastCase(json.caseNumber);
      setRecordNumber(json.caseNumber);
      setSubmittedText(`Submitted as Case #${json.caseNumber}`);
      newForm();
    } catch (err: any) {
      alert(`Submit failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // ======= Existing exports =======
  const toCSV = () => {
    const entries = Object.entries({ Record: recordNumber, ...form });
    const headers = entries.map(([k]) => k).join(",");
    const row = entries.map(([, v]) => '"' + String(v ?? "").replace(/"/g, '""') + '"').join(",");
    const csv = headers + "\n" + row;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mECMO_EMS_${recordNumber}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setRecordNumber((n) => n + 1);
  };

  const toPDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const margin = 40;
    doc.setFontSize(16);
    doc.text("mECMO Patient – EMS INFO", margin, margin + 20);
    doc.setFontSize(10);
    doc.text(`Record #: ${recordNumber}`, margin, margin + 38);
    if (form.wantFollowUp) doc.text(`Follow-up email: ${form.followUpEmail}`, margin, margin + 54);
    let y = margin + 76;
    const line = (title: string, value: string | number | boolean | null) => {
      doc.setFont("helvetica", "bold");
      doc.text(String(title), margin, y);
      doc.setFont("helvetica", "normal");
      doc.text(String(value ?? "—"), margin + 210, y, { maxWidth: 335 });
      y += 18;
    };
    line("Transporting EMS agency", form.emsAgency);
    line("Crew #", form.crewNumber);
    if (form.wantFollowUp) line("Crew Names & Phone #", form.crewNamesPhones);
    line("Run/incident #", form.runNumber);
    line("Witnessed Arrest?", form.witnessedArrest === null ? "—" : form.witnessedArrest ? "Yes" : "No");
    line("Time of Arrest", form.timeOfArrest);
    line("Bystander CPR?", form.bystanderCPR === null ? "—" : form.bystanderCPR ? "Yes" : "No");
    if (form.bystanderCPR) line("Bystander CPR start time", form.bysCPRStart);
    line("First Responder CPR?", form.firstResponderCPR === null ? "—" : form.firstResponderCPR ? "Yes" : "No");
    if (form.firstResponderCPR) line("First responder on scene time", form.firstResponderOnScene);
    line("Approx. Down Time prior to CPR", form.downTimePriorToCPR);
    line("AED Shocks prior to EMS Arrival?", form.aedShocksPrior === null ? "—" : form.aedShocksPrior ? "Yes" : "No");
    if (form.aedShocksPrior) line("Number of AED Shocks", form.aedShocksNumber);
    y += 6;
    doc.setFont("helvetica", "bold");
    doc.text("EMS TIMES", margin, y);
    doc.setFont("helvetica", "normal");
    y += 16;
    line("Dispatched", form.dispatched);
    line("Enroute", form.enroute);
    line("On Scene", form.onScene);
    line("Leave Scene", form.leaveScene);
    line("Arrive Hospital", form.arriveHospital);
    line("LUCAS on?", form.lucasOn === null ? "—" : form.lucasOn ? "Yes" : "No");
    line("EMS CPR/LUCAS start time", form.emsCPRStartTime);
    line("Initial Rhythm for EMS", form.initialRhythmEMS);
    line("Number of EMS Shocks", form.emsShocksNumber);
    line("Airway utilized", form.airway);
    line("Intubation issues", form.intubationIssues);
    line("Utilized 30:2?", form.utilized302 === null ? "—" : form.utilized302 ? "Yes" : "No");
    line("ResQPOD?", form.resQpod === null ? "—" : form.resQpod ? "Yes" : "No");
    line("Last ETCO2 for EMS", form.lastETCO2);
    y += 6;
    doc.setFont("helvetica", "bold");
    doc.text("Medication Doses (EMS / First Responders)", margin, y);
    doc.setFont("helvetica", "normal");
    y += 16;
    line("Epinephrine (mg or mcg)", form.doseEpinephrine);
    line("Amiodarone (mg)", form.doseAmiodarone);
    line("Lidocaine (mg)", form.doseLidocaine);
    line("Sodium Bicarbonate (mEq)", form.doseSodiumBicarbonate);
    line("Other (name & dose)", form.doseOther);
    doc.save(`mECMO_EMS_${recordNumber}.pdf`);
    setRecordNumber((n) => n + 1);
  };

  const airwayOptions = ["iGel", "King-LT", "LMA", "ETT", "BVM"];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        {/* HEADER */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">mECMO Patient – EMS INFO</h1>
            <p className="text-sm text-gray-600">
              Record #: <span className="font-semibold">{recordNumber}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetForm} className="rounded-2xl">
              Reset Form
            </Button>
            <Button variant="secondary" onClick={newForm} className="rounded-2xl">
              New Form
            </Button>
            <Button onClick={toPDF} className="rounded-2xl">
              <FileDown className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button variant="secondary" onClick={toCSV} className="rounded-2xl">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </header>

        {/* EMS & Crew */}
        <Section title="EMS & Crew">
          <div className="grid gap-2">
            <Label>Transporting EMS agency name</Label>
            <Input value={form.emsAgency} onChange={(e) => set("emsAgency", e.target.value)} placeholder="Agency name" />
          </div>
          <div className="grid gap-2">
            <Label>Crew #</Label>
            <Input value={form.crewNumber} onChange={(e) => set("crewNumber", e.target.value)} placeholder="e.g., 123" />
          </div>
          <div className="grid gap-1 md:col-span-2">
            <div className="flex items-center justify-between border rounded-xl p-3">
              <Label className="text-sm font-medium">Provide follow-up contact?</Label>
              <div className="flex items-center gap-3">
                <span className="text-xs">No</span>
                <Switch checked={!!form.wantFollowUp} onCheckedChange={(v) => set("wantFollowUp", v)} />
                <span className="text-xs">Yes</span>
              </div>
            </div>
          </div>
          {form.wantFollowUp && (
            <>
              <div className="grid gap-2 md:col-span-2">
                <Label>Crew Names & Phone #</Label>
                <Input
                  value={form.crewNamesPhones}
                  onChange={(e) => set("crewNamesPhones", e.target.value)}
                  placeholder="Names and phone numbers"
                />
              </div>
              <div className="grid gap-2">
                <Label>Follow-up email</Label>
                <Input value={form.followUpEmail} onChange={(e) => set("followUpEmail", e.target.value)} />
              </div>
            </>
          )}
          <div className="grid gap-2">
            <Label>Run/incident #</Label>
            <Input value={form.runNumber} onChange={(e) => set("runNumber", e.target.value)} placeholder="Incident number" />
          </div>
        </Section>

        {/* Arrest & CPR Details */}
        <Section title="Arrest & CPR Details">
          <YesNo label="Witnessed Arrest?" value={form.witnessedArrest} onChange={(v) => set("witnessedArrest", v)} />
          <div className="grid gap-2">
            <Label>Time of Arrest</Label>
            <Input type="time" value={form.timeOfArrest} onChange={(e) => set("timeOfArrest", e.target.value)} />
          </div>
          <YesNo label="Bystander CPR?" value={form.bystanderCPR} onChange={(v) => set("bystanderCPR", v)} />
          {form.bystanderCPR && (
            <div className="grid gap-2">
              <Label>Bystander CPR start time</Label>
              <Input type="time" value={form.bysCPRStart} onChange={(e) => set("bysCPRStart", e.target.value)} />
            </div>
          )}
          <YesNo label="First Responder CPR?" value={form.firstResponderCPR} onChange={(v) => set("firstResponderCPR", v)} />
          {form.firstResponderCPR && (
            <div className="grid gap-2">
              <Label>First responder on scene time</Label>
              <Input type="time" value={form.firstResponderOnScene} onChange={(e) => set("firstResponderOnScene", e.target.value)} />
            </div>
          )}
          <div className="grid gap-2 md:col-span-2">
            <Label>Approximate Down Time prior to CPR</Label>
            <Input value={form.downTimePriorToCPR} onChange={(e) => set("downTimePriorToCPR", e.target.value)} placeholder="e.g., 5 minutes" />
          </div>
          <YesNo label="AED Shocks prior to EMS Arrival?" value={form.aedShocksPrior} onChange={(v) => set("aedShocksPrior", v)} />
          {form.aedShocksPrior && (
            <div className="grid gap-2">
              <Label>If Yes, Number of AED Shocks</Label>
              <Input value={form.aedShocksNumber} onChange={(e) => set("aedShocksNumber", e.target.value)} />
            </div>
          )}
        </Section>

        {/* EMS Times */}
        <Section title="EMS Times">
          <div className="grid gap-2">
            <Label>Dispatched</Label>
            <Input type="time" value={form.dispatched} onChange={(e) => set("dispatched", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Enroute</Label>
            <Input type="time" value={form.enroute} onChange={(e) => set("enroute", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>On Scene</Label>
            <Input type="time" value={form.onScene} onChange={(e) => set("onScene", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Leave Scene</Label>
            <Input type="time" value={form.leaveScene} onChange={(e) => set("leaveScene", e.target.value)} />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label>Arrive Hospital</Label>
            <Input type="time" value={form.arriveHospital} onChange={(e) => set("arriveHospital", e.target.value)} />
          </div>
        </Section>

        {/* Resuscitation Details */}
        <Section title="Resuscitation Details">
          <YesNo label="LUCAS on?" value={form.lucasOn} onChange={(v) => set("lucasOn", v)} />
          <div className="grid gap-2">
            <Label>EMS CPR/LUCAS start time</Label>
            <Input type="time" value={form.emsCPRStartTime} onChange={(e) => set("emsCPRStartTime", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Initial Rhythm for EMS</Label>
            <Input value={form.initialRhythmEMS} onChange={(e) => set("initialRhythmEMS", e.target.value)} placeholder="e.g., VF/VT/PEA/Asystole" />
          </div>
          <div className="grid gap-2">
            <Label>Number of EMS Shocks</Label>
            <Input value={form.emsShocksNumber} onChange={(e) => set("emsShocksNumber", e.target.value)} />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label>Airway utilized</Label>
            <div className="flex flex-wrap gap-2">
              {airwayOptions.map((opt) => (
                <Pill key={opt} active={form.airway === opt} onClick={() => set("airway", opt)}>
                  {opt}
                </Pill>
              ))}
            </div>
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label>If intubation was completed or attempted, were there any issues?</Label>
            <Textarea value={form.intubationIssues} onChange={(e) => set("intubationIssues", e.target.value)} rows={3} />
          </div>
          <YesNo label="Utilized 30:2?" value={form.utilized302} onChange={(v) => set("utilized302", v)} />
          <YesNo label="ResQPOD?" value={form.resQpod} onChange={(v) => set("resQpod", v)} />
          <div className="grid gap-2">
            <Label>Last ETCO2 for EMS</Label>
            <Input value={form.lastETCO2} onChange={(e) => set("lastETCO2", e.target.value)} />
          </div>
        </Section>

        {/* Medication Doses */}
        <Section title="Medication Doses (enter latest administered dose)">
          <div className="grid gap-2">
            <Label>Epinephrine (mg or mcg)</Label>
            <Input value={form.doseEpinephrine} onChange={(e) => set("doseEpinephrine", e.target.value)} placeholder="e.g., 1 mg" />
          </div>
          <div className="grid gap-2">
            <Label>Amiodarone (mg)</Label>
            <Input value={form.doseAmiodarone} onChange={(e) => set("doseAmiodarone", e.target.value)} placeholder="e.g., 300 mg" />
          </div>
          <div className="grid gap-2">
            <Label>Lidocaine (mg)</Label>
            <Input value={form.doseLidocaine} onChange={(e) => set("doseLidocaine", e.target.value)} placeholder="e.g., 100 mg" />
          </div>
          <div className="grid gap-2">
            <Label>Sodium Bicarbonate (mEq)</Label>
            <Input value={form.doseSodiumBicarbonate} onChange={(e) => set("doseSodiumBicarbonate", e.target.value)} placeholder="e.g., 50 mEq" />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label>Other (name & dose)</Label>
            <Input value={form.doseOther} onChange={(e) => set("doseOther", e.target.value)} placeholder="e.g., Calcium 1 g" />
          </div>
        </Section>

        {/* Sticky footer actions */}
        <div className="flex flex-col md:flex-row items-center gap-3 justify-end sticky bottom-4 bg-gray-50 py-4">
          <div className="text-xs text-gray-600 mr-auto">
            All data stays in your browser. Export saves a numbered file and auto-increments.
          </div>

          {/* Submit & Email */}
          <Button onClick={submitForm} disabled={submitting} className="rounded-2xl">
            {submitting ? "Submitting..." : "Submit & Email"}
          </Button>
          {submittedText && (
            <div className="text-xs text-green-700">{submittedText}</div>
          )}

          {/* Exports */}
          <Button onClick={toPDF} className="rounded-2xl">
            <FileDown className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="secondary" onClick={toCSV} className="rounded-2xl">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>
    </div>
  );
}
