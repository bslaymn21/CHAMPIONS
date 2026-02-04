// نظام لوحة تحكم المتفرج
const ViewerDashboard = {
    // تهيئة الصفحة
    init: function() {
        console.log('تهيئة لوحة تحكم المتفرج...');
        
        // التحقق من صلاحية المستخدم
        this.checkUserRole();
        
        // تهيئة المكونات
        this.initComponents();
        
        // تحميل البيانات
        this.loadData();
        
        // إعداد المستمعين للأحداث
        this.setupEventListeners();
        
        // تحديث الوقت
        this.updateLastUpdateTime();
        
        // تحديث دوري كل 30 ثانية
        setInterval(() => {
            this.updateDashboard();
        }, 30000);
    },
    
    // التحقق من دور المستخدم
    checkUserRole: function() {
        const currentUser = usersModule.getCurrentUser();
        
        if (!currentUser) {
            // إذا لم يكن هناك مستخدم مسجل، إعادة التوجيه إلى صفحة الدخول
            window.location.href = 'index.html';
            return;
        }
        
        // عرض معلومات المستخدم
        this.displayUserInfo(currentUser);
        
        // إذا كان المستخدم ليس متفرجاً، تحذير أو إعادة توجيه
        if (currentUser.role !== 'viewer') {
            console.log('المستخدم ليس متفرجاً، لكن يمكنه الوصول إلى هذه الصفحة');
        }
    },
    
    // عرض معلومات المستخدم
    displayUserInfo: function(user) {
        const userName = document.getElementById('userNameViewer');
        const userRole = document.getElementById('userRoleViewer');
        const userAvatar = document.getElementById('userAvatarViewer');
        const userAvatarSmall = document.getElementById('userAvatarSmallViewer');
        const dropdownUserName = document.getElementById('dropdownUserNameViewer');
        
        if (userName) userName.textContent = user.name || 'مستخدم';
        if (userRole) userRole.textContent = 'متفرج';
        if (userAvatar) userAvatar.textContent = user.name ? user.name.charAt(0) : 'م';
        if (userAvatarSmall) userAvatarSmall.textContent = user.name ? user.name.charAt(0) : 'م';
        if (dropdownUserName) dropdownUserName.textContent = user.name || 'مستخدم';
    },
    
    // تهيئة المكونات
    initComponents: function() {
        // تهيئة القائمة الجانبية
        this.initSidebar();
        
        // تهيئة الإشعارات
        this.initNotifications();
        
        // تهيئة القائمة المنسدلة للمستخدم
        this.initUserDropdown();
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
        
        // إغلاق القائمة عند النقر خارجها
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 992) {
                if (sidebar && !sidebar.contains(e.target) && menuToggle && !menuToggle.contains(e.target)) {
                    sidebar.classList.remove('active');
                }
            }
        });
    },
    
    // تهيئة الإشعارات
    initNotifications: function() {
        const notificationBtn = document.getElementById('notificationBtnViewer');
        const notificationsPanel = document.getElementById('notificationsPanelViewer');
        
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
    },
    
    // تحديث الإشعارات
    updateNotifications: function() {
        const notificationsList = document.getElementById('notificationsListViewer');
        if (!notificationsList) return;
        
        if (typeof membersModule === 'undefined') {
            notificationsList.innerHTML = `
                <div class="no-notifications">
                    <p>نظام الإشعارات غير متاح</p>
                </div>
            `;
            return;
        }
        
        const notifications = membersModule.getNotifications();
        const viewerImportantNotifications = document.getElementById('viewerImportantNotifications');
        
        if (notifications.length === 0) {
            notificationsList.innerHTML = `
                <div class="no-notifications">
                    <p>لا توجد إشعارات جديدة</p>
                </div>
            `;
            
            if (viewerImportantNotifications) {
                viewerImportantNotifications.innerHTML = `
                    <div class="no-notifications">
                        <p>لا توجد إشعارات مهمة</p>
                    </div>
                `;
            }
            return;
        }
        
        // عرض الإشعارات في لوحة الإشعارات
        let notificationsHTML = '';
        let importantNotificationsHTML = '';
        
        notifications.slice(0, 10).forEach(notification => {
            const icon = this.getNotificationIcon(notification.type);
            const timeAgo = this.getTimeAgo(notification.timestamp);
            const unreadClass = notification.read ? '' : 'unread';
            
            // إشعارات لوحة الإشعارات
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
            
            // الإشعارات المهمة للمتفرج (الـ 3 الأحدث غير مقروءة)
            if (!notification.read && importantNotificationsHTML.split('important-notification').length - 1 < 3) {
                importantNotificationsHTML += `
                    <div class="important-notification">
                        <div class="notification-title">
                            <i class="fas ${icon}"></i>
                            ${notification.title}
                        </div>
                        <div class="notification-message">${notification.message}</div>
                        <div class="notification-time">${timeAgo}</div>
                    </div>
                `;
            }
        });
        
        notificationsList.innerHTML = notificationsHTML;
        
        if (viewerImportantNotifications) {
            if (importantNotificationsHTML) {
                viewerImportantNotifications.innerHTML = importantNotificationsHTML;
            } else {
                viewerImportantNotifications.innerHTML = `
                    <div class="no-notifications">
                        <p>لا توجد إشعارات مهمة جديدة</p>
                    </div>
                `;
            }
        }
        
        // تحديث شارة الإشعارات
        this.updateNotificationBadge();
        
        // تحديث العداد في القائمة الجانبية
        this.updateSidebarNotificationCount();
    },
    
    // الحصول على أيقونة الإشعار
    getNotificationIcon: function(type) {
        const icons = {
            'new_member': 'fa-user-plus',
            'renewal': 'fa-sync-alt',
            'payment': 'fa-credit-card',
            'expiring': 'fa-clock',
            'expired': 'fa-exclamation-triangle',
            'delete_member': 'fa-user-minus',
            'restore_member': 'fa-trash-restore'
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
        const badge = document.getElementById('notificationBadgeViewer');
        if (badge && typeof membersModule !== 'undefined') {
            const unreadCount = membersModule.getUnreadNotificationsCount();
            if (unreadCount > 0) {
                badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    },
    
    // تحديث عداد الإشعارات في القائمة الجانبية
    updateSidebarNotificationCount: function() {
        const sidebarCount = document.getElementById('sidebarNotificationCount');
        const dropdownCount = document.getElementById('dropdownNotificationCount');
        
        if (typeof membersModule !== 'undefined') {
            const unreadCount = membersModule.getUnreadNotificationsCount();
            
            if (sidebarCount) {
                sidebarCount.textContent = unreadCount;
                sidebarCount.style.display = unreadCount > 0 ? 'flex' : 'none';
            }
            
            if (dropdownCount) {
                dropdownCount.textContent = unreadCount;
                dropdownCount.style.display = unreadCount > 0 ? 'inline-block' : 'none';
            }
        }
    },
    
    // تهيئة القائمة المنسدلة للمستخدم
    initUserDropdown: function() {
        const dropdownBtn = document.getElementById('userDropdownBtnViewer');
        const dropdownMenu = document.getElementById('userDropdownMenuViewer');
        
        if (dropdownBtn && dropdownMenu) {
            dropdownBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
            });
            
            // إغلاق القائمة عند النقر خارجها
            document.addEventListener('click', () => {
                dropdownMenu.style.display = 'none';
            });
        }
    },
    
    // تحميل البيانات
    loadData: function() {
        if (typeof membersModule !== 'undefined') {
            // تحديث الإحصائيات
            this.updateStats();
            
            // تحديث النشاطات
            this.updateActivities();
            
            // تحديث الإشعارات
            this.updateNotifications();
            
            // تحديث المعلومات الإضافية
            this.updateAdditionalInfo();
        } else {
            console.error('membersModule غير متوفر');
        }
    },
    
    // تحديث الإحصائيات
    updateStats: function() {
        if (typeof membersModule === 'undefined') return;
        
        const stats = membersModule.calculateStats();
        const newMembers = membersModule.getNewMembersThisMonth();
        
        // تحديث قيم الإحصائيات
        const statElements = {
            'total': document.getElementById('statTotal'),
            'male': document.getElementById('statMale'),
            'female': document.getElementById('statFemale'),
            'new-this-month': document.getElementById('statNewThisMonth')
        };
        
        if (statElements.total) statElements.total.textContent = stats.totalMembers;
        if (statElements.male) statElements.male.textContent = stats.maleMembers;
        if (statElements.female) statElements.female.textContent = stats.femaleMembers;
        if (statElements['new-this-month']) statElements['new-this-month'].textContent = newMembers.length;
        
        // تحديث الإيرادات
        const totalRevenue = document.getElementById('totalRevenue');
        const monthlyRevenue = document.getElementById('monthlyRevenue');
        
        if (totalRevenue) totalRevenue.textContent = `${stats.totalRevenue} ج.م`;
        if (monthlyRevenue) monthlyRevenue.textContent = `${stats.monthlyRevenue} ج.م`;
        
        // تحديث عدد المستخدمين النشطين
        const activeUsers = document.getElementById('activeUsers');
        if (activeUsers && typeof usersModule !== 'undefined') {
            const users = usersModule.getAllUsers();
            const activeUsersCount = users.filter(u => u.status === 'online').length;
            activeUsers.textContent = activeUsersCount;
        }
    },
    
    // تحديث النشاطات
    updateActivities: function() {
        const activityList = document.getElementById('viewerActivityList');
        if (!activityList) return;
        
        if (typeof membersModule === 'undefined') {
            activityList.innerHTML = `
                <div class="no-activity">
                    <p>نظام النشاطات غير متاح</p>
                </div>
            `;
            return;
        }
        
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
            const icon = this.getNotificationIcon(activity.type);
            const timeAgo = this.getTimeAgo(activity.timestamp || new Date());
            
            activityHTML += `
                <div class="activity-item-viewer">
                    <div class="activity-icon" style="background: ${this.getActivityColor(activity.type)};">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div class="activity-details">
                        <div class="activity-title">${activity.title}</div>
                        <div class="activity-meta">
                            <span class="activity-time">
                                <i class="far fa-clock"></i> ${timeAgo}
                            </span>
                            ${activity.amount > 0 ? 
                                `<span class="activity-amount">
                                    <i class="fas fa-money-bill-wave"></i> ${activity.amount} ج.م
                                </span>` : 
                                ''
                            }
                        </div>
                    </div>
                </div>
            `;
        });
        
        activityList.innerHTML = activityHTML;
    },
    
    // الحصول على لون النشاط
    getActivityColor: function(type) {
        const colors = {
            'new_member': '#4caf50',
            'renewal': '#2196f3',
            'payment': '#ff9800',
            'expiring': '#ff5722',
            'expired': '#f44336',
            'delete_member': '#9c27b0',
            'restore_member': '#009688'
        };
        
        return colors[type] || '#607d8b';
    },
    
    // تحديث المعلومات الإضافية
    updateAdditionalInfo: function() {
        // يمكن إضافة معلومات إضافية هنا
    },
    
    // تحديث وقت آخر تحديث
    updateLastUpdateTime: function() {
        const lastUpdate = document.getElementById('lastUpdate');
        if (lastUpdate) {
            const now = new Date();
            lastUpdate.textContent = now.toLocaleTimeString('ar-EG', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    },
    
    // إعداد مستمعي الأحداث
    setupEventListeners: function() {
        // تحديث عند النقر على زر التحديث
        const refreshBtn = document.querySelector('[onclick="refreshViewerDashboard()"]');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.updateDashboard();
            });
        }
    },
    
    // تحديث لوحة التحكم
    updateDashboard: function() {
        console.log('تحديث لوحة تحكم المتفرج...');
        this.updateStats();
        this.updateActivities();
        this.updateNotifications();
        this.updateLastUpdateTime();
        
        // إضافة تأثير مرئي للتحديث
        const statsGrid = document.getElementById('viewerStatsGrid');
        if (statsGrid) {
            statsGrid.style.opacity = '0.7';
            setTimeout(() => {
                statsGrid.style.opacity = '1';
            }, 300);
        }
    },
    
    // عرض تفاصيل إجمالي المشتركين
    showTotalDetails: function() {
        if (typeof membersModule === 'undefined') return;
        
        const stats = membersModule.calculateStats();
        const allMembers = membersModule.getAllMembers();
        
        const content = `
            <div class="details-content">
                <h4 style="color: var(--primary-color); margin-bottom: 20px;">
                    <i class="fas fa-users"></i> تفاصيل جميع المشتركين
                </h4>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
                    <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 12px; color: var(--gray-dark);">الإجمالي</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--primary-color);">
                            ${stats.totalMembers}
                        </div>
                    </div>
                    <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 12px; color: var(--gray-dark);">النشطين</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--success);">
                            ${stats.activeMembers}
                        </div>
                    </div>
                    <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 12px; color: var(--gray-dark);">المنتهية</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--danger);">
                            ${stats.expiredMembers}
                        </div>
                    </div>
                    <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 12px; color: var(--gray-dark);">قريب الانتهاء</div>
                        <div style="font-size: 24px; font-weight: bold; color: var(--warning);">
                            ${stats.expiringMembers}
                        </div>
                    </div>
                </div>
                
                <!-- رسم بياني مبسط -->
                <div class="simple-chart">
                    <div class="chart-bar" style="height: ${(stats.maleMembers / stats.totalMembers) * 100}%;">
                        <div class="chart-bar-label">رجال (${stats.maleMembers})</div>
                    </div>
                    <div class="chart-bar" style="height: ${(stats.femaleMembers / stats.totalMembers) * 100}%;">
                        <div class="chart-bar-label">نساء (${stats.femaleMembers})</div>
                    </div>
                </div>
                
                <div style="margin-top: 20px;">
                    <h5 style="color: var(--text-dark);">أحدث المشتركين:</h5>
                    <table class="details-table">
                        <thead>
                            <tr>
                                <th>الكود</th>
                                <th>الاسم</th>
                                <th>الباقة</th>
                                <th>تاريخ الانضمام</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${allMembers.slice(0, 5).map(member => `
                                <tr>
                                    <td>${member.id}</td>
                                    <td>${member.fullName}</td>
                                    <td>${member.packageName}</td>
                                    <td>${member.addedDate || member.startDate}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        this.showDetailsModal('تفاصيل جميع المشتركين', content);
    },
    
    // عرض تفاصيل المشتركين الرجال
    showMaleDetails: function() {
        if (typeof membersModule === 'undefined') return;
        
        const stats = membersModule.calculateStats();
        const maleMembers = membersModule.getMembersByGender('male');
        
        const content = `
            <div class="details-content">
                <h4 style="color: var(--primary-color); margin-bottom: 20px;">
                    <i class="fas fa-male"></i> تفاصيل المشتركين الرجال
                </h4>
                
                <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                        <div style="width: 60px; height: 60px; background: #2196f3; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px;">
                            <i class="fas fa-male"></i>
                        </div>
                        <div>
                            <div style="font-size: 32px; font-weight: bold; color: #2196f3;">
                                ${stats.maleMembers}
                            </div>
                            <div style="color: var(--text-light);">مشترك رجل</div>
                        </div>
                    </div>
                    
                    <div style="font-size: 14px; color: var(--text-light);">
                        يمثلون ${stats.totalMembers > 0 ? ((stats.maleMembers / stats.totalMembers) * 100).toFixed(1) : 0}% من إجمالي المشتركين
                    </div>
                </div>
                
                <div style="margin-top: 20px;">
                    <h5 style="color: var(--text-dark);">قائمة المشتركين الرجال:</h5>
                    ${maleMembers.length > 0 ? `
                        <table class="details-table">
                            <thead>
                                <tr>
                                    <th>الكود</th>
                                    <th>الاسم</th>
                                    <th>العمر</th>
                                    <th>الباقة</th>
                                    <th>الحالة</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${maleMembers.slice(0, 8).map(member => `
                                    <tr>
                                        <td>${member.id}</td>
                                        <td>${member.fullName}</td>
                                        <td>${member.age}</td>
                                        <td>${member.packageName}</td>
                                        <td>
                                            <span class="status ${member.status}" style="padding: 3px 8px; font-size: 12px;">
                                                ${member.status === 'active' ? 'نشط' : member.status === 'expiring' ? 'قريب الانتهاء' : 'منتهي'}
                                            </span>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : `
                        <div style="text-align: center; padding: 30px; color: var(--text-light);">
                            <i class="fas fa-male" style="font-size: 48px; margin-bottom: 15px; color: var(--gray);"></i>
                            <p>لا توجد بيانات للمشتركين الرجال</p>
                        </div>
                    `}
                </div>
            </div>
        `;
        
        this.showDetailsModal('تفاصيل المشتركين الرجال', content);
    },
    
    // عرض تفاصيل المشتركين النساء
    showFemaleDetails: function() {
        if (typeof membersModule === 'undefined') return;
        
        const stats = membersModule.calculateStats();
        const femaleMembers = membersModule.getMembersByGender('female');
        
        const content = `
            <div class="details-content">
                <h4 style="color: var(--primary-color); margin-bottom: 20px;">
                    <i class="fas fa-female"></i> تفاصيل المشتركين النساء
                </h4>
                
                <div style="background: #fce4ec; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                        <div style="width: 60px; height: 60px; background: #e91e63; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px;">
                            <i class="fas fa-female"></i>
                        </div>
                        <div>
                            <div style="font-size: 32px; font-weight: bold; color: #e91e63;">
                                ${stats.femaleMembers}
                            </div>
                            <div style="color: var(--text-light);">مشتركة أنثى</div>
                        </div>
                    </div>
                    
                    <div style="font-size: 14px; color: var(--text-light);">
                        يمثلن ${stats.totalMembers > 0 ? ((stats.femaleMembers / stats.totalMembers) * 100).toFixed(1) : 0}% من إجمالي المشتركين
                    </div>
                </div>
                
                <div style="margin-top: 20px;">
                    <h5 style="color: var(--text-dark);">قائمة المشتركين النساء:</h5>
                    ${femaleMembers.length > 0 ? `
                        <table class="details-table">
                            <thead>
                                <tr>
                                    <th>الكود</th>
                                    <th>الاسم</th>
                                    <th>العمر</th>
                                    <th>الباقة</th>
                                    <th>الحالة</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${femaleMembers.slice(0, 8).map(member => `
                                    <tr>
                                        <td>${member.id}</td>
                                        <td>${member.fullName}</td>
                                        <td>${member.age}</td>
                                        <td>${member.packageName}</td>
                                        <td>
                                            <span class="status ${member.status}" style="padding: 3px 8px; font-size: 12px;">
                                                ${member.status === 'active' ? 'نشطة' : member.status === 'expiring' ? 'قريبة الانتهاء' : 'منتهية'}
                                            </span>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : `
                        <div style="text-align: center; padding: 30px; color: var(--text-light);">
                            <i class="fas fa-female" style="font-size: 48px; margin-bottom: 15px; color: var(--gray);"></i>
                            <p>لا توجد بيانات للمشتركين النساء</p>
                        </div>
                    `}
                </div>
            </div>
        `;
        
        this.showDetailsModal('تفاصيل المشتركين النساء', content);
    },
    
    // عرض تفاصيل الأعضاء الجدد هذا الشهر
    showNewMembersDetails: function() {
        if (typeof membersModule === 'undefined') return;
        
        const newMembers = membersModule.getNewMembersThisMonth();
        const revenue = membersModule.getNewMembersRevenue();
        
        const currentMonth = new Date().toLocaleDateString('ar-EG', {
            month: 'long',
            year: 'numeric'
        });
        
        const content = `
            <div class="details-content">
                <h4 style="color: var(--primary-color); margin-bottom: 20px;">
                    <i class="fas fa-user-plus"></i> الأعضاء الجدد في ${currentMonth}
                </h4>
                
                <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-size: 32px; font-weight: bold; color: #4caf50;">
                                ${newMembers.length}
                            </div>
                            <div style="color: var(--text-light);">عضو جديد</div>
                        </div>
                        <div style="text-align: left;">
                            <div style="font-size: 24px; font-weight: bold; color: var(--success);">
                                ${revenue} ج.م
                            </div>
                            <div style="color: var(--text-light);">إيرادات جديدة</div>
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: 20px;">
                    <h5 style="color: var(--text-dark);">قائمة الأعضاء الجدد:</h5>
                    ${newMembers.length > 0 ? `
                        <table class="details-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>الكود</th>
                                    <th>الاسم</th>
                                    <th>الباقة</th>
                                    <th>تاريخ الانضمام</th>
                                    <th>المبلغ</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${newMembers.map((member, index) => `
                                    <tr>
                                        <td>${index + 1}</td>
                                        <td>${member.id}</td>
                                        <td>${member.fullName}</td>
                                        <td>${member.packageName}</td>
                                        <td>${member.addedDate || member.startDate}</td>
                                        <td style="color: var(--success); font-weight: bold;">
                                            ${member.packagePrice} ج.م
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        
                        <div style="margin-top: 20px; padding: 15px; background: #f9f9f9; border-radius: 8px; text-align: center;">
                            <div style="display: flex; justify-content: space-around;">
                                <div>
                                    <div style="font-size: 14px; color: var(--text-light);">متوسط سعر الباقة</div>
                                    <div style="font-size: 18px; font-weight: bold; color: var(--primary-color);">
                                        ${newMembers.length > 0 ? (revenue / newMembers.length).toFixed(0) : 0} ج.م
                                    </div>
                                </div>
                                <div>
                                    <div style="font-size: 14px; color: var(--text-light);">أعلى باقة</div>
                                    <div style="font-size: 18px; font-weight: bold; color: var(--success);">
                                        ${newMembers.length > 0 ? Math.max(...newMembers.map(m => m.packagePrice || 0)) : 0} ج.م
                                    </div>
                                </div>
                            </div>
                        </div>
                    ` : `
                        <div style="text-align: center; padding: 30px; color: var(--text-light);">
                            <i class="fas fa-user-plus" style="font-size: 48px; margin-bottom: 15px; color: var(--gray);"></i>
                            <p>لا توجد أعضاء جدد هذا الشهر</p>
                        </div>
                    `}
                </div>
            </div>
        `;
        
        this.showDetailsModal(`الأعضاء الجدد - ${currentMonth}`, content);
    },
    
    // عرض مودال التفاصيل
    showDetailsModal: function(title, content) {
        const modal = document.getElementById('detailsModal');
        const modalTitle = document.getElementById('detailsModalTitle');
        const modalContent = document.getElementById('detailsModalContent');
        
        if (modal && modalTitle && modalContent) {
            modalTitle.textContent = title;
            modalContent.innerHTML = content;
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    },
    
    // إغلاق مودال التفاصيل
    closeDetailsModal: function() {
        const modal = document.getElementById('detailsModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    },
    
    // عرض رسالة الوصول المرفوض
    showAccessDenied: function() {
        const content = `
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-lock" style="font-size: 64px; color: var(--danger); margin-bottom: 20px;"></i>
                <h3 style="color: var(--danger); margin-bottom: 15px;">⚠️ الوصول مرفوض ⚠️</h3>
                <p style="color: var(--text-light); margin-bottom: 20px;">
                    عذراً، لا تملك صلاحية الوصول إلى هذه الصفحة.<br>
                    هذه الصفحة مخصصة للمشاهدة فقط في وضع المتفرج.
                </p>
                <button class="btn btn-primary" onclick="ViewerDashboard.closeDetailsModal()">
                    <i class="fas fa-check"></i> فهمت
                </button>
            </div>
        `;
        
        this.showDetailsModal('صلاحيات محدودة', content);
    },
    
    // طباعة تقرير المتفرج
    printViewerReport: function() {
        if (typeof membersModule === 'undefined') {
            alert('نظام الأعضاء غير متاح');
            return;
        }
        
        const stats = membersModule.calculateStats();
        const newMembers = membersModule.getNewMembersThisMonth();
        const currentMonth = new Date().toLocaleDateString('ar-EG', {
            month: 'long',
            year: 'numeric'
        });
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>تقرير إحصائيات المتفرج</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    }
                    
                    body {
                        padding: 20px;
                        line-height: 1.6;
                        color: #333;
                    }
                    
                    .print-header {
                        text-align: center;
                        margin-bottom: 30px;
                        border-bottom: 3px solid #3498db;
                        padding-bottom: 20px;
                    }
                    
                    .print-header h1 {
                        color: #3498db;
                        margin-bottom: 10px;
                    }
                    
                    .print-header .subtitle {
                        color: #666;
                        font-size: 16px;
                    }
                    
                    .print-date {
                        color: #666;
                        font-size: 14px;
                        margin-top: 10px;
                    }
                    
                    .section {
                        margin-bottom: 30px;
                        page-break-inside: avoid;
                    }
                    
                    .section-title {
                        background: #f5f5f5;
                        padding: 10px 15px;
                        border-right: 4px solid #3498db;
                        margin-bottom: 15px;
                        font-weight: bold;
                        color: #3498db;
                    }
                    
                    .stats-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 15px;
                        margin-bottom: 20px;
                    }
                    
                    .stat-box {
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        padding: 15px;
                        text-align: center;
                    }
                    
                    .stat-value {
                        font-size: 24px;
                        font-weight: bold;
                        color: #3498db;
                        margin: 10px 0;
                    }
                    
                    .stat-label {
                        color: #666;
                        font-size: 14px;
                    }
                    
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 10px 0;
                    }
                    
                    th {
                        background: #f5f5f5;
                        padding: 12px;
                        text-align: right;
                        border: 1px solid #ddd;
                        font-weight: bold;
                        color: #333;
                    }
                    
                    td {
                        padding: 10px 12px;
                        border: 1px solid #ddd;
                    }
                    
                    tr:nth-child(even) {
                        background: #f9f9f9;
                    }
                    
                    .total-row {
                        background: #e8f4fd !important;
                        font-weight: bold;
                    }
                    
                    @media print {
                        body {
                            padding: 0;
                        }
                        
                        .no-print {
                            display: none;
                        }
                    }
                    
                    .footer {
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 1px solid #ddd;
                        text-align: center;
                        color: #666;
                        font-size: 12px;
                    }
                    
                    .viewer-note {
                        background: #fff3cd;
                        padding: 15px;
                        border-radius: 8px;
                        margin: 20px 0;
                        border-right: 4px solid #ffc107;
                        color: #856404;
                    }
                </style>
            </head>
            <body>
                <div class="print-header">
                    <h1>تقرير إحصائيات المتفرج</h1>
                    <div class="subtitle">تقرير عرض فقط - لا يسمح بالتعديل</div>
                    <div class="print-date">
                        ${new Date().toLocaleDateString('ar-EG', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </div>
                </div>
                
                <div class="viewer-note">
                    <strong>ملاحظة:</strong> هذا تقرير للمشاهدة فقط. المستخدم الحالي: متفرج
                </div>
                
                <div class="section">
                    <div class="section-title">الإحصائيات الرئيسية</div>
                    <div class="stats-grid">
                        <div class="stat-box">
                            <div class="stat-label">إجمالي المشتركين</div>
                            <div class="stat-value">${stats.totalMembers}</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-label">المشتركين الرجال</div>
                            <div class="stat-value">${stats.maleMembers}</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-label">المشتركين النساء</div>
                            <div class="stat-value">${stats.femaleMembers}</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-label">الجدد ${currentMonth}</div>
                            <div class="stat-value">${newMembers.length}</div>
                        </div>
                    </div>
                </div>
                
                <div class="section">
                    <div class="section-title">الإيرادات</div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                        <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px;">
                            <div style="font-size: 12px; color: #666;">إجمالي الإيرادات</div>
                            <div style="font-size: 24px; font-weight: bold; color: #2ecc71;">
                                ${stats.totalRevenue} ج.م
                            </div>
                        </div>
                        <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px;">
                            <div style="font-size: 12px; color: #666;">إيرادات ${currentMonth}</div>
                            <div style="font-size: 24px; font-weight: bold; color: #3498db;">
                                ${stats.monthlyRevenue} ج.م
                            </div>
                        </div>
                    </div>
                </div>
                
                ${newMembers.length > 0 ? `
                    <div class="section">
                        <div class="section-title">الأعضاء الجدد في ${currentMonth}</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>الكود</th>
                                    <th>الاسم</th>
                                    <th>الباقة</th>
                                    <th>التاريخ</th>
                                    <th>المبلغ</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${newMembers.map((member, index) => `
                                    <tr>
                                        <td>${index + 1}</td>
                                        <td>${member.id}</td>
                                        <td>${member.fullName}</td>
                                        <td>${member.packageName}</td>
                                        <td>${member.addedDate || member.startDate}</td>
                                        <td>${member.packagePrice || 0} ج.م</td>
                                    </tr>
                                `).join('')}
                                <tr class="total-row">
                                    <td colspan="5">الإجمالي</td>
                                    <td>${newMembers.reduce((sum, m) => sum + (m.packagePrice || 0), 0)} ج.م</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                ` : ''}
                
                <div class="footer">
                    <p>تم إنشاء التقرير تلقائياً من نظام إدارة الجيم - وضع المتفرج</p>
                    <p>© ${new Date().getFullYear()} GYMPRO - جميع الحقوق محفوظة</p>
                </div>
                
                <div class="no-print" style="margin-top: 20px; text-align: center;">
                    <button onclick="window.print()" style="
                        background: #3498db;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 16px;
                    ">
                        طباعة التقرير
                    </button>
                    <button onclick="window.close()" style="
                        background: #666;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 16px;
                        margin-right: 10px;
                    ">
                        إغلاق
                    </button>
                </div>
            </body>
            </html>
        `);
        
        printWindow.document.close();
    }
};

// دالات مساعدة للاستدعاء من HTML
window.refreshViewerDashboard = function() {
    ViewerDashboard.updateDashboard();
};

window.printViewerReport = function() {
    ViewerDashboard.printViewerReport();
};

window.showTotalDetails = function() {
    ViewerDashboard.showTotalDetails();
};

window.showMaleDetails = function() {
    ViewerDashboard.showMaleDetails();
};

window.showFemaleDetails = function() {
    ViewerDashboard.showFemaleDetails();
};

window.showNewMembersDetails = function() {
    ViewerDashboard.showNewMembersDetails();
};

window.closeDetailsModal = function() {
    ViewerDashboard.closeDetailsModal();
};

window.showAccessDenied = function() {
    ViewerDashboard.showAccessDenied();
};

window.markAllNotificationsAsReadViewer = function() {
    if (typeof membersModule !== 'undefined') {
        membersModule.markAllNotificationsAsRead();
        ViewerDashboard.updateNotifications();
    }
};

window.logoutViewer = function() {
    if (typeof loginManager !== 'undefined') {
        loginManager.logout();
    } else {
        localStorage.removeItem('current_user');
        window.location.href = 'index.html';
    }
};

window.loadMoreActivities = function() {
    // يمكن إضافة دالة لتحميل المزيد من النشاطات
    alert('سيتم تطوير هذه الخاصية في الإصدارات القادمة');
};

// تهيئة الصفحة عند التحميل
document.addEventListener('DOMContentLoaded', function() {
    ViewerDashboard.init();
    
    // إضافة مستمع لأزرار القائمة
    document.querySelectorAll('.menu-item').forEach(item => {
        if (item.getAttribute('onclick')?.includes('showAccessDenied')) {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                ViewerDashboard.showAccessDenied();
            });
        }
    });
});