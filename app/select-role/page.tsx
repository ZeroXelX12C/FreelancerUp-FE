'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Briefcase,
  User,
  Building,
  Code,
  ArrowRight,
} from 'lucide-react';

export default function SelectRolePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  const roles = [
    {
      id: 'freelancer',
      title: 'Freelancer',
      description: 'Tìm kiếm dự án và làm việc tự do',
      icon: Code,
      color: 'from-blue-500 to-cyan-500',
      features: [
        'Tìm kiếm dự án phù hợp',
        'Đấu giá công việc',
        'Quản lý hồ sơ kỹ năng',
        'Theo dõi thu nhập',
      ],
    },
    {
      id: 'client',
      title: 'Client',
      description: 'Đăng dự án và tìm kiếm freelancer',
      icon: Building,
      color: 'from-purple-500 to-pink-500',
      features: [
        'Đăng dự án mới',
        'Tìm kiếm freelancer talent',
        'Quản lý dự án',
        'Thanh toán an toàn',
      ],
    },
  ];

  const handleSelectRole = (role: 'freelancer' | 'client') => {
    router.push(`/register/${role}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl">
              <User className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Chọn vai trò của bạn
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Chào mừng <span className="font-semibold text-foreground">{user.fullName}</span>!{' '}
            Vui lòng chọn vai trò bạn muốn tham gia trên FreelancerUp
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Card
                key={role.id}
                className="group relative overflow-hidden border-2 hover:border-primary transition-all duration-300 hover:shadow-xl cursor-pointer"
                onClick={() => handleSelectRole(role.id as 'freelancer' | 'client')}
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                <CardHeader className="relative">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${role.color} mb-4 w-fit`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{role.title}</CardTitle>
                  <CardDescription className="text-base">
                    {role.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative">
                  <ul className="space-y-3 mb-6">
                    {role.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br ${role.color} flex items-center justify-center`}>
                          <svg
                            className="h-4 w-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button className="w-full group-hover:scale-105 transition-transform duration-300">
                    Chọn làm {role.title}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Box */}
        <Card className="bg-blue-50/50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Briefcase className="h-6 w-6 text-blue-600 mt-1" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Chưa chắc chắn? Đừng lo lắng!</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Bạn có thể đăng ký cả hai vai trò và chuyển đổi giữa chúng sau.
                  Chọn vai trò phù hợp nhất với bạn ngay bây giờ để bắt đầu.
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Lưu ý:</span> Bạn sẽ cần hoàn thành
                  hồ sơ cho vai trò đã chọn trước khi có thể sử dụng đầy đủ tính năng.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
