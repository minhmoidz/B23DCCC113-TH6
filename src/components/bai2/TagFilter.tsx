import React from 'react';
import { Select, Typography } from 'antd';

const { Option } = Select;
const { Text } = Typography;

interface TagFilterProps {
  tags: string[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

const TagFilter: React.FC<TagFilterProps> = ({ tags, selectedTags, onTagsChange }) => {
  return (
    <div style={{ marginBottom: 16 }}>
      <Text style={{ marginRight: 8 }}>Lọc theo tag:</Text>
      <Select
        mode="multiple"
        style={{ width: '100%' }}
        placeholder="Chọn tags để lọc"
        value={selectedTags}
        onChange={onTagsChange}
        allowClear
      >
        {tags.map(tag => (
          <Option key={tag} value={tag}>
            {tag}
          </Option>
        ))}
      </Select>
    </div>
  );
};

export default TagFilter;
