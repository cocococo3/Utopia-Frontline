/* =====================================================================
 *  本文件是完整替换版，可以直接覆盖你项目里对应的 Story JavaScript。
 *  相比上一版多头袭击的增量片段，这次补回了：
 *    - addLog / _logHistory 初始化
 *    - :passagedisplay 顶部日志横幅（这是"上方显示袭击信息"的真正实现，
 *      上次给的是增量片段，没包含这段，如果你直接整体替换了文件，
 *      这个横幅就会连带消失——这次是完整文件，不会再丢）
 *    - advanceTimeByMinutes / nowWorldMin（时间工具）
 *    - checkDirtyAutoClean（脏区到点自动清理兜底）
 *    - toggleRaid + <<toggleRaid>> 宏
 *    - startCleaningScene（清洁小游戏场景入口，未改动）
 *
 *  本次改动：
 *    - 清道夫不再由 JS 在 resolveReinforcementRound 里强制
 *      Engine.play("清理确认")。JS 只负责在 _applyAfterFight 里把
 *      现场信息写进 $dirtyZones（数组，天然支持多个现场同时存在）。
 *      要不要去清理、什么时候提示玩家，交给 Twine 侧的
 *      "清道夫任务提示" widget（见战斗代码那份文件的追加部分）主动
 *      读取 $dirtyZones 来处理，不再由 JS 后台 tick 强行打断玩家。
 * ===================================================================== */


/* === 全局日志存储 === */
if (!State.variables._logHistory) {
  State.variables._logHistory = [];
}

function addLog(html) {
  const timestamp = formatWorldTime();
  const entryHTML = `<span style="color:#ff9;">${timestamp}</span><br>${html}`;
  State.variables._logHistory.push(entryHTML);
  if (State.variables._logHistory.length > 10) {
    State.variables._logHistory.shift();
  }
}

/* === Passage 显示时自动插入最新日志（"上方显示袭击信息"的实现） === */
$(document).on(':passagedisplay', () => {
  const active = State.variables.identityactivation === true;
  const history = State.variables._logHistory;
  if (!active || !history || history.length === 0) return;

  const latest = history[history.length - 1];
  const $passage = $('#passages').children('.passage').last();

  if ($passage.length) {
    $passage.find('.inline-log').remove();
    const logDiv = $('<div>')
      .addClass('inline-log')
      .html(`<div class="inline-log-entry">${latest}</div>`);
    $passage.prepend(logDiv);
  }
});


/* === 时间工具 === */
window.advanceTimeByMinutes = function (delta) {
  const t = State.variables.time;
  if (!t || typeof delta !== "number" || delta <= 0) return;

  t.totalMinutes = (t.totalMinutes ?? 0) + delta;

  const dayAdd = Math.floor(t.totalMinutes / 1440);
  if (dayAdd > 0) {
    t.day = (t.day ?? 1) + dayAdd;
    t.totalMinutes -= dayAdd * 1440;
  }

  t.hour = Math.floor(t.totalMinutes / 60);
  t.minute = t.totalMinutes % 60;
};

function nowWorldMin() {
  return State.variables.time?.totalMinutes ?? 0;
}


/* =====================================================================
 *  袭击系统：$activeAttacks[] 数组 + 数量闸门
 * ===================================================================== */

setup.ensureActiveAttacksArray = function () {
  if (!Array.isArray(State.variables.activeAttacks)) {
    State.variables.activeAttacks = [];
  }
  if (State.variables.activeAttack) {
    const legacy = State.variables.activeAttack;
    if (!legacy.id) legacy.id = setup.nextRaidId();
    State.variables.activeAttacks.push(legacy);
    State.variables.activeAttack = null;
  }
};

setup.nextRaidId = function () {
  State.variables.raidIdSeq = (State.variables.raidIdSeq ?? 0) + 1;
  return State.variables.raidIdSeq;
};

setup.getMaxConcurrentRaids = function () {
  return State.variables.maxConcurrentRaids ?? 1;
};

setup.findAttackById = function (id) {
  setup.ensureActiveAttacksArray();
  return State.variables.activeAttacks.find(a => a.id === id) || null;
};

setup.findAttackAt = function (layer, block) {
  setup.ensureActiveAttacksArray();
  const normLayer = setup.normLayer(layer);
  return State.variables.activeAttacks.find(a =>
    !a.resolved &&
    setup.normLayer(a.layer) === normLayer &&
    a.block === block
  ) || null;
};

setup.removeAttack = function (atk) {
  setup.ensureActiveAttacksArray();
  if (!atk) return;
  State.variables.activeAttacks = State.variables.activeAttacks.filter(a => a.id !== atk.id);
};

Macro.add('setMaxConcurrentRaids', {
  handler() {
    const n = Number(this.args[0]);
    if (!isNaN(n) && n > 0) {
      State.variables.maxConcurrentRaids = n;
    }
  }
});


/**
 * 由 SugarCube 生成袭击数据后，调用本函数把它加进 $activeAttacks[]
 */
setup.beginRaidFromSC = function (payload) {
  setup.ensureActiveAttacksArray();

  if (!payload || typeof payload !== "object") {
    console.warn("beginRaidFromSC: payload 无效", payload);
    return;
  }

  const {
    layer, block,
    monsterName, monsterHP, monsterATK,
    squadName, squadForce
  } = payload;
  const normLayer = setup.normLayer(layer);
  const hp = Number(monsterHP) || 0;
  const atkVal = Number(monsterATK) || 0;

  if (!layer || !block || !monsterName || typeof squadForce !== "number") {
    console.warn("beginRaidFromSC: payload 字段缺失", payload);
    return;
  }

  if (State.variables.activeAttacks.length >= setup.getMaxConcurrentRaids()) {
    console.log("beginRaidFromSC: 已达到最大同时袭击数量，跳过本次生成");
    return;
  }

  if (setup.findAttackAt(normLayer, block)) {
    console.log("beginRaidFromSC: 该区块已有未解决的袭击，跳过本次生成", { layer: normLayer, block });
    return;
  }

  const monsterForce = (typeof payload.monsterForce === "number")
    ? payload.monsterForce
    : Math.round(hp * 0.6 + atkVal * 1.2);

  addLog(
    `<b>警报</b>：${layer}层「${block}」出现 ${monsterName}` +
    `（HP:${monsterHP} / ATK:${monsterATK} / 战力≈${monsterForce}）`
  );

  const resolveAt = nowWorldMin() + 30;

  const atk = {
    id: setup.nextRaidId(),

    layer: normLayer,
    block,

    monster: monsterName,
    monsterForce,

    monsterHP: hp,
    monsterATK: atkVal,

    squadName,
    squadForce,

    posbeforeFight: {
      ...State.variables.playerPos,
      layer: setup.normLayer(State.variables.playerPos?.layer)
    },

    inCombat: false,
    resolved: false,

    resolveAt,
    nextReinforceAt: null,
    failedForce: 0,
    round: 0
  };

  State.variables.activeAttacks.push(atk);
};


window.checkAttackSchedule = function () {
  setup.raidSpawnTick();
  setup.ensureActiveAttacksArray();

  const snapshot = State.variables.activeAttacks.slice();

  for (const atk of snapshot) {
    if (atk.resolved) continue;
    if (atk.inCombat) continue;

    if (typeof atk.resolveAt === "number" && nowWorldMin() >= atk.resolveAt) {
      window.resolveActiveAttackByNPC(atk);
      continue;
    }

    if (typeof atk.nextReinforceAt === "number" && nowWorldMin() >= atk.nextReinforceAt) {
      window.resolveReinforcementRound(atk);
    }
  }
};


/*****************************************************************
 *  战斗 / 袭击结束后的统一后处理
 *  只负责"结果落地"：写日志 + 标记脏区 + 从数组移除。
 *  不再包含任何"清道夫"专属逻辑——是否需要清理、何时提示玩家，
 *  全部交给 Twine 侧读取 $dirtyZones 来判断。
 *****************************************************************/
window._applyAfterFight = function (atk) {
  if (!atk) {
    console.warn("_applyAfterFight: 未提供 atk 参数");
    return;
  }
  if (atk._applied) return;
  atk._applied = true;

  const now = State.variables.time?.totalMinutes ?? 0;

  addLog(`<b>事件结束</b>：${atk.layer}层「${atk.block}」的 ${atk.monster} 已被击退`);

  if (!State.variables.dirtyZones) State.variables.dirtyZones = [];
  State.variables.dirtyZones.pushUnique({
    layer: atk.layer,
    block: atk.block,
    since: now,
    autoCleanAt: now + 60
  });

  setup.removeAttack(atk);
};


window.resolveActiveAttackByNPC = function (atk) {
  if (!atk || atk.resolved || atk.inCombat) return;

  const { squadName, squadForce, monster, monsterForce, layer, block } = atk;
  const r1 = random(1, 100) + squadForce;
  const r2 = random(1, 100) + monsterForce;

  if (r1 >= r2) {
    addLog(`<b>战斗结果</b>：${squadName} 消灭了 ${monster}！`);

    if (!atk.inCombat) {
      atk.resolved = true;
      window._applyAfterFight(atk);
    }

  } else {
    addLog(`<b>战斗结果</b>：${squadName} 失败，开始呼叫最近的援军`);

    atk.round = 2;
    atk.failedForce = squadForce;
    atk.nextReinforceAt = nowWorldMin() + 15;
  }
};


/*****************************************************************
 *  无限援军循环。
 *  【已移除】原本这里在每轮失败时会检查 playerJob === "清道夫"，
 *  然后 addLog + 设置 $pendingLayer/$pendingBlock + 强制
 *  Engine.play("清理确认")。现在不再需要——反正 _applyAfterFight
 *  最终会把现场写进 $dirtyZones，清道夫要不要去处理由 Twine 侧的
 *  widget 自己去读 $dirtyZones 展示，不需要 JS 半路打断玩家。
 *****************************************************************/
window.resolveReinforcementRound = function (atk) {
  if (!atk || atk.resolved || atk.inCombat) return;

  const npcF = State.variables.npcForce || {};
  const npcPool = Object.keys(npcF);
  if (!npcPool.length) {
    addLog(`<b>无人可援</b>：${atk.monster} 彻底失控！`);
    return;
  }

  const newSquadName = npcPool.random();
  const newForce = npcF[newSquadName] ?? 0;

  const failedForce = atk.failedForce ?? 0;
  const totalForce = newForce + failedForce / 2;

  const rollAtt = random(1, 100) + totalForce;
  const rollDef = random(1, 100) + atk.monsterForce;

  const round = atk.round ?? 2;

  if (rollAtt >= rollDef) {
    addLog(`<b>援军到达</b>：${newSquadName} 击退了 ${atk.monster}`);
    atk.resolved = true;
    window._applyAfterFight(atk);
    return;
  }

  addLog(`<b>第${round}轮失败</b>：${newSquadName} 未能击退 ${atk.monster}`);

  atk.failedForce = failedForce + newForce;
  atk.round = round + 1;
  atk.nextReinforceAt = nowWorldMin() + 15;
};


setup.raidSpawnTick = function () {
  setup.ensureActiveAttacksArray();

  if (State.variables.activeAttacks.length >= setup.getMaxConcurrentRaids()) {
    return;
  }

  if (typeof State.variables.attackCountdown !== "number") {
    State.variables.attackCountdown = 0;
  }

  const x = (typeof random === "function")
    ? random(1, 100)
    : (Math.floor(Math.random() * 100) + 1);

  if (x < 10 || State.variables.attackCountdown <= 0) {
    new Wikifier(null, '<<spawnRaidSC>>');
    State.variables.attackCountdown = 10;
  } else {
    State.variables.attackCountdown -= 1;
  }
};


window.checkDirtyAutoClean = function () {
  const now = State.variables.time?.totalMinutes ?? 0;
  const dz = State.variables.dirtyZones || [];
  if (!dz.length) return;

  const due = dz.filter(z => typeof z.autoCleanAt === "number" && now >= z.autoCleanAt);
  if (!due.length) return;

  State.variables.dirtyZones = dz.filter(z => !(typeof z.autoCleanAt === "number" && now >= z.autoCleanAt));

  if (!State.variables.cleanLog) State.variables.cleanLog = [];
  due.forEach(z => {
    State.variables.cleanLog.push({
      layer: z.layer,
      block: z.block,
      cleaner: "清道夫小队",
      time: now
    });
    addLog(`<b>清洁完成</b>：${z.layer}层「${z.block}」已恢复（自动）`);
  });
};


/* === 定时自动触发袭击（可选开关，独立于 raidSpawnTick 的被动检查） === */
setup.raidTimer = null;

setup.toggleRaid = function (on) {
  if (!on) {
    if (setup.raidTimer) clearInterval(setup.raidTimer);
    setup.raidTimer = null;
    return;
  }
  if (setup.raidTimer) return;

  setup.raidTimer = setInterval(() => {
    const prob = State.variables.raidRate || 0.005;
    if (Math.random() < prob) {
      Engine.play("AutoRaid");
    }
  }, 60000);
};

Macro.add('toggleRaid', {
  handler() {
    const on = this.args[0] !== false;
    setup.toggleRaid(on);
  }
});


/* === 清洁小游戏场景入口（未改动，由 Twine 侧的清道夫 widget 调用） === */
window.startCleaningScene = function (layer, block) {
  if (!layer || !block) {
    console.warn("startCleaningScene: 参数缺失！layer 或 block 未定义。");
    return;
  }

  const dirtBase = 20 + random(0, 30);

  State.temporary.workLayer    = layer;
  State.temporary.workBlock    = block;
  State.temporary.dirt         = dirtBase;
  State.temporary.initialDirt  = dirtBase;
  State.temporary.cleanPerTurn = 8 + random(0, 4);
  State.temporary.wear         = 0;

  const wm = nowWorldMin();
  State.variables.lastLogZone = {
    layer,
    block,
    time: wm,
    worldMin: wm
  };

  Engine.play("工作开始");
};


/* =====================================================================
 *  :passagestart 拦截器：玩家撞进袭击区域时锁定具体是数组里哪一个
 * ===================================================================== */
$(document).on(':passagestart', function (ev) {
  setup.ensureActiveAttacksArray();
  const pos = State.variables.playerPos;
  if (!pos) return;

  const nextPassage = ev?.passage?.title;

  const atk = setup.findAttackAt(pos.layer, pos.block);
  if (!atk) return;

  if (State.variables.notfight === true) {
    console.log("[raid intercept skipped by notfight]", { atk, pos, nextPassage });
    return;
  }

  console.log("[raid intercept]", { atk, pos, nextPassage });

  atk.inCombat = true;

  State.variables.posbeforefight =
    (State.variables.playerPos && typeof State.variables.playerPos === "object")
      ? {
          ...State.variables.playerPos,
          layer: setup.normLayer(State.variables.playerPos.layer)
        }
      : State.variables.playerPos;

  State.variables.inCombat = true;
  State.variables.pendingAttack = atk;

  if (nextPassage === "怪物入场" || nextPassage === "combat") return;

  if (atk._redirecting) return;
  atk._redirecting = true;

  setTimeout(() => {
    Engine.play("怪物入场");
    atk._redirecting = false;
  }, 0);
});


window.exitCombatState = function (opts = {}) {
  const clearAttack = opts.clearAttack !== false;

  State.variables.inCombat = false;

  const atk = State.variables.pendingAttack;
  if (atk) {
    atk.inCombat = false;
  }

  State.variables.pendingAttack = null;

  if (clearAttack && atk) {
    if (typeof window._applyAfterFight === "function") {
      atk.resolved = true;
      window._applyAfterFight(atk);
    } else {
      setup.removeAttack(atk);
    }
  }
};