import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { 
  Mic, 
  MicOff, 
  Loader2, 
  CheckCircle2, 
  AlertCircle
} from "lucide-react";
import { 
  EMRData, 
  Vitals, 
  TranscriptionResponse
} from "../../types/medical";
import { EMRForm } from "../emr/EMRForm";

interface SessionPageProps {
  patientName: string;
  appointmentTime: string;
  appointmentType: string;
  onClose: () => void;
}

// Default EMR data for initialization
const defaultEMRData: EMRData = {
  consultationDetails: "",
  consultationType: "",
  chiefComplaint: "",
  otherComplaints: [],
  historyOfPresentIllness: {
    location: "",
    duration: "",
    quality: "",
    timing: "",
    severity: "",
    associatedSignsSymptoms: "",
    others: ""
  },
  reviewOfSymptoms: {
    constitutional: { fever: false, chills: false, nightSweats: false, fatigue: false },
    neurological: { headache: false, numbness: false, weakness: false, dizziness: false },
    cardiovascular: { chestPain: false, palpitations: false, dyspnea: false, heartbeatIrregular: false },
    musculoskeletal: { arthralgias: false, myalgias: false, swellingInJoints: false, others: false },
    endocrine: { excessThirst: false, polyuria: false, coldIntolerance: false, others: false },
    allergicImmun: { allergicRhinitis: false, asthma: false, hives: false, others: false },
    respiratory: { shortnessOfBreath: false, cough: false, others: false },
    genitourinary: { hematuria: false, dysuria: false, others: false },
    skin: { eczema: false, rash: false, pruritus: false, others: false },
    eyes: { redEye: false, decreasedVision: false, others: false },
    earNoseThroat: { soreThroat: false, decreasedHearing: false, others: false },
    hemLymphatic: { bleedingDiathesis: false, others: false },
    gastrointestinal: { abdominalPain: false, dyspepsiaDysphagia: false, heartburnReflux: false, others: false },
    psychiatric: { depression: false, anxiety: false, substanceAbuse: false, others: false }
  },
  physicalExamination: {
    constitutional: {
      recordThreeVitalSigns: "",
      nutritionGood: "",
      appearance: "",
      other: ""
    },
    neurological: {
      focalNeuroDeficits: "",
      asterixis: "",
      other: ""
    },
    cardiovascular: {
      heartSoundsAbnormal: "",
      pulseHeartRhythmAbnormal: "",
      peripheralEdema: "",
      other: ""
    },
    musculoskeletal: {
      normalGaitAndStation: "",
      clubbing: "",
      muscleWeakness: "",
      other: ""
    },
    endocrine: {
      excessThirst: "",
      polyuria: "",
      coldIntolerance: "",
      other: ""
    },
    allergicImmun: {
      allergicRhinitis: "",
      asthma: "",
      hives: "",
      other: ""
    },
    respiratory: {
      respiratoryEffortAbnormal: "",
      auscultationAbnormal: "",
      percussionAbnormal: "",
      other: ""
    },
    genitourinary: {
      hematuria: "",
      dysuria: "",
      other: ""
    },
    skin: {
      eczema: "",
      rash: "",
      decreasedTurgor: "",
      other: ""
    },
    eyes: {
      icterusPallor: "",
      abnormalIrisPupils: "",
      other: ""
    },
    earNoseThroat: {
      noseEarsAbnormal: "",
      pharyngealErythema: "",
      other: ""
    },
    neck: {
      massesLymphNodes: "",
      thyromegaly: "",
      other: ""
    },
    gastrointestinal: {
      abnormalityUponInspection: "",
      tendernessGuarding: "",
      auscultationPercussionAbdomenAbnormal: "",
      other: ""
    },
    psychiatric: {
      inappropriateAffect: "",
      abnormalJudgementAndInsight: "",
      disorientationToTimePlacePerson: "",
      other: ""
    }
  },
  painScreening: {
    pain: "",
    location: "",
    duration: "",
    frequency: "",
    character: "",
    management: "",
    score: ""
  },
  specialNeedsScreening: {
    nutritional: "",
    psychological: "",
    functional: "",
    socioeconomic: "",
    specializedAssessment: "",
    spiritualCultural: "",
    suspectedAbuse: ""
  },
  pastMedicalHistory: "Type 2 Diabetes diagnosed in 2018\nHypertension since 2015\nAppendectomy in 2010",
  familyHistory: "Father: Hypertension, died at 72 from MI\nMother: Type 2 Diabetes, Alive\nSibling: No significant conditions",
  socialHistory: "Married, lives with spouse\nWorks as a software engineer\nExercises 2-3 times per week",
  economicStatus: "Middle class, stable employment\nPrivate health insurance",
  tobaccoDrugUse: "Current smoker - 1 pack per day, Occasional marijuana use",
  tobaccoDrugHistory: "Started smoking at age 20, attempted quitting twice in the past 5 years",
  currentVitalsData: {
    bp: "",
    pulse: "",
    temp: "",
    spo2: "",
    respiratoryRate: "",
    weight: ""
  },
  allergyDetails: [
    {
      type: "Drug",
      description: "Penicillin",
      dateOfOnset: "2015-03-15",
      reaction: "Hives, Difficulty breathing",
      status: "Active",
      severity: "Severe"
    },
    {
      type: "Food",
      description: "Peanuts",
      dateOfOnset: "2010-01-20",
      reaction: "Anaphylaxis",
      status: "Active",
      severity: "Severe"
    },
    {
      type: "Environmental",
      description: "Pollen",
      dateOfOnset: "2018-05-10",
      reaction: "Sneezing, Watery eyes",
      status: "Active",
      severity: "Moderate"
    }
  ],
  prescriptions: []
};

export function SessionPage({ patientName, appointmentTime, appointmentType, onClose }: SessionPageProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionDone, setTranscriptionDone] = useState(false);
  const [showEMRForm, setShowEMRForm] = useState(false);
  const [currentVitals, setCurrentVitals] = useState<Vitals>({
    bp: "",
    pulse: "",
    temp: "",
    spo2: "",
    respiratoryRate: "",
    weight: ""
  });
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [transcriptionText, setTranscriptionText] = useState<string>("");
  const [transcriptionSocket, setTranscriptionSocket] = useState<WebSocket | null>(null);
  const [emrData, setEmrData] = useState<EMRData>(defaultEMRData);
  
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    
    const connectWebSocket = () => {
      if (reconnectAttempts >= maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        return;
      }

      try {
        ws = new WebSocket('ws://localhost:8000/transcription');
        
        ws.onopen = () => {
          console.log('Connected to transcription server');
          reconnectAttempts = 0;
          setTranscriptionSocket(ws);
        };
        
        ws.onmessage = (event) => {
          try {
            // First, validate that the response is proper JSON
            let rawData = event.data;
            if (typeof rawData === 'string') {
              // Try to fix common JSON formatting issues
              rawData = rawData.trim();
              // Ensure the string starts with { and ends with }
              if (!rawData.startsWith('{')) {
                rawData = '{' + rawData;
              }
              if (!rawData.endsWith('}')) {
                rawData = rawData + '}';
              }
              // Fix any missing quotes around property names
              rawData = rawData.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
            }

            const data = JSON.parse(rawData) as TranscriptionResponse;
            console.log('Received WebSocket message:', data);
            
            if (data.type === 'transcription') {
              setTranscriptionText(prev => prev + ' ' + data.text);
            } else if (data.type === 'final_analysis') {
              // Validate the analysis object structure
              if (!data.analysis) {
                throw new Error('Missing analysis data in response');
              }

              // Log the complete analysis data
              console.log('Raw API Response:', data);
              console.log('Analysis Data:', data.analysis);
              console.log('Physical Exam Data:', data.analysis?.physicalExamination);
              console.log('Pain Screening Data:', data.analysis?.painScreening);
              
              // Update EMR data with the analysis and include current vitals
              setEmrData(prevData => {
                const newData = {
                  ...prevData,
                  consultationDetails: data.analysis?.consultationDetails || '',
                  consultationType: data.analysis?.consultationType || '',
                  chiefComplaint: data.analysis?.chiefComplaint || '',
                  otherComplaints: data.analysis?.otherComplaints || [],
                  historyOfPresentIllness: {
                    location: data.analysis?.historyOfPresentIllness?.location || '',
                    duration: data.analysis?.historyOfPresentIllness?.duration || '',
                    quality: data.analysis?.historyOfPresentIllness?.quality || '',
                    timing: data.analysis?.historyOfPresentIllness?.timing || '',
                    severity: data.analysis?.historyOfPresentIllness?.severity || '',
                    associatedSignsSymptoms: data.analysis?.historyOfPresentIllness?.associatedSignsSymptoms || '',
                    others: data.analysis?.historyOfPresentIllness?.others || ''
                  },
                  // Update Review of Symptoms based on LLM analysis
                  reviewOfSymptoms: {
                    ...prevData.reviewOfSymptoms,
                    ...(data.analysis?.reviewOfSymptoms || {})
                  },
                  // Add physical examination data
                  physicalExamination: data.analysis?.physicalExamination ? {
                    ...prevData.physicalExamination,
                    ...Object.entries(data.analysis.physicalExamination).reduce((acc, [system, findings]) => {
                      acc[system] = {
                        ...prevData.physicalExamination[system],
                        ...findings
                      };
                      return acc;
                    }, {} as Record<string, Record<string, string>>)
                  } : prevData.physicalExamination,
                  // Add pain screening data
                  painScreening: data.analysis?.painScreening ? {
                    ...prevData.painScreening,
                    ...data.analysis.painScreening
                  } : prevData.painScreening,
                  // Add diagnosis details
                  diagnosisDetails: data.analysis?.diagnosisDetails || [],
                  // Add investigation details
                  investigationDetails: data.analysis?.investigationDetails || [],
                  // Add prescriptions
                  prescriptions: data.analysis?.prescriptions || [],
                  currentVitalsData: {
                    bp: currentVitals.bp,
                    pulse: currentVitals.pulse,
                    temp: currentVitals.temp,
                    spo2: currentVitals.spo2,
                    respiratoryRate: currentVitals.respiratoryRate,
                    weight: currentVitals.weight
                  }
                };
                
                // Log the data being set
                console.log('Setting EMR Data:', newData);
                return newData;
              });
              
              // Handle navigation
              setIsGeneratingReport(false);
              setTranscriptionDone(true);
            } else if (data.type === 'error') {
              console.error('Server error:', data.message);
              alert(`An error occurred: ${data.message}`);
              setIsRecording(false);
              setIsTranscribing(false);
              setIsGeneratingReport(false);
            }
          } catch (error) {
            console.error('Error processing WebSocket message:', error);
            console.error('Raw message data:', event.data);
            alert('An error occurred while processing the server response');
            setIsRecording(false);
            setIsTranscribing(false);
            setIsGeneratingReport(false);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          ws?.close();
        };

        ws.onclose = () => {
          console.log('Disconnected from transcription server');
          setTranscriptionSocket(null);
          
          if (isRecording || isTranscribing || isGeneratingReport) {
            setIsRecording(false);
            setIsTranscribing(false);
            setIsGeneratingReport(false);
            alert('Lost connection to transcription server. Please try again.');
          }
          
          // Attempt to reconnect after a delay
          setTimeout(() => {
            reconnectAttempts++;
            connectWebSocket();
          }, 2000);
        };
      } catch (error) {
        console.error('Error creating WebSocket:', error);
      }
    };

    connectWebSocket();

    return () => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []); // Remove dependencies to prevent recreation of WebSocket

  const handleStartRecording = () => {
    if (!currentVitals.bp || !currentVitals.pulse || !currentVitals.temp || !currentVitals.spo2) {
      alert("Please fill in the required vitals before starting the session");
      return;
    }
    
    if (!transcriptionSocket || transcriptionSocket.readyState !== WebSocket.OPEN) {
      alert("Not connected to transcription server. Please wait for reconnection or refresh the page.");
      return;
    }

    setIsRecording(true);
    setIsTranscribing(true);
    setTranscriptionText("");  // Clear previous transcription
    transcriptionSocket.send(JSON.stringify({ command: 'start' }));
  };

  const handleStopRecording = () => {
    if (!transcriptionSocket || transcriptionSocket.readyState !== WebSocket.OPEN) {
      alert("Lost connection to transcription server. Please refresh the page and try again.");
      setIsRecording(false);
      setIsTranscribing(false);
      return;
    }

    setIsRecording(false);
    setIsTranscribing(false);
    setIsGeneratingReport(true);
    transcriptionSocket.send(JSON.stringify({ command: 'stop' }));
  };

  const handleEMRSave = (updatedData: EMRData) => {
    // Handle saving the EMR data
    console.log('EMR data saved:', updatedData);
    alert('EMR data saved successfully!');
    // Here you would typically send this data to a backend API
  };

  // Conditional rendering - either show the transcription interface or the EMR form
  if (showEMRForm) {
    return (
      <EMRForm
        patientName={patientName}
        appointmentTime={appointmentTime}
        appointmentType={appointmentType}
        initialEMRData={emrData}
        currentVitals={currentVitals}
        onClose={() => setShowEMRForm(false)}
        onSave={handleEMRSave}
      />
    );
  }

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{patientName}</h1>
              <p className="text-gray-600">{appointmentTime} - {appointmentType}</p>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close Session
            </Button>
          </div>
        </div>
      </header>

      <main>
        <div className="container mx-auto px-4 py-6">
          {/* Recording Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vitals Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Patient Vitals</h3>
                  <p className="text-sm text-gray-500 mt-1">Record patient vitals before starting the session</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">
                      Blood Pressure <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        placeholder="120/80"
                        value={currentVitals.bp}
                        onChange={(e) => setCurrentVitals({ ...currentVitals, bp: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      />
                      <span className="ml-2 text-sm text-gray-500">mmHg</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">
                      Pulse Rate <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        placeholder="70"
                        value={currentVitals.pulse}
                        onChange={(e) => setCurrentVitals({ ...currentVitals, pulse: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      />
                      <span className="ml-2 text-sm text-gray-500">bpm</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">
                      Temperature <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        placeholder="98.6"
                        value={currentVitals.temp}
                        onChange={(e) => setCurrentVitals({ ...currentVitals, temp: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      />
                      <span className="ml-2 text-sm text-gray-500">°F</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">
                      SpO2 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        placeholder="98"
                        value={currentVitals.spo2}
                        onChange={(e) => setCurrentVitals({ ...currentVitals, spo2: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      />
                      <span className="ml-2 text-sm text-gray-500">%</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">
                      Respiratory Rate
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        placeholder="16"
                        value={currentVitals.respiratoryRate}
                        onChange={(e) => setCurrentVitals({ ...currentVitals, respiratoryRate: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      />
                      <span className="ml-2 text-sm text-gray-500">breaths/min</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">
                      Weight
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        placeholder="70"
                        value={currentVitals.weight}
                        onChange={(e) => setCurrentVitals({ ...currentVitals, weight: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      />
                      <span className="ml-2 text-sm text-gray-500">kg</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Transcription Area */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="flex flex-col items-center justify-center p-6 min-h-[320px]">
                {/* Recording Button and Status */}
                <div className="relative mb-8">
                  <div className="relative z-10">
                    {!isRecording && !isGeneratingReport && !transcriptionDone && (
                      <Button 
                        size="lg"
                        className="bg-brand hover:bg-brand/90 h-24 w-24 rounded-full p-0 shadow-lg hover:shadow-brand/25 transition-all duration-300 relative group"
                        onClick={handleStartRecording}
                      >
                        <div className="absolute inset-0 bg-brand rounded-full opacity-0 group-hover:opacity-20 scale-110 transition-all duration-300" />
                        <Mic className="h-12 w-12 transition-transform duration-300 group-hover:scale-110" />
                      </Button>
                    )}
                    {isRecording && (
                      <Button 
                        size="lg"
                        variant="destructive"
                        className="h-24 w-24 rounded-full p-0 shadow-lg hover:shadow-red-500/25 transition-all duration-300 relative group"
                        onClick={handleStopRecording}
                      >
                        <div className="absolute inset-0 bg-red-500 rounded-full opacity-0 group-hover:opacity-20 scale-110 transition-all duration-300" />
                        <MicOff className="h-12 w-12 transition-transform duration-300 group-hover:scale-110" />
                      </Button>
                    )}
                  </div>
                  
                  {/* Animated Rings */}
                  {isRecording && (
                    <>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full bg-red-500/10 animate-recording-ring" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-36 w-36 rounded-full bg-red-500/5 animate-recording-ring [animation-delay:0.3s]" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 rounded-full bg-red-500/5 animate-recording-ring [animation-delay:0.6s]" />
                    </>
                  )}
                </div>
                
                {/* Button Guidance Text */}
                {!isRecording && !isGeneratingReport && !transcriptionDone && (
                  <p className="text-sm text-gray-500 mb-4">
                    Click the microphone button to start recording your consultation.
                    <br />
                    Make sure to fill in the patient vitals first.
                  </p>
                )}
                {isRecording && (
                  <p className="text-sm text-red-500 mb-4">
                    Recording in progress... Click the button again to stop.
                  </p>
                )}
                
                {/* Status Area */}
                <div className="w-full max-w-sm">
                  {/* Recording and Transcribing Status */}
                  {isRecording && (
                    <div className="bg-brand/5 border border-brand/10 shadow-sm rounded-2xl p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-2.5 w-2.5 rounded-full bg-brand animate-pulse" />
                          <span className="text-base font-medium text-brand">Recording</span>
                        </div>
                        <div className="flex gap-1">
                          {[...Array(4)].map((_, i) => (
                            <div 
                              key={i}
                              className="h-3 w-0.75 bg-brand rounded-full animate-sound-wave"
                              style={{ animationDelay: `${i * 0.15}s` }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Live Transcription Display */}
                      <div className="mt-4 p-4 bg-white/50 rounded-lg border border-brand/10">
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {transcriptionText || "Listening..."}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Generating Report Status */}
                  {isGeneratingReport && (
                    <div className="bg-yellow-50 border border-yellow-200 shadow-sm rounded-2xl p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Loader2 className="h-4 w-4 text-yellow-600 animate-spin" />
                          <span className="text-base font-medium text-yellow-700">Generating EMR</span>
                        </div>
                      </div>
                      <p className="text-sm text-yellow-600">
                        AI is analyzing the conversation and generating a structured medical record. This may take a few moments...
                      </p>
                    </div>
                  )}

                  {/* Completed Status */}
                  {transcriptionDone && !isGeneratingReport && !isRecording && (
                    <div className="bg-green-50 border border-green-200 shadow-sm rounded-2xl p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-base font-medium text-green-700">Analysis Complete</span>
                        </div>
                      </div>
                      <p className="text-sm text-green-600">
                        Transcription and analysis completed. Your EMR is ready to view.
                      </p>
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700 text-white" 
                        onClick={() => setShowEMRForm(true)}
                      >
                        View EMR
                      </Button>
                    </div>
                  )}

                  {/* Error Status (would be shown conditionally) */}
                  {false && (
                    <div className="bg-red-50 border border-red-200 shadow-sm rounded-2xl p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <span className="text-base font-medium text-red-700">Error</span>
                        </div>
                      </div>
                      <p className="text-sm text-red-600">
                        An error occurred while processing your recording. Please try again.
                      </p>
                      <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                        Restart Recording
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}