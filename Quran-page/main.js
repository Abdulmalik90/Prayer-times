


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
        console.log(souras)
        ayat.innerHTML = ""
        souraNameH1.innerHTML = `<h1>${soura.name}</h1>`
        for (aya of souras){
            ayat.innerHTML += `${aya.text}<span id="aya-number">{${aya.numberInSurah}}</span>`

        }
        ayat.innerHTML += "."
        
        //let sourahs = response.data.data.surahs.ayahs
        
    })
}
getAyat(1)
getSouras()