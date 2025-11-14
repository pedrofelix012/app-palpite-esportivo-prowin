// Integração com APIs de dados esportivos em tempo real
// Suporta múltiplas fontes de dados para jogos futuros

export interface RealMatchData {
  id: string;
  sport: 'futebol' | 'nba';
  homeTeam: string;
  awayTeam: string;
  homeLogo: string;
  awayLogo: string;
  date: string;
  time: string;
  league: string;
  venue?: string;
  odds?: {
    home: number;
    draw?: number;
    away: number;
  };
}

// API-Football (para futebol)
// Documentação: https://www.api-football.com/documentation-v3
const fetchFootballMatches = async (): Promise<RealMatchData[]> => {
  const apiKey = process.env.NEXT_PUBLIC_FOOTBALL_API_KEY;
  
  if (!apiKey) {
    console.warn('API-Football key não configurada, usando dados simulados');
    return getSimulatedFootballMatches();
  }

  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const response = await fetch(
      `https://v3.football.api-sports.io/fixtures?date=${dateStr}&league=39,140,135,61,78`,
      {
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': 'v3.football.api-sports.io'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Erro ao buscar dados da API-Football');
    }

    const data = await response.json();
    
    return data.response.slice(0, 10).map((match: any) => ({
      id: match.fixture.id.toString(),
      sport: 'futebol' as const,
      homeTeam: match.teams.home.name,
      awayTeam: match.teams.away.name,
      homeLogo: match.teams.home.logo,
      awayLogo: match.teams.away.logo,
      date: match.fixture.date.split('T')[0],
      time: new Date(match.fixture.date).toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      league: match.league.name,
      venue: match.fixture.venue.name,
    }));
  } catch (error) {
    console.error('Erro ao buscar jogos de futebol:', error);
    return getSimulatedFootballMatches();
  }
};

// The Odds API (para NBA e outros esportes)
// Documentação: https://the-odds-api.com/liveapi/guides/v4/
const fetchNBAMatches = async (): Promise<RealMatchData[]> => {
  const apiKey = process.env.NEXT_PUBLIC_ODDS_API_KEY;
  
  if (!apiKey) {
    console.warn('The Odds API key não configurada, usando dados simulados');
    return getSimulatedNBAMatches();
  }

  try {
    const response = await fetch(
      `https://api.the-odds-api.com/v4/sports/basketball_nba/odds/?apiKey=${apiKey}&regions=us&markets=h2h`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Erro ao buscar dados da The Odds API');
    }

    const data = await response.json();
    
    return data.slice(0, 10).map((match: any) => {
      const homeTeam = match.home_team;
      const awayTeam = match.away_team;
      
      return {
        id: match.id,
        sport: 'nba' as const,
        homeTeam: homeTeam.replace(/^.*\s/, ''), // Remove cidade, mantém nome do time
        awayTeam: awayTeam.replace(/^.*\s/, ''),
        homeLogo: getNBATeamLogo(homeTeam),
        awayLogo: getNBATeamLogo(awayTeam),
        date: match.commence_time.split('T')[0],
        time: new Date(match.commence_time).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        league: 'NBA',
        odds: match.bookmakers?.[0]?.markets?.[0]?.outcomes ? {
          home: match.bookmakers[0].markets[0].outcomes.find((o: any) => o.name === homeTeam)?.price || 0,
          away: match.bookmakers[0].markets[0].outcomes.find((o: any) => o.name === awayTeam)?.price || 0,
        } : undefined,
      };
    });
  } catch (error) {
    console.error('Erro ao buscar jogos da NBA:', error);
    return getSimulatedNBAMatches();
  }
};

// Mapear logos dos times da NBA
const getNBATeamLogo = (teamName: string): string => {
  const logoMap: Record<string, string> = {
    'Lakers': 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Los_Angeles_Lakers_logo.svg',
    'Warriors': 'https://upload.wikimedia.org/wikipedia/en/0/01/Golden_State_Warriors_logo.svg',
    'Celtics': 'https://upload.wikimedia.org/wikipedia/en/8/8f/Boston_Celtics.svg',
    'Heat': 'https://upload.wikimedia.org/wikipedia/en/f/fb/Miami_Heat_logo.svg',
    'Bucks': 'https://upload.wikimedia.org/wikipedia/en/4/4a/Milwaukee_Bucks_logo.svg',
    'Nets': 'https://upload.wikimedia.org/wikipedia/commons/4/44/Brooklyn_Nets_newlogo.svg',
    'Suns': 'https://upload.wikimedia.org/wikipedia/en/d/dc/Phoenix_Suns_logo.svg',
    'Mavericks': 'https://upload.wikimedia.org/wikipedia/en/9/97/Dallas_Mavericks_logo.svg',
    'Nuggets': 'https://upload.wikimedia.org/wikipedia/en/7/76/Denver_Nuggets.svg',
    'Clippers': 'https://upload.wikimedia.org/wikipedia/en/b/bb/Los_Angeles_Clippers_%282015%29.svg',
    '76ers': 'https://upload.wikimedia.org/wikipedia/en/0/0e/Philadelphia_76ers_logo.svg',
    'Knicks': 'https://upload.wikimedia.org/wikipedia/en/2/25/New_York_Knicks_logo.svg',
    'Bulls': 'https://upload.wikimedia.org/wikipedia/en/6/67/Chicago_Bulls_logo.svg',
    'Cavaliers': 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Cleveland_Cavaliers_logo.svg',
  };

  for (const [key, logo] of Object.entries(logoMap)) {
    if (teamName.includes(key)) {
      return logo;
    }
  }

  return 'https://upload.wikimedia.org/wikipedia/en/0/03/National_Basketball_Association_logo.svg';
};

// Dados simulados para futebol (fallback)
const getSimulatedFootballMatches = (): RealMatchData[] => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split('T')[0];

  return [
    {
      id: 'sim-1',
      sport: 'futebol',
      homeTeam: 'Manchester United',
      awayTeam: 'Tottenham',
      homeLogo: 'https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg',
      awayLogo: 'https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg',
      date: dateStr,
      time: '16:00',
      league: 'Premier League',
      venue: 'Old Trafford',
    },
    {
      id: 'sim-2',
      sport: 'futebol',
      homeTeam: 'Atlético Madrid',
      awayTeam: 'Sevilla',
      homeLogo: 'https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg',
      awayLogo: 'https://upload.wikimedia.org/wikipedia/en/3/3b/Sevilla_FC_logo.svg',
      date: dateStr,
      time: '18:30',
      league: 'La Liga',
      venue: 'Wanda Metropolitano',
    },
    {
      id: 'sim-3',
      sport: 'futebol',
      homeTeam: 'AC Milan',
      awayTeam: 'Napoli',
      homeLogo: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg',
      awayLogo: 'https://upload.wikimedia.org/wikipedia/commons/2/2d/SSC_Neapel.svg',
      date: dateStr,
      time: '20:45',
      league: 'Serie A',
      venue: 'San Siro',
    },
    {
      id: 'sim-4',
      sport: 'futebol',
      homeTeam: 'Borussia Dortmund',
      awayTeam: 'RB Leipzig',
      homeLogo: 'https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg',
      awayLogo: 'https://upload.wikimedia.org/wikipedia/en/0/04/RB_Leipzig_2014_logo.svg',
      date: dateStr,
      time: '15:30',
      league: 'Bundesliga',
      venue: 'Signal Iduna Park',
    },
  ];
};

// Dados simulados para NBA (fallback)
const getSimulatedNBAMatches = (): RealMatchData[] => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split('T')[0];

  return [
    {
      id: 'sim-nba-1',
      sport: 'nba',
      homeTeam: '76ers',
      awayTeam: 'Knicks',
      homeLogo: 'https://upload.wikimedia.org/wikipedia/en/0/0e/Philadelphia_76ers_logo.svg',
      awayLogo: 'https://upload.wikimedia.org/wikipedia/en/2/25/New_York_Knicks_logo.svg',
      date: dateStr,
      time: '19:00',
      league: 'NBA',
      venue: 'Wells Fargo Center',
    },
    {
      id: 'sim-nba-2',
      sport: 'nba',
      homeTeam: 'Bulls',
      awayTeam: 'Cavaliers',
      homeLogo: 'https://upload.wikimedia.org/wikipedia/en/6/67/Chicago_Bulls_logo.svg',
      awayLogo: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Cleveland_Cavaliers_logo.svg',
      date: dateStr,
      time: '20:00',
      league: 'NBA',
      venue: 'United Center',
    },
    {
      id: 'sim-nba-3',
      sport: 'nba',
      homeTeam: 'Lakers',
      awayTeam: 'Suns',
      homeLogo: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Los_Angeles_Lakers_logo.svg',
      awayLogo: 'https://upload.wikimedia.org/wikipedia/en/d/dc/Phoenix_Suns_logo.svg',
      date: dateStr,
      time: '22:30',
      league: 'NBA',
      venue: 'Crypto.com Arena',
    },
  ];
};

// Função principal para buscar todos os jogos futuros
export const fetchUpcomingMatches = async (): Promise<RealMatchData[]> => {
  try {
    const [footballMatches, nbaMatches] = await Promise.all([
      fetchFootballMatches(),
      fetchNBAMatches(),
    ]);

    const allMatches = [...footballMatches, ...nbaMatches];
    
    // Ordenar por data e hora
    allMatches.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });

    return allMatches;
  } catch (error) {
    console.error('Erro ao buscar jogos futuros:', error);
    return [...getSimulatedFootballMatches(), ...getSimulatedNBAMatches()];
  }
};

// Buscar jogos de um esporte específico
export const fetchMatchesBySport = async (sport: 'futebol' | 'nba'): Promise<RealMatchData[]> => {
  const allMatches = await fetchUpcomingMatches();
  return allMatches.filter(match => match.sport === sport);
};

// Buscar jogos de uma data específica
export const fetchMatchesByDate = async (date: string): Promise<RealMatchData[]> => {
  const allMatches = await fetchUpcomingMatches();
  return allMatches.filter(match => match.date === date);
};
