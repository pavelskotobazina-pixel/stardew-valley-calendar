import { useMemo, useState } from "react";
import clsx from "clsx";
import { Check, Search } from "lucide-react";
import { GAME_DATA } from "./generated/gameData";
import { useChecklist } from "./useChecklist";

type Season = "Весна" | "Лето" | "Осень" | "Зима";
type Weather = "любая" | "солнце" | "дождь";
type Stage = "year1" | "year2" | "desert" | "island" | "perfection";
type AppMode = "stardew" | "expanded";
type Tab = "home" | "calendar" | "center" | "fishing" | "farm" | "villagers" | "catalog" | "recipes" | "endgame" | "perfection";
type Crop = (typeof GAME_DATA.crops)[number];
type Fish = (typeof GAME_DATA.fish)[number];
type Bundle = (typeof GAME_DATA.bundles)[number];
type Schedule = { label: string; rows: Array<{ time: string; place: string; note: string }> };

const seasons: Season[] = ["Весна", "Лето", "Осень", "Зима"];
const weatherOptions: Weather[] = ["любая", "солнце", "дождь"];
const seasonKey: Record<Season, string> = { Весна: "spring", Лето: "summer", Осень: "fall", Зима: "winter" };
const seasonAccent: Record<Season, string> = { Весна: "spring", Лето: "summer", Осень: "fall", Зима: "winter" };
const seasonScene: Record<Season, string> = {
  Весна: "/game/ui/map-spring-scene.png",
  Лето: "/game/ui/map-summer-scene.png",
  Осень: "/game/ui/map-fall-scene.png",
  Зима: "/game/ui/map-winter-scene.png",
};

const stageOptions: Array<{ id: Stage; label: string; note: string }> = [
  { id: "year1", label: "Год 1", note: "без поздних зон" },
  { id: "year2", label: "Год 2+", note: "новые семена и события" },
  { id: "desert", label: "Пустыня", note: "автобус, оазис, черепная пещера" },
  { id: "island", label: "Остров", note: "лодка Вилли, орехи, вулкан" },
  { id: "perfection", label: "Перфекшен", note: "Qi и финальные цели" },
];

const navItems: Array<{ id: Tab; label: string; icon: string; hint: string }> = [
  { id: "home", label: "Дом", icon: "/game/items/688.png", hint: "рабочий стол дня" },
  { id: "calendar", label: "Календарь", icon: "/game/ui/calendar-icon.png", hint: "сезоны, события, дни рождения" },
  { id: "center", label: "Центр", icon: "/game/ui/center-icon.png", hint: "узелки и комнаты" },
  { id: "fishing", label: "Рыбалка", icon: "/game/items/143.png", hint: "рыба, ловушки, легендарная" },
  { id: "farm", label: "Ферма", icon: "/game/items/24.png", hint: "посевы, сбор, прибыль" },
  { id: "villagers", label: "Жители", icon: "/game/portraits/Abigail.png", hint: "подарки и маршруты" },
  { id: "catalog", label: "Каталог", icon: "/game/items/434.png", hint: "поиск по предметам" },
  { id: "recipes", label: "Рецепты", icon: "/game/items/194.png", hint: "готовка и крафт" },
  { id: "endgame", label: "Endgame", icon: "/game/items/73.png", hint: "остров, Qi, поздняя игра" },
  { id: "perfection", label: "Perfection", icon: "/game/buildings/gold_clock.png", hint: "100% прогресс" },
];

const modeOptions: Array<{ id: AppMode; label: string; note: string; icon: string }> = [
  { id: "stardew", label: "Stardew", note: "основная долина", icon: "/game/ui/logo.png" },
  { id: "expanded", label: "Expanded", note: "моды отдельно", icon: "/game/sve/portraits/Sophia_face.png" },
];

const expandedModules = [
  {
    id: "sve",
    title: "Stardew Valley Expanded",
    subtitle: "версия 1.15.11, база из локальной папки модов",
    icon: "/game/sve/portraits/Sophia_face.png",
    art: "/game/sve/maps/fall_SVE_WorldMap.png",
    stats: ["290 JSON", "1164 PNG", "SVE Wiki"],
  },
  {
    id: "ridgeside",
    title: "Ridgeside Village",
    subtitle: "отдельная деревня, жители, события и подарки",
    icon: "/game/items/688.png",
    art: "/game/ui/map-fall-scene.png",
    stats: ["мод найден", "ждёт парсинга", "отдельная база"],
  },
  {
    id: "east-scarp",
    title: "East Scarp",
    subtitle: "дополнительные NPC и локации без смешивания с vanilla",
    icon: "/game/items/221.png",
    art: "/game/sve/maps/fall_Highlands_WorldMap.png",
    stats: ["мод найден", "ждёт парсинга", "маршруты позже"],
  },
];

const expandedSpotlight = [
  { id: "sophia", title: "София", text: "первая карточка SVE-жителей; портрет взят из локальных файлов мода", icon: "/game/sve/portraits/Sophia_face.png" },
  { id: "lance", title: "Лэнс", text: "будет отдельная цепочка поздней игры, подарков и маршрутов", icon: "/game/sve/portraits/Lance_face.png" },
  { id: "apples", title: "Apples", text: "магическая ветка SVE; русские строки будем брать из i18n и wiki", icon: "/game/sve/portraits/Apples_face.png" },
  { id: "aurora", title: "Aurora Vineyard", text: "отдельный прогресс-узел Expanded с заданиями и восстановлением", icon: "/game/sve/items/AuroraVineyardDeed.png" },
];

const expandedResidents = [
  ["Sophia", "София", "Blue Moon Vineyard", "роман, виноградник, ранний SVE-маршрут"],
  ["Lance", "Лэнс", "Highlands / Ginger Island", "поздняя игра, события и боевая ветка"],
  ["Andy", "Энди", "Fairhaven Farm", "фермер, подарки и ранние события"],
  ["Claire", "Клэр", "JojaMart / Town", "работа, расписания, роман"],
  ["Olivia", "Оливия", "Jenkins Residence", "подарки, события, роман"],
  ["Victor", "Виктор", "Jenkins Residence", "роман и городские маршруты"],
  ["Susan", "Сьюзан", "Railroad", "открывается после железной дороги"],
  ["Martin", "Мартин", "JojaMart", "расписания и подарки"],
  ["Morris", "Моррис", "Joja route", "важен для Joja-прогрессии"],
  ["Marlon", "Марлон", "Adventurer's Guild", "SVE-расширение гильдии"],
  ["Magnus", "Магнус", "Wizard Tower", "расширенный Волшебник"],
  ["Morgan", "Морган", "Wizard Tower", "магическая ветка"],
  ["Scarlett", "Скарлетт", "Grampleton", "связана с Софией"],
  ["Isaac", "Айзек", "Crimson Badlands", "поздняя боевая зона"],
  ["Camilla", "Камилла", "Castle Village", "поздняя магическая ветка"],
] as const;

const expandedLocations = [
  ["Stardew Valley Expanded", "/game/sve/maps/fall_SVE_WorldMap.png", "расширенная карта долины", "новые дома, маршруты, виноградник и зоны"],
  ["Highlands", "/game/sve/maps/fall_Highlands_WorldMap.png", "поздняя зона", "Лэнс, монстры, ресурсы и отдельный маршрут"],
  ["Crimson Badlands", "/game/sve/maps/CrimsonBadlandsMap.png", "опасная локация", "поздний боевой контент и редкие материалы"],
  ["Grampleton Suburbs", "/game/sve/maps/fall_GrampletonSuburbs_WorldMap.png", "расширение мира", "связи с SVE и будущими NPC"],
  ["Joja Route", "/game/sve/maps/fall_Joja_WorldMap.png", "альтернативная прогрессия", "отдельная логика для Joja-пути"],
] as const;

const expandedRoadmap = [
  ["expanded:parse:i18n", "/game/items/801.png", "Разобрать ru.json SVE", "русские строки, имена, события, предметы"],
  ["expanded:parse:residents", "/game/sve/portraits/Sophia_face.png", "Собрать жителей", "портреты, подарки, дни рождения, расписания"],
  ["expanded:parse:locations", "/game/items/688.png", "Собрать локации", "карты, переходы, условия открытия"],
  ["expanded:parse:quests", "/game/items/772.png", "Собрать квесты и события", "цепочки Aurora Vineyard, Joja, Highlands"],
  ["expanded:wiki:verify", "/game/items/709.png", "Сверить с wiki", "после локального парсинга проверить спорные места"],
] as const;

const installedContentMods = [
  ["Stardew Valley Expanded", "ядро Expanded", "/game/sve/portraits/Sophia_face.png"],
  ["Ridgeside Village", "деревня и жители", "/game/items/688.png"],
  ["East Scarp", "NPC и локации", "/game/items/221.png"],
  ["Sword & Sorcery", "магическая ветка", "/game/items/337.png"],
  ["Lurking in the Dark", "сюжетный мод", "/game/items/769.png"],
  ["Juliet & Jessie", "NPC pack", "/game/items/221.png"],
  ["Rodney O'Brien", "NPC pack", "/game/items/221.png"],
  ["Eli and Dylan", "NPC pack", "/game/items/221.png"],
  ["Leilani", "NPC pack", "/game/items/398.png"],
  ["Nora the Herpetologist", "NPC pack", "/game/items/684.png"],
] as const;

const roomIcons: Record<string, string> = {
  "Кладовая": "/game/items/24.png",
  "Аквариум": "/game/items/143.png",
  "Котельная": "/game/items/334.png",
  "Сейф": "/game/items/384.png",
  "Мастерская": "/game/items/388.png",
  "Доска объявлений": "/game/items/221.png",
  "Заброшенный ДжоджаМарт": "/game/items/74.png",
};

const stageOrder: Record<string, number> = { year1: 0, year2: 1, late: 1, desert: 2, greenhouse: 2, island: 3, perfection: 4 };
const legendaryIds = new Set(["163", "160", "682", "159", "775", "900", "901", "902", "898", "899"]);

function asset(path: string | undefined) {
  if (!path) return "";
  if (/^(https?:|data:|blob:)/.test(path)) return path;
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
}

function imageFallback(event: { currentTarget: HTMLImageElement }) {
  const image = event.currentTarget;
  if (image.dataset.fallback === "1") return;
  image.dataset.fallback = "1";
  image.src = asset("/game/items/434.png");
}

function canUseStage(itemStage: string | undefined, current: Stage) {
  return (stageOrder[itemStage || "year1"] ?? 0) <= (stageOrder[current] ?? 0);
}

function dayLabel(season: Season, day: number) {
  return `${season}, день ${day}`;
}

function lastPlantDay(crop: Crop) {
  return Math.max(1, 29 - crop.days);
}

function cropUrgency(crop: Crop, day: number) {
  const last = lastPlantDay(crop);
  if (day > last) return "поздно";
  if (last - day <= 2) return "последний шанс";
  return "";
}

function compactScheduleRows(rows: Schedule["rows"]) {
  const compacted: Array<[string, string]> = [];
  for (const row of rows) {
    const place = `${row.place}${row.note ? `: ${row.note}` : ""}`;
    const previous = compacted[compacted.length - 1];
    if (previous && previous[1] === place) {
      const start = previous[0].split("-")[0];
      previous[0] = `${start}-${row.time}`;
    } else {
      compacted.push([row.time, place]);
    }
  }
  return compacted;
}

function fishKind(fish: Fish) {
  if (legendaryIds.has(fish.id)) return "legendary";
  if (fish.difficulty === 0 || fish.time === "весь день") return "trap";
  if (fish.stage === "island" || fish.stage === "desert" || fish.stage === "perfection") return "special";
  return "regular";
}

function weekDayKey(day: number) {
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][(day - 1) % 7];
}

function giftWeekInfo(day: number) {
  const index = day < 7 ? 0 : Math.floor((day - 7) / 7) + 1;
  const start = day < 7 ? 1 : 7 + (index - 1) * 7;
  const end = Math.min(28, start + (day < 7 ? 5 : 6));
  return {
    index,
    start,
    end,
    label: `Неделя ${index + 1}: дни ${start}-${end}`,
  };
}

function clampDay(day: number) {
  return Math.max(1, Math.min(28, day));
}

function pickSchedule(villager: (typeof GAME_DATA.villagers)[number] | undefined, season: Season, day: number, weather: Weather) {
  if (!villager) return undefined;
  const schedules = villager.schedules as Record<string, Schedule>;
  const candidates = [
    weather === "дождь" ? "rain" : "",
    `${seasonKey[season]}_${day}`,
    String(day),
    weekDayKey(day),
    seasonKey[season],
  ].filter(Boolean);
  const key = candidates.find((candidate) => schedules[candidate]);
  return key ? schedules[key] : Object.values(schedules)[0];
}

function itemById(id: string) {
  return GAME_DATA.catalogItems.find((item) => item.id === id) ?? GAME_DATA.items.find((item) => item.id === id);
}

function rewardView(reward: string | undefined) {
  if (!reward) return null;
  const tokens = reward.split(/\s+/);
  if (tokens[0] === "O" && tokens[1]) {
    const item = itemById(tokens[1]);
    const amount = Number(tokens[2] || "1");
    return {
      icon: item ? `/game/items/${item.id}.png` : "/game/items/434.png",
      label: `${item?.displayName ?? "Предмет"}${amount > 1 ? ` x${amount}` : ""}`,
    };
  }
  if (tokens[0] === "BO" || tokens[0] === "BC") return { icon: "/game/items/388.png", label: "Постройка / крафт" };
  return { icon: "/game/items/434.png", label: "Награда узелка" };
}

function CalendarApp() {
  const [active, setActive] = useState<Tab>("home");
  const [mode, setMode] = useState<AppMode>("stardew");
  const [season, setSeason] = useState<Season>("Осень");
  const [day, setDay] = useState(14);
  const [stage, setStage] = useState<Stage>("year1");
  const [currentWeather, setCurrentWeather] = useState<Weather>("дождь");
  const [query, setQuery] = useState("");
  const { checked, toggle, replace, count } = useChecklist("stardew-companion-v5");

  const lowerQuery = query.trim().toLowerCase();
  const dayKey = `${seasonKey[season]}${day}`;
  const selectedDay = GAME_DATA.calendar.find((entry) => entry.key === dayKey);
  const seasonDays = GAME_DATA.calendar.filter((entry) => entry.season === season);
  const currentStage = stageOptions.find((item) => item.id === stage) ?? stageOptions[0];
  const weekInfo = giftWeekInfo(day);

  const availableFish = useMemo(() => GAME_DATA.fish.filter((entry) => {
    const seasonMatch = entry.seasons.includes(season);
    const weatherMatch = currentWeather === "любая" || entry.weather === "любая" || entry.weather === currentWeather;
    const queryMatch = !lowerQuery || entry.name.toLowerCase().includes(lowerQuery) || entry.locations.join(" ").toLowerCase().includes(lowerQuery);
    return seasonMatch && weatherMatch && canUseStage(entry.stage, stage) && queryMatch;
  }), [season, currentWeather, lowerQuery, stage]);

  const seasonalCrops = useMemo(() => GAME_DATA.crops.filter((entry) => {
    const seasonMatch = entry.seasons.includes(season);
    const canFinish = entry.days <= 0 || day + entry.days - 1 <= 28 || entry.regrow > 0;
    const queryMatch = !lowerQuery || entry.name.toLowerCase().includes(lowerQuery) || entry.seedName.toLowerCase().includes(lowerQuery);
    return seasonMatch && canFinish && canUseStage(entry.stage, stage) && queryMatch;
  }), [season, day, lowerQuery, stage]);

  const seasonalForage = useMemo(() => GAME_DATA.forage.filter((entry) => {
    const seasonMatch = entry.seasons.includes(season) || entry.seasons.includes("любой сезон");
    const queryMatch = !lowerQuery || entry.name.toLowerCase().includes(lowerQuery) || entry.source.toLowerCase().includes(lowerQuery);
    return seasonMatch && canUseStage(entry.stage, stage) && queryMatch;
  }), [season, lowerQuery, stage]);

  const birthdaysToday = GAME_DATA.villagers.filter((entry) => entry.birthdaySeason === season && entry.birthdayDay === day);
  const birthdaysSeason = GAME_DATA.villagers.filter((entry) => entry.birthdaySeason === season);
  const urgentBundles = GAME_DATA.bundles.filter((bundle) => bundle.items.some((item) => {
    return seasonalCrops.some((crop) => crop.id === item.id) || availableFish.some((fish) => fish.id === item.id) || seasonalForage.some((forage) => forage.id === item.id);
  }));
  const lastChanceCrops = seasonalCrops.filter((crop) => cropUrgency(crop, day) === "последний шанс").slice(0, 6);
  const lockedFish = GAME_DATA.fish.filter((entry) => entry.seasons.includes(season) && !canUseStage(entry.stage, stage)).length;
  const lockedCrops = GAME_DATA.crops.filter((entry) => entry.seasons.includes(season) && !canUseStage(entry.stage, stage)).length;

  async function exportSave() {
    const payload = JSON.stringify({ version: 4, date: new Date().toISOString(), checked }, null, 2);
    try {
      await navigator.clipboard.writeText(payload);
      window.alert("Сейв отметок скопирован в буфер.");
    } catch {
      window.prompt("Скопируй сейв отметок:", payload);
    }
  }

  function importSave() {
    const raw = window.prompt("Вставь сейв отметок:");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as { checked?: Record<string, boolean> } | Record<string, boolean>;
      const next = "checked" in parsed && parsed.checked ? parsed.checked : parsed;
      replace(Object.fromEntries(Object.entries(next).filter(([, value]) => typeof value === "boolean")));
    } catch {
      window.alert("Не получилось прочитать JSON сейва.");
    }
  }

  return (
    <main className={clsx("valley-shell", seasonAccent[season])}>
      <div className="pixel-sky" />
      <section className="game-frame">
        <header className="farm-header">
          <div className="brand-plaque mode-switchboard">
            <button className="brand-home" onClick={() => { setMode("stardew"); setActive("home"); }} aria-label="Дом">
              <img src={asset(mode === "expanded" ? "/game/sve/portraits/Sophia_face.png" : "/game/ui/logo.png")} onError={imageFallback} alt="" />
              <span>{mode === "expanded" ? "Expanded Desk" : "Stardew Desk"}</span>
            </button>
            <div className="mode-tabs" aria-label="Режим базы">
              {modeOptions.map((item) => (
                <button key={item.id} className={clsx(mode === item.id && "active")} type="button" onClick={() => setMode(item.id)}>
                  <img src={asset(item.icon)} onError={imageFallback} alt="" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
            <p className="mode-caption">{mode === "expanded" ? "отдельная модовая база без vanilla-каши" : "рабочий стол основной долины"}</p>
          </div>
          <div className="date-plaque">
            <span className="eyebrow">{mode === "expanded" ? "Expanded workspace" : active === "home" ? "Рабочий стол" : navItems.find((item) => item.id === active)?.label}</span>
            <strong>{dayLabel(season, day)}</strong>
            <small>{mode === "expanded" ? "Stardew Valley Expanded и крупные моды: отдельная база без смешивания" : `${currentStage.label}: ${currentStage.note}`}</small>
            <div className="date-badges">
              <span>{weekInfo.label}</span>
              <span>{mode === "expanded" ? `${expandedModules.length} модовых контуров` : selectedDay?.events.length ? `${selectedDay.events.length} события` : "спокойный день"}</span>
            </div>
          </div>
          <DateConsole
            season={season}
            setSeason={setSeason}
            day={day}
            setDay={setDay}
            weather={currentWeather}
            setWeather={setCurrentWeather}
            stage={stage}
            setStage={setStage}
            query={query}
            setQuery={setQuery}
            weekLabel={weekInfo.label}
          />
        </header>

        {mode === "stardew" && (
          <nav className="object-nav" aria-label="Разделы">
            {navItems.map((item) => (
              <button key={item.id} className={clsx("object-tab", active === item.id && "active")} onClick={() => setActive(item.id)} title={item.hint}>
                <img src={asset(item.icon)} onError={imageFallback} alt="" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        )}

        <section className="content-stage">
          {mode === "expanded" && <ExpandedDesk checked={checked} toggle={toggle} />}
          {mode === "stardew" && active === "home" && <HomeDesk season={season} day={day} selectedDay={selectedDay} seasonDays={seasonDays} setDay={setDay} setActive={setActive} fish={availableFish} crops={seasonalCrops} forage={seasonalForage} bundles={urgentBundles} birthdaysToday={birthdaysToday} birthdaysSeason={birthdaysSeason} lastChanceCrops={lastChanceCrops} lockedFish={lockedFish} lockedCrops={lockedCrops} count={count} checked={checked} toggle={toggle} />}
          {mode === "stardew" && active === "calendar" && <CalendarWall season={season} day={day} setDay={setDay} seasonDays={seasonDays} birthdaysSeason={birthdaysSeason} selectedDay={selectedDay} fish={availableFish} crops={seasonalCrops} forage={seasonalForage} />}
          {mode === "stardew" && active === "center" && <CenterView bundles={GAME_DATA.bundles} checked={checked} toggle={toggle} query={lowerQuery} />}
          {mode === "stardew" && active === "fishing" && <FishingView fish={availableFish} checked={checked} toggle={toggle} season={season} weather={currentWeather} />}
          {mode === "stardew" && active === "farm" && <FarmView crops={seasonalCrops} forage={seasonalForage} checked={checked} toggle={toggle} day={day} season={season} stage={stage} />}
          {mode === "stardew" && active === "villagers" && <VillagersView villagers={GAME_DATA.villagers.filter((v) => !lowerQuery || v.name.toLowerCase().includes(lowerQuery))} checked={checked} toggle={toggle} season={season} day={day} weather={currentWeather} stage={stage} />}
          {mode === "stardew" && active === "catalog" && <CatalogView query={lowerQuery} checked={checked} toggle={toggle} />}
          {mode === "stardew" && active === "recipes" && <RecipesView query={lowerQuery} checked={checked} toggle={toggle} />}
          {mode === "stardew" && active === "endgame" && <EndgameView checked={checked} toggle={toggle} />}
          {mode === "stardew" && active === "perfection" && <PerfectionView checked={checked} toggle={toggle} count={count} />}
        </section>

        <footer className="rights-strip">
          <span>Неофициальный локальный фан-сайт. Stardew Valley, игровые изображения, названия, персонажи и ассеты принадлежат ConcernedApe и правообладателям. Материалы используются в личных справочных и информационных целях.</span>
          <div className="save-tools">
            <b>{count} отметок</b>
            <button onClick={exportSave}>Скопировать сейв</button>
            <button onClick={importSave}>Вставить сейв</button>
          </div>
        </footer>
      </section>
    </main>
  );
}

function DateConsole({
  season,
  setSeason,
  day,
  setDay,
  weather,
  setWeather,
  stage,
  setStage,
  query,
  setQuery,
  weekLabel,
}: {
  season: Season;
  setSeason: (season: Season) => void;
  day: number;
  setDay: (day: number) => void;
  weather: Weather;
  setWeather: (weather: Weather) => void;
  stage: Stage;
  setStage: (stage: Stage) => void;
  query: string;
  setQuery: (query: string) => void;
  weekLabel: string;
}) {
  const weatherIcons: Record<Weather, string> = {
    любая: "/game/items/688.png",
    солнце: "/game/items/421.png",
    дождь: "/game/items/681.png",
  };

  return (
    <div className="farm-controls date-console" aria-label="Настройки дня">
      <div className="season-dial" aria-label="Сезон">
        {seasons.map((item) => (
          <button key={item} className={clsx("season-chip", season === item && "active")} onClick={() => setSeason(item)} type="button">
            {item}
          </button>
        ))}
      </div>
      <div className="day-console">
        <button type="button" onClick={() => setDay(clampDay(day - 1))} aria-label="Предыдущий день">‹</button>
        <label>
          <span>день</span>
          <input value={day} onChange={(event) => setDay(clampDay(Number(event.target.value) || 1))} min={1} max={28} type="number" />
        </label>
        <button type="button" onClick={() => setDay(clampDay(day + 1))} aria-label="Следующий день">›</button>
      </div>
      <div className="weather-dial" aria-label="Погода">
        {weatherOptions.map((item) => (
          <button key={item} className={clsx("weather-chip", weather === item && "active")} onClick={() => setWeather(item)} type="button" title={item}>
            <img src={asset(weatherIcons[item])} onError={imageFallback} alt="" />
            <span>{item}</span>
          </button>
        ))}
      </div>
      <label className="stage-badge">
        <span>{weekLabel}</span>
        <select value={stage} onChange={(event) => setStage(event.target.value as Stage)}>
          {stageOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
      </label>
      <label className="search-plaque">
        <Search size={15} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="поиск" />
      </label>
    </div>
  );
}

function ExpandedDesk({ checked, toggle }: { checked: Record<string, boolean>; toggle: (id: string) => void }) {
  const [panel, setPanel] = useState<"overview" | "residents" | "locations" | "roadmap">("overview");
  return (
    <section className="expanded-desk">
      <SectionHero
        kicker="Expanded mode"
        title="Отдельный стол для модовой долины"
        text="Здесь Expanded не смешивается с основной игрой: SVE, Ridgeside, East Scarp и другие крупные моды будут жить своей базой, отметками и маршрутами."
        icon="/game/sve/portraits/Sophia_face.png"
        stats={[
          ["SVE", "1.15.11"],
          ["Ассеты", "локально"],
          ["База", "отдельно"],
        ]}
      />

      <div className="expanded-tabs game-panel" aria-label="Expanded sections">
        {[
          ["overview", "Обзор", "/game/sve/portraits/Sophia_face.png"],
          ["residents", "Жители", "/game/items/221.png"],
          ["locations", "Локации", "/game/items/688.png"],
          ["roadmap", "Прогресс", "/game/items/772.png"],
        ].map(([id, label, icon]) => (
          <button key={id} className={clsx(panel === id && "active")} onClick={() => setPanel(id as typeof panel)} type="button">
            <img src={asset(icon)} onError={imageFallback} alt="" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {panel === "overview" && (
        <>
          <div className="expanded-grid">
            {expandedModules.map((module) => (
              <article className="expanded-card game-panel" key={module.id}>
                <div className="expanded-art"><img src={asset(module.art)} onError={imageFallback} alt="" /></div>
                <div className="expanded-card-copy">
                  <img src={asset(module.icon)} onError={imageFallback} alt="" />
                  <div>
                    <h3>{module.title}</h3>
                    <p>{module.subtitle}</p>
                  </div>
                </div>
                <div className="tag-row">{module.stats.map((item) => <span key={item}>{item}</span>)}</div>
                <TaskCheck id={`expanded:${module.id}:audit`} icon={module.icon} title="Собрать базу мода" meta="NPC, предметы, карты, квесты, подарки, события" checked={checked} toggle={toggle} />
              </article>
            ))}
          </div>

          <section className="expanded-road game-panel">
            <PanelTitle kicker="Первые узлы Expanded" title="Что попадёт в следующий слой базы" />
            <div className="expanded-spotlight">
              {expandedSpotlight.map((item) => (
                <GuideRune key={item.id} icon={item.icon} title={item.title} text={item.text} />
              ))}
            </div>
          </section>

          <section className="mod-shelf game-panel">
            <PanelTitle kicker="Локальная сборка" title="Контентные моды, которые уже найдены" />
            <div className="mod-token-grid">
              {installedContentMods.map(([title, note, icon]) => (
                <span className="mod-token" key={title}>
                  <img src={asset(icon)} onError={imageFallback} alt="" />
                  <b>{title}</b>
                  <small>{note}</small>
                </span>
              ))}
            </div>
          </section>
        </>
      )}

      {panel === "residents" && (
        <section className="expanded-residents game-panel">
          <PanelTitle kicker="SVE residents" title="Первые жители Expanded" />
          <div className="resident-book">
            {expandedResidents.map(([id, name, place, note]) => (
              <article className="resident-card" key={id}>
                <img src={asset(`/game/sve/portraits/${id}_face.png`)} onError={imageFallback} alt="" />
                <div>
                  <h3>{name}</h3>
                  <span>{place}</span>
                  <p>{note}</p>
                </div>
                <CheckButton id={`expanded:resident:${id}`} checked={checked} toggle={toggle} label="в план" />
              </article>
            ))}
          </div>
        </section>
      )}

      {panel === "locations" && (
        <section className="expanded-locations">
          {expandedLocations.map(([title, art, type, note]) => (
            <article className="location-card game-panel" key={title}>
              <img src={asset(art)} onError={imageFallback} alt="" />
              <div>
                <PanelTitle kicker={type} title={title} />
                <p>{note}</p>
                <TaskCheck id={`expanded:location:${title}`} icon="/game/items/688.png" title="Проверить условия открытия" meta="позже связать с wiki и локальными событиями" checked={checked} toggle={toggle} />
              </div>
            </article>
          ))}
        </section>
      )}

      {panel === "roadmap" && (
        <section className="expanded-road game-panel">
          <PanelTitle kicker="Pipeline" title="Как дальше собирается Expanded-база" />
          {expandedRoadmap.map(([id, icon, title, meta], index) => (
            <TaskCheck key={id} id={id} icon={icon} title={`${index + 1}. ${title}`} meta={meta} checked={checked} toggle={toggle} />
          ))}
        </section>
      )}
    </section>
  );
}

function HomeDesk(props: {
  season: Season;
  day: number;
  selectedDay: (typeof GAME_DATA.calendar)[number] | undefined;
  seasonDays: typeof GAME_DATA.calendar;
  setDay: (day: number) => void;
  setActive: (tab: Tab) => void;
  fish: typeof GAME_DATA.fish;
  crops: typeof GAME_DATA.crops;
  forage: typeof GAME_DATA.forage;
  bundles: typeof GAME_DATA.bundles;
  birthdaysToday: typeof GAME_DATA.villagers;
  birthdaysSeason: typeof GAME_DATA.villagers;
  lastChanceCrops: typeof GAME_DATA.crops;
  lockedFish: number;
  lockedCrops: number;
  count: number;
  checked: Record<string, boolean>;
  toggle: (id: string) => void;
}) {
  const shelfItems = [...props.birthdaysToday, ...props.fish, ...props.crops, ...props.forage].slice(0, 18);
  return (
    <div className="workbench-layout">
      <section className="desk-calendar game-panel">
        <div className="map-window"><img src={asset(seasonScene[props.season])} onError={imageFallback} alt="" /></div>
        <div className="calendar-sheet">
          <PanelTitle kicker="Календарь долины" title={props.season} />
          <CalendarGrid seasonDays={props.seasonDays} day={props.day} setDay={props.setDay} />
        </div>
      </section>

      <section className="today-ledger game-panel">
        <PanelTitle kicker="Выбранный день" title={dayLabel(props.season, props.day)} />
        <EventStrip events={props.selectedDay?.events ?? []} />
        <div className="shelf-grid">
          {shelfItems.map((entry) => "portrait" in entry ? <PortraitToken key={`p:${entry.id}`} villager={entry} /> : <ItemToken key={`i:${entry.id}:${entry.name}`} icon={entry.icon} label={entry.name} />)}
        </div>
        <div className="daily-summary">
          <SummaryTile icon="/game/items/143.png" value={props.fish.length} label="рыба" />
          <SummaryTile icon="/game/items/24.png" value={props.crops.length} label="посевы" />
          <SummaryTile icon="/game/items/398.png" value={props.forage.length} label="сбор" />
        <SummaryTile icon="/game/ui/center-icon.png" value={props.bundles.length} label="узелки" />
        </div>
        <div className="warning-ledger">
          {props.lastChanceCrops.length > 0 ? <b>Последний шанс: {props.lastChanceCrops.map((crop) => crop.name).join(", ")}</b> : <b>Окна спокойные: можно закрывать план без гонки.</b>}
          {(props.lockedFish > 0 || props.lockedCrops > 0) && <span>Скрыто стадией: рыба {props.lockedFish}, посевы {props.lockedCrops}</span>}
        </div>
        <div className="ledger-cards">
          <GuideRune icon="/game/items/688.png" title="Сначала день" text="Календарь задаёт сезон, погоду, год и скрывает лишние окна прогресса." />
          <GuideRune icon="/game/items/709.png" title="Потом маршрут" text="Рыба, посевы и узелки собираются из выбранной даты в один короткий план." />
        </div>
      </section>

      <section className="quest-board game-panel">
        <PanelTitle kicker="Маршрут дня" title="Что сделать первым" />
        <TaskCheck id={`day:${props.season}:${props.day}:fish`} icon="/game/items/143.png" title="Поймать доступную рыбу" meta={`${props.fish.length} вариантов с текущими фильтрами`} checked={props.checked} toggle={props.toggle} />
        <TaskCheck id={`day:${props.season}:${props.day}:crop`} icon="/game/items/24.png" title="Проверить посадки" meta={`${props.crops.length} культур успевают до конца сезона`} checked={props.checked} toggle={props.toggle} />
        <TaskCheck id={`day:${props.season}:${props.day}:bundle`} icon="/game/ui/center-icon.png" title="Закрыть узелки" meta={`${props.bundles.length} связок пересекаются с днем`} checked={props.checked} toggle={props.toggle} />
        <TaskCheck id={`day:${props.season}:${props.day}:gifts`} icon="/game/items/221.png" title="Подарки и дни рождения" meta={props.birthdaysToday.length ? props.birthdaysToday.map((item) => item.name).join(", ") : `${props.birthdaysSeason.length} дней рождения в сезоне`} checked={props.checked} toggle={props.toggle} />
      </section>

      <section className="desk-shortcuts">
        <ShortcutCard icon="/game/ui/center-icon.png" title="Центр" meta={`${props.bundles.length} актуальных`} onClick={() => props.setActive("center")} />
        <ShortcutCard icon="/game/items/143.png" title="Рыбалка" meta={`${props.fish.length} по погоде`} onClick={() => props.setActive("fishing")} />
        <ShortcutCard icon="/game/items/24.png" title="Ферма" meta={`${props.crops.length} посевов`} onClick={() => props.setActive("farm")} />
        <ShortcutCard icon="/game/portraits/Abigail.png" title="Жители" meta={`${props.birthdaysSeason.length} дней рождения`} onClick={() => props.setActive("villagers")} />
        <ShortcutCard icon="/game/buildings/gold_clock.png" title="Perfection" meta={`${props.count} отметок`} onClick={() => props.setActive("perfection")} />
      </section>
    </div>
  );
}

function CalendarWall({ season, day, setDay, seasonDays, birthdaysSeason, selectedDay, fish, crops, forage }: {
  season: Season;
  day: number;
  setDay: (day: number) => void;
  seasonDays: typeof GAME_DATA.calendar;
  birthdaysSeason: typeof GAME_DATA.villagers;
  selectedDay: (typeof GAME_DATA.calendar)[number] | undefined;
  fish: typeof GAME_DATA.fish;
  crops: typeof GAME_DATA.crops;
  forage: typeof GAME_DATA.forage;
}) {
  return (
    <div className="stacked-view">
      <SectionHero
        kicker="Season board"
        title="Календарь как настенная доска"
        text="Выбери день и сразу увидишь события, дни рождения, сезонные окна рыбы, посевов и сбора без лишней энциклопедии."
        icon="/game/ui/calendar-icon.png"
        stats={[["День", day], ["Рыба", fish.length], ["Посевы", crops.length]]}
      />
      <div className="calendar-layout">
      <section className="wall-calendar game-panel">
        <div className="calendar-hero"><img src={asset(seasonScene[season])} onError={imageFallback} alt="" /></div>
        <div className="calendar-sheet big">
          <PanelTitle kicker="Сезонная доска" title={season} />
          <CalendarGrid seasonDays={seasonDays} day={day} setDay={setDay} />
        </div>
      </section>
      <aside className="calendar-inspector game-panel">
        <PanelTitle kicker="День выбран" title={dayLabel(season, day)} />
        <EventStrip events={selectedDay?.events ?? []} />
        <MiniBoard title="Окна дня" items={[
          ...fish.slice(0, 6).map((item) => ({ id: `f:${item.id}`, icon: item.icon, name: item.name, note: `${item.weather}, ${item.time}` })),
          ...crops.slice(0, 5).map((item) => ({ id: `c:${item.id}`, icon: item.icon, name: item.name, note: `${item.days} дн.` })),
          ...forage.slice(0, 5).map((item) => ({ id: `g:${item.id}`, icon: item.icon, name: item.name, note: item.source })),
        ]} />
        <section className="birthday-strip">
          <h3>Дни рождения сезона</h3>
          {birthdaysSeason.map((villager) => <PortraitToken key={villager.id} villager={villager} />)}
        </section>
      </aside>
      </div>
    </div>
  );
}

function CenterView({ bundles, checked, toggle, query }: { bundles: typeof GAME_DATA.bundles; checked: Record<string, boolean>; toggle: (id: string) => void; query: string }) {
  const rooms = Array.from(new Set(bundles.map((bundle) => bundle.room)));
  const [room, setRoom] = useState(rooms[0] ?? "Кладовая");
  const visible = bundles.filter((bundle) => {
    const roomMatch = bundle.room === room;
    const queryMatch = !query || bundle.name.toLowerCase().includes(query) || bundle.room.toLowerCase().includes(query) || bundle.items.some((item) => item.name.toLowerCase().includes(query));
    return roomMatch && queryMatch;
  });
  const roomBundles = bundles.filter((bundle) => bundle.room === room);
  const roomDone = roomBundles.reduce((sum, bundle) => sum + bundle.items.filter((item, index) => checked[`bundle:${bundle.id}:${item.id}:${index}`]).length, 0);
  const roomTotal = roomBundles.reduce((sum, bundle) => sum + bundle.items.length, 0);

  return (
    <div className="stacked-view">
      <SectionHero
        kicker="Community Center"
        title="Узелки как интерактивная карта комнат"
        text="Комнаты, прогресс и нужные предметы разведены по слоям: сначала выбираешь комнату, потом закрываешь слоты, справа остаётся короткая подсказка."
        icon={roomIcons[room] ?? "/game/ui/center-icon.png"}
        stats={[["Комнат", rooms.length], ["Слотов", roomTotal], ["Осталось", roomTotal - roomDone]]}
      />
      <section className="center-layout">
      <aside className="center-map game-panel">
        <PanelTitle kicker="Общественный центр" title="Комнаты" />
        <div className="room-map">
          {rooms.map((entry) => {
            const entryBundles = bundles.filter((bundle) => bundle.room === entry);
            const entryDone = entryBundles.reduce((sum, bundle) => sum + bundle.items.filter((item, index) => checked[`bundle:${bundle.id}:${item.id}:${index}`]).length, 0);
            const entryTotal = entryBundles.reduce((sum, bundle) => sum + bundle.items.length, 0);
            return (
              <button key={entry} className={clsx("room-door", room === entry && "active")} onClick={() => setRoom(entry)}>
                <img src={asset(roomIcons[entry] ?? "/game/ui/center-icon.png")} onError={imageFallback} alt="" />
                <b>{entry}</b>
                <small>{entryDone}/{entryTotal}</small>
              </button>
            );
          })}
        </div>
        <div className="room-progress"><b>{roomDone}/{roomTotal}</b><span>слотов отмечено</span></div>
      </aside>

      <section className="bundle-scroll">
        {visible.map((bundle) => <BundleCard key={bundle.id} bundle={bundle} checked={checked} toggle={toggle} />)}
      </section>

      <aside className="center-inspector game-panel">
        <PanelTitle kicker="Подсказка" title={room} />
        <div className="room-summary-cards">
          <SummaryTile icon={roomIcons[room] ?? "/game/ui/center-icon.png"} value={roomBundles.length} label="узелков" />
          <SummaryTile icon="/game/items/221.png" value={roomTotal - roomDone} label="осталось" />
        </div>
        <p>Слоты отмечаются прямо в узелках, а справа остаётся короткая шпаргалка по комнате.</p>
        <MiniBoard title="Нужно в комнате" items={roomBundles.flatMap((bundle) => bundle.items).slice(0, 18).map((item, index) => ({ id: `${item.id}:${index}`, icon: item.icon, name: item.name, note: item.hint }))} />
      </aside>
      </section>
    </div>
  );
}

function BundleCard({ bundle, checked, toggle }: { bundle: Bundle; checked: Record<string, boolean>; toggle: (id: string) => void }) {
  const done = bundle.items.filter((item, index) => checked[`bundle:${bundle.id}:${item.id}:${index}`]).length;
  const required = bundle.required || bundle.items.length;
  const reward = rewardView(bundle.reward);
  return (
    <article className={clsx("bundle-note game-panel", done >= required && "complete")}>
      <header>
        <span>{bundle.room}</span>
        <b>{done}/{required}</b>
      </header>
      <div className="bundle-meter"><i style={{ width: `${Math.min(100, (done / required) * 100)}%` }} /></div>
      <h3>{bundle.name}</h3>
      <div className="bundle-items">
        {bundle.items.map((item, index) => {
          const id = `bundle:${bundle.id}:${item.id}:${index}`;
          return (
            <button key={id} className={clsx("slot-card", checked[id] && "done")} onClick={() => toggle(id)} title={item.hint}>
              <img src={asset(item.icon)} onError={imageFallback} alt="" />
              <span>{item.name}</span>
              <small>{item.amount > 1 ? `x${item.amount}` : item.quality > 0 ? "качество" : item.hint}</small>
            </button>
          );
        })}
      </div>
      {reward && <p className="reward-line"><img src={asset(reward.icon)} onError={imageFallback} alt="" /> Награда: {reward.label}</p>}
    </article>
  );
}

function FishingView({ fish, checked, toggle, season, weather }: { fish: typeof GAME_DATA.fish; checked: Record<string, boolean>; toggle: (id: string) => void; season: Season; weather: string }) {
  const [mode, setMode] = useState<"regular" | "legendary" | "trap" | "special">("regular");
  const labels = { regular: "Рыба", legendary: "Легендарная", trap: "Ловушки", special: "Особая" };
  const visible = fish.filter((entry) => fishKind(entry) === mode);
  return (
    <section className="journal-layout fishing-book">
      <SectionHero
        kicker={`${season}, ${weather}`}
        title="Журнал рыбака"
        text="Рыбы, ловушки и легендарные цели разделены, чтобы текущий день показывал только полезный маршрут ловли."
        icon="/game/items/143.png"
        stats={[["Сейчас", visible.length], ["Всего", fish.length], ["Режим", labels[mode]]]}
      />
      <div className="journal-header game-panel">
        <div className="bookmark-row">
          {(Object.keys(labels) as Array<keyof typeof labels>).map((key) => <button key={key} className={clsx("bookmark", mode === key && "active")} onClick={() => setMode(key)}>{labels[key]}</button>)}
        </div>
      </div>
      <div className="fish-grid">
        {visible.map((entry) => (
          <article className="fish-card game-panel" key={entry.id}>
            <img className="featured-icon" src={asset(entry.icon)} onError={imageFallback} alt="" />
            <div>
              <h3>{entry.name}</h3>
              <div className="tag-row"><span>{entry.weather}</span><span>{entry.time}</span><span>сложн. {entry.difficulty}</span></div>
              <p>{entry.locations.join(", ")}</p>
            </div>
            <CheckButton id={`fish:${entry.id}`} checked={checked} toggle={toggle} label={mode === "trap" ? "получено" : "поймано"} />
          </article>
        ))}
        {!visible.length && <EmptyPanel title="Нет целей" text="Смени сезон, погоду или стадию прогресса." />}
      </div>
    </section>
  );
}

function FarmView({ crops, forage, checked, toggle, day, season, stage }: { crops: typeof GAME_DATA.crops; forage: typeof GAME_DATA.forage; checked: Record<string, boolean>; toggle: (id: string) => void; day: number; season: Season; stage: Stage }) {
  const [mode, setMode] = useState<"crops" | "forage" | "profit" | "greenhouse">("crops");
  const bestCrops = [...crops].sort((a, b) => b.profit - a.profit).slice(0, 8);
  const urgentCrops = crops.filter((crop) => cropUrgency(crop, day) === "последний шанс").slice(0, 4);
  return (
    <section className="farm-book">
      <SectionHero
        kicker={`${season}, день ${day}`}
        title="Ферма как планировщик сезона"
        text="Посевы, сбор, прибыль и теплица разделены по вкладкам, чтобы грибы и пляжные находки не мешали семенам."
        icon={bestCrops[0]?.icon ?? "/game/items/24.png"}
        stats={[["Посевы", crops.length], ["Сбор", forage.length], ["Срочно", urgentCrops.length]]}
      />
      <div className="journal-header game-panel crop-header">
        <div className="bookmark-row">
          <button className={clsx("bookmark", mode === "crops" && "active")} onClick={() => setMode("crops")}>Посевы</button>
          <button className={clsx("bookmark", mode === "forage" && "active")} onClick={() => setMode("forage")}>Сбор</button>
          <button className={clsx("bookmark", mode === "profit" && "active")} onClick={() => setMode("profit")}>Прибыль</button>
          <button className={clsx("bookmark", mode === "greenhouse" && "active")} onClick={() => setMode("greenhouse")}>Теплица</button>
        </div>
      </div>
      <div className="farm-dashboard game-panel">
        <GuideRune icon={bestCrops[0]?.icon ?? "/game/items/24.png"} title="Самая сильная культура" text={bestCrops[0] ? `${bestCrops[0].name}: оценка ${bestCrops[0].profit}g, последний день ${lastPlantDay(bestCrops[0])}` : "Нет культур под текущий фильтр"} />
        <GuideRune icon={urgentCrops[0]?.icon ?? "/game/items/221.png"} title="Последний шанс" text={urgentCrops.length ? urgentCrops.map((crop) => crop.name).join(", ") : "Срочных посадок на сегодня нет"} />
        <GuideRune icon="/game/items/398.png" title="Сбор отдельно" text={`${forage.length} сезонных предметов вынесены из посевов, чтобы грибы и пляж не мешались с семенами.`} />
      </div>
      {mode === "crops" && <div className="crop-grid">{crops.map((entry) => <CropCard key={entry.seedId} entry={entry} checked={checked} toggle={toggle} day={day} stage={stage} />)}</div>}
      {mode === "forage" && <div className="crop-grid">{forage.map((entry) => (
        <article className="crop-card game-panel" key={entry.id}>
          <img className="featured-icon" src={asset(entry.icon)} onError={imageFallback} alt="" />
          <h3>{entry.name}</h3>
          <div className="tag-row"><span>{entry.seasons.join(", ")}</span><span>{entry.stageLabel}</span></div>
          <p>{entry.source}</p>
          <CheckButton id={`forage:${entry.id}`} checked={checked} toggle={toggle} label="найдено" />
        </article>
      ))}</div>}
      {mode === "profit" && (
        <div className="profit-layout">
          <section className="game-panel profit-board">
            <PanelTitle kicker="Быстрая оценка" title="Что выгоднее сейчас" />
            {bestCrops.map((crop, index) => <GuideRune key={crop.id} icon={crop.icon} title={`${index + 1}. ${crop.name}`} text={`${crop.profit}g оценка, последний день ${lastPlantDay(crop)}`} />)}
          </section>
          <section className="game-panel greenhouse-panel">
            <PanelTitle kicker="Логика сезона" title="Правило посадки" />
            <p>Если культура не успевает до 28 числа, она скрывается из обычной сетки. Повторные культуры остаются видимыми, потому что могут давать второй сбор.</p>
          </section>
        </div>
      )}
      {mode === "greenhouse" && (
        <div className="greenhouse-layout game-panel">
          <PanelTitle kicker="Поздняя ферма" title="Теплица и вечные посадки" />
          <MiniBoard title="Лучшие кандидаты" items={GAME_DATA.crops.filter((crop) => crop.regrow > 0 || crop.stage === "island").slice(0, 20).map((crop) => ({ id: crop.id, icon: crop.icon, name: crop.name, note: crop.stageLabel }))} />
        </div>
      )}
    </section>
  );
}

function CropCard({ entry, checked, toggle, day, stage }: { entry: Crop; checked: Record<string, boolean>; toggle: (id: string) => void; day: number; stage: Stage }) {
  const urgency = cropUrgency(entry, day);
  return (
    <article className={clsx("crop-card game-panel", urgency && "urgent")}>
      <img className="featured-icon" src={asset(entry.icon)} onError={imageFallback} alt="" />
      <h3>{entry.name}</h3>
      <div className="tag-row">
        <span>{entry.days} дн.</span>
        <span>{entry.regrow > 0 ? `повтор ${entry.regrow}` : "разово"}</span>
        <span>{entry.stageLabel}</span>
        {urgency && <span className="danger-tag">{urgency}</span>}
      </div>
      <div className="crop-math">
        <b>{entry.seedName}</b>
        <span>последний день: {lastPlantDay(entry)}</span>
        <span>цена: {entry.price}g</span>
        <span>оценка: {entry.profit}g</span>
      </div>
      <CheckButton id={`crop:${stage}:${entry.id}`} checked={checked} toggle={toggle} label="выращено" />
    </article>
  );
}

function VillagersView({ villagers, checked, toggle, season, day, weather, stage }: { villagers: typeof GAME_DATA.villagers; checked: Record<string, boolean>; toggle: (id: string) => void; season: Season; day: number; weather: Weather; stage: Stage }) {
  const [selected, setSelected] = useState(villagers[0]);
  const current = villagers.find((item) => item.id === selected?.id) ?? villagers[0];
  const birthday = current?.birthdaySeason === season && current?.birthdayDay === day;
  const schedule = pickSchedule(current, season, day, weather);
  return (
    <section className="stacked-view">
      <SectionHero
        kicker="Social book"
        title="Жители, подарки и маршрут дня"
        text="Подарки недели, день рождения и расписание выбранного жителя теперь живут в одном досье, привязанном к текущей дате."
        icon={current?.portrait || current?.sprite || "/game/portraits/Abigail.png"}
        stats={[["Жителей", villagers.length], ["День", day], ["Погода", weather]]}
      />
      <div className="villager-layout">
        <aside className="villager-roster game-panel">
        <PanelTitle kicker="Жители" title="Портреты" />
        <div className="roster-grid">
          {villagers.map((villager) => (
            <button key={villager.id} className={clsx("roster-face", current?.id === villager.id && "active", villager.birthdaySeason === season && villager.birthdayDay === day && "birthday")} onClick={() => setSelected(villager)}>
              <img src={asset(villager.portrait || villager.sprite || "/game/items/434.png")} onError={imageFallback} alt="" />
              <span>{villager.name}</span>
            </button>
          ))}
        </div>
      </aside>
        {current && (
        <article className={clsx("villager-dossier game-panel", birthday && "birthday")}>
          <img className="portrait large" src={asset(current.portrait || current.sprite || "/game/items/434.png")} onError={imageFallback} alt="" />
          <div className="villager-copy">
            <PanelTitle kicker={birthday ? "Сегодня день рождения" : "Досье жителя"} title={current.name} />
            <div className="tag-row"><span>{current.birthdaySeason} {current.birthdayDay}</span>{current.romance && <span>роман</span>}<span>{current.region}</span></div>
            <h3>Лучшие подарки</h3>
            <div className="gift-slots">
              {current.gifts.slice(0, 12).map((gift) => (
                <span key={`${current.id}:${gift.id}`} title={`${gift.taste}: ${gift.name}`}>
                  <img src={asset(gift.icon)} onError={imageFallback} alt="" />
                  <small>{gift.name}</small>
                </span>
              ))}
            </div>
            <GiftWeekTracker villagerId={current.id} checked={checked} toggle={toggle} season={season} day={day} stage={stage} birthday={birthday} />
          </div>
          <div className="schedule-card">
            <h3>Маршрут дня</h3>
            <small>{schedule?.label ?? "обычный день"}</small>
            <Timeline rows={compactScheduleRows(schedule?.rows ?? [])} />
            <p>Маршрут берётся из локальных файлов игры. Если у жителя есть условные ветки дружбы/брака, они показываются как отдельные условия.</p>
          </div>
        </article>
        )}
      </div>
    </section>
  );
}

function GiftWeekTracker({
  villagerId,
  checked,
  toggle,
  season,
  day,
  stage,
  birthday,
}: {
  villagerId: string;
  checked: Record<string, boolean>;
  toggle: (id: string) => void;
  season: Season;
  day: number;
  stage: Stage;
  birthday: boolean;
}) {
  const week = giftWeekInfo(day);
  const prefix = `gift:${stage}:${seasonKey[season]}:w${week.index}:${villagerId}`;
  const slotOne = `${prefix}:1`;
  const slotTwo = `${prefix}:2`;
  const birthdayId = `gift:${stage}:${seasonKey[season]}:d${day}:${villagerId}:birthday`;
  const given = Number(Boolean(checked[slotOne])) + Number(Boolean(checked[slotTwo]));

  return (
    <div className="gift-week">
      <div>
        <b>{given}/2 подарка недели</b>
        <span>{week.label}, сброс в воскресенье утром</span>
      </div>
      <div className="gift-week-buttons">
        <CheckButton id={slotOne} checked={checked} toggle={toggle} label="подарок 1" />
        <CheckButton id={slotTwo} checked={checked} toggle={toggle} label="подарок 2" />
        {birthday && <CheckButton id={birthdayId} checked={checked} toggle={toggle} label="день рождения" />}
      </div>
    </div>
  );
}

function CatalogView({ query, checked, toggle }: { query: string; checked: Record<string, boolean>; toggle: (id: string) => void }) {
  const categories = useMemo(() => ["Все", ...Array.from(new Set(GAME_DATA.catalogItems.map((item) => item.categoryName))).slice(0, 18)], []);
  const [category, setCategory] = useState("Все");
  const [selectedId, setSelectedId] = useState(GAME_DATA.catalogItems.find((item) => item.id === "24")?.id ?? GAME_DATA.catalogItems[0]?.id);
  const items = GAME_DATA.catalogItems.filter((item) => {
    const categoryMatch = category === "Все" || item.categoryName === category;
    const queryMatch = !query || item.displayName.toLowerCase().includes(query) || item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query);
    return categoryMatch && queryMatch;
  }).slice(0, 260);
  const selected = GAME_DATA.catalogItems.find((item) => item.id === selectedId) ?? items[0];
  return (
    <section className="stacked-view">
      <SectionHero
        kicker="Local wiki"
        title="Каталог предметов"
        text="Поиск, связи с узелками, рецептами и подарками собраны в один предметный справочник."
        icon={selected?.icon ?? "/game/items/434.png"}
        stats={[["Найдено", items.length], ["Категория", category], ["Связи", (selected?.usedInBundles.length ?? 0) + (selected?.usedInRecipes.length ?? 0)]]}
      />
      <div className="catalog-layout">
      <aside className="catalog-detail game-panel">
        <PanelTitle kicker="Мини-вики" title={selected?.displayName ?? "Предмет"} />
        {selected && <img className="catalog-big" src={asset(selected.icon)} onError={imageFallback} alt="" />}
        <p>{selected?.description}</p>
        <div className="tag-row"><span>{selected?.categoryName}</span><span>{selected?.price ?? 0}g</span></div>
        <div className="wiki-facts">
          {selected?.availability && <GuideRune icon={selected.icon} title="Доступность" text={selected.availability} />}
          <UsageBlock title="Узелки" icon="/game/ui/center-icon.png" rows={(selected?.usedInBundles ?? []).map((item) => `${item.room}: ${item.bundle}${item.amount > 1 ? ` x${item.amount}` : ""}`)} />
          <UsageBlock title="Рецепты" icon="/game/items/194.png" rows={(selected?.usedInRecipes ?? []).map((item) => `${item.kind}: ${item.recipe}${item.amount > 1 ? ` x${item.amount}` : ""}`)} />
          <UsageBlock title="Подарки" icon="/game/items/221.png" rows={(selected?.giftFor ?? []).map((item) => `${item.villager}: ${item.taste}`)} />
          <GuideRune icon="/game/items/858.png" title="Поиск" text="ищет по названию, оригинальному id и описанию" />
        </div>
        {selected && <CheckButton id={`catalog:${selected.id}`} checked={checked} toggle={toggle} label="отмечено" />}
      </aside>
      <div className="catalog-main">
        <div className="catalog-tabs game-panel">
          <div className="chip-row">{categories.map((entry) => <button key={entry} className={clsx("chip", category === entry && "active")} onClick={() => setCategory(entry)}>{entry}</button>)}</div>
        </div>
        <div className="catalog-grid game-panel">
          {items.map((item) => (
            <button key={item.id} className={clsx("catalog-cell", selected?.id === item.id && "active", checked[`catalog:${item.id}`] && "done")} onClick={() => setSelectedId(item.id)} onDoubleClick={() => toggle(`catalog:${item.id}`)}>
              <img src={asset(item.icon)} onError={imageFallback} alt="" />
              <span>{item.displayName}</span>
            </button>
          ))}
        </div>
      </div>
      </div>
    </section>
  );
}

function RecipesView({ query, checked, toggle }: { query: string; checked: Record<string, boolean>; toggle: (id: string) => void }) {
  const [mode, setMode] = useState<"cooking" | "crafting">("cooking");
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const source = mode === "cooking" ? GAME_DATA.cooking : GAME_DATA.crafting;
  const recipes = source.filter((recipe) => !query || recipe.name.toLowerCase().includes(query) || recipe.ingredients.some((item) => item.name.toLowerCase().includes(query))).slice(0, 140);
  const selected = recipes.find((recipe) => recipe.id === selectedId) ?? recipes[0];
  return (
    <section className="recipe-book">
      <SectionHero
        kicker="Kitchen book"
        title={mode === "cooking" ? "Книга готовки" : "Книга крафта"}
        text="Выбранный рецепт вынесен слева, а сетка справа работает как рабочая полка ингредиентов и отметок."
        icon={selected?.icon ?? "/game/items/194.png"}
        stats={[["Рецептов", recipes.length], ["Режим", mode === "cooking" ? "еда" : "крафт"], ["Ингр.", selected?.ingredients.length ?? 0]]}
      />
      <div className="recipe-tabs game-panel">
        <PanelTitle kicker="Книга рецептов" title={mode === "cooking" ? "Готовка" : "Крафт"} />
        <div className="bookmark-row">
          <button className={clsx("bookmark", mode === "cooking" && "active")} onClick={() => setMode("cooking")}>Готовка</button>
          <button className={clsx("bookmark", mode === "crafting" && "active")} onClick={() => setMode("crafting")}>Крафт</button>
        </div>
      </div>
      <div className="recipe-layout">
        <aside className="recipe-detail game-panel">
          {selected ? (
            <>
              <PanelTitle kicker={mode === "cooking" ? "Выбранное блюдо" : "Выбранный чертёж"} title={selected.name} />
              <img className="catalog-big" src={asset(selected.icon)} onError={imageFallback} alt="" />
              <p>{selected.unlock || "Открывается в игре"}</p>
              <div className="ingredient-slots featured">
                {selected.ingredients.map((item, index) => (
                  <span key={`selected:${selected.id}:${item.id}:${index}`} title={item.name}>
                    <img src={asset(item.icon)} onError={imageFallback} alt="" />
                    <b>{item.amount}</b>
                    <small>{item.name}</small>
                  </span>
                ))}
              </div>
              <CheckButton id={`recipe:${mode}:${selected.id}`} checked={checked} toggle={toggle} label="готово" />
            </>
          ) : (
            <EmptyPanel title="Нет рецептов" text="Смени поиск или вкладку." />
          )}
        </aside>
        <div className="recipe-grid">
          {recipes.map((recipe) => (
            <article className={clsx("recipe-card game-panel", selected?.id === recipe.id && "active")} key={`${mode}:${recipe.id}`} onClick={() => setSelectedId(recipe.id)}>
              <header>
                <img src={asset(recipe.icon)} onError={imageFallback} alt="" />
                <div><h3>{recipe.name}</h3><span>{recipe.unlock || "открывается в игре"}</span></div>
              </header>
              <div className="ingredient-slots compact">
                {recipe.ingredients.slice(0, 5).map((item, index) => (
                  <span key={`${recipe.id}:${item.id}:${index}`} title={item.name}>
                    <img src={asset(item.icon)} onError={imageFallback} alt="" />
                    <b>{item.amount}</b>
                    <small>{item.name}</small>
                  </span>
                ))}
              </div>
              <CheckButton id={`recipe:${mode}:${recipe.id}`} checked={checked} toggle={toggle} label="готово" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function EndgameView({ checked, toggle }: { checked: Record<string, boolean>; toggle: (id: string) => void }) {
  const steps = [
    ["end:center", "/game/ui/center-icon.png", "Закрыть Центр или Joja", "после завершения придет письмо Вилли"],
    ["end:boat", "/game/items/709.png", "Починить лодку Вилли", "200 твердых пород, 5 батареек, 5 иридиевых слитков"],
    ["end:west", "/game/items/73.png", "Собирать золотые орехи", "открывать ферму, курорт, торговца и проходы"],
    ["end:volcano", "/game/items/848.png", "Вулкан и кузница", "10 этажей, зачарования, короткий путь"],
    ["end:qi", "/game/items/858.png", "Комната мистера Ки", "100 орехов и особые испытания"],
    ["end:perfection", "/game/buildings/gold_clock.png", "Подготовка к Perfection", "рецепты, крафт, обелиски, дружба"],
  ] as const;
  return (
    <section className="stacked-view">
      <SectionHero
        kicker="Late game route"
        title="Endgame без каши"
        text="Поздняя игра собрана как маршрут: закрыть Центр, открыть лодку, пройти остров, добраться до Qi и подготовить Perfection."
        icon="/game/items/73.png"
        stats={[["Шагов", steps.length], ["Карта", "остров"], ["Фокус", "маршрут"]]}
      />
      <div className="endgame-layout">
      <div className="island-map-panel game-panel">
        <PanelTitle kicker="Endgame" title="Имбирный остров и поздняя игра" />
        <div className="island-map">
          <img src={asset("/game/ui/map-island.png")} onError={imageFallback} alt="" />
          {GAME_DATA.islandPoints.filter((point) => point.name && point.w > 0).slice(0, 12).map((point) => <span key={`${point.area}:${point.id}`} className="map-pin" style={{ left: `${(point.x / 300) * 100}%`, top: `${(point.y / 180) * 100}%` }}>{point.name}</span>)}
        </div>
      </div>
      <div className="island-road game-panel">
        <PanelTitle kicker="Пошаговый маршрут" title="От лодки до Ки" />
        {steps.map(([id, icon, title, meta], index) => <TaskCheck key={id} id={id} icon={icon} title={`${index + 1}. ${title}`} meta={meta} checked={checked} toggle={toggle} />)}
      </div>
      </div>
    </section>
  );
}

function PerfectionView({ checked, toggle, count }: { checked: Record<string, boolean>; toggle: (id: string) => void; count: number }) {
  const goals = [
    ["perfect:ship", "/game/buildings/shipping_bin.png", "Отгрузить по одному предмету", "коллекция отгрузки"],
    ["perfect:fish", "/game/items/163.png", "Поймать всю рыбу", "обычная, легендарная, островная"],
    ["perfect:cook", "/game/items/194.png", "Приготовить все рецепты", "TV, дружба и покупки"],
    ["perfect:craft", "/game/items/388.png", "Скрафтить все предметы", "редкие рецепты и Qi"],
    ["perfect:friendship", "/game/items/221.png", "Дружба с жителями", "максимальные сердца"],
    ["perfect:walnuts", "/game/items/73.png", "Золотые орехи", "островные открытия"],
    ["perfect:obelisks", "/game/items/337.png", "Обелиски", "земля, вода, пустыня, остров"],
    ["perfect:clock", "/game/buildings/gold_clock.png", "Золотые часы", "денежный финал"],
  ] as const;
  return (
    <section className="perfection-layout">
      <SectionHero
        kicker="Summit ledger"
        title="Perfection как финальная доска"
        text="Главные цели, достижения и локальные отметки вынесены в один экран, чтобы видеть путь к вершине без фейковых процентов."
        icon="/game/buildings/gold_clock.png"
        stats={[["Отметки", count], ["Целей", goals.length], ["Достиж.", GAME_DATA.achievements.length]]}
      />
      <div className="perfection-top game-panel">
        <PanelTitle kicker="Summit ledger" title="Perfection" />
        <div className="daily-summary">
          <SummaryTile icon="/game/buildings/gold_clock.png" value={count} label="локальных отметок" />
          <SummaryTile icon="/game/items/73.png" value={goals.length} label="главных целей" />
          <SummaryTile icon="/game/items/434.png" value={GAME_DATA.achievements.length} label="достижений" />
        </div>
      </div>
      <div className="perfection-grid">
        {goals.map(([id, icon, title, meta]) => <TaskCheck key={id} id={id} icon={icon} title={title} meta={meta} checked={checked} toggle={toggle} />)}
      </div>
      <div className="achievement-list game-panel">
        <PanelTitle kicker="Достижения" title="Связанный список" />
        {GAME_DATA.achievements.slice(0, 12).map((entry) => <TaskCheck key={entry.id} id={`achievement:${entry.id}`} icon={entry.icon} title={entry.name} meta={entry.description} checked={checked} toggle={toggle} />)}
      </div>
    </section>
  );
}

function CalendarGrid({ seasonDays, day, setDay }: { seasonDays: typeof GAME_DATA.calendar; day: number; setDay: (day: number) => void }) {
  return (
    <>
      <div className="week-row">{["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((item) => <span key={item}>{item}</span>)}</div>
      <div className="day-grid">
        {seasonDays.map((entry) => (
          <button key={entry.key} className={clsx("day-tile", entry.day === day && "active", entry.events.length && "marked")} onClick={() => setDay(entry.day)}>
            <b>{entry.day}</b>
            <EventDots events={entry.events} />
          </button>
        ))}
      </div>
    </>
  );
}

function MiniBoard({ title, items }: { title: string; items: Array<{ id: string; icon: string; name: string; note: string }> }) {
  return (
    <section className="mini-board">
      <h3>{title}</h3>
      <div className="mini-items">{items.map((item) => <ItemToken key={item.id} icon={item.icon} label={item.name} note={item.note} />)}</div>
    </section>
  );
}

function SectionHero({ kicker, title, text, icon, stats }: { kicker: string; title: string; text: string; icon: string; stats: Array<[string, string | number]> }) {
  return (
    <section className="section-hero game-panel">
      <img src={asset(icon)} onError={imageFallback} alt="" />
      <div>
        <span className="eyebrow">{kicker}</span>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
      <div className="hero-stats">
        {stats.map(([label, value]) => (
          <span key={label}><b>{value}</b><small>{label}</small></span>
        ))}
      </div>
    </section>
  );
}

function PanelTitle({ kicker, title }: { kicker: string; title: string }) {
  return <header className="panel-title"><span>{kicker}</span><h2>{title}</h2></header>;
}

function TaskCheck({ id, icon, title, meta, checked, toggle }: { id: string; icon: string; title: string; meta: string; checked: Record<string, boolean>; toggle: (id: string) => void }) {
  return (
    <button className={clsx("quest-row", checked[id] && "done")} onClick={() => toggle(id)}>
      <img src={asset(icon)} onError={imageFallback} alt="" />
      <span><b>{title}</b><small>{meta}</small></span>
      <i><Check size={14} /></i>
    </button>
  );
}

function CheckButton({ id, checked, toggle, label }: { id: string; checked: Record<string, boolean>; toggle: (id: string) => void; label: string }) {
  return <button className={clsx("check-button", checked[id] && "done")} onClick={() => toggle(id)}><Check size={14} />{label}</button>;
}

function EventStrip({ events }: { events: Array<{ type: string; title: string; portrait?: string }> }) {
  if (!events.length) return <div className="event-strip muted">Спокойный день: проверь рыбу, посадки, сбор и подарки.</div>;
  return (
    <div className="event-strip">
      {events.map((event) => <span key={`${event.type}:${event.title}`}>{event.portrait && <img src={asset(event.portrait)} onError={imageFallback} alt="" />} {event.title}</span>)}
    </div>
  );
}

function EventDots({ events }: { events: Array<{ type: string }> }) {
  return <span className="event-dots">{events.slice(0, 3).map((event, index) => <i key={`${event.type}:${index}`} className={event.type} />)}</span>;
}

function ItemToken({ icon, label, note }: { icon: string; label: string; note?: string }) {
  return <span className="item-token" title={note || label}><img src={asset(icon)} onError={imageFallback} alt="" /><small>{label}</small></span>;
}

function PortraitToken({ villager }: { villager: (typeof GAME_DATA.villagers)[number] }) {
  return <span className="portrait-token"><img src={asset(villager.portrait)} onError={imageFallback} alt="" /><b>{villager.birthdayDay}</b><small>{villager.name}</small></span>;
}

function SummaryTile({ icon, value, label }: { icon: string; value: number | string; label: string }) {
  return <span className="summary-tile"><img src={asset(icon)} onError={imageFallback} alt="" /><b>{value}</b><small>{label}</small></span>;
}

function ShortcutCard({ icon, title, meta, onClick }: { icon: string; title: string; meta: string; onClick: () => void }) {
  return <button className="shortcut-card game-panel" onClick={onClick}><img src={asset(icon)} onError={imageFallback} alt="" /><b>{title}</b><small>{meta}</small></button>;
}

function GuideRune({ icon, title, text }: { icon: string; title: string; text: string }) {
  return <article className="guide-rune"><img src={asset(icon)} onError={imageFallback} alt="" /><b>{title}</b><span>{text}</span></article>;
}

function UsageBlock({ title, icon, rows }: { title: string; icon: string; rows: string[] }) {
  if (!rows.length) return <GuideRune icon={icon} title={title} text="нет связей в локальной базе" />;
  return (
    <article className="usage-block">
      <img src={asset(icon)} onError={imageFallback} alt="" />
      <b>{title}</b>
      {rows.slice(0, 5).map((row) => <span key={row}>{row}</span>)}
    </article>
  );
}

function Timeline({ rows }: { rows: Array<[string, string]> }) {
  if (!rows.length) return <div className="timeline"><span><b>—</b><i>нет маршрута в локальной базе</i></span></div>;
  return <div className="timeline">{rows.map(([time, text], index) => <span key={`${time}:${index}`}><b>{time}</b><i>{text}</i></span>)}</div>;
}

function EmptyPanel({ title, text }: { title: string; text: string }) {
  return <section className="empty-panel game-panel"><PanelTitle kicker="Фильтр" title={title} /><p>{text}</p></section>;
}

export { CalendarApp };
