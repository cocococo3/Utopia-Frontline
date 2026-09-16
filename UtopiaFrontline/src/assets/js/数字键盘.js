/*========= 按下数字 = 点击顺序的选项 (支持 Shift+数字 ≥10) ===========*/

window.currentLinkTargets = [];

$(document).on(':passagerender', function (ev) {
    window.currentLinkTargets = [];

    const $content = $(ev.content);
    const $links = $content.find('a.link-internal, a.link, a.macro-link');

    $links.each(function (i) {
        const $this = $(this);
        const passage = $this.attr('data-passage');
        const number = i + 1;

        // 保存目标
        window.currentLinkTargets.push({
            $el: $this,
            passage: passage || null
        });

        // 生成显示编号文本
        let label;
        if (number <= 9) {
            label = `[${number}] `;
        } else {
            // 10→Shift+1, 11→Shift+2 ...
            label = `[Shift+${number - 9}] `;
        }

        // 避免重复编号
        if (!$this.attr('data-numbered')) {
            $this
                .attr('data-numbered', 'true')
                .prepend(`<span class="link-number">${label}</span>`);
        }
    });

    console.log("当前页面链接目标:", window.currentLinkTargets.map(x => x.passage || x.$el.text()));
});

$(document).on('keydown', function (ev) {
    if (!window.currentLinkTargets.length) return;

    let index = -1;

    // 上排数字键 1–9
    if (ev.keyCode >= 49 && ev.keyCode <= 57) {
        index = ev.keyCode - 49; // 0–8
    }
    // 小键盘 1–9
    else if (ev.keyCode >= 97 && ev.keyCode <= 105) {
        index = ev.keyCode - 97;
    }

    // Shift + 数字 → 对应 10 以上
    if (ev.shiftKey && index >= 0) {
        index += 9;
    }

    if (index >= 0 && index < window.currentLinkTargets.length) {
        const target = window.currentLinkTargets[index];
        console.log(`触发选项 ${index + 1}:`, target.passage || target.$el.text().trim());

        if (target.passage) Engine.play(target.passage);
        else target.$el[0].click();

        // 高亮反馈
        target.$el.addClass('link-flash');
        setTimeout(() => target.$el.removeClass('link-flash'), 200);
    }
});
