document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const searchForm = document.querySelector('.search-form');
    const searchInput = document.querySelector('.search-input');
    const searchResults = document.querySelector('.search-results');
    let searchDebounce;

    // 初始化搜索数据
    const searchData = {
        articles: { name: '文章', items: [] },
        tools: { name: '工具', items: [] },
        calculators: { name: '计算器', items: [] },
        resources: { name: '资源', items: [] }
    };

    // 收集全站内容
    function initSearch() {
        // 收集文章
        document.querySelectorAll('article').forEach(article => {
            const title = article.querySelector('h2, h3')?.textContent || '无标题';
            searchData.articles.items.push({
                title: title,
                content: article.textContent,
                url: article.querySelector('a')?.href || window.location.pathname,
                type: 'articles'
            });
        });

        // 收集工具
        document.querySelectorAll('.tool-card, .feature-card').forEach(card => {
            const title = card.querySelector('h3, h2')?.textContent || '无标题';
            searchData.tools.items.push({
                title: title,
                content: card.textContent,
                url: card.href || card.querySelector('a')?.href || '#',
                type: 'tools'
            });
        });

        // 收集计算器
        document.querySelectorAll('.calculator-card').forEach(calc => {
            const title = calc.querySelector('h3')?.textContent || '无标题';
            searchData.calculators.items.push({
                title: title,
                content: calc.textContent,
                url: calc.querySelector('a')?.href || '#',
                type: 'calculators'
            });
        });

        // 收集资源
        document.querySelectorAll('.resource-item').forEach(res => {
            const title = res.querySelector('h3')?.textContent || '无标题';
            searchData.resources.items.push({
                title: title,
                content: res.textContent,
                url: res.querySelector('a')?.href || '#',
                type: 'resources'
            });
        });
    }

    // 执行搜索
    function performSearch(query) {
        const results = [];
        const lowerQuery = query.toLowerCase();
        
        Object.values(searchData).forEach(category => {
            category.items.forEach(item => {
                if (item.title.toLowerCase().includes(lowerQuery) || 
                    item.content.toLowerCase().includes(lowerQuery)) {
                    results.push({
                        ...item,
                        type: category.name
                    });
                }
            });
        });
        
        return results;
    }

    // 显示下拉结果
    function showDropdownResults(results) {
        searchResults.innerHTML = '';
        
        if (results.length > 0) {
            const grouped = results.reduce((acc, item) => {
                if (!acc[item.type]) acc[item.type] = [];
                acc[item.type].push(item);
                return acc;
            }, {});
            
            for (const [type, items] of Object.entries(grouped)) {
                const groupHeader = document.createElement('div');
                groupHeader.className = 'search-result-header';
                groupHeader.textContent = type;
                searchResults.appendChild(groupHeader);
                
                items.slice(0, 3).forEach(item => { // 每类最多显示3条
                    const resultItem = document.createElement('div');
                    resultItem.className = 'search-result-item';
                    resultItem.innerHTML = `
                        <div class="search-result-title">${highlightMatches(item.title, searchInput.value)}</div>
                        <div class="search-result-snippet">${getContentSnippet(item.content, searchInput.value)}</div>
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

    // 显示全屏结果
    function showFullPageResults(results, query) {
        // 创建遮罩层
        const overlay = document.createElement('div');
        overlay.className = 'search-overlay';
        
        // 创建结果容器
        const resultsContainer = document.createElement('div');
        resultsContainer.className = 'search-full-results';
        
        // 关闭按钮
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-search';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(overlay);
            document.body.style.overflow = '';
        });
        
        // 标题
        const title = document.createElement('h2');
        title.className = 'search-results-title';
        title.textContent = `"${query}"的搜索结果 (${results.length}条)`;
        
        // 构建结果
        if (results.length > 0) {
            const grouped = results.reduce((acc, item) => {
                if (!acc[item.type]) acc[item.type] = [];
                acc[item.type].push(item);
                return acc;
            }, {});
            
            for (const [type, items] of Object.entries(grouped)) {
                const section = document.createElement('section');
                section.innerHTML = `<h3>${type} (${items.length})</h3>`;
                
                items.forEach(item => {
                    const resultItem = document.createElement('div');
                    resultItem.className = 'full-result-item';
                    resultItem.innerHTML = `
                        <h4><a href="${item.url}">${highlightMatches(item.title, query)}</a></h4>
                        <p class="result-snippet">${getContentSnippet(item.content, query)}</p>
                    `;
                    section.appendChild(resultItem);
                });
                
                resultsContainer.appendChild(section);
            }
        } else {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <p>没有找到与"${escapeHtml(query)}"相关的内容</p>
                    <p>请尝试不同的关键词</p>
                </div>
            `;
        }
        
        // 组合元素
        resultsContainer.prepend(closeBtn, title);
        overlay.appendChild(resultsContainer);
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';
    }

    // 工具函数
    function highlightMatches(text, query) {
        if (!query) return escapeHtml(text);
        const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
        return escapeHtml(text).replace(regex, '<span class="highlight">$1</span>');
    }

    function getContentSnippet(content, query) {
        const lowerContent = content.toLowerCase();
        const lowerQuery = query.toLowerCase();
        const index = lowerContent.indexOf(lowerQuery);
        
        if (index === -1) {
            return escapeHtml(content.substring(0, 80).trim() + '...');
        }
        
        const start = Math.max(0, index - 30);
        const end = Math.min(content.length, index + query.length + 50);
        return '...' + highlightMatches(content.substring(start, end).trim(), query) + '...';
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // 初始化
    initSearch();

    // 输入事件
    searchInput.addEventListener('input', function() {
        clearTimeout(searchDebounce);
        const query = this.value.trim();
        
        if (query.length > 1) {
            searchDebounce = setTimeout(() => {
                const results = performSearch(query);
                showDropdownResults(results);
            }, 300);
        } else {
            searchResults.style.display = 'none';
        }
    });

    // 表单提交
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
            const results = performSearch(query);
            showFullPageResults(results, query);
            searchResults.style.display = 'none';
        }
    });

    // 点击外部关闭下拉
    document.addEventListener('click', function(e) {
        if (!searchForm.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
});
