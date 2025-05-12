import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { auth } from "../../lib/firebase";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { PatientSignupForm } from "./patient-signup-form";
import { DoctorSignupForm } from "./doctor-signup-form";
import { AdminSignupForm } from "./admin-signup-form";

// Define the role type
export type UserRole = "patient" | "doctor" | "admin";

// Define the initial signup schema
const initialSignupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  confirmPassword: z.string(),
  phoneNumber: z.string()
    .min(9, "Phone number must be at least 9 digits")
    .regex(/^\d+$/, "Phone number must contain only digits"),
  countryCode: z.string(),
  role: z.enum(["patient", "doctor", "admin"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type InitialSignupFormData = z.infer<typeof initialSignupSchema>;

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<"initial" | "role-specific">("initial");
  const [formData, setFormData] = useState<InitialSignupFormData | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted },
    watch,
  } = useForm<InitialSignupFormData>({
    resolver: zodResolver(initialSignupSchema),
    defaultValues: {
      countryCode: "050", // Default UAE number prefix
      role: "patient",
    },
    mode: "onSubmit" // Only validate on submit
  });

  const selectedRole = watch("role");

  const onInitialSubmit = async (data: InitialSignupFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Store the form data for the next step
      setFormData(data);
      
      // Move to the role-specific step
      setCurrentStep("role-specific");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred during signup.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Render the appropriate form based on the current step
  if (currentStep === "role-specific" && formData) {
    switch (formData.role) {
      case "patient":
        return <PatientSignupForm initialData={formData} />;
      case "doctor":
        return <DoctorSignupForm initialData={formData} />;
      case "admin":
        return <AdminSignupForm initialData={formData} />;
    }
  }

  // Render the initial signup form
  return (
    <div className="w-full max-w-md space-y-8 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          Create an account
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Join Vitalis today
        </p>
      </div>

      <form onSubmit={handleSubmit(onInitialSubmit)} className="mt-8 space-y-6">
        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <div className="mt-1">
              <Input
                id="fullName"
                type="text"
                autoComplete="name"
                {...register("fullName")}
                className={isSubmitted && errors.fullName ? "border-red-500" : ""}
              />
              {isSubmitted && errors.fullName && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.fullName.message}
                </p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email address</Label>
            <div className="mt-1">
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
                className={isSubmitted && errors.email ? "border-red-500" : ""}
              />
              {isSubmitted && errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          {/* Phone Number with Country Code */}
          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <div className="mt-1 flex gap-2">
              <select
                id="countryCode"
                {...register("countryCode")}
                className="w-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="050">050</option>
                <option value="055">055</option>
                <option value="052">052</option>
                <option value="054">054</option>
                <option value="056">056</option>
                <option value="058">058</option>
              </select>
              <Input
                id="phoneNumber"
                type="tel"
                autoComplete="tel"
                {...register("phoneNumber")}
                className={`flex-1 ${isSubmitted && errors.phoneNumber ? "border-red-500" : ""}`}
                placeholder="XXXXXXX"
              />
            </div>
            {isSubmitted && errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-500">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="mt-1 relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                {...register("password")}
                className={`${isSubmitted && errors.password ? "border-red-500" : ""} pr-10`}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                )}
              </span>
              {isSubmitted && errors.password && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="mt-1 relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                {...register("confirmPassword")}
                className={`${isSubmitted && errors.confirmPassword ? "border-red-500" : ""} pr-10`}
              />
              <span
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                )}
              </span>
              {isSubmitted && errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <Label htmlFor="role">I am a</Label>
            <div className="mt-1">
              <select
                id="role"
                {...register("role")}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
              </select>
              {isSubmitted && errors.role && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.role.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-500 text-center">{error}</div>
        )}

        <Button
          type="submit"
          className="w-full bg-brand hover:bg-brand/90"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </form>
    </div>
  );
} 