// src/constants/options.ts
export const POSITIONS = ['Giám đốc', 'Trưởng phòng', 'Phó phòng', 'Nhân viên', 'Thực tập sinh'];
export const DEPARTMENTS = ['Kinh doanh', 'Kỹ thuật', 'Nhân sự', 'Marketing', 'Kế toán'];
export const STATUS_OPTIONS = ['Đã ký hợp đồng', 'Thử việc'];

// Regex để kiểm tra ký tự đặc biệt (cho phép tiếng Việt có dấu)
// Bạn có thể điều chỉnh regex này nếu cần chặt chẽ hơn hoặc lỏng hơn
export const NO_SPECIAL_CHARS_REGEX = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s]+$/;
