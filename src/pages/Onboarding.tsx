import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Upload, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/useAuth';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [gender, setGender] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { updateProfile, user } = useAuth();
  const navigate = useNavigate();

  const handleGenderSubmit = () => {
    if (gender) {
      setStep(2);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    const { error } = await updateProfile({ gender } as any);
    
    if (!error) {
      navigate('/');
    }
    
    setIsLoading(false);
  };

  const handleSkip = async () => {
    if (gender) {
      await updateProfile({ gender } as any);
    }
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2].map((i) => (
            <div
              key={i}
              className={`w-12 h-1 rounded-full transition-colors ${
                i <= step ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>

        <div className="bg-card rounded-3xl shadow-2xl p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-indigo-light flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Select Your Gender</h2>
                <p className="text-muted-foreground mt-2">
                  This helps us show you relevant ride options
                </p>
              </div>

              <RadioGroup value={gender} onValueChange={setGender} className="space-y-3">
                <div className={`flex items-center space-x-3 border rounded-xl p-4 cursor-pointer transition-colors ${gender === 'male' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male" className="cursor-pointer flex-1">Male</Label>
                </div>
                <div className={`flex items-center space-x-3 border rounded-xl p-4 cursor-pointer transition-colors ${gender === 'female' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female" className="cursor-pointer flex-1">Female</Label>
                  <span className="text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded-full">Women-only rides</span>
                </div>
                <div className={`flex items-center space-x-3 border rounded-xl p-4 cursor-pointer transition-colors ${gender === 'other' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other" className="cursor-pointer flex-1">Other</Label>
                </div>
              </RadioGroup>

              <Button onClick={handleGenderSubmit} className="w-full" size="lg" disabled={!gender}>
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-light flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-emerald" />
                </div>
                <h2 className="text-2xl font-bold">Verify Your Identity</h2>
                <p className="text-muted-foreground mt-2">
                  Upload Aadhaar card for verification (optional)
                </p>
              </div>

              {/* Upload Zone */}
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag & drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG up to 5MB
                </p>
              </div>

              <div className="bg-muted/50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Why verify?</p>
                    <p className="text-muted-foreground">
                      Verified users get instant booking approval and higher trust scores.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleSkip} className="flex-1">
                  Skip for now
                </Button>
                <Button onClick={handleComplete} className="flex-1" disabled={isLoading}>
                  {isLoading ? 'Please wait...' : 'Complete Setup'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
