import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Edit, Lock, Mail, Phone, Save, User } from "lucide-react";

interface DriverProfile {
  driverId: string;
  phone: string;
  email: string;
  password: string;
  updatedAt: string;
}

export function ProfileManagementWrapper({
  profile,
  isEditingPhone,
  isEditingEmail,
  isEditingPassword,
  phoneValue,
  emailValue,
  passwordValue,
  setIsEditingPhone,
  setIsEditingEmail,
  setIsEditingPassword,
  setPhoneValue,
  setEmailValue,
  setPasswordValue,
  handleProfileUpdate,
  cancelEdit,
}: {
  profile: DriverProfile;
  isEditingPhone: boolean;
  isEditingEmail: boolean;
  isEditingPassword: boolean;
  phoneValue: string;
  emailValue: string;
  passwordValue: string;
  setIsEditingPhone: (value: boolean) => void;
  setIsEditingEmail: (value: boolean) => void;
  setIsEditingPassword: (value: boolean) => void;
  setPhoneValue: (value: string) => void;
  setEmailValue: (value: string) => void;
  setPasswordValue: (value: string) => void;
  handleProfileUpdate: (field: "phone" | "email" | "password") => void;
  cancelEdit: (field: "phone" | "email" | "password") => void;
}) {
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="p-6">
      <h2 className="mb-6 text-xl font-semibold">Profile Management</h2>

      <div className="mb-6 rounded-lg border bg-white shadow-sm">
        <div className="border-b p-6">
          <h3 className="text-lg font-medium">Driver Information</h3>
          <p className="mt-1 text-sm text-gray-500">
            View and update your profile information.
          </p>
        </div>

        <div className="space-y-6 p-6">
          {/* Driver ID (Read-only) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="driverId" className="text-sm font-medium">
                Driver ID
              </Label>
              <span className="text-xs text-gray-500">(Cannot be changed)</span>
            </div>
            <div className="flex items-center space-x-2 rounded-md border bg-gray-50 p-2">
              <User size={18} className="text-gray-500" />
              <Input
                id="driverId"
                value={profile.driverId}
                disabled
                className="border-0 bg-transparent p-0 focus-visible:ring-0"
              />
            </div>
          </div>

          {/* Phone Number (Editable) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </Label>
              {!isEditingPhone && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-blue-600"
                  onClick={() => setIsEditingPhone(true)}
                >
                  <Edit size={16} className="mr-1" /> Edit
                </Button>
              )}
            </div>
            <div className="flex items-center space-x-2 rounded-md border p-2">
              <Phone size={18} className="text-gray-500" />
              {isEditingPhone ? (
                <div className="flex-1">
                  <Input
                    id="phone"
                    value={phoneValue}
                    onChange={(e) => setPhoneValue(e.target.value)}
                    className="border-0 p-0 focus-visible:ring-0"
                    autoFocus
                  />
                  <div className="mt-2 flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cancelEdit("phone")}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleProfileUpdate("phone")}
                    >
                      <Save size={16} className="mr-1" /> Save
                    </Button>
                  </div>
                </div>
              ) : (
                <Input
                  id="phone"
                  value={profile.phone}
                  disabled
                  className="border-0 bg-transparent p-0 focus-visible:ring-0"
                />
              )}
            </div>
          </div>

          {/* Email (Editable) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              {!isEditingEmail && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-blue-600"
                  onClick={() => setIsEditingEmail(true)}
                >
                  <Edit size={16} className="mr-1" /> Edit
                </Button>
              )}
            </div>
            <div className="flex items-center space-x-2 rounded-md border p-2">
              <Mail size={18} className="text-gray-500" />
              {isEditingEmail ? (
                <div className="flex-1">
                  <Input
                    id="email"
                    type="email"
                    value={emailValue}
                    onChange={(e) => setEmailValue(e.target.value)}
                    className="border-0 p-0 focus-visible:ring-0"
                    autoFocus
                  />
                  <div className="mt-2 flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cancelEdit("email")}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleProfileUpdate("email")}
                    >
                      <Save size={16} className="mr-1" /> Save
                    </Button>
                  </div>
                </div>
              ) : (
                <Input
                  id="email"
                  value={profile.email}
                  disabled
                  className="border-0 bg-transparent p-0 focus-visible:ring-0"
                />
              )}
            </div>
          </div>

          {/* Password (Editable) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              {!isEditingPassword && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-blue-600"
                  onClick={() => setIsEditingPassword(true)}
                >
                  <Edit size={16} className="mr-1" /> Change Password
                </Button>
              )}
            </div>
            <div className="flex items-center space-x-2 rounded-md border p-2">
              <Lock size={18} className="text-gray-500" />
              {isEditingPassword ? (
                <div className="flex-1">
                  <Input
                    id="password"
                    type="password"
                    value={passwordValue}
                    onChange={(e) => setPasswordValue(e.target.value)}
                    className="border-0 p-0 focus-visible:ring-0"
                    placeholder="Enter new password"
                    autoFocus
                  />
                  <div className="mt-2 flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cancelEdit("password")}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleProfileUpdate("password")}
                    >
                      <Save size={16} className="mr-1" /> Save
                    </Button>
                  </div>
                </div>
              ) : (
                <Input
                  id="password"
                  type="password"
                  value={profile.password}
                  disabled
                  className="border-0 bg-transparent p-0 focus-visible:ring-0"
                />
              )}
            </div>
          </div>
        </div>

        <div className="border-t p-4 text-sm text-gray-500">
          <p>Profile last updated: {formatDate(profile.updatedAt)}</p>
        </div>
      </div>
    </div>
  );
}