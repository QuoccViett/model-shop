(function () {
    'use strict'

    const form = document.getElementById('admin-login-form');
    const errorBox = document.getElementById('form-error');
    const params = new URLSearchParams(location.search);

    // if (params.get('registered')) {
    //     document.getElementById('form-success').hidden = false;
    // }

    function getRedirect() {
        const target = params.get('redirect') || '';
        if (!target || !/^(?:index|users|categories|products|imports|prices|orders|inventory)\.html(?:[?#]|$)/.test(target)) return 'index.html';
        return target;
    }

    if (Shop.getCurrentAdmin()) {
        location.replace(getRedirect());
        return;
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const result = Shop.loginAdmin(form.elements.username.value, form.elements.password.value);

        if (!result.ok) {
            errorBox.textContent = result.error;
            errorBox.hidden = false;
            errorBox.style.display = 'flex';
            return;
        }

        location.href = getRedirect();
    });
})();
