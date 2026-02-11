import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  Stack,
  Divider,
  useTheme,
  alpha,
  Tooltip,
} from '@mui/material';
import {
  Person,
  Lock,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  CreditCard,
  MenuBook, // ✅ NUEVO: Icono para documentación
} from '@mui/icons-material';
import { SystemHeader } from '~/components/layout/SystemHeader';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { 
  loginUser, 
  selectAuthLoading, 
  selectAuthError, 
  clearError,
  selectIsAuthenticated,
  selectCurrentUser
} from '~/features/auth/authSlice';
import type { LoginCredentials } from '~/types';

export default function LoginPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  const isLoading = useAppSelector(selectAuthLoading);
  const authError = useAppSelector(selectAuthError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);

  const [formData, setFormData] = useState<LoginCredentials>({
    userId: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  const hasRedirected = useRef(false);

  // ✅ NUEVO: Función para abrir documentación
  const handleOpenDocs = useCallback(() => {
    // Abrir en nueva pestaña la documentación
    const docsUrl = `${window.location.origin}${import.meta.env.BASE_URL || '/'}docs/site/index.html`;
    window.open(docsUrl, '_blank', 'noopener,noreferrer');
  }, []);

  // ✅ CORRECCIÓN: Redireccionar si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && user && !hasRedirected.current) {
      console.log('🔄 User already authenticated, redirecting...', { role: user.role });
      
      hasRedirected.current = true;
      
      // Obtener la ruta de destino desde location.state o usar la ruta por defecto
      const from = location.state?.from?.pathname;
      
      // Redirigir según el rol
      const targetPath = from && from !== '/login' 
        ? from 
        : user.role === 'admin' 
          ? '/menu/admin' 
          : '/menu/main';
      
      console.log('🎯 Redirecting to:', targetPath);
      navigate(targetPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location.state]);

  // Resetear el flag cuando el usuario se desautentica
  useEffect(() => {
    if (!isAuthenticated) {
      hasRedirected.current = false;
    }
  }, [isAuthenticated]);

  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};
    
    if (!formData.userId.trim()) {
      errors.userId = 'Por favor ingrese su ID de usuario.';
    } else if (formData.userId.length > 8) {
      errors.userId = 'El ID de usuario debe tener 8 caracteres o menos.';
    }

    if (!formData.password.trim()) {
      errors.password = 'Por favor ingrese su contraseña.';
    } else if (formData.password.length > 8) {
      errors.password = 'La contraseña debe tener 8 caracteres o menos.';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback((field: keyof LoginCredentials) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    
    if (value.length <= 8) {
      setFormData(prev => ({ ...prev, [field]: value.toUpperCase() }));
      
      if (fieldErrors[field]) {
        setFieldErrors(prev => ({ ...prev, [field]: '' }));
      }
      
      if (authError) {
        dispatch(clearError());
      }
    }
  }, [fieldErrors, authError, dispatch]);

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      console.log('🔐 Attempting login with:', { userId: formData.userId });
      const result = await dispatch(loginUser(formData)).unwrap();
      console.log('✅ Login successful, result:', result);
      
    } catch (error) {
      console.error('❌ Login failed:', error);
    }
  }, [formData, validateForm, dispatch]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'F3' || event.key === 'Escape') {
      event.preventDefault();
      if (window.confirm('¿Está seguro de que desea salir del sistema?')) {
        window.close();
      }
    }
  }, []);

  const handleAlertClose = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const getErrorMessage = (error: string) => {
    const errorMappings: Record<string, string> = {
      'Invalid credentials': 'Credenciales incorrectas. Por favor intente nuevamente.',
      'User not found': 'Usuario no encontrado. Por favor verifique su ID.',
      'Please check your input': 'Por favor verifique su ID de usuario y contraseña.',
      'Network error occurred': 'No se pueden verificar las credenciales. Verifique su conexión.',
    };
   
    return errorMappings[error] || error;
  };

  // ✅ CORRECCIÓN: No mostrar el formulario si ya está autenticado
  if (isAuthenticated && user) {
    return (
      <Container 
        maxWidth="md" 
        sx={{ 
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Redirigiendo...
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Ya ha iniciado sesión. Redirigiendo a su panel de control.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Box
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      sx={{
        minHeight: '100vh',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Documentation button - Positioned absolutely */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 10,
        }}
      >
        <Tooltip title="Ver documentación" arrow>
          <IconButton
            onClick={handleOpenDocs}
            size="small"
            sx={{
              color: 'text.secondary',
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(4px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                borderColor: 'primary.main',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <MenuBook fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Main Content - Two-column layout on desktop, single column on mobile */}
      <Container 
        maxWidth="lg"
        sx={{ 
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: { xs: 2, sm: 2, md: 3 },
          height: '100%',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 2, md: 3 },
            width: '100%',
            maxWidth: { xs: '100%', sm: 600, md: 1100 },
            height: { xs: 'auto', md: '85vh' },
            maxHeight: { xs: 'none', md: '750px' },
          }}
        >
          {/* Left Panel - Decorative Bill (Desktop side-by-side, Mobile stacked) */}
          <Paper
            elevation={3}
            sx={{
              flex: { xs: '0 0 auto', md: '1 1 50%' },
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 3,
              overflow: 'hidden',
              background: `linear-gradient(145deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              color: 'white',
              minHeight: { xs: '280px', md: 'auto' },
            }}
          >
            <Box
              sx={{
                p: { xs: 2, sm: 2.5, md: 3 },
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              <CreditCard sx={{ fontSize: { xs: 36, sm: 48, md: 60 }, mb: { xs: 1.5, md: 2 }, mx: 'auto' }} />
              <Typography variant="h4" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' }, mb: { xs: 1, md: 2 } }}>
                NATIONAL RESERVE NOTE
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.95, fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' }, mb: { xs: 1.5, md: 2 } }}>
                THE UNITED STATES OF KICSLAND
              </Typography>
              
              {/* ASCII art - Always visible but scaled */}
              <Box
                sx={{
                  mt: { xs: 1, md: 1.5 },
                  p: { xs: 1, sm: 1.5, md: 2 },
                  border: '2px solid rgba(255,255,255,0.4)',
                  borderRadius: 2,
                  fontFamily: 'monospace',
                  fontSize: { xs: '0.45rem', sm: '0.55rem', md: '0.7rem' },
                  lineHeight: 1.2,
                  whiteSpace: 'pre',
                  textAlign: 'center',
                  backgroundColor: 'rgba(0,0,0,0.15)',
                  backdropFilter: 'blur(4px)',
                }}
              >
                {`+========================================+
|%%%%%%%  NATIONAL RESERVE NOTE  %%%%%%%%|
|%(1)  THE UNITED STATES OF KICSLAND (1)%|
|%$$              ___       ********  $$%|
|%$    {x}       (o o)                 $%|
|%$     ******  (  V  )      O N E     $%|
|%(1)          ---m-m---             (1)%|
|%%~~~~~~~~~~~ ONE DOLLAR ~~~~~~~~~~~~~%%|
+========================================+`}
              </Box>
            </Box>
          </Paper>

          {/* Right Panel - Login Form */}
          <Paper
            elevation={3}
            sx={{
              flex: { xs: '0 0 auto', md: '1 1 50%' },
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 3,
              overflow: 'hidden',
              background: alpha(theme.palette.background.paper, 0.95),
            }}
          >
            <Box sx={{ p: { xs: 2, sm: 2, md: 2.5 }, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography
                variant="h5"
                color="primary.main"
                textAlign="center"
                gutterBottom
                sx={{ 
                  mb: { xs: 1.5, md: 2 },
                  fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' },
                  fontWeight: 600,
                }}
              >
                Iniciar Sesión
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
                sx={{ mb: { xs: 1.5, md: 2 } }}
              >
                Ingrese su ID de usuario y contraseña, luego presione ENTER
              </Typography>

              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ width: '100%' }}
              >
                <Stack spacing={1.5}>
                  <TextField
                    label="ID de Usuario"
                    value={formData.userId}
                    onChange={handleInputChange('userId')}
                    error={!!fieldErrors.userId}
                    helperText={fieldErrors.userId || '(Máximo 8 caracteres)'}
                    disabled={isLoading}
                    autoFocus
                    fullWidth
                    inputProps={{
                      maxLength: 8,
                      style: { textTransform: 'uppercase' },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />

                  <TextField
                    label="Contraseña"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    error={!!fieldErrors.password}
                    helperText={fieldErrors.password || '(Máximo 8 caracteres)'}
                    disabled={isLoading}
                    autoComplete="current-password"
                    fullWidth
                    inputProps={{
                      maxLength: 8,
                      style: { textTransform: 'uppercase' },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            disabled={isLoading}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />

                  {(authError || Object.keys(fieldErrors).length > 0) && (
                    <>
                      {authError ? (
                        <Alert
                          severity="error"
                          onClose={handleAlertClose}
                          sx={{ borderRadius: 2 }}
                        >
                          {getErrorMessage(authError)}
                        </Alert>
                      ) : (
                        <Alert
                          severity="error"
                          sx={{ borderRadius: 2 }}
                        >
                          Por favor corrija los errores anteriores.
                        </Alert>
                      )}
                    </>
                  )}

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isLoading}
                    startIcon={<LoginIcon />}
                    fullWidth
                    sx={{
                      py: { xs: 1, md: 1.25 },
                      borderRadius: 2,
                      fontWeight: 600,
                      fontSize: { xs: '0.95rem', md: '1.05rem' },
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      color: theme.palette.primary.contrastText,
                      border: 'none',
                      '&:hover': {
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.9)}, ${alpha(theme.palette.secondary.main, 0.9)})`,
                        boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                      },
                      '&:active': {
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.8)}, ${alpha(theme.palette.secondary.main, 0.8)})`,
                      },
                      '&:disabled': {
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.5)}, ${alpha(theme.palette.secondary.main, 0.5)})`,
                        color: alpha(theme.palette.primary.contrastText, 0.7),
                      },
                    }}
                  >
                    {isLoading ? 'Iniciando sesión...' : 'ENTER = Iniciar sesión'}
                  </Button>
                </Stack>
              </Box>

              <Divider sx={{ my: { xs: 1.5, md: 2 } }} />

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 0.75 }}>
                  Credenciales de ejemplo:
                </Typography>
                <Stack spacing={0.75}>
                  <Box sx={{ 
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    border: `1px solid ${theme.palette.warning.main}`,
                    color: 'warning.dark',
                    px: 1.5,
                    py: 0.6,
                    borderRadius: 2,
                  }}>
                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: '0.7rem', md: '0.8rem' } }}>
                      Admin: ADMIN001 / PASSWORD
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    border: `1px solid ${theme.palette.success.main}`,
                    color: 'success.dark',
                    px: 1.5,
                    py: 0.6,
                    borderRadius: 2,
                  }}>
                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: '0.7rem', md: '0.8rem' } }}>
                      Back-Office: USER001 / PASSWORD
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>

            <Box
              sx={{
                p: 1,
                bgcolor: alpha(theme.palette.grey[100], 0.7),
                borderTop: `1px solid ${theme.palette.divider}`,
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ fontSize: { xs: '0.7rem', md: '0.8rem' } }}>
                ENTER = Iniciar sesión • F3 = Salir
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}
