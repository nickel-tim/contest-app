import axios from 'axios'
import { Team } from '../models/team'

const API_URL = import.meta.env.VITE_BACKEND_API_URL



class TeamService {
    async getTeam(teamId: string): Promise<Team> {
      const response = await axios.get(API_URL + `teams/${teamId}`)
      return response.data
    }
  
    async updateTeam(teamId: string, profile: Team): Promise<Team> {
      const response = await axios.patch(API_URL + `teams/${teamId}`, profile)
      return response.data
    }
  
  
    async getTeams(): Promise<Array<Team>> {
      const response = await axios.get(API_URL + 'teams')
      return response.data
    }
  
    async deleteTeam(teamId: string) {
      const response = await axios.delete(API_URL + `teams/${teamId}`)
      return response.data
    }
  }
  
  export default new TeamService()



// Other team-related functions can go here
