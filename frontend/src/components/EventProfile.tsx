import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Grid,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import { useSnackBar } from '../contexts/snackbar';
import userService from '../services/user.service';
import teamService from '../services/team.service';
import eventService from '../services/event.service';
import ColorPicker from '../components/ColorPicker';

interface EventProfileProps {
  eventProfile: Event;
  allowDelete: boolean;
  onSubmit: SubmitHandler<Event>;
}

export default function EventProfileForm(props: EventProfileProps) {
  const { eventProfile, onSubmit } = props;
  const { user: currentUser, setUser, logout } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<Event>({
    defaultValues: eventProfile,
  });




  const onColorChange = async (updatedColor: string) => {
    setValue('color', updatedColor);
  };

  return (
    <div>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <IconButton aria-label='upload picture' component='label' sx={{ mt: 1 }}>
          <input hidden accept='image/*' type='file' />
          <Avatar
            sx={{ width: 56, height: 56 }}
            alt={eventProfile.event_name}
            src={eventProfile.picture && eventProfile.picture}
          />
        </IconButton>

        <Box
          component='form'
          onSubmit={handleSubmit(onSubmit)}
          sx={{ mt: 3 }}
          key={eventProfile.uuid}
          noValidate
          data-testid='user-profile-form'
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth id='eventName' label='Event Name' {...register('event_name')} required />
            </Grid>
            <Box
              display='flex'
              flexDirection='column'
              justifyContent='center'
              alignItems='center'
              width='100%'
              sx={{ mt: 3 }}
            >
              <Grid item xs={12}>
                <Typography color='text.secondary'>Select Event Color</Typography>
              </Grid>
              <Grid item xs={12}>
                {/* <input type='hidden' {...register('color')} /> */}
                <ColorPicker onColorChange={onColorChange} initialColor={eventProfile.color}/>
              </Grid>
            </Box>
          </Grid>
          <Button type='submit' fullWidth variant='contained' sx={{ mt: 3, mb: 2 }}>
            Update
          </Button>
        </Box>
      </Box>
    </div>
  );
}