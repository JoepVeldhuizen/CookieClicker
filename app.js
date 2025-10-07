//variables defineren
    const sound = document.getElementById("clickSound");
    let teller = parseInt(localStorage.getItem("teller")) || 0;
    let CookiePerClick = parseInt(localStorage.getItem("CookiePerClick")) || 1;
    let PrijsUpgrade = parseInt(localStorage.getItem("PrijsUpgrade")) || 10;
    let PrijsAutoClicker = parseInt(localStorage.getItem("PrijsAutoClicker")) || 50;
    let CookiePerSecond = parseInt(localStorage.getItem("CookiePerSecond")) || 0;

    function PageLoaded() {
      document.getElementById("CookieCount").innerHTML = "Cookies:" + teller;
      document.getElementById("CookiePerClick").innerHTML = "Cookies Per Click:" + CookiePerClick;
      document.getElementById("PrijsUpgrade").innerHTML = PrijsUpgrade;
      document.getElementById("PrijsAutoClicker").innerHTML = PrijsAutoClicker;
      document.getElementById("CookiePerSecond").innerHTML = "Cookies Per Second:" + CookiePerSecond;
      CookiePerSecondFunction();
    }

    function createParticleExplosion(x, y) {
      const container = document.getElementById('particle-container');
      const count = 5;

      for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        const angle = Math.random() * 2 * Math.PI;
        const distance = 80 + Math.random() * 200;
        const dx = Math.cos(angle) * distance + "px";
        const dy = Math.sin(angle) * distance + "px";

        particle.style.setProperty('--dx', dx);
        particle.style.setProperty('--dy', dy);

        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        

        container.appendChild(particle);

        particle.addEventListener('animationend', () => {
          particle.remove();
        });
  }
}

    //als op cookie word geklikt dan teller + cookiesperclick
    function CookieClicked() {
      teller = teller + CookiePerClick;
      document.getElementById("CookieCount").innerHTML = "Cookies:" + teller;
      localStorage.setItem("teller", teller); 
      createParticleExplosion(event.clientX, event.clientY);  
      sound.currentTime = 0;
      sound.play();
      document.getElementById("cookie").style.scale = "0.9" ;
      setTimeout(() => {
        document.getElementById("cookie").style.scale = "1" ;
        }, 100);
    }

    function KoopAutoClicker() {
      if(teller >= PrijsAutoClicker){
        teller = teller - PrijsAutoClicker
        CookiePerSecond++;
        PrijsAutoClicker = Math.round(PrijsAutoClicker * 1.5, 0);
        document.getElementById("PrijsAutoClicker").innerHTML = PrijsAutoClicker;
        document.getElementById("CookiePerSecond").innerHTML = "Cookies Per Second:" + CookiePerSecond;
        document.getElementById("CookieCount").innerHTML = "Cookies:" + teller;
        localStorage.setItem("PrijsAutoClicker", PrijsAutoClicker);
        localStorage.setItem("CookiePerSecond", CookiePerSecond);
        localStorage.setItem("teller", teller);         
      }
      
        else {
            document.getElementById("Autoclicker1knop").innerHTML = "Te Duur"
            setTimeout(() => {
            document.getElementById("Autoclicker1knop").innerHTML = "Koop Nu"
            }, 1000);
        }
    }

    //functie om cookie per click erbij te doen
    function CookiePerClickPlusOne() {
        if(teller >= PrijsUpgrade){
      CookiePerClick++;
      document.getElementById("CookiePerClick").innerHTML =
        "Cookies Per Click:" + CookiePerClick;
        teller = teller - PrijsUpgrade;
        document.getElementById("CookieCount").innerHTML = "Cookies:" + teller;
        localStorage.setItem("CookiePerClick", CookiePerClick);
        localStorage.setItem("teller", teller); 
         
        PrijsUpgrade = Math.round(PrijsUpgrade * 1.5, 0);
        document.getElementById("PrijsUpgrade").innerHTML = PrijsUpgrade;
        localStorage.setItem("PrijsUpgrade", PrijsUpgrade);} 

       

        else {
            document.getElementById("Upgrade1Knop").innerHTML = "Te Duur"
            setTimeout(() => {
            document.getElementById("Upgrade1Knop").innerHTML = "Koop Nu"
            }, 1000);
        }
    }

function CookiePerSecondFunction() {
  if(CookiePerSecond > 0){
    document.getElementById("AutoClickerBar").style.visibility = "visible";
    document.getElementById("AutoClickerBarContainer").style.visibility = "visible";
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;

    createParticleExplosion(x, y);
    sound.currentTime = 0;
    sound.play();
  }


  const bar = document.getElementById("AutoClickerBar");

  bar.style.transition = "width 1s linear";
  bar.style.width = "19.5vw";

  setTimeout(() => {
    teller += CookiePerSecond;
    localStorage.setItem("teller", teller);
    document.getElementById("CookieCount").textContent = "Cookies:" + teller;

    bar.style.transition = "none";
    bar.style.width = "0";

    void bar.offsetWidth;

    setTimeout(CookiePerSecondFunction, 50);
  }, 1000);
}


    function ClearProgress() {
      localStorage.clear();
      location.reload();
    }
