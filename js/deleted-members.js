// ملف إدارة السجلات المحذوفة
const deletedMembersManager = {
    // تخزين معرف العضو المراد استرجاعه
    memberToRestore: null,
    
    // تهيئة الصفحة
    init: function() {
        this.loadDeletedMembers();
        this.setupEventListeners();
        this.updateUserInfo();
        this.updateNotificationBadge();
    },
    
    // تحميل الأعضاء المحذوفين
    loadDeletedMembers: function() {
        const deletedMembers = this.getDeletedMembers();
        this.displayDeletedMembers(deletedMembers);
    },
    
    // جلب الأعضاء المحذوفين من localStorage
    getDeletedMembers: function() {
        try {
            const deleted = localStorage.getItem('deletedMembers');
            return deleted ? JSON.parse(deleted) : [];
        } catch (error) {
            console.error('خطأ في جلب السجلات المحذوفة:', error);
            return [];
        }
    },
    
    // حفظ الأعضاء المحذوفين
    saveDeletedMembers: function(members) {
        try {
            localStorage.setItem('deletedMembers', JSON.stringify(members));
            return true;
        } catch (error) {
            console.error('خطأ في حفظ السجلات المحذوفة:', error);
            return false;
        }
    },
    
    // إضافة عضو إلى السجلات المحذوفة
    addToDeleted: function(member, deletedBy, reason = '') {
        const deletedMembers = this.getDeletedMembers();
        const deletedMember = {
            ...member,
            deletedDate: new Date().toISOString(),
            deletedBy: deletedBy,
            deletedById: usersModule.getCurrentUser()?.id || 'unknown',
            deletionReason: reason,
            restored: false
        };
        
        deletedMembers.unshift(deletedMember);
        this.saveDeletedMembers(deletedMembers);
        
        // إضافة نشاط
        if (typeof membersModule !== 'undefined') {
            membersModule.addActivity({
                type: 'delete_member',
                title: `حذف عضو: ${member.fullName}`,
                details: `تم حذف العضو ${member.fullName} بواسطة ${deletedBy}`,
                memberId: member.id,
                amount: 0,
                userId: deletedBy,
                timestamp: new Date().toLocaleString('ar-EG')
            });
        }
        
        return deletedMember;
    },
    
    // عرض الأعضاء المحذوفين
   // تحديث دالة displayDeletedMembers
displayDeletedMembers: function(members) {
    const tableBody = document.getElementById('deletedMembersTable');
    if (!tableBody) {
        console.error('عنصر الجدول غير موجود');
        return;
    }
    
    if (members.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: var(--text-light);">
                    <i class="fas fa-trash-alt" style="font-size: 48px; margin-bottom: 20px; color: var(--gray);"></i>
                    <h3 style="margin-bottom: 10px;">لا توجد سجلات محذوفة</h3>
                    <p style="color: var(--text-light);">لم يتم حذف أي أعضاء بعد</p>
                </td>
            </tr>
        `;
        return;
    }
    
    let tableHTML = '';
    
    members.forEach((member, index) => {
        const deletedDate = new Date(member.deletedDate);
        const formattedDate = deletedDate.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // تحضير زر الاسترجاع
        let restoreButton = '';
        if (member.restored) {
            restoreButton = `
                <button class="action-btn restore" title="تم الاسترجاع" disabled style="cursor: not-allowed;">
                    <i class="fas fa-check-circle"></i>
                </button>
                <span class="restored-badge">تم الاسترجاع</span>
            `;
        } else {
            restoreButton = `
                <button class="action-btn restore" title="استرجاع" onclick="restoreMember('${member.id}')">
                    <i class="fas fa-trash-restore"></i>
                </button>
            `;
        }
        
        tableHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${member.id}</td>
                <td>
                    <strong>${member.fullName}</strong>
                    <div style="font-size: 12px; color: var(--gray-dark); margin-top: 5px;">
                        العمر: ${member.age} | ${member.gender === 'male' ? 'ذكر' : 'أنثى'}
                    </div>
                </td>
                <td>${member.packageName}</td>
                <td>${formattedDate}</td>
                <td>
                    <strong>${member.deletedBy}</strong>
                    <div style="font-size: 12px; color: var(--gray-dark); margin-top: 5px;">
                        ${member.deletedById}
                    </div>
                </td>
                <td>${member.deletionReason || 'لا يوجد سبب'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view" title="عرض التفاصيل" onclick="viewDeletedMember('${member.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${restoreButton}
                        <button class="action-btn delete" title="حذف نهائي" onclick="permanentDelete('${member.id}')">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = tableHTML;
    console.log('تم تحديث جدول المحذوفات:', members.length, 'عنصر');
},
    
    // استرجاع عضو
   // تحديث دالة restoreMember في deleted-members.js
restoreMember: function(memberId) {
    console.log('محاولة استرجاع العضو:', memberId);
    
    const deletedMembers = this.getDeletedMembers();
    const memberIndex = deletedMembers.findIndex(m => m.id === memberId);
    
    if (memberIndex === -1) {
        this.showError('العضو غير موجود في السجلات المحذوفة');
        console.error('العضو غير موجود في السجلات المحذوفة:', memberId);
        return false;
    }
    
    const member = deletedMembers[memberIndex];
    
    // التحقق إذا كان العضو تم استرجاعه مسبقاً
    if (member.restored) {
        this.showError('هذا العضو تم استرجاعه مسبقاً');
        console.warn('العضو تم استرجاعه مسبقاً:', memberId);
        return false;
    }
    
    this.memberToRestore = member;
    
    // عرض مودال التأكيد
    const restoreMessage = document.getElementById('restoreMessage');
    if (restoreMessage) {
        restoreMessage.textContent = `هل تريد استرجاع العضو ${member.fullName}؟`;
    }
    
    this.openModal('restoreModal');
    return true;
},

// تأكيد الاسترجاع (دالة محسنة)
confirmRestore: function() {
    if (!this.memberToRestore) {
        this.showError('لا يوجد عضو محدد للاسترجاع');
        return;
    }
    
    console.log('تأكيد استرجاع العضو:', this.memberToRestore);
    
    const notes = document.getElementById('restoreNotes')?.value || '';
    const currentUser = usersModule.getCurrentUser();
    
    try {
        // 1. استرجاع العضو في النظام الرئيسي
        if (typeof membersModule !== 'undefined') {
            const members = membersModule.getAllMembers();
            const restoredMember = { ...this.memberToRestore };
            
            // إزالة بيانات الحذف
            delete restoredMember.deletedDate;
            delete restoredMember.deletedBy;
            delete restoredMember.deletedById;
            delete restoredMember.deletionReason;
            delete restoredMember.restored;
            delete restoredMember.restoredDate;
            delete restoredMember.restoredBy;
            delete restoredMember.restoreNotes;
            
            // إضافة العضو إلى القائمة
            members.push(restoredMember);
            
            // حفظ الأعضاء المحدثة
            membersModule.saveMembers(members);
            
            console.log('تم استرجاع العضو في النظام الرئيسي:', restoredMember);
            
            // إضافة نشاط الاسترجاع
            membersModule.addActivity({
                type: 'restore_member',
                title: `استرجاع عضو: ${restoredMember.fullName}`,
                details: `تم استرجاع العضو ${restoredMember.fullName} بواسطة ${currentUser?.name || 'مستخدم'}`,
                memberId: restoredMember.id,
                amount: 0,
                userId: currentUser?.username || 'unknown',
                timestamp: new Date().toLocaleString('ar-EG')
            });
            
            // إضافة إشعار
            membersModule.addNotification({
                type: 'restore_member',
                title: 'استرجاع عضو',
                message: `تم استرجاع العضو ${restoredMember.fullName}`,
                timestamp: new Date().toISOString(),
                read: false
            });
        } else {
            console.error('membersModule غير متوفر');
            this.showError('نظام الأعضاء غير متاح');
            return;
        }
        
        // 2. تحديث السجلات المحذوفة
        const deletedMembers = this.getDeletedMembers();
        const memberIndex = deletedMembers.findIndex(m => m.id === this.memberToRestore.id);
        
        if (memberIndex !== -1) {
            deletedMembers[memberIndex].restored = true;
            deletedMembers[memberIndex].restoredDate = new Date().toISOString();
            deletedMembers[memberIndex].restoredBy = currentUser?.name || 'مستخدم';
            deletedMembers[memberIndex].restoreNotes = notes;
            
            // حفظ التغييرات
            this.saveDeletedMembers(deletedMembers);
            console.log('تم تحديث سجل الحذف');
        }
        
        // 3. إغلاق المودال وتحديث الجدول
        this.closeModal('restoreModal');
        this.showSuccess(`تم استرجاع العضو ${this.memberToRestore.fullName} بنجاح`);
        
        // 4. تحديث الجدول بعد الاسترجاع
        this.loadDeletedMembers();
        
        // 5. إرسال إشعار لوحة التحكم
        if (typeof GymManagement !== 'undefined') {
            GymManagement.updateStats();
            GymManagement.updateNotificationBadge();
        }
        
        // 6. تنظيف البيانات المؤقتة
        this.memberToRestore = null;
        
        // 7. مسح حقل الملاحظات
        const restoreNotes = document.getElementById('restoreNotes');
        if (restoreNotes) {
            restoreNotes.value = '';
        }
        
        // 8. إعادة تحميل صفحة الأعضاء إذا كانت مفتوحة
        setTimeout(() => {
            if (window.opener && !window.opener.closed) {
                window.opener.location.reload();
            }
        }, 1000);
        
    } catch (error) {
        console.error('خطأ في استرجاع العضو:', error);
        this.showError(`حدث خطأ في استرجاع العضو: ${error.message}`);
    }
},
    
  // دالة الحذف النهائي المحسنة
permanentDelete: function(memberId) {
    console.log('محاولة حذف نهائي للعضو:', memberId);
    
    const deletedMembers = this.getDeletedMembers();
    const member = deletedMembers.find(m => m.id === memberId);
    
    if (!member) {
        this.showError('العضو غير موجود في السجلات المحذوفة');
        console.error('العضو غير موجود:', memberId);
        return;
    }
    
    // عرض نافذة تأكيد الحذف النهائي
    const confirmHTML = `
        <div class="modal-overlay active" id="permanentDeleteModal">
            <div class="modal" style="max-width: 500px;">
                <div class="modal-header" style="background: var(--danger); color: white;">
                    <h3 style="margin: 0; color: white;">
                        <i class="fas fa-exclamation-triangle"></i> حذف نهائي
                    </h3>
                    <button class="close-modal" onclick="document.getElementById('permanentDeleteModal').remove()">
                        <i class="fas fa-times" style="color: white;"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div style="text-align: center; margin: 20px 0;">
                        <i class="fas fa-skull-crossbones" style="font-size: 48px; color: var(--danger);"></i>
                        <h4 style="margin: 15px 0; color: var(--danger);">⚠️ تحذير: لا يمكن التراجع عن هذا الإجراء ⚠️</h4>
                    </div>
                    
                    <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-right: 4px solid #ffc107; margin-bottom: 20px;">
                        <p style="margin: 0; color: #856404;">
                            <i class="fas fa-exclamation-circle"></i>
                            <strong>تحذير:</strong> سيتم حذف العضو نهائياً من قاعدة البيانات دون إمكانية الاسترجاع.
                        </p>
                    </div>
                    
                    <div style="border: 1px solid var(--gray); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <h5 style="margin-top: 0; color: var(--text-dark);">معلومات العضو المراد حذفه:</h5>
                        <p><strong>الكود:</strong> ${member.id}</p>
                        <p><strong>الاسم:</strong> ${member.fullName}</p>
                        <p><strong>الباقة:</strong> ${member.packageName}</p>
                        <p><strong>تاريخ الحذف:</strong> ${new Date(member.deletedDate).toLocaleDateString('ar-EG')}</p>
                        <p><strong>سبب الحذف:</strong> ${member.deletionReason || 'لا يوجد سبب'}</p>
                    </div>
                    
                    <div class="form-group">
                        <label for="confirmDeleteText" style="color: var(--danger);">
                            <i class="fas fa-keyboard"></i> اكتب "نعم احذف" للتأكيد:
                        </label>
                        <input type="text" id="confirmDeleteText" 
                               placeholder="اكتب 'نعم احذف' هنا..." 
                               style="width: 100%; padding: 10px; border: 1px solid var(--danger); border-radius: 5px;"
                               oninput="checkDeleteConfirmation(this.value)">
                    </div>
                    
                    <div id="deleteConfirmationMessage" style="display: none; margin-top: 10px;">
                        <p style="color: var(--success);">
                            <i class="fas fa-check-circle"></i> تم تأكيد النص. يمكنك الآن الحذف النهائي.
                        </p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="document.getElementById('permanentDeleteModal').remove()">
                        <i class="fas fa-times"></i> إلغاء
                    </button>
                    <button id="confirmDeleteBtn" class="btn btn-danger" disabled onclick="deletedMembersModule.executePermanentDelete('${memberId}')">
                        <i class="fas fa-trash-alt"></i> حذف نهائي
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', confirmHTML);
},

// دالة تنفيذ الحذف النهائي
executePermanentDelete: function(memberId) {
    console.log('تنفيذ الحذف النهائي للعضو:', memberId);
    
    const deletedMembers = this.getDeletedMembers();
    const memberIndex = deletedMembers.findIndex(m => m.id === memberId);
    
    if (memberIndex === -1) {
        this.showError('العضو غير موجود');
        return;
    }
    
    const member = deletedMembers[memberIndex];
    
    try {
        // 1. حذف العضو من مصفوفة المحذوفات
        deletedMembers.splice(memberIndex, 1);
        
        // 2. حفظ المصفوفة المحدثة
        const success = this.saveDeletedMembers(deletedMembers);
        
        if (success) {
            // 3. إغلاق المودال
            const modal = document.getElementById('permanentDeleteModal');
            if (modal) modal.remove();
            
            // 4. عرض رسالة نجاح
            this.showSuccess(`تم الحذف النهائي للعضو ${member.fullName}`);
            
            // 5. إضافة نشاط الحذف النهائي
            if (typeof membersModule !== 'undefined') {
                const currentUser = usersModule.getCurrentUser();
                membersModule.addActivity({
                    type: 'permanent_delete',
                    title: `حذف نهائي: ${member.fullName}`,
                    details: `تم الحذف النهائي للعضو ${member.fullName} من السجلات المحذوفة`,
                    memberId: memberId,
                    amount: 0,
                    userId: currentUser?.username || 'unknown',
                    timestamp: new Date().toLocaleString('ar-EG')
                });
                
                // إضافة إشعار
                membersModule.addNotification({
                    type: 'permanent_delete',
                    title: 'حذف نهائي',
                    message: `تم الحذف النهائي للعضو ${member.fullName}`,
                    timestamp: new Date().toISOString(),
                    read: false
                });
            }
            
            // 6. تحديث الجدول
            this.loadDeletedMembers();
            
            // 7. تحديث الإشعارات
            this.updateNotificationBadge();
            
            console.log('تم الحذف النهائي بنجاح:', memberId);
            
            // 8. إعادة تحميل بعد تأخير قصير
            setTimeout(() => {
                this.loadDeletedMembers();
            }, 500);
            
        } else {
            this.showError('حدث خطأ أثناء الحذف النهائي');
        }
        
    } catch (error) {
        console.error('خطأ في الحذف النهائي:', error);
        this.showError(`حدث خطأ غير متوقع: ${error.message}`);
    }
},

// دالة التحقق من تأكيد النص
checkDeleteConfirmation: function(text) {
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    const messageDiv = document.getElementById('deleteConfirmationMessage');
    
    if (text.trim() === "نعم احذف") {
        confirmBtn.disabled = false;
        confirmBtn.style.opacity = "1";
        confirmBtn.style.cursor = "pointer";
        
        if (messageDiv) {
            messageDiv.style.display = "block";
        }
    } else {
        confirmBtn.disabled = true;
        confirmBtn.style.opacity = "0.5";
        confirmBtn.style.cursor = "not-allowed";
        
        if (messageDiv) {
            messageDiv.style.display = "none";
        }
    }
},
    
    // حذف جميع السجلات
 
    // دالة حذف جميع السجلات
clearAllDeleted: function() {
    const deletedMembers = this.getDeletedMembers();
    
    if (deletedMembers.length === 0) {
        this.showInfo('لا توجد سجلات محذوفة');
        return;
    }
    
    // عرض نافذة تأكيد الحذف الجماعي
    const confirmHTML = `
        <div class="modal-overlay active" id="clearAllModal">
            <div class="modal" style="max-width: 600px;">
                <div class="modal-header" style="background: var(--danger); color: white;">
                    <h3 style="margin: 0; color: white;">
                        <i class="fas fa-bomb"></i> حذف جميع السجلات
                    </h3>
                    <button class="close-modal" onclick="document.getElementById('clearAllModal').remove()">
                        <i class="fas fa-times" style="color: white;"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div style="text-align: center; margin: 20px 0;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: var(--danger);"></i>
                        <h3 style="color: var(--danger); margin: 15px 0;">⚠️ تحذير شديد ⚠️</h3>
                    </div>
                    
                    <div style="background: #f8d7da; padding: 15px; border-radius: 8px; border-right: 4px solid #dc3545; margin-bottom: 20px;">
                        <p style="margin: 0; color: #721c24;">
                            <i class="fas fa-radiation-alt"></i>
                            <strong>تحذير خطير:</strong> سيتم حذف <strong>${deletedMembers.length}</strong> سجل نهائياً دون إمكانية الاسترجاع.
                        </p>
                    </div>
                    
                    <div style="border: 1px solid var(--gray); padding: 15px; border-radius: 8px; margin-bottom: 20px; max-height: 200px; overflow-y: auto;">
                        <h5 style="margin-top: 0; color: var(--text-dark);">قائمة السجلات المراد حذفها:</h5>
                        <ul style="padding-right: 20px; margin: 0;">
                            ${deletedMembers.slice(0, 10).map(m => `
                                <li style="margin-bottom: 5px;">
                                    <strong>${m.fullName}</strong> (${m.id}) - ${m.packageName}
                                </li>
                            `).join('')}
                            ${deletedMembers.length > 10 ? `
                                <li style="color: var(--text-light); font-style: italic;">
                                    ... و ${deletedMembers.length - 10} سجل إضافي
                                </li>
                            ` : ''}
                        </ul>
                    </div>
                    
                    <div class="form-group">
                        <label for="confirmClearAllText" style="color: var(--danger);">
                            <i class="fas fa-keyboard"></i> اكتب "أحذف الكل" للتأكيد:
                        </label>
                        <input type="text" id="confirmClearAllText" 
                               placeholder="اكتب 'أحذف الكل' هنا..." 
                               style="width: 100%; padding: 10px; border: 1px solid var(--danger); border-radius: 5px;"
                               oninput="checkClearAllConfirmation(this.value)">
                    </div>
                    
                    <div id="clearAllConfirmationMessage" style="display: none; margin-top: 10px;">
                        <p style="color: var(--success);">
                            <i class="fas fa-check-circle"></i> تم تأكيد النص. يمكنك الآن حذف جميع السجلات.
                        </p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="document.getElementById('clearAllModal').remove()">
                        <i class="fas fa-times"></i> إلغاء
                    </button>
                    <button id="confirmClearAllBtn" class="btn btn-danger" disabled onclick="deletedMembersModule.executeClearAll()">
                        <i class="fas fa-bomb"></i> حذف جميع السجلات
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', confirmHTML);
},

// تنفيذ حذف جميع السجلات
executeClearAll: function() {
    console.log('تنفيذ حذف جميع السجلات');
    
    const deletedMembers = this.getDeletedMembers();
    const count = deletedMembers.length;
    
    if (count === 0) {
        this.showInfo('لا توجد سجلات محذوفة');
        return;
    }
    
    try {
        // 1. حذف جميع السجلات
        localStorage.removeItem('deletedMembers');
        
        // 2. إغلاق المودال
        const modal = document.getElementById('clearAllModal');
        if (modal) modal.remove();
        
        // 3. عرض رسالة نجاح
        this.showSuccess(`تم حذف جميع السجلات المحذوفة (${count} سجل)`);
        
        // 4. إضافة نشاط
        if (typeof membersModule !== 'undefined') {
            const currentUser = usersModule.getCurrentUser();
            membersModule.addActivity({
                type: 'clear_all_deleted',
                title: 'حذف جميع السجلات المحذوفة',
                details: `تم حذف ${count} سجل محذوف نهائياً`,
                memberId: null,
                amount: 0,
                userId: currentUser?.username || 'unknown',
                timestamp: new Date().toLocaleString('ar-EG')
            });
            
            // إضافة إشعار
            membersModule.addNotification({
                type: 'clear_all_deleted',
                title: 'حذف جميع السجلات',
                message: `تم حذف ${count} سجل محذوف نهائياً`,
                timestamp: new Date().toISOString(),
                read: false
            });
        }
        
        // 5. تحديث الجدول
        this.loadDeletedMembers();
        
        // 6. تحديث الإشعارات
        this.updateNotificationBadge();
        
        console.log('تم حذف جميع السجلات بنجاح');
        
    } catch (error) {
        console.error('خطأ في حذف جميع السجلات:', error);
        this.showError(`حدث خطأ غير متوقع: ${error.message}`);
    }
},

// دالة التحقق من تأكيد حذف الكل
checkClearAllConfirmation: function(text) {
    const confirmBtn = document.getElementById('confirmClearAllBtn');
    const messageDiv = document.getElementById('clearAllConfirmationMessage');
    
    if (text.trim() === "أحذف الكل") {
        confirmBtn.disabled = false;
        confirmBtn.style.opacity = "1";
        confirmBtn.style.cursor = "pointer";
        
        if (messageDiv) {
            messageDiv.style.display = "block";
        }
    } else {
        confirmBtn.disabled = true;
        confirmBtn.style.opacity = "0.5";
        confirmBtn.style.cursor = "not-allowed";
        
        if (messageDiv) {
            messageDiv.style.display = "none";
        }
    }
},
    // استرجاع جميع السجلات
    restoreAll: function() {
        const deletedMembers = this.getDeletedMembers();
        
        if (deletedMembers.length === 0) {
            this.showInfo('لا توجد سجلات محذوفة');
            return;
        }
        
        const notRestored = deletedMembers.filter(m => !m.restored);
        
        if (notRestored.length === 0) {
            this.showInfo('جميع السجلات تم استرجاعها مسبقاً');
            return;
        }
        
        this.showConfirmDialog(
            'استرجاع الكل',
            `هل تريد استرجاع جميع السجلات المحذوفة؟<br><small>سيتم استرجاع ${notRestored.length} سجل</small>`,
            () => {
                if (typeof membersModule !== 'undefined') {
                    const members = membersModule.getAllMembers();
                    const currentUser = usersModule.getCurrentUser();
                    
                    notRestored.forEach(member => {
                        const restoredMember = { ...member };
                        delete restoredMember.deletedDate;
                        delete restoredMember.deletedBy;
                        delete restoredMember.deletedById;
                        delete restoredMember.deletionReason;
                        delete restoredMember.restored;
                        delete restoredMember.restoredDate;
                        delete restoredMember.restoredBy;
                        delete restoredMember.restoreNotes;
                        
                        members.push(restoredMember);
                        
                        // تحديث سجل الحذف
                        const memberIndex = deletedMembers.findIndex(m => m.id === member.id);
                        if (memberIndex !== -1) {
                            deletedMembers[memberIndex].restored = true;
                            deletedMembers[memberIndex].restoredDate = new Date().toISOString();
                            deletedMembers[memberIndex].restoredBy = currentUser?.name || 'مستخدم';
                        }
                        
                        // إضافة نشاط
                        membersModule.addActivity({
                            type: 'restore_member',
                            title: `استرجاع عضو: ${restoredMember.fullName}`,
                            details: `تم استرجاع العضو ${restoredMember.fullName} بشكل جماعي`,
                            memberId: restoredMember.id,
                            amount: 0,
                            userId: currentUser?.username || 'unknown',
                            timestamp: new Date().toLocaleString('ar-EG')
                        });
                    });
                    
                    membersModule.saveMembers(members);
                    this.saveDeletedMembers(deletedMembers);
                    
                    this.showSuccess(`تم استرجاع ${notRestored.length} سجل بنجاح`);
                    this.loadDeletedMembers();
                }
            }
        );
    },
    
    // عرض تفاصيل العضو المحذوف
    viewDeletedMember: function(memberId) {
        const deletedMembers = this.getDeletedMembers();
        const member = deletedMembers.find(m => m.id === memberId);
        
        if (!member) {
            this.showError('العضو غير موجود');
            return;
        }
        
        const deletedDate = new Date(member.deletedDate);
        const formattedDate = deletedDate.toLocaleDateString('ar-EG', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const content = `
            <div style="line-height: 1.8;">
                <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 10px 0;">${member.fullName}</h4>
                    <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                        <div><strong>الكود:</strong> ${member.id}</div>
                        <div><strong>الباقة:</strong> ${member.packageName}</div>
                        <div><strong>الحالة:</strong> <span style="padding: 3px 10px; background: rgba(244, 67, 54, 0.1); color: #f44336; border-radius: 20px; font-size: 12px;">محذوف</span></div>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                    <div>
                        <h5 style="margin-top: 0; color: var(--primary-color);">معلومات العضو</h5>
                        <p><strong>الاسم:</strong> ${member.fullName}</p>
                        <p><strong>العمر:</strong> ${member.age}</p>
                        <p><strong>الجنس:</strong> ${member.gender === 'male' ? 'ذكر' : 'أنثى'}</p>
                        <p><strong>الهاتف:</strong> ${member.phone}</p>
                        ${member.email ? `<p><strong>البريد:</strong> ${member.email}</p>` : ''}
                    </div>
                    
                    <div>
                        <h5 style="margin-top: 0; color: var(--primary-color);">معلومات الاشتراك</h5>
                        <p><strong>الباقة:</strong> ${member.packageName}</p>
                        <p><strong>السعر:</strong> ${member.packagePrice} جنيه</p>
                        <p><strong>المدة:</strong> ${member.packageDuration} يوم</p>
                        <p><strong>تاريخ الانتهاء:</strong> ${member.endDate}</p>
                        <p><strong>طريقة الدفع:</strong> ${this.getPaymentMethodText(member.paymentMethod)}</p>
                    </div>
                    
                    <div>
                        <h5 style="margin-top: 0; color: var(--primary-color);">معلومات الحذف</h5>
                        <p><strong>تاريخ الحذف:</strong> ${formattedDate}</p>
                        <p><strong>تم الحذف بواسطة:</strong> ${member.deletedBy}</p>
                        <p><strong>معرف المستخدم:</strong> ${member.deletedById}</p>
                        <p><strong>سبب الحذف:</strong> ${member.deletionReason || 'لا يوجد سبب'}</p>
                        ${member.restored ? `
                            <p><strong>تم الاسترجاع:</strong> نعم</p>
                            <p><strong>تاريخ الاسترجاع:</strong> ${new Date(member.restoredDate).toLocaleDateString('ar-EG')}</p>
                            <p><strong>تم الاسترجاع بواسطة:</strong> ${member.restoredBy}</p>
                            ${member.restoreNotes ? `<p><strong>ملاحظات الاسترجاع:</strong> ${member.restoreNotes}</p>` : ''}
                        ` : ''}
                    </div>
                </div>
                
                ${member.notes ? `
                    <div style="margin-top: 20px; padding: 15px; background: #fff8e1; border-radius: 8px;">
                        <h5 style="margin-top: 0; color: var(--warning);">ملاحظات سابقة</h5>
                        <p>${member.notes}</p>
                    </div>
                ` : ''}
            </div>
        `;
        
        this.showCustomAlert('تفاصيل العضو المحذوف', content, 'info');
    },
    
    // البحث في السجلات المحذوفة
    setupEventListeners: function() {
        const searchInput = document.getElementById('searchDeleted');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchDeletedMembers(e.target.value);
            });
        }
    },
    
    // البحث
    searchDeletedMembers: function(query) {
        const deletedMembers = this.getDeletedMembers();
        const searchTerm = query.toLowerCase();
        
        const filtered = deletedMembers.filter(member => {
            return (
                member.id.toLowerCase().includes(searchTerm) ||
                member.fullName.toLowerCase().includes(searchTerm) ||
                member.phone.includes(searchTerm) ||
                member.deletedBy.toLowerCase().includes(searchTerm) ||
                (member.deletionReason && member.deletionReason.toLowerCase().includes(searchTerm))
            );
        });
        
        this.displayDeletedMembers(filtered);
    },
    
    // نصوص طرق الدفع
    getPaymentMethodText: function(method) {
        const methods = {
            'cash': 'كاش',
            'vodafone_cash': 'فودافون كاش',
            'instapay': 'انستا باي'
        };
        return methods[method] || method;
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
    closeModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    },
    
    // عرض رسائل
    showSuccess: function(message) {
        this.showCustomAlert('نجاح', message, 'success');
    },
    
    showError: function(message) {
        this.showCustomAlert('خطأ', message, 'error');
    },
    
    showInfo: function(message) {
        this.showCustomAlert('معلومة', message, 'info');
    },
    
    // عرض حوار تأكيد
    showConfirmDialog: function(title, message, onConfirm) {
        const dialogHTML = `
            <div class="modal-overlay active">
                <div class="modal">
                    <div class="modal-header">
                        <h3>${title}</h3>
                        <button class="close-modal" onclick="this.closest('.modal-overlay').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <p>${message}</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">إلغاء</button>
                        <button class="btn btn-primary" onclick="
                            this.closest('.modal-overlay').remove();
                            ${onConfirm.toString().replace(/"/g, '&quot;')}
                        ">موافق</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', dialogHTML);
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
            <div class="modal-overlay active">
                <div class="modal">
                    <div class="modal-header">
                        <h3>${title}</h3>
                        <button class="close-modal" onclick="this.closest('.modal-overlay').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div style="text-align: center; padding: 20px;">
                            <i class="fas ${iconClass[type]}" style="font-size: 48px; color: var(--${type}); margin-bottom: 20px;"></i>
                            <div>${message}</div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()">موافق</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', alertHTML);
    },
    
    // تحديث معلومات المستخدم
    updateUserInfo: function() {
        const currentUser = usersModule.getCurrentUser();
        
        if (currentUser) {
            const userName = document.getElementById('userName');
            const userRole = document.getElementById('userRole');
            const userAvatar = document.getElementById('userAvatar');
            const dropdownUserName = document.getElementById('dropdownUserName');
            
            if (userName) userName.textContent = currentUser.name || 'المستخدم';
            if (userRole) {
                const roleText = {
                    'admin': 'مسؤول',
                    'assistant': 'مساعد',
                    'viewer': 'متفرج'
                };
                userRole.textContent = roleText[currentUser.role] || currentUser.role;
            }
            if (userAvatar) userAvatar.textContent = currentUser.name ? currentUser.name.charAt(0) : 'م';
            if (dropdownUserName) dropdownUserName.textContent = currentUser.name || 'المستخدم';
        }
    },
    
    // تحديث شارة الإشعارات
    updateNotificationBadge: function() {
        if (typeof membersModule !== 'undefined') {
            const badge = document.getElementById('notificationBadge');
            if (badge) {
                const unreadCount = membersModule.getUnreadNotificationsCount();
                if (unreadCount > 0) {
                    badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                    badge.style.display = 'flex';
                } else {
                    badge.style.display = 'none';
                }
            }
        }
    }
};

// تهيئة الصفحة عند التحميل
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.sidebar')) {
        deletedMembersManager.init();
    }
});

// جعل الدوال متاحة عالمياً
window.restoreMember = function(memberId) {
    deletedMembersManager.restoreMember(memberId);
};

window.confirmRestore = function() {
    deletedMembersManager.confirmRestore();
};

window.viewDeletedMember = function(memberId) {
    deletedMembersManager.viewDeletedMember(memberId);
};

window.permanentDelete = function(memberId) {
    deletedMembersManager.permanentDelete(memberId);
};

window.clearAllDeleted = function() {
    deletedMembersManager.clearAllDeleted();
};

window.restoreAll = function() {
    deletedMembersManager.restoreAll();
};

window.closeModal = function(modalId) {
    deletedMembersManager.closeModal(modalId);
};

// تصدير الكائن
window.deletedMembersModule = deletedMembersManager;

// في نهاية ملف deleted-members.js
// جعل الدوال متاحة عالمياً
window.restoreMember = function(memberId) {
    console.log('استدعاء restoreMember:', memberId);
    return deletedMembersManager.restoreMember(memberId);
};

window.confirmRestore = function() {
    console.log('استدعاء confirmRestore');
    deletedMembersManager.confirmRestore();
};

window.viewDeletedMember = function(memberId) {
    console.log('استدعاء viewDeletedMember:', memberId);
    deletedMembersManager.viewDeletedMember(memberId);
};

window.permanentDelete = function(memberId) {
    console.log('استدعاء permanentDelete:', memberId);
    deletedMembersManager.permanentDelete(memberId);
};

window.clearAllDeleted = function() {
    console.log('استدعاء clearAllDeleted');
    deletedMembersManager.clearAllDeleted();
};

window.restoreAll = function() {
    console.log('استدعاء restoreAll');
    deletedMembersManager.restoreAll();
};

window.closeModal = function(modalId) {
    console.log('استدعاء closeModal:', modalId);
    deletedMembersManager.closeModal(modalId);
};

// دالة المساعدة للتحقق
window.checkDeleteConfirmation = function(text) {
    deletedMembersManager.checkDeleteConfirmation(text);
};

window.checkClearAllConfirmation = function(text) {
    deletedMembersManager.checkClearAllConfirmation(text);
};

// دالة اختبار للأزرار
window.testDeleteButtons = function() {
    console.log('=== اختبار أزرار الحذف ===');
    
    // اختبار وجود الأعضاء المحذوفين
    const deletedMembers = deletedMembersManager.getDeletedMembers();
    console.log('عدد الأعضاء المحذوفين:', deletedMembers.length);
    
    if (deletedMembers.length > 0) {
        const testMember = deletedMembers[0];
        console.log('العضو الأول:', {
            id: testMember.id,
            name: testMember.fullName,
            restored: testMember.restored
        });
        
        // اختبار زر الحذف النهائي
        console.log('اختبار permanentDelete للعضو:', testMember.id);
        permanentDelete(testMember.id);
    } else {
        console.log('لا توجد أعضاء محذوفة للاختبار');
    }
};