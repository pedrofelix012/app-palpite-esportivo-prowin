// Componente para exibir estatísticas da IA e controle manual
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, Target, Zap, RefreshCw, Calendar } from 'lucide-react';
import { generateDailyPredictions, getAIStats } from '@/lib/ai-predictions';
import { savePrediction } from '@/lib/auth';
import { toast } from 'sonner';

export default function AIControlPanel() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    const aiStats = getAIStats();
    setStats(aiStats);
  };

  const handleGeneratePredictions = async () => {
    setGenerating(true);
    try {
      const predictions = await generateDailyPredictions();
      
      // Salvar palpites
      predictions.forEach(pred => {
        savePrediction({
          userId: 'system',
          sport: pred.sport,
          match: `${pred.homeTeam} vs ${pred.awayTeam}`,
          homeTeam: pred.homeTeam,
          awayTeam: pred.awayTeam,
          homeLogo: pred.homeLogo,
          awayLogo: pred.awayLogo,
          prediction: pred.prediction,
          analysis: pred.analysis,
          confidence: pred.confidence,
          result: 'pending',
        });
      });

      toast.success(`${predictions.length} palpites gerados com sucesso!`);
      loadStats();
    } catch (error) {
      toast.error('Erro ao gerar palpites');
    } finally {
      setGenerating(false);
    }
  };

  if (!stats) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Brain className="w-7 h-7 text-purple-600" />
            Painel de Controle da IA
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Sistema inteligente que aprende com cada resultado
          </p>
        </div>
        <Button 
          onClick={handleGeneratePredictions}
          disabled={generating}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {generating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Gerar Palpites do Dia
            </>
          )}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardHeader className="pb-3">
            <CardDescription className="text-purple-100">Total de Análises</CardDescription>
            <CardTitle className="text-3xl">{stats.totalPredictions}</CardTitle>
          </CardHeader>
          <CardContent>
            <Brain className="w-8 h-8 opacity-50" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
          <CardHeader className="pb-3">
            <CardDescription className="text-green-100">Taxa de Acerto Geral</CardDescription>
            <CardTitle className="text-3xl">{stats.overallSuccessRate.toFixed(1)}%</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendingUp className="w-8 h-8 opacity-50" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="pb-3">
            <CardDescription className="text-blue-100">Últimos 30 Dias</CardDescription>
            <CardTitle className="text-3xl">{stats.last30DaysRate.toFixed(1)}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar className="w-8 h-8 opacity-50" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardHeader className="pb-3">
            <CardDescription className="text-orange-100">Confiança Média</CardDescription>
            <CardTitle className="text-3xl">85%</CardTitle>
          </CardHeader>
          <CardContent>
            <Target className="w-8 h-8 opacity-50" />
          </CardContent>
        </Card>
      </div>

      {/* Factor Weights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Pesos dos Fatores de Análise
          </CardTitle>
          <CardDescription>
            A IA ajusta automaticamente a importância de cada fator baseado nos resultados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(stats.factorWeights).map(([factor, weight]: [string, any]) => (
              <div key={factor} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {factor.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${(weight / 2) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-12 text-right">
                    {weight.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Confidence Accuracy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Precisão por Nível de Confiança
          </CardTitle>
          <CardDescription>
            Taxa de acerto em cada faixa de confiança
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(stats.confidenceAccuracy).map(([range, accuracy]: [string, any]) => (
              <Card key={range} className="bg-slate-50 dark:bg-slate-800">
                <CardHeader className="pb-3">
                  <CardDescription>Confiança {range}%</CardDescription>
                  <CardTitle className="text-2xl">
                    {accuracy > 0 ? `${accuracy.toFixed(1)}%` : 'N/A'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full"
                      style={{ width: `${accuracy}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-lg">🤖 Como funciona a IA?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>1. Análise Diária:</strong> A IA analisa jogos do dia considerando múltiplos fatores (vantagem de casa, forma recente, histórico, etc.)
          </p>
          <p>
            <strong>2. Aprendizado Contínuo:</strong> Cada resultado é registrado e a IA ajusta os pesos dos fatores automaticamente
          </p>
          <p>
            <strong>3. Melhoria Progressiva:</strong> Quanto mais jogos analisados, mais precisa a IA se torna
          </p>
          <p>
            <strong>4. Confiança Adaptativa:</strong> O nível de confiança é ajustado baseado no histórico de acertos
          </p>
        </CardContent>
      </Card>

      {/* Last Update */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        Última atualização: {new Date(stats.lastUpdated).toLocaleString('pt-BR')}
      </div>
    </div>
  );
}
