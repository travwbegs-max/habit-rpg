let data = JSON.parse(localStorage.getItem("habitRPG")) || {
  habits: [],
  xp: 0,
  level: 1,
  gold: 0,
  bossHP: 100,
  avatar: "🧙",
  achievements: [],
  weekly: Array(7).fill(0),
  leaderboard: [],
  darkMode: false,
  lastReset: new Date().toDateString()
};

function save() {
  localStorage.setItem("habitRPG", JSON.stringify(data));
  render();
}

function dailyResetCheck() {
  const today = new Date().toDateString();
  if (data.lastReset !== today) {
    data.weekly = Array(7).fill(0);
    data.habits.forEach(h => h.doneToday = false);
    data.lastReset = today;
  }
}

function addHabit() {
  const name = prompt("Habit name?");
  if (!name) return;
  data.habits.push({ name, streak: 0, doneToday: false });
  save();
}

function completeHabit(i) {
  const habit = data.habits[i];
  if (habit.doneToday) return;

  habit.doneToday = true;
  habit.streak++;

  data.xp += 25;
  data.gold += 10;
  data.bossHP -= 15;

  data.weekly[new Date().getDay()]++;

  if (data.bossHP <= 0) {
    data.bossHP = 100;
    data.gold += 50;
  }

  levelCheck();
  achievementCheck();
  save();
}

function levelCheck() {
  const xpNeeded = data.level * 100;
  if (data.xp >= xpNeeded) {
    data.xp -= xpNeeded;
    data.level++;
  }
}

function achievementCheck() {
  if (data.level >= 5 && !data.achievements.includes("Level 5")) {
    data.achievements.push("Reached Level 5!");
  }
  if (data.gold >= 200 && !data.achievements.includes("Rich")) {
    data.achievements.push("Earned 200 Gold!");
  }
}

function changeAvatar() {
  const avatars = ["🧙","🦸","🥷","🐉","👑"];
  const choice = prompt("Pick number 0-4");
  if (avatars[choice]) {
    data.avatar = avatars[choice];
    save();
  }
}

function toggleDarkMode() {
  data.darkMode = !data.darkMode;
  save();
}

function exportData() {
  const blob = new Blob([JSON.stringify(data)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "habitRPGsave.json";
  a.click();
}

function importData(e) {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = function() {
    data = JSON.parse(reader.result);
    save();
  };
  reader.readAsText(file);
}

function renderBoss() {
  document.getElementById("boss").innerHTML = `
    <div class="boss">
      Boss HP: ${data.bossHP}
      <div class="progress-bar">
        <div style="width:${data.bossHP}%;background:red;height:20px;"></div>
      </div>
    </div>
  `;
}

function renderCalendar() {
  const cal = document.getElementById("calendar");
  cal.innerHTML = "";
  data.weekly.forEach(v=>{
    const div = document.createElement("div");
    div.className = "day";
    div.textContent = v + "✔";
    cal.appendChild(div);
  });
}

function renderChart() {
  const canvas = document.getElementById("chart");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0,0,canvas.width,canvas.height);
  data.weekly.forEach((v,i)=>{
    ctx.fillRect(i*40+10,150 - v*10,30,v*10);
  });
}

function renderLeaderboard() {
  data.leaderboard = [...data.leaderboard, data.level]
    .sort((a,b)=>b-a)
    .slice(0,5);

  document.getElementById("leaderboard").innerHTML =
    data.leaderboard.map((lvl,i)=>`#${i+1} - Level ${lvl}`).join("<br>");
}

function render() {
  dailyResetCheck();

  document.getElementById("level").textContent = data.level;
  document.getElementById("xp").textContent = data.xp;
  document.getElementById("xpNeeded").textContent = data.level * 100;
  document.getElementById("gold").textContent = data.gold;
  document.getElementById("avatar").textContent = data.avatar;

  document.getElementById("xpBar").style.width =
    (data.xp/(data.level*100))*100 + "%";

  const habitsEl = document.getElementById("habits");
  habitsEl.innerHTML = "";
  data.habits.forEach((h,i)=>{
    habitsEl.innerHTML += `
      <div class="habit">
        ${h.name} (Streak ${h.streak})
        <button onclick="completeHabit(${i})">Complete ⚔️</button>
      </div>
    `;
  });

  document.getElementById("achievements").innerHTML =
    data.achievements.join("<br>");

  renderBoss();
  renderCalendar();
  renderChart();
  renderLeaderboard();

  document.body.className = data.darkMode ? "dark" : "";
}

render();
