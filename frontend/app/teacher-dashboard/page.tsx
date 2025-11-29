'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Loading from '@/components/Loading';
import { dashboardAPI, lessonsAPI, achievementsAPI } from '@/lib/api';
import { Student, Lesson } from '@/lib/types';
import {
  FiUsers,
  FiClock,
  FiBook,
  FiCalendar,
  FiPlay,
  FiSquare,
  FiTrendingUp,
  FiAward,
  FiX,
  FiStar,
  FiVideo,
} from 'react-icons/fi';

export default function TeacherDashboardPage() {
  const [myStudents, setMyStudents] = useState<Student[]>([]);
  const [todayLessons, setTodayLessons] = useState<Lesson[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [myHoursToday, setMyHoursToday] = useState(0);
  const [myHoursWeek, setMyHoursWeek] = useState(0);
  const [myHoursMonth, setMyHoursMonth] = useState(0);
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingLesson, setStartingLesson] = useState(false);
  const [stoppingLesson, setStoppingLesson] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [achievementForm, setAchievementForm] = useState({
    title: '',
    description: '',
    icon: 'trophy',
    color: 'yellow',
  });

  useEffect(() => {
    fetchTeacherData();
    // Refresh every 5 seconds to quickly detect when students call
    const interval = setInterval(fetchTeacherData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchTeacherData = async () => {
    try {
      // Get teacher's dashboard data using new API endpoint
      const dashboardData = await dashboardAPI.getTeacherDashboard();

      // Set teacher ID
      setTeacherId(dashboardData.teacher_id);

      // Set students
      setMyStudents(dashboardData.students || []);

      // Filter today's lessons
      const today = new Date().toISOString().split('T')[0];
      const todayLessonsData = (dashboardData.lessons || []).filter((lesson: any) =>
        lesson.start_time.startsWith(today)
      );
      setTodayLessons(todayLessonsData);

      // Find active lesson
      const active = todayLessonsData.find((lesson: any) => !lesson.end_time);
      setActiveLesson(active || null);

      // Set hours from backend
      setMyHoursToday(dashboardData.daily_hours || 0);
      setMyHoursWeek(dashboardData.weekly_hours || 0);
      setMyHoursMonth(dashboardData.monthly_hours || 0);
    } catch (error) {
      console.error('Failed to fetch teacher data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateHours = (lessons: Lesson[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    let hoursToday = 0;
    let hoursWeek = 0;
    let hoursMonth = 0;

    lessons.forEach((lesson: Lesson) => {
      if (lesson.duration) {
        const lessonDate = new Date(lesson.start_time);
        const hours = lesson.duration / 60;

        if (lessonDate >= today) hoursToday += hours;
        if (lessonDate >= weekAgo) hoursWeek += hours;
        if (lessonDate >= monthAgo) hoursMonth += hours;
      }
    });

    setMyHoursToday(hoursToday);
    setMyHoursWeek(hoursWeek);
    setMyHoursMonth(hoursMonth);
  };

  const handleStartLesson = async (studentId: number) => {
    if (!teacherId) {
      alert('Teacher ID not found. Please refresh the page.');
      return;
    }
    setStartingLesson(true);
    try {
      const lesson = await lessonsAPI.start({ student_id: studentId, teacher_id: teacherId });
      // Redirect to video class page
      window.location.href = `/video-class/${lesson.id}`;
    } catch (error) {
      console.error('Failed to start lesson:', error);
      alert('Failed to start lesson');
      setStartingLesson(false);
    }
  };

  const handleStopLesson = async () => {
    if (!activeLesson) return;
    setStoppingLesson(true);
    try {
      await lessonsAPI.stop(activeLesson.id);
      await fetchTeacherData();
    } catch (error) {
      console.error('Failed to stop lesson:', error);
      alert('Failed to stop lesson');
    } finally {
      setStoppingLesson(false);
    }
  };

  const handleOpenAchievementModal = (student: Student) => {
    setSelectedStudent(student);
    setAchievementForm({
      title: '',
      description: '',
      icon: 'trophy',
      color: 'yellow',
    });
    setShowAchievementModal(true);
  };

  const handleCloseAchievementModal = () => {
    setShowAchievementModal(false);
    setSelectedStudent(null);
    setAchievementForm({
      title: '',
      description: '',
      icon: 'trophy',
      color: 'yellow',
    });
  };

  const handleAwardAchievement = async () => {
    if (!selectedStudent) return;

    if (!achievementForm.title.trim()) {
      alert('Please enter an achievement title');
      return;
    }

    try {
      await achievementsAPI.create({
        student_id: selectedStudent.id,
        title: achievementForm.title,
        description: achievementForm.description,
        icon: achievementForm.icon,
        color: achievementForm.color,
      });
      alert(`Achievement "${achievementForm.title}" awarded to ${selectedStudent.name}!`);
      handleCloseAchievementModal();
    } catch (error) {
      console.error('Failed to award achievement:', error);
      alert('Failed to award achievement');
    }
  };

  const getActiveLessonDuration = () => {
    if (!activeLesson) return '0:00:00';
    const start = new Date(activeLesson.start_time);
    const now = new Date();
    const diff = Math.floor((now.getTime() - start.getTime()) / 1000);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Teacher Dashboard</h1>

        {/* Active Lesson Alert - when student calls */}
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
                    {activeLesson.student_name} has started a class!
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card bg-blue-50 border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">My Students</p>
                <p className="text-3xl font-bold text-blue-600">{myStudents.length}</p>
              </div>
              <FiUsers className="text-4xl text-blue-600" />
            </div>
          </div>

          <div className="card bg-green-50 border-2 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Hours Today</p>
                <p className="text-3xl font-bold text-green-600">
                  {myHoursToday.toFixed(1)}
                </p>
              </div>
              <FiClock className="text-4xl text-green-600" />
            </div>
          </div>

          <div className="card bg-purple-50 border-2 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Hours This Week</p>
                <p className="text-3xl font-bold text-purple-600">
                  {myHoursWeek.toFixed(1)}
                </p>
              </div>
              <FiTrendingUp className="text-4xl text-purple-600" />
            </div>
          </div>

          <div className="card bg-yellow-50 border-2 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Hours This Month</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {myHoursMonth.toFixed(1)}
                </p>
              </div>
              <FiCalendar className="text-4xl text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Active Lesson Timer */}
        {activeLesson && (
          <div className="card bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-red-500 rounded-full p-3 animate-pulse">
                  <FiPlay className="text-2xl text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Lesson</p>
                  <p className="text-2xl font-bold text-red-700">
                    {myStudents.find((s) => s.id === activeLesson.student_id)?.name ||
                      'Unknown Student'}
                  </p>
                  <p className="text-lg text-gray-700 font-mono">
                    {getActiveLessonDuration()}
                  </p>
                </div>
              </div>
              <button
                onClick={handleStopLesson}
                disabled={stoppingLesson}
                className="btn btn-danger flex items-center space-x-2"
              >
                <FiSquare />
                <span>{stoppingLesson ? 'Stopping...' : 'Stop Lesson'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Today's Lessons */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <FiBook className="text-2xl text-blue-600" />
              <h2 className="text-xl font-semibold">Today&apos;s Lessons</h2>
            </div>
            <span className="badge badge-primary">{todayLessons.length} lessons</span>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {todayLessons.map((lesson) => {
                  const student = myStudents.find((s) => s.id === lesson.student_id);
                  return (
                    <tr key={lesson.id}>
                      <td className="font-medium">{student?.name || 'Unknown'}</td>
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
                  );
                })}
                {todayLessons.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-500">
                      No lessons recorded today
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* My Students & Quick Actions */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <FiUsers className="text-2xl text-green-600" />
            <h2 className="text-xl font-semibold">My Students</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myStudents.map((student) => {
              const studentLessons = todayLessons.filter(
                (l) => l.student_id === student.id
              );
              const totalHours = studentLessons.reduce(
                (sum, l) => sum + (l.duration || 0),
                0
              ) / 60;
              const isActive = activeLesson?.student_id === student.id;

              return (
                <div
                  key={student.id}
                  className={`card ${
                    isActive
                      ? 'bg-red-50 border-2 border-red-300'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-lg">{student.name}</p>
                      {student.parent_contact && (
                        <p className="text-sm text-gray-500">{student.parent_contact}</p>
                      )}
                      {student.teams_id && (
                        <p className="text-xs text-blue-600">Teams: {student.teams_id}</p>
                      )}
                    </div>
                    <div className={`badge ${student.fee_status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                      {student.fee_status === 'paid' ? 'Paid' : 'Unpaid'}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    <p>Lessons today: {studentLessons.length}</p>
                    <p>Hours today: {totalHours.toFixed(2)}</p>
                  </div>
                  {!activeLesson && (
                    <div className="space-y-2">
                      <button
                        onClick={() => handleStartLesson(student.id)}
                        disabled={startingLesson}
                        className="btn btn-primary btn-sm w-full flex items-center justify-center space-x-2"
                      >
                        <FiPlay />
                        <span>
                          {startingLesson ? 'Starting...' : 'Start Lesson'}
                        </span>
                      </button>
                      <button
                        onClick={() => handleOpenAchievementModal(student)}
                        className="btn btn-sm w-full flex items-center justify-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white"
                      >
                        <FiAward />
                        <span>Award Achievement</span>
                      </button>
                    </div>
                  )}
                  {isActive && (
                    <div className="text-center">
                      <span className="badge badge-danger">Lesson in Progress</span>
                    </div>
                  )}
                </div>
              );
            })}
            {myStudents.length === 0 && (
              <div className="col-span-3 text-center text-gray-500 py-8">
                No students assigned yet
              </div>
            )}
          </div>
        </div>

        {/* Achievement Award Modal */}
        {showAchievementModal && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                  <FiAward className="text-yellow-500" />
                  <span>Award Achievement</span>
                </h2>
                <button
                  onClick={handleCloseAchievementModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX className="text-2xl" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-gray-600">
                  Award achievement to: <span className="font-semibold">{selectedStudent.name}</span>
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Achievement Title *</label>
                  <input
                    type="text"
                    value={achievementForm.title}
                    onChange={(e) => setAchievementForm({ ...achievementForm, title: e.target.value })}
                    className="input w-full"
                    placeholder="e.g., Excellent Performance"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={achievementForm.description}
                    onChange={(e) => setAchievementForm({ ...achievementForm, description: e.target.value })}
                    className="input w-full"
                    rows={3}
                    placeholder="Optional details about this achievement"
                    maxLength={500}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Icon</label>
                    <select
                      value={achievementForm.icon}
                      onChange={(e) => setAchievementForm({ ...achievementForm, icon: e.target.value })}
                      className="input w-full"
                    >
                      <option value="trophy">🏆 Trophy</option>
                      <option value="star">⭐ Star</option>
                      <option value="medal">🏅 Medal</option>
                      <option value="award">🎖️ Award</option>
                      <option value="crown">👑 Crown</option>
                      <option value="gem">💎 Gem</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Color</label>
                    <select
                      value={achievementForm.color}
                      onChange={(e) => setAchievementForm({ ...achievementForm, color: e.target.value })}
                      className="input w-full"
                    >
                      <option value="yellow">Yellow</option>
                      <option value="blue">Blue</option>
                      <option value="green">Green</option>
                      <option value="purple">Purple</option>
                      <option value="red">Red</option>
                      <option value="pink">Pink</option>
                    </select>
                  </div>
                </div>

                <div className="border rounded-lg p-3 bg-gray-50">
                  <p className="text-xs text-gray-600 mb-2">Preview:</p>
                  <div className={`bg-${achievementForm.color}-50 border-2 border-${achievementForm.color}-200 rounded-lg p-3`}>
                    <div className="flex items-center space-x-3">
                      <div className={`text-3xl`}>
                        {achievementForm.icon === 'trophy' && '🏆'}
                        {achievementForm.icon === 'star' && '⭐'}
                        {achievementForm.icon === 'medal' && '🏅'}
                        {achievementForm.icon === 'award' && '🎖️'}
                        {achievementForm.icon === 'crown' && '👑'}
                        {achievementForm.icon === 'gem' && '💎'}
                      </div>
                      <div>
                        <p className="font-semibold">{achievementForm.title || 'Achievement Title'}</p>
                        {achievementForm.description && (
                          <p className="text-sm text-gray-600">{achievementForm.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleCloseAchievementModal}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAwardAchievement}
                  className="btn btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  <FiStar />
                  <span>Award</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}