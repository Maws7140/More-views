import type { BasesViewRegistration, PropertyOption } from 'obsidian'
import { Plugin } from 'obsidian'
import { CalendarView } from './calendar-view'
import { TimelineView } from './timeline-view'

export default class BasesMoreViewsPlugin extends Plugin {
  async onload() {
    console.log('Loading Bases More Views plugin')

    // Register Calendar View
    const calendarViewRegistration: BasesViewRegistration = {
      name: 'Calendar',
      icon: 'calendar',
      factory: (controller, containerEl) => new CalendarView(controller, containerEl),
      options: () => [
        {
          type: 'property',
          key: 'dateProperty',
          displayName: 'Date Property',
          filter: (propId) => {
            if (!propId) return false
            // Accept date properties
            return propId.startsWith('property.') || propId.startsWith('file.')
          }
        } as PropertyOption
      ]
    }

    this.registerBasesView(calendarViewRegistration)

    // Register Timeline View
    const timelineViewRegistration: BasesViewRegistration = {
      name: 'Timeline',
      icon: 'gantt-chart',
      factory: (controller, containerEl) => new TimelineView(controller, containerEl),
      options: () => [
        {
          type: 'property',
          key: 'startDateProperty',
          displayName: 'Start Date Property',
          filter: (propId) => {
            if (!propId) return false
            return propId.startsWith('property.') || propId.startsWith('file.')
          }
        } as PropertyOption,
        {
          type: 'property',
          key: 'endDateProperty',
          displayName: 'End Date Property',
          placeholder: 'Optional: For duration bars',
          filter: (propId) => {
            if (!propId) return false
            return propId.startsWith('property.') || propId.startsWith('file.')
          }
        } as PropertyOption
      ]
    }

    this.registerBasesView(timelineViewRegistration)

    console.log('Bases More Views plugin loaded successfully')
  }

  onunload() {
    console.log('Unloading Bases More Views plugin')
  }
}
