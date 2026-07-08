let choseBtn = document.getElementById("shose-button");
let intervalId = null; // لتخزين معرف التحديث الدوري

choseBtn.addEventListener("click", () => {
    getCity();
});

function getTimings(city) {
    axios.get(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=Saudi Arabia&method=4`)
        .then((response) => {
            let timing = response.data.data.timings;

            // تحديد أوقات الأذان وتجميعها في كائن واحد
            let prayers = {
                fager: timing.Fajr,
                shrok: timing.Sunrise,
                duhur: timing.Dhuhr,
                aser: timing.Asr,
                magrib: timing.Maghrib,
                esha: timing.Isha
            };

            // عرض أوقات الأذان في الصفحة
            displayPrayerTimes(prayers);

            // تحديث التاريخ واليوم
            displayDateAndTime(response.data.data.date);

            // إذا كان هناك تحديث دوري سابق، قم بإيقافه
            if (intervalId) {
                clearInterval(intervalId);
            }

            // بدء العد التنازلي
            startCountdown(prayers);
        })
        .catch((error) => console.log("حدث خطأ في جلب البيانات: ", error));
}

function displayPrayerTimes(times) {
    document.getElementById("fager").textContent = formatTime(times.fager);
    document.getElementById("shrok").textContent = formatTime(times.shrok);
    document.getElementById("duhur").textContent = formatTime(times.duhur);
    document.getElementById("aser").textContent = formatTime(times.aser);
    document.getElementById("magrib").textContent = formatTime(times.magrib);
    document.getElementById("esha").textContent = formatTime(times.esha);
}

function formatTime(time) {
    let [hours, minutes] = time.split(":").map(Number);
    let period = "ص";
    if (hours >= 12) {
        period = "م";
        if (hours > 12) hours -= 12;
    }
    if (hours === 0) {
        hours = 12;
    }
    return `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${period}`;
}

function displayDateAndTime(date) {
    document.getElementById("date-gregorian").textContent = `التاريخ الميلادي: ${date.gregorian.date}`;
    document.getElementById("date-hijri").textContent = `التاريخ الهجري: ${date.hijri.date}`;

    // جلب اليوم باللغة العربية
    let weekday = date.hijri.weekday ? date.hijri.weekday.ar : 'غير معروف';
    document.getElementById("weekday").textContent = `اليوم: ${weekday}`;
}

function startCountdown(times) {
    // استدعاء فوري لتحديث العداد بدون الانتظار ثانية واحدة
    calculateTimeUntilNextPrayer(times); 
    
    intervalId = setInterval(() => {
        calculateTimeUntilNextPrayer(times);
    }, 1000);
}

function calculateTimeUntilNextPrayer(times) {
    let now = new Date();
    // تحويل الوقت الحالي إلى ثواني منذ بداية اليوم
    let currentSeconds = (now.getHours() * 3600) + (now.getMinutes() * 60) + now.getSeconds();

    // ترتيب الصلوات منطقياً من الفجر إلى العشاء
    let prayerTimes = [
        { name: "الفجر", time: times.fager },
        { name: "الشروق", time: times.shrok },
        { name: "الظهر", time: times.duhur },
        { name: "العصر", time: times.aser },
        { name: "المغرب", time: times.magrib },
        { name: "العشاء", time: times.esha }
    ];

    // تحويل جميع أوقات الصلوات إلى ثواني
    let parsedPrayers = prayerTimes.map(p => {
        let [hours, minutes] = p.time.split(":").map(Number);
        return { name: p.name, timeInSeconds: (hours * 3600) + (minutes * 60) };
    });

    let nextPrayer = null;
    let lastPrayer = null;

    // العثور على الصلاة القادمة والسابقة
    for (let i = 0; i < parsedPrayers.length; i++) {
        if (parsedPrayers[i].timeInSeconds > currentSeconds) {
            nextPrayer = parsedPrayers[i];
            
            // تحديد الصلاة السابقة
            if (i > 0) {
                lastPrayer = parsedPrayers[i - 1];
            } else {
                // إذا كانت الصلاة القادمة هي الفجر، فالصلاة السابقة هي عشاء الأمس
                lastPrayer = { name: "العشاء", timeInSeconds: parsedPrayers[5].timeInSeconds - (24 * 3600) };
            }
            break;
        }
    }

    // إذا انقضت كل صلوات اليوم (الوقت الحالي بعد صلاة العشاء)
    if (!nextPrayer) {
        // الصلاة القادمة هي فجر اليوم التالي
        nextPrayer = { name: "الفجر", timeInSeconds: parsedPrayers[0].timeInSeconds + (24 * 3600) }; 
        // الصلاة السابقة هي عشاء اليوم
        lastPrayer = parsedPrayers[5]; 
    }

    // حساب الوقت المتبقي والمنقضي بالثواني
    let timeRemaining = nextPrayer.timeInSeconds - currentSeconds;
    let timeElapsed = currentSeconds - lastPrayer.timeInSeconds;

    let targetTitle = "";
    let targetTime = 0;

    // تحديد أيهما أقرب: الوقت المنقضي أم المتبقي
    if (timeRemaining <= timeElapsed) {
        targetTitle = `المتبقي على ${nextPrayer.name === "الشروق" ? "وقت" : "أذان"} ${nextPrayer.name}:`;
        targetTime = timeRemaining;
    } else {
        targetTitle = `الوقت المنقضي من ${lastPrayer.name === "الشروق" ? "وقت" : "أذان"} ${lastPrayer.name}:`;
        targetTime = timeElapsed;
    }

    // تحويل الثواني المستهدفة إلى ساعات، دقائق، وثواني
    let h = Math.floor(targetTime / 3600);
    let m = Math.floor((targetTime % 3600) / 60);
    let s = targetTime % 60;

    // تحديث واجهة المستخدم
    document.getElementById("time-title").textContent = targetTitle;
    document.getElementById("time-h1").textContent = `${h < 10 ? '0' + h : h}:${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;

    // تشغيل صوت الأذان عندما يصل الوقت المتبقي للصفر (تجنب تشغيله في وقت الشروق)
    if (timeRemaining === 0 && nextPrayer.name !== "الشروق") {
        let athanAudio = document.getElementById("athan-audio");
        athanAudio.play();
    }
}

function getCity() {
    let city = document.getElementById("select-city").value;
    getTimings(city);
}

// استدعاء أولي عند تحميل الصفحة
getTimings("Dammam");