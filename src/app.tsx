import 'src/global.css';

import Fab from '@mui/material/Fab';

import { Router } from 'src/routes/sections';

import { useScrollToTop } from 'src/hooks/use-scroll-to-top';

import { ThemeProvider } from 'src/theme/theme-provider';

import { Iconify } from 'src/components/iconify';

import { useEffect, useCallback } from "react";
import { messaging, getToken, onMessage } from "../firebaseConfig";

// ----------------------------------------------------------------------

export default function App() {
  useScrollToTop();
  
  const empresa = JSON.parse(localStorage.getItem('userData') || '{}'); // Parse para garantir que seja um objeto
  
  // Usar useCallback para memorizar a função registerDevice
  const registerDevice = useCallback(async (token: string) => {
    try {
      const tokenFirebase = token;
      const plataforma = window.navigator.userAgent;

      if (!empresa?.id || !tokenFirebase || !plataforma) {
        alert('Dados incompletos para registrar dispositivo.');
        return;
      }

      const response = await fetch(`http://127.0.0.1:8000/api/dispositivo-create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          empresa: empresa?.id,
          token: tokenFirebase,
          plataforma,
        }),
      });

      if (response.ok) {
        console.log('Dispositivo registrado com sucesso!');
      } else {
        const data = await response.json();
        console.log('Erro:', data.erro || 'Erro ao registrar dispositivo');
      }
    } catch (error) {
      console.error('Erro ao registrar dispositivo:', error);
    }
  }, [empresa?.id]); // Garantir que depende de empresa?.id

  // Usar useCallback para memorizar a função requestPermission
  const requestPermission = useCallback(async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const token = await getToken(messaging, {
          vapidKey: "BK3Lsdw0NBWEzjAQcPI1TxopGrg-NVlwUOtxVOGrSeGXj8hihnQlOXQ8tZEvyQ3AwCE-Y9oJCi9GvJMP_zIpeyk", // Configure no Firebase Console
        });
        console.log("Token FCM:", token);
        localStorage.setItem('accessTokenFirebase', token);
        // Enviar o token para a API para associar ao usuário
        registerDevice(token);
      } else {
        console.log("Permissão negada");
      }
    } catch (error) {
      console.error("Erro ao obter permissão:", error);
    }
  }, [registerDevice]); // Adicionar registerDevice como dependência de useCallback
  
  useEffect(() => {
    requestPermission();
    onMessage(messaging, (payload) => {
      console.log("Mensagem recebida:", payload);
      if (payload.notification) {
        alert(`Nova notificação: ${payload.notification.title}`);
      } else {
        console.warn("Notificação sem conteúdo.");
      }
    });
  }, [requestPermission]); // Agora, requestPermission é uma dependência estável

  const githubButton = (
    <Fab
      size="medium"
      aria-label="Github"
      href="https://github.com/minimal-ui-kit/material-kit-react"
      sx={{
        zIndex: 9,
        right: 20,
        bottom: 20,
        width: 44,
        height: 44,
        position: 'fixed',
        bgcolor: 'grey.800',
        color: 'common.white',
      }}
    >
      <Iconify width={24} icon="eva:github-fill" />
    </Fab>
  );

  return (
    <ThemeProvider>
      <Router />
      {/* {githubButton} */}
    </ThemeProvider>
  );
}
