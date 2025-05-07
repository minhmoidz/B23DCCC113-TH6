import React from 'react';
import { Row, Col, Empty, Radio } from 'antd';
import { AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons';
import NoteItem from './NoteItem';
import { Note } from '../models/Note';

interface NoteListProps {
  notes: Note[];
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onToggleImportant: (note: Note) => void;
  onTogglePin: (note: Note) => void;
}

const NoteList: React.FC<NoteListProps> = ({
  notes,
  viewMode,
  onViewModeChange,
  onEdit,
  onDelete,
  onToggleImportant,
  onTogglePin,
}) => {
  // Sắp xếp ghi chú: ghim lên đầu
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  return (
    <div>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Radio.Group 
          value={viewMode} 
          onChange={e => onViewModeChange(e.target.value)}
          buttonStyle="solid"
        >
          <Radio.Button value="grid"><AppstoreOutlined /> Lưới</Radio.Button>
          <Radio.Button value="list"><UnorderedListOutlined /> Danh sách</Radio.Button>
        </Radio.Group>
      </div>

      {notes.length === 0 ? (
        <Empty description="Không có ghi chú nào" />
      ) : (
        <Row gutter={viewMode === 'grid' ? 16 : 0}>
          {sortedNotes.map(note => (
            <Col 
              key={note.id} 
              xs={24} 
              sm={viewMode === 'grid' ? 12 : 24} 
              md={viewMode === 'grid' ? 8 : 24}
              lg={viewMode === 'grid' ? 6 : 24}
              style={{ marginBottom: 16 }}
            >
              <NoteItem
                note={note}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleImportant={onToggleImportant}
                onTogglePin={onTogglePin}
              />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default NoteList;
