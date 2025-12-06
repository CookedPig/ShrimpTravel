document.addEventListener('DOMContentLoaded', () => {
    const dateGrid = document.querySelector('.date-grid');
    const dayDetails = document.getElementById('day-details');
    const container = document.querySelector('.container'); // 獲取 container 元素
    const STORAGE_KEY = 'travelPlanItinerary';

    // 預設行程資料結構: 每個 day 的值是一個包含行程字串的陣列
    const defaultData = {
        '0': ['在這裡記下所有需要採買的禮物清單！'],
        '1': ['請在這裡輸入 Day 1 的行程計畫...'],
        '2': ['請在這裡輸入 Day 2 的行程計畫...'],
        '3': ['請在這裡輸入 Day 3 的行程計畫...'],
        '4': ['請在這裡輸入 Day 4 的行程計畫...'],
        '5': ['請在這裡輸入 Day 5 的行程計畫...'],
        '6': ['請在這裡輸入 Day 6 的行程計畫...']
    };

    let tripData = {};
    let currentDay = '1';

    // --- 函式: 取得所有行程資料 ---
    function loadTripData() {
        const storedData = localStorage.getItem(STORAGE_KEY);
        tripData = storedData ? JSON.parse(storedData) : defaultData;

        // 確保每個 Day 都有一個可用的陣列 (0-6)
        for (let i = 0; i <= 6; i++) {
            const dayKey = String(i);
            if (!tripData[dayKey] || !Array.isArray(tripData[dayKey])) {
                tripData[dayKey] = defaultData[dayKey] || ['請在這裡輸入行程計畫...'];
            } else if (tripData[dayKey].length === 0) {
                 tripData[dayKey].push(defaultData[dayKey][0] || '請在這裡輸入行程計畫...');
            }
        }
    }

    // --- 函式: 將資料儲存到 LocalStorage ---
    function saveTripData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tripData));
    }

    // --- 函式: 建立單個行程區塊的 HTML 結構 ---
    function createItineraryBlock(day, index, content) {
        const block = document.createElement('div');
        block.classList.add('itinerary-block');
        block.dataset.index = index;
        
        block.innerHTML = `
            <textarea placeholder="請輸入活動計畫...">${content}</textarea>
            <div class="block-actions">
                <button class="save-block-btn" data-day="${day}" data-index="${index}">儲存</button>
                <button class="delete-block-btn" data-day="${day}" data-index="${index}">刪除</button>
            </div>
        `;
        
        return block;
    }

    // --- 函式: 渲染 (顯示) 當前日期的所有行程區塊 ---
    function renderDayPlan(dayNumber) {
        currentDay = dayNumber;
        
        const dayPlans = tripData[dayNumber] || []; 
        
        // 關鍵變更 1: 設置標題
        let title = dayNumber === '0' ? '要買要買🤌' : `第 ${dayNumber} 天ㄉ旅程！`;
        
        // 關鍵變更 2: 根據 Day 0 切換 CSS 類別
        if (dayNumber === '0') {
            container.classList.add('gift-active');
        } else {
            container.classList.remove('gift-active');
        }
        
        // 清空容器並加入主標題
        dayDetails.innerHTML = `<h2>${title}</h2>`;
        
        // 渲染每個行程區塊
        dayPlans.forEach((content, index) => {
            const block = createItineraryBlock(dayNumber, index, content);
            dayDetails.appendChild(block);
        });
        
        // 新增：Create Block 按鈕
        const createBtn = document.createElement('button');
        createBtn.id = 'create-block-btn';
        createBtn.textContent = '新增行程區塊';
        createBtn.addEventListener('click', () => createNewBlock(dayNumber));
        dayDetails.appendChild(createBtn);
        
        // 綁定所有新生成的儲存和刪除按鈕
        dayDetails.querySelectorAll('.save-block-btn').forEach(btn => {
            btn.addEventListener('click', saveBlock);
        });
        dayDetails.querySelectorAll('.delete-block-btn').forEach(btn => {
            btn.addEventListener('click', deleteBlock);
        });
    }

    // --- 函式: 創建新的空白行程區塊 ---
    function createNewBlock(dayNumber) {
        if (!tripData[dayNumber]) {
            tripData[dayNumber] = ['']; 
        } else {
            tripData[dayNumber].push('');
        }
        saveTripData(); 
        renderDayPlan(dayNumber);
    }
    
    // --- 函式: 儲存單個區塊的內容 ---
    function saveBlock(event) {
        const btn = event.target;
        const day = btn.dataset.day;
        const index = parseInt(btn.dataset.index);
        const block = btn.closest('.itinerary-block');
        const newContent = block.querySelector('textarea').value.trim();
        
        tripData[day][index] = newContent;
        saveTripData();
        
        alert(`第 ${day} 天的第 ${index + 1} 個行程已儲存！`);
    }

    // --- 函式: 刪除單個區塊 ---
    function deleteBlock(event) {
        if (!confirm('確定要刪除此行程區塊嗎？')) return;
        
        const btn = event.target;
        const day = btn.dataset.day;
        const index = parseInt(btn.dataset.index);
        
        tripData[day].splice(index, 1);
        saveTripData();
        
        if (tripData[day].length === 0) {
            tripData[day].push(defaultData[day][0] || '請在這裡輸入行程計畫...');
            saveTripData();
        }
        renderDayPlan(day);
    }


    // --- 事件監聽器：處理日期按鈕點擊 ---
    dateGrid.addEventListener('click', (event) => {
        if (event.target.classList.contains('date-btn')) {
            const dayNumber = event.target.dataset.day;
            
            // 處理按鈕的 active 狀態
            document.querySelectorAll('.date-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
            
            renderDayPlan(dayNumber);
        }
    });

    // --- 初始化 ---
    loadTripData();
    // 預設選擇 Day 1 (因為 Day 0 是新增的特殊採買頁面)
    renderDayPlan('1');
    document.querySelector('.date-btn[data-day="1"]').classList.add('active');
});