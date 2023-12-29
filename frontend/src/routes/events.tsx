import { GitHub } from '@mui/icons-material'
import { SportsBar } from '@mui/icons-material'
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
} from '@mui/material'
import { NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import eventService from '../services/event.service'

export default function Events() {
  const [globalEvents, setGlobalEvents] = useState([]); // Add state for teams
  const formatter = Intl.NumberFormat('en', { notation: 'compact', maximumSignificantDigits: 3 })

  // Fetch teams on component mount
  useEffect(() => {
    async function fetchEvents() {
      try {
        // Replace with your API call to fetch teams
        const events = await eventService.getEvents();
        setGlobalEvents(events);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    }
    fetchEvents();
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
            Active Events
          </Typography>
        </Container>
      </Box>
      <Container sx={{ py: 8 }} maxWidth='md'>
        <Box sx={{ mb: 4 }}>
          <Typography variant='body1'>
            Placeholder
          </Typography>
          <Typography variant='h6' gutterBottom sx={{ mt: 4 }}>
            Events
          </Typography>
          <Divider />
        </Box>
        <Grid container spacing={4}>
          {globalEvents.map((event) => (
            <Grid item key={event.title} xs={12} sm={6} md={4}>
             <NavLink to={`/event_profile?eventId=${event.uuid}`} style={{ textDecoration: 'none' }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CardMedia
                  component='img'
                  sx={{
                    width: 250,
                    height: 140,
                    padding: 5,
                    objectFit: 'contain',
                  }}
                  image={event.img}
                  title={event.alt}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant='h6' component='div'>
                    {event.event_name}
                  </Typography>
                  <Typography color='text.secondary'>{event.desc}</Typography>
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
