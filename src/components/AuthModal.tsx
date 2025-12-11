import { useState } from 'react';
import { X, Phone, ArrowRight, Shield, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useApp } from '@/contexts/AppContext';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

export default function AuthModal() {
  const { isAuthModalOpen, setAuthModalOpen, setUser } = useApp();
  const [step, setStep] = useState<'phone' | 'otp' | 'name'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');

  const handleSendOtp = () => {
    if (phone.length === 10) {
      setStep('otp');
    }
  };

  const handleVerifyOtp = () => {
    if (otp.length === 6) {
      setStep('name');
    }
  };

  const handleComplete = () => {
    setUser({
      id: '1',
      name: name,
      phone: phone,
      email: '',
      isVerified: false,
      isAadhaarVerified: false,
      isPhoneVerified: true,
      walletBalance: 0,
    });
    setAuthModalOpen(false);
    setStep('phone');
    setPhone('');
    setOtp('');
    setName('');
  };

  const handleBack = () => {
    if (step === 'otp') setStep('phone');
    if (step === 'name') setStep('otp');
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={setAuthModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {step !== 'phone' && (
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}
            <DialogTitle className="text-xl">
              {step === 'phone' && 'Login to Trapy'}
              {step === 'otp' && 'Verify OTP'}
              {step === 'name' && 'Almost there!'}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {step === 'phone' && (
            <>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-primary" />
                </div>
                <p className="text-muted-foreground">
                  Enter your phone number to continue
                </p>
              </div>

              <div className="flex gap-2">
                <div className="flex items-center px-3 bg-muted rounded-lg border border-input">
                  <span className="text-sm font-medium">+91</span>
                </div>
                <Input
                  type="tel"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="flex-1"
                />
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleSendOtp}
                disabled={phone.length !== 10}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          )}

          {step === 'otp' && (
            <>
              <div className="text-center">
                <p className="text-muted-foreground">
                  We sent a 6-digit code to <span className="font-medium text-foreground">+91 {phone}</span>
                </p>
              </div>

              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleVerifyOtp}
                disabled={otp.length !== 6}
              >
                Verify OTP
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Didn't receive code?{' '}
                <button className="text-primary font-medium hover:underline">
                  Resend
                </button>
              </p>
            </>
          )}

          {step === 'name' && (
            <>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-light flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-emerald" />
                </div>
                <p className="text-muted-foreground">
                  What should we call you?
                </p>
              </div>

              <Input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <Button
                className="w-full"
                size="lg"
                onClick={handleComplete}
                disabled={name.length < 2}
              >
                Let's Go!
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground border-t pt-4">
          <Shield className="w-3 h-3" />
          Your data is encrypted and secure
        </div>
      </DialogContent>
    </Dialog>
  );
}
