// src/pages/UserPanel/UserPanel.jsx

import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box,
  TextField, Button,
  CircularProgress, Snackbar, Alert
} from '@mui/material';
import axios from 'axios';

export default function UserPanel() {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [snack,   setSnack]   = useState({ open:false, message:'', severity:'success' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setSnack({ open:true, message:'Not logged in', severity:'error' });
      setLoading(false);
      return;
    }
    axios.get('http://localhost:8080/api/users/me', {
      headers:{ Authorization:`Bearer ${token}` }
    })
    .then(res => setUser(res.data))
    .catch(() => setSnack({ open:true, message:'Fetch failed', severity:'error' }))
    .finally(() => setLoading(false));
  }, []);

  const handleChange = (field) => (e) => {
    setUser(u => ({ ...u, [field]: e.target.value }));
  };

  const handleSave = () => {
    setSaving(true);
    const token = localStorage.getItem('token');
    const payload = {
      name:    user.name,
      surname: user.surname,
      taxid:   user.taxid,
      address: user.address,
      city:    user.city,
      ZipCode: user.ZipCode
    };
    axios.put('http://localhost:8080/api/users/me', payload, {
      headers:{ 
        'Content-Type':'application/json',
        Authorization:`Bearer ${token}` 
      }
    })
    .then(res => {
      setUser(res.data);
      setSnack({ open:true, message:'Saved!', severity:'success' });
    })
    .catch(() => setSnack({ open:true, message:'Save failed', severity:'error' }))
    .finally(() => setSaving(false));
  };

  if (loading) {
    return <Container sx={{ textAlign:'center', mt:8 }}><CircularProgress/></Container>;
  }
  if (!user) {
    return <Container><Alert severity="error">Unable to load profile</Alert></Container>;
  }

  return (
    <Container maxWidth="sm" sx={{ mt:4, mb:4 }}>
      <Typography variant="h4" gutterBottom>My Profile</Typography>
      <Box sx={{ '& > :not(style)':{ mb:2 } }}>
        <TextField label="Name"    value={user.name}    fullWidth onChange={handleChange('name')} />
        <TextField label="Surname" value={user.surname} fullWidth onChange={handleChange('surname')} />
        <TextField label="Tax ID"  value={user.taxid}   fullWidth onChange={handleChange('taxid')} />
        <TextField label="Address" value={user.address} fullWidth onChange={handleChange('address')} />
        <TextField label="City"    value={user.city}    fullWidth onChange={handleChange('city')} />
        <TextField label="Zip Code"value={user.ZipCode} fullWidth onChange={handleChange('ZipCode')} />

        <Button
          variant="contained"
          fullWidth
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={()=>setSnack(s=>({...s,open:false}))}
      >
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Container>
  );
}
