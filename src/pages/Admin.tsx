import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Users, FileText, Car, AlertTriangle, 
  Check, X, Loader2, Eye, Search, Mail, Lock, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const ADMIN_EMAIL = 'trapy3004@gmail.com';

interface VerificationDocument {
  id: string;
  user_id: string;
  document_type: string;
  document_url: string;
  status: string;
  submitted_at: string;
  profiles: {
    full_name: string | null;
    phone: string | null;
  } | null;
}

interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  email?: string;
  is_aadhaar_verified: boolean;
  is_dl_verified: boolean;
  total_rides: number;
  rating: number;
  created_at: string;
}

interface Stats {
  totalUsers: number;
  totalRides: number;
  pendingVerifications: number;
  activeRides: number;
}

export default function Admin() {
  const { user, signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingDocs, setPendingDocs] = useState<VerificationDocument[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingDoc, setProcessingDoc] = useState<string | null>(null);
  
  // Admin login state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      setLoading(false);
      setIsAdmin(false);
      return;
    }

    // Check if logged in user is the allowed admin email
    if (user.email !== ADMIN_EMAIL) {
      setLoading(false);
      setIsAdmin(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      if (error) throw error;
      
      setIsAdmin(data);
      if (data) {
        fetchStats();
        fetchPendingDocuments();
        fetchUsers();
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    // Check if email matches allowed admin email
    if (adminEmail !== ADMIN_EMAIL) {
      setLoginError('Access denied. This email is not authorized for admin access.');
      return;
    }

    setLoginLoading(true);
    
    const { error } = await signIn(adminEmail, adminPassword);
    
    if (error) {
      setLoginError(error.message || 'Login failed. Please check your credentials.');
    }
    
    setLoginLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoginLoading(true);
    setLoginError('');
    await signInWithGoogle();
    // Note: After Google OAuth redirect, the useEffect will check if the email matches ADMIN_EMAIL
    setLoginLoading(false);
  };

  const fetchStats = async () => {
    try {
      const [profilesRes, ridesRes, docsRes, activeRidesRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('rides').select('id', { count: 'exact', head: true }),
        supabase.from('verification_documents').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('rides').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      ]);

      setStats({
        totalUsers: profilesRes.count || 0,
        totalRides: ridesRes.count || 0,
        pendingVerifications: docsRes.count || 0,
        activeRides: activeRidesRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchPendingDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('verification_documents')
        .select(`
          *,
          profiles!verification_documents_user_id_fkey (
            full_name,
            phone
          )
        `)
        .eq('status', 'pending')
        .order('submitted_at', { ascending: true });

      if (error) throw error;
      setPendingDocs(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleDocumentAction = async (
    docId: string,
    userId: string,
    docType: string,
    action: 'verified' | 'rejected'
  ) => {
    setProcessingDoc(docId);
    try {
      // Use secure server-side RPC function for admin document review
      // This enforces admin authorization on the server and atomically updates both tables
      const { data, error } = await supabase.rpc('admin_review_document', {
        p_doc_id: docId,
        p_action: action,
        p_user_id: userId,
        p_doc_type: docType,
      });

      if (error) throw error;

      toast({
        title: action === 'verified' ? 'Document Verified' : 'Document Rejected',
        description: `The ${docType} document has been ${action}.`,
      });

      fetchPendingDocuments();
      fetchStats();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to process document',
        variant: 'destructive',
      });
    } finally {
      setProcessingDoc(null);
    }
  };

  // Get signed URL for viewing documents securely
  const getSecureDocumentUrl = async (docId: string): Promise<string | null> => {
    try {
      // Get the file path from secure RPC function
      const { data: filePath, error } = await supabase.rpc('get_document_signed_url', {
        p_doc_id: docId,
      });

      if (error) throw error;
      if (!filePath) return null;

      // Generate signed URL client-side (valid for 1 hour)
      const { data: signedUrl } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 3600);

      return signedUrl?.signedUrl || null;
    } catch (error) {
      console.error('Error getting document URL:', error);
      return null;
    }
  };

  const handleViewDocument = async (docId: string) => {
    const url = await getSecureDocumentUrl(docId);
    if (url) {
      window.open(url, '_blank');
    } else {
      toast({
        title: 'Error',
        description: 'Failed to load document. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.phone?.includes(searchQuery)
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Show admin login form if not logged in or wrong email
  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Admin Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-white">Admin Portal</h1>
            <p className="text-white/60 mt-2">Authorized personnel only</p>
          </div>

          {/* Admin Login Card */}
          <Card className="border-0 shadow-2xl">
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold text-center mb-6">Admin Login</h2>
              
              {loginError && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive text-center">{loginError}</p>
                </div>
              )}

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Admin Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="adminEmail"
                      type="email"
                      placeholder="Enter admin email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminPassword">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="adminPassword"
                      type="password"
                      placeholder="Enter password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loginLoading}>
                  {loginLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Access Admin Panel
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-card px-4 text-muted-foreground">or</span>
                </div>
              </div>

              {/* Google Sign In */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                size="lg"
                onClick={handleGoogleSignIn}
                disabled={loginLoading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>Restricted Access</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-white/40 text-sm mt-6">
            This area is for authorized administrators only.
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <Shield className="w-12 h-12 mx-auto text-destructive mb-4" />
            <h1 className="text-xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-4">
              You don't have admin role assigned to your account.
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pt-20 pb-12">
      <div className="container px-4 max-w-6xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage users and verifications</p>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <Users className="w-6 h-6 text-primary mb-2" />
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <Car className="w-6 h-6 text-emerald mb-2" />
                <p className="text-2xl font-bold">{stats.totalRides}</p>
                <p className="text-xs text-muted-foreground">Total Rides</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <FileText className="w-6 h-6 text-warning mb-2" />
                <p className="text-2xl font-bold">{stats.pendingVerifications}</p>
                <p className="text-xs text-muted-foreground">Pending Verifications</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <Car className="w-6 h-6 text-blue-500 mb-2" />
                <p className="text-2xl font-bold">{stats.activeRides}</p>
                <p className="text-xs text-muted-foreground">Active Rides</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="verifications">
          <TabsList className="mb-4">
            <TabsTrigger value="verifications" className="gap-2">
              <FileText className="w-4 h-4" />
              Verifications
              {stats && stats.pendingVerifications > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {stats.pendingVerifications}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="verifications">
            <Card>
              <CardHeader>
                <CardTitle>Pending Verifications</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingDocs.length === 0 ? (
                  <div className="text-center py-8">
                    <Check className="w-12 h-12 text-emerald mx-auto mb-4" />
                    <p className="text-muted-foreground">No pending verifications</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {doc.profiles?.full_name || 'Unknown User'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {doc.document_type.toUpperCase()} • {doc.profiles?.phone || 'No phone'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Submitted {format(new Date(doc.submitted_at), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDocument(doc.id)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-emerald hover:text-emerald"
                            disabled={processingDoc === doc.id}
                            onClick={() => handleDocumentAction(doc.id, doc.user_id, doc.document_type, 'verified')}
                          >
                            {processingDoc === doc.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive"
                            disabled={processingDoc === doc.id}
                            onClick={() => handleDocumentAction(doc.id, doc.user_id, doc.document_type, 'rejected')}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Users</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">User</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Phone</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Verification</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Rides</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b border-border hover:bg-muted/30">
                          <td className="p-3">
                            <p className="font-medium">{user.full_name || 'No name'}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(user.created_at), 'MMM d, yyyy')}
                            </p>
                          </td>
                          <td className="p-3 text-sm">{user.phone || '-'}</td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              {user.is_aadhaar_verified && (
                                <Badge variant="secondary" className="text-xs">Aadhaar</Badge>
                              )}
                              {user.is_dl_verified && (
                                <Badge variant="secondary" className="text-xs">DL</Badge>
                              )}
                              {!user.is_aadhaar_verified && !user.is_dl_verified && (
                                <span className="text-xs text-muted-foreground">Unverified</span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-sm">{user.total_rides || 0}</td>
                          <td className="p-3 text-sm">
                            {user.rating ? `⭐ ${user.rating}` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
