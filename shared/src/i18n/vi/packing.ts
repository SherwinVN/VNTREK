import type { TranslationStrings } from '../types';

const packing: TranslationStrings = {
  'packing.title': 'Danh sách Đóng gói',
  'packing.empty': 'Danh sách đóng gói trống',
  'packing.import': 'Nhập',
  'packing.importTitle': 'Nhập Danh sách Đóng gói',
  'packing.importHint': 'Mỗi mục một dòng. Định dạng: Danh mục, Tên, Cân nặng tính bằng g (tùy chọn), Túi (tùy chọn), đã kiểm/chưa kiểm (tùy chọn)',
  'packing.importPlaceholder': 'Vệ sinh, Bàn chải đánh răng\nQuần áo, Áo phông, 200\nGiấy tờ, Hộ chiếu, , Xách tay\nĐiện tử, Sạc, 50, Vali, đã kiểm',
  'packing.importCsv': 'Tải CSV/TXT',
  'packing.importAction': 'Nhập {count}',
  'packing.importSuccess': 'Đã nhập {count} mục',
  'packing.importError': 'Nhập thất bại',
  'packing.importEmpty': 'Không có mục nào để nhập',
  'packing.progress': 'Đã đóng gói {packed}/{total} ({percent}%)',
  'packing.clearChecked': 'Xóa {count} đã kiểm',
  'packing.clearCheckedShort': 'Xóa {count}',
  'packing.suggestions': 'Gợi ý',
  'packing.suggestionsTitle': 'Thêm Gợi ý',
  'packing.allSuggested': 'Đã thêm tất cả gợi ý',
  'packing.allPacked': 'Đã đóng gói hết!',
  'packing.addPlaceholder': 'Thêm mục mới...',
  'packing.categoryPlaceholder': 'Danh mục...',
  'packing.filterAll': 'Tất cả',
  'packing.filterOpen': 'Đang mở',
  'packing.filterDone': 'Đã xong',
  'packing.emptyTitle': 'Danh sách đóng gói trống',
  'packing.emptyHint': 'Thêm mục hoặc sử dụng gợi ý',
  'packing.emptyFiltered': 'Không có mục nào khớp bộ lọc này',
  'packing.menuRename': 'Đổi tên',
  'packing.menuCheckAll': 'Kiểm tất cả',
  'packing.menuUncheckAll': 'Bỏ kiểm tất cả',
  'packing.menuDeleteCat': 'Xóa Danh mục',
  'packing.noMembers': 'Không có thành viên chuyến đi',
  'packing.addItem': 'Thêm mục',
  'packing.addItemPlaceholder': 'Tên mục...',
  'packing.addCategory': 'Thêm danh mục',
  'packing.newCategoryPlaceholder': 'Tên danh mục (vd. Quần áo)',
  'packing.applyTemplate': 'Áp dụng mẫu',
  'packing.template': 'Mẫu',
  'packing.templateApplied': 'Đã thêm {count} mục từ mẫu',
  'packing.templateError': 'Không thể áp dụng mẫu',
  'packing.saveAsTemplate': 'Lưu làm mẫu',
  'packing.templateName': 'Tên mẫu',
  'packing.templateSaved': 'Đã lưu danh sách đóng gói làm mẫu',
  'packing.bags': 'Túi',
  'packing.noBag': 'Chưa gán',
  'packing.totalWeight': 'Tổng trọng lượng',
  'packing.bagName': 'Tên túi...',
  'packing.addBag': 'Thêm túi',
  'packing.changeCategory': 'Đổi Danh mục',
  'packing.confirm.clearChecked': 'Bạn có chắc muốn xóa {count} mục đã kiểm?',
  'packing.confirm.deleteCat': 'Bạn có chắc muốn xóa danh mục \"{name}\" với {count} mục?',
  'packing.defaultCategory': 'Khác',
  'packing.toast.saveError': 'Không thể lưu',
  'packing.toast.deleteError': 'Không thể xóa',
  'packing.toast.renameError': 'Không thể đổi tên',
  'packing.toast.addError': 'Không thể thêm',
  'packing.suggestions.items': [
    {
      name: 'Hộ chiếu',
      category: 'Giấy tờ',
    },
    {
      name: 'CMND/CCCD',
      category: 'Giấy tờ',
    },
    {
      name: 'Bảo hiểm du lịch',
      category: 'Giấy tờ',
    },
    {
      name: 'Vé máy bay',
      category: 'Giấy tờ',
    },
    {
      name: 'Thẻ tín dụng',
      category: 'Tài chính',
    },
    {
      name: 'Tiền mặt',
      category: 'Tài chính',
    },
    {
      name: 'Visa',
      category: 'Giấy tờ',
    },
    {
      name: 'Áo phông',
      category: 'Quần áo',
    },
    {
      name: 'Quần dài',
      category: 'Quần áo',
    },
    {
      name: 'Đồ lót',
      category: 'Quần áo',
    },
    {
      name: 'Tất',
      category: 'Quần áo',
    },
    {
      name: 'Áo khoác',
      category: 'Quần áo',
    },
    {
      name: 'Đồ ngủ',
      category: 'Quần áo',
    },
    {
      name: 'Đồ bơi',
      category: 'Quần áo',
    },
    {
      name: 'Áo mưa',
      category: 'Quần áo',
    },
    {
      name: 'Giày thoải mái',
      category: 'Quần áo',
    },
    {
      name: 'Bàn chải đánh răng',
      category: 'Đồ vệ sinh',
    },
    {
      name: 'Kem đánh răng',
      category: 'Đồ vệ sinh',
    },
    {
      name: 'Dầu gội',
      category: 'Đồ vệ sinh',
    },
    {
      name: 'Lăn khử mùi',
      category: 'Đồ vệ sinh',
    },
    {
      name: 'Kem chống nắng',
      category: 'Đồ vệ sinh',
    },
    {
      name: 'Dao cạo',
      category: 'Đồ vệ sinh',
    },
    {
      name: 'Sạc',
      category: 'Điện tử',
    },
    {
      name: 'Sạc dự phòng',
      category: 'Điện tử',
    },
    {
      name: 'Tai nghe',
      category: 'Điện tử',
    },
    {
      name: 'Adapter du lịch',
      category: 'Điện tử',
    },
    {
      name: 'Máy ảnh',
      category: 'Điện tử',
    },
    {
      name: 'Thuốc giảm đau',
      category: 'Sức khỏe',
    },
    {
      name: 'Băng cá nhân',
      category: 'Sức khỏe',
    },
    {
      name: 'Cồn sát trùng',
      category: 'Sức khỏe',
    },
  ],
};
export default packing;
