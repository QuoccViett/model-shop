(function () {
    'use strict'

    const user = Shop.getCurrentUser();
    if (!user) {
        location.replace('login.html?redirect=profile.html');
        return;
    }

    const infoForm = document.getElementById('info-form');
    const pwForm = document.getElementById('pw-form');
    const infoMsg = document.getElementById('info-msg');
    const pwMsg = document.getElementById('pw-msg');

    function showMessage(box, ok, text) {
        box.textContent = text;
        box.className = 'alert ' + (ok ? 'alert-success' : 'alert-error');
        box.hidden = false;
    }

    ['username', 'full_name', 'email', 'phone', 'address_detail', 'ward', 'district', 'city'].forEach(function (name) {
        infoForm.elements[name].value = user[name] || '';
    });

    if (new URLSearchParams(location.search).get('saved')) {
        showMessage(infoMsg, true, 'Đã lưu thông tin.');
    }

    infoForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const result = Shop.updateProfile(user.id, Object.fromEntries(new FormData(infoForm)));
        if (!result.ok) {
            showMessage(infoMsg, false, result.error);
            return;
        }

        location.href = 'profile.html?saved=1';
    });

    pwForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const f = pwForm.elements;
        const result = Shop.changePassword(user.id, f.current.value, f.new_password.value, f.confirm.value);
        if (!result.ok) {
            showMessage(pwMsg, false, result.error);
            return;
        }
        pwForm.reset();
        showMessage(pwMsg, true, 'Đổi mật khẩu thành công.')
    });
})();