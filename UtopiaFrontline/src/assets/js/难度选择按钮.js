$(document).on(':passagerender', function (ev) {
    var $content = $(ev.content);

    $content.find('.vertical-btn').each(function () {
        var $btn = $(this);

        if ($btn.data('difficulty-bound')) return;
        $btn.data('difficulty-bound', true);

        $btn.on('click', function (e) {
            e.preventDefault();

            var raw = $btn.attr('data-set') || '{}';
            var settings = {};

            try {
                settings = JSON.parse(raw);
            } catch (err) {
                console.error('难度按钮 data-set 解析失败:', raw, err);
                settings = {};
            }

            Object.keys(settings).forEach(function (key) {
                var varName = key.replace(/^\$/, '');
                if (varName) {
                    State.variables[varName] = settings[key];
                }
            });

            var passage = $btn.attr('data-passage');
            if (passage) {
                Engine.play(passage);
            }

            $btn.removeClass('clicked');
            void $btn[0].offsetWidth;
            $btn.addClass('clicked');
            setTimeout(function () {
                $btn.removeClass('clicked');
            }, 800);
        });
    });
});