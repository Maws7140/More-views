import type { BasesPropertyId, QueryController } from 'obsidian'
import { BasesView } from 'obsidian'

interface TimelineEntry {
  entry: any
  startDate: Date
  endDate: Date | null
  title: string
}

type TimelineScale = 'day' | 'week' | 'month' | 'quarter' | 'year'

export class TimelineView extends BasesView {
  type = 'timeline'
  private containerEl: HTMLElement
  private scale: TimelineScale = 'month'
  private viewStartDate: Date
  private viewEndDate: Date
  private startDatePropertyId: BasesPropertyId | null = null
  private endDatePropertyId: BasesPropertyId | null = null

  constructor(controller: QueryController, containerEl: HTMLElement) {
    super(controller)
    this.containerEl = containerEl
    this.containerEl.addClass('bases-timeline-view')

    // Initialize view to show 6 months: 3 months before and after today
    const today = new Date()
    this.viewStartDate = new Date(today.getFullYear(), today.getMonth() - 3, 1)
    this.viewEndDate = new Date(today.getFullYear(), today.getMonth() + 3, 0)
  }

  async onDataUpdated(): Promise<void> {
    this.render()
  }

  private render() {
    this.containerEl.empty()

    // Safety check: ensure config is available
    if (!this.config || !this.data) {
      return
    }

    // Get the date properties to use
    this.startDatePropertyId = this.config.getAsPropertyId('startDateProperty')
    this.endDatePropertyId = this.config.getAsPropertyId('endDateProperty')

    if (!this.startDatePropertyId) {
      this.renderEmptyState()
      return
    }

    // Create header with controls
    this.renderHeader()

    // Render timeline
    this.renderTimeline()
  }

  private renderEmptyState() {
    const emptyState = this.containerEl.createDiv('bases-timeline-empty')
    emptyState.createEl('p', { text: 'Please select a start date property in the view options.' })
    emptyState.createEl('p', {
      text: 'Optionally, select an end date property to show duration bars.',
      cls: 'bases-timeline-hint'
    })
  }

  private renderHeader() {
    const header = this.containerEl.createDiv('bases-timeline-header')

    // Scale selector
    const scaleContainer = header.createDiv('bases-timeline-scale')
    scaleContainer.createEl('span', { text: 'Scale: ', cls: 'bases-timeline-label' })

    const scales: TimelineScale[] = ['day', 'week', 'month', 'quarter', 'year']
    scales.forEach(scale => {
      const btn = scaleContainer.createEl('button', {
        text: scale.charAt(0).toUpperCase() + scale.slice(1),
        cls: scale === this.scale ? 'is-active' : ''
      })
      btn.addEventListener('click', () => {
        this.scale = scale
        this.adjustViewDateRange()
        this.render()
      })
    })

    // Navigation
    const nav = header.createDiv('bases-timeline-nav')

    const prevBtn = nav.createEl('button', { text: '‹', cls: 'bases-timeline-nav-btn' })
    prevBtn.addEventListener('click', () => this.navigatePrevious())

    const zoomOutBtn = nav.createEl('button', { text: '−', cls: 'bases-timeline-zoom-btn' })
    zoomOutBtn.addEventListener('click', () => this.zoomOut())

    const fitBtn = nav.createEl('button', { text: 'Fit All', cls: 'bases-timeline-fit-btn' })
    fitBtn.addEventListener('click', () => this.fitAll())

    const zoomInBtn = nav.createEl('button', { text: '+', cls: 'bases-timeline-zoom-btn' })
    zoomInBtn.addEventListener('click', () => this.zoomIn())

    const nextBtn = nav.createEl('button', { text: '›', cls: 'bases-timeline-nav-btn' })
    nextBtn.addEventListener('click', () => this.navigateNext())

    const todayBtn = nav.createEl('button', { text: 'Today', cls: 'bases-timeline-today-btn' })
    todayBtn.addEventListener('click', () => this.resetToToday())
  }

  private adjustViewDateRange() {
    const today = new Date()
    switch (this.scale) {
      case 'day':
        this.viewStartDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 15)
        this.viewEndDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 15)
        break
      case 'week':
        this.viewStartDate = new Date(today.getFullYear(), today.getMonth() - 2, 1)
        this.viewEndDate = new Date(today.getFullYear(), today.getMonth() + 2, 0)
        break
      case 'month':
        this.viewStartDate = new Date(today.getFullYear(), today.getMonth() - 3, 1)
        this.viewEndDate = new Date(today.getFullYear(), today.getMonth() + 3, 0)
        break
      case 'quarter':
        this.viewStartDate = new Date(today.getFullYear() - 1, 0, 1)
        this.viewEndDate = new Date(today.getFullYear() + 1, 11, 31)
        break
      case 'year':
        this.viewStartDate = new Date(today.getFullYear() - 2, 0, 1)
        this.viewEndDate = new Date(today.getFullYear() + 2, 11, 31)
        break
    }
  }

  private navigatePrevious() {
    const diff = this.viewEndDate.getTime() - this.viewStartDate.getTime()
    const halfDiff = diff / 2

    this.viewStartDate = new Date(this.viewStartDate.getTime() - halfDiff)
    this.viewEndDate = new Date(this.viewEndDate.getTime() - halfDiff)
    this.render()
  }

  private navigateNext() {
    const diff = this.viewEndDate.getTime() - this.viewStartDate.getTime()
    const halfDiff = diff / 2

    this.viewStartDate = new Date(this.viewStartDate.getTime() + halfDiff)
    this.viewEndDate = new Date(this.viewEndDate.getTime() + halfDiff)
    this.render()
  }

  private zoomIn() {
    const center = new Date((this.viewStartDate.getTime() + this.viewEndDate.getTime()) / 2)
    const diff = this.viewEndDate.getTime() - this.viewStartDate.getTime()
    const newDiff = diff * 0.5

    this.viewStartDate = new Date(center.getTime() - newDiff / 2)
    this.viewEndDate = new Date(center.getTime() + newDiff / 2)
    this.render()
  }

  private zoomOut() {
    const center = new Date((this.viewStartDate.getTime() + this.viewEndDate.getTime()) / 2)
    const diff = this.viewEndDate.getTime() - this.viewStartDate.getTime()
    const newDiff = diff * 2

    this.viewStartDate = new Date(center.getTime() - newDiff / 2)
    this.viewEndDate = new Date(center.getTime() + newDiff / 2)
    this.render()
  }

  private resetToToday() {
    this.adjustViewDateRange()
    this.render()
  }

  private fitAll() {
    const entries = this.getTimelineEntries()
    if (entries.length === 0) return

    let minDate = new Date()
    let maxDate = new Date()

    entries.forEach(entry => {
      if (entry.startDate < minDate) minDate = entry.startDate
      const endDate = entry.endDate || entry.startDate
      if (endDate > maxDate) maxDate = endDate
    })

    // Add padding (10% on each side)
    const diff = maxDate.getTime() - minDate.getTime()
    const padding = diff * 0.1

    this.viewStartDate = new Date(minDate.getTime() - padding)
    this.viewEndDate = new Date(maxDate.getTime() + padding)
    this.render()
  }

  private renderTimeline() {
    const timelineContainer = this.containerEl.createDiv('bases-timeline-container')

    const entries = this.getTimelineEntries()

    if (entries.length === 0) {
      timelineContainer.createDiv('bases-timeline-no-data')
        .setText('No entries with valid dates found')
      return
    }

    // Create timeline header (date scale)
    this.renderTimeScale(timelineContainer)

    // Create today marker
    this.renderTodayMarker(timelineContainer)

    // Create timeline entries
    const entriesContainer = timelineContainer.createDiv('bases-timeline-entries')

    entries.forEach((timelineEntry, index) => {
      this.renderTimelineEntry(entriesContainer, timelineEntry, index)
    })
  }

  private renderTimeScale(container: HTMLElement) {
    const scaleEl = container.createDiv('bases-timeline-scale-header')

    const totalMs = this.viewEndDate.getTime() - this.viewStartDate.getTime()
    const divisions = this.getScaleDivisions()

    divisions.forEach(division => {
      const position = ((division.date.getTime() - this.viewStartDate.getTime()) / totalMs) * 100

      if (position >= 0 && position <= 100) {
        const marker = scaleEl.createDiv('bases-timeline-scale-marker')
        marker.style.left = `${position}%`
        marker.setText(division.label)
      }
    })
  }

  private getScaleDivisions(): Array<{ date: Date; label: string }> {
    const divisions: Array<{ date: Date; label: string }> = []
    const current = new Date(this.viewStartDate)

    switch (this.scale) {
      case 'day':
        while (current <= this.viewEndDate) {
          divisions.push({
            date: new Date(current),
            label: `${current.getMonth() + 1}/${current.getDate()}`
          })
          current.setDate(current.getDate() + 1)
        }
        break

      case 'week':
        // Start on Monday
        current.setDate(current.getDate() - current.getDay() + 1)
        while (current <= this.viewEndDate) {
          divisions.push({
            date: new Date(current),
            label: `W${this.getWeekNumber(current)}`
          })
          current.setDate(current.getDate() + 7)
        }
        break

      case 'month':
        current.setDate(1)
        while (current <= this.viewEndDate) {
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          divisions.push({
            date: new Date(current),
            label: `${monthNames[current.getMonth()]} ${current.getFullYear()}`
          })
          current.setMonth(current.getMonth() + 1)
        }
        break

      case 'quarter':
        current.setMonth(Math.floor(current.getMonth() / 3) * 3, 1)
        while (current <= this.viewEndDate) {
          const quarter = Math.floor(current.getMonth() / 3) + 1
          divisions.push({
            date: new Date(current),
            label: `Q${quarter} ${current.getFullYear()}`
          })
          current.setMonth(current.getMonth() + 3)
        }
        break

      case 'year':
        current.setMonth(0, 1)
        while (current <= this.viewEndDate) {
          divisions.push({
            date: new Date(current),
            label: `${current.getFullYear()}`
          })
          current.setFullYear(current.getFullYear() + 1)
        }
        break
    }

    return divisions
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  }

  private renderTodayMarker(container: HTMLElement) {
    const today = new Date()
    const totalMs = this.viewEndDate.getTime() - this.viewStartDate.getTime()
    const position = ((today.getTime() - this.viewStartDate.getTime()) / totalMs) * 100

    if (position >= 0 && position <= 100) {
      const marker = container.createDiv('bases-timeline-today-marker')
      marker.style.left = `${position}%`
    }
  }

  private renderTimelineEntry(container: HTMLElement, timelineEntry: TimelineEntry, index: number) {
    const entryRow = container.createDiv('bases-timeline-entry-row')

    // Entry label
    const label = entryRow.createDiv('bases-timeline-entry-label')
    label.setText(timelineEntry.title)
    label.addEventListener('click', () => {
      const file = timelineEntry.entry.file
      if (file) {
        this.app.workspace.openLinkText(file.path, '', false)
      }
    })

    // Entry bar
    const barContainer = entryRow.createDiv('bases-timeline-entry-bar-container')

    const totalMs = this.viewEndDate.getTime() - this.viewStartDate.getTime()
    const startPos = ((timelineEntry.startDate.getTime() - this.viewStartDate.getTime()) / totalMs) * 100

    const endDate = timelineEntry.endDate || timelineEntry.startDate
    const endPos = ((endDate.getTime() - this.viewStartDate.getTime()) / totalMs) * 100

    // Only render if at least partially visible
    if (endPos >= 0 && startPos <= 100) {
      const bar = barContainer.createDiv('bases-timeline-entry-bar')

      const left = Math.max(0, startPos)
      const right = Math.min(100, endPos)
      const width = right - left

      bar.style.left = `${left}%`
      bar.style.width = `${width}%`

      // If no end date, show as milestone (circle)
      if (!timelineEntry.endDate) {
        bar.addClass('is-milestone')
      }

      // Color based on index (cycle through colors)
      const colorIndex = index % 10
      bar.style.setProperty('--timeline-color-index', String(colorIndex))

      // Tooltip
      bar.setAttribute('aria-label', `${timelineEntry.title}: ${timelineEntry.startDate.toLocaleDateString()}${timelineEntry.endDate ? ' - ' + timelineEntry.endDate.toLocaleDateString() : ''}`)

      bar.addEventListener('click', () => {
        const file = timelineEntry.entry.file
        if (file) {
          this.app.workspace.openLinkText(file.path, '', false)
        }
      })
    }
  }

  private getTimelineEntries(): TimelineEntry[] {
    const entries: TimelineEntry[] = []

    if (!this.startDatePropertyId) return entries

    this.data.data.forEach(entry => {
      const startDateValue = entry.getValue(this.startDatePropertyId!)
      if (!startDateValue) return

      const startDate = this.parseDate(startDateValue)
      if (!startDate || isNaN(startDate.getTime())) return

      let endDate: Date | null = null
      if (this.endDatePropertyId) {
        const endDateValue = entry.getValue(this.endDatePropertyId)
        if (endDateValue) {
          endDate = this.parseDate(endDateValue)
          if (endDate && isNaN(endDate.getTime())) {
            endDate = null
          }
        }
      }

      const file = entry.file
      const title = file?.basename || 'Untitled'

      entries.push({
        entry,
        startDate,
        endDate,
        title
      })
    })

    // Sort by start date
    entries.sort((a, b) => a.startDate.getTime() - b.startDate.getTime())

    return entries
  }

  private parseDate(value: any): Date | null {
    if (value instanceof Date) {
      return value
    } else if (typeof value === 'string') {
      return new Date(value)
    } else if (value && typeof value === 'object' && 'toString' in value) {
      return new Date(value.toString())
    }
    return null
  }
}
