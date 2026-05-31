import { useMemo, useState } from "react";
import clsx from "clsx";
import { Check, Search } from "lucide-react";
import { GAME_DATA } from "./generated/gameData";
import { useChecklist } from "./useChecklist";

type Season = "Весна" | "Лето" | "Осень" | "Зима";
type Stage = "year1" | "year2" | "desert" | "island" | "perfection";
type Tab = "calendar" | "today" | "bundles" | "fish" | "crops" | "forage" | "villagers" | "catalog" | "recipes" | "island" | "perfection";
type Crop = (typeof GAME_DATA.crops)[number];

const seasons: Season[] = ["Весна", "Лето", "Осень", "Зима"];
const weather = ["любая", "солнце", "дождь"] as const;

const seasonKey: Record<Season, string> = {
  Весна: "spring",
  Лето: "summer",
  Осень: "fall",
  Зима: "winter",
};

const seasonScene: Record<Season, string> = {
  Весна: "/game/ui/map-spring-scene.png",
  Лето: "/game/ui/map-summer-scene.png",
  Осень: "/game/ui/map-fall-scene.png",
  Зима: "/game/ui/map-winter-scene.png",
};

const seasonAccent: Record<Season, string> = {
  Весна: "spring",
  Лето: "summer",
  Осень: "fall",
  Зима: "winter",
};

const stageOptions: Array<{ id: Stage; label: string; note: string }> = [
  { id: "year1", label: "Год 1", note: "без поздних окон" },
  { id: "year2", label: "Год 2+", note: "новые семена и письма" },
  { id: "desert", label: "Пустыня", note: "автобус, оазис, теплица" },
  { id: "island", label: "Остров", note: "лодка Вилли и орехи" },
  { id: "perfection", label: "Перфекшен", note: "финальные цели" },
];

const navItems: Array<{ id: Tab; label: string; icon: string; hint: string }> = [
  { id: "calendar", label: "Календарь", icon: "/game/ui/billboard.png", hint: "день, события, дедлайны" },
  { id: "today", label: "Сегодня", icon: "/game/items/688.png", hint: "короткий план дня" },
  { id: "bundles", label: "Узелки", icon: "/game/ui/junimo-note.png", hint: "общественный центр" },
  { id: "fish", label: "Рыба", icon: "/game/items/143.png", hint: "погода, время, места" },
  { id: "crops", label: "Посевы", icon: "/game/items/24.png", hint: "сроки и прибыль" },
  { id: "forage", label: "Сбор", icon: "/game/items/398.png", hint: "грибы, пляж, лес" },
  { id: "villagers", label: "Жители", icon: "/game/portraits/Abigail.png", hint: "подарки и дни рождения" },
  { id: "catalog", label: "Каталог", icon: "/game/items/434.png", hint: "локальная мини-вики" },
  { id: "recipes", label: "Рецепты", icon: "/game/items/194.png", hint: "готовка и крафт" },
  { id: "island", label: "Остров", icon: "/game/ui/map-island.png", hint: "поздняя прогрессия" },
  { id: "perfection", label: "100%", icon: "/game/buildings/gold_clock.png", hint: "финальный ledger" },
];

const stageOrder: Record<string, number> = { year1: 0, year2: 1, late: 1, desert: 2, greenhouse: 2, island: 3, perfection: 4 };

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

function CalendarApp() {
  const [active, setActive] = useState<Tab>("calendar");
  const [season, setSeason] = useState<Season>("Осень");
  const [day, setDay] = useState(14);
  const [stage, setStage] = useState<Stage>("year1");
  const [currentWeather, setCurrentWeather] = useState<(typeof weather)[number]>("дождь");
  const [query, setQuery] = useState("");
  const { checked, toggle, replace, count } = useChecklist("stardew-calendar-v3");

  const lowerQuery = query.trim().toLowerCase();
  const dayKey = `${seasonKey[season]}${day}`;
  const selectedDay = GAME_DATA.calendar.find((entry) => entry.key === dayKey);
  const seasonDays = GAME_DATA.calendar.filter((entry) => entry.season === season);

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
  const lockedFish = GAME_DATA.fish.filter((entry) => entry.seasons.includes(season) && !canUseStage(entry.stage, stage)).length;
  const lockedCrops = GAME_DATA.crops.filter((entry) => entry.seasons.includes(season) && !canUseStage(entry.stage, stage)).length;
  const lastChanceCrops = seasonalCrops.filter((crop) => cropUrgency(crop, day) === "последний шанс").slice(0, 6);
  const currentStage = stageOptions.find((item) => item.id === stage) ?? stageOptions[0];

  async function exportSave() {
    const payload = JSON.stringify({ version: 1, date: new Date().toISOString(), checked }, null, 2);
    try {
      await navigator.clipboard.writeText(payload);
      window.alert("Сейв отметок скопирован в буфер обмена.");
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
      window.alert("Не получилось прочитать сейв. Проверь, что вставлен JSON из экспорта.");
    }
  }

  return (
    <main className={clsx("valley-shell", seasonAccent[season])}>
      <div className="pixel-sky" />
      <section className="game-frame">
        <header className="farm-header">
          <button className="brand-plaque" onClick={() => setActive("calendar")} aria-label="На календарь">
            <img src="/game/ui/logo.png" alt="" />
            <span>Локальный помощник</span>
          </button>
          <div className="date-plaque">
            <span className="eyebrow">Сегодня</span>
            <strong>{dayLabel(season, day)}</strong>
            <small>{currentStage.label}: {currentStage.note}</small>
          </div>
          <div className="farm-controls" aria-label="Настройки дня">
            <select value={season} onChange={(event) => setSeason(event.target.value as Season)}>{seasons.map((item) => <option key={item}>{item}</option>)}</select>
            <input value={day} onChange={(event) => setDay(Math.max(1, Math.min(28, Number(event.target.value) || 1)))} min={1} max={28} type="number" />
            <select value={currentWeather} onChange={(event) => setCurrentWeather(event.target.value as (typeof weather)[number])}>{weather.map((item) => <option key={item}>{item}</option>)}</select>
            <select value={stage} onChange={(event) => setStage(event.target.value as Stage)}>{stageOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
            <label className="search-plaque">
              <Search size={15} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="поиск" />
            </label>
          </div>
        </header>

        <nav className="object-nav" aria-label="Разделы">
          {navItems.map((item) => (
            <button key={item.id} className={clsx("object-tab", active === item.id && "active")} onClick={() => setActive(item.id)} title={item.hint}>
              <img src={item.icon} alt="" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <section className="content-stage">
          {active === "calendar" && (
            <CalendarDesk
              checked={checked}
              toggle={toggle}
              setActive={setActive}
              setDay={setDay}
              season={season}
              day={day}
              stage={stage}
              selectedDay={selectedDay}
              seasonDays={seasonDays}
              birthdaysToday={birthdaysToday}
              birthdaysSeason={birthdaysSeason}
              availableFish={availableFish}
              seasonalCrops={seasonalCrops}
              seasonalForage={seasonalForage}
              urgentBundles={urgentBundles}
              lastChanceCrops={lastChanceCrops}
              lockedFish={lockedFish}
              lockedCrops={lockedCrops}
              count={count}
            />
          )}
          {active === "today" && <TodayPlanner checked={checked} toggle={toggle} season={season} day={day} selectedDay={selectedDay} fish={availableFish} crops={seasonalCrops} forage={seasonalForage} bundles={urgentBundles} birthdays={birthdaysToday} />}
          {active === "bundles" && <BundlesView bundles={GAME_DATA.bundles} checked={checked} toggle={toggle} query={lowerQuery} />}
          {active === "fish" && <FishView fish={availableFish} checked={checked} toggle={toggle} season={season} weather={currentWeather} />}
          {active === "crops" && <CropsView crops={seasonalCrops} checked={checked} toggle={toggle} day={day} season={season} stage={stage} />}
          {active === "forage" && <ForageView forage={seasonalForage} checked={checked} toggle={toggle} />}
          {active === "villagers" && <VillagersView villagers={GAME_DATA.villagers.filter((v) => !lowerQuery || v.name.toLowerCase().includes(lowerQuery))} checked={checked} toggle={toggle} season={season} day={day} />}
          {active === "catalog" && <CatalogView query={lowerQuery} checked={checked} toggle={toggle} />}
          {active === "recipes" && <RecipesView query={lowerQuery} checked={checked} toggle={toggle} />}
          {active === "island" && <IslandView checked={checked} toggle={toggle} />}
          {active === "perfection" && <PerfectionView checked={checked} toggle={toggle} count={count} />}
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

function CalendarDesk(props: {
  checked: Record<string, boolean>;
  toggle: (id: string) => void;
  setActive: (tab: Tab) => void;
  setDay: (day: number) => void;
  season: Season;
  day: number;
  stage: Stage;
  selectedDay: (typeof GAME_DATA.calendar)[number] | undefined;
  seasonDays: typeof GAME_DATA.calendar;
  birthdaysToday: typeof GAME_DATA.villagers;
  birthdaysSeason: typeof GAME_DATA.villagers;
  availableFish: typeof GAME_DATA.fish;
  seasonalCrops: typeof GAME_DATA.crops;
  seasonalForage: typeof GAME_DATA.forage;
  urgentBundles: typeof GAME_DATA.bundles;
  lastChanceCrops: typeof GAME_DATA.crops;
  lockedFish: number;
  lockedCrops: number;
  count: number;
}) {
  const shelfItems = [...props.birthdaysToday, ...props.availableFish, ...props.seasonalCrops, ...props.seasonalForage].slice(0, 16);
  return (
    <div className="desk-layout">
      <section className="billboard-calendar game-panel">
        <div className="board-map">
          <img src={seasonScene[props.season]} alt="" />
        </div>
        <div className="calendar-paper">
          <PanelTitle kicker="Календарь долины" title={props.season} />
          <div className="week-row">{["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((item) => <span key={item}>{item}</span>)}</div>
          <div className="day-grid">
            {props.seasonDays.map((entry) => (
              <button key={entry.key} className={clsx("day-tile", entry.day === props.day && "active", entry.events.length && "marked")} onClick={() => props.setDay(entry.day)}>
                <b>{entry.day}</b>
                <EventDots events={entry.events} />
              </button>
            ))}
          </div>
        </div>
      </section>

      <aside className="daily-note game-panel">
        <PanelTitle kicker="Выбранный день" title={dayLabel(props.season, props.day)} />
        <EventStrip events={props.selectedDay?.events ?? []} />
        <div className="shelf-grid">
          {shelfItems.map((entry) => "portrait" in entry ? <PortraitToken key={`p:${entry.id}`} villager={entry} /> : <ItemToken key={`i:${entry.id}:${entry.name}`} icon={entry.icon} label={entry.name} />)}
        </div>
        <div className="daily-summary">
          <SummaryTile icon="/game/items/143.png" value={props.availableFish.length} label="рыба сейчас" />
          <SummaryTile icon="/game/items/24.png" value={props.seasonalCrops.length} label="посевы" />
          <SummaryTile icon="/game/items/398.png" value={props.seasonalForage.length} label="сбор" />
          <SummaryTile icon="/game/ui/junimo-note.png" value={props.urgentBundles.length} label="узелки" />
        </div>
        <div className="warning-ledger">
          {props.lastChanceCrops.length > 0 && <b>Последний шанс: {props.lastChanceCrops.map((crop) => crop.name).join(", ")}</b>}
          {(props.lockedFish > 0 || props.lockedCrops > 0) && <span>Скрыто стадией: рыба {props.lockedFish}, посевы {props.lockedCrops}</span>}
        </div>
      </aside>

      <section className="desk-shortcuts">
        <ShortcutCard icon="/game/ui/junimo-note.png" title="Узелки" meta={`${props.urgentBundles.length} актуальных`} onClick={() => props.setActive("bundles")} />
        <ShortcutCard icon="/game/items/143.png" title="Рыба" meta={`${props.availableFish.length} по погоде`} onClick={() => props.setActive("fish")} />
        <ShortcutCard icon="/game/items/24.png" title="Посевы" meta={`до конца сезона`} onClick={() => props.setActive("crops")} />
        <ShortcutCard icon="/game/portraits/Abigail.png" title="Жители" meta={`${props.birthdaysSeason.length} дней рождения`} onClick={() => props.setActive("villagers")} />
        <ShortcutCard icon="/game/buildings/gold_clock.png" title="Отметки" meta={`${props.count} сохранено`} onClick={() => props.setActive("perfection")} />
      </section>

      <section className="field-guide game-panel">
        <PanelTitle kicker="Маршрут без лишнего текста" title="Что держать в голове" />
        <div className="guide-runes">
          <GuideRune icon="/game/items/688.png" title="День" text="выбери дату и смотри только релевантные окна" />
          <GuideRune icon="/game/items/771.png" title="Стадия" text="год и остров скрывают лишнее, пока оно недоступно" />
          <GuideRune icon="/game/ui/bundle-sprites.png" title="Прогресс" text="узелки, подарки и рецепты отмечаются локально" />
        </div>
      </section>
    </div>
  );
}

function TodayPlanner({ checked, toggle, season, day, selectedDay, fish, crops, forage, bundles, birthdays }: {
  checked: Record<string, boolean>;
  toggle: (id: string) => void;
  season: Season;
  day: number;
  selectedDay: (typeof GAME_DATA.calendar)[number] | undefined;
  fish: typeof GAME_DATA.fish;
  crops: typeof GAME_DATA.crops;
  forage: typeof GAME_DATA.forage;
  bundles: typeof GAME_DATA.bundles;
  birthdays: typeof GAME_DATA.villagers;
}) {
  return (
    <div className="planner-layout">
      <section className="letter-panel game-panel">
        <PanelTitle kicker="План дня" title={dayLabel(season, day)} />
        <EventStrip events={selectedDay?.events ?? []} />
        <TaskCheck id={`day:${season}:${day}:fish`} icon="/game/items/143.png" title="Поймать доступную рыбу" meta={`${fish.length} вариантов с текущими фильтрами`} checked={checked} toggle={toggle} />
        <TaskCheck id={`day:${season}:${day}:crop`} icon="/game/items/24.png" title="Проверить посадки" meta={`${crops.length} культур ещё успевают`} checked={checked} toggle={toggle} />
        <TaskCheck id={`day:${season}:${day}:bundle`} icon="/game/ui/junimo-note.png" title="Закрыть сезонные узелки" meta={`${bundles.length} связок связаны с сегодняшними фильтрами`} checked={checked} toggle={toggle} />
        <TaskCheck id={`day:${season}:${day}:gifts`} icon="/game/items/221.png" title="Подарки и дни рождения" meta={birthdays.length ? birthdays.map((item) => item.name).join(", ") : "сверь любимые подарки жителей"} checked={checked} toggle={toggle} />
      </section>
      <section className="today-columns">
        <MiniBoard title="Рыба" items={fish.slice(0, 12).map((item) => ({ id: item.id, icon: item.icon, name: item.name, note: `${item.weather}, ${item.time}` }))} />
        <MiniBoard title="Посевы" items={crops.slice(0, 12).map((item) => ({ id: item.id, icon: item.icon, name: item.name, note: `${item.days} дн., ${item.stageLabel}` }))} />
        <MiniBoard title="Сбор" items={forage.slice(0, 12).map((item) => ({ id: item.id, icon: item.icon, name: item.name, note: item.source }))} />
      </section>
    </div>
  );
}

function BundlesView({ bundles, checked, toggle, query }: { bundles: typeof GAME_DATA.bundles; checked: Record<string, boolean>; toggle: (id: string) => void; query: string }) {
  const rooms = ["Все", ...Array.from(new Set(bundles.map((bundle) => bundle.room)))];
  const [room, setRoom] = useState("Все");
  const visible = bundles.filter((bundle) => {
    const roomMatch = room === "Все" || bundle.room === room;
    const queryMatch = !query || bundle.name.toLowerCase().includes(query) || bundle.room.toLowerCase().includes(query) || bundle.items.some((item) => item.name.toLowerCase().includes(query));
    return roomMatch && queryMatch;
  });

  return (
    <section className="bundle-layout">
      <div className="room-tabs game-panel">
        <PanelTitle kicker="Junimo note" title="Узелки общественного центра" />
        <div className="chip-row">{rooms.map((entry) => <button key={entry} className={clsx("chip", room === entry && "active")} onClick={() => setRoom(entry)}>{entry}</button>)}</div>
      </div>
      <div className="bundle-scroll">
        {visible.map((bundle) => {
          const done = bundle.items.filter((item, index) => checked[`bundle:${bundle.id}:${item.id}:${index}`]).length;
          return (
            <article className="bundle-note game-panel" key={bundle.id}>
              <header>
                <span>{bundle.room}</span>
                <b>{done}/{bundle.required || bundle.items.length}</b>
              </header>
              <h3>{bundle.name}</h3>
              <div className="bundle-items">
                {bundle.items.map((item, index) => {
                  const id = `bundle:${bundle.id}:${item.id}:${index}`;
                  return (
                    <button key={id} className={clsx("slot-card", checked[id] && "done")} onClick={() => toggle(id)} title={item.hint}>
                      <img src={item.icon} alt="" />
                      <span>{item.name}</span>
                      <small>{item.amount > 1 ? `x${item.amount}` : item.quality > 0 ? "качество" : item.hint}</small>
                    </button>
                  );
                })}
              </div>
              {bundle.reward && <p className="reward-line">Награда: {bundle.reward}</p>}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function FishView({ fish, checked, toggle, season, weather }: { fish: typeof GAME_DATA.fish; checked: Record<string, boolean>; toggle: (id: string) => void; season: Season; weather: string }) {
  return (
    <section className="journal-layout">
      <div className="journal-header game-panel">
        <PanelTitle kicker={`${season}, ${weather}`} title="Журнал рыбака" />
        <p>Карточки показывают только рыбу, подходящую под выбранный сезон, погоду и стадию прогресса.</p>
      </div>
      <div className="fish-grid">
        {fish.map((entry) => (
          <article className="fish-card game-panel" key={entry.id}>
            <img className="featured-icon" src={entry.icon} alt="" />
            <div>
              <h3>{entry.name}</h3>
              <div className="tag-row"><span>{entry.weather}</span><span>{entry.time}</span><span>сложн. {entry.difficulty}</span></div>
              <p>{entry.locations.join(", ")}</p>
            </div>
            <CheckButton id={`fish:${entry.id}`} checked={checked} toggle={toggle} label="поймано" />
          </article>
        ))}
      </div>
    </section>
  );
}

function CropsView({ crops, checked, toggle, day, season, stage }: { crops: typeof GAME_DATA.crops; checked: Record<string, boolean>; toggle: (id: string) => void; day: number; season: Season; stage: Stage }) {
  return (
    <section className="journal-layout">
      <div className="journal-header game-panel crop-header">
        <PanelTitle kicker={`${season}, день ${day}`} title="Фермерский планировщик" />
        <p>Только выращиваемые культуры. Грибы, пляжные предметы и лес вынесены в раздел сбора.</p>
      </div>
      <div className="crop-grid">
        {crops.map((entry) => (
          <article className="crop-card game-panel" key={entry.seedId}>
            <img className="featured-icon" src={entry.icon} alt="" />
            <h3>{entry.name}</h3>
            <div className="tag-row">
              <span>{entry.days} дн.</span>
              <span>{entry.regrow > 0 ? `повтор ${entry.regrow}` : "разово"}</span>
              <span>{entry.stageLabel}</span>
              {cropUrgency(entry, day) && <span className="danger-tag">{cropUrgency(entry, day)}</span>}
            </div>
            <div className="crop-math">
              <b>{entry.seedName}</b>
              <span>последний день: {lastPlantDay(entry)}</span>
              <span>цена: {entry.price}g</span>
              <span>оценка: {entry.profit}g</span>
            </div>
            <CheckButton id={`crop:${stage}:${entry.id}`} checked={checked} toggle={toggle} label="выращено" />
          </article>
        ))}
      </div>
    </section>
  );
}

function ForageView({ forage, checked, toggle }: { forage: typeof GAME_DATA.forage; checked: Record<string, boolean>; toggle: (id: string) => void }) {
  return (
    <section className="journal-layout">
      <div className="journal-header game-panel forage-header">
        <PanelTitle kicker="Не посевы" title="Собирательство и сезонные находки" />
        <p>Грибы, пляж, лес, шахты и особые зоны отдельно от фермерских культур.</p>
      </div>
      <div className="crop-grid">
        {forage.map((entry) => (
          <article className="crop-card game-panel" key={entry.id}>
            <img className="featured-icon" src={entry.icon} alt="" />
            <h3>{entry.name}</h3>
            <div className="tag-row"><span>{entry.seasons.join(", ")}</span><span>{entry.stageLabel}</span></div>
            <p>{entry.source}</p>
            <CheckButton id={`forage:${entry.id}`} checked={checked} toggle={toggle} label="найдено" />
          </article>
        ))}
      </div>
    </section>
  );
}

function VillagersView({ villagers, checked, toggle, season, day }: { villagers: typeof GAME_DATA.villagers; checked: Record<string, boolean>; toggle: (id: string) => void; season: Season; day: number }) {
  return (
    <section className="villager-book">
      {villagers.map((villager) => {
        const birthday = villager.birthdaySeason === season && villager.birthdayDay === day;
        return (
          <article className={clsx("villager-profile game-panel", birthday && "birthday")} key={villager.id}>
            <img className="portrait" src={villager.portrait || villager.sprite || "/game/items/434.png"} alt="" />
            <div className="villager-copy">
              <h3>{villager.name}</h3>
              <div className="tag-row"><span>{villager.birthdaySeason} {villager.birthdayDay}</span>{villager.romance && <span>роман</span>}{birthday && <span>сегодня</span>}</div>
              <div className="gift-slots">
                {villager.gifts.slice(0, 7).map((gift) => (
                  <span key={`${villager.id}:${gift.id}`} title={`${gift.taste}: ${gift.name}`}>
                    <img src={gift.icon} alt="" />
                    <small>{gift.name}</small>
                  </span>
                ))}
              </div>
              <CheckButton id={`gift:${villager.id}`} checked={checked} toggle={toggle} label="подарок недели" />
            </div>
          </article>
        );
      })}
    </section>
  );
}

function CatalogView({ query, checked, toggle }: { query: string; checked: Record<string, boolean>; toggle: (id: string) => void }) {
  const categories = useMemo(() => ["Все", ...Array.from(new Set(GAME_DATA.catalogItems.map((item) => item.categoryName))).slice(0, 18)], []);
  const [category, setCategory] = useState("Все");
  const [selected, setSelected] = useState(GAME_DATA.catalogItems[0]);
  const items = GAME_DATA.catalogItems.filter((item) => {
    const categoryMatch = category === "Все" || item.categoryName === category;
    const queryMatch = !query || item.displayName.toLowerCase().includes(query) || item.name.toLowerCase().includes(query);
    return categoryMatch && queryMatch;
  }).slice(0, 240);

  return (
    <section className="catalog-layout">
      <aside className="catalog-detail game-panel">
        <PanelTitle kicker="Мини-вики" title={selected?.displayName ?? "Предмет"} />
        {selected && <img className="catalog-big" src={selected.icon} alt="" />}
        <p>{selected?.description}</p>
        <div className="tag-row"><span>{selected?.categoryName}</span><span>{selected?.price ?? 0}g</span></div>
        {selected && <CheckButton id={`catalog:${selected.id}`} checked={checked} toggle={toggle} label="отмечено" />}
      </aside>
      <div className="catalog-main">
        <div className="catalog-tabs game-panel">
          <div className="chip-row">{categories.map((entry) => <button key={entry} className={clsx("chip", category === entry && "active")} onClick={() => setCategory(entry)}>{entry}</button>)}</div>
        </div>
        <div className="catalog-grid game-panel">
          {items.map((item) => (
            <button key={item.id} className={clsx("catalog-cell", selected?.id === item.id && "active", checked[`catalog:${item.id}`] && "done")} onClick={() => setSelected(item)} onDoubleClick={() => toggle(`catalog:${item.id}`)}>
              <img src={item.icon} alt="" />
              <span>{item.displayName}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function RecipesView({ query, checked, toggle }: { query: string; checked: Record<string, boolean>; toggle: (id: string) => void }) {
  const [mode, setMode] = useState<"cooking" | "crafting">("cooking");
  const source = mode === "cooking" ? GAME_DATA.cooking : GAME_DATA.crafting;
  const recipes = source.filter((recipe) => !query || recipe.name.toLowerCase().includes(query) || recipe.ingredients.some((item) => item.name.toLowerCase().includes(query))).slice(0, 120);
  return (
    <section className="recipe-book">
      <div className="recipe-tabs game-panel">
        <PanelTitle kicker="Книга рецептов" title={mode === "cooking" ? "Готовка" : "Крафт"} />
        <div className="chip-row">
          <button className={clsx("chip", mode === "cooking" && "active")} onClick={() => setMode("cooking")}>Готовка</button>
          <button className={clsx("chip", mode === "crafting" && "active")} onClick={() => setMode("crafting")}>Крафт</button>
        </div>
      </div>
      <div className="recipe-grid">
        {recipes.map((recipe) => (
          <article className="recipe-card game-panel" key={`${mode}:${recipe.id}`}>
            <header>
              <img src={recipe.icon} alt="" />
              <div><h3>{recipe.name}</h3><span>{recipe.unlock || "открывается в игре"}</span></div>
            </header>
            <div className="ingredient-slots">
              {recipe.ingredients.slice(0, 8).map((item, index) => (
                <span key={`${recipe.id}:${item.id}:${index}`} title={item.name}>
                  <img src={item.icon} alt="" />
                  <b>{item.amount}</b>
                  <small>{item.name}</small>
                </span>
              ))}
            </div>
            <CheckButton id={`recipe:${mode}:${recipe.id}`} checked={checked} toggle={toggle} label="готово" />
          </article>
        ))}
      </div>
    </section>
  );
}

function IslandView({ checked, toggle }: { checked: Record<string, boolean>; toggle: (id: string) => void }) {
  const steps = [
    ["island:center", "/game/ui/junimo-note.png", "Закрыть Центр или Joja", "после завершения придет письмо Вилли"],
    ["island:boat", "/game/items/709.png", "Починить лодку Вилли", "200 дерева твердых пород, 5 батареек, 5 иридиевых слитков"],
    ["island:west", "/game/ui/map-island.png", "Открыть запад острова", "ферма, дом, обелиск и быстрый маршрут"],
    ["island:volcano", "/game/items/848.png", "Вулкан и кузница", "дойти до 10 этажа и открыть короткий путь"],
    ["island:qi", "/game/items/858.png", "Комната мистера Ки", "100 золотых грецких орехов для доступа"],
    ["island:perfection", "/game/buildings/gold_clock.png", "Финальные проценты", "рецепты, крафт, обелиски, рыба, дружба"],
  ] as const;
  const points = GAME_DATA.islandPoints.filter((point) => point.name && point.w > 0).slice(0, 12);
  return (
    <section className="island-layout">
      <div className="island-map-panel game-panel">
        <PanelTitle kicker="Ginger Island" title="Имбирный остров" />
        <div className="island-map">
          <img src="/game/ui/map-island.png" alt="" />
          {points.map((point) => <span key={`${point.area}:${point.id}`} className="map-pin" style={{ left: `${(point.x / 300) * 100}%`, top: `${(point.y / 180) * 100}%` }}>{point.name}</span>)}
        </div>
      </div>
      <div className="island-road game-panel">
        <PanelTitle kicker="Пошаговый маршрут" title="От лодки до Ки" />
        {steps.map(([id, icon, title, meta], index) => (
          <TaskCheck key={id} id={id} icon={icon} title={`${index + 1}. ${title}`} meta={meta} checked={checked} toggle={toggle} />
        ))}
      </div>
    </section>
  );
}

function PerfectionView({ checked, toggle, count }: { checked: Record<string, boolean>; toggle: (id: string) => void; count: number }) {
  const goals = [
    ["perfect:ship", "/game/buildings/shipping_bin.png", "Отгрузить по одному предмету", "вся коллекция отгрузки"],
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
      <div className="perfection-top game-panel">
        <PanelTitle kicker="Summit ledger" title="Перфекшен" />
        <div className="daily-summary">
          <SummaryTile icon="/game/buildings/gold_clock.png" value={count} label="локальных отметок" />
          <SummaryTile icon="/game/items/73.png" value={goals.length} label="главных целей" />
          <SummaryTile icon="/game/items/434.png" value={GAME_DATA.achievements.length} label="достижений в базе" />
        </div>
      </div>
      <div className="perfection-grid">
        {goals.map(([id, icon, title, meta]) => <TaskCheck key={id} id={id} icon={icon} title={title} meta={meta} checked={checked} toggle={toggle} />)}
      </div>
      <div className="achievement-list game-panel">
        <PanelTitle kicker="Связанные достижения" title="Из локальных данных игры" />
        {GAME_DATA.achievements.slice(0, 10).map((entry) => (
          <TaskCheck key={entry.id} id={`achievement:${entry.id}`} icon={entry.icon} title={entry.name} meta={entry.description} checked={checked} toggle={toggle} />
        ))}
      </div>
    </section>
  );
}

function MiniBoard({ title, items }: { title: string; items: Array<{ id: string; icon: string; name: string; note: string }> }) {
  return (
    <section className="mini-board game-panel">
      <PanelTitle kicker="сегодня" title={title} />
      <div className="mini-items">{items.map((item) => <ItemToken key={item.id} icon={item.icon} label={item.name} note={item.note} />)}</div>
    </section>
  );
}

function PanelTitle({ kicker, title }: { kicker: string; title: string }) {
  return <header className="panel-title"><span>{kicker}</span><h2>{title}</h2></header>;
}

function TaskCheck({ id, icon, title, meta, checked, toggle }: { id: string; icon: string; title: string; meta: string; checked: Record<string, boolean>; toggle: (id: string) => void }) {
  return (
    <button className={clsx("quest-row", checked[id] && "done")} onClick={() => toggle(id)}>
      <img src={icon} alt="" />
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
      {events.map((event) => <span key={`${event.type}:${event.title}`}>{event.portrait && <img src={event.portrait} alt="" />} {event.title}</span>)}
    </div>
  );
}

function EventDots({ events }: { events: Array<{ type: string }> }) {
  return <span className="event-dots">{events.slice(0, 3).map((event, index) => <i key={`${event.type}:${index}`} className={event.type} />)}</span>;
}

function ItemToken({ icon, label, note }: { icon: string; label: string; note?: string }) {
  return <span className="item-token" title={note || label}><img src={icon} alt="" /><small>{label}</small></span>;
}

function PortraitToken({ villager }: { villager: (typeof GAME_DATA.villagers)[number] }) {
  return <span className="portrait-token"><img src={villager.portrait} alt="" /><b>{villager.birthdayDay}</b><small>{villager.name}</small></span>;
}

function SummaryTile({ icon, value, label }: { icon: string; value: number | string; label: string }) {
  return <span className="summary-tile"><img src={icon} alt="" /><b>{value}</b><small>{label}</small></span>;
}

function ShortcutCard({ icon, title, meta, onClick }: { icon: string; title: string; meta: string; onClick: () => void }) {
  return <button className="shortcut-card game-panel" onClick={onClick}><img src={icon} alt="" /><b>{title}</b><small>{meta}</small></button>;
}

function GuideRune({ icon, title, text }: { icon: string; title: string; text: string }) {
  return <article><img src={icon} alt="" /><b>{title}</b><span>{text}</span></article>;
}

export { CalendarApp };
