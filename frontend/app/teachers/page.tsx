'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Modal from '@/components/Modal';
import Loading from '@/components/Loading';
import { teachersAPI } from '@/lib/api';
import { Teacher, TeacherWithStats } from '@/lib/types';
import { FiPlus, FiEdit, FiTrash2, FiClock, FiUsers } from 'react-icons/fi';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    status: 'active',
    subject: '',
    phone: '',
    email: '',
    username: '',
    password: '',
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const data = await teachersAPI.getAll();
      setTeachers(data);
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTeacher) {
        await teachersAPI.update(editingTeacher.id, formData);
      } else {
        await teachersAPI.create(formData);
      }

      setIsModalOpen(false);
      resetForm();
      fetchTeachers();
    } catch (error) {
      console.error('Failed to save teacher:', error);
      alert('Failed to save teacher');
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      status: teacher.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this teacher?')) {
      try {
        await teachersAPI.delete(id);
        fetchTeachers();
      } catch (error) {
        console.error('Failed to delete teacher:', error);
        alert('Failed to delete teacher');
      }
    }
  };

  const showStats = async (teacherId: number) => {
    try {
      const stats = await teachersAPI.getStats(teacherId);
      setSelectedTeacher(stats);
      setIsStatsModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch teacher stats:', error);
      alert('Failed to fetch teacher stats');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      status: 'active',
      subject: '',
      phone: '',
      email: '',
      username: '',
      password: '',
    });
    setEditingTeacher(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Teachers</h1>
          <button onClick={openAddModal} className="btn btn-primary flex items-center space-x-2">
            <FiPlus />
            <span>Add Teacher</span>
          </button>
        </div>

        <div className="card">
          {loading ? (
            <Loading />
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((teacher) => (
                    <tr key={teacher.id}>
                      <td className="font-medium">{teacher.name}</td>
                      <td>
                        <span
                          className={`badge ${
                            teacher.status === 'active'
                              ? 'badge-success'
                              : 'badge-danger'
                          }`}
                        >
                          {teacher.status}
                        </span>
                      </td>
                      <td>{new Date(teacher.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => showStats(teacher.id)}
                            className="text-purple-600 hover:text-purple-800"
                            title="View Statistics"
                          >
                            <FiClock />
                          </button>
                          <button
                            onClick={() => handleEdit(teacher)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <FiEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(teacher.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingTeacher ? 'Edit Teacher' : 'Add Teacher'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="input"
                  placeholder="e.g., Mathematics"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="input"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input"
                  placeholder="Phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            {!editingTeacher && (
              <>
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-lg font-semibold mb-3">Login Credentials</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Username *</label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="input"
                        required={!editingTeacher}
                        placeholder="Login username"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Password *</label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="input"
                        required={!editingTeacher}
                        placeholder="Login password"
                        minLength={6}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Teacher will use these credentials to login to their dashboard
                  </p>
                </div>
              </>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingTeacher ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>

        <Modal
          isOpen={isStatsModalOpen}
          onClose={() => setIsStatsModalOpen(false)}
          title={`Teacher Statistics: ${selectedTeacher?.name}`}
        >
          {selectedTeacher && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FiUsers className="text-blue-600 text-2xl" />
                  <div>
                    <p className="text-sm text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {selectedTeacher.total_students}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FiClock className="text-green-600 text-2xl" />
                  <div>
                    <p className="text-sm text-gray-600">Hours Today</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {selectedTeacher.daily_hours.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FiClock className="text-purple-600 text-2xl" />
                  <div>
                    <p className="text-sm text-gray-600">Hours This Month</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {selectedTeacher.monthly_hours.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
