// ข้อมูลผู้ใช้เริ่มต้น
const defaultUsers = [
    {
        "user_id": "ttb_yj",
        "role": "Master",
        "full_name_en": "Yannapat Jaruwongpaiboon",
        "full_name_th": "ญาณภัทร จารุวงศ์ไพบูลย์",
        "email_personal": "yannapat.prudential@gmail.com",
        "password": "Hellowelcome",
        "status": "active"
    },
    {
        "user_id": "ttb_ac",
        "role": "Admin",
        "full_name_en": "Ananya Chantaraman",
        "full_name_th": "อนัญญา จันทรมาน",
        "email_personal": "Ananyacha10@gmail.com",
        "password": "Hellowelcome",
        "status": "active"
    },
    {
        "user_id": "ttb_sp",
        "role": "Admin",
        "full_name_en": "Supaporn Plapblee",
        "full_name_th": "สุภาภร พลับพลี",
        "email_personal": "jibjib1981.SP@gmail.com",
        "password": "Hellowelcome",
        "status": "active"
    },
    {
        "user_id": "ttb_ap",
        "role": "Member",
        "full_name_en": "Alongkorn Pooim",
        "full_name_th": "อลงกรณ์ ภู่อิ่ม",
        "email_personal": "korn.ak28@gmail.com",
        "password": "Hellowelcome",
        "status": "active"
    },
    {
        "user_id": "ttb_as",
        "role": "Member",
        "full_name_en": "Arthaphan Suwanpraditt",
        "full_name_th": "อรรถพันธ์ สุวรรณประดิษฐ์",
        "email_personal": "arthaphs@gmail.com",
        "password": "Hellowelcome",
        "status": "active"
    },
    {
        "user_id": "ttb_np",
        "role": "Member",
        "full_name_en": "Nantida Pinhirun",
        "full_name_th": "นันทิดา ปิ่นหิรัญ",
        "email_personal": "nantidapin6395@gmail.com",
        "password": "Hellowelcome",
        "status": "active"
    },
    {
        "user_id": "ttb_nj",
        "role": "Member",
        "full_name_en": "Natkanit Jariyadilok",
        "full_name_th": "ณัฐกนิษฐ์ จริยะดิลก",
        "email_personal": "natkanitjariyadilok@gmail.com",
        "password": "Hellowelcome",
        "status": "active"
    },
    {
        "user_id": "ttb_pp",
        "role": "Member",
        "full_name_en": "Pachara Phattaratrirakul",
        "full_name_th": "ภชร ภัทรธีรกุล",
        "email_personal": "greatkaloo@gmail.com",
        "password": "Hellowelcome",
        "status": "active"
    },
    {
        "user_id": "ttb_pn",
        "role": "Member",
        "full_name_en": "Patchareeya Nopwinyuwong",
        "full_name_th": "พัชรียา นพวินญูวงค์",
        "email_personal": "patchareeya.n0412@gmail.com",
        "password": "Hellowelcome",
        "status": "active"
    },
    {
        "user_id": "ttb_sd",
        "role": "Member",
        "full_name_en": "Suksawad Ditsumrueng",
        "full_name_th": "สุขสวัสดิ์ ดิษสำเริง",
        "email_personal": "Wad008.dd@gmail.com",
        "password": "Hellowelcome",
        "status": "active"
    },
    {
        "user_id": "ttb_sk",
        "role": "Member",
        "full_name_en": "Supat Koonkitti",
        "full_name_th": "สุพัฒน์ คุณกิตติ",
        "email_personal": "Supat.koonkitti@gmail.com",
        "password": "Hellowelcome",
        "status": "active"
    },
    {
        "user_id": "ttb_tt",
        "role": "Member",
        "full_name_en": "Thanayot Thiamsawat",
        "full_name_th": "ธนยศ เทียมเศวษ",
        "email_personal": "thanayot.calendar@gmail.com",
        "password": "Hellowelcome",
        "status": "active"
    },
    {
        "user_id": "ttb_wc",
        "role": "Member",
        "full_name_en": "Wattanapan Chaipool",
        "full_name_th": "วัฒนพันธ์ ชัยพูล",
        "email_personal": "wattanapan.ch@gmail.com",
        "password": "Hellowelcome",
        "status": "active"
    }
];

// ตรวจสอบว่าอยู่ในหน้า login หรือไม่
if (window.location.pathname.includes('login.html') || window.location.pathname === '/login.html') {
    // ระบบล็อกอิน
    document.addEventListener('DOMContentLoaded', function() {
        // ตรวจสอบว่ามีผู้ใช้ล็อกอินอยู่แล้วหรือไม่
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            window.location.href = 'index.html';
            return;
        }

        // ตั้งค่า users ใน localStorage ถ้ายังไม่มี
        if (!localStorage.getItem('trainer_users')) {
            localStorage.setItem('trainer_users', JSON.stringify(defaultUsers));
        }

        // จัดการฟอร์มล็อกอิน
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const userId = document.getElementById('loginUserId').value;
            const password = document.getElementById('loginPassword').value;
            
            if (!userId || !password) {
                alert('กรุณากรอก User ID และรหัสผ่าน');
                return;
            }
            
            const storedUsers = JSON.parse(localStorage.getItem('trainer_users'));
            const user = storedUsers.find(u => u.user_id === userId && u.password === password && u.status === 'active');
            
            if (user) {
                // บันทึกข้อมูลผู้ใช้ปัจจุบัน
                localStorage.setItem('currentUser', JSON.stringify(user));
                
                // Redirect ไปหน้าแดชบอร์ด
                window.location.href = 'index.html';
            } else {
                alert('User ID หรือรหัสผ่านไม่ถูกต้อง');
            }
        });
    });
}

// ฟังก์ชันสำหรับแสดงฟอร์มลืมรหัสผ่าน
function showForgotPassword() {
    document.getElementById('forgotPasswordModal').style.display = 'block';
}

// ฟังก์ชันปิดฟอร์มลืมรหัสผ่าน
function closeForgotPasswordModal() {
    document.getElementById('forgotPasswordModal').style.display = 'none';
    document.getElementById('forgotPasswordUserId').value = '';
}

// ฟังก์ชันขอรีเซ็ตรหัสผ่าน
function requestPasswordReset() {
    const userId = document.getElementById('forgotPasswordUserId').value;
    
    if (!userId) {
        alert('กรุณากรอก User ID');
        return;
    }
    
    const storedUsers = JSON.parse(localStorage.getItem('trainer_users'));
    const user = storedUsers.find(u => u.user_id === userId);
    
    if (!user) {
        alert('ไม่พบ User ID นี้ในระบบ');
        return;
    }
    
    // ในระบบจริงควรส่งอีเมล์แจ้ง Admin
    // แต่ในที่นี้เราจะจำลองโดยบันทึกคำขอรีเซ็ตรหัสผ่าน
    const resetRequests = JSON.parse(localStorage.getItem('passwordResetRequests')) || [];
    resetRequests.push({
        user_id: userId,
        requested_at: new Date().toISOString(),
        status: 'pending'
    });
    
    localStorage.setItem('passwordResetRequests', JSON.stringify(resetRequests));
    
    alert('ส่งคำขอรีเซ็ตรหัสผ่านเรียบร้อยแล้ว! ผู้ดูแลระบบจะดำเนินการรีเซ็ตให้คุณ');
    closeForgotPasswordModal();
}

// ฟังก์ชันออกจากระบบ
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}