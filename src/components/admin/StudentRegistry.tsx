import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/lib/supabase";
import { Search, ShieldOff, Shield, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/empty-state";

interface Student {
  user_id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  has_active_booking: boolean;
  is_blocked: boolean;
}

export function StudentRegistry() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      // Fetch profiles
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, phone")
        .limit(200);

      if (error) throw error;

      // Fetch active bookings
      const { data: activeBookings } = await supabase
        .from("bookings")
        .select("user_id")
        .eq("status", "confirmed");

      const activeUserIds = new Set(activeBookings?.map((b) => b.user_id) || []);

      // Fetch access control
      const { data: accessControls } = await supabase
        .from("access_control")
        .select("user_id, is_allowed");

      const blockedMap = new Map(accessControls?.map((a) => [a.user_id, !a.is_allowed]) || []);

      const studentList: Student[] =
        profiles?.map((p) => ({
          user_id: p.user_id,
          full_name: p.full_name,
          phone: p.phone,
          email: null, // emails are in auth.users, not accessible from client
          has_active_booking: activeUserIds.has(p.user_id),
          is_blocked: blockedMap.get(p.user_id) || false,
        })) || [];

      setStudents(studentList);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load students");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const toggleBlock = async (userId: string, currentlyBlocked: boolean) => {
    try {
      const { data: existing } = await supabase
        .from("access_control")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("access_control")
          .update({
            is_allowed: currentlyBlocked,
            blocked_at: currentlyBlocked ? null : new Date().toISOString(),
            blocked_reason: currentlyBlocked ? null : "Blocked by admin",
          })
          .eq("user_id", userId);
      } else {
        await supabase.from("access_control").insert({
          user_id: userId,
          is_allowed: false,
          blocked_at: new Date().toISOString(),
          blocked_reason: "Blocked by admin",
        });
      }

      toast.success(currentlyBlocked ? "User unblocked" : "User blocked");
      await fetchStudents();
    } catch (error) {
      console.error("Error toggling block:", error);
      toast.error("Failed to update user status");
    }
  };

  const filtered = students.filter(
    (s) =>
      !search ||
      s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.phone?.includes(search)
  );

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="text-lg">All Students</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button variant="ghost" size="icon" onClick={fetchStudents}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No students found"
            description={search ? "Try a different search term" : "Students will appear once they sign up"}
            className="py-12"
          />
        ) : (
          <div className="overflow-auto max-h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Booking Status</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((student) => (
                  <TableRow key={student.user_id}>
                    <TableCell className="font-medium">
                      {student.full_name || "Unknown"}
                    </TableCell>
                    <TableCell>{student.phone || "—"}</TableCell>
                    <TableCell>
                      {student.has_active_booking ? (
                        <Badge className="bg-success/10 text-success border-success/20">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          No Booking
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {student.is_blocked ? (
                        <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                          Blocked
                        </Badge>
                      ) : (
                        <Badge className="bg-success/10 text-success border-success/20">
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant={student.is_blocked ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleBlock(student.user_id, student.is_blocked)}
                      >
                        {student.is_blocked ? (
                          <>
                            <Shield className="mr-1 h-3 w-3" />
                            Unblock
                          </>
                        ) : (
                          <>
                            <ShieldOff className="mr-1 h-3 w-3" />
                            Ban
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
