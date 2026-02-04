// ملف إدارة تسجيل الدخول
const loginManager = {
    // تهيئة صفحة الدخول
    initLoginPage: function() {
        console.log('تهيئة صفحة الدخول...');
        
        // إضافة مستمع لاستمارة الدخول
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('تم النقر على تسجيل الدخول');
                this.handleLogin();
            });
        } else {
            console.error('لم يتم العثور على نموذج الدخول!');
        }
    },
    
    // معالجة عملية الدخول
    handleLogin: function() {
        console.log('بدء معالجة الدخول...');
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const errorElement = document.getElementById('loginError');
        
        console.log('المدخلات:', { username, password });
        
        // إعادة تعيين رسالة الخطأ
        errorElement.style.display = 'none';
        errorElement.textContent = '';
        
        // التحقق من الحقول الفارغة
        if (!username || !password) {
            this.showError('يرجى إدخال اسم المستخدم وكلمة المرور');
            return;
        }
        
        // التحقق من بيانات المستخدم
        const user = this.authenticateUser(username, password);
        console.log('نتيجة المصادقة:', user);
        
        if (user) {
            // تسجيل الدخول الناجح
            console.log('المستخدم موجود:', user);
            usersModule.setCurrentUser(user);
            this.showSuccess('تم تسجيل الدخول بنجاح');
            
            // إعادة التوجيه إلى لوحة التحكم بعد تأخير بسيط
            setTimeout(() => {
                this.redirectToDashboard(user.role);
            }, 1000);
        } else {
            // فشل تسجيل الدخول
            console.log('المستخدم غير موجود');
            this.showError('اسم المستخدم أو كلمة المرور غير صحيحة');
        }
    },
    
    // التحقق من صحة بيانات المستخدم
    authenticateUser: function(username, password) {
        // التحقق من وجود usersModule
        if (typeof usersModule === 'undefined') {
            console.error('usersModule غير محمل!');
            return null;
        }
        
        try {
            const users = usersModule.getAllUsers();
            console.log('جميع المستخدمين:', users);
            
            const user = users.find(u => 
                u.username === username && u.password === password
            );
            
            return user || null;
        } catch (error) {
            console.error('خطأ في المصادقة:', error);
            return null;
        }
    },
    
    // إعادة التوجيه إلى لوحة التحكم المناسبة
    redirectToDashboard: function(role) {
        console.log('التوجيه حسب الدور:', role);
        
        switch(role) {
            case 'admin':
                window.location.href = '../dashboard.html';
                break;
            case 'assistant':
                window.location.href = '../assistant-dashboard.html';
                break;
            case 'viewer':
                window.location.href = '../viewer/viewer-dashboard.html';
                break;
            default:
                window.location.href = 'index.html';
        }
    },
    
    // عرض رسالة نجاح
    showSuccess: function(message) {
        console.log('رسالة نجاح:', message);
        this.showMessage(message, 'success');
    },
    
    // عرض رسالة خطأ
    showError: function(message) {
        console.log('رسالة خطأ:', message);
        this.showMessage(message, 'error');
    },
    
    // عرض رسالة مخصصة
    showMessage: function(message, type) {
        const errorElement = document.getElementById('loginError');
        if (!errorElement) {
            console.error('عنصر عرض الخطأ غير موجود!');
            alert(message); // عرض تنبيه بديل
            return;
        }
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        if (type === 'success') {
            errorElement.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
            errorElement.style.color = 'var(--success)';
        } else {
            errorElement.style.backgroundColor = 'rgba(244, 67, 54, 0.1)';
            errorElement.style.color = 'var(--danger)';
        }
    },
    
    // تسجيل الخروج
    logout: function() {
        if (typeof usersModule !== 'undefined') {
            usersModule.logout();
        }
        window.location.href = 'index.html';
    }
};

// تصدير الكائن للملفات الأخرى
window.loginModule = loginManager;

// تهيئة صفحة الدخول عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('صفحة الدخول جاهزة');
    
    // التحقق إذا كنا في صفحة الدخول
    if (document.querySelector('.login-page') || document.getElementById('loginForm')) {
        console.log('تهيئة مدير الدخول...');
        loginManager.initLoginPage();
    }
});