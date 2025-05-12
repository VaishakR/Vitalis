import { useState, useEffect } from "react";
import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";
import { WaveBackground } from "../ui/wave-background";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex flex-col p-4">
      <WaveBackground />
      
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-brand mb-2">Vitalis</h1>
        <p className="text-gray-600">Your Personal Health Companion</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        {isLogin ? <LoginForm /> : <SignupForm />}
        
        {/* Only show the toggle button if not logged in, moved closer to the form */}
        {!isLoggedIn && (
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="mt-2 text-sm text-gray-600 hover:text-brand transition-colors"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        )}
      </div>
    </div>
  );
} 