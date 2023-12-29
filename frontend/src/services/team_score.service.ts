import axios from 'axios'
import { TeamScore } from '../models/team_score'

const API_URL = import.meta.env.VITE_BACKEND_API_URL

class TeamScoreService {
    async getTeamScoreForTeam(teamId: string): Promise<Array<TeamScore>> {
      const response = await axios.get(API_URL + `team_scores/team/${teamId}`)
      return response.data
    }  
    async getTeamScoreForEvent(eventId: string): Promise<Array<TeamScore>> {
      const response = await axios.get(API_URL + `team_scores/event/${eventId}`)
      return response.data
    }
    async getTeamScore(uuid: string): Promise<TeamScore> {
      const response = await axios.get(API_URL + `team_scores/${uuid}`)
      return response.data
    } 
    async updateTeamScore(teamScoreId: string, scoreInstance: TeamScore): Promise<TeamScore> {
      const response = await axios.patch(API_URL + `team_scores/${teamScoreId}`, scoreInstance)
      return response.data
    } 
    async getTeamScores(): Promise<Array<TeamScore>> {
      const response = await axios.get(API_URL + 'team_scores')
      return response.data
    }   
    async deleteTeamScore(uuid: string) {
      const response = await axios.delete(API_URL + `team_scores/${uuid}`)
      return response.data
    } 
    async deleteTeamScoresForTeam(teamId: string) {
      const response = await axios.delete(API_URL + `team_scores/team/${teamId}`)
      return response.data
    }
    async deleteTeamScoresForEvent(eventId: string) {
      const response = await axios.delete(API_URL + `team_scores/event/${eventId}`)
      return response.data
    }
  }
  
  export default new TeamScoreService()



// Other team-related functions can go here
