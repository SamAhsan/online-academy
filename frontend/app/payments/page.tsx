'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Modal from '@/components/Modal';
import Loading from '@/components/Loading';
import { paymentsAPI, studentsAPI } from '@/lib/api';
import { Payment, Student } from '@/lib/types';
import { FiPlus, FiEdit, FiTrash2, FiCheckCircle, FiFilter } from 'react-icons/fi';
import { format } from 'date-fns';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [filterStatus, setFilterStatus] = useState('');

  const [formData, setFormData] = useState({
    student_id: '',
    month: '',
    amount: '',
    status: 'unpaid',
    notes: '',
  });

  useEffect(() => {
    fetchPayments();
    fetchStudents();
  }, [filterStatus]);

  const fetchPayments = async () => {
    try {
      const params: any = {};
      if (filterStatus) params.status = filterStatus;

      const data = await paymentsAPI.getAll(params);
      setPayments(data);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        student_id: parseInt(formData.student_id),
        amount: parseFloat(formData.amount),
      };

      if (editingPayment) {
        await paymentsAPI.update(editingPayment.id, submitData);
      } else {
        await paymentsAPI.create(submitData);
      }

      setIsModalOpen(false);
      resetForm();
      fetchPayments();
    } catch (error) {
      console.error('Failed to save payment:', error);
      alert('Failed to save payment');
    }
  };

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment);
    setFormData({
      student_id: payment.student_id.toString(),
      month: payment.month,
      amount: payment.amount.toString(),
      status: payment.status,
      notes: payment.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this payment record?')) {
      try {
        await paymentsAPI.delete(id);
        fetchPayments();
      } catch (error) {
        console.error('Failed to delete payment:', error);
        alert('Failed to delete payment');
      }
    }
  };

  const handleMarkPaid = async (id: number) => {
    try {
      await paymentsAPI.markPaid(id);
      fetchPayments();
    } catch (error) {
      console.error('Failed to mark payment as paid:', error);
      alert('Failed to mark payment as paid');
    }
  };

  const resetForm = () => {
    setFormData({
      student_id: '',
      month: '',
      amount: '',
      status: 'unpaid',
      notes: '',
    });
    setEditingPayment(null);
  };

  const openAddModal = () => {
    resetForm();
    // Set default month to current month
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setFormData({ ...formData, month: currentMonth });
    setIsModalOpen(true);
  };

  const getTotalRevenue = () => {
    return payments
      .filter((p) => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const getPendingRevenue = () => {
    return payments
      .filter((p) => p.status === 'unpaid')
      .reduce((sum, p) => sum + p.amount, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Payments</h1>
          <button onClick={openAddModal} className="btn btn-primary flex items-center space-x-2">
            <FiPlus />
            <span>Add Payment</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="card bg-green-50 border-2 border-green-200">
            <p className="text-sm text-gray-600 mb-1">Total Paid</p>
            <p className="text-3xl font-bold text-green-600">
              ${getTotalRevenue().toFixed(2)}
            </p>
          </div>
          <div className="card bg-red-50 border-2 border-red-200">
            <p className="text-sm text-gray-600 mb-1">Pending</p>
            <p className="text-3xl font-bold text-red-600">
              ${getPendingRevenue().toFixed(2)}
            </p>
          </div>
          <div className="card bg-blue-50 border-2 border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Total Records</p>
            <p className="text-3xl font-bold text-blue-600">{payments.length}</p>
          </div>
        </div>

        <div className="card mb-6">
          <div className="flex items-center space-x-4">
            <FiFilter className="text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input flex-1"
            >
              <option value="">All Statuses</option>
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
                    <th>Student</th>
                    <th>Month</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Paid Date</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="font-medium">{payment.student_name}</td>
                      <td>{payment.month}</td>
                      <td className="font-semibold">${payment.amount.toFixed(2)}</td>
                      <td>
                        <span
                          className={`badge ${
                            payment.status === 'paid' ? 'badge-success' : 'badge-danger'
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td>
                        {payment.paid_date
                          ? format(new Date(payment.paid_date), 'MMM dd, yyyy')
                          : '-'}
                      </td>
                      <td>{payment.notes || '-'}</td>
                      <td>
                        <div className="flex space-x-2">
                          {payment.status === 'unpaid' && (
                            <button
                              onClick={() => handleMarkPaid(payment.id)}
                              className="text-green-600 hover:text-green-800"
                              title="Mark as Paid"
                            >
                              <FiCheckCircle />
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(payment)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <FiEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(payment.id)}
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
          title={editingPayment ? 'Edit Payment' : 'Add Payment'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Student *</label>
              <select
                value={formData.student_id}
                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                className="input"
                required
              >
                <option value="">Select Student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Month *</label>
              <input
                type="month"
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Amount *</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingPayment ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
