export type OrderStatus = 'pending' | 'shipping' | 'completed' | 'cancelled';

export interface Customer {
  id: string;
  name: string;
  // Thêm các thông tin khác nếu cần
}

export interface Product {
  id: string;
  name: string;
  price: number;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number; // Giá tại thời điểm đặt hàng
}

export interface Order {
  id: string;
  customerId: string;
  orderDate: string; // Lưu dạng ISO string (YYYY-MM-DDTHH:mm:ss.sssZ) để dễ sort/lưu trữ
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
}

// Type cho form
export interface OrderFormValues {
    customerId: string;
    items: Array<{ productId?: string; quantity?: number }>; // Dùng cho Form.List của Antd
    status?: OrderStatus; // Chỉ hiển thị/sửa khi edit
}
