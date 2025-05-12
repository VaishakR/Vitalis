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
import { AdminDashboard } from "../dashboards/admin-dashboard";

// Define the emirates options
const EMIRATES = ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Umm Al-Quwain", "Fujairah", "Ras Al Khaimah"];

// Define the admin signup schema
const adminSignupSchema = z.object({
  hospitalClinicName: z.string()
    .min(3, "Hospital/Clinic name must be at least 3 characters"),
  emirate: z.enum(EMIRATES as [string, ...string[]]),
  adminAccessCode: z.string()
    .min(1, "Admin access code is required"),
});

type AdminSignupFormData = z.infer<typeof adminSignupSchema>;

// Define the props for the admin signup form
interface AdminSignupFormProps {
  initialData: {
    fullName: string;
    email: string;
    password: string;
    phoneNumber: string;
    countryCode: string;
    role: UserRole;
  };
}

export function AdminSignupForm({ initialData }: AdminSignupFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted },
  } = useForm<AdminSignupFormData>({
    resolver: zodResolver(adminSignupSchema),
    defaultValues: {
      emirate: "Dubai",
    },
    mode: "onSubmit"
  });

  const onSubmit = async (data: AdminSignupFormData) => {
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
      console.log("Admin account created with data:", {
        ...initialData,
        ...data,
        uid: userCredential.user.uid,
      });

      setSuccessMessage("Admin account created successfully! Redirecting to dashboard...");
      
      // Redirect to admin dashboard after a short delay
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
    return <AdminDashboard />;
  }

  return (
    <div className="w-full max-w-md space-y-8 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          Admin Information
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Please provide your administrative details
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        <div className="space-y-4">
          {/* Hospital/Clinic Name */}
          <div>
            <Label htmlFor="hospitalClinicName">Hospital/Clinic Name</Label>
            <div className="mt-1">
              <Input
                id="hospitalClinicName"
                type="text"
                {...register("hospitalClinicName")}
                className={isSubmitted && errors.hospitalClinicName ? "border-red-500" : ""}
              />
              {isSubmitted && errors.hospitalClinicName && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.hospitalClinicName.message}
                </p>
              )}
            </div>
          </div>

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

          {/* Admin Access Code */}
          <div>
            <Label htmlFor="adminAccessCode">Admin Access Code</Label>
            <div className="mt-1">
              <Input
                id="adminAccessCode"
                type="text"
                {...register("adminAccessCode")}
                className={isSubmitted && errors.adminAccessCode ? "border-red-500" : ""}
              />
              {isSubmitted && errors.adminAccessCode && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.adminAccessCode.message}
                </p>
              )}
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