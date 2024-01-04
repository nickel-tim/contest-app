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
    DialogActions,
    DialogContentText,
  
  } from '@mui/material'

  import { QrReader } from 'react-qr-reader';
  import React ,{ useEffect, useState, useRef, forwardRef } from 'react'
  import { useNavigate } from 'react-router-dom';

  import eventService from '../services/event.service'
  import teamScoreService from '../services/team_score.service'
  import teamService from '../services/team.service'
  import scoreService from '../services/score.service'
  



  export default function RedeemCode() {
    const [activeEvent, setActiveEvent] = useState([]);
    const [teamScores, setTeamScores] = useState([]);
    const [redemptionCode, setRedemptionCode] = useState('');
    const [selectedTeam, setSelectedTeam] = useState('');
    const [qrCodeData, setQrCodeData] = useState('');
    const [isQRScannerActive, setIsQRScannerActive] = useState(false);
    const [openTeamDialog, setOpenTeamDialog] = useState(false);
    const navigate = useNavigate();
    const qrReaderRef = useRef(null);


    


    const activateQRScan = () => {
        setIsQRScannerActive(true);
    };  
    
    const deactivateQRScan = () => {
        setIsQRScannerActive(false);
      };


    useEffect(() => {
      // Cleanup function to stop the QR scanner when the component is unmounted or qrCodeData is set
      return () => {

        console.log(qrReaderRef)
        if (qrReaderRef.current) {
          qrReaderRef.current.stop();
        }
      };
    }, [openTeamDialog]);



    async function fetchEventInfo(eventId:string) {
        try {
    
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
  
    const handleRedemption = async () => {
      try {
        // Call your redemption function with redemptionCode and selectedTeam
        // For demonstration purposes, this is just a placeholder alert
        const team = await teamService.getTeam(selectedTeam)
        const response = await scoreService.useCode(redemptionCode, selectedTeam);

        if (response.points == 0) {
            alert(`Score has already been used`);

        } else {
            alert(`Redeemed ${response.points} Points for team: ${team.team_name}`);
        }
        navigate(`/event_profile?eventId=${activeEvent.uuid}`);

      } catch (error) {
        console.error('Error redeeming:', error);
      }
    };
  


    const handleTeamDialogClose = () => {
        setOpenTeamDialog(false);
        window.location.reload()
    };

    const handleTeamSelection = () => {
        // Handle the selected team logic here
        // For demonstration purposes, just close the dialog
        setOpenTeamDialog(false);
        handleRedemption()

    };
    
    const handleError = (err) => {
    console.error('QR code scanner error:', err);
    };






    function parseQRCodeString(qrCodeString: string): Record<string, any> {
        const keyValuePairs = qrCodeString.match(/(\w+)=(\S+)/g) || [];
      
        const parsedObject: Record<string, any> = {};
      
        keyValuePairs.forEach((pair) => {
          const [key, value] = pair.split('=');
          parsedObject[key] = parseValue(value);
        });
      
        return parsedObject;
      }




      function parseValue(value: string): any {
        // Remove single quotes around strings
        const cleanedValue = value.replace(/^'(.*)'$/, '$1');
      
        // Handle specific parsing logic based on your data types
        if (cleanedValue.startsWith('ObjectId(') && cleanedValue.endsWith(')')) {
          return cleanedValue.substring(9, cleanedValue.length - 1); // Extract ObjectId value
        } else if (cleanedValue.startsWith('UUID(') && cleanedValue.endsWith(')')) {
          return cleanedValue.substring(6, cleanedValue.length - 2); // Extract UUID value
        } else if (cleanedValue === 'None') {
          return null;
        } else if (cleanedValue === 'True' || cleanedValue === 'False') {
          return cleanedValue === 'True';
        } else if (!isNaN(Number(cleanedValue))) {
          return Number(cleanedValue);
        } else {
          return cleanedValue;
        }
      }







    useEffect(() => {
        // This block of code will run whenever qrCodeData is updated
      const fetchData = async () => {
        try {
          if (qrCodeData !== '') {  
            deactivateQRScan();
            const qrCodeObject = parseQRCodeString(qrCodeData);
            fetchEventInfo(qrCodeObject['eventId']);
            setRedemptionCode(qrCodeObject['uuid']);
  
            const response = await scoreService.getScore(qrCodeObject['uuid']);
  
            if (response.is_active === false) {
              alert(`Score has already been used`);
              window.location.reload()
            } else {
              setOpenTeamDialog(true);
            }
          }
        } catch (error) {
          console.error('Error fetching score:', error);
          // Handle the error, e.g., show an error message to the user
        }
      };
    
      fetchData();
    
    }, [qrCodeData]); 





    const handleResult = (data) => {        
        if (data) {
            // Process the scanned QR code data
            setQrCodeData(data.text);

        }
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
                Redeem Code
            </Typography>
          </Container>
        </Box>
        <Container sx={{ py: 2, textAlign: 'center' }} maxWidth='md'>
        <Button
            variant="contained"
            onClick={activateQRScan}
            sx={{ textAlign: 'center' }} // Center the button
        >
            Redeem
        </Button>
          {isQRScannerActive && (
              <QrReader
              scanDelay={500}
              onError={handleError}
              onResult={handleResult}
              style={{ width: '100%' }}
            />
          )}
  
            <Dialog open={openTeamDialog} onClose={handleTeamDialogClose}>
            <DialogTitle>Select Team</DialogTitle>
            <DialogContent>
                <DialogContentText>
                Choose a team from the list:
                </DialogContentText>
                <List>
                {teamScores.map((team) => (
                    <ListItem
                    key={team.teamId}
                    button
                    selected={selectedTeam === team.teamId}
                    onClick={() => setSelectedTeam(team.teamId)}
                    >
                    <ListItemText primary={team.teamDetails.team_name} />
                    </ListItem>
                ))}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleTeamDialogClose}>Cancel</Button>
                <Button
                onClick={handleTeamSelection}
                disabled={!selectedTeam} // Disable the button if no team is selected
                >
                Select
                </Button>
            </DialogActions>
            </Dialog>






          <Box mt={4}>


  

        </Box>
  
        {/* <List>
          {teamScores.map((team_score) => (
            <ListItem key={team_score.uuid}>
              <ListItemText
                primary={`${team_score.teamDetails.team_name}`}
                secondary={`Score: ${team_score.score}`}
              />
            </ListItem>
          ))}
        </List> */}
        </Container>
      </main>
    )
  }
  