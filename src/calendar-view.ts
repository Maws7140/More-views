import type { BasesPropertyId, BasesQueryResult, BasesViewConfig, QueryController } from 'obsidian'
import { BasesView, moment } from 'obsidian'

type ViewMode = 'month' | 'week' | 'day'

interface CalendarEntry {
  entry: any
  date: Date
}

export class CalendarView extends BasesView {
  type = 'calendar'
  private containerEl: HTMLElement
  private viewMode: ViewMode = 'month'
  private currentDate: Date = new Date()
  private datePropertyId: BasesPropertyId | null = null

  constructor(controller: QueryController, containerEl: HTMLElement) {
    super(controller)
    this.containerEl = containerEl
    this.containerEl.addClass('bases-calendar-view')
  }

  async onDataUpdated(): Promise<void> {
    this.render()
  }

  private render() {
    this.containerEl.empty()

    // Get the date property to use
    this.datePropertyId = this.config.getAsPropertyId('dateProperty')

    if (!this.datePropertyId) {
      this.renderEmptyState()
      return
    }

    // Create header with navigation
    this.renderHeader()

    // Render calendar based on view mode
    switch (this.viewMode) {
      case 'month':
        this.renderMonthView()
        break
      case 'week':
        this.renderWeekView()
        break
      case 'day':
        this.renderDayView()
        break
    }
  }

  private renderEmptyState() {
    const emptyState = this.containerEl.createDiv('bases-calendar-empty')
    emptyState.createEl('p', { text: 'Please select a date property in the view options.' })
  }

  private renderHeader() {
    const header = this.containerEl.createDiv('bases-calendar-header')

    // View mode selector
    const viewModeContainer = header.createDiv('bases-calendar-view-mode')
    const modes: ViewMode[] = ['month', 'week', 'day']
    modes.forEach(mode => {
      const btn = viewModeContainer.createEl('button', {
        text: mode.charAt(0).toUpperCase() + mode.slice(1),
        cls: mode === this.viewMode ? 'is-active' : ''
      })
      btn.addEventListener('click', () => {
        this.viewMode = mode
        this.render()
      })
    })

    // Navigation
    const nav = header.createDiv('bases-calendar-nav')

    const prevBtn = nav.createEl('button', { text: '‹', cls: 'bases-calendar-nav-btn' })
    prevBtn.addEventListener('click', () => this.navigatePrevious())

    const titleEl = nav.createDiv('bases-calendar-title')
    titleEl.setText(this.getTitle())

    const nextBtn = nav.createEl('button', { text: '›', cls: 'bases-calendar-nav-btn' })
    nextBtn.addEventListener('click', () => this.navigateNext())

    const todayBtn = nav.createEl('button', { text: 'Today', cls: 'bases-calendar-today-btn' })
    todayBtn.addEventListener('click', () => {
      this.currentDate = new Date()
      this.render()
    })
  }

  private getTitle(): string {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December']

    switch (this.viewMode) {
      case 'month':
        return `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`
      case 'week':
        return `Week of ${this.currentDate.toLocaleDateString()}`
      case 'day':
        return this.currentDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
    }
  }

  private navigatePrevious() {
    switch (this.viewMode) {
      case 'month':
        this.currentDate.setMonth(this.currentDate.getMonth() - 1)
        break
      case 'week':
        this.currentDate.setDate(this.currentDate.getDate() - 7)
        break
      case 'day':
        this.currentDate.setDate(this.currentDate.getDate() - 1)
        break
    }
    this.render()
  }

  private navigateNext() {
    switch (this.viewMode) {
      case 'month':
        this.currentDate.setMonth(this.currentDate.getMonth() + 1)
        break
      case 'week':
        this.currentDate.setDate(this.currentDate.getDate() + 7)
        break
      case 'day':
        this.currentDate.setDate(this.currentDate.getDate() + 1)
        break
    }
    this.render()
  }

  private renderMonthView() {
    const calendar = this.containerEl.createDiv('bases-calendar-month')

    // Weekday headers
    const weekdayHeader = calendar.createDiv('bases-calendar-weekdays')
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    weekdays.forEach(day => {
      weekdayHeader.createDiv('bases-calendar-weekday').setText(day)
    })

    // Get first day of month and number of days
    const year = this.currentDate.getFullYear()
    const month = this.currentDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    // Grid container
    const grid = calendar.createDiv('bases-calendar-grid')

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      grid.createDiv('bases-calendar-day bases-calendar-day-empty')
    }

    // Get entries for this month
    const entriesByDate = this.getEntriesByDate()

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const dayEl = grid.createDiv('bases-calendar-day')

      // Check if it's today
      const today = new Date()
      if (year === today.getFullYear() &&
          month === today.getMonth() &&
          day === today.getDate()) {
        dayEl.addClass('is-today')
      }

      const dayNum = dayEl.createDiv('bases-calendar-day-number')
      dayNum.setText(String(day))

      // Add entries for this day
      const entries = entriesByDate.get(dateKey) || []
      if (entries.length > 0) {
        const entriesContainer = dayEl.createDiv('bases-calendar-day-entries')
        entries.slice(0, 3).forEach(({ entry }) => {
          const entryEl = entriesContainer.createDiv('bases-calendar-entry')
          const file = entry.file
          if (file) {
            entryEl.setText(file.basename || 'Untitled')
            entryEl.addEventListener('click', () => {
              this.app.workspace.openLinkText(file.path, '', false)
            })
          }
        })

        if (entries.length > 3) {
          entriesContainer.createDiv('bases-calendar-more')
            .setText(`+${entries.length - 3} more`)
        }
      }
    }
  }

  private renderWeekView() {
    const weekView = this.containerEl.createDiv('bases-calendar-week')

    // Get start of week (Sunday)
    const startOfWeek = new Date(this.currentDate)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())

    const entriesByDate = this.getEntriesByDate()

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(date.getDate() + i)

      const dayColumn = weekView.createDiv('bases-calendar-week-day')

      const header = dayColumn.createDiv('bases-calendar-week-day-header')
      const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      header.createEl('div', { text: weekdays[i], cls: 'bases-calendar-week-day-name' })
      header.createEl('div', { text: String(date.getDate()), cls: 'bases-calendar-week-day-number' })

      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      const entries = entriesByDate.get(dateKey) || []

      const entriesContainer = dayColumn.createDiv('bases-calendar-week-entries')
      entries.forEach(({ entry }) => {
        const entryEl = entriesContainer.createDiv('bases-calendar-entry')
        const file = entry.file
        if (file) {
          entryEl.setText(file.basename || 'Untitled')
          entryEl.addEventListener('click', () => {
            this.app.workspace.openLinkText(file.path, '', false)
          })
        }
      })
    }
  }

  private renderDayView() {
    const dayView = this.containerEl.createDiv('bases-calendar-day-view')

    const dateKey = `${this.currentDate.getFullYear()}-${String(this.currentDate.getMonth() + 1).padStart(2, '0')}-${String(this.currentDate.getDate()).padStart(2, '0')}`
    const entriesByDate = this.getEntriesByDate()
    const entries = entriesByDate.get(dateKey) || []

    if (entries.length === 0) {
      dayView.createDiv('bases-calendar-empty').setText('No entries for this day')
      return
    }

    entries.forEach(({ entry }) => {
      const entryCard = dayView.createDiv('bases-calendar-day-entry-card')
      const file = entry.file

      if (file) {
        const title = entryCard.createEl('h3')
        title.setText(file.basename || 'Untitled')

        // Show visible properties
        const properties = this.config.getOrder()
        properties.forEach(propId => {
          if (propId === this.datePropertyId) return

          const value = entry.getValue(propId)
          if (value) {
            const propDiv = entryCard.createDiv('bases-calendar-property')
            propDiv.createEl('strong').setText(this.config.getDisplayName(propId) + ': ')
            propDiv.createSpan().setText(String(value))
          }
        })

        entryCard.addEventListener('click', () => {
          this.app.workspace.openLinkText(file.path, '', false)
        })
      }
    })
  }

  private getEntriesByDate(): Map<string, CalendarEntry[]> {
    const entriesByDate = new Map<string, CalendarEntry[]>()

    if (!this.datePropertyId) return entriesByDate

    this.data.data.forEach(entry => {
      const dateValue = entry.getValue(this.datePropertyId!)
      if (!dateValue) return

      // Try to parse date from various formats
      let date: Date | null = null

      if (dateValue instanceof Date) {
        date = dateValue
      } else if (typeof dateValue === 'string') {
        date = new Date(dateValue)
      } else if (dateValue && typeof dateValue === 'object' && 'toString' in dateValue) {
        date = new Date(dateValue.toString())
      }

      if (date && !isNaN(date.getTime())) {
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

        if (!entriesByDate.has(dateKey)) {
          entriesByDate.set(dateKey, [])
        }
        entriesByDate.get(dateKey)!.push({ entry, date })
      }
    })

    return entriesByDate
  }
}
