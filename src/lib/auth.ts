// Sistema de autenticação com Local Storage

export interface User {
  id: string;
  email: string;
  name: string;
  isVip: boolean;
  vipExpiresAt?: string;
  createdAt: string;
}

export interface Prediction {
  id: string;
  userId: string;
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
  result?: 'win' | 'loss' | 'pending';
}

const USERS_KEY = 'sports_predictions_users';
const CURRENT_USER_KEY = 'sports_predictions_current_user';
const PREDICTIONS_KEY = 'sports_predictions_data';

// Gerenciamento de usuários
export const getUsers = (): User[] => {
  if (typeof window === 'undefined') return [];
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const register = (email: string, password: string, name: string): { success: boolean; error?: string; user?: User } => {
  const users = getUsers();
  
  if (users.find(u => u.email === email)) {
    return { success: false, error: 'Email já cadastrado' };
  }

  const newUser: User = {
    id: crypto.randomUUID(),
    email,
    name,
    isVip: false,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  // Salvar senha (em produção, use hash!)
  localStorage.setItem(`pwd_${email}`, password);

  return { success: true, user: newUser };
};

export const login = (email: string, password: string): { success: boolean; error?: string; user?: User } => {
  const users = getUsers();
  const user = users.find(u => u.email === email);

  if (!user) {
    return { success: false, error: 'Usuário não encontrado' };
  }

  const savedPassword = localStorage.getItem(`pwd_${email}`);
  if (savedPassword !== password) {
    return { success: false, error: 'Senha incorreta' };
  }

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return { success: true, user };
};

export const logout = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const updateUserVipStatus = (userId: string, isVip: boolean, expiresAt?: string) => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex !== -1) {
    users[userIndex].isVip = isVip;
    users[userIndex].vipExpiresAt = expiresAt;
    saveUsers(users);

    // Atualizar usuário atual se for o mesmo
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(users[userIndex]));
    }
  }
};

// Gerenciamento de palpites
export const getPredictions = (): Prediction[] => {
  if (typeof window === 'undefined') return [];
  const predictions = localStorage.getItem(PREDICTIONS_KEY);
  return predictions ? JSON.parse(predictions) : [];
};

export const savePrediction = (prediction: Omit<Prediction, 'id' | 'date'>): Prediction => {
  const predictions = getPredictions();
  const newPrediction: Prediction = {
    ...prediction,
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
  };

  predictions.unshift(newPrediction);
  localStorage.setItem(PREDICTIONS_KEY, JSON.stringify(predictions));
  return newPrediction;
};

export const getUserPredictions = (userId: string): Prediction[] => {
  return getPredictions().filter(p => p.userId === userId);
};

export const updatePredictionResult = (predictionId: string, result: 'win' | 'loss') => {
  const predictions = getPredictions();
  const index = predictions.findIndex(p => p.id === predictionId);
  
  if (index !== -1) {
    predictions[index].result = result;
    localStorage.setItem(PREDICTIONS_KEY, JSON.stringify(predictions));
  }
};
