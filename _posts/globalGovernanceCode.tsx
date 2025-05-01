import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import Papa from 'papaparse';

const PowerDistributionChart = () => {
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({
    traditional: { bottom50: "0.0", middle40: "0.0", top10: "0.0", top1: "0.0" },
    taxBased: { bottom50: "0.0", middle40: "0.0", top10: "0.0", top1: "0.0" }
  });
  
  useEffect(() => {
    const loadData = async () => {
      try {
        // Progressive tax calculation function
        function calculateProgressiveTax(income) {
          // Define tax brackets with rates
          const brackets = [
            { threshold: 0, rate: 0.15 },
            { threshold: 15000, rate: 0.25 },
            { threshold: 35000, rate: 0.35 },
            { threshold: 70000, rate: 0.42 },
            { threshold: 150000, rate: 0.48 },
            { threshold: 300000, rate: 0.52 }
          ];
          
          // Sort brackets by threshold (highest first for calculation)
          const sortedBrackets = [...brackets].sort((a, b) => b.threshold - a.threshold);
          
          let remainingIncome = income;
          let totalTax = 0;
          
          // Calculate tax for each bracket
          for (let i = 0; i < sortedBrackets.length; i++) {
            const currentBracket = sortedBrackets[i];
            const nextBracketThreshold = i < sortedBrackets.length - 1 ? sortedBrackets[i + 1].threshold : 0;
            
            if (remainingIncome > currentBracket.threshold) {
              const taxableInThisBracket = remainingIncome - currentBracket.threshold;
              totalTax += taxableInThisBracket * currentBracket.rate;
              remainingIncome = currentBracket.threshold;
            }
          }
          
          return totalTax;
        }
        
        // Load the income distribution data
        const fileContent = await window.fs.readFile('Distribution of spendable income 2022.csv', { encoding: 'utf8' });
        const parseResult = Papa.parse(fileContent, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true
        });
        
        // Process the data
        let incomeData = [];
        if (parseResult.data && parseResult.data.length > 0) {
          incomeData = parseResult.data.map(row => {
            const incomeKey = Object.keys(row).find(key => key.includes("income"));
            const householdsKey = Object.keys(row).find(key => key.includes("Households"));
            
            let income = row[incomeKey];
            const households = row[householdsKey];
            
            if (typeof income === 'string') {
              const matches = income.match(/[-]?\d+(\.\d+)?/g);
              if (matches && matches.length > 0) {
                income = parseFloat(matches[0]);
              } else {
                income = 0;
              }
            }
            
            return { income, households };
          }).filter(item => !isNaN(item.income) && !isNaN(item.households) && item.households > 0);
        }
        
        // Calculate percentiles based on household distribution
        const totalHouseholds = incomeData.reduce((sum, item) => sum + item.households, 0);
        let cumulativeHouseholds = 0;
        const distributionData = incomeData
          .sort((a, b) => a.income - b.income)
          .map(item => {
            const startPercentile = cumulativeHouseholds / totalHouseholds * 100;
            cumulativeHouseholds += item.households;
            const endPercentile = cumulativeHouseholds / totalHouseholds * 100;
            const percentile = (startPercentile + endPercentile) / 2;
            
            return {
              income: item.income * 1000, // Convert to euros if data is in thousands
              households: item.households,
              percentile: percentile
            };
          });
          
        // Function to get income for a specific percentile
        function getIncomeForPercentile(targetPercentile) {
          const lowerPoint = distributionData.filter(d => d.percentile <= targetPercentile)
            .sort((a, b) => b.percentile - a.percentile)[0];
            
          const upperPoint = distributionData.filter(d => d.percentile >= targetPercentile)
            .sort((a, b) => a.percentile - b.percentile)[0];
            
          if (!lowerPoint) return upperPoint ? upperPoint.income : 0;
          if (!upperPoint) return lowerPoint ? lowerPoint.income : 0;
          
          if (upperPoint.percentile === lowerPoint.percentile) {
            return lowerPoint.income;
          }
          
          const ratio = (targetPercentile - lowerPoint.percentile) / (upperPoint.percentile - lowerPoint.percentile);
          return lowerPoint.income + ratio * (upperPoint.income - lowerPoint.income);
        }
        
        // Generate chart data using actual distribution
        const percentiles = Array.from({length: 101}, (_, i) => i);
        const fullData = percentiles.map(p => {
          const income = getIncomeForPercentile(p);
          const taxAmount = calculateProgressiveTax(income);
          const effectiveRate = income > 0 ? taxAmount / income : 0;
          
          return {
            percentile: p,
            income: income,
            effectiveRate: effectiveRate,
            taxAmount: taxAmount,
            "Traditional Democracy": 1,
            "Tax-Based System": taxAmount
          };
        });
        
        // Normalize the tax-based voting power
        const totalTraditional = fullData.reduce((sum, item) => sum + item["Traditional Democracy"], 0);
        const totalTaxBased = fullData.reduce((sum, item) => sum + item["Tax-Based System"], 0);
        
        const normalizedData = fullData.map(item => ({
          ...item,
          "Tax-Based System": (item["Tax-Based System"] / totalTaxBased) * totalTraditional
        }));
        
        // Filter data for cleaner chart
        const filteredData = normalizedData.filter(item => item.percentile % 2 === 0);
        setChartData(filteredData);
        
        // Calculate statistics
        const calculateStats = (data, property) => {
          const totalVotes = data.reduce((sum, item) => sum + item[property], 0);
          
          const bottom50 = data.filter(item => item.percentile < 50)
            .reduce((sum, item) => sum + item[property], 0) / totalVotes;
          
          const middle40 = data.filter(item => item.percentile >= 50 && item.percentile < 90)
            .reduce((sum, item) => sum + item[property], 0) / totalVotes;
          
          const top10 = data.filter(item => item.percentile >= 90)
            .reduce((sum, item) => sum + item[property], 0) / totalVotes;
          
          const top1 = data.filter(item => item.percentile >= 99)
            .reduce((sum, item) => sum + item[property], 0) / totalVotes;
          
          return {
            bottom50: (bottom50 * 100).toFixed(1),
            middle40: (middle40 * 100).toFixed(1),
            top10: (top10 * 100).toFixed(1),
            top1: (top1 * 100).toFixed(1)
          };
        };
        
        const traditionalStats = calculateStats(normalizedData, "Traditional Democracy");
        const taxBasedStats = calculateStats(normalizedData, "Tax-Based System");
        
        setStats({
          traditional: traditionalStats,
          taxBased: taxBasedStats
        });
      } catch (error) {
        console.error("Error processing data:", error);
      }
    };
    
    loadData();
  }, []);

  // Format income for tooltip and axis
  const formatIncome = (value) => {
    return value >= 1000000 
      ? `€${(value/1000000).toFixed(1)}M` 
      : `€${(value/1000).toFixed(0)}K`;
  };

  // Format tax rate for tooltip
  const formatRate = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-300 rounded shadow-md">
          <p className="font-bold">{`Income Percentile: ${label}`}</p>
          <p>{`Annual Income: €${payload[2].value.toLocaleString()}`}</p>
          <p>{`Effective Tax Rate: ${formatRate(payload[2].payload.effectiveRate)}`}</p>
          <p style={{color: payload[0].color}}>{`Traditional Democracy: ${payload[0].value.toFixed(2)}`}</p>
          <p style={{color: payload[1].color}}>{`Tax-Based System: ${payload[1].value.toFixed(2)}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="text-xl font-bold mb-6">Voting Power with Progressive Taxation</h2>
      
      <div className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 50, left: 20, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="percentile" 
              label={{ value: 'Income Percentile', position: 'bottom', offset: 0 }}
              domain={[0, 100]}
            />
            <YAxis 
              yAxisId="left"
              label={{ value: 'Voting Strength', angle: -90, position: 'insideLeft', offset: 0 }}
              domain={[0, 4]} 
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              label={{ value: 'Annual Income (€)', angle: 90, position: 'insideRight', offset: 0 }}
              tickFormatter={formatIncome}
              domain={[0, 150000]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="Traditional Democracy" 
              stroke="#8884d8" 
              strokeWidth={2} 
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="Tax-Based System" 
              stroke="#82ca9d" 
              strokeWidth={2} 
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="income" 
              stroke="#ff7300" 
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 6 }}
            />
            <ReferenceLine yAxisId="left" x={50} stroke="#999" strokeDasharray="3 3" />
            <ReferenceLine yAxisId="left" x={90} stroke="#999" strokeDasharray="3 3" />
            <ReferenceLine yAxisId="left" x={99} stroke="#999" strokeDasharray="3 3" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-8 bg-gray-100 p-4 rounded-lg w-full">
        <h3 className="text-lg font-semibold mb-2">Voting Power Distribution (Progressive Taxation)</h3>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="font-medium">Bottom 50%</p>
            <p>Traditional: {stats.traditional.bottom50}%</p>
            <p>Tax-Based: {stats.taxBased.bottom50}%</p>
          </div>
          <div>
            <p className="font-medium">Middle 40%</p>
            <p>Traditional: {stats.traditional.middle40}%</p>
            <p>Tax-Based: {stats.taxBased.middle40}%</p>
          </div>
          <div>
            <p className="font-medium">Top 10%</p>
            <p>Traditional: {stats.traditional.top10}%</p>
            <p>Tax-Based: {stats.taxBased.top10}%</p>
          </div>
          <div>
            <p className="font-medium">Top 1%</p>
            <p>Traditional: {stats.traditional.top1}%</p>
            <p>Tax-Based: {stats.taxBased.top1}%</p>
          </div>
        </div>
        <p className="mt-4 text-sm">
          This chart shows voting power distribution using actual household income data with true progressive 
          taxation where each income bracket is taxed incrementally. The tooltip shows the effective tax rate at each 
          percentile. In this model, the middle 40% gains the most significant relative influence, while the power 
          shift toward the wealthy is more moderate than in flat tax models.
        </p>
      </div>
    </div>
  );
};

export default PowerDistributionChart;