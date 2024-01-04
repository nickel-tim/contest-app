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
    <Box mt={4}>

    <form onSubmit={handleSearch}>
        <TextField
        id="search-bar"
        className="text"
        onChange={(e) => setSearchQuery(e.target.value)}
        label="Enter a team name"
        variant="outlined"
        placeholder="Search..."
        size="small"
        />
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
      <Button
        onClick={handleTeamSelection}
        disabled={!selectedTeam} 
      >
      Add to event
      </Button>

    </Box>
  )
}

export { TeamSearch };
