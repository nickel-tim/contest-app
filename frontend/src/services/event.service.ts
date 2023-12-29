import axios from 'axios'
import { Event } from '../models/event'

const API_URL = import.meta.env.VITE_BACKEND_API_URL



class EventService {
    async getEvent(eventId: string): Promise<Event> {
      const response = await axios.get(API_URL + `events/${eventId}`)
      return response.data
    }
  
    async updateEvent(eventId: string, profile: Event): Promise<Event> {
      const response = await axios.patch(API_URL + `events/${eventId}`, profile)
      return response.data
    }
  
  
    async getEvents(): Promise<Array<Event>> {
      const response = await axios.get(API_URL + 'events')
      return response.data
    }
  
    async deleteEvent(eventId: string) {
      const response = await axios.delete(API_URL + `events/${eventId}`)
      return response.data
    }
  }
  
  export default new EventService()



// Other team-related functions can go here
