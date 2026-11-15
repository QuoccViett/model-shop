/* Điều hướng nội bộ bằng innerHTML và quản lý tài nguyên theo vòng đời màn hình */
(function () {
    'use strict';
    const baseURL = new URL('./', window.location.href);
    const views = window.ShopViews;
    // Chỉ bốn module nghiệp vụ không giữ DOM màn hình được thực thi một lần trong phiên
    const persistent = new Set(['js/data.js', 'js/common.js', 'js/cart.js', 'js/order-status.js']);
    const loaded = new Set();
    const stylesheets = new Map();
    // Cố định thứ tự CSS dùng chung, member5 không định nghĩa header nên đứng trước header ở mọi trang
    const styleOrder = new Map([...new Set([
        'css/style.css', 'css/member5.css', 'css/header.css',
        ...Object.values(views).flatMap(view => view.css)
    ])].map((src, index) => [new URL(src, baseURL).href, index]));
    const scriptSources = new Map();
    const resourceTimeout = 10000;
    // Vùng chứa ngoài có ID riêng để script trang chỉ cập nhật main có ID app
    const host = document.getElementById('shop-app');
    const nativeAdd = EventTarget.prototype.addEventListener;
    const nativeInterval = window.setInterval;
    const nativeTimeout = window.setTimeout;
    let scope = null;
    let shellScope = null;
    let shellIdentity = null;
    let current;
    let revision = 0;
    let loading = false;
    let pending = null;
    let preparation = null;
    let committed = false;
    let base = document.createElement('base');
    document.head.prepend(base);
    const navigationStyle = document.createElement('style');
    navigationStyle.textContent = `
        a[data-route] { cursor: pointer; }
        html { scrollbar-gutter: stable; }
        #shop-app { min-height: 100vh; }
        #shop-navigation-error { position: fixed; bottom: 16px; left: 16px; z-index: 10000;
            max-width: min(420px, 90vw); padding: 16px; background: #fff; color: #222;
            border: 1px solid #b42318; border-radius: 8px; box-shadow: 0 4px 16px #0002; }
    `;
    document.head.append(navigationStyle);

    // Gắn listener vào scope hiện tại để AbortController dọn chúng khi commit màn hình khác
    EventTarget.prototype.addEventListener = function (type, listener, options) {
        if (scope && type === 'DOMContentLoaded') {
            const owner = scope;
            // Script tải động chạy sau sự kiện gốc nên khởi tạo trong microtask của đúng scope
            queueMicrotask(() => {
                if (owner.signal.aborted || options?.signal?.aborted || !listener) return;
                const event = new Event(type);
                if (typeof listener === 'function') listener.call(this, event);
                else listener.handleEvent(event);
            });
            return;
        }
        if (scope) {
            const settings = typeof options === 'boolean' ? { capture: options } : { ...options };
            if (!settings.signal) settings.signal = scope.signal;
            else {
                // Signal do trang cung cấp vẫn phải chịu việc hủy vòng đời màn hình
                nativeAdd.call(scope.signal, 'abort', () => this.removeEventListener(type, listener, settings), { once: true });
            }
            return nativeAdd.call(this, type, listener, settings);
        }
        return nativeAdd.call(this, type, listener, options);
    };
    // Timer nghiệp vụ thuộc scope màn hình, còn timer tải tài nguyên dùng hàm native riêng
    window.setInterval = function (fn, delay, ...args) {
        const id = nativeInterval(fn, delay, ...args);
        if (scope) nativeAdd.call(scope.signal, 'abort', () => clearInterval(id), { once: true });
        return id;
    };
    window.setTimeout = function (fn, delay, ...args) {
        const id = nativeTimeout(fn, delay, ...args);
        if (scope) nativeAdd.call(scope.signal, 'abort', () => clearTimeout(id), { once: true });
        return id;
    };
    // Trả về mã màn hình từ URL nội bộ, loại bỏ tiền tố thư mục triển khai
    function keyOf(url) { return decodeURIComponent(url.pathname.slice(baseURL.pathname.length)); }
    // Phân giải target tương đối theo màn hình đang hiển thị, không theo HTML nền
    function routeURL(target) { return new URL(target, current || baseURL); }
    // Ánh xạ URL nội bộ thành một trong bốn HTML nền, giữ query và hash public
    function browserURL(url) {
        const key = keyOf(url);
        const file = key.startsWith('admin/') ? 'admin.html' : key === 'pages/products.html' ? 'products.html' : key === 'pages/product.html' ? 'product.html' : 'index.html';
        const result = new URL(file, baseURL);
        result.searchParams.set('view', key);
        for (const [name, value] of url.searchParams) result.searchParams.append(name, value);
        result.hash = url.hash;
        return result;
    }
    // Khôi phục URL nội bộ khi refresh hoặc Back/Forward, dùng home khi view không hợp lệ
    function readRoute() {
        const url = new URL(window.location.href);
        const defaultView = { 'admin.html': 'admin/index.html', 'products.html': 'pages/products.html', 'product.html': 'pages/product.html' };
        const key = url.searchParams.get('view') || defaultView[url.pathname.split('/').pop()] || 'index.html';
        const result = new URL(views[key] ? key : 'index.html', baseURL);
        url.searchParams.delete('view');
        result.search = url.search;
        result.hash = url.hash;
        return result;
    }
    // Chia sẻ Promise stylesheet theo URL, tải với media bất hoạt để không ảnh hưởng trang cũ
    function loadStyle(src) {
        const href = new URL(src, baseURL).href;
        if (stylesheets.has(href)) return stylesheets.get(href).ready;
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.media = 'not all';
        link.fetchPriority = 'high';
        link.dataset.viewStyle = '';
        const entry = { link, ready: null };
        entry.ready = new Promise((resolve, reject) => {
            const timer = nativeTimeout(() => finish(new Error('Hết thời gian tải CSS: ' + src)), resourceTimeout);
            // Kết thúc tải hoặc timeout đều giải phóng handler, lỗi được bỏ cache để thử lại
            function finish(error) {
                clearTimeout(timer);
                link.onload = link.onerror = null;
                if (error) { link.remove(); stylesheets.delete(href); reject(error); }
                else resolve(link);
            }
            link.onload = () => finish();
            link.onerror = () => finish(new Error('Không tải được CSS: ' + src));
        });
        stylesheets.set(href, entry);
        // Chèn đúng vị trí một lần, không di chuyển link đã tải vì trình duyệt sẽ xử lý stylesheet lại
        const next = [...document.querySelectorAll('[data-view-style]')].find(existing =>
            styleOrder.get(existing.href) > styleOrder.get(href));
        document.head.insertBefore(link, next || null);
        return entry.ready;
    }

    // Tải mã script một lần mỗi phiên, Promise dùng chung cho các lượt chuẩn bị liên tiếp
    function prepareScript(src) {
        const href = new URL(src, baseURL).href;
        if (scriptSources.has(href)) return scriptSources.get(href);
        const controller = new AbortController();
        const timer = nativeTimeout(() => controller.abort(), resourceTimeout);
        // Xác thực HTTP cache ở lần đầu của phiên, các lần sau dùng lại Promise trong bộ nhớ
        const ready = fetch(href, { signal: controller.signal, cache: 'no-cache' }).then(response => {
            if (!response.ok) throw new Error('Không tải được JavaScript: ' + src);
            return response.text();
        }).finally(() => clearTimeout(timer)).catch(error => {
            scriptSources.delete(href);
            throw error;
        });
        scriptSources.set(href, ready);
        return ready;
    }

    // Chạy source theo thứ tự manifest và scope hiện tại, src dùng xác định tệp khi báo lỗi
    function loadScript(src, source) {
        const script = document.createElement('script');
        let failure;
        const onError = event => { failure = event.error || new Error(event.message); };
        nativeAdd.call(window, 'error', onError);
        try {
            script.textContent = source;
            document.head.append(script);
            if (failure) throw new Error('Lỗi khởi tạo JavaScript: ' + src, { cause: failure });
        } finally {
            script.remove();
            window.removeEventListener('error', onError);
        }
    }

    // Hủy việc chờ của lượt điều hướng cũ, vẫn cho tài nguyên dùng chung tải vào cache
    function waitForResources(resources, signal) {
        return new Promise((resolve, reject) => {
            const cancel = () => reject(new DOMException('Đã đổi màn hình đích', 'AbortError'));
            nativeAdd.call(signal, 'abort', cancel, { once: true });
            resources.then(resolve, reject).finally(() => signal.removeEventListener('abort', cancel));
            if (signal.aborted) cancel();
        });
    }

    // Giữ trang đang dùng khi tải thất bại và cung cấp nút thử lại cho URL đích
    function showError(url, error) {
        console.error(error);
        document.getElementById('shop-navigation-error')?.remove();
        const notice = document.createElement('div');
        notice.id = 'shop-navigation-error';
        notice.setAttribute('role', 'alert');
        notice.textContent = 'Không tải được màn hình. Vui lòng thử lại. ';
        const retry = document.createElement('button');
        retry.type = 'button';
        retry.textContent = 'Thử lại';
        nativeAdd.call(retry, 'click', () => navigate(url.href, true));
        notice.append(retry);
        document.body.append(notice);
        if (!committed) host.textContent = 'Chưa tải được nội dung';
    }

    // Đồng bộ trạng thái header đang giữ lại, không thay DOM hoặc đăng ký lại listener
    function refreshShell(url) {
        const activeKey = keyOf(url) === 'pages/product.html' ? 'pages/products.html' : keyOf(url);
        host.querySelectorAll('#site-header .hdr-menu-list a[data-route]').forEach(link => {
            const target = new URL(link.dataset.route, baseURL);
            const category = target.searchParams.get('category');
            const active = keyOf(target) === activeKey && (!category || category === url.searchParams.get('category'));
            link.classList.toggle('active', active);
            if (active) link.setAttribute('aria-current', 'page');
            else link.removeAttribute('aria-current');
        });
        // Đóng các bảng tạm để chúng không che nội dung mới, giữ nguyên nút và sự kiện đã gắn
        host.querySelectorAll('#search-suggestions, #header-product-categories, #notification-popup').forEach(panel => { panel.hidden = true; });
        // Bỏ gợi ý cũ để phím Enter không chọn lại kết quả của màn hình trước
        document.getElementById('search-suggestions')?.replaceChildren();
        host.querySelectorAll('#site-header [aria-expanded]').forEach(element => element.setAttribute('aria-expanded', 'false'));
        host.querySelector('.hdr-menu-list')?.classList.remove('is-open');
        const search = document.getElementById('header-search-input');
        if (search) search.value = url.searchParams.get('q') || '';
        const badge = document.getElementById('cart-count');
        if (badge && window.Cart) badge.textContent = String(Cart.getCartCount());
        const name = host.querySelector('.hdr-account-name');
        const user = Shop.getCurrentUser();
        if (name && user) name.textContent = user.full_name || user.username;
    }

    // Chuẩn bị song song tài nguyên, chỉ commit DOM khi CSS và toàn bộ mã script đã sẵn sàng
    async function render(url) {
        // Giữ URL đích cuối cùng và hủy lượt chờ cũ, scope trang đang xem chỉ hủy lúc commit
        if (loading) { pending = url; revision++; preparation?.abort(); return; }
        loading = true;
        const token = ++revision;
        const started = performance.now();
        preparation = new AbortController();
        host.setAttribute('aria-busy', 'true');
        document.getElementById('shop-navigation-error')?.remove();
        let didCommit = false;
        try {
            const view = views[keyOf(url)];
            // Promise.all chỉ tải tài nguyên, tuyệt đối không chạy script phụ thuộc song song
            const resources = Promise.all([
                Promise.all(view.css.map(loadStyle)),
                Promise.all(view.scripts.map(src => persistent.has(src) && loaded.has(src) ? null : prepareScript(src)))
            ]);
            const [links, sources] = await waitForResources(resources, preparation.signal);
            if (token !== revision) return;

            // Module nghiệp vụ dùng lại không phụ thuộc DOM trang, khởi tạo trước khi kiểm tra quyền admin
            for (const [index, src] of view.scripts.entries()) {
                if (!persistent.has(src) || loaded.has(src)) continue;
                const savedScope = scope;
                scope = null;
                try { loadScript(src, sources[index]); loaded.add(src); }
                finally { scope = savedScope; }
            }
            if (token !== revision) return;
            // Guard hiện có chạy trước commit để không lộ nội dung quản trị khi cần chuyển về đăng nhập
            const guardIndex = view.scripts.indexOf('js/admin/auth-guard.js');
            if (guardIndex !== -1) {
                const previousURL = current;
                current = url;
                try { loadScript(view.scripts[guardIndex], sources[guardIndex]); }
                finally { current = previousURL; }
                if (token !== revision) return;
            }

            // Chỉ tái sử dụng khung khách hàng khi đủ header, main, footer và cùng tài khoản, danh mục
            const template = document.createElement('template');
            template.innerHTML = view.html;
            const children = [...template.content.children];
            const hasShell = children.length === 3 && children[0].id === 'site-header' &&
                children[1].tagName === 'MAIN' && children[2].id === 'site-footer';
            const identity = hasShell ? JSON.stringify([
                Shop.getCurrentUser()?.id || null,
                Shop.getCategories().map(category => [category.id, category.name])
            ]) : null;
            const keepShell = hasShell && shellScope && !shellScope.signal.aborted && shellIdentity === identity &&
                host.children[0]?.id === 'site-header' && host.children[1]?.tagName === 'MAIN' && host.children[2]?.id === 'site-footer';

            // Giữ CSS dùng chung đang bật, chỉ tắt stylesheet ngoài màn hình đích
            const activeLinks = new Set(links);
            stylesheets.forEach(({ link }) => {
                const media = activeLinks.has(link) ? 'all' : 'not all';
                if (link.media !== media) link.media = media;
            });
            if (scope) scope.abort();
            // Listener và timer của header sống qua các trang con, chỉ hủy khi thay toàn bộ khung
            if (!keepShell) { shellScope?.abort(); shellScope = null; shellIdentity = null; }
            // Toast nằm ngoài host phải được bỏ cùng màn hình vì timer ẩn nó đã bị hủy
            document.getElementById('cart-toast')?.remove();
            // Popup đơn hàng quản trị cũng nằm ngoài host và có thể đang khóa cuộn
            document.querySelectorAll('body > .order-modal-overlay').forEach(modal => modal.remove());
            document.body.style.overflow = '';
            scope = new AbortController();
            current = url;
            base.href = new URL('./', current).href;
            document.title = view.title;
            document.documentElement.style.visibility = '';
            document.body.className = '';
            document.body.removeAttribute('data-root');
            const attrs = new DOMParser().parseFromString('<body' + view.attributes + '></body>', 'text/html').body;
            for (const attr of attrs.attributes) document.body.setAttribute(attr.name, attr.value);
            // Khung giữ lại cần đường dẫn tuyệt đối vì base thay đổi giữa home và thư mục pages
            if (hasShell) document.body.dataset.root = baseURL.href;
            delete host.dataset.viewReady;
            if (keepShell) host.children[1].replaceWith(children[1]);
            else host.replaceChildren(template.content);
            didCommit = true;
            committed = true;
            // Khởi tạo đồng bộ trước lần vẽ tiếp theo để không lộ HTML chưa có header hoặc dữ liệu
            for (const [index, src] of view.scripts.entries()) {
                if (token !== revision) break;
                if (persistent.has(src) || index === guardIndex) continue;
                if (keepShell && (src === 'js/layout.js' || src === 'js/notifications.js')) continue;
                if (hasShell && src === 'js/layout.js') {
                    const pageScope = scope;
                    shellScope = new AbortController();
                    shellIdentity = identity;
                    scope = shellScope;
                    // Layout và Notifications.init đăng ký sự kiện vào vòng đời riêng của khung
                    try { loadScript(src, sources[index]); }
                    finally { scope = pageScope; }
                } else loadScript(src, sources[index]);
            }
            // Cho callback DOMContentLoaded giả lập chạy trước khi công bố màn hình sẵn sàng
            await Promise.resolve();
            if (token !== revision) return;
            document.documentElement.style.visibility = '';
            if (hasShell) refreshShell(url);
            window.scrollTo(0, 0);
            // Hoàn tất tính style và layout của DOM mới trước khi công bố trạng thái sẵn sàng
            host.getBoundingClientRect();
            host.dataset.viewReady = keyOf(url);
            // Lưu thời gian đến lúc khởi tạo xong để đo bằng Performance API trên trình duyệt
            performance.measure('modelshop:navigation', { start: started, end: performance.now(), detail: { view: keyOf(url) } });
            window.dispatchEvent(new CustomEvent('modelshop:view-ready', {
                detail: { view: keyOf(url), duration: performance.now() - started }
            }));
        } catch (error) {
            if (token === revision) {
                if (didCommit) { scope?.abort(); shellScope?.abort(); shellScope = null; shellIdentity = null; }
                showError(url, error);
            }
        } finally {
            document.documentElement.style.visibility = '';
            host.setAttribute('aria-busy', 'false');
            preparation = null;
            loading = false;
            if (pending) { const next = pending; pending = null; render(next); }
        }
    }
    // target nhận URL nội bộ, replace quyết định thay mục hiện tại hay thêm mục History mới
    function navigate(target, replace = false) {
        const url = routeURL(target);
        if (url.origin !== baseURL.origin || !views[keyOf(url)]) return;
        // Bỏ thao tác bấm lại cùng URL đã sẵn sàng, reload vẫn có thể gọi render trực tiếp
        if (!loading && host.dataset.viewReady && url.href === current?.href && !document.getElementById('shop-navigation-error')) return;
        history[replace ? 'replaceState' : 'pushState'](null, '', browserURL(url));
        render(url);
    }
    // Giữ API location cho script cũ, các lệnh chuyển trang đều đi qua router
    const virtualLocation = {
        get pathname() { return current.pathname; },
        get search() { return current.search; },
        get hash() { return window.location.hash; },
        get origin() { return baseURL.origin; },
        get href() { return current.href; },
        set href(value) { navigate(value); },
        replace(value) { navigate(value, true); },
        assign(value) { navigate(value); },
        reload() { render(current); }
    };
    window.App = {
        navigate, location: virtualLocation,
        // Cập nhật hash hoặc query tại chỗ mà không khởi tạo lại màn hình đang dùng
        replaceState(state, title, target) {
            current = routeURL(target);
            history.replaceState(state, title, browserURL(current));
        }
    };
    // Một listener thường trực xử lý data-route cho cả liên kết tạo động
    nativeAdd.call(document, 'click', event => {
        const link = event.target.closest('a[data-route]');
        if (!link || event.defaultPrevented) return;
        const target = link.dataset.route;
        if (!target || target === '#') { event.preventDefault(); return; }
        const url = routeURL(target);
        if (url.origin !== baseURL.origin) {
            if (['https:', 'http:', 'mailto:', 'tel:'].includes(url.protocol)) {
                event.preventDefault();
                window.open(url.href, '_blank', 'noopener');
            }
            return;
        }
        if (!views[keyOf(url)]) return;
        event.preventDefault();
        navigate(target);
    });
    // Bổ sung phím Enter cho liên kết điều hướng không có href
    nativeAdd.call(document, 'keydown', event => {
        if (event.key === 'Enter' && event.target.matches('a[data-route]')) event.target.click();
    });
    // Chỉ quét nhánh DOM vừa thêm thay vì quét lại toàn trang sau mỗi mutation
    function prepareLinks(node) {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        const links = [...node.querySelectorAll('a[data-route]:not([tabindex])')];
        if (node.matches('a[data-route]:not([tabindex])')) links.push(node);
        links.forEach(link => {
            link.tabIndex = 0; link.setAttribute('role', 'link');
        });
    }
    new MutationObserver(mutations => {
        mutations.forEach(mutation => mutation.addedNodes.forEach(prepareLinks));
    }).observe(host, { childList: true, subtree: true });
    // Back/Forward chỉ render URL đã có trong History, không tạo thêm mục lịch sử
    nativeAdd.call(window, 'popstate', () => render(readRoute()));
    host.textContent = 'Đang tải nội dung…';
    navigate(readRoute().href, true);
})();
