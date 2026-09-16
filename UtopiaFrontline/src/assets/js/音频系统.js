/*完整的音频管理系统 - 完全修复版*/
var GameSounds = {
    hover: null,
    click: null,
    initialized: false,
    tracks: {},  // 用对象存储命名的音轨
    bgm: null,
    bgmName: null
};

function isAudioGloballyEnabled() {
    try {
        const v = (SugarCube && SugarCube.State && SugarCube.State.variables) || (window.State && State.variables) || {};
        if (typeof v.optAudio === 'undefined') return true;
        return !!v.optAudio;
    } catch (e) {
        return true;
    }
}

function resolveAreaBgmFile() {
    try {
        const v = (SugarCube && SugarCube.State && SugarCube.State.variables) || (window.State && State.variables) || {};
        const pos = v.playerPos || {};
        const block = String(pos.block || '');
        const layer = Number(pos.layer) || 0;
        const currentPassage = document && document.title ? document.title : '';
        const context = [currentPassage, block, String(layer)].join(' ');

        if (/安息之地/.test(context) || /安息之地/.test(block)) return 'audio/安息之地.m4a';
        if (/会议室|L9流通走廊|第九层/.test(context) || layer === 9) return 'audio/第九层.m4a';
        if (/巡逻队休息室|看守部|巡逻队/.test(context) || layer === 2) return 'audio/巡逻队.m4a';
        if (/后勤休息区|L10流通走廊|第十层/.test(context) || layer === 10) return 'audio/后勤部休息区.m4a';
        return 'audio/管理区.m4a';
    } catch (e) {
        return 'audio/管理区.m4a';
    }
}

function syncBackgroundMusic() {
    try {
        const v = (SugarCube && SugarCube.State && SugarCube.State.variables) || (window.State && State.variables) || {};
        const audioEnabled = typeof v.optAudio === 'undefined' ? true : !!v.optAudio;
        const bgmEnabled = typeof v.optBgm === 'undefined' ? true : !!v.optBgm;

        const currentPassage = (window && window.story && window.story.state && window.story.state.passage) || document.title || '';
        const shouldPlayIntroBgm = currentPassage === '0-3-0-4';

        if (!GameSounds.bgm) {
            GameSounds.bgm = new Audio();
            GameSounds.bgm.loop = true;
            GameSounds.bgm.volume = 0.35;
        }

        if (typeof SimpleAudio !== 'undefined') {
            try { SimpleAudio.stop('bgm_main'); } catch (e) {}
        }

        if (!shouldPlayIntroBgm) {
            GameSounds.bgm.pause();
            GameSounds.bgm.currentTime = 0;
            return;
        }

        if (!window.audioUnlocked || !audioEnabled || !bgmEnabled) {
            GameSounds.bgm.pause();
            GameSounds.bgm.currentTime = 0;
            return;
        }

        const targetFile = resolveAreaBgmFile();

        if (GameSounds.bgmName !== targetFile) {
            GameSounds.bgm.pause();
            GameSounds.bgm.currentTime = 0;
            GameSounds.bgm.src = targetFile;
            GameSounds.bgm.load();
            GameSounds.bgmName = targetFile;
        }

        if (GameSounds.bgm.paused) {
            GameSounds.bgm.play().then(function () {
                console.log('BGM 播放成功:', targetFile);
            }).catch(function (e) {
                console.warn('BGM 播放失败:', targetFile, e);
            });
        }
    } catch (e) {
        console.warn('同步背景音乐失败:', e);
    }
}

function syncAudioSystemState() {
    try {
        const v = (SugarCube && SugarCube.State && SugarCube.State.variables) || (window.State && State.variables) || {};
        const audioEnabled = typeof v.optAudio === 'undefined' ? true : !!v.optAudio;

        if (GameSounds.hover) GameSounds.hover.muted = !audioEnabled;
        if (GameSounds.click) GameSounds.click.muted = !audioEnabled;

        if (GameSounds.tracks) {
            Object.keys(GameSounds.tracks).forEach(function (trackName) {
                const track = GameSounds.tracks[trackName];
                if (!track) return;
                track.muted = !audioEnabled;
                if (!audioEnabled) {
                    track.pause();
                    track.currentTime = 0;
                }
            });
        }

        syncBackgroundMusic();
    } catch (e) {
        console.warn('同步音频状态失败:', e);
    }
}

window.syncAudioSystemState = syncAudioSystemState;

$(document).on(':storyready', function () {
    GameSounds.hover = new Audio("audio/hover.mp3");
    GameSounds.click = new Audio("audio/click.mp3");
    
    GameSounds.hover.volume = 0.3;
    GameSounds.click.volume = 0.7;
    
    GameSounds.hover.load();
    GameSounds.click.load();
    
    GameSounds.initialized = true;
    GameSounds.tracks = {};  // 确保tracks初始化
    GameSounds.bgm = new Audio();
    GameSounds.bgm.loop = true;
    GameSounds.bgm.volume = 0.35;
    syncAudioSystemState();
    
    console.log("音效系统初始化完成");
});

// 链接音效代码
function attachSoundToLinks(container) {
    $(container).find('a').each(function() {
        var $link = $(this);
        if ($link.data('sound-attached')) return;
        $link.data('sound-attached', true);
        
        $link.on('click', function() {
            if (!isAudioGloballyEnabled()) return;
            if (GameSounds.initialized && GameSounds.click) {
                GameSounds.click.currentTime = 0;
                GameSounds.click.play().catch(function(e) {});
            }
        }).on('mouseenter', function() {
            if (!isAudioGloballyEnabled()) return;
            if (GameSounds.initialized && GameSounds.hover) {
                GameSounds.hover.currentTime = 0;
                GameSounds.hover.play().catch(function(e) {});
            }
        });
    });
}

$(document).on(':passagerender', function (ev) {
    attachSoundToLinks(ev.content);
});

$(document).on(':passagedisplay', function () {
    syncAudioSystemState();
});

// 播放音效宏
Macro.add('playsound', {
    handler: function() {
        console.log("playsound被调用，参数:", this.args);

        if (!isAudioGloballyEnabled()) {
            console.log("全局音频关闭，跳过播放:", this.args[0]);
            return;
        }
        
        if (this.args.length < 2) {
            console.error("playsound需要至少2个参数：名称和文件路径");
            return;
        }
        
        var trackName = String(this.args[0]);
        var soundFile = String(this.args[1]);
        var volume = Number(this.args[2]) || 0.7;
        var loop = Boolean(this.args[3]);
        
        console.log("播放音效 -", "名称:", trackName, "文件:", soundFile, "音量:", volume, "循环:", loop);
        
        try {
            // 确保tracks对象存在
            if (!GameSounds.tracks) {
                GameSounds.tracks = {};
            }
            
            // 如果该音轨已存在，先停止
            if (GameSounds.tracks[trackName]) {
                console.log("停止已存在的音轨:", trackName);
                GameSounds.tracks[trackName].pause();
                GameSounds.tracks[trackName].currentTime = 0;
            }
            
            // 创建新音频
            console.log("创建新音频对象");
            var audio = new Audio(soundFile);
            audio.volume = volume;
            audio.loop = loop;
            
            // 保存到tracks
            GameSounds.tracks[trackName] = audio;
            console.log("音轨已保存:", trackName);
            
            // 播放
            audio.play().then(function() {
                console.log("音轨", trackName, "播放成功");
            }).catch(function(e) {
                console.error("播放失败:", trackName, e);
            });
            
        } catch (e) {
            console.error("playsound出错:", e);
        }
    }
});

// 停止特定音轨
Macro.add('stopsound', {
    handler: function() {
        var trackName = String(this.args[0]);
        console.log("停止音轨:", trackName);
        
        if (GameSounds.tracks && GameSounds.tracks[trackName]) {
            GameSounds.tracks[trackName].pause();
            GameSounds.tracks[trackName].currentTime = 0;
            console.log("音轨", trackName, "已停止");
        } else {
            console.log("找不到音轨:", trackName, "可用音轨:", Object.keys(GameSounds.tracks || {}));
        }
    }
});

// 停止所有音效
Macro.add('stopsounds', {
    handler: function() {
        console.log("停止所有音效");
        
        try {
            // 停止链接音效
            if (GameSounds.hover) {
                GameSounds.hover.pause();
                GameSounds.hover.currentTime = 0;
            }
            if (GameSounds.click) {
                GameSounds.click.pause();
                GameSounds.click.currentTime = 0;
            }
            
            // 停止所有命名音轨
            if (GameSounds.tracks) {
                Object.keys(GameSounds.tracks).forEach(function(trackName) {
                    if (GameSounds.tracks[trackName]) {
                        GameSounds.tracks[trackName].pause();
                        GameSounds.tracks[trackName].currentTime = 0;
                        console.log("停止音轨:", trackName);
                    }
                });
            }
            
            console.log("所有音效已停止");
            
        } catch (e) {
            console.error("停止音效时出错:", e);
        }
    }
});