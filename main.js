let choseBtn = document.getElementById("shose-button");
let intervalId = null; // لتخزين معرف التحديث الدوري

choseBtn.addEventListener("click", () => {
    getCity();
});

function getTimings(city) {
    axios.get(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=Saudi Arabia&method=4`)
        .then((response) => {
            console.log(response.data.data); // سجل البيانات في وحدة التحكم
            let timing = response.data.data.timings;

            // تحديد أوقات الأذان
            let esha = timing.Isha;
            let magrib = timing.Maghrib;
            let aser = timing.Asr;
            let duhur = timing.Dhuhr;
            let shrok = timing.Sunrise;
            let fager = timing.Fajr;

            // عرض أوقات الأذان في الصفحة
            displayPrayerTimes({ esha, magrib, aser, duhur, shrok, fager });

            // تحديث التاريخ واليوم
            displayDateAndTime(response.data.data.date);

            // إذا كان هناك تحديث دوري سابق، قم بإيقافه
            if (intervalId) {
                clearInterval(intervalId);
            }

            // بدء العد التنازلي
            startCountdown({ esha, magrib, aser, duhur, shrok, fager });
            document.getElementById("weekday").textContent = `اليوم: ${response.data.data.date.hijri.weekday.ar}`;
            
        });
}


function displayPrayerTimes(times) {
    document.getElementById("esha").textContent = formatTime(times.esha);
    document.getElementById("magrib").textContent = formatTime(times.magrib);
    document.getElementById("aser").textContent = formatTime(times.aser);
    document.getElementById("duhur").textContent = formatTime(times.duhur);
    document.getElementById("shrok").textContent = formatTime(times.shrok);
    document.getElementById("fager").textContent = formatTime(times.fager);
}

function formatTime(time) {
    let [hours, minutes] = time.split(":").map(Number);
    let period = "ص";
    if (hours >= 12) {
        period = "م";
        hours = hours > 12 ? hours - 12 : 12;
    }
    if (hours === 0) {
        hours = 12;
    }
    return `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${period}`;
}

function displayDateAndTime(date) {
    document.getElementById("date-gregorian").textContent = `التاريخ الميلادي: ${date.gregorian.date}`;
    document.getElementById("date-hijri").textContent = `التاريخ الهجري: ${date.hijri.date}`;

    // تحقق من وجود اليوم في البيانات
    let weekday = date.gregorian.weekday ? date.gregorian.weekday.ar : 'غير معروف';
    document.getElementById("weekday").textContent = `اليوم: ${weekday}`;
}

function startCountdown(times) {
    intervalId = setInterval(() => {
        calculateTimeUntilNextPrayer(times);
    }, 1000);
}

function calculateTimeUntilNextPrayer(times) {
    let now = new Date();
    let currentHours = now.getHours();
    let currentMinutes = now.getMinutes();
    let currentSeconds = now.getSeconds();

    let prayerTimes = [
        { name: "العشاء", time: times.esha },
        { name: "المغرب", time: times.magrib },
        { name: "العصر", time: times.aser },
        { name: "الظهر", time: times.duhur },
        { name: "الشروق", time: times.shrok },
        { name: "الفجر", time: times.fager }
    ];

    // تحويل الوقت الحالي إلى ثواني منذ بداية اليوم
    let currentTimeInSeconds = (currentHours * 3600) + (currentMinutes * 60) + currentSeconds;

    let nextPrayer = null;
    let minTimeDiff = 24 * 3600; // أقصى فرق ممكن (24 ساعة)

    // العثور على أقرب وقت صلاة لاحق
    for (let i = 0; i < prayerTimes.length; i++) {
        let [prayerHours, prayerMinutes] = prayerTimes[i].time.split(":").map(Number);
        let prayerTimeInSeconds = (prayerHours * 3600) + (prayerMinutes * 60);

        // إذا كان وقت الصلاة بعد الوقت الحالي
        if (prayerTimeInSeconds > currentTimeInSeconds) {
            let timeDiff = prayerTimeInSeconds - currentTimeInSeconds;

            if (timeDiff < minTimeDiff) {
                minTimeDiff = timeDiff;
                nextPrayer = prayerTimes[i];
            }
        }
    }

    // إذا لم يتم العثور على وقت أذان لاحق في نفس اليوم، نعتبر الأذان الأول في اليوم التالي
    if (!nextPrayer) {
        let [prayerHours, prayerMinutes] = prayerTimes[0].time.split(":").map(Number);
        let prayerTimeInSeconds = (prayerHours * 3600) + (prayerMinutes * 60) + (24 * 3600);
        minTimeDiff = prayerTimeInSeconds - currentTimeInSeconds;
        nextPrayer = prayerTimes[0];
    }

    // حساب الوقت المنقضي من آخر وقت صلاة
    let lastPrayer = prayerTimes.find(p => {
        let [prayerHours, prayerMinutes] = p.time.split(":").map(Number);
        return (prayerHours * 3600) + (prayerMinutes * 60) <= currentTimeInSeconds;
    });

    let elapsedTimeInSeconds = lastPrayer ? Math.max(0, currentTimeInSeconds - ((lastPrayer.time.split(':').map(Number)[0] * 3600) + (lastPrayer.time.split(':').map(Number)[1] * 60))) : 0;
    let elapsedHours = Math.floor(elapsedTimeInSeconds / 3600);
    let elapsedMinutes = Math.floor((elapsedTimeInSeconds % 3600) / 60);
    let elapsedSeconds = elapsedTimeInSeconds % 60;

    let remainingHours = Math.floor(minTimeDiff / 3600);
    let remainingMinutes = Math.floor((minTimeDiff % 3600) / 60);
    let remainingSeconds = minTimeDiff % 60;

    

    // تحديث الصفحة بالوقت المتبقي أو المنقضي
    if (lastPrayer) {
        if (currentTimeInSeconds >= ((lastPrayer.time.split(':').map(Number)[0] * 3600) + (lastPrayer.time.split(':').map(Number)[1] * 60))) {
            document.getElementById("time-title").textContent = `الوقت المنقضي على أذان ${nextPrayer.name}:`;
            document.getElementById("time-h1").textContent = `${elapsedHours}:${elapsedMinutes < 10 ? '0' + elapsedMinutes : elapsedMinutes}:${elapsedSeconds < 10 ? '0' + elapsedSeconds : elapsedSeconds}`;
        } else {
            document.getElementById("time-title").textContent = `المتبقي على أذان ${nextPrayer.name}:`;
            document.getElementById("time-h1").textContent = `${remainingHours}:${remainingMinutes < 10 ? '0' + remainingMinutes : remainingMinutes}:${remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds}`;
        }
    } else {
        // في حالة عدم وجود آخر وقت صلاة
        document.getElementById("time-title").textContent = 'لم يتم العثور على وقت صلاة';
        document.getElementById("time-h1").textContent = '00:00:00';
    }

    // تشغيل صوت الأذان عند الوصول إلى وقت الأذان
    if (minTimeDiff <= 0) {
        let athanAudio = document.getElementById("athan-audio");
        athanAudio.play();
        clearInterval(intervalId); // إيقاف التحديث
    }
}




function getCity() {
    let city = document.getElementById("select-city").value;
    getTimings(city);
}

// استدعاء أولي عند تحميل الصفحة
getTimings("Dammam");
