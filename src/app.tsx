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

  const empresa = JSON.parse(localStorage.getItem('userData') || '{}');
  const registerDevice = useCallback(async (token: string) => {
    try {
      const tokenFirebase = token;
      const plataforma = window.navigator.userAgent;

      if (!empresa?.id || !tokenFirebase || !plataforma) {
        return;
      }
      const storedToken = localStorage.getItem('registeredDeviceToken');
      if (storedToken === token) {
        console.log('Dispositivo já registrado.');
        return;
      }

      const response = await fetch(`https://c750-105-172-47-207.ngrok-free.app/api/dispositivo-create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          empresa: empresa?.id,
          token: tokenFirebase,
          plataforma,
        }),
      });

      if (response.ok) {
        console.log('Dispositivo registrado com sucesso!');
        localStorage.setItem('registeredDeviceToken', token);
      } else {
        const data = await response.json();
        console.log('Erro:', data.erro || 'Erro ao registrar dispositivo');
      }
    } catch (error) {
      console.error('Erro ao registrar dispositivo:', error);
    }
  }, [empresa?.id]);

  const requestPermission = useCallback(async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const token = await getToken(messaging, {
          vapidKey: "BK3Lsdw0NBWEzjAQcPI1TxopGrg-NVlwUOtxVOGrSeGXj8hihnQlOXQ8tZEvyQ3AwCE-Y9oJCi9GvJMP_zIpeyk",
        });
        console.log("Token FCM:", token);
        localStorage.setItem('accessTokenFirebase', token);
        registerDevice(token);
      } else {
        console.log("Permissão negada");
      }
    } catch (error) {
      console.error("Erro ao obter permissão:", error);
    }
  }, [registerDevice]);

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
  }, [requestPermission]);

  return (
    <ThemeProvider>
      <Router />
    </ThemeProvider>
  );
}
