// ข้อมูลการจองและแจ้งเตือน
let bookings = JSON.parse(localStorage.getItem('trainerBookings')) || [];
let notifications = JSON.parse(localStorage.getItem('trainerNotifications')) || [];

// ฟังก์ชันเริ่มต้นระบบ
document.addEventListener('DOMContentLoaded', function() {
    // ตรวจสอบการล็อกอิน
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // แสดงข้อมูลผู้ใช้
    displayUserInfo();
    
    // ตั้งค่าหน้าตาม role
    setupRoleBasedUI();
    
    // โหลดข้อมูลเริ่มต้น
    initializeSystem();
});

// แสดงข้อมูลผู้ใช้
function displayUserInfo() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        document.getElementById('userName').textContent = currentUser.full_name_th;
        document.getElementById('userRole').textContent = getRoleDisplayName(currentUser.role);
        document.getElementById('userAvatar').textContent = currentUser.full_name_th.substring(0, 2);
    }
}

// ตั้งค่า UI ตาม role
function setupRoleBasedUI() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (currentUser.role === 'Member') {
        // สำหรับเทรนเนอร์
        document.getElementById('addBookingBtn').style.display = 'none';
        document.getElementById('quickBookingBtn').style.display = 'none';
        document.getElementById('sampleDataBtn').style.display = 'none';
        document.getElementById('clearDataBtn').style.display = 'none';
        document.getElementById('adminSettings').style.display = 'none';
        
        // แสดงมุมมองเทรนเนอร์
        showTrainerView();
    } else {
        // สำหรับ Admin/Master
        document.getElementById('notificationBell').style.display = 'flex';
        document.getElementById('adminSettings').style.display = 'block';
        
        // แสดงแดชบอร์ดปกติ
        showDashboard();
    }
    
    updateNotificationCount();
}

// เริ่มต้นระบบ
function initializeSystem() {
    displayCurrentDate();
    initializeSchedule();
    populateTrainerSelect();
    updateStats();
    displayTrainerList();
    
    // ตั้งค่า date picker เป็นวันนี้
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('scheduleDate').value = today;
    document.getElementById('bookingDate').value = today;
    document.getElementById('availabilityDate').value = today;
    document.getElementById('dailyReportDate').value = today;
    
    // เพิ่ม event listener สำหรับการเปลี่ยนวันที่ในตาราง
    document.getElementById('scheduleDate').addEventListener('change', function() {
        displaySchedule();
    });
}

// แสดงวันที่ปัจจุบัน
function displayCurrentDate() {
    const now = new Date();
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    };
    document.getElementById('currentDate').textContent = 
        now.toLocaleDateString('th-TH', options);
}

// เริ่มต้นตารางเวลา
function initializeSchedule() {
    generateTimeSlots();
    displaySchedule();
}

// สร้างช่วงเวลาในตาราง
function generateTimeSlots() {
    const timeSlotsContainer = document.getElementById('timeSlots');
    timeSlotsContainer.innerHTML = '';
    
    for (let hour = 9; hour <= 17; hour++) {
        const timeSlot = document.createElement('div');
        timeSlot.className = 'time-slot';
        timeSlot.textContent = `${hour}:00`;
        timeSlotsContainer.appendChild(timeSlot);
    }
}

// แสดงตารางเวลาของเทรนเนอร์
function displaySchedule() {
    const scheduleBody = document.getElementById('scheduleBody');
    const selectedDate = document.getElementById('scheduleDate').value;
    
    scheduleBody.innerHTML = '';
    
    // ดึงข้อมูลผู้ใช้
    const storedUsers = JSON.parse(localStorage.getItem('trainer_users'));
    
    // แสดงเฉพาะ Member (เทรนเนอร์)
    const trainers = storedUsers.filter(user => user.role === 'Member' && user.status === 'active');
    
    trainers.forEach(trainer => {
        const scheduleRow = document.createElement('div');
        scheduleRow.className = 'schedule-row';
        
        // ข้อมูลเทรนเนอร์
        const trainerInfo = document.createElement('div');
        trainerInfo.className = 'trainer-info';
        
        const avatar = document.createElement('div');
        avatar.className = 'trainer-avatar';
        avatar.textContent = trainer.full_name_th.substring(0, 2);
        
        const details = document.createElement('div');
        details.className = 'trainer-details';
        
        const name = document.createElement('h4');
        name.textContent = trainer.full_name_th;
        
        const role = document.createElement('span');
        role.className = 'role';
        role.textContent = 'เทรนเนอร์';
        
        details.appendChild(name);
        details.appendChild(role);
        trainerInfo.appendChild(avatar);
        trainerInfo.appendChild(details);
        
        // ช่องเวลา
        const scheduleSlots = document.createElement('div');
        scheduleSlots.className = 'schedule-slots';
        
        for (let hour = 9; hour <= 17; hour++) {
            const timeSlot = document.createElement('div');
            const timeString = `${hour.toString().padStart(2, '0')}:00`;
            
            timeSlot.setAttribute('data-trainer', trainer.user_id);
            timeSlot.setAttribute('data-time', timeString);
            timeSlot.setAttribute('data-date', selectedDate);
            
            // ตรวจสอบว่าช่วงเวลานี้มีการจองหรือไม่
            const isBooked = bookings.some(booking => 
                booking.trainer_id === trainer.user_id &&
                booking.date === selectedDate &&
                isTimeInRange(timeString, booking.start_time, booking.end_time) &&
                booking.status === 'confirmed'
            );
            
            if (isBooked) {
                timeSlot.className = 'schedule-slot booked';
                timeSlot.title = 'มีการจองแล้ว';
                timeSlot.onclick = null;
            } else {
                timeSlot.className = 'schedule-slot available';
                timeSlot.title = 'ว่าง - คลิกเพื่อจอง';
                timeSlot.onclick = () => quickBook(trainer.user_id, selectedDate, timeString);
            }
            
            scheduleSlots.appendChild(timeSlot);
        }
        
        scheduleRow.appendChild(trainerInfo);
        scheduleRow.appendChild(scheduleSlots);
        scheduleBody.appendChild(scheduleRow);
    });
}

// ตรวจสอบว่าเวลาอยู่ในช่วงที่จองหรือไม่
function isTimeInRange(time, startTime, endTime) {
    const timeMinutes = convertTimeToMinutes(time);
    const startMinutes = convertTimeToMinutes(startTime);
    const endMinutes = convertTimeToMinutes(endTime);
    
    return timeMinutes >= startMinutes && timeMinutes < endMinutes;
}

// แปลงเวลาเป็นนาทีสำหรับการเปรียบเทียบ
function convertTimeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

// จองแบบเร็ว
function quickBook(trainerId, date, time) {
    const storedUsers = JSON.parse(localStorage.getItem('trainer_users'));
    const trainer = storedUsers.find(m => m.user_id === trainerId);
    
    if (confirm(`ต้องการจอง ${trainer.full_name_th} ในวันที่ ${formatDateDisplay(date)} เวลา ${time} ใช่หรือไม่?`)) {
        document.getElementById('trainerSelect').value = trainerId;
        document.getElementById('bookingDate').value = date;
        document.getElementById('startTime').value = time;
        
        // คำนวณเวลาสิ้นสุด (1 ชั่วโมงหลัง)
        const endTime = calculateEndTime(time, 1);
        document.getElementById('endTime').value = endTime;
        
        showBookingForm();
    }
}

// คำนวณเวลาสิ้นสุด
function calculateEndTime(startTime, durationHours) {
    const [hours, minutes] = startTime.split(':').map(Number);
    let endHours = hours + durationHours;
    
    // จัดรูปแบบให้เป็น HH:MM
    return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// แสดงแดชบอร์ด
function showDashboard() {
    document.getElementById('dashboardContent').style.display = 'block';
    document.getElementById('trainerView').style.display = 'none';
    document.getElementById('pageTitle').textContent = 'ยินดีต้อนรับกลับ!';
    document.getElementById('pageDescription').textContent = 'จัดการตารางงานเทรนเนอร์ทั้งหมดของคุณ';
    
    updateStats();
    displaySchedule();
    displayTrainerList();
}

// แสดงมุมมองเทรนเนอร์
function showTrainerView() {
    document.getElementById('dashboardContent').style.display = 'none';
    document.getElementById('trainerView').style.display = 'block';
    document.getElementById('pageTitle').textContent = 'ตารางงานของฉัน';
    document.getElementById('pageDescription').textContent = 'จัดการตารางงานส่วนตัวของคุณ';
    
    displayPersonalSchedule();
    displayPendingTasks();
}

// แสดงตารางงานส่วนตัวของเทรนเนอร์
function displayPersonalSchedule() {
    const personalSchedule = document.getElementById('personalSchedule');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    personalSchedule.innerHTML = '';
    
    // ดึงการจองของเทรนเนอร์นี้
    const trainerBookings = bookings.filter(booking => 
        booking.trainer_id === currentUser.user_id && 
        booking.status === 'confirmed'
    );
    
    if (trainerBookings.length === 0) {
        personalSchedule.innerHTML = '<p style="text-align: center; color: #7f8c8d; padding: 2rem;">ไม่มีตารางงานในขณะนี้</p>';
        return;
    }
    
    // จัดกลุ่มการจองตามวันที่
    const bookingsByDate = {};
    trainerBookings.forEach(booking => {
        if (!bookingsByDate[booking.date]) {
            bookingsByDate[booking.date] = [];
        }
        bookingsByDate[booking.date].push(booking);
    });
    
    // แสดงการจองเรียงตามวันที่
    Object.keys(bookingsByDate).sort().forEach(date => {
        const dayCard = document.createElement('div');
        dayCard.className = 'personal-schedule-day';
        
        const dateHeader = document.createElement('h4');
        dateHeader.textContent = formatDateDisplay(date);
        dayCard.appendChild(dateHeader);
        
        bookingsByDate[date].forEach(booking => {
            const scheduleItem = document.createElement('div');
            scheduleItem.className = 'schedule-item';
            
            const timeDiv = document.createElement('div');
            timeDiv.className = 'schedule-time';
            timeDiv.textContent = `${booking.start_time} - ${booking.end_time}`;
            
            const topicDiv = document.createElement('div');
            topicDiv.className = 'schedule-topic';
            topicDiv.textContent = booking.topic;
            
            const statusDiv = document.createElement('div');
            statusDiv.className = 'schedule-status status-confirmed';
            statusDiv.textContent = 'ยืนยันแล้ว';
            
            scheduleItem.appendChild(timeDiv);
            scheduleItem.appendChild(topicDiv);
            scheduleItem.appendChild(statusDiv);
            dayCard.appendChild(scheduleItem);
        });
        
        personalSchedule.appendChild(dayCard);
    });
}

// แสดงงานที่รอดำเนินการสำหรับเทรนเนอร์
function displayPendingTasks() {
    const pendingTasks = document.getElementById('pendingTasks');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    pendingTasks.innerHTML = '';
    
    // ดึงการจองที่รอการตอบรับ
    const pendingBookings = bookings.filter(booking => 
        booking.trainer_id === currentUser.user_id && 
        booking.status === 'pending'
    );
    
    if (pendingBookings.length === 0) {
        pendingTasks.innerHTML = '<p style="text-align: center; color: #7f8c8d; padding: 2rem;">ไม่มีงานที่รอดำเนินการ</p>';
        return;
    }
    
    pendingBookings.forEach(booking => {
        const taskCard = document.createElement('div');
        taskCard.className = 'pending-task';
        
        const taskHeader = document.createElement('div');
        taskHeader.className = 'pending-task-header';
        
        const taskInfo = document.createElement('div');
        
        const title = document.createElement('div');
        title.className = 'pending-task-title';
        title.textContent = booking.topic;
        
        const date = document.createElement('div');
        date.className = 'pending-task-date';
        date.textContent = `${formatDateDisplay(booking.date)} | ${booking.start_time} - ${booking.end_time}`;
        
        const type = document.createElement('div');
        type.className = 'pending-task-date';
        type.textContent = `ประเภท: ${booking.type} | รูปแบบ: ${booking.format}`;
        
        taskInfo.appendChild(title);
        taskInfo.appendChild(date);
        taskInfo.appendChild(type);
        
        const taskActions = document.createElement('div');
        taskActions.className = 'pending-task-actions';
        
        const acceptBtn = document.createElement('button');
        acceptBtn.className = 'btn-primary';
        acceptBtn.textContent = 'รับงาน';
        acceptBtn.onclick = () => respondToBooking(booking.id, 'accepted');
        
        const rejectBtn = document.createElement('button');
        rejectBtn.className = 'btn-secondary';
        rejectBtn.textContent = 'ปฏิเสธ';
        rejectBtn.onclick = () => respondToBooking(booking.id, 'rejected');
        
        taskActions.appendChild(acceptBtn);
        taskActions.appendChild(rejectBtn);
        
        taskHeader.appendChild(taskInfo);
        taskHeader.appendChild(taskActions);
        
        const details = document.createElement('div');
        details.style.marginTop = '1rem';
        details.style.color = '#7f8c8d';
        details.textContent = booking.details || 'ไม่มีรายละเอียดเพิ่มเติม';
        
        taskCard.appendChild(taskHeader);
        taskCard.appendChild(details);
        
        pendingTasks.appendChild(taskCard);
    });
}

// ตอบกลับการจอง (สำหรับเทรนเนอร์)
function respondToBooking(bookingId, response) {
    if (response === 'accepted') {
        const booking = bookings.find(b => b.id === bookingId);
        booking.status = 'confirmed';
        
        // ส่งการแจ้งเตือนไปยัง Admin
        createNotification(
            'admin',
            'เทรนเนอร์ตอบรับงานแล้ว',
            `${getCurrentUser().full_name_th} ได้ตอบรับงาน "${booking.topic}" ในวันที่ ${formatDateDisplay(booking.date)}`
        );
        
        alert('ตอบรับงานเรียบร้อยแล้ว!');
        
        // อัพเดตข้อมูล
        localStorage.setItem('trainerBookings', JSON.stringify(bookings));
        displayPersonalSchedule();
        displayPendingTasks();
        updateNotificationCount();
    } else {
        // สำหรับการปฏิเสธ เปิด modal เพื่อกรอกเหตุผล
        const booking = bookings.find(b => b.id === bookingId);
        document.getElementById('responseModal').style.display = 'block';
        document.getElementById('responseStatus').value = 'rejected';
        
        // แสดงรายละเอียดการจอง
        document.getElementById('responseDetails').innerHTML = `
            <div class="booking-details">
                <h4>รายละเอียดงาน</h4>
                <p><strong>หัวข้อ:</strong> ${booking.topic}</p>
                <p><strong>วันที่:</strong> ${formatDateDisplay(booking.date)}</p>
                <p><strong>เวลา:</strong> ${booking.start_time} - ${booking.end_time}</p>
                <p><strong>ประเภท:</strong> ${booking.type}</p>
                <p><strong>รูปแบบ:</strong> ${booking.format}</p>
            </div>
        `;
        
        // เก็บ bookingId สำหรับใช้เมื่อส่งคำตอบ
        document.getElementById('responseModal').setAttribute('data-booking-id', bookingId);
        
        // แสดง/ซ่อนเหตุผลการปฏิเสธ
        document.getElementById('responseStatus').addEventListener('change', function() {
            document.getElementById('rejectionReasonGroup').style.display = 
                this.value === 'rejected' ? 'block' : 'none';
        });
    }
}

// ส่งคำตอบการจอง
function submitResponse() {
    const bookingId = document.getElementById('responseModal').getAttribute('data-booking-id');
    const status = document.getElementById('responseStatus').value;
    const rejectionReason = document.getElementById('rejectionReason').value;
    
    const booking = bookings.find(b => b.id === bookingId);
    
    if (status === 'rejected') {
        if (!rejectionReason) {
            alert('กรุณาระบุเหตุผลการปฏิเสธ');
            return;
        }
        
        booking.status = 'rejected';
        booking.rejection_reason = rejectionReason;
        
        // ส่งการแจ้งเตือนไปยัง Admin
        createNotification(
            'admin',
            'เทรนเนอร์ปฏิเสธงาน',
            `${getCurrentUser().full_name_th} ได้ปฏิเสธงาน "${booking.topic}" ด้วยเหตุผล: ${rejectionReason}`
        );
        
        alert('ปฏิเสธงานเรียบร้อยแล้ว!');
    }
    
    closeResponseModal();
    
    // อัพเดตข้อมูล
    localStorage.setItem('trainerBookings', JSON.stringify(bookings));
    displayPersonalSchedule();
    displayPendingTasks();
    updateNotificationCount();
}

// แสดงฟอร์มการจอง
function showBookingForm() {
    document.getElementById('bookingModal').style.display = 'block';
}

// ปิด modal
function closeModal() {
    document.getElementById('bookingModal').style.display = 'none';
    document.getElementById('bookingForm').reset();
}

// ปิด modal ตรวจสอบความว่าง
function closeAvailabilityModal() {
    document.getElementById('availabilityModal').style.display = 'none';
    document.getElementById('availabilityResult').style.display = 'none';
}

// ปิด modal จัดการเทรนเนอร์
function closeTrainerModal() {
    document.getElementById('trainerModal').style.display = 'none';
}

// ปิด modal ตอบกลับ
function closeResponseModal() {
    document.getElementById('responseModal').style.display = 'none';
    document.getElementById('rejectionReason').value = '';
}

// เติมข้อมูลเทรนเนอร์ใน dropdown
function populateTrainerSelect() {
    const select = document.getElementById('trainerSelect');
    const storedUsers = JSON.parse(localStorage.getItem('trainer_users'));
    
    select.innerHTML = '<option value="">-- เลือกเทรนเนอร์ --</option>';
    
    // เติมเฉพาะ Member (เทรนเนอร์) ที่ active
    const trainers = storedUsers.filter(user => user.role === 'Member' && user.status === 'active');
    
    trainers.forEach(trainer => {
        const option = document.createElement('option');
        option.value = trainer.user_id;
        option.textContent = trainer.full_name_th;
        select.appendChild(option);
    });
}

// จัดการฟอร์มการจอง
document.getElementById('bookingForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const trainerId = document.getElementById('trainerSelect').value;
    const date = document.getElementById('bookingDate').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const topic = document.getElementById('trainingTopic').value;
    const type = document.getElementById('trainingType').value;
    const format = document.getElementById('trainingFormat').value;
    const details = document.getElementById('trainingDetails').value;
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!trainerId || !date || !startTime || !endTime || !topic) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
    }
    
    // ตรวจสอบว่าเวลาเริ่มต้นน้อยกว่าเวลาสิ้นสุด
    if (convertTimeToMinutes(startTime) >= convertTimeToMinutes(endTime)) {
        alert('เวลาเริ่มต้นต้องน้อยกว่าเวลาสิ้นสุด');
        return;
    }
    
    const formData = {
        id: Date.now().toString(),
        trainer_id: trainerId,
        date: date,
        start_time: startTime,
        end_time: endTime,
        topic: topic,
        type: type,
        format: format,
        details: details,
        status: 'pending', // เปลี่ยนเป็น pending เพื่อให้เทรนเนอร์ตอบรับ
        created_at: new Date().toISOString()
    };
    
    // ตรวจสอบความว่างก่อนจอง
    if (!isTrainerAvailable(formData.trainer_id, formData.date, formData.start_time, formData.end_time)) {
        alert('เทรนเนอร์ไม่ว่างในช่วงเวลาที่เลือก กรุณาเลือกเวลาใหม่');
        return;
    }
    
    bookings.push(formData);
    localStorage.setItem('trainerBookings', JSON.stringify(bookings));
    
    // ส่งการแจ้งเตือนไปยังเทรนเนอร์
    const storedUsers = JSON.parse(localStorage.getItem('trainer_users'));
    const trainer = storedUsers.find(u => u.user_id === trainerId);
    
    createNotification(
        trainerId, // ส่งถึงเทรนเนอร์โดยตรง
        'มีงานใหม่รอการตอบรับ',
        `มีงาน "${topic}" ในวันที่ ${formatDateDisplay(date)} เวลา ${startTime}-${endTime} รอการตอบรับจากคุณ`
    );
    
    alert('ส่งคำขอกำหนดตารางงานเรียบร้อยแล้ว! รอการตอบรับจากเทรนเนอร์');
    closeModal();
    updateStats();
    displaySchedule();
    displayTrainerList();
    updateNotificationCount();
});

// ตรวจสอบความว่างของเทรนเนอร์
function isTrainerAvailable(trainerId, date, startTime, endTime) {
    const startMinutes = convertTimeToMinutes(startTime);
    const endMinutes = convertTimeToMinutes(endTime);
    
    return !bookings.some(booking => 
        booking.trainer_id === trainerId &&
        booking.date === date &&
        booking.status === 'confirmed' &&
        (
            (startMinutes >= convertTimeToMinutes(booking.start_time) && startMinutes < convertTimeToMinutes(booking.end_time)) ||
            (endMinutes > convertTimeToMinutes(booking.start_time) && endMinutes <= convertTimeToMinutes(booking.end_time)) ||
            (startMinutes <= convertTimeToMinutes(booking.start_time) && endMinutes >= convertTimeToMinutes(booking.end_time))
        )
    );
}

// อัพเดตสถิติ
function updateStats() {
    const today = new Date().toISOString().split('T')[0];
    const storedUsers = JSON.parse(localStorage.getItem('trainer_users'));
    
    // นับเทรนเนอร์ทั้งหมด (เฉพาะ Member ที่ active)
    const totalTrainers = storedUsers.filter(user => user.role === 'Member' && user.status === 'active').length;
    document.getElementById('totalTrainers').textContent = totalTrainers;
    
    // นับเทรนเนอร์ที่ว่างในวันนี้
    const availableToday = storedUsers.filter(user => 
        user.role === 'Member' && 
        user.status === 'active' &&
        !bookings.some(booking => 
            booking.trainer_id === user.user_id && 
            booking.date === today &&
            booking.status === 'confirmed'
        )
    ).length;
    
    document.getElementById('availableToday').textContent = availableToday;
    document.getElementById('totalBookings').textContent = bookings.filter(b => b.status === 'confirmed').length;
    
    // นับคำขอที่รอดำเนินการ
    document.getElementById('pendingRequests').textContent = 
        bookings.filter(b => b.status === 'pending').length;
}

// แสดงรายชื่อเทรนเนอร์
function displayTrainerList() {
    const trainerList = document.getElementById('trainerList');
    const today = new Date().toISOString().split('T')[0];
    const storedUsers = JSON.parse(localStorage.getItem('trainer_users'));
    
    trainerList.innerHTML = '';
    
    const trainers = storedUsers.filter(user => user.role === 'Member' && user.status === 'active');
    
    trainers.forEach(trainer => {
        const listItem = document.createElement('div');
        listItem.className = 'trainer-list-item';
        
        const avatar = document.createElement('div');
        avatar.className = 'trainer-avatar';
        avatar.textContent = trainer.full_name_th.substring(0, 2);
        
        const details = document.createElement('div');
        details.className = 'trainer-details';
        
        const name = document.createElement('h4');
        name.textContent = trainer.full_name_th;
        name.style.fontSize = '0.9rem';
        name.style.marginBottom = '0.25rem';
        
        const email = document.createElement('p');
        email.textContent = trainer.email_personal;
        email.style.fontSize = '0.7rem';
        email.style.color = '#7f8c8d';
        
        details.appendChild(name);
        details.appendChild(email);
        
        const status = document.createElement('div');
        
        // ตรวจสอบสถานะ (ว่าง/ไม่ว่างในวันนี้)
        const isBusyToday = bookings.some(booking => 
            booking.trainer_id === trainer.user_id && 
            booking.date === today &&
            booking.status === 'confirmed'
        );
        
        status.className = `trainer-status ${isBusyToday ? 'busy' : 'available'}`;
        status.title = isBusyToday ? 'ไม่ว่างวันนี้' : 'ว่างวันนี้';
        
        listItem.appendChild(avatar);
        listItem.appendChild(details);
        listItem.appendChild(status);
        trainerList.appendChild(listItem);
    });
}

// ตรวจสอบความว่าง
function showAvailability() {
    document.getElementById('availabilityModal').style.display = 'block';
    document.getElementById('availabilityResult').style.display = 'none';
}

// ตรวจสอบความว่างตามวันที่และเวลา
function checkAvailability() {
    const date = document.getElementById('availabilityDate').value;
    const time = document.getElementById('availabilityTime').value;
    const duration = parseInt(document.getElementById('durationHours').value);
    
    if (!date || !time) {
        alert('กรุณาเลือกวันที่และเวลา');
        return;
    }
    
    // คำนวณเวลาสิ้นสุด
    const endTime = calculateEndTime(time, duration);
    
    const storedUsers = JSON.parse(localStorage.getItem('trainer_users'));
    const availableTrainers = storedUsers.filter(user => 
        user.role === 'Member' && 
        user.status === 'active' &&
        isTrainerAvailable(user.user_id, date, time, endTime)
    );
    
    const resultDiv = document.getElementById('availabilityResult');
    const trainersList = document.getElementById('availableTrainersList');
    
    trainersList.innerHTML = '';
    
    if (availableTrainers.length === 0) {
        trainersList.innerHTML = '<p style="padding: 1rem; text-align: center; color: #e74c3c;">ไม่มีเทรนเนอร์ว่างในช่วงเวลาที่เลือก</p>';
    } else {
        availableTrainers.forEach(trainer => {
            const trainerDiv = document.createElement('div');
            trainerDiv.className = 'available-trainer';
            
            const avatar = document.createElement('div');
            avatar.className = 'trainer-avatar';
            avatar.style.width = '30px';
            avatar.style.height = '30px';
            avatar.style.fontSize = '0.7rem';
            avatar.textContent = trainer.full_name_th.substring(0, 2);
            
            const name = document.createElement('span');
            name.textContent = trainer.full_name_th;
            
            const email = document.createElement('span');
            email.textContent = trainer.email_personal;
            email.style.fontSize = '0.7rem';
            email.style.color = '#7f8c8d';
            email.style.marginLeft = 'auto';
            
            trainerDiv.appendChild(avatar);
            trainerDiv.appendChild(name);
            trainerDiv.appendChild(email);
            trainersList.appendChild(trainerDiv);
        });
    }
    
    resultDiv.style.display = 'block';
}

// สร้างรายงาน
function generateReport() {
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
    
    if (confirmedBookings.length === 0) {
        alert('ไม่มีข้อมูลการจองเพื่อสร้างรายงาน');
        return;
    }
    
    // สร้างข้อมูลรายงาน
    let reportData = "รายงานการจองเทรนเนอร์\n\n";
    reportData += "วันที่,เวลา,เทรนเนอร์,หัวข้อ,ประเภท,รูปแบบ\n";
    
    confirmedBookings.forEach(booking => {
        const storedUsers = JSON.parse(localStorage.getItem('trainer_users'));
        const trainer = storedUsers.find(m => m.user_id === booking.trainer_id);
        reportData += `${booking.date},${booking.start_time}-${booking.end_time},${trainer.full_name_th},${booking.topic},${booking.type},${booking.format}\n`;
    });
    
    // สร้าง Blob และดาวน์โหลด
    const blob = new Blob([reportData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `trainer_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('ดาวน์โหลดรายงานเรียบร้อยแล้ว!');
}

// จัดการเทรนเนอร์
function showTrainerManagement() {
    document.getElementById('trainerModal').style.display = 'block';
    displayTrainerManagementList();
}

// แสดงรายการจัดการเทรนเนอร์
function displayTrainerManagementList() {
    const managementList = document.getElementById('trainerManagementList');
    const today = new Date().toISOString().split('T')[0];
    const storedUsers = JSON.parse(localStorage.getItem('trainer_users'));
    
    managementList.innerHTML = '';
    
    // อัพเดตสถิติ
    const totalActiveTrainers = storedUsers.filter(user => user.role === 'Member' && user.status === 'active').length;
    const availableTrainersCount = storedUsers.filter(user => 
        user.role === 'Member' && 
        user.status === 'active' &&
        !bookings.some(booking => 
            booking.trainer_id === user.user_id && 
            booking.date === today &&
            booking.status === 'confirmed'
        )
    ).length;
    
    document.getElementById('totalActiveTrainers').textContent = totalActiveTrainers;
    document.getElementById('availableTrainersCount').textContent = availableTrainersCount;
    
    // แสดงรายการเทรนเนอร์ทั้งหมด (ทั้ง Member และ Admin)
    const allUsers = storedUsers.filter(user => user.status === 'active');
    
    allUsers.forEach(user => {
        const listItem = document.createElement('div');
        listItem.className = 'management-trainer-item';
        
        const avatar = document.createElement('div');
        avatar.className = 'trainer-avatar';
        avatar.textContent = user.full_name_th.substring(0, 2);
        
        const details = document.createElement('div');
        details.className = 'trainer-info-expanded';
        
        const name = document.createElement('h4');
        name.textContent = user.full_name_th;
        
        const email = document.createElement('p');
        email.textContent = `อีเมล์: ${user.email_personal}`;
        
        const userId = document.createElement('p');
        userId.textContent = `รหัสผู้ใช้: ${user.user_id}`;
        
        const role = document.createElement('p');
        role.textContent = `บทบาท: ${getRoleDisplayName(user.role)}`;
        
        // นับจำนวนการจอง (เฉพาะเทรนเนอร์)
        let bookingInfo = '';
        if (user.role === 'Member') {
            const trainerBookings = bookings.filter(booking => 
                booking.trainer_id === user.user_id && 
                booking.status === 'confirmed'
            );
            bookingInfo = `จำนวนการจอง: ${trainerBookings.length} ครั้ง`;
        } else {
            bookingInfo = 'ผู้ดูแลระบบ';
        }
        
        const bookingCount = document.createElement('p');
        bookingCount.textContent = bookingInfo;
        
        details.appendChild(name);
        details.appendChild(email);
        details.appendChild(userId);
        details.appendChild(role);
        details.appendChild(bookingCount);
        
        listItem.appendChild(avatar);
        listItem.appendChild(details);
        managementList.appendChild(listItem);
    });
}

// ระบบจัดการผู้ใช้
function showAddUserForm() {
    document.getElementById('addUserModal').style.display = 'block';
}

function closeAddUserModal() {
    document.getElementById('addUserModal').style.display = 'none';
    document.getElementById('addUserForm').reset();
}

// จัดการฟอร์มเพิ่มผู้ใช้
document.getElementById('addUserForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const userId = document.getElementById('newUserId').value;
    const fullNameTh = document.getElementById('newUserFullNameTh').value;
    const fullNameEn = document.getElementById('newUserFullNameEn').value;
    const email = document.getElementById('newUserEmail').value;
    const role = document.getElementById('newUserRole').value;
    
    if (!userId || !fullNameTh || !fullNameEn || !email) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
    }
    
    const storedUsers = JSON.parse(localStorage.getItem('trainer_users'));
    
    // ตรวจสอบว่า User ID ซ้ำหรือไม่
    if (storedUsers.find(u => u.user_id === userId)) {
        alert('User ID นี้มีอยู่ในระบบแล้ว');
        return;
    }
    
    // เพิ่มผู้ใช้ใหม่
    const newUser = {
        user_id: userId,
        role: role,
        full_name_en: fullNameEn,
        full_name_th: fullNameTh,
        email_personal: email,
        password: 'Hellowelcome',
        status: 'active'
    };
    
    storedUsers.push(newUser);
    localStorage.setItem('trainer_users', JSON.stringify(storedUsers));
    
    alert('เพิ่มผู้ใช้เรียบร้อยแล้ว!');
    closeAddUserModal();
    displayTrainerManagementList();
});

// ระบบรีเซ็ตรหัสผ่าน
function showPasswordResetForm() {
    const storedUsers = JSON.parse(localStorage.getItem('trainer_users'));
    const userSelect = document.getElementById('resetPasswordUser');
    
    userSelect.innerHTML = '<option value="">-- เลือกผู้ใช้ --</option>';
    
    storedUsers.forEach(user => {
        const option = document.createElement('option');
        option.value = user.user_id;
        option.textContent = `${user.full_name_th} (${user.user_id})`;
        userSelect.appendChild(option);
    });
    
    document.getElementById('passwordResetModal').style.display = 'block';
}

function closePasswordResetModal() {
    document.getElementById('passwordResetModal').style.display = 'none';
}

function resetPassword() {
    const userId = document.getElementById('resetPasswordUser').value;
    
    if (!userId) {
        alert('กรุณาเลือกผู้ใช้');
        return;
    }
    
    const storedUsers = JSON.parse(localStorage.getItem('trainer_users'));
    const user = storedUsers.find(u => u.user_id === userId);
    
    if (user) {
        user.password = 'Hellowelcome';
        localStorage.setItem('trainer_users', JSON.stringify(storedUsers));
        
        alert(`รีเซ็ตรหัสผ่านสำหรับ ${user.full_name_th} เรียบร้อยแล้ว! รหัสผ่านใหม่คือ "Hellowelcome"`);
        closePasswordResetModal();
    }
}

// Daily Report System
function showDailyReport() {
    document.getElementById('dailyReportModal').style.display = 'block';
    
    // ตั้งค่าวันที่เริ่มต้นเป็นพรุ่งนี้
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('dailyReportDate').value = tomorrow.toISOString().split('T')[0];
}

function closeDailyReportModal() {
    document.getElementById('dailyReportModal').style.display = 'none';
    document.getElementById('dailyReportResult').style.display = 'none';
}

function generateDailyReport() {
    const selectedDate = document.getElementById('dailyReportDate').value;
    
    if (!selectedDate) {
        alert('กรุณาเลือกวันที่');
        return;
    }
    
    // ดึงการจองทั้งหมดในวันที่เลือก
    const dayBookings = bookings.filter(booking => 
        booking.date === selectedDate && 
        booking.status === 'confirmed'
    );
    
    // ดึงข้อมูลเทรนเนอร์
    const storedUsers = JSON.parse(localStorage.getItem('trainer_users'));
    const trainers = storedUsers.filter(user => user.role === 'Member' && user.status === 'active');
    
    let reportText = `Daily Report - ${formatDateDisplay(selectedDate)}\n\n`;
    reportText += `สรุปตารางงานเทรนเนอร์\n`;
    reportText += `วันที่: ${formatDateDisplay(selectedDate)}\n`;
    reportText += `จำนวนการจองทั้งหมด: ${dayBookings.length} รายการ\n\n`;
    
    // แยกรายการตามเทรนเนอร์
    trainers.forEach(trainer => {
        const trainerBookings = dayBookings.filter(booking => booking.trainer_id === trainer.user_id);
        
        reportText += `=== ${trainer.full_name_th} ===\n`;
        
        if (trainerBookings.length === 0) {
            reportText += `- ว่างตลอดวัน\n`;
        } else {
            trainerBookings.sort((a, b) => a.start_time.localeCompare(b.start_time)).forEach(booking => {
                reportText += `- ${booking.start_time}-${booking.end_time}: ${booking.topic} (${booking.type}, ${booking.format})\n`;
                
                if (booking.details) {
                    reportText += `  รายละเอียด: ${booking.details}\n`;
                }
            });
        }
        
        reportText += `\n`;
    });
    
    reportText += `--- สรุป ---\n`;
    reportText += `เทรนเนอร์ที่มีงาน: ${trainers.filter(t => dayBookings.some(b => b.trainer_id === t.user_id)).length} คน\n`;
    reportText += `เทรนเนอร์ที่ว่าง: ${trainers.filter(t => !dayBookings.some(b => b.trainer_id === t.user_id)).length} คน\n`;
    reportText += `รายงานสร้างเมื่อ: ${new Date().toLocaleDateString('th-TH')} ${new Date().toLocaleTimeString('th-TH')}\n`;
    
    document.getElementById('dailyReportText').value = reportText;
    document.getElementById('dailyReportResult').style.display = 'block';
}

function copyDailyReport() {
    const reportText = document.getElementById('dailyReportText');
    reportText.select();
    document.execCommand('copy');
    alert('คัดลอก Daily Report เรียบร้อยแล้ว!');
}

// ระบบแจ้งเตือน
function createNotification(recipientRole, title, message) {
    const notification = {
        id: Date.now().toString(),
        recipient_role: recipientRole,
        title: title,
        message: message,
        timestamp: new Date().toISOString(),
        read: false
    };
    
    notifications.push(notification);
    localStorage.setItem('trainerNotifications', JSON.stringify(notifications));
    
    updateNotificationCount();
}

// อัพเดตจำนวนการแจ้งเตือน
function updateNotificationCount() {
    const currentUser = getCurrentUser();
    let unreadCount = 0;
    
    if (currentUser.role === 'Member') {
        // เทรนเนอร์เห็นเฉพาะการแจ้งเตือนที่ส่งถึงตัวเอง
        unreadCount = notifications.filter(n => 
            (n.recipient_role === 'member' || n.recipient_role === currentUser.user_id) && 
            !n.read
        ).length;
    } else {
        // Admin/Master เห็นการแจ้งเตือนทั้งหมด
        unreadCount = notifications.filter(n => 
            (n.recipient_role === 'admin' || n.recipient_role === 'all') && 
            !n.read
        ).length;
    }
    
    document.getElementById('notificationCount').textContent = unreadCount;
    
    // แสดง/ซ่อนปุ่มการแจ้งเตือน
    document.getElementById('notificationBell').style.display = 
        unreadCount > 0 ? 'flex' : 'none';
}

// แสดงการแจ้งเตือน
function showNotifications() {
    const currentUser = getCurrentUser();
    let userNotifications = [];
    
    if (currentUser.role === 'Member') {
        userNotifications = notifications.filter(n => 
            n.recipient_role === 'member' || n.recipient_role === currentUser.user_id
        );
    } else {
        userNotifications = notifications.filter(n => 
            n.recipient_role === 'admin' || n.recipient_role === 'all'
        );
    }
    
    // เรียงจากใหม่ไปเก่า
    userNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    const notificationsList = document.getElementById('notificationsList');
    notificationsList.innerHTML = '';
    
    if (userNotifications.length === 0) {
        notificationsList.innerHTML = '<p style="text-align: center; color: #7f8c8d; padding: 2rem;">ไม่มีการแจ้งเตือน</p>';
    } else {
        userNotifications.forEach(notification => {
            const notificationItem = document.createElement('div');
            notificationItem.className = `notification-item ${notification.read ? '' : 'unread'}`;
            notificationItem.onclick = () => markNotificationAsRead(notification.id);
            
            const title = document.createElement('div');
            title.className = 'notification-title';
            title.textContent = notification.title;
            
            const message = document.createElement('div');
            message.className = 'notification-message';
            message.textContent = notification.message;
            
            const time = document.createElement('div');
            time.className = 'notification-time';
            time.textContent = formatTimeDisplay(notification.timestamp);
            
            notificationItem.appendChild(title);
            notificationItem.appendChild(message);
            notificationItem.appendChild(time);
            
            notificationsList.appendChild(notificationItem);
        });
    }
    
    document.getElementById('notificationsModal').style.display = 'block';
}

// ทำเครื่องหมายการแจ้งเตือนว่าอ่านแล้ว
function markNotificationAsRead(notificationId) {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
        notification.read = true;
        localStorage.setItem('trainerNotifications', JSON.stringify(notifications));
        updateNotificationCount();
        showNotifications(); // รีเฟรชรายการ
    }
}

// ปิด modal การแจ้งเตือน
function closeNotificationsModal() {
    document.getElementById('notificationsModal').style.display = 'none';
}

// ฟังก์ชันเสริม
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

function getRoleDisplayName(role) {
    const roleNames = {
        'Master': 'มาสเตอร์',
        'Admin': 'ผู้ดูแลระบบ',
        'Member': 'เทรนเนอร์'
    };
    return roleNames[role] || role;
}

function formatDateDisplay(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
}

function formatTimeDisplay(timeString) {
    const date = new Date(timeString);
    return date.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ฟังก์ชันสำหรับเมนู (placeholder)
function showSchedule() {
    showDashboard();
}

function showRequests() {
    alert('หน้ารายการคำขอจะแสดงในเวอร์ชันถัดไป');
}

function showReports() {
    alert('หน้ารายงานจะแสดงในเวอร์ชันถัดไป');
}

function showSettings() {
    alert('หน้าตั้งค่าระบบจะแสดงในเวอร์ชันถัดไป');
}

// ระบบจัดการข้อมูล
function addSampleData() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const sampleBookings = [
        {
            id: 'sample1',
            trainer_id: 'ttb_ap',
            date: today.toISOString().split('T')[0],
            start_time: '10:00',
            end_time: '12:00',
            topic: 'การขายขั้นสูง',
            type: 'internal',
            format: 'online',
            details: 'ฝึกอบรมเทคนิคการขายสำหรับทีมใหม่',
            status: 'confirmed',
            created_at: new Date().toISOString()
        },
        {
            id: 'sample2',
            trainer_id: 'ttb_as',
            date: tomorrow.toISOString().split('T')[0],
            start_time: '14:00',
            end_time: '16:00',
            topic: 'การบริการลูกค้า',
            type: 'external',
            format: 'f2f',
            details: 'อบรมการบริการลูกค้าสำหรับพนักงานหน้าร้าน',
            status: 'pending',
            created_at: new Date().toISOString()
        },
        {
            id: 'sample3',
            trainer_id: 'ttb_np',
            date: today.toISOString().split('T')[0],
            start_time: '13:00',
            end_time: '15:00',
            topic: 'การจัดการเวลา',
            type: 'ttb',
            format: 'online',
            details: 'Workshop การจัดการเวลาอย่างมีประสิทธิภาพ',
            status: 'pending',
            created_at: new Date().toISOString()
        }
    ];
    
    let addedCount = 0;
    sampleBookings.forEach(booking => {
        if (isTrainerAvailable(booking.trainer_id, booking.date, booking.start_time, booking.end_time)) {
            bookings.push(booking);
            addedCount++;
            
            // ส่งการแจ้งเตือนสำหรับงานที่ pending
            if (booking.status === 'pending') {
                createNotification(
                    booking.trainer_id,
                    'มีงานใหม่รอการตอบรับ',
                    `มีงาน "${booking.topic}" ในวันที่ ${formatDateDisplay(booking.date)} เวลา ${booking.start_time}-${booking.end_time} รอการตอบรับจากคุณ`
                );
            }
        }
    });
    
    localStorage.setItem('trainerBookings', JSON.stringify(bookings));
    updateStats();
    displaySchedule();
    displayTrainerList();
    updateNotificationCount();
    
    if (addedCount > 0) {
        alert(`เพิ่มข้อมูลตัวอย่าง ${addedCount} รายการเรียบร้อยแล้ว!`);
    } else {
        alert('ไม่สามารถเพิ่มข้อมูลตัวอย่างได้ เนื่องจากมีช่วงเวลาซ้ำกัน');
    }
}

// ล้างข้อมูลทั้งหมด
function clearAllData() {
    if (confirm('คุณแน่ใจว่าต้องการล้างข้อมูลการจองทั้งหมด?')) {
        if (confirm('การล้างข้อมูลไม่สามารถกู้คืนได้ กรุณายืนยันอีกครั้ง')) {
            bookings = [];
            notifications = [];
            localStorage.setItem('trainerBookings', JSON.stringify(bookings));
            localStorage.setItem('trainerNotifications', JSON.stringify(notifications));
            updateStats();
            displaySchedule();
            displayTrainerList();
            updateNotificationCount();
            alert('ล้างข้อมูลเรียบร้อยแล้ว');
        }
    }
}

// ออกจากระบบ
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// ปิด modal เมื่อคลิกนอกพื้นที่
window.onclick = function(event) {
    const modals = ['bookingModal', 'availabilityModal', 'trainerModal', 'addUserModal', 
                   'passwordResetModal', 'notificationsModal', 'dailyReportModal', 'responseModal'];
    
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (event.target === modal) {
            if (modalId === 'bookingModal') closeModal();
            if (modalId === 'availabilityModal') closeAvailabilityModal();
            if (modalId === 'trainerModal') closeTrainerModal();
            if (modalId === 'addUserModal') closeAddUserModal();
            if (modalId === 'passwordResetModal') closePasswordResetModal();
            if (modalId === 'notificationsModal') closeNotificationsModal();
            if (modalId === 'dailyReportModal') closeDailyReportModal();
            if (modalId === 'responseModal') closeResponseModal();
        }
    });
}
