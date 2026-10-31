// /* =====================================================================
//    data.js - CẤU TRÚC CƠ SỞ DỮ LIỆU + DỮ LIỆU MẪU (CHỈ DỮ LIỆU, KHÔNG CÓ LOGIC)

//    - DB_ENUMS : các giá trị trạng thái hợp lệ.
//    - DB_SCHEMA: mô tả từng bảng. Thứ tự khai báo cột = thứ tự giá trị trong DB_SEED.
//    - DB_SEED  : dữ liệu mẫu, mỗi dòng là một mảng theo đúng thứ tự cột của DB_SCHEMA.

//    Dùng ở 2 nơi (một nguồn dữ liệu duy nhất):
//      1) frontend/common.js (chế độ Local) -> đổi mảng thành đối tượng, lưu localStorage.
//      2) backend/prisma/seed.ts            -> đọc file này để nạp PostgreSQL.

//    Nạp bằng <script src="data.js"></script> thường (KHÔNG dùng type="module",
//    KHÔNG dùng fetch) để mở bằng file:// vẫn chạy.
//    Mật khẩu để chữ thường chỉ vì là dữ liệu mẫu; backend sẽ băm (bcrypt) khi seed.
//    Số tiền: VND (số nguyên). Ngày: 'YYYY-MM-DD'; thời điểm: 'YYYY-MM-DD HH:MM'.
//    ===================================================================== */
// (function (global) {
//   'use strict';

//   var DB_ENUMS = {
//     receipt_status: ['draft', 'completed'],
//     order_status: ['order_created', 'payment_success', 'order_confirmed', 'shipping', 'delivered', 'cancelled'],
//     payment_method: ['cod', 'online'],
//     movement_type: ['import', 'export', 'cancel_return']
//   };

//   var DB_SCHEMA = {
//     admins: {
//       columns: { id: 'int pk', username: 'string unique', password: 'string', full_name: 'string' }
//     },
//     customers: {
//       columns: {
//         id: 'int pk', username: 'string unique', password: 'string', full_name: 'string',
//         email: 'string unique', phone: 'string', address_detail: 'string?', ward: 'string?',
//         district: 'string?', city: 'string?', is_locked: 'boolean default false', created_at: 'datetime'
//       }
//     },
//     categories: {
//       columns: {
//         id: 'int pk', name: 'string unique', description: 'text?',
//         profit_percent: 'number default 20', is_hidden: 'boolean default false'
//       }
//     },
//     products: {
//       columns: {
//         id: 'int pk', category_id: 'int fk categories.id', code: 'string unique', name: 'string',
//         image: 'string? (link ảnh; sau này thay bằng ảnh lưu trong DB)', description: 'text?', brand: 'string?', scale: 'string?', material: 'string?',
//         size: 'string?', profit_percent: 'number? (null = theo loại)', cost_price: 'int default 0',
//         stock_qty: 'int default 0', low_stock_threshold: 'int default 5', is_hidden: 'boolean default false',
//         sale_percent: 'int default 0 (% giảm giá hiển thị, 0 = không sale)'
//       }
//     },
//     import_receipts: {
//       columns: {
//         id: 'int pk', import_date: 'date', status: 'enum receipt_status default draft',
//         note: 'string?', created_at: 'datetime', completed_at: 'datetime?'
//       }
//     },
//     import_receipt_items: {
//       columns: {
//         id: 'int pk', receipt_id: 'int fk import_receipts.id', product_id: 'int fk products.id',
//         quantity: 'int > 0', import_price: 'int >= 0'
//       }
//     },
//     stock_movements: {   // quantity CÓ DẤU: dương = vào kho, âm = ra kho
//       columns: {
//         id: 'int pk', product_id: 'int fk products.id', movement_date: 'date',
//         movement_type: 'enum movement_type', quantity: 'int signed', ref_type: 'string?', ref_id: 'int?'
//       }
//     },
//     orders: {
//       columns: {
//         id: 'int pk', customer_id: 'int fk customers.id', order_date: 'datetime',
//         status: 'enum order_status default order_created', receiver_name: 'string', receiver_phone: 'string',
//         ship_address_detail: 'string', ship_ward: 'string', ship_district: 'string', ship_city: 'string',
//         payment_method: 'enum payment_method default cod', total_amount: 'int', updated_at: 'datetime?'
//       }
//     },
//     notifications: {
//       columns: {
//         id: 'int pk', customer_id: 'int fk customers.id', type: 'string',
//         order_id: 'int fk orders.id', message: 'text', is_read: 'boolean default false',
//         created_at: 'datetime'
//       }
//     },
//     order_items: {
//       columns: {
//         id: 'int pk', order_id: 'int fk orders.id', product_id: 'int fk products.id',
//         quantity: 'int > 0', unit_price: 'int (giá bán tại thời điểm đặt)'
//       }
//     }
//   };

//   var DB_SEED = {
//     // [id, username, password, full_name]
//     admins: [
//       [1, 'admin', 'admin123', 'Quản trị viên']
//     ],

//     // [id, username, password, full_name, email, phone, address_detail, ward, district, city, is_locked, created_at]
//     customers: [
//       [1, 'nguyenvana', '123456', 'Nguyễn Văn An', 'an.nguyen@example.com', '0901234567', '12 Nguyễn Huệ', 'Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', false, '2026-07-20 09:00'],
//       [2, 'tranthib', '123456', 'Trần Thị Bích', 'bich.tran@example.com', '0912345678', '45 An Dương Vương', 'Phường 3', 'Quận 5', 'TP. Hồ Chí Minh', false, '2026-07-25 15:30'],
//       [3, 'lehoangc', '123456', 'Lê Hoàng Cường', 'cuong.le@example.com', '0923456789', '88 Lê Văn Việt', 'Hiệp Phú', 'TP. Thủ Đức', 'TP. Hồ Chí Minh', false, '2026-08-02 20:10'],
//       [4, 'phamthid', '123456', 'Phạm Thị Dung', 'dung.pham@example.com', '0934567890', '10 Trần Phú', 'Phường 4', 'Quận 5', 'TP. Hồ Chí Minh', true, '2026-08-10 08:45']
//     ],

//     // [id, name, description, profit_percent, is_hidden]
//     categories: [
//       [1, 'Gundam', 'Mô hình lắp ráp Gundam các cấp độ HG, RG, MG', 25, false],
//       [2, 'Figure Anime', 'Figure, Figma, Nendoroid nhân vật anime', 30, false],
//       [3, 'Mô hình xe', 'Xe mô hình đúc hợp kim (diecast)', 20, false],
//       [4, 'Mô hình quân sự', 'Tàu, máy bay, xe tăng lắp ráp', 22, false],
//       [5, 'Phụ kiện & dụng cụ', 'Kìm cắt, sơn, keo, hộp và đế trưng bày', 35, false],
//       [6, 'Hàng ngừng kinh doanh', 'Loại đã ẩn (demo chức năng ẩn loại)', 20, true]
//     ],

//     // [id, category_id, code, name, image, description, brand, scale, material, size,
//     //  profit_percent, cost_price, stock_qty, low_stock_threshold, is_hidden, sale_percent]
//     // cost_price và stock_qty khớp với phiếu nhập hoàn thành + đơn đã xử lý/đã giao bên dưới
//     products: [
//       [1, 1, 'GD001', 'HG RX-78-2 Gundam (Revive)', 'https://placehold.co/600x600/e8590c/ffffff?text=GD001', 'Mô hình lắp ráp Gundam đầu tiên, bản Revive với khớp và màu sắc được cải tiến.', 'Bandai', '1/144', 'Nhựa PS', '13 cm', null, 180000, 19, 5, false, 0],
//       [2, 1, 'GD002', 'HG Gundam Barbatos', 'https://placehold.co/600x600/e8590c/ffffff?text=GD002', 'Gundam Barbatos phong cách chiến đấu hoang dã, nhựa PS không cần keo.', 'Bandai', '1/144', 'Nhựa PS', '13 cm', null, 200000, 15, 5, false, 15],
//       [3, 1, 'GD003', 'MG Strike Freedom Gundam', 'https://placehold.co/600x600/e8590c/ffffff?text=GD003', 'Strike Freedom Gundam cấp độ MG, bộ giáp chi tiết, cánh Dragoon rời.', 'Bandai', '1/100', 'Nhựa PS', '18 cm', 35, 1100000, 8, 5, false, 0],
//       [4, 1, 'GD004', 'RG Nu Gundam', 'https://placehold.co/600x600/e8590c/ffffff?text=GD004', 'RG Nu Gundam khung xương Advanced MS Joint, kèm Fin Funnel.', 'Bandai', '1/144', 'Nhựa PS', '13 cm', null, 520000, 9, 5, false, 0],
//       [5, 1, 'GD005', 'HG Wing Gundam Zero EW', 'https://placehold.co/600x600/e8590c/ffffff?text=GD005', 'Wing Gundam Zero bản Endless Waltz, cánh thiên thần có thể xếp gọn.', 'Bandai', '1/144', 'Nhựa PS', '13 cm', null, 210000, 12, 5, false, 10],
//       [6, 1, 'GD006', 'MG Sazabi Ver.Ka', 'https://placehold.co/600x600/e8590c/ffffff?text=GD006', 'Sazabi bản Ver.Ka màu đỏ đặc trưng, chi tiết cao cấp.', 'Bandai', '1/100', 'Nhựa PS', '20 cm', null, 1500000, 2, 5, false, 0],
//       [7, 2, 'FG001', 'Figure Luffy Gear 5', 'https://placehold.co/600x600/e8590c/ffffff?text=FG001', 'Luffy ở trạng thái Gear 5, tư thế chiến đấu sống động.', 'Banpresto', '1/8', 'PVC', '20 cm', null, 650000, 9, 5, false, 0],
//       [8, 2, 'FG002', 'Figma Hatsune Miku', 'https://placehold.co/600x600/e8590c/ffffff?text=FG002', 'Figma Hatsune Miku có khớp linh hoạt, kèm nhiều phụ kiện và biểu cảm.', 'Max Factory', '1/12', 'PVC', '14 cm', 40, 900000, 8, 5, false, 0],
//       [9, 2, 'FG003', 'Nendoroid Rem', 'https://placehold.co/600x600/e8590c/ffffff?text=FG003', 'Nendoroid Rem phong cách chibi dễ thương, kèm mặt thay thế.', 'Good Smile Company', 'Chibi', 'PVC/ABS', '10 cm', null, 1100000, 2, 5, false, 0],
//       [10, 2, 'FG004', 'Figure Goku Ultra Instinct', 'https://placehold.co/600x600/e8590c/ffffff?text=FG004', 'Goku Ultra Instinct tạo dáng chiến đấu, hiệu ứng khí bao quanh.', 'Banpresto', '1/8', 'PVC', '22 cm', null, 480000, 12, 5, false, 20],
//       [11, 2, 'FG005', 'Figure Zoro Wano', 'https://placehold.co/600x600/e8590c/ffffff?text=FG005', 'Zoro bản Wano với ba thanh kiếm, tạo hình mạnh mẽ.', 'Banpresto', '1/8', 'PVC', '21 cm', null, 520000, 10, 5, false, 10],
//       [12, 2, 'FG006', 'Figure Naruto Sage Mode', 'https://placehold.co/600x600/e8590c/ffffff?text=FG006', 'Naruto Sage Mode với đôi mắt đặc trưng và tư thế kết ấn.', 'Banpresto', '1/8', 'PVC', '20 cm', null, 500000, 9, 5, false, 0],
//       [13, 3, 'XE001', 'Ferrari 488 GTB', 'https://placehold.co/600x600/e8590c/ffffff?text=XE001', 'Ferrari 488 GTB đúc hợp kim, cửa và nắp capo mở được.', 'Bburago', '1/24', 'Hợp kim', '19 cm', null, 350000, 9, 5, false, 0],
//       [14, 3, 'XE002', 'Lamborghini Aventador', 'https://placehold.co/600x600/e8590c/ffffff?text=XE002', 'Lamborghini Aventador màu cam, chi tiết nội thất đầy đủ.', 'Maisto', '1/24', 'Hợp kim', '20 cm', null, 340000, 10, 5, false, 0],
//       [15, 3, 'XE003', 'Porsche 911 GT3 RS', 'https://placehold.co/600x600/e8590c/ffffff?text=XE003', 'Porsche 911 GT3 RS tỉ lệ lớn, sơn bóng, cửa và cốp mở được.', 'Minichamps', '1/18', 'Hợp kim', '25 cm', 25, 1200000, 4, 5, false, 0],
//       [16, 3, 'XE004', 'Toyota Supra MK4', 'https://placehold.co/600x600/e8590c/ffffff?text=XE004', 'Toyota Supra MK4 huyền thoại, mô hình nhỏ gọn dễ trưng bày.', 'Jada', '1/32', 'Hợp kim', '14 cm', null, 280000, 12, 5, false, 15],
//       [17, 3, 'XE005', 'Nissan GT-R R35', 'https://placehold.co/600x600/e8590c/ffffff?text=XE005', 'Nissan GT-R R35 ngoại hình hầm hố, bánh xe quay được.', 'Maisto', '1/24', 'Hợp kim', '19 cm', null, 360000, 8, 5, false, 0],
//       [18, 3, 'XE006', 'Ford Mustang GT', 'https://placehold.co/600x600/e8590c/ffffff?text=XE006', 'Ford Mustang GT phong cách muscle car Mỹ, sơn bóng.', 'Bburago', '1/24', 'Hợp kim', '20 cm', null, 330000, 9, 5, false, 0],
//       [19, 4, 'KT001', 'Thiết giáp hạm Yamato', 'https://placehold.co/600x600/e8590c/ffffff?text=KT001', 'Thiết giáp hạm Yamato lắp ráp tỉ lệ 1/700, chi tiết boong tàu.', 'Tamiya', '1/700', 'Nhựa PS', '38 cm', null, 850000, 6, 5, false, 0],
//       [20, 4, 'KT002', 'Máy bay Mitsubishi Zero A6M', 'https://placehold.co/600x600/e8590c/ffffff?text=KT002', 'Máy bay chiến đấu Zero A6M của Nhật, kèm decal đầy đủ.', 'Tamiya', '1/48', 'Nhựa PS', '24 cm', null, 420000, 10, 5, false, 10],
//       [21, 4, 'KT003', 'Xe tăng Tiger I', 'https://placehold.co/600x600/e8590c/ffffff?text=KT003', 'Xe tăng Tiger I của Đức, xích lắp ráp chi tiết.', 'Tamiya', '1/35', 'Nhựa PS', '25 cm', null, 450000, 8, 5, false, 0],
//       [22, 4, 'KT004', 'Tàu Titanic', 'https://placehold.co/600x600/e8590c/ffffff?text=KT004', 'Tàu Titanic lắp ráp tỉ lệ 1/700, dành cho người sưu tầm.', 'Revell', '1/700', 'Nhựa PS', '38 cm', null, 600000, 7, 5, false, 0],
//       [23, 4, 'KT005', 'Máy bay F-16C', 'https://placehold.co/600x600/e8590c/ffffff?text=KT005', 'Máy bay tiêm kích F-16C, kèm giá đỡ và decal.', 'Hasegawa', '1/72', 'Nhựa PS', '21 cm', null, 300000, 9, 5, false, 0],
//       [24, 4, 'KT006', 'Xe tăng M1A2 Abrams', 'https://placehold.co/600x600/e8590c/ffffff?text=KT006', 'Xe tăng chủ lực M1A2 Abrams, tháp pháo xoay được.', 'Dragon', '1/35', 'Nhựa PS', '28 cm', null, 900000, 5, 5, false, 0],
//       [25, 5, 'PK001', 'Kìm cắt nhựa chuyên dụng', 'https://placehold.co/600x600/e8590c/ffffff?text=PK001', 'Kìm cắt nhựa lưỡi mỏng, cắt sát và ít để lại vết.', 'GodHand', null, 'Thép', '14 cm', null, 120000, 29, 5, false, 0],
//       [26, 5, 'PK002', 'Bộ bút sơn Gundam Marker', 'https://placehold.co/600x600/e8590c/ffffff?text=PK002', 'Bộ bút sơn marker để tô chi tiết và đi line cho mô hình.', 'GSI Creos', null, 'Sơn', '12 bút', null, 150000, 25, 5, false, 25],
//       [27, 5, 'PK003', 'Hộp trưng bày acrylic', 'https://placehold.co/600x600/e8590c/ffffff?text=PK003', 'Hộp acrylic trong suốt chống bụi cho mô hình.', 'OEM', null, 'Acrylic', '20x20x30 cm', null, 90000, 15, 5, false, 0],
//       [28, 5, 'PK004', 'Đế trưng bày Action Base', 'https://placehold.co/600x600/e8590c/ffffff?text=PK004', 'Đế trưng bày Action Base giúp tạo dáng mô hình ở nhiều góc.', 'Bandai', null, 'Nhựa', '15 cm', null, 60000, 20, 5, false, 0],
//       [29, 5, 'PK005', 'Keo dán nhựa Tamiya', 'https://placehold.co/600x600/e8590c/ffffff?text=PK005', 'Keo dán nhựa chuyên dụng cho mô hình lắp ráp.', 'Tamiya', null, 'Dung môi', '40 ml', null, 25000, 40, 5, false, 30],
//       [30, 5, 'PK006', 'Bộ dũa và giấy nhám', 'https://placehold.co/600x600/e8590c/ffffff?text=PK006', 'Bộ dũa và giấy nhám nhiều độ mịn để xử lý bề mặt.', 'OEM', null, 'Kim loại / giấy', 'Bộ 12 món', null, 45000, 30, 5, false, 0]
//     ],

//     // [id, import_date, status, note, created_at, completed_at]
//     import_receipts: [
//       [1, '2026-08-01', 'completed', 'Nhập Gundam đợt 1', '2026-08-01 08:00', '2026-08-01 16:00'],
//       [2, '2026-08-10', 'completed', 'Nhập figure và xe mô hình', '2026-08-10 08:00', '2026-08-10 16:00'],
//       [3, '2026-09-01', 'completed', 'Nhập mô hình quân sự và phụ kiện', '2026-09-01 08:00', '2026-09-01 16:00'],
//       [4, '2026-09-25', 'draft', 'Nhập bổ sung hàng sắp hết (phiếu nháp)', '2026-09-25 08:00', null]
//     ],

//     // [id, receipt_id, product_id, quantity, import_price]
//     import_receipt_items: [
//       [1, 1, 1, 20, 180000], [2, 1, 2, 15, 200000], [3, 1, 3, 8, 1100000],
//       [4, 1, 4, 10, 520000], [5, 1, 5, 12, 210000], [6, 1, 6, 4, 1500000],
//       [7, 2, 7, 10, 650000], [8, 2, 8, 8, 900000], [9, 2, 9, 3, 1100000],
//       [10, 2, 10, 12, 480000], [11, 2, 11, 10, 520000], [12, 2, 12, 9, 500000],
//       [13, 2, 13, 10, 350000], [14, 2, 14, 10, 340000], [15, 2, 15, 5, 1200000],
//       [16, 2, 16, 12, 280000], [17, 2, 17, 8, 360000], [18, 2, 18, 9, 330000],
//       [19, 3, 19, 6, 850000], [20, 3, 20, 10, 420000], [21, 3, 21, 8, 450000],
//       [22, 3, 22, 7, 600000], [23, 3, 23, 9, 300000], [24, 3, 24, 5, 900000],
//       [25, 3, 25, 30, 120000], [26, 3, 26, 25, 150000], [27, 3, 27, 15, 90000],
//       [28, 3, 28, 20, 60000], [29, 3, 29, 40, 25000], [30, 3, 30, 30, 45000],
//       [31, 4, 6, 10, 1450000], [32, 4, 9, 8, 1050000], [33, 4, 15, 6, 1180000]
//     ],

//     // [id, product_id, movement_date, movement_type, quantity, ref_type, ref_id]
//     // Chỉ gồm phiếu nhập đã hoàn thành (1-3) và đơn đã xử lý / đã giao (1, 2, 3, 6)
//     stock_movements: [
//       [1, 1, '2026-08-01', 'import', 20, 'import_receipt', 1], [2, 2, '2026-08-01', 'import', 15, 'import_receipt', 1],
//       [3, 3, '2026-08-01', 'import', 8, 'import_receipt', 1], [4, 4, '2026-08-01', 'import', 10, 'import_receipt', 1],
//       [5, 5, '2026-08-01', 'import', 12, 'import_receipt', 1], [6, 6, '2026-08-01', 'import', 4, 'import_receipt', 1],
//       [7, 7, '2026-08-10', 'import', 10, 'import_receipt', 2], [8, 8, '2026-08-10', 'import', 8, 'import_receipt', 2],
//       [9, 9, '2026-08-10', 'import', 3, 'import_receipt', 2], [10, 10, '2026-08-10', 'import', 12, 'import_receipt', 2],
//       [11, 11, '2026-08-10', 'import', 10, 'import_receipt', 2], [12, 12, '2026-08-10', 'import', 9, 'import_receipt', 2],
//       [13, 13, '2026-08-10', 'import', 10, 'import_receipt', 2], [14, 14, '2026-08-10', 'import', 10, 'import_receipt', 2],
//       [15, 15, '2026-08-10', 'import', 5, 'import_receipt', 2], [16, 16, '2026-08-10', 'import', 12, 'import_receipt', 2],
//       [17, 17, '2026-08-10', 'import', 8, 'import_receipt', 2], [18, 18, '2026-08-10', 'import', 9, 'import_receipt', 2],
//       [19, 1, '2026-08-15', 'export', -1, 'order', 1], [20, 4, '2026-08-15', 'export', -1, 'order', 1],
//       [21, 7, '2026-08-20', 'export', -1, 'order', 2],
//       [22, 19, '2026-09-01', 'import', 6, 'import_receipt', 3], [23, 20, '2026-09-01', 'import', 10, 'import_receipt', 3],
//       [24, 21, '2026-09-01', 'import', 8, 'import_receipt', 3], [25, 22, '2026-09-01', 'import', 7, 'import_receipt', 3],
//       [26, 23, '2026-09-01', 'import', 9, 'import_receipt', 3], [27, 24, '2026-09-01', 'import', 5, 'import_receipt', 3],
//       [28, 25, '2026-09-01', 'import', 30, 'import_receipt', 3], [29, 26, '2026-09-01', 'import', 25, 'import_receipt', 3],
//       [30, 27, '2026-09-01', 'import', 15, 'import_receipt', 3], [31, 28, '2026-09-01', 'import', 20, 'import_receipt', 3],
//       [32, 29, '2026-09-01', 'import', 40, 'import_receipt', 3], [33, 30, '2026-09-01', 'import', 30, 'import_receipt', 3],
//       [34, 13, '2026-09-05', 'export', -1, 'order', 3], [35, 25, '2026-09-05', 'export', -1, 'order', 3],
//       [36, 6, '2026-09-22', 'export', -2, 'order', 6], [37, 9, '2026-09-22', 'export', -1, 'order', 6],
//       [38, 15, '2026-09-22', 'export', -1, 'order', 6]
//     ],

//     // [id, customer_id, order_date, status, receiver_name, receiver_phone,
//     //  ship_address_detail, ship_ward, ship_district, ship_city, payment_method, total_amount, updated_at]
//     orders: [
//       [1, 1, '2026-08-15 10:30', 'delivered', 'Nguyễn Văn An', '0901234567', '12 Nguyễn Huệ', 'Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 'cod', 875000, null],
//       [2, 2, '2026-08-20 14:05', 'delivered', 'Trần Thị Bích', '0912345678', '45 An Dương Vương', 'Phường 3', 'Quận 5', 'TP. Hồ Chí Minh', 'online', 845000, null],
//       [3, 1, '2026-09-05 09:15', 'order_confirmed', 'Nguyễn Văn An', '0901234567', '12 Nguyễn Huệ', 'Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 'cod', 582000, null],
//       [4, 3, '2026-09-12 16:40', 'order_created', 'Trần Văn Dũng', '0934567890', '25 Trần Hưng Đạo', 'Phường 7', 'Quận 5', 'TP. Hồ Chí Minh', 'online', 1485000, null],
//       [5, 2, '2026-09-18 11:20', 'cancelled', 'Trần Thị Bích', '0912345678', '45 An Dương Vương', 'Phường 3', 'Quận 5', 'TP. Hồ Chí Minh', 'cod', 1260000, null],
//       [6, 3, '2026-09-22 19:00', 'shipping', 'Lê Hoàng Cường', '0923456789', '88 Lê Văn Việt', 'Hiệp Phú', 'TP. Thủ Đức', 'TP. Hồ Chí Minh', 'online', 6680000, null]
//     ],

//     // [id, order_id, product_id, quantity, unit_price]
//     order_items: [
//       [1, 1, 1, 1, 225000], [2, 1, 4, 1, 650000],
//       [3, 2, 7, 1, 845000],
//       [4, 3, 13, 1, 420000], [5, 3, 25, 1, 162000],
//       [6, 4, 3, 1, 1485000],
//       [7, 5, 8, 1, 1260000],
//       [8, 6, 6, 2, 1875000], [9, 6, 9, 1, 1430000], [10, 6, 15, 1, 1500000]
//     ],

//     // [id, customer_id, type, order_id, message, is_read, created_at]
//     notifications: [
//       [1, 1, 'delivered', 1, 'Đơn hàng #MS0001 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-08-17 10:00'],
//       [2, 1, 'order_confirmed', 3, 'Đơn hàng #MS0003 đã được xác nhận và đang được chuẩn bị.', false, '2026-09-05 10:00'],
//       [3, 3, 'order_created', 4, 'Đơn hàng #MS0004 đã được đặt thành công.', false, '2026-09-12 16:45'],
//       [4, 2, 'delivered', 2, 'Đơn hàng #MS0002 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-08-22 14:00'],
//       [5, 2, 'cancelled', 5, 'Đơn hàng #MS0005 đã được hủy.', false, '2026-09-18 12:00'],
//       [6, 3, 'shipping', 6, 'Đơn hàng #MS0006 đang trên đường giao đến bạn.', false, '2026-09-23 09:00'],
//       [7, 1, 'account_created', null, 'Tài khoản ModelShop của bạn đã được tạo thành công.', false, '2026-07-20 09:00'],
//       [8, 1, 'profile_updated', null, 'Thông tin tài khoản của bạn đã được cập nhật thành công.', false, '2026-09-10 10:00'],
//       [9, 1, 'password_changed', null, 'Mật khẩu tài khoản của bạn đã được đổi thành công.', false, '2026-09-11 10:00'],
//       [10, 2, 'account_created', null, 'Tài khoản ModelShop của bạn đã được tạo thành công.', true, '2026-07-25 15:30'],
//       [11, 3, 'account_created', null, 'Tài khoản ModelShop của bạn đã được tạo thành công.', true, '2026-08-02 20:10']
//     ]
//   };

//   global.DB_ENUMS = DB_ENUMS;
//   global.DB_SCHEMA = DB_SCHEMA;
//   global.DB_SEED = DB_SEED;
// })(window);


/* =====================================================================
   data.js - CẤU TRÚC CƠ SỞ DỮ LIỆU + DỮ LIỆU MẪU (CHỈ DỮ LIỆU, KHÔNG CÓ LOGIC)

   - DB_ENUMS : các giá trị trạng thái hợp lệ.
   - DB_SCHEMA: mô tả từng bảng. Thứ tự khai báo cột = thứ tự giá trị trong DB_SEED.
   - DB_SEED  : dữ liệu mẫu, mỗi dòng là một mảng theo đúng thứ tự cột của DB_SCHEMA.

   Dùng ở 2 nơi (một nguồn dữ liệu duy nhất):
     1) frontend/common.js (chế độ Local) -> đổi mảng thành đối tượng, lưu localStorage.
     2) backend/prisma/seed.ts            -> đọc file này để nạp PostgreSQL.

   Nạp bằng <script src="data.js"></script> thường (KHÔNG dùng type="module",
   KHÔNG dùng fetch) để mở bằng file:// vẫn chạy.
   Mật khẩu để chữ thường chỉ vì là dữ liệu mẫu; backend sẽ băm (bcrypt) khi seed.
   Số tiền: VND (số nguyên). Ngày: 'YYYY-MM-DD'; thời điểm: 'YYYY-MM-DD HH:MM'.
   ===================================================================== */
(function (global) {
  'use strict';

  var DB_ENUMS = {
    receipt_status: ['draft', 'completed'],
    order_status: ['order_created', 'payment_success', 'order_confirmed', 'shipping', 'delivered', 'cancelled'],
    payment_method: ['cod', 'online'],
    movement_type: ['import', 'export', 'cancel_return']
  };

  var DB_SCHEMA = {
    admins: {
      columns: { id: 'int pk', username: 'string unique', password: 'string', full_name: 'string' }
    },
    customers: {
      columns: {
        id: 'int pk', username: 'string unique', password: 'string', full_name: 'string',
        email: 'string unique', phone: 'string', address_detail: 'string?', ward: 'string?',
        district: 'string?', city: 'string?', is_locked: 'boolean default false', created_at: 'datetime'
      }
    },
    categories: {
      columns: {
        id: 'int pk', name: 'string unique', description: 'text?',
        profit_percent: 'number default 20', is_hidden: 'boolean default false'
      }
    },
    products: {
      columns: {
        id: 'int pk', category_id: 'int fk categories.id', code: 'string unique', name: 'string',
        image: 'string? (link ảnh; sau này thay bằng ảnh lưu trong DB)', description: 'text?', brand: 'string?', scale: 'string?', material: 'string?',
        size: 'string?', profit_percent: 'number? (null = theo loại)', cost_price: 'int default 0',
        stock_qty: 'int default 0', low_stock_threshold: 'int default 5', is_hidden: 'boolean default false',
        sale_percent: 'int default 0 (% giảm giá hiển thị, 0 = không sale)'
      }
    },
    import_receipts: {
      columns: {
        id: 'int pk', import_date: 'date', status: 'enum receipt_status default draft',
        note: 'string?', created_at: 'datetime', completed_at: 'datetime?'
      }
    },
    import_receipt_items: {
      columns: {
        id: 'int pk', receipt_id: 'int fk import_receipts.id', product_id: 'int fk products.id',
        quantity: 'int > 0', import_price: 'int >= 0'
      }
    },
    stock_movements: {   // quantity CÓ DẤU: dương = vào kho, âm = ra kho
      columns: {
        id: 'int pk', product_id: 'int fk products.id', movement_date: 'date',
        movement_type: 'enum movement_type', quantity: 'int signed', ref_type: 'string?', ref_id: 'int?'
      }
    },
    orders: {
      columns: {
        id: 'int pk', customer_id: 'int fk customers.id', order_date: 'datetime',
        status: 'enum order_status default order_created', receiver_name: 'string', receiver_phone: 'string',
        ship_address_detail: 'string', ship_ward: 'string', ship_district: 'string', ship_city: 'string',
        payment_method: 'enum payment_method default cod', total_amount: 'int', updated_at: 'datetime?'
      }
    },
    notifications: {
      columns: {
        id: 'int pk', customer_id: 'int fk customers.id', type: 'string',
        order_id: 'int fk orders.id', message: 'text', is_read: 'boolean default false',
        created_at: 'datetime'
      }
    },
    order_items: {
      columns: {
        id: 'int pk', order_id: 'int fk orders.id', product_id: 'int fk products.id',
        quantity: 'int > 0', unit_price: 'int (giá bán tại thời điểm đặt)'
      }
    }
  };

  var DB_SEED = {
    // [id, username, password, full_name]
    admins: [
      [1, 'admin', 'admin123', 'Quản trị viên']
    ],

    // [id, username, password, full_name, email, phone, address_detail, ward, district, city, is_locked, created_at]
    customers: [
      [1, 'nguyenvana', '123456', 'Nguyễn Văn An', 'an.nguyen@example.com', '0901234567', '12 Nguyễn Huệ', 'Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', false, '2026-09-03 09:00'],
      [2, 'tranthib', '123456', 'Trần Thị Bích', 'bich.tran@example.com', '0912345678', '45 An Dương Vương', 'Phường 3', 'Quận 5', 'TP. Hồ Chí Minh', false, '2026-09-06 15:30'],
      [3, 'lehoangc', '123456', 'Lê Hoàng Cường', 'cuong.le@example.com', '0923456789', '88 Lê Văn Việt', 'Hiệp Phú', 'TP. Thủ Đức', 'TP. Hồ Chí Minh', false, '2026-09-09 20:10'],
      [4, 'phamthid', '123456', 'Phạm Thị Dung', 'dung.pham@example.com', '0934567890', '10 Trần Phú', 'Phường 4', 'Quận 5', 'TP. Hồ Chí Minh', true, '2026-09-10 08:45'],
      [5, 'hoangvane', '123456', 'Hoàng Văn Em', 'em.hoang@example.com', '0945678901', '22 Cách Mạng Tháng Tám', 'Phường 5', 'Quận 3', 'TP. Hồ Chí Minh', false, '2026-09-14 10:20'],
      [6, 'vothif', '123456', 'Võ Thị Phương', 'phuong.vo@example.com', '0956789012', '150 Nguyễn Thị Thập', 'Tân Phong', 'Quận 7', 'TP. Hồ Chí Minh', false, '2026-09-18 19:05'],
      [7, 'dangquangg', '123456', 'Đặng Quang Giàu', 'giau.dang@example.com', '0967890123', '37 Phan Văn Trị', 'Phường 12', 'Quận Bình Thạnh', 'TP. Hồ Chí Minh', false, '2026-09-22 13:40'],
      [8, 'buiminhh', '123456', 'Bùi Minh Hải', 'hai.bui@example.com', '0978901234', '64 Quang Trung', 'Phường 10', 'Quận Gò Vấp', 'TP. Hồ Chí Minh', false, '2026-09-27 21:15'],
      [9, 'ngothii', '123456', 'Ngô Thị Yến', 'yen.ngo@example.com', '0989012345', '18 Trần Thái Tông', 'Dịch Vọng', 'Quận Cầu Giấy', 'Hà Nội', false, '2026-10-02 09:50'],
      [10, 'trinhvank', '123456', 'Trịnh Văn Khải', 'khai.trinh@example.com', '0990123456', '95 Bạch Đằng', 'Hải Châu 1', 'Quận Hải Châu', 'Đà Nẵng', false, '2026-10-08 16:25'],
      [11, 'lythil', '123456', 'Lý Thị Lan', 'lan.ly@example.com', '0911223344', '7 Lê Lợi', 'Phường 1', 'Quận Tân Bình', 'TP. Hồ Chí Minh', true, '2026-10-12 11:00'],
      [12, 'dinhconm', '123456', 'Đinh Công Minh', 'minh.dinh@example.com', '0922334455', '210 Nguyễn Văn Cừ', 'An Hòa', 'Quận Ninh Kiều', 'Cần Thơ', false, '2026-10-20 18:30']
    ],

    // [id, name, description, profit_percent, is_hidden]
    // Thứ tự id 1-6 tương ứng: gundam, one-piece, metal-build, bandai, 30mm-30ms, tools-accessories; 7 = hàng ngừng kinh doanh (ẩn)
    categories: [
      [1, 'Mô hình Gundam', 'Mô hình lắp ráp Gundam các dòng SD, HG, RG, MG cùng phụ kiện đi kèm', 25, false],
      [2, 'Mô hình One Piece', 'Mô hình lắp ráp tàu, Chopper Robo và figure nhân vật One Piece', 30, false],
      [3, 'Mô hình Metal Build', 'Mô hình Metal Build khung kim loại, ráp sẵn, dành cho người sưu tầm', 20, false],
      [4, 'Mô hình Lắp Ráp Bandai', 'Mô hình lắp ráp chính hãng Bandai: HG, RG, MG, Plannosaurus và các dòng khác', 25, false],
      [5, 'Mô hình 30MM - 30MS', 'Mô hình lắp ráp 30 Minutes Missions, 30 Minutes Sisters, 30MF và Option Parts', 30, false],
      [6, 'Dụng cụ & Phụ kiện', 'Kìm, nhíp, dũa, nhám, khoan tay, băng keo che sơn và phụ kiện lắp ráp, sơn, sửa mô hình', 35, false],
      [7, 'Hàng ngừng kinh doanh', 'Loại đã ẩn (demo chức năng ẩn loại)', 20, true]
    ],

    // [id, category_id, code, name, image, description, brand, scale, material, size,
    //  profit_percent, cost_price, stock_qty, low_stock_threshold, is_hidden, sale_percent]
    // Giá bán = cost_price x (1 + lãi%). cost_price = giá nhập; stock_qty = tổng stock_movements bên dưới.
    // Mọi ngày giờ nằm trong khoảng 2026-09-01 -> 2026-11-01 (2 tháng gần nhất)
    products: [
      [1, 1, 'GD001', 'Mô hình SD 00 QANT 364', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+SD+00+QANT+364', 'Mô hình lắp ráp Gundam dòng SD (Super Deformed) với tạo hình chibi dễ thương, dễ lắp ráp, phù hợp người mới chơi.', null, null, 'Nhựa PS', null, null, 111000, 26, 5, false, 0],
      [2, 1, 'GD002', 'Mô hình lắp ráp SD Unicorn Gundam Perfectibility Mecha Unicorn', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+lắp+ráp+SD+Unicorn+Gundam+Perfectibility+Mecha+Unicorn', 'Mô hình lắp ráp Gundam dòng SD (Super Deformed) với tạo hình chibi dễ thương, dễ lắp ráp, phù hợp người mới chơi.', null, null, 'Nhựa PS', null, null, 255000, 15, 5, false, 0],
      [3, 1, 'GD003', 'Mô hình lắp ráp SD HEROES Alternative Justice Infinite Dragon Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+lắp+ráp+SD+HEROES+Alternative+Justice+Infinite+Dragon+Bandai', 'Mô hình lắp ráp Gundam dòng SD (Super Deformed) với tạo hình chibi dễ thương, dễ lắp ráp, phù hợp người mới chơi.', 'Bandai', null, 'Nhựa PS', null, null, 239000, 12, 5, false, 0],
      [4, 1, 'GD004', 'Mô hình lắp ráp SD W Heroes Sasuke Delta Gundam Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+lắp+ráp+SD+W+Heroes+Sasuke+Delta+Gundam+Bandai', 'Mô hình lắp ráp Gundam dòng SD (Super Deformed) với tạo hình chibi dễ thương, dễ lắp ráp, phù hợp người mới chơi.', 'Bandai', null, 'Nhựa PS', null, null, 224000, 20, 5, false, 0],
      [5, 1, 'GD005', 'Mô Hình Lắp Ráp Sdw Heroes Nobunaga Gundam Epyon Dark Mask Ver. Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+Sdw+Heroes+Nobunaga+Gundam+Epyon+Dark+Mask+Ver.+Bandai', 'Mô hình lắp ráp Gundam cấp độ MG (Master Grade) tỉ lệ 1/100, nhiều chi tiết, dành cho người thích lắp ráp kỹ và sưu tầm.', 'Bandai', null, 'Nhựa PS', null, null, 167000, 9, 5, false, 0],
      [6, 1, 'GD006', 'Mô Hình Lắp Ráp Gundam Bandai SD Zhang Fei God Gundam Trương Phi 03', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+Gundam+Bandai+SD+Zhang+Fei+God+Gundam+Trương+Phi+03', 'Mô hình lắp ráp Gundam dòng SD (Super Deformed) với tạo hình chibi dễ thương, dễ lắp ráp, phù hợp người mới chơi.', 'Bandai', null, 'Nhựa PS', null, null, 144000, 29, 5, false, 0],
      [7, 1, 'GD007', 'Mô Hình Lắp Ráp Gundam Bandai SD 002 Guan Yu Yun Chang V Gundam', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+Gundam+Bandai+SD+002+Guan+Yu+Yun+Chang+V+Gundam', 'Mô hình lắp ráp Gundam dòng SD (Super Deformed) với tạo hình chibi dễ thương, dễ lắp ráp, phù hợp người mới chơi.', 'Bandai', null, 'Nhựa PS', null, 10, 208000, 15, 5, false, 0],
      [8, 1, 'GD008', 'Mô hình lắp ráp Gundam Bandai SD Liu Bei Unicorn Gundam 01', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+lắp+ráp+Gundam+Bandai+SD+Liu+Bei+Unicorn+Gundam+01', 'Mô hình lắp ráp Gundam dòng SD (Super Deformed) với tạo hình chibi dễ thương, dễ lắp ráp, phù hợp người mới chơi.', 'Bandai', null, 'Nhựa PS', null, null, 144000, 34, 5, false, 0],
      [9, 1, 'GD009', 'Bandai Mô hình lắp ráp SD UNICORN Banshee Norn Sinanju 013 00 QANT RX-93 Nu Zero EW 00 Gundam', 'https://placehold.co/600x600/e8590c/ffffff?text=Bandai+Mô+hình+lắp+ráp+SD+UNICORN+Banshee+Norn+Sinanju+013+00+QANT+RX-93+Nu+Zero+EW+00+Gundam', 'Mô hình lắp ráp Gundam dòng SD (Super Deformed) với tạo hình chibi dễ thương, dễ lắp ráp, phù hợp người mới chơi.', 'Bandai', null, 'Nhựa PS', null, null, 135000, 21, 5, false, 0],
      [10, 1, 'GD010', 'Mô hình lắp ráp SD W Heroes Arsene Gundam X Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+lắp+ráp+SD+W+Heroes+Arsene+Gundam+X+Bandai', 'Mô hình lắp ráp Gundam dòng SD (Super Deformed) với tạo hình chibi dễ thương, dễ lắp ráp, phù hợp người mới chơi.', 'Bandai', null, 'Nhựa PS', null, null, 143000, 23, 5, false, 0],
      [11, 1, 'GD011', 'Mô hình lắp ráp SD Unicorn Gundam 02 Banshee Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+lắp+ráp+SD+Unicorn+Gundam+02+Banshee+Bandai', 'Mô hình lắp ráp Gundam dòng SD (Super Deformed) với tạo hình chibi dễ thương, dễ lắp ráp, phù hợp người mới chơi.', 'Bandai', null, 'Nhựa PS', null, null, 239000, 24, 5, false, 0],
      [12, 1, 'GD012', 'Mô hình lắp ráp SD Triệu Vân Tam Quốc KC Toys 715', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+lắp+ráp+SD+Triệu+Vân+Tam+Quốc+KC+Toys+715', 'Mô hình lắp ráp Gundam dòng SD (Super Deformed) với tạo hình chibi dễ thương, dễ lắp ráp, phù hợp người mới chơi.', 'KC Toys', null, 'Nhựa PS', null, null, 191000, 15, 5, false, 0],
      [13, 1, 'GD013', 'Mô hình Gundam SD Sinanju Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+Gundam+SD+Sinanju+Bandai', 'Mô hình lắp ráp Gundam dòng SD (Super Deformed) với tạo hình chibi dễ thương, dễ lắp ráp, phù hợp người mới chơi.', 'Bandai', null, 'Nhựa PS', null, null, 191000, 14, 5, false, 0],
      [14, 1, 'GD014', 'Mô Hình Lắp Ráp SD W Heroes Qitiandasheng Wukong Impulse Gundam Douzhanshengfo Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+SD+W+Heroes+Qitiandasheng+Wukong+Impulse+Gundam+Douzhanshengfo+Bandai', 'Mô hình lắp ráp Gundam dòng SD (Super Deformed) với tạo hình chibi dễ thương, dễ lắp ráp, phù hợp người mới chơi.', 'Bandai', null, 'Nhựa PS', null, null, 167000, 21, 5, false, 0],
      [15, 1, 'GD015', 'Mô Hình Lắp Ráp Sdw Heroes Longzun Liu Bei Unicorn Gundam Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+Sdw+Heroes+Longzun+Liu+Bei+Unicorn+Gundam+Bandai', 'Mô hình lắp ráp Gundam cấp độ MG (Master Grade) tỉ lệ 1/100, nhiều chi tiết, dành cho người thích lắp ráp kỹ và sưu tầm.', 'Bandai', null, 'Nhựa PS', null, null, 159000, 17, 5, false, 0],
      [16, 1, 'GD016', 'Mô hình lắp ráp SD 367 Kshatriya', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+lắp+ráp+SD+367+Kshatriya', 'Mô hình lắp ráp Gundam dòng SD (Super Deformed) với tạo hình chibi dễ thương, dễ lắp ráp, phù hợp người mới chơi.', null, null, 'Nhựa PS', null, null, 103000, 22, 5, false, 0],
      [17, 1, 'GD017', 'Mô Hình Gundam SD 380 Unicorn Gundam 02 Banshee', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Gundam+SD+380+Unicorn+Gundam+02+Banshee', 'Mô hình lắp ráp Gundam dòng SD (Super Deformed) với tạo hình chibi dễ thương, dễ lắp ráp, phù hợp người mới chơi.', null, null, 'Nhựa PS', null, null, 95000, 19, 5, false, 0],
      [18, 1, 'GD018', 'Mô hình lắp ráp SD Xi Gundam Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+lắp+ráp+SD+Xi+Gundam+Bandai', 'Mô hình lắp ráp Gundam dòng SD (Super Deformed) với tạo hình chibi dễ thương, dễ lắp ráp, phù hợp người mới chơi.', 'Bandai', null, 'Nhựa PS', null, null, 312000, 8, 5, false, 0],
      [19, 1, 'GD019', 'Mô hình lắp ráp SD RX-78-2 Gundam Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+lắp+ráp+SD+RX-78-2+Gundam+Bandai', 'Mô hình lắp ráp Gundam dòng SD (Super Deformed) với tạo hình chibi dễ thương, dễ lắp ráp, phù hợp người mới chơi.', 'Bandai', null, 'Nhựa PS', null, null, 135000, 16, 5, false, 0],
      [20, 1, 'GD020', 'Mô Hình Lắp Ráp SD Gundam Ex-standard Sazabi Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+SD+Gundam+Ex-standard+Sazabi+Bandai', 'Mô hình lắp ráp Gundam dòng SD (Super Deformed) với tạo hình chibi dễ thương, dễ lắp ráp, phù hợp người mới chơi.', 'Bandai', null, 'Nhựa PS', null, null, 127000, 24, 5, false, 0],
      [21, 1, 'GD021', 'Mô Hình Lắp Ráp Hello KITTY/RX-78-2 Gundam [SD Ex-standard] Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+Hello+KITTY%2FRX-78-2+Gundam+[SD+Ex-standard]+Bandai', 'Mô hình lắp ráp Gundam dòng SD (Super Deformed) với tạo hình chibi dễ thương, dễ lắp ráp, phù hợp người mới chơi.', 'Bandai', null, 'Nhựa PS', null, null, 479000, 14, 5, false, 17],
      [22, 1, 'GD022', 'Bộ lắp ráp Effect SDW Heroes Weapon Set Campaign Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Bộ+lắp+ráp+Effect+SDW+Heroes+Weapon+Set+Campaign+Bandai', 'Bộ phụ kiện lắp ráp bổ sung cho mô hình Gundam, tăng thêm chi tiết khi trưng bày.', 'Bandai', null, 'Nhựa PS', null, 40, 18000, 15, 5, false, 0],
      [23, 1, 'GD023', 'Mô hình Gundam Bandai SD Legend BB Musha Godmaru', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+Gundam+Bandai+SD+Legend+BB+Musha+Godmaru', 'Mô hình lắp ráp Gundam dòng SD (Super Deformed) với tạo hình chibi dễ thương, dễ lắp ráp, phù hợp người mới chơi.', 'Bandai', null, 'Nhựa PS', null, null, 192000, 14, 5, false, 0],
      [24, 1, 'GD024', 'Mô hình SD CS Earthree Gundam Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+SD+CS+Earthree+Gundam+Bandai', 'Mô hình lắp ráp Gundam dòng SD (Super Deformed) với tạo hình chibi dễ thương, dễ lắp ráp, phù hợp người mới chơi.', 'Bandai', null, 'Nhựa PS', null, null, 239000, 21, 5, false, 0],
      [25, 1, 'GD025', 'Mô Hình Lắp Ráp Dragon & Tiger Model 1/100 Nu Gundam GK Style – Long Hổ Model', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+Dragon+%26+Tiger+Model+1%2F100+Nu+Gundam+GK+Style+–+Long+Hổ+Model', 'Mô hình lắp ráp Gundam cấp độ MG (Master Grade) tỉ lệ 1/100, nhiều chi tiết, dành cho người thích lắp ráp kỹ và sưu tầm.', 'Dragon & Tiger Model', '1/100', 'Nhựa PS', null, null, 1200000, 5, 5, false, 13],
      [26, 1, 'GD026', 'Mô Hình Lắp Ráp MG 1/10 Arkham Knight Hemoxian', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+MG+1%2F10+Arkham+Knight+Hemoxian', 'Mô hình lắp ráp Gundam cấp độ MG (Master Grade) tỉ lệ 1/100, nhiều chi tiết, dành cho người thích lắp ráp kỹ và sưu tầm.', null, '1/100', 'Nhựa PS', null, null, 880000, 9, 5, false, 11],
      [27, 1, 'GD027', 'Mô Hình Lắp Ráp Axcis Model 1/100 Osiris Aerial Dominator (Kshatrya)', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+Axcis+Model+1%2F100+Osiris+Aerial+Dominator+(Kshatrya)', 'Mô hình lắp ráp Gundam cấp độ MG (Master Grade) tỉ lệ 1/100, nhiều chi tiết, dành cho người thích lắp ráp kỹ và sưu tầm.', 'Axcis Model', '1/100', 'Nhựa PS', null, null, 1840000, 8, 5, false, 0],
      [28, 1, 'GD028', 'Mô Hình Lắp Ráp [Infinite Dimension] MG 1/100 Genesis Assembly Model Kit', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+[Infinite+Dimension]+MG+1%2F100+Genesis+Assembly+Model+Kit', 'Mô hình lắp ráp Gundam cấp độ MG (Master Grade) tỉ lệ 1/100, nhiều chi tiết, dành cho người thích lắp ráp kỹ và sưu tầm.', 'Infinite Dimension', '1/100', 'Nhựa PS', null, null, 839000, 8, 5, false, 0],
      [29, 1, 'GD029', 'Mô Hình Lắp Ráp MG 1/100 Banshee Norn Final Battle Ver 6643 Daban', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+MG+1%2F100+Banshee+Norn+Final+Battle+Ver+6643+Daban', 'Mô hình lắp ráp Gundam cấp độ MG (Master Grade) tỉ lệ 1/100, nhiều chi tiết, dành cho người thích lắp ráp kỹ và sưu tầm.', 'Daban', '1/100', 'Nhựa PS', null, null, 439000, 12, 5, false, 0],
      [30, 1, 'GD030', 'Bộ Khung Xương hợp kim MG 1/100 Barbatos ACE', 'https://placehold.co/600x600/e8590c/ffffff?text=Bộ+Khung+Xương+hợp+kim+MG+1%2F100+Barbatos+ACE', 'Bộ khung xương hợp kim dành cho MG 1/100, giúp mô hình chắc chắn và tạo dáng linh hoạt hơn.', null, '1/100', 'Hợp kim', null, null, 319000, 16, 5, false, 0],
      [31, 1, 'GD031', 'Mô hình đồ chơi lắp ráp MG-03 MS GENERAL CAO CAO', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+đồ+chơi+lắp+ráp+MG-03+MS+GENERAL+CAO+CAO', 'Mô hình lắp ráp Gundam cấp độ MG (Master Grade) tỉ lệ 1/100, nhiều chi tiết, dành cho người thích lắp ráp kỹ và sưu tầm.', 'MS General', '1/100', 'Nhựa PS', null, null, 799000, 6, 5, false, 0],
      [32, 1, 'GD032', 'Mô Hình Lắp Ráp Gundam MG Full Armor MK-II 8815', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+Gundam+MG+Full+Armor+MK-II+8815', 'Mô hình lắp ráp Gundam cấp độ MG (Master Grade) tỉ lệ 1/100, nhiều chi tiết, dành cho người thích lắp ráp kỹ và sưu tầm.', null, '1/100', 'Nhựa PS', null, null, 559000, 12, 5, false, 0],
      [33, 1, 'GD033', 'Mô hình lắp ráp MG 1/100 MS-09R Rick Dom Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+lắp+ráp+MG+1%2F100+MS-09R+Rick+Dom+Bandai', 'Mô hình lắp ráp Gundam cấp độ MG (Master Grade) tỉ lệ 1/100, nhiều chi tiết, dành cho người thích lắp ráp kỹ và sưu tầm.', 'Bandai', '1/100', 'Nhựa PS', null, null, 735000, 13, 5, false, 0],
      [34, 1, 'GD034', 'Mô Hình lắp ráp Gundam TT Hongli MG Sandrock EW ver', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+lắp+ráp+Gundam+TT+Hongli+MG+Sandrock+EW+ver', 'Mô hình lắp ráp Gundam cấp độ MG (Master Grade) tỉ lệ 1/100, nhiều chi tiết, dành cho người thích lắp ráp kỹ và sưu tầm.', 'TT Hongli', '1/100', 'Nhựa PS', null, null, 319000, 17, 5, false, 0],
      [35, 1, 'GD035', 'Mô Hình Lắp Ráp MG 8824 Zeta III Red Snake Daban', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+MG+8824+Zeta+III+Red+Snake+Daban', 'Mô hình lắp ráp Gundam cấp độ MG (Master Grade) tỉ lệ 1/100, nhiều chi tiết, dành cho người thích lắp ráp kỹ và sưu tầm.', 'Daban', '1/100', 'Nhựa PS', null, null, 519000, 4, 5, false, 0],
      [36, 1, 'GD036', 'Mô hình lắp ráp Gundam MG 8822 QanT Full Saber Ver MB Daban 1/100', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+lắp+ráp+Gundam+MG+8822+QanT+Full+Saber+Ver+MB+Daban+1%2F100', 'Mô hình lắp ráp Gundam cấp độ MG (Master Grade) tỉ lệ 1/100, nhiều chi tiết, dành cho người thích lắp ráp kỹ và sưu tầm.', 'Daban', '1/100', 'Nhựa PS', null, null, 544000, 3, 5, false, 0],
      [37, 1, 'GD037', 'Mô Hình Lắp Ráp MG F91 Gundam Daban 8821 Ver MB 1/100', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+MG+F91+Gundam+Daban+8821+Ver+MB+1%2F100', 'Mô hình lắp ráp Gundam cấp độ MG (Master Grade) tỉ lệ 1/100, nhiều chi tiết, dành cho người thích lắp ráp kỹ và sưu tầm.', 'Daban', '1/100', 'Nhựa PS', null, null, 559000, 11, 5, false, 0],
      [38, 1, 'GD038', 'Đế trưng bày - Domain Base Gundam VT-116 dành cho PG/MG/RG/HG', 'https://placehold.co/600x600/e8590c/ffffff?text=Đế+trưng+bày+-+Domain+Base+Gundam+VT-116+dành+cho+PG%2FMG%2FRG%2FHG', 'Đế trưng bày dùng cho mô hình PG/MG/RG/HG, giúp tạo dáng và trưng bày mô hình.', null, '1/100', null, null, 40, 56000, 34, 5, false, 0],
      [39, 1, 'GD039', 'Mô hình RX-0 Unicorn Gundam 02 Banshee Ver.Ka MG Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+RX-0+Unicorn+Gundam+02+Banshee+Ver.Ka+MG+Bandai', 'Mô hình lắp ráp Gundam cấp độ MG (Master Grade) tỉ lệ 1/100, nhiều chi tiết, dành cho người thích lắp ráp kỹ và sưu tầm.', 'Bandai', '1/100', 'Nhựa PS', null, null, 1119000, 10, 5, false, 0],
      [40, 1, 'GD040', 'Mô Hình Lắp Ráp Gundam MG 8811 Force Impulse Daban', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+Gundam+MG+8811+Force+Impulse+Daban', 'Mô hình lắp ráp Gundam cấp độ MG (Master Grade) tỉ lệ 1/100, nhiều chi tiết, dành cho người thích lắp ráp kỹ và sưu tầm.', 'Daban', '1/100', 'Nhựa PS', null, null, 359000, 20, 5, false, 0],
      [41, 1, 'GD041', 'Mô Hình Lắp Ráp MG 6631A Sazabi ver.Ka Clear Color Daban', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+MG+6631A+Sazabi+ver.Ka+Clear+Color+Daban', 'Mô hình lắp ráp Gundam cấp độ MG (Master Grade) tỉ lệ 1/100, nhiều chi tiết, dành cho người thích lắp ráp kỹ và sưu tầm.', 'Daban', '1/100', 'Nhựa PS', null, null, 799000, 11, 5, false, 0],
      [42, 1, 'GD042', 'Mô hình lắp ráp MS General MG-04 Huang Zhong x Zhu Niao', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+lắp+ráp+MS+General+MG-04+Huang+Zhong+x+Zhu+Niao', 'Mô hình lắp ráp Gundam cấp độ MG (Master Grade) tỉ lệ 1/100, nhiều chi tiết, dành cho người thích lắp ráp kỹ và sưu tầm.', 'MS General', '1/100', 'Nhựa PS', null, null, 959000, 9, 5, false, 0],
      [43, 1, 'GD043', 'Mô hình lắp ráp Gundam Barbatos MG 1/100 Solid Clear ( Ichiban Limited ) Kuji B 2022 Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+lắp+ráp+Gundam+Barbatos+MG+1%2F100+Solid+Clear+(+Ichiban+Limited+)+Kuji+B+2022+Bandai', 'Mô hình lắp ráp Gundam cấp độ MG (Master Grade) tỉ lệ 1/100, nhiều chi tiết, dành cho người thích lắp ráp kỹ và sưu tầm.', 'Bandai', '1/100', 'Nhựa PS', null, null, 1039000, 12, 5, false, 0],
      [44, 1, 'GD044', 'Mô hình lắp ráp Daban 6647 MG Universe Booster', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+lắp+ráp+Daban+6647+MG+Universe+Booster', 'Bộ phụ kiện lắp ráp bổ sung cho mô hình Gundam, tăng thêm chi tiết khi trưng bày.', 'Daban', '1/100', 'Nhựa PS', null, null, 183000, 10, 5, false, 0],
      [45, 1, 'GD045', 'Mô Hình Lắp Ráp MG 6641 Jesta Cannon Clear 1/100 Daban', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+MG+6641+Jesta+Cannon+Clear+1%2F100+Daban', 'Mô hình lắp ráp Gundam cấp độ MG (Master Grade) tỉ lệ 1/100, nhiều chi tiết, dành cho người thích lắp ráp kỹ và sưu tầm.', 'Daban', '1/100', 'Nhựa PS', null, null, 480000, 12, 5, false, 34],
      [46, 1, 'GD046', 'Mô hình lắp ráp MG Bandai RX-78-2 Gundam Ver 3.0', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+lắp+ráp+MG+Bandai+RX-78-2+Gundam+Ver+3.0', 'Mô hình lắp ráp Gundam cấp độ MG (Master Grade) tỉ lệ 1/100, nhiều chi tiết, dành cho người thích lắp ráp kỹ và sưu tầm.', 'Bandai', '1/100', 'Nhựa PS', null, null, 784000, 10, 5, false, 0],
      [47, 1, 'GD047', 'Mô hình lắp ráp 1/100 MG RX-78/C. A Casval exclusive Gundam Ver. 3.0 Daban 6628A', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+lắp+ráp+1%2F100+MG+RX-78%2FC.+A+Casval+exclusive+Gundam+Ver.+3.0+Daban+6628A', 'Mô hình lắp ráp Gundam cấp độ MG (Master Grade) tỉ lệ 1/100, nhiều chi tiết, dành cho người thích lắp ráp kỹ và sưu tầm.', 'Daban', '1/100', 'Nhựa PS', null, null, 304000, 9, 5, false, 0],
      [48, 1, 'GD048', 'Mô hình Lắp Ráp Gundam MG 1/100 RX-78-02 Gundam (GUNDAM THE ORIGIN Ver.) Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+Lắp+Ráp+Gundam+MG+1%2F100+RX-78-02+Gundam+(GUNDAM+THE+ORIGIN+Ver.)+Bandai', 'Mô hình lắp ráp Gundam cấp độ MG (Master Grade) tỉ lệ 1/100, nhiều chi tiết, dành cho người thích lắp ráp kỹ và sưu tầm.', 'Bandai', '1/100', 'Nhựa PS', null, null, 800000, 13, 5, false, 0],
      [49, 2, 'OP001', 'Mô hình lắp ráp tàu Going Merry One Piece 03', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+lắp+ráp+tàu+Going+Merry+One+Piece+03', 'Mô hình lắp ráp tàu trong series One Piece, chi tiết rõ nét, thích hợp trưng bày và sưu tầm.', null, null, 'Nhựa PS', null, null, 245000, 16, 5, false, 0],
      [50, 2, 'OP002', 'Mô hình lắp ráp tàu Thousand Sunny Flying Model One Piece H1', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+lắp+ráp+tàu+Thousand+Sunny+Flying+Model+One+Piece+H1', 'Mô hình lắp ráp tàu trong series One Piece, chi tiết rõ nét, thích hợp trưng bày và sưu tầm.', null, null, 'Nhựa PS', null, null, 215000, 12, 5, false, 0],
      [51, 2, 'OP003', 'Mô hình lắp ráp tàu Going Merry Memorial Color Ver One Piece 20', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+lắp+ráp+tàu+Going+Merry+Memorial+Color+Ver+One+Piece+20', 'Mô hình lắp ráp tàu trong series One Piece, chi tiết rõ nét, thích hợp trưng bày và sưu tầm.', null, null, 'Nhựa PS', null, null, 138000, 24, 5, false, 0],
      [52, 2, 'OP004', 'Mô hình lắp ráp tàu Thousand Sunny Film Gold Release Anniversary Color Ver', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+lắp+ráp+tàu+Thousand+Sunny+Film+Gold+Release+Anniversary+Color+Ver', 'Mô hình lắp ráp tàu trong series One Piece, chi tiết rõ nét, thích hợp trưng bày và sưu tầm.', null, null, 'Nhựa PS', null, null, 138000, 40, 5, false, 0],
      [53, 2, 'OP005', 'Mô hình lắp ráp tàu Marine Warship One Piece 07', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+lắp+ráp+tàu+Marine+Warship+One+Piece+07', 'Mô hình lắp ráp tàu trong series One Piece, chi tiết rõ nét, thích hợp trưng bày và sưu tầm.', null, null, 'Nhựa PS', null, null, 138000, 15, 5, false, 0],
      [54, 2, 'OP006', 'Mô hình lắp ráp tàu Garps Warship One Piece 08', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+lắp+ráp+tàu+Garps+Warship+One+Piece+08', 'Mô hình lắp ráp tàu trong series One Piece, chi tiết rõ nét, thích hợp trưng bày và sưu tầm.', null, null, 'Nhựa PS', null, null, 138000, 23, 5, false, 0],
      [55, 2, 'OP007', 'Mô hình Banpresto One Piece Glitter & Glamours Boa.Hancock Winter Style B Figure Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+Banpresto+One+Piece+Glitter+%26+Glamours+Boa.Hancock+Winter+Style+B+Figure+Bandai', 'Figure nhân vật One Piece tạo hình sống động, dành cho người sưu tầm và trưng bày.', 'Banpresto', null, 'PVC', null, null, 230000, 21, 5, false, 0],
      [56, 2, 'OP008', 'Mô hình One Piece Ulti Glitter & Glamours Ver. A Figure Banpresto Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+One+Piece+Ulti+Glitter+%26+Glamours+Ver.+A+Figure+Banpresto+Bandai', 'Figure nhân vật One Piece tạo hình sống động, dành cho người sưu tầm và trưng bày.', 'Banpresto', null, 'PVC', null, null, 438000, 11, 5, false, 0],
      [57, 2, 'OP009', 'Mô hình Banpresto One Piece DXF Grandline Children - Wano Vol. 2 Buggy Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+Banpresto+One+Piece+DXF+Grandline+Children+-+Wano+Vol.+2+Buggy+Bandai', 'Figure nhân vật One Piece tạo hình sống động, dành cho người sưu tầm và trưng bày.', 'Banpresto', null, 'PVC', null, null, 230000, 16, 5, false, 0],
      [58, 2, 'OP010', 'Mô hình One Piece Sabo The Grandline Men Grandista Figure BANPRESTO Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+One+Piece+Sabo+The+Grandline+Men+Grandista+Figure+BANPRESTO+Bandai', 'Figure nhân vật One Piece tạo hình sống động, dành cho người sưu tầm và trưng bày.', 'Banpresto', null, 'PVC', null, null, 461000, 7, 5, false, 0],
      [59, 2, 'OP011', 'Mô Hình One Piece Monkey Luffy Film Red DXF The Grandline Men vol.1 Banpresto Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+One+Piece+Monkey+Luffy+Film+Red+DXF+The+Grandline+Men+vol.1+Banpresto+Bandai', 'Figure nhân vật One Piece tạo hình sống động, dành cho người sưu tầm và trưng bày.', 'Banpresto', null, 'PVC', null, null, 284000, 8, 5, false, 0],
      [60, 2, 'OP012', 'Mô Hình One Piece Monkey Luffy Film Red DXF The Grandline Men vol.6 Banpresto Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+One+Piece+Monkey+Luffy+Film+Red+DXF+The+Grandline+Men+vol.6+Banpresto+Bandai', 'Figure nhân vật One Piece tạo hình sống động, dành cho người sưu tầm và trưng bày.', 'Banpresto', null, 'PVC', null, null, 307000, 23, 5, false, 0],
      [61, 2, 'OP013', 'Mô hình Monkey D. Luffy One Piece Scultures Big Banpresto Figure Colosseum VI Vol.3 Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+Monkey+D.+Luffy+One+Piece+Scultures+Big+Banpresto+Figure+Colosseum+VI+Vol.3+Bandai', 'Figure nhân vật One Piece tạo hình sống động, dành cho người sưu tầm và trưng bày.', 'Banpresto', null, 'PVC', null, null, 384000, 13, 5, false, 0],
      [62, 2, 'OP014', 'Mô hình One Piece - Monkey D. Luffy - Banpresto Chronicle - King of Artist Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+One+Piece+-+Monkey+D.+Luffy+-+Banpresto+Chronicle+-+King+of+Artist+Bandai', 'Figure nhân vật One Piece tạo hình sống động, dành cho người sưu tầm và trưng bày.', 'Banpresto', null, 'PVC', null, null, 661000, 9, 5, false, 0],
      [63, 2, 'OP015', 'Mô hình lắp ráp Trafalgar Laws Submarine Plastic model Bandai - One Piece', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+lắp+ráp+Trafalgar+Laws+Submarine+Plastic+model+Bandai+-+One+Piece', 'Mô hình lắp ráp tàu trong series One Piece, chi tiết rõ nét, thích hợp trưng bày và sưu tầm.', 'Bandai', null, 'Nhựa PS', null, null, 284000, 8, 5, false, 0],
      [64, 2, 'OP016', 'Mô hình lắp ráp Going Merry Plastic model Bandai - One Piece', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+lắp+ráp+Going+Merry+Plastic+model+Bandai+-+One+Piece', 'Mô hình lắp ráp tàu trong series One Piece, chi tiết rõ nét, thích hợp trưng bày và sưu tầm.', 'Bandai', null, 'Nhựa PS', null, null, 292000, 10, 5, false, 0],
      [65, 2, 'OP017', 'Mô hình lắp ráp Chopper Robo Super 04 Kung fu Tracer Plastic model Bandai - One Piece', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+lắp+ráp+Chopper+Robo+Super+04+Kung+fu+Tracer+Plastic+model+Bandai+-+One+Piece', 'Mô hình lắp ráp Chopper Robo trong One Piece, ghép nhựa dễ lắp, kèm khớp để tạo dáng.', 'Bandai', null, 'Nhựa PS', null, null, 130000, 27, 5, false, 0],
      [66, 2, 'OP018', 'Mô hình lắp ráp Chopper Robo Super 05 Walk Hopper Plastic model Bandai - One Piece', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+lắp+ráp+Chopper+Robo+Super+05+Walk+Hopper+Plastic+model+Bandai+-+One+Piece', 'Mô hình lắp ráp Chopper Robo trong One Piece, ghép nhựa dễ lắp, kèm khớp để tạo dáng.', 'Bandai', null, 'Nhựa PS', null, null, 130000, 36, 5, false, 0],
      [67, 2, 'OP019', 'Mô hình lắp ráp Going Merry Plastic model Bandai bản to - One Piece', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+lắp+ráp+Going+Merry+Plastic+model+Bandai+bản+to+-+One+Piece', 'Mô hình lắp ráp tàu trong series One Piece, chi tiết rõ nét, thích hợp trưng bày và sưu tầm.', 'Bandai', null, 'Nhựa PS', null, null, 661000, 7, 5, false, 0],
      [68, 2, 'OP020', 'Mô hình lắp ráp Red Force Plastic model Bandai - One Piece', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+lắp+ráp+Red+Force+Plastic+model+Bandai+-+One+Piece', 'Mô hình lắp ráp tàu trong series One Piece, chi tiết rõ nét, thích hợp trưng bày và sưu tầm.', 'Bandai', null, 'Nhựa PS', null, null, 231000, 25, 5, false, 0],
      [69, 2, 'OP021', 'Mô Hình Lắp Ráp Nine Snake Pirate Ship Serie One Piece Plastic model Bandai - One Piece', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+Nine+Snake+Pirate+Ship+Serie+One+Piece+Plastic+model+Bandai+-+One+Piece', 'Mô hình lắp ráp tàu trong series One Piece, chi tiết rõ nét, thích hợp trưng bày và sưu tầm.', 'Bandai', null, 'Nhựa PS', null, null, 276000, 13, 5, false, 0],
      [70, 2, 'OP022', 'Mô hình lắp ráp Chopper Robo Super 03 Horn Dozer Plastic model Bandai - One Piece', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+lắp+ráp+Chopper+Robo+Super+03+Horn+Dozer+Plastic+model+Bandai+-+One+Piece', 'Mô hình lắp ráp Chopper Robo trong One Piece, ghép nhựa dễ lắp, kèm khớp để tạo dáng.', 'Bandai', null, 'Nhựa PS', null, null, 108000, 29, 5, false, 0],
      [71, 2, 'OP023', 'Mô hình lắp ráp tàu Trafalgar Laws Submarine One Piece 02', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+lắp+ráp+tàu+Trafalgar+Laws+Submarine+One+Piece+02', 'Mô hình lắp ráp tàu trong series One Piece, chi tiết rõ nét, thích hợp trưng bày và sưu tầm.', null, null, 'Nhựa PS', null, null, 154000, 19, 5, false, 45],
      [72, 2, 'OP024', 'Mô hình lắp ráp tàu Thousand Sunny TV Animation 15th Anniversary Ver One Piece 015', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+lắp+ráp+tàu+Thousand+Sunny+TV+Animation+15th+Anniversary+Ver+One+Piece+015', 'Mô hình lắp ráp tàu trong series One Piece, chi tiết rõ nét, thích hợp trưng bày và sưu tầm.', null, null, 'Nhựa PS', null, null, 153000, 19, 5, false, 0],
      [73, 3, 'MB001', 'Mô Hình 1/72 Metal Build ZhuKui - Thiên Sư Chung Quỳ Cangdao', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+1%2F72+Metal+Build+ZhuKui+-+Thiên+Sư+Chung+Quỳ+Cangdao', 'Mô hình Metal Build kết hợp khung kim loại và chi tiết nhựa, nhiều khớp linh hoạt, dành cho người sưu tầm.', 'Cang Dao', '1/72', 'Hợp kim', null, null, 2750000, 6, 5, false, 0],
      [74, 3, 'MB002', 'Mô Hình Metal Build 1/100 Sun Wukong Moshow - Tề Thiên Võ Thánh', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Metal+Build+1%2F100+Sun+Wukong+Moshow+-+Tề+Thiên+Võ+Thánh', 'Mô hình Metal Build kết hợp khung kim loại và chi tiết nhựa, nhiều khớp linh hoạt, dành cho người sưu tầm.', 'Moshow', '1/100', 'Hợp kim', null, null, 1542000, 9, 5, false, 16],
      [75, 3, 'MB003', 'Mô Hình Metal Build 1/72 Ultimate Lancelot Knight Of Ash Moshow Toys', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Metal+Build+1%2F72+Ultimate+Lancelot+Knight+Of+Ash+Moshow+Toys', 'Mô hình Metal Build kết hợp khung kim loại và chi tiết nhựa, nhiều khớp linh hoạt, dành cho người sưu tầm.', 'Moshow', '1/72', 'Hợp kim', null, null, 2750000, 5, 5, false, 0],
      [76, 3, 'MB004', 'Mô Hình Ráp Sẵn Metal Build MCT-AP04 Duke of Wei Guo Progenitor Effect Moshow Toys', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Ráp+Sẵn+Metal+Build+MCT-AP04+Duke+of+Wei+Guo+Progenitor+Effect+Moshow+Toys', 'Mô hình Metal Build kết hợp khung kim loại và chi tiết nhựa, nhiều khớp linh hoạt, dành cho người sưu tầm.', 'Moshow', null, 'Hợp kim', null, null, 3167000, 4, 5, false, 13],
      [77, 3, 'MB005', 'Mô Hình Metal Build 1/72 Date Masamune MOSHOW (Lắp Sẵn)', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Metal+Build+1%2F72+Date+Masamune+MOSHOW+(Lắp+Sẵn)', 'Mô hình Metal Build kết hợp khung kim loại và chi tiết nhựa, nhiều khớp linh hoạt, dành cho người sưu tầm.', 'Moshow', '1/72', 'Hợp kim', null, null, 4833000, 8, 5, false, 0],
      [78, 3, 'MB006', 'Mô Hình Metal Build 1/72 MCT J02E Evil Takeda Shingen Limited Edition MOSHOW', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Metal+Build+1%2F72+MCT+J02E+Evil+Takeda+Shingen+Limited+Edition+MOSHOW', 'Mô hình Metal Build kết hợp khung kim loại và chi tiết nhựa, nhiều khớp linh hoạt, dành cho người sưu tầm.', 'Moshow', '1/72', 'Hợp kim', null, null, 5417000, 4, 5, false, 0],
      [79, 3, 'MB007', 'Mô Hình Metal Build MNQ-XH08X Wukong Ngộ Không Motor Nuclear', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Metal+Build+MNQ-XH08X+Wukong+Ngộ+Không+Motor+Nuclear', 'Mô hình Metal Build kết hợp khung kim loại và chi tiết nhựa, nhiều khớp linh hoạt, dành cho người sưu tầm.', 'Motor Nuclear', null, 'Hợp kim', null, null, 5417000, 4, 5, false, 0],
      [80, 3, 'MB008', 'Mô Hình Metal Build 1/100 Oda Nobunaga Demon King Hot General', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Metal+Build+1%2F100+Oda+Nobunaga+Demon+King+Hot+General', 'Mô hình Metal Build kết hợp khung kim loại và chi tiết nhựa, nhiều khớp linh hoạt, dành cho người sưu tầm.', null, '1/100', 'Hợp kim', null, null, 1042000, 13, 5, false, 0],
      [81, 3, 'MB009', 'Mô Hình Hợp Kim Ráp Sẵn Metal Build MNQ-XH09X Guan Yu + Chi Yan Long Ju Quan Vũ + Xích Thố Motor Nuclear', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Hợp+Kim+Ráp+Sẵn+Metal+Build+MNQ-XH09X+Guan+Yu+%2B+Chi+Yan+Long+Ju+Quan+Vũ+%2B+Xích+Thố+Motor+Nuclear', 'Mô hình Metal Build kết hợp khung kim loại và chi tiết nhựa, nhiều khớp linh hoạt, dành cho người sưu tầm.', 'Motor Nuclear', null, 'Hợp kim', null, 10, 11455000, 6, 5, false, 0],
      [82, 3, 'MB010', 'Mô Hình Hợp Kim Ráp Sẵn Metal Build MNQ-XH09X Guan Yu + Chi Yan Long Ju Quan Vũ + Xích Thố Motor Nuclear', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Hợp+Kim+Ráp+Sẵn+Metal+Build+MNQ-XH09X+Guan+Yu+%2B+Chi+Yan+Long+Ju+Quan+Vũ+%2B+Xích+Thố+Motor+Nuclear', 'Mô hình Metal Build kết hợp khung kim loại và chi tiết nhựa, nhiều khớp linh hoạt, dành cho người sưu tầm.', 'Motor Nuclear', null, 'Hợp kim', null, 10, 11455000, 7, 5, false, 0],
      [83, 3, 'MB011', 'Mô Hình Metal Build Club MC 1/100 Wing Zero GFFMC Gundam Fix Figuration Metal Composite', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Metal+Build+Club+MC+1%2F100+Wing+Zero+GFFMC+Gundam+Fix+Figuration+Metal+Composite', 'Mô hình Metal Build kết hợp khung kim loại và chi tiết nhựa, nhiều khớp linh hoạt, dành cho người sưu tầm.', null, '1/100', 'Hợp kim', null, null, 2167000, 4, 5, false, 0],
      [84, 3, 'MB012', 'Mô Hình Lắp Ráp CangDao Metal Build Hổ Tiên Phong', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+CangDao+Metal+Build+Hổ+Tiên+Phong', 'Mô hình Metal Build kết hợp khung kim loại và chi tiết nhựa, nhiều khớp linh hoạt, dành cho người sưu tầm.', 'Cang Dao', null, 'Hợp kim', null, null, 2083000, 14, 5, false, 0],
      [85, 3, 'MB013', 'Mô Hình Metal Build CangDao Model 1/100 DSK-02 Kainar Full Armor Dussack', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Metal+Build+CangDao+Model+1%2F100+DSK-02+Kainar+Full+Armor+Dussack', 'Mô hình Metal Build kết hợp khung kim loại và chi tiết nhựa, nhiều khớp linh hoạt, dành cho người sưu tầm.', 'Cang Dao', '1/100', 'Hợp kim', null, null, 2083000, 7, 5, false, 0],
      [86, 3, 'MB014', 'Mô Hình Metal Build CD07W Ninja ChouChou White Phantom Cang Dao', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Metal+Build+CD07W+Ninja+ChouChou+White+Phantom+Cang+Dao', 'Mô hình Metal Build kết hợp khung kim loại và chi tiết nhựa, nhiều khớp linh hoạt, dành cho người sưu tầm.', 'Cang Dao', null, 'Hợp kim', null, null, 3082000, 5, 5, false, 0],
      [87, 3, 'MB015', 'Mô Hình Devil Hunter YY-04 Date Masamune 1/100 Metal Build', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Devil+Hunter+YY-04+Date+Masamune+1%2F100+Metal+Build', 'Mô hình Metal Build kết hợp khung kim loại và chi tiết nhựa, nhiều khớp linh hoạt, dành cho người sưu tầm.', null, '1/100', 'Hợp kim', null, null, 1666000, 3, 5, false, 0],
      [88, 3, 'MB016', 'Mô Hình Metal Build MB Justice Gundam KO (Khung xương kim loại)', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Metal+Build+MB+Justice+Gundam+KO+(Khung+xương+kim+loại)', 'Mô hình Metal Build kết hợp khung kim loại và chi tiết nhựa, nhiều khớp linh hoạt, dành cho người sưu tầm.', null, null, 'Hợp kim', null, null, 1666000, 8, 5, false, 0],
      [89, 3, 'MB017', 'Mô Hình Metal Build 1/72 CD-10 Ye Shan Dạ Thiểm Cang Dao', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Metal+Build+1%2F72+CD-10+Ye+Shan+Dạ+Thiểm+Cang+Dao', 'Mô hình Metal Build kết hợp khung kim loại và chi tiết nhựa, nhiều khớp linh hoạt, dành cho người sưu tầm.', 'Cang Dao', '1/72', 'Hợp kim', null, null, 2167000, 10, 5, false, 0],
      [90, 3, 'MB018', 'Mô Hình Metal Build 1/72 CD-04 CD04 Black Tortoise Xuanwu Huyền Vũ Cang Dao Model (Kèm quà tặng)', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Metal+Build+1%2F72+CD-04+CD04+Black+Tortoise+Xuanwu+Huyền+Vũ+Cang+Dao+Model+(Kèm+quà+tặng)', 'Mô hình Metal Build kết hợp khung kim loại và chi tiết nhựa, nhiều khớp linh hoạt, dành cho người sưu tầm.', 'Cang Dao', '1/72', 'Hợp kim', null, null, 3000000, 8, 5, false, 0],
      [91, 3, 'MB019', 'Mô Hình Lắp Ráp Metal Build CD-TG02 Tian Fa Cang Dao', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+Metal+Build+CD-TG02+Tian+Fa+Cang+Dao', 'Mô hình Metal Build kết hợp khung kim loại và chi tiết nhựa, nhiều khớp linh hoạt, dành cho người sưu tầm.', 'Cang Dao', null, 'Hợp kim', null, null, 958000, 11, 5, false, 0],
      [92, 3, 'MB020', 'Mô Hình 1/72 Metal Build CD-01U Ultimate Azure Dragon Cang Dao Thanh Long Bản Mới', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+1%2F72+Metal+Build+CD-01U+Ultimate+Azure+Dragon+Cang+Dao+Thanh+Long+Bản+Mới', 'Mô hình Metal Build kết hợp khung kim loại và chi tiết nhựa, nhiều khớp linh hoạt, dành cho người sưu tầm.', 'Cang Dao', '1/72', 'Hợp kim', null, null, 2500000, 5, 5, false, 0],
      [93, 3, 'MB021', 'Mô Hình Lắp Ráp Metal Build 1/72 Băng tước Zhu Que Blue Cang Dao', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+Metal+Build+1%2F72+Băng+tước+Zhu+Que+Blue+Cang+Dao', 'Mô hình Metal Build kết hợp khung kim loại và chi tiết nhựa, nhiều khớp linh hoạt, dành cho người sưu tầm.', 'Cang Dao', '1/72', 'Hợp kim', null, null, 3000000, 5, 5, false, 22],
      [94, 3, 'MB022', 'Pin lắp Led Mô Hình Metal Build 1/72 MCT-E02 Lancelot of The Lake Moshow ( AG1+ AG13 )', 'https://placehold.co/600x600/e8590c/ffffff?text=Pin+lắp+Led+Mô+Hình+Metal+Build+1%2F72+MCT-E02+Lancelot+of+The+Lake+Moshow+(+AG1%2B+AG13+)', 'Pin dùng cho đèn LED lắp trong mô hình Metal Build, thay thế khi hết pin.', 'Moshow', '1/72', null, null, null, 74000, 13, 5, false, 0],
      [95, 3, 'MB023', 'Mô Hình 1/72 Metal Build Asyura Moshow', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+1%2F72+Metal+Build+Asyura+Moshow', 'Mô hình Metal Build kết hợp khung kim loại và chi tiết nhựa, nhiều khớp linh hoạt, dành cho người sưu tầm.', 'Moshow', '1/72', 'Hợp kim', null, null, 1917000, 7, 5, false, 0],
      [96, 3, 'MB024', 'Mô Hình Metal Build Yukimura Sanada 1/100 DH-02 Devil Hunter', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Metal+Build+Yukimura+Sanada+1%2F100+DH-02+Devil+Hunter', 'Mô hình Metal Build kết hợp khung kim loại và chi tiết nhựa, nhiều khớp linh hoạt, dành cho người sưu tầm.', null, '1/100', 'Hợp kim', null, null, 1666000, 7, 5, false, 0],
      [97, 4, 'BD001', 'Mô Hình Lắp Ráp Plannosaurus Spinosaurus 1915 Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+Plannosaurus+Spinosaurus+1915+Bandai', 'Mô hình lắp ráp khủng long Plannosaurus của Bandai, dễ lắp ghép và trưng bày.', 'Bandai', null, 'Nhựa PS', null, null, 416000, 11, 5, false, 13],
      [98, 4, 'BD002', 'Mô Hình Lắp Ráp Plannosaurus Tyrannosaurus 1915 Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+Plannosaurus+Tyrannosaurus+1915+Bandai', 'Mô hình lắp ráp khủng long Plannosaurus của Bandai, dễ lắp ghép và trưng bày.', 'Bandai', null, 'Nhựa PS', null, null, 399000, 24, 5, false, 14],
      [99, 4, 'BD003', 'Mô Hình Lắp Ráp Plannosaurus Tyrannosaurus Snowfall Area Ver. Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+Plannosaurus+Tyrannosaurus+Snowfall+Area+Ver.+Bandai', 'Mô hình lắp ráp khủng long Plannosaurus của Bandai, dễ lắp ghép và trưng bày.', 'Bandai', null, 'Nhựa PS', null, null, 399000, 11, 5, false, 14],
      [100, 4, 'BD004', 'Mô Hình Lắp Ráp Plannosaurus Tyrannosaurus Tropical Jungle Ver. Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+Plannosaurus+Tyrannosaurus+Tropical+Jungle+Ver.+Bandai', 'Mô hình lắp ráp khủng long Plannosaurus của Bandai, dễ lắp ghép và trưng bày.', 'Bandai', null, 'Nhựa PS', null, null, 399000, 16, 5, false, 14],
      [101, 4, 'BD005', 'Mô Hình Lắp Ráp Plannosaurus Pachyrhinosaurus Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+Plannosaurus+Pachyrhinosaurus+Bandai', 'Mô hình lắp ráp khủng long Plannosaurus của Bandai, dễ lắp ghép và trưng bày.', 'Bandai', null, 'Nhựa PS', null, null, 399000, 18, 5, false, 10],
      [102, 4, 'BD006', 'Mô Hình Lắp Ráp HG 1/144 Gouf Ignited (Heine Westenfluss Custom) Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+HG+1%2F144+Gouf+Ignited+(Heine+Westenfluss+Custom)+Bandai', 'Mô hình lắp ráp Bandai chi tiết rõ nét, ghép nhựa dễ lắp, phù hợp người chơi mô hình và sưu tầm.', 'Bandai', '1/144', 'Nhựa PS', null, null, 639000, 11, 5, false, 6],
      [103, 4, 'BD007', 'Mô Hình Lắp Ráp HG 1/144 Messer TYPE-M01 (Gawman Use) Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+HG+1%2F144+Messer+TYPE-M01+(Gawman+Use)+Bandai', 'Mô hình lắp ráp Bandai chi tiết rõ nét, ghép nhựa dễ lắp, phù hợp người chơi mô hình và sưu tầm.', 'Bandai', '1/144', 'Nhựa PS', null, null, 680000, 7, 5, false, 6],
      [104, 4, 'BD008', 'Mô Hình Lắp Ráp Vehicle Model 007 TIE Advanced X 1 & Fighter Set Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+Vehicle+Model+007+TIE+Advanced+X+1+%26+Fighter+Set+Bandai', 'Mô hình lắp ráp Bandai chi tiết rõ nét, ghép nhựa dễ lắp, phù hợp người chơi mô hình và sưu tầm.', 'Bandai', null, 'Nhựa PS', null, null, 208000, 18, 5, false, 19],
      [105, 4, 'BD009', 'Mô hình lắp ráp Gundam HG BF 1/144 MISS SAZABI Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+lắp+ráp+Gundam+HG+BF+1%2F144+MISS+SAZABI+Bandai', 'Mô hình lắp ráp Bandai chi tiết rõ nét, ghép nhựa dễ lắp, phù hợp người chơi mô hình và sưu tầm.', 'Bandai', '1/144', 'Nhựa PS', null, null, 584000, 8, 5, false, 11],
      [106, 4, 'BD010', 'Bộ phụ kiện HG BC Gunpla Battle Arm Arms Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Bộ+phụ+kiện+HG+BC+Gunpla+Battle+Arm+Arms+Bandai', 'Bộ phụ kiện dành cho mô hình lắp ráp Bandai, giúp thay đổi và bổ sung chi tiết cho mô hình.', 'Bandai', '1/144', 'Nhựa PS', null, null, 128000, 18, 5, false, 0],
      [107, 4, 'BD011', 'Mô hình lắp ráp SD BB 212 ZZ GUNDAM Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+lắp+ráp+SD+BB+212+ZZ+GUNDAM+Bandai', 'Mô hình lắp ráp Bandai chi tiết rõ nét, ghép nhựa dễ lắp, phù hợp người chơi mô hình và sưu tầm.', 'Bandai', null, 'Nhựa PS', null, null, 176000, 20, 5, false, 0],
      [108, 4, 'BD012', 'Mô Hình Lắp Ráp HG 1/144 HAMBRABI (GQ) Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+HG+1%2F144+HAMBRABI+(GQ)+Bandai', 'Mô hình lắp ráp Bandai chi tiết rõ nét, ghép nhựa dễ lắp, phù hợp người chơi mô hình và sưu tầm.', 'Bandai', '1/144', 'Nhựa PS', null, null, 440000, 9, 5, false, 0],
      [109, 4, 'BD013', 'Mô Hình Lắp Ráp 30MS SIS-J00 Merunja [Color A] Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+30MS+SIS-J00+Merunja+[Color+A]+Bandai', 'Mô hình lắp ráp Bandai chi tiết rõ nét, ghép nhựa dễ lắp, phù hợp người chơi mô hình và sưu tầm.', 'Bandai', null, 'Nhựa PS', null, null, 600000, 12, 5, false, 13],
      [110, 4, 'BD014', 'Mô Hình Gundam Bandai 1/100 MG NT-1 Gundam Ver 2.0', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Gundam+Bandai+1%2F100+MG+NT-1+Gundam+Ver+2.0', 'Mô hình lắp ráp Bandai chi tiết rõ nét, ghép nhựa dễ lắp, phù hợp người chơi mô hình và sưu tầm.', 'Bandai', '1/100', 'Nhựa PS', null, null, 1160000, 7, 5, false, 7],
      [111, 4, 'BD015', 'Mô Hình Lắp Ráp HG 1/144 KABAKALI Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+HG+1%2F144+KABAKALI+Bandai', 'Mô hình lắp ráp Bandai chi tiết rõ nét, ghép nhựa dễ lắp, phù hợp người chơi mô hình và sưu tầm.', 'Bandai', '1/144', 'Nhựa PS', null, null, 520000, 14, 5, false, 26],
      [112, 4, 'BD016', 'Mô Hình Lắp Ráp HGBF 1/144 Qubeley Papillon Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+HGBF+1%2F144+Qubeley+Papillon+Bandai', 'Mô hình lắp ráp Bandai chi tiết rõ nét, ghép nhựa dễ lắp, phù hợp người chơi mô hình và sưu tầm.', 'Bandai', '1/144', 'Nhựa PS', null, null, 520000, 11, 5, false, 11],
      [113, 4, 'BD017', 'Mô Hình Lắp Ráp HG 1/144 Seravee Gundam GNHW/B Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+HG+1%2F144+Seravee+Gundam+GNHW%2FB+Bandai', 'Mô hình lắp ráp Bandai chi tiết rõ nét, ghép nhựa dễ lắp, phù hợp người chơi mô hình và sưu tầm.', 'Bandai', '1/144', 'Nhựa PS', null, null, 440000, 9, 5, false, 18],
      [114, 4, 'BD018', 'Mô Hình Lắp Ráp HG BF 1/144 Zaku Amazing Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+HG+BF+1%2F144+Zaku+Amazing+Bandai', 'Mô hình lắp ráp Bandai chi tiết rõ nét, ghép nhựa dễ lắp, phù hợp người chơi mô hình và sưu tầm.', 'Bandai', '1/144', 'Nhựa PS', null, null, 440000, 7, 5, false, 18],
      [115, 4, 'BD019', 'Mô Hình Lắp Ráp MG 1/100 GN-X Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+MG+1%2F100+GN-X+Bandai', 'Mô hình lắp ráp Bandai chi tiết rõ nét, ghép nhựa dễ lắp, phù hợp người chơi mô hình và sưu tầm.', 'Bandai', '1/100', 'Nhựa PS', null, null, 736000, 10, 5, false, 15],
      [116, 4, 'BD020', 'Mô Hình Lắp Ráp HG 1/144 Gundam Sandrock EW Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+HG+1%2F144+Gundam+Sandrock+EW+Bandai', 'Mô hình lắp ráp Bandai chi tiết rõ nét, ghép nhựa dễ lắp, phù hợp người chơi mô hình và sưu tầm.', 'Bandai', '1/144', 'Nhựa PS', null, null, 760000, 8, 5, false, 11],
      [117, 4, 'BD021', 'Mô Hình Lắp Ráp RG 1/48 AV-98Plus (INGRAM PLUS) Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+RG+1%2F48+AV-98Plus+(INGRAM+PLUS)+Bandai', 'Mô hình lắp ráp Bandai chi tiết rõ nét, ghép nhựa dễ lắp, phù hợp người chơi mô hình và sưu tầm.', 'Bandai', '1/48', 'Nhựa PS', null, null, 960000, 6, 5, false, 0],
      [118, 4, 'BD022', 'Mô Hình Lắp Ráp HG BRUTISHDOG Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+HG+BRUTISHDOG+Bandai', 'Mô hình lắp ráp Bandai chi tiết rõ nét, ghép nhựa dễ lắp, phù hợp người chơi mô hình và sưu tầm.', 'Bandai', '1/144', 'Nhựa PS', null, null, 680000, 6, 5, false, 11],
      [119, 4, 'BD023', 'Mô Hình Lắp Ráp 30MS SIS-W00 Marical [Color C] Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+30MS+SIS-W00+Marical+[Color+C]+Bandai', 'Mô hình lắp ráp Bandai chi tiết rõ nét, ghép nhựa dễ lắp, phù hợp người chơi mô hình và sưu tầm.', 'Bandai', null, 'Nhựa PS', null, null, 496000, 12, 5, false, 15],
      [120, 5, 'MM001', 'Mô Hình Lắp Ráp 30MM 1/144 EXM-A9rk Spinatio - Royal Knight Type Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+30MM+1%2F144+EXM-A9rk+Spinatio+-+Royal+Knight+Type+Bandai', 'Mô hình lắp ráp thuộc dòng 30 Minutes (30MM/30MS/30MF) của Bandai, thiết kế dạng module dễ thay đổi phụ kiện.', 'Bandai', '1/144', 'Nhựa PS', null, null, 307000, 24, 5, false, 12],
      [121, 5, 'MM002', 'Mô hình phụ kiện 30MS Option Parts Set 26 (Climb Unit) [Color C] Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+phụ+kiện+30MS+Option+Parts+Set+26+(Climb+Unit)+[Color+C]+Bandai', 'Bộ phụ kiện Option Parts cho dòng 30MM/30MS, dùng để thay đổi trang phục, giáp và trang bị cho mô hình.', 'Bandai', null, 'Nhựa PS', null, null, 200000, 11, 5, false, 0],
      [122, 5, 'MM003', 'Mô Hình Lắp Ráp 30MF Fantasy Series Death Knight NECROSKNIGHT Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+30MF+Fantasy+Series+Death+Knight+NECROSKNIGHT+Bandai', 'Mô hình lắp ráp thuộc dòng 30 Minutes (30MM/30MS/30MF) của Bandai, thiết kế dạng module dễ thay đổi phụ kiện.', 'Bandai', null, 'Nhựa PS', null, null, 346000, 20, 5, false, 0],
      [123, 5, 'MM004', 'Mô Hình Lắp Ráp 30MM 1/144 Exm Verdenova Verdenova', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+30MM+1%2F144+Exm+Verdenova+Verdenova', 'Mô hình lắp ráp thuộc dòng 30 Minutes (30MM/30MS/30MF) của Bandai, thiết kế dạng module dễ thay đổi phụ kiện.', 'Bandai', '1/144', 'Nhựa PS', null, null, 269000, 12, 5, false, 0],
      [124, 5, 'MM005', 'Mô Hình Lắp Ráp Bandai 30MS Tiasha - Dahlia Wear - Color B', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+Bandai+30MS+Tiasha+-+Dahlia+Wear+-+Color+B', 'Mô hình lắp ráp thuộc dòng 30 Minutes (30MM/30MS/30MF) của Bandai, thiết kế dạng module dễ thay đổi phụ kiện.', 'Bandai', null, 'Nhựa PS', null, null, 331000, 13, 5, false, 0],
      [125, 5, 'MM006', 'Mô Hình Lắp Ráp Bandai Phụ Kiện 30MS Option Parts Set 23 - Valkyrie Costume - Color C', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+Bandai+Phụ+Kiện+30MS+Option+Parts+Set+23+-+Valkyrie+Costume+-+Color+C', 'Bộ phụ kiện Option Parts cho dòng 30MM/30MS, dùng để thay đổi trang phục, giáp và trang bị cho mô hình.', 'Bandai', null, 'Nhựa PS', null, null, 269000, 21, 5, false, 0],
      [126, 5, 'MM007', 'Mô Hình Lắp Ráp 30MF DLROSKELETON Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+30MF+DLROSKELETON+Bandai', 'Mô hình lắp ráp thuộc dòng 30 Minutes (30MM/30MS/30MF) của Bandai, thiết kế dạng module dễ thay đổi phụ kiện.', 'Bandai', null, 'Nhựa PS', null, null, 269000, 15, 5, false, 0],
      [127, 5, 'MM008', 'Phụ Kiện Mô Hình Lắp Ráp 30MS Option Parts Set 25 - Turbo Costume Gamma - Color C Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Phụ+Kiện+Mô+Hình+Lắp+Ráp+30MS+Option+Parts+Set+25+-+Turbo+Costume+Gamma+-+Color+C+Bandai', 'Bộ phụ kiện Option Parts cho dòng 30MM/30MS, dùng để thay đổi trang phục, giáp và trang bị cho mô hình.', 'Bandai', null, 'Nhựa PS', null, null, 246000, 20, 5, false, 0],
      [128, 5, 'MM009', 'Phụ Kiện Mô hình lắp ráp 30MS Option Parts Set 21 - Sprint Costume - Color B Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Phụ+Kiện+Mô+hình+lắp+ráp+30MS+Option+Parts+Set+21+-+Sprint+Costume+-+Color+B+Bandai', 'Bộ phụ kiện Option Parts cho dòng 30MM/30MS, dùng để thay đổi trang phục, giáp và trang bị cho mô hình.', 'Bandai', null, 'Nhựa PS', null, null, 254000, 16, 5, false, 0],
      [129, 5, 'MM010', 'Mô hình lắp ráp 30MS SIS-Gc69r Alka-Carti - Quartet Form Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+lắp+ráp+30MS+SIS-Gc69r+Alka-Carti+-+Quartet+Form+Bandai', 'Mô hình lắp ráp thuộc dòng 30 Minutes (30MM/30MS/30MF) của Bandai, thiết kế dạng module dễ thay đổi phụ kiện.', 'Bandai', null, 'Nhựa PS', null, null, 346000, 5, 5, false, 0],
      [130, 5, 'MM011', 'Mô hình lắp ráp 30MM 1/144 eEXM-30 ESPOSSITO β Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+lắp+ráp+30MM+1%2F144+eEXM-30+ESPOSSITO+β+Bandai', 'Mô hình lắp ráp thuộc dòng 30 Minutes (30MM/30MS/30MF) của Bandai, thiết kế dạng module dễ thay đổi phụ kiện.', 'Bandai', '1/144', 'Nhựa PS', null, null, 200000, 13, 5, false, 0],
      [131, 5, 'MM012', 'Mô Hình Lắp Ráp 30MS SIS-N00 Sourei (Color B) Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+30MS+SIS-N00+Sourei+(Color+B)+Bandai', 'Mô hình lắp ráp thuộc dòng 30 Minutes (30MM/30MS/30MF) của Bandai, thiết kế dạng module dễ thay đổi phụ kiện.', 'Bandai', null, 'Nhựa PS', null, null, 523000, 9, 5, false, 0],
      [132, 5, 'MM013', 'Mô Hình Lắp Ráp 30MS Fate/Grand Order Altria Caster Girl', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+30MS+Fate%2FGrand+Order+Altria+Caster+Girl', 'Mô hình lắp ráp thuộc dòng 30 Minutes (30MM/30MS/30MF) của Bandai, thiết kế dạng module dễ thay đổi phụ kiện.', 'Bandai', null, 'Nhựa PS', null, null, 615000, 10, 5, false, 0],
      [133, 5, 'MM014', '30MM Optional Armor for Commander [Cielnova/White] Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=30MM+Optional+Armor+for+Commander+[Cielnova%2FWhite]+Bandai', 'Bộ phụ kiện Option Parts cho dòng 30MM/30MS, dùng để thay đổi trang phục, giáp và trang bị cho mô hình.', 'Bandai', null, 'Nhựa PS', null, null, 108000, 34, 5, false, 0],
      [134, 5, 'MM015', 'Mô hình lắp ráp 30MM 65 EXM-H15D Acerby Type D 30 Minutes Sisters Bandai Plastic model 1/144 30MS Promax', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+hình+lắp+ráp+30MM+65+EXM-H15D+Acerby+Type+D+30+Minutes+Sisters+Bandai+Plastic+model+1%2F144+30MS+Promax', 'Mô hình lắp ráp thuộc dòng 30 Minutes (30MM/30MS/30MF) của Bandai, thiết kế dạng module dễ thay đổi phụ kiện.', 'Bandai', '1/144', 'Nhựa PS', null, null, 384000, 21, 5, false, 30],
      [135, 5, 'MM016', 'Bandai Phụ Kiện Mô Hình 30MS Option Parts Set 16 (Fairy Costume) [Color B] Promax', 'https://placehold.co/600x600/e8590c/ffffff?text=Bandai+Phụ+Kiện+Mô+Hình+30MS+Option+Parts+Set+16+(Fairy+Costume)+[Color+B]+Promax', 'Bộ phụ kiện Option Parts cho dòng 30MM/30MS, dùng để thay đổi trang phục, giáp và trang bị cho mô hình.', 'Bandai', null, 'Nhựa PS', null, null, 222000, 21, 5, false, 0],
      [136, 5, 'MM017', 'Mô Hình Lắp Ráp 30 Minutes Missions 30MM 1/144 Extended Armament Vehicle ( TANK Ver. )[ BROWN ] Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+30+Minutes+Missions+30MM+1%2F144+Extended+Armament+Vehicle+(+TANK+Ver.+)[+BROWN+]+Bandai', 'Mô hình lắp ráp thuộc dòng 30 Minutes (30MM/30MS/30MF) của Bandai, thiết kế dạng module dễ thay đổi phụ kiện.', 'Bandai', '1/144', 'Nhựa PS', null, null, 153000, 25, 5, false, 0],
      [137, 5, 'MM018', 'Mô Hình Lắp Ráp Phụ Kiện 30MM 1144 Option Parts Set 19 (Multi Shield) Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+Phụ+Kiện+30MM+1144+Option+Parts+Set+19+(Multi+Shield)+Bandai', 'Bộ phụ kiện Option Parts cho dòng 30MM/30MS, dùng để thay đổi trang phục, giáp và trang bị cho mô hình.', 'Bandai', '1/144', 'Nhựa PS', null, null, 138000, 35, 5, false, 0],
      [138, 5, 'MM019', 'Mô Hình Lắp Ráp Gundam 30MS Option Parts Set 9 (Commander Costume) [Color C] Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+Gundam+30MS+Option+Parts+Set+9+(Commander+Costume)+[Color+C]+Bandai', 'Bộ phụ kiện Option Parts cho dòng 30MM/30MS, dùng để thay đổi trang phục, giáp và trang bị cho mô hình.', 'Bandai', null, 'Nhựa PS', null, null, 230000, 10, 5, false, 0],
      [139, 5, 'MM020', 'Mô Hình Lắp Ráp 30MS SIS-H00 Sestieh [Color C] Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+30MS+SIS-H00+Sestieh+[Color+C]+Bandai', 'Mô hình lắp ráp thuộc dòng 30 Minutes (30MM/30MS/30MF) của Bandai, thiết kế dạng module dễ thay đổi phụ kiện.', 'Bandai', null, 'Nhựa PS', null, null, 346000, 15, 5, false, 0],
      [140, 5, 'MM021', 'Mô Hình Phụ Kiện Reaper Armor Option Parts Set 10 30MS Bandai 30 Minutes Sisters Promax', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Phụ+Kiện+Reaper+Armor+Option+Parts+Set+10+30MS+Bandai+30+Minutes+Sisters+Promax', 'Bộ phụ kiện Option Parts cho dòng 30MM/30MS, dùng để thay đổi trang phục, giáp và trang bị cho mô hình.', 'Bandai', null, 'Nhựa PS', null, null, 138000, 31, 5, false, 0],
      [141, 5, 'MM022', 'Mô Hình Lắp Ráp Bandai 30MS SIS-K00 MicoLuLu – Plastic Model Kit', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+Bandai+30MS+SIS-K00+MicoLuLu+–+Plastic+Model+Kit', 'Mô hình lắp ráp thuộc dòng 30 Minutes (30MM/30MS/30MF) của Bandai, thiết kế dạng module dễ thay đổi phụ kiện.', 'Bandai', null, 'Nhựa PS', null, null, 446000, 7, 5, false, 0],
      [142, 5, 'MM023', 'Mô Hình Lắp Ráp Phụ Kiện 30MS Option Parts Set 17 (Aider Costume) [Color A] OP-17 Bandai', 'https://placehold.co/600x600/e8590c/ffffff?text=Mô+Hình+Lắp+Ráp+Phụ+Kiện+30MS+Option+Parts+Set+17+(Aider+Costume)+[Color+A]+OP-17+Bandai', 'Bộ phụ kiện Option Parts cho dòng 30MM/30MS, dùng để thay đổi trang phục, giáp và trang bị cho mô hình.', 'Bandai', null, 'Nhựa PS', null, null, 262000, 12, 5, false, 0],
      [143, 6, 'PK001', 'Bộ Tấm Chà Nhám Sợi Carbon STEDI MS-D4 – 4 Tấm/Bộ', 'https://placehold.co/600x600/e8590c/ffffff?text=Bộ+Tấm+Chà+Nhám+Sợi+Carbon+STEDI+MS-D4+–+4+Tấm%2FBộ', 'Dụng cụ chà nhám dùng xử lý bề mặt và làm phẳng chi tiết mô hình.', 'Stedi', null, 'Sợi carbon', 'Bộ 4 tấm', null, 52000, 18, 5, false, 0],
      [144, 6, 'PK002', 'Bộ Thanh Chà Nhám Sợi Carbon STEDI MS-D2 – 3 Kích Thước', 'https://placehold.co/600x600/e8590c/ffffff?text=Bộ+Thanh+Chà+Nhám+Sợi+Carbon+STEDI+MS-D2+–+3+Kích+Thước', 'Dụng cụ chà nhám dùng xử lý bề mặt và làm phẳng chi tiết mô hình.', 'Stedi', null, 'Sợi carbon', null, null, 44000, 33, 5, false, 0],
      [145, 6, 'PK003', 'Giũa Thuỷ Tinh Tam Giác Stedi HG-03 #600–800 New Glass File', 'https://placehold.co/600x600/e8590c/ffffff?text=Giũa+Thuỷ+Tinh+Tam+Giác+Stedi+HG-03+%23600–800+New+Glass+File', 'Dũa thủy tinh dùng xử lý bề mặt, làm nhẵn vết cắt trên mô hình.', 'Stedi', '1/144', 'Thủy tinh', null, null, 111000, 17, 5, false, 0],
      [146, 6, 'PK004', 'Dũa Thuỷ Tinh Bản Rộng Stedi HG-02 #600–800 – New Glass File', 'https://placehold.co/600x600/e8590c/ffffff?text=Dũa+Thuỷ+Tinh+Bản+Rộng+Stedi+HG-02+%23600–800+–+New+Glass+File', 'Dũa thủy tinh dùng xử lý bề mặt, làm nhẵn vết cắt trên mô hình.', 'Stedi', '1/144', 'Thủy tinh', null, null, 89000, 15, 5, false, 0],
      [147, 6, 'PK005', 'Dũa Thuỷ Tinh STEDI HG-01 #600–800 – New Glass File', 'https://placehold.co/600x600/e8590c/ffffff?text=Dũa+Thuỷ+Tinh+STEDI+HG-01+%23600–800+–+New+Glass+File', 'Dũa thủy tinh dùng xử lý bề mặt, làm nhẵn vết cắt trên mô hình.', 'Stedi', '1/144', 'Thủy tinh', null, null, 119000, 25, 5, false, 25],
      [148, 6, 'PK006', 'Nhíp Cao Cấp DSPIAE AT-TZ04 – Nhíp Đầu Cong Cho Gunpla, Model Kit, Decal', 'https://placehold.co/600x600/e8590c/ffffff?text=Nhíp+Cao+Cấp+DSPIAE+AT-TZ04+–+Nhíp+Đầu+Cong+Cho+Gunpla,+Model+Kit,+Decal', 'Nhíp chuyên dụng để gắp decal và chi tiết nhỏ khi lắp ráp mô hình.', 'DSPIAE', null, null, null, null, 148000, 18, 5, false, 15],
      [149, 6, 'PK007', 'Kìm Cắt Mô Hình 1 Lưỡi GK MS-113 Stedi – Kìm Cắt Lưỡi Đơn Cao Cấp', 'https://placehold.co/600x600/e8590c/ffffff?text=Kìm+Cắt+Mô+Hình+1+Lưỡi+GK+MS-113+Stedi+–+Kìm+Cắt+Lưỡi+Đơn+Cao+Cấp', 'Kìm cắt chuyên dụng giúp cắt chi tiết khỏi runner sạch, ít để lại vết.', 'Stedi', null, null, null, null, 356000, 21, 5, false, 25],
      [150, 6, 'PK008', 'Bộ nhám mài dũa cho mô hình MS-E1200 1500 Stedi', 'https://placehold.co/600x600/e8590c/ffffff?text=Bộ+nhám+mài+dũa+cho+mô+hình+MS-E1200+1500+Stedi', 'Dũa thủy tinh dùng xử lý bề mặt, làm nhẵn vết cắt trên mô hình.', 'Stedi', null, null, null, null, 74000, 9, 5, false, 0],
      [151, 6, 'PK009', 'Kìm cắt mô hình 1 lưỡi MS-108, MS-108L Stedi (Thuận tiện cho ae tay trái)', 'https://placehold.co/600x600/e8590c/ffffff?text=Kìm+cắt+mô+hình+1+lưỡi+MS-108,+MS-108L+Stedi+(Thuận+tiện+cho+ae+tay+trái)', 'Kìm cắt chuyên dụng giúp cắt chi tiết khỏi runner sạch, ít để lại vết.', 'Stedi', null, null, null, null, 415000, 6, 5, false, 0],
      [152, 6, 'PK010', 'Khoan tay mô hình màu đỏ PIN VISE set Hobby Mio HMZ-01', 'https://placehold.co/600x600/e8590c/ffffff?text=Khoan+tay+mô+hình+màu+đỏ+PIN+VISE+set+Hobby+Mio+HMZ-01', 'Dụng cụ khoan tay dùng để khoan lỗ, xử lý chi tiết khi sửa và độ mô hình.', 'Hobby Mio', null, null, null, null, 119000, 33, 5, false, 0],
      [153, 6, 'PK011', 'Băng keo che sơn DSPIAE cao cấp series MT 2MM-20MM', 'https://placehold.co/600x600/e8590c/ffffff?text=Băng+keo+che+sơn+DSPIAE+cao+cấp+series+MT+2MM-20MM', 'Băng keo che sơn nhiều kích thước, hỗ trợ che chắn khi phun và tô sơn mô hình.', 'DSPIAE', null, null, null, null, 26000, 17, 5, false, 0],
      [154, 6, 'PK012', 'Máy lắc sơn từ tính lắc tốc độ cao MS-01LE DSPIAE - Dụng Cụ Pha Sơn', 'https://placehold.co/600x600/e8590c/ffffff?text=Máy+lắc+sơn+từ+tính+lắc+tốc+độ+cao+MS-01LE+DSPIAE+-+Dụng+Cụ+Pha+Sơn', 'Máy lắc sơn từ tính giúp pha trộn sơn đều, dùng khi sơn mô hình.', 'DSPIAE', null, null, null, null, 296000, 20, 5, false, 0],
      [155, 6, 'PK013', 'Nhíp Cao Cấp DSPIAE AT-TZ02 – Nhíp Đầu Dẹp Cho Gunpla, Model Kit, Decal', 'https://placehold.co/600x600/e8590c/ffffff?text=Nhíp+Cao+Cấp+DSPIAE+AT-TZ02+–+Nhíp+Đầu+Dẹp+Cho+Gunpla,+Model+Kit,+Decal', 'Nhíp chuyên dụng để gắp decal và chi tiết nhỏ khi lắp ráp mô hình.', 'DSPIAE', null, null, null, null, 148000, 31, 5, false, 20],
      [156, 6, 'PK014', 'Nhíp Cao Cấp DSPIAE AT-TZ03 – Nhíp Đầu Thẳng Cho Gunpla, Model Kit, Decal', 'https://placehold.co/600x600/e8590c/ffffff?text=Nhíp+Cao+Cấp+DSPIAE+AT-TZ03+–+Nhíp+Đầu+Thẳng+Cho+Gunpla,+Model+Kit,+Decal', 'Nhíp chuyên dụng để gắp decal và chi tiết nhỏ khi lắp ráp mô hình.', 'DSPIAE', null, null, null, null, 148000, 36, 5, false, 15],
      [157, 6, 'PK015', 'Nhíp Cao Cấp DSPIAE AT-TZ01 – Nhíp Đầu Nhọn Cho Gunpla, Model Kit, Decal', 'https://placehold.co/600x600/e8590c/ffffff?text=Nhíp+Cao+Cấp+DSPIAE+AT-TZ01+–+Nhíp+Đầu+Nhọn+Cho+Gunpla,+Model+Kit,+Decal', 'Nhíp chuyên dụng để gắp decal và chi tiết nhỏ khi lắp ráp mô hình.', 'DSPIAE', null, null, null, null, 156000, 16, 5, false, 19],
      [158, 6, 'PK016', 'Bộ khoan tay hợp kim nhôm chính xác kèm mũi khoan DSPIAE AT-SHD', 'https://placehold.co/600x600/e8590c/ffffff?text=Bộ+khoan+tay+hợp+kim+nhôm+chính+xác+kèm+mũi+khoan+DSPIAE+AT-SHD', 'Dụng cụ khoan tay dùng để khoan lỗ, xử lý chi tiết khi sửa và độ mô hình.', 'DSPIAE', null, 'Hợp kim nhôm', null, null, 385000, 18, 5, false, 17],
      [159, 6, 'PK017', 'Combo Dụng Cụ Lắp Ráp Mô Hình Hobby Mio Craft Tool Set (15 món) Hobby Mio', 'https://placehold.co/600x600/e8590c/ffffff?text=Combo+Dụng+Cụ+Lắp+Ráp+Mô+Hình+Hobby+Mio+Craft+Tool+Set+(15+món)+Hobby+Mio', 'Bộ dụng cụ hỗ trợ lắp ráp, sơn và sửa mô hình.', 'Hobby Mio', null, null, '15 món', null, 444000, 13, 5, false, 0]
    ],

    // [id, import_date, status, note, created_at, completed_at]
    import_receipts: [
      [1, '2026-09-02', 'completed', 'Nhập Gundam đợt 1', '2026-09-02 08:00', '2026-09-02 16:00'],
      [2, '2026-09-04', 'completed', 'Nhập mô hình One Piece', '2026-09-04 08:00', '2026-09-04 16:00'],
      [3, '2026-09-06', 'completed', 'Nhập Metal Build', '2026-09-06 08:00', '2026-09-06 16:00'],
      [4, '2026-09-08', 'completed', 'Nhập mô hình lắp ráp Bandai và 30MM - 30MS', '2026-09-08 08:00', '2026-09-08 16:00'],
      [5, '2026-09-10', 'completed', 'Nhập dụng cụ và phụ kiện', '2026-09-10 08:00', '2026-09-10 16:00'],
      [6, '2026-09-30', 'completed', 'Nhập bổ sung hàng bán chạy đợt 1', '2026-09-30 08:00', '2026-09-30 16:00'],
      [7, '2026-10-14', 'completed', 'Nhập bổ sung hàng sắp hết đợt 2', '2026-10-14 08:00', '2026-10-14 16:00'],
      [8, '2026-10-29', 'draft', 'Nhập bổ sung hàng sắp hết (phiếu nháp)', '2026-10-29 08:00', null],
      [9, '2026-10-31', 'draft', 'Đặt thêm hàng Metal Build và 30MM (phiếu nháp)', '2026-10-31 08:00', null]
    ],

    // [id, receipt_id, product_id, quantity, import_price]
    import_receipt_items: [
      [1, 1, 1, 33, 111000], [2, 1, 2, 16, 255000], [3, 1, 3, 21, 239000],
      [4, 1, 4, 24, 224000], [5, 1, 5, 11, 167000], [6, 1, 6, 36, 144000],
      [7, 1, 7, 16, 208000], [8, 1, 8, 34, 144000], [9, 1, 9, 22, 135000],
      [10, 1, 10, 24, 143000], [11, 1, 11, 25, 239000], [12, 1, 12, 16, 191000],
      [13, 1, 13, 20, 191000], [14, 1, 14, 24, 167000], [15, 1, 15, 17, 159000],
      [16, 1, 16, 23, 103000], [17, 1, 17, 21, 95000], [18, 1, 18, 15, 312000],
      [19, 1, 19, 17, 135000], [20, 1, 20, 29, 127000], [21, 1, 21, 14, 479000],
      [22, 1, 22, 26, 18000], [23, 1, 23, 16, 192000], [24, 1, 24, 25, 239000],
      [25, 1, 25, 5, 1200000], [26, 1, 26, 9, 880000], [27, 1, 27, 8, 1840000],
      [28, 1, 28, 12, 839000], [29, 1, 29, 12, 439000], [30, 1, 30, 16, 319000],
      [31, 1, 31, 7, 799000], [32, 1, 32, 12, 559000], [33, 1, 33, 13, 735000],
      [34, 1, 34, 19, 319000], [35, 1, 35, 9, 519000], [36, 1, 36, 7, 544000],
      [37, 1, 37, 11, 559000], [38, 1, 38, 36, 56000], [39, 1, 39, 10, 1119000],
      [40, 1, 40, 22, 359000], [41, 1, 41, 12, 799000], [42, 1, 42, 9, 959000],
      [43, 1, 43, 12, 1039000], [44, 1, 44, 12, 183000], [45, 1, 45, 12, 480000],
      [46, 1, 46, 12, 784000], [47, 1, 47, 10, 304000], [48, 1, 48, 13, 800000],
      [49, 2, 49, 16, 245000], [50, 2, 50, 13, 215000], [51, 2, 51, 26, 138000],
      [52, 2, 52, 40, 138000], [53, 2, 53, 15, 138000], [54, 2, 54, 26, 138000],
      [55, 2, 55, 21, 230000], [56, 2, 56, 6, 438000], [57, 2, 57, 18, 230000],
      [58, 2, 58, 8, 461000], [59, 2, 59, 11, 284000], [60, 2, 60, 23, 307000],
      [61, 2, 61, 15, 384000], [62, 2, 62, 10, 661000], [63, 2, 63, 12, 284000],
      [64, 2, 64, 14, 292000], [65, 2, 65, 27, 130000], [66, 2, 66, 36, 130000],
      [67, 2, 67, 11, 661000], [68, 2, 68, 25, 231000], [69, 2, 69, 15, 276000],
      [70, 2, 70, 30, 108000], [71, 2, 71, 19, 154000], [72, 2, 72, 20, 153000],
      [73, 3, 73, 2, 2750000], [74, 3, 74, 3, 1542000], [75, 3, 75, 2, 2750000],
      [76, 3, 76, 2, 3167000], [77, 3, 77, 4, 4833000], [78, 3, 78, 5, 5417000],
      [79, 3, 79, 2, 5417000], [80, 3, 80, 13, 1042000], [81, 3, 81, 3, 11455000],
      [82, 3, 82, 3, 11455000], [83, 3, 83, 4, 2167000], [84, 3, 84, 8, 2083000],
      [85, 3, 85, 7, 2083000], [86, 3, 86, 5, 3082000], [87, 3, 87, 4, 1666000],
      [88, 3, 88, 3, 1666000], [89, 3, 89, 4, 2167000], [90, 3, 90, 4, 3000000],
      [91, 3, 91, 11, 958000], [92, 3, 92, 5, 2500000], [93, 3, 93, 2, 3000000],
      [94, 3, 94, 16, 74000], [95, 3, 95, 7, 1917000], [96, 3, 96, 7, 1666000],
      [97, 4, 97, 11, 416000], [98, 4, 98, 24, 399000], [99, 4, 99, 11, 399000],
      [100, 4, 100, 16, 399000], [101, 4, 101, 18, 399000], [102, 4, 102, 11, 639000],
      [103, 4, 103, 7, 680000], [104, 4, 104, 18, 208000], [105, 4, 105, 8, 584000],
      [106, 4, 106, 23, 128000], [107, 4, 107, 24, 176000], [108, 4, 108, 9, 440000],
      [109, 4, 109, 12, 600000], [110, 4, 110, 7, 1160000], [111, 4, 111, 14, 520000],
      [112, 4, 112, 11, 520000], [113, 4, 113, 9, 440000], [114, 4, 114, 7, 440000],
      [115, 4, 115, 10, 736000], [116, 4, 116, 8, 760000], [117, 4, 117, 6, 960000],
      [118, 4, 118, 6, 680000], [119, 4, 119, 12, 496000], [120, 4, 120, 24, 307000],
      [121, 4, 121, 11, 200000], [122, 4, 122, 20, 346000], [123, 4, 123, 17, 269000],
      [124, 4, 124, 18, 331000], [125, 4, 125, 25, 269000], [126, 4, 126, 16, 269000],
      [127, 4, 127, 20, 246000], [128, 4, 128, 20, 254000], [129, 4, 129, 10, 346000],
      [130, 4, 130, 14, 200000], [131, 4, 131, 10, 523000], [132, 4, 132, 11, 615000],
      [133, 4, 133, 36, 108000], [134, 4, 134, 21, 384000], [135, 4, 135, 22, 222000],
      [136, 4, 136, 27, 153000], [137, 4, 137, 35, 138000], [138, 4, 138, 11, 230000],
      [139, 4, 139, 17, 346000], [140, 4, 140, 31, 138000], [141, 4, 141, 7, 446000],
      [142, 4, 142, 16, 262000], [143, 5, 143, 19, 52000], [144, 5, 144, 36, 44000],
      [145, 5, 145, 18, 111000], [146, 5, 146, 19, 89000], [147, 5, 147, 25, 119000],
      [148, 5, 148, 18, 148000], [149, 5, 149, 21, 356000], [150, 5, 150, 15, 74000],
      [151, 5, 151, 13, 415000], [152, 5, 152, 36, 119000], [153, 5, 153, 21, 26000],
      [154, 5, 154, 21, 296000], [155, 5, 155, 31, 148000], [156, 5, 156, 36, 148000],
      [157, 5, 157, 16, 156000], [158, 5, 158, 8, 385000], [159, 5, 159, 13, 444000],
      [160, 6, 56, 9, 438000], [161, 6, 73, 4, 2750000], [162, 6, 74, 6, 1542000],
      [163, 6, 75, 3, 2750000], [164, 6, 76, 2, 3167000], [165, 6, 79, 2, 5417000],
      [166, 6, 80, 5, 1042000], [167, 6, 81, 3, 11455000], [168, 6, 89, 6, 2167000],
      [169, 6, 90, 4, 3000000], [170, 6, 93, 3, 3000000], [171, 7, 77, 4, 4833000],
      [172, 7, 82, 4, 11455000], [173, 7, 84, 6, 2083000], [174, 7, 88, 5, 1666000],
      [175, 7, 158, 10, 385000], [176, 8, 25, 6, 1164000], [177, 8, 35, 12, 503000],
      [178, 8, 36, 6, 528000], [179, 8, 76, 2, 3072000], [180, 8, 78, 4, 5254000],
      [181, 8, 79, 2, 5254000], [182, 8, 83, 6, 2102000], [183, 8, 87, 3, 1616000],
      [184, 9, 73, 2, 2695000], [185, 9, 74, 3, 1511000], [186, 9, 75, 4, 2695000],
      [187, 9, 77, 5, 4736000], [188, 9, 120, 3, 301000], [189, 9, 121, 2, 196000]
    ],

    // [id, product_id, movement_date, movement_type, quantity, ref_type, ref_id]
    // import: phiếu nhập hoàn thành | export: đơn đã xác nhận/đang giao/đã giao | cancel_return: đơn hủy sau khi đã xác nhận
    stock_movements: [
      [1, 1, '2026-09-02', 'import', 33, 'import_receipt', 1], [2, 2, '2026-09-02', 'import', 16, 'import_receipt', 1],
      [3, 3, '2026-09-02', 'import', 21, 'import_receipt', 1], [4, 4, '2026-09-02', 'import', 24, 'import_receipt', 1],
      [5, 5, '2026-09-02', 'import', 11, 'import_receipt', 1], [6, 6, '2026-09-02', 'import', 36, 'import_receipt', 1],
      [7, 7, '2026-09-02', 'import', 16, 'import_receipt', 1], [8, 8, '2026-09-02', 'import', 34, 'import_receipt', 1],
      [9, 9, '2026-09-02', 'import', 22, 'import_receipt', 1], [10, 10, '2026-09-02', 'import', 24, 'import_receipt', 1],
      [11, 11, '2026-09-02', 'import', 25, 'import_receipt', 1], [12, 12, '2026-09-02', 'import', 16, 'import_receipt', 1],
      [13, 13, '2026-09-02', 'import', 20, 'import_receipt', 1], [14, 14, '2026-09-02', 'import', 24, 'import_receipt', 1],
      [15, 15, '2026-09-02', 'import', 17, 'import_receipt', 1], [16, 16, '2026-09-02', 'import', 23, 'import_receipt', 1],
      [17, 17, '2026-09-02', 'import', 21, 'import_receipt', 1], [18, 18, '2026-09-02', 'import', 15, 'import_receipt', 1],
      [19, 19, '2026-09-02', 'import', 17, 'import_receipt', 1], [20, 20, '2026-09-02', 'import', 29, 'import_receipt', 1],
      [21, 21, '2026-09-02', 'import', 14, 'import_receipt', 1], [22, 22, '2026-09-02', 'import', 26, 'import_receipt', 1],
      [23, 23, '2026-09-02', 'import', 16, 'import_receipt', 1], [24, 24, '2026-09-02', 'import', 25, 'import_receipt', 1],
      [25, 25, '2026-09-02', 'import', 5, 'import_receipt', 1], [26, 26, '2026-09-02', 'import', 9, 'import_receipt', 1],
      [27, 27, '2026-09-02', 'import', 8, 'import_receipt', 1], [28, 28, '2026-09-02', 'import', 12, 'import_receipt', 1],
      [29, 29, '2026-09-02', 'import', 12, 'import_receipt', 1], [30, 30, '2026-09-02', 'import', 16, 'import_receipt', 1],
      [31, 31, '2026-09-02', 'import', 7, 'import_receipt', 1], [32, 32, '2026-09-02', 'import', 12, 'import_receipt', 1],
      [33, 33, '2026-09-02', 'import', 13, 'import_receipt', 1], [34, 34, '2026-09-02', 'import', 19, 'import_receipt', 1],
      [35, 35, '2026-09-02', 'import', 9, 'import_receipt', 1], [36, 36, '2026-09-02', 'import', 7, 'import_receipt', 1],
      [37, 37, '2026-09-02', 'import', 11, 'import_receipt', 1], [38, 38, '2026-09-02', 'import', 36, 'import_receipt', 1],
      [39, 39, '2026-09-02', 'import', 10, 'import_receipt', 1], [40, 40, '2026-09-02', 'import', 22, 'import_receipt', 1],
      [41, 41, '2026-09-02', 'import', 12, 'import_receipt', 1], [42, 42, '2026-09-02', 'import', 9, 'import_receipt', 1],
      [43, 43, '2026-09-02', 'import', 12, 'import_receipt', 1], [44, 44, '2026-09-02', 'import', 12, 'import_receipt', 1],
      [45, 45, '2026-09-02', 'import', 12, 'import_receipt', 1], [46, 46, '2026-09-02', 'import', 12, 'import_receipt', 1],
      [47, 47, '2026-09-02', 'import', 10, 'import_receipt', 1], [48, 48, '2026-09-02', 'import', 13, 'import_receipt', 1],
      [49, 49, '2026-09-04', 'import', 16, 'import_receipt', 2], [50, 50, '2026-09-04', 'import', 13, 'import_receipt', 2],
      [51, 51, '2026-09-04', 'import', 26, 'import_receipt', 2], [52, 52, '2026-09-04', 'import', 40, 'import_receipt', 2],
      [53, 53, '2026-09-04', 'import', 15, 'import_receipt', 2], [54, 54, '2026-09-04', 'import', 26, 'import_receipt', 2],
      [55, 55, '2026-09-04', 'import', 21, 'import_receipt', 2], [56, 56, '2026-09-04', 'import', 6, 'import_receipt', 2],
      [57, 57, '2026-09-04', 'import', 18, 'import_receipt', 2], [58, 58, '2026-09-04', 'import', 8, 'import_receipt', 2],
      [59, 59, '2026-09-04', 'import', 11, 'import_receipt', 2], [60, 60, '2026-09-04', 'import', 23, 'import_receipt', 2],
      [61, 61, '2026-09-04', 'import', 15, 'import_receipt', 2], [62, 62, '2026-09-04', 'import', 10, 'import_receipt', 2],
      [63, 63, '2026-09-04', 'import', 12, 'import_receipt', 2], [64, 64, '2026-09-04', 'import', 14, 'import_receipt', 2],
      [65, 65, '2026-09-04', 'import', 27, 'import_receipt', 2], [66, 66, '2026-09-04', 'import', 36, 'import_receipt', 2],
      [67, 67, '2026-09-04', 'import', 11, 'import_receipt', 2], [68, 68, '2026-09-04', 'import', 25, 'import_receipt', 2],
      [69, 69, '2026-09-04', 'import', 15, 'import_receipt', 2], [70, 70, '2026-09-04', 'import', 30, 'import_receipt', 2],
      [71, 71, '2026-09-04', 'import', 19, 'import_receipt', 2], [72, 72, '2026-09-04', 'import', 20, 'import_receipt', 2],
      [73, 73, '2026-09-06', 'import', 2, 'import_receipt', 3], [74, 74, '2026-09-06', 'import', 3, 'import_receipt', 3],
      [75, 75, '2026-09-06', 'import', 2, 'import_receipt', 3], [76, 76, '2026-09-06', 'import', 2, 'import_receipt', 3],
      [77, 77, '2026-09-06', 'import', 4, 'import_receipt', 3], [78, 78, '2026-09-06', 'import', 5, 'import_receipt', 3],
      [79, 79, '2026-09-06', 'import', 2, 'import_receipt', 3], [80, 80, '2026-09-06', 'import', 13, 'import_receipt', 3],
      [81, 81, '2026-09-06', 'import', 3, 'import_receipt', 3], [82, 82, '2026-09-06', 'import', 3, 'import_receipt', 3],
      [83, 83, '2026-09-06', 'import', 4, 'import_receipt', 3], [84, 84, '2026-09-06', 'import', 8, 'import_receipt', 3],
      [85, 85, '2026-09-06', 'import', 7, 'import_receipt', 3], [86, 86, '2026-09-06', 'import', 5, 'import_receipt', 3],
      [87, 87, '2026-09-06', 'import', 4, 'import_receipt', 3], [88, 88, '2026-09-06', 'import', 3, 'import_receipt', 3],
      [89, 89, '2026-09-06', 'import', 4, 'import_receipt', 3], [90, 90, '2026-09-06', 'import', 4, 'import_receipt', 3],
      [91, 91, '2026-09-06', 'import', 11, 'import_receipt', 3], [92, 92, '2026-09-06', 'import', 5, 'import_receipt', 3],
      [93, 93, '2026-09-06', 'import', 2, 'import_receipt', 3], [94, 94, '2026-09-06', 'import', 16, 'import_receipt', 3],
      [95, 95, '2026-09-06', 'import', 7, 'import_receipt', 3], [96, 96, '2026-09-06', 'import', 7, 'import_receipt', 3],
      [97, 97, '2026-09-08', 'import', 11, 'import_receipt', 4], [98, 98, '2026-09-08', 'import', 24, 'import_receipt', 4],
      [99, 99, '2026-09-08', 'import', 11, 'import_receipt', 4], [100, 100, '2026-09-08', 'import', 16, 'import_receipt', 4],
      [101, 101, '2026-09-08', 'import', 18, 'import_receipt', 4], [102, 102, '2026-09-08', 'import', 11, 'import_receipt', 4],
      [103, 103, '2026-09-08', 'import', 7, 'import_receipt', 4], [104, 104, '2026-09-08', 'import', 18, 'import_receipt', 4],
      [105, 105, '2026-09-08', 'import', 8, 'import_receipt', 4], [106, 106, '2026-09-08', 'import', 23, 'import_receipt', 4],
      [107, 107, '2026-09-08', 'import', 24, 'import_receipt', 4], [108, 108, '2026-09-08', 'import', 9, 'import_receipt', 4],
      [109, 109, '2026-09-08', 'import', 12, 'import_receipt', 4], [110, 110, '2026-09-08', 'import', 7, 'import_receipt', 4],
      [111, 111, '2026-09-08', 'import', 14, 'import_receipt', 4], [112, 112, '2026-09-08', 'import', 11, 'import_receipt', 4],
      [113, 113, '2026-09-08', 'import', 9, 'import_receipt', 4], [114, 114, '2026-09-08', 'import', 7, 'import_receipt', 4],
      [115, 115, '2026-09-08', 'import', 10, 'import_receipt', 4], [116, 116, '2026-09-08', 'import', 8, 'import_receipt', 4],
      [117, 117, '2026-09-08', 'import', 6, 'import_receipt', 4], [118, 118, '2026-09-08', 'import', 6, 'import_receipt', 4],
      [119, 119, '2026-09-08', 'import', 12, 'import_receipt', 4], [120, 120, '2026-09-08', 'import', 24, 'import_receipt', 4],
      [121, 121, '2026-09-08', 'import', 11, 'import_receipt', 4], [122, 122, '2026-09-08', 'import', 20, 'import_receipt', 4],
      [123, 123, '2026-09-08', 'import', 17, 'import_receipt', 4], [124, 124, '2026-09-08', 'import', 18, 'import_receipt', 4],
      [125, 125, '2026-09-08', 'import', 25, 'import_receipt', 4], [126, 126, '2026-09-08', 'import', 16, 'import_receipt', 4],
      [127, 127, '2026-09-08', 'import', 20, 'import_receipt', 4], [128, 128, '2026-09-08', 'import', 20, 'import_receipt', 4],
      [129, 129, '2026-09-08', 'import', 10, 'import_receipt', 4], [130, 130, '2026-09-08', 'import', 14, 'import_receipt', 4],
      [131, 131, '2026-09-08', 'import', 10, 'import_receipt', 4], [132, 132, '2026-09-08', 'import', 11, 'import_receipt', 4],
      [133, 133, '2026-09-08', 'import', 36, 'import_receipt', 4], [134, 134, '2026-09-08', 'import', 21, 'import_receipt', 4],
      [135, 135, '2026-09-08', 'import', 22, 'import_receipt', 4], [136, 136, '2026-09-08', 'import', 27, 'import_receipt', 4],
      [137, 137, '2026-09-08', 'import', 35, 'import_receipt', 4], [138, 138, '2026-09-08', 'import', 11, 'import_receipt', 4],
      [139, 139, '2026-09-08', 'import', 17, 'import_receipt', 4], [140, 140, '2026-09-08', 'import', 31, 'import_receipt', 4],
      [141, 141, '2026-09-08', 'import', 7, 'import_receipt', 4], [142, 142, '2026-09-08', 'import', 16, 'import_receipt', 4],
      [143, 143, '2026-09-10', 'import', 19, 'import_receipt', 5], [144, 144, '2026-09-10', 'import', 36, 'import_receipt', 5],
      [145, 145, '2026-09-10', 'import', 18, 'import_receipt', 5], [146, 146, '2026-09-10', 'import', 19, 'import_receipt', 5],
      [147, 147, '2026-09-10', 'import', 25, 'import_receipt', 5], [148, 148, '2026-09-10', 'import', 18, 'import_receipt', 5],
      [149, 149, '2026-09-10', 'import', 21, 'import_receipt', 5], [150, 150, '2026-09-10', 'import', 15, 'import_receipt', 5],
      [151, 151, '2026-09-10', 'import', 13, 'import_receipt', 5], [152, 152, '2026-09-10', 'import', 36, 'import_receipt', 5],
      [153, 153, '2026-09-10', 'import', 21, 'import_receipt', 5], [154, 154, '2026-09-10', 'import', 21, 'import_receipt', 5],
      [155, 155, '2026-09-10', 'import', 31, 'import_receipt', 5], [156, 156, '2026-09-10', 'import', 36, 'import_receipt', 5],
      [157, 157, '2026-09-10', 'import', 16, 'import_receipt', 5], [158, 158, '2026-09-10', 'import', 8, 'import_receipt', 5],
      [159, 159, '2026-09-10', 'import', 13, 'import_receipt', 5], [160, 18, '2026-09-12', 'export', -2, 'order', 1],
      [161, 24, '2026-09-12', 'export', -2, 'order', 1], [162, 59, '2026-09-12', 'export', -1, 'order', 1],
      [163, 130, '2026-09-13', 'export', -1, 'order', 2], [164, 80, '2026-09-15', 'export', -1, 'order', 5],
      [165, 128, '2026-09-15', 'export', -1, 'order', 4], [166, 144, '2026-09-15', 'export', -2, 'order', 5],
      [167, 3, '2026-09-16', 'export', -1, 'order', 7], [168, 23, '2026-09-16', 'export', -1, 'order', 7],
      [169, 40, '2026-09-16', 'export', -2, 'order', 7], [170, 136, '2026-09-16', 'export', -1, 'order', 8],
      [171, 8, '2026-09-17', 'export', -2, 'order', 9], [172, 19, '2026-09-17', 'export', -2, 'order', 9],
      [173, 8, '2026-09-18', 'cancel_return', 2, 'order', 9], [174, 19, '2026-09-18', 'cancel_return', 2, 'order', 9],
      [175, 20, '2026-09-20', 'export', -1, 'order', 10], [176, 22, '2026-09-21', 'export', -4, 'order', 11],
      [177, 22, '2026-09-21', 'export', -1, 'order', 12], [178, 35, '2026-09-22', 'export', -1, 'order', 13],
      [179, 54, '2026-09-22', 'export', -2, 'order', 14], [180, 125, '2026-09-22', 'export', -1, 'order', 13],
      [181, 12, '2026-09-23', 'export', -1, 'order', 15], [182, 22, '2026-09-23', 'export', -2, 'order', 15],
      [183, 38, '2026-09-24', 'export', -1, 'order', 17], [184, 80, '2026-09-24', 'export', -1, 'order', 16],
      [185, 106, '2026-09-24', 'export', -1, 'order', 16], [186, 138, '2026-09-24', 'export', -2, 'order', 16],
      [187, 138, '2026-09-24', 'export', -1, 'order', 17], [188, 136, '2026-09-25', 'export', -1, 'order', 18],
      [189, 80, '2026-09-25', 'cancel_return', 1, 'order', 16], [190, 106, '2026-09-25', 'cancel_return', 1, 'order', 16],
      [191, 138, '2026-09-25', 'cancel_return', 2, 'order', 16], [192, 69, '2026-09-26', 'export', -1, 'order', 19],
      [193, 123, '2026-09-26', 'export', -1, 'order', 19], [194, 4, '2026-09-27', 'export', -1, 'order', 21],
      [195, 10, '2026-09-27', 'export', -1, 'order', 23], [196, 48, '2026-09-27', 'export', -1, 'order', 24],
      [197, 126, '2026-09-27', 'export', -1, 'order', 24], [198, 3, '2026-09-28', 'export', -1, 'order', 26],
      [199, 3, '2026-09-28', 'export', -3, 'order', 28], [200, 11, '2026-09-28', 'export', -1, 'order', 25],
      [201, 13, '2026-09-28', 'export', -1, 'order', 27], [202, 18, '2026-09-28', 'export', -2, 'order', 28],
      [203, 22, '2026-09-28', 'export', -2, 'order', 26], [204, 24, '2026-09-28', 'export', -2, 'order', 26],
      [205, 94, '2026-09-28', 'export', -3, 'order', 28], [206, 150, '2026-09-28', 'export', -3, 'order', 27],
      [207, 151, '2026-09-28', 'export', -1, 'order', 25], [208, 152, '2026-09-28', 'export', -2, 'order', 28],
      [209, 48, '2026-09-28', 'cancel_return', 1, 'order', 24], [210, 126, '2026-09-28', 'cancel_return', 1, 'order', 24],
      [211, 20, '2026-09-29', 'export', -1, 'order', 29], [212, 20, '2026-09-29', 'export', -1, 'order', 32],
      [213, 28, '2026-09-29', 'export', -3, 'order', 32], [214, 38, '2026-09-29', 'export', -1, 'order', 32],
      [215, 56, '2026-09-29', 'export', -3, 'order', 30], [216, 80, '2026-09-29', 'export', -3, 'order', 31],
      [217, 133, '2026-09-29', 'export', -2, 'order', 30], [218, 144, '2026-09-29', 'export', -1, 'order', 32],
      [219, 56, '2026-09-30', 'import', 9, 'import_receipt', 6], [220, 73, '2026-09-30', 'import', 4, 'import_receipt', 6],
      [221, 74, '2026-09-30', 'import', 6, 'import_receipt', 6], [222, 75, '2026-09-30', 'import', 3, 'import_receipt', 6],
      [223, 76, '2026-09-30', 'import', 2, 'import_receipt', 6], [224, 79, '2026-09-30', 'import', 2, 'import_receipt', 6],
      [225, 80, '2026-09-30', 'import', 5, 'import_receipt', 6], [226, 81, '2026-09-30', 'import', 3, 'import_receipt', 6],
      [227, 89, '2026-09-30', 'import', 6, 'import_receipt', 6], [228, 90, '2026-09-30', 'import', 4, 'import_receipt', 6],
      [229, 93, '2026-09-30', 'import', 3, 'import_receipt', 6], [230, 4, '2026-09-30', 'export', -1, 'order', 34],
      [231, 23, '2026-09-30', 'export', -1, 'order', 35], [232, 44, '2026-09-30', 'export', -1, 'order', 35],
      [233, 54, '2026-09-30', 'export', -4, 'order', 35], [234, 58, '2026-09-30', 'export', -1, 'order', 36],
      [235, 63, '2026-09-30', 'export', -3, 'order', 33], [236, 125, '2026-09-30', 'export', -1, 'order', 33],
      [237, 23, '2026-10-01', 'cancel_return', 1, 'order', 35], [238, 44, '2026-10-01', 'cancel_return', 1, 'order', 35],
      [239, 54, '2026-10-01', 'cancel_return', 4, 'order', 35], [240, 1, '2026-10-03', 'export', -3, 'order', 37],
      [241, 6, '2026-10-03', 'export', -2, 'order', 37], [242, 17, '2026-10-03', 'export', -1, 'order', 38],
      [243, 13, '2026-10-04', 'export', -2, 'order', 40], [244, 13, '2026-10-04', 'export', -1, 'order', 41],
      [245, 20, '2026-10-04', 'export', -1, 'order', 42], [246, 47, '2026-10-04', 'export', -1, 'order', 42],
      [247, 64, '2026-10-04', 'export', -3, 'order', 41], [248, 67, '2026-10-04', 'export', -3, 'order', 42],
      [249, 123, '2026-10-04', 'export', -4, 'order', 40], [250, 128, '2026-10-04', 'export', -1, 'order', 39],
      [251, 137, '2026-10-04', 'export', -4, 'order', 39], [252, 1, '2026-10-05', 'export', -1, 'order', 43],
      [253, 154, '2026-10-05', 'export', -1, 'order', 44], [254, 128, '2026-10-05', 'cancel_return', 1, 'order', 39],
      [255, 137, '2026-10-05', 'cancel_return', 4, 'order', 39], [256, 7, '2026-10-06', 'export', -1, 'order', 46],
      [257, 14, '2026-10-06', 'export', -1, 'order', 48], [258, 41, '2026-10-06', 'export', -1, 'order', 48],
      [259, 50, '2026-10-06', 'export', -1, 'order', 46], [260, 59, '2026-10-06', 'export', -1, 'order', 46],
      [261, 61, '2026-10-06', 'export', -2, 'order', 48], [262, 151, '2026-10-06', 'export', -3, 'order', 48],
      [263, 5, '2026-10-07', 'export', -1, 'order', 49], [264, 124, '2026-10-07', 'export', -3, 'order', 49],
      [265, 142, '2026-10-07', 'export', -2, 'order', 49], [266, 6, '2026-10-08', 'export', -2, 'order', 50],
      [267, 28, '2026-10-08', 'export', -1, 'order', 50], [268, 1, '2026-10-09', 'export', -1, 'order', 51],
      [269, 63, '2026-10-09', 'export', -1, 'order', 52], [270, 69, '2026-10-09', 'export', -1, 'order', 53],
      [271, 72, '2026-10-09', 'export', -1, 'order', 53], [272, 78, '2026-10-09', 'export', -1, 'order', 52],
      [273, 22, '2026-10-10', 'export', -1, 'order', 54], [274, 35, '2026-10-10', 'export', -2, 'order', 54],
      [275, 124, '2026-10-10', 'export', -1, 'order', 54], [276, 9, '2026-10-11', 'export', -1, 'order', 57],
      [277, 14, '2026-10-11', 'export', -1, 'order', 58], [278, 22, '2026-10-11', 'export', -1, 'order', 57],
      [279, 35, '2026-10-11', 'export', -1, 'order', 57], [280, 35, '2026-10-11', 'export', -1, 'order', 58],
      [281, 38, '2026-10-11', 'export', -2, 'order', 56], [282, 62, '2026-10-11', 'export', -1, 'order', 55],
      [283, 143, '2026-10-11', 'export', -1, 'order', 58], [284, 145, '2026-10-11', 'export', -3, 'order', 56],
      [285, 150, '2026-10-11', 'export', -2, 'order', 57], [286, 18, '2026-10-12', 'export', -1, 'order', 59],
      [287, 38, '2026-10-12', 'cancel_return', 2, 'order', 56], [288, 145, '2026-10-12', 'cancel_return', 3, 'order', 56],
      [289, 145, '2026-10-13', 'export', -1, 'order', 60], [290, 77, '2026-10-14', 'import', 4, 'import_receipt', 7],
      [291, 82, '2026-10-14', 'import', 4, 'import_receipt', 7], [292, 84, '2026-10-14', 'import', 6, 'import_receipt', 7],
      [293, 88, '2026-10-14', 'import', 5, 'import_receipt', 7], [294, 158, '2026-10-14', 'import', 10, 'import_receipt', 7],
      [295, 6, '2026-10-15', 'export', -3, 'order', 63], [296, 31, '2026-10-15', 'export', -1, 'order', 62],
      [297, 106, '2026-10-15', 'export', -3, 'order', 61], [298, 126, '2026-10-15', 'export', -1, 'order', 62],
      [299, 132, '2026-10-15', 'export', -1, 'order', 61], [300, 135, '2026-10-15', 'export', -1, 'order', 61],
      [301, 151, '2026-10-15', 'export', -1, 'order', 61], [302, 153, '2026-10-15', 'export', -1, 'order', 62],
      [303, 4, '2026-10-16', 'export', -2, 'order', 64], [304, 5, '2026-10-16', 'export', -1, 'order', 65],
      [305, 107, '2026-10-16', 'export', -2, 'order', 65], [306, 1, '2026-10-17', 'export', -2, 'order', 68],
      [307, 54, '2026-10-17', 'export', -1, 'order', 67], [308, 124, '2026-10-17', 'export', -1, 'order', 68],
      [309, 146, '2026-10-17', 'export', -1, 'order', 68], [310, 23, '2026-10-18', 'export', -1, 'order', 70],
      [311, 46, '2026-10-18', 'export', -2, 'order', 70], [312, 51, '2026-10-18', 'export', -2, 'order', 69],
      [313, 59, '2026-10-18', 'export', -1, 'order', 69], [314, 64, '2026-10-18', 'export', -1, 'order', 70],
      [315, 107, '2026-10-18', 'export', -1, 'order', 69], [316, 129, '2026-10-18', 'export', -2, 'order', 70],
      [317, 143, '2026-10-18', 'export', -1, 'order', 71], [318, 150, '2026-10-18', 'export', -1, 'order', 69],
      [319, 3, '2026-10-19', 'export', -4, 'order', 73], [320, 16, '2026-10-19', 'export', -1, 'order', 73],
      [321, 19, '2026-10-19', 'export', -1, 'order', 74], [322, 20, '2026-10-19', 'export', -1, 'order', 73],
      [323, 44, '2026-10-19', 'export', -2, 'order', 75], [324, 151, '2026-10-19', 'export', -2, 'order', 72],
      [325, 143, '2026-10-19', 'cancel_return', 1, 'order', 71], [326, 128, '2026-10-21', 'export', -3, 'order', 76],
      [327, 13, '2026-10-22', 'export', -2, 'order', 77], [328, 34, '2026-10-22', 'export', -2, 'order', 77],
      [329, 152, '2026-10-22', 'export', -1, 'order', 77], [330, 17, '2026-10-23', 'export', -1, 'order', 78],
      [331, 2, '2026-10-25', 'export', -1, 'order', 80], [332, 36, '2026-10-25', 'export', -4, 'order', 79],
      [333, 80, '2026-10-25', 'export', -1, 'order', 79], [334, 87, '2026-10-25', 'export', -1, 'order', 79],
      [335, 57, '2026-10-27', 'export', -2, 'order', 81], [336, 70, '2026-10-27', 'export', -1, 'order', 81],
      [337, 56, '2026-10-28', 'export', -1, 'order', 83], [338, 67, '2026-10-28', 'export', -1, 'order', 84],
      [339, 106, '2026-10-28', 'export', -2, 'order', 84], [340, 125, '2026-10-28', 'export', -2, 'order', 84],
      [341, 139, '2026-10-28', 'export', -2, 'order', 84], [342, 14, '2026-10-29', 'export', -1, 'order', 86],
      [343, 18, '2026-10-29', 'export', -1, 'order', 87], [344, 129, '2026-10-29', 'export', -3, 'order', 87],
      [345, 142, '2026-10-29', 'export', -2, 'order', 89], [346, 153, '2026-10-29', 'export', -3, 'order', 89],
      [347, 18, '2026-10-31', 'export', -1, 'order', 96], [348, 107, '2026-10-31', 'export', -1, 'order', 93],
      [349, 131, '2026-10-31', 'export', -1, 'order', 95], [350, 146, '2026-10-31', 'export', -3, 'order', 93]
    ],

    // [id, customer_id, order_date, status, receiver_name, receiver_phone,
    //  ship_address_detail, ship_ward, ship_district, ship_city, payment_method, total_amount, updated_at]
    orders: [
      [1, 4, '2026-09-12 14:02', 'delivered', 'Phạm Thị Dung', '0934567890', '10 Trần Phú', 'Phường 4', 'Quận 5', 'TP. Hồ Chí Minh', 'online', 1746700, '2026-09-17 16:02'],
      [2, 1, '2026-09-13 16:54', 'delivered', 'Trần Bảo Ngọc', '0954333444', '8 Nguyễn Thị Minh Khai', 'Phường Đa Kao', 'Quận 1', 'TP. Hồ Chí Minh', 'cod', 260000, '2026-09-16 21:54'],
      [3, 1, '2026-09-14 13:38', 'cancelled', 'Nguyễn Văn An', '0901234567', '12 Nguyễn Huệ', 'Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 'online', 1346250, '2026-09-14 22:38'],
      [4, 1, '2026-09-15 09:37', 'delivered', 'Nguyễn Văn An', '0901234567', '12 Nguyễn Huệ', 'Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 'cod', 330200, '2026-09-18 13:37'],
      [5, 2, '2026-09-15 12:57', 'delivered', 'Trần Thị Bích', '0912345678', '45 An Dương Vương', 'Phường 3', 'Quận 5', 'TP. Hồ Chí Minh', 'cod', 1369200, '2026-09-19 18:57'],
      [6, 5, '2026-09-15 13:33', 'cancelled', 'Hoàng Văn Em', '0945678901', '22 Cách Mạng Tháng Tám', 'Phường 5', 'Quận 3', 'TP. Hồ Chí Minh', 'online', 646150, '2026-09-15 16:33'],
      [7, 4, '2026-09-16 10:45', 'delivered', 'Lê Anh Tuấn', '0965222333', '301 Điện Biên Phủ', 'Phường 4', 'Quận 3', 'TP. Hồ Chí Minh', 'cod', 1436250, '2026-09-21 10:45'],
      [8, 2, '2026-09-16 21:29', 'delivered', 'Trần Thị Bích', '0912345678', '45 An Dương Vương', 'Phường 3', 'Quận 5', 'TP. Hồ Chí Minh', 'online', 198900, '2026-09-19 23:29'],
      [9, 1, '2026-09-17 10:39', 'cancelled', 'Nguyễn Văn An', '0901234567', '12 Nguyễn Huệ', 'Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 'cod', 697500, '2026-09-18 00:39'],
      [10, 1, '2026-09-20 09:28', 'delivered', 'Nguyễn Văn An', '0901234567', '12 Nguyễn Huệ', 'Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 'online', 158750, '2026-09-23 12:28'],
      [11, 3, '2026-09-21 09:07', 'delivered', 'Lê Hoàng Cường', '0923456789', '88 Lê Văn Việt', 'Hiệp Phú', 'TP. Thủ Đức', 'TP. Hồ Chí Minh', 'cod', 100800, '2026-09-24 10:07'],
      [12, 5, '2026-09-21 16:47', 'delivered', 'Hoàng Văn Em', '0945678901', '22 Cách Mạng Tháng Tám', 'Phường 5', 'Quận 3', 'TP. Hồ Chí Minh', 'online', 25200, '2026-09-25 16:47'],
      [13, 1, '2026-09-22 12:59', 'delivered', 'Nguyễn Văn An', '0901234567', '12 Nguyễn Huệ', 'Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 'online', 998450, '2026-09-27 15:59'],
      [14, 2, '2026-09-22 22:48', 'delivered', 'Trần Thị Bích', '0912345678', '45 An Dương Vương', 'Phường 3', 'Quận 5', 'TP. Hồ Chí Minh', 'online', 358800, '2026-09-25 01:48'],
      [15, 1, '2026-09-23 22:10', 'delivered', 'Lê Anh Tuấn', '0965222333', '301 Điện Biên Phủ', 'Phường 4', 'Quận 3', 'TP. Hồ Chí Minh', 'cod', 289150, '2026-09-28 22:10'],
      [16, 2, '2026-09-24 16:07', 'cancelled', 'Trần Thị Bích', '0912345678', '45 An Dương Vương', 'Phường 3', 'Quận 5', 'TP. Hồ Chí Minh', 'cod', 2008400, '2026-09-25 00:07'],
      [17, 4, '2026-09-24 16:27', 'delivered', 'Phạm Thị Dung', '0934567890', '10 Trần Phú', 'Phường 4', 'Quận 5', 'TP. Hồ Chí Minh', 'cod', 377400, '2026-09-27 17:27'],
      [18, 1, '2026-09-25 09:35', 'delivered', 'Nguyễn Văn An', '0901234567', '12 Nguyễn Huệ', 'Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 'online', 198900, '2026-09-27 15:35'],
      [19, 1, '2026-09-26 19:06', 'delivered', 'Nguyễn Văn An', '0901234567', '12 Nguyễn Huệ', 'Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 'online', 708500, '2026-10-02 00:06'],
      [20, 1, '2026-09-26 20:33', 'cancelled', 'Nguyễn Văn An', '0901234567', '12 Nguyễn Huệ', 'Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 'cod', 240300, '2026-09-27 18:33'],
      [21, 1, '2026-09-27 15:09', 'delivered', 'Trần Bảo Ngọc', '0954333444', '8 Nguyễn Thị Minh Khai', 'Phường Đa Kao', 'Quận 1', 'TP. Hồ Chí Minh', 'online', 280000, '2026-09-30 18:09'],
      [22, 1, '2026-09-27 15:13', 'cancelled', 'Nguyễn Văn An', '0901234567', '12 Nguyễn Huệ', 'Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 'cod', 1700550, '2026-09-28 13:13'],
      [23, 1, '2026-09-27 19:02', 'delivered', 'Nguyễn Minh Quân', '0987000111', '15 Lý Thường Kiệt', 'Phường 7', 'Quận 10', 'TP. Hồ Chí Minh', 'online', 178750, '2026-10-03 01:02'],
      [24, 5, '2026-09-27 22:52', 'cancelled', 'Hoàng Văn Em', '0945678901', '22 Cách Mạng Tháng Tám', 'Phường 5', 'Quận 3', 'TP. Hồ Chí Minh', 'cod', 1349700, '2026-09-28 16:52'],
      [25, 1, '2026-09-28 12:22', 'delivered', 'Nguyễn Văn An', '0901234567', '12 Nguyễn Huệ', 'Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 'online', 859000, '2026-10-03 17:22'],
      [26, 1, '2026-09-28 15:08', 'delivered', 'Nguyễn Văn An', '0901234567', '12 Nguyễn Huệ', 'Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 'cod', 946650, '2026-10-02 17:08'],
      [27, 3, '2026-09-28 21:00', 'delivered', 'Lê Hoàng Cường', '0923456789', '88 Lê Văn Việt', 'Hiệp Phú', 'TP. Thủ Đức', 'TP. Hồ Chí Minh', 'online', 538450, '2026-10-04 03:00'],
      [28, 6, '2026-09-28 21:46', 'delivered', 'Võ Thị Phương', '0956789012', '150 Nguyễn Thị Thập', 'Tân Phong', 'Quận 7', 'TP. Hồ Chí Minh', 'cod', 2263950, '2026-10-04 01:46'],
      [29, 2, '2026-09-29 09:48', 'delivered', 'Trần Thị Bích', '0912345678', '45 An Dương Vương', 'Phường 3', 'Quận 5', 'TP. Hồ Chí Minh', 'cod', 158750, '2026-10-04 15:48'],
      [30, 8, '2026-09-29 14:53', 'delivered', 'Nguyễn Minh Quân', '0987000111', '15 Lý Thường Kiệt', 'Phường 7', 'Quận 10', 'TP. Hồ Chí Minh', 'online', 1989000, '2026-10-01 15:53'],
      [31, 2, '2026-09-29 20:09', 'delivered', 'Trần Thị Bích', '0912345678', '45 An Dương Vương', 'Phường 3', 'Quận 5', 'TP. Hồ Chí Minh', 'online', 3751200, '2026-10-01 21:09'],
      [32, 3, '2026-09-29 22:13', 'delivered', 'Nguyễn Minh Quân', '0987000111', '15 Lý Thường Kiệt', 'Phường 7', 'Quận 10', 'TP. Hồ Chí Minh', 'cod', 3442800, '2026-10-03 01:13'],
      [33, 1, '2026-09-30 11:42', 'delivered', 'Nguyễn Văn An', '0901234567', '12 Nguyễn Huệ', 'Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 'online', 1457300, '2026-10-05 16:42'],
      [34, 8, '2026-09-30 19:03', 'delivered', 'Bùi Minh Hải', '0978901234', '64 Quang Trung', 'Phường 10', 'Quận Gò Vấp', 'TP. Hồ Chí Minh', 'online', 280000, '2026-10-04 21:03'],
      [35, 7, '2026-09-30 20:37', 'cancelled', 'Đặng Quang Giàu', '0967890123', '37 Phan Văn Trị', 'Phường 12', 'Quận Bình Thạnh', 'TP. Hồ Chí Minh', 'cod', 1186350, '2026-10-01 10:37'],
      [36, 3, '2026-09-30 21:23', 'delivered', 'Lê Hoàng Cường', '0923456789', '88 Lê Văn Việt', 'Hiệp Phú', 'TP. Thủ Đức', 'TP. Hồ Chí Minh', 'cod', 599300, '2026-10-05 23:23'],
      [37, 9, '2026-10-03 10:36', 'delivered', 'Ngô Thị Yến', '0989012345', '18 Trần Thái Tông', 'Dịch Vọng', 'Quận Cầu Giấy', 'Hà Nội', 'cod', 776250, '2026-10-06 13:36'],
      [38, 7, '2026-10-03 12:00', 'delivered', 'Lê Anh Tuấn', '0965222333', '301 Điện Biên Phủ', 'Phường 4', 'Quận 3', 'TP. Hồ Chí Minh', 'online', 118750, '2026-10-08 14:00'],
      [39, 8, '2026-10-04 10:35', 'cancelled', 'Bùi Minh Hải', '0978901234', '64 Quang Trung', 'Phường 10', 'Quận Gò Vấp', 'TP. Hồ Chí Minh', 'online', 1047800, '2026-10-05 15:35'],
      [40, 3, '2026-10-04 16:25', 'delivered', 'Lê Hoàng Cường', '0923456789', '88 Lê Văn Việt', 'Hiệp Phú', 'TP. Thủ Đức', 'TP. Hồ Chí Minh', 'cod', 1876300, '2026-10-08 20:25'],
      [41, 2, '2026-10-04 16:39', 'delivered', 'Trần Thị Bích', '0912345678', '45 An Dương Vương', 'Phường 3', 'Quận 5', 'TP. Hồ Chí Minh', 'cod', 1377550, '2026-10-07 19:39'],
      [42, 3, '2026-10-04 22:13', 'delivered', 'Lê Hoàng Cường', '0923456789', '88 Lê Văn Việt', 'Hiệp Phú', 'TP. Thủ Đức', 'TP. Hồ Chí Minh', 'cod', 3116650, '2026-10-08 04:13'],
      [43, 1, '2026-10-05 11:33', 'delivered', 'Nguyễn Văn An', '0901234567', '12 Nguyễn Huệ', 'Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 'online', 138750, '2026-10-10 13:33'],
      [44, 2, '2026-10-05 12:30', 'delivered', 'Phạm Gia Hân', '0976111222', '52 Hoàng Văn Thụ', 'Phường 9', 'Quận Phú Nhuận', 'TP. Hồ Chí Minh', 'online', 399600, '2026-10-10 16:30'],
      [45, 5, '2026-10-05 19:24', 'cancelled', 'Hoàng Văn Em', '0945678901', '22 Cách Mạng Tháng Tám', 'Phường 5', 'Quận 3', 'TP. Hồ Chí Minh', 'cod', 820300, '2026-10-06 02:24'],
      [46, 9, '2026-10-06 11:58', 'delivered', 'Ngô Thị Yến', '0989012345', '18 Trần Thái Tông', 'Dịch Vọng', 'Quận Cầu Giấy', 'Hà Nội', 'cod', 877500, '2026-10-11 11:58'],
      [47, 6, '2026-10-06 16:42', 'cancelled', 'Võ Thị Phương', '0956789012', '150 Nguyễn Thị Thập', 'Tân Phong', 'Quận 7', 'TP. Hồ Chí Minh', 'cod', 2306600, '2026-10-07 09:42'],
      [48, 1, '2026-10-06 21:50', 'delivered', 'Nguyễn Văn An', '0901234567', '12 Nguyễn Huệ', 'Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 'cod', 3886650, '2026-10-09 02:50'],
      [49, 1, '2026-10-07 21:03', 'delivered', 'Trần Bảo Ngọc', '0954333444', '8 Nguyễn Thị Minh Khai', 'Phường Đa Kao', 'Quận 1', 'TP. Hồ Chí Minh', 'cod', 2180850, '2026-10-09 23:03'],
      [50, 6, '2026-10-08 13:48', 'delivered', 'Võ Thị Phương', '0956789012', '150 Nguyễn Thị Thập', 'Tân Phong', 'Quận 7', 'TP. Hồ Chí Minh', 'online', 1408750, '2026-10-10 19:48'],
      [51, 7, '2026-10-09 09:10', 'delivered', 'Đặng Quang Giàu', '0967890123', '37 Phan Văn Trị', 'Phường 12', 'Quận Bình Thạnh', 'TP. Hồ Chí Minh', 'cod', 138750, '2026-10-12 11:10'],
      [52, 10, '2026-10-09 12:56', 'delivered', 'Phạm Gia Hân', '0976111222', '52 Hoàng Văn Thụ', 'Phường 9', 'Quận Phú Nhuận', 'TP. Hồ Chí Minh', 'cod', 6869600, '2026-10-13 14:56'],
      [53, 2, '2026-10-09 15:06', 'delivered', 'Nguyễn Minh Quân', '0987000111', '15 Lý Thường Kiệt', 'Phường 7', 'Quận 10', 'TP. Hồ Chí Minh', 'cod', 557700, '2026-10-14 20:06'],
      [54, 5, '2026-10-10 21:03', 'delivered', 'Hoàng Văn Em', '0945678901', '22 Cách Mạng Tháng Tám', 'Phường 5', 'Quận 3', 'TP. Hồ Chí Minh', 'cod', 1753000, '2026-10-13 00:03'],
      [55, 1, '2026-10-11 10:09', 'delivered', 'Nguyễn Văn An', '0901234567', '12 Nguyễn Huệ', 'Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 'online', 859300, '2026-10-14 13:09'],
      [56, 1, '2026-10-11 15:47', 'cancelled', 'Nguyễn Văn An', '0901234567', '12 Nguyễn Huệ', 'Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 'online', 606350, '2026-10-12 04:47'],
      [57, 9, '2026-10-11 19:46', 'delivered', 'Nguyễn Minh Quân', '0987000111', '15 Lý Thường Kiệt', 'Phường 7', 'Quận 10', 'TP. Hồ Chí Minh', 'cod', 1042500, '2026-10-16 19:46'],
      [58, 1, '2026-10-11 22:50', 'delivered', 'Nguyễn Văn An', '0901234567', '12 Nguyễn Huệ', 'Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 'online', 927700, '2026-10-15 04:50'],
      [59, 1, '2026-10-12 14:19', 'delivered', 'Nguyễn Văn An', '0901234567', '12 Nguyễn Huệ', 'Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 'online', 390000, '2026-10-16 20:19'],
      [60, 7, '2026-10-13 22:05', 'delivered', 'Phạm Gia Hân', '0976111222', '52 Hoàng Văn Thụ', 'Phường 9', 'Quận Phú Nhuận', 'TP. Hồ Chí Minh', 'cod', 149850, '2026-10-18 22:05'],
      [61, 5, '2026-10-15 16:28', 'delivered', 'Lê Anh Tuấn', '0965222333', '301 Điện Biên Phủ', 'Phường 4', 'Quận 3', 'TP. Hồ Chí Minh', 'cod', 2128350, '2026-10-19 21:28'],
      [62, 5, '2026-10-15 16:31', 'delivered', 'Hoàng Văn Em', '0945678901', '22 Cách Mạng Tháng Tám', 'Phường 5', 'Quận 3', 'TP. Hồ Chí Minh', 'cod', 1383550, '2026-10-20 22:31'],
      [63, 1, '2026-10-15 22:55', 'delivered', 'Nguyễn Văn An', '0901234567', '12 Nguyễn Huệ', 'Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 'cod', 540000, '2026-10-18 22:55'],
      [64, 2, '2026-10-16 11:23', 'delivered', 'Trần Thị Bích', '0912345678', '45 An Dương Vương', 'Phường 3', 'Quận 5', 'TP. Hồ Chí Minh', 'cod', 560000, '2026-10-20 12:23'],
      [65, 5, '2026-10-16 22:05', 'delivered', 'Hoàng Văn Em', '0945678901', '22 Cách Mạng Tháng Tám', 'Phường 5', 'Quận 3', 'TP. Hồ Chí Minh', 'online', 648750, '2026-10-22 02:05'],
      [66, 7, '2026-10-17 11:07', 'cancelled', 'Đặng Quang Giàu', '0967890123', '37 Phan Văn Trị', 'Phường 12', 'Quận Bình Thạnh', 'TP. Hồ Chí Minh', 'online', 1116700, '2026-10-17 19:07'],
      [67, 3, '2026-10-17 11:46', 'delivered', 'Lê Hoàng Cường', '0923456789', '88 Lê Văn Việt', 'Hiệp Phú', 'TP. Thủ Đức', 'TP. Hồ Chí Minh', 'online', 179400, '2026-10-22 15:46'],
      [68, 10, '2026-10-17 21:39', 'delivered', 'Trịnh Văn Khải', '0990123456', '95 Bạch Đằng', 'Hải Châu 1', 'Quận Hải Châu', 'Đà Nẵng', 'cod', 827950, '2026-10-20 00:39'],
      [69, 10, '2026-10-18 13:54', 'delivered', 'Trịnh Văn Khải', '0990123456', '95 Bạch Đằng', 'Hải Châu 1', 'Quận Hải Châu', 'Đà Nẵng', 'online', 1047900, '2026-10-20 18:54'],
      [70, 11, '2026-10-18 13:58', 'delivered', 'Lý Thị Lan', '0911223344', '7 Lê Lợi', 'Phường 1', 'Quận Tân Bình', 'TP. Hồ Chí Minh', 'online', 3479200, '2026-10-23 16:58'],
      [71, 9, '2026-10-18 22:16', 'cancelled', 'Ngô Thị Yến', '0989012345', '18 Trần Thái Tông', 'Dịch Vọng', 'Quận Cầu Giấy', 'Hà Nội', 'cod', 70200, '2026-10-19 04:16'],
      [72, 6, '2026-10-19 12:19', 'delivered', 'Võ Thị Phương', '0956789012', '150 Nguyễn Thị Thập', 'Tân Phong', 'Quận 7', 'TP. Hồ Chí Minh', 'cod', 1120500, '2026-10-24 12:19'],
      [73, 2, '2026-10-19 14:47', 'delivered', 'Trần Thị Bích', '0912345678', '45 An Dương Vương', 'Phường 3', 'Quận 5', 'TP. Hồ Chí Minh', 'online', 1482500, '2026-10-24 14:47'],
      [74, 5, '2026-10-19 21:21', 'delivered', 'Nguyễn Minh Quân', '0987000111', '15 Lý Thường Kiệt', 'Phường 7', 'Quận 10', 'TP. Hồ Chí Minh', 'cod', 168750, '2026-10-22 23:21'],
      [75, 8, '2026-10-19 22:31', 'delivered', 'Bùi Minh Hải', '0978901234', '64 Quang Trung', 'Phường 10', 'Quận Gò Vấp', 'TP. Hồ Chí Minh', 'cod', 457500, '2026-10-23 22:31'],
      [76, 2, '2026-10-21 16:17', 'shipping', 'Trần Thị Bích', '0912345678', '45 An Dương Vương', 'Phường 3', 'Quận 5', 'TP. Hồ Chí Minh', 'cod', 990600, '2026-10-23 19:17'],
      [77, 3, '2026-10-22 10:34', 'delivered', 'Trần Bảo Ngọc', '0954333444', '8 Nguyễn Thị Minh Khai', 'Phường Đa Kao', 'Quận 1', 'TP. Hồ Chí Minh', 'cod', 1435650, '2026-10-27 16:34'],
      [78, 12, '2026-10-23 22:34', 'delivered', 'Đinh Công Minh', '0922334455', '210 Nguyễn Văn Cừ', 'An Hòa', 'Quận Ninh Kiều', 'Cần Thơ', 'cod', 118750, '2026-10-27 23:34'],
      [79, 1, '2026-10-25 10:00', 'delivered', 'Nguyễn Văn An', '0901234567', '12 Nguyễn Huệ', 'Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 'online', 5969600, '2026-10-30 12:00'],
      [80, 10, '2026-10-25 22:11', 'delivered', 'Trịnh Văn Khải', '0990123456', '95 Bạch Đằng', 'Hải Châu 1', 'Quận Hải Châu', 'Đà Nẵng', 'cod', 318750, '2026-10-29 22:11'],
      [81, 2, '2026-10-27 12:35', 'shipping', 'Phạm Gia Hân', '0976111222', '52 Hoàng Văn Thụ', 'Phường 9', 'Quận Phú Nhuận', 'TP. Hồ Chí Minh', 'online', 738400, '2026-10-28 12:35'],
      [82, 6, '2026-10-28 14:49', 'order_created', 'Võ Thị Phương', '0956789012', '150 Nguyễn Thị Thập', 'Tân Phong', 'Quận 7', 'TP. Hồ Chí Minh', 'cod', 597750, null],
      [83, 1, '2026-10-28 16:08', 'order_confirmed', 'Lê Anh Tuấn', '0965222333', '301 Điện Biên Phủ', 'Phường 4', 'Quận 3', 'TP. Hồ Chí Minh', 'cod', 569400, '2026-10-28 22:08'],
      [84, 1, '2026-10-28 19:56', 'delivered', 'Nguyễn Văn An', '0901234567', '12 Nguyễn Huệ', 'Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 'cod', 2778300, '2026-11-01 11:00'],
      [85, 5, '2026-10-28 21:47', 'payment_success', 'Hoàng Văn Em', '0945678901', '22 Cách Mạng Tháng Tám', 'Phường 5', 'Quận 3', 'TP. Hồ Chí Minh', 'online', 698350, '2026-10-28 22:01'],
      [86, 5, '2026-10-29 09:00', 'order_confirmed', 'Hoàng Văn Em', '0945678901', '22 Cách Mạng Tháng Tám', 'Phường 5', 'Quận 3', 'TP. Hồ Chí Minh', 'online', 208750, '2026-10-29 12:00'],
      [87, 12, '2026-10-29 11:36', 'order_confirmed', 'Trần Bảo Ngọc', '0954333444', '8 Nguyễn Thị Minh Khai', 'Phường Đa Kao', 'Quận 1', 'TP. Hồ Chí Minh', 'cod', 1739400, '2026-10-29 16:36'],
      [88, 7, '2026-10-29 12:49', 'order_created', 'Đặng Quang Giàu', '0967890123', '37 Phan Văn Trị', 'Phường 12', 'Quận Bình Thạnh', 'TP. Hồ Chí Minh', 'online', 2398750, null],
      [89, 8, '2026-10-29 13:54', 'order_confirmed', 'Bùi Minh Hải', '0978901234', '64 Quang Trung', 'Phường 10', 'Quận Gò Vấp', 'TP. Hồ Chí Minh', 'cod', 786500, '2026-10-29 21:54'],
      [90, 2, '2026-10-29 14:57', 'payment_success', 'Trần Thị Bích', '0912345678', '45 An Dương Vương', 'Phường 3', 'Quận 5', 'TP. Hồ Chí Minh', 'online', 586250, '2026-10-29 15:13'],
      [91, 6, '2026-10-30 16:39', 'payment_success', 'Võ Thị Phương', '0956789012', '150 Nguyễn Thị Thập', 'Tân Phong', 'Quận 7', 'TP. Hồ Chí Minh', 'online', 537500, '2026-10-30 16:55'],
      [92, 8, '2026-10-31 11:08', 'order_created', 'Bùi Minh Hải', '0978901234', '64 Quang Trung', 'Phường 10', 'Quận Gò Vấp', 'TP. Hồ Chí Minh', 'online', 178750, null],
      [93, 1, '2026-10-31 13:18', 'order_confirmed', 'Lê Anh Tuấn', '0965222333', '301 Điện Biên Phủ', 'Phường 4', 'Quận 3', 'TP. Hồ Chí Minh', 'cod', 580450, '2026-10-31 15:18'],
      [94, 12, '2026-10-31 15:02', 'order_created', 'Đinh Công Minh', '0922334455', '210 Nguyễn Văn Cừ', 'An Hòa', 'Quận Ninh Kiều', 'Cần Thơ', 'cod', 180000, null],
      [95, 1, '2026-10-31 15:48', 'order_confirmed', 'Phạm Gia Hân', '0976111222', '52 Hoàng Văn Thụ', 'Phường 9', 'Quận Phú Nhuận', 'TP. Hồ Chí Minh', 'cod', 679900, '2026-10-31 23:48'],
      [96, 9, '2026-10-31 16:21', 'order_confirmed', 'Ngô Thị Yến', '0989012345', '18 Trần Thái Tông', 'Dịch Vọng', 'Quận Cầu Giấy', 'Hà Nội', 'online', 390000, '2026-10-31 19:21'],
      [97, 5, '2026-10-31 16:42', 'order_created', 'Hoàng Văn Em', '0945678901', '22 Cách Mạng Tháng Tám', 'Phường 5', 'Quận 3', 'TP. Hồ Chí Minh', 'cod', 59400, null],
      [98, 2, '2026-10-31 20:05', 'order_created', 'Trần Thị Bích', '0912345678', '45 An Dương Vương', 'Phường 3', 'Quận 5', 'TP. Hồ Chí Minh', 'online', 680000, null],
      [99, 6, '2026-10-31 22:12', 'order_created', 'Võ Thị Phương', '0956789012', '150 Nguyễn Thị Thập', 'Tân Phong', 'Quận 7', 'TP. Hồ Chí Minh', 'cod', 70200, null],
      [100, 12, '2026-10-31 22:56', 'order_created', 'Phạm Gia Hân', '0976111222', '52 Hoàng Văn Thụ', 'Phường 9', 'Quận Phú Nhuận', 'TP. Hồ Chí Minh', 'cod', 88800, null]
    ],

    // [id, order_id, product_id, quantity, unit_price]
    order_items: [
      [1, 1, 18, 2, 390000], [2, 1, 24, 2, 298750], [3, 1, 59, 1, 369200],
      [4, 2, 130, 1, 260000], [5, 3, 40, 3, 448750], [6, 4, 128, 1, 330200],
      [7, 5, 80, 1, 1250400], [8, 5, 144, 2, 59400], [9, 6, 66, 2, 169000],
      [10, 6, 51, 1, 179400], [11, 6, 16, 1, 128750], [12, 7, 23, 1, 240000],
      [13, 7, 40, 2, 448750], [14, 7, 3, 1, 298750], [15, 8, 136, 1, 198900],
      [16, 9, 19, 2, 168750], [17, 9, 8, 2, 180000], [18, 10, 20, 1, 158750],
      [19, 11, 22, 4, 25200], [20, 12, 22, 1, 25200], [21, 13, 35, 1, 648750],
      [22, 13, 125, 1, 349700], [23, 14, 54, 2, 179400], [24, 15, 12, 1, 238750],
      [25, 15, 22, 2, 25200], [26, 16, 80, 1, 1250400], [27, 16, 106, 1, 160000],
      [28, 16, 138, 2, 299000], [29, 17, 38, 1, 78400], [30, 17, 138, 1, 299000],
      [31, 18, 136, 1, 198900], [32, 19, 69, 1, 358800], [33, 19, 123, 1, 349700],
      [34, 20, 146, 2, 120150], [35, 21, 4, 1, 280000], [36, 22, 17, 1, 118750],
      [37, 22, 4, 2, 280000], [38, 22, 142, 3, 340600], [39, 23, 10, 1, 178750],
      [40, 24, 48, 1, 1000000], [41, 24, 126, 1, 349700], [42, 25, 151, 1, 560250],
      [43, 25, 11, 1, 298750], [44, 26, 3, 1, 298750], [45, 26, 24, 2, 298750],
      [46, 26, 22, 2, 25200], [47, 27, 150, 3, 99900], [48, 27, 13, 1, 238750],
      [49, 28, 152, 2, 160650], [50, 28, 18, 2, 390000], [51, 28, 3, 3, 298750],
      [52, 28, 94, 3, 88800], [53, 29, 20, 1, 158750], [54, 30, 133, 2, 140400],
      [55, 30, 56, 3, 569400], [56, 31, 80, 3, 1250400], [57, 32, 20, 1, 158750],
      [58, 32, 38, 1, 78400], [59, 32, 144, 1, 59400], [60, 32, 28, 3, 1048750],
      [61, 33, 125, 1, 349700], [62, 33, 63, 3, 369200], [63, 34, 4, 1, 280000],
      [64, 35, 23, 1, 240000], [65, 35, 54, 4, 179400], [66, 35, 44, 1, 228750],
      [67, 36, 58, 1, 599300], [68, 37, 6, 2, 180000], [69, 37, 1, 3, 138750],
      [70, 38, 17, 1, 118750], [71, 39, 128, 1, 330200], [72, 39, 137, 4, 179400],
      [73, 40, 123, 4, 349700], [74, 40, 13, 2, 238750], [75, 41, 13, 1, 238750],
      [76, 41, 64, 3, 379600], [77, 42, 67, 3, 859300], [78, 42, 20, 1, 158750],
      [79, 42, 47, 1, 380000], [80, 43, 1, 1, 138750], [81, 44, 154, 1, 399600],
      [82, 45, 130, 2, 260000], [83, 45, 68, 1, 300300], [84, 46, 7, 1, 228800],
      [85, 46, 59, 1, 369200], [86, 46, 50, 1, 279500], [87, 47, 123, 2, 349700],
      [88, 47, 52, 1, 179400], [89, 47, 38, 1, 78400], [90, 47, 139, 3, 449800],
      [91, 48, 151, 3, 560250], [92, 48, 14, 1, 208750], [93, 48, 41, 1, 998750],
      [94, 48, 61, 2, 499200], [95, 49, 142, 2, 340600], [96, 49, 124, 3, 430300],
      [97, 49, 5, 1, 208750], [98, 50, 28, 1, 1048750], [99, 50, 6, 2, 180000],
      [100, 51, 1, 1, 138750], [101, 52, 78, 1, 6500400], [102, 52, 63, 1, 369200],
      [103, 53, 69, 1, 358800], [104, 53, 72, 1, 198900], [105, 54, 35, 2, 648750],
      [106, 54, 22, 1, 25200], [107, 54, 124, 1, 430300], [108, 55, 62, 1, 859300],
      [109, 56, 145, 3, 149850], [110, 56, 38, 2, 78400], [111, 57, 150, 2, 99900],
      [112, 57, 9, 1, 168750], [113, 57, 35, 1, 648750], [114, 57, 22, 1, 25200],
      [115, 58, 14, 1, 208750], [116, 58, 143, 1, 70200], [117, 58, 35, 1, 648750],
      [118, 59, 18, 1, 390000], [119, 60, 145, 1, 149850], [120, 61, 132, 1, 799500],
      [121, 61, 135, 1, 288600], [122, 61, 106, 3, 160000], [123, 61, 151, 1, 560250],
      [124, 62, 153, 1, 35100], [125, 62, 31, 1, 998750], [126, 62, 126, 1, 349700],
      [127, 63, 6, 3, 180000], [128, 64, 4, 2, 280000], [129, 65, 107, 2, 220000],
      [130, 65, 5, 1, 208750], [131, 66, 72, 3, 198900], [132, 66, 121, 2, 260000],
      [133, 67, 54, 1, 179400], [134, 68, 146, 1, 120150], [135, 68, 1, 2, 138750],
      [136, 68, 124, 1, 430300], [137, 69, 107, 1, 220000], [138, 69, 59, 1, 369200],
      [139, 69, 150, 1, 99900], [140, 69, 51, 2, 179400], [141, 70, 23, 1, 240000],
      [142, 70, 46, 2, 980000], [143, 70, 64, 1, 379600], [144, 70, 129, 2, 449800],
      [145, 71, 143, 1, 70200], [146, 72, 151, 2, 560250], [147, 73, 16, 1, 128750],
      [148, 73, 3, 4, 298750], [149, 73, 20, 1, 158750], [150, 74, 19, 1, 168750],
      [151, 75, 44, 2, 228750], [152, 76, 128, 3, 330200], [153, 77, 34, 2, 398750],
      [154, 77, 152, 1, 160650], [155, 77, 13, 2, 238750], [156, 78, 17, 1, 118750],
      [157, 79, 36, 4, 680000], [158, 79, 80, 1, 1250400], [159, 79, 87, 1, 1999200],
      [160, 80, 2, 1, 318750], [161, 81, 57, 2, 299000], [162, 81, 70, 1, 140400],
      [163, 82, 3, 1, 298750], [164, 82, 57, 1, 299000], [165, 83, 56, 1, 569400],
      [166, 84, 67, 1, 859300], [167, 84, 125, 2, 349700], [168, 84, 139, 2, 449800],
      [169, 84, 106, 2, 160000], [170, 85, 154, 1, 399600], [171, 85, 24, 1, 298750],
      [172, 86, 14, 1, 208750], [173, 87, 18, 1, 390000], [174, 87, 129, 3, 449800],
      [175, 88, 39, 1, 1398750], [176, 88, 48, 1, 1000000], [177, 89, 153, 3, 35100],
      [178, 89, 142, 2, 340600], [179, 90, 5, 2, 208750], [180, 90, 9, 1, 168750],
      [181, 91, 1, 1, 138750], [182, 91, 34, 1, 398750], [183, 92, 10, 1, 178750],
      [184, 93, 146, 3, 120150], [185, 93, 107, 1, 220000], [186, 94, 6, 1, 180000],
      [187, 95, 131, 1, 679900], [188, 96, 18, 1, 390000], [189, 97, 144, 1, 59400],
      [190, 98, 36, 1, 680000], [191, 99, 143, 1, 70200], [192, 100, 94, 1, 88800]
    ],

    // [id, customer_id, type, order_id, message, is_read, created_at]
    notifications: [
      [1, 1, 'account_created', null, 'Tài khoản ModelShop của bạn đã được tạo thành công.', true, '2026-09-03 09:00'],
      [2, 2, 'account_created', null, 'Tài khoản ModelShop của bạn đã được tạo thành công.', true, '2026-09-06 15:30'],
      [3, 3, 'account_created', null, 'Tài khoản ModelShop của bạn đã được tạo thành công.', true, '2026-09-09 20:10'],
      [4, 4, 'account_created', null, 'Tài khoản ModelShop của bạn đã được tạo thành công.', false, '2026-09-10 08:45'],
      [5, 5, 'account_created', null, 'Tài khoản ModelShop của bạn đã được tạo thành công.', false, '2026-09-14 10:20'],
      [6, 1, 'cancelled', 3, 'Đơn hàng #MS0003 đã được hủy.', true, '2026-09-14 22:38'],
      [7, 5, 'cancelled', 6, 'Đơn hàng #MS0006 đã được hủy.', true, '2026-09-15 16:33'],
      [8, 1, 'delivered', 2, 'Đơn hàng #MS0002 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-09-16 21:54'],
      [9, 4, 'delivered', 1, 'Đơn hàng #MS0001 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-09-17 16:02'],
      [10, 1, 'cancelled', 9, 'Đơn hàng #MS0009 đã được hủy.', true, '2026-09-18 00:39'],
      [11, 1, 'delivered', 4, 'Đơn hàng #MS0004 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-09-18 13:37'],
      [12, 6, 'account_created', null, 'Tài khoản ModelShop của bạn đã được tạo thành công.', true, '2026-09-18 19:05'],
      [13, 2, 'delivered', 5, 'Đơn hàng #MS0005 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', false, '2026-09-19 18:57'],
      [14, 2, 'delivered', 8, 'Đơn hàng #MS0008 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-09-19 23:29'],
      [15, 2, 'profile_updated', null, 'Thông tin tài khoản của bạn đã được cập nhật thành công.', true, '2026-09-20 11:30'],
      [16, 4, 'delivered', 7, 'Đơn hàng #MS0007 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-09-21 10:45'],
      [17, 7, 'account_created', null, 'Tài khoản ModelShop của bạn đã được tạo thành công.', true, '2026-09-22 13:40'],
      [18, 1, 'delivered', 10, 'Đơn hàng #MS0010 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-09-23 12:28'],
      [19, 3, 'delivered', 11, 'Đơn hàng #MS0011 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-09-24 10:07'],
      [20, 2, 'cancelled', 16, 'Đơn hàng #MS0016 đã được hủy.', true, '2026-09-25 00:07'],
      [21, 2, 'delivered', 14, 'Đơn hàng #MS0014 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-09-25 01:48'],
      [22, 5, 'delivered', 12, 'Đơn hàng #MS0012 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-09-25 16:47'],
      [23, 1, 'delivered', 18, 'Đơn hàng #MS0018 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-09-27 15:35'],
      [24, 1, 'delivered', 13, 'Đơn hàng #MS0013 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-09-27 15:59'],
      [25, 4, 'delivered', 17, 'Đơn hàng #MS0017 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-09-27 17:27'],
      [26, 1, 'cancelled', 20, 'Đơn hàng #MS0020 đã được hủy.', false, '2026-09-27 18:33'],
      [27, 8, 'account_created', null, 'Tài khoản ModelShop của bạn đã được tạo thành công.', true, '2026-09-27 21:15'],
      [28, 1, 'cancelled', 22, 'Đơn hàng #MS0022 đã được hủy.', true, '2026-09-28 13:13'],
      [29, 5, 'cancelled', 24, 'Đơn hàng #MS0024 đã được hủy.', true, '2026-09-28 16:52'],
      [30, 1, 'delivered', 15, 'Đơn hàng #MS0015 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-09-28 22:10'],
      [31, 1, 'delivered', 21, 'Đơn hàng #MS0021 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', false, '2026-09-30 18:09'],
      [32, 7, 'cancelled', 35, 'Đơn hàng #MS0035 đã được hủy.', false, '2026-10-01 10:37'],
      [33, 8, 'delivered', 30, 'Đơn hàng #MS0030 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-10-01 15:53'],
      [34, 2, 'delivered', 31, 'Đơn hàng #MS0031 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-10-01 21:09'],
      [35, 1, 'delivered', 19, 'Đơn hàng #MS0019 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-10-02 00:06'],
      [36, 3, 'password_changed', null, 'Mật khẩu tài khoản của bạn đã được đổi thành công.', false, '2026-10-02 08:40'],
      [37, 9, 'account_created', null, 'Tài khoản ModelShop của bạn đã được tạo thành công.', true, '2026-10-02 09:50'],
      [38, 1, 'delivered', 26, 'Đơn hàng #MS0026 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-10-02 17:08'],
      [39, 1, 'delivered', 23, 'Đơn hàng #MS0023 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', false, '2026-10-03 01:02'],
      [40, 3, 'delivered', 32, 'Đơn hàng #MS0032 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-10-03 01:13'],
      [41, 1, 'delivered', 25, 'Đơn hàng #MS0025 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-10-03 17:22'],
      [42, 6, 'delivered', 28, 'Đơn hàng #MS0028 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-10-04 01:46'],
      [43, 3, 'delivered', 27, 'Đơn hàng #MS0027 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-10-04 03:00'],
      [44, 2, 'delivered', 29, 'Đơn hàng #MS0029 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', false, '2026-10-04 15:48'],
      [45, 8, 'delivered', 34, 'Đơn hàng #MS0034 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-10-04 21:03'],
      [46, 8, 'cancelled', 39, 'Đơn hàng #MS0039 đã được hủy.', true, '2026-10-05 15:35'],
      [47, 1, 'delivered', 33, 'Đơn hàng #MS0033 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-10-05 16:42'],
      [48, 3, 'delivered', 36, 'Đơn hàng #MS0036 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-10-05 23:23'],
      [49, 5, 'cancelled', 45, 'Đơn hàng #MS0045 đã được hủy.', true, '2026-10-06 02:24'],
      [50, 9, 'delivered', 37, 'Đơn hàng #MS0037 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-10-06 13:36'],
      [51, 6, 'cancelled', 47, 'Đơn hàng #MS0047 đã được hủy.', true, '2026-10-07 09:42'],
      [52, 2, 'delivered', 41, 'Đơn hàng #MS0041 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', false, '2026-10-07 19:39'],
      [53, 3, 'delivered', 42, 'Đơn hàng #MS0042 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', false, '2026-10-08 04:13'],
      [54, 7, 'delivered', 38, 'Đơn hàng #MS0038 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-10-08 14:00'],
      [55, 10, 'account_created', null, 'Tài khoản ModelShop của bạn đã được tạo thành công.', true, '2026-10-08 16:25'],
      [56, 3, 'delivered', 40, 'Đơn hàng #MS0040 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-10-08 20:25'],
      [57, 1, 'delivered', 48, 'Đơn hàng #MS0048 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-10-09 02:50'],
      [58, 1, 'delivered', 49, 'Đơn hàng #MS0049 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', false, '2026-10-09 23:03'],
      [59, 1, 'profile_updated', null, 'Thông tin tài khoản của bạn đã được cập nhật thành công.', true, '2026-10-10 10:00'],
      [60, 1, 'delivered', 43, 'Đơn hàng #MS0043 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-10-10 13:33'],
      [61, 2, 'delivered', 44, 'Đơn hàng #MS0044 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', false, '2026-10-10 16:30'],
      [62, 6, 'delivered', 50, 'Đơn hàng #MS0050 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-10-10 19:48'],
      [63, 1, 'password_changed', null, 'Mật khẩu tài khoản của bạn đã được đổi thành công.', true, '2026-10-11 10:00'],
      [64, 9, 'delivered', 46, 'Đơn hàng #MS0046 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-10-11 11:58'],
      [65, 1, 'cancelled', 56, 'Đơn hàng #MS0056 đã được hủy.', true, '2026-10-12 04:47'],
      [66, 11, 'account_created', null, 'Tài khoản ModelShop của bạn đã được tạo thành công.', true, '2026-10-12 11:00'],
      [67, 7, 'delivered', 51, 'Đơn hàng #MS0051 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-10-12 11:10'],
      [68, 5, 'delivered', 54, 'Đơn hàng #MS0054 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', false, '2026-10-13 00:03'],
      [69, 10, 'delivered', 52, 'Đơn hàng #MS0052 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-10-13 14:56'],
      [70, 1, 'delivered', 55, 'Đơn hàng #MS0055 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-10-14 13:09'],
      [71, 2, 'delivered', 53, 'Đơn hàng #MS0053 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', false, '2026-10-14 20:06'],
      [72, 1, 'delivered', 58, 'Đơn hàng #MS0058 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-10-15 04:50'],
      [73, 9, 'delivered', 57, 'Đơn hàng #MS0057 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-10-16 19:46'],
      [74, 1, 'delivered', 59, 'Đơn hàng #MS0059 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-10-16 20:19'],
      [75, 7, 'cancelled', 66, 'Đơn hàng #MS0066 đã được hủy.', false, '2026-10-17 19:07'],
      [76, 5, 'profile_updated', null, 'Thông tin tài khoản của bạn đã được cập nhật thành công.', true, '2026-10-18 14:20'],
      [77, 7, 'delivered', 60, 'Đơn hàng #MS0060 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-10-18 22:05'],
      [78, 1, 'delivered', 63, 'Đơn hàng #MS0063 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-10-18 22:55'],
      [79, 9, 'cancelled', 71, 'Đơn hàng #MS0071 đã được hủy.', true, '2026-10-19 04:16'],
      [80, 5, 'delivered', 61, 'Đơn hàng #MS0061 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-10-19 21:28'],
      [81, 10, 'delivered', 68, 'Đơn hàng #MS0068 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-10-20 00:39'],
      [82, 2, 'delivered', 64, 'Đơn hàng #MS0064 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-10-20 12:23'],
      [83, 12, 'account_created', null, 'Tài khoản ModelShop của bạn đã được tạo thành công.', true, '2026-10-20 18:30'],
      [84, 10, 'delivered', 69, 'Đơn hàng #MS0069 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-10-20 18:54'],
      [85, 5, 'delivered', 62, 'Đơn hàng #MS0062 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-10-20 22:31'],
      [86, 6, 'password_changed', null, 'Mật khẩu tài khoản của bạn đã được đổi thành công.', true, '2026-10-21 20:00'],
      [87, 5, 'delivered', 65, 'Đơn hàng #MS0065 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', false, '2026-10-22 02:05'],
      [88, 3, 'delivered', 67, 'Đơn hàng #MS0067 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', false, '2026-10-22 15:46'],
      [89, 5, 'delivered', 74, 'Đơn hàng #MS0074 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-10-22 23:21'],
      [90, 11, 'delivered', 70, 'Đơn hàng #MS0070 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', false, '2026-10-23 16:58'],
      [91, 2, 'shipping', 76, 'Đơn hàng #MS0076 đang trên đường giao đến bạn.', true, '2026-10-23 19:17'],
      [92, 8, 'delivered', 75, 'Đơn hàng #MS0075 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', false, '2026-10-23 22:31'],
      [93, 6, 'delivered', 72, 'Đơn hàng #MS0072 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-10-24 12:19'],
      [94, 2, 'delivered', 73, 'Đơn hàng #MS0073 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-10-24 14:47'],
      [95, 7, 'profile_updated', null, 'Thông tin tài khoản của bạn đã được cập nhật thành công.', false, '2026-10-25 09:10'],
      [96, 3, 'delivered', 77, 'Đơn hàng #MS0077 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', false, '2026-10-27 16:34'],
      [97, 12, 'delivered', 78, 'Đơn hàng #MS0078 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', false, '2026-10-27 23:34'],
      [98, 2, 'shipping', 81, 'Đơn hàng #MS0081 đang trên đường giao đến bạn.', true, '2026-10-28 12:35'],
      [99, 6, 'order_created', 82, 'Đơn hàng #MS0082 đã được đặt thành công.', false, '2026-10-28 14:54'],
      [100, 5, 'payment_success', 85, 'Đơn hàng #MS0085 đã được thanh toán thành công.', false, '2026-10-28 22:01'],
      [101, 1, 'order_confirmed', 83, 'Đơn hàng #MS0083 đã được xác nhận và đang được chuẩn bị.', true, '2026-10-28 22:08'],
      [102, 5, 'order_confirmed', 86, 'Đơn hàng #MS0086 đã được xác nhận và đang được chuẩn bị.', false, '2026-10-29 12:00'],
      [103, 7, 'order_created', 88, 'Đơn hàng #MS0088 đã được đặt thành công.', true, '2026-10-29 12:54'],
      [104, 2, 'payment_success', 90, 'Đơn hàng #MS0090 đã được thanh toán thành công.', true, '2026-10-29 15:13'],
      [105, 12, 'order_confirmed', 87, 'Đơn hàng #MS0087 đã được xác nhận và đang được chuẩn bị.', false, '2026-10-29 16:36'],
      [106, 8, 'order_confirmed', 89, 'Đơn hàng #MS0089 đã được xác nhận và đang được chuẩn bị.', false, '2026-10-29 21:54'],
      [107, 10, 'delivered', 80, 'Đơn hàng #MS0080 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-10-29 22:11'],
      [108, 1, 'delivered', 79, 'Đơn hàng #MS0079 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-10-30 12:00'],
      [109, 6, 'payment_success', 91, 'Đơn hàng #MS0091 đã được thanh toán thành công.', true, '2026-10-30 16:55'],
      [110, 8, 'order_created', 92, 'Đơn hàng #MS0092 đã được đặt thành công.', false, '2026-10-31 11:13'],
      [111, 12, 'order_created', 94, 'Đơn hàng #MS0094 đã được đặt thành công.', true, '2026-10-31 15:07'],
      [112, 1, 'order_confirmed', 93, 'Đơn hàng #MS0093 đã được xác nhận và đang được chuẩn bị.', true, '2026-10-31 15:18'],
      [113, 5, 'order_created', 97, 'Đơn hàng #MS0097 đã được đặt thành công.', true, '2026-10-31 16:47'],
      [114, 9, 'order_confirmed', 96, 'Đơn hàng #MS0096 đã được xác nhận và đang được chuẩn bị.', true, '2026-10-31 19:21'],
      [115, 2, 'order_created', 98, 'Đơn hàng #MS0098 đã được đặt thành công.', true, '2026-10-31 20:10'],
      [116, 6, 'order_created', 99, 'Đơn hàng #MS0099 đã được đặt thành công.', false, '2026-10-31 22:17'],
      [117, 12, 'order_created', 100, 'Đơn hàng #MS0100 đã được đặt thành công.', false, '2026-10-31 23:01'],
      [118, 1, 'order_confirmed', 95, 'Đơn hàng #MS0095 đã được xác nhận và đang được chuẩn bị.', true, '2026-10-31 23:48'],
      [119, 1, 'delivered', 84, 'Đơn hàng #MS0084 vừa được giao thành công. Cảm ơn bạn đã đặt hàng tại ModelShop.', true, '2026-11-01 11:00']
    ]

  };

  global.DB_ENUMS = DB_ENUMS;
  global.DB_SCHEMA = DB_SCHEMA;
  global.DB_SEED = DB_SEED;
})(window);