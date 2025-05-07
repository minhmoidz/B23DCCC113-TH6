import React, { useState, useEffect } from 'react';
import { Layout, Typography, Button, Modal, Divider, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import NoteForm from '../../components/bai2/NoteForm';
import NoteList from '../../components/bai2/NoteList';
import SearchBar from '../../components/bai2/SearchBar';
import TagFilter from '../../components/bai2/TagFilter';
import { Note } from '../../models/bai2/Note';
import * as noteService from '../../services/bai2/noteService';

const { Header, Content } = Layout;
const { Title } = Typography;

const App: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>(undefined);
  const [searchText, setSearchText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null] | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Load notes from localStorage on component mount
  useEffect(() => {
    const loadedNotes = noteService.getNotes();
    setNotes(loadedNotes);
    setFilteredNotes(loadedNotes);
  }, []);

  // Apply filters whenever notes, searchText, selectedTags, or dateRange changes
  useEffect(() => {
    let result = [...notes];

    // Filter by search text
    if (searchText) {
      const lowerSearchText = searchText.toLowerCase();
      result = result.filter(
        note =>
          note.title.toLowerCase().includes(lowerSearchText) ||
          note.content.toLowerCase().includes(lowerSearchText)
      );
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      result = result.filter(note =>
        selectedTags.some(tag => note.tags.includes(tag))
      );
    }

    // Filter by date range
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].setHours(0, 0, 0, 0);
      const endDate = dateRange[1].setHours(23, 59, 59, 999);
      
      result = result.filter(note => {
        const noteDate = new Date(note.createdAt).getTime();
        return noteDate >= startDate && noteDate <= endDate;
      });
    }

    setFilteredNotes(result);
  }, [notes, searchText, selectedTags, dateRange]);

  // Get all unique tags from notes
  const getAllTags = () => {
    const allTags = notes.flatMap(note => note.tags);
    return [...new Set(allTags)];
  };

  const handleAddNote = () => {
    setEditingNote(undefined);
    setIsModalVisible(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsModalVisible(true);
  };

  const handleDeleteNote = (id: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa ghi chú này không?',
      onOk: () => {
        noteService.deleteNote(id);
        const updatedNotes = notes.filter(note => note.id !== id);
        setNotes(updatedNotes);
        message.success('Đã xóa ghi chú');
      },
    });
  };

  const handleToggleImportant = (note: Note) => {
    const updatedNote = { ...note, isImportant: !note.isImportant };
    noteService.updateNote(updatedNote);
    const updatedNotes = notes.map(n => (n.id === note.id ? updatedNote : n));
    setNotes(updatedNotes);
  };

  const handleTogglePin = (note: Note) => {
    const updatedNote = { ...note, isPinned: !note.isPinned };
    noteService.updateNote(updatedNote);
    const updatedNotes = notes.map(n => (n.id === note.id ? updatedNote : n));
    setNotes(updatedNotes);
  };

  const handleNoteSubmit = (note: Note) => {
    if (editingNote) {
      // Update existing note
      noteService.updateNote(note);
      const updatedNotes = notes.map(n => (n.id === note.id ? note : n));
      setNotes(updatedNotes);
      message.success('Đã cập nhật ghi chú');
    } else {
      // Add new note
      noteService.addNote(note);
      setNotes([...notes, note]);
      message.success('Đã tạo ghi chú mới');
    }
    setIsModalVisible(false);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={3} style={{ margin: '16px 0' }}>
            Ứng dụng Ghi chú Cá nhân
          </Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNote}>
            Tạo ghi chú
          </Button>
        </div>
      </Header>
      <Content style={{ padding: '24px' }}>
        <SearchBar onSearch={setSearchText} onDateRangeChange={setDateRange} />
        <TagFilter 
          tags={getAllTags()} 
          selectedTags={selectedTags} 
          onTagsChange={setSelectedTags} 
        />
        <Divider />
        <NoteList
          notes={filteredNotes}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onEdit={handleEditNote}
          onDelete={handleDeleteNote}
          onToggleImportant={handleToggleImportant}
          onTogglePin={handleTogglePin}
        />
      </Content>

      <Modal
        title={editingNote ? 'Chỉnh sửa ghi chú' : 'Tạo ghi chú mới'}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <NoteForm
          note={editingNote}
          availableTags={getAllTags()}
          onSubmit={handleNoteSubmit}
          onCancel={() => setIsModalVisible(false)}
        />
      </Modal>
    </Layout>
  );
};

export default App;
