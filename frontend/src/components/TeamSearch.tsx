import { Logout } from '@mui/icons-material'
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  Link,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  Grid,
  TextField,
  List,
  ListItem,
  ListItemText
} from '@mui/material'


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import teamService from '../services/team.service'





export default function TeamSearch(props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');


  const handleSearch = async () => {
    try {
        const response = await axios.get(`/api/teams/search?team_name=${searchQuery}`);
        setSearchResults(response.data);
        console.log(searchResults)

    } catch (error) {
      console.error('Error searching teams:', error);
    }
  };

  const handleTeamSelection = async () => {
    props.onTeamSelection(selectedTeam);
  }




  useEffect(() => {
    async function handleSearch() {
      if (searchQuery !== '') {

        try {
          const response = await teamService.searchTeam(searchQuery)
          console.log('resp', response)
          setSearchResults(response);
        } catch (error) {
          console.error('Error searching teams:', error);
        }
      }

    }
    handleSearch();
  }, [searchQuery]);







  return (
    <Box mt={4} display="flex" flexDirection="column" alignItems="flex-start">
    <form onSubmit={handleSearch}>
      <Grid container spacing={4} alignItems="center">
        <Grid item xs={8}>
          <TextField
            id="search-bar"
            className="text"
            onChange={(e) => setSearchQuery(e.target.value)}
            label="Enter a team name"
            variant="outlined"
            placeholder="Search..."
            size="small"
            fullWidth
          />
        </Grid>
        <Grid item xs={4}>
          <Button
            onClick={handleTeamSelection}
            disabled={!selectedTeam}
            fullWidth
          >
            Add to event
          </Button>
        </Grid>
      </Grid>
    </form>
    <List>
      {searchResults.map((team) => (
        <ListItem
          key={team.uuid}
          button
          selected={selectedTeam === team.uuid}
          onClick={() => setSelectedTeam(team.uuid)}
        >
          <ListItemText primary={team.team_name} />
        </ListItem>
      ))}
    </List>
  </Box>
  )
}

export { TeamSearch };
