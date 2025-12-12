import { useState } from 'react';
import { Upload, FileText, CheckCircle, Clock, XCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function Verification() {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState<string | null>(null);

  const documents = [
    {
      id: 'aadhaar',
      name: 'Aadhaar Card',
      description: 'Government issued identity card',
      status: profile?.aadhaar_status || 'pending',
      isVerified: profile?.is_aadhaar_verified || false,
      icon: FileText,
    },
    {
      id: 'driving_license',
      name: 'Driving License',
      description: 'Required for offering rides',
      status: profile?.dl_status || 'pending',
      isVerified: profile?.is_dl_verified || false,
      icon: FileText,
    },
  ];

  const getStatusBadge = (status: string, isVerified: boolean) => {
    if (isVerified) {
      return (
        <div className="flex items-center gap-1 text-emerald bg-emerald-light px-3 py-1 rounded-full text-sm">
          <CheckCircle className="w-4 h-4" />
          <span>Verified</span>
        </div>
      );
    }
    
    switch (status) {
      case 'pending':
        return (
          <div className="flex items-center gap-1 text-muted-foreground bg-muted px-3 py-1 rounded-full text-sm">
            <Clock className="w-4 h-4" />
            <span>Not Uploaded</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-1 text-destructive bg-destructive/10 px-3 py-1 rounded-full text-sm">
            <XCircle className="w-4 h-4" />
            <span>Rejected</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 text-warning bg-warning/10 px-3 py-1 rounded-full text-sm">
            <Clock className="w-4 h-4" />
            <span>Under Review</span>
          </div>
        );
    }
  };

  const handleUpload = async (documentId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to upload documents",
        variant: "destructive",
      });
      return;
    }

    setUploading(documentId);
    
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Document uploaded",
      description: "Your document has been submitted for verification. This usually takes 24-48 hours.",
    });
    
    setUploading(null);
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-light flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-emerald" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Verification Center</h1>
          <p className="text-muted-foreground">
            Upload your documents to get verified and build trust
          </p>
        </div>

        {/* Verification Status */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold mb-1">Your Verification Status</h2>
              <p className="text-sm text-muted-foreground">
                Complete verification to unlock all features
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">
                {[profile?.is_aadhaar_verified, profile?.is_phone_verified, profile?.is_dl_verified].filter(Boolean).length}/3
              </p>
              <p className="text-xs text-muted-foreground">Verified</p>
            </div>
          </div>
          
          <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald to-emerald-dark transition-all"
              style={{ 
                width: `${([profile?.is_aadhaar_verified, profile?.is_phone_verified, profile?.is_dl_verified].filter(Boolean).length / 3) * 100}%` 
              }}
            />
          </div>
        </div>

        {/* Documents List */}
        <div className="space-y-4">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-light flex items-center justify-center flex-shrink-0">
                    <doc.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{doc.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{doc.description}</p>
                    {getStatusBadge(doc.status, doc.isVerified)}
                  </div>
                </div>
              </div>

              {!doc.isVerified && (
                <div className="mt-6">
                  <div 
                    className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => handleUpload(doc.id)}
                  >
                    {uploading === doc.id ? (
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                        <p className="text-sm text-muted-foreground">Uploading...</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm font-medium">Click to upload</p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Phone Verification */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-light flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Phone Number</h3>
                  <p className="text-sm text-muted-foreground mb-3">Verify your phone for quick login</p>
                  {getStatusBadge(profile?.is_phone_verified ? 'verified' : 'pending', profile?.is_phone_verified || false)}
                </div>
              </div>
              {!profile?.is_phone_verified && (
                <Button variant="outline" size="sm">
                  Verify
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-indigo-light/50 border border-primary/20 rounded-2xl p-6 mt-8">
          <h3 className="font-semibold text-primary mb-2">Why verify?</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald" />
              Instant booking approval
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald" />
              Higher trust score on your profile
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald" />
              Priority access to women-only rides
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald" />
              Ability to offer rides as a driver
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
