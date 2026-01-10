import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Play, Database, Clock, Download, Copy, Check,
  AlertCircle, ChevronDown, Loader, Table, BarChart3
} from 'lucide-react';
import { cn } from '../services/utils';
import rulesData from '../data/rules.json';

// Sample data for KQL execution simulation
const SAMPLE_TABLES = {
  SigninLogs: [
    { TimeGenerated: '2024-01-10T10:00:00Z', UserPrincipalName: 'alice@contoso.com', IPAddress: '203.0.113.10', ResultType: '0', AppDisplayName: 'Office 365', Location: 'US' },
    { TimeGenerated: '2024-01-10T10:05:00Z', UserPrincipalName: 'bob@contoso.com', IPAddress: '198.51.100.23', ResultType: '50126', AppDisplayName: 'Azure Portal', Location: 'UK' },
    { TimeGenerated: '2024-01-10T10:10:00Z', UserPrincipalName: 'carol@contoso.com', IPAddress: '45.155.205.233', ResultType: '50126', AppDisplayName: 'Office 365', Location: 'RU' },
    { TimeGenerated: '2024-01-10T10:15:00Z', UserPrincipalName: 'david@contoso.com', IPAddress: '203.0.113.10', ResultType: '50126', AppDisplayName: 'Teams', Location: 'US' },
    { TimeGenerated: '2024-01-10T10:20:00Z', UserPrincipalName: 'erin@contoso.com', IPAddress: '45.155.205.233', ResultType: '50126', AppDisplayName: 'SharePoint', Location: 'RU' },
  ],
  AuditLogs: [
    { TimeGenerated: '2024-01-10T11:00:00Z', OperationName: 'Add member to role', InitiatedBy: 'admin@contoso.com', TargetResources: 'Global Administrator', Result: 'Success' },
    { TimeGenerated: '2024-01-10T11:30:00Z', OperationName: 'Add service principal', InitiatedBy: 'devops@contoso.com', TargetResources: 'CI-CD-App', Result: 'Success' },
    { TimeGenerated: '2024-01-10T12:00:00Z', OperationName: 'Update conditional access policy', InitiatedBy: 'secops@contoso.com', TargetResources: 'Block Legacy Auth', Result: 'Success' },
  ],
  SecurityAlert: [
    { TimeGenerated: '2024-01-10T09:00:00Z', AlertName: 'Password Spray Attack', AlertSeverity: 'High', Status: 'New', Entities: 12 },
    { TimeGenerated: '2024-01-10T09:30:00Z', AlertName: 'Impossible Travel', AlertSeverity: 'Medium', Status: 'Investigating', Entities: 1 },
    { TimeGenerated: '2024-01-10T10:00:00Z', AlertName: 'Suspicious PowerShell', AlertSeverity: 'High', Status: 'New', Entities: 3 },
  ],
  DeviceProcessEvents: [
    { TimeGenerated: '2024-01-10T08:00:00Z', DeviceName: 'WORKSTATION-01', FileName: 'powershell.exe', ProcessCommandLine: 'powershell.exe -enc SGVsbG8gV29ybGQ=', AccountName: 'jsmith' },
    { TimeGenerated: '2024-01-10T08:15:00Z', DeviceName: 'LAPTOP-DEV-03', FileName: 'procdump.exe', ProcessCommandLine: 'procdump.exe -ma lsass.exe', AccountName: 'mwilson' },
    { TimeGenerated: '2024-01-10T08:30:00Z', DeviceName: 'SERVER-DC01', FileName: 'mimikatz.exe', ProcessCommandLine: 'mimikatz.exe sekurlsa::logonpasswords', AccountName: 'SYSTEM' },
  ],
};

// Simple KQL parser/executor (simulation)
function executeKQL(query, tables) {
  // This is a simplified KQL parser for demo purposes
  const lines = query.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//'));
  if (lines.length === 0) return { error: 'Empty query' };

  // Find the table name
  const firstLine = lines[0];
  const tableName = Object.keys(tables).find(t => 
    firstLine.toLowerCase().includes(t.toLowerCase())
  );

  if (!tableName) {
    return { error: `Unknown table. Available tables: ${Object.keys(tables).join(', ')}` };
  }

  let results = [...tables[tableName]];

  // Simple where clause parsing
  const whereMatch = query.match(/where\s+(.+?)(?=\||$)/i);
  if (whereMatch) {
    const condition = whereMatch[1].trim();
    // Very basic filtering
    if (condition.includes('==')) {
      const [field, value] = condition.split('==').map(s => s.trim().replace(/"/g, '').replace(/'/g, ''));
      results = results.filter(r => String(r[field]) === value);
    } else if (condition.includes('contains')) {
      const match = condition.match(/(\w+)\s+contains\s+["'](.+?)["']/i);
      if (match) {
        results = results.filter(r => String(r[match[1]] || '').toLowerCase().includes(match[2].toLowerCase()));
      }
    }
  }

  // Summarize
  const summarizeMatch = query.match(/summarize\s+(.+?)(?=\||$)/i);
  if (summarizeMatch) {
    const countMatch = summarizeMatch[1].match(/count\(\)/i);
    if (countMatch) {
      results = [{ Count: results.length }];
    }
  }

  // Take/Limit
  const takeMatch = query.match(/take\s+(\d+)/i) || query.match(/limit\s+(\d+)/i);
  if (takeMatch) {
    results = results.slice(0, parseInt(takeMatch[1]));
  }

  return { data: results, tableName, rowCount: results.length };
}

// Query Template Selector
function QueryTemplates({ onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const rules = rulesData.rules || [];

  const templates = [
    { name: 'Failed Sign-ins', query: `SigninLogs\n| where ResultType != "0"\n| take 10` },
    { name: 'High Severity Alerts', query: `SecurityAlert\n| where AlertSeverity == "High"\n| take 10` },
    { name: 'Suspicious Processes', query: `DeviceProcessEvents\n| where FileName contains "mimikatz" or FileName contains "procdump"\n| take 10` },
    { name: 'Admin Operations', query: `AuditLogs\n| where OperationName contains "role"\n| take 10` },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-800 border border-dark-700 hover:border-dark-600 transition-colors text-sm"
      >
        <Database className="w-4 h-4" />
        Templates
        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-dark-800 border border-dark-700 rounded-lg shadow-xl z-10 overflow-hidden">
          <div className="p-2 border-b border-dark-700">
            <p className="text-xs text-gray-500 uppercase">Quick Templates</p>
          </div>
          {templates.map((template, index) => (
            <button
              key={index}
              onClick={() => {
                onSelect(template.query);
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-dark-700 transition-colors text-sm"
            >
              {template.name}
            </button>
          ))}
          <div className="p-2 border-t border-dark-700">
            <p className="text-xs text-gray-500 uppercase">From Detection Rules</p>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {rules.slice(0, 5).map((rule) => (
              <button
                key={rule.id}
                onClick={() => {
                  onSelect(rule.query);
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-dark-700 transition-colors text-sm truncate"
              >
                {rule.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Results Table
function ResultsTable({ data, columns }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        No results
      </div>
    );
  }

  const cols = columns || Object.keys(data[0]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-dark-700">
            {cols.map(col => (
              <th key={col} className="text-left p-3 font-medium text-gray-400">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-dark-800 hover:bg-dark-800/50">
              {cols.map(col => (
                <td key={col} className="p-3 font-mono text-xs">
                  {typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function KQLPlayground() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState(null);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef(null);

  // Load query from URL params
  useEffect(() => {
    const urlQuery = searchParams.get('query');
    if (urlQuery) {
      setQuery(urlQuery);
    }
  }, [searchParams]);

  const runQuery = async () => {
    setIsRunning(true);
    setResults(null);
    const startTime = Date.now();

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

    const result = executeKQL(query, SAMPLE_TABLES);
    setResults(result);
    setExecutionTime(Date.now() - startTime);
    setIsRunning(false);
  };

  const copyQuery = () => {
    navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      runQuery();
    }
    // Tab handling for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newValue = query.substring(0, start) + '    ' + query.substring(end);
      setQuery(newValue);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 4;
      }, 0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Database className="w-8 h-8 text-cyber-500" />
            KQL Playground
          </h1>
          <p className="text-gray-400 mt-1">
            Write and test Kusto Query Language queries against sample data
          </p>
        </div>

        <div className="flex items-center gap-3">
          <QueryTemplates onSelect={setQuery} />
          
          <button
            onClick={copyQuery}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-800 border border-dark-700 hover:border-dark-600 transition-colors text-sm"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>

          <button
            onClick={runQuery}
            disabled={isRunning || !query.trim()}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors text-sm",
              isRunning || !query.trim()
                ? 'bg-dark-700 text-gray-500 cursor-not-allowed'
                : 'bg-cyber-500 hover:bg-cyber-600 text-white'
            )}
          >
            {isRunning ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isRunning ? 'Running...' : 'Run Query'}
            <span className="text-xs opacity-70">(⌘+Enter)</span>
          </button>
        </div>
      </div>

      {/* Available Tables */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-gray-400">Available tables:</span>
        {Object.keys(SAMPLE_TABLES).map(table => (
          <button
            key={table}
            onClick={() => setQuery(prev => prev + (prev ? '\n' : '') + table)}
            className="text-xs px-2 py-1 rounded bg-dark-800 hover:bg-dark-700 text-cyber-400 font-mono transition-colors"
          >
            {table}
          </button>
        ))}
      </div>

      {/* Query Editor */}
      <div className="bg-dark-900 rounded-xl border border-dark-700 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-dark-800 border-b border-dark-700">
          <span className="text-sm font-medium">Query Editor</span>
          <span className="text-xs text-gray-500">KQL</span>
        </div>
        <textarea
          ref={textareaRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your KQL query here...&#10;&#10;Example:&#10;SigninLogs&#10;| where ResultType != &quot;0&quot;&#10;| take 10"
          className="w-full h-64 p-4 bg-transparent font-mono text-sm resize-none outline-none"
          spellCheck={false}
        />
      </div>

      {/* Results */}
      <div className="bg-dark-800/50 rounded-xl border border-dark-700 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-dark-800 border-b border-dark-700">
          <div className="flex items-center gap-4">
            <span className="font-medium">Results</span>
            {results && !results.error && (
              <span className="text-sm text-gray-400">
                {results.rowCount} row{results.rowCount !== 1 ? 's' : ''} from {results.tableName}
              </span>
            )}
          </div>
          {executionTime && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              {executionTime}ms
            </div>
          )}
        </div>

        <div className="min-h-48">
          {isRunning && (
            <div className="flex items-center justify-center h-48">
              <Loader className="w-8 h-8 animate-spin text-cyber-500" />
            </div>
          )}

          {!isRunning && results?.error && (
            <div className="flex items-center gap-3 p-6 text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{results.error}</span>
            </div>
          )}

          {!isRunning && results?.data && (
            <ResultsTable data={results.data} />
          )}

          {!isRunning && !results && (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500">
              <Table className="w-8 h-8 mb-2 opacity-50" />
              <p>Run a query to see results</p>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-6">
        <h3 className="font-semibold mb-4">KQL Quick Reference</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-400 mb-2">Basic Query</p>
            <code className="text-xs bg-dark-900 p-2 rounded block font-mono text-cyber-400">
              TableName<br/>| where Column == "value"<br/>| take 10
            </code>
          </div>
          <div>
            <p className="text-gray-400 mb-2">Count Records</p>
            <code className="text-xs bg-dark-900 p-2 rounded block font-mono text-cyber-400">
              TableName<br/>| summarize count()
            </code>
          </div>
          <div>
            <p className="text-gray-400 mb-2">Contains Filter</p>
            <code className="text-xs bg-dark-900 p-2 rounded block font-mono text-cyber-400">
              TableName<br/>| where Column contains "text"
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
