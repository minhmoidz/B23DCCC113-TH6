// components/TaskForm.tsx
import React, { useEffect } from 'react';
import { Form, Input, Select, Button, Modal } from 'antd';
import { Task,User } from '../../types/bai2/index';


const { Option } = Select;

interface TaskFormProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (task: Partial<Task>) => void;
  editingTask: Task | null;
  usernames: string[];
  currentUser: User;
}

const TaskForm: React.FC<TaskFormProps> = ({
  visible,
  onCancel,
  onSave,
  editingTask,
  usernames,
  currentUser
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    console.log("Modal visibility changed:", visible);
    if (visible) {
      if (editingTask) {
        form.setFieldsValue(editingTask);
      } else {
        form.resetFields();
        // Set default values for new task
        form.setFieldsValue({
          priority: 'Medium',
          status: 'Todo'
        });
      }
    }
  }, [visible, editingTask, form]);

  const handleSubmit = () => {
    form.validateFields()
      .then(values => {
        console.log("Form values:", values);
        onSave({
          ...values,
          id: editingTask?.id
        });
        form.resetFields();
      })
      .catch(info => {
        console.log('Validation failed:', info);
      });
  };

  return (
    <Modal
      title={editingTask ? 'Edit Task' : 'Add New Task'}
      visible={visible}
      onCancel={onCancel}
      maskClosable={false}
      destroyOnClose={true}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Save
        </Button>
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          priority: 'Medium',
          status: 'Todo',
        }}
      >
        <Form.Item
          name="title"
          label="Task Name"
          rules={[{ required: true, message: 'Please enter task name' }]}
        >
          <Input placeholder="Enter task name" />
        </Form.Item>

        <Form.Item
          name="assignedTo"
          label="Assigned To"
          rules={[{ required: true, message: 'Please select a team member' }]}
        >
          <Select placeholder="Select team member">
            {usernames && usernames.length > 0 ? (
              usernames.map(username => (
                <Option key={username} value={username}>{username}</Option>
              ))
            ) : (
              // Fallback if no users are available
              <Option value={currentUser?.username}>{currentUser?.username || 'Current User'}</Option>
            )}
          </Select>
        </Form.Item>

        <Form.Item
          name="priority"
          label="Priority"
          rules={[{ required: true }]}
        >
          <Select>
            <Option value="Low">Low</Option>
            <Option value="Medium">Medium</Option>
            <Option value="High">High</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true }]}
        >
          <Select>
            <Option value="Todo">Todo</Option>
            <Option value="In Progress">In Progress</Option>
            <Option value="Completed">Completed</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TaskForm;
