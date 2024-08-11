


function getSouras(){
    axios.get("https://api.alquran.cloud/v1/quran/quran-uthmani")
    .then((response) =>{
        let souras = document.getElementById("souras")
        let souraNames = response.data.data.surahs
        for (souraName of souraNames){
            souras.innerHTML += `<h1 class="soura" onclick="getAyat(${souraName.number})">${souraName.name}</h1>`
        }
    })
    .catch((error)=>{
        alert(error)
    })
}

function getAyat(ayas){
    axios.get(`https://api.alquran.cloud/v1/surah/${ayas}/quran-uthmani`)
    .then((response)=>{

        let ayat = document.getElementById("ayat-p")
        let souraNameH1 = document.getElementById("soura-name-h1")
        let soura = response.data.data
        let souras = response.data.data.ayahs
        console.log(soura)
        ayat.innerHTML = ""
        souraNameH1.innerHTML = `<h1>${soura.name}</h1>`
        x = ""
        for (aya of souras){
            if (ayas == 1 || ayas == 9){
                ayat.innerHTML += `${aya.text}<span id="aya-number">{${aya.numberInSurah}}</span>`
            }else{
                x += `${aya.text}<span id="aya-number">{${aya.numberInSurah}}</span>`
                console.log(x.substring(0, 39))
            }
            
        if (ayas == 1 || ayas == 9){
            console.log("")
        }else{
            ayat.innerHTML = `<span id="aya-number">${x.substring(0, 39)}</span><br> ${x.substring(39)}`
        }

        }
        ayat.innerHTML += "."
        
        //let sourahs = response.data.data.surahs.ayahs
        
    })
}
getAyat(1)
getSouras()