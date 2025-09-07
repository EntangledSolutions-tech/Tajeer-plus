'use client';

import Link from 'next/link';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { z } from 'zod';

import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { If } from '@kit/ui/if';
import { Input } from '@kit/ui/input';
import { Trans } from '@kit/ui/trans';

import { PasswordSignInSchema } from '../schemas/password-sign-in.schema';

export function PasswordSignInForm({
  onSubmit,
  loading,
}: {
  onSubmit: (params: z.infer<typeof PasswordSignInSchema>) => unknown;
  loading: boolean;
}) {
  const { t } = useTranslation('auth');
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof PasswordSignInSchema>>({
    resolver: zodResolver(PasswordSignInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  return (
    <div className="w-full space-y-6">
      {/* Welcome heading */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">Welcome!</h1>
        <p className="text-gray-600 text-sm">Please login to our platform</p>
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
                  <div className="relative">
                    <Input
                      {...field}
                      data-test="email-input"
                      type="email"
                      placeholder="Email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 placeholder-gray-500"
                      required
                    />
                  </div>
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

          <div className="text-right">
            <Link
              href="/auth/password-reset"
              className="text-primary text-sm hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <Button
            data-test="auth-submit-button"
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            type="submit"
            disabled={loading}
          >
            <If
              condition={loading}
              fallback="Login"
            >
              <Trans i18nKey="auth:signingIn" />
            </If>
          </Button>

          <div className="text-center space-y-4">
            <div className="text-gray-500 text-sm">OR</div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 py-3 border border-gray-300 rounded-lg text-primary hover:bg-primary/10 font-medium"
              >
                Login By نفاذ
              </Button>

              <Button
                type="button"
                variant="outline"
                className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Login With Tajeer
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
