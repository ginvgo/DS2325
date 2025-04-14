// search.js - 添加到您的JS文件中
document.addEventListener('DOMContentLoaded', function() {
    // 获取搜索相关元素
    const searchForm = document.querySelector('.search-form');
    const searchInput = document.querySelector('.search-input');
    const searchResults = document.querySelector('.search-results');
    let searchDebounce;

    // 全站可搜索内容的数据结构
    const searchData = {
        'articles': {
            name: '文章',
            items: []
        },
        'tools': {
            name: '工具', 
            items: []
        },
        'calculators': {
            name: '计算器',
            items: []
        },
        'resources': {
            name: '资源',
            items: []
        }
    };

    // 初始化：收集全站可搜索内容
    function initSearch() {
        // 收集文章内容
        document.querySelectorAll('article').forEach(article => {
            const title = article.querySelector('h2, h3')?.textContent || '无标题';
            searchData.articles.items.push({
                title: title,
                content: article.textContent,
                url: article.querySelector('a')?.href || '#',
                type: '文章'
            });
        });

        // 收集工具卡片
        document.querySelectorAll('.tool-card, .feature-card').forEach(card => {
            const title = card.querySelector('h3, h2')?.textContent || '无标题';
            searchData.tools.items.push({
                title: title,
                content: card.textContent,
                url: card.href || card.querySelector('a')?.href || '#',
                type: '工具'
            });
        });

        // 收集计算器
        document.querySelectorAll('.calculator-card').forEach(calc => {
            const title = calc.querySelector('h3')?.textContent || '无标题';
            searchData.calculators.items.push({
                title: title,
                content: calc.textContent,
                url: calc.querySelector('a')?.href || '#',
                type: '计算器'
            });
        });

        // 收集资源
        document.querySelectorAll('.resource-item').forEach(res => {
            const title = res.querySelector('h3')?.textContent || '无标题';
            searchData.resources.items.push({
                title: title,
                content: res.textContent,
                url: res.querySelector('a')?.href || '#',
                type: '资源'
            });
        });
    }

    // 执行搜索
    function performSearch(query) {
        const results = [];
        const lowerQuery = query.toLowerCase();
        
        // 在所有分类中搜索
        for (const [type, data] of Object.entries(searchData)) {
            data.items.forEach(item => {
                if (item.title.toLowerCase().includes(lowerQuery) || 
                    item.content.toLowerCase().includes(lowerQuery)) {
                    results.push({
                        ...item,
                        type: data.name
                    });
                }
            });
        }
        
        return results;
    }

    // 显示搜索结果
    function showResults(results) {
        searchResults.innerHTML = '';
        
        if (results.length > 0) {
            // 按类型分组
            const grouped = results.reduce((acc, item) => {
                if (!acc[item.type]) acc[item.type] = [];
                acc[item.type].push(item);
                return acc;
            }, {});
            
            // 渲染分组结果
            for (const [type, items] of Object.entries(grouped)) {
                const groupHeader = document.createElement('div');
                groupHeader.className = 'search-result-header';
                groupHeader.textContent = type;
                searchResults.appendChild(groupHeader);
                
                items.forEach(item => {
                    const resultItem = document.createElement('div');
                    resultItem.className = 'search-result-item';
                    
                    // 高亮匹配文本
                    const highlightedTitle = highlightMatches(item.title, searchInput.value);
                    const snippet = getContentSnippet(item.content, searchInput.value);
                    
                    resultItem.innerHTML = `
                        <div class="search-result-title">${highlightedTitle}</div>
                        <div class="search-result-snippet">${snippet}</div>
                    `;
                    resultItem.addEventListener('click', () => {
                        window.location.href = item.url;
                    });
                    searchResults.appendChild(resultItem);
                });
            }
            searchResults.style.display = 'block';
        } else {
            searchResults.innerHTML = `
                <div class="search-result-item no-results">
                    没有找到"${escapeHtml(searchInput.value)}"的相关结果
                </div>
            `;
            searchResults.style.display = 'block';
        }
    }

    // 高亮匹配文本
    function highlightMatches(text, query) {
        if (!query) return escapeHtml(text);
        const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
        return escapeHtml(text).replace(regex, '<span class="highlight">$1</span>');
    }

    // 获取内容片段
    function getContentSnippet(content, query) {
        const lowerContent = content.toLowerCase();
        const lowerQuery = query.toLowerCase();
        const index = lowerContent.indexOf(lowerQuery);
        
        if (index === -1) {
            return escapeHtml(content.substring(0, 60) + '...');
        }
        
        const start = Math.max(0, index - 20);
        const end = Math.min(content.length, index + query.length + 40);
        return '...' + highlightMatches(content.substring(start, end), query) + '...';
    }

    // 安全转义HTML
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // 转义正则特殊字符
    function escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // 隐藏结果
    function hideResults() {
        searchResults.style.display = 'none';
    }

    // 初始化搜索
    initSearch();

    // 输入事件处理（带防抖）
    searchInput.addEventListener('input', function() {
        clearTimeout(searchDebounce);
        const query = this.value.trim();
        
        if (query.length > 1) {
            searchDebounce = setTimeout(() => {
                const results = performSearch(query);
                showResults(results);
            }, 300);
        } else {
            hideResults();
        }
    });

    // 表单提交
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
            window.location.href = `/search.html?q=${encodeURIComponent(query)}`;
        }
    });

    // 点击页面其他区域关闭结果
    document.addEventListener('click', function(e) {
        if (!searchForm.contains(e.target)) {
            hideResults();
        }
    });

    // 处理URL中的搜索参数（用于search.html页面）
    if (window.location.pathname.includes('search.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('q');
        if (query) {
            searchInput.value = query;
            const results = performSearch(query);
            showResults(results);
        }
    }
});
// 在表单提交处理部分修改为：
searchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
        // 跳转到search.html
        window.location.href = `search.html?q=${encodeURIComponent(query)}`;
    }
});
