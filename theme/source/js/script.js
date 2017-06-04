$(document).on('turbolinks:load', function () {
    if (site_config.logo) {
        var i = new Image;
        i.src = site_config.logo;
        $(i).on('load', function () {
            var that = this;
            setTimeout(function() {
                $('#logo > img').replaceWith($(that));
            }, 150);
        });
    }

    (function () {
        var toggleBtnIcon = $('.toggle-btn > i');
        var sideBar = $('#sidebar');
        var main = $('main');
        var current = 0;
        $('.toggle-btn').click(function () {
            const next = ++current % 2;
            toggleBtnIcon.removeClass()
            if (next) {
                $(this).css('left', '0');
                sideBar.removeClass('show').addClass('hide');
                toggleBtnIcon.addClass('fa fa-chevron-right');
                main.addClass('big');
                localStorage && localStorage.setItem('no_show_sidebar', 'yes');
            } else {
                $(this).css('left', '38%');
                sideBar.removeClass('hide').addClass('show');
                toggleBtnIcon.addClass('fa fa-chevron-left');
                main.removeClass('big');
                localStorage && localStorage.removeItem('no_show_sidebar');
            }
        });
        var noShowSidebar = localStorage && localStorage.getItem('no_show_sidebar');
        if (noShowSidebar) {
            $('.toggle-btn').click();
        }
    })();
});
