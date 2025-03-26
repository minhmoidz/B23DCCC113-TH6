// Hàm định dạng tiền tệ đơn giản
export const formatCurrency = (amount: number, currency = 'VND'): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: currency }).format(amount);
};
