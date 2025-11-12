# Bases More Views

Additional view types for Obsidian Bases - Calendar and Timeline views to visualize your data in new ways.

## 🤔 Why

Obsidian's new Bases feature (v1.10.0+) provides a powerful way to query and display data from your vault. While it includes built-in table and board views, sometimes you need to visualize data differently. This plugin adds two essential views:

- **📅 Calendar View**: Perfect for tracking tasks, events, deadlines, and any date-based data
- **📊 Timeline View**: Ideal for project planning, scheduling, and visualizing date ranges

## 🎨 Features

### Calendar View
- 📅 **Three view modes**: Month, Week, and Day views
- 🔍 **Easy navigation**: Jump between dates with intuitive controls
- 📌 **Today highlighting**: Always know where you are in time
- 🎯 **Click to open**: Click any entry to open the corresponding note
- 🎨 **Clean design**: Follows Obsidian's native styling

### Timeline View
- 📊 **Gantt-style visualization**: See tasks and events on a timeline
- 🔍 **Multiple scales**: Day, week, month, quarter, and year views
- 📏 **Smart zooming**: Zoom in/out and pan across your timeline
- 🎯 **Duration bars**: Show start and end dates as visual bars
- 📍 **Milestones**: Single-date events appear as milestone markers
- 🎨 **Color-coded**: Entries automatically get distinct colors
- 🔄 **Fit All**: Automatically adjust view to show all entries

## 💡 What can you do with it

### Calendar View Use Cases
- Track task deadlines and due dates
- Plan content calendars for writing or social media
- Visualize project milestones
- Create event schedules
- Journal entry tracking
- Habit tracking with date-based logs

### Timeline View Use Cases
- Project planning and management
- Sprint planning for agile teams
- Content production schedules
- Event planning with setup/breakdown periods
- Course or curriculum planning
- Historical event visualization
- Research timelines

## 📺 Demos

### Calendar View
The Calendar View displays your entries in a familiar calendar format. Switch between month, week, and day views to see your data at different levels of detail.

### Timeline View
The Timeline View shows entries as horizontal bars on a timeline, making it easy to see duration, overlap, and scheduling conflicts at a glance.

## 📋 Requirements

- Obsidian v1.10.0 or higher (required for Bases API)
- At least one Base configured in your vault

## 😎 How to install

> [!WARNING]
> Bases More Views is in alpha stage. It may not work properly and compatibility with future versions is not guaranteed.
>
> If you find any bugs or have suggestions, please open an issue on [GitHub](https://github.com/Maws7140/More-views/issues).

### Install with BRAT

1. Install the [BRAT](https://tfthacker.com/brat-quick-guide) plugin from the Obsidian community plugins store
2. Enable the BRAT plugin in Settings → Community plugins
3. Open Command palette (Ctrl/Cmd+P) and choose `BRAT: Plugins: Add a beta plugin for testing`
4. Copy and paste this URL:

```txt
https://github.com/Maws7140/More-views
```

5. Enable "Bases More Views" from Settings → Community plugins

### Install manually

1. Go to the [Releases page](https://github.com/Maws7140/More-views/releases)
2. Download the latest `main.js`, `manifest.json`, and `styles.css` files
3. Create a folder named `obsidian-bases-more-views` in your vault's `.obsidian/plugins/` directory
4. Move the downloaded files into that folder
5. Enable "Bases More Views" from Settings → Community plugins

The directory structure should look like:

```
.obsidian/plugins/obsidian-bases-more-views/
├── main.js
├── manifest.json
└── styles.css
```

## 🚀 How to use

### Setting up a Calendar View

1. Create or open a Base in your vault (requires Obsidian 1.10.0+)
2. Click the view selector in the toolbar
3. Select **Calendar** from the view options
4. In the view options (gear icon), select which property contains your dates
5. Switch between Month, Week, and Day views using the buttons at the top
6. Navigate using the arrow buttons or click "Today" to return to the current date
7. Click any entry to open that note

### Setting up a Timeline View

1. Create or open a Base in your vault
2. Click the view selector in the toolbar
3. Select **Timeline** from the view options
4. In the view options (gear icon):
   - Select a **Start Date Property** (required)
   - Optionally select an **End Date Property** for duration bars
5. Use the scale buttons to switch between Day, Week, Month, Quarter, and Year views
6. Use **+/-** buttons to zoom in/out
7. Use **◄/►** buttons to pan left/right
8. Click **Fit All** to automatically show all entries
9. Click **Today** to center on the current date
10. Click any entry or bar to open that note

### Tips

- **Calendar View**: Entries without a valid date property won't appear in the view
- **Timeline View**:
  - Entries with only a start date appear as circular milestone markers
  - Entries with both start and end dates appear as horizontal bars
  - Each entry gets a distinct color automatically
  - The red line indicates today's date

## ⏳ Future Ideas

Potential features for future versions:

- [ ] Drag-and-drop to change dates in Calendar View
- [ ] Drag-and-drop to adjust timeline bars
- [ ] Color coding by property values
- [ ] Mini-map for Timeline View
- [ ] Export views as images
- [ ] Keyboard shortcuts for navigation
- [ ] Recurring event support
- [ ] Time-of-day support (not just dates)
- [ ] Additional view types (Gallery, Kanban, Chart, etc.)

Feel free to suggest more features by opening an issue!

## 💻 How to develop

### Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended) or npm
- Obsidian v1.10.0+

### Development Setup

1. Create a separate vault for development (recommended)
2. Clone this repository into your vault's `.obsidian/plugins` directory:

```shell
cd /path/to/your/vault/.obsidian/plugins
git clone https://github.com/Maws7140/More-views.git obsidian-bases-more-views
cd obsidian-bases-more-views
```

3. Install dependencies:

```shell
pnpm install
# or
npm install
```

4. Build the plugin:

```shell
pnpm run build
# or
npm run build
```

5. Enable the plugin in Obsidian:
   - Open Settings → Community plugins
   - Turn off "Safe mode" if needed
   - Enable "Bases More Views"

6. (Optional) Install [hot-reload](https://github.com/pjeby/hot-reload) plugin for automatic reloading during development

### Development Workflow

1. Make your changes to the TypeScript files in `src/`
2. Run `pnpm run build` to compile
3. Reload Obsidian (or use hot-reload plugin)
4. Test your changes

### Project Structure

```
src/
├── main.ts              # Plugin entry point, view registration
├── calendar-view.ts     # Calendar view implementation
├── timeline-view.ts     # Timeline view implementation
└── styles.css           # All view styles
```

### Building for Release

```shell
pnpm run build
```

This will:
- Compile TypeScript to JavaScript
- Generate `dist/main.js`
- Generate `dist/manifest.json`
- Copy `styles.css` to dist/
- Copy files to root for easy testing

## 🤝 Contributing

Contributions are welcome! Please feel free to:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

### Built with ♥ for the Obsidian community
