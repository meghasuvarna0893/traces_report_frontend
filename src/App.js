import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);
  const [filePath, setFilePath] = useState('trace.har');

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      // Get main analysis
      const mainResponse = await axios.post('/api/analyze', {
        file_path: filePath
      });

      if (!mainResponse.data.success) {
        throw new Error(mainResponse.data.error || 'Main analysis failed');
      }
      // Combine results into comprehensive report
      const mainData = mainResponse.data.data;

      const comprehensiveReport = {
        summary: {
          total_requests: mainData.summary.total_requests,
          total_errors: mainData.summary.total_errors,
          total_patterns: mainData.path_pattern_analysis.total_patterns,
          success_rate: mainData.summary.success_rate,
          error_4xx: mainData.summary.error_types?.['4xx'] || 0,
          error_5xx: mainData.summary.error_types?.['5xx'] || 0
        },

        slowest_apis: mainData.slowest_apis,
        request_purposes: mainData.request_purposes,
        pattern_analysis: {
          top_patterns_by_requests: mainData.path_pattern_analysis.top_ten_traffic_patterns,
          top_patterns_by_errors: mainData.path_pattern_analysis.top_ten_error_patterns
        },

        response_codes: mainData.response_codes,
        analysis_info: {
          file_path: mainData.file_path,
          timestamp: mainData.analysis_timestamp,
          cached: mainResponse.data.cached
        }
      };

      setReport(comprehensiveReport);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ number, label, color = '#667eea' }) => (
    <div className="stat-card" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="stat-number" style={{ color }}>{number}</div>
      <div className="stat-label">{label}</div>
    </div>
  );

  const ResponseCodeItem = ({ code, count }) => (
    <div className="code-item">
      <div className="code-number">{code}</div>
      <div className="code-count">{count} responses</div>
    </div>
  );



  const EndpointItem = ({ endpoint, type = 'endpoint' }) => (
    <li className="endpoint-item" style={{ 
      borderLeft: type === 'slow' ? '4px solid #ff6b6b' : 
                  type === 'error' ? '4px solid #ff4757' : 
                  '4px solid #667eea' 
    }}>
      <div className="endpoint-url">
        <strong>{endpoint.method || endpoint.url?.split(' ')[0]}</strong> {endpoint.url || endpoint.pattern}
      </div>
      <div className="endpoint-details">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
          <div><strong>Total Requests:</strong> {endpoint.total_requests}</div>
          {type === 'slow' && endpoint.max_latency_ms && <div><strong>Max Latency:</strong> {endpoint.max_latency_ms}ms</div>}
          {type !== 'slow' && (
            <>
              <div><strong>Success Rate:</strong> {endpoint.success_rate || 'N/A'}%</div>
              <div><strong>200 Success:</strong> {endpoint.success_count || 'N/A'}</div>
              <div><strong>4xx Errors:</strong> {endpoint.error_4xx_count || 0}</div>
              <div><strong>5xx Errors:</strong> {endpoint.error_5xx_count || 0}</div>
              <div><strong>Avg Latency:</strong> {endpoint.avg_latency_ms || 'N/A'}ms</div>
              {endpoint.max_latency_ms && <div><strong>Max Latency:</strong> {endpoint.max_latency_ms}ms</div>}
            </>
          )}
        </div>
       
        {endpoint.example_urls && endpoint.example_urls.length > 0 && (
          <div style={{ marginTop: '0.5rem' }}>
            <strong>Example URLs:</strong>
            <ul style={{ margin: '0.25rem 0 0 1.5rem', fontSize: '0.85rem' }}>
              {endpoint.example_urls.slice(0, 2).map((url, index) => (
                <li key={index} style={{ wordBreak: 'break-all' }}>{url}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </li>
  );

  return (
    <div className="App">
      <div className="header">
        <h1>HAR Analyzer</h1>
        <p>Comprehensive HTTP Archive Analysis Report</p>
      </div>

      <div className="container">
        {/* Analysis Controls */}
        <div className="card">
          <h2>Generate Analysis Report</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
            <input
              type="text"
              value={filePath}
              onChange={(e) => setFilePath(e.target.value)}
              placeholder="Enter HAR file path"
              style={{
                flex: 1,
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
            />
            <button
              className="button"
              onClick={generateReport}
              disabled={loading}
              style={{ 
                backgroundColor: '#28a745',
                fontSize: '1.1rem',
                padding: '14px 28px'
              }}
            >
              {loading ? 'Generating Report...' : '📊 Generate Report'}
            </button>
          </div>
          
          <p style={{ color: '#666', fontSize: '0.9rem' }}>
            Default file: trace.har (329MB) - This will generate a comprehensive report with pattern analysis
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading">
            <h3>🔄 Generating Comprehensive Report...</h3>
            <p>Analyzing HAR file and inferring patterns, please wait...</p>
          </div>
        )}

        {/* Comprehensive Report */}
        {report && (
          <>
            {/* Executive Summary */}
            <div className="card">
              <h2>📋 Executive Summary</h2>
              <div className="stats-grid">
                <StatCard
                  number={report.summary.total_requests.toLocaleString()}
                  label="Total Requests"
                  color="#667eea"
                />
                <StatCard
                  number={report.summary.total_errors.toLocaleString()}
                  label="Total Errors"
                  color="#ff4757"
                />

                <StatCard
                  number={report.summary.total_patterns.toLocaleString()}
                  label="Total Resources"
                  color="#ffa502"
                />
                <StatCard
                  number={report.summary.success_rate}
                  label="Success Rate (%)"
                  color="#3742fa"
                />
        
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                <div style={{ background: '#fff3cd', padding: '1rem', borderRadius: '6px', border: '1px solid #ffeaa7' }}>
                  <strong>4xx Errors:</strong> {report.summary.error_4xx.toLocaleString()}
                </div>
                <div style={{ background: '#f8d7da', padding: '1rem', borderRadius: '6px', border: '1px solid #f5c6cb' }}>
                  <strong>5xx Errors:</strong> {report.summary.error_5xx.toLocaleString()}
                </div>
              </div>
            </div>



            {/* Request Purpose Analysis */}
            <div className="card">
              <h2>🔍 Request Purpose Analysis</h2>
              <p style={{ color: '#666', marginBottom: '1rem' }}>
                Categorized breakdown of request types and their performance characteristics
              </p>
              {report.request_purposes && Object.keys(report.request_purposes).length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                  {Object.entries(report.request_purposes).map(([key, category]) => (
                    <div key={key} style={{ 
                      border: '1px solid #e1e5e9', 
                      borderRadius: '8px', 
                      padding: '1rem',
                      backgroundColor: '#f8f9fa'
                    }}>
                      <h3 style={{ 
                        margin: '0 0 0.5rem 0', 
                        color: '#495057',
                        fontSize: '1.1rem',
                        fontWeight: 'bold'
                      }}>
                        {category.name}
                      </h3>
                      <p style={{ 
                        margin: '0 0 1rem 0', 
                        color: '#6c757d', 
                        fontSize: '0.9rem',
                        lineHeight: '1.4'
                      }}>
                        {category.description}
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
                        <div><strong>Total Requests:</strong> {category.total_requests.toLocaleString()}</div>
                  
                      </div>
                      {category.examples.length > 0 && (
                        <div style={{ marginTop: '0.75rem' }}>
                          <strong style={{ fontSize: '0.85rem', color: '#495057' }}>Examples:</strong>
                          <ul style={{ 
                            margin: '0.25rem 0 0 1rem', 
                            fontSize: '0.8rem',
                            color: '#6c757d',
                            paddingLeft: '1rem'
                          }}>
                            {category.examples.map((example, index) => (
                              <li key={index} style={{ wordBreak: 'break-all', marginBottom: '0.25rem' }}>
                                {example}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#666', fontStyle: 'italic' }}>No request purpose data available</p>
              )}
            </div>

            {/* Slowest APIs Leaderboard */}
            <div className="card">
              <h2> Top 10 Slowest APIs</h2>
              <p style={{ color: '#666', marginBottom: '1rem' }}>
              </p>
              {report.slowest_apis && report.slowest_apis.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse', 
                    fontSize: '0.9rem',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#495057' }}>Rank</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#495057' }}>Endpoint/Resource</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#495057' }}>Method</th>
                        <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#495057' }}>Avg Latency (ms)</th>
                        <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#495057' }}>95th Percentile (ms)</th>
                        <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#495057' }}>Requests</th>
                        <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#495057' }}>Error Rate (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.slowest_apis.map((api, index) => (
                        <tr key={index} style={{ 
                          borderBottom: '1px solid #dee2e6',
                          backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa'
                        }}>
                          <td style={{ padding: '12px', fontWeight: 'bold', color: index < 3 ? '#ff6b6b' : '#6c757d' }}>
                            #{index + 1}
                          </td>
                          <td style={{ padding: '12px', wordBreak: 'break-all', maxWidth: '300px' }}>
                            {api.endpoint}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ 
                              padding: '4px 8px', 
                              borderRadius: '4px', 
                              fontSize: '0.8rem',
                              fontWeight: 'bold',
                              backgroundColor: api.method === 'GET' ? '#d4edda' : 
                                               api.method === 'POST' ? '#cce5ff' : 
                                               api.method === 'PUT' ? '#fff3cd' : 
                                               api.method === 'DELETE' ? '#f8d7da' : '#e2e3e5',
                              color: api.method === 'GET' ? '#155724' : 
                                     api.method === 'POST' ? '#004085' : 
                                     api.method === 'PUT' ? '#856404' : 
                                     api.method === 'DELETE' ? '#721c24' : '#383d41'
                            }}>
                              {api.method}
                            </span>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#ff6b6b' }}>
                            {api.avg_latency_ms}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', color: '#6c757d' }}>
                            {api.p95_latency_ms}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', color: '#495057' }}>
                            {api.requests}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', color: api.error_rate > 5 ? '#dc3545' : '#28a745' }}>
                            {api.error_rate}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: '#666', fontStyle: 'italic' }}>No apis found </p>
              )}
            </div>

            {/* Pattern Analysis Section */}
            <div className="card">
              <h2>🔍 Pattern Analysis</h2>
              
              {/* Top Patterns by Requests */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: '#667eea', borderBottom: '2px solid #667eea', paddingBottom: '0.5rem' }}>
                  📊 Top 5 APIs by Request Volume
                </h3>
                <ul className="endpoint-list">
                  {report.pattern_analysis.top_patterns_by_requests.slice(0, 5).map((pattern, index) => (
                    <EndpointItem key={index} endpoint={pattern} type="pattern" />
                  ))}
                </ul>
              </div>

              {/* Top Patterns by Errors */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: '#ff4757', borderBottom: '2px solid #ff4757', paddingBottom: '0.5rem' }}>
                  ⚠️ Top 5 Patterns by Error Count
                </h3>
                {report.pattern_analysis.top_patterns_by_errors.length > 0 ? (
                  <ul className="endpoint-list">
                    {report.pattern_analysis.top_patterns_by_errors.map((pattern, index) => (
                      <EndpointItem key={index} endpoint={pattern} type="error" />
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: '#666', fontStyle: 'italic' }}>No error patterns found</p>
                )}
              </div>


            </div>

            {/* Response Codes */}
            <div className="card">
              <h2>📈 HTTP Response Code Distribution</h2>
              <div className="response-codes">
                {Object.entries(report.response_codes)
                  .sort(([,a], [,b]) => b - a)
                  .map(([code, count]) => (
                    <ResponseCodeItem key={code} code={code} count={count} />
                  ))}
              </div>
            </div>

            {/* Report Info */}
            <div className="card">
              <h2>📄 Report Information</h2>
              <p><strong>File:</strong> {report.analysis_info.file_path}</p>
              <p><strong>Generated at:</strong> {new Date(report.analysis_info.timestamp).toLocaleString()}</p>
             
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
