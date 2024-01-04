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
import { useAuth } from '../contexts/auth'
import { ApexChart } from '../components/ApexChart'
import { TeamSearch } from '../components/TeamSearch'


export default function EventProfile() {
  const [activeEvent, setActiveEvent] = useState([]);
  const [teamScores, setTeamScores] = useState([]);
  const [inputScore, setInputScore] = useState('');
  const [qrCodeData, setQrCodeData] = useState('');
  const [openQrCodeDialog, setOpenQrCodeDialog] = useState(false);
  const { user } = useAuth()

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
    fetchEventInfo();
  }, [])

  const handleTeamSelection = (selectedTeam:string) => {
    teamScoreService.registerTeamScore(selectedTeam, activeEvent.uuid)
    window.location.reload()
  };


  const chartData = {
    categories: teamScores.map((team_score) => team_score.teamDetails.team_name),
    points: teamScores.map((team_score) => team_score.score),
    
  };

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
                categories: chartData.categories,
              },
              yaxis: {
                labels: {
                  show: false
                }
              },
              title: {
                text: activeEvent.event_name,
                align: 'center',
                floating: true
            },
            }}
            series={[
              {
                data: chartData.points,
              },
            ]}
          />
        

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
          <Button variant="contained" align='center' onClick={createNewScoreCode}>
            Submit Score
          </Button>


          
   
          
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
