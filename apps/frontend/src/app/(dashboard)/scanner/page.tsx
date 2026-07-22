'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/toast';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Loader2,
  ExternalLink,
  FileText,
} from 'lucide-react';
import apiClient from '@/lib/api-client';

interface ScannerFinding {
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendation: string;
}

interface ScannerPermissions {
  owner: string;
  canMint: boolean;
  canBurn: boolean;
  canPause: boolean;
  canBlacklist: boolean;
  canUpgrade: boolean;
  hasProxy: boolean;
  transferRestricted: boolean;
}

interface AnalysisResult {
  address: string;
  chain: string;
  contractName?: string;
  isVerified: boolean;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  summary: string;
  findings: ScannerFinding[];
  permissions: ScannerPermissions;
  aiExplanation?: { analysis: string };
  analyzedAt: string;
}

const CHAINS = [
  { value: 'ETHEREUM', label: 'Ethereum' },
  { value: 'POLYGON', label: 'Polygon' },
  { value: 'BSC', label: 'BNB Chain' },
  { value: 'ARBITRUM', label: 'Arbitrum' },
  { value: 'BASE', label: 'Base' },
  { value: 'AVALANCHE', label: 'Avalanche' },
  { value: 'LXON', label: 'LXON Chain' },
];

export default function ScannerPage() {
  const [address, setAddress] = useState('');
  const [chain, setChain] = useState('ETHEREUM');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address || address.length < 10) {
      toast({
        title: 'Invalid address',
        description: 'Please enter a valid contract address',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const response = await apiClient.post<AnalysisResult>('/scanner/analyze', {
        address,
        chain,
        includeAiExplanation: true,
      });

      setResult(response.data);
      toast({
        title: 'Analysis complete',
        description: `Risk score: ${response.data.riskScore}/100`,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Analysis failed';
      toast({
        title: 'Analysis failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Smart Contract Analyzer</h1>
        <p className="text-muted-foreground mt-1">
          Analyze smart contracts for security risks, permissions, and vulnerabilities
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Contract Analysis
          </CardTitle>
          <CardDescription>
            Enter a contract address to analyze its security and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="address">Contract Address</Label>
                <Input
                  id="address"
                  placeholder="0x..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={isAnalyzing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chain">Chain</Label>
                <select
                  id="chain"
                  value={chain}
                  onChange={(e) => setChain(e.target.value)}
                  disabled={isAnalyzing}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {CHAINS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <Button type="submit" className="w-full md:w-auto" disabled={isAnalyzing}>
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Analyze Contract
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold">{result.riskScore}</span>
                  <span className="text-muted-foreground">/100</span>
                </div>
                <Badge className={`mt-2 ${getRiskColor(result.riskLevel)}`}>
                  {result.riskLevel}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Contract</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="font-medium">{result.contractName || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {result.address.slice(0, 6)}...{result.address.slice(-4)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{result.chain}</Badge>
                    {result.isVerified ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="mr-1 h-3 w-3" />
                        Unverified
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{result.summary}</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="findings" className="space-y-4">
            <TabsList>
              <TabsTrigger value="findings">Findings ({result.findings.length})</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="ai">AI Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="findings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Security Findings</CardTitle>
                  <CardDescription>
                    Issues detected during static analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {result.findings.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No significant issues found
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {result.findings.map((finding, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-4 p-4 rounded-lg border"
                        >
                          <div className="mt-0.5">{getSeverityIcon(finding.severity)}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{finding.title}</h4>
                              <Badge variant="outline" className="text-xs">
                                {finding.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {finding.description}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Recommendation:</span>{' '}
                              {finding.recommendation}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Permission Analysis</CardTitle>
                  <CardDescription>
                    Contract capabilities and access controls
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2">
                    {[
                      { label: 'Can Mint', value: result.permissions.canMint },
                      { label: 'Can Burn', value: result.permissions.canBurn },
                      { label: 'Can Pause', value: result.permissions.canPause },
                      { label: 'Can Blacklist', value: result.permissions.canBlacklist },
                      { label: 'Can Upgrade', value: result.permissions.canUpgrade },
                      { label: 'Has Proxy', value: result.permissions.hasProxy },
                      { label: 'Transfer Restricted', value: result.permissions.transferRestricted },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <span className="text-sm">{item.label}</span>
                        <Badge variant={item.value ? 'destructive' : 'outline'}>
                          {item.value ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    AI-Powered Analysis
                  </CardTitle>
                  <CardDescription>
                    Detailed security assessment powered by AI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {result.aiExplanation ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p className="whitespace-pre-wrap">{result.aiExplanation.analysis}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      AI analysis not available for this contract.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
