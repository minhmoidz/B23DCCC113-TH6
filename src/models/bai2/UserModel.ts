import { User } from '../../types/bai2/index';


export const UserModel = {
  getCurrentUser: (): User => {
    try {
      const user = localStorage.getItem('currentUser');
      if (!user) return { username: '', isLoggedIn: false };

      const parsedUser = JSON.parse(user);
      return typeof parsedUser === 'object' && parsedUser !== null
        ? parsedUser
        : { username: '', isLoggedIn: false };
    } catch (error) {
      console.error('Error retrieving user from localStorage:', error);
      return { username: '', isLoggedIn: false };
    }
  },

  login: (username: string): User => {
    const user: User = { username, isLoggedIn: true };
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  },

  logout: (): void => {
    localStorage.removeItem('currentUser');
  }
};
