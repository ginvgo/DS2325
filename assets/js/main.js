document.addEventListener('DOMContentLoaded', function() {
    // 夜间模式切换
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            themeToggle.textContent = newTheme === 'dark' ? '☀️ ' : '🌙 ';
        });
        
        // 初始化主题
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeToggle.textContent = savedTheme === 'dark' ? '☀️ ' : '🌙 ';
    }
    
    // 返回主页按钮
    const homeButton = document.getElementById('home-button');
    if (homeButton) {
        homeButton.addEventListener('click', function() {
            window.location.href = '../index.html';
        });
    }
});
// 弹窗控制
function togglePopup(popupId) {
  const popup = document.getElementById(popupId);
  popup.classList.toggle('active');
  document.body.style.overflow = popup.classList.contains('active') ? 'hidden' : '';
}

// 复制功能
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert(`已复制: ${text}`);
  }).catch(err => {
    console.error('复制失败:', err);
    // 兼容旧浏览器
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert('已复制到剪贴板');
  });
}

// 点击外部关闭
document.querySelectorAll('.popup-overlay').forEach(popup => {
  popup.addEventListener('click', function(e) {
    if (e.target === this) togglePopup(this.id);
  });
});

 document.addEventListener("DOMContentLoaded", function () {
    const repoOwner = "你的GitHub用户名";
    const repoName = "你的仓库名";
    const branch = "main"; // 或者 master

    document.querySelectorAll(".content-card").forEach(card => {
      const filePath = card.getAttribute("data-path");
      const dateElem = card.querySelector(".upload-date");

      fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/commits?path=${filePath}&sha=${branch}`)
        .then(res => res.json())
        .then(data => {
          if (data.length > 0) {
            const dateStr = new Date(data[0].commit.committer.date).toISOString().split("T")[0];
            dateElem.textContent = `上传日期：${dateStr}`;
          } else {
            dateElem.textContent = "无法获取上传时间";
          }
        })
        .catch(err => {
          dateElem.textContent = "加载失败";
          console.error(err);
        });
    });
  }); 
