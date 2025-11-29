'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import VideoClass from '@/components/VideoClass';
import Loading from '@/components/Loading';
import { lessonsAPI, dashboardAPI } from '@/lib/api';

export default function VideoClassPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = parseInt(params.lessonId as string);

  const [loading, setLoading] = useState(true);
  const [lessonData, setLessonData] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    const role = localStorage.getItem('userRole') || '';
    setUserRole(role);

    const fetchLessonData = async () => {
      try {
        const lesson = await lessonsAPI.getById(lessonId);

        // Get additional data based on role
        if (role === 'teacher') {
          const dashboardData = await dashboardAPI.getTeacherDashboard();
          const student = dashboardData.students.find((s: any) => s.id === lesson.student_id);

          setLessonData({
            ...lesson,
            studentName: student?.name || 'Unknown Student',
            teacherName: dashboardData.teacher_name,
            studentId: lesson.student_id,
            teacherId: dashboardData.teacher_id,
          });
        } else if (role === 'student') {
          const dashboardData = await dashboardAPI.getStudentDashboard();

          setLessonData({
            ...lesson,
            studentName: dashboardData.student_name,
            teacherName: dashboardData.assigned_teacher_name || 'Your Teacher',
            studentId: dashboardData.student_id,
            teacherId: lesson.teacher_id,
          });
        }
      } catch (error) {
        console.error('Error fetching lesson data:', error);
        alert('Could not load lesson data');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) {
      fetchLessonData();
    }
  }, [lessonId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!lessonData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Lesson not found</h1>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <VideoClass
      lessonId={lessonId}
      studentId={lessonData.studentId}
      teacherId={lessonData.teacherId}
      studentName={lessonData.studentName}
      teacherName={lessonData.teacherName}
      userRole={userRole as 'teacher' | 'student'}
    />
  );
}
