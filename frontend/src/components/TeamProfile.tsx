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
import ColorPicker from '../components/ColorPicker';

interface TeamProfileProps {
  teamProfile: Team;
  allowDelete: boolean;
  onSubmit: SubmitHandler<Team>;
}

export default function TeamProfileForm(props: TeamProfileProps) {
  const { teamProfile, onSubmit } = props;
  const { user: currentUser, setUser, logout } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<Team>({
    defaultValues: teamProfile,
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
            alt={teamProfile.team_name}
            src={teamProfile.picture && teamProfile.picture}
          />
        </IconButton>

        <Box
          component='form'
          onSubmit={handleSubmit(onSubmit)}
          sx={{ mt: 3 }}
          key={teamProfile.uuid}
          noValidate
          data-testid='user-profile-form'
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth id='teamName' label='Team Name' {...register('team_name')} required />
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
                <Typography color='text.secondary'>Select Team Color</Typography>
              </Grid>
              <Grid item xs={12}>
                {/* <input type='hidden' {...register('color')} /> */}
                <ColorPicker onColorChange={onColorChange} initialColor={teamProfile.color}/>
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