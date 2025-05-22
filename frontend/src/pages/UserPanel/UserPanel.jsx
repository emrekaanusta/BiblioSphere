import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Divider
} from '@mui/material';
import axios from 'axios';

export default function UserPanel() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  // 1) Fetch profile DTO on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setSnack({ open: true, message: 'Not logged in', severity: 'error' });
      setLoading(false);
      return;
    }

    axios.get('http://localhost:8080/api/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setProfile(res.data))
    .catch(() => setSnack({ open: true, message: 'Fetch failed', severity: 'error' }))
    .finally(() => setLoading(false));
  }, []);

  // 2) Handle field edits
  const handleChange = field => e => {
    setProfile(p => ({ ...p, [field]: e.target.value }));
  };

  // 3) Save personal info (not products)
  const handleSave = () => {
    setSaving(true);
    const token = localStorage.getItem('token');
    const payload = {
      name:    profile.name,
      surname: profile.surname,
      taxid:   profile.taxid,
      address: profile.address,
      city:    profile.city,
      ZipCode: profile.zipCode   // note backend still expects "ZipCode"
    };

    axios.put('http://localhost:8080/api/users/me', payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => {
      // merge returned User into profile, preserving products
      setProfile(p => ({
        ...p,
        name:    res.data.name,
        surname: res.data.surname,
        taxid:   res.data.taxid,
        address: res.data.address,
        city:    res.data.city,
        zipCode: res.data.zipCode
      }));
      setSnack({ open: true, message: 'Saved!', severity: 'success' });
    })
    .catch(() => setSnack({ open: true, message: 'Save failed', severity: 'error' }))
    .finally(() => setSaving(false));
  };

  // 4) Loading & error states
  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 8 }}>
        <CircularProgress />
      </Container>
    );
  }
  if (!profile) {
    return (
      <Container>
        <Alert severity="error">Unable to load profile</Alert>
      </Container>
    );
  }

  // 5) Render form + product lists
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>My Profile</Typography>
      <Box sx={{ '& > :not(style)': { mb: 2 } }}>
        {/** Editable fields **/}
        <TextField
          label="Name"
          value={profile.name || ''}
          fullWidth
          onChange={handleChange('name')}
        />
        <TextField
          label="Surname"
          value={profile.surname || ''}
          fullWidth
          onChange={handleChange('surname')}
        />
        <TextField
          label="Tax ID"
          value={profile.taxid || ''}
          fullWidth
          onChange={handleChange('taxid')}
        />
        <TextField
          label="Address"
          value={profile.address || ''}
          fullWidth
          onChange={handleChange('address')}
        />
        <TextField
          label="City"
          value={profile.city || ''}
          fullWidth
          onChange={handleChange('city')}
        />
        <TextField
          label="Zip Code"
          value={profile.zipCode || ''}
          fullWidth
          onChange={handleChange('zipCode')}
        />

        <Button
          variant="contained"
          fullWidth
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
      </Box>

      <Divider sx={{ my: 4 }} />

     

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
      >
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Container>
  );
}
