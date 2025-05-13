import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { 
  Heart,
  Thermometer,
  Activity,
  X,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Pill,
  Clipboard,
  FileText,
  ExternalLink,
  User,
  PenSquare,
  PlusCircle,
  Microscope,
  ClipboardCheck,
  BookOpen,
  CalendarDays,
  Target,
  Trash2,
  FilePlus2
} from "lucide-react";
import { EMRData, Vitals, HistoryOfPresentIllness } from "../../types/medical";

interface EMRFormProps {
  patientName: string;
  appointmentTime: string;
  appointmentType: string;
  initialEMRData: EMRData;
  currentVitals: Vitals;
  onClose: () => void;
  onSave?: (data: EMRData) => void;
}

interface DiagnosisDetail {
  type: string;
  code: string;
  description: string;
  status: string;
  remarks: string;
}

interface InvestigationDetail {
  name: string;
  instructions: string;
  specialInstructions: string;
  icdJustification: string;
  priority: string;
}

interface Prescription {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: string;
  instructions: string;
}

interface PhysicalExaminationSystem {
  [key: string]: string;
}

interface PhysicalExamination {
  [system: string]: PhysicalExaminationSystem;
}

interface ReviewOfSymptomsSystem {
  [symptom: string]: boolean;
}

interface ReviewOfSymptoms {
  [system: string]: ReviewOfSymptomsSystem;
}

interface PainScreening {
  [key: string]: string;
}

interface WebSocketAnalysis {
  type: string;
  analysis: {
    consultationType?: string;
    chiefComplaint?: string;
    otherComplaints?: string[];
    historyOfPresentIllness?: {
      [key: string]: string;
    };
    reviewOfSymptoms?: ReviewOfSymptoms;
    physicalExamination?: PhysicalExamination;
    painScreening?: PainScreening;
  };
}

export function EMRForm({ 
  patientName, 
  appointmentTime, 
  appointmentType, 
  initialEMRData,
  currentVitals,
  onClose,
  onSave
}: EMRFormProps) {
  const [emrData, setEmrData] = useState<EMRData>(initialEMRData);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const contentRef = useRef<HTMLDivElement>(null);

  // Add new state for empty diagnosis and investigation
  const emptyDiagnosis = {
    type: "",
    code: "",
    description: "",
    status: "",
    remarks: ""
  };

  const emptyInvestigation = {
    name: "",
    instructions: "",
    specialInstructions: "",
    icdJustification: "",
    priority: ""
  };

  // Add this near your useState hooks
  const [showEMRForm, setShowEMRForm] = useState(false);
  console.log("Initial showEMRForm state:", showEMRForm);

  // Add after the emptyInvestigation constant
  useEffect(() => {
    // Set default values for physical examination to N/A
    const updatedExam = JSON.parse(JSON.stringify(emrData.physicalExamination));
    Object.keys(updatedExam).forEach(system => {
      Object.keys(updatedExam[system]).forEach(key => {
        if (!updatedExam[system][key]) {
          updatedExam[system][key] = 'N/A';
        }
      });
    });
    setEmrData(prev => ({
      ...prev,
      physicalExamination: updatedExam
    }));
  }, []); // Run once on component mount

  // Add handlers for adding and removing items
  const handleAddDiagnosis = () => {
    setEmrData({
      ...emrData,
      diagnosisDetails: [...(emrData.diagnosisDetails || []), { ...emptyDiagnosis }]
    });
  };

  const handleRemoveDiagnosis = (index: number) => {
    const updatedDiagnosis = [...(emrData.diagnosisDetails || [])];
    updatedDiagnosis.splice(index, 1);
    setEmrData({
      ...emrData,
      diagnosisDetails: updatedDiagnosis
    });
  };

  const handleAddInvestigation = () => {
    setEmrData({
      ...emrData,
      investigationDetails: [...(emrData.investigationDetails || []), { ...emptyInvestigation }]
    });
  };

  const handleRemoveInvestigation = (index: number) => {
    const updatedInvestigation = [...(emrData.investigationDetails || [])];
    updatedInvestigation.splice(index, 1);
    setEmrData({
      ...emrData,
      investigationDetails: updatedInvestigation
    });
  };

  // Add handlers for updating diagnosis and investigation fields
  const handleDiagnosisChange = (index: number, field: string, value: string) => {
    const updatedDiagnosis = [...(emrData.diagnosisDetails || [])];
    updatedDiagnosis[index] = {
      ...updatedDiagnosis[index],
      [field]: value
    };
    setEmrData({
      ...emrData,
      diagnosisDetails: updatedDiagnosis
    });
  };

  const handleInvestigationChange = (index: number, field: string, value: string) => {
    const updatedInvestigation = [...(emrData.investigationDetails || [])];
    updatedInvestigation[index] = {
      ...updatedInvestigation[index],
      [field]: value
    };
    setEmrData({
      ...emrData,
      investigationDetails: updatedInvestigation
    });
  };

  const handleStepChange = (newStep: 1 | 2 | 3 | 4 | 5) => {
    setCurrentStep(newStep);
    // Scroll to top with window.scrollTo for more reliable scrolling
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImproveWriting = (field: keyof EMRData) => {
    // Simulate LLM improving the writing
    if (field === 'otherComplaints') {
      const updatedComplaints = [...emrData.otherComplaints];
      if (updatedComplaints.length > 0) {
        updatedComplaints[0] = updatedComplaints[0] + " (Enhanced by AI)";
        setEmrData({ ...emrData, otherComplaints: updatedComplaints });
      }
    } else {
      const improved = String(emrData[field]) + " (Enhanced by AI)";
      setEmrData({ ...emrData, [field]: improved as any });
    }
  };

  const handleHistoryImprove = (field: keyof HistoryOfPresentIllness) => {
    const updatedHistory = { ...emrData.historyOfPresentIllness };
    updatedHistory[field] = updatedHistory[field] + " (Enhanced by AI)";
    setEmrData({ ...emrData, historyOfPresentIllness: updatedHistory });
  };

  // Add new handler functions after the existing handlers


  // Add loading state for diagnosis generation at the component level
  const [isGeneratingDiagnosis, setIsGeneratingDiagnosis] = useState(false);
  
  // Function to generate diagnosis and treatment plan from patient data
  const generateDiagnosis = async () => {
    try {
      setIsGeneratingDiagnosis(true);
      console.log("🔄 Starting diagnosis generation...");
      
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer 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",
          "HTTP-Referer": "https://github.com/OpenRouterTeam/openrouter",
          "X-Title": "Vitalis Medical Diagnosis"
        },
        body: JSON.stringify({
          model: "qwen/qwen2.5-vl-72b-instruct:free",
          messages: [
            {
              role: "system",
              content: `You are a medical diagnosis specialist. Your task is to analyze patient data and generate a diagnosis report.
ONLY respond with a valid JSON object. Do not include ANY other text, explanations, or formatting.

Example of the EXACT format to use:
{
  "dataReviewed": "Patient history...",
  "finalImpression": "Based on examination...",
  "suspectedCancerCase": "No",
  "diagnosisDetails": [
    {
      "type": "Primary diagnosis",
      "code": "ICD-10 code",
      "description": "Description",
      "status": "Active/Suspected",
      "remarks": "Additional notes"
    }
  ],
  "investigationDetails": [
    {
      "name": "Test name",
      "instructions": "Instructions",
      "specialInstructions": "Special notes",
      "icdJustification": "ICD code",
      "priority": "Urgent/Routine"
    }
  ],
  "clinicalInformation": "Relevant clinical details",
  "clinicalDataRadiology": "Information for radiology",
  "mainLinesTreatment": "Main treatment approach",
  "treatmentPlan": "Detailed plan",
  "measurableElements": "Measurable outcomes",
  "followUpRequired": "Yes/No",
  "followUpAfter": "Time period",
  "prescriptions": [
    {
      "medication": "Medicine name",
      "dosage": "Amount",
      "frequency": "How often",
      "duration": "How long",
      "route": "Administration route",
      "instructions": "Special instructions"
    }
  ]
}`
            },
            {
              role: "user",
              content: JSON.stringify({
                patientData: emrData,
                requestedSections: [
                  "dataReviewed",
                  "finalImpression",
                  "suspectedCancerCase",
                  "diagnosisDetails",
                  "investigationDetails",
                  "clinicalInformation",
                  "clinicalDataRadiology",
                  "mainLinesTreatment",
                  "treatmentPlan",
                  "measurableElements",
                  "followUpRequired",
                  "followUpAfter",
                  "prescriptions"
                ]
              })
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.1,
          max_tokens: 2000
        })
      });

      const result = await response.json();
      console.log("Raw LLM response:", result);
      
      if (!result.choices?.[0]?.message?.content) {
        throw new Error("Invalid API response format");
      }

      let content = result.choices[0].message.content;
      console.log("Raw content:", content);

      // Clean the content
      content = content.trim();
      
      // Ensure content is a valid JSON object
      if (!content.startsWith('{') || !content.endsWith('}')) {
        throw new Error("Invalid JSON format in response");
      }

      // Parse the JSON
      const diagnosisData = JSON.parse(content);
      console.log("Parsed diagnosis data:", diagnosisData);

      // Validate required fields
      const requiredFields = [
        "dataReviewed",
        "finalImpression",
        "suspectedCancerCase",
        "diagnosisDetails",
        "investigationDetails",
        "clinicalInformation",
        "clinicalDataRadiology",
        "mainLinesTreatment",
        "treatmentPlan",
        "measurableElements",
        "followUpRequired",
        "followUpAfter",
        "prescriptions"
      ];

      for (const field of requiredFields) {
        if (!(field in diagnosisData)) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Update EMR data with the validated diagnosis information
      setEmrData(prevData => ({
        ...prevData,
        dataReviewed: String(diagnosisData.dataReviewed || ""),
        finalImpression: String(diagnosisData.finalImpression || ""),
        suspectedCancerCase: String(diagnosisData.suspectedCancerCase || ""),
        diagnosisDetails: Array.isArray(diagnosisData.diagnosisDetails) ? diagnosisData.diagnosisDetails : [],
        investigationDetails: Array.isArray(diagnosisData.investigationDetails) ? diagnosisData.investigationDetails : [],
        clinicalInformation: String(diagnosisData.clinicalInformation || ""),
        clinicalDataRadiology: String(diagnosisData.clinicalDataRadiology || ""),
        mainLinesTreatment: String(diagnosisData.mainLinesTreatment || ""),
        treatmentPlan: String(diagnosisData.treatmentPlan || ""),
        measurableElements: String(diagnosisData.measurableElements || ""),
        followUpRequired: String(diagnosisData.followUpRequired || ""),
        followUpAfter: String(diagnosisData.followUpAfter || ""),
        prescriptions: Array.isArray(diagnosisData.prescriptions) ? diagnosisData.prescriptions : []
      }));

      handleStepChange(4);
    } catch (error) {
      console.error("❌ Error generating diagnosis:", error);
      alert("There was an error generating the diagnosis. Please try again.");
    } finally {
      setIsGeneratingDiagnosis(false);
    }
  };

  // Fix the WebSocket message handler to properly map physical examination and pain screening data
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/transcription');

    ws.onmessage = (event) => {
      try {
        let data = event.data;
        // Clean and validate JSON
        data = data.trim();
        if (!data.startsWith('{')) {
          const startIndex = data.indexOf('{');
          if (startIndex !== -1) {
            data = data.substring(startIndex);
          }
        }
        if (!data.endsWith('}')) {
          const endIndex = data.lastIndexOf('}');
          if (endIndex !== -1) {
            data = data.substring(0, endIndex + 1);
          }
        }

        // Replace any unescaped newlines and fix missing quotes around property names
        data = data.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
                  .replace(/\n/g, '\\n');

        console.log("Cleaned WebSocket data:", data);
        const parsedData = JSON.parse(data) as WebSocketAnalysis;
        
        if (parsedData.type === 'final_analysis') {
          const analysis = parsedData.analysis;
          console.log("Analysis received:", analysis);
          
          // Update EMR data with the analysis
          setEmrData((prevData: EMRData): EMRData => {
            // Create a deep copy of the current state
            const newData = { ...JSON.parse(JSON.stringify(prevData)) };
            
            // Update basic fields with validation
            if (typeof analysis.consultationType === 'string') newData.consultationType = analysis.consultationType;
            if (typeof analysis.chiefComplaint === 'string') newData.chiefComplaint = analysis.chiefComplaint;
            if (Array.isArray(analysis.otherComplaints)) newData.otherComplaints = analysis.otherComplaints;
            
            // Update history of present illness with validation
            if (analysis.historyOfPresentIllness && typeof analysis.historyOfPresentIllness === 'object') {
              Object.entries(analysis.historyOfPresentIllness).forEach(([key, value]) => {
                if (typeof value === 'string' && key in newData.historyOfPresentIllness) {
                  (newData.historyOfPresentIllness as any)[key] = value;
                }
              });
            }
            
            // Update review of symptoms with validation
            if (analysis.reviewOfSymptoms && typeof analysis.reviewOfSymptoms === 'object') {
              Object.entries(analysis.reviewOfSymptoms).forEach(([system, symptoms]) => {
                if (typeof symptoms === 'object' && symptoms !== null) {
                  if (!newData.reviewOfSymptoms[system]) {
                    newData.reviewOfSymptoms[system] = {};
                  }
                  
                  Object.entries(symptoms).forEach(([symptom, value]) => {
                    if (typeof value === 'boolean') {
                      newData.reviewOfSymptoms[system][symptom] = value;
                    }
                  });
                }
              });
            }
            
            // Update physical examination with validation
            if (analysis.physicalExamination && typeof analysis.physicalExamination === 'object') {
              Object.entries(analysis.physicalExamination).forEach(([system, findings]) => {
                if (typeof findings === 'object' && findings !== null) {
                  if (!newData.physicalExamination[system]) {
                    newData.physicalExamination[system] = {};
                  }
                  
                  Object.entries(findings).forEach(([key, value]) => {
                    if (typeof value === 'string') {
                      newData.physicalExamination[system][key] = value;
                    }
                  });
                }
              });
            }
            
            // Update pain screening with validation
            if (analysis.painScreening && typeof analysis.painScreening === 'object') {
              Object.entries(analysis.painScreening).forEach(([field, value]) => {
                if (typeof value === 'string' || typeof value === 'number') {
                  newData.painScreening[field] = String(value);
                }
              });
            }
            
            return newData;
          });
        }
      } catch (error) {
        console.error("WebSocket message parsing error:", error);
        // Don't throw the error, just log it and continue
      }
    };

    ws.onerror = (event: Event) => {
      console.error("WebSocket error:", event);
    };

    return () => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  // Add the missing handleFindingChange function
  const handleFindingChange = (system: string, key: string, value: string) => {
    setEmrData(prev => {
      const newData = { ...prev };
      if (!newData.physicalExamination[system]) {
        newData.physicalExamination[system] = {};
      }
      newData.physicalExamination[system][key] = value;
      return newData;
    });
  };

  // Then modify your conditional rendering section
  // Add this right after your return statement
  useEffect(() => {
    console.log("showEMRForm changed to:", showEMRForm);
  }, [showEMRForm]);

  // In your component, make sure the conditional rendering is working
  // It should be right after the main return statement:
  if (showEMRForm) {
    console.log("Rendering EMR Form");
    return (
      <EMRForm
        patientName={patientName}
        appointmentTime={appointmentTime}
        appointmentType={appointmentType}
        initialEMRData={emrData}
        currentVitals={currentVitals}
        onClose={() => {
          console.log("Closing EMR Form");
          setShowEMRForm(false);
        }}
        onSave={handleEMRSave}
      />
    );
  }

  return (
    <div className="min-h-screen w-screen px-56">
      {/* Sticky header */}
      <div className="sticky top-0 bg-white shadow-md z-50 w-full">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-brand" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{patientName}</h1>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <span>{appointmentTime}</span>
                  <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                  <span>{appointmentType}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {currentStep > 1 && currentStep !== 4 && (
                <Button 
                  variant="outline" 
                  onClick={() => handleStepChange((currentStep - 1) as 1 | 2 | 3 | 4 | 5)}
                  className="flex items-center gap-1 text-sm py-1 h-8"
                >
                  <ChevronLeft className="h-3 w-3" />
                  Previous
                </Button>
              )}
              
              {currentStep < 5 ? (
                <Button 
                  className={`flex items-center gap-2 text-sm py-1.5 h-9 px-4 ${
                    currentStep === 3 && isGeneratingDiagnosis 
                      ? 'bg-yellow-500 hover:bg-yellow-600' 
                      : currentStep === 3 && emrData.diagnosisDetails && emrData.diagnosisDetails.length > 0
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-brand hover:bg-brand/90'
                  } text-white`}
                  onClick={() => {
                    if (currentStep === 3) {
                      // Only call generate diagnosis if not already generating
                      if (!isGeneratingDiagnosis) {
                        generateDiagnosis();
                      }
                    } else {
                      handleStepChange((currentStep + 1) as 1 | 2 | 3 | 4 | 5);
                    }
                  }}
                  disabled={currentStep === 3 && isGeneratingDiagnosis}
                >
                  {currentStep === 3 ? (
                    isGeneratingDiagnosis ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        <span>Generating Diagnosis...</span>
                      </>
                    ) : emrData.diagnosisDetails && emrData.diagnosisDetails.length > 0 ? (
                      <>
                        <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Diagnosis Generated</span>
                      </>
                    ) : (
                      <>
                        <FilePlus2 className="h-4 w-4" />
                        <span>Generate Diagnosis</span>
                      </>
                    )
                  ) : (
                    <>
                      Next
                      <ChevronRight className="h-3 w-3" />
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  className="bg-brand hover:bg-brand/90 text-white flex items-center gap-1 text-sm py-1 h-8"
                  onClick={() => {
                    onSave && onSave(emrData);
                    onClose();
                  }}
                >
                  Submit Record
                </Button>
              )}

              <button 
                onClick={onClose}
                className="rounded-full h-9 w-9 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors ml-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div ref={contentRef} className="container mx-auto px-4 py-6">
        {currentStep === 1 && (
          <div className="flex flex-col w-full gap-6">
            {/* Current Vitals Section */}
            <div className="bg-gradient-to-r from-[#f1f5f9] to-[#f8fafc] rounded-xl p-6 w-full">
              <h3 className="text-base font-medium text-gray-800 mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-brand" />
                Current Vitals
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium text-gray-700">Blood Pressure</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{currentVitals.bp} <span className="text-xs text-gray-500">mmHg</span></p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-700">Pulse Rate</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{currentVitals.pulse} <span className="text-xs text-gray-500">bpm</span></p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <Thermometer className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium text-gray-700">Temperature</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{currentVitals.temp} <span className="text-xs text-gray-500">°F</span></p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-gray-700">SpO2</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{currentVitals.spo2} <span className="text-xs text-gray-500">%</span></p>
                </div>
              </div>
            </div>

            {/* Consultation Details */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden w-full">
              <div className="bg-[#f8fafc] p-4 border-b border-gray-100">
                <h3 className="font-medium text-gray-800 flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-brand" />
                  Consultation Details
                </h3>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Type</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={emrData.consultationType}
                      onChange={(e) => setEmrData({ ...emrData, consultationType: e.target.value })}
                      className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      placeholder="Enter consultation type"
                    />
                    <button
                      onClick={() => handleImproveWriting('consultationType')}
                      className="px-3 py-2 text-sm text-brand hover:bg-brand/5 rounded-lg transition-colors"
                    >
                      Improve
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chief Complaint</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={emrData.chiefComplaint}
                      onChange={(e) => setEmrData({ ...emrData, chiefComplaint: e.target.value })}
                      className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      placeholder="Enter chief complaint"
                    />
                    <button
                      onClick={() => handleImproveWriting('chiefComplaint')}
                      className="px-3 py-2 text-sm text-brand hover:bg-brand/5 rounded-lg transition-colors"
                    >
                      Improve
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Other Complaints</label>
                  <div className="flex items-start gap-2">
                    <textarea
                      value={emrData.otherComplaints.join("\n")}
                      onChange={(e) => setEmrData({ 
                        ...emrData, 
                        otherComplaints: e.target.value.split("\n")
                      })}
                      className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      rows={3}
                      placeholder="Enter other complaints (one per line)"
                    />
                    <button
                      onClick={() => handleImproveWriting('otherComplaints')}
                      className="px-3 py-2 text-sm text-brand hover:bg-brand/5 rounded-lg transition-colors"
                    >
                      Improve
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* History of Present Illness */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden w-full">
              <div className="bg-[#f8fafc] p-4 border-b border-gray-100">
                <h3 className="font-medium text-gray-800 flex items-center gap-2">
                  <Clipboard className="h-4 w-4 text-brand" />
                  History of Present Illness
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Parameter</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-3/4">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(emrData.historyOfPresentIllness).map(([key, value]) => (
                      <tr key={key} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 align-top">
                          {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-2">
                            <textarea
                              value={value}
                              onChange={(e) => {
                                const updatedHistory = { ...emrData.historyOfPresentIllness };
                                updatedHistory[key as keyof HistoryOfPresentIllness] = e.target.value;
                                setEmrData({ ...emrData, historyOfPresentIllness: updatedHistory });
                              }}
                              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                              rows={2}
                            />
                            <button
                              onClick={() => handleHistoryImprove(key as keyof HistoryOfPresentIllness)}
                              className="mt-1 px-2 py-1 text-xs text-brand hover:bg-brand/5 rounded-lg"
                            >
                              Improve
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Substance Use History */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden w-full">
              <div className="bg-[#f8fafc] p-4 border-b border-gray-100">
                <h3 className="font-medium text-gray-800 flex items-center gap-2">
                  <Pill className="h-4 w-4 text-brand" />
                  Substance Use History
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Tobacco/Drug Use</label>
                    <textarea
                      value={emrData.tobaccoDrugUse}
                      onChange={(e) => setEmrData({ ...emrData, tobaccoDrugUse: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      rows={3}
                      placeholder="Describe current tobacco or drug use"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">History of Tobacco/Drug Use</label>
                    <textarea
                      value={emrData.tobaccoDrugHistory}
                      onChange={(e) => setEmrData({ ...emrData, tobaccoDrugHistory: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      rows={3}
                      placeholder="Describe history of tobacco or drug use"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Allergy Details */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden w-full">
              <div className="bg-[#f8fafc] p-4 border-b border-gray-100">
                <h3 className="font-medium text-gray-800 flex items-center gap-2">
                  <Pill className="h-4 w-4 text-brand rotate-45" />
                  Allergy Details
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Onset</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Reaction</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {emrData.allergyDetails.map((allergy, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-900">{allergy.type}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{allergy.description}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{allergy.dateOfOnset}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{allergy.reaction}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            allergy.status === 'Active' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {allergy.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            allergy.severity === 'Severe' ? 'bg-red-100 text-red-800' :
                            allergy.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {allergy.severity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="flex flex-col w-full gap-6">
            {/* Review of Symptoms */}
            <div className="w-full">
              <div className="bg-white rounded-xl border border-gray-200 w-full">
                <div className="bg-[#f8fafc] p-4 border-b border-gray-100">
                  <h3 className="font-medium text-gray-800 flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-brand" />
                    Review of Symptoms
                  </h3>
                </div>
                <div className="w-full overflow-x-auto">
                  <div className="min-w-full inline-block align-middle">
                    <div className="overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">System</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-5/6">Symptoms</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {Object.entries(emrData.reviewOfSymptoms).map(([system, symptoms]) => (
                            <tr key={system} className="">
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900 capitalize">
                                  {system.replace(/([A-Z])/g, ' $1').trim()}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                  {Object.entries(symptoms).map(([symptom, value]) => (
                                    <div key={symptom} className="flex items-center justify-between p-2 rounded-md transition-colors">
                                      <span className="text-sm text-gray-900 capitalize">
                                        {symptom.replace(/([A-Z])/g, ' $1').trim()}
                                      </span>
                                      <div className="flex items-center gap-1">
                                        <button
                                          className={`px-2 py-1 text-xs rounded-full transition-colors ${
                                            value === true ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                          }`}
                                          onClick={() => {
                                            const updatedReviewOfSymptoms = JSON.parse(JSON.stringify(emrData.reviewOfSymptoms));
                                            (updatedReviewOfSymptoms as any)[system][symptom] = true;
                                            setEmrData({ ...emrData, reviewOfSymptoms: updatedReviewOfSymptoms });
                                          }}
                                        >
                                          Yes
                                        </button>
                                        <button
                                          className={`px-2 py-1 text-xs rounded-full transition-colors ${
                                            value === false ? 'bg-red-100 text-red-800 hover:bg-red-200' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                          }`}
                                          onClick={() => {
                                            const updatedReviewOfSymptoms = JSON.parse(JSON.stringify(emrData.reviewOfSymptoms));
                                            (updatedReviewOfSymptoms as any)[system][symptom] = false;
                                            setEmrData({ ...emrData, reviewOfSymptoms: updatedReviewOfSymptoms });
                                          }}
                                        >
                                          No
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Past Family and Social History */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden w-full">
              <div className="bg-[#f8fafc] p-4 border-b border-gray-100">
                <h3 className="font-medium text-gray-800 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-brand" />
                  Past Family and Social History
                </h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Past Medical/Surgical History</label>
                    <textarea
                      value={emrData.pastMedicalHistory}
                      onChange={(e) => setEmrData({ ...emrData, pastMedicalHistory: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      rows={4}
                      placeholder="Describe past medical or surgical history"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Family History</label>
                    <textarea
                      value={emrData.familyHistory}
                      onChange={(e) => setEmrData({ ...emrData, familyHistory: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      rows={4}
                      placeholder="Describe family history"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Social History</label>
                    <textarea
                      value={emrData.socialHistory}
                      onChange={(e) => setEmrData({ ...emrData, socialHistory: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      rows={4}
                      placeholder="Describe social history"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Economic Status</label>
                    <textarea
                      value={emrData.economicStatus}
                      onChange={(e) => setEmrData({ ...emrData, economicStatus: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      rows={4}
                      placeholder="Describe economic status"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="flex flex-col w-full gap-6">
            {/* Physical Examination Table */}
            <div className="bg-white rounded-xl border border-gray-200 w-full">
              <div className="bg-[#f8fafc] p-4 border-b border-gray-100">
                <h3 className="font-medium text-gray-800 flex items-center gap-2">
                  <User className="h-4 w-4 text-brand" />
                  Physical Examination
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">System</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" colSpan={4}>Findings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(emrData.physicalExamination).map(([system, findings]) => (
                      <tr key={system} className="">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 capitalize">
                            {system.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {Object.entries(findings).map(([key, value]) => (
                              <div key={key} className="flex items-center justify-between p-2 rounded-md transition-colors">
                                <span className="text-sm text-gray-900 capitalize">
                                  {key === 'others' ? 'Other' : key.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    className={`px-2 py-1 text-xs rounded-full transition-colors ${
                                      value === 'Yes' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                    onClick={() => handleFindingChange(system, key, 'Yes')}
                                  >
                                    Yes
                                  </button>
                                  <button
                                    className={`px-2 py-1 text-xs rounded-full transition-colors ${
                                      value === 'No' ? 'bg-red-100 text-red-800 hover:bg-red-200' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                    onClick={() => handleFindingChange(system, key, 'No')}
                                  >
                                    No
                                  </button>
                                  <button
                                    className={`px-2 py-1 text-xs rounded-full transition-colors ${
                                      value === 'N/A' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                    onClick={() => handleFindingChange(system, key, 'N/A')}
                                  >
                                    N/A
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pain Screening */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden w-full">
              <div className="bg-[#f8fafc] p-4 border-b border-gray-100">
                <h3 className="font-medium text-gray-800 flex items-center gap-2">
                  <PenSquare className="h-4 w-4 text-brand" />
                  Pain Screening
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pain
                    </label>
                    <input
                      type="text"
                      value={emrData.painScreening.pain}
                      onChange={(e) => setEmrData({ 
                        ...emrData, 
                        painScreening: { ...emrData.painScreening, pain: e.target.value }
                      })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      placeholder="Describe pain"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={emrData.painScreening.location}
                      onChange={(e) => setEmrData({ 
                        ...emrData, 
                        painScreening: { ...emrData.painScreening, location: e.target.value }
                      })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      placeholder="Pain location"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={emrData.painScreening.duration}
                      onChange={(e) => setEmrData({ 
                        ...emrData, 
                        painScreening: { ...emrData.painScreening, duration: e.target.value }
                      })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      placeholder="Pain duration"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frequency
                    </label>
                    <input
                      type="text"
                      value={emrData.painScreening.frequency}
                      onChange={(e) => setEmrData({ 
                        ...emrData, 
                        painScreening: { ...emrData.painScreening, frequency: e.target.value }
                      })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      placeholder="Pain frequency"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Character
                    </label>
                    <input
                      type="text"
                      value={emrData.painScreening.character}
                      onChange={(e) => setEmrData({ 
                        ...emrData, 
                        painScreening: { ...emrData.painScreening, character: e.target.value }
                      })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      placeholder="Pain character"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pain Score
                    </label>
                    <input
                      type="text"
                      value={emrData.painScreening.score}
                      onChange={(e) => setEmrData({ 
                        ...emrData, 
                        painScreening: { ...emrData.painScreening, score: e.target.value }
                      })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      placeholder="Scale 1-10"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pain Management Done
                    </label>
                    <textarea
                      value={emrData.painScreening.management}
                      onChange={(e) => setEmrData({ 
                        ...emrData, 
                        painScreening: { ...emrData.painScreening, management: e.target.value }
                      })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      rows={2}
                      placeholder="Describe pain management approaches"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Special Needs Screening */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden w-full">
              <div className="bg-[#f8fafc] p-4 border-b border-gray-100">
                <h3 className="font-medium text-gray-800 flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-brand" />
                  Special Needs Screening
                </h3>
                <p className="text-xs text-gray-500 mt-1">If applicable/positive please fill referral form</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nutritional Screening Criteria</label>
                    <textarea
                      value={emrData.specialNeedsScreening.nutritional}
                      onChange={(e) => setEmrData({ 
                        ...emrData, 
                        specialNeedsScreening: { ...emrData.specialNeedsScreening, nutritional: e.target.value }
                      })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      rows={2}
                      placeholder="Nutritional screening details"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Psychological Screening Criteria</label>
                    <textarea
                      value={emrData.specialNeedsScreening.psychological}
                      onChange={(e) => setEmrData({ 
                        ...emrData, 
                        specialNeedsScreening: { ...emrData.specialNeedsScreening, psychological: e.target.value }
                      })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      rows={2}
                      placeholder="Psychological screening details"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Functional Screening Criteria</label>
                    <textarea
                      value={emrData.specialNeedsScreening.functional}
                      onChange={(e) => setEmrData({ 
                        ...emrData, 
                        specialNeedsScreening: { ...emrData.specialNeedsScreening, functional: e.target.value }
                      })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      rows={2}
                      placeholder="Functional screening details"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Socio-economic Screening</label>
                    <textarea
                      value={emrData.specialNeedsScreening.socioeconomic}
                      onChange={(e) => setEmrData({ 
                        ...emrData, 
                        specialNeedsScreening: { ...emrData.specialNeedsScreening, socioeconomic: e.target.value }
                      })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      rows={2}
                      placeholder="Socio-economic screening details"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Spiritual/Cultural Screening Criteria</label>
                    <textarea
                      value={emrData.specialNeedsScreening.spiritualCultural}
                      onChange={(e) => setEmrData({ 
                        ...emrData, 
                        specialNeedsScreening: { ...emrData.specialNeedsScreening, spiritualCultural: e.target.value }
                      })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      rows={2}
                      placeholder="Spiritual/cultural screening details"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Suspected Abuse/Neglect</label>
                    <textarea
                      value={emrData.specialNeedsScreening.suspectedAbuse}
                      onChange={(e) => setEmrData({ 
                        ...emrData, 
                        specialNeedsScreening: { ...emrData.specialNeedsScreening, suspectedAbuse: e.target.value }
                      })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      rows={2}
                      placeholder="Details of suspected abuse/neglect"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Patient Requires Additional Specialized Assessment</label>
                    <textarea
                      value={emrData.specialNeedsScreening.specializedAssessment}
                      onChange={(e) => setEmrData({ 
                        ...emrData, 
                        specialNeedsScreening: { ...emrData.specialNeedsScreening, specializedAssessment: e.target.value }
                      })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      rows={2}
                      placeholder="Specialized assessment details"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="flex flex-col w-full gap-6">
            {/* Data Reviewed and Findings */}
            <div className="bg-white rounded-xl border border-gray-200 w-full">
              <div className="bg-[#f8fafc] p-4 border-b border-gray-100">
                <h3 className="font-medium text-gray-800 flex items-center gap-2">
                  <Clipboard className="h-4 w-4 text-brand" />
                  Data Reviewed and Findings
                </h3>
              </div>
              <div className="p-6">
                <div className="flex flex-col w-full gap-6">
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Data Reviewed</label>
                    <textarea
                      value={emrData.dataReviewed || ""}
                      onChange={(e) => setEmrData({ ...emrData, dataReviewed: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand min-h-[160px] text-base"
                      rows={6}
                      placeholder="Enter data reviewed"
                    />
                  </div>
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Final Impression</label>
                    <textarea
                      value={emrData.finalImpression || ""}
                      onChange={(e) => setEmrData({ ...emrData, finalImpression: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand min-h-[160px] text-base"
                      rows={6}
                      placeholder="Enter final impression"
                    />
                  </div>
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Suspected Cancer Case</label>
                    <textarea
                      value={emrData.suspectedCancerCase || ""}
                      onChange={(e) => setEmrData({ ...emrData, suspectedCancerCase: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand min-h-[160px] text-base"
                      rows={6}
                      placeholder="Enter suspected cancer case details"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Consultation Details Table */}
            <div className="bg-white rounded-xl border border-gray-200 w-full">
              <div className="bg-[#f8fafc] p-4 border-b border-gray-100">
                <h3 className="font-medium text-gray-800 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-brand" />
                  Consultation Details
                </h3>
                <button 
                  onClick={handleAddDiagnosis}
                  className="mt-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs text-gray-700 flex items-center gap-1 transition-colors w-fit"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  Add Diagnosis
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnosis Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnosis Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(emrData.diagnosisDetails || []).map((diagnosis, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={diagnosis.type}
                            onChange={(e) => handleDiagnosisChange(index, 'type', e.target.value)}
                            className="w-full text-sm rounded-md border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand/20 focus:border-brand"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={diagnosis.code}
                            onChange={(e) => handleDiagnosisChange(index, 'code', e.target.value)}
                            className="w-full text-sm rounded-md border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand/20 focus:border-brand"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={diagnosis.description}
                            onChange={(e) => handleDiagnosisChange(index, 'description', e.target.value)}
                            className="w-full text-sm rounded-md border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand/20 focus:border-brand"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={diagnosis.status}
                            onChange={(e) => handleDiagnosisChange(index, 'status', e.target.value)}
                            className="w-full text-sm rounded-md border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand/20 focus:border-brand"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={diagnosis.remarks}
                            onChange={(e) => handleDiagnosisChange(index, 'remarks', e.target.value)}
                            className="w-full text-sm rounded-md border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand/20 focus:border-brand"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleRemoveDiagnosis(index)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(emrData.diagnosisDetails || []).length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-sm text-gray-500 text-center">No diagnosis details added</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Investigation and Clinical Forms */}
            <div className="bg-white rounded-xl border border-gray-200 w-full">
              <div className="bg-[#f8fafc] p-4 border-b border-gray-100">
                <h3 className="font-medium text-gray-800 flex items-center gap-2">
                  <Microscope className="h-4 w-4 text-brand" />
                  Investigation and Clinical Forms
                </h3>
                <button 
                  onClick={handleAddInvestigation}
                  className="mt-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs text-gray-700 flex items-center gap-1 transition-colors w-fit"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  Add Investigation
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investigation</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Special Instructions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ICD Just.</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(emrData.investigationDetails || []).map((investigation, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={investigation.name}
                            onChange={(e) => handleInvestigationChange(index, 'name', e.target.value)}
                            className="w-full text-sm rounded-md border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand/20 focus:border-brand"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={investigation.instructions}
                            onChange={(e) => handleInvestigationChange(index, 'instructions', e.target.value)}
                            className="w-full text-sm rounded-md border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand/20 focus:border-brand"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={investigation.specialInstructions}
                            onChange={(e) => handleInvestigationChange(index, 'specialInstructions', e.target.value)}
                            className="w-full text-sm rounded-md border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand/20 focus:border-brand"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={investigation.icdJustification}
                            onChange={(e) => handleInvestigationChange(index, 'icdJustification', e.target.value)}
                            className="w-full text-sm rounded-md border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand/20 focus:border-brand"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={investigation.priority}
                            onChange={(e) => handleInvestigationChange(index, 'priority', e.target.value)}
                            className="w-full text-sm rounded-md border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand/20 focus:border-brand"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleRemoveInvestigation(index)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(emrData.investigationDetails || []).length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-sm text-gray-500 text-center">No investigation details added</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Clinical Forms */}
            <div className="bg-white rounded-xl border border-gray-200 w-full">
              <div className="bg-[#f8fafc] p-4 border-b border-gray-100">
                <h3 className="font-medium text-gray-800 flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-brand" />
                  Clinical Forms
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Clinical Information</label>
                  <textarea
                    value={emrData.clinicalInformation || ""}
                    onChange={(e) => setEmrData({ ...emrData, clinicalInformation: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                    rows={3}
                    placeholder="Enter clinical information"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Clinical Data for Radiology Orders</label>
                  <textarea
                    value={emrData.clinicalDataRadiology || ""}
                    onChange={(e) => setEmrData({ ...emrData, clinicalDataRadiology: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                    rows={3}
                    placeholder="Enter clinical data for radiology orders"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="flex flex-col w-full gap-6">
            {/* Treatment sections */}
            <div className="bg-white rounded-xl border border-gray-200 w-full">
              <div className="bg-[#f8fafc] p-4 border-b border-gray-100">
                <h3 className="font-medium text-gray-800 flex items-center gap-2">
                  <Target className="h-4 w-4 text-brand" />
                  Main lines of Treatment
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Main lines of treatment</label>
                  <textarea
                    value={emrData.mainLinesTreatment || ""}
                    onChange={(e) => setEmrData({ ...emrData, mainLinesTreatment: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                    rows={3}
                    placeholder="Enter main lines of treatment"
                  />
                </div>
              </div>
            </div>

            {/* Treatment Plan */}
            <div className="bg-white rounded-xl border border-gray-200 w-full">
              <div className="bg-[#f8fafc] p-4 border-b border-gray-100">
                <h3 className="font-medium text-gray-800 flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-brand" />
                  Treatment Plan
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Treatment Plan</label>
                  <textarea
                    value={emrData.treatmentPlan || ""}
                    onChange={(e) => setEmrData({ ...emrData, treatmentPlan: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                    rows={3}
                    placeholder="Enter treatment plan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Measurable Elements for improvement and plan success</label>
                  <textarea
                    value={emrData.measurableElements || ""}
                    onChange={(e) => setEmrData({ ...emrData, measurableElements: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                    rows={3}
                    placeholder="Enter measurable elements"
                  />
                </div>
              </div>
            </div>

            {/* Follow Up Plans */}
            <div className="bg-white rounded-xl border border-gray-200 w-full">
              <div className="bg-[#f8fafc] p-4 border-b border-gray-100">
                <h3 className="font-medium text-gray-800 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-brand" />
                  Follow Up Plans
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Follow Up Required</label>
                    <textarea
                      value={emrData.followUpRequired || ""}
                      onChange={(e) => setEmrData({ ...emrData, followUpRequired: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      rows={2}
                      placeholder="Enter follow up requirements"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up after</label>
                    <textarea
                      value={emrData.followUpAfter || ""}
                      onChange={(e) => setEmrData({ ...emrData, followUpAfter: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      rows={2}
                      placeholder="Enter follow up timeline"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Patient and Family Education Assessment */}
            <div className="bg-white rounded-xl border border-gray-200 w-full">
              <div className="bg-[#f8fafc] p-4 border-b border-gray-100">
                <h3 className="font-medium text-gray-800 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-brand" />
                  Patient and Family Education Assessment form
                </h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name of Learner</label>
                    <input
                      type="text"
                      value={emrData.educationAssessment?.nameOfLearner || ""}
                      onChange={(e) => setEmrData({ 
                        ...emrData, 
                        educationAssessment: { 
                          ...emrData.educationAssessment || {}, 
                          nameOfLearner: e.target.value 
                        } 
                      })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      placeholder="Enter learner's name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Communication</label>
                    <input
                      type="text"
                      value={emrData.educationAssessment?.communication || ""}
                      onChange={(e) => setEmrData({ 
                        ...emrData, 
                        educationAssessment: { 
                          ...emrData.educationAssessment || {}, 
                          communication: e.target.value 
                        } 
                      })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      placeholder="Enter communication details"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Able to learn</label>
                    <input
                      type="text"
                      value={emrData.educationAssessment?.ableToLearn || ""}
                      onChange={(e) => setEmrData({ 
                        ...emrData, 
                        educationAssessment: { 
                          ...emrData.educationAssessment || {}, 
                          ableToLearn: e.target.value 
                        } 
                      })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      placeholder="Enter learning ability"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Able to read</label>
                    <input
                      type="text"
                      value={emrData.educationAssessment?.ableToRead || ""}
                      onChange={(e) => setEmrData({ 
                        ...emrData, 
                        educationAssessment: { 
                          ...emrData.educationAssessment || {}, 
                          ableToRead: e.target.value 
                        } 
                      })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      placeholder="Enter reading ability"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Able to understand</label>
                    <input
                      type="text"
                      value={emrData.educationAssessment?.ableToUnderstand || ""}
                      onChange={(e) => setEmrData({ 
                        ...emrData, 
                        educationAssessment: { 
                          ...emrData.educationAssessment || {}, 
                          ableToUnderstand: e.target.value 
                        } 
                      })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      placeholder="Enter understanding ability"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-800 mb-3">Initial Learning ability Assessment</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Barriers</label>
                      <input
                        type="text"
                        value={emrData.educationAssessment?.learningBarriers || ""}
                        onChange={(e) => setEmrData({ 
                          ...emrData, 
                          educationAssessment: { 
                            ...emrData.educationAssessment || {}, 
                            learningBarriers: e.target.value 
                          } 
                        })}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                        placeholder="Enter barriers"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Physical/Cognitive Limitation</label>
                      <input
                        type="text"
                        value={emrData.educationAssessment?.physicalCognitiveLimitation || ""}
                        onChange={(e) => setEmrData({ 
                          ...emrData, 
                          educationAssessment: { 
                            ...emrData.educationAssessment || {}, 
                            physicalCognitiveLimitation: e.target.value 
                          } 
                        })}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                        placeholder="Enter limitations"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Psychological/Emotional</label>
                      <input
                        type="text"
                        value={emrData.educationAssessment?.psychologicalEmotional || ""}
                        onChange={(e) => setEmrData({ 
                          ...emrData, 
                          educationAssessment: { 
                            ...emrData.educationAssessment || {}, 
                            psychologicalEmotional: e.target.value 
                          } 
                        })}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                        placeholder="Enter psychological factors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Social</label>
                      <input
                        type="text"
                        value={emrData.educationAssessment?.social || ""}
                        onChange={(e) => setEmrData({ 
                          ...emrData, 
                          educationAssessment: { 
                            ...emrData.educationAssessment || {}, 
                            social: e.target.value 
                          } 
                        })}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                        placeholder="Enter social factors"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Beliefs & values</label>
                    <input
                      type="text"
                      value={emrData.educationAssessment?.beliefsValues || ""}
                      onChange={(e) => setEmrData({ 
                        ...emrData, 
                        educationAssessment: { 
                          ...emrData.educationAssessment || {}, 
                          beliefsValues: e.target.value 
                        } 
                      })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      placeholder="Enter beliefs and values"
                    />
                  </div>

                  <h4 className="text-sm font-medium text-gray-800 mb-3">Patient and Family Education</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Learning needs</label>
                      <input
                        type="text"
                        value={emrData.educationAssessment?.learningNeeds || ""}
                        onChange={(e) => setEmrData({ 
                          ...emrData, 
                          educationAssessment: { 
                            ...emrData.educationAssessment || {}, 
                            learningNeeds: e.target.value 
                          } 
                        })}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                        placeholder="Enter learning needs"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                      <input
                        type="text"
                        value={emrData.educationAssessment?.subject || ""}
                        onChange={(e) => setEmrData({ 
                          ...emrData, 
                          educationAssessment: { 
                            ...emrData.educationAssessment || {}, 
                            subject: e.target.value 
                          } 
                        })}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                        placeholder="Enter subject"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Learner</label>
                      <input
                        type="text"
                        value={emrData.educationAssessment?.learner || ""}
                        onChange={(e) => setEmrData({ 
                          ...emrData, 
                          educationAssessment: { 
                            ...emrData.educationAssessment || {}, 
                            learner: e.target.value 
                          } 
                        })}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                        placeholder="Enter learner details"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Method/Tools used</label>
                    <input
                      type="text"
                      value={emrData.educationAssessment?.methodToolsUsed || ""}
                      onChange={(e) => setEmrData({ 
                        ...emrData, 
                        educationAssessment: { 
                          ...emrData.educationAssessment || {}, 
                          methodToolsUsed: e.target.value 
                        } 
                      })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      placeholder="Enter methods and tools used"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Information understood/ able to demonstrate</label>
                    <input
                      type="text"
                      value={emrData.educationAssessment?.informationUnderstood || ""}
                      onChange={(e) => setEmrData({ 
                        ...emrData, 
                        educationAssessment: { 
                          ...emrData.educationAssessment || {}, 
                          informationUnderstood: e.target.value 
                        } 
                      })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      placeholder="Enter understanding assessment"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Prescription Section */}
            <div className="bg-white rounded-xl border border-gray-200 w-full">
              <div className="bg-[#f8fafc] p-4 border-b border-gray-100">
                <h3 className="font-medium text-gray-800 flex items-center gap-2">
                  <Pill className="h-4 w-4 text-brand" />
                  Prescriptions
                </h3>
                <button 
                  onClick={() => setEmrData(prev => ({
                    ...prev,
                    prescriptions: [...(prev.prescriptions || []), {
                      medication: "",
                      dosage: "",
                      frequency: "",
                      duration: "",
                      route: "",
                      instructions: ""
                    }]
                  }))}
                  className="mt-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs text-gray-700 flex items-center gap-1 transition-colors w-fit"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  Add Prescription
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medication</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosage</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(emrData.prescriptions || []).map((prescription, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={prescription.medication}
                            onChange={(e) => {
                              const updatedPrescriptions = [...(emrData.prescriptions || [])];
                              updatedPrescriptions[index] = {
                                ...updatedPrescriptions[index],
                                medication: e.target.value
                              };
                              setEmrData({ ...emrData, prescriptions: updatedPrescriptions });
                            }}
                            className="w-full text-sm rounded-md border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand/20 focus:border-brand"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={prescription.dosage}
                            onChange={(e) => {
                              const updatedPrescriptions = [...(emrData.prescriptions || [])];
                              updatedPrescriptions[index] = {
                                ...updatedPrescriptions[index],
                                dosage: e.target.value
                              };
                              setEmrData({ ...emrData, prescriptions: updatedPrescriptions });
                            }}
                            className="w-full text-sm rounded-md border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand/20 focus:border-brand"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={prescription.frequency}
                            onChange={(e) => {
                              const updatedPrescriptions = [...(emrData.prescriptions || [])];
                              updatedPrescriptions[index] = {
                                ...updatedPrescriptions[index],
                                frequency: e.target.value
                              };
                              setEmrData({ ...emrData, prescriptions: updatedPrescriptions });
                            }}
                            className="w-full text-sm rounded-md border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand/20 focus:border-brand"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={prescription.duration}
                            onChange={(e) => {
                              const updatedPrescriptions = [...(emrData.prescriptions || [])];
                              updatedPrescriptions[index] = {
                                ...updatedPrescriptions[index],
                                duration: e.target.value
                              };
                              setEmrData({ ...emrData, prescriptions: updatedPrescriptions });
                            }}
                            className="w-full text-sm rounded-md border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand/20 focus:border-brand"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={prescription.route}
                            onChange={(e) => {
                              const updatedPrescriptions = [...(emrData.prescriptions || [])];
                              updatedPrescriptions[index] = {
                                ...updatedPrescriptions[index],
                                route: e.target.value
                              };
                              setEmrData({ ...emrData, prescriptions: updatedPrescriptions });
                            }}
                            className="w-full text-sm rounded-md border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand/20 focus:border-brand"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={prescription.instructions}
                            onChange={(e) => {
                              const updatedPrescriptions = [...(emrData.prescriptions || [])];
                              updatedPrescriptions[index] = {
                                ...updatedPrescriptions[index],
                                instructions: e.target.value
                              };
                              setEmrData({ ...emrData, prescriptions: updatedPrescriptions });
                            }}
                            className="w-full text-sm rounded-md border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand/20 focus:border-brand"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              const updatedPrescriptions = [...(emrData.prescriptions || [])];
                              updatedPrescriptions.splice(index, 1);
                              setEmrData({ ...emrData, prescriptions: updatedPrescriptions });
                            }}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(emrData.prescriptions || []).length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-sm text-gray-500 text-center">No prescriptions added</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// In your SessionPage component, ensure this structure exists
export function SessionPage({ patientName, appointmentTime, appointmentType, onClose }: SessionPageProps) {
  const [showEMRForm, setShowEMRForm] = useState(false);
  
  // All other states and functions...

  // Make sure this is the first condition after your return statement
  if (showEMRForm) {
    return (
      <EMRForm
        patientName={patientName}
        appointmentTime={appointmentTime}
        appointmentType={appointmentType}
        initialEMRData={emrData}
        currentVitals={currentVitals}
        onClose={() => setShowEMRForm(false)}
        onSave={(updatedData) => {
          setEmrData(updatedData);
          setShowEMRForm(false);
        }}
      />
    );
  }

  // Then render your normal UI
  return (
    <div>
      {/* Your existing UI */}
    </div>
  );
}