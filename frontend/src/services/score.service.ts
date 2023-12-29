import axios from 'axios'
import { Score } from '../models/score'
import { ScoreResponse } from '../models/score_response'

const API_URL = import.meta.env.VITE_BACKEND_API_URL



class ScoreService {

    async createCode(eventId: string, points: BigInteger): Promise<ScoreResponse> {
      console.log(eventId, points)
      const response = await axios.get(API_URL + `scores/create_code/`, {
        params: {
            eventId: eventId,
            points: points
        }
      }
      )
      return response.data
    }
  
    async useCode(scoreId: string, teamId: string): Promise<Score> {
      console.log('AAAAA', scoreId, teamId)

      const response = await axios.get(API_URL + `scores/use_code/`, {
        params: {
          scoreId: scoreId,
          teamId: teamId
        }
      })
      return response.data
    }
  
  
    async getScores(): Promise<Array<Score>> {
      const response = await axios.get(API_URL + 'scores')
      return response.data
    }
    
    async getValidScores(): Promise<Array<Score>> {
      const response = await axios.get(API_URL + 'scores/valid')
      return response.data
    }

    async getScoresForEvent(eventId: string): Promise<Array<Score>> {
      const response = await axios.get(API_URL + 'scores/event', {
        params: {
          eventId: eventId
        }
      })
      return response.data
    }

    async getValidScoresForEvent(eventId: string): Promise<Array<Score>> {
      const response = await axios.get(API_URL + 'scores/valid/event', {
        params: {
          eventId: eventId
        }
      })
      return response.data
    }
  //   async deleteTeam(teamId: string) {
  //     const response = await axios.delete(API_URL + `teams/${teamId}`)
  //     return response.data
  //   }
  }
  
  export default new ScoreService()



// Other team-related functions can go here
