import React from 'react';

const AdminHeader = () => {
  return (
    <header style={{
      background: 'linear-gradient(135deg, #3E5F44 0%, #5E936C 100%)',
      color: 'white',
      padding: '8px 0',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        opacity: 0.3
      }}></div>
      
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Title Section */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '8px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                👨‍💼
              </div>
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                margin: '0',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                Admin Dashboard
              </h1>
            </div>
            <p style={{
              fontSize: '1.1rem',
              margin: '0',
              opacity: '0.9',
              fontWeight: '300'
            }}>
              Manage employee applications and workforce operations
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;