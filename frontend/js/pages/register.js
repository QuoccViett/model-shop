(function (){
    'use strict'

    const form = document.getElementById('register-form');
    const errorBox = document.getElementById('form-error');
    if (Shop.getCurrentUser()) {
        location.replace('../index.html');
        return;
    }

    form.querySelectorAll('input').forEach(function (input) {
        const error = document.createElement('small');
        error.className = 'auth-error';
        input.parentNode.appendChild(error);
        input.addEventListener('input', function () { error.textContent = ''; input.classList.remove('auth-invalid'); });
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form));
        const fields = {
            full_name: data.full_name ? '' : 'Vui lòng nhập họ tên.',
            phone: /^0\d{9}$/.test(data.phone || '') ? '' : 'Số điện thoại gồm 10 số và bắt đầu bằng 0.',
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || '') ? '' : 'Email không hợp lệ.',
            username: /^[A-Za-z0-9_]{4,20}$/.test(data.username || '') ? '' : 'Tên đăng nhập gồm 4-20 ký tự.',
            password: (data.password || '').length >= 6 ? '' : 'Mật khẩu tối thiểu 6 ký tự.',
            confirm: data.password === data.confirm ? '' : 'Mật khẩu nhập lại không khớp.'
        };
        Object.keys(fields).forEach(function (name) {
            const input = form.elements[name];
            input.classList.toggle('auth-invalid', !!fields[name]);
            input.parentNode.querySelector('.auth-error').textContent = fields[name];
        });
        if (Object.keys(fields).some(function (name) { return fields[name]; })) return;
        const result = Shop.registerCustomer(data);

        if (!result.ok) {
            errorBox.textContent = result.error;
            errorBox.hidden = false;
            return;
        }
        const redirect = new URLSearchParams(location.search).get('redirect');
        location.href = redirect && !/^([a-z][a-z0-9+.-]*:|\/\/)/i.test(redirect) ? redirect : '../index.html';
    });
})();