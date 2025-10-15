import React from 'react';
import { Card, Typography, Progress, Statistic, Row, Col } from 'antd';
import { 
  BarChartOutlined, 
  LineChartOutlined, 
  PieChartOutlined, 
  TableOutlined 
} from '@ant-design/icons';

const { Title, Text } = Typography;

const SimpleChart = ({ type, title, data, config = {} }) => {
  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <BarChart data={data} config={config} />;
      case 'line':
        return <LineChart data={data} config={config} />;
      case 'pie':
        return <PieChart data={data} config={config} />;
      case 'table':
        return <DataTable data={data} config={config} />;
      case 'gauge':
        return <GaugeChart data={data} config={config} />;
      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <Card 
      title={title} 
      className="simple-chart"
      extra={
        type === 'bar' && <BarChartOutlined /> ||
        type === 'line' && <LineChartOutlined /> ||
        type === 'pie' && <PieChartOutlined /> ||
        type === 'table' && <TableOutlined />
      }
    >
      {renderChart()}
    </Card>
  );
};

// Simple Bar Chart Component
const BarChart = ({ data, config }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-placeholder">
        <Text type="secondary">No data available</Text>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <div className="bar-chart">
      {data.map((item, index) => (
        <div key={index} className="bar-item">
          <div className="bar-label">{item.label}</div>
          <div className="bar-container">
            <div 
              className="bar-fill"
              style={{ 
                width: `${(item.value / maxValue) * 100}%`,
                backgroundColor: item.color || '#1890ff'
              }}
            />
            <div className="bar-value">{item.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Simple Line Chart Component
const LineChart = ({ data, config }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-placeholder">
        <Text type="secondary">No data available</Text>
      </div>
    );
  }

  return (
    <div className="line-chart">
      <div className="line-chart-svg">
        <svg width="100%" height="200" viewBox="0 0 400 200">
          <polyline
            fill="none"
            stroke="#1890ff"
            strokeWidth="2"
            points={data.map((item, index) => 
              `${(index / (data.length - 1)) * 380 + 10},${180 - (item.value / Math.max(...data.map(d => d.value))) * 160}`
            ).join(' ')}
          />
          {data.map((item, index) => (
            <circle
              key={index}
              cx={(index / (data.length - 1)) * 380 + 10}
              cy={180 - (item.value / Math.max(...data.map(d => d.value))) * 160}
              r="3"
              fill="#1890ff"
            />
          ))}
        </svg>
      </div>
      <div className="line-chart-labels">
        {data.map((item, index) => (
          <div key={index} className="line-label">
            <Text type="secondary">{item.label}</Text>
            <Text strong>{item.value}</Text>
          </div>
        ))}
      </div>
    </div>
  );
};

// Simple Pie Chart Component
const PieChart = ({ data, config }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-placeholder">
        <Text type="secondary">No data available</Text>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  return (
    <div className="pie-chart">
      <div className="pie-chart-svg">
        <svg width="200" height="200" viewBox="0 0 200 200">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const angle = (percentage / 100) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            currentAngle += angle;

            const startAngleRad = (startAngle - 90) * (Math.PI / 180);
            const endAngleRad = (endAngle - 90) * (Math.PI / 180);
            
            const x1 = 100 + 80 * Math.cos(startAngleRad);
            const y1 = 100 + 80 * Math.sin(startAngleRad);
            const x2 = 100 + 80 * Math.cos(endAngleRad);
            const y2 = 100 + 80 * Math.sin(endAngleRad);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            const pathData = [
              `M 100 100`,
              `L ${x1} ${y1}`,
              `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');

            return (
              <path
                key={index}
                d={pathData}
                fill={item.color || `hsl(${index * 60}, 70%, 50%)`}
                stroke="#fff"
                strokeWidth="2"
              />
            );
          })}
        </svg>
      </div>
      <div className="pie-chart-legend">
        {data.map((item, index) => (
          <div key={index} className="legend-item">
            <div 
              className="legend-color"
              style={{ backgroundColor: item.color || `hsl(${index * 60}, 70%, 50%)` }}
            />
            <Text>{item.label}</Text>
            <Text type="secondary">({item.value})</Text>
          </div>
        ))}
      </div>
    </div>
  );
};

// Simple Data Table Component
const DataTable = ({ data, config }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-placeholder">
        <Text type="secondary">No data available</Text>
      </div>
    );
  }

  const columns = Object.keys(data[0] || {});

  return (
    <div className="data-table">
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            {columns.map((column, index) => (
              <th key={index} style={{ padding: '8px', border: '1px solid #d9d9d9' }}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 10).map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column, colIndex) => (
                <td key={colIndex} style={{ padding: '8px', border: '1px solid #d9d9d9' }}>
                  {row[column]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length > 10 && (
        <div style={{ textAlign: 'center', marginTop: '8px' }}>
          <Text type="secondary">Showing 10 of {data.length} rows</Text>
        </div>
      )}
    </div>
  );
};

// Simple Gauge Chart Component
const GaugeChart = ({ data, config }) => {
  const value = data?.value || 0;
  const max = data?.max || 100;
  const percentage = (value / max) * 100;

  return (
    <div className="gauge-chart">
      <Progress
        type="circle"
        percent={percentage}
        format={() => `${value}/${max}`}
        strokeColor={{
          '0%': '#108ee9',
          '100%': '#87d068',
        }}
      />
      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <Text strong>{data?.label || 'Value'}</Text>
      </div>
    </div>
  );
};

export default SimpleChart;






