import { GitHub } from '@mui/icons-material'
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
import { useLoaderData } from 'react-router-dom'



/**
 * Get stars count for github repositories and save values in cache in
 * localStorage.
 *
 * @returns {features: Feature[]}
 */
export async function loader() {
  const today = new Date().toDateString()
  const cacheValue = localStorage.getItem('farmd-features')
  if (cacheValue !== null) {
    const cache = JSON.parse(cacheValue) as FeaturesCache
    if ('date' in cache && cache.date === today) return { features: cache.features }
  }

  const data = await Promise.all(
    FEATURES.map((feature) => fetch(`https://api.github.com/repos/${feature.github}`)),
  )
  const results = await Promise.all(data.map((res) => res.json()))
  const features = FEATURES.map((feature, idx) => ({
    ...feature,
    stars: results[idx].stargazers_count,
  }))
  localStorage.setItem('farmd-features', JSON.stringify({ date: today, features }))

  return { features }
}

export default function Home() {
  return (
    <main>
      <Typography  variant='h3' align='center' color='text.secondary' sx={{ mt: 5 }}>
        STARTING PAGE
      </Typography>

    </main>
  )
}
