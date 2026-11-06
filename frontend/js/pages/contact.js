(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const form = document.getElementById('contactForm');
        const submitButton = document.getElementById('contactSubmit');
        const successBox = document.getElementById('contactSuccess');
        const resetButton = document.getElementById('contactReset');
        const fields = {
            fullname: document.getElementById('fullname'),
            email: document.getElementById('email'),
            phone: document.getElementById('phone'),
            message: document.getElementById('message')
        };

        if (!form || !submitButton || !successBox || !resetButton ||
            !fields.fullname || !fields.email || !fields.phone || !fields.message) return;

        function validateField(name) {
            const value = fields[name].value.trim();
            if (name === 'fullname') {
                if (!value) return 'Vui lòng nhập họ và tên.';
                if (value.length < 2 || value.length > 60) return 'Họ và tên phải từ 2 đến 60 ký tự.';
            }
            if (name === 'email') {
                if (!value) return 'Vui lòng nhập email.';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return 'Email không hợp lệ.';
            }
            if (name === 'phone') {
                if (!/^(?:\+84|0)[0-9]{9,10}$/.test(value.replace(/[ .()-]/g, ''))) return 'Số điện thoại không hợp lệ.';
            }
            if (name === 'message') {
                if (!value) return 'Vui lòng nhập nội dung.';
                if (value.length < 10 || value.length > 1000) return 'Nội dung phải từ 10 đến 1000 ký tự.';
            }
            return '';
        }

        function showError(name) {
            const field = fields[name];
            const error = form.querySelector('[data-error-for="' + name + '"]');
            const message = validateField(name);
            if (!error) return message;
            error.textContent = message;
            field.classList.toggle('is-invalid', Boolean(message));
            field.setAttribute('aria-invalid', String(Boolean(message)));
            return message;
        }

        Object.keys(fields).forEach(function (name) {
            fields[name].addEventListener('blur', function () {
                showError(name);
            });
            fields[name].addEventListener('input', function () {
                if (fields[name].classList.contains('is-invalid')) showError(name);
            });
        });

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            const invalidFields = Object.keys(fields).filter(function (name) {
                return Boolean(showError(name));
            });
            if (invalidFields.length) {
                fields[invalidFields[0]].focus();
                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = 'Đang gửi...';
            const saveError = document.getElementById('contactSaveError');
            saveError.hidden = true;
            try {
                const db = Shop.loadDB();
                const messages = db.contact_messages || [];
                const entry = {
                    id: messages.reduce(function (max, item) { return Math.max(max, Number(item.id) || 0); }, 0) + 1,
                    full_name: fields.fullname.value.trim(),
                    email: fields.email.value.trim(),
                    phone: fields.phone.value.trim(),
                    message: fields.message.value.trim(),
                    created_at: Shop.nowString(),
                    is_read: false
                };
                db.contact_messages = messages.concat(entry);
                Shop.saveDB(db);
                form.hidden = true;
                successBox.hidden = false;
                form.reset();
            } catch (error) {
                saveError.textContent = 'Không thể lưu liên hệ. Vui lòng thử lại.';
                saveError.hidden = false;
                submitButton.disabled = false;
                submitButton.textContent = 'Gửi liên hệ';
            }
        });

        resetButton.addEventListener('click', function () {
            successBox.hidden = true;
            form.hidden = false;
            submitButton.disabled = false;
            submitButton.textContent = 'Gửi liên hệ';
        });
    });
})();
