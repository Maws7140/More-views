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
          name: 'Date Property',
          description: 'Select the date property to display on the calendar',
          filter: (propId) => {
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
      icon: 'calendar-range',
      factory: (controller, containerEl) => new TimelineView(controller, containerEl),
      options: () => [
        {
          type: 'property',
          key: 'startDateProperty',
          name: 'Start Date Property',
          description: 'Select the property for the start date',
          filter: (propId) => {
            return propId.startsWith('property.') || propId.startsWith('file.')
          }
        } as PropertyOption,
        {
          type: 'property',
          key: 'endDateProperty',
          name: 'End Date Property',
          description: 'Optional: Select the property for the end date (for duration bars)',
          filter: (propId) => {
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
