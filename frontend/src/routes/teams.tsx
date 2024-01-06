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
  Typography,
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText,
  DialogActions,

} from '@mui/material'

import { AxiosError } from 'axios'
import { NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import teamService from '../services/team.service'
import { useAuth } from '../contexts/auth'
import TeamProfileForm from '../components/TeamProfile'
import { useSnackBar } from '../contexts/snackbar'
import { Team } from '../models/team'

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [emptyTeam, setEmptyTeam] = useState([])
  const [inputName, setInputName] = useState('');
  const [createTeamDialogActive, setCreateTeamDialogActive] = useState(false);
  const { user } = useAuth()
  
  const { showSnackBar } = useSnackBar()

  function generateRandomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  }


  const handleCreateTeamDialog = async () => {
    const empty_team: Team = {
      team_name: '',
      members: [],
      is_active: true, // Set default values as needed
      picture: '',
      color: generateRandomColor()
      // ... other fields with default values
    };
    setEmptyTeam(empty_team)
    setCreateTeamDialogActive(true)
  }

  const handleCloseCreateTeamDialog = async () => {
    setCreateTeamDialogActive(false)
  }

  const handleCreateTeam = async (data: Team) => {

    let updatedTeam: Team
    try {
      updatedTeam = await teamService.registerTeam(data)
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


  // Fetch teams on component mount
  useEffect(() => {
    async function fetchTeams() {
      try {
        // Replace with your API call to fetch teams
        const teams = await teamService.getTeams();
        setTeams(teams);
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    }
    fetchTeams();
  }, []);
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
            Active Teams
          </Typography>
        </Container>
      </Box>
      <Container sx={{ py: 8 }} maxWidth='md'>
        <Box sx={{ mb: 4 }}>
          <Typography variant='body1'>
            Placeholder
          </Typography>


          <Button 
            variant="contained" 
            color="secondary" 
            onClick={handleCreateTeamDialog} >
            Create New Team
          </Button>
          <Typography variant='h6' gutterBottom sx={{ mt: 4 }}>
            Teams
          </Typography>
          <Divider />
        </Box>


        <Dialog open={createTeamDialogActive} onClose={handleCloseCreateTeamDialog}>
          <DialogTitle>Create New Team</DialogTitle>
          <DialogContent> 

            <TeamProfileForm
              teamProfile={emptyTeam}
              onSubmit={handleCreateTeam}
              allowDelete={false}></TeamProfileForm>

          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCreateTeamDialog}>Close</Button>
          </DialogActions>
        </Dialog>

        <Grid container spacing={4}>
          {teams.map((team) => (
            <Grid item key={team.uuid} xs={12} sm={6} md={4}>
             <NavLink to={`/team_profile?teamId=${team.uuid}`} style={{ textDecoration: 'none' }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CardMedia
                  component='img'
                  sx={{
                    width: 250,
                    height: 140,
                    padding: 5,
                    objectFit: 'contain',
                  }}
                  image={team.img}
                  title={team.alt}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant='h6' component='div'>
                    {team.team_name}
                  </Typography>
                  <Typography color='text.secondary'>{team.desc}</Typography>
                </CardContent>
              </Card>
            </NavLink>
            </Grid>
          ))}
        </Grid>

    </Container>

    </main>
  )
}
