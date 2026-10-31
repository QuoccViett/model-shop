(function () {
    'use strict'

    const form = document.getElementById('login-form');
    const errorBox = document.getElementById('form-error');
    const params = new URLSearchParams(location.search);

    if (Shop.getCurrentUser()) {
        location.replace('../index.html');
        return;
    }

    if (params.get('registered')) {
        document.getElementById('form-success').hidden = false;
    }
    form.querySelectorAll('input').forEach(function (input) {
        const error = document.createElement('small');
        error.className = 'auth-error';
        input.parentNode.appendChild(error);
        input.addEventListener('input', function () { error.textContent = ''; input.classList.remove('auth-invalid'); });
    });

    function getRedirect() {
        const target = params.get('redirect') || '';
        if (!target || /^[a-z][a-z0-9+.-]*:|^\/\//i.test(target)) return '../index.html';
        return target;
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        form.querySelectorAll('input').forEach(function (input) { input.classList.remove('auth-invalid'); input.nextElementSibling.textContent = ''; });
        if (!form.elements.username.value.trim()) {
            form.elements.username.classList.add('auth-invalid');
            form.elements.username.nextElementSibling.textContent = 'Vui lòng nhập tên đăng nhập.';
            return;
        }
        if (form.elements.password.value.length < 6) {
            form.elements.password.classList.add('auth-invalid');
            form.elements.password.nextElementSibling.textContent = 'Mật khẩu tối thiểu 6 ký tự.';
            return;
        }
        const result = Shop.loginCustomer(form.elements.username.value, form.elements.password.value);

        if (!result.ok) {
            errorBox.textContent = result.error;
            errorBox.hidden = false;
            return;
        }

        location.href = getRedirect();
    });
})();