import React, { useState, useCallback, useEffect } from 'react';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import jwtDecode from 'jwt-decode';
import { z as zod } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useRouter } from 'src/routes/hooks';
import { Iconify } from 'src/components/iconify';
import type { JwtPayload } from 'jwt-decode';
import Config from '../Config';
import Modal from '@mui/material/Modal';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

// ----------------------------------------------------------------------

interface CustomJwtPayload extends JwtPayload {
    is_funcionario_emppresa?: boolean;
}
interface UserData {
    nome: string;
    email: string;
    numero_telefone: string;
    endereco: string;
    status: string;
}

const schema = zod.object({
    username: zod.string().min(1, { message: 'Username is required' }),
    password: zod.string().min(1, { message: 'Password is required' }),
});

type Values = zod.infer<typeof schema>;

const defaultValues = { username: '', password: '' };

export function SignInView() {
    const router = useRouter();
    const baseUrl = Config.getApiUrl();
    const [isPending, setIsPending] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [userData, setUserData] = React.useState < UserData | null > (null);
    const [open, setOpen] = useState(false); // Estado para controlar a abertura do modal

    const {
        control,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm < Values > ({
        defaultValues,
        resolver: zodResolver(schema),
    });

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            try {
                const decodedToken = jwtDecode < CustomJwtPayload > (accessToken);
                if (decodedToken?.is_funcionario_emppresa) {
                    router.push('/'); // Redireciona para a página inicial caso o token seja válido
                }
            } catch (error) {
                console.error('Erro ao decodificar o token', error);
            }
        }
    }, [router]);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const onSubmit = useCallback(
        async (values: Values): Promise<void> => {
            const fetchUserData = async (token: string) => {
                console.log("Iniciando requisição para buscar dados do usuário...");

                try {
                    const response = await axios.get(`https://fad7-154-71-159-172.ngrok-free.app/api/user/`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            "ngrok-skip-browser-warning": "true",
                        },
                    });

                    // Verifique se a resposta da API é válida e contém os dados esperados
                    if (response.status === 200 && response.data) {
                        console.log("Resposta da requisição:", response);
                        const data = response.data;
                        console.log('Dados do usuário:', data);

                        // Armazena os dados do usuário no estado
                        setUserData(data);

                        // Armazena os dados no localStorage
                        await localStorage.setItem('userData', JSON.stringify(data));
                    } else {
                        console.error('Resposta da API inesperada:', response);
                    }

                } catch (error) {
                    if (axios.isAxiosError(error)) {
                        console.error('Erro na requisição axios:', error.response?.data || error.message);
                    } else {
                        console.error('Erro desconhecido:', error);
                    }
                }
            };
            setIsPending(true);

            try {
                const response = await axios.post(
                    `${baseUrl}api/token/`,
                    {
                        username: values.username,
                        password: values.password,
                    },
                    {
                        headers: { 'Content-Type': 'application/json', "ngrok-skip-browser-warning": "true", },
                    }
                );

                if (response.status === 200) {

                    const { access, refresh } = response.data;
                    const decodedToken = jwtDecode < CustomJwtPayload > (access);

                    if (decodedToken?.is_funcionario_emppresa) {
                        console.log('ola');
                        await fetchUserData(access);
                        localStorage.setItem('accessToken', access);
                        localStorage.setItem('refreshToken', refresh);
                        localStorage.setItem('custom-auth-token', access);

                        router.push('/'); // Redireciona para a página inicial
                    } else {
                        setError('root', { type: 'server', message: 'Usuário não autorizado.' });
                    }
                } else {
                    setError('root', { type: 'server', message: response.data.detail || 'Erro no login.' });
                }
            } catch (error: any) {
                console.error('Erro de conexão:', error.message);
                setError('root', { type: 'server', message: 'Erro de conexão com o servidor.' });
            } finally {
                setIsPending(false);
            }
        },
        [baseUrl, router, setError]
    );

    return (
        <Box gap={1.5} display="flex" flexDirection="column" alignItems="center" sx={{ mb: 5 }}>
            <Typography variant="h4">Sign in</Typography>
            <Typography variant="body2" color="text.secondary">
                Welcome, again!!
                <Link variant="subtitle2" sx={{ ml: 0.5 }}>
                    Get started
                </Link>
            </Typography>

            <Box component="form" onSubmit={handleSubmit(onSubmit)} display="flex" flexDirection="column">
                <Controller
                    name="username"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            fullWidth
                            label="Username"
                            error={!!errors.username}
                            helperText={errors.username?.message}
                            sx={{ mb: 2 }}
                        />
                    )}
                />

                <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            fullWidth
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            error={!!errors.password}
                            helperText={errors.password?.message}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                            <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ mb: 3 }}
                        />
                    )}
                />

                <LoadingButton
                    fullWidth
                    size="large"
                    type="submit"
                    color="inherit"
                    variant="contained"
                    loading={isPending}
                >
                    Sign in
                </LoadingButton>
            </Box>

            <Typography variant="body2" color="text.secondary">
                Não tem uma conta?
                <Link variant="subtitle2" sx={{ ml: 0.5, cursor: 'pointer' }} onClick={handleOpen}>
                    Cadastrar
                </Link>
            </Typography>

            <Divider sx={{ my: 1, '&::before, &::after': { borderTopStyle: 'dashed' } }}>
                <Typography
                    variant="overline"
                    sx={{ color: 'text.secondary', fontWeight: 'fontWeightMedium' }}
                >
                    OR
                </Typography>
            </Divider>

            <Box gap={1} display="flex" justifyContent="center">
                <IconButton color="inherit">
                    <Iconify icon="logos:google-icon" />
                </IconButton>
                <IconButton color="inherit">
                    <Iconify icon="eva:github-fill" />
                </IconButton>
                <IconButton color="inherit">
                    <Iconify icon="ri:twitter-x-fill" />
                </IconButton>
            </Box>

            {/* Modal de Cadastro de Empresa */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Cadastrar Empresa</DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="nome"
                            label="Nome da Empresa"
                            name="nome"
                            autoComplete="nome"
                            autoFocus
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email"
                            name="email"
                            autoComplete="email"
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="telefone"
                            label="Telefone"
                            name="telefone"
                            autoComplete="telefone"
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="endereco"
                            label="Endereço"
                            name="endereco"
                            autoComplete="endereco"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button onClick={handleClose} variant="contained" color="primary">
                        Cadastrar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}