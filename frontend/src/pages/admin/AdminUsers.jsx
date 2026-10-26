import { useCallback, useEffect, useState } from "react";
import {
  getUsers,
  getPendingUsers,
  approveUser,
  rejectUser,
  updateUserRole,
} from "@/services/users";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Values match the backend enum values (lowercase).
const ROLE_OPTIONS = [
  { value: "author", label: "Author" },
  { value: "reviewer", label: "Reviewer" },
];
const ROLE_VALUES = ROLE_OPTIONS.map((role) => role.value);

const STATUS_STYLES = {
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  approved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  rejected: "border-red-500/30 bg-red-500/10 text-red-400",
};

function capitalize(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function StatusBadge({ status }) {
  return (
    <Badge variant="outline" className={STATUS_STYLES[status] || ""}>
      {capitalize(status) || "Unknown"}
    </Badge>
  );
}

function RoleSelect({ value, onChange, disabled, className = "w-36" }) {
  return (
    <Select
      items={ROLE_OPTIONS}
      value={value}
      onValueChange={(role) => {
        if (!role) return;
        onChange(role);
      }}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder="Select role" />
      </SelectTrigger>
      <SelectContent>
        {ROLE_OPTIONS.map((role) => (
          <SelectItem key={role.value} value={role.value}>
            {role.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [roles, setRoles] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [allUsers, pending] = await Promise.all([
        getUsers(),
        getPendingUsers(),
      ]);

      setUsers(allUsers);
      setPendingUsers(pending);

      setRoles((previous) => {
        const next = { ...previous };

        for (const user of pending) {
          next[user.id] ??= ROLE_VALUES.includes(user.requested_role)
            ? user.requested_role
            : "author";
        }

        return next;
      });
    } catch (err) {
      setError(err.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function handleApprove(user) {
    const role = roles[user.id];

    if (!role) {
      setError("Select a role before approving this user.");
      return;
    }

    setBusyId(user.id);
    setError("");
    setMessage("");

    try {
      await approveUser(user.id, role);
      setMessage(`${user.name} has been approved as ${capitalize(role)}.`);
      await loadUsers();
    } catch (err) {
      setError(err.message || "Could not approve this user.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(user) {
    if (!window.confirm(`Reject registration for ${user.name}?`)) {
      return;
    }

    setBusyId(user.id);
    setError("");
    setMessage("");

    try {
      await rejectUser(user.id);
      setMessage(`Registration for ${user.name} was rejected.`);
      await loadUsers();
    } catch (err) {
      setError(err.message || "Could not reject this user.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleRoleChange(user, role) {
    if (user.role === role) return;

    if (
      !window.confirm(`Change ${user.name}'s role to ${capitalize(role)}?`)
    ) {
      return;
    }

    setBusyId(user.id);
    setError("");
    setMessage("");

    try {
      await updateUserRole(user.id, role);
      setMessage(`${user.name}'s role was updated to ${capitalize(role)}.`);
      await loadUsers();
    } catch (err) {
      setError(err.message || "Could not update the user's role.");
    } finally {
      setBusyId(null);
    }
  }

  const query = search.trim().toLowerCase();

  const filteredUsers = users.filter((user) => {
    return (
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query) ||
      user.status?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6 p-[10px]">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review registrations, assign roles, and manage access.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {message && (
        <div
          role="status"
          className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-400"
        >
          {message}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total users</CardDescription>
            <CardTitle className="text-3xl">{users.length}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending approval</CardDescription>
            <CardTitle className="text-3xl">{pendingUsers.length}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Approved users</CardDescription>
            <CardTitle className="text-3xl">
              {users.filter((user) => user.status === "approved").length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending registrations</CardTitle>
          <CardDescription>
            Assign a role before approving each account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">
              Loading registrations...
            </p>
          ) : pendingUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              There are no pending registrations.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Requested role</TableHead>
                    <TableHead>Assign role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {pendingUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline">
                          {capitalize(user.requested_role) || "Not specified"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <RoleSelect
                          value={roles[user.id] || "author"}
                          onChange={(role) =>
                            setRoles((previous) => ({
                              ...previous,
                              [user.id]: role,
                            }))
                          }
                          disabled={busyId === user.id}
                        />
                      </TableCell>

                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            disabled={busyId === user.id}
                            onClick={() => handleApprove(user)}
                          >
                            {busyId === user.id ? "Processing..." : "Approve"}
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={busyId === user.id}
                            onClick={() => handleReject(user)}
                          >
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All users</CardTitle>
          <CardDescription>
            Search accounts and change roles for existing users.
          </CardDescription>
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, role, or status..."
            aria-label="Search users"
          />
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading users...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No users match your search.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Change role</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                      </TableCell>

                      <TableCell>{capitalize(user.role) || "Unassigned"}</TableCell>

                      <TableCell>
                        <StatusBadge status={user.status} />
                      </TableCell>

                      <TableCell>
                        {user.status !== "approved" ? (
                          <span className="text-sm text-muted-foreground">
                            Unavailable
                          </span>
                        ) : user.role === "admin" ? (
                          <span className="text-sm text-muted-foreground">
                            Not editable
                          </span>
                        ) : (
                          <RoleSelect
                            value={user.role ?? null}
                            onChange={(role) => handleRoleChange(user, role)}
                            disabled={busyId === user.id}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              onClick={loadUsers}
              disabled={loading || busyId !== null}
            >
              Refresh users
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}