// App.tsx

import React from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import viVN from 'antd/lib/locale/vi_VN';
import MainLayout from './MainLayout';
import { AppProvider } from '../../context/AppContext';

// Pages
import ApplicationsPage from './ApplicationsPage';
import RegisterPage from './RegisterPage';
import MembersPage from './MembersPage';
import StatisticsPage from './StatisticsPage';

const App: React.FC = () => {
  return (
    <ConfigProvider locale={viVN}>
      <AppProvider>
        <Router>
          <MainLayout>
            <Switch>
              <Route path="/applications" component={ApplicationsPage} />
              <Route path="/register" component={RegisterPage} />
              <Route path="/members" component={MembersPage} />
              <Route path="/statistics" component={StatisticsPage} />
              <Redirect from="/" to="/applications" />
            </Switch>
          </MainLayout>
        </Router>
      </AppProvider>
    </ConfigProvider>
  );
};

export default App;
