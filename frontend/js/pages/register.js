(function (){
    'use strict'

    const form = document.getElementById('register-form');
    const errorBox = document.getElementById('form-error');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form));
        const result = Shop.registerCustomer(data);

        if (!result.ok) {
            errorBox.textContent = result.error;
            errorBox.hidden = false;
            return;
        }
        location.href = 'login.html?registered=1';
    });
})();