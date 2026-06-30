import type { NotificationLocale } from '../externalNotifications/types';

const vi: NotificationLocale = {
  email: {
    footer: 'Bạn nhận được email này vì đã bật thông báo trong TREK.',
    manage: 'Quản lý tùy chọn trong Cài đặt',
    madeWith: 'Được tạo bằng',
    openTrek: 'Mở TREK',
  },
  events: {
    trip_invite: (p) => ({
      title: `Lời mời chuyến đi: "${p.trip}"`,
      body: `${p.actor} đã mời ${p.invitee || 'một thành viên'} tham gia chuyến đi "${p.trip}".`,
    }),
    booking_change: (p) => ({
      title: `Đặt chỗ mới: ${p.booking}`,
      body: `${p.actor} đã thêm ${p.type} mới "${p.booking}" vào "${p.trip}".`,
    }),
    trip_reminder: (p) => ({
      title: `Nhắc nhở chuyến đi: ${p.trip}`,
      body: `Chuyến đi "${p.trip}" của bạn sắp diễn ra!`,
    }),
    todo_due: (p) => ({
      title: `Việc cần làm đến hạn: ${p.todo}`,
      body: `"${p.todo}" trong "${p.trip}" đến hạn vào ${p.due}.`,
    }),
    vacay_invite: (p) => ({
      title: 'Lời mời Kết hợp Kỳ nghỉ',
      body: `${p.actor} đã mời bạn kết hợp kế hoạch kỳ nghỉ. Mở TREK để chấp nhận hoặc từ chối.`,
    }),
    photos_shared: (p) => ({
      title: `${p.count} ảnh đã được chia sẻ`,
      body: `${p.actor} đã chia sẻ ${p.count} ảnh trong "${p.trip}".`,
    }),
    collab_message: (p) => ({
      title: `Tin nhắn mới trong "${p.trip}"`,
      body: `${p.actor}: ${p.preview}`,
    }),
    packing_tagged: (p) => ({
      title: `Đóng gói: ${p.category}`,
      body: `${p.actor} đã gán bạn vào danh mục đóng gói "${p.category}" trong "${p.trip}".`,
    }),
    version_available: (p) => ({
      title: 'Phiên bản TREK mới có sẵn',
      body: `TREK ${p.version} hiện đã có sẵn. Truy cập bảng quản trị để cập nhật.`,
    }),
    synology_session_cleared: () => ({
      title: 'Đã xóa phiên Synology',
      body: 'Tài khoản Synology hoặc URL của bạn đã thay đổi. Bạn đã bị đăng xuất khỏi Synology Photos.',
    }),
  },
  passwordReset: {
    subject: 'Đặt lại mật khẩu của bạn',
    greeting: 'Xin chào',
    body: 'Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản TREK của bạn. Nhấp vào nút bên dưới để đặt mật khẩu mới.',
    ctaIntro: 'Đặt lại mật khẩu',
    expiry: 'Liên kết này hết hạn sau 60 phút.',
    ignore: 'Nếu bạn không yêu cầu điều này, bạn có thể yên tâm bỏ qua email này — mật khẩu của bạn sẽ không thay đổi.',
  },
};

export default vi;
