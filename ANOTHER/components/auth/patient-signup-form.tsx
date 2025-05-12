import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { auth } from "../../lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { UserRole } from "./signup-form";
import { PatientDashboard } from "../dashboards/patient-dashboard";

// Define the emirates options
const EMIRATES = ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Umm Al-Quwain", "Fujairah", "Ras Al Khaimah"];

// Define the patient signup schema
const patientSignupSchema = z.object({
  emirate: z.enum(EMIRATES as [string, ...string[]]),
  dob: z.string().refine(val => {
    const date = new Date(val);
    const today = new Date();
    return date < today;
  }, { message: "Date of birth must be in the past" }),
  gender: z.enum(["male", "female", "other"]),
  emiratesId: z.string()
    .min(15, "Emirates ID must be 15 digits")
    .max(15, "Emirates ID must be 15 digits")
    .regex(/^\d{3}-\d{4}-\d{7}-\d{1}$/, "Emirates ID format should be XXX-XXXX-XXXXXXX-X"),
  insuranceProvider: z.string().optional(),
  insuranceCardNumber: z.string().optional(),
});

type PatientSignupFormData = z.infer<typeof patientSignupSchema>;

// Define the props for the patient signup form
interface PatientSignupFormProps {
  initialData: {
    fullName: string;
    email: string;
    password: string;
    phoneNumber: string;
    countryCode: string;
    role: UserRole;
  };
}

export function PatientSignupForm({ initialData }: PatientSignupFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted },
  } = useForm<PatientSignupFormData>({
    resolver: zodResolver(patientSignupSchema),
    defaultValues: {
      emirate: "Dubai",
      gender: "male",
    },
    mode: "onSubmit"
  });

  const onSubmit = async (data: PatientSignupFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      // Create the user with Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        initialData.email,
        initialData.password
      );

      // Update the user profile with additional information
      await updateProfile(userCredential.user, {
        displayName: initialData.fullName,
      });

      // Here you would typically store the additional user data in Firestore
      // For now, we'll just log it
      console.log("Patient account created with data:", {
        ...initialData,
        ...data,
        uid: userCredential.user.uid,
      });

      setSuccessMessage("Patient account created successfully! Redirecting to dashboard...");
      
      // Redirect to patient dashboard after a short delay
      setTimeout(() => {
        setIsRegistered(true);
      }, 1500);
      
    } catch (err) {
      if (err instanceof Error) {
        // Handle specific Firebase errors
        if (err.message.includes("email-already-in-use")) {
          setError("This email is already registered. Please try logging in instead.");
        } else {
          setError(err.message);
        }
      } else {
        setError("An error occurred during signup.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect to dashboard if registration is complete
  if (isRegistered) {
    return <PatientDashboard />;
  }

  return (
    <div className="w-full max-w-md space-y-8 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          Patient Information
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Please provide your medical details
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        <div className="space-y-4">
          {/* Emirate */}
          <div>
            <Label htmlFor="emirate">Emirate</Label>
            <div className="mt-1">
              <select
                id="emirate"
                {...register("emirate")}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {EMIRATES.map((emirate) => (
                  <option key={emirate} value={emirate}>
                    {emirate}
                  </option>
                ))}
              </select>
              {isSubmitted && errors.emirate && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.emirate.message}
                </p>
              )}
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <Label htmlFor="dob">Date of Birth</Label>
            <div className="mt-1">
              <Input
                id="dob"
                type="date"
                {...register("dob")}
                className={isSubmitted && errors.dob ? "border-red-500" : ""}
              />
              {isSubmitted && errors.dob && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.dob.message}
                </p>
              )}
            </div>
          </div>

          {/* Gender */}
          <div>
            <Label htmlFor="gender">Gender</Label>
            <div className="mt-1">
              <select
                id="gender"
                {...register("gender")}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {isSubmitted && errors.gender && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.gender.message}
                </p>
              )}
            </div>
          </div>

          {/* Emirates ID */}
          <div>
            <Label htmlFor="emiratesId">Emirates ID Number</Label>
            <div className="mt-1">
              <Input
                id="emiratesId"
                type="text"
                placeholder="XXX-XXXX-XXXXXXX-X"
                {...register("emiratesId")}
                className={isSubmitted && errors.emiratesId ? "border-red-500" : ""}
              />
              {isSubmitted && errors.emiratesId && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.emiratesId.message}
                </p>
              )}
            </div>
          </div>

          {/* Insurance Provider (Optional) */}
          <div>
            <Label htmlFor="insuranceProvider">
              Insurance Provider (Optional)
            </Label>
            <div className="mt-1">
              <Input
                id="insuranceProvider"
                type="text"
                {...register("insuranceProvider")}
              />
            </div>
          </div>

          {/* Insurance Card Number (Optional) */}
          <div>
            <Label htmlFor="insuranceCardNumber">
              Insurance Card Number (Optional)
            </Label>
            <div className="mt-1">
              <Input
                id="insuranceCardNumber"
                type="text"
                {...register("insuranceCardNumber")}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-500 text-center">{error}</div>
        )}
        
        {successMessage && (
          <div className="text-sm text-green-600 text-center">{successMessage}</div>
        )}

        <Button
          type="submit"
          className="w-full bg-brand hover:bg-brand/90"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Sign up"
          )}
        </Button>
      </form>
    </div>
  );
} 