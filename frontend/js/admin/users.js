(function () {
    'use strict';

    // Render cấu trúc HTML giao diện Quản lý người dùng vào main
    const mainContent = document.querySelector('.admin-main');
    if (!mainContent) return;

    // Bổ sung giao diện HTML quản lý user vào khung chính
    const userHTML = `
        <div class="dashboard-content">
            <div class="page-title">
                <h1>Quản lý người dùng</h1>
                <p>Trang chủ / Quản lý người dùng</p>
            </div>

            <div class="data-table-section">
                <div class="table-actions-bar">
                    <div class="search-filter-group">
                        <input type="text" id="search-input" placeholder="Tìm theo tên, username, email, SĐT...">
                        <select id="filter-status">
                            <option value="all">Tất cả trạng thái</option>
                            <option value="active">Đang hoạt động</option>
                            <option value="locked">Đã bị khóa</option>
                        </select>
                    </div>
                    <button class="btn-add" id="btn-open-add-modal">
                        <i class="fa-solid fa-user-plus"></i> Thêm khách hàng
                    </button>
                </div>

                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Họ tên</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Số điện thoại</th>
                                <th>Trạng thái</th>
                                <th>Ngày đăng ký</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody id="customer-table-body">
                            <!-- Dữ liệu render bằng JS -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- MODAL THÊM / SỬA KHÁCH HÀNG -->
        <div class="admin-modal" id="customer-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="modal-title">Thêm khách hàng mới</h3>
                    <button class="modal-close" id="btn-close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="customer-form">
                        <input type="hidden" id="customer-id">
                        <div class="form-group">
                            <label>Tên đăng nhập (Username) *</label>
                            <input type="text" id="customer-username" required placeholder="Nhập tên đăng nhập...">
                        </div>
                        <div class="form-group" id="group-password">
                            <label>Mật khẩu *</label>
                            <input type="password" id="customer-password" placeholder="Nhập mật khẩu mặc định...">
                        </div>
                        <div class="form-group">
                            <label>Họ và tên</label>
                            <input type="text" id="customer-fullname" placeholder="Nhập họ tên đầy đủ...">
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="customer-email" placeholder="Nhập địa chỉ email...">
                        </div>
                        <div class="form-group">
                            <label>Số điện thoại</label>
                            <input type="text" id="customer-phone" placeholder="Nhập số điện thoại...">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" id="btn-cancel-modal">Hủy</button>
                    <button class="btn-primary" id="btn-save-customer">Lưu thông tin</button>
                </div>
            </div>
        </div>
    `;

    // Chèn vào sau header
    mainContent.insertAdjacentHTML('beforeend', userHTML);

    // --- LOGIC XỬ LÝ DỮ LIỆU ---
    const searchInput = document.getElementById('search-input');
    const filterStatus = document.getElementById('filter-status');
    const tableBody = document.getElementById('customer-table-body');
    
    const modal = document.getElementById('customer-modal');
    const btnOpenAdd = document.getElementById('btn-open-add-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnCancelModal = document.getElementById('btn-cancel-modal');
    const btnSaveCustomer = document.getElementById('btn-save-customer');
    
    const modalTitle = document.getElementById('modal-title');
    const inputId = document.getElementById('customer-id');
    const inputUsername = document.getElementById('customer-username');
    const inputPassword = document.getElementById('customer-password');
    const inputFullname = document.getElementById('customer-fullname');
    const inputEmail = document.getElementById('customer-email');
    const inputPhone = document.getElementById('customer-phone');
    const groupPassword = document.getElementById('group-password');

    // Hàm render bảng danh sách
    function renderTable() {
        const keyword = searchInput.value;
        const status = filterStatus.value;

        // Sử dụng hàm filterCustomers đã có sẵn trong data.js
        const customers = Shop.filterUsers({ keyword, status });

        if (customers.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #777; padding: 20px;">Không tìm thấy khách hàng nào.</td></tr>`;
            return;
        }

        tableBody.innerHTML = customers.map(c => {
            const isLocked = c.is_locked;
            const statusClass = isLocked ? 'locked' : 'active';
            const statusText = isLocked ? 'Bị khóa' : 'Hoạt động';
            const lockIcon = isLocked ? 'fa-lock-open' : 'fa-lock';
            const lockTitle = isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản';
            const formattedDate = c.created_at ? new Date(c.created_at).toLocaleDateString('vi-VN') : 'N/A';

            return `
                <tr>
                    <td>#${c.id}</td>
                    <td><strong>${Shop.escapeHtml(c.full_name || 'Chưa cập nhật')}</strong></td>
                    <td>${Shop.escapeHtml(c.username)}</td>
                    <td>${Shop.escapeHtml(c.email || 'N/A')}</td>
                    <td>${Shop.escapeHtml(c.phone || 'N/A')}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>${formattedDate}</td>
                    <td>
                        <button class="btn-action edit" onclick="window.editCustomer(${c.id})" title="Chỉnh sửa"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-action password" onclick="window.resetPasswordModal(${c.id})" title="Đặt lại mật khẩu"><i class="fa-solid fa-key"></i></button>
                        <button class="btn-action lock" onclick="window.toggleLock(${c.id})" title="${lockTitle}"><i class="fa-solid ${lockIcon}"></i></button>
                        <button class="btn-action delete" onclick="window.removeCustomer(${c.id})" title="Xóa tài khoản"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Sự kiện tìm kiếm & lọc
    searchInput.addEventListener('input', renderTable);
    filterStatus.addEventListener('change', renderTable);

    // Mở modal Thêm mới
    btnOpenAdd.addEventListener('click', function () {
        modalTitle.innerText = 'Thêm khách hàng mới';
        inputId.value = '';
        inputUsername.value = '';
        inputPassword.value = '123456';
        inputUsername.disabled = false;
        groupPassword.style.display = 'block';
        inputFullname.value = '';
        inputEmail.value = '';
        inputPhone.value = '';
        modal.classList.add('show');
    });

    // Đóng modal
    function closeModal() {
        modal.classList.remove('show');
    }
    btnCloseModal.addEventListener('click', closeModal);
    btnCancelModal.addEventListener('click', closeModal);
    window.addEventListener('click', function (e) {
        if (e.target === modal) closeModal();
    });

    // Lưu thông tin (Thêm hoặc Sửa)
    btnSaveCustomer.addEventListener('click', function () {
        const id = inputId.value;
        const username = inputUsername.value.trim();
        const password = inputPassword.value;
        const full_name = inputFullname.value.trim();
        const email = inputEmail.value.trim();
        const phone = inputPhone.value.trim();

        if (!username && !id) {
            alert('Vui lòng nhập tên đăng nhập!');
            return;
        }

        if (id) {
            // Cập nhật khách hàng
            const inputData = {
                full_name: full_name,
                email: email,
                phone: phone,
                address_detail: '', 
                ward: '',
                district: '',
                city: ''
            };

            const res = Shop.updateProfile(id, inputData);

            if (res.ok) {
                alert('Cập nhật thông tin thành công!');
                closeModal();
                renderTable(); // Tự động load lại bảng 
            } else {
                alert(res.error || 'Có lỗi xảy ra khi cập nhật!');
            }
        } else {
            // Thêm mới khách hàng (vẫn dùng hàm addCustomer cũ)
            if (!username) {
                alert('Vui lòng nhập tên đăng nhập!');
                return;
            }
            const res = Shop.addCustomer({ username, password, full_name, email, phone });
            
            if (res && res.success) {
                alert(res.message);
                closeModal();
                renderTable(); // Tự động load lại bảng ngay lập tức
            } else {
                alert(res ? res.message : 'Thêm thất bại!');
            }
        }
    });

    // Các hàm gắn vào window để gọi từ nút trong bảng
    window.editCustomer = function (id) {
        const customer = Shop.getUserById(id);
        if (!customer) return;

        modalTitle.innerText = 'Chỉnh sửa thông tin khách hàng';
        inputId.value = customer.id;
        inputUsername.value = customer.username;
        inputUsername.disabled = true; // Không cho sửa username
        groupPassword.style.display = 'none'; // Ẩn ô mật khẩu khi sửa (dùng tính năng đổi pass riêng)
        inputFullname.value = customer.full_name || '';
        inputEmail.value = customer.email || '';
        inputPhone.value = customer.phone || '';

        modal.classList.add('show');
    };

    window.resetPasswordModal = function (id) {
        const customer = Shop.getUserById(id);
        if (!customer) return;

        const newPass = prompt(`Nhập mật khẩu mới cho tài khoản "${customer.username}":`, customer.password);
        if (newPass !== null && newPass.trim() !== '') {
            const res = Shop.resetCustomerPassword(id, newPass.trim());
            alert(res.message);
        }
    };

    window.toggleLock = function (id) {
        const res = Shop.toggleLockCustomer(id);
        if (res.success) {
            renderTable();
        } else {
            alert(res.message);
        }
    };

    window.removeCustomer = function (id) {
        if (confirm('Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản khách hàng này khỏi hệ thống?')) {
            const res = Shop.deleteCustomer(id);
            alert(res.message);
            renderTable();
        }
    };

    // Khởi chạy render lần đầu
    renderTable();
})();