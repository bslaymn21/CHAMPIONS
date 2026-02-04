// ملف بيانات الأعضاء والاشتراكات
const members = {
    // بيانات افتراضية للأعضاء
    defaultMembers: [
        {
            id: "123456",
            firstName: "أحمد",
            lastName: "محمد",
            fullName: "أحمد محمد",
            age: 28,
            gender: "male",
            phone: "01012345678",
            email: "ahmed@example.com",
            packageId: 1,
            packageName: "باقة الذهبية",
            packagePrice: 500,
            packageDuration: 30,
            startDate: "2024-01-01",
            endDate: "2024-01-31",
            paymentMethod: "cash",
            status: "active",
            addedBy: "admin",
            addedDate: "2024-01-01",
            notes: "",
            totalPaid: 500,
            renewalCount: 0,
            lastRenewalDate: null
        },
        {
            id: "234567",
            firstName: "سارة",
            lastName: "علي",
            fullName: "سارة علي",
            age: 25,
            gender: "female",
            phone: "01087654321",
            email: "sara@example.com",
            packageId: 2,
            packageName: "باقة الفضية",
            packagePrice: 350,
            packageDuration: 30,
            startDate: "2024-01-10",
            endDate: "2024-02-09",
            paymentMethod: "vodafone_cash",
            status: "active",
            addedBy: "assistant1",
            addedDate: "2024-01-10",
            notes: "",
            totalPaid: 350,
            renewalCount: 0,
            lastRenewalDate: null
        }
    ],

    // بيانات الباقات
    defaultPackages: [
        {
            id: 1,
            name: "باقة الذهبية",
            price: 500,
            duration: 30,
            features: [
                "وصول غير محدود",
                "تدريب شخصي",
                "ساونا وجاكوزي",
                "مشروبات مجانية"
            ],
            status: "active",
            createdAt: "2024-01-01"
        },
        {
            id: 2,
            name: "باقة الفضية",
            price: 350,
            duration: 30,
            features: [
                "وصول غير محدود",
                "تدريب جماعي",
                "ساونا"
            ],
            status: "active",
            createdAt: "2024-01-01"
        },
        {
            id: 3,
            name: "باقة البرونزية",
            price: 250,
            duration: 30,
            features: [
                "وصول محدود (3 أيام أسبوعياً)",
                "تدريب جماعي"
            ],
            status: "active",
            createdAt: "2024-01-01"
        },
        {
            id: 4,
            name: "باقة سنوية",
            price: 5000,
            duration: 365,
            features: [
                "وصول غير محدود لمدة سنة",
                "تدريب شخصي (4 جلسات شهرية)",
                "ساونا وجاكوزي",
                "مشروبات مجانية",
                "هدية ترحيبية"
            ],
            status: "active",
            createdAt: "2024-01-01"
        }
    ],

    // جلب جميع الأعضاء
    getAllMembers: function() {
        try {
            const storedMembers = localStorage.getItem('gymMembers');
            if (storedMembers) {
                return JSON.parse(storedMembers);
            } else {
                // حفظ الأعضاء الافتراضيين
                localStorage.setItem('gymMembers', JSON.stringify(this.defaultMembers));
                return this.defaultMembers;
            }
        } catch (error) {
            console.error('خطأ في جلب الأعضاء:', error);
            return this.defaultMembers;
        }
    },

    // حفظ الأعضاء
    saveMembers: function(membersArray) {
        try {
            localStorage.setItem('gymMembers', JSON.stringify(membersArray));
            return true;
        } catch (error) {
            console.error('خطأ في حفظ الأعضاء:', error);
            return false;
        }
    },

    // جلب جميع الباقات
    getAllPackages: function() {
        try {
            const storedPackages = localStorage.getItem('gymPackages');
            if (storedPackages) {
                return JSON.parse(storedPackages);
            } else {
                // حفظ الباقات الافتراضية
                localStorage.setItem('gymPackages', JSON.stringify(this.defaultPackages));
                return this.defaultPackages;
            }
        } catch (error) {
            console.error('خطأ في جلب الباقات:', error);
            return this.defaultPackages;
        }
    },

    // حفظ الباقات
    savePackages: function(packagesArray) {
        try {
            localStorage.setItem('gymPackages', JSON.stringify(packagesArray));
            return true;
        } catch (error) {
            console.error('خطأ في حفظ الباقات:', error);
            return false;
        }
    },

    // إضافة عضو جديد
    addMember: function(memberData) {
        const members = this.getAllMembers();
        const memberId = this.generateMemberId();
        
        // حساب تاريخ الانتهاء
        const startDate = new Date(memberData.startDate);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + memberData.packageDuration);

        const newMember = {
            id: memberId,
            firstName: memberData.firstName,
            lastName: memberData.lastName,
            fullName: `${memberData.firstName} ${memberData.lastName}`,
            age: parseInt(memberData.age),
            gender: memberData.gender,
            phone: memberData.phone,
            email: memberData.email || '',
            packageId: parseInt(memberData.packageId),
            packageName: memberData.packageName,
            packagePrice: parseInt(memberData.packagePrice),
            packageDuration: parseInt(memberData.packageDuration),
            startDate: memberData.startDate,
            endDate: endDate.toISOString().split('T')[0],
            paymentMethod: memberData.paymentMethod,
            status: this.calculateStatus(endDate),
            addedBy: usersModule.getCurrentUser()?.name || 'system',
            addedDate: new Date().toISOString().split('T')[0],
            notes: memberData.notes || '',
            totalPaid: parseInt(memberData.packagePrice),
            renewalCount: 0,
            lastRenewalDate: null
        };

        members.push(newMember);
        this.saveMembers(members);

        // إضافة إلى النشاطات
        this.addActivity({
            type: 'new_member',
            title: `عضو جديد: ${newMember.fullName}`,
            details: `تم إضافة عضو جديد ${newMember.fullName} بباقة ${newMember.packageName}`,
            memberId: memberId,
            amount: newMember.packagePrice,
            userId: usersModule.getCurrentUser()?.username || 'system',
            timestamp: new Date().toLocaleString('ar-EG')
        });

        return newMember;
    },

    // تجديد اشتراك عضو
    renewMember: function(memberId, renewalData) {
        const members = this.getAllMembers();
        const memberIndex = members.findIndex(m => m.id === memberId);
        
        if (memberIndex !== -1) {
            const member = members[memberIndex];
            
            // حساب تاريخ الانتهاء الجديد
            const startDate = new Date(renewalData.startDate || new Date());
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + renewalData.packageDuration);

            // تحديث بيانات العضو
            member.packageId = parseInt(renewalData.packageId);
            member.packageName = renewalData.packageName;
            member.packagePrice = parseInt(renewalData.packagePrice);
            member.packageDuration = parseInt(renewalData.packageDuration);
            member.startDate = startDate.toISOString().split('T')[0];
            member.endDate = endDate.toISOString().split('T')[0];
            member.paymentMethod = renewalData.paymentMethod;
            member.status = this.calculateStatus(endDate);
            member.totalPaid += parseInt(renewalData.packagePrice);
            member.renewalCount = (member.renewalCount || 0) + 1;
            member.lastRenewalDate = new Date().toISOString().split('T')[0];

            this.saveMembers(members);

            // إضافة إلى النشاطات
            this.addActivity({
                type: 'renewal',
                title: `تجديد اشتراك: ${member.fullName}`,
                details: `تم تجديد اشتراك ${member.fullName} بباقة ${member.packageName}`,
                memberId: memberId,
                amount: renewalData.packagePrice,
                userId: usersModule.getCurrentUser()?.username || 'system',
                timestamp: new Date().toLocaleString('ar-EG')
            });

            return true;
        }
        
        return false;
    },

    // تحديث حالة العضو
    updateMemberStatus: function(memberId) {
        const members = this.getAllMembers();
        const memberIndex = members.findIndex(m => m.id === memberId);
        
        if (memberIndex !== -1) {
            const member = members[memberIndex];
            const endDate = new Date(member.endDate);
            member.status = this.calculateStatus(endDate);
            this.saveMembers(members);
            return true;
        }
        
        return false;
    },
// دالة حذف العضو (النسخة المحسنة)
deleteMember: function(memberId, reason = '', deletedBy = null) {
    const members = this.getAllMembers();
    const memberIndex = members.findIndex(m => m.id === memberId);
    
    if (memberIndex === -1) {
        console.error('العضو غير موجود:', memberId);
        return false;
    }
    
    const member = members[memberIndex];
    
    // حفظ في السجلات المحذوفة
    if (typeof deletedMembersModule !== 'undefined') {
        const currentUser = deletedBy || usersModule.getCurrentUser()?.name || 'system';
        deletedMembersModule.addToDeleted(member, currentUser, reason);
    } else if (typeof deletedMembersManager !== 'undefined') {
        const currentUser = deletedBy || usersModule.getCurrentUser()?.name || 'system';
        deletedMembersManager.addToDeleted(member, currentUser, reason);
    } else {
        // حفظ محلي في حال عدم وجود المدير
        this.saveToLocalDeleted(member, deletedBy || 'system', reason);
    }

    // إضافة إلى النشاطات
    this.addActivity({
        type: 'delete_member',
        title: `حذف عضو: ${member.fullName}`,
        details: `تم حذف العضو ${member.fullName}${reason ? ' - سبب: ' + reason : ''}`,
        memberId: memberId,
        amount: 0,
        userId: usersModule.getCurrentUser()?.username || 'system',
        timestamp: new Date().toLocaleString('ar-EG')
    });

    // حذف العضو من المصفوفة
    members.splice(memberIndex, 1);
    
    // حفظ الأعضاء المحدثة
    const success = this.saveMembers(members);
    
    if (success) {
        // إضافة إشعار
        this.addNotification({
            type: 'delete_member',
            title: 'حذف عضو',
            message: `تم حذف العضو ${member.fullName}`,
            timestamp: new Date().toISOString(),
            read: false
        });
        
        // تحديث الإحصائيات
        this.calculateStats();
    }
    
    return success;
},
// دالة مساعدة للحفظ المحلي
saveToLocalDeleted: function(member, deletedBy, reason) {
    try {
        let deletedMembers = JSON.parse(localStorage.getItem('deletedMembers')) || [];
        
        const deletedMember = {
            ...member,
            deletedDate: new Date().toISOString(),
            deletedBy: deletedBy,
            deletedById: usersModule.getCurrentUser()?.id || 'unknown',
            deletionReason: reason,
            restored: false
        };
        
        deletedMembers.unshift(deletedMember);
        localStorage.setItem('deletedMembers', JSON.stringify(deletedMembers));
        return true;
    } catch (error) {
        console.error('خطأ في حفظ السجلات المحذوفة:', error);
        return false;
    }
},

    // البحث عن أعضاء
    searchMembers: function(query) {
        const members = this.getAllMembers();
        const searchTerm = query.toLowerCase();
        
        return members.filter(member => {
            const id = member.id ? member.id.toString() : '';
            const fullName = member.fullName ? member.fullName.toString() : '';
            const phone = member.phone ? member.phone.toString() : '';
            const email = member.email ? member.email.toString() : '';
            const packageName = member.packageName ? member.packageName.toString() : '';

            return (
                id.toLowerCase().includes(searchTerm) ||
                fullName.toLowerCase().includes(searchTerm) ||
                phone.includes(searchTerm) ||
                email.toLowerCase().includes(searchTerm) ||
                packageName.toLowerCase().includes(searchTerm)
            );
        });
    },

    // جلب الأعضاء حسب الحالة
    getMembersByStatus: function(status) {
        const members = this.getAllMembers();
        return members.filter(member => member.status === status);
    },

    // جلب الأعضاء حسب الجنس
    getMembersByGender: function(gender) {
        const members = this.getAllMembers();
        return members.filter(member => member.gender === gender);
    },

    // حساب الإحصائيات
    calculateStats: function() {
        const allMembers = this.getAllMembers();
        const currentDate = new Date();
        
        // حساب الأعضاء النشطين والمنتهية والمستحق تجديدها
        let active = 0, expired = 0, expiring = 0;
        let totalRevenue = 0;
        let monthlyRevenue = 0;
        let maleCount = 0, femaleCount = 0;
        
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        allMembers.forEach(member => {
            // تحديث حالة العضو أولاً
            const endDate = new Date(member.endDate);
            member.status = this.calculateStatus(endDate);
            
            // حساب الإحصائيات
            if (member.status === 'active') active++;
            if (member.status === 'expired') expired++;
            if (member.status === 'expiring') expiring++;
            
            // حساب الجنس
            if (member.gender === 'male') maleCount++;
            if (member.gender === 'female') femaleCount++;
            
            // حساب الإيرادات
            totalRevenue += member.totalPaid || 0;
            
            // إيرادات الشهر الحالي
            const memberDate = new Date(member.addedDate || member.startDate);
            if (memberDate.getMonth() === currentMonth && memberDate.getFullYear() === currentYear) {
                monthlyRevenue += member.totalPaid || 0;
            }
        });

        // حفظ التغييرات في الحالة
        this.saveMembers(allMembers);

        return {
            totalMembers: allMembers.length,
            maleMembers: maleCount,
            femaleMembers: femaleCount,
            activeMembers: active,
            expiredMembers: expired,
            expiringMembers: expiring,
            totalRevenue: totalRevenue,
            monthlyRevenue: monthlyRevenue
        };
    },

    // حساب حالة العضو
    calculateStatus: function(endDate) {
        const today = new Date();
        const end = new Date(endDate);
        const diffTime = end - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return "expired";
        if (diffDays <= 3) return "expiring";
        return "active";
    },

    // توليد معرف عشوائي للعضو (6 أرقام فقط)
    generateMemberId: function() {
        // توليد 6 أرقام عشوائية
        const numbers = '0123456789';
        let id = '';
        
        for (let i = 0; i < 6; i++) {
            id += numbers.charAt(Math.floor(Math.random() * numbers.length));
        }
        
        // التحقق من عدم تكرار المعرف
        const members = this.getAllMembers();
        while (members.some(m => m.id === id)) {
            id = '';
            for (let i = 0; i < 6; i++) {
                id += numbers.charAt(Math.floor(Math.random() * numbers.length));
            }
        }
        
        return id;
    },

    // إضافة باقة جديدة
    addPackage: function(packageData) {
        const packages = this.getAllPackages();
        const newId = packages.length > 0 ? Math.max(...packages.map(p => p.id)) + 1 : 1;
        
        const newPackage = {
            id: newId,
            name: packageData.name,
            price: parseInt(packageData.price),
            duration: parseInt(packageData.duration),
            features: packageData.features.split(',').map(f => f.trim()),
            status: "active",
            createdAt: new Date().toISOString().split('T')[0]
        };

        packages.push(newPackage);
        this.savePackages(packages);
        return newPackage;
    },

    // تحديث باقة
    updatePackage: function(packageId, packageData) {
        const packages = this.getAllPackages();
        const packageIndex = packages.findIndex(p => p.id === parseInt(packageId));
        
        if (packageIndex !== -1) {
            packages[packageIndex] = {
                ...packages[packageIndex],
                name: packageData.name,
                price: parseInt(packageData.price),
                duration: parseInt(packageData.duration),
                features: packageData.features.split(',').map(f => f.trim())
            };
            
            this.savePackages(packages);
            return true;
        }
        
        return false;
    },

    // حذف باقة
    deletePackage: function(packageId) {
        // التحقق إذا كانت الباقة مستخدمة
        const members = this.getAllMembers();
        const packageInUse = members.some(member => member.packageId === parseInt(packageId));
        
        if (packageInUse) {
            return false; // لا يمكن حذف باقة مستخدمة
        }
        
        const packages = this.getAllPackages();
        const filteredPackages = packages.filter(p => p.id !== parseInt(packageId));
        return this.savePackages(filteredPackages);
    },

    // جلب الباقة بالمعرف
    getPackageById: function(packageId) {
        const packages = this.getAllPackages();
        return packages.find(p => p.id === parseInt(packageId));
    },

    // إضافة نشاط
    addActivity: function(activity) {
        const activities = this.getActivities();
        activity.id = Date.now();
        activities.unshift(activity);
        
        // حفظ آخر 50 نشاط فقط
        if (activities.length > 50) {
            activities.pop();
        }
        
        localStorage.setItem('gymActivities', JSON.stringify(activities));
        
        // إضافة إشعار
        this.addNotification({
            type: activity.type,
            title: activity.title,
            message: activity.details,
            timestamp: activity.timestamp,
            read: false
        });
        
        return activity;
    },

    // جلب النشاطات
    getActivities: function(limit = 10) {
        try {
            const storedActivities = localStorage.getItem('gymActivities');
            const activities = storedActivities ? JSON.parse(storedActivities) : [];
            return activities.slice(0, limit);
        } catch (error) {
            console.error('خطأ في جلب النشاطات:', error);
            return [];
        }
    },

    // إضافة إشعار
    addNotification: function(notification) {
        const notifications = this.getNotifications();
        notification.id = Date.now();
        notifications.unshift(notification);
        
        // حفظ آخر 100 إشعار فقط
        if (notifications.length > 100) {
            notifications.pop();
        }
        
        localStorage.setItem('gymNotifications', JSON.stringify(notifications));
        return notification;
    },

    // جلب الإشعارات
    getNotifications: function() {
        try {
            const storedNotifications = localStorage.getItem('gymNotifications');
            return storedNotifications ? JSON.parse(storedNotifications) : [];
        } catch (error) {
            console.error('خطأ في جلب الإشعارات:', error);
            return [];
        }
    },

    // تحديد الإشعار كمقروء
    markNotificationAsRead: function(notificationId) {
        const notifications = this.getNotifications();
        const notificationIndex = notifications.findIndex(n => n.id === notificationId);
        
        if (notificationIndex !== -1) {
            notifications[notificationIndex].read = true;
            localStorage.setItem('gymNotifications', JSON.stringify(notifications));
            return true;
        }
        
        return false;
    },

    // تحديد كل الإشعارات كمقروءة
    markAllNotificationsAsRead: function() {
        const notifications = this.getNotifications();
        notifications.forEach(notification => {
            notification.read = true;
        });
        
        localStorage.setItem('gymNotifications', JSON.stringify(notifications));
        return true;
    },

    // جلب عدد الإشعارات غير المقروءة
    getUnreadNotificationsCount: function() {
        const notifications = this.getNotifications();
        return notifications.filter(n => !n.read).length;
    },

    // جلب الأحداث حسب التاريخ
    getEventsByDate: function(date) {
        const members = this.getAllMembers();
        const targetDate = new Date(date).toISOString().split('T')[0];
        const events = [];

        // البحث في الأعضاء الذين تم إضافتهم أو تجديدهم في هذا التاريخ
        members.forEach(member => {
            if (member.addedDate === targetDate) {
                events.push({
                    type: 'new_member',
                    title: `عضو جديد: ${member.fullName}`,
                    memberId: member.id,
                    time: '10:00',
                    startDate: member.startDate
                });
            }
            
            if (member.endDate === targetDate) {
                events.push({
                    type: 'expiring',
                    title: `انتهاء اشتراك: ${member.fullName}`,
                    memberId: member.id,
                    time: '23:59',
                    startDate: member.startDate
                });
            }
        });

        return events;
    },

    // جلب الأعضاء الجدد هذا الشهر
    getNewMembersThisMonth: function() {
        const allMembers = this.getAllMembers();
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        return allMembers.filter(member => {
            if (member.addedDate || member.startDate) {
                const joinDate = new Date(member.addedDate || member.startDate);
                return joinDate.getMonth() === currentMonth && 
                       joinDate.getFullYear() === currentYear;
            }
            return false;
        });
    },

    // حساب إجمالي إشتراكات الأعضاء الجدد
    getNewMembersRevenue: function() {
        const newMembers = this.getNewMembersThisMonth();
        return newMembers.reduce((sum, member) => {
            return sum + (parseFloat(member.packagePrice) || 0);
        }, 0);
    },

    // إنشاء تقرير الأعضاء الجدد
    generateNewMembersReport: function() {
        const newMembers = this.getNewMembersThisMonth();
        const stats = this.calculateStats();
        
        // الشهور العربية
        const arabicMonths = [
            'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
            'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
        ];
        
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        return {
            month: `${arabicMonths[currentMonth]} ${currentYear}`,
            printDate: new Date().toLocaleDateString('ar-EG'),
            totalMembers: stats.totalMembers,
            maleMembers: stats.maleMembers,
            femaleMembers: stats.femaleMembers,
            newMembersCount: newMembers.length,
            newMembersRevenue: this.getNewMembersRevenue(),
            members: newMembers
        };
    },

    // تصدير تقرير الأعضاء الجدد
    exportNewMembersReport: function() {
        const report = this.generateNewMembersReport();
        
        // إنشاء CSV
        let csv = 'الكود,الاسم,الجنس,الباقة,تاريخ التسجيل,طريقة الدفع,المبلغ,الحالة\n';
        
        report.members.forEach(member => {
            const genderText = member.gender === 'male' ? 'ذكر' : 'أنثى';
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
            
            const joinDate = member.addedDate || member.startDate;
            
            csv += `${member.id},${member.fullName},${genderText},${member.packageName},${joinDate},${paymentText[member.paymentMethod] || member.paymentMethod},${member.packagePrice || '0'},${statusText[member.status] || member.status}\n`;
        });

        // تحميل الملف
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        
        link.setAttribute('href', url);
        link.setAttribute('download', `أعضاء_جدد_${currentYear}_${currentMonth}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        return report;
    },

    // طباعة تقرير الإحصائيات
    printStatisticsReport: function() {
        return this.generateNewMembersReport();
    },

    // جلب تقرير مختصر للإحصائيات
    getSummaryStatistics: function() {
        const stats = this.calculateStats();
        const newMembers = this.getNewMembersThisMonth();
        
        return {
            total: stats.totalMembers,
            male: stats.maleMembers,
            female: stats.femaleMembers,
            new: newMembers.length,
            newRevenue: this.getNewMembersRevenue(),
            active: stats.activeMembers,
            expired: stats.expiredMembers,
            expiring: stats.expiringMembers
        };
    },

    // تحميل الإحصائيات للعرض
    loadStatisticsForDisplay: function() {
        const summary = this.getSummaryStatistics();
        const newMembers = this.getNewMembersThisMonth();
        
        return {
            summary: summary,
            newMembers: newMembers
        };
    },

    // الحصول على العضو بواسطة المعرف
    getMemberById: function(memberId) {
        return this.getAllMembers().find(member => member.id === memberId);
    },

    // الحصول على الباقات مع عدد المشتركين
    getPackagesWithMemberCount: function() {
        const packages = this.getAllPackages();
        const members = this.getAllMembers();
        
        return packages.map(pkg => {
            const memberCount = members.filter(member => member.packageId === pkg.id).length;
            return {
                ...pkg,
                memberCount: memberCount
            };
        });
    },

    // الحصول على إحصائيات طرق الدفع
    getPaymentStats: function() {
        const members = this.getAllMembers();
        const paymentStats = {
            'cash': 0,
            'vodafone_cash': 0,
            'instapay': 0,
            'other': 0
        };
        
        members.forEach(member => {
            const method = member.paymentMethod;
            const amount = member.totalPaid || member.packagePrice || 0;
            
            if (paymentStats[method] !== undefined) {
                paymentStats[method] += amount;
            } else {
                paymentStats.other += amount;
            }
        });
        
        return paymentStats;
    },

    // التحقق من تفرد رقم الهاتف
    isPhoneUnique: function(phone, excludeId = null) {
        const members = this.getAllMembers();
        return !members.some(member => 
            member.phone === phone && 
            (excludeId === null || member.id !== excludeId)
        );
    }
};

window.membersModule = members;


// أضف في نهاية ملف members.js
console.log('تم تحميل membersModule بنجاح');

// اختبار دالة الحذف
window.testDeleteMember = function(memberId) {
    console.log('اختبار حذف العضو:', memberId);
    
    const result = membersModule.deleteMember(memberId, 'اختبار الحذف', 'admin');
    console.log('نتيجة الحذف:', result);
    
    if (result) {
        alert('تم الحذف بنجاح!');
        
        // إعادة تحميل الصفحة
        if (window.location.pathname.includes('members.html')) {
            window.location.reload();
        }
    } else {
        alert('فشل الحذف!');
    }
};