function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
/*  统一宏：<<typewriter >>  */
Macro.add('typewriter', {
  tags   : null,
  handler() {
    /* 0. 收集参数 */
    const textLines = [];          // 纯文本行
    const links     = [];          // 宏参数里的链接语法
    this.payload[0].contents.split(/\r?\n/).forEach(l => {
      l = l.trim();
      if (!l) return;
      if (l.startsWith('[[') && l.endsWith(']]')) {
        links.push(l);             // [[显示文本->Passage]]
      } else {
        textLines.push(l);         // 普通文字
      }
    });

    /* 1. 创建容器 */
    const box = document.createElement('div');
    box.className = 'typewriter-box';
    this.output.appendChild(box);

    /* 2. 打字机动画 */
    let lineIdx = 0;
    function typeNextLine() {
      if (lineIdx >= textLines.length) {
        /* 3. 动画结束，统一渲染链接 */
       /* 渲染链接的代码 */
  links.forEach(linkSyntax => {
          const linkDiv = document.createElement('div');
          linkDiv.className = 'typewriter-link';
          box.appendChild(linkDiv);
          $(linkDiv).wiki(linkSyntax);   // 正确 API
        });
        return;
      }
        
      const p = document.createElement('p');
      p.className = 'typewriter-line';
      box.appendChild(p);

      const line   = textLines[lineIdx];
      const cursor = document.createElement('span');
      cursor.className = 'cursor';
      cursor.textContent = '|';
      p.appendChild(cursor);

      let charIdx = 0;
      const speed = 20;          // ← 调小可加速
      const timer = setInterval(() => {
        p.insertBefore(document.createTextNode(line[charIdx]), cursor);
        charIdx++;
        if (charIdx >= line.length) {
          clearInterval(timer);
          setTimeout(() => {
            cursor.remove();
            lineIdx++;
            typeNextLine();      // 下一行或进入链接渲染
          }, 300);
        }
      }, speed);
    }

    typeNextLine();
  }
});
