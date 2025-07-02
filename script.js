// 简单的动画效果
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
    
    // 专业选择器功能
    const majorSelectors = document.querySelectorAll('.major-selector');
    const majorContents = document.querySelectorAll('.major-content');
    
    majorSelectors.forEach(selector => {
        selector.addEventListener('click', function() {
            // 移除所有选择器的激活状态
            majorSelectors.forEach(btn => {
                btn.classList.remove('active');
            });
            
            // 激活当前选择器
            this.classList.add('active');
            
            // 获取选择的专业
            const selectedMajor = this.getAttribute('data-major');
            
            // 隐藏所有专业内容
            majorContents.forEach(content => {
                content.classList.remove('active');
            });
            
            // 显示选中的专业内容
            const targetContent = document.getElementById(`${selectedMajor}-content`);
            if(targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    // 表格排序功能
    initTableSorting();
    
    // 表格筛选功能
    initTableFiltering();
    
    // 图表交互功能
    initChartInteractions();
    
    // 响应式菜单
    initResponsiveMenu();
});

// 表格排序功能
function initTableSorting() {
    const table = document.querySelector('table');
    if (!table) return;
    
    const headers = table.querySelectorAll('th');
    const tbody = table.querySelector('tbody');
    
    headers.forEach((header, index) => {
        // 跳过第一列（院校名称）
        if (index === 0) return;
        
        header.style.cursor = 'pointer';
        header.style.position = 'relative';
        header.innerHTML += ' <span class="sort-indicator">⇅</span>';
        
        let sortDirection = 'asc';
        
        header.addEventListener('click', () => {
            const rows = Array.from(tbody.querySelectorAll('tr'));
            
            // 清除其他列的排序指示器
            headers.forEach((h, i) => {
                if (i !== index) {
                    const indicator = h.querySelector('.sort-indicator');
                    if (indicator) indicator.textContent = '⇅';
                }
            });
            
            // 更新当前列的排序指示器
            const indicator = header.querySelector('.sort-indicator');
            indicator.textContent = sortDirection === 'asc' ? '↑' : '↓';
            
            rows.sort((a, b) => {
                const aValue = a.cells[index].textContent.trim();
                const bValue = b.cells[index].textContent.trim();
                
                // 特殊处理录取率列（包含百分号）
                if (index === 5) { // 录取率列
                    const aNum = parseFloat(aValue.replace('%', '').replace('约', ''));
                    const bNum = parseFloat(bValue.replace('%', '').replace('约', ''));
                    return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
                }
                
                // 特殊处理星级评分列
                if (index === 2) { // 交通便捷度列
                    const aStars = a.cells[index].querySelectorAll('.text-yellow-500').length;
                    const bStars = b.cells[index].querySelectorAll('.text-yellow-500').length;
                    return sortDirection === 'asc' ? aStars - bStars : bStars - aStars;
                }
                
                // 普通文本排序
                return sortDirection === 'asc' ? 
                    aValue.localeCompare(bValue) : 
                    bValue.localeCompare(aValue);
            });
            
            // 重新排列表格行
            rows.forEach(row => tbody.appendChild(row));
            
            // 切换排序方向
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        });
    });
}

// 表格筛选功能
function initTableFiltering() {
    const table = document.querySelector('table');
    if (!table) return;
    
    // 创建筛选器容器
    const filterContainer = document.createElement('div');
    filterContainer.className = 'filter-container mb-4 flex flex-wrap gap-4';
    
    // 地理位置筛选器
    const locationFilter = createSelectFilter('location', '地理位置', [
        { value: '', text: '全部地区' },
        { value: '合肥市', text: '合肥市' },
        { value: '六安市', text: '六安市' },
        { value: '滁州市', text: '滁州市' },
        { value: '宿州市', text: '宿州市' },
        { value: '淮北市', text: '淮北市' }
    ]);
    
    // 录取率筛选器
    const rateFilter = createSelectFilter('rate', '录取率', [
        { value: '', text: '全部录取率' },
        { value: 'high', text: '40%以上' },
        { value: 'medium', text: '30-40%' },
        { value: 'low', text: '30%以下' }
    ]);
    
    filterContainer.appendChild(locationFilter);
    filterContainer.appendChild(rateFilter);
    
    // 插入筛选器到表格前
    table.parentNode.insertBefore(filterContainer, table);
    
    // 筛选逻辑
    function applyFilters() {
        const locationValue = document.getElementById('location-filter').value;
        const rateValue = document.getElementById('rate-filter').value;
        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            let showRow = true;
            
            // 地理位置筛选
            if (locationValue && !row.cells[1].textContent.includes(locationValue)) {
                showRow = false;
            }
            
            // 录取率筛选
            if (rateValue) {
                const rateText = row.cells[5].textContent;
                const rate = parseFloat(rateText.replace('%', '').replace('约', ''));
                
                switch (rateValue) {
                    case 'high':
                        if (rate < 40) showRow = false;
                        break;
                    case 'medium':
                        if (rate < 30 || rate >= 40) showRow = false;
                        break;
                    case 'low':
                        if (rate >= 30) showRow = false;
                        break;
                }
            }
            
            row.style.display = showRow ? '' : 'none';
        });
    }
    
    // 绑定筛选事件
    document.getElementById('location-filter').addEventListener('change', applyFilters);
    document.getElementById('rate-filter').addEventListener('change', applyFilters);
}

// 创建选择筛选器
function createSelectFilter(id, label, options) {
    const container = document.createElement('div');
    container.className = 'filter-item';
    
    const labelEl = document.createElement('label');
    labelEl.textContent = label + '：';
    labelEl.className = 'block text-sm font-medium mb-1';
    
    const select = document.createElement('select');
    select.id = id + '-filter';
    select.className = 'bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white';
    
    options.forEach(option => {
        const optionEl = document.createElement('option');
        optionEl.value = option.value;
        optionEl.textContent = option.text;
        select.appendChild(optionEl);
    });
    
    container.appendChild(labelEl);
    container.appendChild(select);
    
    return container;
}

// 图表交互功能
function initChartInteractions() {
    // 为录取率趋势图添加悬停效果
    const chartSvg = document.querySelector('.chart-container svg');
    if (!chartSvg) return;
    
    const circles = chartSvg.querySelectorAll('circle');
    const tooltip = createTooltip();
    
    circles.forEach(circle => {
        circle.addEventListener('mouseenter', (e) => {
            const cx = parseFloat(circle.getAttribute('cx'));
            const cy = parseFloat(circle.getAttribute('cy'));
            const fill = circle.getAttribute('fill');
            
            // 根据颜色确定学校名称和数据
            let schoolName = '';
            let rate = '';
            
            switch (fill) {
                case 'var(--tesla-red)':
                    schoolName = '皖西学院';
                    rate = '45%';
                    break;
                case '#2196F3':
                    schoolName = '宿州学院';
                    rate = '43%';
                    break;
                case '#FF9800':
                    schoolName = '安徽科技学院';
                    rate = '40%';
                    break;
                case '#4CAF50':
                    schoolName = '合肥师范学院';
                    rate = '38%';
                    break;
                case '#9C27B0':
                    schoolName = '淮北师范大学';
                    rate = '20%';
                    break;
            }
            
            showTooltip(tooltip, e.pageX, e.pageY, `${schoolName}: ${rate}`);
            
            // 高亮效果
            circle.style.r = '6';
            circle.style.strokeWidth = '2';
            circle.style.stroke = '#fff';
        });
        
        circle.addEventListener('mouseleave', () => {
            hideTooltip(tooltip);
            circle.style.r = '4';
            circle.style.strokeWidth = '0';
        });
    });
}

// 创建提示框
function createTooltip() {
    const tooltip = document.createElement('div');
    tooltip.className = 'chart-tooltip';
    tooltip.style.cssText = `
        position: absolute;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 14px;
        pointer-events: none;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    document.body.appendChild(tooltip);
    return tooltip;
}

// 显示提示框
function showTooltip(tooltip, x, y, text) {
    tooltip.textContent = text;
    tooltip.style.left = x + 10 + 'px';
    tooltip.style.top = y - 30 + 'px';
    tooltip.style.opacity = '1';
}

// 隐藏提示框
function hideTooltip(tooltip) {
    tooltip.style.opacity = '0';
}

// 响应式菜单
function initResponsiveMenu() {
    // 在小屏幕上优化表格显示
    const table = document.querySelector('table');
    if (!table) return;
    
    function handleResize() {
        if (window.innerWidth < 768) {
            table.style.fontSize = '14px';
            // 可以添加更多小屏幕优化
        } else {
            table.style.fontSize = '';
        }
    }
    
    window.addEventListener('resize', handleResize);
    handleResize(); // 初始调用
}

// 平滑滚动到锚点
function smoothScrollTo(targetId) {
    const target = document.getElementById(targetId);
    if (target) {
        target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// 添加返回顶部按钮
function addBackToTopButton() {
    const button = document.createElement('button');
    button.innerHTML = '↑';
    button.className = 'back-to-top';
    button.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--tesla-red);
        color: white;
        border: none;
        font-size: 20px;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 1000;
    `;
    
    document.body.appendChild(button);
    
    // 显示/隐藏按钮
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            button.style.opacity = '1';
        } else {
            button.style.opacity = '0';
        }
    });
    
    // 点击返回顶部
    button.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// 初始化返回顶部按钮
document.addEventListener('DOMContentLoaded', addBackToTopButton);



// 高级动画效果
document.addEventListener('DOMContentLoaded', function() {
    // 初始化所有动画效果
    initParallaxEffect();
    initTextAnimations();
    initChartAnimations();
    initLoadingAnimation();
    initMouseFollowEffect();
    initCounterAnimations();
});

// 视差滚动效果（简化版）
function initParallaxEffect() {
    // 简化视差效果，避免影响正常滚动
    const parallaxElements = document.querySelectorAll('.mega-text');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.1; // 减小视差强度
        
        parallaxElements.forEach((element) => {
            element.style.transform = `translateY(${rate}px)`;
        });
    });
}

// 文字打字机效果
function initTextAnimations() {
    const typewriterElements = document.querySelectorAll('.mega-text');
    
    typewriterElements.forEach(element => {
        const text = element.textContent;
        element.textContent = '';
        element.style.borderRight = '2px solid var(--tesla-red)';
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            } else {
                // 移除光标
                setTimeout(() => {
                    element.style.borderRight = 'none';
                }, 1000);
            }
        };
        
        // 延迟开始打字效果
        setTimeout(typeWriter, 500);
    });
}

// 图表动画效果
function initChartAnimations() {
    const chartSvg = document.querySelector('.chart-container svg');
    if (!chartSvg) return;
    
    // 线条绘制动画
    const lines = chartSvg.querySelectorAll('polyline');
    lines.forEach((line, index) => {
        const length = line.getTotalLength();
        line.style.strokeDasharray = length;
        line.style.strokeDashoffset = length;
        line.style.animation = `drawLine 2s ease-in-out ${index * 0.2}s forwards`;
    });
    
    // 添加绘制动画的CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes drawLine {
            to {
                stroke-dashoffset: 0;
            }
        }
        
        @keyframes bounceIn {
            0% {
                transform: scale(0);
                opacity: 0;
            }
            50% {
                transform: scale(1.2);
            }
            100% {
                transform: scale(1);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    // 数据点动画
    const circles = chartSvg.querySelectorAll('circle');
    circles.forEach((circle, index) => {
        circle.style.animation = `bounceIn 0.6s ease-out ${2 + index * 0.1}s forwards`;
        circle.style.opacity = '0';
    });
}

// 页面加载动画
function initLoadingAnimation() {
    // 创建加载屏幕
    const loader = document.createElement('div');
    loader.className = 'page-loader';
    loader.innerHTML = `
        <div class="loader-content">
            <div class="loader-spinner"></div>
            <div class="loader-text">加载中...</div>
        </div>
    `;
    
    // 添加加载屏幕样式
    const loaderStyle = document.createElement('style');
    loaderStyle.textContent = `
        .page-loader {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, var(--deep-blue), var(--dark-blue));
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            transition: opacity 0.5s ease, visibility 0.5s ease;
        }
        
        .page-loader.hidden {
            opacity: 0;
            visibility: hidden;
        }
        
        .loader-content {
            text-align: center;
            color: white;
        }
        
        .loader-spinner {
            width: 50px;
            height: 50px;
            border: 3px solid rgba(227, 25, 55, 0.3);
            border-top: 3px solid var(--tesla-red);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        
        .loader-text {
            font-size: 18px;
            font-weight: 500;
            animation: pulse 1.5s ease-in-out infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(loaderStyle);
    document.body.appendChild(loader);
    
    // 模拟加载时间
    setTimeout(() => {
        loader.classList.add('hidden');
        setTimeout(() => {
            loader.remove();
        }, 500);
    }, 2000);
}

// 鼠标跟随效果（已禁用以提高性能）
function initMouseFollowEffect() {
    // 暂时禁用鼠标跟随效果以避免性能问题
    console.log('Mouse follow effect disabled for better performance');
}

// 数字计数动画
function initCounterAnimations() {
    const counters = document.querySelectorAll('.text-4xl.font-bold.highlight-text');
    
    const animateCounter = (element) => {
        const target = parseInt(element.textContent);
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    };
    
    // 使用 Intersection Observer 触发动画
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.animated) {
                animateCounter(entry.target);
                entry.target.dataset.animated = 'true';
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => {
        observer.observe(counter);
    });
}

// 粒子背景效果
function initParticleBackground() {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
        opacity: 0.3;
    `;
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 50;
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2 + 1;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(227, 25, 55, 0.5)';
            ctx.fill();
        }
    }
    
    // 创建粒子
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        // 连接附近的粒子
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(227, 25, 55, ${0.2 * (1 - distance / 100)})`;
                    ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    // 响应窗口大小变化
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// 滚动触发动画
function initScrollAnimations() {
    const animateElements = document.querySelectorAll('.card, .major-selector, table tr');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'slideInUp 0.6s ease forwards';
            }
        });
    }, { threshold: 0.1 });
    
    animateElements.forEach(element => {
        observer.observe(element);
    });
}

// 初始化粒子背景和滚动动画
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initParticleBackground();
        initScrollAnimations();
    }, 2500); // 在加载动画结束后启动
});

// 添加键盘导航支持
document.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
    }
});

document.addEventListener('mousedown', function() {
    document.body.classList.remove('keyboard-navigation');
});

// 添加键盘导航样式
const keyboardStyle = document.createElement('style');
keyboardStyle.textContent = `
    .keyboard-navigation *:focus {
        outline: 2px solid var(--tesla-red);
        outline-offset: 2px;
    }
`;
document.head.appendChild(keyboardStyle);

