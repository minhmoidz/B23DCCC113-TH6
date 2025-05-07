import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Button } from 'antd';
import { Task, User } from '../../types/bai2';

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
    // Reset form when modal opens or editing task changes
    if (visible) {
      form.resetFields();
      
      if (editingTask) {
        // Populate form with editing task data
        form.setFieldsValue({
          title: editingTask.title,
          assignedTo: editingTask.assignedTo,
          priority: editingTask.priority,
          status: editingTask.status,
        });
      } else {
        // Set default values for new task
        form.setFieldsValue({
          assignedTo: currentUser.username,
          priority: 'Medium',
          status: 'Todo',
        });
      }
    }
  }, [visible, editingTask, form, currentUser]);

  const handleSubmit = () => {
    form.validateFields()
      .then(values => {
        onSave(values);
        form.resetFields();
      })
      .catch(info => {
        console.error('Validate Failed:', info);
      });
  };

  return (
    <Modal
      title={editingTask ? "Edit Task" : "Add New Task"}
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          {editingTask ? "Update" : "Create"}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        name="taskForm"
      >
        <Form.Item
          name="title"
          label="Task Title"
          rules={[{ required: true, message: 'Please enter task title' }]}
        >
          <Input placeholder="Enter task title" />
        </Form.Item>

        <Form.Item
          name="assignedTo"
          label="Assigned To"
          rules={[{ required: true, message: 'Please select assignee' }]}
        >
          <Select placeholder="Select an assignee">
            {usernames.map(username => (
              <Option key={username} value={username}>{username}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="priority"
          label="Priority"
          rules={[{ required: true, message: 'Please select priority' }]}
        >
          <Select placeholder="Select priority">
            <Option value="Low">Low</Option>
            <Option value="Medium">Medium</Option>
            <Option value="High">High</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: 'Please select status' }]}
        >
          <Select placeholder="Select status">
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