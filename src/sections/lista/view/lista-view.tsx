import { useState } from 'react';
import { Box, Typography, Paper, Avatar, TextField, Button, IconButton } from '@mui/material';

// Dados fictícios para mensagens 
const fakeConversations = [
  { id: 1, name: 'Khalid Hasan Zibon', lastMessage: 'Sup man! How is it going?', time: '8:30pm', avatar: 'https://via.placeholder.com/50' },
  { id: 2, name: 'PewDiePie', lastMessage: 'Subscribe to my channel', time: '6:30pm', avatar: 'https://via.placeholder.com/50' },
  { id: 3, name: 'Marzia Mithila', lastMessage: 'I love you too', time: '3:00pm', avatar: 'https://via.placeholder.com/50' },
  { id: 4, name: 'Rasel Ahmed', lastMessage: 'Link: http://...', time: '11:00am', avatar: 'https://via.placeholder.com/50' },
  { id: 5, name: 'Maidul Islam Saad', lastMessage: 'Vai kothodin tore dekhlam', time: '10:25pm', avatar: 'https://via.placeholder.com/50' },
];

const fakeMessages = [
  { id: 1, sender: 'me', text: 'Hi, What’s going on?' },
  { id: 2, sender: 'other', text: 'Hey, What about you?' },
  { id: 3, sender: 'me', text: 'Lorem ipsum dolor sit amet.' },
  { id: 4, sender: 'other', text: 'Consectetur adipiscing elit.' },
];

export function ListaView() {
  
  const [activeConversation, setActiveConversation] = useState(fakeConversations[0]);
  const [messages, setMessages] = useState(fakeMessages);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { id: Date.now(), sender: 'me', text: newMessage }]);
      setNewMessage('');
    }
  };

  return (
    <Box display="flex" height="90vh" bgcolor="#f4f6f8">
      {/* Lista de Conversas */}
      <Box
        width="28%"
        bgcolor="#3f51b5"
        color="white"
        p={2}
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
      >
        {/* Cabeçalho da lista */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} mt={2} ml={2}>
          <Typography variant="h5">Mensagens</Typography>
       
        </Box>
        {/* Conversas */}
        <Box flexGrow={1} overflow="auto">
          {fakeConversations.map((conversation) => (
            <Paper
              key={conversation.id}
              sx={{
                mb: 1,
                p: 2,
                display: 'flex',
                alignItems: 'center',
                bgcolor: conversation.id === activeConversation.id ? '#7986cb' : 'transparent',
                cursor: 'pointer',
              }}
              onClick={() => setActiveConversation(conversation)}
            >
              <Avatar src={conversation.avatar} sx={{ width: 48, height: 48, mr: 2 }} />
              <Box>
                <Typography variant="body1">{conversation.name}</Typography>
                <Typography variant="body2" color="gray">
                  {conversation.lastMessage}
                </Typography>
              </Box>
              <Typography variant="caption" ml="auto">
                {conversation.time}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Box>

      {/* Área de Chat */}
      <Box flexGrow={1} display="flex" flexDirection="column" bgcolor="white">
        {/* Cabeçalho do chat */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          p={2}
          borderBottom="1px solid #e0e0e0"
        >
          <Box display="flex" alignItems="center">
            <Avatar src={activeConversation.avatar} sx={{ width: 38, height: 38, mr: 2 }} />
            <Typography variant="h6">{activeConversation.name}</Typography>
          </Box>
          
        </Box>

        {/* Mensagens */}
        <Box flexGrow={1} p={1} overflow="auto">
          {messages.map((message) => (
            <Box
              key={message.id}
              display="flex"
              justifyContent={message.sender === 'me' ? 'flex-end' : 'flex-start'}
              mb={1}
            >
              <Box
                sx={{
                  p: 2,
                  bgcolor: message.sender === 'me' ? '#3f51b5' : '#f0f0f0',
                  color: message.sender === 'me' ? 'white' : 'black',
                  borderRadius: '10px',
                  maxWidth: '70%',
                }}
              >
                {message.text}
              </Box>
            </Box>
          ))}
        </Box>

        {/* Campo de Mensagem */}
        <Box display="flex" p={2} borderTop="1px solid #e0e0e0">
          <TextField
            fullWidth
            placeholder="Escreva uma mensagem.."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            sx={{ mr: 2 }}
          />
          <Button variant="contained" onClick={handleSendMessage}>
            Enviar
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
