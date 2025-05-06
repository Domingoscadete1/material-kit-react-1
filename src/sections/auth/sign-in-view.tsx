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
import Modal from '@mui/material/Modal';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { MenuItem } from '@mui/material';

import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import Config from '../../../Config';
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
interface FormDataType {
    nome: string;
    email: string;
    senha: string;
    telefone1: string;
    telefone2: string;
    endereco: string;
    categoria: string;
    descricao: string;
    imagens: File[];
    nif: string;
    alvara_comercial: File | null;
    certidao_registro_comercial: File | null;
}


const schema = zod.object({
    username: zod.string().min(1, { message: 'Username is required' }),
    password: zod.string().min(1, { message: 'Password is required' }),
});

type Values = zod.infer<typeof schema>;

const defaultValues = { username: '', password: '' };

const categorias = [
    { value: 'moda', label: 'Moda' },
    { value: 'tecnologia', label: 'Tecnologia' },
    { value: 'cosmeticos', label: 'Cosméticos' },
];

export function SignInView() {
    const router = useRouter();
    const baseUrl = Config.getApiUrl();
    const [isPending, setIsPending] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [userData, setUserData] = React.useState<UserData | null>(null);
    const [open, setOpen] = useState(false)
    const [location, setLocation] = useState<{ lat: number; lng: number }>({ lat: 0, lng: 0 });
    const [openMapModal, setOpenMapModal] = useState(false);
    const [form, setForm] = useState<FormDataType>({
        nome: '',
        email: '',
        senha: '',
        telefone1: '',
        telefone2: '',
        endereco: '',
        categoria: '',
        descricao: '',
        imagens: [],
        nif: '',
        alvara_comercial: null,
        certidao_registro_comercial: null,
    });
    const [openReset, setOpenReset] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [resetMessage, setResetMessage] = useState('');
    const [resetError, setResetError] = useState('');

    const [loading, setLoading] = useState(false);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const { name } = e.target;
        const file = e.target.files[0];

        setForm((prev) => ({ ...prev, [name]: file }));
    };

    const [newProduct, setNewProduct] = useState({
        nome: '',
        descricao: '',
        categoria: '',
        condicao: 'Novo',
        preco: '',
        localizacao: '',
        quantidade: 1,
        images: [] as File[], // Para permitir múltiplas imagens
        videos: [] as File[],

    });

    function LocationMarker() {
        const map = useMapEvents({
            click(e) {
                setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
            },
        });

        return location ? (
            <Marker position={[location.lat, location.lng]} icon={L.icon({
                iconUrl: 'https://leafletjs.com/examples/custom-icons/leaf-red.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
            })} />
        ) : null;
    }

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation({ lat: latitude, lng: longitude });
                },
                (error) => {
                    console.error('Erro ao obter localização:', error);
                }
            );
        }
    }, []);

    const handlecadastro = async () => {
        const formData = new FormData();
        Object.keys(form).forEach((key) => {
            const fieldKey = key as keyof FormDataType;

            if (fieldKey === 'imagens' && Array.isArray(form[fieldKey])) {
                form[fieldKey].forEach((file, index) => formData.append(`imagem${index + 1}`, file));
            } else if (fieldKey === 'alvara_comercial' || fieldKey === 'certidao_registro_comercial') {
                if (form[fieldKey]) {
                    formData.append(fieldKey, form[fieldKey] as File);
                }
            } else {
                formData.append(fieldKey, String(form[fieldKey]));
            }
        });


        try {
            setLoading(true);
            const response = await axios.post(`${Config.getApiUrl()}api/empresa/create/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data', "ngrok-skip-browser-warning": "true" },
            });

            alert('Empresa cadastrada com sucesso!');
            handleClose();
        } catch (error) {
            console.error('Erro ao cadastrar empresa:', error.response?.data || error.message);
            alert(error.response?.data?.detail || 'Erro ao cadastrar empresa.');
        } finally {
            setLoading(false);
        }
    };


    const {
        control,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<Values>({
        defaultValues,
        resolver: zodResolver(schema),
    });

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            try {
                const decodedToken = jwtDecode<CustomJwtPayload>(accessToken);
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
    const handleOpenReset = () => {
        setOpenReset(true);
    };

    const handleCloseReset = () => {
        setOpenReset(false);
        setResetEmail('');
        setResetMessage('');
        setResetError('');
    };

    const handleResetPassword = async () => {
        if (!resetEmail) {
            setResetError('Por favor, insira seu e-mail');
            return;
        }

        try {
            setResetLoading(true);
            setResetError('');
            setResetMessage('');

            const response = await axios.post(
                `${baseUrl}api/password-reset/`,
                { email: resetEmail },
                { headers: { 'Content-Type': 'application/json', "ngrok-skip-browser-warning": "true" } }
            );

            if (response.status === 200) {
                setResetMessage('E-mail de redefinição enviado. Verifique sua caixa de entrada.');
            }
        } catch (error) {
            console.error("Erro ao solicitar redefinição:", error);
            setResetError(error.response?.data?.error || 'Erro ao solicitar redefinição de senha');
        } finally {
            setResetLoading(false);
        }
    };

    const handleGetCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation({ lat: latitude, lng: longitude });
                    setNewProduct((prev) => ({ ...prev, localizacao: `${latitude}, ${longitude}` }));
                },
                (error) => {
                    console.error('Erro ao obter localização:', error);
                }
            );
        } else {
            alert('Geolocalização não é suportada pelo seu navegador.');
        }
    };

    const handleOpenMapModal = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
                    setOpenMapModal(true);
                },
                (error) => {
                    console.error('Erro ao obter localização:', error);
                    setOpenMapModal(true);
                }
            );
        } else {
            setOpenMapModal(true);
        }
    };

    const onSubmit = useCallback(
        async (values: Values): Promise<void> => {
            const fetchUserData = async (token: string) => {
                console.log("Iniciando requisição para buscar dados do usuário...");

                try {
                    const response = await axios.get(`${Config.getApiUrl()}api/user/`, {
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
                        router.push('/'); // Redireciona para a página inicial
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
                    const decodedToken = jwtDecode<CustomJwtPayload>(access);

                    if (decodedToken?.is_funcionario_emppresa) {
                        console.log('ola');
                        await fetchUserData(access);
                        localStorage.setItem('accessToken', access);
                        localStorage.setItem('refreshToken', refresh);
                        localStorage.setItem('custom-auth-token', access);


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
        [baseUrl, setError, router]
    );

    return (
        <Box gap={1.5} display="flex" flexDirection="column" alignItems="center" sx={{ mb: 5 }}>
            <Typography variant="h4">Sign in</Typography>
            <Typography variant="body2" color="text.secondary">
                Welcome, again!!
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
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Esqueceu sua senha?
                <Link variant="subtitle2" sx={{ ml: 0.5, cursor: 'pointer' }} onClick={handleOpenReset}>
                    Redefinir senha
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
                    <TextField fullWidth margin="normal" label="Nome da Empresa" name="nome" onChange={handleChange} required />
                    <TextField fullWidth margin="normal" label="Email" name="email" onChange={handleChange} required />
                    <TextField fullWidth margin="normal" label="Numero de identificação fiscal" name="nif" onChange={handleChange} required />

                    <TextField fullWidth margin="normal" label="Senha" type="password" name="senha" onChange={handleChange} required />
                    <TextField fullWidth margin="normal" label="Telefone 1" name="telefone1" onChange={handleChange} required />
                    <TextField fullWidth margin="normal" label="Telefone 2" name="telefone2" onChange={handleChange} />
                    <Button variant="outlined" onClick={handleGetCurrentLocation} sx={{ mt: 1, mr: 1 }}>
                        Usar Minha Localização
                    </Button>

                    <Button variant="outlined" onClick={handleOpenMapModal} sx={{ mt: 1 }}>
                        Escolher no Mapa
                    </Button>

                    <TextField
                        fullWidth
                        label="Localização"
                        name="localizacao"
                        value={newProduct.localizacao}
                        onChange={handleChange}
                        margin="normal"
                    />
                    <TextField
                        select
                        fullWidth
                        margin="normal"
                        label="Categoria"
                        name="categoria"
                        onChange={handleChange}
                        required
                    >
                        {categorias.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField fullWidth margin="normal" label="Descrição" name="descricao" onChange={handleChange} multiline rows={3} required />
                    <Typography variant="body2" color="text.secondary">
                        Imagens da empresa
                    </Typography>

                    <input type="file" multiple accept="image/*" onChange={handleFileChange} />
                    <Typography variant="body2" color="text.secondary">
                        Alvará Comercial
                    </Typography>

                    <input type="file" name="alvara_comercial" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
                    <Typography variant="body2" color="text.secondary">
                        Certidão de Registro Comercial
                    </Typography>

                    <input type="file" name="certidao_registro_comercial" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button onClick={() => handlecadastro()} variant="contained" color="primary" disabled={loading}>
                        {loading ? 'Cadastrando...' : 'Cadastrar'}
                    </Button>

                </DialogActions>
            </Dialog>

            <Modal open={openMapModal} onClose={() => setOpenMapModal(false)}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: {
                          xs: '90vw', // Para telas muito pequenas (mobile)
                          sm: '80vw', // Para telas pequenas (tablet)
                          md: '70vw', // Para telas médias
                          lg: '60vw', // Para telas grandes
                          xl: '50vw'  // Para telas extra grandes
                        },
                        height: {
                          xs: '80vh', // Para telas muito pequenas
                          sm: '70vh', // Para telas pequenas
                          md: '60vh', // Para telas médias
                          lg: '50vh', // Para telas grandes
                          xl: '40vh'  // Para telas extra grandes
                        },
                        maxWidth: 800, // Largura máxima
                        maxHeight: 600, // Altura máxima
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 2,
                        borderRadius: 1,
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <Typography variant="h6">Escolha a Localização</Typography>
                    <MapContainer center={location} zoom={13} style={{ height: '100%', width: '100%', position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0 }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <LocationMarker />
                    </MapContainer>
                    <Button variant="contained" onClick={() => {
                        setNewProduct((prev) => ({
                            ...prev,
                            localizacao: `${location.lat}, ${location.lng}`,
                        }));
                        setOpenMapModal(false);
                    }} sx={{ mt: 2 }}>
                        Confirmar Localização
                    </Button>
                </Box>
            </Modal>

            {/* Modal de Redefinição de Senha */}
            <Dialog open={openReset} onClose={handleCloseReset}>
                <DialogTitle>Redefinir Senha</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        Insira seu e-mail cadastrado para receber o link de redefinição de senha
                    </Typography>

                    {resetError && (
                        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                            {resetError}
                        </Typography>
                    )}

                    {resetMessage && (
                        <Typography color="success.main" variant="body2" sx={{ mb: 2 }}>
                            {resetMessage}
                        </Typography>
                    )}

                    <TextField
                        fullWidth
                        margin="normal"
                        label="E-mail"
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        disabled={resetLoading}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseReset} disabled={resetLoading}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleResetPassword}
                        variant="contained"
                        color="primary"
                        disabled={resetLoading}
                    >
                        {resetLoading ? 'Enviando...' : 'Enviar Link'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}