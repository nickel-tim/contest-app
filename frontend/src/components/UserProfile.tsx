import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  FormControlLabel,
  Grid,
  IconButton,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/auth'
import { useSnackBar } from '../contexts/snackbar'
import ColorPicker from '../components/ColorPicker';
import userService from '../services/user.service'
import teamService from '../services/team.service'
import { GoogleIcon } from './LoginForm'
import { User } from '../models/user'
import { AxiosError } from 'axios'

interface UserProfileProps {
  userProfile: User
  onUserUpdated?: (user: User) => void
  allowDelete: boolean
}

export default function UserProfile(props: UserProfileProps) {
  const { userProfile, onUserUpdated } = props
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<User>({
    defaultValues: userProfile,
  })
  const navigate = useNavigate()
  const { user: currentUser, setUser, logout } = useAuth()
  const { showSnackBar } = useSnackBar()
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openTeamsDialog, setOpenTeamsDialog] = useState(false);
  const [globalTeams, setGlobalTeams] = useState([]); // Add state for teams
  const [selectedTeams, setSelectedTeams] = useState([]); // Add state for selected teams


  

  // Fetch teams on component mount
  useEffect(() => {
    async function fetchTeams() {
      try {
        // Replace with your API call to fetch teams
        const teams = await teamService.getTeams();
        setGlobalTeams(teams);
        setSelectedTeams(
          teams.filter((team) => currentUser.teams.includes(team.uuid))
        );
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    }

    fetchTeams();
  }, []);



  const onColorChange = async (updatedColor: string) => {
    setValue('color', updatedColor);
  };

  useEffect(() => {
    reset(userProfile)
  }, [userProfile])

  const onSubmit: SubmitHandler<User> = async (data) => {
    let updatedUser: User
    try {
      data.teams = selectedTeams.map((team) => team.uuid);

      if (currentUser?.uuid === userProfile.uuid) {
        // Updating user profile.
        updatedUser = await userService.updateProfile(data)
        setUser(updatedUser)
        showSnackBar('User profile updated successfully.', 'success')
      } else {
        // Updating user different from current user.
        updatedUser = await userService.updateUser(userProfile.uuid, data)
        showSnackBar('User profile updated successfully.', 'success')
      }
      if (onUserUpdated) {
        onUserUpdated(updatedUser)
      }
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

  const handleDeleteProfile = async () => {
    setOpenDeleteDialog(true)
  }

  const handleCancelDeleteDialog = () => setOpenDeleteDialog(false)
  const handleCancelTeamsDialog = () => setOpenTeamsDialog(false)

  const handleConfirm = async () => {
    setOpenDeleteDialog(false)
    await userService.deleteSelf()
    showSnackBar('You account has been deleted.', 'success')
    logout()
    navigate('/')
  }
  
  
  // Function to handle team selection
  const handleTeamSelection = (teamUuid, teamName) => {
    setSelectedTeams((prevSelectedTeams) =>
      prevSelectedTeams.some((team) => team.uuid === teamUuid)
        ? prevSelectedTeams.filter((t) => t.uuid !== teamUuid)
        : [...prevSelectedTeams, { uuid: teamUuid, team_name: teamName }]
    );
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
            alt={userProfile.first_name + ' ' + userProfile.last_name}
            src={userProfile.picture && userProfile.picture}
          />
        </IconButton>

        <Box 
          component='form'
          onSubmit={handleSubmit(onSubmit)}
          sx={{ mt: 3 }}
          key={userProfile.uuid}
          noValidate
          data-testid='user-profile-form'
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoComplete='given-name'
                fullWidth
                id='firstName'
                label='First Name'
                {...register('first_name')}
                autoFocus
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id='last_name'
                label='Last Name'
                autoComplete='family-name'
                {...register('last_name')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id='email'
                label='Email Address'
                autoComplete='email'
                required
                disabled={
                  userProfile.provider !== null &&
                  userProfile.provider !== undefined &&
                  userProfile.provider !== ''
                }
                error={!!errors.email}
                helperText={errors.email && 'Please provide an email address.'}
                {...register('email', { required: true })}
              />
            </Grid>

            {userProfile.provider && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Connected with'
                  id='provider'
                  disabled={true}
                  variant='standard'
                  InputProps={{
                    startAdornment: <GoogleIcon sx={{ mr: 1 }} />,
                  }}
                  {...register('provider')}
                />
              </Grid>
            )}

            {!userProfile.provider && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Password'
                  type='password'
                  id='password'
                  autoComplete='new-password'
                  {...register('password')}
                />
              </Grid>
            )}
      
            {
              <Grid item xs={12}>
              {/* Display selected teams in the TextField */}
                <TextField
                  fullWidth
                  label='Teams'
                  id='teams'
                  value={selectedTeams.map((team) => team.team_name).join(', ')}
                  onClick={() => setOpenTeamsDialog(true)}
                />
                
              {/* Button to open the teams dialog */}
                <Button 
                  type='submit' 
                  fullWidth 
                  variant='contained' 
                  sx={{ mt: 3, mb: 2 }}
                  onClick={() => setOpenTeamsDialog(true)}>
                  Browse Teams
                </Button>
              </Grid>

            }
              
              <Dialog open={openTeamsDialog} onClose={handleCancelTeamsDialog} aria-describedby='alert-profile-dialog-description'>
              <DialogContent>Your current Teams
                {/* Display the list of teams in the dialog */}
                {globalTeams.map((team) => (
                  <div key={team.uuid}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedTeams.some((t) => team.uuid === t.uuid)}
                          onChange={() => handleTeamSelection(team.uuid, team.team_name)}
                        />
                      }
                      label={team.team_name}
                    />
                  </div>
                ))}
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCancelTeamsDialog} variant='contained' color='primary'>
                  Confirm
                </Button>
              </DialogActions>
            </Dialog>
            <Box
              display='flex'
              flexDirection='column'
              justifyContent='center'
              alignItems='center'
              width='100%'
              sx={{ mt: 3 }}
            >
              <Grid item xs={12}>
                <Typography color='text.secondary'>Select Your Color</Typography>
              </Grid>
              <Grid item xs={12}>
                {/* <input type='hidden' {...register('color')} /> */}
                <ColorPicker onColorChange={onColorChange} initialColor={userProfile.color}/>
              </Grid>
            </Box> 
            
            {currentUser?.is_superuser && (
              <>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        defaultChecked={userProfile.is_active}
                        color='primary'
                        {...register('is_active')}
                      />
                    }
                    label='Is Active'
                    disabled={currentUser.uuid === userProfile.uuid}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        defaultChecked={userProfile.is_superuser}
                        color='primary'
                        {...register('is_superuser')}
                      />
                    }
                    label='Is Super User'
                    disabled={currentUser.uuid === userProfile.uuid}
                  />
                </Grid>
              </>
            )}
          </Grid>
          <Button type='submit' fullWidth variant='contained' sx={{ mt: 3, mb: 2 }}>
            Update
          </Button>
          {props.allowDelete && (
            <Button
              fullWidth
              variant='outlined'
              sx={{ mb: 2 }}
              color='error'
              onClick={handleDeleteProfile}
            >
              Delete my account
            </Button>
          )}
        </Box>
      </Box>
      <Dialog
        open={openDeleteDialog}
        onClose={handleCancelDeleteDialog}
        aria-describedby='alert-profile-dialog-description'
      >
        <DialogContent>
          <DialogContentText id='alert-profile-dialog-description'>
            Are you sure you want to delete your account ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDeleteDialog} autoFocus>
            Cancel
          </Button>
          <Button onClick={handleConfirm} variant='contained' color='primary'>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
