# Stardew Valley Calendar

Локальный русскоязычный фан-помощник по Stardew Valley. Эта версия пересобрана как игровое меню: календарная доска, предметная навигация, журналы, слоты, узелки, чеклисты и фильтры по стадии прохождения.

## Что внутри

- Главный экран без обычного сайдбара: верхняя игровая рамка, предметные вкладки, календарь сезона и дневная доска.
- Выбор сезона, дня, погоды и стадии: `Год 1`, `Год 2+`, `Пустыня`, `Остров`, `Перфекшен`.
- Узелки с комнатами, прогрессом, предметными слотами, подсказками источников и наградами.
- Рыба с сезоном, погодой, временем, местом, сложностью и локальными отметками.
- Посевы отделены от собирательства: wild seeds, грибы, пляж и лес вынесены в отдельный раздел `Сбор`.
- Главный экран показывает последний шанс по посадкам и сколько контента скрыто текущей стадией прохождения.
- Жители с портретами, днями рождения, любимыми подарками и недельной отметкой.
- Каталог предметов как мини-вики с панелью деталей.
- Готовка и крафт с ингредиентами и источниками рецептов.
- Имбирный остров как пошаговая прогрессия.
- Перфекшен как отдельный ledger целей.
- Экспорт и импорт локальных отметок через JSON в нижней панели.

## Запуск

```powershell
npm install
npm run generate
npm run dev -- --port 5174
```

Открыть: http://127.0.0.1:5174

## Проверки

```powershell
npm run typecheck
npm run lint
npm run build
npm run smoke
```

`npm run smoke` делает скриншоты календаря, узелков, рыбы, посевов, сбора, жителей, каталога, рецептов, острова, перфекшена и мобильного вида в `work/`; дополнительно проверяет консольные ошибки, битые картинки и явные переполнения блоков.

## Источники

- Локальные игровые файлы: `Content/Data/*.json`, `Content/Strings/*.ru-RU.json`, `Content/LooseSprites`, `Content/Portraits`, `Content/Characters`, `Content/Maps`, `Content/TileSheets`.
- Офлайн-копия wiki: `C:\My Web Sites\Stardew_Valley_Wiki_Offline\stardewvalleywiki.com`.
- Stardew Valley Wiki: [Bundles](https://stardewvalleywiki.com/Bundles), [Fish](https://stardewvalleywiki.com/Fish), [Crops](https://stardewvalleywiki.com/Crops), [Cooking](https://stardewvalleywiki.com/Cooking), [Crafting](https://stardewvalleywiki.com/Crafting), [Ginger Island](https://stardewvalleywiki.com/Ginger_Island), [Perfection](https://stardewvalleywiki.com/Perfection).
- [Stardew Valley 1.6 changelog](https://www.stardewvalley.net/stardew-valley-1-6-update-full-changelog/).
- [Shayuwu](https://www.youtube.com/@shayuwu) используется как слой советов и сезонной стратегии, не как замена фактической базе.
- Локально скачан шрифт `Press Start 2P` для пиксельных акцентов; русские тексты имеют системный fallback, чтобы кириллица не ломалась.

## Правовой блок

Неофициальный локальный фан-сайт. Stardew Valley, игровые изображения, названия, персонажи и ассеты принадлежат ConcernedApe и правообладателям. Материалы используются в личных справочных и информационных целях.
