import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, subDays } from 'date-fns';

const Reports = () => {
  const [startDate, setStartDate] = useState(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState(new Date());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchReport = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`${API_BASE_URL}/api/reports/workouts`, {
        params: {
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd'),
        },
      });
      setReport(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch report');
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRange = (days) => {
    setEndDate(new Date());
    setStartDate(subDays(new Date(), days));
  };

  return (
    <div>
      <h1>Workout Reports</h1>

      <div className="card">
        <h2>Select Date Range</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
          <div className="form-group">
            <label>Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={setStartDate}
              dateFormat="yyyy-MM-dd"
              className="form-control"
              style={{ width: '100%', padding: '10px' }}
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <DatePicker
              selected={endDate}
              onChange={setEndDate}
              dateFormat="yyyy-MM-dd"
              className="form-control"
              style={{ width: '100%', padding: '10px' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <button
            className="btn btn-secondary"
            onClick={() => handleQuickRange(7)}
            style={{ marginRight: '10px' }}
          >
            Last 7 Days
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => handleQuickRange(30)}
            style={{ marginRight: '10px' }}
          >
            Last 30 Days
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => handleQuickRange(90)}
            style={{ marginRight: '10px' }}
          >
            Last 90 Days
          </button>
          <button className="btn btn-primary" onClick={fetchReport} disabled={loading}>
            {loading ? 'Loading...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {report && (
        <div>
          <div className="report-summary">
            <div className="report-card">
              <p>Total Workouts</p>
              <h3>{report.summary.totalWorkouts}</h3>
            </div>
            <div className="report-card">
              <p>Completed</p>
              <h3>{report.summary.completedWorkouts}</h3>
            </div>
            <div className="report-card">
              <p>Pending</p>
              <h3>{report.summary.pendingWorkouts}</h3>
            </div>
            <div className="report-card">
              <p>Completion Rate</p>
              <h3>{report.summary.completionPercentage}%</h3>
            </div>
            <div className="report-card">
              <p>🔥 Total Calories</p>
              <h3>{report.summary.completedWorkouts > 0 ? report.workouts.filter(w => w.isCompleted).reduce((sum, w) => sum + (w.totalCaloriesBurned || 0), 0) : 0} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>kcal</span></h3>
            </div>
          </div>

          <div className="card">
            <h2>Completion Progress</h2>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${report.summary.completionPercentage}%` }}
              >
                {report.summary.completionPercentage}%
              </div>
            </div>
          </div>

          {report.workoutsByDate.length > 0 && (
            <div className="card">
              <h2>Workouts by Date</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #dee2e6' }}>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Date</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Total</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Completed</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Pending</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.workoutsByDate.map((day) => (
                      <tr key={day.date} style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ padding: '10px' }}>
                          {format(new Date(day.date), 'MMM dd, yyyy')}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>{day.total}</td>
                        <td style={{ padding: '10px', textAlign: 'center', color: '#28a745' }}>
                          {day.completed}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center', color: '#ffc107' }}>
                          {day.pending}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {report.workouts.length > 0 && (
            <div className="card">
              <h2>All Workouts in Period</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #dee2e6' }}>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Date</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.workouts.map((workout) => (
                      <tr key={workout._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ padding: '10px' }}>{workout.name}</td>
                        <td style={{ padding: '10px' }}>
                          {format(new Date(workout.scheduledDate), 'MMM dd, yyyy')}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <span
                            className={`status-badge ${workout.isCompleted ? 'completed' : 'pending'}`}
                          >
                            {workout.isCompleted ? 'Completed' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;

