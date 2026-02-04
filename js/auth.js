import { auth } from "./firebase.js";
import { signInWithEmailAndPassword }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

window.login = async (email, password) => {
  await signInWithEmailAndPassword(auth, email, password);
  window.location.href = "dashboard.html";
};


// js/auth.js

/**
 * وظيفة تسجيل الخروج
 */
function logoutUser() {
    // عرض مودال تأكيد الخروج
    showLogoutConfirmModal();
}

/**
 * عرض مودال تأكيد الخروج
 */
function showLogoutConfirmModal() {
    const modal = document.getElementById('logoutConfirmModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

/**
 * إغلاق مودال تأكيد الخروج
 */
function closeLogoutModal() {
    const confirmModal = document.getElementById('logoutConfirmModal');
    const logoutModal = document.getElementById('logoutModal');
    
    if (confirmModal) confirmModal.style.display = 'none';
    if (logoutModal) logoutModal.style.display = 'none';
    
    document.body.style.overflow = 'auto';
}

/**
 * تأكيد تسجيل الخروج
 */
function confirmLogout() {
    // عرض مودال التحميل
    const loadingModal = document.getElementById('logoutModal');
    if (loadingModal) {
        loadingModal.style.display = 'flex';
    }
    
    // محاكاة عملية الخروج (يمكنك استبدالها بطريقة الخروج الحقيقية)
    setTimeout(() => {
        // مسح بيانات الجلسة
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        sessionStorage.clear();
        
        // إغلاق مودال التحميل
        if (loadingModal) {
            loadingModal.style.display = 'none';
        }
        
        // إغلاق مودال التأكيد
        const confirmModal = document.getElementById('logoutConfirmModal');
        if (confirmModal) confirmModal.style.display = 'none';
        
        // الانتقال لصفحة الدخول (index.html)
        window.location.href = '../index.html';
    }, 1500);
}

/**
 * التحقق من حالة تسجيل الدخول
 */
function checkAuth() {
    const token = localStorage.getItem('userToken');
    const userData = localStorage.getItem('userData');
    
    // إذا لم يكن المستخدم مسجلاً، توجيهه لصفحة الدخول
    if (!token || !userData) {
        window.location.href = '../index.html';
        return;
    }
    
    try {
        const user = JSON.parse(userData);
        
        // تحديث واجهة المستخدم بمعلوماته
        updateUserUI(user);
        
        // التحقق من الصلاحيات
        if (user.role !== 'viewer') {
            console.warn('المستخدم ليس لديه صلاحيات المتفرج');
            // يمكنك توجيهه للوحة تحكم مختلفة حسب صلاحياته
        }
    } catch (error) {
        console.error('خطأ في تحليل بيانات المستخدم:', error);
        window.location.href = '../index.html';
    }
}

/**
 * تحديث واجهة المستخدم بمعلومات المستخدم
 */
function updateUserUI(user) {
    // تحديث اسم المستخدم في كل الأماكن
    const userNameElements = document.querySelectorAll('[id*="userName"], [id*="dropdownUserName"]');
    userNameElements.forEach(element => {
        element.textContent = user.name || 'مستخدم';
    });
    
    // تحديث دور المستخدم
    const userRoleElements = document.querySelectorAll('[id*="userRole"]');
    userRoleElements.forEach(element => {
        element.textContent = user.role === 'viewer' ? 'متفرج' : user.role;
    });
    
    // تحديث الصورة الرمزية
    const userAvatarElements = document.querySelectorAll('[id*="userAvatar"]');
    userAvatarElements.forEach(element => {
        // إذا كان لديك صورة مستخدم، يمكنك تعيينها هنا
        if (user.avatar) {
            element.style.backgroundImage = `url(${user.avatar})`;
            element.style.backgroundSize = 'cover';
            element.textContent = '';
        } else {
            // عرض الحرف الأول من الاسم
            element.textContent = (user.name || 'م').charAt(0);
        }
    });
}

/**
 * تهيئة إدارة الجلسة
 */
function initializeAuth() {
    // التحقق من المصادقة عند تحميل الصفحة
    checkAuth();
    
    // إضافة مستمع حدث للخروج عند الضغط على زر ESC في مودال التأكيد
    document.addEventListener('keydown', (e) => {
        const confirmModal = document.getElementById('logoutConfirmModal');
        if (e.key === 'Escape' && confirmModal && confirmModal.style.display === 'flex') {
            closeLogoutModal();
        }
    });
    
    // إغلاق المودالات عند النقر خارجها
    const modals = ['logoutConfirmModal', 'logoutModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeLogoutModal();
                }
            });
        }
    });
    
    // تعيين الحدث لزر الخروج في القائمة الجانبية (إذا وجد)
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn && !logoutBtn.onclick) {
        logoutBtn.onclick = logoutUser;
    }
}

// تهيئة المصادقة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initializeAuth);