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
import { AxiosError } from 'axios'
import { useSnackBar } from '../contexts/snackbar'


import { useEffect, useState } from 'react'
import eventService from '../services/event.service'
import teamScoreService from '../services/team_score.service'
import teamService from '../services/team.service'
import userService from '../services/user.service'
import scoreService from '../services/score.service'
import { useAuth } from '../contexts/auth'
import { ApexChart } from '../components/ApexChart'
import { TeamSearch } from '../components/TeamSearch'
import EventProfileForm from '../components/EventProfile'


export default function EventProfile() {
  const [activeEvent, setActiveEvent] = useState([]);
  const [teamScores, setTeamScores] = useState([]);
  const [userScores, setUserScores] = useState([]);
  const [inputScore, setInputScore] = useState('');
  const [qrCodeData, setQrCodeData] = useState('');
  const [openQrCodeDialog, setOpenQrCodeDialog] = useState(false);
  const { user } = useAuth()
  const [showTeamChart, setShowTeamChart] = useState(true);
  const [updateEventDialog, setUpdateEventDialog] = useState(false);
  const { showSnackBar } = useSnackBar()

  const formatter = Intl.NumberFormat('en', { notation: 'compact', maximumSignificantDigits: 3 });


  async function fetchEventInfo() {
    try {
      const urlSearchParams = new URLSearchParams(window.location.search);
      const eventId = urlSearchParams.get('eventId'); 

      // Replace with your API call to fetch teams
      const event = await eventService.getEvent(eventId);
      const team_scores = await teamScoreService.getTeamScoreForEvent(eventId);
      const sortedTeamScores = team_scores.sort((a, b) => b.score - a.score);

      // Fetch team details for each team score
      const teamScoresWithDetails = await Promise.all(
        sortedTeamScores.map(async (team_score) => {
          const teamDetails = await teamService.getTeam(team_score.teamId);
          return {
            ...team_score,
            teamDetails,
          };
        })
      );
      
      setTeamScores(teamScoresWithDetails);
      setActiveEvent(event);

    } catch (error) {
      console.error('Error fetching events:', error);
    }
  }


  const handleUpdateEvent = async (data: Event) => {
    let updatedEvent: Event
    try {
      console.log(data)
      updatedEvent = await eventService.updateEvent(activeEvent.uuid, data)
      showSnackBar('Event created successfully.', 'success')
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



  const handleOpenQrCodeDialog = () => {
    setOpenQrCodeDialog(true);
  };

  const handleCloseQrCodeDialog = () => {
    setOpenQrCodeDialog(false);
  };
  const createNewScoreCode = async () => {
    // Validate inputScore (you may want to add additional validation)
    const newScore = parseInt(inputScore, 10);

    if (isNaN(newScore) || newScore < 0) {
      alert('Please enter a valid non-negative integer for the score.');
      return;
    }

    try {
      // Trigger the service with the new score
      const response = await scoreService.createCode(activeEvent.uuid, newScore);
        
      // Convert base64 to Blob
      const base64String = response.qr_code_base64.split(';base64,').pop();
      const byteCharacters = atob(base64String);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }

      const blob = new Blob(byteArrays, { type: 'image/png' });

      const reader = new FileReader();
      reader.onload = () => {
        setQrCodeData(reader.result);
        handleOpenQrCodeDialog(); // Open the dialog when QR code data is available

      };

      reader.readAsDataURL(blob);



    } catch (error) {
      console.error('Error submitting score:', error);
    }
  };

  // useEffect(() => {
  //   // Set the interval (in milliseconds) for the page reload
  //   const reloadInterval = 50000; // Reload every 60 seconds

  //   const reloadPage = () => {
  //     if (!qrCodeData) {
  //       window.location.reload();
  //     }
  //   };

  //   // Set up the interval to reload the page
  //   const intervalId = setInterval(reloadPage, reloadInterval);

  //   // Clean up the interval when the component is unmounted
  //   return () => clearInterval(intervalId);
  // }, []);


  // Fetch teams on component mount
  useEffect(() => {
    async function fetchEventInfo() {
      try {
        const urlSearchParams = new URLSearchParams(window.location.search);
        const eventId = urlSearchParams.get('eventId'); 

        // Replace with your API call to fetch teams
        const event = await eventService.getEvent(eventId);
        const team_scores = await teamScoreService.getTeamScoreForEvent(eventId);

        const user_scores = await scoreService.getUserScoresForEvent(eventId)
        const sortedTeamScores = team_scores.sort((a, b) => b.score - a.score);
        const sortedUserScores = user_scores.sort((a, b) => b.points - a.points);

        // Fetch team details for each team score
        const teamScoresWithDetails = await Promise.all(
          sortedTeamScores.map(async (team_score) => {
            const teamDetails = await teamService.getTeam(team_score.teamId);
            return {
              ...team_score,
              teamDetails,
            };
          })
        );

        const userScoresWithDetails = await Promise.all(
          sortedUserScores.map(async (user_score) => {
            const userDetails = await userService.getUser(user_score.userId);
            return {
              ...user_score,
              userDetails,
            };
          })
        );

        setTeamScores(teamScoresWithDetails)
        setUserScores(userScoresWithDetails)
        setActiveEvent(event)

      } catch (error) {
        console.error('Error fetching events:', error);
      }
    }
    fetchEventInfo();
  }, [])

  const handleTeamSelection = (selectedTeam:string) => {
    teamScoreService.registerTeamScore(selectedTeam, activeEvent.uuid, user.uuid)
    window.location.reload()
  };


  const teamChartData = {
    categories: teamScores.map((team_score) => team_score.teamDetails.team_name),
    points: teamScores.map((team_score) => team_score.score),
    colors: teamScores.map((team_score) => team_score.teamDetails.color),
  };
  const userChartData = {
    categories: userScores.map((user_score) => user_score.userDetails.first_name),
    points: userScores.map((user_score) => user_score.points),
    colors: userScores.map((user_score) => user_score.userDetails.color),

  };


  useEffect(() => {
    const intervalId = setInterval(() => {
      setShowTeamChart((prev) => !prev);
      
    }, 15000);

    return () => clearInterval(intervalId);
  }, []);


  const openUpdateEventDialog = async () => {
    setUpdateEventDialog(true)
  }

  const closeUpdateEventDialog = async () => {
    setUpdateEventDialog(false)
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
            {activeEvent.event_name}
          </Typography>
        </Container>
      </Box>
      <Container sx={{ py: 2 }} maxWidth='md'>
        <Box sx={{ mb: 4 }}>
          <Typography variant='h6' gutterBottom sx={{ mt: 4 }}>
            Team Scores
          </Typography>
          <Divider />
        </Box>

        <Dialog open={openQrCodeDialog} onClose={handleCloseQrCodeDialog}>
          <DialogTitle>QR Code</DialogTitle>
          <DialogContent> 
            <DialogContentText>
              Scan the QR code to redeem your score.
            </DialogContentText>
            {/* {qrCodeData && <img src={qrCodeData} alt="QR Code" />} */}

            {qrCodeData && <img src={qrCodeData} alt="QR Code" style={{ maxWidth: '100%', maxHeight: '100%' }} />}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseQrCodeDialog}>Close</Button>
          </DialogActions>
        </Dialog>
 
        {showTeamChart ? (

        <ApexChart
            options={{
              chart: {
                type: 'bar',
                height: 380,
              },
              plotOptions: {
                bar: {
                  barHeight: '100%',
                  distributed: true,
                  horizontal: true,
                  dataLabels: {
                    position: 'bottom'
                  },
                }
              },
              dataLabels: {
                enabled: true,
                textAnchor: 'start',
                style: {
                  colors: ['#fff']
                },
                formatter: function (val, opt) {
                  return opt.w.globals.labels[opt.dataPointIndex] + ":  " + val
                },
                offsetX: 0,
                dropShadow: {
                  enabled: true
                }
              },
              xaxis: {
                categories: teamChartData.categories,
              },
              yaxis: {
                labels: {
                  show: false
                }
              },
              title: {
                text: "Team Scores",
                align: 'center',
                floating: true
            },
              colors: teamChartData.colors 
            }}
            series={[
              {
                data: teamChartData.points,
              },
            ]}
          />
          ) : (
          <ApexChart
            options={{
              chart: {
                type: 'bar',
                height: 380,
              },
              plotOptions: {
                bar: {
                  barHeight: '100%',
                  distributed: true,
                  horizontal: true,
                  dataLabels: {
                    position: 'bottom'
                  },
                }
              },
              dataLabels: {
                enabled: true,
                textAnchor: 'start',
                style: {
                  colors: ['#fff']
                },
                formatter: function (val, opt) {
                  return opt.w.globals.labels[opt.dataPointIndex] + ":  " + val
                },
                offsetX: 0,
                dropShadow: {
                  enabled: true
                }
              },
              xaxis: {
                categories: userChartData.categories,
              },
              yaxis: {
                labels: {
                  show: false
                }
              },
              title: {
                text: "Player Scores",
                align: 'center',
                floating: true
            },            
              colors: userChartData.colors 

            }}
            series={[
              {
                data: userChartData.points,
              },

            ]}
          />
          )}


        <Dialog open={updateEventDialog} onClose={closeUpdateEventDialog}>
          <DialogTitle>Update Event</DialogTitle>
          <DialogContent> 
            <EventProfileForm
                eventProfile={activeEvent}
                onSubmit={handleUpdateEvent}
                allowDelete={false}></EventProfileForm> 

          </DialogContent>
          <DialogActions>
            <Button onClick={closeUpdateEventDialog}>Close</Button>
          </DialogActions>
        </Dialog>


        {user !== undefined && user.is_superuser && (

          <Box>
          <Typography variant='h3' align='center' color='text.secondary' sx={{ mt: 5 }}>
            Admin Tools
          </Typography>
          <TextField 
            label="Create Score Code"
            variant="outlined"
            type="number"
            value={inputScore}
            onChange={(e) => setInputScore(e.target.value)}
          />
          <Button sx={{ mt: 1 , left:10 }} variant="contained" align='center' onClick={createNewScoreCode}>
            Submit Score
          </Button>

        <Box>
          <Button  sx={{ mt: 2 }} variant="contained" align='center' onClick={openUpdateEventDialog}>
          Update Event
          </Button>
        </Box>
          
        <TeamSearch 
          activeEvent={activeEvent}
          onTeamSelection={handleTeamSelection}
        />
        </Box>
        )}
      </Container>
    </main>
  )
}
