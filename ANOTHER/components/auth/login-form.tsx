import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { auth } from "../../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { PatientDashboard } from "../dashboards/patient-dashboard";
import { DoctorDashboard } from "../dashboards/doctor-dashboard";
import { AdminDashboard } from "../dashboards/admin-dashboard";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

// For demo purposes, we'll use a simple mapping of email domains to roles
const getUserRole = (email: string): "patient" | "doctor" | "admin" => {
  if (email.includes("doctor")) {
    return "doctor";
  } else if (email.includes("admin")) {
    return "admin";
  } else {
    return "patient";
  }
};

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<"patient" | "doctor" | "admin" | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit"
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await signInWithEmailAndPassword(auth, data.email, data.password);
      
      // Determine user role based on email (in a real app, this would come from Firestore)
      const role = getUserRole(data.email);
      setUserRole(role);
      
      console.log(`Logged in successfully as ${role}`);
    } catch (err) {
      if (err instanceof Error) {
        // Handle specific Firebase errors
        if (err.message.includes("user-not-found")) {
          setError("No account found with this email. Please sign up first.");
        } else if (err.message.includes("wrong-password")) {
          setError("Incorrect password. Please try again.");
        } else if (err.message.includes("too-many-requests")) {
          setError("Too many failed attempts. Please try again later.");
        } else {
          setError(err.message);
        }
      } else {
        setError("An error occurred during login.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Render the appropriate dashboard based on user role
  if (userRole === "patient") {
    return <PatientDashboard />;
  } else if (userRole === "doctor") {
    return <DoctorDashboard />;
  } else if (userRole === "admin") {
    return <AdminDashboard />;
  }

  // Render the login form if no user is logged in
  return (
    <div className="w-full max-w-md space-y-8 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Sign in to your account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        <div className="space-y-4">
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

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="mt-1 relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
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
            <div className="flex justify-end mt-1">
              <button 
                type="button" 
                className="text-xs text-brand hover:text-brand/80"
                onClick={() => alert("Password reset functionality will be implemented soon.")}
              >
                Forgot password?
              </button>
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
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>
    </div>
  );
} 