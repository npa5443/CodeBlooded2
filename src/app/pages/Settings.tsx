import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Bell,
  Globe,
  Lock,
  Save,
  User,
} from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { PageLoader } from "../components/common/PageLoader";
import { BrandLogo } from "../components/common/BrandLogo";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Textarea } from "../components/ui/textarea";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

export function Settings() {
  const navigate = useNavigate();
  const { replaceUser, token, user } = useAuth();
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    university: "",
    department: "",
    location: "",
    bio: "",
    title: "Professor",
    officeLocation: "",
    officeHours: "",
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyDigest: true,
    assignmentReminders: true,
    gradeReleases: false,
  });
  const [teachingPreferences, setTeachingPreferences] = useState({
    timezone: "America/New_York",
    language: "English",
    gradingScale: "Letter Grades (A-F)",
  });
  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isUpdatingTwoFactor, setIsUpdatingTwoFactor] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    setProfileData({
      fullName: user.fullName,
      email: user.email,
      university: user.university,
      department: user.department,
      location: user.location,
      bio: user.bio,
      title: user.title,
      officeLocation: user.officeLocation,
      officeHours: user.officeHours,
    });
    setNotifications(user.notifications);
    setTeachingPreferences(user.teachingPreferences);
  }, [user]);

  if (!user || !token) {
    return <PageLoader message="Loading settings..." />;
  }

  const handleProfileSave = async () => {
    setIsSavingProfile(true);

    try {
      const response = await api.updateProfile(token, profileData);
      replaceUser(response.user);
      toast.success("Profile updated.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleNotificationsSave = async () => {
    setIsSavingNotifications(true);

    try {
      const response = await api.updateNotifications(token, notifications);
      replaceUser(response.user);
      toast.success("Notification preferences saved.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSavingNotifications(false);
    }
  };

  const handlePreferencesSave = async () => {
    setIsSavingPreferences(true);

    try {
      const response = await api.updateTeachingPreferences(token, teachingPreferences);
      replaceUser(response.user);
      toast.success("Teaching preferences saved.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const handlePasswordSave = async () => {
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      toast.error("New password and confirmation must match.");
      return;
    }

    setIsSavingPassword(true);

    try {
      const response = await api.updatePassword(token, {
        currentPassword: securityForm.currentPassword,
        newPassword: securityForm.newPassword,
      });
      replaceUser(response.user);
      setSecurityForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Password updated.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleTwoFactorToggle = async () => {
    setIsUpdatingTwoFactor(true);

    try {
      const response = await api.updateTwoFactor(
        token,
        !user.security.twoFactorEnabled,
      );
      replaceUser(response.user);
      toast.success(
        response.user.security.twoFactorEnabled
          ? "Two-factor authentication enabled."
          : "Two-factor authentication disabled.",
      );
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsUpdatingTwoFactor(false);
    }
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Please choose an image smaller than 5MB.");
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const avatarUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            resolve(reader.result);
            return;
          }

          reject(new Error("Unable to read the selected image."));
        };
        reader.onerror = () => reject(new Error("Unable to read the selected image."));
        reader.readAsDataURL(file);
      });

      const response = await api.updateAvatar(token, avatarUrl);
      replaceUser(response.user);
      toast.success("Profile photo updated.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleAvatarRemove = async () => {
    setIsUploadingAvatar(true);

    try {
      const response = await api.updateAvatar(token, null);
      replaceUser(response.user);
      toast.success("Profile photo removed.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="size-5" />
            </Button>
            <div className="flex items-center gap-3">
              <BrandLogo compact />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Settings & Profile</h1>
                <p className="text-sm text-gray-500">Manage your account preferences</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-white border border-gray-200 p-1">
            <TabsTrigger value="profile" className="gap-2">
              <User className="size-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="size-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Globe className="size-4" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Lock className="size-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Professor Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="size-24">
                    {user.avatarUrl ? (
                      <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                    ) : null}
                    <AvatarFallback className="bg-indigo-100 text-indigo-700 text-2xl font-semibold">
                      {user.avatarInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/gif,image/webp"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                      >
                        {isUploadingAvatar ? "Uploading..." : "Upload Photo"}
                      </Button>
                      {user.avatarUrl ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void handleAvatarRemove()}
                          disabled={isUploadingAvatar}
                        >
                          Remove Photo
                        </Button>
                      ) : null}
                    </div>
                    <p className="text-sm text-gray-500">JPG, PNG or GIF. Max size 5MB.</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={profileData.fullName}
                      onChange={(event) =>
                        setProfileData((current) => ({
                          ...current,
                          fullName: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Select
                      value={profileData.title}
                      onValueChange={(value) =>
                        setProfileData((current) => ({
                          ...current,
                          title: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Professor">Professor</SelectItem>
                        <SelectItem value="Associate Professor">
                          Associate Professor
                        </SelectItem>
                        <SelectItem value="Assistant Professor">
                          Assistant Professor
                        </SelectItem>
                        <SelectItem value="Lecturer">Lecturer</SelectItem>
                        <SelectItem value="Adjunct Professor">
                          Adjunct Professor
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(event) =>
                        setProfileData((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="university">University</Label>
                    <Input
                      id="university"
                      value={profileData.university}
                      onChange={(event) =>
                        setProfileData((current) => ({
                          ...current,
                          university: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={profileData.department}
                      onChange={(event) =>
                        setProfileData((current) => ({
                          ...current,
                          department: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(event) =>
                        setProfileData((current) => ({
                          ...current,
                          location: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    rows={4}
                    value={profileData.bio}
                    onChange={(event) =>
                      setProfileData((current) => ({
                        ...current,
                        bio: event.target.value,
                      }))
                    }
                    placeholder="Tell us about your teaching experience and interests..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="officeLocation">Office Location</Label>
                    <Input
                      id="officeLocation"
                      value={profileData.officeLocation}
                      onChange={(event) =>
                        setProfileData((current) => ({
                          ...current,
                          officeLocation: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="officeHours">Office Hours</Label>
                    <Input
                      id="officeHours"
                      value={profileData.officeHours}
                      onChange={(event) =>
                        setProfileData((current) => ({
                          ...current,
                          officeHours: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => void handleProfileSave()} disabled={isSavingProfile}>
                    <Save className="size-4 mr-2" />
                    {isSavingProfile ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) =>
                      setNotifications((current) => ({
                        ...current,
                        emailNotifications: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Push Notifications</p>
                    <p className="text-sm text-gray-600">
                      Receive push notifications in browser
                    </p>
                  </div>
                  <Switch
                    checked={notifications.pushNotifications}
                    onCheckedChange={(checked) =>
                      setNotifications((current) => ({
                        ...current,
                        pushNotifications: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Weekly Digest</p>
                    <p className="text-sm text-gray-600">
                      Get a weekly summary of your courses
                    </p>
                  </div>
                  <Switch
                    checked={notifications.weeklyDigest}
                    onCheckedChange={(checked) =>
                      setNotifications((current) => ({
                        ...current,
                        weeklyDigest: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Assignment Reminders</p>
                    <p className="text-sm text-gray-600">
                      Remind about upcoming assignment deadlines
                    </p>
                  </div>
                  <Switch
                    checked={notifications.assignmentReminders}
                    onCheckedChange={(checked) =>
                      setNotifications((current) => ({
                        ...current,
                        assignmentReminders: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Grade Releases</p>
                    <p className="text-sm text-gray-600">
                      Notify when grades need to be released
                    </p>
                  </div>
                  <Switch
                    checked={notifications.gradeReleases}
                    onCheckedChange={(checked) =>
                      setNotifications((current) => ({
                        ...current,
                        gradeReleases: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button
                    onClick={() => void handleNotificationsSave()}
                    disabled={isSavingNotifications}
                  >
                    <Save className="size-4 mr-2" />
                    {isSavingNotifications ? "Saving..." : "Save Preferences"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Teaching Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Time Zone</Label>
                  <Select
                    value={teachingPreferences.timezone}
                    onValueChange={(value) =>
                      setTeachingPreferences((current) => ({
                        ...current,
                        timezone: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={teachingPreferences.language}
                    onValueChange={(value) =>
                      setTeachingPreferences((current) => ({
                        ...current,
                        language: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="German">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grading">Default Grading Scale</Label>
                  <Select
                    value={teachingPreferences.gradingScale}
                    onValueChange={(value) =>
                      setTeachingPreferences((current) => ({
                        ...current,
                        gradingScale: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Letter Grades (A-F)">
                        Letter Grades (A-F)
                      </SelectItem>
                      <SelectItem value="Percentage (0-100)">
                        Percentage (0-100)
                      </SelectItem>
                      <SelectItem value="Points Based">Points Based</SelectItem>
                      <SelectItem value="Pass/Fail">Pass/Fail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button
                    onClick={() => void handlePreferencesSave()}
                    disabled={isSavingPreferences}
                  >
                    <Save className="size-4 mr-2" />
                    {isSavingPreferences ? "Saving..." : "Save Preferences"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={securityForm.currentPassword}
                    onChange={(event) =>
                      setSecurityForm((current) => ({
                        ...current,
                        currentPassword: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={securityForm.newPassword}
                    onChange={(event) =>
                      setSecurityForm((current) => ({
                        ...current,
                        newPassword: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={securityForm.confirmPassword}
                    onChange={(event) =>
                      setSecurityForm((current) => ({
                        ...current,
                        confirmPassword: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={() => void handlePasswordSave()} disabled={isSavingPassword}>
                    {isSavingPassword ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Enable 2FA</p>
                    <p className="text-sm text-gray-600">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => void handleTwoFactorToggle()}
                    disabled={isUpdatingTwoFactor}
                  >
                    {isUpdatingTwoFactor
                      ? "Updating..."
                      : user.security.twoFactorEnabled
                        ? "Disable"
                        : "Enable"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
