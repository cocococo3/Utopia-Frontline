/* ============================================
   JavaScript 数值变化动画
   ============================================ */

// ============================================
// 数值变化动画函数
// ============================================

window.refreshSidebarProgressBars = function () {
  var vars = State.variables || {};
  var power = Number(vars.power) || 0;
  var woreout = Number(vars.woreout) || 0;

  function applyProgress($wrap, labelName, value, maxValue, mode) {
    if (!$wrap || !$wrap.length) return;
    var $label = $wrap.find('.progress-label');
    var $fill = $wrap.find('.progress-fill');
    if (!$label.length || !$fill.length) return;

    var percent = Math.round(Math.max(0, Math.min(100, (value / maxValue) * 100)));
    var baseText = labelName || $label.text().replace(/：\d+%$/, '');
    $label.text(baseText + '：' + percent + '%');

    $fill.removeClass('bar-green bar-yellow bar-red');
    if (mode === 'reverse') {
      if (percent <= 30) $fill.addClass('bar-green');
      else if (percent <= 60) $fill.addClass('bar-yellow');
      else $fill.addClass('bar-red');
    } else {
      if (percent >= 60) $fill.addClass('bar-green');
      else if (percent >= 30) $fill.addClass('bar-yellow');
      else $fill.addClass('bar-red');
    }
    $fill.css('width', percent + '%');
  }

  $('.progress-wrap').each(function () {
    var $wrap = $(this);
    var labelText = ($wrap.find('.progress-label').text() || '').trim();
    if (!labelText) return;

    if (labelText.indexOf('电量') !== -1) {
      applyProgress($wrap, '电量', power, 100, 'normal');
    } else if (labelText.indexOf('磨损') !== -1 || labelText.indexOf('损伤') !== -1) {
      applyProgress($wrap, '磨损度', woreout, 100, 'reverse');
    }
  });
};

if (typeof setup !== 'undefined') {
  setup.refreshSidebarProgressBars = window.refreshSidebarProgressBars;
}

// 用于记录每个元素上正在等待执行的 timeout，避免连续调用时动画被提前打断
var _statTimers = new WeakMap();

function _clearStatTimer(el, key) {
  var timers = _statTimers.get(el);
  if (timers && timers[key]) {
    clearTimeout(timers[key]);
    timers[key] = null;
  }
}

function _setStatTimer(el, key, fn, delay) {
  var timers = _statTimers.get(el);
  if (!timers) {
    timers = {};
    _statTimers.set(el, timers);
  }
  timers[key] = setTimeout(fn, delay);
}

/**
 * 更新技能数值并触发动画
 * @param {string} valueId - 数值元素的ID
 * @param {string} barId - 进度条元素的ID (可选)
 * @param {string} deltaId - 变化指示器元素的ID (可选)
 * @param {number} newValue - 新数值
 * @param {number} maxValue - 最大值 (用于计算进度条)
 */
function updateStat(valueId, barId, deltaId, newValue, maxValue) {
  var valueEl = document.getElementById(valueId);
  if (!valueEl) return;

  var oldValue = parseInt(valueEl.textContent, 10) || 0;
  var diff = newValue - oldValue;
  valueEl.textContent = newValue;

  // 数值变化动画（清除上一次未执行完的移除定时器，避免动画被打断）
  _clearStatTimer(valueEl, 'value');
  valueEl.classList.remove('stat-card__value--increase', 'stat-card__value--decrease');
  void valueEl.offsetWidth; // 强制重排，保证动画能重新触发
  if (diff > 0) {
    valueEl.classList.add('stat-card__value--increase');
  } else if (diff < 0) {
    valueEl.classList.add('stat-card__value--decrease');
  }
  _setStatTimer(valueEl, 'value', function () {
    valueEl.classList.remove('stat-card__value--increase', 'stat-card__value--decrease');
  }, 600);

  // 进度条更新
  if (barId && maxValue) {
    var barEl = document.getElementById(barId);
    if (barEl) {
      barEl.style.width = Math.min(100, Math.max(0, (newValue / maxValue) * 100)) + '%';
    }
  }

  // 变化数值浮动提示（+N / -N）
  if (deltaId && diff !== 0) {
    var deltaEl = document.getElementById(deltaId);
    if (deltaEl) {
      _clearStatTimer(deltaEl, 'delta');
      deltaEl.textContent = diff > 0 ? '+' + diff : diff;
      deltaEl.classList.remove('stat-card__delta--show', 'stat-card__delta--up', 'stat-card__delta--down');
      void deltaEl.offsetWidth; // 强制重排，保证连续同向变化也能重新播放动画
      deltaEl.classList.add('stat-card__delta--show', diff > 0 ? 'stat-card__delta--up' : 'stat-card__delta--down');
      _setStatTimer(deltaEl, 'delta', function () {
        deltaEl.classList.remove('stat-card__delta--show');
      }, 1200);
    }
  }
}