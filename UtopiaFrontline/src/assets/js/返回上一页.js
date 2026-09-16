// 使用普通变量存储配置，而不是 Config 对象
var HISTORY_SKIP_TAGS = ["no-history", "sidebar", "战斗回"];

Config.navigation.override = function (dest) {
    try {
        var sv = State.variables;
        if (!Array.isArray(sv.paths)) sv.paths = [];
        if (typeof sv.pathIndex !== "number") {
            sv.pathIndex = sv.paths.length - 1;
        }

        if (typeof dest !== "string" || dest.length === 0) return undefined;

        // 战斗进行中：完全不记录/不移动指针
        if (sv.inCombat === true || (sv.combat && sv.combat.active === true)) {
            return undefined;
        }

        // ---------- ① 这是一次"返回"导航：只移动指针，绝不新增记录 ----------
        if (sv.isReturn) {
            sv.isReturn = false;

            // ★ 优先信任 creturn 在生成按钮时就已经算好、随点击一起传过来的
            // sv.returnTargetIndex —— 它是在渲染那一刻用 State.passage 精确
            // 判断过"当前页有没有被记录"之后算出来的，不存在歧义。
            // 只有这个值缺失/失效（比如被别的代码意外清空）时，才退化成
            // lastIndexOf 兜底搜索。
            var idx = -1;
            if (
                typeof sv.returnTargetIndex === "number" &&
                sv.returnTargetIndex >= 0 &&
                sv.returnTargetIndex < sv.paths.length &&
                sv.paths[sv.returnTargetIndex] === dest
            ) {
                idx = sv.returnTargetIndex;
            } else {
                idx = sv.paths.lastIndexOf(dest, Math.max(0, sv.pathIndex - 1));
                if (idx === -1) idx = Math.max(0, sv.pathIndex - 1);
            }

            sv.pathIndex = idx;
            sv.returnTargetIndex = undefined;
            return undefined;
        }

        // ---------- ② tag 跳过：这类passage根本不进历史，指针也不动 ----------
        var destPassage = null;
        try {
            destPassage = Story.get(dest);
        } catch (e) {
            destPassage = null;
        }
        var destTags = (destPassage && Array.isArray(destPassage.tags)) ? destPassage.tags : [];
        var shouldSkip = destTags.some(function (tag) {
            return HISTORY_SKIP_TAGS.includes(tag);
        });
        if (shouldSkip) {
            return undefined;
        }

        // ---------- ③ 正常前进导航 ----------
        // ★ 用 State.passage（当前实际显示、即将被离开的passage）判断是否
        // 是"重复导航到自身"，而不是用 paths[pathIndex]——后者在"当前页本身
        // 没被记录"的情况下是不可信的（这正是这次要修的 bug 的根源）。
        var leavingPassage = State.passage;
        if (leavingPassage === dest) {
            return undefined; // 连续导航到同一passage，不重复记录
        }

        // 如果之前发生过"返回"，指针会停在数组中间；这时候再往新方向前进，
        // 需要把指针之后已经不属于当前时间线的"旧记录"截掉
        sv.paths.length = sv.pathIndex + 1;
        sv.paths.push(dest);
        sv.pathIndex = sv.paths.length - 1;

        if (sv.paths.length > 100) {
            sv.paths.shift();
            sv.pathIndex -= 1;
        }
    } catch (err) {
        console.error("[navigation.override] 记录历史失败：", err);
    }

    return undefined;
};

Macro.add("creturn", {
    isAsync: true,
    handler() {
        try {
            const sv = State.variables;
            if (!Array.isArray(sv.paths) || typeof sv.pathIndex !== "number" || sv.pathIndex < 0) {
                return;
            }

            if (sv.inCombat === true || (sv.combat && sv.combat.active === true)) {
                return;
            }

            // ★ 关键修复：不要想当然地认为"当前站着的这一页"就是
            // paths[pathIndex]。如果当前页本身被跳过了记录（tag 命中
            // HISTORY_SKIP_TAGS，或者是在战斗状态下进入的），
            // paths[pathIndex] 里存的其实是"进入当前页之前"最后一次
            // 被记录的页面——这种情况下"返回"应该落在 paths[pathIndex]
            // 本身，而不是再往前退一格到 paths[pathIndex - 1]，
            // 否则就会像本次遇到的情况一样多退一步。
            const isCurrentRecorded = (sv.paths[sv.pathIndex] === State.passage);
            const backIndex = isCurrentRecorded ? (sv.pathIndex - 1) : sv.pathIndex;

            if (backIndex < 0) return;

            const target = sv.paths[backIndex];
            if (typeof target !== "string" || !Story.has(target)) return;

            const text = this.args[0] ?? "返回";
            const $link = jQuery(document.createElement('a'));

            $link
                .addClass(`macro-${this.name}`)
                .on("click", () => {
                    try {
                        sv.isReturn = true;
                        // 把渲染时算好的下标原样带给导航钩子，避免它再猜一次
                        sv.returnTargetIndex = backIndex;
                        Engine.play(target);
                    } catch (err) {
                        console.error("[creturn] 返回导航失败：", err);
                        sv.isReturn = false;
                        sv.returnTargetIndex = undefined;
                    }
                })
                .append(text)
                .appendTo(this.output);
        } catch (err) {
            console.error("[creturn] 渲染返回按钮失败：", err);
        }
    }
});