'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Modal from '@/components/Modal';
import Loading from '@/components/Loading';
import { studentsAPI, teachersAPI } from '@/lib/api';
import { Student, Teacher } from '@/lib/types';
import { FiPlus, FiEdit, FiTrash2, FiFilter } from 'react-icons/fi';

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [filterTeacher, setFilterTeacher] = useState('');
  const [filterFeeStatus, setFilterFeeStatus] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    parent_contact: '',
    teams_id: '',
    assigned_teacher_id: '',
    schedule: '',
    fee_amount: '',
    fee_status: 'unpaid',
    notes: '',
    username: '',
    password: '',
  });

  useEffect(() => {
    fetchStudents();
    fetchTeachers();
  }, [filterTeacher, filterFeeStatus]);

  const fetchStudents = async () => {
    try {
      const params: any = {};
      if (filterTeacher) params.teacher_id = filterTeacher;
      if (filterFeeStatus) params.fee_status = filterFeeStatus;

      const data = await studentsAPI.getAll(params);
      setStudents(data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        assigned_teacher_id: formData.assigned_teacher_id ? parseInt(formData.assigned_teacher_id) : null,
        fee_amount: parseFloat(formData.fee_amount) || 0,
      };

      if (editingStudent) {
        await studentsAPI.update(editingStudent.id, submitData);
      } else {
        await studentsAPI.create(submitData);
      }

      setIsModalOpen(false);
      resetForm();
      fetchStudents();
    } catch (error) {
      console.error('Failed to save student:', error);
      alert('Failed to save student');
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      parent_contact: student.parent_contact || '',
      teams_id: student.teams_id || '',
      assigned_teacher_id: student.assigned_teacher_id?.toString() || '',
      schedule: student.schedule || '',
      fee_amount: student.fee_amount.toString(),
      fee_status: student.fee_status,
      notes: student.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this student?')) {
      try {
        await studentsAPI.delete(id);
        fetchStudents();
      } catch (error) {
        console.error('Failed to delete student:', error);
        alert('Failed to delete student');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      parent_contact: '',
      teams_id: '',
      assigned_teacher_id: '',
      schedule: '',
      fee_amount: '',
      fee_status: 'unpaid',
      notes: '',
      username: '',
      password: '',
    });
    setEditingStudent(null);
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
          <h1 className="text-3xl font-bold text-gray-800">Students</h1>
          <button onClick={openAddModal} className="btn btn-primary flex items-center space-x-2">
            <FiPlus />
            <span>Add Student</span>
          </button>
        </div>

        <div className="card mb-6">
          <div className="flex items-center space-x-4">
            <FiFilter className="text-gray-400" />
            <select
              value={filterTeacher}
              onChange={(e) => setFilterTeacher(e.target.value)}
              className="input flex-1"
            >
              <option value="">All Teachers</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
            <select
              value={filterFeeStatus}
              onChange={(e) => setFilterFeeStatus(e.target.value)}
              className="input flex-1"
            >
              <option value="">All Fee Status</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
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
                    <th>Parent Contact</th>
                    <th>Teams ID</th>
                    <th>Teacher</th>
                    <th>Schedule</th>
                    <th>Fee Amount</th>
                    <th>Fee Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td className="font-medium">{student.name}</td>
                      <td>{student.parent_contact || '-'}</td>
                      <td>
                        {student.teams_id ? (
                          <span className="badge badge-info">{student.teams_id}</span>
                        ) : (
                          <span className="badge badge-warning">Not Set</span>
                        )}
                      </td>
                      <td>{student.teacher_name || '-'}</td>
                      <td>{student.schedule || '-'}</td>
                      <td>${student.fee_amount.toFixed(2)}</td>
                      <td>
                        <span
                          className={`badge ${
                            student.fee_status === 'paid'
                              ? 'badge-success'
                              : 'badge-danger'
                          }`}
                        >
                          {student.fee_status}
                        </span>
                      </td>
                      <td>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(student)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <FiEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(student.id)}
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
          title={editingStudent ? 'Edit Student' : 'Add Student'}
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

            <div>
              <label className="block text-sm font-medium mb-1">Parent Contact</label>
              <input
                type="text"
                value={formData.parent_contact}
                onChange={(e) => setFormData({ ...formData, parent_contact: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Microsoft Teams ID</label>
              <input
                type="text"
                value={formData.teams_id}
                onChange={(e) => setFormData({ ...formData, teams_id: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Assigned Teacher</label>
              <select
                value={formData.assigned_teacher_id}
                onChange={(e) => setFormData({ ...formData, assigned_teacher_id: e.target.value })}
                className="input"
              >
                <option value="">Select Teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Schedule</label>
              <input
                type="text"
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                className="input"
                placeholder="e.g., Mon-Wed-Fri 3:00 PM"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Fee Amount *</label>
              <input
                type="number"
                step="0.01"
                value={formData.fee_amount}
                onChange={(e) => setFormData({ ...formData, fee_amount: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Fee Status</label>
              <select
                value={formData.fee_status}
                onChange={(e) => setFormData({ ...formData, fee_status: e.target.value })}
                className="input"
              >
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input"
                rows={3}
              />
            </div>

            {!editingStudent && (
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
                        required={!editingStudent}
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
                        required={!editingStudent}
                        placeholder="Login password"
                        minLength={6}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Student will use these credentials to login to their dashboard
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
                {editingStudent ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
