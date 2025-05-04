import { useState } from "react";
import { Edit, Lock, Mail, Phone, Save, User } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/alert-dialog";
import { Button } from "@repo/ui/button";
import { useToast } from "@repo/ui/hooks/use-toast";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";

interface DriverProfileProps {
  driverId: string;
  phone: string;
  email: string;
  updatedAt: string;
}

interface ProfileManagementProps {
  driverProfile: DriverProfileProps;
  onUpdateProfile: (
    field: "phone" | "email" | "password",
    value: string,
  ) => Promise<void>;
}

export function ProfileManagement({
  driverProfile,
  onUpdateProfile,
}: ProfileManagementProps) {
  const { toast } = useToast();

  // Edit states
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  // Form values
  const [phoneValue, setPhoneValue] = useState(driverProfile.phone);
  const [emailValue, setEmailValue] = useState(driverProfile.email);
  const [passwordValue, setPasswordValue] = useState("");

  // Validation errors
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Loading states
  const [isLoading, setIsLoading] = useState({
    phone: false,
    email: false,
    password: false,
  });

  // Confirmation dialog state
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [currentField, setCurrentField] = useState<
    "phone" | "email" | "password" | null
  >(null);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Field validation
  const validatePhone = (phone: string) => {
    const phonePattern = /^\+?[0-9]{10,15}$/;
    if (!phone) {
      setPhoneError("Phone number is required");
      return false;
    }
    if (!phonePattern.test(phone)) {
      setPhoneError("Please enter a valid phone number");
      return false;
    }
    setPhoneError("");
    return true;
  };

  const validateEmail = (email: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Email is required");
      return false;
    }
    if (!emailPattern.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError("Password is required");
      return false;
    }
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return false;
    }
    setPasswordError("");
    return true;
  };

  // Handle cancel for any field
  const cancelEdit = (field: "phone" | "email" | "password") => {
    switch (field) {
      case "phone":
        setPhoneValue(driverProfile.phone);
        setIsEditingPhone(false);
        setPhoneError("");
        break;
      case "email":
        setEmailValue(driverProfile.email);
        setIsEditingEmail(false);
        setEmailError("");
        break;
      case "password":
        setPasswordValue("");
        setIsEditingPassword(false);
        setPasswordError("");
        break;
    }
  };

  // Handle update attempt
  const handleUpdateAttempt = (field: "phone" | "email" | "password") => {
    let isValid = false;

    switch (field) {
      case "phone":
        isValid = validatePhone(phoneValue);
        if (isValid && phoneValue === driverProfile.phone) {
          toast({
            title: "No Changes",
            description: "The phone number is the same as the current one.",
          });
          cancelEdit("phone");
          return;
        }
        break;
      case "email":
        isValid = validateEmail(emailValue);
        if (isValid && emailValue === driverProfile.email) {
          toast({
            title: "No Changes",
            description: "The email is the same as the current one.",
          });
          cancelEdit("email");
          return;
        }
        break;
      case "password":
        isValid = validatePassword(passwordValue);
        break;
    }

    if (!isValid) return;

    // For sensitive fields, show confirmation dialog
    if (field === "email" || field === "password") {
      setCurrentField(field);
      setIsConfirmDialogOpen(true);
    } else {
      // For less sensitive fields, update directly
      handleConfirmUpdate(field);
    }
  };

  // Handle confirmed update
  const handleConfirmUpdate = async (field: "phone" | "email" | "password") => {
    try {
      setIsLoading({ ...isLoading, [field]: true });

      // Get the appropriate value based on field
      const value =
        field === "phone"
          ? phoneValue
          : field === "email"
            ? emailValue
            : passwordValue;

      await onUpdateProfile(field, value);

      // Reset edit state
      switch (field) {
        case "phone":
          setIsEditingPhone(false);
          break;
        case "email":
          setIsEditingEmail(false);
          break;
        case "password":
          setIsEditingPassword(false);
          setPasswordValue("");
          break;
      }

      // Close dialog if open
      setIsConfirmDialogOpen(false);
      setCurrentField(null);
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
    } finally {
      setIsLoading({ ...isLoading, [field]: false });
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <main className="flex-1 overflow-auto p-4 md:p-6">
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
                <span className="text-xs text-gray-500">
                  (Cannot be changed)
                </span>
              </div>
              <div className="flex items-center space-x-2 rounded-md border bg-gray-50 p-2">
                <User size={18} className="text-gray-500" />
                <Input
                  id="driverId"
                  value={driverProfile.driverId}
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
                    {phoneError && (
                      <p className="mt-1 text-sm text-red-500">{phoneError}</p>
                    )}
                    <div className="mt-2 flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cancelEdit("phone")}
                        disabled={isLoading.phone}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateAttempt("phone")}
                        disabled={isLoading.phone}
                      >
                        {isLoading.phone ? (
                          <span className="flex items-center">
                            <svg
                              className="mr-1 h-4 w-4 animate-spin"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Saving...
                          </span>
                        ) : (
                          <>
                            <Save size={16} className="mr-1" /> Save
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Input
                    id="phone"
                    value={driverProfile.phone}
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
                    {emailError && (
                      <p className="mt-1 text-sm text-red-500">{emailError}</p>
                    )}
                    <div className="mt-2 flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cancelEdit("email")}
                        disabled={isLoading.email}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateAttempt("email")}
                        disabled={isLoading.email}
                      >
                        {isLoading.email ? (
                          <span className="flex items-center">
                            <svg
                              className="mr-1 h-4 w-4 animate-spin"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Saving...
                          </span>
                        ) : (
                          <>
                            <Save size={16} className="mr-1" /> Save
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Input
                    id="email"
                    value={driverProfile.email}
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
                    {passwordError && (
                      <p className="mt-1 text-sm text-red-500">
                        {passwordError}
                      </p>
                    )}
                    <div className="mt-2 flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cancelEdit("password")}
                        disabled={isLoading.password}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateAttempt("password")}
                        disabled={isLoading.password}
                      >
                        {isLoading.password ? (
                          <span className="flex items-center">
                            <svg
                              className="mr-1 h-4 w-4 animate-spin"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Saving...
                          </span>
                        ) : (
                          <>
                            <Save size={16} className="mr-1" /> Save
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Input
                    id="password"
                    type="password"
                    value="••••••••" // Show dots instead of actual password for security
                    disabled
                    className="border-0 bg-transparent p-0 focus-visible:ring-0"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="border-t p-4 text-sm text-gray-500">
            <p>Profile last updated: {formatDate(driverProfile.updatedAt)}</p>
          </div>
        </div>

        {/* Confirmation Dialog */}
        <AlertDialog
          open={isConfirmDialogOpen}
          onOpenChange={setIsConfirmDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {currentField === "email"
                  ? "Confirm Email Change"
                  : "Confirm Password Change"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {currentField === "email"
                  ? "Are you sure you want to change your email address? You'll need to use your new email the next time you log in."
                  : "Are you sure you want to change your password? You'll need to use your new password the next time you log in."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setIsConfirmDialogOpen(false);
                  setCurrentField(null);
                }}
                disabled={currentField ? isLoading[currentField] : false}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (currentField) {
                    handleConfirmUpdate(currentField);
                  }
                }}
                disabled={currentField ? isLoading[currentField] : false}
              >
                {currentField && isLoading[currentField] ? (
                  <span className="flex items-center">
                    <svg
                      className="mr-1 h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Confirming...
                  </span>
                ) : (
                  "Confirm"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
