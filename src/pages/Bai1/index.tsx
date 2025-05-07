// App.tsx
import React, { useEffect, useState } from 'react';
import { ConfigProvider } from 'antd';
import Login from '../../components/bai1/Login';
import TaskList from '../../components/bai1/TaskList';
import { UserModel } from '../../models/bai1/UserModel';
import { User } from '../../types/bai1/index';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User>({ username: '', isLoggedIn: false });
  const [registeredUsers, setRegisteredUsers] = useState<string[]>([]);

  useEffect(() => {
    // Check if user is already logged in
    const user = UserModel.getCurrentUser();
    setCurrentUser(user);

    // Load registered users from localStorage
    const users = localStorage.getItem('registeredUsers');
    const usersList = users ? JSON.parse(users) : [];
    setRegisteredUsers(usersList);
  }, []);

  const handleLoginSuccess = () => {
    const user = UserModel.getCurrentUser();
    setCurrentUser(user);

    // Add user to registered users list if not already there
    if (user.username && !registeredUsers.includes(user.username)) {
      const updatedUsers = [...registeredUsers, user.username];
      setRegisteredUsers(updatedUsers);
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    }
  };

  const handleLogout = () => {
    UserModel.logout();
    setCurrentUser({ username: '', isLoggedIn: false });
  };

  return (
    <ConfigProvider>
      <div className="app-container">
        {currentUser.isLoggedIn ? (
          <TaskList
            currentUser={currentUser}
            onLogout={handleLogout}
            registeredUsers={registeredUsers}
          />
        ) : (
          <Login onLoginSuccess={handleLoginSuccess} />
        )}
      </div>
    </ConfigProvider>
  );
};

export default App;
