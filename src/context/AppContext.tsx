// context/AppContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Application,
  Member,
  Statistics,
  ApplicationStatus,
  AspirationType,
  ApplicationLog
} from '../types/bai1/index';
import { generateId, getCurrentDateTimeString } from '../utils/bai1/helpers';

interface AppContextType {
  applications: Application[];
  members: Member[];
  statistics: Statistics;
  setApplications: React.Dispatch<React.SetStateAction<Application[]>>;
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  addApplication: (application: Omit<Application, 'id' | 'status' | 'logs' | 'createdAt'>) => void;
  updateApplicationStatus: (id: string, status: ApplicationStatus, note?: string) => void;
  updateMemberTeam: (id: string, team: AspirationType) => void;
  searchApplications: (query: string) => Application[];
  calculateStatistics: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    aspirations: { design: 0, dev: 0, media: 0 },
    status: { pending: 0, approved: 0, rejected: 0, total: 0 },
    teams: { design: 0, dev: 0, media: 0, total: 0 },
  });

  // Load data from localStorage on initial load
  useEffect(() => {
    const storedApplications = localStorage.getItem('applications');
    const storedMembers = localStorage.getItem('members');

    if (storedApplications) {
      setApplications(JSON.parse(storedApplications));
    }

    if (storedMembers) {
      setMembers(JSON.parse(storedMembers));
    }
  }, []);

  // Save data to localStorage whenever applications or members change
  useEffect(() => {
    localStorage.setItem('applications', JSON.stringify(applications));
    calculateStatistics();
  }, [applications]);

  useEffect(() => {
    localStorage.setItem('members', JSON.stringify(members));
    calculateStatistics();
  }, [members]);

  const calculateStatistics = () => {
    const aspirationStats = { design: 0, dev: 0, media: 0 };
    const statusStats = { pending: 0, approved: 0, rejected: 0, total: applications.length };
    const teamStats = { design: 0, dev: 0, media: 0, total: members.length };

    // Calculate application statistics
    applications.forEach(app => {
      aspirationStats[app.aspiration]++;
      statusStats[app.status]++;
    });

    // Calculate team statistics
    members.forEach(member => {
      teamStats[member.team]++;
    });

    setStatistics({
      aspirations: aspirationStats,
      status: statusStats,
      teams: teamStats,
    });
  };

  const addApplication = (application: Omit<Application, 'id' | 'status' | 'logs' | 'createdAt'>) => {
    const newApplication: Application = {
      ...application,
      id: generateId(),
      status: 'pending',
      logs: [],
      createdAt: getCurrentDateTimeString(),
    };

    setApplications(prev => [...prev, newApplication]);
  };

  const updateApplicationStatus = (id: string, status: ApplicationStatus, note?: string) => {
    setApplications(prev =>
      prev.map(app => {
        if (app.id === id) {
          // Create a log entry
          const logEntry: ApplicationLog = {
            action: status,
            timestamp: getCurrentDateTimeString(),
            note: note,
            admin: 'Admin', // In a real app, this would be the current user
          };

          // If status is approved, add the user to members
          if (status === 'approved' && app.status !== 'approved') {
            const newMember: Member = {
              id: generateId(),
              fullName: app.fullName,
              email: app.email,
              role: 'Member',
              team: app.aspiration,
              applicationId: app.id,
              joinedAt: getCurrentDateTimeString(),
            };
            setMembers(prev => [...prev, newMember]);
          }

          // If status was approved but now is rejected, remove from members
          if (app.status === 'approved' && status === 'rejected') {
            setMembers(prev => prev.filter(member => member.applicationId !== app.id));
          }

          return {
            ...app,
            status,
            logs: [...app.logs, logEntry],
          };
        }
        return app;
      })
    );
  };

  const updateMemberTeam = (id: string, team: AspirationType) => {
    setMembers(prev =>
      prev.map(member => {
        if (member.id === id) {
          return {
            ...member,
            team,
          };
        }
        return member;
      })
    );
  };

  const searchApplications = (query: string): Application[] => {
    if (!query) return applications;

    const lowerQuery = query.toLowerCase();
    return applications.filter(app =>
      app.fullName.toLowerCase().includes(lowerQuery) ||
      app.email.toLowerCase().includes(lowerQuery) ||
      app.aspiration.toLowerCase().includes(lowerQuery)
    );
  };

  return (
    <AppContext.Provider value={{
      applications,
      members,
      statistics,
      setApplications,
      setMembers,
      addApplication,
      updateApplicationStatus,
      updateMemberTeam,
      searchApplications,
      calculateStatistics,
    }}>
      {children}
    </AppContext.Provider>
  );
};
