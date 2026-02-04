// js/assistant.js - ملف لوحة المساعد الكامل

// ========================
// متغيرات عامة
// ========================
let assistantMembers = [];
let currentFilter = 'all';
let currentCalendarDate = new Date();
let currentUser = null;

// ========================
// تهيئة النظام
// ========================
function initAssistantDashboard() {
    console.log('🚀 تهيئة لوحة المساعد...');
    
    // التحقق من تسجيل الدخول
    currentUser = getCurrentUserSafely();
    
    if (!currentUser) {
        console.log('❌ لا يوجد مستخدم، إعادة التوجيه...');
        window.location.href = '../index.html';
        return;
    }
    
    console.log('👤 المستخدم الحالي:', currentUser);
    
    // التحقق من الصلاحيات
    if (currentUser.role !== 'assistant') {
        alert('ليس لديك صلاحية الوصول إلى لوحة المساعد.');
        if (currentUser.role === 'admin') {
            window.location.href = '../dashboard.html';
        } else {
            window.location.href = '../index.html';
        }
        return;
    }
    
    // تحديث معلومات المستخدم
    updateUserInfo(currentUser);
    
    // تعيين التواريخ
    setTodayDates();
    
    // إعداد القائمة الجانبية
    setupSidebar();
    
    // إعداد الأحداث
    setupAssistantEvents();
    
    // تحميل البيانات
    loadAllAssistantData();
}

// ========================
// إدارة المستخدم
// ========================
function getCurrentUserSafely() {
    try {
        // من usersModule
        if (typeof usersModule !== 'undefined' && usersModule.getCurrentUser) {
            return usersModule.getCurrentUser();
        }
        
        // من localStorage
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            return JSON.parse(userData);
        }
        
        return null;
    } catch (e) {
        console.error('❌ خطأ في جلب المستخدم:', e);
        return null;
    }
}

function updateUserInfo(user) {
    if (!user) return;
    
    const userName = user.name || user.username || 'المساعد';
    const userRole = user.role === 'assistant' ? 'مساعد' : 'مسؤول';
    const userInitial = userName.charAt(0);
    
    // تحديث العناصر
    updateElementText('userName', userName);
    updateElementText('userNameTop', userName);
    updateElementText('userRole', userRole);
    
    // تحديث الصورة الرمزية
    const avatar = document.getElementById('userAvatar');
    if (avatar) {
        avatar.textContent = userInitial;
        avatar.style.background = 'linear-gradient(135deg, #ff9800, #ff5722)';
    }
}

// ========================
// إعداد التواريخ
// ========================
function setTodayDates() {
    const today = new Date().toISOString().split('T')[0];
    
    if (document.getElementById('startDate')) {
        document.getElementById('startDate').value = today;
    }
    
    if (document.getElementById('renewalDate')) {
        document.getElementById('renewalDate').value = today;
    }
}

// ========================
// إعداد الواجهة
// ========================
function setupSidebar() {
    const menuToggle = document.querySelector('.menu-toggle');
    const closeSidebar = document.querySelector('.close-sidebar');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('active');
        });
    }
    
    if (closeSidebar && sidebar) {
        closeSidebar.addEventListener('click', () => {
            sidebar.classList.remove('active');
        });
    }
    
    // إغلاق عند النقر خارجها
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 992) {
            if (sidebar && !sidebar.contains(e.target) && menuToggle && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        }
    });
}

// ========================
// إعداد الأحداث
// ========================
function setupAssistantEvents() {
    // نموذج إضافة عضو
    const addMemberForm = document.getElementById('addMemberForm');
    if (addMemberForm) {
        addMemberForm.addEventListener('submit', handleAddMember);
    }
    
    // نموذج التجديد
    const renewalForm = document.getElementById('renewalForm');
    if (renewalForm) {
        renewalForm.addEventListener('submit', handleRenewal);
    }
    
    // البحث
    const searchInput = document.getElementById('memberSearch');
    if (searchInput) {
        searchInput.addEventListener('input', handleMemberSearch);
    }
    
    const tableSearch = document.getElementById('tableSearch');
    if (tableSearch) {
        tableSearch.addEventListener('input', handleTableSearch);
    }
    
    // التبويبات في القائمة
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const tabName = this.getAttribute('onclick')?.match(/showTab\('(.+)'\)/)?.[1];
            if (tabName) {
                showTab(tabName);
            }
        });
    });
}

// ========================
// تحميل البيانات
// ========================
function loadAllAssistantData() {
    console.log('📊 تحميل بيانات المساعد...');
    
    // التحقق من توفر الوحدات
    if (typeof membersModule === 'undefined') {
        console.error('❌ وحدة الأعضاء غير متوفرة');
        setTimeout(loadAllAssistantData, 500);
        return;
    }
    
    // تحميل الإحصائيات
    loadAssistantStats();
    
    // تحميل الأعضاء
    loadAssistantMembers();
    
    // تحميل الأعضاء الجدد
    loadRecentMembers();
    
    // تحميل الاشتراكات القريبة
    loadExpiringSubscriptions();
    
    // تحميل الباقات
    loadAssistantPackages();
    
    // تحميل النشاط الأخير
    loadRecentActivity();
    
    // تحميل التقويم
    loadAssistantCalendar();
    
    // تحديث الإشعارات
    updateNotificationBadge();
}

// ========================
// الإحصائيات
// ========================
function loadAssistantStats() {
    if (typeof membersModule === 'undefined') return;
    
    try {
        const stats = membersModule.calculateStats();
        
        console.log('📈 الإحصائيات:', stats);
        
        // تحديث الإحصائيات
        updateElementText('totalMembers', stats.totalMembers || 0);
        updateElementText('activeMembers', stats.activeMembers || 0);
        updateElementText('expiringMembers', stats.expiringMembers || 0);
        updateElementText('monthlyRevenue', (stats.monthlyRevenue || 0).toLocaleString() + ' ج.م');
        
        // تحديث النسب
        const activePercentage = stats.totalMembers > 0 ? 
            Math.round((stats.activeMembers / stats.totalMembers) * 100) : 0;
        updateElementText('activePercentage', `${activePercentage}% نشطين`);
        
        // تحديث التغييرات
        updateElementText('totalMembersChange', `+${stats.newMembersThisMonth || 0} هذا الشهر`);
        
    } catch (error) {
        console.error('❌ خطأ في تحميل الإحصائيات:', error);
    }
}

// ========================
// إدارة الأعضاء
// ========================
function loadAssistantMembers() {
    if (typeof membersModule === 'undefined') return;
    
    try {
        assistantMembers = membersModule.getAllMembers();
        console.log('👥 عدد الأعضاء:', assistantMembers.length);
        
        // عرض الأعضاء في الجدول
        displayAssistantMembers(assistantMembers);
        
        // ملء القوائم المنسدلة
        populateMemberDropdowns();
        
    } catch (error) {
        console.error('❌ خطأ في تحميل الأعضاء:', error);
    }
}

function displayAssistantMembers(members) {
    const tbody = document.getElementById('membersTableBody');
    if (!tbody) return;
    
    if (members.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 40px;">
                    <div class="no-data">
                        <i class="fas fa-users" style="font-size: 48px; color: var(--text-light); margin-bottom: 15px;"></i>
                        <p style="color: var(--text-light); font-size: 16px;">لا يوجد أعضاء</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    members.forEach((member, index) => {
        const statusClass = member.status === 'active' ? 'status-active' : 
                         member.status === 'expiring' ? 'status-expiring' : 'status-expired';
        const statusText = member.status === 'active' ? 'نشط' : 
                         member.status === 'expiring' ? 'ينتهي قريباً' : 'منتهي';
        
        const joinDateFormatted = formatDate(member.addedDate || member.startDate);
        const endDateFormatted = formatDate(member.endDate);
        const addedBy = member.addedBy || 'نظام';
        
        html += `
            <tr data-member-id="${member.id}">
                <td>${index + 1}</td>
                <td>
                    <div class="user-info">
                        <div class="user-avatar" style="background-color: #4caf50;">
                            ${member.fullName?.charAt(0) || member.name?.charAt(0) || '?'}
                        </div>
                        <div>
                            <div class="user-username">${member.fullName || member.name || 'غير معروف'}</div>
                            <small>${member.age ? member.age + ' سنة' : ''} ${member.gender === 'male' ? '👨' : '👩'}</small>
                        </div>
                    </div>
                </td>
                <td>${member.phone || 'لا يوجد'}</td>
                <td>${member.packageName || 'غير محدد'}</td>
                <td>${joinDateFormatted}</td>
                <td>${endDateFormatted}</td>
                <td>
                    <div style="display: flex; align-items: center;">
                        <div style="width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg, #ff9800, #ff5722); color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-left: 8px;">
                            ${addedBy.charAt(0)}
                        </div>
                        <span>${addedBy}</span>
                    </div>
                </td>
                <td>
                    <span class="status ${statusClass}">${statusText}</span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="action-btn view" onclick="viewMemberDetails('${member.id}')" title="عرض">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn renew" onclick="selectMemberForRenewal('${member.id}')" title="تجديد">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// ========================
// الأعضاء الجدد
// ========================
function loadRecentMembers() {
    if (typeof membersModule === 'undefined') return;
    
    try {
        const members = membersModule.getAllMembers();
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const recentMembers = members.filter(member => {
            const joinDate = new Date(member.addedDate || member.startDate);
            return joinDate > weekAgo;
        }).slice(0, 5);
        
        const container = document.getElementById('recentMembers');
        if (!container) return;
        
        if (recentMembers.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 20px; color: var(--text-light);">
                    <i class="fas fa-users" style="font-size: 32px; margin-bottom: 10px;"></i>
                    <p>لا يوجد أعضاء جدد</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        recentMembers.forEach(member => {
            const statusClass = member.status === 'active' ? 'status-active' : 
                             member.status === 'expiring' ? 'status-expiring' : 'status-expired';
            const statusText = member.status === 'active' ? 'نشط' : 
                             member.status === 'expiring' ? 'ينتهي قريباً' : 'منتهي';               
            
            html += `
                <div class="member-item" onclick="viewMemberDetails('${member.id}')">
                    <div class="member-avatar">${member.fullName?.charAt(0) || member.name?.charAt(0) || '?'}</div>
                    <div class="member-info">
                        <div class="member-name">${member.fullName || member.name || 'غير معروف'}</div>
                        <div class="member-phone">${member.phone || 'لا يوجد'}</div>
                    </div>
                    <div class="membership-status ${statusClass}">${statusText}</div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    } catch (error) {
        console.error('❌ خطأ في تحميل الأعضاء الجدد:', error);
    }
}

// ========================
// الاشتراكات المنتهية قريباً
// ========================
function loadExpiringSubscriptions() {
    if (typeof membersModule === 'undefined') return;
    
    try {
        const expiringMembers = membersModule.getMembersByStatus('expiring').slice(0, 5);
        const container = document.getElementById('expiringSubscriptions');
        const renewalList = document.getElementById('renewalList');
        
        if (container) {
            if (expiringMembers.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 20px; color: var(--text-light);">
                        <i class="fas fa-clock" style="font-size: 32px; margin-bottom: 10px;"></i>
                        <p>لا يوجد اشتراكات على وشك الانتهاء</p>
                    </div>
                `;
            } else {
                let html = '';
                expiringMembers.forEach(member => {
                    const endDate = new Date(member.endDate);
                    const today = new Date();
                    const diffDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
                    
                    html += `
                        <div class="subscription-item" onclick="selectMemberForRenewal('${member.id}')">
                            <div class="member-avatar">${member.fullName?.charAt(0) || member.name?.charAt(0) || '?'}</div>
                            <div class="member-info">
                                <div class="member-name">${member.fullName || member.name || 'غير معروف'}</div>
                                <div class="member-phone">ينتهي في ${formatDate(member.endDate)}</div>
                            </div>
                            <div class="membership-status status-expiring">${diffDays} يوم</div>
                        </div>
                    `;
                });
                container.innerHTML = html;
            }
        }
        
        if (renewalList) {
            if (expiringMembers.length === 0) {
                renewalList.innerHTML = `
                    <div style="text-align: center; padding: 20px; color: var(--text-light);">
                        <i class="fas fa-check-circle" style="font-size: 32px; margin-bottom: 10px; color: var(--success);"></i>
                        <p>جميع الاشتراكات محدثة</p>
                    </div>
                `;
            } else {
                let html = '';
                expiringMembers.forEach(member => {
                    html += `
                        <div class="subscription-item" onclick="selectMemberForRenewal('${member.id}')">
                            <div class="member-avatar">${member.fullName?.charAt(0) || member.name?.charAt(0) || '?'}</div>
                            <div class="member-info">
                                <div class="member-name">${member.fullName || member.name || 'غير معروف'}</div>
                                <div class="member-phone">${member.phone || 'لا يوجد'}</div>
                            </div>
                            <button class="btn btn-primary btn-sm" style="padding: 5px 10px; font-size: 12px;">
                                تجديد
                            </button>
                        </div>
                    `;
                });
                renewalList.innerHTML = html;
            }
        }
    } catch (error) {
        console.error('❌ خطأ في تحميل الاشتراكات القريبة:', error);
    }
}

// ========================
// الباقات
// ========================
function loadAssistantPackages() {
    if (typeof membersModule === 'undefined') return;
    
    try {
        const packages = membersModule.getAllPackages();
        const membershipTypeSelect = document.getElementById('membershipType');
        const renewalTypeSelect = document.getElementById('renewalType');
        
        if (membershipTypeSelect) {
            membershipTypeSelect.innerHTML = '<option value="">اختر نوع الاشتراك</option>';
            packages.forEach(pkg => {
                membershipTypeSelect.innerHTML += `
                    <option value="${pkg.id}" data-price="${pkg.price}" data-duration="${pkg.duration}">
                        ${pkg.name} - ${pkg.price} ج.م (${pkg.duration} يوم)
                    </option>
                `;
            });
            
            membershipTypeSelect.addEventListener('change', function() {
                const selectedOption = this.options[this.selectedIndex];
                const price = selectedOption.getAttribute('data-price');
                if (price) {
                    document.getElementById('paidAmount').value = price;
                }
            });
        }
        
        if (renewalTypeSelect) {
            renewalTypeSelect.innerHTML = '<option value="">اختر نوع التجديد</option>';
            packages.forEach(pkg => {
                renewalTypeSelect.innerHTML += `
                    <option value="${pkg.id}" data-price="${pkg.price}" data-duration="${pkg.duration}">
                        ${pkg.name} - ${pkg.price} ج.م (${pkg.duration} يوم)
                    </option>
                `;
            });
            
            renewalTypeSelect.addEventListener('change', function() {
                const selectedOption = this.options[this.selectedIndex];
                const price = selectedOption.getAttribute('data-price');
                if (price) {
                    document.getElementById('renewalAmount').value = price;
                }
            });
        }
    } catch (error) {
        console.error('❌ خطأ في تحميل الباقات:', error);
    }
}

// ========================
// النشاط الأخير
// ========================
function loadRecentActivity() {
    if (typeof membersModule === 'undefined') return;
    
    try {
        const activities = membersModule.getActivities(5);
        const container = document.getElementById('recentActivity');
        if (!container) return;
        
        if (activities.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 20px; color: var(--text-light);">
                    <i class="fas fa-history" style="font-size: 32px; margin-bottom: 10px;"></i>
                    <p>لا توجد نشاطات حديثة</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        activities.forEach(activity => {
            const icon = getNotificationIcon(activity.type);
            const timeAgo = getTimeAgo(activity.timestamp);
            
            html += `
                <div class="activity-item" onclick="showActivityDetails(${activity.id})">
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
        
        container.innerHTML = html;
    } catch (error) {
        console.error('❌ خطأ في تحميل النشاط الأخير:', error);
    }
}

// ========================
// التقويم
// ========================
function loadAssistantCalendar(date = currentCalendarDate) {
    currentCalendarDate = date;
    
    const currentMonthElement = document.getElementById('currentMonth');
    const calendarGrid = document.getElementById('calendarGrid');
    
    if (!currentMonthElement || !calendarGrid) return;
    
    const monthNames = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    
    const monthName = monthNames[date.getMonth()];
    const year = date.getFullYear();
    currentMonthElement.textContent = `${monthName} ${year}`;
    
    while (calendarGrid.children.length > 7) {
        calendarGrid.removeChild(calendarGrid.lastChild);
    }
    
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const startingDay = firstDay.getDay();
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    const today = new Date();
    
    const isToday = (day) => {
        return day === today.getDate() && 
               date.getMonth() === today.getMonth() && 
               date.getFullYear() === today.getFullYear();
    };
    
    for (let i = 0; i < startingDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarGrid.appendChild(emptyDay);
    }
    
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
        
        const currentDate = new Date(date.getFullYear(), date.getMonth(), day);
        const dateString = currentDate.toISOString().split('T')[0];
        
        if (assistantMembers.length > 0) {
            const events = [];
            
            const expiringMembers = assistantMembers.filter(member => 
                member.endDate === dateString
            );
            
            if (expiringMembers.length > 0) {
                events.push({
                    type: 'expiring',
                    title: `انتهاء اشتراك${expiringMembers.length > 1 ? 'ات' : ''}`,
                    count: expiringMembers.length
                });
            }
            
            const newMembers = assistantMembers.filter(member => 
                (member.addedDate === dateString || member.startDate === dateString)
            );
            
            if (newMembers.length > 0) {
                events.push({
                    type: 'new_member',
                    title: `عضو${newMembers.length > 1 ? 'اء' : ''} جديد${newMembers.length > 1 ? '' : ''}`,
                    count: newMembers.length
                });
            }
            
            if (events.length > 0) {
                const eventsContainer = document.createElement('div');
                eventsContainer.className = 'day-events';
                
                events.slice(0, 2).forEach(event => {
                    const eventElement = document.createElement('div');
                    eventElement.className = `day-event ${event.type}`;
                    eventElement.textContent = event.count > 1 ? `${event.count}+` : event.title;
                    eventElement.title = event.title;
                    eventsContainer.appendChild(eventElement);
                });
                
                dayElement.appendChild(eventsContainer);
            }
        }
        
        dayElement.addEventListener('click', () => {
            showDayEvents(dateString);
        });
        
        calendarGrid.appendChild(dayElement);
    }
}

// ========================
// إضافة عضو جديد
// ========================
function handleAddMember(e) {
    e.preventDefault();
    
    if (typeof membersModule === 'undefined') {
        showAlert('خطأ', 'لا يمكن إضافة عضو، النظام غير جاهز', 'error');
        return;
    }
    
    const memberData = {
        firstName: document.getElementById('memberName').value.split(' ')[0],
        lastName: document.getElementById('memberName').value.split(' ').slice(1).join(' '),
        phone: document.getElementById('memberPhone').value,
        email: document.getElementById('memberEmail').value || '',
        gender: document.getElementById('memberGender').value,
        age: document.getElementById('memberAge').value || null,
        address: document.getElementById('memberAddress').value || '',
        packageId: document.getElementById('membershipType').value,
        packageName: document.getElementById('membershipType').options[document.getElementById('membershipType').selectedIndex].text.split(' - ')[0],
        packagePrice: document.getElementById('paidAmount').value || 0,
        packageDuration: document.getElementById('membershipType').options[document.getElementById('membershipType').selectedIndex].getAttribute('data-duration') || 30,
        startDate: document.getElementById('startDate').value,
        paymentMethod: document.getElementById('paymentMethod').value,
        notes: document.getElementById('notes').value || '',
        addedBy: currentUser.name || currentUser.username || 'المساعد'
    };
    
    if (!memberData.firstName || !memberData.phone || !memberData.gender || !memberData.packageId || !memberData.startDate) {
        showAlert('خطأ', 'يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    if (!membersModule.isPhoneUnique(memberData.phone)) {
        showAlert('خطأ', 'رقم الهاتف مستخدم بالفعل', 'error');
        return;
    }
    
    try {
        const newMember = membersModule.addMember(memberData);
        
        if (newMember) {
            document.getElementById('addMemberForm').reset();
            document.getElementById('startDate').value = new Date().toISOString().split('T')[0];
            
            showAlert('نجاح', 'تم إضافة العضو بنجاح', 'success');
            
            loadAllAssistantData();
            
            setTimeout(() => showTab('dashboard'), 1000);
        } else {
            showAlert('خطأ', 'حدث خطأ أثناء إضافة العضو', 'error');
        }
    } catch (error) {
        console.error('خطأ في إضافة العضو:', error);
        showAlert('خطأ', 'حدث خطأ غير متوقع', 'error');
    }
}

// ========================
// تجديد الاشتراك
// ========================
function handleRenewal(e) {
    e.preventDefault();
    
    if (typeof membersModule === 'undefined') {
        showAlert('خطأ', 'لا يمكن تجديد الاشتراك، النظام غير جاهز', 'error');
        return;
    }
    
    const memberId = document.getElementById('renewMember').value;
    const packageId = document.getElementById('renewalType').value;
    const amount = document.getElementById('renewalAmount').value;
    const renewalDate = document.getElementById('renewalDate').value;
    const paymentMethod = document.getElementById('renewalPaymentMethod').value;
    const notes = document.getElementById('renewalNotes').value || '';
    
    if (!memberId || !packageId || !amount || !renewalDate || !paymentMethod) {
        showAlert('خطأ', 'يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    try {
        const packageInfo = membersModule.getPackageById(packageId);
        if (!packageInfo) {
            showAlert('خطأ', 'الباقة المختارة غير موجودة', 'error');
            return;
        }
        
        const renewalData = {
            packageId: packageId,
            packageName: packageInfo.name,
            packagePrice: amount,
            packageDuration: packageInfo.duration,
            startDate: renewalDate,
            paymentMethod: paymentMethod,
            notes: notes,
            renewedBy: currentUser.name || currentUser.username || 'المساعد'
        };
        
        const success = membersModule.renewMember(memberId, renewalData);
        
        if (success) {
            document.getElementById('renewalForm').reset();
            document.getElementById('renewalDate').value = new Date().toISOString().split('T')[0];
            
            showAlert('نجاح', 'تم تجديد الاشتراك بنجاح', 'success');
            
            loadAllAssistantData();
            
            setTimeout(() => showTab('dashboard'), 1000);
        } else {
            showAlert('خطأ', 'حدث خطأ أثناء تجديد الاشتراك', 'error');
        }
    } catch (error) {
        console.error('خطأ في تجديد الاشتراك:', error);
        showAlert('خطأ', 'حدث خطأ غير متوقع', 'error');
    }
}

// ========================
// البحث والتصفية
// ========================
function handleMemberSearch(e) {
    const query = e.target.value.toLowerCase();
    if (typeof membersModule !== 'undefined') {
        const filtered = membersModule.searchMembers(query);
        displayAssistantMembers(filtered);
    }
}

function handleTableSearch(e) {
    const query = e.target.value.toLowerCase();
    if (typeof membersModule !== 'undefined') {
        const filtered = membersModule.searchMembers(query);
        displayAssistantMembers(filtered);
    }
}

function filterMembers(filter) {
    currentFilter = filter;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    if (typeof membersModule === 'undefined') return;
    
    let filtered = [];
    
    switch(filter) {
        case 'all':
            filtered = membersModule.getAllMembers();
            break;
        case 'active':
            filtered = membersModule.getMembersByStatus('active');
            break;
        case 'expiring':
            filtered = membersModule.getMembersByStatus('expiring');
            break;
        case 'expired':
            filtered = membersModule.getMembersByStatus('expired');
            break;
        case 'new':
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            const allMembers = membersModule.getAllMembers();
            filtered = allMembers.filter(member => {
                const joinDate = new Date(member.addedDate || member.startDate);
                return joinDate > weekAgo;
            });
            break;
    }
    
    displayAssistantMembers(filtered);
}

// ========================
// عرض وتفاصيل العضو
// ========================
function viewMemberDetails(memberId) {
    if (typeof membersModule === 'undefined') return;
    
    const member = membersModule.getMemberById(memberId);
    if (!member) {
        showAlert('خطأ', 'العضو غير موجود', 'error');
        return;
    }
    
    const genderText = member.gender === 'male' ? 'رجل' : 'سيده';
    const statusText = {
        'active': 'نشط',
        'expiring': 'ينتهي قريباً',
        'expired': 'منتهي'
    };
    const paymentText = {
        'cash': 'كاش',
        'vodafone_cash': 'فودافون كاش',
        'instapay': 'انستا باي'
    };
    
    const content = `
        <div style="line-height: 1.8; max-width: 500px;">
            <div style="display: flex; align-items: center; margin-bottom: 20px;">
                <div style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #4caf50, #2e7d32); color: white; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; margin-left: 15px;">
                    ${member.fullName?.charAt(0) || member.name?.charAt(0) || '?'}
                </div>
                <div>
                    <h3 style="margin: 0 0 5px 0;">${member.fullName || member.name || 'غير معروف'}</h3>
                    <p style="margin: 0; color: var(--text-light);">${member.phone || 'لا يوجد'}</p>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                    <strong>الكود:</strong> ${member.id || 'غير محدد'}
                </div>
                <div>
                    <strong>العمر:</strong> ${member.age || 'غير محدد'} سنة
                </div>
                <div>
                    <strong>الجنس:</strong> ${genderText}
                </div>
                <div>
                    <strong>البريد:</strong> ${member.email || 'لا يوجد'}
                </div>
                <div>
                    <strong>الباقة:</strong> ${member.packageName || 'غير محدد'}
                </div>
                <div>
                    <strong>السعر:</strong> ${member.packagePrice || 0} جنيه
                </div>
                <div>
                    <strong>تاريخ البدء:</strong> ${formatDate(member.startDate)}
                </div>
                <div>
                    <strong>تاريخ الانتهاء:</strong> ${formatDate(member.endDate)}
                </div>
                <div>
                    <strong>طريقة الدفع:</strong> ${paymentText[member.paymentMethod] || member.paymentMethod}
                </div>
                <div>
                    <strong>الحالة:</strong> <span class="status ${member.status}">${statusText[member.status] || member.status}</span>
                </div>
            </div>
            
            ${member.notes ? `
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--gray);">
                    <strong>ملاحظات:</strong><br>
                    ${member.notes}
                </div>
            ` : ''}
            
            <div style="margin-top: 20px; display: flex; gap: 10px;">
                <button class="btn btn-secondary" onclick="closeModal()" style="flex: 1;">إغلاق</button>
                <button class="btn btn-primary" onclick="selectMemberForRenewal('${member.id}')" style="flex: 1;">تجديد اشتراك</button>
            </div>
        </div>
    `;
    
    showModal('تفاصيل العضو', content);
}

// ========================
// تجديد عضو
// ========================
function selectMemberForRenewal(memberId) {
    const renewMemberSelect = document.getElementById('renewMember');
    if (renewMemberSelect) {
        renewMemberSelect.value = memberId;
        showTab('renew');
    }
}

function renewMember(memberId) {
    const member = assistantMembers.find(m => m.id === memberId);
    if (!member) return;
    
    showTab('renew');
    
    const renewMemberSelect = document.getElementById('renewMember');
    if (renewMemberSelect) {
        renewMemberSelect.value = memberId;
    }
}

// ========================
// ملء القوائم المنسدلة
// ========================
function populateMemberDropdowns() {
    const renewMemberSelect = document.getElementById('renewMember');
    
    if (renewMemberSelect && assistantMembers.length > 0) {
        renewMemberSelect.innerHTML = '<option value="">اختر العضو</option>';
        assistantMembers.forEach(member => {
            if (member.status === 'expiring' || member.status === 'expired') {
                renewMemberSelect.innerHTML += `
                    <option value="${member.id}">${member.fullName || member.name} - ${member.phone}</option>
                `;
            }
        });
    }
}

// ========================
// التبويبات
// ========================
function showTab(tabName) {
    const titles = {
        'dashboard': 'لوحة التحكم',
        'members': 'إدارة الأعضاء',
        'add-member': 'إضافة عضو جديد',
        'renew': 'تجديد الاشتراكات',
        'calendar': 'التقويم'
    };
    
    updateElementText('pageTitle', titles[tabName] || 'لوحة التحكم');
    
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    if (window.innerWidth <= 992) {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) sidebar.classList.remove('active');
    }
    
    if (tabName === 'dashboard') {
        loadAllAssistantData();
    } else if (tabName === 'members') {
        loadAssistantMembers();
    } else if (tabName === 'renew') {
        loadExpiringSubscriptions();
        populateMemberDropdowns();
    } else if (tabName === 'calendar') {
        loadAssistantCalendar();
    }
}

function quickAddMember() {
    showTab('add-member');
}

// ========================
// التقويم
// ========================
function showToday() {
    currentCalendarDate = new Date();
    loadAssistantCalendar(currentCalendarDate);
}

function changeMonth(direction) {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + direction);
    loadAssistantCalendar(currentCalendarDate);
}

function showDayEvents(date) {
    if (!assistantMembers || assistantMembers.length === 0) {
        showAlert('معلومات', 'لا توجد أحداث في هذا اليوم', 'info');
        return;
    }
    
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString('ar-EG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const expiringMembers = assistantMembers.filter(member => 
        member.endDate === date
    );
    
    const newMembers = assistantMembers.filter(member => 
        (member.addedDate === date || member.startDate === date)
    );
    
    if (expiringMembers.length === 0 && newMembers.length === 0) {
        showAlert('أحداث اليوم', `لا توجد أحداث في ${formattedDate}`, 'info');
        return;
    }
    
    let eventsHTML = `<h4>${formattedDate}</h4>`;
    
    if (newMembers.length > 0) {
        eventsHTML += `<h5>الأعضاء الجدد (${newMembers.length})</h5><ul style="list-style: none; padding: 0; margin-bottom: 15px;">`;
        newMembers.slice(0, 5).forEach(member => {
            eventsHTML += `
                <li style="margin-bottom: 8px; padding: 8px; background: #e8f5e8; border-radius: 5px;">
                    <i class="fas fa-user-plus" style="margin-left: 8px; color: var(--success);"></i>
                    ${member.fullName || member.name} - ${member.phone}
                </li>
            `;
        });
        if (newMembers.length > 5) {
            eventsHTML += `<li style="color: var(--text-light);">و ${newMembers.length - 5} عضو آخر...</li>`;
        }
        eventsHTML += '</ul>';
    }
    
    if (expiringMembers.length > 0) {
        eventsHTML += `<h5>الاشتراكات المنتهية (${expiringMembers.length})</h5><ul style="list-style: none; padding: 0;">`;
        expiringMembers.slice(0, 5).forEach(member => {
            eventsHTML += `
                <li style="margin-bottom: 8px; padding: 8px; background: #fff3e0; border-radius: 5px;">
                    <i class="fas fa-clock" style="margin-left: 8px; color: var(--warning);"></i>
                    ${member.fullName || member.name} - ${member.phone}
                </li>
            `;
        });
        if (expiringMembers.length > 5) {
            eventsHTML += `<li style="color: var(--text-light);">و ${expiringMembers.length - 5} اشتراك آخر...</li>`;
        }
        eventsHTML += '</ul>';
    }
    
    showModal('أحداث اليوم', eventsHTML);
}

// ========================
// الإشعارات
// ========================
function toggleNotifications() {
    const panel = document.querySelector('.notifications-panel');
    panel.classList.toggle('active');
    
    if (panel.classList.contains('active')) {
        loadNotifications();
    }
}

function loadNotifications() {
    if (typeof membersModule === 'undefined') return;
    
    try {
        const notifications = membersModule.getNotifications();
        const container = document.getElementById('notificationsList');
        
        if (!container) return;
        
        if (notifications.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 20px; color: var(--text-light);">
                    <i class="fas fa-bell-slash" style="font-size: 32px; margin-bottom: 10px;"></i>
                    <p>لا توجد إشعارات</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        notifications.slice(0, 10).forEach(notification => {
            const icon = getNotificationIcon(notification.type);
            const timeAgo = getTimeAgo(new Date(notification.timestamp));
            const unreadClass = notification.read ? '' : 'unread';
            
            html += `
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
        
        container.innerHTML = html;
        
        const notificationItems = document.querySelectorAll('.notification-item');
        notificationItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const notificationId = parseInt(item.getAttribute('data-id'));
                membersModule.markNotificationAsRead(notificationId);
                updateNotificationBadge();
            });
        });
    } catch (error) {
        console.error('خطأ في تحميل الإشعارات:', error);
    }
}

function updateNotificationBadge() {
    const badge = document.getElementById('notificationCount');
    if (badge && typeof membersModule !== 'undefined') {
        const unreadCount = membersModule.getUnreadNotificationsCount();
        badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
}

function markAllNotificationsAsRead() {
    if (typeof membersModule !== 'undefined') {
        membersModule.markAllNotificationsAsRead();
        updateNotificationBadge();
        loadNotifications();
        showAlert('نجاح', 'تم تحديد جميع الإشعارات كمقروءة', 'success');
    }
}

// ========================
// المودالات
// ========================
function closeModal() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.style.display = 'none';
    });
}

function showModal(title, content) {
    const modalHTML = `
        <div class="modal-overlay" style="display: flex;">
            <div class="modal" style="max-width: 600px;">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="close-modal" onclick="closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        </div>
    `;
    
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
}

// ========================
// إدارة الخروج
// ========================
function logoutUser() {
    console.log("Opening logout confirmation modal...");
    document.getElementById('logoutConfirmModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeLogoutModal() {
    document.getElementById('logoutConfirmModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function confirmLogout() {
    console.log("Confirming logout...");
    closeLogoutModal();
    
    document.getElementById('logoutModal').style.display = 'flex';
    
    setTimeout(() => {
        logoutSafely();
    }, 1000);
}

function logoutSafely() {
    console.log("Executing safe logout...");
    
    try {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('lastLogin');
        
        sessionStorage.clear();
        
        document.getElementById('logoutModal').style.display = 'none';
        
        showAlert('تم تسجيل الخروج', 'تم تسجيل الخروج بنجاح، سيتم توجيهك إلى صفحة الدخول...', 'success');
        
        setTimeout(() => {
            console.log("Redirecting to login page...");
            window.location.href = '../index.html';
        }, 2000);
        
    } catch (e) {
        console.error('خطأ في تسجيل الخروج:', e);
        document.getElementById('logoutModal').style.display = 'none';
        showAlert('خطأ', 'حدث خطأ أثناء تسجيل الخروج', 'error');
    }
}

// ========================
// دوال مساعدة
// ========================
function updateElementText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;
    }
}

function formatDate(dateString) {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG');
}

function getTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) {
        return `قبل ${minutes} دقيقة`;
    } else if (hours < 24) {
        return `قبل ${hours} ساعة`;
    } else {
        return `قبل ${days} يوم`;
    }
}

function getNotificationIcon(type) {
    const icons = {
        'new_member': 'fa-user-plus',
        'renewal': 'fa-sync-alt',
        'payment': 'fa-credit-card',
        'expiring': 'fa-clock',
        'expired': 'fa-exclamation-triangle'
    };
    return icons[type] || 'fa-bell';
}

function showAlert(title, message, type = 'info') {
    const icon = type === 'success' ? 'fa-check-circle' : 
                type === 'error' ? 'fa-exclamation-circle' : 
                type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';
    
    const oldAlerts = document.querySelectorAll('.custom-alert');
    oldAlerts.forEach(alert => alert.remove());
    
    const alertHTML = `
        <div class="custom-alert ${type}" style="position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 10000; background: white; padding: 15px 20px; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.2); display: flex; align-items: center; min-width: 300px; max-width: 500px;">
            <i class="fas ${icon}" style="font-size: 24px; margin-left: 15px; color: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#2196f3'}"></i>
            <div>
                <h4 style="margin: 0 0 5px 0; color: #333;">${title}</h4>
                <p style="margin: 0; color: #666; font-size: 14px;">${message}</p>
            </div>
        </div>
    `;
    
    const alertContainer = document.createElement('div');
    alertContainer.innerHTML = alertHTML;
    document.body.appendChild(alertContainer);
    
    setTimeout(() => {
        if (alertContainer.parentNode) {
            document.body.removeChild(alertContainer);
        }
    }, 5000);
}

function showActivityDetails(activityId) {
    showAlert('معلومات', 'تفاصيل النشاط ستظهر هنا', 'info');
}

// ========================
// تصدير الدوال للنافذة العالمية
// ========================
window.showTab = showTab;
window.quickAddMember = quickAddMember;
window.selectMemberForRenewal = selectMemberForRenewal;
window.renewMember = renewMember;
window.viewMemberDetails = viewMemberDetails;
window.filterMembers = filterMembers;
window.toggleNotifications = toggleNotifications;
window.markAllNotificationsAsRead = markAllNotificationsAsRead;
window.showToday = showToday;
window.changeMonth = changeMonth;
window.showDayEvents = showDayEvents;
window.logoutUser = logoutUser;
window.closeLogoutModal = closeLogoutModal;
window.confirmLogout = confirmLogout;

// ========================
// تهيئة النظام عند تحميل الصفحة
// ========================
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 صفحة المساعد جاهزة للتهيئة');
    
    setTimeout(() => {
        initAssistantDashboard();
    }, 300);
});