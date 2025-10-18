import React, { useState } from 'react'
import { CheckCircle, XCircle, TrendingUp, TrendingDown, Users, Target, Calendar, MessageSquare, ThumbsUp, ThumbsDown, Star, AlertTriangle, Save, Download, Share } from 'lucide-react'

// Types
interface TeamMember {
  id: string
  name: string
  email: string
  avatarUrl?: string
  role: string
}

interface Sprint {
  id: string
  name: string
  startDate: string
  endDate: string
  goal?: string
  status: 'completed' | 'active' | 'cancelled'
  velocity?: number
  storyCount: number
  completedStories: number
  teamMembers: TeamMember[]
}

interface RetroSection {
  id: string
  title: string
  description: string
  type: 'went-well' | 'could-improve' | 'action-items' | 'team-feedback'
  icon: React.ReactNode
  color: string
  items: RetroItem[]
}

interface RetroItem {
  id: string
  content: string
  authorId: string
  authorName: string
  votes: number
  hasVoted: boolean
  timestamp: string
  tags: string[]
  actionItem?: {
    assignedTo?: string
    dueDate?: string
    status: 'pending' | 'in-progress' | 'completed'
  }
}

interface RetroMetrics {
  satisfaction: number
  velocity: number
  quality: number
  collaboration: number
  predictability: number
}

interface SprintRetrospectiveProps {
  sprint: Sprint
  onSave?: (retroData: any) => Promise<void>
  onComplete?: (retroData: any) => Promise<void>
  isLoading?: boolean
  compact?: boolean
  showMetrics?: boolean
}

export const SprintRetrospective: React.FC<SprintRetrospectiveProps> = ({
  sprint,
  onSave,
  onComplete,
  isLoading = false,
  compact = false,
  showMetrics = true
}) => {
  const [activeTab, setActiveTab] = useState<'brainstorm' | 'group' | 'action-items' | 'metrics'>('brainstorm')
  const [sections, setSections] = useState<RetroSection[]>([
    {
      id: 'went-well',
      title: 'What Went Well',
      description: 'Things that went well during the sprint',
      type: 'went-well',
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'green',
      items: []
    },
    {
      id: 'could-improve',
      title: 'What Could Be Improved',
      description: 'Areas for improvement in future sprints',
      type: 'could-improve',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'yellow',
      items: []
    },
    {
      id: 'action-items',
      title: 'Action Items',
      description: 'Concrete actions to implement improvements',
      type: 'action-items',
      icon: <Target className="w-5 h-5" />,
      color: 'blue',
      items: []
    },
    {
      id: 'team-feedback',
      title: 'Team Feedback',
      description: 'Anonymous feedback about team dynamics',
      type: 'team-feedback',
      icon: <Users className="w-5 h-5" />,
      color: 'purple',
      items: []
    }
  ])

  const [newItemContent, setNewItemContent] = useState('')
  const [selectedSection, setSelectedSection] = useState<string>('went-well')
  const [metrics, setMetrics] = useState<RetroMetrics>({
    satisfaction: 7,
    velocity: 7,
    quality: 8,
    collaboration: 8,
    predictability: 6
  })

  const [showAnonymous, setShowAnonymous] = useState(false)
  const [anonymousFeedback, setAnonymousFeedback] = useState('')

  const currentUser = sprint.teamMembers[0] // Mock current user

  const handleAddItem = () => {
    if (!newItemContent.trim()) return

    const newItem: RetroItem = {
      id: `item-${Date.now()}`,
      content: newItemContent,
      authorId: showAnonymous ? 'anonymous' : currentUser.id,
      authorName: showAnonymous ? 'Anonymous' : currentUser.name,
      votes: 0,
      hasVoted: false,
      timestamp: new Date().toISOString(),
      tags: []
    }

    setSections(prev => prev.map(section =>
      section.id === selectedSection
        ? { ...section, items: [...section.items, newItem] }
        : section
    ))

    setNewItemContent('')
  }

  const handleVote = (sectionId: string, itemId: string) => {
    setSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items.map(item => {
            if (item.id === itemId) {
              return {
                ...item,
                votes: item.hasVoted ? item.votes - 1 : item.votes + 1,
                hasVoted: !item.hasVoted
              }
            }
            return item
          })
        }
        return section
      }))
  }

  const handleConvertToActionItem = (sectionId: string, itemId: string) => {
    const section = sections.find(s => s.id === sectionId)
    const item = section?.items.find(i => i.id === itemId)

    if (!item) return

    const actionItem: RetroItem = {
      ...item,
      actionItem: {
        status: 'pending'
      }
    }

    setSections(prev => prev.map(s => {
      if (s.id === 'action-items') {
        return { ...s, items: [...s.items, actionItem] }
      }
      if (s.id === sectionId) {
        return { ...s, items: s.items.filter(i => i.id !== itemId) }
      }
      return s
    }))
  }

  const handleUpdateActionItem = (itemId: string, updates: any) => {
    setSections(prev => prev.map(section => ({
      ...section,
      items: section.items.map(item =>
        item.id === itemId
          ? { ...item, actionItem: { ...item.actionItem, ...updates } }
          : item
      )
    })))
  }

  const getTopItems = (sectionId: string, limit: number = 5) => {
    const section = sections.find(s => s.id === sectionId)
    if (!section) return []

    return [...section.items]
      .sort((a, b) => b.votes - a.votes)
      .slice(0, limit)
  }

  const getSectionColor = (color: string) => {
    switch (color) {
      case 'green': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
      case 'yellow': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
      case 'blue': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
      case 'purple': return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700'
      default: return 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700'
    }
  }

  const getSectionTextColor = (color: string) => {
    switch (color) {
      case 'green': return 'text-green-800 dark:text-green-200'
      case 'yellow': return 'text-yellow-800 dark:text-yellow-200'
      case 'blue': return 'text-blue-800 dark:text-blue-200'
      case 'purple': return 'text-purple-800 dark:text-purple-200'
      default: return 'text-gray-800 dark:text-gray-200'
    }
  }

  const handleSave = async () => {
    if (onSave) {
      const retroData = {
        sprintId: sprint.id,
        sections,
        metrics,
        completedAt: new Date().toISOString()
      }
      await onSave(retroData)
    }
  }

  const handleComplete = async () => {
    if (onComplete) {
      const retroData = {
        sprintId: sprint.id,
        sections,
        metrics,
        completedAt: new Date().toISOString()
      }
      await onComplete(retroData)
    }
  }

  if (compact) {
    return (
      <div className="space-y-4">
        {/* Quick Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {sections.reduce((sum, s) => sum + s.items.length, 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Items</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {sections.find(s => s.id === 'went-well')?.items.length || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Went Well</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {sections.find(s => s.id === 'action-items')?.items.length || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Action Items</div>
          </div>
        </div>

        {/* Top Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Top Wins</h4>
            <div className="space-y-1">
              {getTopItems('went-well', 3).map((item) => (
                <div key={item.id} className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-between">
                  <span className="truncate">{item.content}</span>
                  <span className="text-xs">({item.votes} votes)</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Top Improvements</h4>
            <div className="space-y-1">
              {getTopItems('could-improve', 3).map((item) => (
                <div key={item.id} className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-between">
                  <span className="truncate">{item.content}</span>
                  <span className="text-xs">({item.votes} votes)</span>
                </div>
              ))}
            </div>
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
            Sprint Retrospective
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {sprint.name} • {new Date(sprint.endDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2 inline" />
            Save Draft
          </button>
          <button
            onClick={handleComplete}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            Complete Retrospective
          </button>
        </div>
      </div>

      {/* Sprint Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-sm text-blue-600 dark:text-blue-400">Sprint Goal</span>
            <div className="font-medium text-blue-900 dark:text-blue-100">
              {sprint.goal || 'No goal set'}
            </div>
          </div>
          <div>
            <span className="text-sm text-blue-600 dark:text-blue-400">Completion</span>
            <div className="font-medium text-blue-900 dark:text-blue-100">
              {sprint.completedStories}/{sprint.storyCount} stories
            </div>
          </div>
          <div>
            <span className="text-sm text-blue-600 dark:text-blue-400">Velocity</span>
            <div className="font-medium text-blue-900 dark:text-blue-100">
              {sprint.velocity || 'N/A'} pts
            </div>
          </div>
          <div>
            <span className="text-sm text-blue-600 dark:text-blue-400">Team Size</span>
            <div className="font-medium text-blue-900 dark:text-blue-100">
              {sprint.teamMembers.length} members
            </div>
          </div>
        </div>
      </div>

      {/* Team Metrics */}
      {showMetrics && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Team Metrics
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {Object.entries(metrics).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={value}
                    onChange={(e) => setMetrics(prev => ({ ...prev, [key]: parseInt(e.target.value) }))}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                    {value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'brainstorm', label: 'Brainstorm', icon: <MessageSquare className="w-4 h-4" /> },
            { id: 'group', label: 'Group & Vote', icon: <ThumbsUp className="w-4 h-4" /> },
            { id: 'action-items', label: 'Action Items', icon: <Target className="w-4 h-4" /> },
            { id: 'metrics', label: 'Analytics', icon: <Star className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
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

      {/* Brainstorm Tab */}
      {activeTab === 'brainstorm' && (
        <div className="space-y-6">
          {/* Add Item Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add Feedback Item
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setSelectedSection(section.id)}
                      className={`p-3 rounded-lg border-2 text-left transition-colors ${
                        selectedSection === section.id
                          ? 'border-brand-primary bg-brand-primary/5'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {section.icon}
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {section.title}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {section.items.length} items
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <textarea
                  value={newItemContent}
                  onChange={(e) => setNewItemContent(e.target.value)}
                  placeholder={`Add your feedback about "${sections.find(s => s.id === selectedSection)?.title}"...`}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={showAnonymous}
                    onChange={(e) => setShowAnonymous(e.target.checked)}
                    className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded"
                  />
                  <label htmlFor="anonymous" className="text-sm text-gray-700 dark:text-gray-300">
                    Post anonymously
                  </label>
                </div>
                <button
                  onClick={handleAddItem}
                  disabled={!newItemContent.trim()}
                  className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>

          {/* Sections Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sections.map((section) => (
              <div key={section.id} className={`rounded-lg border p-4 ${getSectionColor(section.color)}`}>
                <div className="flex items-center space-x-2 mb-4">
                  {section.icon}
                  <h4 className={`font-semibold ${getSectionTextColor(section.color)}`}>
                    {section.title}
                  </h4>
                  <span className={`text-sm ${getSectionTextColor(section.color)}`}>
                    ({section.items.length})
                  </span>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {section.items.length === 0 ? (
                    <p className={`text-sm ${getSectionTextColor(section.color)} opacity-60`}>
                      No items yet. Be the first to contribute!
                    </p>
                  ) : (
                    section.items.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 rounded-lg ${
                          item.hasVoted ? 'bg-white dark:bg-gray-800' : 'bg-white/50 dark:bg-gray-800/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm ${getSectionTextColor(section.color)}`}>
                              {item.content}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {item.authorName}
                              </span>
                              <button
                                onClick={() => handleVote(section.id, item.id)}
                                className={`flex items-center space-x-1 text-xs ${
                                  item.hasVoted
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                              >
                                <ThumbsUp className="w-3 h-3" />
                                <span>{item.votes}</span>
                              </button>
                            </div>
                          </div>
                          {(section.type === 'went-well' || section.type === 'could-improve') && (
                            <button
                              onClick={() => handleConvertToActionItem(section.id, item.id)}
                              className="ml-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                            >
                              <Target className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Group & Vote Tab */}
      {activeTab === 'group' && (
        <div className="space-y-6">
          {/* Top Voted Items */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sections.map((section) => (
              <div key={section.id} className={`rounded-lg border p-4 ${getSectionColor(section.color)}`}>
                <div className="flex items-center space-x-2 mb-4">
                  {section.icon}
                  <h4 className={`font-semibold ${getSectionTextColor(section.color)}`}>
                    Top {section.title}
                  </h4>
                </div>
                <div className="space-y-3">
                  {getTopItems(section.id, 5).map((item, index) => (
                    <div key={item.id} className="flex items-start space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-400 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-orange-400 text-white' :
                        'bg-gray-300 text-gray-700'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${getSectionTextColor(section.color)}`}>
                          {item.content}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {item.authorName}
                          </span>
                          <span className={`text-xs ${getSectionTextColor(section.color)}`}>
                            {item.votes} votes
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {section.items.length === 0 && (
                    <p className={`text-sm ${getSectionTextColor(section.color)} opacity-60`}>
                      No items in this category
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Anonymous Feedback */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h4 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                Anonymous Team Feedback
              </h4>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                  Share your thoughts about team dynamics, processes, or collaboration
                </label>
                <textarea
                  value={anonymousFeedback}
                  onChange={(e) => setAnonymousFeedback(e.target.value)}
                  placeholder="This feedback will be completely anonymous..."
                  rows={4}
                  className="w-full px-3 py-2 border border-purple-300 dark:border-purple-600 rounded-md bg-white dark:bg-purple-900/20 text-purple-900 dark:text-purple-100"
                />
              </div>
              <button
                onClick={() => {
                  if (anonymousFeedback.trim()) {
                    // Add to team feedback section
                    setSections(prev => prev.map(section => {
                      if (section.id === 'team-feedback') {
                        return {
                          ...section,
                          items: [...section.items, {
                            id: `team-feedback-${Date.now()}`,
                            content: anonymousFeedback,
                            authorId: 'anonymous',
                            authorName: 'Anonymous',
                            votes: 0,
                            hasVoted: false,
                            timestamp: new Date().toISOString(),
                            tags: []
                          }]
                        }
                      }
                      return section
                    }))
                    setAnonymousFeedback('')
                  }
                }}
                disabled={!anonymousFeedback.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Anonymous Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Items Tab */}
      {activeTab === 'action-items' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Action Items ({sections.find(s => s.id === 'action-items')?.items.length || 0})
              </h4>
              <button className="text-sm text-brand-primary hover:text-brand-primary/80">
                Add Action Item
              </button>
            </div>
            <div className="space-y-4">
              {sections.find(s => s.id === 'action-items')?.items.map((item) => (
                <div key={item.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white mb-2">
                        {item.content}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>Added by {item.authorName}</span>
                        <span>{item.votes} votes</span>
                      </div>
                      {item.actionItem && (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center space-x-3">
                            <label className="text-xs text-gray-600 dark:text-gray-400">Assign to:</label>
                            <select
                              value={item.actionItem.assignedTo || ''}
                              onChange={(e) => handleUpdateActionItem(item.id, { assignedTo: e.target.value })}
                              className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                              <option value="">Unassigned</option>
                              {sprint.teamMembers.map((member) => (
                                <option key={member.id} value={member.id}>
                                  {member.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-center space-x-3">
                            <label className="text-xs text-gray-600 dark:text-gray-400">Due date:</label>
                            <input
                              type="date"
                              value={item.actionItem.dueDate || ''}
                              onChange={(e) => handleUpdateActionItem(item.id, { dueDate: e.target.value })}
                              className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                          <div className="flex items-center space-x-3">
                            <label className="text-xs text-gray-600 dark:text-gray-400">Status:</label>
                            <select
                              value={item.actionItem.status}
                              onChange={(e) => handleUpdateActionItem(item.id, { status: e.target.value })}
                              className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                              <option value="pending">Pending</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <Target className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {sections.find(s => s.id === 'action-items')?.items.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No action items yet. Convert feedback items to action items to track improvements.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          {/* Participation Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {sections.reduce((sum, s) => sum + s.items.length, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Items</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {sections.find(s => s.id === 'went-well')?.items.length || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Success Items</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {sections.find(s => s.id === 'could-improve')?.items.length || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Improvement Items</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {sections.find(s => s.id === 'action-items')?.items.length || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Action Items</div>
            </div>
          </div>

          {/* Team Metrics Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Team Performance Metrics
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {Object.entries(metrics).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className="flex justify-center mt-2">
                    {[...Array(10)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < value ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export Options */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Export & Share
            </h4>
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                <Download className="w-4 h-4" />
                <span>Export PDF</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                <Download className="w-4 h-4" />
                <span>Export JSON</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                <Share className="w-4 h-4" />
                <span>Share Link</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}