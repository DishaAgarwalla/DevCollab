import { useState, useEffect } from 'react';
import API from '../services/api';

export default function TestAuth() {
  const [token, setToken] = useState('');
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const parsed = JSON.parse(user);
      setToken(parsed.token || 'No token found');
    }
  }, []);

  const testCreateProject = async () => {
    try {
      const response = await API.post('/projects/create', {
        title: "Test Project",
        description: "Test Description",
        techStack: "React, Node",
        rolesNeeded: "Developer"
      });
      setTestResult({ success: true, data: response.data });
    } catch (error) {
      setTestResult({ success: false, error: error.response?.data || error.message });
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
      
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold">Current Token:</h2>
        <code className="text-sm break-all">{token}</code>
      </div>
      
      <button 
        onClick={testCreateProject}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Test Create Project
      </button>
      
      {testResult && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="font-semibold">Result:</h2>
          <pre className="text-sm">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}