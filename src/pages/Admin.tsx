import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Users, FileText, Car, AlertTriangle, 
  Check, X, Loader2, Eye, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingDocs, setPendingDocs] = useState<VerificationDocument[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingDoc, setProcessingDoc] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      navigate('/auth');
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <Shield className="w-12 h-12 mx-auto text-destructive mb-4" />
            <h1 className="text-xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-4">
              You don't have permission to access the admin dashboard.
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
