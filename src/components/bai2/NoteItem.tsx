import React from 'react';
import { Card, Tag, Typography, Space, Button, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, PushpinOutlined, StarOutlined, StarFilled } from '@ant-design/icons';
import { Note } from '../../models/bai2/Note';

const { Text, Title } = Typography;

interface NoteItemProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onToggleImportant: (note: Note) => void;
  onTogglePin: (note: Note) => void;
}

const NoteItem: React.FC<NoteItemProps> = ({ 
  note, 
  onEdit, 
  onDelete, 
  onToggleImportant, 
  onTogglePin 
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card
      style={{ 
        marginBottom: 16, 
        borderLeft: note.isImportant ? '3px solid #ff4d4f' : undefined,
        backgroundColor: note.isPinned ? '#fffbe6' : undefined
      }}
      actions={[
        <Tooltip title={note.isImportant ? "Bỏ đánh dấu quan trọng" : "Đánh dấu quan trọng"}>
          <Button 
            type="text" 
            icon={note.isImportant ? <StarFilled style={{ color: '#ff4d4f' }} /> : <StarOutlined />} 
            onClick={() => onToggleImportant(note)} 
          />
        </Tooltip>,
        <Tooltip title={note.isPinned ? "Bỏ ghim" : "Ghim lên đầu"}>
          <Button 
            type="text" 
            icon={<PushpinOutlined style={{ color: note.isPinned ? '#1890ff' : undefined }} />} 
            onClick={() => onTogglePin(note)} 
          />
        </Tooltip>,
        <Tooltip title="Chỉnh sửa">
          <Button type="text" icon={<EditOutlined />} onClick={() => onEdit(note)} />
        </Tooltip>,
        <Tooltip title="Xóa">
          <Button type="text" icon={<DeleteOutlined />} onClick={() => onDelete(note.id)} />
        </Tooltip>,
      ]}
    >
      <Title level={4}>{note.title}</Title>
      <Text style={{ whiteSpace: 'pre-wrap' }}>{note.content}</Text>
      <div style={{ marginTop: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text type="secondary">Ngày tạo: {formatDate(note.createdAt)}</Text>
          <div>
            {note.tags.map(tag => (
              <Tag key={tag} color="blue" style={{ marginBottom: 4 }}>
                {tag}
              </Tag>
            ))}
          </div>
        </Space>
      </div>
    </Card>
  );
};

export default NoteItem;
