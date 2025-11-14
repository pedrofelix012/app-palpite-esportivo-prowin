'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserVipStatus } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, CheckCircle2, TrendingUp, Users, MessageCircle, Zap, ExternalLink } from 'lucide-react';

export default function VipPage() {
  const router = useRouter();
  const { user, loading, refreshUser } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSubscribe = () => {
    setIsProcessing(true);
    
    // Simular processamento de pagamento
    setTimeout(() => {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);
      
      updateUserVipStatus(user.id, true, expiresAt.toISOString());
      refreshUser();
      setIsProcessing(false);
    }, 2000);
  };

  const handleAccessTelegram = () => {
    // Link do grupo VIP do Telegram (substitua pelo seu link real)
    window.open('https://t.me/+seu_grupo_vip', '_blank');
  };

  if (user.isVip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full mb-4 shadow-2xl">
              <Crown className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Área VIP Ativa
            </h1>
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-lg px-4 py-1">
              Membro Premium
            </Badge>
          </div>

          <Card className="shadow-2xl border-0 bg-white dark:bg-slate-800">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Bem-vindo ao Grupo VIP! 🎉</CardTitle>
              <CardDescription>
                Você tem acesso completo aos sinais premium
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <MessageCircle className="w-6 h-6" />
                  Acesse o Grupo no Telegram
                </h3>
                <p className="mb-4 text-amber-50">
                  Clique no botão abaixo para entrar no grupo VIP exclusivo e começar a receber sinais premium em tempo real.
                </p>
                <Button
                  onClick={handleAccessTelegram}
                  className="w-full bg-white text-orange-600 hover:bg-amber-50 font-semibold"
                  size="lg"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Entrar no Grupo VIP
                </Button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Card className="bg-green-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      Sinais Premium
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700">
                      Acesso a sinais com 90%+ de confiança baseados em análises profundas
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Zap className="w-5 h-5 text-blue-600" />
                      Tempo Real
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700">
                      Notificações instantâneas de novos sinais e análises ao vivo
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50 border-purple-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-600" />
                      Comunidade
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700">
                      Interaja com outros membros VIP e compartilhe estratégias
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-orange-50 border-orange-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-orange-600" />
                      Suporte Direto
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700">
                      Tire dúvidas diretamente com nossos especialistas
                    </p>
                  </CardContent>
                </Card>
              </div>

              {user.vipExpiresAt && (
                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                  Sua assinatura VIP expira em: {new Date(user.vipExpiresAt).toLocaleDateString('pt-BR')}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full mb-4 shadow-2xl">
            <Crown className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Plano VIP Premium
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Eleve seus palpites para o próximo nível
          </p>
        </div>

        <Card className="shadow-2xl border-0 bg-white dark:bg-slate-800 mb-8">
          <CardHeader className="text-center bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-t-lg">
            <CardTitle className="text-3xl font-semibold">R$ 29,90/mês</CardTitle>
            <CardDescription className="text-amber-50">
              Acesso completo ao grupo VIP no Telegram
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Sinais Exclusivos Premium</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Palpites com 90%+ de confiança baseados em análises estatísticas avançadas
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Análises em Tempo Real</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Acompanhe os jogos com análises ao vivo e ajustes de estratégia
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Grupo VIP no Telegram</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Comunidade exclusiva com outros membros premium e especialistas
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Suporte Prioritário</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Tire dúvidas diretamente com nossos analistas profissionais
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Histórico Completo</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Acesso ao histórico de todos os sinais e resultados para análise
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Notificações Instantâneas</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receba alertas imediatos de novos sinais premium
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSubscribe}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-6 text-lg shadow-lg"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processando...
                </>
              ) : (
                <>
                  <Crown className="w-6 h-6 mr-2" />
                  Assinar Plano VIP Agora
                </>
              )}
            </Button>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
              Cancele a qualquer momento. Sem taxas ocultas.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <TrendingUp className="w-5 h-5" />
              Resultados Comprovados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">87%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Taxa de Acerto</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">250+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Membros VIP</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">350+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Sinais Enviados</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
