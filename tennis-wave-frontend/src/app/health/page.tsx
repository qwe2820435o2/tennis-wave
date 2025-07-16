export default function HealthPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Health Check</h1>
      <p>Status: Healthy</p>
      <p>Timestamp: {new Date().toISOString()}</p>
    </div>
  );
} 