'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { If } from '@kit/ui/if';
import { Input } from '@kit/ui/input';
import { Trans } from '@kit/ui/trans';

import { PasswordSignUpSchema } from '../schemas/password-sign-up.schema';
import { TermsAndConditionsFormField } from './terms-and-conditions-form-field';

export function PasswordSignUpForm({
  defaultValues,
  displayTermsCheckbox,
  onSubmit,
  loading,
}: {
  defaultValues?: {
    email: string;
  };

  displayTermsCheckbox?: boolean;

  onSubmit: (params: {
    email: string;
    password: string;
    repeatPassword: string;
  }) => unknown;
  loading: boolean;
}) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const form = useForm({
    resolver: zodResolver(PasswordSignUpSchema),
    defaultValues: {
      email: defaultValues?.email ?? '',
      password: '',
      repeatPassword: '',
    },
  });

  return (
    <div className="w-full space-y-6">
      {/* Create Account heading */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">Create an account</h1>
        <p className="text-gray-600 text-sm">Enter the following details</p>
      </div>

      <Form {...form}>
        <form
          className="w-full space-y-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    data-test="email-input"
                    type="email"
                    placeholder="Email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 placeholder-gray-500"
                    required
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-sm" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      data-test="password-input"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 placeholder-gray-500"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-red-500 text-sm" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="repeatPassword"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      data-test="repeat-password-input"
                      type={showRepeatPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 placeholder-gray-500"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                    >
                      {showRepeatPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-red-500 text-sm" />
              </FormItem>
            )}
          />

          <If condition={displayTermsCheckbox}>
            <TermsAndConditionsFormField />
          </If>

          <Button
            data-test="auth-submit-button"
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            type="submit"
            disabled={loading}
          >
            <If
              condition={loading}
              fallback={
                <>
                  <Trans i18nKey="auth:signUpWithEmail" />
                  <ArrowRight
                    className={
                      'zoom-in animate-in slide-in-from-left-2 fill-mode-both h-4 delay-500 duration-500'
                    }
                  />
                </>
              }
            >
              <Trans i18nKey="auth:signingUp" />
            </If>
          </Button>
        </form>
      </Form>
    </div>
  );
}
