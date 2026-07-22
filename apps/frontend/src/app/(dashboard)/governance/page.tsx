'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toast';
import {
  Vote,
  CheckCircle,
  XCircle,
  MinusCircle,
  TrendingUp,
  Users,
  FileText,
} from 'lucide-react';
import apiClient from '@/lib/api-client';

interface Proposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  startBlock: number;
  endBlock: number;
  forVotes: string;
  againstVotes: string;
  abstainVotes: string;
  status: string;
  createdAt: string;
}

interface VoteResult {
  for: number;
  against: number;
  abstain: number;
  total: number;
  votes: Array<{
    id: string;
    voter: string;
    choice: string;
    votingPower: string;
    createdAt: string;
  }>;
}

export default function GovernancePage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [voteResults, setVoteResults] = useState<VoteResult | null>(null);
  const [userVotes, setUserVotes] = useState<Array<{ id: string; proposalId: string; choice: string; votingPower: string; createdAt: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    fetchGovernanceData();
  }, []);

  const fetchGovernanceData = async () => {
    try {
      const [proposalsRes, votesRes] = await Promise.all([
        apiClient.get('/governance/proposals'),
        apiClient.get('/governance/votes'),
      ]);
      setProposals(proposalsRes.data);
      setUserVotes(votesRes.data);
    } catch (error) {
      console.error('Failed to fetch governance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (proposalId: string, choice: 'FOR' | 'AGAINST' | 'ABSTAIN') => {
    setIsVoting(true);
    try {
      await apiClient.post('/governance/vote', { proposalId, choice });
      toast({
        title: 'Vote cast',
        description: `You voted ${choice.toLowerCase()} on proposal ${proposalId}`,
      });
      fetchGovernanceData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to cast vote';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsVoting(false);
    }
  };

  const loadProposalResults = async (proposal: Proposal) => {
    setSelectedProposal(proposal);
    try {
      const response = await apiClient.get(`/governance/proposals/${proposal.id}/results`);
      setVoteResults(response.data);
    } catch (error) {
      console.error('Failed to fetch proposal results:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'SUCCEEDED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'DEFEATED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getChoiceIcon = (choice: string) => {
    switch (choice) {
      case 'FOR':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'AGAINST':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'ABSTAIN':
        return <MinusCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Governance</h1>
          <p className="text-muted-foreground">Participate in platform governance decisions</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Your Voting Power</p>
            <p className="text-xl font-bold">0 LXON</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Active Proposals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{proposals.filter(p => p.status === 'ACTIVE').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Vote className="h-4 w-4" />
              Your Votes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userVotes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Participation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="proposals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="proposals">Proposals</TabsTrigger>
          <TabsTrigger value="my-votes">My Votes</TabsTrigger>
        </TabsList>

        <TabsContent value="proposals" className="space-y-4">
          {proposals.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No proposals yet</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Check back later for governance proposals
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {proposals.map((proposal) => (
                <Card key={proposal.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{proposal.title}</CardTitle>
                          <Badge className={getStatusColor(proposal.status)}>{proposal.status}</Badge>
                        </div>
                        <CardDescription>{proposal.description}</CardDescription>
                        <p className="text-sm text-muted-foreground mt-1">
                          Proposed by {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/10">
                          <p className="text-sm text-green-600 dark:text-green-400">For</p>
                          <p className="text-lg font-bold">{parseFloat(proposal.forVotes).toLocaleString()}</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-900/10">
                          <p className="text-sm text-red-600 dark:text-red-400">Against</p>
                          <p className="text-lg font-bold">{parseFloat(proposal.againstVotes).toLocaleString()}</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/10">
                          <p className="text-sm text-yellow-600 dark:text-yellow-400">Abstain</p>
                          <p className="text-lg font-bold">{parseFloat(proposal.abstainVotes).toLocaleString()}</p>
                        </div>
                      </div>

                      {proposal.status === 'ACTIVE' && !userVotes.find(v => v.proposalId === proposal.id) && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleVote(proposal.id, 'FOR')}
                            disabled={isVoting}
                          >
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                            Vote For
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleVote(proposal.id, 'AGAINST')}
                            disabled={isVoting}
                          >
                            <XCircle className="mr-2 h-4 w-4 text-red-500" />
                            Vote Against
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleVote(proposal.id, 'ABSTAIN')}
                            disabled={isVoting}
                          >
                            <MinusCircle className="mr-2 h-4 w-4 text-yellow-500" />
                            Abstain
                          </Button>
                        </div>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => loadProposalResults(proposal)}
                        className="w-full"
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-votes" className="space-y-4">
          {userVotes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Vote className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No votes yet</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Participate in active proposals to cast your votes
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {userVotes.map((vote) => (
                <Card key={vote.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getChoiceIcon(vote.choice)}
                        <span className="font-medium">{vote.choice}</span>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Proposal: {vote.proposalId}</p>
                        <p className="text-xs text-muted-foreground">
                          Voting Power: {parseFloat(vote.votingPower).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{new Date(vote.createdAt).toLocaleDateString()}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedProposal && voteResults && (
        <Card>
          <CardHeader>
            <CardTitle>Proposal Results: {selectedProposal.title}</CardTitle>
            <CardDescription>Detailed voting results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/10">
                  <p className="text-sm text-green-600 dark:text-green-400">For</p>
                  <p className="text-2xl font-bold">{voteResults.for.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-900/10">
                  <p className="text-sm text-red-600 dark:text-red-400">Against</p>
                  <p className="text-2xl font-bold">{voteResults.against.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/10">
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">Abstain</p>
                  <p className="text-2xl font-bold">{voteResults.abstain.toLocaleString()}</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Votes ({voteResults.votes.length})</h4>
                {voteResults.votes.map((vote) => (
                  <div key={vote.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-2">
                      {getChoiceIcon(vote.choice)}
                      <span className="font-medium">{vote.voter.slice(0, 6)}...{vote.voter.slice(-4)}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{parseFloat(vote.votingPower).toLocaleString()} power</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
