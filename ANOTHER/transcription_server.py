import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import speech_recognition as sr
import openai
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Get OpenAI API key from environment variable
openai_api_key = os.getenv("OPENAI_API_KEY") 
openai.api_key = openai_api_key

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400
    
    audio_file = request.files['audio']
    appointment_id = request.form.get('appointmentId', 'unknown')
    
    # Save the audio file temporarily
    temp_audio_path = f"temp_audio_{appointment_id}.wav"
    audio_file.save(temp_audio_path)
    
    # Use speech_recognition to transcribe
    recognizer = sr.Recognizer()
    transcript = ""
    
    try:
        with sr.AudioFile(temp_audio_path) as source:
            audio_data = recognizer.record(source)
            transcript = recognizer.recognize_google(audio_data)
    except Exception as e:
        print(f"Error transcribing: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        # Clean up the temporary file
        if os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)
    
    return jsonify({'transcript': transcript})

@app.route('/generate-emr', methods=['POST'])
def generate_emr():
    data = request.json
    transcript = data.get('transcript')
    appointment_id = data.get('appointmentId')
    
    if not transcript:
        return jsonify({'error': 'No transcript provided'}), 400
    
    try:
        # Use OpenAI to generate EMR from transcript
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a medical assistant that creates structured EMR reports from doctor-patient conversations. Format the report with these sections: Patient Information, Chief Complaint, History, Examination, Assessment, and Plan."},
                {"role": "user", "content": f"Generate a structured EMR report from this doctor-patient conversation: {transcript}"}
            ]
        )
        
        # Extract the generated EMR text
        emr_text = response['choices'][0]['message']['content']
        
        # Parse the text into a structured report format
        # This is a simplified version - in practice you'd need more robust parsing
        sections = ['Patient Information', 'Chief Complaint', 'History', 'Examination', 'Assessment', 'Plan']
        report = {}
        
        current_section = None
        section_text = ""
        
        for line in emr_text.split('\n'):
            matched = False
            for section in sections:
                if section in line:
                    if current_section:
                        report[current_section] = section_text.strip()
                    current_section = section.lower().replace(' ', '_')
                    section_text = ""
                    matched = True
                    break
            
            if not matched and current_section:
                section_text += line + "\n"
        
        # Add the last section
        if current_section and section_text:
            report[current_section] = section_text.strip()
        
        # Extract patient info from the patient information section
        patient_info = {
            "name": "Unknown",
            "age": "Unknown",
            "gender": "Unknown"
        }
        
        if 'patient_information' in report:
            info_text = report['patient_information']
            if 'name:' in info_text.lower():
                name_part = info_text.lower().split('name:')[1].split('\n')[0].strip()
                patient_info['name'] = name_part
            if 'age:' in info_text.lower():
                age_part = info_text.lower().split('age:')[1].split('\n')[0].strip()
                patient_info['age'] = age_part
            if 'gender:' in info_text.lower():
                gender_part = info_text.lower().split('gender:')[1].split('\n')[0].strip()
                patient_info['gender'] = gender_part
        
        # Format the final report
        formatted_report = {
            "patientInfo": patient_info,
            "chiefComplaint": report.get('chief_complaint', 'Not specified'),
            "history": report.get('history', 'Not specified'),
            "examination": report.get('examination', 'Not specified'),
            "assessment": report.get('assessment', 'Not specified'),
            "plan": report.get('plan', 'Not specified')
        }
        
        return jsonify({'report': formatted_report})
    
    except Exception as e:
        print(f"Error generating EMR: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/save-emr', methods=['POST'])
def save_emr():
    data = request.json
    emr_report = data.get('emrReport')
    appointment_id = data.get('appointmentId')
    
    if not emr_report:
        return jsonify({'error': 'No EMR report provided'}), 400
    
    try:
        # Save EMR to database or file system
        # For demonstration, we'll just save to a JSON file
        filename = f"emr_report_{appointment_id}.json"
        with open(filename, 'w') as f:
            json.dump(emr_report, f, indent=4)
        
        return jsonify({'message': 'EMR report saved successfully'})
    
    except Exception as e:
        print(f"Error saving EMR: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)