// API Route para gerar palpites automáticos diários
// Pode ser chamada via cron job ou webhook

import { NextRequest, NextResponse } from 'next/server';
import { generateDailyPredictions, saveHistoricalResult } from '@/lib/ai-predictions';
import { savePrediction } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação (em produção, usar API key)
    const authHeader = request.headers.get('authorization');
    const apiKey = process.env.CRON_SECRET || 'dev-secret-key';
    
    if (authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Gerar palpites do dia
    const predictions = await generateDailyPredictions();
    
    // Salvar palpites (userId 'system' para palpites automáticos)
    const savedPredictions = predictions.map(pred => 
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
      })
    );

    return NextResponse.json({
      success: true,
      message: `${predictions.length} palpites gerados com sucesso`,
      predictions: savedPredictions,
    });
  } catch (error) {
    console.error('Erro ao gerar palpites:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar palpites' },
      { status: 500 }
    );
  }
}

// Endpoint para atualizar resultado de um palpite
export async function PUT(request: NextRequest) {
  try {
    const { predictionId, result } = await request.json();
    
    if (!predictionId || !result) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      );
    }

    // Salvar resultado histórico para aprendizado da IA
    saveHistoricalResult({
      matchId: predictionId,
      prediction: 'prediction', // Buscar do banco
      actualResult: result,
      confidence: 85, // Buscar do banco
      factors: ['home_advantage', 'recent_form'],
      date: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Resultado atualizado e IA aprendeu com o resultado',
    });
  } catch (error) {
    console.error('Erro ao atualizar resultado:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar resultado' },
      { status: 500 }
    );
  }
}

// Endpoint para obter estatísticas da IA
export async function GET() {
  try {
    const { getAIStats } = await import('@/lib/ai-predictions');
    const stats = getAIStats();
    
    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    );
  }
}
