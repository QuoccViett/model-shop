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

    function getRedirect() {
        const target = params.get('redirect') || '';
        if (!target || /^[a-z][a-z0-9+.-]*:|^\/\//i.test(target)) return '../index.html';
        return target;
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const result = Shop.loginCustomer(form.elements.username.value, form.elements.password.value);

        if (!result.ok) {
            errorBox.textContent = result.error;
            errorBox.hidden = false;
            return;
        }

        location.href = getRedirect();
    });
})();