import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Checkbox, DatePicker } from 'antd';
import { Note } from '../../models/bai2/Note';

const { TextArea } = Input;
const { Option } = Select;

interface NoteFormProps {
  note?: Note;
  availableTags: string[];
  onSubmit: (note: Note) => void;
  onCancel: () => void;
}

const NoteForm: React.FC<NoteFormProps> = ({ note, availableTags, onSubmit, onCancel }) => {
  const [form] = Form.useForm();
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>('');

  useEffect(() => {
    if (note) {
      form.setFieldsValue({
        title: note.title,
        content: note.content,
        tags: note.tags,
        isImportant: note.isImportant,
        isPinned: note.isPinned,
      });
      setTags(note.tags);
    }
  }, [note, form]);

  const handleSubmit = (values: any) => {
    const submittedNote: Note = {
      id: note?.id || Date.now().toString(),
      title: values.title,
      content: values.content,
      createdAt: note?.createdAt || new Date().toISOString(),
      tags: values.tags || [],
      isImportant: values.isImportant || false,
      isPinned: values.isPinned || false,
    };
    onSubmit(submittedNote);
  };

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      const newTags = [...tags, newTag];
      setTags(newTags);
      form.setFieldsValue({ tags: newTags });
      setNewTag('');
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Form.Item
        name="title"
        label="Tiêu đề"
        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
      >
        <Input placeholder="Nhập tiêu đề" />
      </Form.Item>

      <Form.Item
        name="content"
        label="Nội dung"
        rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
      >
        <TextArea rows={4} placeholder="Nhập nội dung" />
      </Form.Item>

      <Form.Item name="tags" label="Tags">
        <Select
          mode="multiple"
          placeholder="Chọn hoặc tạo tags"
          dropdownRender={menu => (
            <div>
              {menu}
              <div style={{ display: 'flex', padding: 8 }}>
                <Input
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  placeholder="Nhập tag mới"
                />
                <Button type="primary" onClick={handleAddTag}>
                  Thêm Tag
                </Button>
              </div>
            </div>
          )}
        >
          {[...new Set([...availableTags, ...tags])].map(tag => (
            <Option key={tag} value={tag}>
              {tag}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item name="isImportant" valuePropName="checked">
        <Checkbox>Đánh dấu quan trọng</Checkbox>
      </Form.Item>

      <Form.Item name="isPinned" valuePropName="checked">
        <Checkbox>Ghim lên đầu</Checkbox>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
          {note ? 'Cập nhật' : 'Tạo ghi chú'}
        </Button>
        <Button onClick={onCancel}>Hủy</Button>
      </Form.Item>
    </Form>
  );
};

export default NoteForm;
