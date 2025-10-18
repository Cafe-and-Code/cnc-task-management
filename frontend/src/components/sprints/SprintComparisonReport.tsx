import React, { useState, useMemo } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon, Calendar, Users, Target, Download, Share2, Filter, RefreshCw, AlertTriangle, CheckCircle, Info } from 'lucide-react'

// Types
interface SprintData {
  id: string
  name: string
  startDate: string
  endDate: string
  duration: number
  capacity: number
  committed: number
  completed: number
  velocity: number
  efficiency: number
  storyCount: number
  teamSize: number
  teamVelocity: number
  onTimeDelivery: boolean
  qualityScore: number
  satisfactionScore: number
  blockedDays: number
  storyTypes: {
    feature: number
    bug: number
    technical: number
    research: number
  }
  status: 'completed' | 'active' | 'cancelled'
}

interface ComparisonMetrics {
  averageVelocity: number
  velocityRange: { min: number; max: number }
  averageEfficiency: number
  averageQuality: number
  averageSatisfaction: number
  deliveryRate: number
  teamPerformance: Array<{
    teamMemberId: string
    name: string
    avgVelocity: number
    avgEfficiency: number
    storyCount: number
  }>
  topPerformers: Array<{
    category: string
    sprint: string
    value: number
  }>
  trends: {
    velocity: 'improving' | 'declining' | 'stable'
    efficiency: 'improving' | 'declining' | 'stable'
    quality: 'improving' | 'declining' | 'stable'
  }
}

interface SprintComparisonReportProps {
  sprintData: SprintData[]
  teamMembers?: Array<{ id: string; name: string; role: string }>
  dateRange?: { start: string; end: string }
  showRecommendations?: boolean
  exportOptions?: boolean
  compact?: boolean
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']

export const SprintComparisonReport: React.FC<SprintComparisonReportProps> = ({
  sprintData,
  teamMembers = [],
  dateRange,
  showRecommendations = true,
  exportOptions = true,
  compact = false
}) => {
  const [viewMode, setViewMode] = useState<'overview' | 'velocity' | 'efficiency' | 'quality' | 'team' | 'trends'>('overview')
  const [comparisonType, setComparisonType] = useState<'performance' | 'metrics' | 'trends'>('performance')
  const [selectedSprints, setSelectedSprints] = useState<string[]>([])
  const [chartType, setChartType] = useState<'bar' | 'line' | 'radar'>('bar')

  // Filter and prepare data
  const processedData = useMemo(() => {
    let filtered = sprintData.filter(sprint => sprint.status === 'completed')

    if (dateRange) {
      filtered = filtered.filter(sprint => {
        const sprintEnd = new Date(sprint.endDate)
        const rangeStart = new Date(dateRange.start)
        const rangeEnd = new Date(dateRange.end)
        return sprintEnd >= rangeStart && sprintEnd <= rangeEnd
      })
    }

    return filtered.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
  }, [sprintData, dateRange])

  // Calculate comparison metrics
  const metrics = useMemo((): ComparisonMetrics => {
    if (processedData.length === 0) {
      return {
        averageVelocity: 0,
        velocityRange: { min: 0, max: 0 },
        averageEfficiency: 0,
        averageQuality: 0,
        averageSatisfaction: 0,
        deliveryRate: 0,
        teamPerformance: [],
        topPerformers: [],
        trends: {
          velocity: 'stable',
          efficiency: 'stable',
          quality: 'stable'
        }
      }
    }

    const velocities = processedData.map(s => s.velocity)
    const averageVelocity = velocities.reduce((sum, v) => sum + v, 0) / velocities.length
    const velocityRange = {
      min: Math.min(...velocities),
      max: Math.max(...velocities)
    }

    const efficiencies = processedData.map(s => s.efficiency)
    const averageEfficiency = efficiencies.reduce((sum, e) => sum + e, 0) / efficiencies.length

    const qualities = processedData.map(s => s.qualityScore)
    const averageQuality = qualities.reduce((sum, q) => sum + q, 0) / qualities.length

    const satisfactions = processedData.map(s => s.satisfactionScore)
    const averageSatisfaction = satisfactions.reduce((sum, s) => sum + s, 0) / satisfactions.length

    const deliveryRate = (processedData.filter(s => s.onTimeDelivery).length / processedData.length) * 100

    // Team performance (mock data for demo)
    const teamPerformance = teamMembers.map(member => ({
      teamMemberId: member.id,
      name: member.name,
      avgVelocity: averageVelocity + (Math.random() - 0.5) * 20,
      avgEfficiency: averageEfficiency + (Math.random() - 0.5) * 30,
      storyCount: Math.round(averageVelocity * 1.2 + Math.random() * 10)
    }))

    // Top performers
    const topPerformers = [
      {
        category: 'Highest Velocity',
        sprint: processedData.reduce((best, current) => current.velocity > best.velocity ? current : best).name,
        value: Math.max(...velocities)
      },
      {
        category: 'Highest Efficiency',
        sprint: processedData.reduce((best, current) => current.efficiency > best.efficiency ? current : best).name,
        value: Math.max(...efficiencies) * 100
      },
      {
        category: 'Highest Quality',
        sprint: processedData.reduce((best, current) => current.qualityScore > best.qualityScore ? current : best).name,
        value: Math.max(...qualities)
      }
    ]

    // Calculate trends
    const recentSprints = processedData.slice(-3)
    const olderSprints = processedData.slice(0, -3)

    const calculateTrend = (recent: number[], older: number[]): 'improving' | 'declining' | 'stable' => {
      if (recent.length === 0 || older.length === 0) return 'stable'
      const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length
      const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length
      if (recentAvg > olderAvg * 1.1) return 'improving'
      if (recentAvg < olderAvg * 0.9) return 'declining'
      return 'stable'
    }

    const trends = {
      velocity: calculateTrend(
        recentSprints.map(s => s.velocity),
        olderSprints.map(s => s.velocity)
      ),
      efficiency: calculateTrend(
        recentSprints.map(s => s.efficiency),
        olderSprints.map(s => s.efficiency)
      ),
      quality: calculateTrend(
        recentSprints.map(s => s.qualityScore),
        olderSprints.map(s => s.qualityScore)
      )
    }

    return {
      averageVelocity: Math.round(averageVelocity),
      velocityRange: { min: Math.round(velocityRange.min), max: Math.round(velocityRange.max) },
      averageEfficiency: Math.round(averageEfficiency * 100),
      averageQuality: Math.round(averageQuality),
      averageSatisfaction: Math.round(averageSatisfaction),
      deliveryRate: Math.round(deliveryRate),
      teamPerformance,
      topPerformers,
      trends
    }
  }, [processedData, teamMembers])

  // Prepare chart data
  const velocityChartData = useMemo(() => {
    return processedData.map((sprint, index) => ({
      ...sprint,
      sprintNumber: index + 1,
      efficiency: Math.round(sprint.efficiency * 100),
      utilization: sprint.capacity > 0 ? Math.round((sprint.completed / sprint.capacity) * 100) : 0
    }))
  }, [processedData])

  const storyTypeData = useMemo(() => {
    const totals = processedData.reduce((acc, sprint) => {
      acc.feature += sprint.storyTypes.feature
      acc.bug += sprint.storyTypes.bug
      acc.technical += sprint.storyTypes.technical
      acc.research += sprint.storyTypes.research
      return acc
    }, { feature: 0, bug: 0, technical: 0, research: 0 })

    return [
      { name: 'Feature Stories', value: totals.feature, color: '#3b82f6' },
      { name: 'Bug Fixes', value: totals.bug, color: '#ef4444' },
      { name: 'Technical Tasks', value: totals.technical, color: '#f59e0b' },
      { name: 'Research', value: totals.research, color: '#8b5cf6' }
    ]
  }, [processedData])

  const radarData = useMemo(() => {
    return [
      { subject: 'Velocity', value: (metrics.averageVelocity / 50) * 100, fullMark: 100 },
      { subject: 'Efficiency', value: metrics.averageEfficiency, fullMark: 100 },
      { subject: 'Quality', value: metrics.averageQuality, fullMark: 100 },
      { subject: 'Satisfaction', value: metrics.averageSatisfaction, fullMark: 100 },
      { subject: 'Delivery Rate', value: metrics.deliveryRate, fullMark: 100 },
      { subject: 'Team Performance', value: 80, fullMark: 100 } // Mock value
    ]
  }, [metrics])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-600" />
      default: return <BarChart3 className="w-4 h-4 text-gray-600" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600 dark:text-green-400'
      case 'declining': return 'text-red-600 dark:text-red-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const handleExport = (format: 'pdf' | 'excel' | 'json') => {
    console.log(`Exporting report as ${format}`)
    // In a real implementation, this would generate and download the report
  }

  const handleShare = () => {
    console.log('Sharing report')
    // In a real implementation, this would generate a shareable link
  }

  if (compact) {
    return (
      <div className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {metrics.averageVelocity}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Velocity</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {metrics.averageEfficiency}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Efficiency</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {metrics.deliveryRate}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">On-Time Delivery</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {processedData.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Sprints Analyzed</div>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Key Insights</h4>
          <div className="space-y-2">
            {metrics.topPerformers.map((performer, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{performer.category}</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {performer.sprint}: {performer.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Sprint Comparison Report
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Comparative analysis of {processedData.length} completed sprints
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {exportOptions && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleExport('pdf')}
                className="p-2 text-gray-600 hover:text-gray-800 dark:hover:text-gray-200"
                title="Export as PDF"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="p-2 text-gray-600 hover:text-gray-800 dark:hover:text-gray-200"
                title="Export as Excel"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:text-gray-800 dark:hover:text-gray-200"
                title="Share Report"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          )}
          <button className="p-2 text-gray-600 hover:text-gray-800 dark:hover:text-gray-200">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Average Velocity</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics.averageVelocity}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                pts/sprint
              </p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Efficiency</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {metrics.averageEfficiency}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                completion rate
              </p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Quality Score</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {metrics.averageQuality}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                average rating
              </p>
            </div>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Delivery Rate</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {metrics.deliveryRate}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                on-time delivery
              </p>
            </div>
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Team Size</p>
              <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                {teamMembers.length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                members
              </p>
            </div>
            <div className="p-2 bg-cyan-100 dark:bg-cyan-900/20 rounded-lg">
              <Users className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Type Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'velocity', label: 'Velocity Analysis', icon: <TrendingUp className="w-4 h-4" /> },
            { id: 'efficiency', label: 'Efficiency', icon: <Target className="w-4 h-4" /> },
            { id: 'quality', label: 'Quality Metrics', icon: <CheckCircle className="w-4 h-4" /> },
            { id: 'team', label: 'Team Performance', icon: <Users className="w-4 h-4" /> },
            { id: 'trends', label: 'Trends', icon: <TrendingUp className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                viewMode === tab.id
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <span className="flex items-center space-x-2">
                {tab.icon}
                <span>{tab.label}</span>
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab Content */}
      {viewMode === 'overview' && (
        <div className="space-y-6">
          {/* Velocity Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Sprint Velocity Comparison
              </h4>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setChartType('bar')}
                  className={`p-2 rounded ${chartType === 'bar' ? 'bg-brand-primary text-white' : 'text-gray-600 hover:text-gray-800 dark:hover:text-gray-200'}`}
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setChartType('line')}
                  className={`p-2 rounded ${chartType === 'line' ? 'bg-brand-primary text-white' : 'text-gray-600 hover:text-gray-800 dark:hover:text-gray-200'}`}
                >
                  <TrendingUp className="w-4 h-4" />
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              {chartType === 'bar' ? (
                <BarChart data={velocityChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sprintNumber" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="velocity" fill="#3b82f6" name="Velocity" />
                  <Bar dataKey="committed" fill="#10b981" name="Committed" />
                  <Bar dataKey="completed" fill="#f59e0b" name="Completed" />
                </BarChart>
              ) : (
                <LineChart data={velocityChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sprintNumber" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="velocity" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="efficiency" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="utilization" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Story Type Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Story Type Distribution
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={storyTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#888"
                    dataKey="value"
                  >
                    {storyTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Performance Radar
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Performance"
                    dataKey="value"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Other tabs would have their respective content */}
      {viewMode !== 'overview' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8" />
            </div>
            <p>Detailed {viewMode} analysis</p>
            <p className="text-sm mt-2">Additional analytics for {viewMode} would be displayed here</p>
          </div>
        </div>
      )}

      {/* Top Performers */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Top Performers
        </h4>
        <div className="space-y-3">
          {metrics.topPerformers.map((performer, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {performer.category}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {performer.sprint}
                </p>
              </div>
              <div className="text-2xl font-bold text-brand-primary">
                {performer.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {showRecommendations && (
        <div className="space-y-4">
          {metrics.trends.velocity === 'declining' && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <h5 className="font-medium text-red-800 dark:text-red-400">Velocity Decline Detected</h5>
                  <p className="text-sm text-red-700 dark:text-red-500 mt-1">
                    Team velocity has been declining over recent sprints. Consider reviewing sprint planning, team capacity, and external factors that may be affecting performance.
                  </p>
                </div>
              </div>
            )}

          {metrics.averageEfficiency < 70 && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <h5 className="font-medium text-yellow-800 dark:text-yellow-400">Low Efficiency Warning</h5>
                  <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-1">
                    Team is consistently under-delivering on commitments. Consider reducing sprint scope or improving estimation accuracy.
                  </p>
                </div>
              </div>
            </div>
          )}

          {metrics.deliveryRate < 80 && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h5 className="font-medium text-blue-800 dark:text-blue-400">Delivery Rate Concern</h5>
                  <p className="text-sm text-blue-700 dark:text-blue-500 mt-1">
                    Only {metrics.deliveryRate}% of sprints are delivered on time. Review sprint duration accuracy and planning processes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {metrics.trends.velocity === 'improving' && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <h5 className="font-medium text-green-800 dark:text-green-400">Positive Velocity Trend</h5>
                  <p className="text-sm text-green-700 dark:text-green-500 mt-1">
                    Team velocity is consistently improving. Consider if this trend is sustainable and whether capacity can be increased.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Mock data generator for development
export const generateMockComparisonData = (sprintCount: number = 12): SprintData[] => {
  const sprints: SprintData[] = []
  const startDate = new Date()

  for (let i = 0; i < sprintCount; i++) {
    const sprintStart = new Date(startDate.getTime() + i * 14 * 24 * 60 * 60 * 1000)
    const sprintEnd = new Date(sprintStart.getTime() + 14 * 24 * 60 * 60 * 1000)
    const baseVelocity = 35 + Math.random() * 20
    const capacity = 40 + Math.floor(Math.random() * 10)
    const completed = Math.round(baseVelocity + (Math.random() - 0.5) * 15)

    sprints.push({
      id: `sprint-${i + 1}`,
      name: `Sprint ${i + 1}`,
      startDate: sprintStart.toISOString().split('T')[0],
      endDate: sprintEnd.toISOString().split('T')[0],
      duration: 14,
      capacity,
      committed: Math.min(capacity, Math.round(baseVelocity + Math.random() * 5)),
      completed,
      velocity: completed,
      efficiency: completed / Math.max(capacity, completed),
      storyCount: 6 + Math.floor(Math.random() * 8),
      teamSize: 4 + Math.floor(Math.random() * 3),
      teamVelocity: completed / (4 + Math.floor(Math.random() * 3)),
      onTimeDelivery: Math.random() > 0.2,
      qualityScore: 7 + Math.random() * 2,
      satisfactionScore: 7 + Math.random() * 2,
      blockedDays: Math.floor(Math.random() * 3),
      storyTypes: {
        feature: Math.round((6 + Math.random() * 8) * 0.6),
        bug: Math.round((6 + Math.random() * 8) * 0.2),
        technical: Math.round((6 + Math.random() * 8) * 0.15),
        research: Math.round((6 + Math.random() * 8) * 0.05)
      },
      status: 'completed'
    })
  }

  return sprints
}