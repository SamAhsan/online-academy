'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Modal from '@/components/Modal';
import Loading from '@/components/Loading';
import { lessonsAPI, studentsAPI, teachersAPI, dashboardAPI } from '@/lib/api';
import { Lesson, Student, Teacher } from '@/lib/types';
import { FiPlay, FiSquare, FiClock, FiCalendar } from 'react-icons/fi';
import { format } from 'date-fns';

export default function LessonsPage() {
  const router = useRouter();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [startingLesson, setStartingLesson] = useState(false);

  const [formData, setFormData] = useState({
    student_id: '',
    teacher_id: '',
  });

  useEffect(() => {
    const role = localStorage.getItem('userRole') || '';
    setUserRole(role);

    if (role === 'teacher') {
      fetchTeacherData();
    }

    fetchLessons();
    fetchStudents();
    fetchTeachers();
  }, []);

  const fetchTeacherData = async () => {
    try {
      const dashboardData = await dashboardAPI.getTeacherDashboard();
      setTeacherId(dashboardData.teacher_id);
    } catch (error) {
      console.error('Failed to fetch teacher data:', error);
    }
  };

  const fetchLessons = async () => {
    try {
      const data = await lessonsAPI.getAll({ limit: 50 });
      setLessons(data);

      // Find active lesson (no end time)
      const active = data.find((lesson: Lesson) => !lesson.end_time);
      setActiveLesson(active || null);
    } catch (error) {
      console.error('Failed to fetch lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await studentsAPI.getAll();
      setStudents(data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const data = await teachersAPI.getAll();
      setTeachers(data);
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
    }
  };

  const handleStartLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setStartingLesson(true);

    try {
      // For teachers, use their ID automatically. For admin, use selected teacher
      const selectedTeacherId = userRole === 'teacher' ? teacherId : parseInt(formData.teacher_id);

      if (!selectedTeacherId) {
        alert('Teacher ID not found. Please refresh the page.');
        setStartingLesson(false);
        return;
      }

      const data = {
        student_id: parseInt(formData.student_id),
        teacher_id: selectedTeacherId,
      };

      const newLesson = await lessonsAPI.start(data);
      setIsStartModalOpen(false);
      resetForm();

      // Redirect to video class page for teachers
      if (userRole === 'teacher') {
        router.push(`/video-class/${newLesson.id}`);
      } else {
        // For admin, just refresh the lesson list
        setActiveLesson(newLesson);
        fetchLessons();
      }
    } catch (error) {
      console.error('Failed to start lesson:', error);
      alert('Failed to start lesson');
    } finally {
      setStartingLesson(false);
    }
  };

  const handleEndLesson = async () => {
    if (!activeLesson) return;

    try {
      await lessonsAPI.end(activeLesson.id);
      setActiveLesson(null);
      fetchLessons();
    } catch (error) {
      console.error('Failed to end lesson:', error);
      alert('Failed to end lesson');
    }
  };

  const resetForm = () => {
    setFormData({
      student_id: '',
      teacher_id: '',
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Lessons</h1>
          {activeLesson ? (
            <button
              onClick={handleEndLesson}
              className="btn btn-danger flex items-center space-x-2"
            >
              <FiSquare />
              <span>End Current Lesson</span>
            </button>
          ) : (
            <button
              onClick={() => setIsStartModalOpen(true)}
              className="btn btn-success flex items-center space-x-2"
            >
              <FiPlay />
              <span>Start Lesson</span>
            </button>
          )}
        </div>

        {activeLesson && (
          <div className="card mb-6 bg-green-50 border-2 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Active Lesson in Progress
                </h3>
                <p className="text-gray-700">
                  <strong>Student:</strong> {activeLesson.student_name}
                </p>
                <p className="text-gray-700">
                  <strong>Teacher:</strong> {activeLesson.teacher_name}
                </p>
                <p className="text-gray-700">
                  <strong>Started:</strong>{' '}
                  {format(new Date(activeLesson.start_time), 'MMM dd, yyyy hh:mm a')}
                </p>
              </div>
              <div className="text-center">
                <FiClock className="text-5xl text-green-600 mx-auto mb-2 animate-pulse" />
                <p className="text-sm text-gray-600">Lesson Running</p>
              </div>
            </div>
          </div>
        )}

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Recent Lessons</h2>
          {loading ? (
            <Loading />
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Student</th>
                    <th>Teacher</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Duration</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.map((lesson) => (
                    <tr key={lesson.id}>
                      <td>
                        <div className="flex items-center space-x-2">
                          <FiCalendar className="text-gray-400" />
                          <span>{format(new Date(lesson.date), 'MMM dd, yyyy')}</span>
                        </div>
                      </td>
                      <td className="font-medium">{lesson.student_name}</td>
                      <td>{lesson.teacher_name}</td>
                      <td>{format(new Date(lesson.start_time), 'hh:mm a')}</td>
                      <td>
                        {lesson.end_time
                          ? format(new Date(lesson.end_time), 'hh:mm a')
                          : '-'}
                      </td>
                      <td>{formatDuration(lesson.duration)}</td>
                      <td>
                        {lesson.end_time ? (
                          <span className="badge badge-success">Completed</span>
                        ) : (
                          <span className="badge badge-warning">In Progress</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Modal
          isOpen={isStartModalOpen}
          onClose={() => setIsStartModalOpen(false)}
          title={userRole === 'teacher' ? 'Start Video Class' : 'Start New Lesson'}
        >
          <form onSubmit={handleStartLesson} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Select Student *</label>
              <select
                value={formData.student_id}
                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                className="input"
                required
              >
                <option value="">Choose a student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Only show teacher selection for admin */}
            {userRole !== 'teacher' && (
              <div>
                <label className="block text-sm font-medium mb-1">Select Teacher *</label>
                <select
                  value={formData.teacher_id}
                  onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Choose a teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> {userRole === 'teacher'
                  ? 'You will be redirected to the video class page to start the lesson.'
                  : 'The lesson will start immediately. Click "End Lesson" when finished.'}
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsStartModalOpen(false)}
                className="btn btn-secondary"
                disabled={startingLesson}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-success" disabled={startingLesson}>
                {startingLesson ? 'Starting...' : (userRole === 'teacher' ? 'Start Video Class' : 'Start Lesson')}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
