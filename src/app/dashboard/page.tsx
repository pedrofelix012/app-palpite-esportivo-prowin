'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getPredictions, Prediction } from '@/lib/auth';
import { generateDailyPredictions } from '@/lib/ai-predictions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, TrendingUp, Calendar, Target, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RealTimePrediction {
  sport: 'futebol' | 'nba';
  match: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo: string;
  awayLogo: string;
  prediction: string;
  analysis: string;
  confidence: number;
  date: string;
  time?: string;
  league?: string;
  venue?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [realTimePredictions, setRealTimePredictions] = useState<RealTimePrediction[]>([]);
  const [selectedSport, setSelectedSport] = useState<'all' | 'futebol' | 'nba'>('all');
  const [loadingPredictions, setLoadingPredictions] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const allPredictions = getPredictions();
      setPredictions(allPredictions);
      
      // Carregar palpites em tempo real
      loadRealTimePredictions();
    }
  }, [user]);

  const loadRealTimePredictions = async () => {
    setLoadingPredictions(true);
    try {
      const dailyPredictions = await generateDailyPredictions();
      
      const formattedPredictions: RealTimePrediction[] = dailyPredictions.map(pred => ({
        sport: pred.sport,
        match: `${pred.homeTeam} vs ${pred.awayTeam}`,
        homeTeam: pred.homeTeam,
        awayTeam: pred.awayTeam,
        homeLogo: pred.homeLogo,
        awayLogo: pred.awayLogo,
        prediction: pred.prediction,
        analysis: pred.analysis,
        confidence: pred.confidence,
        date: pred.date,
        time: pred.time,
        league: pred.league,
        venue: pred.venue,
      }));
      
      setRealTimePredictions(formattedPredictions);
    } catch (error) {
      console.error('Erro ao carregar palpites:', error);
    } finally {
      setLoadingPredictions(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const filteredPredictions = selectedSport === 'all' 
    ? realTimePredictions 
    : realTimePredictions.filter(p => p.sport === selectedSport);

  const stats = {
    total: predictions.length,
    wins: predictions.filter(p => p.result === 'win').length,
    losses: predictions.filter(p => p.result === 'loss').length,
    pending: predictions.filter(p => p.result === 'pending').length,
  };

  const winRate = stats.total > 0 ? ((stats.wins / (stats.wins + stats.losses)) * 100).toFixed(1) : '0';

  const handleVipClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open('https://pay.kiwify.com.br/D8EB0lM', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Dashboard de Palpites
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Palpites gerados por IA com dados em tempo real
            </p>
          </div>
          <Button 
            onClick={loadRealTimePredictions}
            disabled={loadingPredictions}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loadingPredictions ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Atualizando...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar Palpites
              </>
            )}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardHeader className="pb-3">
              <CardDescription className="text-purple-100">Total de Sinais</CardDescription>
              <CardTitle className="text-3xl">{realTimePredictions.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <Trophy className="w-8 h-8 opacity-50" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
            <CardHeader className="pb-3">
              <CardDescription className="text-green-100">Taxa de Acerto</CardDescription>
              <CardTitle className="text-3xl">{winRate}%</CardTitle>
            </CardHeader>
            <CardContent>
              <TrendingUp className="w-8 h-8 opacity-50" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardHeader className="pb-3">
              <CardDescription className="text-blue-100">Acertos</CardDescription>
              <CardTitle className="text-3xl">{stats.wins}</CardTitle>
            </CardHeader>
            <CardContent>
              <CheckCircle2 className="w-8 h-8 opacity-50" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
            <CardHeader className="pb-3">
              <CardDescription className="text-orange-100">Pendentes</CardDescription>
              <CardTitle className="text-3xl">{realTimePredictions.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <Clock className="w-8 h-8 opacity-50" />
            </CardContent>
          </Card>
        </div>

        {/* Predictions List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Sinais Ativos - Jogos de Amanhã
            </CardTitle>
            <CardDescription>
              Palpites gerados automaticamente pela IA com base em dados reais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedSport} onValueChange={(v) => setSelectedSport(v as any)}>
              <TabsList className="mb-6">
                <TabsTrigger value="all">Todos ({realTimePredictions.length})</TabsTrigger>
                <TabsTrigger value="futebol">
                  Futebol ({realTimePredictions.filter(p => p.sport === 'futebol').length})
                </TabsTrigger>
                <TabsTrigger value="nba">
                  NBA ({realTimePredictions.filter(p => p.sport === 'nba').length})
                </TabsTrigger>
              </TabsList>

              {loadingPredictions ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <RefreshCw className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Carregando palpites em tempo real...</p>
                  </div>
                </div>
              ) : filteredPredictions.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Nenhum jogo encontrado para amanhã
                  </p>
                  <Button onClick={loadRealTimePredictions} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Tentar Novamente
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPredictions.map((prediction, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-wrap">
                            <Badge 
                              variant="outline" 
                              className={prediction.sport === 'futebol' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}
                            >
                              {prediction.sport === 'futebol' ? '⚽ Futebol' : '🏀 NBA'}
                            </Badge>
                            <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                              {prediction.confidence}% confiança
                            </Badge>
                            {prediction.league && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {prediction.league}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                              <Clock className="w-3 h-3 mr-1" />
                              {prediction.time || 'A definir'}
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Match with Team Logos */}
                        <div className="flex items-center justify-center gap-4 mt-4 py-4">
                          <div className="flex flex-col items-center gap-2 flex-1">
                            <img 
                              src={prediction.homeLogo} 
                              alt={prediction.homeTeam}
                              className="w-16 h-16 object-contain"
                            />
                            <span className="text-sm font-semibold text-center">{prediction.homeTeam}</span>
                          </div>
                          
                          <div className="text-2xl font-bold text-gray-400">VS</div>
                          
                          <div className="flex flex-col items-center gap-2 flex-1">
                            <img 
                              src={prediction.awayLogo} 
                              alt={prediction.awayTeam}
                              className="w-16 h-16 object-contain"
                            />
                            <span className="text-sm font-semibold text-center">{prediction.awayTeam}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <Target className="w-4 h-4 text-purple-600" />
                          <span className="font-semibold text-purple-600">{prediction.prediction}</span>
                        </div>
                        
                        {prediction.venue && (
                          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span>{prediction.venue}</span>
                          </div>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            <span className="font-semibold text-gray-900 dark:text-white">Análise:</span> {prediction.analysis}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </Tabs>
          </CardContent>
        </Card>

        {/* VIP Banner */}
        {!user.isVip && (
          <Card className="mt-8 bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0">
            <CardHeader>
              <CardTitle className="text-2xl">🔥 Área VIP Exclusiva</CardTitle>
              <CardDescription className="text-amber-100">
                Acesse sinais premium com análises ainda mais detalhadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Junte-se ao nosso grupo VIP no Telegram e receba:
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Sinais exclusivos com 90%+ de confiança
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Análises em tempo real durante os jogos
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Suporte direto com especialistas
                </li>
              </ul>
              <button
                onClick={handleVipClick}
                className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-amber-50 transition-colors"
              >
                Assinar Plano VIP
              </button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
