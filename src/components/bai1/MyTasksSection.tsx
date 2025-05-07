import React from 'react';
import { Card, Button, Empty } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Task } from '../../types/bai1';
import TaskItem from './TaskItem';

interface MyTasksSectionProps {
  tasks: Task[];
  onDragEnd: (result: any) => void;
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const MyTasksSection: React.FC<MyTasksSectionProps> = ({
  tasks,
  onDragEnd,
  onAddTask,
  onEditTask,
  onDeleteTask
}) => {
  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>My Tasks (Drag to reorder)</span>
          <Button
            type="primary"
            size="small"
            onClick={onAddTask}
            icon={<PlusOutlined />}
          >
            Add Task
          </Button>
        </div>
      }
      style={{ marginBottom: 24 }}
    >
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="tasks">
          {(droppableProvided) => (
            <div
              {...droppableProvided.droppableProps}
              ref={droppableProvided.innerRef}
            >
              {tasks.length > 0 ? (
                tasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(draggableProvided) => (
                      <TaskItem
                        task={task}
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                        provided={draggableProvided}
                      />
                    )}
                  </Draggable>
                ))
              ) : (
                <Empty description="No tasks assigned to you yet" />
              )}
              {droppableProvided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </Card>
  );
};

export default MyTasksSection;
