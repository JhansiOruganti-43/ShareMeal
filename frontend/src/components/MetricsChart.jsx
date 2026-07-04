import React from 'react';

const MetricsChart = ({ trendData = [], type = 'bar' }) => {
  if (!trendData || trendData.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
        No metric data available
      </div>
    );
  }

  // Calculate coordinates and scales
  const width = 500;
  const height = 220;
  const paddingLeft = 40;
  const paddingBottom = 30;
  const paddingTop = 20;
  const paddingRight = 20;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Extract values based on type
  const values = trendData.map(d => type === 'bar' ? d.meals : d.co2_saved_kg);
  const maxValue = Math.max(...values, 10); // Prevent 0 division
  const minValue = 0;

  const getX = (index) => {
    return paddingLeft + (index * (chartWidth / (trendData.length - 1 || 1)));
  };

  const getY = (val) => {
    const ratio = (val - minValue) / (maxValue - minValue);
    return height - paddingBottom - (ratio * chartHeight);
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
        {/* Gradients */}
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--secondary)" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="lineAreaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--secondary)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--secondary)" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal Gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = paddingTop + (ratio * chartHeight);
          const gridVal = Math.round(maxValue - (ratio * (maxValue - minValue)));
          return (
            <g key={i}>
              <line 
                x1={paddingLeft} 
                y1={y} 
                x2={width - paddingRight} 
                y2={y} 
                stroke="var(--border-color)" 
                strokeDasharray="4,4" 
                strokeWidth="1"
              />
              <text 
                x={paddingLeft - 8} 
                y={y + 4} 
                fill="var(--text-muted)" 
                fontSize="10" 
                fontWeight="500" 
                textAnchor="end"
              >
                {gridVal}
              </text>
            </g>
          );
        })}

        {/* X-axis labels */}
        {trendData.map((d, i) => {
          const x = getX(i);
          return (
            <text 
              key={i} 
              x={x} 
              y={height - 8} 
              fill="var(--text-muted)" 
              fontSize="10" 
              fontWeight="600" 
              textAnchor="middle"
            >
              {d.month}
            </text>
          );
        })}

        {/* Render Bar Chart */}
        {type === 'bar' && trendData.map((d, i) => {
          const x = getX(i);
          const barWidth = Math.min(24, chartWidth / trendData.length - 12);
          const y = getY(d.meals);
          const barHeight = height - paddingBottom - y;
          
          return (
            <g key={i} className="chart-bar-group">
              <rect 
                x={x - barWidth / 2} 
                y={y} 
                width={barWidth} 
                height={barHeight > 0 ? barHeight : 0} 
                fill="url(#barGradient)" 
                rx="4"
                style={{
                  transition: 'y 0.5s ease, height 0.5s ease',
                  cursor: 'pointer'
                }}
              />
              {/* Tooltip value */}
              <text 
                x={x} 
                y={y - 6} 
                fill="var(--text-primary)" 
                fontSize="9" 
                fontWeight="700" 
                textAnchor="middle"
              >
                {d.meals}
              </text>
            </g>
          );
        })}

        {/* Render Line Chart */}
        {type === 'line' && (
          <>
            {/* Area Path */}
            <path 
              d={`
                M ${getX(0)} ${height - paddingBottom} 
                ${trendData.map((d, i) => `L ${getX(i)} ${getY(d.co2_saved_kg)}`).join(' ')} 
                L ${getX(trendData.length - 1)} ${height - paddingBottom} Z
              `} 
              fill="url(#lineAreaGradient)" 
            />

            {/* Line Path */}
            <path 
              d={trendData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.co2_saved_kg)}`).join(' ')} 
              fill="none" 
              stroke="var(--secondary)" 
              strokeWidth="3" 
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Line Points */}
            {trendData.map((d, i) => {
              const x = getX(i);
              const y = getY(d.co2_saved_kg);
              return (
                <g key={i}>
                  <circle 
                    cx={x} 
                    cy={y} 
                    r="4" 
                    fill="var(--bg-secondary)" 
                    stroke="var(--secondary)" 
                    strokeWidth="2" 
                    style={{ cursor: 'pointer' }}
                  />
                  <text 
                    x={x} 
                    y={y - 8} 
                    fill="var(--text-primary)" 
                    fontSize="9" 
                    fontWeight="700" 
                    textAnchor="middle"
                  >
                    {d.co2_saved_kg}
                  </text>
                </g>
              );
            })}
          </>
        )}
      </svg>
    </div>
  );
};

export default MetricsChart;
