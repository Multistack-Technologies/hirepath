// src/app/applications/page.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/Button';
import Link from 'next/link';
import api from '@/lib/api';
import {
  BuildingOfficeIcon,
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
  EyeIcon,
  XMarkIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  BriefcaseIcon
} from "@heroicons/react/24/outline";

interface Application {
  id: number;
  job: number;
  job_title: string;
  company_name: string;
  company_logo?: string;
  location: string;
  applicant: number;
  applicant_name: string;
  cover_letter: string | null;
  status: 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'REJECTED' | 'HIRED';
  applied_at: string;
  employment_type?: string;
  work_type?: string;
  days_ago?: number;
}

export default function MyApplications() {
  const { user } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<number | null>(null);

  const fetchApplications = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<Application[]>('/applications/mine/');
      
      if (response.data && Array.isArray(response.data)) {
        const applicationsWithTime = response.data.map(app => ({
          ...app,
          days_ago: Math.floor((new Date().getTime() - new Date(app.applied_at).getTime()) / (1000 * 60 * 60 * 24))
        }));
        setApplications(applicationsWithTime);
      } else {
        setError("Failed to load applications: Unexpected response format.");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load applications';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'GRADUATE') {
      setError("Access Denied. Graduates only.");
      setIsLoading(false);
      return;
    }

    fetchApplications();
  }, [user, router]);

  const handleViewJob = (jobId: number) => {
    router.push(`/Myjobs/${jobId}`);
  };

  const handleWithdrawApplication = async (applicationId: number) => {
    if (!confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) {
      return;
    }

    setWithdrawingId(applicationId);
    try {
      await api.delete(`/applications/${applicationId}/`);
      setApplications(prevApps => prevApps.filter(app => app.id !== applicationId));
    } catch (err: any) {
      console.error("Withdraw error:", err);
      alert("Failed to withdraw application. Please try again.");
    } finally {
      setWithdrawingId(null);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      'PENDING': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: ClockIcon },
      'REVIEWED': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: EyeIcon },
      'SHORTLISTED': { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckBadgeIcon },
      'REJECTED': { color: 'bg-red-100 text-red-800 border-red-200', icon: XMarkIcon },
      'HIRED': { color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: BriefcaseIcon }
    };
    return configs[status as keyof typeof configs] || { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: DocumentTextIcon };
  };

  const getTimeAgo = (days: number) => {
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <DashboardLayout 
      pageTitle="My Applications"
      pageDescription="Track and manage your job applications"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">My Applications</h1>
            <p className="text-gray-600 text-sm">
              Track your job applications and their status
            </p>
          </div>
          <Button 
            variant="primary" 
            size="lg"
            onClick={() => router.push('/Myjobs')}
            className="whitespace-nowrap"
          >
            Find More Jobs
          </Button>
        </div>

        {/* Stats Summary */}
        {applications.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{applications.length}</div>
              <div className="text-xs text-gray-600 mt-1">Total</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {applications.filter(app => app.status === 'PENDING').length}
              </div>
              <div className="text-xs text-gray-600 mt-1">Pending</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {applications.filter(app => app.status === 'REVIEWED').length}
              </div>
              <div className="text-xs text-gray-600 mt-1">Reviewed</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {applications.filter(app => app.status === 'SHORTLISTED').length}
              </div>
              <div className="text-xs text-gray-600 mt-1">Shortlisted</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {applications.filter(app => app.status === 'REJECTED').length}
              </div>
              <div className="text-xs text-gray-600 mt-1">Rejected</div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-red-800 font-medium">{error}</p>
                <button
                  onClick={fetchApplications}
                  className="text-red-600 hover:text-red-800 text-sm font-medium mt-1"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Applications List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center bg-white rounded-2xl border border-gray-200 p-12">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DocumentTextIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">
              You haven't applied to any jobs yet. Start your job search and apply to exciting opportunities.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push('/jobs')}
            >
              Browse Available Jobs
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => {
              const statusConfig = getStatusConfig(application.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <div key={application.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between gap-4">
                    {/* Company Logo and Basic Info */}
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                        {application.company_name?.charAt(0) || 'C'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {application.job_title}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <BuildingOfficeIcon className="w-4 h-4 mr-1" />
                          <span className="font-medium">{application.company_name}</span>
                          <span className="mx-2">•</span>
                          <span>{application.location}</span>
                        </div>
                        
                        {/* Application Details */}
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                          <div className="flex items-center">
                            <CalendarIcon className="w-3 h-3 mr-1" />
                            <span>Applied {getTimeAgo(application.days_ago || 0)}</span>
                          </div>
                          {application.employment_type && (
                            <>
                              <span>•</span>
                              <span>{application.employment_type}</span>
                            </>
                          )}
                          {application.work_type && (
                            <>
                              <span>•</span>
                              <span>{application.work_type}</span>
                            </>
                          )}
                        </div>

                        {/* Cover Letter Preview */}
                        {application.cover_letter && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-gray-500 mb-1">Cover Letter:</p>
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {application.cover_letter}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status and Actions */}
                    <div className="flex flex-col items-end gap-3">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                        <StatusIcon className="w-3 h-3 mr-1.5" />
                        {application.status}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleViewJob(application.job)}
                          icon={<EyeIcon className="w-3 h-3" />}
                        >
                          View Job
                        </Button>
                        {application.status === 'PENDING' && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleWithdrawApplication(application.id)}
                            isLoading={withdrawingId === application.id}
                            disabled={withdrawingId === application.id}
                            icon={<XMarkIcon className="w-3 h-3" />}
                          >
                            Withdraw
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}