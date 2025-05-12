import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Mic, StopCircle } from 'lucide-react';
import './VoiceTranscription.css';

const VoiceTranscription = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [emrReport, setEmrReport] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);

  // Sample patient data (in a real app, this would come from your database)
  const patientData = {
    app1: { name: "John Doe", age: "45", gender: "Male" },
    app2: { name: "Jane Smith", age: "38", gender: "Female" },
    app3: { name: "Robert Johnson", age: "62", gender: "Male" },
    // Add more as needed
  };

  useEffect(() => {
    // Initialize speech recognition if available in browser
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptText = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptText;
          } else {
            interimTranscript += transcriptText;
          }
        }

        setTranscript(prevTranscript => prevTranscript + finalTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
      };
    } else {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
      };

      mediaRecorderRef.current.start();
      
      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
      
      setIsRecording(true);
      setTranscript('');
      setEmrReport(null);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access the microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      setIsRecording(false);
    }
  };

  const generateEMR = async () => {
    if (!transcript.trim()) {
      alert('Please record a conversation first before generating an EMR report.');
      return;
    }

    setIsProcessing(true);
    
    // Simulate API processing time
    setTimeout(() => {
      // Generate a mock EMR report based on the transcript
      const patient = patientData[appointmentId] || { 
        name: "Unknown Patient", 
        age: "Unknown", 
        gender: "Not specified" 
      };
      
      // Extract potential medical information from transcript
      let chiefComplaint = "Not specified";
      if (transcript.toLowerCase().includes("pain")) {
        chiefComplaint = "Patient reports pain";
      } else if (transcript.toLowerCase().includes("fever")) {
        chiefComplaint = "Patient reports fever";
      } else if (transcript.toLowerCase().includes("cough")) {
        chiefComplaint = "Patient reports cough";
      }
      
      const mockReport = {
        patientInfo: {
          name: patient.name,
          age: patient.age,
          gender: patient.gender
        },
        chiefComplaint: chiefComplaint,
        history: "Patient history based on conversation transcript. This is a mock report as no backend is available.",
        examination: "Examination findings noted during the visit.",
        assessment: "Medical assessment based on patient symptoms and examination.",
        plan: "Treatment plan and follow-up recommendations."
      };
      
      setEmrReport(mockReport);
      setIsProcessing(false);
    }, 2000);
  };

  const saveEMR = () => {
    if (!emrReport) return;

    // Without a backend, we'll simulate saving by showing a success message
    alert('EMR Report saved successfully (simulated)');
    
    // Navigate back to appointments page
    navigate('/appointments');
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-emerald-600 hover:text-emerald-700 mb-6"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="ml-1">Back</span>
        </button>
        
        <h1 className="text-2xl font-bold mb-6">Appointment Recording</h1>
        <div className="text-sm text-gray-600 mb-6">Appointment ID: {appointmentId}</div>
        
        <div className="flex justify-center mb-8">
          <button
            className={`w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all
              ${isRecording 
                ? 'bg-red-500 text-white shadow-lg shadow-red-300 recording-pulse' 
                : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
          >
            {isRecording ? (
              <>
                <StopCircle className="h-12 w-12 mb-2" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Mic className="h-12 w-12 mb-2" />
                <span>Record</span>
              </>
            )}
          </button>
        </div>
        
        {audioUrl && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Review Recording</h3>
            <audio 
              controls 
              src={audioUrl} 
              className="w-full max-w-md mx-auto"
            ></audio>
          </div>
        )}
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Transcription</h3>
          <div className="min-h-[200px] max-h-[400px] overflow-y-auto p-4 border border-gray-200 rounded-lg bg-gray-50 font-mono text-sm">
            {transcript ? transcript : "Transcription will appear here..."}
          </div>
        </div>
        
        <div className="flex justify-center space-x-4">
          <button
            className={`px-6 py-2 rounded-lg font-medium flex items-center justify-center
              ${isProcessing || !transcript || isRecording
                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
            onClick={generateEMR}
            disabled={isProcessing || !transcript || isRecording}
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing...
              </>
            ) : "Generate EMR Report"}
          </button>
          
          <button
            className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
            onClick={() => navigate('/appointments')}
            disabled={isRecording || isProcessing}
          >
            Cancel
          </button>
        </div>
      </div>

      {emrReport && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-2xl font-bold mb-6">Generated EMR Report</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Patient Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>Name:</strong> {emrReport.patientInfo.name}</p>
                <p><strong>Age:</strong> {emrReport.patientInfo.age}</p>
                <p><strong>Gender:</strong> {emrReport.patientInfo.gender}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Chief Complaint</h3>
              <div className="bg-gray-50 p-4 rounded-lg h-full">
                <p>{emrReport.chiefComplaint}</p>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">History</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p>{emrReport.history}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Examination</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p>{emrReport.examination}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Assessment</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p>{emrReport.assessment}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Plan</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p>{emrReport.plan}</p>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
              onClick={saveEMR}
              disabled={isProcessing}
            >
              Save EMR Report
            </button>
            <button
              className="px-6 py-2 rounded-lg border border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-medium"
              onClick={() => setEmrReport(null)}
            >
              Edit Transcript
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceTranscription;