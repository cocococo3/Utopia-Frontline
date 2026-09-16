if (!Macro.has('notify')) {
  Macro.add('notify', {
    tags: [], // 空数组 = 允许包裹内容（container macro）

    handler: function () {
      // 解析持续时间参数，如 "1s"、"1.5s"、"1500ms"，不传则默认2秒
      var raw = this.args.length > 0 ? String(this.args[0]).trim() : '2s';
      var ms = 2000;
      var m = /^([\d.]+)(ms|s)?$/.exec(raw);
      if (m) {
        var num = parseFloat(m[1]);
        var unit = m[2] || 's';
        ms = (unit === 'ms') ? num : num * 1000;
      }

      // 确保有一个固定定位的容器承载所有提示条
      var $container = jQuery('#notifyContainer');
      if ($container.length === 0) {
        $container = jQuery('<div>', { id: 'notifyContainer' }).appendTo('body');
      }

      // 渲染包裹的内容（宏标签之间的文本，支持里面继续写 <<= >> 之类的表达式）
      var $box = jQuery('<div>', { class: 'notifyBox' });
      $box.wiki(this.payload[0].contents);
      $container.append($box);

      // 到时间后淡出移除
      setTimeout(function () {
        $box.fadeOut(300, function () { jQuery(this).remove(); });
      }, ms);
    }
  });
}

// 提示条样式，只注入一次
if (!document.getElementById('notifyStyleTag')) {
  document.head.insertAdjacentHTML('beforeend', `
    <style id="notifyStyleTag">
    #notifyContainer{
      position:fixed; top:20px; right:20px; z-index:9999;
      display:flex; flex-direction:column; gap:8px;
    }
    .notifyBox{
      background:#333; color:#fff; padding:10px 16px;
      border-radius:6px; box-shadow:0 2px 8px rgba(0,0,0,0.3);
      font-size:14px; opacity:0.95;
    }
    </style>
  `);
}

