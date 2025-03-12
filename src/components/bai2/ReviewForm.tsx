// ReviewForm.tsx - Form đánh giá dịch vụ và nhân viên
import React, { useState, useEffect } from 'react';
import { Form, Rate, Input, Button, Card, message } from 'antd';
import { getEmployees, getServices, getReviews, addReview, updateReview } from '../../services/bai2/localStorageService';
import { Employee, Service, Review } from '../../interfaces/types';

const { TextArea } = Input;

interface ReviewFormProps {
  appointmentId: string;
  customerId: string;
  employeeId: string;
  serviceId: string;
  onSubmit?: () => void;
  reviewId?: string;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  appointmentId,
  customerId,
  employeeId,
  serviceId,
  onSubmit,
  reviewId
}) => {
  const [form] = Form.useForm();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [existingReview, setExistingReview] = useState<Review | null>(null);

  useEffect(() => {
    // Load employee and service data
    const employees = getEmployees();
    const services = getServices();

    setEmployee(employees.find(e => e.id === employeeId) || null);
    setService(services.find(s => s.id === serviceId) || null);

    // Check if review already exists for this appointment
    const reviews = getReviews();
    const existingReview = reviews.find(r => r.appointmentId === appointmentId);

    if (existingReview) {
      setExistingReview(existingReview);
      form.setFieldsValue({
        rating: existingReview.rating,
        comment: existingReview.comment
      });
    }
  }, [appointmentId]);

  const handleSubmit = (values: any) => {
    if (existingReview) {
      // Update existing review
      const updatedReview: Review = {
        ...existingReview,
        rating: values.rating,
        comment: values.comment
      };

      updateReview(updatedReview);
      message.success('Cập nhật đánh giá thành công');
    } else {
      // Add new review
      const newReview = {
        appointmentId,
        customerId,
        employeeId,
        serviceId,
        rating: values.rating,
        comment: values.comment
      };

      addReview(newReview);
      message.success('Gửi đánh giá thành công');
    }

    if (onSubmit) {
      onSubmit();
    }
  };

  return (
    <Card>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 'bold' }}>Dịch vụ: {service?.name}</div>
        <div style={{ fontWeight: 'bold' }}>Nhân viên: {employee?.name}</div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="rating"
          label="Đánh giá"
          rules={[{ required: true, message: 'Vui lòng chọn số sao' }]}
        >
          <Rate allowHalf />
        </Form.Item>

        <Form.Item
          name="comment"
          label="Nhận xét"
          rules={[{ required: true, message: 'Vui lòng nhập nhận xét' }]}
        >
          <TextArea rows={4} placeholder="Nhập nhận xét của bạn về dịch vụ và nhân viên" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            {existingReview ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ReviewForm;
