// نظام عرض التفاصيل للمتفرج
const ViewerDetailsSystem = {
    currentView: null, // 'total', 'male', 'female', 'new-members'
    selectedMemberId: null,
    
    // تهيئة النظام
    init: function() {
        console.log('تهيئة نظام تفاصيل المتفرج...');
        this.setupEventListeners();
    },
    
    // إعداد مستمعي الأحداث
    setupEventListeners: function() {
        // إغلاق التفاصيل عند النقر على الزر X
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-details-btn') || 
                e.target.closest('.close-details-btn')) {
                this.closeAllDetails();
            }
            
            // إغلاق عند النقر خارج المحتوى
            if (e.target.classList.contains('details-overlay')) {
                this.closeAllDetails();
            }
            
            // زر الرجوع من تفاصيل العضو
            if (e.target.classList.contains('back-to-list-btn')) {
                this.showMembersList(this.currentView);
            }
        });
        
        // إغلاق عند الضغط على ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllDetails();
            }
        });
    },
    
    // عرض تفاصيل إجمالي المشتركين
    showTotalDetails: function() {
        if (typeof membersModule === 'undefined') return;
        
        const stats = membersModule.calculateStats();
        const allMembers = membersModule.getAllMembers();
        this.currentView = 'total';
        
        const detailsHTML = `
            <div class="details-overlay active" id="totalDetailsOverlay">
                <div class="details-container" style="max-width: 1400px;">
                    <!-- الهيدر -->
                    <div class="details-header">
                        <button class="close-details-btn">
                            <i class="fas fa-times"></i>
                        </button>
                        <h1>
                            <i class="fas fa-users"></i>
                            تفاصيل إجمالي المشتركين
                        </h1>
                        <div class="header-info">
                            <span><i class="far fa-clock"></i> آخر تحديث: الآن</span>
                            <span><i class="fas fa-chart-bar"></i> إجمالي: ${stats.totalMembers} مشترك</span>
                        </div>
                    </div>
                    
                    <!-- الإحصائيات السريعة -->
                    <div class="quick-stats-grid">
                        <div class="quick-stat-card">
                            <div class="quick-stat-icon" style="background: rgba(76, 175, 80, 0.1);">
                                <i class="fas fa-user-check" style="color: #4caf50;"></i>
                            </div>
                            <div class="quick-stat-content">
                                <div class="quick-stat-value">${stats.activeMembers}</div>
                                <div class="quick-stat-label">نشطين</div>
                            </div>
                            <div class="quick-stat-percentage">
                                ${((stats.activeMembers / stats.totalMembers) * 100).toFixed(1)}%
                            </div>
                        </div>
                        
                        <div class="quick-stat-card">
                            <div class="quick-stat-icon" style="background: rgba(255, 152, 0, 0.1);">
                                <i class="fas fa-clock" style="color: #ff9800;"></i>
                            </div>
                            <div class="quick-stat-content">
                                <div class="quick-stat-value">${stats.expiringMembers}</div>
                                <div class="quick-stat-label">قريب الانتهاء</div>
                            </div>
                            <div class="quick-stat-percentage">
                                ${((stats.expiringMembers / stats.totalMembers) * 100).toFixed(1)}%
                            </div>
                        </div>
                        
                        <div class="quick-stat-card">
                            <div class="quick-stat-icon" style="background: rgba(244, 67, 54, 0.1);">
                                <i class="fas fa-exclamation-triangle" style="color: #f44336;"></i>
                            </div>
                            <div class="quick-stat-content">
                                <div class="quick-stat-value">${stats.expiredMembers}</div>
                                <div class="quick-stat-label">منتهية</div>
                            </div>
                            <div class="quick-stat-percentage">
                                ${((stats.expiredMembers / stats.totalMembers) * 100).toFixed(1)}%
                            </div>
                        </div>
                        
                        <div class="quick-stat-card">
                            <div class="quick-stat-icon" style="background: rgba(33, 150, 243, 0.1);">
                                <i class="fas fa-venus-mars" style="color: #2196f3;"></i>
                            </div>
                            <div class="quick-stat-content">
                                <div class="quick-stat-value">${stats.maleMembers} / ${stats.femaleMembers}</div>
                                <div class="quick-stat-label">رجال / نساء</div>
                            </div>
                            <div class="quick-stat-percentage">
                                ${stats.maleMembers > 0 ? ((stats.maleMembers / stats.totalMembers) * 100).toFixed(1) : 0}% / 
                                ${stats.femaleMembers > 0 ? ((stats.femaleMembers / stats.totalMembers) * 100).toFixed(1) : 0}%
                            </div>
                        </div>
                    </div>
                    
                    <!-- قسم البحث والتصفية -->
                    <div class="search-filter-section">
                        <div class="search-box">
                            <input type="text" id="searchAllMembers" placeholder="ابحث عن عضو بالاسم أو الكود..." 
                                   onkeyup="ViewerDetailsSystem.searchAllMembers(this.value)">
                            <i class="fas fa-search"></i>
                        </div>
                        <div class="filter-buttons">
                            <button class="filter-btn active" onclick="ViewerDetailsSystem.filterAllMembers('all')">
                                الكل
                            </button>
                            <button class="filter-btn" onclick="ViewerDetailsSystem.filterAllMembers('active')">
                                النشطين
                            </button>
                            <button class="filter-btn" onclick="ViewerDetailsSystem.filterAllMembers('expiring')">
                                قريب الانتهاء
                            </button>
                            <button class="filter-btn" onclick="ViewerDetailsSystem.filterAllMembers('expired')">
                                المنتهية
                            </button>
                        </div>
                    </div>
                    
                    <!-- قائمة الأعضاء -->
                    <div class="members-list-section">
                        <div class="section-header">
                            <h3>
                                <i class="fas fa-list"></i>
                                قائمة جميع المشتركين (${allMembers.length})
                            </h3>
                            <div class="section-actions">
                                <button class="btn btn-sm btn-secondary" onclick="ViewerDetailsSystem.printAllMembers()">
                                    <i class="fas fa-print"></i> طباعة
                                </button>
                                <button class="btn btn-sm btn-secondary" onclick="ViewerDetailsSystem.exportAllMembers()">
                                    <i class="fas fa-download"></i> تصدير
                                </button>
                            </div>
                        </div>
                        
                        <div class="members-grid" id="allMembersGrid">
                            ${this.generateMembersGrid(allMembers)}
                        </div>
                        
                        ${allMembers.length === 0 ? `
                            <div class="empty-state">
                                <i class="fas fa-users-slash"></i>
                                <h4>لا توجد أعضاء</h4>
                                <p>لم يتم إضافة أي أعضاء بعد</p>
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- الرسومات البيانية -->
                    <div class="charts-section">
                        <div class="chart-container">
                            <h4><i class="fas fa-chart-pie"></i> توزيع الجنس</h4>
                            <div class="chart-placeholder" id="genderChart">
                                <!-- سيتم إضافة الرسم البياني هنا -->
                                <div class="simple-chart">
                                    <div class="simple-chart-male" style="width: ${(stats.maleMembers / stats.totalMembers) * 100}%">
                                        رجال (${stats.maleMembers})
                                    </div>
                                    <div class="simple-chart-female" style="width: ${(stats.femaleMembers / stats.totalMembers) * 100}%">
                                        نساء (${stats.femaleMembers})
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="chart-container">
                            <h4><i class="fas fa-chart-bar"></i> حالة الاشتراكات</h4>
                            <div class="chart-placeholder" id="statusChart">
                                <div class="simple-chart">
                                    <div class="simple-chart-active" style="width: ${(stats.activeMembers / stats.totalMembers) * 100}%">
                                        نشط (${stats.activeMembers})
                                    </div>
                                    <div class="simple-chart-expiring" style="width: ${(stats.expiringMembers / stats.totalMembers) * 100}%">
                                        قريب الانتهاء (${stats.expiringMembers})
                                    </div>
                                    <div class="simple-chart-expired" style="width: ${(stats.expiredMembers / stats.totalMembers) * 100}%">
                                        منتهي (${stats.expiredMembers})
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- الفوتر -->
                    <div class="details-footer">
                        <div class="footer-info">
                            <span><i class="fas fa-info-circle"></i> تقرير المشاهدة فقط</span>
                            <span><i class="far fa-user"></i> المستخدم: متفرج</span>
                            <span><i class="far fa-clock"></i> تم التحميل: ${new Date().toLocaleTimeString('ar-EG')}</span>
                        </div>
                        <button class="btn btn-primary" onclick="ViewerDetailsSystem.closeAllDetails()">
                            <i class="fas fa-check"></i> تمت المشاهدة
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', detailsHTML);
        this.initializeDetailsPage();
    },
    
    // إنشاء شبكة الأعضاء
    generateMembersGrid: function(members) {
        return members.map(member => `
            <div class="member-card" data-id="${member.id}" onclick="ViewerDetailsSystem.showMemberDetails('${member.id}')">
                <div class="member-avatar">
                    ${member.gender === 'male' ? 
                        `<i class="fas fa-male"></i>` : 
                        `<i class="fas fa-female"></i>`}
                </div>
                <div class="member-info">
                    <div class="member-name">${member.fullName}</div>
                    <div class="member-id">كود: ${member.id}</div>
                    <div class="member-package">${member.packageName}</div>
                    <div class="member-status">
                        <span class="status-badge ${member.status}">
                            ${member.status === 'active' ? 'نشط' : 
                              member.status === 'expiring' ? 'قريب الانتهاء' : 'منتهي'}
                        </span>
                    </div>
                </div>
                <div class="member-meta">
                    <div class="member-age">${member.age} سنة</div>
                    <div class="member-end-date">ينتهي: ${member.endDate}</div>
                </div>
                <div class="member-action">
                    <i class="fas fa-eye"></i>
                    <span>عرض التفاصيل</span>
                </div>
            </div>
        `).join('');
    },
    
    // عرض تفاصيل الرجال
    showMaleDetails: function() {
        if (typeof membersModule === 'undefined') return;
        
        const stats = membersModule.calculateStats();
        const maleMembers = membersModule.getMembersByGender('male');
        this.currentView = 'male';
        
        const detailsHTML = `
            <div class="details-overlay active" id="maleDetailsOverlay">
                <div class="details-container">
                    <!-- الهيدر -->
                    <div class="details-header" style="background: linear-gradient(135deg, #2196f3, #1976d2);">
                        <button class="close-details-btn">
                            <i class="fas fa-times"></i>
                        </button>
                        <h1>
                            <i class="fas fa-male"></i>
                            تفاصيل المشتركين الرجال
                        </h1>
                        <div class="header-info">
                            <span><i class="fas fa-users"></i> عدد الرجال: ${stats.maleMembers}</span>
                            <span><i class="fas fa-percentage"></i> النسبة: ${((stats.maleMembers / stats.totalMembers) * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                    
                    <!-- قائمة الرجال -->
                    <div class="members-list-section">
                        <div class="section-header">
                            <h3><i class="fas fa-list"></i> قائمة المشتركين الرجال</h3>
                            <div class="search-box">
                                <input type="text" id="searchMaleMembers" placeholder="ابحث عن عضو..." 
                                       onkeyup="ViewerDetailsSystem.searchMembers('male', this.value)">
                                <i class="fas fa-search"></i>
                            </div>
                        </div>
                        
                        <div class="members-table-container">
                            <table class="members-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>الكود</th>
                                        <th>الاسم</th>
                                        <th>العمر</th>
                                        <th>الباقة</th>
                                        <th>تاريخ الانتهاء</th>
                                        <th>الحالة</th>
                                        <th>الإجراء</th>
                                    </tr>
                                </thead>
                                <tbody id="maleMembersTable">
                                    ${maleMembers.map((member, index) => `
                                        <tr onclick="ViewerDetailsSystem.showMemberDetails('${member.id}')" 
                                            style="cursor: pointer;">
                                            <td>${index + 1}</td>
                                            <td>${member.id}</td>
                                            <td>
                                                <div class="member-name-with-avatar">
                                                    <div class="table-avatar">
                                                        <i class="fas fa-male"></i>
                                                    </div>
                                                    ${member.fullName}
                                                </div>
                                            </td>
                                            <td>${member.age}</td>
                                            <td>${member.packageName}</td>
                                            <td>${member.endDate}</td>
                                            <td>
                                                <span class="status-badge ${member.status}">
                                                    ${member.status === 'active' ? 'نشط' : 
                                                      member.status === 'expiring' ? 'قريب الانتهاء' : 'منتهي'}
                                                </span>
                                            </td>
                                            <td>
                                                <button class="btn-view-member" onclick="event.stopPropagation(); ViewerDetailsSystem.showMemberDetails('${member.id}')">
                                                    <i class="fas fa-eye"></i> عرض
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                        
                        ${maleMembers.length === 0 ? `
                            <div class="empty-state">
                                <i class="fas fa-male" style="font-size: 64px;"></i>
                                <h4>لا توجد بيانات للمشتركين الرجال</h4>
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- إحصائيات إضافية -->
                    <div class="additional-stats">
                        <div class="stat-box">
                            <h4><i class="fas fa-calculator"></i> إحصائيات</h4>
                            <div class="stats-grid">
                                <div class="stat-item">
                                    <div class="stat-label">متوسط العمر</div>
                                    <div class="stat-value">
                                        ${maleMembers.length > 0 ? 
                                            (maleMembers.reduce((sum, m) => sum + parseInt(m.age), 0) / maleMembers.length).toFixed(1) : 0
                                        } سنة
                                    </div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">أصغر مشترك</div>
                                    <div class="stat-value">
                                        ${maleMembers.length > 0 ? 
                                            Math.min(...maleMembers.map(m => parseInt(m.age))) : 0
                                        } سنة
                                    </div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">أكبر مشترك</div>
                                    <div class="stat-value">
                                        ${maleMembers.length > 0 ? 
                                            Math.max(...maleMembers.map(m => parseInt(m.age))) : 0
                                        } سنة
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', detailsHTML);
    },
    
    // عرض تفاصيل النساء
    showFemaleDetails: function() {
        if (typeof membersModule === 'undefined') return;
        
        const stats = membersModule.calculateStats();
        const femaleMembers = membersModule.getMembersByGender('female');
        this.currentView = 'female';
        
        const detailsHTML = `
            <div class="details-overlay active" id="femaleDetailsOverlay">
                <div class="details-container">
                    <div class="details-header" style="background: linear-gradient(135deg, #e91e63, #c2185b);">
                        <button class="close-details-btn">
                            <i class="fas fa-times"></i>
                        </button>
                        <h1>
                            <i class="fas fa-female"></i>
                            تفاصيل المشتركين النساء
                        </h1>
                        <div class="header-info">
                            <span><i class="fas fa-users"></i> عدد النساء: ${stats.femaleMembers}</span>
                            <span><i class="fas fa-percentage"></i> النسبة: ${((stats.femaleMembers / stats.totalMembers) * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                    
                    <!-- نفس هيكل الرجال مع تغيير البيانات -->
                    <div class="members-list-section">
                        <div class="section-header">
                            <h3><i class="fas fa-list"></i> قائمة المشتركين النساء</h3>
                            <div class="search-box">
                                <input type="text" id="searchFemaleMembers" placeholder="ابحث عن عضوة..." 
                                       onkeyup="ViewerDetailsSystem.searchMembers('female', this.value)">
                                <i class="fas fa-search"></i>
                            </div>
                        </div>
                        
                        <div class="members-table-container">
                            <table class="members-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>الكود</th>
                                        <th>الاسم</th>
                                        <th>العمر</th>
                                        <th>الباقة</th>
                                        <th>تاريخ الانتهاء</th>
                                        <th>الحالة</th>
                                        <th>الإجراء</th>
                                    </tr>
                                </thead>
                                <tbody id="femaleMembersTable">
                                    ${femaleMembers.map((member, index) => `
                                        <tr onclick="ViewerDetailsSystem.showMemberDetails('${member.id}')" 
                                            style="cursor: pointer;">
                                            <td>${index + 1}</td>
                                            <td>${member.id}</td>
                                            <td>
                                                <div class="member-name-with-avatar">
                                                    <div class="table-avatar" style="background: #fce4ec;">
                                                        <i class="fas fa-female" style="color: #e91e63;"></i>
                                                    </div>
                                                    ${member.fullName}
                                                </div>
                                            </td>
                                            <td>${member.age}</td>
                                            <td>${member.packageName}</td>
                                            <td>${member.endDate}</td>
                                            <td>
                                                <span class="status-badge ${member.status}">
                                                    ${member.status === 'active' ? 'نشطة' : 
                                                      member.status === 'expiring' ? 'قريبة الانتهاء' : 'منتهية'}
                                                </span>
                                            </td>
                                            <td>
                                                <button class="btn-view-member" onclick="event.stopPropagation(); ViewerDetailsSystem.showMemberDetails('${member.id}')">
                                                    <i class="fas fa-eye"></i> عرض
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', detailsHTML);
    },
    
    // عرض تفاصيل الأعضاء الجدد
    showNewMembersDetails: function() {
        if (typeof membersModule === 'undefined') return;
        
        const newMembers = membersModule.getNewMembersThisMonth();
        const revenue = membersModule.getNewMembersRevenue();
        const currentMonth = new Date().toLocaleDateString('ar-EG', {
            month: 'long',
            year: 'numeric'
        });
        
        this.currentView = 'new-members';
        
        const detailsHTML = `
            <div class="details-overlay active" id="newMembersDetailsOverlay">
                <div class="details-container">
                    <div class="details-header" style="background: linear-gradient(135deg, #4caf50, #388e3c);">
                        <button class="close-details-btn">
                            <i class="fas fa-times"></i>
                        </button>
                        <h1>
                            <i class="fas fa-user-plus"></i>
                            الأعضاء الجدد - ${currentMonth}
                        </h1>
                        <div class="header-info">
                            <span><i class="fas fa-users"></i> العدد: ${newMembers.length}</span>
                            <span><i class="fas fa-money-bill-wave"></i> الإيرادات: ${revenue} ج.م</span>
                            <span><i class="fas fa-chart-line"></i> المتوسط: ${newMembers.length > 0 ? (revenue / newMembers.length).toFixed(0) : 0} ج.م</span>
                        </div>
                    </div>
                    
                    <!-- قائمة الأعضاء الجدد -->
                    <div class="members-list-section">
                        <div class="section-header">
                            <h3><i class="fas fa-calendar-alt"></i> الأعضاء الجدد هذا الشهر</h3>
                        </div>
                        
                        <div class="new-members-grid">
                            ${newMembers.map(member => `
                                <div class="new-member-card" onclick="ViewerDetailsSystem.showMemberDetails('${member.id}')">
                                    <div class="new-member-badge">جديد</div>
                                    <div class="new-member-avatar">
                                        ${member.gender === 'male' ? 
                                            `<i class="fas fa-male"></i>` : 
                                            `<i class="fas fa-female"></i>`}
                                    </div>
                                    <div class="new-member-info">
                                        <div class="new-member-name">${member.fullName}</div>
                                        <div class="new-member-date">
                                            <i class="far fa-calendar-alt"></i>
                                            ${member.addedDate || member.startDate}
                                        </div>
                                        <div class="new-member-package">
                                            <i class="fas fa-box"></i>
                                            ${member.packageName}
                                        </div>
                                    </div>
                                    <div class="new-member-price">
                                        ${member.packagePrice} ج.م
                                    </div>
                                </div>
                            `).join('')}
                            
                            ${newMembers.length === 0 ? `
                                <div class="empty-state">
                                    <i class="fas fa-user-plus" style="font-size: 64px;"></i>
                                    <h4>لا توجد أعضاء جدد هذا الشهر</h4>
                                    <p>لم يتم إضافة أي أعضاء خلال شهر ${currentMonth}</p>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', detailsHTML);
    },
    
    // عرض تفاصيل عضو معين
    showMemberDetails: function(memberId) {
        if (typeof membersModule === 'undefined') return;
        
        const member = membersModule.getMemberById(memberId);
        if (!member) {
            alert('العضو غير موجود');
            return;
        }
        
        this.selectedMemberId = memberId;
        
        const memberDetailsHTML = `
            <div class="member-details-overlay active" id="memberDetailsOverlay">
                <div class="member-details-container">
                    <!-- هيدر تفاصيل العضو -->
                    <div class="member-details-header">
                        <button class="back-to-list-btn">
                            <i class="fas fa-arrow-right"></i>
                            رجوع للقائمة
                        </button>
                        <h1>
                            <i class="fas fa-user-circle"></i>
                            تفاصيل العضو
                        </h1>
                        <button class="close-details-btn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <!-- معلومات العضو الرئيسية -->
                    <div class="member-profile-section">
                        <div class="member-avatar-large">
                            ${member.gender === 'male' ? 
                                `<i class="fas fa-male"></i>` : 
                                `<i class="fas fa-female"></i>`}
                        </div>
                        <div class="member-profile-info">
                            <h2>${member.fullName}</h2>
                            <div class="member-id-badge">كود: ${member.id}</div>
                            <div class="member-status-large ${member.status}">
                                ${member.status === 'active' ? 'نشط' : 
                                  member.status === 'expiring' ? 'قريب الانتهاء' : 'منتهي'}
                            </div>
                        </div>
                    </div>
                    
                    <!-- تفاصيل العضو في بطاقات -->
                    <div class="member-details-grid">
                        <!-- المعلومات الشخصية -->
                        <div class="detail-card">
                            <div class="detail-card-header">
                                <i class="fas fa-user"></i>
                                <h3>المعلومات الشخصية</h3>
                            </div>
                            <div class="detail-card-body">
                                <div class="detail-item">
                                    <span class="detail-label">الاسم الكامل:</span>
                                    <span class="detail-value">${member.fullName}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">العمر:</span>
                                    <span class="detail-value">${member.age} سنة</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">الجنس:</span>
                                    <span class="detail-value">
                                        ${member.gender === 'male' ? 
                                            '<span style="color: #2196f3;"><i class="fas fa-male"></i> ذكر</span>' : 
                                            '<span style="color: #e91e63;"><i class="fas fa-female"></i> أنثى</span>'}
                                    </span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">رقم الهاتف:</span>
                                    <span class="detail-value">${member.phone}</span>
                                </div>
                                ${member.email ? `
                                    <div class="detail-item">
                                        <span class="detail-label">البريد الإلكتروني:</span>
                                        <span class="detail-value">${member.email}</span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        
                        <!-- معلومات الاشتراك -->
                        <div class="detail-card">
                            <div class="detail-card-header">
                                <i class="fas fa-dumbbell"></i>
                                <h3>معلومات الاشتراك</h3>
                            </div>
                            <div class="detail-card-body">
                                <div class="detail-item">
                                    <span class="detail-label">الباقة:</span>
                                    <span class="detail-value">${member.packageName}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">سعر الباقة:</span>
                                    <span class="detail-value" style="color: var(--success); font-weight: bold;">
                                        ${member.packagePrice} ج.م
                                    </span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">مدة الباقة:</span>
                                    <span class="detail-value">${member.packageDuration} يوم</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">تاريخ البدء:</span>
                                    <span class="detail-value">${member.startDate}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">تاريخ الانتهاء:</span>
                                    <span class="detail-value">${member.endDate}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">طريقة الدفع:</span>
                                    <span class="detail-value">
                                        ${member.paymentMethod === 'cash' ? 'كاش' : 
                                          member.paymentMethod === 'vodafone_cash' ? 'فودافون كاش' : 'انستا باي'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- التاريخ والإحصائيات -->
                        <div class="detail-card">
                            <div class="detail-card-header">
                                <i class="fas fa-history"></i>
                                <h3>التاريخ والإحصائيات</h3>
                            </div>
                            <div class="detail-card-body">
                                <div class="detail-item">
                                    <span class="detail-label">تاريخ الإضافة:</span>
                                    <span class="detail-value">${member.addedDate || 'غير معروف'}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">تم الإضافة بواسطة:</span>
                                    <span class="detail-value">${member.addedBy || 'غير معروف'}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">عدد مرات التجديد:</span>
                                    <span class="detail-value">${member.renewalCount || 0} مرة</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">آخر تجديد:</span>
                                    <span class="detail-value">${member.lastRenewalDate || 'لم يتم التجديد'}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">إجمالي المدفوع:</span>
                                    <span class="detail-value" style="color: var(--success); font-weight: bold;">
                                        ${member.totalPaid || member.packagePrice} ج.م
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- ملاحظات -->
                        ${member.notes ? `
                            <div class="detail-card full-width">
                                <div class="detail-card-header">
                                    <i class="fas fa-sticky-note"></i>
                                    <h3>ملاحظات</h3>
                                </div>
                                <div class="detail-card-body">
                                    <div class="notes-content">
                                        ${member.notes}
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- رسالة للمتفرج -->
                    <div class="viewer-notice">
                        <i class="fas fa-eye"></i>
                        <span>ملاحظة: هذه الصفحة للمشاهدة فقط. لا يمكنك تعديل بيانات العضو.</span>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', memberDetailsHTML);
    },
    
    // البحث في الأعضاء
    searchAllMembers: function(query) {
        const membersGrid = document.getElementById('allMembersGrid');
        if (!membersGrid) return;
        
        const allMembers = membersModule.getAllMembers();
        const searchTerm = query.toLowerCase();
        
        const filteredMembers = allMembers.filter(member => {
            return (
                member.id.toLowerCase().includes(searchTerm) ||
                member.fullName.toLowerCase().includes(searchTerm) ||
                member.phone.includes(searchTerm)
            );
        });
        
        membersGrid.innerHTML = this.generateMembersGrid(filteredMembers);
    },
    
    // تصفية الأعضاء
    filterAllMembers: function(filterType) {
        const allMembers = membersModule.getAllMembers();
        let filteredMembers = allMembers;
        
        if (filterType === 'active') {
            filteredMembers = allMembers.filter(m => m.status === 'active');
        } else if (filterType === 'expiring') {
            filteredMembers = allMembers.filter(m => m.status === 'expiring');
        } else if (filterType === 'expired') {
            filteredMembers = allMembers.filter(m => m.status === 'expired');
        }
        
        const membersGrid = document.getElementById('allMembersGrid');
        if (membersGrid) {
            membersGrid.innerHTML = this.generateMembersGrid(filteredMembers);
        }
        
        // تحديث أزرار التصفية النشطة
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
    },
    
    // إغلاق كل نوافذ التفاصيل
    closeAllDetails: function() {
        // إغلاق تفاصيل العضو أولاً
        const memberOverlay = document.querySelector('.member-details-overlay');
        if (memberOverlay) {
            memberOverlay.remove();
        }
        
        // إغلاق تفاصيل القائمة
        const detailsOverlays = document.querySelectorAll('.details-overlay');
        detailsOverlays.forEach(overlay => {
            overlay.remove();
        });
        
        this.currentView = null;
        this.selectedMemberId = null;
    },
    
    // الرجوع للقائمة
    showMembersList: function(viewType) {
        // إغلاق تفاصيل العضو
        const memberOverlay = document.querySelector('.member-details-overlay');
        if (memberOverlay) {
            memberOverlay.remove();
        }
        
        // إعادة عرض القائمة بناءً على النوع
        if (viewType === 'total') {
            this.showTotalDetails();
        } else if (viewType === 'male') {
            this.showMaleDetails();
        } else if (viewType === 'female') {
            this.showFemaleDetails();
        } else if (viewType === 'new-members') {
            this.showNewMembersDetails();
        }
    },
    
    // تهيئة الصفحة بعد إنشائها
    initializeDetailsPage: function() {
        // إضافة مستمعات للأزرار الداخلية
        setTimeout(() => {
            // مستمعات البحث
            const searchInput = document.getElementById('searchAllMembers');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.searchAllMembers(e.target.value);
                });
            }
        }, 100);
    },
    
    // طباعة قائمة الأعضاء
    printAllMembers: function() {
        const allMembers = membersModule.getAllMembers();
        const stats = membersModule.calculateStats();
        
        const printContent = `
            <div style="padding: 20px; font-family: Arial, sans-serif;">
                <h1 style="text-align: center; color: #333;">قائمة جميع المشتركين</h1>
                <div style="margin: 20px 0; text-align: center;">
                    <div>الإجمالي: ${stats.totalMembers} مشترك</div>
                    <div>التاريخ: ${new Date().toLocaleDateString('ar-EG')}</div>
                </div>
                <table border="1" style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f5f5f5;">
                            <th style="padding: 10px;">#</th>
                            <th style="padding: 10px;">الكود</th>
                            <th style="padding: 10px;">الاسم</th>
                            <th style="padding: 10px;">الجنس</th>
                            <th style="padding: 10px;">الباقة</th>
                            <th style="padding: 10px;">الحالة</th>
                            <th style="padding: 10px;">تاريخ الانتهاء</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${allMembers.map((member, index) => `
                            <tr>
                                <td style="padding: 8px;">${index + 1}</td>
                                <td style="padding: 8px;">${member.id}</td>
                                <td style="padding: 8px;">${member.fullName}</td>
                                <td style="padding: 8px;">${member.gender === 'male' ? 'ذكر' : 'أنثى'}</td>
                                <td style="padding: 8px;">${member.packageName}</td>
                                <td style="padding: 8px;">
                                    ${member.status === 'active' ? 'نشط' : 
                                      member.status === 'expiring' ? 'قريب الانتهاء' : 'منتهي'}
                                </td>
                                <td style="padding: 8px;">${member.endDate}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html dir="rtl">
            <head>
                <title>طباعة قائمة المشتركين</title>
                <style>
                    @media print {
                        body { margin: 0; }
                    }
                </style>
            </head>
            <body>${printContent}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    },
    
    // تصدير قائمة الأعضاء
    exportAllMembers: function() {
        const allMembers = membersModule.getAllMembers();
        
        // إنشاء CSV
        let csv = 'الكود,الاسم,الجنس,العمر,الباقة,السعر,تاريخ البدء,تاريخ الانتهاء,الحالة,الهاتف\n';
        
        allMembers.forEach(member => {
            csv += `${member.id},${member.fullName},${member.gender === 'male' ? 'ذكر' : 'أنثى'},${member.age},${member.packageName},${member.packagePrice},${member.startDate},${member.endDate},${member.status === 'active' ? 'نشط' : member.status === 'expiring' ? 'قريب الانتهاء' : 'منتهي'},${member.phone}\n`;
        });
        
        // تحميل الملف
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `جميع_المشتركين_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

// تصدير الدوال للاستخدام في HTML
window.showTotalDetails = function() {
    ViewerDetailsSystem.showTotalDetails();
};

window.showMaleDetails = function() {
    ViewerDetailsSystem.showMaleDetails();
};

window.showFemaleDetails = function() {
    ViewerDetailsSystem.showFemaleDetails();
};

window.showNewMembersDetails = function() {
    ViewerDetailsSystem.showNewMembersDetails();
};

// تهيئة النظام
document.addEventListener('DOMContentLoaded', function() {
    ViewerDetailsSystem.init();
});