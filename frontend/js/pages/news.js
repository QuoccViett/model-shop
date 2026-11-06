(function () {
    'use strict';
    const articles = [
    {
        "id": 1,
        "title": "List Mô Hình Bandai Tháng 10/2026",
        "day": "28",
        "month": "10/2026",
        "content": "Tổng hợp 16 mẫu mô hình Bandai tháng 10/2026, đa dạng từ HG, HGUC, MG đến các bộ phụ kiện Gunpla. Nổi bật với MG Hi-Nu Ver.Ka, HG Penelope, Destiny Gundam Spec II & Zeus Silhouette. Anh em tham khảo danh sách và liên hệ GDC để được tư vấn, đặt hàng nhé!"
    },
    {
        "id": 2,
        "title": "Mua Robo Trái Cây ở Hà Nội – Địa chỉ Gundamchat dành cho anh em mê model kit",
        "day": "06",
        "month": "10/2026",
        "content": "Nếu bạn đang tìm Robo Trái Cây Hà Nội, muốn mua trực tiếp, xem mẫu trước khi lựa chọn hoặc tìm một địa chỉ chuyên về model kit, Gundamchat là địa chỉ có thể tham khảo tại khu vực Cầu Giấy, Hà Nội..."
    },
    {
        "id": 3,
        "title": "PG UNLEASHED 1/60 RX-93 ν GUNDAM – ĐỈNH CAO GUNPLA 45 NĂM (PGU NU)",
        "day": "05",
        "month": "10/2026",
        "content": "Kỷ niệm 45 năm GUNPLA, Bandai đưa Mobile Suit biểu tượng của Amuro Ray lên dòng cao cấp nhất: Perfect Grade Unleashed 1/60 RX-93 ν Gundam..."
    },
    {
        "id": 4,
        "title": "List Hàng Bandai cuối Tháng 9/2026",
        "day": "21",
        "month": "09/2026",
        "content": "Bản tin List Hàng Bandai cuối Tháng 9/2026. Hiện bài lưu nội bộ chỉ có tiêu đề và ngày đăng; chưa có nội dung chi tiết."
    },
    {
        "id": 5,
        "title": "List Bandai Tháng 6/2026",
        "day": "02",
        "month": "06/2026",
        "content": "Bản tin List Bandai Tháng 6/2026. Hiện bài lưu nội bộ chỉ có tiêu đề và ngày đăng; chưa có nội dung chi tiết."
    },
    {
        "id": 6,
        "title": "List Bandai Tháng 5 Mới Về",
        "day": "11",
        "month": "05/2026",
        "content": "Bản tin List Bandai Tháng 5 Mới Về. Hiện bài lưu nội bộ chỉ có tiêu đề và ngày đăng; chưa có nội dung chi tiết."
    },
    {
        "id": 7,
        "title": "List Bandai Tháng 3/2026",
        "day": "14",
        "month": "03/2026",
        "content": "Bản tin List Bandai Tháng 3/2026. Hiện bài lưu nội bộ chỉ có tiêu đề và ngày đăng; chưa có nội dung chi tiết."
    },
    {
        "id": 8,
        "title": "List Gundam - 30MM - 30MS - 30MF - Pokemon Tháng 7/2025 Bandai",
        "day": "21",
        "month": "07/2025",
        "content": "Danh sách đặt hàng MG, RG, HG, 30MF Bandai tháng 7/2025..."
    }
];
    const esc = Shop.escapeHtml;
    const params = new URLSearchParams(location.search);
    const pageSize = 4;
    const pageCount = Math.ceil(articles.length / pageSize);
    const requestedPage = Number(params.get('page'));
    const page = Number.isInteger(requestedPage) ? Math.max(1, Math.min(pageCount, requestedPage)) : 1;
    const content = document.getElementById('news-content');
    const pagination = document.getElementById('news-pagination');
    function articleUrl(article) { return 'news.html?id=' + article.id + '&page=' + page; }
    function meta(article) { return '<p class="news-item__meta">Ngày đăng: ' + article.day + '/' + article.month + '</p>'; }
    if (params.has('id')) {
        const article = articles.find(function (item) { return String(item.id) === params.get('id'); });
        const back = '<p><a href="news.html?page=' + page + '">← Trở về tin tức</a></p>';
        content.innerHTML = article ? '<article><h2>' + esc(article.title) + '</h2>' + meta(article) +
            '<p style="white-space:pre-line;line-height:1.8">' + esc(article.content) + '</p>' + back + '</article>' : '<p>Không tìm thấy bài viết.</p>' + back;
        if (article) document.title = article.title + ' - ModelShop';
        pagination.hidden = true;
        return;
    }
    content.innerHTML = articles.slice((page - 1) * pageSize, page * pageSize).map(function (article) {
        const url = articleUrl(article);
        return '<article class="news-item"><a class="news-item__date" href="' + url + '" aria-label="' + esc(article.title) + '">' +
            '<span class="news-item__day">' + article.day + '</span><span class="news-item__month">' + article.month + '</span></a>' +
            '<div class="news-item__body"><h3 class="news-item__title"><a href="' + url + '">' + esc(article.title) + '</a></h3>' +
            meta(article) + '<p class="news-item__excerpt">' + esc(article.content) + '</p></div></article>';
    }).join('');
    function pageLink(number, label) {
        return '<a href="news.html?page=' + number + '"' + (number === page ? ' class="is-active" aria-current="page"' : '') +
            ' aria-label="Trang ' + number + '">' + label + '</a>';
    }
    let links = page > 1 ? pageLink(page - 1, '«') : '';
    for (let number = 1; number <= pageCount; number++) links += pageLink(number, number);
    if (page < pageCount) links += pageLink(page + 1, '»');
    pagination.innerHTML = links;
})();
