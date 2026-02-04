// ملف بيانات المستخدمين
const users = {
    // بيانات افتراضية للمستخدمين
    defaultUsers: [
        {
            id: 1,
            username: "admin",
            password: "admin123",
            name: "المسؤول الرئيسي",
            role: "admin",
            email: "admin@gym.com",
            phone: "01012345678",
            status: "online",
            lastLogin: "2024-01-15 10:30:00",
            createdBy: "system",
            createdAt: "2024-01-01",
            permissions: ["all"]
        },
        {
            id: 2,
            username: "assistant1",
            password: "assistant123",
            name: "المساعد الأول",
            role: "assistant",
            email: "assistant1@gym.com",
            phone: "01087654321",
            status: "online",
            lastLogin: "2024-01-15 09:15:00",
            createdBy: "admin",
            createdAt: "2024-01-05",
            permissions: ["view_members", "add_members", "renew_subscriptions"]
        },
        {
            id: 3,
            username: "viewer1",
            password: "viewer123",
            name: "المتفرج الأول",
            role: "viewer",
            email: "viewer1@gym.com",
            phone: "01055556666",
            status: "offline",
            lastLogin: "2024-01-14 14:20:00",
            createdBy: "admin",
            createdAt: "2024-01-10",
            permissions: ["view_members", "view_stats"]
        }
    ],

    // جلب جميع المستخدمين
    getAllUsers: function() {
        const storedUsers = localStorage.getItem('gymUsers');
        if (storedUsers) {
            return JSON.parse(storedUsers);
        } else {
            // حفظ المستخدمين الافتراضيين
            localStorage.setItem('gymUsers', JSON.stringify(this.defaultUsers));
            return this.defaultUsers;
        }
    },

    // حفظ المستخدمين
    saveUsers: function(usersArray) {
        localStorage.setItem('gymUsers', JSON.stringify(usersArray));
    },

    // إضافة مستخدم جديد
    addUser: function(userData) {
        const users = this.getAllUsers();
        const newId = this.generateUserId();
        
        const newUser = {
            id: newId,
            username: userData.username,
            password: userData.password,
            name: userData.name,
            role: userData.role,
            email: userData.email || '',
            phone: userData.phone || '',
            status: "offline",
            lastLogin: null,
            createdBy: this.getCurrentUser() ? this.getCurrentUser().username : 'system',
            createdAt: new Date().toISOString().split('T')[0],
            permissions: this.getPermissionsByRole(userData.role)
        };
        
        users.push(newUser);
        this.saveUsers(users);
        return newUser;
    },

    // تحديث مستخدم
    updateUser: function(userId, userData) {
        const users = this.getAllUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex !== -1) {
            // الحفاظ على بعض البيانات
            userData.id = userId;
            userData.status = users[userIndex].status;
            userData.lastLogin = users[userIndex].lastLogin;
            userData.createdBy = users[userIndex].createdBy;
            userData.createdAt = users[userIndex].createdAt;
            
            // تحديث الصلاحيات إذا تغير الدور
            if (userData.role !== users[userIndex].role) {
                userData.permissions = this.getPermissionsByRole(userData.role);
            } else {
                userData.permissions = users[userIndex].permissions;
            }
            
            users[userIndex] = userData;
            this.saveUsers(users);
            return true;
        }
        return false;
    },

    // حذف مستخدم
    deleteUser: function(userId) {
        const users = this.getAllUsers();
        const filteredUsers = users.filter(u => u.id !== userId);
        this.saveUsers(filteredUsers);
        return true;
    },

    // البحث عن مستخدم
    searchUsers: function(query) {
        const users = this.getAllUsers();
        const searchTerm = query.toLowerCase();
        
        return users.filter(user => 
            user.username.toLowerCase().includes(searchTerm) ||
            user.name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm) ||
            user.role.toLowerCase().includes(searchTerm)
        );
    },

    // توليد معرف مستخدم عشوائي
    generateUserId: function() {
        const users = this.getAllUsers();
        const maxId = users.reduce((max, user) => Math.max(max, user.id), 0);
        return maxId + 1;
    },

    // جلب الصلاحيات حسب الدور
    getPermissionsByRole: function(role) {
        const permissions = {
            admin: ["all"],
            assistant: ["view_members", "add_members", "renew_subscriptions", "view_stats", "view_calendar"],
            viewer: ["view_members", "view_stats"]
        };
        
        return permissions[role] || [];
    },

    // التحقق من صلاحية المستخدم
    hasPermission: function(user, permission) {
        if (user.role === 'admin') return true;
        return user.permissions.includes(permission) || user.permissions.includes('all');
    },

    // تحديث حالة المستخدم
    updateUserStatus: function(username, status) {
        const users = this.getAllUsers();
        const userIndex = users.findIndex(u => u.username === username);
        
        if (userIndex !== -1) {
            users[userIndex].status = status;
            if (status === 'online') {
                users[userIndex].lastLogin = new Date().toLocaleString('ar-EG');
            }
            this.saveUsers(users);
        }
    },

    // جلب المستخدم الحالي من localStorage
    getCurrentUser: function() {
        const userData = localStorage.getItem('currentUser');
        return userData ? JSON.parse(userData) : null;
    },

    // حفظ المستخدم الحالي
    setCurrentUser: function(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        // تحديث حالة المستخدم إلى online
        this.updateUserStatus(user.username, 'online');
    },

    // تسجيل الخروج
    logout: function() {
        const currentUser = this.getCurrentUser();
        if (currentUser) {
            this.updateUserStatus(currentUser.username, 'offline');
        }
        localStorage.removeItem('currentUser');
    }
};

// جعل الكائن متاحاً بشكل عام
window.usersModule = users;