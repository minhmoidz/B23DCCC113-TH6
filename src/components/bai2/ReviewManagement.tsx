// components/ReviewManagement.tsx
import React, { useState, useEffect } from 'react';
import { Card, List, Rate, Comment, Avatar, Input, Button, Tabs, Form, Modal, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { Review, Employee, Service, Appointment } from '../../interfaces/types';
import { reviewService, employeeService, serviceService, appointmentService } from '../../services/bai2/localStorageService';
import { v4 as uuidv4 } from 'uuid';

const { TabPane } = Tabs;
const { TextArea } = Input;

interface ReviewFormProps {
  appointmentId: string;
  onSubmit: (values: any) => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ appointmentId, onSubmit }) => {
  const [form] = Form.useForm();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    const appointmentData = appointmentService.getById(appointmentId);
    if (appointmentData) {
      setAppointment(appointmentData);

      const serviceData = serviceService.getById(appointmentData.serviceId);
      if (serviceData) setService(serviceData);

      const employeeData = employeeService.getById(appointmentData.employeeId);
      if (employeeData) setEmployee(employeeData);
    }
  }, [appointmentId]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error('Validate Failed:', error);
    }
  };

  if (!appointment || !service || !employee) {
    return <div>Đang tải...</div>;
  }

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <div style={{ marginBottom: 16 }}>
        <h3>Dịch vụ: {service.name}</h3>
        <h3>Nhân viên: {employee.name}</h3>
        <h3>Ngày: {appointment.date} ({appointment.startTime} - {appointment.endTime})</h3>
      </div>

      <Form.Item
        name="rating"
        label="Đánh giá"
        rules={[{ required: true, message: 'Vui lòng đánh giá!' }]}
      >
        <Rate />
      </Form.Item>

      <Form.Item
        name="comment"
        label="Nhận xét"
        rules={[{ required: true, message: 'Vui lòng nhập nhận xét!' }]}
      >
        <TextArea rows={4} placeholder="Nhập nhận xét của bạn về dịch vụ và nhân viên" />
      </Form.Item>

      // components/ReviewManagement.tsx (tiếp theo)
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Gửi đánh giá
        </Button>
      </Form.Item>
    </Form>
  );
};

const ReviewManagement: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<string>('');
  const [replyForm] = Form.useForm();
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const reviewsData = reviewService.getAll();
    const employeesData = employeeService.getAll();
    const servicesData = serviceService.getAll();
    const appointmentsData = appointmentService.getAll().filter(app => app.status === 'completed');

    setReviews(reviewsData);
    setEmployees(employeesData);
    setServices(servicesData);
    setAppointments(appointmentsData);
  };

  const handleReviewSubmit = (values: any) => {
    const appointment = appointmentService.getById(selectedAppointment);
    if (!appointment) return;

    const newReview: Review = {
      id: uuidv4(),
      appointmentId: selectedAppointment,
      customerId: appointment.customerId,
      employeeId: appointment.employeeId,
      serviceId: appointment.serviceId,
      rating: values.rating,
      comment: values.comment,
      createdAt: new Date().toISOString(),
    };

    reviewService.add(newReview);
    setIsModalVisible(false);
    message.success('Đánh giá của bạn đã được gửi thành công!');
    loadData();
  };

  const handleReplySubmit = async () => {
    try {
      const values = await replyForm.validateFields();

      if (replyingReviewId) {
        const review = reviewService.getById(replyingReviewId);
        if (review) {
          const updatedReview = {
            ...review,
            employeeResponse: values.reply,
          };
          reviewService.update(updatedReview);
          message.success('Phản hồi đã được gửi thành công!');
          setReplyingReviewId(null);
          replyForm.resetFields();
          loadData();
        }
      }
    } catch (error) {
      console.error('Validate Failed:', error);
    }
  };

  const showReviewModal = (appointmentId: string) => {
    // Kiểm tra xem lịch hẹn này đã có đánh giá chưa
    const existingReview = reviewService.getByAppointmentId(appointmentId);
    if (existingReview) {
      message.warning('Bạn đã đánh giá cho lịch hẹn này!');
      return;
    }

    setSelectedAppointment(appointmentId);
    setIsModalVisible(true);
  };

  const handleReply = (reviewId: string) => {
    setReplyingReviewId(reviewId);
  };

  const getServiceName = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    return service ? service.name : 'N/A';
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee ? employee.name : 'N/A';
  };

  const getCompletedAppointmentsWithoutReview = () => {
    const reviewedAppointmentIds = reviews.map(review => review.appointmentId);
    return appointments.filter(app =>
      app.status === 'completed' && !reviewedAppointmentIds.includes(app.id)
    );
  };

  return (
    <Card title="Đánh giá dịch vụ">
      <Tabs defaultActiveKey="1">
        <TabPane tab="Tất cả đánh giá" key="1">
          <List
            className="comment-list"
            header={`${reviews.length} đánh giá`}
            itemLayout="horizontal"
            dataSource={reviews}
            renderItem={review => (
              <li>
                <Comment
                  author={<a>{review.customerId}</a>}
                  avatar={<Avatar icon={<UserOutlined />} />}
                  content={
                    <div>
                      <p>Dịch vụ: {getServiceName(review.serviceId)}</p>
                      <p>Nhân viên: {getEmployeeName(review.employeeId)}</p>
                      <Rate disabled defaultValue={review.rating} />
                      <p>{review.comment}</p>
                    </div>
                  }
                  datetime={new Date(review.createdAt).toLocaleString()}
                  children={
                    review.employeeResponse ? (
                      <Comment
                        author={<a>{getEmployeeName(review.employeeId)} (Nhân viên)</a>}
                        avatar={<Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />}
                        content={<p>{review.employeeResponse}</p>}
                      />
                    ) : (
                      <div>
                        {!replyingReviewId || replyingReviewId !== review.id ? (
                          <Button type="link" onClick={() => handleReply(review.id)}>Phản hồi</Button>
                        ) : (
                          <Form form={replyForm} onFinish={handleReplySubmit}>
                            <Form.Item
                              name="reply"
                              rules={[{ required: true, message: 'Vui lòng nhập phản hồi!' }]}
                            >
                              <TextArea rows={2} placeholder="Nhập phản hồi của bạn" />
                            </Form.Item>
                            <Form.Item>
                              <Button htmlType="submit" type="primary" size="small">
                                Gửi phản hồi
                              </Button>
                              <Button
                                onClick={() => setReplyingReviewId(null)}
                                size="small"
                                style={{ marginLeft: 8 }}
                              >
                                Hủy
                              </Button>
                            </Form.Item>
                          </Form>
                        )}
                      </div>
                    )
                  }
                />
              </li>
            )}
          />
        </TabPane>
        <TabPane tab="Đánh giá dịch vụ" key="2">
          <List
            className="appointment-list"
            header={`${getCompletedAppointmentsWithoutReview().length} lịch hẹn chưa đánh giá`}
            itemLayout="horizontal"
            dataSource={getCompletedAppointmentsWithoutReview()}
            renderItem={appointment => (
              <List.Item
                actions={[
                  <Button type="primary" onClick={() => showReviewModal(appointment.id)}>
                    Đánh giá
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={`${getServiceName(appointment.serviceId)} với ${getEmployeeName(appointment.employeeId)}`}
                  description={`Ngày: ${appointment.date} (${appointment.startTime} - ${appointment.endTime})`}
                />
              </List.Item>
            )}
          />
        </TabPane>
      </Tabs>

      <Modal
        title="Đánh giá dịch vụ"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <ReviewForm
          appointmentId={selectedAppointment}
          onSubmit={handleReviewSubmit}
        />
      </Modal>
    </Card>
  );
};

export default ReviewManagement;
