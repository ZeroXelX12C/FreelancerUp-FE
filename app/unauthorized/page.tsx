'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldX } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/hooks/useAuth';

export default function UnauthorizedPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-12 pb-8 px-8 text-center">
          <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-6">
            <ShieldX className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>

          <p className="text-muted-foreground mb-6">
            {user ? (
              <>
                Your account as <span className="font-semibold">{user.role}</span> doesn't have
                permission to access this page.
              </>
            ) : (
              'You need to be authenticated to access this page.'
            )}
          </p>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/dashboard">
                Go to Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                Back to Home
              </Link>
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t text-sm text-muted-foreground">
            <p>Need help? Contact support if you believe this is an error.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
