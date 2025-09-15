import React from 'react';
import '../styles/MedicalHistory.css';

const MedicalHistoryPage = () => {
  // Sample data - in a real app, this would come from an API or database
  const historyData = [
    {
      date: "09-09-2025",
      rightEye: "Normal",
      leftEye: "Cataract",
      id: 1
    },
    {
      date: "11-07-2025",
      rightEye: "Normal",
      leftEye: "Cataract",
      id: 2
    },
    {
      date: "19-04-2025",
      rightEye: "Normal",
      leftEye: "Normal",
      id: 3
    }
  ];

  // Function to determine status color
  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'normal':
        return '#27ae60';
      case 'cataract':
        return '#e67e22';
      default:
        return '#7f8c8d';
    }
  };

  return (
    <div className="medical-history-container">
      <div className="medical-history-card">
        <div className="history-header">
          <h1>Medical History</h1>
          <div className="patient-info">
            <div className="patient-avatar">
              {historyData[0] ? historyData[0].name?.charAt(0) || 'M' : 'M'}
            </div>
            <div className="patient-details">
              <h2>Marie GILOT</h2>
              <p>Patient ID: PT-123456</p>
            </div>
          </div>
        </div>
        
        <div className="history-content">
          <div className="history-filters">
            <div className="filter-group">
              <label htmlFor="sort-by">Sort by:</label>
              <select id="sort-by">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="eye-filter">Eye status:</label>
              <select id="eye-filter">
                <option value="all">All</option>
                <option value="normal">Normal</option>
                <option value="cataract">Cataract</option>
              </select>
            </div>
          </div>
          
          <div className="history-list">
            {historyData.map((record) => (
              <div key={record.id} className="history-record">
                <div className="record-date">
                  <div className="date-badge">
                    {record.date}
                  </div>
                </div>
                
                <div className="record-content">
                  <div className="eye-status">
                    <div className="status-item">
                      <span className="eye-label">Right Eye:</span>
                      <span 
                        className="status-badge"
                        style={{backgroundColor: getStatusColor(record.rightEye)}}
                      >
                        {record.rightEye}
                      </span>
                    </div>
                    <div className="status-item">
                      <span className="eye-label">Left Eye:</span>
                      <span 
                        className="status-badge"
                        style={{backgroundColor: getStatusColor(record.leftEye)}}
                      >
                        {record.leftEye}
                      </span>
                    </div>
                  </div>
                  
                  <div className="record-actions">
                    <button className="view-details-btn">
                      View Details
                    </button>
                    <button className="download-report-btn">
                      Download Report
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="history-actions">
          <button className="new-examination-btn">
            Schedule New Examination
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicalHistoryPage;