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

import { useEffect, useState } from 'react'
import eventService from '../services/event.service'
import teamScoreService from '../services/team_score.service'
import teamService from '../services/team.service'
import scoreService from '../services/score.service'

export default function EventProfile() {
  const [activeEvent, setActiveEvent] = useState([]);
  const [teamScores, setTeamScores] = useState([]);
  const [inputScore, setInputScore] = useState('');
  const [redemptionCode, setRedemptionCode] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [qrCodeData, setQrCodeData] = useState('');
  const [openQrCodeDialog, setOpenQrCodeDialog] = useState(false);

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
      
      console.log('teamScoresWithDetail')
      console.log(teamScoresWithDetails)
      setTeamScores(teamScoresWithDetails);
      // setTeamScores(sortedTeamScores);
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
      console.log(response)
        
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


  const handleRedemption = async () => {
    try {
      // Call your redemption function with redemptionCode and selectedTeam
      // For demonstration purposes, this is just a placeholder alert
      console.log(redemptionCode, selectedTeam )
      const response = await scoreService.useCode(redemptionCode, selectedTeam);
      await fetchEventInfo();

      alert(`Redemption Code: ${redemptionCode}, Selected Team: ${selectedTeam}`);

    } catch (error) {
      console.error('Error redeeming:', error);
    }
  };




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
        
        console.log('teamScoresWithDetail')
        console.log(teamScoresWithDetails)
        setTeamScores(teamScoresWithDetails);
        // setTeamScores(sortedTeamScores);
        setActiveEvent(event);

      } catch (error) {
        console.error('Error fetching events:', error);
      }
    }
    fetchEventInfo();
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
        <Box>
        <TextField 
          label="Create Score Code"
          variant="outlined"
          type="number"
          value={inputScore}
          onChange={(e) => setInputScore(e.target.value)}
        />
        <Button variant="contained" onClick={createNewScoreCode}>
          Submit Score
        </Button>
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

        <Box mt={4}>
        <TextField
          label="Redemption Code"
          variant="outlined"
          value={redemptionCode}
          onChange={(e) => setRedemptionCode(e.target.value)}
        />

        <Select
          label="Select Team"
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
        >
          {teamScores.map((team) => (
            <MenuItem key={team.teamId} value={team.teamId}>
              {team.teamDetails.team_name}
            </MenuItem>
          ))}
        </Select>

        <Button variant="contained" onClick={handleRedemption}>
          Redeem
        </Button>
      </Box>

      <List>
        {teamScores.map((team_score) => (
          <ListItem key={team_score.uuid}>
            <ListItemText
              primary={`${team_score.teamDetails.team_name}`}
              secondary={`Score: ${team_score.score}`}
            />
          </ListItem>
        ))}
      </List>
      </Container>
    </main>
  )
}
