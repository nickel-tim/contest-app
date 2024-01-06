import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Container,
  Divider,
  Grid,
  Link,
  List,
  ListItem,
  ListItemText,
  Typography,
  TextField,
  Select,
  MenuItem,
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText,
  DialogActions,  

} from '@mui/material'

import { NavLink, useNavigate } from 'react-router-dom'


import { useEffect, useState } from 'react'
import eventService from '../services/event.service'
import teamScoreService from '../services/team_score.service'
import teamService from '../services/team.service'
import scoreService from '../services/score.service'
import userService from '../services/user.service'
import { useAuth } from '../contexts/auth'
import { ApexChart } from '../components/ApexChart'
import { TeamSearch } from '../components/TeamSearch'
import TeamProfileForm from '../components/TeamProfile'
import { useSnackBar } from '../contexts/snackbar'



export default function TeamProfile() {
  const [activeEvent, setActiveEvent] = useState([]);
  const [activeTeam, setActiveTeam] = useState([]);
  const [teamScores, setTeamScores] = useState([]);
  const [inputScore, setInputScore] = useState('');
  const [qrCodeData, setQrCodeData] = useState('');
  const [openQrCodeDialog, setOpenQrCodeDialog] = useState(false);
  const [isUserInTeam, setIsUserInTeam] = useState(false);
  const [updateTeamDialog, setUpdateTeamDialog] = useState(false);
  const { showSnackBar } = useSnackBar()

  const { user } = useAuth()


  // Fetch teams on component mount
  useEffect(() => {
    async function fetchEventInfo() {
      try {
        const urlSearchParams = new URLSearchParams(window.location.search);
        const teamId = urlSearchParams.get('teamId'); 

        // Replace with your API call to fetch teams
        const team = await teamService.getTeam(teamId);
        setActiveTeam(team)
        const team_scores = await teamScoreService.getTeamScoreForTeam(teamId);

        const sortedTeamScores = team_scores.sort((a, b) => b.score - a.score);

        // Fetch team details for each team score
        const teamScoresWithDetails = await Promise.all(
          sortedTeamScores.map(async (team_score) => {
            const eventDetails = await eventService.getEvent(team_score.eventId);
            return {
              ...team_score,
              eventDetails,
            };
          })
        );
        setTeamScores(teamScoresWithDetails);
        setActiveEvent(team);
        if (user?.teams?.includes(teamId)) {
          setIsUserInTeam(true)
          userService.updateProfile(user)
        }

      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    }
    fetchEventInfo();
  }, [user])

  const handleUpdateTeam = async (data: Team) => {
    let updatedTeam: Team
    try {
      updatedTeam = await teamService.updateTeam(activeTeam.uuid, data)
      showSnackBar('Team created successfully.', 'success')
      window.location.reload()

      // if (data.uuid == '') {
      //   updatedTeam = await teamService.registerTeam(data)
      // } else  {
      //   updatedTeam = await teamService.updateTeam(data.uuid, data)
      //   showSnackBar('Team updated successfully.', 'success')

      // }
    } catch (error) {
      let msg
      if (
        error instanceof AxiosError &&
        error.response &&
        typeof error.response.data.detail == 'string'
      )
        msg = error.response.data.detail
      else if (error instanceof Error) msg = error.message
      else msg = String(error)
      showSnackBar(msg, 'error')
    }

  }

  const handleJoinTeam = async () => {
    try {
      // Call your API function to add the user to the team
      // Update the local state to reflect the user's membership
      setIsUserInTeam(true);
      user.teams.push(activeEvent.uuid);
      userService.updateProfile(user)
    } catch (error) {
      console.error('Error joining team:', error);
    }
  };

  const handleLeaveTeam = async () => {
    try {
      // Call your API function to remove the user from the team
      // Update the local state to reflect the user's membership
      setIsUserInTeam(false);
      const index = user.teams.indexOf(activeEvent.uuid);
      if (index !== -1) {
        user.teams.splice(index, 1);
      }
      userService.updateProfile(user)


    } catch (error) {
      console.error('Error leaving team:', error);
    }
  };


  const openUpdateTeamDialog = async () => {
    setUpdateTeamDialog(true)
  }

  const closeUpdateTeamDialog = async () => {
    setUpdateTeamDialog(false)
  }



  return (
    <main>
      <Box
        sx={{
          pt: 8,
          pb: 2,
        }}
      >
        <Container maxWidth='sm'>
          <Typography variant='h3' align='center' color='text.secondary' sx={{ mt: 5 }}>
            {activeEvent.team_name}
          </Typography>
        </Container>
      </Box>

      <Container sx={{ py: 2 }} maxWidth='md'>

        {isUserInTeam ? (
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={handleLeaveTeam} 
            sx={{ backgroundColor: '#FF0000', '&:hover': { backgroundColor: '#CC0000' } }}>
            Leave Team
          </Button>
        ) : (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleJoinTeam}
            sx={{ backgroundColor: '#168221', '&:hover': { backgroundColor: '#115218' } }}>

            Join Team
          </Button>
        )}        
        
        <Box sx={{ mb: 4 }}>
          <Typography variant='h6' gutterBottom sx={{ mt: 4 }}>
            Ongoing Events
          </Typography>
          <Divider />
        </Box>



        <Grid container spacing={4}>
          {teamScores.map((team_score) => (
            <Grid item key={team_score.uuid} xs={12} sm={6} md={4}>
             <NavLink to={`/event_profile?eventId=${team_score.eventId}`} style={{ textDecoration: 'none' }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}   style={{backgroundColor: `${team_score.eventDetails.color}6f`}}>
                <CardMedia
                  component='img'
                  sx={{
                    width: 250,
                    height: 140,
                    padding: 5,
                    objectFit: 'contain',
                  }}
                  image={team_score.eventDetails.img}
                  title={team_score.eventDetails.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant='h6' component='div'>
                    {team_score.eventDetails.event_name}
                  </Typography>
                  <Typography color='text.secondary'>{team_score.eventDetails.desc}</Typography>
                </CardContent>
              </Card>
            </NavLink>
            </Grid>
          ))}
        </Grid>

        <Dialog open={updateTeamDialog} onClose={closeUpdateTeamDialog}>
          <DialogTitle>Update Team</DialogTitle>
          <DialogContent> 
            <TeamProfileForm
                teamProfile={activeTeam}
                onSubmit={handleUpdateTeam}
                allowDelete={false}></TeamProfileForm>

          </DialogContent>
          <DialogActions>
            <Button onClick={closeUpdateTeamDialog}>Close</Button>
          </DialogActions>
        </Dialog>



        {user !== undefined && user.is_superuser && (

        <Box>


        <Typography variant='h3' align='center' color='text.secondary' sx={{ mt: 5 }}>
          Admin Tools
        </Typography>
        <Button variant="contained" align='center' onClick={openUpdateTeamDialog}>
          Update Team
        </Button>


        </Box>
        )}

      </Container>
    </main>
  )
}
