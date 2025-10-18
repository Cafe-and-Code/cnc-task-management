import React, { useState } from 'react';
import { X, Users, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

// Types
interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface EstimationVote {
  userId: string;
  userName: string;
  vote: number | null;
  hasVoted: boolean;
  votedAt?: string;
}

interface EstimationSession {
  id: string;
  storyId: string;
  storyTitle: string;
  storyDescription: string;
  facilitator: User;
  participants: User[];
  votes: EstimationVote[];
  scale: 'fibonacci' | 'tshirt' | 'linear';
  status: 'active' | 'completed' | 'cancelled';
  consensus?: number;
  startedAt: string;
  completedAt?: string;
}

interface StoryPointEstimationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEstimationComplete: (estimatedPoints: number) => void;
  story: {
    id: string;
    title: string;
    description: string;
    currentEstimate?: number;
  };
  currentUser: User;
  teamMembers: User[];
}

const FIBONACCI_SCALE = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
const TSHIRT_SCALE = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const LINEAR_SCALE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const getScaleValues = (scale: 'fibonacci' | 'tshirt' | 'linear') => {
  switch (scale) {
    case 'fibonacci':
      return FIBONACCI_SCALE;
    case 'tshirt':
      return TSHIRT_SCALE;
    case 'linear':
      return LINEAR_SCALE;
  }
};

const getNumericValue = (
  value: string | number,
  scale: 'fibonacci' | 'tshirt' | 'linear'
): number => {
  if (typeof value === 'number') return value;

  switch (scale) {
    case 'tshirt':
      const tshirtMap: { [key: string]: number } = {
        XS: 1,
        S: 2,
        M: 3,
        L: 5,
        XL: 8,
        XXL: 13,
      };
      return tshirtMap[value] || 0;
    default:
      return 0;
  }
};

export const StoryPointEstimationModal: React.FC<StoryPointEstimationModalProps> = ({
  isOpen,
  onClose,
  onEstimationComplete,
  story,
  currentUser,
  teamMembers,
}) => {
  const [scale, setScale] = useState<'fibonacci' | 'tshirt' | 'linear'>('fibonacci');
  const [selectedValue, setSelectedValue] = useState<number | string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [estimationSession, setEstimationSession] = useState<EstimationSession | null>(null);

  // Mock session data - in real implementation, this would come from API/WebSocket
  const mockSession: EstimationSession = {
    id: 'session-1',
    storyId: story.id,
    storyTitle: story.title,
    storyDescription: story.description,
    facilitator: currentUser,
    participants: teamMembers,
    votes: teamMembers.map(member => ({
      userId: member.id,
      userName: member.name,
      vote: member.id === currentUser.id && hasVoted ? selectedValue : null,
      hasVoted: member.id === currentUser.id ? hasVoted : Math.random() > 0.5,
      votedAt: member.id === currentUser.id && hasVoted ? new Date().toISOString() : undefined,
    })),
    scale,
    status: hasVoted ? 'active' : 'active',
    startedAt: new Date().toISOString(),
  };

  React.useEffect(() => {
    if (isOpen) {
      setEstimationSession(mockSession);
      setHasVoted(false);
      setSelectedValue(null);
      setShowResults(false);
    }
  }, [isOpen]);

  const handleVote = (value: number | string) => {
    setSelectedValue(value);
    setHasVoted(true);

    // Update session with vote
    if (estimationSession) {
      const updatedSession = {
        ...estimationSession,
        votes: estimationSession.votes.map(vote =>
          vote.userId === currentUser.id
            ? { ...vote, vote: value, hasVoted: true, votedAt: new Date().toISOString() }
            : vote
        ),
      };
      setEstimationSession(updatedSession);
    }

    // Simulate other team members voting
    setTimeout(() => {
      if (estimationSession) {
        const updatedVotes = estimationSession.votes.map(vote => {
          if (vote.userId !== currentUser.id && !vote.hasVoted) {
            const scaleValues = getScaleValues(scale);
            const randomVote = scaleValues[Math.floor(Math.random() * scaleValues.length)];
            return { ...vote, vote: randomVote, hasVoted: true, votedAt: new Date().toISOString() };
          }
          return vote;
        });

        setEstimationSession(prev => (prev ? { ...prev, votes: updatedVotes } : null));
        setShowResults(true);
      }
    }, 2000);
  };

  const handleRevealResults = () => {
    setShowResults(true);
  };

  const handleConsensus = () => {
    if (estimationSession && estimationSession.votes.length > 0) {
      const numericVotes = estimationSession.votes
        .filter(vote => vote.hasVoted && vote.vote !== null)
        .map(vote => getNumericValue(vote.vote!, scale));

      if (numericVotes.length > 0) {
        // Calculate average and round to nearest scale value
        const average = numericVotes.reduce((sum, val) => sum + val, 0) / numericVotes.length;
        const scaleValues = getScaleValues(scale);
        const consensusValue = scaleValues.reduce((prev, curr) => {
          const prevDiff = Math.abs(getNumericValue(prev, scale) - average);
          const currDiff = Math.abs(getNumericValue(curr, scale) - average);
          return currDiff < prevDiff ? curr : prev;
        });

        onEstimationComplete(getNumericValue(consensusValue, scale));
        onClose();
      }
    }
  };

  const handleRestart = () => {
    setHasVoted(false);
    setSelectedValue(null);
    setShowResults(false);
    if (estimationSession) {
      setEstimationSession({
        ...estimationSession,
        votes: estimationSession.votes.map(vote => ({
          ...vote,
          vote: null,
          hasVoted: false,
          votedAt: undefined,
        })),
      });
    }
  };

  const getVoteStats = () => {
    if (!estimationSession) return null;

    const votes = estimationSession.votes.filter(vote => vote.hasVoted && vote.vote !== null);
    const numericVotes = votes.map(vote => getNumericValue(vote.vote!, scale));

    if (numericVotes.length === 0) return null;

    const average = numericVotes.reduce((sum, val) => sum + val, 0) / numericVotes.length;
    const min = Math.min(...numericVotes);
    const max = Math.max(...numericVotes);

    return {
      average,
      min,
      max,
      count: votes.length,
      totalParticipants: estimationSession.participants.length,
    };
  };

  if (!isOpen) return null;

  const scaleValues = getScaleValues(scale);
  const stats = getVoteStats();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          {/* Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Story Point Estimation
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Team estimation session
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Story Information */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">{story.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{story.description}</p>
              {story.currentEstimate && (
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Current estimate:{' '}
                  <span className="font-medium">{story.currentEstimate} points</span>
                </div>
              )}
            </div>

            {/* Scale Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estimation Scale
              </label>
              <div className="flex space-x-2">
                {(['fibonacci', 'tshirt', 'linear'] as const).map(scaleOption => (
                  <button
                    key={scaleOption}
                    onClick={() => setScale(scaleOption)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      scale === scaleOption
                        ? 'bg-brand-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {scaleOption === 'fibonacci'
                      ? 'Fibonacci'
                      : scaleOption === 'tshirt'
                        ? 'T-Shirt'
                        : 'Linear'}
                  </button>
                ))}
              </div>
            </div>

            {/* Voting Cards */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {hasVoted ? 'Your Vote:' : 'Select Your Estimate:'}
                </h3>
                {hasVoted && (
                  <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>Vote submitted</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-3">
                {scaleValues.map(value => (
                  <button
                    key={value}
                    onClick={() => !hasVoted && handleVote(value)}
                    disabled={hasVoted}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedValue === value
                        ? 'border-brand-primary bg-brand-primary text-white'
                        : hasVoted
                          ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                          : 'border-gray-300 hover:border-brand-primary hover:bg-brand-primary/5'
                    }`}
                  >
                    <span className="text-lg font-bold">{value}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Team Votes */}
            {estimationSession && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Team Votes ({stats?.count || 0}/{estimationSession.participants.length})
                  </h3>
                  {!showResults && stats?.count === estimationSession.participants.length && (
                    <button
                      onClick={handleRevealResults}
                      className="px-3 py-1 text-sm bg-brand-primary text-white rounded-md hover:bg-brand-primary/90"
                    >
                      Reveal Results
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {estimationSession.votes.map(vote => (
                    <div
                      key={vote.userId}
                      className={`p-3 rounded-lg border ${
                        vote.userId === currentUser.id
                          ? 'border-brand-primary bg-brand-primary/5'
                          : 'border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        {vote.userId === currentUser.id ? (
                          <div className="w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center text-white text-xs font-medium">
                            {currentUser.name.charAt(0)}
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 text-xs font-medium">
                            {vote.userName.charAt(0)}
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {vote.userName}
                        </span>
                      </div>

                      <div className="text-center">
                        {showResults || vote.userId === currentUser.id ? (
                          <div className="text-2xl font-bold text-brand-primary">
                            {vote.vote || '?'}
                          </div>
                        ) : vote.hasVoted ? (
                          <div className="w-8 h-8 mx-auto bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Statistics */}
            {showResults && stats && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Estimation Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Average</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {stats.average.toFixed(1)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Range</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {stats.min} - {stats.max}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Participants</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {stats.count}/{stats.totalParticipants}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Agreement</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {stats.min === stats.max
                        ? '✓ Full'
                        : stats.max - stats.min <= 2
                          ? '⚠ Close'
                          : '✗ Divergent'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between">
              <div className="flex space-x-3">
                {hasVoted && (
                  <button
                    onClick={handleRestart}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md"
                  >
                    Restart Voting
                  </button>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md"
                >
                  Cancel
                </button>

                {showResults && (
                  <button
                    onClick={handleConsensus}
                    className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90"
                  >
                    Apply Consensus
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
