//variables defineren
    const sound = document.getElementById("clickSound");
    let teller = parseInt(localStorage.getItem("teller")) || 0;
    let CookiePerClick = parseInt(localStorage.getItem("CookiePerClick")) || 1;
    let PrijsUpgrade = parseInt(localStorage.getItem("PrijsUpgrade")) || 10;
    let PrijsAutoClicker = parseInt(localStorage.getItem("PrijsAutoClicker")) || 50;
    let CookiePerSecond = parseInt(localStorage.getItem("CookiePerSecond")) || 0;

    // Klassen en game-logica voor 8 autoclickers en 5 upgrades
    class AutoClickerType {
      constructor(id, name, baseCost, cpsPerUnit) {
        this.id = id;
        this.name = name;
        this.baseCost = baseCost;
        this.cpsPerUnit = cpsPerUnit;
      }

      getPrice(countOwned) {
        return Math.round(this.baseCost * Math.pow(1.15, countOwned));
      }
    }

    class Upgrade {
      constructor(id, name, baseCost, multiplierPerLevel) {
        this.id = id;
        this.name = name;
        this.baseCost = baseCost;
        this.multiplierPerLevel = multiplierPerLevel;
      }

      getPrice(level) {
        return Math.round(this.baseCost * Math.pow(2, level));
      }

      getMultiplier(level) {
        return Math.pow(this.multiplierPerLevel, level);
      }
    }

    class Game {
      constructor() {
        this.autoClickerTypes = [
          new AutoClickerType(0, "Cursor", 50, 1),
          new AutoClickerType(1, "Oma", 250, 2),
          new AutoClickerType(2, "Boerderij", 1000, 5),
          new AutoClickerType(3, "Mijn", 5000, 10),
          new AutoClickerType(4, "Fabriek", 20000, 20),
          new AutoClickerType(5, "Bank", 100000, 50),
          new AutoClickerType(6, "Tempel", 500000, 100),
          new AutoClickerType(7, "Tovenaarstoren", 2000000, 200)
        ];

        this.upgrades = [
          new Upgrade(0, "Sterkere handen", 100, 2),
          new Upgrade(1, "Snellere productie", 500, 2),
          new Upgrade(2, "Geoliede machines", 2500, 2),
          new Upgrade(3, "Efficiëntie boost", 12500, 2),
          new Upgrade(4, "Gouden tandwielen", 60000, 2)
        ];

        const saved = JSON.parse(localStorage.getItem("gameState") || "{}");
        this.ownedAutoClickers = saved.ownedAutoClickers || {};
        this.upgradeLevels = saved.upgradeLevels || {};

        this.autoClickerTypes.forEach(t => {
          if (typeof this.ownedAutoClickers[t.id] !== "number") {
            this.ownedAutoClickers[t.id] = 0;
          }
        });
        this.upgrades.forEach(u => {
          if (typeof this.upgradeLevels[u.id] !== "number") {
            this.upgradeLevels[u.id] = 0;
          }
        });
      }

      save() {
        localStorage.setItem(
          "gameState",
          JSON.stringify({
            ownedAutoClickers: this.ownedAutoClickers,
            upgradeLevels: this.upgradeLevels
          })
        );
      }

      getCpcMultiplier() {
        let multiplier = 1;
        for (const u of this.upgrades) {
          multiplier *= u.getMultiplier(this.upgradeLevels[u.id] || 0);
        }
        return multiplier;
      }

      getTotalCPS() {
        let base = 0;
        for (const t of this.autoClickerTypes) {
          base += (this.ownedAutoClickers[t.id] || 0) * t.cpsPerUnit;
        }
        // Upgrades beïnvloeden voortaan alleen Cookies Per Click
        return base;
      }

      getAutoClickerPrice(id) {
        const t = this.autoClickerTypes.find(x => x.id === id);
        return t.getPrice(this.ownedAutoClickers[id] || 0);
      }

      getUpgradePrice(id) {
        const u = this.upgrades.find(x => x.id === id);
        return u.getPrice(this.upgradeLevels[id] || 0);
      }

      buyAutoClicker(id) {
        const price = this.getAutoClickerPrice(id);
        let current = parseInt(localStorage.getItem("teller")) || 0;
        if (current < price) return false;
        current -= price;
        localStorage.setItem("teller", current);
        this.ownedAutoClickers[id] = (this.ownedAutoClickers[id] || 0) + 1;
        this.save();
        return true;
      }

      buyUpgrade(id) {
        const price = this.getUpgradePrice(id);
        let current = parseInt(localStorage.getItem("teller")) || 0;
        if (current < price) return false;
        current -= price;
        localStorage.setItem("teller", current);
        this.upgradeLevels[id] = (this.upgradeLevels[id] || 0) + 1;
        this.save();
        return true;
      }
    }

    const game = new Game();

    // Init vanuit game-klassen
    PrijsAutoClicker = game.getAutoClickerPrice(0);
    PrijsUpgrade = game.getUpgradePrice(0);
    CookiePerSecond = Math.floor(game.getTotalCPS());
    // Pas Cookies Per Click toe met upgrades
    CookiePerClick = (parseInt(localStorage.getItem("CookiePerClick")) || 1) * game.getCpcMultiplier();

    // Winkel renderen in de tabel-body met id ShopBody
    function renderExistingShop() {
      const tbody = document.getElementById("ShopBody");
      if (!tbody) return;

      // verwijder eerdere dynamische rijen
      Array.from(tbody.querySelectorAll("tr.dyn-row")).forEach(r => r.remove());

      // Autoclickers (alle 8)
      game.autoClickerTypes.forEach(t => {
        const owned = game.ownedAutoClickers[t.id] || 0;
        const price = game.getAutoClickerPrice(t.id);
        const tr = document.createElement("tr");
        tr.className = "dyn-row";
        const nameTd = document.createElement("td");
        nameTd.textContent = `Autoclicker - ${t.name} (x${owned})`;
        const priceTd = document.createElement("td");
        priceTd.textContent = String(price);
        const actionTd = document.createElement("td");
        const btn = document.createElement("button");
        btn.className = "btn btn-primary btn-sm";
        btn.textContent = "Koop";
        btn.addEventListener("click", () => {
          if (game.buyAutoClicker(t.id)) {
            teller = parseInt(localStorage.getItem("teller")) || 0;
            CookiePerSecond = Math.floor(game.getTotalCPS());
            document.getElementById("CookieCount").textContent = "Cookies:" + teller;
            document.getElementById("CookiePerSecond").textContent = "Cookies Per Second:" + CookiePerSecond;
            // prijzen worden alleen dynamisch in de shop getoond
            localStorage.setItem("CookiePerSecond", CookiePerSecond);
            renderExistingShop();
          } else {
            // optioneel feedback via alert, UI kan later uitgebreid worden
          }
        });
        actionTd.appendChild(btn);
        tr.appendChild(nameTd);
        tr.appendChild(priceTd);
        tr.appendChild(actionTd);
        tbody.appendChild(tr);
      });

      // Upgrades (alle 5)
      game.upgrades.forEach(u => {
        const level = game.upgradeLevels[u.id] || 0;
        const price = game.getUpgradePrice(u.id);
        const tr = document.createElement("tr");
        tr.className = "dyn-row";
        const nameTd = document.createElement("td");
        nameTd.textContent = `Upgrade - ${u.name} (lvl ${level})`;
        const priceTd = document.createElement("td");
        priceTd.textContent = String(price);
        const actionTd = document.createElement("td");
        const btn = document.createElement("button");
        btn.className = "btn btn-primary btn-sm";
        btn.textContent = "Koop";
        btn.addEventListener("click", () => {
          if (game.buyUpgrade(u.id)) {
            teller = parseInt(localStorage.getItem("teller")) || 0;
            CookiePerSecond = Math.floor(game.getTotalCPS());
            document.getElementById("CookieCount").textContent = "Cookies:" + teller;
            document.getElementById("CookiePerSecond").textContent = "Cookies Per Second:" + CookiePerSecond;
            // Upgrades verhogen CPC
            CookiePerClick = (parseInt(localStorage.getItem("CookiePerClick")) || 1) * game.getCpcMultiplier();
            document.getElementById("CookiePerClick").textContent = "Cookies Per Click:" + CookiePerClick;
            localStorage.setItem("CookiePerClick", CookiePerClick);
            localStorage.setItem("CookiePerSecond", CookiePerSecond);
            renderExistingShop();
          } else {
            // optioneel feedback via alert
          }
        });
        actionTd.appendChild(btn);
        tr.appendChild(nameTd);
        tr.appendChild(priceTd);
        tr.appendChild(actionTd);
        tbody.appendChild(tr);
      });
    }

    function PageLoaded() {
      document.getElementById("CookieCount").innerHTML = "Cookies:" + teller;
      document.getElementById("CookiePerClick").innerHTML = "Cookies Per Click:" + CookiePerClick;
      document.getElementById("CookiePerSecond").innerHTML = "Cookies Per Second:" + Math.floor(game.getTotalCPS());
      CookiePerSecondFunction();
      renderExistingShop();
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

    // Quick-knoppen verwijderd uit UI; functie blijft bestaan voor compatibiliteit
    function KoopAutoClicker() {
      // optioneel: koop eerste autoclicker
      if (game.buyAutoClicker(0)) {
        teller = parseInt(localStorage.getItem("teller")) || 0;
        CookiePerSecond = Math.floor(game.getTotalCPS());
        document.getElementById("CookiePerSecond").innerHTML = "Cookies Per Second:" + CookiePerSecond;
        document.getElementById("CookieCount").innerHTML = "Cookies:" + teller;
        localStorage.setItem("CookiePerSecond", CookiePerSecond);
        localStorage.setItem("teller", teller);
        renderExistingShop();
      }
    }

    //functie om cookie per click erbij te doen
    function CookiePerClickPlusOne() {
      if (game.buyUpgrade(0)) {
        teller = parseInt(localStorage.getItem("teller")) || 0;
        CookiePerSecond = Math.floor(game.getTotalCPS());
        document.getElementById("CookiePerSecond").innerHTML = "Cookies Per Second:" + CookiePerSecond;
        document.getElementById("CookieCount").innerHTML = "Cookies:" + teller;
        // Upgrades verhogen CPC
        CookiePerClick = (parseInt(localStorage.getItem("CookiePerClick")) || 1) * game.getCpcMultiplier();
        document.getElementById("CookiePerClick").innerHTML = "Cookies Per Click:" + CookiePerClick;
        localStorage.setItem("CookiePerClick", CookiePerClick);
        localStorage.setItem("CookiePerSecond", CookiePerSecond);
        localStorage.setItem("teller", teller);
        renderExistingShop();
      }
    }

function CookiePerSecondFunction() {
  CookiePerSecond = Math.floor(game.getTotalCPS());
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
    document.getElementById("CookiePerSecond").textContent = "Cookies Per Second:" + CookiePerSecond;

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
