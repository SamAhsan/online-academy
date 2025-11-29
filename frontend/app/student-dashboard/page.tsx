'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Loading from '@/components/Loading';
import { dashboardAPI, achievementsAPI, lessonsAPI } from '@/lib/api';
import { Lesson, Payment } from '@/lib/types';
import { useRouter } from 'next/navigation';
import {
  FiBook,
  FiClock,
  FiCalendar,
  FiTrendingUp,
  FiDollarSign,
  FiCheckCircle,
  FiAlertCircle,
  FiAward,
  FiStar,
  FiVideo,
} from 'react-icons/fi';
// Temporarily disabled chart.js to fix webpack loading issue
// import { Line } from 'react-chartjs-2';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
// } from 'chart.js';

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend
// );

export default function StudentDashboardPage() {
  const router = useRouter();
  const [myLessons, setMyLessons] = useState<Lesson[]>([]);
  const [myPayments, setMyPayments] = useState<Payment[]>([]);
  const [myAchievements, setMyAchievements] = useState<any[]>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState(100);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalUnpaid, setTotalUnpaid] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [startingLesson, setStartingLesson] = useState(false);

  useEffect(() => {
    fetchStudentData();
    // Poll for active lesson every 5 seconds
    const interval = setInterval(fetchStudentData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStudentData = async () => {
    try {
      // Get student's dashboard data using new API endpoint
      const dashboardData = await dashboardAPI.getStudentDashboard();

      // Set student and teacher IDs
      setStudentId(dashboardData.student_id);
      setTeacherId(dashboardData.assigned_teacher_id);

      // Set lessons
      const lessons = dashboardData.lessons || [];
      setMyLessons(lessons);
      setTotalLessons(dashboardData.total_lessons || 0);
      setTotalHours(dashboardData.total_hours || 0);
      setAttendanceRate(dashboardData.attendance_rate || 0);

      // Find active lesson (one without end_time)
      const active = lessons.find((lesson: Lesson) => !lesson.end_time);
      setActiveLesson(active || null);

      // Set payments
      setMyPayments(dashboardData.payments || []);

      // Calculate payment totals
      const paid = (dashboardData.payments || [])
        .filter((p: any) => p.status === 'paid')
        .reduce((sum: number, p: any) => sum + p.amount, 0);
      const unpaid = (dashboardData.payments || [])
        .filter((p: any) => p.status === 'unpaid')
        .reduce((sum: number, p: any) => sum + p.amount, 0);
      setTotalPaid(paid);
      setTotalUnpaid(unpaid);

      // Fetch achievements awarded by teachers
      const achievements = await achievementsAPI.getAll();
      setMyAchievements(achievements || []);
    } catch (error) {
      console.error('Failed to fetch student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAchievements = () => {
    const achievements = [];
    if (totalHours >= 10) achievements.push({ name: '10 Hours Milestone', icon: '🎯', type: 'auto' });
    if (totalHours >= 50) achievements.push({ name: '50 Hours Milestone', icon: '🏆', type: 'auto' });
    if (totalHours >= 100) achievements.push({ name: '100 Hours Champion', icon: '👑', type: 'auto' });
    if (totalLessons >= 20) achievements.push({ name: '20 Lessons Completed', icon: '📚', type: 'auto' });
    if (attendanceRate === 100) achievements.push({ name: 'Perfect Attendance', icon: '⭐', type: 'auto' });
    return achievements;
  };

  const handleStartLesson = async () => {
    if (!studentId || !teacherId) {
      alert('Student or teacher information not found. Please refresh the page.');
      return;
    }

    setStartingLesson(true);
    try {
      const lesson = await lessonsAPI.start({ student_id: studentId, teacher_id: teacherId });
      router.push(`/video-class/${lesson.id}`);
    } catch (error) {
      console.error('Failed to start lesson:', error);
      alert('Failed to start lesson');
      setStartingLesson(false);
    }
  };

  const getIconEmoji = (icon: string) => {
    const icons: any = {
      trophy: '🏆',
      star: '⭐',
      medal: '🏅',
      award: '🎖️',
      crown: '👑',
      gem: '💎',
    };
    return icons[icon] || '🏆';
  };

  const getColorClasses = (color: string) => {
    const colors: any = {
      yellow: 'from-yellow-50 to-orange-50 border-yellow-300',
      blue: 'from-blue-50 to-blue-100 border-blue-300',
      green: 'from-green-50 to-green-100 border-green-300',
      purple: 'from-purple-50 to-purple-100 border-purple-300',
      red: 'from-red-50 to-red-100 border-red-300',
      pink: 'from-pink-50 to-pink-100 border-pink-300',
    };
    return colors[color] || colors.yellow;
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Student Dashboard</h1>
          {teacherId && !activeLesson && (
            <button
              onClick={handleStartLesson}
              disabled={startingLesson}
              className="btn btn-primary flex items-center space-x-2"
            >
              <FiVideo />
              <span>{startingLesson ? 'Starting...' : 'Call Teacher'}</span>
            </button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card bg-blue-50 border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Lessons</p>
                <p className="text-3xl font-bold text-blue-600">{totalLessons}</p>
              </div>
              <FiBook className="text-4xl text-blue-600" />
            </div>
          </div>

          <div className="card bg-green-50 border-2 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Hours</p>
                <p className="text-3xl font-bold text-green-600">
                  {totalHours.toFixed(1)}
                </p>
              </div>
              <FiClock className="text-4xl text-green-600" />
            </div>
          </div>

          <div className="card bg-purple-50 border-2 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Attendance Rate</p>
                <p className="text-3xl font-bold text-purple-600">{attendanceRate}%</p>
              </div>
              <FiCheckCircle className="text-4xl text-purple-600" />
            </div>
          </div>

          <div className="card bg-yellow-50 border-2 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Payment Status</p>
                <p className="text-3xl font-bold text-yellow-600">
                  ${totalPaid.toFixed(0)}
                </p>
                <p className="text-xs text-red-600">${totalUnpaid.toFixed(0)} pending</p>
              </div>
              <FiDollarSign className="text-4xl text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Active Lesson Alert */}
        {activeLesson && (
          <div className="card bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 mb-8 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-green-500 rounded-full p-3 animate-pulse">
                  <FiVideo className="text-2xl text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Class in Progress</p>
                  <p className="text-xl font-bold text-green-700">
                    Your teacher has started a class!
                  </p>
                  <p className="text-sm text-gray-600">
                    Started at {new Date(activeLesson.start_time).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => window.location.href = `/video-class/${activeLesson.id}`}
                className="btn btn-success flex items-center space-x-2 animate-bounce"
              >
                <FiVideo />
                <span>Join Class</span>
              </button>
            </div>
          </div>
        )}

        {/* Payment Alert */}
        {totalUnpaid > 0 && (
          <div className="card bg-red-50 border-2 border-red-200 mb-8">
            <div className="flex items-center space-x-3">
              <FiAlertCircle className="text-3xl text-red-600" />
              <div>
                <p className="text-lg font-semibold text-red-800">
                  You have ${totalUnpaid.toFixed(2)} in unpaid fees
                </p>
                <p className="text-sm text-red-600">
                  Please contact your administrator to settle your payments
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Chart - Temporarily disabled due to chart.js webpack issue */}
        {/* {chartData && (
          <div className="card mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <FiTrendingUp className="text-2xl text-blue-600" />
              <h2 className="text-xl font-semibold">Learning Progress (Last 30 Days)</h2>
            </div>
            <Line
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Hours',
                    },
                  },
                },
              }}
            />
          </div>
        )} */}

        {/* Achievements */}
        <div className="card mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <FiAward className="text-2xl text-yellow-600" />
            <h2 className="text-xl font-semibold">Achievements</h2>
          </div>

          {/* Teacher-Awarded Achievements */}
          {myAchievements.length > 0 && (
            <div className="mb-6">
              <h3 className="text-md font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                <FiStar className="text-yellow-500" />
                <span>Teacher Awards</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myAchievements.map((achievement: any) => (
                  <div
                    key={achievement.id}
                    className={`card bg-gradient-to-br ${getColorClasses(achievement.color)} border-2 hover:shadow-lg transition-shadow`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-4xl flex-shrink-0">
                        {getIconEmoji(achievement.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 mb-1">{achievement.title}</p>
                        {achievement.description && (
                          <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          Awarded {new Date(achievement.awarded_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Automatic Milestones */}
          {getAchievements().length > 0 && (
            <div>
              <h3 className="text-md font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                <FiTrendingUp className="text-blue-500" />
                <span>Milestones</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {getAchievements().map((achievement, index) => (
                  <div
                    key={index}
                    className="card bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 text-center hover:shadow-lg transition-shadow"
                  >
                    <div className="text-4xl mb-2">{achievement.icon}</div>
                    <p className="text-sm font-semibold">{achievement.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {myAchievements.length === 0 && getAchievements().length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <FiAward className="text-5xl text-gray-400 mx-auto mb-3" />
              <p>Complete lessons and perform well to unlock achievements!</p>
            </div>
          )}
        </div>

        {/* Lesson History */}
        <div className="card mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <FiCalendar className="text-2xl text-green-600" />
            <h2 className="text-xl font-semibold">My Lesson History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Teacher</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {myLessons
                  .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
                  .slice(0, 20)
                  .map((lesson: any) => (
                    <tr key={lesson.id}>
                      <td>
                        {new Date(lesson.start_time).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="font-medium">{lesson.teacher_name || 'Unknown'}</td>
                      <td>{new Date(lesson.start_time).toLocaleTimeString()}</td>
                      <td>
                        {lesson.end_time
                          ? new Date(lesson.end_time).toLocaleTimeString()
                          : '-'}
                      </td>
                      <td>
                        {lesson.end_time
                          ? `${(lesson.duration / 60).toFixed(2)} hrs`
                          : 'In Progress'}
                      </td>
                      <td>
                        {lesson.end_time ? (
                          <span className="badge badge-success">Completed</span>
                        ) : (
                          <span className="badge badge-warning">Active</span>
                        )}
                      </td>
                    </tr>
                  ))}
                {myLessons.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-500">
                      No lessons recorded yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment History */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <FiDollarSign className="text-2xl text-blue-600" />
            <h2 className="text-xl font-semibold">Payment History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Amount</th>
                  <th>Paid Date</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {myPayments
                  .sort((a, b) => b.month.localeCompare(a.month))
                  .map((payment) => (
                    <tr key={payment.id}>
                      <td className="font-medium">{payment.month}</td>
                      <td className="font-semibold">${payment.amount.toFixed(2)}</td>
                      <td>
                        {payment.paid_date
                          ? new Date(payment.paid_date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : '-'}
                      </td>
                      <td>
                        {payment.status === 'paid' ? (
                          <span className="badge badge-success">Paid</span>
                        ) : (
                          <span className="badge badge-danger">Unpaid</span>
                        )}
                      </td>
                      <td className="text-sm text-gray-600">{payment.notes || '-'}</td>
                    </tr>
                  ))}
                {myPayments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-500">
                      No payment records yet
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