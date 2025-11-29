'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Loading from '@/components/Loading';
import { dashboardAPI } from '@/lib/api';
import { DashboardStats, TeacherDailyHours, StudentLessonHistory } from '@/lib/types';
import {
  FiUsers,
  FiUserCheck,
  FiDollarSign,
  FiBook,
  FiAlertCircle,
  FiClock,
} from 'react-icons/fi';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [teacherHours, setTeacherHours] = useState<TeacherDailyHours[]>([]);
  const [studentHistory, setStudentHistory] = useState<StudentLessonHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsData, hoursData, historyData] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getTeacherHours(),
        dashboardAPI.getStudentHistory(),
      ]);

      setStats(statsData);
      setTeacherHours(hoursData);
      setStudentHistory(historyData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

        {stats && (
          <>
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="card bg-blue-50 border-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Students</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.total_students}</p>
                  </div>
                  <FiUsers className="text-4xl text-blue-600" />
                </div>
              </div>

              <div className="card bg-green-50 border-2 border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Active Teachers</p>
                    <p className="text-3xl font-bold text-green-600">
                      {stats.active_teachers}
                    </p>
                    <p className="text-xs text-gray-500">of {stats.total_teachers} total</p>
                  </div>
                  <FiUserCheck className="text-4xl text-green-600" />
                </div>
              </div>

              <div className="card bg-purple-50 border-2 border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Lessons Today</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {stats.lessons_today}
                    </p>
                    <p className="text-xs text-gray-500">
                      {stats.lessons_this_month} this month
                    </p>
                  </div>
                  <FiBook className="text-4xl text-purple-600" />
                </div>
              </div>

              <div className="card bg-yellow-50 border-2 border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Revenue This Month</p>
                    <p className="text-3xl font-bold text-yellow-600">
                      ${stats.total_revenue_this_month.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      ${stats.pending_revenue_this_month.toFixed(2)} pending
                    </p>
                  </div>
                  <FiDollarSign className="text-4xl text-yellow-600" />
                </div>
              </div>
            </div>

            {/* Alerts Section */}
            {(stats.unpaid_students > 0 || stats.students_without_teams_id > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {stats.unpaid_students > 0 && (
                  <div className="card bg-red-50 border-2 border-red-200">
                    <div className="flex items-center space-x-3">
                      <FiAlertCircle className="text-3xl text-red-600" />
                      <div>
                        <p className="text-lg font-semibold text-red-800">
                          {stats.unpaid_students} Students with Unpaid Fees
                        </p>
                        <p className="text-sm text-red-600">Action required</p>
                      </div>
                    </div>
                  </div>
                )}

                {stats.students_without_teams_id > 0 && (
                  <div className="card bg-orange-50 border-2 border-orange-200">
                    <div className="flex items-center space-x-3">
                      <FiAlertCircle className="text-3xl text-orange-600" />
                      <div>
                        <p className="text-lg font-semibold text-orange-800">
                          {stats.students_without_teams_id} Students Without Teams ID
                        </p>
                        <p className="text-sm text-orange-600">Setup needed</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Teacher Hours Today */}
        <div className="card mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <FiClock className="text-2xl text-blue-600" />
            <h2 className="text-xl font-semibold">Teacher Hours Today</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Teacher Name</th>
                  <th>Hours Today</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                {teacherHours.map((teacher) => (
                  <tr key={teacher.teacher_id}>
                    <td className="font-medium">{teacher.teacher_name}</td>
                    <td>{teacher.total_hours.toFixed(2)} hours</td>
                    <td>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min((teacher.total_hours / 8) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
                {teacherHours.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center text-gray-500">
                      No lessons recorded today
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Student Lesson History */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <FiBook className="text-2xl text-green-600" />
            <h2 className="text-xl font-semibold">Student Lesson History (Top 10)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Total Lessons</th>
                  <th>Total Hours</th>
                </tr>
              </thead>
              <tbody>
                {studentHistory
                  .sort((a, b) => b.total_lessons - a.total_lessons)
                  .slice(0, 10)
                  .map((student) => (
                    <tr key={student.student_id}>
                      <td className="font-medium">{student.student_name}</td>
                      <td>{student.total_lessons}</td>
                      <td>{student.total_hours.toFixed(2)} hours</td>
                    </tr>
                  ))}
                {studentHistory.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center text-gray-500">
                      No lesson history available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
