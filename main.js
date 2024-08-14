let choseBtn = document.getElementById("shose-button");
let intervalId = null; // لتخزين معرف التحديث الدوري

choseBtn.addEventListener("click", () => {
    getCity();
});

function getTimings(city) {
    axios.get(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=Saudi Arabia&method=4`)
        .then((response) => {
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

            // إذا كان هناك تحديث دوري سابق، قم بإيقافه
            if (intervalId) {
                clearInterval(intervalId);
            }

            // بدء العد التنازلي
            startCountdown({ esha, magrib, aser, duhur, shrok, fager });
        });
}

function displayPrayerTimes(times) {
    document.getElementById("esha").innerHTML = formatTime(times.esha);
    document.getElementById("magrib").innerHTML = formatTime(times.magrib);
    document.getElementById("aser").innerHTML = formatTime(times.aser);
    document.getElementById("duhur").innerHTML = formatTime(times.duhur);
    document.getElementById("shrok").innerHTML = formatTime(times.shrok);
    document.getElementById("fager").innerHTML = formatTime(times.fager);
}

function formatTime(time) {
    let [hours, minutes] = time.split(":");
    let period = "ص";
    if (hours >= 12) {
        period = "م";
        hours = hours - 12;
    }
    if (hours == 0) {
        hours = 12;
    }
    return `${hours}:${minutes} ${period}`;
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

    let remainingHours = Math.floor(minTimeDiff / 3600);
    let remainingMinutes = Math.floor((minTimeDiff % 3600) / 60);
    let remainingSeconds = minTimeDiff % 60;

    // تحديث الصفحة بالوقت المتبقي
    document.getElementById("time-title").innerHTML = `المتبقي على أذان ${nextPrayer.name}:`;
    document.getElementById("time-h1").innerHTML = `${remainingHours}:${remainingMinutes < 10 ? '0' + remainingMinutes : remainingMinutes}:${remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds}`;

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
