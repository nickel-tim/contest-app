export interface Event {
    uuid: string
    event_name?: string
    participating_users?: string[]
    participating_teams?: string[]
    is_active?: boolean
    picture?: string
  }
