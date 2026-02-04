// الملف الرئيسي لربط جميع المكونات
// لن نستخدم import/export بل سنحمّل الملفات بشكل متزامن

// كائن التطبيق الرئيسي
const GymManagement = {
    // تهيئة التطبيق
    init: function() {
        console.log('تهيئة نظام إدارة الجيم...');
        
        // تحميل الوحدات
        this.loadModules();
        
        // تهيئة الصفحة الحالية
        this.initCurrentPage();
    },
    
    // تحميل الوحدات
    loadModules: function() {
        // سيتم تحميلها من خلال script tags في HTML
        console.log('الوحدات جاهزة للاستخدام');
    },
    
    // تهيئة الصفحة الحالية
    initCurrentPage: function() {
        const currentPage = window.location.pathname.split('/').pop();
        
        if (currentPage === 'index.html' || currentPage === '') {
            // صفحة الدخول
            if (typeof loginManager !== 'undefined') {
                loginManager.initLoginPage();
            }
        } else {
            // صفحات التطبيق الرئيسية
            this.initApp();
        }
    },
    
    // تهيئة التطبيق
    initApp: function() {
        // التحقق من تسجيل الدخول
        this.checkAuthentication();
        
        // تهيئة المكونات
        this.initComponents();
        
        // تحميل البيانات
        this.loadData();
        
        // إعداد المستمعين للأحداث
        this.setupEventListeners();
        
        // تحديث الإحصائيات
        this.updateStats();
        
        // تحديث النشاط الأخير
        this.updateRecentActivity();
        
        // تحديث التقويم
        this.updateCalendar();
    },
    
    // التحقق من المصادقة
    checkAuthentication: function() {
        const currentUser = usersModule.getCurrentUser();
        
        // إذا لم يكن هناك مستخدم مسجل، إعادة التوجيه إلى صفحة الدخول
        if (!currentUser && !window.location.pathname.includes('index.html')) {
            window.location.href = 'index.html';
            return;
        }
        
        // إذا كان المستخدم مسجل، عرض معلوماته
        if (currentUser) {
            this.displayUserInfo(currentUser);
            
            // التحقق من الصلاحيات
            this.checkPermissions(currentUser);
        }
    },
    
    // عرض معلومات المستخدم
    displayUserInfo: function(user) {
        const userAvatar = document.querySelector('.user-avatar');
        const userName = document.querySelector('.user-info h4');
        const userRole = document.querySelector('.user-info span');
        
        if (userAvatar) {
            userAvatar.textContent = user.name ? user.name.charAt(0) : 'م';
        }
        
        if (userName) {
            userName.textContent = user.name || 'المستخدم';
        }
        
        if (userRole) {
            const roleText = {
                'admin': 'مسؤول',
                'assistant': 'مساعد',
                'viewer': 'متفرج'
            };
            userRole.textContent = roleText[user.role] || user.role;
        }
    },
    
    // التحقق من الصلاحيات
    checkPermissions: function(user) {
        // إخفاء العناصر التي لا يملك المستخدم صلاحية الوصول إليها
        const role = user.role;
        
        // إذا كان زائراً، إخفاء بعض العناصر
        if (role === 'viewer') {
            const restrictedElements = document.querySelectorAll('.admin-only, .assistant-only');
            restrictedElements.forEach(el => {
                el.style.display = 'none';
            });
        }
        
        // إذا كان مساعداً، إخفاء العناصر الإدارية فقط
        if (role === 'assistant') {
            const adminElements = document.querySelectorAll('.admin-only');
            adminElements.forEach(el => {
                el.style.display = 'none';
            });
        }
    },
    
    // تهيئة المكونات
    initComponents: function() {
        // تهيئة القائمة الجانبية
        this.initSidebar();
        
        // تهيئة الإشعارات
        this.initNotifications();
        
        // تهيئة البحث
        this.initSearch();
        
        // تهيئة المودالات
        this.initModals();
        
        // تهيئة التقويم
        this.initCalendar();
    },
    
    // تهيئة القائمة الجانبية
    initSidebar: function() {
        const menuToggle = document.querySelector('.menu-toggle');
        const closeSidebar = document.querySelector('.close-sidebar');
        const sidebar = document.querySelector('.sidebar');
        
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.add('active');
            });
        }
        
        if (closeSidebar) {
            closeSidebar.addEventListener('click', () => {
                sidebar.classList.remove('active');
            });
        }
        
        // إغلاق القائمة الجانبية عند النقر خارجها (للأجهزة المحمولة)
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 992) {
                if (sidebar && !sidebar.contains(e.target) && menuToggle && !menuToggle.contains(e.target)) {
                    sidebar.classList.remove('active');
                }
            }
        });
        
        // تحديث العنصر النشط في القائمة
        this.updateActiveMenuItem();
    },
    
    // تحديث العنصر النشط في القائمة
    updateActiveMenuItem: function() {
        const currentPage = window.location.pathname.split('/').pop();
        const menuItems = document.querySelectorAll('.menu-item');
        
        menuItems.forEach(item => {
            item.classList.remove('active');
            const href = item.getAttribute('href');
            
            if (href === currentPage || (currentPage === '' && href === 'dashboard.html')) {
                item.classList.add('active');
            }
        });
    },
    
    // تهيئة الإشعارات
    initNotifications: function() {
        const notificationBtn = document.querySelector('.notification-btn');
        const notificationsPanel = document.querySelector('.notifications-panel');
        const markAllReadBtn = document.querySelector('.mark-all-read');
        
        if (notificationBtn && notificationsPanel) {
            notificationBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                notificationsPanel.classList.toggle('active');
                this.updateNotifications();
            });
            
            // إغلاق لوحة الإشعارات عند النقر خارجها
            document.addEventListener('click', (e) => {
                if (!notificationsPanel.contains(e.target) && !notificationBtn.contains(e.target)) {
                    notificationsPanel.classList.remove('active');
                }
            });
        }
        
        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', () => {
                membersModule.markAllNotificationsAsRead();
                this.updateNotifications();
                this.updateNotificationBadge();
            });
        }
    },
    
    // تحديث الإشعارات
    updateNotifications: function() {
        const notificationsList = document.querySelector('.notifications-list');
        if (!notificationsList) return;
        
        const notifications = membersModule.getNotifications();
        
        if (notifications.length === 0) {
            notificationsList.innerHTML = `
                <div class="no-notifications">
                    <p>لا توجد إشعارات جديدة</p>
                </div>
            `;
            return;
        }
        
        let notificationsHTML = '';
        
        notifications.slice(0, 10).forEach(notification => {
            const icon = this.getNotificationIcon(notification.type);
            const timeAgo = this.getTimeAgo(notification.timestamp);
            const unreadClass = notification.read ? '' : 'unread';
            
            notificationsHTML += `
                <div class="notification-item ${unreadClass}" data-id="${notification.id}">
                    <div class="notification-icon">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div class="notification-content">
                        <div class="notification-title">${notification.title}</div>
                        <p>${notification.message}</p>
                        <div class="notification-time">${timeAgo}</div>
                    </div>
                </div>
            `;
        });
        
        notificationsList.innerHTML = notificationsHTML;
        
        // إضافة مستمعي الأحداث لعناصر الإشعارات
        const notificationItems = document.querySelectorAll('.notification-item');
        notificationItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const notificationId = parseInt(item.getAttribute('data-id'));
                membersModule.markNotificationAsRead(notificationId);
                this.updateNotifications();
                this.updateNotificationBadge();
                
                // عرض تفاصيل الإشعار
                this.showNotificationDetails(notificationId);
            });
        });
    },
    
    // عرض تفاصيل الإشعار
    showNotificationDetails: function(notificationId) {
        const notifications = membersModule.getNotifications();
        const notification = notifications.find(n => n.id === notificationId);
        
        if (notification) {
            this.showCustomAlert(notification.title, notification.message, 'info');
        }
    },
    
    // الحصول على أيقونة الإشعار
    getNotificationIcon: function(type) {
        const icons = {
            'new_member': 'fa-user-plus',
            'renewal': 'fa-sync-alt',
            'payment': 'fa-credit-card',
            'expiring': 'fa-clock',
            'expired': 'fa-exclamation-triangle',
            'telegram': 'fa-paper-plane',
            'delete_member': 'fa-user-minus'
        };
        
        return icons[type] || 'fa-bell';
    },
    
    // حساب الوقت المنقضي
    getTimeAgo: function(timestamp) {
        const now = new Date();
        const past = new Date(timestamp);
        const diffMs = now - past;
        
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 60) {
            return `قبل ${diffMins} دقيقة`;
        } else if (diffHours < 24) {
            return `قبل ${diffHours} ساعة`;
        } else if (diffDays < 7) {
            return `قبل ${diffDays} يوم`;
        } else {
            return new Date(timestamp).toLocaleDateString('ar-EG');
        }
    },
    
    // تحديث شارة الإشعارات
    updateNotificationBadge: function() {
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            const unreadCount = membersModule.getUnreadNotificationsCount();
            if (unreadCount > 0) {
                badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    },
    
    // تهيئة البحث
    initSearch: function() {
        const searchInput = document.querySelector('.search-box input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }
    },
    
    // معالجة البحث
    handleSearch: function(query) {
        const currentPage = window.location.pathname.split('/').pop();
        
        if (currentPage === 'dashboard.html' || currentPage === '') {
            // البحث في لوحة التحكم
            this.searchDashboard(query);
        } else if (currentPage === 'members.html') {
            // البحث في صفحة الأعضاء
            this.searchMembers(query);
        } else if (currentPage === 'users.html') {
            // البحث في صفحة المستخدمين
            this.searchUsers(query);
        }
    },
    
    // البحث في لوحة التحكم
    searchDashboard: function(query) {
        console.log('بحث في لوحة التحكم:', query);
    },
    
    // البحث في الأعضاء
    searchMembers: function(query) {
        const members = membersModule.searchMembers(query);
        this.displayMembers(members);
    },
    
    // البحث في المستخدمين
    searchUsers: function(query) {
        const users = usersModule.searchUsers(query);
        this.displayUsers(users);
    },
    
    // تهيئة المودالات
    initModals: function() {
        // إغلاق المودال عند النقر خارج المحتوى
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal(e.target);
            }
        });
        
        // إغلاق المودال عند الضغط على زر الإغلاق
        const closeButtons = document.querySelectorAll('.close-modal');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.modal-overlay');
                this.closeModal(modal);
            });
        });
        
        // إغلاق المودال عند الضغط على زر ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal-overlay.active');
                if (openModal) {
                    this.closeModal(openModal);
                }
            }
        });
    },
    
    // فتح مودال
    openModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },
    
    // إغلاق مودال
    closeModal: function(modal) {
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    },
    
    // تهيئة التقويم
    initCalendar: function() {
        const prevMonthBtn = document.querySelector('.prev-month');
        const nextMonthBtn = document.querySelector('.next-month');
        
        if (prevMonthBtn) {
            prevMonthBtn.addEventListener('click', () => {
                this.changeMonth(-1);
            });
        }
        
        if (nextMonthBtn) {
            nextMonthBtn.addEventListener('click', () => {
                this.changeMonth(1);
            });
        }
    },
    
    // تغيير الشهر في التقويم
    changeMonth: function(direction) {
        const currentMonthElement = document.querySelector('.current-month');
        if (!currentMonthElement) return;
        
        const currentDate = new Date(currentMonthElement.getAttribute('data-date') || new Date());
        currentDate.setMonth(currentDate.getMonth() + direction);
        
        this.updateCalendar(currentDate);
    },
    
    // تحديث التقويم
    updateCalendar: function(date = new Date()) {
        const currentMonthElement = document.querySelector('.current-month');
        const calendarGrid = document.querySelector('.calendar-grid');
        
        if (!currentMonthElement || !calendarGrid) return;
        
        // تحديث عنوان الشهر
        const monthNames = [
            'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
            'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
        ];
        
        const monthName = monthNames[date.getMonth()];
        const year = date.getFullYear();
        currentMonthElement.textContent = `${monthName} ${year}`;
        currentMonthElement.setAttribute('data-date', date.toISOString());
        
        // مسح التقويم الحالي
        while (calendarGrid.children.length > 7) {
            calendarGrid.removeChild(calendarGrid.lastChild);
        }
        
        // الحصول على أول يوم من الشهر
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const startingDay = firstDay.getDay(); // 0 = الأحد، 6 = السبت
        
        // الحصول على عدد أيام الشهر
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        const daysInMonth = lastDay.getDate();
        
        // الحصول على اليوم الحالي
        const today = new Date();
        const isToday = (day) => {
            return day === today.getDate() && 
                   date.getMonth() === today.getMonth() && 
                   date.getFullYear() === today.getFullYear();
        };
        
        // إضافة الأيام الفارغة في بداية الشهر
        for (let i = 0; i < startingDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            calendarGrid.appendChild(emptyDay);
        }
        
        // إضافة أيام الشهر
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            if (isToday(day)) {
                dayElement.classList.add('today');
            }
            
            const dayNumber = document.createElement('div');
            dayNumber.className = 'calendar-day-number';
            dayNumber.textContent = day;
            dayElement.appendChild(dayNumber);
            
            // الحصول على الأحداث لهذا اليوم
            const currentDate = new Date(date.getFullYear(), date.getMonth(), day);
            const dateString = currentDate.toISOString().split('T')[0];
            const events = membersModule.getEventsByDate(dateString);
            
            if (events.length > 0) {
                const eventsContainer = document.createElement('div');
                eventsContainer.className = 'day-events';
                
                events.slice(0, 2).forEach(event => {
                    const eventElement = document.createElement('div');
                    eventElement.className = `day-event ${event.type}`;
                    eventElement.textContent = event.title;
                    eventElement.title = event.title;
                    eventsContainer.appendChild(eventElement);
                });
                
                if (events.length > 2) {
                    const moreEvents = document.createElement('div');
                    moreEvents.className = 'day-event more';
                    moreEvents.textContent = `+${events.length - 2} أكثر`;
                    eventsContainer.appendChild(moreEvents);
                }
                
                dayElement.appendChild(eventsContainer);
            }
            
            // إضافة مستمع حدث للنقر على اليوم
            dayElement.addEventListener('click', () => {
                this.showDayEvents(dateString, events);
            });
            
            calendarGrid.appendChild(dayElement);
        }
    },
    
    // عرض أحداث اليوم
    showDayEvents: function(date, events) {
        const dateObj = new Date(date);
        const formattedDate = dateObj.toLocaleDateString('ar-EG', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        if (events.length === 0) {
            this.showCustomAlert('أحداث اليوم', `لا توجد أحداث في ${formattedDate}`, 'info');
            return;
        }
        
        let eventsHTML = `<h4>${formattedDate}</h4>`;
        eventsHTML += '<ul style="list-style: none; padding: 0; margin-top: 15px;">';
        
        events.forEach(event => {
            const icon = this.getNotificationIcon(event.type);
            eventsHTML += `
                <li style="margin-bottom: 10px; padding: 10px; background: #f5f5f5; border-radius: 5px;">
                    <i class="fas ${icon}" style="margin-left: 8px;"></i>
                    ${event.title} (${event.time})
                </li>
            `;
        });
        
        eventsHTML += '</ul>';
        
        this.showCustomAlert('أحداث اليوم', eventsHTML, 'info');
    },
    
    // تحميل البيانات
    loadData: function() {
        // تحميل الأعضاء
        if (typeof membersModule !== 'undefined') {
            membersModule.getAllMembers();
        }
        
        // تحميل المستخدمين
        if (typeof usersModule !== 'undefined') {
            usersModule.getAllUsers();
        }
        
        // تحميل الباقات
        if (typeof membersModule !== 'undefined') {
            membersModule.getAllPackages();
        }
    },
    
    // إعداد مستمعي الأحداث
    setupEventListeners: function() {
        // تسجيل الخروج
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (typeof loginManager !== 'undefined') {
                    loginManager.logout();
                }
            });
        }
        
        // بطاقات الإحصائيات
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            card.addEventListener('click', () => {
                const statType = card.getAttribute('data-stat');
                this.showStatDetails(statType);
            });
        });
        
        // عناصر النشاط الأخير
        const activityItems = document.querySelectorAll('.activity-item');
        activityItems.forEach(item => {
            item.addEventListener('click', () => {
                const activityId = item.getAttribute('data-id');
                this.showActivityDetails(activityId);
            });
        });
    },
    
    // عرض تفاصيل الإحصائية
    showStatDetails: function(statType) {
        let title = '';
        let content = '';
        const stats = membersModule.calculateStats();
        
        switch(statType) {
            case 'total':
                title = 'تفاصيل جميع المشتركين';
                content = `إجمالي عدد المشتركين: ${stats.totalMembers}<br>
                          الرجال: ${stats.maleMembers}<br>
                          النساء: ${stats.femaleMembers}`;
                break;
            case 'male':
                title = 'تفاصيل المشتركين الرجال';
                const maleMembers = membersModule.getMembersByGender('male');
                content = `عدد الرجال: ${stats.maleMembers}`;
                if (maleMembers.length > 0) {
                    content += '<br><br>أحدث المشتركين:<ul>';
                    maleMembers.slice(0, 5).forEach(member => {
                        content += `<li>${member.fullName} - ${member.packageName}</li>`;
                    });
                    content += '</ul>';
                }
                break;
            case 'female':
                title = 'تفاصيل المشتركين النساء';
                const femaleMembers = membersModule.getMembersByGender('female');
                content = `عدد النساء: ${stats.femaleMembers}`;
                if (femaleMembers.length > 0) {
                    content += '<br><br>أحدث المشتركين:<ul>';
                    femaleMembers.slice(0, 5).forEach(member => {
                        content += `<li>${member.fullName} - ${member.packageName}</li>`;
                    });
                    content += '</ul>';
                }
                break;
            case 'revenue':
                title = 'تفاصيل الإيرادات';
                content = `إجمالي الإيرادات: ${stats.totalRevenue} جنيه<br>
                          إيرادات هذا الشهر: ${stats.monthlyRevenue} جنيه`;
                break;
            case 'expiring':
                title = 'الاشتراكات على وشك الانتهاء';
                const expiringMembers = membersModule.getMembersByStatus('expiring');
                content = `عدد الاشتراكات: ${stats.expiringMembers}`;
                if (expiringMembers.length > 0) {
                    content += '<br><br>قائمة الاشتراكات:<ul>';
                    expiringMembers.forEach(member => {
                        content += `<li>${member.fullName} - ينتهي في ${member.endDate}</li>`;
                    });
                    content += '</ul>';
                }
                break;
            case 'expired':
                title = 'الاشتراكات المنتهية';
                const expiredMembers = membersModule.getMembersByStatus('expired');
                content = `عدد الاشتراكات: ${stats.expiredMembers}`;
                if (expiredMembers.length > 0) {
                    content += '<br><br>قائمة الاشتراكات:<ul>';
                    expiredMembers.forEach(member => {
                        content += `<li>${member.fullName} - انتهى في ${member.endDate}</li>`;
                    });
                    content += '</ul>';
                }
                break;
        }
        
        this.showCustomAlert(title, content, 'info');
    },
    
    // عرض تفاصيل النشاط
    showActivityDetails: function(activityId) {
        this.showCustomAlert('تفاصيل النشاط', 'تفاصيل النشاط ستظهر هنا', 'info');
    },
    
    // تحديث الإحصائيات
    updateStats: function() {
        if (typeof membersModule === 'undefined') return;
        
        const stats = membersModule.calculateStats();
        
        // تحديث قيم الإحصائيات في واجهة المستخدم
        const statElements = {
            'total': document.querySelector('[data-stat="total"] .stat-value'),
            'male': document.querySelector('[data-stat="male"] .stat-value'),
            'female': document.querySelector('[data-stat="female"] .stat-value'),
            'revenue': document.querySelector('[data-stat="revenue"] .stat-value'),
            'expiring': document.querySelector('[data-stat="expiring"] .stat-value'),
            'expired': document.querySelector('[data-stat="expired"] .stat-value')
        };
        
        if (statElements.total) statElements.total.textContent = stats.totalMembers;
        if (statElements.male) statElements.male.textContent = stats.maleMembers;
        if (statElements.female) statElements.female.textContent = stats.femaleMembers;
        if (statElements.revenue) statElements.revenue.textContent = `${stats.monthlyRevenue} ج.م`;
        if (statElements.expiring) statElements.expiring.textContent = stats.expiringMembers;
        if (statElements.expired) statElements.expired.textContent = stats.expiredMembers;
    },
    
    // تحديث النشاط الأخير
    updateRecentActivity: function() {
        const activityList = document.querySelector('.activity-list');
        if (!activityList) return;
        
        if (typeof membersModule === 'undefined') return;
        
        const activities = membersModule.getActivities(5);
        
        if (activities.length === 0) {
            activityList.innerHTML = `
                <div class="no-activity">
                    <p>لا توجد نشاطات حديثة</p>
                </div>
            `;
            return;
        }
        
        let activityHTML = '';
        
        activities.forEach(activity => {
            const icon = this.getActivityIcon(activity.type);
            const timeAgo = this.getTimeAgo(activity.timestamp);
            
            activityHTML += `
                <div class="activity-item" data-id="${activity.id || ''}">
                    <div class="activity-icon ${activity.type}">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div class="activity-details">
                        <div class="activity-title">${activity.title}</div>
                        <div class="activity-meta">
                            <span class="activity-time">${timeAgo}</span>
                            ${activity.amount > 0 ? 
                                `<span class="activity-amount">${activity.amount} ج.م</span>` : 
                                ''
                            }
                        </div>
                    </div>
                </div>
            `;
        });
        
        activityList.innerHTML = activityHTML;
    },
    
    // الحصول على أيقونة النشاط
    getActivityIcon: function(type) {
        return this.getNotificationIcon(type);
    },
    
    // عرض قائمة الأعضاء
    // عرض قائمة الأعضاء
displayMembers: function(members) {
    const tableBody = document.querySelector('.members-table tbody');
    if (!tableBody) return;
    
    if (members.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 30px;">
                    لا توجد أعضاء
                </td>
            </tr>
        `;
        return;
    }
    
    let tableHTML = '';
    
    members.forEach((member, index) => {
        const statusText = {
            'active': 'نشط',
            'expiring': 'قريب الانتهاء',
            'expired': 'منتهي'
        };
        
        const paymentText = {
            'cash': 'كاش',
            'vodafone_cash': 'فودافون كاش',
            'instapay': 'انستا باي'
        };
        
        // من أضاف العضو؟
        const addedBy = member.addedBy || 'نظام';
        
        tableHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${member.fullName}</td>
                <td>${member.phone}</td>
                <td>${member.packageName}</td>
                <td>${member.startDate}</td>
                <td>${member.endDate}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg, #4a6baf, #6a8bcf); color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">
                            ${addedBy.charAt(0)}
                        </div>
                        <span>${addedBy}</span>
                    </div>
                </td>
                <td>
                    <span class="status ${member.status}">
                        ${statusText[member.status] || member.status}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view" title="عرض" onclick="GymManagement.viewMember('${member.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit" title="تعديل" onclick="GymManagement.editMember('${member.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" title="حذف" onclick="GymManagement.deleteMember('${member.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = tableHTML;
},
    // عرض قائمة المستخدمين
    displayUsers: function(users) {
        const tableBody = document.querySelector('.users-table tbody');
        if (!tableBody) return;
        
        if (users.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 30px;">
                        لا توجد نتائج للبحث
                    </td>
                </tr>
            `;
            return;
        }
        
        let tableHTML = '';
        
        users.forEach(user => {
            const roleText = {
                'admin': 'مسؤول',
                'assistant': 'مساعد',
                'viewer': 'متفرج'
            };
            
            const statusIcon = user.status === 'online' ? 
                '<i class="fas fa-circle" style="color: var(--success);"></i>' : 
                '<i class="far fa-circle" style="color: var(--danger);"></i>';
            
            tableHTML += `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td>${user.name}</td>
                    <td>${roleText[user.role] || user.role}</td>
                    <td>${user.email}</td>
                    <td>${statusIcon} ${user.status === 'online' ? 'متصل' : 'غير متصل'}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn view" title="عرض" onclick="GymManagement.viewUser(${user.id})">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn edit" title="تعديل" onclick="GymManagement.editUser(${user.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete" title="حذف" onclick="GymManagement.deleteUser(${user.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        tableBody.innerHTML = tableHTML;
    },
    
    // عرض العضو
    viewMember: function(memberId) {
        const members = membersModule.getAllMembers();
        const member = members.find(m => m.id === memberId);
        
        if (member) {
            const genderText = member.gender === 'male' ? 'رجل' : 'سيده';
            const statusText = {
                'active': 'نشط',
                'expiring': 'قريب الانتهاء',
                'expired': 'منتهي'
            };
            const paymentText = {
                'cash': 'كاش',
                'vodafone_cash': 'فودافون كاش',
                'instapay': 'انستا باي'
            };
            
            const content = `
                <div style="line-height: 1.8;">
                    <p><strong>الكود:</strong> ${member.id}</p>
                    <p><strong>الاسم:</strong> ${member.fullName}</p>
                    <p><strong>العمر:</strong> ${member.age}</p>
                    <p><strong>الجنس:</strong> ${genderText}</p>
                    <p><strong>الهاتف:</strong> ${member.phone}</p>
                    <p><strong>الباقة:</strong> ${member.packageName}</p>
                    <p><strong>السعر:</strong> ${member.packagePrice} جنيه</p>
                    <p><strong>تاريخ البدء:</strong> ${member.startDate}</p>
                    <p><strong>تاريخ الانتهاء:</strong> ${member.endDate}</p>
                    <p><strong>طريقة الدفع:</strong> ${paymentText[member.paymentMethod]}</p>
                    <p><strong>الحالة:</strong> ${statusText[member.status]}</p>
                    <p><strong>تم الإضافة بواسطة:</strong> ${member.addedBy}</p>
                    <p><strong>تاريخ الإضافة:</strong> ${member.addedDate}</p>
                    ${member.notes ? `<p><strong>ملاحظات:</strong> ${member.notes}</p>` : ''}
                </div>
            `;
            
            this.showCustomAlert('تفاصيل العضو', content, 'info');
        }
    },
    
    // تعديل العضو
    editMember: function(memberId) {
        const members = membersModule.getAllMembers();
        const member = members.find(m => m.id === memberId);
        
        if (member) {
            // فتح نموذج التعديل
            this.openEditMemberModal(member);
        }
    },
    
    // حذف العضو
    deleteMember: function(memberId) {
        this.showConfirmDialog(
            'حذف العضو',
            'هل أنت متأكد من حذف هذا العضو؟',
            () => {
                const success = membersModule.deleteMember(memberId);
                if (success) {
                    this.showCustomAlert('تم الحذف', 'تم حذف العضو بنجاح', 'success');
                    this.updateStats();
                    
                    // إعادة تحميل قائمة الأعضاء إذا كنا في صفحة الأعضاء
                    if (window.location.pathname.includes('members.html')) {
                        this.displayMembers(membersModule.getAllMembers());
                    }
                } else {
                    this.showCustomAlert('خطأ', 'حدث خطأ أثناء حذف العضو', 'error');
                }
            }
        );
    },
    
    // عرض المستخدم
    viewUser: function(userId) {
        const users = usersModule.getAllUsers();
        const user = users.find(u => u.id === userId);
        
        if (user) {
            const roleText = {
                'admin': 'مسؤول',
                'assistant': 'مساعد',
                'viewer': 'متفرج'
            };
            
            const content = `
                <div style="line-height: 1.8;">
                    <p><strong>اسم المستخدم:</strong> ${user.username}</p>
                    <p><strong>الاسم الكامل:</strong> ${user.name}</p>
                    <p><strong>الدور:</strong> ${roleText[user.role]}</p>
                    <p><strong>البريد الإلكتروني:</strong> ${user.email}</p>
                    <p><strong>الهاتف:</strong> ${user.phone}</p>
                    <p><strong>الحالة:</strong> ${user.status === 'online' ? 'متصل' : 'غير متصل'}</p>
                    <p><strong>آخر دخول:</strong> ${user.lastLogin || 'لم يسجل دخول من قبل'}</p>
                    <p><strong>تم الإنشاء بواسطة:</strong> ${user.createdBy}</p>
                    <p><strong>تاريخ الإنشاء:</strong> ${user.createdAt}</p>
                    <p><strong>الصلاحيات:</strong> ${user.permissions.join(', ')}</p>
                </div>
            `;
            
            this.showCustomAlert('تفاصيل المستخدم', content, 'info');
        }
    },
    
    // تعديل المستخدم
    editUser: function(userId) {
        const users = usersModule.getAllUsers();
        const user = users.find(u => u.id === userId);
        
        if (user) {
            // فتح نموذج التعديل
            this.openEditUserModal(user);
        }
    },
    
    // حذف المستخدم
    deleteUser: function(userId) {
        // منع حذف المستخدم الحالي
        const currentUser = usersModule.getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            this.showCustomAlert('خطأ', 'لا يمكنك حذف حسابك الخاص', 'error');
            return;
        }
        
        this.showConfirmDialog(
            'حذف المستخدم',
            'هل أنت متأكد من حذف هذا المستخدم؟',
            () => {
                const success = usersModule.deleteUser(userId);
                if (success) {
                    this.showCustomAlert('تم الحذف', 'تم حذف المستخدم بنجاح', 'success');
                    
                    // إعادة تحميل قائمة المستخدمين إذا كنا في صفحة المستخدمين
                    if (window.location.pathname.includes('users.html')) {
                        this.displayUsers(usersModule.getAllUsers());
                    }
                } else {
                    this.showCustomAlert('خطأ', 'حدث خطأ أثناء حذف المستخدم', 'error');
                }
            }
        );
    },
    
    // فتح نموذج تعديل العضو
    openEditMemberModal: function(member) {
        console.log('فتح نموذج تعديل العضو:', member);
        this.showCustomAlert('قريباً', 'ميزة تعديل العضو قيد التطوير', 'info');
    },
    
    // فتح نموذج تعديل المستخدم

    // في كودك، غير دالة editUser في GymManagement من:


// إلى:
openEditUserModal: function(user) {
    console.log('فتح نموذج تعديل المستخدم:', user);
    
    // تعبئة البيانات في نموذج التعديل
    document.getElementById('editUserId').value = user.id;
    document.getElementById('editUsername').value = user.username;
    document.getElementById('editName').value = user.name;
    document.getElementById('editEmail').value = user.email || '';
    document.getElementById('editPhone').value = user.phone || '';
    document.getElementById('editRole').value = user.role;
    document.getElementById('editStatus').value = user.status;
    
    // إظهار المودال
    document.getElementById('editUserModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
},
    
    // عرض حوار تأكيد
    showConfirmDialog: function(title, message, onConfirm) {
        const dialogHTML = `
            <div class="custom-alert show" id="confirmDialog">
                <div class="alert-icon warning">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="alert-message">
                    <h4>${title}</h4>
                    <p>${message}</p>
                </div>
                <div class="alert-actions">
                    <button class="btn btn-secondary" id="confirmCancel">إلغاء</button>
                    <button class="btn btn-primary" id="confirmOk">موافق</button>
                </div>
            </div>
        `;
        
        // إضافة الحوار إلى الجسم
        const dialogContainer = document.createElement('div');
        dialogContainer.innerHTML = dialogHTML;
        document.body.appendChild(dialogContainer);
        
        // إضافة مستمعي الأحداث للأزرار
        document.getElementById('confirmCancel').addEventListener('click', () => {
            document.body.removeChild(dialogContainer);
        });
        
        document.getElementById('confirmOk').addEventListener('click', () => {
            document.body.removeChild(dialogContainer);
            if (onConfirm) onConfirm();
        });
    },
    
    // عرض تنبيه مخصص
    showCustomAlert: function(title, message, type = 'info') {
        const iconClass = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle'
        };
        
        const alertHTML = `
            <div class="custom-alert show" id="customAlert">
                <div class="alert-icon ${type}">
                    <i class="fas ${iconClass[type]}"></i>
                </div>
                <div class="alert-message">
                    <h4>${title}</h4>
                    <p>${message}</p>
                </div>
                <div class="alert-actions">
                    <button class="btn btn-primary" id="alertOk">موافق</button>
                </div>
            </div>
        `;
        
        // إضافة التنبيه إلى الجسم
        const alertContainer = document.createElement('div');
        alertContainer.innerHTML = alertHTML;
        document.body.appendChild(alertContainer);
        
        // إغلاق التنبيه تلقائياً بعد 5 ثوان
        setTimeout(() => {
            const alert = document.getElementById('customAlert');
            if (alert && alert.parentNode) {
                alert.parentNode.remove();
            }
        }, 5000);
        
        // إضافة مستمع حدث لزر الموافق
        document.getElementById('alertOk').addEventListener('click', () => {
            if (alertContainer.parentNode) {
                document.body.removeChild(alertContainer);
            }
        });
    },
    
    // إضافة عضو جديد
    addNewMember: function() {
        this.showCustomAlert('إضافة عضو جديد', 'سيتم فتح نموذج إضافة عضو جديد هنا', 'info');
    },
    
    // إضافة مستخدم جديد
    addNewUser: function() {
        this.showCustomAlert('إضافة مستخدم جديد', 'سيتم فتح نموذج إضافة مستخدم جديد هنا', 'info');
    },
    
    // إضافة باقة جديدة
    addNewPackage: function() {
        this.showCustomAlert('إضافة باقة جديدة', 'سيتم فتح نموذج إضافة باقة جديدة هنا', 'info');
    }
};

// تصدير للاستخدام العالمي
window.GymManagement = GymManagement;

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('تم تحميل نظام إدارة الجيم بنجاح');
    
    // تأخير قليلاً لضمان تحميل جميع الوحدات
    setTimeout(() => {
        GymManagement.init();
        
        // تحديث شارة الإشعارات
        if (typeof membersModule !== 'undefined') {
            GymManagement.updateNotificationBadge();
        }
    }, 100);
});


// دالة لعرض مودال تأكيد الخروج
// دالة لعرض مودال تأكيد الخروج
function logoutUser() {
    // عرض مودال التأكيد
    document.getElementById('logoutConfirmModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// دالة لإغلاق مودال الخروج
function closeLogoutModal() {
    document.getElementById('logoutConfirmModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// دالة تأكيد الخروج
function confirmLogout() {
    // إغلاق مودال التأكيد
    closeLogoutModal();
    
    // عرض مودال التحميل
    document.getElementById('logoutModal').style.display = 'flex';
    
    // تسجيل في الكونسول
    console.log('تسجيل الخروج...');
    
    // مسح بيانات المستخدم بعد تأخير بسيط
    setTimeout(() => {
        // مسح بيانات الجلسة
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        sessionStorage.clear();
        
        // إغلاق مودال التحميل
        document.getElementById('logoutModal').style.display = 'none';
        
        // عرض رسالة نجاح
        showToast('success', 'تم تسجيل الخروج بنجاح', 'سيتم توجيهك إلى صفحة الدخول...');
        
        // التوجيه إلى صفحة الدخول
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1500);
        
    }, 1000);
}

// دالة لعرض Toast notifications
function showToast(type, title, message) {
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                          type === 'error' ? 'fa-exclamation-circle' : 
                          type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(toast);
    
    // إضافة أنيميشن
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // إزالة التوست بعد 5 ثواني
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 5000);
}
// دالة لعرض Toast notifications
function showToast(type, title, message) {
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                          type === 'error' ? 'fa-exclamation-circle' : 
                          type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(toast);
    
    // إضافة أنيميشن
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // إزالة التوست بعد 5 ثواني
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 5000);
}

// دالة حفظ التعديلات
window.saveUserChanges = function() {
    const userId = parseInt(document.getElementById('editUserId').value);
    const newPassword = document.getElementById('editPassword').value;
    const confirmPassword = document.getElementById('editConfirmPassword').value;
    
    // تحقق من كلمة المرور
    if (newPassword && newPassword !== confirmPassword) {
        GymManagement.showCustomAlert('خطأ', 'كلمتا المرور غير متطابقتين', 'error');
        return;
    }
    
    // تجمع البيانات الجديدة
    const updatedUser = {
        username: document.getElementById('editUsername').value,
        name: document.getElementById('editName').value,
        email: document.getElementById('editEmail').value,
        phone: document.getElementById('editPhone').value,
        role: document.getElementById('editRole').value,
        status: document.getElementById('editStatus').value
    };
    
    // تضيف كلمة المرور الجديدة لو موجودة
    if (newPassword) {
        updatedUser.password = newPassword;
    }
    
    // تحقق من البيانات
    if (!updatedUser.username || !updatedUser.name || !updatedUser.email || !updatedUser.role) {
        GymManagement.showCustomAlert('خطأ', 'يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    // تحقق من اسم المستخدم المكرر
    const users = usersModule.getAllUsers();
    const usernameExists = users.some(u => 
        u.username === updatedUser.username && u.id !== userId
    );
    
    if (usernameExists) {
        GymManagement.showCustomAlert('خطأ', 'اسم المستخدم موجود بالفعل', 'error');
        return;
    }
    
    // تحفظ التعديلات
    const success = usersModule.updateUser(userId, updatedUser);
    
    if (success) {
        // تغلق النافذة
        document.getElementById('editUserModal').style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // تظهر رسالة نجاح
        GymManagement.showCustomAlert('نجاح', 'تم تحديث بيانات المستخدم بنجاح', 'success');
        
        // تعيد تحميل الجدول
        const users = usersModule.getAllUsers();
        GymManagement.displayUsers(users);
    } else {
        GymManagement.showCustomAlert('خطأ', 'حدث خطأ أثناء تحديث المستخدم', 'error');
    }
};

// دالة إغلاق نافذة التعديل
function closeEditModal() {
    document.getElementById('editUserModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// إغلاق عند النقر خارج النافذة
// document.getElementById('editUserModal').addEventListener('click', function(e) {
//     if (e.target === this) {
//         closeEditModal();
//     }
// });

// إغلاق بالزر ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && document.getElementById('editUserModal').style.display === 'flex') {
        closeEditModal();
    }
});


