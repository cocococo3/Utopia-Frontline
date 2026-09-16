/* 检测磨损值
$(document).on(':passagedisplay', function () {
    const $body = $('body');
    const woreout = State.variables.woreout || 0;

    if (woreout > 75) {
        $body.addClass('woreoutGlitch');
    } else {
        $body.removeClass('woreoutGlitch');
    }
}); */
