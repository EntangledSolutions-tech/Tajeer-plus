'use client';

import React, { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { User, Mail, Phone, Shield, Building, Camera, Save, X } from 'lucide-react';
import CustomButton from '../reusableComponents/CustomButton';
import CustomInput from '../reusableComponents/CustomInput';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription } from '@kit/ui/alert-dialog';
import { toast } from '@kit/ui/sonner';
import { useRevalidatePersonalAccountDataQuery } from '@kit/accounts/hooks/use-personal-account-data';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string;
  email: string;
  email_confirmed_at?: string;
  created_at: string;
  roles?: {
    id: string;
    name: string;
    description?: string;
    permissions?: any;
  };
  branches?: {
    id: string;
    name: string;
    code: string;
  };
}

interface ProfileSettingsProps {
  onClose?: () => void;
}

const validationSchema = Yup.object({
  first_name: Yup.string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(100, 'First name must not exceed 100 characters'),
  last_name: Yup.string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(100, 'Last name must not exceed 100 characters'),
  phone: Yup.string()
    .matches(/^[+]?[\d\s\-\(\)]+$/, 'Please enter a valid phone number')
    .max(20, 'Phone number must not exceed 20 characters'),
});

export default function ProfileSettings({}: ProfileSettingsProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const revalidateAccountData = useRevalidatePersonalAccountDataQuery();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/profile');
      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setError('Please log in to view your profile');
          return;
        }
        throw new Error(result.error || 'Failed to fetch profile');
      }

      setProfile(result.profile);
    } catch (err: any) {
      const errorMessage = 'Error fetching profile: ' + (err?.message || 'Unknown error');
      toast.error('Failed to load profile', {
        description: err?.message || 'Unknown error occurred',
        duration: 5000,
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setSaving(true);
      setError(null);

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile');
      }

      setProfile(result.profile);

      // Invalidate the account data query to refresh navbar
      if (profile?.id) {
        revalidateAccountData(profile.id);
      }

      toast.success('Profile updated successfully!', {
        description: 'Your profile information has been saved.',
        duration: 4000,
      });
    } catch (err: any) {
      const errorMessage = 'Error updating profile: ' + (err?.message || 'Unknown error');
      toast.error('Failed to update profile', {
        description: err?.message || 'Unknown error occurred',
        duration: 5000,
      });
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setSaving(true);

      // Upload to Supabase storage
      const formData = new FormData();
      formData.append('file', file);

      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile?.id || 'user'}-${Date.now()}.${fileExt}`;

      const uploadResponse = await fetch('/api/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadResult.error || 'Failed to upload image');
      }

      // Update the profile with the new avatar URL
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: profile?.first_name || '',
          last_name: profile?.last_name || '',
          phone: profile?.phone || '',
          avatar_url: uploadResult.url,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile');
      }

      setProfile(result.profile);

      // Invalidate the account data query to refresh navbar
      if (profile?.id) {
        revalidateAccountData(profile.id);
      }

      toast.success('Profile picture updated!', {
        description: 'Your profile picture has been saved.',
        duration: 3000,
      });
    } catch (err: any) {
      toast.error('Failed to update profile picture', {
        description: err?.message || 'Unknown error occurred',
        duration: 5000,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-300">Loading profile...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!profile && !loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">
              {error?.includes('log in') ? 'Please log in to view your profile' : 'Failed to load profile'}
            </p>
            <div className="flex gap-3 justify-center">
              {error?.includes('log in') && (
                <CustomButton
                  onClick={() => window.location.href = '/auth/sign-in'}
                  className="bg-primary text-white"
                >
                  Go to Login
                </CustomButton>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto">
        {/* Error AlertDialog */}
        {error && (
          <AlertDialog open={!!error}>
            <AlertDialogContent className="fixed top-4 left-1/2 -translate-x-1/2 z-[10000] w-full max-w-md">
              <AlertDialogTitle>Error</AlertDialogTitle>
              <AlertDialogDescription>{error}</AlertDialogDescription>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Profile Settings Page */}
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold text-white/90 dark:text-gray-900 mb-2">Profile Settings</h2>
            <p className="text-white/75 dark:text-gray-400">Manage your account information</p>
          </div>

          {/* Profile Picture Section */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mx-auto mb-4">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                id="avatar-upload"
              />
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
              >
                <Camera className="w-4 h-4" />
              </label>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {profile?.first_name} {profile?.last_name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {profile?.roles?.name || 'User'}
            </p>
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <Formik
              initialValues={{
                first_name: profile?.first_name || '',
                last_name: profile?.last_name || '',
                phone: profile?.phone || '',
                avatar_url: profile?.avatar_url || '',
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ values, setFieldValue }) => (
                <Form className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Personal Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <CustomInput
                        label="First Name"
                        name="first_name"
                        placeholder="Enter your first name"
                        required
                      />
                      <CustomInput
                        label="Last Name"
                        name="last_name"
                        placeholder="Enter your last name"
                        required
                      />
                    </div>
                    <div className="mt-4">
                      <CustomInput
                        label="Phone Number"
                        name="phone"
                        placeholder="Enter your phone number"
                        icon={<Phone className="w-4 h-4" />}
                      />
                    </div>
                  </div>

                  {/* Account Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Mail className="w-5 h-5 mr-2" />
                      Account Information
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email Address
                        </label>
                        <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900 dark:text-white">{profile?.email}</span>
                          {profile?.email_confirmed_at && (
                            <span className="text-green-600 dark:text-green-400 text-sm">✓ Verified</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Role Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      Role & Permissions
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Role
                        </label>
                        <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <Shield className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900 dark:text-white">
                            {profile?.roles?.name || 'User'}
                          </span>
                        </div>
                        {profile?.roles?.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {profile.roles.description}
                          </p>
                        )}
                      </div>
                      {profile?.branches && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Branch
                          </label>
                          <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <Building className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-900 dark:text-white">
                              {profile.branches.name} ({profile.branches.code})
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <CustomButton
                      type="submit"
                      disabled={saving}
                      className="flex items-center space-x-2"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </CustomButton>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
}
