

let choseBtn = document.getElementById("shose-button")

choseBtn.addEventListener("click", ()=>{
    getCity()
})






function getTimings(city){
    axios.get(`http://api.aladhan.com/v1/timingsByCity?city=${city}&country=Saudi Arabia&method=4`)
    .then((response)=>{
        let timing = response.data.data.timings
        

        let esha = document.getElementById("esha")
        let magrib = document.getElementById("magrib")
        let aser = document.getElementById("aser")
        let duhur = document.getElementById("duhur")
        let shrok = document.getElementById("shrok")
        let fager = document.getElementById("fager")

        //put Isha pray
        if (Number(timing.Isha.substring(0, 2)) >= 12){
            esha.innerHTML = `${Number(timing.Isha.substring(0, 2)) - 12}:${timing.Isha.substring(3,5)} م`
        } else{
            esha.innerHTML = `${timing.Isha} ص`
        }

        //put Maghrib pray
        if (Number(timing.Maghrib.substring(0, 2)) >= 12){
            magrib.innerHTML = `${Number(timing.Maghrib.substring(0, 2)) - 12}:${timing.Maghrib.substring(3,5)} م`
        } else{
            magrib.innerHTML = `${timing.Maghrib} ص`
        }

        //put Asr pray
        if (Number(timing.Asr.substring(0, 2)) >= 12){
            aser.innerHTML = `${Number(timing.Asr.substring(0, 2)) - 12}:${timing.Asr.substring(3,5)} م`
        } else{
            aser.innerHTML = `${timing.Asr} ص`
        }

        //put Dhuhr pray
        if (Number(timing.Dhuhr.substring(0, 2)) >= 12){
            if (Number(timing.Dhuhr.substring(0, 2)) = 0){
                duhur.innerHTML = `00:${timing.Dhuhr.substring(3,5)} م`
            }else {
                duhur.innerHTML = `${Number(timing.Dhuhr.substring(0, 2)) - 12}:${timing.Dhuhr.substring(3,5)} م`
            }
            
        } else{
            duhur.innerHTML = `${timing.Dhuhr} ص`
        }

        //put Asr pray
        if (Number(timing.Sunrise.substring(0, 2)) >= 12){
            shrok.innerHTML = `${Number(timing.Sunrise.substring(0, 2)) - 12}:${timing.Sunrise.substring(3,5)} م`
        } else{
            shrok.innerHTML = `${timing.Sunrise} ص`
        }

        //put Asr pray
        if (Number(timing.Fajr.substring(0, 2)) >= 12){
            fager.innerHTML = `${Number(timing.Fajr.substring(0, 2)) - 12}:${timing.Fajr.substring(3,5)} م`
        } else{
            fager.innerHTML = `${timing.Fajr} ص`
        }
        let showTime = document.getElementById("show-time")
        showTime.innerHTML = `
        <h3>التاريخ الميلادي: ${response.data.data.date.gregorian.date}</h3>
        
        <h3>التاريخ الهجري:${response.data.data.date.hijri.date}
        
        <h3>اليوم: ${response.data.data.date.hijri.weekday.ar}</h3>
        `

        
    })
}

function getCity(){
    let city = document.getElementById("select-city").value
    getTimings(city)
}

getTimings("Dammam")