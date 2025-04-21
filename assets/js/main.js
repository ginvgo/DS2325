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
    showCopyNotification(`已复制: ${text}`);
  }).catch(err => {
    console.error('复制失败:', err);
    // 兼容旧浏览器
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showCopyNotification('已复制到剪贴板');
  });
}

// 显示复制通知
function showCopyNotification(message) {
    // 检查是否已存在通知，如果存在则更新内容
    let notification = document.getElementById('copy-notification');
    
    if (!notification) {
        // 创建通知元素
        notification = document.createElement('div');
        notification.id = 'copy-notification'; // 设置唯一 ID
        notification.className = 'copy-notification';
        document.body.appendChild(notification);
    }
    
    // 更新通知内容并显示
    notification.textContent = message;
    notification.style.display = 'block';

    // 自动关闭通知
    setTimeout(() => {
        notification.style.display = 'none'; // 隐藏通知
    }, 2000); // 2秒后自动关闭
}

// 点击外部关闭
document.querySelectorAll('.popup-overlay').forEach(popup => {
    popup.addEventListener('click', function(e) {
        if (e.target === this) togglePopup(this.id);
    });
});
