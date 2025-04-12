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
