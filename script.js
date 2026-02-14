const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzCt_IsG1KuXnfSm2_oaNHAsQo1XJmrm7nxjmtUpOnfeoJZnU7YU4agU7c5LNt8qlJu3A/exec"; // ใส่ URL ที่ Deploy ล่าสุด

// 1. กำหนดช่วงเวลาที่สนามเปิด (08:00 - 23:00)
const timeTable = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"];

async function updateAvailableSlots() {
    const date = document.getElementById('bookingDate').value;
    const court = document.getElementById('courtId').value;
    const startSelect = document.getElementById('startTime');
    const statusMsg = document.getElementById('statusMessage');

    if (!date) return;

    statusMsg.innerText = "กำลังตรวจสอบเวลาว่าง...";
    startSelect.innerHTML = "<option>รอสักครู่...</option>";

    try {
        const res = await fetch(`${WEB_APP_URL}?action=getBusySlots&date=${date}&courtId=${court}`);
        const busySlots = await res.json();

        // กรองเอาเฉพาะเวลาที่ "ไม่มี" ในรายการ Busy
        const availableStartTimes = timeTable.filter(time => {
            const currentT = parseInt(time.replace(':', ''));
            return !busySlots.some(busy => {
                const s = parseInt(busy.start.replace(':', ''));
                const e = parseInt(busy.end.replace(':', ''));
                const endVal = (busy.end === "00:00") ? 2400 : e;
                return currentT >= s && currentT < endVal;
            });
        });

        // สร้าง Option ใหม่
        startSelect.innerHTML = availableStartTimes.length 
            ? availableStartTimes.map(t => `<option value="${t}">${t}</option>`).join('')
            : "<option disabled>สนามเต็มทุกช่วงเวลา</option>";
        
        statusMsg.innerText = "";
        updateEndTimeOptions(); // อัปเดตเวลาเลิกให้สัมพันธ์กัน

    } catch (err) {
        statusMsg.innerText = "เกิดข้อผิดพลาดในการโหลดข้อมูล";
    }
}

function updateEndTimeOptions() {
    const start = document.getElementById('startTime').value;
    const endSelect = document.getElementById('endTime');
    if (!start) return;

    const startIdx = timeTable.indexOf(start);
    let options = "";
    for (let i = startIdx + 1; i < timeTable.length; i++) {
        options += `<option value="${timeTable[i]}">${timeTable[i]}</option>`;
    }
    options += `<option value="00:00">00:00</option>`;
    endSelect.innerHTML = options;
}